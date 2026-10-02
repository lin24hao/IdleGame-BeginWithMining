/* ============================================================
 * dao_core.js — 大道法则模块（gooboo gem 宝石模块修仙化移植）
 *
 * 完整移植 gooboo src/js/modules/gem.js + src/store/gem.js + gem/forge.js
 * 修仙化设定：
 *   gem → 大道法则
 *   ruby/emerald/sapphire/amethyst/topaz/diamond/onyx → 赤元/青元/玄元/紫元/黄元/混元/道元
 *   achievement totalLevel → GB_META globalLevel
 *   gallery 相关效果 → 换成秘境（ruin）
 *
 * 模块定位：辅助玩法，无声望重置，为各模块提供永久增益。
 * 解锁条件：daoFeature（globalLevel >= 10）
 * 子 feature：daoGemDiamondSubfeature（globalLevel >= 50，解锁混元进度条）
 *
 * 核心玩法循环：
 *   1) 时间 → 主/次/稀有进度条 → 自动产出七元
 *   2) 用赤元/青元买 premium 升级 → 永久速度/容量增益
 *   3) 用混元锻造跨界神器 → 给各模块加 mult/base 效果（等价 gooboo diamond forge）
 *
 * 常量（对齐 gooboo src/js/constants.js）：
 *   GEM_SPEED_BASE = 3600       → DAO_SPEED_BASE
 *   GEM_SPEED_PRIMARY_PER_ACHIEVEMENT = 0.01 → DAO_SPEED_PRIMARY_PER_LEVEL
 *   GEM_SPEED_SECONDARY_PER_ACHIEVEMENT = 0.005 → DAO_SPEED_SECONDARY_PER_LEVEL
 *   GEM_SPEED_DIAMOND_BASE = 86400 → DAO_SPEED_DIAMOND_BASE
 * ============================================================ */

// ======= 常量 =======
const DAO_SPEED_BASE = 3600;              // 主/次进度 3600 秒产 1
const DAO_SPEED_DIAMOND_BASE = 86400;     // 稀有进度 86400 秒产 1
const DAO_SPEED_PRIMARY_PER_LEVEL = 0.01;  // globalLevel 每级 +1% 主进度速度
const DAO_SPEED_SECONDARY_PER_LEVEL = 0.005; // globalLevel 每级 +0.5% 次进度速度

// ======= 7 元定义（修仙化命名 + 颜色 + gooboo gem 对应） =======
const DAO_CURDATA = {
  // 主进度产出
  chiyuan: {   // 赤元（火·ruby·永久升级主货币）
    name: '赤元', color: '#ef4444', icon: 'mdi-rhombus', display: 'int',
    type: 'primary',
    gainMult: { round: true, baseValue: 1 },
  },
  qingyuan: {  // 青元（木·emerald·可替换/刷物品）
    name: '青元', color: '#22c55e', icon: 'mdi-hexagon', display: 'int',
    type: 'primary',
  },
  // 次进度产出
  ziyuan: {    // 紫元（金·amethyst·装饰/外观类）
    name: '紫元', color: '#a855f7', icon: 'mdi-cards-diamond', display: 'int',
    type: 'secondary',
  },
  xuanyuan: {  // 玄元（水·sapphire·临时加速增益）
    name: '玄元', color: '#3b82f6', icon: 'mdi-pentagon', display: 'int',
    type: 'secondary',
  },
  huangyuan: { // 黄元（土·topaz·活动/稀有货币·有容量上限）
    name: '黄元', color: '#f59e0b', icon: 'mdi-triangle', display: 'int',
    type: 'secondary', capMult: { round: true, baseValue: 1000 },
  },
  // 稀有产出（需子 feature 解锁）
  hunyuan: {   // 混元（阳·diamond·锻造跨界神器用）
    name: '混元', color: '#06b6d4', icon: 'mdi-diamond', display: 'int',
    type: 'rare',
  },
  // 极稀有（prestige 产，暂藏）
  daoyuan: {   // 道元（阴·onyx·极稀有）
    name: '道元', color: '#7c3aed', icon: 'mdi-octagon', display: 'int',
    type: 'legendary',
  },
};

/* ============================================================
 * DAO_MULT —— 模块自带 MULT 系统（简化版，与 FA_MULT/RU_MULT 同构）
 * ============================================================ */
const DAO_MULT = {
  values: {},
  missing: [],
  init(name, o) {
    o = o || {};
    const item = {
      feature: o.feature || 'dao',
      baseValue: o.baseValue || 0,
      multCache: 1,
      bonusCache: 0,
      baseValues: {}, multValues: {}, bonusValues: {},
      round: o.round || false,
      min: (o.min === undefined ? null : o.min),
      max: (o.max === undefined ? null : o.max),
    };
    this.values[name] = item;
    this._recompute(item);  // 初始化 baseCache/bonusCache/multCache
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
    const item = this.values[name];
    if (!item) return;
    const bag = kind === 'base' ? item.baseValues : (kind === 'mult' ? item.multValues : item.bonusValues);
    if (value === null) delete bag[key || name]; else bag[key || name] = value;
    this._recompute(item);
  },
  setBase(o) { this._propagate(o.name, 'base', o.key, o.value); },
  setMult(o) { this._propagate(o.name, 'mult', o.key, o.value); },
  setBonus(o) { this._propagate(o.name, 'bonus', o.key, o.value); },
  removeKeyAnywhere(key) {
    for (const n in this.values) {
      const t = this.values[n];
      let dirty = false;
      ['baseValues', 'multValues', 'bonusValues'].forEach(bagName => {
        if (key in t[bagName]) { delete t[bagName][key]; dirty = true; }
      });
      if (dirty) this._recompute(t);
    }
  },
  get(name) {
    let item = this.values[name];
    if (!item) {
      if (this.missing.indexOf(name) < 0) this.missing.push(name);
      item = this.init(name, {});
    }
    let value = item.baseCache * item.multCache + item.bonusCache;
    if (item.min !== null) value = Math.max(value, item.min);
    if (item.max !== null) value = Math.min(value, item.max);
    if (item.round) value = Math.round(value);
    if (!isFinite(value)) value = 0;
    return value;
  }
};

/* ============================================================
 * DAO_CUR —— 模块自带 CUR 系统
 * ============================================================ */
const DAO_CUR = {
  defs: {}, values: {}, capByMult: {},
  _suffix(key) { return key.split('_').slice(1).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(''); },
  _multNames(key) {
    const sf = DAO_CUR._suffix(key);
    return {
      gainMultName: 'currencyDao' + sf + 'Gain',
      capMultName: 'currencyDao' + sf + 'Cap',
    };
  },
  init(key, def) {
    def = def || {};
    def.key = key;
    this.defs[key] = def;
    if (this.values[key] === undefined) this.values[key] = def.value || 0;
    const { gainMultName, capMultName } = this._multNames(key);
    DAO_MULT.init(gainMultName, Object.assign({ feature: 'dao' }, def.gainMult || {}));
    DAO_MULT.init(capMultName, Object.assign({ feature: 'dao' }, def.capMult || {}));
    if (def.capMult) this.capByMult[capMultName] = key;
    return def;
  },
  value(key) { return this.values[key] === undefined ? 0 : this.values[key]; },
  cap(key) {
    const def = this.defs[key];
    if (!def) return 0;
    if (!def.capMult && !this.capByMult[this._multNames(key).capMultName]) return Infinity;
    return DAO_MULT.get(this._multNames(key).capMultName);
  },
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
  canAfford(price) {
    if (!price || typeof price !== 'object') return true;
    for (const k in price) { if (this.value(k) < price[k]) return false; }
    return true;
  },
  spendPrice(price) { for (const k in price) this.spend(k, price[k]); },
  gain(o) {
    const names = Array.isArray(o.name) ? o.name : [o.name];
    names.forEach(n => {
      const key = n.indexOf('_') > 0 ? n : ('dao_' + n);
      let amt = o.amount;
      if (o.gainMultName) amt *= DAO_MULT.get(o.gainMultName);
      DAO_CUR.add(key, amt);
    });
  },
};

// 初始化 7 元货币
for (const k in DAO_CURDATA) {
  DAO_CUR.init('dao_' + k, Object.assign({ feature: 'dao' }, DAO_CURDATA[k]));
}

/* ============================================================
 * DAO_UPG —— 升级项系统（regular + premium）
 * 升级定义由 dao_data.js 提供，这里只做注册和应用逻辑
 * ============================================================ */
const DAO_UPG = {
  defs: {}, levels: {},
  register(map, defaultType) {
    if (!map) return 0;
    let n = 0;
    Object.keys(map).forEach(key => {
      const def = map[key];
      if (!def || typeof def !== 'object') return;
      const id = 'dao_' + key;
      def.id = id;
      def.key = key;
      def.type = def.type || defaultType || 'regular';
      def.effect = def.effect || [];
      this.defs[id] = def;
      if (this.levels[id] === undefined) this.levels[id] = 0;
      n++;
    });
    return n;
  },
  cap(id) {
    const d = this.defs[id];
    if (!d || d.cap === undefined || d.cap === null) return Infinity;
    return d.cap;
  },
  price(id, lvl) {
    const d = this.defs[id];
    if (!d) return {};
    const l = lvl === undefined ? (this.levels[id] || 0) : lvl;
    try { return d.price(l) || {}; } catch (e) { return {}; }
  },
  requirementMet(id) {
    const d = this.defs[id];
    if (!d) return false;
    if (typeof d.requirement === 'function') {
      try { return !!d.requirement(); } catch (e) { return false; }
    }
    return true;
  },
  isMaxed(id) { return (this.levels[id] || 0) >= this.cap(id); },
  canAfford(id) {
    if (this.isMaxed(id)) return false;
    try { return DAO_CUR.canAfford(this.price(id)); } catch (e) { return false; }
  },
  buy(id) {
    const d = this.defs[id];
    if (!d || this.isMaxed(id)) return false;
    if (!this.requirementMet(id)) return false;
    const price = this.price(id);
    if (!DAO_CUR.canAfford(price)) return false;
    DAO_CUR.spendPrice(price);
    this.levels[id] = (this.levels[id] || 0) + 1;
    this.apply(id);
    return true;
  },
  _applyEffect(eff, multKey, value) {
    switch (eff.type) {
      case 'mult': DAO_MULT.setMult({ name: eff.name, key: multKey, value }); break;
      case 'base': DAO_MULT.setBase({ name: eff.name, key: multKey, value }); break;
      case 'bonus': DAO_MULT.setBonus({ name: eff.name, key: multKey, value }); break;
      case 'unlock':
        if (typeof GB_UNLOCK !== 'undefined' && typeof GB_UNLOCK.unlock === 'function' && eff.value) {
          GB_UNLOCK.unlock(eff.name);
        }
        break;
      default: break;
    }
  },
  apply(id) {
    const d = this.defs[id];
    if (!d) return;
    const lvl = this.levels[id] || 0;
    d.effect.forEach((eff, k) => {
      const multKey = 'upg_' + id + '_' + k;
      if (lvl <= 0) { DAO_MULT.removeKeyAnywhere(multKey); return; }
      let value = 0;
      try { value = typeof eff.value === 'function' ? eff.value(lvl) : eff.value; } catch (e) { value = 0; }
      this._applyEffect(eff, multKey, value);
    });
  },
  applyAll() { Object.keys(this.defs).forEach(id => { if (this.levels[id] > 0) this.apply(id); }); },
  list(type) { return Object.keys(this.defs).filter(id => !type || this.defs[id].type === type); }
};

/* ============================================================
 * DAO_FORGE —— 锻造系统（gooboo diamond forge 修仙化移植）
 * 用混元购买/升级跨界神器，效果应用到各模块 MULT
 * gallery → 秘境（ruin）
 * ============================================================ */
const DAO_FORGE = {
  defs: {},                       // { forgeKey: { relic, type, upgradeLevel, price, condition } }
  state: {},                      // { relicKey: { found: bool, level: number } }

  init(defs) {
    if (!defs) return;
    for (const key in defs) {
      const d = defs[key];
      this.defs[key] = {
        relic: d.relic,
        type: d.type || 'buy',     // 'buy' | 'upgrade'
        upgradeLevel: d.upgradeLevel || null,
        price: d.price || 50,
        condition: d.condition || (() => true),
      };
      // 初始化 state
      if (!this.state[d.relic]) {
        this.state[d.relic] = { found: false, level: 0 };
      }
    }
  },

  /* 当前可购买的锻造列表 */
  list() {
    const arr = [];
    for (const key in this.defs) {
      const d = this.defs[key];
      const relic = this.state[d.relic];
      let eligible = false;
      if (d.type === 'buy' && !relic.found) eligible = true;
      else if (d.type === 'upgrade' && relic.found && relic.level === d.upgradeLevel) eligible = true;
      if (eligible && d.condition()) arr.push(key);
    }
    return arr;
  },

  /* 购买锻造 */
  buy(key) {
    const d = this.defs[key];
    if (!d) return { ok: false, reason: 'notFound' };
    const price = d.price;
    if (!DAO_CUR.canAfford({ dao_hunyuan: price })) return { ok: false, reason: 'hunyuan' };
    const relic = this.state[d.relic];
    if (!relic) return { ok: false, reason: 'noRelic' };

    DAO_CUR.spend('dao_hunyuan', price);

    if (d.type === 'buy') {
      relic.found = true;
      relic.level = 1;
    } else if (d.type === 'upgrade') {
      relic.level = d.upgradeLevel + 1;
    }

    // 应用效果到各模块
    this.applyRelic(d.relic);
    return { ok: true, relic: d.relic };
  },

  /* 应用跨界神器效果（需要 DAO_DATA.FORGE_RELICS 定义） */
  applyRelic(relicKey) {
    const relic = this.state[relicKey];
    if (!relic || !relic.found) return;
    if (typeof DAO_DATA === 'undefined' || !DAO_DATA.FORGE_RELICS) return;
    const def = DAO_DATA.FORGE_RELICS[relicKey];
    if (!def) return;
    const effects = typeof def.effect === 'function' ? def.effect(relic.level) : def.effect;
    effects.forEach(eff => {
      if (eff.type === 'mult') {
        GB_MODULES.multSetMult({ feature: 'dao', name: eff.name, key: 'forge_' + relicKey, value: eff.value });
      } else if (eff.type === 'base') {
        GB_MODULES.multSetBase({ feature: 'dao', name: eff.name, key: 'forge_' + relicKey, value: eff.value });
      }
    });
  },

  /* 清除所有锻造效果（hardReset 用） */
  clearAllEffects() {
    if (typeof DAO_DATA === 'undefined' || !DAO_DATA.FORGE_RELICS) return;
    for (const key in DAO_DATA.FORGE_RELICS) {
      const def = DAO_DATA.FORGE_RELICS[key];
      const effects = typeof def.effect === 'function' ? def.effect(1) : def.effect;
      effects.forEach(eff => {
        GB_MODULES.multRemoveKey({ feature: 'dao', name: eff.name });
      });
    }
  }
};

/* ============================================================
 * 派生 multiplier 初始化 —— 速度计算基于 globalLevel（gooboo achievement totalLevel）
 * ============================================================ */
DAO_MULT.init('daoGenSpeedPrimary', { feature: 'dao', baseValue: 1 });
DAO_MULT.init('daoGenSpeedSecondary', { feature: 'dao', baseValue: 1 });

/* 获取当前速度（每次 tick 前动态计算） */
function getSpeedPrimary() {
  let speed = 1;
  // 基础值 + globalLevel 加成（对齐 gooboo achievement totalLevel * 0.01）
  if (typeof GB_META !== 'undefined') {
    speed += GB_META.getLevel() * DAO_SPEED_PRIMARY_PER_LEVEL;
  }
  // 再加上升级的 mult/base
  speed *= DAO_MULT.get('daoGenSpeedPrimary') / DAO_MULT.values['daoGenSpeedPrimary'].baseValue;
  return speed;
}
function getSpeedSecondary() {
  let speed = 1;
  if (typeof GB_META !== 'undefined') {
    speed += GB_META.getLevel() * DAO_SPEED_SECONDARY_PER_LEVEL;
  }
  speed *= DAO_MULT.get('daoGenSpeedSecondary') / DAO_MULT.values['daoGenSpeedSecondary'].baseValue;
  return speed;
}

/* ============================================================
 * 核心状态
 * ============================================================ */
const DAO_STATE = {
  progressPrimary: 0,   // 主进度（→ 赤元 + 青元）
  progressSecondary: 0, // 次进度（→ 紫元 + 玄元 + 黄元）
  progressDiamond: 0,   // 稀有进度（→ 混元，需子 feature 解锁）
};

/* ============================================================
 * 仙尊核心对象（对外暴露的统一模块接口）
 * ============================================================ */
const DAO_MODULE = {
  name: 'dao',
  keyPrefix: 'dao',
  feature: 'dao',

  CUR: DAO_CUR,
  MULT: DAO_MULT,
  STATE: DAO_STATE,
  UPG: DAO_UPG,
  FORGE: DAO_FORGE,

  STAT: {
    values: {
      dao_totalChiyuan: { value: 0 },
      dao_totalQingyuan: { value: 0 },
      dao_totalZiyuan: { value: 0 },
      dao_totalXuanyuan: { value: 0 },
      dao_totalHuangyuan: { value: 0 },
      dao_totalHunyuan: { value: 0 },
      dao_totalDaoyuan: { value: 0 },
    },
  },

  /* tick —— 三进度产出（对齐 gooboo gem.js tick） */
  RT: {
    tick(seconds) {
      if (seconds <= 0) return;

      // === 主进度 → 赤元 + 青元 ===
      const genPrimary = getSpeedPrimary() / DAO_SPEED_BASE;
      DAO_STATE.progressPrimary += seconds * genPrimary;
      if (DAO_STATE.progressPrimary >= 1) {
        const gems = Math.floor(DAO_STATE.progressPrimary);
        DAO_CUR.add('dao_chiyuan', gems);
        DAO_CUR.add('dao_qingyuan', gems);
        DAO_MODULE.STAT.values.dao_totalChiyuan.value += gems;
        DAO_MODULE.STAT.values.dao_totalQingyuan.value += gems;
        DAO_STATE.progressPrimary -= gems;
      }

      // === 次进度 → 紫元 + 玄元 + 黄元 ===
      const genSecondary = getSpeedSecondary() / DAO_SPEED_BASE;
      DAO_STATE.progressSecondary += seconds * genSecondary;
      if (DAO_STATE.progressSecondary >= 1) {
        const gems = Math.floor(DAO_STATE.progressSecondary);
        DAO_CUR.add('dao_ziyuan', gems);
        DAO_CUR.add('dao_xuanyuan', gems);
        DAO_CUR.add('dao_huangyuan', gems);
        DAO_MODULE.STAT.values.dao_totalZiyuan.value += gems;
        DAO_MODULE.STAT.values.dao_totalXuanyuan.value += gems;
        DAO_MODULE.STAT.values.dao_totalHuangyuan.value += gems;
        DAO_STATE.progressSecondary -= gems;
      }

      // === 稀有进度 → 混元（需 daoGemDiamondSubfeature 解锁） ===
      if (typeof GB_UNLOCK !== 'undefined' && GB_UNLOCK.isUnlocked('daoGemDiamondSubfeature')) {
        const diamondSpeed = 1 / DAO_SPEED_DIAMOND_BASE;
        DAO_STATE.progressDiamond += seconds * diamondSpeed;
        if (DAO_STATE.progressDiamond >= 1) {
          const gems = Math.floor(DAO_STATE.progressDiamond);
          DAO_CUR.add('dao_hunyuan', gems);
          DAO_MODULE.STAT.values.dao_totalHunyuan.value += gems;
          DAO_STATE.progressDiamond -= gems;
        }
      }
    },

    afterChange() {
      try { DAO_UPG.applyAll(); } catch (e) {}
    },
  },

  // ======= 存档钩子（对齐 gooboo saveGame/loadGame） =======
  snapshot() {
    const obj = {
      progressPrimary: DAO_STATE.progressPrimary,
      progressSecondary: DAO_STATE.progressSecondary,
    };
    if (DAO_STATE.progressDiamond > 0) obj.progressDiamond = DAO_STATE.progressDiamond;
    // 7 元货币
    for (const k in DAO_CURDATA) {
      const v = DAO_CUR.value('dao_' + k);
      if (v > 0) obj['cur_' + k] = v;
    }
    // 升级等级
    const upgLevels = {};
    for (const id in DAO_UPG.levels) {
      if (DAO_UPG.levels[id] > 0) upgLevels[id] = DAO_UPG.levels[id];
    }
    if (Object.keys(upgLevels).length > 0) obj.upg = upgLevels;
    // 锻造状态
    const forgeOwned = [];
    const forgeLevels = {};
    for (const rk in DAO_FORGE.state) {
      const s = DAO_FORGE.state[rk];
      if (s.found) forgeOwned.push(rk);
      if (s.level > 0) forgeLevels[rk] = s.level;
    }
    if (forgeOwned.length > 0) obj.forgeOwned = forgeOwned;
    if (Object.keys(forgeLevels).length > 0) obj.forgeLevel = forgeLevels;
    return obj;
  },

  restore(data) {
    if (!data) return;
    ['progressPrimary', 'progressSecondary', 'progressDiamond'].forEach(k => {
      if (data[k] !== undefined) DAO_STATE[k] = data[k];
    });
    for (const k in DAO_CURDATA) {
      if (data['cur_' + k] !== undefined) {
        DAO_CUR.values['dao_' + k] = data['cur_' + k];
      }
    }
    // 升级等级
    if (data.upg) {
      for (const id in data.upg) {
        if (DAO_UPG.defs[id]) DAO_UPG.levels[id] = data.upg[id];
      }
    }
    // 锻造状态
    if (data.forgeOwned) {
      data.forgeOwned.forEach(rk => {
        if (DAO_FORGE.state[rk]) DAO_FORGE.state[rk].found = true;
      });
    }
    if (data.forgeLevel) {
      for (const rk in data.forgeLevel) {
        if (DAO_FORGE.state[rk]) DAO_FORGE.state[rk].level = data.forgeLevel[rk];
      }
    }
    // 恢复后重新应用
    DAO_UPG.applyAll();
    for (const rk in DAO_FORGE.state) {
      if (DAO_FORGE.state[rk].found) DAO_FORGE.applyRelic(rk);
    }
  },

  hardReset() {
    DAO_STATE.progressPrimary = 0;
    DAO_STATE.progressSecondary = 0;
    DAO_STATE.progressDiamond = 0;
    for (const k in DAO_CURDATA) DAO_CUR.values['dao_' + k] = 0;
    for (const k in DAO_MODULE.STAT.values) DAO_MODULE.STAT.values[k].value = 0;
    // 清除升级
    for (const id in DAO_UPG.levels) DAO_UPG.levels[id] = 0;
    DAO_UPG.applyAll();
    // 清除锻造
    DAO_FORGE.clearAllEffects();
    for (const rk in DAO_FORGE.state) {
      DAO_FORGE.state[rk] = { found: false, level: 0 };
    }
    // 清除 DAO_MULT 里所有非基础值
    for (const n in DAO_MULT.values) {
      const item = DAO_MULT.values[n];
      item.baseValues = {}; item.multValues = {}; item.bonusValues = {};
      item.multCache = 1; item.bonusCache = 0;
    }
  },

  onAfterLoad() {
    // 大道法则不贡献 globalLevelPart，只作为辅助模块
  },
};

// ======= 注册到 GB_MODULES =======
if (typeof GB_MODULES !== 'undefined') {
  GB_MODULES.register({
    id: 'dao', name: '大道法则', keyPrefix: 'dao', tickSpeed: 1,
    unlockNeeded: 'daoFeature',
    core: DAO_MODULE,
    onAfterLoad: () => { DAO_UPG.applyAll(); },
  });
}

if (typeof window !== 'undefined') {
  window.DAO_MODULE = DAO_MODULE;
  window.DAO_CUR = DAO_CUR;
  window.DAO_MULT = DAO_MULT;
  window.DAO_UPG = DAO_UPG;
  window.DAO_FORGE = DAO_FORGE;
  window.DAO_STATE = DAO_STATE;
}
