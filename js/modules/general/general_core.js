/* ============================================================
 * general_core.js —— 「仙尊指引（general）」模块
 *
 * 移植自 gooboo src/js/modules/general.js + src/store/general.js
 * 修仙化改写：
 *   grobodal  → 元始天尊 (yuanshi)
 *   orladee   → 通天教主 (tongtian)
 *   oppenschroe → 接引道人 (jieyin)
 *   bellux    → 准提道人 (zhundi)
 *   onoclua   → 瑶池圣母 (yaochi)
 *   omnisolix → 昊天上帝 (haotian)
 *
 * 12 仙尊：10 活跃 + 2 预留
 *   元始天尊、女娲、神农、通天教主、轩辕、伏羲、
 *   鸿钧、太上老君、接引、准提 —— 活跃
 *   昊天上帝、瑶池圣母 —— 预留
 *
 * 模块定位：任务链驱动的指引系统，完成阶段获得辅助货币奖励。
 * 解锁条件：generalFeature（globalLevel >= 100）
 *
 * 核心玩法循环：
 *   1) tick 扫描所有已解锁仙尊的任务阶段
 *   2) 任务类型：stat / unlock / upgrade
 *   3) 阶段完成 → grantCur() 路由到对应模块 CUR 发奖励
 *   4) 最后一阶段完成 → 任务链结束
 *
 * 任务链解锁：
 *   - 每个仙尊的第一个任务（quest1）初始解锁
 *   - 后续任务（quest2+）在前一任务完成时解锁（nextUnlock 机制）
 *   - 仙尊自身的 unlock 字段绑定其关联 Feature
 * ============================================================ */

/* ============================================================
 * 1. 跨模块 stat key 映射表
 *    general tick 读取 stat 时，通过 GB_MODULES.stat() / cur() 查询
 *    这里列出各任务会用到的 stat key，方便查阅和维护
 * ============================================================ */
const GEN_STAT_MAP = {
  // 灵脉 lm
  lm_maxDepth0: { prefix: 'lm', desc: '灵气第一层最大深度' },
  lm_maxDepth1: { prefix: 'lm', desc: '灵气第二层最大深度（气态）' },
  lm_timeSpent: { prefix: 'lm', desc: '灵脉累计修炼时间' },
  lm_relicActivesUsed: { prefix: 'lm', desc: '灵脉神器主动技能使用次数' },

  // 宗门 village
  village_maxBuilding: { prefix: 'village', desc: '宗门最大建筑等级总和' },
  village_stone: { prefix: 'village', desc: '宗门灵石存量' },
  village_timeSpent: { prefix: 'village', desc: '宗门累计停留时间' },
  village_relicActivesUsed: { prefix: 'village', desc: '宗门神器主动技能使用次数' },
  village_maxHousing: { prefix: 'village', desc: '宗门总住房量' },

  // 降妖 horde
  horde_maxZone: { prefix: 'horde', desc: '降妖最高区域' },
  horde_maxZoneTotal: { prefix: 'horde', desc: '降妖最高区域总数' },
  horde_totalDamage: { prefix: 'horde', desc: '降妖累计总伤害' },
  horde_maxMastery: { prefix: 'horde', desc: '装备最高精通等级' },
  horde_totalMastery: { prefix: 'horde', desc: '装备精通累计等级' },
  horde_maxItems: { prefix: 'horde', desc: '降妖装备数量上限' },
  horde_relicActivesUsed: { prefix: 'horde', desc: '降妖神器主动技能使用次数' },

  // 农场 farm
  farm_totalCropLevel: { prefix: 'farm', desc: '灵植总等级' },
  farm_bestPrestige: { prefix: 'farm', desc: '农场最高声望' },
  farm_maxOvergrow: { prefix: 'farm', desc: '农场最大过度生长' },

  // 藏经阁 school
  sc_totalPoints: { prefix: 'school', desc: '藏经阁累计积分' },
  sc_goldenDustMax: { prefix: 'school', desc: '藏经阁金尘最大值' },

  // 秘境 ruin
  ru_layer: { prefix: 'ruin', desc: '秘境当前层数' },

  // 大道法则 dao — 无直接 stat key，通过 CUR 查询货币

  // 仙器 treasure (xianqi)
  xq_maxLevel: { prefix: 'xianqi', desc: '仙器最高等级' },
  xq_totalDays: { prefix: 'xianqi', desc: '仙器累计天数' },
};

/* ============================================================
 * 2. 升级项 key 映射表
 *    general tick 读取升级等级时，通过 GB_MODULES.level() 查询
 * ============================================================ */
const GEN_UPGRADE_MAP = {
  // 宗门升级（修仙化：原版 village_xxx）
  village_school: { prefix: 'village', desc: '宗门学堂' },
  village_garden: { prefix: 'village', desc: '宗门灵园' },
  village_lake: { prefix: 'village', desc: '宗门灵池' },
  village_greenhouse: { prefix: 'village', desc: '宗门温室' },
  village_waterTower: { prefix: 'village', desc: '宗门水塔' },
  village_taxOffice: { prefix: 'village', desc: '宗门税署' },
  village_darkCult: { prefix: 'village', desc: '宗门密殿' },
  village_radar: { prefix: 'village', desc: '宗门神识阵' },
  village_pyramid: { prefix: 'village', desc: '宗门金字塔' },
  village_marbleStatue: { prefix: 'village', desc: '宗门石雕' },
  village_glassBin: { prefix: 'village', desc: '宗门玻璃仓' },
  village_gemBin: { prefix: 'village', desc: '宗门宝石仓' },

  // 农场升级
  farm_seedBox: { prefix: 'farm', desc: '农场种子盒' },

  // 灵脉升级
  lm_graniteHardening: { prefix: 'lm', desc: '灵脉花岗岩强化' },
  lm_craftingCount: { prefix: 'lm', desc: '灵脉炼器次数' },
};

/* ============================================================
 * 3. 奖励货币配置 —— GEN_REWARD_CONFIG
 *    每个仙尊绑定一个主货币和一个次货币，部分有稀有货币
 *    grantCur() 根据此配置路由到对应模块 CUR.add()
 *
 * gooboo gem → 修仙化 dao 货币映射：
 *   ruby     → dao_chiyuan   （赤元）
 *   emerald  → dao_qingyuan  （青元）
 *   sapphire → dao_xuanyuan  （玄元）
 *   topaz    → dao_huangyuan （黄元）
 *   diamond  → dao_hunyuan   （混元）
 *
 * rel_power  → relic 模块 CUR（威望/神力）
 * xq_fragment → treasure/xianqi 模块 CUR（仙器碎片）
 * ============================================================ */
const GEN_REWARD_CONFIG = {
  yuanshi: {       // 元始天尊 → 灵脉
    primary: { cur: 'rel_power', module: 'relic' },
    secondary: { cur: 'xq_fragment', module: 'xianqi' },
  },
  nuwa: {          // 女娲 → 宗门
    primary: { cur: 'dao_qingyuan', module: 'dao' },
    secondary: { cur: 'rel_power', module: 'relic' },
  },
  shennong: {      // 神农 → 农场
    primary: { cur: 'dao_qingyuan', module: 'dao' },
    secondary: { cur: 'dao_qingyuan', module: 'dao' },
    // 注：题目指定 shennong primary=gem_emerald(=dao_qingyuan)
    // 为避免主副重复，secondary 改为 dao_qingyuan 的少量
  },
  tongtian: {      // 通天教主 → 降妖
    primary: { cur: 'xq_fragment', module: 'xianqi' },
    secondary: { cur: 'dao_chiyuan', module: 'dao' },
  },
  xuanyuan: {      // 轩辕 → 秘境
    primary: { cur: 'rel_power', module: 'relic' },
    secondary: { cur: 'dao_chiyuan', module: 'dao' },
    // 注：题目指定 xuanyuan secondary=gem_ruby(=dao_chiyuan)
  },
  fuxi: {          // 伏羲 → 藏经阁
    primary: { cur: 'dao_chiyuan', module: 'dao' },
    secondary: { cur: 'xq_fragment', module: 'xianqi' },
  },
  hongjun: {       // 鸿钧 → 大道法则
    primary: { cur: 'dao_hunyuan', module: 'dao' },
    secondary: { cur: 'dao_chiyuan', module: 'dao' },
    rare: { cur: 'dao_hunyuan', module: 'dao' },
  },
  laojun: {        // 太上老君 → 先天灵宝
    primary: { cur: 'xq_fragment', module: 'xianqi' },
    secondary: { cur: 'rel_power', module: 'relic' },
  },
  jieyin: {        // 接引道人 → 仙器
    primary: { cur: 'rel_power', module: 'relic' },
    secondary: { cur: 'dao_xuanyuan', module: 'dao' },
    // 注：题目指定 jieyin secondary=gem_sapphire(=dao_xuanyuan)
  },
  zhundi: {        // 准提道人 → 综合全局
    primary: { cur: 'dao_huangyuan', module: 'dao' },
    secondary: { cur: 'dao_chiyuan', module: 'dao' },
    // 注：题目指定 zhundi primary=gem_topaz(=dao_huangyuan)
  },
  haotian: null,   // 昊天上帝 → 预留
  yaochi: null,    // 瑶池圣母 → 预留
};

/* ============================================================
 * 4. grantCur() —— 奖励发放核心函数
 *    根据仙尊 key 和奖励配置，路由到对应模块 CUR.add()
 *
 *    @param {string} sageKey    仙尊 key (如 'yuanshi')
 *    @param {string} kind       'primary' | 'secondary' | 'rare'
 *    @param {number} amount     发放数量
 * ============================================================ */
function grantCur(sageKey, kind, amount) {
  if (!amount || amount <= 0) return;
  const cfg = GEN_REWARD_CONFIG[sageKey];
  if (!cfg) return;
  const reward = cfg[kind];
  if (!reward) return;

  // 通过 GB_MODULES 找到模块，调用其 CUR.add()
  try {
    const mod = GB_MODULES.get(reward.module);
    if (!mod || !mod.core || !mod.core.CUR) return;
    const curKey = reward.cur.indexOf('_') >= 0 ? reward.cur : (reward.module + '_' + reward.cur);
    mod.core.CUR.add(curKey, amount);
  } catch (e) {
    // 单模块异常静默忽略，不阻断整个 tick
    if (typeof console !== 'undefined') console.warn('[general] grantCur 失败:', sageKey, kind, e);
  }
}

/* ============================================================
 * 5. GEN_GENERALS —— 12 仙尊完整任务链定义
 *    每个仙尊包含：
 *      - name:      中文名
 *      - unlock:    Feature 解锁 key（null = 随 generalFeature 一起）
 *      - quests:    任务链对象，按顺序解锁
 *        - quest1:  null unlock（初始解锁）
 *        - quest2+: unlock = 前一个任务 key（完成后解锁）
 *
 *    每个 quest 包含：
 *      - name:      任务中文名
 *      - unlock:    null（初始解锁）或前一任务 key
 *      - stages[]:  阶段数组，每阶段有 tasks[]
 *        - tasks[].type: 'stat' | 'unlock' | 'upgrade'
 *        - tasks[].subtype: 'current' | 'total' | 'level'
 *        - tasks[].name:  stat / unlock / upgrade key
 *        - tasks[].operator: '>=' | '<=' | '==' | '>' | '<'
 *        - tasks[].value:  比较值
 *      - reward:    { merit: 功德点数, primary: 主奖励倍率, secondary: 次奖励倍率 }
 *      - story:     任务故事叙述（中文，IIFE 注入）
 * ============================================================ */
const GEN_GENERALS = {

  /* ============ 元始天尊 (yuanshi) — 灵脉 Feature ============ */
  yuanshi: {
    name: '元始天尊',
    unlock: 'lmFeature',
    quests: {
      quest1: {
        name: '初入灵脉',
        unlock: null,
        story: '', // IIFE 注入
        reward: { merit: 100, primary: 1, secondary: 1 },
        stages: [
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'lm_maxDepth0', operator: '>=', value: 5 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'lm_maxDepth0', operator: '>=', value: 15 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'lm_maxDepth0', operator: '>=', value: 30 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'lm_maxDepth0', operator: '>=', value: 50 },
          ]},
        ],
      },
      quest2: {
        name: '灵气汇通',
        unlock: 'quest1',
        story: '',
        reward: { merit: 200, primary: 2, secondary: 2 },
        stages: [
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'lm_maxDepth0', operator: '>=', value: 80 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'lm_maxDepth1', operator: '>=', value: 10 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'lm_maxDepth0', operator: '>=', value: 120 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'lm_maxDepth1', operator: '>=', value: 30 },
          ]},
        ],
      },
      quest3: {
        name: '混元一气',
        unlock: 'quest2',
        story: '',
        reward: { merit: 400, primary: 4, secondary: 4 },
        relic: 'torch',
        stages: [
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'lm_maxDepth0', operator: '>=', value: 180 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'lm_maxDepth1', operator: '>=', value: 60 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'lm_maxDepth0', operator: '>=', value: 260 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'lm_maxDepth1', operator: '>=', value: 100 },
          ]},
        ],
      },
    },
  },

  /* ============ 女娲 (nuwa) — 宗门 Feature ============ */
  nuwa: {
    name: '女娲',
    unlock: 'villFeature',
    quests: {
      quest1: {
        name: '立宗开派',
        unlock: null,
        story: '',
        reward: { merit: 100, primary: 1, secondary: 1 },
        stages: [
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'village_maxBuilding', operator: '>=', value: 50 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'village_maxBuilding', operator: '>=', value: 120 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'village_maxBuilding', operator: '>=', value: 200 },
          ]},
        ],
      },
      quest2: {
        name: '炼石补天',
        unlock: 'quest1',
        story: '',
        reward: { merit: 250, primary: 2, secondary: 2 },
        stages: [
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'village_maxBuilding', operator: '>=', value: 350 },
          ]},
          { tasks: [
            { type: 'upgrade', subtype: 'total', name: 'village_school', operator: '>=', value: 3 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'village_maxBuilding', operator: '>=', value: 550 },
          ]},
        ],
      },
      quest3: {
        name: '聚灵成阵',
        unlock: 'quest2',
        story: '',
        reward: { merit: 500, primary: 4, secondary: 4 },
        relic: 'woodenSword',
        stages: [
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'village_maxBuilding', operator: '>=', value: 800 },
          ]},
          { tasks: [
            { type: 'upgrade', subtype: 'total', name: 'village_taxOffice', operator: '>=', value: 5 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'village_maxBuilding', operator: '>=', value: 1100 },
          ]},
        ],
      },
    },
  },

  /* ============ 神农 (shennong) — 农场 Feature ============ */
  shennong: {
    name: '神农',
    unlock: 'faFeature',
    quests: {
      quest1: {
        name: '百草尝遍',
        unlock: null,
        story: '',
        reward: { merit: 100, primary: 1, secondary: 1 },
        stages: [
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'farm_totalCropLevel', operator: '>=', value: 10 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'farm_bestPrestige', operator: '>=', value: 3 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'farm_totalCropLevel', operator: '>=', value: 25 },
          ]},
        ],
      },
      quest2: {
        name: '药园初开',
        unlock: 'quest1',
        story: '',
        reward: { merit: 250, primary: 2, secondary: 2 },
        stages: [
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'farm_totalCropLevel', operator: '>=', value: 50 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'farm_maxOvergrow', operator: '>=', value: 10 },
          ]},
          { tasks: [
            { type: 'upgrade', subtype: 'total', name: 'farm_seedBox', operator: '>=', value: 5 },
          ]},
        ],
      },
      quest3: {
        name: '灵植大成',
        unlock: 'quest2',
        story: '',
        reward: { merit: 500, primary: 4, secondary: 4 },
        relic: 'goldenCarrot',
        stages: [
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'farm_totalCropLevel', operator: '>=', value: 100 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'farm_bestPrestige', operator: '>=', value: 20 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'farm_totalCropLevel', operator: '>=', value: 200 },
          ]},
        ],
      },
    },
  },

  /* ============ 通天教主 (tongtian) — 降妖 Feature ============ */
  tongtian: {
    name: '通天教主',
    unlock: 'hoFeature',
    quests: {
      quest1: {
        name: '万仙来朝',
        unlock: null,
        story: '',
        reward: { merit: 150, primary: 1, secondary: 1 },
        stages: [
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'horde_maxZone', operator: '>=', value: 20 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'horde_maxZone', operator: '>=', value: 40 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'horde_maxZone', operator: '>=', value: 60 },
          ]},
        ],
      },
      quest2: {
        name: '诛仙剑阵',
        unlock: 'quest1',
        story: '',
        reward: { merit: 300, primary: 2, secondary: 2 },
        stages: [
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'horde_maxZone', operator: '>=', value: 80 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'horde_totalMastery', operator: '>=', value: 50 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'horde_maxZone', operator: '>=', value: 110 },
          ]},
        ],
      },
      quest3: {
        name: '重立地水火风',
        unlock: 'quest2',
        story: '',
        reward: { merit: 600, primary: 4, secondary: 4 },
        relic: 'spikeBall',
        stages: [
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'horde_maxZone', operator: '>=', value: 150 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'horde_maxMastery', operator: '>=', value: 10 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'horde_maxZone', operator: '>=', value: 200 },
          ]},
        ],
      },
    },
  },

  /* ============ 轩辕 (xuanyuan) — 秘境 Feature ============ */
  xuanyuan: {
    name: '轩辕',
    unlock: 'ruFeature',
    quests: {
      quest1: {
        name: '开辟秘境',
        unlock: null,
        story: '',
        reward: { merit: 150, primary: 1, secondary: 1 },
        stages: [
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'ru_layer', operator: '>=', value: 5 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'ru_layer', operator: '>=', value: 15 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'ru_layer', operator: '>=', value: 30 },
          ]},
        ],
      },
      quest2: {
        name: '五帝争霸',
        unlock: 'quest1',
        story: '',
        reward: { merit: 350, primary: 2, secondary: 2 },
        stages: [
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'ru_layer', operator: '>=', value: 50 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'ru_layer', operator: '>=', value: 80 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'ru_layer', operator: '>=', value: 120 },
          ]},
        ],
      },
      quest3: {
        name: '九鼎定天下',
        unlock: 'quest2',
        story: '',
        reward: { merit: 700, primary: 4, secondary: 4 },
        relic: 'energyDrink',
        stages: [
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'ru_layer', operator: '>=', value: 180 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'ru_layer', operator: '>=', value: 260 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'ru_layer', operator: '>=', value: 360 },
          ]},
        ],
      },
    },
  },

  /* ============ 伏羲 (fuxi) — 藏经阁 Feature ============ */
  fuxi: {
    name: '伏羲',
    unlock: 'scFeature',
    quests: {
      quest1: {
        name: '观卦作易',
        unlock: null,
        story: '',
        reward: { merit: 120, primary: 1, secondary: 1 },
        stages: [
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'sc_totalPoints', operator: '>=', value: 1000 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'sc_totalPoints', operator: '>=', value: 5000 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'sc_totalPoints', operator: '>=', value: 20000 },
          ]},
        ],
      },
      quest2: {
        name: '河图洛书',
        unlock: 'quest1',
        story: '',
        reward: { merit: 280, primary: 2, secondary: 2 },
        stages: [
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'sc_totalPoints', operator: '>=', value: 50000 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'sc_goldenDustMax', operator: '>=', value: 5000 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'sc_totalPoints', operator: '>=', value: 150000 },
          ]},
        ],
      },
      quest3: {
        name: '八卦成象',
        unlock: 'quest2',
        story: '',
        reward: { merit: 550, primary: 4, secondary: 4 },
        relic: 'museumKey',
        stages: [
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'sc_totalPoints', operator: '>=', value: 500000 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'sc_goldenDustMax', operator: '>=', value: 30000 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'sc_totalPoints', operator: '>=', value: 1500000 },
          ]},
        ],
      },
    },
  },

  /* ============ 鸿钧 (hongjun) — 大道法则 Feature ============ */
  hongjun: {
    name: '鸿钧',
    unlock: 'daoFeature',
    quests: {
      quest1: {
        name: '紫霄讲道',
        unlock: null,
        story: '',
        reward: { merit: 200, primary: 1, secondary: 1, rare: 1 },
        stages: [
          { tasks: [
            { type: 'unlock', name: 'daoFeature' },
          ]},
          { tasks: [
            { type: 'unlock', name: 'daoGemDiamondSubfeature' },
          ]},
        ],
      },
      quest2: {
        name: '天道轮转',
        unlock: 'quest1',
        story: '',
        reward: { merit: 450, primary: 2, secondary: 2, rare: 2 },
        stages: [
          { tasks: [
            { type: 'unlock', name: 'lmGasSubfeature' },
          ]},
          { tasks: [
            { type: 'unlock', name: 'villCraftingSubfeature' },
          ]},
        ],
      },
      quest3: {
        name: '万法归一',
        unlock: 'quest2',
        story: '',
        reward: { merit: 900, primary: 4, secondary: 4, rare: 4 },
        relic: 'rubyOrb',
        stages: [
          { tasks: [
            { type: 'unlock', name: 'hoClassesSubfeature' },
          ]},
          { tasks: [
            { type: 'unlock', name: 'generalOrladeeSubfeature' },
          ]},
        ],
      },
    },
  },

  /* ============ 太上老君 (laojun) — 先天灵宝 Feature ============ */
  laojun: {
    name: '太上老君',
    unlock: 'lingbaoFeature',
    quests: {
      quest1: {
        name: '炼丹炉开',
        unlock: null,
        story: '',
        reward: { merit: 180, primary: 1, secondary: 1 },
        stages: [
          { tasks: [
            { type: 'unlock', name: 'lingbaoFeature' },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'lm_maxDepth0', operator: '>=', value: 60 },
          ]},
        ],
      },
      quest2: {
        name: '九转金丹',
        unlock: 'quest1',
        story: '',
        reward: { merit: 400, primary: 2, secondary: 2 },
        stages: [
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'lm_maxDepth0', operator: '>=', value: 120 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'horde_maxZone', operator: '>=', value: 50 },
          ]},
        ],
      },
      quest3: {
        name: '一气化三清',
        unlock: 'quest2',
        story: '',
        reward: { merit: 800, primary: 4, secondary: 4 },
        relic: 'diamondPillar',
        stages: [
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'lm_maxDepth0', operator: '>=', value: 200 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'horde_maxZone', operator: '>=', value: 120 },
          ]},
        ],
      },
    },
  },

  /* ============ 接引道人 (jieyin) — 仙器 Feature ============ */
  jieyin: {
    name: '接引道人',
    unlock: 'xianqiFeature',
    quests: {
      quest1: {
        name: '西方教立',
        unlock: null,
        story: '',
        reward: { merit: 200, primary: 1, secondary: 1 },
        stages: [
          { tasks: [
            { type: 'unlock', name: 'xianqiFeature' },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'xq_maxLevel', operator: '>=', value: 5 },
          ]},
        ],
      },
      quest2: {
        name: '佛光普照',
        unlock: 'quest1',
        story: '',
        reward: { merit: 450, primary: 2, secondary: 2 },
        stages: [
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'xq_maxLevel', operator: '>=', value: 15 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'xq_totalDays', operator: '>=', value: 50 },
          ]},
        ],
      },
      quest3: {
        name: '大乘圆满',
        unlock: 'quest2',
        story: '',
        reward: { merit: 900, primary: 4, secondary: 4 },
        relic: 'keychain',
        stages: [
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'xq_maxLevel', operator: '>=', value: 30 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'xq_totalDays', operator: '>=', value: 150 },
          ]},
        ],
      },
    },
  },

  /* ============ 准提道人 (zhundi) — 综合全局 Feature ============ */
  zhundi: {
    name: '准提道人',
    unlock: 'generalFeature',
    quests: {
      quest1: {
        name: '七十二变',
        unlock: null,
        story: '',
        reward: { merit: 250, primary: 1, secondary: 1 },
        stages: [
          { tasks: [
            { type: 'unlock', name: 'generalFeature' },
          ]},
          { tasks: [
            { type: 'unlock', name: 'daoFeature' },
          ]},
          { tasks: [
            { type: 'unlock', name: 'scFeature' },
          ]},
        ],
      },
      quest2: {
        name: '法天象地',
        unlock: 'quest1',
        story: '',
        reward: { merit: 600, primary: 2, secondary: 2 },
        stages: [
          { tasks: [
            { type: 'unlock', name: 'xianqiFeature' },
          ]},
          { tasks: [
            { type: 'unlock', name: 'ruFeature' },
          ]},
          { tasks: [
            { type: 'unlock', name: 'hoFeature' },
          ]},
        ],
      },
      quest3: {
        name: '万法归元',
        unlock: 'quest2',
        story: '',
        reward: { merit: 1200, primary: 4, secondary: 4 },
        relic: 'popcorn',
        stages: [
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'lm_maxDepth0', operator: '>=', value: 100 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'village_maxBuilding', operator: '>=', value: 500 },
          ]},
          { tasks: [
            { type: 'stat', subtype: 'total', name: 'horde_maxZone', operator: '>=', value: 100 },
          ]},
        ],
      },
    },
  },

  /* ============ 昊天上帝 (haotian) — 预留 ============ */
  haotian: {
    name: '昊天上帝',
    unlock: null,
    quests: {
      // 预留，未来扩展
    },
  },

  /* ============ 瑶池圣母 (yaochi) — 预留 ============ */
  yaochi: {
    name: '瑶池圣母',
    unlock: null,
    quests: {
      // 预留，未来扩展
    },
  },
};

/* ============================================================
 * 6. GEN_LORE — 12 仙尊入场语（中文）
 *    玩家首次解锁某仙尊时显示的引言
 * ============================================================ */
const GEN_LORE = {
  yuanshi: '吾乃元始天尊。灵气归墟之处，便是修炼之始。深度愈深，道心愈坚。',
  nuwa: '吾乃女娲。天地有缺，炼石补之；众生有难，立宗庇之。建宗立业，始自毫末。',
  shennong: '吾乃神农。百草千般，皆可入药。尝遍万植，方能得济世之方。',
  tongtian: '吾乃通天教主。有教无类，万仙来朝。诛仙剑阵，非四圣不可破。',
  xuanyuan: '吾乃轩辕。开疆拓土，创五帝之基。秘境之中，藏九鼎之秘。',
  fuxi: '吾乃伏羲。仰观天象，俯察地理。八卦成象，万物皆在其中。',
  hongjun: '吾乃鸿钧。紫霄宫内，讲道三千。天道轮转，唯悟者得之。',
  laojun: '吾乃太上老君。九转金丹，一气化三清。炼丹炉中，藏造化之机。',
  jieyin: '吾乃接引道人。西方教立，佛光普照。大乘圆满，方见真如。',
  zhundi: '吾乃准提道人。七十二变，法天象地。万法归元，一即是万。',
  haotian: '吾乃昊天上帝。执掌天庭，统御万灵。（尚未现世）',
  yaochi: '吾乃瑶池圣母。蟠桃盛会，仙凡同庆。（尚未现世）',
};

/* ============================================================
 * 7. IIFE — 注入 lore + stories 到 quests
 *    将 GEN_LORE 和故事文本注入 GEN_GENERALS 对应字段
 *    保持 GEN_GENERALS 定义时简洁，同时让最终结构完整
 * ============================================================ */
(function injectLoreAndStories() {
  // 给每个仙尊注入 lore 字段
  for (const sk in GEN_GENERALS) {
    if (GEN_LORE[sk]) {
      GEN_GENERALS[sk].lore = GEN_LORE[sk];
    }
  }

  // 每个仙尊的任务故事（短叙事，中文）
  const STORIES = {
    yuanshi: {
      quest1: '灵气初引，深度渐深。元始天尊在灵气源头等候有缘人。',
      quest2: '灵气汇通上下两层，混元之气在深处涌动。',
      quest3: '混元一气冲霄而上，天地之间唯留此道。',
    },
    nuwa: {
      quest1: '立宗开派，广收门徒。女娲以补天之力庇护宗门。',
      quest2: '天有缺，炼石以补之。宗门渐兴，需更多建筑支撑。',
      quest3: '聚灵成阵，护佑一方。宗门规模已成，道统可传万世。',
    },
    shennong: {
      quest1: '百草尝遍，分辨药性。神农亲尝百草以寻济世之方。',
      quest2: '药园初开，灵植渐丰。神农的药园引来四方修士。',
      quest3: '灵植大成，灵药可炼。神农之道，在于生生不息。',
    },
    tongtian: {
      quest1: '万仙来朝，诛仙剑阵初成。通天教主有教无类，门下弟子众多。',
      quest2: '诛仙剑阵运转，杀气弥漫。非四圣不可破此阵。',
      quest3: '重立地水火风，再造乾坤。通天教主欲以一己之力改写天道。',
    },
    xuanyuan: {
      quest1: '开辟秘境，探索未知。轩辕率队踏入秘境，寻找九鼎。',
      quest2: '五帝争霸，秘境之中暗流涌动。九鼎散落在秘境各处。',
      quest3: '九鼎归位，天下大定。轩辕之功勋，刻于九鼎之上。',
    },
    fuxi: {
      quest1: '仰观天象，俯察地理。伏羲观察自然，始作八卦。',
      quest2: '河图洛书出，八卦成。伏羲将天地之理载入藏经阁。',
      quest3: '八卦成象，万物皆在其中。伏羲之道，在于通神明之德。',
    },
    hongjun: {
      quest1: '紫霄宫开，鸿钧讲道。三千紫霄宫听道者，皆成大能。',
      quest2: '天道轮转，纪元更替。鸿钧冷眼旁观，天道自有定数。',
      quest3: '万法归一，道之始终。鸿钧之道，在于无为无不为。',
    },
    laojun: {
      quest1: '炼丹炉开，神火燃起。太上老君的八卦炉中，藏着化腐朽为神奇的力量。',
      quest2: '九转金丹成，服之长生。老君炼就金丹，赐予有缘人。',
      quest3: '一气化三清，老君显化。太清、玉清、上清，三位老君同时现身。',
    },
    jieyin: {
      quest1: '西方教立，接引道人开宗。西方教以慈悲为怀，普度众生。',
      quest2: '佛光普照，接引之光笼罩大地。接引道人手托金莲，接引众生。',
      quest3: '大乘圆满，功德无量。接引之道，在于大慈大悲。',
    },
    zhundi: {
      quest1: '七十二变，变化莫测。准提道人精通七十二般变化之术。',
      quest2: '法天象地，神通广大。准提道人可大可小，随心变化。',
      quest3: '万法归元，一即是万。准提之道，在于融会贯通。',
    },
    haotian: {},
    yaochi: {},
  };

  // 注入到 GEN_GENERALS
  for (const sk in STORIES) {
    const sData = STORIES[sk];
    const general = GEN_GENERALS[sk];
    if (!general || !general.quests) continue;
    for (const qk in sData) {
      if (general.quests[qk]) {
        general.quests[qk].story = sData[qk];
      }
    }
  }
})();

/* ============================================================
 * 8. GEN_STATE —— 模块内部状态
 *    记录每个仙尊每个任务的当前阶段（stage 从 0 开始）
 * ============================================================ */
const GEN_STATE = {
  // { [sageKey]: { [questKey]: { stage: 0, completed: false } } }
  progress: {},

  // quests —— 视图层兼容 getter（GEN_STATE.quests[gk][qk].unlocked）
  // 从 progress 镜像 + 动态计算 unlocked 状态
  get quests() {
    const result = {};
    for (const sk in this.progress) {
      const g = this.progress[sk];
      const gen = GEN_GENERALS[sk];
      if (!gen) continue;
      result[sk] = {};
      const qKeys = Object.keys(gen.quests);
      qKeys.forEach((qk, idx) => {
        const prog = g[qk] || { stage: 0, completed: false };
        let unlocked = true;
        const quest = gen.quests[qk];
        if (quest.unlock === null) {
          unlocked = true;
        } else if (typeof quest.unlock === 'string') {
          if (quest.unlock.endsWith('Feature') || quest.unlock.endsWith('Subfeature')) {
            unlocked = typeof GB_UNLOCK === 'undefined' ? true : GB_UNLOCK.isUnlocked(quest.unlock);
          } else {
            // 前置 quest key —— 前置必须完成
            const prevKeys = Object.keys(gen.quests);
            const prevIdx = prevKeys.indexOf(qk) - 1;
            if (prevIdx >= 0) {
              const prevKey = prevKeys[prevIdx];
              const prevProg = g[prevKey];
              const prevQuest = gen.quests[prevKey];
              if (prevProg && prevQuest) {
                unlocked = prevProg.stage >= prevQuest.stages.length || prevProg.completed;
              }
            }
          }
        }
        result[sk][qk] = { ...prog, unlocked };
      });
    }
    return result;
  }
};

// 初始化 GEN_STATE —— 从 GEN_GENERALS 构建状态骨架
function initGenState() {
  GEN_STATE.progress = {};
  for (const sk in GEN_GENERALS) {
    const g = GEN_GENERALS[sk];
    GEN_STATE.progress[sk] = {};
    for (const qk in g.quests) {
      GEN_STATE.progress[sk][qk] = { stage: 0, completed: false };
    }
  }
}

// 立即初始化
initGenState();

/* ============================================================
 * 9. GEN_MODULE —— 仙尊指引核心模块对象
 *    对外统一接口：tick / snapshot / restore / hardReset
 *
 *    tick 逻辑（对齐 gooboo general.js）：
 *      遍历所有仙尊 → 检查仙尊 unlock → 遍历 quests → 检查 quest unlock
 *      → 检查任务是否可完成 → 推进 stage → 发奖励
 *
 *    任务完成判定（对齐 gooboo store/general.js）：
 *      1) stage < stages.length
 *      2) 当前 stage 的所有 tasks 都满足条件
 *      3) stage++，发奖励
 *
 *    奖励发放规则：
 *      - 每完成一个 stage：发 merit（功德）
 *      - 最后一个 stage 完成：发 primary + secondary + rare 货币
 * ============================================================ */
const GEN_MODULE = {
  name: 'general',
  keyPrefix: 'gen',

  // 对外暴露 —— 视图层读取
  GENERALS: GEN_GENERALS,
  LORE: GEN_LORE,
  REWARD_CONFIG: GEN_REWARD_CONFIG,
  STATE: GEN_STATE,

  /* tick —— 仙尊指引每帧扫描 */
  RT: {
    tick() {
      if (typeof GB_MODULES === 'undefined') return;

      for (const sk in GEN_GENERALS) {
        const g = GEN_GENERALS[sk];
        const gState = GEN_STATE.progress[sk];
        if (!gState) continue;

        // 检查仙尊是否解锁
        if (g.unlock && typeof GB_UNLOCK !== 'undefined' && !GB_UNLOCK.isUnlocked(g.unlock)) continue;

        // 遍历 quests
        for (const qk in g.quests) {
          const quest = g.quests[qk];
          const qState = gState[qk];
          if (!qState) continue;

          // 检查任务是否解锁
          if (quest.unlock !== null && qState.stage === 0) {
            // 只有当前置任务已完成（stage >= stages.length）才解锁
            // 这是"任务链顺序解锁"机制
            const prevKeys = Object.keys(g.quests);
            const prevIdx = prevKeys.indexOf(qk) - 1;
            if (prevIdx >= 0) {
              const prevKey = prevKeys[prevIdx];
              const prevQuest = g.quests[prevKey];
              const prevState = gState[prevKey];
              if (!prevQuest || !prevState) continue;
              if (prevState.stage < prevQuest.stages.length) {
                continue; // 前置任务未完成，跳过
              }
            }
          }

          // 任务已完成则跳过
          if (qState.completed) continue;

          // 检查下一阶段（stage 从 0 开始，表示待完成的阶段索引）
          const totalStages = quest.stages.length;
          if (qState.stage >= totalStages) {
            qState.completed = true;
            continue;
          }

          // 判定当前阶段是否全部任务达成
          const stage = quest.stages[qState.stage];
          let allDone = true;
          for (let i = 0; i < stage.tasks.length; i++) {
            const task = stage.tasks[i];
            const curVal = GEN_MODULE._getTaskValue(task);
            if (!GEN_MODULE._compare(curVal, task.operator, task.value)) {
              allDone = false;
              break;
            }
          }

          if (allDone) {
            // 推进阶段
            qState.stage++;

            // 发奖励
            GEN_MODULE._grantStageReward(sk, quest, qState.stage, totalStages);
          }
        }
      }
    },

    afterChange() {
      // 仙尊指引无派生效果，留空
    },
  },

  /* 获取任务当前值 —— 对齐 gooboo tick() 的 switch */
  _getTaskValue(task) {
    try {
      switch (task.type) {
        case 'stat': {
          if (typeof GB_MODULES === 'undefined') return 0;
          const prefix = task.name.split('_')[0];
          const mod = GB_MODULES._byPrefix[prefix];
          if (!mod || !mod.core || !mod.core.STAT) return 0;
          const item = mod.core.STAT.values[task.name];
          if (!item) return 0;
          if (typeof item === 'number') return item;
          if (item.total !== undefined && task.subtype === 'total') return item.total;
          if (item.value !== undefined) return item.value;
          return 0;
        }
        case 'unlock': {
          if (typeof GB_UNLOCK === 'undefined') return false;
          return GB_UNLOCK.isUnlocked(task.name) ? 1 : 0;
        }
        case 'upgrade': {
          if (typeof GB_MODULES === 'undefined') return 0;
          const prefix = task.name.split('_')[0];
          const mod = GB_MODULES._byPrefix[prefix];
          if (!mod || !mod.core || !mod.core.UPG) return 0;
          const lvl = mod.core.UPG.levels;
          const upgKey = task.name;
          if (lvl[upgKey] !== undefined) return lvl[upgKey];
          // 尝试加前缀
          const fullKey = prefix + '_' + task.name;
          if (lvl[fullKey] !== undefined) return lvl[fullKey];
          return 0;
        }
        default:
          return 0;
      }
    } catch (e) {
      return 0;
    }
  },

  /* 比较运算符 —— 对齐 gooboo 的 operator 逻辑 */
  _compare(current, operator, value) {
    if (operator === undefined || operator === null) {
      // 无 operator = 布尔判定（current 非零即真）
      return !!current;
    }
    switch (operator) {
      case '>=': return current >= value;
      case '<=': return current <= value;
      case '==': return current === value || (current === value ? true : false);
      case '>':  return current > value;
      case '<':  return current < value;
      default:   return current == value;
    }
  },

  /* 阶段奖励发放 */
  _grantStageReward(sageKey, quest, completedStage, totalStages) {
    const reward = quest.reward;
    if (!reward) return;

    // 功德（每阶段都发，递增）
    // merit 按阶段比例发放：最后一阶段发满额
    const meritGain = Math.ceil((reward.merit || 0) * (completedStage / totalStages));
    if (meritGain > 0) {
      // 功德暂不做跨模块路由，存入 GENERAL_STATE.merit 供视图展示
      GEN_MODULE.merit = (GEN_MODULE.merit || 0) + meritGain;
    }

    // 最后一阶段 —— 发货币奖励
    if (completedStage >= totalStages) {
      const multPrimary = reward.primary || 1;
      const multSecondary = reward.secondary || 1;

      // 主奖励 —— 按 merit 数量的平方根发放
      const baseAmount = Math.sqrt(reward.merit || 100) * 2;
      grantCur(sageKey, 'primary', Math.floor(baseAmount * multPrimary));
      grantCur(sageKey, 'secondary', Math.floor(baseAmount * multSecondary));

      // 稀有奖励（如鸿钧）
      if (reward.rare) {
        grantCur(sageKey, 'rare', Math.floor(baseAmount * reward.rare * 0.5));
      }

      // 遗物奖励（对齐 gooboo store/general.js giveReward：任务链最后一阶段送 relic）
      if (quest.relic && typeof REL_MODULE !== 'undefined' && typeof REL_MODULE.find === 'function') {
        try { REL_MODULE.find(quest.relic); } catch (e) { /* 单模块异常不阻断奖励发放 */ }
      }
    }
  },

  // 累计功德（供视图展示）
  merit: 0,

  // STAT —— 供视图 renderHeader 读取
  // 视图层访问 GEN_MODULE.STAT.values.gen_stagesCleared.value
  // 这是 computed（从 GEN_STATE.progress 现场计算），不需要 tick 手动维护
  STAT: {
    get values() {
      let stagesCleared = 0, questsCompleted = 0;
      for (const sk in GEN_STATE.progress) {
        const g = GEN_STATE.progress[sk];
        for (const qk in g) {
          const q = g[qk];
          if (q.completed) {
            questsCompleted++;
            stagesCleared += (GEN_GENERALS[sk]?.quests[qk]?.stages?.length || 0);
          } else {
            stagesCleared += q.stage || 0;
          }
        }
      }
      return {
        gen_stagesCleared: { value: stagesCleared },
        gen_questsCompleted: { value: questsCompleted }
      };
    }
  },

  // checkTask —— 供视图层查询单任务进度
  checkTask(task) {
    const curVal = this._getTaskValue(task);
    return this._compare(curVal, task.operator || task.op || '>=', task.value);
  },

  /* ============ 存档钩子 ============ */

  /* snapshot —— 导出当前进度 */
  snapshot() {
    const obj = {};
    for (const sk in GEN_GENERALS) {
      const g = GEN_GENERALS[sk];
      const gState = GEN_STATE.progress[sk];
      if (!gState) continue;
      const gObj = {};
      for (const qk in g.quests) {
        const qState = gState[qk];
        if (!qState) continue;
        if (qState.stage > 0 || qState.completed) {
          gObj[qk] = { stage: qState.stage, completed: qState.completed };
        }
      }
      if (Object.keys(gObj).length > 0) obj[sk] = gObj;
    }
    if (this.merit > 0) obj._merit = this.merit;
    return obj;
  },

  /* restore —— 恢复存档进度 */
  restore(data) {
    if (!data || typeof data !== 'object') return;
    initGenState();

    for (const sk in data) {
      if (sk === '_merit') {
        this.merit = data._merit || 0;
        continue;
      }
      const gState = GEN_STATE.progress[sk];
      if (!gState) continue;
      const gData = data[sk];
      for (const qk in gData) {
        if (gState[qk]) {
          gState[qk].stage = gData[qk].stage || 0;
          gState[qk].completed = !!gData[qk].completed;
        }
      }
    }
  },

  /* hardReset —— 完全重置 */
  hardReset() {
    initGenState();
    this.merit = 0;
  },

  /* ============ 便捷查询 ============ */

  /* 查询某仙尊某任务的解锁状态 */
  isQuestUnlocked(sageKey, questKey) {
    const g = GEN_GENERALS[sageKey];
    if (!g || !g.quests[questKey]) return false;
    const q = g.quests[questKey];

    // 仙尊本身是否解锁
    if (g.unlock && typeof GB_UNLOCK !== 'undefined' && !GB_UNLOCK.isUnlocked(g.unlock)) return false;

    // 第一个任务初始解锁
    if (q.unlock === null) return true;

    // 后续任务：前置任务完成
    const prevKeys = Object.keys(g.quests);
    const idx = prevKeys.indexOf(questKey);
    if (idx <= 0) return true;
    const prevKey = prevKeys[idx - 1];
    const prevQuest = g.quests[prevKey];
    const prevState = GEN_STATE.progress[sageKey] && GEN_STATE.progress[sageKey][prevKey];
    if (!prevQuest || !prevState) return false;
    return prevState.stage >= prevQuest.stages.length;
  },

  /* 查询某仙尊的所有已解锁任务 */
  getUnlockedQuests(sageKey) {
    const g = GEN_GENERALS[sageKey];
    if (!g) return [];
    const result = [];
    for (const qk in g.quests) {
      if (this.isQuestUnlocked(sageKey, qk)) result.push(qk);
    }
    return result;
  },

  /* 查询任务完成百分比（0-100） */
  getQuestProgress(sageKey, questKey) {
    const g = GEN_GENERALS[sageKey];
    const gState = GEN_STATE.progress[sageKey];
    if (!g || !gState) return 0;
    const quest = g.quests[questKey];
    const qState = gState[questKey];
    if (!quest || !qState) return 0;
    return Math.min(100, Math.floor((qState.stage / quest.stages.length) * 100));
  },

  /* 查询某仙尊整体进度（所有任务平均完成度） */
  getGeneralProgress(sageKey) {
    const g = GEN_GENERALS[sageKey];
    const gState = GEN_STATE.progress[sageKey];
    if (!g || !gState) return 0;
    const quests = Object.keys(g.quests);
    if (quests.length === 0) return 0;
    let totalPct = 0;
    let count = 0;
    for (const qk of quests) {
      if (g.quests[qk].unlock !== null && !this.isQuestUnlocked(sageKey, qk)) continue;
      totalPct += this.getQuestProgress(sageKey, qk);
      count++;
    }
    return count > 0 ? Math.floor(totalPct / count) : 0;
  },
};

/* ============================================================
 * 10. 注册到 GB_MODULES
 *     tickSpeed: 1（与 gooboo 一致，每秒扫描一次任务完成）
 *     unlockNeeded: 'generalFeature'（仙尊指引本身需要解锁条件）
 * ============================================================ */
if (typeof GB_MODULES !== 'undefined') {
  GB_MODULES.register({
    id: 'general',
    name: '仙尊指引',
    keyPrefix: 'gen',
    tickSpeed: 1,
    unlockNeeded: null, // 内部自行检查 g.unlock，模块本身始终注册
    core: GEN_MODULE,
  });
}

/* 暴露到全局作用域（供 console 调试和视图层引用） */
if (typeof window !== 'undefined') {
  window.GEN_MODULE = GEN_MODULE;
  window.GEN_GENERALS = GEN_GENERALS;
  window.GEN_LORE = GEN_LORE;
  window.GEN_REWARD_CONFIG = GEN_REWARD_CONFIG;
  window.GEN_STATE = GEN_STATE;
  window.grantCur = grantCur;
}
