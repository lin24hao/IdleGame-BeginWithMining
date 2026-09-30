/**
 * FA_TEXT —— 灵植（farm）模块术语表   [设定映射：gooboo · farm → 修仙灵植]
 * ============================================================
 * 职责：只提供显示文案，不含任何逻辑与数值。
 * 键口径：CURRENCY  键 = 运行时货币键（含 farm_ 前缀）
 *        CROP      键 = gooboo crop 原键
 *        BUILDING  键 = gooboo building 原键
 *        GENE      键 = gooboo gene 原键
 *        FERTILIZER键 = gooboo fertilizer 原键
 *        UPGRADE   键 = gooboo 升级原键（去掉 farm_ 前缀）
 *        UNLOCK    键 = gooboo unlock 原键
 * 未命中回落原键名，缺项不会报错。
 */
const FA_TEXT = {
  /* ---------------- 模块本体 ---------------- */
  MODULE: {
    name: '灵植',
    label: '灵田 · 种植',
    desc: '开辟灵田、栽种灵植，析育灵种、加持灵肥，驯养灵虫、将悟道法，耕耘天地直至飞升。'
  },

  /* ---------------- 通用词条 ---------------- */
  TERMS: {
    field: '灵田',
    crop: '灵植',
    building: '灵筑',
    fertilizer: '灵肥',
    gene: '灵种',
    upgrade: '道法',
    prestige: '飞升',
    planting: '种植',
    harvesting: '收割',
    curing: '护理',
    grow: '成长',
    growTime: '成长时间',
    overgrow: '丛生',
    yield: '产出',
    empty: '空地',
    delete: '移除',
    plantGiant: '培育巨灵',
    selectedCrop: '已选灵植',
    selectedFertilizer: '已选灵肥',
    rainwater: '灵雨',
    unlock: '解锁',
    unlockSeed: '解锁灵种',
    findConsumable: '发现灵肥',
    landTiles: '灵田格'
  },

  /* ---------------- 货币 ---------------- */
  CURRENCY: {
    farm_vegetable: '灵蔬',
    farm_berry: '灵果',
    farm_grain: '灵谷',
    farm_flower: '灵芳',
    farm_rainwater: '灵雨',
    farm_gold: '金穗',
    farm_mixedSeeds: '混元灵种',
    farm_cactusSeed: '荆魂灵种',
    farm_seedHull: '种壳',
    farm_grass: '灵草',
    farm_petal: '灵瓣',
    farm_bug: '灵虫',
    farm_butterfly: '灵蝶',
    farm_ladybug: '灵瓢',
    farm_spider: '灵蛛',
    farm_bee: '灵蜂',
    farm_mysteryStone: '玄灵石',
    farm_smallSeed: '小灵种',
    farm_ancientSeed: '古灵种',
    farm_snail: '灵蜗',
    farm_oldRoot: '古根'
  },

  /* ---------------- 灵植（40 种，按稀有度梯度：低阶朴素→高阶超凡） ---------------- */
  CROP: {
    /* —— 常规（tier0-32 由入门到高阶） —— */
    carrot: '聚灵草',          /* 用户明示映射：聚灵草 */
    blueberry: '碎玉菊',       /* 用户明示映射：碎玉菊 */
    wheat: '云纹穗',
    tulip: '绛霄兰',
    potato: '玉土苕',
    raspberry: '绛露莓',
    barley: '斑竹米',
    dandelion: '绒针艾',
    corn: '金鳞苞',
    watermelon: '碧瓤瓜',
    rice: '香茅根',
    rose: '玄霓玫',
    leek: '霜华韭',
    honeymelon: '蜜须花',
    rye: '赭芒穗',
    daisy: '素心菊',
    cucumber: '翠萝瓜',
    grapes: '紫霞葡',
    hops: '铁线蔓',
    violet: '紫府薇',
    sweetPotato: '黄泥笋',
    strawberry: '赤霞莓',
    sesame: '星子麻',
    sunflower: '金乌葵',
    spinach: '玉髓菜',
    currant: '绛珠果',
    redwheat: '玄朱穗',
    poppy: '彤霞罂',
    pumpkin: '玄黄瓠',
    blackberry: '玄墨莓',
    millet: '青黎秫',
    petunia: '绯仙妍',
    chili: '赤焰椒',
    /* —— 特殊玄机作物（超凡） —— */
    fern: '玄冥蕨',
    reed: '沧浪苇',
    wildflower: '混元花',
    cactus: '赤霄棘',
    cress: '凤髓芥',
    goldenRose: '鎏金玫',
    ancientFern: '玄古蕨'
  },

  /* ---------------- 灵筑（仙筑法器） ---------------- */
  BUILDING: {
    gardenGnome: '守园神偶',
    sprinkler: '漫雨灵阵',
    lectern: '讲道台',
    pinwheel: '兜风轮',
    flag: '万灵法旗'
  },

  /* ---------------- 灵种（基因） ---------------- */
  GENE: {
    yield: '丰饶',
    gold: '金穗缘',
    exp: '灵悟',
    rareDrop: '奇遇',
    grow: '衍芽',
    overgrow: '丛生',
    mutate: '变异',
    grass: '草灵',
    dna: '道种',
    gnome: '神偶',
    lonely: '孤影',
    fertile: '沃土',
    mystery: '玄机',
    conversion: '化生',
    prestige: '飞升',
    rareDropChance: '奇遇缘',
    lucky: '鸿运',
    finalize: '定形',
    selfless: '忘我',
    unyielding: '不屈',
    teamwork: '协力',
    hunter: '猎珍',
    patient: '静候'
  },

  /* ---------------- 灵肥（道韵药剂 / 门派化工） ---------------- */
  FERTILIZER: {
    speedGrow: '速衍灵浆',
    richSoil: '坤舆沃壤',
    shiny: '流光玄露',
    juicy: '甘霖真液',
    dissolving: '化形融丹',
    supplementsS: '衍灵散·初',
    supplementsM: '衍灵散·中',
    supplementsL: '衍灵散·高',
    supplementsXL: '衍灵散·玄',
    supplementsXXL: '衍灵散·极',
    potatoWater: '玉苕汤泉',
    roseWater: '玄霓花酿',
    weedKiller: '荡秽灵剂',
    turboGrow: '顿长春息',
    premium: '无极真露',
    analyzing: '析炁玄丹',
    superJuicy: '天霖至露',
    pellets: '固本灵丸'
  },

  /* ---------------- 道法（升级·功法/秘诀/术路） ---------------- */
  UPGRADE: {
    seedBox: '灵种匣',
    fertility: '沃土真诀',
    overgrowth: '丛生妙诀',
    expansion: '拓田妙术',
    gardenGnome: '守园通神诀',
    learning: '悟道心经',
    wateringCan: '点雨灵诀',
    manure: '灵壤化粪功',
    seedBag: '纳种百宝袋',
    groundSeeds: '落地生根术',
    roastedSeeds: '炼种御火术',
    rainBarrel: '聚雨吸灵阵',
    smallCrate: '贮物·小灵匣',
    sprinkler: '漫雨玄阵',
    hayBales: '灵草垛元阵',
    magnifyingGlass: '观微探虫术',
    scarecrow: '却雀惊林术',
    anthill: '蚁阵衍菌功',
    bugPowder: '碾虫凝粉术',
    shed: '灵耕静室',
    gutter: '引津归渠阵',
    lectern: '讲道玄台',
    pheromones: '引虫香诀',
    perfume: '馥韵凝香露',
    mediumCrate: '贮物·中灵匣',
    stompedSeeds: '踏碎成种术',
    insectParadise: '虫鸣归元境',
    goldenTools: '点石成金锄',
    butterflyWings: '化蝶御风术',
    fertileGround: '肥田厚土诀',
    pinwheel: '兜风引气轮',
    pileOfPlants: '聚灵腐草堆',
    compostBin: '乾坤埋壤阵',
    mysticGround: '玄仑秘境土',
    fertilizerBag: '纳肥流云袋',
    bigCrate: '贮物·大灵匣',
    artificialWebs: '结网缠灵术',
    studyInsects: '研虫入道经',
    beehive: '蜂巢酿蜜阵',
    potOfSand: '聚砂演脉术',
    darkCorner: '幽角养晦诀',
    carrotCake: '聚灵草灵糕',
    flag: '万灵法旗',
    honeyJar: '玉髓蜜罐',
    wormBait: '引蛭钓灵饵',
    hayStorage: '灵草藏真仓',
    shinySoil: '流光粹壤',
    fieldBlessing: '田亩天赐福',
    bigFertilizerBag: '纳肥·大罗袋',
    smellyMud: '玄臭养灵泥',
    openSesame: '开门见山诀',
    prettyFlowerPot: '灵花玉盆',
    flowerPainting: '花灵入画术',
    plantEncyclopedia: '百灵图鉴',
    smallSeedBag: '纳种·小罗袋',
    crateOfGrain: '贮谷·大灵箱',
    crateOfFlowers: '贮芳·大灵箱',
    crateOfVegetables: '贮蔬·大灵箱',
    crateOfBerries: '贮果·大灵箱',
    ancientFlowerPot: '古符灵花盆',
    trailOfSlime: '灵蜗留痕诀',
    bucketOfSnails: '镇蜗玄木桶',
    biggerVegetables: '硕灵蔬·玄经',
    biggerBerries: '硕灵果·玄经',
    biggerGrain: '硕灵谷·玄经',
    biggerFlowers: '硕灵芳·玄经',
    moreExperience: '慧根顿悟诀',
    premiumGardenGnome: '通神·守园仙偶',
    premiumSprinkler: '漫雨·无极玄阵',
    premiumLectern: '讲道·通天玄台',
    premiumPinwheel: '兜风·太乙玄轮',
    premiumFlag: '万灵·降仙法旗'
  },

  /* ---------------- 遗物 ---------------- */
  RELIC: {
    lightningRod: '引雷木',
    goldenCarrot: '金灵参',
    goldenApple: '金灵果',
    popcorn: '爆米花',
    roseQuartz: '玫瑰灵石',
    goldenSeed: '金灵种'
  },

  /* ---------------- 解锁 ---------------- */
  UNLOCK: {
    farmFeature: '灵植',
    farmDisableEarlyGame: '解禁初古',
    farmCare: '护理',
    farmCropExp: '灵植灵悟',
    farmFertilizer: '灵肥',
    farmCareMax: '护理极致'
  },

  /* ---------------- 统计 ---------------- */
  STAT: {
    harvests: '收割次数',
    maxOvergrow: '最高丛生',
    bestPrestige: '最佳飞升',
    totalMystery: '玄机总数',
    care: '护理次数'
  },

  /* ---------------- 倍率（升级效果名） ---------------- */
  MULT: {
    farmCropGain: '灵植产出',
    farmAllGain: '总产出',
    farmGrow: '成长速度',
    farmOvergrow: '丛生',
    farmGoldChance: '金穗几率',
    farmExperience: '灵悟',
    farmRareDropChance: '奇遇几率',
    farmHuntChance: '猎珍几率',
    farmMaximumCare: '最高护理',
    farmMaxCare: '最高护理',
    farmCareWeight: '护理权重',
    farmLuckyHarvestMult: '鸿运产出',
    currencyFarmVegetableGain: '灵蔬产出',
    currencyFarmBerryGain: '灵果产出',
    currencyFarmGrainGain: '灵谷产出',
    currencyFarmFlowerGain: '灵芳产出',
    currencyFarmRainwaterGain: '灵雨产出',
    currencyFarmVegetableCap: '灵蔬上限',
    currencyFarmBerryCap: '灵果上限',
    currencyFarmGrainCap: '灵谷上限',
    currencyFarmFlowerCap: '灵芳上限',
    currencyFarmRainwaterCap: '灵雨上限',
    currencyFarmSeedHullCap: '种壳上限',
    currencyFarmGrassCap: '灵草上限',
    currencyFarmPetalCap: '灵瓣上限',
    currencyFarmBugCap: '灵虫上限',
    currencyFarmButterflyCap: '灵蝶上限',
    currencyFarmLadybugCap: '灵瓢上限',
    currencyFarmSpiderCap: '灵蛛上限',
    currencyFarmBeeCap: '灵蜂上限',
    currencyFarmSnailCap: '灵蜗上限',
    currencyFarmSmallSeedCap: '小灵种上限',
    currencyFarmMixedSeedsCap: '混元灵种上限',
    currencyFarmCactusSeedCap: '荆魂灵种上限',
    currencyFarmOldRootCap: '古根上限',
    farmTiles: '灵田格'
  }
};