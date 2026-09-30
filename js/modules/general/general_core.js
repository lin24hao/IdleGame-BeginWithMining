/* ============================================================
 * general_core.js — 仙尊指引模块（generalFeature 修仙化移植）
 *
 * 核心机制（对齐 gooboo src/js/modules/general.js）：
 *   tick 速度 = 1（每秒 tick）
 *   扫仙尊 quest → 每个 stage 的 tasks 条件都满足 → complete → giveReward
 *
 * 6 位仙尊（修仙化命名）：
 *   元始天尊  grobodal      （基础，随 generalFeature 解锁）
 *   通天教主  orladee       （基础）
 *   太上老君  oppenschroe   （generalOppenschroeSubfeature）
 *   接引道人  bellux        （generalBelluxSubfeature）
 *   准提道人  onoclua       （generalOnocluaSubfeature）
 *   瑶池圣母  omnisolix     （generalOmnisolixSubfeature）
 *
 * 任务条件类型：stat（模块 stat 值）、unlock（Feature 解锁）
 * 奖励：简化为"功德"currency + 简单的 multiplier
 *
 * 解锁条件：generalFeature（globalLevel >= 100）
 * ============================================================ */

// ======= 6 位仙尊定义 =======
const GEN_GENERALS = {
  yuanshi: {    // 元始天尊
    name: '元始天尊', icon: 'mdi-crown',
    unlock: null,  // 随 generalFeature 解锁
    quests: {
      dao: {
        name: '大道初成',
        unlock: null,
        stages: [
          { tasks: [{ type: 'unlock', name: 'daoFeature', op: '==', value: true }], reward: { merit: 10 } },
          { tasks: [{ type: 'unlock', name: 'villFeature', op: '==', value: true }], reward: { merit: 20 } },
          { tasks: [{ type: 'stat', feature: 'lm', name: 'lm_maxDepth0', op: '>=', value: 50 }], reward: { merit: 50 } },
        ],
      },
    },
  },
  tongtian: {   // 通天教主
    name: '通天教主', icon: 'mdi-lightning-bolt',
    unlock: null,
    quests: {
      fa: {
        name: '灵植初探',
        unlock: null,
        stages: [
          { tasks: [{ type: 'unlock', name: 'faFeature', op: '==', value: true }], reward: { merit: 10 } },
          { tasks: [{ type: 'unlock', name: 'hoFeature', op: '==', value: true }], reward: { merit: 20 } },
          { tasks: [{ type: 'unlock', name: 'ruFeature', op: '==', value: true }], reward: { merit: 100 } },
        ],
      },
    },
  },
  laojun: {     // 太上老君
    name: '太上老君', icon: 'mdi-flask',
    unlock: 'generalOppenschroeSubfeature',
    quests: { alchemy: { name: '炼丹之道', unlock: null, stages: [
      { tasks: [{ type: 'unlock', name: 'daoGemDiamondSubfeature', op: '==', value: true }], reward: { merit: 30 } },
    ]}},
  },
  yinjie: {     // 接引道人
    name: '接引道人', icon: 'mdi-hand-heart',
    unlock: 'generalBelluxSubfeature',
    quests: { mercy: { name: '普度众生', unlock: null, stages: [
      { tasks: [{ type: 'stat', feature: 'vill', name: 'village_maxHousing', op: '>=', value: 50 }], reward: { merit: 50 } },
    ]}},
  },
  zhundi: {     // 准提道人
    name: '准提道人', icon: 'mdi-pray',
    unlock: 'generalOnocluaSubfeature',
    quests: { wisdom: { name: '智慧通达', unlock: null, stages: [
      { tasks: [{ type: 'unlock', name: 'scFeature', op: '==', value: true }], reward: { merit: 40 } },
    ]}},
  },
  yaochi: {     // 瑶池圣母
    name: '瑶池圣母', icon: 'mdi-crown-variant',
    unlock: 'generalOmnisolixSubfeature',
    quests: { immortals: { name: '仙班归位', unlock: null, stages: [
      { tasks: [{ type: 'unlock', name: 'xianqiFeature', op: '==', value: true }], reward: { merit: 80 } },
    ]}},
  },
};

// ======= 货币：功德 =======
const GEN_CURDATA = {
  merit: { name: '功德', color: '#facc15', icon: 'mdi-star', display: 'int' },
};

// ======= MULT =======
const GEN_MULT = { values: {} };
GEN_MULT.init = function(name, def) {
  if (!GEN_MULT.values[name]) GEN_MULT.values[name] = { base: def.baseValue || 1, mult: 1, bonus: 0 };
};
GEN_MULT.get = function(name) {
  const v = GEN_MULT.values[name]; if (!v) return 1;
  return v.base * v.mult + v.bonus;
};

// ======= CUR =======
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

// ======= 任务完成记录 =======
const GEN_STATE = {
  // { yuanshi: { dao: { stage: 1, completed: true } }, ... }
  quests: {},
};

// 初始化 quests 结构
for (const gk in GEN_GENERALS) {
  GEN_STATE.quests[gk] = {};
  for (const qk in GEN_GENERALS[gk].quests) {
    GEN_STATE.quests[gk][qk] = { stage: 0, completed: false };
  }
}

// ======= 条件检查 =======
function checkTask(task) {
  // 1. unlock 检查
  if (task.type === 'unlock') {
    if (typeof GB_UNLOCK !== 'undefined') {
      const current = GB_UNLOCK.isUnlocked(task.name);
      return applyOp(current, task.op, task.value);
    }
    return false;
  }
  // 2. stat 检查
  if (task.type === 'stat') {
    if (typeof GB_MODULES !== 'undefined') {
      const mod = GB_MODULES._byPrefix[task.feature];
      if (mod && mod.core && mod.core.STAT && mod.core.STAT.values) {
        const statItem = mod.core.STAT.values[task.name];
        const current = statItem ? (statItem.total !== undefined ? statItem.total : (statItem.value !== undefined ? statItem.value : statItem)) : 0;
        return applyOp(current, task.op, task.value);
      }
    }
    return false;
  }
  return false;
}

function applyOp(current, op, value) {
  current = current || false;
  switch (op) {
    case '>=': return current >= value;
    case '>':  return current > value;
    case '<=': return current <= value;
    case '<':  return current < value;
    case '==': return current === value;
    default:   return !!current === !!value;
  }
}

// ======= 仙尊核心模块 =======
const GEN_MODULE = {
  name: 'general',
  keyPrefix: 'gen',
  feature: 'general',

  CUR: GEN_CUR,
  MULT: GEN_MULT,
  STATE: GEN_STATE,
  GENERALS: GEN_GENERALS,

  STAT: { values: {
    gen_questsCompleted: { value: 0 },
    gen_stagesCleared: { value: 0 },
  }},

  /* tick —— 每秒扫任务条件 */
  RT: {
    tick() {
      if (typeof GB_UNLOCK === 'undefined') return;

      for (const gk in GEN_GENERALS) {
        const gen = GEN_GENERALS[gk];
        // 仙尊解锁检查
        if (gen.unlock && !GB_UNLOCK.isUnlocked(gen.unlock)) continue;

        const genState = GEN_STATE.quests[gk];
        if (!genState) continue;

        for (const qk in gen.quests) {
          const quest = gen.quests[qk];
          const qState = genState[qk];
          if (!qState || qState.completed) continue;
          if (quest.unlock && !GB_UNLOCK.isUnlocked(quest.unlock)) continue;

          // 检查当前 stage
          if (qState.stage < quest.stages.length) {
            const stage = quest.stages[qState.stage];
            let complete = true;
            for (const task of stage.tasks) {
              if (!checkTask(task)) { complete = false; break; }
            }
            if (complete) {
              // 发奖励
              if (stage.reward) {
                for (const rKey in stage.reward) {
                  GEN_CUR.add('gen_' + rKey, stage.reward[rKey]);
                }
              }
              qState.stage++;
              GEN_MODULE.STAT.values.gen_stagesCleared.value++;
              // 全部 stage 完成？
              if (qState.stage >= quest.stages.length) {
                qState.completed = true;
                GEN_MODULE.STAT.values.gen_questsCompleted.value++;
              }
              if (typeof GB_APP !== 'undefined' && typeof GB_APP.toast === 'function') {
                GB_APP.toast(`${gen.name}·${quest.name} 推进！`, '#facc15');
              }
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

  // ======= 存档钩子 =======
  snapshot() {
    const obj = {};
    for (const gk in GEN_GENERALS) {
      const gen = GEN_GENERALS[gk];
      if (gen.unlock && typeof GB_UNLOCK !== 'undefined' && !GB_UNLOCK.isUnlocked(gen.unlock)) continue;
      obj[gk] = {};
      for (const qk in gen.quests) {
        const qState = GEN_STATE.quests[gk] && GEN_STATE.quests[gk][qk];
        if (qState && qState.stage > 0) obj[gk][qk] = qState.stage;
      }
    }
    // 功德也存
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
      for (const qk in GEN_GENERALS[gk].quests) {
        if (data[gk][qk] !== undefined && GEN_STATE.quests[gk] && GEN_STATE.quests[gk][qk]) {
          GEN_STATE.quests[gk][qk].stage = data[gk][qk];
          if (GEN_STATE.quests[gk][qk].stage >= GEN_GENERALS[gk].quests[qk].stages.length) {
            GEN_STATE.quests[gk][qk].completed = true;
          }
        }
      }
    }
    for (const k in GEN_CURDATA) {
      if (data['cur_' + k] !== undefined) GEN_CUR.values['gen_' + k] = data['cur_' + k];
    }
  },
  hardReset() {
    for (const gk in GEN_GENERALS) {
      for (const qk in GEN_GENERALS[gk].quests) {
        GEN_STATE.quests[gk][qk].stage = 0;
        GEN_STATE.quests[gk][qk].completed = false;
      }
    }
    for (const k in GEN_CURDATA) GEN_CUR.values['gen_' + k] = 0;
    GEN_MODULE.STAT.values.gen_questsCompleted.value = 0;
    GEN_MODULE.STAT.values.gen_stagesCleared.value = 0;
  },
  onAfterLoad() {},
};

// ======= 注册 =======
if (typeof GB_MODULES !== 'undefined') {
  GB_MODULES.register({
    id: 'general', name: '仙尊指引', keyPrefix: 'gen', tickSpeed: 1,
    unlockNeeded: 'generalFeature',   // globalLevel >= 100
    core: GEN_MODULE,
  });
}

if (typeof window !== 'undefined') {
  window.GEN_MODULE = GEN_MODULE;
  window.GEN_CUR = GEN_CUR;
}
