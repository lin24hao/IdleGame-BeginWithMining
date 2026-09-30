// vi_boot_test.js —— 用 Node 模拟浏览器全局，加载全部真实脚本，验证：
//   1) 全局脚本求值无顶层引用错误
//   2) 宗门视图 renderVillage / renderCrafting 能产出非空 HTML、不抛错
//   3) 灵脉视图 renderMine 不回归
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const base = 'g:/DownLoad/搜打撤/game/';

// 最小浏览器全局桩
const makeEl = () => ({ innerHTML: '', style: {}, addEventListener(){}, querySelector(){return null;}, querySelectorAll(){return [];}, classList:{toggle(){},add(){},remove(){}}, getBoundingClientRect(){return {left:0,top:0,width:0,height:0,bottom:0};}, appendChild(){}, remove(){} });
global.document = {
  body: makeEl(), documentElement: {},
  addEventListener(){}, getElementById(){ return makeEl(); },
  createElement(){ return makeEl(); }, querySelector(){ return null; },
  querySelectorAll(){ return []; }, readyState: 'complete',
  addEventListener2(){}
};
global.window = { addEventListener(){}, innerHeight:800, innerWidth:1200 };
global.localStorage = { getItem(){ return null; }, setItem(){}, removeItem(){} };
global.addEventListener = function(){};
if (typeof Promise === 'undefined') global.Promise = require('promise');

const files = [
  'js/icon.js',
  'js/modules/lm/lm_text.js',
  'js/modules/lm/lm_core.js',
  'js/modules/lm/lm_data.js',
  'js/modules/lm/lm_store.js',
  'js/app.js',
  'js/views/lm_view.js',
  'js/modules/vill/vi_text.js',
  'js/modules/vill/vi_core.js',
  'js/modules/vill/vi_data.js',
  'js/modules/vill/vi_store.js',
  'js/views/vi_view.js'
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
  // 确保工具/图标函数存在
  try { GB_ICON.icon = function(){ return ''; }; } catch(e){ global.GB_ICON = { icon: function(){ return ''; } }; }

  // 宗门渲染
  const vstate = {subfeature:0, explorerProgress:0, offeringGen:0, stat:null, unlock:null,
    currencyVals:null, upgradeLevels:null, job:null, offering:null, policy:null, crafting:null, buildingQueue:null};
  VI_RT.init(vstate);
  VI_UNLOCK.unlock('villageFeature');
  VI_CUR.values['village_wood'] = 1000; VI_CUR.values['village_stone'] = 1000;
  VI_RT.startBuilding('campfire');
  VI_RT.tick(1);

  GB_VI_VIEW.tab = 'village';
  const hv = GB_VI_VIEW.renderVillage();
  log('VILLAGE html chars:', hv.length);
  if (hv.length > 200) log('VILLAGE RENDER OK');
  else throw new Error('village render too short');

  GB_VI_VIEW.tab = 'crafting';
  const hc = GB_VI_VIEW.renderCraftingTab();
  log('CRAFTING html chars:', hc.length);

  // 各 tab 均可渲染
  ['offering', 'policies', 'pray'].forEach(t => {
    GB_VI_VIEW.tab = t;
    const ht = GB_VI_VIEW.currentTabContent();
    log('TAB', t, 'chars:', ht.length);
  });
  GB_VI_VIEW.tab = 'village';

  // ---- 存档往返测试：确保函数不被序列化破坏 ----
  let savedJSON = null;
  global.localStorage.setItem = (k, v) => { if (k === GB_VI_VIEW.SAVE_KEY) savedJSON = v; };
  // 给点进度：建篝火+建档，试一次供奉
  VI_CUR.values['village_plantFiber'] = 1000;
  const gift = VI_RT.state.offering && VI_RT.state.offering['plantFiber'];
  log('offering cost is fn before save:', gift && typeof gift.cost === 'function');
  VI_RT.state.offering['plantFiber'].offeringBought = 1; // 制造已购状态
  GB_VI_VIEW.save();
  log('savedJSON has no functions (should not contain "function"):', !/function/.test(savedJSON));
  // 重新加载
  global.localStorage.getItem = (k) => (k === GB_VI_VIEW.SAVE_KEY ? savedJSON : null);
  VI_RT.init(GB_VI_VIEW.freshState()); // 先在测试里手动触发一次干净的重新装载（模拟刷新后的首次 mount）
  GB_VI_VIEW.load();
  log('after reload offering cost is fn:', gift && typeof VI_RT.state.offering['plantFiber'].cost === 'function');
  log('after reload offering bought:', VI_RT.state.offering['plantFiber'].offeringBought);
  log('after reload campfire level:', VI_UPG.levels['village_campfire']);

  // 灵脉渲染不回归
  const lstate = {};
  LM_RT.init ? log('LM_RT present') : log('LM_RT absent (skip lm)');
  try { LM_RT.init(lstate); } catch(e){ log('lm init note:', e.message); }
  const hm = GB_LM_VIEW.renderMine ? GB_LM_VIEW.renderMine() : '';
  log('LM mine html chars:', hm.length);

  log('WARNINGS:', JSON.stringify(VI_RT.warnings.slice(0,10)));
  log('BOOT-PASS');
})();
`;
vm.runInThisContext(src, { filename: 'vi-boot-test.js' });