/* ============================================================
 * ho_data.js —— 降妖(horde) 数据（自动生成：照抄 gooboo，勿手改数值）
 * 机械变换：import/export 剥离；函数内 `store`->`HOSTORE`；card->HO_CARDLIST。
 * ============================================================ */

/* horde 常量（照抄 constants.js；用 var 便于与已有全局共存） */
var HORDE_COMBO_ATTACK = 1.025;
var HORDE_COMBO_HEALTH = 1.01;
var HORDE_COMBO_BONE = 0.012;
var HORDE_MONSTER_PART_MIN_ZONE = 10;
var HORDE_SHARD_PER_EQUIP = 3;
var HORDE_SHARD_INCREMENT = 3;
var HORDE_RAMPAGE_ENEMY_TIME = 60;
var HORDE_RAMPAGE_BOSS_TIME = 300;
var HORDE_RAMPAGE_ATTACK = 2;
var HORDE_RAMPAGE_STUN_RESIST = 1;
var HORDE_INACTIVE_ITEM_COOLDOWN = 0.1;
var HORDE_REPLENISH_DIVISION_SHIELD = 0.25;
var HORDE_ENEMY_RESPAWN_TIME = 10;
var HORDE_ENEMY_RESPAWN_MAX = 5;
var HORDE_RARE_LOOT_MIN_ZONE = 21;
var HORDE_RARE_LOOT_HOLD = 5;
var HORDE_HEIRLOOM_MIN_ZONE = 31;
var HORDE_HEIRLOOM_BOOST_EXPONENT = 0.02;
var HORDE_RAID_KEYS_PER_DAY = 4;
var HORDE_RAID_KEYS_PER_RAIDBOSS = 10;
var HORDE_KEYS_PER_TOWER = 3;
var HORDE_HEIRLOOM_TOWER_FLOORS = 5;
var HORDE_HEIRLOOM_CHANCE_PER_NOSTALGIA = 0.001;
var HORDE_DAMAGE_INCREASE_PER_STRENGTH = 0.03;
var HORDE_SHARD_CHANCE_REDUCTION = 1.075;
var HORDE_STACKING_COOLDOWN = 72000;
var HORDE_ELEMENTAL_ZONE = 350;
var HORDE_BASE_ELEMENTAL_POWER = 20;
var HORDE_SKELETON_DIFFICULTY = 10;
var HORDE_SKELETON_TEETH = 10;
var HORDE_SKELETON_WEAKNESS_MULT = 1e6;
var HORDE_TOOTH_CHANCE_REDUCTION = 1.065;
// SECONDS_PER_MINUTE 由框架(lm)以 const 全局提供，此处不再重复声明以免 SyntaxError
// SECONDS_PER_HOUR / SECONDS_PER_DAY 由框架(lm)以 const 全局提供，不再重复声明以免 SyntaxError

const HO_CARDLIST = (function() {
  return [
    {id: 1, collection: 'dangersInTheDark', power: 3, color: 'green', icons: [
        {"x": -0.1, "y": 0.1, "rotate": -20, "size": 2.5, "icon": "mdi-chart-bubble"},
        {"x": 0.85, "y": 0.1, "rotate": 0, "size": 1.5, "icon": "mdi-snake"},
        {"x": -0.85, "y": 0.05, "rotate": 0, "size": 2, "icon": "mdi-human-handsdown"}
    ]},
    {id: 2, collection: 'dangersInTheDark', power: 2, reward: [
        {name: 'hordeBossRequirement', type: 'base', value: -5},
    ], color: 'darker-grey', icons: [
        {"x": 0, "y": 0.1, "rotate": 0, "size": 3, "icon": "mdi-ellipse-outline"},
        {"x": -0.85, "y": 0.9, "rotate": 0, "size": 1.4, "icon": "mdi-grass"},
        {"x": 0.85, "y": 0.75, "rotate": 0, "size": 1.2, "icon": "mdi-grass"},
        {"x": 0.85, "y": -0.8, "rotate": 0, "size": 1, "icon": "mdi-grass"},
        {"x": 0, "y": -1, "rotate": 0, "size": 0.9, "icon": "mdi-grass"}
    ]},
    {id: 3, collection: 'dangersInTheDark', power: 1, reward: [
        {name: 'currencyHordeBoneGain', type: 'mult', value: 1.2},
        {name: 'currencyHordeBoneCap', type: 'mult', value: 1.35},
    ], color: 'orange-red', icons: [
        {"x": 0, "y": 0.8, "rotate": 0, "size": 3, "icon": "mdi-image-filter-hdr"},
        {"x": 0.15, "y": 0.55, "rotate": 0, "size": 1, "icon": "mdi-fountain"},
        {"x": 0.55, "y": -0.2, "rotate": -60, "size": 0.7, "icon": "mdi-motion"},
        {"x": -0.6, "y": -0.15, "rotate": -140, "size": 0.95, "icon": "mdi-motion"},
        {"x": -0.1, "y": -0.75, "rotate": -100, "size": 1.15, "icon": "mdi-motion"}
    ]},
    {id: 4, collection: 'dangersInTheDark', power: 2, reward: [
        {name: 'currencyHordeMonsterPartCap', type: 'base', value: 50},
    ], color: 'deep-purple', icons: [
        {"x": 0, "y": 0, "rotate": 0, "size": 2, "icon": "mdi-human-handsdown"},
        {"x": -0.3, "y": -0.7, "rotate": -30, "size": 0.75, "icon": "mdi-help"},
        {"x": 0.55, "y": -0.3, "rotate": 0, "size": 1, "icon": "mdi-map-legend"},
        {"x": -0.7, "y": 0.85, "rotate": 75, "size": 1.75, "icon": "mdi-chart-bubble"}
    ]},
    {id: 5, collection: 'dangersInTheDark', power: 2, reward: [
        {name: 'currencyHordeBoneGain', type: 'mult', value: 1.25},
    ], color: 'cyan', icons: [
        {"x": 0.6, "y": 0.2, "rotate": 0, "size": 2.5, "icon": "mdi-mirror-rectangle"},
        {"x": 0.65, "y": 0.5, "rotate": 0, "size": 1, "icon": "mdi-human-greeting"},
        {"x": 0.65, "y": 0.25, "rotate": 0, "size": 0.5, "icon": "mdi-skull"},
        {"x": -0.4, "y": 0.65, "rotate": 0, "size": 1.1, "icon": "mdi-human-handsdown"},
        {"x": -0.3, "y": 0.05, "rotate": 15, "size": 0.75, "icon": "mdi-exclamation-thick"}
    ]},
    {id: 6, collection: 'dangersInTheDark', power: 2, reward: [
        {name: 'hordeDivisionShield', type: 'base', value: 4},
    ], color: 'red', icons: [
        {"x": -0.95, "y": 0.8, "rotate": 0, "size": 1.5, "icon": "mdi-waves"},
        {"x": -0.3, "y": 0.8, "rotate": 0, "size": 1.5, "icon": "mdi-waves"},
        {"x": 0.3, "y": 0.8, "rotate": 0, "size": 1.5, "icon": "mdi-waves"},
        {"x": 0.95, "y": 0.8, "rotate": 0, "size": 1.5, "icon": "mdi-waves"},
        {"x": 0, "y": 0.46, "rotate": 0, "size": 1, "icon": "mdi-swim"},
        {"x": -0.7, "y": -0.15, "rotate": 0, "size": 1.8, "icon": "mdi-scent"},
        {"x": 0.7, "y": -0.55, "rotate": 0, "size": 1.9, "icon": "mdi-scent"},
        {"x": -0.05, "y": 0.1, "rotate": -20, "size": 0.8, "icon": "mdi-fire"}
    ]},

    {id: 7, collection: 'maintainingSafety', power: 2, reward: [
        {name: 'hordeEquipmentChance', type: 'mult', value: 1.6},
    ], color: 'pale-yellow', icons: [
        {"x": 0, "y": 1, "rotate": 90, "size": 2, "icon": "mdi-rectangle"},
        {"x": 0, "y": 0.35, "rotate": 0, "size": 1, "icon": "mdi-bag-personal"},
        {"x": 0.55, "y": 0.75, "rotate": 0, "size": 1.6, "icon": "mdi-human-greeting"},
        {"x": -0.9, "y": 0.75, "rotate": 0, "size": 1.55, "icon": "mdi-human-handsdown"}
    ]},
    {id: 8, collection: 'maintainingSafety', power: 2, reward: [
        {name: 'currencyHordeBoneCap', type: 'mult', value: 1.2},
        {name: 'currencyHordeMonsterPartCap', type: 'base', value: 30},
    ], color: 'cherry', icons: [
        {"x": -0.1, "y": 0.55, "rotate": 0, "size": 1.25, "icon": "mdi-wall"},
        {"x": 0.45, "y": 0.55, "rotate": 0, "size": 1.25, "icon": "mdi-wall"},
        {"x": 1, "y": 0.55, "rotate": 0, "size": 1.25, "icon": "mdi-wall"},
        {"x": -0.5, "y": 0.2, "rotate": -15, "size": 0.8, "icon": "mdi-hammer"},
        {"x": -0.85, "y": 0.45, "rotate": 0, "size": 1.6, "icon": "mdi-walk"}
    ]},
    {id: 9, collection: 'maintainingSafety', power: 2, reward: [
        {name: 'hordeHealth', type: 'mult', value: 1.3},
    ], color: 'indigo', icons: [
        {"x": -0.7, "y": 0, "rotate": 0, "size": 2.5, "icon": "mdi-home"},
        {"x": 0.7, "y": 0, "rotate": 0, "size": 2.5, "icon": "mdi-home"},
        {"x": 0.3, "y": -0.5, "rotate": 0, "size": 1, "icon": "mdi-cctv"}
    ]},
    {id: 10, collection: 'maintainingSafety', power: 0, reward: [
        {name: 'hordeRevive', type: 'base', value: 1},
    ], color: 'green', icons: [
        {"x": -0.75, "y": 0, "rotate": 20, "size": 0.75, "icon": "mdi-leaf"},
        {"x": 0.85, "y": 0.5, "rotate": -45, "size": 0.8, "icon": "mdi-leaf"},
        {"x": -0.4, "y": -0.05, "rotate": -105, "size": 0.85, "icon": "mdi-leaf"},
        {"x": 0.3, "y": -0.6, "rotate": 0, "size": 1.25, "icon": "mdi-mushroom"},
        {"x": -0.3, "y": 0.7, "rotate": 0, "size": 2, "icon": "mdi-book-open-page-variant-outline"},
        {"x": -0.55, "y": 0.7, "rotate": 0, "size": 0.6, "icon": "mdi-mushroom-off"}
    ]},
    {id: 11, collection: 'maintainingSafety', power: 2, reward: [
        {name: 'hordeRespawn', type: 'base', value: -60},
    ], color: 'yellow', icons: [
        {"x": 0, "y": 0.24, "rotate": 0, "size": 1.55, "icon": "mdi-fence-electric"},
        {"x": -0.75, "y": 0.24, "rotate": 0, "size": 1.5, "icon": "mdi-fence"},
        {"x": 0.75, "y": 0.24, "rotate": 0, "size": 1.5, "icon": "mdi-fence"},
        {"x": 0.7, "y": -0.35, "rotate": 0, "size": 1.25, "icon": "mdi-horse"},
        {"x": -0.55, "y": -0.45, "rotate": 0, "size": 1.25, "icon": "mdi-donkey"},
        {"x": 0.3, "y": -1, "rotate": 0, "size": 0.9, "icon": "mdi-dog-side"}
    ]},

    {id: 12, collection: 'dangerousWeapons', power: 2, reward: [
        {name: 'hordeCritChance', type: 'base', value: 0.05},
        {name: 'hordeCritMult', type: 'base', value: 0.1},
    ], color: 'deep-orange', icons: [
        {"x": 0, "y": 0, "rotate": 0, "size": 3, "icon": "mdi-bomb"},
        {"x": -0.55, "y": -0.4, "rotate": -25, "size": 1.25, "icon": "mdi-bomb"},
        {"x": -0.8, "y": 0.2, "rotate": -140, "size": 1.25, "icon": "mdi-bomb"},
        {"x": -0.65, "y": 0.65, "rotate": -125, "size": 1.25, "icon": "mdi-bomb"},
        {"x": -0.1, "y": 0.95, "rotate": 135, "size": 1.25, "icon": "mdi-bomb"},
        {"x": 0.45, "y": 0.85, "rotate": 95, "size": 1.25, "icon": "mdi-bomb"},
        {"x": 0.75, "y": 0.3, "rotate": 20, "size": 1.25, "icon": "mdi-bomb"}
    ]},
    {id: 13, collection: 'dangerousWeapons', power: 1, reward: [
        {name: 'hordeAttack', type: 'mult', value: 1.15},
        {name: 'hordeCritMult', type: 'base', value: 0.35},
    ], color: 'purple', icons: [
        {"x": -0.5, "y": 0.6, "rotate": 0, "size": 1.65, "icon": "mdi-triangle"},
        {"x": 0, "y": 0.25, "rotate": 15, "size": 2.1, "icon": "mdi-firework"},
        {"x": 0.1, "y": 0.7, "rotate": 0, "size": 1, "icon": "mdi-human-handsup"}
    ]},
    {id: 14, collection: 'dangerousWeapons', power: 2, reward: [
        {name: 'hordeAttack', type: 'mult', value: 1.05},
        {name: 'hordeBossRequirement', type: 'base', value: -3},
    ], color: 'light-blue', icons: [
        {"x": 0, "y": 0, "rotate": 15, "size": 2.75, "icon": "mdi-sword"},
        {"x": -0.45, "y": -0.2, "rotate": -70, "size": 1, "icon": "mdi-rectangle"},
        {"x": -0.55, "y": 0.15, "rotate": -70, "size": 1, "icon": "mdi-rectangle"},
        {"x": -0.68, "y": 0.48, "rotate": -160, "size": 0.6, "icon": "mdi-triangle"}
    ]},
    {id: 15, collection: 'dangerousWeapons', power: 3, reward: [
        {name: 'hordeToxic', type: 'base', value: 0.01},
    ], color: 'green', icons: [
        {"x": -0.85, "y": 0.45, "rotate": 0, "size": 1.25, "icon": "mdi-bottle-tonic-skull"},
        {"x": 0.3, "y": 0, "rotate": 0, "size": 2.1, "icon": "mdi-bow-arrow"},
        {"x": 0.8, "y": -0.1, "rotate": 0, "size": 0.65, "icon": "mdi-water"}
    ]},
    {id: 16, collection: 'dangerousWeapons', power: 3, reward: [
        {name: 'hordeFirstStrike', type: 'base', value: 0.8},
    ], color: 'pink', icons: [
        {"x": 0, "y": 0, "rotate": 0, "size": 1.75, "icon": "mdi-rocket-launch"},
        {"x": -0.5, "y": -0.5, "rotate": 0, "size": 1, "icon": "mdi-rocket-launch"},
        {"x": 0.5, "y": 0.5, "rotate": 0, "size": 1, "icon": "mdi-rocket-launch"},
        {"x": -0.2, "y": -0.4, "rotate": 45, "size": 1.25, "icon": "mdi-minus-thick"},
        {"x": 0.4, "y": 0.2, "rotate": 45, "size": 1, "icon": "mdi-minus-thick"}
    ]},
    {id: 17, collection: 'dangerousWeapons', power: 2, reward: [
        {name: 'hordeAttack', type: 'mult', value: 1.35},
    ], color: 'red', icons: [
        {"x": 0, "y": 0.55, "rotate": 0, "size": 2.75, "icon": "mdi-human-handsup"},
        {"x": -0.35, "y": -0.3, "rotate": 0, "size": 1.25, "icon": "mdi-axe-battle"},
        {"x": -0.6, "y": 0, "rotate": 180, "size": 1.25, "icon": "mdi-axe-battle"},
        {"x": 0.35, "y": -0.3, "rotate": 270, "size": 1.25, "icon": "mdi-axe-battle"},
        {"x": 0.65, "y": 0, "rotate": 90, "size": 1.25, "icon": "mdi-axe-battle"}
    ]},
    {id: 18, collection: 'dangerousWeapons', power: 3, reward: [
        {name: 'hordeCritChance', type: 'base', value: 0.1},
        {name: 'hordeEquipmentChance', type: 'mult', value: 1.25},
    ], color: 'pale-yellow', icons: [
        {"x": 0, "y": 0.65, "rotate": 0, "size": 2, "icon": "mdi-book-open-variant"},
        {"x": -0.2, "y": -0.3, "rotate": 20, "size": 1.65, "icon": "mdi-hand-front-left"},
        {"x": 0.4, "y": -0.4, "rotate": -60, "size": 2, "icon": "mdi-pen"}
    ]},
    {id: 19, collection: 'dangerousWeapons', power: 3, reward: [
        {name: 'hordeBossRequirement', type: 'base', value: -2},
        {name: 'currencyHordeSoulCorruptedGain', type: 'mult', value: 1.12},
    ], color: 'brown', icons: [
        {"x": -0.7, "y": 0, "rotate": 0, "size": 1, "icon": "mdi-bowl"},
        {"x": -0.2, "y": 0.15, "rotate": 0, "size": 2, "icon": "mdi-minus"},
        {"x": 0.45, "y": 0.15, "rotate": 0, "size": 2, "icon": "mdi-minus"},
        {"x": 0.2, "y": -0.4, "rotate": 90, "size": 1, "icon": "mdi-rectangle"},
        {"x": 0.2, "y": -0.05, "rotate": 90, "size": 1, "icon": "mdi-rectangle"},
        {"x": 0.2, "y": 0.1, "rotate": 90, "size": 1, "icon": "mdi-rectangle"},
        {"x": -0.1, "y": 0.3, "rotate": 0, "size": 0.5, "icon": "mdi-circle"},
        {"x": 0.45, "y": 0.3, "rotate": 0, "size": 0.5, "icon": "mdi-circle"},
        {"x": -0.7, "y": -0.2, "rotate": 0, "size": 1, "icon": "mdi-circle"}
    ]},
    {id: 20, collection: 'dangerousWeapons', power: 3, reward: [
        {name: 'hordeEquipmentChance', type: 'mult', value: 1.25},
        {name: 'currencyHordeSoulCorruptedCap', type: 'mult', value: 1.15},
    ], color: 'pale-pink', icons: [
        {"x": -0.15, "y": 0.2, "rotate": 0, "size": 2, "icon": "mdi-human"},
        {"x": 0.4, "y": 0, "rotate": 0, "size": 1, "icon": "mdi-pistol"},
        {"x": 0.42, "y": -0.2, "rotate": 45, "size": 1, "icon": "mdi-knife-military"}
    ]},
    {id: 21, collection: 'dangerousWeapons', power: 2, reward: [
        {name: 'currencyHordeMonsterPartGain', type: 'mult', value: 1.3},
        {name: 'currencyHordeSoulCorruptedGain', type: 'mult', value: 1.2},
    ], color: 'amber', icons: [
        {"x": 0.3, "y": -0.85, "rotate": 0, "size": 1.45, "icon": "mdi-white-balance-sunny"},
        {"x": -0.3, "y": -0.25, "rotate": -45, "size": 2, "icon": "mdi-minus"},
        {"x": -0.75, "y": 0.1, "rotate": 0, "size": 1, "icon": "mdi-mirror"},
        {"x": -0.3, "y": 0.45, "rotate": 45, "size": 2, "icon": "mdi-minus"},
        {"x": 0.2, "y": 0.55, "rotate": 10, "size": 1, "icon": "mdi-fire"}
    ]},
    {id: 22, collection: 'dangerousWeapons', power: 2, reward: [
        {name: 'currencyHordeSoulCorruptedGain', type: 'mult', value: 1.22},
        {name: 'currencyHordeSoulCorruptedCap', type: 'mult', value: 1.22},
    ], color: 'cherry', icons: [
        {"x": -0.85, "y": 0, "rotate": 0, "size": 1.5, "icon": "mdi-logout"},
        {"x": 0, "y": 0, "rotate": 0, "size": 1.25, "icon": "mdi-saw-blade"},
        {"x": 0.9, "y": 0, "rotate": 25, "size": 1.25, "icon": "mdi-saw-blade"}
    ]},
    {id: 23, collection: 'dangerousWeapons', power: 0, reward: [
        {name: 'hordeToxic', type: 'base', value: 0.025},
    ], color: 'lime', icons: [
        {"x": 0, "y": -0.2, "rotate": 0, "size": 2.5, "icon": "mdi-flask-empty"},
        {"x": 0.05, "y": 0.45, "rotate": -90, "size": 1.25, "icon": "mdi-motion"},
        {"x": -0.3, "y": 0.45, "rotate": -90, "size": 1, "icon": "mdi-motion"},
        {"x": 0.35, "y": 0.45, "rotate": -90, "size": 0.75, "icon": "mdi-motion"}
    ]},

    {id: 24, collection: 'supplyAndSupport', power: 3, reward: [
        {name: 'hordePhysicTaken', type: 'mult', value: 1 / 1.25},
    ], color: 'wooden', icons: [
        {"x": 0, "y": -0.2, "rotate": 0, "size": 3, "icon": "mdi-tree"},
        {"x": 0.03, "y": 0.5, "rotate": 90, "size": 3, "icon": "mdi-minus"},
        {"x": -0.2, "y": 0.55, "rotate": 0, "size": 1.25, "icon": "mdi-hiking"},
        {"x": -0.65, "y": 1.2, "rotate": -150, "size": 0.8, "icon": "mdi-arrow-projectile"}
    ]},
    {id: 25, collection: 'supplyAndSupport', power: 5, reward: [
        {name: 'hordeEquipmentMasteryGain', type: 'mult', value: 1.2},
    ], color: 'green', icons: [
        {"x": 0.1, "y": -0.15, "rotate": 0, "size": 1.25, "icon": "mdi-meditation"},
        {"x": 0.85, "y": 0.15, "rotate": 0, "size": 1.95, "icon": "mdi-tree"},
        {"x": -0.3, "y": -0.75, "rotate": 0, "size": 1.5, "icon": "mdi-tree"},
        {"x": -0.7, "y": 0.05, "rotate": 0, "size": 1.8, "icon": "mdi-pine-tree"},
        {"x": 0.5, "y": -0.75, "rotate": 0, "size": 0.6, "icon": "mdi-grass"},
        {"x": -0.35, "y": 0.85, "rotate": 0, "size": 0.8, "icon": "mdi-grass"},
        {"x": 0.4, "y": 0.75, "rotate": 0, "size": 0.75, "icon": "mdi-grass"}
    ]},
    {id: 26, collection: 'supplyAndSupport', power: 3, reward: [
        {name: 'currencyHordeSoulCorruptedCap', type: 'mult', value: 1.1},
        {name: 'currencyHordeBoneCap', type: 'mult', value: 1.15},
    ], color: 'light-grey', icons: [
        {"x": 0, "y": 0, "rotate": 0, "size": 2, "icon": "mdi-human-handsdown"},
        {"x": 0.4, "y": 0.1, "rotate": 80, "size": 1.75, "icon": "mdi-minus"},
        {"x": 0.5, "y": 0.45, "rotate": 0, "size": 1, "icon": "mdi-minus-thick"},
        {"x": 0.6, "y": 0.3, "rotate": 0, "size": 0.4, "icon": "mdi-alarm-light"},
        {"x": 0.6, "y": -0.05, "rotate": 0, "size": 0.75, "icon": "mdi-exclamation-thick"},
        {"x": -0.45, "y": 0.95, "rotate": 0, "size": 0.75, "icon": "mdi-mine"}
    ]},
    {id: 27, collection: 'supplyAndSupport', power: 4, reward: [
        {name: 'hordeNostalgia', type: 'base', value: 20},
    ], color: 'dark-blue', icons: [
        {"x": -0.65, "y": 0.25, "rotate": 0, "size": 1.55, "icon": "mdi-walk"},
        {"x": -0.2, "y": 0.1, "rotate": -10, "size": 1, "icon": "mdi-shield"},
        {"x": 0.6, "y": -0.15, "rotate": 160, "size": 1, "icon": "mdi-motion"}
    ]},
    {id: 28, collection: 'supplyAndSupport', power: 4, reward: [
        {name: 'hordeHeirloomChance', type: 'base', value: 0.03},
    ], color: 'yellow', icons: [
        {"x": 0, "y": 0.25, "rotate": 180, "size": 5, "icon": "mdi-dome-light"},
        {"x": -0.2, "y": 0.15, "rotate": 0, "size": 1.25, "icon": "mdi-human-handsdown"},
        {"x": 0.3, "y": 0.2, "rotate": 0, "size": 1.15, "icon": "mdi-human-greeting"}
    ]},
    {id: 29, collection: 'supplyAndSupport', power: 4, reward: [
        {name: 'hordeCritMult', type: 'base', value: 0.25},
        {name: 'hordeEquipmentMasteryGain', type: 'mult', value: 1.3},
    ], color: 'pink-purple', icons: [
        {"x": 0, "y": 0.4, "rotate": 0, "size": 3, "icon": "mdi-desktop-classic"},
        {"x": 0, "y": 0.12, "rotate": 20, "size": 1, "icon": "mdi-radar"},
        {"x": 0.25, "y": -0.6, "rotate": 0, "size": 1.25, "icon": "mdi-antenna"}
    ]},
    {id: 30, collection: 'supplyAndSupport', power: 3, reward: [
        {name: 'currencyHordeSoulCorruptedGain', type: 'mult', value: 1.15},
        {name: 'hordeHeirloomChance', type: 'base', value: 0.04},
    ], color: 'dark-grey', icons: [
        {"x": -0.15, "y": 0.5, "rotate": 0, "size": 2.5, "icon": "mdi-human-handsdown"},
        {"x": -0.15, "y": -0.2, "rotate": 0, "size": 1.75, "icon": "mdi-incognito"},
        {"x": 0.5, "y": 0.55, "rotate": 15, "size": 1.2, "icon": "mdi-binoculars"}
    ]},

    {id: 31, collection: 'againstTheCorruption', power: 5, reward: [
        {name: 'hordeCorruption', type: 'base', value: -0.3}
    ], color: 'red', icons: [
        {"x": 0, "y": 0.6, "rotate": 0, "size": 2.5, "icon": "mdi-sign-pole"},
        {"x": 0, "y": -0.5, "rotate": -20, "size": 1.3, "icon": "mdi-liquid-spot"},
        {"x": 0, "y": -0.5, "rotate": 0, "size": 2.5, "icon": "mdi-cancel"}
    ]},
    {id: 32, collection: 'againstTheCorruption', power: 5, reward: [
        {name: 'currencyHordeSoulCorruptedGain', type: 'mult', value: 1.1},
        {name: 'hordeCorruption', type: 'base', value: -0.15},
    ], color: 'pale-green', icons: [
        {"x": 0, "y": 0, "rotate": 0, "size": 2, "icon": "mdi-filter"},
        {"x": 0, "y": -0.55, "rotate": -85, "size": 1.25, "icon": "mdi-liquid-spot"},
        {"x": 0, "y": 0.7, "rotate": 0, "size": 1, "icon": "mdi-dots-vertical"}
    ]},
    {id: 33, collection: 'againstTheCorruption', power: 5, reward: [
        {name: 'hordeEquipmentChance', type: 'mult', value: 2.5},
        {name: 'hordeEquipmentMasteryGain', type: 'mult', value: 1.75},
        {name: 'hordeCorruption', type: 'mult', value: 1.1},
    ], color: 'skyblue', icons: [
        {"x": -0.5, "y": 0.4, "rotate": 0, "size": 1.75, "icon": "mdi-washing-machine"},
        {"x": 0.5, "y": 0.4, "rotate": 0, "size": 1.75, "icon": "mdi-tumble-dryer"},
        {"x": -0.5, "y": -0.25, "rotate": 0, "size": 1, "icon": "mdi-basket"},
        {"x": -0.5, "y": -0.4, "rotate": 20, "size": 1, "icon": "mdi-liquid-spot"},
        {"x": 0.5, "y": -0.2, "rotate": 0, "size": 1, "icon": "mdi-tray-full"}
    ]},
    {id: 34, collection: 'againstTheCorruption', power: 5, reward: [
        {name: 'hordeAttack', type: 'mult', value: 1.25},
        {name: 'hordeCritMult', type: 'base', value: 0.4},
        {name: 'hordeCorruption', type: 'mult', value: 1.1},
    ], color: 'orange', icons: [
        {"x": 0, "y": 0.5, "rotate": 30, "size": 1.5, "icon": "mdi-liquid-spot"},
        {"x": 0.4, "y": 0.5, "rotate": -45, "size": 1.5, "icon": "mdi-liquid-spot"},
        {"x": 0.2, "y": 0.05, "rotate": 0, "size": 1.75, "icon": "mdi-ghost"},
        {"x": -0.25, "y": -0.5, "rotate": -20, "size": 1.2, "icon": "mdi-fire"},
        {"x": -0.6, "y": 0.25, "rotate": 30, "size": 1.95, "icon": "mdi-torch"}
    ]},
    {id: 35, collection: 'againstTheCorruption', power: 5, reward: [
        {name: 'currencyHordeSoulCorruptedGain', type: 'mult', value: 1.3},
        {name: 'currencyHordeSoulCorruptedCap', type: 'mult', value: 1.3},
        {name: 'hordeCorruption', type: 'mult', value: 1.1},
    ], color: 'pink', icons: [
        {"x": -0.65, "y": 0.4, "rotate": 180, "size": 3, "icon": "mdi-alpha-t"},
        {"x": -0.45, "y": 0, "rotate": 120, "size": 2, "icon": "mdi-flashlight"},
        {"x": 0.35, "y": 0.4, "rotate": 30, "size": 2, "icon": "mdi-minus"},
        {"x": 0.65, "y": 0.55, "rotate": 0, "size": 1, "icon": "mdi-liquid-spot"}
    ]},
    {id: 36, collection: 'againstTheCorruption', power: 5, reward: [
        {name: 'hordeHealth', type: 'mult', value: 1.25},
        {name: 'hordeDivisionShield', type: 'base', value: 10},
        {name: 'hordeCorruption', type: 'mult', value: 1.1},
    ], color: 'pale-purple', icons: [
        {"x": 0, "y": -0.9, "rotate": 0, "size": 1.5, "icon": "mdi-arrow-collapse-down"},
        {"x": 0, "y": 0.15, "rotate": 15, "size": 1.25, "icon": "mdi-liquid-spot"},
        {"x": -0.5, "y": 0.5, "rotate": 0, "size": 3, "icon": "mdi-minus"},
        {"x": 0.5, "y": 0.5, "rotate": 0, "size": 3, "icon": "mdi-minus"}
    ]},
    {id: 37, collection: 'againstTheCorruption', power: 7, reward: [
        {name: 'hordeCorruption', type: 'mult', value: 1.1},
    ], color: 'brown', icons: [
        {"x": 0.25, "y": -0.6, "rotate": 0, "size": 1.75, "icon": "mdi-truck-cargo-container"},
        {"x": -0.7, "y": 0.45, "rotate": 0, "size": 1.5, "icon": "mdi-trash-can"},
        {"x": -0.15, "y": 0.45, "rotate": 0, "size": 1.5, "icon": "mdi-delete-empty"},
        {"x": 0.45, "y": 0.6, "rotate": 0, "size": 0.8, "icon": "mdi-sack"},
        {"x": 0.85, "y": 0.6, "rotate": 0, "size": 0.8, "icon": "mdi-sack"}
    ]},
    {id: 38, collection: 'againstTheCorruption', power: 5, reward: [
        {name: 'hordeRevive', type: 'base', value: 1},
        {name: 'hordeCorruption', type: 'mult', value: 1.1},
    ], color: 'yellow', icons: [
        {"x": 0, "y": 0, "rotate": 0, "size": 3, "icon": "mdi-television-ambient-light"},
        {"x": 0, "y": 0.08, "rotate": 10, "size": 1, "icon": "mdi-liquid-spot"},
        {"x": 0, "y": 0.8, "rotate": 90, "size": 1, "icon": "mdi-rectangle"},
        {"x": 0, "y": 1.2, "rotate": 90, "size": 1, "icon": "mdi-rectangle"}
    ]},
    {id: 39, collection: 'againstTheCorruption', power: 5, reward: [
        {name: 'hordeBossRequirement', type: 'base', value: -25},
        {name: 'hordeRespawn', type: 'mult', value: 0.2},
        {name: 'hordeCorruption', type: 'mult', value: 1.1},
    ], color: 'cyan', icons: [
        {"x": 0.3, "y": -0.1, "rotate": 0, "size": 2, "icon": "mdi-vacuum"},
        {"x": -0.5, "y": -0.1, "rotate": 0, "size": 2, "icon": "mdi-walk"},
        {"x": 0.85, "y": 0.55, "rotate": 25, "size": 1, "icon": "mdi-liquid-spot"},
        {"x": 0.6, "y": 0.65, "rotate": 150, "size": 1, "icon": "mdi-liquid-spot"}
    ]},
    {id: 40, collection: 'againstTheCorruption', power: 5, reward: [
        {name: 'hordeHeirloomChance', type: 'base', value: 0.1},
        {name: 'hordeNostalgia', type: 'mult', value: 2},
        {name: 'hordeCorruption', type: 'mult', value: 1.1},
    ], color: 'light-green', icons: [
        {"x": -0.2, "y": -0.6, "rotate": 125, "size": 2.5, "icon": "mdi-flask-round-bottom-empty"},
        {"x": 0.25, "y": -0.05, "rotate": 0, "size": 0.8, "icon": "mdi-water"},
        {"x": 0.25, "y": 0.4, "rotate": 0, "size": 0.6, "icon": "mdi-water"},
        {"x": 0.45, "y": 0.9, "rotate": 50, "size": 1, "icon": "mdi-liquid-spot"},
        {"x": 0.25, "y": 0.9, "rotate": -65, "size": 1, "icon": "mdi-liquid-spot"},
        {"x": 0, "y": 0.9, "rotate": 20, "size": 1, "icon": "mdi-liquid-spot"}
    ]},
    {id: 41, collection: 'againstTheCorruption', power: 5, reward: [
        {name: 'hordeFirstStrike', type: 'base', value: 3},
        {name: 'hordeSpellblade', type: 'base', value: 0.75},
        {name: 'hordeCorruption', type: 'mult', value: 1.1},
    ], color: 'teal', icons: [
        {"x": -0.5, "y": 0.1, "rotate": 90, "size": 1.5, "icon": "mdi-sword"},
        {"x": 0.5, "y": 0.1, "rotate": 0, "size": 1.5, "icon": "mdi-bow-arrow"},
        {"x": -0.5, "y": 0.4, "rotate": 0, "size": 1, "icon": "mdi-liquid-spot"},
        {"x": 0.25, "y": -0.05, "rotate": -65, "size": 1, "icon": "mdi-liquid-spot"}
    ]},

    {id: 42, collection: 'specialGadgets', power: 'adaptive', reward: [
        {name: 'hordeCorruption', type: 'mult', value: 2},
    ], color: 'purple', icons: [
        {"x": -0.39, "y": 0, "rotate": 0, "size": 3, "icon": "mdi-pot-mix"},
        {"x": -0.39, "y": 0.65, "rotate": 0, "size": 2.35, "icon": "mdi-square-rounded"},
        {"x": -0.4, "y": -0.3, "rotate": -20, "size": 1, "icon": "mdi-mushroom"},
        {"x": -0.75, "y": -0.1, "rotate": -45, "size": 1, "icon": "mdi-feather"},
        {"x": 0.8, "y": 0, "rotate": 0, "size": 2, "icon": "mdi-candle"}
    ]},
    {id: 43, collection: 'specialGadgets', power: 'adaptive', reward: [
        {name: 'hordeCorruption', type: 'mult', value: 5},
    ], color: 'orange-red', icons: [
        {"x": 0, "y": 0.2, "rotate": 0, "size": 3, "icon": "mdi-microwave"},
        {"x": -0.25, "y": 0.4, "rotate": -170, "size": 1, "icon": "mdi-liquid-spot"},
        {"x": 0, "y": -0.5, "rotate": 0, "size": 1, "icon": "mdi-alert"}
    ]},

    {id: 44, collection: 'artOfWar', power: 5, reward: [
        {name: 'hordeEquipmentChance', type: 'mult', value: 1.85},
        {name: 'hordeCorruption', type: 'base', value: -0.2},
    ], color: 'deep-purple', icons: [
        {"x": -0.5, "y": 0.1, "rotate": 0, "size": 2.5, "icon": "mdi-run"},
        {"x": -0.4, "y": -0.6, "rotate": 0, "size": 1.25, "icon": "mdi-ninja"},
        {"x": 0.05, "y": 0.05, "rotate": 30, "size": 1, "icon": "mdi-shuriken"},
        {"x": 0.95, "y": 0.05, "rotate": 60, "size": 1, "icon": "mdi-shuriken"}
    ]},
    {id: 45, collection: 'artOfWar', power: 6, reward: [
        {name: 'hordeAttack', type: 'mult', value: 1.18},
    ], color: 'orange-red', icons: [
        {"x": 0.1, "y": 0, "rotate": 0, "size": 1.5, "icon": "mdi-karate"},
        {"x": 0.8, "y": -0.15, "rotate": 60, "size": 1.4, "icon": "mdi-human-handsup"},
        {"x": -0.85, "y": 0.2, "rotate": -90, "size": 1.6, "icon": "mdi-walk"}
    ]},
    {id: 46, collection: 'artOfWar', power: 6, reward: [
        {name: 'hordeHealth', type: 'mult', value: 1.18},
    ], color: 'light-green', icons: [
        {"x": 0, "y": -0.3, "rotate": 0, "size": 4, "icon": "mdi-temple-buddhist"},
        {"x": -0.05, "y": 0.75, "rotate": 0, "size": 2, "icon": "mdi-meditation"},
        {"x": 1, "y": 0.9, "rotate": 0, "size": 0.45, "icon": "mdi-grass"}
    ]},
    {id: 47, collection: 'artOfWar', power: 6, reward: [
        {name: 'hordeEquipmentMasteryGain', type: 'mult', value: 1.35},
    ], color: 'beige', icons: [
        {"x": 0, "y": -0.65, "rotate": 0, "size": 8, "icon": "mdi-chevron-up"},
        {"x": 0.5, "y": 0.25, "rotate": 0, "size": 1.2, "icon": "mdi-bulletin-board"},
        {"x": -0.25, "y": 0.05, "rotate": 0, "size": 1.4, "icon": "mdi-map-legend"},
        {"x": 0, "y": 1, "rotate": 0, "size": 1.55, "icon": "mdi-human-greeting"},
        {"x": -0.4, "y": 0.6, "rotate": 15, "size": 1, "icon": "mdi-minus"},
        {"x": -0.75, "y": 0.55, "rotate": 15, "size": 1, "icon": "mdi-strategy"}
    ]},
    {id: 48, collection: 'artOfWar', power: 4, reward: [
        {name: 'hordeDefense', type: 'base', value: 0.001},
    ], color: 'indigo', icons: [
        {"x": -0.8, "y": 0.8, "rotate": 0, "size": 2, "icon": "mdi-walk"},
        {"x": -0.15, "y": 0.7, "rotate": -105, "size": 1.75, "icon": "mdi-car-windshield"},
        {"x": -0.3, "y": 0.1, "rotate": 0, "size": 2, "icon": "mdi-walk"},
        {"x": 0.35, "y": 0, "rotate": -105, "size": 1.75, "icon": "mdi-car-windshield"},
        {"x": 0.2, "y": -0.6, "rotate": 0, "size": 2, "icon": "mdi-walk"},
        {"x": 0.85, "y": -0.7, "rotate": -105, "size": 1.75, "icon": "mdi-car-windshield"}
    ]},
    {id: 49, collection: 'artOfWar', power: 6, reward: [
        {name: 'hordeExecute', type: 'base', value: 0.09},
    ], color: 'brown', icons: [
        {"x": 0, "y": -0.6, "rotate": 180, "size": 0.9, "icon": "mdi-network-strength-4"},
        {"x": 0, "y": -0.8, "rotate": 0, "size": 2, "icon": "mdi-minus"},
        {"x": -0.3, "y": -0.45, "rotate": 90, "size": 2, "icon": "mdi-minus"},
        {"x": 0.3, "y": -0.45, "rotate": 90, "size": 2, "icon": "mdi-minus"},
        {"x": -0.3, "y": 0.2, "rotate": 90, "size": 2, "icon": "mdi-minus"},
        {"x": 0.3, "y": 0.2, "rotate": 90, "size": 2, "icon": "mdi-minus"},
        {"x": -0.3, "y": 0.85, "rotate": 90, "size": 2, "icon": "mdi-minus"},
        {"x": 0.3, "y": 0.85, "rotate": 90, "size": 2, "icon": "mdi-minus"},
        {"x": 0, "y": 0.45, "rotate": 0, "size": 1, "icon": "mdi-tray"},
        {"x": 0, "y": 0.6, "rotate": 0, "size": 1.3, "icon": "mdi-minus-thick"},
        {"x": 0, "y": 1, "rotate": 0, "size": 0.8, "icon": "mdi-bowl"}
    ]},
    {id: 50, collection: 'artOfWar', power: 7, reward: [
        {name: 'currencyHordeBloodGain', type: 'mult', value: 1.3},
    ], color: 'red', icons: [
        {"x": 0, "y": 0, "rotate": 0, "size": 3, "icon": "mdi-knife"},
        {"x": 0.52, "y": -0.3, "rotate": -35, "size": 1.3, "icon": "mdi-stairs"},
        {"x": 0.3, "y": 0.2, "rotate": -15, "size": 1.3, "icon": "mdi-stairs"}
    ]},
    {id: 51, collection: 'artOfWar', power: 7, reward: [
        {name: 'currencyHordeBloodCap', type: 'mult', value: 1.25},
    ], color: 'cherry', icons: [
        {"x": 0, "y": 0.3, "rotate": 0, "size": 2, "icon": "mdi-car-coolant-level"},
        {"x": 0.37, "y": -0.48, "rotate": 0, "size": 1.3, "icon": "mdi-water-pump"},
        {"x": -0.35, "y": 0.85, "rotate": 0, "size": 0.3, "icon": "mdi-circle"},
        {"x": 0.35, "y": 0.85, "rotate": 0, "size": 0.3, "icon": "mdi-circle"}
    ]},

    {id: 52, collection: 'versatile', power: 7, reward: [
        {name: 'hordeStrength', type: 'base', value: 3},
        {name: 'hordeIntelligence', type: 'base', value: 3},
    ], color: 'pale-green', icons: [
        {"x": 0, "y": 0.25, "rotate": 0, "size": 3, "icon": "mdi-human-greeting"},
        {"x": -0.5, "y": -0.5, "rotate": -50, "size": 1.15, "icon": "mdi-dumbbell"},
        {"x": 0.6, "y": 0.1, "rotate": 0, "size": 1.25, "icon": "mdi-book-open-variant"}
    ]},
    {id: 53, collection: 'versatile', power: 7, reward: [
        {name: 'hordeEnergy', type: 'base', value: 80},
        {name: 'hordeMana', type: 'base', value: 40},
    ], color: 'purple', icons: [
        {"x": -0.6, "y": 0.2, "rotate": 0, "size": 3, "icon": "mdi-cupboard"},
        {"x": 0.6, "y": 0.2, "rotate": 0, "size": 3, "icon": "mdi-cupboard"},
        {"x": 0.5, "y": 0.1, "rotate": 0, "size": 0.5, "icon": "mdi-test-tube"},
        {"x": -0.45, "y": -0.25, "rotate": 0, "size": 0.5, "icon": "mdi-beaker-outline"},
        {"x": -0.55, "y": -0.75, "rotate": 0, "size": 1, "icon": "mdi-flask-outline"},
        {"x": 0.8, "y": 0.1, "rotate": 0, "size": 0.5, "icon": "mdi-flask-round-bottom"},
        {"x": -0.7, "y": 0.1, "rotate": 0, "size": 0.5, "icon": "mdi-bottle-tonic"},
        {"x": 0.65, "y": -0.25, "rotate": 0, "size": 0.5, "icon": "mdi-flask-outline"},
        {"x": 0.8, "y": -0.7, "rotate": 0, "size": 0.75, "icon": "mdi-flask-round-bottom"}
    ]},
    {id: 54, collection: 'versatile', power: 6, reward: [
        {name: 'hordeSkillPointsPerLevel', type: 'base', value: 1},
        {name: 'hordeExpBase', type: 'mult', value: 1 / 1.05},
    ], color: 'pale-yellow', icons: [
        {"x": -0.35, "y": 0.35, "rotate": 0, "size": 2.5, "icon": "mdi-table-furniture"},
        {"x": 0.25, "y": 0.02, "rotate": 0, "size": 3, "icon": "mdi-human-greeting"},
        {"x": -0.75, "y": -0.2, "rotate": 0, "size": 1, "icon": "mdi-lamp"},
        {"x": -0.35, "y": -0.1, "rotate": 0, "size": 0.65, "icon": "mdi-book"},
        {"x": 0.8, "y": 0.55, "rotate": 0, "size": 1, "icon": "mdi-watering-can"}
    ]},
    {id: 55, collection: 'versatile', power: 7, reward: [
        {name: 'hordeHaste', type: 'base', value: 10},
        {name: 'hordeAutocast', type: 'base', value: 1},
    ], color: 'blue-grey', icons: [
        {"x": -0.5, "y": 0.15, "rotate": 0, "size": 3, "icon": "mdi-human-handsdown"},
        {"x": 0.5, "y": 0.15, "rotate": 0, "size": 3, "icon": "mdi-human-male"},
        {"x": 0.5, "y": -0.7, "rotate": 0, "size": 1.75, "icon": "mdi-robot"}
    ]},

    {id: 56, collection: 'skillfulCombat', power: 7, reward: [
        {name: 'hordeStrength', type: 'base', value: 5},
    ], color: 'red', icons: [
        {"x": -0.65, "y": 0.15, "rotate": 0, "size": 2, "icon": "mdi-weight-lifter"},
        {"x": 0.7, "y": 0.25, "rotate": 0, "size": 1.75, "icon": "mdi-human-greeting"},
        {"x": 0.4, "y": -0.2, "rotate": -50, "size": 1, "icon": "mdi-dumbbell"},
        {"x": 1.1, "y": 0.3, "rotate": -80, "size": 1, "icon": "mdi-dumbbell"}
    ]},
    {id: 57, collection: 'skillfulCombat', power: 7, reward: [
        {name: 'hordeIntelligence', type: 'base', value: 5},
    ], color: 'purple', icons: [
        {"x": -0.85, "y": 0.6, "rotate": 0, "size": 1.75, "icon": "mdi-human-handsdown"},
        {"x": -0.4, "y": 0.7, "rotate": 0, "size": 0.75, "icon": "mdi-script-text"},
        {"x": 0.4, "y": 0.9, "rotate": 0, "size": 0.55, "icon": "mdi-skull"},
        {"x": 0.7, "y": 0.95, "rotate": 70, "size": 0.55, "icon": "mdi-skull"},
        {"x": 0.75, "y": -0.4, "rotate": 0, "size": 4.25, "icon": "mdi-flash"}
    ]},
    {id: 58, collection: 'skillfulCombat', power: 5, reward: [
        {name: 'hordeSkillPointsPerLevel', type: 'base', value: 2},
    ], color: 'orange', icons: [
        {"x": -0.8, "y": 0, "rotate": 0, "size": 1.5, "icon": "mdi-bullseye-arrow"},
        {"x": -0.8, "y": 0.7, "rotate": 90, "size": 1.75, "icon": "mdi-minus"},
        {"x": 0.9, "y": 0.55, "rotate": 0, "size": 2, "icon": "mdi-human-greeting"},
        {"x": 0.5, "y": 0.2, "rotate": -70, "size": 1, "icon": "mdi-bow-arrow"}
    ]},
    {id: 59, collection: 'skillfulCombat', power: 7, reward: [
        {name: 'hordeHaste', type: 'base', value: 15},
    ], color: 'green', icons: [
        {"x": 0.35, "y": 0.25, "rotate": 0, "size": 2, "icon": "mdi-horse-human"},
        {"x": -0.55, "y": 0.15, "rotate": 0, "size": 2, "icon": "mdi-horse-human"},
        {"x": -0.45, "y": 1, "rotate": 0, "size": 0.6, "icon": "mdi-grass"},
        {"x": 0.5, "y": -0.6, "rotate": 0, "size": 2, "icon": "mdi-tree"}
    ]},
    {id: 60, collection: 'skillfulCombat', power: 7, reward: [
        {name: 'hordeEnergy', type: 'base', value: 120},
    ], color: 'light-blue', icons: [
        {"x": -0.4, "y": -0.35, "rotate": 0, "size": 2.3, "icon": "mdi-tree"},
        {"x": 0.3, "y": 0.9, "rotate": 70, "size": 2, "icon": "mdi-minus"},
        {"x": 0.3, "y": 0.25, "rotate": 0, "size": 1, "icon": "mdi-flag-checkered"},
        {"x": -0.6, "y": 0.85, "rotate": 0, "size": 1.4, "icon": "mdi-run-fast"}
    ]},
    {id: 61, collection: 'skillfulCombat', power: 7, reward: [
        {name: 'hordeMana', type: 'base', value: 60},
    ], color: 'pale-purple', icons: [
        {"x": 0, "y": 0.4, "rotate": 0, "size": 2.5, "icon": "mdi-human-handsup"},
        {"x": 0, "y": -0.45, "rotate": 0, "size": 0.8, "icon": "mdi-wizard-hat"},
        {"x": -0.8, "y": -0.4, "rotate": 0, "size": 0.8, "icon": "mdi-fire-circle"},
        {"x": 0.3, "y": -0.9, "rotate": 0, "size": 0.8, "icon": "mdi-lightning-bolt-circle"},
        {"x": 0.7, "y": -0.2, "rotate": 0, "size": 0.8, "icon": "mdi-water-circle"}
    ]},
    {id: 62, collection: 'skillfulCombat', power: 7, reward: [
        {name: 'hordeExpBase', type: 'mult', value: 1 / 1.1},
    ], color: 'light-green', icons: [
        {"x": -0.85, "y": 0, "rotate": 0, "size": 2, "icon": "mdi-tree"},
        {"x": 0.15, "y": 0.05, "rotate": 0, "size": 1.75, "icon": "mdi-tree"},
        {"x": 0.65, "y": 0, "rotate": 0, "size": 2, "icon": "mdi-tree"},
        {"x": -0.5, "y": -0.65, "rotate": 0, "size": 1, "icon": "mdi-home"},
        {"x": -0.7, "y": 0.8, "rotate": 0, "size": 1.25, "icon": "mdi-horse-human"},
        {"x": 0.35, "y": 0.25, "rotate": 0, "size": 1, "icon": "mdi-grass"},
        {"x": 0.85, "y": 0.32, "rotate": 0, "size": 0.5, "icon": "mdi-grass"},
        {"x": -1.2, "y": 0.32, "rotate": 0, "size": 0.5, "icon": "mdi-grass"},
        {"x": -1.05, "y": 0.32, "rotate": 0, "size": 0.5, "icon": "mdi-grass"},
        {"x": -0.7, "y": 0.32, "rotate": 0, "size": 0.5, "icon": "mdi-grass"}
    ]},
    {id: 63, collection: 'skillfulCombat', power: 8, reward: [
        {name: 'hordeAutocast', type: 'base', value: 2},
    ], color: 'blue-grey', icons: [
        {"x": 0, "y": 0.1, "rotate": 0, "size": 3, "icon": "mdi-human"},
        {"x": -0.7, "y": -0.18, "rotate": -45, "size": 0.75, "icon": "mdi-wrench"},
        {"x": 0.7, "y": -0.18, "rotate": 135, "size": 0.75, "icon": "mdi-wrench"}
    ]},
    {id: 64, collection: 'skillfulCombat', power: 9, reward: [], color: 'amber', icons: [
        {"x": -0.55, "y": 0.8, "rotate": 0, "size": 1, "icon": "mdi-square"},
        {"x": 0, "y": 0.8, "rotate": 0, "size": 1, "icon": "mdi-square"},
        {"x": 0, "y": 0.4, "rotate": 0, "size": 1, "icon": "mdi-square"},
        {"x": 0.55, "y": 0.8, "rotate": 0, "size": 1, "icon": "mdi-square"},
        {"x": 0.55, "y": 0.6, "rotate": 0, "size": 1, "icon": "mdi-square"},
        {"x": 0, "y": -0.25, "rotate": 0, "size": 1.75, "icon": "mdi-human-handsup"},
        {"x": 0.5, "y": -0.65, "rotate": -15, "size": 1, "icon": "mdi-trophy"}
    ]},
    {id: 65, collection: 'skillfulCombat', power: 6, reward: [
        {name: 'hordeTrinketGain', type: 'mult', value: 1.11},
    ], color: 'babypink', icons: [
        {"x": -0.7, "y": 0.15, "rotate": 0, "size": 2.5, "icon": "mdi-human-handsdown"},
        {"x": -0.05, "y": 0.25, "rotate": 110, "size": 1, "icon": "mdi-magnet"},
        {"x": 0.7, "y": 0.6, "rotate": 80, "size": 0.75, "icon": "mdi-medal"},
        {"x": 1.1, "y": 0.6, "rotate": 0, "size": 0.75, "icon": "mdi-trophy"}
    ]},
];
})();
const HO_CARD = (function() {
  return {
    feature: {
        prefix: 'HO',
        reward: [
            {name: 'hordeAttack', type: 'mult', value: lvl => lvl * 0.03 + 1},
            {name: 'hordeHealth', type: 'mult', value: lvl => lvl * 0.03 + 1},
        ],
        shinyReward: [
            {name: 'hordePrestigeIncome', type: 'mult', value: lvl => lvl * 0.05 + 1},
        ],
        powerReward: [
            {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.06, lvl)},
            {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.06, lvl)},
            {name: 'hordePrestigeIncome', type: 'mult', value: lvl => Math.pow(1.02, lvl)},
        ],
        unlock: 'hordeFeature'
    },
    collection: {
        dangerousWeapons: {reward: [
            {name: 'hordeAttack', type: 'mult', value: 1.35},
        ]},
        supplyAndSupport: {reward: [
            {name: 'hordeHealth', type: 'mult', value: 1.35},
            {name: 'currencyFarmVegetableGain', type: 'mult', value: 1.25},
        ]},
        againstTheCorruption: {reward: [
            {name: 'currencyHordeCorruptedFleshGain', type: 'mult', value: 1.5},
        ]},
        artOfWar: {reward: [
            {name: 'hordeShardChance', type: 'mult', value: 1.5},
            {name: 'galleryCanvasSpeed', type: 'mult', value: 1.35},
        ]},
        skillfulCombat: {reward: [
            {name: 'hordeEquipmentMasteryGain', type: 'mult', value: 2},
            {name: 'hordeSkillPointsPerLevel', type: 'base', value: 1},
        ]},
    },
    pack: {
        rookieOnTheBattlefield: {unlock: 'hordeEquipment', amount: 3, price: 20, content: {
            'HO-0001': 2.6, 'HO-0002': 0.45, 'HO-0003': 1.25, 'HO-0004': 0.92, 'HO-0005': 1.55, 'HO-0006': 1.36,
            'HO-0007': 0.6, 'HO-0008': 0.8, 'HO-0009': 0.88, 'HO-0010': 0.4, 'HO-0011': 0.48,
            'HO-0012': 2.1, 'HO-0013': 1.6, 'HO-0014': 0.77,
        }},
        spiritualSuccess: {unlock: 'hordePrestige', amount: 4, price: 65, content: {
            'HO-0003': 1.25, 'HO-0004': 0.92, 'HO-0005': 1.55, 'HO-0006': 1.36,
            'HO-0009': 0.88, 'HO-0010': 0.8, 'HO-0011': 0.96,
            'HO-0012': 2.1, 'HO-0013': 1.6, 'HO-0014': 0.77, 'HO-0015': 1.2, 'HO-0016': 1.3, 'HO-0017': 1.8,
            'HO-0018': 1.6, 'HO-0019': 0.75, 'HO-0020': 0.84, 'HO-0021': 1.05, 'HO-0022': 1.5, 'HO-0023': 0.43,
            'HO-0024': 0.7, 'HO-0026': 0.9,
        }},
        oldMemories: {unlock: 'hordeHeirlooms', amount: 2, price: 50, content: {
            'HO-0007': 1.2, 'HO-0010': 0.8, 'HO-0011': 0.96,
            'HO-0019': 1.5, 'HO-0020': 1.68, 'HO-0021': 2.1, 'HO-0022': 3.75,
            'HO-0024': 1.4, 'HO-0026': 1.8, 'HO-0027': 1.15, 'HO-0028': 2, 'HO-0030': 2.3,
        }},
        taintedWorld: {unlock: 'hordeEquipmentMastery', amount: 6, price: 225, content: {
            'HO-0023': 0.72,
            'HO-0024': 1.2, 'HO-0025': 1.3, 'HO-0026': 1.55, 'HO-0027': 1.15, 'HO-0028': 2, 'HO-0029': 1.1, 'HO-0030': 2.3,
            'HO-0031': 3.5, 'HO-0032': 2.1, 'HO-0033': 0.9, 'HO-0034': 1.22, 'HO-0035': 1.58, 'HO-0036': 1.18,
            'HO-0037': 1.4, 'HO-0038': 0.65, 'HO-0039': 0.77, 'HO-0040': 1.36, 'HO-0041': 0.96,
        }},
        towerOfPower: {unlock: 'hordeBrickTower', amount: 2, price: 115, content: {
            'HO-0033': 1.2, 'HO-0037': 1.45, 'HO-0038': 0.4, 'HO-0039': 1.12, 'HO-0041': 1.22,
            'HO-0044': 2.3, 'HO-0045': 2.02, 'HO-0046': 2, 'HO-0047': 1.92,
        }},
        learnToFight: {unlock: 'hordeClassesSubfeature', amount: 5, price: 410, content: {
            'HO-0044': 1.26, 'HO-0045': 1.13, 'HO-0046': 1.15, 'HO-0047': 1.1,
            'HO-0048': 0.75, 'HO-0049': 0.3, 'HO-0050': 1.95, 'HO-0051': 2.2,
            'HO-0052': 1.45, 'HO-0053': 1.1, 'HO-0054': 0.8, 'HO-0055': 0.95,
            'HO-0056': 0.6, 'HO-0057': 0.55,
        }},
        combatExpert: {unlock: 'hordeClassPirate', amount: 3, price: 350, content: {
            'HO-0048': 1.15, 'HO-0049': 0.7,
            'HO-0052': 1, 'HO-0053': 1.1, 'HO-0054': 1.28, 'HO-0055': 1.2,
            'HO-0056': 1.75, 'HO-0057': 1.8,
            'HO-0058': 0.85, 'HO-0059': 1.5, 'HO-0060': 1.9, 'HO-0061': 1.85,
            'HO-0062': 1.35, 'HO-0063': 2.05, 'HO-0064': 2.2, 'HO-0065': 1.4,
        }},
    },
    card: HO_CARDLIST
};
})();
const HO_ACHIEVEMENT = (function() {
  return {
    maxZone: {value: () => HOSTORE.state.stat.horde_maxZone.total, default: 1, cap: 30, milestones: lvl => splicedLinear(10, 20, 20, lvl + 1), reward: {
        7: [{name: 'horde_stabbingGuide', type: 'keepUpgrade', value: true}, {name: 'horde_dodgingGuide', type: 'keepUpgrade', value: true}],
        11: [{name: 'horde_looting', type: 'keepUpgrade', value: true}],
    }},
    maxZoneSpeedrun: {value: () => HOSTORE.state.stat.horde_maxZoneSpeedrun.total, default: 1, cap: 10, milestones: lvl => lvl * 5 + 10, reward: {
        8: [{name: 'horde_training', type: 'keepUpgrade', value: true}],
    }},
    maxDamage: {value: () => HOSTORE.state.stat.horde_maxDamage.total, cap: 30, milestones: lvl => Math.pow(lvl * 250 + 7500, lvl) * 10, reward: {
        3: [{name: 'horde_boneBag', type: 'keepUpgrade', value: true}, {name: 'horde_anger', type: 'keepUpgrade', value: true}],
        6: [{name: 'horde_hoarding', type: 'keepUpgrade', value: true}, {name: 'horde_plunderSecret', type: 'keepUpgrade', value: true}],
    }},
    bone: {value: () => HOSTORE.state.stat.horde_bone.total, cap: 30, milestones: lvl => Math.pow(2, getSequence(10, lvl) - 10) * buildNum(1, 'M'), reward: {
        2: [{name: 'horde_resilience', type: 'keepUpgrade', value: true}, {name: 'horde_rest', type: 'keepUpgrade', value: true}],
    }},
    monsterPart: {value: () => HOSTORE.state.stat.horde_monsterPart.total, cap: 30, milestones: lvl => Math.pow(16, lvl) * 50, relic: {3: 'energyDrink'}, reward: {
        5: [{name: 'horde_thickSkin', type: 'keepUpgrade', value: true}],
    }},
    soulCorrupted: {value: () => HOSTORE.state.stat.horde_soulCorrupted.total, cap: 30, milestones: lvl => Math.pow(7 + lvl, lvl) * 1000, reward: {
        4: [{name: 'horde_luckyStrike', type: 'keepUpgrade', value: true}],
    }},
    maxCorruptionKill: {value: () => HOSTORE.state.stat.horde_maxCorruptionKill.total, display: 'percent', milestones: lvl => lvl + 1},
    maxMastery: {value: () => HOSTORE.state.stat.horde_maxMastery.total, milestones: lvl => lvl + 1},
    totalMastery: {value: () => HOSTORE.state.stat.horde_totalMastery.total, milestones: lvl => Math.round((lvl + 1) * 25 * (lvl * 0.2 + 1))},
    blood: {value: () => HOSTORE.state.stat.horde_blood.total, milestones: lvl => Math.pow(2, getSequence(10, lvl) - 10) * buildNum(1, 'B'), reward: {
        3: [{name: 'horde_transfusion', type: 'keepUpgrade', value: true}],
        5: [{name: 'horde_protectiveShell', type: 'keepUpgrade', value: true}],
        8: [{name: 'horde_bloodStorage', type: 'keepUpgrade', value: true}],
    }},
    courage: {value: () => HOSTORE.state.stat.horde_courage.total, milestones: lvl => Math.pow(18 + lvl * 6, lvl) * 1000, reward: {
        6: [{name: 'horde_secondChance', type: 'keepUpgrade', value: true}],
    }},
    trinket: {value: () => HOSTORE.getters['horde/trinketLevels'], milestones: lvl => Math.round((lvl + 1) * 3 * (lvl * 0.2 + 1))},
    infiniteScore: {value: () => HOSTORE.state.stat.horde_warzoneInfiniteScore.total +
        HOSTORE.state.stat.horde_monkeyJungleInfiniteScore.total +
        HOSTORE.state.stat.horde_loveIslandInfiniteScore.total, milestones: lvl => Math.round((lvl + 1) * 200 * Math.pow(1.15, lvl))
    },
    unlucky: {value: () => HOSTORE.state.stat.horde_unlucky.total, secret: true, display: 'boolean', cap: 1, milestones: () => 1},
};
})();
const HO_HEIRLOOM = (function() {
  return {
    power: {color: 'red', icon: 'mdi-sword', effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    fortitude: {minZone: 40, color: 'green', icon: 'mdi-heart', effect: [
        {name: 'hordeHealth', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    wealth: {minZone: 50, color: 'amber', icon: 'mdi-circle-multiple', effect: [
        {name: 'currencyHordeBoneGain', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    spirit: {minZone: 60, color: 'purple', icon: 'mdi-ghost', effect: [
        {name: 'currencyHordeSoulCorruptedGain', type: 'mult', value: lvl => lvl * 0.03 + 1}
    ]},
    sharpsight: {minZone: 70, color: 'cyan', icon: 'mdi-magnify', effect: [
        {name: 'hordeEquipmentChance', type: 'mult', value: lvl => lvl * 0.05 + 1}
    ]},
    reaping: {minZone: 80, color: 'pink', icon: 'mdi-skull', effect: [
        {name: 'currencyHordeCorruptedFleshGain', type: 'mult', value: lvl => lvl * 0.01 + 1}
    ]},
    remembrance: {minZone: 90, color: 'deep-purple', icon: 'mdi-grave-stone', effect: [
        {name: 'currencyHordeSoulCorruptedCap', type: 'mult', value: lvl => lvl * 0.03 + 1}
    ]},
    expertise: {minZone: 100, color: 'light-blue', icon: 'mdi-book-open-variant', effect: [
        {name: 'hordeEquipmentMasteryGain', type: 'mult', value: lvl => lvl * 0.01 + 1}
    ]},
    holding: {minZone: 110, color: 'brown', icon: 'mdi-dresser', effect: [
        {name: 'currencyHordeBoneCap', type: 'mult', value: lvl => lvl * 0.02 + 1}
    ]},
    mystery: {minZone: 120, color: 'teal', icon: 'mdi-help-box', effect: [
        {name: 'hordeShardChance', type: 'mult', value: lvl => lvl * 0.001 + 1}
    ]},
    freezing: {minZone: 130, color: 'dark-blue', icon: 'mdi-fridge', effect: [
        {name: 'currencyHordeMonsterPartCap', type: 'mult', value: lvl => lvl * 0.001 + 1}
    ]},

    // Tower-exclusive heirlooms
    brick: {minZone: Infinity, color: 'cherry', icon: 'mdi-wall', effect: [
        {name: 'currencyHordeBoneGain', type: 'mult', value: lvl => lvl * 0.01 + 1}
    ]},
    heat: {minZone: Infinity, color: 'orange-red', icon: 'mdi-fire', effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => lvl * 0.01 + 1}
    ]},
    ice: {minZone: Infinity, color: 'skyblue', icon: 'mdi-snowflake-variant', effect: [
        {name: 'hordeHealth', type: 'mult', value: lvl => lvl * 0.01 + 1}
    ]},
    crystal: {minZone: Infinity, color: 'indigo', icon: 'mdi-billiards-rack', effect: [
        {name: 'hordeShardChance', type: 'mult', value: lvl => lvl * 0.001 + 1}
    ]},
    vitality: {minZone: Infinity, color: 'light-green', icon: 'mdi-heart-multiple', effect: [
        {name: 'currencyHordeBoneCap', type: 'mult', value: lvl => lvl * 0.001 + 1}
    ]},
    nature: {minZone: Infinity, color: 'lime', icon: 'mdi-leaf', effect: [
        {name: 'hordeEquipmentMasteryGain', type: 'mult', value: lvl => lvl * 0.001 + 1}
    ]},
};
})();
const HO_EQUIPMENT = (function() {
  return {
    dagger: {
        findZone: 0,
        found: true,
        price(lvl) {
            return Math.pow(10, lvl - 1) * 15;
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeAttack', value: lvl * 5 + 5}
            ];
        },
        active(lvl) {
            return [
                {type: 'buff', value: 40, effect: [
                    {type: 'base', name: 'hordeAttack', value: lvl * 7 + 28}
                ]}
            ];
        },
        activeType: 'combat',
        cooldown: () => 300,
        icon: 'mdi-knife-military',
        activeIcon: 'mdi-knife-military',
        activeColor: 'red'
    },
    shirt: {
        findZone: 0,
        found: true,
        price(lvl) {
            return Math.pow(10, lvl - 1) * 15;
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeHealth', value: lvl * 1000 + 1000}
            ];
        },
        active() {
            return [
                {type: 'heal', value: 0.225, int: 0.01}
            ];
        },
        activeType: 'combat',
        cooldown: () => 80,
        icon: 'mdi-tshirt-v',
        activeIcon: 'mdi-medical-bag',
        activeColor: 'green'
    },
    guardianAngel: {
        findZone: 5,
        findChance: 1 / buildNum(10, 'K'),
        price(lvl) {
            return Math.pow(1000, lvl - 1) * 100;
        },
        cap: 5,
        stats() {
            return [
                {isPositive: true, type: 'base', name: 'hordeRevive', value: 1}
            ];
        },
        active() {
            return [
                {type: 'reviveAll', value: null}
            ];
        },
        activeType: 'combat',
        cooldown: lvl => SECONDS_PER_HOUR * 8 - lvl * 1800,
        icon: 'mdi-cross',
        activeIcon: 'mdi-flare',
        activeColor: 'yellow'
    },
    milkCup: {
        findZone: 6,
        findChance: 1 / 2000,
        price(lvl) {
            return Math.pow(100, lvl - 1) * 25;
        },
        cap: 9,
        stats() {
            return [
                {isPositive: true, type: 'mult', name: 'currencyHordeBoneGain', value: 1.2}
            ];
        },
        active(lvl) {
            return [
                {type: 'bone', value: 17.9 + lvl * 1.1}
            ];
        },
        activeType: 'utility',
        cooldown: () => 900,
        icon: 'mdi-cup',
        activeIcon: 'mdi-bone',
        activeColor: 'lighter-grey'
    },
    starShield: {
        findZone: 8,
        findChance: 1 / 4000,
        price(lvl) {
            return Math.pow(100, lvl - 1) * 80;
        },
        cap: 11,
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeDivisionShield', value: lvl + 9}
            ];
        },
        active() {
            return [
                {type: 'stun', value: 8}
            ];
        },
        activeType: 'combat',
        cooldown: () => 25,
        icon: 'mdi-shield-star',
        activeIcon: 'mdi-octagram-outline',
        activeColor: 'blue'
    },
    longsword: {
        findZone: 10,
        findChance: 1 / 8000,
        price(lvl) {
            return Math.pow(100, lvl - 1) * 40;
        },
        cap: 5,
        stats() {
            return [
                {isPositive: true, type: 'base', name: 'hordeCritChance', value: 0.2},
                {isPositive: true, type: 'base', name: 'hordeCritMult', value: 0.3}
            ];
        },
        active(lvl) {
            return [
                {type: 'damagePhysic', value: 7.5, str: 0.1, canCrit: 0.1 * lvl}
            ];
        },
        activeType: 'combat',
        cooldown: () => 35,
        icon: 'mdi-sword',
        activeIcon: 'mdi-sword',
        activeColor: 'orange'
    },
    boots: {
        findZone: 12,
        findChance: 1 / buildNum(14, 'K'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * 75;
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeFirstStrike', value: lvl * 0.15 + 2.85}
            ];
        },
        active() {
            return [
                {type: 'damageMagic', value: 4.5, int: 0.08},
                {type: 'heal', value: 0.03, int: 0.002}
            ];
        },
        activeType: 'combat',
        cooldown: () => 16,
        icon: 'mdi-shoe-cleat',
        activeIcon: 'mdi-shoe-cleat',
        activeColor: 'light-blue'
    },
    clover: {
        findZone: 14,
        findChance: 1 / buildNum(20, 'K'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * 100;
        },
        stats(lvl, stacks) {
            return [
                {isPositive: true, type: 'mult', name: 'hordeEquipmentChance', value: lvl * 0.05 + getDiminishing(stacks) * 0.05 + 1.05}
            ];
        },
        active() {
            return [
                {type: 'addStack', value: null}
            ];
        },
        activeType: 'utility',
        cooldown: () => HORDE_STACKING_COOLDOWN,
        icon: 'mdi-clover',
        activeIcon: 'mdi-clover',
        activeColor: 'light-green'
    },
    liver: {
        findZone: 15,
        findChance: 1 / buildNum(100, 'K'),
        price(lvl) {
            return Math.pow(100, lvl - 1) * 120;
        },
        cap: 11,
        stats() {
            return [
                {isPositive: true, type: 'mult', name: 'currencyHordeMonsterPartGain', value: 1.2}
            ];
        },
        active(lvl) {
            return [
                {type: 'monsterPart', value: 97.5 + lvl * 2.5}
            ];
        },
        activeType: 'utility',
        cooldown: () => 1350,
        icon: 'mdi-stomach',
        activeIcon: 'mdi-stomach',
        activeColor: 'cherry'
    },
    fireOrb: {
        findZone: 16,
        findChance: 1 / buildNum(25, 'K'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * 150;
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeAttack', value: lvl * 2 + 8},
                {isPositive: true, type: 'base', name: 'hordeCritMult', value: 0.45},
                {isPositive: false, type: 'base', name: 'hordeMagicConversion', value: 0.5}
            ];
        },
        active() {
            return [
                {type: 'damageMagic', value: 13.5, int: 0.18},
                {type: 'buff', value: 25, effect: [
                    {type: 'base', name: 'hordeCritChance', value: 0.3}
                ]}
            ];
        },
        activeType: 'combat',
        cooldown: () => 78,
        icon: 'mdi-fire-circle',
        activeIcon: 'mdi-fire',
        activeColor: 'deep-orange'
    },
    campfire: {
        findZone: 18,
        findChance: 1 / buildNum(35, 'K'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * 200;
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeHealth', value: lvl * 600 + 900},
                {isPositive: true, type: 'base', name: 'hordeRecovery', value: 0.04}
            ];
        },
        active() {
            return [
                {type: 'heal', value: 0.65, int: 0.02},
                {type: 'buff', value: 210, effect: [
                    {type: 'base', name: 'hordeRecovery', value: 0.15}
                ]}
            ];
        },
        activeType: 'combat',
        cooldown: () => 1800,
        icon: 'mdi-campfire',
        activeIcon: 'mdi-campfire',
        activeColor: 'orange-red'
    },
    snowflake: {
        findZone: 20,
        findChance: 1 / buildNum(45, 'K'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * 300;
        },
        stats(lvl) {
            return [
                {isPositive: false, type: 'mult', name: 'hordeAttack', value: 1 / 1.6},
                {isPositive: true, type: 'mult', name: 'hordeHealth', value: 1.6},
                {isPositive: true, type: 'base', name: 'hordeHealth', value: lvl * 900 + 6100}
            ];
        },
        masteryBoost: 0.25,
        active() {
            return [
                {type: 'removeAttack', value: 0.4}
            ];
        },
        activeType: 'combat',
        cooldown: () => 1200,
        icon: 'mdi-snowflake',
        activeIcon: 'mdi-snowflake',
        activeColor: 'light-blue'
    },
    oppressor: {
        findZone: 22,
        findChance: 1 / buildNum(55, 'K'),
        price(lvl) {
            return Math.pow(100, lvl - 1) * 360;
        },
        cap: 5,
        stats() {
            return [
                {isPositive: true, type: 'base', name: 'hordeEnemyActiveStart', value: 0.5}
            ];
        },
        active() {
            return [
                {type: 'silence', value: 10}
            ];
        },
        activeType: 'combat',
        cooldown: lvl => 80 - lvl * 5,
        icon: 'mdi-robot-angry',
        activeIcon: 'mdi-emoticon-devil',
        activeColor: 'pale-purple'
    },
    meatShield: {
        findZone: 23,
        findChance: 1 / buildNum(60, 'K'),
        price(lvl) {
            return Math.pow(100, lvl - 1) * 400;
        },
        cap: 6,
        stats(lvl) {
            return [
                {isPositive: true, type: 'mult', name: 'hordePhysicTaken', value: 1 / (lvl * 0.1 + 1.15)},
                {isPositive: false, type: 'base', name: 'hordeMagicTaken', value: 0.3},
                {isPositive: false, type: 'base', name: 'hordeBioTaken', value: 0.3}
            ];
        },
        masteryBoost: 0.25,
        active() {
            return [
                {type: 'buff', value: 5, effect: [
                    {type: 'mult', name: 'hordePhysicTaken', value: 0}
                ]}
            ];
        },
        activeType: 'combat',
        cooldown: () => 54,
        icon: 'mdi-food-steak',
        activeIcon: 'mdi-octagram-outline',
        activeColor: 'pale-red'
    },
    corruptEye: {
        findZone: 25,
        findChance: 1 / buildNum(300, 'K'),
        price(lvl) {
            return Math.pow(1000, lvl - 1) * 5000;
        },
        cap: 5,
        stats() {
            return [
                {isPositive: true, type: 'base', name: 'hordeRareLootTime', value: -20}
            ];
        },
        masteryBoost: 0.25,
        active(lvl) {
            return [
                {type: 'damageBio', value: 4.25 + lvl * 0.25, int: 0.1},
                {type: 'poison', value: 0.2, int: 0.01}
            ];
        },
        activeType: 'combat',
        cooldown: () => 30,
        icon: 'mdi-eye',
        activeIcon: 'mdi-laser-pointer',
        activeColor: 'purple'
    },
    wizardHat: {
        findZone: 27,
        findChance: 1 / buildNum(80, 'K'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * 1500;
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeAttack', value: lvl * 4 + 28},
                {isPositive: true, type: 'base', name: 'hordeMagicAttack', value: 0.15}
            ];
        },
        active() {
            return [
                {type: 'damageMagic', value: 25, int: 0.4}
            ];
        },
        activeType: 'combat',
        cooldown: () => 125,
        icon: 'mdi-wizard-hat',
        activeIcon: 'mdi-shimmer',
        activeColor: 'deep-purple'
    },
    redStaff: {
        findZone: 30,
        findChance: 1 / buildNum(100, 'K'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * 2500;
        },
        stats(lvl, stacks) {
            return [
                {isPositive: true, type: 'base', name: 'hordeAttack', value: lvl * 5 + getDiminishing(stacks) * 5 + 5}
            ];
        },
        active() {
            return [
                {type: 'addStack', value: null}
            ];
        },
        activeType: 'utility',
        cooldown: () => HORDE_STACKING_COOLDOWN,
        icon: 'mdi-magic-staff',
        activeIcon: 'mdi-pentagram',
        activeColor: 'red'
    },
    brokenStopwatch: {
        findZone: 31,
        findChance: 1 / buildNum(25, 'K'),
        price(lvl) {
            return Math.pow(100, lvl - 1) * 3000;
        },
        cap: 5,
        stats() {
            return [
                {isPositive: false, type: 'mult', name: 'hordeNostalgia', value: 0}
            ];
        },
        active(lvl) {
            return [
                {type: 'stun', value: 7 + lvl}
            ];
        },
        activeType: 'combat',
        cooldown: () => 60,
        icon: 'mdi-timer',
        activeIcon: 'mdi-timer',
        activeColor: 'skyblue'
    },
    marblePillar: {
        findZone: 33,
        findChance: 1 / buildNum(125, 'K'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * 4000;
        },
        cap: 16,
        stats(lvl) {
            return [
                {isPositive: false, type: 'mult', name: 'hordeMagicAttack', value: 0.25},
                {isPositive: true, type: 'mult', name: 'hordeMagicTaken', value: 1 / (lvl * 0.05 + 2.2)},
                {isPositive: true, type: 'base', name: 'hordeDivisionShield', value: 8}
            ];
        },
        active() {
            return [
                {type: 'maxdamagePhysic', value: 0.05, str: 0.0004},
                {type: 'divisionShield', value: 8},
                {type: 'stun', value: 3}
            ];
        },
        activeType: 'combat',
        cooldown: () => 44,
        icon: 'mdi-pillar',
        activeIcon: 'mdi-pillar',
        activeColor: 'pale-yellow'
    },
    rainbowStaff: {
        findZone: 35,
        findChance: 1 / buildNum(450, 'K'),
        price(lvl) {
            return Math.pow(100, lvl - 1) * 6000;
        },
        cap: 11,
        stats() {
            return [
                {isPositive: false, type: 'mult', name: 'hordeAttack', value: 1 / 1.15},
                {isPositive: false, type: 'base', name: 'hordeMagicConversion', value: 1},
                {isPositive: false, type: 'base', name: 'hordeBioConversion', value: 1},
            ];
        },
        active(lvl) {
            return [
                {type: 'damagePhysic', value: lvl * 0.05 + 1.75},
                {type: 'damageMagic', value: lvl * 0.05 + 1.75},
                {type: 'damageBio', value: lvl * 0.05 + 1.75}
            ];
        },
        activeType: 'combat',
        cooldown: () => 25,
        icon: 'mdi-magic-staff',
        activeIcon: 'mdi-looks',
        activeColor: 'pink'
    },
    toxin: {
        findZone: 37,
        findChance: 1 / buildNum(160, 'K'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * 7000;
        },
        cap: 6,
        stats() {
            return [
                {isPositive: true, type: 'base', name: 'hordeToxic', value: 0.02},
                {isPositive: false, type: 'base', name: 'hordeBioConversion', value: 0.5}
            ];
        },
        active(lvl) {
            return [
                {type: 'poison', value: lvl * 0.01 + 0.19, int: 0.01}
            ];
        },
        activeType: 'combat',
        cooldown: () => 16,
        icon: 'mdi-bottle-tonic-skull',
        activeIcon: 'mdi-bottle-tonic-skull',
        activeColor: 'light-green'
    },
    cleansingSpring: {
        findZone: 40,
        findChance: 1 / buildNum(200, 'K'),
        price(lvl) {
            return Math.pow(100, lvl - 1) * buildNum(10, 'K');
        },
        cap: 5,
        stats() {
            return [
                {isPositive: true, type: 'base', name: 'hordeStatusResist', value: 1}
            ];
        },
        active() {
            return [
                {type: 'removeStun', value: null}
            ];
        },
        activeType: 'combat',
        usableInStun: true,
        cooldown: lvl => 32 - lvl * 2,
        icon: 'mdi-waterfall',
        activeIcon: 'mdi-water-opacity',
        activeColor: 'cyan'
    },
    toxicSword: {
        findZone: 43,
        findChance: 1 / buildNum(275, 'K'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(12, 'K');
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeAttack', value: lvl * 8 + 76},
                {isPositive: false, type: 'mult', name: 'hordeCritMult', value: 0.8}
            ];
        },
        masteryBoost: 0.25,
        active() {
            return [
                {type: 'damageBio', value: 2.6, int: 0.05},
                {type: 'poison', value: 0.1, int: 0.005}
            ];
        },
        activeType: 'combat',
        cooldown: () => 10,
        icon: 'mdi-sword',
        activeIcon: 'mdi-bottle-tonic-skull',
        activeColor: 'green'
    },
    luckyCharm: {
        findZone: 45,
        findChance: 1 / buildNum(1.4, 'M'),
        price(lvl) {
            return Math.pow(1000, lvl - 1) * buildNum(15, 'K');
        },
        stats(lvl) {
            return [
                {isPositive: false, type: 'mult', name: 'currencyHordeSoulCorruptedGain', value: 1 / 1.5},
                {isPositive: true, type: 'base', name: 'hordeHeirloomChance', value: lvl * 0.001 + 0.004}
            ];
        },
        masteryBoost: 0.25,
        active() {
            return [
                {type: 'heal', value: 1},
                {type: 'antidote', value: 1},
                {type: 'removeStun', value: null}
            ];
        },
        activeType: 'combat',
        usableInStun: true,
        cooldown: () => 1200,
        icon: 'mdi-necklace',
        activeIcon: 'mdi-flare',
        activeColor: 'lime'
    },
    mailbreaker: {
        findZone: 46,
        findChance: 1 / buildNum(375, 'K'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(18, 'K');
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeAttack', value: lvl * 3 + 21},
                {isPositive: true, type: 'base', name: 'hordeShieldbreak', value: 1}
            ];
        },
        active() {
            return [
                {type: 'removeDivisionShield', value: 1},
                {type: 'stun', value: 15}
            ];
        },
        activeType: 'combat',
        cooldown: () => 750,
        icon: 'mdi-sword',
        activeIcon: 'mdi-circle-off-outline',
        activeColor: 'pale-blue'
    },
    club: {
        findZone: 47,
        findChance: 1 / buildNum(400, 'K'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(20, 'K');
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeAttack', value: lvl * 10 + 110},
                {isPositive: true, type: 'mult', name: 'hordeAttack', value: 1.2},
                {isPositive: false, type: 'mult', name: 'hordeCritChance', value: 0},
                {isPositive: false, type: 'mult', name: 'hordeCritMult', value: 0}
            ];
        },
        masteryBoost: 0.25,
        active() {
            return [
                {type: 'damagePhysic', value: 7.35, str: 0.12}
            ];
        },
        activeType: 'combat',
        cooldown: () => 26,
        icon: 'mdi-mace',
        activeIcon: 'mdi-mace',
        activeColor: 'cherry'
    },
    goldenStaff: {
        findZone: 49,
        findChance: 1 / buildNum(500, 'K'),
        price(lvl) {
            return Math.pow(100, lvl - 1) * buildNum(24, 'K');
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeSpellblade', value: lvl * 0.03 + 0.47},
                {isPositive: false, type: 'base', name: 'hordeMagicConversion', value: 0.5}
            ];
        },
        active() {
            return [
                {type: 'damagePhysic', value: 0.8, str: 0.04},
                {type: 'damageMagic', value: 3.4, int: 0.08},
            ];
        },
        activeType: 'combat',
        cooldown: () => 10,
        icon: 'mdi-magic-staff',
        activeIcon: 'mdi-sword',
        activeColor: 'amber'
    },
    mace: {
        findZone: 51,
        findChance: 1 / buildNum(650, 'K'),
        price(lvl) {
            return Math.pow(100, lvl - 1) * buildNum(28, 'K');
        },
        cap: 5,
        stats() {
            return [
                {isPositive: true, type: 'base', name: 'hordeCritChance', value: 0.2},
                {isPositive: false, type: 'base', name: 'hordePhysicConversion', value: 2.5},
                {isPositive: true, type: 'base', name: 'hordePhysicAttack', value: 0.15}
            ];
        },
        active(lvl) {
            return [
                {type: 'damagePhysic', value: lvl * 0.25 + 4.5, str: 0.1},
                {type: 'stun', value: 3}
            ];
        },
        activeType: 'combat',
        cooldown: () => 18,
        icon: 'mdi-mace',
        activeIcon: 'mdi-mace',
        activeColor: 'red'
    },
    scissors: {
        findZone: 53,
        findChance: 1 / buildNum(850, 'K'),
        price(lvl) {
            return Math.pow(100, lvl - 1) * buildNum(35, 'K');
        },
        cap: 5,
        stats() {
            return [
                {isPositive: true, type: 'base', name: 'hordeCutting', value: 0.02},
                {isPositive: false, type: 'base', name: 'hordeBioConversion', value: 0.5}
            ];
        },
        active(lvl) {
            return [
                {type: 'damagePhysic', value: lvl * 0.2 + 2.3, str: 0.04},
                {type: 'maxdamageBio', value: 0.05, int: 0.0004}
            ];
        },
        activeType: 'combat',
        cooldown: () => 15,
        icon: 'mdi-content-cut',
        activeIcon: 'mdi-content-cut',
        activeColor: 'blue-grey'
    },
    cat: {
        findZone: 55,
        findChance: 1 / buildNum(4.25, 'M'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(45, 'K');
        },
        stats() {
            return [
                {isPositive: false, type: 'mult', name: 'hordeHealth', value: 1 / 3},
                {isPositive: true, type: 'base', name: 'hordeRevive', value: 8},
                {isPositive: true, type: 'mult', name: 'hordeRecovery', value: 4}
            ];
        },
        masteryBoost: 0.25,
        active(lvl) {
            return [
                {type: 'bone', value: 51 + lvl * 3}
            ];
        },
        activeType: 'utility',
        cooldown: () => 6 * SECONDS_PER_HOUR,
        icon: 'mdi-cat',
        activeIcon: 'mdi-cat',
        activeColor: 'lighter-grey'
    },
    healthyFruit: {
        findZone: 57,
        findChance: 1 / buildNum(1.1, 'M'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(55, 'K');
        },
        stats() {
            return [
                {isPositive: false, type: 'mult', name: 'hordeCritChance', value: 0.5},
                {isPositive: true, type: 'mult', name: 'hordeBioTaken', value: 1 / 2.5},
                {isPositive: true, type: 'base', name: 'hordeRecovery', value: 0.03}
            ];
        },
        masteryBoost: 0.25,
        active(lvl) {
            return [
                {type: 'heal', value: 0.01 * lvl + 0.44, int: 0.02},
                {type: 'removeStun', value: null},
                {type: 'stun', value: 20}
            ];
        },
        activeType: 'combat',
        usableInStun: true,
        cooldown: () => 220,
        icon: 'mdi-fruit-cherries',
        activeIcon: 'mdi-fruit-cherries',
        activeColor: 'cherry'
    },
    deadBird: {
        findZone: 60,
        findChance: 1 / buildNum(1.3, 'M'),
        price(lvl) {
            return Math.pow(100, lvl - 1) * buildNum(85, 'K');
        },
        cap: 8,
        stats() {
            return [
                {isPositive: true, type: 'base', name: 'hordeToxic', value: 0.125},
                {isPositive: false, type: 'mult', name: 'hordeAttack', value: 0.25},
                {isPositive: true, type: 'base', name: 'hordeBioAttack', value: 0.15}
            ];
        },
        masteryBoost: 0.25,
        active(lvl) {
            return [
                {type: 'heal', value: 0.14 + lvl * 0.0075, int: 0.008},
                {type: 'buff', value: 12, effect: [
                    {type: 'mult', name: 'hordeToxic', value: 2}
                ]}
            ];
        },
        activeType: 'combat',
        cooldown: () => 130,
        icon: 'mdi-bird',
        activeIcon: 'mdi-feather',
        activeColor: 'skyblue'
    },
    shieldDissolver: {
        findZone: 61,
        findChance: 1 / buildNum(1.4, 'M'),
        price(lvl) {
            return Math.pow(100, lvl - 1) * buildNum(90, 'K');
        },
        cap: 6,
        stats() {
            return [
                {isPositive: true, type: 'base', name: 'hordeShieldbreak', value: 3},
                {isPositive: false, type: 'mult', name: 'hordeHealth', value: 1 / 1.1},
                {isPositive: false, type: 'mult', name: 'hordeDivisionShield', value: 0}
            ];
        },
        masteryBoost: 0.25,
        active() {
            return [
                {type: 'removeDivisionShield', value: 0.3}
            ];
        },
        activeType: 'combat',
        cooldown: lvl => 17 - lvl,
        icon: 'mdi-shield-off',
        activeIcon: 'mdi-shield-remove',
        activeColor: 'deep-orange'
    },
    calmingPill: {
        findZone: 63,
        findChance: 1 / buildNum(1.5, 'M'),
        price(lvl) {
            return Math.pow(100, lvl - 1) * buildNum(100, 'K');
        },
        cap: 11,
        stats(lvl) {
            return [
                {isPositive: true, type: 'bonus', name: 'hordeCorruption', value: -0.09 - lvl * 0.01},
                {isPositive: true, type: 'base', name: 'hordeNostalgia', value: 10}
            ];
        },
        active() {
            return [
                {type: 'removeAttack', value: 0.25},
                {type: 'stun', value: 50}
            ];
        },
        activeType: 'combat',
        cooldown: () => 3 * SECONDS_PER_HOUR,
        icon: 'mdi-pill',
        activeIcon: 'mdi-pill',
        activeColor: 'pale-red'
    },
    cleansingFluid: {
        findZone: 65,
        findChance: 1 / buildNum(7.5, 'M'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(120, 'K');
        },
        cap: 16,
        stats(lvl) {
            return [
                {isPositive: true, type: 'bonus', name: 'hordeCorruption', value: -0.23 - lvl * 0.02}
            ];
        },
        active() {
            return [
                {type: 'removeAttack', value: 0.1},
                {type: 'heal', value: 0.15, int: 0.007}
            ];
        },
        activeType: 'combat',
        cooldown: () => 65,
        icon: 'mdi-bottle-tonic',
        activeIcon: 'mdi-bottle-tonic',
        activeColor: 'cyan'
    },
    forbiddenSword: {
        findZone: 67,
        findChance: 1 / buildNum(1.8, 'M'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(200, 'K');
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeAttack', value: lvl * 15 + 210},
                {isPositive: true, type: 'base', name: 'hordeCritChance', value: 0.1},
                {isPositive: true, type: 'base', name: 'hordeCritMult', value: 0.1},
                {isPositive: false, type: 'mult', name: 'hordeCorruption', value: 1.15}
            ];
        },
        masteryBoost: 0.25,
        active() {
            return [
                {type: 'damagePhysic', value: 6.66, str: 0.0666, int: 0.0666}
            ];
        },
        activeType: 'combat',
        cooldown: () => 15,
        icon: 'mdi-sword',
        activeIcon: 'mdi-sword',
        activeColor: 'deep-purple'
    },
    antidote: {
        findZone: 70,
        findChance: 1 / buildNum(2, 'M'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(250, 'K');
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeHealth', value: lvl * 750 + 8250},
                {isPositive: true, type: 'mult', name: 'hordeBioTaken', value: 1 / 1.25}
            ];
        },
        active() {
            return [
                {type: 'antidote', value: 1}
            ];
        },
        activeType: 'combat',
        cooldown: () => 25,
        icon: 'mdi-bottle-tonic-plus',
        activeIcon: 'mdi-bottle-tonic-plus',
        activeColor: 'light-blue'
    },
    corruptedBone: {
        findZone: 73,
        findChance: 1 / buildNum(2.2, 'M'),
        price(lvl) {
            return Math.pow(100, lvl - 1) * buildNum(300, 'K');
        },
        cap: 7,
        stats() {
            return [
                {isPositive: true, type: 'mult', name: 'currencyHordeBoneGain', value: 2.25},
                {isPositive: true, type: 'mult', name: 'currencyHordeMonsterPartGain', value: 1.2},
                {isPositive: false, type: 'mult', name: 'hordeCorruption', value: 1.15}
            ];
        },
        masteryBoost: 0.25,
        active(lvl) {
            return [
                {type: 'bone', value: 11.5 + lvl * 0.5}
            ];
        },
        activeType: 'utility',
        cooldown: () => 270,
        icon: 'mdi-bone',
        activeIcon: 'mdi-bone',
        activeColor: 'pink-purple'
    },
    plaguebringer: {
        findZone: 75,
        findChance: 1 / buildNum(11, 'M'),
        price(lvl) {
            return Math.pow(100, lvl - 1) * buildNum(400, 'K');
        },
        cap: 5,
        stats() {
            return [
                {isPositive: true, type: 'mult', name: 'hordeCorruption', value: 2}
            ];
        },
        active() {
            return [
                {type: 'removeAttack', value: 0.8},
                {type: 'silence', value: 90},
                {type: 'buff', value: 300, effect: [
                    {type: 'base', name: 'hordeCritChance', value: 0.75},
                    {type: 'base', name: 'hordeCritMult', value: 3},
                    {type: 'base', name: 'hordeSpellblade', value: 6.5},
                    {type: 'base', name: 'hordeCutting', value: 0.2},
                    {type: 'base', name: 'hordeShieldbreak', value: 15},
                    {type: 'base', name: 'hordeStatusResist', value: 15},
                    {type: 'base', name: 'hordeRecovery', value: 0.25}
                ]}
            ];
        },
        activeType: 'combat',
        cooldown: lvl => SECONDS_PER_DAY - (lvl - 1) * SECONDS_PER_HOUR,
        icon: 'mdi-magic-staff',
        activeIcon: 'mdi-flare',
        activeColor: 'black'
    },
    forbiddenShield: {
        findZone: 77,
        findChance: 1 / buildNum(2.7, 'M'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(500, 'K');
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeHealth', value: lvl * 750 + 6750},
                {isPositive: true, type: 'base', name: 'hordeRevive', value: 1},
                {isPositive: false, type: 'mult', name: 'hordeCorruption', value: 1.15}
            ];
        },
        masteryBoost: 0.25,
        active() {
            return [
                {type: 'heal', value: 0.75, int: 0.03},
                {type: 'revive', value: 1}
            ];
        },
        activeType: 'combat',
        cooldown: () => 320,
        icon: 'mdi-shield',
        activeIcon: 'mdi-shield',
        activeColor: 'deep-purple'
    },
    dangerShield: {
        findZone: 80,
        findChance: 1 / buildNum(3.1, 'M'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(550, 'K');
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeHealth', value: lvl * 450 + 4550},
                {isPositive: true, type: 'mult', name: 'hordePhysicTaken', value: 1 / 1.2},
                {isPositive: true, type: 'base', name: 'hordeDivisionShield', value: 1}
            ];
        },
        active() {
            return [
                {type: 'heal', value: 0.04, int: 0.002},
                {type: 'removeAttack', value: 0.02},
                {type: 'stun', value: 2}
            ];
        },
        activeType: 'combat',
        cooldown: () => 22,
        icon: 'mdi-shield-alert',
        activeIcon: 'mdi-alert-octagram',
        activeColor: 'wooden'
    },
    forbiddenToxin: {
        findZone: 83,
        findChance: 1 / buildNum(3.5, 'M'),
        price(lvl) {
            return Math.pow(100, lvl - 1) * buildNum(600, 'K');
        },
        cap: 6,
        stats() {
            return [
                {isPositive: true, type: 'base', name: 'hordeToxic', value: 0.05},
                {isPositive: false, type: 'mult', name: 'hordeCorruption', value: 1.15}
            ];
        },
        masteryBoost: 0.25,
        active(lvl) {
            return [
                {type: 'poison', value: lvl * 0.04 + 0.16, int: 0.01}
            ];
        },
        activeType: 'combat',
        cooldown: () => 20,
        icon: 'mdi-bottle-tonic-skull',
        activeIcon: 'mdi-bottle-tonic-skull',
        activeColor: 'deep-purple'
    },
    glowingEye: {
        findZone: 85,
        findChance: 1 / buildNum(17.5, 'M'),
        price(lvl) {
            return Math.pow(100, lvl - 1) * buildNum(750, 'K');
        },
        cap: 10,
        stats() {
            return [
                {isPositive: true, type: 'mult', name: 'currencyHordeSoulCorruptedGain', value: 1.05},
                {isPositive: true, type: 'mult', name: 'hordeHeirloomChance', value: 1.05},
                {isPositive: false, type: 'mult', name: 'hordeCorruption', value: 1.15}
            ];
        },
        masteryBoost: 0.25,
        active(lvl) {
            return [
                {type: 'maxdamageBio', value: 0.12, int: 0.001},
                {type: 'damageBio', value: 5 + lvl * 0.3}
            ];
        },
        activeType: 'combat',
        cooldown: () => 70,
        icon: 'mdi-eye',
        activeIcon: 'mdi-laser-pointer',
        activeColor: 'pink'
    },
    experimentalVaccine: {
        findZone: 87,
        findChance: 1 / buildNum(7, 'M'),
        price(lvl) {
            return Math.pow(buildNum(1, 'M'), lvl - 1) * buildNum(1, 'M');
        },
        cap: 3,
        stats() {
            return [
                {isPositive: false, type: 'mult', name: 'hordeAttack', value: 1 / 1.5},
                {isPositive: false, type: 'mult', name: 'hordeHealth', value: 1 / 1.5},
                {isPositive: true, type: 'mult', name: 'hordeCorruption', value: 1 / 1.2}
            ];
        },
        masteryBoost: 0.25,
        active(lvl) {
            return [
                {type: 'buff', value: lvl * 2 + 14, effect: [
                    {type: 'mult', name: 'hordeAttack', value: 1.5},
                    {type: 'mult', name: 'hordePhysicTaken', value: 1 / 1.5},
                    {type: 'mult', name: 'hordeMagicTaken', value: 1 / 1.5},
                    {type: 'mult', name: 'hordeBioTaken', value: 1 / 1.5}
                ]}
            ];
        },
        activeType: 'combat',
        cooldown: () => 110,
        icon: 'mdi-needle',
        activeIcon: 'mdi-needle',
        activeColor: 'cyan'
    },
    glasses: {
        findZone: 90,
        findChance: 1 / buildNum(9, 'M'),
        price(lvl) {
            return Math.pow(100, lvl - 1) * buildNum(1.25, 'M');
        },
        cap: 6,
        stats() {
            return [
                {isPositive: true, type: 'mult', name: 'hordeMagicTaken', value: 1 / 1.75},
                {isPositive: false, type: 'base', name: 'hordePhysicTaken', value: 0.3},
                {isPositive: false, type: 'base', name: 'hordeBioTaken', value: 0.3}
            ];
        },
        masteryBoost: 0.25,
        active() {
            return [
                {type: 'buff', value: 5, effect: [
                    {type: 'mult', name: 'hordeMagicTaken', value: 0}
                ]}
            ];
        },
        activeType: 'combat',
        cooldown: lvl => 90 - lvl * 6,
        icon: 'mdi-glasses',
        activeIcon: 'mdi-magnify',
        activeColor: 'pale-blue'
    },
    microscope: {
        findZone: 93,
        findChance: 1 / buildNum(12, 'M'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(1.5, 'M');
        },
        cap: 6,
        stats() {
            return [
                {isPositive: true, type: 'mult', name: 'hordeBioTaken', value: 1 / 1.75},
                {isPositive: false, type: 'base', name: 'hordePhysicTaken', value: 0.3},
                {isPositive: false, type: 'base', name: 'hordeMagicTaken', value: 0.3}
            ];
        },
        masteryBoost: 0.25,
        active() {
            return [
                {type: 'buff', value: 5, effect: [
                    {type: 'mult', name: 'hordeBioTaken', value: 0}
                ]}
            ];
        },
        activeType: 'combat',
        cooldown: lvl => 90 - lvl * 6,
        icon: 'mdi-microscope',
        activeIcon: 'mdi-microscope',
        activeColor: 'teal'
    },
    moltenShield: {
        findZone: 95,
        findChance: 1 / buildNum(60, 'M'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(1.8, 'M');
        },
        stats(lvl, stacks) {
            return [
                {isPositive: true, type: 'base', name: 'hordeHealth', value: lvl * 1000 + getDiminishing(stacks) * 1000 + 1000}
            ];
        },
        active() {
            return [
                {type: 'addStack', value: null}
            ];
        },
        activeType: 'utility',
        cooldown: () => HORDE_STACKING_COOLDOWN,
        icon: 'mdi-shield-half-full',
        activeIcon: 'mdi-sun-wireless',
        activeColor: 'orange-red'
    },
    cutter: {
        findZone: 97,
        findChance: 1 / buildNum(16, 'M'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(2.2, 'M');
        },
        stats() {
            return [
                {isPositive: false, type: 'mult', name: 'hordeAttack', value: 1 / 2.5},
                {isPositive: true, type: 'base', name: 'hordeCutting', value: 0.05},
                {isPositive: false, type: 'mult', name: 'hordeRecovery', value: 0.5}
            ];
        },
        masteryBoost: 0.25,
        active(lvl) {
            return [
                {type: 'maxdamageBio', value: 0.08, str: 0.0007},
                {type: 'damageBio', value: 1.68 + lvl * 0.02, int: 0.03}
            ];
        },
        activeType: 'combat',
        cooldown: () => 30,
        icon: 'mdi-box-cutter',
        activeIcon: 'mdi-box-cutter',
        activeColor: 'wooden'
    },
    book: {
        findZone: 100,
        findChance: 1 / buildNum(20, 'M'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(2.75, 'M');
        },
        stats(lvl, stacks) {
            return [
                {isPositive: true, type: 'mult', name: 'hordeEquipmentMasteryGain', value: lvl * 0.03 + getDiminishing(stacks) * 0.03 + 1.03}
            ];
        },
        active() {
            return [
                {type: 'addStack', value: null}
            ];
        },
        activeType: 'utility',
        cooldown: () => HORDE_STACKING_COOLDOWN,
        icon: 'mdi-book',
        activeIcon: 'mdi-book-alert',
        activeColor: 'indigo'
    },
    chocolateMilk: {
        findZone: 107,
        findChance: 1 / buildNum(40, 'M'),
        price(lvl) {
            return Math.pow(100, lvl - 1) * buildNum(4, 'M');
        },
        cap: 11,
        stats(lvl, stacks) {
            return [
                {isPositive: true, type: 'mult', name: 'currencyHordeBoneGain', value: lvl * 0.01 + getApproaching(0.01, 0.3, stacks) + 1.09}
            ];
        },
        active() {
            return [
                {type: 'addStack', value: null}
            ];
        },
        activeType: 'utility',
        cooldown: () => HORDE_STACKING_COOLDOWN,
        icon: 'mdi-beer',
        activeIcon: 'mdi-beer',
        activeColor: 'brown'
    },
    bigHammer: {
        findZone: 114,
        findChance: 1 / buildNum(80, 'M'),
        price(lvl) {
            return Math.pow(100, lvl - 1) * buildNum(7, 'M');
        },
        stats(lvl) {
            return [
                {isPositive: false, type: 'mult', name: 'hordeAttack', value: 1 / 1.2},
                {isPositive: true, type: 'base', name: 'hordeCritChance', value: 0.15},
                {isPositive: true, type: 'base', name: 'hordeCritMult', value: lvl * 0.02 + 0.68}
            ];
        },
        masteryBoost: 0.25,
        active() {
            return [
                {type: 'damagePhysic', value: 18.5},
                {type: 'stun', value: 8},
                {type: 'silence', value: 25}
            ];
        },
        activeType: 'combat',
        cooldown: () => 260,
        icon: 'mdi-hammer',
        activeIcon: 'mdi-hammer',
        activeColor: 'pale-blue'
    },
    spookyPumpkin: {
        findZone: 121,
        findChance: 1 / buildNum(160, 'M'),
        price(lvl) {
            return Math.pow(100, lvl - 1) * buildNum(12, 'M');
        },
        cap: 6,
        stats() {
            return [
                {isPositive: true, type: 'base', name: 'hordeStatusResist', value: 4},
                {isPositive: false, type: 'mult', name: 'hordeHealth', value: 1 / 1.25},
                {isPositive: false, type: 'base', name: 'hordeMagicTaken', value: 0.75}
            ];
        },
        masteryBoost: 0.25,
        active() {
            return [
                {type: 'heal', value: 0.1, int: 0.005},
                {type: 'antidote', value: 1},
                {type: 'removeStun', value: null}
            ];
        },
        activeType: 'combat',
        usableInStun: true,
        cooldown: lvl => 53 - 3 * lvl,
        icon: 'mdi-halloween',
        activeIcon: 'mdi-pumpkin',
        activeColor: 'orange'
    },
    strangeChemical: {
        findZone: 128,
        findChance: 1 / buildNum(320, 'M'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(20, 'M');
        },
        cap: 11,
        stats(lvl, stacks) {
            return [
                {isPositive: true, type: 'mult', name: 'currencyHordeMonsterPartGain', value: lvl * 0.01 + getApproaching(0.01, 0.3, stacks) + 1.09}
            ];
        },
        active() {
            return [
                {type: 'addStack', value: null}
            ];
        },
        activeType: 'utility',
        cooldown: () => HORDE_STACKING_COOLDOWN,
        icon: 'mdi-test-tube',
        activeIcon: 'mdi-test-tube',
        activeColor: 'pink-purple'
    },
    forbiddenHeartShield: {
        findZone: 135,
        findChance: 1 / buildNum(640, 'M'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(35, 'M');
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeDivisionShield', value: lvl * 2 + 28},
                {isPositive: true, type: 'base', name: 'hordeStatusResist', value: 6},
                {isPositive: false, type: 'mult', name: 'hordeCorruption', value: 1.15}
            ];
        },
        masteryBoost: 0.25,
        active(lvl) {
            return [
                {type: 'heal', value: 0.12, int: 0.006},
                {type: 'divisionShield', value: lvl + 14}
            ];
        },
        activeType: 'combat',
        cooldown: () => 140,
        icon: 'mdi-heart-half-full',
        activeIcon: 'mdi-heart-pulse',
        activeColor: 'deep-purple'
    },
    cloudStaff: {
        findZone: 142,
        findChance: 1 / buildNum(1.2, 'B'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(60, 'M');
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeFirstStrike', value: lvl * 0.04 + 1.76},
                {isPositive: true, type: 'base', name: 'hordeSpellblade', value: lvl * 0.01 + 0.29},
                {isPositive: true, type: 'base', name: 'hordeDivisionShield', value: 5}
            ];
        },
        active() {
            return [
                {type: 'damageMagic', value: 3.65, int: 0.11},
                {type: 'divisionShield', value: 2}
            ];
        },
        activeType: 'combat',
        cooldown: () => 12,
        icon: 'mdi-magic-staff',
        activeIcon: 'mdi-cloud',
        activeColor: 'skyblue'
    },
    secretWeapon: {
        findZone: 149,
        findChance: 1 / buildNum(2.4, 'B'),
        price(lvl) {
            return Math.pow(100, lvl - 1) * buildNum(110, 'M');
        },
        cap: 21,
        stats() {
            return [
                {isPositive: true, type: 'base', name: 'hordeToxic', value: 0.1},
                {isPositive: true, type: 'base', name: 'hordeCutting', value: 0.06},
                {isPositive: false, type: 'mult', name: 'hordeRecovery', value: 0},
                {isPositive: false, type: 'mult', name: 'hordeDivisionShield', value: 0},
                {isPositive: false, type: 'mult', name: 'hordeRevive', value: 0}
            ];
        },
        masteryBoost: 0.25,
        active(lvl) {
            return [
                {type: 'poison', value: 24, str: 0.25, int: 0.25},
                {type: 'silence', value: lvl + 29},
                {type: 'buff', value: 35, effect: [
                    {type: 'base', name: 'hordeCutting', value: 0.1}
                ]}
            ];
        },
        activeType: 'combat',
        cooldown: () => 720,
        icon: 'mdi-eyedropper',
        activeIcon: 'mdi-virus',
        activeColor: 'lime'
    },
    bomb: {
        findZone: 156,
        findChance: 1 / buildNum(4.8, 'B'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(175, 'M');
        },
        cap: 11,
        stats() {
            return [
                {isPositive: true, type: 'mult', name: 'hordeAttack', value: 1.5},
                {isPositive: true, type: 'mult', name: 'hordeHealth', value: 1.35},
                {isPositive: false, type: 'mult', name: 'currencyHordeBoneGain', value: 0},
                {isPositive: false, type: 'mult', name: 'currencyHordeMonsterPartGain', value: 0}
            ];
        },
        masteryBoost: 0.25,
        active() {
            return [
                {type: 'damageMagic', value: 38, int: 0.75}
            ];
        },
        activeType: 'combat',
        cooldown: lvl => 3090 - 90 * lvl,
        icon: 'mdi-bomb',
        activeIcon: 'mdi-bomb',
        activeColor: 'red'
    },
    leechingStaff: {
        findZone: 163,
        findChance: 1 / buildNum(10, 'B'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(320, 'M');
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeAttack', value: lvl * 4 + 116},
                {isPositive: true, type: 'base', name: 'hordeRecovery', value: 0.03}
            ];
        },
        active() {
            return [
                {type: 'maxdamageBio', value: 0.125},
                {type: 'heal', value: 0.125}
            ];
        },
        activeType: 'combat',
        cooldown: () => 52,
        icon: 'mdi-magic-staff',
        activeIcon: 'mdi-swap-horizontal',
        activeColor: 'light-green'
    },
    shatteredGem: {
        findZone: 170,
        findChance: 1 / buildNum(20, 'B'),
        price(lvl) {
            return Math.pow(1000, lvl - 1) * buildNum(550, 'M');
        },
        stats(lvl, stacks) {
            return [
                {isPositive: true, type: 'base', name: 'hordeHeirloomChance', value: lvl * 0.001 + getApproaching(0.001, 0.05, stacks) + 0.004}
            ];
        },
        active() {
            return [
                {type: 'addStack', value: null}
            ];
        },
        activeType: 'utility',
        cooldown: () => HORDE_STACKING_COOLDOWN,
        icon: 'mdi-rhombus-split',
        activeIcon: 'mdi-rhombus',
        activeColor: 'light-blue'
    },
    hourglass: {
        findZone: 177,
        findChance: 1 / buildNum(40, 'B'),
        price(lvl) {
            return Math.pow(100, lvl - 1) * buildNum(975, 'M');
        },
        cap: 11,
        stats() {
            return [
                {isPositive: true, type: 'base', name: 'hordeHaste', value: 30}
            ];
        },
        active(lvl) {
            return [
                {type: 'buff', value: 45, effect: [
                    {type: 'base', name: 'hordeHaste', value: 50},
                    {type: 'base', name: 'hordeSpellblade', value: lvl * 0.05 + 0.95}
                ]}
            ];
        },
        activeType: 'combat',
        cooldown: () => 20 * SECONDS_PER_MINUTE,
        icon: 'mdi-timer-sand',
        activeIcon: 'mdi-timer-sand-complete',
        activeColor: 'pale-yellow'
    },
    glue: {
        findZone: 184,
        findChance: 1 / buildNum(80, 'B'),
        price(lvl) {
            return Math.pow(100, lvl - 1) * buildNum(1.75, 'B');
        },
        cap: 6,
        stats() {
            return [
                {isPositive: true, type: 'mult', name: 'hordeAttack', value: 1.35},
                {isPositive: false, type: 'base', name: 'hordeHaste', value: -30}
            ];
        },
        masteryBoost: 0.25,
        active(lvl) {
            return [
                {type: 'maxdamageBio', value: 0.3, int: 0.0025},
                {type: 'damageMagic', value: lvl * 0.5 + 7, int: 0.1}
            ];
        },
        activeType: 'combat',
        cooldown: () => 40,
        icon: 'mdi-bottle-tonic',
        activeIcon: 'mdi-liquid-spot',
        activeColor: 'pale-green'
    },
    firework: {
        findZone: 191,
        findChance: 1 / buildNum(160, 'B'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(3, 'B');
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeAttack', value: lvl * 2 + 68},
                {isPositive: true, type: 'base', name: 'hordeCritChance', value: 0.15},
                {isPositive: true, type: 'base', name: 'hordeToxic', value: 0.01}
            ];
        },
        active() {
            return [
                {type: 'damageBio', value: 18, int: 0.35},
                {type: 'poison', value: 2.75, int: 0.13},
                {type: 'buff', value: 60, effect: [
                    {type: 'base', name: 'hordeCritMult', value: 2.75}
                ]}
            ];
        },
        activeType: 'combat',
        cooldown: () => 290,
        icon: 'mdi-firework',
        activeIcon: 'mdi-firework',
        activeColor: 'pink-purple'
    },
    bowTie: {
        findZone: 198,
        findChance: 1 / buildNum(320, 'B'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(5, 'B');
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeHealth', value: lvl * 550 + 9050},
                {isPositive: true, type: 'base', name: 'hordeDivisionShield', value: lvl + 29},
                {isPositive: false, type: 'mult', name: 'hordeRecovery', value: 0}
            ];
        },
        masteryBoost: 0.25,
        active() {
            return [
                {type: 'heal', value: 0.09, int: 0.0035},
                {type: 'divisionShield', value: 4}
            ];
        },
        activeType: 'combat',
        cooldown: () => 28,
        icon: 'mdi-bow-tie',
        activeIcon: 'mdi-bow-tie',
        activeColor: 'beige'
    },
    forbiddenStopwatch: {
        findZone: 205,
        findChance: 1 / buildNum(640, 'B'),
        price(lvl) {
            return Math.pow(100, lvl - 1) * buildNum(8, 'B');
        },
        cap: 6,
        stats() {
            return [
                {isPositive: true, type: 'base', name: 'hordeHaste', value: 70},
                {isPositive: false, type: 'mult', name: 'hordeCorruption', value: 1.15}
            ];
        },
        masteryBoost: 0.25,
        active(lvl) {
            return [
                {type: 'stun', value: lvl + 34}
            ];
        },
        activeType: 'combat',
        cooldown: () => 360,
        icon: 'mdi-timer',
        activeIcon: 'mdi-timer',
        activeColor: 'purple'
    },
    mysticalAccelerator: {
        findZone: 212,
        findChance: 1 / buildNum(1.25, 'T'),
        price(lvl) {
            return Math.pow(1000, lvl - 1) * buildNum(12.5, 'B');
        },
        cap: 5,
        stats(lvl, stacks) {
            return [
                {isPositive: true, type: 'mult', name: 'hordeShardChance', value: lvl * 0.05 + getDiminishing(stacks) * 0.05 + 1.05}
            ];
        },
        active() {
            return [
                {type: 'addStack', value: null}
            ];
        },
        activeType: 'utility',
        cooldown: () => HORDE_STACKING_COOLDOWN,
        icon: 'mdi-rotate-orbit',
        activeIcon: 'mdi-rotate-orbit',
        activeColor: 'teal'
    },
    blazingStaff: {
        findZone: 219,
        findChance: 1 / buildNum(2.5, 'T'),
        price(lvl) {
            return Math.pow(1000, lvl - 1) * buildNum(18, 'B');
        },
        cap: 4,
        stats() {
            return [
                {isPositive: true, type: 'mult', name: 'hordeAttack', value: 2.5},
                {isPositive: false, type: 'mult', name: 'hordeHealth', value: 0.5}
            ];
        },
        masteryBoost: 0.25,
        active(lvl) {
            return [
                {type: 'damageMagic', value: lvl * 3 + 25, str: 0.6},
                {type: 'buff', value: 12, effect: [
                    {type: 'mult', name: 'hordeAttack', value: 1.4}
                ]}
            ];
        },
        activeType: 'combat',
        cooldown: lvl => 85 - lvl * 5,
        icon: 'mdi-magic-staff',
        activeIcon: 'mdi-fire-alert',
        activeColor: 'orange'
    },
    stoneplate: {
        findZone: 222,
        findChance: 1 / buildNum(3.5, 'T'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(20, 'B');
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeHealth', value: lvl * 1200 + 2.28e4},
                {isPositive: true, type: 'mult', name: 'hordeHealth', value: 2},
                {isPositive: false, type: 'mult', name: 'hordeHealing', value: 0.25}
            ];
        },
        masteryBoost: 0.25,
        active() {
            return [
                {type: 'divisionShield', value: 20},
                {type: 'stun', value: 20}
            ];
        },
        activeType: 'combat',
        cooldown: () => 175,
        icon: 'mdi-rhombus-split',
        activeIcon: 'mdi-rhombus-split',
        activeColor: 'grey'
    },
    shield: {
        findZone: 226,
        findChance: 1 / buildNum(5, 'T'),
        price(lvl) {
            return Math.pow(1000, lvl - 1) * buildNum(25, 'B');
        },
        cap: 4,
        stats() {
            return [
                {isPositive: true, type: 'base', name: 'hordeDefense', value: 0.004}
            ];
        },
        active() {
            return [
                {type: 'buff', value: 8, effect: [
                    {type: 'mult', name: 'hordePhysicTaken', value: 0.25},
                    {type: 'mult', name: 'hordeMagicTaken', value: 0.25},
                    {type: 'mult', name: 'hordeBioTaken', value: 0.25}
                ]}
            ];
        },
        activeType: 'combat',
        cooldown: (lvl) => 90 - lvl * 5,
        icon: 'mdi-shield',
        activeIcon: 'mdi-shield-plus',
        activeColor: 'pale-blue'
    },
    armor: {
        findZone: 233,
        findChance: 1 / buildNum(10, 'T'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(35, 'B');
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeHealth', value: lvl * 500 + buildNum(12, 'K')},
                {isPositive: true, type: 'base', name: 'hordeDefense', value: 0.0025}
            ];
        },
        active() {
            return [
                {type: 'divisionShield', value: 12}
            ];
        },
        activeType: 'combat',
        cooldown: () => 55,
        icon: 'mdi-tshirt-crew',
        activeIcon: 'mdi-shield-half-full',
        activeColor: 'indigo'
    },
    natureStone: {
        findZone: 240,
        findChance: 1 / buildNum(20, 'T'),
        price(lvl) {
            return Math.pow(1000, lvl - 1) * buildNum(50, 'B');
        },
        cap: 5,
        stats() {
            return [
                {isPositive: true, type: 'base', name: 'hordeRecovery', value: 0.01},
                {isPositive: true, type: 'base', name: 'hordeHealing', value: 0.3}
            ];
        },
        active(lvl) {
            return [
                {type: 'maxdamageBio', value: 0.15, int: 0.0012},
                {type: 'heal', value: lvl * 0.04 + 0.3, int: 0.025}
            ];
        },
        activeType: 'combat',
        cooldown: () => 130,
        icon: 'mdi-alpha-x-circle',
        activeIcon: 'mdi-heart-circle',
        activeColor: 'light-green'
    },
    evergrowingVine: {
        findZone: 247,
        findChance: 1 / buildNum(40, 'T'),
        price(lvl) {
            return Math.pow(buildNum(1, 'M'), lvl - 1) * buildNum(75, 'B');
        },
        cap: 3,
        stats() {
            return [
                {isPositive: true, type: 'mult', name: 'hordeHealth', value: 1.5},
                {isPositive: true, type: 'base', name: 'hordeRecovery', value: 0.2},
                {isPositive: false, type: 'mult', name: 'hordeDefense', value: 0},
                {isPositive: false, type: 'mult', name: 'hordeDivisionShield', value: 0},
                {isPositive: true, type: 'tag', name: 'hordePassiveRecovery', value: [0.1]}
            ];
        },
        masteryBoost: 0.25,
        active(lvl) {
            return [
                {type: 'buff', value: lvl * 3 + 21, effect: [
                    {type: 'base', name: 'hordeHealing', value: 0.25}
                ]}
            ];
        },
        activeType: 'combat',
        cooldown: () => 150,
        icon: 'mdi-lasso',
        activeIcon: 'mdi-heart-multiple',
        activeColor: 'green'
    },
    energyDrink: {
        findZone: 254,
        findChance: 1 / buildNum(80, 'T'),
        price(lvl) {
            return Math.pow(buildNum(1, 'M'), lvl - 1) * buildNum(140, 'B');
        },
        cap: 3,
        stats() {
            return [
                {isPositive: true, type: 'base', name: 'hordeHaste', value: 60},
                {isPositive: false, type: 'mult', name: 'hordeCritMult', value: 0.5}
            ];
        },
        masteryBoost: 0.25,
        active(lvl) {
            return [
                {type: 'buff', value: lvl + 7, effect: [
                    {type: 'base', name: 'hordeCritChance', value: 0.35},
                    {type: 'base', name: 'hordeCritMult', value: 0.8}
                ]}
            ];
        },
        activeType: 'combat',
        cooldown: () => 48,
        icon: 'mdi-beer',
        activeIcon: 'mdi-lightning-bolt',
        activeColor: 'amber'
    },
    dragonheart: {
        findZone: 261,
        findChance: 1 / buildNum(160, 'T'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(225, 'B');
        },
        cap: 21,
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeRecovery', value: lvl * 0.001 + 0.039},
                {isPositive: true, type: 'base', name: 'hordeDefense', value: 0.002}
            ];
        },
        active() {
            return [
                {type: 'buff', value: 14, effect: [
                    {type: 'base', name: 'hordeDefense', value: 0.05}
                ]}
            ];
        },
        activeType: 'combat',
        cooldown: () => 160,
        icon: 'mdi-heart',
        activeIcon: 'mdi-heart',
        activeColor: 'pink-purple'
    },
    prism: {
        findZone: 268,
        findChance: 1 / buildNum(320, 'T'),
        price(lvl) {
            return Math.pow(1000, lvl - 1) * buildNum(400, 'B');
        },
        cap: 8,
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'currencyHordeMysticalShardCap', value: lvl * 2 + 24}
            ];
        },
        active() {
            return [
                {type: 'maxdamageBio', value: 0.3, str: 0.002},
                {type: 'damagePhysic', value: 15, str: 0.32},
                {type: 'poison', value: 1.25, int: 0.06}
            ];
        },
        activeCost: () => {
            return {mysticalShard: 1};
        },
        activeType: 'combat',
        cooldown: () => 330,
        icon: 'mdi-mirror-variant',
        activeIcon: 'mdi-mirror-variant',
        activeColor: 'teal'
    },
    deathsword: {
        findZone: 275,
        findChance: 1 / buildNum(640, 'T'),
        price(lvl) {
            return Math.pow(1000, lvl - 1) * buildNum(700, 'B');
        },
        cap: 5,
        stats() {
            return [
                {isPositive: true, type: 'base', name: 'hordeExecute', value: 0.06}
            ];
        },
        active() {
            return [
                {type: 'buff', value: 5, effect: [
                    {type: 'base', name: 'hordeCutting', value: 0.15}
                ]}
            ];
        },
        activeType: 'combat',
        cooldown: (lvl) => 170 - 10 * lvl,
        icon: 'mdi-sword',
        activeIcon: 'mdi-skull',
        activeColor: 'darker-grey'
    },
    needle: {
        findZone: 282,
        findChance: 1 / buildNum(1.25, 'Qa'),
        price(lvl) {
            return Math.pow(1000, lvl - 1) * buildNum(1.2, 'T');
        },
        cap: 5,
        stats() {
            return [
                {isPositive: true, type: 'base', name: 'hordeExecute', value: 0.04},
                {isPositive: true, type: 'base', name: 'hordeCutting', value: 0.01}
            ];
        },
        active() {
            return [
                {type: 'maxdamageBio', value: 0.45, str: 0.003}
            ];
        },
        activeType: 'combat',
        activeCost: () => {
            return {health: 0.1};
        },
        cooldown: (lvl) => 275 - 15 * lvl,
        icon: 'mdi-nail',
        activeIcon: 'mdi-nail',
        activeColor: 'pale-purple'
    },
    mine: {
        findZone: 289,
        findChance: 1 / buildNum(2.5, 'Qa'),
        price(lvl) {
            return Math.pow(100, lvl - 1) * buildNum(2, 'T');
        },
        cap: 9,
        stats() {
            return [
                {isPositive: false, type: 'mult', name: 'hordeAttack', value: 1 / 1.25},
                {isPositive: true, type: 'base', name: 'hordeCritChance', value: 0.2},
                {isPositive: true, type: 'base', name: 'hordeHaste', value: 20},
                {isPositive: true, type: 'tag', name: 'hordeActiveDamageCrit', value: [0.4]}
            ];
        },
        masteryBoost: 0.25,
        active(lvl) {
            return [
                {type: 'damagePhysic', value: lvl * 0.25 + 4.25, str: 0.13, canCrit: 1}
            ];
        },
        activeType: 'combat',
        cooldown: () => 42,
        icon: 'mdi-mine',
        activeIcon: 'mdi-mine',
        activeColor: 'deep-orange'
    },
    maskOfJoy: {
        findZone: 296,
        findChance: 1 / buildNum(5, 'Qa'),
        price(lvl) {
            return Math.pow(1000, lvl - 1) * buildNum(3.3, 'T');
        },
        cap: 5,
        stats() {
            return [
                {isPositive: true, type: 'base', name: 'hordeCritChance', value: 0.3},
                {isPositive: true, type: 'base', name: 'hordeHealing', value: 0.1},
                {isPositive: true, type: 'tag', name: 'hordeActiveHealCrit', value: [0.25]}
            ];
        },
        active() {
            return [
                {type: 'heal', value: 0.1, int: 0.005, canCrit: 0.6}
            ];
        },
        activeType: 'combat',
        cooldown: (lvl) => 275 - 15 * lvl,
        icon: 'mdi-drama-masks',
        activeIcon: 'mdi-drama-masks',
        activeColor: 'pale-green'
    },
    doubleEdgedSword: {
        findZone: 307,
        findChance: 1 / buildNum(12, 'Qa'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(10, 'T');
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeSpellblade', value: lvl * 0.04 + 0.76},
                {isPositive: true, type: 'tag', name: 'hordeSpellbladeOnActive', value: [1]}
            ];
        },
        active() {
            return [
                {type: 'damageMagic', value: 4.4, int: 0.15}
            ];
        },
        activeType: 'combat',
        cooldown: () => 11,
        icon: 'mdi-sword',
        activeIcon: 'mdi-sword',
        activeColor: 'babypink'
    },
    critCore: {
        findZone: 318,
        findChance: 1 / buildNum(30, 'Qa'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(75, 'T');
        },
        stats(lvl) {
            return [
                {isPositive: false, type: 'mult', name: 'hordeCritChance', value: 0.5},
                {isPositive: true, type: 'base', name: 'hordeCritMult', value: lvl * 0.05 + 0.45},
                {isPositive: true, type: 'tag', name: 'hordeCritOnNonCrit', value: [0.2]}
            ];
        },
        active() {
            return [
                {type: 'buff', value: 8, effect: [
                    {type: 'bonus', name: 'hordeCritChance', value: 1}
                ]}
            ];
        },
        activeType: 'combat',
        cooldown: () => 156,
        icon: 'mdi-atom-variant',
        activeIcon: 'mdi-motion',
        activeColor: 'deep-orange'
    },
    heavyGauntlet: {
        findZone: 329,
        findChance: 1 / buildNum(75, 'Qa'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(500, 'T');
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeFirstStrike', value: lvl * 0.2 + 3.8},
                {isPositive: true, type: 'tag', name: 'hordeFirstStrikeStun', value: [2]}
            ];
        },
        active() {
            return [
                {type: 'damageMagic', value: 17.5, int: 0.7},
                {type: 'stun', value: 18}
            ];
        },
        activeType: 'combat',
        cooldown: () => 260,
        icon: 'mdi-hand-back-left',
        activeIcon: 'mdi-alert-octagram-outline',
        activeColor: 'indigo'
    },
    dumbbell: {
        findZone: 340,
        findChance: 1 / buildNum(180, 'Qa'),
        price(lvl) {
            return Math.pow(1000, lvl - 1) * buildNum(3.2, 'Qa');
        },
        cap: 5,
        stats() {
            return [
                {isPositive: true, type: 'base', name: 'hordeStrength', value: 4}
            ];
        },
        active() {
            return [
                {type: 'buff', value: 60, effect: [
                    {type: 'base', name: 'hordeStrength', value: 10}
                ]}
            ];
        },
        activeType: 'combat',
        cooldown: lvl => 375 - lvl * 15,
        icon: 'mdi-dumbbell',
        activeIcon: 'mdi-dumbbell',
        activeColor: 'amber'
    },
    essenceExtractor: {
        findZone: 351,
        findChance: 1 / buildNum(1, 'Qa'),
        cap: 1,
        stats() {
            return [
                {isPositive: true, type: 'text', name: 'hordeLootElementalEssence', value: true},
                {isPositive: false, type: 'mult', name: 'hordeHeirloomChance', value: 0},
                {isPositive: false, type: 'mult', name: 'hordeCorruption', value: 1.15}
            ];
        },
        cooldown: () => 999999999,
        icon: 'mdi-eyedropper',
    },
    spellbook: {
        findZone: 362,
        findChance: 1 / buildNum(1.2, 'Qi'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(160, 'Qa');
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeSpellblade', value: lvl * 0.03 + 0.57},
                {isPositive: true, type: 'base', name: 'hordeIntelligence', value: 4}
            ];
        },
        active(lvl) {
            return [
                {type: 'damageMagic', value: 3.5, int: 0.25},
                {type: 'buff', value: 2, effect: [
                    {type: 'base', name: 'hordeSpellblade', value: lvl * 0.2 + 1.8}
                ]}
            ];
        },
        activeType: 'combat',
        cooldown: () => 17,
        icon: 'mdi-book-edit',
        activeIcon: 'mdi-book-open-variant',
        activeColor: 'dark-blue'
    },
    forbiddenScissors: {
        findZone: 373,
        findChance: 1 / buildNum(3, 'Qi'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(1.1, 'Qi');
        },
        stats() {
            return [
                {isPositive: true, type: 'mult', name: 'currencyHordeCorruptedFleshGain', value: 1.5},
                {isPositive: false, type: 'mult', name: 'hordeCorruption', value: 1.15}
            ];
        },
        masteryBoost: 0.25,
        active(lvl) {
            return [
                {type: 'monsterPart', value: 245 + lvl * 5}
            ];
        },
        activeType: 'utility',
        cooldown: () => SECONDS_PER_HOUR,
        icon: 'mdi-content-cut',
        activeIcon: 'mdi-scissors-cutting',
        activeColor: 'deep-purple'
    },
    basicSpear: {
        findZone: 384,
        findChance: 1 / buildNum(7.5, 'Qi'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(7.75, 'Qi');
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeAttack', value: lvl * 3 + 97},
                {isPositive: true, type: 'base', name: 'hordeHealth', value: lvl * 600 + 1.94e4},
            ];
        },
        active() {
            return [
                {type: 'damagePhysic', value: 6.8, str: 0.55},
                {type: 'damageMagic', value: 0.5, int: 0.65},
                {type: 'heal', value: 0.08, int: 0.004},
            ];
        },
        activeType: 'combat',
        cooldown: () => 38,
        icon: 'mdi-spear',
        activeIcon: 'mdi-spear',
        activeColor: 'green'
    },
    cursedEye: {
        findZone: 395,
        findChance: 1 / buildNum(18, 'Qi'),
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(55, 'Qi');
        },
        stats() {
            return [
                {isPositive: true, type: 'base', name: 'hordeRareLootTime', value: -40},
                {isPositive: false, type: 'mult', name: 'hordeCorruption', value: 1.15}
            ];
        },
        masteryBoost: 0.25,
        active(lvl) {
            return [
                {type: 'maxdamageBio', value: 0.1, int: 0.001},
                {type: 'damageBio', value: 2 + lvl * 0.25}
            ];
        },
        activeType: 'combat',
        cooldown: () => 44,
        icon: 'mdi-eye-settings',
        activeIcon: 'mdi-laser-pointer',
        activeColor: 'deep-purple'
    },

    blessedSword: {
        findZone: 350,
        findChance: 1 / buildNum(5, 'Qi'),
        unlock: 'hordeEquipmentBlessedSword',
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(25, 'Qa');
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeAttack', value: lvl * 5 + 95},
                {isPositive: true, type: 'bonus', name: 'hordeCorruption', value: -0.2}
            ];
        },
        active() {
            return [
                {type: 'damagePhysic', value: 20, str: 1.45},
                {type: 'buff', value: 120, effect: [
                    {type: 'mult', name: 'hordeAttack', value: 1.25}
                ]}
            ];
        },
        activeType: 'combat',
        cooldown: () => 300,
        icon: 'mdi-sword',
        activeIcon: 'mdi-sword',
        activeColor: 'pale-yellow'
    },
    blessedArmor: {
        findZone: 370,
        findChance: 1 / buildNum(25, 'Qi'),
        unlock: 'hordeEquipmentBlessedArmor',
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(1, 'Qi');
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeHealth', value: lvl * 1000 + 1.9e4},
                {isPositive: true, type: 'bonus', name: 'hordeCorruption', value: -0.2}
            ];
        },
        active() {
            return [
                {type: 'heal', value: 0.15, int: 0.008},
                {type: 'buff', value: 40, effect: [
                    {type: 'mult', name: 'hordePhysicTaken', value: 0.8},
                    {type: 'mult', name: 'hordeMagicTaken', value: 0.8},
                    {type: 'mult', name: 'hordeBioTaken', value: 0.8}
                ]}
            ];
        },
        activeType: 'combat',
        cooldown: () => 90,
        icon: 'mdi-tshirt-v',
        activeIcon: 'mdi-medical-bag',
        activeColor: 'pale-yellow'
    },
    blessedBow: {
        findZone: 390,
        findChance: 1 / buildNum(175, 'Qi'),
        unlock: 'hordeEquipmentBlessedBow',
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(20, 'Qi');
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeFirstStrike', value: lvl * 0.15 + 5.85},
                {isPositive: true, type: 'bonus', name: 'hordeCorruption', value: -0.2}
            ];
        },
        active() {
            return [
                {type: 'damageMagic', value: 5.25, int: 0.1},
                {type: 'heal', value: 0.02, int: 0.001}
            ];
        },
        activeType: 'combat',
        cooldown: () => 12,
        icon: 'mdi-bow-arrow',
        activeIcon: 'mdi-bow-arrow',
        activeColor: 'pale-yellow'
    },
    blessedFlame: {
        findZone: 410,
        findChance: 1 / buildNum(1, 'Sx'),
        unlock: 'hordeEquipmentBlessedFlame',
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(400, 'Qi');
        },
        cap: 20,
        stats() {
            return [
                {isPositive: true, type: 'base', name: 'hordeRecovery', value: 0.06},
                {isPositive: true, type: 'bonus', name: 'hordeCorruption', value: -0.2}
            ];
        },
        active(lvl) {
            return [
                {type: 'heal', value: lvl * 0.04, int: 0.01},
                {type: 'buff', value: 200, effect: [
                    {type: 'base', name: 'hordeRecovery', value: 0.25}
                ]}
            ];
        },
        activeType: 'combat',
        cooldown: () => 480,
        icon: 'mdi-campfire',
        activeIcon: 'mdi-campfire',
        activeColor: 'pale-yellow'
    },
    blessedWater: {
        findZone: 430,
        findChance: 1 / buildNum(6, 'Sx'),
        unlock: 'hordeEquipmentBlessedWater',
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(8, 'Sx');
        },
        cap: 21,
        stats() {
            return [
                {isPositive: true, type: 'base', name: 'hordeToxic', value: 0.025},
                {isPositive: true, type: 'bonus', name: 'hordeCorruption', value: -0.2}
            ];
        },
        active(lvl) {
            return [
                {type: 'poison', value: lvl * 0.025 + 0.475, int: 0.03}
            ];
        },
        activeType: 'combat',
        cooldown: () => 50,
        icon: 'mdi-bottle-tonic',
        activeIcon: 'mdi-bottle-tonic',
        activeColor: 'pale-yellow'
    },
    blessedShield: {
        findZone: 450,
        findChance: 1 / buildNum(35, 'Sx'),
        unlock: 'hordeEquipmentBlessedShield',
        price(lvl) {
            return Math.pow(100, lvl - 1) * buildNum(150, 'Sx');
        },
        cap: 11,
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeDivisionShield', value: lvl + 9},
                {isPositive: true, type: 'bonus', name: 'hordeCorruption', value: -0.2}
            ];
        },
        active(lvl) {
            return [
                {type: 'divisionShield', value: lvl + 9},
                {type: 'stun', value: 4}
            ];
        },
        activeType: 'combat',
        cooldown: () => 55,
        icon: 'mdi-shield-star',
        activeIcon: 'mdi-octagram-outline',
        activeColor: 'pale-yellow'
    },

    pawn: {
        findZone: 100,
        findChance: 1 / buildNum(10, 'M'),
        unlock: 'hordeChessEquipment',
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(1, 'M');
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeAttack', value: lvl * 6 + 34},
                {isPositive: true, type: 'base', name: 'hordeFirstStrike', value: 1.25}
            ];
        },
        active() {
            return [
                {type: 'damagePhysic', value: 2.7, str: 0.08}
            ];
        },
        activeType: 'combat',
        cooldown: () => 5,
        icon: 'mdi-chess-pawn',
        activeIcon: 'mdi-chess-pawn',
        activeColor: 'beige'
    },
    knight: {
        findZone: 150,
        findChance: 1 / buildNum(100, 'M'),
        unlock: 'hordeChessEquipment',
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(4, 'M');
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeSpellblade', value: lvl * 0.02 + 0.38},
                {isPositive: true, type: 'base', name: 'hordeDivisionShield', value: 15}
            ];
        },
        active() {
            return [
                {type: 'damageMagic', value: 4.15, int: 0.1},
                {type: 'stun', value: 2}
            ];
        },
        activeType: 'combat',
        cooldown: () => 12,
        icon: 'mdi-chess-knight',
        activeIcon: 'mdi-chess-knight',
        activeColor: 'orange'
    },
    bishop: {
        findZone: 200,
        findChance: 1 / buildNum(1, 'B'),
        unlock: 'hordeChessEquipment',
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(16, 'M');
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeHealth', value: lvl * 700 + 7000},
                {isPositive: true, type: 'base', name: 'hordeToxic', value: 0.01},
                {isPositive: true, type: 'base', name: 'hordeCutting', value: 0.01}
            ];
        },
        active() {
            return [
                {type: 'maxdamageBio', value: 0.15, str: 0.0012},
                {type: 'poison', value: 0.2, int: 0.01}
            ];
        },
        activeType: 'combat',
        cooldown: () => 39,
        icon: 'mdi-chess-bishop',
        activeIcon: 'mdi-chess-bishop',
        activeColor: 'green'
    },
    rook: {
        findZone: 250,
        findChance: 1 / buildNum(10, 'B'),
        unlock: 'hordeChessEquipment',
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(64, 'M');
        },
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeCritChance', value: 0.05},
                {isPositive: true, type: 'base', name: 'hordeCritMult', value: lvl * 0.01 + 0.29},
                {isPositive: true, type: 'tag', name: 'hordeStunOnCrit', value: [2]},
            ];
        },
        active() {
            return [
                {type: 'stun', value: 10, canCrit: 0.2}
            ];
        },
        activeType: 'combat',
        cooldown: () => 84,
        icon: 'mdi-chess-rook',
        activeIcon: 'mdi-chess-rook',
        activeColor: 'brown'
    },
    queen: {
        findZone: 300,
        findChance: 1 / buildNum(100, 'B'),
        unlock: 'hordeChessEquipment',
        price(lvl) {
            return Math.pow(10, lvl - 1) * buildNum(256, 'M');
        },
        stats(lvl, stacks) {
            let stats = [
                {isPositive: true, type: 'base', name: 'hordeAttack', value: lvl * 2 + getDiminishing(Math.floor((stacks + 3) / 4)) * 2 + 2},
                {isPositive: true, type: 'base', name: 'hordeHealth', value: lvl * 200 + getDiminishing(Math.floor((stacks + 2) / 4)) * 200 + 200},
            ];
            if (stacks >= 3) {
                stats.push({isPositive: true, type: 'base', name: 'hordeRecovery', value: getDiminishing(Math.floor((stacks + 9) / 12)) * 0.0017});
            }
            if (stacks >= 4) {
                stats.push({isPositive: true, type: 'base', name: 'hordeCritChance', value: getDiminishing(Math.floor((stacks + 8) / 12)) * 0.02});
            }
            if (stacks >= 7) {
                stats.push({isPositive: true, type: 'base', name: 'hordeFirstStrike', value: getDiminishing(Math.floor((stacks + 5) / 12)) * 0.23});
            }
            if (stacks >= 8) {
                stats.push({isPositive: true, type: 'base', name: 'hordeToxic', value: getDiminishing(Math.floor((stacks + 4) / 12)) * 0.00013});
            }
            if (stacks >= 11) {
                stats.push({isPositive: true, type: 'mult', name: 'currencyHordeBoneGain', value: getDiminishing(Math.floor((stacks + 1) / 12)) * 0.014 + 1});
            }
            if (stacks >= 12) {
                stats.push({isPositive: true, type: 'base', name: 'hordeDefense', value: getApproaching(0.001, 0.005, Math.floor((stacks + 48) / 60))});
            }
            if (stacks >= 24) {
                stats.push({isPositive: true, type: 'base', name: 'hordeCritMult', value: getApproaching(0.18, 0.9, Math.floor((stacks + 36) / 60))});
            }
            if (stacks >= 36) {
                stats.push({isPositive: true, type: 'base', name: 'hordeSpellblade', value: getApproaching(0.22, 1.1, Math.floor((stacks + 24) / 60))});
            }
            if (stacks >= 48) {
                stats.push({isPositive: true, type: 'base', name: 'hordeCutting', value: getApproaching(0.0025, 0.0125, Math.floor((stacks + 12) / 60))});
            }
            if (stacks >= 60) {
                stats.push({isPositive: true, type: 'mult', name: 'currencyHordeMonsterPartGain', value: getApproaching(0.06, 0.3, Math.floor(stacks / 60)) + 1});
            }
            return stats;
        },
        active() {
            return [
                {type: 'addStack', value: null}
            ];
        },
        activeType: 'utility',
        cooldown: () => HORDE_STACKING_COOLDOWN,
        icon: 'mdi-chess-queen',
        activeIcon: 'mdi-chess-queen',
        activeColor: 'indigo'
    },
    king: {
        findZone: 350,
        findChance: 1 / buildNum(1, 'T'),
        unlock: 'hordeChessEquipment',
        price(lvl) {
            return Math.pow(1000, getSequence(1, lvl - 1)) * buildNum(1.024, 'B');
        },
        cap: 4,
        stats(lvl) {
            return [
                {isPositive: true, type: 'base', name: 'hordeDivisionShield', value: lvl},
                {isPositive: true, type: 'base', name: 'hordeRevive', value: 1},
                {isPositive: true, type: 'tag', name: 'hordeReviveDivisionShield', value: [0.5]},
            ];
        },
        active(lvl) {
            return [
                {type: 'heal', value: 1},
                {type: 'antidote', value: 1},
                {type: 'revive', value: 1},
                {type: 'stun', value: lvl + 24}
            ];
        },
        activeType: 'combat',
        cooldown: () => 540,
        icon: 'mdi-chess-king',
        activeIcon: 'mdi-chess-king',
        activeColor: 'red'
    },
};
})();
const HO_RELIC = (function() {
  return {
    energyDrink: {icon: 'mdi-bottle-soda', color: 'yellow', effect() {return [
        {name: 'currencyHordeMonsterPartGain', type: 'base', value: 0.5},
        {name: 'horde_monsterSoup', type: 'keepUpgrade', value: true}
    ];}, glyph() {return {dream: 3, clover: 1};}, active: {
        cost: {relic_power: 3},
        feature: 'horde',
        params() {
            let actives = 0;
            for (const [, elem] of Object.entries(HOSTORE.state.horde.items)) {
                if (elem.activeType === 'combat' && elem.cooldownLeft > 0) {
                    actives++;
                }
            }
            for (const [key, elem] of Object.entries(HOSTORE.state.horde.skillActive)) {
                const split = key.split('_');
                let type = null;
                if (split[0] === 'skill') {
                    type = HOSTORE.state.horde.fighterClass[HOSTORE.state.horde.selectedClass].skills[split[1]].activeType;
                } else if (split[0] === 'trinket') {
                    type = HOSTORE.state.horde.trinket[split[1]].activeType;
                }
                if (type === 'combat' && elem > 0) {
                    actives++;
                }
            }
            return [actives];
        },
        description() {
            return [];
        },
        formula(params) {
            return [formatInt(params[0])];
        },
        disabled(params) {
            return HOSTORE.state.cryolab.horde.active || params[0] <= 0;
        },
        trigger() {
            for (const [key, elem] of Object.entries(HOSTORE.state.horde.items)) {
                if (elem.activeType === 'combat' && elem.cooldownLeft > 0) {
                    HOSTORE.commit('horde/updateItemKey', {name: key, key: 'cooldownLeft', value: 0});
                }
            }
            for (const [key, elem] of Object.entries(HOSTORE.state.horde.skillActive)) {
                const split = key.split('_');
                let type = null;
                if (split[0] === 'skill') {
                    type = HOSTORE.state.horde.fighterClass[HOSTORE.state.horde.selectedClass].skills[split[1]].activeType;
                } else if (split[0] === 'trinket') {
                    type = HOSTORE.state.horde.trinket[split[1]].activeType;
                }
                if (type === 'combat' && elem > 0) {
                    HOSTORE.commit('horde/updateSubkey', {name: 'skillActive', key, value: 0});
                }
            }
            HOSTORE.dispatch('horde/resetStats');
        }
    }},
};
})();
const HO_SIGIL = (function() {
function bossTimeMult(bossFight = false) {
    return bossFight ? 5 : 1;
}
  return {
    power: {
        icon: 'mdi-dumbbell',
        color: 'deep-orange',
        stats: lvl => {
            return {
                attack: {type: 'mult', amount: Math.pow(1.4, lvl)},
            };
        }
    },
    health: {
        icon: 'mdi-heart',
        color: 'red',
        stats: lvl => {
            return {
                health: {type: 'mult', amount: Math.pow(1.5, lvl)},
            };
        }
    },
    bashing: {
        minZone: 22,
        icon: 'mdi-hammer',
        color: 'pale-red',
        active: {
            effect(lvl) {
                return [
                    {type: 'stun', value: lvl + 3}
                ];
            },
            cooldown: () => 5,
            startCooldown: () => 0,
            uses: (lvl, boss) => lvl * bossTimeMult(boss)
        }
    },
    recovery: {
        minZone: 24,
        icon: 'mdi-medical-bag',
        color: 'green',
        stats: lvl => {
            return {
                health: {type: 'mult', amount: Math.pow(1.12, lvl)},
            };
        },
        active: {
            effect(lvl, boss) {
                return [
                    {type: 'heal', value: (lvl * 0.05 + 0.3) / bossTimeMult(boss)}
                ];
            },
            cooldown: () => 20,
            startCooldown: () => 10,
            uses: (lvl, boss) => lvl * bossTimeMult(boss)
        }
    },
    toughness: {
        minZone: 26,
        icon: 'mdi-shield-sword',
        color: 'cherry',
        stats: lvl => {
            return {
                physicTaken: {type: 'mult', amount: Math.pow(0.4, lvl)},
            };
        },
        exclude: ['wisdom']
    },
    strength: {
        minZone: 28,
        icon: 'mdi-arm-flex',
        color: 'red',
        stats: lvl => {
            return {
                physicAttack: {type: 'mult', amount: Math.pow(1.2, lvl)},
            };
        },
        active: {
            effect(lvl) {
                return [
                    {type: 'damagePhysic', value: lvl * 1.5 + 1.25}
                ];
            },
            cooldown: () => 8,
            startCooldown: () => 4,
            uses: () => null
        }
    },
    magic: {
        minZone: 30,
        icon: 'mdi-magic-staff',
        color: 'deep-purple',
        stats: (lvl, boss) => {
            return {
                firstStrike: {type: 'base', amount: 2.25 * lvl * bossTimeMult(boss)},
                magicConversion: {type: 'base', amount: 1.5 * lvl},
            };
        }
    },
    magicBolt: {
        minZone: 32,
        icon: 'mdi-motion',
        color: 'indigo',
        stats: lvl => {
            return {
                magicAttack: {type: 'mult', amount: Math.pow(1.2, lvl)},
                magicConversion: {type: 'base', amount: 0.4 * lvl},
            };
        },
        active: {
            effect(lvl) {
                return [
                    {type: 'damageMagic', value: lvl * 1.5 + 4}
                ];
            },
            cooldown: () => 13,
            startCooldown: () => 3,
            uses: (lvl, boss) => lvl * bossTimeMult(boss)
        }
    },
    fireball: {
        minZone: 34,
        icon: 'mdi-fire-circle',
        color: 'orange',
        stats: lvl => {
            return {
                magicAttack: {type: 'mult', amount: Math.pow(1.2, lvl)},
                magicConversion: {type: 'base', amount: 0.4 * lvl},
            };
        },
        active: {
            effect(lvl) {
                return [
                    {type: 'damageMagic', value: lvl * 1.75 + 3.5},
                    {type: 'stun', value: 2}
                ];
            },
            cooldown: () => 16,
            startCooldown: () => 5,
            uses: (lvl, boss) => lvl * bossTimeMult(boss)
        }
    },
    incorporeal: {
        minZone: 36,
        icon: 'mdi-ghost',
        color: 'pink',
        stats: lvl => {
            return {
                loot: {type: 'mult', amount: Math.pow(0.25, lvl)},
            };
        }
    },
    focus: {
        minZone: 38,
        icon: 'mdi-image-filter-center-focus',
        color: 'red-pink',
        stats: lvl => {
            return {
                physicAttack: {type: 'mult', amount: Math.pow(1.2, lvl)},
            };
        },
        active: {
            effect(lvl) {
                return [
                    {type: 'damagePhysic', value: getSequence(3, lvl) * 10}
                ];
            },
            cooldown: (lvl, boss) => 28 * bossTimeMult(boss),
            startCooldown: (lvl, boss) => 28 * bossTimeMult(boss),
            uses: () => 1
        }
    },
    wisdom: {
        minZone: 40,
        icon: 'mdi-shield-star',
        color: 'dark-blue',
        stats: lvl => {
            return {
                magicTaken: {type: 'mult', amount: Math.pow(0.4, lvl)},
            };
        },
        exclude: ['resilience']
    },
    sparks: {
        minZone: 42,
        icon: 'mdi-flash',
        color: 'yellow',
        stats: lvl => {
            return {
                magicConversion: {type: 'base', amount: 0.3 * lvl},
            };
        },
        active: {
            effect(lvl) {
                return [
                    {type: 'damageMagic', value: lvl * 0.9 + 1.7}
                ];
            },
            cooldown: () => 5,
            startCooldown: () => 2,
            uses: (lvl, boss) => lvl * 3 * bossTimeMult(boss)
        }
    },
    protection: {
        minZone: 44,
        icon: 'mdi-shield',
        color: 'blue',
        stats: (lvl, boss) => {
            return {
                divisionShield: {type: 'base', amount: 5 * lvl * bossTimeMult(boss)},
            };
        }
    },
    shielding: {
        minZone: 46,
        icon: 'mdi-circle-slice-8',
        color: 'teal',
        stats: (lvl, boss) => {
            return {
                divisionShield: {type: 'base', amount: 3 * lvl * bossTimeMult(boss)},
            };
        },
        active: {
            effect(lvl) {
                return [
                    {type: 'divisionShield', value: lvl + 2}
                ];
            },
            cooldown: () => 11,
            startCooldown: () => 9,
            uses: (lvl, boss) => (lvl + 1) * bossTimeMult(boss)
        }
    },
    resistance: {
        minZone: 48,
        icon: 'mdi-circle-half-full',
        color: 'brown',
        stats: lvl => {
            return {
                statusResist: {type: 'base', amount: lvl},
            };
        },
        active: {
            effect() {
                return [
                    {type: 'removeStun', value: null}
                ];
            },
            cooldown: () => 7,
            startCooldown: () => 2,
            uses: (lvl, boss) => lvl * bossTimeMult(boss)
        }
    },
    precision: {
        minZone: 50,
        icon: 'mdi-bullseye-arrow',
        color: 'orange',
        stats: lvl => {
            return {
                critChance: {type: 'base', amount: 0.4 * lvl},
                critMult: {type: 'base', amount: 0.35 * lvl},
            };
        }
    },
    screaming: {
        minZone: 52,
        icon: 'mdi-bullhorn',
        color: 'cyan',
        active: {
            effect() {
                return [
                    {type: 'silence', value: 6}
                ];
            },
            cooldown: () => 10,
            startCooldown: () => 0,
            uses: (lvl, boss) => lvl * bossTimeMult(boss)
        }
    },
    cure: {
        minZone: 54,
        icon: 'mdi-tea',
        color: 'lime',
        stats: lvl => {
            return {
                bioTaken: {type: 'mult', amount: Math.pow(0.75, lvl)},
            };
        },
        active: {
            effect(lvl, boss) {
                return [
                    {type: 'heal', value: (lvl * 0.025 + 0.075) / bossTimeMult(boss)},
                    {type: 'antidote', value: 1}
                ];
            },
            cooldown: () => 16,
            startCooldown: () => 12,
            uses: (lvl, boss) => lvl * bossTimeMult(boss)
        }
    },
    sharp: {
        minZone: 56,
        icon: 'mdi-nail',
        color: 'purple',
        stats: lvl => {
            return {
                cutting: {type: 'base', amount: 0.002 * lvl},
                bioConversion: {type: 'base', amount: 1.5 * lvl},
            };
        },
        exclude: ['executing']
    },
    spitting: {
        minZone: 56,
        icon: 'mdi-water-opacity',
        color: 'light-green',
        stats: lvl => {
            return {
                bioAttack: {type: 'mult', amount: Math.pow(1.2, lvl)},
                bioConversion: {type: 'base', amount: 0.4 * lvl},
            };
        },
        active: {
            effect(lvl) {
                return [
                    {type: 'damageBio', value: lvl * 1.4 + 2}
                ];
            },
            cooldown: () => 15,
            startCooldown: () => 11,
            uses: () => null
        }
    },
    burst: {
        minZone: 58,
        icon: 'mdi-liquid-spot',
        color: 'pale-green',
        stats: lvl => {
            return {
                bioConversion: {type: 'base', amount: 0.3 * lvl},
            };
        },
        active: {
            effect(lvl) {
                return [
                    {type: 'damageBio', value: getSequence(2, lvl) * 1.5 + 4.5},
                    {type: 'poison', value: lvl * 0.15 + 0.25}
                ];
            },
            cooldown: () => 26,
            startCooldown: () => 18,
            uses: () => 2
        }
    },
    resilience: {
        minZone: 60,
        icon: 'mdi-shield-bug',
        color: 'green',
        stats: lvl => {
            return {
                bioTaken: {type: 'mult', amount: Math.pow(0.4, lvl)},
            };
        },
        exclude: ['toughness']
    },
    growing: {
        minZone: 62,
        icon: 'mdi-resize',
        color: 'beige',
        stats: lvl => {
            return {
                health: {type: 'mult', amount: Math.pow(1.3, lvl)},
            };
        },
        active: {
            effect(lvl) {
                return [
                    {type: 'gainStat', stat: 'attack_mult', value: lvl * 0.05 + 1.2}
                ];
            },
            cooldown: () => 15,
            startCooldown: () => 15,
            uses: lvl => lvl + 2
        }
    },
    cold: {
        minZone: 64,
        icon: 'mdi-snowflake',
        color: 'dark-blue',
        stats: lvl => {
            return {
                health: {type: 'mult', amount: Math.pow(1.2, lvl)},
                magicConversion: {type: 'base', amount: 0.25 * lvl},
            };
        },
        active: {
            effect(lvl) {
                return [
                    {type: 'damageMagic', value: lvl * 2.5 + 2.75},
                    {type: 'stun', value: lvl * 2 + 6}
                ];
            },
            cooldown: () => 22,
            startCooldown: () => 14,
            uses: (lvl, boss) => lvl * bossTimeMult(boss)
        }
    },
    angelic: {
        minZone: 66,
        icon: 'mdi-cross',
        color: 'yellow',
        stats: lvl => {
            return {
                physicTaken: {type: 'mult', amount: Math.pow(1 / 1.4, lvl)},
                magicTaken: {type: 'mult', amount: Math.pow(1 / 1.4, lvl)},
                bioTaken: {type: 'mult', amount: Math.pow(1 / 1.4, lvl)},
            };
        }
    },
    fury: {
        minZone: 68,
        icon: 'mdi-emoticon-angry',
        color: 'amber',
        stats: lvl => {
            return {
                critChance: {type: 'base', amount: 0.55 * lvl},
            };
        },
        active: {
            effect(lvl) {
                return [
                    {type: 'damagePhysic', value: lvl * 0.6 + 1.55},
                    {type: 'gainStat', stat: 'attack_mult', value: 1.03}
                ];
            },
            cooldown: () => 4,
            startCooldown: () => 2,
            uses: lvl => lvl * 4 + 2
        }
    },
    toxic: {
        minZone: 70,
        icon: 'mdi-bottle-tonic-skull',
        color: 'light-green',
        stats: lvl => {
            return {
                toxic: {type: 'base', amount: 0.01 * lvl},
                bioConversion: {type: 'base', amount: 1.5 * lvl},
            };
        }
    },
    foulBreath: {
        minZone: 80,
        icon: 'mdi-cloud-alert',
        color: 'green',
        stats: lvl => {
            return {
                bioAttack: {type: 'mult', amount: Math.pow(1.2, lvl)},
                bioConversion: {type: 'base', amount: 0.4 * lvl},
            };
        },
        active: {
            effect(lvl) {
                return [
                    {type: 'poison', value: lvl * 0.02 + 0.02}
                ];
            },
            cooldown: () => 11,
            startCooldown: () => 3,
            uses: lvl => lvl + 1
        }
    },
    nuke: {
        minZone: 90,
        icon: 'mdi-nuke',
        color: 'orange-red',
        cap: 5,
        active: {
            effect(lvl) {
                return [
                    {type: 'damagePhysic', value: Math.pow(2, lvl) * 250},
                    {type: 'damageMagic', value: Math.pow(2, lvl) * 250},
                    {type: 'damageBio', value: Math.pow(2, lvl) * 250},
                ];
            },
            cooldown: (lvl, boss) => (75 - lvl * 5) * bossTimeMult(boss),
            startCooldown: (lvl, boss) => (75 - lvl * 5) * bossTimeMult(boss),
            uses: () => 1
        }
    },
    rainbow: {
        minZone: 100,
        icon: 'mdi-looks',
        color: 'pink',
        cap: 1,
        stats: lvl => {
            return {
                magicConversion: {type: 'base', amount: lvl},
                bioConversion: {type: 'base', amount: lvl},
            };
        }
    },
    drain: {
        minZone: 110,
        icon: 'mdi-hvac',
        color: 'lime',
        stats: (lvl, boss) => {
            return {
                health: {type: 'mult', amount: Math.pow(1.1, lvl)},
                divisionShield: {type: 'base', amount: 2 * lvl * bossTimeMult(boss)},
            };
        },
        active: {
            effect(lvl, boss) {
                return [
                    {type: 'damageMagic', value: lvl * 0.2 + 0.85},
                    {type: 'damageBio', value: lvl * 0.2 + 0.85},
                    {type: 'heal', value: (lvl * 0.01 + 0.05) / bossTimeMult(boss)},
                ];
            },
            cooldown: () => 14,
            startCooldown: () => 10,
            uses: (lvl, boss) => (lvl + 2) * bossTimeMult(boss)
        }
    },
    shocking: {
        minZone: 120,
        icon: 'mdi-heart-flash',
        color: 'yellow',
        stats: lvl => {
            return {
                attack: {type: 'mult', amount: Math.pow(1.15, lvl)},
            };
        },
        active: {
            effect(lvl) {
                return [
                    {type: 'damageMagic', value: lvl * 1.3 + 2},
                    {type: 'silence', value: lvl + 2}
                ];
            },
            cooldown: () => 15,
            startCooldown: () => 9,
            uses: (lvl, boss) => lvl * bossTimeMult(boss)
        }
    },
    defense: {
        minZone: 225,
        icon: 'mdi-shield',
        color: 'dark-blue',
        stats: (lvl, boss) => {
            return {
                health: {type: 'mult', amount: Math.pow(1.15, lvl)},
                defense: {type: 'base', amount: lvl * (boss ? 0.1 : 1) * 0.001},
            };
        }
    },
    executing: {
        minZone: 275,
        icon: 'mdi-skull',
        color: 'pale-red',
        stats: lvl => {
            return {
                attack: {type: 'mult', amount: Math.pow(1.15, lvl)},
                execute: {type: 'base', amount: lvl * 0.05},
            };
        },
        exclude: ['sharp']
    },

    // Raid-only sigils
    raidRage: {
        minZone: Infinity,
        icon: 'mdi-emoticon-angry',
        color: 'deep-orange',
        stats: lvl => {
            return {
                cutting: {type: 'base', amount: lvl * 0.001 + 0.009},
            };
        },
        active: {
            effect(lvl) {
                return [
                    {type: 'gainStat', stat: 'attack_mult', value: lvl * 0.01 + 1.29},
                    {type: 'gainStat', stat: 'cutting_base', value: lvl * 0.001},
                ];
            },
            cooldown: () => 30,
            startCooldown: () => 30,
            uses: () => null
        }
    },
    monstrousToughness: {
        minZone: Infinity,
        icon: 'mdi-shield',
        color: 'pale-blue',
        stats: lvl => {
            return {
                health: {type: 'mult', amount: Math.pow(1.03, lvl) * 50},
                divisionShield: {type: 'base', amount: lvl + 19},
                bioTaken: {type: 'mult', amount: 0.02},
                statusResist: {type: 'base', amount: 4},
            };
        }
    },

    // Tower-only sigils
    berserk: {
        minZone: Infinity,
        icon: 'mdi-robot-angry',
        color: 'deep-orange',
        stats: lvl => {
            return {
                attack: {type: 'mult', amount: Math.pow(2, lvl)},
                health: {type: 'mult', amount: Math.pow(0.75, lvl)},
            };
        },
        active: {
            effect(lvl) {
                return [
                    {type: 'damagePhysic', value: lvl * 0.1 + 0.55},
                    {type: 'damageMagic', value: lvl * 0.3 + 1.15},
                ];
            },
            cooldown: () => 7,
            startCooldown: () => 5,
            uses: () => null
        }
    },
    iceGiant: {
        minZone: Infinity,
        icon: 'mdi-human',
        color: 'skyblue',
        stats: lvl => {
            return {
                attack: {type: 'mult', amount: Math.pow(0.5, lvl)},
                health: {type: 'mult', amount: Math.pow(3.5, lvl)},
            };
        },
        active: {
            effect(lvl) {
                return [
                    {type: 'stun', value: lvl * 3 + 7}
                ];
            },
            cooldown: () => 25,
            startCooldown: () => 15,
            uses: () => null
        }
    },

    // Fallback sigil
    generic: {
        minZone: Infinity,
        icon: 'mdi-heart-flash',
        color: 'grey',
        stats: lvl => {
            return {
                attack: {type: 'mult', amount: Math.pow(1.2, lvl)},
                health: {type: 'mult', amount: Math.pow(1.2, lvl)},
            };
        }
    }
};
})();
const HO_SIGILBOSS = (function() {
  return {
    // Regular enemy actives
    pistol_gun: {
        minZone: Infinity,
        icon: 'mdi-pistol',
        color: 'blue',
        active: {
            effect() {
                return [
                    {type: 'damagePhysic', value: 3.35}
                ];
            },
            cooldown: () => 4,
            startCooldown: () => 4,
            uses: lvl => lvl * 4
        }
    },
    rifle_gun: {
        minZone: Infinity,
        icon: 'mdi-pistol',
        color: 'orange',
        active: {
            effect() {
                return [
                    {type: 'damagePhysic', value: 2},
                    {type: 'damageMagic', value: 0.75}
                ];
            },
            cooldown: () => 2,
            startCooldown: () => 2,
            uses: lvl => lvl * 6
        }
    },
    shotgun_gun: {
        minZone: Infinity,
        icon: 'mdi-pistol',
        color: 'green',
        active: {
            effect() {
                return [
                    {type: 'damagePhysic', value: 2.6},
                    {type: 'damageMagic', value: 2.6},
                    {type: 'damageBio', value: 2.6}
                ];
            },
            cooldown: () => 13,
            startCooldown: () => 13,
            uses: lvl => lvl * 2
        }
    },
    sniper_gun: {
        minZone: Infinity,
        icon: 'mdi-target',
        color: 'purple',
        active: {
            effect() {
                return [
                    {type: 'damagePhysic', value: 11.5, canCrit: 8}
                ];
            },
            cooldown: () => 25,
            startCooldown: () => 25,
            uses: lvl => lvl * 1
        }
    },
    war_grenade: {
        minZone: Infinity,
        icon: 'mdi-bomb',
        color: 'pale-green',
        active: {
            effect() {
                return [
                    {type: 'damageMagic', value: 2.75},
                    {type: 'stun', value: 2},
                    {type: 'silence', value: 8}
                ];
            },
            cooldown: () => 12,
            startCooldown: () => 6,
            uses: lvl => lvl
        }
    },
    war_bandage: {
        minZone: Infinity,
        icon: 'mdi-bandage',
        color: 'pale-orange',
        active: {
            effect() {
                return [
                    {type: 'heal', value: 0.4}
                ];
            },
            cooldown: () => 8,
            startCooldown: () => 4,
            uses: lvl => lvl
        }
    },
    monkey_dart: {
        minZone: Infinity,
        icon: 'mdi-arrow-projectile',
        color: 'orange',
        active: {
            effect(lvl) {
                return [
                    {type: 'damagePhysic', value: lvl * 0.5 + 2.25},
                ];
            },
            cooldown: () => 5,
            startCooldown: () => 3,
            uses: () => null
        }
    },
    monkey_fire: {
        minZone: Infinity,
        icon: 'mdi-fire',
        color: 'orange',
        active: {
            effect() {
                return [
                    {type: 'damageMagic', value: 4.5},
                ];
            },
            cooldown: () => 8,
            startCooldown: () => 4,
            uses: lvl => lvl * 4
        }
    },
    monkey_ice: {
        minZone: Infinity,
        icon: 'mdi-snowflake',
        color: 'cyan',
        active: {
            effect() {
                return [
                    {type: 'damageMagic', value: 6.75},
                    {type: 'stun', value: 3},
                ];
            },
            cooldown: () => 14,
            startCooldown: () => 7,
            uses: lvl => lvl * 2
        }
    },
    monkey_lightning: {
        minZone: Infinity,
        icon: 'mdi-flash',
        color: 'yellow',
        active: {
            effect() {
                return [
                    {type: 'damageMagic', value: 5.1},
                    {type: 'silence', value: 3},
                ];
            },
            cooldown: () => 10,
            startCooldown: () => 5,
            uses: lvl => lvl * 3
        }
    },
    cute_ram: {
        minZone: Infinity,
        icon: 'mdi-arrow-collapse-right',
        color: 'red',
        active: {
            effect(lvl) {
                return [
                    {type: 'damageBio', value: lvl + 3.5},
                    {type: 'stun', value: 3},
                    {type: 'gainStat', stat: 'bioAttack_mult', value: 1.2},
                ];
            },
            cooldown: () => 12,
            startCooldown: () => 8,
            uses: lvl => lvl * 3
        }
    },
    cute_eatCarrot: {
        minZone: Infinity,
        icon: 'mdi-carrot',
        color: 'orange',
        active: {
            effect(lvl) {
                return [
                    {type: 'heal', value: lvl * 0.05 + 0.4},
                    {type: 'gainStat', stat: 'attack_mult', value: 1.1},
                ];
            },
            cooldown: () => 16,
            startCooldown: () => 12,
            uses: lvl => lvl * 2
        }
    },
    cute_bark: {
        minZone: Infinity,
        icon: 'mdi-volume-high',
        color: 'cyan',
        active: {
            effect() {
                return [
                    {type: 'maxdamageBio', value: 0.06},
                    {type: 'removeDivisionShield', value: 1},
                ];
            },
            cooldown: () => 11,
            startCooldown: () => 6,
            uses: lvl => lvl
        }
    },
    cute_bite: {
        minZone: Infinity,
        icon: 'mdi-tooth',
        color: 'brown',
        active: {
            effect(lvl) {
                return [
                    {type: 'damageBio', value: lvl * 1.5 + 5},
                ];
            },
            cooldown: () => 22,
            startCooldown: () => 8,
            uses: () => null
        }
    },
    cute_kick: {
        minZone: Infinity,
        icon: 'mdi-seat-legroom-extra',
        color: 'amber',
        active: {
            effect(lvl) {
                return [
                    {type: 'damageBio', value: lvl * 0.3 + 2.5},
                    {type: 'silence', value: 2},
                ];
            },
            cooldown: () => 6,
            startCooldown: () => 0,
            uses: lvl => lvl * 8
        }
    },
    cute_claws: {
        minZone: Infinity,
        icon: 'mdi-nail',
        color: 'light-green',
        active: {
            effect(lvl) {
                return [
                    {type: 'maxdamageBio', value: 0.1},
                    {type: 'damageBio', value: lvl * 1.3 + 4.5},
                ];
            },
            cooldown: () => 15,
            startCooldown: () => 10,
            uses: lvl => lvl * 3
        }
    },

    // Boss actives
    ohilio_megagun: {
        minZone: Infinity,
        icon: 'mdi-pistol',
        color: 'orange-red',
        active: {
            effect() {
                return [
                    {type: 'damagePhysic', value: buildNum(1, 'M')},
                    {type: 'damageMagic', value: buildNum(1, 'M')},
                    {type: 'damageBio', value: buildNum(1, 'M')}
                ];
            },
            cooldown: () => 5,
            startCooldown: () => 5,
            uses: () => null
        }
    },
    chriz_magicMissile: {
        minZone: Infinity,
        icon: 'mdi-motion',
        color: 'indigo',
        active: {
            effect() {
                return [
                    {type: 'damageMagic', value: 3},
                ];
            },
            cooldown: () => 6,
            startCooldown: () => 0,
            uses: () => 25
        }
    },
    chriz_fireball: {
        minZone: Infinity,
        icon: 'mdi-fire',
        color: 'orange',
        active: {
            effect() {
                return [
                    {type: 'damageMagic', value: 11.5},
                ];
            },
            cooldown: () => 22,
            startCooldown: () => 4,
            uses: () => null
        }
    },
    chriz_iceBlast: {
        minZone: Infinity,
        icon: 'mdi-snowflake',
        color: 'cyan',
        active: {
            effect() {
                return [
                    {type: 'damageMagic', value: 6},
                    {type: 'stun', value: 8},
                ];
            },
            cooldown: () => 30,
            startCooldown: () => 10,
            uses: () => null
        }
    },
    chriz_lightningStrike: {
        minZone: Infinity,
        icon: 'mdi-flash',
        color: 'yellow',
        active: {
            effect() {
                return [
                    {type: 'damageMagic', value: 7.25},
                    {type: 'silence', value: 5},
                ];
            },
            cooldown: () => 15,
            startCooldown: () => 15,
            uses: () => null
        }
    },
    chriz_heal: {
        minZone: Infinity,
        icon: 'mdi-medical-bag',
        color: 'light-green',
        active: {
            effect() {
                return [
                    {type: 'heal', value: 0.4},
                ];
            },
            cooldown: () => 45,
            startCooldown: () => 45,
            uses: () => 3
        }
    },
    mina_charm: {
        minZone: Infinity,
        icon: 'mdi-heart',
        color: 'pink',
        active: {
            effect() {
                return [
                    {type: 'silence', value: 5},
                    {type: 'gainStat', stat: 'bioAttack_mult', value: 1.6},
                    {type: 'gainStat', stat: 'execute_base', value: 0.05},
                ];
            },
            cooldown: () => 30,
            startCooldown: () => 15,
            uses: () => null
        }
    },
};
})();
const HO_UPGRADE = (function() {
const requirementStat = 'horde_maxZone';
const requirementBase = () => store.state.stat[requirementStat].total;
  return {
    attack: {price(lvl) {
        return {horde_bone: Math.pow(lvl * 0.002 + 1.25, lvl) * 175};
    }, effect: [
        {name: 'hordeAttack', type: 'base', value: lvl => lvl},
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.1, lvl)}
    ]},
    health: {price(lvl) {
        return {horde_bone: Math.pow(lvl * 0.002 + 1.25, lvl) * 210};
    }, effect: [
        {name: 'hordeHealth', type: 'base', value: lvl => lvl * 150},
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.12, lvl)}
    ]},
    training: {cap: 100, requirementBase, requirementStat, requirementValue: 3, price(lvl) {
        return {horde_bone: Math.pow(1.35, lvl) * 2500};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.1, lvl)}
    ]},
    resilience: {cap: 1, requirementBase, requirementStat, requirementValue: 5, price() {
        return {horde_bone: buildNum(24, 'K')};
    }, effect: [
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.5, lvl)},
        {name: 'hordeRevive', type: 'base', value: lvl => lvl}
    ]},
    bones: {requirementBase, requirementStat, requirementValue: 6, price(lvl) {
        return {horde_bone: Math.pow(lvl * 0.01 + 1.35, lvl) * buildNum(52, 'K')};
    }, effect: [
        {name: 'currencyHordeBoneGain', type: 'mult', value: lvl => Math.pow(1.22, lvl)}
    ]},
    boneBag: {cap: 4, requirementBase, requirementStat, requirementValue: 7, price(lvl) {
        return {horde_bone: Math.pow(10, lvl) * buildNum(480, 'K')};
    }, effect: [
        {name: 'currencyHordeBoneCap', type: 'mult', value: lvl => Math.pow(10, lvl)},
        {name: 'hordeMaxEquipment', type: 'base', value: lvl => Math.min(1, lvl)}
    ]},
    anger: {cap: 10, requirementBase, requirementStat, requirementValue: 9, price(lvl) {
        return {horde_bone: Math.pow(1.65, lvl) * buildNum(145, 'K')};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.2, lvl)}
    ]},
    rest: {cap: 2, requirementBase, requirementStat, requirementValue: 11, price(lvl) {
        return {horde_bone: Math.pow(75, lvl) * buildNum(2.6, 'M')};
    }, effect: [
        {name: 'hordeHealth', type: 'mult', value: lvl => lvl * 0.75 + 1},
        {name: 'hordeRecovery', type: 'base', value: lvl => lvl * 0.01}
    ]},
    monsterSoup: {cap: 10, requirementBase, requirementStat, requirementValue: 13, price(lvl) {
        return {horde_monsterPart: Math.pow(1.1, lvl) * (lvl + 10) * 3};
    }, effect: [
        {name: 'currencyHordeBoneGain', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
        {name: 'currencyHordeMonsterPartCap', type: 'base', value: lvl => lvl * 5}
    ]},
    monsterBag: {cap: 75, requirementBase, requirementStat, requirementValue: 17, price(lvl) {
        return {horde_monsterPart: Math.pow(lvl * 0.005 + 1.35, lvl) * 80};
    }, effect: [
        {name: 'currencyHordeBoneCap', type: 'mult', value: lvl => Math.pow(1.6, lvl)},
        {name: 'currencyHordeMonsterPartCap', type: 'mult', value: lvl => Math.pow(1.3, lvl)},
        {name: 'hordeMaxEquipment', type: 'base', value: lvl => Math.min(1, lvl)}
    ]},
    luckyStrike: {cap: 15, requirementBase, requirementStat, requirementValue: 21, price(lvl) {
        return {horde_bone: Math.pow(1.85, lvl) * buildNum(30, 'B')};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.19, lvl)},
        {name: 'hordeEquipmentChance', type: 'mult', value: lvl => lvl * 0.2 + 1}
    ]},
    hoarding: {cap: 20, requirementBase, requirementStat, requirementValue: 25, price(lvl) {
        return {horde_bone: Math.pow(2.1, lvl) * buildNum(1.1, 'T')};
    }, effect: [
        {name: 'currencyHordeBoneCap', type: 'mult', value: lvl => Math.pow(1.4, lvl)},
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.12, lvl)}
    ]},
    thickSkin: {cap: 30, requirementBase, requirementStat, requirementValue: 30, price(lvl) {
        return {horde_bone: Math.pow(1.85, lvl) * buildNum(52.5, 'T')};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.12, lvl)},
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.22, lvl)},
        {name: 'hordeMaxEquipment', type: 'base', value: lvl => Math.min(1, lvl)}
    ]},
    purifier: {persistent: true, hasDescription: true, cap: 1, note: 'horde_18', requirementBase, requirementStat, requirementValue: 42, price() {
        return {horde_bone: buildNum(10, 'Qi')};
    }, effect: [
        {name: 'hordeCorruptedFlesh', type: 'unlock', value: lvl => lvl >= 1}
    ]},
    cleansingRitual: {requirement() {
        return HOSTORE.state.unlock.hordeCorruptedFlesh.use;
    }, price(lvl) {
        return {horde_corruptedFlesh: Math.pow(1.12, lvl) * 2000};
    }, effect: [
        {name: 'hordeCorruption', type: 'bonus', value: lvl => -0.08 * lvl}
    ]},
    stabbingGuide: {cap: 5, requirementBase, requirementStat, requirementValue: 48, price(lvl) {
        return {horde_bone: Math.pow(7, lvl) * buildNum(130, 'Qi')};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.48, lvl)}
    ]},
    plunderSecret: {cap: 1, requirementBase, requirementStat, requirementValue: 53, price() {
        return {horde_bone: buildNum(25, 'Sx')};
    }, effect: [
        {name: 'currencyHordeMonsterPartGain', type: 'mult', value: lvl => lvl >= 1 ? 1.5 : null},
        {name: 'currencyHordeBoneCap', type: 'mult', value: lvl => lvl >= 1 ? 100 : null},
        {name: 'hordeMaxEquipment', type: 'base', value: lvl => Math.min(1, lvl)}
    ]},
    dodgingGuide: {cap: 15, requirementBase, requirementStat, requirementValue: 59, price(lvl) {
        return {horde_bone: Math.pow(2.1, lvl) * buildNum(980, 'Sx')};
    }, effect: [
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.2, lvl)}
    ]},
    survivalGuide: {cap: 25, requirementBase, requirementStat, requirementValue: 66, price(lvl) {
        return {horde_bone: Math.pow(2.25, lvl) * buildNum(1.25, 'O')};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.2, lvl)},
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.15, lvl)}
    ]},
    looting: {cap: 25, requirementBase, requirementStat, requirementValue: 69, price(lvl) {
        return {horde_bone: Math.pow(3.3, lvl) * buildNum(22, 'O')};
    }, effect: [
        {name: 'currencyHordeBoneCap', type: 'mult', value: lvl => Math.pow(2, lvl)},
        {name: 'currencyHordeMonsterPartCap', type: 'mult', value: lvl => Math.pow(1.05, lvl)}
    ]},
    whitePaint: {cap: 25, requirementBase, requirementStat, requirementValue: 80, price(lvl) {
        return {horde_bone: Math.pow(2.8, lvl) * buildNum(1.11, 'UD')};
    }, effect: [
        {name: 'currencyHordeBoneGain', type: 'mult', value: lvl => Math.pow(1.15, lvl)},
        {name: 'currencyHordeBoneCap', type: 'mult', value: lvl => Math.pow(1.25, lvl)}
    ]},
    targetDummy: {cap: 100, capMult: true, requirementBase, requirementStat, requirementValue: 92, price(lvl) {
        return {horde_bone: Math.pow(lvl * 0.005 + 1.7 + (lvl >= 100 ? 0.5 : 0), lvl) * buildNum(250, 'TD')};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.16, lvl)},
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.16, lvl)}
    ]},
    grossBag: {cap: 1, requirementBase, requirementStat, requirementValue: 98, price() {
        return {horde_bone: buildNum(155, 'QaD')};
    }, effect: [
        {name: 'currencyHordeBoneCap', type: 'mult', value: lvl => Math.pow(100, lvl)},
        {name: 'currencyHordeMonsterPartGain', type: 'mult', value: lvl => Math.pow(3, lvl)},
        {name: 'hordeMaxEquipment', type: 'base', value: lvl => Math.min(1, lvl)}
    ]},
    milestone: {requirementBase, requirementStat, requirementValue: 110, price(lvl) {
        return {horde_bone: Math.pow(buildNum(1, 'M'), lvl) * buildNum(1, 'SxD')};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(2, lvl)},
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(2, lvl)},
        {name: 'currencyHordeBoneCap', type: 'mult', value: lvl => Math.pow(1000, lvl)}
    ]},
    combatLesson: {cap: 15, requirementBase, requirementStat, requirementValue: 120, price(lvl) {
        return {horde_bone: Math.pow(lvl * 0.4 + 3.4, lvl) * buildNum(650, 'SpD')};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.3, lvl)},
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.25, lvl)}
    ]},
    carving: {cap: 5, requirementBase, requirementStat, requirementValue: 125, price(lvl) {
        return {horde_bone: Math.pow(12, lvl) * buildNum(2, 'ND')};
    }, effect: [
        {name: 'currencyHordeBoneCap', type: 'mult', value: lvl => Math.pow(8, lvl)},
        {name: 'currencyHordeCorruptedFleshGain', type: 'mult', value: lvl => lvl * 0.2 + 1}
    ]},
    mysticalBag: {cap: 1, requirementBase, requirementStat, requirementValue: 135, price(lvl) {
        return {horde_mysticalShard: 25 * (lvl + 1)};
    }, effect: [
        {name: 'hordeMaxEquipment', type: 'base', value: lvl => lvl}
    ], onBuy() {
        HOSTORE.dispatch('horde/checkPlayerHealth');
    }},
    unlimitedAnger: {cap: 20, requirementBase, requirementStat, requirementValue: 145, price(lvl) {
        return {horde_bone: Math.pow(lvl * 0.1 + 4.7, lvl) * buildNum(4, 'QaV')};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.2, lvl)}
    ]},
    strangePower: {cap: 25, requirementBase, requirementStat, requirementValue: 155, price(lvl) {
        return {horde_mysticalShard: lvl * 4 + 28};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.25, lvl)},
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.25, lvl)}
    ], onBuy() {
        HOSTORE.dispatch('horde/checkPlayerHealth');
    }},
    collector: {cap: 25, requirementBase, requirementStat, requirementValue: 165, price(lvl) {
        return {horde_mysticalShard: lvl * 8 + 34};
    }, effect: [
        {name: 'currencyHordeBoneGain', type: 'mult', value: lvl => Math.pow(1.35, lvl)},
        {name: 'currencyHordeBoneCap', type: 'mult', value: lvl => Math.pow(1.5, lvl)}
    ], onBuy() {
        HOSTORE.dispatch('horde/checkPlayerHealth');
    }},
    prepareTheSacrifice: {persistent: true, alwaysActive: true, cap: 4, requirementBase, requirementStat, requirementValue: 175, price(lvl) {
        return {horde_mysticalShard: lvl * 40 + 20};
    }, effect: [
        {name: 'horde_mysticalBag', type: 'keepUpgrade', value: lvl => lvl >= 1},
        {name: 'horde_strangePower', type: 'keepUpgrade', value: lvl => lvl >= 2},
        {name: 'horde_collector', type: 'keepUpgrade', value: lvl => lvl >= 3},
        {name: 'hordeSacrifice', type: 'unlock', value: lvl => lvl >= 4},
    ], onBuy() {
        HOSTORE.dispatch('horde/checkPlayerHealth');
    }},
    mysticalPower: {cap: 20, requirementBase, requirementStat, requirementValue: 185, price(lvl) {
        return {horde_bone: Math.pow(lvl * 0.35 + 3, lvl) * 3.5e75};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.2, lvl)},
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.2, lvl)},
        {name: 'currencyHordeMysticalShardCap', type: 'base', value: lvl => lvl},
    ]},
    redPaint: {cap: 15, requirementBase, requirementStat, requirementValue: 195, price(lvl) {
        return {horde_monsterPart: Math.pow(lvl * 0.1 + 2.5, lvl) * 5e15};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.225, lvl)},
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.3, lvl)},
        {name: 'currencyHordeBoneGain', type: 'mult', value: lvl => Math.pow(1.5, lvl)}
    ]},
    scalpel: {cap: 25, requirementBase, requirementStat, requirementValue: 205, price(lvl) {
        return {horde_mysticalShard: lvl * 12 + 125};
    }, effect: [
        {name: 'currencyHordeMonsterPartGain', type: 'mult', value: lvl => Math.pow(1.15, lvl)},
        {name: 'currencyHordeMonsterPartCap', type: 'mult', value: lvl => Math.pow(1.25, lvl)}
    ], onBuy() {
        HOSTORE.dispatch('horde/checkPlayerHealth');
    }},
    pocketKnife: {cap: 6, requirementBase, requirementStat, requirementValue: 220, price(lvl) {
        return {horde_bone: Math.pow(750, lvl) * 7.5e98};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.25, lvl)},
        {name: 'currencyHordeCorruptedFleshGain', type: 'mult', value: lvl => Math.pow(1.5, lvl)}
    ]},
    protectiveVest: {cap: 6, requirementBase, requirementStat, requirementValue: 235, price(lvl) {
        return {horde_bone: Math.pow(850, lvl) * 2e104};
    }, effect: [
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.2, lvl)},
        {name: 'currencyHordeMonsterPartCap', type: 'mult', value: lvl => Math.pow(1.4, lvl)},
    ]},
    luckyArtifact: {cap: 75, requirementBase, requirementStat, requirementValue: 250, price(lvl) {
        return {horde_bone: Math.pow(lvl * 0.05 + 2.75, lvl) * 7.77e109};
    }, effect: [
        {name: 'hordeShardChance', type: 'mult', value: lvl => Math.pow(1.05, lvl)},
        {name: 'hordeEquipmentChance', type: 'mult', value: lvl => Math.pow(1.08, lvl)},
    ]},
    brownPaint: {cap: 30, requirementBase, requirementStat, requirementValue: 270, price(lvl) {
        return {horde_monsterPart: Math.pow(lvl * 0.05 + 1.9, lvl) * 1.75e21};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.15, lvl)},
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.15, lvl)},
        {name: 'currencyHordeBoneGain', type: 'mult', value: lvl => Math.pow(1.15, lvl)},
    ]},
    grindstone: {cap: 40, requirementBase, requirementStat, requirementValue: 290, price(lvl) {
        return {horde_bone: Math.pow(lvl * 0.08 + 2.2, lvl) * 9.3e131};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.14, lvl)},
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.11, lvl)},
    ]},
    strangeDetector: {cap: 20, requirementBase, requirementStat, requirementValue: 310, price(lvl) {
        return {horde_mysticalShard: lvl * 15 + 250};
    }, effect: [
        {name: 'currencyHordeCorruptedFleshGain', type: 'mult', value: lvl => Math.pow(1.4, lvl)}
    ], onBuy() {
        HOSTORE.dispatch('horde/checkPlayerHealth');
    }},
    weaponStorage: {cap: 100, requirementBase, requirementStat, requirementValue: 330, price(lvl) {
        return {horde_bone: Math.pow(lvl * 0.01 + 1.85, lvl) * 4.8e155};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.11, lvl)},
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
    ]},
    frostSpear: {cap: 30, requirementBase, requirementStat, requirementValue: 350, price(lvl) {
        return {horde_bone: Math.pow(lvl * 0.1 + 2.75, lvl) * 1e167};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.21, lvl)},
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.09, lvl)},
    ]},
    lightningShield: {cap: 30, requirementBase, requirementStat, requirementValue: 375, price(lvl) {
        return {horde_bone: Math.pow(lvl * 0.1 + 2.75, lvl) * 1e180};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.09, lvl)},
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.21, lvl)},
    ]},
    waterBubble: {cap: 50, requirementBase, requirementStat, requirementValue: 400, price(lvl) {
        return {horde_bone: Math.pow(lvl * 0.1 + 2.75, lvl) * 1e190};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.15, lvl)},
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.15, lvl)},
    ]},
};
})();
const HO_UPGRADE2 = (function() {
const requirementStat = 'custom_hordeBattlepass';
const requirementBase = () => store.getters['horde/battlePassCurrentLevel'];
  return {
    transfusion: {subfeature: 1, cap: 50, price(lvl) {
        return {horde_blood: Math.pow(1.3, lvl) * 300};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => getSequence(5, lvl) * 0.02 + 1},
        {name: 'hordeHealth', type: 'mult', value: lvl => getSequence(5, lvl) * 0.02 + 1}
    ]},
    darkAttack: {subfeature: 1, requirementBase, requirementStat, requirementValue: 1, price(lvl) {
        return {horde_blood: Math.pow(lvl * 0.0025 + 1.325, lvl) * buildNum(24, 'K')};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.18, lvl)}
    ]},
    darkHealth: {subfeature: 1, requirementBase, requirementStat, requirementValue: 3, price(lvl) {
        return {horde_blood: Math.pow(lvl * 0.0025 + 1.325, lvl) * buildNum(110, 'K')};
    }, effect: [
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.19, lvl)}
    ]},
    harvest: {subfeature: 1, requirementBase, requirementStat, requirementValue: 8, price(lvl) {
        return {horde_blood: Math.pow(lvl * 0.003 + 1.45, lvl) * buildNum(3, 'M')};
    }, effect: [
        {name: 'currencyHordeBloodGain', type: 'mult', value: lvl => Math.pow(1.11, lvl)}
    ]},
    protectiveShell: {subfeature: 1, cap: 20, requirementBase, requirementStat, requirementValue: 14, price(lvl) {
        return {horde_blood: Math.pow(2.35, lvl) * buildNum(190, 'M')};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.07, lvl)},
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.11, lvl)},
        {name: 'hordeRecovery', type: 'base', value: lvl => lvl * 0.001}
    ]},
    bloodStorage: {subfeature: 1, cap: 20, requirementBase, requirementStat, requirementValue: 18, price(lvl) {
        return {horde_blood: Math.pow(lvl * 0.04 + 1.9, lvl) * buildNum(2.2, 'B')};
    }, effect: [
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
        {name: 'currencyHordeBloodCap', type: 'mult', value: lvl => Math.pow(1.175, lvl)}
    ]},
    secondChance: {subfeature: 1, cap: 1, requirementBase, requirementStat, requirementValue: 22, price() {
        return {horde_blood: buildNum(333, 'B')};
    }, effect: [
        {name: 'hordeRevive', type: 'base', value: lvl => lvl}
    ]},
    darkMilestone: {subfeature: 1, requirementBase, requirementStat, requirementValue: 24, price(lvl) {
        return {horde_blood: Math.pow(1000, lvl) * buildNum(1, 'T')};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(3, lvl)},
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(3, lvl)},
        {name: 'currencyHordeBloodCap', type: 'mult', value: lvl => Math.pow(10, lvl)},
    ]},
    endlessAnger: {subfeature: 1, cap: 20, requirementBase, requirementStat, requirementValue: 31, price(lvl) {
        return {horde_blood: Math.pow(2.8, lvl) * buildNum(25, 'Qi')};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.33, lvl)}
    ]},
    fistFight: {subfeature: 1, cap: 30, requirementBase, requirementStat, requirementValue: 42, price(lvl) {
        return {horde_blood: Math.pow(2.45, lvl) * buildNum(400, 'Sx')};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
        {name: 'currencyHordeBloodGain', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
    ]},
    syringe: {subfeature: 1, cap: 30, requirementBase, requirementStat, requirementValue: 55, price(lvl) {
        return {horde_blood: Math.pow(lvl * 0.02 + 1.7, lvl) * buildNum(65, 'Sp')};
    }, effect: [
        {name: 'currencyHordeBloodGain', type: 'mult', value: lvl => Math.pow(1.15, lvl)},
        {name: 'currencyHordeBloodCap', type: 'mult', value: lvl => Math.pow(1.18, lvl)},
    ]},
    bloodRitual: {subfeature: 1, requirementBase, requirementStat, requirementValue: 66, price(lvl) {
        return {horde_blood: Math.pow(10, lvl) * buildNum(1, 'O')};
    }, effect: [
        {name: 'hordeCorruption', type: 'bonus', value: lvl => -0.07 * lvl},
    ]},
    darkDummy: {subfeature: 1, cap: 50, requirementBase, requirementStat, requirementValue: 77, price(lvl) {
        return {horde_blood: Math.pow(lvl * 0.01 + 1.9, lvl) * 7.5e29};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.12, lvl)},
    ]},
    banishingRitual: {subfeature: 1, requirementBase, requirementStat, requirementValue: 90, price(lvl) {
        return {horde_blood: Math.pow(250, lvl) * 1.5e34};
    }, effect: [
        {name: 'hordeCorruption', type: 'bonus', value: lvl => -0.15 * lvl},
        {name: 'currencyHordeBloodCap', type: 'mult', value: lvl => Math.pow(2, lvl)},
    ]},
    toothSpear: {subfeature: 1, persistent: true, cap: 25, requirementBase, requirementStat, requirementValue: 105, price(lvl) {
        return {horde_monsterToothWarzone: lvl * 4 + 2};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.125, lvl)},
    ]},
    toothNecklace: {subfeature: 1, persistent: true, cap: 25, requirementBase, requirementStat, requirementValue: 111, price(lvl) {
        return {horde_monsterToothWarzone: lvl * 4 + 4};
    }, effect: [
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.13, lvl)},
    ]},
    darkShield: {subfeature: 1, cap: 10, requirementBase, requirementStat, requirementValue: 115, price(lvl) {
        return {horde_blood: Math.pow(lvl * 0.5 + 3.75, lvl) * 8e42};
    }, effect: [
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.12, lvl)},
        {name: 'currencyHordeBloodGain', type: 'mult', value: lvl => Math.pow(1.25, lvl)},
        {name: 'currencyHordeBloodCap', type: 'mult', value: lvl => Math.pow(1.75, lvl)},
    ]},
};
})();
const HO_UPGRADEPREM = (function() {
  return {
    morePower: {type: 'premium', price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 100};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => getSequence(2, lvl) * 0.3 + 1},
        {name: 'hordeHealth', type: 'mult', value: lvl => getSequence(2, lvl) * 0.3 + 1}
    ]},
    moreBones: {type: 'premium', price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 75};
    }, effect: [
        {name: 'currencyHordeBoneGain', type: 'mult', value: lvl => getSequence(1, lvl) + 1},
        {name: 'currencyHordeBoneCap', type: 'mult', value: lvl => getSequence(1, lvl) + 1}
    ]},
    moreMonsterParts: {type: 'premium', requirement() {
        return HOSTORE.state.stat.horde_monsterPart.total > 0;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 90};
    }, effect: [
        {name: 'currencyHordeMonsterPartGain', type: 'mult', value: lvl => lvl * 0.5 + 1}
    ]},
    moreSouls: {type: 'premium', requirement() {
        return HOSTORE.state.stat.horde_maxZone.total > 19;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 110};
    }, effect: [
        {name: 'currencyHordeSoulCorruptedGain', type: 'mult', value: lvl => lvl * 0.25 + 1},
        {name: 'currencyHordeSoulCorruptedCap', type: 'mult', value: lvl => lvl * 0.25 + 1}
    ]},
    moreMastery: {type: 'premium', requirement() {
        return HOSTORE.state.stat.horde_maxZone.total > 75;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 125};
    }, effect: [
        {name: 'hordeEquipmentMasteryGain', type: 'mult', value: lvl => getSequence(2, lvl) * 0.25 + 1}
    ]},
    ancientPower: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumAncient', requirement() {
        return HOSTORE.state.horde.heirloom.power.amount > 0;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 300};
    }, effect: [
        {name: 'powerHeirloomEffect', type: 'mult', value: lvl => Math.pow(2, lvl)}
    ]},
    ancientFortitude: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumAncient', requirement() {
        return HOSTORE.state.horde.heirloom.fortitude.amount > 0;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 300};
    }, effect: [
        {name: 'fortitudeHeirloomEffect', type: 'mult', value: lvl => Math.pow(2, lvl)}
    ]},
    ancientWealth: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumAncient', requirement() {
        return HOSTORE.state.horde.heirloom.wealth.amount > 0;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 300};
    }, effect: [
        {name: 'wealthHeirloomEffect', type: 'mult', value: lvl => Math.pow(2, lvl)}
    ]},
    ancientSpirit: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumAncient', requirement() {
        return HOSTORE.state.horde.heirloom.spirit.amount > 0;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 450};
    }, effect: [
        {name: 'spiritHeirloomEffect', type: 'mult', value: lvl => Math.pow(2, lvl)}
    ]},
    ancientSharpsight: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumAncient', requirement() {
        return HOSTORE.state.horde.heirloom.sharpsight.amount > 0;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 600};
    }, effect: [
        {name: 'sharpsightHeirloomEffect', type: 'mult', value: lvl => Math.pow(2, lvl)}
    ]},
    ancientReaping: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumAncient', requirement() {
        return HOSTORE.state.horde.heirloom.reaping.amount > 0;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 750};
    }, effect: [
        {name: 'reapingHeirloomEffect', type: 'mult', value: lvl => Math.pow(2, lvl)}
    ]},
    ancientRemembrance: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumAncient', requirement() {
        return HOSTORE.state.horde.heirloom.remembrance.amount > 0;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 750};
    }, effect: [
        {name: 'remembranceHeirloomEffect', type: 'mult', value: lvl => Math.pow(2, lvl)}
    ]},
    ancientHolding: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumAncient', requirement() {
        return HOSTORE.state.horde.heirloom.holding.amount > 0;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 975};
    }, effect: [
        {name: 'holdingHeirloomEffect', type: 'mult', value: lvl => Math.pow(2, lvl)}
    ]},
    ancientExpertise: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumAncient', requirement() {
        return HOSTORE.state.horde.heirloom.expertise.amount > 0;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 1300};
    }, effect: [
        {name: 'expertiseHeirloomEffect', type: 'mult', value: lvl => Math.pow(2, lvl)}
    ]},
    ancientMystery: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumAncient', requirement() {
        return HOSTORE.state.horde.heirloom.mystery.amount > 0;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 1800};
    }, effect: [
        {name: 'mysteryHeirloomEffect', type: 'mult', value: lvl => Math.pow(2, lvl)}
    ]},
    ancientFreezing: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumAncient', requirement() {
        return HOSTORE.state.horde.heirloom.freezing.amount > 0;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 2500};
    }, effect: [
        {name: 'freezingHeirloomEffect', type: 'mult', value: lvl => Math.pow(2, lvl)}
    ]},
    moreBlood: {type: 'premium', requirement() {
        return HOSTORE.state.unlock.hordeClassesSubfeature.see;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 900};
    }, effect: [
        {name: 'currencyHordeBloodGain', type: 'mult', value: lvl => getSequence(1, lvl) + 1},
        {name: 'currencyHordeBloodCap', type: 'mult', value: lvl => getSequence(1, lvl) + 1},
    ]},
    moreCourage: {type: 'premium', requirement() {
        return HOSTORE.state.unlock.hordeClassesSubfeature.see;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 1200};
    }, effect: [
        {name: 'currencyHordeCourageGain', type: 'mult', value: lvl => lvl * 0.25 + 1},
    ]},
    moreMonsterTeeth: {type: 'premium', cap: 5, requirement() {
        return HOSTORE.state.unlock.hordeMonsterToothWarzone.see;
    }, price(lvl) {
        return {gem_ruby: Math.pow(2, lvl) * 2000};
    }, effect: [
        {name: 'hordeToothGain', type: 'base', value: lvl => lvl * 0.01},
        {name: 'hordeToothGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
    ]},
};
})();
const HO_UPGRADEPREST = (function() {
const requirementStat = 'horde_maxZone';
const requirementStat2 = 'custom_hordeBattlepass';
const requirementBase = () => store.state.stat[requirementStat].total;
const requirementBase2 = () => store.getters['horde/battlePassCurrentLevel'];
  return {
    wrath: {type: 'prestige', cap: 10, price(lvl) {
        return {horde_soulEmpowered: Math.pow(1.4, lvl) * 60};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => lvl * 0.25 + 1},
        {name: 'hordeCritChance', type: 'base', value: lvl => lvl * 0.01}
    ]},
    peace: {type: 'prestige', cap: 10, price(lvl) {
        return {horde_soulEmpowered: Math.pow(1.4, lvl) * 60};
    }, effect: [
        {name: 'hordeHealth', type: 'mult', value: lvl => lvl * 0.25 + 1},
        {name: 'hordeRespawn', type: 'base', value: lvl => lvl * -5}
    ]},
    milk: {type: 'prestige', cap: 45, price(lvl) {
        return {horde_soulEmpowered: Math.pow(1.45, lvl) * 80};
    }, effect: [
        {name: 'currencyHordeBoneGain', type: 'base', value: lvl => Math.pow(2, lvl) * 50},
        {name: 'currencyHordeBoneGain', type: 'mult', value: lvl => lvl * 0.2 + 1},
        {name: 'currencyHordeBoneCap', type: 'mult', value: lvl => Math.pow(1.75, lvl)}
    ]},
    butcher: {type: 'prestige', cap: 10, price(lvl) {
        return {horde_soulEmpowered: Math.pow(1.55, lvl) * 100};
    }, effect: [
        {name: 'currencyHordeMonsterPartGain', type: 'base', value: lvl => lvl * 0.05},
        {name: 'currencyHordeMonsterPartCap', type: 'base', value: lvl => lvl * 30},
        {name: 'hordeBossRequirement', type: 'base', value: lvl => lvl * -1}
    ]},
    beginnerLuck: {type: 'prestige', cap: 120, requirementBase, requirementStat, requirementValue: 26, price(lvl) {
        return {horde_soulEmpowered: Math.pow(1.65, lvl) * 375};
    }, effect: [
        {name: 'hordeEquipmentChance', type: 'mult', value: lvl => lvl * 0.2 + 1},
        {name: 'currencyHordeSoulCorruptedGain', type: 'mult', value: lvl => lvl * 0.05 + 1}
    ]},
    balance: {type: 'prestige', requirementBase, requirementStat, requirementValue: 31, price(lvl) {
        return {horde_soulEmpowered: Math.pow(1.375, lvl) * 1100};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.13, lvl)},
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.13, lvl)}
    ]},
    advancedLuck: {type: 'prestige', cap: 40, requirementBase, requirementStat, requirementValue: 36, price(lvl) {
        return {horde_soulEmpowered: Math.pow(1.65, lvl) * 3250};
    }, effect: [
        {name: 'hordeHeirloomChance', type: 'base', value: lvl => lvl * 0.0025},
        {name: 'hordeNostalgia', type: 'base', value: lvl => lvl * 5}
    ]},
    boneTrader: {type: 'prestige', cap: 150, requirementBase, requirementStat, requirementValue: 41, price(lvl) {
        return {horde_soulEmpowered: Math.pow(1.45, lvl) * 1.15e4};
    }, effect: [
        {name: 'currencyHordeBoneGain', type: 'mult', value: lvl => Math.pow(1.3, lvl)},
        {name: 'currencyHordeMonsterPartCap', type: 'mult', value: lvl => Math.pow(1.1, lvl)}
    ]},
    soulCage: {type: 'prestige', cap: 80, requirementBase, requirementStat, requirementValue: 46, price(lvl) {
        return {horde_soulEmpowered: Math.pow(1.95, lvl) * 4.5e4};
    }, effect: [
        {name: 'currencyHordeSoulCorruptedGain', type: 'mult', value: lvl => lvl * 0.04 + 1},
        {name: 'currencyHordeSoulCorruptedCap', type: 'mult', value: lvl => Math.pow(1.3, lvl) * (lvl * 0.1 + 1)}
    ]},
    victoryCelebration: {type: 'prestige', cap: 7, requirementBase, requirementStat, requirementValue: 48, price(lvl) {
        return {horde_soulEmpowered: Math.pow(1000, lvl) * 7.5e4};
    }, effect: [
        {name: 'hordeRaidHealth', type: 'base', value: lvl => lvl >= 1 ? (Math.floor((lvl + 1) / 2) * 0.05) : null},
        {name: 'hordeRaidAttack', type: 'base', value: lvl => lvl >= 2 ? (Math.floor(lvl / 2) * 0.05) : null},
    ]},
    offenseBook: {type: 'prestige', cap: 50, requirementBase, requirementStat, requirementValue: 51, price(lvl) {
        return {horde_soulEmpowered: Math.pow(1.225, lvl) * 2.25e5};
    }, effect: [
        {name: 'powerHeirloomEffect', type: 'mult', value: lvl => Math.pow(1.1, lvl) * (lvl * 0.15 + 1)}
    ]},
    defenseBook: {type: 'prestige', cap: 50, requirementBase, requirementStat, requirementValue: 56, price(lvl) {
        return {horde_soulEmpowered: Math.pow(1.225, lvl) * 7.5e5};
    }, effect: [
        {name: 'fortitudeHeirloomEffect', type: 'mult', value: lvl => Math.pow(1.1, lvl) * (lvl * 0.15 + 1)}
    ]},
    ashCircle: {type: 'prestige', requirementBase, requirementStat, requirementValue: 61, price(lvl) {
        return {horde_soulEmpowered: Math.pow(lvl * 0.015 + 1.2, lvl) * 4e6};
    }, effect: [
        {name: 'hordeCorruption', type: 'base', value: lvl => lvl * -0.12}
    ]},
    lastWill: {type: 'prestige', cap: 15, requirementBase, requirementStat, requirementValue: 66, price(lvl) {
        return {horde_soulEmpowered: Math.pow(lvl * 0.375 + 2.5, lvl) * 3e7};
    }, effect: [
        {name: 'hordeHeirloomAmount', type: 'base', value: lvl => lvl}
    ]},
    candleCircle: {type: 'prestige', requirementBase, requirementStat, requirementValue: 71, price(lvl) {
        return {horde_soulEmpowered: Math.pow(lvl * 0.0015 + 1.225, lvl) * 6e8};
    }, effect: [
        {name: 'currencyHordeSoulCorruptedGain', type: 'mult', value: lvl => Math.pow(1.03, lvl)},
        {name: 'hordeRespawn', type: 'base', value: lvl => lvl * -5}
    ]},
    spoilsOfWar: {type: 'prestige', cap: 5, requirementBase, requirementStat, requirementValue: 76, price(lvl) {
        return {horde_soulEmpowered: Math.pow(1e4, lvl) * 3e9};
    }, effect: [
        {name: 'hordeRaidEquipmentChance', type: 'base', value: lvl => getSequence(1, lvl) * 0.05}
    ]},
    containmentChamber: {type: 'prestige', cap: 100, requirementBase, requirementStat, requirementValue: 81, price(lvl) {
        return {horde_soulEmpowered: Math.pow(1.225 + lvl * 0.0075, lvl) * 2e10};
    }, effect: [
        {name: 'currencyHordeBoneCap', type: 'mult', value: lvl => Math.pow(1.2, lvl)},
        {name: 'hordeHeirloomEffect', type: 'mult', value: lvl => lvl * 0.03 + 1}
    ]},
    mausoleum: {type: 'prestige', cap: 80, requirementBase, requirementStat, requirementValue: 91, price(lvl) {
        return {horde_soulEmpowered: Math.pow(lvl * 0.00375 + 1.3, lvl) * 2.4e11};
    }, effect: [
        {name: 'currencyHordeBoneGain', type: 'mult', value: lvl => Math.pow(1.3, lvl)},
        {name: 'currencyHordeMonsterPartGain', type: 'mult', value: lvl => Math.pow(1.15, lvl)},
        {name: 'currencyHordeSoulCorruptedGain', type: 'mult', value: lvl => Math.pow(1.06, lvl)}
    ]},
    combatStudies: {type: 'prestige', requirementBase, requirementStat, requirementValue: 111, price(lvl) {
        return {horde_soulEmpowered: Math.pow(1.35 + lvl * 0.02, lvl) * 3.5e15};
    }, effect: [
        {name: 'hordeEquipmentMasteryGain', type: 'mult', value: lvl => Math.pow(1.1, lvl) * (lvl * 0.1 + 1)}
    ]},
    boneChamber: {type: 'prestige', requirementBase, requirementStat, requirementValue: 131, price(lvl) {
        return {horde_soulEmpowered: Math.pow(2.3 + lvl * 0.04, lvl) * 1.25e18};
    }, effect: [
        {name: 'currencyHordeBoneCap', type: 'mult', value: lvl => Math.pow(2, lvl)}
    ]},
    deepHatred: {type: 'prestige', cap: 30, requirementBase, requirementStat, requirementValue: 151, price(lvl) {
        return {horde_soulEmpowered: Math.pow(lvl * 0.015 + 1.45, lvl) * 9e19};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.08, lvl) * (lvl * 0.1 + 1)},
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.04, lvl) * (lvl * 0.05 + 1)}
    ]},
    moreDummies: {type: 'prestige', cap: 20, raiseOtherCap: 'horde_targetDummy', requirementBase, requirementStat, requirementValue: 171, price(lvl) {
        return {horde_soulEmpowered: Math.pow(lvl * 0.3 + 6, lvl) * 9e21};
    }, effect: [
        {name: 'upgradeHordeTargetDummyCap', type: 'base', value: lvl => lvl * 5}
    ]},
    spiritLure: {type: 'prestige', cap: 50, requirementBase, requirementStat, requirementValue: 191, price(lvl) {
        return {horde_soulEmpowered: Math.pow(1.18, lvl) * 3.33e24};
    }, effect: [
        {name: 'currencyHordeSoulCorruptedGain', type: 'mult', value: lvl => lvl * 0.06 + 1}
    ]},
    mysticalCondenser: {type: 'prestige', cap: 25, requirementBase, requirementStat, requirementValue: 211, price(lvl) {
        return {horde_soulEmpowered: Math.pow(lvl * 0.075 + 1.75, lvl) * 1.5e28};
    }, effect: [
        {name: 'currencyHordeMysticalShardCap', type: 'base', value: lvl => lvl * 2}
    ]},
    secretTraining: {type: 'prestige', cap: 20, requirementBase, requirementStat, requirementValue: 241, price(lvl) {
        return {horde_soulEmpowered: Math.pow(lvl * 0.0225 + 1.6, lvl) * 2.2e30};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.1, lvl) * (lvl * 0.2 + 1)},
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.1, lvl) * (lvl * 0.2 + 1)}
    ]},
    secretStorage: {type: 'prestige', cap: 30, requirementBase, requirementStat, requirementValue: 271, price(lvl) {
        return {horde_soulEmpowered: Math.pow(lvl * 0.015 + 1.5, lvl) * 6.3e32};
    }, effect: [
        {name: 'currencyHordeBoneCap', type: 'mult', value: lvl => Math.pow(1.75, lvl)},
        {name: 'currencyHordeMonsterPartCap', type: 'mult', value: lvl => Math.pow(1.15, lvl)},
        {name: 'currencyHordeMysticalShardCap', type: 'base', value: lvl => lvl}
    ]},
    pathfinder: {type: 'prestige', cap: 50, requirementBase, requirementStat, requirementValue: 301, price(lvl) {
        return {horde_soulEmpowered: Math.pow(lvl * 0.0075 + 1.375, lvl) * 1.15e35};
    }, effect: [
        {name: 'hordeShardChance', type: 'mult', value: lvl => Math.pow(1.2, lvl)}
    ]},
    exoskeleton: {type: 'prestige', cap: 25, requirementBase, requirementStat, requirementValue: 331, price(lvl) {
        return {horde_soulEmpowered: Math.pow(1.85 + lvl * 0.075, lvl) * 5.1e38};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
        {name: 'currencyHordeBoneGain', type: 'mult', value: lvl => Math.pow(1.25, lvl)}
    ]},
    essenceCollector: {type: 'prestige', cap: 50, requirementBase, requirementStat, requirementValue: 361, price(lvl) {
        return {horde_soulEmpowered: Math.pow(lvl * 0.12 + 1.4, lvl) * 1.85e41};
    }, effect: [
        {name: 'hordeEssenceGain', type: 'mult', value: lvl => Math.pow(1.2, lvl)}
    ]},

    // Royal upgrades
    royalSword: {type: 'prestige', requirementBase, requirementStat, requirementValue: 140, price(lvl) {
        return {horde_crown: Math.round(Math.pow(1.08, lvl) * (lvl + 1) * 10)};
    }, effect: [
        {name: 'hordeRaidAttack', type: 'base', value: lvl => lvl * 0.01},
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.05, lvl) * (0.1 * lvl + 1)},
    ]},
    royalArmor: {type: 'prestige', requirement() {
        return HOSTORE.state.unlock.hordeUpgradeRoyalArmor.use;
    }, price(lvl) {
        return {horde_crown: Math.round(Math.pow(1.08, lvl) * (lvl + 1) * 14)};
    }, effect: [
        {name: 'hordeRaidHealth', type: 'base', value: lvl => lvl * 0.01},
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.05, lvl) * (0.1 * lvl + 1)},
    ]},
    royalStorage: {type: 'prestige', requirement() {
        return HOSTORE.state.unlock.hordeUpgradeRoyalStorage.use;
    }, price(lvl) {
        return {horde_crown: Math.round(Math.pow(1.08, lvl) * (lvl + 1) * 28)};
    }, effect: [
        {name: 'hordeRaidBoneGain', type: 'base', value: lvl => lvl * 0.01},
        {name: 'currencyHordeBoneGain', type: 'mult', value: lvl => Math.pow(1.05, lvl) * (0.1 * lvl + 1)},
        {name: 'currencyHordeBoneCap', type: 'mult', value: lvl => Math.pow(1.05, lvl) * (0.1 * lvl + 1)},
    ]},
    royalButcher: {type: 'prestige', requirement() {
        return HOSTORE.state.unlock.hordeUpgradeRoyalButcher.use;
    }, price(lvl) {
        return {horde_crown: Math.round(Math.pow(1.08, lvl) * (lvl + 1) * 55)};
    }, effect: [
        {name: 'hordeRaidMonsterPartGain', type: 'base', value: lvl => lvl * 0.005},
        {name: 'currencyHordeMonsterPartGain', type: 'mult', value: lvl => Math.pow(1.05, lvl) * (0.05 * lvl + 1)},
    ]},
    royalCrypt: {type: 'prestige', requirement() {
        return HOSTORE.state.unlock.hordeUpgradeRoyalCrypt.use;
    }, price(lvl) {
        return {horde_crown: Math.round(Math.pow(1.08, lvl) * (lvl + 1) * 111)};
    }, effect: [
        {name: 'hordeRaidSoulCorruptedGain', type: 'base', value: lvl => getDiminishing(lvl) * 0.001},
        {name: 'currencyHordeSoulCorruptedGain', type: 'mult', value: lvl => getSequence(5, lvl) * 0.01 + 1},
        {name: 'currencyHordeSoulCorruptedCap', type: 'mult', value: lvl => getSequence(5, lvl) * 0.01 + 1},
    ]},
    royalSecret: {type: 'prestige', requirement() {
        return HOSTORE.state.unlock.hordeUpgradeRoyalSecret.use;
    }, price(lvl) {
        return {horde_crown: Math.round(Math.pow(1.08, lvl) * (lvl + 1) * 222)};
    }, effect: [
        {name: 'hordeShardChance', type: 'mult', value: lvl => Math.pow(1.05, lvl) * (0.1 * lvl + 1)},
        {name: 'currencyHordeMysticalShardCap', type: 'base', value: lvl => lvl * 2}
    ]},
    royalBlessing: {type: 'prestige', cap: 6, requirement() {
        return HOSTORE.state.unlock.hordeUpgradeRoyalBlessing.use;
    }, price(lvl) {
        return {horde_crown: Math.round(Math.pow(2, lvl) * 1000)};
    }, effect: [
        {name: 'hordeEquipmentBlessedSword', type: 'unlock', value: lvl => lvl >= 1},
        {name: 'hordeEquipmentBlessedArmor', type: 'unlock', value: lvl => lvl >= 2},
        {name: 'hordeEquipmentBlessedBow', type: 'unlock', value: lvl => lvl >= 3},
        {name: 'hordeEquipmentBlessedFlame', type: 'unlock', value: lvl => lvl >= 4},
        {name: 'hordeEquipmentBlessedWater', type: 'unlock', value: lvl => lvl >= 5},
        {name: 'hordeEquipmentBlessedShield', type: 'unlock', value: lvl => lvl >= 6},
    ]},

    precision: {type: 'prestige', requirement() {
        return HOSTORE.state.unlock.hordeClassesSubfeature.see;
    }, price(lvl) {
        return {horde_courage: Math.pow(lvl * 0.01 + 1.55, lvl) * 1000};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.15, lvl)}
    ]},
    resolve: {type: 'prestige', requirement() {
        return HOSTORE.state.unlock.hordeClassesSubfeature.see;
    }, price(lvl) {
        return {horde_courage: Math.pow(lvl * 0.01 + 1.55, lvl) * 1250};
    }, effect: [
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.15, lvl)}
    ]},
    determination: {type: 'prestige', requirementBase: requirementBase2, requirementStat: requirementStat2, requirementValue: 7, price(lvl) {
        return {horde_courage: Math.pow(lvl * 0.02 + 2.35, lvl) * 6000};
    }, effect: [
        {name: 'currencyHordeSoulCorruptedGain', type: 'mult', value: lvl => Math.pow(1.05, lvl)},
        {name: 'currencyHordeCourageGain', type: 'mult', value: lvl => Math.pow(1.1, lvl)}
    ]},
    education: {type: 'prestige', requirementBase: requirementBase2, requirementStat: requirementStat2, requirementValue: 10, price(lvl) {
        return {horde_courage: Math.pow(lvl * 0.01 + 1.6, lvl) * 1.1e4};
    }, effect: [
        {name: 'hordeExpBase', type: 'mult', value: lvl => Math.pow(1 / 1.1, lvl)}
    ]},
    bloodChamber: {type: 'prestige', requirementBase: requirementBase2, requirementStat: requirementStat2, requirementValue: 12, price(lvl) {
        return {horde_courage: Math.pow(lvl * 0.05 + 2.5, lvl) * 1.6e4};
    }, effect: [
        {name: 'currencyHordeBoneCap', type: 'mult', value: lvl => Math.pow(1.75, lvl)},
        {name: 'currencyHordeBloodCap', type: 'mult', value: lvl => Math.pow(2.25, lvl)}
    ]},
    stoneSkin: {type: 'prestige', cap: 30, requirementBase: requirementBase2, requirementStat: requirementStat2, requirementValue: 16, price(lvl) {
        return {horde_courage: Math.pow(lvl * 0.5 + 5, lvl) * 7e4};
    }, effect: [
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.2, lvl)},
        {name: 'currencyHordeBloodCap', type: 'mult', value: lvl => Math.pow(1.5, lvl)}
    ]},
    university: {type: 'prestige', requirementBase: requirementBase2, requirementStat: requirementStat2, requirementValue: 20, price(lvl) {
        return {horde_courage: Math.pow(lvl * 0.02 + 1.85, lvl) * 2.5e5};
    }, effect: [
        {name: 'hordeExpIncrement', type: 'mult', value: lvl => Math.pow(1 / 1.05, lvl) / (lvl * 0.05 + 1)}
    ]},
    discovery: {type: 'prestige', cap: 40, requirementBase: requirementBase2, requirementStat: requirementStat2, requirementValue: 27, price(lvl) {
        return {horde_courage: Math.pow(lvl * 0.25 + 4, lvl) * 5e6};
    }, effect: [
        {name: 'currencyHordeSoulCorruptedCap', type: 'mult', value: lvl => Math.pow(lvl * 0.01 + 1.4, lvl)},
        {name: 'hordeHeirloomAmount', type: 'base', value: lvl => lvl},
        {name: 'hordeTrinketGain', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    innerFocus: {type: 'prestige', cap: 30, requirementBase: requirementBase2, requirementStat: requirementStat2, requirementValue: 33, price(lvl) {
        return {horde_courage: Math.pow(lvl * 0.5 + 2, lvl) * 2.8e7};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.2, lvl)},
        {name: 'currencyHordeBloodCap', type: 'mult', value: lvl => Math.pow(1.5, lvl)}
    ]},
    purge: {type: 'prestige', requirementBase: requirementBase2, requirementStat: requirementStat2, requirementValue: 45, price(lvl) {
        return {horde_courage: Math.pow(lvl * 0.015 + 1.25, lvl) * 1.5e11};
    }, effect: [
        {name: 'hordeCorruption', type: 'base', value: lvl => lvl * -0.09}
    ]},
    defensiveStance: {type: 'prestige', cap: 20, requirementBase: requirementBase2, requirementStat: requirementStat2, requirementValue: 53, price(lvl) {
        return {horde_courage: Math.pow(lvl * 0.1 + 2.25, lvl) * 6e12};
    }, effect: [
        {name: 'hordeHealth', type: 'mult', value: lvl => Math.pow(1.16, lvl)},
        {name: 'currencyHordeSoulCorruptedGain', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
        {name: 'currencyHordeCourageGain', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    chaosCrate: {type: 'prestige', cap: 10, requirementBase: requirementBase2, requirementStat: requirementStat2, requirementValue: 65, price(lvl) {
        return {horde_courage: Math.pow(10, lvl) * 1e14};
    }, effect: [
        {name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.35, lvl)},
        {name: 'hordeEquipmentChance', type: 'mult', value: lvl => lvl >= 1 ? (Math.floor((lvl + 4) / 5) * 0.5 + 1) : null},
        {name: 'hordeHeirloomAmount', type: 'base', value: lvl => lvl >= 2 ? (Math.floor((lvl + 3) / 5) * 5) : null},
        {name: 'hordeEquipmentMasteryGain', type: 'mult', value: lvl => lvl >= 3 ? (Math.floor((lvl + 2) / 5) * 0.5 + 1) : null},
        {name: 'currencyHordeMysticalShardCap', type: 'base', value: lvl => lvl >= 4 ? (Math.floor((lvl + 1) / 5) * 10) : null},
        {name: 'hordeSkillPointsPerLevel', type: 'base', value: lvl => lvl >= 5 ? Math.floor(lvl / 5) : null},
    ]},
    limitBreak: {type: 'prestige', cap: 25, requirementBase: requirementBase2, requirementStat: requirementStat2, requirementValue: 85, price(lvl) {
        return {horde_courage: Math.pow(lvl * 0.1 + 1.65, lvl) * 7.75e15};
    }, effect: [
        {name: 'currencyHordeSoulCorruptedGain', type: 'mult', value: lvl => Math.pow(1.05, lvl)},
        {name: 'currencyHordeCourageGain', type: 'mult', value: lvl => Math.pow(1.05, lvl)},
        {name: 'currencyHordeBoneCap', type: 'mult', value: lvl => Math.pow(1.35, lvl)},
        {name: 'currencyHordeBloodCap', type: 'mult', value: lvl => Math.pow(1.5, lvl)}
    ]},
    headhunter: {type: 'prestige', cap: 10, requirementBase: requirementBase2, requirementStat: requirementStat2, requirementValue: 113, price(lvl) {
        return {horde_courage: Math.pow(lvl * 0.85 + 2.75, lvl) * 2.25e17};
    }, effect: [
        {name: 'currencyHordeMonsterToothWarzoneGain', type: 'base', value: lvl => lvl * 0.015},
        {name: 'currencyHordeMysticalShardCap', type: 'base', value: lvl => lvl * 5}
    ]},
    templeExploration: {type: 'prestige', cap: 10, requirementBase: requirementBase2, requirementStat: requirementStat2, requirementValue: 130, price(lvl) {
        return {horde_courage: Math.pow(lvl * 0.85 + 2.75, lvl) * 1.6e19};
    }, effect: [
        {name: 'currencyHordeMonsterToothMonkeyJungleGain', type: 'base', value: lvl => lvl * 0.015},
        {name: 'hordeHeirloomEffect', type: 'mult', value: lvl => lvl * 0.02 + 1}
    ]},
};
})();
const HO_TOWER = (function() {
  return {
    brick: {
        unlock: 'hordeBrickTower',
        sigils: ['bashing', 'toughness', 'strength', 'growing', 'fury'],
        statBase: 140,
        statScaling: 0.25,
        crowns: 1,
        heirlooms: ['brick'],
        reward: {
            50: {type: 'unlock', name: 'hordeUpgradeRoyalArmor', value: true},
            100: {type: 'mult', name: 'hordeHealth', value: 1.5},
            150: {type: 'mult', name: 'currencyHordeMonsterPartCap', value: 1.35},
            200: {type: 'base', name: 'hordeNostalgia', value: 50},
            300: {type: 'unlock', name: 'hordeUpgradeRoyalButcher', value: true},
            400: {type: 'base', name: 'hordeNostalgia', value: 50},
            500: {type: 'mult', name: 'currencyHordeBoneCap', value: 1.5},
        },
    },
    fire: {
        unlock: 'hordeFireTower',
        sigils: ['magicBolt', 'fireball', 'sparks', 'wisdom', 'berserk'],
        statBase: 170,
        statScaling: 0.3,
        crowns: 2,
        heirlooms: ['heat'],
        reward: {
            50: {type: 'unlock', name: 'hordeUpgradeRoyalStorage', value: true},
            100: {type: 'base', name: 'hordeMaxEquipment', value: 1},
            150: {type: 'mult', name: 'hordeAttack', value: 1.5},
            200: {type: 'base', name: 'currencyHordeMysticalShardCap', value: 10},
            300: {type: 'mult', name: 'currencyHordeBoneCap', value: 1.5},
            400: {type: 'mult', name: 'currencyHordeMonsterPartCap', value: 1.35},
        },
    },
    ice: {
        unlock: 'hordeIceTower',
        sigils: ['health', 'resistance', 'cold', 'angelic', 'iceGiant'],
        statBase: 200,
        statScaling: 0.35,
        crowns: 3,
        heirlooms: ['ice'],
        reward: {
            50: {type: 'mult', name: 'currencyHordeBoneGain', value: 1.5},
            100: {type: 'unlock', name: 'hordeUpgradeRoyalCrypt', value: true},
            150: {type: 'mult', name: 'currencyHordeSoulCorruptedGain', value: 1.2},
            200: {type: 'base', name: 'hordeMaxSacrifice', value: 1},
            300: {type: 'mult', name: 'hordeHealth', value: 1.5},
        },
    },
    danger: {
        unlock: 'hordeDangerTower',
        sigils: ['executing', 'focus', 'nuke', 'precision', 'power'],
        statBase: 245,
        statScaling: 0.4,
        crowns: 5,
        heirlooms: ['crystal'],
        reward: {
            50: {type: 'unlock', name: 'hordeUpgradeRoyalSecret', value: true},
            100: {type: 'mult', name: 'hordeAttack', value: 1.5},
            150: {type: 'base', name: 'currencyHordeMysticalShardCap', value: 10},
            200: {type: 'mult', name: 'hordeAttack', value: 1.5},
            300: {type: 'base', name: 'currencyHordeMysticalShardCap', value: 10},
        },
    },
    toxic: {
        unlock: 'hordeToxicTower',
        sigils: ['toxic', 'foulBreath', 'drain', 'spitting', 'sharp'],
        statBase: 290,
        statScaling: 0.45,
        crowns: 8,
        heirlooms: ['vitality'],
        reward: {
            50: {type: 'mult', name: 'hordeHealth', value: 1.5},
            100: {type: 'base', name: 'hordeMaxSacrifice', value: 1},
            150: {type: 'base', name: 'currencyHordeMysticalShardCap', value: 10},
            200: {type: 'mult', name: 'hordeAttack', value: 1.5},
        },
    },
    forest: {
        unlock: 'hordeForestTower',
        sigils: ['screaming', 'protection', 'shielding', 'recovery', 'drain'],
        statBase: 350,
        statScaling: 0.5,
        crowns: 13,
        heirlooms: ['nature'],
        reward: {
            50: {type: 'unlock', name: 'hordeUpgradeRoyalBlessing', value: true},
            100: {type: 'base', name: 'currencyHordeMysticalShardCap', value: 10},
        },
    },
};
})();
const HO_BATTLEPASS = (function() {
const newUpgrade = {icon: 'mdi-arrow-up-thin', color: 'light-blue', effect: [{name: 'hordeBattlePassUpgrade', type: 'text', value: true}]};
const newPrestigeUpgrade = {icon: 'mdi-arrow-up-bold', color: 'orange', effect: [{name: 'hordeBattlePassPrestigeUpgrade', type: 'text', value: true}]};
  return {
    1: newUpgrade,
    2: {icon: 'mdi-bow-arrow', color: 'light-green', effect: [{name: 'hordeClassArcher', type: 'unlock', value: true}]},
    3: newUpgrade,
    5: {icon: 'mdi-wizard-hat', color: 'deep-purple', effect: [{name: 'hordeClassMage', type: 'unlock', value: true}]},
    7: newPrestigeUpgrade,
    8: newUpgrade,
    10: newPrestigeUpgrade,
    12: newPrestigeUpgrade,
    14: newUpgrade,
    15: {icon: 'mdi-shield', color: 'blue-grey', effect: [{name: 'hordeClassKnight', type: 'unlock', value: true}]},
    16: newPrestigeUpgrade,
    18: newUpgrade,
    20: newPrestigeUpgrade,
    22: newUpgrade,
    24: newUpgrade,
    25: {icon: 'mdi-cached', color: 'pink', effect: [{name: 'hordeAutocast', type: 'base', value: 1}]},
    27: newPrestigeUpgrade,
    30: {icon: 'mdi-necklace', color: 'cyan', effect: [{name: 'hordeHeirloomAmount', type: 'mult', value: 2}]},
    31: newUpgrade,
    33: newPrestigeUpgrade,
    35: {icon: 'mdi-pirate', color: 'orange', effect: [{name: 'hordeClassPirate', type: 'unlock', value: true}]},
    40: {icon: 'mdi-star', color: 'light-blue', effect: [{name: 'hordeSkillPointsPerLevel', type: 'base', value: 1}]},
    42: newUpgrade,
    45: newPrestigeUpgrade,
    50: {icon: 'mdi-treasure-chest', color: 'red', effect: [{name: 'hordeMaxTrinkets', type: 'base', value: 1}]},
    53: newPrestigeUpgrade,
    55: newUpgrade,
    60: {icon: 'mdi-billiards-rack', color: 'teal', effect: [{name: 'hordeShardChance', type: 'mult', value: 3}]},
    65: newPrestigeUpgrade,
    66: newUpgrade,
    70: {icon: 'mdi-robber', color: 'amber', effect: [{name: 'hordeClassAssassin', type: 'unlock', value: true}]},
    75: {icon: 'mdi-treasure-chest', color: 'wooden', effect: [{name: 'hordeMaxEquipment', type: 'base', value: 1}]},
    77: newUpgrade,
    80: {icon: 'mdi-star', color: 'light-blue', effect: [{name: 'hordeSkillPointsPerLevel', type: 'base', value: 1}]},
    85: newPrestigeUpgrade,
    90: newUpgrade,
    95: {icon: 'mdi-necklace', color: 'cyan', effect: [{name: 'hordeHeirloomEffect', type: 'mult', value: 1.2}]},
    100: {icon: 'mdi-tooth', color: 'orange', effect: [{name: 'hordeMonsterToothWarzone', type: 'unlock', value: true}]},
    105: newUpgrade,
    110: {icon: 'mdi-necklace', color: 'amber', effect: [{name: 'hordeTrinketGain', type: 'mult', value: 1.5}]},
    111: newUpgrade,
    113: newPrestigeUpgrade,
    115: newUpgrade,
    120: {icon: 'mdi-pentagram', color: 'red', effect: [{name: 'hordeClassCultist', type: 'unlock', value: true}]},
    125: {icon: 'mdi-tooth', color: 'teal', effect: [{name: 'hordeMonsterToothMonkeyJungle', type: 'unlock', value: true}]},
    130: newPrestigeUpgrade,
    160: {icon: 'mdi-star', color: 'light-blue', effect: [{name: 'hordeSkillPointsPerLevel', type: 'base', value: 1}]},
    175: {icon: 'mdi-tooth', color: 'babypink', effect: [{name: 'hordeMonsterToothLoveIsland', type: 'unlock', value: true}]},
};
})();
const HO_ENEMYTYPE = (function() {
  return {
    // warzone
    soldier_1: {
        attack: 1.75,
        health: 50,
        sigil: {
            rifle_gun: 1
        }
    },
    soldier_2: {
        attack: 1.75,
        health: 45,
        sigil: {
            rifle_gun: 1,
            war_grenade: 1
        }
    },
    soldier_3: {
        attack: 1.6,
        health: 50,
        sigil: {
            rifle_gun: 1,
            war_bandage: 1
        }
    },
    officer_1: {
        attack: 1,
        health: 80,
        sigil: {
            pistol_gun: 1
        }
    },
    officer_2: {
        attack: 1,
        health: 72.5,
        sigil: {
            pistol_gun: 1,
            war_grenade: 1
        }
    },
    officer_3: {
        attack: 0.9,
        health: 80,
        sigil: {
            pistol_gun: 1,
            war_bandage: 1
        }
    },
    hunter: {
        attack: 1.2,
        health: 55,
        sigil: {
            shotgun_gun: 1,
            war_grenade: 2,
            war_bandage: 2
        }
    },
    sniper: {
        attack: 1.5,
        health: 40,
        stats: {
            critChance_base: 0.25,
            critMult_base: 0.5
        },
        sigil: {
            sniper_gun: 1
        }
    },
    armed_skeleton: {
        attack: 2,
        health: 50,
        sigil: {
            rifle_gun: 1,
            war_grenade: 5,
            war_bandage: 5
        }
    },

    // monkey jungle
    strongMonkey: {
        attack: 2.5,
        health: 40,
        stats: {
            physicTaken_mult: 1.25,
            magicTaken_mult: 0.75,
        },
        sigil: {}
    },
    angryMonkey: {
        attack: 1.7,
        health: 35,
        stats: {
            physicTaken_mult: 1.25,
            magicTaken_mult: 0.75,
            critChance_base: 0.4,
            critMult_base: 1.25,
        },
        sigil: {}
    },
    dartMonkey: {
        attack: 1.8,
        health: 45,
        stats: {
            physicTaken_mult: 1.25,
            magicTaken_mult: 0.75,
        },
        sigil: {
            monkey_dart: 1
        }
    },
    monkeyWizard_1: {
        attack: 1.75,
        health: 50,
        stats: {
            physicTaken_mult: 0.75,
            magicTaken_mult: 1.25,
        },
        sigil: {
            monkey_fire: 1
        }
    },
    monkeyWizard_2: {
        attack: 1.75,
        health: 50,
        stats: {
            physicTaken_mult: 0.75,
            magicTaken_mult: 1.25,
        },
        sigil: {
            monkey_ice: 1
        }
    },
    monkeyWizard_3: {
        attack: 1.75,
        health: 50,
        stats: {
            physicTaken_mult: 0.75,
            magicTaken_mult: 1.25,
        },
        sigil: {
            monkey_lightning: 1
        }
    },
    monkeyDefender: {
        attack: 2,
        health: 50,
        stats: {
            physicTaken_mult: 0.1,
            magicTaken_mult: 1.5,
        },
        sigil: {}
    },
    monkeyMonk: {
        attack: 2,
        health: 50,
        stats: {
            physicTaken_mult: 1.5,
            magicTaken_mult: 0.1,
        },
        sigil: {}
    },

    // love island
    puppy: {
        attack: 1.4,
        health: 60,
        sigil: {
            cute_bark: 1,
            cute_bite: 1,
        }
    },
    kitten: {
        attack: 2.8,
        health: 30,
        sigil: {
            cute_claws: 1,
        }
    },
    seal: {
        attack: 1.6,
        health: 60,
        sigil: {
            cute_ram: 1,
        }
    },
    piglet: {
        attack: 0.8,
        health: 90,
        sigil: {
            cute_ram: 1,
            cute_eatCarrot: 1,
        }
    },
    panda: {
        attack: 2.5,
        health: 35,
        sigil: {
            cute_ram: 2,
        }
    },
    koala: {
        attack: 2.2,
        health: 40,
        sigil: {
            cute_kick: 1,
            cute_bite: 1,
        }
    },
    rabbit: {
        attack: 1.1,
        health: 70,
        sigil: {
            cute_kick: 1,
            cute_eatCarrot: 1,
        }
    },
    guineaPig: {
        attack: 1.6,
        health: 70,
        sigil: {}
    },
};
})();
const HO_BOSS = (function() {
  return {
    ohilio_guard1: {
        attack: 0.15,
        health: 150,
        textShadow: '1px 1px 2px palevioletred, 0 0 25px lightpink, 0 0 5px pink',
        sigil: {
            shotgun_gun: 3,
            war_bandage: 3,
        },
        stats: {}
    },
    ohilio_guard2: {
        attack: 0.6125,
        health: 45,
        textShadow: '1px 1px 2px palevioletred, 0 0 25px lightpink, 0 0 5px pink',
        sigil: {
            rifle_gun: 3,
            war_grenade: 2,
        },
        stats: {}
    },
    ohilio: {
        attack: 0.01,
        health: 0.00000001,
        textShadow: '1px 1px 2px palevioletred, 0 0 25px lightpink, 0 0 5px pink',
        sigil: {
            ohilio_megagun: 1,
        },
        stats: {}
    },
    mina: {
        attack: 0.5,
        health: 87.5,
        textShadow: '1px 1px 2px palevioletred, 0 0 25px lightpink, 0 0 5px pink',
        sigil: {
            mina_charm: 1,
        },
        stats: {
            toxic_base: 0.03,
            execute_base: 0.2
        }
    },
    chriz1: {
        attack: 0.375,
        health: 42.5,
        textShadow: '1px 1px 2px blue',
        sigil: {
            chriz_magicMissile: 1,
            chriz_fireball: 1,
            chriz_iceBlast: 1,
            chriz_lightningStrike: 1,
            chriz_heal: 1,
        },
        stats: {
            magicConversion_base: 4,
            physicTaken_mult: 0.01,
            magicTaken_mult: 1.75,
        }
    },
    chriz2: {
        attack: 0.5,
        health: 50,
        textShadow: '1px 1px 2px red',
        sigil: {},
        stats: {
            critChance_base: 0.35,
            critMult_base: 3,
            physicTaken_mult: 1.75,
            magicTaken_mult: 0.01,
        }
    }
};
})();
const HO_TRINKET = (function() {
const needsEnergy = true;
const needsMana = true;
  return {
    vitality: {color: 'green', icon: 'mdi-heart', effect: [
        {name: 'hordeHealth', type: 'base', value: lvl => lvl * 70 + 30}
    ]},
    energy: {color: 'amber', icon: 'mdi-lightning-bolt', needsEnergy, effect: [
        {name: 'hordeEnergy', type: 'base', value: lvl => lvl * 35 + 20}
    ]},
    magic: {color: 'blue', icon: 'mdi-water', needsMana, effect: [
        {name: 'hordeMana', type: 'base', value: lvl => lvl * 25 + 15}
    ]},
    fists: {
        color: 'orange-red',
        icon: 'mdi-arm-flex',
        needsEnergy,
        cooldown: () => 15,
        activeCost: () => {return {energy: 25};},
        active(lvl) {
            return [
                {type: 'damagePhysic', value: lvl * 0.4 + 3.1, str: 0.25}
            ];
        },
        activeType: 'combat'
    },
    sparks: {
        color: 'light-blue',
        icon: 'mdi-shimmer',
        rarity: 10,
        needsMana,
        cooldown: () => 9,
        activeCost: () => {return {mana: 2};},
        active(lvl) {
            return [
                {type: 'damageMagic', value: lvl * 0.55 + 3.65, int: 0.35}
            ];
        },
        activeType: 'combat'
    },
    haste: {color: 'pale-yellow', icon: 'mdi-timer-sand', rarity: 20, effect: [
        {name: 'hordeHaste', type: 'base', value: lvl => lvl * 4 + 8}
    ]},
    precision: {color: 'orange', icon: 'mdi-bullseye', rarity: 30, effect: [
        {name: 'hordeCritChance', type: 'base', value: lvl => lvl * 0.03 + 0.07}
    ]},
    wrath: {color: 'orange-red', icon: 'mdi-emoticon-angry', rarity: 40, effect: [
        {name: 'hordeCritMult', type: 'base', value: lvl => lvl * 0.08 + 0.3}
    ]},
    strength: {color: 'red', icon: 'mdi-arm-flex', rarity: 50, effect: [
        {name: 'hordeStrength', type: 'base', value: lvl => lvl * 3 + 5}
    ]},
    toxins: {
        color: 'light-green',
        icon: 'mdi-clouds',
        rarity: 60,
        cooldown: () => 135,
        activeCost: () => {return {};},
        active(lvl) {
            return [
                {type: 'maxdamageBio', value: lvl * 0.015 + 0.09},
                {type: 'removeAttack', value: lvl * 0.005 + 0.05}
            ];
        },
        activeType: 'combat'
    },
    wisdom: {color: 'indigo', icon: 'mdi-lightbulb-on', rarity: 70, effect: [
        {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 3 + 5}
    ]},
    extraction: {color: 'red', icon: 'mdi-water', rarity: 80, effect: [
        {name: 'currencyHordeBloodGain', type: 'mult', value: lvl => lvl * 0.04 + 1.16}
    ]},
    learning: {color: 'deep-purple', icon: 'mdi-school', rarity: 90, isTimeless: true, effect: [
        {name: 'hordeSkillPointsPerLevel', type: 'base', value: () => 1}
    ]},
    preservation: {color: 'red', icon: 'mdi-iv-bag', rarity: 100, effect: [
        {name: 'currencyHordeBloodCap', type: 'mult', value: lvl => lvl * 0.06 + 1.24}
    ]},
    energize: {
        color: 'amber',
        icon: 'mdi-battery',
        rarity: 110,
        isTimeless: true,
        needsEnergy,
        cooldown: () => 270,
        activeCost: () => {return {};},
        active() {
            return [
                {type: 'refillEnergy', value: 1}
            ];
        },
        activeType: 'combat'
    },
    automation: {color: 'dark-grey', icon: 'mdi-cogs', rarity: 120, isTimeless: true, effect: [
        {name: 'hordeAutocast', type: 'base', value: () => 1}
    ]},
    cure: {
        color: 'teal',
        icon: 'mdi-heart',
        rarity: 130,
        isTimeless: true,
        cooldown: () => 45,
        activeCost: () => {return {};},
        active() {
            return [
                {type: 'heal', value: 0.05, int: 0.0005},
                {type: 'removeStun', value: null}
            ];
        },
        usableInStun: true,
        activeType: 'combat'
    },

    // Boss-specific trinkets
    stone: {color: 'grey', icon: 'mdi-chart-bubble', rarity: 30, uniqueToBoss: 'ohilio', effect: [
        {name: 'hordeHealth', type: 'mult', value: lvl => lvl * 0.12 + 1.3},
        {name: 'hordeHealing', type: 'mult', value: lvl => 1 / (lvl * 0.12 + 1.5)}
    ]},
    duality: {color: 'purple', icon: 'mdi-call-split', rarity: 75, uniqueToBoss: 'chriz2', effect: [
        {name: 'hordeStrength', type: 'base', value: lvl => lvl * 2 + 4},
        {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 2 + 4}
    ]},
    love: {
        color: 'babypink',
        icon: 'mdi-heart-multiple',
        rarity: 120,
        uniqueToBoss: 'mina',
        cooldown: () => 70,
        activeCost: () => {return {};},
        active(lvl) {
            return [
                {type: 'damageBio', value: lvl * 0.9 + 8.7},
                {type: 'buff', value: lvl + 14, effect: [
                    {type: 'mult', name: 'hordeBioAttack', value: 1.35},
                ]}
            ];
        },
        activeType: 'combat'
    },
};
})();
const HO_ELEMENT = (function() {
  return {
    ice: {
        minZone: 350,
        enemyStats: power => {
            return {
                attack: {type: 'mult', amount: Math.pow(1.01, (power + 10) * 3)},
                health: {type: 'mult', amount: Math.pow(1.01, (power + 10) * 7)},
            };
        },
        enemyActives: power => {
            let obj = {};
            if (power > 0) {
                obj.permafrost = {
                    icon: 'mdi-landslide',
                    color: 'skyblue',
                    effect: [
                        {type: 'removeAttack', value: getApproaching(0.01, 1, power)}
                    ],
                    cooldown: 10,
                    startCooldown: 10,
                    uses: null
                };
            }
            if (power >= 20) {
                obj.freeze = {
                    icon: 'mdi-snowflake',
                    color: 'dark-blue',
                    effect: [
                        {type: 'damageMagic', value: power * 0.1 + 0.75},
                        {type: 'stun', value: Math.floor(power / 5) + 1}
                    ],
                    cooldown: 22,
                    startCooldown: Math.max(0, 42 - power),
                    uses: power - 19
                };
            }
            return obj;
        },
        playerElemental: lvl => {
            return [
                {type: 'tag', name: 'hordeReduceAttackOnAttack', value: [0.04, lvl]}
            ];
        },
        playerUpgrade: lvl => {
            return [
                {type: 'mult', name: 'hordeHealth', value: Math.pow(1.1, lvl)}
            ];
        },
    },
    thunder: {
        minZone: 375,
        enemyStats: power => {
            return {
                attack: {type: 'mult', amount: Math.pow(1.01, (power + 10) * 7)},
                health: {type: 'mult', amount: Math.pow(1.01, (power + 10) * 3)},
            };
        },
        enemyActives: power => {
            let obj = {};
            if (power > 0) {
                obj.shock = {
                    icon: 'mdi-flash',
                    color: 'orange',
                    effect: [
                        {type: 'damageMagic', value: power * 0.1 + 2.65}
                    ],
                    cooldown: 1,
                    startCooldown: 0,
                    uses: power
                };
            }
            if (power >= 20) {
                obj.shockwave = {
                    icon: 'mdi-decagram-outline',
                    color: 'yellow',
                    effect: [
                        {type: 'damageMagic', value: power * 0.6 - 3.5},
                        {type: 'silence', value: Math.floor(power / 4) + 2}
                    ],
                    cooldown: 18,
                    startCooldown: Math.max(0, 38 - power),
                    uses: power - 19
                };
            }
            return obj;
        },
        playerElemental: lvl => {
            return [
                {type: 'base', name: 'hordeFirstStrike', value: lvl * 0.35}
            ];
        },
        playerUpgrade: lvl => {
            return [
                {type: 'mult', name: 'hordeAttack', value: Math.pow(1.1, lvl)}
            ];
        },
    },
    water: {
        minZone: 400,
        enemyStats: power => {
            return {
                attack: {type: 'mult', amount: Math.pow(1.01, (power + 10) * 5)},
                health: {type: 'mult', amount: Math.pow(1.01, (power + 10) * 5)},
            };
        },
        enemyActives: power => {
            let obj = {};
            if (power > 0) {
                obj.waterBolt = {
                    icon: 'mdi-vector-line',
                    color: 'blue',
                    effect: [
                        {type: 'damageMagic', value: power * 0.3 + 2},
                        {type: 'heal', value: power * 0.01 + 0.05}
                    ],
                    cooldown: 14,
                    startCooldown: 14,
                    uses: power
                };
            }
            if (power >= 20) {
                obj.wave = {
                    icon: 'mdi-waves',
                    color: 'dark-blue',
                    effect: [
                        {type: 'damageMagic', value: power * 0.8 - 2}
                    ],
                    cooldown: 27,
                    startCooldown: Math.max(0, 47 - power),
                    uses: power - 19
                };
            }
            return obj;
        },
        playerElemental: lvl => {
            return [
                {type: 'base', name: 'hordeRecovery', value: lvl * 0.008}
            ];
        },
        playerUpgrade: lvl => {
            return [
                {type: 'mult', name: 'currencyHordeBoneGain', value: Math.pow(1.15, lvl)}
            ];
        },
    },
};
})();
const HO_ADVENTURER = (function() {
  return {
    icon: 'mdi-bag-personal',
    baseStats: {
        attack: 5,
        health: 500,
        energy: 200,
        energyRegen: 1,
        mana: 120,
        manaRegen: 0.01
    },
    exp: {
        base: 600,
        increment: 1.2
    },
    skills: {
        energyConvert: {
            type: 'passive',
            color: 'amber',
            icon: 'mdi-lightning-bolt',
            max: 1,
            effect: [
                {name: 'hordeEnergyToStr', type: 'tag', value: lvl => [lvl * 0.02]},
                {name: 'hordeEnergyToEnergyReg', type: 'tag', value: lvl => [lvl * 0.005]}
            ]
        },
        stab: {
            type: 'active',
            color: 'red',
            icon: 'mdi-knife',
            max: 1,
            cooldown: () => 8,
            activeCost: () => {return {energy: 30};},
            active() {
                return [
                    {type: 'damagePhysic', value: 2, str: 0.1, int: 0.1}
                ];
            },
            activeType: 'combat'
        },
        combatHeal: {
            type: 'active',
            color: 'pale-orange',
            icon: 'mdi-bandage',
            max: 5,
            cost: 20,
            cooldown: () => 25,
            activeCost: () => {return {mana: 3};},
            active(lvl) {
                return [
                    {type: 'heal', value: lvl * 0.03 + 0.05, int: 0.002}
                ];
            },
            activeType: 'combat'
        },
        health: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 70}
        ]},
        strength: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeStrength', type: 'base', value: lvl => lvl * 1.3}
        ]},
        energy: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeEnergy', type: 'base', value: lvl => lvl * 40}
        ]},
        brawl: {
            type: 'active',
            color: 'orange',
            icon: 'mdi-arm-flex',
            max: 5,
            cost: 20,
            cooldown: () => 60,
            activeCost: () => {return {energy: 140};},
            active(lvl) {
                return [
                    {type: 'buff', value: 18, effect: [
                        {type: 'base', name: 'hordeStrength', value: 10 * lvl},
                        {type: 'mult', name: 'hordeAttack', value: 1.3}
                    ]}
                ];
            },
            activeType: 'combat'
        },
        strength_2: {type: 'stat', max: 15, cost: 10, effect: [
            {name: 'hordeStrength', type: 'base', value: lvl => lvl * 1.5}
        ]},
        spark: {
            type: 'active',
            color: 'light-blue',
            icon: 'mdi-flare',
            max: 5,
            cost: 20,
            cooldown: () => 6,
            activeCost: () => {return {mana: 2};},
            active(lvl) {
                return [
                    {type: 'damageMagic', value: lvl * 0.75 + 3.75, int: 0.35}
                ];
            },
            activeType: 'combat'
        },
        intelligence: {type: 'stat', max: 15, cost: 10, effect: [
            {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 1.8}
        ]},
        smash: {
            type: 'active',
            color: 'brown',
            icon: 'mdi-anvil',
            max: 5,
            cost: 20,
            cooldown: () => 22,
            activeCost: () => {return {energy: 60};},
            active(lvl) {
                return [
                    {type: 'damagePhysic', value: 3.75},
                    {type: 'stun', value: lvl + 5}
                ];
            },
            activeType: 'combat'
        },
        haste: {type: 'stat', max: 15, cost: 10, effect: [
            {name: 'hordeHaste', type: 'base', value: lvl => lvl * 4},
            {name: 'hordeEnergy', type: 'base', value: lvl => lvl * 10}
        ]},
        lootSearch: {
            type: 'active',
            color: 'light-green',
            icon: 'mdi-sack',
            max: 5,
            cost: 20,
            cooldown: () => SECONDS_PER_HOUR,
            activeCost: () => {return {};},
            active(lvl) {
                return [
                    {type: 'blood', value: lvl * 10 + 30}
                ];
            },
            activeType: 'utility'
        },
        damage: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeAttack', type: 'base', value: lvl => lvl * 0.15}
        ]},
        energy_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeEnergy', type: 'base', value: lvl => lvl * 40}
        ]},
        haste_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHaste', type: 'base', value: lvl => lvl * 4}
        ]},
        recovery: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 25},
            {name: 'hordeRecovery', type: 'base', value: lvl => lvl * 0.008}
        ]},
        doubleStrike: {
            type: 'active',
            color: 'purple',
            icon: 'mdi-fencing',
            max: 5,
            cost: 20,
            cooldown: () => 13,
            activeCost: () => {return {energy: 50, mana: 1};},
            active(lvl) {
                return [
                    {type: 'damagePhysic', value: lvl * 0.15 + 1.25, str: 0.15},
                    {type: 'damageMagic', value: lvl * 0.25 + 1.75, int: 0.25},
                ];
            },
            activeType: 'combat'
        },
        smallFireball: {
            type: 'active',
            color: 'orange-red',
            icon: 'mdi-fire-circle',
            max: 5,
            cost: 20,
            cooldown: () => 18,
            activeCost: () => {return {mana: 6};},
            active(lvl) {
                return [
                    {type: 'damageMagic', value: lvl * 1.5 + 9.5, int: 0.8}
                ];
            },
            activeType: 'combat'
        },
        damage_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeAttack', type: 'base', value: lvl => lvl * 0.15}
        ]},
        health_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 70}
        ]},
        mana: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeMana', type: 'base', value: lvl => lvl * 20}
        ]},
        fullRecovery: {
            type: 'active',
            color: 'green',
            icon: 'mdi-medication',
            max: 5,
            cost: 20,
            cooldown: lvl => 140 - lvl * 10,
            activeCost: lvl => {return {mana: 19 - lvl};},
            active(lvl) {
                return [
                    {type: 'heal', value: lvl * 0.075 + 0.375, int: 0.01},
                    {type: 'antidote', value: 1},
                    {type: 'removeStun', value: null},
                ];
            },
            activeType: 'combat'
        },
        strength_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeStrength', type: 'base', value: lvl => lvl * 1.3}
        ]},
        intelligence_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 1.6}
        ]},
        energy_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeEnergy', type: 'base', value: lvl => lvl * 40}
        ]},
        mana_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeMana', type: 'base', value: lvl => lvl * 20}
        ]},
        blood: {type: 'stat', max: 20, cost: 15, effect: [
            {name: 'currencyHordeBloodGain', type: 'mult', value: lvl => getSequence(3, lvl) * 0.05 + 1},
            {name: 'currencyHordeBloodCap', type: 'mult', value: lvl => getSequence(3, lvl) * 0.05 + 1}
        ]},
        courage: {type: 'stat', max: 20, cost: 15, effect: [
            {name: 'hordeCourageScore', type: 'mult', value: lvl => lvl * 0.02 + 1}
        ]},
        supercharge: {
            type: 'active',
            color: 'amber',
            icon: 'mdi-lightning-bolt',
            max: 5,
            cost: 20,
            cooldown: () => HORDE_STACKING_COOLDOWN,
            activeCost: () => {return {};},
            active(lvl) {
                return [
                    {type: 'permanentStat', stat: 'hordeEnergy_base', value: lvl * 5 + 5}
                ];
            },
            activeType: 'utility'
        },
        damage_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeAttack', type: 'base', value: lvl => lvl * 0.15}
        ]},
        health_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 70}
        ]},
        energy_4: {type: 'stat', max: 20, cost: 10, effect: [
            {name: 'hordeEnergy', type: 'base', value: lvl => lvl * 40}
        ]},
        strength_4: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeStrength', type: 'base', value: lvl => lvl * 1.3}
        ]},
        intelligence_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 1.6}
        ]},
        damage_4: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeAttack', type: 'base', value: lvl => lvl * 0.15}
        ]},
        health_4: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 70}
        ]},
        energy_5: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeEnergy', type: 'base', value: lvl => lvl * 40}
        ]},
        mana_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeMana', type: 'base', value: lvl => lvl * 20}
        ]},
        intelligence_4: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 1.6}
        ]},
        haste_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHaste', type: 'base', value: lvl => lvl * 4}
        ]},
    },
    skillTree: [
        {isInnate: true, level: 0, items: ['energyConvert', 'stab']},
        {level: 1, items: ['combatHeal', 'health', 'strength', 'energy']},
        {isChoice: true, level: 10, items: [['brawl', 'strength_2'], ['spark', 'intelligence'], ['smash', 'haste']]},
        {level: 20, items: ['lootSearch', 'damage', 'energy_2', 'haste_2', 'recovery']},
        {level: 30, items: ['doubleStrike', 'smallFireball', 'damage_2', 'health_2', 'mana']},
        {level: 40, items: ['fullRecovery', 'strength_3', 'intelligence_2', 'energy_3', 'mana_2']},
        {isChoice: true, level: 50, items: [['blood'], ['courage'], ['supercharge']]},
        {level: 75, items: ['damage_3', 'health_3', 'energy_4', 'strength_4', 'intelligence_3']},
        {level: 100, items: ['damage_4', 'health_4', 'energy_5', 'mana_3', 'intelligence_4', 'haste_3']},
    ],
    quests: {
        stat: [
            {stat: 'hordeHealth', type: 'base', value: 1000},
            {stat: 'hordeIntelligence', type: 'total', value: 20},
            {stat: 'hordeStrength', type: 'total', value: 65},
            {stat: 'hordeEnergy', type: 'total', value: 1000},
            {stat: 'hordeHealth', type: 'base', value: 1850},
            {stat: 'hordeEnergy', type: 'total', value: 1650},
            {stat: 'hordeStrength', type: 'total', value: 125},
        ],
        zone: [
            {area: 'warzone', zone: '1'},
            {area: 'warzone', zone: '3'},
            {area: 'warzone', zone: '5'},
            {area: 'warzone', zone: '10'},
            {area: 'monkeyJungle', zone: '7'},
            {area: 'monkeyJungle', zone: '14'},
            {area: 'loveIsland', zone: '1'},
            {area: 'loveIsland', zone: '8'},
        ],
        level: [7, 15, 25, 40, 60, 80, 100, 125, 150, 175, 200],
        boss: [
            {boss: 'ohilio', difficulty: 3},
            {boss: 'chriz2', difficulty: 5},
            {boss: 'mina', difficulty: 15},
        ]
    }
};
})();
const HO_ARCHER = (function() {
  return {
    unlock: 'hordeClassArcher',
    icon: 'mdi-bow-arrow',
    baseStats: {
        attack: 7,
        health: 325,
        energy: 150,
        energyRegen: 1.25
    },
    exp: {
        base: 720,
        increment: 1.22
    },
    courageMult: 1.5,
    skills: {
        critMult: {type: 'stat', max: 1, effect: [
            {name: 'hordeCritMult', type: 'base', value: lvl => lvl * 3.5}
        ]},
        energyOnCrit: {
            type: 'passive',
            color: 'amber',
            icon: 'mdi-lightning-bolt',
            max: 1,
            effect: [
                {name: 'hordeEnergyOnCrit', type: 'tag', value: lvl => [lvl * 15]}
            ]
        },
        longshot: {
            type: 'active',
            color: 'skyblue',
            icon: 'mdi-arrow-projectile',
            max: 1,
            cooldown: () => 10,
            activeCost: () => {return {energy: 50};},
            active() {
                return [
                    {type: 'damagePhysic', value: 3.25, str: 0.45, canCrit: 0.75}
                ];
            },
            activeType: 'combat'
        },
        eagleEye: {
            type: 'active',
            color: 'light-green',
            icon: 'mdi-eye',
            max: 5,
            cost: 20,
            cooldown: () => 45,
            activeCost: () => {return {energy: 100};},
            active(lvl) {
                return [
                    {type: 'buff', value: 12, effect: [
                        {type: 'base', name: 'hordeCritChance', value: lvl * 0.05 + 0.05}
                    ]}
                ];
            },
            activeType: 'combat'
        },
        strength: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeStrength', type: 'base', value: lvl => lvl * 1.3}
        ]},
        critMult_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeCritMult', type: 'base', value: lvl => lvl * 0.2}
        ]},
        energy: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeEnergy', type: 'base', value: lvl => lvl * 40}
        ]},
        recovery: {type: 'stat', max: 5, cost: 20, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 80},
            {name: 'hordeRecovery', type: 'base', value: lvl => lvl * 0.004}
        ]},
        fireArrows: {
            type: 'active',
            color: 'orange-red',
            icon: 'mdi-fire',
            max: 5,
            cost: 20,
            cooldown: () => 90,
            activeCost: () => {return {energy: 125};},
            active(lvl) {
                return [
                    {type: 'buff', value: 30, effect: [
                        {type: 'mult', name: 'hordeAttack', value: lvl * 0.05 + 1.25},
                        {type: 'base', name: 'hordeMagicConversion', value: 1.75}
                    ]}
                ];
            },
            activeType: 'combat'
        },
        poisonArrow: {
            type: 'active',
            color: 'lime',
            icon: 'mdi-bottle-tonic-skull',
            max: 5,
            cost: 20,
            cooldown: () => 56,
            activeCost: () => {return {energy: 140};},
            active(lvl) {
                return [
                    {type: 'poison', value: lvl * 0.15 + 0.35, int: 0.02}
                ];
            },
            activeType: 'combat'
        },
        damage: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeAttack', type: 'base', value: lvl => lvl * 0.2}
        ]},
        critChance: {type: 'stat', max: 5, cost: 20, effect: [
            {name: 'hordeCritChance', type: 'base', value: lvl => lvl * 0.03}
        ]},
        intelligence: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 1.75}
        ]},
        healOnCrit: {
            type: 'passive',
            color: 'light-green',
            icon: 'mdi-heart-plus',
            max: 1,
            cost: 50,
            effect: [
                {name: 'hordeHealOnCrit', type: 'tag', value: lvl => [lvl * 0.03]}
            ]
        },
        health: {type: 'stat', max: 15, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 65}
        ]},
        reduceCooldownOnCrit: {
            type: 'passive',
            color: 'pale-orange',
            icon: 'mdi-timer-sand-paused',
            max: 1,
            cost: 50,
            effect: [
                {name: 'hordeRestoreCooldownOnCrit', type: 'tag', value: lvl => [lvl]}
            ]
        },
        haste: {type: 'stat', max: 15, cost: 10, effect: [
            {name: 'hordeHaste', type: 'base', value: lvl => lvl * 4},
            {name: 'hordeEnergy', type: 'base', value: lvl => lvl * 10}
        ]},
        bloodOnCrit: {
            type: 'passive',
            color: 'cherry',
            icon: 'mdi-diabetes',
            max: 1,
            cost: 50,
            effect: [
                {name: 'hordeBloodOnCrit', type: 'tag', value: lvl => [lvl * 0.15]}
            ]
        },
        blood: {type: 'stat', max: 15, cost: 10, effect: [
            {name: 'currencyHordeBloodCap', type: 'mult', value: lvl => lvl * 0.13 + 1}
        ]},
        shockArrow: {
            type: 'active',
            color: 'light-blue',
            icon: 'mdi-flash-alert',
            max: 5,
            cost: 20,
            cooldown: () => 24,
            activeCost: () => {return {energy: 110};},
            active(lvl) {
                return [
                    {type: 'damageMagic', value: lvl * 1.3 + 4.1, int: 0.55, canCrit: lvl * 0.1},
                    {type: 'silence', value: lvl + 5}
                ];
            },
            activeType: 'combat'
        },
        critChance_2: {type: 'stat', max: 5, cost: 20, effect: [
            {name: 'hordeCritChance', type: 'base', value: lvl => lvl * 0.03}
        ]},
        energy_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeEnergy', type: 'base', value: lvl => lvl * 40}
        ]},
        health_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 60}
        ]},
        intelligence_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 1.75}
        ]},
        sharpArrow: {
            type: 'active',
            color: 'red',
            icon: 'mdi-arrow-projectile-multiple',
            max: 5,
            cost: 20,
            cooldown: () => 7,
            activeCost: () => {return {energy: 30};},
            active(lvl) {
                return [
                    {type: 'damagePhysic', value: lvl * 0.4 + 1.2, str: 0.2, canCrit: lvl * 0.15},
                    {type: 'removeDivisionShield', value: 1}
                ];
            },
            activeType: 'combat'
        },
        strength_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeStrength', type: 'base', value: lvl => lvl * 1.3}
        ]},
        health_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 60}
        ]},
        haste_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHaste', type: 'base', value: lvl => lvl * 4}
        ]},
        sharpMind: {
            type: 'active',
            color: 'orange-red',
            icon: 'mdi-motion',
            max: 5,
            cost: 20,
            cooldown: () => HORDE_STACKING_COOLDOWN,
            activeCost: () => {return {};},
            active(lvl) {
                return [
                    {type: 'permanentStat', stat: 'hordeCritMult_base', value: lvl * 0.02 + 0.02}
                ];
            },
            activeType: 'utility'
        },
        forestBlessing: {
            type: 'active',
            color: 'green',
            icon: 'mdi-tree',
            max: 5,
            cost: 20,
            cooldown: () => 300,
            activeCost: () => {return {energy: 500};},
            active(lvl) {
                return [
                    {type: 'buff', value: lvl * 10 + 40, effect: [
                        {type: 'base', name: 'hordeStrength', value: lvl * 4},
                        {type: 'base', name: 'hordeIntelligence', value: lvl * 4},
                        {type: 'base', name: 'hordeEnergyRegen', value: 20},
                        {type: 'base', name: 'hordeHaste', value: 100},
                        {type: 'base', name: 'hordeRecovery', value: 0.15},
                    ]}
                ];
            },
            activeType: 'combat'
        },
        critChance_3: {type: 'stat', max: 5, cost: 20, effect: [
            {name: 'hordeCritChance', type: 'base', value: lvl => lvl * 0.03}
        ]},
        damage_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeAttack', type: 'base', value: lvl => lvl * 0.2}
        ]},
        courage: {type: 'stat', max: 10, cost: 15, effect: [
            {name: 'hordeCourageScore', type: 'mult', value: lvl => lvl * 0.02 + 1}
        ]},
        damage_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeAttack', type: 'base', value: lvl => lvl * 0.2}
        ]},
        health_4: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 60}
        ]},
        critMult_3: {type: 'stat', max: 20, cost: 10, effect: [
            {name: 'hordeCritMult', type: 'base', value: lvl => lvl * 0.2}
        ]},
        strength_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeStrength', type: 'base', value: lvl => lvl * 1.3}
        ]},
        recovery_2: {type: 'stat', max: 5, cost: 20, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 80},
            {name: 'hordeRecovery', type: 'base', value: lvl => lvl * 0.004}
        ]},
        damage_4: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeAttack', type: 'base', value: lvl => lvl * 0.2}
        ]},
        health_5: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 60}
        ]},
        critChance_4: {type: 'stat', max: 5, cost: 20, effect: [
            {name: 'hordeCritChance', type: 'base', value: lvl => lvl * 0.03}
        ]},
        intelligence_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 1.75}
        ]},
        haste_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHaste', type: 'base', value: lvl => lvl * 4}
        ]},
        energy_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeEnergy', type: 'base', value: lvl => lvl * 40}
        ]},
    },
    skillTree: [
        {isInnate: true, level: 0, items: ['critMult', 'energyOnCrit', 'longshot']},
        {level: 1, items: ['eagleEye', 'strength', 'critMult_2', 'energy', 'recovery']},
        {level: 10, items: ['fireArrows', 'poisonArrow', 'damage', 'critChance', 'intelligence']},
        {isChoice: true, level: 20, items: [['healOnCrit', 'health'], ['reduceCooldownOnCrit', 'haste'], ['bloodOnCrit', 'blood']]},
        {level: 30, items: ['shockArrow', 'critChance_2', 'energy_2', 'health_2', 'intelligence_2']},
        {level: 40, items: ['sharpArrow', 'sharpMind', 'strength_2', 'health_3', 'haste_2']},
        {level: 50, items: ['forestBlessing', 'critChance_3', 'damage_2', 'courage']},
        {level: 75, items: ['damage_3', 'health_4', 'critMult_3', 'strength_3', 'recovery_2']},
        {level: 100, items: ['damage_4', 'health_5', 'critChance_4', 'intelligence_3', 'haste_3', 'energy_3']},
    ],
    quests: {
        stat: [
            {stat: 'hordeCritMult', type: 'total', value: 7},
            {stat: 'hordeCritChance', type: 'total', value: 0.6},
            {stat: 'hordeHealth', type: 'base', value: 1250},
            {stat: 'hordeIntelligence', type: 'total', value: 35},
            {stat: 'hordeHaste', type: 'total', value: 120},
            {stat: 'hordeCritChance', type: 'total', value: 1.1},
            {stat: 'hordeStrength', type: 'total', value: 85},
        ],
        zone: [
            {area: 'warzone', zone: '4'},
            {area: 'warzone', zone: '8'},
            {area: 'monkeyJungle', zone: '5'},
            {area: 'monkeyJungle', zone: '12'},
            {area: 'monkeyJungle', zone: '16'},
            {area: 'loveIsland', zone: '3'},
            {area: 'loveIsland', zone: '11'},
        ],
        level: [10, 20, 35, 50, 70, 95, 120, 145, 170, 195],
        boss: [
            {boss: 'ohilio', difficulty: 7},
            {boss: 'chriz2', difficulty: 10},
            {boss: 'mina', difficulty: 10},
        ]
    }
};
})();
const HO_ASSASSIN = (function() {
  return {
    unlock: 'hordeClassAssassin',
    icon: 'mdi-robber',
    baseStats: {
        attack: 8.5,
        health: 275,
        mana: 90,
        manaRegen: 0.01
    },
    exp: {
        base: 2700,
        increment: 1.5
    },
    courageMult: 20,
    skills: {
        sneak: {
            type: 'passive',
            color: 'pale-light-blue',
            icon: 'mdi-shoe-sneaker',
            max: 1,
            effect: [
                {name: 'hordeRespawnFaster', type: 'text', value: lvl => lvl >= 1}
            ]
        },
        elementOfSurprise: {
            type: 'passive',
            color: 'red',
            icon: 'mdi-account-question',
            max: 3,
            cost: 50,
            effect: [
                {name: 'hordeFirstAttacksCrit', type: 'tag', value: lvl => [lvl]}
            ]
        },
        backstab: {
            type: 'active',
            color: 'orange-red',
            icon: 'mdi-knife-military',
            max: 1,
            cooldown: () => 5,
            activeCost: () => {return {mana: 1};},
            active() {
                return [
                    {type: 'damageMagic', value: 3.25, str: 0.2, int: 0.4, canCrit: 0.5}
                ];
            },
            activeType: 'combat'
        },
        smokeBomb: {
            type: 'active',
            color: 'dark-grey',
            icon: 'mdi-smoke',
            max: 5,
            cost: 20,
            cooldown: () => 50,
            activeCost: () => {return {mana: 5};},
            active(lvl) {
                return [
                    {type: 'buff', value: lvl + 5, canCrit: lvl * 0.05 + 0.25, effect: [
                        {type: 'mult', name: 'hordePhysicTaken', value: 0.125},
                        {type: 'mult', name: 'hordeMagicTaken', value: 0.5}
                    ]}
                ];
            },
            activeType: 'combat'
        },
        firstStrike: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeFirstStrike', type: 'base', value: lvl => lvl * 0.2}
        ]},
        critMult: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeCritMult', type: 'base', value: lvl => lvl * 0.1}
        ]},
        mana: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeMana', type: 'base', value: lvl => lvl * 15}
        ]},
        comboStrike: {
            type: 'passive',
            color: 'amber',
            icon: 'mdi-fencing',
            max: 1,
            cost: 50,
            effect: [
                {name: 'hordeManasteal', type: 'tag', value: lvl => [lvl]}
            ]
        },
        spellblade: {type: 'stat', max: 15, cost: 10, effect: [
            {name: 'hordeSpellblade', type: 'base', value: lvl => lvl * 0.2}
        ]},
        cursedDagger: {
            type: 'active',
            color: 'deep-purple',
            icon: 'mdi-skull',
            max: 5,
            cost: 20,
            cooldown: () => 220,
            activeCost: () => {return {mana: 10};},
            active(lvl) {
                return [
                    {type: 'buff', value: lvl * 5 + 15, canCrit: lvl * 0.05 + 0.25, effect: [
                        {type: 'mult', name: 'hordeAttack', value: lvl * 0.05 + 1.25},
                        {type: 'base', name: 'hordeMagicConversion', value: 2.5}
                    ]}
                ];
            },
            activeType: 'combat'
        },
        magicAttack: {type: 'stat', max: 15, cost: 10, effect: [
            {name: 'hordeMagicAttack', type: 'mult', value: lvl => lvl * 0.06 + 1}
        ]},
        swiftStrike: {
            type: 'active',
            color: 'deep-orange',
            icon: 'mdi-karate',
            max: 5,
            cost: 20,
            cooldown: () => 18,
            activeCost: () => {return {mana: 3};},
            active(lvl) {
                return [
                    {type: 'damagePhysic', value: lvl * 0.7 + 6.7, str: 0.5, canCrit: lvl * 0.05 + 0.25}
                ];
            },
            activeType: 'combat'
        },
        strength: {type: 'stat', max: 15, cost: 10, effect: [
            {name: 'hordeStrength', type: 'base', value: lvl => lvl * 1.6}
        ]},
        shuriken: {
            type: 'active',
            color: 'light-blue',
            icon: 'mdi-shuriken',
            max: 5,
            cost: 20,
            cooldown: () => 15,
            activeCost: () => {return {mana: 12};},
            active(lvl) {
                return [
                    {type: 'damageMagic', value: lvl * 0.9 + 8.7, str: 0.3, int: 0.7, canCrit: lvl * 0.05 + 0.25}
                ];
            },
            activeType: 'combat'
        },
        knockout: {
            type: 'passive',
            color: 'brown',
            icon: 'mdi-bell-sleep',
            max: 1,
            cost: 50,
            effect: [
                {name: 'hordeStunOnCrit', type: 'tag', value: lvl => [lvl * 3]}
            ]
        },
        intelligence: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 1.5}
        ]},
        critMult_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeCritMult', type: 'base', value: lvl => lvl * 0.1}
        ]},
        mana_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeMana', type: 'base', value: lvl => lvl * 15}
        ]},
        health: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 35}
        ]},
        hiddenExplosive: {
            type: 'active',
            color: 'pink',
            icon: 'mdi-bomb',
            max: 5,
            cost: 20,
            cooldown: lvl => 115 - lvl * 10,
            activeCost: () => {return {mana: 20};},
            active(lvl) {
                return [
                    {type: 'damageMagic', value: lvl * 2.2 + 18.8, int: 1.5, canCrit: lvl * 0.075 + 0.375}
                ];
            },
            activeType: 'combat'
        },
        herbTea: {
            type: 'active',
            color: 'light-green',
            icon: 'mdi-tea',
            max: 5,
            cost: 20,
            cooldown: lvl => 40 - lvl * 4,
            activeCost: () => {return {mana: 14};},
            active(lvl) {
                return [
                    {type: 'heal', value: lvl * 0.025 + 0.175, int: 0.005, canCrit: lvl * 0.05 + 0.25},
                    {type: 'buff', value: lvl + 7, effect: [
                        {type: 'base', name: 'hordeRecovery', value: lvl * 0.02 + 0.1}
                    ]}
                ];
            },
            activeType: 'combat'
        },
        intelligence_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 1.5}
        ]},
        firstStrike_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeFirstStrike', type: 'base', value: lvl => lvl * 0.2}
        ]},
        spellblade_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeSpellblade', type: 'base', value: lvl => lvl * 0.15}
        ]},
        haste: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHaste', type: 'base', value: lvl => lvl * 3}
        ]},
        meditation: {
            type: 'active',
            color: 'blue',
            icon: 'mdi-meditation',
            max: 5,
            cost: 20,
            cooldown: () => 390,
            activeCost: () => {return {mana: 25};},
            active(lvl) {
                return [
                    {type: 'buff', value: lvl * 5 + 25, canCrit: lvl * 0.05 + 0.25, effect: [
                        {type: 'base', name: 'hordeIntelligence', value: lvl * 6},
                        {type: 'base', name: 'hordeFirstStrike', value: lvl * 0.5 + 1},
                        {type: 'base', name: 'hordeSpellblade', value: lvl * 0.3 + 0.3}
                    ]}
                ];
            },
            activeType: 'combat'
        },
        intelligence_3: {type: 'stat', max: 15, cost: 10, effect: [
            {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 1.7}
        ]},
        flow: {
            type: 'passive',
            color: 'cyan',
            icon: 'mdi-waterfall',
            max: 1,
            cost: 50,
            effect: [
                {name: 'hordeManaToHaste', type: 'tag', value: lvl => [lvl * 0.1]}
            ]
        },
        mana_3: {type: 'stat', max: 15, cost: 10, effect: [
            {name: 'hordeMana', type: 'base', value: lvl => lvl * 20}
        ]},
        pickpocket: {
            type: 'passive',
            color: 'cherry',
            icon: 'mdi-hand-extended',
            max: 1,
            cost: 50,
            effect: [
                {name: 'hordeFastKillBonusBlood', type: 'tag', value: lvl => [lvl * 1.25]}
            ]
        },
        blood: {type: 'stat', max: 15, cost: 10, effect: [
            {name: 'currencyHordeBloodCap', type: 'mult', value: lvl => lvl * 0.13 + 1}
        ]},
        secretTechnique: {
            type: 'active',
            color: 'pink-purple',
            icon: 'mdi-spear',
            max: 5,
            cost: 20,
            cooldown: () => HORDE_STACKING_COOLDOWN,
            activeCost: () => {return {};},
            active(lvl) {
                return [
                    {type: 'permanentStat', stat: 'hordeFirstStrike_base', value: lvl * 0.05 + 0.05}
                ];
            },
            activeType: 'utility'
        },
        damage: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeAttack', type: 'base', value: lvl => lvl * 0.25}
        ]},
        intelligence_4: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 1.5}
        ]},
        critMult_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeCritMult', type: 'base', value: lvl => lvl * 0.1}
        ]},
        courage: {type: 'stat', max: 10, cost: 15, effect: [
            {name: 'hordeCourageScore', type: 'mult', value: lvl => lvl * 0.02 + 1}
        ]},
        damage_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeAttack', type: 'base', value: lvl => lvl * 0.25}
        ]},
        health_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 35}
        ]},
        strength_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeStrength', type: 'base', value: lvl => lvl * 1.4}
        ]},
        intelligence_5: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 1.5}
        ]},
        mana_4: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeMana', type: 'base', value: lvl => lvl * 15}
        ]},
        haste_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHaste', type: 'base', value: lvl => lvl * 3}
        ]},
        damage_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeAttack', type: 'base', value: lvl => lvl * 0.25}
        ]},
        health_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 35}
        ]},
        critMult_4: {type: 'stat', max: 20, cost: 10, effect: [
            {name: 'hordeCritMult', type: 'base', value: lvl => lvl * 0.1}
        ]},
        firstStrike_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeFirstStrike', type: 'base', value: lvl => lvl * 0.2}
        ]},
        spellblade_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeSpellblade', type: 'base', value: lvl => lvl * 0.15}
        ]},
    },
    skillTree: [
        {isInnate: true, level: 0, items: ['sneak', 'elementOfSurprise', 'backstab']},
        {level: 1, items: ['smokeBomb', 'firstStrike', 'critMult', 'mana']},
        {isChoice: true, level: 10, items: [['comboStrike', 'spellblade'], ['cursedDagger', 'magicAttack'], ['swiftStrike', 'strength']]},
        {level: 20, items: ['shuriken', 'knockout', 'intelligence', 'critMult_2', 'mana_2', 'health']},
        {level: 30, items: ['hiddenExplosive', 'herbTea', 'intelligence_2', 'firstStrike_2', 'spellblade_2', 'haste']},
        {isChoice: true, level: 40, items: [['meditation', 'intelligence_3'], ['flow', 'mana_3'], ['pickpocket', 'blood']]},
        {level: 50, items: ['secretTechnique', 'damage', 'intelligence_4', 'critMult_3', 'courage']},
        {level: 75, items: ['damage_2', 'health_2', 'strength_2', 'intelligence_5', 'mana_4', 'haste_2']},
        {level: 100, items: ['damage_3', 'health_3', 'critMult_4', 'firstStrike_3', 'spellblade_3']},
    ],
    quests: {
        stat: [
            {stat: 'hordeFirstStrike', type: 'total', value: 5},
            {stat: 'hordeStrength', type: 'total', value: 40},
            {stat: 'hordeCritMult', type: 'total', value: 4.25},
            {stat: 'hordeSpellblade', type: 'total', value: 5.5},
            {stat: 'hordeHaste', type: 'total', value: 160},
            {stat: 'hordeIntelligence', type: 'total', value: 105},
            {stat: 'hordeHaste', type: 'total', value: 215},
        ],
        zone: [
            {area: 'monkeyJungle', zone: '8'},
            {area: 'monkeyJungle', zone: '19'},
            {area: 'loveIsland', zone: '6'},
            {area: 'loveIsland', zone: '11'},
        ],
        level: [30, 45, 60, 75, 100, 130, 160],
        boss: [
            {boss: 'ohilio', difficulty: 50},
            {boss: 'chriz2', difficulty: 35},
            {boss: 'mina', difficulty: 18},
        ]
    }
};
})();
const HO_CULTIST = (function() {
  return {
    unlock: 'hordeClassCultist',
    icon: 'mdi-pentagram',
    baseStats: {
        attack: 1.3,
        health: 450
    },
    exp: {
        base: 4500,
        increment: 1.7
    },
    courageMult: 50,
    skills: {
        combatStance: {
            type: 'stance',
            color: 'green',
            icon: 'mdi-sword-cross',
            max: 1,
            effect: [
                {name: 'hordeAttack', type: 'mult', value: lvl => lvl * 1.5 + 1},
                {name: 'hordeHealth', type: 'mult', value: lvl => lvl * 1.5 + 1},
            ]
        },
        lootingStance: {
            type: 'stance',
            color: 'orange',
            icon: 'mdi-sack',
            max: 1,
            effect: [
                {name: 'currencyHordeBloodGain', type: 'mult', value: lvl => lvl * 7 + 1},
                {name: 'hordeRareLootTime', type: 'base', value: lvl => lvl * -30},
            ]
        },
        learningStance: {
            type: 'stance',
            color: 'blue',
            icon: 'mdi-school',
            max: 1,
            effect: [
                {name: 'hordeExpBase', type: 'mult', value: lvl => 1 / (lvl * 0.5 + 1)},
            ]
        },
        crimsonPact: {
            type: 'passive',
            color: 'red',
            icon: 'mdi-file-sign',
            max: 1,
            effect: [
                {name: 'hordeAttackPerMissingHealth', type: 'tag', value: lvl => [lvl * 0.01]}
            ]
        },
        crimsonRitual: {
            type: 'active',
            color: 'red',
            icon: 'mdi-pentagram',
            max: 1,
            cooldown: () => 8,
            activeCost: () => {return {health: 0.03};},
            active() {
                return [
                    {type: 'damageMagic', value: 7.25, str: 0.3, int: 0.5}
                ];
            },
            activeType: 'combat'
        },
        reincarnation: {
            type: 'active',
            color: 'light-blue',
            icon: 'mdi-weather-sunset-up',
            max: 5,
            cost: 20,
            cooldown: lvl => 33 - lvl * 3,
            activeCost: () => {return {};},
            active() {
                return [
                    {type: 'heal', value: 0.4, int: 0.012},
                ];
            },
            activeType: 'combat'
        },
        strength: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeStrength', type: 'base', value: lvl => lvl * 1.3}
        ]},
        intelligence: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 1.3}
        ]},
        health: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 60}
        ]},
        blood: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'currencyHordeBloodCap', type: 'mult', value: lvl => Math.pow(1.08, lvl)}
        ]},
        corruption: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeCorruption', type: 'bonus', value: lvl => lvl * -0.01}
        ]},
        crimsonCurse: {
            type: 'active',
            color: 'pink-purple',
            icon: 'mdi-skull',
            max: 5,
            cost: 20,
            cooldown: () => 35,
            activeCost: () => {return {health: 0.08};},
            active(lvl) {
                return [
                    {type: 'poison', value: lvl * 0.15 + 0.65, int: 0.015},
                ];
            },
            activeType: 'combat'
        },
        sacrificialDagger: {
            type: 'active',
            color: 'wooden',
            icon: 'mdi-knife-military',
            max: 5,
            cost: 20,
            cooldown: () => 22,
            activeCost: () => {return {health: 0.05};},
            active(lvl) {
                return [
                    {type: 'damagePhysic', value: lvl * 1.8 + 10, str: 0.6, canCrit: 0.8},
                ];
            },
            activeType: 'combat'
        },
        damage: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeAttack', type: 'base', value: lvl => lvl * 0.04}
        ]},
        recovery: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 25},
            {name: 'hordeRecovery', type: 'base', value: lvl => lvl * 0.003}
        ]},
        haste: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHaste', type: 'base', value: lvl => lvl * 3}
        ]},
        blood_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'currencyHordeBloodCap', type: 'mult', value: lvl => Math.pow(1.08, lvl)}
        ]},
        crimsonHeart: {
            type: 'passive',
            color: 'red',
            icon: 'mdi-heart-pulse',
            max: 1,
            cost: 50,
            effect: [
                {name: 'hordePassiveRecovery', type: 'tag', value: lvl => [lvl * 0.2]}
            ]
        },
        recovery_2: {type: 'stat', max: 15, cost: 10, effect: [
            {name: 'hordeRecovery', type: 'base', value: lvl => lvl * 0.006}
        ]},
        despair: {
            type: 'passive',
            color: 'dark-blue',
            icon: 'mdi-emoticon-cry',
            max: 3,
            cost: 50,
            effect: [
                {name: 'hordeStrIntPerMissingHealth', type: 'tag', value: lvl => [lvl * 0.1]}
            ]
        },
        healing: {type: 'stat', max: 5, cost: 10, effect: [
            {name: 'hordeHealing', type: 'base', value: lvl => lvl * 0.02}
        ]},
        drainLife: {
            type: 'active',
            color: 'orange',
            icon: 'mdi-vector-line',
            max: 5,
            cost: 20,
            cooldown: lvl => 52 - lvl * 4,
            activeCost: () => {return {};},
            active(lvl) {
                return [
                    {type: 'damageMagic', value: lvl * 1.1 + 6.2, str: 0.75},
                    {type: 'heal', value: 0.24, int: 0.009},
                ];
            },
            activeType: 'combat'
        },
        haste_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHaste', type: 'base', value: lvl => lvl * 4}
        ]},
        hex: {
            type: 'active',
            color: 'deep-purple',
            icon: 'mdi-wizard-hat',
            max: 5,
            cost: 20,
            cooldown: lvl => 260 - lvl * 30,
            activeCost: () => {return {health: 0.5};},
            active(lvl) {
                return [
                    {type: 'maxdamageBio', value: 0.5},
                    {type: 'buff', value: lvl + 1, effect: [
                        {type: 'base', name: 'hordeCutting', value: 0.4},
                    ]},
                ];
            },
            activeType: 'combat'
        },
        intelligence_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 1.3}
        ]},
        recovery_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 25},
            {name: 'hordeRecovery', type: 'base', value: lvl => lvl * 0.003}
        ]},
        blood_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'currencyHordeBloodCap', type: 'mult', value: lvl => Math.pow(1.08, lvl)}
        ]},
        corruption_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeCorruption', type: 'bonus', value: lvl => lvl * -0.01}
        ]},
        darkRitual: {
            type: 'active',
            color: 'black',
            icon: 'mdi-pentagram',
            max: 5,
            cost: 20,
            cooldown: () => HORDE_STACKING_COOLDOWN,
            activeCost: () => {return {};},
            active(lvl) {
                return [
                    {type: 'permanentStat', stat: 'hordeAttack_base', value: lvl * 0.01 + 0.01}
                ];
            },
            activeType: 'utility'
        },
        damage_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeAttack', type: 'base', value: lvl => lvl * 0.05}
        ]},
        occultRestoration: {
            type: 'active',
            color: 'babypink',
            icon: 'mdi-heart-multiple',
            max: 5,
            cost: 20,
            cooldown: () => HORDE_STACKING_COOLDOWN,
            activeCost: () => {return {};},
            active(lvl) {
                return [
                    {type: 'permanentStat', stat: 'hordeHealing_base', value: lvl * 0.005 + 0.005}
                ];
            },
            activeType: 'utility'
        },
        health_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 70}
        ]},
        harvest: {
            type: 'active',
            color: 'red',
            icon: 'mdi-water',
            max: 5,
            cost: 20,
            cooldown: () => 2 * SECONDS_PER_HOUR,
            activeCost: () => {return {};},
            active(lvl) {
                return [
                    {type: 'blood', value: lvl * 15 + 45}
                ];
            },
            activeType: 'utility'
        },
        blood_4: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'currencyHordeBloodCap', type: 'mult', value: lvl => Math.pow(1.1, lvl)}
        ]},
        summonAbomination: {
            type: 'active',
            color: 'green',
            icon: 'mdi-halloween',
            max: 5,
            cost: 20,
            cooldown: () => 426,
            activeCost: () => {return {health: 0.3};},
            active(lvl) {
                return [
                    {type: 'divisionShield', value: lvl * 3 + 9},
                    {type: 'buff', value: lvl * 3 + 9, effect: [
                        {type: 'base', name: 'hordeAttack', value: lvl + 3},
                        {type: 'base', name: 'hordeCritChance', value: 0.1 * lvl},
                        {type: 'base', name: 'hordeCritMult', value: 0.25 * lvl},
                        {type: 'base', name: 'hordeToxic', value: 0.25},
                        {type: 'base', name: 'hordeCutting', value: 0.05},
                    ]},
                ];
            },
            activeType: 'combat'
        },
        strength_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeStrength', type: 'base', value: lvl => lvl * 1.5}
        ]},
        occultThunder: {
            type: 'active',
            color: 'purple',
            icon: 'mdi-flash',
            max: 5,
            cost: 20,
            cooldown: () => 45,
            activeCost: () => {return {health: 0.15};},
            active(lvl) {
                return [
                    {type: 'damagePhysic', value: lvl * 0.45 + 3.75, str: 0.7},
                    {type: 'damageMagic', value: lvl * 1.15 + 8.75, int: 1.1},
                    {type: 'stun', value: lvl * 3 + 5},
                ];
            },
            activeType: 'combat'
        },
        intelligence_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 1.3}
        ]},
        recovery_4: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 25},
            {name: 'hordeRecovery', type: 'base', value: lvl => lvl * 0.003}
        ]},
        corruption_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeCorruption', type: 'bonus', value: lvl => lvl * -0.01}
        ]},
        courage: {type: 'stat', max: 10, cost: 15, effect: [
            {name: 'hordeCourageScore', type: 'mult', value: lvl => lvl * 0.02 + 1}
        ]},
        damage_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeAttack', type: 'base', value: lvl => lvl * 0.04}
        ]},
        health_3: {type: 'stat', max: 20, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 60}
        ]},
        intelligence_4: {type: 'stat', max: 20, cost: 10, effect: [
            {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 1.3}
        ]},
        haste_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHaste', type: 'base', value: lvl => lvl * 3}
        ]},
        damage_4: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeAttack', type: 'base', value: lvl => lvl * 0.04}
        ]},
        health_4: {type: 'stat', max: 20, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 60}
        ]},
        strength_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeStrength', type: 'base', value: lvl => lvl * 1.3}
        ]},
        intelligence_5: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 1.3}
        ]},
        recovery_5: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 25},
            {name: 'hordeRecovery', type: 'base', value: lvl => lvl * 0.003}
        ]},
    },
    skillTree: [
        {isInnate: true, level: 0, items: ['combatStance', 'lootingStance', 'learningStance', 'crimsonPact', 'crimsonRitual']},
        {level: 1, items: ['reincarnation', 'strength', 'intelligence', 'health', 'blood', 'corruption']},
        {level: 10, items: ['crimsonCurse', 'sacrificialDagger', 'damage', 'recovery', 'haste', 'blood_2']},
        {isChoice: true, level: 20, items: [['crimsonHeart', 'recovery_2'], ['despair', 'healing'], ['drainLife', 'haste_2']]},
        {level: 30, items: ['hex', 'intelligence_2', 'recovery_3', 'blood_3', 'corruption_2']},
        {isChoice: true, level: 40, items: [['darkRitual', 'damage_2'], ['occultRestoration', 'health_2'], ['harvest', 'blood_4'], ['summonAbomination', 'strength_2']]},
        {level: 50, items: ['occultThunder', 'intelligence_3', 'recovery_4', 'corruption_3', 'courage']},
        {level: 75, items: ['damage_3', 'health_3', 'intelligence_4', 'haste_3']},
        {level: 100, items: ['damage_4', 'health_4', 'strength_3', 'intelligence_5', 'recovery_5']},
    ],
    quests: {
        stat: [],
        zone: [
            {area: 'loveIsland', zone: '10'},
        ],
        level: [25, 40, 55, 70, 95, 120, 150, 185],
        boss: [
            {boss: 'chriz2', difficulty: 75},
            {boss: 'mina', difficulty: 50},
        ]
    }
};
})();
const HO_KNIGHT = (function() {
  return {
    unlock: 'hordeClassKnight',
    icon: 'mdi-shield',
    baseStats: {
        attack: 2.5,
        health: 900,
        energy: 160,
        energyRegen: 1.5
    },
    exp: {
        base: 1200,
        increment: 1.3
    },
    courageMult: 4,
    skills: {
        damageRamp: {
            type: 'passive',
            color: 'red',
            icon: 'mdi-chart-line',
            max: 1,
            effect: [
                {name: 'hordeAttackAfterTime', type: 'tag', value: lvl => [lvl * 0.75]}
            ]
        },
        revive: {type: 'statBig', max: 1, effect: [
            {name: 'hordeRevive', type: 'base', value: lvl => lvl}
        ]},
        heavyHit: {
            type: 'active',
            color: 'orange-red',
            icon: 'mdi-sword',
            max: 1,
            cooldown: () => 70,
            activeCost: () => {return {energy: 140};},
            active() {
                return [
                    {type: 'damagePhysic', value: 8, str: 0.6},
                    {type: 'damageMagic', value: 8, int: 0.75}
                ];
            },
            activeType: 'combat'
        },
        shieldBash: {
            type: 'active',
            color: 'brown',
            icon: 'mdi-shield',
            max: 5,
            cost: 20,
            cooldown: () => 16,
            activeCost: () => {return {energy: 100};},
            active(lvl) {
                return [
                    {type: 'damagePhysic', value: lvl * 0.25 + 2.25, str: 0.2},
                    {type: 'stun', value: lvl + 2}
                ];
            },
            activeType: 'combat'
        },
        health: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 120}
        ]},
        defense: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeDefense', type: 'base', value: lvl => lvl * 0.001}
        ]},
        energy_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeEnergy', type: 'base', value: lvl => lvl * 35}
        ]},
        haste: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHaste', type: 'base', value: lvl => lvl * 3}
        ]},
        statRamp: {
            type: 'passive',
            color: 'pink-purple',
            icon: 'mdi-chart-line',
            max: 5,
            cost: 40,
            effect: [
                {name: 'hordeStrIntAfterTime', type: 'tag', value: lvl => [lvl * 8]}
            ]
        },
        defense_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeDefense', type: 'base', value: lvl => lvl * 0.0012}
        ]},
        toxic: {type: 'stat', max: 20, cost: 10, effect: [
            {name: 'hordeToxic', type: 'base', value: lvl => lvl * 0.005}
        ]},
        magicTaken: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeMagicTaken', type: 'mult', value: lvl => Math.pow(1 / 1.09, lvl)}
        ]},
        cutting: {type: 'stat', max: 20, cost: 10, effect: [
            {name: 'hordeCutting', type: 'base', value: lvl => lvl * 0.002}
        ]},
        physicTaken: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordePhysicTaken', type: 'mult', value: lvl => Math.pow(1 / 1.09, lvl)}
        ]},
        refuge: {
            type: 'active',
            color: 'green',
            icon: 'mdi-medical-cotton-swab',
            max: 5,
            cost: 20,
            cooldown: () => 50,
            activeCost: () => {return {energy: 120};},
            active(lvl) {
                return [
                    {type: 'heal', value: lvl * 0.05 + 0.15, int: 0.006},
                    {type: 'buff', value: lvl * 2 + 8, effect: [
                        {type: 'mult', name: 'hordePhysicTaken', value: 1 / 1.4},
                        {type: 'mult', name: 'hordeMagicTaken', value: 1 / 1.4},
                        {type: 'mult', name: 'hordeBioTaken', value: 1 / 1.4}
                    ]}
                ];
            },
            activeType: 'combat'
        },
        health_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 120}
        ]},
        recovery: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 35},
            {name: 'hordeRecovery', type: 'base', value: lvl => lvl * 0.01}
        ]},
        physicTaken_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordePhysicTaken', type: 'mult', value: lvl => Math.pow(1 / 1.08, lvl)}
        ]},
        strength: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeStrength', type: 'base', value: lvl => lvl * 1.2}
        ]},
        consecrate: {
            type: 'active',
            color: 'amber',
            icon: 'mdi-shimmer',
            max: 5,
            cost: 20,
            cooldown: () => 28,
            activeCost: () => {return {energy: 50};},
            active(lvl) {
                return [
                    {type: 'removeAttack', value: lvl * 0.02 + 0.06},
                    {type: 'stun', value: lvl + 4},
                ];
            },
            activeType: 'combat'
        },
        energy: {type: 'stat', max: 15, cost: 10, effect: [
            {name: 'hordeEnergy', type: 'base', value: lvl => lvl * 40}
        ]},
        blessing: {
            type: 'active',
            color: 'yellow',
            icon: 'mdi-cross-outline',
            max: 5,
            cost: 20,
            cooldown: (lvl) => 3600 - lvl * 400,
            activeCost: () => {return {energy: 160};},
            active(lvl) {
                return [
                    {type: 'heal', value: lvl * 0.3 + 0.9, int: 0.02},
                    {type: 'revive', value: 2},
                ];
            },
            activeType: 'combat'
        },
        revive_2: {type: 'statBig', max: 3, cost: 50, effect: [
            {name: 'hordeRevive', type: 'base', value: lvl => lvl}
        ]},
        fortify: {
            type: 'active',
            color: 'pale-green',
            icon: 'mdi-heart',
            max: 5,
            cost: 20,
            cooldown: () => HORDE_STACKING_COOLDOWN,
            activeCost: () => {return {};},
            active(lvl) {
                return [
                    {type: 'permanentStat', stat: 'hordeHealth_base', value: lvl * 30 + 30}
                ];
            },
            activeType: 'utility'
        },
        bioTaken: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeBioTaken', type: 'mult', value: lvl => Math.pow(1 / 1.09, lvl)}
        ]},
        parry: {
            type: 'active',
            color: 'deep-purple',
            icon: 'mdi-fencing',
            max: 5,
            cost: 20,
            cooldown: () => 26,
            activeCost: () => {return {energy: 60};},
            active(lvl) {
                return [
                    {type: 'damagePhysic', value: lvl * 0.7 + 3.9, str: 0.35},
                    {type: 'divisionShield', value: lvl + 1}
                ];
            },
            activeType: 'combat'
        },
        health_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 120}
        ]},
        magicTaken_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeMagicTaken', type: 'mult', value: lvl => Math.pow(1 / 1.08, lvl)}
        ]},
        divisionShield: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeDivisionShield', type: 'base', value: lvl => lvl}
        ]},
        intelligence: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 1.3}
        ]},
        smite2: {
            type: 'active',
            color: 'blue-grey',
            icon: 'mdi-weather-lightning',
            max: 5,
            cost: 20,
            cooldown: () => 135,
            activeCost: () => {return {energy: 200};},
            active(lvl) {
                return [
                    {type: 'damageMagic', value: lvl * 2 + 11, int: 1.1, canCrit: lvl * 0.15 + 0.25},
                    {type: 'heal', value: lvl * 0.01 + 0.05, int: 0.001}
                ];
            },
            activeType: 'combat'
        },
        recovery_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 35},
            {name: 'hordeRecovery', type: 'base', value: lvl => lvl * 0.01}
        ]},
        defense_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeDefense', type: 'base', value: lvl => lvl * 0.001}
        ]},
        courage: {type: 'stat', max: 10, cost: 15, effect: [
            {name: 'hordeCourageScore', type: 'mult', value: lvl => lvl * 0.02 + 1}
        ]},
        damage: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeAttack', type: 'base', value: lvl => lvl * 0.08}
        ]},
        health_4: {type: 'stat', max: 20, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 120}
        ]},
        physicTaken_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordePhysicTaken', type: 'mult', value: lvl => Math.pow(1 / 1.08, lvl)}
        ]},
        strength_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeStrength', type: 'base', value: lvl => lvl * 1.2}
        ]},
        haste_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHaste', type: 'base', value: lvl => lvl * 3}
        ]},
        damage_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeAttack', type: 'base', value: lvl => lvl * 0.08}
        ]},
        health_5: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 120}
        ]},
        magicTaken_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeMagicTaken', type: 'mult', value: lvl => Math.pow(1 / 1.08, lvl)}
        ]},
        divisionShield_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeDivisionShield', type: 'base', value: lvl => lvl}
        ]},
        intelligence_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 1.3}
        ]},
        energy_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeEnergy', type: 'base', value: lvl => lvl * 35}
        ]},
    },
    skillTree: [
        {isInnate: true, level: 0, items: ['damageRamp', 'revive', 'heavyHit']},
        {level: 1, items: ['shieldBash', 'health', 'defense', 'energy_2', 'haste']},
        {isChoice: true, level: 10, items: [['statRamp', 'defense_2'], ['toxic', 'physicTaken'], ['cutting', 'magicTaken']]},
        {level: 20, items: ['refuge', 'health_2', 'recovery', 'physicTaken_2', 'strength']},
        {isChoice: true, level: 30, items: [['consecrate', 'energy'], ['blessing', 'revive_2'], ['fortify', 'bioTaken']]},
        {level: 40, items: ['parry', 'health_3', 'magicTaken_2', 'divisionShield', 'intelligence']},
        {level: 50, items: ['smite2', 'recovery_2', 'defense_3', 'courage']},
        {level: 75, items: ['damage', 'health_4', 'physicTaken_3', 'strength_2', 'haste_2']},
        {level: 100, items: ['damage_2', 'health_5', 'magicTaken_3', 'divisionShield_2', 'intelligence_2', 'energy_3']},
    ],
    quests: {
        stat: [
            {stat: 'hordeEnergy', type: 'total', value: 500},
            {stat: 'hordeCutting', type: 'total', value: 0.03},
            {stat: 'hordeHealth', type: 'base', value: 3000},
            {stat: 'hordeRevive', type: 'total', value: 7},
            {stat: 'hordeHealth', type: 'base', value: 6000},
            {stat: 'hordeDefense', type: 'total', value: 0.03},
            {stat: 'hordeHaste', type: 'total', value: 105},
        ],
        zone: [
            {area: 'warzone', zone: '9'},
            {area: 'monkeyJungle', zone: '6'},
            {area: 'monkeyJungle', zone: '13'},
            {area: 'monkeyJungle', zone: '19'},
            {area: 'loveIsland', zone: '6'},
            {area: 'loveIsland', zone: '14'},
        ],
        level: [20, 35, 50, 70, 90, 115, 140, 165, 190],
        boss: [
            {boss: 'ohilio', difficulty: 20},
            {boss: 'chriz2', difficulty: 15},
            {boss: 'mina', difficulty: 2},
        ]
    }
};
})();
const HO_MAGE = (function() {
  return {
    unlock: 'hordeClassMage',
    icon: 'mdi-wizard-hat',
    baseStats: {
        attack: 4,
        health: 575,
        mana: 400,
        manaRegen: 0.1
    },
    exp: {
        base: 840,
        increment: 1.24
    },
    courageMult: 2.25,
    skills: {
        manaRest: {
            type: 'passive',
            color: 'blue',
            icon: 'mdi-sleep',
            max: 1,
            effect: [
                {name: 'hordeManaRest', type: 'tag', value: lvl => [15, lvl * 1.2]}
            ]
        },
        autocast: {type: 'statBig', max: 3, cost: 60, effect: [
            {name: 'hordeAutocast', type: 'base', value: lvl => lvl}
        ]},
        magicMissile: {
            type: 'active',
            color: 'indigo',
            icon: 'mdi-motion',
            max: 1,
            cooldown: () => 6,
            activeCost: () => {return {mana: 3};},
            active() {
                return [
                    {type: 'damageMagic', value: 3.8, int: 0.24}
                ];
            },
            activeType: 'combat'
        },
        fireball: {
            type: 'active',
            color: 'orange',
            icon: 'mdi-fire-circle',
            max: 5,
            cost: 14,
            cooldown: () => 13,
            activeCost: () => {return {mana: 5};},
            active(lvl) {
                return [
                    {type: 'damageMagic', value: lvl * 0.2 + 5.4, int: 0.45, canCrit: lvl * 0.1 + 0.5}
                ];
            },
            activeType: 'combat'
        },
        shockBlast: {
            type: 'active',
            color: 'yellow',
            icon: 'mdi-flash',
            max: 5,
            cost: 14,
            cooldown: () => 28,
            activeCost: () => {return {mana: 6};},
            active(lvl) {
                return [
                    {type: 'damageMagic', value: lvl * 0.35 + 9.4, int: 0.75},
                    {type: 'silence', value: lvl * 2 + 4}
                ];
            },
            activeType: 'combat'
        },
        heal: {
            type: 'active',
            color: 'green',
            icon: 'mdi-medical-bag',
            max: 5,
            cost: 14,
            cooldown: (lvl) => 125 - lvl * 10,
            activeCost: () => {return {mana: 21};},
            active() {
                return [
                    {type: 'heal', value: 0.6, int: 0.01}
                ];
            },
            activeType: 'combat'
        },
        mana: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeMana', type: 'base', value: lvl => lvl * 50}
        ]},
        intelligence: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 1.4}
        ]},
        barrier: {
            type: 'active',
            color: 'light-grey',
            icon: 'mdi-circle-outline',
            max: 5,
            cost: 16,
            cooldown: () => 36,
            activeCost: () => {return {mana: 7};},
            active(lvl) {
                return [
                    {type: 'divisionShield', value: lvl * 3 + 1}
                ];
            },
            activeType: 'combat'
        },
        earthquake: {
            type: 'active',
            color: 'brown',
            icon: 'mdi-landslide',
            max: 5,
            cost: 16,
            cooldown: () => 30,
            activeCost: () => {return {mana: 9};},
            active(lvl) {
                return [
                    {type: 'damageMagic', value: lvl * 0.75 + 9.4, int: 0.65},
                    {type: 'stun', value: lvl + 3}
                ];
            },
            activeType: 'combat'
        },
        intelligence_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 1.4}
        ]},
        spellblade_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeSpellblade', type: 'base', value: lvl => lvl * 0.15}
        ]},
        haste: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHaste', type: 'base', value: lvl => lvl * 3}
        ]},
        health: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 70}
        ]},
        manasteal: {
            type: 'passive',
            color: 'teal',
            icon: 'mdi-water-plus',
            max: 3,
            cost: 40,
            effect: [
                {name: 'hordeManasteal', type: 'tag', value: lvl => [lvl * 5]}
            ]
        },
        waterBolt: {
            type: 'active',
            color: 'light-blue',
            icon: 'mdi-waves',
            max: 5,
            cost: 18,
            cooldown: () => 40,
            activeCost: () => {return {mana: 12};},
            active(lvl) {
                return [
                    {type: 'damageMagic', value: lvl * 0.7 + 12.5, int: 0.9},
                    {type: 'heal', value: lvl * 0.025 + 0.075, int: 0.006}
                ];
            },
            activeType: 'combat'
        },
        iceBlast: {
            type: 'active',
            color: 'cyan',
            icon: 'mdi-snowflake-alert',
            max: 5,
            cost: 18,
            cooldown: (lvl) => 38 - lvl * 4,
            activeCost: () => {return {mana: 16};},
            active(lvl) {
                return [
                    {type: 'stun', value: lvl * 2 + 6},
                    {type: 'removeAttack', value: lvl * 0.02 + 0.1}
                ];
            },
            activeType: 'combat'
        },
        damage: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeAttack', type: 'base', value: lvl => lvl * 0.12}
        ]},
        mana_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeMana', type: 'base', value: lvl => lvl * 50}
        ]},
        haste_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHaste', type: 'base', value: lvl => lvl * 3}
        ]},
        autocast_2: {type: 'statBig', max: 2, cost: 20, effect: [
            {name: 'hordeAutocast', type: 'base', value: lvl => lvl}
        ]},
        mana_3: {type: 'stat', max: 15, cost: 10, effect: [
            {name: 'hordeMana', type: 'base', value: lvl => lvl * 40},
            {name: 'hordeManaRegen', type: 'base', value: lvl => lvl * 0.08}
        ]},
        spellblade: {type: 'stat', max: 15, cost: 10, effect: [
            {name: 'hordeSpellblade', type: 'base', value: lvl => lvl * 0.2}
        ]},
        focus: {
            type: 'active',
            color: 'purple',
            icon: 'mdi-crystal-ball',
            max: 5,
            cost: 20,
            cooldown: () => 180,
            activeCost: () => {return {mana: 24};},
            active(lvl) {
                return [
                    {type: 'buff', value: 60, effect: [
                        {type: 'base', name: 'hordeIntelligence', value: 8 * lvl}
                    ]}
                ];
            },
            activeType: 'combat'
        },
        smite: {
            type: 'active',
            color: 'red',
            icon: 'mdi-nuke',
            max: 5,
            cost: 20,
            cooldown: (lvl) => 95 - lvl * 5,
            activeCost: () => {return {mana: 40};},
            active(lvl) {
                return [
                    {type: 'damageMagic', value: lvl * 4 + 28, int: 2.2}
                ];
            },
            activeType: 'combat'
        },
        intelligence_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 1.4}
        ]},
        spellblade_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeSpellblade', type: 'base', value: lvl => lvl * 0.15}
        ]},
        haste_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHaste', type: 'base', value: lvl => lvl * 3}
        ]},
        damage_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeAttack', type: 'base', value: lvl => lvl * 0.12}
        ]},
        health_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 70}
        ]},
        autocast_3: {type: 'statBig', max: 2, cost: 20, effect: [
            {name: 'hordeAutocast', type: 'base', value: lvl => lvl}
        ]},
        conjure: {
            type: 'active',
            color: 'red-pink',
            icon: 'mdi-sack',
            max: 5,
            cost: 20,
            cooldown: () => 900,
            activeCost: () => {return {};},
            active(lvl) {
                return [
                    {type: 'blood', value: lvl * 5 + 10}
                ];
            },
            activeType: 'utility'
        },
        ascend: {
            type: 'active',
            color: 'amber',
            icon: 'mdi-star-face',
            max: 5,
            cost: 20,
            cooldown: (lvl) => 8100 - lvl * 900,
            activeCost: () => {return {mana: 1000};},
            active(lvl) {
                return [
                    {type: 'buff', value: 150, effect: [
                        {type: 'mult', name: 'hordeAttack', value: lvl * 0.15 + 1.25},
                        {type: 'mult', name: 'hordeHealth', value: lvl * 0.15 + 1.25},
                        {type: 'base', name: 'hordeRecovery', value: lvl * 0.03 + 0.05},
                        {type: 'base', name: 'hordeManaRegen', value: lvl * 2 + 10},
                    ]}
                ];
            },
            activeType: 'combat'
        },
        deepFocus: {
            type: 'active',
            color: 'blue',
            icon: 'mdi-water',
            max: 5,
            cost: 20,
            cooldown: () => HORDE_STACKING_COOLDOWN,
            activeCost: () => {return {};},
            active(lvl) {
                return [
                    {type: 'permanentStat', stat: 'hordeMana_base', value: lvl * 10 + 10}
                ];
            },
            activeType: 'utility'
        },
        damage_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeAttack', type: 'base', value: lvl => lvl * 0.12}
        ]},
        health_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 70}
        ]},
        mana_4: {type: 'stat', max: 20, cost: 10, effect: [
            {name: 'hordeMana', type: 'base', value: lvl => lvl * 50}
        ]},
        intelligence_4: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 1.4}
        ]},
        haste_4: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHaste', type: 'base', value: lvl => lvl * 3}
        ]},
        damage_4: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeAttack', type: 'base', value: lvl => lvl * 0.12}
        ]},
        health_4: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 70}
        ]},
        intelligence_5: {type: 'stat', max: 20, cost: 10, effect: [
            {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 1.4}
        ]},
        spellblade_4: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeSpellblade', type: 'base', value: lvl => lvl * 0.15}
        ]},
    },
    skillTree: [
        {isInnate: true, level: 0, items: ['manaRest', 'autocast', 'magicMissile']},
        {level: 1, items: ['fireball', 'shockBlast', 'heal', 'mana', 'intelligence']},
        {level: 10, items: ['barrier', 'earthquake', 'intelligence_2', 'spellblade_2', 'haste', 'health']},
        {level: 20, items: ['manasteal', 'waterBolt', 'iceBlast', 'damage', 'mana_2', 'haste_2']},
        {isChoice: true, level: 30, items: [['autocast_2'], ['mana_3'], ['spellblade']]},
        {level: 40, items: ['focus', 'smite', 'intelligence_3', 'spellblade_3', 'haste_3', 'damage_2', 'health_2']},
        {isChoice: true, level: 50, items: [['autocast_3'], ['conjure'], ['ascend'], ['deepFocus']]},
        {level: 75, items: ['damage_3', 'health_3', 'mana_4', 'intelligence_4', 'haste_4']},
        {level: 100, items: ['damage_4', 'health_4', 'intelligence_5', 'spellblade_4']},
    ],
    quests: {
        stat: [
            {stat: 'hordeMana', type: 'total', value: 900},
            {stat: 'hordeIntelligence', type: 'total', value: 22},
            {stat: 'hordeHaste', type: 'total', value: 60},
            {stat: 'hordeMana', type: 'total', value: 2000},
            {stat: 'hordeSpellblade', type: 'total', value: 7},
            {stat: 'hordeAutocast', type: 'total', value: 11},
            {stat: 'hordeHaste', type: 'total', value: 165},
        ],
        zone: [
            {area: 'warzone', zone: '7'},
            {area: 'monkeyJungle', zone: '4'},
            {area: 'monkeyJungle', zone: '11'},
            {area: 'monkeyJungle', zone: '17'},
            {area: 'loveIsland', zone: '5'},
            {area: 'loveIsland', zone: '13'},
        ],
        level: [15, 30, 45, 60, 85, 110, 135, 160, 185],
        boss: [
            {boss: 'ohilio', difficulty: 12},
            {boss: 'chriz2', difficulty: 3},
            {boss: 'mina', difficulty: 25},
        ]
    }
};
})();
const HO_PIRATE = (function() {
  return {
    unlock: 'hordeClassPirate',
    icon: 'mdi-pirate',
    baseStats: {
        attack: 3.3,
        health: 285,
        energy: 150,
        energyRegen: 1,
        mana: 100,
        manaRegen: 0.01
    },
    exp: {
        base: 1800,
        increment: 1.4
    },
    courageMult: 8.5,
    skills: {
        challenge: {
            type: 'passive',
            color: 'orange-red',
            icon: 'mdi-screwdriver',
            max: 1,
            effect: [
                {name: 'currencyHordeLockpickGain', type: 'base', value: lvl => lvl / buildNum(100, 'K')}
            ]
        },
        parrotAttack: {
            type: 'active',
            color: 'cyan',
            icon: 'mdi-bird',
            max: 1,
            cooldown: () => 14,
            activeCost: () => {return {energy: 50};},
            active() {
                return [
                    {type: 'maxdamageBio', value: 0.2, int: 0.001},
                    {type: 'damagePhysic', value: 2.6, str: 0.5}
                ];
            },
            activeType: 'combat'
        },
        plunder: {
            type: 'active',
            color: 'light-green',
            icon: 'mdi-sack',
            max: 1,
            cooldown: () => SECONDS_PER_HOUR,
            activeCost: () => {return {};},
            active() {
                return [
                    {type: 'blood', value: 80}
                ];
            },
            activeType: 'utility'
        },
        bottleOBrew: {
            type: 'active',
            color: 'pink',
            icon: 'mdi-bottle-tonic',
            max: 5,
            cost: 20,
            cooldown: () => 120,
            activeCost: () => {return {mana: 7};},
            active(lvl) {
                return [
                    {type: 'buff', value: 30, effect: [
                        {type: 'mult', name: 'hordeAttack', value: lvl * 0.25 + 1.75},
                        {type: 'base', name: 'hordeCritChance', value: 0.4},
                        {type: 'base', name: 'hordeCritMult', value: 1.5},
                        {type: 'mult', name: 'hordePhysicTaken', value: 1 / (lvl * 0.25 + 1.75)},
                        {type: 'mult', name: 'hordeMagicTaken', value: 1 / (lvl * 0.25 + 1.75)},
                        {type: 'mult', name: 'hordeBioTaken', value: 1 / (lvl * 0.25 + 1.75)},
                        {type: 'base', name: 'hordeRecovery', value: 0.25},
                        {type: 'base', name: 'hordeDefense', value: 0.02},
                    ]}
                ];
            },
            activeType: 'combat'
        },
        energy: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeEnergy', type: 'base', value: lvl => lvl * 40}
        ]},
        mana: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeMana', type: 'base', value: lvl => lvl * 25}
        ]},
        blood: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'currencyHordeBloodGain', type: 'mult', value: lvl => Math.pow(1.02, lvl)},
            {name: 'currencyHordeBloodCap', type: 'mult', value: lvl => Math.pow(1.04, lvl)},
        ]},
        courage: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeCourageScore', type: 'mult', value: lvl => lvl * 0.02 + 1}
        ]},
        bombToss: {
            type: 'active',
            color: 'grey',
            icon: 'mdi-bomb',
            max: 5,
            cost: 20,
            cooldown: () => 22,
            activeCost: () => {return {energy: 70};},
            active(lvl) {
                return [
                    {type: 'damageMagic', value: lvl + 6.5, int: 0.8}
                ];
            },
            activeType: 'combat'
        },
        health: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 40}
        ]},
        energy_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeEnergy', type: 'base', value: lvl => lvl * 40}
        ]},
        haste: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHaste', type: 'base', value: lvl => lvl * 3}
        ]},
        blood_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'currencyHordeBloodGain', type: 'mult', value: lvl => Math.pow(1.02, lvl)},
            {name: 'currencyHordeBloodCap', type: 'mult', value: lvl => Math.pow(1.04, lvl)},
        ]},
        lockpick: {type: 'stat', max: 4, cost: 15, effect: [
            {name: 'currencyHordeLockpickGain', type: 'base', value: lvl => lvl / buildNum(2, 'M')}
        ]},
        blood_3: {type: 'stat', max: 20, cost: 10, effect: [
            {name: 'currencyHordeBloodGain', type: 'mult', value: lvl => Math.pow(1.025, lvl)},
            {name: 'currencyHordeBloodCap', type: 'mult', value: lvl => Math.pow(1.05, lvl)},
        ]},
        courage_2: {type: 'stat', max: 20, cost: 10, effect: [
            {name: 'hordeCourageScore', type: 'mult', value: lvl => lvl * 0.03 + 1}
        ]},
        trinket: {type: 'stat', max: 20, cost: 10, effect: [
            {name: 'hordeTrinketGain', type: 'mult', value: lvl => lvl * 0.08 + 1}
        ]},
        cannonball: {
            type: 'active',
            color: 'dark-grey',
            icon: 'mdi-circle-slice-8',
            max: 5,
            cost: 20,
            cooldown: () => 35,
            activeCost: () => {return {energy: 120};},
            active(lvl) {
                return [
                    {type: 'damagePhysic', value: lvl * 1.2 + 7.8, str: 0.9},
                    {type: 'stun', value: lvl + 3}
                ];
            },
            activeType: 'combat'
        },
        invigoratingBottle: {
            type: 'active',
            color: 'amber',
            icon: 'mdi-bottle-tonic',
            max: 5,
            cost: 20,
            cooldown: lvl => 210 - 30 * lvl,
            activeCost: lvl => {return {mana: 7 - lvl};},
            active() {
                return [
                    {type: 'refillEnergy', value: 1}
                ];
            },
            activeType: 'combat'
        },
        damage: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeAttack', type: 'base', value: lvl => lvl * 0.1}
        ]},
        blood_4: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'currencyHordeBloodGain', type: 'mult', value: lvl => Math.pow(1.02, lvl)},
            {name: 'currencyHordeBloodCap', type: 'mult', value: lvl => Math.pow(1.04, lvl)},
        ]},
        courage_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeCourageScore', type: 'mult', value: lvl => lvl * 0.02 + 1}
        ]},
        lockpick_2: {type: 'stat', max: 4, cost: 15, effect: [
            {name: 'currencyHordeLockpickGain', type: 'base', value: lvl => lvl / buildNum(2, 'M')}
        ]},
        treasureChest: {
            type: 'active',
            color: 'wooden',
            icon: 'mdi-treasure-chest',
            max: 5,
            cost: 20,
            cooldown: () => HORDE_STACKING_COOLDOWN,
            activeCost: () => {return {};},
            active(lvl) {
                return [
                    {type: 'permanentStat', stat: 'currencyHordeBloodGain_mult', value: lvl * 0.07 + 0.07}
                ];
            },
            activeType: 'utility'
        },
        blood_5: {type: 'stat', max: 15, cost: 10, effect: [
            {name: 'currencyHordeBloodCap', type: 'mult', value: lvl => Math.pow(1.05, lvl) * (lvl * 0.025 + 1)}
        ]},
        bountyBoard: {
            type: 'passive',
            color: 'orange-red',
            icon: 'mdi-screwdriver',
            max: 1,
            cost: 100,
            effect: [
                {name: 'currencyHordeLockpickGain', type: 'mult', value: lvl => lvl * 0.25 + 1},
                {name: 'currencyHordeLockpickCap', type: 'base', value: lvl => lvl * 21},
            ]
        },
        lockpick_3: {type: 'stat', max: 15, cost: 10, effect: [
            {name: 'currencyHordeLockpickGain', type: 'base', value: lvl => lvl / buildNum(2.5, 'M')}
        ]},
        trinket_2: {type: 'stat', max: 25, cost: 10, effect: [
            {name: 'hordeTrinketGain', type: 'mult', value: lvl => Math.pow(1.05, lvl) * (lvl * 0.08 + 1)},
            {name: 'hordeTrinketQuality', type: 'base', value: lvl => lvl * -1},
        ]},
        pirateShip: {
            type: 'active',
            color: 'brown',
            icon: 'mdi-ship-wheel',
            max: 5,
            cost: 20,
            cooldown: lvl => 570 - 60 * lvl,
            activeCost: () => {return {energy: 250, mana: 30};},
            active(lvl) {
                return [
                    {type: 'damagePhysic', value: lvl * 3 + 18, str: 1.8},
                    {type: 'damageMagic', value: lvl * 2 + 14.5, int: 2.35},
                    {type: 'buff', value: lvl * 5 + 25, effect: [
                        {type: 'mult', name: 'hordeAttack', value: lvl * 0.35 + 2.25},
                        {type: 'base', name: 'hordeCutting', value: 0.15},
                        {type: 'mult', name: 'hordeRespawn', value: 0.01},
                    ]}
                ];
            },
            activeType: 'combat'
        },
        strength: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeStrength', type: 'base', value: lvl => lvl * 1.1}
        ]},
        intelligence: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 1.3}
        ]},
        mana_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeMana', type: 'base', value: lvl => lvl * 25}
        ]},
        haste_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHaste', type: 'base', value: lvl => lvl * 3}
        ]},
        blood_6: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'currencyHordeBloodGain', type: 'mult', value: lvl => Math.pow(1.02, lvl)},
            {name: 'currencyHordeBloodCap', type: 'mult', value: lvl => Math.pow(1.04, lvl)},
        ]},
        damage_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeAttack', type: 'base', value: lvl => lvl * 0.1}
        ]},
        health_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 40}
        ]},
        blood_7: {type: 'stat', max: 20, cost: 10, effect: [
            {name: 'currencyHordeBloodGain', type: 'mult', value: lvl => Math.pow(1.02, lvl)},
            {name: 'currencyHordeBloodCap', type: 'mult', value: lvl => Math.pow(1.04, lvl)},
        ]},
        strength_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeStrength', type: 'base', value: lvl => lvl * 1.1}
        ]},
        energy_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeEnergy', type: 'base', value: lvl => lvl * 40}
        ]},
        damage_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeAttack', type: 'base', value: lvl => lvl * 0.1}
        ]},
        health_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeHealth', type: 'base', value: lvl => lvl * 40}
        ]},
        blood_8: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'currencyHordeBloodGain', type: 'mult', value: lvl => Math.pow(1.02, lvl)},
            {name: 'currencyHordeBloodCap', type: 'mult', value: lvl => Math.pow(1.04, lvl)},
        ]},
        courage_4: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeCourageScore', type: 'mult', value: lvl => lvl * 0.02 + 1}
        ]},
        intelligence_2: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeIntelligence', type: 'base', value: lvl => lvl * 1.3}
        ]},
        mana_3: {type: 'stat', max: 10, cost: 10, effect: [
            {name: 'hordeMana', type: 'base', value: lvl => lvl * 25}
        ]},
    },
    skillTree: [
        {isInnate: true, level: 0, items: ['challenge', 'parrotAttack', 'plunder']},
        {level: 1, items: ['bottleOBrew', 'energy', 'mana', 'blood', 'courage']},
        {level: 10, items: ['bombToss', 'health', 'energy_2', 'haste', 'blood_2', 'lockpick']},
        {isChoice: true, level: 20, items: [['blood_3'], ['courage_2'], ['trinket']]},
        {level: 30, items: ['cannonball', 'invigoratingBottle', 'damage', 'blood_4', 'courage_3', 'lockpick_2']},
        {isChoice: true, level: 40, items: [['treasureChest', 'blood_5'], ['bountyBoard', 'lockpick_3'], ['trinket_2']]},
        {level: 50, items: ['pirateShip', 'strength', 'intelligence', 'mana_2', 'haste_2', 'blood_6']},
        {level: 75, items: ['damage_2', 'health_2', 'blood_7', 'strength_2', 'energy_3']},
        {level: 100, items: ['damage_3', 'health_3', 'blood_8', 'courage_4', 'intelligence_2', 'mana_3']},
    ],
    quests: {
        stat: [
            {stat: 'hordeMana', type: 'total', value: 490},
            {stat: 'hordeEnergy', type: 'total', value: 1200},
            {stat: 'hordeHaste', type: 'total', value: 70},
            {stat: 'hordeAttack', type: 'base', value: 4.25},
            {stat: 'hordeHealth', type: 'base', value: 925},
            {stat: 'hordeIntelligence', type: 'total', value: 35},
            {stat: 'hordeStrength', type: 'total', value: 44},
        ],
        zone: [
            {area: 'monkeyJungle', zone: '2'},
            {area: 'monkeyJungle', zone: '8'},
            {area: 'monkeyJungle', zone: '18'},
            {area: 'loveIsland', zone: '4'},
            {area: 'loveIsland', zone: '10'},
        ],
        level: [25, 40, 55, 75, 95, 120, 150, 180],
        boss: [
            {boss: 'ohilio', difficulty: 30},
            {boss: 'chriz2', difficulty: 20},
            {boss: 'mina', difficulty: 5},
        ]
    }
};
})();
const HO_SCHOLAR = (function() {
  return {
    unlock: 'hordeClassScholar',
    icon: 'mdi-school',
    baseStats: {
        attack: 2,
        health: 250
    },
    exp: {
        base: 18000,
        increment: 2.1
    },
    skills: {},
    skillTree: [
        {isInnate: true, level: 0, items: []},
    ],
    quests: {
        stat: [],
        zone: [],
        level: [],
        boss: []
    }
};
})();
const HO_SHAMAN = (function() {
  return {
    unlock: 'hordeClassShaman',
    icon: 'mdi-tree',
    baseStats: {
        attack: 4.4,
        health: 575,
        mana: 150,
        manaRegen: 0.01
    },
    exp: {
        base: 4200,
        increment: 1.425
    },
    skills: {},
    skillTree: [
        {isInnate: true, level: 0, items: []},
    ],
    quests: {
        stat: [],
        zone: [],
        level: [],
        boss: []
    }
};
})();
const HO_UNDEAD = (function() {
  return {
    unlock: 'hordeClassUndead',
    icon: 'mdi-emoticon-dead',
    baseStats: {
        attack: 1.8,
        health: 60
    },
    exp: {
        base: 8400,
        increment: 1.7
    },
    skills: {},
    skillTree: [
        {isInnate: true, level: 0, items: []},
    ],
    quests: {
        stat: [],
        zone: [],
        level: [],
        boss: []
    }
};
})();
const HO_WARZONE = (function() {
  return {
    unlock: null,
    icon: 'mdi-sign-caution',
    color: 'orange',
    zones: {
        1: {
            x: -9.5,
            y: 1.5,
            unlockedBy: null,
            type: 'regular',
            difficulty: 0,
            enemyType: ['soldier_1', 'officer_1']
        },
        2: {
            x: -8,
            y: -1,
            unlockedBy: '1',
            type: 'regular',
            difficulty: 3,
            enemyType: ['soldier_1', 'officer_1']
        },
        3: {
            x: -5,
            y: -2,
            unlockedBy: '2',
            type: 'regular',
            difficulty: 6,
            enemyType: ['soldier_1', 'soldier_2', 'soldier_3', 'officer_1', 'officer_2', 'officer_3']
        },
        4: {
            x: -3,
            y: -4,
            unlockedBy: '3',
            type: 'regular',
            difficulty: 9,
            enemyType: ['soldier_1', 'soldier_2', 'soldier_3', 'officer_1', 'officer_2', 'officer_3']
        },
        sign_1: {
            x: -4.25,
            y: -5.25,
            unlockedBy: '4',
            type: 'sign'
        },
        5: {
            x: -1,
            y: -5,
            unlockedBy: '4',
            type: 'regular',
            difficulty: 12,
            enemyType: ['soldier_1', 'soldier_2', 'soldier_3', 'hunter']
        },
        6: {
            x: 4,
            y: -4.5,
            unlockedBy: '5',
            type: 'regular',
            difficulty: 15,
            enemyType: ['soldier_1', 'soldier_2', 'soldier_3', 'officer_1']
        },
        7: {
            x: 6,
            y: -2,
            unlockedBy: '6',
            type: 'regular',
            difficulty: 18,
            enemyType: ['officer_1', 'officer_2', 'officer_3', 'sniper']
        },
        sign_2: {
            x: 7.5,
            y: -2.5,
            unlockedBy: '7',
            type: 'sign'
        },
        8: {
            x: 7,
            y: 1.5,
            unlockedBy: '7',
            type: 'regular',
            difficulty: 21,
            enemyType: ['officer_1', 'officer_2', 'officer_3', 'soldier_1']
        },
        9: {
            x: 5.5,
            y: 4,
            unlockedBy: '8',
            type: 'regular',
            difficulty: 24,
            enemyType: ['soldier_1', 'soldier_2', 'soldier_3', 'officer_1', 'officer_2', 'officer_3']
        },
        10: {
            x: 2,
            y: 2,
            unlockedBy: '9',
            type: 'regular',
            difficulty: 27,
            enemyType: ['soldier_1', 'officer_1', 'hunter', 'sniper']
        },
        sign_3: {
            x: 2.5,
            y: 0.5,
            unlockedBy: '10',
            type: 'sign'
        },
        boss_1: {
            x: 0,
            y: 0,
            unlockedBy: '10',
            type: 'boss',
            difficulty: 30,
            boss: ['ohilio_guard1', 'ohilio_guard2', 'ohilio'],
            reward: 'hordeAreaMonkeyJungle'
        },
        endless: {
            x: -1,
            y: 5,
            unlockedBy: '10',
            type: 'endless',
            difficulty: 30,
            enemyType: ['soldier_1', 'soldier_2', 'soldier_3', 'officer_1', 'officer_2', 'officer_3', 'hunter', 'sniper']
        },
        digsite: {
            x: 8,
            y: -6,
            unlockedBy: 'hordeMonsterToothWarzone',
            type: 'digsite',
            difficulty: 80,
            enemyType: ['armed_skeleton']
        },
    },
    decoration: [
        {x: 0, y: -0.5, rotate: 0, icon: 'mdi-tent', size: 3},
        {x: -8, y: 5, rotate: 0, icon: 'mdi-forest', size: 3},
        {x: -6.5, y: 3, rotate: 0, icon: 'mdi-forest', size: 2.25},
        {x: 4, y: -2, rotate: 0, icon: 'mdi-pine-tree-variant', size: 1.9},
        {x: -2, y: -5.5, rotate: 0, icon: 'mdi-truck-cargo-container', size: 1.2},
        {x: -8, y: 1, rotate: 0, icon: 'mdi-flag-variant', size: 1.75},
        {x: -6, y: -2.2, rotate: 160, icon: 'mdi-pistol', size: 0.75},
        {x: -5, y: -2.5, rotate: 110, icon: 'mdi-magazine-pistol', size: 0.5},
        {x: 1.5, y: -4.75, rotate: 0, icon: 'mdi-bridge', size: 1.5},
        {x: 6.5, y: -2.6, rotate: 80, icon: 'mdi-magazine-rifle', size: 0.5},
        {x: 6.5, y: 5, rotate: 0, icon: 'mdi-truck', size: 1.3},
        {x: 5.55, y: 5.25, rotate: 270, icon: 'mdi-ammunition', size: 0.5},
        {x: 5.6, y: 4.85, rotate: 0, icon: 'mdi-ammunition', size: 0.45},
        {x: 5.1, y: 5.1, rotate: 20, icon: 'mdi-ammunition', size: 0.7},
        {x: 1.9, y: -7.15, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: 1.65, y: -6.4, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: 1.5, y: -5.65, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: 1.5, y: -4, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: 1.3, y: -3.25, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: 0.9, y: -2.5, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: 0, y: -2.1, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -0.9, y: -2.3, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -1.8, y: -2.2, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -2.7, y: -1.8, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -3.2, y: -1.05, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -3.5, y: -0.4, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -3.6, y: 0.35, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -3.7, y: 1.1, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -3.4, y: 1.85, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -3.2, y: 2.6, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -3.5, y: 3.35, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -3.6, y: 4.1, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -4, y: 4.85, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -4.5, y: 5.6, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -4.8, y: 6.35, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -4.9, y: 7.1, rotate: 0, icon: 'mdi-waves', size: 1},
    ]
};
})();
const HO_MONKEYJUNGLE = (function() {
  return {
    unlock: 'hordeAreaMonkeyJungle',
    icon: 'mdi-temple-hindu',
    color: 'teal',
    zones: {
        1: {
            x: 8,
            y: -2,
            unlockedBy: null,
            type: 'regular',
            difficulty: 33,
            enemyType: ['strongMonkey', 'monkeyWizard_1']
        },
        2: {
            x: 5,
            y: -4,
            unlockedBy: '1',
            type: 'regular',
            difficulty: 36,
            enemyType: ['strongMonkey', 'monkeyWizard_1']
        },
        3: {
            x: 3,
            y: -5.5,
            unlockedBy: '2',
            type: 'regular',
            difficulty: 38,
            enemyType: ['monkeyWizard_1', 'monkeyWizard_2', 'monkeyWizard_3', 'monkeyDefender']
        },
        4: {
            x: 2,
            y: -3,
            unlockedBy: '2',
            type: 'regular',
            difficulty: 39,
            enemyAmount: 150,
            enemyType: ['strongMonkey', 'angryMonkey', 'dartMonkey', 'monkeyMonk']
        },
        5: {
            x: 0,
            y: -5,
            unlockedBy: '3',
            type: 'regular',
            difficulty: 40,
            enemyType: ['monkeyWizard_1', 'monkeyWizard_2', 'monkeyWizard_3', 'monkeyDefender']
        },
        6: {
            x: -2,
            y: -3.5,
            unlockedBy: ['4', '5'],
            type: 'regular',
            difficulty: 43,
            enemyType: ['angryMonkey', 'monkeyWizard_2']
        },
        7: {
            x: -5,
            y: -4,
            unlockedBy: '6',
            type: 'regular',
            difficulty: 46,
            enemyType: ['dartMonkey', 'monkeyWizard_3']
        },
        8: {
            x: -6,
            y: -0.5,
            unlockedBy: '7',
            type: 'regular',
            difficulty: 49,
            enemyType: ['strongMonkey', 'angryMonkey', 'monkeyWizard_1', 'monkeyWizard_2']
        },
        9: {
            x: -8,
            y: 1,
            unlockedBy: '8',
            type: 'regular',
            difficulty: 51,
            enemyAmount: 150,
            enemyType: ['strongMonkey', 'angryMonkey', 'dartMonkey', 'monkeyMonk']
        },
        10: {
            x: -4,
            y: -1.5,
            unlockedBy: '8',
            type: 'regular',
            difficulty: 52,
            enemyType: ['monkeyWizard_1', 'monkeyWizard_2', 'monkeyWizard_3', 'monkeyDefender']
        },
        11: {
            x: -7.5,
            y: 4,
            unlockedBy: '9',
            type: 'regular',
            difficulty: 56,
            enemyAmount: 50,
            enemyType: ['strongMonkey', 'angryMonkey', 'dartMonkey', 'monkeyMonk']
        },
        12: {
            x: -2.5,
            y: 1,
            unlockedBy: '10',
            type: 'regular',
            difficulty: 55,
            enemyType: ['monkeyWizard_1', 'monkeyWizard_2', 'monkeyWizard_3', 'monkeyDefender']
        },
        13: {
            x: -4,
            y: 3,
            unlockedBy: ['11', '12'],
            type: 'regular',
            difficulty: 58,
            enemyAmount: 150,
            enemyType: ['angryMonkey', 'dartMonkey', 'monkeyWizard_2', 'monkeyWizard_3']
        },
        14: {
            x: -0.5,
            y: 4,
            unlockedBy: '13',
            type: 'regular',
            difficulty: 62,
            enemyType: ['strongMonkey', 'dartMonkey', 'monkeyWizard_1', 'monkeyWizard_3']
        },
        15: {
            x: 2,
            y: 6,
            unlockedBy: '14',
            type: 'regular',
            difficulty: 64,
            enemyType: ['strongMonkey', 'angryMonkey', 'dartMonkey', 'monkeyMonk']
        },
        16: {
            x: 3.5,
            y: 1.5,
            unlockedBy: '14',
            type: 'regular',
            difficulty: 66,
            enemyType: ['monkeyWizard_1', 'monkeyWizard_2', 'monkeyWizard_3', 'monkeyDefender']
        },
        17: {
            x: 5,
            y: 5,
            unlockedBy: '15',
            type: 'regular',
            difficulty: 67,
            enemyType: ['strongMonkey', 'angryMonkey', 'dartMonkey', 'monkeyMonk']
        },
        18: {
            x: 7.5,
            y: 2,
            unlockedBy: ['16', '17'],
            type: 'regular',
            difficulty: 69,
            enemyType: ['angryMonkey', 'dartMonkey', 'monkeyWizard_2', 'monkeyWizard_3']
        },
        19: {
            x: 2.5,
            y: -0.5,
            unlockedBy: '18',
            type: 'regular',
            difficulty: 72,
            enemyType: ['strongMonkey', 'angryMonkey', 'dartMonkey', 'monkeyWizard_1', 'monkeyWizard_2', 'monkeyWizard_3']
        },
        boss_1: {
            x: -1,
            y: -1.5,
            unlockedBy: '19',
            type: 'boss',
            difficulty: 75,
            boss: ['chriz1', 'chriz2'],
            reward: 'hordeAreaLoveIsland'
        },
        endless: {
            x: 4,
            y: -2,
            unlockedBy: '19',
            type: 'endless',
            difficulty: 75,
            enemyType: ['strongMonkey', 'angryMonkey', 'dartMonkey', 'monkeyWizard_1', 'monkeyWizard_2', 'monkeyWizard_3']
        },
        digsite: {
            x: -8,
            y: -6.5,
            unlockedBy: 'hordeMonsterToothMonkeyJungle',
            type: 'digsite',
            difficulty: 125,
            enemyType: ['armed_skeleton']
        },
    },
    decoration: [
        {x: 8.2, y: -3.4, rotate: 0, icon: 'mdi-tent', size: 2},
        {x: 9, y: -1.4, rotate: 0, icon: 'mdi-campfire', size: 1},
        {x: 4.8, y: -6, rotate: 0, icon: 'mdi-palm-tree', size: 1.2},
        {x: 5.6, y: -6.4, rotate: 0, icon: 'mdi-tree', size: 1},
        {x: 7, y: -5.5, rotate: 0, icon: 'mdi-palm-tree', size: 1.8},
        {x: 7.3, y: -6.25, rotate: 0, icon: 'mdi-koala', size: 0.5},
        {x: 8.1, y: -6.6, rotate: 0, icon: 'mdi-grass', size: 0.6},
        {x: 9.3, y: -6.2, rotate: 0, icon: 'mdi-palm-tree', size: 1.4},
        {x: 8.9, y: -5.7, rotate: 0, icon: 'mdi-grass', size: 0.6},
        {x: 5.8, y: -4.4, rotate: 0, icon: 'mdi-grass', size: 0.6},
        {x: 1, y: -4, rotate: 0, icon: 'mdi-tree', size: 1},
        {x: 2.2, y: -4.3, rotate: 0, icon: 'mdi-palm-tree', size: 1},
        {x: 1.5, y: -6, rotate: 0, icon: 'mdi-grass', size: 0.6},
        {x: 2.6, y: -6.3, rotate: 0, icon: 'mdi-grass', size: 0.6},
        {x: -5, y: -6.1, rotate: 0, icon: 'mdi-palm-tree', size: 1.6},
        {x: -3, y: -5.5, rotate: 0, icon: 'mdi-palm-tree', size: 2.5},
        {x: -3.85, y: -5.55, rotate: 0, icon: 'mdi-spider-thread', size: 0.5},
        {x: -1.25, y: -5.8, rotate: 0, icon: 'mdi-tree', size: 1.1},
        {x: -9.5, y: -6.5, rotate: 0, icon: 'mdi-tree', size: 1},
        {x: -7, y: -6, rotate: 0, icon: 'mdi-tree', size: 1.45},
        {x: -4, y: -4.2, rotate: 0, icon: 'mdi-grass', size: 0.6},
        {x: -7.2, y: -4.6, rotate: 0, icon: 'mdi-grass', size: 0.6},
        {x: -8.5, y: -5, rotate: 0, icon: 'mdi-elephant', size: 1.1},
        {x: -7.4, y: -3.5, rotate: 0, icon: 'mdi-elephant', size: 1.25},
        {x: -9, y: -4.2, rotate: 0, icon: 'mdi-elephant', size: 0.8},
        {x: -8.5, y: -3.2, rotate: 0, icon: 'mdi-grass', size: 0.6},
        {x: -9.4, y: -2.4, rotate: 0, icon: 'mdi-palm-tree', size: 1.3},
        {x: -9.7, y: -0.7, rotate: 0, icon: 'mdi-tree', size: 1.1},
        {x: -7.8, y: -1.2, rotate: 0, icon: 'mdi-tree', size: 1.3},
        {x: -6.1, y: -2.7, rotate: 0, icon: 'mdi-tree', size: 1.2},
        {x: -6.35, y: -1, rotate: 0, icon: 'mdi-grass', size: 0.6},
        {x: -8.9, y: 0.8, rotate: 0, icon: 'mdi-palm-tree', size: 1.5},
        {x: -9.5, y: 2, rotate: 0, icon: 'mdi-palm-tree', size: 1},
        {x: -8.7, y: 2.5, rotate: 0, icon: 'mdi-grass', size: 0.6},
        {x: -8.3, y: 3.4, rotate: 0, icon: 'mdi-palm-tree', size: 1.2},
        {x: -9.7, y: 3.7, rotate: 0, icon: 'mdi-tortoise', size: 0.5},
        {x: -5.5, y: 1.5, rotate: 0, icon: 'mdi-volcano', size: 2},
        {x: -6.7, y: 1, rotate: 0, icon: 'mdi-tree', size: 1},
        {x: -6.6, y: 2.7, rotate: 0, icon: 'mdi-grass', size: 0.6},
        {x: -4.4, y: -0.1, rotate: 0, icon: 'mdi-palm-tree', size: 1.2},
        {x: -3.7, y: 1.3, rotate: 0, icon: 'mdi-palm-tree', size: 1},
        {x: -4, y: -2.5, rotate: 0, icon: 'mdi-palm-tree', size: 1.35},
        {x: -2.8, y: -2.8, rotate: 0, icon: 'mdi-grass', size: 0.6},
        {x: -0.5, y: -1.8, rotate: 0, icon: 'mdi-palm-tree', size: 0.8},
        {x: -1, y: -2.3, rotate: 0, icon: 'mdi-tree', size: 0.8},
        {x: -1.5, y: -1.9, rotate: 0, icon: 'mdi-palm-tree', size: 0.8},
        {x: -1.7, y: -1.2, rotate: 0, icon: 'mdi-palm-tree', size: 0.8},
        {x: -1.2, y: -0.7, rotate: 0, icon: 'mdi-palm-tree', size: 0.8},
        {x: -0.6, y: -0.9, rotate: 0, icon: 'mdi-grass', size: 0.5},
        {x: 1.4, y: -2.1, rotate: 0, icon: 'mdi-grass', size: 0.6},
        {x: 3.8, y: -0.9, rotate: 0, icon: 'mdi-grass', size: 0.6},
        {x: 1.7, y: 1, rotate: 0, icon: 'mdi-palm-tree', size: 1.2},
        {x: -1, y: 2.1, rotate: 0, icon: 'mdi-palm-tree', size: 1},
        {x: -0.5, y: 2.6, rotate: 0, icon: 'mdi-grass', size: 0.6},
        {x: 4, y: 2.8, rotate: 0, icon: 'mdi-palm-tree', size: 1.3},
        {x: 1.2, y: 3.9, rotate: 0, icon: 'mdi-grass', size: 0.6},
        {x: 2.75, y: 4.6, rotate: 0, icon: 'mdi-kangaroo', size: 0.75},
        {x: 6.6, y: 0.8, rotate: 0, icon: 'mdi-grass', size: 0.6},
        {x: 4.7, y: 6, rotate: 0, icon: 'mdi-palm-tree', size: 1.1},
        {x: 8.6, y: 3.5, rotate: 0, icon: 'mdi-palm-tree', size: 1.6},
        {x: 7.3, y: 4.2, rotate: 0, icon: 'mdi-grass', size: 0.6},
        {x: 8.1, y: 6.3, rotate: 0, icon: 'mdi-snake', size: 0.5},
        {x: 9.5, y: 5.6, rotate: 0, icon: 'mdi-grass', size: 0.6},
        {x: -9.9, y: 6.25, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -9.9, y: 7, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -9.05, y: 6.25, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -9.05, y: 7, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -8.2, y: 6, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -8.2, y: 6.9, rotate: 0, icon: 'mdi-shark-fin', size: 1},
        {x: -7.35, y: 6.25, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -7.35, y: 7, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -7.35, y: 5.75, rotate: 0, icon: 'mdi-wave', size: 1},
        {x: -6.5, y: 6.25, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -6.5, y: 7, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -6.5, y: 5.75, rotate: 0, icon: 'mdi-wave', size: 1},
        {x: -5.65, y: 6.25, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -5.65, y: 7, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -5.65, y: 5.75, rotate: 0, icon: 'mdi-wave', size: 1},
        {x: -5.65, y: 5.5, rotate: 0, icon: 'mdi-wave', size: 1},
        {x: -4.8, y: 6.25, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -4.8, y: 7, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -4.8, y: 5.75, rotate: 0, icon: 'mdi-wave', size: 1},
        {x: -4.8, y: 5.5, rotate: 0, icon: 'mdi-wave', size: 1},
        {x: -3.95, y: 6.25, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -3.95, y: 7, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -3.95, y: 5.75, rotate: 0, icon: 'mdi-wave', size: 1},
        {x: -3.95, y: 5.5, rotate: 0, icon: 'mdi-wave', size: 1},
        {x: -3.1, y: 6.25, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -3.1, y: 7, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -3.1, y: 5.75, rotate: 0, icon: 'mdi-wave', size: 1},
        {x: -2.25, y: 6.25, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -2.25, y: 7, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -1.4, y: 7, rotate: 0, icon: 'mdi-waves', size: 1},
        {x: -1.4, y: 6.5, rotate: 0, icon: 'mdi-wave', size: 1},
        {x: -0.55, y: 7.25, rotate: 0, icon: 'mdi-wave', size: 1},
        {x: -9.2, y: 5.45, rotate: 0, icon: 'mdi-palm-tree', size: 1},
        {x: -5, y: 4.85, rotate: 0, icon: 'mdi-palm-tree', size: 1.2},
        {x: -3.2, y: 5.2, rotate: 0, icon: 'mdi-palm-tree', size: 1},
        {x: -0.4, y: 6.6, rotate: 0, icon: 'mdi-palm-tree', size: 1.1},
    ]
};
})();
const HO_LOVEISLAND = (function() {
  return {
    unlock: 'hordeAreaLoveIsland',
    icon: 'mdi-heart-multiple',
    color: 'babypink',
    zones: {
        sign_4: {
            x: -3.25,
            y: 5.5,
            unlockedBy: null,
            type: 'sign'
        },
        1: {
            x: -0.7,
            y: 5,
            unlockedBy: null,
            type: 'regular',
            difficulty: 78,
            enemyType: ['seal', 'guineaPig']
        },
        2: {
            x: -3.5,
            y: 2.5,
            unlockedBy: '1',
            type: 'regular',
            difficulty: 81,
            enemyType: ['seal', 'guineaPig', 'puppy']
        },
        3: {
            x: -6.25,
            y: -0.25,
            unlockedBy: '2',
            type: 'regular',
            difficulty: 84,
            enemyType: ['guineaPig', 'puppy']
        },
        4: {
            x: -7,
            y: -3.5,
            unlockedBy: '3',
            type: 'regular',
            difficulty: 87,
            enemyType: ['puppy', 'rabbit']
        },
        5: {
            x: -5.25,
            y: -5.5,
            unlockedBy: '4',
            type: 'regular',
            difficulty: 90,
            enemyType: ['guineaPig', 'puppy', 'rabbit']
        },
        6: {
            x: -3,
            y: -6,
            unlockedBy: '5',
            type: 'regular',
            difficulty: 93,
            enemyType: ['rabbit', 'kitten']
        },
        7: {
            x: -1,
            y: -4.5,
            unlockedBy: '6',
            type: 'regular',
            difficulty: 96,
            enemyType: ['seal', 'rabbit', 'puppy', 'kitten']
        },
        8: {
            x: 0,
            y: -2.5,
            unlockedBy: '7',
            type: 'regular',
            difficulty: 99,
            enemyType: ['puppy', 'kitten']
        },
        9: {
            x: 1,
            y: -4.5,
            unlockedBy: '8',
            type: 'regular',
            difficulty: 102,
            enemyType: ['seal', 'guineaPig', 'kitten']
        },
        10: {
            x: 3,
            y: -6,
            unlockedBy: '9',
            type: 'regular',
            difficulty: 105,
            enemyType: ['puppy', 'rabbit', 'kitten']
        },
        11: {
            x: 5.25,
            y: -5.5,
            unlockedBy: '10',
            type: 'regular',
            difficulty: 108,
            enemyType: ['kitten', 'piglet']
        },
        12: {
            x: 7,
            y: -3.5,
            unlockedBy: '11',
            type: 'regular',
            difficulty: 111,
            enemyType: ['piglet', 'guineaPig']
        },
        13: {
            x: 6.25,
            y: -0.25,
            unlockedBy: '12',
            type: 'regular',
            difficulty: 114,
            enemyType: ['seal', 'panda']
        },
        14: {
            x: 3.5,
            y: 2.5,
            unlockedBy: '13',
            type: 'regular',
            difficulty: 117,
            enemyType: ['piglet', 'panda', 'koala']
        },
        boss_1: {
            x: 0,
            y: 3.6,
            unlockedBy: '14',
            type: 'boss',
            difficulty: 120,
            boss: ['mina'],
            reward: 'hordeEndOfContent'
        },
        endless: {
            x: 0.7,
            y: 5,
            unlockedBy: '14',
            type: 'endless',
            difficulty: 120,
            enemyType: ['seal', 'guineaPig', 'puppy', 'rabbit', 'kitten', 'piglet', 'panda', 'koala']
        },
        digsite: {
            x: 8,
            y: 6.5,
            unlockedBy: 'hordeMonsterToothLoveIsland',
            type: 'digsite',
            difficulty: 170,
            enemyType: ['armed_skeleton']
        },
    },
    decoration: [
        {x: 0, y: 3.75, rotate: 0, icon: 'mdi-seat', size: 2},
        {x: -8.5, y: 1.2, rotate: 0, icon: 'mdi-home-variant', size: 3},
        {x: -8.5, y: 1.9, rotate: -20, icon: 'mdi-dog', size: 0.75},
        {x: -6, y: 2.2, rotate: 0, icon: 'mdi-dog-side', size: 1},
        {x: -8, y: 3.2, rotate: -30, icon: 'mdi-bone', size: 0.6},
        {x: -7.6, y: 3.5, rotate: 20, icon: 'mdi-bone', size: 0.5},
        {x: -7.9, y: -1, rotate: 70, icon: 'mdi-tennis-ball', size: 0.4},
        {x: 0.4, y: -6.3, rotate: 0, icon: 'mdi-inbox', size: 2},
        {x: 0.4, y: -6.45, rotate: 0, icon: 'mdi-cat', size: 1},
        {x: -7.5, y: -5.7, rotate: 0, icon: 'mdi-grass', size: 1.25},
        {x: -7.4, y: -6.35, rotate: 15, icon: 'mdi-rabbit-variant', size: 0.7},
        {x: -8.7, y: -4, rotate: 0, icon: 'mdi-rabbit', size: 0.8},
        {x: -8, y: -3.83, rotate: 70, icon: 'mdi-carrot', size: 0.6},
        {x: 6.6, y: -6.1, rotate: 0, icon: 'mdi-pig-variant', size: 0.6},
        {x: 8.5, y: -6.4, rotate: 0, icon: 'mdi-pig-variant', size: 0.65},
        {x: 7.7, y: -5.5, rotate: 0, icon: 'mdi-pig-variant', size: 0.8},
        {x: 8.4, y: -5.33, rotate: 70, icon: 'mdi-carrot', size: 0.6},
        {x: 7, y: 3.1, rotate: 0, icon: 'mdi-palm-tree', size: 2.5},
        {x: 7.4, y: 2, rotate: 40, icon: 'mdi-koala', size: 1},
        {x: 8.1, y: -1, rotate: 0, icon: 'mdi-panda', size: 1.2},
        {x: 8.1, y: 0, rotate: 0, icon: 'mdi-package', size: 1.5},
    ]
};
})();

const HO_GOOBOO = {
  fighterClass: { adventurer: HO_ADVENTURER, archer: HO_ARCHER, assassin: HO_ASSASSIN, cultist: HO_CULTIST, knight: HO_KNIGHT, mage: HO_MAGE, pirate: HO_PIRATE, scholar: HO_SCHOLAR, shaman: HO_SHAMAN, undead: HO_UNDEAD },
  area: { warzone: HO_WARZONE, monkeyJungle: HO_MONKEYJUNGLE, loveIsland: HO_LOVEISLAND },
  achievement: HO_ACHIEVEMENT, heirloom: HO_HEIRLOOM, equipment: HO_EQUIPMENT, relic: HO_RELIC,
  sigil: HO_SIGIL, sigil_boss: HO_SIGILBOSS, upgrade: HO_UPGRADE, upgrade2: HO_UPGRADE2,
  upgradePremium: HO_UPGRADEPREM, upgradePrestige: HO_UPGRADEPREST, tower: HO_TOWER,
  battlePass: HO_BATTLEPASS, enemyType: HO_ENEMYTYPE, boss: HO_BOSS, trinket: HO_TRINKET,
  element: HO_ELEMENT, card: HO_CARD, cardList: HO_CARDLIST
};

if (typeof module !== "undefined") module.exports = { HO_GOOBOO };