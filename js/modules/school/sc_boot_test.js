// sc_boot_test.js —— 用 Node 模拟浏览器全局，加载全部真实脚本，验证藏经阁（school）模块：
//   1) 模块 boot 不崩、五学科 init、外部宝石货币注册
//   2) 多学科 practice/study/exam 记分与升级、考签每日增长、金尘/尘上限溢出转移
//   3) 书籍 init、read/owned/booksLeft、遗物/氪金升级注册
//   4) 书籍效果桥接到目标玩法 MULT（miningDamage → 伪 MULT 捕获）
//   5) saveGame/loadGame 往返一致
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const base = 'g:/DownLoad/搜打撤/game/';

const makeEl = () => ({ innerHTML: '', style: {}, addEventListener(){}, querySelector(){return null;}, querySelectorAll(){return [];}, classList:{toggle(){},add(){},remove(){}}, getBoundingClientRect(){return {left:0,top:0,width:0,height:0,bottom:0};}, appendChild(){}, remove(){} });
global.document = {
  body: makeEl(), documentElement: {},
  addEventListener(){}, getElementById(){ return makeEl(); },
  createElement(){ return makeEl(); }, querySelector(){ return null; },
  querySelectorAll(){ return []; }, readyState: 'complete'
};
global.window = { addEventListener(){}, formatNum: undefined, innerHeight:800, innerWidth:1200 };
global.localStorage = { getItem(){ return null; }, setItem(){}, removeItem(){} };
global.addEventListener = function(){};

const files = [
  'js/icon.js',
  'js/modules/school/sc_text.js',
  'js/modules/school/sc_core.js',
  'js/modules/school/sc_data.js',
  'js/modules/school/sc_store.js',
  'js/views/sc_view.js'
];
let src = '';
for (const f of files) {
  const p = path.join(base, f);
  if (!fs.existsSync(p)) throw new Error('missing ' + p);
  src += '\n;/* --- ' + f + ' --- */\n' + fs.readFileSync(p, 'utf8');
}

src += `

;(function(){
  const log = (...m) => console.log(...m);
  const assert = (cond, msg) => { if (!cond) throw new Error('FAIL: ' + msg); log('  ok:', msg); };
  try { GB_ICON.icon = function(){ return ''; }; } catch(e){ global.GB_ICON = { icon: function(){ return ''; } }; }

  // ---- 伪 MULT 捕获器，用于验证书籍效果跨模块桥接（对应灵脉 MULT） ----
  global.MULT = { calls: [], setMult(o){ this.calls.push(['mult', o.name, o.key, o.value]); }, setBase(o){ this.calls.push(['base', o.name, o.key, o.value]); }, setBonus(o){ this.calls.push(['bonus', o.name, o.key, o.value]); }, removeKeyAnywhere(k){ this.calls.push(['rm', k]); } };

  // ===== 1. boot + 五学科 + 货币注册 =====
  const st = {};
  SC_BOOT(st);
  assert(SC_RT.ready === true, 'SC_BOOT ready');
  assert(!!st.subject.math && !!st.subject.literature && !!st.subject.history && !!st.subject.art && !!st.subject.chemistry, '五学科已初始化');
  assert(st.subject.math.scoreGoal === 14, '演算 scoreGoal=14');
  assert(st.subject.literature.unlock === 'schoolLiteratureSubfeature', '文墨解锁键存在');

  // 外部宝石货币注册（蓝宝/翡翠/红宝）
  assert(typeof SC_CUR.defs['gem_sapphire'] !== 'undefined', '蓝宝 gem_sapphire 注册');
  assert(typeof SC_CUR.defs['gem_emerald'] !== 'undefined', '翡翠 gem_emerald 注册');
  assert(typeof SC_CUR.defs['gem_ruby'] !== 'undefined', '红宝 gem_ruby 注册');
  assert(SC_CUR.cap('school_goldenDust') === 8000, '金尘 cap=8000');
  log('1. boot/subjects/gems OK');

  // ===== 2. 记分与升级：演算（math）考试 =====
  SC_RT.act('finishSchool', { mode: 'exam', score: 14, subject: 'math' });
  assert(st.subject.math.pointsTotal > 0, '演算考试获得知识点 pointsTotal>0');
  assert(st.subject.math.grade === 1, '演算满分考试后 grade=1');
  assert(SC_CUR.value('school_goldenDust') > 0, '演算考试获得金尘');

  // practice 不升级只记分
  const beforePts = st.subject.math.pointsTotal;
  SC_RT.act('finishSchool', { mode: 'practice', score: 14, subject: 'math' });
  const practicePts = st.subject.math.pointsTotal;
  assert(practicePts > beforePts, 'practice 记分（pointsTotal 增）');

  // ===== 3. 每日考签增长 + 金尘上限溢出转移 =====
  SC_RT._lastTime = 0;
  SC_RT.tick(1);
  const pass0 = SC_CUR.value('school_examPass');
  SC_RT.tick(SC_SECONDS_PER_DAY);                  // 跨日 → 考签 +1
  const pass1 = SC_CUR.value('school_examPass');
  assert(pass1 > pass0, '跨日考签 +' + (pass1 - pass0));
  // 金尘溢出 → bonusDust
  SC_CUR.values['school_goldenDust'] = SC_CUR.cap('school_goldenDust') - 1; // 差 1 满
  SC_RT.act('finishSchool', { mode: 'exam', score: 14, subject: 'math' });
  assert(st.bonusDust > 0, '金尘溢出转移到 bonusDust，得到 ' + st.bonusDust);
  log('2-3. scoring/grade/daily pass/dust cap OK');

  // ===== 4. 书籍：booksLeft + readBook + 跨模块桥接 =====
  // 演算已长得足够多 → reached>=1 → schoolBook base>=1
  SC_RT.act('applySubjectBooks', 'math');
  const booksLeft = SC_RT.getters.booksLeft;
  assert(booksLeft >= 1, '获得可读书籍配额 booksLeft=' + booksLeft);
  // 给藏书阁书籍设置全局等级（mining_0=30），使 mining damage 书以 lvl=6 激活（minGL=25）
  SC_RT.state.meta.globalLevelParts['mining_0'] = 30;
  SC_RT.act('readBook', 'mining_damage');
  assert(st.book['mining_damage'].owned === true, '读到灵脉「铉辉经」mining_damage owned');
  assert(SC_RT.getters.booksLeft < booksLeft, 'booksLeft 随已读书籍递减');
  const bridge = global.MULT.calls.find(c => c[0] === 'mult' && c[1] === 'miningDamage');
  assert(!!bridge, 'miningDamage 已桥接到目标 MULT');
  if (bridge) {
    const ex = Math.pow(1.01, 6);
    log('  miningDamage bridge value:', bridge[3], '(期望≈', ex.toFixed(6) + ')');
    assert(Math.abs(bridge[3] - ex) < 0.001, 'miningDamage 桥接值 1.01^6');
  }
  // 移除书籍 → 效果清除（桥接 removeKeyAnywhere）
  SC_RT.act('updateBookEffects');                  // 重新评估（仍 owned）
  // 遗物 / 氪金升级注册
  assert(typeof SC_RELICS.notebook === 'object', '遗物乾坤手札已定义');
  assert(typeof SC_UPG.defs['school_student'] === 'object', '氪金升级 藏经弟子 已注册');
  const stud = SC_UPG.defs['school_student'];
  assert(stud.effect.length > 0 && stud.effect[0].name === 'schoolBook', '藏经弟子效果 schoolBook');
  log('4. books/read/bridge/relic/upgrade OK');

  // ===== 5. saveGame / loadGame 往返 =====
  GB_SC_VIEW._seedHandouts();                      // 触发开局发放（3考签/20蓝宝/5翡翠）
  assert(SC_CUR.value('school_examPass') >= 3, '开局 3 张考签');
  assert(SC_CUR.value('gem_sapphire') >= 20, '开局 20 蓝宝');
  const saved = GB_SC_VIEW.save();                 // 仅存，不抛错
  const obj = SC_RT.saveGame();
  const gradeBefore = SC_RT.state.subject.math.grade;
  assert(obj.subject && obj.subject.math && obj.subject.math[0] === gradeBefore, '存档含演算 grade=' + obj.subject.math[0]);
  assert(obj.gems && obj.gems.sapphire >= 20, '存档含蓝宝余额');
  // 干净装载后 loadGame 恢复
  SC_BOOT({ subject: {}, book: {}, currencyVals: {} });
  SC_RT.loadGame(obj);
  assert(SC_RT.state.subject.math.grade === gradeBefore, '重新装载后演算 grade 恢复=' + gradeBefore);
  assert(SC_CUR.value('gem_sapphire') >= 20, '重新装载后蓝宝恢复');
  // 书籍恢复
  assert(SC_RT.state.book['mining_damage'].owned === true, '重新装载后书籍 owned 恢复');
  log('5. save/load roundtrip OK');

  // ===== 6. 视图渲染：学科页 + 藏书阁 =====
  const hp = GB_SC_VIEW.renderSubjectCard('math');
  log('subject card html chars:', hp.length);
  assert(hp.length > 50, '学科卡片可渲染');
  const hlib = GB_SC_VIEW.renderLibrary();
  log('library html chars:', hlib.length);
  assert(hlib.length > 50, '藏书阁可渲染');
  log('6. view render OK');

  log('WARNINGS:', JSON.stringify(SC_RT.warnings.slice(0, 10)));
  log('SC-SCHOOL-BOOT-PASS');
})();
`;
vm.runInThisContext(src, { filename: 'sc-boot-test.js' });