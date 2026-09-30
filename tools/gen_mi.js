// gen_mi.js —— 从 gooboo 源码生成 炼器矿脉(mining) 数据/store 的零依赖移植文件
// 仅做机械变换：去掉 import/export，把函数体内对 Vuex `store` 的引用改写为 MISTORE。
const fs = require('fs');
const path = require('path');

const SRC = 'g:\\DownLoad\\搜打撤\\gooboo-main\\src';
const OUT = 'g:\\DownLoad\\搜打撤\\game\\js\\modules\\mine';

function read(p) {
  return fs.readFileSync(path.join(SRC, p), 'utf8');
}
// 去掉 import/export 行，返回名称绑定的源码（const NAME = <对象>;）
// 保留 export default 前的模块级声明（如 requirementStat/requirementBase 供对象体内引用）
function modConst(p, name) {
  let s = read(p);
  let pre = '';
  {
    const preB = s.split('export default')[0];
    const lastImport = preB.lastIndexOf('\nimport');
    const preC = lastImport === -1 ? preB : preB.slice(lastImport + 1);
    const cleaned = preC.replace(/^import.*$/gm, '').trim();
    if (cleaned) pre = cleaned + '\n';
  }
  s = s.replace(/^import.*$/gm, '');
  s = s.replace(/export default/, 'constvalue');
  s = s.replace(/[\s\S]*?constvalue\s*/s, '');
  s = s.trim().replace(/;?\s*$/, '');
  s = s.replace(/\bstore\b/g, 'MISTORE');
  return pre + 'const ' + name + ' = ' + s + ';';
}

let out = [];
out.push('/* ============================================================');
out.push(' * mi_data.js —— 炼器矿脉(mining) 数据（自动生成：照抄 gooboo，勿手改数值）');
out.push(' *   ore/smeltery/enhancement/beacon/relic/achievement/upgrade(+2/Prestige/Premium)');
out.push(' *   + mult/multGroup/unlock/stat/currency/consumable/note（来自 modules/mining.js）');
out.push(' * 仅机械变换：import/export 剥离；`store` 改写为 `MISTORE`。');
out.push(' * ============================================================ */');
out.push('');

// bodies: hold generated code strings that depend on earlier consts
const bodies = [];

// 数据对象
out.push(modConst('js/modules/mining/ore.js', 'MI_ORE'));
out.push(modConst('js/modules/mining/smeltery.js', 'MI_SMELTERY'));
out.push(modConst('js/modules/mining/enhancement.js', 'MI_ENHANCEMENT'));
out.push(modConst('js/modules/mining/beacon.js', 'MI_BEACON'));
out.push(modConst('js/modules/mining/relic.js', 'MI_RELIC'));
out.push(modConst('js/modules/mining/achievement.js', 'MI_ACHIEVEMENT'));
out.push(modConst('js/modules/mining/upgrade.js', 'MI_UPG1'));
out.push(modConst('js/modules/mining/upgrade2.js', 'MI_UPG2'));
out.push(modConst('js/modules/mining/upgradePrestige.js', 'MI_UPGP'));
out.push(modConst('js/modules/mining/upgradePremium.js', 'MI_UPGM'));

// mining.js 主模块：读取原文件
let fm = read('js/modules/mining.js');

// 顶层键提取（mining.js 顶层键以 4 空格缩进，值为 {} / []）
function extractValue(src, name) {
  const re = new RegExp('\\n    ' + name + '\\s*:\\s*([\\[\\{])', 'm');
  const m = re.exec(src);
  if (!m) { console.error('!!! 找不到键 ' + name); return null; }
  const open = m[1];
  const close = open === '{' ? '}' : ']';
  let i = m.index + m[0].indexOf(open);
  let j = i, depth = 0, inStr = false, inTpl = false, esc = false;
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
  body = body.replace(/\bstore\b/g, 'MISTORE');
  return body;
}

out.push('const MI_MULTDATA = ' + extractValue(fm, 'mult') + ';');
out.push('const MI_MULTGROUPDATA = ' + extractValue(fm, 'multGroup') + ';');
out.push('const MI_UNLOCKDATA = ' + extractValue(fm, 'unlock') + ';');
out.push('const MI_STATDATA = ' + extractValue(fm, 'stat') + ';');
out.push('const MI_CURDATA = ' + extractValue(fm, 'currency') + ';');
out.push('const MI_CONSUMABLEDATA = ' + extractValue(fm, 'consumable') + ';');

// note 数组特殊处理
const noteMatch = /note\s*:\s*(buildArray\((\d+)\)\.map\(\(\)\s*=>\s*'g'\)|\[[\s\S]*?\])/.exec(fm);
if (noteMatch) {
  let nb = noteMatch[1];
  nb = nb.replace(/buildArray\((\d+)\)\.map\(\(\)\s*=>\s*'g'\)/g, (m, n) => '[' + new Array(+n).fill("'g'").join(', ') + ']');
  out.push('const MI_NOTEDATA = ' + nb + ';');
} else {
  out.push('const MI_NOTEDATA = ' + JSON.stringify(new Array(34).fill('g')) + ';');
}

// upgrade 合并（regular + subfeature(upgrade2) + prestige + premium）
out.push('const MI_UPGDATA = {');
out.push('    ...MI_UPG1,');
out.push('    ...MI_UPG2,');
out.push('    ...MI_UPGP,');
out.push('    ...MI_UPGM,');
out.push('};');

// 组装 MI_GOOBOO
out.push('');
out.push('const MI_GOOBOO = {');
out.push('  ore: MI_ORE,');
out.push('  smeltery: MI_SMELTERY,');
out.push('  enhancement: MI_ENHANCEMENT,');
out.push('  beacon: MI_BEACON,');
out.push('  relic: MI_RELIC,');
out.push('  achievement: MI_ACHIEVEMENT,');
out.push('  upgrade: MI_UPGDATA,');
out.push('  mult: MI_MULTDATA,');
out.push('  multGroup: MI_MULTGROUPDATA,');
out.push('  unlock: MI_UNLOCKDATA,');
out.push('  stat: MI_STATDATA,');
out.push('  currency: MI_CURDATA,');
out.push('  consumable: MI_CONSUMABLEDATA,');
out.push('  note: MI_NOTEDATA');
out.push('};');
out.push('');
out.push('// 供 mi_core 使用');
out.push('if (typeof module !== "undefined") module.exports = { MI_GOOBOO };');

fs.writeFileSync(path.join(OUT, 'mi_data.js'), out.join('\n'), 'utf8');
console.log('mi_data.js 生成完成', out.length, '行');

// ---- mi_store.js：照抄 store/mining.js（getters/mutations/actions） ----
let st = read('store/mining.js');
let storePre = '';
{
  const preB = st.split('export default')[0];
  const lastImport = preB.lastIndexOf('\nimport');
  const preC = lastImport === -1 ? preB : preB.slice(lastImport + 1);
  const cleaned = preC.replace(/^import.*$/gm, '').trim();
  if (cleaned) storePre = cleaned + '\n';
}
st = st.replace(/^import.*$/gm, '');
if (storePre) {
  st = st.split(storePre).filter(x => x.trim()).join('\n') || st;
}
st = st.replace(/export default\s*\{\s*namespaced:\s*true,/, 'MI_STORE = {');
st = st.trim().replace(/;?\s*$/, '');
st = st.replace(/\bVue\.set\b/g, 'VUESET');
st = st.replace(/\bstore\b/g, 'MISTORE');

let miStore = '/* ============================================================\n';
miStore += ' * mi_store.js —— 矿脉 store（getters/mutations/actions，照抄 gooboo store/mining.js）\n';
miStore += ' * 机械变换：import/export 剥离；Vue.set->VUESET；`store`->`MISTORE`。\n';
miStore += ' * ============================================================ */\n\n';
miStore += 'function VUESET(obj, key, value) { obj[key] = value; }\n\n';
miStore += storePre + 'const ' + st + ';\n\n';
miStore += 'if (typeof module !== "undefined") module.exports = { MI_STORE };';
fs.writeFileSync(path.join(OUT, 'mi_store.js'), miStore, 'utf8');
console.log('mi_store.js 生成完成');

// 语法校验
try {
  const { MI_GOOBOO } = require(path.join(OUT, 'mi_data.js'));
  console.log('MI_GOOBOO 键：', Object.keys(MI_GOOBOO).join(','));
  console.log('  ore 数：', Object.keys(MI_GOOBOO.ore).length);
  console.log('  smeltery 数：', Object.keys(MI_GOOBOO.smeltery).length);
  console.log('  upgrade 数：', Object.keys(MI_GOOBOO.upgrade).length);
  console.log('  currency 数：', Object.keys(MI_GOOBOO.currency).length);
  console.log('  mult 数：', Object.keys(MI_GOOBOO.mult).length);
  const st2 = require(path.join(OUT, 'mi_store.js'));
  console.log('  store getters：', Object.keys(st2.MI_STORE.getters).length);
  console.log('  store actions：', Object.keys(st2.MI_STORE.actions));
  console.log('  store mutations：', Object.keys(st2.MI_STORE.mutations));
} catch (e) {
  console.error('语法校验失败：', e);
}