/**
 * VI_TEXT —— 宗门（village）模块术语表   [设定映射：gooboo · village → 修仙宗门]
 * ============================================================
 * 职责：只提供显示文案，不含任何逻辑与数值。
 * 键口径：CURRENCY  键 = 运行时货币键（含 village_ 前缀）
 *        JOB       键 = gooboo job 原键
 *        BUILDING  键 = gooboo building 原键
 *        OFFERING  键 = gooboo offering 原键
 *        POLICY    键 = gooboo policy 原键
 *        UPGRADE   键 = gooboo 升级原键（去掉 village_ 前缀）
 * 未命中回落原键名，缺项不会报错。
 * ============================================================ */
const VI_TEXT = {
  /* ---------------- 模块本体 ---------------- */
  MODULE: {
    name: '宗门',
    label: '道统 · 宗门',
    desc: '辟立山门、安置弟子，营山建屋、攻耕战伐，广布香火、修习经卷，率众修行直至渡劫飞升。'
  },

  /* ---------------- 通用词条 ---------------- */
  TERMS: {
    worker: '弟子',
    unemployed: '闲置',
    employed: '在值',
    job: '职司',
    building: '建筑',
    offering: '香火',
    policy: '戒律',
    pray: '飞升',
    coin: '灵石',
    happiness: '宗门凝聚力',
    power: '道行',
    faith: '虔诚',
    joy: '欢愉',
    loot: '寻宝',
    queue: '建造队列',
    crafting: '工坊'
  },

  /* ---------------- 货币（键含 village_ 前缀） ---------------- */
  CURRENCY: {
    village_coin: '灵石',
    village_copperCoin: '铜符',

    village_plantFiber: '灵草',
    village_wood: '灵木',
    village_stone: '山石',
    village_metal: '精铁',
    village_water: '灵泉',
    village_glass: '琉璃',
    village_hardwood: '紫檀',
    village_gem: '灵石矿',
    village_marble: '云纹石',
    village_oil: '异火',

    village_grain: '灵粟',
    village_fruit: '灵果',
    village_fish: '灵鱼',
    village_vegetable: '灵蔬',
    village_meat: '兽肉',

    village_knowledge: '智识',
    village_faith: '虔诚',
    village_science: '仙研',
    village_joy: '欢愉',

    village_loot0: '宝匣·一',
    village_loot1: '宝匣·二',
    village_loot2: '宝匣·三',
    village_loot3: '宝匣·四',
    village_loot4: '宝匣·五',
    village_loot5: '宝匣·六',

    village_acidVial: '腐灵酸瓶',
    village_snowflake: '玄冰晶',
    village_chiliBundle: '火椒束',
    village_gears: '机括',

    village_blessing: '福泽',
    village_shares: '道契',
    village_offering: '香火'
  },

  /* ---------------- 属性（mult 名对应的中文） ---------------- */
  MULT: {
    villageWorker: '弟子数',
    villageArtisan: '工匠数',
    villageCounter: '商贾数',
    villageHappiness: '宗门凝聚力',
    villagePollution: '浊气',
    villagePollutionTolerance: '浊气度',
    villageTaxRate: '赋税',
    villagePower: '道行',
    villageLootGain: '寻宝',
    villageLootQuality: '宝匣品质',
    villageHousingCap: '弟子居所上限',
    villageWorkstationCap: '职司上限',
    villageMaterialGain: '灵材产出',
    villageMaterialCap: '灵材上限',
    villageFoundationMaterialCap: '基础灵材上限',
    villageLuxuryMaterialCap: '珍材上限',
    villageIngredientCount: '灵材槽位',
    villageIngredientBoxAmount: '灵材箱量',
    villageOfferingPower: '香火威',
    villageSpecialIngredient: '秘制方'
  },

  /* ---------------- 职业（job） ---------------- */
  JOB: {
    collector: '采集者',
    farmer: '灵农',
    harvester: '收获者',
    miner: '矿工',
    wellWorker: '汲泉者',
    librarian: '藏经者',
    glassblower: '琉璃匠',
    entertainer: '乐师',
    lumberjack: '樵夫',
    blastMiner: '爆破者',
    fisherman: '渔夫',
    scientist: '仙研者',
    gardener: '园丁',
    oilWorker: '驭火者',
    sculptor: '塑像师',
    explorer: '寻宝者'
  },

  /* ---------------- 建筑（building） ---------------- */
  BUILDING: {
    // Tier 0 —— 开山立派
    campfire: '灵火坛',

    // Tier 1 —— 议事堂解锁
    hut: '茅屋',
    farm: '灵田',
    plantation: '灵植场',
    mine: '灵矿洞',
    communityCenter: '议事堂',

    // Tier 2 —— 宗祠解锁
    smallHouse: '小修舍',
    crane: '起山架',
    treasury: '灵府',
    storage: '灵仓',
    forge: '炼气炉',
    safe: '玄库',
    well: '灵泉井',
    garden: '药草园',
    townHall: '宗祠',

    // Tier 3 —— 执事堂解锁
    house: '弟子居',
    shed: '灵薪室',
    tunnel: '穿山灵道',
    sawmill: '灵木坊',
    library: '丹经阁',
    aquarium: '灵泽园',
    glassBlowery: '琉璃仙窑',
    knowledgeTower: '问道塔',
    miniatureSmith: '精铸坊',
    church: '仙真观',
    school: '开蒙堂',
    localGovernment: '执事堂',

    // Tier 4 —— 山门大印堂解锁
    apartment: '大修舍',
    temple: '仙灵庙',
    obelisk: '镇魔碑',
    offeringPedestal: '香火台',
    theater: '乐仙台',
    lumberjackHut: '樵舍',
    deepMine: '幽冥矿',
    bigStorage: '大灵仓',
    luxuryHouse: '仙人居',
    lake: '洗灵池',
    gemSawBlade: '灵石琢台',
    miniatureGlassblowery: '精璃坊',
    lostPages: '残卷阁',
    playground: '演武场',
    government: '山门大印堂',

    // Tier 5 —— 聚灵阵基解锁
    modernHouse: '上真居',
    fountain: '涌泉台',
    laboratory: '炼丹房',
    court: '执法堂',
    greenhouse: '灵植棚',
    fullBasket: '丰收窖',
    storageHall: '灵材厅',
    bioLab: '禁丹阁',
    taxOffice: '供奉阁',
    festival: '祈福台',
    cemetery: '葬剑谷',
    mosque: '礼天阁',
    waterTower: '灵泉塔',
    outdoorPump: '引灵泉',
    bankVault: '聚宝阁',
    steamEngine: '聚灵阵基',

    // Tier 6 —— 护灵盟解锁
    mansion: '仙王居',
    oilRig: '异火禁地',
    generator: '天雷塔',
    lighthouse: '归仙台',
    lobby: '迎宾阁',
    oilStorage: '异火库',
    artGallery: '藏真阁',
    excavator: '开山巨灵阵',
    oilTruck: '异火灵辇',
    oldLibrary: '藏经秘库',
    immigrationOffice: '招贤馆',
    marbleStatue: '镇山仙像',
    darkCult: '外道殿',
    slaughterhouse: '炼血堂',
    ecoCouncil: '护灵盟',

    // Tier 7 —— 终极
    treehouse: '听风观星阁',
    rainforest: '灵雨林',
    luxuryStorage: '仙珍阁',
    pyramid: '降神台',
    trophyCase: '仙珍展架',
    antiquarian: '辨伪阁',
    windTurbine: '呼风唤雨台',
    radar: '紫微观星台',
    waterTurbine: '唤龙坛',
    solarPanel: '聚灵阵'
  },

  /* ---------------- 供奉（offering） ---------------- */
  OFFERING: {
    plantFiber: '灵草供',
    wood: '灵木供',
    stone: '山石供',
    coin: '灵石供',
    metal: '精铁供',
    water: '灵泉供',
    glass: '琉璃供',
    hardwood: '紫檀供',
    gem: '灵石矿供',
    knowledge: '智识供',
    science: '仙研供',
    joy: '欢愉供',
    oil: '异火供',
    marble: '云纹石供'
  },

  /* ---------------- 政策（policy） ---------------- */
  POLICY: {
    taxes: '征敛',
    immigration: '招徕',
    religion: '信仰',
    scanning: '观星'
  },

  /* ---------------- 道法升级（升级键去掉 village_ 前缀） ---------------- */
  UPGRADE: {
    // 背包与收纳
    wallet: '灵石收纳',
    resourceBag: '灵材锦囊',
    metalBag: '精铁宝袋',

    // 常规生产道法
    scythe: '灵镰',
    hatchet: '灵斧',
    pickaxe: '开山镐',
    wateringCan: '灵泉壶',
    investment: '福地经营',
    basics: '道基',
    processing: '炼化之道',
    pump: '引泉法',
    sand: '淬沙术',
    book: '经卷',
    axe: '重斧',
    bomb: '雷火符',
    toll: '过路术',
    fishingRod: '垂钓竿',
    holyBook: '天书',

    // 仙研道法
    breakthrough: '破境',
    modifiedPlants: '变种灵植',
    dopamine: '欢愉心法',
    adrenaline: '激灵丹',
    sprinkler: '灵雨阵',
    greed: '贪天术',

    // 寻宝道法
    ambition: '鸿鹄志',
    understanding: '通明诀',
    curiosity: '求索心',
    worship: '敬天法',
    bartering: '通易术',
    sparks: '灵感',

    // 工坊侧（subfeature 1）
    cashRegister: '灵算盘',
    decoration: '装饰术',
    plantFiberBin: '灵草筐',
    woodBin: '灵木箱',
    stoneBin: '山石筐',
    metalBin: '精铁筐',
    waterBin: '灵泉桶',
    glassBin: '琉璃匣',
    hardwoodBin: '紫檀匣',
    gemBin: '灵石匣',
    oilBin: '异火坛',
    marbleBin: '云纹石匣',

    // 飞升（prestige）
    arch: '山门拱门',
    holyGrass: '仙草',
    holyTree: '神木',
    holyRock: '仙石',
    holyMetal: '仙铁',
    churchTax: '香火税',
    holyWater: '圣水',
    holyGlass: '灵璃',
    holyCrane: '仙鹤',
    monk: '僧侣',
    holyPiggyBank: '聚宝盆',
    deepWorship: '深祷',
    cityPlanning: '城规',
    managers: '执事',
    warehouse: '长仓',
    sandstone: '镇魔碑升级',
    holyForest: '神林',
    holyGem: '神玉',
    deeperWorship: '彻祷',
    holyLab: '仙丹房',
    charity: '济世',
    holyOil: '灵异火',
    holyMarble: '仙纹石',
    calmingSpeech: '安民令',
    holyLoot: '宝运',
    holyChisel: '神工',
    hireArtisans: '招工匠',
    hireWorkers: '招弟子',
    hireAccountants: '招账房',
    recipeBook: '食谱',
    adCampaign: '扬名术',
    hireExplorers: '招探险家',
    hireGardeners: '招园丁',
    hireMiners: '招矿工',
    hireBartenders: '招侍者',
    hireExperts: '招方士',

    // 晶升（premium）
    overtime: '灵能加班',
    goldenThrone: '金銮座',
    fasterBuilding: '速建术',
    moreFaith: '增虔术',
    morePlantFiber: '灵草盈',
    moreWood: '灵木盈',
    moreStone: '山石盈',
    moreMetal: '精铁盈',
    moreWater: '灵泉盈',
    moreGlass: '琉璃盈',
    moreHardwood: '紫檀盈',
    moreGem: '灵石盈',
    moreKnowledge: '智识盈',
    moreScience: '仙研盈',
    moreOil: '异火盈',
    moreMarble: '云纹石盈',

    // 常见炮升/飞升/高级（兼容旧译）
    precise_Tool: '精工法器',
    investment_Terms: '经商术',
    bank: '商会',
    steam: '机括',
    science: '仙研',
    museum: '藏真',
    mansion: '豪邸',
    honey: '蜜源',
    cotton: '云棉',
    oil: '异火',
    marble: '云纹石',
    placeOfWorship: '祭天坛',
    pollution: '浊气'
  },

  /* ---------------- 制作产物（craft） ---------------- */
  CRAFT: {
    rope: '灵藤',
    woodenPlanks: '灵木板',
    brick: '青砖',
    screws: '机括钉',
    waterBottle: '灵泉瓶',
    cocktailGlass: '玉露杯',
    boomerang: '回旋镖',
    polishedGem: '打磨灵石',
    oilLamp: '玄火灯',
    shower: '灵泉浴',
    pouch: '灵囊',
    cupboard: '橱柜',
    weight: '砝码',
    scissors: '法器剪',
    herbTea: '灵草茶',
    glasses: '琉璃镜',
    arrows: '灵矢',
    bowl: '玉碗',
    chain: '符链',
    spear: '灵矛',
    goldenRing: '金环',
    poisonedArrows: '淬毒灵矢',
    frostSpear: '寒霜矛',
    spicySoup: '火辣汤',
    stopwatch: '时刻沙漏',
    smallChest: '小灵箱',
    bush: '灵灌丛',
    handSaw: '玄锯',
    garage: '机关库',
    diamondRing: '宝钻戒'
  }
};
