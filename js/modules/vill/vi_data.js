/* ============================================================
 * vi_data.js —— 宗门(village) 数据（自动生成：照抄 gooboo，勿手改数值）
 *   building/job/offering/policy/craftingRecipe/upgrade{2,Prestige,Premium}
 *   + mult/multGroup/unlock/stat/currency（来自 modules/village.js）
 * 仅机械变换：import/export 剥离；函数内 `store` 改写为 `VSTORE`。
 * ============================================================ */
const VI_B = {
    // Tier 0 buildings
    campfire: {cap: 1, persistent: true, icon: 'gb-campfire', note: 'village_1', price() {
        return {village_wood: 5, village_stone: 5};
    }, timeNeeded() {
        return 5;
    }, effect: [
        {name: 'villageBuildings1', type: 'unlock', value: lvl => lvl >= 1}
    ]},

    // Tier 1 buildings
    hut: {cap: 25, capMult: true, subtype: 'housing', icon: 'gb-hut', note: 'village_2', requirement() {
        return VSTORE.state.unlock.villageBuildings1.use;
    }, price(lvl) {
        return {village_plantFiber: Math.pow(1.35, lvl) * 15, village_wood: Math.pow(1.32, lvl) * 10};
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.25, lvl) * 10);
    }, effect: [
        {name: 'villageWorker', type: 'base', value: lvl => lvl}
    ]},
    farm: {cap: 10, capMult: true, persistent: true, subtype: 'workstation', icon: 'gb-farm', note: 'village_3', requirement() {
        return VSTORE.state.unlock.villageBuildings1.use;
    }, price(lvl) {
        return {village_wood: Math.pow(1.65, lvl) * 200, village_stone: Math.pow(1.65, lvl) * 400};
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.33, lvl) * 40);
    }, effect: [
        {name: 'farmer', type: 'villageJob', value: lvl => lvl},
        {name: 'currencyVillagePlantFiberCap', type: 'base', value: lvl => lvl > 1 ? (250 * (lvl - 1)) : null}
    ]},
    plantation: {cap: 10, capMult: true, persistent: true, subtype: 'workstation', icon: 'gb-plantation', note: 'village_4', requirement() {
        return VSTORE.state.unlock.villageBuildings1.use;
    }, price(lvl) {
        return {village_plantFiber: Math.pow(1.65, lvl) * 750, village_stone: Math.pow(1.65, lvl) * 430};
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.33, lvl) * 50);
    }, effect: [
        {name: 'harvester', type: 'villageJob', value: lvl => lvl},
        {name: 'currencyVillageWoodCap', type: 'base', value: lvl => lvl > 1 ? (250 * (lvl - 1)) : null}
    ]},
    mine: {cap: 10, capMult: true, persistent: true, subtype: 'workstation', icon: 'gb-mine', note: 'village_5', requirement() {
        return VSTORE.state.unlock.villageBuildings1.use;
    }, price(lvl) {
        return {village_wood: Math.pow(1.65, lvl) * 1150};
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.33, lvl) * 60);
    }, effect: [
        {name: 'miner', type: 'villageJob', value: lvl => lvl},
        {name: 'currencyVillageStoneCap', type: 'base', value: lvl => lvl > 1 ? (250 * (lvl - 1)) : null}
    ]},
    communityCenter: {cap: 1, persistent: true, icon: 'gb-communityCenter', note: 'village_6', requirement() {
        return VSTORE.state.unlock.villageBuildings1.use;
    }, timeNeeded() {
        return 750;
    }, price() {
        return {village_wood: 1800, village_stone: 1650, village_metal: 100};
    }, effect: [
        {name: 'villageBuildings2', type: 'unlock', value: lvl => lvl >= 1}
    ]},

    // Tier 2 buildings
    smallHouse: {cap: 25, capMult: true, subtype: 'housing', icon: 'gb-smallHouse', note: 'village_7', requirement() {
        return VSTORE.state.unlock.villageBuildings2.use;
    }, price(lvl) {
        return {village_wood: Math.pow(1.35, lvl) * 2750, village_metal: Math.pow(1.35, lvl) * 250, village_water: Math.pow(1.5, lvl) * 400};
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.25, lvl) * 210);
    }, effect: [
        {name: 'villageWorker', type: 'base', value: lvl => lvl}
    ]},
    crane: {cap: 20, icon: 'gb-crane', note: 'village_31', requirement() {
        return VSTORE.state.unlock.villageBuildings2.use;
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.2, lvl) * 45);
    }, price(lvl) {
        return {village_wood: Math.pow(1.5, lvl) * 580, village_metal: Math.pow(1.35, lvl) * 275};
    }, effect: [
        {name: 'queueSpeedVillageBuilding', type: 'base', value: lvl => lvl}
    ]},
    treasury: {cap: 10, hasDescription: true, icon: 'gb-treasury', note: 'village_9', requirement() {
        return VSTORE.state.unlock.villageBuildings2.use;
    }, price(lvl) {
        let obj = {village_plantFiber: Math.pow(1.25, Math.max(0, lvl - 9)) * Math.pow(1.5, lvl) * 2600};
        if (lvl <= 0) {
            obj.village_fruit = 325;
            obj.village_grain = 550;
        }
        return obj;
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.4, lvl) * 240);
    }, effect: [
        {name: 'villageCoinUpgrades', type: 'unlock', value: lvl => lvl >= 1},
        {name: 'villageTaxRate', type: 'base', value: lvl => splicedLinear(0.025, 0.01, 10, lvl)}
    ]},
    storage: {cap: 20, icon: 'gb-storage', note: 'village_8', requirement() {
        return VSTORE.state.unlock.villageBuildings2.use;
    }, price(lvl) {
        let obj = {village_plantFiber: Math.pow(lvl * 0.02 + 1.15, lvl) * 900, village_wood: Math.pow(lvl * 0.02 + 1.15, lvl) * 900, village_stone: Math.pow(lvl * 0.02 + 1.18, lvl) * 1400};
        if (lvl <= 0) {
            obj.village_coin = 50;
        }
        return obj;
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.15, lvl) * 225);
    }, effect: [
        {name: 'villageFoundationMaterialCap', type: 'mult', value: lvl => Math.pow(1.2, lvl)},
        {name: 'currencyVillageMetalCap', type: 'mult', value: lvl => lvl > 5 ? Math.pow(1.2, lvl - 5) : null}
    ]},
    forge: {cap: 20, icon: 'gb-forge', requirement() {
        return VSTORE.state.unlock.villageBuildings2.use;
    }, price(lvl) {
        return {village_stone: Math.pow(lvl * 0.02 + 1.25, lvl) * 2750, village_metal: Math.pow(lvl * 0.02 + 1.18, lvl) * 250};
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.3, lvl) * 180);
    }, effect: [
        {name: 'currencyVillageMetalGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'currencyVillageMetalCap', type: 'base', value: lvl => lvl * 200}
    ]},
    safe: {cap: 20, icon: 'gb-safe', note: 'village_10', requirement() {
        return VSTORE.state.unlock.villageBuildings2.use;
    }, price(lvl) {
        return {village_metal: Math.pow(lvl * 0.02 + 1.2, lvl) * 900, village_coin: Math.pow(lvl * 0.02 + 1.18, lvl) * 150};
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.3, lvl) * 270);
    }, effect: [
        {name: 'currencyVillageCoinCap', type: 'base', value: lvl => lvl * 100},
        {name: 'currencyVillageCoinCap', type: 'mult', value: lvl => Math.pow(1.2, lvl)}
    ]},
    well: {cap: 10, capMult: true, subtype: 'workstation', icon: 'gb-well', note: 'village_11', requirement() {
        return VSTORE.state.unlock.villageBuildings2.use;
    }, price(lvl) {
        return {village_plantFiber: Math.pow(1.65, lvl) * 6800, village_wood: Math.pow(1.65, lvl) * 4500, village_stone: Math.pow(1.65, lvl) * 5000};
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.33, lvl) * 300);
    }, effect: [
        {name: 'wellWorker', type: 'villageJob', value: lvl => lvl},
        {name: 'currencyVillageWaterCap', type: 'base', value: lvl => lvl > 1 ? (1000 * Math.min(lvl - 1, 9)) : null},
        {name: 'currencyVillageWaterCap', type: 'mult', value: lvl => lvl > 1 ? Math.pow(1.5, Math.min(lvl - 1, 9)) : null}
    ]},
    garden: {cap: 20, icon: 'gb-garden', note: 'village_12', requirement() {
        return VSTORE.state.unlock.villageBuildings2.use;
    }, price(lvl) {
        return {village_plantFiber: Math.pow(1.25, lvl) * 8750, village_water: Math.pow(1.33, lvl) * 500};
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.3, lvl) * 480);
    }, effect: [
        {name: 'currencyVillagePlantFiberCap', type: 'mult', value: lvl => lvl * 0.15 + 1},
        {name: 'currencyVillageCoinCap', type: 'base', value: lvl => lvl * 50}
    ]},
    townHall: {cap: 1, persistent: true, icon: 'gb-townHall', note: 'village_13', requirement() {
        return VSTORE.state.unlock.villageBuildings2.use;
    }, timeNeeded() {
        return buildNum(14.4, 'K');
    }, price() {
        return {village_wood: buildNum(12.8, 'K'), village_stone: buildNum(10.5, 'K'), village_metal: 3150, village_water: 2900};
    }, effect: [
        {name: 'villageBuildings3', type: 'unlock', value: lvl => lvl >= 1}
    ]},

    // Tier 3 buildings
    house: {cap: 25, capMult: true, subtype: 'housing', icon: 'gb-house', note: 'village_14', requirement() {
        return VSTORE.state.unlock.villageBuildings3.use;
    }, price(lvl) {
        return {
            village_plantFiber: Math.pow(1.35, lvl) * buildNum(17.8, 'K'),
            village_wood: Math.pow(1.35, lvl) * buildNum(16, 'K'),
            village_metal: Math.pow(1.35, lvl) * 2600,
            village_knowledge: lvl * 5 + 75
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.25, lvl) * 900);
    }, effect: [
        {name: 'villageWorker', type: 'base', value: lvl => lvl}
    ]},
    shed: {icon: 'gb-shed', cap: 5, requirement() {
        return VSTORE.state.unlock.villageBuildings3.use;
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.75, lvl) * 1600);
    }, price(lvl) {
        return {village_wood: Math.pow(1.8, lvl) * buildNum(14.5, 'K'), village_stone: Math.pow(2.05, lvl) * 9000, village_metal: Math.pow(1.7, lvl) * 5200};
    }, effect: [
        {name: 'currencyVillageWaterCap', type: 'mult', value: lvl => lvl * 0.2 + 1},
        {name: 'villageUpgradeScythe', type: 'unlock', value: lvl => lvl >= 1},
        {name: 'villageUpgradeHatchet', type: 'unlock', value: lvl => lvl >= 2},
        {name: 'villageUpgradePickaxe', type: 'unlock', value: lvl => lvl >= 3},
        {name: 'villageUpgradeWateringCan', type: 'unlock', value: lvl => lvl >= 4},
        {name: 'villageUpgradeInvestment', type: 'unlock', value: lvl => lvl >= 5}
    ]},
    tunnel: {icon: 'gb-tunnel', cap: 15, requirement() {
        return VSTORE.state.unlock.villageBuildings3.use;
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.3, lvl) * 1350);
    }, price(lvl) {
        return {village_plantFiber: Math.pow(1.35, lvl) * buildNum(12, 'K'), village_water: Math.pow(1.5, lvl) * 850};
    }, effect: [
        {name: 'currencyVillageStoneGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'currencyVillageStoneCap', type: 'mult', value: lvl => lvl * 0.2 + 1}
    ]},
    sawmill: {icon: 'gb-sawmill', cap: 15, requirement() {
        return VSTORE.state.unlock.villageBuildings3.use;
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.3, lvl) * 1500);
    }, price(lvl) {
        return {village_metal: Math.pow(1.3, lvl) * 3200, village_water: Math.pow(1.5, lvl) * 1150};
    }, effect: [
        {name: 'currencyVillageWoodGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'currencyVillageWoodCap', type: 'mult', value: lvl => lvl * 0.2 + 1}
    ]},
    library: {cap: 10, capMult: true, subtype: 'workstation', icon: 'gb-library', note: 'village_15', requirement() {
        return VSTORE.state.unlock.villageBuildings3.use;
    }, price(lvl) {
        return {village_wood: Math.pow(1.65, lvl) * buildNum(15, 'K'), village_water: Math.pow(1.85, lvl) * 6100};
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.33, lvl) * 2100);
    }, effect: [
        {name: 'librarian', type: 'villageJob', value: lvl => lvl},
        {name: 'currencyVillageKnowledgeCap', type: 'base', value: lvl => lvl > 1 ? (5 * (lvl - 1)) : null}
    ]},
    aquarium: {icon: 'gb-aquarium', cap: 20, note: 'village_16', requirement() {
        return VSTORE.state.unlock.villageBuildings3.use;
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.3, lvl) * 2400);
    }, price(lvl) {
        return {village_water: Math.pow(1.5, lvl) * 4400, village_knowledge: lvl * 10 + 35};
    }, effect: [
        {name: 'currencyVillageMetalCap', type: 'mult', value: lvl => lvl * 0.15 + 1},
        {name: 'currencyVillageCoinCap', type: 'mult', value: lvl => lvl * 0.15 + 1}
    ]},
    glassBlowery: {cap: 10, capMult: true, subtype: 'workstation', icon: 'gb-glassBlowery', note: 'village_17', requirement() {
        return VSTORE.state.unlock.villageBuildings3.use;
    }, price(lvl) {
        return {village_metal: Math.pow(1.65, lvl) * buildNum(12, 'K'), village_water: Math.pow(1.85, lvl) * buildNum(24, 'K')};
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.33, lvl) * 3000);
    }, effect: [
        {name: 'glassblower', type: 'villageJob', value: lvl => lvl},
        {name: 'currencyVillageGlassCap', type: 'base', value: lvl => lvl > 1 ? (250 * (lvl - 1)) : null}
    ]},
    knowledgeTower: {cap: 50, icon: 'gb-knowledgeTower', note: 'village_19', requirement() {
        return VSTORE.state.unlock.villageBuildings3.use;
    }, price(lvl) {
        return {
            village_plantFiber: Math.pow(1.5, lvl) * buildNum(44, 'K'),
            village_stone: Math.pow(1.5, lvl) * buildNum(35, 'K'),
            village_glass: Math.pow(1.5, lvl) * 450,
            village_knowledge: Math.ceil(lvl * 8 * Math.pow(1.05, lvl) + 50)
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.24, lvl) * 3300);
    }, effect: [
        {name: 'currencyVillageGlassCap', type: 'base', value: lvl => lvl * 250},
        {name: 'currencyVillageWaterCap', type: 'mult', value: lvl => lvl * 0.2 + 1},
        {name: 'currencyVillageKnowledgeCap', type: 'base', value: lvl => lvl * 3}
    ]},
    miniatureSmith: {cap: 25, capMult: true, subtype: 'housing', icon: 'gb-miniatureSmith', requirement() {
        return VSTORE.state.unlock.villageBuildings3.use;
    }, price(lvl) {
        return {
            village_wood: Math.pow(1.65, lvl) * buildNum(60, 'K'),
            village_stone: Math.pow(1.65, lvl) * buildNum(35, 'K'),
            village_glass: Math.pow(1.4, lvl) * 600
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.25, lvl) * 2500);
    }, effect: [
        {name: 'currencyVillageMetalGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'villageWorker', type: 'base', value: lvl => lvl > 4 ? Math.floor(lvl / 5) : null}
    ]},
    church: {cap: 25, hasDescription: true, icon: 'gb-church', note: 'village_18', requirement() {
        return VSTORE.state.unlock.villageBuildings3.use;
    }, price(lvl) {
        return {
            village_wood: Math.pow(1.65, lvl) * buildNum(65, 'K'),
            village_stone: Math.pow(1.65, lvl) * buildNum(85, 'K'),
            village_glass: Math.pow(1.5, lvl) * 1700
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.3, lvl) * 4800);
    }, effect: [
        {name: 'currencyVillageFaithGain', type: 'base', value: lvl => getSequence(1, lvl) * 0.02}
    ]},
    school: {icon: 'gb-school', cap: 5, note: 'village_20', requirement() {
        return VSTORE.state.unlock.villageBuildings3.use;
    }, price(lvl) {
        return {
            village_plantFiber: Math.pow(2.25, lvl) * buildNum(400, 'K'),
            village_metal: Math.pow(2.25, lvl) * buildNum(45, 'K'),
            village_glass: Math.pow(2.1, lvl) * 4800,
            village_coin: Math.pow(1.85, lvl) * buildNum(70, 'K')
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.6, lvl) * 3600);
    }, effect: [
        {name: 'currencyVillageKnowledgeCap', type: 'base', value: lvl => lvl * 5},
        {name: 'villageUpgradeBasics', type: 'unlock', value: lvl => lvl >= 1},
        {name: 'villageUpgradeProcessing', type: 'unlock', value: lvl => lvl >= 2},
        {name: 'villageUpgradePump', type: 'unlock', value: lvl => lvl >= 3},
        {name: 'villageUpgradeSand', type: 'unlock', value: lvl => lvl >= 4},
        {name: 'villageUpgradeBook', type: 'unlock', value: lvl => lvl >= 5}
    ]},
    localGovernment: {cap: 1, note: 'village_21', persistent: true, icon: 'gb-localGovernment', requirement() {
        return VSTORE.state.unlock.villageBuildings3.use;
    }, timeNeeded() {
        return buildNum(240, 'K');
    }, price() {
        return {village_plantFiber: buildNum(1.02, 'M'), village_wood: buildNum(975, 'K'), village_glass: buildNum(16, 'K'), village_coin: buildNum(280, 'K')};
    }, effect: [
        {name: 'villageBuildings4', type: 'unlock', value: lvl => lvl >= 1}
    ]},

    // Tier 4 buildings
    apartment: {cap: 25, capMult: true, subtype: 'housing', icon: 'gb-apartment', requirement() {
        return VSTORE.state.unlock.villageBuildings4.use;
    }, price(lvl) {
        return {
            village_wood: Math.pow(1.65, lvl) * buildNum(20, 'M'),
            village_glass: Math.pow(1.65, lvl) * buildNum(29.5, 'K'),
            village_hardwood: Math.pow(1.3, lvl) * 1500,
            village_gem: Math.pow(1.35, lvl) * 600
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.25, lvl) * 7200);
    }, effect: [
        {name: 'villageWorker', type: 'base', value: lvl => lvl * 2}
    ]},
    temple: {cap: 30, icon: 'gb-temple', requirement() {
        return VSTORE.state.unlock.villageBuildings4.use;
    }, price(lvl) {
        return {
            village_glass: Math.pow(1.25, lvl) * 8000,
            village_water: Math.pow(1.5, lvl) * buildNum(2, 'M'),
            village_coin: Math.pow(1.45, lvl) * buildNum(100, 'K'),
            village_knowledge: 15 * lvl + 125,
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.3, lvl) * buildNum(62.5, 'K'));
    }, effect: [
        {name: 'currencyVillageFaithCap', type: 'mult', value: lvl => Math.pow(1.2, lvl)}
    ]},
    obelisk: {cap: 0, capMult: true, icon: 'gb-obelisk', requirement() {
        return VSTORE.state.unlock.villageBuildings4.use;
    }, price(lvl) {
        return {village_coin: Math.pow(4.5, lvl) * buildNum(50, 'K')};
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.45, lvl) * buildNum(50, 'K'));
    }, effect: [
        {name: 'currencyVillageCoinCap', type: 'mult', value: lvl => Math.pow(2, lvl)},
        {name: 'villageMaterialCap', type: 'mult', value: lvl => Math.pow(1.2, lvl)}
    ]},
    offeringPedestal: {cap: 4, hasDescription: true, note: 'village_23', icon: 'gb-offeringPedestal', requirement() {
        return VSTORE.state.unlock.villageBuildings4.use;
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(3, lvl) * buildNum(32.5, 'K'));
    }, price(lvl) {
        return [
            {village_plantFiber: buildNum(2, 'M'), village_wood: buildNum(2, 'M'), village_stone: buildNum(2, 'M')},
            {village_coin: buildNum(10, 'M'), village_metal: buildNum(3, 'M'), village_water: buildNum(5, 'M')},
            {village_glass: buildNum(120, 'K'), village_hardwood: buildNum(40, 'K'), village_gem: buildNum(40, 'K')},
            {village_knowledge: 600, village_science: 200, village_joy: 750}
        ][lvl];
    }, effect: [
        {name: 'villageOffering1', type: 'unlock', value: lvl => lvl >= 1},
        {name: 'villageOffering2', type: 'unlock', value: lvl => lvl >= 2},
        {name: 'villageOffering3', type: 'unlock', value: lvl => lvl >= 3},
        {name: 'villageOffering4', type: 'unlock', value: lvl => lvl >= 4}
    ]},
    theater: {cap: 5, capMult: true, note: 'village_24', subtype: 'workstation', icon: 'gb-theater', requirement() {
        return VSTORE.state.unlock.villageBuildings4.use;
    }, price(lvl) {
        let obj = {village_stone: Math.pow(2.15, lvl) * buildNum(3, 'M'), village_glass: Math.pow(1.8, lvl) * buildNum(14.8, 'K')};
        if (lvl >= 1) {
            obj.village_hardwood = Math.pow(1.75, lvl - 1) * 2000;
        }
        if (lvl >= 2) {
            obj.village_gem = Math.pow(1.75, lvl - 2) * 2750;
        }
        return obj;
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.33, lvl) * buildNum(60, 'K'));
    }, effect: [
        {name: 'entertainer', type: 'villageJob', value: lvl => lvl}
    ]},
    lumberjackHut: {cap: 10, capMult: true, note: 'village_25', subtype: 'workstation', icon: 'gb-lumberjackHut', requirement() {
        return VSTORE.state.unlock.villageBuildings4.use;
    }, price(lvl) {
        return {village_plantFiber: Math.pow(1.85, lvl) * buildNum(7.7, 'M'), village_metal: Math.pow(1.85, lvl) * buildNum(1.35, 'M')};
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.3, lvl) * buildNum(10, 'K'));
    }, effect: [
        {name: 'lumberjack', type: 'villageJob', value: lvl => lvl},
        {name: 'currencyVillageHardwoodCap', type: 'base', value: lvl => lvl > 1 ? (200 * (lvl - 1)) : null}
    ]},
    deepMine: {cap: 10, capMult: true, note: 'village_26', subtype: 'workstation', icon: 'gb-deepMine', requirement() {
        return VSTORE.state.unlock.villageBuildings4.use;
    }, price(lvl) {
        return {
            village_wood: Math.pow(1.85, lvl) * buildNum(13, 'M'),
            village_knowledge: lvl * 10 + 165,
            village_hardwood: Math.pow(1.65, lvl) * 500
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.33, lvl) * buildNum(12, 'K'));
    }, effect: [
        {name: 'blastMiner', type: 'villageJob', value: lvl => lvl},
        {name: 'currencyVillageGemCap', type: 'base', value: lvl => lvl > 1 ? (200 * (lvl - 1)) : null}
    ]},
    bigStorage: {cap: 20, capMult: true, icon: 'gb-bigStorage', requirement() {
        return VSTORE.state.unlock.villageBuildings4.use;
    }, price(lvl) {
        return {village_hardwood: Math.pow(lvl * 0.03 + 1.25, lvl) * 900, village_gem: Math.pow(lvl * 0.03 + 1.25, lvl) * 900};
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.15, lvl) * buildNum(15, 'K'));
    }, effect: [
        {name: 'currencyVillageWaterCap', type: 'mult', value: lvl => splicedPowLinear(1.25, 0.2, 20, lvl)},
        {name: 'currencyVillageHardwoodCap', type: 'mult', value: lvl => splicedPowLinear(1.2, 0.1, 20, lvl)},
        {name: 'currencyVillageGemCap', type: 'mult', value: lvl => splicedPowLinear(1.2, 0.1, 20, lvl)}
    ]},
    luxuryHouse: {cap: 25, capMult: true, note: 'village_27', subtype: 'housing', icon: 'gb-luxuryHouse', requirement() {
        return VSTORE.state.unlock.villageBuildings4.use;
    }, price(lvl) {
        return {
            village_metal: Math.pow(1.65, lvl) * buildNum(7, 'M'),
            village_hardwood: Math.pow(1.35, lvl) * 4000,
            village_gem: Math.pow(1.3, lvl) * 9200,
            village_coin: Math.pow(2.15, lvl) * buildNum(25, 'M')
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.25, lvl) * buildNum(18, 'K'));
    }, effect: [
        {name: 'villageWorker', type: 'base', value: lvl => lvl},
        {name: 'villageHappiness', type: 'base', value: lvl => lvl * 0.002}
    ]},
    lake: {cap: 10, capMult: true, note: 'village_28', subtype: 'workstation', icon: 'gb-lake', requirement() {
        return VSTORE.state.unlock.villageBuildings4.use;
    }, price(lvl) {
        return {
            village_water: Math.pow(2.25, lvl) * buildNum(50, 'M'),
            village_glass: Math.pow(1.65, lvl) * buildNum(60, 'K'),
            village_gem: Math.pow(1.65, lvl) * buildNum(11, 'K')
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.33, lvl) * buildNum(20, 'K'));
    }, effect: [
        {name: 'fisherman', type: 'villageJob', value: lvl => lvl}
    ]},
    gemSawBlade: {icon: 'gb-gemSawBlade', requirement() {
        return VSTORE.state.unlock.villageBuildings4.use;
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.15, lvl) * buildNum(30, 'K'));
    }, price(lvl) {
        return {village_stone: Math.pow(1.85, lvl) * buildNum(75, 'M'), village_gem: Math.ceil(Math.pow(1.5, lvl) * buildNum(15, 'K'))};
    }, effect: [
        {name: 'queueSpeedVillageBuilding', type: 'mult', value: lvl => Math.pow(1.2, lvl)}
    ]},
    miniatureGlassblowery: {cap: 25, capMult: true, subtype: 'housing', icon: 'gb-miniatureGlassblowery', requirement() {
        return VSTORE.state.unlock.villageBuildings4.use;
    }, price(lvl) {
        return {
            village_plantFiber: Math.pow(1.5, lvl) * buildNum(125, 'M'),
            village_water: Math.pow(1.85, lvl) * buildNum(120, 'M'),
            village_hardwood: Math.pow(1.3, lvl) * buildNum(12.5, 'K')
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.25, lvl) * buildNum(14, 'K'));
    }, effect: [
        {name: 'currencyVillageGlassGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'villageWorker', type: 'base', value: lvl => lvl > 4 ? Math.floor(lvl / 5) : null}
    ]},
    lostPages: {icon: 'gb-lostPages', cap: 10, note: 'village_29', requirement() {
        return VSTORE.state.unlock.villageBuildings4.use;
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.5, lvl) * buildNum(80, 'K'));
    }, price(lvl) {
        return {
            village_plantFiber: Math.pow(1.85, lvl) * buildNum(185, 'M'),
            village_wood: Math.pow(1.85, lvl) * buildNum(140, 'M'),
            village_knowledge: lvl * 15 + 220,
            village_hardwood: Math.pow(1.65, lvl) * buildNum(22, 'K')
        };
    }, effect: [
        {name: 'currencyVillageKnowledgeCap', type: 'base', value: lvl => lvl * 8},
        {name: 'currencyVillageFaithCap', type: 'base', value: lvl => lvl * 20},
        {name: 'villageUpgradeAxe', type: 'unlock', value: lvl => lvl >= 2},
        {name: 'villageUpgradeBomb', type: 'unlock', value: lvl => lvl >= 4},
        {name: 'villageUpgradeToll', type: 'unlock', value: lvl => lvl >= 6},
        {name: 'villageUpgradeFishingRod', type: 'unlock', value: lvl => lvl >= 8},
        {name: 'villageUpgradeHolyBook', type: 'unlock', value: lvl => lvl >= 10}
    ]},
    playground: {cap: 5, note: 'village_30', icon: 'gb-playground', requirement() {
        return VSTORE.state.unlock.villageBuildings4.use;
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.15, lvl) * buildNum(140, 'K'));
    }, price(lvl) {
        return {village_water: Math.pow(4, lvl) * buildNum(250, 'M'), village_coin: Math.pow(3, lvl) * buildNum(50, 'M')};
    }, effect: [
        {name: 'villageHappiness', type: 'base', value: lvl => lvl * 0.01}
    ]},
    government: {cap: 1, persistent: true, icon: 'gb-government', requirement() {
        return VSTORE.state.unlock.villageBuildings4.use;
    }, timeNeeded() {
        return buildNum(1.5, 'M');
    }, price() {
        return {village_hardwood: buildNum(50, 'K'), village_gem: buildNum(50, 'K'), village_coin: buildNum(150, 'M'), village_knowledge: 260};
    }, effect: [
        {name: 'villageBuildings5', type: 'unlock', value: lvl => lvl >= 1}
    ]},

    // Tier 5 buildings
    modernHouse: {cap: 25, capMult: true, subtype: 'housing', icon: 'gb-modernHouse', requirement() {
        return VSTORE.state.unlock.villageBuildings5.use;
    }, price(lvl) {
        return {
            village_wood: Math.pow(1.65, lvl) * buildNum(330, 'M'),
            village_glass: Math.pow(1.65, lvl) * buildNum(240, 'K'),
            village_hardwood: Math.pow(1.3, lvl) * buildNum(77.5, 'K'),
            village_gem: Math.pow(1.35, lvl) * buildNum(18, 'K')
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.25, lvl) * buildNum(200, 'K'));
    }, effect: [
        {name: 'villageWorker', type: 'base', value: lvl => lvl * 3}
    ]},
    fountain: {cap: 10, icon: 'gb-fountain', requirement() {
        return VSTORE.state.unlock.villageBuildings5.use;
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.3, lvl) * buildNum(275, 'K'));
    }, price(lvl) {
        return {
            village_plantFiber: Math.pow(1.65, lvl) * buildNum(1.7, 'B'),
            village_stone: Math.pow(1.65, lvl) * buildNum(1.35, 'B'),
            village_metal: Math.pow(1.65, lvl) * buildNum(290, 'M'),
            village_coin: Math.pow(1.85, lvl) * buildNum(650, 'M')
        };
    }, effect: [
        {name: 'currencyVillageWaterGain', type: 'mult', value: lvl => Math.pow(1.4, lvl)},
        {name: 'currencyVillageWaterCap', type: 'mult', value: lvl => Math.pow(2, lvl)}
    ]},
    laboratory: {cap: 10, capMult: true, subtype: 'workstation', icon: 'gb-laboratory', requirement() {
        return VSTORE.state.unlock.villageBuildings5.use;
    }, price(lvl) {
        return {
            village_metal: Math.pow(1.85, lvl) * buildNum(70, 'M'),
            village_glass: Math.pow(1.85, lvl) * buildNum(475, 'K'),
            village_gem: Math.pow(1.85, lvl) * buildNum(140, 'K')
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.33, lvl) * buildNum(300, 'K'));
    }, effect: [
        {name: 'scientist', type: 'villageJob', value: lvl => lvl},
        {name: 'currencyVillageScienceCap', type: 'base', value: lvl => lvl > 2 ? ((lvl - 2) * 5) : null},
        {name: 'villageUpgradeBreakthrough', type: 'unlock', value: lvl => lvl >= 2}
    ]},
    court: {cap: 2, hasDescription: true, icon: 'gb-court', requirement() {
        return VSTORE.state.unlock.villageBuildings5.use;
    }, price(lvl) {
        return {
            village_hardwood: Math.pow(1.85, lvl) * buildNum(280, 'K'),
            village_knowledge: Math.round(Math.pow(1.15, lvl) * 290),
            village_science: lvl * 20 + 30
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.5, lvl) * buildNum(480, 'K'));
    }, effect: [
        {name: 'villagePolicyTaxes', type: 'base', value: lvl => lvl >= 1 ? 1 : null},
        {name: 'villagePolicyImmigration', type: 'base', value: lvl => lvl >= 2 ? 1 : null}
    ]},
    greenhouse: {cap: 10, capMult: true, subtype: 'workstation', icon: 'gb-greenhouse', requirement() {
        return VSTORE.state.unlock.villageBuildings5.use;
    }, price(lvl) {
        return {
            village_plantFiber: Math.pow(1.85, lvl) * buildNum(1.15, 'B'),
            village_glass: Math.pow(1.85, lvl) * buildNum(900, 'K')
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.33, lvl) * buildNum(550, 'K'));
    }, effect: [
        {name: 'gardener', type: 'villageJob', value: lvl => lvl}
    ]},
    fullBasket: {cap: 8, icon: 'gb-fullBasket', requirement() {
        return VSTORE.state.unlock.villageBuildings5.use;
    }, price(lvl) {
        return {
            village_plantFiber: Math.pow(2.4, lvl) * buildNum(2.4, 'B'),
            village_joy: Math.ceil(Math.pow(1.35, lvl) * 70)
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.75, lvl) * buildNum(1.5, 'M'));
    }, effect: [
        {name: 'villageFoodGain', type: 'mult', value: lvl => Math.pow(1.2, lvl) * (lvl * 0.25 + 1)},
        {name: 'currencyVillageFaithCap', type: 'base', value: lvl => lvl * 32}
    ]},
    storageHall: {cap: 20, icon: 'gb-storageHall', requirement() {
        return VSTORE.state.unlock.villageBuildings5.use;
    }, price(lvl) {
        return {
            village_wood: Math.pow(1.85, lvl) * buildNum(4.5, 'B'),
            village_metal: Math.pow(1.65, lvl) * buildNum(360, 'M'),
            village_hardwood: Math.pow(1.5, lvl) * buildNum(575, 'K')
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.3, lvl) * buildNum(700, 'K'));
    }, effect: [
        {name: 'villageFoundationMaterialCap', type: 'mult', value: lvl => Math.pow(1.5, lvl)},
        {name: 'currencyVillageScienceCap', type: 'base', value: lvl => lvl * 8}
    ]},
    bioLab: {cap: 5, icon: 'gb-bioLab', requirement() {
        return VSTORE.state.unlock.villageBuildings5.use;
    }, price(lvl) {
        return {
            village_metal: Math.pow(2.3, lvl) * buildNum(580, 'M'),
            village_gem: Math.pow(1.85, lvl) * buildNum(695, 'K')
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.75, lvl) * buildNum(1, 'M'));
    }, effect: [
        {name: 'currencyVillageGlassCap', type: 'mult', value: lvl => Math.pow(1.5, lvl)},
        {name: 'villageUpgradeModifiedPlants', type: 'unlock', value: lvl => lvl >= 1},
        {name: 'villageUpgradeDopamine', type: 'unlock', value: lvl => lvl >= 3},
        {name: 'villageUpgradeAdrenaline', type: 'unlock', value: lvl => lvl >= 5}
    ]},
    taxOffice: {cap: 3, icon: 'gb-taxOffice', requirement() {
        return VSTORE.state.unlock.villageBuildings5.use && VSTORE.state.upgrade.item.village_court.level >= 1;
    }, price(lvl) {
        return {
            village_stone: Math.pow(6, lvl) * buildNum(10.5, 'B'),
            village_water: Math.pow(15, lvl) * buildNum(75, 'B'),
            village_knowledge: lvl * 75 + 350,
            village_coin: Math.pow(3.5, lvl) * buildNum(6, 'B')
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(2.5, lvl) * buildNum(1.2, 'M'));
    }, effect: [
        {name: 'villagePolicyTaxes', type: 'base', value: lvl => lvl}
    ]},
    festival: {icon: 'gb-festival', requirement() {
        return VSTORE.state.unlock.villageBuildings5.use;
    }, price(lvl) {
        return {
            village_joy: Math.ceil(Math.pow(1.15, lvl) * 100)
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.35, lvl) * buildNum(750, 'K'));
    }, effect: [
        {name: 'villageHappiness', type: 'base', value: lvl => lvl * 0.003},
        {name: 'villageTaxRate', type: 'mult', value: lvl => lvl * 0.05 + 1}
    ]},
    cemetery: {cap: 10, icon: 'gb-cemetery', requirement() {
        return VSTORE.state.unlock.villageBuildings5.use;
    }, price(lvl) {
        return {
            village_wood: Math.pow(lvl * 0.1 + 1.85, lvl) * buildNum(20, 'B'),
            village_stone: Math.pow(lvl * 0.1 + 1.85, lvl) * buildNum(27.5, 'B')
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.3, lvl) * buildNum(1.5, 'M'));
    }, effect: [
        {name: 'villageOfferingPower', type: 'mult', value: lvl => lvl * 0.4 + 1},
        {name: 'currencyVillageFaithCap', type: 'base', value: lvl => lvl * 32}
    ]},
    mosque: {cap: 25, icon: 'gb-mosque', requirement() {
        return VSTORE.state.unlock.villageBuildings5.use;
    }, price(lvl) {
        return {
            village_stone: Math.pow(2.12, lvl) * buildNum(155, 'B'),
            village_glass: Math.pow(1.9, lvl) * buildNum(40, 'M'),
            village_gem: Math.pow(1.55, lvl) * buildNum(17, 'M')
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.3, lvl) * buildNum(3.2, 'M'));
    }, effect: [
        {name: 'currencyVillageFaithGain', type: 'base', value: lvl => getSequence(2, lvl)}
    ]},
    waterTower: {cap: 12, icon: 'gb-waterTower', requirement() {
        return VSTORE.state.unlock.villageBuildings5.use;
    }, price(lvl) {
        return {
            village_plantFiber: Math.pow(2.45, lvl) * buildNum(260, 'B'),
            village_knowledge: lvl * 125 + 700
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.65, lvl) * buildNum(8, 'M'));
    }, effect: [
        {name: 'currencyVillageWaterGain', type: 'mult', value: lvl => Math.pow(1.2, lvl) * (lvl * 0.5 + 1)}
    ]},
    outdoorPump: {cap: 5, icon: 'gb-outdoorPump', requirement() {
        return VSTORE.state.unlock.villageBuildings5.use;
    }, price(lvl) {
        return {
            village_water: Math.pow(3.3, lvl) * buildNum(1.6, 'T'),
            village_joy: lvl * 180 + 720
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.65, lvl) * buildNum(18.5, 'M'));
    }, effect: [
        {name: 'currencyVillagePlantFiberGain', type: 'mult', value: lvl => lvl * 0.4 + 1}
    ]},
    bankVault: {cap: 12, icon: 'gb-bankVault', requirement() {
        return VSTORE.state.unlock.villageBuildings5.use;
    }, price(lvl) {
        return {
            village_metal: Math.pow(1.85, lvl) * buildNum(7.35, 'B'),
            village_science: lvl * 45 + 270
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.65, lvl) * buildNum(40, 'M'));
    }, effect: [
        {name: 'currencyVillageCoinCap', type: 'mult', value: lvl => Math.pow(1.6, lvl)}
    ]},
    steamEngine: {cap: 1, persistent: true, icon: 'gb-steamEngine', requirement() {
        return VSTORE.state.unlock.villageBuildings5.use;
    }, timeNeeded() {
        return buildNum(600, 'M');
    }, price() {
        return {
            village_metal: buildNum(27.6, 'B'),
            village_water: buildNum(45, 'T'),
            village_hardwood: buildNum(175, 'M'),
            village_coin: buildNum(3.5, 'T'),
            village_science: 440,
            village_joy: 1500
        };
    }, effect: [
        {name: 'villageBuildings6', type: 'unlock', value: lvl => lvl >= 1}
    ]},

    // Tier 6 buildings
    mansion: {cap: 25, capMult: true, subtype: 'housing', icon: 'gb-mansion', requirement() {
        return VSTORE.state.unlock.villageBuildings6.use;
    }, price(lvl) {
        return {
            village_plantFiber: Math.pow(1.65, lvl) * buildNum(63, 'T'),
            village_marble: Math.pow(1.35, lvl) * 600
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.25, lvl) * buildNum(140, 'M'));
    }, effect: [
        {name: 'villageWorker', type: 'base', value: lvl => lvl * 4}
    ]},
    oilRig: {cap: 10, capMult: true, subtype: 'workstation', icon: 'gb-oilRig', requirement() {
        return VSTORE.state.unlock.villageBuildings6.use;
    }, price(lvl) {
        return {
            village_stone: Math.pow(2.35, lvl) * buildNum(1.32, 'T'),
            village_water: Math.pow(4.1, lvl) * buildNum(90, 'T'),
            village_knowledge: lvl * 500 + 1500
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.33, lvl) * buildNum(320, 'M'));
    }, effect: [
        {name: 'oilWorker', type: 'villageJob', value: lvl => lvl},
        {name: 'currencyVillageOilCap', type: 'base', value: lvl => lvl > 1 ? ((lvl - 1) * 400) : null}
    ]},
    generator: {hasDescription: true, icon: 'gb-generator', requirement() {
        return VSTORE.state.unlock.villageBuildings6.use;
    }, price(lvl) {
        return {
            village_wood: Math.pow(1.45, lvl) * buildNum(1.93, 'T'),
            village_metal: Math.pow(1.2, lvl) * buildNum(84, 'B'),
            village_oil: Math.pow(1.25, lvl) * 1400
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.2, lvl) * buildNum(550, 'M'));
    }, effect: [
        {name: 'villagePower', type: 'base', value: lvl => lvl * 3},
        {name: 'villagePollution', type: 'base', value: lvl => lvl * 2}
    ]},
    lighthouse: {cap: 25, icon: 'gb-lighthouse', requirement() {
        return VSTORE.state.unlock.villageBuildings6.use;
    }, price(lvl) {
        return {
            village_plantFiber: Math.pow(lvl * 0.06 + 1.6, lvl) * buildNum(3.68, 'T'),
            village_gem: Math.pow(lvl * 0.04 + 1.4, lvl) * buildNum(480, 'M'),
            village_oil: Math.pow(lvl * 0.05 + 1.5, lvl) * 2800
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.3, lvl) * buildNum(650, 'M'));
    }, effect: [
        {name: 'currencyVillageFaithGain', type: 'mult', value: lvl => Math.pow(1.225, lvl)}
    ]},
    lobby: {icon: 'gb-lobby', requirement() {
        return VSTORE.state.unlock.villageBuildings6.use;
    }, price(lvl) {
        return {
            village_coin: Math.pow(lvl * 0.05 + 1.35, lvl) * buildNum(13.5, 'T')
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.3, lvl) * buildNum(750, 'M'));
    }, effect: [
        {name: 'villagePollutionTolerance', type: 'base', value: lvl => lvl}
    ]},
    oilStorage: {cap: 20, icon: 'gb-oilStorage', requirement() {
        return VSTORE.state.unlock.villageBuildings6.use;
    }, price(lvl) {
        return {
            village_hardwood: Math.pow(1.55, lvl) * buildNum(1.05, 'B'),
            village_glass: Math.pow(1.6, lvl) * buildNum(2.25, 'B')
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.3, lvl) * buildNum(1.1, 'B'));
    }, effect: [
        {name: 'currencyVillageMetalGain', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
        {name: 'currencyVillageMetalCap', type: 'mult', value: lvl => Math.pow(1.4, lvl)},
        {name: 'currencyVillageOilCap', type: 'mult', value: lvl => Math.pow(1.4, lvl)}
    ]},
    artGallery: {cap: 10, capMult: true, subtype: 'workstation', icon: 'gb-artGallery', requirement() {
        return VSTORE.state.unlock.villageBuildings6.use;
    }, price(lvl) {
        return {
            village_plantFiber: Math.pow(2.9, lvl) * buildNum(198, 'T'),
            village_oil: Math.pow(2.2, lvl) * buildNum(264, 'K'),
            village_joy: lvl * 400 + 2200
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.33, lvl) * buildNum(1.6, 'B'));
    }, effect: [
        {name: 'sculptor', type: 'villageJob', value: lvl => lvl},
        {name: 'currencyVillageMarbleCap', type: 'base', value: lvl => lvl > 1 ? ((lvl - 1) * 100) : null}
    ]},
    excavator: {icon: 'gb-excavator', requirement() {
        return VSTORE.state.unlock.villageBuildings6.use;
    }, price(lvl) {
        return {
            village_hardwood: Math.pow(1.35, lvl) * buildNum(5.28, 'B'),
            village_oil: Math.pow(1.6, lvl) * buildNum(360, 'K')
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.3, lvl) * buildNum(2.2, 'B'));
    }, effect: [
        {name: 'villageFoundationMaterialGain', type: 'mult', value: lvl => Math.pow(1.25, lvl) * (0.25 * lvl + 1)},
        {name: 'villagePollution', type: 'base', value: lvl => lvl}
    ]},
    oilTruck: {icon: 'gb-oilTruck', requirement() {
        return VSTORE.state.unlock.villageBuildings6.use;
    }, price(lvl) {
        return {
            village_gem: Math.pow(1.45, lvl) * buildNum(7.8, 'B')
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.3, lvl) * buildNum(3, 'B'));
    }, effect: [
        {name: 'currencyVillageOilCap', type: 'mult', value: lvl => Math.pow(2, lvl)},
        {name: 'villagePollution', type: 'base', value: lvl => lvl}
    ]},
    oldLibrary: {icon: 'gb-oldLibrary', cap: 2, requirement() {
        return VSTORE.state.unlock.villageBuildings6.use;
    }, price(lvl) {
        return {
            village_wood: Math.pow(7.1, lvl) * buildNum(1.68, 'Qa'),
            village_marble: Math.pow(4.5, lvl) * 7500,
            village_knowledge: lvl * 600 + 2800
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(10, lvl) * buildNum(4, 'B'));
    }, effect: [
        {name: 'currencyVillageScienceCap', type: 'base', value: lvl => lvl * 20},
        {name: 'villageUpgradeSprinkler', type: 'unlock', value: lvl => lvl >= 1},
        {name: 'villageUpgradeGreed', type: 'unlock', value: lvl => lvl >= 2}
    ]},
    immigrationOffice: {cap: 3, icon: 'gb-immigrationOffice', requirement() {
        return VSTORE.state.unlock.villageBuildings6.use && VSTORE.state.upgrade.item.village_court.level >= 2;
    }, price(lvl) {
        return {
            village_knowledge: lvl * 2000 + 4500,
            village_science: lvl * 750 + 1500,
            village_coin: Math.pow(10, lvl) * buildNum(1.5, 'Qa')
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(8, lvl) * buildNum(5, 'B'));
    }, effect: [
        {name: 'villagePolicyImmigration', type: 'base', value: lvl => lvl}
    ]},
    marbleStatue: {cap: 10, icon: 'gb-marbleStatue', requirement() {
        return VSTORE.state.unlock.villageBuildings6.use;
    }, price(lvl) {
        return {
            village_marble: Math.pow(1.65, lvl) * 2250
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.75, lvl) * buildNum(120, 'B'));
    }, effect: [
        {name: 'villageHappiness', type: 'base', value: lvl => lvl * 0.004},
        {name: 'currencyVillageMarbleCap', type: 'mult', value: lvl => Math.pow(1.2, lvl)},
        {name: 'currencyVillageKnowledgeCap', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    darkCult: {cap: 4, hasDescription: true, icon: 'gb-darkCult', requirement() {
        return VSTORE.state.unlock.villageBuildings6.use && VSTORE.state.upgrade.item.village_court.level >= 2;
    }, price(lvl) {
        return {
            village_gem: Math.pow(6.25, lvl) * buildNum(82, 'B'),
            village_oil: Math.pow(5.5, lvl) * buildNum(55, 'M'),
            village_marble: Math.pow(2.5, lvl) * buildNum(50, 'K')
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(6, lvl) * buildNum(11, 'B'));
    }, effect: [
        {name: 'villagePolicyReligion', type: 'base', value: lvl => lvl}
    ]},
    slaughterhouse: {icon: 'gb-slaughterhouse', requirement() {
        return VSTORE.state.unlock.villageBuildings6.use;
    }, price(lvl) {
        return {
            village_plantFiber: Math.pow(1.5, lvl) * buildNum(15.4, 'Qa'),
            village_wood: Math.pow(1.5, lvl) * buildNum(12, 'Qa'),
            village_hardwood: Math.pow(1.35, lvl) * buildNum(140, 'B'),
            village_water: Math.pow(1.9, lvl) * buildNum(9.5, 'Qi')
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.25, lvl) * buildNum(16, 'B'));
    }, effect: [
        {name: 'currencyVillageMeatGain', type: 'base', value: lvl => getSequence(4, lvl) * 100},
        {name: 'villagePollution', type: 'base', value: lvl => lvl}
    ]},
    ecoCouncil: {cap: 1, persistent: true, icon: 'gb-ecoCouncil', requirement() {
        return VSTORE.state.unlock.villageBuildings6.use;
    }, timeNeeded() {
        return buildNum(250, 'B');
    }, price() {
        return {village_oil: buildNum(96, 'M'), village_marble: buildNum(500, 'K'), village_coin: buildNum(14, 'Qa'), village_science: 2000, village_joy: 6000};
    }, effect: [
        {name: 'villageBuildings7', type: 'unlock', value: lvl => lvl >= 1}
    ]},

    // Tier 7 buildings
    treehouse: {cap: 25, capMult: true, subtype: 'housing', icon: 'gb-treehouse', requirement() {
        return VSTORE.state.unlock.villageBuildings7.use;
    }, price(lvl) {
        return {
            village_hardwood: Math.pow(1.45, lvl) * buildNum(162.5, 'B'),
            village_loot0: Math.ceil(Math.pow(1.2, lvl) * 5)
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.25, lvl) * buildNum(45, 'B'));
    }, effect: [
        {name: 'villageWorker', type: 'base', value: lvl => lvl * 6}
    ]},
    rainforest: {icon: 'gb-rainforest', requirement() {
        return VSTORE.state.unlock.villageBuildings7.use;
    }, price(lvl) {
        return {
            village_hardwood: Math.pow(1.35, lvl) * buildNum(185, 'B'),
            village_water: Math.pow(1.9, lvl) * buildNum(12.5, 'Qi')
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.25, lvl) * buildNum(250, 'B'));
    }, effect: [
        {name: 'villagePollution', type: 'base', value: lvl => lvl * -1}
    ]},
    luxuryStorage: {cap: 20, icon: 'gb-luxuryStorage', requirement() {
        return VSTORE.state.unlock.villageBuildings7.use;
    }, price(lvl) {
        return {
            village_wood: Math.pow(1.85, lvl) * buildNum(121, 'Qa'),
            village_stone: Math.pow(1.85, lvl) * buildNum(143, 'Qa'),
            village_oil: Math.pow(1.6, lvl) * buildNum(234, 'M')
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.3, lvl) * buildNum(60, 'B'));
    }, effect: [
        {name: 'currencyVillageMetalCap', type: 'mult', value: lvl => Math.pow(1.3, lvl)},
        {name: 'currencyVillageGlassCap', type: 'mult', value: lvl => Math.pow(1.4, lvl)},
        {name: 'villageLuxuryMaterialCap', type: 'mult', value: lvl => Math.pow(1.25, lvl)},
    ]},
    pyramid: {cap: 10, hasDescription: true, capMult: true, subtype: 'workstation', icon: 'gb-pyramid', requirement() {
        return VSTORE.state.unlock.villageBuildings7.use;
    }, price(lvl) {
        return {
            village_stone: Math.pow(3.75, lvl) * buildNum(375, 'Qa'),
            village_marble: Math.pow(2.45, lvl) * buildNum(2.85, 'M'),
            village_joy: lvl * 4000 + buildNum(15.5, 'K')
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.45, lvl) * buildNum(100, 'B'));
    }, effect: [
        {name: 'explorer', type: 'villageJob', value: lvl => lvl},
        {name: 'villageLootQuality', type: 'base', value: lvl => lvl > 1 ? ((lvl - 1) * 5) : null}
    ]},
    trophyCase: {cap: 6, icon: 'gb-trophyCase', requirement() {
        return VSTORE.state.unlock.villageBuildings7.use;
    }, price(lvl) {
        let obj = {};
        obj[`village_loot${ lvl }`] = 1;
        return obj;
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(2.5, lvl) * buildNum(150, 'B'));
    }, effect: [
        {name: 'villageMaterialGain', type: 'mult', value: lvl => Math.pow(1.4, lvl)},
        {name: 'villageMaterialCap', type: 'mult', value: lvl => Math.pow(1.2, lvl)}
    ]},
    antiquarian: {icon: 'gb-antiquarian', cap: 12, requirement() {
        return VSTORE.state.unlock.villageBuildings7.use;
    }, price(lvl) {
        let obj = {
            village_coin: Math.pow(2.5, lvl) * buildNum(32.5, 'Qa')
        };
        obj[`village_loot${ Math.floor(lvl / 2) }`] = Math.pow(10, lvl % 2) * 10;
        return obj;
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(3, lvl) * buildNum(200, 'B'));
    }, effect: [
        {name: 'currencyVillageCoinCap', type: 'mult', value: lvl => Math.pow(1.3, lvl)},
        {name: 'villageUpgradeAmbition', type: 'unlock', value: lvl => lvl >= 1},
        {name: 'villageUpgradeUnderstanding', type: 'unlock', value: lvl => lvl >= 2},
        {name: 'villageUpgradeCuriosity', type: 'unlock', value: lvl => lvl >= 3},
        {name: 'villageUpgradeWorship', type: 'unlock', value: lvl => lvl >= 4},
        {name: 'villageUpgradeBartering', type: 'unlock', value: lvl => lvl >= 5},
        {name: 'villageUpgradeSparks', type: 'unlock', value: lvl => lvl >= 6},
    ]},
    windTurbine: {cap: 20, icon: 'gb-windTurbine', requirement() {
        return VSTORE.state.unlock.villageBuildings7.use;
    }, price(lvl) {
        return {
            village_metal: Math.pow(1.65, lvl) * buildNum(1.25, 'Qa'),
            village_loot1: Math.ceil(Math.pow(1.15, lvl) * (3 + lvl))
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.25, lvl) * buildNum(240, 'B'));
    }, effect: [
        {name: 'villagePower', type: 'base', value: lvl => lvl},
        {name: 'villageLootGain', type: 'mult', value: lvl => lvl * 0.05 + 1}
    ]},
    radar: {cap: 10, hasDescription: true, icon: 'gb-radar', requirement() {
        return VSTORE.state.unlock.villageBuildings7.use && VSTORE.state.upgrade.item.village_court.level >= 2;
    }, price(lvl) {
        return {
            village_metal: Math.pow(3.15, lvl) * buildNum(6.57, 'Qa'),
            village_marble: Math.pow(2.4, lvl) * buildNum(41.5, 'M'),
            village_science: lvl * 650 + 3500
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(3, lvl) * buildNum(333, 'B'));
    }, effect: [
        {name: 'villagePolicyScanning', type: 'base', value: lvl => lvl}
    ]},
    waterTurbine: {cap: 20, icon: 'gb-waterTurbine', requirement() {
        return VSTORE.state.unlock.villageBuildings7.use;
    }, price(lvl) {
        return {
            village_water: Math.pow(2.2, lvl) * buildNum(200, 'Qi'),
            village_glass: Math.pow(1.65, lvl) * buildNum(6.8, 'T'),
            village_loot2: Math.ceil(Math.pow(1.14, lvl) * (2 + lvl))
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.25, lvl) * buildNum(420, 'B'));
    }, effect: [
        {name: 'villagePower', type: 'base', value: lvl => lvl},
        {name: 'currencyVillageWaterGain', type: 'mult', value: lvl => Math.pow(1.15, lvl)}
    ]},
    solarPanel: {cap: 20, icon: 'gb-solarPanel', requirement() {
        return VSTORE.state.unlock.villageBuildings7.use;
    }, price(lvl) {
        return {
            village_gem: Math.pow(1.55, lvl) * buildNum(9, 'T'),
            village_oil: Math.pow(1.8, lvl) * buildNum(30.4, 'B'),
            village_loot3: Math.ceil(Math.pow(1.13, lvl) * (1 + lvl))
        };
    }, timeNeeded(lvl) {
        return Math.ceil(Math.pow(1.25, lvl) * buildNum(550, 'B'));
    }, effect: [
        {name: 'villagePower', type: 'base', value: lvl => lvl * 2}
    ]},
};
const VI_JOB = {
    collector: {
        max: null,
        needed: 1,
        rewards: [
            {type: 'base', name: 'currencyVillagePlantFiberGain', amount: 0.3},
            {type: 'base', name: 'currencyVillageWoodGain', amount: 0.3},
            {type: 'base', name: 'currencyVillageStoneGain', amount: 0.3}
        ]
    },
    farmer: {
        max: 0,
        needed: 2,
        rewards: [
            {type: 'base', name: 'currencyVillagePlantFiberGain', amount: 2},
            {type: 'base', name: 'currencyVillageGrainGain', amount: 0.5}
        ]
    },
    harvester: {
        max: 0,
        needed: 2,
        rewards: [
            {type: 'base', name: 'currencyVillageWoodGain', amount: 2},
            {type: 'base', name: 'currencyVillageFruitGain', amount: 0.5}
        ]
    },
    miner: {
        max: 0,
        needed: 2,
        rewards: [
            {type: 'base', name: 'currencyVillageStoneGain', amount: 2},
            {type: 'base', name: 'currencyVillageMetalGain', amount: 0.5}
        ]
    },
    wellWorker: {
        max: 0,
        needed: 3,
        rewards: [
            {type: 'base', name: 'currencyVillageWaterGain', amount: 3}
        ]
    },
    librarian: {
        max: 0,
        needed: 4,
        rewards: [
            {type: 'base', name: 'currencyVillageKnowledgeGain', amount: 0.02}
        ]
    },
    glassblower: {
        max: 0,
        needed: 4,
        rewards: [
            {type: 'base', name: 'currencyVillageGlassGain', amount: 0.25}
        ]
    },
    entertainer: {
        max: 0,
        needed: 5,
        rewards: [
            {type: 'base', name: 'villageHappiness', amount: 0.03}
        ]
    },
    lumberjack: {
        max: 0,
        needed: 6,
        rewards: [
            {type: 'base', name: 'currencyVillageWoodGain', amount: 12},
            {type: 'base', name: 'currencyVillageHardwoodGain', amount: 0.25}
        ]
    },
    blastMiner: {
        max: 0,
        needed: 6,
        rewards: [
            {type: 'base', name: 'currencyVillageStoneGain', amount: 12},
            {type: 'base', name: 'currencyVillageGemGain', amount: 0.25}
        ]
    },
    fisherman: {
        max: 0,
        needed: 7,
        rewards: [
            {type: 'base', name: 'currencyVillageFishGain', amount: 30}
        ]
    },
    scientist: {
        max: 0,
        needed: 8,
        rewards: [
            {type: 'base', name: 'currencyVillageScienceGain', amount: 0.008}
        ]
    },
    gardener: {
        max: 0,
        needed: 8,
        rewards: [
            {type: 'base', name: 'currencyVillagePlantFiberGain', amount: 20},
            {type: 'base', name: 'currencyVillageVegetableGain', amount: 40}
        ]
    },
    oilWorker: {
        max: 0,
        needed: 11,
        rewards: [
            {type: 'base', name: 'currencyVillageOilGain', amount: 0.35}
        ]
    },
    sculptor: {
        max: 0,
        needed: 14,
        rewards: [
            {type: 'base', name: 'currencyVillageMarbleGain', amount: 0.001}
        ]
    },
    explorer: {
        max: 0,
        needed: 600,
        rewards: [
            {type: 'base', name: 'villageLootGain', amount: 0.5}
        ]
    }
};
const VI_OFFERING = {
    plantFiber: {unlock: 'villageOffering1', cost: lvl => Math.pow(1.5, lvl) * buildNum(1, 'M'), effect: 200},
    wood: {unlock: 'villageOffering1', cost: lvl => Math.pow(1.5, lvl) * buildNum(1, 'M'), effect: 200},
    stone: {unlock: 'villageOffering1', cost: lvl => Math.pow(1.5, lvl) * buildNum(1, 'M'), effect: 200},

    coin: {unlock: 'villageOffering2', amount: 3, cost: lvl => Math.pow(1.75, lvl) * buildNum(10, 'M'), effect: 200},
    metal: {unlock: 'villageOffering2', amount: 3, cost: lvl => Math.pow(1.5, lvl) * buildNum(3, 'M'), effect: 200},
    water: {unlock: 'villageOffering2', amount: 3, cost: lvl => Math.pow(2, lvl) * buildNum(5, 'M'), effect: 500},

    glass: {unlock: 'villageOffering3', amount: 8, cost: lvl => Math.pow(1.5, lvl) * buildNum(120, 'K'), effect: 200},
    hardwood: {unlock: 'villageOffering3', amount: 8, cost: lvl => Math.pow(1.5, lvl) * buildNum(40, 'K'), effect: 100},
    gem: {unlock: 'villageOffering3', amount: 8, cost: lvl => Math.pow(1.5, lvl) * buildNum(40, 'K'), effect: 100},

    knowledge: {unlock: 'villageOffering4', amount: 20, hasMultiplier: false, cost: lvl => Math.pow(1.25, lvl) * 250, effect: 2},
    science: {unlock: 'villageOffering4', amount: 20, hasMultiplier: false, cost: lvl => Math.pow(1.25, lvl) * 100, effect: 1},
    joy: {unlock: 'villageOffering4', amount: 20, hasMultiplier: false, cost: lvl => Math.pow(1.25, lvl) * 750, effect: 5},

    oil: {unlock: 'villageOffering5', amount: 50, cost: lvl => Math.pow(1.8, lvl) * buildNum(1, 'M'), effect: 100},
    marble: {unlock: 'villageOffering5', amount: 50, cost: lvl => Math.pow(1.4, lvl) * 5000, effect: 20},
};
const VI_POLICY = {
    taxes: {mult: 'villagePolicyTaxes', icon: 'mdi-cash-register', effect: [
        {name: 'villageTaxRate', type: 'mult', value: lvl => lvl * 0.25 + 1},
        {name: 'villageHappiness', type: 'base', value: lvl => lvl * (lvl > 0 ? -0.05 : -0.03)}
    ]},
    immigration: {mult: 'villagePolicyImmigration', icon: 'mdi-account-group', effect: [
        {name: 'villageWorker', type: 'mult', value: lvl => lvl * 0.15 + 1},
        {name: 'villageHappiness', type: 'base', value: lvl => lvl * (lvl > 0 ? -0.05 : -0.1)}
    ]},
    religion: {mult: 'villagePolicyReligion', icon: 'mdi-hands-pray', effect: [
        {name: 'villageResourceGain', type: 'mult', value: lvl => lvl * (lvl > 0 ? -0.25 : -0.1) + 1},
        {name: 'currencyVillageFaithGain', type: 'mult', value: lvl => lvl * 0.25 + 1}
    ]},
    scanning: {mult: 'villagePolicyScanning', icon: 'mdi-magnify-scan', effect: [
        {name: 'villageLootGain', type: 'mult', value: lvl => 1 - lvl * (lvl > 0 ? 0.1 : 0.05)},
        {name: 'villageLootQuality', type: 'base', value: lvl => Math.max(lvl, 0)},
        {name: 'villageLootQuality', type: 'mult', value: lvl => Math.min(1 + lvl * 0.1, 1)}
    ]}
};
const VI_CRAFT = {
    // Base recipes
    rope: {
        icon: 'mdi-lasso',
        color: 'beige',
        price: {village_plantFiber: buildNum(100, 'K')},
        value: 10,
        timeNeeded: 60,
        milestone: {
            100: {type: 'villageCraft', name: 'pouch', value: true},
            750: {type: 'changeStat', name: 'timeNeeded', value: 40},
            4800: {type: 'changeStat', name: 'value', value: 14},
            27000: {type: 'changeStat', name: 'timeNeeded', value: 30},
        }
    },
    woodenPlanks: {
        icon: 'mdi-view-dashboard-variant',
        color: 'brown',
        price: {village_wood: buildNum(250, 'K')},
        value: 22,
        timeNeeded: 120,
        milestone: {
            60: {type: 'changeStat', name: 'timeNeeded', value: 90},
            450: {type: 'villageCraft', name: 'cupboard', value: true},
            3200: {type: 'changeStat', name: 'value', value: 30},
            16500: {type: 'changeStat', name: 'timeNeeded', value: 75},
        }
    },
    brick: {
        icon: 'mdi-wall',
        color: 'cherry',
        price: {village_stone: buildNum(600, 'K')},
        value: 48,
        timeNeeded: 240,
        milestone: {
            40: {type: 'changeStat', name: 'value', value: 66},
            300: {type: 'changeStat', name: 'timeNeeded', value: 180},
            2000: {type: 'villageCraft', name: 'weight', value: true},
            12000: {type: 'changeStat', name: 'value', value: 84},
        }
    },
    screws: {
        icon: 'mdi-screw-flat-top',
        color: 'light-grey',
        price: {village_metal: buildNum(800, 'K')},
        value: 25,
        timeNeeded: 120,
        milestone: {
            100: {type: 'changeStat', name: 'value', value: 34},
            550: {type: 'changeStat', name: 'timeNeeded', value: 100},
            4400: {type: 'villageCraft', name: 'scissors', value: true},
            21000: {type: 'changeStat', name: 'value', value: 44},
        }
    },
    waterBottle: {
        icon: 'mdi-bottle-soda',
        color: 'blue',
        price: {village_water: buildNum(1.5, 'M')},
        value: 15,
        timeNeeded: 70,
        milestone: {
            300: {type: 'changeStat', name: 'timeNeeded', value: 50},
            1700: {type: 'changeStat', name: 'timeNeeded', value: 35},
            9250: {type: 'villageCraft', name: 'herbTea', value: true},
            53000: {type: 'changeStat', name: 'timeNeeded', value: 25},
        }
    },
    cocktailGlass: {
        icon: 'mdi-glass-cocktail',
        color: 'light-blue',
        price: {village_glass: buildNum(2.5, 'M')},
        value: 50,
        timeNeeded: 210,
        milestone: {
            45: {type: 'changeStat', name: 'value', value: 67},
            360: {type: 'changeStat', name: 'timeNeeded', value: 180},
            2500: {type: 'villageCraft', name: 'glasses', value: true},
            14500: {type: 'changeStat', name: 'value', value: 86},
        }
    },
    boomerang: {
        icon: 'mdi-boomerang',
        color: 'cherry',
        price: {village_hardwood: buildNum(4, 'M')},
        value: 38,
        timeNeeded: 140,
        milestone: {
            45: {type: 'changeStat', name: 'value', value: 51},
            360: {type: 'changeStat', name: 'timeNeeded', value: 120},
            // 2500: {type: 'villageCraft', name: 'weight', value: true},
            14500: {type: 'changeStat', name: 'value', value: 65},
        }
    },
    polishedGem: {
        icon: 'mdi-diamond-stone',
        color: 'cyan',
        price: {village_gem: buildNum(6.5, 'M')},
        value: 36,
        timeNeeded: 160,
        milestone: {
            55: {type: 'changeStat', name: 'value', value: 47},
            380: {type: 'changeStat', name: 'timeNeeded', value: 140},
            // 2475: {type: 'villageCraft', name: 'weight', value: true},
            13500: {type: 'changeStat', name: 'value', value: 60},
        }
    },
    oilLamp: {
        icon: 'mdi-oil-lamp',
        color: 'pale-orange',
        price: {village_oil: buildNum(10, 'M')},
        value: 51,
        timeNeeded: 270,
        milestone: {
            40: {type: 'changeStat', name: 'value', value: 65},
            330: {type: 'changeStat', name: 'timeNeeded', value: 225},
            // 2100: {type: 'villageCraft', name: 'weight', value: true},
            12400: {type: 'changeStat', name: 'value', value: 82},
        }
    },
    shower: {
        icon: 'mdi-shower',
        color: 'pale-blue',
        price: {village_marble: buildNum(15, 'M')},
        value: 70,
        timeNeeded: 360,
        milestone: {
            40: {type: 'changeStat', name: 'timeNeeded', value: 300},
            330: {type: 'changeStat', name: 'value', value: 90},
            // 2100: {type: 'villageCraft', name: 'weight', value: true},
            12400: {type: 'changeStat', name: 'timeNeeded', value: 250},
        }
    },

    // Advanced recipes
    pouch: {
        icon: 'mdi-sack',
        color: 'pale-orange',
        price: {village_plantFiber: buildNum(1, 'M')},
        value: 18,
        timeNeeded: 90,
        milestone: {
            80: {type: 'changeStat', name: 'value', value: 26},
            600: {type: 'changeStat', name: 'timeNeeded', value: 70},
            4000: {type: 'changeStat', name: 'value', value: 35},
            22000: {type: 'changeStat', name: 'timeNeeded', value: 60},
        }
    },
    cupboard: {
        icon: 'mdi-cupboard',
        color: 'wooden',
        price: {village_wood: buildNum(3, 'M')},
        value: 33,
        timeNeeded: 150,
        milestone: {
            50: {type: 'changeStat', name: 'value', value: 42},
            400: {type: 'changeStat', name: 'timeNeeded', value: 125},
            2800: {type: 'changeStat', name: 'value', value: 52},
            15000: {type: 'changeStat', name: 'timeNeeded', value: 100},
        }
    },
    weight: {
        icon: 'mdi-weight',
        color: 'dark-grey',
        price: {village_stone: buildNum(7, 'M')},
        value: 65,
        timeNeeded: 300,
        milestone: {
            50: {type: 'changeStat', name: 'value', value: 87},
            400: {type: 'changeStat', name: 'timeNeeded', value: 255},
            2800: {type: 'villageCraft', name: 'handSaw', value: true},
            15000: {type: 'changeStat', name: 'timeNeeded', value: 210},
        }
    },
    scissors: {
        icon: 'mdi-content-cut',
        color: 'light-grey',
        price: {village_metal: buildNum(8, 'M'), village_wood: buildNum(3, 'M')},
        value: 30,
        timeNeeded: 125,
        milestone: {
            55: {type: 'changeStat', name: 'timeNeeded', value: 110},
            420: {type: 'changeStat', name: 'value', value: 40},
            3100: {type: 'changeStat', name: 'timeNeeded', value: 100},
            17000: {type: 'changeStat', name: 'value', value: 50},
        }
    },
    herbTea: {
        icon: 'mdi-tea',
        color: 'green',
        price: {village_water: buildNum(12, 'M'), village_plantFiber: buildNum(5, 'M')},
        value: 54,
        timeNeeded: 200,
        milestone: {
            48: {type: 'changeStat', name: 'value', value: 78},
            380: {type: 'changeStat', name: 'value', value: 106},
            2600: {type: 'changeStat', name: 'timeNeeded', value: 170},
            14000: {type: 'changeStat', name: 'value', value: 140},
        }
    },
    glasses: {
        icon: 'mdi-glasses',
        color: 'red-pink',
        price: {village_glass: buildNum(14, 'M'), village_metal: buildNum(11, 'M')},
        value: 21,
        timeNeeded: 80,
        milestone: {
            100: {type: 'changeStat', name: 'timeNeeded', value: 65},
            750: {type: 'changeStat', name: 'value', value: 28},
            5400: {type: 'changeStat', name: 'timeNeeded', value: 55},
            30000: {type: 'changeStat', name: 'timeNeeded', value: 45},
        }
    },

    // Book recipes
    arrows: {
        icon: 'mdi-arrow-projectile-multiple',
        color: 'wooden',
        price: {village_wood: buildNum(1.25, 'M'), village_stone: buildNum(400, 'K')},
        value: 21,
        timeNeeded: 100,
        milestone: {
            85: {type: 'changeStat', name: 'timeNeeded', value: 85},
            400: {type: 'changeStat', name: 'timeNeeded', value: 70},
            // 2200: {type: 'villageCraft', name: 'weight', value: true},
            10000: {type: 'changeStat', name: 'timeNeeded', value: 60},
            // 47500: {type: 'villageCraft', name: 'weight', value: true},
        }
    },
    bowl: {
        icon: 'mdi-bowl',
        color: 'brown',
        price: {village_wood: buildNum(2.5, 'M')},
        value: 25,
        timeNeeded: 130,
        milestone: {
            90: {type: 'changeStat', name: 'timeNeeded', value: 100},
            675: {type: 'villageCraft', name: 'bush', value: true},
            4800: {type: 'changeStat', name: 'value', value: 34},
            25000: {type: 'changeStat', name: 'timeNeeded', value: 80},
        }
    },
    chain: {
        icon: 'mdi-link-variant',
        color: 'light-grey',
        price: {village_plantFiber: buildNum(3, 'M'), village_metal: buildNum(1.35, 'M')},
        value: 19,
        timeNeeded: 70,
        milestone: {
            140: {type: 'changeStat', name: 'timeNeeded', value: 60},
            875: {type: 'villageCraft', name: 'garage', value: true},
            4300: {type: 'changeStat', name: 'value', value: 25},
            23000: {type: 'changeStat', name: 'timeNeeded', value: 50},
        }
    },
    spear: {
        icon: 'mdi-spear',
        color: 'dark-grey',
        price: {village_wood: buildNum(8, 'M'), village_metal: buildNum(1.75, 'M')},
        value: 26,
        timeNeeded: 120,
        milestone: {
            110: {type: 'changeStat', name: 'timeNeeded', value: 95},
            800: {type: 'changeStat', name: 'value', value: 35},
            5750: {type: 'changeStat', name: 'timeNeeded', value: 75},
            28000: {type: 'changeStat', name: 'value', value: 45},
        }
    },
    goldenRing: {
        icon: 'mdi-circle-outline',
        color: 'amber',
        price: {village_metal: buildNum(5, 'M'), village_water: buildNum(750, 'K')},
        value: 140,
        timeNeeded: 600,
        milestone: {
            30: {type: 'changeStat', name: 'value', value: 188},
            225: {type: 'changeStat', name: 'value', value: 239},
            1800: {type: 'changeStat', name: 'value', value: 295},
        }
    },

    // Special ingredient recipes
    poisonedArrows: {
        icon: 'mdi-arrow-projectile-multiple',
        color: 'light-green',
        price: {craft_arrows: 5, village_acidVial: 1},
        prio: 1,
        value: 850,
        timeNeeded: 600,
        milestone: {
            120: {type: 'changeStat', name: 'value', value: 1100},
            700: {type: 'changeStat', name: 'value', value: 1400},
            5000: {type: 'changeStat', name: 'timeNeeded', value: 300},
        }
    },
    frostSpear: {
        icon: 'mdi-spear',
        color: 'cyan',
        price: {craft_spear: 10, village_snowflake: 1},
        prio: 1,
        value: 2200,
        timeNeeded: 1500,
        milestone: {
            55: {type: 'changeStat', name: 'value', value: 3000},
            300: {type: 'changeStat', name: 'value', value: 3950},
            2350: {type: 'changeStat', name: 'value', value: 5100},
        }
    },
    spicySoup: {
        icon: 'mdi-pot-steam',
        color: 'orange-red',
        price: {craft_bowl: 15, village_plantFiber: buildNum(250, 'M'), village_water: buildNum(35, 'M'), village_chiliBundle: 1},
        prio: 1,
        value: 2550,
        timeNeeded: 75,
        milestone: {
            40: {type: 'changeStat', name: 'value', value: 3400},
            240: {type: 'changeStat', name: 'value', value: 4500},
            1900: {type: 'changeStat', name: 'value', value: 5750},
        }
    },
    stopwatch: {
        icon: 'mdi-timer',
        color: 'pale-blue',
        price: {craft_screws: 20, village_metal: buildNum(1.44, 'B'), village_gears: 1},
        prio: 1,
        value: 8600,
        timeNeeded: 3600,
        milestone: {
            65: {type: 'changeStat', name: 'timeNeeded', value: 1800},
            335: {type: 'changeStat', name: 'value', value: buildNum(12.5, 'K')},
        }
    },

    // Random recipes

    // Special recipes
    smallChest: {
        icon: 'mdi-treasure-chest',
        color: 'pale-yellow',
        price: {
            craft_rope: lvl => Math.pow(2, lvl) * 60,
            craft_woodenPlanks: lvl => Math.pow(2, lvl) * 30,
            craft_brick: lvl => Math.pow(2, lvl) * 15,
            craft_screws: lvl => Math.pow(2, lvl) * 25
        },
        prio: 1,
        isSpecial: true,
        effect: [
            {name: 'villageMaterialCap', type: 'mult', value: lvl => lvl * 0.1 + 1}
        ],
        timeNeeded: 7200
    },
    bush: {
        icon: 'mdi-nature',
        color: 'green',
        price: {
            village_water: lvl => Math.pow(1.25, lvl) * buildNum(500, 'K'),
            craft_pouch: lvl => getSequence(5, lvl + 1) * 8,
            craft_bowl: lvl => getSequence(2, lvl + 1) * 10
        },
        prio: 1,
        isSpecial: true,
        effect: [
            {name: 'currencyVillagePlantFiberGain', type: 'mult', value: lvl => lvl * 0.05 + 1},
            {name: 'currencyVillagePlantFiberCap', type: 'base', value: lvl => getSequence(2, lvl) * 500}
        ],
        timeNeeded: 3600
    },
    handSaw: {
        icon: 'mdi-hand-saw',
        color: 'light-grey',
        price: {
            village_metal: lvl => Math.pow(1.25, lvl) * buildNum(1.8, 'M'),
            craft_weight: lvl => getSequence(3, lvl + 1) * 15
        },
        prio: 1,
        isSpecial: true,
        effect: [
            {name: 'currencyVillageWoodGain', type: 'mult', value: lvl => lvl * 0.05 + 1},
            {name: 'currencyVillageWoodCap', type: 'base', value: lvl => getSequence(2, lvl) * 500}
        ],
        timeNeeded: 3600
    },
    garage: {
        icon: 'mdi-garage-open-variant',
        color: 'dark-grey',
        price: {
            village_wood: lvl => Math.pow(1.25, lvl) * buildNum(14, 'M'),
            craft_chain: lvl => getSequence(3, lvl + 1) * 15
        },
        prio: 1,
        isSpecial: true,
        effect: [
            {name: 'currencyVillageStoneGain', type: 'mult', value: lvl => lvl * 0.05 + 1},
            {name: 'currencyVillageStoneCap', type: 'base', value: lvl => getSequence(2, lvl) * 500}
        ],
        timeNeeded: 3600
    },

    diamondRing: {
        icon: 'mdi-ring',
        color: 'cyan',
        price: {
            village_metal: lvl => Math.pow(1.25, lvl) * buildNum(14, 'M'),
            village_gem: lvl => Math.pow(1.25, lvl) * buildNum(2, 'M'),
            craft_goldenRing: lvl => getSequence(2, lvl) * 5
        },
        prio: 1,
        isSpecial: true,
        effect: [
            {name: 'currencyVillageCoinGain', type: 'mult', value: lvl => lvl * 0.2 + 1},
            {name: 'currencyVillageCopperCoinGain', type: 'mult', value: lvl => lvl * 0.2 + 1},
        ],
        timeNeeded: 14400
    },
};
const VI_UPG1 = {
    wallet: {cap: 12, requirement() {
        return VSTORE.state.unlock.villageCoinUpgrades.use;
    }, price(lvl) {
        return {village_coin: Math.ceil(Math.pow(1.3, lvl) * 200)};
    }, effect: [
        {name: 'currencyVillageCoinCap', type: 'base', value: lvl => lvl * 150}
    ]},
    resourceBag: {cap: 10, requirement() {
        return VSTORE.state.unlock.villageCoinUpgrades.use;
    }, price(lvl) {
        return {village_coin: Math.ceil(Math.pow(1.4, lvl) * 200)};
    }, effect: [
        {name: 'currencyVillagePlantFiberCap', type: 'base', value: lvl => lvl * 200},
        {name: 'currencyVillageWoodCap', type: 'base', value: lvl => lvl * 200},
        {name: 'currencyVillageStoneCap', type: 'base', value: lvl => lvl * 200}
    ]},
    metalBag: {cap: 5, requirement() {
        return VSTORE.state.unlock.villageCoinUpgrades.use;
    }, price(lvl) {
        return {village_coin: Math.ceil(Math.pow(1.7, lvl) * 300)};
    }, effect: [
        {name: 'currencyVillageMetalCap', type: 'base', value: lvl => lvl * 400}
    ]},

    // Coin upgrades
    scythe: {cap: 20, requirement() {
        return VSTORE.state.unlock.villageUpgradeScythe.use;
    }, price(lvl) {
        return {village_coin: Math.ceil(Math.pow(1.55, lvl) * 2500)};
    }, effect: [
        {name: 'currencyVillagePlantFiberGain', type: 'mult', value: lvl => Math.pow(1.05, lvl) * (lvl * 0.05 + 1)},
        {name: 'currencyVillageGrainGain', type: 'mult', value: lvl => Math.pow(1.08, lvl)}
    ]},
    hatchet: {cap: 20, requirement() {
        return VSTORE.state.unlock.villageUpgradeHatchet.use;
    }, price(lvl) {
        return {village_coin: Math.ceil(Math.pow(1.55, lvl) * 5000)};
    }, effect: [
        {name: 'currencyVillageWoodGain', type: 'mult', value: lvl => Math.pow(1.05, lvl) * (lvl * 0.05 + 1)},
        {name: 'currencyVillageFruitGain', type: 'mult', value: lvl => Math.pow(1.08, lvl)}
    ]},
    pickaxe: {cap: 20, requirement() {
        return VSTORE.state.unlock.villageUpgradePickaxe.use;
    }, price(lvl) {
        return {village_coin: Math.ceil(Math.pow(1.55, lvl) * 7500)};
    }, effect: [
        {name: 'currencyVillageStoneGain', type: 'mult', value: lvl => Math.pow(1.05, lvl) * (lvl * 0.05 + 1)},
        {name: 'currencyVillageMetalGain', type: 'mult', value: lvl => Math.pow(1.04, lvl) * (lvl * 0.04 + 1)}
    ]},
    wateringCan: {cap: 20, requirement() {
        return VSTORE.state.unlock.villageUpgradeWateringCan.use;
    }, price(lvl) {
        return {village_coin: Math.ceil(Math.pow(1.55, lvl) * buildNum(10, 'K'))};
    }, effect: [
        {name: 'currencyVillageGrainGain', type: 'mult', value: lvl => Math.pow(1.05, lvl)},
        {name: 'currencyVillageFruitGain', type: 'mult', value: lvl => Math.pow(1.05, lvl)},
        {name: 'currencyVillageWaterGain', type: 'mult', value: lvl => Math.pow(1.22, lvl)}
    ]},
    investment: {cap: 50, requirement() {
        return VSTORE.state.unlock.villageUpgradeInvestment.use;
    }, price(lvl) {
        return {village_coin: Math.ceil(Math.pow(1.35, lvl) * buildNum(12.5, 'K'))};
    }, effect: [
        {name: 'villageTaxRate', type: 'mult', value: lvl => Math.pow(1.05, lvl)},
        {name: 'currencyVillageCoinGain', type: 'mult', value: lvl => Math.pow(1.11, lvl)}
    ]},

    // Knowledge upgrades
    basics: {cap: 20, requirement() {
        return VSTORE.state.unlock.villageUpgradeBasics.use;
    }, price(lvl) {
        return {village_knowledge: 12 * lvl + 80};
    }, effect: [
        {name: 'currencyVillagePlantFiberGain', type: 'mult', value: lvl => Math.pow(1.05, lvl) * (lvl * 0.15 + 1)},
        {name: 'currencyVillageWoodGain', type: 'mult', value: lvl => Math.pow(1.05, lvl) * (lvl * 0.05 + 1)},
        {name: 'currencyVillageStoneGain', type: 'mult', value: lvl => Math.pow(1.05, lvl) * (lvl * 0.05 + 1)}
    ]},
    processing: {cap: 20, requirement() {
        return VSTORE.state.unlock.villageUpgradeProcessing.use;
    }, price(lvl) {
        return {village_knowledge: 12 * lvl + 120};
    }, effect: [
        {name: 'villageFoodGain', type: 'mult', value: lvl => Math.pow(1.07, lvl)},
        {name: 'currencyVillageMetalGain', type: 'mult', value: lvl => Math.pow(1.05, lvl) * (lvl * 0.05 + 1)}
    ]},
    pump: {cap: 20, requirement() {
        return VSTORE.state.unlock.villageUpgradePump.use;
    }, price(lvl) {
        return {village_knowledge: 12 * lvl + 160};
    }, effect: [
        {name: 'currencyVillageWaterGain', type: 'mult', value: lvl => Math.pow(1.2, lvl) * (lvl * 0.04 + 1)}
    ]},
    sand: {cap: 20, requirement() {
        return VSTORE.state.unlock.villageUpgradeSand.use;
    }, price(lvl) {
        return {village_knowledge: 12 * lvl + 200};
    }, effect: [
        {name: 'currencyVillageGlassGain', type: 'mult', value: lvl => Math.pow(1.08, lvl) * (lvl * 0.08 + 1)}
    ]},
    book: {cap: 20, requirement() {
        return VSTORE.state.unlock.villageUpgradeBook.use;
    }, price(lvl) {
        return {village_knowledge: 12 * lvl + 240};
    }, effect: [
        {name: 'currencyVillageKnowledgeGain', type: 'mult', value: lvl => lvl * 0.04 + 1}
    ]},

    // More coin upgrades
    axe: {cap: 40, requirement() {
        return VSTORE.state.unlock.villageUpgradeAxe.use;
    }, price(lvl) {
        return {village_coin: Math.ceil(Math.pow(1.3, lvl) * buildNum(500, 'K'))};
    }, effect: [
        {name: 'currencyVillageWoodGain', type: 'mult', value: lvl => lvl * 0.05 + 1},
        {name: 'currencyVillageHardwoodGain', type: 'mult', value: lvl => lvl * 0.05 + 1}
    ]},
    bomb: {cap: 40, requirement() {
        return VSTORE.state.unlock.villageUpgradeBomb.use;
    }, price(lvl) {
        return {village_coin: Math.ceil(Math.pow(1.3, lvl) * buildNum(1.5, 'M'))};
    }, effect: [
        {name: 'currencyVillageStoneGain', type: 'mult', value: lvl => lvl * 0.05 + 1},
        {name: 'currencyVillageGemGain', type: 'mult', value: lvl => lvl * 0.05 + 1}
    ]},
    toll: {cap: 40, requirement() {
        return VSTORE.state.unlock.villageUpgradeToll.use;
    }, price(lvl) {
        return {village_coin: Math.ceil(Math.pow(1.3, lvl) * buildNum(4, 'M'))};
    }, effect: [
        {name: 'villageTaxRate', type: 'mult', value: lvl => lvl * 0.05 + 1}
    ]},
    fishingRod: {cap: 40, requirement() {
        return VSTORE.state.unlock.villageUpgradeFishingRod.use;
    }, price(lvl) {
        return {village_coin: Math.ceil(Math.pow(1.3, lvl) * buildNum(10, 'M'))};
    }, effect: [
        {name: 'currencyVillageFishGain', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    holyBook: {cap: 40, requirement() {
        return VSTORE.state.unlock.villageUpgradeHolyBook.use;
    }, price(lvl) {
        return {village_coin: Math.ceil(Math.pow(1.45, lvl) * buildNum(22.5, 'M'))};
    }, effect: [
        {name: 'currencyVillageFaithCap', type: 'base', value: lvl => lvl * 8}
    ]},

    // Science upgrades
    breakthrough: {cap: 50, requirement() {
        return VSTORE.state.unlock.villageUpgradeBreakthrough.use;
    }, price(lvl) {
        return {village_science: Math.round(Math.pow(1.05, Math.max(lvl - 25, 0)) * lvl * 10 + 20)};
    }, effect: [
        {name: 'currencyVillageKnowledgeCap', type: 'base', value: lvl => lvl * 5},
        {name: 'currencyVillageScienceCap', type: 'base', value: lvl => lvl * 2}
    ]},
    modifiedPlants: {cap: 10, requirement() {
        return VSTORE.state.unlock.villageUpgradeModifiedPlants.use;
    }, price(lvl) {
        return {village_science: lvl * 15 + 30};
    }, effect: [
        {name: 'currencyVillagePlantFiberGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'currencyVillageGrainGain', type: 'mult', value: lvl => lvl * 0.05 + 1},
        {name: 'currencyVillageFruitGain', type: 'mult', value: lvl => lvl * 0.05 + 1},
        {name: 'currencyVillageVegetableGain', type: 'mult', value: lvl => lvl * 0.05 + 1}
    ]},
    dopamine: {cap: 15, requirement() {
        return VSTORE.state.unlock.villageUpgradeDopamine.use;
    }, price(lvl) {
        return {village_science: lvl * 15 + 40};
    }, effect: [
        {name: 'villageHappiness', type: 'base', value: lvl => lvl * 0.002},
        {name: 'currencyVillageJoyCap', type: 'base', value: lvl => lvl * 50}
    ]},
    adrenaline: {cap: 15, requirement() {
        return VSTORE.state.unlock.villageUpgradeAdrenaline.use;
    }, price(lvl) {
        return {village_science: lvl * 15 + 50};
    }, effect: [
        {name: 'currencyVillageHardwoodGain', type: 'mult', value: lvl => lvl * 0.05 + 1},
        {name: 'currencyVillageGemGain', type: 'mult', value: lvl => lvl * 0.05 + 1},
        {name: 'currencyVillageFishGain', type: 'mult', value: lvl => lvl * 0.05 + 1}
    ]},

    // Old library upgrades
    sprinkler: {cap: 15, requirement() {
        return VSTORE.state.unlock.villageUpgradeSprinkler.use;
    }, price(lvl) {
        return {village_coin: Math.ceil(Math.pow(1.65, lvl) * buildNum(2, 'T'))};
    }, effect: [
        {name: 'currencyVillagePlantFiberGain', type: 'mult', value: lvl => lvl * 0.05 + 1},
        {name: 'currencyVillageGrainGain', type: 'mult', value: lvl => Math.pow(1.2, lvl)},
        {name: 'currencyVillageFruitGain', type: 'mult', value: lvl => Math.pow(1.2, lvl)},
        {name: 'currencyVillageVegetableGain', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
    ]},
    greed: {cap: 15, requirement() {
        return VSTORE.state.unlock.villageUpgradeGreed.use;
    }, price(lvl) {
        return {village_knowledge: lvl * 160 + 2200, village_science: lvl * 45 + 500};
    }, effect: [
        {name: 'villageTaxRate', type: 'mult', value: lvl => Math.pow(1.4, lvl)},
        {name: 'currencyVillageCoinGain', type: 'mult', value: lvl => Math.pow(1.1, lvl)},
        {name: 'villagePollution', type: 'base', value: lvl => lvl}
    ]},

    // Loot upgrades
    ambition: {requirement() {
        return VSTORE.state.unlock.villageUpgradeAmbition.use;
    }, price(lvl) {
        return {village_loot0: Math.ceil(Math.pow(1.15, lvl) * (lvl * 2 + 6))};
    }, effect: [
        {name: 'villageLootGain', type: 'mult', value: lvl => lvl * 0.01 + 1},
        {name: 'villageLootQuality', type: 'base', value: lvl => lvl}
    ]},
    understanding: {cap: 20, requirement() {
        return VSTORE.state.unlock.villageUpgradeUnderstanding.use;
    }, price(lvl) {
        return {village_loot0: Math.ceil(Math.pow(1.2, lvl) * 55)};
    }, effect: [
        {name: 'currencyVillageKnowledgeCap', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'currencyVillageScienceCap', type: 'mult', value: lvl => lvl * 0.05 + 1}
    ]},
    curiosity: {requirement() {
        return VSTORE.state.unlock.villageUpgradeCuriosity.use;
    }, price(lvl) {
        return {village_loot1: Math.ceil(Math.pow(1.15, lvl) * (lvl + 4))};
    }, effect: [
        {name: 'villageLootGain', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    worship: {cap: 20, requirement() {
        return VSTORE.state.unlock.villageUpgradeWorship.use;
    }, price(lvl) {
        return {village_loot1: Math.ceil(Math.pow(1.18, lvl) * 55)};
    }, effect: [
        {name: 'currencyVillageFaithCap', type: 'mult', value: lvl => getSequence(2, lvl) * 0.1 + 1}
    ]},
    bartering: {requirement() {
        return VSTORE.state.unlock.villageUpgradeBartering.use;
    }, price(lvl) {
        return {village_loot2: Math.ceil(Math.pow(1.15, lvl) * (lvl + 2.5))};
    }, effect: [
        {name: 'villageLootQuality', type: 'base', value: lvl => lvl},
        {name: 'currencyVillageCoinGain', type: 'mult', value: lvl => Math.pow(1.08, lvl)}
    ]},
    sparks: {cap: 20, requirement() {
        return VSTORE.state.unlock.villageUpgradeSparks.use;
    }, price(lvl) {
        return {village_loot2: Math.ceil(Math.pow(1.16, lvl) * 55)};
    }, effect: [
        {name: 'villagePower', type: 'base', value: lvl => lvl}
    ]},
};
const VI_UPG2 = {
    cashRegister: {subfeature: 1, price(lvl) {
        return {village_copperCoin: Math.pow(lvl * 0.25 + 2, lvl) * 2000};
    }, effect: [
        {name: 'villageCounter', type: 'base', value: lvl => lvl},
        {name: 'currencyVillageCopperCoinCap', type: 'mult', value: lvl => Math.pow(2, lvl)}
    ]},
    decoration: {subfeature: 1, price(lvl) {
        return {village_copperCoin: Math.pow(1.75, lvl) * 900};
    }, effect: [
        {name: 'currencyVillageCopperCoinGain', type: 'mult', value: lvl => Math.pow(1.175, lvl)}
    ]},
    plantFiberBin: {subfeature: 1, price(lvl) {
        if (lvl === 0) {
            return {};
        }
        return {village_copperCoin: Math.pow(3, lvl) * 100};
    }, effect: [
        {name: 'currencyVillagePlantFiberGain', type: 'base', value: lvl => getSequence(1, lvl) * 0.1},
        {name: 'rope', type: 'villageCraft', value: lvl => lvl >= 1}
    ]},
    woodBin: {subfeature: 1, requirement() {
        return VSTORE.state.upgrade.item.village_plantFiberBin.highestLevel >= 1;
    }, price(lvl) {
        return {village_copperCoin: Math.pow(3, lvl) * 200};
    }, effect: [
        {name: 'currencyVillageWoodGain', type: 'base', value: lvl => getSequence(1, lvl) * 0.1},
        {name: 'woodenPlanks', type: 'villageCraft', value: lvl => lvl >= 1}
    ]},
    stoneBin: {subfeature: 1, requirement() {
        return VSTORE.state.upgrade.item.village_woodBin.highestLevel >= 1;
    }, price(lvl) {
        return {village_copperCoin: Math.pow(3, lvl) * 500};
    }, effect: [
        {name: 'currencyVillageStoneGain', type: 'base', value: lvl => getSequence(1, lvl) * 0.1},
        {name: 'brick', type: 'villageCraft', value: lvl => lvl >= 1}
    ]},
    metalBin: {subfeature: 1, requirement() {
        return VSTORE.state.upgrade.item.village_stoneBin.highestLevel >= 1;
    }, price(lvl) {
        return {village_copperCoin: Math.pow(3, lvl) * buildNum(50, 'K')};
    }, effect: [
        {name: 'currencyVillageMetalGain', type: 'base', value: lvl => getSequence(1, lvl) * 0.075},
        {name: 'screws', type: 'villageCraft', value: lvl => lvl >= 1}
    ]},
    waterBin: {subfeature: 1, requirement() {
        return VSTORE.state.upgrade.item.village_metalBin.highestLevel >= 1;
    }, price(lvl) {
        return {village_copperCoin: Math.pow(3, lvl) * buildNum(600, 'K')};
    }, effect: [
        {name: 'currencyVillageWaterGain', type: 'base', value: lvl => getSequence(1, lvl) * 0.06},
        {name: 'waterBottle', type: 'villageCraft', value: lvl => lvl >= 1}
    ]},
    glassBin: {subfeature: 1, requirement() {
        return VSTORE.state.upgrade.item.village_waterBin.highestLevel >= 1;
    }, price(lvl) {
        return {village_copperCoin: Math.pow(3, lvl) * buildNum(14.5, 'M')};
    }, effect: [
        {name: 'currencyVillageGlassGain', type: 'base', value: lvl => getSequence(1, lvl) * 0.05},
        {name: 'cocktailGlass', type: 'villageCraft', value: lvl => lvl >= 1}
    ]},
    hardwoodBin: {subfeature: 1, requirement() {
        return VSTORE.state.upgrade.item.village_glassBin.highestLevel >= 1;
    }, price(lvl) {
        return {village_copperCoin: Math.pow(3, lvl) * buildNum(900, 'M')};
    }, effect: [
        {name: 'currencyVillageHardwoodGain', type: 'base', value: lvl => getSequence(1, lvl) * 0.025},
        {name: 'boomerang', type: 'villageCraft', value: lvl => lvl >= 1}
    ]},
    gemBin: {subfeature: 1, requirement() {
        return VSTORE.state.upgrade.item.village_hardwoodBin.highestLevel >= 1;
    }, price(lvl) {
        return {village_copperCoin: Math.pow(3, lvl) * buildNum(85, 'B')};
    }, effect: [
        {name: 'currencyVillageGemGain', type: 'base', value: lvl => getSequence(1, lvl) * 0.025},
        {name: 'polishedGem', type: 'villageCraft', value: lvl => lvl >= 1}
    ]},
    oilBin: {subfeature: 1, requirement() {
        return VSTORE.state.upgrade.item.village_gemBin.highestLevel >= 1;
    }, price(lvl) {
        return {village_copperCoin: Math.pow(3, lvl) * buildNum(9.6, 'T')};
    }, effect: [
        {name: 'currencyVillageOilGain', type: 'base', value: lvl => getSequence(1, lvl) * 0.015},
        {name: 'oilLamp', type: 'villageCraft', value: lvl => lvl >= 1}
    ]},
    marbleBin: {subfeature: 1, requirement() {
        return VSTORE.state.upgrade.item.village_oilBin.highestLevel >= 1;
    }, price(lvl) {
        return {village_copperCoin: Math.pow(3, lvl) * buildNum(1.44, 'Qa')};
    }, effect: [
        {name: 'currencyVillageMarbleGain', type: 'base', value: lvl => getSequence(1, lvl) * 0.01},
        {name: 'shower', type: 'villageCraft', value: lvl => lvl >= 1}
    ]},
};
const VI_UPGP = {
    arch: {type: 'prestige', price(lvl) {
        return {village_blessing: Math.pow(1.35, lvl) * 50};
    }, effect: [
        {name: 'villageWorker', type: 'base', value: lvl => lvl * 2}
    ]},
    holyGrass: {type: 'prestige', price(lvl) {
        return {village_blessing: Math.pow(1.65, lvl) * 50};
    }, effect: [
        {name: 'currencyVillagePlantFiberGain', type: 'mult', value: lvl => lvl * 0.2 + 1},
        {name: 'currencyVillagePlantFiberCap', type: 'mult', value: lvl => Math.pow(1.25, lvl)}
    ]},
    holyTree: {type: 'prestige', price(lvl) {
        return {village_blessing: Math.pow(1.65, lvl) * 50};
    }, effect: [
        {name: 'currencyVillageWoodGain', type: 'mult', value: lvl => lvl * 0.2 + 1},
        {name: 'currencyVillageWoodCap', type: 'mult', value: lvl => Math.pow(1.25, lvl)}
    ]},
    holyRock: {type: 'prestige', price(lvl) {
        return {village_blessing: Math.pow(1.65, lvl) * 50};
    }, effect: [
        {name: 'currencyVillageStoneGain', type: 'mult', value: lvl => lvl * 0.2 + 1},
        {name: 'currencyVillageStoneCap', type: 'mult', value: lvl => Math.pow(1.25, lvl)}
    ]},
    holyMetal: {type: 'prestige', price(lvl) {
        return {village_blessing: Math.pow(1.65, lvl) * 70};
    }, effect: [
        {name: 'currencyVillageMetalGain', type: 'mult', value: lvl => lvl * 0.2 + 1},
        {name: 'currencyVillageMetalCap', type: 'mult', value: lvl => Math.pow(1.25, lvl)}
    ]},
    churchTax: {type: 'prestige', price(lvl) {
        return {village_blessing: Math.pow(1.85, lvl) * 80};
    }, effect: [
        {name: 'villageTaxRate', type: 'mult', value: lvl => Math.pow(1.1, lvl)}
    ]},
    holyWater: {name: 'holyWater', feature: 'village', type: 'prestige', price(lvl) {
        return {village_blessing: Math.pow(1.65, lvl) * 90};
    }, effect: [
        {name: 'currencyVillageWaterGain', type: 'mult', value: lvl => lvl * 0.2 + 1},
        {name: 'currencyVillageWaterCap', type: 'mult', value: lvl => Math.pow(1.25, lvl)}
    ]},
    holyGlass: {type: 'prestige', price(lvl) {
        return {village_blessing: Math.pow(1.65, lvl) * 100};
    }, effect: [
        {name: 'currencyVillageGlassGain', type: 'mult', value: lvl => lvl * 0.2 + 1},
        {name: 'currencyVillageGlassCap', type: 'mult', value: lvl => Math.pow(1.25, lvl)}
    ]},
    holyCrane: {type: 'prestige', price(lvl) {
        return {village_blessing: Math.pow(2.15, lvl) * 125};
    }, effect: [
        {name: 'queueSpeedVillageBuilding', type: 'base', value: lvl => lvl},
        {name: 'queueSpeedVillageBuilding', type: 'mult', value: lvl => Math.pow(1.25, lvl)}
    ]},
    monk: {type: 'prestige', price(lvl) {
        return {village_blessing: Math.pow(1.85, lvl) * 150};
    }, effect: [
        {name: 'currencyVillageKnowledgeGain', type: 'mult', value: lvl => lvl * 0.05 + 1},
        {name: 'currencyVillageKnowledgeCap', type: 'base', value: lvl => lvl * 10}
    ]},
    holyPiggyBank: {type: 'prestige', price(lvl) {
        return {village_blessing: Math.pow(2.3, lvl) * 200};
    }, effect: [
        {name: 'currencyVillageCoinCap', type: 'mult', value: lvl => Math.pow(1.25, lvl)}
    ]},
    deepWorship: {type: 'prestige', price(lvl) {
        return {village_blessing: Math.pow(2.75, lvl) * 250};
    }, effect: [
        {name: 'currencyVillageFaithCap', type: 'mult', value: lvl => Math.pow(1.5, lvl)}
    ]},
    cityPlanning: {type: 'prestige', cap: 5, requirement() {
        return VSTORE.state.unlock.villageBuildings4.see;
    }, price(lvl) {
        return {village_blessing: Math.pow(3.2, lvl) * 1750};
    }, effect: [
        {name: 'villageHousingCap', type: 'base', value: lvl => lvl * 5}
    ]},
    managers: {type: 'prestige', cap: 5, requirement() {
        return VSTORE.state.unlock.villageBuildings4.see;
    }, price(lvl) {
        return {village_blessing: Math.pow(3.2, lvl) * 2100};
    }, effect: [
        {name: 'villageWorkstationCap', type: 'base', value: lvl => lvl * 2}
    ]},
    warehouse: {type: 'prestige', cap: 6, requirement() {
        return VSTORE.state.unlock.villageBuildings4.see;
    }, price(lvl) {
        return {village_blessing: Math.pow(3.3, lvl) * 1300};
    }, effect: [
        {name: 'village_storage', type: 'keepUpgrade', value: lvl => lvl >= 1},
        {name: 'village_forge', type: 'keepUpgrade', value: lvl => lvl >= 2},
        {name: 'village_safe', type: 'keepUpgrade', value: lvl => lvl >= 3},
        {name: 'village_aquarium', type: 'keepUpgrade', value: lvl => lvl >= 4},
        {name: 'village_knowledgeTower', type: 'keepUpgrade', value: lvl => lvl >= 5},
        {name: 'village_bigStorage', type: 'keepUpgrade', value: lvl => lvl >= 6}
    ]},
    sandstone: {type: 'prestige', raiseOtherCap: 'village_obelisk', cap: 10, note: 'village_22', requirement() {
        return VSTORE.state.unlock.villageBuildings4.see;
    }, price(lvl) {
        return {village_blessing: Math.pow(2.25, lvl) * 1500};
    }, effect: [
        {name: 'upgradeVillageObeliskCap', type: 'base', value: lvl => lvl}
    ]},
    holyForest: {type: 'prestige', requirement() {
        return VSTORE.state.unlock.villageBuildings4.see;
    }, price(lvl) {
        return {village_blessing: Math.pow(1.65, lvl) * 1800};
    }, effect: [
        {name: 'currencyVillageHardwoodGain', type: 'mult', value: lvl => lvl * 0.2 + 1},
        {name: 'currencyVillageHardwoodCap', type: 'mult', value: lvl => Math.pow(1.25, lvl)}
    ]},
    holyGem: {type: 'prestige', requirement() {
        return VSTORE.state.unlock.villageBuildings4.see;
    }, price(lvl) {
        return {village_blessing: Math.pow(1.65, lvl) * 1800};
    }, effect: [
        {name: 'currencyVillageGemGain', type: 'mult', value: lvl => lvl * 0.2 + 1},
        {name: 'currencyVillageGemCap', type: 'mult', value: lvl => Math.pow(1.25, lvl)}
    ]},
    deeperWorship: {type: 'prestige', requirement() {
        return VSTORE.state.unlock.villageBuildings5.see;
    }, price(lvl) {
        return {village_blessing: Math.pow(lvl * 0.15 + 1.75, lvl) * buildNum(40, 'K')};
    }, effect: [
        {name: 'currencyVillageFaithCap', type: 'base', value: lvl => lvl * 20},
        {name: 'currencyVillageFaithCap', type: 'mult', value: lvl => Math.pow(1.3, lvl)}
    ]},
    holyLab: {type: 'prestige', requirement() {
        return VSTORE.state.unlock.villageBuildings5.see;
    }, price(lvl) {
        return {village_blessing: Math.pow(1.85, lvl) * buildNum(70, 'K')};
    }, effect: [
        {name: 'currencyVillageScienceGain', type: 'mult', value: lvl => lvl * 0.05 + 1},
        {name: 'currencyVillageScienceCap', type: 'base', value: lvl => lvl * 10}
    ]},
    charity: {type: 'prestige', requirement() {
        return VSTORE.state.unlock.villageBuildings5.see;
    }, price(lvl) {
        return {village_blessing: Math.pow(2.35, lvl) * buildNum(120, 'K')};
    }, effect: [
        {name: 'currencyVillageJoyGain', type: 'mult', value: lvl => lvl * 0.05 + 1},
        {name: 'villageHappiness', type: 'base', value: lvl => lvl * 0.01}
    ]},
    holyOil: {type: 'prestige', requirement() {
        return VSTORE.state.unlock.villageBuildings6.see;
    }, price(lvl) {
        return {village_blessing: Math.pow(1.65, lvl) * buildNum(75, 'M')};
    }, effect: [
        {name: 'currencyVillageOilGain', type: 'mult', value: lvl => lvl * 0.2 + 1},
        {name: 'currencyVillageOilCap', type: 'mult', value: lvl => Math.pow(1.25, lvl)}
    ]},
    holyMarble: {type: 'prestige', requirement() {
        return VSTORE.state.unlock.villageBuildings6.see;
    }, price(lvl) {
        return {village_blessing: Math.pow(1.65, lvl) * buildNum(110, 'M')};
    }, effect: [
        {name: 'currencyVillageMarbleGain', type: 'mult', value: lvl => lvl * 0.2 + 1},
        {name: 'currencyVillageMarbleCap', type: 'mult', value: lvl => Math.pow(1.25, lvl)}
    ]},
    calmingSpeech: {type: 'prestige', requirement() {
        return VSTORE.state.unlock.villageBuildings6.see;
    }, price(lvl) {
        return {village_blessing: Math.pow(0.08 * lvl + 1.8, lvl) * buildNum(150, 'M')};
    }, effect: [
        {name: 'villagePollutionTolerance', type: 'base', value: lvl => lvl}
    ]},
    holyLoot: {type: 'prestige', requirement() {
        return VSTORE.state.unlock.villageBuildings7.see;
    }, price(lvl) {
        return {village_blessing: Math.pow(1.65, lvl) * buildNum(800, 'M')};
    }, effect: [
        {name: 'villageLootGain', type: 'mult', value: lvl => Math.pow(1.05, lvl) * (lvl * 0.1 + 1)}
    ]},
    holyChisel: {type: 'prestige', requirement() {
        return VSTORE.state.unlock.villageBuildings7.see;
    }, price(lvl) {
        return {village_blessing: Math.pow(0.05 * lvl + 1.5, lvl) * buildNum(2.5, 'B')};
    }, effect: [
        {name: 'villageLootQuality', type: 'base', value: lvl => lvl * 2}
    ]},

    hireArtisans: {type: 'prestige', requirement() {
        return VSTORE.state.unlock.villageCraftingSubfeature.see;
    }, price(lvl) {
        return {village_shares: Math.pow(10, getSequence(1, lvl)) * 10};
    }, effect: [
        {name: 'villageArtisan', type: 'base', value: lvl => lvl}
    ]},
    hireWorkers: {type: 'prestige', requirement() {
        return VSTORE.state.unlock.villageCraftingSubfeature.see;
    }, price(lvl) {
        return {village_shares: Math.pow(lvl * 0.02 + 1.65, lvl) * 5};
    }, effect: [
        {name: 'villageMaterialGain', type: 'mult', value: lvl => Math.pow(1.05, lvl) * (lvl * 0.05 + 1)}
    ]},
    hireAccountants: {type: 'prestige', requirement() {
        return VSTORE.state.unlock.villageCraftingSubfeature.see;
    }, price(lvl) {
        return {village_shares: Math.pow(1.9, lvl) * 8};
    }, effect: [
        {name: 'currencyVillageCopperCoinCap', type: 'mult', value: lvl => Math.pow(1.75, lvl)}
    ]},
    recipeBook: {type: 'prestige', cap: 6, requirement() {
        return VSTORE.state.unlock.villageCraftingSubfeature.see;
    }, price(lvl) {
        return {village_shares: Math.pow(2.5, lvl) * 60};
    }, effect: [
        {name: 'arrows', type: 'villageCraft', value: lvl => lvl >= 1},
        {name: 'bowl', type: 'villageCraft', value: lvl => lvl >= 2},
        {name: 'smallChest', type: 'villageCraft', value: lvl => lvl >= 3},
        {name: 'chain', type: 'villageCraft', value: lvl => lvl >= 4},
        {name: 'spear', type: 'villageCraft', value: lvl => lvl >= 5},
        {name: 'goldenRing', type: 'villageCraft', value: lvl => lvl >= 6},
    ]},
    adCampaign: {type: 'prestige', requirement() {
        return VSTORE.state.unlock.villageCraftingSubfeature.see;
    }, price(lvl) {
        return {village_shares: Math.pow(lvl * 0.05 + 1.9, lvl) * 80};
    }, effect: [
        {name: 'currencyVillageCopperCoinGain', type: 'mult', value: lvl => Math.pow(1.1, lvl) * (lvl * 0.2 + 1)}
    ]},
    hireExplorers: {type: 'prestige', cap: 4, requirement() {
        return VSTORE.state.unlock.villageCraftingSubfeature.see;
    }, price(lvl) {
        return {village_shares: Math.pow(15, getSequence(1, lvl)) * 575};
    }, effect: [
        {name: 'villageSpecialIngredient', type: 'unlock', value: lvl => lvl >= 1},
        {name: 'villageIngredientCount', type: 'base', value: lvl => lvl > 1 ? (lvl - 1) : null},
        {name: 'villageIngredientBoxAmount', type: 'base', value: lvl => lvl > 1 ? (4 * (lvl - 1)) : null},
        {name: 'poisonedArrows', type: 'villageCraft', value: lvl => lvl >= 1},
        {name: 'frostSpear', type: 'villageCraft', value: lvl => lvl >= 2},
        {name: 'spicySoup', type: 'villageCraft', value: lvl => lvl >= 3},
        {name: 'stopwatch', type: 'villageCraft', value: lvl => lvl >= 4},
        {name: 'village_ingredientBox', type: 'gainConsumable', value: () => 3},
    ]},
    hireGardeners: {type: 'prestige', requirement() {
        return VSTORE.state.upgrade.item.village_woodBin.highestLevel >= 1;
    }, price(lvl) {
        return {village_shares: Math.pow(1.75, lvl) * 140};
    }, effect: [
        {name: 'currencyVillagePlantFiberGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'currencyVillageWoodGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'currencyVillagePlantFiberCap', type: 'mult', value: lvl => Math.pow(1.2, lvl)},
        {name: 'currencyVillageWoodCap', type: 'mult', value: lvl => Math.pow(1.2, lvl)}
    ]},
    hireMiners: {type: 'prestige', requirement() {
        return VSTORE.state.upgrade.item.village_metalBin.highestLevel >= 1;
    }, price(lvl) {
        return {village_shares: Math.pow(1.75, lvl) * 220};
    }, effect: [
        {name: 'currencyVillageStoneGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'currencyVillageMetalGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'currencyVillageStoneCap', type: 'mult', value: lvl => Math.pow(1.2, lvl)},
        {name: 'currencyVillageMetalCap', type: 'mult', value: lvl => Math.pow(1.2, lvl)}
    ]},
    hireBartenders: {type: 'prestige', requirement() {
        return VSTORE.state.upgrade.item.village_glassBin.highestLevel >= 1;
    }, price(lvl) {
        return {village_shares: Math.pow(1.75, lvl) * 335};
    }, effect: [
        {name: 'currencyVillageWaterGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'currencyVillageGlassGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'currencyVillageWaterCap', type: 'mult', value: lvl => Math.pow(1.2, lvl)},
        {name: 'currencyVillageGlassCap', type: 'mult', value: lvl => Math.pow(1.2, lvl)}
    ]},
    hireExperts: {type: 'prestige', requirement() {
        return VSTORE.state.upgrade.item.village_gemBin.highestLevel >= 1;
    }, price(lvl) {
        return {village_shares: Math.pow(1.75, lvl) * 520};
    }, effect: [
        {name: 'currencyVillageHardwoodGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'currencyVillageGemGain', type: 'mult', value: lvl => lvl * 0.1 + 1},
        {name: 'currencyVillageHardwoodCap', type: 'mult', value: lvl => Math.pow(1.2, lvl)},
        {name: 'currencyVillageGemCap', type: 'mult', value: lvl => Math.pow(1.2, lvl)}
    ]},
};
const VI_UPGM = {
    overtime: {type: 'premium', price(lvl) {
        return {gem_ruby: fallbackArray([70], [2, 3][(lvl - 1) % 2] * Math.pow(2, Math.floor((lvl - 1) / 2)) * 100, lvl)};
    }, effect: [
        {name: 'villageMaterialGain', type: 'mult', value: lvl => fallbackArray([1, 1.1], Math.pow(1.25, lvl - 1), lvl)}
    ]},
    goldenThrone: {type: 'premium', requirement() {
        return VSTORE.state.stat.village_coin.total > 0;
    }, price(lvl) {
        return {gem_ruby: fallbackArray([30], [2, 3][(lvl - 1) % 2] * Math.pow(2, Math.floor((lvl - 1) / 2)) * 60, lvl)};
    }, effect: [
        {name: 'currencyVillageCoinGain', type: 'mult', value: lvl => fallbackArray([1, 1.5], getSequence(2, lvl - 1) * 0.5 + 1, lvl)}
    ]},
    fasterBuilding: {type: 'premium', price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 75};
    }, effect: [
        {name: 'queueSpeedVillageBuilding', type: 'mult', value: lvl => lvl + 1}
    ]},
    moreFaith: {type: 'premium', requirement() {
        return VSTORE.state.stat.village_faith.total > 0;
    }, price(lvl) {
        return {gem_ruby: [2, 3][lvl % 2] * Math.pow(2, Math.floor(lvl / 2)) * 80};
    }, effect: [
        {name: 'currencyVillageFaithGain', type: 'mult', value: lvl => lvl * 0.25 + 1},
        {name: 'currencyVillageFaithCap', type: 'mult', value: lvl => lvl * 0.25 + 1}
    ]},
    morePlantFiber: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumResource', requirement() {
        return VSTORE.state.stat.village_plantFiber.total > 0;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 275};
    }, effect: [
        {name: 'currencyVillagePlantFiberGain', type: 'mult', value: lvl => Math.pow(1.75, lvl)},
        {name: 'currencyVillagePlantFiberCap', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    moreWood: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumResource', requirement() {
        return VSTORE.state.stat.village_wood.total > 0;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 275};
    }, effect: [
        {name: 'currencyVillageWoodGain', type: 'mult', value: lvl => Math.pow(1.75, lvl)},
        {name: 'currencyVillageWoodCap', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    moreStone: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumResource', requirement() {
        return VSTORE.state.stat.village_stone.total > 0;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 275};
    }, effect: [
        {name: 'currencyVillageStoneGain', type: 'mult', value: lvl => Math.pow(1.75, lvl)},
        {name: 'currencyVillageStoneCap', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    moreMetal: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumResource', requirement() {
        return VSTORE.state.stat.village_metal.total > 0;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 375};
    }, effect: [
        {name: 'currencyVillageMetalGain', type: 'mult', value: lvl => Math.pow(1.75, lvl)},
        {name: 'currencyVillageMetalCap', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    moreWater: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumResource', requirement() {
        return VSTORE.state.stat.village_water.total > 0;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 450};
    }, effect: [
        {name: 'currencyVillageWaterGain', type: 'mult', value: lvl => Math.pow(1.75, lvl)},
        {name: 'currencyVillageWaterCap', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    moreGlass: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumResource', requirement() {
        return VSTORE.state.stat.village_glass.total > 0;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 600};
    }, effect: [
        {name: 'currencyVillageGlassGain', type: 'mult', value: lvl => Math.pow(1.75, lvl)},
        {name: 'currencyVillageGlassCap', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    moreHardwood: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumResource', requirement() {
        return VSTORE.state.stat.village_hardwood.total > 0;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 900};
    }, effect: [
        {name: 'currencyVillageHardwoodGain', type: 'mult', value: lvl => Math.pow(1.75, lvl)},
        {name: 'currencyVillageHardwoodCap', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    moreGem: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumResource', requirement() {
        return VSTORE.state.stat.village_gem.total > 0;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 900};
    }, effect: [
        {name: 'currencyVillageGemGain', type: 'mult', value: lvl => Math.pow(1.75, lvl)},
        {name: 'currencyVillageGemCap', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    moreKnowledge: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumResource', requirement() {
        return VSTORE.state.stat.village_knowledge.total > 0;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 675};
    }, effect: [
        {name: 'currencyVillageKnowledgeGain', type: 'mult', value: lvl => Math.pow(1.75, lvl)}
    ]},
    moreScience: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumResource', requirement() {
        return VSTORE.state.stat.village_science.total > 0;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 1300};
    }, effect: [
        {name: 'currencyVillageScienceGain', type: 'mult', value: lvl => Math.pow(1.75, lvl)}
    ]},
    moreOil: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumResource', requirement() {
        return VSTORE.state.stat.village_oil.total > 0;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 1800};
    }, effect: [
        {name: 'currencyVillageOilGain', type: 'mult', value: lvl => Math.pow(1.75, lvl)},
        {name: 'currencyVillageOilCap', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
    moreMarble: {type: 'premium', cap: 1, capMult: true, subtype: 'premiumResource', requirement() {
        return VSTORE.state.stat.village_marble.total > 0;
    }, price(lvl) {
        return {gem_ruby: Math.pow(10, lvl) * 2250};
    }, effect: [
        {name: 'currencyVillageMarbleGain', type: 'mult', value: lvl => Math.pow(1.75, lvl)},
        {name: 'currencyVillageMarbleCap', type: 'mult', value: lvl => lvl * 0.1 + 1}
    ]},
};
const VI_MULTDATA = {
        villageWorker: {baseValue: 1, round: true},
        villageArtisan: {baseValue: 1, round: true},
        villageCounter: {baseValue: 1, round: true},
        queueSpeedVillageBuilding: {baseValue: 1},
        villageTaxRate: {display: 'percent'},
        villageHappiness: {display: 'percent', baseValue: 1, min: VILLAGE_MIN_HAPPINESS},
        villagePollution: {round: true, isPositive: false},
        villagePollutionTolerance: {baseValue: 5, round: true},
        villagePower: {min: 0},
        villageOfferingPower: {},
        villageIngredientCount: {baseValue: 1, round: true},
        villageIngredientBoxAmount: {baseValue: 12, round: true},
        villagePrestigeIncome: {group: ['currencyVillageFaithGain', 'currencyVillageFaithCap', 'currencyVillageSharesGain']},

        // Upgrade cap mults
        villageHousingCap: {},
        villageWorkstationCap: {},
        villagePremiumResourceCap: {},

        // Gain mults
        villageFoundationMaterialGain: {},
        villageIndustrialMaterialGain: {},
        villageLuxuryMaterialGain: {},
        villageModernMaterialGain: {},
        villageMaterialGain: {group: ['villageFoundationMaterialGain', 'villageIndustrialMaterialGain', 'villageLuxuryMaterialGain', 'villageModernMaterialGain']},
        villageFoodGain: {},
        villageMentalGain: {},
        villageResourceGain: {group: ['villageMaterialGain', 'villageFoodGain', 'villageMentalGain']},

        // Cap mults
        villageFoundationMaterialCap: {},
        villageIndustrialMaterialCap: {},
        villageLuxuryMaterialCap: {},
        villageModernMaterialCap: {},
        villageMaterialCap: {group: ['villageFoundationMaterialCap', 'villageIndustrialMaterialCap', 'villageLuxuryMaterialCap', 'villageModernMaterialCap']},

        // Policy limits
        villagePolicyTaxes: {round: true},
        villagePolicyImmigration: {round: true},
        villagePolicyReligion: {round: true},
        villagePolicyScanning: {round: true},

        // Loot mults
        villageLootGain: {display: 'perHour'},
        villageLootQuality: {round: true},
    };
const VI_MULTGROUP = [
        {mult: 'villageHousingCap', name: 'upgradeCap', subtype: 'housing'},
        {mult: 'villageWorkstationCap', name: 'upgradeCap', subtype: 'workstation'},
        {mult: 'villagePremiumResourceCap', name: 'upgradeCap', subtype: 'premiumResource'},
        {mult: 'villageFoundationMaterialGain', name: 'currencyGain', subtype: 'foundationMaterial'},
        {mult: 'villageIndustrialMaterialGain', name: 'currencyGain', subtype: 'industrialMaterial'},
        {mult: 'villageLuxuryMaterialGain', name: 'currencyGain', subtype: 'luxuryMaterial'},
        {mult: 'villageModernMaterialGain', name: 'currencyGain', subtype: 'modernMaterial'},
        {mult: 'villageFoundationMaterialCap', name: 'currencyCap', subtype: 'foundationMaterial'},
        {mult: 'villageIndustrialMaterialCap', name: 'currencyCap', subtype: 'industrialMaterial'},
        {mult: 'villageLuxuryMaterialCap', name: 'currencyCap', subtype: 'luxuryMaterial'},
        {mult: 'villageModernMaterialCap', name: 'currencyCap', subtype: 'modernMaterial'},
        {mult: 'villageFoodGain', name: 'currencyGain', subtype: 'food'},
        {mult: 'villageMentalGain', name: 'currencyGain', subtype: 'mental', blacklist: ['village_faith']},
    ];
const VI_UNLOCKDATA = [
        'villageFeature',
        'villageCoinUpgrades',
        'villagePrestige',
        ...buildArray(7).map(elem => 'villageBuildings' + (elem + 1)),
        ...[
            'Scythe', 'Hatchet', 'Pickaxe', 'WateringCan', 'Investment',
            'Basics', 'Processing', 'Pump', 'Sand', 'Book',
            'Axe', 'Bomb', 'Toll', 'FishingRod', 'HolyBook',
            'Breakthrough', 'ModifiedPlants', 'Dopamine', 'Adrenaline',
            'Sprinkler', 'Greed',
            'Ambition', 'Understanding', 'Curiosity', 'Worship',
            'Bartering', 'Sparks',
        ].map(elem => 'villageUpgrade' + elem),
        ...buildArray(5).map(elem => 'villageOffering' + (elem + 1)),
        'villageLoot',
        'villageCraftingSubfeature',
        'villageSpecialIngredient'
    ];
const VI_STATDATA = {
        maxBuilding: {showInStatistics: true},
        maxHousing: {},
        timeSpent: {display: 'time'},
        relicActivesUsed: {},
        bestPrestige0: {showInStatistics: true},
        bestPrestige1: {showInStatistics: true},
        prestigeCount: {showInStatistics: true},
        minHappiness: {},
        highestPower: {showInStatistics: true},
    };
const VI_CURDATA = {
        coin: {overcapMult: 0.5, color: 'amber', icon: 'mdi-gem-stone', gainMult: {display: 'perSecond'}, showGainMult: true, capMult: {baseValue: 500}, gainTimerFunction() {
            const taxpayers = VSTORE.getters['mult/get']('villageTaxRate') * VSTORE.getters['village/employed'];
            if (taxpayers <= 0) {
                return 0;
            }
            return VSTORE.getters['mult/get']('currencyVillageCoinGain', VSTORE.getters['currency/list']('village', 'regular', 'food').map(currencyName => {
                const food = currencyName.split('_')[1];
                const nextAmount = VSTORE.getters['currency/value']('village_' + food) + VSTORE.getters['mult/get'](VSTORE.getters['currency/gainMultName']('village', food));
                return Math.min(taxpayers, nextAmount) * VILLAGE_COINS_PER_FOOD;
            }).reduce((a, b) => a + b, 0));
        }, timerIsEstimate: true},
        copperCoin: {overcapMult: 0.5, color: 'orange', icon: 'mdi-coin', gainMult: {}, capMult: {baseValue: 4000}},

        // Basic material
        plantFiber: {subtype: 'foundationMaterial', overcapMult: 0.4, color: 'green', icon: 'mdi-leaf', gainMult: {display: 'perSecond'}, showGainMult: true, showGainTimer: true, showSubtype: true, capMult: {baseValue: 2000}},
        wood: {subtype: 'foundationMaterial', overcapMult: 0.4, color: 'wooden', icon: 'mdi-tree', gainMult: {display: 'perSecond'}, showGainMult: true, showGainTimer: true, showSubtype: true, capMult: {baseValue: 2000}},
        stone: {subtype: 'foundationMaterial', overcapMult: 0.4, color: 'grey', icon: 'mdi-pebble', gainMult: {display: 'perSecond'}, showGainMult: true, showGainTimer: true, showSubtype: true, capMult: {baseValue: 2000}},
        metal: {subtype: 'industrialMaterial', overcapMult: 0.4, color: 'lighter-grey', icon: 'mdi-sword-cross', gainMult: {display: 'perSecond'}, showGainMult: true, showGainTimer: true, showSubtype: true, capMult: {baseValue: 1000}},
        water: {subtype: 'industrialMaterial', overcapMult: 0.4, color: 'blue', icon: 'mdi-water', gainMult: {display: 'perSecond'}, showGainMult: true, showGainTimer: true, showSubtype: true, capMult: {baseValue: 1000}},
        glass: {subtype: 'industrialMaterial', overcapMult: 0.4, color: 'cyan', icon: 'mdi-wine-glass', gainMult: {display: 'perSecond'}, showGainMult: true, showGainTimer: true, showSubtype: true, capMult: {baseValue: 1000}},
        hardwood: {subtype: 'luxuryMaterial', overcapMult: 0.4, color: 'cherry', icon: 'mdi-tree-outline', gainMult: {display: 'perSecond'}, showGainMult: true, showGainTimer: true, showSubtype: true, capMult: {baseValue: 1000}},
        gem: {subtype: 'luxuryMaterial', overcapMult: 0.4, color: 'pink', icon: 'mdi-diamond', gainMult: {display: 'perSecond'}, showGainMult: true, showGainTimer: true, showSubtype: true, capMult: {baseValue: 1000}},
        marble: {subtype: 'luxuryMaterial', overcapMult: 0.4, color: 'pale-blue', icon: 'mdi-circle-double', gainMult: {display: 'perSecond'}, showGainMult: true, showGainTimer: true, showSubtype: true, capMult: {baseValue: 200}},
        oil: {subtype: 'modernMaterial', overcapMult: 0.4, color: 'pale-green', icon: 'mdi-fire', gainMult: {display: 'perSecond'}, showGainMult: true, showGainTimer: true, showSubtype: true, capMult: {baseValue: 800}},

        // FOOD
        grain: {subtype: 'food', color: 'yellow', icon: 'mdi-barley', gainMult: {display: 'perSecond'}, showGainMult: true},
        fruit: {subtype: 'food', color: 'red', icon: 'mdi-food-apple', gainMult: {display: 'perSecond'}, showGainMult: true},
        fish: {subtype: 'food', color: 'blue-grey', icon: 'mdi-fish', gainMult: {display: 'perSecond'}, showGainMult: true},
        vegetable: {subtype: 'food', color: 'orange', icon: 'mdi-carrot', gainMult: {display: 'perSecond'}, showGainMult: true},
        meat: {subtype: 'food', color: 'brown', icon: 'mdi-food-steak', gainMult: {display: 'perSecond'}, showGainMult: true},

        // Mental resources
        knowledge: {subtype: 'mental', overcapScaling: 0.4, color: 'lime', icon: 'mdi-brain', gainMult: {display: 'perSecond'}, showGainMult: true, showGainTimer: true, capMult: {baseValue: 100}},
        faith: {subtype: 'mental', overcapMult: 0.9, overcapScaling: 0.9, color: 'amber', icon: 'mdi-hands-pray', gainMult: {display: 'perSecond'}, showGainMult: true, showGainTimer: true, capMult: {baseValue: 200}},
        science: {subtype: 'mental', overcapScaling: 0.4, color: 'light-blue', icon: 'mdi-flask', gainMult: {display: 'perSecond'}, showGainMult: true, showGainTimer: true, capMult: {baseValue: 40}},
        joy: {subtype: 'mental', overcapScaling: 0.4, color: 'pink-purple', icon: 'mdi-calendar-heart', showHint: true, gainMult: {display: 'perSecond'}, capMult: {baseValue: 250}, showGainMult: true, gainTimerFunction() {
            return VSTORE.getters['mult/get']('currencyVillageJoyGain', VSTORE.getters['village/joyGainBase']);
        }},

        // Loot resources
        loot0: {subtype: 'loot', color: 'light-grey', icon: 'mdi-trophy-variant', display: 'int'},
        loot1: {subtype: 'loot', color: 'green', icon: 'mdi-trophy-variant', display: 'int'},
        loot2: {subtype: 'loot', color: 'indigo', icon: 'mdi-trophy-variant', display: 'int'},
        loot3: {subtype: 'loot', color: 'purple', icon: 'mdi-trophy-variant', display: 'int'},
        loot4: {subtype: 'loot', color: 'amber', icon: 'mdi-trophy-variant', display: 'int'},
        loot5: {subtype: 'loot', color: 'red', icon: 'mdi-trophy-variant', display: 'int'},

        // Special crafting ingredients
        acidVial: {subtype: 'specialIngredient', color: 'lime', icon: 'mdi-test-tube', display: 'int'},
        snowflake: {subtype: 'specialIngredient', color: 'cyan', icon: 'mdi-snowflake-variant', display: 'int'},
        chiliBundle: {subtype: 'specialIngredient', color: 'red-orange', icon: 'mdi-chili-hot', display: 'int'},
        gears: {subtype: 'specialIngredient', color: 'blue-grey', icon: 'mdi-cogs', display: 'int'},

        // Prestige currency
        blessing: {type: 'prestige', alwaysVisible: true, color: 'yellow', icon: 'mdi-flare'},
        shares: {type: 'prestige', alwaysVisible: true, color: 'beige', icon: 'mdi-certificate', gainMult: {}},
        offering: {type: 'prestige', color: 'orange-red', icon: 'mdi-candle', display: 'int', gainMult: {display: 'perHour'}, showGainMult: true, gainTimerFunction() {
            return VSTORE.getters['village/offeringPerSecond'] * SECONDS_PER_HOUR;
        }}
    };

// building -> queue 型升级
let VI_UPGBUILD = {};
for (const [k, e] of Object.entries(VI_B)) { VI_UPGBUILD[k] = Object.assign({}, e, { mode: "queue", type: "building" }); }

const VI_GOOBOO = {
  building: VI_B,
  job: VI_JOB,
  offering: VI_OFFERING,
  policy: VI_POLICY,
  craftingRecipe: VI_CRAFT,
  upgrade: VI_UPG1,
  upgrade2: VI_UPG2,
  upgradePrestige: VI_UPGP,
  upgradePremium: VI_UPGM,
  upgradeBuilding: VI_UPGBUILD,
  mult: VI_MULTDATA,
  multGroup: VI_MULTGROUP,
  unlock: VI_UNLOCKDATA,
  stat: VI_STATDATA,
  currency: VI_CURDATA,
  init: { job: VI_JOB, offering: VI_OFFERING, policy: VI_POLICY, crafting: VI_CRAFT }
};

// 供 vi_core 使用
if (typeof module !== "undefined") module.exports = { VI_GOOBOO, VI_UPGBUILD };