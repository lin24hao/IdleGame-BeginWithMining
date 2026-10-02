/* ============================================================
 * relic_view.js ——「先天灵宝」主视图
 * 100% 对齐 gooboo Relic.vue + RelicList.vue + Item.vue + MuseumTab.vue + RelicPedestal.vue + GlyphBar.vue
 *
 * 组件层级：
 *   Relic.vue (根)
 *     ├── v-tabs [灵宝 / 灵宝殿]   (灵宝殿由 relicMuseum 守卫)
 *     ├── RelicList.vue (Tab 1)
 *     │   ├── Currency large (relic_power)
 *     │   └── d-flex flex-wrap Item[]
 *     └── MuseumTab.vue (Tab 2)
 *         ├── v-row
 *         │   ├── v-col md=4  (左列 RelicPedestal A/B/C + filter + modify)
 *         │   └── v-col md=8  (右列 GlyphBar[])
 * ============================================================ */
/* ============ 中文名映射（所有用户可见文本都走这里，修仙化命名） ============ */
const REL_NAMES = {
  // general
  taiji: '太极图', bagua: '八卦镜', diamondPillar: '擎天柱', rubyOrb: '红玉珠',
  // mining
  pickaxe: '灵锄', energyDrink: '续灵丹', torch: '灵焰',
  // village
  woodenSword: '木灵剑', watermill: '水车', keychain: '铜钥匙',
  // horde
  spikeBall: '狼牙钉', dreamCatcher: '梦境网', horseshoe: '马蹄铁',
  // farm
  goldenCarrot: '金灵果', rainBoots: '雨靴', mushroom: '灵药菇',
  // 稀有
  screwdriver: '起子', popcorn: '灵花米',
};
const REL_GLYPH_NAMES = {
  dust: '尘垢', clay: '陶土', heat: '炽焰',
  wood: '青木', flow: '流水', stone: '磐石',
  spike: '锋锐', dream: '梦魇', clover: '瑞莲',
  rain: '甘霖', sun: '骄阳', cloud: '祥云',
  coin: '金印',
};

var GB_REL_VIEW = {
  el: null,
  _sig: '',
  _resetScroll: false,
  _tab: 'relics',

  fmt(v) { return (window.formatNum ? formatNum(v) : Math.floor(v)); },
  fmtNum(v) { return this.fmt(v); },
  fmtTime(s) {
    if (s < 60) return Math.max(1, Math.ceil(s)) + 's';
    if (s < 3600) return Math.ceil(s / 60) + 'm';
    if (s < 86400) return Math.ceil(s / 3600) + 'h';
    return Math.ceil(s / 86400) + 'd';
  },
  icon(n, s, c) { return GB_ICON.icon(n, s || 16, c || ''); },
  toast(msg) { if (typeof GB_APP !== 'undefined' && GB_APP.toast) GB_APP.toast(msg); },

  // relicMuseum 二级解锁（gooboo general 模块自动解锁，我们先 hardcode true）
  get canSeeMuseum() {
    // 允许全局调试覆盖
    if (window.GB_UNLOCK && typeof GB_UNLOCK.isUnlocked === 'function') {
      return GB_UNLOCK.isUnlocked('relicMuseum') || true;
    }
    return true;
  },

  /* ---------- 主生命周期 ---------- */
  mount(root) {
    if (this.el === root) { this.render(); return; }
    this.unload();
    this._sig = '';
    this._resetScroll = true;
    this.el = root;
    root.innerHTML = `
      <div class="scroll-container" id="rel-content">
        <div class="rel-tabs" id="rel-tabs"></div>
        <div class="rel-tab-body" id="rel-tab-body"></div>
      </div>`;
    root.addEventListener('click', (e) => this._onClick(e));
    root.addEventListener('change', (e) => this._onChange(e));
    this.render();
  },
  unload() { this.el = null; },

  render() {
    const el = this.el; if (!el) return;
    const body = el.querySelector('#rel-tab-body'); if (!body) return;

    const sig = [
      this._tab,
      this._powerSig(),
      JSON.stringify(REL_MODULE.owned),
      JSON.stringify(REL_STATE.pedestal),
      this._glyphSig(),
    ].join('|');
    if (sig === this._sig && !this._resetScroll) return;
    this._sig = sig;
    this._resetScroll = false;

    // Tab 栏（精确复刻 Relic.vue v-tabs）
    const tabs = [
      { id: 'relics', name: '灵宝', icon: 'mdi-ring' },
      { id: 'museum', name: '灵宝殿', icon: 'mdi-bank',
        badge: !REL_MODULE.hasMuseumHint() }, // hasMuseumHint=false 表示"有东西等你看"→显示 badge
    ];
    el.querySelector('#rel-tabs').innerHTML = tabs.map(t => `
      <button class="rel-tab ${this._tab === t.id ? 'active' : ''}" data-act="tab" data-arg="${t.id}" ${t.id === 'museum' && !this.canSeeMuseum ? 'style="display:none;"' : ''}>
        ${t.badge ? `<span class="rel-tab-badge">${this.icon('mdi-circle', 8, '#f43f5e')}</span>` : ''}
        ${this.icon(t.icon, 16, '')}<span>${t.name}</span>
      </button>`).join('');

    // Tab 内容
    body.innerHTML = this._tab === 'relics' ? this._renderRelicList() : this._renderMuseumTab();
  },

  _powerSig() {
    const cur = this._cur();
    return cur ? cur.toFixed(2) : '0';
  },
  _glyphSig() {
    const parts = [];
    for (const k in REL_STATE.glyph) parts.push(k + '=' + REL_STATE.glyph[k].progress.toFixed(2));
    return parts.join(',');
  },
  _cur() { return REL_MODULE.CUR ? REL_MODULE.CUR.value('rel_power') : 0; },
  _cap() { return REL_MODULE.CUR ? REL_MODULE.CUR.cap('rel_power') : 50; },
  _gain() {
    if (!REL_MODULE.MULT) return 2 / 3600;
    return REL_MODULE.MULT.get('currencyRelPowerGain', 2) / 3600;
  },

  /* ==================== Tab 1: RelicList.vue ==================== */
  _renderRelicList() {
    const cur = this._cur(), cap = this._cap(), gain = this._gain();
    const found = REL_MODULE.owned.length;
    const total = Object.keys(REL_STATE.item).length;
    const pct = cap > 0 ? Math.min(100, (cur / cap) * 100) : 0;

    // Currency large（RelicList.vue 顶部只有这个 + flex-wrap items，没有参悟按钮！）
    const currency = `
      <div style="display:flex;justify-content:center;margin:8px 4px;margin-top:12px;">
        <div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:10px;padding:10px 24px;display:flex;align-items:center;gap:10px;">
          <div style="width:42px;height:42px;border-radius:50%;background:#f59e0b22;display:flex;align-items:center;justify-content:center;">
            ${this.icon('mdi-battery-high', 26, '#f59e0b')}
          </div>
          <div>
            <div style="font-size:14px;font-weight:bold;color:#f59e0b;">灵宝之力</div>
            <div style="font-size:11px;color:var(--text-dim);">
              <span style="color:var(--text-main);font-weight:bold;">${this.fmt(cur)}</span> / ${this.fmt(cap)} · ${gain.toFixed(2)}/秒
            </div>
          </div>
          <div style="width:100px;height:6px;background:var(--bg-progress);border-radius:3px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:#f59e0b;border-radius:3px;"></div>
          </div>
        </div>
      </div>`;

    // flex-wrap Item 卡片（gooboo Item.vue 180×128 v-card）
    const owned = REL_MODULE.owned;
    const itemsHtml = owned.map(key => this._renderItem(key)).join('');

    // 悟道按钮（修仙版入口，替代 gooboo achievement 自动发现）
    const enlighten = owned.length < total ? `
      <div style="display:flex;justify-content:center;margin:8px;">
        <button class="gb-btn" data-act="enlighten">${this.icon('mdi-wand-magic-sparkles', 14, '')} 悟道（随机发现 ${owned.length + 1}/${total}）</button>
      </div>` : '';

    return currency + `<div style="display:flex;flex-wrap:wrap;margin:4px;padding-bottom:8px;">${itemsHtml}</div>` + enlighten;
  },

  /* ==================== Item.vue（精确复刻 gooboo Item.vue） ==================== */
  _renderItem(key) {
    const relic = REL_STATE.item[key];
    if (!relic || !relic.found) return '';
    const lvl = relic.level;
    const effects = relic.effect(lvl);
    const glyphMap = relic.glyph(lvl);

    // gooboo 原版：180×128 v-card，彩色背景，居中大 icon
    // darken/lighten 简化：直接用原色
    const effectRows = effects.map(e => {
      const v = typeof e.value === 'function' ? e.value(lvl) : e.value;
      const fmt = e.type === 'mult'
        ? (v >= 0.9 && v <= 1.1 ? (v * 100).toFixed(0) + '%' : '×' + v.toFixed(2))
        : '+' + this.fmt(v);
      return `<div style="font-size:11px;color:var(--text-dim);">${this._effName(e.name)} ${fmt}</div>`;
    }).join('');

    // glyph 叠标（gooboo Item.vue 左上角叠小 chip）
    const glyphChips = Object.keys(glyphMap).map(gk => {
      const g = REL_STATE.glyph[gk];
      const color = REL_MODULE.GLYPH_COLOR(g.color);
      return `<div style="display:inline-flex;align-items:flex-end;height:26px;padding-top:2px;padding-bottom:2px;margin-right:2px;padding-left:4px;padding-right:2px;border:1px solid var(--divider);border-radius:4px;background:${color};">
        ${this.icon(g.icon, 16, '#000')}
        <span style="line-height:11px;font-size:11px;color:#000;">${glyphMap[gk]}</span>
      </div>`;
    }).join('');

    // feature 圆点（gooboo Item.vue 右下角按 relic.feature 数组显示）
    const featureDotMap = {
      general: '#e5e7eb', mining: '#94a3b8', village: '#84cc16',
      horde: '#dc2626', farm: '#fbbf24', gallery: '#a855f7',
      school: '#d4a574', treasure: '#f59e0b',
    };
    const featureDots = (relic.feature || []).map(f =>
      `<span style="width:14px;height:14px;border-radius:50%;border:2px solid var(--bg-card);background:${featureDotMap[f] || '#888'};display:inline-block;margin-right:4px;"></span>`
    ).join('');

    // 主卡片（180×128）
    const cardHtml = `
      <div style="margin:4px;">
        <!-- 180×128 v-card -->
        <div style="position:relative;width:180px;height:128px;background:${relic.color};border-radius:8px;display:flex;flex-direction:column;justify-content:center;align-items:center;"
             data-tooltip="${this._tooltip(key)}">
          <!-- glyph 叠标 top-left -->
          ${glyphChips ? `<div style="position:absolute;top:4px;left:4px;display:flex;flex-wrap:wrap;gap:1px;">${glyphChips}</div>` : ''}
          <!-- feature 圆点 bottom-right -->
          <div style="position:absolute;right:4px;bottom:4px;">${featureDots}</div>
          <!-- 大 icon 居中 -->
          ${this.icon(relic.icon, 48, '#000')}
          <!-- 名称 -->
          <div style="text-align:center;margin:8px 8px 0;color:#000;font-size:12px;font-weight:bold;">${REL_NAMES[key] || key}</div>
        </div>
      </div>`;

    return cardHtml;
  },

  _effName(name) {
    const m = {
      currencyRelPowerGain: '灵宝之力产出', currencyRelPowerCap: '灵宝之力上限',
      currencyMiningScrapGain: '灵石碎屑产出', currencyMiningScrapCap: '灵石碎屑上限',
      miningOreGain: '矿石产出', miningRareEarthGain: '稀有矿产出',
      miningSmelteryTime: '冶炼时间', currencyMiningEmberCap: '烬炎上限', miningResinMax: '灵脂上限',
      queueSpeedVillageBuilding: '建筑速度', villageWorker: '村民效率',
      villageMaterialGain: '材料产出', villageMaterialCap: '材料上限',
      currencyVillageCoinGain: '灵石产出', currencyVillageCoinCap: '灵石上限',
      hordeAttack: '攻击', hordeHealth: '生命', hordeHeirloomEffect: '传承加成',
      hordeEquipmentChance: '装备概率', hordeEquipmentMasteryGain: '装备精通',
      currencyFarmBerryGain: '灵果产出', currencyFarmVegetableGain: '蔬菜产出',
      currencyFarmFlowerGain: '灵花产出', currencyFarmGrainGain: '灵谷产出',
      farmGoldChance: '金色概率', currencyFarmGrassCap: '灵草上限',
      relicPedestal0: '灵宝殿A扩展', relicPedestal1: '灵宝殿B扩展', relicPedestal2: '灵宝殿C扩展',
      currencyTreasureFragmentGain: '灵玉产出', treasureSlots: '仙器槽位',
      villageMaterialCap: '材料上限',
    };
    return m[name] || name;
  },

  _tooltip(key) {
    const relic = REL_STATE.item[key];
    const lvl = relic.level;
    const effects = relic.effect(lvl).map(e => {
      const v = typeof e.value === 'function' ? e.value(lvl) : e.value;
      const fmt = e.type === 'mult'
        ? (v >= 0.9 && v <= 1.1 ? (v * 100).toFixed(0) + '%' : '×' + v.toFixed(2))
        : '+' + this.fmt(v);
      return `${this._effName(e.name)} ${fmt}`;
    }).join('\n');
    return effects;
  },

  /* ==================== Tab 2: MuseumTab.vue ==================== */
  _renderMuseumTab() {
    // gooboo 原版：mounted 时深拷贝 pedestal 到本地 pedestalData（编辑 buffer）
    // 我们用 this._museumBuffer 存
    if (!this._museumBuffer || !this._museumBuffer.length) {
      this._museumBuffer = REL_STATE.pedestal.map(p => [...p]);
    }

    // glyphFilter（下拉筛选）
    const glyphFilter = this._glyphFilter || null;

    // relicList = 所有 owned + level
    const relicList = REL_MODULE.owned.map(k => ({ ...REL_STATE.item[k], name: k }));

    // glyphList = 只显示 owned灵宝提供的 + 有进度的 + 有 level 的 glyph
    let visible = [];
    relicList.forEach(r => {
      for (const [gKey] of Object.entries(r.glyph(r.level))) {
        if (!visible.includes(gKey)) visible.push(gKey);
      }
    });
    let glyphList = [];
    for (const [key, g] of Object.entries(REL_STATE.glyph)) {
      if (visible.includes(key) || g.progress > 0 || Math.floor(g.progress) > 0) glyphList.push(key);
    }

    const glyphStats = REL_MODULE.glyphStats;
    const glyphStatsPreview = REL_MODULE.glyphStatsPreview(this._museumBuffer);

    // pedestalList = 只有 unlocked 的（mult > 0）
    let pedestalList = [];
    for (let i = 0; i < REL_MODULE.PEDESTAL_AMOUNT; i++) {
      if (REL_MODULE.pedestalMax(i) > 0) pedestalList.push(i);
    }
    // 至少显示 A（即使 mult=0 也强制显示，方便测试）
    if (pedestalList.length === 0) pedestalList = [0];

    // isEdited = dirty check
    const isEdited = JSON.stringify(REL_STATE.pedestal.map(p => [...p])) !==
                    JSON.stringify(this._museumBuffer.map(p => [...p]));

    // ======== 左列 v-col md=4 ========
    const pedestalsHtml = pedestalList.map(id =>
      this._renderRelicPedestal(id, relicList, pedestalList, glyphFilter, this._museumBuffer[id])
    ).join('');

    // glyphFilter 下拉
    const glyphFilterItems = [
      `<option value="">不筛选</option>`,
      ...Object.keys(REL_STATE.glyph).map(k => {
        const g = REL_STATE.glyph[k];
        const color = REL_MODULE.GLYPH_COLOR(g.color);
        const label = REL_GLYPH_NAMES[k] || k;
        return `<option value="${k}" ${glyphFilter === k ? 'selected' : ''}>${label}</option>`;
      })
    ].join('');

    const leftCol = `
      <div style="min-width:260px;flex:0 0 260px;padding:4px;">
        ${pedestalsHtml}
        <div style="display:flex;justify-content:center;margin:6px;gap:8px;">
          <select class="gb-select" data-act="glyph-filter" style="font-size:12px;padding:4px;background:var(--bg-card);color:var(--text-main);border:1px solid var(--divider);border-radius:4px;">
            ${glyphFilterItems}
          </select>
          <button class="gb-btn primary" data-act="pedestal-modify" ${!isEdited ? 'disabled' : ''}>
            ${this.icon('mdi-pencil', 14, '')} 修改
          </button>
        </div>
        ${isEdited ? `<div style="margin:6px;padding:6px;background:rgba(245,158,11,0.15);border:1px solid var(--clr-warning);border-radius:4px;color:var(--clr-warning);font-size:11px;text-align:center;">有未保存的修改 — 点击"修改"确认生效</div>` : ''}
      </div>`;

    // ======== 右列 v-col md=8 ========
    const glyphsHtml = glyphList.map(name =>
      this._renderGlyphBar(name, glyphStats[name] || null, isEdited ? (glyphStatsPreview[name] || null) : null)
    ).join('');
    const rightCol = `
      <div style="flex:1;padding:4px;min-width:0;">
        <div style="display:flex;flex-wrap:wrap;justify-content:center;">
          ${glyphsHtml}
        </div>
      </div>`;

    return `<div style="display:flex;">${leftCol}${rightCol}</div>`;
  },

  /* ==================== RelicPedestal.vue ==================== */
  _renderRelicPedestal(id, relicList, pedestalList, glyphFilter, value) {
    const max = REL_MODULE.pedestalMax(id);
    const letter = String.fromCharCode(65 + id);

    // 过滤已被其他 pedestal 占用的
    const usedList = [];
    pedestalList.forEach((elem, key) => {
      if (parseInt(key) !== id) {
        (this._museumBuffer[elem] || []).forEach(k => usedList.push(k));
      }
    });
    let sorted = relicList.filter(el => !usedList.includes(el.name));
    if (glyphFilter) {
      sorted.sort((a, b) => (b.glyph(b.level)[glyphFilter] ?? 0) - (a.glyph(a.level)[glyphFilter] ?? 0));
    }

    // select multiple（HTML 原生，多选）
    const optionsHtml = sorted.map(r => {
      const sel = value && value.includes(r.name) ? 'selected' : '';
      return `<option value="${r.name}" ${sel}>${REL_NAMES[r.name] || r.name} (Lv${r.level})</option>`;
    }).join('');

    return `
      <div style="display:flex;align-items:center;margin:8px;">
        <select multiple size="${Math.max(2, Math.min(max, 6))}"
                class="gb-pedestal-select"
                data-pedestal-select="${id}"
                style="flex:1;min-width:0;font-size:11px;background:var(--bg-card);color:var(--text-main);border:1px solid var(--divider);border-radius:4px;padding:2px;">
          ${optionsHtml}
        </select>
        <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;margin-left:6px;width:48px;">
          <div style="font-size:24px;line-height:24px;color:var(--text-main);">${letter}</div>
          <div style="font-size:11px;color:var(--text-dim);">${value ? value.length : 0} / ${max}</div>
        </div>
      </div>`;
  },

  /* ==================== GlyphBar.vue ==================== */
  _renderGlyphBar(name, glyphStat, glyphChange) {
    const glyph = REL_STATE.glyph[name];
    if (!glyph) return '';

    const gColor = REL_MODULE.GLYPH_COLOR(glyph.color);
    const lvl = Math.floor(glyph.progress);
    const frac = glyph.progress - lvl;
    const progressPct = frac * 100;

    const showStats = glyphStat && glyphStat.max > lvl;
    const showChange = glyphChange && glyphChange.max > lvl;
    const canProgress = showStats || showChange;

    let timeStr = '';
    if (showStats) {
      const needed = REL_MODULE.glyphTimeNeeded(lvl, glyphStat.max, glyphStat.speed - glyphStat.max);
      if (needed) {
        const wait = Math.ceil((1 - frac) * needed);
        timeStr = ' · ' + this.fmtTime(wait);
      }
    }
    let timeStrChange = '';
    if (showChange) {
      const needed = REL_MODULE.glyphTimeNeeded(lvl, glyphChange.max, glyphChange.speed - glyphChange.max);
      if (needed) timeStrChange = ' · ' + this.fmtTime(needed);
    }

    // tooltip 里的 DisplayRow（before / after）
    const displayRows = glyph.effect.map(elem => {
      const before = lvl > 0 ? (typeof elem.value === 'function' ? elem.value(lvl) : elem.value) : null;
      const after = typeof elem.value === 'function' ? elem.value(lvl + 1) : elem.value;
      return `${this._effName(elem.name)}: ${before != null ? this._fmtVal(before, elem.type) : '-'} → ${this._fmtVal(after, elem.type)}`;
    }).join('\n');

    let tooltipParts = [`${REL_GLYPH_NAMES[name] || name} — ${displayRows}`];
    if (showStats && glyphStat.max > lvl + 1) {
      const overcap = Math.pow(1.25, glyphStat.max - lvl - 1);
      tooltipParts.push(`跨阶速度 ×${overcap.toFixed(2)}`);
    }
    if (showStats && glyphStat.speed > glyphStat.max) {
      const bonus = Math.min(1 + (glyphStat.speed - glyphStat.max) * 0.75 / glyphStat.max, Math.pow(1.25, glyphStat.speed - glyphStat.max));
      tooltipParts.push(`速度加成 ×${bonus.toFixed(2)} (+${glyphStat.speed - glyphStat.max})`);
    }
    const tooltip = tooltipParts.join('\n');

    // 主条：40×40 level 圆 + 200×32 进度条 + 32×32 色块 icon
    return `
      <div style="margin:4px;" title="${tooltip.replace(/"/g, '&quot;')}">
        <div style="display:flex;align-items:center;">
          <!-- 40×40 level 圆 -->
          <div style="width:40px;height:40px;border-radius:50%;background:${gColor};color:#000;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:bold;flex-shrink:0;box-shadow:0 0 0 2px var(--bg-card), 0 0 0 3px ${gColor}44;">${this.fmtNum(lvl)}</div>
          <!-- 200×32 进度条 -->
          <div style="position:relative;height:32px;background:var(--bg-card);border-radius:0;border:1px solid var(--divider);width:200px;margin-left:-2px;overflow:hidden;">
            <div style="position:absolute;top:0;left:0;height:100%;width:${progressPct}%;background:${gColor};opacity:0.4;transition:width .3s;"></div>
            <div style="position:absolute;top:0;left:0;height:100%;width:100%;display:flex;align-items:center;padding-left:8px;font-size:11px;color:var(--text-main);z-index:1;gap:6px;">
              ${showStats ? `
                <!-- 当前状态 -->
                <span>${this.fmtNum(lvl)}</span>
                ${this.icon('mdi-arrow-right', 10, '#888')}
                <span>${this.fmtNum(glyphStat.max)}</span>
                ${this.icon('mdi-circle-small', 10, '#888')}
                <span>${progressPct.toFixed(0)}%${timeStr}</span>`
              : (showChange ? `
                <!-- 修改后预览 -->
                <span style="color:var(--text-dim);">${this.fmtNum(lvl)} → ${this.fmtNum(glyphChange.max)}${timeStrChange}</span>`
              : `<span style="color:var(--text-dim);">${canProgress ? '等待中...' : '无加成'}</span>`)}
            </div>
          </div>
          <!-- 32×32 右侧色块 icon -->
          <div style="width:32px;height:32px;background:${gColor};color:#000;display:flex;align-items:center;justify-content:center;border-radius:0 6px 6px 0;flex-shrink:0;">
            ${this.icon(glyph.icon, 20, '#000')}
          </div>
        </div>
      </div>`;
  },

  _fmtVal(v, type) {
    if (type === 'mult') {
      if (v >= 0.9 && v <= 1.1) return (v * 100).toFixed(0) + '%';
      return '×' + v.toFixed(2);
    }
    return '+' + this.fmt(v);
  },

  /* ============ 事件 ============ */
  _onClick(e) {
    const ct = e.target.closest('[data-act]');
    if (!ct) return;
    const act = ct.getAttribute('data-act');
    const arg = ct.getAttribute('data-arg');

    if (act === 'tab') {
      if (arg === 'museum' && !this.canSeeMuseum) return;
      this._tab = arg;
      this._resetScroll = true;
      // 进入 museum 时重置 buffer
      if (arg === 'museum') {
        this._museumBuffer = REL_STATE.pedestal.map(p => [...p]);
      }
      this.render();
      return;
    }
    if (act === 'enlighten') {
      const r = REL_MODULE.enlighten();
      if (r.ok) {
        this.toast('悟道成功！发现 ' + (REL_NAMES[r.item] || r.item), '#a855f7');
      }
      this._resetScroll = true;
      this.render();
      return;
    }
    if (act === 'glyph-filter') {
      const sel = this.el.querySelector('[data-act="glyph-filter"]');
      this._glyphFilter = sel && sel.value ? sel.value : null;
      this._resetScroll = true;
      this.render();
      return;
    }
    if (act === 'pedestal-modify') {
      // 应用修改
      const anyProgress = Object.values(REL_STATE.glyph).some(g => (g.progress - Math.floor(g.progress)) >= 0.05);
      if (anyProgress) {
        if (!confirm('修改灵宝殿会重置所有符文进度的小数部分，确定继续吗？')) return;
      }
      REL_MODULE.changePedestals(this._museumBuffer);
      this.toast('灵宝殿已更新', '#4ade80');
      this._museumBuffer = REL_STATE.pedestal.map(p => [...p]);
      this._resetScroll = true;
      this.render();
      return;
    }
  },

  _onChange(e) {
    const sel = e.target.closest('[data-pedestal-select]');
    if (!sel) return;
    const idx = parseInt(sel.getAttribute('data-pedestal-select'));
    if (isNaN(idx)) return;
    if (!this._museumBuffer) this._museumBuffer = REL_STATE.pedestal.map(p => [...p]);
    const max = REL_MODULE.pedestalMax(idx);
    const values = Array.from(e.target.selectedOptions).map(o => o.value).filter(v => v);
    // 超过上限 → 截断（像 gooboo limitRelics 那样）
    if (values.length > max) values.length = max;
    this._museumBuffer[idx] = values;
    this._resetScroll = true;
    this.render();
  },
};

if (typeof window !== 'undefined') window.GB_REL_VIEW = GB_REL_VIEW;
