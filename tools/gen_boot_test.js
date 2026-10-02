// gen_boot_test.js —— 用 Node 模拟浏览器全局，验证仙尊指引（general）模块：
//   1) 模块 boot 不崩、仙尊/任务/阶段正确初始化
//   2) CUR/MULT/STATE 数据结构完整性
//   3) tick 推进任务阶段：unlock 类型 + stat 类型条件
//   4) 功德货币正确发放与累加
//   5) snapshot / restore 存档往返一致
//   6) hardReset 重置干净
//   7) getQuestStage / isQuestCompleted 查询 API
//   8) 视图 renderGenerals / renderHeader 不崩、产出非空 HTML
// 运行：node gen_boot_test.js
const fs = require('fs');
const vm = require('vm');
const path = require('path');

// ---- 路径：动态定位 game 目录 ----
// 本文件位于 game/tools/ 或 game/js/modules/general/ 下
let base = path.resolve(__dirname, '../..'); // 假设在 game/tools/
if (!fs.existsSync(path.join(base, 'js/app.js'))) {
  base = path.resolve(__dirname, '..'); // 假设在 game/js/modules/general/
}
if (!fs.existsSync(path.join(base, 'js/app.js'))) {
  // 最后兜底：搜索上级目录
  let p = __dirname;
  for (let i = 0; i < 5; i++) {
    p = path.dirname(p);
    if (fs.existsSync(path.join(p, 'game/js/app.js'))) {
      base = path.join(p, 'game');
      break;
    }
  }
}
console.log('Using game base:', base);

// ---- 最小浏览器全局桩 ----
const makeEl = () => ({
  innerHTML: '', textContent: '', value: '',
  style: {}, classList: { toggle(){}, add(){}, remove(){}, contains(){ return false; } },
  addEventListener(){}, removeEventListener(){},
  querySelector(){ return null; }, querySelectorAll(){ return []; },
  getBoundingClientRect(){ return {left:0,top:0,width:0,height:0,bottom:0,right:0}; },
  appendChild(){}, remove(){}, setAttribute(){}, getAttribute(){ return null; },
  closest(){ return null; }, dispatchEvent(){}
});
global.document = {
  body: makeEl(), documentElement: {},
  addEventListener(){}, removeEventListener(){},
  getElementById(){ return makeEl(); },
  createElement(){ return makeEl(); },
  querySelector(){ return null; },
  querySelectorAll(){ return []; },
  readyState: 'complete'
};
global.window = { addEventListener(){}, removeEventListener(){}, innerHeight: 800, innerWidth: 1200 };
global.localStorage = { getItem(){ return null; }, setItem(){}, removeItem(){} };
global.addEventListener = function(){};
global.removeEventListener = function(){};

// ---- 加载顺序：严格依赖顺序 ----
const files = [
  // 1. 基础设施
  'js/icon.js',
  'js/gb_registry.js',
  'js/global_unlock.js',
  'js/meta.js',
  // 2. general 核心
  'js/modules/general/general_core.js',
  // 3. general 视图
  'js/views/general_view.js'
];

let src = '';
for (const f of files) {
  const p = path.join(base, f);
  if (!fs.existsSync(p)) throw new Error('missing ' + p);
  src += '\n;/* --- ' + f + ' --- */\n' + fs.readFileSync(p, 'utf8');
}

src += `

;(function(){
  const log = (...m) => console.log('  ' + m.join(' '));
  const assert = (cond, msg) => {
    if (!cond) { console.error('FAIL:', msg); process.exitCode = 1; throw new Error('FAIL: ' + msg); }
    log('✓', msg);
  };

  // ---- GB_ICON 桩（icon.js 可能依赖 document.createElementNS） ----
  if (typeof GB_ICON === 'undefined') {
    global.GB_ICON = { icon: function(){ return ''; } };
  } else {
    GB_ICON.icon = function(){ return ''; };
  }

  // ---- 初始化全局 Feature 解锁 ----
  GB_META.initAllFeatureKeys();

  // ============================================================
  // 1. Boot 测试：模块初始化不崩
  // ============================================================
  console.log('\n=== 1. Boot & 数据结构完整性 ===');

  assert(typeof GEN_MODULE !== 'undefined', 'GEN_MODULE 存在');
  assert(typeof GEN_GENERALS !== 'undefined', 'GEN_GENERALS 存在');
  assert(typeof GEN_STATE !== 'undefined', 'GEN_STATE 存在');
  assert(typeof GEN_CUR !== 'undefined', 'GEN_CUR 存在');
  assert(typeof GEN_MULT !== 'undefined', 'GEN_MULT 存在');
  assert(typeof GB_GEN_VIEW !== 'undefined', 'GB_GEN_VIEW 视图存在');

  // 6 位仙尊完整注册
  const genKeys = Object.keys(GEN_GENERALS);
  assert(genKeys.length === 6, '6 位仙尊已注册（实际 ' + genKeys.length + '）');

  const expectedGens = ['yuanshi', 'tongtian', 'laojun', 'yinjie', 'zhundi', 'yaochi'];
  expectedGens.forEach(gk => {
    assert(GEN_GENERALS[gk] !== undefined, '仙尊 ' + gk + ' 存在');
    assert(GEN_GENERALS[gk].name, '仙尊 ' + gk + ' 有中文名');
    assert(GEN_GENERALS[gk].icon, '仙尊 ' + gk + ' 有图标');
  });

  // GEN_MODULE.CUR 注册了功德
  assert(typeof GEN_CUR.defs['gen_merit'] !== 'undefined', '功德 gen_merit 已注册');
  assert(GEN_CUR.value('gen_merit') === 0, '初始功德 = 0');

  // STAT 初始化
  assert(GEN_MODULE.STAT.values.gen_questsCompleted.value === 0, '初始 questsCompleted = 0');
  assert(GEN_MODULE.STAT.values.gen_stagesCleared.value === 0, '初始 stagesCleared = 0');

  // GB_MODULES 注册
  const mod = GB_MODULES.get('general');
  assert(mod !== null, 'GB_MODULES 已注册 general 模块');
  assert(mod.tickSpeed === 1, 'tickSpeed = 1');
  assert(mod.unlockNeeded === 'generalFeature', 'unlockNeeded = generalFeature');

  // GEN_STATE 结构完整
  genKeys.forEach(gk => {
    assert(GEN_STATE.quests[gk] !== undefined, 'GEN_STATE.quests.' + gk + ' 存在');
    const questKeys = Object.keys(GEN_GENERALS[gk].quests);
    questKeys.forEach(qk => {
      const qs = GEN_STATE.quests[gk][qk];
      assert(qs !== undefined, 'GEN_STATE.quests.' + gk + '.' + qk + ' 存在');
      assert(qs.stage === 0, '初始 stage = 0');
      assert(qs.completed === false, '初始 completed = false');
    });
  });

  console.log('\n=== 2. 查询 API ===');

  // getQuestStage / isQuestCompleted
  assert(GEN_MODULE.getQuestStage('yuanshi', 'dao') === 0, 'getQuestStage yuanshi/dao = 0');
  assert(GEN_MODULE.isQuestCompleted('yuanshi', 'dao') === false, 'isQuestCompleted yuanshi/dao = false');

  // ============================================================
  // 3. Tick 推进任务阶段（unlock 类型条件）
  // ============================================================
  console.log('\n=== 3. Tick 推进：unlock 类型条件 ===');

  // 解锁 generalFeature（让 GEN_MODULE.RT.tick 不跳过）
  GB_UNLOCK.unlock('generalFeature');
  assert(GB_UNLOCK.isUnlocked('generalFeature') === true, 'generalFeature 已解锁');

  // 元始天尊 dao 任务的第 0 阶段：需要 daoFeature 解锁
  assert(GB_UNLOCK.isUnlocked('daoFeature') === false, 'daoFeature 初始未解锁');
  GEN_MODULE.RT.tick();
  assert(GEN_MODULE.getQuestStage('yuanshi', 'dao') === 0, 'tick 后 stage 仍为 0（条件未满足）');

  // 解锁 daoFeature → 触发 tick → stage 推进
  GB_UNLOCK.unlock('daoFeature');
  GEN_MODULE.RT.tick();
  assert(GEN_MODULE.getQuestStage('yuanshi', 'dao') === 1, '解锁 daoFeature + tick → stage 0→1');
  assert(GEN_CUR.value('gen_merit') === 10, '功德 +10（第一阶段奖励）');
  assert(GEN_MODULE.STAT.values.gen_stagesCleared.value === 1, 'stagesCleared = 1');

  // 解锁 villFeature → 第二阶段
  GB_UNLOCK.unlock('villFeature');
  GEN_MODULE.RT.tick();
  assert(GEN_MODULE.getQuestStage('yuanshi', 'dao') === 2, '解锁 villFeature + tick → stage 1→2');
  assert(GEN_CUR.value('gen_merit') === 30, '功德 +20 = 累计 30');

  // 模拟 lm_maxDepth0 stat ≥ 50 → 第三阶段 + 完成
  // 需要在 GB_MODULES._byPrefix.lm 上伪造 stat
  if (!GB_MODULES._byPrefix['lm']) {
    GB_MODULES._byPrefix['lm'] = { core: { STAT: { values: {} } } };
  }
  GB_MODULES._byPrefix['lm'].core.STAT.values['lm_maxDepth0'] = { total: 55, value: 55 };
  GEN_MODULE.RT.tick();
  assert(GEN_MODULE.getQuestStage('yuanshi', 'dao') === 3, 'stat lm_maxDepth0≥50 + tick → stage 2→3');
  assert(GEN_MODULE.isQuestCompleted('yuanshi', 'dao') === true, 'dao 任务线全部完成');
  assert(GEN_MODULE.STAT.values.gen_questsCompleted.value === 1, 'questsCompleted = 1');
  assert(GEN_CUR.value('gen_merit') === 80, '功德 +50 = 累计 80');

  // ============================================================
  // 4. 通天教主：hoFeature + ruFeature 解锁链
  // ============================================================
  console.log('\n=== 4. Tick 推进：通天教主 hoFeature + ruFeature ===');

  // 先解锁 faFeature（通天教主 fa 任务第一阶段）
  GB_UNLOCK.unlock('faFeature');
  GEN_MODULE.RT.tick();
  assert(GEN_MODULE.getQuestStage('tongtian', 'fa') === 1, 'faFeature 解锁 → tongtian/fa stage 0→1');
  assert(GEN_CUR.value('gen_merit') === 90, '功德 +10 = 累计 90');

  GB_UNLOCK.unlock('hoFeature');
  GEN_MODULE.RT.tick();
  assert(GEN_MODULE.getQuestStage('tongtian', 'fa') === 2, 'hoFeature 解锁 → tongtian/fa stage 1→2');
  assert(GEN_CUR.value('gen_merit') === 110, '功德 +20 = 累计 110');

  GB_UNLOCK.unlock('ruFeature');
  GEN_MODULE.RT.tick();
  assert(GEN_MODULE.isQuestCompleted('tongtian', 'fa') === true, 'ruFeature 解锁 → tongtian/fa 完成');
  assert(GEN_CUR.value('gen_merit') === 210, '功德 +100 = 累计 210');

  // ============================================================
  // 5. snapshot / restore 往返
  // ============================================================
  console.log('\n=== 5. Snapshot / Restore 往返 ===');

  const meritBefore = GEN_CUR.value('gen_merit');
  const snap = GEN_MODULE.snapshot();
  assert(typeof snap === 'object', 'snapshot 返回对象');
  assert(snap.cur_merit === meritBefore, 'snapshot 含功德 = ' + meritBefore);
  assert(snap.yuanshi && snap.yuanshi.dao === 3, 'snapshot 含 yuanshi.dao stage=3');
  assert(snap.tongtian && snap.tongtian.fa === 3, 'snapshot 含 tongtian.fa stage=3');

  // hardReset 清空后 restore
  GEN_MODULE.hardReset();
  assert(GEN_CUR.value('gen_merit') === 0, 'hardReset 功德清空');
  assert(GEN_MODULE.getQuestStage('yuanshi', 'dao') === 0, 'hardReset stage 归零');
  assert(GEN_MODULE.isQuestCompleted('yuanshi', 'dao') === false, 'hardReset completed=false');

  GEN_MODULE.restore(snap);
  assert(GEN_CUR.value('gen_merit') === meritBefore, 'restore 功德恢复 = ' + meritBefore);
  assert(GEN_MODULE.getQuestStage('yuanshi', 'dao') === 3, 'restore stage 恢复 = 3');
  assert(GEN_MODULE.isQuestCompleted('yuanshi', 'dao') === true, 'restore completed 恢复 = true');
  assert(GEN_MODULE.getQuestStage('tongtian', 'fa') === 3, 'restore tongtian/fa 恢复 = 3');
  assert(GEN_MODULE.isQuestCompleted('tongtian', 'fa') === true, 'restore tongtian/fa completed 恢复');

  // ============================================================
  // 6. 子 feature 解锁守卫
  // ============================================================
  console.log('\n=== 6. 子 feature 解锁守卫 ===');

  // 默认只有 yuanshi / tongtian 可见（无 unlock 条件）
  // laojun 需要 generalOppenschroeSubfeature
  assert(GEN_GENERALS.laojun.unlock === 'generalOppenschroeSubfeature', 'laojun 解锁条件正确');

  // 解锁子 feature → tick 扫描
  GB_UNLOCK.unlock('generalOppenschroeSubfeature');
  // laojun 炼丹之道需要 daoGemDiamondSubfeature
  GB_UNLOCK.unlock('daoGemDiamondSubfeature');
  GEN_MODULE.RT.tick();
  assert(GEN_MODULE.getQuestStage('laojun', 'alchemy') === 1, 'laojun alchemy stage 0→1');
  assert(GEN_CUR.value('gen_merit') === meritBefore + 30, '功德 +30（laojun 奖励）');

  // ============================================================
  // 7. 视图渲染测试
  // ============================================================
  console.log('\n=== 7. 视图渲染 ===');

  // renderHeader
  const headerHtml = GB_GEN_VIEW.renderHeader();
  assert(typeof headerHtml === 'string', 'renderHeader 返回字符串');
  assert(headerHtml.length > 20, 'renderHeader 产出 HTML chars=' + headerHtml.length);
  assert(headerHtml.indexOf('功德') >= 0, 'renderHeader 含"功德"');

  // renderGenerals
  const generalsHtml = GB_GEN_VIEW.renderGenerals();
  assert(typeof generalsHtml === 'string', 'renderGenerals 返回字符串');
  assert(generalsHtml.length > 100, 'renderGenerals 产出 HTML chars=' + generalsHtml.length);
  assert(generalsHtml.indexOf('元始天尊') >= 0, 'renderGenerals 含元始天尊');
  assert(generalsHtml.indexOf('通天教主') >= 0, 'renderGenerals 含通天教主');
  assert(generalsHtml.indexOf('太上老君') >= 0, 'renderGenerals 含太上老君');
  assert(generalsHtml.indexOf('接引道人') >= 0, 'renderGenerals 含接引道人');
  assert(generalsHtml.indexOf('准提道人') >= 0, 'renderGenerals 含准提道人');
  assert(generalsHtml.indexOf('瑶池圣母') >= 0, 'renderGenerals 含瑶池圣母');

  // renderGeneralCard 单独测
  const cardHtml = GB_GEN_VIEW.renderGeneralCard('yuanshi');
  assert(cardHtml.indexOf('locked') === -1, '已解锁仙尊卡片不含 locked 类');
  assert(cardHtml.indexOf('元始天尊') >= 0, '卡片含仙尊名');

  // renderTask
  const task = { type: 'unlock', name: 'daoFeature', op: '==', value: true };
  const taskHtml = GB_GEN_VIEW.renderTask(task, 0);
  assert(typeof taskHtml === 'string', 'renderTask 返回字符串');
  assert(taskHtml.length > 10, 'renderTask 产出 HTML');

  // renderReward
  const rewardHtml = GB_GEN_VIEW.renderReward({ merit: 50 });
  assert(rewardHtml.indexOf('50') >= 0, 'renderReward 含数值');

  console.log('\n========================================');
  console.log('  ALL TESTS PASSED');
  console.log('========================================\n');
})();
`;

vm.runInThisContext(src, { filename: 'gen_boot_test.js' });
