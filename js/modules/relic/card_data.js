/* ============================================================
 * card_data.js ——「灵宝碎片」数据定义
 * 100% 对齐 gooboo src/js/modules/{feature}/card.js 结构
 *
 * 修仙化：
 *   购买货币   gem_emerald → dao_qingyuan（青元）
 *   闪光货币   card_shinyDust → lingbao_jinghua（灵宝精华）
 *   所有 collection/pack/card/feature/reward 中文名 / 修仙图标
 *   reward.name 必须是 treasure_core XQ_EFFECTS 已注册的 effect key
 *   （跨模块映射由 card_core.cardEffectKeyToModuleKey 负责）
 * ============================================================ */

/* 颜色名 → hex（与 gooboo vuetify 色名对应，供 CardItem 取色） */
const CARD_COLORS = {
  red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#facc15',
  purple: '#a855f7', cyan: '#06b6d4', orange: '#f97316', pink: '#ec4899',
  brown: '#a0522d', grey: '#6b7280', lightBlue: '#38bdf8', darkBlue: '#1e40af',
  amber: '#f59e0b', lime: '#84cc16', emerald: '#10b981',
};
function cardColor(name) { return CARD_COLORS[name] || '#888'; }

/* ============ 各模块灵宝碎片 ============ */
/* reward.name 必须与 treasure_core.js 的 XQ_EFFECTS key 保持一致 */
const CARD_FEATURES = {

  /* ===== 灵脉 ===== */
  mining: {
    feature: {
      prefix: 'LM',
      reward: [{ name: 'miningDamage', type: 'mult', value: lvl => lvl * 0.05 + 1 }],
      shinyReward: [{ name: 'miningOreGain', type: 'mult', value: lvl => lvl * 0.03 + 1 }],
      powerReward: [
        { name: 'miningDamage', type: 'mult', value: lvl => Math.pow(1.08, lvl) },
      ],
      unlock: null,
    },
    collection: {
      minersAndEquipment: {
        name: '矿工与法器',
        reward: [{ name: 'miningDamage', type: 'mult', value: 1.35 }],
      },
      scrapLogistics: {
        name: '碎屑转运',
        reward: [
          { name: 'currencyMiningScrapGain', type: 'mult', value: 1.5 },
        ],
      },
      caveLocations: {
        name: '矿脉洞天',
        reward: [
          { name: 'miningRareEarthGain', type: 'mult', value: 1.5 },
        ],
      },
      depthsAndTools: {
        name: '深掘利器',
        reward: [
          { name: 'miningSmelteryTime', type: 'mult', value: 1.3 },
        ],
      },
    },
    pack: {
      intoDarkness: {
        name: '入暗·灵脉包', amount: 3, price: 15, content: {
          'LM-0001': 2.75, 'LM-0002': 0.3, 'LM-0003': 0.58, 'LM-0004': 1.1,
          'LM-0005': 1.22, 'LM-0006': 0.9, 'LM-0007': 0.65, 'LM-0008': 1.11,
          'LM-0009': 1.56, 'LM-0010': 0.28, 'LM-0011': 0.73, 'LM-0012': 0.86,
        }},
      drillsAndDepths: {
        name: '深掘·灵脉包', unlock: null, amount: 4, price: 35, content: {
          'LM-0001': 1.8, 'LM-0002': 0.4, 'LM-0003': 0.65, 'LM-0004': 1.1,
          'LM-0005': 1.22, 'LM-0006': 0.9, 'LM-0013': 1.05, 'LM-0014': 1.45,
          'LM-0015': 0.69, 'LM-0016': 0.55, 'LM-0017': 0.52, 'LM-0018': 1.16,
        }},
    },
    card: [
      { id: 1, collection: 'minersAndEquipment', power: 0, color: 'grey', icons: [{ icon: 'mdi-pickaxe', x: 0, y: 0, size: 1.2 }],
        reward: [{ name: 'miningDamage', type: 'mult', value: 1.05 }] },
      { id: 2, collection: 'minersAndEquipment', power: 0, color: 'brown', icons: [{ icon: 'mdi-helmet-crown', x: 0, y: 0 }],
        reward: [{ name: 'miningDamage', type: 'mult', value: 1.08 }] },
      { id: 3, collection: 'minersAndEquipment', power: 1, color: 'orange', icons: [{ icon: 'mdi-drill', x: 0, y: 0 }],
        reward: [{ name: 'miningOreGain', type: 'mult', value: 1.25 }] },
      { id: 4, collection: 'minersAndEquipment', power: 1, color: 'yellow', icons: [{ icon: 'mdi-shovel', x: 0, y: 0 }],
        reward: [{ name: 'miningDamage', type: 'mult', value: 1.12 }] },
      { id: 5, collection: 'minersAndEquipment', power: 2, color: 'cyan', icons: [{ icon: 'mdi-wrench', x: 0, y: 0 }],
        reward: [{ name: 'miningDamage', type: 'mult', value: 1.18 }] },
      { id: 6, collection: 'scrapLogistics', power: 1, color: 'amber', icons: [{ icon: 'mdi-cart', x: 0, y: 0 }],
        reward: [{ name: 'currencyMiningScrapGain', type: 'mult', value: 1.25 }] },
      { id: 7, collection: 'scrapLogistics', power: 2, color: 'green', icons: [{ icon: 'mdi-conveyor-belt', x: 0, y: 0 }],
        reward: [{ name: 'currencyMiningScrapGain', type: 'mult', value: 1.4 }] },
      { id: 8, collection: 'scrapLogistics', power: 3, color: 'lightBlue', icons: [{ icon: 'mdi-truck-fast', x: 0, y: 0 }],
        reward: [{ name: 'miningOreGain', type: 'mult', value: 1.2 }] },
      { id: 9, collection: 'scrapLogistics', power: 3, color: 'darkBlue', icons: [{ icon: 'mdi-warehouse', x: 0, y: 0 }],
        reward: [{ name: 'currencyMiningScrapGain', type: 'mult', value: 1.6 }] },
      { id: 10, collection: 'scrapLogistics', power: 5, color: 'purple', icons: [{ icon: 'mdi-robot-industrial', x: 0, y: 0 }],
        reward: [{ name: 'miningRareEarthGain', type: 'mult', value: 1.3 }] },
      { id: 11, collection: 'caveLocations', power: 2, color: 'brown', icons: [{ icon: 'mdi-tent', x: 0, y: 0 }],
        reward: [{ name: 'miningOreGain', type: 'mult', value: 1.15 }] },
      { id: 12, collection: 'caveLocations', power: 3, color: 'grey', icons: [{ icon: 'mdi-home-group', x: 0, y: 0 }],
        reward: [{ name: 'miningDamage', type: 'mult', value: 1.1 }] },
      { id: 13, collection: 'caveLocations', power: 4, color: 'cyan', icons: [{ icon: 'mdi-campfire', x: 0, y: 0 }],
        reward: [{ name: 'miningDamage', type: 'mult', value: 1.15 }] },
      { id: 14, collection: 'caveLocations', power: 4, color: 'orange', icons: [{ icon: 'mdi-map', x: 0, y: 0 }],
        reward: [{ name: 'miningRareEarthGain', type: 'mult', value: 1.4 }] },
      { id: 15, collection: 'caveLocations', power: 5, color: 'red', icons: [{ icon: 'mdi-compass-outline', x: 0, y: 0 }],
        reward: [{ name: 'miningDamage', type: 'mult', value: 1.25 }] },
      { id: 16, collection: 'depthsAndTools', power: 3, color: 'darkBlue', icons: [{ icon: 'mdi-furnace', x: 0, y: 0 }],
        reward: [{ name: 'miningSmelteryTime', type: 'mult', value: 1.15 }] },
      { id: 17, collection: 'depthsAndTools', power: 4, color: 'purple', icons: [{ icon: 'mdi-thermometer', x: 0, y: 0 }],
        reward: [{ name: 'miningSmelteryTime', type: 'mult', value: 1.25 }] },
      { id: 18, collection: 'depthsAndTools', power: 5, color: 'red', icons: [{ icon: 'mdi-alien', x: 0, y: 0 }],
        reward: [{ name: 'miningDamage', type: 'mult', value: 1.3 }] },
    ],
  },

  /* ===== 宗门 ===== */
  village: {
    feature: {
      prefix: 'ZM',
      reward: [{ name: 'queueSpeedVillageBuilding', type: 'mult', value: lvl => lvl * 0.04 + 1 }],
      shinyReward: [{ name: 'currencyVillageCoinGain', type: 'mult', value: lvl => lvl * 0.04 + 1 }],
      powerReward: [
        { name: 'queueSpeedVillageBuilding', type: 'mult', value: lvl => Math.pow(1.06, lvl) },
      ],
      unlock: null,
    },
    collection: {
      disciplesAndTools: {
        name: '门徒与法器',
        reward: [{ name: 'queueSpeedVillageBuilding', type: 'mult', value: 1.25 }],
      },
      constructions: {
        name: '宗门殿宇',
        reward: [{ name: 'queueSpeedVillageBuilding', type: 'mult', value: 1.5 }],
      },
      economy: {
        name: '宗门经济',
        reward: [{ name: 'currencyVillageCoinGain', type: 'mult', value: 1.5 }],
      },
    },
    pack: {
      villageLife: {
        name: '宗门日常包', amount: 3, price: 20, content: {
          'ZM-0001': 2.5, 'ZM-0002': 0.4, 'ZM-0003': 0.8, 'ZM-0004': 1.2,
          'ZM-0005': 1.0, 'ZM-0006': 0.7, 'ZM-0007': 0.9, 'ZM-0008': 1.1,
          'ZM-0009': 1.3, 'ZM-0010': 0.3, 'ZM-0011': 0.6, 'ZM-0012': 0.8,
          'ZM-0013': 1.1,
        }},
    },
    card: [
      { id: 1, collection: 'disciplesAndTools', power: 0, color: 'brown', icons: [{ icon: 'mdi-account-group', x: 0, y: 0 }],
        reward: [{ name: 'queueSpeedVillageBuilding', type: 'mult', value: 1.05 }] },
      { id: 2, collection: 'disciplesAndTools', power: 0, color: 'grey', icons: [{ icon: 'mdi-hammer', x: 0, y: 0 }],
        reward: [{ name: 'queueSpeedVillageBuilding', type: 'mult', value: 1.08 }] },
      { id: 3, collection: 'disciplesAndTools', power: 1, color: 'amber', icons: [{ icon: 'mdi-saw', x: 0, y: 0 }],
        reward: [{ name: 'villageFoundationMaterialGain', type: 'mult', value: 1.15 }] },
      { id: 4, collection: 'disciplesAndTools', power: 1, color: 'green', icons: [{ icon: 'mdi-axe', x: 0, y: 0 }],
        reward: [{ name: 'queueSpeedVillageBuilding', type: 'mult', value: 1.12 }] },
      { id: 5, collection: 'disciplesAndTools', power: 2, color: 'cyan', icons: [{ icon: 'mdi-toolbox', x: 0, y: 0 }],
        reward: [{ name: 'queueSpeedVillageBuilding', type: 'mult', value: 1.18 }] },
      { id: 6, collection: 'constructions', power: 1, color: 'orange', icons: [{ icon: 'mdi-brick', x: 0, y: 0 }],
        reward: [{ name: 'queueSpeedVillageBuilding', type: 'mult', value: 1.15 }] },
      { id: 7, collection: 'constructions', power: 2, color: 'yellow', icons: [{ icon: 'mdi-crane', x: 0, y: 0 }],
        reward: [{ name: 'villageFoundationMaterialGain', type: 'mult', value: 1.25 }] },
      { id: 8, collection: 'constructions', power: 3, color: 'lightBlue', icons: [{ icon: 'mdi-office-building', x: 0, y: 0 }],
        reward: [{ name: 'queueSpeedVillageBuilding', type: 'mult', value: 1.25 }] },
      { id: 9, collection: 'constructions', power: 3, color: 'darkBlue', icons: [{ icon: 'mdi-castle', x: 0, y: 0 }],
        reward: [{ name: 'queueSpeedVillageBuilding', type: 'mult', value: 1.35 }] },
      { id: 10, collection: 'constructions', power: 5, color: 'purple', icons: [{ icon: 'mdi-temple', x: 0, y: 0 }],
        reward: [{ name: 'villageLuxuryMaterialGain', type: 'mult', value: 1.3 }] },
      { id: 11, collection: 'economy', power: 2, color: 'amber', icons: [{ icon: 'mdi-cash-coin', x: 0, y: 0 }],
        reward: [{ name: 'currencyVillageCoinGain', type: 'mult', value: 1.2 }] },
      { id: 12, collection: 'economy', power: 3, color: 'green', icons: [{ icon: 'mdi-store', x: 0, y: 0 }],
        reward: [{ name: 'currencyVillageCoinGain', type: 'mult', value: 1.35 }] },
      { id: 13, collection: 'economy', power: 4, color: 'cyan', icons: [{ icon: 'mdi-scale-balance', x: 0, y: 0 }],
        reward: [{ name: 'currencyVillageCoinGain', type: 'mult', value: 1.5 }] },
    ],
  },

  /* ===== 降妖 ===== */
  horde: {
    feature: {
      prefix: 'XY',
      reward: [{ name: 'hordeAttack', type: 'mult', value: lvl => lvl * 0.05 + 1 }],
      shinyReward: [{ name: 'currencyHordeBoneGain', type: 'mult', value: lvl => lvl * 0.04 + 1 }],
      powerReward: [
        { name: 'hordeAttack', type: 'mult', value: lvl => Math.pow(1.08, lvl) },
      ],
      unlock: null,
    },
    collection: {
      warriorsAndWeapons: {
        name: '修士与法器',
        reward: [{ name: 'hordeAttack', type: 'mult', value: 1.3 }],
      },
      armorAndDefense: {
        name: '护体之甲',
        reward: [{ name: 'hordeAttack', type: 'mult', value: 1.15 }],
      },
      beastsAndMounts: {
        name: '灵兽坐骑',
        reward: [{ name: 'hordeAttack', type: 'mult', value: 1.25 }],
      },
    },
    pack: {
      battleCry: {
        name: '战吼·降妖包', amount: 3, price: 25, content: {
          'XY-0001': 2.5, 'XY-0002': 0.5, 'XY-0003': 0.8, 'XY-0004': 1.0,
          'XY-0005': 1.1, 'XY-0006': 0.7, 'XY-0007': 0.9, 'XY-0008': 1.2,
          'XY-0009': 1.3, 'XY-0010': 0.4, 'XY-0011': 0.6, 'XY-0012': 0.8,
        }},
    },
    card: [
      { id: 1, collection: 'warriorsAndWeapons', power: 0, color: 'red', icons: [{ icon: 'mdi-sword', x: 0, y: 0 }],
        reward: [{ name: 'hordeAttack', type: 'mult', value: 1.08 }] },
      { id: 2, collection: 'warriorsAndWeapons', power: 0, color: 'grey', icons: [{ icon: 'mdi-shield', x: 0, y: 0 }],
        reward: [{ name: 'hordeAttack', type: 'mult', value: 1.06 }] },
      { id: 3, collection: 'warriorsAndWeapons', power: 1, color: 'orange', icons: [{ icon: 'mdi-axe', x: 0, y: 0 }],
        reward: [{ name: 'hordeAttack', type: 'mult', value: 1.15 }] },
      { id: 4, collection: 'warriorsAndWeapons', power: 1, color: 'yellow', icons: [{ icon: 'mdi-bow-arrow', x: 0, y: 0 }],
        reward: [{ name: 'hordeAttack', type: 'mult', value: 1.12 }] },
      { id: 5, collection: 'warriorsAndWeapons', power: 2, color: 'cyan', icons: [{ icon: 'mdi-dagger', x: 0, y: 0 }],
        reward: [{ name: 'hordeAttack', type: 'mult', value: 1.2 }] },
      { id: 6, collection: 'armorAndDefense', power: 1, color: 'lightBlue', icons: [{ icon: 'mdi-shield-half-full', x: 0, y: 0 }],
        reward: [{ name: 'hordeAttack', type: 'mult', value: 1.1 }] },
      { id: 7, collection: 'armorAndDefense', power: 2, color: 'darkBlue', icons: [{ icon: 'mdi-tshirt-crew', x: 0, y: 0 }],
        reward: [{ name: 'hordeAttack', type: 'mult', value: 1.2 }] },
      { id: 8, collection: 'armorAndDefense', power: 3, color: 'purple', icons: [{ icon: 'mdi-helmet-cross', x: 0, y: 0 }],
        reward: [{ name: 'hordeAttack', type: 'mult', value: 1.25 }] },
      { id: 9, collection: 'armorAndDefense', power: 4, color: 'amber', icons: [{ icon: 'mdi-shield-crown', x: 0, y: 0 }],
        reward: [{ name: 'hordeAttack', type: 'mult', value: 1.35 }] },
      { id: 10, collection: 'beastsAndMounts', power: 2, color: 'brown', icons: [{ icon: 'mdi-horse', x: 0, y: 0 }],
        reward: [{ name: 'hordeAttack', type: 'mult', value: 1.1 }] },
      { id: 11, collection: 'beastsAndMounts', power: 3, color: 'green', icons: [{ icon: 'mdi-paw', x: 0, y: 0 }],
        reward: [{ name: 'currencyHordeBoneGain', type: 'mult', value: 1.3 }] },
      { id: 12, collection: 'beastsAndMounts', power: 4, color: 'red', icons: [{ icon: 'mdi-dragon', x: 0, y: 0 }],
        reward: [{ name: 'hordeAttack', type: 'mult', value: 1.3 }] },
    ],
  },

  /* ===== 灵植 ===== */
  farm: {
    feature: {
      prefix: 'LZ',
      reward: [{ name: 'currencyFarmVegetableGain', type: 'mult', value: lvl => lvl * 0.05 + 1 }],
      shinyReward: [{ name: 'currencyFarmBerryGain', type: 'mult', value: lvl => lvl * 0.04 + 1 }],
      powerReward: [
        { name: 'currencyFarmVegetableGain', type: 'mult', value: lvl => Math.pow(1.06, lvl) },
      ],
      unlock: null,
    },
    collection: {
      seedsAndFertilizer: {
        name: '灵种与灵肥',
        reward: [{ name: 'currencyFarmVegetableGain', type: 'mult', value: 1.3 }],
      },
      toolsAndIrrigation: {
        name: '灵田水利',
        reward: [{ name: 'currencyFarmVegetableGain', type: 'mult', value: 1.5 }],
      },
      harvests: {
        name: '丰收时节',
        reward: [
          { name: 'currencyFarmBerryGain', type: 'mult', value: 1.4 },
          { name: 'currencyFarmGrainGain', type: 'mult', value: 1.4 },
        ],
      },
    },
    pack: {
      bountiful: {
        name: '灵植丰收包', amount: 3, price: 18, content: {
          'LZ-0001': 2.5, 'LZ-0002': 0.5, 'LZ-0003': 0.8, 'LZ-0004': 1.0,
          'LZ-0005': 1.1, 'LZ-0006': 0.7, 'LZ-0007': 0.9, 'LZ-0008': 1.2,
          'LZ-0009': 1.3, 'LZ-0010': 0.4, 'LZ-0011': 0.6,
        }},
    },
    card: [
      { id: 1, collection: 'seedsAndFertilizer', power: 0, color: 'green', icons: [{ icon: 'mdi-seed', x: 0, y: 0 }],
        reward: [{ name: 'currencyFarmVegetableGain', type: 'mult', value: 1.08 }] },
      { id: 2, collection: 'seedsAndFertilizer', power: 0, color: 'brown', icons: [{ icon: 'mdi-shovel', x: 0, y: 0 }],
        reward: [{ name: 'currencyFarmVegetableGain', type: 'mult', value: 1.1 }] },
      { id: 3, collection: 'seedsAndFertilizer', power: 1, color: 'lime', icons: [{ icon: 'mdi-sprout', x: 0, y: 0 }],
        reward: [{ name: 'currencyFarmVegetableGain', type: 'mult', value: 1.15 }] },
      { id: 4, collection: 'seedsAndFertilizer', power: 1, color: 'yellow', icons: [{ icon: 'mdi-sun', x: 0, y: 0 }],
        reward: [{ name: 'currencyFarmBerryGain', type: 'mult', value: 1.12 }] },
      { id: 5, collection: 'seedsAndFertilizer', power: 2, color: 'cyan', icons: [{ icon: 'mdi-water', x: 0, y: 0 }],
        reward: [{ name: 'currencyFarmVegetableGain', type: 'mult', value: 1.2 }] },
      { id: 6, collection: 'toolsAndIrrigation', power: 1, color: 'lightBlue', icons: [{ icon: 'mdi-watering-can', x: 0, y: 0 }],
        reward: [{ name: 'currencyFarmVegetableGain', type: 'mult', value: 1.15 }] },
      { id: 7, collection: 'toolsAndIrrigation', power: 2, color: 'darkBlue', icons: [{ icon: 'mdi-faucet', x: 0, y: 0 }],
        reward: [{ name: 'currencyFarmGrainGain', type: 'mult', value: 1.25 }] },
      { id: 8, collection: 'toolsAndIrrigation', power: 3, color: 'purple', icons: [{ icon: 'mdi-pipe', x: 0, y: 0 }],
        reward: [{ name: 'currencyFarmVegetableGain', type: 'mult', value: 1.2 }] },
      { id: 9, collection: 'harvests', power: 2, color: 'red', icons: [{ icon: 'mdi-cherry', x: 0, y: 0 }],
        reward: [{ name: 'currencyFarmBerryGain', type: 'mult', value: 1.2 }] },
      { id: 10, collection: 'harvests', power: 3, color: 'amber', icons: [{ icon: 'mdi-wheat', x: 0, y: 0 }],
        reward: [{ name: 'currencyFarmGrainGain', type: 'mult', value: 1.25 }] },
      { id: 11, collection: 'harvests', power: 4, color: 'orange', icons: [{ icon: 'mdi-pumpkin', x: 0, y: 0 }],
        reward: [{ name: 'currencyFarmFlowerGain', type: 'mult', value: 1.3 }] },
    ],
  },
};

/* ============ feature / collection / pack 中文名 ============ */
const CARD_NAMES = {
  'LM-0001': '灵锄碎片', 'LM-0002': '矿工宝帽碎片', 'LM-0003': '混元钻碎片', 'LM-0004': '灵锹碎片',
  'LM-0005': '灵扳碎片', 'LM-0006': '矿车碎片', 'LM-0007': '传送带碎片', 'LM-0008': '飞云矿车碎片',
  'LM-0009': '灵库碎片', 'LM-0010': '灵矿机甲碎片', 'LM-0011': '洞天营碎片', 'LM-0012': '修行篷碎片',
  'LM-0013': '灵火碎片', 'LM-0014': '矿脉图碎片', 'LM-0015': '勘灵罗盘碎片', 'LM-0016': '炼器炉碎片',
  'LM-0017': '火灵探针碎片', 'LM-0018': '古妖残骸碎片',
  'ZM-0001': '门徒碎片', 'ZM-0002': '玄铁锤碎片', 'ZM-0003': '天锯碎片', 'ZM-0004': '镇宗斧碎片',
  'ZM-0005': '百宝匣碎片', 'ZM-0006': '玄砖碎片', 'ZM-0007': '云塔吊碎片', 'ZM-0008': '藏经阁碎片',
  'ZM-0009': '镇宗城堡碎片', 'ZM-0010': '天道坛碎片', 'ZM-0011': '金元碎片', 'ZM-0012': '法宝商铺碎片',
  'ZM-0013': '天道秤碎片',
  'XY-0001': '镇妖剑碎片', 'XY-0002': '玄天盾碎片', 'XY-0003': '开天斧碎片', 'XY-0004': '射妖弓碎片',
  'XY-0005': '诛邪匕碎片', 'XY-0006': '护体盾碎片', 'XY-0007': '玄铁甲碎片', 'XY-0008': '降妖盔碎片',
  'XY-0009': '王道盾碎片', 'XY-0010': '踏云驹碎片', 'XY-0011': '灵兽爪碎片', 'XY-0012': '青龙碎片',
  'LZ-0001': '灵种碎片', 'LZ-0002': '灵锄碎片（田）', 'LZ-0003': '嫩芽碎片', 'LZ-0004': '九阳碎片',
  'LZ-0005': '仙露碎片', 'LZ-0006': '灵泉壶碎片', 'LZ-0007': '天泉碎片', 'LZ-0008': '引灵玉碎片',
  'LZ-0009': '仙桃碎片', 'LZ-0010': '灵穗碎片', 'LZ-0011': '金瓜碎片',
};

const CARD_COLLECTION_NAMES = {
  minersAndEquipment: '矿工与法器', scrapLogistics: '碎屑转运', caveLocations: '矿脉洞天',
  depthsAndTools: '深掘利器',
  disciplesAndTools: '门徒与法器', constructions: '宗门殿宇', economy: '宗门经济',
  warriorsAndWeapons: '修士与法器', armorAndDefense: '护体之甲', beastsAndMounts: '灵兽坐骑',
  seedsAndFertilizer: '灵种与灵肥', toolsAndIrrigation: '灵田水利', harvests: '丰收时节',
};

const CARD_PACK_NAMES = {
  intoDarkness: '入暗·灵脉包', drillsAndDepths: '深掘·灵脉包',
  villageLife: '宗门日常包',
  battleCry: '战吼·降妖包',
  bountiful: '灵植丰收包',
};

const CARD_FEATURE_NAMES = {
  mining: '灵脉', village: '宗门', horde: '降妖', farm: '灵植',
};

const CARD_FEATURE_ICONS = {
  mining: 'mdi-pickaxe', village: 'mdi-temple', horde: 'mdi-sword-cross', farm: 'mdi-carrot',
};

if (typeof window !== 'undefined') {
  window.CARD_DATA = {
    CARD_FEATURES, CARD_NAMES, CARD_COLLECTION_NAMES, CARD_PACK_NAMES,
    CARD_FEATURE_NAMES, CARD_FEATURE_ICONS, cardColor,
  };
}
