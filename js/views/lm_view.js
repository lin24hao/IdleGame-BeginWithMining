/* ============================================================
 * lm_view.js —— 灵脉（mining）主视图：忠实复刻 gooboo Mining.vue
 *
 * 布局（桌面）：顶部 tabs（采掘 / 驻脉）→ 三列 content-row：
 *   采掘：状态列 | 库存/铸器列 | 秘法升级列
 *   驻脉：飞升状态列 | 飞升奖励列 | 飞升秘法列
 * 窄屏自动折叠为单列。
 *
 * 所有读取走 LM_RT.getters / CUR / UPG / STAT / UNLOCK，
 * 所有操作走 LM_RT.*（深度/耐久导航直接改 LM_RT.lmState）。
 * ============================================================ */
var GB_LM_VIEW = {
  tab: 'mine',
  el: null,
  _lastRender: 0,
  SHOW_TOOLTIPS: true,
  _collapseMap: {},   // 每个升级项的折叠状态缓存（true=折叠，false/undefined=展开）

  /* ---------- 文案 ---------- */
  T(n, f) { const x = LM_TEXT; return (x && x.TERMS && x.TERMS[n]) || f || n; },
  statName(k) { const x = LM_TEXT && LM_TEXT.STAT, kk = String(k).replace(/^lm_/, ''); return (x && x[kk]) || kk; },
  curName(k) {
    const x = LM_TEXT && LM_TEXT.CURRENCY;
    const raw = String(k);
    if (x && x[raw]) return x[raw];
    // 首字母小写后拼回（处理 lm_OreAluminium → lm_oreAluminium）
    const m = raw.match(/^(lm_)([A-Z])(.+)$/);
    if (m && x && x[m[1] + m[2].toLowerCase() + m[3]]) return x[m[1] + m[2].toLowerCase() + m[3]];
    // 全小写
    const lk = raw.toLowerCase();
    if (x && x[lk]) return x[lk];
    return raw.replace(/^lm_/, '').replace(/([A-Z])/g, ' $1').trim();
  },
  upgName(id) {
    const x = LM_TEXT && LM_TEXT.UPGRADE;
    const kk = String(id).replace(/^lm_/, '');
    if (x && x[kk]) return x[kk];
    return kk;
  },
  unlockName(id) { const x = LM_TEXT && LM_TEXT.UNLOCK; return (x && x[id]) || String(id).replace(/^lm/, ''); },

  /* ---------- 辅助：把 mult/base/bonus 的 name 转中文描述 ---------- */
  effectDisplayName(name) {
    if (!name) return '';
    // currencyLmXxxGain / currencyLmXxxCap → 首字母小写后拼 lm_（CURRENCY 字典 key 是 lm_oreAluminium 这种小写起头的驼峰）
    const mGain = name.match(/^currencyLm(.+)Gain$/);
    if (mGain) return this.curName('lm_' + mGain[1][0].toLowerCase() + mGain[1].slice(1)) + '产出';
    const mCap = name.match(/^currencyLm(.+)Cap$/);
    if (mCap) return this.curName('lm_' + mCap[1][0].toLowerCase() + mCap[1].slice(1)) + '容量';
    // upgradeLmXxxCap → 驼峰 key 去 UPGRADE 字典查（upgName 内部去 lm_ 前缀后查）
    const uCap = name.match(/^upgradeLm(.+)Cap$/);
    if (uCap) return this.upgName('lm_' + uCap[1]) + '上限';
    // lmOreCap / lmDamage → 先驼峰查 TERMS/STAT/UPGRADE，再 lower 查（字典 key 混合两种格式）
    const lm = name.match(/^lm(.+)$/);
    if (lm) {
      const camel = lm[1];          // 驼峰：OreCap
      const low = camel.toLowerCase(); // 全小写：orecap
      const tb = LM_TEXT.TERMS; const st = LM_TEXT.STAT; const up = LM_TEXT.UPGRADE;
      if (tb && (tb[camel] || tb[low])) return tb[camel] || tb[low];
      if (st && (st[camel] || st[low])) return st[camel] || st[low];
      if (up && (up[camel] || up[low])) return up[camel] || up[low];
      return camel.replace(/([A-Z])/g, ' $1').trim();
    }
    return name;
  },

  /* ---------- 辅助：格式化 effect 的数值显示 ---------- */
  formatEffectValue(val, multInfo) {
    if (val === null || val === undefined || val === Infinity) return '∞';
    if (multInfo && multInfo.display === 'percent') return (val * 100).toFixed(1) + '%';
    if (multInfo && multInfo.display === 'timeMs') return lmFormatTime(val / 1000);
    if (multInfo && multInfo.display === 'temperature') return Math.round(val) + '°';
    if (multInfo && multInfo.display === 'int') return Math.round(val).toLocaleString();
    return this.fmt(val);
  },

  /* ---------- 辅助：effect 的 before → after 对比行 ---------- */
  effectCompareRows(eff, lvl) {
    try {
      const beforeVal = typeof eff.value === 'function' ? eff.value(lvl) : eff.value;
      const afterVal = typeof eff.value === 'function' ? eff.value(lvl + 1) : eff.value;
      const multInfo = MULT.items[eff.name];
      const displayName = this.effectDisplayName(eff.name);
      const fmt = (v) => this.formatEffectValue(v, multInfo);

      if (eff.type === 'unlock') {
        // 布尔型解锁
        const now = !!beforeVal;
        const next = !!afterVal;
        if (!now && next) {
          return [{ label: this.unlockName(eff.name), before: null, after: '✅ 解锁', isBool: true }];
        }
        return [];
      }
      if (eff.type === 'keepUpgrade') return [{ label: '飞升后保留「' + this.upgName('lm_' + eff.name) + '」', before: null, after: afterVal ? '✅' : '❌', isBool: true }];
      if (eff.type === 'uncapUpgrade') return [{ label: '解除「' + this.upgName('lm_' + eff.name) + '」上限', before: null, after: afterVal ? '✅' : '❌', isBool: true }];

      if (beforeVal === afterVal) return [];
      // mult 类型：倍率
      if (eff.type === 'mult') {
        return [{ label: displayName, before: '×' + fmt(beforeVal), after: '×' + fmt(afterVal) }];
      }
      // base / bonus 类型
      return [{ label: displayName, before: fmt(beforeVal), after: fmt(afterVal) }];
    } catch (e) { return []; }
  },

  /* ---------- 便捷数据访问 ---------- */
  get state() { return LM_RT.lmState; },
  get subfeature() { return SYSTEM.state.features.lm.currentSubfeature; },
  G(name) { try { return LM_RT.getters[name]; } catch (e) { return null; } },
  curVal(k) { return CUR.value(k); },
  icon(n, s, c) { return GB_ICON.icon(n, s || 16, c || ''); },
  rimeLatin() { return ''; },

  /* ---------- 生命周期 ---------- */
  mount(root) {
    if (this.el === root) {
      this.render();
      // 即使是同一个 root，也确保自动挖矿 timer 在跑（有时会被 clearInterval 后未重启）
      if (!this._autoMineTimer) {
        this._autoMineTimer = setInterval(() => { this._playAutoMineHit(); }, 1000);
      }
      return;
    }
    this.el = root;
    root.innerHTML = `
      <div class="gb-tabs">
        <button class="gb-tab active" data-tab="mine" onclick="GB_LM_VIEW.setTab('mine')">
          ${GB_ICON.icon('mdi-pickaxe', 20)}采掘</button>
        ${this.unlocked('lmDepthDweller') ? `
        <button class="gb-tab" data-tab="dweller" onclick="GB_LM_VIEW.setTab('dweller')">
          ${GB_ICON.icon('mdi-elevator-down', 20)}驻脉</button>` : ''}
      </div>
      <div class="flex1 scroll-container" id="lm-content"></div>
      <input type="hidden" id="lm-tip-holder" />
    `;
    root.querySelector('.flex1').addEventListener('click', (e) => {
      const buy = e.target.closest('[data-buy]');
      if (buy) {
        const id = buy.getAttribute('data-buy');
        LM_RT.buyUpgrade(id);
        GB_APP.persist();
        this.render();
        return;
      }
      const buyMax = e.target.closest('[data-buy-max]');
      if (buyMax) {
        const id = buyMax.getAttribute('data-buy-max');
        LM_RT.buyUpgradeMax(id);
        GB_APP.persist();
        this.render();
        return;
      }
      const toggle = e.target.closest('[data-toggle-collapse]');
      if (toggle) {
        const id = toggle.getAttribute('data-toggle-collapse');
        this._collapseMap[id] = !this._collapseMap[id];
        this.render();
        return;
      }
      const act = e.target.closest('[data-act]');
      if (act) this.handleAction(act.getAttribute('data-act'));
    });
    // 启动自动挖矿动画循环（每秒一次，和 tick 同步；独立驱动，不依赖 store 变化）
    if (this._autoMineTimer) clearInterval(this._autoMineTimer);
    this._autoMineTimer = setInterval(() => { this._playAutoMineHit(); }, 1000);
  },
  unload() {
    if (this._autoMineTimer) { clearInterval(this._autoMineTimer); this._autoMineTimer = null; }
    this._killHitFx();
    this.el = null;
  },

  /* 自动挖矿单次命中动画：矿锄挥一次 + 火花 + 飘字（独立驱动，1s 一次） */
  _playAutoMineHit() {
    if (this._breaking) return;
    const dmg = this.G('currentDamage');
    if (!dmg || dmg <= 0) return;
    if (this.tab !== 'mine') return;
    this._playHitFx();
    const ore = document.getElementById('lm-ore');
    if (ore) { ore.classList.remove('hit'); void ore.offsetWidth; ore.classList.add('hit'); }
  },
  setTab(t) {
    this.tab = t;
    this._resetScroll = true;
    const root = this.el;
    if (!root) return;
    root.querySelectorAll('.gb-tab').forEach(b => b.classList.toggle('active', b.getAttribute('data-tab') === t));
    this.render();
  },
  render() {
    const content = this.el && this.el.querySelector('#lm-content');
    if (!content) return;

    // --- 保存所有滚动容器的位置（外层 + 内层 .scroll-container-tab）---
    const reset = this._resetScroll;
    this._resetScroll = false;
    const saved = reset ? null : {
      outer: content.scrollTop,
      // 所有内层 scroll-container-tab 的滚动位置（按 DOM 顺序保存/恢复）
      innerTabs: Array.from(content.querySelectorAll('.scroll-container-tab')).map(el => el.scrollTop),
      // 升级卡网格的独立滚动（如果存在）
      innerGrids: Array.from(content.querySelectorAll('.lm-upg-grid-scroll')).map(el => el.scrollTop),
    };

    content.innerHTML = this.tab === 'dweller' ? this.renderDweller() : this.renderMine();

    // --- 恢复所有滚动位置 ---
    if (saved) {
      content.scrollTop = saved.outer;
      // 内层 tab 滚动（右列秘法升级列表 / 驻脉状态列）
      const newTabs = content.querySelectorAll('.scroll-container-tab');
      newTabs.forEach((el, i) => { if (saved.innerTabs[i] != null) el.scrollTop = saved.innerTabs[i]; });
      // 升级网格滚动（弹层里的飞升秘法网格）
      const newGrids = content.querySelectorAll('.lm-upg-grid-scroll');
      newGrids.forEach((el, i) => { if (saved.innerGrids[i] != null) el.scrollTop = saved.innerGrids[i]; });
    }

    if (this._pendingDurPct != null) this._easeHp();
  },

  /* ---------- 操作 ---------- */
  handleAction(act) {
    const [cmd, arg] = String(act).split(':');
    switch (cmd) {
      case 'craft': try { LM_RT.craftPickaxe(); } catch (e) {} break;
      case 'prestige': try { LM_RT.prestige(); } catch (e) {} break;
      case 'toggleEnh': try { LM_RT.toggleEnhancements(); } catch (e) {} break;
      case 'addIng': try { LM_RT.addIngredient(arg); } catch (e) {} break;
      case 'rmIng': try { LM_RT.removeIngredient(Number(arg)); } catch (e) {} break;
      case 'selectEnh': try { LM_RT.selectEnhancement(arg); } catch (e) {} break;
      case 'enhance': try { LM_RT.enhance(); } catch (e) {} break;
      case 'smelt': try { LM_RT.addToSmeltery(arg); } catch (e) {} break;
      case 'depth': this.setDepth(Number(arg)); break;
      case 'switchSub': try { LM_RT.switchSubfeature(Number(arg)); } catch (e) {} break;
      case 'dialog': this.openDialog(arg); break;
      case 'hit': this.doHit(); break;
      default: break;
    }
    GB_APP.persist();
    this.render();
    if (this._dialog) this._renderDialog();
  },

  setDepth(d) {
    const st = LM_RT.lmState;
    const maxD = Math.max(1, this.maxDepth());
    const target = Math.max(1, Math.min(d, maxD));
    if (target === st.depth) return;
    st.depth = target;
    try { st.durability = LM_RT.getters.currentDurability || st.durability; } catch (e) {}
    LM_RT.afterChange();
    this.render();
  },

  maxDepth() {
    try { return Math.max(1, Number(STAT.get('lm_maxDepth' + this.subfeature)) || 1); } catch (e) { return 1; }
  },
  stuck() {
    return this.state.depth >= this.maxDepth();
  },
  hitsNeeded() {
    try { return LM_RT.getters.currentHitsNeeded; } catch (e) { return Infinity; }
  },

  unlocked(id) { try { return UNLOCK.isVisible(id) || UNLOCK.isUnlocked(id); } catch (e) { return false; } },

  /* ================= 采掘 tab ================= */
  renderMine() {
    const st = this.state;
    const depth = st.depth, maxD = this.maxDepth();

    const depthNav = `
      <div class="depth-nav">
        <button class="gb-btn icon" ${depth<=1?'disabled':''} onclick="GB_LM_VIEW.handleAction('depth:1')">${GB_ICON.icon('mdi-skip-backward',20)}</button>
        <button class="gb-btn icon" ${depth<=1?'disabled':''} onclick="GB_LM_VIEW.handleAction('depth:${Math.max(1,depth-10)}')">${GB_ICON.icon('mdi-step-backward-2',20)}</button>
        <button class="gb-btn icon" ${depth<=1?'disabled':''} onclick="GB_LM_VIEW.handleAction('depth:${depth-1}')">${GB_ICON.icon('mdi-step-backward',20)}</button>
        <span class="depth-val">${depth}层</span>
        <button class="gb-btn icon" ${depth>=maxD?'disabled':''} onclick="GB_LM_VIEW.handleAction('depth:${depth+1}')">${GB_ICON.icon('mdi-step-forward',20)}</button>
        <button class="gb-btn icon" ${depth>=maxD?'disabled':''} onclick="GB_LM_VIEW.handleAction('depth:${Math.min(maxD,depth+10)}')">${GB_ICON.icon('mdi-step-forward-2',20)}</button>
        <button class="gb-btn icon" ${depth>=maxD?'disabled':''} onclick="GB_LM_VIEW.handleAction('depth:${maxD}')">${GB_ICON.icon('mdi-skip-forward',20)}</button>
      </div>`;

    const scene = this.renderScene();
    const left = this.renderResources();
    const right = this.renderUpgrades('regular');

    const foot = `<div class="lm-foot">
      ${this.unlocked('lmPickaxeCrafting') && this.subfeature === 0 ? `<button class="lm-sec-btn" data-act="dialog:craft" data-tip="灵锄铸造">${GB_ICON.icon('mdi-hammer',16)}铸造</button>` : ''}
      ${this.unlocked('lmSmeltery') && this.subfeature === 0 ? `<button class="lm-sec-btn" data-act="dialog:smelt" data-tip="炼化灵材为灵锭">${GB_ICON.icon('mdi-gold',16)}炼化</button>` : ''}
      ${this.unlocked('lmEnhancement') && this.subfeature === 0 ? `<button class="lm-sec-btn" data-act="dialog:enh" data-tip="附灵台">${GB_ICON.icon('mdi-package-up',16)}附灵</button>` : ''}
      ${this.unlocked('lmDepthDweller') ? `<button class="lm-rebirth-btn" data-act="dialog:prestige" data-tip="渡劫轮回：以当前道行换取飞升收益与轮回秘法。">
        ${GB_ICON.icon('mdi-ghost',20)}轮回
      </button>` : ''}
    </div>`;

    return `<div class="lm-wrap">${depthNav}<div class="lm-body">${left}${scene}${right}</div>${foot}</div>`;
  },

  col(inner, cls) { return `<div class="${cls || 'col-4'}">${inner}</div>`; },

  /* ================= 左列：已采集资源 ================= */
  /* 单个资源行：图标 + 名称 + 数值 + 背景容量进度条 */
  resLine(icon, name, amount, cap) {
    const capped = isFinite(cap) && cap > 0;
    const pct = capped ? Math.max(0, Math.min(100, amount / cap * 100)) : 0;
    return `<div class="lm-res-line">
      ${capped ? `<div class="lm-res-fill" style="width:${pct}%;"></div>` : ''}
      <span class="lm-res-ic">${icon}</span>
      <span class="lm-res-name">${name}</span>
      <span class="lm-res-val">${this.fmt(amount)}${capped ? '<span class="lm-res-cap"> / ' + this.fmt(cap) + '</span>' : ''}</span>
    </div>`;
  },

  renderResources() {
    const st = this.state;
    const maxD = this.maxDepth();
    const ore = this.G('currentOre') || {};
    const rare = this.G('rareDrops') || {};

    // 主货币（灵气）与灵材（仅显示已拥有的，随挖取逐步出现）
    const matKeys = ['lm_scrap','lm_resin','lm_granite','lm_salt','lm_coal','lm_sulfur','lm_niter','lm_obsidian','lm_deeprock','lm_glowshard'];
    let mats = '';
    matKeys.forEach(k => {
      const def = CUR.defs[k];
      if (!def || this.curVal(k) <= 0) return;
      const col = 'c-' + def.color;
      let cap = 0; try { const c = CUR.cap(k); if (isFinite(c) && c > 0) cap = c; } catch (e) {}
      mats += this.resLine(GB_ICON.icon(def.icon||'mdi-chart-bubble',16,col), this.curName(k), this.curVal(k), cap);
    });

    // 当前层灵矿 chips（已采集量，带容量进度）
    let oreLines = '';
    for (const key in ore) {
      const el = ore[key];
      if (el && el.minDepth != null && el.minDepth > maxD) continue;
      const def = CUR.defs['lm_' + key];
      const col = def ? ('c-' + def.color) : 'c-grey';
      let cap = 0; try { const c = CUR.cap('lm_' + key); if (isFinite(c) && c > 0) cap = c; } catch (e) {}
      oreLines += this.resLine(GB_ICON.icon(def&&def.icon?def.icon:'mdi-chart-bubble',14,col), this.curName('lm_' + key), this.curVal('lm_' + key), cap);
    }
    let rareLines = '';
    for (const key in rare) {
      const d = CUR.defs['lm_' + key];
      if (d && d.minDepth != null && d.minDepth > maxD) continue;
      const col = d ? ('c-' + d.color) : 'c-deep-purple';
      let cap = 0; try { const c = CUR.cap('lm_' + key); if (isFinite(c) && c > 0) cap = c; } catch (e) {}
      rareLines += this.resLine(GB_ICON.icon(d&&d.icon?d.icon:'mdi-cube',14,col), this.curName('lm_' + key), this.curVal('lm_' + key), cap);
    }

    let enhSection = '';
    const enhLevel = this.G('enhancementLevel') || 0;
    if (enhLevel > 0) {
      enhSection = `<div class="hstack mt8" style="gap:8px;">${GB_ICON.icon('mdi-package-up',18,'c-pink')}<button class="gb-btn small ${st.enhancementsActive?'error':'success'}" data-act="toggleEnh">${st.enhancementsActive?'停用附灵':'启用附灵'}</button><span class="dim">附灵 Lv.${enhLevel}</span></div>`;
    }

    return `<div>
      <div class="lm-side-title">${GB_ICON.icon('mdi-chart-bubble',15,'c-accent')}灵脉资源</div>
      ${mats ? `<div class="gb-card lm-res-card">${mats}</div>` : ''}
      ${oreLines || rareLines ? `<div class="feature-title">已采灵矿</div><div class="lm-res-card lm-res-sub">${oreLines}${rareLines}</div>` : '<div class="dim" style="font-size:12px;margin-top:4px;">尚未采集到灵矿，继续向下挖掘。</div>'}
      ${enhSection}
    </div>`;
  },

  /* ================= 场景层（聚焦中心） ================= */
  /* 按当前层数挑选应展示的灵矿档位（未解锁深度的矿不展示） */
  oreForDepth() {
    const st = this.state;
    const depth = st.depth;
    let best = null, bestMin = -1;
    for (const k in st.ingredient) {
      const el = st.ingredient[k];
      if (el && el.minDepth != null && el.minDepth <= depth && el.minDepth > bestMin) {
        bestMin = el.minDepth; best = k;
      }
    }
    return best || 'oreAluminium';
  },

  /* 大号灵矿 SVG（晶簇造型，颜色继承 ore def 的 color 类） */
  oreSvg(oreKey, size) {
    const def = CUR.defs['lm_' + oreKey];
    const col = def ? ('c-' + def.color) : 'c-grey';
    const s = size || 150;
    return `<svg class="${col}" viewBox="0 0 120 132" width="${s}" height="${s}" style="vertical-align:middle;">
      <g stroke="rgba(0,0,0,0.28)" stroke-width="1.5">
        <path d="M12 42 L60 8 L108 42 L60 68 Z" fill="currentColor" opacity="0.92"/>
        <path d="M12 42 L60 68 L60 8 L12 42 Z" fill="#000" opacity="0.16"/>
        <path d="M108 42 L60 68 L60 8 L108 42 Z" fill="#fff" opacity="0.26"/>
        <path d="M12 42 L60 68 L52 126 L30 64 Z" fill="currentColor" opacity="0.5"/>
        <path d="M108 42 L60 68 L68 126 L90 64 Z" fill="currentColor" opacity="0.78"/>
        <path d="M60 68 L52 126 L68 126 Z" fill="#000" opacity="0.14"/>
      </g>
      <path d="M12 42 L108 42" stroke="#fff" stroke-opacity="0.5" stroke-width="6" fill="none"/>
    </svg>`;
  },

  /* 环形炼化炉：7 座灵矿图周围分布，点击打开炼化面板 */
  renderForgeRing() {
    if (!this.unlocked('lmSmeltery') || this.subfeature !== 0) return '';
    const keys = ['aluminium','bronze','steel','titanium','shiny','iridium','darkIron'];
    const n = keys.length;
    let html = '<div class="lm-forge-ring">';
    keys.forEach((k, i) => {
      const a = (-90 + i * (360 / n)) * Math.PI / 180;
      const x = Math.max(10, Math.min(90, 50 + Math.cos(a) * 38));
      const y = Math.max(12, Math.min(88, 50 + Math.sin(a) * 32));
      const bar = 'lm_bar' + k.charAt(0).toUpperCase() + k.slice(1);
      const o = CUR.defs[bar];
      const col = o ? ('c-' + o.color) : 'c-grey';
      const hasBar = this.curVal(bar) > 0;
      html += `<div class="lm-forge ${hasBar?'':'locked'}" data-act="dialog:smelt:${k}" style="left:${x}%;top:${y}%;" data-tip="${this.curName(bar)}：点击打开${this.curName(bar)} 炼化炉。">
        <div class="lm-forge-ic ${col}">${GB_ICON.icon(o&&o.icon?o.icon:'mdi-gold',24)}</div>
        <span class="lm-forge-name">${this.curName(bar)}</span>
      </div>`;
    });
    return html + '</div>';
  },

  /* 场景主体：上[属性行+血条] + 中灵矿（可点击）+ 左矿锄（CSS 循环敲击） */
  renderScene() {
    const G = (n) => this.G(n);
    const st = this.state;
    const maxDur = G('currentDurability') || 1;
    const dur = Number(st.durability) || 0;
    const curPct = Math.max(0, Math.min(100, dur / maxDur * 100));
    // 缓动：本次渲染先以「上一帧宽度」插入，随后 rAF 过渡到目标宽度
    this._pendingDurPct = curPct;
    const shown = (this._prevDurPct != null) ? this._prevDurPct : curPct;

    const oreKey = this.oreForDepth();
    const def = CUR.defs['lm_' + oreKey];
    const col = def ? ('c-' + def.color) : 'c-grey';

    // 保护罩：没被击碎过的矿（currentBreaks === 0）有蓝色灵气光环
    const shielded = (G('currentBreaks') || 0) === 0;

    // 当前层属性行（韧性 / 灵气每小时收益 / 灵锄锋锐 / 破岩伤害 / 破层预估）
    const tough = G('currentToughness') || 0;
    const scrap = G('currentScrap') || 0;
    const pickPower = G('damage') || 0;
    const dmg = G('currentDamage') || 0;
    const hits = G('currentHitsNeeded');
    const hitsTxt = (hits === 0 || hits === Infinity || hits == null) ? '∞' : this.fmt(Math.ceil(hits));
    const sceneStats = `
      <div class="lm-scene-stats">
        <div class="lm-stat-item"><span class="lm-stat-ic" style="color:var(--clr-accent);">${GB_ICON.icon('mdi-shield',16)}</span><span class="lm-stat-label">韧性</span><span class="lm-stat-val accent">${this.fmt(tough)}</span></div>
        <div class="lm-stat-item"><span class="lm-stat-ic">${GB_ICON.icon('mdi-dots-triangle',16)}</span><span class="lm-stat-label">灵气/时</span><span class="lm-stat-val">${this.fmt(scrap)}</span></div>
        <div class="lm-stat-item"><span class="lm-stat-ic">${GB_ICON.icon('mdi-pickaxe',16)}</span><span class="lm-stat-label">灵锄锋锐</span><span class="lm-stat-val">${this.fmt(pickPower)}</span></div>
        <div class="lm-stat-item"><span class="lm-stat-ic" style="color:var(--clr-warning);">${GB_ICON.icon('mdi-sword',16)}</span><span class="lm-stat-label">破岩伤害</span><span class="lm-stat-val warn">${this.fmt(dmg)}</span></div>
        <div class="lm-stat-item"><span class="lm-stat-ic">${GB_ICON.icon('mdi-timer',16)}</span><span class="lm-stat-label">破层预估</span><span class="lm-stat-val">${hitsTxt}击</span></div>
      </div>`;

    return `<div class="lm-scene">
      ${this.renderForgeRing()}
      <div class="lm-scene-stage">
        <div class="lm-mine-rig">
          <div class="lm-pickaxe">${GB_ICON.icon('mdi-pickaxe', 86)}</div>
          ${sceneStats}
          <div class="lm-ore-hp gb-progress" data-tip="层岩余量：当前层剩余耐久，破尽后推进并获得收益。">
            <div class="bar" id="lm-ore-hp-fill" style="width:${shown}%;"></div>
            <div class="bar-label balloon-d css-shadow-2" id="lm-ore-hp-label">${this.fmt(Math.max(0,dur))} / ${this.fmt(maxDur)}</div>
          </div>
          <div class="lm-ore ${col}${shielded ? ' shielded' : ''}" id="lm-ore" onclick="GB_LM_VIEW.doHit()" data-tip="${this.curName('lm_'+oreKey)}：点击矿脉，算作一次挖掘。">
            ${this.oreSvg(oreKey, 150)}
            <span class="lm-ore-name" style="display:block;text-align:center;margin-top:2px;">${this.curName('lm_'+oreKey)} · ${st.depth}层</span>
          </div>
        </div>
      </div>
    </div>`;
  },

  /* 血条缓动 + 矿锄对齐 + 自动挖矿特效检测
   * tick 每秒改 durability/depth 后会调 render，这里检测变化量来触发对应的 hitfx/shatter。
   * 区分：小变化（<200）= 在线自动挖矿，播特效；大变化 = 离线批量推进，静默不播。
   */
  _easeHp() {
    const self = this;
    const fill = document.getElementById('lm-ore-hp-fill');
    if (fill && this._pendingDurPct != null) {
      const target = this._pendingDurPct;
      this._prevDurPct = target;
      requestAnimationFrame(() => {
        const f = document.getElementById('lm-ore-hp-fill');
        if (f) f.style.width = target + '%';
        self._alignPickaxeToOre();
        self._detectAutoHitFx();
      });
    }
  },

  /* 自动挖矿特效：检测 tick 引起的 durability/depth 变化，触发 UI 反馈 */
  _detectAutoHitFx() {
    const st = this.state;
    const nowDur = Number(st.durability) || 0;
    const nowDepth = Number(st.depth) || 0;

    // 首次 render → 初始化追踪值，不播特效
    if (this._trackDur == null) {
      this._trackDur = nowDur;
      this._trackDepth = nowDepth;
      this._trackBreaks = this.G('currentBreaks') || 0;
      return;
    }

    // 正在手动处理破尽 → 跳过（doHit 里自己会调特效）
    if (this._breaking) {
      this._trackDur = nowDur;
      this._trackDepth = nowDepth;
      this._trackBreaks = this.G('currentBreaks') || 0;
      return;
    }

    const depthDelta = nowDepth - this._trackDepth;
    const durDelta = this._trackDur - nowDur; // 正数 = 扣耐
    const maxDur = this.G('currentDurability') || 1;
    const breaks = this.G('currentBreaks') || 0;
    const breaksDelta = breaks - (this._trackBreaks || 0);

    // --- 先判断是不是「破尽事件」 ---
    // 关键洞察：tick 只会让 dur 减少，三种异常跳变 = 破尽
    //   A. nowDur > trackDur（dur 增加了 = tick 重置回满）
    //   B. nowDur === 0 且之前有 dur（卡层破尽）
    //   C. depth 变大了（推进的前提是破尽旧层）
    const brokeRefill = durDelta < 0;           // dur 增加了（tick 重置）
    const brokeStuck = nowDur === 0 && durDelta > 0;
    const brokeAdvance = depthDelta > 0;        // depth 推进
    const broke = brokeRefill || brokeStuck || brokeAdvance || breaksDelta > 0;

    // isOnline：broke 场景可能有大 dur 跳变（tick 瞬间破尽），只看 depth 是否合理
    const isOnline = broke
      ? (Math.abs(depthDelta) <= 5)
      : (Math.abs(durDelta) <= 200 && Math.abs(depthDelta) <= 5);

    if (broke && isOnline) {
      // --- 所有破尽先播一下「最后一击的 hitfx」（矿锄挥一次 + 火花 + 飘字） ---
      this._playHitFx();
      const ore = document.getElementById('lm-ore');
      if (ore) { ore.classList.remove('hit'); void ore.offsetWidth; ore.classList.add('hit'); }

      // --- 血条：破尽瞬间手动让它降到 0%（tick 可能跳过中间 0 的瞬间） ---
      const fill = document.getElementById('lm-ore-hp-fill');
      if (fill) { fill.style.width = '0%'; this._prevDurPct = 0; }

      // --- breakFx（碎片爆炸）只在「同层破尽」时播 ---
      // depth 推进 = 往下挖了一层，不该播"旧矿碎了"的爆炸动画
      const sameLevelBreak = depthDelta === 0;
      if (sameLevelBreak) {
        this._playBreakFx();
        const self = this;
        setTimeout(() => {
          self.render();
          self._playNewOreIn();
        }, 720);
      } else {
        // depth 推进：淡入新矿（不破不立，直接切）
        const self = this;
        setTimeout(() => {
          self.render();
          self._playNewOreIn();
        }, 300);
      }

      this._trackDepth = nowDepth;
      this._trackDur = nowDur;
      this._trackBreaks = breaks;
      return;
    }

    // --- 普通自动挖矿：dur 扣了但没破（hitfx 由独立循环驱动，这里只更新追踪值） ---
    // 不再在这里调 hitfx——_playAutoMineHit 每秒独立驱动，和 tick 同步

    this._trackDepth = nowDepth;
    this._trackDur = nowDur;
    this._trackBreaks = breaks;
  },

  /* 破尽特效：旧矿石淡出 + Canvas 碎片爆炸 + 矿锄收刀 */
  _playBreakFx() {
    const ore = document.getElementById('lm-ore');
    const pick = document.querySelector('.lm-pickaxe');
    // 旧矿石淡出并缩小
    if (ore) {
      ore.style.transition = 'opacity 280ms ease, transform 280ms ease';
      ore.style.opacity = '0';
      ore.style.transform = 'scale(0.88)';
    }
    // 矿锄也收一下（跟矿石一起消失，新矿出来再出现）
    if (pick) {
      pick.style.transition = 'opacity 280ms ease';
      pick.style.opacity = '0';
    }
    // Canvas 碎片爆炸
    this._playShatter();
  },

  /* 新矿石淡入（破尽后推进层数完成时调用） */
  _playNewOreIn() {
    const self = this;
    requestAnimationFrame(() => {
      const newOre = document.getElementById('lm-ore');
      const pick = document.querySelector('.lm-pickaxe');
      if (newOre) {
        newOre.style.opacity = '0';
        newOre.style.transform = 'scale(1.08)';
        requestAnimationFrame(() => {
          newOre.style.transition = 'opacity 360ms ease, transform 360ms cubic-bezier(.18,1.35,.42,1)';
          newOre.style.opacity = '';
          newOre.style.transform = '';
        });
      }
      if (pick) {
        pick.style.opacity = '0';
        requestAnimationFrame(() => {
          pick.style.transition = 'opacity 260ms ease';
          pick.style.opacity = '';
          self._alignPickaxeToOre();
        });
      }
      self._alignPickaxeToOre();
    });
  },

  /* 矿锄对齐矿石：让矿锄摆在矿石左上侧、锤头对准矿石顶部 */
  _alignPickaxeToOre() {
    const rig = document.querySelector('.lm-mine-rig');
    const ore = document.getElementById('lm-ore');
    const pick = document.querySelector('.lm-pickaxe');
    if (!rig || !ore || !pick) return;

    const pickW = pick.offsetWidth;
    const pickH = pick.offsetHeight;

    // ore.offsetLeft/Top 是相对 rig 的（因为 ore 是 rig 的 flex 子元素）
    const oreX = ore.offsetLeft;
    const oreY = ore.offsetTop;
    const oreW = ore.offsetWidth;
    const oreH = ore.offsetHeight;

    // 矿锄目标：矿锄中心落在矿石左侧约 25% 位置，矿锄顶部比矿石顶部高一点
    const targetCx = oreX + oreW * 0.15;     // 矿锄中心 x：矿石左内 15% 处
    const targetCy = oreY - pickH * 0.25 + pickH; // 矿锄中心 y：往下移一个矿锄身位

    const left = targetCx - pickW / 2;
    const top = targetCy - pickH / 2;

    pick.style.left = left + 'px';
    pick.style.top = top + 'px';

    // 旋转中心：矿锄内部偏右下（柄尾位置），旋转时锤头（左上）砸向矿石
    pick.style.transformOrigin = `${pickW * 0.58}px ${pickH * 0.82}px`;
  },

  /* 每次点击挖矿的即时特效：矿锄单次挥 + 火花粒子 + 伤害数字飘出 */
  _playHitFx() {
    const ore = document.getElementById('lm-ore');
    if (!ore) return;
    const oreR = ore.getBoundingClientRect();
    const cx = oreR.left + oreR.width * 0.28; // 砸在矿石左侧
    const cy = oreR.top + oreR.height * 0.22;

    // 1. 矿锄单次挥（CSS 类控制，覆盖 infinite 的循环）
    const pick = document.querySelector('.lm-pickaxe');
    if (pick) {
      pick.classList.remove('swing-once');
      void pick.offsetWidth;
      pick.classList.add('swing-once');
    }

    // 2. Canvas 火花 + 伤害数字
    this._killHitFx();
    const cv = document.createElement('canvas');
    cv.id = 'lm-hitfx-canvas';
    cv.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:999998;';
    document.body.appendChild(cv);
    const dpr = window.devicePixelRatio || 1;
    cv.width = Math.ceil(window.innerWidth * dpr);
    cv.height = Math.ceil(window.innerHeight * dpr);
    cv.style.width = window.innerWidth + 'px';
    cv.style.height = window.innerHeight + 'px';
    const ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);

    // 火花粒子（小而快，橙红色）
    const sparks = [];
    for (let i = 0; i < 14; i++) {
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.4; // 主要向上
      const sp = 0.3 + Math.random() * 0.5;
      sparks.push({
        x: 0, y: 0, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
        life: 0, r: 1 + Math.random() * 2,
        hue: 18 + Math.random() * 22, // 橙红到黄
      });
    }

    // 伤害数字（飘字 + 淡出）
    const dmg = Math.floor(this.G('currentDamage') || 0);
    const dmgText = dmg > 0 ? '-' + dmg : 'miss';
    const dmgColor = dmg > 0 ? '#FFC107' : '#999';
    const dmgLife = 0;
    const dmgMax = 700;

    const self = this;
    let lastT = performance.now();
    const step = (now) => {
      const dt = Math.min(40, now - lastT); lastT = now;
      ctx.clearRect(0, 0, cv.width, cv.height);

      let alive = false;
      for (const s of sparks) {
        s.life += dt;
        if (s.life > 450) continue;
        alive = true;
        s.vy += 0.0008 * dt; // 轻重力
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        const alpha = Math.max(0, 1 - s.life / 450);
        ctx.beginPath();
        ctx.fillStyle = `hsla(${s.hue}, 95%, 65%, ${alpha})`;
        ctx.arc(cx + s.x, cy + s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 伤害数字飘字
      const dLife = (now - self._hitFxStart || 0);
      if (dLife < dmgMax) {
        alive = true;
        const alpha = Math.max(0, 1 - dLife / dmgMax);
        const yOff = -dLife * 0.05; // 向上飘
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = dmgColor;
        ctx.font = 'bold 16px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = 3;
        ctx.strokeText(dmgText, cx, cy + yOff);
        ctx.fillText(dmgText, cx, cy + yOff);
        ctx.restore();
      }

      if (alive) { requestAnimationFrame(step); }
      else { cv.remove(); self._hitFxCanvas = null; }
    };
    self._hitFxStart = performance.now();
    requestAnimationFrame(step);
  },
  _killHitFx() {
    const cv = document.getElementById('lm-hitfx-canvas');
    if (cv) cv.remove();
  },

  /* =========================================================
   * Canvas 2D 矿石碎裂引擎
   * ---------------------------------------------------------
   * 在矿石位置铺一张绝对定位的覆盖 Canvas，把一个圆形按放射+扰动切出
   * 若干不规则三角块，各片按自身速度/旋转/重力飞出并淡出，
   * 全部阵亡后 Canvas 自动移除。零依赖、独立 rAF、与 render() 互不干扰。
   *
   * 可调参数（都集中在本方法开头）：
   *   shardCount   碎片数量（越多越炸裂）
   *   lifetime     单块最大存活毫秒
   *   scatterPow   向外散射的初速度强度
   *   gravity      下落加速度（像素/ms²）
   *   spinPow      旋转角速度范围（弧度/帧）
   *   sparkCount   额外爆发的火星粒子数
   * ========================================================= */
  _playShatter() {
    const ore = document.getElementById('lm-ore');
    if (!ore) return;
    const rect = ore.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const R = Math.max(48, Math.min(rect.width, rect.height) * 0.55);

    // 取真实渲染色（CSS 变量已经是具体色值）
    const color = (() => {
      try {
        const cs = getComputedStyle(ore);
        const c = cs.color || '#9ec6ff';
        return this._hexFromRgb(c);
      } catch (e) { return '#9ec6ff'; }
    })();

    // 结束掉上一次可能还在跑的覆盖层
    this._killShatter();

    const cv = document.createElement('canvas');
    cv.id = 'lm-shatter-canvas';
    cv.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:999999;';
    document.body.appendChild(cv);
    const dpr = window.devicePixelRatio || 1;
    cv.width = Math.ceil(window.innerWidth * dpr);
    cv.height = Math.ceil(window.innerHeight * dpr);
    cv.style.width = window.innerWidth + 'px';
    cv.style.height = window.innerHeight + 'px';
    const ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);

    // --- 可调参数 ---
    const shardCount = 28;
    const lifetime = 1100;          // 毫秒
    const scatterPow = 0.38;        // 初速度强度（像素/ms）
    const gravity = 0.0006;         // 轻微下坠
    const spinPow = 0.045;          // 弧度/帧
    const sparkCount = 16;

    // --- 生成放射切分的顶点：环形 + 随机扰动 ---
    const rings = 3;                // 切几层
    const slicesPerRing = 10;       // 每层多少个放射角
    const pts = [];                 // [{x,y,r}] 相对矿石中心
    for (let r = R * 0.35; r <= R; r += (R - R * 0.35) / (rings - 1)) {
      for (let i = 0; i < slicesPerRing; i++) {
        const ang = (i + Math.random() * 0.35) / slicesPerRing * Math.PI * 2;
        const rr = r * (0.78 + Math.random() * 0.48);
        pts.push({ x: Math.cos(ang) * rr, y: Math.sin(ang) * rr });
      }
    }
    pts.push({ x: 0, y: 0 }); // 中心

    // --- 组装碎片：每个中心+相邻两环点形成三角 ---
    // 只生成前 rings-1 环（最外环节点 next 会越界）
    const shards = [];
    const totalRingNodes = rings * slicesPerRing;
    for (let ring = 0; ring < rings - 1; ring++) {
      const base = ring * slicesPerRing;
      const next = (ring + 1) * slicesPerRing;
      for (let i = 0; i < slicesPerRing; i++) {
        const i2 = (i + 1) % slicesPerRing;
        const a1 = pts[base + i];
        const a2 = pts[base + i2];
        const b1 = pts[next + i];
        const b2 = pts[next + i2];
        const center = pts[totalRingNodes]; // 最后一个 push 的中心点
        const tri = [a1, a2, b1, b2, center];
        // 从 5 点中选 3 个构成一个偏角三角形
        const p1 = tri[Math.floor(Math.random() * tri.length)];
        let p2 = tri[Math.floor(Math.random() * tri.length)]; while (p2 === p1) p2 = tri[Math.floor(Math.random() * tri.length)];
        let p3 = tri[Math.floor(Math.random() * tri.length)]; while (p3 === p1 || p3 === p2) p3 = tri[Math.floor(Math.random() * tri.length)];

        // 碎片中心（用于散射方向）
        const pcx = (p1.x + p2.x + p3.x) / 3;
        const pcy = (p1.y + p2.y + p3.y) / 3;
        const angOut = Math.atan2(pcy, pcx);
        const sp = scatterPow * (0.55 + Math.random() * 1.0);

        // 颜色在底色上微扰，让碎片看起来不一色
        const fill = this._colorShift(color, (Math.random() - 0.5) * 30);

        shards.push({
          pts: [p1, p2, p3],
          vx: Math.cos(angOut) * sp + (Math.random() - 0.5) * 0.12,
          vy: Math.sin(angOut) * sp - 0.12,  // 向上轻弹
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * spinPow * 2,
          life: 0,
          fill,
        });
      }
    }

    // --- 外加火星粒子（点状亮色，小尺寸、快速闪灭） ---
    const sparks = [];
    for (let i = 0; i < sparkCount; i++) {
      const ang = Math.random() * Math.PI * 2;
      const sp = scatterPow * (0.9 + Math.random() * 1.4);
      sparks.push({
        x: 0, y: 0,
        vx: Math.cos(ang) * sp * 1.1,
        vy: Math.sin(ang) * sp * 1.1 - 0.18,
        life: 0,
        r: 1.2 + Math.random() * 2.2,
        hueShift: Math.random() * 60 - 20,  // 橙→红→黄
      });
    }

    const started = performance.now();
    let lastT = started;
    const drawList = [];
    shards.forEach(s => drawList.push({ t: s, kind: 'shard' }));
    sparks.forEach(s => drawList.push({ t: s, kind: 'spark' }));

    const self = this;
    let afId;
    const step = (now) => {
      const dt = Math.min(40, now - lastT); lastT = now;
      const age = now - started;
      ctx.clearRect(0, 0, cv.width, cv.height);

      let alive = 0;
      for (const d of drawList) {
        const o = d.t;
        o.life += dt;
        if (o.life > lifetime) continue;
        alive++;

        // 运动（用 dt 缩放让不同屏刷一致）
        o.x === undefined && (o.x = 0, o.y = 0);
        o.vy += gravity * dt;
        o.x += o.vx * dt;
        o.y += o.vy * dt;

        const alpha = Math.max(0, 1 - o.life / lifetime);

        if (d.kind === 'spark') {
          const hsl = self._hexToHsl(color);
          ctx.beginPath();
          ctx.fillStyle = `hsla(${(hsl.h + o.hueShift + 360) % 360}, ${Math.min(95, hsl.s + 15)}%, ${Math.min(70, hsl.l + 20)}%, ${alpha})`;
          ctx.arc(cx + o.x, cy + o.y, o.r, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }

        // 三角形碎片
        ctx.save();
        ctx.translate(cx + o.x, cy + o.y);
        o.rot += o.vr * (dt / 16);
        ctx.rotate(o.rot);
        // 碎片轻微阴影（只有早期生命期，避免一片脏）
        if (o.life < lifetime * 0.5) {
          ctx.shadowColor = `rgba(0,0,0,${0.22 * alpha})`;
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 2;
        }
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(o.pts[0].x, o.pts[0].y);
        ctx.lineTo(o.pts[1].x, o.pts[1].y);
        ctx.lineTo(o.pts[2].x, o.pts[2].y);
        ctx.closePath();
        ctx.fillStyle = o.fill;
        ctx.fill();
        // 一道亮边，模拟断面反光
        ctx.strokeStyle = `rgba(255,255,255,${0.35 * alpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      }

      if (alive > 0) {
        afId = requestAnimationFrame(step);
      } else {
        cv.remove();
        self._shatterCanvas = null;
      }
    };
    this._shatterCanvas = cv;
    this._shatterAf = (id) => id && cancelAnimationFrame(id);
    afId = requestAnimationFrame(step);
  },

  _killShatter() {
    const cv = document.getElementById('lm-shatter-canvas');
    if (cv) cv.remove();
    this._shatterCanvas = null;
  },

  _hexFromRgb(c) {
    if (!c) return '#9ec6ff';
    if (c.charAt(0) === '#') return c;
    const m = String(c).match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
    if (!m) return '#9ec6ff';
    const h = (n) => { const s = parseInt(n).toString(16); return s.length === 1 ? '0' + s : s; };
    return '#' + h(m[1]) + h(m[2]) + h(m[3]);
  },

  _colorShift(hex, deltaLight) {
    const { h, s, l } = this._hexToHsl(hex);
    const nl = Math.max(0, Math.min(100, l + deltaLight));
    return `hsl(${h},${s}%,${nl}%)`;
  },

  _hexToHsl(hex) {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16) / 255;
    const g = parseInt(h.substring(2, 4), 16) / 255;
    const b = parseInt(h.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let hh = 0, ss = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      ss = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: hh = (g - b) / d + (g < b ? 6 : 0); break;
        case g: hh = (b - r) / d + 2; break;
        case b: hh = (r - g) / d + 4; break;
      }
      hh *= 60;
    }
    return { h: hh, s: Math.round(ss * 100), l: Math.round(l * 100) };
  },

  /* 挖矿（点击触发，自动挖矿走同一条数值链路，特效由 tick 变化检测触发） */
  doHit() {
    const ore = document.getElementById('lm-ore');
    if (ore) { ore.classList.remove('hit'); void ore.offsetWidth; ore.classList.add('hit'); }
    // UI 特效：矿锄单次挥 + 火花 + 伤害飘字
    this._playHitFx();

    const st = this.state;
    const dmg = this.G('currentDamage') || 0;
    const self = this;
    if (!(dmg > 0)) return;
    const nd = Math.max(0, (Number(st.durability) || 0) - dmg);

    if (nd > 0) {
      // 普通一击：直接扣耐，同步追踪值避免 _detectAutoHitFx 重复触发
      st.durability = nd;
      this._trackDur = nd;
      GB_APP.persist();
      clearTimeout(self._hitTimer);
      self._hitTimer = setTimeout(() => self.render(), 260);
      return;
    }

    // ---- 破尽 ----
    this._playBreakFx();
    st.durability = 0;
    this._breaking = true;
    GB_APP.persist();
    clearTimeout(self._hitTimer);
    // 等碎裂动画展示大半后再推进层数、让新矿重新出现
    self._hitTimer = setTimeout(() => {
      const maxDepth = Math.max(1, Number(STAT.get('lm_maxDepth' + self.subfeature)) || 1);
      if (st.depth < maxDepth) st.depth++;
      st.durability = self.G('currentDurability') || 0;
      this._breaking = false;
      // 同步追踪值，避免自动挖矿检测把新矿当成 tick 变化再播一次 breakFx
      self._trackDepth = st.depth;
      self._trackDur = st.durability;
      GB_APP.persist();
      self.render();
      self._playNewOreIn();
    }, 720);
    this.render(); // 立即 render：血条从旧值缓动到 0
  },

  /* ================= 弹层（铸造 / 炼化 / 附灵 / 轮回） ================= */
  openDialog(kind) { this._dialog = String(kind).split(':')[0]; this._renderDialog(); },
  closeDialog() {
    this._dialog = null;
    const o = document.getElementById('lm-dialog-overlay');
    if (o) o.remove();
  },
  _renderDialog() {
    const self = this;
    let old = document.getElementById('lm-dialog-overlay');
    if (old) old.remove();
    const ov = document.createElement('div');
    ov.id = 'lm-dialog-overlay';
    ov.className = 'overlay';
    ov.style.cssText = 'display:flex;align-items:center;justify-content:center;z-index:50;';
    const titles = { craft: '灵锄铸造', smelt: '炼化炉', enh: '附灵台', prestige: '渡劫轮回' };
    ov.innerHTML = `<div class="modal lm-dialog">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <span style="font-size:16px;font-weight:600;">${titles[this._dialog] || ''}</span>
        <button class="gb-btn icon" data-dlg-close>${GB_ICON.icon('mdi-close',20)}</button>
      </div>
      <div class="lm-dialog-body">${this._dialogBody(this._dialog)}</div>
    </div>`;
    document.body.appendChild(ov);
    ov.addEventListener('click', (e) => {
      const close = e.target.closest('[data-dlg-close]');
      if (close) { self.closeDialog(); return; }
      const buy = e.target.closest('[data-buy]');
      if (buy) { try { LM_RT.buyUpgrade(buy.getAttribute('data-buy')); } catch (err) {} GB_APP.persist(); self.render(); self._renderDialog(); return; }
      const buyMax = e.target.closest('[data-buy-max]');
      if (buyMax) { try { LM_RT.buyUpgradeMax(buyMax.getAttribute('data-buy-max')); } catch (err) {} GB_APP.persist(); self.render(); self._renderDialog(); return; }
      const toggle = e.target.closest('[data-toggle-collapse]');
      if (toggle) { self._collapseMap[toggle.getAttribute('data-toggle-collapse')] = !self._collapseMap[toggle.getAttribute('data-toggle-collapse')]; self._renderDialog(); return; }
      const act = e.target.closest('[data-act]');
      if (act) self.handleAction(act.getAttribute('data-act'));
    });
  },
  /* 弹层内容：复用既有构建逻辑 */
  _dialogBody(kind) {
    const G = (n) => this.G(n);
    const st = this.state;
    if (kind === 'prestige') {
      const best = STAT.get('lm_bestPrestige0') || STAT.get('lm_bestPrestige1') || 0;
      const prefixCount = STAT.get('lm_prestigeCount') || 0;
      const dwellerLimit = G('dwellerLimit') || 0;
      return `<div class="lm-prestige">
        <div class="gb-card">
          <div class="stat-tile"><span class="dim">道行纪录</span><span class="right stat-value">${this.maxDepth()}</span></div>
          <div class="stat-tile"><span class="dim">最佳飞升</span><span class="right stat-value">${this.fmt(best)}</span></div>
          <div class="stat-tile"><span class="dim">飞升次数</span><span class="right stat-value">${prefixCount}</span></div>
          <div class="stat-tile"><span class="dim">驻脉上限</span><span class="right stat-value">${this.fmt(dwellerLimit)}</span></div>
          <div class="center-flex" style="margin-top:12px;">
            <button class="lm-rebirth-btn" data-act="prestige" data-tip="渡劫飞升：重置普通进度，换取飞升收益与轮回秘法。">${GB_ICON.icon('mdi-ghost',20)}${this.T('prestige','飞升')}</button>
          </div>
          <div class="dim" style="font-size:11px;margin-top:8px;text-align:center;">上方大按钮执行轮回，下方为可参悟的轮回秘法。</div>
        </div>
        <div class="gb-card min-h0 lm-upg-region">${this.renderUpgradesGrid('prestige')}</div>
      </div>`;
    }
    if (kind === 'smelt') {
      const bars = Object.keys(st.smeltery || {});
      return bars.map(name => {
        const def = CUR.defs['lm_' + name];
        const col = def ? 'c-' + def.color : 'c-grey';
        return `<div class="hstack" style="justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--divider);">
          <span class="${col}">${GB_ICON.icon(def&&def.icon?def.icon:'mdi-gold',14)}${this.curName('lm_' + name)}</span>
          <button class="gb-btn small primary" data-act="smelt:${name}">提炼</button>
        </div>`;
      }).join('') || '<div class="dim">暂无可炼化的灵材。</div>';
    }
    if (kind === 'craft') {
      const stats = G('pickaxeStats') || { quality: 0, purity: 0, baseQuality: 0, cleanse: 0, impurity: 0, alloying: 1 };
      const canAfford = G('pickaxeCanAfford');
      const list = st.ingredientList || [];
      return `<div class="gb-card">
        <div class="hwrap">
          ${Object.keys(st.ingredient || {}).filter(k => (st.ingredient[k] || 0) > 0).map(k => {
            const def = CUR.defs['lm_' + k];
            const col = def ? 'c-' + def.color : 'c-grey';
            return `<span class="gb-chip clickable ${col}" data-act="addIng:${k}" data-tip="加入 ${this.curName('lm_'+k)} 以铸造。">${GB_ICON.icon(def&&def.icon?def.icon:'mdi-chart-bubble',13)}${this.curName('lm_'+k)}</span>`;
          }).join('')}
        </div>
        <div class="hstack mt8" style="flex-wrap:wrap;">
          ${list.map((ing, i) => `<div class="stat-tile" style="position:relative;padding:8px;" data-tip="点击移除该灵材。"><button class="gb-btn icon" style="width:24px;height:24px;" data-act="rmIng:${i}">${GB_ICON.icon('mdi-close',14)}</button>${this.curName('lm_' + ing)}</div>`).join('') || '<span class="dim" style="font-size:12px;">选择灵材来铸造灵锄</span>'}
        </div>
        <div class="hstack mt8" style="justify-content:space-between;">
          <div><span class="c-red" style="font-weight:600;">${this.fmt(stats.quality)}</span><span class="dim" style="font-size:12px;">&nbsp;✦ 卓越</span><span class="dim" style="font-size:12px;"> 纯度 ${(stats.purity*100).toFixed(1)}%</span></div>
          <button class="gb-btn ${stats.purity>=0.001? 'success':'error'}" ${list.length===0||!canAfford?'disabled':''} data-act="craft">${GB_ICON.icon('mdi-hammer',16)}铸造 · ${this.fmt(stats.quality)}</button>
        </div>
      </div>`;
    }
    // enh
    const enhIng = st.enhancementIngredient;
    const enhMax = G('enhancementLevel') || 0;
    const enhBars = G('enhancementBarsNeeded') || 0;
    return `<div class="gb-card">
      <div class="hwrap">
        ${Object.keys(st.enhancement || {}).map(k => {
          const def = CUR.defs['lm_' + k];
          const col = def ? 'c-' + def.color : 'c-pink';
          return `<span class="gb-chip clickable ${col}" data-act="selectEnh:${k}" data-tip="选择以附灵提升。">${GB_ICON.icon(def&&def.icon?def.icon:'mdi-chart-bubble',13)}${this.curName('lm_'+k)}</span>`;
        }).join('')}
      </div>
      ${enhIng ? `<div class="hstack mt8" style="justify-content:space-between;"><span class="dim">${this.curName('lm_' + enhIng)} ×${this.fmt(enhBars)}</span><button class="gb-btn primary" data-act="enhance">${this.T('enhancement', '附灵')}</button></div>` : '<div class="dim" style="font-size:12px;margin-top:6px;">选择一项附灵以提升法器。</div>'}
      <div class="dim" style="font-size:12px;margin-top:6px;">当前附灵等级：${enhMax}</div>
    </div>`;
  },
  /* 升级列表（拆出 body，供弹层调用） */
  renderUpgradesInner(type) {
    const isPrestige = type === 'prestige';
    let ids = [];
    try {
      ids = Object.keys(UPG.defs).filter(id => {
        const t = UPG.defs[id].type || 'regular';
        if (isPrestige) return t === 'prestige';
        return t === 'regular';
      }).filter(id => { try { return UPG.isVisible(id) && !UPG.isMaxed(id); } catch (e) { return false; } });
    } catch (e) {}
    ids.sort((a, b) => {
      const ca = UPG.canAfford(a) ? 0 : 1, cb = UPG.canAfford(b) ? 0 : 1;
      if (ca !== cb) return ca - cb;
      return this.priceSum(a) - this.priceSum(b);
    });
    const title = isPrestige ? '轮回秘法' : '秘法升级';
    const list = ids.slice(0, 40).map(id => this.renderUpgCard(id)).join('');
    return `<div class="feature-title">${title}</div><div class="scroll-container-tab">${list || '<div class="empty-hint">暂无可参悟的秘法。</div>'}</div>`;
  },

  /* ---------- 轮回秘法 grid（弹层专用：一行5格，预设3行高可滚动） ---------- */
  renderUpgradesGrid(type) {
    const isPrestige = type === 'prestige';
    let ids = [];
    try {
      ids = Object.keys(UPG.defs).filter(id => {
        const t = UPG.defs[id].type || 'regular';
        return isPrestige ? t === 'prestige' : t === 'regular';
      }).filter(id => { try { return UPG.isVisible(id) && !UPG.isMaxed(id); } catch (e) { return false; } });
    } catch (e) {}
    ids.sort((a, b) => {
      const ca = UPG.canAfford(a) ? 0 : 1, cb = UPG.canAfford(b) ? 0 : 1;
      if (ca !== cb) return ca - cb;
      return this.priceSum(a) - this.priceSum(b);
    });
    const cells = ids.slice(0, 40).map(id => this.renderUpgGridCell(id)).join('');
    return `<div class="feature-title">轮回秘法</div>
      <div class="lm-upg-grid-scroll">
        <div class="lm-upg-grid">${cells || '<div class="empty-hint" style="grid-column:1/-1;">暂无可参悟的秘法。</div>'}</div>
      </div>`;
  },

  /* 单个秘法紧凑格 */
  renderUpgGridCell(id) {
    const lvl = UPG.levels[id] || 0;
    const cap = UPG.cap(id);
    const def = UPG.defs[id] || {};
    const canBuy = UPG.canAfford(id) && !UPG.isMaxed(id);
    const isMax = UPG.isMaxed(id);
    const icon = def.icon || 'mdi-magic-staff';
    const name = this.upgName(id);
    // 价格文本
    let price = {}; try { price = UPG.price(id) || {}; } catch (e) {}
    const priceTxt = Object.keys(price).map(k => {
      const d = CUR.defs[k]; const col = d ? 'c-' + d.color : '';
      return `<span class="${col}">${this.fmt(price[k])}</span>`;
    }).join('+') || '<span class="dim">免费</span>';
    // 下一级效果简述
    let effTxt = '';
    try {
      const rows = (def.effect || []).reduce((arr, eff) => arr.concat(this.effectCompareRows(eff, lvl)), []);
      effTxt = rows.length ? rows[0].label : '';
    } catch (e) {}
    return `<button class="lm-upg-cell ${canBuy?'can':''} ${isMax?'maxed':''}" data-buy="${id}" ${canBuy?'':'disabled'} data-tip="${name}">
      <span class="lm-upg-cell-ic ${canBuy?'':'locked'}">${canBuy ? GB_ICON.icon(icon, 20, 'c-accent') : GB_ICON.icon(icon, 20, 'c-dim')}</span>
      <span class="lm-upg-cell-name">${name}</span>
      <span class="lm-upg-cell-price">${priceTxt}</span>
      <span class="lm-upg-cell-lvl">${GB_ICON.icon('mdi-chevron-double-up', 11)}${lvl}${isFinite(cap)?'/'+cap:''}</span>
      ${effTxt ? `<span class="lm-upg-cell-eff">${effTxt}</span>` : ''}
    </button>`;
  },

  /* ---------- 秘法升级列表 ---------- */
  renderUpgrades(type) {
    const isPrestige = type === 'prestige';
    let ids = [];
    try {
      ids = Object.keys(UPG.defs).filter(id => {
        const t = UPG.defs[id].type || 'regular';
        if (isPrestige) return t === 'prestige';
        // 非 prestige 列只显示 regular（premium 归 gem 模块消费，不在各 feature 主视图渲染）
        return t === 'regular';
      }).filter(id => {
        try { return UPG.isVisible(id) && !UPG.isMaxed(id); } catch (e) { return false; }
      });
    } catch (e) {}
    ids.sort((a, b) => {
      const ca = UPG.canAfford(a) ? 0 : 1, cb = UPG.canAfford(b) ? 0 : 1;
      if (ca !== cb) return ca - cb;
      return this.priceSum(a) - this.priceSum(b);
    });

    // ---- 顶部 requirement 提示条（从全部升级项里找下一个未解锁的）----
    let reqBar = '';
    const reqStats = isPrestige
      ? ['lm_depthDwellerCap0', 'lm_depthDwellerCap1']
      : ['lm_maxDepth' + this.subfeature];
    // 遍历同类型的全部升级项（不受可见/满级过滤）
    const allSameTypeIds = Object.keys(UPG.defs).filter(id => {
      const t = UPG.defs[id].type || 'regular';
      if (isPrestige) return t === 'prestige';
      return t === 'regular';
    });
    const reqChips = reqStats.map(statName => {
      const curVal = (LM_RT.lmState.stat[statName] && LM_RT.lmState.stat[statName].total) || 0;
      let nextId = null, nextVal = Infinity;
      allSameTypeIds.forEach(id => {
        const d = UPG.defs[id];
        if (d && d.requirementStat === statName && d.requirementValue !== undefined && curVal < d.requirementValue && d.requirementValue < nextVal) {
          nextId = id; nextVal = d.requirementValue;
        }
      });
      if (!nextId) return '';
      return `<span class="gb-chip req-chip" data-tip="下次解锁需 ${this.statName(statName.slice(3) || statName)} 达到 ${nextVal}（当前 ${Math.floor(curVal)}）。">
        ${GB_ICON.icon('mdi-chevron-double-up', 13)}下一个：${this.upgName(nextId)} · ${nextVal} ${this.statName(statName.slice(3))}</span>`;
    }).join('');
    if (reqChips) {
      reqBar = `<div class="upg-req-bar">${reqChips}</div>`;
    }

    // ---- 单个升级卡渲染 ----
    const list = ids.slice(0, 40).map(id => this.renderUpgCard(id)).join('');

    const title = isPrestige ? '飞升秘法' : '秘法升级';
    return `
      <div class="scroll-container-tab">
        <div class="feature-title">${title}</div>
        ${reqBar}
        ${list || '<div class="empty-hint">暂无可参悟的秘法，需提升道行。</div>'}
      </div>`;
  },

  /* ---------- 渲染单个升级卡（展开 / 折叠） ---------- */
  renderUpgCard(id) {
    const lvl = UPG.levels[id] || 0;
    const cap = UPG.cap(id);
    const def = UPG.defs[id] || {};
    const canBuy = UPG.canAfford(id) && !UPG.isMaxed(id);
    const maxCanAfford = UPG.maxAfford(id);
    const isMax = UPG.isMaxed(id);
    const collapsed = !!this._collapseMap[id];
    const icon = def.icon || 'mdi-magic-staff';
    const name = this.upgName(id);
    const tag = def.type === 'prestige' ? '<span class="gb-tag prestige">飞升</span>' : (def.premium ? '<span class="gb-tag gold">晶</span>' : '');
    const lockIcon = def.persistent ? '<span class="upg-lock" data-tip="飞升后保留">' + GB_ICON.icon('mdi-lock', 12) + '</span>' : '';

    // 价格信息
    let price = {}; try { price = UPG.price(id) || {}; } catch (e) {}
    const priceTxt = Object.keys(price).map(k => {
      const d = CUR.defs[k]; const col = d ? 'c-' + d.color : '';
      return `<span class="${col}">${this.curName(k)} ${this.fmt(price[k])}</span>`;
    }).join('<span class="dim" style="padding:0 2px;">+</span>') || '<span class="dim">免费</span>';

    // ---- 折叠态（一行紧凑） ----
    if (collapsed) {
      return `
        <div class="upg-card upg-collapsed ${canBuy?'can':''}">
          ${GB_ICON.icon(icon, 16, 'c-accent')}
          <span class="upg-collapsed-name">${name}${tag}</span>
          <span class="upg-level-chip">${GB_ICON.icon('mdi-chevron-double-up', 12)}${lvl}${isFinite(cap)?'/'+cap:''}</span>
          ${canBuy && maxCanAfford > 1 ? `<button class="gb-btn small primary upg-btn-max" data-buy-max="${id}" ${canBuy?'':'disabled'}>批量</button>` : ''}
          <button class="gb-btn small primary" data-buy="${id}" ${canBuy?'':'disabled'}>参悟</button>
          <span class="upg-collapsed-price" data-tip="${Object.keys(price).map(k=>this.curName(k)+' '+this.fmt(price[k])).join(' + ')||'免费'}">${priceTxt}</span>
          ${lockIcon}
          <button class="upg-toggle-btn" data-toggle-collapse="${id}" data-tip="展开">${GB_ICON.icon('mdi-chevron-up', 16)}</button>
        </div>`;
    }

    // ---- 展开态（完整卡片） ----
    // 效果对比行
    const compareRows = (def.effect || []).reduce((arr, eff) => {
      return arr.concat(this.effectCompareRows(eff, lvl));
    }, []);
    const compareHtml = compareRows.length ? compareRows.map(r => {
      if (r.isBool) {
        return `<div class="upg-effect-row">
          <span class="upg-effect-label">${r.label}</span>
          <span class="upg-effect-before">无</span>
          ${GB_ICON.icon('mdi-chevron-right', 14, 'c-dim')}
          <span class="upg-effect-after">${r.after}</span>
        </div>`;
      }
      return `<div class="upg-effect-row">
        <span class="upg-effect-label">${r.label}</span>
        <span class="upg-effect-before">${r.before}</span>
        ${GB_ICON.icon('mdi-chevron-right', 14, 'c-dim')}
        <span class="upg-effect-after">${r.after}</span>
      </div>`;
    }).join('') : '';

    return `
      <div class="upg-card upg-expanded ${canBuy?'can':''}">
        <button class="upg-toggle-btn top-right" data-toggle-collapse="${id}" data-tip="折叠">${GB_ICON.icon('mdi-chevron-up', 16)}</button>
        ${lockIcon}
        <div class="upg-header">
          <span class="upg-level-chip">${GB_ICON.icon('mdi-chevron-double-up', 12)}${lvl}${isFinite(cap)?'/'+cap:''}</span>
          <span class="upg-title">${GB_ICON.icon(icon, 18, 'c-accent')}${name}${tag}</span>
        </div>
        ${compareHtml ? `<div class="upg-effects">${compareHtml}</div>` : ''}
        <div class="upg-footer">
          <span class="upg-price">${priceTxt}</span>
          <button class="gb-btn primary" data-buy="${id}" ${canBuy?'':'disabled'}>参悟</button>
          ${canBuy && maxCanAfford > 1 ? `<button class="gb-btn primary upg-btn-max" data-buy-max="${id}" ${canBuy?'':'disabled'}>批量参悟 · ${maxCanAfford}</button>` : ''}
        </div>
      </div>`;
  },

  /* ================= 驻脉 / 飞升 tab ================= */
  renderDweller() {
    const G = (n) => this.G(n);
    const st = this.state;
    const best = STAT.get('lm_bestPrestige0') || STAT.get('lm_bestPrestige1') || 0;
    const prefixCount = STAT.get('lm_prestigeCount') || 0;
    const dwellerLimit = G('dwellerLimit') || 0;
    const dweller = STAT.get('lm_depthDweller0') || 0;

    const statusCol = `
      <div class="scroll-container-tab">
        <div class="feature-title">驻脉（飞升）</div>
        <div class="gb-card">
          <div class="stat-tile"><span class="dim">道行纪录</span><span class="right stat-value">${this.maxDepth()}</span></div>
          <div class="stat-tile"><span class="dim">最佳飞升</span><span class="right stat-value">${this.fmt(best)}</span></div>
          <div class="stat-tile"><span class="dim">飞升次数</span><span class="right stat-value">${prefixCount}</span></div>
          <div class="stat-tile"><span class="dim">驻脉修行</span><span class="right stat-value">${this.fmt(dweller)}</span></div>
          <div class="stat-tile"><span class="dim">驻脉上限</span><span class="right stat-value">${this.fmt(dwellerLimit)}</span></div>
          <div class="mt16 center-flex">
            <button class="gb-btn ${dwellerLimit>0?'success':'grey'}" data-act="prestige" data-tip="渡劫飞升：重置普通进度，以换取驻脉收益与飞升秘法。">
              ${GB_ICON.icon('mdi-ghost',16)}${this.T('prestige','飞升')}
            </button>
          </div>
        </div>
      </div>`;

    return `<div class="content-row">` + this.col(statusCol) + this.col(this.renderUpgrades('prestige')) + `</div>`;
  },

  /* ---------- 工具 ---------- */
  priceSum(id) {
    try { const p = UPG.price(id) || {}; return Object.keys(p).reduce((s,k)=>s+(Number(p[k])||0),0); } catch (e) { return Infinity; }
  },
  fmt(n) {
    n = Number(n) || 0;
    if (n !== n) return '0';
    return typeof formatNum === 'function' ? formatNum(n) : (Math.floor(n)).toLocaleString();
  },
  fmtTime(s) {
    s = Math.max(0, Math.floor(Number(s) || 0));
    if (!isFinite(s)) return '∞';
    const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
    if (h>0) return `${h}时${m}分`;
    if (m>0) return `${m}分${sec}秒`;
    return `${sec}秒`;
  }
};

/* ---------- 全局悬浮提示（轻量复刻 gooboo tooltip） ---------- */
(function () {
  let tipEl = null;
  function ensure() {
    if (tipEl) return tipEl;
    tipEl = document.createElement('div');
    tipEl.className = 'gb-tooltip';
    tipEl.style.display = 'none';
    document.body.appendChild(tipEl);
    return tipEl;
  }
  document.addEventListener('mouseover', (e) => {
    const t = e.target.closest('[data-tip]');
    const el = ensure();
    if (!t) { el.style.display = 'none'; return; }
    const txt = t.getAttribute('data-tip');
    el.innerHTML = txt;
    el.style.display = 'block';
    const r = t.getBoundingClientRect();
    let x = r.left + r.width / 2 - 100, y = r.bottom + 8;
    if (y + 120 > window.innerHeight) y = r.top - 8 - 60;
    el.style.left = Math.max(8, Math.min(x, window.innerWidth - 200)) + 'px';
    el.style.top = y + 'px';
    if (txt) el.style.display = 'block'; else el.style.display = 'none';
  });
})();