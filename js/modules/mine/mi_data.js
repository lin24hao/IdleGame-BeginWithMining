/* ============================================================
 * mi_data.js —— 炼器矿脉(mining) 数据（自动生成：照抄 gooboo，勿手改数值）
 *   ore/smeltery/enhancement/beacon/relic/achievement/upgrade(+2/Prestige/Premium)
 *   + mult/multGroup/unlock/stat/currency/consumable/note（来自 modules/mining.js）
 * 仅机械变换：import/export 剥离；`store` 改写为 `MISTORE`。
 * ============================================================ */

const MI_ORE = {
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
    }
};
const MI_SMELTERY = {
    aluminium: {
        price(lvl) {
            return {
                mining_oreAluminium: Math.pow(MINING_SMELTERY_ORE_INCREMENT, lvl) * 1000,
                mining_granite: Math.pow(1.1, lvl) * 7500,
            };
        },
        output: 'mining_barAluminium',
        timeNeeded: 300,
        minTemperature: 100
    },
    bronze: {
        price(lvl) {
            return {
                mining_oreCopper: Math.pow(MINING_SMELTERY_ORE_INCREMENT, lvl) * 900,
                mining_oreTin: Math.pow(MINING_SMELTERY_ORE_INCREMENT, lvl) * 100,
                mining_salt: Math.pow(1.06, lvl) * 800,
            };
        },
        output: 'mining_barBronze',
        timeNeeded: SECONDS_PER_HOUR,
        minTemperature: 275
    },
    steel: {
        price(lvl) {
            return {
                mining_oreIron: Math.pow(MINING_SMELTERY_ORE_INCREMENT, lvl) * 1000,
                mining_coal: 5,
            };
        },
        output: 'mining_barSteel',
        timeNeeded: 8 * SECONDS_PER_HOUR,
        minTemperature: 500
    },
    titanium: {
        price(lvl) {
            return {
                mining_oreTitanium: Math.pow(MINING_SMELTERY_ORE_INCREMENT, lvl) * 1000,
                mining_sulfur: Math.pow(1.06, lvl) * 200,
                mining_niter: 100,
            };
        },
        output: 'mining_barTitanium',
        timeNeeded: 3 * SECONDS_PER_DAY,
        minTemperature: 800
    },
    shiny: {
        price(lvl) {
            return {
                mining_orePlatinum: Math.pow(MINING_SMELTERY_ORE_INCREMENT, lvl) * 1000,
                mining_obsidian: Math.pow(1.1, lvl) * 2e6,
            };
        },
        output: 'mining_barShiny',
        timeNeeded: 30 * SECONDS_PER_DAY,
        minTemperature: 1250
    },
    iridium: {
        price(lvl) {
            return {
                mining_oreIridium: Math.pow(MINING_SMELTERY_ORE_INCREMENT, lvl) * 1000,
                mining_helium: Math.pow(1.1, lvl) * 1e4,
            };
        },
        output: 'mining_barIridium',
        timeNeeded: SECONDS_PER_YEAR,
        minTemperature: 2000
    },
    darkIron: {
        price(lvl) {
            return {
                mining_oreIron: Math.pow(MINING_SMELTERY_ORE_INCREMENT, lvl) * 1e7,
                mining_oreOsmium: Math.pow(MINING_SMELTERY_ORE_INCREMENT, lvl) * 1000,
                mining_deeprock: Math.pow(1.1, lvl) * 1e8,
                mining_neon: Math.pow(1.1, lvl) * 1e4,
            };
        },
        output: 'mining_barDarkIron',
        timeNeeded: 15 * SECONDS_PER_YEAR,
        minTemperature: 3000
    },
};
const MI_ENHANCEMENT = {
    barAluminium: {
        effect: [
            {name: 'miningPickaxeCraftingQuality', type: 'mult', value: lvl => lvl * 0.5 + 1},
            {name: 'miningOreQuality', type: 'mult', value: lvl => Math.pow(2, lvl)}
        ]
    },
    barBronze: {
        effect: [
            {name: 'miningOreGain', type: 'mult', value: lvl => Math.pow(1.1, lvl) * (lvl * 0.1 + 1)},
            {name: 'miningRareEarthGain', type: 'mult', value: lvl => Math.pow(1.15, lvl) * (lvl * 0.15 + 1)}
        ]
    },
    barSteel: {
        effect: [
            {name: 'miningDamage', type: 'mult', value: lvl => lvl * 0.08 + 1},
            {name: 'miningToughness', type: 'mult', value: lvl => Math.pow(1 / 1.35, lvl)}
        ]
    },
    barTitanium: {
        effect: [
            {name: 'currencyMiningScrapGain', type: 'mult', value: lvl => getSequence(2, lvl) * 0.1 + 1}
        ]
    },
    barShiny: {
        effect: [
            {name: 'miningDepthDwellerSpeed', type: 'mult', value: lvl => lvl * 0.1 + 1},
            {name: 'currencyMiningCrystalGreenGain', type: 'mult', value: lvl => lvl * 0.1 + 1}
        ]
    },
    barIridium: {
        effect: [
            {name: 'currencyMiningEmberGain', type: 'mult', value: lvl => lvl * 0.3 + 1}
        ]
    },
    barDarkIron: {
        effect: [
            {name: 'currencyMiningScrapCap', type: 'mult', value: lvl => getSequence(2, lvl) * 0.15 + 1}
        ]
    }
};
const MI_BEACON = {
    piercing: {
        color: 'purple',
        ownedMult: 'miningBeaconPiercing',
        effect: [
            {name: 'miningToughness', type: 'mult', value: lvl => 1 / (lvl * 0.25 + 5)}
        ]
    },
    rich: {
        color: 'orange',
        ownedMult: 'miningBeaconRich',
        effect: [
            {name: 'miningOreGain', type: 'mult', value: lvl => lvl * 0.05 + 2}
        ]
    },
    wonder: {
        color: 'blue',
        ownedMult: 'miningBeaconWonder',
        effect: [
            {name: 'miningRareEarthGain', type: 'mult', value: lvl => lvl * 0.04 + 1.6}
        ]
    },
    hope: {
        color: 'green',
        ownedMult: 'miningBeaconHope',
        range: 5,
        effect: [
            {name: 'miningDamage', type: 'mult', value: lvl => lvl * 0.01 + 1.1},
            {name: 'currencyMiningScrapGain', type: 'mult', value: lvl => lvl * 0.015 + 1.2}
        ]
    }
};
const MI_RELIC = {
    friendlyBat: {icon: 'mdi-bat', color: 'dark-grey', effect() {return [
        {name: 'currencyMiningScrapGain', type: 'mult', value: 1.25}
    ];}, glyph() {return {dust: 1, clay: 3};}, active: {
        cost: {relic_power: 8},
        feature: 'mining',
        params() {
            const maxPart = Math.pow(MISTORE.state.stat.mining_scrapMax.total, 0.5);
            const timePart = MISTORE.getters['mining/depthScrap'](MISTORE.state.stat[`mining_maxDepth${MISTORE.state.system.features.mining.currentSubfeature}`].value) * 1200;
            return [maxPart, timePart, maxPart + timePart];
        },
        description(params) {
            return [formatNum(params[2])];
        },
        formula(params) {
            return [formatNum(params[0]), formatNum(params[1])];
        },
        disabled() {
            return MISTORE.state.system.features.mining.currentSubfeature !== 0 || MISTORE.state.cryolab.mining.active;
        },
        trigger(params) {
            MISTORE.dispatch('currency/gain', {feature: 'mining', name: 'scrap', amount: params[2]});
        }
    }},
    honeyPot: {icon: 'mdi-pot', color: 'amber', effect() {return [
        {name: 'miningResinMax', type: 'base', value: 1}
    ];}, glyph() {return {clay: 2, heat: 4};}, active: {
        cost: {relic_power: 10},
        feature: 'mining',
        params() {
            return [MISTORE.state.currency.mining_resin.cap];
        },
        description() {
            return [];
        },
        formula(params) {
            return [formatNum(params[0])];
        },
        disabled() {
            return MISTORE.state.system.features.mining.currentSubfeature !== 0 || MISTORE.state.cryolab.mining.active;
        },
        trigger(params) {
            MISTORE.dispatch('currency/gain', {feature: 'mining', name: 'resin', amount: params[0]});
        }
    }},
};
const MI_ACHIEVEMENT = {
    maxDepth0: {value: () => MISTORE.state.stat.mining_maxDepth0.total, default: 1, milestones: lvl => lvl * 25 + 25},
    maxDepth1: {value: () => MISTORE.state.stat.mining_maxDepth1.total, default: 1, milestones: lvl => lvl > 0 ? (lvl * 20) : 10},
    maxDepthSpeedrun: {value: () => MISTORE.state.stat.mining_maxDepthSpeedrun.total, default: 1, cap: 10, milestones: lvl => lvl > 0 ? (lvl * 10 + 10) : 15, reward: {
        1: [{name: 'mining_depthDweller', type: 'keepUpgrade', value: true}],
        2: [{name: 'mining_compressor', type: 'keepUpgrade', value: true}],
        3: [{name: 'mining_oreSlots', type: 'keepUpgrade', value: true}],
        5: [{name: 'mining_graniteHardening', type: 'keepUpgrade', value: true}],
        9: [{name: 'mining_oreWashing', type: 'keepUpgrade', value: true}],
    }},
    maxDamage: {value: () => MISTORE.state.stat.mining_maxDamage.total, milestones: lvl => Math.pow(buildNum(80, 'K'), lvl) * buildNum(10, 'K'), reward: {
        3: [{name: 'mining_hullbreaker', type: 'keepUpgrade', value: true}],
        6: [{name: 'mining_bronzeCache', type: 'keepUpgrade', value: true}],
    }},
    scrap: {value: () => MISTORE.state.stat.mining_scrap.total, milestones: lvl => Math.pow(8000, lvl) * buildNum(5, 'M'), reward: {
        3: [{name: 'mining_aluminiumExpansion', type: 'keepUpgrade', value: true}, {name: 'mining_copperExpansion', type: 'keepUpgrade', value: true}],
        4: [{name: 'mining_tinCache', type: 'keepUpgrade', value: true}],
    }},
    oreTotal: {value: () => [
        MISTORE.state.stat.mining_oreAluminium.total,
        MISTORE.state.stat.mining_oreCopper.total,
        MISTORE.state.stat.mining_oreTin.total,
        MISTORE.state.stat.mining_oreIron.total,
        MISTORE.state.stat.mining_oreTitanium.total,
        MISTORE.state.stat.mining_orePlatinum.total,
        MISTORE.state.stat.mining_oreIridium.total,
        MISTORE.state.stat.mining_oreOsmium.total,
        MISTORE.state.stat.mining_oreLead.total,
    ].reduce((a, b) => a + b, 0), milestones: lvl => Math.pow(10, lvl) * 100, reward: {
        2: [{name: 'mining_aluminiumCache', type: 'keepUpgrade', value: true}, {name: 'mining_aluminiumHardening', type: 'keepUpgrade', value: true}],
        3: [{name: 'mining_copperCache', type: 'keepUpgrade', value: true}],
        4: [{name: 'mining_aluminiumTanks', type: 'keepUpgrade', value: true}, {name: 'mining_aluminiumAnvil', type: 'keepUpgrade', value: true}],
        5: [{name: 'mining_magnet', type: 'keepUpgrade', value: true}, {name: 'mining_warehouse', type: 'keepUpgrade', value: true}],
        6: [{name: 'mining_titaniumExpansion', type: 'keepUpgrade', value: true}, {name: 'mining_titaniumCache', type: 'keepUpgrade', value: true}],
    }},
    oreVariety: {value: () => [
        // Ore
        MISTORE.state.stat.mining_oreAluminium.total,
        MISTORE.state.stat.mining_oreCopper.total,
        MISTORE.state.stat.mining_oreTin.total,
        MISTORE.state.stat.mining_oreIron.total,
        MISTORE.state.stat.mining_oreTitanium.total,
        MISTORE.state.stat.mining_orePlatinum.total,
        MISTORE.state.stat.mining_oreIridium.total,
        MISTORE.state.stat.mining_oreOsmium.total,
        MISTORE.state.stat.mining_oreLead.total,

        // Rare earth
        MISTORE.state.stat.mining_granite.total,
        MISTORE.state.stat.mining_salt.total,
        MISTORE.state.stat.mining_coal.total,
        MISTORE.state.stat.mining_sulfur.total,
        MISTORE.state.stat.mining_niter.total,
        MISTORE.state.stat.mining_obsidian.total,
        MISTORE.state.stat.mining_deeprock.total,
        MISTORE.state.stat.mining_glowshard.total,
        MISTORE.state.stat.mining_limestone.total,
        MISTORE.state.stat.mining_moonshard.total,
        MISTORE.state.stat.mining_phosphorus.total,

        // Gasses
        MISTORE.state.stat.mining_helium.total,
        MISTORE.state.stat.mining_neon.total,
        MISTORE.state.stat.mining_argon.total,
        MISTORE.state.stat.mining_krypton.total,
        MISTORE.state.stat.mining_xenon.total,
        MISTORE.state.stat.mining_radon.total,
    ].reduce((a, b) => a + (b > 0 ? 1 : 0), 0), milestones: lvl => splicedLinear(1, 2, 8, lvl) + 2, reward: {
        1: [{name: 'mining_copperTanks', type: 'keepUpgrade', value: true}],
        3: [{name: 'mining_refinery', type: 'keepUpgrade', value: true}],
        5: [
            {name: 'mining_ironExpansion', type: 'keepUpgrade', value: true},
            {name: 'mining_ironHardening', type: 'keepUpgrade', value: true},
            {name: 'mining_ironFilter', type: 'keepUpgrade', value: true},
        ],
    }, descriptionCustom() {
        return MISTORE.state.unlock.miningGasSubfeature.see ? 2 : MISTORE.state.stat.mining_maxDepth0.total >= 50 ? 1 : 0;
    }},
    depthDwellerCap0: {value: () => MISTORE.state.stat.mining_depthDwellerCap0.total, cap: 10, milestones: lvl => lvl * 10 + (lvl === 0 ? 5 : 0), reward: {
        0: [{name: 'mining_craftingStation', type: 'keepUpgrade', value: true}],
        9: [{name: 'mining_drillFuel', type: 'keepUpgrade', value: true}],
    }},
    depthDwellerCap1: {value: () => MISTORE.state.stat.mining_depthDwellerCap1.total, cap: 10, milestones: lvl => lvl * 10 + (lvl === 0 ? 5 : 0)},
    coal: {value: () => MISTORE.state.stat.mining_coal.total, milestones: lvl => Math.pow(2.5, lvl) * 100, reward: {
        2: [{name: 'mining_furnace', type: 'keepUpgrade', value: true}],
    }},
    enhancementHighest: {value: () => MISTORE.state.stat.mining_enhancementHighest.total, cap: 5, milestones: lvl => (lvl + 1) * 2},
    resin: {value: () => MISTORE.state.stat.mining_resin.total, milestones: lvl => Math.pow(2, lvl) * 50, relic: {3: 'honeyPot'}},
    gasTotal: {value: () => [
        MISTORE.state.stat.mining_heliumMax.total,
        MISTORE.state.stat.mining_neonMax.total,
        MISTORE.state.stat.mining_argonMax.total,
        MISTORE.state.stat.mining_kryptonMax.total,
        MISTORE.state.stat.mining_xenonMax.total,
        MISTORE.state.stat.mining_radonMax.total,
    ].reduce((a, b) => a + (b < 1 ? 0 : Math.floor(Math.log10(b))), 0), milestones: lvl => (lvl + 1) * 4},
    smoke: {value: () => MISTORE.state.stat.mining_smokeMax.total, milestones: lvl => Math.pow(64, lvl) * 100},
    craftingWasted: {value: () => MISTORE.state.stat.mining_craftingWasted.total, secret: true, display: 'boolean', cap: 1, milestones: () => 1},
    dwellerCapHit: {value: () => MISTORE.state.stat.mining_dwellerCapHit.total, secret: true, display: 'boolean', cap: 1, milestones: () => 1},
    craftingLuck: {value: () => MISTORE.state.stat.mining_craftingLuck.total, default: 1, secret: true, cap: 1, milestones: () => buildNum(1, 'M')},
};
const requirementStat = 'mining_maxDepth0';
const requirementBase = () => store.state.stat[requirementStat].total;
const MI_UPG1 = {
    damageUp: {price(lvl) {
        return {mining_scrap: Math.pow(lvl * 0.012 + 1.24, lvl) * 120};
    }, effect: [
        {name: 'miningDamage', type: 'mult', value: lvl => Math.pow(1.12, lvl) * Math.pow(lvl * 0.2 + 1, 2)}
    ]},
    scrapGainUp: {requirementBase, requirementStat, requirementValue: 5, price(lvl) {
        return {mining_scrap: Math.pow(lvl * 0.1 + 2.5, lvl) * 1250};
    }, effect: [
        {name: 'currencyMiningScrapGain', type: 'mult', value: lvl => Math.pow(1.2, lvl)}
    ]},
    scrapCapacityUp: {cap: 50, requirementBase, requirementStat, requirementValue: 10, price(lvl) {
        return {mining_scrap: Math.pow(3.3, lvl) * 3000};
    }, effect: [
        {name: 'currencyMiningScrapCap', type: 'mult', value: lvl => Math.pow(3, lvl)}
    ]},
    aluminiumCache: {cap: 10, requirementBase, requirementStat, requirementValue: 15, price(lvl) {
        return {mining_oreAluminium: Math.round(3 * (lvl + 1))};
    }, effect: [
        {name: 'currencyMiningScrapCap', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
        {name: 'currencyMiningOreAluminiumCap', type: 'base', value: lvl => 2 * lvl}
    ]},
    aluminiumHardening: {cap: 6, requirementBase, requirementStat, requirementValue: 15, price(lvl) {
        return {mining_oreAluminium: 4 * lvl + 2};
    }, effect: [
        {name: 'miningDamage', type: 'mult', value: lvl => (lvl + 1) * Math.pow(1.5, Math.min(6, lvl))}
    ]},
    craftingStation: {cap: 1, hasDescription: true, requirementBase, requirementStat, requirementValue: 20, price() {
        return {mining_scrap: 1.8e6};
    }, effect: [
        {name: 'miningPickaxeCrafting', type: 'unlock', value: lvl => lvl >= 1}
    ]},
    forge: {requirement() {
        return MISTORE.state.unlock.miningPickaxeCrafting.use;
    }, price(lvl) {
        return {mining_scrap: Math.pow(1.35, lvl) * 2.5e6};
    }, effect: [
        {name: 'miningPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.2, lvl)}
    ]},
    oreSlots: {cap: 10, hideCap: true, requirementBase, requirementStat, requirementValue: 25, requirement(lvl) {
        return MISTORE.state.stat.mining_maxDepth0.total >= [25, 25, 30, 50, 80, 120, 175, 260, 350, 450][lvl];
    }, price(lvl) {
        return [
            {mining_oreAluminium: 10},
            {mining_oreAluminium: 30},
            {mining_oreCopper: 20},
            {mining_oreTin: 15},
            {mining_oreIron: 12},
            {mining_oreTitanium: 10},
            {mining_orePlatinum: 8},
            {mining_oreIridium: 6},
            {mining_oreOsmium: 5},
            {mining_oreLead: 4}
        ][lvl];
    }, effect: [
        {name: 'miningPickaxeCraftingSlots', type: 'base', value: lvl => lvl}
    ]},
    compressor: {cap: 9, hasDescription: true, hideCap: true, requirementBase, requirementStat, requirementValue: 25, requirement(lvl) {
        return MISTORE.state.stat.mining_maxDepth0.total >= [25, 35, 60, 95, 140, 200, 280, 375, 480][lvl];
    }, price(lvl) {
        return [
            {mining_oreAluminium: 20},
            {mining_oreAluminium: 80},
            {mining_oreAluminium: 1e4},
            {mining_oreAluminium: 3e4},
            {mining_oreAluminium: 5e5},
            {mining_oreAluminium: 1e7},
            {mining_oreAluminium: 3e8},
            {mining_oreAluminium: 1e10},
            {mining_oreAluminium: 1e12}
        ][lvl];
    }, effect: [
        {name: 'miningCompressAluminium', type: 'unlock', value: lvl => lvl >= 1},
        {name: 'miningCompressCopper', type: 'unlock', value: lvl => lvl >= 2},
        {name: 'miningCompressTin', type: 'unlock', value: lvl => lvl >= 3},
        {name: 'miningCompressIron', type: 'unlock', value: lvl => lvl >= 4},
        {name: 'miningCompressTitanium', type: 'unlock', value: lvl => lvl >= 5},
        {name: 'miningCompressPlatinum', type: 'unlock', value: lvl => lvl >= 6},
        {name: 'miningCompressIridium', type: 'unlock', value: lvl => lvl >= 7},
        {name: 'miningCompressOsmium', type: 'unlock', value: lvl => lvl >= 8},
        {name: 'miningCompressLead', type: 'unlock', value: lvl => lvl >= 9}
    ]},
    copperCache: {cap: 8, requirementBase, requirementStat, requirementValue: 30, price(lvl) {
        return {mining_oreCopper: Math.round(lvl + 3)};
    }, effect: [
        {name: 'currencyMiningOreAluminiumCap', type: 'base', value: lvl => 2 * lvl},
        {name: 'currencyMiningOreCopperCap', type: 'base', value: lvl => lvl}
    ]},
    aluminiumTanks: {cap: 8, requirementBase, requirementStat, requirementValue: 30, price(lvl) {
        return {mining_scrap: Math.pow(4.75, lvl) * 4e7};
    }, effect: [
        {name: 'currencyMiningOreAluminiumCap', type: 'base', value: lvl => Math.round(Math.pow(lvl, 1.2) * Math.pow(1.1, lvl) * 5)}
    ]},
    aluminiumAnvil: {cap: 10, requirementBase, requirementStat, requirementValue: 30, price(lvl) {
        return {mining_oreAluminium: Math.ceil(Math.pow(1.1, lvl) * (lvl + 1) * 10)};
    }, effect: [
        {name: 'miningPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.15, lvl)}
    ]},
    hullbreaker: {cap: 10, requirementBase, requirementStat, requirementValue: 35, price(lvl) {
        return {mining_scrap: Math.pow(1.8, lvl) * 5.5e8};
    }, effect: [
        {name: 'miningDamage', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
        {name: 'miningToughness', type: 'mult', value: lvl => Math.pow(1 / 1.3, lvl)}
    ]},
    copperTanks: {cap: 5, requirementBase, requirementStat, requirementValue: 40, price(lvl) {
        return {mining_scrap: Math.pow(2.3, lvl) * 3.5e9};
    }, effect: [
        {name: 'currencyMiningOreAluminiumCap', type: 'mult', value: lvl => Math.pow(1.4, lvl)},
        {name: 'currencyMiningOreCopperCap', type: 'base', value: lvl => 4 * lvl}
    ]},
    depthDweller: {cap: 1, hasDescription: true, requirementBase, requirementStat, requirementValue: 40, price() {
        return {mining_oreCopper: 24};
    }, effect: [
        {name: 'miningDepthDweller', type: 'unlock', value: lvl => lvl >= 1}
    ]},
    aluminiumExpansion: {cap: 5, requirementBase, requirementStat, requirementValue: 45, price(lvl) {
        return {mining_oreAluminium: Math.pow(2.25, lvl) * 150};
    }, effect: [
        {name: 'miningDamage', type: 'mult', value: lvl => Math.pow(1.15, lvl)},
        {name: 'currencyMiningOreAluminiumCap', type: 'mult', value: lvl => Math.pow(1.5, lvl)}
    ]},
    refinery: {cap: 5, requirementBase, requirementStat, requirementValue: 45, price(lvl) {
        return {mining_oreCopper: 10 * lvl + 30};
    }, effect: [
        {name: 'miningOreGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'currencyMiningOreCopperCap', type: 'base', value: lvl => 12 * lvl}
    ]},
    copperExpansion: {cap: 3, requirementBase, requirementStat, requirementValue: 50, price(lvl) {
        return {mining_scrap: Math.pow(4.2, lvl) * 9e10};
    }, effect: [
        {name: 'miningDamage', type: 'mult', value: lvl => Math.pow(1.25, lvl)},
        {name: 'currencyMiningOreCopperCap', type: 'mult', value: lvl => Math.pow(1.5, lvl)}
    ]},
    drillFuel: {cap: 30, requirementBase, requirementStat, requirementValue: 50, price(lvl) {
        return {mining_scrap: Math.pow(lvl * 0.1 + 2.4, lvl) * 3.5e10};
    }, effect: [
        {name: 'miningDepthDwellerSpeed', type: 'mult', value: lvl => Math.pow(1.02, lvl) * (lvl * 0.05 + 1)}
    ]},
    graniteHardening: {cap: 6, requirementBase, requirementStat, requirementValue: 55, price(lvl) {
        return {mining_granite: Math.pow(2.5, lvl) * 1600, mining_oreTin: lvl + 2};
    }, effect: [
        {name: 'miningDamage', type: 'mult', value: lvl => Math.pow(1.3, lvl)}
    ]},
    smeltery: {cap: 1, hasDescription: true, persistent: true, note: 'mining_18', requirementBase, requirementStat, requirementValue: 60, price() {
        return {mining_granite: 5e4};
    }, effect: [
        {name: 'miningSmeltery', type: 'unlock', value: lvl => lvl >= 1}
    ]},
    oreShelf: {cap: 4, capMult: true, requirementBase, requirementStat, requirementValue: 60, price(lvl) {
        return {mining_barAluminium: 5 * Math.pow(2, Math.max(0, lvl - 3))};
    }, effect: [
        {name: 'miningOreCap', type: 'base', value: lvl => lvl}
    ]},
    heatShield: {requirementBase, requirementStat, requirementValue: 62, price(lvl) {
        return {mining_granite: Math.pow(1.55, lvl) * 2e4};
    }, effect: [
        {name: 'miningSmelteryTemperature', type: 'base', value: lvl => lvl * 15}
    ]},
    tinCache: {cap: 4, requirementBase, requirementStat, requirementValue: 65, price(lvl) {
        return {mining_scrap: Math.pow(5.75, lvl) * buildNum(25, 'T'), mining_oreTin: lvl * 2 + 1};
    }, effect: [
        {name: 'currencyMiningOreCopperCap', type: 'base', value: lvl => lvl * 24},
        {name: 'currencyMiningOreTinCap', type: 'base', value: lvl => lvl}
    ]},
    furnace: {cap: 25, requirementBase, requirementStat, requirementValue: 70, price(lvl) {
        let obj = {mining_scrap: Math.pow(1.3, lvl) * buildNum(70, 'T'), mining_oreTin: Math.floor(lvl * 0.2 * Math.pow(1.15, lvl) + 2)};
        if (lvl >= 5) {
            obj.mining_salt = Math.pow(1.45, lvl - 5) * 60;
        }
        return obj;
    }, effect: [
        {name: 'miningPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
        {name: 'miningOreGain', type: 'mult', value: lvl => lvl * 0.04 + 1}
    ]},
    bronzeCache: {cap: 4, requirementBase, requirementStat, requirementValue: 75, price(lvl) {
        return {mining_salt: Math.pow(4, lvl) * 175, mining_oreAluminium: Math.pow(2.25, lvl) * 3000};
    }, effect: [
        {name: 'currencyMiningOreCopperCap', type: 'mult', value: lvl => Math.pow(1.5, lvl)},
        {name: 'currencyMiningOreTinCap', type: 'mult', value: lvl => Math.pow(1.5, lvl)}
    ]},
    ironCache: {cap: 5, capMult: true, requirementBase, requirementStat, requirementValue: 80, price(lvl) {
        return {mining_barAluminium: 12 * Math.pow(2, Math.max(0, lvl - 4))};
    }, effect: [
        {name: 'miningOreQuality', type: 'mult', value: lvl => lvl * 0.2 + 1},
        {name: 'currencyMiningOreIronCap', type: 'base', value: lvl => lvl * 2}
    ]},
    oreWashing: {cap: 15, requirementBase, requirementStat, requirementValue: 82, price(lvl) {
        return {mining_scrap: Math.pow(1.35, lvl) * buildNum(16.5, 'Qa')};
    }, effect: [
        {name: 'miningPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.1, lvl)}
    ]},
    ironExpansion: {cap: 3, requirementBase, requirementStat, requirementValue: 85, price(lvl) {
        return {mining_oreIron: lvl * 3 + 2};
    }, effect: [
        {name: 'currencyMiningOreTinCap', type: 'mult', value: lvl => Math.pow(1.5, lvl)},
        {name: 'currencyMiningOreIronCap', type: 'base', value: lvl => lvl}
    ]},
    bronzeDrill: {cap: 5, capMult: true, requirementBase, requirementStat, requirementValue: 87, price(lvl) {
        return {mining_barBronze: 5 * Math.pow(2, Math.max(0, lvl - 4))};
    }, effect: [
        {name: 'miningOreGain', type: 'mult', value: lvl => lvl * 0.08 + 1}
    ]},
    ironHardening: {cap: 12, requirementBase, requirementStat, requirementValue: 90, price(lvl) {
        return {mining_oreIron: Math.floor(Math.pow(1.35, lvl) + 1)};
    }, effect: [
        {name: 'miningDamage', type: 'mult', value: lvl => Math.pow(1.15, lvl)},
        {name: 'currencyMiningOreTinCap', type: 'base', value: lvl => lvl * 2}
    ]},
    ironFilter: {cap: 8, requirementBase, requirementStat, requirementValue: 95, price(lvl) {
        return {mining_oreIron: Math.floor(Math.pow(1.85, lvl) * 5)};
    }, effect: [
        {name: 'currencyMiningOreAluminiumCap', type: 'base', value: lvl => lvl * 36}
    ]},
    masterForge: {requirementBase, requirementStat, requirementValue: 98, price(lvl) {
        return {mining_coal: lvl * 20 + 80};
    }, effect: [
        {name: 'miningDamage', type: 'mult', value: lvl => Math.pow(1.12, lvl)},
        {name: 'miningToughness', type: 'mult', value: lvl => Math.pow(1 / 1.1, lvl)},
    ]},
    starForge: {requirementBase, requirementStat, requirementValue: 98, price(lvl) {
        return {mining_coal: lvl * 20 + 80};
    }, effect: [
        {name: 'currencyMiningCrystalGreenGain', type: 'mult', value: lvl => Math.pow(1.06, lvl)}
    ]},
    magnet: {cap: 10, requirementBase, requirementStat, requirementValue: 100, price(lvl) {
        return {mining_scrap: Math.pow(1.55, lvl) * buildNum(440, 'Qa'), mining_oreIron: lvl * 5 + 10};
    }, effect: [
        {name: 'currencyMiningScrapGain', type: 'mult', value: lvl => Math.pow(1.15, lvl)},
        {name: 'miningOreGain', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    bronzeFilter: {cap: 6, capMult: true, requirementBase, requirementStat, requirementValue: 102, price(lvl) {
        return {mining_barBronze: 7 * Math.pow(2, Math.max(0, lvl - 5))};
    }, effect: [
        {name: 'miningRareEarthGain', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    enhancingStation: {cap: 1, hasDescription: true, persistent: true, note: 'mining_25', requirementBase, requirementStat, requirementValue: 105, price() {
        return {mining_coal: 250};
    }, effect: [
        {name: 'miningEnhancement', type: 'unlock', value: lvl => lvl >= 1}
    ]},
    enhancingHammer: {requirement() {
        return MISTORE.state.unlock.miningEnhancement.use;
    }, price(lvl) {
        return {mining_barAluminium: Math.ceil(Math.pow(1.25, lvl) * 20)};
    }, effect: [
        {name: 'miningEnhancementMax', type: 'base', value: lvl => lvl}
    ]},
    warehouse: {cap: 12, requirementBase, requirementStat, requirementValue: 110, price(lvl) {
        return {mining_scrap: Math.pow(6, lvl) * buildNum(6.075, 'Qi')};
    }, effect: [
        {name: 'currencyMiningOreAluminiumCap', type: 'mult', value: lvl => lvl >= 1 ? Math.pow(2, Math.floor((lvl + 3) / 4)) : null},
        {name: 'currencyMiningOreCopperCap', type: 'mult', value: lvl => lvl >= 2 ? Math.pow(2, Math.floor((lvl + 2) / 4)) : null},
        {name: 'currencyMiningOreTinCap', type: 'mult', value: lvl => lvl >= 3 ? Math.pow(2, Math.floor((lvl + 1) / 4)) : null},
        {name: 'currencyMiningOreIronCap', type: 'mult', value: lvl => lvl >= 4 ? Math.pow(2, Math.floor(lvl / 4)) : null},
    ]},
    corrosiveFumes: {cap: 15, requirementBase, requirementStat, requirementValue: 112, price(lvl) {
        return {mining_sulfur: Math.pow(3.5, lvl) * 2000};
    }, effect: [
        {name: 'miningToughness', type: 'mult', value: lvl => splicedPow(1 / 1.2, 1 / 1.1, 15, lvl)}
    ]},
    smeltingSalt: {requirementBase, requirementStat, requirementValue: 115, price(lvl) {
        return {mining_salt: Math.pow(lvl * 0.01 + 1.4, lvl) * buildNum(10, 'K')};
    }, effect: [
        {name: 'miningPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.11, lvl)}
    ]},
    titaniumExpansion: {cap: 3, requirementBase, requirementStat, requirementValue: 120, price(lvl) {
        return {mining_oreCopper: Math.pow(2.75, lvl) * 7.5e4, mining_oreTin: Math.pow(2.1, lvl) * 8000};
    }, effect: [
        {name: 'currencyMiningOreIronCap', type: 'base', value: lvl => lvl * 3},
        {name: 'currencyMiningOreIronCap', type: 'mult', value: lvl => Math.pow(1.25, lvl)},
        {name: 'currencyMiningOreTitaniumCap', type: 'base', value: lvl => lvl}
    ]},
    emberForge: {hasDescription: true, requirementBase, requirementStat, requirementValue: 125, price(lvl) {
        return {mining_coal: lvl * 3 + 80};
    }, effect: [
        {name: 'currencyMiningEmberGain', type: 'base', value: lvl => getDiminishing(lvl) * 0.05}
    ]},
    bronzeForge: {requirementBase, requirementStat, requirementValue: 128, price(lvl) {
        return {mining_barBronze: Math.ceil(Math.pow(1.28, lvl) * 12)};
    }, effect: [
        {name: 'currencyMiningEmberGain', type: 'base', value: lvl => lvl * 0.03}
    ]},
    titaniumCache: {cap: 5, requirementBase, requirementStat, requirementValue: 130, price(lvl) {
        return {mining_scrap: Math.pow(7, lvl) * buildNum(80, 'Sx'), mining_oreTitanium: Math.pow(2, lvl) * 4, mining_sulfur: Math.pow(2.2, lvl) * buildNum(45, 'K')};
    }, effect: [
        {name: 'currencyMiningOreCopperCap', type: 'mult', value: lvl => lvl * 0.4 + 1},
        {name: 'currencyMiningOreTinCap', type: 'base', value: lvl => lvl * 10},
        {name: 'currencyMiningOreIronCap', type: 'base', value: lvl => lvl * 4},
        {name: 'currencyMiningOreTitaniumCap', type: 'base', value: lvl => lvl * 2}
    ]},
    smallBombs: {cap: 5, capMult: true, requirementBase, requirementStat, requirementValue: 131, price(lvl) {
        return {mining_barSteel: 5 * Math.pow(2, Math.max(0, lvl - 4))};
    }, effect: [
        {name: 'miningToughness', type: 'mult', value: lvl => Math.pow(1 / 1.075, lvl)}
    ]},
    giantForge: {persistent: true, alwaysActive: true, requirementBase, requirementStat, requirementValue: 132, price(lvl) {
        return {mining_coal: Math.round(Math.pow(1.25, lvl) * 1200)};
    }, effect: [
        {name: 'currencyMiningEmberCap', type: 'base', value: lvl => lvl * 50}
    ]},
    gunpowder: {requirementBase, requirementStat, requirementValue: 135, price(lvl) {
        return {mining_coal: Math.round(Math.pow(1.1 + 0.01 * lvl, lvl) * (lvl * 10 + 100)), mining_sulfur: Math.pow(1.5 + 0.1 * lvl, lvl) * buildNum(120, 'K'), mining_niter: Math.round(Math.pow(1.1 + 0.02 * lvl, lvl) * (lvl * 100 + 500))};
    }, effect: [
        {name: 'currencyMiningScrapGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'miningToughness', type: 'mult', value: lvl => Math.pow(1 / 1.25, lvl)}
    ]},
    nitricAcid: {persistent: true, requirementBase, requirementStat, requirementValue: 138, price(lvl) {
        return {mining_niter: Math.round(Math.pow(1.05, lvl) * (lvl * 200 + 1000))};
    }, effect: [
        {name: 'miningDamage', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    metalDetector: {cap: 14, requirementBase, requirementStat, requirementValue: 140, price(lvl) {
        return {mining_scrap: Math.pow(3.5, lvl) * buildNum(15, 'Sp'), mining_oreIron: Math.pow(1.35, lvl) * 1650};
    }, effect: [
        {name: 'currencyMiningScrapGain', type: 'mult', value: lvl => Math.pow(1.08, lvl)},
        {name: 'currencyMiningScrapCap', type: 'mult', value: lvl => Math.pow(1.25, lvl)},
        {name: 'currencyMiningOreTitaniumCap', type: 'base', value: lvl => lvl * 2}
    ]},
    nails: {cap: 8, capMult: true, requirementBase, requirementStat, requirementValue: 142, price(lvl) {
        return {mining_barSteel: 7 * Math.pow(2, Math.max(0, lvl - 7))};
    }, effect: [
        {name: 'miningDamage', type: 'mult', value: lvl => lvl * 0.05 + 1}
    ]},
    recycling: {persistent: true, requirementBase, requirementStat, requirementValue: 145, price(lvl) {
        return {mining_ember: Math.round(Math.pow(1.15, lvl) * 50)};
    }, effect: [
        {name: 'currencyMiningScrapGain', type: 'mult', value: lvl => Math.pow(1.1, lvl) * (lvl * 0.25 + 1)}
    ]},
    stickyJar: {cap: 1, hasDescription: true, persistent: true, note: 'mining_30', requirementBase, requirementStat, requirementValue: 150, price() {
        return {mining_scrap: buildNum(4, 'O')};
    }, effect: [
        {name: 'miningResin', type: 'unlock', value: lvl => lvl >= 1}
    ]},
    acidVial: {requirementBase, requirementStat, requirementValue: 152, price(lvl) {
        return {mining_niter: Math.round(Math.pow(1.15, lvl) * (lvl * 750 + 1500))};
    }, effect: [
        {name: 'miningDamage', type: 'mult', value: lvl => Math.pow(1.2, lvl)},
        {name: 'currencyMiningScrapGain', type: 'mult', value: lvl => Math.pow(1.1, lvl)}
    ]},
    scanning: {persistent: true, requirementBase, requirementStat, requirementValue: 155, price(lvl) {
        return {mining_obsidian: Math.pow(2, lvl) * buildNum(10, 'K')};
    }, effect: [
        {name: 'miningRareEarthGain', type: 'mult', value: lvl => Math.pow(1.1, lvl)}
    ]},
    largerSurface: {cap: 5, requirementBase, requirementStat, requirementValue: 160, price(lvl) {
        return {mining_scrap: Math.pow(4000, lvl) * buildNum(6, 'N')};
    }, effect: [
        {name: 'miningResinMax', type: 'base', value: lvl => lvl},
        {name: 'currencyMiningOreTitaniumCap', type: 'base', value: lvl => lvl * 12}
    ]},
    qualityWorkbench: {cap: 10, requirementBase, requirementStat, requirementValue: 165, price(lvl) {
        return {mining_scrap: Math.pow(4.6, lvl) * buildNum(35, 'N'), mining_granite: Math.pow(3.85, lvl) * buildNum(300, 'B')};
    }, effect: [
        {name: 'miningPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.2, lvl)}
    ]},
    titaniumForge: {cap: 8, capMult: true, requirementBase, requirementStat, requirementValue: 170, price(lvl) {
        return {mining_barSteel: 12 * Math.pow(2, Math.max(0, lvl - 7))};
    }, effect: [
        {name: 'miningPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
        {name: 'currencyMiningOreTitaniumCap', type: 'mult', value: lvl => lvl * 0.25 + 1}
    ]},
    dynamite: {cap: 15, requirementBase, requirementStat, requirementValue: 175, price(lvl) {
        return {mining_scrap: Math.pow(3.33, lvl) * buildNum(135, 'N')};
    }, effect: [
        {name: 'miningDamage', type: 'mult', value: lvl => Math.pow(1.15, lvl) * (lvl * 0.1 + 1)}
    ]},
    platinumExpansion: {cap: 4, requirementBase, requirementStat, requirementValue: 180, price(lvl) {
        return {mining_oreCopper: Math.pow(1.75, lvl) * 1.5e6, mining_oreIron: Math.pow(2.25, lvl) * 2e4};
    }, effect: [
        {name: 'currencyMiningOreTitaniumCap', type: 'mult', value: lvl => Math.pow(2, lvl)},
        {name: 'currencyMiningOrePlatinumCap', type: 'base', value: lvl => getSequence(3, lvl)}
    ]},
    hiddenStash: {cap: 8, capMult: true, requirementBase, requirementStat, requirementValue: 185, price(lvl) {
        return {mining_barTitanium: 5 * Math.pow(2, Math.max(0, lvl - 7))};
    }, effect: [
        {name: 'currencyMiningScrapGain', type: 'mult', value: lvl => lvl * 0.075 + 1}
    ]},
    platinumCache: {cap: 6, requirementBase, requirementStat, requirementValue: 190, price(lvl) {
        return {mining_oreTitanium: Math.pow(2, lvl) * 450, mining_salt: Math.pow(1.85, lvl) * buildNum(60, 'M'), mining_sulfur: Math.pow(2.2, lvl) * buildNum(800, 'M')};
    }, effect: [
        {name: 'currencyMiningScrapCap', type: 'mult', value: lvl => lvl * 0.4 + 1},
        {name: 'currencyMiningOrePlatinumCap', type: 'mult', value: lvl => lvl * 0.5 + 1},
    ]},
    colossalOreStorage: {cap: 1, requirementBase, requirementStat, requirementValue: 200, price() {
        return {mining_scrap: buildNum(10, 'D')};
    }, effect: [
        {name: 'currencyMiningScrapCap', type: 'mult', value: lvl => Math.pow(3, lvl)},
        {name: 'currencyMiningOreAluminiumCap', type: 'mult', value: lvl => Math.pow(3, lvl)},
        {name: 'currencyMiningOreCopperCap', type: 'mult', value: lvl => Math.pow(3, lvl)},
        {name: 'currencyMiningOreTinCap', type: 'mult', value: lvl => Math.pow(3, lvl)},
        {name: 'currencyMiningOreIronCap', type: 'mult', value: lvl => Math.pow(3, lvl)},
        {name: 'currencyMiningOreTitaniumCap', type: 'mult', value: lvl => Math.pow(3, lvl)},
        {name: 'currencyMiningOrePlatinumCap', type: 'mult', value: lvl => Math.pow(3, lvl)},
    ]},
    smallOreStorage: {cap: 5, capMult: true, requirementBase, requirementStat, requirementValue: 210, price(lvl) {
        return {mining_barTitanium: 8 * Math.pow(2, Math.max(0, lvl - 4))};
    }, effect: [
        {name: 'miningOreCap', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    titaniumBombs: {cap: 16, requirementBase, requirementStat, requirementValue: 220, price(lvl) {
        return {mining_scrap: Math.pow(3.1, lvl) * buildNum(440, 'UD'), mining_oreTitanium: Math.pow(1.3, lvl) * 1750};
    }, effect: [
        {name: 'miningDamage', type: 'mult', value: lvl => Math.pow(1.2, lvl)}
    ]},
    titaniumPickaxe: {cap: 10, capMult: true, requirementBase, requirementStat, requirementValue: 230, price(lvl) {
        return {mining_barTitanium: 14 * Math.pow(2, Math.max(0, lvl - 9))};
    }, effect: [
        {name: 'miningPickaxeCraftingPower', type: 'mult', value: lvl => lvl * 0.05 + 1},
        {name: 'miningPickaxeCraftingQuality', type: 'mult', value: lvl => lvl * 0.2 + 1},
    ]},
    undergroundRadar: {cap: 5, capMult: true, requirementBase, requirementStat, requirementValue: 240, price(lvl) {
        return {mining_barShiny: 10 * Math.pow(2, Math.max(0, lvl - 4))};
    }, effect: [
        {name: 'miningDepthDwellerSpeed', type: 'mult', value: lvl => lvl * 0.05 + 1}
    ]},
    scrapShelf: {cap: 30, requirementBase, requirementStat, requirementValue: 250, price(lvl) {
        return {mining_scrap: Math.pow(lvl * 0.05 + 2.1, lvl) * 2e39};
    }, effect: [
        {name: 'currencyMiningScrapCap', type: 'mult', value: lvl => Math.pow(1.15, lvl)}
    ]},
    iridiumExpansion: {cap: 10, capMult: true, requirementBase, requirementStat, requirementValue: 260, price(lvl) {
        return {mining_barShiny: 13 + Math.max(0, lvl - 9)};
    }, effect: [
        {name: 'currencyMiningScrapCap', type: 'mult', value: lvl => lvl * 0.05 + 1},
        {name: 'currencyMiningOreIridiumCap', type: 'base', value: lvl => getSequence(1, lvl)}
    ]},
    iridiumCache: {cap: 4, requirementBase, requirementStat, requirementValue: 270, price(lvl) {
        return {mining_scrap: Math.pow(22.5, lvl) * 1e40, mining_sulfur: Math.pow(2.45, lvl) * 1.3e13};
    }, effect: [
        {name: 'currencyMiningOreTitaniumCap', type: 'mult', value: lvl => lvl * 0.25 + 1},
        {name: 'currencyMiningOrePlatinumCap', type: 'mult', value: lvl => lvl * 0.5 + 1},
        {name: 'currencyMiningOreIridiumCap', type: 'mult', value: lvl => lvl + 1}
    ]},
    stonecutter: {cap: 50, requirementBase, requirementStat, requirementValue: 275, price(lvl) {
        return {mining_scrap: Math.pow(lvl * 0.04 + 2, lvl) * 3.5e41, mining_salt: Math.pow(1.225, lvl) * 1.45e15, mining_deeprock: Math.pow(1.375, lvl) * 1.1e9};
    }, effect: [
        {name: 'miningPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.12, lvl)},
        {name: 'currencyMiningScrapGain', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
    ]},
    iridiumTreetap: {cap: 4, capMult: true, requirementBase, requirementStat, requirementValue: 280, price(lvl) {
        return {mining_deeprock: Math.pow(7.5, lvl) * 5e8, mining_barIridium: 7 * Math.pow(2, Math.max(0, lvl - 3))};
    }, effect: [
        {name: 'currencyMiningResinCap', type: 'base', value: lvl => lvl * 10},
        {name: 'miningResinMax', type: 'base', value: lvl => lvl}
    ]},
    deepCuts: {requirementBase, requirementStat, requirementValue: 290, price(lvl) {
        return {mining_deeprock: Math.pow(lvl * 0.01 + 1.5, lvl) * buildNum(2.5, 'B')};
    }, effect: [
        {name: 'miningToughness', type: 'mult', value: lvl => Math.pow(1 / 1.25, lvl)}
    ]},
    iridiumBombs: {cap: 7, capMult: true, requirementBase, requirementStat, requirementValue: 310, price(lvl) {
        return {mining_barIridium: 10 * Math.pow(2, Math.max(0, lvl - 6))};
    }, effect: [
        {name: 'miningDamage', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    oreBag: {cap: 12, requirementBase, requirementStat, requirementValue: 330, price(lvl) {
        return {mining_deeprock: Math.pow(1.65, lvl) * buildNum(800, 'B'), mining_sulfur: Math.pow(1.9, lvl) * buildNum(450, 'T')};
    }, effect: [
        {name: 'currencyMiningOreTinCap', type: 'base', value: lvl => lvl * 12},
        {name: 'currencyMiningOreIronCap', type: 'base', value: lvl => lvl * 10},
        {name: 'currencyMiningOreTitaniumCap', type: 'base', value: lvl => lvl * 4},
        {name: 'currencyMiningOrePlatinumCap', type: 'base', value: lvl => lvl * 4},
    ]},
    osmiumExpansion: {cap: 9, capMult: true, requirementBase, requirementStat, requirementValue: 350, price(lvl) {
        return {mining_barShiny: 18 * Math.pow(2, Math.max(0, lvl - 8)), mining_barIridium: 12 * Math.pow(2, Math.max(0, lvl - 8))};
    }, effect: [
        {name: 'currencyMiningScrapCap', type: 'mult', value: lvl => lvl * 0.2 + 1},
        {name: 'currencyMiningOreOsmiumCap', type: 'base', value: lvl => lvl * 4},
    ]},
    osmiumCache: {cap: 7, requirementBase, requirementStat, requirementValue: 355, price(lvl) {
        return {mining_scrap: Math.pow(6.75, lvl) * buildNum(900, 'SxD'), mining_deeprock: Math.pow(2.1, lvl) * buildNum(42, 'T')};
    }, effect: [
        {name: 'currencyMiningOreOsmiumCap', type: 'base', value: lvl => lvl * 2},
        {name: 'currencyMiningOreOsmiumCap', type: 'mult', value: lvl => lvl + 1}
    ]},
    darkBombs: {cap: 5, capMult: true, requirementBase, requirementStat, requirementValue: 375, price(lvl) {
        return {mining_barDarkIron: 6 * Math.pow(2, Math.max(0, lvl - 9))};
    }, effect: [
        {name: 'miningDamage', type: 'mult', value: lvl => lvl * 0.05 + 1},
        {name: 'currencyMiningScrapCap', type: 'mult', value: lvl => lvl * 0.1 + 1},
    ]},
    colossalScrapStorage: {cap: 1, requirementBase, requirementStat, requirementValue: 400, price() {
        return {mining_scrap: buildNum(1, 'V')};
    }, effect: [
        {name: 'currencyMiningScrapCap', type: 'mult', value: lvl => Math.pow(buildNum(1, 'M'), lvl)}
    ]},
    stoneDissolver: {cap: 50, requirementBase, requirementStat, requirementValue: 425, price(lvl) {
        return {mining_scrap: Math.pow(lvl * 0.02 + 1.8, lvl) * buildNum(1, 'UV')};
    }, effect: [
        {name: 'miningDamage', type: 'mult', value: lvl => Math.pow(1.15, lvl)},
        {name: 'miningToughness', type: 'mult', value: lvl => Math.pow(1 / 1.3, lvl)},
    ]},
    leadExpansion: {cap: 8, capMult: true, requirementBase, requirementStat, requirementValue: 450, price(lvl) {
        return {mining_barDarkIron: 7 * Math.pow(2, Math.max(0, lvl - 7))};
    }, effect: [
        {name: 'miningOreCap', type: 'mult', value: lvl => lvl * 0.05 + 1},
        {name: 'currencyMiningOreLeadCap', type: 'base', value: lvl => lvl * 7},
    ]},
};
const requirementStat = 'mining_maxDepth1';
const requirementBase = () => store.state.stat[requirementStat].total;
const MI_UPG2 = {
    fumes: {subfeature: 1, price(lvl) {
        return {mining_scrap: Math.pow(lvl * 0.012 + 1.24, lvl) * buildNum(750, 'K')};
    }, effect: [
        {name: 'miningDamage', type: 'mult', value: lvl => Math.pow(1.12, lvl) * Math.pow(lvl * 0.2 + 1, 2)}
    ]},
    smallCrate: {subfeature: 1, cap: 25, requirementBase, requirementStat, requirementValue: 3, price(lvl) {
        return {mining_limestone: Math.pow(lvl * 0.025 + 1.35, lvl) * 1000};
    }, effect: [
        {name: 'currencyMiningScrapCap', type: 'mult', value: lvl => Math.pow(1.1, lvl)}
    ]},
    giantCrate: {subfeature: 1, requirementBase, requirementStat, requirementValue: 5, price(lvl) {
        return {mining_scrap: Math.pow(lvl * 2 + 8, lvl) * buildNum(2.5, 'M')};
    }, effect: [
        {name: 'currencyMiningScrapCap', type: 'mult', value: lvl => Math.pow(6, lvl)}
    ]},
    morePressure: {subfeature: 1, cap: 25, requirementBase, requirementStat, requirementValue: 10, price(lvl) {
        return {mining_scrap: Math.pow(lvl * 0.025 + 1.75, lvl) * buildNum(400, 'M')};
    }, effect: [
        {name: 'miningDamage', type: 'mult', value: lvl => Math.pow(1.2, lvl)},
        {name: 'currencyMiningScrapGain', type: 'mult', value: lvl => Math.pow(1.25, lvl)}
    ]},
    gasDweller: {subfeature: 1, cap: 1, persistent: true, requirementBase, requirementStat, requirementValue: 15, price() {
        return {mining_helium: 250};
    }, effect: [
        {name: 'miningDepthDweller', type: 'unlock', value: lvl => lvl >= 1},
        {name: 'miningDepthDwellerMax', type: 'mult', value: lvl => Math.pow(1 / 1.25, lvl)}
    ]},
    piston: {subfeature: 1, cap: 10, requirementBase, requirementStat, requirementValue: 20, price(lvl) {
        return {mining_helium: Math.round(Math.pow(1.35, lvl) * 50)};
    }, effect: [
        {name: 'miningDamage', type: 'mult', value: lvl => Math.pow(1.05, lvl) * (lvl * 0.2 + 1)}
    ]},
    pollution: {subfeature: 1, cap: 1, persistent: true, requirementBase, requirementStat, requirementValue: 25, price() {
        return {mining_helium: 1000};
    }, effect: [
        {name: 'miningSmoke', type: 'unlock', value: lvl => lvl >= 1}
    ]},
    particleFilter: {subfeature: 1, requirement() {
        return MISTORE.state.unlock.miningSmoke.use;
    }, price(lvl) {
        return {mining_scrap: Math.pow(1.4, lvl) * buildNum(1, 'T')};
    }, effect: [
        {name: 'miningPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.15, lvl)}
    ]},
    hotAirBalloon: {subfeature: 1, cap: 8, requirementBase, requirementStat, requirementValue: 30, price(lvl) {
        return {mining_scrap: Math.pow(3.75, lvl) * buildNum(2.2, 'T')};
    }, effect: [
        {name: 'currencyMiningScrapCap', type: 'mult', value: lvl => Math.pow(1.5, lvl)},
        {name: 'currencyMiningSmokeCap', type: 'mult', value: lvl => lvl * 0.5 + 1}
    ]},
    conductor: {subfeature: 1, cap: 10, requirementBase, requirementStat, requirementValue: 35, price(lvl) {
        return {
            mining_scrap: Math.pow(40, lvl) * buildNum(10, 'T'),
            mining_limestone: Math.pow(4.5, lvl) * buildNum(200, 'K')
        };
    }, effect: [
        {name: 'miningDepthDwellerSpeed', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    vent: {subfeature: 1, cap: 20, requirementBase, requirementStat, requirementValue: 40, price(lvl) {
        return {mining_scrap: Math.pow(1.85, lvl) * buildNum(40, 'T')};
    }, effect: [
        {name: 'currencyMiningScrapGain', type: 'mult', value: lvl => Math.pow(1.3, lvl)}
    ]},
    urn: {subfeature: 1, cap: 20, requirementBase, requirementStat, requirementValue: 45, price(lvl) {
        return {mining_limestone: Math.pow(2.8, lvl) * buildNum(850, 'K')};
    }, effect: [
        {name: 'currencyMiningSmokeCap', type: 'mult', value: lvl => getSequence(5, lvl) * 0.05 + 1}
    ]},
    lunarBlessing: {subfeature: 1, cap: 20, requirementBase, requirementStat, requirementValue: 50, price(lvl) {
        return {mining_moonshard: Math.pow(2, lvl) * 10};
    }, effect: [
        {name: 'miningPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
        {name: 'miningDamage', type: 'mult', value: lvl => Math.pow(1.05, lvl)}
    ]},
    harvester: {subfeature: 1, cap: 10, requirementBase, requirementStat, requirementValue: 60, price(lvl) {
        return {mining_neon: Math.round(Math.pow(1.35, lvl) * 50)};
    }, effect: [
        {name: 'currencyMiningScrapGain', type: 'mult', value: lvl => Math.pow(1.05, lvl) * (lvl * 0.3 + 1)}
    ]},
    chalkboard: {subfeature: 1, cap: 15, requirementBase, requirementStat, requirementValue: 70, price(lvl) {
        return {mining_moonshard: Math.pow(2.25, lvl) * buildNum(30, 'K')};
    }, effect: [
        {name: 'currencyMiningLimestoneGain', type: 'mult', value: lvl => Math.pow(1.35, lvl)}
    ]},
    graphiteRod: {subfeature: 1, cap: 40, requirementBase, requirementStat, requirementValue: 80, price(lvl) {
        return {mining_scrap: Math.pow(1.85, lvl) * buildNum(2, 'Qi')};
    }, effect: [
        {name: 'miningPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.12, lvl)},
        {name: 'currencyMiningSmokeCap', type: 'mult', value: lvl => Math.pow(1.1, lvl)}
    ]},
    minecart: {subfeature: 1, cap: 25, requirementBase, requirementStat, requirementValue: 90, price(lvl) {
        return {mining_limestone: Math.pow(lvl * 0.03 + 2.15, lvl) * buildNum(5, 'B')};
    }, effect: [
        {name: 'currencyMiningScrapGain', type: 'mult', value: lvl => Math.pow(1.2, lvl)},
        {name: 'currencyMiningScrapCap', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
    ]},
    moonstone: {subfeature: 1, cap: 10, requirementBase, requirementStat, requirementValue: 100, price(lvl) {
        return {mining_moonshard: Math.pow(10, lvl) * buildNum(1, 'M')};
    }, effect: [
        {name: 'miningPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.5, lvl)}
    ]},
    nightVisionDevice: {subfeature: 1, cap: 40, requirementBase, requirementStat, requirementValue: 115, price(lvl) {
        return {mining_scrap: Math.pow(1.85, lvl) * buildNum(75, 'O')};
    }, effect: [
        {name: 'miningRareEarthGain', type: 'mult', value: lvl => Math.pow(1.1, lvl) * (lvl * 0.1 + 1)}
    ]},
    enrichedCrystal: {subfeature: 1, cap: 10, requirementBase, requirementStat, requirementValue: 130, price(lvl) {
        return {mining_argon: Math.round(Math.pow(1.35, lvl) * 50)};
    }, effect: [
        {name: 'currencyMiningCrystalYellowGain', type: 'mult', value: lvl => lvl * 0.05 + 1}
    ]},
    matches: {subfeature: 1, requirementBase, requirementStat, requirementValue: 150, price(lvl) {
        return {mining_phosphorus: Math.pow(lvl * 0.05 + 2.25, lvl) * 8};
    }, effect: [
        {name: 'miningDamage', type: 'mult', value: lvl => Math.pow(1.1, lvl)}
    ]},
    smokeStabilizer: {subfeature: 1, cap: 50, requirementBase, requirementStat, requirementValue: 170, price(lvl) {
        return {mining_scrap: Math.pow(lvl * 0.01 + 1.7, lvl) * buildNum(1.25, 'UD')};
    }, effect: [
        {name: 'miningPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.14, lvl)}
    ]},
    elevator: {subfeature: 1, cap: 30, requirementBase, requirementStat, requirementValue: 190, price(lvl) {
        return {
            mining_limestone: Math.pow(lvl * 0.05 + 2.25, lvl) * buildNum(80, 'T'),
            mining_moonshard: Math.pow(lvl * 0.06 + 2.5, lvl) * buildNum(3.5, 'T'),
            mining_phosphorus: Math.pow(lvl * 0.03 + 1.75, lvl) * 6600
        };
    }, effect: [
        {name: 'currencyMiningScrapGain', type: 'mult', value: lvl => Math.pow(1.3, lvl)}
    ]},
    shovel: {subfeature: 1, cap: 20, requirementBase, requirementStat, requirementValue: 210, price(lvl) {
        return {mining_scrap: Math.pow(lvl * 0.08 + 2.16, lvl) * buildNum(860, 'TD')};
    }, effect: [
        {name: 'miningDamage', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
        {name: 'miningPickaxeCraftingPower', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
        {name: 'currencyMiningScrapGain', type: 'mult', value: lvl => Math.pow(1.1, lvl)}
    ]},
    smoker: {subfeature: 1, cap: 10, requirementBase, requirementStat, requirementValue: 230, price(lvl) {
        return {mining_krypton: Math.round(Math.pow(1.35, lvl) * 50)};
    }, effect: [
        {name: 'currencyMiningSmokeGain', type: 'mult', value: lvl => Math.pow(1.05, lvl) * (lvl * 0.2 + 1)}
    ]},
};
const requirementStat0 = 'mining_depthDwellerCap0';
const requirementBase0 = () => store.state.stat[requirementStat0].total;

const requirementStat1 = 'mining_depthDwellerCap1';
const requirementBase1 = () => store.state.stat[requirementStat1].total;
const MI_UPGP = {
    crystalBasics: {type: 'prestige', cap: 10, price(lvl) {
        return {mining_crystalGreen: Math.pow(2, lvl) * 5};
    }, effect: [
        {name: 'miningDamage', type: 'mult', value: lvl => Math.pow(1.4, lvl)},
        {name: 'currencyMiningScrapGain', type: 'mult', value: lvl => Math.pow(1.2, lvl)}
    ]},
    crystalTips: {type: 'prestige', cap: 50, price(lvl) {
        return {mining_crystalGreen: Math.pow(1.15, lvl) * 10};
    }, effect: [
        {name: 'miningDamage', type: 'mult', value: lvl => lvl * 0.25 + 1}
    ]},
    crystalStorage: {type: 'prestige', cap: 50, price(lvl) {
        return {mining_crystalGreen: Math.pow(1.15, lvl) * 5};
    }, effect: [
        {name: 'currencyMiningScrapGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'currencyMiningScrapCap', type: 'mult', value: lvl => lvl * 0.2 + 1}
    ]},
    crystalLens: {type: 'prestige', cap: 25, price(lvl) {
        return {mining_crystalGreen: Math.pow(1.25, lvl) * 8};
    }, effect: [
        {name: 'miningOreGain', type: 'mult', value: lvl => lvl * 0.15 + 1}
    ]},
    crystalAluminiumStorage: {type: 'prestige', cap: 20, price(lvl) {
        return {mining_crystalGreen: Math.pow(1.4, lvl) * 10};
    }, effect: [
        {name: 'currencyMiningOreAluminiumCap', type: 'base', value: lvl => lvl * 12},
        {name: 'currencyMiningOreAluminiumCap', type: 'mult', value: lvl => lvl * 0.2 + 1},
    ]},
    crystalCopperStorage: {type: 'prestige', cap: 20, price(lvl) {
        return {mining_crystalGreen: Math.pow(1.4, lvl) * 15};
    }, effect: [
        {name: 'currencyMiningOreCopperCap', type: 'base', value: lvl => lvl * 4},
        {name: 'currencyMiningOreCopperCap', type: 'mult', value: lvl => lvl * 0.2 + 1},
    ]},
    crystalTinStorage: {type: 'prestige', cap: 20, requirement() {
        return MISTORE.state.stat.mining_maxDepth0.total >= 50;
    }, price(lvl) {
        return {mining_crystalGreen: Math.pow(1.4, lvl) * 60};
    }, effect: [
        {name: 'currencyMiningOreTinCap', type: 'base', value: lvl => lvl * 2},
        {name: 'currencyMiningOreTinCap', type: 'mult', value: lvl => lvl * 0.2 + 1},
    ]},
    crystalIronStorage: {type: 'prestige', cap: 20, requirement() {
        return MISTORE.state.stat.mining_maxDepth0.total >= 80;
    }, price(lvl) {
        return {mining_crystalGreen: Math.pow(1.4, lvl) * 450};
    }, effect: [
        {name: 'currencyMiningOreIronCap', type: 'base', value: lvl => lvl},
        {name: 'currencyMiningOreIronCap', type: 'mult', value: lvl => lvl * 0.2 + 1},
    ]},
    crystalTitaniumStorage: {type: 'prestige', cap: 20, requirement() {
        return MISTORE.state.stat.mining_maxDepth0.total >= 120;
    }, price(lvl) {
        return {mining_crystalGreen: Math.pow(1.4, lvl) * buildNum(12, 'K')};
    }, effect: [
        {name: 'currencyMiningOreTitaniumCap', type: 'base', value: lvl => lvl},
        {name: 'currencyMiningOreTitaniumCap', type: 'mult', value: lvl => lvl * 0.2 + 1},
    ]},
    crystalPlatinumStorage: {type: 'prestige', cap: 20, requirement() {
        return MISTORE.state.stat.mining_maxDepth0.total >= 175;
    }, price(lvl) {
        return {mining_crystalGreen: Math.pow(1.4, lvl) * buildNum(5, 'M')};
    }, effect: [
        {name: 'currencyMiningOrePlatinumCap', type: 'base', value: lvl => lvl},
        {name: 'currencyMiningOrePlatinumCap', type: 'mult', value: lvl => lvl * 0.2 + 1},
    ]},
    crystalIridiumStorage: {type: 'prestige', cap: 20, requirement() {
        return MISTORE.state.stat.mining_maxDepth0.total >= 260;
    }, price(lvl) {
        return {mining_crystalGreen: Math.pow(1.4, lvl) * buildNum(2.6, 'T')};
    }, effect: [
        {name: 'currencyMiningOreIridiumCap', type: 'base', value: lvl => lvl},
        {name: 'currencyMiningOreIridiumCap', type: 'mult', value: lvl => lvl * 0.2 + 1},
    ]},
    crystalOsmiumStorage: {type: 'prestige', cap: 20, requirement() {
        return MISTORE.state.stat.mining_maxDepth0.total >= 350;
    }, price(lvl) {
        return {mining_crystalGreen: Math.pow(1.4, lvl) * buildNum(2.6, 'T')};
    }, effect: [
        {name: 'currencyMiningOreOsmiumCap', type: 'base', value: lvl => lvl},
        {name: 'currencyMiningOreOsmiumCap', type: 'mult', value: lvl => lvl * 0.2 + 1},
    ]},
    crystalLeadStorage: {type: 'prestige', cap: 20, requirement() {
        return MISTORE.state.stat.mining_maxDepth0.total >= 450;
    }, price(lvl) {
        return {mining_crystalGreen: Math.pow(1.4, lvl) * buildNum(2.6, 'T')};
    }, effect: [
        {name: 'currencyMiningOreLeadCap', type: 'base', value: lvl => lvl},
        {name: 'currencyMiningOreLeadCap', type: 'mult', value: lvl => lvl * 0.2 + 1},
    ]},
    crystalDrill: {type: 'prestige', cap: 53, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 5, price(lvl) {
        return {mining_crystalGreen: Math.pow(lvl * 0.01 + 1.5, lvl) * 30};
    }, effect: [
        {name: 'miningDepthDwellerMax', type: 'base', value: lvl => Math.min(getApproaching(0.01, 0.9, lvl), 0.4)}
    ]},
    crystalDetector: {type: 'prestige', cap: 50, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 10, price(lvl) {
        return {mining_crystalGreen: Math.pow(1.4, lvl) * 40};
    }, effect: [
        {name: 'miningRareEarthGain', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    crystalReplicator: {type: 'prestige', cap: 100, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 12, price(lvl) {
        return {mining_crystalGreen: Math.pow(1.7 + lvl * 0.008, lvl) * 90};
    }, effect: [
        {name: 'currencyMiningCrystalGreenGain', type: 'mult', value: lvl => Math.pow(1.1, lvl)}
    ]},
    crystalPreservarium: {type: 'prestige', cap: 3, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 15, price(lvl) {
        return {mining_crystalGreen: Math.pow(4, lvl) * 250};
    }, effect: [
        {name: 'mining_scrapCapacityUp', type: 'keepUpgrade', value: lvl => lvl >= 1},
        {name: 'mining_scrapGainUp', type: 'keepUpgrade', value: lvl => lvl >= 2},
        {name: 'mining_damageUp', type: 'keepUpgrade', value: lvl => lvl >= 3}
    ]},
    crystalTools: {type: 'prestige', requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 16, price(lvl) {
        return {mining_crystalGreen: Math.pow(lvl * 0.02 + 1.4, lvl) * 120};
    }, effect: [
        {name: 'currencyMiningScrapGain', type: 'mult', value: lvl => Math.pow(1.11, lvl)},
        {name: 'miningDamage', type: 'mult', value: lvl => Math.pow(1.08, lvl)}
    ]},
    crystalExplosives: {type: 'prestige', requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 20, price(lvl) {
        return {mining_crystalGreen: Math.pow(Math.max((lvl - 100) * 0.0005, 0) + 1.15, lvl) * 200};
    }, effect: [
        {name: 'miningToughness', type: 'mult', value: lvl => Math.pow(1 / 1.2, lvl)}
    ]},
    crystalRefinery: {type: 'prestige', cap: 50, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 25, price(lvl) {
        return {mining_crystalGreen: Math.pow(1.4, lvl) * 650};
    }, effect: [
        {name: 'miningOreGain', type: 'mult', value: lvl => lvl * 0.04 + 1},
        {name: 'miningRareEarthGain', type: 'mult', value: lvl => Math.pow(1.1, lvl)}
    ]},
    crystalSmeltery: {type: 'prestige', cap: 100, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 30, price(lvl) {
        return {mining_crystalGreen: Math.pow(1.4, lvl) * 3300};
    }, effect: [
        {name: 'miningSmelteryTemperature', type: 'base', value: lvl => 10 * lvl},
        {name: 'miningSmelteryTime', type: 'mult', value: lvl => 1 / (Math.pow(1.02, lvl) * (lvl * 0.08 + 1))}
    ]},
    crystalEnhancer: {type: 'prestige', cap: 7, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 35, price(lvl) {
        return {mining_crystalGreen: Math.pow(100, lvl) * 2e5};
    }, effect: [
        {name: 'miningEnhancementMax', type: 'base', value: lvl => lvl}
    ]},
    crystalTreetap: {type: 'prestige', cap: 40, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 40, price(lvl) {
        return {mining_crystalGreen: Math.pow(1.4, lvl) * buildNum(75, 'K')};
    }, effect: [
        {name: 'currencyMiningResinGain', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    crystalSalt: {type: 'prestige', cap: 50, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 50, price(lvl) {
        return {mining_crystalGreen: Math.pow(1.4, lvl) * buildNum(1.1, 'M')};
    }, effect: [
        {name: 'currencyMiningSaltGain', type: 'mult', value: lvl => Math.pow(1.1, lvl) * (lvl * 0.2 + 1)}
    ]},
    crystalBottle: {type: 'prestige', cap: 25, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 60, price(lvl) {
        return {mining_crystalGreen: Math.pow(lvl * 0.1 + 2, lvl) * buildNum(12.5, 'M')};
    }, effect: [
        {name: 'currencyMiningResinCap', type: 'base', value: lvl => lvl}
    ]},
    crystalSafe: {type: 'prestige', cap: 17, hideCap: true, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 65, price(lvl) {
        return {mining_crystalGreen: Math.pow(10, lvl) * 1e8};
    }, effect: [
        {name: 'mining_oreShelf', type: 'keepUpgrade', value: lvl => lvl >= 1},
        {name: 'mining_oreShelf', type: 'uncapUpgrade', value: lvl => lvl >= 1},
        {name: 'mining_ironCache', type: 'keepUpgrade', value: lvl => lvl >= 2},
        {name: 'mining_ironCache', type: 'uncapUpgrade', value: lvl => lvl >= 2},
        {name: 'mining_bronzeDrill', type: 'keepUpgrade', value: lvl => lvl >= 3},
        {name: 'mining_bronzeDrill', type: 'uncapUpgrade', value: lvl => lvl >= 3},
        {name: 'mining_bronzeFilter', type: 'keepUpgrade', value: lvl => lvl >= 4},
        {name: 'mining_bronzeFilter', type: 'uncapUpgrade', value: lvl => lvl >= 4},
        {name: 'mining_smallBombs', type: 'keepUpgrade', value: lvl => lvl >= 5},
        {name: 'mining_smallBombs', type: 'uncapUpgrade', value: lvl => lvl >= 5},
        {name: 'mining_nails', type: 'keepUpgrade', value: lvl => lvl >= 6},
        {name: 'mining_nails', type: 'uncapUpgrade', value: lvl => lvl >= 6},
        {name: 'mining_titaniumForge', type: 'keepUpgrade', value: lvl => lvl >= 7},
        {name: 'mining_titaniumForge', type: 'uncapUpgrade', value: lvl => lvl >= 7},
        {name: 'mining_hiddenStash', type: 'keepUpgrade', value: lvl => lvl >= 8},
        {name: 'mining_hiddenStash', type: 'uncapUpgrade', value: lvl => lvl >= 8},
        {name: 'mining_smallOreStorage', type: 'keepUpgrade', value: lvl => lvl >= 9},
        {name: 'mining_smallOreStorage', type: 'uncapUpgrade', value: lvl => lvl >= 9},
        {name: 'mining_titaniumPickaxe', type: 'keepUpgrade', value: lvl => lvl >= 10},
        {name: 'mining_titaniumPickaxe', type: 'uncapUpgrade', value: lvl => lvl >= 10},
        {name: 'mining_undergroundRadar', type: 'keepUpgrade', value: lvl => lvl >= 11},
        {name: 'mining_undergroundRadar', type: 'uncapUpgrade', value: lvl => lvl >= 11},
        {name: 'mining_iridiumExpansion', type: 'keepUpgrade', value: lvl => lvl >= 12},
        {name: 'mining_iridiumExpansion', type: 'uncapUpgrade', value: lvl => lvl >= 12},
        {name: 'mining_iridiumTreetap', type: 'keepUpgrade', value: lvl => lvl >= 13},
        {name: 'mining_iridiumTreetap', type: 'uncapUpgrade', value: lvl => lvl >= 13},
        {name: 'mining_iridiumBombs', type: 'keepUpgrade', value: lvl => lvl >= 14},
        {name: 'mining_iridiumBombs', type: 'uncapUpgrade', value: lvl => lvl >= 14},
        {name: 'mining_osmiumExpansion', type: 'keepUpgrade', value: lvl => lvl >= 15},
        {name: 'mining_osmiumExpansion', type: 'uncapUpgrade', value: lvl => lvl >= 15},
        {name: 'mining_darkBombs', type: 'keepUpgrade', value: lvl => lvl >= 16},
        {name: 'mining_darkBombs', type: 'uncapUpgrade', value: lvl => lvl >= 16},
        {name: 'mining_leadExpansion', type: 'keepUpgrade', value: lvl => lvl >= 17},
        {name: 'mining_leadExpansion', type: 'uncapUpgrade', value: lvl => lvl >= 17},
    ]},
    crystalEngine: {type: 'prestige', cap: 50, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 75, price(lvl) {
        return {mining_crystalGreen: Math.pow(1.4, lvl) * buildNum(230, 'M')};
    }, effect: [
        {name: 'miningDamage', type: 'mult', value: lvl => Math.pow(1.1, lvl) * (lvl * 0.25 + 1)}
    ]},
    crystalCoal: {type: 'prestige', cap: 20, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 90, price(lvl) {
        return {mining_crystalGreen: Math.pow(lvl * 0.05 + 1.75, lvl) * buildNum(27, 'B')};
    }, effect: [
        {name: 'currencyMiningCoalGain', type: 'mult', value: lvl => lvl * 0.05 + 1}
    ]},
    crystalTruck: {type: 'prestige', cap: 10, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 105, price(lvl) {
        return {mining_crystalGreen: Math.pow(10, lvl) * buildNum(1, 'T')};
    }, effect: [
        {name: 'currencyMiningScrapCap', type: 'mult', value: lvl => Math.pow(1.5, lvl) * (lvl * 0.5 + 1)}
    ]},
    crystalExpansion: {type: 'prestige', cap: 9, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 120, price(lvl) {
        return {mining_crystalGreen: Math.pow(10, lvl) * Math.pow(1000, Math.max(0, lvl - 6)) * buildNum(25, 'T')};
    }, effect: [
        {name: 'currencyMiningOreAluminiumCap', type: 'mult', value: lvl => lvl >= 1 ? 10 : null},
        {name: 'currencyMiningOreCopperCap', type: 'mult', value: lvl => lvl >= 2 ? 10 : null},
        {name: 'currencyMiningOreTinCap', type: 'mult', value: lvl => lvl >= 3 ? 10 : null},
        {name: 'currencyMiningOreIronCap', type: 'mult', value: lvl => lvl >= 4 ? 10 : null},
        {name: 'currencyMiningOreTitaniumCap', type: 'mult', value: lvl => lvl >= 5 ? 10 : null},
        {name: 'currencyMiningOrePlatinumCap', type: 'mult', value: lvl => lvl >= 6 ? 10 : null},
        {name: 'currencyMiningOreIridiumCap', type: 'mult', value: lvl => lvl >= 7 ? 10 : null},
        {name: 'currencyMiningOreOsmiumCap', type: 'mult', value: lvl => lvl >= 8 ? 10 : null},
        {name: 'currencyMiningOreLeadCap', type: 'mult', value: lvl => lvl >= 9 ? 10 : null}
    ]},
    crystalTnt: {type: 'prestige', cap: 25, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 135, price(lvl) {
        return {mining_crystalGreen: Math.pow(10, lvl) * buildNum(6, 'Qa')};
    }, effect: [
        {name: 'miningToughness', type: 'mult', value: lvl => Math.pow(0.5, lvl)}
    ]},
    crystalBeacon: {type: 'prestige', cap: 4, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 150, price(lvl) {
        return {mining_crystalGreen: Math.pow(buildNum(1, 'M'), lvl) * buildNum(1, 'Sx')};
    }, effect: [
        {name: 'miningBeaconPiercing', type: 'base', value: lvl => lvl >= 1 ? 1 : null},
        {name: 'miningBeaconRich', type: 'base', value: lvl => lvl >= 2 ? 1 : null},
        {name: 'miningBeaconWonder', type: 'base', value: lvl => lvl >= 3 ? 1 : null},
        {name: 'miningBeaconHope', type: 'base', value: lvl => lvl >= 4 ? 1 : null},
    ]},
    crystalNiter: {type: 'prestige', cap: 20, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 165, price(lvl) {
        return {mining_crystalGreen: Math.pow(lvl * 0.02 + 1.4, lvl) * buildNum(3, 'Sx')};
    }, effect: [
        {name: 'currencyMiningNiterGain', type: 'mult', value: lvl => lvl * 0.05 + 1}
    ]},
    crystalBunker: {type: 'prestige', cap: 20, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 180, price(lvl) {
        return {mining_crystalGreen: Math.pow(4.5, lvl) * buildNum(65, 'Sx')};
    }, effect: [
        {name: 'currencyMiningScrapCap', type: 'mult', value: lvl => Math.pow(1.2, lvl) * (lvl * 0.4 + 1)},
        {name: 'miningOreCap', type: 'mult', value: lvl => lvl * 0.2 + 1},
    ]},
    crystalOreBag: {type: 'prestige', cap: 40, requirementBase: requirementBase0, requirementStat: requirementStat0, requirementValue: 200, price(lvl) {
        return {mining_crystalGreen: Math.pow(1.2, lvl) * buildNum(1, 'Sp')};
    }, effect: [
        {name: 'miningOreCap', type: 'base', value: lvl => lvl}
    ]},

    crystalSpikes: {type: 'prestige', requirement() {
        return MISTORE.state.unlock.miningGasSubfeature.see;
    }, price(lvl) {
        return {mining_crystalYellow: Math.pow(lvl * 0.025 + 1.3, lvl) * 5};
    }, effect: [
        {name: 'miningDamage', type: 'mult', value: lvl => Math.pow(1.05, lvl) * (lvl * 0.15 + 1)}
    ]},
    crystalBooster: {type: 'prestige', cap: 8, requirement() {
        return MISTORE.state.unlock.miningGasSubfeature.see;
    }, price(lvl) {
        return {mining_crystalYellow: Math.pow(1.75, lvl) * 8};
    }, effect: [
        {name: 'miningDepthDwellerSpeed', type: 'mult', value: lvl => lvl * 0.125 + 1}
    ]},
    heliumReserves: {type: 'prestige', cap: 8, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 4, price(lvl) {
        return {mining_crystalYellow: Math.pow(lvl * 0.5 + 2, lvl) * 100};
    }, effect: [
        {name: 'currencyMiningHeliumIncrement', type: 'base', value: lvl => lvl * 0.01}
    ]},
    crystalSmoke: {type: 'prestige', cap: 20, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 8, price(lvl) {
        return {mining_crystalYellow: Math.pow(1.65, lvl) * 250};
    }, effect: [
        {name: 'currencyMiningSmokeGain', type: 'mult', value: lvl => Math.pow(1.2, lvl)},
        {name: 'currencyMiningSmokeCap', type: 'mult', value: lvl => Math.pow(1.3, lvl)}
    ]},
    crystalConductor: {type: 'prestige', cap: 25, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 12, price(lvl) {
        return {mining_crystalYellow: Math.pow(lvl * 0.02 + 1.5, lvl) * 1000};
    }, effect: [
        {name: 'miningDepthDwellerMax', type: 'base', value: lvl => lvl * 0.005}
    ]},
    crystalFusion: {type: 'prestige', cap: 25, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 16, price(lvl) {
        return {mining_crystalYellow: Math.pow(1.75, lvl) * 2300};
    }, effect: [
        {name: 'currencyMiningCrystalGreenGain', type: 'mult', value: lvl => Math.pow(1.15, lvl)},
        {name: 'currencyMiningCrystalYellowGain', type: 'mult', value: lvl => Math.pow(1.3, lvl)}
    ]},
    neonReserves: {type: 'prestige', cap: 8, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 20, price(lvl) {
        return {mining_crystalYellow: Math.pow(lvl * 0.5 + 2, lvl) * 7000};
    }, effect: [
        {name: 'currencyMiningNeonIncrement', type: 'base', value: lvl => lvl * 0.005}
    ]},
    crystalRefuge: {type: 'prestige', cap: 2, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 24, price(lvl) {
        return {mining_crystalYellow: Math.pow(20, lvl) * buildNum(25, 'K')};
    }, effect: [
        {name: 'mining_piston', type: 'keepUpgrade', value: lvl => lvl >= 1},
        {name: 'mining_harvester', type: 'keepUpgrade', value: lvl => lvl >= 2}
    ]},
    crystalCave: {type: 'prestige', cap: 10, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 28, price(lvl) {
        return {mining_crystalYellow: Math.pow(1.65, lvl) * buildNum(75, 'K')};
    }, effect: [
        {name: 'currencyMiningScrapCap', type: 'mult', value: lvl => Math.pow(1.1, lvl) * (lvl * 0.15 + 1)},
        {name: 'miningOreCap', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    crystalFilter: {type: 'prestige', cap: 20, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 32, price(lvl) {
        return {mining_crystalYellow: Math.pow(1.5, lvl) * buildNum(450, 'K')};
    }, effect: [
        {name: 'miningRareEarthGain', type: 'mult', value: lvl => Math.pow(1.15, lvl)}
    ]},
    heliumWarehouse: {type: 'prestige', cap: 5, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 40, price(lvl) {
        return {mining_crystalYellow: Math.pow(10 * Math.pow(2, lvl), lvl) * buildNum(1.8, 'M')};
    }, effect: [
        {name: 'currencyMiningHeliumLimit', type: 'mult', value: lvl => Math.pow(2, lvl)}
    ]},
    crystalTunnel: {type: 'prestige', cap: 25, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 48, price(lvl) {
        return {mining_crystalYellow: Math.pow(lvl * 0.05 + 1.5, lvl) * buildNum(8, 'M')};
    }, effect: [
        {name: 'currencyMiningScrapCap', type: 'mult', value: lvl => Math.pow(1.2, lvl) * (lvl * 0.3 + 1)}
    ]},
    argonReserves: {type: 'prestige', cap: 8, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 56, price(lvl) {
        return {mining_crystalYellow: Math.pow(lvl * 0.5 + 2, lvl) * buildNum(30, 'M')};
    }, effect: [
        {name: 'currencyMiningArgonIncrement', type: 'base', value: lvl => lvl * 0.003}
    ]},
    crystalDust: {type: 'prestige', cap: 10, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 64, price(lvl) {
        return {mining_crystalYellow: Math.pow(1.65, lvl) * buildNum(120, 'M')};
    }, effect: [
        {name: 'currencyMiningSmokeGain', type: 'mult', value: lvl => Math.pow(1.15, lvl) * (lvl * 0.35 + 1)}
    ]},
    neonWarehouse: {type: 'prestige', cap: 5, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 72, price(lvl) {
        return {mining_crystalYellow: Math.pow(10 * Math.pow(2, lvl), lvl) * buildNum(750, 'M')};
    }, effect: [
        {name: 'currencyMiningNeonLimit', type: 'mult', value: lvl => getSequence(1, lvl) + 1},
        {name: 'currencyMiningNeonIncrement', type: 'base', value: lvl => lvl * 0.002}
    ]},
    crystalBombs: {type: 'prestige', cap: 20, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 80, price(lvl) {
        return {mining_crystalYellow: Math.pow(1.65, lvl) * buildNum(3.3, 'B')};
    }, effect: [
        {name: 'miningDamage', type: 'mult', value: lvl => Math.pow(1.05, lvl) * (lvl * 0.1 + 1)}
    ]},
    crystalCollector: {type: 'prestige', cap: 20, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 96, price(lvl) {
        return {mining_crystalYellow: Math.pow(1.65, lvl) * buildNum(66, 'B')};
    }, effect: [
        {name: 'currencyMiningScrapGain', type: 'mult', value: lvl => Math.pow(1.1, lvl) * (lvl * 0.1 + 1)}
    ]},
    kryptonReserves: {type: 'prestige', cap: 8, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 112, price(lvl) {
        return {mining_crystalYellow: Math.pow(lvl * 0.5 + 2, lvl) * buildNum(1.3, 'T')};
    }, effect: [
        {name: 'currencyMiningKryptonIncrement', type: 'base', value: lvl => lvl * 0.002}
    ]},
    crystalResort: {type: 'prestige', cap: 2, requirementBase: requirementBase1, requirementStat: requirementStat1, requirementValue: 120, price(lvl) {
        return {mining_crystalYellow: Math.pow(4000, lvl) * buildNum(6, 'T')};
    }, effect: [
        {name: 'mining_enrichedCrystal', type: 'keepUpgrade', value: lvl => lvl >= 1},
        {name: 'mining_smoker', type: 'keepUpgrade', value: lvl => lvl >= 2}
    ]},
};
const MI_UPGM = {
    moreDamage: {type: 'premium', price(lvl) {
        return {gem_ruby: fallbackArray([15, 80], [2, 3][(lvl - 2) % 2] * Math.pow(2, Math.floor((lvl - 2) / 2)) * 75, lvl)};
    }, effect: [
        {name: 'miningDamage', type: 'mult', value: lvl => fallbackArray([1, 1.25, 1.5], getSequence(3, lvl - 2) * 0.25 + 1, lvl) }
    ]},
    moreScrap: {type: 'premium', price(lvl) {
        return {gem_ruby: fallbackArray([10, 40], [2, 3][(lvl - 2) % 2] * Math.pow(2, Math.floor((lvl - 2) / 2)) * 75, lvl)};
    }, effect: [
        {name: 'currencyMiningScrapGain', type: 'mult', value: lvl => fallbackArray([1, 1.25, 1.5], getSequence(1, lvl - 2) + 1, lvl)},
        {name: 'currencyMiningScrapCap', type: 'mult', value: lvl => fallbackArray([1, 1.25, 1.5], getSequence(1, lvl - 2) + 1, lvl)}
    ]},
    moreGreenCrystal: {type: 'premium', requirement() {
        return MISTORE.state.unlock.miningDepthDweller.see;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 75};
    }, effect: [
        {name: 'currencyMiningCrystalGreenGain', type: 'mult', value: lvl => lvl * 0.25 + 1}
    ]},
    moreRareEarth: {type: 'premium', requirement() {
        return MISTORE.state.stat.mining_maxDepth0.total >= 50;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 120};
    }, effect: [
        {name: 'miningRareEarthGain', type: 'mult', value: lvl => getSequence(3, lvl) * 0.05 + 1}
    ]},
    fasterSmeltery: {type: 'premium', requirement() {
        return MISTORE.state.unlock.miningSmeltery.see;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 100};
    }, effect: [
        {name: 'miningSmelteryTime', type: 'mult', value: lvl => 1 / (lvl + 1)}
    ]},
    moreResin: {type: 'premium', requirement() {
        return MISTORE.state.unlock.miningResin.see;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 150};
    }, effect: [
        {name: 'currencyMiningResinGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'currencyMiningResinCap', type: 'base', value: lvl => lvl}
    ]},
    premiumCraftingSlots: {type: 'premium', hasDescription: true, requirement() {
        return MISTORE.state.unlock.miningPickaxeCrafting.see;
    }, price(lvl) {
        return {gem_ruby: Math.pow(2, lvl) * 30};
    }, effect: [
        {name: 'miningPickaxePremiumCraftingSlots', type: 'base', value: lvl => lvl}
    ]},
    moreAluminium: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumOre', requirement() {
        return MISTORE.state.stat.mining_maxDepth0.total >= 15;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 300};
    }, effect: [
        {name: 'currencyMiningOreAluminiumGain', type: 'mult', value: lvl => Math.pow(2, lvl)},
        {name: 'currencyMiningOreAluminiumCap', type: 'mult', value: lvl => lvl * 0.25 + 1}
    ]},
    moreCopper: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumOre', requirement() {
        return MISTORE.state.stat.mining_maxDepth0.total >= 30;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 450};
    }, effect: [
        {name: 'currencyMiningOreCopperGain', type: 'mult', value: lvl => Math.pow(2, lvl)},
        {name: 'currencyMiningOreCopperCap', type: 'mult', value: lvl => lvl * 0.25 + 1}
    ]},
    moreTin: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumOre', requirement() {
        return MISTORE.state.stat.mining_maxDepth0.total >= 50;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 600};
    }, effect: [
        {name: 'currencyMiningOreTinGain', type: 'mult', value: lvl => Math.pow(2, lvl)},
        {name: 'currencyMiningOreTinCap', type: 'mult', value: lvl => lvl * 0.25 + 1}
    ]},
    moreIron: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumOre', requirement() {
        return MISTORE.state.stat.mining_maxDepth0.total >= 80;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 900};
    }, effect: [
        {name: 'currencyMiningOreIronGain', type: 'mult', value: lvl => Math.pow(2, lvl)},
        {name: 'currencyMiningOreIronCap', type: 'mult', value: lvl => lvl * 0.25 + 1}
    ]},
    moreTitanium: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumOre', requirement() {
        return MISTORE.state.stat.mining_maxDepth0.total >= 120;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 1200};
    }, effect: [
        {name: 'currencyMiningOreTitaniumGain', type: 'mult', value: lvl => Math.pow(2, lvl)},
        {name: 'currencyMiningOreTitaniumCap', type: 'mult', value: lvl => lvl * 0.25 + 1}
    ]},
    morePlatinum: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumOre', requirement() {
        return MISTORE.state.stat.mining_maxDepth0.total >= 175;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 1800};
    }, effect: [
        {name: 'currencyMiningOrePlatinumGain', type: 'mult', value: lvl => Math.pow(2, lvl)},
        {name: 'currencyMiningOrePlatinumCap', type: 'mult', value: lvl => lvl * 0.25 + 1}
    ]},
    moreIridium: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumOre', requirement() {
        return MISTORE.state.stat.mining_maxDepth0.total >= 260;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 2500};
    }, effect: [
        {name: 'currencyMiningOreIridiumGain', type: 'mult', value: lvl => Math.pow(2, lvl)},
        {name: 'currencyMiningOreIridiumCap', type: 'mult', value: lvl => lvl * 0.25 + 1}
    ]},
    moreOsmium: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumOre', requirement() {
        return MISTORE.state.stat.mining_maxDepth0.total >= 350;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 3500};
    }, effect: [
        {name: 'currencyMiningOreOsmiumGain', type: 'mult', value: lvl => Math.pow(2, lvl)},
        {name: 'currencyMiningOreOsmiumCap', type: 'mult', value: lvl => lvl * 0.25 + 1}
    ]},
    moreLead: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumOre', requirement() {
        return MISTORE.state.stat.mining_maxDepth0.total >= 450;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 5000};
    }, effect: [
        {name: 'currencyMiningOreLeadGain', type: 'mult', value: lvl => Math.pow(2, lvl)},
        {name: 'currencyMiningOreLeadCap', type: 'mult', value: lvl => lvl * 0.25 + 1}
    ]},
    moreHelium: {type: 'premium', cap: 5, requirement() {
        return MISTORE.state.unlock.miningGasSubfeature.see;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 300};
    }, effect: [
        {name: 'currencyMiningHeliumLimit', type: 'base', value: lvl => lvl * 30},
        {name: 'currencyMiningHeliumGain', type: 'base', value: lvl => lvl * 0.002}
    ]},
    moreSmoke: {type: 'premium', requirement() {
        return MISTORE.state.unlock.miningSmoke.see;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 325};
    }, effect: [
        {name: 'currencyMiningSmokeGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'currencyMiningSmokeCap', type: 'mult', value: lvl => getSequence(1, lvl) + 1}
    ]},
    moreNeon: {type: 'premium', cap: 5, requirement() {
        return MISTORE.state.stat.mining_maxDepth1.total > 50;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 525};
    }, effect: [
        {name: 'currencyMiningNeonLimit', type: 'base', value: lvl => lvl * 30},
        {name: 'currencyMiningNeonGain', type: 'base', value: lvl => lvl * 0.002}
    ]},
    moreArgon: {type: 'premium', cap: 5, requirement() {
        return MISTORE.state.stat.mining_maxDepth1.total > 120;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 800};
    }, effect: [
        {name: 'currencyMiningArgonLimit', type: 'base', value: lvl => lvl * 30},
        {name: 'currencyMiningArgonGain', type: 'base', value: lvl => lvl * 0.002}
    ]},
    moreKrypton: {type: 'premium', cap: 5, requirement() {
        return MISTORE.state.stat.mining_maxDepth1.total > 220;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 1250};
    }, effect: [
        {name: 'currencyMiningKryptonLimit', type: 'base', value: lvl => lvl * 30},
        {name: 'currencyMiningKryptonGain', type: 'base', value: lvl => lvl * 0.002}
    ]},
};
const MI_MULTDATA = {
        miningDamage: {},
        miningToughness: {isPositive: false},
        miningOreGain: {},
        miningOreCap: {},
        miningRareEarthGain: {},
        miningGasGain: {display: 'percent'},
        miningPickaxeCraftingSlots: {round: true, baseValue: 1},
        miningPickaxePremiumCraftingSlots: {round: true},
        miningPickaxeCraftingPower: {},
        miningPickaxeCraftingQuality: {},
        miningOreQuality: {baseValue: 1},
        miningDepthDwellerSpeed: {baseValue: 0.000065},
        miningDepthDwellerMax: {display: 'percent', baseValue: 0.1, max: 0.5},
        miningResinMax: {round: true, baseValue: 1},

        miningPremiumOreCap: {},

        // Gas mults
        currencyMiningHeliumLimit: {baseValue: 100},
        currencyMiningHeliumIncrement: {display: 'percent'},
        currencyMiningNeonLimit: {baseValue: 100},
        currencyMiningNeonIncrement: {display: 'percent'},
        currencyMiningArgonLimit: {baseValue: 100},
        currencyMiningArgonIncrement: {display: 'percent'},
        currencyMiningKryptonLimit: {baseValue: 100},
        currencyMiningKryptonIncrement: {display: 'percent'},
        currencyMiningXenonLimit: {baseValue: 100},
        currencyMiningXenonIncrement: {display: 'percent'},
        currencyMiningRadonLimit: {baseValue: 100},
        currencyMiningRadonIncrement: {display: 'percent'},

        miningSmelteryTime: {display: 'timeMs', isPositive: false},
        miningSmelteryTemperature: {display: 'temperature', baseValue: 100},
        miningEnhancementMax: {display: 'int', round: true, baseValue: 3},
        miningPrestigeIncome: {group: ['currencyMiningCrystalGreenGain', 'currencyMiningCrystalYellowGain']}
    };
const MI_MULTGROUPDATA = [
        {mult: 'miningOreGain', name: 'currencyGain', subtype: 'ore'},
        {mult: 'miningOreCap', name: 'currencyCap', subtype: 'ore'},
        {mult: 'miningRareEarthGain', name: 'currencyGain', subtype: 'rareEarth'},
        {mult: 'miningGasGain', name: 'currencyGain', subtype: 'gas'},
        {mult: 'miningPremiumOreCap', name: 'upgradeCap', subtype: 'premiumOre'},
    ];
const MI_UNLOCKDATA = ['miningPickaxeCrafting', 'miningDepthDweller', 'miningSmeltery', 'miningEnhancement', 'miningResin', 'miningGasSubfeature', 'miningSmoke', 'miningAdvancedCardPack', 'miningLuxuryCardPack'];
const MI_STATDATA = {
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
    };
const MI_CURDATA = {
        scrap: {color: 'brown', icon: 'mdi-dots-triangle', gainMult: {}, capMult: {baseValue: buildNum(10, 'K')}, gainTimerFunction() {
            const hitsNeeded = MISTORE.getters['mining/hitsNeeded'];
            return hitsNeeded === Infinity ? null : (((hitsNeeded + MINING_SCRAP_BREAK) * MISTORE.getters['mining/currentScrap']) / hitsNeeded);
        }, timerIsEstimate: true},
        oreAluminium: {subtype: 'ore', color: 'blue-grey', icon: 'mdi-chart-bubble', gainMult: {}, capMult: {baseValue: 12, round: true}, gainTimerFunction() {
            const hitsNeeded = MISTORE.getters['mining/hitsNeeded'];
            const oreGain = MISTORE.getters['mining/currentOre'];
            return (hitsNeeded === Infinity || !oreGain.oreAluminium) ? null : (((hitsNeeded + MINING_ORE_BREAK) * oreGain.oreAluminium.amount) / hitsNeeded);
        }, timerIsEstimate: true},
        oreCopper: {subtype: 'ore', color: 'orange', icon: 'mdi-chart-bubble', gainMult: {}, capMult: {baseValue: 4, round: true}, gainTimerFunction() {
            const hitsNeeded = MISTORE.getters['mining/hitsNeeded'];
            const oreGain = MISTORE.getters['mining/currentOre'];
            return (hitsNeeded === Infinity || !oreGain.oreCopper) ? null : (((hitsNeeded + MINING_ORE_BREAK) * oreGain.oreCopper.amount) / hitsNeeded);
        }, timerIsEstimate: true},
        oreTin: {subtype: 'ore', color: 'grey', icon: 'mdi-chart-bubble', gainMult: {}, capMult: {baseValue: 2, round: true}, gainTimerFunction() {
            const hitsNeeded = MISTORE.getters['mining/hitsNeeded'];
            const oreGain = MISTORE.getters['mining/currentOre'];
            return (hitsNeeded === Infinity || !oreGain.oreTin) ? null : (((hitsNeeded + MINING_ORE_BREAK) * oreGain.oreTin.amount) / hitsNeeded);
        }, timerIsEstimate: true},
        oreIron: {subtype: 'ore', color: 'deep-orange', icon: 'mdi-chart-bubble', gainMult: {}, capMult: {baseValue: 1, round: true}, gainTimerFunction() {
            const hitsNeeded = MISTORE.getters['mining/hitsNeeded'];
            const oreGain = MISTORE.getters['mining/currentOre'];
            return (hitsNeeded === Infinity || !oreGain.oreIron) ? null : (((hitsNeeded + MINING_ORE_BREAK) * oreGain.oreIron.amount) / hitsNeeded);
        }, timerIsEstimate: true},
        oreTitanium: {subtype: 'ore', color: 'pale-light-green', icon: 'mdi-chart-bubble', gainMult: {}, capMult: {baseValue: 1, round: true}, gainTimerFunction() {
            const hitsNeeded = MISTORE.getters['mining/hitsNeeded'];
            const oreGain = MISTORE.getters['mining/currentOre'];
            return (hitsNeeded === Infinity || !oreGain.oreTitanium) ? null : (((hitsNeeded + MINING_ORE_BREAK) * oreGain.oreTitanium.amount) / hitsNeeded);
        }, timerIsEstimate: true},
        orePlatinum: {subtype: 'ore', color: 'skyblue', icon: 'mdi-chart-bubble', gainMult: {}, capMult: {baseValue: 1, round: true}, gainTimerFunction() {
            const hitsNeeded = MISTORE.getters['mining/hitsNeeded'];
            const oreGain = MISTORE.getters['mining/currentOre'];
            return (hitsNeeded === Infinity || !oreGain.orePlatinum) ? null : (((hitsNeeded + MINING_ORE_BREAK) * oreGain.orePlatinum.amount) / hitsNeeded);
        }, timerIsEstimate: true},
        oreIridium: {subtype: 'ore', color: 'pale-purple', icon: 'mdi-chart-bubble', gainMult: {}, capMult: {baseValue: 1, round: true}, gainTimerFunction() {
            const hitsNeeded = MISTORE.getters['mining/hitsNeeded'];
            const oreGain = MISTORE.getters['mining/currentOre'];
            return (hitsNeeded === Infinity || !oreGain.oreIridium) ? null : (((hitsNeeded + MINING_ORE_BREAK) * oreGain.oreIridium.amount) / hitsNeeded);
        }, timerIsEstimate: true},
        oreOsmium: {subtype: 'ore', color: 'pale-green', icon: 'mdi-chart-bubble', gainMult: {}, capMult: {baseValue: 1, round: true}, gainTimerFunction() {
            const hitsNeeded = MISTORE.getters['mining/hitsNeeded'];
            const oreGain = MISTORE.getters['mining/currentOre'];
            return (hitsNeeded === Infinity || !oreGain.oreOsmium) ? null : (((hitsNeeded + MINING_ORE_BREAK) * oreGain.oreOsmium.amount) / hitsNeeded);
        }, timerIsEstimate: true},
        oreLead: {subtype: 'ore', color: 'pale-blue', icon: 'mdi-chart-bubble', gainMult: {}, capMult: {baseValue: 1, round: true}, gainTimerFunction() {
            const hitsNeeded = MISTORE.getters['mining/hitsNeeded'];
            const oreGain = MISTORE.getters['mining/currentOre'];
            return (hitsNeeded === Infinity || !oreGain.oreLead) ? null : (((hitsNeeded + MINING_ORE_BREAK) * oreGain.oreLead.amount) / hitsNeeded);
        }, timerIsEstimate: true},
        barAluminium: {subtype: 'bar', color: 'blue-grey', icon: 'mdi-gold', display: 'int'},
        barBronze: {subtype: 'bar', color: 'pale-orange', icon: 'mdi-gold', display: 'int'},
        barSteel: {subtype: 'bar', color: 'grey', icon: 'mdi-gold', display: 'int'},
        barTitanium: {subtype: 'bar', color: 'pale-green', icon: 'mdi-gold', display: 'int'},
        barShiny: {subtype: 'bar', color: 'pale-blue', icon: 'mdi-gold', display: 'int'},
        barIridium: {subtype: 'bar', color: 'pale-pink', icon: 'mdi-gold', display: 'int'},
        barDarkIron: {subtype: 'bar', color: 'darker-grey', icon: 'mdi-gold', display: 'int'},
        granite: {subtype: 'rareEarth', color: 'skyblue', icon: 'mdi-cube', showHint: true, gainMult: {}, gainTimerFunction() {
            const hitsNeeded = MISTORE.getters['mining/hitsNeeded'];
            const rareDropGain = MISTORE.getters['mining/rareDrops'];
            return (hitsNeeded === Infinity || !rareDropGain.granite) ? null : (((hitsNeeded + MINING_RARE_DROP_BREAK) * rareDropGain.granite) / hitsNeeded);
        }, timerIsEstimate: true},
        salt: {subtype: 'rareEarth', color: 'lighter-grey', icon: 'mdi-shaker', gainMult: {}, gainTimerFunction() {
            const hitsNeeded = MISTORE.getters['mining/hitsNeeded'];
            const rareDropGain = MISTORE.getters['mining/rareDrops'];
            return (hitsNeeded === Infinity || !rareDropGain.salt) ? null : (((hitsNeeded + MINING_RARE_DROP_BREAK) * rareDropGain.salt) / hitsNeeded);
        }, timerIsEstimate: true},
        coal: {color: 'dark-grey', icon: 'mdi-chart-bubble', gainMult: {round: true}, display: 'int'},
        sulfur: {subtype: 'rareEarth', color: 'pale-yellow', icon: 'mdi-fire-circle', gainMult: {}, gainTimerFunction() {
            return MISTORE.getters['mining/rareDrops'].sulfur ?? null;
        }, timerIsEstimate: true},
        niter: {color: 'pale-light-green', icon: 'mdi-water-circle', gainMult: {}},
        obsidian: {subtype: 'rareEarth', color: 'deep-purple', icon: 'mdi-cone', showHint: true, gainMult: {}, gainTimerFunction() {
            const hitsNeeded = MISTORE.getters['mining/hitsNeeded'];
            const rareDropGain = MISTORE.getters['mining/rareDrops'];
            return (hitsNeeded === Infinity || !rareDropGain.obsidian) ? null : (((hitsNeeded + MINING_RARE_DROP_BREAK) * rareDropGain.obsidian) / hitsNeeded);
        }, timerIsEstimate: true},
        deeprock: {subtype: 'rareEarth', color: 'darker-grey', icon: 'mdi-gamepad-circle', gainMult: {}, gainTimerFunction() {
            const hitsNeeded = MISTORE.getters['mining/hitsNeeded'];
            const rareDropGain = MISTORE.getters['mining/rareDrops'];
            return (hitsNeeded === Infinity || !rareDropGain.deeprock) ? null : (((hitsNeeded + MINING_RARE_DROP_BREAK) * rareDropGain.deeprock) / hitsNeeded);
        }, timerIsEstimate: true},
        glowshard: {color: 'cyan', icon: 'mdi-lightbulb-fluorescent-tube', gainMult: {}},
        smoke: {subtype: 'ore', color: 'grey', icon: 'mdi-smoke', gainMult: {}, capMult: {baseValue: 10}, overcapScaling: 0.25, gainTimerFunction() {
            const hitsNeeded = MISTORE.getters['mining/hitsNeeded'];
            return hitsNeeded === Infinity ? null : (((hitsNeeded + MINING_SMOKE_BREAK) * MISTORE.getters['mining/currentSmoke']) / hitsNeeded);
        }, timerIsEstimate: true},
        ember: {type: 'prestige', color: 'orange-red', icon: 'mdi-fire', display: 'int', overcapMult: 1, overcapScaling: 0, gainMult: {display: 'percent'}, capMult: {baseValue: 100}, currencyMult: {
            miningSmelteryTime: {type: 'mult', value: val => 1 / (val * 0.02 + 1)}
        }},
        resin: {type: 'prestige', color: 'orange', icon: 'mdi-water', gainMult: {baseValue: 0.0001, display: 'perSecond'}, showGainMult: true, showGainTimer: true, capMult: {baseValue: 5}},
        crystalGreen: {type: 'prestige', alwaysVisible: true, color: 'light-green', icon: 'mdi-star-three-points', gainMult: {}},
        helium: {type: 'prestige', subtype: 'gas', color: 'pale-blue', icon: 'mdi-gas-cylinder', gainMult: {display: 'percent', baseValue: 0.01}, currencyMult: {
            currencyMiningScrapCap: {type: 'mult', value: val => val * 0.01 + 1}
        }},
        neon: {type: 'prestige', subtype: 'gas', color: 'orange-red', icon: 'mdi-gas-cylinder', gainMult: {display: 'percent', baseValue: 0.01}, currencyMult: {
            miningPickaxeCraftingPower: {type: 'mult', value: val => Math.pow(val * 0.01 + 1, 0.9)}
        }},
        argon: {type: 'prestige', subtype: 'gas', color: 'pink-purple', icon: 'mdi-gas-cylinder', gainMult: {display: 'percent', baseValue: 0.01}, currencyMult: {
            currencyMiningScrapGain: {type: 'mult', value: val => Math.pow(val * 0.01 + 1, 0.8)}
        }},
        krypton: {type: 'prestige', subtype: 'gas', color: 'light-blue', icon: 'mdi-gas-cylinder', gainMult: {display: 'percent', baseValue: 0.01}, currencyMult: {
            miningRareEarthGain: {type: 'mult', value: val => Math.pow(val * 0.01 + 1, 0.7)}
        }},
        xenon: {type: 'prestige', subtype: 'gas', color: 'blue', icon: 'mdi-gas-cylinder', gainMult: {display: 'percent', baseValue: 0.01}},
        radon: {type: 'prestige', subtype: 'gas', color: 'light-green', icon: 'mdi-gas-cylinder', gainMult: {display: 'percent', baseValue: 0.01}},
        limestone: {subtype: 'rareEarth', color: 'pale-yellow', icon: 'mdi-zip-box', gainMult: {}, gainTimerFunction() {
            const hitsNeeded = MISTORE.getters['mining/hitsNeeded'];
            const rareDropGain = MISTORE.getters['mining/rareDrops'];
            return (hitsNeeded === Infinity || !rareDropGain.limestone) ? null : (((hitsNeeded + MINING_RARE_DROP_BREAK) * rareDropGain.limestone) / hitsNeeded);
        }, timerIsEstimate: true},
        moonshard: {subtype: 'rareEarth', color: 'light-blue', icon: 'mdi-moon-waning-crescent', showHint: true, gainMult: {}, gainTimerFunction() {
            const hitsNeeded = MISTORE.getters['mining/hitsNeeded'];
            const rareDropGain = MISTORE.getters['mining/rareDrops'];
            return (hitsNeeded === Infinity || !rareDropGain.moonshard) ? null : (((hitsNeeded + MINING_RARE_DROP_BREAK) * rareDropGain.moonshard) / hitsNeeded);
        }, timerIsEstimate: true},
        phosphorus: {subtype: 'rareEarth', color: 'red', icon: 'mdi-pyramid', gainMult: {}, gainTimerFunction() {
            const hitsNeeded = MISTORE.getters['mining/hitsNeeded'];
            const rareDropGain = MISTORE.getters['mining/rareDrops'];
            return (hitsNeeded === Infinity || !rareDropGain.phosphorus) ? null : (((hitsNeeded + MINING_RARE_DROP_BREAK) * rareDropGain.phosphorus) / hitsNeeded);
        }, timerIsEstimate: true},
        crystalYellow: {type: 'prestige', alwaysVisible: true, color: 'yellow', icon: 'mdi-star-four-points', gainMult: {}}
    };
const MI_CONSUMABLEDATA = {
        goldenHammer: {
            icon: 'mdi-hammer',
            color: 'amber',
            price: {gem_sapphire: 20}
        }
    };
const MI_NOTEDATA = ['g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g'];
const MI_UPGDATA = {
    ...MI_UPG1,
    ...MI_UPG2,
    ...MI_UPGP,
    ...MI_UPGM,
};

const MI_GOOBOO = {
  ore: MI_ORE,
  smeltery: MI_SMELTERY,
  enhancement: MI_ENHANCEMENT,
  beacon: MI_BEACON,
  relic: MI_RELIC,
  achievement: MI_ACHIEVEMENT,
  upgrade: MI_UPGDATA,
  mult: MI_MULTDATA,
  multGroup: MI_MULTGROUPDATA,
  unlock: MI_UNLOCKDATA,
  stat: MI_STATDATA,
  currency: MI_CURDATA,
  consumable: MI_CONSUMABLEDATA,
  note: MI_NOTEDATA
};

// 供 mi_core 使用
if (typeof module !== "undefined") module.exports = { MI_GOOBOO };