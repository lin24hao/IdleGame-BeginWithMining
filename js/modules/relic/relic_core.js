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

/* ============ MULT 子系统（对齐 gooboo mult 语义） ============
 * 最终值 = (baseValue + Σ baseValues) × Π multValues + Σ bonusValues
 * base/mult/bonus 是缓存字段，兼容旧代码直接读字段（如 REL_CUR.cap、card_core）
 * key 参数对应 gooboo 的 multKey —— 同名不同 key 的多来源按 gooboo 规则聚合 */
const REL_MULT = {
  values: {},

  init(name, o) {
    if (!this.values[name]) {
      const baseValue = (o && o.baseValue !== undefined ? o.baseValue : 1);
      this.values[name] = { baseValue, baseValues: {}, multValues: {}, bonusValues: {}, base: baseValue, mult: 1, bonus: 0 };
    }
  },
  _ensure(name) {
    if (!this.values[name]) this.init(name, {});
    return this.values[name];
  },
  _recalc(v) {
    let base = v.baseValue || 0, mult = 1, bonus = 0;
    for (const k in v.baseValues) base += v.baseValues[k];
    for (const k in v.multValues) mult *= v.multValues[k];
    for (const k in v.bonusValues) bonus += v.bonusValues[k];
    v.base = base; v.mult = mult; v.bonus = bonus;
  },
  setMult(o) {
    const v = this._ensure(o.name);
    v.multValues[o.key || '_'] = o.value;
    this._recalc(v);
  },
  setBase(o) {
    const v = this._ensure(o.name);
    v.baseValues[o.key || '_'] = o.value;
    this._recalc(v);
  },
  setBonus(o) {
    const v = this._ensure(o.name);
    v.bonusValues[o.key || '_'] = o.value;
    this._recalc(v);
  },
  // 计算最终值：(baseValue + Σbase) × Πmult + Σbonus
  get(name, fallback) {
    const v = this.values[name];
    if (!v) return fallback !== undefined ? fallback : 1;
    return (v.base || 0) * (v.mult || 1) + (v.bonus || 0);
  },
  // 清除某个 multKey 写入的所有值
  resetKey(key) {
    for (const n in this.values) {
      const v = this.values[n];
      let dirty = false;
      if (v.multValues && key in v.multValues) { delete v.multValues[key]; dirty = true; }
      if (v.baseValues && key in v.baseValues) { delete v.baseValues[key]; dirty = true; }
      if (v.bonusValues && key in v.bonusValues) { delete v.bonusValues[key]; dirty = true; }
      if (dirty) this._recalc(v);
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
    { name: 'currencyXqFragmentGain', type: 'mult', value: lvl => lvl * 0.2 + 1 },
    { name: 'treasureSlots', type: 'base', value: lvl => lvl },
  ]},
  // school（藏经阁）—— gooboo book glyph；schoolBook/currencySchoolGoldenDustCap 与 sc 模块键名一致
  book: { icon: 'mdi-book', color: 'beige', effect: [
    { name: 'schoolBook', type: 'base', value: lvl => lvl * 2 },
    { name: 'currencySchoolGoldenDustCap', type: 'base', value: lvl => lvl * 2500 },
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
      { name: 'currencyRelicPowerGain', type: 'mult', value: 1 + lvl * 0.1 },
    ],
    glyph: () => ({}),
    active: {
      cost: { relic_power: 10 },
      feature: 'general',
      params: () => [],
      description: () => ['发动太极之力，灵宝之力产出翻倍 10 秒'],
      formula: () => ['10秒 ×2'],
      disabled: () => false,
      trigger: () => {
        // 灵宝之力产出翻倍 10 秒
        REL_STATE.buff.tempRelicPowerGain = {
          endsAt: Date.now() + 10000,
          mult: 2,
        };
      },
    },
  },
  bagua: {
    feature: ['general'], icon: 'mdi-octagon', color: '#06b6d4',
    effect: lvl => [
      { name: 'currencyRelicPowerCap', type: 'mult', value: 1 + lvl * 0.15 },
      { name: 'relicPedestal0', type: 'base', value: lvl },  // 解锁更多 pedestal 0 槽位
    ],
    glyph: () => ({}),
  },

  // 博物馆钥匙 —— gooboo museumKey（gem 锻造产出），发现即解锁灵宝殿（博物馆）
  museumKey: {
    feature: ['general', 'relic'], icon: 'mdi-key', color: '#7c3aed',
    effect: lvl => [
      { name: 'relicMuseum', type: 'unlock', value: true },
    ],
    glyph: () => ({ cloud: 2, coin: 3 }),
  },

  // ===== mining =====
  pickaxe: {
    feature: ['mining'], icon: 'mdi-pickaxe', color: '#94a3b8',
    effect: lvl => [{ name: 'currencyMiningScrapGain', type: 'mult', value: Math.pow(1.25, lvl) }],
    glyph: () => ({ dust: 1, clay: 3 }),
    active: {
      cost: { relic_power: 8 }, feature: 'mining',
      params: () => [], description: () => ['凝聚灵宝之力，立即析出灵石碎屑'], formula: () => ['50 灵石碎屑'],
      disabled: () => false,
      trigger: () => { relGrantCurrency('lm', 'lm_scrap', 50); },
    },
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
    active: {
      cost: { relic_power: 5 }, feature: 'mining',
      params: () => [], description: () => ['灵焰锻炉，立即析出灵石碎屑'], formula: () => ['30 灵石碎屑'],
      disabled: () => false,
      trigger: () => { relGrantCurrency('lm', 'lm_scrap', 30); },
    },
  },

  // ===== village =====
  woodenSword: {
    feature: ['village'], icon: 'mdi-sword', color: '#84cc16',
    effect: lvl => [
      { name: 'queueSpeedVillageBuilding', type: 'mult', value: 1 + lvl * 0.08 },
      { name: 'villageMaterialGain', type: 'mult', value: 1 + lvl * 0.05 },
    ],
    glyph: () => ({ wood: 2, stone: 3 }),
    active: {
      cost: { relic_power: 6 }, feature: 'village',
      params: () => [], description: () => ['木灵剑催动门徒，立即入账宗门灵石'], formula: () => ['40 宗门灵石'],
      disabled: () => false,
      trigger: () => { relGrantCurrency('vill', 'village_coin', 40); },
    },
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
    active: {
      cost: { relic_power: 6 }, feature: 'village',
      params: () => [], description: () => ['铜钥匙开启宝库，立即入账宗门灵石'], formula: () => ['50 宗门灵石'],
      disabled: () => false,
      trigger: () => { relGrantCurrency('vill', 'village_coin', 50); },
    },
  },

  // ===== horde =====
  spikeBall: {
    feature: ['horde'], icon: 'mdi-nail', color: '#dc2626',
    effect: lvl => [
      { name: 'hordeAttack', type: 'mult', value: Math.pow(1.15, lvl) },
      { name: 'hordeHealth', type: 'mult', value: Math.pow(1.15, lvl) },
    ],
    glyph: () => ({ spike: 2 }),
    active: {
      cost: { relic_power: 6 }, feature: 'horde',
      params: () => [], description: () => ['狼牙钉震慑妖物，立即拾取妖骨'], formula: () => ['25 妖骨'],
      disabled: () => false,
      trigger: () => { relGrantCurrency('horde', 'horde_bone', 25); },
    },
  },
  dreamCatcher: {
    feature: ['horde'], icon: 'mdi-moon-waning-crescent', color: '#60a5fa',
    effect: lvl => [
      { name: 'hordeHeirloomEffect', type: 'mult', value: 1 + lvl * 0.05 },
    ],
    glyph: () => ({ dream: 3 }),
    active: {
      cost: { relic_power: 8 }, feature: 'horde',
      params: () => [], description: () => ['梦境网捕获妖物残躯，立即拾取魔肉精粹'], formula: () => ['15 魔肉'],
      disabled: () => false,
      trigger: () => { relGrantCurrency('horde', 'horde_monsterPart', 15); },
    },
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
    active: {
      cost: { relic_power: 6 }, feature: 'farm',
      params: () => [], description: () => ['金灵果催熟灵田，立即收获灵菜'], formula: () => ['40 灵菜'],
      disabled: () => false,
      trigger: () => { relGrantCurrency('farm', 'farm_vegetable', 40); },
    },
  },
  rainBoots: {
    feature: ['farm'], icon: 'mdi-boot', color: '#6366f1',
    effect: lvl => [
      { name: 'currencyFarmVegetableGain', type: 'mult', value: Math.pow(1.25, lvl) },
    ],
    glyph: () => ({ rain: 3 }),
    active: {
      cost: { relic_power: 6 }, feature: 'farm',
      params: () => [], description: () => ['雨靴踏遍灵田，立即收获灵谷'], formula: () => ['40 灵谷'],
      disabled: () => false,
      trigger: () => { relGrantCurrency('farm', 'farm_grain', 40); },
    },
  },
  mushroom: {
    feature: ['farm'], icon: 'mdi-mushroom', color: '#fb7185',
    effect: lvl => [
      { name: 'farmGoldChance', type: 'mult', value: 1 + lvl * 0.03 },
    ],
    glyph: () => ({ cloud: 2, sun: 1 }),
    active: {
      cost: { relic_power: 8 }, feature: 'farm',
      params: () => [], description: () => ['灵药菇散发药香，立即收获灵果'], formula: () => ['40 灵果'],
      disabled: () => false,
      trigger: () => { relGrantCurrency('farm', 'farm_berry', 40); },
    },
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

/* ============ active 跨模块货币发放（等价 gooboo currency/gain） ============ */
function relGrantCurrency(moduleId, curKey, amount) {
  try {
    const mod = (typeof GB_MODULES !== 'undefined') ? GB_MODULES.get(moduleId) : null;
    if (mod && mod.core && mod.core.CUR && typeof mod.core.CUR.add === 'function') {
      mod.core.CUR.add(curKey, amount);
      return true;
    }
  } catch (e) { /* 单模块异常静默，不阻断 active 触发 */ }
  return false;
}

/* ============ 核心状态（精确复刻 gooboo state 结构） ============ */
const REL_STATE = {
  item: {},     // { key: { found, feature:[], level, icon, color, effect, glyph, active } }
  glyph: {},    // { key: { progress, icon, color, effect } }
  pedestal: [], // [[], [], []]
  // 临时 buff（灵宝 active 触发）: { multKey: { endsAt: timestamp, mult: number, base: number } }
  // 例: { tempRelicPowerGain: { endsAt: Date.now()+10000, mult: 2 } }
  buff: {},
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
  REL_MULT.init('currencyRelicPowerGain', { feature: 'relic', baseValue: 2 });
  REL_MULT.init('currencyRelicPowerCap', { feature: 'relic', baseValue: 50 });
}

function initCUR() {
  REL_CUR.init('relic_power', { value: 2, cap: 50, feature: 'relic' });
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
  if (name.startsWith('currencyRelic') || name.startsWith('relicPedestal')) return 'relic';
  // treasure（仙器）：XQ_MULT 用 currencyXq* 命名，treasureSlots 也归仙器槽位
  if (name.startsWith('currencyXq') || name.startsWith('currencyTreasure') || name.startsWith('treasure')) return 'treasure';
  // school（藏经阁）：schoolBook / currencySchool*（sc 模块键名与 gooboo 一致）
  if (name.startsWith('school') || name.startsWith('currencySchool')) return 'school';
  // mining → lm
  if (name.startsWith('mining') || name.startsWith('currencyMining')) return 'mining';
  // village
  if (name.startsWith('village') || name.startsWith('currencyVillage') || name.startsWith('queueSpeedVillage')) return 'village';
  // horde
  if (name.startsWith('horde') || name.startsWith('currencyHorde')) return 'horde';
  // farm
  if (name.startsWith('farm') || name.startsWith('currencyFarm')) return 'farm';
  // ruin（秘境）
  if (name.startsWith('ruin') || name.startsWith('currencyRuin')) return 'ruin';
  return null;
}

/* gooboo effect name → 目标模块实际 mult 键名
 * lm 模块用 lm* 前缀（映射规则与 card_core.cardEffectKeyToModuleKey 一致），
 * 其余模块（village/horde/farm/school/treasure）沿用 gooboo 原名 */
function effectNameToModuleKey(name) {
  if (name.startsWith('currencyMining')) return 'currencyLm' + name.slice('currencyMining'.length);
  if (name.startsWith('mining')) return 'lm' + name.slice('mining'.length);
  return name;
}

/* ============ Actions（精确复刻 gooboo dispatch 签名） ============ */
function relApplyEffect(eff, multKey, val) {
  const feature = effectNameToFeature(eff.name);
  // unlock 类效果（如博物馆钥匙 relicMuseum）走 GB_UNLOCK
  if (eff.type === 'unlock') {
    if (val && typeof GB_UNLOCK !== 'undefined' && typeof GB_UNLOCK.unlock === 'function') GB_UNLOCK.unlock(eff.name);
    return;
  }
  // 同时写入：1) 本地 MULT（兜底） 2) 跨模块 MULT（GB_MODULES 自动路由）
  if (feature === 'relic' || !feature) {
    if (eff.type === 'mult') REL_MULT.setMult({ name: eff.name, key: multKey, value: val });
    else if (eff.type === 'bonus') REL_MULT.setBonus({ name: eff.name, key: multKey, value: val });
    else REL_MULT.setBase({ name: eff.name, key: multKey, value: val });
  }
  // 跨模块路由（如果 GB_MODULES 可用）；mining 系键名需翻译成 lm* 前缀
  if (feature && typeof GB_MODULES !== 'undefined') {
    const o = { feature, name: effectNameToModuleKey(eff.name), key: multKey, value: val };
    if (eff.type === 'mult') GB_MODULES.multSetMult(o);
    else if (eff.type === 'bonus') { if (typeof GB_MODULES.multSetBonus === 'function') GB_MODULES.multSetBonus(o); }
    else GB_MODULES.multSetBase(o);
  }
}

function relApply({ name, onFind }) {
  const relic = REL_STATE.item[name];
  if (!relic) return;
  relic.effect(relic.level).forEach(eff => {
    const val = typeof eff.value === 'function' ? eff.value(relic.level) : eff.value;
    relApplyEffect(eff, 'relic_' + name, val);
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
    relApplyEffect(elem, 'relicGlyph_' + name, val);
  });
}

/* ============ Tick 逻辑（精确复刻 gooboo src/js/modules/relic.js tick） ============ */
function tick(seconds) {
  const now = Date.now();
  // 清理过期 buff
  for (const k in REL_STATE.buff) {
    if (REL_STATE.buff[k].endsAt <= now) delete REL_STATE.buff[k];
  }

  // 1. 产 relic_power（用本地 CUR + MULT + 临时 buff）
  if (typeof REL_CUR !== 'undefined' && typeof REL_CUR.add === 'function') {
    let gain = REL_MULT.get('currencyRelicPowerGain', 2) * seconds / (SECONDS_PER_HOUR || 3600);
    // 临时 buff（太极图等 active 触发）
    if (REL_STATE.buff.tempRelicPowerGain) {
      gain *= REL_STATE.buff.tempRelicPowerGain.mult;
    }
    REL_CUR.add('relic_power', gain);
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

/* ============ Active 灵宝使用（精确复刻 gooboo store useActive action） ============ */
function useActive(name, option) {
  const relic = REL_STATE.item[name];
  if (!relic || !relic.active) return { ok: false, reason: 'noActive' };
  const a = relic.active;
  // disabled 检查
  if (a.disabled && a.disabled(a.params ? a.params() : [], option)) return { ok: false, reason: 'disabled' };
  // 消耗检查 & 扣除
  const cost = a.cost || {};
  for (const [curKey, amount] of Object.entries(cost)) {
    if (REL_CUR.value(curKey) < amount) return { ok: false, reason: 'afford', need: curKey, amount };
  }
  for (const [curKey, amount] of Object.entries(cost)) {
    REL_CUR.add(curKey, -amount);
  }
  // 记录使用次数（gooboo stat relicActivesUsed → 修仙化 rel_activesUsed）
  if (REL_MODULE.STAT && REL_MODULE.STAT.values.rel_activesUsed) {
    REL_MODULE.STAT.values.rel_activesUsed.value++;
  }
  // 触发
  a.trigger(a.params ? a.params() : [], option);
  return { ok: true };
}

/* ============ 总等级里程碑发遗物（对齐 gooboo store/meta.js globalLevel 40/100 送遗物） ============
 * gooboo：globalLevel 40（relic 解锁期）送 friendlyBat，100（general 解锁期）送 notebook。
 * 项目没有成就/gem/活动模块，里程碑扩展为 5 档，覆盖 gooboo 由成就等渠道发放的灵宝。 */
const REL_MILESTONES = [
  { level: 40, relic: 'pickaxe' },
  { level: 100, relic: 'screwdriver' },
  { level: 150, relic: 'dreamCatcher' },
  { level: 300, relic: 'rainBoots' },
  { level: 400, relic: 'mushroom' },
];

function checkMilestones(level) {
  let found = 0;
  REL_MILESTONES.forEach(m => {
    if (level >= m.level && REL_STATE.item[m.relic] && !REL_STATE.item[m.relic].found) {
      relFind(m.relic);
      found++;
    }
  });
  return found;
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
  useActive(name, option) { return useActive(name, option); },

  // tick
  tick,

  // ======= Statistic（view 用） =======
  STAT: {
    values: {
      rel_itemsFound: { value: 2 },  // 初始 taiji + bagua
      rel_totalPowerGained: { value: 0 },
      rel_totalGlyphLevel: { value: 0 },
      rel_glyphMax: { value: 0 },
      rel_activesUsed: { value: 0 },
    }
  },

  // ======= 总等级里程碑（meta.js 在 globalLevel 提升时调用；读档时补发） =======
  MILESTONES: REL_MILESTONES,
  checkMilestones(level) { return checkMilestones(level); },

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
    // 灵宝碎片（card）存档
    if (typeof CARD_MODULE !== 'undefined') {
      try { obj.card = CARD_MODULE.saveGame(); } catch (e) {}
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
    // 恢复灵宝碎片（card）
    if (data.card && typeof CARD_MODULE !== 'undefined') {
      try { CARD_MODULE.loadGame(data.card); } catch (e) {}
    }
    // 补发总等级里程碑（老档 globalLevel 已过阈值但灵宝未发的场景）
    try {
      if (typeof GB_META !== 'undefined' && GB_META.state && typeof GB_META.state.globalLevel === 'number') {
        checkMilestones(GB_META.state.globalLevel);
      }
    } catch (e) { /* meta 未加载时静默跳过 */ }
  },

  hardReset() {
    for (const k in REL_STATE.item) { REL_STATE.item[k].found = false; REL_STATE.item[k].level = 1; }
    for (const k in REL_STATE.glyph) { REL_STATE.glyph[k].progress = 0; }
    for (let i = 0; i < RELIC_PEDESTAL_AMOUNT; i++) REL_STATE.pedestal[i] = [];
    relFind('taiji'); relFind('bagua');
    // 委托给 CARD_MODULE 统一重置灵宝碎片（跨模块效果会被 calculateCaches 里的 resetEffect 清掉）
    if (typeof CARD_MODULE !== 'undefined' && typeof CARD_MODULE.hardReset === 'function') {
      try { CARD_MODULE.hardReset(); } catch (e) {}
    }
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
