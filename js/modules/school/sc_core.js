/* ============================================================
 * sc_core.js —— 「藏经阁（school）」模块运行时内核（零依赖、零构建）
 *
 * 作用：为照抄 gooboo school 的 sc_data.js / sc_store.js 提供运行环境。
 *   - 复用全局工具（chance/randomInt/randomFloat/randomElem/weightSelect/
 *     buildArray/shuffleArray/capitalize/formatGrade 等，均在本文件兜底声明）
 *   - 自建 SC_ 前缀 MULT/CUR/STAT/UNLOCK/UPG/SYSTEM/TAG + SCTORE + SC_RT
 *   - 数学模型与交互逻辑照抄 gooboo 藏经阁玩法，仅改写为修仙主题并转中文
 *   - 关键差异：SC_SYSTEM.applyEffect 做「跨模块书籍增益桥接」，把书籍
 *     效果同时写入本模块 SC_MULT 与目标玩法模块的 MULT。
 * ============================================================ */

/* ===== 0. 全局工具兜底（此处声明为无前缀全局可见） ===== */
function chance(prob, rng) { return (rng === undefined ? Math.random() : rng) < prob; }
function randomInt(min, max, rng) { rng = (rng === undefined ? Math.random() : rng); return Math.floor(rng * (1 + max - min) + min); }
function randomFloat(min, max, rng) { rng = (rng === undefined ? Math.random() : rng); return rng * (max - min) + min; }
function randomRound(num, rng) { const fl = Math.floor(num); return (chance(num - fl, rng) ? fl + 1 : fl); }
function randomElem(arr, rng) { if (!arr || !arr.length) return undefined; return arr[randomInt(0, arr.length - 1, rng)]; }
function weightSelect(weights, rng) {
  rng = (rng === undefined ? Math.random() : rng);
  if (rng >= 1) rng = 0.99999999;
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let currentWeight = 0;
  const chosen = rng * totalWeight;
  return weights.findIndex((el) => { if (currentWeight + el > chosen) { return true; } currentWeight += el; return false; });
}
function randomSplit(splits) {
  splits = splits || 3;
  const nums = [];
  for (let i = 0; i < splits; i++) nums.push(Math.random());
  const sum = nums.reduce((a, b) => a + b, 0);
  return nums.map(el => el / sum);
}
function buildArray(length) { length = length || 0; return Array(length).fill().map((x, i) => i); }
function shuffleArray(array, rngGen) {
  if (rngGen === null || rngGen === undefined) rngGen = () => Math.random();
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rngGen() * (i + 1));
    const temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
  }
  return arr;
}
function fallbackArray(array, fallback, index) {
  array = array || []; fallback = (fallback === undefined ? null : fallback); index = index || 0;
  return (index >= 0 && index < array.length) ? array[index] : fallback;
}
function capitalize(string) { return string.charAt(0).toUpperCase() + string.slice(1); }
function setCharAt(str, index, chr) { if (index > str.length - 1) return str; return str.substr(0, index) + chr + str.substr(index + 1); }
if (typeof formatGrade === 'undefined') {
  function formatGrade(grade) {
    if (grade <= 0) return 'F';
    if (grade >= 16) return 'S+' + (grade - 14);
    const ng = grade - 1;
    const tier = Math.floor(ng / 3); const mod = ng % 3;
    const ts = ['D', 'C', 'B', 'A', 'S'];
    let s = tier < ts.length ? ts[tier] : '?';
    if (mod === 0) s += '-'; else if (mod === 2) s += '+';
    return s;
  }
}
if (typeof formatInt === 'undefined') {
  function formatInt(num) { if (num < 10000) return String(num); return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
}
if (typeof formatNum === 'undefined') {
  function formatNum(n) { if (isNaN(n)) return 'NaN'; const neg = n < 0 ? '-' : ''; n = Math.abs(n); if (n === Infinity) return neg + '∞'; if (n < 10000) return neg + Math.floor(n); let mag = Math.floor(Math.log10(n) / 3); if (mag <= 0) return neg + Math.floor(n); const suf = ['', 'K','M','B','T','Qa','Qi','Sx','Sp','O','N','D','UD','DD','TD','QaD','QiD','SxD','SpD','OD','ND','V','UV','DV','TV','QaV','QiV','SxV','SpV','OV','NV','Tg']; const b = suf[mag] || ''; return neg + (n / Math.pow(1000, mag)).toPrecision(4) + b; }
}

/* ===== 1. SC_MULT：倍率系统（feature 固定为 school） ===== */
const SC_MULT = {
  items: {}, missing: [],
  init(name, o) {
    o = o || {};
    const item = {
      feature: 'school',
      baseValue: o.baseValue || 0, baseCache: o.baseValue || 0,
      group: o.group || [], roundNearZero: o.roundNearZero || false,
      multCache: 1, bonusCache: 0, baseValues: {}, multValues: {}, bonusValues: {},
      min: (o.min === undefined ? null : o.min), max: (o.max === undefined ? null : o.max),
      round: o.round || false, display: o.display || 'number',
      isPositive: o.isPositive !== false, unlock: o.unlock || null, type: o.type || null
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
      const t = this.items[n]; let dirty = false;
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

/* ===== 2. SC_CUR：货币 / 资源系统（沿用 gooboo） ===== */
const SC_CUR = {
  defs: {}, values: {}, capByMult: {}, currencyMults: {},
  prefix(key) { return key.split('_')[0]; },
  gainMultName(key) { return 'currency' + key.split('_').map(capitalize).join('') + 'Gain'; },
  capMultName(key) { return 'currency' + key.split('_').map(capitalize).join('') + 'Cap'; },
  init(key, def) {
    def = def || {};
    if (!def.feature) def.feature = 'school';
    if (!def.type) def.type = 'regular';
    def.key = key;
    this.defs[key] = def;
    if (this.values[key] === undefined) this.values[key] = def.value || 0;
    const gm = this.gainMultName(key), cm = this.capMultName(key);
    SC_MULT.init(gm, Object.assign({ feature: 'school' }, def.gainMult || {}));
    SC_MULT.init(cm, Object.assign({ feature: 'school' }, def.capMult || {}));
    if (def.capMult) this.capByMult[cm] = key;
    if (def.currencyMult) this.currencyMults[key] = def.currencyMult;
    return def;
  },
  value(key) { return this.values[key] === undefined ? 0 : this.values[key]; },
  cap(key) {
    const def = this.defs[key];
    if (!def) return 0;
    if (!def.capMult && !this.capByMult[this.capMultName(key)]) return Infinity;
    return SC_MULT.get(this.capMultName(key));
  },
  gainMult(key) { return SC_MULT.get(this.gainMultName(key)); },
  add(key, amount) {
    const def = this.defs[key];
    if (!def) return;
    const cap = this.cap(key);
    let v = this.value(key) + amount;
    if (v < 0) v = 0;
    if (isFinite(cap)) v = Math.min(v, Math.max(cap, this.value(key)));
    this.values[key] = v;
    if (this.currencyMults[key]) {
      for (const ckey in this.currencyMults[key]) {
        const eff = this.currencyMults[key][ckey];
        const val = typeof eff.value === 'function' ? eff.value(v) : eff.value;
        if (eff.type === 'mult') SC_MULT.setMult({ name: ckey, key: 'currencyMult_' + key, value: val });
        else if (eff.type === 'base') SC_MULT.setBase({ name: ckey, key: 'currencyMult_' + key, value: val });
        else if (eff.type === 'bonus') SC_MULT.setBonus({ name: ckey, key: 'currencyMult_' + key, value: val });
        else SC_MULT.removeKeyAnywhere('currencyMult_' + key);
      }
    }
  },
  spend(key, amount) { if (this.value(key) < amount) return false; this.values[key] -= amount; return true; },
  gain(o) {
    const names = Array.isArray(o.name) ? o.name : [o.name];
    names.forEach(n => {
      const key = n.indexOf('_') > 0 ? n : ('school_' + n);
      let amount = o.amount;
      if (o.gainMult) amount = amount * this.gainMult(key);
      const def = this.defs[key];
      if (!def) return;
      const cap = this.cap(key);
      let gained = 0;
      if (!isFinite(cap)) {
        gained = amount;
      } else if ((def.overcapMult || 0) > 0) {
        // 过cap分段衰减（gooboo currency gain：stage>0 每段按 overcapMult*overcapScaling^(stage-1) 折算）
        let stage = Math.floor(this.value(key) / cap);
        let amt = amount;
        let guard = 0;
        while (amt > 0 && guard++ < 100) {
          const left = cap * (stage + 1) - this.value(key) - gained;
          const stageMult = stage > 0 ? (def.overcapMult * Math.pow((def.overcapScaling || 0.5), stage - 1)) : 1;
          const given = Math.min(Math.max(left, 0), amt * stageMult);
          if (given <= 0) break;
          gained += given;
          amt -= given / stageMult;
          stage++;
        }
      } else {
        gained = Math.min(this.value(key) + amount, cap) - this.value(key);
      }
      if (gained < 0) gained = 0;
      if (gained !== amount && def.overcapFunction) {
        try { def.overcapFunction(amount - gained); } catch (e) { /* ignore */ }
      }
      this.add(key, gained);
    });
  },
  canAfford(price, maxPrice) {
    const target = maxPrice || price || {};
    for (const k in target) { if (this.value(k) < target[k]) return false; }
    return true;
  },
  spendPrice(price) { for (const k in price) this.spend(k, price[k]); },
  reset(feature) { Object.keys(this.defs).forEach(k => { if (k.indexOf((feature || 'school') + '_') === 0) this.values[k] = 0; }); },
  list(feature, type, subtype) {
    return Object.keys(this.defs)
      .filter(k => this.defs[k].feature === feature)
      .filter(k => {
        const d = this.defs[k];
        if (type && d.type !== type) return false;
        if (subtype && d.subtype !== subtype) return false;
        return true;
      });
  }
};

/* ===== 3. SC_STAT：统计系统 ===== */
const SC_STAT = {
  values: {},
  get(key) { const s = this.values[key]; return s ? s.value : 0; },
  ensure(key) { if (!this.values[key]) this.values[key] = { value: 0, total: 0, max: 0 }; return this.values[key]; },
  add(key, value) { const s = this.ensure(key); s.value += value; s.total += value; if (s.value > s.max) s.max = s.value; },
  increaseTo(key, value) { const s = this.ensure(key); if (value > s.value) s.value = value; if (value > s.total) s.total = value; if (value > s.max) s.max = value; },
  set(key, value) { this.ensure(key).value = value; },
  reset(feature) { Object.keys(this.values).forEach(k => { if (k.indexOf((feature || 'school') + '_') === 0) this.values[k] = { value: 0, total: 0, max: 0 }; }); }
};

/* ===== 4. SC_UNLOCK：解锁系统（同步 GB_UNLOCK 全局状态） =====
 * SC_UNLOCK 原本是藏经阁模块自管的解锁表，但项目已经有 GB_UNLOCK + GB_META 统一管理
 * 所有 Feature / Subfeature 的解锁（globalLevel 阈值触发），所以 SC_UNLOCK 的查询必
 * 须透传到 GB_UNLOCK，否则藏经阁各学科永远显示"未解锁"。
 */
const SC_UNLOCK = {
  items: {},
  init(id) {
    if (!this.items[id]) this.items[id] = { init: false, see: false, use: false };
    // 同步 GB_UNLOCK 的全局解锁状态
    if (typeof GB_UNLOCK !== 'undefined') {
      const gbi = GB_UNLOCK.items[id];
      if (gbi) { this.items[id].see = !!gbi.see; this.items[id].use = !!gbi.use; }
    }
    return this.items[id];
  },
  unlock(id) { const it = this.init(id); it.init = true; it.see = true; it.use = true; return it; },
  isUnlocked(id) {
    if (typeof GB_UNLOCK !== 'undefined') return GB_UNLOCK.isUnlocked(id);
    return !!(this.items[id] && this.items[id].use);
  },
  isVisible(id) {
    if (typeof GB_UNLOCK !== 'undefined') return GB_UNLOCK.isVisible(id);
    return !!(this.items[id] && this.items[id].see);
  }
};

/* ===== 5. SC_UPG：升级项系统（premium 藏经弟子等） ===== */
const SC_UPG = {
  defs: {}, levels: {}, keep: {}, uncapped: {}, skippedEffects: {},
  register(mapName, map, defaultType) {
    if (!map) return 0;
    let n = 0;
    Object.keys(map).forEach(key => {
      const def = map[key];
      if (!def || typeof def !== 'object') return;
      const id = 'school_' + key;
      def.id = id; def.key = key; def.type = def.type || defaultType; def.effect = def.effect || []; def._map = mapName;
      this.defs[id] = def;
      if (this.levels[id] === undefined) this.levels[id] = 0;
      n++;
    });
    return n;
  },
  cap(id) { if (this.uncapped[id]) return Infinity; const d = this.defs[id]; if (!d || d.cap === undefined || d.cap === null) return Infinity; return d.cap; },
  price(id, lvl) { const d = this.defs[id]; if (!d) return {}; try { return d.price(lvl === undefined ? (this.levels[id] || 0) : lvl) || {}; } catch (e) { return {}; } },
  isVisible(id) { return !!this.defs[id]; },
  isMaxed(id) { const d = this.defs[id]; return !!d && (this.levels[id] || 0) >= this.cap(id); },
  canAfford(id) { if (this.isMaxed(id)) return false; try { return SC_CUR.canAfford(this.price(id)); } catch (e) { return false; } },
  buy(id) {
    const d = this.defs[id];
    if (!d || this.isMaxed(id)) return false;
    const price = this.price(id);
    if (!SC_CUR.canAfford(price)) return false;
    SC_CUR.spendPrice(price);
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
      if (lvl <= 0) { SC_SYSTEM.resetEffect({ type: eff.type, name: eff.name, multKey }); return; }
      let value = 0;
      try { value = typeof eff.value === 'function' ? eff.value(lvl) : eff.value; } catch (e) { value = 0; }
      SC_SYSTEM.applyEffect({ type: eff.type, name: eff.name, multKey, value, trigger: true });
    });
  },
  applyAll() { Object.keys(this.defs).forEach(id => { if (this.levels[id] > 0) this.apply(id); }); },
  list(type) { return Object.keys(this.defs).filter(id => !type || this.defs[id].type === type); }
};

/* ===== 6. 书籍跨模块桥接（把书籍效果写入目标玩法 MULT） ===== */
function scBridgeTargets(name) {
  const n = String(name || '');
  const out = [];
  // 灵脉 mine(global MULT)；宗门 village(VI_MULT)；灵植园 farm(FA_MULT)；降妖 horde(HO_MULT)
  if (/^(mining|currencyMining)/.test(n) && typeof MULT !== 'undefined') out.push(MULT);
  if (/^(village|currencyVillage)/.test(n) && typeof VI_MULT !== 'undefined') out.push(VI_MULT);
  if (/^(farm|currencyFarm)/.test(n) && typeof FA_MULT !== 'undefined') out.push(FA_MULT);
  if (/^(horde|currencyHorde)/.test(n) && typeof HO_MULT !== 'undefined') out.push(HO_MULT);
  // gallery（藏宝阁）未移植 → 静默跳过，不报错
  return out;
}

/* ===== 7. SC_SYSTEM：效果系统 + 跨模块桥接 ===== */
const SC_SYSTEM = {
  state: { features: { school: { currentSubfeature: 0 } }, rng: {} },
  effectLog: {},
  globalLevelParts: {},           // feature_subfeature → 等级（书籍 scalesWithGL 用）
  setEffect(name) { scBridgeTargets(name); return SC_MULT; },
  applyEffect(o) {
    if (!o) return;
    const value = typeof o.value === 'function' ? o.value() : o.value;
    // 先写入本模块 SC_MULT（跨模块效果名在 SC_MULT 中若无对应项则为空操作，安全）
    switch (o.type) {
      case 'mult': SC_MULT.setMult({ name: o.name, key: o.multKey, value }); break;
      case 'base': SC_MULT.setBase({ name: o.name, key: o.multKey, value }); break;
      case 'bonus': SC_MULT.setBonus({ name: o.name, key: o.multKey, value }); break;
      case 'unlock': SC_UNLOCK.unlock(o.name); break;
      case 'keepUpgrade': if (value) SC_UPG.keep[o.name] = true; else delete SC_UPG.keep[o.name]; break;
      case 'uncapUpgrade': if (value) SC_UPG.uncapped[o.name] = true; else delete SC_UPG.uncapped[o.name]; break;
      case 'setMin': SC_MULT.setMin({ name: o.name, value }); break;
      case 'setMax': SC_MULT.setMax({ name: o.name, value }); break;
      default: SC_UPG.skippedEffects[o.type] = (SC_UPG.skippedEffects[o.type] || 0) + 1; break;
    }
    // 跨模块桥接（仅 mult/base/bonus 三类数值效果；unlock/uncap 类不动其他模块）
    if (o.type === 'mult' || o.type === 'base' || o.type === 'bonus') {
      const targets = scBridgeTargets(o.name);
      for (let i = 0; i < targets.length; i++) {
        const TM = targets[i];
        try {
          if (o.type === 'mult') TM.setMult({ name: o.name, key: o.multKey, value });
          else if (o.type === 'base') TM.setBase({ name: o.name, key: o.multKey, value });
          else if (o.type === 'bonus') TM.setBonus({ name: o.name, key: o.multKey, value });
        } catch (e) { /* 目标模块不可用则静默跳过 */ }
      }
    }
  },
  resetEffect(o) {
    if (!o) return;
    if (o.type === 'mult' || o.type === 'base' || o.type === 'bonus') {
      SC_MULT.removeKeyAnywhere(o.multKey);
      const targets = scBridgeTargets(o.name);
      for (let i = 0; i < targets.length; i++) {
        try { targets[i].removeKeyAnywhere(o.multKey); } catch (e) { /* ignore */ }
      }
    } else if (o.type === 'keepUpgrade') {
      delete SC_UPG.keep[o.name];
    } else if (o.type === 'uncapUpgrade') {
      delete SC_UPG.uncapped[o.name];
    }
  }
};

/* ===== 8. SC_TAG：标签效果 ===== */
const SC_TAG = {
  defs: {}, values: {},
  init(name, def) { this.defs[name] = def; return this; },
  set(o) { this.values[o.name + '__' + o.key] = o.value; },
  reset(o) { delete this.values[o.name + '__' + o.key]; },
  values(name) {
    const def = this.defs[name];
    if (!def) return [0];
    const counts = {};
    for (const k in this.values) { if (k.indexOf(name + '__') === 0) counts[k.split('__')[1]] = this.values[k]; }
    const stacked = Object.values(counts);
    if (def.stacking === 'add') {
      const arr = [];
      const pLen = (def.params || []).length;
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

/* ===== 9. SCTORE：Vuex 极小替身（school 专属 commit/dispatch） ===== */
const SCTORE = {
  state: null, _v: null, getters: {},
  _audit: { commits: {}, dispatches: {}, unknown: {} },
  commit(type, payload) {
    this._audit.commits[type] = (this._audit.commits[type] || 0) + 1;
    const p = payload || {};
    const bare = type.indexOf('school/') === 0 ? type.slice(7) : type;
    if (type.indexOf('school/') === 0 && SC_STORE.mutations[bare]) {
      try { SC_STORE.mutations[bare](this._v, p); } catch (e) { SC_RT.warnings.push('commit:' + type + ': ' + e.message); }
      return;
    }
    switch (type) {
      case 'stat/add': SC_STAT.add('school_' + (p.name || p), p.value); break;
      case 'stat/increaseTo': SC_STAT.increaseTo('school_' + (p.name || p), p.value); break;
      case 'stat/reset': SC_STAT.reset(p); break;
      case 'currency/add': SC_CUR.add((p.feature || 'school') + '_' + p.name, p.amount); break;
      case 'system/updateKey': if (this._sysState) this._sysState[p.key] = p.value; break;
      case 'unlock/unlock': SC_UNLOCK.unlock(p.name || p); break;
      case 'unlock/init': SC_UNLOCK.init(p.name || p); break;
      case 'system/addNotification': break;
      case 'tag/set': SC_TAG.set(p); break;
      case 'tag/reset': SC_TAG.reset(p); break;
      case 'note/find': break;
      case 'mult/updateExternalCaches': break;
      default:
        if (SC_STORE.mutations[bare]) {
          try { SC_STORE.mutations[bare](this._v, p); } catch (e) { SC_RT.warnings.push('commit:' + type + ': ' + e.message); }
        } else { this._audit.unknown['commit:' + type] = (this._audit.unknown['commit:' + type] || 0) + 1; }
        break;
    }
  },
  dispatch(type, payload, opt) {
    this._audit.dispatches[type] = (this._audit.dispatches[type] || 0) + 1;
    const p = payload || {};
    const bare = type.indexOf('school/') === 0 ? type.slice(7) : type;
    if (type.indexOf('school/') === 0 && SC_STORE.actions[bare]) return SC_RT.act(bare, p);
    switch (type) {
      case 'currency/gain': SC_CUR.gain(p); break;
      case 'currency/spend': SC_CUR.spend((p.feature || 'school') + '_' + p.name, p.amount); break;
      case 'currency/reset': SC_CUR.reset(p); break;
      case 'currency/add': SC_CUR.add((p.feature || 'school') + '_' + p.name, p.amount); break;
      case 'mult/setBase': SC_MULT.setBase(p); break;
      case 'mult/setMult': SC_MULT.setMult(p); break;
      case 'mult/setBonus': SC_MULT.setBonus(p); break;
      case 'mult/removeKey': SC_MULT.removeKeyAnywhere(p.key); break;
      case 'stat/add': SC_STAT.add('school_' + (p.name || p), p.value); break;
      case 'stat/increaseTo': SC_STAT.increaseTo('school_' + (p.name || p), p.value); break;
      case 'stat/reset': SC_STAT.reset(p); break;
      case 'system/applyEffect': SC_SYSTEM.applyEffect(p); break;
      case 'system/resetEffect': SC_SYSTEM.resetEffect(p); break;
      case 'system/updateKey': if (this._sysState) this._sysState[p.key] = p.value; break;
      case 'unlock/unlock': SC_UNLOCK.unlock(p.name || p); break;
      case 'note/find': break;
      case 'meta/globalLevelPart': if (typeof p === 'string') { SC_RT.state.meta = SC_RT.state.meta || {}; SC_RT.state.meta.globalLevelParts = SC_RT.state.meta.globalLevelParts || {}; } break;
      default:
        if (SC_STORE.actions[bare]) return SC_RT.act(bare, p);
        this._audit.unknown['dispatch:' + type] = (this._audit.unknown['dispatch:' + type] || 0) + 1;
        break;
    }
  }
};

/* ===== 10. SC_RT：藏经阁模块运行时 ===== */
const SC_RT = {
  MULT: SC_MULT, CUR: SC_CUR, STAT: SC_STAT, UNLOCK: SC_UNLOCK, UPG: SC_UPG, SYSTEM: SC_SYSTEM, TAG: SC_TAG,
  store: SCTORE,
  ready: false, warnings: [],
  state: null, getters: null,
  _root: null, _sysState: null, _rng: {},
  tickspeed: 1,

  init(state) {
    if (state === null || state === undefined) state = {};
    this.state = state;
    state.stat = state.stat || {};
    state.unlock = state.unlock || {};
    state.currencyVals = state.currencyVals || {};
    state.upgradeLevels = state.upgradeLevels || {};
    state.subject = state.subject || {};
    state.book = state.book || {};
    state.totalPointRequirement = state.totalPointRequirement || [1000, 2500, 5000, 10000, 20000, 30000, 40000, 70000, 100000, 150000, 200000, 250000];
    state.emeraldRequirement = state.emeraldRequirement || [10, 30, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500];
    state.crownRequirement = state.crownRequirement || [
      { amount: 100000, color: null, size: 14 },
      { amount: 250000, color: 'cherry', size: 18 },
      { amount: 500000, color: 'light-grey', size: 22 },
      { amount: 1000000, color: 'amber', size: 26 },
      { amount: 2500000, color: 'red', size: 30 },
      { amount: 5000000, color: 'cyan', size: 34 },
      { amount: 10000000, color: 'deep-purple', size: 38 }
    ];
    state.bonusDust = state.bonusDust || 0;
    state.multipass = state.multipass || 1;
    state.meta = state.meta || {};
    state.meta.globalLevelParts = state.meta.globalLevelParts || {};

    SC_MULT.items = {}; SC_STAT.values = state.stat; SC_UNLOCK.items = state.unlock;
    SC_CUR.values = state.currencyVals; SC_UPG.levels = state.upgradeLevels;
    this._sysState = state.system = state.system || { rng: {}, features: { school: { currentSubfeature: 0 } } };
    if (!this._sysState.settings) this._sysState.settings = { notification: { items: {} } };
    if (!this._sysState.features) this._sysState.features = { school: { currentSubfeature: 0 } };
    this._rng = state.system.rng || {};

    SCTORE._v = state;
    SCTORE._sysState = this._sysState;
    SCTORE.state = {
      school: state, stat: state.stat, unlock: state.unlock,
      currency: this._currencyProxy(), upgrade: {}, system: this._sysState,
      meta: state.meta, card: { card: {}, feature: { school: { powerReward: [] } } },
      mult: { items: SC_MULT.items }
    };
    this._root = SCTORE.state;

    const guard = (label, fn) => { try { fn(); } catch (e) { this.warnings.push(label + ': ' + e.message); } };

    guard('stat', () => Object.keys(SC_MODULE.stat || {}).forEach(k => SC_STAT.ensure('school_' + k)));
    guard('mult', () => Object.keys(SC_MODULE.mult || {}).forEach(k => SC_MULT.init(k, SC_MODULE.mult[k])));
    guard('tag', () => Object.keys(SC_MODULE.tag || {}).forEach(k => SC_TAG.init(k, SC_MODULE.tag[k])));
    guard('unlock', () => (SC_MODULE.unlock || []).forEach(id => SC_UNLOCK.init(id)));
    guard('currency', () => {
      Object.keys(SC_MODULE.currency || {}).forEach(k => {
        SC_CUR.init('school_' + k, Object.assign({ feature: 'school' }, SC_MODULE.currency[k]));
      });
    });
    guard('upgrade', () => SC_UPG.register('upgrade', SC_MODULE.upgrade, 'premium'));
    guard('gems', () => {
      // 外部宝石货币（蓝宝/翡翠/红宝），考签购买、跳书、藏经弟子用
      Object.keys(SC_MODULE.gems || {}).forEach(k => {
        SC_CUR.init('gem_' + k, Object.assign({ feature: 'gem', type: 'premium' }, SC_MODULE.gems[k]));
      });
    });
    guard('relic', () => {
      if (SC_MODULE.relic && typeof SC_MODULE.relicInit === 'function') SC_MODULE.relicInit();
    });
    guard('note', () => { if (!state.note) state.note = buildArray(5).map(() => 'g'); });

    this.buildGetters();

    guard('moduleInit', () => SC_MODULE.init());

    this.ready = true;
  },

  _currencyProxy() {
    return new Proxy({}, {
      get(t, prop) {
        if (typeof prop !== 'string' || prop === 'toJSON') return undefined;
        const def = SC_CUR.defs[prop];
        if (!def) return undefined;
        return { value: SC_CUR.value(prop), cap: SC_CUR.cap(prop), unlock: def.unlock, display: def.display, subtype: def.subtype };
      }
    });
  },

  bumpRng(name, amount) { if (name === undefined) return; this._rng[name] = (this._rng[name] || 0) + (amount || 0); },
  rngGen(name, seed) {
    let h = 0; const s = String(name) + '_' + (seed ?? 0);
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    const x = Math.abs((h >>> 0) + 1) / 4294967295;
    return x;
  },
  rngSeq(name, seed) { const self = this; let i = 0; return () => self.rngGen(name, (seed ?? 0) + (i++)); },

  rootGetters() {
    const self = this;
    if (!this._rootGettersCache) {
      this._rootGettersCache = {
        'mult/get': (name, base, mult, bonus, bl) => SC_MULT.get(name, base, mult, bonus, bl),
        'mult/list': (mod) => Object.keys(SC_MULT.items).filter(n => !mod || SC_MULT.items[n][mod]),
        'currency/value': (key) => SC_CUR.value(key),
        'currency/cap': (key) => SC_CUR.cap(key),
        'currency/values': () => SC_CUR.values,
        'currency/list': (f, type, subtype) => SC_CUR.list(f, type, subtype),
        'currency/canAfford': (price, maxPrice) => SC_CUR.canAfford(price, maxPrice),
        'currency/gainMultName': (feature, name) => 'currency' + capitalize(feature || 'school') + capitalize(name) + 'Gain',
        'currency/capMultName': (feature, name) => 'currency' + capitalize(feature || 'school') + capitalize(name) + 'Cap',
        'tag/values': (name) => SC_TAG.values(name),
        'system/getRng': (name, amount) => () => this.rngGen(name, amount ?? 0),
        'system/getStaticRng': (name, seed) => this.rngSeq(name, seed),
        'system/rng': () => this._rng,
        'mult/schoolBook': () => SC_MULT.get('schoolBook'),
        'school/bookHint': () => []
      };
    }
    return this._rootGettersCache;
  },

  buildGetters() {
    const g = {};
    const self = this;
    Object.keys(SC_STORE.getters).forEach(name => {
      Object.defineProperty(g, name, {
        enumerable: true, configurable: true,
        get() { return SC_STORE.getters[name](self.state, g, self._root, self.rootGetters()); }
      });
    });
    this.getters = g;
    SCTORE.getters = new Proxy({}, {
      get(t, prop) {
        if (typeof prop !== 'string') return undefined;
        if (prop.indexOf('school/') === 0) return g[prop.slice(7)];
        return self.rootGetters()[prop];
      }
    });
    return g;
  },

  ctx() {
    const self = this;
    return {
      state: this.state, getters: this.getters,
      rootState: this._root, rootGetters: this.rootGetters(),
      commit: (type, payload, opt) => SCTORE.commit(type.indexOf('/') > 0 ? type : 'school/' + type, payload),
      dispatch: (type, payload, opt) => SCTORE.dispatch(type.indexOf('/') > 0 ? type : 'school/' + type, payload, opt)
    };
  },

  act(name, payload) {
    try { return SC_STORE.actions[name](this.ctx(), payload || {}); }
    catch (e) { this.warnings.push('act:' + name + ': ' + e.message); return null; }
  },

  /* 刷新全局等级缓存（供书籍 scalesWithGL / dustMult / 藏书阁筛选） */
  refreshGlobalLevels() {
    let m = this.state.meta;
    if (!m) m = this.state.meta = {};
    const g = m.globalLevelParts = m.globalLevelParts || {};
    const levelOf = (statTotal) => ((statTotal || 0) > 0 ? (statTotal - 1) : 0);
    // 尽力从各已移植模块读取「等级」（读不到则为 0，藏书阁会显示锁定）
    // 降妖：horde_maxZone；宗门：village 里程碑总和；灵植园：farm 里程碑；灵脉：maxDepth
    try { if (typeof HO_STAT !== 'undefined' && HO_STAT.get) g['horde_0'] = levelOf(HO_STAT.get('horde_maxZone')); else if (g['horde_0'] === undefined) g['horde_0'] = 0; } catch (e) { if (g['horde_0'] === undefined) g['horde_0'] = 0; }
    try { if (typeof HO_STAT !== 'undefined' && HO_STAT.get) g['horde_1'] = levelOf(HO_STAT.get('horde_maxZone')); else if (g['horde_1'] === undefined) g['horde_1'] = 0; } catch (e) { if (g['horde_1'] === undefined) g['horde_1'] = 0; }
    try { if (typeof VI_STAT !== 'undefined' && VI_STAT.get && VI_STAT.get('village_totalMilestones')) g['village_0'] = VI_STAT.get('village_totalMilestones'); else if (g['village_0'] === undefined) g['village_0'] = 0; } catch (e) { if (g['village_0'] === undefined) g['village_0'] = 0; }
    try { if (typeof VI_STAT !== 'undefined' && VI_STAT.get && VI_STAT.get('village_totalMilestones')) g['village_1'] = VI_STAT.get('village_totalMilestones'); else if (g['village_1'] === undefined) g['village_1'] = 0; } catch (e) { if (g['village_1'] === undefined) g['village_1'] = 0; }
    try { if (typeof FA_STAT !== 'undefined' && FA_STAT.get) g['farm_0'] = g['farm_0'] || 0; else if (g['farm_0'] === undefined) g['farm_0'] = 0; } catch (e) { if (g['farm_0'] === undefined) g['farm_0'] = 0; }
    try { if (typeof FA_STAT !== 'undefined' && FA_STAT.get) g['farm_1'] = g['farm_1'] || 0; else if (g['farm_1'] === undefined) g['farm_1'] = 0; } catch (e) { if (g['farm_1'] === undefined) g['farm_1'] = 0; }
    try { if (typeof LM_STAT !== 'undefined' && LM_STAT.get) { g['mining_0'] = LM_STAT.get('lm_maxDepth0'); g['mining_1'] = LM_STAT.get('lm_maxDepth1'); } else if (g['mining_0'] === undefined) { g['mining_0'] = 0; g['mining_1'] = 0; } } catch (e) { if (g['mining_0'] === undefined) { g['mining_0'] = 0; g['mining_1'] = 0; } }
    // 全局等级（dustMult 用）：由藏经阁总知识点推得
    m.globalLevel = m.globalLevel || Math.floor(SC_STAT.get('school_totalPoints') / 5000);
    if (m.globalLevel === 0 && SC_STAT.get('school_totalPoints') > 5000) m.globalLevel = Math.floor(SC_STAT.get('school_totalPoints') / 5000);
    return g;
  },

  tick(seconds) {
    if (!this.ready) return;
    try { SC_MODULE.tick(seconds || 1, this._lastTime || 0, (this._lastTime || 0) + (seconds || 1)); } catch (e) { this.warnings.push('tick: ' + e.message); }
    this._lastTime = (this._lastTime || 0) + (seconds || 1);
    this.refreshGlobalLevels();
  },
  forceTick(seconds) { this.tick(seconds); },

  saveGame() {
    try { return SC_MODULE.saveGame(); }
    catch (e) { this.warnings.push('saveGame: ' + e.message); return {}; }
  },
  loadGame(data) {
    try { if (data) SC_MODULE.loadGame(data); }
    catch (e) { this.warnings.push('loadGame: ' + e.message); }
  },
  afterChange() {}
};

/* ===== 11. boot 桥（供视图 / 测试调用） ===== */
function SC_BOOT(state) { SC_RT.init(state); return SC_RT; }
if (typeof module !== "undefined") module.exports = { SC_RT, SC_BOOT };

/* ===== 注册到跨模块地基（数值/存档不变，仅登记引用） ===== */
if (typeof GB_MODULES !== 'undefined') {
  GB_MODULES.register({
    id: 'school', name: '藏经阁', keyPrefix: 'school', tickSpeed: 1, unlockNeeded: 'scFeature',
    core: { MULT: SC_MULT, CUR: SC_CUR, STAT: SC_STAT, UNLOCK: SC_UNLOCK, UPG: SC_UPG, RT: SC_RT }
  });
}