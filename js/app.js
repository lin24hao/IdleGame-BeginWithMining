/* ============================================================
 * app.js —— 修仙版gooboo 应用壳（零依赖、双击即玩）
 *
 * 职责：
 *   1) 初始化「灵脉(lm)」引擎（LM_RT / CUR / UPG / STAT / UNLOCK），
 *      复用已忠实移植 gooboo-mining 数值的 lm_core/data/store。
 *   2) 顶部应用栏 + 功能瓷砖导航 + 设置面板 + 主题切换。
 *   3) 统一 Tick（1000ms）驱动 + 存档循环 + 离线结算。
 *
 * 加载顺序（index.html）：
 *   icon.js → gooboo.css → lm_text → lm_core → lm_data → lm_store → app.js → views/lm_view.js
 * ============================================================ */
var GB_APP = {
  SAVE_KEY: 'xzdz_gooboo_save',
  ready: false,
  activeView: null,               // { mount, unload, renderKey }
  currentFeature: null,           // 'home' | 'lm'
  theme: 'dark',
  config: { theme: 'dark' },
  _tickCount: 0,
  _queue: [],                     // 降级用的操作队列（保留）

  /* ============ 文案（中文界面） ============
   * unlockKey 对应 GB_UNLOCK.isUnlocked() 查询的 key
   * 阈值来自 GB_META.UNLOCK_THRESHOLDS（阶段 1 不做的模块也占位，显示锁定态）
   */
  features: [
    { id: 'group-main', label: '主玩法', tiles: [
      { id: 'lm', name: '灵脉', icon: 'mdi-pickaxe', color: 'c-primary', unlockKey: 'lmFeature',
        desc: '凿层岩、引灵气，摄灵资。逐层深入直至渡劫飞升。' },
      { id: 'village', name: '宗门', icon: 'mdi-home-variant', color: 'c-accent', unlockKey: 'villFeature',
        desc: '辟山门、营山建屋，安置村民、广布香火，率众修行飞升。' },
      { id: 'farm', name: '灵植园', icon: 'mdi-barn', color: 'c-secondary', unlockKey: 'faFeature',
        desc: '辟灵田、栽灵植，析灵种、施灵肥，耕耘天道直至飞升。' },
      { id: 'horde', name: '降妖', icon: 'mdi-account-group', color: 'c-warning', unlockKey: 'hoFeature',
        desc: '临黑暗妖境，屠妖破阵，积妖骨妖魄，砺招开魄、携宝传承直至轮回。' },
      { id: 'ruin', name: '秘境', icon: 'mdi-map', color: 'c-info', unlockKey: 'ruFeature',
        desc: '寻幽访秘，历四境凶险，搜奇珍异宝、搏妖兽凶徒，携宝撤离或葬身其中。' }
    ]},
    { id: 'group-sub', label: '辅助玩法', tiles: [
      { id: 'school', name: '藏经阁', icon: 'mdi-school', color: 'c-primary', unlockKey: 'scFeature',
        desc: '入藏经阁，演算、文墨、史卷、绘卷、丹术五艺修行，摘金尘博考签，博览群书通仙术。' },
      { id: 'dao', name: '大道法则', icon: 'mdi-yin-yang', color: 'c-accent', unlockKey: 'daoFeature',
        desc: '五行灵气化形、阴阳本源聚灵。采青赤黄白玄五行元，炼混元、道元，贯通天地大道。' },
      { id: 'lingbao', name: '先天灵宝', icon: 'mdi-gem-stone', color: 'c-warning', unlockKey: 'lingbaoFeature',
        desc: '天生地养的先天灵宝，寻获可增益修为，供奉可加持造化。' },
      { id: 'xianqi', name: '仙器', icon: 'mdi-sword-cross', color: 'c-info', unlockKey: 'xianqiFeature',
        desc: '炼器大成者所铸仙器，自带威灵，可随日夜精进，威力与日俱增。' },
      { id: 'general', name: '仙尊指引', icon: 'mdi-book-open', color: 'c-primary', unlockKey: 'generalFeature',
        desc: '上古仙尊留下的修行指引，按其条件逐步完成，可得真传。' }
    ]}
  ],

  /* ============ 存档：读取 / 快照 / 回写 ============ */
  defaults() { return JSON.parse(JSON.stringify(LM_STORE.state)); },

  deepMerge(target, src) {
    if (!src || typeof src !== 'object') return target;
    Object.keys(src).forEach(k => {
      const sv = src[k];
      if (sv && typeof sv === 'object' && !Array.isArray(sv) && target[k] && typeof target[k] === 'object' && !Array.isArray(target[k])) {
        this.deepMerge(target[k], sv);
      } else { target[k] = sv; }
    });
    return target;
  },

  loadConfig() {
    try {
      const raw = localStorage.getItem('xzdz_gooboo_config');
      if (raw) this.config = Object.assign({ theme: 'dark' }, JSON.parse(raw));
    } catch (e) { /* ignore */ }
    this.theme = this.config.theme || 'dark';
  },
  saveConfig() {
    try { localStorage.setItem('xzdz_gooboo_config', JSON.stringify(this.config)); } catch (e) { /* ignore */ }
  },

  loadSave() {
    try {
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return null;
  },
  snapshot() {
    const snap = {
      savedAt: Date.now(),
      state: JSON.parse(JSON.stringify(LM_RT.lmState)) || null,
      levels: JSON.parse(JSON.stringify(UPG.levels || {})),
      stat: JSON.parse(JSON.stringify(STAT.values || {})),
      unlock: JSON.parse(JSON.stringify(UNLOCK.items || {})),
      currency: JSON.parse(JSON.stringify(CUR.values || {}))
    };
    // 全局 Feature 解锁 + globalLevel
    if (typeof GB_UNLOCK !== 'undefined') snap.gb_unlock = GB_UNLOCK.snapshot();
    if (typeof GB_META !== 'undefined') snap.gb_meta = GB_META.snapshot();
    // 阶段 2 新模块统一存档（dao/relic/treasure/general）
    if (typeof GB_MODULES !== 'undefined') snap.mods = GB_MODULES.snapshotAll();
    return snap;
  },
  persist() {
    if (!this.ready) return false;
    try { localStorage.setItem(this.SAVE_KEY, JSON.stringify(this.snapshot())); return true; }
    catch (e) { return false; }
  },
  hardReset() {
    // 清空本地存档 + 配置（含各模块自己的存档键，否则启动即载入旧进度）
    try { localStorage.removeItem(this.SAVE_KEY); } catch (e) { /* ignore */ }
    try { localStorage.removeItem('xzdz_gooboo_config'); } catch (e) { /* ignore */ }
    ['xzdz_gooboo_village_save', 'xzdz_gooboo_farm_save', 'xzdz_gooboo_horde_save_v2', 'xzdz_gooboo_school_save', 'xzdz_gooboo_ruin_save']
      .forEach(k => { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } });
    // 重置内存引擎为全新默认状态，写入空快照，杜绝残留旧等级/旧货币
    try {
      LM_RT.init(JSON.parse(JSON.stringify(LM_STORE.state)));
      UPG.applyAll();
      // 重置全局 Feature 解锁 + globalLevel
      if (typeof GB_META !== 'undefined') GB_META.reset();
      // 阶段 2 新模块硬重置
      if (typeof GB_MODULES !== 'undefined') GB_MODULES.hardResetAll();
      this.ready = false; // 禁止 interval 在本轮 reload 前再次 persist 写回
      if (typeof GB_MODULES !== 'undefined') GB_MODULES.resetting = true; // 同理：禁止各模块在 beforeunload 里回写
      localStorage.removeItem(this.SAVE_KEY);
    } catch (e) { /* ignore */ }
    location.reload();
  },

  /* ============ 引擎初始化 ============ */
  initEngine() {
    // 先初始化 GB_UNLOCK 和 GB_META 的空壳 —— 必须在各模块 load 之前
    if (typeof GB_META !== 'undefined') {
      GB_META.initAllFeatureKeys();
    }

    const saved = this.loadSave();
    const state = this.defaults();
    if (saved && saved.state) this.deepMerge(state, saved.state);
    LM_RT.init(state);
    if (saved) {
      try { if (saved.levels) Object.keys(saved.levels).forEach(k => { UPG.levels[k] = saved.levels[k]; }); } catch (e) {}
      try { if (saved.stat) Object.keys(saved.stat).forEach(k => { STAT.values[k] = saved.stat[k]; }); } catch (e) {}
      try { if (saved.unlock) Object.keys(saved.unlock).forEach(k => { UNLOCK.items[k] = saved.unlock[k]; }); } catch (e) {}
      try { if (saved.currency) Object.keys(saved.currency).forEach(k => { CUR.values[k] = saved.currency[k]; }); } catch (e) {}
      // 加载全局解锁 + globalLevel
      try { if (saved.gb_unlock && typeof GB_UNLOCK !== 'undefined') GB_UNLOCK.restore(saved.gb_unlock); } catch (e) {}
      try { if (saved.gb_meta && typeof GB_META !== 'undefined') GB_META.restore(saved.gb_meta); } catch (e) {}
      // 阶段 2 新模块统一读档
      try { if (saved.mods && typeof GB_MODULES !== 'undefined') GB_MODULES.restoreAll(saved.mods); } catch (e) {}
    }
    UPG.applyAll();
  },

  /* ============ 生命周期 ============ */
  init() {
    this.loadConfig();
    this.applyTheme(this.theme, false);

    // 显示启动主页（Landing Page），等用户点击"新游戏"或"继续游戏"后再初始化引擎
    this.renderLanding();
  },

  /**
   * 真正启动游戏：初始化引擎 + 离线结算 + Tick 循环 + 存档钩子
   * 只有用户从主页点击"新游戏"或"继续游戏"后才会执行
   */
  _bootEngine() {
    // 统一地基：把灵脉的载入挂到注册表，再统一载入全部模块
    if (typeof GB_MODULES !== 'undefined') {
      GB_MODULES.attachView('lm', { load: () => this.initEngine() });
      GB_MODULES.loadAll();
      // 所有模块 load 完后，触发它们上报 globalLevelPart（基于存档里的当前状态）
      try { GB_MODULES.afterLoad(); } catch (e) {}
    } else {
      this.initEngine();
    }

    // 离线结算（离开时长）——上限 8 小时
    const last = this.loadSave();
    const now = Date.now();
    let elapsedSec = 0;
    if (last && last.savedAt) {
      elapsedSec = Math.min((now - last.savedAt) / 1000, 8 * 3600);
    }
    if (typeof GB_MODULES !== 'undefined') GB_MODULES.offlineAll(elapsedSec);

    this.ready = true;
    this.renderShell();
    this.navigate('home');

    // 统一 Tick：按真实时间差驱动全部模块 + 存档 + 视图刷新
    this._lastTick = Date.now() / 1000;
    setInterval(() => {
      if (!this.ready) return;
      const t = Date.now() / 1000;
      const prev = this._lastTick || t;
      this._lastTick = t;
      try { GB_MODULES.tickAll(t, prev); } catch (e) {}
      this._tickCount++;
      if (this._tickCount % 30 === 0) { this.persist(); GB_MODULES.saveAll(); }
      this.refreshActiveView();
    }, 1000);

    // 关闭时存档
    window.addEventListener('beforeunload', () => {
      if (typeof GB_MODULES !== 'undefined' && GB_MODULES.resetting) return;
      this.persist(); GB_MODULES.saveAll();
    });
  },

  /**
   * 启动主页（Landing Page）：视觉特效版
   */
  renderLanding() {
    const hasSave = this._hasAnySave();
    // 八卦符文：乾兑离震巽坎艮坤
    const baGua = ['☰','☱','☲','☳','☴','☵','☶','☷'];
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="landing">
        <!-- 第一层：月景天空 + 远山剪影 -->
        <div class="landing-sky">
          <div class="landing-moon"></div>
          <div class="landing-mountains landing-m-far"></div>
          <div class="landing-mountains landing-m-mid"></div>
          <div class="landing-mountains landing-m-near"></div>
        </div>

        <!-- 第二层：飘动云雾 -->
        <div class="landing-clouds">
          ${Array.from({ length: 8 }, () => {
            const top = 22 + Math.random() * 55;
            const dur = Math.random() * 20 + 25;
            const delay = Math.random() * 15;
            const scale = 0.6 + Math.random() * 1.2;
            return `<div class="landing-cloud" style="top:${top}%;animation-duration:${dur}s;animation-delay:${delay}s;transform:scale(${scale});"></div>`;
          }).join('')}
        </div>

        <!-- 第三层：稀疏星光 -->
        <div class="landing-stars">
          ${Array.from({ length: 50 }, () => {
            const size = Math.random() * 2 + 1;
            const top = Math.random() * 45;
            const left = Math.random() * 100;
            const delay = Math.random() * 5;
            const dur = Math.random() * 3 + 2;
            return `<span class="landing-star" style="width:${size}px;height:${size}px;top:${top}%;left:${left}%;animation-delay:${delay}s;animation-duration:${dur}s;"></span>`;
          }).join('')}
        </div>

        <!-- 第五层：灵气光点上飘（天地灵气被吸收） -->
        <div class="landing-lingqi">
          ${Array.from({ length: 30 }, () => {
            const size = Math.random() * 4 + 2;
            const left = Math.random() * 100;
            const delay = Math.random() * 10;
            const dur = Math.random() * 8 + 10;
            const colors = ['#7fffcc','#c97dff','#ffd700','#50fa7b','#bd93f9'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            return `<span class="landing-lq" style="width:${size}px;height:${size}px;left:${left}%;animation-delay:${delay}s;animation-duration:${dur}s;background:${color};box-shadow:0 0 8px ${color};"></span>`;
          }).join('')}
        </div>

        <!-- 中央道法轮盘（八卦 + 太极） -->
        <div class="landing-dao">
          <!-- 外圈八卦 -->
          <div class="landing-bagua">
            ${baGua.map((g, i) => {
              const deg = i * 45;
              return `<span class="landing-bagua-item" style="transform:rotate(${deg}deg) translateY(-100px) rotate(${-deg}deg);">${g}</span>`;
            }).join('')}
          </div>
          <!-- 中圈 -->
          <div class="landing-dao-mid"></div>
          <!-- 内圈太极（纯 SVG 标准 S 曲线阴阳鱼） -->
          <div class="landing-taiji">
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              <!-- 白底圆 -->
              <circle cx="50" cy="50" r="50" fill="#f5f5f5"/>
              <!-- 右半黑圆（形成左右分界） -->
              <path d="M50,0 A50,50 0 0 1 50,100 Z" fill="#14141e"/>
              <!-- 上部黑半圆（圆心在上，r=25）：形成 S 曲线的上弧 -->
              <circle cx="50" cy="25" r="25" fill="#14141e"/>
              <!-- 下部白半圆（圆心在下，r=25）：形成 S 曲线的下弧 -->
              <circle cx="50" cy="75" r="25" fill="#f5f5f5"/>
              <!-- 黑鱼中的白点 -->
              <circle cx="50" cy="75" r="7" fill="#f5f5f5"/>
              <!-- 白鱼中的黑点 -->
              <circle cx="50" cy="25" r="7" fill="#14141e"/>
            </svg>
          </div>
        </div>

        <!-- 中央主区域 -->
        <div class="landing-center">
          <h1 class="landing-title">
            <span class="landing-title-text">修仙从挖矿开始</span>
          </h1>

          <div class="landing-buttons">
            ${hasSave
              ? `<button class="landing-btn landing-btn-primary" onclick="GB_APP._enterGame(false)">
                  <span class="landing-btn-shine"></span>
                  ${GB_ICON.icon('mdi-play', 22)} 继续仙途
                 </button>
                 <button class="landing-btn landing-btn-secondary" onclick="GB_APP._confirmNewGame()">
                  ${GB_ICON.icon('mdi-plus', 22)} 新的仙途
                 </button>`
              : `<button class="landing-btn landing-btn-primary" onclick="GB_APP._enterGame(true)">
                  <span class="landing-btn-shine"></span>
                  ${GB_ICON.icon('mdi-rocket-launch', 22)} 开始仙途
                 </button>`
            }
          </div>
        </div>
      </div>
    `;
  },

  /** 检查是否有任何存档（灵脉主存档 + 各模块独立存档） */
  _hasAnySave() {
    const keys = [
      this.SAVE_KEY,
      'xzdz_gooboo_village_save',
      'xzdz_gooboo_farm_save',
      'xzdz_gooboo_horde_save_v2',
      'xzdz_gooboo_school_save',
      'xzdz_gooboo_ruin_save'
    ];
    for (const k of keys) {
      try { if (localStorage.getItem(k)) return true; } catch (e) {}
    }
    return false;
  },

  /** 格式化存档时间 */
  _formatSaveTime() {
    const s = this.loadSave();
    if (!s || !s.savedAt) return '未知时间';
    const now = Date.now();
    const diff = now - s.savedAt;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' 小时前';
    return Math.floor(diff / 86400000) + ' 天前';
  },

  /** 主页上的主题切换 */
  toggleThemeOnLanding() {
    const next = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(next, true);
    this.renderLanding();
  },

  /** 进入游戏 */
  _enterGame(isNew) {
    if (isNew) {
      // 清空所有存档后再启动（在 _bootEngine 之前 hardReset，因为引擎还没启动）
      this._hardResetSilent();
    }
    this._bootEngine();
  },

  /** 确认新游戏（有存档时的二次确认） */
  _confirmNewGame() {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:10000;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `
      <div class="modal" style="width:min(420px,92vw);">
        <h2 style="color:var(--clr-warning);">确认开启新的仙途？</h2>
        <p style="font-size:13px;line-height:1.7;color:var(--text-sub);margin:12px 0;">
          这将清空所有现有进度，包括灵脉深度、宗门建筑、灵植、降妖战绩、秘境探索等全部数据。<br>
          <b style="color:var(--text-main);">此操作不可撤销。</b>
        </p>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;">
          <button class="gb-btn grey" onclick="document.querySelector('.overlay.confirm-new')?.remove()">返回</button>
          <button class="gb-btn error" onclick="GB_APP._enterGame(true)">确认开启</button>
        </div>
      </div>
    `;
    overlay.classList.add('confirm-new');
    document.body.appendChild(overlay);
  },

  /** 静默清档（在引擎启动前调用，不走 location.reload） */
  _hardResetSilent() {
    try { localStorage.removeItem(this.SAVE_KEY); } catch (e) {}
    try { localStorage.removeItem('xzdz_gooboo_config'); } catch (e) {}
    ['xzdz_gooboo_village_save', 'xzdz_gooboo_farm_save', 'xzdz_gooboo_horde_save_v2', 'xzdz_gooboo_school_save', 'xzdz_gooboo_ruin_save']
      .forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
  },

  refreshActiveView() {
    if (this.activeView && this.activeView.render) {
      try { this.activeView.render(); } catch (e) {}
    }
  },

  /* ============ 壳渲染 ============ */
  renderShell() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <header class="main-app-bar">
        <div class="app-bar-title" title="回首页" onclick="GB_APP.navigate('home')">
          <button class="app-bar-btn home-btn" title="回首页" onclick="event.stopPropagation();GB_APP.navigate('home')">${GB_ICON.icon('mdi-home', 24)}</button>
          ${GB_ICON.icon('mdi-magic-staff', 26)}
          <span>修仙·从挖灵石开始</span>
        </div>
        <div class="app-bar-spacer"></div>
        <div class="app-bar-actions">
          <button class="app-bar-btn" title="设置" onclick="GB_APP.openSettings()">${GB_ICON.icon('mdi-cog', 24)}</button>
          <button class="app-bar-btn" title="保存" onclick="GB_APP.persist();GB_APP.toast('已保存');">${GB_ICON.icon('mdi-content-save', 24)}</button>
          <button class="app-bar-btn" title="关于" onclick="GB_APP.openAbout()">${GB_ICON.icon('mdi-information', 24)}</button>
        </div>
      </header>
      <main id="view-root" class="page"></main>`;
  },

  /* ============ 导航 ============ */
  _findTile(id) {
    for (const g of this.features) {
      for (const t of g.tiles) if (t.id === id) return t;
    }
    return null;
  },
  _isFeatureUnlocked(featureId) {
    const t = this._findTile(featureId);
    if (!t) return true; // home 或未登记的 id 默认放行
    if (!t.unlockKey) return true;
    if (typeof GB_UNLOCK === 'undefined') return true;
    return GB_UNLOCK.isUnlocked(t.unlockKey);
  },
  _featureGlobalLevelThreshold(featureId) {
    const t = this._findTile(featureId);
    if (!t || !t.unlockKey) return 0;
    if (typeof GB_META === 'undefined') return 0;
    return GB_META.UNLOCK_THRESHOLDS[t.unlockKey] || 0;
  },
  navigate(feature) {
    this.currentFeature = feature;
    const root = document.getElementById('view-root');
    root.innerHTML = '';
    if (this.activeView && this.activeView.unload) { try { this.activeView.unload(); } catch (e) {} }
    this.activeView = null;
    if (feature === 'home') {
      root.innerHTML = this.renderHome();
      return;
    }
    // Feature 解锁守卫
    if (!this._isFeatureUnlocked(feature)) {
      const t = this._findTile(feature);
      const reqLevel = this._featureGlobalLevelThreshold(feature);
      const curLevel = typeof GB_META !== 'undefined' ? GB_META.getLevel() : 0;
      root.innerHTML = `
        <div class="empty-hint" style="padding:40px 20px;text-align:center;">
          <div style="font-size:48px;margin-bottom:16px;">🔒</div>
          <h2 style="color:var(--text-main);margin-bottom:8px;">${t ? t.name : '此玩法'}尚未解锁</h2>
          <p style="color:var(--text-dim);font-size:13px;line-height:1.8;">
            需要全局道行等级 <b style="color:var(--accent);">${reqLevel}</b>（当前 <b style="color:var(--text-main);">${curLevel}</b>）<br>
            先去<b style="color:var(--accent);">灵脉</b>深度挖掘、<b style="color:var(--accent);">宗门</b>广建屋舍，积累道行等级方能解锁更多玩法。
          </p>
          <button class="gb-btn primary" onclick="GB_APP.navigate('lm')" style="margin-top:16px;">${GB_ICON.icon('mdi-pickaxe', 18)} 去灵脉</button>
        </div>`;
      return;
    }
    if (feature === 'lm' && typeof GB_LM_VIEW !== 'undefined') {
      this.activeView = GB_LM_VIEW;
      GB_LM_VIEW.mount(root);
      GB_LM_VIEW.render();
      return;
    }
    if (feature === 'village' && typeof GB_VI_VIEW !== 'undefined') {
      this.activeView = GB_VI_VIEW;
      GB_VI_VIEW.mount(root);
      GB_VI_VIEW.render();
      return;
    }
    if (feature === 'farm' && typeof GB_FA_VIEW !== 'undefined') {
      this.activeView = GB_FA_VIEW;
      GB_FA_VIEW.mount(root);
      GB_FA_VIEW.render();
      return;
    }
    if (feature === 'horde' && typeof GB_HO_VIEW !== 'undefined') {
      this.activeView = GB_HO_VIEW;
      GB_HO_VIEW.mount(root);
      GB_HO_VIEW.render();
      return;
    }
    if (feature === 'school' && typeof GB_SC_VIEW !== 'undefined') {
      this.activeView = GB_SC_VIEW;
      GB_SC_VIEW.mount(root);
      GB_SC_VIEW.render();
      return;
    }
    if (feature === 'ruin' && typeof GB_RU_VIEW !== 'undefined') {
      this.activeView = GB_RU_VIEW;
      GB_RU_VIEW.mount(root);
      GB_RU_VIEW.render();
      return;
    }
    // 已解锁但尚未实现的模块（dao / lingbao / xianqi / general）
    if (['dao', 'lingbao', 'xianqi', 'general'].indexOf(feature) >= 0) {
      const t = this._findTile(feature);
      root.innerHTML = `
        <div class="empty-hint" style="padding:40px 20px;text-align:center;">
          <div style="font-size:48px;margin-bottom:16px;">✨</div>
          <h2 style="color:var(--text-main);margin-bottom:8px;">${t ? t.name : '此玩法'}即将推出</h2>
          <p style="color:var(--text-dim);font-size:13px;">解锁达成，但该玩法正在开发中，敬请期待。</p>
          <button class="gb-btn" onclick="GB_APP.navigate('home')" style="margin-top:16px;">返回首页</button>
        </div>`;
      return;
    }
    root.innerHTML = `<div class="empty-hint">模块尚未开放。</div>`;
  },

  renderHome() {
    const curLevel = typeof GB_META !== 'undefined' ? GB_META.getLevel() : 0;
    const groups = this.features.map(g => `
      <div>
        <div class="feature-title">${g.label}${curLevel > 0 ? `<span style="margin-left:auto;font-size:12px;color:var(--text-dim);font-weight:normal;">道行等级 ${curLevel}</span>` : ''}</div>
        <div class="tile-nav" style="padding-top:8px;">
          ${g.tiles.map(t => {
            const unlocked = this._isFeatureUnlocked(t.id);
            const reqLevel = this._featureGlobalLevelThreshold(t.id);
            const canView = unlocked || (typeof GB_UNLOCK !== 'undefined' && GB_UNLOCK.isVisible(t.unlockKey));
            const dim = !unlocked;
            return `
            <div class="feature-tile${unlocked ? '' : ' locked'}"
                 style="${unlocked ? '' : 'cursor:not-allowed;opacity:0.55;'}"
                 onclick="GB_APP.navigate('${t.id}')">
              <div class="tile-icon ${t.color}" style="${unlocked ? '' : 'filter:grayscale(0.5);'}">${GB_ICON.icon(t.icon, 44)}</div>
              <div class="tile-label">${t.name}</div>
              <div class="tile-desc">${t.desc}</div>
              ${unlocked ? '' : `<div class="tile-lock" title="道行等级 ${reqLevel} 解锁">${GB_ICON.icon('mdi-lock', 18)} <span style="font-size:10px;">Lv${reqLevel}</span></div>`}
            </div>`;
          }).join('')}
        </div>
      </div>`).join('');
    return `<div class="scroll-container">${groups}</div>`;
  },

  /* ============ 主题 ============ */
  themes: [
    { id: 'dark', label: '幽夜', c1: '#1a1a2e', c2: '#0b0b12' },
    { id: 'light', label: '天光', c1: '#E0F0FF', c2: '#c0c8d8' }
  ],
  applyTheme(theme, save) {
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add('theme-' + theme);
    if (save !== false) { this.config.theme = theme; this.saveConfig(); }
  },

  /* ============ 设置面板 ============ */
  openSettings() {
    const tdots = this.themes.map(t =>
      `<div class="hstack" style="gap:8px;cursor:pointer;" onclick="GB_APP.applyTheme('${t.id}');document.getElementById('set-dots').innerHTML='';">
        <div class="theme-dot ${this.theme === t.id ? 'sel' : ''}" style="background:linear-gradient(135deg,${t.c1},${t.c2});"></div>
        <span>${t.label}</span>
      </div>`).join('');
    const html = `
      <div class="overlay" id="settings-overlay" onclick="if(event.target===this)this.remove()">
        <div class="modal">
          <button class="close-x" onclick="document.getElementById('settings-overlay').remove()">${GB_ICON.icon('mdi-close', 22)}</button>
          <h2>设置</h2>
          <div class="set-row"><span>主题</span><div class="hstack" style="gap:12px;">${tdots}</div></div>
          <div class="set-row"><span>主题切换</span>
            <div class="gb-btn small primary" onclick="GB_APP.cycleTheme()">切换主题</div>
          </div>
          <div class="set-row"><span>存档与离线</span><span class="dim">每 30 秒自动保存，离线按最多 8 小时结算</span></div>
          <div class="set-row" style="border-bottom:none;"><span></span>
            <div class="gb-btn small error" onclick="if(confirm('确定清空全部进度并重新开始？')){GB_APP.hardReset()}">重置存档</div>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  },
  cycleTheme() {
    const idx = this.themes.findIndex(t => t.id === this.theme);
    const next = this.themes[(idx + 1) % this.themes.length].id;
    this.applyTheme(next, true);
    document.querySelectorAll('#settings-overlay').forEach(el => el.remove());
    this.openSettings();
  },

  openAbout() {
    const html = `
      <div class="overlay" id="about-overlay" onclick="if(event.target===this)this.remove()">
        <div class="modal">
          <button class="close-x" onclick="document.getElementById('about-overlay').remove()">${GB_ICON.icon('mdi-close', 22)}</button>
          <h2>关于</h2>
          <div style="font-size:13px;line-height:1.7;color:var(--text-main);">
            <p><b>修仙·从挖灵石开始</b> —— 一款零依赖、双击即玩的修仙放置（idle）游戏。</p>
            <p>忠实复刻 gooboo 的挖矿放置玩法与美术风格，数值沿用 gooboo 原作设定，
               仅将设定改写为修仙主题，并全部改为中文界面。</p>
            <p>· M 键 = 返回首页<br>· 全程本地存档 <span class="mono" style="opacity:.6;">localStorage</span></p>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  /* ============ 轻量通知 ============ */
  toast(msg, color) {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;top:76px;right:16px;z-index:3000;padding:8px 16px;border-radius:6px;
      background:#404040;color:#fff;font-size:13px;box-shadow:0 4px 12px rgba(0,0,0,.4);
      border-left:4px solid ${color || '#4CAF50'};`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  },

  /* ============ 数值格式化（中文习惯：万/亿 + gooboo K/M/B） ============ */
  fmt(n) { return typeof formatNum === 'function' ? formatNum(n) : (Math.floor(n) || 0).toLocaleString(); },
  fmtTime(s) { return typeof lmFormatTime === 'function' ? lmFormatTime(s) : Math.floor(s) + 's'; }
};

document.addEventListener('DOMContentLoaded', () => GB_APP.init());
if (typeof document !== 'undefined' && document.readyState !== 'loading') { /* 已就绪由上方事件触发 */ }