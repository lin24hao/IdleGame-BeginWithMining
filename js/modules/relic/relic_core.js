/* ============================================================
 * relic_core.js ——「先天灵宝」核心模块
 * 100% 对齐 gooboo src/store/relic.js + src/js/modules/relic.js API
 *
 * State 结构：item/glyph/pedestal 精确复刻
 * Getters/Mutations/Actions 名和签名全对齐
 * 修仙化改造：数据（灵宝名称/颜色/图标/effect 内容）+ CSS 色值替代 vuetify 色名
 * ============================================================ */
const RELIC_PEDESTAL_AMOUNT = 3;
const RELIC_GLYPH_TIME_BASE = 250000;
const RELIC_GLYPH_TIME_INCREMENT = 1.08;
const RELIC_GLYPH_SPEED_BONUS = 0.75;
const RELIC_GLYPH_SPEED_OVERCAP = 1.25;
// SECONDS_PER_HOUR 由 lm_data.js 全局提供，此处不重复声明

/* ============ MULT 子系统（简化版，对齐 lm_core 的 MULT API） ============ */
const REL_MULT = {
  values: {}, // name → { base, mult, bonus }

  init(name, o) {
    if (!this.values[name]) {
      this.values[name] = { base: (o && o.baseValue !== undefined ? o.baseValue : 1), mult: 1, bonus: 0 };
    }
  },
  setMult(o) {
    if (!this.values[o.name]) this.values[o.name] = { base: 1, mult: 1, bonus: 0 };
    this.values[o.name].mult = o.value;
  },
  setBase(o) {
    if (!this.values[o.name]) this.values[o.name] = { base: 0, mult: 1, bonus: 0 };
    this.values[o.name].base = o.value;
  },
  setBonus(o) {
    if (!this.values[o.name]) this.values[o.name] = { base: 0, mult: 1, bonus: 0 };
    this.values[o.name].bonus = o.value;
  },
  // 计算最终值（mult 型：base × mult + bonus；base 型：base + bonus × mult）
  get(name, fallback) {
    const v = this.values[name];
    if (!v) return fallback !== undefined ? fallback : 1;
    return (v.base || 0) * (v.mult || 1) + (v.bonus || 0);
  },
  // 清零所有由某 key 设置的值
  resetKey(key) {
    for (const n in this.values) {
      if (this.values[n]._key === key) {
        this.values[n].mult = 1;
        this.values[n].base = 0;
        this.values[n].bonus = 0;
      }
    }
  },
};

/* ============ CUR 子系统（简化版） ============ */
const REL_CUR = {
  defs: {},
  values: {},
  caps: {},

  init(key, def) {
    def = def || {};
    this.defs[key] = def;
    if (this.values[key] === undefined) this.values[key] = def.value || 0;
    if (def.cap !== undefined) this.caps[key] = def.cap;
  },
  value(key) { return this.values[key] || 0; },
  add(key, amount) {
    if (!this.defs[key]) this.init(key, {});
    this.values[key] = (this.values[key] || 0) + amount;
    const cap = this.cap(key);
    if (this.values[key] > cap) this.values[key] = cap;
    if (this.values[key] < 0) this.values[key] = 0;
  },
  cap(key) {
    if (this.caps[key] !== undefined) return this.caps[key];
    // 从 MULT 读取 cap（gooboo 机制）
    const capMultName = 'currency' + key.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('') + 'Cap';
    const m = REL_MULT.values[capMultName];
    if (m) return (m.base || 0) * (m.mult || 1) + (m.bonus || 0);
    return Infinity;
  },
  setCap(key, val) { this.caps[key] = val; },
};

/* ============ 符文定义（精确复刻 gooboo glyph.js，颜色替换为 CSS hex） ============ */
const REL_GLYPH_COLORS = {
  'brown':     '#a0522d',
  'pale-orange': '#ffa07a',
  'red':       '#ef4444',
  'wooden':    '#8b6914',
  'light-blue':'#38bdf8',
  'dark-grey': '#4b5563',
  'pale-red':  '#fca5a5',
  'pale-light-blue': '#bae6fd',
  'light-green':'#86efac',
  'dark-blue': '#1e40af',
  'yellow':    '#facc15',
  'blue-grey': '#64748b',
  'purple':    '#a855f7',
  'pale-green':'#bef264',
  'pale-yellow':'#fde68a',
  'beige':     '#d4a574',
  'amber':     '#f59e0b',
  'pale-blue': '#93c5fd',
};
function glyphColor(name) { return REL_GLYPH_COLORS[name] || '#888'; }

const REL_GLYPHS = {
  // mining（灵脉）
  dust: { icon: 'mdi-weather-dust', color: 'brown', effect: [
    { name: 'currencyMiningScrapGain', type: 'mult', value: lvl => Math.pow(1.45, lvl) },
    { name: 'currencyMiningScrapCap', type: 'mult', value: lvl => Math.pow(1.65, lvl) },
  ]},
  clay: { icon: 'mdi-ellipse', color: 'pale-orange', effect: [
    { name: 'miningOreGain', type: 'mult', value: lvl => Math.pow(1.15, lvl) },
    { name: 'miningRareEarthGain', type: 'mult', value: lvl => Math.pow(1.6, lvl) },
  ]},
  heat: { icon: 'mdi-scent', color: 'red', effect: [
    { name: 'miningSmelteryTime', type: 'mult', value: lvl => Math.pow(1 / 1.35, lvl) },
    { name: 'currencyMiningEmberCap', type: 'base', value: lvl => lvl * 130 },
  ]},
  // village（宗门）
  wood: { icon: 'mdi-tree', color: 'wooden', effect: [
    { name: 'villageWorker', type: 'base', value: lvl => lvl * 32 },
    { name: 'queueSpeedVillageBuilding', type: 'mult', value: lvl => Math.pow(1.5, lvl) },
  ]},
  flow: { icon: 'mdi-waterfall', color: 'light-blue', effect: [
    { name: 'villageMaterialGain', type: 'mult', value: lvl => Math.pow(1.3, lvl) },
    { name: 'currencyVillageCoinGain', type: 'mult', value: lvl => Math.pow(1.2, lvl) },
  ]},
  stone: { icon: 'mdi-chart-bubble', color: 'dark-grey', effect: [
    { name: 'villageMaterialCap', type: 'mult', value: lvl => Math.pow(1.25, lvl) },
    { name: 'currencyVillageCoinCap', type: 'mult', value: lvl => Math.pow(1.2, lvl) },
  ]},
  // horde（降妖）
  spike: { icon: 'mdi-nail', color: 'pale-red', effect: [
    { name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.3, lvl) },
    { name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.3, lvl) },
  ]},
  dream: { icon: 'mdi-sleep', color: 'pale-light-blue', effect: [
    { name: 'hordeHeirloomEffect', type: 'mult', value: lvl => lvl * 0.1 + 1 },
    { name: 'hordeNostalgia', type: 'base', value: lvl => lvl * 100 },
  ]},
  clover: { icon: 'mdi-clover', color: 'light-green', effect: [
    { name: 'hordeEquipmentChance', type: 'mult', value: lvl => Math.pow(1.5, lvl) },
    { name: 'hordeEquipmentMasteryGain', type: 'mult', value: lvl => Math.pow(1.85, lvl) },
  ]},
  // farm（灵植）
  rain: { icon: 'mdi-weather-pouring', color: 'dark-blue', effect: [
    { name: 'currencyFarmVegetableGain', type: 'mult', value: lvl => Math.pow(1.5, lvl) },
    { name: 'currencyFarmGrassCap', type: 'base', value: lvl => lvl * 300 },
  ]},
  sun: { icon: 'mdi-white-balance-sunny', color: 'yellow', effect: [
    { name: 'currencyFarmBerryGain', type: 'mult', value: lvl => Math.pow(1.5, lvl) },
    { name: 'farmGoldChance', type: 'mult', value: lvl => lvl * 0.05 + 1 },
  ]},
  cloud: { icon: 'mdi-clouds', color: 'blue-grey', effect: [
    { name: 'currencyFarmGrainGain', type: 'mult', value: lvl => Math.pow(1.5, lvl) },
    { name: 'currencyFarmFlowerGain', type: 'mult', value: lvl => Math.pow(1.5, lvl) },
  ]},
  // general（大道法则/灵宝自身）
  coin: { icon: 'mdi-circle-multiple', color: 'amber', effect: [
    { name: 'currencyTreasureFragmentGain', type: 'mult', value: lvl => lvl * 0.2 + 1 },
    { name: 'treasureSlots', type: 'base', value: lvl => lvl },
  ]},
};

/* ============ 灵宝定义（修仙化改造，结构 100% 对齐 gooboo item schema） ============ */
/* item schema: { feature:[], icon, color, effect(lvl)->[], glyph(lvl)->{}, active? } */
const REL_ITEMS = {
  // ===== general =====
  // 太极图 / 八卦镜 —— general 模块，解锁后自动获得
  taiji: {
    feature: ['general'], icon: 'mdi-circle-outline', color: '#f59e0b',
    effect: lvl => [
      { name: 'currencyRelPowerGain', type: 'mult', value: 1 + lvl * 0.1 },
    ],
    glyph: () => ({}),
    active: { cost: { power: 10 }, feature: 'general', params: () => [], description: () => ['发动太极之力，灵宝之力产出翻倍 10 秒'], formula: () => [], trigger: () => {}, disabled: () => false },
  },
  bagua: {
    feature: ['general'], icon: 'mdi-octagon', color: '#06b6d4',
    effect: lvl => [
      { name: 'currencyRelPowerCap', type: 'mult', value: 1 + lvl * 0.15 },
      { name: 'relicPedestal0', type: 'base', value: lvl },  // 解锁更多 pedestal 0 槽位
    ],
    glyph: () => ({}),
  },

  // ===== mining =====
  pickaxe: {
    feature: ['mining'], icon: 'mdi-pickaxe', color: '#94a3b8',
    effect: lvl => [{ name: 'currencyMiningScrapGain', type: 'mult', value: Math.pow(1.25, lvl) }],
    glyph: () => ({ dust: 1, clay: 3 }),
  },
  energyDrink: {
    feature: ['mining'], icon: 'mdi-battery-charging', color: '#f472b6',
    effect: lvl => [{ name: 'miningResinMax', type: 'base', value: lvl }],
    glyph: () => ({ heat: 2 }),
  },
  torch: {
    feature: ['mining'], icon: 'mdi-flame', color: '#f97316',
    effect: lvl => [{ name: 'miningSmelteryTime', type: 'mult', value: 1 / Math.pow(1.1, lvl) }],
    glyph: () => ({ heat: 3, clay: 1 }),
  },

  // ===== village =====
  woodenSword: {
    feature: ['village'], icon: 'mdi-sword', color: '#84cc16',
    effect: lvl => [
      { name: 'queueSpeedVillageBuilding', type: 'mult', value: 1 + lvl * 0.08 },
      { name: 'villageMaterialGain', type: 'mult', value: 1 + lvl * 0.05 },
    ],
    glyph: () => ({ wood: 2, stone: 3 }),
  },
  watermill: {
    feature: ['village'], icon: 'mdi-water-pump', color: '#22d3ee',
    effect: lvl => [
      { name: 'currencyVillageCoinGain', type: 'mult', value: Math.pow(1.2, lvl) },
    ],
    glyph: () => ({ flow: 3 }),
  },
  keychain: {
    feature: ['village'], icon: 'mdi-key-variant', color: '#a3a3a3',
    effect: lvl => [
      { name: 'villageMaterialCap', type: 'mult', value: Math.pow(1.15, lvl) },
    ],
    glyph: () => ({ stone: 2, wood: 1 }),
  },

  // ===== horde =====
  spikeBall: {
    feature: ['horde'], icon: 'mdi-nail', color: '#dc2626',
    effect: lvl => [
      { name: 'hordeAttack', type: 'mult', value: Math.pow(1.15, lvl) },
      { name: 'hordeHealth', type: 'mult', value: Math.pow(1.15, lvl) },
    ],
    glyph: () => ({ spike: 2 }),
  },
  dreamCatcher: {
    feature: ['horde'], icon: 'mdi-moon-waning-crescent', color: '#60a5fa',
    effect: lvl => [
      { name: 'hordeHeirloomEffect', type: 'mult', value: 1 + lvl * 0.05 },
    ],
    glyph: () => ({ dream: 3 }),
  },
  horseshoe: {
    feature: ['horde'], icon: 'mdi-horseshoe', color: '#22c55e',
    effect: lvl => [
      { name: 'hordeEquipmentChance', type: 'mult', value: 1 + lvl * 0.1 },
    ],
    glyph: () => ({ clover: 2, spike: 1 }),
  },

  // ===== farm =====
  goldenCarrot: {
    feature: ['farm'], icon: 'mdi-carrot', color: '#fbbf24',
    effect: lvl => [
      { name: 'currencyFarmBerryGain', type: 'mult', value: Math.pow(1.3, lvl) },
    ],
    glyph: () => ({ sun: 2, cloud: 1 }),
  },
  rainBoots: {
    feature: ['farm'], icon: 'mdi-boot', color: '#6366f1',
    effect: lvl => [
      { name: 'currencyFarmVegetableGain', type: 'mult', value: Math.pow(1.25, lvl) },
    ],
    glyph: () => ({ rain: 3 }),
  },
  mushroom: {
    feature: ['farm'], icon: 'mdi-mushroom', color: '#fb7185',
    effect: lvl => [
      { name: 'farmGoldChance', type: 'mult', value: 1 + lvl * 0.03 },
    ],
    glyph: () => ({ cloud: 2, sun: 1 }),
  },

  // ===== general（更多灵宝殿解锁） =====
  diamondPillar: {
    feature: ['general'], icon: 'mdi-diamond-stone', color: '#e5e7eb',
    effect: lvl => [
      { name: 'relicPedestal1', type: 'base', value: lvl },
    ],
    glyph: () => ({ coin: 2 }),
  },
  rubyOrb: {
    feature: ['general'], icon: 'mdi-gem', color: '#ef4444',
    effect: lvl => [
      { name: 'relicPedestal2', type: 'base', value: lvl },
    ],
    glyph: () => ({ coin: 3 }),
  },

  // ===== 稀有 =====
  screwdriver: {
    feature: ['mining', 'village'], icon: 'mdi-screwdriver', color: '#6b7280',
    effect: lvl => [
      { name: 'miningOreGain', type: 'mult', value: 1 + lvl * 0.08 },
      { name: 'queueSpeedVillageBuilding', type: 'mult', value: 1 + lvl * 0.08 },
    ],
    glyph: () => ({ wood: 2, clay: 2 }),
  },
  popcorn: {
    feature: ['farm', 'village'], icon: 'mdi-popcorn', color: '#fef3c7',
    effect: lvl => [
      { name: 'currencyFarmFlowerGain', type: 'mult', value: Math.pow(1.2, lvl) },
      { name: 'currencyVillageCoinGain', type: 'mult', value: Math.pow(1.1, lvl) },
    ],
    glyph: () => ({ sun: 2, flow: 2 }),
  },
};

/* ============ 跨模块 effect key 路由（gooboo 原版是每个模块独立注册） ============ */
function relEffectKeyToModuleKey(effectName) {
  // 保持 gooboo 原版 key 格式：relic_<itemKey> 或 relicGlyph_<glyphKey>
  // 跨模块查询时按 name 匹配
  return effectName;
}

/* ============ 核心状态（精确复刻 gooboo state 结构） ============ */
const REL_STATE = {
  item: {},     // { key: { found, feature:[], level, icon, color, effect, glyph, active } }
  glyph: {},    // { key: { progress, icon, color, effect } }
  pedestal: [], // [[], [], []]
};

/* ============ 初始化 ============ */
(function init() {
  // 初始化所有灵宝（所有灵宝默认 found=false，除了 tier=0 的 general 灵宝）
  for (const k in REL_ITEMS) {
    const it = REL_ITEMS[k];
    REL_STATE.item[k] = {
      found: false,
      feature: it.feature || [],
      level: 1,
      icon: it.icon,
      color: it.color,
      effect: it.effect,
      glyph: it.glyph,
      active: it.active || null,
    };
  }
  // 自动发现 general 模块两件（太极图 + 八卦镜）
  REL_STATE.item.taiji.found = true;
  REL_STATE.item.bagua.found = true;

  // 初始化符文
  for (const k in REL_GLYPHS) {
    const g = REL_GLYPHS[k];
    REL_STATE.glyph[k] = { progress: 0, icon: g.icon, color: g.color, effect: g.effect };
  }

  // 初始化 pedestal
  for (let i = 0; i < RELIC_PEDESTAL_AMOUNT; i++) REL_STATE.pedestal.push([]);
})();

/* ============ pedestal mult ============ */
function initPedestalMults() {
  for (let i = 0; i < RELIC_PEDESTAL_AMOUNT; i++) {
    REL_MULT.init('relicPedestal' + i, { feature: 'relic', baseValue: i === 0 ? 1 : 0 });
  }
  // 灵宝之力 gain/cap mult
  REL_MULT.init('currencyRelPowerGain', { feature: 'relic', baseValue: 2 });
  REL_MULT.init('currencyRelPowerCap', { feature: 'relic', baseValue: 50 });
}

function initCUR() {
  REL_CUR.init('rel_power', { value: 2, cap: 50, feature: 'relic' });
}

/* ============ Getters（精确复刻 gooboo getter 签名） ============ */
const REL_GETTERS = {
  // owned() → 所有 found 的灵宝 key 数组
  owned() {
    const arr = [];
    for (const [key, elem] of Object.entries(REL_STATE.item)) {
      if (elem.found) arr.push(key);
    }
    return arr;
  },

  // glyphStats(pedestals=null) → {gKey: {speed, max}}
  glyphStats(pedestals) {
    if (pedestals == null) pedestals = REL_STATE.pedestal;
    const allStats = {};
    pedestals.forEach(pedestal => {
      let stats = {};
      pedestal.forEach(itemKey => {
        if (!REL_STATE.item[itemKey]) return;
        for (const [gKey, amount] of Object.entries(REL_STATE.item[itemKey].glyph(REL_STATE.item[itemKey].level))) {
          if (stats[gKey] === undefined) stats[gKey] = 0;
          stats[gKey] += amount;
        }
      });
      for (const [gKey, elem] of Object.entries(stats)) {
        if (allStats[gKey] === undefined) allStats[gKey] = { speed: 0, max: 0 };
        allStats[gKey].speed += elem;
        if (elem > allStats[gKey].max) allStats[gKey].max = elem;
      }
    });
    return allStats;
  },

  // glyphTimeNeeded(level, cap, bonus=0) → 秒数
  glyphTimeNeeded() {
    return (level, cap, bonus = 0) => {
      if (cap <= level) return null;
      return RELIC_GLYPH_TIME_BASE * Math.pow(RELIC_GLYPH_TIME_INCREMENT, level) * (level + 2) /
        Math.pow(RELIC_GLYPH_SPEED_OVERCAP, cap - level - 1) /
        Math.min(1 + bonus * RELIC_GLYPH_SPEED_BONUS / cap, Math.pow(RELIC_GLYPH_SPEED_OVERCAP, bonus));
    };
  },

  // glyphBonusMult(cap, bonus) → mult 值
  glyphBonusMult() {
    return (cap, bonus) => Math.min(1 + bonus * RELIC_GLYPH_SPEED_BONUS / cap, Math.pow(RELIC_GLYPH_SPEED_OVERCAP, bonus));
  },

  // hasMuseumHint() → 是否有 glyph 还没到 max（用于博物馆 badge 小红点）
  hasMuseumHint() {
    for (const [key, elem] of Object.entries(REL_GETTERS.glyphStats())) {
      if (elem.max > REL_STATE.glyph[key].progress) return false;
    }
    return true;
  },
};

/* ============ effect name → feature 路由（跨模块 MULT 自动寻址） ============ */
function effectNameToFeature(name) {
  // relic 本地
  if (name.startsWith('currencyRelPower') || name.startsWith('relicPedestal')) return 'relic';
  // mining → lm
  if (name.startsWith('mining') || name.startsWith('currencyMining')) return 'mining';
  // village
  if (name.startsWith('village') || name.startsWith('currencyVillage') || name.startsWith('queueSpeedVillage')) return 'village';
  // horde
  if (name.startsWith('horde')) return 'horde';
  // farm
  if (name.startsWith('farm') || name.startsWith('currencyFarm')) return 'farm';
  // dao / treasure
  if (name.startsWith('currencyTreasure') || name.startsWith('treasure')) return 'dao';
  return null;
}

/* ============ Actions（精确复刻 gooboo dispatch 签名） ============ */
function relApply({ name, onFind }) {
  const relic = REL_STATE.item[name];
  if (!relic) return;
  relic.effect(relic.level).forEach(eff => {
    const val = typeof eff.value === 'function' ? eff.value(relic.level) : eff.value;
    const feature = effectNameToFeature(eff.name);
    // 同时写入：1) 本地 MULT（兜底） 2) 跨模块 MULT（GB_MODULES 自动路由）
    if (feature === 'relic' || !feature) {
      // relic 本地效果 → 写本地 MULT
      if (eff.type === 'mult') REL_MULT.setMult({ name: eff.name, key: 'relic_' + name, value: val });
      else REL_MULT.setBase({ name: eff.name, key: 'relic_' + name, value: val });
    }
    // 跨模块路由（如果 GB_MODULES 可用）
    if (feature && typeof GB_MODULES !== 'undefined') {
      const o = { feature, name: eff.name, key: 'relic_' + name, value: val };
      if (eff.type === 'mult') GB_MODULES.multSetMult(o);
      else GB_MODULES.multSetBase(o);
    }
  });
}

function relFind(name) {
  if (!REL_STATE.item[name]) return;
  if (!REL_STATE.item[name].found) {
    REL_STATE.item[name].found = true;
    relApply({ name, onFind: true });
    // 记录到 statistic（如果有）
    if (REL_MODULE.STAT) REL_MODULE.STAT.values.rel_itemsFound.value++;
  }
}

function relUpdatePedestal(idx, arr) {
  if (idx < 0 || idx >= RELIC_PEDESTAL_AMOUNT) return;
  REL_STATE.pedestal[idx] = arr.slice();
}

function relChangePedestals(pedestals) {
  for (let i = 0; i < RELIC_PEDESTAL_AMOUNT; i++) {
    REL_STATE.pedestal[i] = pedestals[i] ? pedestals[i].slice() : [];
  }
  // gooboo 原版：也重置所有 glyph 进度的小数部分
  for (const [key, elem] of Object.entries(REL_STATE.glyph)) {
    if (elem.progress - Math.floor(elem.progress) > 0) {
      elem.progress = Math.floor(elem.progress);
    }
  }
}

function relApplyGlyphEffect(name) {
  const glyph = REL_STATE.glyph[name];
  glyph.effect.forEach(elem => {
    const val = elem.value(Math.floor(glyph.progress));
    const feature = effectNameToFeature(elem.name);
    if (feature === 'relic' || !feature) {
      if (elem.type === 'mult') REL_MULT.setMult({ name: elem.name, key: 'relicGlyph_' + name, value: val });
      else REL_MULT.setBase({ name: elem.name, key: 'relicGlyph_' + name, value: val });
    }
    if (feature && typeof GB_MODULES !== 'undefined') {
      const o = { feature, name: elem.name, key: 'relicGlyph_' + name, value: val };
      if (elem.type === 'mult') GB_MODULES.multSetMult(o);
      else GB_MODULES.multSetBase(o);
    }
  });
}

/* ============ Tick 逻辑（精确复刻 gooboo src/js/modules/relic.js tick） ============ */
function tick(seconds) {
  // 1. 产 relic_power（用本地 CUR + MULT）
  if (CUR && typeof REL_CUR.add === 'function') {
    const gain = REL_MULT.get('currencyRelPowerGain', 2) * seconds / (SECONDS_PER_HOUR || 3600);
    REL_CUR.add('rel_power', gain);
  }
  // 2. 推进 glyph
  const stats = REL_GETTERS.glyphStats();
  for (const [key, stat] of Object.entries(stats)) {
    const glyph = REL_STATE.glyph[key];
    if (stat.max > Math.floor(glyph.progress)) {
      let amountLeft = seconds;
      let oldProgress = glyph.progress;
      let newProgress = glyph.progress;
      while (amountLeft > 0) {
        const levelDiff = stat.max - Math.floor(newProgress);
        if (levelDiff <= 0) break;
        const difficulty = REL_GETTERS.glyphTimeNeeded()(Math.floor(newProgress), stat.max, stat.speed - stat.max);
        if (!difficulty) break;
        const amountUsed = Math.min((Math.floor(newProgress + 1) - newProgress) * difficulty, amountLeft);
        newProgress += amountUsed / difficulty;
        amountLeft -= amountUsed;
      }
      glyph.progress = newProgress;
      if (Math.floor(newProgress) > Math.floor(oldProgress)) {
        relApplyGlyphEffect(key);
      }
    }
  }
}

/* ============ 外部 API（全局暴露） ============ */
var REL_MODULE = {
  _name: 'relic',
  tickspeed: 1,
  unlockNeeded: 'lingbaoFeature',

  // 常量（view 需要读）
  PEDESTAL_AMOUNT: RELIC_PEDESTAL_AMOUNT,
  GLYPH_TIME_BASE: RELIC_GLYPH_TIME_BASE,
  ITEMS: REL_ITEMS,
  GLYPHS: REL_GLYPHS,
  GLYPH_COLOR: glyphColor,

  // State 只读引用
  get state() { return REL_STATE; },
  get items() { return REL_STATE.item; },
  get glyphs() { return REL_STATE.glyph; },
  get pedestal() { return REL_STATE.pedestal; },

  // Getters
  get owned() { return REL_GETTERS.owned(); },
  get glyphStats() { return REL_GETTERS.glyphStats(); },
  glyphStatsPreview(pedestals) { return REL_GETTERS.glyphStats(pedestals); },
  glyphTimeNeeded(level, cap, bonus) { return REL_GETTERS.glyphTimeNeeded()(level, cap, bonus); },
  glyphBonusMult(cap, bonus) { return REL_GETTERS.glyphBonusMult()(cap, bonus); },
  hasMuseumHint() { return REL_GETTERS.hasMuseumHint(); },

  // Pedestal helpers
  pedestalMax(idx) { return REL_MULT.get('relicPedestal' + idx, idx === 0 ? 1 : 0); },
  pedestalUnlocked(idx) { return this.pedestalMax(idx) > 0; },
  isOnPedestal(itemKey) { return REL_STATE.pedestal.some(p => p.includes(itemKey)); },

  // Actions（精确复刻 gooboo dispatch 签名）
  find(name) { relFind(name); },
  apply(name, opts) { relApply({ name, onFind: opts && opts.onFind }); },
  changePedestals(pedestals) { relChangePedestals(pedestals); },
  applyGlyphEffect(name) { relApplyGlyphEffect(name); },

  // tick
  tick,

  // ======= Statistic（view 用） =======
  STAT: {
    values: {
      rel_itemsFound: { value: 2 },  // 初始 taiji + bagua
      rel_totalPowerGained: { value: 0 },
      rel_totalGlyphLevel: { value: 0 },
      rel_glyphMax: { value: 0 },
    }
  },

  // ======= 临时 convenience 给 view 用（替代 gem/achievement 的调用） =======
  // gooboo 没这个，我们做方便调试/测试
  forceDiscover(name) { if (REL_STATE.item[name]) relFind(name); },
  forceUpgrade(name) {
    if (!REL_STATE.item[name] || !REL_STATE.item[name].found) return false;
    REL_STATE.item[name].level++;
    relApply({ name });
    return true;
  },
  // 悟道：随机发现一件未发现灵宝（给修仙版留个入口，替代 achievement 自动发现）
  enlighten() {
    const missing = Object.keys(REL_STATE.item).filter(k => !REL_STATE.item[k].found);
    if (missing.length === 0) return { ok: false, reason: 'allFound' };
    const name = missing[Math.floor(Math.random() * missing.length)];
    relFind(name);
    return { ok: true, item: name };
  },

  // ======= 存档钩子（精确复刻 gooboo saveGame/loadGame） =======
  snapshot() {
    let obj = { owned: [] };
    for (const [key, elem] of Object.entries(REL_STATE.item)) {
      if (elem.found) obj.owned.push(key);
      if (elem.level > 1) {
        if (!obj.level) obj.level = {};
        obj.level[key] = elem.level;
      }
    }
    for (const [key, elem] of Object.entries(REL_STATE.glyph)) {
      if (elem.progress > 0) {
        if (!obj.glyph) obj.glyph = {};
        obj.glyph[key] = elem.progress;
      }
    }
    for (const [key, elem] of Object.entries(REL_STATE.pedestal)) {
      if (elem.length > 0) {
        if (!obj.pedestal) obj.pedestal = {};
        obj.pedestal[key] = elem;
      }
    }
    return obj;
  },

  restore(data) {
    if (!data) return;
    // 先重置所有 item 为未发现
    for (const k in REL_STATE.item) {
      REL_STATE.item[k].found = false;
      REL_STATE.item[k].level = 1;
    }
    // 恢复 owned
    if (data.owned) {
      data.owned.forEach(name => { relFind(name); });
    }
    // 恢复 level
    if (data.level) {
      for (const [name, lvl] of Object.entries(data.level)) {
        if (REL_STATE.item[name] && REL_STATE.item[name].found) {
          REL_STATE.item[name].level = lvl;
          relApply({ name });
        }
      }
    }
    // 恢复 glyph
    if (data.glyph) {
      for (const [name, prog] of Object.entries(data.glyph)) {
        if (REL_STATE.glyph[name]) {
          REL_STATE.glyph[name].progress = prog;
          if (prog >= 1) relApplyGlyphEffect(name);
        }
      }
    }
    // 恢复 pedestal
    if (data.pedestal) {
      for (const [idx, arr] of Object.entries(data.pedestal)) {
        relUpdatePedestal(parseInt(idx), arr);
      }
    }
  },

  hardReset() {
    for (const k in REL_STATE.item) { REL_STATE.item[k].found = false; REL_STATE.item[k].level = 1; }
    for (const k in REL_STATE.glyph) { REL_STATE.glyph[k].progress = 0; }
    for (let i = 0; i < RELIC_PEDESTAL_AMOUNT; i++) REL_STATE.pedestal[i] = [];
    relFind('taiji'); relFind('bagua');
  },

  // ======= 初始化入口 =======
  init() {
    initPedestalMults();
    initCUR();
    // 自动发现的 general 灵宝在 IIFE 里已经发现了，这里补 apply
    relApply({ name: 'taiji' });
    relApply({ name: 'bagua' });

    // 注册到 GB_MODULES（让跨模块 mult 路由能找到 relic 的 MULT）
    if (typeof GB_MODULES !== 'undefined') {
      GB_MODULES.register({
        id: 'relic',
        name: '先天灵宝',
        keyPrefix: 'rel',
        tickSpeed: 1,
        unlockNeeded: 'lingbaoFeature',
        core: REL_MODULE,
      });
    }
  },

  // ======= 子系统暴露 =======
  get MULT() { return REL_MULT; },
  get CUR() { return REL_CUR; },
  // RT.tick 是统一 tick 入口（对齐 GB_MODULES.tickAll 的 mod.core.RT.tick 模式）
  RT: { tick: tick, afterChange: () => {} },
};

if (typeof window !== 'undefined') {
  window.REL_MODULE = REL_MODULE;
  window.REL_STATE = REL_STATE;
  window.REL_ITEMS = REL_ITEMS;
  window.REL_GLYPHS = REL_GLYPHS;
  // 注意：不暴露 window.MULT / window.CUR，避免和 lm_core.js 全局冲突
  // 外部访问请用 REL_MODULE.MULT / REL_MODULE.CUR
  REL_MODULE.init();
}
