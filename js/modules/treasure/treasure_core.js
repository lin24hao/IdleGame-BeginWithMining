/* ============================================================
 * treasure_core.js — 仙器模块（treasureFeature 修仙化移植）
 *
 * 核心机制（完全对齐 gooboo src/js/modules/treasure.js + store/treasure.js）：
 *   tick 速度 = 86400（每天 tick 一次）
 *   带"日精月华"modifier 的仙器每天自动涨 days → level 自动提升
 *
 * 3 种仙器类型：
 *   凡器（regular）：单效果槽，power=1
 *   双灵宝（dual）：双效果槽，各 power=0.55
 *   至仙器（prestigious）：威望效果槽，power=1
 *
 * effectValue 公式：effectiveTier = tier + roundNear(logBase(level/5+1,2)) + 1 - minTier
 *   然后 scaling='divisive'|'multiplicative': (value+1)^effectiveTier - 1
 *   scaling='additive': value * effectiveTier * mult + 1
 *   默认（无 scaling 或 'multiplicative'）: (value+1)^effectiveTier - 1
 *
 * updateEffectCache 流程（对齐 gooboo store/treasure.js 467-526 行）：
 *   1. 遍历已装备仙器（限制 treasureSlots 上限）
 *   2. 每个装备的每个 effect 槽 → effectValue(tier, level, slot.power)
 *   3. 同 key 累加（owned + value 数组）
 *   4. 求和 + 1 → 最终 mult 值（divisive 则 1/value）
 *   5. 有变化的 → GB_MODULES.multSetMult({ feature, name, key: 'treasure', value })
 *
 * 解锁条件：xianqiFeature（globalLevel >= 225）
 * ============================================================ */

const XQ_TICK_SPEED = 86400; // 每天 tick 一次
const TREASURE_PRESTIGE_MAX = 3; // 至仙器效果最多叠加层数（gooboo 常量）

// ======= gooboo 原始常量（经济系统核心） =======
const TREASURE_TIER_UPGRADE_MULT = 5;
const TREASURE_TIER_DESTROY_MULT = 4;
const TREASURE_FRAGMENT_BUY_COST = 100;       // 花 100 青元 → 换灵玉
const TREASURE_FRAGMENT_BUY_GAIN = 1.1;

/* 各 tier 在随机生成时的出现概率（模拟 gooboo globalLevel 200+ 的分布，
   用于 averageFragments / fragmentGain 公式计算） */
const XQ_TIER_CHANCES = [
  { tier: 1, chance: 0.45 },
  { tier: 2, chance: 0.30 },
  { tier: 3, chance: 0.15 },
  { tier: 4, chance: 0.07 },
  { tier: 5, chance: 0.03 },
];

/* tier 对应的炼制青元成本（gooboo: (getSequence(1, tier+1) + 4) * 3） */
function xqTierPrice(tier) {
  let seq = 0;
  for (let i = 1; i <= tier + 1; i++) seq += i;
  return (seq + 4) * 3;
}
/* 期望青元成本 = Σ tierChance × tierPrice(tier) × type.buyPrice */
function xqTreasurePrice(type) {
  const t = XQ_TYPES[type]; if (!t) return 0;
  return XQ_TIER_CHANCES.reduce((a, b) => a + b.chance * xqTierPrice(b.tier), 0) * t.buyPrice;
}
/* 销毁返还灵玉 = 4^tier × type.destroyPrice（gooboo destroyFragments） */
function xqDestroyFragments(tier, type) {
  const t = XQ_TYPES[type]; if (!t) return 0;
  return Math.round(Math.pow(TREASURE_TIER_DESTROY_MULT, tier) * t.destroyPrice);
}
/* 升级消耗灵玉 = 5^tier × upgradeScaling^max(0, level-upgradeLimit) × upgradePrice */
function xqUpgradeFragments(tier, level, type) {
  const t = XQ_TYPES[type]; if (!t) return null;
  if (t.upgradePrice === null || (level >= t.upgradeLimit && t.upgradeScaling === null)) return null;
  return Math.round(Math.pow(TREASURE_TIER_UPGRADE_MULT, tier)
    * Math.pow(t.upgradeScaling, Math.max(0, level - t.upgradeLimit))
    * t.upgradePrice);
}
/* 平均销毁返还灵玉 = Σ tierChance × destroyFragments(tier, regular) */
function xqAverageFragments() {
  return XQ_TIER_CHANCES.reduce((a, b) => a + b.chance * xqDestroyFragments(b.tier, 'regular'), 0);
}
/* 100 青元能换多少灵玉 = round(avgFrag × 1.1 × 100 / treasurePrice('regular')) */
function xqFragmentGain() {
  return Math.round(xqAverageFragments() * TREASURE_FRAGMENT_BUY_GAIN * TREASURE_FRAGMENT_BUY_COST / xqTreasurePrice('regular'));
}

// ======= 3 种仙器类型 =======
const XQ_TYPES = {
  regular: {
    name: '凡器', icon: 'mdi-sword',
    buyPrice: 1, upgradePrice: 10, upgradeLimit: 4, upgradeScaling: 1.25,
    destroyPrice: 8,
    slots: [{ type: 'regular', power: 1 }],
    maxModifiers: 1,
  },
  dual: {
    name: '双灵宝', icon: 'mdi-call-split',
    buyPrice: 1.5, upgradePrice: 12, upgradeLimit: 4, upgradeScaling: 1.25,
    destroyPrice: 12,
    slots: [{ type: 'regular', power: 0.55 }, { type: 'regular', power: 0.55 }],
    maxModifiers: 2,
  },
  prestigious: {
    name: '至仙器', icon: 'mdi-star-shooting',
    buyPrice: 4, upgradePrice: 40, upgradeLimit: 4, upgradeScaling: 1.25,
    destroyPrice: 32,
    slots: [{ type: 'prestige', power: 1 }],
    maxModifiers: 1,
  },
};

// ======= modifier 定义 =======
const XQ_MODIFIERS = {
  expander: { name: '日精月华', icon: 'mdi-calendar-refresh', desc: '仙器日精月华自动成长' },
};

// ======= 货币：灵玉 =======
const XQ_CURDATA = {
  fragment: { name: '灵玉', color: '#f59e0b', icon: 'mdi-shimmer', display: 'int' },
};

// ======= 完整 effect 字典（照抄 gooboo src/js/modules/treasure/effect.js） =======
const XQ_EFFECTS = {
  // ---- Mining（灵脉） ----
  miningDamage: {              feature: 'mining', icon: 'mdi-bomb', value: 0.5, desc: '挖矿攻击伤害提升' },
  currencyMiningScrapGain: {   feature: 'mining', icon: 'mdi-dots-triangle', value: 0.65, desc: '碎灵石掉落数量增加' },
  miningOreGain: {             feature: 'mining', icon: 'mdi-chart-bubble', value: 0.2, desc: '矿石采集产出提升' },
  miningRareEarthGain: {       feature: 'mining', icon: 'mdi-landslide', value: 0.2, desc: '稀土矿采集产出提升' },
  miningSmelteryTime: {        feature: 'mining', unlock: 'miningSmeltery', icon: 'mdi-thermometer', minTier: 1, value: 0.35, scaling: 'divisive', desc: '炼器炉炼制时间缩短' },
  currencyMiningCrystalGreenGain: { feature: 'mining', type: 'prestige', icon: 'mdi-star-three-points', max: TREASURE_PRESTIGE_MAX, minTier: 1, value: 0.1, desc: '绿色灵晶产出（至仙器专属）' },
  currencyMiningCrystalYellowGain:  { feature: 'mining', unlock: 'lmGasSubfeature', type: 'prestige', icon: 'mdi-star-four-points', max: TREASURE_PRESTIGE_MAX, minTier: 2, value: 0.1, desc: '黄色灵晶产出（至仙器专属）' },

  // ---- Village（宗门） ----
  queueSpeedVillageBuilding: { feature: 'village', icon: 'mdi-hammer', value: 0.4, desc: '宗门屋舍建造速度提升' },
  currencyVillageCoinGain: {    feature: 'village', icon: 'mdi-circle-multiple', value: 0.5, desc: '香火钱产出提升' },
  villageFoundationMaterialGain: { feature: 'village', icon: 'mdi-tree', value: 0.2, desc: '基础建材（木材等）产出提升' },
  villageIndustrialMaterialGain: { feature: 'village', unlock: 'villageBuildings2', icon: 'mdi-mirror', value: 0.2, desc: '工业建材产出提升' },
  villageLuxuryMaterialGain:     { feature: 'village', unlock: 'villageBuildings4', icon: 'mdi-diamond', minTier: 1, value: 0.2, desc: '高阶建材产出提升' },
  villageModernMaterialGain:     { feature: 'village', unlock: 'villageBuildings7', icon: 'mdi-oil', minTier: 2, value: 0.2, desc: '尖端建材产出提升' },
  currencyVillageFaithGain:      { feature: 'village', type: 'prestige', icon: 'mdi-hands-pray', max: TREASURE_PRESTIGE_MAX, minTier: 1, value: 0.1, desc: '信仰产出（至仙器专属）' },
  currencyVillageSharesGain:     { feature: 'village', unlock: 'villCraftingSubfeature', type: 'prestige', icon: 'mdi-certificate', max: TREASURE_PRESTIGE_MAX, minTier: 2, value: 0.1, desc: '宗门分红收益（至仙器专属）' },

  // ---- Horde（降妖） ----
  hordeAttack: {                  feature: 'horde', icon: 'mdi-sword', value: 0.35, desc: '降妖战斗攻击伤害提升' },
  currencyHordeBoneGain: {        feature: 'horde', icon: 'mdi-bone', value: 0.6, desc: '击杀妖物获得妖骨数量增加' },
  currencyHordeCorruptedFleshGain: { feature: 'horde', unlock: 'hordeCorruptedFlesh', icon: 'mdi-food-steak', value: 0.15, desc: '击杀妖物获得魔肉数量增加' },
  hordeEquipmentMasteryGain: {    feature: 'horde', unlock: 'hordeEquipmentMastery', icon: 'mdi-seal', minTier: 1, value: 0.2, desc: '装备熟练度获取加速' },
  hordeShardChance: {             feature: 'horde', unlock: 'hordeBrickTower', icon: 'mdi-billiards-rack', minTier: 2, value: 0.15, desc: '爬塔时获得法宝碎片的几率提升' },
  currencyHordeBloodGain: {       feature: 'horde', unlock: 'hoClassesSubfeature', icon: 'mdi-iv-bag', minTier: 3, value: 0.6, desc: '击杀妖物获得妖血数量增加' },
  currencyHordeSoulCorruptedGain: { feature: 'horde', type: 'prestige', icon: 'mdi-ghost', max: TREASURE_PRESTIGE_MAX, minTier: 1, value: 0.1, desc: '魂核产出（至仙器专属）' },
  currencyHordeCourageGain: {     feature: 'horde', unlock: 'hoClassesSubfeature', type: 'prestige', icon: 'mdi-ghost', max: TREASURE_PRESTIGE_MAX, minTier: 3, value: 0.1, desc: '勇气产出（至仙器专属）' },

  // ---- Farm（灵植园） ----
  currencyFarmVegetableGain: { feature: 'farm', icon: 'mdi-carrot', value: 0.55, desc: '灵菜收获数量提升' },
  currencyFarmBerryGain: {     feature: 'farm', icon: 'mdi-fruit-grapes', value: 0.55, desc: '灵果收获数量提升' },
  currencyFarmGrainGain: {     feature: 'farm', icon: 'mdi-barley', value: 0.55, desc: '灵谷收获数量提升' },
  currencyFarmFlowerGain: {    feature: 'farm', icon: 'mdi-flower', value: 0.55, desc: '灵花收获数量提升' },
  farmExperience: {             feature: 'farm', unlock: 'farmCropExp', type: 'prestige', icon: 'mdi-star', max: TREASURE_PRESTIGE_MAX, minTier: 1, value: 0.1, desc: '灵植经验加速（至仙器专属）' },

  // ---- School / Gallery（藏经阁 / 画阁） ----
  currencyGalleryBeautyGain: { feature: 'gallery', icon: 'mdi-image-filter-vintage', minTier: 1, value: 0.75, desc: '灵韵产出提升' },
  galleryColorGain: {          feature: 'gallery', icon: 'mdi-liquid-spot', minTier: 1, value: 0.1, desc: '灵色每刻产量提升' },
  currencyGalleryConverterGain:{ feature: 'gallery', unlock: 'galleryConversion', icon: 'mdi-recycle', minTier: 1, value: 0.5, desc: '灵墨转换产出提升' },
  galleryShapeGain: {          feature: 'gallery', unlock: 'galleryShape', icon: 'mdi-shape', minTier: 1, value: 0.65, desc: '形态每刻产量提升' },
  galleryCanvasSpeed: {        feature: 'gallery', unlock: 'galleryCanvas', icon: 'mdi-artboard', minTier: 2, value: 0.15, desc: '绘制灵画速度加快' },
  currencyGalleryCashGain: {   feature: 'gallery', type: 'prestige', icon: 'mdi-cash', max: TREASURE_PRESTIGE_MAX, minTier: 1, value: 0.1, desc: '灵石产出（至仙器专属）' },
};

// ======= 工具函数 =======
function logBase(x, b) { return Math.log(x) / Math.log(b); }
function roundNear(x) { return Math.round(x); }

/* effect key → 各模块 MULT key 映射
   gooboo treasure effect 用 mining/village/horde/farm 前缀
   我们模块 MULT 用 lm/village/horde/farm 前缀
   gallery 前缀（gooboo 画廊）暂不移植 — effect 保持原名，multSetMult 自动 no-op */
function effectKeyToModuleKey(effectKey) {
  let k = effectKey;
  if (k.indexOf('currencyMining') === 0) k = 'currencyLm' + k.slice('currencyMining'.length);
  else if (k.indexOf('mining') === 0) k = 'lm' + k.slice('mining'.length);
  // gallery 前缀保持原样（_featureMap 里没有 gallery → multSetMult 自动 no-op）
  return k;
}

// ======= effectValue 公式（与 gooboo store/treasure.js getter 完全一致） =======
function effectValue(name, tier, level, mult) {
  if (name === null || name === undefined) return null;
  const effect = XQ_EFFECTS[name];
  if (!effect) return null;
  const minTier = effect.minTier !== undefined ? effect.minTier : 0;
  const effectiveTier = tier + roundNear(logBase(level / 5 + 1, 2)) + 1 - minTier;

  switch (effect.scaling) {
    case 'divisive':
    case 'multiplicative':
      return (Math.pow(effect.value + 1, effectiveTier) - 1) * mult;
    case 'additive':
      return effect.value * effectiveTier * mult + 1;
  }
  // 默认 multiplicative（与 gooboo default 行为一致）
  return (Math.pow(effect.value + 1, effectiveTier) - 1) * mult;
}

// ======= levelAtDay 公式 =======
function levelAtDay(type, tier, days) {
  const t = XQ_TYPES[type];
  if (!t) return 0;
  let level = days / (tier * 0.2 + 0.8) / (t.upgradePrice / 4);
  if (level > t.upgradeLimit) {
    level = t.upgradeLimit + logBase((level - t.upgradeLimit) / t.upgradeLimit + 1, Math.pow(t.upgradeScaling, 1.5));
  }
  return Math.floor(level);
}

// ======= 仙器物品构造 =======
function makeItem(type, tier) {
  const t = XQ_TYPES[type];
  return {
    type, tier, level: 0, days: 0,
    modifier: [],
    effect: t.slots.map(() => null),
    fragmentsSpent: 0, // 累计花在这件仙器上的灵玉（销毁时全额返还）
  };
}

// ======= 模块自带 MULT =======
/* 对齐 gooboo mult 语义：(baseValue + Σ baseValues) × Π multValues + Σ bonusValues
 * base/mult/bonus 为缓存字段（get 之外的旧代码有直接读字段）。
 * treasureSlots 有多个 base 来源（初始 10 + 乾坤袋 + coin 符文），必须按 key 聚合 */
const XQ_MULT = { values: {} };
XQ_MULT.init = function(name, def) {
  if (!XQ_MULT.values[name]) {
    const baseValue = def.baseValue || 1;
    XQ_MULT.values[name] = Object.assign({ baseValue, baseValues: {}, multValues: {}, bonusValues: {}, base: baseValue, mult: 1, bonus: 0 }, def);
  }
};
XQ_MULT._recalc = function(v) {
  let base = v.baseValue || 0, mult = 1, bonus = 0;
  for (const k in v.baseValues) base += v.baseValues[k];
  for (const k in v.multValues) mult *= v.multValues[k];
  for (const k in v.bonusValues) bonus += v.bonusValues[k];
  v.base = base; v.mult = mult; v.bonus = bonus;
};
XQ_MULT.get = function(name) {
  const v = XQ_MULT.values[name]; if (!v) return 1;
  const r = (v.base || 0) * (v.mult || 1) + (v.bonus || 0); return v.round ? Math.round(r) : r;
};
XQ_MULT.setMult = function(o) {
  if (!XQ_MULT.values[o.name]) XQ_MULT.init(o.name, {});
  const v = XQ_MULT.values[o.name]; v.multValues[o.key || '_'] = o.value; XQ_MULT._recalc(v);
};
XQ_MULT.setBase = function(o) {
  if (!XQ_MULT.values[o.name]) XQ_MULT.init(o.name, {});
  const v = XQ_MULT.values[o.name]; v.baseValues[o.key || '_'] = o.value; XQ_MULT._recalc(v);
};
XQ_MULT.setBonus = function(o) {
  if (!XQ_MULT.values[o.name]) XQ_MULT.init(o.name, {});
  const v = XQ_MULT.values[o.name]; v.bonusValues[o.key || '_'] = o.value; XQ_MULT._recalc(v);
};
XQ_MULT.removeKeyAnywhere = function() {};

// ======= 模块自带 CUR =======
const XQ_CUR = { defs: {}, values: {}, _suffix(k) { return k.split('_').slice(1).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(''); } };
XQ_CUR.init = function(key, def) {
  def = def || {}; def.key = key;
  XQ_CUR.defs[key] = def;
  if (XQ_CUR.values[key] === undefined) XQ_CUR.values[key] = def.value || 0;
  const sf = XQ_CUR._suffix(key);
  XQ_MULT.init('currencyXq' + sf + 'Gain', Object.assign({ feature: 'treasure' }, def.gainMult || {}));
  XQ_MULT.init('currencyXq' + sf + 'Cap', Object.assign({ feature: 'treasure' }, def.capMult || {}));
};
XQ_CUR.value = function(key) { return XQ_CUR.values[key] || 0; };
XQ_CUR.cap = function(key) {
  const def = XQ_CUR.defs[key]; if (!def) return 0;
  const capMultName = 'currencyXq' + XQ_CUR._suffix(key) + 'Cap';
  if (!def.capMult) return Infinity; return XQ_MULT.get(capMultName);
};
XQ_CUR.add = function(key, amount) {
  if (!XQ_CUR.defs[key]) return;
  const cap = XQ_CUR.cap(key);
  let v = XQ_CUR.value(key) + amount;
  if (v < 0) v = 0;
  if (isFinite(cap)) v = Math.min(v, Math.max(cap, XQ_CUR.value(key)));
  XQ_CUR.values[key] = v;
};
XQ_CUR.spend = function(key, amount) {
  if (XQ_CUR.value(key) < amount) return false;
  XQ_CUR.values[key] -= amount; return true;
};

for (const k in XQ_CURDATA) XQ_CUR.init('xq_' + k, Object.assign({ feature: 'treasure' }, XQ_CURDATA[k]));

// ======= 核心状态 =======
const XQ_STATE = {
  items: [],
  newItem: null,
  effectCache: {},   // updateEffectCache 结果缓存
};

// ======= 仙器核心模块 =======
const XQ_MODULE = {
  name: 'treasure',
  keyPrefix: 'xq',
  feature: 'treasure',

  CUR: XQ_CUR,
  MULT: XQ_MULT,
  STATE: XQ_STATE,
  TYPES: XQ_TYPES,
  MODIFIERS: XQ_MODIFIERS,
  EFFECTS: XQ_EFFECTS,

  STAT: { values: {
    xq_totalDays: { value: 0 },
    xq_maxLevel: { value: 0 },
    xq_itemsCount: { value: 0 },
  }},

  /* 每天 tick —— 带日精月华的仙器自动成长 + 刷新 effect cache */
  RT: {
    tick(days) {
      if (days <= 0) return;
      let levelChanged = false;
      XQ_STATE.items.forEach(item => {
        if (item && item.modifier && item.modifier.indexOf('expander') >= 0) {
          item.days += days;
          const newLevel = levelAtDay(item.type, item.tier, item.days);
          if (newLevel !== item.level) { item.level = newLevel; levelChanged = true; }
          if (item.level > (XQ_MODULE.STAT.values.xq_maxLevel.value || 0)) {
            XQ_MODULE.STAT.values.xq_maxLevel.value = item.level;
          }
        }
      });
      if (XQ_STATE.newItem && XQ_STATE.newItem.modifier && XQ_STATE.newItem.modifier.indexOf('expander') >= 0) {
        XQ_STATE.newItem.days += days;
        XQ_STATE.newItem.level = levelAtDay(XQ_STATE.newItem.type, XQ_STATE.newItem.tier, XQ_STATE.newItem.days);
      }
      XQ_MODULE.STAT.values.xq_totalDays.value = (XQ_MODULE.STAT.values.xq_totalDays.value || 0) + days;
      XQ_MODULE.STAT.values.xq_itemsCount.value = XQ_STATE.items.filter(i => i !== null).length;

      // level 变了必须刷新 effect cache → 重新应用 multiplier 到各模块
      if (levelChanged) XQ_MODULE.updateEffectCache();
    },
  },

  /* ======= updateEffectCache（核心！对齐 gooboo store/treasure.js 467-526） =======
     遍历已装备仙器 → 按 effect key 累加 value → 调用 GB_MODULES.multSetMult 路由到目标模块 MULT */
  updateEffectCache() {
    const effects = {};  // { effectKey: { owned: N, value: [v1, v2, ...] } }
    const slots = XQ_MULT.get('treasureSlots');

    XQ_STATE.items.forEach((item, n) => {
      if (item && n < slots) {
        item.effect.forEach((el, i) => {
          if (el !== null && el !== undefined) {
            if (!effects[el]) effects[el] = { owned: 0, value: [] };
            effects[el].owned++;
            const slotPower = XQ_TYPES[item.type].slots[i].power;
            const v = effectValue(el, item.tier, item.level, slotPower);
            if (v !== null) effects[el].value.push(v);
          }
        });
      }
    });

    // 每个 effect → 求和 + 1 → multiplier 值
    for (const key in effects) {
      const effectDef = XQ_EFFECTS[key];
      if (!effectDef) continue;
      let effectValues = effects[key].value;
      // 至仙器效果 max 限制
      if (effectDef.max !== undefined && effectValues.length > effectDef.max) {
        effectValues = effectValues.slice(0, effectDef.max);
      }
      let finalValue = effectValues.reduce((a, b) => a + b, 0) + 1;
      if (effectDef.scaling === 'divisive') {
        finalValue = 1 / finalValue;
      }
      effects[key].value = finalValue;
    }

    XQ_STATE.effectCache = effects;

    // 把每个 effect 应用到对应模块的 MULT（effect key → 模块 MULT key 要做前缀映射）
    for (const key in effects) {
      const effectDef = XQ_EFFECTS[key];
      if (!effectDef) continue;
      const val = effects[key].value;
      const moduleMultKey = effectKeyToModuleKey(key);
      if (val !== 1) {
        GB_MODULES.multSetMult({
          feature: effectDef.feature,
          name: moduleMultKey,   // ← 用映射后的 key（如 miningDamage → lmDamage）
          key: 'treasure',
          value: val,
        });
      } else {
        GB_MODULES.multRemoveKey({
          feature: effectDef.feature,
          name: moduleMultKey,
        });
      }
    }
  },

  // ======= 仙器 API =======

  /* 炼制仙器 —— 花 dao_qingyuan（青元），不花灵玉。完全对齐 gooboo buy() */
  buy(type, tier) {
    const t = XQ_TYPES[type]; if (!t) return null;
    const emeraldCost = Math.round(xqTierPrice(tier) * t.buyPrice);
    // 对接到 DAO_CUR（大道法则模块的青元 = gooboo emerald）
    if (typeof DAO_CUR === 'undefined') return null;
    if (!DAO_CUR.spend('dao_qingyuan', emeraldCost)) return null;
    return makeItem(type, tier);
  },

  craft(type, tier) {
    const item = XQ_MODULE.buy(type, tier); if (!item) return false;
    XQ_STATE.newItem = item;
    return true;
  },

  /* 用青元换灵玉 —— 对齐 gooboo buyFragments()。花 100 青元 → 得 fragmentGain 灵玉 */
  buyFragments() {
    if (typeof DAO_CUR === 'undefined') return false;
    const gain = xqFragmentGain();
    if (DAO_CUR.spend('dao_qingyuan', TREASURE_FRAGMENT_BUY_COST)) {
      XQ_CUR.add('xq_fragment', gain);
      return gain;
    }
    return false;
  },

  /* 查询青元换灵玉的数量（给 view 展示用） */
  fragmentGainPreview() { return xqFragmentGain(); },
  fragmentBuyCost() { return TREASURE_FRAGMENT_BUY_COST; },

  equip() {
    if (!XQ_STATE.newItem) return false;
    const slots = XQ_MULT.get('treasureSlots');
    if (XQ_STATE.items.length >= slots) return false;
    XQ_STATE.items.push(XQ_STATE.newItem);
    XQ_STATE.newItem = null;
    XQ_MODULE.updateEffectCache();  // 装备后立即刷新
    return true;
  },

  /* 给新仙器的某个槽选效果（对应 gooboo changeEffect） */
  setNewItemEffect(slotIndex, effectKey) {
    if (!XQ_STATE.newItem) return false;
    if (effectKey !== null && !XQ_EFFECTS[effectKey]) return false;
    XQ_STATE.newItem.effect[slotIndex] = effectKey;
    return true;
  },

  // ======= 仙器进阶 API =======

  /* 升级消耗灵玉 —— 完全对齐 gooboo upgradeFragments() */
  upgradeCost(item) {
    if (!item || !XQ_TYPES[item.type]) return Infinity;
    if (item.level >= XQ_TYPES[item.type].upgradeLimit) return Infinity;
    return xqUpgradeFragments(item.tier, item.level, item.type);
  },
  upgrade(itemIndex) {
    const item = XQ_STATE.items[itemIndex];
    if (!item) return false;
    const cost = XQ_MODULE.upgradeCost(item);
    if (!XQ_CUR.spend('xq_fragment', cost)) return false;
    item.level += 1;
    item.fragmentsSpent = (item.fragmentsSpent || 0) + cost; // 累计花的灵玉（销毁时全额返还）
    item.days = Math.max(item.days, item.level * 5);
    XQ_MODULE.updateEffectCache();
    XQ_MODULE.STAT.values.xq_maxLevel.value = Math.max(XQ_MODULE.STAT.values.xq_maxLevel.value || 0, item.level);
    return true;
  },

  /* 销毁返还灵玉 —— 完全对齐 gooboo destroyItem()：fragmentsSpent + 4^tier × destroyPrice */
  destroyPrice(item) {
    if (!item || !XQ_TYPES[item.type]) return 0;
    const spent = item.fragmentsSpent || 0;
    return spent + xqDestroyFragments(item.tier, item.type);
  },
  destroy(itemIndex) {
    const item = XQ_STATE.items[itemIndex];
    if (!item) return false;
    const refund = XQ_MODULE.destroyPrice(item);
    XQ_STATE.items.splice(itemIndex, 1);
    if (refund > 0) XQ_CUR.add('xq_fragment', refund);
    XQ_MODULE.updateEffectCache();
    return refund;
  },

  /* 炼制青元成本（给 view 展示用） */
  forgeEmeraldCost(type, tier) {
    const t = XQ_TYPES[type]; if (!t) return Infinity;
    return Math.round(xqTierPrice(tier) * t.buyPrice);
  },

  // ======= 存档钩子 =======
  snapshot() {
    return {
      items: XQ_STATE.items.map(it => it ? {
        type: it.type, tier: it.tier, level: it.level, days: it.days,
        modifier: it.modifier ? it.modifier.slice() : [],
        effect: it.effect ? it.effect.slice() : it.effect,
        fragmentsSpent: it.fragmentsSpent || 0,
      } : null),
      newItem: XQ_STATE.newItem ? {
        type: XQ_STATE.newItem.type, tier: XQ_STATE.newItem.tier,
        level: XQ_STATE.newItem.level, days: XQ_STATE.newItem.days,
        modifier: XQ_STATE.newItem.modifier ? XQ_STATE.newItem.modifier.slice() : [],
        effect: XQ_STATE.newItem.effect ? XQ_STATE.newItem.effect.slice() : XQ_STATE.newItem.effect,
        fragmentsSpent: XQ_STATE.newItem.fragmentsSpent || 0,
      } : null,
      curVals: JSON.parse(JSON.stringify(XQ_CUR.values)),
    };
  },
  restore(data) {
    if (!data) return;
    if (data.items) XQ_STATE.items = data.items.map(it => it ? Object.assign(makeItem(it.type, it.tier), it) : null);
    if (data.newItem) XQ_STATE.newItem = Object.assign(makeItem(data.newItem.type, data.newItem.tier), data.newItem);
    if (data.curVals) Object.keys(data.curVals).forEach(k => { XQ_CUR.values[k] = data.curVals[k]; });
    // 读档后立即刷新 effect cache
    XQ_MODULE.updateEffectCache();
  },
  hardReset() {
    XQ_STATE.items = [];
    XQ_STATE.newItem = null;
    XQ_STATE.effectCache = {};
    for (const key in XQ_EFFECTS) {
      GB_MODULES.multRemoveKey({ feature: XQ_EFFECTS[key].feature, name: effectKeyToModuleKey(key) });
    }
    for (const k in XQ_CURDATA) XQ_CUR.values['xq_' + k] = 0;
    XQ_MODULE.STAT.values.xq_totalDays.value = 0;
    XQ_MODULE.STAT.values.xq_maxLevel.value = 0;
    XQ_MODULE.STAT.values.xq_itemsCount.value = 0;
    // 灵玉归零（gooboo 不发初始灵玉，全靠青元兑换 + 销毁返还）
  },
  onAfterLoad() {
    // gooboo 没有初始灵玉赠送 —— 灵玉 = 0 起步，靠青元兑换获取
  },
};

// ======= 派生 multiplier =======
XQ_MULT.init('treasureSlots', { feature: 'treasure', round: true, baseValue: 10 });

// ======= 注册到 GB_MODULES =======
if (typeof GB_MODULES !== 'undefined') {
  GB_MODULES.register({
    id: 'treasure', name: '仙器', keyPrefix: 'xq', tickSpeed: XQ_TICK_SPEED,
    unlockNeeded: 'xianqiFeature',
    core: XQ_MODULE,
    onAfterLoad: () => XQ_MODULE.onAfterLoad && XQ_MODULE.onAfterLoad(),
  });
}

if (typeof window !== 'undefined') {
  window.XQ_MODULE = XQ_MODULE;
  window.XQ_CUR = XQ_CUR;
  window.XQ_MULT = XQ_MULT;
  window.XQ_STATE = XQ_STATE;
  window.XQ_TYPES = XQ_TYPES;
  window.XQ_EFFECTS = XQ_EFFECTS;
  window.XQ_MODIFIERS = XQ_MODIFIERS;
  window.levelAtDay = levelAtDay;
  window.effectValue = effectValue;
}
