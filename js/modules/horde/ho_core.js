/* ============================================================
 * ho_core.js —— 「降妖（horde）」模块运行时内核（零依赖、零构建）
 *
 * 作用：为照抄 gooboo horde 的 ho_data.js / ho_mod.js / ho_store.js 提供运行环境。
 *   - 复用全局工具（getSequence/getDiminishing/getApproaching/splicedLinear/
 *     buildArray/capitalize/decapitalize/buildNum/formatNum/logBase/weightSelect）
 *   - 自建 HO_ 前缀 MULT/CUR/STAT/UNLOCK/UPG/SYSTEM/TAG + HOSTORE + HO_RT
 *   - 战斗总逻辑在 ho_mod.js（HO_MODULE.tick），本文件负责装填系统与 store 替身
 *
 * 注意：gooboo horde 文件内直接引用全局 `store`（Vuex），生成时已改为 `HOSTORE`。
 *   这里 HOSTORE 是对 Vuex 根 store 的等价替身。
 * ============================================================ */

/* ===== 0. horde 工具（复用部分全局，补充 randomElem） ===== */
function chance(prob, rng) { return (rng === undefined ? Math.random() : rng) < prob; }
function randomInt(min, max, rng) { rng = (rng === undefined ? Math.random() : rng); return Math.floor(rng * (1 + max - min) + min); }
function randomFloat(min, max, rng) { rng = (rng === undefined ? Math.random() : rng); return rng * (max - min) + min; }
function randomRound(num, rng) { const fl = Math.floor(num); return (chance(num - fl, rng) ? fl + 1 : fl); }
function randomElem(arr, rng) { if (!arr || !arr.length) return undefined; return arr[randomInt(0, arr.length - 1, rng)]; }

/* ===== 1. HO_MULT：倍率系统（feature 固定为 horde） ===== */
const HO_MULT = {
  items: {},
  missing: [],
  init(name, o) {
    o = o || {};
    const item = {
      feature: 'horde',
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
  get(name, base, mult, bonus, blacklist) {
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

/* ===== 2. HO_CUR：货币 / 资源系统 ===== */
const HO_CUR = {
  defs: {}, values: {}, capByMult: {}, currencyMults: {},
  prefix(key) { return key.split('_')[0]; },
  gainMultName(key) { return 'currency' + key.split('_').map(capitalize).join('') + 'Gain'; },
  capMultName(key) { return 'currency' + key.split('_').map(capitalize).join('') + 'Cap'; },
  init(key, def) {
    def = def || {};
    if (!def.feature) def.feature = 'horde';
    if (!def.type) def.type = 'regular';
    def.key = key;
    this.defs[key] = def;
    if (this.values[key] === undefined) this.values[key] = def.value || 0;
    const gm = this.gainMultName(key), cm = this.capMultName(key);
    HO_MULT.init(gm, Object.assign({ feature: 'horde' }, def.gainMult || {}));
    HO_MULT.init(cm, Object.assign({ feature: 'horde' }, def.capMult || {}));
    if (def.capMult) this.capByMult[cm] = key;
    if (def.currencyMult) this.currencyMults[key] = def.currencyMult;
    return def;
  },
  value(key) { return this.values[key] === undefined ? 0 : this.values[key]; },
  cap(key) {
    const def = this.defs[key];
    if (!def) return 0;
    if (!def.capMult && !this.capByMult[this.capMultName(key)]) return Infinity;
    return HO_MULT.get(this.capMultName(key));
  },
  gainMult(key) { return HO_MULT.get(this.gainMultName(key)); },
  add(key, amount) {
    if (!this.defs[key]) return;
    const cap = this.cap(key);
    let v = this.value(key) + amount;
    if (v < 0) v = 0;
    if (isFinite(cap)) v = Math.min(v, Math.max(cap, this.value(key)));
    this.values[key] = v;
    if (this.currencyMults[key]) {
      for (const ckey in this.currencyMults[key]) {
        const eff = this.currencyMults[key][ckey];
        const val = typeof eff.value === 'function' ? eff.value(v) : eff.value;
        if (eff.type === 'mult') HO_MULT.setMult({ name: ckey, key: 'currencyMult_' + key, value: val });
        else if (eff.type === 'base') HO_MULT.setBase({ name: ckey, key: 'currencyMult_' + key, value: val });
        else if (eff.type === 'bonus') HO_MULT.setBonus({ name: ckey, key: 'currencyMult_' + key, value: val });
        else HO_MULT.removeKeyAnywhere('currencyMult_' + key);
      }
    }
  },
  spend(key, amount) {
    if (this.value(key) < amount) return false;
    this.values[key] -= amount;
    return true;
  },
  spendAll(key) { this.values[key] = 0; },
  gain(o) {
    const names = Array.isArray(o.name) ? o.name : [o.name];
    names.forEach(n => {
      const key = n.indexOf('_') > 0 ? n : ('horde_' + n);
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
    Object.keys(this.defs).forEach(k => { if (k.indexOf((feature || 'horde') + '_') === 0) this.values[k] = 0; });
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

/* ===== 3. HO_STAT：统计系统 ===== */
const HO_STAT = {
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
      if (k.indexOf((feature || 'horde') + '_') === 0) this.values[k] = { value: 0, total: 0, max: 0 };
    });
  }
};

/* ===== 4. HO_UNLOCK：解锁系统 ===== */
const HO_UNLOCK = {
  items: {},
  init(id) { if (!this.items[id]) this.items[id] = { init: false, see: false, use: false }; return this.items[id]; },
  unlock(id) { const it = this.init(id); it.init = true; it.see = true; it.use = true; return it; },
  isUnlocked(id) { return !!(this.items[id] && this.items[id].use); },
  isVisible(id) { return !!(this.items[id] && this.items[id].see); }
};

/* ===== 5. HO_UPG：升级项系统（upgrade + 各类资源卡牌 effect） ===== */
const HO_UPG = {
  defs: {}, levels: {}, keep: {}, uncapped: {}, skippedEffects: {},
  register(mapName, map, defaultType) {
    if (!map) return 0;
    let n = 0;
    Object.keys(map).forEach(key => {
      const def = map[key];
      if (!def || typeof def !== 'object') return;
      const id = 'horde_' + key;
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
  reqBase(d) {
    // requirementStat: 'horde_maxZone' → HO_STAT 累计；其余走 battlepass 层级等
    try {
      const stat = d.requirementStat;
      if (stat === 'horde_maxZone') return HO_STAT.get('horde_maxZone');
      if (stat === 'custom_hordeBattlepass') {
        try { return HO_RT && HO_RT.getters && HO_RT.getters.battlePassCurrentLevel || 0; } catch (e) { return 0; }
      }
      return HO_STAT.get(stat);
    } catch (e) { return 0; }
  },
  requirementMet(id) {
    const d = this.defs[id];
    if (!d) return false;
    if (typeof d.requirement === 'function') {
      try { return !!d.requirement(); } catch (e) { return false; }
    }
    // 渐进解锁：以 requirementValue 为界，当前进度达标才可见
    if (d.requirementValue !== undefined && d.requirementValue !== null) {
      return this.reqBase(d) >= d.requirementValue;
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
    try { return HO_CUR.canAfford(this.price(id)); } catch (e) { return false; }
  },
  buy(id) {
    const d = this.defs[id];
    if (!d || this.isMaxed(id)) return false;
    const price = this.price(id);
    if (!HO_CUR.canAfford(price)) return false;
    HO_CUR.spendPrice(price);
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
      if (lvl <= 0) { HO_SYSTEM.resetEffect({ type: eff.type, name: eff.name, multKey }); return; }
      let value = 0;
      try { value = typeof eff.value === 'function' ? eff.value(lvl) : eff.value; } catch (e) { value = 0; }
      HO_SYSTEM.applyEffect({ type: eff.type, name: eff.name, multKey, value, trigger: true });
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

/* ===== 6. HO_SYSTEM：效果系统 + 系统状态 ===== */
const HO_SYSTEM = {
  state: { features: { horde: { currentSubfeature: 0 } }, settings: { notification: { items: {} } }, rng: {} },
  effectLog: {},
  applyEffect(o) {
    if (!o) return;
    const value = typeof o.value === 'function' ? o.value() : o.value;
    switch (o.type) {
      case 'mult': HO_MULT.setMult({ name: o.name, key: o.multKey, value }); break;
      case 'base': HO_MULT.setBase({ name: o.name, key: o.multKey, value }); break;
      case 'bonus': HO_MULT.setBonus({ name: o.name, key: o.multKey, value }); break;
      case 'unlock': HO_UNLOCK.unlock(o.name); break;
      case 'keepUpgrade': if (value) HO_UPG.keep[o.name] = true; else delete HO_UPG.keep[o.name]; break;
      case 'uncapUpgrade': if (value) HO_UPG.uncapped[o.name] = true; else delete HO_UPG.uncapped[o.name]; break;
      case 'setMin': HO_MULT.setMin({ name: o.name, value }); break;
      case 'setMax': HO_MULT.setMax({ name: o.name, value }); break;
      default: HO_UPG.skippedEffects[o.type] = (HO_UPG.skippedEffects[o.type] || 0) + 1; break;
    }
  },
  resetEffect(o) {
    if (!o) return;
    if (o.type === 'mult' || o.type === 'base' || o.type === 'bonus') {
      HO_MULT.removeKeyAnywhere(o.multKey);
    } else if (o.type === 'keepUpgrade') {
      delete HO_UPG.keep[o.name];
    } else if (o.type === 'uncapUpgrade') {
      delete HO_UPG.uncapped[o.name];
    }
  }
};

/* ===== 7. HO_TAG：标签效果（tag/values 等） ===== */
const HO_TAG = {
  defs: {},
  values: {},
  init(name, def) { this.defs[name] = def; return this; },
  set(o) { this.values[o.name + '__' + o.key] = o.value; },
  reset(o) { delete this.values[o.name + '__' + o.key]; },
  values(name) {
    const def = this.defs[name];
    if (!def) return [0];
    const counts = {};
    for (const k in this.values) {
      if (k.indexOf(name + '__') === 0) counts[k.split('__')[1]] = this.values[k];
    }
    const stacked = Object.values(counts);
    if (def.stacking === 'add') {
      const arr = [];
      const pLen = (def.params || []).length;
      let total = 0;
      for (let i = 0; i < pLen; i++) {
        let s = 0;
        for (const v of stacked) s += +(isFinite(Array.isArray(v) ? v[i] : v) ? (Array.isArray(v) ? v[i] : v) : 0);
        arr.push(s);
      }
      return arr;
    }
    return [stacked.reduce((a, b) => a + (b || 0), 0)];
  }
};

/* ===== 8. HOSTORE：Vuex 极小替身（horde 专属 commit/dispatch + 无关子系统占位） ===== */
const HOSTORE = {
  state: null, _v: null, getters: {},
  _audit: { commits: {}, dispatches: {}, unknown: {} },

  commit(type, payload) {
    this._audit.commits[type] = (this._audit.commits[type] || 0) + 1;
    const p = payload || {};
    const bare = type.indexOf('horde/') === 0 ? type.slice(6) : type;
    if (type.indexOf('horde/') === 0 && HO_STORE.mutations[bare]) {
      try { HO_STORE.mutations[bare](this._v, p); } catch (e) { HO_RT.warnings.push('commit:' + type + ': ' + e.message); }
      return;
    }
    switch (type) {
      case 'stat/add': HO_STAT.add('horde_' + (p.name || p), p.value); break;
      case 'stat/increaseTo': HO_STAT.increaseTo('horde_' + (p.name || p), p.value); break;
      case 'stat/reset': HO_STAT.reset(p); break;
      case 'currency/add': HO_CUR.add((p.feature || 'horde') + '_' + p.name, p.amount); break;
      case 'system/nextRng': HO_RT.bumpRng(p.name, p.amount); break;
      case 'system/updateKey': if (this._sysState) this._sysState[p.key] = p.value; break;
      case 'unlock/unlock': HO_UNLOCK.unlock(p); break;
      case 'unlock/init': HO_UNLOCK.init(p); break;
      case 'tag/set': HO_TAG.set(p); break;
      case 'tag/reset': HO_TAG.reset(p); break;
      case 'note/find': break;
      case 'mult/updateExternalCaches': break;
      default:
        if (HO_STORE.mutations[bare]) {
          try { HO_STORE.mutations[bare](this._v, p); } catch (e) { HO_RT.warnings.push('commit:' + type + ': ' + e.message); }
        } else {
          this._audit.unknown['commit:' + type] = (this._audit.unknown['commit:' + type] || 0) + 1;
        }
        break;
    }
  },

  dispatch(type, payload, opt) {
    this._audit.dispatches[type] = (this._audit.dispatches[type] || 0) + 1;
    const p = payload || {};
    const bare = type.indexOf('horde/') === 0 ? type.slice(6) : type;
    if (type.indexOf('horde/') === 0 && HO_STORE.actions[bare]) {
      return HO_RT.act(bare, p);
    }
    switch (type) {
      case 'currency/gain': HO_CUR.gain(p); break;
      case 'currency/spend': HO_CUR.spend((p.feature || 'horde') + '_' + p.name, p.amount); break;
      case 'currency/reset': HO_CUR.reset(p); break;
      case 'currency/add': HO_CUR.add((p.feature || 'horde') + '_' + p.name, p.amount); break;
      case 'mult/setBase': HO_MULT.setBase(p); break;
      case 'mult/setMult': HO_MULT.setMult(p); break;
      case 'mult/setBonus': HO_MULT.setBonus(p); break;
      case 'mult/removeKey': HO_MULT.removeKeyAnywhere(p.key); break;
      case 'stat/add': HO_STAT.add('horde_' + (p.name || p), p.value); break;
      case 'stat/increaseTo': HO_STAT.increaseTo('horde_' + (p.name || p), p.value); break;
      case 'stat/reset': HO_STAT.reset(p); break;
      case 'system/applyEffect': HO_SYSTEM.applyEffect(p); break;
      case 'system/resetEffect': HO_SYSTEM.resetEffect(p); break;
      case 'system/nextRng': HO_RT.bumpRng(p.name, p.amount); break;
      case 'system/updateKey': if (this._sysState) this._sysState[p.key] = p.value; break;
      case 'unlock/unlock': HO_UNLOCK.unlock(p); break;
      case 'note/find': break;
      case 'consumable/gain': HO_RT.consumableGain(p); break;
      case 'consumable/use': HO_RT.consumableUse(p); break;
      case 'card/updateKey': break;
      default:
        if (HO_STORE.actions[bare]) { return HO_RT.act(bare, p); }
        this._audit.unknown['dispatch:' + type] = (this._audit.unknown['dispatch:' + type] || 0) + 1;
        break;
    }
  }
};

/* ===== 9. HO_RT：降妖模块运行时 ===== */
const HO_RT = {
  MULT: HO_MULT, CUR: HO_CUR, STAT: HO_STAT, UNLOCK: HO_UNLOCK, UPG: HO_UPG, SYSTEM: HO_SYSTEM, TAG: HO_TAG,
  store: HOSTORE,
  ready: false, warnings: [],
  state: null, getters: null,
  _root: null, _sysState: null, _rng: {},
  tickspeed: 1,

  init(state) {
    this.state = state;
    state.stat = state.stat || {};
    state.unlock = state.unlock || {};
    state.currencyVals = state.currencyVals || {};
    state.upgradeLevels = state.upgradeLevels || {};

    HO_STAT.values = state.stat;
    HO_UNLOCK.items = state.unlock;
    HO_CUR.values = state.currencyVals;
    HO_UPG.levels = state.upgradeLevels;
    this._sysState = state.system = state.system || { rng: {}, settings: { notification: { items: {} } }, features: { horde: { currentSubfeature: 0 } } };
    if (!this._sysState.settings) this._sysState.settings = { notification: { items: {} } };
    if (!this._sysState.settings.notification) this._sysState.settings.notification = { items: {} };
    if (!this._sysState.settings.notification.items) this._sysState.settings.notification.items = {};
    if (!this._sysState.features) this._sysState.features = { horde: { currentSubfeature: 0 } };
    this._rng = state.system.rng || {};

    HOSTORE._v = state;
    HOSTORE._sysState = this._sysState;
    HOSTORE.state = {
      horde: state,
      stat: state.stat,
      unlock: state.unlock,
      currency: this._currencyProxy(),
      upgrade: {},
      system: this._sysState,
      card: { card: {}, feature: { horde: { powerReward: [] } } },
      consumable: this._consumableProxy(),
      mult: { items: HO_MULT.items }
    };
    this._root = HOSTORE.state;

    const guard = (label, fn) => { try { fn(); } catch (e) { this.warnings.push(label + ': ' + e.message); } };

    guard('stat', () => Object.keys(HO_MODULE.stat || {}).forEach(k => HO_STAT.ensure('horde_' + k)));
    guard('mult', () => Object.keys(HO_MODULE.mult || {}).forEach(k => HO_MULT.init(k, HO_MODULE.mult[k])));
    // mult group（premium 分组）
    guard('multGroup', () => (HO_MODULE.multGroup || []).forEach(g => HO_MULT.linkGroup(g.mult, [])));
    guard('tag', () => Object.keys(HO_MODULE.tag || {}).forEach(k => HO_TAG.init(k, HO_MODULE.tag[k])));
    guard('unlock', () => (HO_MODULE.unlock || []).forEach(id => HO_UNLOCK.init(id)));
    guard('currency', () => {
      Object.keys(HO_MODULE.currency || {}).forEach(k => {
        HO_CUR.init('horde_' + k, Object.assign({ feature: 'horde' }, HO_MODULE.currency[k]));
      });
    });
    guard('upgrade', () => HO_UPG.register('upgrade', HO_MODULE.upgrade, 'regular'));
    guard('consumable', () => {
      Object.keys(HO_MODULE.consumable || {}).forEach(k => {
        if (!state.consumable) state.consumable = {};
        if (!state.consumable[k]) state.consumable[k] = { amount: 0, price: HO_MODULE.consumable[k].price || {} };
      });
    });

    // 玩家/敌人初始状态兜底
    state.zone = state.zone || 1;
    state.combo = state.combo || 0;
    state.respawn = state.respawn || 0;
    state.maxRespawn = state.maxRespawn || 1;
    state.bossAvailable = state.bossAvailable || false;
    state.bossFight = state.bossFight || false;
    state.player = state.player || {};
    state.enemy = state.enemy || null;
    state.items = state.items || {};
    state.sigil = state.sigil || {};
    state.sigilZones = state.sigilZones || [];
    state.enemyActive = state.enemyActive || {};
    state.heirloom = state.heirloom || {};
    state.heirloomsFound = state.heirloomsFound === undefined ? null : state.heirloomsFound;
    state.fightTime = state.fightTime || 0;
    state.fightRampage = state.fightRampage || 0;
    state.loadout = state.loadout || [];
    state.nextLoadoutId = state.nextLoadoutId || 1;
    state.enemyTimer = state.enemyTimer || 0;
    state.rareLootTimer = state.rareLootTimer || 0;
    state.nostalgiaLost = state.nostalgiaLost || 0;
    state.chosenActive = state.chosenActive || null;
    state.itemStatMult = state.itemStatMult || {};
    state.tower = state.tower || {};
    state.currentTower = state.currentTower || null;
    state.towerFloor = state.towerFloor || 0;
    state.taunt = state.taunt || false;
    state.fighterClass = state.fighterClass || {};
    state.selectedClass = state.selectedClass || 'adventurer';
    state.nextClass = state.nextClass || 'adventurer';
    state.area = state.area || {};
    state.selectedArea = state.selectedArea || null;
    state.cachePlayerStats = state.cachePlayerStats || null;
    state.cacheEnemyStats = state.cacheEnemyStats || null;
    state.playerBuff = state.playerBuff || {};
    state.expLevel = state.expLevel || 0;
    state.skillPoints = state.skillPoints || 0;
    state.skillLevel = state.skillLevel || {};
    state.skillActive = state.skillActive || {};
    state.trinket = state.trinket || {};
    state.battlePassEffect = state.battlePassEffect || {};
    state.enemyType = state.enemyType || {};
    state.areaBoss = state.areaBoss || {};
    state.autocast = state.autocast || [];
    state.activeTimer = state.activeTimer || 0;
    state.heirloomDrop = state.heirloomDrop || null;
    state.trinketDrop = state.trinketDrop || null;
    state.bossStage = state.bossStage || 0;
    state.bossBonusDifficulty = state.bossBonusDifficulty || 0;
    state.sacrificeLevel = state.sacrificeLevel || 0;
    state.nextSacrificeLevel = state.nextSacrificeLevel || 0;
    state.raidboss = state.raidboss || false;
    state.raidbossDefeated = state.raidbossDefeated || 0;
    state.raidbossStacks = state.raidbossStacks || 0;
    state.element = state.element || {};
    state.playerAttackMult = state.playerAttackMult || 1;
    state.courageScore = state.courageScore || 0;
    if (!state.heirloomAmountNeeded) state.heirloomAmountNeeded = [10, 35, 110, 325, 900, 2500, 6800, 18000, 47000, 120000, 300000, 725000, 1700000, 3850000, 8500000];
    if (!state.trinketAmountNeeded) state.trinketAmountNeeded = [1, 8, 36, 150, 600, 2350, 9000, 33000, 115000, 380000];

    // 先建 getters，保证 init 阶段任何 dispatch 都能取到 getters / rootGetters
    this.buildGetters();

    // 载入模块数据（items/heirlooms/sigils/towers/classes/areas/trinkets/enemyTypes/bosses/elements）
    guard('moduleInit', () => HO_MODULE.init());

    // 恢复存档货币与道法。注意这里刻意调用 loadGame（否则会按 gooboo 的 Vuex 全量恢复路径
    // 把 enemy 等战斗对象清空重建，导致读档后敌出海量显示 0/1）。本工程 init 已把存档整体
    // 透传为运行时 state（enemy/player/items 天然可用并由 _settle 重建），这里只需把存档的
    // 嵌套结构 currency / upgrade 映射进 HO_CUR / HO_UPG 并重算道法加成。
    guard('restoreCurrency', () => {
      if (state.currency) for (const k in state.currency) HO_CUR.values[k] = Math.max(0, state.currency[k]);
    });
    guard('restoreUpgrade', () => {
      if (state.upgrade) {
        for (const k in state.upgrade) if (HO_UPG.defs[k]) HO_UPG.levels[k] = Math.max(0, state.upgrade[k]);
        HO_UPG.applyAll();
      }
    });

    // 建立玩家缓存（cachePlayerStats → cacheEnemyStats → player），供 tick / getters 使用
    this.act('updatePlayerCache');
    this.act('updateEnemyCache');
    this.act('updatePlayerStats');
    this.ready = true;
  },

  /* currency proxy */
  _currencyProxy() {
    const self = this;
    return new Proxy({}, {
      get(t, prop) {
        if (typeof prop !== 'string' || prop === 'toJSON') return undefined;
        const def = HO_CUR.defs[prop];
        if (!def) return undefined;
        return { value: HO_CUR.value(prop), cap: HO_CUR.cap(prop), unlock: def.unlock, display: def.display, subtype: def.subtype };
      }
    });
  },
  _consumableProxy() {
    const self = this;
    return new Proxy({}, {
      get(t, prop) {
        if (typeof prop !== 'string' || prop === 'toJSON') return undefined;
        return { amount: self.state.consumable?.[prop]?.amount ?? 0, price: self.state.consumable?.[prop]?.price ?? null };
      }
    });
  },

  /* rng */
  bumpRng(name, amount) {
    if (name === undefined) return;
    this._rng[name] = (this._rng[name] || 0) + (amount || 0);
  },
  rngGen(name, seed) {
    let h = 0;
    const s = String(name) + '_' + (seed ?? 0);
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    const x = Math.abs((h >>> 0) + 1) / 4294967295;
    return x;
  },
  rngSeq(name, seed) {
    const self = this;
    let i = 0;
    return () => self.rngGen(name, (seed ?? 0) + (i++));
  },

  /* rootGetters（Vuex 根 getter） */
  rootGetters() {
    const self = this;
    if (!this._rootGettersCache) {
      this._rootGettersCache = {
        'mult/get': (name, base, mult, bonus, bl) => HO_MULT.get(name, base, mult, bonus, bl),
        'mult/list': (mod) => Object.keys(HO_MULT.items).filter(n => !mod || HO_MULT.items[n][mod]),
        'currency/value': (key) => HO_CUR.value(key),
        'currency/cap': (key) => HO_CUR.cap(key),
        'currency/values': () => HO_CUR.values,
        'currency/list': (f, type, subtype) => HO_CUR.list(f, type, subtype),
        'currency/canAfford': (price, maxPrice) => HO_CUR.canAfford(price, maxPrice),
        'currency/gainMultName': (feature, name) => 'currency' + capitalize(feature || 'horde') + capitalize(name) + 'Gain',
        'currency/capMultName': (feature, name) => 'currency' + capitalize(feature || 'horde') + capitalize(name) + 'Cap',
        'tag/values': (name) => HO_TAG.values(name),
        'system/getRng': (name, amount) => () => this.rngGen(name, amount ?? 0),
        'system/getStaticRng': (name, seed) => this.rngSeq(name, seed),
        'system/rng': () => this._rng,
        'consumable/priceMultiple': (prices) => this.consumablePriceMultiple(prices),
        'consumable/canAffordMultiple': (prices) => this.consumableCanAfford(prices),
        'consumable/canAfford': (name) => (this.state.consumable?.[name]?.amount ?? 0) > 0,
        'consumable/use': (name) => { const it = this.state.consumable?.[name]; if (it) it.amount = Math.max(0, (it.amount ?? 0) - 1); }
      };
    }
    return this._rootGettersCache;
  },

  buildGetters() {
    const g = {};
    const self = this;
    Object.keys(HO_STORE.getters).forEach(name => {
      Object.defineProperty(g, name, {
        enumerable: true, configurable: true,
        get() { return HO_STORE.getters[name](self.state, g, self._root, self.rootGetters()); }
      });
    });
    this.getters = g;
    HOSTORE.getters = new Proxy({}, {
      get(t, prop) {
        if (typeof prop !== 'string') return undefined;
        if (prop.indexOf('horde/') === 0) return g[prop.slice(6)];
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
      commit: (type, payload, opt) => HOSTORE.commit(type.indexOf('/') > 0 ? type : 'horde/' + type, payload),
      dispatch: (type, payload, opt) => HOSTORE.dispatch(type.indexOf('/') > 0 ? type : 'horde/' + type, payload, opt)
    };
  },

  act(name, payload) {
    try {
      return HO_STORE.actions[name](this.ctx(), payload || {});
    } catch (e) { this.warnings.push('act:' + name + ': ' + e.message); return null; }
  },

  /* consumable（降妖：魔药） */
  consumablePriceMultiple(prices) {
    let price = {};
    for (const [name, qty] of Object.entries(prices || {})) {
      const item = this.state.consumable?.[name];
      if (!item) continue;
      for (const [ck, cv] of Object.entries(item.price || {})) price[ck] = (price[ck] || 0) + cv * qty;
    }
    return { price };
  },
  consumableCanAfford(prices) {
    const { price } = this.consumablePriceMultiple(prices);
    return HO_CUR.canAfford(price);
  },
  consumableGain(p) {
    const name = p.name || p;
    const amt = (typeof p === 'string') ? 1 : (p.amount ?? 1);
    if (!this.state.consumable) this.state.consumable = {};
    if (!this.state.consumable[name]) this.state.consumable[name] = { amount: 0, price: {} };
    this.state.consumable[name].amount += amt;
  },
  consumableUse(p) {
    if (!p) return;
    if (typeof p === 'string') { const it = this.state.consumable?.[p]; if (it) it.amount = Math.max(0, (it.amount ?? 0) - 1); return; }
    for (const [name, qty] of Object.entries(p)) {
      const item = this.state.consumable?.[name];
      if (item) item.amount = Math.max(0, (item.amount ?? 0) - qty);
    }
  },

  /* export the horde module's per-tick logic uses HOSTORE; tick here just wraps HO_MODULE.tick */
  tick(seconds) {
    if (!this.ready) return;
    try { HO_MODULE.tick(seconds); }
    catch (e) { this.warnings.push('tick: ' + e.message); }
  },
  forceTick(seconds) {
    if (!this.ready) return;
    try { HO_MODULE.forceTick(seconds, 0, seconds); }
    catch (e) { this.warnings.push('forceTick: ' + e.message); }
  },

  /* 存档：仅存战斗核心小字段（重型数据由 HO_MODULE.saveGame 决定，这里简化为整存） */
  saveGame() {
    try { return HO_MODULE.saveGame(); }
    catch (e) { this.warnings.push('saveGame: ' + e.message); return {}; }
  },
  afterChange() {}
};

/* ===== 10. boot 桥（供 app.js 调用） ===== */
function HO_BOOT(state) {
  HO_RT.init(state);
  return HO_RT;
}
if (typeof module !== "undefined") module.exports = { HO_RT, HO_BOOT };

/* ===== 注册到跨模块地基（数值/存档不变，仅登记引用） ===== */
if (typeof GB_MODULES !== 'undefined') {
  GB_MODULES.register({
    id: 'horde', name: '降妖', keyPrefix: 'horde', tickSpeed: 1, unlockNeeded: 'hoFeature',
    core: { MULT: HO_MULT, CUR: HO_CUR, STAT: HO_STAT, UNLOCK: HO_UNLOCK, UPG: HO_UPG, RT: HO_RT },
    onAfterLoad: () => {
      try {
        // ho_0 = maxZoneTotal - 1（原 store/horde.js killEnemy 里 dispatch meta/globalLevelPart）
        const stat = HO_STAT.values;
        let maxZone = 0;
        for (const k of Object.keys(stat)) if (k.indexOf('horde_maxZone') === 0 && (stat[k].value || 0) > maxZone) maxZone = stat[k].value || 0;
        GB_META.globalLevelPart('ho_0', Math.max(0, maxZone - 1));
      } catch (e) {}
      try { GB_META.globalLevelPart('ho_1', 0); } catch (e) {} // 战令等级暂 stub
    },
  });
}