/* ============================================================
 * lm_data.js —— 「灵脉/修炼」模块数值数据层（自动生成，勿手改）
 *
 * 数据来源（逐项照抄，未修改任何数值）：
 *   G:\DownLoad\gooboo-main\gooboo-main\src\js\modules\mining.js
 *   G:\DownLoad\gooboo-main\gooboo-main\src\js\modules\mining\ore.js
 *   G:\DownLoad\gooboo-main\gooboo-main\src\js\modules\mining\smeltery.js
 *   G:\DownLoad\gooboo-main\gooboo-main\src\js\modules\mining\upgrade.js
 *   G:\DownLoad\gooboo-main\gooboo-main\src\js\modules\mining\upgrade2.js
 *   G:\DownLoad\gooboo-main\gooboo-main\src\js\modules\mining\upgradePremium.js
 *   G:\DownLoad\gooboo-main\gooboo-main\src\js\modules\mining\upgradePrestige.js
 *   G:\DownLoad\gooboo-main\gooboo-main\src\js\constants.js（LM_* / SECONDS_PER_* 常量）
 *
 * 生成方式：剥离 import/export 后原样搬运，标识符仅做 LM_ -> LM_ 前缀改写，
 *          字符串形式的资源名（mining_xxx / miningXxx）保持不变，由运行时的
 *          归一化函数统一映射到 lm 前缀，避免改动数值定义本身。
 * ============================================================ */

/* ===== gooboo constants.js 中的相关常量（照抄） ===== */
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;
const SECONDS_PER_YEAR = 31557600;
const LM_SCRAP_BREAK = 4;
const LM_ORE_BREAK = 1;
const LM_RARE_DROP_BREAK = 1;
const LM_SMOKE_BREAK = 1;
const LM_CRAFTING_COMPRESSION = 5;
const LM_GRANITE_DEPTH = 50;
const LM_SALT_DEPTH = 70;
const LM_COAL_DEPTH = 90;
const LM_SULFUR_DEPTH = 110;
const LM_NITER_DEPTH = 130;
const LM_OBSIDIAN_DEPTH = 150;
const LM_DEEPROCK_DEPTH = 275;
const LM_GLOWSHARD_DEPTH = 9999;//400;
const LM_MOONSHARD_DEPTH = 20;
const LM_PHOSPHORUS_DEPTH = 150;
const LM_SMELTERY_TEMPERATURE_SPEED = 0.004;
const LM_SMELTERY_TIME_INCREMENT = 1.045;
const LM_SMELTERY_ORE_INCREMENT = 1.04;
const LM_ENHANCEMENT_BARS = 10;
const LM_ENHANCEMENT_INCREMENT = 5;
const LM_ENHANCEMENT_MAX = 10;
const LM_OBSIDIAN_PENALTY_BASE = 0.5;
const LM_OBSIDIAN_PENALTY_INCREMENT = 0.85;
const LM_DWELLER_OVERCAP_MULT = 0.9;
const LM_DWELLER_OVERFLOW = 5;

/* ===== ore.js（灵矿定义，照抄） ===== */
const ore = {
  oreAluminium: {
        power: 15,
        impurity: 1.5,
        minDepth: 15,
        maxDepth: 45,
        modulo: 3,
        baseAmount: 0.02,
        amountMult: 1.05
    },
  oreCopper: {
        power: 50,
        impurity: 2,
        minDepth: 30,
        maxDepth: 68,
        modulo: 4,
        baseAmount: 0.004,
        amountMult: 1.05
    },
  oreTin: {
        power: 240,
        impurity: 2.5,
        minDepth: 50,
        maxDepth: 100,
        modulo: 5,
        baseAmount: 0.0008,
        amountMult: 1.05
    },
  oreIron: {
        power: 1300,
        impurity: 3,
        minDepth: 80,
        maxDepth: 140,
        modulo: 7,
        baseAmount: 0.00016,
        amountMult: 1.05
    },
  oreTitanium: {
        power: 7000,
        impurity: 3.5,
        minDepth: 120,
        maxDepth: 200,
        modulo: 11,
        baseAmount: 0.000032,
        amountMult: 1.05
    },
  orePlatinum: {
        power: buildNum(40, 'K'),
        impurity: 4,
        minDepth: 175,
        maxDepth: 295,
        modulo: 13,
        baseAmount: 0.0000064,
        amountMult: 1.05
    },
  oreIridium: {
        power: buildNum(250, 'K'),
        impurity: 5,
        minDepth: 260,
        maxDepth: 420,
        modulo: 17,
        baseAmount: 0.00000128,
        amountMult: 1.05
    },
  oreOsmium: {
        power: buildNum(1.75, 'M'),
        impurity: 6,
        minDepth: 350,
        maxDepth: 525,
        modulo: 23,
        baseAmount: 0.000000256,
        amountMult: 1.05
    },
  oreLead: {
        power: buildNum(12.5, 'M'),
        impurity: 7.5,
        minDepth: 450,
        maxDepth: 650,
        modulo: 29,
        baseAmount: 0.0000000512,
        amountMult: 1.05
    },
};

/* ===== smeltery.js（炼化炉配方，照抄） ===== */
const smeltery = {
  aluminium: {
        price(lvl) {
            return {
                lm_oreAluminium: Math.pow(LM_SMELTERY_ORE_INCREMENT, lvl) * 1000,
                lm_granite: Math.pow(1.1, lvl) * 7500,
            };
        },
        output: 'lm_barAluminium',
        timeNeeded: 300,
        minTemperature: 100
    },
  bronze: {
        price(lvl) {
            return {
                lm_oreCopper: Math.pow(LM_SMELTERY_ORE_INCREMENT, lvl) * 900,
                lm_oreTin: Math.pow(LM_SMELTERY_ORE_INCREMENT, lvl) * 100,
                lm_salt: Math.pow(1.06, lvl) * 800,
            };
        },
        output: 'lm_barBronze',
        timeNeeded: SECONDS_PER_HOUR,
        minTemperature: 275
    },
  steel: {
        price(lvl) {
            return {
                lm_oreIron: Math.pow(LM_SMELTERY_ORE_INCREMENT, lvl) * 1000,
                lm_coal: 5,
            };
        },
        output: 'lm_barSteel',
        timeNeeded: 8 * SECONDS_PER_HOUR,
        minTemperature: 500
    },
  titanium: {
        price(lvl) {
            return {
                lm_oreTitanium: Math.pow(LM_SMELTERY_ORE_INCREMENT, lvl) * 1000,
                lm_sulfur: Math.pow(1.06, lvl) * 200,
                lm_niter: 100,
            };
        },
        output: 'lm_barTitanium',
        timeNeeded: 3 * SECONDS_PER_DAY,
        minTemperature: 800
    },
  shiny: {
        price(lvl) {
            return {
                lm_orePlatinum: Math.pow(LM_SMELTERY_ORE_INCREMENT, lvl) * 1000,
                lm_obsidian: Math.pow(1.1, lvl) * 2e6,
            };
        },
        output: 'lm_barShiny',
        timeNeeded: 30 * SECONDS_PER_DAY,
        minTemperature: 1250
    },
  iridium: {
        price(lvl) {
            return {
                lm_oreIridium: Math.pow(LM_SMELTERY_ORE_INCREMENT, lvl) * 1000,
                lm_helium: Math.pow(1.1, lvl) * 1e4,
            };
        },
        output: 'lm_barIridium',
        timeNeeded: SECONDS_PER_YEAR,
        minTemperature: 2000
    },
  darkIron: {
        price(lvl) {
            return {
                lm_oreIron: Math.pow(LM_SMELTERY_ORE_INCREMENT, lvl) * 1e7,
                lm_oreOsmium: Math.pow(LM_SMELTERY_ORE_INCREMENT, lvl) * 1000,
                lm_deeprock: Math.pow(1.1, lvl) * 1e8,
                lm_neon: Math.pow(1.1, lvl) * 1e4,
            };
        },
        output: 'lm_barDarkIron',
        timeNeeded: 15 * SECONDS_PER_YEAR,
        minTemperature: 3000
    },
};

/* ===== upgrade 系列（升级项定义，照抄） ===== */
const requirementStat_upgrade = 'lm_maxDepth0'

const requirementBase_upgrade = () => LM_RT && LM_RT.lmState && LM_RT.lmState.stat && LM_RT.lmState.stat[requirementStat_upgrade] ? (LM_RT.lmState.stat[requirementStat_upgrade].total || 0) : 0

const upgrade = {
  damageUp: {price(lvl) {
        return {lm_scrap: Math.pow(lvl * 0.012 + 1.24, lvl) * 120};
    }, effect: [
        {name: 'lmDamage', type: 'mult', value: lvl => Math.pow(1.12, lvl) * Math.pow(lvl * 0.2 + 1, 2)}
    ]},
  scrapGainUp: {requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 5, price(lvl) {
        return {lm_scrap: Math.pow(lvl * 0.1 + 2.5, lvl) * 1250};
    }, effect: [
        {name: 'currencyLmScrapGain', type: 'mult', value: lvl => Math.pow(1.2, lvl)}
    ]},
  scrapCapacityUp: {cap: 50, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 10, price(lvl) {
        return {lm_scrap: Math.pow(3.3, lvl) * 3000};
    }, effect: [
        {name: 'currencyLmScrapCap', type: 'mult', value: lvl => Math.pow(3, lvl)}
    ]},
  aluminiumCache: {cap: 10, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 15, price(lvl) {
        return {lm_oreAluminium: Math.round(3 * (lvl + 1))};
    }, effect: [
        {name: 'currencyLmScrapCap', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
        {name: 'currencyLmOreAluminiumCap', type: 'base', value: lvl => 2 * lvl}
    ]},
  aluminiumHardening: {cap: 6, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 15, price(lvl) {
        return {lm_oreAluminium: 4 * lvl + 2};
    }, effect: [
        {name: 'lmDamage', type: 'mult', value: lvl => (lvl + 1) * Math.pow(1.5, Math.min(6, lvl))}
    ]},
  craftingStation: {cap: 1, hasDescription: true, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 20, price() {
        return {lm_scrap: 1.8e6};
    }, effect: [
        {name: 'lmPickaxeCrafting', type: 'unlock', value: lvl => lvl >= 1}
    ]},
  forge: {requirement() {
        return store.state.unlock.lmPickaxeCrafting.use;
    }, price(lvl) {
        return {lm_scrap: Math.pow(1.35, lvl) * 2.5e6};
    }, effect: [
        {name: 'lmPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.2, lvl)}
    ]},
  oreSlots: {cap: 10, hideCap: true, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 25, requirement(lvl) {
        return store.state.stat.lm_maxDepth0.total >= [25, 25, 30, 50, 80, 120, 175, 260, 350, 450][lvl];
    }, price(lvl) {
        return [
            {lm_oreAluminium: 10},
            {lm_oreAluminium: 30},
            {lm_oreCopper: 20},
            {lm_oreTin: 15},
            {lm_oreIron: 12},
            {lm_oreTitanium: 10},
            {lm_orePlatinum: 8},
            {lm_oreIridium: 6},
            {lm_oreOsmium: 5},
            {lm_oreLead: 4}
        ][lvl];
    }, effect: [
        {name: 'lmPickaxeCraftingSlots', type: 'base', value: lvl => lvl}
    ]},
  compressor: {cap: 9, hasDescription: true, hideCap: true, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 25, requirement(lvl) {
        return store.state.stat.lm_maxDepth0.total >= [25, 35, 60, 95, 140, 200, 280, 375, 480][lvl];
    }, price(lvl) {
        return [
            {lm_oreAluminium: 20},
            {lm_oreAluminium: 80},
            {lm_oreAluminium: 1e4},
            {lm_oreAluminium: 3e4},
            {lm_oreAluminium: 5e5},
            {lm_oreAluminium: 1e7},
            {lm_oreAluminium: 3e8},
            {lm_oreAluminium: 1e10},
            {lm_oreAluminium: 1e12}
        ][lvl];
    }, effect: [
        {name: 'lmCompressAluminium', type: 'unlock', value: lvl => lvl >= 1},
        {name: 'lmCompressCopper', type: 'unlock', value: lvl => lvl >= 2},
        {name: 'lmCompressTin', type: 'unlock', value: lvl => lvl >= 3},
        {name: 'lmCompressIron', type: 'unlock', value: lvl => lvl >= 4},
        {name: 'lmCompressTitanium', type: 'unlock', value: lvl => lvl >= 5},
        {name: 'lmCompressPlatinum', type: 'unlock', value: lvl => lvl >= 6},
        {name: 'lmCompressIridium', type: 'unlock', value: lvl => lvl >= 7},
        {name: 'lmCompressOsmium', type: 'unlock', value: lvl => lvl >= 8},
        {name: 'lmCompressLead', type: 'unlock', value: lvl => lvl >= 9}
    ]},
  copperCache: {cap: 8, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 30, price(lvl) {
        return {lm_oreCopper: Math.round(lvl + 3)};
    }, effect: [
        {name: 'currencyLmOreAluminiumCap', type: 'base', value: lvl => 2 * lvl},
        {name: 'currencyLmOreCopperCap', type: 'base', value: lvl => lvl}
    ]},
  aluminiumTanks: {cap: 8, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 30, price(lvl) {
        return {lm_scrap: Math.pow(4.75, lvl) * 4e7};
    }, effect: [
        {name: 'currencyLmOreAluminiumCap', type: 'base', value: lvl => Math.round(Math.pow(lvl, 1.2) * Math.pow(1.1, lvl) * 5)}
    ]},
  aluminiumAnvil: {cap: 10, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 30, price(lvl) {
        return {lm_oreAluminium: Math.ceil(Math.pow(1.1, lvl) * (lvl + 1) * 10)};
    }, effect: [
        {name: 'lmPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.15, lvl)}
    ]},
  hullbreaker: {cap: 10, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 35, price(lvl) {
        return {lm_scrap: Math.pow(1.8, lvl) * 5.5e8};
    }, effect: [
        {name: 'lmDamage', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
        {name: 'lmToughness', type: 'mult', value: lvl => Math.pow(1 / 1.3, lvl)}
    ]},
  copperTanks: {cap: 5, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 40, price(lvl) {
        return {lm_scrap: Math.pow(2.3, lvl) * 3.5e9};
    }, effect: [
        {name: 'currencyLmOreAluminiumCap', type: 'mult', value: lvl => Math.pow(1.4, lvl)},
        {name: 'currencyLmOreCopperCap', type: 'base', value: lvl => 4 * lvl}
    ]},
  depthDweller: {cap: 1, hasDescription: true, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 40, price() {
        return {lm_oreCopper: 24};
    }, effect: [
        {name: 'lmDepthDweller', type: 'unlock', value: lvl => lvl >= 1}
    ]},
  aluminiumExpansion: {cap: 5, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 45, price(lvl) {
        return {lm_oreAluminium: Math.pow(2.25, lvl) * 150};
    }, effect: [
        {name: 'lmDamage', type: 'mult', value: lvl => Math.pow(1.15, lvl)},
        {name: 'currencyLmOreAluminiumCap', type: 'mult', value: lvl => Math.pow(1.5, lvl)}
    ]},
  refinery: {cap: 5, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 45, price(lvl) {
        return {lm_oreCopper: 10 * lvl + 30};
    }, effect: [
        {name: 'lmOreGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'currencyLmOreCopperCap', type: 'base', value: lvl => 12 * lvl}
    ]},
  copperExpansion: {cap: 3, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 50, price(lvl) {
        return {lm_scrap: Math.pow(4.2, lvl) * 9e10};
    }, effect: [
        {name: 'lmDamage', type: 'mult', value: lvl => Math.pow(1.25, lvl)},
        {name: 'currencyLmOreCopperCap', type: 'mult', value: lvl => Math.pow(1.5, lvl)}
    ]},
  drillFuel: {cap: 30, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 50, price(lvl) {
        return {lm_scrap: Math.pow(lvl * 0.1 + 2.4, lvl) * 3.5e10};
    }, effect: [
        {name: 'lmDepthDwellerSpeed', type: 'mult', value: lvl => Math.pow(1.02, lvl) * (lvl * 0.05 + 1)}
    ]},
  graniteHardening: {cap: 6, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 55, price(lvl) {
        return {lm_granite: Math.pow(2.5, lvl) * 1600, lm_oreTin: lvl + 2};
    }, effect: [
        {name: 'lmDamage', type: 'mult', value: lvl => Math.pow(1.3, lvl)}
    ]},
  smeltery: {cap: 1, hasDescription: true, persistent: true, note: 'lm_18', requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 60, price() {
        return {lm_granite: 5e4};
    }, effect: [
        {name: 'lmSmeltery', type: 'unlock', value: lvl => lvl >= 1}
    ]},
  oreShelf: {cap: 4, capMult: true, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 60, price(lvl) {
        return {lm_barAluminium: 5 * Math.pow(2, Math.max(0, lvl - 3))};
    }, effect: [
        {name: 'lmOreCap', type: 'base', value: lvl => lvl}
    ]},
  heatShield: {requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 62, price(lvl) {
        return {lm_granite: Math.pow(1.55, lvl) * 2e4};
    }, effect: [
        {name: 'lmSmelteryTemperature', type: 'base', value: lvl => lvl * 15}
    ]},
  tinCache: {cap: 4, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 65, price(lvl) {
        return {lm_scrap: Math.pow(5.75, lvl) * buildNum(25, 'T'), lm_oreTin: lvl * 2 + 1};
    }, effect: [
        {name: 'currencyLmOreCopperCap', type: 'base', value: lvl => lvl * 24},
        {name: 'currencyLmOreTinCap', type: 'base', value: lvl => lvl}
    ]},
  furnace: {cap: 25, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 70, price(lvl) {
        let obj = {lm_scrap: Math.pow(1.3, lvl) * buildNum(70, 'T'), lm_oreTin: Math.floor(lvl * 0.2 * Math.pow(1.15, lvl) + 2)};
        if (lvl >= 5) {
            obj.lm_salt = Math.pow(1.45, lvl - 5) * 60;
        }
        return obj;
    }, effect: [
        {name: 'lmPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
        {name: 'lmOreGain', type: 'mult', value: lvl => lvl * 0.04 + 1}
    ]},
  bronzeCache: {cap: 4, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 75, price(lvl) {
        return {lm_salt: Math.pow(4, lvl) * 175, lm_oreAluminium: Math.pow(2.25, lvl) * 3000};
    }, effect: [
        {name: 'currencyLmOreCopperCap', type: 'mult', value: lvl => Math.pow(1.5, lvl)},
        {name: 'currencyLmOreTinCap', type: 'mult', value: lvl => Math.pow(1.5, lvl)}
    ]},
  ironCache: {cap: 5, capMult: true, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 80, price(lvl) {
        return {lm_barAluminium: 12 * Math.pow(2, Math.max(0, lvl - 4))};
    }, effect: [
        {name: 'lmOreQuality', type: 'mult', value: lvl => lvl * 0.2 + 1},
        {name: 'currencyLmOreIronCap', type: 'base', value: lvl => lvl * 2}
    ]},
  oreWashing: {cap: 15, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 82, price(lvl) {
        return {lm_scrap: Math.pow(1.35, lvl) * buildNum(16.5, 'Qa')};
    }, effect: [
        {name: 'lmPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.1, lvl)}
    ]},
  ironExpansion: {cap: 3, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 85, price(lvl) {
        return {lm_oreIron: lvl * 3 + 2};
    }, effect: [
        {name: 'currencyLmOreTinCap', type: 'mult', value: lvl => Math.pow(1.5, lvl)},
        {name: 'currencyLmOreIronCap', type: 'base', value: lvl => lvl}
    ]},
  bronzeDrill: {cap: 5, capMult: true, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 87, price(lvl) {
        return {lm_barBronze: 5 * Math.pow(2, Math.max(0, lvl - 4))};
    }, effect: [
        {name: 'lmOreGain', type: 'mult', value: lvl => lvl * 0.08 + 1}
    ]},
  ironHardening: {cap: 12, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 90, price(lvl) {
        return {lm_oreIron: Math.floor(Math.pow(1.35, lvl) + 1)};
    }, effect: [
        {name: 'lmDamage', type: 'mult', value: lvl => Math.pow(1.15, lvl)},
        {name: 'currencyLmOreTinCap', type: 'base', value: lvl => lvl * 2}
    ]},
  ironFilter: {cap: 8, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 95, price(lvl) {
        return {lm_oreIron: Math.floor(Math.pow(1.85, lvl) * 5)};
    }, effect: [
        {name: 'currencyLmOreAluminiumCap', type: 'base', value: lvl => lvl * 36}
    ]},
  masterForge: {requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 98, price(lvl) {
        return {lm_coal: lvl * 20 + 80};
    }, effect: [
        {name: 'lmDamage', type: 'mult', value: lvl => Math.pow(1.12, lvl)},
        {name: 'lmToughness', type: 'mult', value: lvl => Math.pow(1 / 1.1, lvl)},
    ]},
  starForge: {requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 98, price(lvl) {
        return {lm_coal: lvl * 20 + 80};
    }, effect: [
        {name: 'currencyLmCrystalGreenGain', type: 'mult', value: lvl => Math.pow(1.06, lvl)}
    ]},
  magnet: {cap: 10, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 100, price(lvl) {
        return {lm_scrap: Math.pow(1.55, lvl) * buildNum(440, 'Qa'), lm_oreIron: lvl * 5 + 10};
    }, effect: [
        {name: 'currencyLmScrapGain', type: 'mult', value: lvl => Math.pow(1.15, lvl)},
        {name: 'lmOreGain', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
  bronzeFilter: {cap: 6, capMult: true, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 102, price(lvl) {
        return {lm_barBronze: 7 * Math.pow(2, Math.max(0, lvl - 5))};
    }, effect: [
        {name: 'lmRareEarthGain', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
  enhancingStation: {cap: 1, hasDescription: true, persistent: true, note: 'lm_25', requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 105, price() {
        return {lm_coal: 250};
    }, effect: [
        {name: 'lmEnhancement', type: 'unlock', value: lvl => lvl >= 1}
    ]},
  enhancingHammer: {requirement() {
        return store.state.unlock.lmEnhancement.use;
    }, price(lvl) {
        return {lm_barAluminium: Math.ceil(Math.pow(1.25, lvl) * 20)};
    }, effect: [
        {name: 'lmEnhancementMax', type: 'base', value: lvl => lvl}
    ]},
  warehouse: {cap: 12, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 110, price(lvl) {
        return {lm_scrap: Math.pow(6, lvl) * buildNum(6.075, 'Qi')};
    }, effect: [
        {name: 'currencyLmOreAluminiumCap', type: 'mult', value: lvl => lvl >= 1 ? Math.pow(2, Math.floor((lvl + 3) / 4)) : null},
        {name: 'currencyLmOreCopperCap', type: 'mult', value: lvl => lvl >= 2 ? Math.pow(2, Math.floor((lvl + 2) / 4)) : null},
        {name: 'currencyLmOreTinCap', type: 'mult', value: lvl => lvl >= 3 ? Math.pow(2, Math.floor((lvl + 1) / 4)) : null},
        {name: 'currencyLmOreIronCap', type: 'mult', value: lvl => lvl >= 4 ? Math.pow(2, Math.floor(lvl / 4)) : null},
    ]},
  corrosiveFumes: {cap: 15, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 112, price(lvl) {
        return {lm_sulfur: Math.pow(3.5, lvl) * 2000};
    }, effect: [
        {name: 'lmToughness', type: 'mult', value: lvl => splicedPow(1 / 1.2, 1 / 1.1, 15, lvl)}
    ]},
  smeltingSalt: {requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 115, price(lvl) {
        return {lm_salt: Math.pow(lvl * 0.01 + 1.4, lvl) * buildNum(10, 'K')};
    }, effect: [
        {name: 'lmPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.11, lvl)}
    ]},
  titaniumExpansion: {cap: 3, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 120, price(lvl) {
        return {lm_oreCopper: Math.pow(2.75, lvl) * 7.5e4, lm_oreTin: Math.pow(2.1, lvl) * 8000};
    }, effect: [
        {name: 'currencyLmOreIronCap', type: 'base', value: lvl => lvl * 3},
        {name: 'currencyLmOreIronCap', type: 'mult', value: lvl => Math.pow(1.25, lvl)},
        {name: 'currencyLmOreTitaniumCap', type: 'base', value: lvl => lvl}
    ]},
  emberForge: {hasDescription: true, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 125, price(lvl) {
        return {lm_coal: lvl * 3 + 80};
    }, effect: [
        {name: 'currencyLmEmberGain', type: 'base', value: lvl => getDiminishing(lvl) * 0.05}
    ]},
  bronzeForge: {requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 128, price(lvl) {
        return {lm_barBronze: Math.ceil(Math.pow(1.28, lvl) * 12)};
    }, effect: [
        {name: 'currencyLmEmberGain', type: 'base', value: lvl => lvl * 0.03}
    ]},
  titaniumCache: {cap: 5, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 130, price(lvl) {
        return {lm_scrap: Math.pow(7, lvl) * buildNum(80, 'Sx'), lm_oreTitanium: Math.pow(2, lvl) * 4, lm_sulfur: Math.pow(2.2, lvl) * buildNum(45, 'K')};
    }, effect: [
        {name: 'currencyLmOreCopperCap', type: 'mult', value: lvl => lvl * 0.4 + 1},
        {name: 'currencyLmOreTinCap', type: 'base', value: lvl => lvl * 10},
        {name: 'currencyLmOreIronCap', type: 'base', value: lvl => lvl * 4},
        {name: 'currencyLmOreTitaniumCap', type: 'base', value: lvl => lvl * 2}
    ]},
  smallBombs: {cap: 5, capMult: true, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 131, price(lvl) {
        return {lm_barSteel: 5 * Math.pow(2, Math.max(0, lvl - 4))};
    }, effect: [
        {name: 'lmToughness', type: 'mult', value: lvl => Math.pow(1 / 1.075, lvl)}
    ]},
  giantForge: {persistent: true, alwaysActive: true, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 132, price(lvl) {
        return {lm_coal: Math.round(Math.pow(1.25, lvl) * 1200)};
    }, effect: [
        {name: 'currencyLmEmberCap', type: 'base', value: lvl => lvl * 50}
    ]},
  gunpowder: {requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 135, price(lvl) {
        return {lm_coal: Math.round(Math.pow(1.1 + 0.01 * lvl, lvl) * (lvl * 10 + 100)), lm_sulfur: Math.pow(1.5 + 0.1 * lvl, lvl) * buildNum(120, 'K'), lm_niter: Math.round(Math.pow(1.1 + 0.02 * lvl, lvl) * (lvl * 100 + 500))};
    }, effect: [
        {name: 'currencyLmScrapGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'lmToughness', type: 'mult', value: lvl => Math.pow(1 / 1.25, lvl)}
    ]},
  nitricAcid: {persistent: true, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 138, price(lvl) {
        return {lm_niter: Math.round(Math.pow(1.05, lvl) * (lvl * 200 + 1000))};
    }, effect: [
        {name: 'lmDamage', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
  metalDetector: {cap: 14, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 140, price(lvl) {
        return {lm_scrap: Math.pow(3.5, lvl) * buildNum(15, 'Sp'), lm_oreIron: Math.pow(1.35, lvl) * 1650};
    }, effect: [
        {name: 'currencyLmScrapGain', type: 'mult', value: lvl => Math.pow(1.08, lvl)},
        {name: 'currencyLmScrapCap', type: 'mult', value: lvl => Math.pow(1.25, lvl)},
        {name: 'currencyLmOreTitaniumCap', type: 'base', value: lvl => lvl * 2}
    ]},
  nails: {cap: 8, capMult: true, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 142, price(lvl) {
        return {lm_barSteel: 7 * Math.pow(2, Math.max(0, lvl - 7))};
    }, effect: [
        {name: 'lmDamage', type: 'mult', value: lvl => lvl * 0.05 + 1}
    ]},
  recycling: {persistent: true, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 145, price(lvl) {
        return {lm_ember: Math.round(Math.pow(1.15, lvl) * 50)};
    }, effect: [
        {name: 'currencyLmScrapGain', type: 'mult', value: lvl => Math.pow(1.1, lvl) * (lvl * 0.25 + 1)}
    ]},
  stickyJar: {cap: 1, hasDescription: true, persistent: true, note: 'lm_30', requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 150, price() {
        return {lm_scrap: buildNum(4, 'O')};
    }, effect: [
        {name: 'lmResin', type: 'unlock', value: lvl => lvl >= 1}
    ]},
  acidVial: {requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 152, price(lvl) {
        return {lm_niter: Math.round(Math.pow(1.15, lvl) * (lvl * 750 + 1500))};
    }, effect: [
        {name: 'lmDamage', type: 'mult', value: lvl => Math.pow(1.2, lvl)},
        {name: 'currencyLmScrapGain', type: 'mult', value: lvl => Math.pow(1.1, lvl)}
    ]},
  scanning: {persistent: true, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 155, price(lvl) {
        return {lm_obsidian: Math.pow(2, lvl) * buildNum(10, 'K')};
    }, effect: [
        {name: 'lmRareEarthGain', type: 'mult', value: lvl => Math.pow(1.1, lvl)}
    ]},
  largerSurface: {cap: 5, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 160, price(lvl) {
        return {lm_scrap: Math.pow(4000, lvl) * buildNum(6, 'N')};
    }, effect: [
        {name: 'lmResinMax', type: 'base', value: lvl => lvl},
        {name: 'currencyLmOreTitaniumCap', type: 'base', value: lvl => lvl * 12}
    ]},
  qualityWorkbench: {cap: 10, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 165, price(lvl) {
        return {lm_scrap: Math.pow(4.6, lvl) * buildNum(35, 'N'), lm_granite: Math.pow(3.85, lvl) * buildNum(300, 'B')};
    }, effect: [
        {name: 'lmPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.2, lvl)}
    ]},
  titaniumForge: {cap: 8, capMult: true, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 170, price(lvl) {
        return {lm_barSteel: 12 * Math.pow(2, Math.max(0, lvl - 7))};
    }, effect: [
        {name: 'lmPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
        {name: 'currencyLmOreTitaniumCap', type: 'mult', value: lvl => lvl * 0.25 + 1}
    ]},
  dynamite: {cap: 15, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 175, price(lvl) {
        return {lm_scrap: Math.pow(3.33, lvl) * buildNum(135, 'N')};
    }, effect: [
        {name: 'lmDamage', type: 'mult', value: lvl => Math.pow(1.15, lvl) * (lvl * 0.1 + 1)}
    ]},
  platinumExpansion: {cap: 4, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 180, price(lvl) {
        return {lm_oreCopper: Math.pow(1.75, lvl) * 1.5e6, lm_oreIron: Math.pow(2.25, lvl) * 2e4};
    }, effect: [
        {name: 'currencyLmOreTitaniumCap', type: 'mult', value: lvl => Math.pow(2, lvl)},
        {name: 'currencyLmOrePlatinumCap', type: 'base', value: lvl => getSequence(3, lvl)}
    ]},
  hiddenStash: {cap: 8, capMult: true, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 185, price(lvl) {
        return {lm_barTitanium: 5 * Math.pow(2, Math.max(0, lvl - 7))};
    }, effect: [
        {name: 'currencyLmScrapGain', type: 'mult', value: lvl => lvl * 0.075 + 1}
    ]},
  platinumCache: {cap: 6, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 190, price(lvl) {
        return {lm_oreTitanium: Math.pow(2, lvl) * 450, lm_salt: Math.pow(1.85, lvl) * buildNum(60, 'M'), lm_sulfur: Math.pow(2.2, lvl) * buildNum(800, 'M')};
    }, effect: [
        {name: 'currencyLmScrapCap', type: 'mult', value: lvl => lvl * 0.4 + 1},
        {name: 'currencyLmOrePlatinumCap', type: 'mult', value: lvl => lvl * 0.5 + 1},
    ]},
  colossalOreStorage: {cap: 1, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 200, price() {
        return {lm_scrap: buildNum(10, 'D')};
    }, effect: [
        {name: 'currencyLmScrapCap', type: 'mult', value: lvl => Math.pow(3, lvl)},
        {name: 'currencyLmOreAluminiumCap', type: 'mult', value: lvl => Math.pow(3, lvl)},
        {name: 'currencyLmOreCopperCap', type: 'mult', value: lvl => Math.pow(3, lvl)},
        {name: 'currencyLmOreTinCap', type: 'mult', value: lvl => Math.pow(3, lvl)},
        {name: 'currencyLmOreIronCap', type: 'mult', value: lvl => Math.pow(3, lvl)},
        {name: 'currencyLmOreTitaniumCap', type: 'mult', value: lvl => Math.pow(3, lvl)},
        {name: 'currencyLmOrePlatinumCap', type: 'mult', value: lvl => Math.pow(3, lvl)},
    ]},
  smallOreStorage: {cap: 5, capMult: true, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 210, price(lvl) {
        return {lm_barTitanium: 8 * Math.pow(2, Math.max(0, lvl - 4))};
    }, effect: [
        {name: 'lmOreCap', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
  titaniumBombs: {cap: 16, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 220, price(lvl) {
        return {lm_scrap: Math.pow(3.1, lvl) * buildNum(440, 'UD'), lm_oreTitanium: Math.pow(1.3, lvl) * 1750};
    }, effect: [
        {name: 'lmDamage', type: 'mult', value: lvl => Math.pow(1.2, lvl)}
    ]},
  titaniumPickaxe: {cap: 10, capMult: true, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 230, price(lvl) {
        return {lm_barTitanium: 14 * Math.pow(2, Math.max(0, lvl - 9))};
    }, effect: [
        {name: 'lmPickaxeCraftingPower', type: 'mult', value: lvl => lvl * 0.05 + 1},
        {name: 'lmPickaxeCraftingQuality', type: 'mult', value: lvl => lvl * 0.2 + 1},
    ]},
  undergroundRadar: {cap: 5, capMult: true, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 240, price(lvl) {
        return {lm_barShiny: 10 * Math.pow(2, Math.max(0, lvl - 4))};
    }, effect: [
        {name: 'lmDepthDwellerSpeed', type: 'mult', value: lvl => lvl * 0.05 + 1}
    ]},
  scrapShelf: {cap: 30, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 250, price(lvl) {
        return {lm_scrap: Math.pow(lvl * 0.05 + 2.1, lvl) * 2e39};
    }, effect: [
        {name: 'currencyLmScrapCap', type: 'mult', value: lvl => Math.pow(1.15, lvl)}
    ]},
  iridiumExpansion: {cap: 10, capMult: true, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 260, price(lvl) {
        return {lm_barShiny: 13 + Math.max(0, lvl - 9)};
    }, effect: [
        {name: 'currencyLmScrapCap', type: 'mult', value: lvl => lvl * 0.05 + 1},
        {name: 'currencyLmOreIridiumCap', type: 'base', value: lvl => getSequence(1, lvl)}
    ]},
  iridiumCache: {cap: 4, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 270, price(lvl) {
        return {lm_scrap: Math.pow(22.5, lvl) * 1e40, lm_sulfur: Math.pow(2.45, lvl) * 1.3e13};
    }, effect: [
        {name: 'currencyLmOreTitaniumCap', type: 'mult', value: lvl => lvl * 0.25 + 1},
        {name: 'currencyLmOrePlatinumCap', type: 'mult', value: lvl => lvl * 0.5 + 1},
        {name: 'currencyLmOreIridiumCap', type: 'mult', value: lvl => lvl + 1}
    ]},
  stonecutter: {cap: 50, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 275, price(lvl) {
        return {lm_scrap: Math.pow(lvl * 0.04 + 2, lvl) * 3.5e41, lm_salt: Math.pow(1.225, lvl) * 1.45e15, lm_deeprock: Math.pow(1.375, lvl) * 1.1e9};
    }, effect: [
        {name: 'lmPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.12, lvl)},
        {name: 'currencyLmScrapGain', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
    ]},
  iridiumTreetap: {cap: 4, capMult: true, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 280, price(lvl) {
        return {lm_deeprock: Math.pow(7.5, lvl) * 5e8, lm_barIridium: 7 * Math.pow(2, Math.max(0, lvl - 3))};
    }, effect: [
        {name: 'currencyLmResinCap', type: 'base', value: lvl => lvl * 10},
        {name: 'lmResinMax', type: 'base', value: lvl => lvl}
    ]},
  deepCuts: {requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 290, price(lvl) {
        return {lm_deeprock: Math.pow(lvl * 0.01 + 1.5, lvl) * buildNum(2.5, 'B')};
    }, effect: [
        {name: 'lmToughness', type: 'mult', value: lvl => Math.pow(1 / 1.25, lvl)}
    ]},
  iridiumBombs: {cap: 7, capMult: true, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 310, price(lvl) {
        return {lm_barIridium: 10 * Math.pow(2, Math.max(0, lvl - 6))};
    }, effect: [
        {name: 'lmDamage', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
  oreBag: {cap: 12, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 330, price(lvl) {
        return {lm_deeprock: Math.pow(1.65, lvl) * buildNum(800, 'B'), lm_sulfur: Math.pow(1.9, lvl) * buildNum(450, 'T')};
    }, effect: [
        {name: 'currencyLmOreTinCap', type: 'base', value: lvl => lvl * 12},
        {name: 'currencyLmOreIronCap', type: 'base', value: lvl => lvl * 10},
        {name: 'currencyLmOreTitaniumCap', type: 'base', value: lvl => lvl * 4},
        {name: 'currencyLmOrePlatinumCap', type: 'base', value: lvl => lvl * 4},
    ]},
  osmiumExpansion: {cap: 9, capMult: true, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 350, price(lvl) {
        return {lm_barShiny: 18 * Math.pow(2, Math.max(0, lvl - 8)), lm_barIridium: 12 * Math.pow(2, Math.max(0, lvl - 8))};
    }, effect: [
        {name: 'currencyLmScrapCap', type: 'mult', value: lvl => lvl * 0.2 + 1},
        {name: 'currencyLmOreOsmiumCap', type: 'base', value: lvl => lvl * 4},
    ]},
  osmiumCache: {cap: 7, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 355, price(lvl) {
        return {lm_scrap: Math.pow(6.75, lvl) * buildNum(900, 'SxD'), lm_deeprock: Math.pow(2.1, lvl) * buildNum(42, 'T')};
    }, effect: [
        {name: 'currencyLmOreOsmiumCap', type: 'base', value: lvl => lvl * 2},
        {name: 'currencyLmOreOsmiumCap', type: 'mult', value: lvl => lvl + 1}
    ]},
  darkBombs: {cap: 5, capMult: true, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 375, price(lvl) {
        return {lm_barDarkIron: 6 * Math.pow(2, Math.max(0, lvl - 9))};
    }, effect: [
        {name: 'lmDamage', type: 'mult', value: lvl => lvl * 0.05 + 1},
        {name: 'currencyLmScrapCap', type: 'mult', value: lvl => lvl * 0.1 + 1},
    ]},
  colossalScrapStorage: {cap: 1, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 400, price() {
        return {lm_scrap: buildNum(1, 'V')};
    }, effect: [
        {name: 'currencyLmScrapCap', type: 'mult', value: lvl => Math.pow(buildNum(1, 'M'), lvl)}
    ]},
  stoneDissolver: {cap: 50, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 425, price(lvl) {
        return {lm_scrap: Math.pow(lvl * 0.02 + 1.8, lvl) * buildNum(1, 'UV')};
    }, effect: [
        {name: 'lmDamage', type: 'mult', value: lvl => Math.pow(1.15, lvl)},
        {name: 'lmToughness', type: 'mult', value: lvl => Math.pow(1 / 1.3, lvl)},
    ]},
  leadExpansion: {cap: 8, capMult: true, requirementBase: requirementBase_upgrade, requirementStat: requirementStat_upgrade, requirementValue: 450, price(lvl) {
        return {lm_barDarkIron: 7 * Math.pow(2, Math.max(0, lvl - 7))};
    }, effect: [
        {name: 'lmOreCap', type: 'mult', value: lvl => lvl * 0.05 + 1},
        {name: 'currencyLmOreLeadCap', type: 'base', value: lvl => lvl * 7},
    ]},
};
const requirementStat_upgrade2 = 'lm_maxDepth1'

const requirementBase_upgrade2 = () => LM_RT && LM_RT.lmState && LM_RT.lmState.stat && LM_RT.lmState.stat[requirementStat_upgrade2] ? (LM_RT.lmState.stat[requirementStat_upgrade2].total || 0) : 0

const upgrade2 = {
  fumes: {subfeature: 1, price(lvl) {
        return {lm_scrap: Math.pow(lvl * 0.012 + 1.24, lvl) * buildNum(750, 'K')};
    }, effect: [
        {name: 'lmDamage', type: 'mult', value: lvl => Math.pow(1.12, lvl) * Math.pow(lvl * 0.2 + 1, 2)}
    ]},
  smallCrate: {subfeature: 1, cap: 25, requirementBase: requirementBase_upgrade2, requirementStat: requirementStat_upgrade2, requirementValue: 3, price(lvl) {
        return {lm_limestone: Math.pow(lvl * 0.025 + 1.35, lvl) * 1000};
    }, effect: [
        {name: 'currencyLmScrapCap', type: 'mult', value: lvl => Math.pow(1.1, lvl)}
    ]},
  giantCrate: {subfeature: 1, requirementBase: requirementBase_upgrade2, requirementStat: requirementStat_upgrade2, requirementValue: 5, price(lvl) {
        return {lm_scrap: Math.pow(lvl * 2 + 8, lvl) * buildNum(2.5, 'M')};
    }, effect: [
        {name: 'currencyLmScrapCap', type: 'mult', value: lvl => Math.pow(6, lvl)}
    ]},
  morePressure: {subfeature: 1, cap: 25, requirementBase: requirementBase_upgrade2, requirementStat: requirementStat_upgrade2, requirementValue: 10, price(lvl) {
        return {lm_scrap: Math.pow(lvl * 0.025 + 1.75, lvl) * buildNum(400, 'M')};
    }, effect: [
        {name: 'lmDamage', type: 'mult', value: lvl => Math.pow(1.2, lvl)},
        {name: 'currencyLmScrapGain', type: 'mult', value: lvl => Math.pow(1.25, lvl)}
    ]},
  gasDweller: {subfeature: 1, cap: 1, persistent: true, requirementBase: requirementBase_upgrade2, requirementStat: requirementStat_upgrade2, requirementValue: 15, price() {
        return {lm_helium: 250};
    }, effect: [
        {name: 'lmDepthDweller', type: 'unlock', value: lvl => lvl >= 1},
        {name: 'lmDepthDwellerMax', type: 'mult', value: lvl => Math.pow(1 / 1.25, lvl)}
    ]},
  piston: {subfeature: 1, cap: 10, requirementBase: requirementBase_upgrade2, requirementStat: requirementStat_upgrade2, requirementValue: 20, price(lvl) {
        return {lm_helium: Math.round(Math.pow(1.35, lvl) * 50)};
    }, effect: [
        {name: 'lmDamage', type: 'mult', value: lvl => Math.pow(1.05, lvl) * (lvl * 0.2 + 1)}
    ]},
  pollution: {subfeature: 1, cap: 1, persistent: true, requirementBase: requirementBase_upgrade2, requirementStat: requirementStat_upgrade2, requirementValue: 25, price() {
        return {lm_helium: 1000};
    }, effect: [
        {name: 'lmSmoke', type: 'unlock', value: lvl => lvl >= 1}
    ]},
  particleFilter: {subfeature: 1, requirement() {
        return store.state.unlock.lmSmoke.use;
    }, price(lvl) {
        return {lm_scrap: Math.pow(1.4, lvl) * buildNum(1, 'T')};
    }, effect: [
        {name: 'lmPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.15, lvl)}
    ]},
  hotAirBalloon: {subfeature: 1, cap: 8, requirementBase: requirementBase_upgrade2, requirementStat: requirementStat_upgrade2, requirementValue: 30, price(lvl) {
        return {lm_scrap: Math.pow(3.75, lvl) * buildNum(2.2, 'T')};
    }, effect: [
        {name: 'currencyLmScrapCap', type: 'mult', value: lvl => Math.pow(1.5, lvl)},
        {name: 'currencyLmSmokeCap', type: 'mult', value: lvl => lvl * 0.5 + 1}
    ]},
  conductor: {subfeature: 1, cap: 10, requirementBase: requirementBase_upgrade2, requirementStat: requirementStat_upgrade2, requirementValue: 35, price(lvl) {
        return {
            lm_scrap: Math.pow(40, lvl) * buildNum(10, 'T'),
            lm_limestone: Math.pow(4.5, lvl) * buildNum(200, 'K')
        };
    }, effect: [
        {name: 'lmDepthDwellerSpeed', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
  vent: {subfeature: 1, cap: 20, requirementBase: requirementBase_upgrade2, requirementStat: requirementStat_upgrade2, requirementValue: 40, price(lvl) {
        return {lm_scrap: Math.pow(1.85, lvl) * buildNum(40, 'T')};
    }, effect: [
        {name: 'currencyLmScrapGain', type: 'mult', value: lvl => Math.pow(1.3, lvl)}
    ]},
  urn: {subfeature: 1, cap: 20, requirementBase: requirementBase_upgrade2, requirementStat: requirementStat_upgrade2, requirementValue: 45, price(lvl) {
        return {lm_limestone: Math.pow(2.8, lvl) * buildNum(850, 'K')};
    }, effect: [
        {name: 'currencyLmSmokeCap', type: 'mult', value: lvl => getSequence(5, lvl) * 0.05 + 1}
    ]},
  lunarBlessing: {subfeature: 1, cap: 20, requirementBase: requirementBase_upgrade2, requirementStat: requirementStat_upgrade2, requirementValue: 50, price(lvl) {
        return {lm_moonshard: Math.pow(2, lvl) * 10};
    }, effect: [
        {name: 'lmPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
        {name: 'lmDamage', type: 'mult', value: lvl => Math.pow(1.05, lvl)}
    ]},
  harvester: {subfeature: 1, cap: 10, requirementBase: requirementBase_upgrade2, requirementStat: requirementStat_upgrade2, requirementValue: 60, price(lvl) {
        return {lm_neon: Math.round(Math.pow(1.35, lvl) * 50)};
    }, effect: [
        {name: 'currencyLmScrapGain', type: 'mult', value: lvl => Math.pow(1.05, lvl) * (lvl * 0.3 + 1)}
    ]},
  chalkboard: {subfeature: 1, cap: 15, requirementBase: requirementBase_upgrade2, requirementStat: requirementStat_upgrade2, requirementValue: 70, price(lvl) {
        return {lm_moonshard: Math.pow(2.25, lvl) * buildNum(30, 'K')};
    }, effect: [
        {name: 'currencyLmLimestoneGain', type: 'mult', value: lvl => Math.pow(1.35, lvl)}
    ]},
  graphiteRod: {subfeature: 1, cap: 40, requirementBase: requirementBase_upgrade2, requirementStat: requirementStat_upgrade2, requirementValue: 80, price(lvl) {
        return {lm_scrap: Math.pow(1.85, lvl) * buildNum(2, 'Qi')};
    }, effect: [
        {name: 'lmPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.12, lvl)},
        {name: 'currencyLmSmokeCap', type: 'mult', value: lvl => Math.pow(1.1, lvl)}
    ]},
  minecart: {subfeature: 1, cap: 25, requirementBase: requirementBase_upgrade2, requirementStat: requirementStat_upgrade2, requirementValue: 90, price(lvl) {
        return {lm_limestone: Math.pow(lvl * 0.03 + 2.15, lvl) * buildNum(5, 'B')};
    }, effect: [
        {name: 'currencyLmScrapGain', type: 'mult', value: lvl => Math.pow(1.2, lvl)},
        {name: 'currencyLmScrapCap', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
    ]},
  moonstone: {subfeature: 1, cap: 10, requirementBase: requirementBase_upgrade2, requirementStat: requirementStat_upgrade2, requirementValue: 100, price(lvl) {
        return {lm_moonshard: Math.pow(10, lvl) * buildNum(1, 'M')};
    }, effect: [
        {name: 'lmPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.5, lvl)}
    ]},
  nightVisionDevice: {subfeature: 1, cap: 40, requirementBase: requirementBase_upgrade2, requirementStat: requirementStat_upgrade2, requirementValue: 115, price(lvl) {
        return {lm_scrap: Math.pow(1.85, lvl) * buildNum(75, 'O')};
    }, effect: [
        {name: 'lmRareEarthGain', type: 'mult', value: lvl => Math.pow(1.1, lvl) * (lvl * 0.1 + 1)}
    ]},
  enrichedCrystal: {subfeature: 1, cap: 10, requirementBase: requirementBase_upgrade2, requirementStat: requirementStat_upgrade2, requirementValue: 130, price(lvl) {
        return {lm_argon: Math.round(Math.pow(1.35, lvl) * 50)};
    }, effect: [
        {name: 'currencyLmCrystalYellowGain', type: 'mult', value: lvl => lvl * 0.05 + 1}
    ]},
  matches: {subfeature: 1, requirementBase: requirementBase_upgrade2, requirementStat: requirementStat_upgrade2, requirementValue: 150, price(lvl) {
        return {lm_phosphorus: Math.pow(lvl * 0.05 + 2.25, lvl) * 8};
    }, effect: [
        {name: 'lmDamage', type: 'mult', value: lvl => Math.pow(1.1, lvl)}
    ]},
  smokeStabilizer: {subfeature: 1, cap: 50, requirementBase: requirementBase_upgrade2, requirementStat: requirementStat_upgrade2, requirementValue: 170, price(lvl) {
        return {lm_scrap: Math.pow(lvl * 0.01 + 1.7, lvl) * buildNum(1.25, 'UD')};
    }, effect: [
        {name: 'lmPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.14, lvl)}
    ]},
  elevator: {subfeature: 1, cap: 30, requirementBase: requirementBase_upgrade2, requirementStat: requirementStat_upgrade2, requirementValue: 190, price(lvl) {
        return {
            lm_limestone: Math.pow(lvl * 0.05 + 2.25, lvl) * buildNum(80, 'T'),
            lm_moonshard: Math.pow(lvl * 0.06 + 2.5, lvl) * buildNum(3.5, 'T'),
            lm_phosphorus: Math.pow(lvl * 0.03 + 1.75, lvl) * 6600
        };
    }, effect: [
        {name: 'currencyLmScrapGain', type: 'mult', value: lvl => Math.pow(1.3, lvl)}
    ]},
  shovel: {subfeature: 1, cap: 20, requirementBase: requirementBase_upgrade2, requirementStat: requirementStat_upgrade2, requirementValue: 210, price(lvl) {
        return {lm_scrap: Math.pow(lvl * 0.08 + 2.16, lvl) * buildNum(860, 'TD')};
    }, effect: [
        {name: 'lmDamage', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
        {name: 'lmPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
        {name: 'currencyLmScrapGain', type: 'mult', value: lvl => Math.pow(1.1, lvl)}
    ]},
  smoker: {subfeature: 1, cap: 10, requirementBase: requirementBase_upgrade2, requirementStat: requirementStat_upgrade2, requirementValue: 230, price(lvl) {
        return {lm_krypton: Math.round(Math.pow(1.35, lvl) * 50)};
    }, effect: [
        {name: 'currencyLmSmokeGain', type: 'mult', value: lvl => Math.pow(1.05, lvl) * (lvl * 0.2 + 1)}
    ]},
};
const upgradePremium = {
  moreDamage: {type: 'premium', price(lvl) {
        return {gem_ruby: fallbackArray([15, 80], [2, 3][(lvl - 2) % 2] * Math.pow(2, Math.floor((lvl - 2) / 2)) * 75, lvl)};
    }, effect: [
        {name: 'lmDamage', type: 'mult', value: lvl => fallbackArray([1, 1.25, 1.5], getSequence(3, lvl - 2) * 0.25 + 1, lvl) }
    ]},
  moreScrap: {type: 'premium', price(lvl) {
        return {gem_ruby: fallbackArray([10, 40], [2, 3][(lvl - 2) % 2] * Math.pow(2, Math.floor((lvl - 2) / 2)) * 75, lvl)};
    }, effect: [
        {name: 'currencyLmScrapGain', type: 'mult', value: lvl => fallbackArray([1, 1.25, 1.5], getSequence(1, lvl - 2) + 1, lvl)},
        {name: 'currencyLmScrapCap', type: 'mult', value: lvl => fallbackArray([1, 1.25, 1.5], getSequence(1, lvl - 2) + 1, lvl)}
    ]},
  moreGreenCrystal: {type: 'premium', requirement() {
        return store.state.unlock.lmDepthDweller.see;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 75};
    }, effect: [
        {name: 'currencyLmCrystalGreenGain', type: 'mult', value: lvl => lvl * 0.25 + 1}
    ]},
  moreRareEarth: {type: 'premium', requirement() {
        return store.state.stat.lm_maxDepth0.total >= 50;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 120};
    }, effect: [
        {name: 'lmRareEarthGain', type: 'mult', value: lvl => getSequence(3, lvl) * 0.05 + 1}
    ]},
  fasterSmeltery: {type: 'premium', requirement() {
        return store.state.unlock.lmSmeltery.see;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 100};
    }, effect: [
        {name: 'lmSmelteryTime', type: 'mult', value: lvl => 1 / (lvl + 1)}
    ]},
  moreResin: {type: 'premium', requirement() {
        return store.state.unlock.lmResin.see;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 150};
    }, effect: [
        {name: 'currencyLmResinGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'currencyLmResinCap', type: 'base', value: lvl => lvl}
    ]},
  premiumCraftingSlots: {type: 'premium', hasDescription: true, requirement() {
        return store.state.unlock.lmPickaxeCrafting.see;
    }, price(lvl) {
        return {gem_ruby: Math.pow(2, lvl) * 30};
    }, effect: [
        {name: 'lmPickaxePremiumCraftingSlots', type: 'base', value: lvl => lvl}
    ]},
  moreAluminium: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumOre', requirement() {
        return store.state.stat.lm_maxDepth0.total >= 15;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 300};
    }, effect: [
        {name: 'currencyLmOreAluminiumGain', type: 'mult', value: lvl => Math.pow(2, lvl)},
        {name: 'currencyLmOreAluminiumCap', type: 'mult', value: lvl => lvl * 0.25 + 1}
    ]},
  moreCopper: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumOre', requirement() {
        return store.state.stat.lm_maxDepth0.total >= 30;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 450};
    }, effect: [
        {name: 'currencyLmOreCopperGain', type: 'mult', value: lvl => Math.pow(2, lvl)},
        {name: 'currencyLmOreCopperCap', type: 'mult', value: lvl => lvl * 0.25 + 1}
    ]},
  moreTin: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumOre', requirement() {
        return store.state.stat.lm_maxDepth0.total >= 50;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 600};
    }, effect: [
        {name: 'currencyLmOreTinGain', type: 'mult', value: lvl => Math.pow(2, lvl)},
        {name: 'currencyLmOreTinCap', type: 'mult', value: lvl => lvl * 0.25 + 1}
    ]},
  moreIron: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumOre', requirement() {
        return store.state.stat.lm_maxDepth0.total >= 80;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 900};
    }, effect: [
        {name: 'currencyLmOreIronGain', type: 'mult', value: lvl => Math.pow(2, lvl)},
        {name: 'currencyLmOreIronCap', type: 'mult', value: lvl => lvl * 0.25 + 1}
    ]},
  moreTitanium: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumOre', requirement() {
        return store.state.stat.lm_maxDepth0.total >= 120;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 1200};
    }, effect: [
        {name: 'currencyLmOreTitaniumGain', type: 'mult', value: lvl => Math.pow(2, lvl)},
        {name: 'currencyLmOreTitaniumCap', type: 'mult', value: lvl => lvl * 0.25 + 1}
    ]},
  morePlatinum: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumOre', requirement() {
        return store.state.stat.lm_maxDepth0.total >= 175;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 1800};
    }, effect: [
        {name: 'currencyLmOrePlatinumGain', type: 'mult', value: lvl => Math.pow(2, lvl)},
        {name: 'currencyLmOrePlatinumCap', type: 'mult', value: lvl => lvl * 0.25 + 1}
    ]},
  moreIridium: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumOre', requirement() {
        return store.state.stat.lm_maxDepth0.total >= 260;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 2500};
    }, effect: [
        {name: 'currencyLmOreIridiumGain', type: 'mult', value: lvl => Math.pow(2, lvl)},
        {name: 'currencyLmOreIridiumCap', type: 'mult', value: lvl => lvl * 0.25 + 1}
    ]},
  moreOsmium: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumOre', requirement() {
        return store.state.stat.lm_maxDepth0.total >= 350;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 3500};
    }, effect: [
        {name: 'currencyLmOreOsmiumGain', type: 'mult', value: lvl => Math.pow(2, lvl)},
        {name: 'currencyLmOreOsmiumCap', type: 'mult', value: lvl => lvl * 0.25 + 1}
    ]},
  moreLead: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumOre', requirement() {
        return store.state.stat.lm_maxDepth0.total >= 450;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 5000};
    }, effect: [
        {name: 'currencyLmOreLeadGain', type: 'mult', value: lvl => Math.pow(2, lvl)},
        {name: 'currencyLmOreLeadCap', type: 'mult', value: lvl => lvl * 0.25 + 1}
    ]},
  moreHelium: {type: 'premium', cap: 5, requirement() {
        return store.state.unlock.lmGasSubfeature.see;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 300};
    }, effect: [
        {name: 'currencyLmHeliumLimit', type: 'base', value: lvl => lvl * 30},
        {name: 'currencyLmHeliumGain', type: 'base', value: lvl => lvl * 0.002}
    ]},
  moreSmoke: {type: 'premium', requirement() {
        return store.state.unlock.lmSmoke.see;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 325};
    }, effect: [
        {name: 'currencyLmSmokeGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'currencyLmSmokeCap', type: 'mult', value: lvl => getSequence(1, lvl) + 1}
    ]},
  moreNeon: {type: 'premium', cap: 5, requirement() {
        return store.state.stat.lm_maxDepth1.total > 50;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 525};
    }, effect: [
        {name: 'currencyLmNeonLimit', type: 'base', value: lvl => lvl * 30},
        {name: 'currencyLmNeonGain', type: 'base', value: lvl => lvl * 0.002}
    ]},
  moreArgon: {type: 'premium', cap: 5, requirement() {
        return store.state.stat.lm_maxDepth1.total > 120;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 800};
    }, effect: [
        {name: 'currencyLmArgonLimit', type: 'base', value: lvl => lvl * 30},
        {name: 'currencyLmArgonGain', type: 'base', value: lvl => lvl * 0.002}
    ]},
  moreKrypton: {type: 'premium', cap: 5, requirement() {
        return store.state.stat.lm_maxDepth1.total > 220;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 1250};
    }, effect: [
        {name: 'currencyLmKryptonLimit', type: 'base', value: lvl => lvl * 30},
        {name: 'currencyLmKryptonGain', type: 'base', value: lvl => lvl * 0.002}
    ]},
};
const requirementStat0 = 'lm_depthDwellerCap0'

const requirementBase0 = () => LM_RT && LM_RT.lmState && LM_RT.lmState.stat && LM_RT.lmState.stat[requirementStat0] ? (LM_RT.lmState.stat[requirementStat0].total || 0) : 0

const requirementStat1 = 'lm_depthDwellerCap1'

const requirementBase1 = () => LM_RT && LM_RT.lmState && LM_RT.lmState.stat && LM_RT.lmState.stat[requirementStat1] ? (LM_RT.lmState.stat[requirementStat1].total || 0) : 0

const upgradePrestige = {
  crystalBasics: {type: 'prestige', cap: 10, price(lvl) {
        return {lm_crystalGreen: Math.pow(2, lvl) * 5};
    }, effect: [
        {name: 'lmDamage', type: 'mult', value: lvl => Math.pow(1.4, lvl)},
        {name: 'currencyLmScrapGain', type: 'mult', value: lvl => Math.pow(1.2, lvl)}
    ]},
  crystalTips: {type: 'prestige', cap: 50, price(lvl) {
        return {lm_crystalGreen: Math.pow(1.15, lvl) * 10};
    }, effect: [
        {name: 'lmDamage', type: 'mult', value: lvl => lvl * 0.25 + 1}
    ]},
  crystalStorage: {type: 'prestige', cap: 50, price(lvl) {
        return {lm_crystalGreen: Math.pow(1.15, lvl) * 5};
    }, effect: [
        {name: 'currencyLmScrapGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'currencyLmScrapCap', type: 'mult', value: lvl => lvl * 0.2 + 1}
    ]},
  crystalLens: {type: 'prestige', cap: 25, price(lvl) {
        return {lm_crystalGreen: Math.pow(1.25, lvl) * 8};
    }, effect: [
        {name: 'lmOreGain', type: 'mult', value: lvl => lvl * 0.15 + 1}
    ]},
  crystalAluminiumStorage: {type: 'prestige', cap: 20, price(lvl) {
        return {lm_crystalGreen: Math.pow(1.4, lvl) * 10};
    }, effect: [
        {name: 'currencyLmOreAluminiumCap', type: 'base', value: lvl => lvl * 12},
        {name: 'currencyLmOreAluminiumCap', type: 'mult', value: lvl => lvl * 0.2 + 1},
    ]},
  crystalCopperStorage: {type: 'prestige', cap: 20, price(lvl) {
        return {lm_crystalGreen: Math.pow(1.4, lvl) * 15};
    }, effect: [
        {name: 'currencyLmOreCopperCap', type: 'base', value: lvl => lvl * 4},
        {name: 'currencyLmOreCopperCap', type: 'mult', value: lvl => lvl * 0.2 + 1},
    ]},
  crystalTinStorage: {type: 'prestige', cap: 20, requirement() {
        return store.state.stat.lm_maxDepth0.total >= 50;
    }, price(lvl) {
        return {lm_crystalGreen: Math.pow(1.4, lvl) * 60};
    }, effect: [
        {name: 'currencyLmOreTinCap', type: 'base', value: lvl => lvl * 2},
        {name: 'currencyLmOreTinCap', type: 'mult', value: lvl => lvl * 0.2 + 1},
    ]},
  crystalIronStorage: {type: 'prestige', cap: 20, requirement() {
        return store.state.stat.lm_maxDepth0.total >= 80;
    }, price(lvl) {
        return {lm_crystalGreen: Math.pow(1.4, lvl) * 450};
    }, effect: [
        {name: 'currencyLmOreIronCap', type: 'base', value: lvl => lvl},
        {name: 'currencyLmOreIronCap', type: 'mult', value: lvl => lvl * 0.2 + 1},
    ]},
  crystalTitaniumStorage: {type: 'prestige', cap: 20, requirement() {
        return store.state.stat.lm_maxDepth0.total >= 120;
    }, price(lvl) {
        return {lm_crystalGreen: Math.pow(1.4, lvl) * buildNum(12, 'K')};
    }, effect: [
        {name: 'currencyLmOreTitaniumCap', type: 'base', value: lvl => lvl},
        {name: 'currencyLmOreTitaniumCap', type: 'mult', value: lvl => lvl * 0.2 + 1},
    ]},
  crystalPlatinumStorage: {type: 'prestige', cap: 20, requirement() {
        return store.state.stat.lm_maxDepth0.total >= 175;
    }, price(lvl) {
        return {lm_crystalGreen: Math.pow(1.4, lvl) * buildNum(5, 'M')};
    }, effect: [
        {name: 'currencyLmOrePlatinumCap', type: 'base', value: lvl => lvl},
        {name: 'currencyLmOrePlatinumCap', type: 'mult', value: lvl => lvl * 0.2 + 1},
    ]},
  crystalIridiumStorage: {type: 'prestige', cap: 20, requirement() {
        return store.state.stat.lm_maxDepth0.total >= 260;
    }, price(lvl) {
        return {lm_crystalGreen: Math.pow(1.4, lvl) * buildNum(2.6, 'T')};
    }, effect: [
        {name: 'currencyLmOreIridiumCap', type: 'base', value: lvl => lvl},
        {name: 'currencyLmOreIridiumCap', type: 'mult', value: lvl => lvl * 0.2 + 1},
    ]},
  crystalOsmiumStorage: {type: 'prestige', cap: 20, requirement() {
        return store.state.stat.lm_maxDepth0.total >= 350;
    }, price(lvl) {
        return {lm_crystalGreen: Math.pow(1.4, lvl) * buildNum(2.6, 'T')};
    }, effect: [
        {name: 'currencyLmOreOsmiumCap', type: 'base', value: lvl => lvl},
        {name: 'currencyLmOreOsmiumCap', type: 'mult', value: lvl => lvl * 0.2 + 1},
    ]},
  crystalLeadStorage: {type: 'prestige', cap: 20, requirement() {
        return store.state.stat.lm_maxDepth0.total >= 450;
    }, price(lvl) {
        return {lm_crystalGreen: Math.pow(1.4, lvl) * buildNum(2.6, 'T')};
    }, effect: [
        {name: 'currencyLmOreLeadCap', type: 'base', value: lvl => lvl},
        {name: 'currencyLmOreLeadCap', type: 'mult', value: lvl => lvl * 0.2 + 1},
    ]},
  crystalDrill: {type: 'prestige', cap: 53, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 5, price(lvl) {
        return {lm_crystalGreen: Math.pow(lvl * 0.01 + 1.5, lvl) * 30};
    }, effect: [
        {name: 'lmDepthDwellerMax', type: 'base', value: lvl => Math.min(getApproaching(0.01, 0.9, lvl), 0.4)}
    ]},
  crystalDetector: {type: 'prestige', cap: 50, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 10, price(lvl) {
        return {lm_crystalGreen: Math.pow(1.4, lvl) * 40};
    }, effect: [
        {name: 'lmRareEarthGain', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
  crystalReplicator: {type: 'prestige', cap: 100, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 12, price(lvl) {
        return {lm_crystalGreen: Math.pow(1.7 + lvl * 0.008, lvl) * 90};
    }, effect: [
        {name: 'currencyLmCrystalGreenGain', type: 'mult', value: lvl => Math.pow(1.1, lvl)}
    ]},
  crystalPreservarium: {type: 'prestige', cap: 3, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 15, price(lvl) {
        return {lm_crystalGreen: Math.pow(4, lvl) * 250};
    }, effect: [
        {name: 'lm_scrapCapacityUp', type: 'keepUpgrade', value: lvl => lvl >= 1},
        {name: 'lm_scrapGainUp', type: 'keepUpgrade', value: lvl => lvl >= 2},
        {name: 'lm_damageUp', type: 'keepUpgrade', value: lvl => lvl >= 3}
    ]},
  crystalTools: {type: 'prestige', requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 16, price(lvl) {
        return {lm_crystalGreen: Math.pow(lvl * 0.02 + 1.4, lvl) * 120};
    }, effect: [
        {name: 'currencyLmScrapGain', type: 'mult', value: lvl => Math.pow(1.11, lvl)},
        {name: 'lmDamage', type: 'mult', value: lvl => Math.pow(1.08, lvl)}
    ]},
  crystalExplosives: {type: 'prestige', requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 20, price(lvl) {
        return {lm_crystalGreen: Math.pow(Math.max((lvl - 100) * 0.0005, 0) + 1.15, lvl) * 200};
    }, effect: [
        {name: 'lmToughness', type: 'mult', value: lvl => Math.pow(1 / 1.2, lvl)}
    ]},
  crystalRefinery: {type: 'prestige', cap: 50, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 25, price(lvl) {
        return {lm_crystalGreen: Math.pow(1.4, lvl) * 650};
    }, effect: [
        {name: 'lmOreGain', type: 'mult', value: lvl => lvl * 0.04 + 1},
        {name: 'lmRareEarthGain', type: 'mult', value: lvl => Math.pow(1.1, lvl)}
    ]},
  crystalSmeltery: {type: 'prestige', cap: 100, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 30, price(lvl) {
        return {lm_crystalGreen: Math.pow(1.4, lvl) * 3300};
    }, effect: [
        {name: 'lmSmelteryTemperature', type: 'base', value: lvl => 10 * lvl},
        {name: 'lmSmelteryTime', type: 'mult', value: lvl => 1 / (Math.pow(1.02, lvl) * (lvl * 0.08 + 1))}
    ]},
  crystalEnhancer: {type: 'prestige', cap: 7, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 35, price(lvl) {
        return {lm_crystalGreen: Math.pow(100, lvl) * 2e5};
    }, effect: [
        {name: 'lmEnhancementMax', type: 'base', value: lvl => lvl}
    ]},
  crystalTreetap: {type: 'prestige', cap: 40, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 40, price(lvl) {
        return {lm_crystalGreen: Math.pow(1.4, lvl) * buildNum(75, 'K')};
    }, effect: [
        {name: 'currencyLmResinGain', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
  crystalSalt: {type: 'prestige', cap: 50, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 50, price(lvl) {
        return {lm_crystalGreen: Math.pow(1.4, lvl) * buildNum(1.1, 'M')};
    }, effect: [
        {name: 'currencyLmSaltGain', type: 'mult', value: lvl => Math.pow(1.1, lvl) * (lvl * 0.2 + 1)}
    ]},
  crystalBottle: {type: 'prestige', cap: 25, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 60, price(lvl) {
        return {lm_crystalGreen: Math.pow(lvl * 0.1 + 2, lvl) * buildNum(12.5, 'M')};
    }, effect: [
        {name: 'currencyLmResinCap', type: 'base', value: lvl => lvl}
    ]},
  crystalSafe: {type: 'prestige', cap: 17, hideCap: true, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 65, price(lvl) {
        return {lm_crystalGreen: Math.pow(10, lvl) * 1e8};
    }, effect: [
        {name: 'lm_oreShelf', type: 'keepUpgrade', value: lvl => lvl >= 1},
        {name: 'lm_oreShelf', type: 'uncapUpgrade', value: lvl => lvl >= 1},
        {name: 'lm_ironCache', type: 'keepUpgrade', value: lvl => lvl >= 2},
        {name: 'lm_ironCache', type: 'uncapUpgrade', value: lvl => lvl >= 2},
        {name: 'lm_bronzeDrill', type: 'keepUpgrade', value: lvl => lvl >= 3},
        {name: 'lm_bronzeDrill', type: 'uncapUpgrade', value: lvl => lvl >= 3},
        {name: 'lm_bronzeFilter', type: 'keepUpgrade', value: lvl => lvl >= 4},
        {name: 'lm_bronzeFilter', type: 'uncapUpgrade', value: lvl => lvl >= 4},
        {name: 'lm_smallBombs', type: 'keepUpgrade', value: lvl => lvl >= 5},
        {name: 'lm_smallBombs', type: 'uncapUpgrade', value: lvl => lvl >= 5},
        {name: 'lm_nails', type: 'keepUpgrade', value: lvl => lvl >= 6},
        {name: 'lm_nails', type: 'uncapUpgrade', value: lvl => lvl >= 6},
        {name: 'lm_titaniumForge', type: 'keepUpgrade', value: lvl => lvl >= 7},
        {name: 'lm_titaniumForge', type: 'uncapUpgrade', value: lvl => lvl >= 7},
        {name: 'lm_hiddenStash', type: 'keepUpgrade', value: lvl => lvl >= 8},
        {name: 'lm_hiddenStash', type: 'uncapUpgrade', value: lvl => lvl >= 8},
        {name: 'lm_smallOreStorage', type: 'keepUpgrade', value: lvl => lvl >= 9},
        {name: 'lm_smallOreStorage', type: 'uncapUpgrade', value: lvl => lvl >= 9},
        {name: 'lm_titaniumPickaxe', type: 'keepUpgrade', value: lvl => lvl >= 10},
        {name: 'lm_titaniumPickaxe', type: 'uncapUpgrade', value: lvl => lvl >= 10},
        {name: 'lm_undergroundRadar', type: 'keepUpgrade', value: lvl => lvl >= 11},
        {name: 'lm_undergroundRadar', type: 'uncapUpgrade', value: lvl => lvl >= 11},
        {name: 'lm_iridiumExpansion', type: 'keepUpgrade', value: lvl => lvl >= 12},
        {name: 'lm_iridiumExpansion', type: 'uncapUpgrade', value: lvl => lvl >= 12},
        {name: 'lm_iridiumTreetap', type: 'keepUpgrade', value: lvl => lvl >= 13},
        {name: 'lm_iridiumTreetap', type: 'uncapUpgrade', value: lvl => lvl >= 13},
        {name: 'lm_iridiumBombs', type: 'keepUpgrade', value: lvl => lvl >= 14},
        {name: 'lm_iridiumBombs', type: 'uncapUpgrade', value: lvl => lvl >= 14},
        {name: 'lm_osmiumExpansion', type: 'keepUpgrade', value: lvl => lvl >= 15},
        {name: 'lm_osmiumExpansion', type: 'uncapUpgrade', value: lvl => lvl >= 15},
        {name: 'lm_darkBombs', type: 'keepUpgrade', value: lvl => lvl >= 16},
        {name: 'lm_darkBombs', type: 'uncapUpgrade', value: lvl => lvl >= 16},
        {name: 'lm_leadExpansion', type: 'keepUpgrade', value: lvl => lvl >= 17},
        {name: 'lm_leadExpansion', type: 'uncapUpgrade', value: lvl => lvl >= 17},
    ]},
  crystalEngine: {type: 'prestige', cap: 50, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 75, price(lvl) {
        return {lm_crystalGreen: Math.pow(1.4, lvl) * buildNum(230, 'M')};
    }, effect: [
        {name: 'lmDamage', type: 'mult', value: lvl => Math.pow(1.1, lvl) * (lvl * 0.25 + 1)}
    ]},
  crystalCoal: {type: 'prestige', cap: 20, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 90, price(lvl) {
        return {lm_crystalGreen: Math.pow(lvl * 0.05 + 1.75, lvl) * buildNum(27, 'B')};
    }, effect: [
        {name: 'currencyLmCoalGain', type: 'mult', value: lvl => lvl * 0.05 + 1}
    ]},
  crystalTruck: {type: 'prestige', cap: 10, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 105, price(lvl) {
        return {lm_crystalGreen: Math.pow(10, lvl) * buildNum(1, 'T')};
    }, effect: [
        {name: 'currencyLmScrapCap', type: 'mult', value: lvl => Math.pow(1.5, lvl) * (lvl * 0.5 + 1)}
    ]},
  crystalExpansion: {type: 'prestige', cap: 9, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 120, price(lvl) {
        return {lm_crystalGreen: Math.pow(10, lvl) * Math.pow(1000, Math.max(0, lvl - 6)) * buildNum(25, 'T')};
    }, effect: [
        {name: 'currencyLmOreAluminiumCap', type: 'mult', value: lvl => lvl >= 1 ? 10 : null},
        {name: 'currencyLmOreCopperCap', type: 'mult', value: lvl => lvl >= 2 ? 10 : null},
        {name: 'currencyLmOreTinCap', type: 'mult', value: lvl => lvl >= 3 ? 10 : null},
        {name: 'currencyLmOreIronCap', type: 'mult', value: lvl => lvl >= 4 ? 10 : null},
        {name: 'currencyLmOreTitaniumCap', type: 'mult', value: lvl => lvl >= 5 ? 10 : null},
        {name: 'currencyLmOrePlatinumCap', type: 'mult', value: lvl => lvl >= 6 ? 10 : null},
        {name: 'currencyLmOreIridiumCap', type: 'mult', value: lvl => lvl >= 7 ? 10 : null},
        {name: 'currencyLmOreOsmiumCap', type: 'mult', value: lvl => lvl >= 8 ? 10 : null},
        {name: 'currencyLmOreLeadCap', type: 'mult', value: lvl => lvl >= 9 ? 10 : null}
    ]},
  crystalTnt: {type: 'prestige', cap: 25, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 135, price(lvl) {
        return {lm_crystalGreen: Math.pow(10, lvl) * buildNum(6, 'Qa')};
    }, effect: [
        {name: 'lmToughness', type: 'mult', value: lvl => Math.pow(0.5, lvl)}
    ]},
  crystalBeacon: {type: 'prestige', cap: 4, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 150, price(lvl) {
        return {lm_crystalGreen: Math.pow(buildNum(1, 'M'), lvl) * buildNum(1, 'Sx')};
    }, effect: [
        {name: 'lmBeaconPiercing', type: 'base', value: lvl => lvl >= 1 ? 1 : null},
        {name: 'lmBeaconRich', type: 'base', value: lvl => lvl >= 2 ? 1 : null},
        {name: 'lmBeaconWonder', type: 'base', value: lvl => lvl >= 3 ? 1 : null},
        {name: 'lmBeaconHope', type: 'base', value: lvl => lvl >= 4 ? 1 : null},
    ]},
  crystalNiter: {type: 'prestige', cap: 20, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 165, price(lvl) {
        return {lm_crystalGreen: Math.pow(lvl * 0.02 + 1.4, lvl) * buildNum(3, 'Sx')};
    }, effect: [
        {name: 'currencyLmNiterGain', type: 'mult', value: lvl => lvl * 0.05 + 1}
    ]},
  crystalBunker: {type: 'prestige', cap: 20, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 180, price(lvl) {
        return {lm_crystalGreen: Math.pow(4.5, lvl) * buildNum(65, 'Sx')};
    }, effect: [
        {name: 'currencyLmScrapCap', type: 'mult', value: lvl => Math.pow(1.2, lvl) * (lvl * 0.4 + 1)},
        {name: 'lmOreCap', type: 'mult', value: lvl => lvl * 0.2 + 1},
    ]},
  crystalOreBag: {type: 'prestige', cap: 40, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 200, price(lvl) {
        return {lm_crystalGreen: Math.pow(1.2, lvl) * buildNum(1, 'Sp')};
    }, effect: [
        {name: 'lmOreCap', type: 'base', value: lvl => lvl}
    ]},
  crystalSpikes: {type: 'prestige', requirement() {
        return store.state.unlock.lmGasSubfeature.see;
    }, price(lvl) {
        return {lm_crystalYellow: Math.pow(lvl * 0.025 + 1.3, lvl) * 5};
    }, effect: [
        {name: 'lmDamage', type: 'mult', value: lvl => Math.pow(1.05, lvl) * (lvl * 0.15 + 1)}
    ]},
  crystalBooster: {type: 'prestige', cap: 8, requirement() {
        return store.state.unlock.lmGasSubfeature.see;
    }, price(lvl) {
        return {lm_crystalYellow: Math.pow(1.75, lvl) * 8};
    }, effect: [
        {name: 'lmDepthDwellerSpeed', type: 'mult', value: lvl => lvl * 0.125 + 1}
    ]},
  heliumReserves: {type: 'prestige', cap: 8, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 4, price(lvl) {
        return {lm_crystalYellow: Math.pow(lvl * 0.5 + 2, lvl) * 100};
    }, effect: [
        {name: 'currencyLmHeliumIncrement', type: 'base', value: lvl => lvl * 0.01}
    ]},
  crystalSmoke: {type: 'prestige', cap: 20, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 8, price(lvl) {
        return {lm_crystalYellow: Math.pow(1.65, lvl) * 250};
    }, effect: [
        {name: 'currencyLmSmokeGain', type: 'mult', value: lvl => Math.pow(1.2, lvl)},
        {name: 'currencyLmSmokeCap', type: 'mult', value: lvl => Math.pow(1.3, lvl)}
    ]},
  crystalConductor: {type: 'prestige', cap: 25, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 12, price(lvl) {
        return {lm_crystalYellow: Math.pow(lvl * 0.02 + 1.5, lvl) * 1000};
    }, effect: [
        {name: 'lmDepthDwellerMax', type: 'base', value: lvl => lvl * 0.005}
    ]},
  crystalFusion: {type: 'prestige', cap: 25, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 16, price(lvl) {
        return {lm_crystalYellow: Math.pow(1.75, lvl) * 2300};
    }, effect: [
        {name: 'currencyLmCrystalGreenGain', type: 'mult', value: lvl => Math.pow(1.15, lvl)},
        {name: 'currencyLmCrystalYellowGain', type: 'mult', value: lvl => Math.pow(1.3, lvl)}
    ]},
  neonReserves: {type: 'prestige', cap: 8, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 20, price(lvl) {
        return {lm_crystalYellow: Math.pow(lvl * 0.5 + 2, lvl) * 7000};
    }, effect: [
        {name: 'currencyLmNeonIncrement', type: 'base', value: lvl => lvl * 0.005}
    ]},
  crystalRefuge: {type: 'prestige', cap: 2, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 24, price(lvl) {
        return {lm_crystalYellow: Math.pow(20, lvl) * buildNum(25, 'K')};
    }, effect: [
        {name: 'lm_piston', type: 'keepUpgrade', value: lvl => lvl >= 1},
        {name: 'lm_harvester', type: 'keepUpgrade', value: lvl => lvl >= 2}
    ]},
  crystalCave: {type: 'prestige', cap: 10, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 28, price(lvl) {
        return {lm_crystalYellow: Math.pow(1.65, lvl) * buildNum(75, 'K')};
    }, effect: [
        {name: 'currencyLmScrapCap', type: 'mult', value: lvl => Math.pow(1.1, lvl) * (lvl * 0.15 + 1)},
        {name: 'lmOreCap', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
  crystalFilter: {type: 'prestige', cap: 20, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 32, price(lvl) {
        return {lm_crystalYellow: Math.pow(1.5, lvl) * buildNum(450, 'K')};
    }, effect: [
        {name: 'lmRareEarthGain', type: 'mult', value: lvl => Math.pow(1.15, lvl)}
    ]},
  heliumWarehouse: {type: 'prestige', cap: 5, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 40, price(lvl) {
        return {lm_crystalYellow: Math.pow(10 * Math.pow(2, lvl), lvl) * buildNum(1.8, 'M')};
    }, effect: [
        {name: 'currencyLmHeliumLimit', type: 'mult', value: lvl => Math.pow(2, lvl)}
    ]},
  crystalTunnel: {type: 'prestige', cap: 25, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 48, price(lvl) {
        return {lm_crystalYellow: Math.pow(lvl * 0.05 + 1.5, lvl) * buildNum(8, 'M')};
    }, effect: [
        {name: 'currencyLmScrapCap', type: 'mult', value: lvl => Math.pow(1.2, lvl) * (lvl * 0.3 + 1)}
    ]},
  argonReserves: {type: 'prestige', cap: 8, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 56, price(lvl) {
        return {lm_crystalYellow: Math.pow(lvl * 0.5 + 2, lvl) * buildNum(30, 'M')};
    }, effect: [
        {name: 'currencyLmArgonIncrement', type: 'base', value: lvl => lvl * 0.003}
    ]},
  crystalDust: {type: 'prestige', cap: 10, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 64, price(lvl) {
        return {lm_crystalYellow: Math.pow(1.65, lvl) * buildNum(120, 'M')};
    }, effect: [
        {name: 'currencyLmSmokeGain', type: 'mult', value: lvl => Math.pow(1.15, lvl) * (lvl * 0.35 + 1)}
    ]},
  neonWarehouse: {type: 'prestige', cap: 5, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 72, price(lvl) {
        return {lm_crystalYellow: Math.pow(10 * Math.pow(2, lvl), lvl) * buildNum(750, 'M')};
    }, effect: [
        {name: 'currencyLmNeonLimit', type: 'mult', value: lvl => getSequence(1, lvl) + 1},
        {name: 'currencyLmNeonIncrement', type: 'base', value: lvl => lvl * 0.002}
    ]},
  crystalBombs: {type: 'prestige', cap: 20, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 80, price(lvl) {
        return {lm_crystalYellow: Math.pow(1.65, lvl) * buildNum(3.3, 'B')};
    }, effect: [
        {name: 'lmDamage', type: 'mult', value: lvl => Math.pow(1.05, lvl) * (lvl * 0.1 + 1)}
    ]},
  crystalCollector: {type: 'prestige', cap: 20, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 96, price(lvl) {
        return {lm_crystalYellow: Math.pow(1.65, lvl) * buildNum(66, 'B')};
    }, effect: [
        {name: 'currencyLmScrapGain', type: 'mult', value: lvl => Math.pow(1.1, lvl) * (lvl * 0.1 + 1)}
    ]},
  kryptonReserves: {type: 'prestige', cap: 8, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 112, price(lvl) {
        return {lm_crystalYellow: Math.pow(lvl * 0.5 + 2, lvl) * buildNum(1.3, 'T')};
    }, effect: [
        {name: 'currencyLmKryptonIncrement', type: 'base', value: lvl => lvl * 0.002}
    ]},
  crystalResort: {type: 'prestige', cap: 2, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 120, price(lvl) {
        return {lm_crystalYellow: Math.pow(4000, lvl) * buildNum(6, 'T')};
    }, effect: [
        {name: 'lm_enrichedCrystal', type: 'keepUpgrade', value: lvl => lvl >= 1},
        {name: 'lm_smoker', type: 'keepUpgrade', value: lvl => lvl >= 2}
    ]},
};

/* ===== enhancement.js / beacon.js（照抄） ===== */
const enhancement = {
  barAluminium: {
        effect: [
            {name: 'lmPickaxeCraftingQuality', type: 'mult', value: lvl => lvl * 0.5 + 1},
            {name: 'lmOreQuality', type: 'mult', value: lvl => Math.pow(2, lvl)}
        ]
    },
  barBronze: {
        effect: [
            {name: 'lmOreGain', type: 'mult', value: lvl => Math.pow(1.1, lvl) * (lvl * 0.1 + 1)},
            {name: 'lmRareEarthGain', type: 'mult', value: lvl => Math.pow(1.15, lvl) * (lvl * 0.15 + 1)}
        ]
    },
  barSteel: {
        effect: [
            {name: 'lmDamage', type: 'mult', value: lvl => lvl * 0.08 + 1},
            {name: 'lmToughness', type: 'mult', value: lvl => Math.pow(1 / 1.35, lvl)}
        ]
    },
  barTitanium: {
        effect: [
            {name: 'currencyLmScrapGain', type: 'mult', value: lvl => getSequence(2, lvl) * 0.1 + 1}
        ]
    },
  barShiny: {
        effect: [
            {name: 'lmDepthDwellerSpeed', type: 'mult', value: lvl => lvl * 0.1 + 1},
            {name: 'currencyLmCrystalGreenGain', type: 'mult', value: lvl => lvl * 0.1 + 1}
        ]
    },
  barIridium: {
        effect: [
            {name: 'currencyLmEmberGain', type: 'mult', value: lvl => lvl * 0.3 + 1}
        ]
    },
  barDarkIron: {
        effect: [
            {name: 'currencyLmScrapCap', type: 'mult', value: lvl => getSequence(2, lvl) * 0.15 + 1}
        ]
    },
};

const beacon = {
  piercing: {
        color: 'purple',
        ownedMult: 'lmBeaconPiercing',
        effect: [
            {name: 'lmToughness', type: 'mult', value: lvl => 1 / (lvl * 0.25 + 5)}
        ]
    },
  rich: {
        color: 'orange',
        ownedMult: 'lmBeaconRich',
        effect: [
            {name: 'lmOreGain', type: 'mult', value: lvl => lvl * 0.05 + 2}
        ]
    },
  wonder: {
        color: 'blue',
        ownedMult: 'lmBeaconWonder',
        effect: [
            {name: 'lmRareEarthGain', type: 'mult', value: lvl => lvl * 0.04 + 1.6}
        ]
    },
  hope: {
        color: 'green',
        ownedMult: 'lmBeaconHope',
        range: 5,
        effect: [
            {name: 'lmDamage', type: 'mult', value: lvl => lvl * 0.01 + 1.1},
            {name: 'currencyLmScrapGain', type: 'mult', value: lvl => lvl * 0.015 + 1.2}
        ]
    },
};

/* ===== mining.js 中的核心定义（照抄） ===== */
const LM_NOTES = {
    1: 'mining_0',
    2: 'mining_1',
    4: 'mining_2',
    7: 'mining_3',
    9: 'meta_1',
    11: 'meta_2',
    14: 'mining_4',
    16: 'mining_5',
    19: 'mining_6',
    21: 'mining_7',
    24: 'mining_8',
    29: 'mining_9',
    31: 'mining_10',
    34: 'mining_11',
    39: 'mining_12',
    45: 'mining_13',
    49: 'mining_14',
    51: 'mining_15',
    56: 'mining_16',
    62: 'mining_17',
    69: 'mining_19',
    70: 'mining_20',
    79: 'mining_21',
    90: 'mining_22',
    95: 'mining_23',
    103: 'mining_24',
    119: 'mining_26',
    124: 'mining_27',
    133: 'mining_28',
    144: 'mining_29',
    157: 'mining_31',
    166: 'mining_32',
    174: 'mining_33',
};

const awardLoot = function (breaks, loots, hits) {
    const gotLoot = breaks > 0 || loots > 0;
    if (gotLoot) {
        for (const [key, elem] of Object.entries(store.getters['lm/currentOre'])) {
            store.dispatch('currency/gain', {feature: 'lm', name: key, amount: elem.amount * (LM_ORE_BREAK * breaks + loots)});
        }
        store.dispatch('currency/gain', {feature: 'lm', name: 'scrap', amount: store.getters['lm/currentScrap'] * (LM_SCRAP_BREAK * breaks + loots)});
        const smokeGain = store.getters['lm/currentSmoke'] * (LM_SMOKE_BREAK * breaks + loots);
        if (smokeGain > 0) {
            store.dispatch('currency/gain', {feature: 'lm', name: 'smoke', amount: smokeGain});
        }
    }
    const depth = store.state.lm.depth;
    if (store.state.system.features.mining.currentSubfeature === 0) {
        const existingBreaks = store.getters['lm/currentBreaks'];
        const totalBreaks = existingBreaks + breaks;
        if (gotLoot && depth >= LM_GRANITE_DEPTH && totalBreaks >= 1000) {
            let breaksMult = 0;
            let currentBreaks = existingBreaks;
            while (currentBreaks < totalBreaks) {
                const breaksBase = currentBreaks > 0 ? Math.floor(Math.log10(currentBreaks)) : -1;
                const adds = Math.min(totalBreaks - currentBreaks, Math.pow(10, breaksBase + 1) - currentBreaks);
                currentBreaks += adds;
                if (breaksBase >= 3) {
                    breaksMult += adds * Math.pow(2, breaksBase - 3);
                }
            }
            breaksMult = breaks > 0 ? (breaksMult / breaks) : Math.pow(2, Math.floor(Math.log10(existingBreaks)) - 3);
            store.dispatch('currency/gain', {feature: 'lm', name: 'granite', amount: store.getters['lm/rareDropFinal']('granite') * (LM_RARE_DROP_BREAK * breaks + loots) * breaksMult});
        }
        const depthOres = Object.keys(store.getters['lm/depthOre'](depth, false, true)).length;
        if (gotLoot && depth >= LM_SALT_DEPTH && (depthOres === 1 || store.state.lm.torchDepths.includes(depth))) {
            store.dispatch('currency/gain', {feature: 'lm', name: 'salt', amount: store.getters['lm/rareDropFinal']('salt') * (depthOres === 1 ? 1 : 0.5) * (LM_RARE_DROP_BREAK * breaks + loots)});
        }
        if (depth >= LM_COAL_DEPTH && existingBreaks === 0 && breaks > 0) {
            store.dispatch('currency/gain', {feature: 'lm', name: 'coal', amount: store.getters['lm/rareDropFinal']('coal')});
        }
        if (depth >= LM_SULFUR_DEPTH && existingBreaks === 0 && hits > loots) {
            store.dispatch('currency/gain', {feature: 'lm', name: 'sulfur', amount: store.getters['lm/rareDropFinal']('sulfur') * (hits - loots)});
        }
        if (depth >= LM_NITER_DEPTH && breaks > 0) {
            let breaksMult = 0;
            let currentBreaks = existingBreaks;
            while (currentBreaks < totalBreaks) {
                const breaksBase = currentBreaks > 0 ? Math.floor(Math.log10(currentBreaks)) : -1;
                const nextStep = Math.pow(10, breaksBase + 1);
                currentBreaks = Math.min(totalBreaks, nextStep);
                if (currentBreaks === nextStep) {
                    breaksMult++;
                }
            }
            store.dispatch('currency/gain', {feature: 'lm', name: 'niter', amount: store.getters['lm/rareDropFinal']('niter') * breaksMult});
        }
        if (gotLoot && depth >= LM_OBSIDIAN_DEPTH && (store.getters['lm/enhancementLevel'] <= 0 || !store.state.lm.enhancementsActive)) {
            store.dispatch('currency/gain', {feature: 'lm', name: 'obsidian', amount: store.getters['lm/rareDropFinal']('obsidian') * (LM_RARE_DROP_BREAK * breaks + loots)});
        }
        if (gotLoot && depth >= LM_DEEPROCK_DEPTH && digitSum(depth) >= 14) {
            store.dispatch('currency/gain', {feature: 'lm', name: 'deeprock', amount: store.getters['lm/rareDropFinal']('deeprock') * (LM_RARE_DROP_BREAK * breaks + loots)});
        }
    }
    if (store.state.system.features.mining.currentSubfeature === 1) {
        if (gotLoot && isPrime(depth)) {
            store.dispatch('currency/gain', {feature: 'lm', name: 'limestone', amount: store.getters['lm/rareDropFinal']('limestone') * (LM_RARE_DROP_BREAK * breaks + loots)});
        }
        if (gotLoot && depth >= LM_MOONSHARD_DEPTH && store.state.stat.mining_depthDwellerCap1.value >= depth) {
            store.dispatch('currency/gain', {feature: 'lm', name: 'moonshard', amount: store.getters['lm/rareDropFinal']('moonshard') * (LM_RARE_DROP_BREAK * breaks + loots)});
        }
        if (gotLoot && depth >= LM_PHOSPHORUS_DEPTH && (depth % 25 === 0)) {
            store.dispatch('currency/gain', {feature: 'lm', name: 'phosphorus', amount: store.getters['lm/rareDropFinal']('phosphorus') * (LM_RARE_DROP_BREAK * breaks + loots)});
        }
    }
    if (breaks > 0) {
        store.commit('lm/addBreaks', {depth: store.state.lm.depth, amount: breaks});
    }
};

const LM_TICK = function(seconds) {
        const subfeature = store.state.system.features.lm.currentSubfeature;

        store.commit('stat/add', {feature: 'lm', name: 'timeSpent', value: seconds});

        if (store.state.lm.beaconCooldown > 0) {
            store.commit('lm/updateKey', {key: 'beaconCooldown', value: Math.max(store.state.lm.beaconCooldown - seconds, 0)});
        }

        // Smeltery
        for (const [key, elem] of Object.entries(store.state.lm.smeltery)) {
            if (elem.stored > 0) {
                let secondsLeft = seconds;
                let bars = 0;
                let newProgress = elem.progress;
                let timeNeeded = store.getters['lm/smelteryTimeNeeded'](key);
                while (secondsLeft > 0 && bars < elem.stored) {
                    if (secondsLeft >= (timeNeeded * (1 - newProgress))) {
                        bars++;
                        secondsLeft -= timeNeeded * (1 - newProgress);
                        newProgress = 0;
                    } else {
                        newProgress += secondsLeft / timeNeeded;
                        secondsLeft = 0;
                    }
                    timeNeeded *= LM_SMELTERY_TIME_INCREMENT;
                }
                if (bars > 0) {
                    store.commit('lm/updateSmelteryKey', {name: key, key: 'stored', value: elem.stored - bars});
                    const barSplit = elem.output.split('_');
                    store.dispatch('currency/gain', {feature: barSplit[0], name: barSplit[1], amount: bars});
                }
                store.commit('lm/updateSmelteryKey', {name: key, key: 'progress', value: newProgress});
            }
        }

        // Resin
        if (store.state.unlock.lmResin.use && subfeature === 0) {
            store.dispatch('currency/gain', {feature: 'lm', name: 'resin', amount: seconds * store.getters['mult/get']('currencyLmResinGain')});
        }

        // Lm
        if (store.getters['lm/currentDamage'] > 0) {
            let secondsLeft = seconds;
            while (secondsLeft > 0) {
                const maxDepth = store.state.stat[`lm_maxDepth${subfeature}`].value;

                let breaks = 0;
                let loots = 0;
                let preHits = Math.min(secondsLeft, store.getters['lm/currentHitsNeeded']);

                if (store.state.lm.depth < maxDepth) {
                    loots += preHits;
                }
                secondsLeft -= preHits;

                store.commit('stat/increaseTo', {feature: 'lm', name: 'maxDamage', value: store.getters['lm/currentDamage']});
                store.commit('stat/add', {feature: 'lm', name: 'totalDamage', value: preHits * store.getters['lm/currentDamage']});

                let newDurability = store.state.lm.durability - preHits * store.getters['lm/currentDamage'];

                if (newDurability <= 0) {
                    breaks++;
                    let isLatest = maxDepth === store.state.lm.depth;
                    if (isLatest) {
                        // Get gasses for the first time
                        for (const [key, elem] of Object.entries(store.getters['lm/currentGas'])) {
                            store.dispatch('currency/gain', {feature: 'lm', name: key, amount: elem});
                        }

                        // also count the first break as loot
                        loots++;
                        store.commit('stat/increaseTo', {feature: 'lm', name: 'maxDepth' + subfeature, value: store.state.lm.depth + 1});
                        store.dispatch('meta/globalLevelPart', {key: 'lm_' + subfeature, amount: store.state.stat[`lm_maxDepth${subfeature}`].total - 1});
                        if (subfeature === 0) {
                            if (maxDepth >= 260 && !store.state.unlock.lmAdvancedCardPack.use) {
                                store.dispatch('unlock/unlock', 'lmAdvancedCardPack');
                            }
                            if (maxDepth >= 350 && !store.state.unlock.lmLuxuryCardPack.use) {
                                store.dispatch('unlock/unlock', 'lmLuxuryCardPack');
                            }
                        }

                        // Find notes based on depth
                        if (subfeature === 0) {
                            const note = LM_NOTES[store.state.stat.lm_maxDepth0.total - 1];
                            if (note !== undefined) {
                                store.dispatch('note/find', note);
                            }
                        }

                        // Speedrun stat
                        if (store.state.stat.lm_timeSpent.value <= 900 && subfeature === 0) {
                            store.commit('stat/increaseTo', {feature: 'lm', name: 'maxDepthSpeedrun', value: store.state.lm.depth + 1});
                        }

                        // Update dweller stat
                        store.dispatch('lm/updateDwellerStat');
                    }
                    if (
                        isLatest &&
                        store.getters['lm/depthHitsNeeded'](store.state.lm.depth + 1) <= (store.state.system.settings.automation.items.progressLm.value ?? 0)
                    ) {
                        awardLoot(breaks, loots, preHits);
                        store.commit('lm/updateKey', {key: 'depth', value: store.state.lm.depth + 1});
                        newDurability = store.getters['lm/currentDurability'];
                        store.dispatch('lm/applyBeaconEffects');
                    } else {
                        store.commit('stat/add', {feature: 'lm', name: 'totalDamage', value: secondsLeft * store.getters['lm/currentDamage']});
                        breaks += Math.floor(secondsLeft / store.getters['lm/hitsNeeded']);
                        loots += secondsLeft;
                        newDurability = store.getters['lm/currentDurability'] - store.getters['lm/currentDamage'] * (secondsLeft % store.getters['lm/hitsNeeded']);
                        awardLoot(breaks, loots, preHits + secondsLeft);
                        secondsLeft = 0;
                    }
                } else {
                    awardLoot(breaks, loots, preHits);
                }

                store.commit('lm/updateKey', {key: 'durability', value: newDurability});
            }
        } else {
            // Sulfur gain
            if (store.state.lm.depth >= LM_SULFUR_DEPTH && store.getters['lm/currentBreaks'] === 0) {
                store.dispatch('currency/gain', {feature: 'lm', name: 'sulfur', amount: store.getters['lm/rareDropFinal']('sulfur') * seconds});
            }
        }

        // Depth dweller
        if (store.state.unlock.lmDepthDweller.use) {
            const dwellerLimit = store.getters['lm/dwellerLimit'];
            const dwellerSpeed = store.getters['mult/get']('lmDepthDwellerSpeed') / dwellerLimit;
            let timeLeft = seconds;
            if (store.state.stat[`lm_depthDweller${subfeature}`].value < dwellerLimit) {
                // Regular dweller calculation
                const newDweller = Math.min(
                    LM_DWELLER_OVERFLOW + dwellerLimit -
                    (LM_DWELLER_OVERFLOW + dwellerLimit - store.state.stat[`lm_depthDweller${subfeature}`].value) *
                    Math.pow(1 - dwellerSpeed, seconds), dwellerLimit
                );
                if (newDweller >= dwellerLimit) {
                    store.commit('stat/increaseTo', {feature: 'lm', name: 'dwellerCapHit', value: 1});
                    timeLeft -= Math.ceil(store.getters['lm/timeUntilNext'](dwellerLimit));
                } else {
                    timeLeft = 0;
                }
                store.commit('stat/increaseTo', {feature: 'lm', name: 'depthDweller' + subfeature, value: newDweller});
                store.commit('stat/increaseTo', {feature: 'lm', name: 'depthDwellerCap' + subfeature, value: newDweller});
            }
            if (timeLeft > 0 && dwellerLimit > 0) {
                // Dweller overcap
                let newDweller = store.state.stat[`lm_depthDweller${subfeature}`].value;
                let dwellerProgress = dwellerSpeed * LM_DWELLER_OVERFLOW * timeLeft;
                while (dwellerProgress > 0) {
                    const breakpointCount = Math.floor(10 * (newDweller + 0.000000000001) / dwellerLimit) - 10;
                    const targetAmount = ((breakpointCount + 1) / 10) * dwellerLimit;
                    const progressMade = Math.min(dwellerProgress * Math.pow(LM_DWELLER_OVERCAP_MULT, breakpointCount + 1), targetAmount);
                    newDweller += progressMade;
                    dwellerProgress -= progressMade * Math.pow(1 / LM_DWELLER_OVERCAP_MULT, breakpointCount + 1);
                }
                store.commit('stat/increaseTo', {feature: 'lm', name: 'depthDweller' + subfeature, value: newDweller});
            }
        }
    };

const LM_GOOBOO = {
  name: 'lm',
  tickspeed: 1,
  unlockNeeded: null,
  unlock: ['lmPickaxeCrafting', 'lmDepthDweller', 'lmSmeltery', 'lmEnhancement', 'lmResin', 'lmGasSubfeature', 'lmSmoke', 'lmAdvancedCardPack', 'lmLuxuryCardPack'],
  stat: {
        maxDepth0: {value: 1, showInStatistics: true},
        maxDepth1: {value: 1, showInStatistics: true},
        depthDweller0: {},
        depthDwellerCap0: {showInStatistics: true},
        depthDweller1: {},
        depthDwellerCap1: {showInStatistics: true},
        totalDamage: {showInStatistics: true},
        maxDamage: {showInStatistics: true},
        craftingCount: {showInStatistics: true},
        craftingLuck: {value: 1},
        craftingWasted: {},
        dwellerCapHit: {},
        enhancementHighest: {},
        timeSpent: {display: 'time'},
        relicActivesUsed: {},
        bestPrestige0: {showInStatistics: true},
        bestPrestige1: {showInStatistics: true},
        prestigeCount: {showInStatistics: true},
        maxDepthSpeedrun: {value: 1}
    },
  mult: {
        lmDamage: {},
        lmToughness: {isPositive: false},
        lmOreGain: {},
        lmOreCap: {},
        lmRareEarthGain: {},
        lmGasGain: {display: 'percent'},
        lmPickaxeCraftingSlots: {round: true, baseValue: 1},
        lmPickaxePremiumCraftingSlots: {round: true},
        lmPickaxeCraftingPower: {},
        lmPickaxeCraftingQuality: {},
        lmOreQuality: {baseValue: 1},
        lmDepthDwellerSpeed: {baseValue: 0.000065},
        lmDepthDwellerMax: {display: 'percent', baseValue: 0.1, max: 0.5},
        lmResinMax: {round: true, baseValue: 1},

        lmPremiumOreCap: {},

        // Gas mults
        currencyLmHeliumLimit: {baseValue: 100},
        currencyLmHeliumIncrement: {display: 'percent'},
        currencyLmNeonLimit: {baseValue: 100},
        currencyLmNeonIncrement: {display: 'percent'},
        currencyLmArgonLimit: {baseValue: 100},
        currencyLmArgonIncrement: {display: 'percent'},
        currencyLmKryptonLimit: {baseValue: 100},
        currencyLmKryptonIncrement: {display: 'percent'},
        currencyLmXenonLimit: {baseValue: 100},
        currencyLmXenonIncrement: {display: 'percent'},
        currencyLmRadonLimit: {baseValue: 100},
        currencyLmRadonIncrement: {display: 'percent'},

        lmSmelteryTime: {display: 'timeMs', isPositive: false},
        lmSmelteryTemperature: {display: 'temperature', baseValue: 100},
        lmEnhancementMax: {display: 'int', round: true, baseValue: 3},
        lmPrestigeIncome: {group: ['currencyLmCrystalGreenGain', 'currencyLmCrystalYellowGain']}
    },
  multGroup: [
        {mult: 'lmOreGain', name: 'currencyGain', subtype: 'ore'},
        {mult: 'lmOreCap', name: 'currencyCap', subtype: 'ore'},
        {mult: 'lmRareEarthGain', name: 'currencyGain', subtype: 'rareEarth'},
        {mult: 'lmGasGain', name: 'currencyGain', subtype: 'gas'},
        {mult: 'lmPremiumOreCap', name: 'upgradeCap', subtype: 'premiumOre'},
    ],
  currency: {
        scrap: {color: 'brown', icon: 'mdi-dots-triangle', gainMult: {}, capMult: {baseValue: buildNum(10, 'K')}, gainTimerFunction() {
            const hitsNeeded = store.getters['lm/hitsNeeded'];
            return hitsNeeded === Infinity ? null : (((hitsNeeded + LM_SCRAP_BREAK) * store.getters['lm/currentScrap']) / hitsNeeded);
        }, timerIsEstimate: true},
        oreAluminium: {subtype: 'ore', color: 'blue-grey', icon: 'mdi-chart-bubble', gainMult: {}, capMult: {baseValue: 12, round: true}, gainTimerFunction() {
            const hitsNeeded = store.getters['lm/hitsNeeded'];
            const oreGain = store.getters['lm/currentOre'];
            return (hitsNeeded === Infinity || !oreGain.oreAluminium) ? null : (((hitsNeeded + LM_ORE_BREAK) * oreGain.oreAluminium.amount) / hitsNeeded);
        }, timerIsEstimate: true},
        oreCopper: {subtype: 'ore', color: 'orange', icon: 'mdi-chart-bubble', gainMult: {}, capMult: {baseValue: 4, round: true}, gainTimerFunction() {
            const hitsNeeded = store.getters['lm/hitsNeeded'];
            const oreGain = store.getters['lm/currentOre'];
            return (hitsNeeded === Infinity || !oreGain.oreCopper) ? null : (((hitsNeeded + LM_ORE_BREAK) * oreGain.oreCopper.amount) / hitsNeeded);
        }, timerIsEstimate: true},
        oreTin: {subtype: 'ore', color: 'grey', icon: 'mdi-chart-bubble', gainMult: {}, capMult: {baseValue: 2, round: true}, gainTimerFunction() {
            const hitsNeeded = store.getters['lm/hitsNeeded'];
            const oreGain = store.getters['lm/currentOre'];
            return (hitsNeeded === Infinity || !oreGain.oreTin) ? null : (((hitsNeeded + LM_ORE_BREAK) * oreGain.oreTin.amount) / hitsNeeded);
        }, timerIsEstimate: true},
        oreIron: {subtype: 'ore', color: 'deep-orange', icon: 'mdi-chart-bubble', gainMult: {}, capMult: {baseValue: 1, round: true}, gainTimerFunction() {
            const hitsNeeded = store.getters['lm/hitsNeeded'];
            const oreGain = store.getters['lm/currentOre'];
            return (hitsNeeded === Infinity || !oreGain.oreIron) ? null : (((hitsNeeded + LM_ORE_BREAK) * oreGain.oreIron.amount) / hitsNeeded);
        }, timerIsEstimate: true},
        oreTitanium: {subtype: 'ore', color: 'pale-light-green', icon: 'mdi-chart-bubble', gainMult: {}, capMult: {baseValue: 1, round: true}, gainTimerFunction() {
            const hitsNeeded = store.getters['lm/hitsNeeded'];
            const oreGain = store.getters['lm/currentOre'];
            return (hitsNeeded === Infinity || !oreGain.oreTitanium) ? null : (((hitsNeeded + LM_ORE_BREAK) * oreGain.oreTitanium.amount) / hitsNeeded);
        }, timerIsEstimate: true},
        orePlatinum: {subtype: 'ore', color: 'skyblue', icon: 'mdi-chart-bubble', gainMult: {}, capMult: {baseValue: 1, round: true}, gainTimerFunction() {
            const hitsNeeded = store.getters['lm/hitsNeeded'];
            const oreGain = store.getters['lm/currentOre'];
            return (hitsNeeded === Infinity || !oreGain.orePlatinum) ? null : (((hitsNeeded + LM_ORE_BREAK) * oreGain.orePlatinum.amount) / hitsNeeded);
        }, timerIsEstimate: true},
        oreIridium: {subtype: 'ore', color: 'pale-purple', icon: 'mdi-chart-bubble', gainMult: {}, capMult: {baseValue: 1, round: true}, gainTimerFunction() {
            const hitsNeeded = store.getters['lm/hitsNeeded'];
            const oreGain = store.getters['lm/currentOre'];
            return (hitsNeeded === Infinity || !oreGain.oreIridium) ? null : (((hitsNeeded + LM_ORE_BREAK) * oreGain.oreIridium.amount) / hitsNeeded);
        }, timerIsEstimate: true},
        oreOsmium: {subtype: 'ore', color: 'pale-green', icon: 'mdi-chart-bubble', gainMult: {}, capMult: {baseValue: 1, round: true}, gainTimerFunction() {
            const hitsNeeded = store.getters['lm/hitsNeeded'];
            const oreGain = store.getters['lm/currentOre'];
            return (hitsNeeded === Infinity || !oreGain.oreOsmium) ? null : (((hitsNeeded + LM_ORE_BREAK) * oreGain.oreOsmium.amount) / hitsNeeded);
        }, timerIsEstimate: true},
        oreLead: {subtype: 'ore', color: 'pale-blue', icon: 'mdi-chart-bubble', gainMult: {}, capMult: {baseValue: 1, round: true}, gainTimerFunction() {
            const hitsNeeded = store.getters['lm/hitsNeeded'];
            const oreGain = store.getters['lm/currentOre'];
            return (hitsNeeded === Infinity || !oreGain.oreLead) ? null : (((hitsNeeded + LM_ORE_BREAK) * oreGain.oreLead.amount) / hitsNeeded);
        }, timerIsEstimate: true},
        barAluminium: {subtype: 'bar', color: 'blue-grey', icon: 'mdi-gold', display: 'int'},
        barBronze: {subtype: 'bar', color: 'pale-orange', icon: 'mdi-gold', display: 'int'},
        barSteel: {subtype: 'bar', color: 'grey', icon: 'mdi-gold', display: 'int'},
        barTitanium: {subtype: 'bar', color: 'pale-green', icon: 'mdi-gold', display: 'int'},
        barShiny: {subtype: 'bar', color: 'pale-blue', icon: 'mdi-gold', display: 'int'},
        barIridium: {subtype: 'bar', color: 'pale-pink', icon: 'mdi-gold', display: 'int'},
        barDarkIron: {subtype: 'bar', color: 'darker-grey', icon: 'mdi-gold', display: 'int'},
        granite: {subtype: 'rareEarth', color: 'skyblue', icon: 'mdi-cube', showHint: true, gainMult: {}, gainTimerFunction() {
            const hitsNeeded = store.getters['lm/hitsNeeded'];
            const rareDropGain = store.getters['lm/rareDrops'];
            return (hitsNeeded === Infinity || !rareDropGain.granite) ? null : (((hitsNeeded + LM_RARE_DROP_BREAK) * rareDropGain.granite) / hitsNeeded);
        }, timerIsEstimate: true},
        salt: {subtype: 'rareEarth', color: 'lighter-grey', icon: 'mdi-shaker', gainMult: {}, gainTimerFunction() {
            const hitsNeeded = store.getters['lm/hitsNeeded'];
            const rareDropGain = store.getters['lm/rareDrops'];
            return (hitsNeeded === Infinity || !rareDropGain.salt) ? null : (((hitsNeeded + LM_RARE_DROP_BREAK) * rareDropGain.salt) / hitsNeeded);
        }, timerIsEstimate: true},
        coal: {color: 'dark-grey', icon: 'mdi-chart-bubble', gainMult: {round: true}, display: 'int'},
        sulfur: {subtype: 'rareEarth', color: 'pale-yellow', icon: 'mdi-fire-circle', gainMult: {}, gainTimerFunction() {
            return store.getters['lm/rareDrops'].sulfur ?? null;
        }, timerIsEstimate: true},
        niter: {color: 'pale-light-green', icon: 'mdi-water-circle', gainMult: {}},
        obsidian: {subtype: 'rareEarth', color: 'deep-purple', icon: 'mdi-cone', showHint: true, gainMult: {}, gainTimerFunction() {
            const hitsNeeded = store.getters['lm/hitsNeeded'];
            const rareDropGain = store.getters['lm/rareDrops'];
            return (hitsNeeded === Infinity || !rareDropGain.obsidian) ? null : (((hitsNeeded + LM_RARE_DROP_BREAK) * rareDropGain.obsidian) / hitsNeeded);
        }, timerIsEstimate: true},
        deeprock: {subtype: 'rareEarth', color: 'darker-grey', icon: 'mdi-gamepad-circle', gainMult: {}, gainTimerFunction() {
            const hitsNeeded = store.getters['lm/hitsNeeded'];
            const rareDropGain = store.getters['lm/rareDrops'];
            return (hitsNeeded === Infinity || !rareDropGain.deeprock) ? null : (((hitsNeeded + LM_RARE_DROP_BREAK) * rareDropGain.deeprock) / hitsNeeded);
        }, timerIsEstimate: true},
        glowshard: {color: 'cyan', icon: 'mdi-lightbulb-fluorescent-tube', gainMult: {}},
        smoke: {subtype: 'ore', color: 'grey', icon: 'mdi-smoke', gainMult: {}, capMult: {baseValue: 10}, overcapScaling: 0.25, gainTimerFunction() {
            const hitsNeeded = store.getters['lm/hitsNeeded'];
            return hitsNeeded === Infinity ? null : (((hitsNeeded + LM_SMOKE_BREAK) * store.getters['lm/currentSmoke']) / hitsNeeded);
        }, timerIsEstimate: true},
        ember: {type: 'prestige', color: 'orange-red', icon: 'mdi-fire', display: 'int', overcapMult: 1, overcapScaling: 0, gainMult: {display: 'percent'}, capMult: {baseValue: 100}, currencyMult: {
            lmSmelteryTime: {type: 'mult', value: val => 1 / (val * 0.02 + 1)}
        }},
        resin: {type: 'prestige', color: 'orange', icon: 'mdi-water', gainMult: {baseValue: 0.0001, display: 'perSecond'}, showGainMult: true, showGainTimer: true, capMult: {baseValue: 5}},
        crystalGreen: {type: 'prestige', alwaysVisible: true, color: 'light-green', icon: 'mdi-star-three-points', gainMult: {}},
        helium: {type: 'prestige', subtype: 'gas', color: 'pale-blue', icon: 'mdi-gas-cylinder', gainMult: {display: 'percent', baseValue: 0.01}, currencyMult: {
            currencyLmScrapCap: {type: 'mult', value: val => val * 0.01 + 1}
        }},
        neon: {type: 'prestige', subtype: 'gas', color: 'orange-red', icon: 'mdi-gas-cylinder', gainMult: {display: 'percent', baseValue: 0.01}, currencyMult: {
            lmPickaxeCraftingPower: {type: 'mult', value: val => Math.pow(val * 0.01 + 1, 0.9)}
        }},
        argon: {type: 'prestige', subtype: 'gas', color: 'pink-purple', icon: 'mdi-gas-cylinder', gainMult: {display: 'percent', baseValue: 0.01}, currencyMult: {
            currencyLmScrapGain: {type: 'mult', value: val => Math.pow(val * 0.01 + 1, 0.8)}
        }},
        krypton: {type: 'prestige', subtype: 'gas', color: 'light-blue', icon: 'mdi-gas-cylinder', gainMult: {display: 'percent', baseValue: 0.01}, currencyMult: {
            lmRareEarthGain: {type: 'mult', value: val => Math.pow(val * 0.01 + 1, 0.7)}
        }},
        xenon: {type: 'prestige', subtype: 'gas', color: 'blue', icon: 'mdi-gas-cylinder', gainMult: {display: 'percent', baseValue: 0.01}},
        radon: {type: 'prestige', subtype: 'gas', color: 'light-green', icon: 'mdi-gas-cylinder', gainMult: {display: 'percent', baseValue: 0.01}},
        limestone: {subtype: 'rareEarth', color: 'pale-yellow', icon: 'mdi-zip-box', gainMult: {}, gainTimerFunction() {
            const hitsNeeded = store.getters['lm/hitsNeeded'];
            const rareDropGain = store.getters['lm/rareDrops'];
            return (hitsNeeded === Infinity || !rareDropGain.limestone) ? null : (((hitsNeeded + LM_RARE_DROP_BREAK) * rareDropGain.limestone) / hitsNeeded);
        }, timerIsEstimate: true},
        moonshard: {subtype: 'rareEarth', color: 'light-blue', icon: 'mdi-moon-waning-crescent', showHint: true, gainMult: {}, gainTimerFunction() {
            const hitsNeeded = store.getters['lm/hitsNeeded'];
            const rareDropGain = store.getters['lm/rareDrops'];
            return (hitsNeeded === Infinity || !rareDropGain.moonshard) ? null : (((hitsNeeded + LM_RARE_DROP_BREAK) * rareDropGain.moonshard) / hitsNeeded);
        }, timerIsEstimate: true},
        phosphorus: {subtype: 'rareEarth', color: 'red', icon: 'mdi-pyramid', gainMult: {}, gainTimerFunction() {
            const hitsNeeded = store.getters['lm/hitsNeeded'];
            const rareDropGain = store.getters['lm/rareDrops'];
            return (hitsNeeded === Infinity || !rareDropGain.phosphorus) ? null : (((hitsNeeded + LM_RARE_DROP_BREAK) * rareDropGain.phosphorus) / hitsNeeded);
        }, timerIsEstimate: true},
        crystalYellow: {type: 'prestige', alwaysVisible: true, color: 'yellow', icon: 'mdi-star-four-points', gainMult: {}}
    },
};
