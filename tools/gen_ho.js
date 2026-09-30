// gen_ho.js —— 从 gooboo 源码生成 降妖(horde) 数据/store/模块 的零依赖移植文件
// 仅做机械变换：
//   - 数据文件：去 import/export，`store`->`HOSTORE`，IIFE 不涉及（纯对象 const）
//   - 模块 modules/horde.js：去 import，整个用 IIFE 包裹并把数据名以参数注入，
//     函数体内 `store`->`HOSTORE`，`export default`->`HO_MODULE =`
//   - store/horde.js：去 import，保留模块级 const，`store`->`HOSTORE`，Vue.set->VUESET
const fs = require('fs');
const path = require('path');

const SRC = 'g:\\DownLoad\\搜打撤\\gooboo-main\\src';
const OUT = 'g:\\DownLoad\\搜打撤\\game\\js\\modules\\horde';

function read(p) { return fs.readFileSync(path.join(SRC, p), 'utf8'); }

function stripImports(s) { return s.replace(/^import.*$/gm, ''); }

// 纯对象 export default 数据文件 -> const 绑定（保留模块级 pre 声明 + 重命名标识符）
function modConst(p, name, renames) {
  let s = read(p);
  let pre = '';
  {
    const preB = s.split('export default')[0];
    const lastImport = preB.lastIndexOf('\nimport');
    const preC = lastImport === -1 ? preB : preB.slice(lastImport + 1);
    const cleaned = preC.replace(/^import.*$/gm, '').trim();
    if (cleaned) pre = cleaned + '\n';
  }
  s = stripImports(s);
  s = s.replace(/export default/, 'constvalue');
  s = s.replace(/[\s\S]*?constvalue\s*/s, '');
  s = s.trim().replace(/;?\s*$/, '');
  if (renames) renames.forEach(r => { s = s.replace(r.from, r.to); });
  s = s.replace(/\bstore\b/g, 'HOSTORE');
  // 用 IIFE 包裹，隔离各文件模块级 helper（requirementStat/requirementBase 等），避免全局重名
  return 'const ' + name + ' = (function() {\n' + pre + '  return ' + s + ';\n})();';
}

let out = [];
out.push('/* ============================================================');
out.push(' * ho_data.js —— 降妖(horde) 数据（自动生成：照抄 gooboo，勿手改数值）');
out.push(' * 机械变换：import/export 剥离；函数内 `store`->`HOSTORE`；card->HO_CARDLIST。');
out.push(' * ============================================================ */');
out.push('');
out.push('/* horde 常量（照抄 constants.js；用 var 便于与已有全局共存） */');
out.push('var HORDE_COMBO_ATTACK = 1.025;');
out.push('var HORDE_COMBO_HEALTH = 1.01;');
out.push('var HORDE_COMBO_BONE = 0.012;');
out.push('var HORDE_MONSTER_PART_MIN_ZONE = 10;');
out.push('var HORDE_SHARD_PER_EQUIP = 3;');
out.push('var HORDE_SHARD_INCREMENT = 3;');
out.push('var HORDE_RAMPAGE_ENEMY_TIME = 60;');
out.push('var HORDE_RAMPAGE_BOSS_TIME = 300;');
out.push('var HORDE_RAMPAGE_ATTACK = 2;');
out.push('var HORDE_RAMPAGE_STUN_RESIST = 1;');
out.push('var HORDE_INACTIVE_ITEM_COOLDOWN = 0.1;');
out.push('var HORDE_REPLENISH_DIVISION_SHIELD = 0.25;');
out.push('var HORDE_ENEMY_RESPAWN_TIME = 10;');
out.push('var HORDE_ENEMY_RESPAWN_MAX = 5;');
out.push('var HORDE_RARE_LOOT_MIN_ZONE = 21;');
out.push('var HORDE_RARE_LOOT_HOLD = 5;');
out.push('var HORDE_HEIRLOOM_MIN_ZONE = 31;');
out.push('var HORDE_HEIRLOOM_BOOST_EXPONENT = 0.02;');
out.push('var HORDE_RAID_KEYS_PER_DAY = 4;');
out.push('var HORDE_RAID_KEYS_PER_RAIDBOSS = 10;');
out.push('var HORDE_KEYS_PER_TOWER = 3;');
out.push('var HORDE_HEIRLOOM_TOWER_FLOORS = 5;');
out.push('var HORDE_HEIRLOOM_CHANCE_PER_NOSTALGIA = 0.001;');
out.push('var HORDE_DAMAGE_INCREASE_PER_STRENGTH = 0.03;');
out.push('var HORDE_SHARD_CHANCE_REDUCTION = 1.075;');
out.push('var HORDE_STACKING_COOLDOWN = 72000;');
out.push('var HORDE_ELEMENTAL_ZONE = 350;');
out.push('var HORDE_BASE_ELEMENTAL_POWER = 20;');
out.push('var HORDE_SKELETON_DIFFICULTY = 10;');
out.push('var HORDE_SKELETON_TEETH = 10;');
out.push('var HORDE_SKELETON_WEAKNESS_MULT = 1e6;');
out.push('var HORDE_TOOTH_CHANCE_REDUCTION = 1.065;');
out.push('var SECONDS_PER_MINUTE = 60;');
out.push('var SECONDS_PER_HOUR = 3600;');
out.push('var SECONDS_PER_DAY = 86400;');
out.push('');

out.push(modConst('js/modules/horde/cardList.js', 'HO_CARDLIST'));
out.push(modConst('js/modules/horde/card.js', 'HO_CARD', [{ from: 'cardList', to: 'HO_CARDLIST' }]));
out.push(modConst('js/modules/horde/achievement.js', 'HO_ACHIEVEMENT'));
out.push(modConst('js/modules/horde/heirloom.js', 'HO_HEIRLOOM'));
out.push(modConst('js/modules/horde/equipment.js', 'HO_EQUIPMENT'));
out.push(modConst('js/modules/horde/relic.js', 'HO_RELIC'));
out.push(modConst('js/modules/horde/sigil.js', 'HO_SIGIL'));
out.push(modConst('js/modules/horde/sigil_boss.js', 'HO_SIGILBOSS'));
out.push(modConst('js/modules/horde/upgrade.js', 'HO_UPGRADE'));
out.push(modConst('js/modules/horde/upgrade2.js', 'HO_UPGRADE2'));
out.push(modConst('js/modules/horde/upgradePremium.js', 'HO_UPGRADEPREM'));
out.push(modConst('js/modules/horde/upgradePrestige.js', 'HO_UPGRADEPREST'));
out.push(modConst('js/modules/horde/tower.js', 'HO_TOWER'));
out.push(modConst('js/modules/horde/battlePass.js', 'HO_BATTLEPASS'));
out.push(modConst('js/modules/horde/enemyType.js', 'HO_ENEMYTYPE'));
out.push(modConst('js/modules/horde/boss.js', 'HO_BOSS'));
out.push(modConst('js/modules/horde/trinket.js', 'HO_TRINKET'));
out.push(modConst('js/modules/horde/element.js', 'HO_ELEMENT'));

// fighterClass 子目录
out.push(modConst('js/modules/horde/fighterClass/adventurer.js', 'HO_ADVENTURER'));
out.push(modConst('js/modules/horde/fighterClass/archer.js', 'HO_ARCHER'));
out.push(modConst('js/modules/horde/fighterClass/assassin.js', 'HO_ASSASSIN'));
out.push(modConst('js/modules/horde/fighterClass/cultist.js', 'HO_CULTIST'));
out.push(modConst('js/modules/horde/fighterClass/knight.js', 'HO_KNIGHT'));
out.push(modConst('js/modules/horde/fighterClass/mage.js', 'HO_MAGE'));
out.push(modConst('js/modules/horde/fighterClass/pirate.js', 'HO_PIRATE'));
out.push(modConst('js/modules/horde/fighterClass/scholar.js', 'HO_SCHOLAR'));
out.push(modConst('js/modules/horde/fighterClass/shaman.js', 'HO_SHAMAN'));
out.push(modConst('js/modules/horde/fighterClass/undead.js', 'HO_UNDEAD'));

// area 子目录
out.push(modConst('js/modules/horde/area/warzone.js', 'HO_WARZONE'));
out.push(modConst('js/modules/horde/area/monkeyJungle.js', 'HO_MONKEYJUNGLE'));
out.push(modConst('js/modules/horde/area/loveIsland.js', 'HO_LOVEISLAND'));

// 组装 HO_GOOBOO
out.push('');
out.push('const HO_GOOBOO = {');
out.push('  fighterClass: { adventurer: HO_ADVENTURER, archer: HO_ARCHER, assassin: HO_ASSASSIN, cultist: HO_CULTIST, knight: HO_KNIGHT, mage: HO_MAGE, pirate: HO_PIRATE, scholar: HO_SCHOLAR, shaman: HO_SHAMAN, undead: HO_UNDEAD },');
out.push('  area: { warzone: HO_WARZONE, monkeyJungle: HO_MONKEYJUNGLE, loveIsland: HO_LOVEISLAND },');
out.push('  achievement: HO_ACHIEVEMENT, heirloom: HO_HEIRLOOM, equipment: HO_EQUIPMENT, relic: HO_RELIC,');
out.push('  sigil: HO_SIGIL, sigil_boss: HO_SIGILBOSS, upgrade: HO_UPGRADE, upgrade2: HO_UPGRADE2,');
out.push('  upgradePremium: HO_UPGRADEPREM, upgradePrestige: HO_UPGRADEPREST, tower: HO_TOWER,');
out.push('  battlePass: HO_BATTLEPASS, enemyType: HO_ENEMYTYPE, boss: HO_BOSS, trinket: HO_TRINKET,');
out.push('  element: HO_ELEMENT, card: HO_CARD, cardList: HO_CARDLIST');
out.push('};');
out.push('');
out.push('if (typeof module !== "undefined") module.exports = { HO_GOOBOO };');

fs.writeFileSync(path.join(OUT, 'ho_data.js'), out.join('\n'), 'utf8');
console.log('ho_data.js 生成完成', out.length, '行');

// ---- ho_mod.js：modules/horde.js 用 IIFE 包裹，数据名以参数注入 ----
{
  let m = read('js/modules/horde.js');
  const pre = stripImports(m);
  // 去 import
  m = pre;
  m = m.replace(/\bstore\b/g, 'HOSTORE');
  // export default -> HO_MODULE =
  m = m.replace(/export default\s*\{/, 'return {');
  m = m.trim();
  // 末尾可能有多余闭合; 无关紧要
  const params = [
    'achievement','heirloom','equipment','relic','sigil','upgrade','upgrade2','upgradePremium','upgradePrestige',
    'tower','warzone','loveIsland','monkeyJungle','battlePass','archer','mage','knight','assassin','shaman','pirate',
    'undead','cultist','scholar','adventurer','enemyType','boss','trinket','sigil_boss','element'
  ];
  const argv = [
    'HO_ACHIEVEMENT','HO_HEIRLOOM','HO_EQUIPMENT','HO_RELIC','HO_SIGIL','HO_UPGRADE','HO_UPGRADE2','HO_UPGRADEPREM','HO_UPGRADEPREST',
    'HO_TOWER','HO_WARZONE','HO_LOVEISLAND','HO_MONKEYJUNGLE','HO_BATTLEPASS','HO_ARCHER','HO_MAGE','HO_KNIGHT','HO_ASSASSIN','HO_SHAMAN','HO_PIRATE',
    'HO_UNDEAD','HO_CULTIST','HO_SCHOLAR','HO_ADVENTURER','HO_ENEMYTYPE','HO_BOSS','HO_TRINKET','HO_SIGILBOSS','HO_ELEMENT'
  ];
  let block = '/* ============================================================\n';
  block += ' * ho_mod.js —— 降妖战斗总模块（照抄 gooboo modules/horde.js）\n';
  block += ' * 机械变换：去 import；数据名以 IIFE 参数注入；`store`->`HOSTORE`。\n';
  block += ' * ============================================================ */\n\n';
  block += 'const HO_MODULE = (function(' + params.join(', ') + ') {\n';
  block += m + '\n';
  block += '})(' + argv.join(', ') + ');\n\n';
  block += 'if (typeof module !== "undefined") module.exports = { HO_MODULE };';
  fs.writeFileSync(path.join(OUT, 'ho_mod.js'), block, 'utf8');
  console.log('ho_mod.js 生成完成');
}

// ---- ho_store.js：照抄 store/horde.js ----
{
  let st = read('store/horde.js');
  let storePre = '';
  {
    const preB = st.split('export default')[0];
    const lastImport = preB.lastIndexOf('\nimport');
    const preC = lastImport === -1 ? preB : preB.slice(lastImport + 1);
    const cleaned = preC.replace(/^import.*$/gm, '').trim();
    if (cleaned) storePre = cleaned + '\n';
  }
  st = stripImports(st);
  if (storePre) st = st.split(storePre).filter(x => x.trim()).join('\n') || st;
  st = st.replace(/export default\s*\{\s*namespaced:\s*true,/, 'HO_STORE = {');
  st = st.trim().replace(/;?\s*$/, '');
  st = st.replace(/\bVue\.set\b/g, 'VUESET');
  st = st.replace(/\bstore\b/g, 'HOSTORE');

  let out2 = '/* ============================================================\n';
  out2 += ' * ho_store.js —— 降妖 store（getters/mutations/actions，照抄 store/horde.js）\n';
  out2 += ' * 机械变换：import/export 剥离；Vue.set->VUESET；`store`->`HOSTORE`。\n';
  out2 += ' * ============================================================ */\n\n';
  out2 += 'function VUESET(obj, key, value) { obj[key] = value; }\n\n';
  out2 += storePre + 'const ' + st + ';\n\n';
  out2 += 'if (typeof module !== "undefined") module.exports = { HO_STORE };';
  fs.writeFileSync(path.join(OUT, 'ho_store.js'), out2, 'utf8');
  console.log('ho_store.js 生成完成');
}

// 语法校验（node 单独载入时补全局工具存根；浏览器端由 fork 内核提供）
global.buildNum = (n, suffix) => n;
global.formatNum = (n, d) => String(Math.floor(n));
global.formatInt = (n) => String(n);
global.buildArray = n => Array.from({ length: n }, (_, i) => i);
global.capitalize = t => t.charAt(0).toUpperCase() + t.slice(1);
global.decapitalize = t => t.charAt(0).toLowerCase() + t.slice(1);
try {
  const { HO_GOOBOO } = require(path.join(OUT, 'ho_data.js'));
  console.log('HO_GOOBOO 键：', Object.keys(HO_GOOBOO).join(','));
  console.log('  equipment 数：', Object.keys(HO_GOOBOO.equipment).length);
  console.log('  upgrade 数：', Object.keys(HO_GOOBOO.upgrade).length + Object.keys(HO_GOOBOO.upgrade2).length + Object.keys(HO_GOOBOO.upgradePrestige).length + Object.keys(HO_GOOBOO.upgradePremium).length);
  console.log('  sigil 数：', Object.keys(HO_GOOBOO.sigil).length, '+ sigil_boss', Object.keys(HO_GOOBOO.sigil_boss).length);
  const st2 = require(path.join(OUT, 'ho_store.js'));
  console.log('  store actions：', Object.keys(st2.HO_STORE.actions).length);
  // ho_mod 依赖 ho_data 的 HO_* 数据 const（浏览器端由 script 顺序提供）；node 段用空对象存根即可做语法/结构校验
  ['ACHIEVEMENT','HEIRLOOM','EQUIPMENT','RELIC','SIGIL','UPGRADE','UPGRADE2','UPGRADEPREM','UPGRADEPREST',
   'TOWER','WARZONE','LOVEISLAND','MONKEYJUNGLE','BATTLEPASS','ARCHER','MAGE','KNIGHT','ASSASSIN','SHAMAN','PIRATE',
   'UNDEAD','CULTIST','SCHOLAR','ADVENTURER','ENEMYTYPE','BOSS','TRINKET','SIGILBOSS','ELEMENT','CARD']
    .forEach(n => global['HO_' + n] = {});
  const mod = require(path.join(OUT, 'ho_mod.js'));
  console.log('  HO_MODULE.tick:', typeof mod.HO_MODULE.tick, 'init:', typeof mod.HO_MODULE.init, 'saveGame:', typeof mod.HO_MODULE.saveGame);
} catch (e) {
  console.error('语法校验失败：', e);
}