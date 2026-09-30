/* ============================================================
 * vi_view.js ——「宗门（village）」主视图：忠实复刻 gooboo Village.vue
 *
 * 布局：顶部 tabs（村庄 / 工坊）→ 三列 content-row：
 *   村庄：村民与资源列 | 建筑/队列/职司列 | 道法升级列
 *   工坊：制作产物列表（可开启制作 / 出售）
 * 所有解锁项（建筑 / 职司 / 升级 / 供奉）均按 requirement() 渐进显示；
 *      未满足限定条件前不渲染，满足后自动出现。
 *
 * 本模块自带独立存档（'xzdz_gooboo_village_save'）与独立 1s 循环，
 * 与灵脉（GB_APP/LM_RT）互不干扰。
 * ============================================================ */
var GB_VI_VIEW = {
  tab: 'village',
  el: null,
  SAVE_KEY: 'xzdz_gooboo_village_save',
  UPG_LIMIT: 36,
  _loop: null,
  _ticks: 0,

  /* ---------- 文案 ---------- */
  T(n) { const x = VI_TEXT; const t = x && x.TERMS; return (t && t[n]) || n; },
  curName(k) { const x = VI_TEXT && VI_TEXT.CURRENCY; return (x && x[k]) || String(k).replace(/^village_/, ''); },
  upgName(id) { const x = VI_TEXT && VI_TEXT.UPGRADE; const kk = String(id).replace(/^village_/, ''); return (x && x[kk]) || kk; },
  jobName(k) { const x = VI_TEXT && VI_TEXT.JOB; return (x && x[k]) || String(k).replace(/([A-Z])/g, ' $1'); },
  buildName(k) { const x = VI_TEXT && VI_TEXT.BUILDING; return (x && x[k]) || String(k).replace(/([A-Z])/g, ' $1'); },
  offerName(k) { const x = VI_TEXT && VI_TEXT.OFFERING; return (x && x[k]) || String(k).replace(/([A-Z])/g, ' $1'); },
  policyName(k) { const x = VI_TEXT && VI_TEXT.POLICY; return (x && x[k]) || String(k).replace(/([A-Z])/g, ' $1'); },
  craftName(k) { const x = VI_TEXT && VI_TEXT.CRAFT; return (x && x[k]) || String(k).replace(/([A-Z])/g, ' $1'); },
  unlockName(id) { const x = VI_TEXT && VI_TEXT.UNLOCK; return (x && x[id]) || String(id).replace(/^village/, ''); },

  /* ---------- 便捷访问 ---------- */
  get state() { return VI_RT.state; },
  G(name) { try { return VI_RT.getters && VI_RT.getters[name]; } catch (e) { return null; } },
  mget(name) { try { return VI_MULT.get(name); } catch (e) { return 0; } },
  m(value) { return VI_MULT.get(name); },
  safe(fn, d) { try { return fn(); } catch (e) { return d; } },
  icon(n, s, c) { return GB_ICON.icon(n, s || 16, c || ''); },

  /* ---------- 生命周期 ---------- */
  mount(root) {
    if (this.el === root) { this.render(); return; }
    this.unload();
    this.el = root;
    // 统一地基：模块已在启动时 load，mount 不重复载入（避免丢弃未存档进度）
    if (!VI_RT.ready) this.load();
    this._clock();
    this.startLoop();
    root.innerHTML = `
      <div class="gb-tabs" id="vi-tabs"></div>
      <div class="flex1 scroll-container" id="vi-content"></div>`;
    root.querySelector('#vi-content').addEventListener('click', (e) => {
      const upg = e.target.closest('[data-buy]');
      if (upg) { VI_RT.buyUpgrade(upg.getAttribute('data-buy')); this.save(); this.render(); return; }
      const act = e.target.closest('[data-act]');
      if (act) this.handleAction(act.getAttribute('data-act'));
    });
    if (!this._beforeUnloadBound) {
      this._beforeUnloadBound = true;
      window.addEventListener('beforeunload', () => {
        // 清档期间不回写（此监听独立于 GB_MODULES.saveAll，须单独守）
        if (typeof GB_MODULES !== 'undefined' && GB_MODULES.resetting) return;
        this.save();
      });
    }
    this.render();
  },
  unload() {
    if (this.el) { this.save(); }
    this.stopLoop();
    this.el = null;
  },
  setTab(t) {
    this.tab = t;
    this.render();
  },
  render() {
    const el = this.el;
    if (!el) return;
    const tabs = el.querySelector('#vi-tabs');
    const content = el.querySelector('#vi-content');
    if (!tabs || !content) return;
    this.ensureValidTab();
    tabs.innerHTML = this.getTabs().map(t =>
      `<button class="gb-tab ${t.id === this.tab ? 'active' : ''}" data-tab="${t.id}" onclick="GB_VI_VIEW.setTab('${t.id}')">${this.icon(t.icon, 18)}${t.name}</button>`
    ).join('');
    content.innerHTML = this.currentTabContent();
  },
  /* 渐进显示的 Tabs（参考 gooboo Village.vue：供奉/戒律/飞升/工坊 满足条件后才出现） */
  getTabs() {
    const list = [{ id: 'village', name: '宗门', icon: 'mdi-home-group' }];
    if (VI_UNLOCK.isVisible('villageOffering1')) list.push({ id: 'offering', name: '供奉', icon: 'mdi-candle' });
    try { if (VI_MULT.get('villagePolicyTaxes') >= 1) list.push({ id: 'policies', name: '戒律', icon: 'mdi-script-text' }); } catch (e) {}
    if (VI_UNLOCK.isVisible('villagePrestige')) list.push({ id: 'pray', name: '飞升', icon: 'mdi-hands-pray' });
    if (VI_UNLOCK.isUnlocked('villageCraftingSubfeature')) list.push({ id: 'crafting', name: '工坊', icon: 'mdi-hammer' });
    return list;
  },
  ensureValidTab() {
    if (!this.getTabs().some(t => t.id === this.tab)) this.tab = 'village';
  },
  currentTabContent() {
    switch (this.tab) {
      case 'offering': return this.renderOfferingTab();
      case 'policies': return this.renderPolicies();
      case 'pray': return this.renderPrayTab();
      case 'crafting': return this.renderCraftingTab();
      default: return this.renderVillage();
    }
  },

  /* ---------- 存档 ---------- */
  loadSave() { try { const r = localStorage.getItem(this.SAVE_KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } },
  /* 仅序列化原始值（job/offering/crafting 里的函数不入档，参照 gooboo saveGame） */
  save() {
    if (!VI_RT.ready) return;
    try {
      const st = VI_RT.state;
      const obj = { savedAt: Date.now(), v: 1, subfeature: st.subfeature };
      obj.stat = JSON.parse(JSON.stringify(VI_STAT.values || {}));
      obj.unlock = JSON.parse(JSON.stringify(VI_UNLOCK.items || {}));
      obj.currency = JSON.parse(JSON.stringify(VI_CUR.values || {}));
      obj.levels = JSON.parse(JSON.stringify(VI_UPG.levels || {}));
      obj.job = {}; obj.offering = {}; obj.policy = {}; obj.crafting = {};
      for (const [k, e] of Object.entries(st.job || {})) if (e.amount > 0) obj.job[k] = e.amount;
      for (const [k, e] of Object.entries(st.offering || {})) if (e.offeringBought > 0 || e.upgradeBought > 0) obj.offering[k] = [e.offeringBought, e.upgradeBought];
      for (const [k, e] of Object.entries(st.policy || {})) if (e.value !== 0) obj.policy[k] = e.value;
      for (const [k, e] of Object.entries(st.crafting || {})) {
        if (e.crafted > 0 || e.isCrafting || e.isSelling || e.sellPrice !== e.baseValue || e.progress > 0) {
          obj.crafting[k] = { isCrafting: e.isCrafting, isSelling: e.isSelling, sellPrice: e.sellPrice, progress: e.progress, owned: e.owned, crafted: e.crafted };
        }
      }
      obj.explorerProgress = st.explorerProgress || 0;
      obj.offeringGen = st.offeringGen || 0;
      obj.buildingQueue = st.buildingQueue || [];
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(obj));
    } catch (e) { /* ignore */ }
  },
  offlineElapsed() {
    const s = this.loadSave();
    if (!s || !s.savedAt) return 0;
    return Math.min((Date.now() - s.savedAt) / 1000, 8 * 3600);
  },
  freshState() {
    return { subfeature: 0, explorerProgress: 0, offeringGen: 0, stat: null, unlock: null, currencyVals: null, upgradeLevels: null, job: null, offering: null, policy: null, crafting: null, buildingQueue: null };
  },
  load() {
    const saved = this.loadSave();
    const state = this.freshState();
    VI_RT.init(state);
    // villageFeature 的解锁现在由 GB_UNLOCK + GB_META 全局管理（globalLevel 阈值 12）
    if (saved) {
      let s = saved, st = state;
      if (s.stat) Object.keys(s.stat).forEach(k => { if (VI_STAT.values[k] !== undefined) VI_STAT.values[k] = s.stat[k]; });
      if (s.unlock) Object.keys(s.unlock).forEach(k => { VI_UNLOCK.items[k] = s.unlock[k]; });
      if (s.currency) Object.keys(s.currency).forEach(k => { if (VI_CUR.values[k] !== undefined) VI_CUR.values[k] = s.currency[k]; });
      if (s.levels) Object.keys(s.levels).forEach(k => { if (VI_UPG.levels[k] !== undefined) VI_UPG.levels[k] = s.levels[k]; });
      // 先恢复建筑等级 → 让 applyAll 刷新职司上限
      VI_RT.afterChange();
      if (s.job) for (const [k, a] of Object.entries(s.job)) if (st.job[k]) st.job[k].amount = a;
      if (s.offering) for (const [k, arr] of Object.entries(s.offering)) {
        if (st.offering[k]) { st.offering[k].offeringBought = arr[0] || 0; st.offering[k].upgradeBought = arr[1] || 0; }
      }
      if (s.policy) for (const [k, val] of Object.entries(s.policy)) {
        if (st.policy[k]) { st.policy[k].value = val; VI_RT.act('applyPolicyEffect', k); }
      }
      if (s.crafting) for (const [k, e] of Object.entries(s.crafting)) {
        const c = st.crafting[k];
        if (!c) continue;
        c.isCrafting = !!e.isCrafting; c.isSelling = !!e.isSelling;
        c.sellPrice = e.sellPrice !== undefined ? e.sellPrice : c.baseValue;
        c.progress = e.progress || 0; c.owned = e.owned || 0; c.crafted = e.crafted || 0;
        if (c.isSpecial) { if (c.owned > 0) VI_RT.act('applySpecialCraftEffects', k); }
        else VI_RT.act('applyMilestoneEffects', k);
      }
      if (s.explorerProgress !== undefined) st.explorerProgress = s.explorerProgress;
      if (s.offeringGen !== undefined) st.offeringGen = s.offeringGen;
      if (Array.isArray(s.buildingQueue)) st.buildingQueue = s.buildingQueue;
      if (s.subfeature === 1) VI_RT.switchSubfeature(1);
      VI_RT.act('applyAllJobs');
      VI_RT.act('applyOfferingEffect');
    }
    VI_RT.afterChange();
  },
  _clock() { /* mark time base for loop */ },

  startLoop() {
    if (this._loop) return;
    this._loop = setInterval(() => {
      this._ticks++;
      if (this._ticks % 30 === 0) this.save();
      if (this.el) this.render();
    }, 1000);
  },
  stopLoop() { if (this._loop) { clearInterval(this._loop); this._loop = null; } },

  /* ---------- 操作 ---------- */
  handleAction(act) {
    const [cmd, arg] = String(act).split(':');
    switch (cmd) {
      case 'bstart': this.safe(() => VI_RT.startBuilding(arg)); break;
      case 'wp': this.safe(() => VI_RT.addWorker(arg)); break;
      case 'wm': this.safe(() => VI_RT.removeWorker(arg)); break;
      case 'wmax': this.safe(() => VI_RT.addMaxWorker(arg)); break;
      case 'wmin': this.safe(() => VI_RT.removeMaxWorker(arg)); break;
      case 'ob': this.safe(() => VI_RT.buyOffering(arg)); break;
      case 'ou': this.safe(() => VI_RT.upgradeOffering(arg)); break;
      case 'pp': this.safe(() => VI_RT.addPolicy(arg)); break;
      case 'pm': this.safe(() => VI_RT.removePolicy(arg)); break;
      case 'craft': this.toggleCraft(arg, 'craft'); break;
      case 'sell': this.toggleCraft(arg, 'sell'); break;
      case 'prst': this.safe(() => VI_RT.prestige(0)); break;
      default: break;
    }
    this.save();
    this.render();
  },
  toggleCraft(key, mode) {
    const c = this.state.crafting && this.state.crafting[key];
    if (!c) return;
    if (mode === 'craft') c.isCrafting = !c.isCrafting;
    else c.isSelling = !c.isSelling;
  },

  /* ================= 宗门 tab（subfeature 0）：四列，参考 gooboo xl 布局 ================= */
  renderVillage() {
    const c1 = `<div class="scroll-container-tab">${this.renderResources()}</div>`;
    const c2 = `<div class="scroll-container-tab">${this.renderJobList()}</div>`;
    const c3 = `<div class="scroll-container-tab">${this.renderQueue()}${this.renderBuildings()}</div>`;
    const c4 = `<div class="scroll-container-tab">${this.renderUpgrades('regular', 'premium')}</div>`;
    return `<div class="content-row">${this.col(c1, 'col-3')}${this.col(c2, 'col-3')}${this.col(c3, 'col-3')}${this.col(c4, 'col-3')}</div>`;
  },
  col(inner, cls) { return `<div class="${cls || 'col-4'}">${inner}</div>`; },

  /* 材质色 → 底色映射（gooboo Material Design base），胶囊背景用 */
  MAT: {
    beige: '#d0b48a', brown: '#795548', cherry: '#c6284f', blue: '#1976d2',
    cyan: '#0097a7', wooden: '#8a6d4b', green: '#4caf50', amber: '#ffa000',
    grey: '#9e9e9e', pink: '#e91e63', yellow: '#fbc02d', red: '#e53935',
    orange: '#f57c00', lime: '#c0ca33', indigo: '#3949ab', purple: '#9c27b0', teal: '#00796b'
  },
  matColor(name) { return this.MAT[name] || '#607d8b'; },

  /* ---------- 资源列：gooboo Resources.vue + Currency.vue（flex-wrap 货币胶囊） ---------- */
  renderResources() {
    const out = [];
    // 主货币（大胶囊）→ 各分组货币（小胶囊）
    const coin = this.curPill('village_coin', true);
    out.push(`<div class="vi-resources" style="margin-top:6px;">${coin}</div>`);
    const groups = [
      ['foundationMaterial', '基础灵材', ['plantFiber', 'wood', 'stone']],
      ['industrialMaterial', '精工灵材', ['metal', 'water', 'glass']],
      ['luxuryMaterial', '珍材', ['hardwood', 'gem', 'marble']],
      ['modernMaterial', '异火灵材', ['oil']],
      ['food', '伙食', ['grain', 'fruit', 'fish', 'vegetable', 'meat']],
      ['mental', '灵识', ['knowledge', 'faith', 'science', 'joy']]
    ];
    for (const [, label, keys] of groups) {
      const pills = keys.map(k => this.curPill('village_' + k)).filter(x => x).join('');
      if (!pills) continue;
      out.push(`<div class="vi-resgrp">${label}</div>`);
      out.push(`<div class="vi-resources">${pills}</div>`);
    }
    return '<div class="mb"></div>' + out.join('');
  },
  curPill(key, large) {
    const def = VI_CUR.defs[key];
    if (!def) return '';
    const val = VI_CUR.value(key);
    const gain = VI_CUR.gainMult(key);
    const stat = VI_STAT.get(key + ''); // 用总量判断是否曾产出
    // 隐藏：无存量、无产出、从未产出（渐进显示）
    if (val <= 0 && gain <= 0 && !stat) return '';
    let cap = null;
    try { const c = VI_CUR.cap(key); if (isFinite(c)) cap = c; } catch (e) {}
    const pct = cap ? Math.max(0, Math.min(100, 100 * val / cap)) : 100;
    const bg = this.matColor(def.color);
    const icon = this.icon(def.icon || 'mdi-circle-multiple', 20);
    const gainTxt = gain > 0 ? `<span class="vi-gain">+${this.fmt(gain)}/s</span>` : '';
    const capTxt = cap !== null ? ` / ${this.fmt(cap)}` : '';
    return `
      <div class="vi-currency ${large ? 'large' : 'small'}" style="background:${bg};" data-tip="${this.curName(key)}：${this.fmt(val)}${capTxt}${gain > 0 ? '，+'+this.fmt(gain)+'/s' : ''}">
        <span class="vi-ic">${icon}</span>
        <div class="vi-currency-bar">
          <div class="vi-currency-fill" style="width:${pct}%;"></div>
          <span class="vi-currency-val">${this.fmt(val)}${capTxt}</span>
        </div>
        ${gainTxt}
      </div>`;
  },

  /* ---------- 弟子摘要（gooboo JobList 顶部：弟子/在值/闲置/宗门凝聚力） ---------- */
  renderJobSummary() {
    const workers = this.mget('villageWorker') || 0;
    const employed = this.G('employed') || 0;
    const unemployed = Math.max(0, Math.floor((this.G('unemployed') || 0)));
    const joy = this.mget('villageHappiness') || 0;
    return `
      <div class="vi-card vi-jobsummary">
        <div class="st"><span class="dim">弟子</span><b>${this.fmt(workers)}</b></div>
        <div class="st"><span class="dim">在值</span><b>${this.fmt(employed)}</b></div>
        <div class="st"><span class="dim">闲置</span><b>${this.fmt(unemployed)}</b></div>
        <div class="st"><span class="dim">宗门凝聚力</span><b>${(joy * 100).toFixed(1)}%</b></div>
      </div>`;
  },

  /* ---------- 职司列（gooboo JobList.vue + Job.vue：两列 + 4 图标方钮） ---------- */
  renderJobList() {
    const rows = [];
    for (const [key, e] of Object.entries(this.state.job || {})) {
      // 渐进显示：job.max === 0 表示尚未解锁（需对应建筑提供）
      const avMax = (e.max === null || e.max === undefined) ? Infinity : e.max;
      if (avMax < 1) continue;
      const amount = e.amount || 0;
      const needed = e.needed || 1;
      const unemployed = this.G('unemployed') || 0;
      const canAdd = unemployed >= needed && (avMax === Infinity || amount < avMax);
      const canRemove = amount > 0;
      const rewards = (e.rewards || []).map(r =>
        `${this.rwName(r.name)} ${r.amount > 0 ? '+' + this.fmt(r.amount) : this.fmt(r.amount)}${r.type === 'mult' ? '%' : ''}`
      ).join('，');
      const maxTxt = isFinite(avMax) ? `<span class="dim"> / ${this.fmt(avMax)}</span>` : '';
      rows.push(`
        <div class="vi-job" data-tip="${this.jobName(key)}：${rewards || '无产出'}。">
          <div class="vi-job-name">${this.jobName(key)}${needed > 1 ? `<span class="gb-chip small">×${needed}</span>` : ''}</div>
          <div class="vi-job-ctrl">
            <button class="gb-vbtn icon error ${!canRemove ? 'disabled' : ''}" data-act="wmin:${key}" ${canRemove ? '' : 'disabled'}>${this.icon('mdi-minus-thick', 16)}</button>
            <button class="gb-vbtn icon error ${!canRemove ? 'disabled' : ''}" data-act="wm:${key}" ${canRemove ? '' : 'disabled'}>${this.icon('mdi-minus', 16)}</button>
            <span class="vi-job-count">${this.fmt(amount)}${maxTxt}</span>
            <button class="gb-vbtn icon success ${!canAdd ? 'disabled' : ''}" data-act="wp:${key}" ${canAdd ? '' : 'disabled'}>${this.icon('mdi-plus', 16)}</button>
            <button class="gb-vbtn icon success ${!canAdd ? 'disabled' : ''}" data-act="wmax:${key}" ${canAdd ? '' : 'disabled'}>${this.icon('mdi-plus-thick', 16)}</button>
          </div>
        </div>`);
    }
    const jobList = rows.length
      ? `<div class="feature-title">${this.T('worker')}</div><div class="vi-card" style="padding:4px 0;">${rows.join('')}</div>`
      : '';
    return `${this.renderJobSummary()}${jobList}`;
  },

  /* ---------- 供奉（香火） ---------- */
  renderOfferings() {
    if (!VI_UNLOCK.isUnlocked('villageOffering1') && !VI_UNLOCK.isVisible('villageOffering1')) {
      // 供奉需先解锁 villageOffering1
      return '';
    }
    const rows = [];
    for (const [key, e] of Object.entries(this.state.offering || {})) {
      if (e.unlock && !VI_UNLOCK.isUnlocked(e.unlock)) continue;
      const cost = this.safe(() => e.cost(e.offeringBought), 0);
      const upCost = Math.round(Math.pow(Math.max(e.amount, 1), 2) * Math.pow(1.15, e.upgradeBought));
      const currency = 'village_' + key;
      const affordable = VI_CUR.value(currency) >= cost;
      const upAffordable = VI_CUR.value('village_offering') >= upCost;
      const col = (VI_CUR.defs[currency] && VI_CUR.defs[currency].color) ? 'c-' + VI_CUR.defs[currency].color : '';
      rows.push(`
        <div class="upg-card ${affordable ? 'can' : ''}">
          <div class="upg-info">
            <div class="upg-name">${this.icon('mdi-candle', 15, 'c-accent')}${this.offerName(key)}</div>
            <div class="upg-price dim" style="font-size:11px;">供奉 ${this.curName(currency)} ${this.fmt(cost)}</div>
          </div>
          <div class="upg-level">×${e.offeringBought}${e.upgradeBought ? '/' + e.upgradeBought : ''}</div>
          <div class="hstack" style="gap:4px;">
            <button class="gb-btn tiny ${affordable ? 'primary' : 'grey'}" data-act="ob:${key}" data-tip="以${this.curName(currency)}供奉。">供</button>
            <button class="gb-btn tiny ${upAffordable ? 'gold' : 'grey'}" data-act="ou:${key}" data-tip="升级供奉效果，耗 ${this.curName('village_offering')} ${this.fmt(upCost)}。">升</button>
          </div>
        </div>`);
    }
    if (!rows.length) return '';
    return `<div class="feature-title">香火供奉</div><div class="gb-card">${rows.join('')}</div>`;
  },

  /* ---------- 政策 ---------- */
  renderPolicies() {
    const icons = { taxes: 'mdi-cash-register', immigration: 'mdi-account-group', religion: 'mdi-hands-pray', scanning: 'mdi-magnify-scan' };
    const rows = [];
    for (const [key, e] of Object.entries(this.state.policy || {})) {
      const limit = Math.max(1, Math.round(this.safe(() => VI_MULT.get(e.mult), 1)));
      const val = e.value || 0;
      rows.push(`
        <div class="hstack" style="justify-content:space-between;padding:4px 0;" data-tip="政策点：${this.policyName(key)}，当前 ${val} / ±${limit}。">
          <span class="upg-name">${this.icon(icons[key] || e.icon || 'mdi-star', 15, 'c-primary')}${this.policyName(key)} <span class="dim" style="font-size:11px;">${val}</span></span>
          <div class="hstack" style="gap:4px;">
            <button class="gb-btn tiny" ${val <= -limit ? 'disabled' : ''} data-act="pm:${key}">-</button>
            <button class="gb-btn tiny" ${val >= limit ? 'disabled' : ''} data-act="pp:${key}">+</button>
          </div>
        </div>`);
    }
    if (!rows.length) return '';
    return `<div class="feature-title">山门政策</div><div class="gb-card">${rows.join('')}</div>`;
  },

  /* ---------- 建造队列（gooboo UpgradeQueue.vue） ---------- */
  renderQueue() {
    const q = this.state.buildingQueue || [];
    if (!q.length) return '';
    const items = q.map(id => {
      const key = id.replace(/^village_/, '');
      return `<span class="vi-queue-item">${this.icon('mdi-hammer', 15)}${this.buildName(key)}</span>`;
    }).join('');
    return `<div class="feature-title">建造队列</div><div class="vi-card" style="padding:10px;"><div class="vi-queue">${items}</div></div>`;
  },

  /* ---------- 建筑（gooboo Upgrade.vue 展开态：标题 + 价格 + 建造钮） ---------- */
  renderBuildings() {
    const ids = Object.keys(VI_UPG.defs).filter(id => {
      const d = VI_UPG.defs[id];
      if (d.type !== 'building') return false;
      try { return VI_UPG.isVisible(id); } catch (e) { return false; }
    });
    ids.sort((a, b) => {
      const ca = VI_UPG.canAfford(a) ? 0 : 1, cb = VI_UPG.canAfford(b) ? 0 : 1;
      if (ca !== cb) return ca - cb;
      return this.priceSum(a) - this.priceSum(b);
    });
    const q = this.state.buildingQueue || [];
    const cards = ids.slice(0, 40).map(id => {
      const key = id.replace(/^village_/, '');
      const d = VI_UPG.defs[id];
      const lvl = VI_UPG.levels[id] || 0;
      const cap = VI_UPG.cap(id);
      const can = lvl < cap && !q.includes(id);
      const priceTxt = this.priceTxt(id);
      const pricePlain = this.pricePlain(id);
      const capTxt = isFinite(cap) ? `${this.fmt(lvl)} / ${this.fmt(cap)}` : this.fmt(lvl);
      const time = d.timeNeeded ? Math.ceil(this.safe(() => (typeof d.timeNeeded === 'function' ? d.timeNeeded(lvl) : d.timeNeeded), 1)) : null;
      return `
        <div class="vi-card vi-upg" style="${can ? '' : 'opacity:.5;'}">
          <div class="vi-upg-title">
            ${this.icon(d.icon || 'mdi-city', 17, 'c-accent')}
            <span class="name">${this.buildName(key)}</span>
            ${d.persistent ? `<span class="upg-lock" data-tip="飞升后保留：该建筑的等级不随飞升重置">${this.icon('mdi-lock', 12)}</span>` : ''}
            <span class="gb-chip">${this.icon('mdi-chevron-double-up', 13)}<span style="margin-left:3px;">${capTxt}</span></span>
            ${time != null ? `<span class="gb-chip">${this.icon('mdi-timer', 13)}<span style="margin-left:3px;">${this.fmtTime(time)}</span></span>` : ''}
          </div>
          <div class="vi-upg-body">
            <div class="vi-price">${priceTxt}</div>
            <div class="vi-upg-actions">
              <div class="spacer"></div>
              <button class="gb-vbtn primary small ${!can ? 'disabled' : ''}" data-act="bstart:${key}" ${can ? '' : 'disabled'}
                data-tip="${this.buildName(key)}：花费 ${pricePlain}，耗时 ${time != null ? this.fmtTime(time) : '—'}。">建</button>
            </div>
          </div>
        </div>`;
    }).join('');
    return `<div class="feature-title">建筑</div>` +
      (cards ? cards : '<div class="dim" style="font-size:12px;">先修筑「灵火坛」以开辟山门。</div>');
  },

  /* ---------- 职司 ---------- */
  rwName(n) {
    const map = { currencyVillagePlantFiberGain: '灵草', currencyVillageWoodGain: '灵木', currencyVillageStoneGain: '山石', currencyVillageMetalGain: '精铁', currencyVillageWaterGain: '灵泉', currencyVillageGlassGain: '琉璃', currencyVillageKnowledgeGain: '智识', currencyVillageGrainGain: '灵粟', currencyVillageFruitGain: '灵果', currencyVillageFishGain: '灵鱼', currencyVillageVegetableGain: '灵蔬', currencyVillageHardwoodGain: '紫檀', currencyVillageGemGain: '灵石矿', currencyVillageScienceGain: '仙研', currencyVillageOilGain: '地髓油', currencyVillageMarbleGain: '云纹石', villageHappiness: '民心', villageLootGain: '寻宝' };
    return map[n] || String(n).replace(/^currencyVillage/i, '').replace(/Gain$/, '');
  },

  /* ---------- 道法升级（可选按 type 过滤：regular/premium → 宗门列；prestige → 飞升 tab） ---------- */
  renderUpgrades(...types) {
    const ids = Object.keys(VI_UPG.defs).filter(id => {
      const d = VI_UPG.defs[id];
      if (d.type === 'building') return false;
      if (types.length && types.indexOf(d.type) < 0) return false;
      try {
        if (!VI_UPG.isVisible(id)) return false;
        if (VI_UPG.isMaxed(id)) return false;
        return true;
      } catch (e) { return false; }
    });
    ids.sort((a, b) => {
      const ca = VI_UPG.canAfford(a) ? 0 : 1, cb = VI_UPG.canAfford(b) ? 0 : 1;
      if (ca !== cb) return ca - cb;
      return this.priceSum(a) - this.priceSum(b);
    });
    const list = ids.slice(0, this.UPG_LIMIT).map(id => {
      const d = VI_UPG.defs[id];
      const lvl = VI_UPG.levels[id] || 0;
      const cap = VI_UPG.cap(id);
      const can = VI_UPG.canAfford(id);
      const isPrestige = d.type === 'prestige';
      const tag = isPrestige ? '<span class="gb-chip small" style="background:rgba(224,156,255,.25);color:#e09cff;">飞升</span>' : (d.type === 'premium' ? '<span class="gb-chip small" style="background:rgba(255,201,60,.25);color:#ffc93c;">晶</span>' : '');
      const capTxt = isFinite(cap) ? `${this.fmt(lvl)} / ${this.fmt(cap)}` : this.fmt(lvl);
      return `
        <div class="vi-card vi-upg" style="${can ? '' : 'opacity:.5;'}">
          <div class="vi-upg-title">
            ${this.icon(d.icon || 'mdi-magic-staff', 17, 'c-accent')}
            <span class="name">${this.upgName(id)}</span>${tag}
            <span class="gb-chip">${this.icon('mdi-chevron-double-up', 13)}<span style="margin-left:3px;">${capTxt}</span></span>
          </div>
          <div class="vi-upg-body">
            <div class="vi-price">${this.priceTxt(id)}</div>
            <div class="vi-upg-actions">
              <div class="spacer"></div>
              <button class="gb-vbtn primary small ${!can ? 'disabled' : ''}" data-buy="${id}" ${can ? '' : 'disabled'}
                data-tip="${this.upgName(id)}：花费 ${this.pricePlain(id)}。">${isPrestige ? '飞升' : '参悟'}</button>
            </div>
          </div>
        </div>`;
    }).join('');
    return `<div class="feature-title">道法升级</div>` +
      (list ? list : '<div class="dim" style="font-size:12px;">暂无可参悟的道法，需营造福地。</div>');
  },

  /* ---------- 价格工具 ---------- */
  price(id) { try { return VI_UPG.price(id) || {}; } catch (e) { return {}; } },
  priceSum(id) { const p = this.price(id); return Object.keys(p).reduce((s, k) => s + (Number(p[k]) || 0), 0); },
  priceTxt(id) {
    const p = this.price(id);
    const txt = Object.keys(p).map(k => {
      const def = VI_CUR.defs[k]; const col = def && def.color ? 'c-' + def.color : '';
      return `<span class="${col}">${this.curName(k)} ${this.fmt(p[k])}</span>`;
    }).join('<span class="dim" style="padding:0 2px;">+</span>');
    return txt || '<span class="dim">免费</span>';
  },
  pricePlain(id) {
    const p = this.price(id);
    return Object.keys(p).map(k => `${this.curName(k)} ${this.fmt(p[k])}`).join(' + ') || '免费';
  },

  /* ================= 供奉 tab ================= */
  renderOfferingTab() {
    const offeringPerSec = this.G('offeringPerSecond') || 0;
    const faith = VI_CUR.value('village_faith');
    const status = `
      <div class="feature-title">香火</div>
      <div class="gb-card">
        <div class="stat-tile"><span class="dim">香火</span><span class="right stat-value">${this.fmt(VI_CUR.value('village_offering'))}</span></div>
        <div class="stat-tile"><span class="dim">香火产出/时</span><span class="right stat-value">${this.fmt(offeringPerSec * 3600)}</span></div>
        <div class="stat-tile"><span class="dim">虔诚(铸造)</span><span class="right stat-value">${this.fmt(faith)}</span></div>
      </div>`;
    return `<div class="content-row">${this.col(status, 'col-3')}${this.col(this.renderOfferings(), 'col-9')}</div>`;
  },

  /* ================= 飞升 tab ================= */
  renderPrayTab() {
    const faith = VI_CUR.value('village_faith');
    const status = `
      <div class="feature-title">飞升状态</div>
      <div class="gb-card">
        <div class="stat-tile"><span class="dim">虔诚(铸造)</span><span class="right stat-value">${this.fmt(faith)}</span></div>
        <div class="center-flex mt8">
          <button class="gb-btn small ${faith > 0 ? 'success' : 'grey'}" data-act="prst" data-tip="渡劫飞升：付出当前虔诚，换取道契与飞升加成，重置普通进度。">
            ${this.icon('mdi-ghost', 16)}飞升（+${this.fmt(faith)} 道契）
          </button>
        </div>
      </div>`;
    return `<div class="content-row">${this.col(status, 'col-3')}${this.col(this.renderUpgrades('prestige'), 'col-9')}</div>`;
  },

  /* ================= 工坊 tab ================= */
  renderCraftingTab() {
    if (!VI_UNLOCK.isUnlocked('villageCraftingSubfeature')) {
      return `<div class="center-flex" style="padding-top:40px;">
        <div class="dim">工坊尚未启封，请先在「宗门」中修筑建筑（累计 ≥ 3 座）以开辟工坊。</div></div>`;
    }
    const rows = [];
    for (const [key, e] of Object.entries(this.state.crafting || {})) {
      if (!this.isCraftAvailable(key)) continue;
      const priceTxt = this.craftPriceTxt(e);
      const prog = Math.min(100, Math.max(0, Math.min(e.progress, 1) * 100));
      rows.push(`
        <div class="upg-card" style="align-items:flex-start;flex-direction:column;">
          <div class="hstack" style="width:100%;justify-content:space-between;">
            <div class="upg-name">${this.icon(e.icon || 'mdi-cube', 15, e.color ? 'c-' + e.color : 'c-accent')}${this.craftName(key)}
              <span class="dim" style="font-size:11px;"> ×${this.fmt(e.owned)} 已产${this.fmt(e.crafted)}</span>
            </div>
            <div class="hstack" style="gap:4px;">
              <button class="gb-btn tiny ${e.isCrafting ? 'success' : 'grey'}" data-act="craft:${key}" data-tip="${priceTxt}">${e.isCrafting ? '制作中' : '制作'}</button>
              <button class="gb-btn tiny ${e.isSelling ? 'gold' : 'grey'}" data-act="sell:${key}" data-tip="自动出售，换得铜符。">卖</button>
            </div>
          </div>
          <div class="gb-progress" style="height:8px;margin-top:6px;width:100%;">
            <div class="bar" style="width:${prog}%;background:#7E57C2;"></div>
          </div>
          <div class="dim" style="font-size:11px;">${priceTxt} · 制作${e.timeNeeded || 60}s · 价值 ${this.fmt(e.value || 0)}</div>
        </div>`);
    }
    if (!rows.length) {
      return `<div class="center-flex" style="padding-top:40px;"><div class="dim">尚无可用配方，继续制作基础产物以解锁更多。</div></div>`;
    }
    return `<div class="feature-title">工坊制作</div><div class="gb-card">${rows.join('')}</div>`;
  },
  craftPriceTxt(e) {
    const parts = [];
    for (const [cur, val] of Object.entries(e.price || {})) {
      let name = cur, amount = val;
      const v = typeof val === 'function' ? this.safe(() => val(0), 1) : val;
      if (cur.indexOf('craft_') === 0) name = '此物·' + this.craftName(cur.slice(6));
      else name = this.curName(cur);
      parts.push(`${name} ${this.fmt(v)}`);
    }
    return parts.join(' + ') || '免费';
  },
  isCraftAvailable(key) {
    const e = this.state.crafting && this.state.crafting[key];
    if (!e) return false;
    if (e.unlocked) return true;
    // 非「被解锁目标」的基础产物始终可用
    if (!this._craftTargets) {
      const set = {};
      for (const [, c] of Object.entries(this.state.crafting || {})) {
        for (const [, m] of Object.entries(c.milestone || {})) {
          if (m && m.type === 'villageCraft' && m.name) set[m.name] = true;
        }
      }
      this._craftTargets = set;
    }
    return !this._craftTargets[key];
  },

  /* ---------- 工具 ---------- */
  fmt(n) {
    n = Number(n) || 0;
    if (n !== n) return '0';
    return typeof formatNum === 'function' ? formatNum(n) : (Math.floor(n)).toLocaleString();
  },
  fmtTime(s) {
    s = Math.max(0, Math.floor(Number(s) || 0));
    if (!isFinite(s)) return '∞';
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    if (h > 0) return `${h}时${m}分`;
    if (m > 0) return `${m}分${sec}秒`;
    return `${sec}秒`;
  }
};

/* ===== 挂接统一地基：由注册表统一驱动 load / save（tick 已交给全局循环） ===== */
if (typeof GB_MODULES !== 'undefined') GB_MODULES.attachView('vill', GB_VI_VIEW);