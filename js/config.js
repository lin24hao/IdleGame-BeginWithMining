const CONFIG = {
  REALMS: [
    "炼气","筑基","金丹","元婴","化神","炼虚","合体","大乘","渡劫"
  ],
  QUALITY: {
    common:  { name: "普通", spins: 1, seconds: 1, multiplier: 1,   color: "#c8c8c8" },
    good:    { name: "良品", spins: 2, seconds: 2, multiplier: 3,   color: "#4ade80" },
    rare:    { name: "上品", spins: 3, seconds: 3, multiplier: 10,  color: "#60a5fa" },
    epic:    { name: "极品", spins: 4, seconds: 4, multiplier: 30,  color: "#c084fc" },
    legend:  { name: "传说", spins: 5, seconds: 5, multiplier: 100, color: "#fbbf24" }
  },
  PRECIOUS_ITEMS: [
    // ===== 功法：多为场外增益，部分战斗技能 =====
    { id: "gf_qingxin",   category: "gongfa", name: "清心诀",     fragmentName: "清心诀残页",   quality: "rare",   requiredCount: 3, desc: "修炼速度+5%",                    effectType: "buff_cultivation",  effectValue: 0.05 },
    { id: "gf_yufeng",    category: "gongfa", name: "御风步",     fragmentName: "御风步残页",   quality: "rare",   requiredCount: 3, desc: "点位间移动速度+20%",              effectType: "buff_movement",     effectValue: 0.20 },
    { id: "gf_tianmu",    category: "gongfa", name: "天目诀",     fragmentName: "天目诀残页",   quality: "rare",   requiredCount: 3, desc: "搜索揭示速度+25%",               effectType: "buff_search",       effectValue: 0.25 },
    { id: "gf_danjing",   category: "gongfa", name: "丹经",       fragmentName: "丹经残页",     quality: "rare",   requiredCount: 3, desc: "炼丹速度+20%",                   effectType: "buff_alchemy",      effectValue: 0.20 },
    { id: "gf_lingzhi",   category: "gongfa", name: "灵植诀",     fragmentName: "灵植诀残页",   quality: "rare",   requiredCount: 3, desc: "灵田种植速度+20%",               effectType: "buff_farming",      effectValue: 0.20 },
    { id: "gf_xuantian",  category: "gongfa", name: "玄天剑诀",   fragmentName: "玄天剑诀残页", quality: "epic",   requiredCount: 5, desc: "攻击时30%概率额外造成攻击力50%伤害", effectType: "combat_skill",  effectValue: 0.30, skillDmgRate: 0.50 },
    { id: "gf_pojun",     category: "gongfa", name: "破军剑诀",   fragmentName: "破军剑诀残页", quality: "epic",   requiredCount: 5, desc: "连击时额外造成攻击力100%伤害",     effectType: "combat_skill",  effectValue: 1.00, skillTrigger: "combo" },
    { id: "gf_hundun",    category: "gongfa", name: "混沌心法",   fragmentName: "混沌心法残页", quality: "legend", requiredCount: 8, desc: "所有属性+10%",                    effectType: "buff_all_attrs",    effectValue: 0.10 },
    // ===== 法宝：战斗属性加成 =====
    { id: "fb_xiangmo",   category: "fabao",  name: "降魔杵",     fragmentName: "降魔杵碎片",   quality: "rare",   requiredCount: 3, desc: "攻击+15%",                        effectType: "buff_atk",          effectValue: 0.15 },
    { id: "fb_jingang",   category: "fabao",  name: "金刚罩",     fragmentName: "金刚罩碎片",   quality: "rare",   requiredCount: 3, desc: "防御+15%，格挡+5%",               effectType: "buff_def_block",    effectValue: 0.15, effectValue2: 0.05 },
    { id: "fb_hunyuan",   category: "fabao",  name: "混元珠",     fragmentName: "混元珠碎片",   quality: "rare",   requiredCount: 3, desc: "气血+20%",                        effectType: "buff_hp",           effectValue: 0.20 },
    { id: "fb_fenghuo",   category: "fabao",  name: "风火轮",     fragmentName: "风火轮碎片",   quality: "rare",   requiredCount: 3, desc: "速度+20%",                        effectType: "buff_spd",          effectValue: 0.20 },
    { id: "fb_miehun",    category: "fabao",  name: "灭魂钟",     fragmentName: "灭魂钟碎片",   quality: "epic",   requiredCount: 5, desc: "暴击+10%，爆伤+25%",              effectType: "buff_crit",         effectValue: 0.10, effectValue2: 0.25 },
    { id: "fb_jiulong",   category: "fabao",  name: "九龙神火罩", fragmentName: "九龙神火罩碎片", quality: "legend", requiredCount: 8, desc: "所有战斗属性+15%",               effectType: "buff_all_combat",   effectValue: 0.15 }
  ],
  MAPS: [
    // powerMin/powerMax 是遭遇战怪物战力区间（对应 realmLayerMin~realmLayerMax 层）
    // 推荐战力=区间平均值，玩家战力>=推荐战力时比较轻松
    { id: 1, name: "凡人谷",   realm: 0, layerMin:1, layerMax:9, cost: 0,       valueMin: 10,    valueMax: 5000,       powerMin: 50,    powerMax: 450 },
    { id: 2, name: "灵兽林",   realm: 1, layerMin:1, layerMax:9, cost: 500,     valueMin: 50,    valueMax: 25000,      powerMin: 500,   powerMax: 4500 },
    { id: 3, name: "幽冥渊",   realm: 2, layerMin:1, layerMax:9, cost: 2000,    valueMin: 200,   valueMax: 100000,     powerMin: 5000,  powerMax: 45000 },
    { id: 4, name: "天柱峰",   realm: 3, layerMin:1, layerMax:9, cost: 8000,    valueMin: 800,   valueMax: 400000,     powerMin: 50000, powerMax: 450000 },
    { id: 5, name: "混沌海",   realm: 4, layerMin:1, layerMax:9, cost: 25000,   valueMin: 3000,  valueMax: 1500000,    powerMin: 500000,powerMax: 4500000 },
    { id: 6, name: "九幽殿",   realm: 5, layerMin:1, layerMax:9, cost: 80000,   valueMin: 10000, valueMax: 5000000,    powerMin: 5e6,   powerMax: 4.5e7 },
    { id: 7, name: "仙界门",   realm: 6, layerMin:1, layerMax:9, cost: 250000,  valueMin: 40000, valueMax: 20000000,   powerMin: 5e7,   powerMax: 4.5e8 },
    { id: 8, name: "轮回境",   realm: 7, layerMin:1, layerMax:9, cost: 800000,  valueMin: 150000,valueMax: 80000000,   powerMin: 5e8,   powerMax: 4.5e9 },
    { id: 9, name: "鸿蒙界",   realm: 8, layerMin:1, layerMax:9, cost: 3000000, valueMin: 500000,valueMax: 300000000,  powerMin: 5e9,   powerMax: 4.5e10 }
  ],
  ITEM_NAMES: {
    common: ["残破符纸","枯灵木","碎灵石","凡铁屑","灵灰土","败丹壳","锈蚀法器","枯灵草","浊气石","裂灵玉"],
    good:   ["灵石碎","百年灵草","寒铁精","玄灵木","玉髓石","银灵矿","朱砂粉","灵兽皮","灵鱼骨","灵芝草"],
    rare:   ["中品灵石","百年人参","玄铁精","龙涎草","凤羽","蛟鳞","雷击木","冰魄","火精","地心乳"],
    epic:   ["上品灵石","万年雪莲","星辰铁","九转金丹","凤凰血","龙晶","天雷石","玄冰魄","南明离火","混沌土"],
    legend: ["极品灵石","不死草","星辰砂","混沌珠","鸿蒙紫气","天道石","轮回盘","造化玉","虚无炎","创世土"]
  },
  SIZES: [
    { w: 1, h: 1 },
    { w: 1, h: 2 },
    { w: 2, h: 1 },
    { w: 1, h: 3 },
    { w: 3, h: 1 },
    { w: 2, h: 2 },
    { w: 2, h: 3 },
    { w: 3, h: 2 },
    { w: 3, h: 3 },
    { w: 2, h: 4 },
    { w: 4, h: 2 },
    { w: 3, h: 4 },
    { w: 4, h: 3 },
    { w: 4, h: 5 }
  ],
  EVENTS: [
    { type: "monster",  name: "遭遇妖兽", weight: 25 },
    { type: "rogue",    name: "遭遇散修", weight: 12 },
    { type: "chance",   name: "获得机缘", weight: 18 },
    { type: "trap",     name: "掉落陷阱", weight: 12 },
    { type: "cave",     name: "发现洞府", weight: 8 },
    { type: "lost",     name: "迷路",     weight: 10 },
    { type: "material", name: "发现灵材", weight: 15 }
  ],
  BAG_CAPACITY: 50,
  RING_CAPACITY: 40,
  RING_W: 5,
  RING_H: 8,
  MEDITATION_BASE: 10,
  OFFLINE_MAX_HOURS: 24, // 旧离线封顶字段（保留作兜底；实际以 CONFIG.ENGINE.OFFLINE_MAX_HOURS 为准）
  SAVE_INTERVAL_MS: 30000,
  // ===== 统一 Tick 引擎与离线结算（改造路线B / P0 新增）=====
  ENGINE: {
    TIME_MULT: 1,                 // 全局时间倍率（1 = 原速）
    TIME_MULT_MIN: 1,             // 倍率下限（设置界面可调）
    TIME_MULT_MAX: 10,            // 倍率上限（设置界面可调）
    FRAME_MS: 100,                // 主循环帧间隔（与原有 100ms 修炼节拍一致）
    MAX_STEPS_PER_FRAME: 5000,    // 单帧单模块 tick 次数上限（防卡死）
    CATCHUP_MAX_MS: 600000,       // 单帧最大追赶时长，超出部分走批量推进
    OFFLINE_MAX_HOURS: 720,       // 离线结算窗口上限（原仅修炼且 24h 封顶 → 全系统 30 天软上限）
    OFFLINE_MIN_SHOW_SECONDS: 60  // 离线时长超过该值才展示离线收益摘要
  },
  // 传统RPG属性：突破获得属性点，玩家自由分配
  ATTRIBUTES: {
    atk:     { name:"攻击", perPoint:2,   unit:"",  desc:"提升伤害",   icon:"⚔" },
    def:     { name:"防御", perPoint:2,   unit:"",  desc:"减免伤害",   icon:"🛡" },
    hp:      { name:"气血", perPoint:20,  unit:"",  desc:"提升生命",   icon:"❤" },
    spd:     { name:"身法", perPoint:1,   unit:"",  desc:"出手速度",   icon:"💨" },
    crit:    { name:"暴击", perPoint:0.5, unit:"%", desc:"暴击率",     icon:"✦" },
    critDmg: { name:"爆伤", perPoint:5,   unit:"%", desc:"暴击伤害",   icon:"✸" },
    dodge:   { name:"闪避", perPoint:0.5, unit:"%", desc:"闪避率",     icon:"↪" },
    block:   { name:"格挡", perPoint:0.5, unit:"%", desc:"格挡减伤",   icon:"▮" },
    combo:   { name:"连击", perPoint:0.5, unit:"%", desc:"连击概率",   icon:"↻" }
  },
  // 按境界的遭遇战怪物名称（index = realm 0~8）
  MONSTER_NAMES: [
    ["野狼","毒蛇","妖狐","巨蝎","毒蜂","山魈","妖熊","巨蟒"],
    ["铁甲熊","风刃豹","毒瘴蟾","血影狼","赤焰虎","寒冰蛇","钢鬃野猪"],
    ["鬼面蛛","幽冥蛇","噬魂蝠","金甲尸","百年树妖","毒蛟","血煞"],
    ["天雷兽","玄冰蟒","九尾妖狐","紫电雕","吞云兽","地火龙","青鸾"],
    ["混沌兽","虚空鲸","灭世蝶","空间兽","虚空鲲","破界兽","裂空兽"],
    ["九幽鬼王","冥龙","无面者","虚空魔","幽冥鬼帝","轮回兽","深渊魔"],
    ["天马","六合兽","天罡兽","混元兽","九天玄鸟","金毛犼","青狮"],
    ["时光龙","大乘魔","灭世麒麟","混沌古兽","天罚兽","九幽玄龟","太虚兽"],
    ["鸿蒙巨兽","混沌古神","造化兽","天道兽","鸿蒙龙","创世巨兽","太初神"]
  ],
  ROGUE_NAMES: [
    ["散修","强盗","劫匪","山贼"],
    ["流浪剑客","魔修","邪修","独行客"],
    ["夺宝散人","金丹魔修","邪剑仙","毒仙"],
    ["元婴老怪","夺舍修士","魔道真人","鬼修"],
    ["化神散仙","虚空行者","灭世魔头","域外天魔"],
    ["炼虚魔尊","九幽散仙","冥河老祖","虚空魔神"],
    ["合体大能","混元散仙","天外飞仙","太上长老"],
    ["大乘尊者","灭世魔神","轮回真君","太虚仙尊"],
    ["渡劫散仙","鸿蒙魔神","造化真仙","天道至尊"]
  ],

  // ===== 新增配置 =====

  // 洞府建筑（每个5级，升级需要具体道具+灵石+升级时间秒数）
  // 升级道具名来自 MONSTER_NAMES 和 MATERIAL_NAMES，按境界递增：
  // 灵田用低境界材料，炼丹炉用中境界怪物掉落，炼器炉用高境界怪物掉落
  CAVE_BUILDINGS: {
    lingtian: {
      name: "灵田",
      desc: "种植草药并提升修炼速度",
      levels: [
        { level: 1, meditationMultiplier: 1.0, herbSlots: 2 },
        { level: 2, meditationMultiplier: 1.2, herbSlots: 3,  upgradeCost: { stones: 500,   items: [{name:"灵草",quality:"good",count:5},{name:"玄铁草",quality:"rare",count:3}], time: 300 } },
        { level: 3, meditationMultiplier: 1.5, herbSlots: 4,  upgradeCost: { stones: 3000,  items: [{name:"碧灵草",quality:"good",count:8},{name:"玄铁叶",quality:"rare",count:5}], time: 600 } },
        { level: 4, meditationMultiplier: 1.8, herbSlots: 5,  upgradeCost: { stones: 15000, items: [{name:"金丝草",quality:"good",count:12},{name:"紫铁矿",quality:"rare",count:8}], time: 1200 } },
        { level: 5, meditationMultiplier: 2.0, herbSlots: 6,  upgradeCost: { stones: 60000, items: [{name:"雷灵花",quality:"good",count:15},{name:"星辰矿",quality:"rare",count:10}], time: 1800 } }
      ]
    },
    liandan: {
      name: "炼丹炉",
      desc: "提升炼丹品质概率",
      levels: [
        { level: 1, qualityBonus: 0 },
        { level: 2, qualityBonus: 5,  upgradeCost: { stones: 1000,  items: [{name:"蛇胆草",quality:"rare",count:3},{name:"金甲尸",quality:"epic",count:1}], time: 300 } },
        { level: 3, qualityBonus: 10, upgradeCost: { stones: 6000,  items: [{name:"幽冥蛇",quality:"rare",count:5},{name:"玄冰蟒",quality:"epic",count:2}], time: 600 } },
        { level: 4, qualityBonus: 15, upgradeCost: { stones: 25000, items: [{name:"噬魂蝠",quality:"rare",count:8},{name:"九尾妖狐",quality:"epic",count:3}], time: 1200 } },
        { level: 5, qualityBonus: 20, upgradeCost: { stones: 100000,items: [{name:"毒蛟",quality:"rare",count:12},{name:"吞云兽",quality:"epic",count:5}], time: 1800 } }
      ]
    },
    lianqi: {
      name: "炼器炉",
      desc: "提升装备品质概率与刷新次数",
      levels: [
        { level: 1, qualityBonus: 0,  refreshCount: 1 },
        { level: 2, qualityBonus: 5,  refreshCount: 2, upgradeCost: { stones: 1500,  items: [{name:"百年树妖",quality:"epic",count:1},{name:"血煞",quality:"epic",count:1}], time: 300 } },
        { level: 3, qualityBonus: 10, refreshCount: 3, upgradeCost: { stones: 8000,  items: [{name:"紫电雕",quality:"epic",count:2},{name:"地火龙",quality:"epic",count:1}], time: 600 } },
        { level: 4, qualityBonus: 15, refreshCount: 4, upgradeCost: { stones: 35000, items: [{name:"虚空鲸",quality:"epic",count:3},{name:"灭世蝶",quality:"epic",count:2}], time: 1200 } },
        { level: 5, qualityBonus: 20, refreshCount: 5, upgradeCost: { stones: 150000,items: [{name:"冥龙",quality:"epic",count:5},{name:"九幽鬼王",quality:"legend",count:1}], time: 1800 } }
      ]
    }
  },

  // 草药种植配置（每境界2种：属性草药 attr + 破境草药 break）
  // 种植时间快节奏：低境界5-10分钟，高境界30-60分钟
  HERB_CONFIG: [
    // 每境界：[{id, name, type:"attr"/"break", growTime秒, pillType对应 }]
    [{ id:"herb_0_attr", name:"灵草", type:"attr", growTime: 300, pillType:"atk" },
     { id:"herb_0_break", name:"蛇胆草", type:"break", growTime: 600, pillType:"break" }],
    [{ id:"herb_1_attr", name:"碧灵草", type:"attr", growTime: 360, pillType:"atk" },
     { id:"herb_1_break", name:"蟾衣", type:"break", growTime: 720, pillType:"break" }],
    [{ id:"herb_2_attr", name:"金丝草", type:"attr", growTime: 420, pillType:"atk" },
     { id:"herb_2_break", name:"蝠翼", type:"break", growTime: 840, pillType:"break" }],
    [{ id:"herb_3_attr", name:"雷灵花", type:"attr", growTime: 480, pillType:"atk" },
     { id:"herb_3_break", name:"狐尾", type:"break", growTime: 960, pillType:"break" }],
    [{ id:"herb_4_attr", name:"混沌莲", type:"attr", growTime: 600, pillType:"atk" },
     { id:"herb_4_break", name:"蝶翅", type:"break", growTime: 1200, pillType:"break" }],
    [{ id:"herb_5_attr", name:"幽冥花", type:"attr", growTime: 720, pillType:"atk" },
     { id:"herb_5_break", name:"鬼角", type:"break", growTime: 1440, pillType:"break" }],
    [{ id:"herb_6_attr", name:"天灵果", type:"attr", growTime: 900, pillType:"atk" },
     { id:"herb_6_break", name:"凤羽", type:"break", growTime: 1800, pillType:"break" }],
    [{ id:"herb_7_attr", name:"时光花", type:"attr", growTime: 1200, pillType:"atk" },
     { id:"herb_7_break", name:"麒麟角", type:"break", growTime: 2400, pillType:"break" }],
    [{ id:"herb_8_attr", name:"鸿蒙果", type:"attr", growTime: 1800, pillType:"atk" },
     { id:"herb_8_break", name:"神兽骨", type:"break", growTime: 3600, pillType:"break" }]
  ],

  // 炼丹材料名称（按境界分组，index = realm 0~8）
  MATERIAL_NAMES: [
    ["灵草","铁皮草","蛇胆草","蜂巢"],       // 炼气
    ["碧灵草","玄铁叶","蟾衣","虎骨"],       // 筑基
    ["金丝草","紫铁矿","蝠翼","蛟鳞"],       // 金丹
    ["雷灵花","星辰矿","狐尾","龙须"],       // 元婴
    ["混沌莲","虚空晶","蝶翅","鲲鳞"],       // 化神
    ["幽冥花","冥铁","鬼角","龙晶"],         // 炼虚
    ["天灵果","天罡石","凤羽","犼角"],       // 合体
    ["时光花","混沌精","麒麟角","龟甲"],     // 大乘
    ["鸿蒙果","造化石","神兽骨","天道晶"]    // 渡劫
  ],

  // 装备类型定义
  EQUIPMENT_TYPES: {
    weapon:    { name: "武器", stats: ["atk","hp"],                        desc: "提升攻击和气血" },
    armor:     { name: "防具", stats: ["def","hp"],                        desc: "提升防御和气血" },
    accessory: { name: "宝物", stats: ["crit","critDmg","dodge","block","combo"], desc: "提升次要属性" }
  },

  // 装备品质倍率（装备属性值 = 基础值 × 品质倍率）
  EQUIP_QUALITY_MULTIPLIER: {
    common: 1, good: 1.5, rare: 2, epic: 3, legend: 5
  },

  // 品质灵石补购倍率
  QUALITY_GOLD_COST_MULTIPLIER: {
    common: 1.2, good: 1.5, rare: 2, epic: 5, legend: 10
  }
};

// ===== 炼丹配方生成 =====
// 每境界5种丹药：攻击丹、防御丹、身法丹、破境丹、筑基丹
// 材料改为引用草药id：herb_{realm}_attr（属性草药）/ herb_{realm}_break（破境草药）
// 属性丹需3个属性草药，破境丹需2属性+2破境，筑基丹需5属性+3破境
function generatePillRecipes() {
  const recipes = [];
  let id = 1;
  // 丹药类型定义：matCombo 引用 HERB_CONFIG 的草药 id
  const pillTypes = [
    { type: "atk",   suffix: "攻击丹", matCombo: [
      { herbType: "attr", count: 3 }
    ]},
    { type: "def",   suffix: "防御丹", matCombo: [
      { herbType: "attr", count: 3 }
    ]},
    { type: "spd",   suffix: "身法丹", matCombo: [
      { herbType: "attr", count: 3 }
    ]},
    { type: "break", suffix: "破境丹", matCombo: [
      { herbType: "attr", count: 2 }, { herbType: "break", count: 2 }
    ]},
    { type: "realm", suffix: "筑基丹", matCombo: [
      { herbType: "attr", count: 5 }, { herbType: "break", count: 3 }
    ]}
  ];
  // 每境界配方价格
  const prices = [500, 2000, 8000, 30000, 100000, 300000, 800000, 2000000, 5000000];

  CONFIG.REALMS.forEach((realmName, realm) => {
    pillTypes.forEach(pt => {
      // 炼丹时间（秒）：属性丹 60+realm*30，破境丹 120+realm*60，筑基丹 300+realm*120
      let craftTime;
      if (pt.type === "break") {
        craftTime = 120 + realm * 60;
      } else if (pt.type === "realm") {
        craftTime = 300 + realm * 120;
      } else {
        // 属性丹（atk/def/spd）
        craftTime = 60 + realm * 30;
      }
      recipes.push({
        id: id++,
        realm: realm,
        type: pt.type,
        name: realmName + pt.suffix,
        materials: pt.matCombo.map(m => ({
          id: "herb_" + realm + "_" + m.herbType,
          count: m.count
        })),
        maxConsume: (pt.type === "break" || pt.type === "realm") ? 1 : 10,
        price: prices[realm],
        craftTime: craftTime
      });
    });
  });
  return recipes;
}

// 装备基础属性生成函数
// type: "weapon"/"armor"/"accessory"
// realmLayer: 境界层数（1~9）
function getEquipBaseStats(type, realmLayer) {
  switch (type) {
    case "weapon":
      return { atk: realmLayer * 4 + 10, hp: realmLayer * 20 + 50 };
    case "armor":
      return { def: realmLayer * 4 + 10, hp: realmLayer * 30 + 80 };
    case "accessory": {
      const val = +(realmLayer * 0.3 + 1).toFixed(1);
      return { crit: val, critDmg: val, dodge: val, block: val, combo: val };
    }
    default:
      return {};
  }
}

// ===== 物品生成（原有逻辑） =====
function generateItems() {
  const items = [];
  let id = 1;
  // 按品质的尺寸池及权重：权重集中在1×1~3×3，4×/5×尺寸极少出现
  // common/good 最多2×2，rare 最多3×3，epic/legend 可偶尔出现大件
  const QUALITY_SIZE_POOLS = {
    common: [
      { size: {w:1,h:1}, weight: 40 },
      { size: {w:1,h:2}, weight: 25 },
      { size: {w:2,h:1}, weight: 25 },
      { size: {w:2,h:2}, weight: 10 }
    ],
    good: [
      { size: {w:1,h:1}, weight: 35 },
      { size: {w:1,h:2}, weight: 25 },
      { size: {w:2,h:1}, weight: 25 },
      { size: {w:2,h:2}, weight: 15 }
    ],
    rare: [
      { size: {w:1,h:1}, weight: 25 },
      { size: {w:1,h:2}, weight: 20 },
      { size: {w:2,h:1}, weight: 20 },
      { size: {w:1,h:3}, weight: 8 },
      { size: {w:3,h:1}, weight: 8 },
      { size: {w:2,h:2}, weight: 12 },
      { size: {w:2,h:3}, weight: 3 },
      { size: {w:3,h:2}, weight: 3 },
      { size: {w:3,h:3}, weight: 1 }
    ],
    epic: [
      { size: {w:1,h:1}, weight: 25 },
      { size: {w:1,h:2}, weight: 20 },
      { size: {w:2,h:1}, weight: 20 },
      { size: {w:2,h:2}, weight: 18 },
      { size: {w:2,h:3}, weight: 5 },
      { size: {w:3,h:2}, weight: 5 },
      { size: {w:3,h:3}, weight: 4 },
      { size: {w:2,h:4}, weight: 1 },
      { size: {w:4,h:2}, weight: 1 },
      { size: {w:3,h:4}, weight: 1 }
    ],
    legend: [
      { size: {w:1,h:1}, weight: 22 },
      { size: {w:1,h:2}, weight: 20 },
      { size: {w:2,h:1}, weight: 20 },
      { size: {w:2,h:2}, weight: 18 },
      { size: {w:2,h:3}, weight: 5 },
      { size: {w:3,h:2}, weight: 5 },
      { size: {w:3,h:3}, weight: 5 },
      { size: {w:3,h:4}, weight: 2 },
      { size: {w:4,h:3}, weight: 2 },
      { size: {w:4,h:5}, weight: 1 }
    ]
  };
  const qualities = Object.keys(CONFIG.QUALITY);
  qualities.forEach(qk => {
    const names = CONFIG.ITEM_NAMES[qk];
    const sizePool = QUALITY_SIZE_POOLS[qk];
    names.forEach((name, idx) => {
      CONFIG.MAPS.forEach(map => {
        // 按权重随机选尺寸
        const totalW = sizePool.reduce((s, e) => s + e.weight, 0);
        let r = Math.random() * totalW;
        let size = sizePool[0].size;
        for (const entry of sizePool) {
          r -= entry.weight;
          if (r <= 0) { size = entry.size; break; }
        }
        const q = CONFIG.QUALITY[qk];
        const base = map.valueMin + Math.random() * (map.valueMax - map.valueMin) * 0.1;
        const value = Math.floor(base * q.multiplier * (0.5 + Math.random()));
        items.push({
          id: id++,
          name: name,
          width: size.w,
          height: size.h,
          quality: qk,
          baseValue: Math.max(1, value),
          mapId: map.id,
          perCell: 0
        });
      });
    });
  });
  // 贵重物品：每个秘境生成一份
  CONFIG.PRECIOUS_ITEMS.forEach(pi => {
    const q = CONFIG.QUALITY[pi.quality];
    CONFIG.MAPS.forEach(map => {
      const base = map.valueMin + Math.random() * (map.valueMax - map.valueMin) * 0.3;
      const value = Math.floor(base * q.multiplier * 2);
      items.push({
        id: id++,
        name: pi.fragmentName,
        width: 1,
        height: 1,
        quality: pi.quality,
        baseValue: Math.max(1, value),
        mapId: map.id,
        perCell: 0,
        isPrecious: true,
        preciousId: pi.id
      });
    });
  });
  items.forEach(it => { it.perCell = it.baseValue / (it.width * it.height); });
  return items;
}

// 贵重物品解锁检查工具函数
function isPreciousUnlocked(id) {
  const pc = STATE.player.preciousCollection || {};
  const pi = CONFIG.PRECIOUS_ITEMS.find(p => p.id === id);
  if (!pi) return false;
  return (pc[id] || 0) >= pi.requiredCount;
}

// 获取贵重物品指定效果类型的总加成值（支持多个同类型贵重物品叠加）
function getPreciousBuffTotal(effectType) {
  let total = 0;
  const pc = STATE.player.preciousCollection || {};
  (CONFIG.PRECIOUS_ITEMS || []).forEach(pi => {
    if (pi.effectType !== effectType) return;
    if ((pc[pi.id] || 0) < pi.requiredCount) return;
    total += pi.effectValue;
  });
  return total;
}

// 炼丹配方挂载到CONFIG
CONFIG.PILL_RECIPES = generatePillRecipes();

// 装备基础属性函数挂载到CONFIG
CONFIG.getEquipBaseStats = getEquipBaseStats;

// 物品列表挂载到CONFIG
CONFIG.ITEMS = generateItems();
