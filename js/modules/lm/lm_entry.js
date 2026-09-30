/**
 * LM_ENTRY —— 灵脉（修炼）模块接入层  [对应 gooboo: mining]
 * ============================================================
 * 职责：
 *   1) 依赖顺序加载后初始化 LM_RT（lm_core / lm_data / lm_store）；
 *   2) 通过 ENGINE.register 接入统一 Tick（tickspeed 1000），并提供 offlineTick 离线结算；
 *   3) 存档写入 STATE.player.lmModule（STATE 不存在时回落到独立 localStorage 键）；
 *   4) 提供浮动入口按钮 + gooboo 观感面板（深色底 / 半透明描边卡片 / 发光 / 圆角）。
 *
 * 红线：
 *   - 零依赖、无网络、无外部资源；不修改原搜打撤玩法（不接入 MAIN 的视图路由）。
 *   - 数值与公式全部来自 lm_data.js / lm_store.js，本文件不含任何数值设计。
 *   - 显示名来自 lm_text.js（LM_TEXT），本文件不含硬编码术语。
 */
const LM_ENTRY = {
  ready: false,
  warnings: [],
  _ui: null,
  _saveWrapped: false,
  _lastRender: 0,
  _tickCount: 0,
  FALLBACK_KEY: 'xdzc_lm_save',
  RENDER_INTERVAL_MS: 500,

  /* ---------------- 文案（全部取自 LM_TEXT，缺失时回落原键名） ---------------- */
  _text() { return (typeof LM_TEXT !== 'undefined') ? LM_TEXT : null; },

  moduleName() { const t = this._text(); return (t && t.MODULE && t.MODULE.name) || '灵脉'; },
  moduleLabel() { const t = this._text(); return (t && t.MODULE && t.MODULE.label) || '修炼 · 灵脉'; },
  moduleDesc() { const t = this._text(); return (t && t.MODULE && t.MODULE.desc) || ''; },
  term(k, fallback) { const t = this._text(); return (t && t.TERMS && t.TERMS[k]) || fallback || k; },
  upgradeName(id) {
    const t = this._text();
    const key = String(id).replace(/^lm_/, '');
    if (t && t.UPGRADE && t.UPGRADE[key]) return t.UPGRADE[key];
    return key;
  },
  currencyName(key) {
    const t = this._text();
    if (t && t.CURRENCY && t.CURRENCY[key]) return t.CURRENCY[key];
    return String(key).replace(/^lm_/, '').replace(/^gem_/, '').replace(/([A-Z])/g, ' $1').trim();
  },
  statName(key) {
    const t = this._text();
    const k = String(key).replace(/^lm_/, '');
    if (t && t.STAT && t.STAT[k]) return t.STAT[k];
    return k;
  },
  unlockName(id) {
    const t = this._text();
    if (t && t.UNLOCK && t.UNLOCK[id]) return t.UNLOCK[id];
    return String(id).replace(/^lm/, '');
  },

  /* ---------------- 存档：读取 / 快照 / 回写 ---------------- */
  defaults() { return JSON.parse(JSON.stringify(LM_STORE.state)); },

  loadSaved() {
    let saved = null;
    try {
      if (typeof STATE !== 'undefined' && STATE.player && STATE.player.lmModule) {
        saved = STATE.player.lmModule;
      }
    } catch (e) { /* ignore */ }
    if (!saved) {
      try {
        const raw = (typeof localStorage !== 'undefined') ? localStorage.getItem(this.FALLBACK_KEY) : null;
        if (raw) saved = JSON.parse(raw);
      } catch (e) { /* ignore */ }
    }
    return saved || null;
  },

  snapshot() {
    const snap = {
      savedAt: Date.now(),
      state: (this.lmState() && JSON.parse(JSON.stringify(this.lmState()))) || null,
      levels: JSON.parse(JSON.stringify(UPG.levels || {})),
      stat: JSON.parse(JSON.stringify(STAT.values || {})),
      unlock: JSON.parse(JSON.stringify(UNLOCK.items || {})),
      currency: JSON.parse(JSON.stringify(CUR.values || {})),
      automation: (SYSTEM.state && SYSTEM.state.settings && SYSTEM.state.settings.automation &&
        SYSTEM.state.settings.automation.items.progressLm.value) || 0
    };
    return snap;
  },

  /** 回写存档：优先写入 STATE.player.lmModule，同时写一份独立键做兜底 */
  persist() {
    if (!this.ready) return false;
    let snap = null;
    try { snap = this.snapshot(); } catch (e) { this.warnings.push('persist: ' + e.message); return false; }
    try {
      if (typeof STATE !== 'undefined' && STATE.player) STATE.player.lmModule = snap;
    } catch (e) { /* ignore */ }
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(this.FALLBACK_KEY, JSON.stringify(snap));
    } catch (e) { /* ignore */ }
    return true;
  },

  /** 包一层 STATE.save，保证主存档时带上灵脉快照（不改动 STATE.save 原有逻辑） */
  hookStateSave() {
    if (this._saveWrapped) return;
    if (typeof STATE === 'undefined' || typeof STATE.save !== 'function') return;
    const self = this;
    const original = STATE.save;
    STATE.save = function () {
      try { self.persist(); } catch (e) { /* ignore */ }
      return original.apply(this, arguments);
    };
    this._saveWrapped = true;
  },

  lmState() { return (typeof LM_RT !== 'undefined' && LM_RT.lmState) || null; },

  _deepMerge(target, src) {
    if (!src || typeof src !== 'object') return target;
    Object.keys(src).forEach(k => {
      const sv = src[k];
      if (sv && typeof sv === 'object' && !Array.isArray(sv) && target[k] && typeof target[k] === 'object' && !Array.isArray(target[k])) {
        this._deepMerge(target[k], sv);
      } else {
        target[k] = sv;
      }
    });
    return target;
  },

  /* ---------------- 生命周期：init / tick / offlineTick / unlock / upgrade ---------------- */
  init() {
    if (typeof LM_RT === 'undefined' || typeof LM_STORE === 'undefined') {
      this.warnings.push('init: 依赖未加载（需按 lm_core.js → lm_data.js → lm_store.js 顺序引入）');
      return this;
    }
    const saved = this.loadSaved();
    const state = this.defaults();
    if (saved && saved.state) this._deepMerge(state, saved.state);

    LM_RT.init(state);

    // 恢复进度：等级 / 道录统计 / 悟道 / 灵资
    if (saved) {
      try { if (saved.levels) Object.keys(saved.levels).forEach(k => { UPG.levels[k] = saved.levels[k]; }); } catch (e) { /* ignore */ }
      try { if (saved.stat) Object.keys(saved.stat).forEach(k => { STAT.values[k] = saved.stat[k]; }); } catch (e) { /* ignore */ }
      try { if (saved.unlock) Object.keys(saved.unlock).forEach(k => { UNLOCK.items[k] = saved.unlock[k]; }); } catch (e) { /* ignore */ }
      try { if (saved.currency) Object.keys(saved.currency).forEach(k => { CUR.values[k] = saved.currency[k]; }); } catch (e) { /* ignore */ }
      try {
        if (typeof saved.automation === 'number') {
          SYSTEM.state.settings.automation.items.progressLm.value = saved.automation;
        }
      } catch (e) { /* ignore */ }
    }

    // 重算全部升级效果（含 unlock 型效果，即"悟道"语义）
    UPG.applyAll();

    // 术语表接线：统计标签优先取自 LM_TEXT（缺省回落内置值）
    this.statLabels = this._statLabels();

    this.ready = true;
    this.registerEngine();
    this.hookStateSave();
    if (this.warnings.length === 0 && LM_RT.warnings && LM_RT.warnings.length) {
      this.warnings = LM_RT.warnings.slice(0, 5);
    }
    if (typeof document !== 'undefined' && document.body) this.mountEntry();
    return this;
  },

  registerEngine() {
    if (typeof ENGINE === 'undefined' || typeof ENGINE.register !== 'function') return false;
    if (ENGINE.modules && ENGINE.modules.some(m => m.name === 'lm')) return true;
    const self = this;
    ENGINE.register({
      name: 'lm',
      label: this.moduleLabel(),
      tickspeed: 1000,
      tick: () => self.tick(1),
      offlineTick: (ms) => self.offlineTick(ms),
      stats: () => self.stats(),
      statLabels: self.statLabels,
      notes: () => self.notes()
    });
    return true;
  },

  /** 在线推进（seconds 由 tickspeed=1000 决定，单位为秒） */
  tick(seconds) {
    if (!this.ready) return;
    try { LM_RT.tick(seconds || 1); } catch (e) { this.warnings.push('tick: ' + e.message); }
    this._tickCount++;
    if (this._tickCount % 30 === 0) this.persist();
    this.renderThrottled();
  },

  /** 离线 / 长时间挂起结算（真实毫秒） */
  offlineTick(elapsedMs) {
    if (!this.ready) return;
    try { LM_RT.offlineTick(elapsedMs); } catch (e) { this.warnings.push('offlineTick: ' + e.message); }
    this.persist();
  },

  /** 悟道检测：重算全部 upgrade 效果（含 unlock 型效果），返回已解锁清单 */
  unlock() {
    if (!this.ready) return [];
    try { UPG.applyAll(); } catch (e) { this.warnings.push('unlock: ' + e.message); }
    if (typeof LM_GOOBOO !== 'undefined' && Array.isArray(LM_GOOBOO.unlock)) {
      return LM_GOOBOO.unlock.filter(id => UNLOCK.isUnlocked(id));
    }
    return Object.keys(UNLOCK.items).filter(k => UNLOCK.isUnlocked(k));
  },

  /** 购买秘法升级 */
  upgrade(id) {
    if (!this.ready) return false;
    let ok = false;
    try { ok = LM_RT.buyUpgrade(id); } catch (e) { this.warnings.push('upgrade: ' + e.message); }
    if (ok) this.persist();
    return ok;
  },

  /** 供离线摘要使用的统计口径 */
  stats() {
    if (!this.ready) return {};
    const st = this.lmState() || {};
    return {
      lm_depth: Number(st.depth || 0),
      lm_scrap: Math.round(CUR.value('lm_scrap') || 0),
      lm_pickaxePower: Math.round(Number(st.pickaxePower) || 0)
    };
  },

  /** 统计标签：优先取自 LM_TEXT（STAT / CURRENCY / TERMS），缺失回落内置值 */
  _statLabels() {
    const t = this._text() || {};
    const s = t.STAT || {};
    const c = t.CURRENCY || {};
    return {
      lm_depth: { label: s.maxDepth0 || '道行', unit: ' 层' },
      lm_scrap: { label: c.lm_scrap || '灵气', unit: '' },
      lm_pickaxePower: { label: this.term('pickaxePower', '灵锄锋锐'), unit: '' }
    };
  },

  statLabels: {
    lm_depth: { label: '道行', unit: ' 层' },
    lm_scrap: { label: '灵气', unit: '' },
    lm_pickaxePower: { label: '灵锄锋锐', unit: '' }
  },

  notes() {
    if (!this.ready) return [];
    const st = this.lmState() || {};
    const s = (this._text() && this._text().STAT) || {};
    const c = (this._text() && this._text().CURRENCY) || {};
    return [
      `${this.moduleName()}：当前${s.maxDepth0 || '道行'} ${st.depth || 0} 层，${c.lm_scrap || '灵气'} ${this.fmtNum(CUR.value('lm_scrap'))}`,
      `${this.term('pickaxePower', '灵锄锋锐')} ${this.fmtNum(st.pickaxePower)}，${this.term('durability', '层岩余量')} ${this.fmtNum(st.durability)}`
    ];
  },

  /* ---------------- 工具 ---------------- */
  fmtNum(n) {
    n = Number(n) || 0;
    const units = ['', '万', '亿', '兆', '京'];
    let i = 0;
    while (Math.abs(n) >= 1e4 && i < units.length - 1) { n /= 1e4; i++; }
    const fixed = Math.abs(n) < 100 ? (Math.round(n * 100) / 100) : Math.round(n);
    return fixed + units[i];
  },

  fmtDuration(sec) {
    sec = Math.max(0, Math.floor(Number(sec) || 0));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    if (h > 0) return `${h} 时 ${m} 分`;
    if (m > 0) return `${m} 分 ${s} 秒`;
    return `${s} 秒`;
  },

  /* ---------------- UI（gooboo 观感手写复刻） ---------------- */
  _injectStyle() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('lm-entry-style')) return;
    const css = `
#lm-entry-btn{position:fixed;right:18px;bottom:18px;z-index:9000;padding:10px 18px;border-radius:999px;
  background:linear-gradient(180deg,rgba(46,52,66,.96),rgba(24,27,36,.96));color:#e8e6df;cursor:pointer;
  border:1px solid rgba(212,168,85,.55);box-shadow:0 0 18px rgba(212,168,85,.22);font:600 13px/1.2 system-ui,"Microsoft YaHei",sans-serif;
  letter-spacing:1px;}
#lm-entry-btn:hover{box-shadow:0 0 26px rgba(212,168,85,.42);border-color:#d4a855;}
#lm-panel-mask{position:fixed;inset:0;z-index:9001;background:rgba(6,8,12,.72);display:flex;align-items:center;justify-content:center;
  padding:24px;font:13px/1.5 system-ui,"Microsoft YaHei",sans-serif;color:#dfe3ea;}
#lm-panel{width:min(1040px,96vw);max-height:90vh;overflow:auto;border-radius:12px;padding:18px 20px 22px;
  background:linear-gradient(180deg,rgba(38,43,56,.97),rgba(22,25,33,.97));border:1px solid rgba(255,255,255,.12);
  box-shadow:0 0 40px rgba(90,130,220,.20),inset 0 1px 0 rgba(255,255,255,.06);}
#lm-panel h3{margin:0;font-size:16px;letter-spacing:2px;color:#f0e9d6;}
.lm-sub{color:#8d97a8;font-size:11px;letter-spacing:1px;}
.lm-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px;}
.lm-stat{flex:1 1 132px;min-width:120px;padding:8px 10px;border-radius:8px;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.09);box-shadow:inset 0 1px 0 rgba(255,255,255,.04);}
.lm-stat .k{font-size:11px;color:#93a0b4;}
.lm-stat .v{font-size:15px;color:#f2ead2;font-weight:600;}
.lm-bar{height:6px;border-radius:4px;background:rgba(255,255,255,.10);margin-top:6px;overflow:hidden;}
.lm-bar i{display:block;height:100%;background:linear-gradient(90deg,#d4a855,#7fd0a0);}
.lm-btn{padding:6px 12px;border-radius:6px;cursor:pointer;color:#eee8d8;background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.16);font-size:12px;}
.lm-btn:hover{background:rgba(255,255,255,.12);border-color:#d4a855;}
.lm-btn[disabled]{opacity:.42;cursor:not-allowed;}
.lm-card{padding:9px 11px;border-radius:8px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);
  display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:8px;}
.lm-card.can{border-color:rgba(127,208,160,.45);box-shadow:0 0 14px rgba(127,208,160,.10);}
.lm-card .t{color:#f2ead2;font-weight:600;}
.lm-card .d{color:#8d97a8;font-size:11px;}
.lm-cols{display:flex;gap:14px;margin-top:14px;align-items:flex-start;}
.lm-col{flex:1;min-width:0;}
.lm-col h4{margin:0 0 8px;font-size:13px;color:#e6dcc2;letter-spacing:1px;}
#lm-list-upg{max-height:340px;overflow:auto;padding-right:4px;}
.lm-tag{display:inline-block;padding:1px 6px;border-radius:4px;background:rgba(212,168,85,.14);color:#e2c88a;font-size:10px;margin-left:6px;}
.lm-warn{color:#e8a27a;font-size:11px;margin-top:8px;}
.lm-close{margin-left:auto;padding:6px 12px;}
`;
    const el = document.createElement('style');
    el.id = 'lm-entry-style';
    el.textContent = css;
    document.head.appendChild(el);
  },

  mountEntry() {
    if (typeof document === 'undefined' || !document.body) return;
    if (document.getElementById('lm-entry-btn')) return;
    this._injectStyle();
    const btn = document.createElement('button');
    btn.id = 'lm-entry-btn';
    btn.textContent = this.moduleName();
    btn.title = this.moduleDesc();
    btn.addEventListener('click', () => this.openPanel());
    document.body.appendChild(btn);
  },

  openPanel() {
    if (typeof document === 'undefined' || !document.body) return;
    if (document.getElementById('lm-panel-mask')) { this.closePanel(); return; }
    this._injectStyle();
    const mask = document.createElement('div');
    mask.id = 'lm-panel-mask';
    mask.addEventListener('click', (e) => { if (e.target === mask) this.closePanel(); });
    mask.innerHTML = `
<div id="lm-panel">
  <div style="display:flex;align-items:baseline;gap:10px;">
    <h3>${this.moduleLabel()}</h3>
    <span class="lm-sub">对应 gooboo · mining（数值照抄，仅改设定与文案）</span>
    <button class="lm-btn lm-close" id="lm-close">关闭</button>
  </div>
  <div class="lm-sub" style="margin-top:6px;">${this.moduleDesc()}</div>
  <div class="lm-row" id="lm-stats"></div>
  <div class="lm-row">
    <button class="lm-btn" id="lm-act-unlock">悟道检测</button>
    <button class="lm-btn" id="lm-act-craft">铸锄（法器铸造）</button>
    <button class="lm-btn" id="lm-act-prestige">飞升（渡劫转生）</button>
    <span class="lm-sub" style="align-self:center;">自动修行·下潜阈值
      <input id="lm-auto" type="number" min="0" step="1" value="0"
        style="width:76px;margin-left:6px;padding:3px 6px;border-radius:5px;background:rgba(255,255,255,.06);
        border:1px solid rgba(255,255,255,.16);color:#eee8d8;" />（0 = 关闭）
    </span>
  </div>
  <div class="lm-cols">
    <div class="lm-col">
      <h4>秘法升级 <span class="lm-sub">（可见且未满级者，按可否购买排序）</span></h4>
      <div id="lm-list-upg"></div>
    </div>
    <div class="lm-col">
      <h4>灵资存量</h4>
      <div id="lm-list-cur"></div>
      <h4 style="margin-top:12px;">悟道状态</h4>
      <div id="lm-list-unlock" class="lm-sub"></div>
    </div>
  </div>
  <div class="lm-warn" id="lm-warn"></div>
</div>`;
    document.body.appendChild(mask);

    mask.querySelector('#lm-close').addEventListener('click', () => this.closePanel());
    mask.querySelector('#lm-act-unlock').addEventListener('click', () => { this.unlock(); this.render(true); });
    mask.querySelector('#lm-act-craft').addEventListener('click', () => { try { LM_RT.craftPickaxe(); } catch (e) { this.warnings.push('craft: ' + e.message); } this.persist(); this.render(true); });
    mask.querySelector('#lm-act-prestige').addEventListener('click', () => { try { LM_RT.prestige(); } catch (e) { this.warnings.push('prestige: ' + e.message); } this.persist(); this.render(true); });
    const autoInput = mask.querySelector('#lm-auto');
    try {
      autoInput.value = SYSTEM.state.settings.automation.items.progressLm.value;
    } catch (e) { autoInput.value = 0; }
    autoInput.addEventListener('change', () => {
      const v = Number(autoInput.value) || 0;
      try { SYSTEM.state.settings.automation.items.progressLm.value = v; } catch (e) { /* ignore */ }
      this.persist();
    });

    mask.querySelector('#lm-list-upg').addEventListener('click', (e) => {
      const id = e.target && e.target.getAttribute && e.target.getAttribute('data-lm-buy');
      if (!id) return;
      this.upgrade(id);
      this.render(true);
    });

    this.render(true);
  },

  closePanel() {
    const mask = document.getElementById('lm-panel-mask');
    if (mask) mask.remove();
  },

  renderThrottled() {
    if (typeof document === 'undefined') return;
    if (!document.getElementById('lm-panel-mask')) return;
    const now = Date.now();
    if (now - this._lastRender < this.RENDER_INTERVAL_MS) return;
    this.render();
  },

  render(force) {
    if (typeof document === 'undefined') return;
    const mask = document.getElementById('lm-panel-mask');
    if (!mask) return;
    this._lastRender = Date.now();

    const st = this.lmState() || {};
    const depth = st.depth || 0;
    const scrap = CUR.value('lm_scrap');
    const power = Number(st.pickaxePower) || 0;
    const dur = Number(st.durability) || 0;
    let maxDur = 0;
    try { maxDur = (LM_RT.getters && LM_RT.getters.currentDurability) || 0; } catch (e) { maxDur = 0; }
    const dweller = STAT.get('lm_depthDweller0');
    const totalDmg = STAT.get('lm_totalDamage');
    const pct = maxDur > 0 ? Math.max(0, Math.min(100, dur / maxDur * 100)) : 0;

    mask.querySelector('#lm-stats').innerHTML = `
      <div class="lm-stat"><div class="k">道行层数</div><div class="v">${depth} 层</div></div>
      <div class="lm-stat"><div class="k">灵气</div><div class="v">${this.fmtNum(scrap)}</div></div>
      <div class="lm-stat"><div class="k">灵锄锋锐</div><div class="v">${this.fmtNum(power)}</div></div>
      <div class="lm-stat"><div class="k">层岩余量</div><div class="v">${this.fmtNum(dur)}${maxDur ? ' / ' + this.fmtNum(maxDur) : ''}</div>
        <div class="lm-bar"><i style="width:${pct}%"></i></div></div>
      <div class="lm-stat"><div class="k">驻脉修行</div><div class="v">${this.fmtNum(dweller)}</div></div>
      <div class="lm-stat"><div class="k">累计破岩</div><div class="v">${this.fmtNum(totalDmg)}</div></div>`;

    // 秘法升级列表
    const ids = Object.keys(UPG.defs).filter(id => {
      try { return UPG.isVisible(id) && !UPG.isMaxed(id); } catch (e) { return false; }
    });
    ids.sort((a, b) => {
      const ca = UPG.canAfford(a) ? 0 : 1, cb = UPG.canAfford(b) ? 0 : 1;
      if (ca !== cb) return ca - cb;
      const pa = this._priceSum(a), pb = this._priceSum(b);
      return pa - pb;
    });
    const upgHtml = ids.slice(0, 20).map(id => {
      const lvl = UPG.levels[id] || 0;
      const cap = UPG.cap(id);
      const can = UPG.canAfford(id);
      const price = UPG.price(id);
      const priceTxt = Object.keys(price).map(k => `${this.currencyName(k)} ${this.fmtNum(price[k])}`).join(' + ') || '—';
      const kind = (UPG.defs[id] || {}).type;
      const tag = kind === 'prestige' ? '<span class="lm-tag">飞升秘传</span>' : (kind === 'premium' ? '<span class="lm-tag">晶枢</span>' : '');
      return `<div class="lm-card${can ? ' can' : ''}">
        <div><div class="t">${this.upgradeName(id)}${tag}</div>
          <div class="d">Lv.${lvl}${isFinite(cap) ? ' / ' + cap : ''} · ${priceTxt}</div></div>
        <button class="lm-btn" data-lm-buy="${id}" ${can ? '' : 'disabled'}>参悟</button>
      </div>`;
    }).join('') || '<div class="lm-sub">暂无可参悟的秘法（需提升道行）。</div>';
    mask.querySelector('#lm-list-upg').innerHTML = upgHtml;

    // 灵资存量
    const curKeys = Object.keys(CUR.values).filter(k => (CUR.values[k] || 0) > 0)
      .sort((a, b) => CUR.values[b] - CUR.values[a]).slice(0, 16);
    mask.querySelector('#lm-list-cur').innerHTML = curKeys.length
      ? curKeys.map(k => `<div class="lm-card"><div class="t">${this.currencyName(k)}</div><div class="d">${this.fmtNum(CUR.values[k])}</div></div>`).join('')
      : '<div class="lm-sub">暂无灵资。</div>';

    // 悟道状态
    const unlocked = this.unlock();
    mask.querySelector('#lm-list-unlock').innerHTML = unlocked.length
      ? unlocked.map(id => `<div>· ${this.unlockName(id)}</div>`).join('')
      : '尚未悟得任何法门。';

    const warn = this.warnings.slice(0, 3).join('；');
    mask.querySelector('#lm-warn').textContent = warn ? ('模块提示：' + warn) : '';

    void force;
  },

  _priceSum(id) {
    try {
      const p = UPG.price(id);
      return Object.keys(p).reduce((s, k) => s + (Number(p[k]) || 0), 0);
    } catch (e) { return Infinity; }
  }
};

/* 自动接入：依赖脚本已按序加载后自举（DOM 就绪即挂载入口按钮） */
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LM_ENTRY.init());
  } else if (document.body) {
    LM_ENTRY.init();
  } else {
    document.addEventListener('DOMContentLoaded', () => LM_ENTRY.init());
  }
}
