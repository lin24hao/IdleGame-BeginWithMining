/* ============================================================
 * xianqi_view.js ——「仙器」视图 (对齐 gooboo Treasure.vue)
 *
 * 单页布局（无 tab）：
 *   ChanceList 概率条 → 工具栏（灵玉 + 青元换灵玉 + 炼各类型）→ item-slot 网格 → StatList 右栏
 *   点任意 slot → 弹 Dialog 详情（图标/效果槽/modifier/升级/销毁）
 * ============================================================ */
var GB_XQ_VIEW = {
  el: null,
  openId: -1,           // 当前选中的 slot：-1 = newItem, 0+ = 已装备
  dialogOpen: false,

  SAVE_KEY: 'xzdz_gooboo_treasure_save',

  /* ---------- 便捷访问 ---------- */
  get state() { return typeof XQ_STATE !== 'undefined' ? XQ_STATE : null; },
  get types() { return typeof XQ_TYPES !== 'undefined' ? XQ_TYPES : {}; },
  get effects() { return typeof XQ_EFFECTS !== 'undefined' ? XQ_EFFECTS : {}; },

  icon(n, s, c) { return GB_ICON.icon(n, s || 16, c || ''); },

  /* ---------- 效果 key → 中文名 ---------- */
  effectZh: {
    miningDamage: '灵石伤害', currencyMiningScrapGain: '碎灵石收益', miningOreGain: '矿石收益',
    miningRareEarthGain: '稀土收益', miningSmelteryTime: '炼器速度',
    currencyMiningCrystalGreenGain: '绿晶收益', currencyMiningCrystalYellowGain: '黄晶收益',
    queueSpeedVillageBuilding: '建造速度', currencyVillageCoinGain: '香火收益',
    villageFoundationMaterialGain: '基础建材', villageIndustrialMaterialGain: '工业建材',
    villageLuxuryMaterialGain: '高阶建材', villageModernMaterialGain: '尖端建材',
    currencyVillageFaithGain: '信仰收益', currencyVillageSharesGain: '宗门分红',
    hordeAttack: '降妖攻击', currencyHordeBoneGain: '妖骨收益',
    currencyHordeCorruptedFleshGain: '魔肉收益', hordeEquipmentMasteryGain: '装备熟练度',
    hordeShardChance: '法宝碎片率', currencyHordeBloodGain: '妖血收益',
    currencyHordeSoulCorruptedGain: '魂核收益', currencyHordeCourageGain: '勇气收益',
    currencyFarmVegetableGain: '灵菜收益', currencyFarmBerryGain: '灵果收益',
    currencyFarmGrainGain: '灵谷收益', currencyFarmFlowerGain: '灵花收益',
    farmExperience: '灵植经验',
    currencyGalleryBeautyGain: '灵韵收益', galleryColorGain: '灵色产量',
    currencyGalleryConverterGain: '灵墨收益', galleryShapeGain: '形态产量',
    galleryCanvasSpeed: '灵绘制速', currencyGalleryCashGain: '灵石收益',
  },
  modZh: { mining: '灵脉', village: '宗门', horde: '降妖', farm: '灵植园', gallery: '藏经阁' },
  tierColor: ['tier-0','tier-1','tier-2','tier-3','tier-4','tier-5'],

  effectLabel(key) {
    const def = this.effects[key];
    if (!def) return { label: key, mod: '未知', icon: 'mdi-help-circle' };
    return {
      label: this.effectZh[key] || key,
      mod: this.modZh[def.feature] || def.feature || '未知',
      icon: def.icon || 'mdi-help-circle',
    };
  },

  /* 过滤掉没有对应模块的 effect（gallery 没有） */
  supportedEffects() {
    if (typeof GB_MODULES === 'undefined') return {};
    const fm = GB_MODULES._featureMap || {};
    const out = {};
    Object.keys(this.effects).forEach(k => {
      const def = this.effects[k];
      const mod = fm[def.feature];
      if (mod) out[k] = def;
    });
    return out;
  },

  mount(el) {
    this.el = el;
    this.el.innerHTML = '';
    this._onClickFn = this.onClick.bind(this);
    this.el.addEventListener('click', this._onClickFn);
    document.addEventListener('keydown', this._onKeyFn = this._onKeyFn.bind(this));
  },
  unload() {
    if (this.el) {
      this.el.removeEventListener('click', this._onClickFn);
      this.el.innerHTML = '';
    }
    document.removeEventListener('keydown', this._onKeyFn);
    this.el = null;
    this.dialogOpen = false;
  },
  _onKeyFn(e) { if (e.key === 'Escape' && this.dialogOpen) { this.dialogOpen = false; this.render(); } },

  toast(msg) {
    if (typeof GB_APP !== 'undefined' && GB_APP.toast) GB_APP.toast(msg);
    else console.log('[仙器]', msg);
  },

  /* ============================================================
   * render —— 主入口
   * ============================================================ */
  render() {
    if (!this.el) return;
    this.el.innerHTML = this.renderMain();
    if (this.dialogOpen && this.openId !== undefined) {
      this.el.insertAdjacentHTML('beforeend', this.renderDialog());
    }
  },

  renderMain() {
    const st = this.state || {};
    const emerald = typeof DAO_CUR !== 'undefined' ? DAO_CUR.value('dao_qingyuan') : 0;
    const frag = XQ_CUR.value('xq_fragment');
    const types = this.types;
    const newItem = st.newItem;
    const items = (st.items || []).filter(i => i);
    const slotsLimit = XQ_MULT.get ? XQ_MULT.get('treasureSlots') : 10;

    const fragCost = XQ_MODULE.fragmentBuyCost();
    const fragGain = XQ_MODULE.fragmentGainPreview();
    const canBuyFrag = emerald >= fragCost;

    const slotHtml = [];
    slotHtml.push(this.itemSlotHtml(newItem, -1, false, true)); // newItem 占位槽
    slotHtml.push(`<button class="xq-quick-del" data-xq-quick-del ${newItem ? '' : 'disabled'}>${this.icon('mdi-delete', 16)}</button>`);
    for (let i = 0; i < slotsLimit; i++) {
      slotHtml.push(this.itemSlotHtml(items[i], i, false, false));
    }
    // locked slots（gooboo lockedSlots = max(items.length - slotsLimit, 0)）
    for (let i = slotsLimit; i < items.length; i++) {
      slotHtml.push(this.itemSlotHtml(items[i], i, true, false));
    }

    // BuyItem 按钮
    const buyItemsHtml = Object.keys(types).map(k => {
      const t = types[k];
      const price = Math.round(this._treasurePrice(k));
      const canAfford = emerald >= price && !newItem;
      return `<button class="gb-btn primary small" data-buy-type="${k}" ${canAfford ? '' : 'disabled'}>
        ${this.icon(t.icon || 'mdi-sword', 14)} ${t.name} ${this.icon('mdi-hexagon', 12, 'c-green')}${price}
      </button>`;
    }).join('');

    // Sort 按钮（gooboo performSort）
    const canSort = items.length + (newItem ? 1 : 0) > 0;

    return `
      <div class="xq-page">
        <!-- ChanceList 概率条 -->
        <div class="xq-chance">${this.chanceListHtml()}</div>

        <!-- 工具栏 -->
        <div class="xq-toolbar">
          <span class="xq-cc">${this.icon('mdi-hexagon', 13, 'c-green')}<b>${emerald}</b>青元</span>
          <span class="xq-cc">${this.icon('mdi-shimmer', 13, 'c-gold')}<b>${frag}</b>灵玉</span>
          <button class="gb-btn small ghost" data-xq-buy-frag ${canBuyFrag ? '' : 'disabled'}" title="花 ${fragCost} 青元 换 ${fragGain} 灵玉">
            ${this.icon('mdi-plus', 14)}
          </button>
          <span class="xq-sep"></span>
          <button class="gb-btn small ghost" data-xq-sort ${canSort ? '' : 'disabled'}>${this.icon('mdi-sort-variant', 14)}</button>
          <span class="xq-sep"></span>
          ${buyItemsHtml}
        </div>

        <!-- item-slot 网格 -->
        <div class="xq-slots">${slotHtml.join('')}</div>

        <!-- StatList 右栏（已生效加成） -->
        <div class="xq-stat">${this.statListHtml()}</div>
      </div>`;
  },

  /* ---------- chanceList —— 各阶概率条 ---------- */
  chanceListHtml() {
    return XQ_TIER_CHANCES.map(c => {
      const pct = Math.round(c.chance * 100);
      const colorCls = this.tierColor[c.tier - 1] || 'tier-0';
      return `<span class="xq-chance-bar ${colorCls}" title="阶 ${c.tier} · 概率 ${pct}%">${pct}%</span>`;
    }).join('');
  },

  /* ---------- itemSlot —— 单个槽位 ---------- */
  itemSlotHtml(item, slotId, locked, isNewItem) {
    const icon = item ? this.icon(item.type && this.types[item.type] ? this.types[item.type].icon || 'mdi-help-circle' : 'mdi-help-circle', 28) : '';
    const tierBadge = item ? `<span class="xq-slot-tier">${item.tier}</span>` : '';
    const effectIcons = item && item.effect ? item.effect.map(e =>
      e ? this.icon(this.effects[e].icon || 'mdi-help-circle', 12, 'xq-ef-ico') : '<i class="xq-ef-ico xq-ef-empty"></i>'
    ).join('') : '';
    const levelBadge = item && item.level > 0 ? `<span class="xq-slot-lv">+${item.level}</span>` : '';
    const modIcons = item && item.modifier ? item.modifier.map(m => {
      const def = XQ_MODIFIERS[m]; return def ? this.icon(def.icon, 10) : '';
    }).join('') : '';
    const lockedOverlay = locked ? `<span class="xq-locked">${this.icon('mdi-cancel', 48, 'c-red')}</span>` : '';

    return `<div class="xq-slot ${locked ? 'locked' : ''} ${item ? '' : 'empty'} ${isNewItem ? 'new-item' : ''}"
        data-slot="${slotId}" data-slot-locked="${locked}">
      ${tierBadge}
      <div class="xq-slot-icon">${icon}</div>
      <div class="xq-slot-efs">${effectIcons}</div>
      <div class="xq-slot-foot">${levelBadge}${modIcons}</div>
      ${lockedOverlay}
    </div>`;
  },

  /* ---------- StatList —— 已生效加成 ---------- */
  statListHtml() {
    const cache = (this.state && this.state.effectCache) || {};
    const keys = Object.keys(cache);
    if (!keys.length) return `<div class="xq-stat-empty">还没有装备仙器<br>炼一件试试看</div>`;

    const groups = {};
    keys.forEach(k => {
      const lbl = this.effectLabel(k);
      const grp = lbl.mod;
      if (!groups[grp]) groups[grp] = [];
      groups[grp].push({ key: k, cache: cache[k], label: lbl });
    });

    let html = `<h3 class="xq-stat-title">${this.icon('mdi-chart-line', 15)} 已生效加成</h3>`;
    Object.keys(groups).forEach(grp => {
      html += `<div class="xq-stat-grp"><b>${grp}</b>`;
      groups[grp].forEach(it => {
        const v = it.cache.value;      // multiplier 值（gooboo effectCache.value）
        const owned = it.cache.owned;
        const pct = (v - 1) * 100;     // multiplier 1.5 → +50%
        const dim = v === 1 ? ' dim' : '';
        const sign = pct >= 0 ? '+' : '';
        html += `<div class="xq-stat-row${dim}">
          ${this.icon(it.label.icon, 12)}
          <span>${it.label.label}</span>
          <em class="xq-stat-val">${owned > 1 ? '×' + owned + ' ' : ''}${sign}${pct.toFixed(1)}%</em>
        </div>`;
      });
      html += `</div>`;
    });
    return html;
  },

  /* ---------- Treasure price —— gooboo treasurePrice ---------- */
  _treasurePrice(type) {
    return XQ_TIER_CHANCES.reduce((a, b) => a + b.chance * xqTierPrice(b.tier), 0) * this.types[type].buyPrice;
  },

  /* ============================================================
   * Dialog —— 仙器详情弹窗（gooboo v-dialog）
   * ============================================================ */
  renderDialog() {
    const st = this.state || {};
    const item = this.openId === -1 ? st.newItem : (st.items || [])[this.openId];
    if (!item) { this.dialogOpen = false; return ''; }
    const t = this.types[item.type];

    // 计算效果值（升级前 vs 升级后）
    const nextLevel = item.level + 1;
    const upgCost = XQ_MODULE.upgradeCost(item);
    const destroyVal = XQ_MODULE.destroyPrice(item);
    const canAffordUpg = upgCost !== Infinity && XQ_CUR.value('xq_fragment') >= upgCost;
    const hasUpg = item.level < t.upgradeLimit;

    // effect 槽渲染（带 wildcard-slot）
    const effectSlotsHtml = (item.effect || []).map((ef, idx) => {
      const power = t.slots[idx].power;
      const curVal = typeof effectValue === 'function' && ef ? effectValue(ef, item.tier, item.level, power) : null;
      const nextVal = typeof effectValue === 'function' && ef ? effectValue(ef, item.tier, nextLevel, power) : null;
      const lbl = ef ? this.effectLabel(ef) : null;
      // wildcard: 选新效果
      const avail = this._eligibleEffects(item, idx);
      const selected = avail.includes(ef) ? ef : null;
      return `
        <div class="xq-dlg-ef">
          <div class="xq-dlg-ef-row">
            ${this.icon(lbl ? lbl.icon : 'mdi-cursor-default-click', 14)}
            <span>${lbl ? lbl.label : '空槽位'}</span>
            <span class="xq-dlg-ef-val">${curVal !== null ? `×${(curVal + 1).toFixed(2)}` : '—'}</span>
          </div>
          <select class="xq-wildcard" data-wc-slot="${idx}" ${avail.length ? '' : 'disabled'}>
            <option value="">— 选择效果 —</option>
            ${avail.map(k => {
              const al = this.effectLabel(k);
              const def = this.effects[k];
              const disabled = def.minTier !== undefined && item.tier < def.minTier;
              return `<option value="${k}" ${ef === k ? 'selected' : ''} ${disabled ? 'disabled' : ''}>${al.mod} · ${al.label}${def.minTier !== undefined ? '（阶' + def.minTier + '+' : ''}</option>`;
            }).join('')}
          </select>
          <button class="gb-btn small ghost" data-apply-ef="${idx}" ${avail.includes(selected) ? '' : 'disabled'}>应用</button>
        </div>`;
    }).join('');

    // modifier 消耗品
    const modHtml = this.renderModifiers(item);

    return `
      <div class="xq-mask" data-xq-close></div>
      <div class="xq-dialog">
        <button class="xq-dlg-close" data-xq-close>${this.icon('mdi-close', 18)}</button>
        <div class="xq-dlg-head">
          <div class="xq-dlg-ico">${this.icon(t.icon || 'mdi-sword', 40, 'c-main')}</div>
          <div class="xq-dlg-title">
            <div class="xq-dlg-tier">阶 ${item.tier}</div>
            <div class="xq-dlg-lv">Lv ${item.level}</div>
          </div>
        </div>
        <div class="xq-dlg-efs">${effectSlotsHtml}</div>
        ${modHtml}
        <div class="xq-dlg-actions">
          ${hasUpg ? `
            <span class="xq-dlg-cost">${this.icon('mdi-shimmer', 13, 'c-gold')}${upgCost}</span>
            <button class="gb-btn primary" data-xq-upg ${canAffordUpg ? '' : 'disabled'}>升级</button>
          ` : `<div class="xq-dlg-maxed">已达等级上限 ${t.upgradeLimit}</div>`}
        </div>
        <div class="xq-dlg-actions">
          <span class="xq-dlg-cost">+${destroyVal} 灵玉</span>
          <button class="gb-btn error small" data-xq-del>${this.icon('mdi-delete', 14)} 销毁</button>
        </div>
      </div>`;
  },

  /* ---------- modifier 消耗品栏（日精月华 等） ---------- */
  renderModifiers(item) {
    const t = this.types[item.type];
    const maxMods = t.maxModifiers || 1;
    const curMods = item.modifier || [];
    const hasExpander = curMods.includes('expander');

    if (!maxMods) return '';

    const listHtml = Object.keys(XQ_MODIFIERS).map(k => {
      const def = XQ_MODIFIERS[k];
      const disabled = hasExpander && k === 'expander' ? 'disabled' : '';
      return `<button class="gb-btn tiny ghost xq-mod-btn" data-apply-mod="${k}" ${disabled}>
        ${this.icon(def.icon, 14)} <span>${def.name}</span>
      </button>`;
    }).join('');

    return `
      <div class="xq-dlg-mods">
        <div class="xq-dlg-mod-count">${curMods.length} / ${maxMods} 特殊效果</div>
        <div class="xq-dlg-mod-list">${listHtml || '<span class="ru-hint">无可用消耗品</span>'}</div>
      </div>`;
  },

  /* ---------- wildcard 可选效果列表 ---------- */
  _eligibleEffects(item, slotIdx) {
    const t = this.types[item.type];
    const supp = this.supportedEffects();
    return Object.keys(supp).filter(k => {
      const def = supp[k];
      if (def.type !== t.slots[slotIdx].type) return false;   // prestige slot 只能装 prestige effect
      if (def.minTier !== undefined && item.tier < def.minTier) return false;
      return true;
    });
  },

  /* ============================================================
   * 事件处理
   * ============================================================ */
  onClick(e) {
    let n;
    if ((n = e.target.closest('[data-xq-close]'))) {
      this.dialogOpen = false; this.render(); return;
    }
    if ((n = e.target.closest('[data-slot]'))) {
      const locked = n.getAttribute('data-slot-locked') === 'true';
      if (locked) return;
      const id = +n.getAttribute('data-slot');
      // newItem 还没装备时点击槽 → moveItem（装备到该槽位）
      if (this.state && this.state.newItem && id >= 0 && !this.state.items[id]) {
        this._moveItem(-1, id);
      }
      this.openId = id;
      this.dialogOpen = true;
      this.render();
      return;
    }
    if ((n = e.target.closest('[data-buy-type]'))) { this._doBuyItem(n.getAttribute('data-buy-type')); return; }
    if ((n = e.target.closest('[data-xq-buy-frag]'))) { this._doBuyFrag(); return; }
    if ((n = e.target.closest('[data-xq-sort]'))) { this._doSort(); return; }
    if ((n = e.target.closest('[data-xq-quick-del]'))) { this._doQuickDelete(); return; }
    if ((n = e.target.closest('[data-xq-upg]'))) { this._doUpgrade(); return; }
    if ((n = e.target.closest('[data-xq-del]'))) { this._doDelete(); return; }
    if ((n = e.target.closest('[data-apply-ef]'))) { this._doApplyEffect(+n.getAttribute('data-apply-ef')); return; }
    if ((n = e.target.closest('[data-apply-mod]'))) { this._doApplyModifier(n.getAttribute('data-apply-mod')); return; }
  },

  /* ---------- buy-item：花青元随机炼仙器 ---------- */
  _doBuyItem(type) {
    const emerald = typeof DAO_CUR !== 'undefined' ? DAO_CUR.value('dao_qingyuan') : 0;
    const price = Math.round(this._treasurePrice(type));
    if (emerald < price) { this.toast('青元不足'); return; }
    if (this.state && this.state.newItem) { this.toast('请先处理当前新仙器'); return; }

    // 随机 tier（对齐 gooboo gain() 的 tierChancesRaw）
    const rnd = Math.random();
    let cum = 0, tier = 1;
    for (const c of XQ_TIER_CHANCES) {
      cum += c.chance;
      if (rnd < cum) { tier = c.tier; break; }
    }

    const item = XQ_MODULE.buy(type, tier);
    if (!item) { this.toast('炼制失败'); return; }
    this.toast(`炼制成功：${this.types[type].name} · 阶 ${tier}！`);
    this.render();
  },

  /* ---------- 青元换灵玉 ---------- */
  _doBuyFrag() {
    const res = XQ_MODULE.buyFragments();
    if (res) {
      this.toast(`兑换成功：${XQ_MODULE.fragmentBuyCost()} 青元 → ${res} 灵玉`);
      this.render();
    } else {
      this.toast(`青元不足，需 ${XQ_MODULE.fragmentBuyCost()}`);
    }
  },

  /* ---------- 排序（按 tier level） ---------- */
  _doSort() {
    if (!this.state) return;
    const items = this.state.items.filter(i => i);
    if (items.length <= 1) return;
    items.sort((a, b) => {
      const av = a.tier * 100 + a.level;
      const bv = b.tier * 100 + b.level;
      return bv - av;
    });
    // 重新放回 state
    for (let i = 0; i < this.state.items.length; i++) this.state.items[i] = null;
    for (let i = 0; i < items.length; i++) this.state.items[i] = items[i];
    XQ_MODULE.updateEffectCache();
    this.render();
  },

  /* ---------- 拖拽 moveItem ---------- */
  _moveItem(from, to) {
    const st = this.state; if (!st) return;
    if (from === -1) {
      if (st.newItem && !st.items[to]) {
        st.items[to] = st.newItem;
        st.newItem = null;
        XQ_MODULE.updateEffectCache();
      }
    } else {
      const tmp = st.items[from];
      st.items[from] = st.items[to];
      st.items[to] = tmp;
      XQ_MODULE.updateEffectCache();
    }
    this.render();
  },

  /* ---------- quickDelete（newItem 删除） ---------- */
  _doQuickDelete() {
    if (!this.state || !this.state.newItem) return;
    this.state.newItem = null;
    this.toast('已放弃新仙器');
    this.render();
  },

  /* ---------- 升级 ---------- */
  _doUpgrade() {
    const idx = this.openId;
    if (idx < 0 || idx === undefined) return;
    const item = idx === -1 ? (this.state && this.state.newItem) : (this.state && this.state.items[idx]);
    if (!item) return;
    const cost = XQ_MODULE.upgradeCost(item);
    if (XQ_CUR.value('xq_fragment') < cost) { this.toast('灵玉不足'); return; }

    if (idx === -1) {
      // newItem 还没装备 → 直接改 level
      item.level += 1;
      item.fragmentsSpent = (item.fragmentsSpent || 0) + cost;
      XQ_CUR.spend('xq_fragment', cost);
      this.toast(`升级成功！`);
    } else {
      XQ_MODULE.upgrade(idx);
    }
    this.render();
  },

  /* ---------- 销毁 ---------- */
  _doDelete() {
    const idx = this.openId;
    if (idx < 0 || idx === undefined) return;
    if (!confirm('确定销毁？返还灵玉')) return;

    if (idx === -1) {
      // newItem → 手动处理
      const it = this.state.newItem;
      if (it) {
        const refund = XQ_MODULE.destroyPrice(it);
        this.state.newItem = null;
        if (refund > 0) XQ_CUR.add('xq_fragment', refund);
      }
    } else {
      XQ_MODULE.destroy(idx);
    }
    this.dialogOpen = false;
    this.openId = undefined;
    this.render();
  },

  /* ---------- wildcard 应用效果 ---------- */
  _doApplyEffect(idx) {
    const select = this.el.querySelector(`select[data-wc-slot="${idx}"]`);
    if (!select) return;
    const val = select.value || null;
    if (this.openId === -1) {
      // newItem
      const item = this.state.newItem;
      XQ_MODULE.setNewItemEffect(idx, val);
    } else {
      const item = this.state.items[this.openId];
      if (item) item.effect[idx] = val;
      XQ_MODULE.updateEffectCache();
    }
    this.render();
  },

  /* ---------- 应用 modifier（简化版：仅日精月华） ---------- */
  _doApplyModifier(name) {
    if (this.openId < 0) return;
    const item = this.state.items[this.openId];
    if (!item) return;
    const t = this.types[item.type];
    if ((item.modifier || []).length >= (t.maxModifiers || 1)) { this.toast('特殊效果槽已满'); return; }
    if ((item.modifier || []).includes(name)) { this.toast('已拥有该效果'); return; }
    item.modifier = item.modifier || [];
    item.modifier.push(name);
    this.toast(`应用成功：${XQ_MODIFIERS[name].name}`);
    this.render();
  },

  /* ---------- 存档钩子（与旧版兼容） ---------- */
  loadSave() { try { return JSON.parse(localStorage.getItem(this.SAVE_KEY)); } catch (e) { return null; } },
  save() {
    if (typeof XQ_MODULE === 'undefined') return;
    try {
      const obj = XQ_MODULE.snapshot();
      obj.savedAt = Date.now();
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(obj));
    } catch (e) {}
  }
};

if (typeof window !== 'undefined') window.GB_XQ_VIEW = GB_XQ_VIEW;

if (typeof GB_MODULES !== 'undefined') GB_MODULES.attachView('treasure', GB_XQ_VIEW);
