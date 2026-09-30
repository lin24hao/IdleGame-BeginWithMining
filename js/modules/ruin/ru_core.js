/* ============================================================
 * ru_core.js —— 「秘境（ruin）」模块运行时内核（零依赖、零构建）
 *
 * 本文件为秘境模块的运行时内核：MULT / CUR / STAT / UNLOCK / UPG / RT 六个
 * 子系统 + 注册契约，并负责把 RU_STORE（state/getters/actions）与 RU_SIM
 * （派遣模拟）接到统一 tick 上。
 *
 * 玩法口径：只有「派遣 → 等待归来」两阶段，无局内概念、无过程呈现。
 * 一次派遣的全部事件流在【派遣瞬间】由 RU_SIM 一次算完并写入存档，
 * idle tick 只推进模块时钟并把到期派遣转入「归来待收」——
 * 因此在线与离线结算完全一致，不另建离线逻辑。
 *
 * key 前缀统一为 ruin_（与注册表 keyPrefix='ruin' 一致）；本模块自闭环，
 * 不引用、不发放其它模块的货币 / 统计。
 * ============================================================ */

/* ===== 1. RU_MULT：倍率系统（写法同 FA_MULT） ===== */
const RU_MULT = {
  items: {},
  missing: [],
  init(name, o) {
    o = o || {};
    const item = {
      feature: o.feature || 'ruin',
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
      ['baseValues', 'multValues', 'bonusValues'].forEach(bagName => {
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

/* ===== 2. RU_CUR：货币 / 资源系统（写法同 FA_CUR） ===== */
const RU_CUR = {
  defs: {}, values: {}, capByMult: {}, currencyMults: {},
  prefix(key) { return key.split('_')[0]; },
  gainMultName(key) { return 'currency' + key.split('_').map(capitalize).join('') + 'Gain'; },
  capMultName(key) { return 'currency' + key.split('_').map(capitalize).join('') + 'Cap'; },
  init(key, def) {
    def = def || {};
    if (!def.feature) def.feature = 'ruin';
    if (!def.type) def.type = 'regular';
    def.key = key;
    this.defs[key] = def;
    if (this.values[key] === undefined) this.values[key] = def.value || 0;
    const gm = this.gainMultName(key), cm = this.capMultName(key);
    RU_MULT.init(gm, Object.assign({ feature: def.feature || 'ruin' }, def.gainMult || {}));
    RU_MULT.init(cm, Object.assign({ feature: def.feature || 'ruin' }, def.capMult || {}));
    if (def.capMult) this.capByMult[cm] = key;
    if (def.currencyMult) this.currencyMults[key] = def.currencyMult;
    return def;
  },
  value(key) { return this.values[key] === undefined ? 0 : this.values[key]; },
  cap(key) {
    const def = this.defs[key];
    if (!def) return 0;
    if (!def.capMult && !this.capByMult[this.capMultName(key)]) return Infinity;
    return RU_MULT.get(this.capMultName(key));
  },
  gainMult(key) { return RU_MULT.get(this.gainMultName(key)); },
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
    const feature = o.feature || 'ruin';
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
    Object.keys(this.defs).forEach(k => { if (k.indexOf((feature || 'ruin') + '_') === 0) this.values[k] = 0; });
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

/* ===== 3. RU_STAT：统计系统 ===== */
const RU_STAT = {
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
      if (k.indexOf((feature || 'ruin') + '_') === 0) this.values[k] = { value: 0, total: 0, max: 0 };
    });
  }
};

/* ===== 4. RU_UNLOCK：解锁系统 ===== */
const RU_UNLOCK = {
  items: {},
  init(id) { if (!this.items[id]) this.items[id] = { init: false, see: false, use: false }; return this.items[id]; },
  unlock(id) { const it = this.init(id); it.init = true; it.see = true; it.use = true; return it; },
  isUnlocked(id) { return !!(this.items[id] && this.items[id].use); },
  isVisible(id) { return !!(this.items[id] && this.items[id].see); }
};

/* ===== 5. RU_UPG：升级项系统（写法同 FA_UPG，去掉 farm 专属 SYSTEM 层） ===== */
const RU_UPG = {
  defs: {}, levels: {}, keep: {}, uncapped: {}, skippedEffects: {},
  register(mapName, map, defaultType) {
    if (!map) return 0;
    let n = 0;
    Object.keys(map).forEach(key => {
      const def = map[key];
      if (!def || typeof def !== 'object') return;
      const id = 'ruin_' + key;
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
    try { return RU_CUR.canAfford(this.price(id)); } catch (e) { return false; }
  },
  buy(id) {
    const d = this.defs[id];
    if (!d || this.isMaxed(id)) return false;
    const price = this.price(id);
    if (!RU_CUR.canAfford(price)) return false;
    RU_CUR.spendPrice(price);
    this.levels[id] = (this.levels[id] || 0) + 1;
    this.apply(id);
    return true;
  },
  _applyEffect(eff, multKey, value) {
    switch (eff.type) {
      case 'mult': RU_MULT.setMult({ name: eff.name, key: multKey, value }); break;
      case 'base': RU_MULT.setBase({ name: eff.name, key: multKey, value }); break;
      case 'bonus': RU_MULT.setBonus({ name: eff.name, key: multKey, value }); break;
      case 'unlock': RU_UNLOCK.unlock(eff.name); break;
      case 'setMin': RU_MULT.setMin({ name: eff.name, value }); break;
      case 'setMax': RU_MULT.setMax({ name: eff.name, value }); break;
      default: this.skippedEffects[eff.type] = (this.skippedEffects[eff.type] || 0) + 1; break;
    }
  },
  _resetEffect(eff, multKey) {
    if (eff.type === 'mult' || eff.type === 'base' || eff.type === 'bonus') RU_MULT.removeKeyAnywhere(multKey);
  },
  apply(id) {
    const d = this.defs[id];
    if (!d) return;
    const lvl = this.levels[id] || 0;
    d.effect.forEach((eff, k) => {
      const multKey = 'upg_' + id + '_' + k;
      if (lvl <= 0) { this._resetEffect(eff, multKey); return; }
      let value = 0;
      try { value = typeof eff.value === 'function' ? eff.value(lvl) : eff.value; } catch (e) { value = 0; }
      this._applyEffect(eff, multKey, value);
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

/* ===== 6. RU_RT：秘境模块运行时 ===== */
const RU_RT = {
  MULT: RU_MULT, CUR: RU_CUR, STAT: RU_STAT, UNLOCK: RU_UNLOCK, UPG: RU_UPG,
  ready: false, warnings: [],
  state: null,
  getters: null,
  _root: null,
  tickspeed: 1,

  init(state) {
    state = state || {};
    this.state = state;

    /* 1) 用 RU_STORE 的默认值补全缺失字段（旧档 / 新档统一口径） */
    if (typeof RU_STORE !== 'undefined') this._fillDefaults(state, RU_STORE.defaults());
    state.stat = state.stat || {};
    state.unlock = state.unlock || {};
    state.currencyVals = state.currencyVals || {};
    state.upgradeLevels = state.upgradeLevels || {};
    state.system = state.system || {};

    RU_STAT.values = state.stat;
    RU_UNLOCK.items = state.unlock;
    RU_CUR.values = state.currencyVals;
    RU_UPG.levels = state.upgradeLevels;

    const guard = (label, fn) => { try { fn(); } catch (e) { this.warnings.push(label + ': ' + e.message); } };

    /* 2) 统计项（全部显式 ensure，保证存档字段稳定） */
    guard('stat', () => {
      ['ruin_playTime', 'ruin_clears', 'ruin_dispatchCount', 'ruin_eventCount', 'ruin_deathCount',
        'ruin_reviveCount', 'ruin_sellStone', 'ruin_artifactUnlock', 'ruin_artifactMaxLevel',
        'ruin_discipleMaxLevel', 'ruin_bestBagValue', 'ruin_bestStone'].forEach(k => RU_STAT.ensure(k));
    });
    // ruinFeature 的解锁现在由 GB_UNLOCK + GB_META 全局管理（globalLevel 阈值 360），不再模块内自启
    guard('unlock', () => { RU_UNLOCK.init('ruinFeature'); });
    /* 货币：本模块自闭环单一货币「灵石」（入场费 / 购买 / 升级 / 重塑 / 变现） */
    guard('currency', () => RU_CUR.init('ruin_stone', { feature: 'ruin', value: 0, display: 'number' }));
    guard('upgrade', () => RU_UPG.register('upgrade', {}, 'regular'));

    /* 3) 派生 getters（供 store actions / sim / view 统一取用） */
    this.buildGetters();

    this.ready = true;
    return this;
  },

  /* 只补缺失字段，不覆盖已有值（旧档兼容） */
  _fillDefaults(t, d) {
    if (!t || !d) return t;
    Object.keys(d).forEach(k => {
      const dv = d[k];
      if (t[k] === undefined) {
        t[k] = (dv && typeof dv === 'object') ? JSON.parse(JSON.stringify(dv)) : dv;
      } else if (dv && typeof dv === 'object' && !Array.isArray(dv) && t[k] && typeof t[k] === 'object' && !Array.isArray(t[k])) {
        this._fillDefaults(t[k], dv);
      }
    });
    return t;
  },

  /* 深合并（就地写入，保留子系统引用：stat / unlock / currencyVals / upgradeLevels） */
  _deepMerge(t, s) {
    if (!t || !s) return t;
    Object.keys(s).forEach(k => {
      const sv = s[k];
      if (Array.isArray(sv)) {
        if (!Array.isArray(t[k])) t[k] = [];
        t[k].length = 0;
        sv.forEach(x => t[k].push(x));
      } else if (sv && typeof sv === 'object') {
        if (!t[k] || typeof t[k] !== 'object' || Array.isArray(t[k])) t[k] = {};
        this._deepMerge(t[k], sv);
      } else {
        t[k] = sv;
      }
    });
    return t;
  },

  buildGetters() {
    const g = {};
    const self = this;
    Object.keys(RU_STORE.getters).forEach(name => {
      Object.defineProperty(g, name, {
        enumerable: true, configurable: true,
        get() { return RU_STORE.getters[name](self.state, g, self._root); }
      });
    });
    this.getters = g;
    return g;
  },

  ctx() {
    const self = this;
    return {
      state: this.state,
      getters: this.getters,
      rootState: this._root,
      commit: () => { /* 本模块 store 未定义 mutations，保留接口兼容 */ },
      dispatch: (type, payload) => self.act(type, payload)
    };
  },
  act(name, payload) {
    if (typeof RU_STORE === 'undefined' || !RU_STORE.actions[name]) { this.warnings.push('act:noaction:' + name); return null; }
    try { return RU_STORE.actions[name](this.ctx(), payload || {}); }
    catch (e) { this.warnings.push('act:' + name + ': ' + e.message); return null; }
  },

  /* 真实推进：模块时钟 ++ → 到期派遣转入「归来待收」。
     派遣结果已在派遣瞬间由 RU_SIM 一次算完，tick 不做任何随机，离线口径一致。 */
  tick(seconds) {
    if (!this.ready) return;
    const s = (typeof seconds === 'number' && isFinite(seconds)) ? seconds : 1;
    try {
      RU_STAT.add('ruin_playTime', s);
      if (!this.state) return;
      this.state.now = (this.state.now || 0) + s;
      this._advanceDispatches();
    } catch (e) { this.warnings.push('tick: ' + e.message); }
  },

  _advanceDispatches() {
    const st = this.state;
    if (!st || !Array.isArray(st.running) || !st.running.length) return;
    const stay = [];
    st.running.forEach(rec => {
      if (st.now >= rec.endAt) {
        st.returned = st.returned || [];
        st.returned.push(rec);
        const d = st.disciple && st.disciple[rec.discipleId];
        if (d) d.status = 'awaiting';
      } else { stay.push(rec); }
    });
    st.running = stay;
  },

  afterChange() {
    try { RU_UPG.applyAll(); } catch (e) { this.warnings.push('afterChange: ' + e.message); }
  },

  saveGame() {
    try {
      return { savedAt: Date.now(), v: 2, state: JSON.parse(JSON.stringify(this.state || {})) };
    } catch (e) { this.warnings.push('saveGame: ' + e.message); return { savedAt: Date.now(), v: 2, state: {} }; }
  },

  loadGame(data) {
    if (!data || !this.ready) return;
    try {
      if (data.v >= 2 && data.state) {
        this._deepMerge(this.state, data.state);
      } else {
        /* v1 兼容：仅恢复子系统数据 */
        if (data.currencyVals) Object.keys(data.currencyVals).forEach(k => { if (RU_CUR.values[k] !== undefined) RU_CUR.values[k] = data.currencyVals[k]; });
        if (data.upgradeLevels) Object.keys(data.upgradeLevels).forEach(k => { if (RU_UPG.levels[k] !== undefined) RU_UPG.levels[k] = data.upgradeLevels[k]; });
        if (data.stat) Object.keys(data.stat).forEach(k => { RU_STAT.values[k] = data.stat[k]; });
        if (data.unlock) Object.keys(data.unlock).forEach(k => { RU_UNLOCK.items[k] = data.unlock[k]; });
        if (data.system && this.state) this.state.system = data.system;
      }
      /* 补全旧档可能缺失的玩法字段，并清理已在派遣中被移除的弟子状态 */
      if (typeof RU_STORE !== 'undefined') this._fillDefaults(this.state, RU_STORE.defaults());
      this.afterChange();
    } catch (e) { this.warnings.push('loadGame: ' + e.message); }
  }
};

if (typeof module !== 'undefined') module.exports = { RU_MULT, RU_CUR, RU_STAT, RU_UNLOCK, RU_UPG, RU_RT };

/* ===== 注册到跨模块地基（数值/存档格式独立，仅登记引用） ===== */
if (typeof GB_MODULES !== 'undefined') {
  GB_MODULES.register({
    id: 'ruin', name: '秘境', keyPrefix: 'ruin', tickSpeed: 1, unlockNeeded: 'ruFeature',
    core: { MULT: RU_MULT, CUR: RU_CUR, STAT: RU_STAT, UNLOCK: RU_UNLOCK, UPG: RU_UPG, RT: RU_RT },
    onAfterLoad: () => {
      try { GB_META.globalLevelPart('ru_0', 0); } catch (e) {} // 秘境 globalLevel 暂 stub
    },
  });
}