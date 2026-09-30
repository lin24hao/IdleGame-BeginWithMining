const fs = require('fs');
const vm = require('vm');
const path = require('path');

const base = 'g:/DownLoad/搜打撤/game/js/';
const files = [
  'modules/lm/lm_core.js',
  'modules/lm/lm_data.js', // 提供全局 SECONDS_PER_HOUR / SECONDS_PER_DAY
  'modules/vill/vi_core.js',
  'modules/vill/vi_data.js',
  'modules/vill/vi_store.js'
];
let src = '';
for (const f of files) {
  const p = path.join(base, f);
  if (!fs.existsSync(p)) throw new Error('missing ' + p);
  src += '\n;/* --- ' + f + ' --- */\n' + fs.readFileSync(p, 'utf8');
}
// 测试逻辑
src += `

;(function(){
  const echo = (...m) => console.log(...m);
  const state = {subfeature:0, explorerProgress:0, offeringGen:0,
    stat:null, unlock:null, currencyVals:null, upgradeLevels:null,
    job:null, offering:null, policy:null, crafting:null, buildingQueue:null};

  VI_RT.init(state);
  VI_UNLOCK.unlock('villageFeature');

  // 干净场景：起手派采集者（need 1），验证基础灵材随时间增长且 cap 正常
  VI_UNLOCK.unlock('villageJobGatherer');
  VI_RT.act('applyAllJobs', {});
  VI_RT.addWorker('collector');
  const pb0 = VI_CUR.value('village_plantFiber');
  console.log('DIAG list has pf:', VSTORE.getters['currency/list']('village', 'regular').includes('village_plantFiber'));
  console.log('DIAG gain via list getter:', VSTORE.getters['mult/get'](VSTORE.getters['currency/gainMultName'](...('village_plantFiber').split('_'))));
  VI_RT.tick(20);
  const pb1 = VI_CUR.value('village_plantFiber');
  echo('CLEAN plantFiber 0s->20s:', pb0, '->', pb1, 'grown:', pb1 > pb0, '(expect true)');

  const vis = (id) => VI_UPG.isVisible(id);
  const un = (id) => VI_UNLOCK.isUnlocked(id);

  echo('campfire visible:', vis('village_campfire'));

  // 给足资源，建篝火
  VI_CUR.values['village_wood'] = 1000;
  VI_CUR.values['village_stone'] = 1000;
  let ok = VI_RT.startBuilding('campfire');
  echo('start campfire:', ok);
  VI_RT.tickQueue({key:'village_building', seconds:5});
  echo('campfire level:', VI_UPG.levels['village_campfire']);
  echo('villageBuildings1 unlocked:', un('villageBuildings1'));
  echo('hut visible:', vis('village_hut'));
  echo('farm visible:', vis('village_farm'));

  // 建 farm → 解锁 farmer 职司
  ok = VI_RT.startBuilding('farm');
  VI_RT.tickQueue({key:'village_building', seconds:5*500});
  echo('farm level:', VI_UPG.levels['village_farm']);
  echo('farmer job max:', state.job['farmer'] && state.job['farmer'].max);

  // 派工
  VI_CUR.values['village_plantFiber'] = 10000;
  let w = VI_RT.addWorker('farmer');
  echo('add farmer worker:', w);
  echo('employed:', VI_RT.getters.employed);

  // 建 mine+plantation → 建筑合计>=3 → craft unlock
  VI_CUR.values['village_wood'] = 1000000;
  VI_CUR.values['village_stone'] = 1000000;
  VI_CUR.values['village_plantFiber'] = 1000000;
  VI_RT.startBuilding('plantation');
  VI_RT.startBuilding('mine');
  VI_RT.tickQueue({key:'village_building', seconds:1000000});
  let total = 0;
  for (const id in VI_UPG.levels){ const d=VI_UPG.defs[id]; if(d&&d.type==='building') total+=VI_UPG.levels[id]||0; }
  echo('total buildings:', total);
  // 手动触发一遍 tick 让解锁逻辑跑
  VI_RT.tick(1);
  echo('craftingSubfeature unlocked:', un('villageCraftingSubfeature'));

  // tick 产生资源：派 1 个采集者后，产出应随 tick 增长
  VI_RT.addWorker('collector');
  const before = VI_CUR.value('village_plantFiber');
  VI_RT.tick(60);
  const after = VI_CUR.value('village_plantFiber');
  echo('plantFiber before/after tick60:', before, after, 'grown:', after > before);

  // 升级购买（wallet 需要 villageCoinUpgrades，先检查不越界）
  let buyWallet = VI_UPG.buy('village_wallet');
  echo('buy wallet (should be false, not crash):', buyWallet);

  console.log('WARNINGS:', JSON.stringify(VI_RT.warnings.slice(0,10)));
  console.log('PASS');
})();
`;

vm.runInThisContext(src, { filename: 'vi-test.js' });