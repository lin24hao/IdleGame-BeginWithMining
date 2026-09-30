/* ============================================================
 * fa_core.js —— 「灵植（farm）」模块运行时内核（零依赖、零构建）
 *
 * 作用：为照抄 gooboo farm 的 fa_data.js / fa_store.js 提供运行环境。
 *   - 复用 lm_core.js / vi_core.js 已声明的全局工具（getSequence/getDiminishing/
 *     buildArray/capitalize/buildNum/formatNum）
 *   - 自建 FA_ 前缀的 MULT/CUR/STAT/UNLOCK/UPG/SYSTEM/store，避免与灵脉(m)/宗门(VI)污染
 *   - 额外实现 farm 专属：field（7x7 田格）、cropCaches、care（雨水/关怀）、
 *     gene（基因）、consumable（化肥）子系统
 *
 * 注意：gooboo 中 farm data/store 文件函数内直接引用全局 `store`（Vuex）。
 *   这里用 FSTORE 作为等价替身，并把数据函数中的 `store` 替换为 `FSTORE`。
 * ============================================================ */

/* ===== 0. farm 专用工具（gooboo src/js/utils/random.js 全局同名，后加载者生效） ===== */
function chance(prob, rng) { return (rng === undefined ? Math.random() : rng) < prob; }
function randomInt(min, max, rng) { rng = (rng === undefined ? Math.random() : rng); return Math.floor(rng * (1 + max - min) + min); }
function randomFloat(min, max, rng) { rng = (rng === undefined ? Math.random() : rng); return rng * (max - min) + min; }
// 带 rng 种子的取整（2 参数版，后于 vi_core 加载，覆盖单参版但不破坏村庄单参调用）
function randomRound(num, rng) { const fl = Math.floor(num); return (chance(num - fl, rng) ? fl + 1 : fl); }
// weightSelect 已被 vi_core 声明，此处可复用其实现（同 gooboo 语义）。

/* ===== 0.5 farm 常量（照抄 gooboo constants.js） ===== */
const FARM_BUILDING_PREMIUM_BONUS = 0.5;
const FARM_SPRINKLER_GROW = 0.4;
const FARM_SPRINKLER_OVERGROW = 2;
const FARM_SPRINKLER_CARE_WEIGHT = 1;
const FARM_PINWHEEL_RARE_DROP = 0.025;

/* ===== 1. FA_MULT：倍率系统（同 VI_MULT，feature 默认 farm） ===== */
const FA_MULT = {
  items: {},
  missing: [],
  init(name, o) {
    o = o || {};
    const item = {
      feature: o.feature || 'farm',
      baseValue: o.baseValue || 0,
      baseCache: o.baseValue || 0,
      group: o.group || [],
      roundNearZero: o.roundNearZero || false,
      multCache: 1,
      bonusCache: 0,
      baseValues: {}, multValues: {}, bonusValues: {},
      min: (o.min === undefined ? null : o.min),
      max: (o.max === undefined ? null : o.max),
      round: o.round || false,
      display: o.display || 'number',
      isPositive: o.isPositive !== false,
      unlock: o.unlock || null,
      type: o.type || null
    };
    this.items[name] = item;
    return item;
  },
  _recompute(item) {
    let base = item.baseValue, bonus = 0, mult = 1;
    for (const k in item.baseValues) base += item.baseValues[k];
    for (const k in item.bonusValues) bonus += item.bonusValues[k];
    for (const k in item.multValues) mult *= item.multValues[k];
    item.baseCache = base; item.bonusCache = bonus; item.multCache = isFinite(mult) ? mult : 1;
  },
  _propagate(name, kind, key, value) {
    const item = this.items[name];
    if (!item) return;
    const targets = [name].concat(item.group || []);
    const seen = {};
    targets.forEach(tn => {
      if (seen[tn]) return; seen[tn] = true;
      const t = this.items[tn];
      if (!t) return;
      const bag = kind === 'base' ? t.baseValues : (kind === 'mult' ? t.multValues : t.bonusValues);
      if (value === null) delete bag[key || name]; else bag[key || name] = value;
      this._recompute(t);
    });
  },
  setBase(o) { this._propagate(o.name, 'base', o.key, o.value); },
  setMult(o) { this._propagate(o.name, 'mult', o.key, o.value); },
  setBonus(o) { this._propagate(o.name, 'bonus', o.key, o.value); },
  setMin(o) { const it = this.items[o.name]; if (it) it.min = o.value; },
  setMax(o) { const it = this.items[o.name]; if (it) it.max = o.value; },
  removeKeyAnywhere(key) {
    for (const n in this.items) {
      const t = this.items[n];
      let dirty = false;
      ['baseValues','multValues','bonusValues'].forEach(bagName => {
        if (key in t[bagName]) { delete t[bagName][key]; dirty = true; }
      });
      if (dirty) this._recompute(t);
    }
  },
  linkGroup(multName, members) {
    const item = this.items[multName];
    if (!item) return;
    const list = (members || []).filter(m => m && m !== multName);
    if (list.length > 0) item.group = list;
  },
  get(name, base, mult, bonus) {
    let item = this.items[name];
    if (!item) {
      if (this.missing.indexOf(name) < 0) this.missing.push(name);
      item = this.init(name, {});
    }
    let value = (item.baseCache + (base || 0)) * item.multCache * (mult === undefined ? 1 : mult) + item.bonusCache + (bonus || 0);
    if (item.min !== null) value = Math.max(value, item.min);
    if (item.max !== null) value = Math.min(value, item.max);
    if (item.round) value = Math.round(value);
    if (!isFinite(value)) value = 0;
    if (item.roundNearZero && Math.abs(value) < 1e-9) value = 0;
    return value;
  }
};

/* ===== 2. FA_CUR：货币 / 资源系统（gooboo farm 有 gainMult / capMult / overcap） ===== */
const FA_CUR = {
  defs: {}, values: {}, capByMult: {}, currencyMults: {},
  prefix(key) { return key.split('_')[0]; },
  gainMultName(key) { return 'currency' + key.split('_').map(capitalize).join('') + 'Gain'; },
  capMultName(key) { return 'currency' + key.split('_').map(capitalize).join('') + 'Cap'; },
  init(key, def) {
    def = def || {};
    if (!def.feature) def.feature = 'farm';
    if (!def.type) def.type = 'regular';
    def.key = key;
    this.defs[key] = def;
    if (this.values[key] === undefined) this.values[key] = def.value || 0;
    const gm = this.gainMultName(key), cm = this.capMultName(key);
    FA_MULT.init(gm, Object.assign({ feature: def.feature || 'farm' }, def.gainMult || {}));
    FA_MULT.init(cm, Object.assign({ feature: def.feature || 'farm' }, def.capMult || {}));
    if (def.capMult) this.capByMult[cm] = key;
    if (def.currencyMult) this.currencyMults[key] = def.currencyMult;
    return def;
  },
  value(key) { return this.values[key] === undefined ? 0 : this.values[key]; },
  cap(key) {
    const def = this.defs[key];
    if (!def) return 0;
    if (!def.capMult && !this.capByMult[this.capMultName(key)]) return Infinity;
    return FA_MULT.get(this.capMultName(key));
  },
  gainMult(key) { return FA_MULT.get(this.gainMultName(key)); },
  add(key, amount) {
    if (!this.defs[key]) return;
    const cap = this.cap(key);
    let v = this.value(key) + amount;
    if (v < 0) v = 0;
    if (isFinite(cap)) v = Math.min(v, Math.max(cap, this.value(key)));
    this.values[key] = v;
  },
  spend(key, amount) {
    if (this.value(key) < amount) return false;
    this.values[key] -= amount;
    return true;
  },
  spendAll(key) { this.values[key] = 0; },
  gain(o) {
    const names = Array.isArray(o.name) ? o.name : [o.name];
    const feature = o.feature || 'farm';
    names.forEach(n => {
      const key = n.indexOf('_') > 0 ? n : (feature + '_' + n);
      let amt = o.amount;
      if (o.gainMult) amt = amt * this.gainMult(key);
      this.add(key, amt);
    });
  },
  canAfford(price, maxPrice) {
    const target = maxPrice || price || {};
    for (const k in target) { if (this.value(k) < target[k]) return false; }
    return true;
  },
  spendPrice(price) { for (const k in price) this.spend(k, price[k]); },
  reset(feature) {
    Object.keys(this.defs).forEach(k => { if (k.indexOf((feature||'farm') + '_') === 0) this.values[k] = 0; });
  },
  list(feature, type, subtype) {
    return Object.keys(this.defs)
      .filter(k => this.defs[k].feature === feature)
      .filter(k => {
        const d = this.defs[k];
        if (type && d.type !== type) return false;
        if (subtype && d.subtype !== subtype) return false;
        return true;
      });
  },
  keysOfSubtype(subtype) { return Object.keys(this.defs).filter(k => this.defs[k].subtype === subtype); }
};

/* ===== 3. FA_STAT：统计系统 ===== */
const FA_STAT = {
  values: {},
  get(key) { const s = this.values[key]; return s ? s.value : 0; },
  ensure(key) { if (!this.values[key]) this.values[key] = { value: 0, total: 0, max: 0 }; return this.values[key]; },
  add(key, value) {
    const s = this.ensure(key); s.value += value; s.total += value; if (s.value > s.max) s.max = s.value;
  },
  increaseTo(key, value) {
    const s = this.ensure(key);
    if (value > s.value) s.value = value;
    if (value > s.total) s.total = value;
    if (value > s.max) s.max = value;
  },
  set(key, value) { this.ensure(key).value = value; },
  reset(feature) {
    Object.keys(this.values).forEach(k => {
      if (k.indexOf((feature||'farm') + '_') === 0) this.values[k] = { value: 0, total: 0, max: 0 };
    });
  }
};

/* ===== 4. FA_UNLOCK：解锁系统 ===== */
const FA_UNLOCK = {
  items: {},
  init(id) { if (!this.items[id]) this.items[id] = { init: false, see: false, use: false }; return this.items[id]; },
  unlock(id) { const it = this.init(id); it.init = true; it.see = true; it.use = true; return it; },
  isUnlocked(id) { return !!(this.items[id] && this.items[id].use); },
  isVisible(id) { return !!(this.items[id] && this.items[id].see); }
};

/* ===== 5. FA_UPG：升级项系统 ===== */
const FA_UPG = {
  defs: {}, levels: {}, keep: {}, uncapped: {}, skippedEffects: {},
  register(mapName, map, defaultType) {
    if (!map) return 0;
    let n = 0;
    Object.keys(map).forEach(key => {
      const def = map[key];
      if (!def || typeof def !== 'object') return;
      const id = 'farm_' + key;
      def.id = id;
      def.key = key;
      def.type = def.type || defaultType;
      def.effect = def.effect || [];
      def._map = mapName;
      this.defs[id] = def;
      if (this.levels[id] === undefined) this.levels[id] = 0;
      n++;
    });
    return n;
  },
  cap(id) {
    if (this.uncapped[id]) return Infinity;
    const d = this.defs[id];
    if (!d || d.cap === undefined || d.cap === null) return Infinity;
    return d.cap;
  },
  price(id, lvl) {
    const d = this.defs[id];
    if (!d) return {};
    try { return d.price(lvl === undefined ? (this.levels[id] || 0) : lvl) || {}; }
    catch (e) { return {}; }
  },
  requirementMet(id) {
    const d = this.defs[id];
    if (!d) return false;
    if (typeof d.requirement === 'function') {
      try { return !!d.requirement(); } catch (e) { return false; }
    }
    return true;
  },
  isVisible(id) {
    const d = this.defs[id];
    if (!d) return false;
    return this.requirementMet(id);
  },
  isMaxed(id) { return (this.levels[id] || 0) >= this.cap(id); },
  canAfford(id) {
    if (this.isMaxed(id)) return false;
    try { return FA_CUR.canAfford(this.price(id)); } catch (e) { return false; }
  },
  buy(id) {
    const d = this.defs[id];
    if (!d || this.isMaxed(id)) return false;
    const price = this.price(id);
    if (!FA_CUR.canAfford(price)) return false;
    FA_CUR.spendPrice(price);
    this.levels[id] = (this.levels[id] || 0) + 1;
    this.apply(id);
    return true;
  },
  apply(id) {
    const d = this.defs[id];
    if (!d) return;
    const lvl = this.levels[id] || 0;
    d.effect.forEach((eff, k) => {
      const multKey = 'upg_' + id + '_' + k;
      if (lvl <= 0) { FA_SYSTEM.resetEffect({ type: eff.type, name: eff.name, multKey }); return; }
      let value = 0;
      try { value = typeof eff.value === 'function' ? eff.value(lvl) : eff.value; } catch (e) { value = 0; }
      FA_SYSTEM.applyEffect({ type: eff.type, name: eff.name, multKey, value, trigger: true });
    });
  },
  applyAll() { Object.keys(this.defs).forEach(id => { if (this.levels[id] > 0) this.apply(id); }); },
  resetTypes(types) {
    Object.keys(this.defs).forEach(id => {
      const d = this.defs[id];
      if (types.indexOf(d.type) < 0) return;
      this.levels[id] = 0;
      this.apply(id);
    });
  },
  list(type) { return Object.keys(this.defs).filter(id => !type || this.defs[id].type === type); }
};

/* ===== 6. FA_SYSTEM：效果系统（扩展 farm 的触发语义） ===== */
const FA_SYSTEM = {
  state: { features: { farm: {} } },
  effectLog: {},
  applyEffect(o) {
    if (!o) return;
    const value = typeof o.value === 'function' ? o.value() : o.value;
    switch (o.type) {
      case 'mult': FA_MULT.setMult({ name: o.name, key: o.multKey, value }); break;
      case 'base': FA_MULT.setBase({ name: o.name, key: o.multKey, value }); break;
      case 'bonus': FA_MULT.setBonus({ name: o.name, key: o.multKey, value }); break;
      case 'unlock': FA_UNLOCK.unlock(o.name); break;
      case 'keepUpgrade': if (value) FA_UPG.keep[o.name] = true; else delete FA_UPG.keep[o.name]; break;
      case 'uncapUpgrade': if (value) FA_UPG.uncapped[o.name] = true; else delete FA_UPG.uncapped[o.name]; break;
      case 'setMin': FA_MULT.setMin({ name: o.name, value }); break;
      case 'setMax': FA_MULT.setMax({ name: o.name, value }); break;
      default: FA_UPG.skippedEffects[o.type] = (FA_UPG.skippedEffects[o.type] || 0) + 1; break;
    }
  },
  resetEffect(o) {
    if (!o) return;
    if (o.type === 'mult' || o.type === 'base' || o.type === 'bonus') {
      FA_MULT.removeKeyAnywhere(o.multKey);
    } else if (o.type === 'keepUpgrade') {
      delete FA_UPG.keep[o.name];
    } else if (o.type === 'uncapUpgrade') {
      delete FA_UPG.uncapped[o.name];
    }
  }
};

/* ===== 7. FSTORE：Vuex 极小替身（farm 专属 commit/dispatch + 无关子系统占位） ===== */
const FSTORE = {
  state: null, _v: null, getters: {},
  _audit: { commits: {}, dispatches: {}, unknown: {} },

  commit(type, payload) {
    this._audit.commits[type] = (this._audit.commits[type] || 0) + 1;
    const p = payload || {};
    const bare = type.indexOf('farm/') === 0 ? type.slice(5) : type;
    // farm 命名空间 mutation 直接委托 fa_store
    if (type.indexOf('farm/') === 0 && FA_STORE.mutations[bare]) {
      try { FA_STORE.mutations[bare](this._v, p); } catch (e) { FA_RT.warnings.push('commit:' + type + ': ' + e.message); }
      return;
    }
    switch (type) {
      case 'stat/add': FA_STAT.add('farm_' + p.name, p.value); break;
      case 'stat/increaseTo': FA_STAT.increaseTo('farm_' + p.name, p.value); break;
      case 'stat/reset': FA_STAT.reset(p); break;
      case 'currency/add': FA_CUR.add((p.feature || 'farm') + '_' + p.name, p.amount); break;
      case 'system/nextRng': FA_RT.bumpRng(p.name, p.amount); break;
      case 'system/updateKey': if (this._sysState) this._sysState[p.key] = p.value; break;
      default:
        // 兼容无 farm/ 前缀的 mutation（如更新 key 系列）
        if (FA_STORE.mutations[bare]) {
          try { FA_STORE.mutations[bare](this._v, p); } catch (e) { FA_RT.warnings.push('commit:' + type + ': ' + e.message); }
        } else {
          this._audit.unknown['commit:' + type] = (this._audit.unknown['commit:' + type] || 0) + 1;
        }
        break;
    }
  },

  dispatch(type, payload, opt) {
    this._audit.dispatches[type] = (this._audit.dispatches[type] || 0) + 1;
    const p = payload || {};
    const bare = type.indexOf('farm/') === 0 ? type.slice(5) : type;
    if (type.indexOf('farm/') === 0 && FA_STORE.actions[bare]) {
      return FA_RT.act(bare, p);
    }
    switch (type) {
      case 'currency/gain': FA_CUR.gain(p); break;
      case 'currency/spend': FA_CUR.spend((p.feature || 'farm') + '_' + p.name, p.amount); break;
      case 'currency/reset': FA_CUR.reset(p); break;
      case 'currency/add': FA_CUR.add((p.feature || 'farm') + '_' + p.name, p.amount); break;
      case 'mult/setBase': FA_MULT.setBase(p); break;
      case 'mult/setMult': FA_MULT.setMult(p); break;
      case 'mult/setBonus': FA_MULT.setBonus(p); break;
      case 'mult/removeKey': FA_MULT.removeKeyAnywhere(p.key); break;
      case 'stat/add': FA_STAT.add('farm_' + p.name, p.value); break;
      case 'stat/increaseTo': FA_STAT.increaseTo('farm_' + p.name, p.value); break;
      case 'stat/reset': FA_STAT.reset(p); break;
      case 'system/applyEffect': FA_SYSTEM.applyEffect(p); break;
      case 'system/resetEffect': FA_SYSTEM.resetEffect(p); break;
      case 'system/nextRng': FA_RT.bumpRng(p.name, p.amount); break;
      case 'system/updateKey': if (this._sysState) this._sysState[p.key] = p.value; break;
      case 'unlock/unlock': FA_UNLOCK.unlock(p); break;
      case 'note/find': break;
      case 'meta/globalLevelPart': break;
      case 'card/updateKey': break;
      // 化肥消耗（consumable）
      case 'consumable/gain': FA_RT.consumableGain(p); break;
      case 'consumable/useMultiple': FA_RT.consumableUse(p); break;
      default:
        if (FA_STORE.actions[bare]) { return FA_RT.act(bare, p); }
        this._audit.unknown['dispatch:' + type] = (this._audit.unknown['dispatch:' + type] || 0) + 1;
        break;
    }
  }
};

/* ===== 8. FA_RT：灵植模块运行时 ===== */
const FA_RT = {
  MULT: FA_MULT, CUR: FA_CUR, STAT: FA_STAT, UNLOCK: FA_UNLOCK, UPG: FA_UPG, SYSTEM: FA_SYSTEM,
  store: FSTORE,
  ready: false, warnings: [],
  state: null, getters: null,
  _root: null, _sysState: null, _rng: {},
  tickspeed: 5,

  init(state) {
    this.state = state;
    state.field = state.field || [];
    state.crop = state.crop || {};
    state.building = state.building || {};
    state.gene = state.gene || {};
    state.fertilizer = state.fertilizer || {};
    state.selectedCropName = state.selectedCropName || FA_GOOBOO.crop.carrot ? 'carrot' : null;
    state.selectedBuildingName = null;
    state.selectedFertilizerName = null;
    state.selectedColor = null;
    state.deleting = false;
    state.showColors = false;
    state.plantGiant = false;
    state.careCanMax = ['yield', 'exp', 'rareDrop'];
    state.consumable = state.consumable || {};
    state.stat = state.stat || {};
    state.unlock = state.unlock || {};
    state.currencyVals = state.currencyVals || {};
    state.upgradeLevels = state.upgradeLevels || {};

    FA_STAT.values = state.stat;
    FA_UNLOCK.items = state.unlock;
    FA_CUR.values = state.currencyVals;
    FA_UPG.levels = state.upgradeLevels;
    this._sysState = state.system = state.system || { rng: {}, settings: { notification: { items: { cropReady: { value: true } } } } };
    this._rng = state.system.rng || {};

    VSTORE_PROXY_UPDATE();
    FSTORE._v = state;
    FSTORE._sysState = this._sysState;
    FSTORE.state = {
      farm: state,
      stat: state.stat,
      unlock: state.unlock,
      currency: this._currencyProxy(),
      upgrade: {},
      system: this._sysState,
      card: { card: {}, feature: { farm: { powerReward: [] } } },
      consumable: this._consumableProxy(),
      mult: { items: FA_MULT.items }
    };
    this._root = FSTORE.state;

    const guard = (label, fn) => { try { fn(); } catch (e) { this.warnings.push(label + ': ' + e.message); } };

    guard('stat', () => Object.keys(FA_GOOBOO.stat || {}).forEach(k => FA_STAT.ensure('farm_' + k)));
    guard('mult', () => Object.keys(FA_GOOBOO.mult || {}).forEach(k => FA_MULT.init(k, FA_GOOBOO.mult[k])));
    guard('unlock', () => (FA_GOOBOO.unlock || []).forEach(id => FA_UNLOCK.init(id)));
    guard('currency', () => {
      Object.keys(FA_GOOBOO.currency).forEach(k => {
        const def = FA_GOOBOO.currency[k];
        FA_CUR.init('farm_' + k, Object.assign({ feature: 'farm' }, def));
      });
    });
    guard('field', () => {
      if (!state.field.length) FSTORE.commit('farm/initField', {});
    });
    guard('initCrops', () => {
      Object.keys(FA_GOOBOO.crop).forEach(k => FSTORE.commit('farm/initCrop', Object.assign({ name: k }, FA_GOOBOO.crop[k])));
    });
    guard('initBuildings', () => {
      Object.keys(FA_GOOBOO.building).forEach(k => FSTORE.commit('farm/initBuilding', Object.assign({ name: k }, FA_GOOBOO.building[k])));
    });
    guard('initGenes', () => {
      Object.keys(FA_GOOBOO.gene).forEach(k => FSTORE.commit('farm/initGene', Object.assign({ name: k }, FA_GOOBOO.gene[k])));
    });
    guard('initFertilizers', () => {
      Object.keys(FA_GOOBOO.fertilizer).forEach(k => FSTORE.commit('farm/initFertilizer', Object.assign({ name: k }, FA_GOOBOO.fertilizer[k])));
    });
    guard('consumables', () => {
      Object.keys(FA_GOOBOO.fertilizer).forEach(k => {
        if (!state.consumable['farm_' + k]) state.consumable['farm_' + k] = { amount: 0, price: FA_GOOBOO.fertilizer[k].price || {} };
      });
    });
    guard('upgrade', () => { FA_UPG.register('upgrade', FA_GOOBOO.upgrade, 'regular'); });
    guard('getters', () => this.buildGetters());
    guard('multGroup', () => this._linkMultGroups());
    guard('applyAll', () => FA_UPG.applyAll());
    guard('earlyGame', () => FSTORE.dispatch('farm/applyEarlyGameBuff', {}));
    guard('caches', () => FSTORE.dispatch('farm/updateFieldCaches', {}));
    guard('grownHint', () => FSTORE.dispatch('farm/updateGrownHint', {}));

    this.ready = true;
    return this;
  },

  _linkMultGroups() {
    const link = (mult, members) => FA_MULT.linkGroup(mult, (members||[]).filter(m => FA_MULT.items[m]));
    if (FA_GOOBOO.mult.farmCropGain) link('farmCropGain', FA_GOOBOO.mult.farmCropGain.group);
    if (FA_GOOBOO.mult.farmAllGain) link('farmAllGain', FA_GOOBOO.mult.farmAllGain.group);
    if (FA_GOOBOO.mult.farmRareDropChance) link('farmRareDropChance', FA_GOOBOO.mult.farmRareDropChance.group);
  },

  _currencyProxy() {
    const self = this;
    return new Proxy({}, {
      get(t, prop) {
        if (typeof prop !== 'string' || prop === 'toJSON') return undefined;
        const key = prop.indexOf('farm_') === 0 ? prop : 'farm_' + prop;
        const def = FA_CUR.defs[key];
        if (!def) return undefined;
        return { value: FA_CUR.value(key), cap: FA_CUR.cap(key), unlock: def.unlock, display: def.display, subtype: def.subtype };
      }
    });
  },

  _consumableProxy() {
    const self = this;
    return new Proxy({}, {
      get(t, prop) {
        if (typeof prop !== 'string' || prop === 'toJSON') return undefined;
        return { amount: self.state.consumable[prop]?.amount ?? 0, price: self.state.consumable[prop]?.price ?? null };
      }
    });
  },

  /* rng 系统：按作物名计数的简易确定性随机（gooboo system.getRng） */
  bumpRng(name, amount) {
    if (name === undefined) return;
    this._rng[name] = (this._rng[name] || 0) + (amount || 0);
  },
  rngGen(name, seed) {
    // 用名字+序号做固定哈希 seed，保证序列稳定
    let h = 0;
    const s = String(name) + '_' + (seed ?? 0);
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    const x = Math.abs(h >>> 0) / 4294967295;
    return x;
  },

  /* getters / ctx（Vuex 等价） */
  rootGetters() {
    const self = this;
    if (!this._rootGettersCache) {
      this._rootGettersCache = {
        'mult/get': (name, base, mult, bonus) => FA_MULT.get(name, base, mult, bonus),
        'mult/list': (mod) => Object.keys(FA_MULT.items).filter(n => !mod || FA_MULT.items[n][mod]),
        'currency/value': (key) => FA_CUR.value(key),
        'currency/cap': (key) => FA_CUR.cap(key),
        'currency/values': () => FA_CUR.values,
        'currency/list': (feature, type, subtype) => FA_CUR.list(feature, type, subtype),
        'currency/canAfford': (price, maxPrice) => FA_CUR.canAfford(price, maxPrice),
        'system/getRngById': (name, seed) => () => this.rngGen(name, seed),
        'system/rng': () => this._rng,
        // consumable（化肥）
        'consumable/priceMultiple': (prices) => this.consumablePriceMultiple(prices),
        'consumable/canAffordMultiple': (prices) => this.consumableCanAfford(prices)
      };
    }
    return this._rootGettersCache;
  },

  buildGetters() {
    const g = {};
    const self = this;
    Object.keys(FA_STORE.getters).forEach(name => {
      Object.defineProperty(g, name, {
        enumerable: true, configurable: true,
        get() { return FA_STORE.getters[name](self.state, g, self._root, self.rootGetters()); }
      });
    });
    this.getters = g;
    FSTORE.getters = new Proxy({}, {
      get(t, prop) {
        if (typeof prop !== 'string') return undefined;
        if (prop.indexOf('farm/') === 0) return g[prop.slice(5)];
        return self.rootGetters()[prop];
      }
    });
    return g;
  },

  ctx() {
    const self = this;
    return {
      state: this.state,
      getters: this.getters,
      rootState: this._root,
      rootGetters: this.rootGetters(),
      commit: (type, payload, opt) => FSTORE.commit(type.indexOf('/') > 0 ? type : 'farm/' + type, payload),
      dispatch: (type, payload, opt) => FSTORE.dispatch(type.indexOf('/') > 0 ? type : 'farm/' + type, payload, opt)
    };
  },

  act(name, payload) {
    try {
      return FA_STORE.actions[name](this.ctx(), payload || {});
    } catch (e) { this.warnings.push('act:' + name + ': ' + e.message); return null; }
  },

  /* ===== 化肥（consumable） ===== */
  consumablePriceMultiple(prices) {
    // prices: { farm_speedGrow: qty } → 折算成其各自定价（gem_sapphire / farm_grass 等）合并
    let price = {};
    for (const [name, qty] of Object.entries(prices || {})) {
      const item = this.state.consumable[name];
      if (!item) continue;
      for (const [ck, cv] of Object.entries(item.price || {})) {
        price[ck] = (price[ck] || 0) + cv * qty;
      }
    }
    return { price };
  },
  consumableCanAfford(prices) {
    for (const [name, qty] of Object.entries(prices || {})) {
      if ((this.state.consumable[name]?.amount ?? 0) < qty) return false;
    }
    return true;
  },
  consumableGain(p) {
    const name = p.name || p;
    const amt = (typeof p === 'string') ? 1 : (p.amount ?? 1);
    if (!this.state.consumable[name]) this.state.consumable[name] = { amount: 0, price: {} };
    this.state.consumable[name].amount += amt;
  },
  consumableUse(p) {
    for (const [name, qty] of Object.entries(p || {})) {
      const item = this.state.consumable[name];
      if (item) item.amount = Math.max(0, (item.amount ?? 0) - qty);
    }
  },

  /* ===== tick（复刻 gooboo modules/farm.js tick，tickspeed=5） ===== */
  tick(ticks) {
    if (!this.ready) return;
    const self = this;
    try {
      const decoration = (this.state.building.gardenGnome?.cacheAmount ?? 0) + (this.state.building.gardenGnome?.cachePremium ?? 0) * FARM_BUILDING_PREMIUM_BONUS;
      let highestGrow = 0;
      let careEligible = [];
      let careActive = 0;
      const careMax = FA_MULT.get('farmMaxCare');
      const field = this.state.field;
      field.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (!cell || cell.type !== 'crop') return;
          if (cell.cache.overgrowMult === null) {
            FSTORE.commit('farm/updateFieldKey', {x, y, key: 'grow', value: Math.min(cell.grow + cell.cache.grow * ticks / 12, 1)});
          } else {
            let grow = cell.grow;
            let stage = Math.floor(cell.grow);
            let amt = cell.cache.grow * ticks / 12;
            while (amt > 0) {
              const left = (stage + 1) - grow;
              const stageMult = stage > 0 ? Math.pow(cell.cache.overgrowMult, stage) : 1;
              const given = Math.min(left, amt / stageMult);
              grow += given;
              amt -= given * stageMult;
              stage++;
            }
            if (grow > highestGrow) highestGrow = grow;
            FSTORE.commit('farm/updateFieldKey', {x, y, key: 'grow', value: grow});
          }
          FSTORE.commit('farm/updateFieldKey', {x, y, key: 'time', value: cell.time + ticks});
          if (decoration > 0) FSTORE.commit('farm/addFieldBuildingEffect', {x, y, key: 'gardenGnome', value: decoration * ticks});
          if (cell.cache.lectern > 0) FSTORE.commit('farm/addFieldBuildingEffect', {x, y, key: 'lectern', value: cell.cache.lectern * ticks});
          if (cell.cache.pinwheel > 0) FSTORE.commit('farm/addFieldBuildingEffect', {x, y, key: 'pinwheel', value: cell.cache.pinwheel * ticks});
          if (cell.cache.flag > 0) FSTORE.commit('farm/addFieldBuildingEffect', {x, y, key: 'flag', value: cell.cache.flag * ticks});
          if (cell.cache.gnome > 0) FSTORE.commit('farm/addFieldBuildingEffect', {x, y, key: 'gnomeBoost', value: cell.cache.gnome * ticks});
          if (cell.care.active) careActive++;
          else if (cell.cache.careWeight > 0) careEligible.push({x, y, weight: cell.cache.careWeight});
        });
      });

      if (FA_UNLOCK.isUnlocked('farmCare')) {
        FA_CUR.gain({ feature: 'farm', name: 'rainwater', amount: FA_MULT.get('currencyFarmRainwaterGain') * ticks / 720 });
        const careGiven = Math.min(careEligible.length, Math.floor(FA_CUR.value('farm_rainwater')), careMax - careActive, randomRound(ticks * Math.max(0.2, 0.2 * FA_CUR.value('farm_rainwater') / Math.max(1, FA_CUR.cap('farm_rainwater')))));
        if (careGiven > 0) {
          for (let i = 0; i < careGiven; i++) {
            const index = weightSelect(careEligible.map(el => el.weight));
            const cell = careEligible[index];
            FSTORE.commit('farm/updateFieldCare', {x: cell.x, y: cell.y, key: 'active', value: true});
            careEligible.splice(index, 1);
          }
          FA_CUR.spend('farm_rainwater', careGiven);
        }
      }
      if (highestGrow > 1) FSTORE.commit('stat/increaseTo', { name: 'maxOvergrow', value: highestGrow });
      FSTORE.dispatch('farm/updateGrownHint', {});
    } catch (e) { this.warnings.push('tick: ' + e.message); }
  },

  offlineTick(elapsedMs) {
    if (!this.ready) return;
    let left = elapsedMs / 1000;
    const chunk = 3600;
    while (left > 0) { const step = Math.min(left, chunk); this.tick(step / 1); left -= step; }
  },

  afterChange() {}
};

/* ===== 注册到跨模块地基（数值/存档不变，仅登记引用） ===== */
if (typeof GB_MODULES !== 'undefined') {
  GB_MODULES.register({
    id: 'farm', name: '灵植园', keyPrefix: 'farm', tickSpeed: 5, unlockNeeded: 'faFeature',
    core: { MULT: FA_MULT, CUR: FA_CUR, STAT: FA_STAT, UNLOCK: FA_UNLOCK, UPG: FA_UPG, RT: FA_RT },
    onAfterLoad: () => {
      try {
        // farm_0 = 所有作物等级合计（gooboo store/farm.js performMeta 里累加 totalLevel）
        let total = 0;
        const stat = FA_STAT.values;
        for (const k of Object.keys(stat)) {
          if (k.indexOf('farm_cropLevel_') === 0) total += (stat[k] && stat[k].value) || 0;
        }
        GB_META.globalLevelPart('fa_0', total);
      } catch (e) {}
    },
  });
}

/* ===== 9. fa_store 数据引用 bridge（由 fa_data/fa_store 在 VM 全局域定义） ===== */
function VSTORE_PROXY_UPDATE() {}