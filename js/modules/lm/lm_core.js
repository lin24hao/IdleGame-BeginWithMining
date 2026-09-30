/* ============================================================
 * lm_core.js —— 「修炼（lm）」模块运行时内核（零依赖、零构建）
 *
 * 作用：为机械搬运而来的 lm_data.js / lm_store.js 提供运行环境：
 *   1) gooboo 工具函数（照抄 src/js/utils/*.js 的实现）
 *   2) Vue 极小替身（生成代码里只用到 Vue.set）
 *   3) MULT / CUR / STAT / UNLOCK / UPG / SYSTEM 六个子系统
 *   4) store —— Vuex 的极小等价替身（commit / dispatch / getters / state）
 *
 * 数值与公式全部来自 lm_data.js / lm_store.js（即 gooboo 原文），本文件
 * 不参与任何数值计算的定义，只提供"跑起来"所需的机制。
 * ============================================================ */

/* ===== 1. 工具函数（照抄 gooboo src/js/utils/*） ===== */
function logBase(num, base) { return Math.log(num) / Math.log(base); }
function getSequence(base, pos) { return Math.round((base + (pos - 1) / 2) * pos); }
function digitSum(num) { return String(num).split('').reduce((a, n) => a + parseInt(n, 10), 0); }
function isPrime(num) {
  if (num < 2) return false;
  const n = Math.sqrt(num);
  for (let i = 2; i <= n; i++) { if (num % i === 0) return false; }
  return true;
}
function getDiminishing(num) {
  return num <= 0 ? 0 : Math.pow(Math.log(num + 1.5), 2.1) / Math.pow(Math.log(2.5), 2.1);
}
function getApproaching(base, cap, num) { return (1 - Math.pow(1 - base / cap, num)) * cap; }
function splicedPow(e1, e2, bp, v) { return Math.pow(e2, Math.max(0, v - bp)) * Math.pow(e1, Math.min(bp, v)); }
function splicedPowLinear(e, inc, bp, v) { return (Math.max(0, v - bp) * inc + 1) * Math.pow(e, Math.min(bp, v)); }
function splicedLinear(i1, i2, bp, v) { return Math.max(0, v - bp) * i2 + Math.min(bp, v) * i1; }
function deltaLinear(base, inc, amount, skip) {
  const fb = inc * (skip || 0) + base;
  return (fb + (amount - 1) * inc / 2) * amount;
}
function buildArray(length) { const a = []; for (let i = 0; i < (length || 0); i++) a.push(i); return a; }
function fallbackArray(array, fallback, index) {
  array = array || [];
  return (index >= 0 && index < array.length) ? array[index] : (fallback === undefined ? null : fallback);
}
function filterUnique(array) { return array.filter((v, i, a) => a.indexOf(v) === i); }
function randomFloat(min, max, dec) {
  const v = min + Math.random() * (max - min);
  const p = Math.pow(10, dec === undefined ? 2 : dec);
  return Math.round(v * p) / p;
}
function capitalize(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
function decapitalize(t) { return t.charAt(0).toLowerCase() + t.slice(1); }

// 数值后缀表：与 gooboo src/js/utils/format.js 的 numFormatters 逐项一致（索引即指数档位）
var NUM_SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'O', 'N', 'D',
  'UD', 'DD', 'TD', 'QaD', 'QiD', 'SxD', 'SpD', 'OD', 'ND', 'V',
  'UV', 'DV', 'TV', 'QaV', 'QiV', 'SxV', 'SpV', 'OV', 'NV', 'Tg',
  'UT', 'DT', 'TT', 'QaT', 'QiT', 'SxT', 'SpT', 'OT', 'NT', 'Qag',
  'UQag', 'DQag', 'TQag', 'QaQag', 'QiQag', 'SxQag', 'SpQag', 'OQag', 'NQag', 'Qig',
  'UQig', 'DQig', 'TQig', 'QaQig', 'QiQig', 'SxQig', 'SpQig', 'OQig', 'NQig', 'Sxg',
  'USxg', 'DSxg', 'TSxg', 'QaSxg', 'QiSxg', 'SxSxg', 'SpSxg', 'OSxg', 'NSxg', 'Spg',
  'USpg', 'DSpg', 'TSpg', 'QaSpg', 'QiSpg', 'SxSpg', 'SpSpg', 'OSpg', 'NSpg', 'Og',
  'UOg', 'DOg', 'TOg', 'QaOg', 'QiOg', 'SxOg', 'SpOg', 'OOg', 'NOg', 'Ng',
  'UNg', 'DNg', 'TNg', 'QaNg', 'QiNg', 'SxNg', 'SpNg', 'ONg', 'NNg', 'C',
  'UC'];

function buildNum(number, suffix) {
  let m = NUM_SUFFIXES.indexOf(suffix);
  if (m < 0) { console.warn('[lm] 未知数值后缀：' + suffix); m = 0; }
  return number * Math.pow(1000, m);
}
function roundNear(num, dec) {
  const p = Math.pow(10, dec === undefined ? 9 : dec);
  return Math.round(num * p) / p;
}
/** 数值显示（中文化：万/亿 之外沿用 gooboo 的 K/M/B 后缀） */
function formatNum(num, decimals) {
  if (num === Infinity) return '∞';
  if (!isFinite(num)) return '0';
  const neg = num < 0;
  num = Math.abs(num);
  if (num < 1000) {
    const d = decimals === undefined ? (num < 10 ? 2 : (num < 100 ? 1 : 0)) : decimals;
    return (neg ? '-' : '') + Number(num.toFixed(d)).toLocaleString();
  }
  let idx = Math.floor(Math.log10(num) / 3);
  if (idx >= NUM_SUFFIXES.length) return (neg ? '-' : '') + num.toExponential(2);
  const mant = num / Math.pow(1000, idx);
  return (neg ? '-' : '') + (mant < 10 ? mant.toFixed(2) : (mant < 100 ? mant.toFixed(1) : mant.toFixed(0))) + NUM_SUFFIXES[idx];
}
function formatInt(num) { return formatNum(Math.floor(num), 0); }
function lmFormatTime(seconds) {
  if (!isFinite(seconds)) return '∞';
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h > 0) return `${h}时${m}分`;
  if (m > 0) return `${m}分${sec}秒`;
  return `${sec}秒`;
}

/* ===== 2. Vue 极小替身 ===== */
var Vue = {
  set(obj, key, value) { obj[key] = value; },
  delete(obj, key) { delete obj[key]; }
};

/* ===== 3. MULT：倍率系统 ===== */
const MULT = {
  items: {},
  missing: [],

  init(name, o) {
    o = o || {};
    const item = {
      feature: o.feature || 'lm',
      baseValue: o.baseValue || 0,
      baseCache: o.baseValue || 0,
      group: o.group || [],
      roundNearZero: o.roundNearZero || false,
      multCache: 1,
      bonusCache: 0,
      baseValues: {},
      multValues: {},
      bonusValues: {},
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
    item.baseCache = base;
    item.bonusCache = bonus;
    item.multCache = isFinite(mult) ? mult : 1;
  },

  /** 组传播：把同一效果键写到自身与所有组员的缓存里 */
  _propagate(name, kind, key, value) {
    const item = this.items[name];
    if (!item) return;
    const targets = [name].concat(item.group || []);
    const seen = {};
    targets.forEach(tn => {
      if (seen[tn]) return;
      seen[tn] = true;
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

  /** 按效果键移除（跨全部 mult 查找） */
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

  /** 组建立（由 LM_GOOBOO.multGroup 解析而来） */
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
    let value = (item.baseCache + (base || 0)) * item.multCache * (mult === undefined ? 1 : mult)
      + item.bonusCache + (bonus || 0);
    if (item.min !== null) value = Math.max(value, item.min);
    if (item.max !== null) value = Math.min(value, item.max);
    if (item.round) value = Math.round(value);
    if (!isFinite(value)) value = 0;
    if (item.roundNearZero && Math.abs(value) < 1e-9) value = 0;
    return value;
  }
};

/* ===== 4. CUR：货币 / 资源系统 ===== */
const CUR = {
  defs: {},
  values: {},
  capByMult: {},

  prefix(key) { return key.split('_')[0]; },
  gainMultName(key) { return 'currency' + key.split('_').map(capitalize).join('') + 'Gain'; },
  capMultName(key) { return 'currency' + key.split('_').map(capitalize).join('') + 'Cap'; },

  init(key, def) {
    def = def || {};
    def.key = key;
    this.defs[key] = def;
    if (this.values[key] === undefined) this.values[key] = def.value || 0;
    const gm = this.gainMultName(key), cm = this.capMultName(key);
    MULT.init(gm, Object.assign({ feature: def.feature || 'lm' }, def.gainMult || {}));
    MULT.init(cm, Object.assign({ feature: def.feature || 'lm' }, def.capMult || {}));
    this.capByMult[cm] = key;
    if (def.currencyMult) {
      Object.entries(def.currencyMult).forEach(([m, o]) => {
        SYSTEM.applyEffect({ type: o.type, name: m, multKey: 'currencyMult_' + key, value: o.value });
      });
    }
    return def;
  },

  value(key) { const v = this.values[key]; return v === undefined ? 0 : v; },

  cap(key) {
    const def = this.defs[key];
    if (!def) return 0;
    if (!def.capMult) return Infinity;
    return MULT.get(this.capMultName(key));
  },

  gainMult(key) { return MULT.get(this.gainMultName(key)); },

  add(key, amount) {
    if (!this.defs[key]) return;
    const cap = this.cap(key);
    let v = this.value(key) + amount;
    if (v < 0) v = 0;
    if (isFinite(cap)) v = Math.min(v, Math.max(cap, this.value(key)));
    this.values[key] = v;
    if (v > 0 && UNLOCK.items['lm' + capitalize(this.prefix(key))]) { /* 保持与 gooboo 一致的惰性解锁语义 */ }
  },

  spend(key, amount) {
    if (this.value(key) < amount) return false;
    this.values[key] -= amount;
    return true;
  },

  spendAll(key) { this.values[key] = 0; },

  /** dispatch('currency/gain', {feature, name, amount}) */
  gain(o) {
    const names = Array.isArray(o.name) ? o.name : [o.name];
    const feature = o.feature || 'lm';
    names.forEach(n => {
      const key = n.indexOf('_') > 0 ? n : (feature + '_' + n);
      this.add(key, o.amount);
    });
  },

  /** getter('currency/canAfford')(price, maxPrice) */
  canAfford(price, maxPrice) {
    const target = maxPrice || price || {};
    for (const k in target) {
      if (this.value(k) < target[k]) return false;
    }
    return true;
  },

  spendPrice(price) {
    for (const k in price) this.spend(k, price[k]);
  },

  reset(feature) {
    Object.keys(this.defs).forEach(k => {
      if (k.indexOf(feature + '_') === 0) this.values[k] = 0;
    });
  },

  /** 列出某类型的全部资源键（UI 用） */
  keysOfSubtype(subtype) {
    return Object.keys(this.defs).filter(k => this.defs[k].subtype === subtype);
  }
};

/* ===== 5. STAT：统计系统 ===== */
const STAT = {
  values: {},
  get(key) { const s = this.values[key]; return s ? s.value : 0; },
  ensure(key) {
    if (!this.values[key]) this.values[key] = { value: 0, total: 0, max: 0 };
    return this.values[key];
  },
  add(key, value) {
    const s = this.ensure(key);
    s.value += value; s.total += value;
    if (s.value > s.max) s.max = s.value;
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
      if (k.indexOf(feature + '_') === 0) this.values[k] = { value: 0, total: 0, max: 0 };
    });
  }
};

/* ===== 6. UNLOCK：解锁系统 ===== */
const UNLOCK = {
  items: {},
  init(id) {
    if (!this.items[id]) this.items[id] = { init: false, see: false, use: false };
    return this.items[id];
  },
  unlock(id) {
    const it = this.init(id);
    it.init = true; it.see = true; it.use = true;
    return it;
  },
  isUnlocked(id) { return !!(this.items[id] && this.items[id].use); },
  isVisible(id) { return !!(this.items[id] && this.items[id].see); }
};

/* ===== 7. UPG：升级项系统（含声望升级 / 高级升级） ===== */
const UPG = {
  defs: {},
  levels: {},
  keep: {},      // 声望后保留的升级项（effect: keepUpgrade）
  uncapped: {},  // 解除上限的升级项（effect: uncapUpgrade）
  skippedEffects: {},

  register(mapName, map, defaultType) {
    if (!map) return 0;
    let n = 0;
    Object.keys(map).forEach(key => {
      const def = map[key];
      if (!def || typeof def !== 'object') return;
      const id = 'lm_' + key;
      def.id = id;
      def.key = key;
      def.type = def.type || defaultType;
      def.effect = def.effect || [];
      def._map = mapName;
      this.defs[id] = def;
      if (this.levels[id] === undefined) this.levels[id] = 0;
      MULT.init('upgradeLm' + capitalize(key) + 'Cap', { baseValue: 0 });
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

  /** 是否满足解锁条件（requirement() 函数 或 requirementBase/requirementValue） */
  requirementMet(id) {
    const d = this.defs[id];
    if (!d) return false;
    // 优先按 gooboo 语义处理 requirement() 条件函数（返回布尔显示与否）
    if (typeof d.requirement === 'function') {
      try { return !!d.requirement(); } catch (e) { return false; }
    }
    if (d.requirementValue === undefined) return true;
    try {
      const base = typeof d.requirementBase === 'function' ? d.requirementBase() : 0;
      return base >= d.requirementValue;
    } catch (e) { return false; }
  },

  isVisible(id) {
    const d = this.defs[id];
    if (!d) return false;
    if (d.subfeature !== undefined) {
      const sub = SYSTEM.state.features.lm.currentSubfeature;
      if (d.subfeature !== sub) return false;
    }
    return this.requirementMet(id);
  },

  isMaxed(id) { return (this.levels[id] || 0) >= this.cap(id); },

  canAfford(id) {
    if (this.isMaxed(id)) return false;
    try { return CUR.canAfford(this.price(id)); } catch (e) { return false; }
  },

  buy(id) {
    const d = this.defs[id];
    if (!d || this.isMaxed(id)) return false;
    const price = this.price(id);
    if (!CUR.canAfford(price)) return false;
    CUR.spendPrice(price);
    this.levels[id] = (this.levels[id] || 0) + 1;
    this.apply(id);
    return true;
  },

  /** 购买 amount 级的总价格 */
  priceList(id, amount) {
    amount = amount || 1;
    const lvl = this.levels[id] || 0;
    let total = {};
    for (let i = 0; i < amount; i++) {
      const p = this.price(id, lvl + i);
      for (const k in p) total[k] = (total[k] || 0) + p[k];
    }
    return total;
  },

  /** 最多能买几级 */
  maxAfford(id) {
    const d = this.defs[id];
    if (!d) return 0;
    let lvl = this.levels[id] || 0;
    const cap = this.cap(id);
    let amount = 0;
    let canContinue = true;
    while (canContinue && (cap === Infinity || (lvl + amount) < cap)) {
      // 计算下一级价格
      let p;
      try { p = this.price(id, lvl + amount); } catch (e) { break; }
      if (!p) break;
      // 检查每种资源是否够
      for (const k in p) {
        if (CUR.value(k) < p[k]) { canContinue = false; break; }
      }
      if (canContinue) {
        // 扣除临时模拟（用减再加的方式避免改 CUR）
        amount++;
      }
    }
    return amount;
  },

  /** 一键买满（或到买不起为止） */
  buyMax(id) {
    let totalBought = 0;
    // 循环买，因为买一级后资源变化可能让下一级也买得起
    while (true) {
      if (this.isMaxed(id)) break;
      const p = this.price(id);
      if (!CUR.canAfford(p)) break;
      CUR.spendPrice(p);
      this.levels[id] = (this.levels[id] || 0) + 1;
      this.apply(id);
      totalBought++;
    }
    return totalBought;
  },

  /** 应用某个升级项当前等级的全部效果 */
  apply(id) {
    const d = this.defs[id];
    if (!d) return;
    const lvl = this.levels[id] || 0;
    d.effect.forEach((eff, k) => {
      const multKey = 'upg_' + id + '_' + k;
      if (lvl <= 0) { SYSTEM.resetEffect({ type: eff.type, name: eff.name, multKey }); return; }
      let value = 0;
      try { value = typeof eff.value === 'function' ? eff.value(lvl) : eff.value; } catch (e) { value = 0; }
      SYSTEM.applyEffect({ type: eff.type, name: eff.name, multKey, value });
    });
  },

  applyAll() { Object.keys(this.defs).forEach(id => this.apply(id)); },

  /** 转生 / 重置：清除某类型升级等级（声望升级的 keepUpgrade 对象予以保留） */
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
    MULT.removeKeyAnywhere('__upg_placeholder__');
  },

  list(type) {
    return Object.keys(this.defs).filter(id => !type || this.defs[id].type === type);
  }
};

/* ===== 8. SYSTEM：效果系统 ===== */
const SYSTEM = {
  state: {
    // lm 与 mining 指向同一个子页状态对象，保证两套命名都能取到值
    features: { lm: { currentSubfeature: 0 }, mining: null },
    // gooboo 的「自动下潜」自动化设置：value 为允许自动推进的层数阈值（0 = 关闭，Infinity = 一直下潜）
    settings: { automation: { items: { progressLm: { value: 0 } } } }
  },
  effectLog: {},

  applyEffect(o) {
    if (!o) return;
    const value = typeof o.value === 'function' ? o.value() : o.value;
    switch (o.type) {
      case 'mult': MULT.setMult({ name: o.name, key: o.multKey, value }); break;
      case 'base': MULT.setBase({ name: o.name, key: o.multKey, value }); break;
      case 'bonus': MULT.setBonus({ name: o.name, key: o.multKey, value }); break;
      case 'unlock': UNLOCK.unlock(o.name); break;
      case 'keepUpgrade': if (value) UPG.keep[o.name] = true; else delete UPG.keep[o.name]; break;
      case 'uncapUpgrade': if (value) UPG.uncapped[o.name] = true; else delete UPG.uncapped[o.name]; break;
      case 'setMin': MULT.setMin({ name: o.name, value }); break;
      case 'setMax': MULT.setMax({ name: o.name, value }); break;
      default:
        UPG.skippedEffects[o.type] = (UPG.skippedEffects[o.type] || 0) + 1;
        break;
    }
  },

  resetEffect(o) {
    if (!o) return;
    if (o.type === 'mult' || o.type === 'base' || o.type === 'bonus') {
      MULT.removeKeyAnywhere(o.multKey);
    } else if (o.type === 'keepUpgrade') {
      delete UPG.keep[o.name];
    } else if (o.type === 'uncapUpgrade') {
      delete UPG.uncapped[o.name];
    }
  }
};

SYSTEM.state.features.mining = SYSTEM.state.features.lm;

/* ===== 9. store：Vuex 极小替身 ===== */
const store = {
  state: null,
  _lm: null,
  _getters: null,
  _audit: { commits: {}, dispatches: {}, unknown: {} },

  getters: {},

  commit(type, payload) {
    this._audit.commits[type] = (this._audit.commits[type] || 0) + 1;
    const s = this._lm;
    const p = payload || {};
    switch (type) {
      case 'lm/updateKey': s[p.key] = p.value; break;
      case 'lm/updateSubkey': if (s[p.name]) s[p.name][p.key] = p.value; break;
      case 'lm/updateSmelteryKey': if (s.smeltery[p.name]) s.smeltery[p.name][p.key] = p.value; break;
      case 'lm/updateEnhancementKey': if (s.enhancement[p.name]) s.enhancement[p.name][p.key] = p.value; break;
      case 'lm/updateIngredientKey': if (s.ingredientList[p.index]) s.ingredientList[p.index][p.key] = p.value; break;
      case 'lm/updateBeaconKey': if (s.beacon[p.name]) s.beacon[p.name][p.key] = p.value; break;
      case 'lm/addIngredient': s.ingredientList.push(p); break;
      case 'lm/removeIngredient': s.ingredientList.splice(p, 1); break;
      case 'lm/addBreaks':
        while (s.breaks.length < p.depth) s.breaks.push(0);
        s.breaks[p.depth - 1] = (s.breaks[p.depth - 1] || 0) + p.amount;
        break;
      case 'lm/addTorchDepth': s.torchDepths.push(p); break;
      case 'lm/initOre': LM_RT.initOre(p); break;
      case 'lm/initSmeltery': LM_RT.initSmeltery(p); break;
      case 'lm/initEnhancement': LM_RT.initEnhancement(p); break;
      case 'lm/initBeacon': LM_RT.initBeacon(p); break;
      case 'stat/add': STAT.add('lm_' + p.name, p.value); break;
      case 'stat/increaseTo': STAT.increaseTo('lm_' + p.name, p.value); break;
      case 'stat/reset': STAT.reset(p); break;
      case 'system/updateSubfeature': SYSTEM.state.features.lm.currentSubfeature = p.value; break;
      case 'system/nextRng': break;
      case 'system/updateSubfeatureState': break;
      case 'school/updateBookEffects': break;
      default: this._audit.unknown['commit:' + type] = (this._audit.unknown['commit:' + type] || 0) + 1; break;
    }
  },

  dispatch(type, payload, opt) {
    this._audit.dispatches[type] = (this._audit.dispatches[type] || 0) + 1;
    switch (type) {
      case 'currency/gain': CUR.gain(payload); break;
      case 'currency/spend': {
        const key = (payload.feature || 'lm') + '_' + payload.name;
        if (!CUR.spend(key, payload.amount)) console.warn('[lm] currency/spend 失败：' + key);
        break;
      }
      case 'currency/spendAll': CUR.spendAll((payload.feature || 'lm') + '_' + payload.name); break;
      case 'currency/reset': CUR.reset(payload); break;
      case 'currency/updateKey': break;
      case 'mult/setBase': MULT.setBase(payload); break;
      case 'mult/setMult': MULT.setMult(payload); break;
      case 'mult/setBonus': MULT.setBonus(payload); break;
      case 'mult/removeKey': MULT.removeKeyAnywhere(payload.key); break;
      case 'stat/add': STAT.add('lm_' + payload.name, payload.value); break;
      case 'stat/increaseTo': STAT.increaseTo('lm_' + payload.name, payload.value); break;
      case 'stat/reset': STAT.reset(payload); break;
      case 'system/applyEffect': SYSTEM.applyEffect(payload); break;
      case 'unlock/unlock': UNLOCK.unlock(payload); break;
      case 'system/resetEffect': SYSTEM.resetEffect(payload); break;
      case 'system/updateSubfeature': SYSTEM.state.features.lm.currentSubfeature = payload.value; break;
      case 'system/getRng': return () => Math.random();
      case 'system/nextRng': break;
      case 'consumable/canAffordMultiple': return true;
      case 'consumable/useMultiple': break;
      case 'card/activateCards': break;
      case 'meta/globalLevelPart': return 1;
      case 'note/find': break;
      case 'school/updateBookEffects': break;
      case 'upgrade/reset': UPG.resetTypes(payload && payload.type ? [payload.type] : ['regular']); break;
      default:
        if (type.indexOf('lm/') === 0 && LM_STORE.actions[type.slice(3)]) {
          LM_STORE.actions[type.slice(3)](LM_RT.ctx(), payload);
        } else {
          this._audit.unknown['dispatch:' + type] = (this._audit.unknown['dispatch:' + type] || 0) + 1;
        }
        break;
    }
  }
};

/* ===== 10. LM_RT：修炼模块运行时 ===== */
const LM_RT = {
  MULT: MULT, CUR: CUR, STAT: STAT, UNLOCK: UNLOCK, UPG: UPG, SYSTEM: SYSTEM, store: store,
  ready: false,
  warnings: [],
  lmState: null,
  getters: null,
  _rootLmGetters: null,

  /** 建立运行时：把存档中的 lm 快照喂给 store，并装载全部定义 */
  init(lmState) {
    this.lmState = lmState;
    lmState.stat = lmState.stat || {};
    lmState.unlock = lmState.unlock || {};
    lmState.currencyVals = lmState.currencyVals || {};
    lmState.upgradeLevels = lmState.upgradeLevels || {};
    lmState.subfeature = lmState.subfeature || 0;

    STAT.values = lmState.stat;
    UNLOCK.items = lmState.unlock;
    CUR.values = lmState.currencyVals;
    UPG.levels = lmState.upgradeLevels;
    SYSTEM.state.features.lm.currentSubfeature = lmState.subfeature;

    store._lm = lmState;
    store.state = {
      lm: lmState,
      stat: lmState.stat,
      unlock: lmState.unlock,
      currency: this._currencyProxy(),
      upgrade: {},
      system: SYSTEM.state
    };

    // ---- 定义装载（全部包 try/catch，单个定义异常不影响整体）----
    const guard = (label, fn) => { try { fn(); } catch (e) { this.warnings.push(label + ': ' + e.message); } };

    guard('stat', () => Object.keys(LM_GOOBOO.stat).forEach(k => {
      const def = LM_GOOBOO.stat[k];
      STAT.ensure('lm_' + k);
      if (def && def.value !== undefined) STAT.ensure('lm_' + k).value = def.value;
    }));
    guard('mult', () => Object.keys(LM_GOOBOO.mult).forEach(k => MULT.init(k, LM_GOOBOO.mult[k])));
    guard('unlock', () => (LM_GOOBOO.unlock || []).forEach(id => UNLOCK.init(id)));
    guard('ore', () => Object.keys(ore).forEach(k => LM_RT.initOre(Object.assign({ name: k }, ore[k]))));
    guard('smeltery', () => Object.keys(smeltery).forEach(k => LM_RT.initSmeltery(Object.assign({ name: k }, smeltery[k]))));
    guard('enhancement', () => Object.keys(enhancement).forEach(k => LM_RT.initEnhancement(Object.assign({ name: k }, enhancement[k]))));
    guard('beacon', () => Object.keys(beacon).forEach(k => LM_RT.initBeacon(Object.assign({ name: k }, beacon[k]))));
    guard('currency', () => Object.keys(LM_GOOBOO.currency).forEach(k => CUR.init('lm_' + k, LM_GOOBOO.currency[k])));
    guard('upgrade', () => {
      UPG.register('upgrade', upgrade, 'regular');
      UPG.register('upgrade2', upgrade2, 'regular');
      UPG.register('upgradePrestige', upgradePrestige, 'prestige');
      UPG.register('upgradePremium', upgradePremium, 'premium');
    });
    guard('stub', () => this._stubs());
    guard('multGroup', () => this._linkMultGroups());
    guard('getters', () => this.buildGetters());
    guard('applyAll', () => UPG.applyAll());

    this.ready = true;
    return this;
  },

  /** gooboo 全局系统里本模块之外的资源（如高级货币）做 0 值占位，保证价格判定可跑 */
  _stubs() {
    ['gem_ruby', 'lm_goldenHammer'].forEach(k => {
      if (!CUR.defs[k]) CUR.init(k, { feature: 'meta', subtype: 'premium', display: 'int', capMult: { baseValue: 0 } });
    });
  },

  /** LM_GOOBOO.multGroup：把 group 语义解析成具体 mult 名单 */
  _linkMultGroups() {
    (LM_GOOBOO.multGroup || []).forEach(g => {
      let members = [];
      if (g.name === 'currencyGain') members = CUR.keysOfSubtype(g.subtype).map(k => CUR.gainMultName(k));
      else if (g.name === 'currencyCap') members = CUR.keysOfSubtype(g.subtype).map(k => CUR.capMultName(k));
      else if (g.name === 'upgradeCap') {
        members = Object.keys(UPG.defs)
          .filter(id => UPG.defs[id].type === 'premium' || UPG.defs[id].type === 'prestige')
          .map(id => 'upgradeLm' + capitalize(UPG.defs[id].key) + 'Cap');
      }
      MULT.linkGroup(g.mult, members);
    });
    // 升级项定义里显式声明的 group（如 lmPrestigeIncome）
    Object.keys(LM_GOOBOO.mult).forEach(k => {
      const g = LM_GOOBOO.mult[k].group;
      if (g && g.length) MULT.linkGroup(k, g);
    });
  },

  _currencyProxy() {
    const self = this;
    return new Proxy({}, {
      get(t, prop) {
        if (typeof prop !== 'string' || prop === 'toJSON') return undefined;
        const def = CUR.defs[prop];
        if (!def) return undefined;
        return {
          value: CUR.value(prop),
          cap: CUR.cap(prop),
          unlock: def.unlock,
          display: def.display,
          subtype: def.subtype
        };
      }
    });
  },

  initOre(o) {
    const s = this.lmState;
    s.ingredient[o.name] = {
      power: o.power, impurity: o.impurity, minDepth: o.minDepth, maxDepth: o.maxDepth,
      modulo: o.modulo, compressUnlock: 'lmCompress' + o.name.slice(3),
      baseAmount: o.baseAmount, amountMult: o.amountMult
    };
  },
  initSmeltery(o) {
    const s = this.lmState;
    if (s.smeltery[o.name]) return;
    s.smeltery[o.name] = {
      price: o.price, output: o.output, progress: 0, stored: 0, total: 0,
      timeNeeded: o.timeNeeded, minTemperature: o.minTemperature
    };
  },
  initEnhancement(o) {
    const s = this.lmState;
    if (s.enhancement[o.name]) { s.enhancement[o.name].effect = o.effect || []; return; }
    s.enhancement[o.name] = { level: 0, effect: o.effect || [] };
  },
  initBeacon(o) {
    const s = this.lmState;
    if (s.beacon[o.name]) { s.beacon[o.name].effect = o.effect || []; return; }
    s.beacon[o.name] = {
      ownedMult: o.ownedMult, range: o.range === undefined ? 1 : o.range,
      color: o.color || 'grey', level: 0, effect: o.effect || []
    };
  },

  /** lm 命名空间的 getters（惰性求值，等价 Vuex getters） */
  buildGetters() {
    const g = {};
    const self = this;
    Object.keys(LM_STORE.getters).forEach(name => {
      Object.defineProperty(g, name, {
        enumerable: true,
        configurable: true,
        get() { return LM_STORE.getters[name](self.lmState, g, store.state, self.rootGetters()); }
      });
    });
    this.getters = g;
    store.getters = new Proxy({}, {
      get(t, prop) {
        if (typeof prop !== 'string') return undefined;
        if (prop.indexOf('lm/') === 0) return g[prop.slice(3)];
        return self.rootGetters()[prop];
      }
    });
    return g;
  },

  rootGetters() {
    const self = this;
    if (!this._rootGettersCache) {
      this._rootGettersCache = {
        'mult/get': (name, base, mult, bonus) => MULT.get(name, base, mult, bonus),
        'currency/value': (key) => CUR.value(key),
        'currency/cap': (key) => CUR.cap(key),
        'currency/gainMultName': (feature, name) => CUR.gainMultName(feature + '_' + name),
        'currency/capMultName': (feature, name) => CUR.capMultName(feature + '_' + name),
        'currency/canAfford': (price, maxPrice) => CUR.canAfford(price, maxPrice),
        'system/getRng': () => () => Math.random(),
        'lm/dwellerLimit': () => self.getters.dwellerLimit
      };
    }
    return this._rootGettersCache;
  },

  /** 供 lm_store actions 使用的 context */
  ctx() {
    return {
      state: this.lmState,
      getters: this.getters,
      rootState: store.state,
      rootGetters: this.rootGetters(),
      commit: (type, payload, opt) => store.commit(type.indexOf('/') > 0 ? type : 'lm/' + type, payload),
      dispatch: (type, payload, opt) => store.dispatch(type, payload, opt)
    };
  },

  /** 一次逻辑 tick（秒） */
  tick(seconds) {
    if (!this.ready) return;
    try { LM_TICK.call(this.ctx(), seconds); }
    catch (e) { this.warnings.push('tick: ' + e.message); }
  },

  /** 离线批量推进 */
  offlineTick(elapsedMs) {
    if (!this.ready) return;
    let left = elapsedMs / 1000;
    const chunk = 3600;   // 逐小时推进，兼顾精度与性能
    while (left > 0) {
      const step = Math.min(left, chunk);
      this.tick(step);
      left -= step;
    }
    // 离线完成后统一刷新一次派生效果
    this.postTickRefresh();
  },

  postTickRefresh() {
    try {
      store.dispatch('lm/updateDwellerStat');
      store.dispatch('lm/applyBeaconEffects');
      store.dispatch('lm/updateObsidianPenalty');
    } catch (e) { this.warnings.push('postRefresh: ' + e.message); }
  },

  /* ---------- 对外操作（UI 调用） ---------- */
  buyUpgrade(id) {
    const ok = UPG.buy(id);
    if (ok) this.afterChange();
    return ok;
  },
  buyUpgradeMax(id) {
    const n = UPG.buyMax(id);
    if (n > 0) this.afterChange();
    return n;
  },
  prestige() {
    store.dispatch('lm/prestige');
    UPG.resetTypes(['regular']);
    this.afterChange();
  },
  craftPickaxe() { store.dispatch('lm/craftPickaxe'); this.afterChange(); },
  addIngredient(name) { store.dispatch('lm/addIngredient', name); this.afterChange(); },
  removeIngredient(index) { store.commit('lm/removeIngredient', index); this.afterChange(); },
  toggleEnhancements() { store.dispatch('lm/toggleEnhancements'); this.afterChange(); },
  enhance() { store.dispatch('lm/enhance'); this.afterChange(); },
  selectEnhancement(name) { store.commit('lm/updateKey', { key: 'enhancementIngredient', value: name }); },
  addToSmeltery(name) { store.dispatch('lm/addToSmeltery', { name }); this.afterChange(); },
  placeBeacon(depth, beaconName) { store.dispatch('lm/placeBeacon', { depth, beacon: beaconName }); this.afterChange(); },
  removeBeacon(depth) { store.dispatch('lm/removeBeacon', depth); this.afterChange(); },
  switchSubfeature(idx) {
    SYSTEM.state.features.lm.currentSubfeature = idx;
    this.lmState.subfeature = idx;
    this.afterChange();
  },
  /** 存档后：把所有升级项效果重新套用一遍（读档恢复派生数据） */
  afterChange() {
    UPG.applyAll();
  }
};

/* ===== 注册到跨模块地基（数值/存档不变，仅登记引用） ===== */
if (typeof GB_MODULES !== 'undefined') {
  GB_MODULES.register({
    id: 'lm', name: '灵脉', keyPrefix: 'lm', tickSpeed: 1, unlockNeeded: null,
    core: { MULT, CUR, STAT, UNLOCK, UPG, RT: LM_RT },
    /* 离线结束后刷新派生效果（与 LM_RT.offlineTick 原行为一致） */
    afterOffline: () => { try { LM_RT.postTickRefresh(); } catch (e) {} },
    /* loadAll 之后上报 globalLevelPart —— 灵脉深度是 globalLevel 的主要来源 */
    onAfterLoad: () => {
      try { GB_META.globalLevelPart('lm_0', ((STAT.values['lm_maxDepth0'] && STAT.values['lm_maxDepth0'].total) || 1) - 1); } catch (e) {}
      try { GB_META.globalLevelPart('lm_1', ((STAT.values['lm_maxDepth1'] && STAT.values['lm_maxDepth1'].total) || 0)); } catch (e) {}
    },
  });
}
