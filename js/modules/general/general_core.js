/* ============================================================
 * general_core.js — 圣人指引模块（完整移植 gooboo general.js）
 *
 * 核心机制（对齐 gooboo src/js/modules/general.js tick）：
 *   tick 速度 = 1（每秒 tick）
 *   扫仙尊 quest → 每个 stage 的 tasks 条件都满足 → complete → giveReward
 *   原版 tick 用 while 循环在一次 tick 内连续推进到不能再推进，我们保持单步
 *
 * 7 种任务类型（完整对齐 gooboo）：
 *   stat            模块 stat 值（支持 subtype: 'current' | 'total'）
 *   unlock          Feature 解锁（可选 feature 前缀）
 *   subfeature      Feature 的 currentSubfeature
 *   upgrade         Upgrade item 的 level（subtype: 'current' | 'total'）
 *   cropLevel       Farm crop 的 level/max
 *   equipmentMastery Horde 装备精通等级（我们没实现 → 兜底 0）
 *   cardEquipped    卡牌系统（我们没实现 → 兜底 false）
 *
 * 12 仙尊（10 激活 + 2 预留）：
 *   核心 5 仙尊：元始天尊/女娲娘娘/地皇神农/通天教主/人皇轩辕
 *   辅助 5 仙尊：天皇伏羲/鸿钧老祖/太上老君/接引道人/准提道人
 *   预留 2 仙尊：昊天上帝/瑶池金母
 *   每个激活仙尊 8-13 条任务线（使用真实 STAT key + subtype 维度）
 *
 * stat key 映射层 (GOobooStat → xianhuaStat)：
 *   mining_maxDepth0    → lm_maxDepth0
 *   mining_maxDepth1    → lm_maxDepth1
 *   village_maxBuilding → village_maxBuilding_* 累加 (meta.js 已有 sumPrefixed)
 *   village_maxHousing  → village_maxHousing
 *   village_stone       → vill_stone
 *   village_marble      → vill_marble
 *   village_gem         → vill_gem
 *   village_offeringMax → vill_offeringMax
 *   village_joyMax      → vill_joyMax
 *   horde_maxZone       → horde_maxZone
 *   horde_soulCorrupted → horde_soulCorrupted
 *   horde_bone          → horde_bone
 *   horde_monsterPart   → horde_monsterPart
 *   horde_mysticalShard → horde_mysticalShard
 *   school_goldenDustMax→ school_goldenDust (取 cap)
 *   school_totalPoints  → school_totalPoints
 *   farm_bestPrestige   → (无 → 兜底 0)
 *   gallery_*           → (废弃 → 兜底 0)
 *   mining_timeSpent    → (无 → 兜底 0)
 *   mining_relicActivesUsed → (遗物未实现 → 兜底 0)
 *
 * 解锁条件：generalFeature（globalLevel >= 100）
 * ============================================================ */

/* ======== stat key 映射：gooboo key → 修仙化 key ======== */
const GEN_STAT_MAP = {
  // 灵脉 (原 mining)
  'mining_maxDepth0': 'lm_maxDepth0',
  'mining_maxDepth1': 'lm_maxDepth1',
  'mining_barAluminium': null,   // 我们没统计矿锭，兜底 0
  'mining_barBronze': null,
  'mining_barSteel': null,
  'mining_barTitanium': null,
  'mining_barShiny': null,
  'mining_barIridium': null,
  'mining_barDarkIron': null,
  'mining_barShinyMax': null,
  'mining_barIridium': null,
  'mining_oreAluminium': null,
  'mining_oreTin': null,
  'mining_oreIron': null,
  'mining_oreTitanium': null,
  'mining_orePlatinum': null,
  'mining_oreIridium': null,
  'mining_depthDwellerCap0': null,  // 我们没这个升级
  'mining_timeSpent': null,
  'mining_relicActivesUsed': null,
  'mining_craftingCount': null,
  'mining_coalMax': null,
  'mining_neonMax': null,
  'mining_obsidian': null,

  // 宗门 (原 village)
  'village_maxBuilding': 'village_maxBuilding',  // sumPrefixed 处理
  'village_maxHousing': 'village_maxHousing',
  'village_stone': 'vill_stone',
  'village_marble': 'vill_marble',
  'village_gem': 'vill_gem',
  'village_offeringMax': 'vill_offeringMax',
  'village_joyMax': 'vill_joyMax',
  'village_timeSpent': null,
  'village_relicActivesUsed': null,

  // 降妖 (原 horde)
  'horde_maxZone': 'horde_maxZone',
  'horde_maxZoneTotal': 'horde_maxZoneTotal',
  'horde_soulCorrupted': 'horde_soulCorrupted',
  'horde_bone': 'horde_bone',
  'horde_monsterPart': 'horde_monsterPart',
  'horde_mysticalShard': 'horde_mysticalShard',
  'horde_blood': null,
  'horde_totalDamage': null,
  'horde_relicActivesUsed': null,
  'horde_maxMastery': null,
  'horde_totalMastery': null,
  'horde_maxItems': null,
  'horde_monsterToothWarzoneMax': null,

  // 灵植 (原 farm)
  'farm_bestPrestige': null,
  'farm_maxOvergrow': null,
  'farm_bugMax': null,
  'farm_butterflyMax': null,
  'farm_ladybugMax': null,
  'farm_petalMax': null,

  // 藏经阁 (原 school)
  'school_goldenDustMax': 'school_goldenDust',
  'school_totalPoints': 'school_totalPoints',

  // gallery → 全兜底 0
  'gallery_': '__gallery_dummy__',  // 前缀匹配

  // 我们自己的修仙化 key 直接 pass-through
  'lm_maxDepth0': 'lm_maxDepth0',
  'lm_maxDepth1': 'lm_maxDepth1',
  'dao_totalChiyuan': 'dao_totalChiyuan',
  'dao_totalQingyuan': 'dao_totalQingyuan',
  'dao_totalZiyuan': 'dao_totalZiyuan',
  'dao_totalXuanyuan': 'dao_totalXuanyuan',
};

/* ======== upgrade key 映射 ======== */
const GEN_UPGRADE_MAP = {
  // mining upgrades → 我们 lm 的 keepUpgrade
  'mining_graniteHardening': 'lm_graniteHardening',
  'mining_titaniumCache': 'lm_titaniumCache',
  'mining_platinumExpansion': 'lm_platinumExpansion',
  'mining_iridiumCache': 'lm_iridiumCache',
  'mining_aluminiumExpansion': 'lm_aluminiumExpansion',
  'mining_copperExpansion': 'lm_copperExpansion',

  // village upgrades → 我们 vill 的建筑升级
  'village_school': 'vill_cultivationHall',
  'village_lostPages': 'vill_bookHall',
  'village_taxOffice': 'vill_taxOffice',
  'village_darkCult': 'vill_darkCult',
  'village_radar': 'vill_awareness',
  'village_marbleStatue': 'vill_marbleStatue',
  'village_trophyCase': 'vill_trophyCase',
  'village_gemBin': 'vill_gemBin',
  'village_theater': 'vill_theater',
  'village_garden': 'vill_garden',
  'village_lake': 'vill_lake',
  'village_greenhouse': 'vill_greenhouse',
  'village_waterTower': 'vill_waterTower',

  // farm upgrades
  'farm_seedBox': 'farm_seedBox',
};

/* ============================================================
 * 12 仙尊定义 —— 10 位激活 + 2 位预留未来
 *
 * 设计原则：仙尊 = 玩法导师
 *   5 核心玩法灵脉/宗门/灵植园/降妖/秘境 各一位仙尊专属引导
 *   5 辅助玩法藏经阁/大道/灵宝/仙器/全局 各一位仙尊专属引导
 *   2 位为未来仙界玩法预留（昊天上帝、瑶池金母）
 *
 * 激活仙尊解锁条件：
 *   全部随 generalFeature (globalLevel >= 100) 一起解锁
 *
 * 每个激活仙尊 8-13 条任务线，使用真实 STAT key + subtype 维度
 * ============================================================ */

/* ======= 仙尊 → 辅助玩法货币 绑定表 =======
 * 方向 A 叙事绑定：每个仙尊主奖励 1 种 + 副奖励 1 种 + 稀有奖励（后期仙尊）
 * primary: { key: 'dao_chiyuan', mult: 0.3, min: 1 }
 * secondary: 主奖励发完后有概率发副奖励（50%）
 * rare: 只有鸿钧老祖才给混元，只有后期 stage 才发
 */
const GEN_REWARD_CONFIG = {
  // === 灵脉（元始天尊）— 开天辟地=诞生先天灵宝 ===
  yuanshi: {
    primary:   { key: 'rel_power',    mult: 0.05, min: 1 },
    secondary: { key: 'xq_fragment',  mult: 0.25, min: 1 },
  },
  // === 宗门（女娲娘娘）— 造人=生机=青元（木）===
  nuwa: {
    primary:   { key: 'dao_qingyuan', mult: 0.3, min: 3 },
    secondary: { key: 'rel_power',     mult: 0.03, min: 1 },
  },
  // === 农场（地皇神农）— 尝百草=藏经阁探索 ===
  shennong: {
    primary:   { key: 'gem_emerald',   mult: 0.2, min: 1 },
    secondary: { key: 'dao_qingyuan',   mult: 0.3, min: 3 },
  },
  // === 部落（通天教主）— 截教=炼器鼻祖=灵玉 ===
  tongtian: {
    primary:   { key: 'xq_fragment',   mult: 0.25, min: 2 },
    secondary: { key: 'dao_chiyuan',   mult: 0.25, min: 2 },
  },
  // === 遗迹（人皇轩辕）— 轩辕剑=先天灵宝 ===
  xuanyuan: {
    primary:   { key: 'rel_power',    mult: 0.06, min: 1 },
    secondary: { key: 'gem_ruby',      mult: 0.25, min: 1 },
  },
  // === 藏经阁（天皇伏羲）— 创八卦=法理=赤元（火）===
  fuxi: {
    primary:   { key: 'dao_chiyuan',  mult: 0.35, min: 3 },
    secondary: { key: 'xq_fragment',   mult: 0.2,  min: 2 },
  },
  // === 大道·后期（鸿钧老祖）— 道祖=混元无极（稀有）===
  hongjun: {
    primary:   { key: 'dao_hunyuan',  mult: 0.02, min: 1 },
    secondary: { key: 'dao_chiyuan',  mult: 0.5,  min: 5 },
    rare:      { key: 'dao_hunyuan',  min: 1 },  // 后期 quest stage 额外 +1
  },
  // === 仙器·后期（太上老君）— 炼丹=炼器分支 ===
  laojun: {
    primary:   { key: 'xq_fragment',  mult: 0.3,  min: 3 },
    secondary: { key: 'rel_power',    mult: 0.04, min: 1 },
  },
  // === 灵宝·后期（接引道人）— 西方教=灵宝体系 ===
  jieyin: {
    primary:   { key: 'rel_power',    mult: 0.07, min: 1 },
    secondary: { key: 'gem_sapphire', mult: 0.25, min: 1 },
  },
  // === 综合·后期（准提道人）— 善法=藏经+赤元 ===
  zhundi: {
    primary:   { key: 'gem_topaz',    mult: 0.25, min: 1 },
    secondary: { key: 'dao_chiyuan',  mult: 0.3,  min: 3 },
  },
  // === reserved ===
  haotian: null,
  yaochi: null,
};

/* ======= grantCur — 安全地给任意模块的 CUR 加值 =======
 * 自动按 key 前缀路由到正确的 CUR 对象
 */
function grantCur(curKey, amount) {
  if (amount <= 0) return;
  // 先尝试 GB_CUR（全局注入的 CUR 注册表）
  if (typeof GB_CUR !== 'undefined' && GB_CUR.add) {
    GB_CUR.add(curKey, amount);
    return;
  }
  // 退化：按前缀找模块自己的 CUR
  try {
    if (curKey.startsWith('dao_') && typeof DAO_CUR !== 'undefined') {
      DAO_CUR.values[curKey] = (DAO_CUR.values[curKey] || 0) + amount;
    } else if ((curKey.startsWith('rel_') || curKey.startsWith('lm_')) && typeof REL_CUR !== 'undefined') {
      REL_CUR.values[curKey] = (REL_CUR.values[curKey] || 0) + amount;
    } else if (curKey.startsWith('xq_') && typeof XQ_CUR !== 'undefined') {
      XQ_CUR.values[curKey] = (XQ_CUR.values[curKey] || 0) + amount;
    } else if ((curKey.startsWith('gem_') || curKey.startsWith('school_')) && typeof SC_CUR !== 'undefined') {
      SC_CUR.values[curKey] = (SC_CUR.values[curKey] || 0) + amount;
    } else {
      // 全都找不到，可能 CUR 系统还没初始化，挂到 GEN_CUR 上以防丢失
      if (typeof GEN_CUR !== 'undefined') {
        GEN_CUR.values['gen_' + curKey] = (GEN_CUR.values['gen_' + curKey] || 0) + amount;
      }
    }
  } catch (e) {
    if (typeof GB_LOG !== 'undefined') GB_LOG.warn('grantCur fail: ' + curKey + ' ' + e.message);
  }
}

/* ======= 仙尊核心数据 ======= */
const GEN_GENERALS = {

  /* ========= 1. 元始天尊 — 灵脉导师（12 条） ========= */
  yuanshi: {
    name: '元始天尊', icon: 'mdi-pickaxe', theme: 'core', gameplay: '灵脉', unlock: null, quests: {
      lmUnlock: { name: '开天辟地', stages: [
        { tasks: [{ type: 'unlock', name: 'lmFeature', op: '==', value: true }], reward: { merit: 3 }},
        { tasks: [{ type: 'stat', name: 'lm_maxDepth0', op: '>=', value: 5 }], reward: { merit: 5 }},
      ]},
      lmDepth: { name: '稳步下潜', stages: [
        { tasks: [{ type: 'stat', name: 'lm_maxDepth0', op: '>=', value: 50 }], reward: { merit: 10 }},
        { tasks: [{ type: 'stat', name: 'lm_maxDepth0', op: '>=', value: 150 }], reward: { merit: 20 }},
        { tasks: [{ type: 'stat', name: 'lm_maxDepth0', op: '>=', value: 300 }], reward: { merit: 40 }},
      ]},
      lmBranch: { name: '开辟副脉', stages: [
        { tasks: [{ type: 'stat', name: 'lm_maxDepth0', op: '>=', value: 100 }, { type: 'stat', name: 'lm_maxDepth1', op: '>=', value: 20, subtype: 'current' }], reward: { merit: 15 }},
        { tasks: [{ type: 'stat', name: 'lm_maxDepth1', op: '>=', value: 50 }], reward: { merit: 30 }},
      ]},
      lmDual: { name: '双脉齐进', stages: [
        { tasks: [{ type: 'stat', name: 'lm_maxDepth0', op: '>=', value: 500 }, { type: 'stat', name: 'lm_maxDepth1', op: '>=', value: 200 }], reward: { merit: 60 }},
        { tasks: [{ type: 'stat', name: 'lm_maxDepth0', op: '>=', value: 750 }, { type: 'stat', name: 'lm_maxDepth1', op: '>=', value: 400 }], reward: { merit: 100 }},
      ]},
      lmTotal: { name: '轮回累计', desc: '挑战你所有轮回累计挖到的总深度', stages: [
        { tasks: [{ type: 'stat', name: 'lm_maxDepth0', op: '>=', value: 3000, subtype: 'total' }], reward: { merit: 80 }},
        { tasks: [{ type: 'stat', name: 'lm_maxDepth0', op: '>=', value: 10000, subtype: 'total' }], reward: { merit: 200 }},
      ]},
      lmCycleMax: { name: '单次巅峰', desc: '单次轮回达到的最大深度（历史记录）', stages: [
        { tasks: [{ type: 'stat', name: 'lm_maxDepth0', op: '>=', value: 600, subtype: 'max' }], reward: { merit: 70 }},
        { tasks: [{ type: 'stat', name: 'lm_maxDepth0', op: '>=', value: 1200, subtype: 'max' }], reward: { merit: 180 }},
      ]},
      lmUpgrade: { name: '花岗岩强化', desc: '升级灵脉中的花岗岩强化项', stages: [
        { tasks: [{ type: 'upgrade', name: 'lm_graniteHardening', op: '>=', value: 1 }], reward: { merit: 25 }},
        { tasks: [{ type: 'upgrade', name: 'lm_graniteHardening', op: '>=', value: 5 }], reward: { merit: 80 }},
      ]},
      lmTitanium: { name: '钛合金储备', desc: '解锁并升级钛合金储备', unlock: 'lm_titaniumCache', stages: [
        { tasks: [{ type: 'upgrade', name: 'lm_titaniumCache', op: '>=', value: 1 }], reward: { merit: 40 }},
        { tasks: [{ type: 'upgrade', name: 'lm_titaniumCache', op: '>=', value: 5 }], reward: { merit: 150 }},
      ]},
      lmDaoLink: { name: '大道初鸣', desc: '灵脉深度够了，解锁大道法则', stages: [
        { tasks: [{ type: 'unlock', name: 'daoFeature', op: '==', value: true }, { type: 'stat', name: 'lm_maxDepth0', op: '>=', value: 400 }], reward: { merit: 100 }},
      ]},
      lmDaoPact: { name: '道元共鸣', desc: '灵脉深处蕴含大道之力，累计道元', stages: [
        { tasks: [{ type: 'stat', name: 'lm_maxDepth0', op: '>=', value: 1000 }, { type: 'stat', name: 'dao_totalDaoyuan', op: '>=', value: 1 }], reward: { merit: 300 }},
      ]},
      lmPlatinum: { name: '铂金扩展', desc: '高级升级：扩展铂金脉储量', stages: [
        { tasks: [{ type: 'upgrade', name: 'lm_platinumExpansion', op: '>=', value: 3 }, { type: 'stat', name: 'lm_maxDepth0', op: '>=', value: 1500 }], reward: { merit: 500 }},
      ]},
      lmDeepest: { name: '幽冥探源', desc: '抵达灵脉最深处——你的灵脉极限在哪里？', stages: [
        { tasks: [{ type: 'stat', name: 'lm_maxDepth0', op: '>=', value: 2000 }, { type: 'stat', name: 'dao_totalHunyuan', op: '>=', value: 5 }], reward: { merit: 1000 }},
      ]},
    },
  },

  /* ========= 2. 女娲娘娘 — 宗门导师（11 条） ========= */
  nuwa: {
    name: '女娲娘娘', icon: 'mdi-home-variant', theme: 'core', gameplay: '宗门', unlock: null, quests: {
      villUnlock: { name: '造人立派', stages: [
        { tasks: [{ type: 'unlock', name: 'villFeature', op: '==', value: true }], reward: { merit: 3 }},
        { tasks: [{ type: 'stat', name: 'village_maxHousing', op: '>=', value: 5 }], reward: { merit: 5 }},
      ]},
      villHousing: { name: '安居乐业', stages: [
        { tasks: [{ type: 'stat', name: 'village_maxHousing', op: '>=', value: 20 }], reward: { merit: 10 }},
        { tasks: [{ type: 'stat', name: 'village_maxHousing', op: '>=', value: 50 }], reward: { merit: 20 }},
        { tasks: [{ type: 'stat', name: 'village_maxHousing', op: '>=', value: 100 }], reward: { merit: 40 }},
      ]},
      villStone: { name: '灵石储备', stages: [
        { tasks: [{ type: 'stat', name: 'vill_stone', op: '>=', value: 1000, subtype: 'total' }], reward: { merit: 10 }},
        { tasks: [{ type: 'stat', name: 'vill_stone', op: '>=', value: 50000, subtype: 'total' }], reward: { merit: 30 }},
      ]},
      villBuilding: { name: '宗门楼阁', stages: [
        { tasks: [{ type: 'stat', name: 'village_maxBuilding', op: '>=', value: 5 }], reward: { merit: 15 }},
        { tasks: [{ type: 'stat', name: 'village_maxBuilding', op: '>=', value: 15 }], reward: { merit: 35 }},
        { tasks: [{ type: 'stat', name: 'village_maxBuilding', op: '>=', value: 30 }], reward: { merit: 70 }},
      ]},
      villGem: { name: '灵玉积累', stages: [
        { tasks: [{ type: 'stat', name: 'vill_gem', op: '>=', value: 100 }], reward: { merit: 25 }},
        { tasks: [{ type: 'stat', name: 'vill_gem', op: '>=', value: 2000 }], reward: { merit: 80 }},
      ]},
      villJade: { name: '玄玉瑰宝', stages: [
        { tasks: [{ type: 'stat', name: 'vill_marble', op: '>=', value: 50 }], reward: { merit: 50 }},
        { tasks: [{ type: 'stat', name: 'vill_marble', op: '>=', value: 1000 }], reward: { merit: 200 }},
      ]},
      villCultivation: { name: '修炼殿堂', desc: '建造并升级宗门修炼堂', stages: [
        { tasks: [{ type: 'upgrade', name: 'vill_cultivationHall', op: '>=', value: 1 }], reward: { merit: 30 }},
        { tasks: [{ type: 'upgrade', name: 'vill_cultivationHall', op: '>=', value: 5 }], reward: { merit: 120 }},
      ]},
      villAwareness: { name: '天眼雷达', desc: '建造宗门禁制设施，防外敌', stages: [
        { tasks: [{ type: 'upgrade', name: 'vill_awareness', op: '>=', value: 1 }], reward: { merit: 40 }},
      ]},
      villOffer: { name: '供奉天道', desc: '累计向天道供奉的总量', stages: [
        { tasks: [{ type: 'stat', name: 'vill_offeringMax', op: '>=', value: 1e5 }], reward: { merit: 100 }},
        { tasks: [{ type: 'stat', name: 'vill_offeringMax', op: '>=', value: 1e7 }], reward: { merit: 300 }},
      ]},
      villJoy: { name: '气运亨通', desc: '累计宗门气运值', stages: [
        { tasks: [{ type: 'stat', name: 'vill_joyMax', op: '>=', value: 1e6 }], reward: { merit: 150 }},
      ]},
      villGlory: { name: '人族光辉', stages: [
        { tasks: [{ type: 'stat', name: 'village_maxHousing', op: '>=', value: 300 }, { type: 'stat', name: 'village_maxBuilding', op: '>=', value: 50 }], reward: { merit: 800 }},
      ]},
    },
  },

  /* ========= 3. 地皇神农 — 灵植园导师（10 条） ========= */
  shennong: {
    name: '地皇神农', icon: 'mdi-leaf', theme: 'core', gameplay: '灵植园', unlock: null, quests: {
      faUnlock: { name: '尝百草', stages: [
        { tasks: [{ type: 'unlock', name: 'faFeature', op: '==', value: true }], reward: { merit: 3 }},
        { tasks: [{ type: 'stat', name: 'farm_flower', op: '>=', value: 10 }], reward: { merit: 5 }},
      ]},
      faLevel: { name: '灵植初阶', stages: [
        { tasks: [{ type: 'stat', name: 'farm_cropLevel_0', op: '>=', value: 3 }], reward: { merit: 10 }},
        { tasks: [{ type: 'stat', name: 'farm_cropLevel_0', op: '>=', value: 8 }], reward: { merit: 25 }},
        { tasks: [{ type: 'stat', name: 'farm_cropLevel_0', op: '>=', value: 15 }], reward: { merit: 60 }},
      ]},
      faFlower: { name: '灵花满园', desc: '累计收获的灵花总量', stages: [
        { tasks: [{ type: 'stat', name: 'farm_flower', op: '>=', value: 500, subtype: 'total' }], reward: { merit: 15 }},
        { tasks: [{ type: 'stat', name: 'farm_flower', op: '>=', value: 1e6, subtype: 'total' }], reward: { merit: 100 }},
      ]},
      faVeggie: { name: '灵蔬盈仓', stages: [
        { tasks: [{ type: 'stat', name: 'farm_vegetable', op: '>=', value: 200 }], reward: { merit: 20 }},
        { tasks: [{ type: 'stat', name: 'farm_vegetable', op: '>=', value: 50000 }], reward: { merit: 80 }},
      ]},
      faGold: { name: '灵金初现', desc: '解锁灵金产出', stages: [
        { tasks: [{ type: 'stat', name: 'farm_gold', op: '>=', value: 1 }], reward: { merit: 40 }},
        { tasks: [{ type: 'stat', name: 'farm_gold', op: '>=', value: 50 }], reward: { merit: 100 }},
      ]},
      faBug: { name: '灵虫相伴', desc: '吸引灵虫来园中栖息', stages: [
        { tasks: [{ type: 'stat', name: 'farm_bugMax', op: '>=', value: 3 }], reward: { merit: 30 }},
        { tasks: [{ type: 'stat', name: 'farm_butterflyMax', op: '>=', value: 5 }], reward: { merit: 60 }},
      ]},
      faPrestige: { name: '灵植声望', desc: '你培养的灵植最高声望', stages: [
        { tasks: [{ type: 'stat', name: 'farm_bestPrestige', op: '>=', value: 100, subtype: 'max' }], reward: { merit: 80 }},
      ]},
      faOvergrow: { name: '密植成林', desc: '灵植最高密植度', stages: [
        { tasks: [{ type: 'stat', name: 'farm_maxOvergrow', op: '>=', value: 5, subtype: 'max' }], reward: { merit: 50 }},
      ]},
      faLevelHigh: { name: '灵植高阶', stages: [
        { tasks: [{ type: 'stat', name: 'farm_cropLevel_0', op: '>=', value: 25 }, { type: 'stat', name: 'farm_gold', op: '>=', value: 500 }], reward: { merit: 300 }},
      ]},
      faAscend: { name: '灵植通天', stages: [
        { tasks: [{ type: 'stat', name: 'farm_cropLevel_0', op: '>=', value: 40 }, { type: 'stat', name: 'farm_flower', op: '>=', value: 1e10, subtype: 'total' }], reward: { merit: 1000 }},
      ]},
    },
  },

  /* ========= 4. 通天教主 — 降妖导师（11 条） ========= */
  tongtian: {
    name: '通天教主', icon: 'mdi-sword-cross', theme: 'core', gameplay: '降妖', unlock: null, quests: {
      hoUnlock: { name: '横扫千军', stages: [
        { tasks: [{ type: 'unlock', name: 'hoFeature', op: '==', value: true }], reward: { merit: 3 }},
        { tasks: [{ type: 'stat', name: 'horde_maxZone', op: '>=', value: 5 }], reward: { merit: 5 }},
      ]},
      hoZone: { name: '层层推进', stages: [
        { tasks: [{ type: 'stat', name: 'horde_maxZone', op: '>=', value: 30 }], reward: { merit: 15 }},
        { tasks: [{ type: 'stat', name: 'horde_maxZone', op: '>=', value: 80 }], reward: { merit: 40 }},
        { tasks: [{ type: 'stat', name: 'horde_maxZone', op: '>=', value: 150 }], reward: { merit: 80 }},
      ]},
      hoBone: { name: '妖骨累累', desc: '累计获得的妖骨总数', stages: [
        { tasks: [{ type: 'stat', name: 'horde_bone', op: '>=', value: 100, subtype: 'total' }], reward: { merit: 15 }},
        { tasks: [{ type: 'stat', name: 'horde_bone', op: '>=', value: 1e6, subtype: 'total' }], reward: { merit: 150 }},
      ]},
      hoSoul: { name: '堕魂侵蚀', stages: [
        { tasks: [{ type: 'stat', name: 'horde_soulCorrupted', op: '>=', value: 100 }], reward: { merit: 30 }},
        { tasks: [{ type: 'stat', name: 'horde_soulCorrupted', op: '>=', value: 1e5 }], reward: { merit: 100 }},
      ]},
      hoCore: { name: '妖核收集', stages: [
        { tasks: [{ type: 'stat', name: 'horde_monsterPart', op: '>=', value: 200 }], reward: { merit: 50 }},
        { tasks: [{ type: 'stat', name: 'horde_monsterPart', op: '>=', value: 5000 }], reward: { merit: 150 }},
      ]},
      hoShard: { name: '神秘碎片', desc: '击败精英魔物获得的神秘碎片', stages: [
        { tasks: [{ type: 'stat', name: 'horde_mysticalShard', op: '>=', value: 10 }], reward: { merit: 80 }},
        { tasks: [{ type: 'stat', name: 'horde_mysticalShard', op: '>=', value: 100 }], reward: { merit: 300 }},
      ]},
      hoMastery: { name: '装备精通', desc: '提升单件装备的精通等级', stages: [
        { tasks: [{ type: 'stat', name: 'horde_maxMastery', op: '>=', value: 5, subtype: 'max' }], reward: { merit: 60 }},
        { tasks: [{ type: 'stat', name: 'horde_maxMastery', op: '>=', value: 20, subtype: 'max' }], reward: { merit: 200 }},
      ]},
      hoItems: { name: '同时装备', desc: '同时装备的最大件数', stages: [
        { tasks: [{ type: 'stat', name: 'horde_maxItems', op: '>=', value: 3, subtype: 'max' }], reward: { merit: 25 }},
        { tasks: [{ type: 'stat', name: 'horde_maxItems', op: '>=', value: 6, subtype: 'max' }], reward: { merit: 100 }},
      ]},
      hoBlood: { name: '妖血流河', stages: [
        { tasks: [{ type: 'stat', name: 'horde_blood', op: '>=', value: 500, subtype: 'total' }], reward: { merit: 100 }},
      ]},
      hoTotalZone: { name: '累计层数', desc: '所有轮回累计到达的总层数', stages: [
        { tasks: [{ type: 'stat', name: 'horde_maxZoneTotal', op: '>=', value: 200 }], reward: { merit: 200 }},
        { tasks: [{ type: 'stat', name: 'horde_maxZoneTotal', op: '>=', value: 500 }], reward: { merit: 500 }},
      ]},
      hoSovereign: { name: '万妖臣服', stages: [
        { tasks: [{ type: 'stat', name: 'horde_maxZone', op: '>=', value: 400 }, { type: 'stat', name: 'horde_soulCorrupted', op: '>=', value: 1e18 }], reward: { merit: 1500 }},
      ]},
    },
  },

  /* ========= 5. 人皇轩辕 — 秘境导师（8 条） ========= */
  xuanyuan: {
    name: '人皇轩辕', icon: 'mdi-map', theme: 'core', gameplay: '秘境', unlock: null, quests: {
      ruUnlock: { name: '开疆拓土', stages: [
        { tasks: [{ type: 'unlock', name: 'ruFeature', op: '==', value: true }], reward: { merit: 5 }},
        { tasks: [{ type: 'stat', name: 'ru_maxDepth', op: '>=', value: 20 }], reward: { merit: 10 }},
      ]},
      ruDepth: { name: '深入秘境', stages: [
        { tasks: [{ type: 'stat', name: 'ru_maxDepth', op: '>=', value: 100 }], reward: { merit: 25 }},
        { tasks: [{ type: 'stat', name: 'ru_maxDepth', op: '>=', value: 250 }], reward: { merit: 60 }},
        { tasks: [{ type: 'stat', name: 'ru_maxDepth', op: '>=', value: 500 }], reward: { merit: 150 }},
      ]},
      ruLingbao: { name: '秘境灵宝', desc: '秘境深处藏有先天灵宝', stages: [
        { tasks: [{ type: 'stat', name: 'ru_maxDepth', op: '>=', value: 150 }, { type: 'unlock', name: 'lingbaoFeature', op: '==', value: true }], reward: { merit: 80 }},
      ]},
      ruXianqi: { name: '秘境仙器', stages: [
        { tasks: [{ type: 'stat', name: 'ru_maxDepth', op: '>=', value: 300 }, { type: 'unlock', name: 'xianqiFeature', op: '==', value: true }], reward: { merit: 150 }},
      ]},
      ruDao: { name: '秘境观道', desc: '秘境中感悟大道法则', stages: [
        { tasks: [{ type: 'stat', name: 'ru_maxDepth', op: '>=', value: 400 }, { type: 'stat', name: 'dao_totalChiyuan', op: '>=', value: 100 }], reward: { merit: 200 }},
      ]},
      ruPlayTime: { name: '秘境历练', desc: '在秘境中累计探索时间', stages: [
        { tasks: [{ type: 'stat', name: 'ruin_playTime', op: '>=', value: 3600, subtype: 'total' }], reward: { merit: 100 }},
      ]},
      ruDeep: { name: '秘境深处', stages: [
        { tasks: [{ type: 'stat', name: 'ru_maxDepth', op: '>=', value: 750 }, { type: 'stat', name: 'lm_maxDepth0', op: '>=', value: 800 }], reward: { merit: 500 }},
      ]},
      ruEmperor: { name: '天下共主', stages: [
        { tasks: [{ type: 'stat', name: 'ru_maxDepth', op: '>=', value: 1500 }, { type: 'stat', name: 'dao_totalDaoyuan', op: '>=', value: 2 }], reward: { merit: 1500 }},
      ]},
    },
  },

  /* ========= 6. 天皇伏羲 — 藏经阁导师（10 条） ========= */
  fuxi: {
    name: '天皇伏羲', icon: 'mdi-school', theme: 'aux', gameplay: '藏经阁', unlock: null, quests: {
      scUnlock: { name: '演卦明理', stages: [
        { tasks: [{ type: 'unlock', name: 'scFeature', op: '==', value: true }], reward: { merit: 3 }},
        { tasks: [{ type: 'stat', name: 'school_totalPoints', op: '>=', value: 300 }], reward: { merit: 5 }},
      ]},
      scPoint: { name: '积少成多', stages: [
        { tasks: [{ type: 'stat', name: 'school_totalPoints', op: '>=', value: 2000 }], reward: { merit: 10 }},
        { tasks: [{ type: 'stat', name: 'school_totalPoints', op: '>=', value: 8000 }], reward: { merit: 25 }},
        { tasks: [{ type: 'stat', name: 'school_totalPoints', op: '>=', value: 2e4 }], reward: { merit: 60 }},
      ]},
      scDust: { name: '金尘上限', desc: '提升藏经阁金尘的存储上限', stages: [
        { tasks: [{ type: 'stat', name: 'school_goldenDust', op: '>=', value: 100 }], reward: { merit: 30 }},
        { tasks: [{ type: 'stat', name: 'school_goldenDust', op: '>=', value: 500 }], reward: { merit: 100 }},
      ]},
      scDaoGem: { name: '大道宝石', desc: '藏经阁积分可兑换大道宝石', stages: [
        { tasks: [{ type: 'stat', name: 'school_totalPoints', op: '>=', value: 5000 }, { type: 'unlock', name: 'daoGemDiamondSubfeature', op: '==', value: true }], reward: { merit: 50 }},
      ]},
      scPointTotal: { name: '典籍累计', desc: '所有轮回累计获得的藏经阁总积分', stages: [
        { tasks: [{ type: 'stat', name: 'school_totalPoints', op: '>=', value: 1e5, subtype: 'total' }], reward: { merit: 120 }},
      ]},
      scQingyuan: { name: '青元悟道', desc: '藏经阁中领悟的青元', stages: [
        { tasks: [{ type: 'stat', name: 'school_totalPoints', op: '>=', value: 5e4 }, { type: 'stat', name: 'dao_totalQingyuan', op: '>=', value: 50 }], reward: { merit: 150 }},
      ]},
      scDaoLink: { name: '藏经遇道', stages: [
        { tasks: [{ type: 'stat', name: 'school_totalPoints', op: '>=', value: 1e5 }, { type: 'stat', name: 'dao_totalChiyuan', op: '>=', value: 200 }], reward: { merit: 300 }},
      ]},
      scDeep: { name: '典籍渊博', stages: [
        { tasks: [{ type: 'stat', name: 'school_totalPoints', op: '>=', value: 5e5 }, { type: 'stat', name: 'school_goldenDust', op: '>=', value: 2000 }], reward: { merit: 500 }},
      ]},
      scDaoYuan: { name: '道元感悟', desc: '在藏经阁中悟出大道之源', stages: [
        { tasks: [{ type: 'stat', name: 'school_totalPoints', op: '>=', value: 1e6 }, { type: 'stat', name: 'dao_totalDaoyuan', op: '>=', value: 1 }], reward: { merit: 800 }},
      ]},
      scSage: { name: '天人合一', stages: [
        { tasks: [{ type: 'stat', name: 'school_totalPoints', op: '>=', value: 5e6 }, { type: 'stat', name: 'dao_totalDaoyuan', op: '>=', value: 3 }], reward: { merit: 1500 }},
      ]},
    },
  },

  /* ========= 7. 鸿钧老祖 — 大道法则导师（13 条） ========= */
  hongjun: {
    name: '鸿钧老祖', icon: 'mdi-yin-yang', theme: 'aux', gameplay: '大道法则', unlock: null, quests: {
      daoUnlock: { name: '道生一', stages: [
        { tasks: [{ type: 'unlock', name: 'daoFeature', op: '==', value: true }], reward: { merit: 5 }},
      ]},
      daoChi: { name: '赤元初悟', desc: '领悟赤元——大道之基', stages: [
        { tasks: [{ type: 'stat', name: 'dao_totalChiyuan', op: '>=', value: 10 }], reward: { merit: 8 }},
        { tasks: [{ type: 'stat', name: 'dao_totalChiyuan', op: '>=', value: 50 }], reward: { merit: 20 }},
        { tasks: [{ type: 'stat', name: 'dao_totalChiyuan', op: '>=', value: 200 }], reward: { merit: 50 }},
      ]},
      daoQing: { name: '青元生发', stages: [
        { tasks: [{ type: 'stat', name: 'dao_totalQingyuan', op: '>=', value: 10 }], reward: { merit: 15 }},
        { tasks: [{ type: 'stat', name: 'dao_totalQingyuan', op: '>=', value: 100 }], reward: { merit: 50 }},
      ]},
      daoZi: { name: '紫元凝华', stages: [
        { tasks: [{ type: 'stat', name: 'dao_totalZiyuan', op: '>=', value: 10 }], reward: { merit: 25 }},
        { tasks: [{ type: 'stat', name: 'dao_totalZiyuan', op: '>=', value: 100 }], reward: { merit: 80 }},
      ]},
      daoXuan: { name: '玄元深邃', desc: '玄元——大道之渊', stages: [
        { tasks: [{ type: 'stat', name: 'dao_totalXuanyuan', op: '>=', value: 10 }], reward: { merit: 50 }},
        { tasks: [{ type: 'stat', name: 'dao_totalXuanyuan', op: '>=', value: 100 }], reward: { merit: 150 }},
      ]},
      daoHuang: { name: '黄元厚重', stages: [
        { tasks: [{ type: 'stat', name: 'dao_totalHuangyuan', op: '>=', value: 5 }], reward: { merit: 80 }},
        { tasks: [{ type: 'stat', name: 'dao_totalHuangyuan', op: '>=', value: 30 }], reward: { merit: 200 }},
      ]},
      daoChiTotal: { name: '赤元累计', desc: '所有轮回累计的赤元总量', stages: [
        { tasks: [{ type: 'stat', name: 'dao_totalChiyuan', op: '>=', value: 1000, subtype: 'total' }], reward: { merit: 100 }},
      ]},
      daoChiMax: { name: '单次赤元巅峰', desc: '单次轮回获得的赤元峰值', stages: [
        { tasks: [{ type: 'stat', name: 'dao_totalChiyuan', op: '>=', value: 300, subtype: 'max' }], reward: { merit: 120 }},
      ]},
      daoLingbaoLink: { name: '灵宝炼道', desc: '先天灵宝助你感悟更深大道', stages: [
        { tasks: [{ type: 'unlock', name: 'lingbaoFeature', op: '==', value: true }, { type: 'stat', name: 'dao_totalXuanyuan', op: '>=', value: 50 }], reward: { merit: 100 }},
      ]},
      daoMystic: { name: '混元初现', stages: [
        { tasks: [{ type: 'stat', name: 'dao_totalHunyuan', op: '>=', value: 1 }], reward: { merit: 300 }},
        { tasks: [{ type: 'stat', name: 'dao_totalHunyuan', op: '>=', value: 10 }], reward: { merit: 600 }},
      ]},
      daoMysticHigh: { name: '混元大成', stages: [
        { tasks: [{ type: 'stat', name: 'dao_totalHunyuan', op: '>=', value: 30 }, { type: 'stat', name: 'dao_totalChiyuan', op: '>=', value: 2000 }], reward: { merit: 1000 }},
      ]},
      daoYuan: { name: '道元初结', desc: '大道之源——万法归一', stages: [
        { tasks: [{ type: 'stat', name: 'dao_totalDaoyuan', op: '>=', value: 1 }], reward: { merit: 500 }},
      ]},
      daoOrigin: { name: '万道之源', stages: [
        { tasks: [{ type: 'stat', name: 'dao_totalDaoyuan', op: '>=', value: 5 }, { type: 'stat', name: 'lm_maxDepth0', op: '>=', value: 1800 }], reward: { merit: 2000 }},
      ]},
    },
  },

  /* ========= 8. 太上老君 — 先天灵宝导师（8 条） ========= */
  laojun: {
    name: '太上老君', icon: 'mdi-gem-stone', theme: 'aux', gameplay: '先天灵宝', unlock: null, quests: {
      lbUnlock: { name: '炼灵宝', stages: [
        { tasks: [{ type: 'unlock', name: 'lingbaoFeature', op: '==', value: true }], reward: { merit: 5 }},
        { tasks: [{ type: 'stat', name: 'lm_maxDepth0', op: '>=', value: 60 }], reward: { merit: 10 }},
      ]},
      lbZi: { name: '紫元炼灵', desc: '灵宝以紫元为基', stages: [
        { tasks: [{ type: 'stat', name: 'dao_totalZiyuan', op: '>=', value: 30 }], reward: { merit: 25 }},
        { tasks: [{ type: 'stat', name: 'dao_totalZiyuan', op: '>=', value: 100 }], reward: { merit: 60 }},
      ]},
      lbXuan: { name: '玄元淬宝', stages: [
        { tasks: [{ type: 'stat', name: 'dao_totalXuanyuan', op: '>=', value: 20 }], reward: { merit: 50 }},
        { tasks: [{ type: 'stat', name: 'dao_totalXuanyuan', op: '>=', value: 100 }], reward: { merit: 150 }},
      ]},
      lbHuang: { name: '黄元凝形', stages: [
        { tasks: [{ type: 'stat', name: 'dao_totalHuangyuan', op: '>=', value: 5 }], reward: { merit: 100 }},
      ]},
      lbGem: { name: '灵玉辅炼', desc: '灵玉辅助，提升灵宝品质', stages: [
        { tasks: [{ type: 'stat', name: 'vill_gem', op: '>=', value: 500 }, { type: 'stat', name: 'dao_totalHuangyuan', op: '>=', value: 10 }], reward: { merit: 200 }},
      ]},
      lbMystic: { name: '混元灵宝', stages: [
        { tasks: [{ type: 'stat', name: 'dao_totalHunyuan', op: '>=', value: 3 }], reward: { merit: 400 }},
        { tasks: [{ type: 'stat', name: 'dao_totalHunyuan', op: '>=', value: 20 }], reward: { merit: 800 }},
      ]},
      lbHorde: { name: '妖骨入炉', desc: '降妖获得的妖骨可以炼入灵宝', stages: [
        { tasks: [{ type: 'stat', name: 'horde_bone', op: '>=', value: 10000, subtype: 'total' }], reward: { merit: 150 }},
      ]},
      lbDan: { name: '九转金丹', stages: [
        { tasks: [{ type: 'stat', name: 'dao_totalDaoyuan', op: '>=', value: 5 }, { type: 'stat', name: 'dao_totalHunyuan', op: '>=', value: 30 }], reward: { merit: 1500 }},
      ]},
    },
  },

  /* ========= 9. 接引道人 — 仙器导师（9 条） ========= */
  jieyin: {
    name: '接引道人', icon: 'mdi-sword', theme: 'aux', gameplay: '仙器', unlock: null, quests: {
      xqUnlock: { name: '赐仙器', stages: [
        { tasks: [{ type: 'unlock', name: 'xianqiFeature', op: '==', value: true }], reward: { merit: 5 }},
        { tasks: [{ type: 'stat', name: 'horde_maxZone', op: '>=', value: 50 }], reward: { merit: 10 }},
      ]},
      xqZone: { name: '仙器初成', desc: '仙器随降妖层数解锁', stages: [
        { tasks: [{ type: 'stat', name: 'horde_maxZone', op: '>=', value: 100 }], reward: { merit: 25 }},
        { tasks: [{ type: 'stat', name: 'horde_maxZone', op: '>=', value: 200 }], reward: { merit: 80 }},
      ]},
      xqCore: { name: '妖核铸刃', desc: '妖核是仙器的核心材料', stages: [
        { tasks: [{ type: 'stat', name: 'horde_monsterPart', op: '>=', value: 1000 }], reward: { merit: 40 }},
        { tasks: [{ type: 'stat', name: 'horde_monsterPart', op: '>=', value: 10000 }], reward: { merit: 150 }},
      ]},
      xqGem: { name: '灵玉镶嵌', desc: '灵玉可以嵌入仙器提升威力', stages: [
        { tasks: [{ type: 'stat', name: 'vill_gem', op: '>=', value: 1000 }], reward: { merit: 60 }},
      ]},
      xqMastery: { name: '精通百炼', desc: '仙器的精通等级决定上限', stages: [
        { tasks: [{ type: 'stat', name: 'horde_maxMastery', op: '>=', value: 10, subtype: 'max' }], reward: { merit: 100 }},
        { tasks: [{ type: 'stat', name: 'horde_maxMastery', op: '>=', value: 30, subtype: 'max' }], reward: { merit: 300 }},
      ]},
      xqShard: { name: '碎片升级', desc: '神秘碎片是仙器突破的关键', stages: [
        { tasks: [{ type: 'stat', name: 'horde_mysticalShard', op: '>=', value: 50 }], reward: { merit: 150 }},
        { tasks: [{ type: 'stat', name: 'horde_mysticalShard', op: '>=', value: 300 }], reward: { merit: 500 }},
      ]},
      xqZi: { name: '紫元入器', desc: '紫元提升仙器基础属性', stages: [
        { tasks: [{ type: 'stat', name: 'dao_totalZiyuan', op: '>=', value: 50 }, { type: 'stat', name: 'horde_maxZone', op: '>=', value: 180 }], reward: { merit: 200 }},
      ]},
      xqTotal: { name: '累计战绩', desc: '所有轮回累计的降妖层数', stages: [
        { tasks: [{ type: 'stat', name: 'horde_maxZoneTotal', op: '>=', value: 300 }], reward: { merit: 400 }},
      ]},
      xqHeaven: { name: '九天神兵', stages: [
        { tasks: [{ type: 'stat', name: 'horde_maxZone', op: '>=', value: 450 }, { type: 'stat', name: 'dao_totalDaoyuan', op: '>=', value: 2 }, { type: 'stat', name: 'horde_soulCorrupted', op: '>=', value: 1e20 }], reward: { merit: 1500 }},
      ]},
    },
  },

  /* ========= 10. 准提道人 — 综合全局导师（13 条） ========= */
  zhundi: {
    name: '准提道人', icon: 'mdi-pray', theme: 'aux', gameplay: '综合全局', unlock: null, quests: {
      allTwo: { name: '双门并修', desc: '同时开启两个核心玩法', stages: [
        { tasks: [{ type: 'unlock', name: 'lmFeature', op: '==', value: true }, { type: 'unlock', name: 'villFeature', op: '==', value: true }], reward: { merit: 5 }},
      ]},
      allFour: { name: '四门皆通', stages: [
        { tasks: [{ type: 'unlock', name: 'faFeature', op: '==', value: true }, { type: 'unlock', name: 'hoFeature', op: '==', value: true }], reward: { merit: 10 }},
      ]},
      allSix: { name: '六艺精通', desc: '解锁 5 个核心玩法', stages: [
        { tasks: [{ type: 'unlock', name: 'ruFeature', op: '==', value: true }, { type: 'unlock', name: 'lmFeature', op: '==', value: true }, { type: 'unlock', name: 'villFeature', op: '==', value: true }, { type: 'unlock', name: 'faFeature', op: '==', value: true }, { type: 'unlock', name: 'hoFeature', op: '==', value: true }], reward: { merit: 30 }},
      ]},
      allEight: { name: '八法共修', desc: '解锁所有玩法（包括藏经阁和大道）', stages: [
        { tasks: [{ type: 'unlock', name: 'scFeature', op: '==', value: true }, { type: 'unlock', name: 'daoFeature', op: '==', value: true }], reward: { merit: 50 }},
      ]},
      allDepths: { name: '均衡发展', desc: '不要偏科！灵脉深度和降妖层数都要跟上', stages: [
        { tasks: [{ type: 'stat', name: 'lm_maxDepth0', op: '>=', value: 200 }, { type: 'stat', name: 'horde_maxZone', op: '>=', value: 120 }], reward: { merit: 80 }},
        { tasks: [{ type: 'stat', name: 'lm_maxDepth0', op: '>=', value: 500 }, { type: 'stat', name: 'horde_maxZone', op: '>=', value: 250 }, { type: 'stat', name: 'village_maxHousing', op: '>=', value: 80 }], reward: { merit: 200 }},
      ]},
      allDiverse: { name: '多元之道', desc: '藏经阁积分和大道法则也不能落下', stages: [
        { tasks: [{ type: 'stat', name: 'school_totalPoints', op: '>=', value: 2e4 }, { type: 'stat', name: 'dao_totalChiyuan', op: '>=', value: 200 }, { type: 'stat', name: 'farm_cropLevel_0', op: '>=', value: 10 }], reward: { merit: 300 }},
      ]},
      allRuin: { name: '秘境关联', desc: '秘境深度也要跟上全局进度', stages: [
        { tasks: [{ type: 'stat', name: 'ru_maxDepth', op: '>=', value: 300 }, { type: 'stat', name: 'lm_maxDepth0', op: '>=', value: 600 }], reward: { merit: 400 }},
      ]},
      allLingbao: { name: '灵宝仙器', stages: [
        { tasks: [{ type: 'unlock', name: 'lingbaoFeature', op: '==', value: true }, { type: 'unlock', name: 'xianqiFeature', op: '==', value: true }], reward: { merit: 60 }},
      ]},
      allMystic: { name: '混元累计', desc: '混元是高阶大道的标志', stages: [
        { tasks: [{ type: 'stat', name: 'dao_totalHunyuan', op: '>=', value: 5 }, { type: 'stat', name: 'horde_maxZone', op: '>=', value: 350 }], reward: { merit: 600 }},
      ]},
      allCycle: { name: '轮回次数', desc: '你的总轮回次数说明你理解了搜打撤的真谛', stages: [
        { tasks: [{ type: 'stat', name: 'dao_totalChiyuan', op: '>=', value: 3000, subtype: 'total' }], reward: { merit: 500 }},
      ]},
      allSage: { name: '大道归一', desc: '道元初成，万法归一', stages: [
        { tasks: [{ type: 'stat', name: 'dao_totalDaoyuan', op: '>=', value: 1 }, { type: 'stat', name: 'lm_maxDepth0', op: '>=', value: 1000 }, { type: 'stat', name: 'horde_maxZoneTotal', op: '>=', value: 400 }], reward: { merit: 1000 }},
      ]},
      allPeak: { name: '全线突破', stages: [
        { tasks: [{ type: 'stat', name: 'lm_maxDepth0', op: '>=', value: 1500 }, { type: 'stat', name: 'horde_maxZone', op: '>=', value: 500 }, { type: 'stat', name: 'ru_maxDepth', op: '>=', value: 1000 }], reward: { merit: 2000 }},
      ]},
      allEnd: { name: '无量天尊', desc: '传说中的仙尊境界——你的道在哪里？', stages: [
        { tasks: [{ type: 'stat', name: 'dao_totalDaoyuan', op: '>=', value: 8 }, { type: 'stat', name: 'lm_maxDepth0', op: '>=', value: 2500 }, { type: 'stat', name: 'horde_soulCorrupted', op: '>=', value: 1e30 }], reward: { merit: 5000 }},
      ]},
    },
  },

  /* ========= 11. 昊天上帝 — 🔒 未来仙界·管理 ========= */
  haotian: {
    name: '昊天上帝', icon: 'mdi-crown', theme: 'future', gameplay: '仙界·管理',
    unlock: 'generalFutureHaotianSubfeature', quests: {},
  },

  /* ========= 12. 瑶池金母 — 🔒 未来仙界·庆典 ========= */
  yaochi: {
    name: '瑶池金母', icon: 'mdi-crown-variant', theme: 'future', gameplay: '仙界·庆典',
    unlock: 'generalFutureYaochiSubfeature', quests: {},
  },
};

/* ======= 统计：总任务线数 & 总 stage 数 ======= */
(function logQuestStats() {
  let totalQuests = 0, totalStages = 0;
  for (const gk in GEN_GENERALS) {
    const g = GEN_GENERALS[gk];
    let stages = 0;
    for (const qk in g.quests) { stages += g.quests[qk].stages.length; totalQuests++; }
    totalStages += stages;
  }
  // console.log('[GEN] 10 仙尊 ·', totalQuests, '条任务线 ·', totalStages, '个 stage');
})();

/* ============================================================
 * GEN_LORE —— 仙尊叙事与任务线故事
 * 不直接写入 GEN_GENERALS（那是纯数据），而是后置注入
 * 方便未来扩展、加新仙尊、改文案
 * ============================================================ */
const GEN_LORE = {
  // --- 10 位激活仙尊传导入场白 ---
  yuanshi: '"开天辟地时，余亦在混沌之中。道友且随我，看这灵脉深处藏着什么..."',
  nuwa:    '"昔者天柱折，地维绝，女娲炼石以补苍天。今道友立派宗门，亦是补天之大业。"',
  shennong:'"百草有灵，可医天地。道友于灵植园中耕耘，亦是神农遗风也。"',
  tongtian:'"吾乃截教通天教主，手中青萍剑专斩妖邪。道友随我横扫千军！"',
  xuanyuan:'"轩辕一剑定乾坤。道友深入秘境，当知上古先贤之遗迹犹在。"',
  fuxi:    '"仰观天象，俯察地理，八卦由此而生。道友于藏经阁悟道，可得真传。"',
  hongjun: '"道生一，一生二，二生三，三生万物。吾乃鸿钧——万道之源。"',
  laojun:  '"金丹一粒定长生。道友欲炼先天灵宝，需以玄黄之气为炉，万物为薪。"',
  jieyin:  '"贫僧乃西方接引道人。道友若欲仙器护身，当知仙器非器，乃心也。"',
  zhundi:  '"准提道人有礼了。道友若能融会贯通万法，当知真正的道不在一处，而在处处。"',
  // --- 2 位预留 ---
  haotian: '"朕乃昊天上帝。仙界之事，容后再议。"',
  yaochi:  '"瑶池金母在此。庆典之事，日后再叙。"',
};

/* 自动注入 lore 和 story 到 GEN_GENERALS */
(function injectLore() {
  const ST = {  // quest story 字典
    // ---- 元始天尊（灵脉） ----
    yuanshi: {
      lmUnlock: '"混沌初开，盘古执斧开天。道友亦需一柄斧，斩开这亘古沉睡的灵脉。"',
      lmDepth:  '"开天之后，万物萌生。愈深之处，灵气愈浓，道友请稳步下潜。"',
      lmBranch: '"主脉之外，亦有支脉。开辟副脉，灵气倍增——此乃开天辟地第二重。"',
      lmDual:   '"双脉齐进，如同日月并辉。唯有两脉同掘，方见天地交泰之象。"',
      lmTotal:  '"轮回虽断，前尘不忘。累计深度，是道友生生世世的印记。"',
      lmCycleMax: '"每一轮回都是新的开始，但峰值永留。你的灵脉极限在哪里？"',
      lmUpgrade: '"灵脉之中，花岗岩是天然屏障。以人力强化之，可抗更深压力。"',
      lmTitanium: '"钛合金——现代灵脉之秘。解锁储备，方可触及更深矿脉。"',
      lmDaoLink: '"灵脉深处，隐隐有大道之鸣。道友可曾听见？那是法则在呼唤。"',
      lmDaoPact: '"道元共鸣——当灵脉与大道同频，道友便不再只是挖矿者，更是悟道者。"',
      lmPlatinum: '"铂金——灵脉最深处的稀有矿脉。唯有深度与积累并重的道友方可触及。"',
      lmDeepest: '"幽冥探源——传说中的灵脉最深处，直通幽冥之渊。道友，你的极限在哪里？"',
    },
    // ---- 女娲娘娘（宗门） ----
    nuwa: {
      villUnlock: '"昔者女娲造人，今日道友立派。宗门之始，不过数间茅舍，数口人丁。"',
      villHousing: '"安居乐业，人之根本。房屋越多，人丁越旺，宗门根基越深。"',
      villStone:   '"灵石是宗门运作的血液。储备越足，遇事不慌。"',
      villBuilding:'"宗门楼阁，越建越高。从茅屋到瓦舍，从瓦舍到仙阁。"',
      villGem:     '"灵玉积累——宗门之中，灵玉是最公平的硬通货。"',
      villJade:    '"玄玉瑰宝——比灵玉更珍奇的玄玉，只有大富大贵的宗门才能储备。"',
      villCultivation: '"修炼殿堂——宗门修士的根基之地。此殿不修，宗门再大也是散沙。"',
      villAwareness: '"天眼雷达——建宗易守宗难。有道友在天眼之眼，外敌不敢妄动。"',
      villOffer:   '"供奉天道——将宗门积累回馈天道，天道自会庇佑。"',
      villJoy:     '"气运亨通——宗门气运旺，做事事半功倍。气运衰，寸步难行。"',
      villGlory:   '"人族光辉——当宗门人丁与建筑皆至顶峰，便是人族立地之时。"',
    },
    // ---- 地皇神农（农场） ----
    shennong: {
      faUnlock: '"神农尝百草，一日遇七十毒。道友灵植初耕，亦是尝百草之遗风。"',
      faLevel:   '"灵植初阶——每升一级，都是对植物天性的更深理解。"',
      faFlower:  '"灵花满园——花为灵植之魂。满园灵花，香飘十里，可引仙客。"',
      faVeggie:  '"灵蔬盈仓——蔬菜是稳定产出的根基。盈仓之日，不再为口粮发愁。"',
      faGold:    '"灵金初现——灵植的终极产出。唯有精心培育者，方能让灵金现身。"',
      faBug:     '"灵虫相伴——有好虫，花更香；有好蝶，果更甜。虫蝶乃灵植之友。"',
      faPrestige:'"灵植声望——你培育的灵植，能有多高的评价？那是神农留下的标尺。"',
      faOvergrow:'"密植成林——当灵植不再是一株，而是一片，便是成林之时。"',
      faLevelHigh:'"灵植高阶——高阶灵植已非普通作物，可入药、可炼丹、可通灵。"',
      faAscend:  '"灵植通天——传说有灵植可通上天。道友的灵花，能开到天上去吗？"',
    },
    // ---- 通天教主（降妖） ----
    tongtian: {
      hoUnlock: '"截教通天，手中青萍，斩尽妖邪！道友随我，横扫千军！"',
      hoZone:   '"层层推进——妖塔一层深一层。道友能推到第几层？"',
      hoBone:   '"妖骨累累——斩妖无数，妖骨堆积如山。这是截教修士的勋章。"',
      hoSoul:   '"堕魂侵蚀——妖的魂魄会侵蚀人心，但道友的道心定如山岳！"',
      hoCore:   '"妖核收集——妖核是妖的精华。集之可铸刃，亦可炼宝。"',
      hoShard:  '"神秘碎片——精英魔物死后留下的碎片，来历成谜，似与大道有关。"',
      hoMastery:'"装备精通——一把好刀，要千锤百炼。装备也是一样，精通才是开始。"',
      hoItems:  '"同时装备——装备越多，战力越强。但不是所有装备都能同时上身。"',
      hoBlood:  '"妖血流河——累计斩杀的妖，其血足以成河。这是截教修士的杀气！"',
      hoTotalZone:'"累计层数——所有轮回加起来，道友到底推了多少层？"',
      hoSovereign:'"万妖臣服——当层数与堕魂都至极限，万妖跪伏，道友便是妖中之王！"',
    },
    // ---- 人皇轩辕（秘境） ----
    xuanyuan: {
      ruUnlock: '"轩辕氏开疆拓土，秘境之中藏有上古宝物。道友，秘境的门已开。"',
      ruDepth:   '"深入秘境——一层一层，秘境越深处越神秘，也越危险。"',
      ruLingbao: '"秘境灵宝——传说秘境深处藏有先天灵宝。道友可曾寻得？"',
      ruXianqi:  '"秘境仙器——仙器亦藏于秘境之中，与灵宝不同，仙器偏于杀伐。"',
      ruDao:     '"秘境观道——秘境中不止有宝物，更有上古大道痕迹。"',
      ruPlayTime:'"秘境历练——道不是悟出来的，是练出来的。秘境中的时光，都是修行。"',
      ruDeep:    '"秘境深处——秘境与灵脉似乎相通。两脉俱深，方见天地之根。"',
      ruEmperor: '"天下共主——当秘境与大道都至顶峰，道友便是当今天下的共主！"',
    },
    // ---- 天皇伏羲（藏经阁） ----
    fuxi: {
      scUnlock: '"伏羲演卦，一画开天。藏经阁中万卷书，皆是道法真传。"',
      scPoint:   '"积少成多——藏经阁积分，一分一毫皆是学问积累。"',
      scDust:    '"金尘上限——金尘是藏经阁的特殊货币。容量越大，可换越多。"',
      scDaoGem:  '"大道宝石——藏经阁积分能兑换大道宝石！这是藏经阁最深的秘密。"',
      scPointTotal: '"典籍累计——一生所学，皆藏于总积分中。这是道友读书的印记。"',
      scQingyuan:'"青元悟道——藏经阁中可悟青元。读万卷书，行万里路，悟大道。"',
      scDaoLink: '"藏经遇道——藏经阁与大道法则本相通。道友可曾在经卷中见道？"',
      scDeep:    '"典籍渊博——藏书万卷，金尘如山。这是真正的学富五车。"',
      scDaoYuan: '"道元感悟——当藏经阁的学问汇聚成河，道元便从中浮出水面。"',
      scSage:    '"天人合一——读书读到天人合一，便是伏羲真传。道友，恭喜你。"',
    },
    // ---- 鸿钧老祖（大道） ----
    hongjun: {
      daoUnlock: '"道生一——天地之间，先有道，后有万物。道友，请听我传道。"',
      daoChi:     '"赤元初悟——赤元是大道的骨架。无赤元，道不立。"',
      daoQing:    '"青元生发——赤元为骨，青元为肉。青元生，万物生。"',
      daoZi:      '"紫元凝华——紫元是大道的装饰。有紫元，道始有光华。"',
      daoXuan:    '"玄元深邃——玄元是大道的渊薮。愈深邃，道愈真。"',
      daoHuang:   '"黄元厚重——黄元是大道的根基。厚重不摇，道始稳固。"',
      daoChiTotal:'"赤元累计——所有轮回积累的赤元，是道友对大道最虔诚的叩拜。"',
      daoChiMax:  '"单次赤元巅峰——单次轮回的赤元峰值，是道友悟性的最高记录。"',
      daoLingbaoLink: '"灵宝炼道——先天灵宝之中，亦藏大道。以灵宝助悟道，事半功倍。"',
      daoMystic:  '"混元初现——混元是大道之极。当紫玄青赤黄俱足，混元自现。"',
      daoMysticHigh: '"混元大成——混元不止是一个点，而是一片天地。"',
      daoYuan:    '"道元初结——道元是大道之源，比混元更稀有。万法归一，便是道元。"',
      daoOrigin:  '"万道之源——当道友同时触及道元与幽冥之渊，便知万道之源在哪里。"',
    },
    // ---- 太上老君（先天灵宝） ----
    laojun: {
      lbUnlock: '"炼灵宝——先天灵宝是天地初开时的宝物，以天地为炉，以万物为薪。"',
      lbZi:     '"紫元炼灵——紫元是炼灵之火。无紫元，灵宝只是顽铁。"',
      lbXuan:   '"玄元淬宝——玄元淬宝，如烈火炼金。玄元越深，灵宝越锐。"',
      lbHuang:  '"黄元凝形——黄元是凝形之基。黄元越厚，灵宝越实。"',
      lbGem:    '"灵玉辅炼——灵玉为灵宝锦上添花。好玉配好宝，相得益彰。"',
      lbMystic: '"混元灵宝——以混元炼灵宝，那便不再是灵宝，而是神器！"',
      lbHorde:  '"妖骨入炉——降妖所得的妖骨，亦可炼入灵宝之中，增添杀伐之气。"',
      lbDan:    '"九转金丹——九转金丹是太上老君的招牌。当灵宝与金丹同炉，便是传说！"',
    },
    // ---- 接引道人（仙器） ----
    jieyin: {
      xqUnlock: '"赐仙器——仙器是后天锻造的法宝，与灵宝不同，仙器可随主人心意成长。"',
      xqZone:   '"仙器初成——仙器随降妖层数解锁。妖越杀得多，仙器越强。"',
      xqCore:   '"妖核铸刃——妖核是仙器的核心。无妖核，仙器只是废铁。"',
      xqGem:    '"灵玉镶嵌——灵玉可嵌入仙器，如星辰点缀夜空。"',
      xqMastery:'"精通百炼——仙器的精通等级，决定它能走多远。百炼成钢。"',
      xqShard:  '"碎片升级——神秘碎片是仙器突破瓶颈的钥匙。"',
      xqZi:     '"紫元入器——紫元为仙器注入灵性。有了紫元，仙器才有生命。"',
      xqTotal:  '"累计战绩——仙器随主人战遍所有轮回，战绩便是它的履历。"',
      xqHeaven: '"九天神兵——层数、道元、堕魂同时顶峰，仙器便成九天神兵！"',
    },
    // ---- 准提道人（综合全局） ----
    zhundi: {
      allTwo:   '"双门并修——不要偏科！同时开启两个核心玩法，才是修行之道。"',
      allFour:  '"四门皆通——灵脉、宗门、农场、降妖，四门齐通，根基方稳。"',
      allSix:   '"六艺精通——秘境亦不可少。五核心全开，便称六艺。"',
      allEight: '"八法共修——藏经阁与大道是辅助，八法皆通方为全才。"',
      allDepths:'"均衡发展——不要偏科！灵脉、降妖、宗门齐头并进。"',
      allDiverse:'"多元之道——藏经阁、大道法则、农场等级，也不能落下。"',
      allRuin:  '"秘境关联——秘境深度也要跟上全局进度，否则拖后腿。"',
      allLingbao:'"灵宝仙器——先天灵宝与仙器皆开，法宝体系完整。"',
      allMystic:'"混元累计——混元是高阶大道的标志。有混元，说明道友已入高阶。"',
      allCycle: '"轮回次数——轮回不是失败，是积累。你的总轮回次数，是你的坚持。"',
      allSage:  '"大道归一——道元初成，万法归一。这是准提道人最看重的境界。"',
      allPeak:  '"全线突破——灵脉、降妖、秘境三线同时顶峰，全线突破！"',
      allEnd:   '"无量天尊——传说中的仙尊境界。你的道在哪里？道友，继续走下去。"',
    },
  };

  // 注入 lore
  for (const gk in GEN_LORE) {
    if (GEN_GENERALS[gk]) {
      GEN_GENERALS[gk].lore = GEN_LORE[gk];
    }
  }
  // 注入 story 到每个 quest
  for (const gk in ST) {
    if (!GEN_GENERALS[gk]) continue;
    for (const qk in ST[gk]) {
      if (GEN_GENERALS[gk].quests[qk]) {
        GEN_GENERALS[gk].quests[qk].story = ST[gk][qk];
      }
    }
  }
})();

/* ======= 货币：已废弃（奖励直接发到各辅助模块 CUR） ======= */
const GEN_CURDATA = {};

/* ======= MULT ======= */
const GEN_MULT = { values: {} };
GEN_MULT.init = function(name, def) {
  if (!GEN_MULT.values[name]) GEN_MULT.values[name] = { base: def.baseValue || 1, mult: 1, bonus: 0 };
};
GEN_MULT.get = function(name) {
  const v = GEN_MULT.values[name]; if (!v) return 1;
  return v.base * v.mult + v.bonus;
};

/* ======= CUR ======= */
const GEN_CUR = { defs: {}, values: {} };
GEN_CUR.init = function(key, def) {
  def = def || {}; def.key = key;
  GEN_CUR.defs[key] = def;
  if (GEN_CUR.values[key] === undefined) GEN_CUR.values[key] = def.value || 0;
};
GEN_CUR.value = function(key) { return GEN_CUR.values[key] || 0; };
GEN_CUR.add = function(key, amount) {
  if (!GEN_CUR.defs[key]) return;
  GEN_CUR.values[key] = (GEN_CUR.values[key] || 0) + amount;
};
GEN_CUR.spend = function(key, amount) {
  if (GEN_CUR.value(key) < amount) return false;
  GEN_CUR.values[key] -= amount; return true;
};

for (const k in GEN_CURDATA) GEN_CUR.init('gen_' + k, Object.assign({ feature: 'general' }, GEN_CURDATA[k]));

/* ======= 任务完成记录 ======= */
/* ======= 核心：状态系统 ======= */
const GEN_STATE = {
  quests: {},
};

// 每仙尊初始只解锁**第一条 quest**，其他全部 locked
// 前一条 quest 全部 stage 完成后自动解锁下一条
for (const gk in GEN_GENERALS) {
  GEN_STATE.quests[gk] = {};
  const qKeys = Object.keys(GEN_GENERALS[gk].quests);
  for (let i = 0; i < qKeys.length; i++) {
    GEN_STATE.quests[gk][qKeys[i]] = {
      unlocked: i === 0,   // 只有第一条初始解锁
      stage: 0,
      completed: false,
    };
  }
}

/* ============================================================
 * 条件检查（完整支持 gooboo 7 种任务类型 + 映射层）
 * ============================================================ */

/* 从 meta.js 或直接调用 MODULE.STAT 取值 */
function getStatValue(statName, subtype) {
  // 0. gallery 前缀兜底
  if (statName.indexOf('gallery_') === 0) return 0;

  // 1. 先用映射层转换
  let mapped = GEN_STAT_MAP[statName];
  // 没有直接映射 → 可能是修仙化 key，直接用
  if (mapped === undefined) mapped = statName;
  // null → 没实现，兜底 0
  if (mapped === null) return 0;

  // 2. 特殊处理：village_maxBuilding → sumPrefixed
  if (mapped === 'village_maxBuilding') {
    if (typeof GB_META !== 'undefined') return GB_META.villageMaxBuildingSum ? GB_META.villageMaxBuildingSum() : 0;
    // fallback: 遍历所有 stat 求和
    if (typeof GB_MODULES !== 'undefined') {
      const viMod = GB_MODULES._byPrefix['village'] || GB_MODULES._byPrefix['vi'];
      if (viMod && viMod.core && viMod.core.STAT && viMod.core.STAT.values) {
        let sum = 0;
        for (const k in viMod.core.STAT.values) {
          if (k.indexOf('village_maxBuilding_') === 0) {
            const v = viMod.core.STAT.values[k];
            sum += v.total !== undefined ? v.total : (v.value !== undefined ? v.value : 0);
          }
        }
        return sum;
      }
    }
    return 0;
  }

  // 3. school_goldenDustMax → 取 CAP
  if (mapped === 'school_goldenDust') {
    if (typeof GB_MODULES !== 'undefined') {
      const scMod = GB_MODULES._byPrefix['school'] || GB_MODULES._byPrefix['sc'];
      if (scMod && scMod.core && scMod.core.CUR && scMod.core.CUR.cap) {
        return scMod.core.CUR.cap('school_goldenDust') || 0;
      }
    }
    return 0;
  }

  // 4. 其他直接 stat key
  if (typeof GB_MODULES !== 'undefined') {
    // 先尝试 meta.js 的 _statVal
    if (typeof GB_META !== 'undefined' && GB_META._statVal) {
      return GB_META._statVal(null, mapped);
    }

    // 遍历所有模块找对应 STAT
    for (const prefix in GB_MODULES._byPrefix) {
      const mod = GB_MODULES._byPrefix[prefix];
      if (mod && mod.core && mod.core.STAT && mod.core.STAT.values && mod.core.STAT.values[mapped]) {
        const item = mod.core.STAT.values[mapped];
        if (item === null || item === undefined) return 0;
        if (typeof item === 'object') {
          if (subtype === 'current' || subtype === 'value') return item.value !== undefined ? item.value : 0;
          if (subtype === 'max') return item.max !== undefined ? item.max : 0;
          // default: total（累计）
          return item.total !== undefined ? item.total : (item.value !== undefined ? item.value : 0);
        }
        return item;
      }
    }
  }

  return 0;
}

/* 从 Feature 前缀推断模块 */
function getModuleByFeature(feature) {
  if (typeof GB_MODULES === 'undefined') return null;
  return GB_MODULES._byPrefix[feature] || null;
}

/* 从 Upgrade 系统取值 */
function getUpgradeLevel(upgradeName, subtype) {
  // 先映射
  const mapped = GEN_UPGRADE_MAP[upgradeName] || upgradeName;
  if (mapped === null) return 0;

  // 遍历各模块找 UPG
  if (typeof GB_MODULES !== 'undefined') {
    for (const prefix in GB_MODULES._byPrefix) {
      const mod = GB_MODULES._byPrefix[prefix];
      if (mod && mod.core && mod.core.UPG) {
        const upg = mod.core.UPG;
        // 尝试 upg.get(name) 或 upg.values[name]
        if (typeof upg.get === 'function') {
          const v = upg.get(mapped);
          if (v !== undefined && v !== null) {
            if (typeof v === 'object') {
              return subtype === 'current' ? (v.level || 0) : (v.highestLevel !== undefined ? v.highestLevel : (v.level || 0));
            }
            return v;
          }
        }
        if (upg.values && upg.values[mapped]) {
          const item = upg.values[mapped];
          if (typeof item === 'object') {
            return subtype === 'current' ? (item.level || 0) : (item.total !== undefined ? item.total : (item.level || 0));
          }
          return item;
        }
      }
    }
  }
  return 0;
}

/* 从 Farm crop 取值 */
function getCropLevel(cropName) {
  if (typeof GB_MODULES !== 'undefined') {
    const faMod = GB_MODULES._byPrefix['farm'] || GB_MODULES._byPrefix['fa'];
    if (faMod && faMod.core && faMod.core.crops) {
      // cropName 是编号或名字，我们用 farm_cropLevel_N 统计
      if (typeof faMod.core.STAT !== 'undefined' && faMod.core.STAT.values) {
        const key = 'farm_cropLevel_' + cropName;
        const item = faMod.core.STAT.values[key];
        if (item) return item.total || item.value || 0;
      }
      return 0;
    }
    // fallback: 找 STAT 里的 crop key
    for (const prefix in GB_MODULES._byPrefix) {
      const mod = GB_MODULES._byPrefix[prefix];
      if (mod && mod.core && mod.core.STAT && mod.core.STAT.values) {
        const key = 'farm_cropLevel_' + cropName;
        const item = mod.core.STAT.values[key];
        if (item) return item.total || item.value || 0;
      }
    }
  }
  return 0;
}

/* 主条件检查 */
function checkTask(task) {
  // task.operator 或 task.op，支持两种命名
  const op = task.operator || task.op || '>=';

  // 1. stat — 模块 stat 值
  if (task.type === 'stat') {
    const subtype = task.subtype || 'total';
    const current = getStatValue(task.name, subtype);
    return applyOp(current, op, task.value);
  }

  // 2. unlock — Feature 解锁
  if (task.type === 'unlock') {
    if (typeof GB_UNLOCK !== 'undefined') {
      let current;
      if (task.feature) {
        // 带 feature 前缀 → 组合 unlock key
        current = GB_UNLOCK.isUnlocked(task.name);
      } else {
        current = GB_UNLOCK.isUnlocked(task.name);
      }
      return applyOp(current, op, task.value);
    }
    return false;
  }

  // 3. subfeature — Feature 的 currentSubfeature
  if (task.type === 'subfeature') {
    if (typeof GB_MODULES !== 'undefined') {
      const mod = GB_MODULES._byPrefix[task.name];
      if (mod && mod.core) {
        // 从 feature state 取 currentSubfeature
        if (typeof GB_UNLOCK !== 'undefined' && GB_UNLOCK._features) {
          const feat = GB_UNLOCK._features[task.name];
          if (feat && feat.currentSubfeature !== undefined) {
            return applyOp(feat.currentSubfeature, op, task.value);
          }
        }
      }
    }
    return false;
  }

  // 4. upgrade — Upgrade item level
  if (task.type === 'upgrade') {
    const subtype = task.subtype || 'total';
    const current = getUpgradeLevel(task.name, subtype);
    return applyOp(current, op, task.value);
  }

  // 5. cropLevel — Farm crop level
  if (task.type === 'cropLevel') {
    const current = getCropLevel(task.name);
    return applyOp(current, op, task.value);
  }

  // 6. equipmentMastery — Horde 装备精通（我们没实现 → 兜底 0）
  if (task.type === 'equipmentMastery') {
    return applyOp(0, op, task.value);
  }

  // 7. cardEquipped — 卡牌系统（我们没实现 → 兜底 false）
  if (task.type === 'cardEquipped') {
    return op === '==' ? (task.value === false || task.value === 0) : false;
  }

  return false;
}

function applyOp(current, op, value) {
  current = current || 0;
  value = value || 0;
  switch (op) {
    case '>=': return current >= value;
    case '>':  return current > value;
    case '<=': return current <= value;
    case '<':  return current < value;
    case '==': return current === value;
    default:   return !!current === !!value;
  }
}

/* ======= 仙尊核心模块 ======= */
const GEN_MODULE = {
  name: 'general',
  keyPrefix: 'gen',
  feature: 'general',

  CUR: GEN_CUR,
  MULT: GEN_MULT,
  STATE: GEN_STATE,
  GENERALS: GEN_GENERALS,
  STATMAP: GEN_STAT_MAP,
  UPGMAP: GEN_UPGRADE_MAP,

  STAT: { values: {
    gen_questsCompleted: { value: 0 },
    gen_stagesCleared: { value: 0 },
  }},

  /* tick —— 每秒扫任务条件
     核心逻辑：只推进 unlocked 的 quest，完成后自动解锁下一条
  */
  RT: {
    tick() {
      if (typeof GB_UNLOCK === 'undefined') return;

      for (const gk in GEN_GENERALS) {
        const gen = GEN_GENERALS[gk];
        if (gen.unlock && !GB_UNLOCK.isUnlocked(gen.unlock)) continue;

        const genState = GEN_STATE.quests[gk];
        if (!genState) continue;

        const qKeys = Object.keys(gen.quests);
        for (let qi = 0; qi < qKeys.length; qi++) {
          const qk = qKeys[qi];
          const quest = gen.quests[qk];
          const qState = genState[qk];
          if (!qState) continue;
          // 未解锁的 quest 跳过（等上一条完成自动解锁）
          if (!qState.unlocked) continue;
          if (qState.completed) continue;
          // quest 自己的 unlock 守卫（比如 lmTitanium 需要 lm_titaniumCache）
          if (quest.unlock && !GB_UNLOCK.isUnlocked(quest.unlock)) continue;

          // 原版用 while 循环：一次 tick 内尽量多推进
          while (qState.stage < quest.stages.length) {
            const stage = quest.stages[qState.stage];
            let complete = true;
            for (const task of stage.tasks) {
              if (!checkTask(task)) { complete = false; break; }
            }
            if (!complete) break;

            if (stage.reward) {
              const basePoints = stage.reward.merit || stage.reward.points || 0;
              const rcfg = GEN_REWARD_CONFIG[gk];
              if (rcfg && basePoints > 0) {
                // 主奖励（必发，按仙尊绑定表）
                if (rcfg.primary) {
                  const amt = Math.max(rcfg.primary.min || 1, Math.floor(basePoints * (rcfg.primary.mult || 0.2)));
                  grantCur(rcfg.primary.key, amt);
                }
                // 副奖励（50% 概率触发，给仙尊绑定的第二种货币）
                if (rcfg.secondary && Math.random() < 0.5) {
                  const amt = Math.max(rcfg.secondary.min || 1, Math.floor(basePoints * (rcfg.secondary.mult || 0.2)));
                  grantCur(rcfg.secondary.key, amt);
                }
                // 稀有奖励（鸿钧老祖专属，stage 索引 >= 4 时额外 +1 混元）
                if (rcfg.rare && qState.stage >= 4) {
                  grantCur(rcfg.rare.key, rcfg.rare.min || 1);
                }
              } else if (rcfg === null) {
                // reserved 仙尊（haotian/yaochi）：给默认保底货币
                grantCur('dao_chiyuan', Math.max(1, Math.floor(basePoints * 0.3)));
              }
            }
            qState.stage++;
            GEN_MODULE.STAT.values.gen_stagesCleared.value++;

            if (qState.stage >= quest.stages.length) {
              qState.completed = true;
              GEN_MODULE.STAT.values.gen_questsCompleted.value++;
              // === 任务链推进：解锁下一条 quest ===
              if (qi + 1 < qKeys.length) {
                genState[qKeys[qi + 1]].unlocked = true;
              }
              if (typeof GB_APP !== 'undefined' && typeof GB_APP.toast === 'function') {
                const nextQuestName = (qi + 1 < qKeys.length) ? gen.quests[qKeys[qi + 1]].name : '';
                const tip = nextQuestName
                  ? `${gen.name}·${quest.name} 完成！解锁下一条：${nextQuestName}`
                  : `${gen.name}·${quest.name} 完成！全部任务线通关！`;
                GB_APP.toast(tip, '#facc15');
              }
              break;  // quest 完成跳出 while，继续下一个 quest
            }
            if (typeof GB_APP !== 'undefined' && typeof GB_APP.toast === 'function') {
              GB_APP.toast(`${gen.name}·${quest.name} 推进！`, '#facc15');
            }
          }
        }
      }
    },
  },

  // ======= 查询 API =======
  getQuestStage(gKey, qKey) {
    return GEN_STATE.quests[gKey] && GEN_STATE.quests[gKey][qKey] ? GEN_STATE.quests[gKey][qKey].stage : 0;
  },
  isQuestCompleted(gKey, qKey) {
    return GEN_STATE.quests[gKey] && GEN_STATE.quests[gKey][qKey] ? GEN_STATE.quests[gKey][qKey].completed : false;
  },
  getQuestMaxStage(gKey, qKey) {
    const g = GEN_GENERALS[gKey]; if (!g) return 0;
    const q = g.quests[qKey]; if (!q) return 0;
    return q.stages ? q.stages.length : 0;
  },

  // ======= 供视图调用的任务工具 =======
  checkTask,           // 直接引用（ES6 简写）
  getStatValue,        // 同上
  getTaskCurrent(task) {
    // 供视图显示当前值的通用入口
    if (task.type === 'stat') return getStatValue(task.name, task.subtype || 'total');
    if (task.type === 'unlock') return (typeof GB_UNLOCK !== 'undefined') ? GB_UNLOCK.isUnlocked(task.name) : false;
    if (task.type === 'upgrade') return getUpgradeLevel(task.name, task.subtype || 'total');
    if (task.type === 'cropLevel') return getCropLevel(task.name);
    if (task.type === 'equipmentMastery') return 0;
    if (task.type === 'cardEquipped') return false;
    if (task.type === 'subfeature') return false;
    return false;
  },

  // ======= 存档钩子 =======
  snapshot() {
    const obj = {};
    for (const gk in GEN_GENERALS) {
      const gen = GEN_GENERALS[gk];
      if (gen.unlock && typeof GB_UNLOCK !== 'undefined' && !GB_UNLOCK.isUnlocked(gen.unlock)) continue;
      const qKeys = Object.keys(gen.quests);
      obj[gk] = {};
      for (const qk of qKeys) {
        const qState = GEN_STATE.quests[gk] && GEN_STATE.quests[gk][qk];
        if (qState) {
          obj[gk][qk] = { stage: qState.stage, unlocked: qState.unlocked, completed: qState.completed };
        }
      }
    }
    for (const k in GEN_CURDATA) {
      const v = GEN_CUR.value('gen_' + k);
      if (v > 0) obj['cur_' + k] = v;
    }
    return obj;
  },
  restore(data) {
    if (!data) return;
    for (const gk in GEN_GENERALS) {
      if (!data[gk]) continue;
      const qKeys = Object.keys(GEN_GENERALS[gk].quests);
      for (const qk of qKeys) {
        if (data[gk][qk] && GEN_STATE.quests[gk] && GEN_STATE.quests[gk][qk]) {
          const saved = data[gk][qk];
          if (typeof saved === 'object') {
            GEN_STATE.quests[gk][qk].stage = saved.stage || 0;
            GEN_STATE.quests[gk][qk].unlocked = saved.unlocked || false;
            GEN_STATE.quests[gk][qk].completed = saved.completed || false;
          } else if (typeof saved === 'number') {
            // 兼容旧存档：只有 stage 数字
            GEN_STATE.quests[gk][qk].stage = saved;
            GEN_STATE.quests[gk][qk].unlocked = true;
            if (saved >= GEN_GENERALS[gk].quests[qk].stages.length) {
              GEN_STATE.quests[gk][qk].completed = true;
            }
          }
        }
      }
      // 保证状态链式正确：如果某条已完成但下一条未解锁，补上解锁
      for (let i = 0; i < qKeys.length - 1; i++) {
        const cur = GEN_STATE.quests[gk][qKeys[i]];
        const next = GEN_STATE.quests[gk][qKeys[i + 1]];
        if (cur && cur.completed && next && !next.unlocked) {
          next.unlocked = true;
        }
      }
    }
    for (const k in GEN_CURDATA) {
      if (data['cur_' + k] !== undefined) GEN_CUR.values['gen_' + k] = data['cur_' + k];
    }
  },
  hardReset() {
    for (const gk in GEN_GENERALS) {
      const qKeys = Object.keys(GEN_GENERALS[gk].quests);
      for (let i = 0; i < qKeys.length; i++) {
        GEN_STATE.quests[gk][qKeys[i]].stage = 0;
        GEN_STATE.quests[gk][qKeys[i]].completed = false;
        GEN_STATE.quests[gk][qKeys[i]].unlocked = (i === 0);
      }
    }
    for (const k in GEN_CURDATA) GEN_CUR.values['gen_' + k] = 0;
    GEN_MODULE.STAT.values.gen_questsCompleted.value = 0;
    GEN_MODULE.STAT.values.gen_stagesCleared.value = 0;
  },
  onAfterLoad() {},
};

/* ======= 注册 ======= */
if (typeof GB_MODULES !== 'undefined') {
  GB_MODULES.register({
    id: 'general', name: '圣人指引', keyPrefix: 'gen', tickSpeed: 1,
    unlockNeeded: 'generalFeature',   // globalLevel >= 100
    core: GEN_MODULE,
  });
}

if (typeof window !== 'undefined') {
  window.GEN_MODULE = GEN_MODULE;
  window.GEN_CUR = GEN_CUR;
  window.GEN_STAT_MAP = GEN_STAT_MAP;
}
