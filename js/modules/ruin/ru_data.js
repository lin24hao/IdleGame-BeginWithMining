/**
 * RU_DATA —— 秘境（ruin）模块「数据资产总表」
 * ============================================================
 * 依据：《搜打撤-秘境玩法策划案.md》第 3 / 4 / 6 / 7 / 8 / 11 章。
 *
 * 设计口径（务必遵守，勿沿用旧版）：
 *   - 只有「派遣 → 等待归来」两阶段，无局内概念、无过程呈现。
 *   - 取消搜索容器 / 格子制 / 物品尺寸；背包与安全箱均为列表制。
 *   - 物品重量为**独立字段**（weight），不再由尺寸换算。
 *   - 战斗 = 战力对比 + 小幅浮动，遭遇不可规避。
 *   - 事件 5 类：遭遇 / 奇遇 / 探索 / 采集 / 专属；无陷阱、无无事。
 *   - 每个弟子的专属材料只从该弟子专属事件产出。
 *
 * 【本表全部数值均为「占位」】，集中写在 PLACEHOLDER 区，便于一键替换。
 * 结构字段按策划案原样预留，替换数值时不删字段。
 * ============================================================ */
const RU_DATA = {

  /* ==========================================================
   * 0. 占位数值区  ← 策划案第 11 章「待配数值清单」9 项
   *    替换数值时只改本区块，其余表结构不动。
   * ========================================================== */
  PLACEHOLDER: {
    /* 占位 #1：时间引擎基础（策划案已定稿，非占位） */
    BASE_EVENTS_PER_HOUR: 10,      // 基准 10 事件/小时
    EVENT_INTERVAL_FALLBACK: 360,  // 事件数异常时的事件间隔（秒）
    DEATH_RETURN_SEC: 600,         // 归途固定 10 分钟（策划案已定稿，非占位）
    COMBAT_FLOAT: 0.15,            // 占位：战力判定浮动幅度 ±15%
    HP_LOSS_WIN: [4, 12],          // 占位：战斗胜利的气血损耗区间（百分比）
    HP_LOSS_LOSE: [70, 100],       // 占位：战斗失败的气血损耗区间（百分比）
    WARD_HP_RESTORE: 35,           // 占位：免死触发后恢复的气血（百分比）

    /* 占位 #2：弟子三人数值 */
    LEVEL_CAP: 50,                 // 占位：弟子上限 1–50 级
    DISCIPLE_POWER_PER_LEVEL: 0.08,   // 占位：每级战力 +8%（线性）
    DISCIPLE_WEIGHT_PER_LEVEL: 0.02,  // 占位：每级负重 +2%（线性）
    UPGRADE_STONE_BASE: 300,          // 占位：升级基础灵石
    UPGRADE_STONE_INC: 1.12,          // 占位：升级灵石递增
    UPGRADE_MAT_EVERY: 5,             // 占位：每 5 级需 1 个专属材料
    REVIVE_STONE_BASE: 1200,          // 占位：重塑肉身基础灵石（生生造化丹）
    REVIVE_STONE_INC: 0.5,            // 占位：每次死亡后重塑成本 +50%

    /* 占位 #3：事件权重（5 类基础权重；专属按 specialWeight 混入） */
    EVENT_WEIGHT: { encounter: 34, adventure: 18, explore: 20, gather: 28 },
    SPECIAL_SHARE: 0.12,              // 占位：专属事件占比 12%（策划案建议 10–15%）

    /* 占位 #4：物品品质权重（掉落基准池） */
    QUALITY_BASE_WEIGHT: { white: 50, green: 28, blue: 14, purple: 6, orange: 1.7, red: 0.3 },
    QUALITY_RARE_MULT: { white: 0.35, green: 0.8, blue: 1.8, purple: 4.0, orange: 9.0, red: 20.0 },

    /* 占位 #5：神器碎片曲线 */
    FRAG_BASE: { white: 5, green: 10, blue: 20, purple: 40, orange: 80, red: 150 },
    FRAG_INC: 1.35,                   // 每级碎片需求 ×1.35
    FRAG_TO_STONE: { white: 20, green: 60, blue: 200, purple: 700, orange: 2400, red: 9000 },
    ARTIFACT_BASE_SLOTS: 2,           // 占位：神器栏初始 2 个
    SAFEBOX_BASE_SLOTS: 2,            // 策划案已定：安全箱初始 2 个物品位
    DISPATCH_BASE_LIMIT: 3,           // 占位：同时在派上限 = 弟子数

    /* 占位 #6：时长档位（分钟） */
    DURATION_OPTIONS: [15, 30, 60, 120, 240],

    /* 占位 #7：物品重量见 ITEMS（逐件独立字段） */

    /* 占位 #8：入场费见 RUINS.cost（沿用旧数值，占位待调） */

    /* 占位 #9：重塑成本见 REVIVE_STONE_*（占位待调） */
    SELL_PRICE_MULT: 1.0              // 占位：出售变现系数（1.0 = 按 value 全额）
  },

  /* ---------------- 境界名（沿用旧 CONFIG.REALMS，用于敌人 / 秘境推荐境界） ---------------- */
  REALM_NAMES: ['炼气', '筑基', '金丹', '元婴', '化神', '炼虚', '合体', '大乘', '渡劫'],

  /* ---------------- 品质（6 档：白绿蓝紫橙红） ---------------- */
  QUALITY_ORDER: ['white', 'green', 'blue', 'purple', 'orange', 'red'],
  QUALITY: {
    white: { name: '白', css: 'q-white' },
    green: { name: '绿', css: 'q-green' },
    blue: { name: '蓝', css: 'q-blue' },
    purple: { name: '紫', css: 'q-purple' },
    orange: { name: '橙', css: 'q-orange' },
    red: { name: '红', css: 'q-red' }
  },

  /* ==========================================================
   * 1. 弟子（3 名：战力型 / 产出型 / 效率型）
   *    effect 为「每 1 级之外的固定加成」，等级缩放由 PLACEHOLDER 提供。
   * ========================================================== */
  DISCIPLES: {
    /* 战力型：遭遇战胜率 + */
    lingshuang: {
      id: 'lingshuang', name: '凌霜', role: 'power', roleName: '战力型',
      basePower: 20, baseWeight: 45, color: '#9fc7ff',
      effect: { winRate: 0.18, lootQtyMult: 1.0, rareChance: 0, eventRate: 0, maxDurationMult: 0, dangerRateMult: 0 },
      specialMat: 'i_sword_shard',
      desc: '剑冢出身的剑修，性冷寡言。遭遇战中胜率显著提升。',
      events: ['sp_ls_swordtomb', 'sp_ls_duel', 'sp_ls_revenge', 'sp_ls_swordintent', 'sp_ls_oath']
    },
    /* 产出型：物品数量 + / 稀有品质概率 + */
    qinghe: {
      id: 'qinghe', name: '青禾', role: 'yield', roleName: '产出型',
      basePower: 13, baseWeight: 55, color: '#9fe0a8',
      effect: { winRate: 0, lootQtyMult: 1.45, rareChance: 0.06, eventRate: 0, maxDurationMult: 0, dangerRateMult: 0 },
      specialMat: 'i_herb_seed',
      desc: '药园弟子，识百草、通灵兽。带回的物品数量与稀有度更高。',
      events: ['sp_qh_herbgarden', 'sp_qh_spiritbeast', 'sp_qh_alchemyruin', 'sp_qh_seedling', 'sp_qh_herbking']
    },
    /* 效率型：事件数 + / 最大时长 + / 遇敌率 − */
    yunyi: {
      id: 'yunyi', name: '云逸', role: 'speed', roleName: '效率型',
      basePower: 15, baseWeight: 50, color: '#e6c78a',
      effect: { winRate: 0, lootQtyMult: 1.0, rareChance: 0, eventRate: 0.20, maxDurationMult: 0.25, dangerRateMult: -0.20 },
      specialMat: 'i_wind_feather',
      desc: '身法轻灵的散修，惯走险径。单位时间内遭遇更多事件，且更少遇敌。',
      events: ['sp_yy_adventure', 'sp_yy_secretpath', 'sp_yy_hermit', 'sp_yy_windmap', 'sp_yy_escape']
    }
  },
  DISCIPLE_IDS: ['lingshuang', 'qinghe', 'yunyi'],

  /* ---------------- 弟子境界称号段（独立命名，1–50 级 × 10 段 × 5 级） ---------------- */
  DISCIPLE_REALMS: [
    { min: 1, name: '凡骨' }, { min: 6, name: '淬体' }, { min: 11, name: '通脉' },
    { min: 16, name: '凝气' }, { min: 21, name: '筑基' }, { min: 26, name: '结丹' },
    { min: 31, name: '元婴' }, { min: 36, name: '化神' }, { min: 41, name: '炼虚' },
    { min: 46, name: '大乘' }
  ],

  /* ==========================================================
   * 2. 秘境（9 张，全部初始解锁，仅入场费限制准入）
   *    字段 = 策划案 D1–D7；exclusiveItems 为地图专属掉落。
   * ========================================================== */
  RUINS: [
    {
      id: 1, name: '凡人谷', realm: '炼气', difficulty: 'easy',
      desc: '俗世山谷，灵气稀薄，是初入修行者的试炼之地。',
      powerMin: 8, powerMax: 16, eventRate: 1.25, dangerRate: 0.55,
      lootBias: { white: 6, green: 2, blue: -2, purple: -1, orange: 0, red: 0 },
      exclusiveItems: ['i_herb_common', 'i_cloth'],
      maxDuration: 240, cost: 0
    },
    {
      id: 2, name: '灵兽林', realm: '筑基', difficulty: 'normal',
      desc: '古木参天、灵兽出没，多产灵材与妖兽皮骨。',
      powerMin: 18, powerMax: 34, eventRate: 1.10, dangerRate: 0.80,
      lootBias: { white: 0, green: 4, blue: 2, purple: -1, orange: 0, red: 0 },
      exclusiveItems: ['i_beast_hide', 'i_beast_core'],
      maxDuration: 180, cost: 500
    },
    {
      id: 3, name: '幽冥渊', realm: '金丹', difficulty: 'hard',
      desc: '阴气凝渊、鬼物横行，深处藏有幽魂所守之宝。',
      powerMin: 40, powerMax: 70, eventRate: 0.95, dangerRate: 1.05,
      lootBias: { white: -6, green: 0, blue: 4, purple: 3, orange: 0, red: 0 },
      exclusiveItems: ['i_demon_core', 'i_talisman'],
      maxDuration: 150, cost: 2000
    },
    {
      id: 4, name: '天柱峰', realm: '元婴', difficulty: 'extreme',
      desc: '孤峰擎天、罡风如刀，唯元婴修士方可登临。',
      powerMin: 80, powerMax: 130, eventRate: 0.85, dangerRate: 1.20,
      lootBias: { white: -8, green: -2, blue: 2, purple: 5, orange: 1, red: 0 },
      exclusiveItems: ['i_ore_mystic', 'i_wind_escape'],
      maxDuration: 120, cost: 8000
    },
    {
      id: 5, name: '混沌海', realm: '化神', difficulty: 'easy',
      desc: '混沌之气翻涌成海，虚实难辨，机缘与凶险同在。',
      powerMin: 150, powerMax: 240, eventRate: 1.15, dangerRate: 0.90,
      lootBias: { white: 0, green: 0, blue: 0, purple: 2, orange: 2, red: 0.2 },
      exclusiveItems: ['i_ore_chaos', 'i_ancient_jade'],
      maxDuration: 300, cost: 25000
    },
    {
      id: 6, name: '九幽殿', realm: '炼虚', difficulty: 'normal',
      desc: '幽殿深锁，鬼王盘踞，殿底沉眠着上古遗物。',
      powerMin: 260, powerMax: 420, eventRate: 0.90, dangerRate: 1.25,
      lootBias: { white: -8, green: -3, blue: 0, purple: 5, orange: 2, red: 0.2 },
      exclusiveItems: ['i_demon_core', 'i_heirloom_seal'],
      maxDuration: 150, cost: 80000
    },
    {
      id: 7, name: '仙界门', realm: '合体', difficulty: 'hard',
      desc: '界门残破、仙魔交织，穿行其间可得仙界遗珍。',
      powerMin: 460, powerMax: 720, eventRate: 1.00, dangerRate: 1.10,
      lootBias: { white: -10, green: -4, blue: -1, purple: 4, orange: 4, red: 0.5 },
      exclusiveItems: ['i_immortal_relic', 'i_pill_immortal'],
      maxDuration: 120, cost: 250000
    },
    {
      id: 8, name: '轮回境', realm: '大乘', difficulty: 'extreme',
      desc: '轮回之力流转，一步一劫，稍有不慎便神魂俱灭。',
      powerMin: 800, powerMax: 1300, eventRate: 0.80, dangerRate: 1.35,
      lootBias: { white: -12, green: -5, blue: -2, purple: 3, orange: 6, red: 1.0 },
      exclusiveItems: ['i_dragon_scale', 'i_heaven_book'],
      maxDuration: 90, cost: 800000
    },
    {
      id: 9, name: '鸿蒙界', realm: '渡劫', difficulty: 'extreme',
      desc: '鸿蒙初开之地，天道显化，唯有渡劫大能可入。',
      powerMin: 1500, powerMax: 2600, eventRate: 1.05, dangerRate: 1.15,
      lootBias: { white: -14, green: -6, blue: -2, purple: 2, orange: 8, red: 2.0 },
      exclusiveItems: ['i_chaos_essence', 'i_heaven_book'],
      maxDuration: 180, cost: 3000000
    }
  ],

  /* ==========================================================
   * 3. 物品表（重量为独立字段；value 为出售基准灵石价）
   *    type: treasure 普通类(纯卖钱) / material 材料 / clue 线索
   *    frag 类不入仓，由 outcome.kind='fragment' 直接入神器图鉴
   * ========================================================== */
  ITEMS: {
    /* ---- 白 ---- */
    i_herb_common: { id: 'i_herb_common', name: '凡品灵草', quality: 'white', type: 'treasure', value: 10, weight: 0.5 },
    i_iron_ore: { id: 'i_iron_ore', name: '凡铁矿石', quality: 'white', type: 'material', value: 14, weight: 1.2 },
    i_cloth: { id: 'i_cloth', name: '粗麻布', quality: 'white', type: 'treasure', value: 8, weight: 0.4 },
    i_bone: { id: 'i_bone', name: '兽骨', quality: 'white', type: 'treasure', value: 12, weight: 0.8 },
    /* ---- 绿 ---- */
    i_spirit_herb: { id: 'i_spirit_herb', name: '灵草', quality: 'green', type: 'treasure', value: 60, weight: 0.6 },
    i_beast_hide: { id: 'i_beast_hide', name: '妖兽皮', quality: 'green', type: 'material', value: 85, weight: 1.8 },
    i_spirit_shard: { id: 'i_spirit_shard', name: '灵石碎片', quality: 'green', type: 'treasure', value: 50, weight: 0.5 },
    i_sword_shard: { id: 'i_sword_shard', name: '剑修残锋', quality: 'green', type: 'material', value: 110, weight: 1.0 },
    i_herb_seed: { id: 'i_herb_seed', name: '灵植种子', quality: 'green', type: 'material', value: 95, weight: 0.7 },
    i_wind_feather: { id: 'i_wind_feather', name: '风隼翎羽', quality: 'green', type: 'material', value: 105, weight: 0.4 },
    /* ---- 蓝 ---- */
    i_pill_bottle: { id: 'i_pill_bottle', name: '玉瓶丹药', quality: 'blue', type: 'treasure', value: 420, weight: 0.8 },
    i_talisman: { id: 'i_talisman', name: '符箓', quality: 'blue', type: 'treasure', value: 380, weight: 0.3 },
    i_ore_mystic: { id: 'i_ore_mystic', name: '玄铁矿', quality: 'blue', type: 'material', value: 560, weight: 2.4 },
    i_beast_core: { id: 'i_beast_core', name: '兽核', quality: 'blue', type: 'material', value: 690, weight: 1.2 },
    i_sword_intent: { id: 'i_sword_intent', name: '剑意玉简', quality: 'blue', type: 'material', value: 640, weight: 1.0 },
    i_herb_lingzhi: { id: 'i_herb_lingzhi', name: '灵芝', quality: 'blue', type: 'material', value: 610, weight: 1.1 },
    i_wind_map: { id: 'i_wind_map', name: '风图残卷', quality: 'blue', type: 'material', value: 660, weight: 0.6 },
    /* ---- 紫 ---- */
    i_ancient_jade: { id: 'i_ancient_jade', name: '上古玉简', quality: 'purple', type: 'treasure', value: 2400, weight: 1.0 },
    i_pill_immortal: { id: 'i_pill_immortal', name: '仙丹', quality: 'purple', type: 'treasure', value: 3200, weight: 0.9 },
    i_ore_chaos: { id: 'i_ore_chaos', name: '混沌矿', quality: 'purple', type: 'material', value: 2800, weight: 3.2 },
    i_demon_core: { id: 'i_demon_core', name: '魔道金丹', quality: 'purple', type: 'material', value: 3900, weight: 1.6 },
    i_sword_tomb: { id: 'i_sword_tomb', name: '剑冢遗剑', quality: 'purple', type: 'material', value: 3600, weight: 2.8 },
    i_herb_king: { id: 'i_herb_king', name: '灵药王', quality: 'purple', type: 'material', value: 3400, weight: 1.3 },
    i_wind_escape: { id: 'i_wind_escape', name: '遁风符玉', quality: 'purple', type: 'material', value: 3100, weight: 0.7 },
    /* ---- 橙 ---- */
    i_heirloom_seal: { id: 'i_heirloom_seal', name: '上古遗印', quality: 'orange', type: 'treasure', value: 18000, weight: 2.0 },
    i_dragon_scale: { id: 'i_dragon_scale', name: '真龙鳞', quality: 'orange', type: 'material', value: 24000, weight: 4.0 },
    i_immortal_relic: { id: 'i_immortal_relic', name: '仙遗碎片', quality: 'orange', type: 'treasure', value: 21000, weight: 1.5 },
    /* ---- 红 ---- */
    i_chaos_essence: { id: 'i_chaos_essence', name: '鸿蒙源质', quality: 'red', type: 'material', value: 150000, weight: 6.0 },
    i_heaven_book: { id: 'i_heaven_book', name: '天书残页', quality: 'red', type: 'treasure', value: 110000, weight: 1.0 },
    /* ---- 线索（为未来弟子专属剧情预留挂载点，value = 0 不可卖） ---- */
    i_clue_token: { id: 'i_clue_token', name: '残破信物', quality: 'green', type: 'clue', value: 0, weight: 0.1 },
    i_clue_relic: { id: 'i_clue_relic', name: '故人遗物', quality: 'blue', type: 'clue', value: 0, weight: 0.2 }
  },

  /* ==========================================================
   * 4. 神器清单（6 品质）
   *    slotType: combat 装入神器栏 / passive 全局生效不占栏位
   *    effect.value(level) 返回该等级下的效果量
   *    白色仅 2 件（小幅 +攻击 / 小幅 +防御）
   * ========================================================== */
  ARTIFACTS: [
    /* ---- 白（仅 2 件） ---- */
    {
      id: 'art_iron_sword', name: '铁剑', quality: 'white', slotType: 'combat', maxLevel: 5,
      desc: '凡铁所铸，聊胜于无。战力小幅提升。',
      effect: { power: (l) => 0.04 * l }
    },
    {
      id: 'art_cloth_robe', name: '布甲', quality: 'white', slotType: 'combat', maxLevel: 5,
      desc: '粗布外袍，可挡三分罡风。战斗减伤小幅提升。',
      effect: { damageReduce: (l) => 0.03 * l }
    },
    /* ---- 绿 ---- */
    {
      id: 'art_spirit_compass', name: '灵犀罗盘', quality: 'green', slotType: 'combat', maxLevel: 10,
      desc: '循灵机而指，善辨财货。金钱获取提升。',
      effect: { moneyGain: (l) => 0.05 * l }
    },
    {
      id: 'art_jade_pendant', name: '青玉佩', quality: 'green', slotType: 'passive', maxLevel: 10,
      desc: '佩之气息绵长，可多负重物。',
      effect: { weight: (l) => 12 * l }
    },
    /* ---- 蓝 ---- */
    {
      id: 'art_bag_ring', name: '储物戒', quality: 'blue', slotType: 'passive', maxLevel: 15,
      desc: '内藏乾坤，安全箱位 +1。',
      effect: { safeBoxSlots: (l) => (l >= 1 ? 1 : 0) }
    },
    {
      id: 'art_swift_boots', name: '疾风靴', quality: 'blue', slotType: 'passive', maxLevel: 15,
      desc: '足下生风，每小时事件数提升。',
      effect: { eventRate: (l) => 0.012 * l }
    },
    /* ---- 紫 ---- */
    {
      id: 'art_ward_talisman', name: '护道符', quality: 'purple', slotType: 'combat', maxLevel: 1,
      desc: '一次性的护命符箓：阵亡豁免 1 次。',
      effect: { deathWard: (l) => (l >= 1 ? 1 : 0) }
    },
    {
      id: 'art_merchant_seal', name: '商道印', quality: 'purple', slotType: 'passive', maxLevel: 20,
      desc: '商道通神，最终售价提升。',
      effect: { sellPrice: (l) => 0.02 * l }
    },
    /* ---- 橙 ---- */
    {
      id: 'art_battle_banner', name: '战旗', quality: 'orange', slotType: 'combat', maxLevel: 25,
      desc: '旗展则士气如虹，归来结算奖励提升。',
      effect: { rewardBonus: (l) => 0.03 * l }
    },
    {
      id: 'art_time_hourglass', name: '时之沙漏', quality: 'orange', slotType: 'passive', maxLevel: 25,
      desc: '沙流不止，最大派遣时长提升。',
      effect: { maxDuration: (l) => 0.02 * l }
    },
    /* ---- 红 ---- */
    {
      id: 'art_heaven_scroll', name: '天书残页', quality: 'red', slotType: 'passive', maxLevel: 30,
      desc: '天道残章。神器栏位 +1、同时在派上限 +1。',
      effect: { artifactSlots: (l) => 1, dispatchLimit: (l) => 1 }
    },
    {
      id: 'art_chaos_core', name: '混沌珠', quality: 'red', slotType: 'combat', maxLevel: Infinity,
      desc: '混沌所凝，无有穷尽。战力与结算奖励随等级无限递增。',
      effect: { power: (l) => 0.02 * l, rewardBonus: (l) => 0.01 * l }
    }
  ],

  /* ==========================================================
   * 5. 事件系统（5 类：遭遇 / 奇遇 / 探索 / 采集 / 专属）
   *    - 遭遇：由战力对比判定 win / lose，不做加权结果
   *    - 其余：outcomes 为加权结果表
   *    - 专属：perDisciple，按弟子取各自模板
   *    outcome.kind 取值：
   *      loot      获得物品（count 件，qualityBias 偏品质）
   *      material  获得指定材料 id
   *      fragment  获得神器碎片
   *      stone     直接获得灵石（不占负重）
   *      buffPower 战力永久提升（跨派遣，记在弟子身上）
   *      buffRun   本次派遣内增益（combatPower / eventRate / dangerRate / lootValue）
   *      shorten   剩余时长压缩（等价多出事件）
   *      clue      获得线索（图鉴）
   *      hp        气血变化（负数为损耗）
   *      death     阵亡判定
   * ========================================================== */
  EVENTS: {
    /* ---------------- 遭遇（战斗，唯一） ---------------- */
    encounter: {
      name: '遭遇', danger: true,
      templates: [
        { id: 'enc_ambush', enemyRealmIdx: 0, powerScale: 1.00 },
        { id: 'enc_demon', enemyRealmIdx: 1, powerScale: 1.10 },
        { id: 'enc_spar', enemyRealmIdx: -1, powerScale: 0.85 },
        { id: 'enc_beast', enemyRealmIdx: 0, powerScale: 1.05 },
        { id: 'enc_guardian', enemyRealmIdx: 2, powerScale: 1.25 },
        { id: 'enc_rival', enemyRealmIdx: 1, powerScale: 1.15 }
      ]
    },

    /* ---------------- 奇遇（非战斗增益） ---------------- */
    adventure: {
      name: '奇遇',
      templates: [
        {
          id: 'adv_legacy', outcomes: [
            { key: 'r0', weight: 55, kind: 'buffPower', amount: [1, 3] },
            { key: 'r1', weight: 30, kind: 'buffRun', effect: 'combatPower', value: 0.15 },
            { key: 'r2', weight: 15, kind: 'loot', count: [1, 2], qualityBias: 'high' }
          ]
        },
        {
          id: 'adv_epiphany', outcomes: [
            { key: 'r0', weight: 60, kind: 'buffPower', amount: [2, 5] },
            { key: 'r1', weight: 25, kind: 'buffRun', effect: 'eventRate', value: 0.12 },
            { key: 'r2', weight: 15, kind: 'stone', amount: [200, 900] }
          ]
        },
        {
          id: 'adv_spring', outcomes: [
            { key: 'r0', weight: 50, kind: 'hp', value: 40 },
            { key: 'r1', weight: 30, kind: 'buffPower', amount: [1, 2] },
            { key: 'r2', weight: 20, kind: 'loot', count: [1, 3], qualityBias: 'high' }
          ]
        },
        {
          id: 'adv_jade_slip', outcomes: [
            { key: 'r0', weight: 45, kind: 'fragment', amount: [1, 2] },
            { key: 'r1', weight: 35, kind: 'loot', count: [1, 2], qualityBias: 'high' },
            { key: 'r2', weight: 20, kind: 'clue' }
          ]
        },
        {
          id: 'adv_hermit', outcomes: [
            { key: 'r0', weight: 50, kind: 'buffPower', amount: [3, 6] },
            { key: 'r1', weight: 30, kind: 'fragment', amount: [1, 3] },
            { key: 'r2', weight: 20, kind: 'stone', amount: [500, 2000] }
          ]
        },
        {
          id: 'adv_relic_ground', outcomes: [
            { key: 'r0', weight: 55, kind: 'loot', count: [2, 4], qualityBias: 'high' },
            { key: 'r1', weight: 25, kind: 'fragment', amount: [2, 4] },
            { key: 'r2', weight: 20, kind: 'buffRun', effect: 'lootValue', value: 0.20 }
          ]
        }
      ]
    },

    /* ---------------- 探索（地点类） ---------------- */
    explore: {
      name: '探索',
      templates: [
        {
          id: 'exp_grotto', outcomes: [
            { key: 'r0', weight: 60, kind: 'loot', count: [3, 6], qualityBias: 'high' },
            { key: 'r1', weight: 25, kind: 'shorten', pct: 0.10 },
            { key: 'r2', weight: 15, kind: 'clue' }
          ]
        },
        {
          id: 'exp_alchemy_room', outcomes: [
            { key: 'r0', weight: 55, kind: 'loot', count: [2, 4], qualityBias: 'normal' },
            { key: 'r1', weight: 30, kind: 'material', id: 'i_pill_bottle', count: [1, 3] },
            { key: 'r2', weight: 15, kind: 'stone', amount: [300, 1200] }
          ]
        },
        {
          id: 'exp_scripture', outcomes: [
            { key: 'r0', weight: 50, kind: 'fragment', amount: [1, 3] },
            { key: 'r1', weight: 35, kind: 'loot', count: [1, 3], qualityBias: 'high' },
            { key: 'r2', weight: 15, kind: 'buffPower', amount: [2, 4] }
          ]
        },
        {
          id: 'exp_secret_path', outcomes: [
            { key: 'r0', weight: 65, kind: 'shorten', pct: 0.12 },
            { key: 'r1', weight: 20, kind: 'loot', count: [2, 3], qualityBias: 'normal' },
            { key: 'r2', weight: 15, kind: 'fragment', amount: [1, 2] }
          ]
        },
        {
          id: 'exp_lost', outcomes: [
            { key: 'r0', weight: 60, kind: 'loot', count: [2, 5], qualityBias: 'normal' },
            { key: 'r1', weight: 25, kind: 'hp', value: -12 },
            { key: 'r2', weight: 15, kind: 'clue' }
          ]
        },
        {
          id: 'exp_ruins_gate', outcomes: [
            { key: 'r0', weight: 50, kind: 'loot', count: [3, 5], qualityBias: 'high' },
            { key: 'r1', weight: 30, kind: 'fragment', amount: [2, 4] },
            { key: 'r2', weight: 20, kind: 'shorten', pct: 0.08 }
          ]
        }
      ]
    },

    /* ---------------- 采集（纯收获） ---------------- */
    gather: {
      name: '采集',
      templates: [
        {
          id: 'gat_herb', outcomes: [
            { key: 'r0', weight: 55, kind: 'loot', count: [2, 4], qualityBias: 'normal', onlyType: 'treasure' },
            { key: 'r1', weight: 30, kind: 'material', id: 'i_spirit_herb', count: [1, 3] },
            { key: 'r2', weight: 15, kind: 'fragment', amount: [1, 1] }
          ]
        },
        {
          id: 'gat_mine', outcomes: [
            { key: 'r0', weight: 55, kind: 'material', id: 'i_iron_ore', count: [2, 5] },
            { key: 'r1', weight: 30, kind: 'loot', count: [1, 3], qualityBias: 'normal' },
            { key: 'r2', weight: 15, kind: 'fragment', amount: [1, 2] }
          ]
        },
        {
          id: 'gat_beast', outcomes: [
            { key: 'r0', weight: 50, kind: 'loot', count: [2, 4], qualityBias: 'normal' },
            { key: 'r1', weight: 30, kind: 'material', id: 'i_beast_hide', count: [1, 2] },
            { key: 'r2', weight: 20, kind: 'hp', value: -8 }
          ]
        },
        {
          id: 'gat_tree', outcomes: [
            { key: 'r0', weight: 60, kind: 'loot', count: [2, 5], qualityBias: 'normal' },
            { key: 'r1', weight: 25, kind: 'hp', value: 15 },
            { key: 'r2', weight: 15, kind: 'fragment', amount: [1, 2] }
          ]
        },
        {
          id: 'gat_vein', outcomes: [
            { key: 'r0', weight: 50, kind: 'stone', amount: [150, 700] },
            { key: 'r1', weight: 35, kind: 'loot', count: [1, 3], qualityBias: 'normal' },
            { key: 'r2', weight: 15, kind: 'material', id: 'i_spirit_shard', count: [2, 4] }
          ]
        },
        {
          id: 'gat_pond', outcomes: [
            { key: 'r0', weight: 55, kind: 'loot', count: [2, 4], qualityBias: 'normal' },
            { key: 'r1', weight: 30, kind: 'hp', value: 20 },
            { key: 'r2', weight: 15, kind: 'clue' }
          ]
        }
      ]
    },

    /* ---------------- 专属（按弟子取各自模板；每名弟子 5 条，占位） ---------------- */
    special: {
      name: '专属', perDisciple: true,
      templates: {
        /* 凌霜 · 剑冢 / 比剑 / 寻仇 */
        lingshuang: [
          { id: 'sp_ls_swordtomb', outcomes: [
            { key: 'r0', weight: 50, kind: 'material', id: 'i_sword_shard', count: [2, 4] },
            { key: 'r1', weight: 30, kind: 'material', id: 'i_sword_tomb', count: [1, 1] },
            { key: 'r2', weight: 20, kind: 'buffPower', amount: [3, 6] }
          ] },
          { id: 'sp_ls_duel', outcomes: [
            { key: 'r0', weight: 55, kind: 'material', id: 'i_sword_shard', count: [1, 3] },
            { key: 'r1', weight: 25, kind: 'material', id: 'i_sword_intent', count: [1, 2] },
            { key: 'r2', weight: 20, kind: 'buffRun', effect: 'combatPower', value: 0.18 }
          ] },
          { id: 'sp_ls_revenge', outcomes: [
            { key: 'r0', weight: 50, kind: 'material', id: 'i_sword_shard', count: [2, 5] },
            { key: 'r1', weight: 30, kind: 'clue' },
            { key: 'r2', weight: 20, kind: 'loot', count: [1, 2], qualityBias: 'high' }
          ] },
          { id: 'sp_ls_swordintent', outcomes: [
            { key: 'r0', weight: 45, kind: 'material', id: 'i_sword_intent', count: [1, 3] },
            { key: 'r1', weight: 35, kind: 'fragment', amount: [1, 3] },
            { key: 'r2', weight: 20, kind: 'buffPower', amount: [4, 8] }
          ] },
          { id: 'sp_ls_oath', outcomes: [
            { key: 'r0', weight: 60, kind: 'material', id: 'i_sword_shard', count: [2, 3] },
            { key: 'r1', weight: 25, kind: 'clue' },
            { key: 'r2', weight: 15, kind: 'material', id: 'i_sword_tomb', count: [1, 1] }
          ] }
        ],
        /* 青禾 · 药园 / 灵兽 / 炼丹遗迹 */
        qinghe: [
          { id: 'sp_qh_herbgarden', outcomes: [
            { key: 'r0', weight: 50, kind: 'material', id: 'i_herb_seed', count: [2, 4] },
            { key: 'r1', weight: 30, kind: 'material', id: 'i_herb_lingzhi', count: [1, 2] },
            { key: 'r2', weight: 20, kind: 'loot', count: [2, 4], qualityBias: 'high' }
          ] },
          { id: 'sp_qh_spiritbeast', outcomes: [
            { key: 'r0', weight: 50, kind: 'material', id: 'i_herb_seed', count: [1, 3] },
            { key: 'r1', weight: 30, kind: 'material', id: 'i_beast_core', count: [1, 2] },
            { key: 'r2', weight: 20, kind: 'hp', value: -10 }
          ] },
          { id: 'sp_qh_alchemyruin', outcomes: [
            { key: 'r0', weight: 50, kind: 'material', id: 'i_herb_seed', count: [2, 3] },
            { key: 'r1', weight: 30, kind: 'material', id: 'i_pill_bottle', count: [2, 4] },
            { key: 'r2', weight: 20, kind: 'fragment', amount: [1, 3] }
          ] },
          { id: 'sp_qh_seedling', outcomes: [
            { key: 'r0', weight: 55, kind: 'material', id: 'i_herb_seed', count: [2, 5] },
            { key: 'r1', weight: 25, kind: 'clue' },
            { key: 'r2', weight: 20, kind: 'buffRun', effect: 'lootValue', value: 0.15 }
          ] },
          { id: 'sp_qh_herbking', outcomes: [
            { key: 'r0', weight: 45, kind: 'material', id: 'i_herb_king', count: [1, 1] },
            { key: 'r1', weight: 35, kind: 'material', id: 'i_herb_seed', count: [2, 4] },
            { key: 'r2', weight: 20, kind: 'loot', count: [3, 5], qualityBias: 'high' }
          ] }
        ],
        /* 云逸 · 奇遇 / 密道 / 隐世高人 */
        yunyi: [
          { id: 'sp_yy_adventure', outcomes: [
            { key: 'r0', weight: 50, kind: 'material', id: 'i_wind_feather', count: [2, 4] },
            { key: 'r1', weight: 30, kind: 'buffRun', effect: 'eventRate', value: 0.15 },
            { key: 'r2', weight: 20, kind: 'stone', amount: [400, 1600] }
          ] },
          { id: 'sp_yy_secretpath', outcomes: [
            { key: 'r0', weight: 50, kind: 'material', id: 'i_wind_feather', count: [1, 3] },
            { key: 'r1', weight: 30, kind: 'shorten', pct: 0.15 },
            { key: 'r2', weight: 20, kind: 'material', id: 'i_wind_map', count: [1, 2] }
          ] },
          { id: 'sp_yy_hermit', outcomes: [
            { key: 'r0', weight: 50, kind: 'material', id: 'i_wind_feather', count: [1, 2] },
            { key: 'r1', weight: 30, kind: 'buffPower', amount: [3, 7] },
            { key: 'r2', weight: 20, kind: 'fragment', amount: [2, 4] }
          ] },
          { id: 'sp_yy_windmap', outcomes: [
            { key: 'r0', weight: 45, kind: 'material', id: 'i_wind_map', count: [1, 2] },
            { key: 'r1', weight: 35, kind: 'material', id: 'i_wind_escape', count: [1, 1] },
            { key: 'r2', weight: 20, kind: 'clue' }
          ] },
          { id: 'sp_yy_escape', outcomes: [
            { key: 'r0', weight: 60, kind: 'material', id: 'i_wind_feather', count: [2, 3] },
            { key: 'r1', weight: 25, kind: 'shorten', pct: 0.10 },
            { key: 'r2', weight: 15, kind: 'buffRun', effect: 'dangerRate', value: -0.15 }
          ] }
        ]
      }
    }
  },

  /* ==========================================================
   * 6. 撤离条件（派遣前设定「条件优先级列表」，按序判定，命中即撤）
   *    value 语义见 note；均为占位
   * ========================================================== */
  RETREAT: [
    { type: 'none', label: '不设条件', note: '直到时长用尽' },
    { type: 'bagValue', label: '背包价值达标', unit: '灵石', def: 5000, note: '背包物品总价值 ≥ N' },
    { type: 'bagWeight', label: '负重达上限', unit: '%', def: 80, note: '背包负重 ≥ 上限的 N%' },
    { type: 'bagItems', label: '物品件数达标', unit: '件', def: 10, note: '背包物品总件数 ≥ N' },
    { type: 'safeBoxFull', label: '安全箱已满', unit: '', def: 0, note: '安全箱无空位时撤离' },
    { type: 'hpBelow', label: '气血过低', unit: '%', def: 30, note: '气血 < N%' },
    { type: 'rareLoot', label: '获得稀有物品', unit: '品质', def: 'blue', note: '获得 N 品及以上物品' },
    { type: 'fragment', label: '获得神器碎片', unit: '枚', def: 1, note: '累计碎片 ≥ N' },
    { type: 'events', label: '事件数达标', unit: '次', def: 30, note: '累计事件数 ≥ N' }
  ],

  /* ---------------- 工具：静态查询 ---------------- */
  ruinById(id) { return this.RUINS.find(r => String(r.id) === String(id)) || null; },
  itemById(id) { return this.ITEMS[id] || null; },
  artifactById(id) { return this.ARTIFACTS.find(a => a.id === id) || null; },
  discipleById(id) { return this.DISCIPLES[id] || null; },
  qualityIndex(q) { return this.QUALITY_ORDER.indexOf(q); },
  /* 神器碎片需求（占位曲线）：基础值 × 递增^等级 */
  fragNeeded(artifactId, level) {
    const a = this.artifactById(artifactId);
    if (!a) return Infinity;
    const base = this.PLACEHOLDER.FRAG_BASE[a.quality] || 10;
    return Math.ceil(base * Math.pow(this.PLACEHOLDER.FRAG_INC, Math.max(0, level)));
  },
  /* 满级溢出碎片 → 灵石换算（占位） */
  fragToStone(artifactId, frags) {
    const a = this.artifactById(artifactId);
    if (!a) return 0;
    return frags * (this.PLACEHOLDER.FRAG_TO_STONE[a.quality] || 10);
  },
  /* 弟子境界称号 */
  discipleRealm(level) {
    let name = this.DISCIPLE_REALMS[0].name;
    this.DISCIPLE_REALMS.forEach(r => { if (level >= r.min) name = r.name; });
    return name;
  },
  /* 秘境推荐境界索引（用于敌人境界换算） */
  ruinRealmIdx(ruin) {
    if (!ruin) return 0;
    const i = this.REALM_NAMES.indexOf(ruin.realm);
    return i < 0 ? 0 : i;
  }
};

if (typeof module !== 'undefined') module.exports = { RU_DATA };
