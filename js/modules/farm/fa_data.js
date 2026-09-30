/* ============================================================
 * fa_data.js —— 灵植(farm) 数据（自动生成：照抄 gooboo，勿手改数值）
 *   crop/building/gene/geneLevels/fertilizer/upgrade/upgradePremium/relic/achievement
 *   + mult/currency/unlock/stat（来自 modules/farm.js）
 * 仅机械变换：import/export 剥离；函数内 `store` 改写为 `FSTORE`。
 * ============================================================ */

/* farm 数据常量（照抄 gooboo constants.js；用 var 便于在已有 SECONDS_* 全局旁安全声明） */
var MINUTES_PER_HOUR = 60;
var MINUTES_PER_DAY = 1440;
const FA_CROP = {
    carrot: {
        found: true,
        icon: 'mdi-carrot',
        color: 'orange',
        grow: MINUTES_PER_HOUR,
        yield: 130,
        rareDrop: [
            {name: 'farm_oldRoot', type: 'currency', chance: -1, value: 5},
        ],
        tier: 0,
        type: 'vegetable'
    },
    blueberry: {
        icon: 'mdi-fruit-grapes',
        color: 'blue',
        grow: 2 * MINUTES_PER_HOUR,
        yield: 250,
        rareDrop: [
            {name: 'farm_oldRoot', type: 'currency', chance: -1, value: 9},
        ],
        tier: 1,
        type: 'berry'
    },
    wheat: {
        icon: 'mdi-barley',
        color: 'yellow',
        grow: 4 * MINUTES_PER_HOUR,
        yield: 480,
        rareDrop: [
            {name: 'farm_oldRoot', type: 'currency', chance: -1, value: 16},
        ],
        tier: 2,
        type: 'grain'
    },
    tulip: {
        icon: 'mdi-flower-tulip',
        color: 'red',
        grow: 8 * MINUTES_PER_HOUR,
        yield: 850,
        rareDrop: [
            {name: 'farm_oldRoot', type: 'currency', chance: -1, value: 28},
        ],
        tier: 3,
        type: 'flower'
    },
    potato: {
        icon: 'mdi-circle',
        color: 'brown',
        grow: 20 * MINUTES_PER_HOUR,
        yield: 1600,
        rareDrop: [
            {name: 'farm_potatoWater', type: 'consumable', chance: 0.15, value: 3},
        ],
        tier: 4,
        type: 'vegetable'
    },
    raspberry: {
        icon: 'mdi-fruit-grapes',
        color: 'pink',
        grow: 6 * MINUTES_PER_HOUR,
        yield: 680,
        rareDrop: [
            {name: 'farm_seedHull', type: 'currency', chance: 0.2, value: 6},
        ],
        tier: 5,
        type: 'berry'
    },
    barley: {
        icon: 'mdi-barley',
        color: 'amber',
        grow: 10 * MINUTES_PER_HOUR,
        yield: 1050,
        rareDrop: [
            {name: 'farm_seedHull', type: 'currency', chance: 0.18, value: 10},
        ],
        tier: 6,
        type: 'grain'
    },
    dandelion: {
        icon: 'mdi-flower',
        color: 'pale-yellow',
        grow: 1 * MINUTES_PER_HOUR + 30,
        yield: 230,
        rareDrop: [
            {name: 'farm_petal', type: 'currency', chance: 0.15, value: 1},
        ],
        tier: 7,
        type: 'flower'
    },
    corn: {
        icon: 'mdi-corn',
        color: 'amber',
        grow: 30 * MINUTES_PER_HOUR,
        yield: 2600,
        rareDrop: [
            {name: 'farm_bug', type: 'currency', chance: 0.12, value: 15},
        ],
        tier: 8,
        type: 'vegetable'
    },
    watermelon: {
        icon: 'mdi-fruit-watermelon',
        color: 'red',
        grow: 12 * MINUTES_PER_HOUR,
        yield: 1250,
        rareDrop: [
            {name: 'farm_bug', type: 'currency', chance: 0.1, value: 6},
            {name: 'farm_butterfly', type: 'currency', chance: -0.02, value: 2},
        ],
        tier: 9,
        type: 'berry'
    },
    rice: {
        icon: 'mdi-rice',
        color: 'light-grey',
        grow: 24 * MINUTES_PER_HOUR,
        yield: 2200,
        rareDrop: [
            {name: 'farm_seedHull', type: 'currency', chance: 0.05, value: 24},
            {name: 'farm_ladybug', type: 'currency', chance: -0.05, value: 12},
        ],
        tier: 10,
        type: 'grain'
    },
    rose: {
        icon: 'mdi-flower',
        color: 'red',
        grow: 48 * MINUTES_PER_HOUR,
        yield: 3500,
        rareDrop: [
            {name: 'farm_petal', type: 'currency', chance: 0, value: 32},
            {name: 'farm_ladybug', type: 'currency', chance: -0.08, value: 24},
            {name: 'farm_roseWater', type: 'consumable', chance: -0.12, value: 8},
        ],
        tier: 11,
        type: 'flower'
    },
    leek: {
        icon: 'mdi-leek',
        color: 'light-green',
        grow: 3 * MINUTES_PER_HOUR,
        yield: 490,
        rareDrop: [
            {name: 'farm_bug', type: 'currency', chance: -0.1, value: 2},
            {name: 'farm_ladybug', type: 'currency', chance: -0.15, value: 2},
        ],
        tier: 12,
        type: 'vegetable'
    },
    honeymelon: {
        icon: 'mdi-fruit-watermelon',
        color: 'amber',
        grow: 42 * MINUTES_PER_HOUR,
        yield: 3875,
        rareDrop: [
            {name: 'farm_butterfly', type: 'currency', chance: -0.12, value: 7},
            {name: 'farm_spider', type: 'currency', chance: -0.3, value: 1},
        ],
        tier: 13,
        type: 'berry'
    },
    rye: {
        icon: 'mdi-barley',
        color: 'pale-orange',
        grow: 7 * MINUTES_PER_HOUR,
        yield: 1050,
        rareDrop: [
            {name: 'farm_seedHull', type: 'currency', chance: -0.16, value: 7},
            {name: 'farm_spider', type: 'currency', chance: -0.25, value: 1, mult: 0.5},
        ],
        tier: 14,
        type: 'grain'
    },
    daisy: {
        icon: 'mdi-flower',
        color: 'yellow',
        grow: 14 * MINUTES_PER_HOUR,
        yield: 1700,
        rareDrop: [
            {name: 'farm_petal', type: 'currency', chance: -0.18, value: 9},
            {name: 'farm_butterfly', type: 'currency', chance: -0.21, value: 2},
            {name: 'farm_bee', type: 'currency', chance: -0.25, value: 28},
        ],
        tier: 15,
        type: 'flower'
    },
    cucumber: {
        icon: 'mdi-ruler',
        color: 'pale-green',
        grow: 2 * MINUTES_PER_HOUR + 30,
        yield: 560,
        rareDrop: [
            {name: 'farm_bug', type: 'currency', chance: -0.24, value: 1},
        ],
        tier: 16,
        type: 'vegetable'
    },
    grapes: {
        icon: 'mdi-fruit-grapes',
        color: 'purple',
        grow: 5 * MINUTES_PER_HOUR,
        yield: 950,
        rareDrop: [
            {name: 'farm_ladybug', type: 'currency', chance: -0.23, value: 3},
            {name: 'farm_bee', type: 'currency', chance: -0.28, value: 10},
        ],
        tier: 17,
        type: 'berry'
    },
    hops: {
        icon: 'mdi-hops',
        color: 'green',
        grow: 1 * MINUTES_PER_HOUR + 15,
        yield: 340,
        rareDrop: [
            {name: 'farm_spider', type: 'currency', chance: -0.32, value: 1, mult: 0.25},
        ],
        tier: 18,
        type: 'grain'
    },
    violet: {
        icon: 'mdi-flower',
        color: 'deep-purple',
        grow: 36 * MINUTES_PER_HOUR,
        yield: 4600,
        rareDrop: [
            {name: 'farm_petal', type: 'currency', chance: -0.3, value: 24},
            {name: 'farm_bee', type: 'currency', chance: -0.33, value: 72},
        ],
        tier: 19,
        type: 'flower'
    },
    sweetPotato: {
        icon: 'mdi-circle',
        color: 'beige',
        grow: 11 * MINUTES_PER_HOUR + 30,
        yield: 2300,
        rareDrop: [
            {name: 'farm_bug', type: 'currency', chance: -0.36, value: 6},
        ],
        tier: 20,
        type: 'vegetable'
    },
    strawberry: {
        icon: 'mdi-fruit-grapes',
        color: 'red',
        grow: 27 * MINUTES_PER_HOUR,
        yield: 4100,
        rareDrop: [
            {name: 'farm_ladybug', type: 'currency', chance: -0.4, value: 14},
            {name: 'farm_bee', type: 'currency', chance: -0.45, value: 54},
        ],
        tier: 21,
        type: 'berry'
    },
    sesame: {
        icon: 'mdi-grain',
        color: 'pale-orange',
        grow: 4 * MINUTES_PER_HOUR + 30,
        yield: 1125,
        rareDrop: [
            {name: 'farm_smallSeed', type: 'currency', chance: -0.48, value: 3},
            {name: 'farm_spider', type: 'currency', chance: -0.51, value: 1, mult: 0.5},
        ],
        tier: 22,
        type: 'grain'
    },
    sunflower: {
        icon: 'mdi-flower-outline',
        color: 'brown',
        grow: 28 * MINUTES_PER_HOUR,
        yield: 4650,
        rareDrop: [
            {name: 'farm_smallSeed', type: 'currency', chance: -0.5, value: 15},
            {name: 'farm_petal', type: 'currency', chance: -0.53, value: 18},
        ],
        tier: 23,
        type: 'flower'
    },
    spinach: {
        icon: 'mdi-flower-poppy',
        color: 'green',
        grow: 5 * MINUTES_PER_HOUR + 45,
        yield: 1650,
        rareDrop: [
            {name: 'farm_bug', type: 'currency', chance: -0.55, value: 3},
        ],
        tier: 24,
        type: 'vegetable'
    },
    currant: {
        icon: 'mdi-fruit-grapes',
        color: 'red',
        grow: 18 * MINUTES_PER_HOUR,
        yield: 4500,
        rareDrop: [
            {name: 'farm_butterfly', type: 'currency', chance: -0.58, value: 3},
            {name: 'farm_smallSeed', type: 'currency', chance: -0.6, value: 10},
        ],
        tier: 25,
        type: 'berry'
    },
    redwheat: {
        icon: 'mdi-barley',
        color: 'pale-red',
        grow: 68 * MINUTES_PER_HOUR,
        yield: 13000,
        rareDrop: [
            {name: 'farm_seedHull', type: 'currency', chance: -0.62, value: 68},
            {name: 'farm_spider', type: 'currency', chance: -0.64, value: 3},
        ],
        tier: 26,
        type: 'grain'
    },
    poppy: {
        icon: 'mdi-flower-poppy',
        color: 'red',
        grow: 3 * MINUTES_PER_HOUR + 30,
        yield: 1450,
        rareDrop: [
            {name: 'farm_smallSeed', type: 'currency', chance: -0.67, value: 2},
        ],
        tier: 27,
        type: 'flower'
    },
    pumpkin: {
        icon: 'mdi-pumpkin',
        color: 'orange',
        grow: 60 * MINUTES_PER_HOUR,
        yield: 13000,
        rareDrop: [
            {name: 'farm_bug', type: 'currency', chance: -0.69, value: 30},
            {name: 'farm_spider', type: 'currency', chance: -0.75, value: 3},
        ],
        tier: 28,
        type: 'vegetable'
    },
    blackberry: {
        icon: 'mdi-fruit-grapes',
        color: 'pale-purple',
        grow: 22 * MINUTES_PER_HOUR,
        yield: 6400,
        rareDrop: [
            {name: 'farm_bee', type: 'currency', chance: -0.73, value: 44},
            {name: 'farm_smallSeed', type: 'currency', chance: -0.76, value: 15},
        ],
        tier: 29,
        type: 'berry'
    },
    millet: {
        icon: 'mdi-feather',
        color: 'lime',
        grow: 16 * MINUTES_PER_HOUR,
        yield: 5300,
        rareDrop: [
            {name: 'farm_seedHull', type: 'currency', chance: -0.78, value: 16},
            {name: 'farm_snail', type: 'currency', chance: -0.8, value: 4},
        ],
        tier: 30,
        type: 'grain'
    },
    petunia: {
        icon: 'mdi-flower',
        color: 'babypink',
        grow: 21 * MINUTES_PER_HOUR,
        yield: 6800,
        rareDrop: [
            {name: 'farm_snail', type: 'currency', chance: -0.83, value: 5},
            {name: 'farm_petal', type: 'currency', chance: -0.85, value: 14},
        ],
        tier: 31,
        type: 'flower'
    },
    chili: {
        icon: 'mdi-chili-mild',
        color: 'red',
        grow: 40 * MINUTES_PER_HOUR,
        yield: 11500,
        rareDrop: [
            {name: 'farm_snail', type: 'currency', chance: -0.87, value: 10},
        ],
        tier: 32,
        type: 'vegetable'
    },

    // Special crops
    fern: {
        icon: 'mdi-grass',
        color: 'pale-green',
        cost: {farm_grass: 15},
        grow: 10 * MINUTES_PER_HOUR,
        giantGrow: 92 * MINUTES_PER_HOUR,
        giantMult: 7,
        baseExp: 10,
        specialEffect: [
            {name: 'currencyFarmVegetableGain', type: 'mult', value: lvl => (lvl * 0.1 + 1) * Math.pow(1.1, lvl)},
            {name: 'currencyFarmBerryGain', type: 'mult', value: lvl => (lvl * 0.1 + 1) * Math.pow(1.1, lvl)},
        ],
        type: 'special'
    },
    reed: {
        icon: 'mdi-feather',
        color: 'beige',
        cost: {farm_gold: 10},
        grow: 20 * MINUTES_PER_HOUR,
        giantGrow: 140 * MINUTES_PER_HOUR,
        giantMult: 6,
        baseExp: 12,
        specialEffect: [
            {name: 'currencyFarmGrainGain', type: 'mult', value: lvl => (lvl * 0.1 + 1) * Math.pow(1.1, lvl)},
            {name: 'currencyFarmFlowerGain', type: 'mult', value: lvl => (lvl * 0.1 + 1) * Math.pow(1.1, lvl)},
        ],
        type: 'special'
    },
    wildflower: {
        icon: 'mdi-flower-pollen',
        color: 'lime',
        cost: {farm_mixedSeeds: 1},
        grow: 5 * MINUTES_PER_HOUR,
        giantGrow: 68 * MINUTES_PER_HOUR,
        giantMult: 10,
        baseExp: 25,
        specialEffect: [
            {name: 'farmCropGain', type: 'mult', value: lvl => lvl * 0.04 + 1},
        ],
        type: 'special'
    },
    cactus: {
        icon: 'mdi-cactus',
        color: 'green',
        cost: {farm_cactusSeed: 1},
        grow: 5 * MINUTES_PER_DAY,
        giantGrow: 24 * MINUTES_PER_DAY,
        giantMult: 4,
        baseExp: 7,
        specialEffect: [
            {name: 'farmExperience', type: 'mult', value: lvl => lvl * 0.03 + 1},
        ],
        type: 'special'
    },
    cress: {
        icon: 'mdi-leaf-circle-outline',
        color: 'light-green',
        cost: {farm_smallSeed: 2},
        grow: MINUTES_PER_HOUR + 30,
        giantGrow: 20 * MINUTES_PER_HOUR,
        giantMult: 10,
        baseExp: 80,
        specialEffect: [
            {name: 'farmRareDropChance', type: 'base', value: lvl => lvl * 0.01},
        ],
        type: 'special'
    },
    goldenRose: {
        icon: 'mdi-flower',
        color: 'amber',
        cost: {farm_gold: 250},
        grow: 14 * MINUTES_PER_DAY,
        giantGrow: 48 * MINUTES_PER_DAY,
        giantMult: 3,
        baseExp: 4,
        specialEffect: [
            {name: 'currencyFarmPetalCap', type: 'base', value: lvl => lvl * 50},
        ],
        type: 'special'
    },
    ancientFern: {
        icon: 'mdi-grass',
        color: 'pale-blue',
        cost: {farm_ancientSeed: 1},
        grow: 30 * MINUTES_PER_DAY,
        giantGrow: 100 * MINUTES_PER_DAY,
        giantMult: 3,
        baseExp: 1,
        type: 'special'
    },
};
const FA_BUILDING = {
    gardenGnome: {
        icon: 'mdi-human-child'
    },
    sprinkler: {
        icon: 'mdi-sprinkler-variant'
    },
    lectern: {
        icon: 'mdi-lectern'
    },
    pinwheel: {
        icon: 'mdi-pinwheel'
    },
    flag: {
        icon: 'mdi-flag'
    }
};
const FA_GENE = {
    // Level 1 genes
    yield: {
        icon: 'mdi-sack',
        effect: [
            {name: 'farmCropGain', type: 'mult', value: 1.2},
            {name: 'yield', type: 'farmCareImprove', value: {amount: 5, max: 0.1, weight: 0.5}}
        ],
        upgrade: [{name: 'farmCropGain', type: 'mult', value: lvl => lvl * 0.05 + 1}]
    },
    gold: {
        icon: 'mdi-gold',
        effect: [
            {name: 'farmGoldChance', type: 'mult', value: 1.2},
            {name: 'gold', type: 'farmCareImprove', value: {amount: 1, max: 2, weight: 0.03}}
        ],
        upgrade: [{name: 'farmGoldChance', type: 'mult', value: lvl => getDiminishing(lvl) * 0.03 + lvl * 0.01 + 1}]
    },
    exp: {
        icon: 'mdi-star',
        effect: [
            {name: 'farmExperience', type: 'mult', value: 1.15},
            {name: 'exp', type: 'farmCareImprove', value: {amount: 5, max: 0.1, weight: 0.5}}
        ],
        upgrade: [{name: 'farmExperience', type: 'base', value: lvl => lvl * 0.1}]
    },
    rareDrop: {
        icon: 'mdi-dice-2',
        effect: [
            {name: 'farmRareDropChance', type: 'mult', value: 1.2},
            {name: 'rareDrop', type: 'farmCareAdd', value: {amount: 10, max: 0.4, weight: 2.5}},
            {name: 'yield', type: 'farmCareDisable', value: true}
        ],
        upgrade: [{name: 'farmRareDropChance', type: 'mult', value: lvl => lvl * 0.04 + 1}]
    },

    // Level 5 genes
    grow: {
        icon: 'mdi-timer',
        effect: [
            {name: 'farmGrow', type: 'mult', value: 1 / 1.2},
            {name: 'time', type: 'farmCareImprove', value: {amount: 3, weight: 0.75}}
        ],
        upgrade: [{name: 'farmGrow', type: 'mult', value: lvl => 1 / (lvl * 0.02 + 1)}],
        maxLevel: 5
    },
    overgrow: {
        icon: 'mdi-sprout',
        effect: [
            {name: 'farmOvergrow', type: 'mult', value: 1.5},
            {name: 'farmAllGain', type: 'mult', value: 1.1},
        ],
        upgrade: [{name: 'farmOvergrow', type: 'base', value: lvl => lvl * 0.2}]
    },
    mutate: {
        icon: 'mdi-flower-pollen',
        effect: [{name: 'farmBonusDna', type: 'text'}],
        maxLevel: 0
    },
    grass: {
        icon: 'mdi-grass',
        effect: [{name: 'farm_grass', type: 'addRareDrop', value: 10, chance: 0.4}],
        upgrade: [{name: 'farm_grass', type: 'addRareDropAmount', value: lvl => lvl * 2}]
    },

    // Level 10 genes
    dna: {
        icon: 'mdi-dna',
        effect: [{name: 'farmUnlockDna', type: 'text'}],
        upgrade: []
    },
    gnome: {
        icon: 'mdi-human-child',
        effect: [{name: 'farmGnomeBoost', type: 'text'}],
        upgrade: [
            {name: 'farmGoldChance', type: 'mult', value: lvl => lvl * 0.01 + 1},
            {name: 'farmExperience', type: 'base', value: lvl => lvl * 0.08}
        ]
    },
    lonely: {
        icon: 'mdi-circle-expand',
        effect: [{name: 'farmLonelyGrow', type: 'text'}],
        upgrade: [
            {name: 'farmGrow', type: 'mult', value: lvl => 1 / (lvl * 0.01 + 1)},
            {name: 'farmOvergrow', type: 'base', value: lvl => lvl * 0.15}
        ],
        maxLevel: 5
    },
    fertile: {
        icon: 'mdi-sack-percent',
        effect: [{name: 'farmFertileBoost', type: 'text'}],
        upgrade: [
            {name: 'farmCropGain', type: 'mult', value: lvl => lvl * 0.03 + 1},
            {name: 'farmOvergrow', type: 'base', value: lvl => lvl * 0.1}
        ]
    },

    // Level 15 genes
    mystery: {
        icon: 'mdi-eye-circle-outline',
        effect: [{name: 'farm_mysteryStone', type: 'addRareDrop', value: 1, chance: -0.1, mult: 0.02}],
        upgrade: [{name: 'farmMystery', type: 'base', value: lvl => lvl}]
    },
    conversion: {
        icon: 'mdi-swap-horizontal',
        effect: [{name: 'farmYieldConversion', type: 'text'}],
        upgrade: [
            {name: 'farmCropGain', type: 'mult', value: lvl => lvl * 0.03 + 1},
            {name: 'farmExperience', type: 'base', value: lvl => lvl * 0.07}
        ],
        maxLevel: 5
    },
    prestige: {
        icon: 'mdi-shimmer',
        effect: [{name: 'farmFastPrestige', type: 'text'}],
        maxLevel: 0
    },
    rareDropChance: {
        icon: 'mdi-dice-multiple',
        effect: [{name: 'farmRareDropChance', type: 'base', value: 0.05}],
        maxLevel: 0
    },

    // Level 20 genes
    lucky: {
        icon: 'mdi-horseshoe',
        effect: [{name: 'farmLuckyHarvest', type: 'text'}],
        upgrade: [{name: 'farmLuckyHarvestMult', type: 'base', value: lvl => lvl}]
    },
    finalize: {
        icon: 'mdi-lock-alert',
        effect: [
            {name: 'farmCropGain', type: 'mult', value: 1.5},
            {name: 'farmGoldChance', type: 'mult', value: 1.2},
            {name: 'farmRareDropChance', type: 'mult', value: 1.2},
            {name: 'farmExperience', type: 'mult', value: 0}
        ],
        upgrade: [{name: 'farmCropGain', type: 'mult', value: lvl => lvl * 0.1 + 1}],
        maxLevel: 5
    },
    selfless: {
        icon: 'mdi-charity',
        effect: [{name: 'farmSelfless', type: 'text'}],
        upgrade: [{name: 'farmCropGain', type: 'mult', value: lvl => lvl * 0.08 + 1}],
        maxLevel: 5
    },
    unyielding: {
        icon: 'mdi-compost',
        effect: [{name: 'farmUnyielding', type: 'text'}],
        upgrade: [
            {name: 'farmGrow', type: 'mult', value: lvl => 1 / (lvl * 0.01 + 1)},
            {name: 'farmExperience', type: 'base', value: lvl => lvl * 0.07}
        ],
        maxLevel: 5
    },

    // Level 25 genes
    teamwork: {
        icon: 'mdi-handshake',
        effect: [{name: 'farmTeamwork', type: 'text'}],
        upgrade: [{name: 'farmCropGain', type: 'mult', value: lvl => lvl * 0.08 + 1}],
        maxLevel: 5
    },
    hunter: {
        icon: 'mdi-bow-arrow',
        effect: [{name: 'farmHunter', type: 'text'}],
        upgrade: [{name: 'farmHuntChance', type: 'mult', value: lvl => Math.pow(1.1, lvl)}]
    },
    patient: {
        icon: 'mdi-sleep',
        effect: [{name: 'farmPatient', type: 'text'}],
        upgrade: [
            {name: 'farmAllGain', type: 'mult', value: lvl => lvl * 0.01 + 1},
            {name: 'farmGrow', type: 'mult', value: lvl => 1 / (lvl * 0.01 + 1)}
        ],
        maxLevel: 5
    },
};
const FA_GENELEVELS = {
    1: ['yield', 'gold', 'exp', 'rareDrop'],
    5: ['grow', 'overgrow', 'mutate', 'grass'],
    10: ['dna', 'gnome', 'lonely', 'fertile'],
    15: ['mystery', 'conversion', 'prestige', 'rareDropChance'],
    20: ['lucky', 'finalize', 'selfless', 'unyielding'],
    25: ['teamwork', 'hunter', 'patient'],
};
const FA_FERTILIZER = {
    // Unlocked from the beginning
    speedGrow: {
        found: true,
        type: 'all',
        color: 'blue',
        price: {gem_sapphire: 1},
        effect: {farmGrow: 1 / 1.5, farmOvergrow: 2.5}
    },
    richSoil: {
        found: true,
        type: 'all',
        color: 'green',
        price: {gem_sapphire: 1},
        effect: {farmGrow: 1 / 1.25, farmOvergrow: 1.25, farmCropGain: 1.4}
    },
    shiny: {
        found: true,
        type: 'all',
        color: 'amber',
        price: {gem_sapphire: 1},
        effect: {farmGrow: 1 / 1.25, farmOvergrow: 1.25, farmGoldChance: 1.3, farmRareDropChance: 1.4}
    },
    juicy: {
        found: true,
        type: 'all',
        color: 'lime',
        price: {farm_grass: 16},
        effect: {farmCropGain: 1.25, farmRareDropChance: 1.25}
    },
    dissolving: {
        found: true,
        type: 'all',
        icon: 'mdi-test-tube',
        color: 'cyan',
        price: {farm_grass: 22},
        effect: {farmExperience: 1.4, farmCropGain: 0, farmRareDropChance: 0, farmGoldChance: 0}
    },
    supplementsS: {
        found: true,
        type: 'special',
        icon: 'mdi-gradient-vertical',
        color: 'cherry',
        price: {farm_grass: 25, farm_gold: 3},
        effect: {farmGrow: 1 / 1.25}
    },
    supplementsM: {
        found: true,
        type: 'special',
        icon: 'mdi-gradient-vertical',
        color: 'green',
        price: {gem_sapphire: 4},
        effect: {farmGrow: 1 / 1.5}
    },

    // Crop-specific
    potatoWater: {
        type: 'vegetable',
        color: 'indigo',
        effect: {farmGrow: 1 / 1.25, farmOvergrow: 1.25, farmCropGain: 1.3}
    },
    roseWater: {
        type: 'flower',
        color: 'red-pink',
        effect: {farmGrow: 1 / 1.25, farmOvergrow: 1.25, farmCropGain: 1.2, farmGoldChance: 1.1}
    },

    // Unlocked with upgrade
    weedKiller: {
        type: 'grain',
        color: 'beige',
        price: {gem_sapphire: 1},
        effect: {farmGrow: 1 / 1.2, farmOvergrow: 1, farmCropGain: 1.8, farmRareDropChance: 1 / 1.5}
    },
    turboGrow: {
        type: 'all',
        color: 'red',
        price: {gem_sapphire: 2},
        effect: {farmGrow: 1 / 1.75, farmOvergrow: 3.75, farmExperience: 1 / 1.5}
    },
    premium: {
        type: 'all',
        color: 'purple',
        price: {gem_sapphire: 2},
        effect: {farmGrow: 1 / 1.5, farmOvergrow: 2.5, farmCropGain: 1.35, farmGoldChance: 1.2, farmRareDropChance: 1.2}
    },
    supplementsL: {
        type: 'special',
        icon: 'mdi-gradient-vertical',
        color: 'dark-blue',
        price: {gem_sapphire: 10},
        effect: {farmGrow: 1 / 2}
    },

    // Unlocked with second upgrade
    analyzing: {
        type: 'all',
        color: 'blue',
        price: {gem_sapphire: 5},
        effect: {farmExperience: 1.35}
    },
    superJuicy: {
        type: 'berry',
        color: 'orange-red',
        price: {gem_sapphire: 3},
        effect: {farmGrow: 1 / 1.75, farmOvergrow: 3.75, farmCropGain: 1.5, farmRareDropChance: 1.2}
    },
    pellets: {
        type: 'vegetable',
        icon: 'mdi-pill',
        color: 'beige',
        price: {farm_smallSeed: 20},
        effect: {farmGoldChance: 1.2, farmRareDropChance: 1.2, farmExperience: 1.1}
    },
    supplementsXL: {
        type: 'special',
        icon: 'mdi-gradient-vertical',
        color: 'orange-red',
        price: {gem_sapphire: 25},
        effect: {farmGrow: 1 / 3}
    },

    // Special unlocks
    supplementsXXL: {
        type: 'special',
        icon: 'mdi-gradient-vertical',
        color: 'babypink',
        effect: {farmGrow: 1 / 5}
    },
};
const requirementStat = 'farm_seedBox';
const requirementBase = () => store.state.upgrade.item[requirementStat].highestLevel;
const FA_UPG1 = {
    seedBox: {cap: 32, hideCap: true, price(lvl) {
        return [
            {farm_vegetable: 30},
            {farm_berry: 120},
            {farm_grain: 230},
            {farm_flower: 800, farm_gold: 1},
            {farm_vegetable: 4600},
            {farm_berry: 5e4},
            {farm_grain: 3.35e5},
            {farm_flower: 2e6},
            {farm_vegetable: 1.75e7},
            {farm_berry: 1.2e8},
            {farm_grain: 9e8},
            {farm_flower: 7.2e9},
            {farm_vegetable: 5.4e10},
            {farm_berry: 3.7e11},
            {farm_grain: 2.2e12},
            {farm_flower: 3.5e13},
            {farm_vegetable: 8.75e14},
            {farm_berry: 3.1e16},
            {farm_grain: 1.3e18},
            {farm_flower: 8.5e19},
            {farm_vegetable: 5e21},
            {farm_berry: 6.5e23},
            {farm_grain: 3e26},
            {farm_flower: 3.2e29},
            {farm_vegetable: 4.4e32},
            {farm_berry: 7.5e35},
            {farm_grain: 1.2e39},
            {farm_flower: 2.25e43},
            {farm_vegetable: 4.8e47},
            {farm_berry: 1.1e52},
            {farm_grain: 2.8e56},
            {farm_flower: 7.5e60},
        ][lvl];
    }, effect: [
        {name: 'blueberry', type: 'farmSeed', value: lvl => lvl >= 1},
        {name: 'wheat', type: 'farmSeed', value: lvl => lvl >= 2},
        {name: 'tulip', type: 'farmSeed', value: lvl => lvl >= 3},
        {name: 'potato', type: 'farmSeed', value: lvl => lvl >= 4},
        {name: 'raspberry', type: 'farmSeed', value: lvl => lvl >= 5},
        {name: 'barley', type: 'farmSeed', value: lvl => lvl >= 6},
        {name: 'dandelion', type: 'farmSeed', value: lvl => lvl >= 7},
        {name: 'corn', type: 'farmSeed', value: lvl => lvl >= 8},
        {name: 'watermelon', type: 'farmSeed', value: lvl => lvl >= 9},
        {name: 'rice', type: 'farmSeed', value: lvl => lvl >= 10},
        {name: 'rose', type: 'farmSeed', value: lvl => lvl >= 11},
        {name: 'leek', type: 'farmSeed', value: lvl => lvl >= 12},
        {name: 'honeymelon', type: 'farmSeed', value: lvl => lvl >= 13},
        {name: 'rye', type: 'farmSeed', value: lvl => lvl >= 14},
        {name: 'daisy', type: 'farmSeed', value: lvl => lvl >= 15},
        {name: 'cucumber', type: 'farmSeed', value: lvl => lvl >= 16},
        {name: 'grapes', type: 'farmSeed', value: lvl => lvl >= 17},
        {name: 'hops', type: 'farmSeed', value: lvl => lvl >= 18},
        {name: 'violet', type: 'farmSeed', value: lvl => lvl >= 19},
        {name: 'sweetPotato', type: 'farmSeed', value: lvl => lvl >= 20},
        {name: 'strawberry', type: 'farmSeed', value: lvl => lvl >= 21},
        {name: 'sesame', type: 'farmSeed', value: lvl => lvl >= 22},
        {name: 'sunflower', type: 'farmSeed', value: lvl => lvl >= 23},
        {name: 'spinach', type: 'farmSeed', value: lvl => lvl >= 24},
        {name: 'currant', type: 'farmSeed', value: lvl => lvl >= 25},
        {name: 'redwheat', type: 'farmSeed', value: lvl => lvl >= 26},
        {name: 'poppy', type: 'farmSeed', value: lvl => lvl >= 27},
        {name: 'pumpkin', type: 'farmSeed', value: lvl => lvl >= 28},
        {name: 'blackberry', type: 'farmSeed', value: lvl => lvl >= 29},
        {name: 'millet', type: 'farmSeed', value: lvl => lvl >= 30},
        {name: 'petunia', type: 'farmSeed', value: lvl => lvl >= 31},
        {name: 'chili', type: 'farmSeed', value: lvl => lvl >= 32},
    ]},
    fertility: {requirementBase, requirementStat, requirementValue: 1, price(lvl) {
        return {farm_vegetable: 50 * Math.min(lvl * 0.1 + 0.5, 1) * Math.pow(lvl * 0.005 + 1.3, lvl), farm_berry: 50 * Math.min(lvl * 0.1 + 0.5, 1) * Math.pow(lvl * 0.005 + 1.3, lvl)};
    }, effect: [
        {name: 'farmCropGain', type: 'mult', value: lvl => Math.pow(1.1, lvl)}
    ]},
    overgrowth: {cap: 7, requirementBase, requirementStat, requirementValue: 1, price(lvl) {
        return fallbackArray([
            {farm_berry: 80},
            {farm_grain: 425, farm_flower: 650},
        ], {farm_flower: 240 * Math.pow(5 + lvl, lvl)}, lvl);
    }, effect: [
        {name: 'farmOvergrow', type: 'base', value: lvl => lvl >= 1 ? (lvl * 0.1 + 0.3) : null}
    ], onBuy() {
        FSTORE.dispatch('farm/updateFieldCaches');
    }},
    expansion: {cap: 45, requirementBase, requirementStat, requirementValue: 2, price(lvl) {
        return {farm_grain: 300 * Math.min(lvl * 0.1 + 0.5, 1) * Math.pow(lvl * 0.05 + 2, lvl)};
    }, effect: [
        {name: 'farmTiles', type: 'farmTile', value: lvl => lvl},
        {name: 'farmMaxCare', type: 'base', value: lvl => lvl >= 3 ? Math.floor(lvl / 3) : null},
    ]},
    gardenGnome: {cap: 5, hasDescription: true, requirementBase, requirementStat, requirementValue: 3, price(lvl) {
        return {farm_vegetable: 250 * Math.pow(128, lvl), farm_berry: 250 * Math.pow(128, lvl), farm_flower: 500 * Math.pow(192, lvl)};
    }, effect: [
        {name: 'gardenGnome', type: 'farmBuilding', value: lvl => lvl},
        {name: 'farmDisableEarlyGame', type: 'unlock', value: lvl => lvl >= 1},
    ], onBuy() {
        FSTORE.dispatch('farm/applyEarlyGameBuff');
    }},
    learning: {cap: 1, hasDescription: true, requirementBase, requirementStat, requirementValue: 4, price() {
        return {farm_gold: 1};
    }, effect: [
        {name: 'farmCropExp', type: 'unlock', value: lvl => lvl >= 1}
    ]},
    wateringCan: {cap: 1, hasDescription: true, requirement() {
        return FSTORE.state.upgrade.item.farm_learning.level >= 1;
    }, price() {
        return {farm_berry: 2500, farm_gold: 2};
    }, effect: [
        {name: 'farmCare', type: 'unlock', value: lvl => lvl >= 1}
    ], onBuy() {
        FSTORE.dispatch('currency/gain', {feature: 'farm', name: 'rainwater', amount: 100});
    }},
    manure: {cap: 1, requirement() {
        return FSTORE.state.upgrade.item.farm_learning.level >= 1;
    }, price() {
        return {farm_gold: 5};
    }, effect: [
        {name: 'farmFertilizer', type: 'unlock', value: lvl => lvl >= 1}
    ]},
    seedBag: {cap: 1, requirement() {
        return FSTORE.state.upgrade.item.farm_learning.level >= 1;
    }, price() {
        return {farm_gold: 80};
    }, effect: [
        {name: 'fern', type: 'farmSeed', value: lvl => lvl >= 1},
        {name: 'reed', type: 'farmSeed', value: lvl => lvl >= 1},
        {name: 'wildflower', type: 'farmSeed', value: lvl => lvl >= 1},
    ]},
    groundSeeds: {cap: 50, requirementBase, requirementStat, requirementValue: 5, price(lvl) {
        return {farm_flower: 6000 * Math.pow(lvl * 0.04 + 1.5, lvl), farm_seedHull: Math.round(4 * lvl * Math.pow(1.08, Math.max(0, lvl - 10)) + 10)};
    }, effect: [
        {name: 'currencyFarmGrainGain', type: 'mult', value: lvl => lvl * 0.15 + 1},
        {name: 'farmOvergrow', type: 'base', value: lvl => lvl * 0.02}
    ], onBuy() {
        FSTORE.dispatch('farm/updateFieldCaches');
    }},
    roastedSeeds: {cap: 5, requirementBase, requirementStat, requirementValue: 5, price(lvl) {
        return {farm_seedHull: Math.round(Math.pow(1.8, lvl) * 4)};
    }, effect: [
        {name: 'farmExperience', type: 'base', value: lvl => lvl * 0.1}
    ]},
    rainBarrel: {cap: 50, requirementBase, requirementStat, requirementValue: 5, price(lvl) {
        return {farm_berry: 4500 * Math.pow(lvl * 0.2 + 2.5, lvl)};
    }, effect: [
        {name: 'currencyFarmRainwaterCap', type: 'base', value: lvl => lvl * 10}
    ]},
    smallCrate: {cap: 7, requirementBase, requirementStat, requirementValue: 6, price(lvl) {
        return {farm_vegetable: 1.8e4 * Math.pow(1.9, lvl), farm_grain: 6000 * Math.pow(2.25, lvl)};
    }, effect: [
        {name: 'currencyFarmSeedHullCap', type: 'base', value: lvl => lvl * 10}
    ]},
    sprinkler: {cap: 2, hasDescription: true, note: 'farm_8', requirementBase, requirementStat, requirementValue: 6, price(lvl) {
        return {farm_vegetable: buildNum(120, 'K') * Math.pow(buildNum(4, 'M'), lvl), farm_seedHull: 50 * Math.pow(10, lvl)};
    }, effect: [
        {name: 'sprinkler', type: 'farmBuilding', value: lvl => lvl}
    ]},
    hayBales: {cap: 50, requirementBase, requirementStat, requirementValue: 6, price(lvl) {
        return {farm_grass: getSequence(12, lvl) * 15 + 75};
    }, effect: [
        {name: 'currencyFarmGrassCap', type: 'base', value: lvl => lvl * 200}
    ]},
    magnifyingGlass: {cap: 20, requirementBase, requirementStat, requirementValue: 7, price(lvl) {
        return {farm_grain: buildNum(54, 'K') * Math.pow(lvl * 0.1 + 2, lvl), farm_flower: buildNum(33, 'K') * Math.pow(lvl * 0.1 + 2, lvl)};
    }, effect: [
        {name: 'farmExperience', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    scarecrow: {cap: 10, requirementBase, requirementStat, requirementValue: 7, price(lvl) {
        return {farm_grain: buildNum(110, 'K') * Math.pow(1.8, lvl), farm_petal: Math.round(Math.pow(1.4, lvl) * 3), farm_gold: 6 + lvl};
    }, effect: [
        {name: 'farmCropGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'currencyFarmPetalCap', type: 'base', value: lvl => lvl * 3}
    ]},
    anthill: {cap: 20, requirementBase, requirementStat, requirementValue: 7, price(lvl) {
        return {farm_grass: getSequence(3, lvl) * 75 + 200};
    }, effect: [
        {name: 'farmRareDropChance', type: 'base', value: lvl => lvl * 0.01}
    ]},
    bugPowder: {cap: 40, requirementBase, requirementStat, requirementValue: 8, price(lvl) {
        return {farm_grain: buildNum(675, 'K') * Math.pow(1.75, lvl), farm_bug: Math.round(5 * lvl * Math.pow(1.1, Math.max(0, lvl - 10)) + 10)};
    }, effect: [
        {name: 'currencyFarmVegetableGain', type: 'mult', value: lvl => lvl * 0.15 + 1}
    ]},
    shed: {cap: 10, requirementBase, requirementStat, requirementValue: 8, price(lvl) {
        return {farm_seedHull: 5 * getSequence(3, lvl) + 35, farm_bug: 5 * getSequence(3, lvl) + 35, farm_petal: 4 * getSequence(1, lvl) + 10};
    }, effect: [
        {name: 'currencyFarmSeedHullCap', type: 'base', value: lvl => lvl * 20},
        {name: 'currencyFarmBugCap', type: 'base', value: lvl => lvl * 20},
        {name: 'currencyFarmPetalCap', type: 'base', value: lvl => lvl * 10}
    ]},
    gutter: {cap: 10, requirementBase, requirementStat, requirementValue: 8, price(lvl) {
        return {farm_gold: Math.round(Math.pow(1.35, lvl) * (lvl + 1) * 100)};
    }, effect: [
        {name: 'currencyFarmRainwaterGain', type: 'base', value: lvl => lvl}
    ]},
    lectern: {cap: 2, hasDescription: true, note: 'farm_12', requirementBase, requirementStat, requirementValue: 9, price(lvl) {
        return {farm_flower: buildNum(3.5, 'M') * Math.pow(buildNum(3, 'M'), lvl), farm_petal: 75 * Math.pow(5, lvl)};
    }, effect: [
        {name: 'lectern', type: 'farmBuilding', value: lvl => lvl}
    ]},
    pheromones: {cap: 25, requirementBase, requirementStat, requirementValue: 9, price(lvl) {
        return {
            farm_petal: Math.round(4 * lvl * Math.pow(1.05, lvl) + 4),
            farm_bug: Math.round(5 * lvl * Math.pow(1.1, Math.max(0, lvl - 10)) + 10),
            farm_butterfly: Math.round(lvl * Math.pow(1.1, Math.max(0, lvl - 10)) + 2),
        };
    }, effect: [
        {name: 'currencyFarmBerryGain', type: 'mult', value: lvl => lvl * 0.15 + 1},
        {name: 'farmExperience', type: 'mult', value: lvl => lvl * 0.04 + 1},
    ]},
    perfume: {cap: 20, note: 'farm_13', requirementBase, requirementStat, requirementValue: 9, price(lvl) {
        return {farm_berry: buildNum(9, 'M') * Math.pow(1.45, lvl), farm_bug: Math.round(2 * lvl * Math.pow(1.1, Math.max(0, lvl - 10)) + 10)};
    }, effect: [
        {name: 'currencyFarmBugCap', type: 'base', value: lvl => lvl * 10},
        {name: 'farmRareDropChance', type: 'base', value: lvl => lvl * 0.01},
    ]},
    mediumCrate: {cap: 8, requirementBase, requirementStat, requirementValue: 10, price(lvl) {
        return {farm_vegetable: buildNum(90, 'M') * Math.pow(1.75, lvl), farm_grain: buildNum(54, 'M') * Math.pow(2.1, lvl)};
    }, effect: [
        {name: 'currencyFarmSeedHullCap', type: 'base', value: lvl => lvl * 25},
        {name: 'currencyFarmGrassCap', type: 'base', value: lvl => lvl * 40}
    ]},
    stompedSeeds: {cap: 25, requirementBase, requirementStat, requirementValue: 10, price(lvl) {
        return {farm_seedHull: Math.round(Math.pow(1.15, lvl) * 150)};
    }, effect: [
        {name: 'farmCropGain', type: 'mult', value: lvl => Math.pow(1.12, lvl)}
    ]},
    insectParadise: {cap: 6, requirementBase, requirementStat, requirementValue: 11, price(lvl) {
        return {farm_berry: buildNum(750, 'M') * Math.pow(2.4, lvl), farm_petal: Math.round(Math.pow(1.75, lvl) * 11)};
    }, effect: [
        {name: 'currencyFarmBugCap', type: 'base', value: lvl => lvl * 40},
        {name: 'currencyFarmButterflyCap', type: 'base', value: lvl => lvl * 5},
        {name: 'currencyFarmLadybugCap', type: 'base', value: lvl => lvl * 30}
    ]},
    goldenTools: {cap: 20, requirementBase, requirementStat, requirementValue: 11, price(lvl) {
        return {farm_gold: Math.round(Math.pow(1.25, lvl) * 350)};
    }, effect: [
        {name: 'farmCropGain', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    butterflyWings: {cap: 6, requirementBase, requirementStat, requirementValue: 12, price(lvl) {
        return {farm_butterfly: Math.round(Math.pow(1.35, lvl) * 14)};
    }, effect: [
        {name: 'currencyFarmPetalCap', type: 'base', value: lvl => lvl * 15}
    ]},
    fertileGround: {cap: 40, requirementBase, requirementStat, requirementValue: 12, price(lvl) {
        return {farm_berry: buildNum(4, 'B') * Math.pow(2.25, lvl), farm_flower: buildNum(3.3, 'B') * Math.pow(2.25, lvl)};
    }, effect: [
        {name: 'currencyFarmVegetableGain', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    pinwheel: {cap: 1, hasDescription: true, note: 'farm_17', requirementBase, requirementStat, requirementValue: 13, price() {
        return {farm_flower: buildNum(250, 'B'), farm_petal: 150, farm_ladybug: 50};
    }, effect: [
        {name: 'pinwheel', type: 'farmBuilding', value: lvl => lvl}
    ]},
    pileOfPlants: {cap: 15, requirementBase, requirementStat, requirementValue: 13, price(lvl) {
        return {
            farm_seedHull: Math.round(Math.pow(1.24, lvl) * 225),
            farm_grass: Math.round(Math.pow(1.15, lvl) * (lvl * 0.2 + 1) * 300),
            farm_petal: Math.round(Math.pow(1.2, lvl) * 90),
        };
    }, effect: [
        {name: 'farmCropGain', type: 'mult', value: lvl => Math.pow(1.15, lvl)},
    ]},
    compostBin: {cap: 15, requirementBase, requirementStat, requirementValue: 13, price(lvl) {
        return {
            farm_vegetable: buildNum(40, 'B') * Math.pow(lvl * 0.25 + 4, lvl),
            farm_flower: buildNum(12, 'B') * Math.pow(lvl * 0.3 + 4, lvl),
        };
    }, effect: [
        {name: 'farmExperience', type: 'base', value: lvl => lvl * 0.04},
        {name: 'farmRareDropChance', type: 'base', value: lvl => lvl * 0.01},
    ]},
    mysticGround: {cap: 40, requirementBase, requirementStat, requirementValue: 13, price(lvl) {
        return {farm_vegetable: buildNum(37.5, 'B') * Math.pow(2.25, lvl), farm_ladybug: Math.round(Math.pow(1.12, lvl) * 10)};
    }, effect: [
        {name: 'currencyFarmGrainGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'currencyFarmLadybugCap', type: 'base', value: lvl => lvl * 20}
    ]},
    fertilizerBag: {cap: 1, requirementBase, requirementStat, requirementValue: 14, price() {
        return {farm_gold: 700};
    }, effect: [
        {name: 'farm_weedKiller', type: 'findConsumable', value: lvl => lvl >= 1},
        {name: 'farm_turboGrow', type: 'findConsumable', value: lvl => lvl >= 1},
        {name: 'farm_premium', type: 'findConsumable', value: lvl => lvl >= 1},
        {name: 'farm_supplementsL', type: 'findConsumable', value: lvl => lvl >= 1},
    ]},
    bigCrate: {cap: 10, requirementBase, requirementStat, requirementValue: 14, price(lvl) {
        return {farm_berry: buildNum(190, 'B') * Math.pow(1.85, lvl), farm_grain: buildNum(240, 'B') * Math.pow(1.85, lvl)};
    }, effect: [
        {name: 'currencyFarmSeedHullCap', type: 'base', value: lvl => lvl * 60},
        {name: 'currencyFarmGrassCap', type: 'base', value: lvl => lvl * 80},
        {name: 'currencyFarmPetalCap', type: 'base', value: lvl => lvl * 25}
    ]},
    artificialWebs: {cap: 3, requirementBase, requirementStat, requirementValue: 15, price(lvl) {
        return {farm_flower: buildNum(1, 'T') * Math.pow(9, lvl), farm_ladybug: Math.round(Math.pow(1.5, lvl) * 100)};
    }, effect: [
        {name: 'currencyFarmSpiderCap', type: 'base', value: lvl => lvl * 4}
    ]},
    studyInsects: {cap: 10, requirementBase, requirementStat, requirementValue: 15, price(lvl) {
        return {farm_berry: buildNum(1.35, 'T') * Math.pow(2.65, lvl), farm_butterfly: Math.round(Math.pow(1.25, lvl) * 28)};
    }, effect: [
        {name: 'farmExperience', type: 'mult', value: lvl => lvl * 0.1 + 1},
    ]},
    beehive: {cap: 20, requirementBase, requirementStat, requirementValue: 16, price(lvl) {
        return {farm_flower: buildNum(22.5, 'T') * Math.pow(1.4, lvl), farm_seedHull: Math.round(Math.pow(1.14, lvl) * 280), farm_bug: Math.round(Math.pow(1.16, lvl) * 160)};
    }, effect: [
        {name: 'currencyFarmSpiderCap', type: 'base', value: lvl => lvl},
        {name: 'currencyFarmBeeCap', type: 'base', value: lvl => lvl * 200},
    ]},
    potOfSand: {cap: 1, hasDescription: true, requirementBase, requirementStat, requirementValue: 16, price() {
        return {farm_gold: 1500, farm_butterfly: 100, farm_ladybug: 1100};
    }, effect: [
        {name: 'cactus', type: 'farmSeed', value: lvl => lvl >= 1},
    ]},
    darkCorner: {cap: 10, requirementBase, requirementStat, requirementValue: 17, price(lvl) {
        return {farm_vegetable: buildNum(175, 'T') * Math.pow(1.75, lvl), farm_grain: buildNum(300, 'T') * Math.pow(1.6, lvl), farm_bug: Math.round(Math.pow(1.24, lvl) * 115)};
    }, effect: [
        {name: 'currencyFarmSpiderCap', type: 'base', value: lvl => lvl * 2},
        {name: 'farmRareDropChance', type: 'base', value: lvl => lvl * 0.01},
    ]},
    carrotCake: {cap: 20, requirementBase, requirementStat, requirementValue: 17, price(lvl) {
        return {farm_vegetable: 2e15 * Math.pow(2.05, lvl), farm_grain: 3e15 * Math.pow(2.25, lvl)};
    }, effect: [
        {name: 'currencyFarmBerryGain', type: 'mult', value: lvl => lvl * 0.15 + 1},
    ]},
    flag: {cap: 1, hasDescription: true, note: 'farm_20', requirementBase, requirementStat, requirementValue: 18, price() {
        return {farm_gold: buildNum(10, 'K'), farm_spider: 50, farm_bee: 2500};
    }, effect: [
        {name: 'flag', type: 'farmBuilding', value: lvl => lvl},
    ]},
    honeyJar: {cap: 20, requirementBase, requirementStat, requirementValue: 18, price(lvl) {
        return {farm_berry: 1.5e16 * Math.pow(3.3, lvl), farm_bee: Math.round(Math.pow(1.1, lvl) * 1250)};
    }, effect: [
        {name: 'currencyFarmFlowerGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
    ]},
    wormBait: {cap: 10, requirementBase, requirementStat, requirementValue: 19, price(lvl) {
        return {farm_grass: Math.round(Math.pow(1.22, lvl) * 1350), farm_petal: Math.round(Math.pow(1.19, lvl) * 175), farm_butterfly: Math.round(Math.pow(1.16, lvl) * 50)};
    }, effect: [
        {name: 'currencyFarmVegetableGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'currencyFarmBugCap', type: 'base', value: lvl => lvl * 20},
        {name: 'currencyFarmLadybugCap', type: 'base', value: lvl => lvl * 35},
    ]},
    hayStorage: {cap: 8, requirementBase, requirementStat, requirementValue: 19, price(lvl) {
        return {farm_flower: 6.7e17 * Math.pow(5.5, lvl), farm_seedHull: Math.round(Math.pow(1.2, lvl) * 600)};
    }, effect: [
        {name: 'currencyFarmGrainGain', type: 'mult', value: lvl => lvl * 0.15 + 1},
        {name: 'currencyFarmGrassCap', type: 'base', value: lvl => lvl * 60},
    ]},
    shinySoil: {cap: 20, requirementBase, requirementStat, requirementValue: 20, price(lvl) {
        return {farm_bee: Math.round(Math.pow(1.16, lvl) * 2000), farm_petal: lvl * 30 + 500};
    }, effect: [
        {name: 'currencyFarmBerryGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'currencyFarmButterflyCap', type: 'base', value: lvl => lvl * 4},
    ]},
    fieldBlessing: {cap: 20, requirementBase, requirementStat, requirementValue: 20, price(lvl) {
        return {farm_vegetable: 5.1e20 * Math.pow(2.65, lvl), farm_spider: lvl * 4 + 40};
    }, effect: [
        {name: 'farmCropGain', type: 'mult', value: lvl => lvl * 0.05 + 1},
        {name: 'farmExperience', type: 'mult', value: lvl => lvl * 0.05 + 1},
    ]},
    bigFertilizerBag: {cap: 1, requirementBase, requirementStat, requirementValue: 21, price() {
        return {farm_gold: 2000};
    }, effect: [
        {name: 'farm_analyzing', type: 'findConsumable', value: lvl => lvl >= 1},
        {name: 'farm_superJuicy', type: 'findConsumable', value: lvl => lvl >= 1},
        {name: 'farm_pellets', type: 'findConsumable', value: lvl => lvl >= 1},
        {name: 'farm_supplementsXL', type: 'findConsumable', value: lvl => lvl >= 1},
    ]},
    smellyMud: {cap: 15, requirementBase, requirementStat, requirementValue: 21, price(lvl) {
        return {farm_seedHull: Math.round(Math.pow(1.12, lvl) * 1000), farm_grass: lvl * 600 + 4000, farm_bug: Math.round(Math.pow(1.08, lvl) * 1350)};
    }, effect: [
        {name: 'currencyFarmVegetableGain', type: 'mult', value: lvl => lvl * 0.05 + 1},
        {name: 'currencyFarmBerryGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
    ]},
    openSesame: {cap: 20, requirementBase, requirementStat, requirementValue: 22, price(lvl) {
        return {farm_flower: 1.7e23 * Math.pow(1.6, lvl), farm_smallSeed: Math.round(Math.pow(1.28, lvl) * 225)};
    }, effect: [
        {name: 'currencyFarmGrainGain', type: 'mult', value: lvl => lvl * 0.05 + 1},
        {name: 'currencyFarmSeedHullCap', type: 'base', value: lvl => lvl * 50},
        {name: 'currencyFarmSmallSeedCap', type: 'base', value: lvl => lvl * 150},
    ]},
    prettyFlowerPot: {cap: 1, hasDescription: true, requirementBase, requirementStat, requirementValue: 22, price() {
        return {farm_gold: 3500, farm_smallSeed: 975};
    }, effect: [
        {name: 'cress', type: 'farmSeed', value: lvl => lvl >= 1},
    ]},
    flowerPainting: {cap: 20, requirementBase, requirementStat, requirementValue: 23, price(lvl) {
        return {farm_grain: 9.2e25 * Math.pow(1.6, lvl), farm_bee: Math.round(Math.pow(1.12, lvl) * 3000)};
    }, effect: [
        {name: 'currencyFarmFlowerGain', type: 'mult', value: lvl => lvl * 0.05 + 1},
        {name: 'currencyFarmBeeCap', type: 'base', value: lvl => lvl * 150},
    ]},
    plantEncyclopedia: {cap: 90, requirementBase, requirementStat, requirementValue: 24, price(lvl) {
        return {farm_grain: 7.5e28 * Math.pow(1.5, lvl)};
    }, effect: [
        {name: 'farmExperience', type: 'mult', value: lvl => lvl * 0.1 + 1},
    ]},
    smallSeedBag: {cap: 12, requirementBase, requirementStat, requirementValue: 25, price(lvl) {
        return {farm_vegetable: 1.4e32 * Math.pow(2.85, lvl), farm_berry: 1.75e32 * Math.pow(2.75, lvl), farm_petal: Math.round(Math.pow(1.15, lvl) * 650)};
    }, effect: [
        {name: 'farmCropGain', type: 'mult', value: lvl => lvl * 0.075 + 1},
        {name: 'currencyFarmSmallSeedCap', type: 'base', value: lvl => lvl * 350},
    ]},
    crateOfGrain: {cap: 60, requirementBase, requirementStat, requirementValue: 26, price(lvl) {
        return {farm_seedHull: Math.round(Math.pow(1.05, lvl) * 1200), farm_smallSeed: Math.round(Math.pow(1.08, lvl) * 1350)};
    }, effect: [
        {name: 'currencyFarmGrainGain', type: 'mult', value: lvl => lvl * 0.15 + 1},
    ]},
    crateOfFlowers: {cap: 60, requirementBase, requirementStat, requirementValue: 27, price(lvl) {
        return {farm_petal: Math.round(Math.pow(1.05, lvl) * 750), farm_ladybug: Math.round(Math.pow(1.07, lvl) * 1500)};
    }, effect: [
        {name: 'currencyFarmFlowerGain', type: 'mult', value: lvl => lvl * 0.15 + 1},
    ]},
    crateOfVegetables: {cap: 60, requirementBase, requirementStat, requirementValue: 28, price(lvl) {
        return {farm_bug: Math.round(Math.pow(1.05, lvl) * 1050), farm_spider: Math.round(Math.pow(1.075, lvl) * 40)};
    }, effect: [
        {name: 'currencyFarmVegetableGain', type: 'mult', value: lvl => lvl * 0.15 + 1},
    ]},
    crateOfBerries: {cap: 60, requirementBase, requirementStat, requirementValue: 29, price(lvl) {
        return {farm_butterfly: Math.round(Math.pow(1.06, lvl) * 100), farm_bee: Math.round(Math.pow(1.09, lvl) * 2500)};
    }, effect: [
        {name: 'currencyFarmBerryGain', type: 'mult', value: lvl => lvl * 0.15 + 1},
    ]},
    ancientFlowerPot: {cap: 1, hasDescription: true, requirementBase, requirementStat, requirementValue: 30, price() {
        return {farm_gold: 2.5e4, farm_smallSeed: 1e4, farm_snail: 50};
    }, effect: [
        {name: 'ancientFern', type: 'farmSeed', value: lvl => lvl >= 1},
    ]},
    trailOfSlime: {cap: 10, requirementBase, requirementStat, requirementValue: 30, price(lvl) {
        return {farm_flower: 3.15e51 * Math.pow(lvl * 0.15 + 1.45, lvl), farm_grass: Math.round(Math.pow(1.12, lvl) * 6000)};
    }, effect: [
        {name: 'farmExperience', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'currencyFarmSnailCap', type: 'base', value: lvl => lvl * 5},
    ]},
    bucketOfSnails: {cap: 25, requirementBase, requirementStat, requirementValue: 31, price(lvl) {
        return {farm_grain: 1e56 * Math.pow(2.35, lvl), farm_snail: Math.round(Math.pow(1.05, lvl) * (lvl * 3 + 24))};
    }, effect: [
        {name: 'farmCropGain', type: 'mult', value: lvl => lvl * 0.08 + 1},
    ]},
};
const FA_UPGM = {
    biggerVegetables: {type: 'premium', price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 80};
    }, effect: [
        {name: 'currencyFarmVegetableGain', type: 'mult', value: lvl => getSequence(2, lvl) * 0.5 + 1}
    ]},
    biggerBerries: {type: 'premium', requirement() {
        return FSTORE.state.upgrade.item.farm_seedBox.level >= 1;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 80};
    }, effect: [
        {name: 'currencyFarmBerryGain', type: 'mult', value: lvl => getSequence(2, lvl) * 0.5 + 1}
    ]},
    biggerGrain: {type: 'premium', requirement() {
        return FSTORE.state.upgrade.item.farm_seedBox.level >= 2;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 80};
    }, effect: [
        {name: 'currencyFarmGrainGain', type: 'mult', value: lvl => getSequence(2, lvl) * 0.5 + 1}
    ]},
    biggerFlowers: {type: 'premium', requirement() {
        return FSTORE.state.upgrade.item.farm_seedBox.level >= 3;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 80};
    }, effect: [
        {name: 'currencyFarmFlowerGain', type: 'mult', value: lvl => getSequence(2, lvl) * 0.5 + 1}
    ]},
    moreExperience: {type: 'premium', requirement() {
        return FSTORE.state.unlock.farmCropExp.see;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 120};
    }, effect: [
        {name: 'farmExperience', type: 'base', value: lvl => lvl * 0.25}
    ]},
    premiumGardenGnome: {type: 'premium', hasDescription: true, cap: 5, hideCap: true, requirement(lvl) {
        return FSTORE.state.upgrade.item.farm_gardenGnome.level >= (lvl + 1);
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 180};
    }, effect: [
        {name: 'gardenGnome', type: 'farmBuildingPremium', value: lvl => lvl}
    ], onBuy() {
        FSTORE.dispatch('farm/upgradeBuilding', 'gardenGnome');
    }},
    premiumSprinkler: {type: 'premium', hasDescription: true, cap: 2, hideCap: true, requirement(lvl) {
        return FSTORE.state.upgrade.item.farm_sprinkler.level >= (lvl + 1);
    }, price(lvl) {
        return {gem_ruby: Math.pow(2, lvl) * 500};
    }, effect: [
        {name: 'sprinkler', type: 'farmBuildingPremium', value: lvl => lvl}
    ], onBuy() {
        FSTORE.dispatch('farm/upgradeBuilding', 'sprinkler');
    }},
    premiumLectern: {type: 'premium', hasDescription: true, cap: 2, hideCap: true, requirement(lvl) {
        return FSTORE.state.upgrade.item.farm_lectern.level >= (lvl + 1);
    }, price(lvl) {
        return {gem_ruby: Math.pow(2, lvl) * 675};
    }, effect: [
        {name: 'lectern', type: 'farmBuildingPremium', value: lvl => lvl}
    ], onBuy() {
        FSTORE.dispatch('farm/upgradeBuilding', 'lectern');
    }},
    premiumPinwheel: {type: 'premium', hasDescription: true, cap: 1, hideCap: true, requirement(lvl) {
        return FSTORE.state.upgrade.item.farm_pinwheel.level >= (lvl + 1);
    }, price(lvl) {
        return {gem_ruby: Math.pow(3, lvl) * 1200};
    }, effect: [
        {name: 'pinwheel', type: 'farmBuildingPremium', value: lvl => lvl}
    ], onBuy() {
        FSTORE.dispatch('farm/upgradeBuilding', 'pinwheel');
    }},
    premiumFlag: {type: 'premium', hasDescription: true, cap: 1, hideCap: true, requirement(lvl) {
        return FSTORE.state.upgrade.item.farm_flag.level >= (lvl + 1);
    }, price(lvl) {
        return {gem_ruby: Math.pow(4, lvl) * 2100};
    }, effect: [
        {name: 'flag', type: 'farmBuildingPremium', value: lvl => lvl}
    ], onBuy() {
        FSTORE.dispatch('farm/upgradeBuilding', 'flag');
    }}
};
const FA_RELIC = {
    lightningRod: {icon: 'mdi-home-lightning-bolt-outline', color: 'deep-orange', effect() {return [
        {name: 'currencyFarmRainwaterCap', type: 'base', value: 30}
    ];}, glyph() {return {cloud: 3};}, active: {
        cost: {relic_power: 5},
        params() {
            const rainwaterMult = 1.5;
            let careApplied = 0;

            FSTORE.state.farm.field.forEach(row => {
                row.forEach(cell => {
                    if (cell !== null && cell.type === 'crop' && cell.cache.careWeight > 0) {
                        const geneStats = FSTORE.getters['farm/cropGeneStats'](cell.crop, cell.fertilizer);
                        FSTORE.state.farm.careCanMax.forEach(elem => {
                            if (geneStats.care[elem] && cell.care[elem] < geneStats.care[elem].max) {
                                const crop = FSTORE.state.farm.crop[cell.crop];
                                const growDiv = Math.sqrt((cell.giant ? crop.giantGrow : crop.grow) / 10) * 8;
                                careApplied += Math.ceil((geneStats.care[elem].max - cell.care[elem]) * growDiv / geneStats.care[elem].amount);
                            }
                        });
                    }
                });
            });

            return [Math.ceil(careApplied * rainwaterMult), rainwaterMult, careApplied];
        },
        description() {
            return [];
        },
        formula(params) {
            return [formatInt(params[0]), formatNum(params[1] * 100)];
        },
        disabled(params) {
            return FSTORE.state.cryolab.farm.active || params[2] <= 0 || FSTORE.state.currency.farm_rainwater.value < params[0];
        },
        trigger(params) {
            FSTORE.dispatch('currency/spend', {feature: 'farm', name: 'rainwater', amount: params[0]});

            FSTORE.state.farm.field.forEach((row, y) => {
                row.forEach((cell, x) => {
                    if (cell !== null && cell.type === 'crop' && cell.cache.careWeight > 0) {
                        const geneStats = FSTORE.getters['farm/cropGeneStats'](cell.crop, cell.fertilizer);
                        FSTORE.state.farm.careCanMax.forEach(elem => {
                            if (geneStats.care[elem] && cell.care[elem] < geneStats.care[elem].max) {
                                FSTORE.commit('farm/updateFieldCare', {x, y, key: elem, value: geneStats.care[elem].max});
                            }
                        });
                    }
                });
            });

            FSTORE.commit('stat/add', {feature: 'farm', name: 'care', value: params[2]});
        }
    }},
    goldenCarrot: {icon: 'mdi-carrot', color: 'amber', effect() {return [
        {name: 'currencyFarmVegetableGain', type: 'mult', value: 1.4}
    ];}, glyph() {return {rain: 4};}},
    goldenApple: {icon: 'mdi-food-apple', color: 'amber', effect() {return [
        {name: 'currencyFarmBerryGain', type: 'mult', value: 1.4}
    ];}, glyph() {return {sun: 3, cloud: 1};}},
    popcorn: {icon: 'mdi-popcorn', color: 'pale-yellow', effect() {return [
        {name: 'currencyFarmGrainGain', type: 'mult', value: 1.4}
    ];}, glyph() {return {cloud: 4};}},
    roseQuartz: {icon: 'mdi-crystal-ball', color: 'pale-pink', effect() {return [
        {name: 'currencyFarmFlowerGain', type: 'mult', value: 1.4}
    ];}, glyph() {return {rain: 2, cloud: 3};}},
    goldenSeed: {icon: 'mdi-seed', color: 'amber', effect() {return [
        {name: 'goldenRose', type: 'farmSeed', value: true}
    ];}, glyph() {return {sun: 6};}},
};
const FA_ACHIEVEMENT = {
    harvests: {value: () => FSTORE.state.stat.farm_harvests.total, milestones: lvl => Math.round(Math.pow(lvl + 1, 2) * Math.pow(1.5, lvl) * 10)},
    maxOvergrow: {value: () => FSTORE.state.stat.farm_maxOvergrow.total, display: 'percent', milestones: lvl => getSequence(2, lvl + 1) * 0.5 + 1, relic: {4: 'lightningRod'}},
    bestPrestige: {value: () => FSTORE.state.stat.farm_bestPrestige.total, cap: 18, milestones: lvl => lvl * 2 + 6},
    vegetable: {value: () => FSTORE.state.stat.farm_vegetable.total, milestones: lvl => Math.pow(81, lvl) * 250, relic: {2: 'goldenCarrot'}},
    berry: {value: () => FSTORE.state.stat.farm_berry.total, milestones: lvl => Math.pow(81, lvl) * 750, relic: {3: 'goldenApple'}},
    grain: {value: () => FSTORE.state.stat.farm_grain.total, milestones: lvl => Math.pow(81, lvl) * 2250, relic: {4: 'popcorn'}},
    flower: {value: () => FSTORE.state.stat.farm_flower.total, milestones: lvl => Math.pow(81, lvl) * 6750, relic: {5: 'roseQuartz'}},
    gold: {value: () => FSTORE.state.stat.farm_gold.total, milestones: lvl => Math.round(Math.pow(lvl + 2, 2) * Math.pow(2.25, lvl) * 2.5), relic: {6: 'goldenSeed'}},
    care: {value: () => FSTORE.state.stat.farm_care.total, cap: 10, milestones: lvl => Math.round(Math.pow(lvl + 2, 2) * Math.pow(1.4, lvl) * 10)},
};
const FA_NOTEDATA = ['g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g'];
const FA_MULTDATA = {
        farmExperience: {baseValue: 1, unlock: 'farmCropExp'},
        farmGoldChance: {display: 'percent'},
        farmGrow: {display: 'time', isPositive: false},
        farmOvergrow: {display: 'percent'},
        farmHuntChance: {display: 'percent'},
        farmRareDropChance: {display: 'percent', group: ['farmHuntChance']},
        farmMystery: {},
        farmCropGain: {group: ['currencyFarmVegetableGain', 'currencyFarmBerryGain', 'currencyFarmGrainGain', 'currencyFarmFlowerGain']},
        farmAllGain: {group: ['farmCropGain', 'farmExperience', 'farmGoldChance', 'farmRareDropChance']},
        farmLuckyHarvestMult: {display: 'mult', baseValue: 8},
        farmMaxCare: {baseValue: 2, unlock: 'farmCare'},
        farmCareWeight: {baseValue: 1, unlock: 'farmCare'},
    };
const FA_UNLOCKDATA = [
        'farmFeature', 'farmDisableEarlyGame', 'farmCare', 'farmCropExp', 'farmFertilizer',
        'farmAdvancedCardPack', 'farmLuxuryCardPack', 'farmPowerCardPack', 'farmSeedCardPack',
        ...Object.keys(FA_GENELEVELS).map(elem => 'farmGeneLevel' + elem),
    ];
const FA_STATDATA = {
        harvests: {showInStatistics: true},
        maxOvergrow: {showInStatistics: true, display: 'percent'},
        bestPrestige: {showInStatistics: true},
        totalMystery: {showInStatistics: true},
        care: {showInStatistics: true},
    };
const FA_CURDATA = {
        vegetable: {color: 'orange', icon: 'mdi-carrot', gainMult: {}},
        berry: {color: 'purple', icon: 'mdi-fruit-grapes', gainMult: {}},
        grain: {color: 'yellow', icon: 'mdi-barley', gainMult: {}},
        flower: {color: 'pink', icon: 'mdi-flower', gainMult: {}},
        rainwater: {color: 'dark-blue', icon: 'mdi-water', isHidden: true, overcapMult: 0.9, overcapScaling: 0.9, gainMult: {baseValue: 10, display: 'perHour'}, showGainMult: true, showGainTimer: true, capMult: {baseValue: 20}},
        gold: {color: 'amber', icon: 'mdi-gold', display: 'int'},
        mixedSeeds: {color: 'lime', icon: 'mdi-grain', showHint: true, display: 'int'},
        cactusSeed: {color: 'green', icon: 'mdi-grain', showHint: true, display: 'int'},
        seedHull: {color: 'beige', icon: 'mdi-seed', display: 'int', overcapMult: 1, overcapScaling: 0, capMult: {baseValue: 50}},
        grass: {color: 'green', icon: 'mdi-grass', showHint: true, display: 'int', overcapMult: 1, overcapScaling: 0, capMult: {baseValue: 200}},
        petal: {color: 'light-blue', icon: 'mdi-leaf', display: 'int', overcapMult: 1, overcapScaling: 0, currencyMult: {
            currencyFarmFlowerGain: {type: 'mult', value: val => (val > 1000 ? (Math.sqrt(val / 1000) * 1000) : val) * 0.03 + 1}
        }, capMult: {baseValue: 50}},
        bug: {color: 'brown', icon: 'mdi-bug', display: 'int', overcapMult: 1, overcapScaling: 0, capMult: {baseValue: 50}},
        butterfly: {color: 'babypink', icon: 'mdi-butterfly', display: 'int', overcapMult: 1, overcapScaling: 0, capMult: {baseValue: 30}},
        ladybug: {color: 'pale-red', icon: 'mdi-ladybug', display: 'int', overcapMult: 1, overcapScaling: 0, currencyMult: {
            farmRareDropChance: {type: 'base', value: val => (val > 1000 ? (Math.sqrt(val / 1000) * 1000) : val) * 0.0001}
        }, capMult: {baseValue: 150}},
        spider: {color: 'dark-grey', icon: 'mdi-spider', display: 'int', overcapMult: 1, overcapScaling: 0, currencyMult: {
            currencyFarmBugCap: {type: 'base', value: val => val * 10},
            currencyFarmButterflyCap: {type: 'base', value: val => val},
            currencyFarmLadybugCap: {type: 'base', value: val => val * 15},
        }, capMult: {baseValue: 20}},
        bee: {color: 'yellow', icon: 'mdi-bee', display: 'int', overcapMult: 1, overcapScaling: 0, currencyMult: {
            currencyFarmBerryGain: {type: 'mult', value: val => (val > 1e5 ? (Math.sqrt(val / 1e5) * 1e5) : val) * 0.001 + 1}
        }, capMult: {baseValue: 1000}},
        mysteryStone: {color: 'pale-purple', icon: 'mdi-eye-circle-outline', display: 'int', overcapMult: 0, capMult: {baseValue: 1337}},
        smallSeed: {color: 'brown', icon: 'mdi-grain', display: 'int', overcapMult: 1, overcapScaling: 0, capMult: {baseValue: 800}},
        ancientSeed: {color: 'pale-purple', icon: 'mdi-rugby', showHint: true, display: 'int'},
        snail: {color: 'lime', icon: 'mdi-snail', display: 'int', overcapMult: 1, overcapScaling: 0, capMult: {baseValue: 40}},
        oldRoot: {color: 'brown', icon: 'mdi-carrot', display: 'int', overcapMult: 0, capMult: {baseValue: 1000}},
    };
const FA_UPGDATA = {
    ...FA_UPG1,
    ...FA_UPGM,
};

const FA_GOOBOO = {
  crop: FA_CROP,
  building: FA_BUILDING,
  gene: FA_GENE,
  geneLevels: FA_GENELEVELS,
  fertilizer: FA_FERTILIZER,
  upgrade: FA_UPGDATA,
  relic: FA_RELIC,
  achievement: FA_ACHIEVEMENT,
  note: FA_NOTEDATA,
  mult: FA_MULTDATA,
  unlock: FA_UNLOCKDATA,
  stat: FA_STATDATA,
  currency: FA_CURDATA
};

// 供 fa_core 使用
if (typeof module !== "undefined") module.exports = { FA_GOOBOO };