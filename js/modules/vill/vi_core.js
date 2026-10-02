/* ============================================================
 * vi_core.js —— 「宗门（village）」模块运行时内核（零依赖、零构建）
 *
 * 作用：为照抄 gooboo village 的 vi_data.js / vi_store.js 提供运行环境。
 *   - 复用 lm_core.js 已经声明的全局工具函数（buildNum/formatNum/getSequence/...）
 *   - 自建 VI_ 前缀的 MULT/CUR/STAT/UNLOCK/UPG/SYSTEM/store，避免与灵脉(m/s)污染
 *   - 数值与公式全部来自 vi_data.js / vi_store.js（即 gooboo 原文）
 *
 * 注意：gooboo 中 village 数据文件的函数里直接引用全局 `store`（Vuex）。
 *   这里我们用 VSTORE 作为等价替身，并在装载时把数据函数中的 `store` 替换为 `VSTORE`。
 * ============================================================ */

/* ===== 0. village 专用工具（gooboo src/js/utils/random.js） ===== */
function weightSelect(array, rnd) {
  rnd = (rnd === undefined) ? Math.random() : rnd;
  let total = 0;
  for (const v of array) total += v;
  let cur = rnd * total;
  for (let i = 0; i < array.length; i++) {
    cur -= array[i];
    if (cur <= 0) return i;
  }
  return array.length - 1;
}
function randomRound(num) {
  const fl = Math.floor(num);
  return (Math.random() < (num - fl)) ? fl + 1 : fl;
}

/* ===== 1. VI_MULT：倍率系统（同 lm_core MULT） ===== */
const VI_MULT = {
  items: {},
  missing: [],
  init(name, o) {
    o = o || {};
    const item = {
      feature: o.feature || 'village',
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

/* ===== 2. VI_CUR：货币 / 资源系统 ===== */
const VI_CUR = {
  defs: {}, values: {}, capByMult: {},
  prefix(key) { return key.split('_')[0]; },
  gainMultName(key) { return 'currency' + key.split('_').map(capitalize).join('') + 'Gain'; },
  capMultName(key) { return 'currency' + key.split('_').map(capitalize).join('') + 'Cap'; },
  init(key, def) {
    def = def || {};
    if (!def.feature) def.feature = 'village';
    if (!def.type) def.type = 'regular';
    def.key = key;
    this.defs[key] = def;
    if (this.values[key] === undefined) this.values[key] = def.value || 0;
    const gm = this.gainMultName(key), cm = this.capMultName(key);
    VI_MULT.init(gm, Object.assign({ feature: def.feature || 'village' }, def.gainMult || {}));
    VI_MULT.init(cm, Object.assign({ feature: def.feature || 'village' }, def.capMult || {}));
    // 只有真正有 capMult 定义的资源才登记到 capByMult，没容量的资源 cap() 返回 Infinity
    if (def.capMult) this.capByMult[cm] = key;
    return def;
  },
  value(key) { return this.values[key] === undefined ? 0 : this.values[key]; },
  cap(key) {
    const def = this.defs[key];
    if (!def) return 0;
    if (!def.capMult && !this.capByMult[this.capMultName(key)]) return Infinity;
    return VI_MULT.get(this.capMultName(key));
  },
  gainMult(key) { return VI_MULT.get(this.gainMultName(key)); },
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
    const feature = o.feature || 'village';
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
    Object.keys(this.defs).forEach(k => { if (k.indexOf((feature||'village') + '_') === 0) this.values[k] = 0; });
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

/* ===== 3. VI_STAT：统计系统 ===== */
const VI_STAT = {
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
      if (k.indexOf((feature||'village') + '_') === 0) this.values[k] = { value: 0, total: 0, max: 0 };
    });
  }
};

/* ===== 4. VI_UNLOCK：解锁系统 ===== */
const VI_UNLOCK = {
  items: {},
  init(id) { if (!this.items[id]) this.items[id] = { init: false, see: false, use: false }; return this.items[id]; },
  unlock(id) { const it = this.init(id); it.init = true; it.see = true; it.use = true; return it; },
  isUnlocked(id) { return !!(this.items[id] && this.items[id].use); },
  isVisible(id) { return !!(this.items[id] && this.items[id].see); }
};

/* ===== 5. VI_UPG：升级项系统（含建筑队列 / 声望 / 高级） ===== */
const VI_UPG = {
  defs: {}, levels: {}, keep: {}, uncapped: {}, skippedEffects: {},
  register(mapName, map, defaultType) {
    if (!map) return 0;
    let n = 0;
    Object.keys(map).forEach(key => {
      const def = map[key];
      if (!def || typeof def !== 'object') return;
      const id = 'village_' + key;
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
  // 建筑队列特有：visible 由 requirement() 决定，建筑不因满级隐藏（可继续建造）
  isVisible(id) {
    const d = this.defs[id];
    if (!d) return false;
    if (d.subfeature !== undefined) {
      const sub = VI_SYSTEM.state.features.village.currentSubfeature;
      if (d.subfeature !== sub) return false;
    }
    return this.requirementMet(id);
  },
  isMaxed(id) { return (this.levels[id] || 0) >= this.cap(id); },
  canAfford(id) {
    if (this.isMaxed(id)) return false;
    try { return VI_CUR.canAfford(this.price(id)); } catch (e) { return false; }
  },
  buy(id) {
    const d = this.defs[id];
    if (!d || this.isMaxed(id)) return false;
    const price = this.price(id);
    if (!VI_CUR.canAfford(price)) return false;
    VI_CUR.spendPrice(price);
    this.levels[id] = (this.levels[id] || 0) + 1;
    this.apply(id);
    return true;
  },
  apply(id) {
    const d = this.defs[id];
    if (!d) return;
    const lvl = this.levels[id] || 0;
    // gooboo: 建筑(type=building)效果持续存在，且通过 currency/housing mult 生效
    d.effect.forEach((eff, k) => {
      const multKey = 'upg_' + id + '_' + k;
      if (lvl <= 0) { VI_SYSTEM.resetEffect({ type: eff.type, name: eff.name, multKey }); return; }
      let value = 0;
      try { value = typeof eff.value === 'function' ? eff.value(lvl) : eff.value; } catch (e) { value = 0; }
      VI_SYSTEM.applyEffect({ type: eff.type, name: eff.name, multKey, value });
    });
  },
  applyAll() { Object.keys(this.defs).forEach(id => { if (this.levels[id] > 0 || this.defs[id].type !== 'building') this.apply(id); }); },
  resetTypes(types) {
    const keepIds = {};
    Object.keys(this.defs).forEach(id => {
      const d = this.defs[id];
      if (d.type !== 'prestige') return;
      const lvl = this.levels[id] || 0;
      d.effect.forEach(eff => {
        if (eff.type !== 'keepUpgrade') return;
        let v = 0;
        try { v = typeof eff.value === 'function' ? eff.value(lvl) : eff.value; } catch (e) { v = 0; }
        if (v) keepIds[eff.name] = true;
      });
    });
    Object.keys(this.defs).forEach(id => {
      const d = this.defs[id];
      if (types.indexOf(d.type) < 0) return;
      if (d.persistent) return;                        /* gooboo: 永久建筑 / 永久升级不随飞升重置 */
      if (d.type === 'regular' && keepIds[id]) return;
      this.levels[id] = 0;
      this.apply(id);
    });
  },
  list(type) { return Object.keys(this.defs).filter(id => !type || this.defs[id].type === type); }
};

/* ===== 6. VI_SYSTEM：效果系统 ===== */
const VI_SYSTEM = {
  state: { features: { village: { currentSubfeature: 0 } } },
  effectLog: {},
  applyEffect(o) {
    if (!o) return;
    const value = typeof o.value === 'function' ? o.value() : o.value;
    switch (o.type) {
      case 'mult': VI_MULT.setMult({ name: o.name, key: o.multKey, value }); break;
      case 'base': VI_MULT.setBase({ name: o.name, key: o.multKey, value }); break;
      case 'bonus': VI_MULT.setBonus({ name: o.name, key: o.multKey, value }); break;
      case 'unlock': VI_UNLOCK.unlock(o.name); break;
      case 'keepUpgrade': if (value) VI_UPG.keep[o.name] = true; else delete VI_UPG.keep[o.name]; break;
      case 'uncapUpgrade': if (value) VI_UPG.uncapped[o.name] = true; else delete VI_UPG.uncapped[o.name]; break;
      case 'setMin': VI_MULT.setMin({ name: o.name, value }); break;
      case 'setMax': VI_MULT.setMax({ name: o.name, value }); break;
      case 'villageJob': {
        const sj = VSTORE.state && VSTORE.state.village && VSTORE.state.village.job;
        if (sj && sj[o.name]) sj[o.name].max = value;
        break;
      }
      case 'villageCraft': {
        const sc = VSTORE.state && VSTORE.state.village && VSTORE.state.village.crafting;
        if (sc && sc[o.name]) sc[o.name].unlocked = !!value;
        break;
      }
      default: VI_UPG.skippedEffects[o.type] = (VI_UPG.skippedEffects[o.type] || 0) + 1; break;
    }
  },
  resetEffect(o) {
    if (!o) return;
    if (o.type === 'mult' || o.type === 'base' || o.type === 'bonus') {
      VI_MULT.removeKeyAnywhere(o.multKey);
    } else if (o.type === 'keepUpgrade') {
      delete VI_UPG.keep[o.name];
    } else if (o.type === 'uncapUpgrade') {
      delete VI_UPG.uncapped[o.name];
    } else if (o.type === 'villageJob') {
      const sj = VSTORE.state && VSTORE.state.village && VSTORE.state.village.job;
      if (sj && sj[o.name]) sj[o.name].max = (sj[o.name].maxDefault ?? 0);
    }
  }
};

/* ===== 7. store / commit / dispatch（Vuex 极小替身） ===== */
/* 真值数据（job/offering/policy/crafting 运行时对象）由 VI_RT.init 注入 */
const VSTORE = {
  state: null,       // 只读引用：{ village, currency, stat, unlock, upgrade, system }
  _v: null,
  getters: {},
  _audit: { commits: {}, dispatches: {}, unknown: {} },

  commit(type, payload) {
    this._audit.commits[type] = (this._audit.commits[type] || 0) + 1;
    const s = this._v;
    const p = payload || {};
    switch (type) {
      case 'village/updateKey': s[p.key] = p.value; break;
      case 'village/updateSubkey': if (s[p.key] && s[p.key][p.name] !== undefined) s[p.key][p.name][p.subkey] = p.value; break;
      case 'village/updateJobKey': if (s.job[p.name]) s.job[p.name][p.key] = p.value; break;
      case 'village/updateOfferingKey': if (s.offering[p.name]) s.offering[p.name][p.key] = p.value; break;
      case 'village/updatePolicyKey': if (s.policy[p.name]) s.policy[p.name][p.key] = p.value; break;
      case 'village/initJob': s.job[p.name] = { amount: 0, max: p.max ?? null, maxDefault: p.max ?? null, needed: p.needed ?? 1, rewards: p.rewards ?? [] }; break;
      case 'village/initOffering': s.offering[p.name] = { unlock: p.unlock ?? null, offeringBought: 0, upgradeBought: 0, cost: p.cost ?? (() => 1), amount: p.amount ?? 1, effect: p.effect ?? 1, hasMultiplier: p.hasMultiplier ?? true }; break;
      case 'village/initPolicy': s.policy[p.name] = { value: 0, mult: p.mult, icon: p.icon ?? 'mdi-star', effect: p.effect ?? [] }; break;
      case 'village/initCrafting':
        s.crafting[p.name] = {
          icon: p.icon ?? 'mdi-square', color: p.color ?? 'grey',
          price: p.price ?? {}, baseValue: p.value ?? 10, value: p.value ?? 10,
          baseTimeNeeded: p.timeNeeded ?? 60, timeNeeded: p.timeNeeded ?? 60,
          milestone: p.milestone ?? {}, prio: p.prio ?? 0, isSpecial: p.isSpecial ?? false,
          effect: p.effect ?? [], unlocked: false, isCrafting: false, isSelling: false,
          sellPrice: p.value ?? 10, cacheSellChance: 0, progress: 0, owned: 0, crafted: 0
        }; break;
      case 'stat/add': VI_STAT.add('village_' + p.name, p.value); break;
      case 'stat/increaseTo': VI_STAT.increaseTo('village_' + p.name, p.value); break;
      case 'stat/reset': VI_STAT.reset(p); break;
      case 'system/updateSubfeature': VI_SYSTEM.state.features.village.currentSubfeature = p.value; break;
      case 'system/nextRng': break;
      default: this._audit.unknown['commit:' + type] = (this._audit.unknown['commit:' + type] || 0) + 1; break;
    }
  },

  dispatch(type, payload, opt) {
    this._audit.dispatches[type] = (this._audit.dispatches[type] || 0) + 1;
    const p = payload || {};
    switch (type) {
      case 'currency/gain': VI_CUR.gain(p); break;
      case 'currency/spend': {
        const key = (p.feature || 'village') + '_' + p.name;
        if (!VI_CUR.spend(key, p.amount)) console.warn('[vi] currency/spend 失败：' + key);
        break;
      }
      case 'currency/reset': VI_CUR.reset(p); break;
      case 'currency/spendAll': VI_CUR.spendAll((p.feature || 'village') + '_' + p.name); break;
      case 'mult/setBase': VI_MULT.setBase(p); break;
      case 'mult/setMult': VI_MULT.setMult(p); break;
      case 'mult/setBonus': VI_MULT.setBonus(p); break;
      case 'mult/removeKey': VI_MULT.removeKeyAnywhere(p.key); break;
      case 'stat/add': VI_STAT.add('village_' + p.name, p.value); break;
      case 'stat/increaseTo': VI_STAT.increaseTo('village_' + p.name, p.value); break;
      case 'stat/reset': VI_STAT.reset(p); break;
      case 'system/applyEffect': VI_SYSTEM.applyEffect(p); break;
      case 'system/resetEffect': VI_SYSTEM.resetEffect(p); break;
      case 'unlock/unlock': VI_UNLOCK.unlock(p); break;
      case 'system/updateSubfeature': VI_SYSTEM.state.features.village.currentSubfeature = p.value; break;
      case 'system/getRng': return () => Math.random();
      // village 专属 actions（委托 vi_store.js）
      case 'village/addWorker': return VI_RT.act('addWorker', p);
      case 'village/removeWorker': return VI_RT.act('removeWorker', p);
      case 'village/addMaxWorker': return VI_RT.act('addMaxWorker', p);
      case 'village/removeMaxWorker': return VI_RT.act('removeMaxWorker', p);
      case 'village/setWorkerCount': return VI_RT.act('setWorkerCount', p);
      case 'village/prestige': return VI_RT.act('prestige', p);
      case 'village/buyOffering': return VI_RT.act('buyOffering', p);
      case 'village/upgradeOffering': return VI_RT.act('upgradeOffering', p);
      case 'village/applyJobEffect': return VI_RT.act('applyJobEffect', p);
      case 'village/applyAllJobs': return VI_RT.act('applyAllJobs', p);
      case 'village/applyOfferingEffect': return VI_RT.act('applyOfferingEffect', p);
      case 'village/applyPolicyEffect': return VI_RT.act('applyPolicyEffect', p);
      case 'village/addPolicy': return VI_RT.act('addPolicy', p);
      case 'village/removePolicy': return VI_RT.act('removePolicy', p);
      case 'village/getLootDrops': return VI_RT.act('getLootDrops', p);
      case 'village/applyMilestoneEffects': return VI_RT.act('applyMilestoneEffects', p);
      case 'village/applyMilestoneGlobalLevel': return VI_RT.act('applyMilestoneGlobalLevel', p);
      case 'village/applySpecialCraftEffects': return VI_RT.act('applySpecialCraftEffects', p);
      case 'upgrade/tickQueue': return VI_RT.tickQueue(p);
      case 'upgrade/enqueue': return VI_RT.enqueue(p);
      case 'upgrade/dequeue': return VI_RT.dequeue(p);
      case 'upgrade/reset': VI_UPG.resetTypes(p.type ? [p.type] : ['regular']); break;
      case 'upgrade/updateVillageStats': break;
      // 无关子系统占位：保证照抄的 action 不抛错
      case 'consumable/canAfford': return () => true;
      case 'consumable/canAffordMultiple': return true;
      case 'consumable/gain': break;
      case 'consumable/use': break;
      case 'consumable/useMultiple': break;
      case 'card/activateCards': break;
      case 'meta/globalLevelPart': break;
      case 'note/find': break;
      case 'school/updateBookEffects': break;
      default:
        if (type.indexOf('village/') === 0 && VI_STORE.actions[type.slice(8)]) {
          VI_STORE.actions[type.slice(8)](VI_RT.ctx(), p);
        } else {
          this._audit.unknown['dispatch:' + type] = (this._audit.unknown['dispatch:' + type] || 0) + 1;
        }
        break;
    }
  }
};

/* ===== 8. VI_RT：宗门模块运行时 ===== */
const VI_RT = {
  MULT: VI_MULT, CUR: VI_CUR, STAT: VI_STAT, UNLOCK: VI_UNLOCK, UPG: VI_UPG, SYSTEM: VI_SYSTEM,
  store: VSTORE,
  ready: false, warnings: [],
  state: null, getters: null,
  _root: null,
  jobOrder: null,

  init(state) {
    this.state = state;
    state.stat = state.stat || {};
    state.unlock = state.unlock || {};
    state.currencyVals = state.currencyVals || {};
    state.upgradeLevels = state.upgradeLevels || {};
    state.subfeature = state.subfeature || 0;
    state.job = state.job || {};
    state.offering = state.offering || {};
    state.policy = state.policy || {};
    state.crafting = state.crafting || {};
    if (state.explorerProgress === undefined) state.explorerProgress = 0;
    if (state.offeringGen === undefined) state.offeringGen = 0;

    VI_STAT.values = state.stat;
    VI_UNLOCK.items = state.unlock;
    VI_CUR.values = state.currencyVals;
    VI_UPG.levels = state.upgradeLevels;
    VI_SYSTEM.state.features.village.currentSubfeature = state.subfeature;

    VSTORE._v = state;
    VSTORE.state = {
      village: state,
      stat: state.stat,
      unlock: state.unlock,
      currency: this._currencyProxy(),
      upgrade: {},
      system: VI_SYSTEM.state
    };
    this._root = VSTORE.state;

    const guard = (label, fn) => { try { fn(); } catch (e) { this.warnings.push(label + ': ' + e.message); } };

    guard('stat', () => Object.keys(VI_GOOBOO.stat || {}).forEach(k => VI_STAT.ensure('village_' + k)));
    guard('mult', () => Object.keys(VI_GOOBOO.mult || {}).forEach(k => VI_MULT.init(k, VI_GOOBOO.mult[k])));
    guard('unlock', () => (VI_GOOBOO.unlock || []).forEach(id => VI_UNLOCK.init(id)));
    guard('currency', () => {
      Object.keys(VI_GOOBOO.currency).forEach(k => {
        const def = VI_GOOBOO.currency[k];
        VI_CUR.init('village_' + k, Object.assign({ feature: 'village' }, def));
      });
    });
    guard('upgrade', () => this._registerUpgrades());
    guard('init', () => this._initSubstate());
    guard('multGroup', () => this._linkMultGroups());
    guard('getters', () => this.buildGetters());
    guard('applyAll', () => VI_UPG.applyAll());

    this.ready = true;
    return this;
  },

  _registerUpgrades() {
    // building 转 queue 型升级
    const upgradeBuilding = {};
    Object.keys(VI_GOOBOO.building || {}).forEach(k => {
      upgradeBuilding[k] = Object.assign({}, VI_GOOBOO.building[k], { mode: 'queue', type: 'building' });
    });
    VI_UPG.register('building', upgradeBuilding, 'building');
    VI_UPG.register('upgrade', VI_GOOBOO.upgrade, 'regular');
    VI_UPG.register('upgrade2', VI_GOOBOO.upgrade2, 'regular');
    VI_UPG.register('upgradePrestige', VI_GOOBOO.upgradePrestige, 'prestige');
    VI_UPG.register('upgradePremium', VI_GOOBOO.upgradePremium, 'premium');
  },

  _initSubstate() {
    const init = VI_GOOBOO.init || {};
    if (init.job) Object.keys(init.job).forEach(k => VSTORE.commit('village/initJob', Object.assign({ name: k }, init.job[k])));
    if (init.offering) Object.keys(init.offering).forEach(k => VSTORE.commit('village/initOffering', Object.assign({ name: k }, init.offering[k])));
    if (init.policy) Object.keys(init.policy).forEach(k => VSTORE.commit('village/initPolicy', Object.assign({ name: k }, init.policy[k])));
    if (init.crafting) Object.keys(init.crafting).forEach(k => VSTORE.commit('village/initCrafting', Object.assign({ name: k }, init.crafting[k])));
  },

  _linkMultGroups() {
    (VI_GOOBOO.multGroup || []).forEach(g => {
      let members = [];
      if (g.name === 'currencyGain') members = VI_CUR.keysOfSubtype(g.subtype).map(k => VI_CUR.gainMultName(k));
      else if (g.name === 'currencyCap') members = VI_CUR.keysOfSubtype(g.subtype).map(k => VI_CUR.capMultName(k));
      VI_MULT.linkGroup(g.mult, members);
    });
    Object.keys(VI_GOOBOO.mult || {}).forEach(k => {
      const g = VI_GOOBOO.mult[k].group;
      if (g && g.length) VI_MULT.linkGroup(k, g);
    });
  },

  _currencyProxy() {
    const self = this;
    return new Proxy({}, {
      get(t, prop) {
        if (typeof prop !== 'string' || prop === 'toJSON') return undefined;
        const def = VI_CUR.defs[prop];
        if (!def) return undefined;
        return { value: VI_CUR.value(prop), cap: VI_CUR.cap(prop), unlock: def.unlock, display: def.display, subtype: def.subtype };
      }
    });
  },

  /* getters / ctx（Vuex 等价） */
  buildGetters() {
    const g = {};
    const self = this;
    Object.keys(VI_STORE.getters).forEach(name => {
      Object.defineProperty(g, name, {
        enumerable: true, configurable: true,
        get() { return VI_STORE.getters[name](self.state, g, self._root, self.rootGetters()); }
      });
    });
    this.getters = g;
    VSTORE.getters = new Proxy({}, {
      get(t, prop) {
        if (typeof prop !== 'string') return undefined;
        if (prop.indexOf('village/') === 0) return g[prop.slice(8)];
        return self.rootGetters()[prop];
      }
    });
    return g;
  },

  rootGetters() {
    const self = this;
    if (!this._rootGettersCache) {
      this._rootGettersCache = {
        'mult/get': (name, base, mult, bonus) => VI_MULT.get(name, base, mult, bonus),
        'mult/list': (mod) => Object.keys(VI_MULT.items).filter(n => !mod || VI_MULT.items[n][mod]),
        'currency/value': (key) => VI_CUR.value(key),
        'currency/cap': (key) => VI_CUR.cap(key),
        'currency/values': () => VI_CUR.values,
        'currency/list': (feature, type, subtype) => VI_CUR.list(feature, type, subtype),
        'currency/gainMultName': (feature, name) => VI_CUR.gainMultName(feature + '_' + name),
        'currency/capMultName': (feature, name) => VI_CUR.capMultName(feature + '_' + name),
        'currency/canAfford': (price, maxPrice) => VI_CUR.canAfford(price, maxPrice),
        'system/getRng': () => () => Math.random(),
        'village/employed': () => self.getters.employed,
        'village/joyGainBase': () => self.getters.joyGainBase,
        'village/offeringPerSecond': () => self.getters.offeringPerSecond
      };
    }
    return this._rootGettersCache;
  },

  ctx() {
    const self = this;
    return {
      state: this.state,
      getters: this.getters,
      rootState: this._root,
      rootGetters: this.rootGetters(),
      commit: (type, payload, opt) => VSTORE.commit(type.indexOf('/') > 0 ? type : 'village/' + type, payload),
      dispatch: (type, payload, opt) => VSTORE.dispatch(type.indexOf('/') > 0 ? type : 'village/' + type, payload, opt)
    };
  },

  /* 委托到 vi_store actions */
  act(name, payload) {
    try {
      return VI_STORE.actions[name](this.ctx(), payload || {});
    } catch (e) { this.warnings.push('act:' + name + ': ' + e.message); return null; }
  },

  /* ===== 建筑队列（升级队列）简化实现 ===== */
  _q() {
    if (!this.state.buildingQueue) this.state.buildingQueue = [];
    return this.state.buildingQueue;
  },
  enqueue(p) {
    // p: {upgradeId}
    const q = this._q();
    if (q.indexOf(p.upgradeId) < 0) {
      q.push(p.upgradeId);
      this.state.queueKey = 'village_building';
    }
    return true;
  },
  dequeue(p) {
    const q = this._q();
    const i = q.indexOf(p.upgradeId);
    if (i >= 0) q.splice(i, 1);
    return true;
  },
  tickQueue(p) {
    // p: {key, seconds}
    const speed = VI_MULT.get('queueSpeedVillageBuilding');
    let secs = (p.seconds || 0) * (speed || 0);
    const q = this._q();
    if (q.length === 0 || secs <= 0) return;
    let budget = secs;
    while (q.length > 0 && budget > 0) {
      const headId = q[0];
      const d = VI_UPG.defs[headId];
      if (!d) { q.shift(); continue; }
      const cost = (typeof d.timeNeeded === 'function')
        ? this.safeCall(() => d.timeNeeded(this.UPG.levels[headId] || 0))
        : (d.timeNeeded || 0);
      if (!cost || cost <= 0) { q.shift(); continue; }
      const cur = this.state._qProgress = this.state._qProgress || {};
      let need = cur[headId] === undefined ? cost : cur[headId];
      const used = Math.min(budget, need);
      need -= used;
      budget -= used;
      if (need <= 0) {
        // 建成：提升等级
        if (!VI_UPG.isMaxed(headId)) {
          this.levelsUpgrade(headId);
        }
        delete cur[headId];
        q.shift();
      } else {
        cur[headId] = need;
      }
    }
    if (budget < secs) this.afterChange();
  },
  levelsUpgrade(id) {
    const d = VI_UPG.defs[id];
    if (!d) return;
    const price = this._byIdPrice(id);
    // 建筑建造在队尾完工时以(已持有数量)为等级，消耗改为队列开始时已扣：这里简单处理为不额外扣资源
    VI_UPG.levels[id] = (VI_UPG.levels[id] || 0) + 1;
    VI_UPG.apply(id);
  },
  _byIdPrice(id) { return VI_UPG.price(id); },

  /* 建筑「开始建造」入口（UI 调用）：加入队列 + 扣除第 n 级价格 */
  startBuilding(bKey) {
    const id = 'village_' + bKey;
    const d = VI_UPG.defs[id];
    if (!d) return false;
    if (this.state.buildingQueue && this.state.buildingQueue.indexOf(id) >= 0) return false;
    const price = VI_UPG.price(id);
    if (!VI_CUR.canAfford(price)) return false;
    VI_CUR.spendPrice(price);
    this.enqueue({ upgradeId: id });
    this.afterChange();
    return true;
  },

  /* ===== tick（一次逻辑秒） ===== */
  tick(seconds) {
    if (!this.ready) return;
    try { VI_TICK.call(this.ctx(), seconds); }
    catch (e) { this.warnings.push('tick: ' + e.message); }
    // 检查飞升解锁
    if (!VI_UNLOCK.isUnlocked('villagePrestige') && VI_STAT.get('village_faith') >= 50) {
      VI_UNLOCK.unlock('villagePrestige');
    }
    // 检查工坊编制解锁（已可用的建筑等级合计 ≥ 3）
    if (!VI_UNLOCK.isUnlocked('villageCraftingSubfeature')) {
      let total = 0;
      for (const id in VI_UPG.levels) {
        const d = VI_UPG.defs[id];
        if (d && d.type === 'building') total += VI_UPG.levels[id] || 0;
      }
      if (total >= 3) VI_UNLOCK.unlock('villageCraftingSubfeature');
    }
  },
  offlineTick(elapsedMs) {
    if (!this.ready) return;
    let left = elapsedMs / 1000;
    const chunk = 3600;
    while (left > 0) { const step = Math.min(left, chunk); this.tick(step); left -= step; }
    this.afterChange();
  },

  /* ===== 对外操作 ===== */
  buyUpgrade(id) {
    const ok = VI_UPG.buy(id);
    if (ok) this.afterChange();
    return ok;
  },
  startBuilding2(bKey) { return this.startBuilding(bKey); },
  addWorker(jobName) { return this.act('addWorker', jobName); },
  removeWorker(jobName) { return this.act('removeWorker', jobName); },
  addMaxWorker(jobName) { return this.act('addMaxWorker', jobName); },
  removeMaxWorker(jobName) { return this.act('removeMaxWorker', jobName); },
  buyOffering(name) { this.act('buyOffering', name); this.afterChange(); },
  upgradeOffering(name) { this.act('upgradeOffering', name); this.afterChange(); },
  addPolicy(name) { this.act('addPolicy', name); this.afterChange(); },
  removePolicy(name) { this.act('removePolicy', name); this.afterChange(); },
  toggleCrafting(key, mode) {
    const c = this.state.crafting[key];
    if (!c) return;
    if (mode === 'craft') c.isCrafting = !c.isCrafting;
    else if (mode === 'sell') c.isSelling = !c.isSelling;
    this.afterChange();
  },
  prestige(subfeature) { this.act('prestige', subfeature); VI_UPG.resetTypes(['regular']); VI_UPG.resetTypes(['building']); this.afterChange(); },
  switchSubfeature(idx) {
    VI_SYSTEM.state.features.village.currentSubfeature = idx;
    this.state.subfeature = idx;
    this.afterChange();
  },
  afterChange() { VI_UPG.applyAll(); },
  safeCall(fn, d) { try { const v = fn(); return (v === undefined || v === null) ? d : v; } catch (e) { return d; } }
};

/* ===== 注册到跨模块地基（数值/存档不变，仅登记引用） ===== */
if (typeof GB_MODULES !== 'undefined') {
  GB_MODULES.register({
    id: 'vill', name: '宗门', keyPrefix: 'village', tickSpeed: 1, unlockNeeded: 'villFeature',
    core: { MULT: VI_MULT, CUR: VI_CUR, STAT: VI_STAT, UNLOCK: VI_UNLOCK, UPG: VI_UPG, RT: VI_RT },
    onAfterLoad: () => {
      try {
        // village_0 = 总住房量（UPG 里各建筑的住房贡献合计）
        let housing = 0;
        const stat = VI_STAT.values;
        for (const k of Object.keys(stat)) if (k.indexOf('village_maxBuilding_') === 0) housing += (stat[k] && stat[k].value) || 0;
        GB_META.globalLevelPart('vill_0', housing);
      } catch (e) {}
      try { GB_META.globalLevelPart('vill_1', 0); } catch (e) {} // 工坊 milestone 暂 stub
    },
  });
}

/* ===== 9. VI_TICK：主循环（照抄 gooboo modules/village.js tick） ===== */
function VI_TICK(seconds) {
  VSTORE.commit('stat/add', { name: 'timeSpent', value: seconds });
  let diffs = {};
  VSTORE.getters['currency/list']('village', 'regular').filter(e => !['village_coin', 'village_joy'].includes(e)).forEach(currency => {
    const gain = VSTORE.getters['mult/get'](VSTORE.getters['currency/gainMultName'](...currency.split('_')));
    if (gain > 0) {
      if (diffs[currency] === undefined) diffs[currency] = 0;
      diffs[currency] += gain * seconds;
    }
  });

  // ↓ 主资源产出 → 不分 subfeature，永远跑（gooboo 原版 tick 行为）
  for (const c in diffs) {
    VSTORE.dispatch('currency/gain', { feature: 'village', name: c, amount: diffs[c] });
  }

  // 建筑队列 tick — gooboo 原版永久跑，不分 subfeature
  VSTORE.dispatch('upgrade/tickQueue', { key: 'village_building', seconds: seconds * VSTORE.getters['mult/get']('queueSpeedVillageBuilding') });

  if (VI_SYSTEM.state.features.village.currentSubfeature === 0) {
    const happiness = VSTORE.getters['mult/get']('villageHappiness');
    const offeringGain = VSTORE.getters['village/offeringPerSecond'];
    if (offeringGain > 0) {
      let newOffering = VI_RT.state.offeringGen + offeringGain * seconds;
      if (newOffering > 0) {
        VSTORE.dispatch('currency/gain', { name: 'offering', amount: Math.floor(newOffering) });
        newOffering -= Math.floor(newOffering);
      }
      VSTORE.commit('village/updateKey', { key: 'offeringGen', value: newOffering });
    }

    const joyGain = VSTORE.getters['village/joyGainBase'];
    if (joyGain > 0) {
      VSTORE.dispatch('currency/gain', { name: 'joy', gainMult: true, amount: joyGain * seconds });
    }
    if (happiness <= VILLAGE_MIN_HAPPINESS) {
      VSTORE.commit('stat/increaseTo', { name: 'minHappiness', value: 1 });
    }

    const lootGain = VSTORE.getters['mult/get']('villageLootGain');
    if (lootGain > 0) {
      let newLoot = VI_RT.state.explorerProgress + seconds * lootGain / SECONDS_PER_HOUR;
      if (newLoot >= 1) {
        const lootDrops = Math.floor(newLoot);
        VSTORE.dispatch('village/getLootDrops', lootDrops);
        newLoot -= lootDrops;
      }
      VSTORE.commit('village/updateKey', { key: 'explorerProgress', value: newLoot });
      VSTORE.dispatch('unlock/unlock', 'villageLoot');
    }

    VSTORE.commit('stat/increaseTo', { name: 'highestPower', value: VSTORE.getters['mult/get']('villagePower') });
  } else if (VI_SYSTEM.state.features.village.currentSubfeature === 1) {
    for (let p = 0; p < 2; p++) {
      for (const [key, elem] of Object.entries(VI_RT.state.crafting)) {
        if (elem.isCrafting && elem.prio === p) {
          let newProgress = elem.progress + seconds / elem.timeNeeded;
          const payments = Math.ceil(newProgress) - Math.ceil(elem.progress);
          if (payments > 0) {
            let maxAfford = payments;
            for (const [currency, value] of Object.entries(elem.price)) {
              const split = currency.split('_');
              const valFn = (typeof value === 'function') ? value : () => value;
              if (elem.isSpecial) {
                let newMaxAfford = 0, accumulatedPrice = 0;
                while (newMaxAfford < maxAfford) {
                  accumulatedPrice += valFn(elem.owned + newMaxAfford);
                  if (split[0] === 'craft') {
                    if (VI_RT.state.crafting[split[1]].owned < accumulatedPrice) break;
                  } else {
                    if (VSTORE.state.currency[currency].cap !== null && VSTORE.state.currency[currency].cap < valFn(elem.owned + newMaxAfford)) break;
                    if ((VSTORE.state.currency[currency].value + (diffs[currency] ?? 0)) < accumulatedPrice) break;
                  }
                  newMaxAfford++;
                }
                maxAfford = newMaxAfford;
              } else {
                const val = valFn();
                if (split[0] === 'craft') {
                  maxAfford = Math.min(Math.floor(VI_RT.state.crafting[split[1]].owned / val), maxAfford);
                } else {
                  if (VSTORE.state.currency[currency].cap !== null && VSTORE.state.currency[currency].cap < val) maxAfford = 0;
                  maxAfford = Math.min(Math.floor((VSTORE.state.currency[currency].value + (diffs[currency] ?? 0)) / val), maxAfford);
                }
              }
            }
            if (maxAfford > 0) {
              for (const [currency, value] of Object.entries(elem.price)) {
                const split = currency.split('_');
                const valFn = (typeof value === 'function') ? value : () => value;
                let priceValue = 0;
                if (elem.isSpecial) { for (let i = 0; i < maxAfford; i++) priceValue += valFn(elem.owned + i); }
                else priceValue = valFn() * maxAfford;
                if (split[0] === 'craft') {
                  VSTORE.commit('village/updateSubkey', { key: 'crafting', name: split[1], subkey: 'owned', value: VI_RT.state.crafting[split[1]].owned - priceValue });
                } else {
                  if (diffs[currency] === undefined) diffs[currency] = 0;
                  diffs[currency] -= priceValue;
                }
              }
            }
            if (maxAfford < payments) newProgress = maxAfford + Math.ceil(elem.progress);
          }
          if (newProgress >= 1) {
            const made = Math.floor(newProgress);
            VSTORE.commit('village/updateSubkey', { key: 'crafting', name: key, subkey: 'owned', value: elem.owned + made });
            VSTORE.commit('village/updateSubkey', { key: 'crafting', name: key, subkey: 'crafted', value: elem.crafted + made });
            if (elem.isSpecial) VSTORE.dispatch('village/applySpecialCraftEffects', key);
            else { VSTORE.dispatch('village/applyMilestoneEffects', key); VSTORE.dispatch('village/applyMilestoneGlobalLevel'); }
            newProgress -= made;
          }
          VSTORE.commit('village/updateSubkey', { key: 'crafting', name: key, subkey: 'progress', value: newProgress });
        }
        if (elem.isSelling && elem.prio === p && elem.sellPrice > 0 && elem.owned > 0) {
          const sold = Math.min(randomRound(seconds * elem.cacheSellChance), elem.owned);
          if (sold > 0) {
            VSTORE.dispatch('currency/gain', { name: 'copperCoin', gainMult: true, amount: sold * elem.sellPrice });
            VSTORE.commit('village/updateSubkey', { key: 'crafting', name: key, subkey: 'owned', value: elem.owned - sold });
          }
        }
      }
    }
  }

  // Apply currency diffs
  for (const [name, value] of Object.entries(diffs)) {
    const split = name.split('_');
    if (value > 0) VSTORE.dispatch('currency/gain', { feature: split[0], name: split[1], amount: value });
    else if (value < 0) VSTORE.dispatch('currency/spend', { feature: split[0], name: split[1], amount: -value });
  }

  // 税收：食物换 coin — gooboo 原版永久跑，不分 subfeature
  const taxpayers = VSTORE.getters['mult/get']('villageTaxRate') * VSTORE.getters['village/employed'];
  if (taxpayers > 0) {
    VSTORE.getters['currency/list']('village', 'regular', 'food').forEach(foodName => {
      const food = foodName.split('_')[1];
      const foodConsumed = Math.min(taxpayers * seconds, VSTORE.getters['currency/value']('village_' + food));
      if (foodConsumed > 0) {
        VSTORE.dispatch('currency/spend', { feature: 'village', name: food, amount: foodConsumed });
        VSTORE.dispatch('currency/gain', { feature: 'village', name: 'coin', gainMult: true, amount: foodConsumed * VILLAGE_COINS_PER_FOOD });
      }
    });
  }
}

/* ===== 10. village 常量（照抄 gooboo constants.js） ===== */
const VILLAGE_COINS_PER_FOOD = 0.25;
const VILLAGE_JOY_MIN_HAPPINESS = 1.25;
const VILLAGE_JOY_PER_HAPPINESS = 0.2;
const VILLAGE_JOY_HAPPINESS_REDUCTION = 1.2;
const VILLAGE_MIN_HAPPINESS = 0.01;
const VILLAGE_OFFERING_PASSIVE_GAIN = 0.02;
const VILLAGE_OFFERING_PRICE_INCREMENT = 1.15;
const VILLAGE_OFFERING_MULT_EFFECT = 1.05;
/* SECONDS_PER_HOUR / SECONDS_PER_DAY 已由 lm_data.js 在全局声明，此处复用，不重复声明 */