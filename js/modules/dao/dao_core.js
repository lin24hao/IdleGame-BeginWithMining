/* ============================================================
 * dao_core.js — 大道法则模块（gemFeature 修仙化移植）
 *
 * 7 元（五行 + 阴阳）：
 *   赤元（火·永久升级主货币）     对应 ruby
 *   青元（木·可替换/刷物品）      对应 emerald
 *   紫元（金·装饰/外观类）        对应 amethyst
 *   玄元（水·临时加速增益）      对应 sapphire
 *   黄元（土·活动/稀有货币）     对应 topaz
 *   混元（阳·稀有）              对应 diamond
 *   道元（阴·极稀有）            对应 onyx
 *
 * tick 速度：每 3600 秒产 1 颗（GEM_SPEED_BASE=3600）
 *   主进度 → 产赤元+青元
 *   次进度 → 产紫元+玄元+黄元
 *   稀有进度 → 产混元（需子 feature gemDiamond unlock）
 *
 * 进度条逻辑完全对齐 gooboo src/js/modules/gem.js
 * 依赖：GB_MODULES, app.js 的 GB_CUR 桥（若有）, 或自带 DAO_CUR/DAO_MULT
 * ============================================================ */

// ======= 常量 =======
const DAO_SPEED_BASE = 3600;           // 主/次进度 3600 秒产 1
const DAO_SPEED_DIAMOND_BASE = 86400;  // 稀有进度 86400 秒产 1

// ======= 7 元定义（修仙化命名 + 颜色） =======
const DAO_CURDATA = {
  // 主要进度产出
  chiyuan: {   // 赤元（火·永久升级主货币）
    name: '赤元', color: '#ef4444', icon: 'mdi-rhombus', display: 'int',
    type: 'primary',
  },
  qingyuan: {  // 青元（木·可替换/刷物品）
    name: '青元', color: '#22c55e', icon: 'mdi-hexagon', display: 'int',
    type: 'primary',
  },
  // 次要进度产出
  ziyuan: {    // 紫元（金·装饰/外观类）
    name: '紫元', color: '#a855f7', icon: 'mdi-cards-diamond', display: 'int',
    type: 'secondary',
  },
  xuanyuan: {  // 玄元（水·临时加速增益）
    name: '玄元', color: '#3b82f6', icon: 'mdi-pentagon', display: 'int',
    type: 'secondary',
  },
  huangyuan: { // 黄元（土·活动/稀有货币）
    name: '黄元', color: '#f59e0b', icon: 'mdi-triangle', display: 'int',
    type: 'secondary', capMult: { round: true, baseValue: 1000 },
  },
  // 稀有
  hunyuan: {   // 混元（阳·稀有）
    name: '混元', color: '#06b6d4', icon: 'mdi-diamond', display: 'int',
    type: 'rare',
  },
  // 极稀有（暂藏着，prestige 产）
  daoyuan: {   // 道元（阴·极稀有）
    name: '道元', color: '#7c3aed', icon: 'mdi-octagon', display: 'int',
    type: 'legendary',
  },
};

// ======= 模块自带 MULT =======
const DAO_MULT = {
  values: {},
  init(name, def) {
    if (!DAO_MULT.values[name]) DAO_MULT.values[name] = { base: def.baseValue || 1, mult: 1, bonus: 0 };
  },
  get(name) {
    const v = DAO_MULT.values[name];
    if (!v) return 1;
    const result = v.base * v.mult + v.bonus;
    return v.round ? Math.round(result) : result;
  },
  setMult({name, key, value}) {
    if (!DAO_MULT.values[name]) DAO_MULT.init(name, {});
    DAO_MULT.values[name].mult = value;
  },
  setBase({name, key, value}) {
    if (!DAO_MULT.values[name]) DAO_MULT.init(name, {});
    DAO_MULT.values[name].base = value;
  },
  setBonus({name, key, value}) {
    if (!DAO_MULT.values[name]) DAO_MULT.init(name, {});
    DAO_MULT.values[name].bonus = value;
  },
  removeKeyAnywhere() {},
};

// ======= 模块自带 CUR =======
const DAO_CUR = {
  defs: {}, values: {}, capByMult: {},
  _suffix(key) {
    // key = "dao_chiyuan" → "Chiyuan"
    return key.split('_').slice(1).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
  },
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
    DAO_CUR.defs[key] = def;
    if (DAO_CUR.values[key] === undefined) DAO_CUR.values[key] = def.value || 0;
    const { gainMultName, capMultName } = DAO_CUR._multNames(key);
    DAO_MULT.init(gainMultName, Object.assign({ feature: 'dao' }, def.gainMult || {}));
    DAO_MULT.init(capMultName, Object.assign({ feature: 'dao' }, def.capMult || {}));
    if (def.capMult) DAO_CUR.capByMult[capMultName] = key;
  },
  value(key) { return DAO_CUR.values[key] === undefined ? 0 : DAO_CUR.values[key]; },
  cap(key) {
    const def = DAO_CUR.defs[key];
    if (!def) return 0;
    const { capMultName } = DAO_CUR._multNames(key);
    if (!def.capMult && !DAO_CUR.capByMult[capMultName]) return Infinity;
    return DAO_MULT.get(capMultName);
  },
  add(key, amount) {
    if (!DAO_CUR.defs[key]) return;
    const cap = DAO_CUR.cap(key);
    let v = DAO_CUR.value(key) + amount;
    if (v < 0) v = 0;
    if (isFinite(cap)) v = Math.min(v, Math.max(cap, DAO_CUR.value(key)));
    DAO_CUR.values[key] = v;
  },
  spend(key, amount) {
    if (DAO_CUR.value(key) < amount) return false;
    DAO_CUR.values[key] -= amount;
    return true;
  },
  spendAll(key) { DAO_CUR.values[key] = 0; },
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

// ======= 初始化 7 元货币 =======
for (const k in DAO_CURDATA) {
  DAO_CUR.init('dao_' + k, Object.assign({ feature: 'dao' }, DAO_CURDATA[k]));
}

// ======= 核心状态 =======
const DAO_STATE = {
  progressPrimary: 0,   // 主进度（→ 赤元 + 青元）
  progressSecondary: 0, // 次进度（→ 紫元 + 玄元 + 黄元）
  progressDiamond: 0,   // 稀有进度（→ 混元）
};

// ======= tick 速度派生 =======
const DAO_SPEED_PRIMARY = () => DAO_MULT.get('daoGenSpeedPrimary');
const DAO_SPEED_SECONDARY = () => DAO_MULT.get('daoGenSpeedSecondary');

// ======= 仙尊核心对象 =======
const DAO_MODULE = {
  name: 'dao',
  keyPrefix: 'dao',
  feature: 'dao',

  CUR: DAO_CUR,
  MULT: DAO_MULT,
  STATE: DAO_STATE,

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

  /* 与 gooboo gem.js tick() 同式 —— 简化版（无 event currency 分支） */
  RT: {
    tick(seconds) {
      // === 主进度 ===
      const genPrimary = DAO_SPEED_PRIMARY() / DAO_SPEED_BASE;
      DAO_STATE.progressPrimary += seconds * genPrimary;
      if (DAO_STATE.progressPrimary >= 1) {
        const gems = Math.floor(DAO_STATE.progressPrimary);
        // 产赤元（amount = gems * gainMult，默认 gainMult.baseValue=1）
        DAO_CUR.add('dao_chiyuan', gems);
        DAO_CUR.add('dao_qingyuan', gems);
        DAO_MODULE.STAT.values.dao_totalChiyuan.total = (DAO_MODULE.STAT.values.dao_totalChiyuan.total || 0) + gems;
        DAO_MODULE.STAT.values.dao_totalQingyuan.total = (DAO_MODULE.STAT.values.dao_totalQingyuan.total || 0) + gems;
        DAO_STATE.progressPrimary -= gems;
      }

      // === 次进度 ===
      const genSecondary = DAO_SPEED_SECONDARY() / DAO_SPEED_BASE;
      DAO_STATE.progressSecondary += seconds * genSecondary;
      if (DAO_STATE.progressSecondary >= 1) {
        const gems = Math.floor(DAO_STATE.progressSecondary);
        DAO_CUR.add('dao_ziyuan', gems);
        DAO_CUR.add('dao_xuanyuan', gems);
        // 黄元：次进度的一半几率产出（或 1/3），简化为同步产 1
        DAO_CUR.add('dao_huangyuan', gems);
        DAO_MODULE.STAT.values.dao_totalZiyuan.total = (DAO_MODULE.STAT.values.dao_totalZiyuan.total || 0) + gems;
        DAO_MODULE.STAT.values.dao_totalXuanyuan.total = (DAO_MODULE.STAT.values.dao_totalXuanyuan.total || 0) + gems;
        DAO_MODULE.STAT.values.dao_totalHuangyuan.total = (DAO_MODULE.STAT.values.dao_totalHuangyuan.total || 0) + gems;
        DAO_STATE.progressSecondary -= gems;
      }

      // === 稀有进度（混元）—— 需 daoGemDiamondSubfeature 解锁 ===
      if (typeof GB_UNLOCK !== 'undefined' && GB_UNLOCK.isUnlocked('daoGemDiamondSubfeature')) {
        const diamondSpeed = 1 / DAO_SPEED_DIAMOND_BASE;
        DAO_STATE.progressDiamond += seconds * diamondSpeed;
        if (DAO_STATE.progressDiamond >= 1) {
          const gems = Math.floor(DAO_STATE.progressDiamond);
          DAO_CUR.add('dao_hunyuan', gems);
          DAO_MODULE.STAT.values.dao_totalHunyuan.total = (DAO_MODULE.STAT.values.dao_totalHunyuan.total || 0) + gems;
          DAO_STATE.progressDiamond -= gems;
        }
      }
    },
  },

  // ======= 存档钩子 =======
  snapshot() {
    const obj = {
      progressPrimary: DAO_STATE.progressPrimary,
      progressSecondary: DAO_STATE.progressSecondary,
    };
    if (DAO_STATE.progressDiamond > 0) obj.progressDiamond = DAO_STATE.progressDiamond;
    // 7 元货币全部存
    for (const k in DAO_CURDATA) {
      const v = DAO_CUR.value('dao_' + k);
      if (v > 0) obj['cur_' + k] = v;
    }
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
  },

  hardReset() {
    DAO_STATE.progressPrimary = 0;
    DAO_STATE.progressSecondary = 0;
    DAO_STATE.progressDiamond = 0;
    for (const k in DAO_CURDATA) {
      DAO_CUR.values['dao_' + k] = 0;
    }
    for (const k in DAO_MODULE.STAT.values) {
      DAO_MODULE.STAT.values[k].total = 0;
    }
  },

  /* tick 结束后上报 globalLevelPart（dao 模块本身不贡献 globalLevel，它是子 feature 解锁用的） */
  onAfterLoad() {
    // 大道法则不贡献 globalLevelPart，只是解锁其它模块的前置条件
  },
};

// ======= 初始化派生 multiplier =======
DAO_MULT.init('daoGenSpeedPrimary', { feature: 'dao', baseValue: 1 });
DAO_MULT.init('daoGenSpeedSecondary', { feature: 'dao', baseValue: 1 });

// ======= 注册到 GB_MODULES =======
if (typeof GB_MODULES !== 'undefined') {
  GB_MODULES.register({
    id: 'dao', name: '大道法则', keyPrefix: 'dao', tickSpeed: 1,
    unlockNeeded: 'daoFeature',   // 需 globalLevel >= 10 解锁
    core: DAO_MODULE,
  });
}

if (typeof window !== 'undefined') {
  window.DAO_MODULE = DAO_MODULE;
  window.DAO_CUR = DAO_CUR;
  window.DAO_MULT = DAO_MULT;
}
