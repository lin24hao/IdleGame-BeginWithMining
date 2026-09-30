// gen_fa.js —— 从 gooboo 源码生成 灵植(farm) 数据/store 的零依赖移植文件
// 仅做机械变换：去掉 import/export，把函数体内对 Vuex `store` 的引用改写为 FSTORE。
const fs = require('fs');
const path = require('path');

const SRC = 'g:\\DownLoad\\搜打撤\\gooboo-main\\src';
const OUT = 'g:\\DownLoad\\搜打撤\\game\\js\\modules\\farm';

function read(p) {
  return fs.readFileSync(path.join(SRC, p), 'utf8');
}
// 去掉 import/export 行，返回名称绑定的源码（const NAME = <对象>;）
function modConst(p, name) {
  let s = read(p);
  // 捕获 export default 前的模块级声明（如 requirementStat/requirementBase 供对象体内引用）
  let pre = '';
  {
    const preB = s.split('export default')[0];
    const lastImport = preB.lastIndexOf('\nimport');
    const preC = lastImport === -1 ? preB : preB.slice(lastImport + 1);
    const cleaned = preC.replace(/^import.*$/gm, '').trim();
    if (cleaned) pre = cleaned + '\n';
  }
  s = s.replace(/^import.*$/gm, '');          // 去 import
  s = s.replace(/export default/, 'constvalue'); // 占位，稍后统一处理
  s = s.replace(/[\s\S]*?constvalue\s*/s, '');  // 只保留对象内容
  s = s.trim().replace(/;?\s*$/, '');
  s = s.replace(/\bstore\b/g, 'FSTORE');
  return pre + 'const ' + name + ' = ' + s + ';';
}

let out = [];
out.push('/* ============================================================');
out.push(' * fa_data.js —— 灵植(farm) 数据（自动生成：照抄 gooboo，勿手改数值）');
out.push(' *   crop/building/gene/geneLevels/fertilizer/upgrade/upgradePremium/relic/achievement');
out.push(' *   + mult/currency/unlock/stat（来自 modules/farm.js）');
out.push(' * 仅机械变换：import/export 剥离；函数内 `store` 改写为 `FSTORE`。');
out.push(' * ============================================================ */');
out.push('');
out.push('/* farm 数据常量（照抄 gooboo constants.js；用 var 便于在已有 SECONDS_* 全局旁安全声明） */');
out.push('var MINUTES_PER_HOUR = 60;');
out.push('var MINUTES_PER_DAY = 1440;');

// farm 数据文件（纯对象 export default）
out.push(modConst('js/modules/farm/crop.js', 'FA_CROP'));
out.push(modConst('js/modules/farm/building.js', 'FA_BUILDING'));
out.push(modConst('js/modules/farm/gene.js', 'FA_GENE'));
out.push(modConst('js/modules/farm/geneLevels.js', 'FA_GENELEVELS'));
out.push(modConst('js/modules/farm/fertilizer.js', 'FA_FERTILIZER'));
out.push(modConst('js/modules/farm/upgrade.js', 'FA_UPG1'));
out.push(modConst('js/modules/farm/upgradePremium.js', 'FA_UPGM'));
out.push(modConst('js/modules/farm/relic.js', 'FA_RELIC'));
out.push(modConst('js/modules/farm/achievement.js', 'FA_ACHIEVEMENT'));

// farm.js 主模块：提取顶层键的值（支持 {} 与 []）
let fm = read('js/modules/farm.js');
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
  body = body.replace(/\bstore\b/g, 'FSTORE');
  return body;
}

// note 数组特殊处理：`note: buildArray(22).map(() => 'g')` 首字符非 { / [ ，单独用正则提取
const noteMatch = /note\s*:\s*(buildArray\(\d+\)\.map\(\(\)\s*=>\s*'g'\)|\[[\s\S]*?\])/.exec(fm);
if (noteMatch) {
  let noteBody = noteMatch[1];
  noteBody = noteBody.replace(/buildArray\((\d+)\)\.map\(\(\)\s*=>\s*'g'\)/g, (m, n) => {
    return '[' + new Array(+n).fill("'g'").join(', ') + ']';
  });
  out.push('const FA_NOTEDATA = ' + noteBody + ';');
} else {
  out.push('const FA_NOTEDATA = ' + JSON.stringify(new Array(22).fill('g')) + ';');
}

out.push('const FA_MULTDATA = ' + extractValue(fm, 'mult') + ';');
out.push('const FA_UNLOCKDATA = ' + extractValue(fm, 'unlock').replace(/\bgeneLevels\b/g, 'FA_GENELEVELS') + ';');
out.push('const FA_STATDATA = ' + extractValue(fm, 'stat') + ';');
out.push('const FA_CURDATA = ' + extractValue(fm, 'currency') + ';');
// upgrade 合并（upgrade + upgradePremium）
let upgradeBody = '{\n    ...FA_UPG1,\n    ...FA_UPGM,\n}';
out.push('const FA_UPGDATA = ' + upgradeBody + ';');

// 组装 FA_GOOBOO
out.push('');
out.push('const FA_GOOBOO = {');
out.push('  crop: FA_CROP,');
out.push('  building: FA_BUILDING,');
out.push('  gene: FA_GENE,');
out.push('  geneLevels: FA_GENELEVELS,');
out.push('  fertilizer: FA_FERTILIZER,');
out.push('  upgrade: FA_UPGDATA,');
out.push('  relic: FA_RELIC,');
out.push('  achievement: FA_ACHIEVEMENT,');
out.push('  note: FA_NOTEDATA,');
out.push('  mult: FA_MULTDATA,');
out.push('  unlock: FA_UNLOCKDATA,');
out.push('  stat: FA_STATDATA,');
out.push('  currency: FA_CURDATA');
out.push('};');
out.push('');
out.push('// 供 fa_core 使用');
out.push('if (typeof module !== "undefined") module.exports = { FA_GOOBOO };');

fs.writeFileSync(path.join(OUT, 'fa_data.js'), out.join('\n'), 'utf8');
console.log('fa_data.js 生成完成', out.length, '行');

// ---- fa_store.js：照抄 store/farm.js（getters/mutations/actions） ----
let st = read('store/farm.js');
// 保留 export default 前的模块级声明（fieldWidth/emptyField/notes/tileUpgrades 等）
let storePre = '';
{
  const preB = st.split('export default')[0];
  const lastImport = preB.lastIndexOf('\nimport');
  const preC = lastImport === -1 ? preB : preB.slice(lastImport + 1);
  const cleaned = preC.replace(/^import.*$/gm, '').trim();
  if (cleaned) storePre = cleaned + '\n';
}
st = st.replace(/^import.*$/gm, '');
// 去掉模块级声明块（已放入 storePre）
if (storePre) {
  st = st.split(storePre).filter(x => x.trim()).join('\n') || st;
}
// 由模块级 + namespaced 对象拼成 FA_STORE 对象字面量
st = st.replace(/export default\s*\{\s*namespaced:\s*true,/, 'FA_STORE = {');
st = st.trim().replace(/;?\s*$/, '');
st = st.replace(/\bVue\.set\b/g, 'VUESET');
st = st.replace(/\bstore\b/g, 'FSTORE');
st = st.replace(/\bgeneLevels\b/g, 'FA_GENELEVELS');

let faStore = '/* ============================================================\n';
faStore += ' * fa_store.js —— 灵植 store（getters/mutations/actions，照抄 gooboo store/farm.js）\n';
faStore += ' * 机械变换：import/export 剥离；Vue.set->VUESET；`store`->`FSTORE`。\n';
faStore += ' * ============================================================ */\n\n';
faStore += 'function VUESET(obj, key, value) { obj[key] = value; }\n\n';
faStore += storePre + 'const ' + st + ';\n\n';
faStore += 'if (typeof module !== "undefined") module.exports = { FA_STORE };';
fs.writeFileSync(path.join(OUT, 'fa_store.js'), faStore, 'utf8');
console.log('fa_store.js 生成完成');

// 语法校验
try {
  const { FA_GOOBOO } = require(path.join(OUT, 'fa_data.js'));
  console.log('FA_GOOBOO 键：', Object.keys(FA_GOOBOO).join(','));
  console.log('  crop 数：', Object.keys(FA_GOOBOO.crop).length);
  console.log('  gene 数：', Object.keys(FA_GOOBOO.gene).length);
  console.log('  upgrade 数：', Object.keys(FA_GOOBOO.upgrade).length);
  console.log('  fertilizer 数：', Object.keys(FA_GOOBOO.fertilizer).length);
  console.log('  currency 数：', Object.keys(FA_GOOBOO.currency).length);
  const st2 = require(path.join(OUT, 'fa_store.js'));
  console.log('  store actions：', Object.keys(st2.FA_STORE.actions));
} catch (e) {
  console.error('语法校验失败：', e);
}