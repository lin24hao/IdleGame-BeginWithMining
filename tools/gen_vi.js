// gen_vi.js —— 从 gooboo 源码生成 宗门(vi) 数据/store 的零依赖移植文件
// 仅做机械变换：去掉 import/export，把函数体内对 Vuex `store` 的引用改写为 VSTORE。
const fs = require('fs');
const path = require('path');

const SRC = 'g:\\DownLoad\\搜打撤\\gooboo-main\\src';
const OUT = 'g:\\DownLoad\\搜打撤\\game\\js\\modules\\vill';

function read(p) {
  return fs.readFileSync(path.join(SRC, p), 'utf8');
}
// 去掉 import/export 行，返回名称绑定的源码（const NAME = <对象>;）
function modConst(p, name) {
  let s = read(p);
  s = s.replace(/^import.*$/gm, '');          // 去 import
  s = s.replace(/export default/, 'constvalue'); // 占位，稍后统一处理
  s = s.replace(/[\s\S]*?constvalue\s*/s, '');  // 只保留对象内容
  s = s.trim().replace(/;?\s*$/, '');
  // store -> VSTORE（词边界，不碰 VSTORE/timestamp 等）
  s = s.replace(/\bstore\b/g, 'VSTORE');
  return 'const ' + name + ' = ' + s + ';';
}

let out = [];
out.push('/* ============================================================');
out.push(' * vi_data.js —— 宗门(village) 数据（自动生成：照抄 gooboo，勿手改数值）');
out.push(' *   building/job/offering/policy/craftingRecipe/upgrade{2,Prestige,Premium}');
out.push(' *   + mult/multGroup/unlock/stat/currency（来自 modules/village.js）');
out.push(' * 仅机械变换：import/export 剥离；函数内 `store` 改写为 `VSTORE`。');
out.push(' * ============================================================ */');

out.push(modConst('js/modules/village/building.js', 'VI_B'));
out.push(modConst('js/modules/village/job.js', 'VI_JOB'));
out.push(modConst('js/modules/village/offering.js', 'VI_OFFERING'));
out.push(modConst('js/modules/village/policy.js', 'VI_POLICY'));
out.push(modConst('js/modules/village/craftingRecipe.js', 'VI_CRAFT'));
out.push(modConst('js/modules/village/upgrade.js', 'VI_UPG1'));
out.push(modConst('js/modules/village/upgrade2.js', 'VI_UPG2'));
out.push(modConst('js/modules/village/upgradePrestige.js', 'VI_UPGP'));
out.push(modConst('js/modules/village/upgradePremium.js', 'VI_UPGM'));

// village.js 主模块：提取顶层键的值（支持 {} 与 []）
let vm = read('js/modules/village.js');
function extractValue(src, name) {
  const re = new RegExp('\\n    ' + name + '\\s*:\\s*([\\[\\{])', 'm');
  const m = re.exec(src);
  if (!m) { console.error('!!! 找不到键 ' + name); return null; }
  const open = m[1];
  const close = open === '{' ? '}' : ']';
  let i = m.index + m[0].indexOf(open);
  let j = i, depth = 0, inStr = false, inTpl = false, esc = false, braceL = 0, braceR = 0, st2 = 0;
  // 简易扫描：正确匹配嵌套括号（忽略字符串/注释）
  for (; j < src.length; j++) {
    const ch = src[j];
    if (esc) { esc = false; continue; }
    if (inStr) { if (ch === '\\') esc = true; else if (ch === '"') inStr = false; continue; }
    if (inTpl) { if (ch === '\\') esc = true; else if (ch === '`') inTpl = false; continue; }
    if (ch === '"') { inStr = true; continue; }
    if (ch === '`') { inTpl = true; continue; }
    if (ch === '/' && src[j+1] === '/') { while (j < src.length && src[j] !== '\n') j++; continue; }
    if (ch === open) depth++;
    else if (ch === close) { depth--; if (depth === 0) { j++; break; } }
  }
  let body = src.slice(i, j);
  body = body.replace(/\bstore\b/g, 'VSTORE');
  void braceL; void braceR; void st2;
  return body;
}
const VI_MULTDATA = extractValue(vm, 'mult');
const VI_GROUP = extractValue(vm, 'multGroup');
const VI_UNLOCK = extractValue(vm, 'unlock');
const VI_STAT = extractValue(vm, 'stat');
const VI_CUR = extractValue(vm, 'currency');

out.push('const VI_MULTDATA = ' + VI_MULTDATA + ';');
out.push('const VI_MULTGROUP = ' + VI_GROUP + ';');
out.push('const VI_UNLOCKDATA = ' + VI_UNLOCK + ';');
out.push('const VI_STATDATA = ' + VI_STAT + ';');
out.push('const VI_CURDATA = ' + VI_CUR + ';');

// 组装 VI_GOOBOO
out.push('');
out.push('// building -> queue 型升级');
out.push('let VI_UPGBUILD = {};');
out.push('for (const [k, e] of Object.entries(VI_B)) { VI_UPGBUILD[k] = Object.assign({}, e, { mode: "queue", type: "building" }); }');
out.push('');
out.push('const VI_GOOBOO = {'); 
out.push('  building: VI_B,');
out.push('  job: VI_JOB,');
out.push('  offering: VI_OFFERING,');
out.push('  policy: VI_POLICY,');
out.push('  craftingRecipe: VI_CRAFT,');
out.push('  upgrade: VI_UPG1,');
out.push('  upgrade2: VI_UPG2,');
out.push('  upgradePrestige: VI_UPGP,');
out.push('  upgradePremium: VI_UPGM,');
out.push('  upgradeBuilding: VI_UPGBUILD,');
out.push('  mult: VI_MULTDATA,');
out.push('  multGroup: VI_MULTGROUP,');
out.push('  unlock: VI_UNLOCKDATA,');
out.push('  stat: VI_STATDATA,');
out.push('  currency: VI_CURDATA,');
out.push('  init: { job: VI_JOB, offering: VI_OFFERING, policy: VI_POLICY, crafting: VI_CRAFT }');
out.push('};');
out.push('');
out.push('// 供 vi_core 使用');
out.push('if (typeof module !== "undefined") module.exports = { VI_GOOBOO, VI_UPGBUILD };');

fs.writeFileSync(path.join(OUT, 'vi_data.js'), out.join('\n'), 'utf8');
console.log('vi_data.js 生成完成', out.length, '行');

// ---- vi_store.js：照抄 store/village.js（getters/mutations/actions） ----
let st = read('store/village.js');
st = st.replace(/^import.*$/gm, '');
st = st.replace(/export default/, '');   // 去掉 export default，直接给对象
st = st.trim().replace(/^;?\s*/, '').replace(/;?\s*$/, '');
st = st.replace(/\bVue\.set\b/g, 'VUESET');           // vue set -> 本地函数
st = st.replace(/\bweightSelect\b/g, 'weightSelect');  // 已有全局
st = st.replace(/\bgetSequence\b/g, 'getSequence');
st = st.replace(/\bstore\b/g, 'VSTORE');               // 多数未引用，保险

let viStore = '/* ============================================================\n';
viStore += ' * vi_store.js —— 宗门 store（getters/mutations/actions，照抄 gooboo store/village.js）\n';
viStore += ' * 机械变换：import/export 剥离；Vue.set->VUESET；`store`->`VSTORE`。\n';
viStore += ' * ============================================================ */\n\n';
viStore += 'function VUESET(obj, key, value) { obj[key] = value; }\n\n';
viStore += 'const VI_STORE = ' + st + ';\n\n';
viStore += 'if (typeof module !== "undefined") module.exports = { VI_STORE };';
fs.writeFileSync(path.join(OUT, 'vi_store.js'), viStore, 'utf8');
console.log('vi_store.js 生成完成');

// 简单去空行校验
try {
  // 校验 JS 语法
  const { VI_GOOBOO } = require(path.join(OUT, 'vi_data.js'));
  console.log('VI_GOOBOO 键：', Object.keys(VI_GOOBOO).join(','));
  console.log('  building 数：', Object.keys(VI_GOOBOO.building).length);
  console.log('  upgrade 数：', Object.keys(VI_GOOBOO.upgrade).length);
  console.log('  currency 数：', Object.keys(VI_GOOBOO.currency).length);
  console.log('  craft 数：', Object.keys(VI_GOOBOO.craftingRecipe).length);
  const st2 = require(path.join(OUT, 'vi_store.js'));
  console.log('  store actions：', Object.keys(st2.VI_STORE.actions));
} catch (e) {
  console.error('语法校验失败：', e.message);
}