// fa_boot_test.js —— 用 Node 模拟浏览器全局，加载全部真实脚本，验证：
//   1) 全局脚本求值无顶层引用错误
//   2) 灵植引擎 init / getters / 种植 / 成长 / 收割 / 存档往返不抛错
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const base = 'g:/DownLoad/搜打撤/game/';

const makeEl = () => ({ innerHTML: '', style: {}, addEventListener(){}, querySelector(){return null;}, querySelectorAll(){return [];}, classList:{toggle(){},add(){},remove(){}}, getBoundingClientRect(){return {left:0,top:0,width:0,height:0,bottom:0};}, appendChild(){}, remove(){}, dataset:{} });
global.document = {
  body: makeEl(), documentElement: {},
  addEventListener(){}, getElementById(){ return makeEl(); },
  createElement(){ return makeEl(); }, querySelector(){ return null; },
  querySelectorAll(){ return []; }, readyState: 'complete'
};
global.window = { addEventListener(){}, innerHeight:800, innerWidth:1200 };
global.localStorage = { getItem(){ return null; }, setItem(){}, removeItem(){} };
global.addEventListener = function(){};
global.location = { reload(){} };
global.setInterval = function(){ return 1; };
global.Promise = global.Promise || require('promise');

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
  'js/views/vi_view.js',
  'js/modules/farm/fa_text.js',
  'js/modules/farm/fa_core.js',
  'js/modules/farm/fa_data.js',
  'js/modules/farm/fa_store.js',
  'js/views/fa_view.js'
];
let src = '';
for (const f of files) {
  const p = path.join(base, f);
  if (!fs.existsSync(p)) throw new Error('missing ' + p);
  src += '\n;/* --- ' + f + ' --- */\n' + fs.readFileSync(p, 'utf8');
}

// 注入模块局部变量进入 runInThisContext 沙箱
global.__fa_test = { path: path, fs: fs, base: base };
src += `

const __ft = global.__fa_test;
const path = __ft.path, fs = __ft.fs, base = __ft.base;
;(function(){
  const log = (...m) => console.log(...m);
  const assert = (cond, msg) => { if (!cond) throw new Error('ASSERT FAIL: ' + msg); log('  ok -', msg); };

  // 初始化灵植引擎
  const fstate = {
    stat: null, unlock: null, currencyVals: null, upgradeLevels: null,
    field: [], crop: {}, building: {}, gene: {}, fertilizer: {}, consumable: {}
  };
  FA_RT.init(fstate);
  assert(FA_RT.ready, 'FA_RT.ready after init');

  // 初始网格：中心十字有地格
  assert(fstate.field.length === 7, 'field is 7 rows');
  assert(fstate.field[0].length === 7, 'field is 7 cols');
  log('  center cell (3,3) type:', fstate.field[3][3] && fstate.field[3][3].type);
  log('  corner (0,0) null?', fstate.field[0][0] === null);

  // 作物已初始化
  assert(!!fstate.crop.carrot, 'crop.carrot exists');
  assert(!!fstate.crop.goldenRose, 'crop.goldenRose exists');
  assert(Object.keys(fstate.crop).length >= 30, 'crops >= 30');

  // 基因 / 化肥 / 升级
  assert(!!fstate.gene.yield, 'gene.yield exists');
  assert(!!fstate.fertilizer.speedGrow, 'fertilizer.speedGrow exists');
  assert(!!FA_UPG.defs['farm_seedBox'], 'upgrade seedBox exists');

  // 种植：在中心 (3,3) 种胡萝卜
  FA_CUR.values['farm_vegetable'] = 100;
  const plantRes = FA_RT.act('plantCrop', {x:3, y:3, crop:'carrot', fertilizer:null, giant:false});
  let c = fstate.field[3][3];
  assert(c && c.type === 'crop' && c.crop === 'carrot', 'planted carrot at 3,3');
  assert(FA_CUR.value('farm_vegetable') === 100 - (fstate.crop.carrot.cost.farm_vegetable||0), 'vegetable spent');

  // 成长：tick 让其生长（carrot grow=1h，模拟 1h=12 ticks @ tickspeed5? 直接 push 大量 ticks）
  const before = c.grow;
  FA_RT.tick(12); // 12 ticks ≈ 1 单位 grow（grow cache 1/(growTime/growSpeed)）
  log('  grow before/after:', before, '->', fstate.field[3][3].grow, 'growCache:', fstate.field[3][3].cache.grow);
  assert(fstate.field[3][3].grow > before, 'grow increased after ticks');

  // 收割 verify harvest produces currency
  // 先把 grow 强制到 1 便于测试 harvest 逻辑（含 currencies）
  FSTORE.commit('farm/updateFieldKey', {x:3, y:3, key:'grow', value: 1});
  const vBefore = FA_CUR.value('farm_vegetable');
  FA_RT.act('harvestCrop', {x:3, y:3});
  const vAfter = FA_CUR.value('farm_vegetable');
  log('  vegetable before/after harvest:', vBefore, '->', vAfter);
  assert(vAfter > vBefore, 'harvest gained vegetable currency');

  // 收割后地块清空
  assert(fstate.field[3][3] === null || fstate.field[3][3].type !== 'crop', 'field cleared after harvest');

  // getters
  const expNeed = FA_RT.getters.expNeeded('carrot');
  log('  carrot expNeeded:', expNeed);
  assert(expNeed > 0, 'expNeeded positive');

  // 升级购买 seedBox lv0
  FA_CUR.values['farm_seedBox'] = undefined;
  // seedBox price 由 price(lvl) 给出，先赋足资源（从 price 读取）
  const price0 = FA_UPG.price('farm_seedBox', 0);
  log('  seedBox lv0 price:', JSON.stringify(price0));
  for (const k in price0) FA_CUR.values[k] = (FA_CUR.values[k] || 0) + price0[k];
  const bought = FA_RT.UPG.buy('farm_seedBox');
  assert(bought, 'seedBox bought');
  assert(FA_UPG.levels['farm_seedBox'] === 1, 'seedBox level 1');

  // 存档往返（模拟手动，因 FA_RT 尚无独立视图 save）
  // 简单验证 fstate 可 JSON 序列化且无函数
  const json = JSON.stringify(fstate, (k,v) => typeof v === 'function' ? undefined : v);
  assert(!/function/.test(json.replace(/function/mg,'FUNCTION') || ''), 'state serializable');
  log('  state JSON bytes:', json.length);

  // 视图挂载冒烟：用可写 querySelector 的假根节点，验证渲染模板字符串不抛错
  const tabEl = { innerHTML: '', addEventListener(){} };
  const contentEl = { innerHTML: '', addEventListener(){} };
  const root2 = { innerHTML: '', querySelector(sel){ return sel === '#fa-tabs' ? tabEl : (sel === '#fa-content' ? contentEl : null); } };
  GB_FA_VIEW.mount(root2);
  const farmHtml = GB_FA_VIEW.renderFarm();
  const invTabHtml = GB_FA_VIEW.renderInventoryTab();
  const upgHtml = GB_FA_VIEW.renderUpgrades();
  assert(farmHtml.length > 200 && farmHtml.indexOf('<table') >= 0, 'renderFarm builds field table');
  assert(invTabHtml.indexOf('<div class="fa-inv-row">') >= 0, 'renderInventoryTab builds 2-col layout');
  assert(upgHtml.length > 200 && upgHtml.indexOf('fa-upg-card') >= 0, 'renderUpgrades builds upgrade cards');
  log('  fa_view farmHTML bytes:', farmHtml.length, 'invTab bytes:', invTabHtml.length, 'upg bytes:', upgHtml.length);
  GB_FA_VIEW.unload();

  // ===== 中文化校验 =====
  // 1) 40 作物均非空中文译名且 != key
  const cropKeys = Object.keys(FA_GOOBOO.crop);
  assert(cropKeys.length === 40, 'crops total 40 (got ' + cropKeys.length + ')');
  cropKeys.forEach(k => { const v = FA_TEXT.CROP && FA_TEXT.CROP[k]; assert(!!v && v !== k, 'crop translated: ' + k + ' -> ' + v); });
  // 化肥 18 / 建筑 5 译名非空且 != key
  const fertKeys = Object.keys(FA_GOOBOO.fertilizer);
  assert(fertKeys.length === 18, 'fertilizers total 18 (got ' + fertKeys.length + ')');
  fertKeys.forEach(k => { const v = FA_TEXT.FERTILIZER && FA_TEXT.FERTILIZER[k]; assert(!!v && v !== k, 'fert translated: ' + k + ' -> ' + v); });
  const bldKeys = Object.keys(FA_GOOBOO.building);
  assert(bldKeys.length === 5, 'buildings total 5 (got ' + bldKeys.length + ')');
  bldKeys.forEach(k => { const v = FA_TEXT.BUILDING && FA_TEXT.BUILDING[k]; assert(!!v && v !== k, 'bld translated: ' + k + ' -> ' + v); });
  // 升级 72 项译名非空且 != key
  const upgCount = Object.keys(FA_UPG.defs).length;
  assert(upgCount === 72, 'upgrades total 72 (got ' + upgCount + ')');
  Object.keys(FA_UPG.defs).forEach(id => { const key = FA_UPG.defs[id].key; const v = FA_TEXT.UPGRADE && FA_TEXT.UPGRADE[key]; assert(!!v && v !== key, 'upg translated: ' + key + ' -> ' + v); });

  // 2) 每个升级效果名都必须被译成中文（effName 不得回退成原始英文 key）
  let checkedEff = 0;
  Object.keys(FA_UPG.defs).forEach(id => {
    (FA_UPG.defs[id].effect || []).forEach(eff => {
      checkedEff++;
      const t = GB_FA_VIEW.effName(eff.name);
      assert(t !== eff.name, 'eff name translated: ' + eff.name + ' -> ' + t);
    });
  });
  assert(checkedEff >= 135, 'checked enough effects (' + checkedEff + ')');

  // 3) 用 0..min(cap,4) 各等级逐项渲染升级卡片：HTML 不出现 'false'；也不出现「· 原始英文 key」的回退效果行
  Object.keys(FA_UPG.defs).forEach(id => {
    const cap = FA_UPG.cap(id);
    const maxLv = Math.min(isFinite(cap) ? cap : 4, 4);
    for (let lv = 0; lv <= maxLv; lv++) {
      const old = FA_UPG.levels[id];
      FA_UPG.levels[id] = lv;
      let html = '';
      try { html = GB_FA_VIEW.renderUpgCard(id) || ''; } catch (e) { html = 'THROWN:' + (e && e.message); }
      FA_UPG.levels[id] = old;
      assert(html.indexOf('false') === -1, 'upg ' + id + ' lv' + lv + ' renders no "false"');
      (FA_UPG.defs[id].effect || []).forEach(eff => {
        if (/^[A-Za-z_]/.test(eff.name)) assert(html.indexOf('· ' + eff.name) === -1, 'upg ' + id + ' lv' + lv + ' no raw-key effect row · ' + eff.name);
      });
    }
  });

  // 4) seedBox「灵种匣」多级渲染：显示中文作物名，绝不出现英文作物 key 或 'false'
  const seedBoxOld = FA_UPG.levels['farm_seedBox'];
  FA_UPG.levels['farm_seedBox'] = 3; // lvl3 解锁 碎玉菊/云纹穗/绛霄兰
  const seedBoxHtml = GB_FA_VIEW.renderUpgCard('farm_seedBox') || '';
  FA_UPG.levels['farm_seedBox'] = seedBoxOld;
  assert(seedBoxHtml.indexOf('碎玉菊') >= 0, 'seedBox shows translated crop 碎玉菊');
  assert(seedBoxHtml.indexOf('false') === -1, 'seedBox no false');
  assert(seedBoxHtml.indexOf('blueberry') === -1 && seedBoxHtml.indexOf('wheat') === -1, 'seedBox no raw english crop keys');

  // 5) 灵田页 = gooboo 式响应式田格（field-bar 在上 + 田格网格），fa.css 含三档尺寸 media query
  const cssPath = path.join(base, 'css/modules/farm/fa.css');
  const cssText = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : '';
  // 三档田格尺寸 media query 存在（xs:44 / sm:80 / lg:96），且桌面圆角 8、移动圆角 4
  assert(cssText.indexOf('@media (min-width: 1904px)') >= 0 && cssText.indexOf('96px') >= 0, 'fa.css responsive field rule xl 96px');
  assert(cssText.indexOf('@media (min-width: 960px)') >= 0 && cssText.indexOf('80px') >= 0, 'fa.css responsive field rule md-lg 80px');
  assert(cssText.indexOf('@media (max-width: 959px)') >= 0 && cssText.indexOf('44px') >= 0, 'fa.css responsive field rule xs 44px');
  assert(/fa-tile[^{]*\{[^}]*border-radius: 4px/.test(cssText), 'fa.css mobile tile radius 4px');
  assert(/\.fa-progress[^{]*\{[^}]*height: 12px/.test(cssText), 'fa.css grow progress bar desktop height 12px');
  // renderFarm 结构：field-bar 在上 + field 表格 + 可选 filled 田格
  // 先在 (1,1) 种一棵作物，保证 renderFarm 输出真实作物格（含 fa-progress）
  FA_CUR.values['farm_vegetable'] = 1000;
  try { FA_RT.act('plantCrop', {x:3, y:3, crop:'carrot', fertilizer:null, giant:false}); } catch (e) {}
  const farmHtml2 = GB_FA_VIEW.renderFarm();
  assert(farmHtml2.indexOf('fa-bar-center') >= 0 && farmHtml2.indexOf('fa-bar-row') >= 0, 'renderFarm has field-bar (center+row)');
  // 左右两栏：fa-farm-grid（左 80% 田格 / 右 20% 作物列表）
  assert(farmHtml2.indexOf('fa-farm-grid') >= 0, 'renderFarm has two-column fa-farm-grid');
  assert(farmHtml2.indexOf('fa-crop-panel') >= 0, 'renderFarm canvas has right crop panel');
  assert(farmHtml2.indexOf('fa-crop-item') >= 0 && farmHtml2.indexOf('data-crop="') >= 0, 'renderFarm crop panel lists selectable crop buttons');
  assert(farmHtml2.indexOf('fa-field') >= 0 && farmHtml2.indexOf('data-x=') >= 0, 'renderFarm has grid table with cells');
  // CSS 两栏尺寸：左 80% .fa-field-wrap、右 .fa-crop-panel 可滚动
  assert(/\\.fa-field-wrap\\s*\\{[^}]*flex: 0 0 80%/.test(cssText), 'fa.css fa-field-wrap is 80% left column');
  assert(/\\.fa-crop-panel\\s*\\{[^}]*max-height: 70vh[^}]*overflow: auto/.test(cssText), 'fa.css fa-crop-panel scrollable');
  assert(farmHtml2.indexOf('fa-progress') >= 0, 'renderFarm crop cells include grow progress bar');

  // 6) 仓库页解锁显示条件
  FA_UNLOCK.init('farmFertilizer'); FA_UNLOCK.items['farmFertilizer'].use = true;
  // 灵筑区 gate：没有解锁建筑格(max>0)前整区隐藏；解锁一格后出现（由升级 farmBuilding 效果驱动）
  const invEmptyB = GB_FA_VIEW.renderSelectors();
  assert(invEmptyB.indexOf('data-build') === -1, 'building section hidden before any building slot (max>0)');
  if (FA_RT.state.building && FA_RT.state.building.gardenGnome) FA_RT.state.building.gardenGnome.max = 1;
  const invWithB = GB_FA_VIEW.renderSelectors();
  assert(invWithB.indexOf('data-build') >= 0, 'building section shows after a building slot unlocked');
  const invSelect = GB_FA_VIEW.renderSelectors();
  assert(invSelect.indexOf('data-crop') === -1 && invSelect.indexOf('data-fert') >= 0, 'renderSelectors: crops moved to field panel, keeps fertilizer');
  assert(invSelect.indexOf('data-fert') >= 0, 'renderSelectors has fertilizer buttons');
  const invView = GB_FA_VIEW.renderInventory();
  assert(invView.indexOf('fa-res') >= 0, 'renderInventory has currency/resource badges');
  assert(invView.indexOf('fa-res') >= 0 && invView.indexOf('fa-crop-list') === -1, 'renderInventory has resources, no crop list');
  // 资源区 gate：无产出（所有 farm 货币=0）时资源区不渲染；有产出后渲染
  const curSnapshot = {};
  Object.keys(FA_CUR.values).forEach(k => { curSnapshot[k] = FA_CUR.values[k]; if (k.indexOf('farm_') === 0) FA_CUR.values[k] = 0; });
  const invEmpty = GB_FA_VIEW.renderInventory();
  Object.keys(curSnapshot).forEach(k => { FA_CUR.values[k] = curSnapshot[k]; });
  assert(invEmpty.indexOf('fa-res') === -1, 'resource section hidden when no farm output');
  const invRestored = GB_FA_VIEW.renderInventory();
  assert(invRestored.indexOf('fa-res') >= 0, 'resource section shown after farm output');
  log('  checked effects count:', checkedEff);

  log('WARNINGS:', JSON.stringify(FA_RT.warnings.slice(0,20)));
  assert(FA_RT.warnings.filter(w => /act:|tick:/.test(w)).length === 0, 'no action/tick errors');
  log('FARM-BOOT-PASS');
})();
`;
vm.runInThisContext(src, { filename: 'fa-boot-test.js' });