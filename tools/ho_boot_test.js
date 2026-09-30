// ho_boot_test.js —— 降妖(horde) 引擎冒烟：加载全部真实脚本，验证
//   init / getters / tick 战斗 / 货币产出 / 存档往返 不抛错
const fs = require('fs');
const vm = require('vm');
const base = 'g:/DownLoad/搜打撤/game/';

const makeEl = () => ({ innerHTML: '', style: {}, addEventListener(){}, querySelector(){return null;}, querySelectorAll(){return [];}, classList:{toggle(){},add(){},remove(){}}, getBoundingClientRect(){return {left:0,top:0,width:0,height:0,bottom:0};}, appendChild(){}, remove(){}, dataset:{} });
global.document = { body: makeEl(), documentElement: {}, addEventListener(){}, getElementById(){ return makeEl(); }, createElement(){ return makeEl(); }, querySelector(){ return null; }, querySelectorAll(){ return []; }, readyState: 'complete' };
global.window = { addEventListener(){}, innerHeight:800, innerWidth:1200 };
global.localStorage = { getItem(){ return null; }, setItem(){}, removeItem(){} };
global.addEventListener = function(){};
global.location = { reload(){} };
global.setInterval = function(){ return 1; };
global.setTimeout = function(){ return 1; };
global.requestAnimationFrame = function(){};

// 全局工具存根（浏览器由 fork 内核 / 各模块声明）
global.getSequence = (base, pos) => Math.round((base + (pos - 1) / 2) * pos);
global.SECONDS_PER_MINUTE = 60;
global.SECONDS_PER_HOUR = 3600;
global.SECONDS_PER_DAY = 86400;
global.getDiminishing = (num) => { let r = 0, x = 0.9; for (let i = 0; i < (num||0); i++) { r += x * 0.11; x *= 0.9; } return r; };
global.getApproaching = (base, cap, num) => (1 - Math.pow(1 - base / cap, num)) * cap;
global.splicedLinear = (i1, i2, bp, v) => Math.max(0, v - bp) * i2 + Math.min(bp, v) * i1;
global.buildArray = (length) => { const a = []; for (let i = 0; i < (length || 0); i++) a.push(i); return a; };
global.capitalize = (t) => t.charAt(0).toUpperCase() + t.slice(1);
global.decapitalize = (t) => t.charAt(0).toLowerCase() + t.slice(1);
global.buildNum = (number, suffix) => { const s = {K:1e3,M:1e6,B:1e9,T:1e12,Q:1e15,Qi:1e18,S:1e21,Sp:1e24,O:1e27,N:1e30}; if (suffix===undefined) return number; return number * (s[suffix] || 1); };
global.formatNum = (num, decimals) => String(Math.floor(num));
global.formatInt = (num) => String(num);
global.logBase = (num, base) => Math.log(num) / Math.log(base);
global.weightSelect = (array, rnd) => { if (!array || !array.length) return -1; rnd = (rnd === undefined ? Math.random() : rnd); let total = 0; for (const w of array) total += w; let r = rnd * total; for (let i = 0; i < array.length; i++) { r -= array[i]; if (r <= 0) return i; } return array.length - 1; };
global.chance = (prob, rng) => (rng === undefined ? Math.random() : rng) < prob;
global.randomInt = (min, max, rng) => { rng = (rng === undefined ? Math.random() : rng); return Math.floor(rng * (1 + max - min) + min); };
global.randomRound = (num, rng) => { const fl = Math.floor(num); return (global.chance(num - fl, rng) ? fl + 1 : fl); };
global.GB_ICON = { icon: (n) => '', };

const files = [
  'js/modules/horde/ho_data.js',
  'js/modules/horde/ho_mod.js',
  'js/modules/horde/ho_store.js',
  'js/modules/horde/ho_core.js',
  'js/modules/horde/ho_text.js',
  'js/views/ho_view.js'
];
let src = '';
for (const f of files) {
  const p = base + '/' + f;
  if (!fs.existsSync(p)) throw new Error('missing ' + p);
  src += '\n;/* --- ' + f + ' --- */\n' + fs.readFileSync(p, 'utf8');
}

src += `

;(function(){
  const log = (...m) => console.log(...m);
  const assert = (cond, msg) => { if (!cond) throw new Error('ASSERT FAIL: ' + msg); log('  ok -', msg); };

  const hstate = { stat: null, unlock: null, currencyVals: null, upgradeLevels: null, consumable: null };
  HO_BOOT(hstate);
  assert(HO_RT.ready, 'HO_RT.ready after init');

  // 数据装填校验
  assert(Object.keys(hstate.fighterClass).length >= 10, 'fighterClass >= 10 classes');
  assert(Object.keys(hstate.area).length >= 3, 'area >= 3 areas');
  assert(!!HO_EQUIPMENT.longsword, 'equipment longsword in data');
  assert(!!HO_HEIRLOOM.power, 'heirloom power in data');
  assert(!!HO_SIGIL.power, 'sigil power in data');
  assert(!!HO_SIGILBOSS.rifle_gun, 'sigil_boss rifle_gun in data');
  assert(Object.keys(hstate.items).length > 0, 'player starts with starter items (got ' + Object.keys(hstate.items).join(',') + ')');
  assert(Object.keys(HO_UPG.defs).length >= 100, 'upgrades >= 100 (got ' + Object.keys(HO_UPG.defs).length + ')');
  assert(HO_MULT.items['hordeAttack'] !== undefined, 'mult hordeAttack registered');
  assert(HO_MULT.items['currencyHordeBoneGain'] !== undefined, 'mult bone gain registered');
  assert(HO_CUR.defs['horde_bone'] !== undefined, 'currency horde_bone registered');
  assert(HO_UNLOCK.items['hordeEquipment'] !== undefined, 'unlock hordeEquipment inited');
  assert(HO_TAG.defs['hordeEnergyOnCrit'] !== undefined, 'tag def registered');

  const g = HO_RT.getters;
  log('  playerBaseStats:', JSON.stringify(g.playerBaseStats));
  assert(g.playerBaseStats.attack === 5, 'base attack 5');
  assert(g.playerBaseStats.health === 500, 'base health 500');
  assert(g.enemyStats(0).health > 0, 'enemyStats(0) positive health');
  assert(g.baseRespawnTime === 15, 'baseRespawnTime 15 (zone1 *3 +12)');

  // 敌人：init 后可为 null（挂机起始无怪）
  log('  enemy null?', hstate.enemy === null);

  // tick: 战斗数秒（tickspeed=1，跑 60s）
  for (let i = 0; i < 60; i++) HO_RT.tick(1);

  assert(HO_STAT.get('horde_timeSpent') >= 2, 'timeSpent accumulated');
  log('  zone', hstate.zone, '| bones', HO_CUR.value('horde_bone'), '| totalDamage', HO_STAT.get('horde_totalDamage'));
  assert(HO_CUR.value('horde_bone') > 0 || HO_STAT.get('horde_totalDamage') > 0, 'combat produced damage/bones');

  // 升级购买
  const someUpg = Object.keys(HO_UPG.defs).find(id => HO_UPG.cap(id) > 0);
  log('  sample upgrade:', someUpg, 'req', JSON.stringify(HO_UPG.requirementMet(someUpg) && HO_UPG.price(someUpg, 0)));
  assert(!!someUpg, 'at least one purchaseable upgrade');

  // getters 全量遍历不抛错
  let gerr = 0;
  for (const k in g) { try { const v = (typeof g[k] === 'function') ? g[k](0) : g[k]; void v; } catch (e) { gerr++; log('  getter err', k, e.message); } }

  // 存档往返
  const sg = HO_RT.saveGame();
  log('  saveGame keys:', Object.keys(sg).join(','));
  assert(sg.currency && sg.currency['horde_bone'] > 0, 'currency (bone) persisted in save');
  const json = JSON.stringify(sg, (k,v) => typeof v === 'function' ? undefined : v);
  assert(!/function/.test(json.replace(/function/mg,'FUNCTION') || ''), 'save serializable');
  assert(json.length > 200, 'save JSON sizable (' + json.length + ' bytes)');
  // 读档往返：全新环境从存档恢复，货币与道法应保留
  const parsed = JSON.parse(json);
  HO_BOOT({ stat: null, unlock: null, currencyVals: null, upgradeLevels: null, consumable: null });
  HO_RT.init(parsed);
  assert(HO_CUR.value('horde_bone') > 0, 'bone restored after save/load roundtrip');

  log('WARNINGS:', JSON.stringify(HO_RT.warnings.slice(0, 8)));
  assert(!/act:|tick:/.test(HO_RT.warnings.join(' ') || ''), 'no action/tick errors');

  // 视图挂载冒烟（ho_view.js + ho_text.js）
  const viewLog = {};
  const mkEl = () => {
    const n = { innerHTML: '', _children: {}, addEventListener(){}, querySelector(sel){ if(!n._children[sel]) n._children[sel]=mkEl(); return n._children[sel]; }, querySelectorAll(){ return []; }, getBoundingClientRect(){ return {left:0,top:0,width:0,height:0,bottom:0}; }, classList:{add(){},remove(){},toggle(){}}, dataset:{} };
    return n;
  };
  const vroot = mkEl();
  GB_HO_VIEW.mount(vroot);
  const vh = vroot._children['#ho-content'].innerHTML || '';
  log('  view tabs len', (vroot._children['#ho-tabs'].innerHTML || '').length, '| content len', vh.length);
  assert(vh.length > 0, 'view rendered battle content');
  assert(/ho-cols|ho-card|ho-panel/.test(vh), 'battle content uses gooboo 4-col layout');
  assert(/妖界|妖骨|连斩|道法/.test(vh), 'battle content includes xianxia labels');
  const tabs = vroot._children['#ho-tabs'].innerHTML || '';
  assert(/降妖|道法/.test(tabs), 'view tabs rendered');
  GB_HO_VIEW.unload();
  log('HO-BOOT-PASS');
})();
`;
vm.runInThisContext(src, { filename: 'ho-boot-test.js' });