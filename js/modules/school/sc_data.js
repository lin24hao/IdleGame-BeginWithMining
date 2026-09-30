/* ============================================================
 * sc_data.js —— 「藏经阁（school）」模块数据定义
 *
 * 数值完全照抄 gooboo school.js + bookMining/Village/Horde/Farm/Gallery
 *   + relic.js(notebook) + upgradePremium.js(student)，仅修仙化改名。
 * SC_MODULE 兼容 sc_core.js 的 SC_RT.init 加载逻辑。
 * 附录常量表：
 *   SCHOOL_BOOK_BASE_GAIN = 10   （每门学科提供 10 藏经位置）
 *   SCHOOL_STUDY_TIME     = 40   （研习限时，秒）
 *   SCHOOL_EXAM_TIME      = 75   （考试限时，秒）
 *   SCHOOL_EXAM_DUST_MIN  = 600  （考试基础金尘）
 *   SCHOOL_EXAM_PASS_PRICE= 20   （每张考签所需蓝宝石）
 *   SECONDS_PER_DAY       = 86400
 * ============================================================ */
const SCHOOL_BOOK_BASE_GAIN = 10;
const SCHOOL_STUDY_TIME = 40;
const SCHOOL_EXAM_TIME = 75;
const SCHOOL_EXAM_DUST_MIN = 600;
const SCHOOL_EXAM_PASS_PRICE = 20;
// 对应 gooboo constants.js 的 SECONDS_PER_DAY，刻意改用唯一前缀避免与
// lm_data 的全局 `const SECONDS_PER_DAY` 在跨 `<script>` 场景下重名报错。
const SC_SECONDS_PER_DAY = 86400;

/* ================= 五类书籍（gooboo book*.js 原样，仅注释中文化） ================= */
const SC_BOOKS = {
  /* ---- 灵脉（mining）。subfeature 0/1 与已移植灵脉一致 ---- */
  mining: {
    damage: { subfeature: 0, scalesWithGL: true, minGL: 25, effect: [
      { name: 'miningDamage', type: 'mult', value: lvl => Math.pow(1.01, lvl) }
    ]},
    oreAluminiumCap: { subfeature: 0, scalesWithGL: true, minGL: 40, maxGL: 139, effect: [
      { name: 'currencyMiningOreAluminiumCap', type: 'base', value: lvl => lvl * 8 }
    ]},
    oreGain: { subfeature: 0, scalesWithGL: true, minGL: 50, maxGL: 249, effect: [
      { name: 'miningOreGain', type: 'mult', value: lvl => lvl * 0.01 + 1 }
    ]},
    oreCopperCap: { subfeature: 0, scalesWithGL: true, minGL: 55, maxGL: 154, effect: [
      { name: 'currencyMiningOreCopperCap', type: 'base', value: lvl => lvl * 4 }
    ]},
    scrapGain: { subfeature: 0, scalesWithGL: true, minGL: 75, effect: [
      { name: 'currencyMiningScrapGain', type: 'mult', value: lvl => Math.pow(1.01, lvl) }
    ]},
    oreTinCap: { subfeature: 0, scalesWithGL: true, minGL: 75, maxGL: 174, effect: [
      { name: 'currencyMiningOreTinCap', type: 'base', value: lvl => lvl * 3 }
    ]},
    scrapCap: { subfeature: 0, scalesWithGL: true, minGL: 100, effect: [
      { name: 'currencyMiningScrapCap', type: 'mult', value: lvl => Math.pow(1.01, lvl) }
    ]},
    oreIronCap: { subfeature: 0, scalesWithGL: true, minGL: 105, maxGL: 204, effect: [
      { name: 'currencyMiningOreIronCap', type: 'base', value: lvl => lvl * 2 }
    ]},
    oreTitaniumCap: { subfeature: 0, scalesWithGL: true, minGL: 145, maxGL: 244, effect: [
      { name: 'currencyMiningOreTitaniumCap', type: 'base', value: lvl => lvl }
    ]},
    emberCap: { subfeature: 0, alwaysActive: true, scalesWithGL: true, minGL: 160, effect: [
      { name: 'currencyMiningEmberCap', type: 'base', value: lvl => lvl * 2 }
    ]},
    corrosiveFumesUncap: { subfeature: 0, minGL: 175, raiseOtherCap: 'mining_corrosiveFumes', effect: [
      { name: 'mining_corrosiveFumes', type: 'uncapUpgrade', value: lvl => lvl >= 1 }
    ]},
    orePlatinumCap: { subfeature: 0, scalesWithGL: true, minGL: 200, maxGL: 299, effect: [
      { name: 'currencyMiningOrePlatinumCap', type: 'base', value: lvl => lvl }
    ]},
    oreIridiumCap: { subfeature: 0, scalesWithGL: true, minGL: 285, maxGL: 384, effect: [
      { name: 'currencyMiningOreIridiumCap', type: 'base', value: lvl => lvl }
    ]},
    oreOsmiumCap: { subfeature: 0, scalesWithGL: true, minGL: 375, maxGL: 474, effect: [
      { name: 'currencyMiningOreOsmiumCap', type: 'base', value: lvl => lvl }
    ]},
    oreLeadCap: { subfeature: 0, scalesWithGL: true, minGL: 475, maxGL: 574, effect: [
      { name: 'currencyMiningOreLeadCap', type: 'base', value: lvl => lvl }
    ]},
    damage2: { subfeature: 1, scalesWithGL: true, minGL: 25, effect: [
      { name: 'miningDamage', type: 'mult', value: lvl => Math.pow(1.01, lvl) }
    ]},
    scrapCap2: { subfeature: 1, scalesWithGL: true, minGL: 50, effect: [
      { name: 'currencyMiningScrapCap', type: 'mult', value: lvl => Math.pow(1.01, lvl) }
    ]},
    smokeCap: { subfeature: 1, scalesWithGL: true, minGL: 75, maxGL: 174, effect: [
      { name: 'currencyMiningSmokeCap', type: 'mult', value: lvl => lvl * 0.01 + 1 }
    ]},
    scrapGain2: { subfeature: 1, scalesWithGL: true, minGL: 100, effect: [
      { name: 'currencyMiningScrapGain', type: 'mult', value: lvl => Math.pow(1.01, lvl) }
    ]},
    smokeGain: { subfeature: 1, scalesWithGL: true, minGL: 125, maxGL: 224, effect: [
      { name: 'currencyMiningSmokeGain', type: 'mult', value: lvl => lvl * 0.01 + 1 }
    ]}
  },

  /* ---- 宗门（village） ---- */
  village: {
    coinCap: { subfeature: 0, scalesWithGL: true, minGL: 25, maxGL: 124, effect: [
      { name: 'currencyVillageCoinCap', type: 'base', value: lvl => lvl * 50 }
    ]},
    plantFiberCap: { subfeature: 0, scalesWithGL: true, minGL: 40, maxGL: 139, effect: [
      { name: 'currencyVillagePlantFiberCap', type: 'mult', value: lvl => lvl * 0.02 + 1 }
    ]},
    woodCap: { subfeature: 0, scalesWithGL: true, minGL: 40, maxGL: 139, effect: [
      { name: 'currencyVillageWoodCap', type: 'mult', value: lvl => lvl * 0.02 + 1 }
    ]},
    stoneCap: { subfeature: 0, scalesWithGL: true, minGL: 40, maxGL: 139, effect: [
      { name: 'currencyVillageStoneCap', type: 'mult', value: lvl => lvl * 0.02 + 1 }
    ]},
    metalCap: { subfeature: 0, scalesWithGL: true, minGL: 50, maxGL: 149, effect: [
      { name: 'currencyVillageMetalCap', type: 'mult', value: lvl => lvl * 0.02 + 1 }
    ]},
    taxRate: { subfeature: 0, scalesWithGL: true, minGL: 60, maxGL: 109, effect: [
      { name: 'villageTaxRate', type: 'base', value: lvl => lvl * 0.004 }
    ]},
    waterCap: { subfeature: 0, scalesWithGL: true, minGL: 80, maxGL: 179, effect: [
      { name: 'currencyVillageWaterCap', type: 'mult', value: lvl => lvl * 0.04 + 1 }
    ]},
    glassCap: { subfeature: 0, scalesWithGL: true, minGL: 90, maxGL: 189, effect: [
      { name: 'currencyVillageGlassCap', type: 'mult', value: lvl => lvl * 0.01 + 1 }
    ]},
    knowledgeCap: { subfeature: 0, scalesWithGL: true, minGL: 100, effect: [
      { name: 'currencyVillageKnowledgeCap', type: 'base', value: lvl => lvl }
    ]},
    hardwoodCap: { subfeature: 0, scalesWithGL: true, minGL: 150, maxGL: 249, effect: [
      { name: 'currencyVillageHardwoodCap', type: 'mult', value: lvl => lvl * 0.01 + 1 }
    ]},
    gemCap: { subfeature: 0, scalesWithGL: true, minGL: 150, maxGL: 249, effect: [
      { name: 'currencyVillageGemCap', type: 'mult', value: lvl => lvl * 0.01 + 1 }
    ]},
    plantFiberCap2: { subfeature: 1, scalesWithGL: true, minGL: 20, maxGL: 119, effect: [
      { name: 'currencyVillagePlantFiberCap', type: 'base', value: lvl => lvl * 30 }
    ]},
    woodCap2: { subfeature: 1, scalesWithGL: true, minGL: 25, maxGL: 124, effect: [
      { name: 'currencyVillageWoodCap', type: 'base', value: lvl => lvl * 30 }
    ]},
    stoneCap2: { subfeature: 1, scalesWithGL: true, minGL: 30, maxGL: 129, effect: [
      { name: 'currencyVillageStoneCap', type: 'base', value: lvl => lvl * 30 }
    ]},
    metalCap2: { subfeature: 1, scalesWithGL: true, minGL: 40, maxGL: 139, effect: [
      { name: 'currencyVillageMetalCap', type: 'base', value: lvl => lvl * 15 }
    ]},
    waterCap2: { subfeature: 1, scalesWithGL: true, minGL: 60, maxGL: 159, effect: [
      { name: 'currencyVillageWaterCap', type: 'base', value: lvl => lvl * 15 }
    ]},
    glassCap2: { subfeature: 1, scalesWithGL: true, minGL: 80, maxGL: 179, effect: [
      { name: 'currencyVillageGlassCap', type: 'base', value: lvl => lvl * 15 }
    ]},
    hardwoodCap2: { subfeature: 1, scalesWithGL: true, minGL: 110, maxGL: 209, effect: [
      { name: 'currencyVillageHardwoodCap', type: 'base', value: lvl => lvl * 15 }
    ]},
    gemCap2: { subfeature: 1, scalesWithGL: true, minGL: 140, maxGL: 239, effect: [
      { name: 'currencyVillageGemCap', type: 'base', value: lvl => lvl * 15 }
    ]}
  },

  /* ---- 降妖（horde） ---- */
  horde: {
    attack: { subfeature: 0, scalesWithGL: true, minGL: 25, effect: [
      { name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.01, lvl) }
    ]},
    health: { subfeature: 0, scalesWithGL: true, minGL: 25, effect: [
      { name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.01, lvl) }
    ]},
    boneGain: { subfeature: 0, scalesWithGL: true, minGL: 40, maxGL: 139, effect: [
      { name: 'currencyHordeBoneGain', type: 'mult', value: lvl => lvl * 0.01 + 1 }
    ]},
    boneCap: { subfeature: 0, scalesWithGL: true, minGL: 50, effect: [
      { name: 'currencyHordeBoneCap', type: 'mult', value: lvl => Math.pow(1.015, lvl) }
    ]},
    itemChance: { subfeature: 0, scalesWithGL: true, minGL: 60, maxGL: 159, effect: [
      { name: 'hordeEquipmentChance', type: 'mult', value: lvl => lvl * 0.01 + 1 }
    ]},
    monsterPartCap: { subfeature: 0, scalesWithGL: true, minGL: 80, maxGL: 179, effect: [
      { name: 'currencyHordeMonsterPartCap', type: 'mult', value: lvl => lvl * 0.01 + 1 }
    ]},
    corruptedFleshGain: { subfeature: 0, scalesWithGL: true, minGL: 120, maxGL: 219, effect: [
      { name: 'currencyHordeCorruptedFleshGain', type: 'mult', value: lvl => lvl * 0.01 + 1 }
    ]},
    shardChance: { subfeature: 0, scalesWithGL: true, minGL: 150, maxGL: 249, effect: [
      { name: 'hordeShardChance', type: 'mult', value: lvl => lvl * 0.01 + 1 }
    ]},
    attack2: { subfeature: 1, scalesWithGL: true, minGL: 10, effect: [
      { name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.01, lvl) }
    ]},
    health2: { subfeature: 1, scalesWithGL: true, minGL: 10, effect: [
      { name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.01, lvl) }
    ]},
    bloodGain: { subfeature: 1, scalesWithGL: true, minGL: 20, maxGL: 119, effect: [
      { name: 'currencyHordeBloodGain', type: 'mult', value: lvl => lvl * 0.02 + 1 }
    ]},
    bloodCap: { subfeature: 1, scalesWithGL: true, minGL: 30, maxGL: 129, effect: [
      { name: 'currencyHordeBloodCap', type: 'mult', value: lvl => lvl * 0.02 + 1 }
    ]}
  },

  /* ---- 灵植园（farm） ---- */
  farm: {
    vegetableGain: { subfeature: 0, scalesWithGL: true, minGL: 10, effect: [
      { name: 'currencyFarmVegetableGain', type: 'mult', value: lvl => Math.pow(1.005, lvl) }
    ]},
    berryGain: { subfeature: 0, scalesWithGL: true, minGL: 10, effect: [
      { name: 'currencyFarmBerryGain', type: 'mult', value: lvl => Math.pow(1.005, lvl) }
    ]},
    grainGain: { subfeature: 0, scalesWithGL: true, minGL: 10, effect: [
      { name: 'currencyFarmGrainGain', type: 'mult', value: lvl => Math.pow(1.005, lvl) }
    ]},
    flowerGain: { subfeature: 0, scalesWithGL: true, minGL: 10, effect: [
      { name: 'currencyFarmFlowerGain', type: 'mult', value: lvl => Math.pow(1.005, lvl) }
    ]},
    grassCap: { subfeature: 0, scalesWithGL: true, minGL: 30, maxGL: 129, effect: [
      { name: 'currencyFarmGrassCap', type: 'base', value: lvl => lvl * 6 }
    ]},
    seedHullCap: { subfeature: 0, scalesWithGL: true, minGL: 60, maxGL: 159, effect: [
      { name: 'currencyFarmSeedHullCap', type: 'base', value: lvl => lvl * 6 }
    ]},
    bugCap: { subfeature: 0, scalesWithGL: true, minGL: 80, maxGL: 179, effect: [
      { name: 'currencyFarmBugCap', type: 'base', value: lvl => lvl * 3 }
    ]},
    petalCap: { subfeature: 0, scalesWithGL: true, minGL: 100, maxGL: 199, effect: [
      { name: 'currencyFarmPetalCap', type: 'base', value: lvl => lvl * 2 }
    ]},
    butterflyCap: { subfeature: 0, scalesWithGL: true, minGL: 140, maxGL: 238, effect: [
      { name: 'currencyFarmButterflyCap', type: 'base', value: lvl => Math.ceil(lvl / 2) }
    ]},
    ladybugCap: { subfeature: 0, scalesWithGL: true, minGL: 180, maxGL: 279, effect: [
      { name: 'currencyFarmLadybugCap', type: 'base', value: lvl => lvl * 3 }
    ]},
    spiderCap: { subfeature: 0, scalesWithGL: true, minGL: 220, maxGL: 315, effect: [
      { name: 'currencyFarmSpiderCap', type: 'base', value: lvl => Math.ceil(lvl / 5) }
    ]},
    beeCap: { subfeature: 0, scalesWithGL: true, minGL: 260, maxGL: 359, effect: [
      { name: 'currencyFarmBeeCap', type: 'base', value: lvl => lvl * 10 }
    ]},
    smallSeedCap: { subfeature: 0, scalesWithGL: true, minGL: 320, maxGL: 419, effect: [
      { name: 'currencyFarmSmallSeedCap', type: 'base', value: lvl => lvl * 8 }
    ]}
  },

  /* ---- 藏宝阁（gallery，未移植 → 书籍可读但效果无桥接目标，静默） ---- */
  gallery: {
    redGain: { subfeature: 0, scalesWithGL: true, minGL: 20, maxGL: 119, effect: [
      { name: 'currencyGalleryRedGain', type: 'mult', value: lvl => lvl * 0.02 + 1 }
    ]},
    converterCap: { subfeature: 0, scalesWithGL: true, minGL: 40, maxGL: 139, effect: [
      { name: 'currencyGalleryConverterCap', type: 'base', value: lvl => lvl * 20 }
    ]},
    shapeGain: { subfeature: 0, scalesWithGL: true, minGL: 60, effect: [
      { name: 'galleryShapeGain', type: 'mult', value: lvl => Math.pow(1.01, lvl) }
    ]},
    packageCap: { subfeature: 0, scalesWithGL: true, minGL: 80, maxGL: 178, effect: [
      { name: 'currencyGalleryPackageCap', type: 'base', value: lvl => Math.ceil(lvl / 2) }
    ]},
    drumCap: { subfeature: 0, scalesWithGL: true, minGL: 100, maxGL: 190, effect: [
      { name: 'galleryColorDrumCap', type: 'base', value: lvl => Math.ceil(lvl / 10) }
    ]},
    canvasSpeed: { subfeature: 0, scalesWithGL: true, minGL: 120, maxGL: 219, effect: [
      { name: 'galleryCanvasSpeed', type: 'mult', value: lvl => lvl * 0.01 + 1 }
    ]}
  }
};

/* ================= 遗物（gooboo relic.js ∈ notebook） ================= */
const SC_RELICS = {
  /* 乾坤手札（notebook）：金尘上限 +2000，附「激活」双重考签转化 */
  notebook: { icon: 'mdi-notebook', color: 'green', effect() { return [
    { name: 'currencySchoolGoldenDustCap', type: 'base', value: 2000 }
  ]; }, glyph() { return { book: 3 }; }, active: {
    cost: { relic_power: 3 },
    params() { return [1000, 5000]; },
    description(params, option) { return [formatInt(params[option ? 1 : 0])]; },
    formula(params) { return [formatInt(params[0]), formatInt(params[1])]; },
    disabled(params, option) { return option && SC_CUR.value('school_examPass') < 1; },
    trigger(params, option) {
      if (option) {
        if (SC_CUR.value('school_examPass') >= 1) {
          SCTORE.dispatch('currency/spend', { feature: 'school', name: 'examPass', amount: 1 }, { root: true });
          SCTORE.dispatch('currency/gain', { feature: 'school', name: 'goldenDust', amount: Math.round(SCHOOL_EXAM_DUST_MIN * SC_RT.getters['dustMult']) }, { root: true });
          SCTORE.commit('stat/add', { feature: 'school', name: 'totalPoints', value: params[1] }, { root: true });
        }
      } else {
        SCTORE.commit('stat/add', { feature: 'school', name: 'totalPoints', value: params[0] }, { root: true });
      }
    }
  } }
};

/* ================= 氪金升级（gooboo upgradePremium.js ∈ student->藏经弟子） ================= */
const SC_UPGRADES = {
  student: { type: 'premium', price(lvl) {
    return { gem_ruby: fallbackArray([5, 20, 60, 125], [4, 5, 6, 7][lvl % 4] * Math.pow(2, Math.floor(lvl / 4)) * 25, lvl) };
  }, effect: [
    { name: 'schoolBook', type: 'base', value: lvl => lvl }
  ] }
};

/* ================= SC_MODULE：对接 sc_core.js ================= */
const SC_MODULE = {
  name: 'school',
  tickspeed: 1,
  unlockNeeded: 'schoolFeature',
  unlock: ['schoolFeature', 'schoolLiteratureSubfeature', 'schoolHistorySubfeature', 'schoolArtSubfeature', 'schoolChemistrySubfeature', 'schoolLibrarySubfeature'],
  stat: {
    highestGrade: { display: 'grade' },
    totalPoints: { display: 'int' }
  },
  mult: {
    schoolBook: { round: true },
    schoolMultipass: { round: true, baseValue: 1 }
  },
  currency: {
    goldenDust: { color: 'amber', icon: 'mdi-timer-sand', display: 'int', overcapMult: 0, overcapFunction(amount) {
      SCTORE.commit('school/updateKey', { key: 'bonusDust', value: (SC_RT.state.bonusDust || 0) + amount });
    }, capMult: { baseValue: 8000 } },
    examPass: { color: 'pale-blue', icon: 'mdi-ticket-account', display: 'int' }
  },
  /* 外部四类宝石（考签/跳书/藏经弟子），feature 'gem' */
  gems: {
    sapphire: { color: 'light-blue', display: 'int' },
    emerald: { color: 'green', display: 'int' },
    ruby: { color: 'red', display: 'int' }
  },
  upgrade: SC_UPGRADES,
  relic: SC_RELICS,

  /* 每日考签 / 金尘溢出转移（gooboo school.js tick） */
  tick(seconds, oldTime, newTime) {
    const dayDiff = Math.floor(newTime / SC_SECONDS_PER_DAY) - Math.floor(oldTime / SC_SECONDS_PER_DAY);
    if (dayDiff > 0) {
      SCTORE.dispatch('currency/gain', { feature: 'school', name: 'examPass', amount: dayDiff });
    }
    if (SC_RT.state.bonusDust > 0 && SC_CUR.value('school_goldenDust') < SC_CUR.cap('school_goldenDust')) {
      const amount = Math.min(seconds, SC_RT.state.bonusDust, SC_CUR.cap('school_goldenDust') - SC_CUR.value('school_goldenDust'));
      SCTORE.commit('school/updateKey', { key: 'bonusDust', value: SC_RT.state.bonusDust - amount });
      SCTORE.dispatch('currency/gain', { feature: 'school', name: 'goldenDust', amount });
    }
  },

  /* 五学科 + 五类书籍初始化 */
  init() {
    for (const [key, elem] of Object.entries({
      math: { scoreGoal: 5 },
      literature: { unlock: 'schoolLiteratureSubfeature', scoreGoal: 8 },
      history: { unlock: 'schoolHistorySubfeature', scoreGoal: 8 },
      art: { unlock: 'schoolArtSubfeature', scoreGoal: 10 },
      chemistry: { unlock: 'schoolChemistrySubfeature', scoreGoal: 100 }
    })) {
      SCTORE.commit('school/initSubject', { name: key, ...elem });
    }
    for (const [feature, items] of Object.entries(SC_BOOKS)) {
      for (const [key, elem] of Object.entries(items)) {
        SCTORE.commit('school/initBook', { name: key, feature, ...elem });
      }
    }
  },

  saveGame() {
    const state = SC_RT.state;
    let obj = { subject: {} };
    for (const [key, elem] of Object.entries(state.subject || {})) {
      if (elem.grade > 0 || elem.progress > 0 || elem.pointsTotal > 0 || elem.booksSkipped > 0) {
        obj.subject[key] = [elem.grade, elem.currentGrade, elem.progress, elem.pointsTotal];
        if (elem.booksSkipped > 0) obj.subject[key].push(elem.booksSkipped);
      }
    }
    for (const [key, elem] of Object.entries(state.book || {})) {
      if (elem.owned) {
        if (obj.books === undefined) obj.books = [];
        obj.books.push(key);
      }
    }
    if (state.bonusDust > 0) obj.bonusDust = state.bonusDust;
    if (state.multipass > 1) obj.multipass = state.multipass;
    // 附带外部宝石余额（蓝宝/翡翠/红宝）
    const gems = {};
    ['gem_sapphire', 'gem_emerald', 'gem_ruby'].forEach(k => {
      const v = SC_CUR.value(k);
      if (v > 0) gems[k.replace('gem_', '')] = v;
    });
    if (Object.keys(gems).length) obj.gems = gems;
    return obj;
  },

  loadGame(data) {
    const state = SC_RT.state;
    if (data.subject) {
      for (const [key, elem] of Object.entries(data.subject)) {
        if (state.subject[key] !== undefined) {
          SCTORE.commit('school/updateSubjectKey', { name: key, key: 'grade', value: elem[0] });
          SCTORE.commit('school/updateSubjectKey', { name: key, key: 'currentGrade', value: elem[1] });
          SCTORE.commit('school/updateSubjectKey', { name: key, key: 'progress', value: elem[2] });
          SCTORE.commit('school/updateSubjectKey', { name: key, key: 'pointsTotal', value: elem[3] });
          if (elem.length > 4) SCTORE.commit('school/updateSubjectKey', { name: key, key: 'booksSkipped', value: elem[4] });
          SCTORE.dispatch('school/applySubjectBooks', key);
        }
      }
    }
    if (data.books) {
      data.books.forEach(elem => { SCTORE.commit('school/updateBookKey', { name: elem, key: 'owned', value: true }); });
      SCTORE.dispatch('school/updateBookEffects');
    }
    if (data.bonusDust) SCTORE.commit('school/updateKey', { key: 'bonusDust', value: data.bonusDust });
    if (data.multipass) SCTORE.commit('school/updateKey', { key: 'multipass', value: data.multipass });
    if (data.gems) {
      for (const [k, v] of Object.entries(data.gems)) {
        SC_CUR.values['gem_' + k] = v;
      }
    }
  }
};
if (typeof module !== "undefined") { module.exports = { SC_MODULE, SC_BOOKS, SC_RELICS, SC_UPGRADES, SCHOOL_BOOK_BASE_GAIN, SCHOOL_STUDY_TIME, SCHOOL_EXAM_TIME, SCHOOL_EXAM_DUST_MIN, SCHOOL_EXAM_PASS_PRICE, SC_SECONDS_PER_DAY }; }