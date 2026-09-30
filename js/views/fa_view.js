/* ============================================================
 * fa_view.js ——「灵植（farm）」主视图：忠实复刻 gooboo Farm.vue
 *
 * 布局：顶部 tabs（灵田 / 仓库）→ 灵田页 = 操作栏(field-bar) + 7×7 灵田网格(field)
 *      + 灵植/灵肥选择栏；仓库页 = 资源与灵植明细 + 灵种(基因)。
 * 交互：点击田格种植/收割/建灵筑/移除；顶栏一键播/收/重植/移除/取色；灵雨喷壶。
 *
 * 本模块自带独立存档('xzdz_gooboo_farm_save')与独立 1s 循环，与灵脉/宗门互不干扰。
 * ============================================================ */
var GB_FA_VIEW = {
  tab: 'farm',
  el: null,
  SAVE_KEY: 'xzdz_gooboo_farm_save',
  COLOR: { brown: '#8d6e63', green: '#4caf50', 'light-green': '#8bc34a', yellow: '#ffeb3b', orange: '#ff9800', red: '#f44336', pink: '#e91e63', purple: '#9c27b0', indigo: '#3f51b5', blue: '#2196f3' },
  _loop: null,
  _ticks: 0,

  /* ---------- 文案 ---------- */
  T(n) { const x = FA_TEXT; const t = x && x.TERMS; return (t && t[n]) || n; },
  curName(k) { const x = FA_TEXT && FA_TEXT.CURRENCY; return (x && x[k]) || String(k).replace(/^farm_/, ''); },
  cropName(k) { const x = FA_TEXT && FA_TEXT.CROP; return (x && x[k]) || String(k).replace(/([A-Z])/g, ' $1'); },
  buildingName(k) { const x = FA_TEXT && FA_TEXT.BUILDING; return (x && x[k]) || String(k).replace(/([A-Z])/g, ' $1'); },
  geneName(k) { const x = FA_TEXT && FA_TEXT.GENE; return (x && x[k]) || String(k).replace(/([A-Z])/g, ' $1'); },
  fertName(k) { const x = FA_TEXT && FA_TEXT.FERTILIZER; return (x && x[k]) || String(k).replace(/([A-Z])/g, ' $1'); },
  upgName(id) { const x = FA_TEXT && FA_TEXT.UPGRADE; const kk = String(id).replace(/^farm_/, ''); return (x && x[kk]) || kk; },
  unlockName(id) { const x = FA_TEXT && FA_TEXT.UNLOCK; return (x && x[id]) || String(id).replace(/^farm/, ''); },

  /* ---------- 便捷访问 ---------- */
  get state() { return FA_RT.state; },
  G(name) { try { return FA_RT.getters && FA_RT.getters[name]; } catch (e) { return null; } },
  mget(name) { try { return FA_MULT.get(name); } catch (e) { return 0; } },
  safe(fn, d) { try { return fn(); } catch (e) { return d; } },
  icon(n, s, c) { return GB_ICON.icon(n, s || 16, c || ''); },
  fmt(v) { return (window.formatNum ? formatNum(v) : Math.round(v)); },

  /* ---------- 生命周期 ---------- */
  mount(root) {
    if (this.el === root) { this.render(); return; }
    this.unload();
    this.el = root;
    // 统一地基：模块已在启动时 load，mount 不重复载入（避免丢弃未存档进度）
    if (!FA_RT.ready) this.load();
    this.startLoop();
    root.innerHTML = `
      <div class="gb-tabs" id="fa-tabs"></div>
      <div class="flex1 scroll-container" id="fa-content"></div>`;
    root.querySelector('#fa-content').addEventListener('click', (e) => {
      const sell = e.target.closest('[data-sell]');
      if (sell) { this.sellCrop(sell.getAttribute('data-sell')); this.save(); this.render(); return; }
      const act = e.target.closest('[data-act]');
      if (act) { this.handleAction(act.getAttribute('data-act')); return; }
      const buy = e.target.closest('[data-buy]');
      if (buy) { this.buyUpg(buy.getAttribute('data-buy')); this.save(); this.render(); return; }
      const tile = e.target.closest('[data-x]');
      if (tile) { this.onTile(+tile.getAttribute('data-x'), +tile.getAttribute('data-y')); this.render(); return; }
      const crop = e.target.closest('[data-crop]');
      if (crop) { this.selectCrop(crop.getAttribute('data-crop')); this.render(); return; }
      const fert = e.target.closest('[data-fert]');
      if (fert) { this.selectFert(fert.getAttribute('data-fert')); this.render(); return; }
      const bld = e.target.closest('[data-build]');
      if (bld) { this.selectBuilding(bld.getAttribute('data-build')); this.render(); return; }
    });
    this.render();
  },
  unload() {
    if (this.el) { this.save(); }
    this.stopLoop();
    this.el = null;
  },
  setTab(t) { this.tab = t; this.render(); },
  render() {
    const el = this.el; if (!el) return;
    const tabs = el.querySelector('#fa-tabs');
    const content = el.querySelector('#fa-content');
    if (!tabs || !content) return;
    tabs.innerHTML = this.getTabs().map(t =>
      `<button class="gb-tab ${t.id === this.tab ? 'active' : ''}" data-tab="${t.id}" onclick="GB_FA_VIEW.setTab('${t.id}')">${this.icon(t.icon, 18)}${t.name}</button>`
    ).join('');
    if (!this.getTabs().some(t => t.id === this.tab)) this.tab = 'farm';
    content.innerHTML = this.currentTabContent();
  },
  getTabs() {
    return [{ id: 'farm', name: '灵田', icon: 'mdi-barn' }, { id: 'inventory', name: '仓库', icon: 'mdi-archive' }];
  },
  hasAnything() {
    try {
      for (const k in FA_CUR.values) if (k.indexOf('farm_') === 0 && FA_CUR.values[k] > 0) return true;
      for (const k in FA_STAT.values) { const s = FA_STAT.values[k]; if (s && (s.value > 0 || s.total > 0)) return true; }
    } catch (e) { return false; }
    return false;
  },
  currentTabContent() {
    return this.tab === 'inventory' ? this.renderInventoryTab() : this.renderFarm();
  },

  /* gooboo md+ 的「仓库」tab：左右两列 = 仓库明细 | 升级道法 */
  renderInventoryTab() {
    return `
      <div class="fa-inv-row">
        <div class="fa-inv-left">
          ${this.renderSelectors()}
          <div class="fa-inv-sep"></div>
          ${this.renderInventory()}
        </div>
        <div class="fa-inv-right">${this.renderUpgrades()}</div>
      </div>`;
  },

  /* ---------- 灵田页：操作栏 + 左右两栏（左田格 80% / 右作物列表 20%） ---------- */
  renderFarm() {
    const st = this.state;
    return `
      <div class="fa-page">
        ${this.renderFieldBar(st)}
        <div class="fa-farm-grid">
          <div class="fa-field-wrap">
            <table class="fa-field"><tbody>${this.renderFieldRows(st)}</tbody></table>
          </div>
          ${this.renderCropPanel(st)}
        </div>
      </div>`;
  },

  /* 右栏「作物列表」面板：列出已发现作物，点击即选中（复用现有 data-crop 委托） */
  renderCropPanel(st) {
    const cropNames = Object.keys(st.crop || {});
    const foundCrops = cropNames.filter(k => st.crop[k].found !== false);
    const sel = st.selectedCropName;
    return `
      <div class="fa-crop-panel">
        <div class="fa-selector-title">灵植</div>
        ${foundCrops.map(k => {
          const c = st.crop[k];
          return `<button class="fa-crop-item${sel === k ? ' sel' : ''}" data-crop="${k}">
            ${c.icon ? `<span class="fa-crop-ic">${this.icon(c.icon, 20, c.color)}</span>` : ''}
            <span class="fa-crop-name">${this.cropName(k)}</span>
            <span class="fa-crop-time">${this.cropTimeLabel(c)}</span>
          </button>`;
        }).join('')}
      </div>`;
  },

  renderFieldBar() {
    const st = this.state;
    const del = !!st.deleting;
    const hasCrop = !!st.selectedCropName;
    const careOn = this.isUnlocked('farmCare');
    return `
      <div class="fa-bar">
        <div class="fa-bar-center">
          <div class="fa-bar-row">
            <button class="fa-btn${st.selectedColor && st.selectedColor !== 0 ? ' active' : ''}" data-act="plantAll" title="全部种植" ${hasCrop ? '' : 'disabled'}>${this.icon('mdi-seed', 20)}</button>
            <button class="fa-btn" data-act="replantAll" title="重植">${this.icon('mdi-refresh', 20)}</button>
            <button class="fa-btn" data-act="harvestAll" title="全部收割">${this.icon('mdi-basket', 20)}</button>
            <button class="fa-btn${del ? ' danger' : ''}" data-act="deleteMode" title="移除">${this.icon('mdi-delete', 20)}</button>
            <button class="fa-btn" data-act="toggleColors" title="取色">${this.icon('mdi-palette', 20)}</button>
          </div>
          ${st.showColors ? this.renderColorRow() : ''}
        </div>
        ${careOn ? this.renderWateringCan(st) : ''}
      </div>`;
  },

  renderWateringCan() {
    const rw = FA_CUR.value('farm_rainwater');
    const cap = FA_CUR.cap('farm_rainwater');
    const f = (isFinite(cap) && cap > 0) ? rw / cap : 0;
    const lvl = f < 2 ? 0 : f <= 1 ? f : f <= 3 ? (f - 1) / 2 + 1 : f <= 7 ? (f - 3) / 4 + 2 : Math.min((f - 7) / 8 + 3, 4);
    const fillPct = Math.max(0, Math.min(100, lvl / 4 * 100));
    const empty = lvl <= 0;
    return `
      <div class="fa-can" title="灵雨壶（护理）">
        <div class="fa-can-ico${empty ? ' dim' : ''}">${this.icon('mdi-watering-can', 48)}</div>
        <div class="fa-can-fill" style="height:${fillPct}%">${this.icon('mdi-watering-can', 48)}</div>
      </div>`;
  },

  renderColorRow() {
    const colors = ['brown', 'green', 'light-green', 'yellow', 'orange', 'red', 'pink', 'purple', 'indigo', 'blue'];
    const sel = this.state.selectedColor;
    return `<div class="fa-colors">
      ${colors.map(c => `<button class="fa-colorbtn${sel === c ? ' sel' : ''}" style="background:${c}" data-act="color:${c}"></button>`).join('')}
      <button class="fa-colorbtn" data-act="color:clear" title="清除">${this.icon('mdi-delete', 14)}</button>
    </div>`;
  },

  renderFieldRows() {
    const st = this.state;
    const f = st.field || [];
    let html = '';
    for (let y = 0; y < (f.length || 0); y++) {
      html += '<tr>';
      for (let x = 0; x < (f[y] ? f[y].length : 0); x++) {
        html += this.renderCell(f[y][x], x, y);
      }
      html += '</tr>';
    }
    return html;
  },

  renderCell(cell, x, y) {
    let inner = '';
    if (cell && cell.color) inner += `<div class="fa-cell-color" style="background:${this.COLOR[cell.color] || cell.color}"></div>`;
    if (cell && cell.type === 'crop') inner += this.renderCropCell(cell);
    else if (cell && cell.type === 'building') inner += this.renderBuildingCell(cell);
    const filled = cell !== null;
    return `<td class="fa-tile text-center${filled ? ' filled' : ''}" data-x="${x}" data-y="${y}">${inner}</td>`;
  },

  renderCropCell(cell) {
    const cropName = cell.crop;
    const crop = cropName && this.state.crop[cropName];
    const grow = Math.min(cell.grow || 0, 1);
    const pct = Math.round(grow * 100);
    const color = crop && crop.color ? crop.color : 'green';
    const grown = grow >= 1;
    /* gooboo Crop.vue：顶部成熟头 / 中部图标 / 底部 grow 进度条 */
    const header = grown
      ? this.icon('mdi-basket', 13)
      : `<span class="fa-hp">${pct}%</span>`;
    const icon = crop && crop.icon ? this.icon(crop.icon, grown ? 40 : 26, color) : '';
    return `
      <div class="fa-cell-crop" title="${this.cropName(cropName)}">
        <div class="fa-crop-head">${header}</div>
        <div class="fa-crop-mid">
          ${cell.giant ? '<span class="fa-giant">巨</span>' : ''}
          ${icon ? `<span class="fa-crop-icon">${icon}</span>` : ''}
          ${cell.giant && icon ? `<span class="fa-crop-icon" style="opacity:.6">${icon}</span>` : ''}
        </div>
        <div class="fa-progress"><div class="fa-progress-fill${grown ? ' grown' : ''}" style="width:${pct}%"></div></div>
      </div>`;
  },

  renderBuildingCell(cell) {
    const b = cell.building;
    const bdef = b && this.state.building[b];
    return `
      <div class="fa-cell-building" title="${this.buildingName(b)}">
        ${bdef && bdef.icon ? this.icon(bdef.icon, 26) : this.icon('mdi-home', 26)}
        ${cell.premium ? '<span class="fa-premium">贵</span>' : ''}
      </div>`;
  },

  renderSelectors() {
    const st = this.state;
    // 灵筑区解锁条件：存在已解锁的建筑格（由升级给建筑加 max>0 才出现），无则整区隐藏
    const hasBuildings = Object.keys(st.building || {}).some(k => st.building[k] && st.building[k].max > 0);
    return `
      <div class="fa-selector">
        ${hasBuildings ? `
        <div class="fa-selector-title">${this.T('building')}</div>
        <div class="fa-chip-row">
          ${Object.keys(st.building || {}).map(k => {
            const b = st.building[k];
            if (!(b.max > 0)) return '';
            return `<button class="fa-chip${st.selectedBuildingName === k ? ' sel' : ''}" data-build="${k}">
              ${b.icon ? this.icon(b.icon, 16) : ''}${this.buildingName(k)}<span class="fa-cnt">${b.cacheAmount||0}/${b.max||0}</span></button>`;
          }).join('')}
        </div>` : ''}
        ${this.isUnlocked('farmFertilizer') ? `
        <div class="fa-selector-title">${this.T('fertilizer')}</div>
        <div class="fa-chip-row">
          <button class="fa-chip${!st.selectedFertilizerName ? ' sel' : ''}" data-fert="">无</button>
          ${Object.keys(st.fertilizer || {}).map(k => {
            const f = st.fertilizer[k];
            return `<button class="fa-chip${st.selectedFertilizerName === k ? ' sel' : ''}" data-fert="${k}">${this.fertName(k)}</button>`;
          }).join('')}
        </div>` : ''}
      </div>`;
  },

  cropTimeLabel(c) {
    if (!c || !c.grow) return '';
    const mins = c.grow / 60;
    const t = mins >= 60 ? (mins / 60) + 'h' : mins + 'm';
    const giant = c.giantGrow ? ((c.giantGrow / 60) >= 60 ? (c.giantGrow / 3600).toFixed(1) + 'h' : Math.round(c.giantGrow / 60) + 'm') : '';
    return `<span class="fa-time">${t}</span>${giant ? `<span class="fa-time ft">+${giant}</span>` : ''}`;
  },

  /* ---------- 仓库页 ---------- */
  renderInventory() {
    const st = this.state;
    const hasRes = this.hasFarmCurrency();            // 「资源」区 gate：任一 farm 货币有产出才显示
    const showGenes = this.isUnlocked('farmCropExp'); // 「灵种（基因）」区 gate
    const sections = [];
    if (hasRes) {
      const curKeys = this.visibleCurrencies();
      sections.push(`<div class="fa-inv-section">
          <div class="fa-selector-title">资源</div>
          <div class="fa-ress">
            ${curKeys.map(k => {
              const v = FA_CUR.value(k);
              const cap = FA_CUR.cap(k);
              return `<div class="fa-res${isFinite(cap) ? ' capped' : ''}">
                <span class="fa-res-icon">${this.icon('mdi-circle', 14)}</span>
                <span class="fa-res-name">${this.curName(k)}</span>
                <span class="fa-res-val">${this.fmt(v)}${isFinite(cap) ? ' / ' + this.fmt(cap) : ''}</span>
              </div>`;
            }).join('')}
          </div>
        </div>`);
    }
    if (showGenes) {
      sections.push(`<div class="fa-inv-section">
          <div class="fa-selector-title">灵种（基因）</div>
          <div class="fa-gene-list">
            ${Object.keys(st.gene || {}).map(k => {
              const g = st.gene[k];
              return `<div class="fa-gene"><span>${this.geneName(k)}</span><span class="fa-gene-pts">${g.picked || 0}</span></div>`;
            }).join('')}
          </div>
        </div>`);
    }
    if (!sections.length) return '';
    return `<div class="fa-inv">${sections.join('\n')}</div>`;
  },

  visibleCurrencies() {
    const base = ['farm_vegetable', 'farm_berry', 'farm_grain', 'farm_flower', 'farm_gold'];
    const extra = Object.keys(FA_CUR.defs || {}).filter(k => k.indexOf('farm_') === 0 && base.indexOf(k) < 0 && FA_CUR.value(k) > 0);
    return base.concat(extra.sort());
  },

  renderCropRow(c, k) {
    const genes = (c.genes || []).length;
    const lvl = c.level || 0;
    return `
      <div class="fa-crop-row" data-sell="${k}">
        <span class="fa-crop-ic">${c.icon ? this.icon(c.icon, 20, c.color) : this.icon('mdi-sprout', 20)}</span>
        <span class="fa-crop-name">${this.cropName(k)}</span>
        <span class="fa-crop-lvl">Lv ${lvl}</span>
        <span class="fa-crop-genes">${genes}种</span>
        <button class="fa-btn mini" data-sell="${k}" title="出售">${this.icon('mdi-sell', 14)}</button>
      </div>`;
  },

  /* ---------- 交互 ---------- */
  isUnlocked(id) { return FA_UNLOCK.isUnlocked(id); },
  isVisible(id) { return FA_UNLOCK.isVisible(id); },
  /* 渐进显示 gate：任一 farm 货币已有产出（value>0）判为「已有产出」 */
  hasFarmCurrency() {
    try {
      const vals = FA_CUR.values || {};
      for (const k in vals) {
        if (k.indexOf('farm_') === 0 && FA_CUR.value(k) > 0) return true;
      }
    } catch (e) {}
    return false;
  },

  selectCrop(name) {
    const st = this.state;
    FSTORE.commit('farm/updateKey', { key: 'selectedCropName', value: st.selectedCropName === name ? null : name });
    FSTORE.commit('farm/updateKey', { key: 'selectedBuildingName', value: null });
    FSTORE.commit('farm/updateKey', { key: 'deleting', value: false });
  },
  selectFert(name) {
    const st = this.state;
    FSTORE.commit('farm/updateKey', { key: 'selectedFertilizerName', value: st.selectedFertilizerName === name ? null : name });
  },
  selectBuilding(name) {
    const st = this.state;
    FSTORE.commit('farm/updateKey', { key: 'selectedBuildingName', value: st.selectedBuildingName === name ? null : name });
    FSTORE.commit('farm/updateKey', { key: 'selectedCropName', value: null });
    FSTORE.commit('farm/updateKey', { key: 'deleting', value: false });
  },
  onTile(x, y) {
    const st = this.state;
    const cell = st.field[y] && st.field[y][x];
    if (!cell) return;
    try {
      if (st.deleting && cell.type !== null) { FA_RT.act('deleteTile', { x, y }); return; }
      if (st.selectedColor !== null) { FSTORE.commit('farm/updateFieldKey', { x, y, key: 'color', value: st.selectedColor === 0 ? null : st.selectedColor }); return; }
      if (st.selectedBuildingName && cell.type === null) { FA_RT.act('placeBuilding', { x, y, name: st.selectedBuildingName }); return; }
      if (st.selectedCropName && cell.type === null) {
        FA_RT.act('plantCrop', { x, y, crop: st.selectedCropName, fertilizer: st.selectedFertilizerName, giant: st.plantGiant });
        return;
      }
      if (cell.type === 'crop' && cell.grow >= 1) { FA_RT.act('harvestCrop', { x, y }); return; }
    } catch (e) {}
    this.save();
  },
  handleAction(act) {
    const st = this.state;
    if (act === 'plantAll') { if (st.selectedCropName) FA_RT.act('plantAll', { crop: st.selectedCropName, fertilizer: st.selectedFertilizerName }); }
    else if (act === 'harvestAll') { FA_RT.act('harvestAll'); }
    else if (act === 'replantAll') { FA_RT.act('replantAll'); }
    else if (act === 'deleteMode') {
      FSTORE.commit('farm/updateKey', { key: 'selectedBuildingName', value: null });
      FSTORE.commit('farm/updateKey', { key: 'selectedCropName', value: null });
      FSTORE.commit('farm/updateKey', { key: 'selectedFertilizerName', value: null });
      FSTORE.commit('farm/updateKey', { key: 'deleting', value: !st.deleting });
    }
    else if (act === 'toggleColors') { FSTORE.commit('farm/updateKey', { key: 'showColors', value: !st.showColors }); }
    else if (act.indexOf('color:') === 0) {
      const c = act.slice(6);
      FSTORE.commit('farm/updateKey', { key: 'selectedColor', value: c === 'clear' ? (st.selectedColor === 0 ? null : 0) : (st.selectedColor === c ? null : c) });
    }
    this.save(); this.render();
  },
  sellCrop(k) {
    const crop = this.state.crop[k];
    if (!crop) return;
    const def = FA_CUR.defs['farm_vegetable'];
    // 作物无直接出售价值逻辑，此处仅示意；保留可扩展
    this.render();
  },

  /* 升级购买 */
  buyUpg(id) {
    try { FA_UPG.buy(id); } catch (e) {}
  },

  /* ---------- 升级道法列表（复刻 gooboo UpgradeList） ---------- */
  renderUpgrades() {
    const defs = FA_UPG.defs;
    const ids = Object.keys(defs).sort((a, b) => (defs[a]._map === 'upgrade' ? 0 : 1) - (defs[b]._map === 'upgrade' ? 0 : 1));
    const regular = ids.filter(id => defs[id].type !== 'premium');
    const premium = ids.filter(id => defs[id].type === 'premium');
    // gate：整个「道法升级」panel 仅在至少一个升级可见时渲染（上品灵术 premium 始终渲染）
    const anyVisible = premium.length > 0 || regular.some(id => this.safe(() => FA_UPG.isVisible(id), false));
    if (!anyVisible) return '';
    const sc = data => data.map(id => this.renderUpgCard(id)).join('');
    return `
      <div class="fa-upg">
        <div class="fa-upg-title">升级道法</div>
        ${sc(regular)}
        ${premium.length ? `<div class="fa-upg-title ft">上品灵术</div>${sc(premium)}` : ''}
      </div>`;
  },
  renderUpgCard(id) {
    const d = FA_UPG.defs[id];
    if (!d) return '';
    const lvl = FA_UPG.levels[id] || 0;
    const cap = FA_UPG.cap(id);
    const canAfford = FA_UPG.canAfford(id);
    const maxed = FA_UPG.isMaxed(id);
    const visible = this.safe(() => FA_UPG.isVisible(id), false);
    if (d.type !== 'premium' && !visible) return '';
    const price = FA_UPG.price(id);
    const priceHtml = Object.keys(price).map(k =>
      `<span class="fa-price ${FA_CUR.value(k) >= price[k] ? 'ok' : 'no'}">${this.curName(k)} ${this.fmt(price[k])}</span>`).join(' ');
    const name = this.upgName(id);
    const capText = isFinite(cap) ? ` ${lvl}/${cap}` : '';
    return `
      <div class="fa-upg-card ${maxed ? 'maxed' : ''} ${!canAfford && !maxed ? 'locked' : ''}">
        <div class="fa-upg-head">
          <span class="fa-upg-name">${name}</span>
          <span class="fa-upg-lvl">Lv ${lvl}${capText}</span>
        </div>
        ${maxed ? `<div class="fa-upg-status">已满级</div>` : `
        <div class="fa-upg-price">${priceHtml || '—'}</div>
        <button class="fa-btn mini upg-buy" data-buy="${id}" ${canAfford ? '' : 'disabled'}>购买</button>`}
        ${d.effect ? this.upgEffectText(d, lvl) : ''}
      </div>`;
  },
  /* gooboo UPGRADE_IS_BOOL 集合（farm 范围内会出现的布尔型效果默认只在生效时展示） */
  _EFF_BOOL: { unlock: 1, farmSeed: 1, findConsumable: 1, keepUpgrade: 1, uncapUpgrade: 1, galleryIdea: 1, galleryShape: 1, villageCraft: 1 },

  effName(n) {
    const X = FA_TEXT || {};
    const s = String(n);
    if (X.MULT && X.MULT[s]) return X.MULT[s];
    if (X.CROP && X.CROP[s]) return X.CROP[s];
    if (X.BUILDING && X.BUILDING[s]) return X.BUILDING[s];
    if (X.UNLOCK && X.UNLOCK[s]) return X.UNLOCK[s];
    if (X.GENE && X.GENE[s]) return X.GENE[s];
    if (s.indexOf('farm_') === 0) {
      const bare = s.slice(5);
      if (X.FERTILIZER && X.FERTILIZER[bare]) return X.FERTILIZER[bare];
      if (X.CURRENCY && X.CURRENCY[s]) return X.CURRENCY[s];
    }
    return s;
  },

  /* 升级效果展示（复刻 gooboo Upgrade.vue + DisplayRow.vue：布尔型仅在生效时显示，数值型 mult=× / base=+） */
  upgEffectText(d, lvl) {
    if (!Array.isArray(d.effect) || !d.effect.length) { return ''; }
    let html = '';
    const self = this;
    d.effect.forEach((eff, k) => {
      let val;
      try { val = (typeof eff.value === 'function') ? eff.value(lvl) : eff.value; } catch (e) { val = null; }
      if (val === undefined || val === null) return;
      const t = eff.type || '';
      const nameStr = typeof eff.name === 'string' ? eff.name : '';
      // 布尔型效果（unlock / farmSeed / findConsumable ...）：只有生效（true）才显示，绝不出现 'false'
      if (self._EFF_BOOL[t]) {
        if (val === false || val === 0 || val === null || val === undefined) return;
        if (t === 'farmSeed') { html += `<div class="fa-upg-eff">· ${self.T('unlockSeed')} ${self.effName(nameStr)}</div>`; return; }
        if (t === 'findConsumable') { html += `<div class="fa-upg-eff">· ${self.T('findConsumable')} ${self.effName(nameStr)}</div>`; return; }
        if (t === 'unlock') { html += `<div class="fa-upg-eff">· ${self.T('unlock')} ${self.effName(nameStr)}</div>`; return; }
        html += `<div class="fa-upg-eff">· ${self.effName(nameStr)}</div>`; return;
      }
      // 数值型效果：非数字 / 无效值（0、NaN、Infinity）跳过
      if (typeof val !== 'number' || !isFinite(val)) return;
      if (t === 'mult' && Math.abs(val - 1) < 1e-9) return; // ×1 视为无变化，等同 gooboo 隐藏
      if (val === 0) return; // 0 视为无效果，等同 gooboo 隐藏
      html += `<div class="fa-upg-eff">· ${self.effName(nameStr)} ${self.multiLabel(t, val)}</div>`;
    });
    return html === '' ? '' : `<div class="fa-upg-effs">${html}</div>`;
  },
  multiLabel(type, val) {
    if (type === 'mult') return '×' + this.fmt(val);
    if (type === 'base') return '+' + this.fmt(val);
    if (type === 'farmTile') return '+' + this.fmt(val);
    return this.fmt(val);
  },

  /* ---------- 存档 ---------- */
  loadSave() { try { const r = localStorage.getItem(this.SAVE_KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } },
  save() {
    if (!FA_RT.ready) return;
    try {
      const st = FA_RT.state;
      const obj = { savedAt: Date.now(), v: 1 };
      obj.field = JSON.parse(JSON.stringify(st.field || []));
      obj.crop = JSON.parse(JSON.stringify(st.crop || {}));
      obj.building = JSON.parse(JSON.stringify(st.building || {}));
      obj.gene = JSON.parse(JSON.stringify(st.gene || {}));
      obj.currencyVals = JSON.parse(JSON.stringify(FA_CUR.values || {}));
      obj.upgradeLevels = JSON.parse(JSON.stringify(FA_UPG.levels || {}));
      obj.stat = JSON.parse(JSON.stringify(FA_STAT.values || {}));
      obj.unlock = JSON.parse(JSON.stringify(FA_UNLOCK.items || {}));
      obj.system = JSON.parse(JSON.stringify(st.system || { rng: {}, settings: {} }));
      obj.selectedCropName = st.selectedCropName || null;
      obj.selectedBuildingName = st.selectedBuildingName || null;
      obj.selectedFertilizerName = st.selectedFertilizerName || null;
      obj.plantGiant = !!st.plantGiant;
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(obj));
    } catch (e) { /* ignore */ }
  },
  offlineElapsed() {
    const s = this.loadSave();
    if (!s || !s.savedAt) return 0;
    return Math.min((Date.now() - s.savedAt) / 1000, 8 * 3600);
  },
  freshState() {
    return { field: [], crop: {}, building: {}, gene: {}, fertilizer: {}, consumable: {}, stat: null, unlock: null, currencyVals: null, upgradeLevels: null, system: null };
  },
  load() {
    const saved = this.loadSave();
    const state = this.freshState();
    FA_RT.init(state);
    // farmFeature 的解锁现在由 GB_UNLOCK + GB_META 全局管理（globalLevel 阈值 130），不再模块内自启
    if (saved) {
      var s = saved;
      if (Array.isArray(s.field)) state.field = s.field;
      if (s.crop) Object.keys(s.crop).forEach(k => { if (state.crop[k]) Object.assign(state.crop[k], s.crop[k]); });
      if (s.building) Object.keys(s.building).forEach(k => { if (state.building[k]) Object.assign(state.building[k], s.building[k]); });
      if (s.gene) Object.keys(s.gene).forEach(k => { if (state.gene[k]) Object.assign(state.gene[k], s.gene[k]); });
      if (s.currencyVals) Object.keys(s.currencyVals).forEach(k => { if (FA_CUR.values[k] !== undefined) FA_CUR.values[k] = s.currencyVals[k]; });
      if (s.upgradeLevels) Object.keys(s.upgradeLevels).forEach(k => { if (FA_UPG.levels[k] !== undefined) FA_UPG.levels[k] = s.upgradeLevels[k]; });
      if (s.stat) Object.keys(s.stat).forEach(k => { if (FA_STAT.values[k] !== undefined) FA_STAT.values[k] = s.stat[k]; });
      if (s.unlock) Object.keys(s.unlock).forEach(k => { FA_UNLOCK.items[k] = s.unlock[k]; });
      if (s.system && state.system) state.system.rng = s.system.rng || {};
      if (s.selectedCropName !== undefined) state.selectedCropName = s.selectedCropName;
      if (s.selectedBuildingName !== undefined) state.selectedBuildingName = s.selectedBuildingName;
      if (s.selectedFertilizerName !== undefined) state.selectedFertilizerName = s.selectedFertilizerName;
      if (s.plantGiant !== undefined) state.plantGiant = s.plantGiant;
    }
    FA_RT.afterChange();
  },

  startLoop() {
    if (this._loop) return;
    this._loop = setInterval(() => {
      this._ticks++;
      if (this._ticks % 30 === 0) this.save();
      if (this.el) this.render();
    }, 1000);
  },
  stopLoop() { if (this._loop) { clearInterval(this._loop); this._loop = null; } }
};
if (typeof module !== 'undefined') module.exports = { GB_FA_VIEW };

/* ===== 挂接统一地基：由注册表统一驱动 load / save（tick 已交给全局循环） ===== */
if (typeof GB_MODULES !== 'undefined') GB_MODULES.attachView('farm', GB_FA_VIEW);