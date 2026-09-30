/* ============================================================
 * ru_view.js ——「秘境（ruin）」主视图
 *
 * 四页签：
 *   派遣     —— 选弟子 / 选秘境 / 定时长 / 神器栏 / 撤离条件优先级 / 派遣
 *   归来     —— 在派进度 + 归来待收（摘要 + 可展开日志 + 一键入库）+ 历史
 *   仓库     —— 物品列表 / 出售 / 批量出售 / 神器图鉴
 *   弟子     —— 等级·境界·战力·状态 / 提升境界 / 重塑肉身 / 神器栏
 *
 * 玩法口径：只有「派遣 → 等待归来」两阶段，无局内概念、无过程呈现。
 *
 * 架构约定（务必遵守）：
 *   1) 推进由全局统一循环（app.js 每秒 GB_MODULES.tickAll）驱动，
 *      本视图不写任何 RU_RT.tick(...) 定时器，也绝不自行推进时间。
 *   2) mount() 不无条件 load()，必须 if (!RU_RT.ready) this.load();。
 *   3) save() 先判断 RU_RT.ready，再写独立存档键。
 *   4) render() 由 app.js 每秒调用一次 —— 必须按「内容签名」跳过重建，
 *      仅在数据真变化时重建 DOM；每秒只做 updateLive() 局部刷新，
 *      否则下拉框会被反复销毁、数字输入框会丢焦点。
 *   5) 数据唯一入口：RU_RT.state / RU_RT.getters.<name> / RU_RT.act('<action>')。
 * ============================================================ */
var GB_RU_VIEW = {
  el: null,
  SAVE_KEY: 'xzdz_gooboo_ruin_save',

  /* ---------- 视图局部状态（不入存档） ---------- */
  tab: 'dispatch',
  sel: null,           // 派遣页当前选中的弟子
  draft: {},           // { discipleId: { ruinId, durationSec, retreat:[{type,value}] } }
  logOpen: {},         // { recordId: true } 归来日志展开态
  _built: false,
  _sig: '',
  _resetScroll: false,

  /* ==========================================================
   * 0. 便捷访问
   * ========================================================== */
  get state() { return RU_RT.state || {}; },
  get g() { return RU_RT.getters || {}; },

  fmt(v) { return (window.formatNum ? formatNum(v) : Math.round(v)); },
  icon(n, s, c) { return GB_ICON.icon(n, s || 16, c || ''); },
  T(n) { const x = RU_TEXT && RU_TEXT.TERMS; return (x && x[n]) || n; },
  safe(fn, d) { try { const v = fn(); return v === undefined || v === null ? d : v; } catch (e) { return d; } },
  /* 日志文案可能含 < > 等字符（模板插值后），统一转义后再入 innerHTML */
  escape(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  ruinName(o) {
    const r = (o && typeof o === 'object') ? o : RU_DATA.ruinById(o);
    if (!r) return '—';
    const t = RU_TEXT && RU_TEXT.MAP;
    return (t && t[r.id]) || r.name || ('秘境 ' + r.id);
  },
  diffName(k) { const x = RU_TEXT && RU_TEXT.DIFFICULTY; return (x && x[k]) || k; },
  discName(id) { const d = RU_DATA.discipleById(id); return d ? d.name : id; },
  itemName(id) { const it = RU_DATA.itemById(id); return it ? it.name : id; },
  itemQuality(id) { const it = RU_DATA.itemById(id); return it ? it.quality : 'white'; },
  qualityName(q) { return (RU_DATA.QUALITY[q] && RU_DATA.QUALITY[q].name) || q; },
  qCls(q) { return 'ru-q-' + (q || 'white'); },
  statusName(k) {
    const m = { idle: 'idle', dispatched: 'dispatched', awaiting: 'awaiting', needRevive: 'needRevive' };
    return this.T(m[k] || 'idle');
  },

  clock(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    const p = (n) => (n < 10 ? '0' + n : '' + n);
    return p(Math.floor(sec / 3600)) + ':' + p(Math.floor((sec % 3600) / 60)) + ':' + p(sec % 60);
  },
  durText(sec) {
    const m = Math.round((sec || 0) / 60);
    if (m < 60) return m + ' 分钟';
    const h = Math.floor(m / 60), r = m % 60;
    return h + ' 小时' + (r ? ' ' + r + ' 分' : '');
  },
  stone() { return this.safe(() => RU_CUR.value('ruin_stone'), 0); },
  bagQty(itemId) {
    const e = (this.state.bag || []).find(b => b.itemId === itemId);
    return e ? e.qty : 0;
  },
  toast(msg) { if (typeof GB_APP !== 'undefined' && GB_APP.toast) GB_APP.toast(msg); },
  reasonText(r) {
    const m = {
      dispatched: '弟子正在秘境中', awaiting: '弟子归来待收，请先结算', needRevive: '弟子需先重塑肉身',
      limit: '同时在派已达上限', noStone: '灵石不足', noMat: '专属材料不足', maxed: '已达等级上限',
      notFound: '未找到', notNeedRevive: '无需重塑肉身', notSellable: '该物品不可出售', noRuin: '秘境不存在'
    };
    return m[r] || ('失败（' + r + '）');
  },

  /* 神器效果字段 → 中文名 / 百分比格式 */
  EFF_LABEL: {
    power: '战力', damageReduce: '减伤', moneyGain: '金钱收益', weight: '负重上限',
    safeBoxSlots: '安全箱位', eventRate: '事件速率', deathWard: '阵亡豁免', sellPrice: '最终售价',
    rewardBonus: '结算奖励', maxDuration: '时长上限', artifactSlots: '神器栏位', dispatchLimit: '在派上限'
  },
  EFF_PCT: ['power', 'damageReduce', 'moneyGain', 'eventRate', 'sellPrice', 'rewardBonus', 'maxDuration'],
  effText(a, level) {
    if (!a || !a.effect || !(level > 0)) return '';
    return Object.keys(a.effect).map(k => {
      const fn = a.effect[k];
      if (typeof fn !== 'function') return '';
      const v = this.safe(() => fn(level), 0);
      const label = this.EFF_LABEL[k] || k;
      const val = (this.EFF_PCT.indexOf(k) >= 0) ? (v * 100).toFixed(1) + '%' : String(Math.round(v * 100) / 100);
      return label + ' +' + val;
    }).filter(Boolean).join(' · ');
  },

  /* ==========================================================
   * 1. 生命周期
   * ========================================================== */
  mount(root) {
    if (this.el === root) { this.render(); return; }
    this.unload();
    this.el = root;
    if (!RU_RT.ready) this.load();
    root.innerHTML = `
      <div class="gb-tabs" id="ru-tabs"></div>
      <div class="flex1 scroll-container ru-page" id="ru-content"></div>`;
    /* 监听挂在 root 上：页签在 #ru-tabs，内容在 #ru-content，两者都要能冒泡到。
       root 是复用的 DOM，重进模块时必须先解绑，否则重复注册会导致一次点击触发两次。 */
    this._bind(root);
    /* 默认选中第一位弟子 */
    const ids = RU_DATA.DISCIPLE_IDS;
    if (!this.sel || ids.indexOf(this.sel) < 0) this.sel = ids[0];
    this._built = false;
    this.render();
  },
  _bind(root) {
    this._unbind();
    this._onClickFn = (e) => this.onClick(e);
    this._onChangeFn = (e) => this.onChange(e);
    root.addEventListener('click', this._onClickFn);
    root.addEventListener('change', this._onChangeFn);
  },
  _unbind() {
    const root = this.el;
    if (root && this._onClickFn) root.removeEventListener('click', this._onClickFn);
    if (root && this._onChangeFn) root.removeEventListener('change', this._onChangeFn);
    this._onClickFn = null;
    this._onChangeFn = null;
  },
  unload() {
    if (this.el) this.save();
    this._unbind();
    this.el = null;
    this._built = false;
    this._sig = '';
  },

  /* ==========================================================
   * 2. 渲染（签名守卫 + 局部刷新）
   * ========================================================== */
  signature() {
    const st = this.state;
    const p = [this.tab, this.sel];
    p.push('r' + (st.running || []).map(r => r.id + ':' + r.endAt).join(','));
    p.push('b' + (st.returned || []).map(r => r.id).join(','));
    p.push('d' + Object.keys(st.disciple || {}).map(k =>
      k + (st.disciple[k].level || 0) + (st.disciple[k].status || '') + (st.disciple[k].permPower || 0) + (st.disciple[k].deaths || 0)).join(','));
    p.push('s' + Math.floor(this.stone()));
    p.push('g' + (st.bag || []).map(e => e.itemId + e.qty).join(','));
    p.push('a' + Object.keys(st.artifact || {}).map(k => {
      const o = st.artifact[k];
      return k + o.level + '.' + o.frags + '.' + (o.unlocked ? 1 : 0);
    }).join(','));
    p.push('l' + Object.keys(st.loadout || {}).map(k => k + (st.loadout[k] || []).join('+')).join(','));
    p.push('h' + (st.history || []).map(x => x.id + x.stone).join(','));
    p.push('o' + Object.keys(this.logOpen).filter(k => this.logOpen[k]).join(','));
    p.push('k' + Object.keys(this.draft).map(k => k + JSON.stringify(this.draft[k])).join(''));
    return p.join('|');
  },

  render() {
    const el = this.el; if (!el) return;
    const tabs = el.querySelector('#ru-tabs');
    const content = el.querySelector('#ru-content');
    if (!tabs || !content) return;
    const sig = this.signature();
    if (this._built && sig === this._sig) { this.updateLive(); return; }
    this._sig = sig;
    this._built = true;
    const keep = this._resetScroll ? 0 : content.scrollTop;
    this._resetScroll = false;
    tabs.innerHTML = this.tabsHtml();
    content.innerHTML = this.topbarHtml() + this.tabHtml();
    content.scrollTop = keep;
    this.updateLive();
  },

  /* 每秒局部刷新：时钟 + 在派进度（不重建 DOM） */
  updateLive() {
    const el = this.el; if (!el) return;
    const c = el.querySelector('#ru-content'); if (!c) return;
    const now = this.state.now || 0;
    c.querySelectorAll('[data-live-clock]').forEach(n => { n.textContent = this.clock(now); });
    (this.state.running || []).forEach(rec => {
      const box = c.querySelector('[data-run="' + rec.id + '"]'); if (!box) return;
      const total = Math.max(1, rec.endAt - rec.startAt);
      const remain = Math.max(0, rec.endAt - now);
      const done = Math.min(1, Math.max(0, (total - remain) / total));
      const bar = box.querySelector('.ru-bar > i');
      if (bar) bar.style.width = (done * 100).toFixed(1) + '%';
      const tm = box.querySelector('[data-live-remain]');
      if (tm) tm.textContent = this.clock(remain);
    });
  },

  setTab(t) { this.tab = t; this._resetScroll = true; this.render(); },

  tabsHtml() {
    const st = this.state;
    const running = (st.running || []).length;
    const returned = (st.returned || []).length;
    const tabs = [
      { id: 'dispatch', name: '派遣', icon: 'mdi-sword-cross', badge: running },
      { id: 'returned', name: '归来', icon: 'mdi-transfer-down', badge: returned },
      { id: 'storage', name: '仓库', icon: 'mdi-archive', badge: 0 },
      { id: 'disciple', name: '弟子', icon: 'mdi-arm-flex', badge: 0 }
    ];
    return tabs.map(t => `
      <button class="gb-tab ${t.id === this.tab ? 'active' : ''}" data-tab="${t.id}">
        ${this.icon(t.icon, 17)}<span>${t.name}</span>
        ${t.badge > 0 ? `<i class="ru-badge">${t.badge}</i>` : ''}
      </button>`).join('');
  },

  topbarHtml() {
    return `
      <div class="ru-top">
        <span class="ru-stone">${this.icon('mdi-gold', 15, 'c-amber')}<b>${this.fmt(this.stone())}</b>${this.T('stone')}</span>
        <span class="ru-clock">${this.icon('mdi-timer-sand', 13)}<span data-live-clock>${this.clock(this.state.now || 0)}</span></span>
      </div>`;
  },

  tabHtml() {
    if (this.tab === 'returned') return this.returnedHtml();
    if (this.tab === 'storage') return this.storageHtml();
    if (this.tab === 'disciple') return this.discipleHtml();
    return this.dispatchHtml();
  },

  /* ==========================================================
   * 3. 派遣页
   * ========================================================== */
  dispatchHtml() {
    const ids = RU_DATA.DISCIPLE_IDS;
    const sel = this.sel || ids[0];
    const d = RU_DATA.discipleById(sel);
    const dr = this.draftOf(sel);
    const ruin = RU_DATA.ruinById(dr.ruinId) || RU_DATA.RUINS[0];
    const status = this.safe(() => this.g.discipleStatus(sel), 'idle');
    const maxDur = this.maxDurOf(sel, ruin);
    const durs = RU_DATA.PLACEHOLDER.DURATION_OPTIONS
      .map(m => m * 60).filter(s => s <= maxDur);
    if (!durs.length) durs.push(Math.max(60, maxDur));
    const dsec = Math.min(dr.durationSec, maxDur);

    return `
      <div class="ru-sec">
        <div class="ru-sec-title">${this.icon('mdi-arm-flex', 15)} 选择弟子</div>
        <div class="ru-chips">${ids.map(id => this.discipleChipHtml(id, id === sel)).join('')}</div>
        <div class="ru-hint">${d ? d.name + ' · ' + d.roleName + '：' + d.desc : ''}</div>
      </div>

      <div class="ru-sec">
        <div class="ru-sec-title">${this.icon('mdi-map', 15)} 选择秘境</div>
        <select class="ru-select" data-ruin-sel>
          ${RU_DATA.RUINS.map(r => `<option value="${r.id}" ${String(r.id) === String(ruin.id) ? 'selected' : ''}>${this.ruinName(r)} · ${r.realm} · 入场费 ${this.fmt(r.cost)}</option>`).join('')}
        </select>
        ${this.ruinInfoHtml(ruin)}
      </div>

      <div class="ru-sec">
        <div class="ru-sec-title">${this.icon('mdi-timer', 15)} ${this.T('duration')}</div>
        <div class="ru-chips">
          ${durs.map(s => `<button class="ru-chip ${s === dsec ? 'on' : ''}" data-dur="${s}">${Math.round(s / 60)} 分<em>${this.safe(() => this.g.eventCount(sel, ruin, s), 0)} 事件</em></button>`).join('')}
        </div>
        <div class="ru-hint">时长上限 ${this.durText(maxDur)}（秘境上限受弟子与神器加成）</div>
      </div>

      <div class="ru-sec">
        <div class="ru-sec-title">${this.icon('mdi-shield', 15)} ${this.T('artifactSlots')} <em>${(this.state.loadout[sel] || []).length}/${this.safe(() => this.g.artifactSlots, 0)}</em></div>
        ${this.loadoutPickerHtml(sel)}
      </div>

      <div class="ru-sec">
        <div class="ru-sec-title">${this.icon('mdi-elevator-down', 15)} ${this.T('retreat')}（按序判定，命中即撤）</div>
        ${this.retreatHtml(sel)}
      </div>

      ${this.dispatchFootHtml(sel, ruin, status, dsec)}`;
  },

  discipleChipHtml(id, on) {
    const own = this.state.disciple[id] || {};
    const st = own.status || 'idle';
    const cls = st === 'idle' ? '' : 'dis';
    return `<button class="ru-chip ru-disc ${on ? 'on' : ''} ${cls}" data-disc="${id}">
      <span class="ru-disc-name">${this.discName(id)}</span>
      <em>${this.safe(() => this.g.realmName(id), '')} ${own.level || 1} 级 · ${this.safe(() => Math.round(this.g.disciplePower(id)), 0)} 战力</em>
      <i class="ru-st ru-st-${st}">${this.statusName(st)}</i>
    </button>`;
  },

  ruinInfoHtml(r) {
    const ex = (r.exclusiveItems || []).map(i => this.itemName(i)).join('、');
    return `
      <div class="ru-info">
        <div class="ru-info-row"><span>${this.T('realm')}</span><b>${r.realm}</b>
          <span class="ru-diff ru-diff-${r.difficulty}">${this.diffName(r.difficulty)}</span></div>
        <div class="ru-info-row"><span>战力区间</span><b>${r.powerMin} ~ ${r.powerMax}</b></div>
        <div class="ru-info-row"><span>事件速率 / 遇敌率</span><b>×${r.eventRate} / ×${r.dangerRate}</b></div>
        <div class="ru-info-row"><span>时长上限</span><b>${r.maxDuration} 分钟</b></div>
        <div class="ru-info-row"><span>${this.T('cost')}</span><b>${this.fmt(r.cost)} ${this.T('stone')}</b></div>
        ${ex ? `<div class="ru-info-row"><span>专属掉落</span><b>${ex}</b></div>` : ''}
      </div>`;
  },

  /* 神器栏：仅战斗神器，可装栏位数上限 */
  loadoutPickerHtml(id) {
    const slots = this.safe(() => this.g.artifactSlots, 0);
    const cur = this.state.loadout[id] || [];
    const list = Object.keys(this.state.artifact).filter(k => {
      const o = this.state.artifact[k], a = RU_DATA.artifactById(k);
      return a && a.slotType === 'combat' && o && o.unlocked;
    });
    if (!list.length) return `<div class="empty-hint">尚无战斗神器，收集碎片可自动解锁</div>`;
    return `<div class="ru-chips">${list.map(k => {
      const a = RU_DATA.artifactById(k), o = this.state.artifact[k];
      const on = cur.indexOf(k) >= 0;
      const full = !on && cur.length >= slots;
      return `<button class="ru-chip ru-art-chip ${on ? 'on' : ''} ${full ? 'dis' : ''}" data-eq="${id}" data-art="${k}" title="${a.desc}">
        <span class="ru-dot ${this.qCls(a.quality)}"></span>${a.name}
        <em>Lv${o.level}${a.maxLevel === Infinity ? '∞' : '/' + a.maxLevel}</em>
      </button>`;
    }).join('')}</div>`;
  },

  retreatHtml(id) {
    const dr = this.draftOf(id);
    const list = dr.retreat || [];
    return `
      <div class="ru-rt">${list.map((e, i) => this.retreatRowHtml(e, i, i === list.length - 1)).join('')}</div>
      <button class="gb-btn small ghost mt8" data-rt-add>${this.icon('mdi-plus', 13)} 添加条件</button>`;
  },

  retreatRowHtml(entry, i, last) {
    const def = RU_DATA.RETREAT.find(r => r.type === entry.type) || RU_DATA.RETREAT[0];
    let valHtml = '';
    if (entry.type === 'rareLoot') {
      const cur = entry.value || def.def;
      valHtml = `<select class="ru-select ru-select-sm" data-rt-val="${i}">
        ${RU_DATA.QUALITY_ORDER.map(q => `<option value="${q}" ${String(cur) === q ? 'selected' : ''}>${this.qualityName(q)}品及以上</option>`).join('')}
      </select>`;
    } else if (entry.type !== 'none' && entry.type !== 'safeBoxFull') {
      const v = (entry.value === null || entry.value === undefined) ? def.def : entry.value;
      valHtml = `<input class="ru-num-in" type="number" inputmode="numeric" min="0" data-rt-val="${i}" value="${v}"><span class="ru-unit">${def.unit || ''}</span>`;
    }
    return `<div class="ru-rt-row" title="${def.note}">
      <span class="ru-rt-idx">${i + 1}</span>
      <select class="ru-select ru-select-sm" data-rt-type="${i}">
        ${RU_DATA.RETREAT.map(r => `<option value="${r.type}" ${r.type === entry.type ? 'selected' : ''}>${r.label}</option>`).join('')}
      </select>
      ${valHtml}
      <span class="ru-rt-btns">
        <button class="gb-btn icon small" data-rt-up="${i}" ${i === 0 ? 'disabled' : ''}>${this.icon('mdi-arrow-up', 13)}</button>
        <button class="gb-btn icon small" data-rt-down="${i}" ${last ? 'disabled' : ''}>${this.icon('mdi-transfer-down', 13)}</button>
        <button class="gb-btn icon small" data-rt-del="${i}">${this.icon('mdi-close', 13)}</button>
      </span>
    </div>`;
  },

  dispatchFootHtml(id, ruin, status, dsec) {
    const gate = this.dispatchGate(id, ruin, status);
    return `
      <div class="ru-foot">
        <div class="ru-foot-line">
          <span>${this.discName(id)} → ${this.ruinName(ruin)}</span>
          <span>${this.durText(dsec)} · 预计 ${this.safe(() => this.g.eventCount(id, ruin, dsec), 0)} 次事件</span>
        </div>
        ${gate.reasons.map(r => `<div class="ru-warn">${this.icon('mdi-information', 13)} ${r}</div>`).join('')}
        <button class="gb-btn primary ru-dispatch-btn" data-act="dispatch" ${gate.ok ? '' : 'disabled'}>
          ${this.icon('mdi-sword-cross', 16)} ${this.T('dispatch')}入秘境
        </button>
      </div>`;
  },

  /* ==========================================================
   * 4. 归来页（在派 + 待收 + 历史）
   * ========================================================== */
  returnedHtml() {
    const st = this.state;
    const running = st.running || [];
    const returned = st.returned || [];
    return `
      ${running.length ? `<div class="ru-sec">
        <div class="ru-sec-title">${this.icon('mdi-timer', 15)} ${this.T('waiting')} <em>${running.length}</em></div>
        ${running.map(r => this.runningCardHtml(r)).join('')}
      </div>` : ''}

      <div class="ru-sec">
        <div class="ru-sec-title">${this.icon('mdi-transfer-down', 15)} ${this.T('returning')} <em>${returned.length}</em>
          ${returned.length > 1 ? `<button class="gb-btn small primary right" data-collect-all>全部入库</button>` : ''}</div>
        ${returned.length ? returned.map(r => this.returnCardHtml(r)).join('') : '<div class="empty-hint">暂无归来弟子</div>'}
      </div>

      ${this.historyHtml()}`;
  },

  runningCardHtml(rec) {
    const now = this.state.now || 0;
    const total = Math.max(1, rec.endAt - rec.startAt);
    const remain = Math.max(0, rec.endAt - now);
    const done = Math.min(1, Math.max(0, (total - remain) / total));
    return `<div class="ru-card ru-run" data-run="${rec.id}">
      <div class="ru-row">
        <span class="ru-run-title">${this.discName(rec.discipleId)} · ${this.ruinName(rec.ruinId)}</span>
        <b class="ru-run-time" data-live-remain>${this.clock(remain)}</b>
      </div>
      <div class="ru-bar"><i style="width:${(done * 100).toFixed(1)}%"></i></div>
      <div class="ru-run-sub">预计 ${rec.plan ? rec.plan.eventCount : 0} 次事件 · 时长 ${this.durText(rec.endAt - rec.startAt)}</div>
    </div>`;
  },

  returnCardHtml(rec) {
    const plan = rec.plan || {};
    const bagAll = (plan.bag || []).concat(plan.safeBox || []);
    const value = this.safe(() => this.g.listValue(bagAll), 0);
    const count = this.safe(() => this.g.listCount(bagAll), 0);
    const died = !!plan.died;
    const mode = died ? '阵亡' : (plan.retreatReason ? '撤离' : '时辰已尽');
    const open = !!this.logOpen[rec.id];
    const summary = this.safe(() => RU_SIM.interpolate((RU_TEXT.LOG || {}).summary, {
      n: plan.eventsDone || 0, time: this.durText(rec.endAt - rec.startAt), items: count, stone: plan.stone || 0
    }), '');
    return `<div class="ru-card ru-ret">
      <div class="ru-row">
        <span class="ru-ret-title">${this.discName(rec.discipleId)} · ${this.ruinName(rec.ruinId)}</span>
        <span class="ru-ret-mode ${died ? 'ru-died' : ''}">${mode}</span>
      </div>
      <div class="ru-ret-sum">${summary}</div>
      <div class="ru-ret-grid">
        <div class="ru-info-row"><span>背包</span><b>${(plan.bag || []).length} 种 / ${(plan.bag || []).reduce((s, e) => s + e.qty, 0)} 件${died ? '（尽失）' : ''}</b></div>
        <div class="ru-info-row"><span>安全箱</span><b>${(plan.safeBox || []).map(e => this.itemName(e.itemId) + '×' + e.qty).join('、') || '空'}</b></div>
        <div class="ru-info-row"><span>合计价值</span><b>${this.fmt(value)} ${this.T('stone')}</b></div>
        ${(plan.abandoned || []).length ? `<div class="ru-info-row"><span>负重放弃</span><b>${(plan.abandoned || []).map(e => this.itemName(e.itemId) + '×' + e.qty).join('、')}</b></div>` : ''}
      </div>
      <div class="ru-ret-btns">
        <button class="gb-btn small ghost" data-log="${rec.id}">${this.icon(open ? 'mdi-chevron-up' : 'mdi-chevron-right', 13)} 归来日志（${(plan.log || []).length} 条）</button>
        <button class="gb-btn small success" data-collect="${rec.id}">${this.icon('mdi-package-up', 13)} ${this.T('collect')}</button>
      </div>
      ${open ? `<div class="ru-log">${(plan.log || []).map(l => `
        <div class="ru-log-line ru-log-${l.type || ''}">
          <span class="ru-log-t">${this.clock(l.t || 0)}</span>
          <span class="ru-log-x">${this.escape(l.text || '')}</span>
        </div>`).join('')}</div>` : ''}
    </div>`;
  },

  historyHtml() {
    const h = this.state.history || [];
    if (!h.length) return '';
    return `<div class="ru-sec">
      <div class="ru-sec-title">${this.icon('mdi-script-text', 15)} 历史记录</div>
      ${h.slice(0, 12).map(x => `
        <div class="ru-his">
          <span>${this.discName(x.discipleId)} · ${this.ruinName(x.ruinId)}</span>
          <span class="${x.died ? 'ru-died' : ''}">${x.died ? '阵亡' : '归来'} · ${x.events || 0} 事件 · ${x.items || 0} 件 · ${this.fmt(x.stone || 0)} ${this.T('stone')}</span>
        </div>`).join('')}
    </div>`;
  },

  /* ==========================================================
   * 5. 仓库页（物品 + 神器图鉴）
   * ========================================================== */
  storageHtml() {
    const bag = (this.state.bag || []).slice();
    const count = this.safe(() => this.g.listCount(bag), 0);
    const value = this.safe(() => this.g.listValue(bag), 0);
    const weight = this.safe(() => this.g.listWeight(bag), 0);
    bag.sort((a, b) => {
      const dq = RU_DATA.qualityIndex(this.itemQuality(b.itemId)) - RU_DATA.qualityIndex(this.itemQuality(a.itemId));
      if (dq !== 0) return dq;
      const ia = RU_DATA.itemById(a.itemId), ib = RU_DATA.itemById(b.itemId);
      return ((ib ? ib.value : 0) - (ia ? ia.value : 0));
    });

    return `
      <div class="ru-sec">
        <div class="ru-sec-title">${this.icon('mdi-archive', 15)} ${this.T('bag')}</div>
        <div class="ru-info">
          <div class="ru-info-row"><span>件数</span><b>${count} 件</b></div>
          <div class="ru-info-row"><span>总价值</span><b>${this.fmt(value)} ${this.T('stone')}</b></div>
          <div class="ru-info-row"><span>${this.T('weight')}</span><b>${(Math.round(weight * 10) / 10)}（仅派遣时受上限约束）</b></div>
        </div>
        <div class="ru-chips">
          ${['white', 'green', 'blue', 'purple'].map(q =>
            `<button class="ru-chip" data-sellbelow="${q}">售尽 ${this.qualityName(q)}品及以下</button>`).join('')}
        </div>
        ${bag.length ? bag.map(e => this.bagRowHtml(e)).join('') : '<div class="empty-hint">仓库空空如也</div>'}
      </div>
      <div class="ru-sec">
        <div class="ru-sec-title">${this.icon('mdi-shield', 15)} 神器图鉴 <em>${this.safe(() => this.g.unlockedArtifactList().length, 0)}/${RU_DATA.ARTIFACTS.length}</em></div>
        ${RU_DATA.ARTIFACTS.map(a => this.artifactCardHtml(a)).join('')}
      </div>`;
  },

  bagRowHtml(e) {
    const it = RU_DATA.itemById(e.itemId);
    if (!it) return '';
    const price = this.safe(() => this.g.sellPrice(e.itemId), 0);
    const clue = it.type === 'clue';
    return `<div class="ru-item">
      <span class="ru-dot ${this.qCls(it.quality)}"></span>
      <span class="ru-item-name">${it.name}${clue ? '<i class="gb-tag">线索</i>' : ''}</span>
      <span class="ru-item-num">×${e.qty}</span>
      <span class="ru-item-price">${clue ? '不可售' : this.fmt(price) + '/个'}</span>
      ${clue ? '' : `
        <button class="gb-btn small grey" data-sell="${e.itemId}" data-qty="1">售 1</button>
        <button class="gb-btn small grey" data-sellall="${e.itemId}">全售</button>`}
    </div>`;
  },

  artifactCardHtml(a) {
    const own = this.state.artifact[a.id] || { frags: 0, level: 0, unlocked: false };
    const maxed = own.unlocked && own.level >= a.maxLevel;
    const need = RU_DATA.fragNeeded(a.id, own.unlocked ? own.level : 0);
    const prog = maxed ? 1 : Math.min(1, (own.frags || 0) / Math.max(1, need));
    const owners = RU_DATA.DISCIPLE_IDS.filter(id => (this.state.loadout[id] || []).indexOf(a.id) >= 0).map(id => this.discName(id));
    const slotName = a.slotType === 'combat' ? this.T('combatArtifact') : this.T('passiveArtifact');
    return `<div class="ru-art ${own.unlocked ? '' : 'locked'}">
      <div class="ru-row">
        <span class="ru-art-name"><span class="ru-dot ${this.qCls(a.quality)}"></span>${a.name}</span>
        <span class="ru-art-tags">
          <i class="gb-tag ${a.slotType === 'passive' ? 'prestige' : 'gold'}">${slotName}</i>
          <b class="ru-art-lv">${own.unlocked ? ('Lv' + own.level + (a.maxLevel === Infinity ? '/∞' : '/' + a.maxLevel)) : '未解锁'}</b>
        </span>
      </div>
      <div class="ru-bar"><i style="width:${(prog * 100).toFixed(1)}%"></i></div>
      <div class="ru-art-sub">${maxed ? '已满级，溢出碎片折为灵石' : `碎片 ${own.frags || 0}/${need}${own.unlocked ? '（升级需求）' : '（解锁需求）'}`}</div>
      ${own.unlocked ? `<div class="ru-art-eff">${this.effText(a, own.level)}</div>` : ''}
      <div class="ru-art-desc">${a.desc}</div>
      ${owners.length ? `<div class="ru-art-sub">已装配：${owners.join('、')}</div>` : ''}
    </div>`;
  },

  /* ==========================================================
   * 6. 弟子页
   * ========================================================== */
  discipleHtml() {
    return `<div class="ru-sec">
      <div class="ru-sec-title">${this.icon('mdi-arm-flex', 15)} 弟子 <em>${(this.state.running || []).length}/${this.safe(() => this.g.dispatchLimit, 0)} 在派</em></div>
      ${RU_DATA.DISCIPLE_IDS.map(id => this.discipleCardHtml(id)).join('')}
    </div>`;
  },

  discipleCardHtml(id) {
    const d = RU_DATA.discipleById(id);
    const own = this.state.disciple[id] || { level: 1, status: 'idle', permPower: 0, deaths: 0 };
    const st = own.status || 'idle';
    const maxed = own.level >= RU_DATA.PLACEHOLDER.LEVEL_CAP;
    const cost = this.safe(() => this.g.upgradeCost(id), { stone: Infinity, mats: {} });
    const stoneOk = this.stone() >= cost.stone;
    const matRows = Object.keys(cost.mats || {}).map(m => ({
      id: m, name: this.itemName(m), need: cost.mats[m], own: this.bagQty(m)
    }));
    const matOk = matRows.every(x => x.own >= x.need);
    const reviveCost = this.safe(() => this.g.reviveCost(id), { stone: 0 });
    const wcap = this.safe(() => Math.round(this.g.weightCap(id)), 0);
    const power = this.safe(() => Math.round(this.g.disciplePower(id)), 0);
    const loadout = this.state.loadout[id] || [];
    const slots = this.safe(() => this.g.artifactSlots, 0);

    return `<div class="ru-card ru-dcard">
      <div class="ru-row">
        <span class="ru-dname">${d.name}<i class="gb-tag">${d.roleName}</i></span>
        <span class="ru-st ru-st-${st}">${this.statusName(st)}</span>
      </div>
      <div class="ru-info">
        <div class="ru-info-row"><span>境界</span><b>${this.safe(() => this.g.realmName(id), '')} · ${own.level}/${RU_DATA.PLACEHOLDER.LEVEL_CAP} 级</b></div>
        <div class="ru-info-row"><span>战力</span><b>${power}${own.permPower ? '（永久 +' + own.permPower + '）' : ''}</b></div>
        <div class="ru-info-row"><span>负重上限</span><b>${wcap}</b></div>
        <div class="ru-info-row"><span>阵亡次数</span><b>${own.deaths || 0}</b></div>
        <div class="ru-info-row"><span>升级材料</span><b>${this.itemName(d.specialMat)} ×${this.bagQty(d.specialMat)}</b></div>
      </div>
      <div class="ru-desc">${d.desc}</div>

      <div class="ru-sub-title">${this.T('artifactSlots')} <em>${loadout.length}/${slots}</em></div>
      ${this.loadoutPickerHtml(id)}

      <div class="ru-dbtns">
        ${st === 'needRevive'
          ? `<button class="gb-btn error" data-revive="${id}" ${this.stone() >= reviveCost.stone ? '' : 'disabled'}>${this.icon('mdi-skull', 14)} ${this.T('revive')}（${this.fmt(reviveCost.stone)}）</button>`
          : `<button class="gb-btn primary" data-upg="${id}" ${(!maxed && stoneOk && matOk) ? '' : 'disabled'}>${this.icon('mdi-arrow-up', 14)} ${maxed ? '已至 ' + RU_DATA.PLACEHOLDER.LEVEL_CAP + ' 级' : this.T('upgrade')}</button>`}
      </div>
      ${maxed ? '' : `<div class="ru-cost">需 ${this.fmt(cost.stone)} ${this.T('stone')}${matRows.map(x => `、${x.name} ×${x.need}（有 ${x.own}）`).join('')}</div>`}
    </div>`;
  },

  /* ==========================================================
   * 7. 草稿（派遣配置）读写
   * ========================================================== */
  draftOf(id) {
    if (!this.draft[id]) {
      const p = (this.state.presets && this.state.presets[id]) || {};
      const ruin = RU_DATA.ruinById(p.ruinId) || RU_DATA.RUINS[0];
      const maxDur = this.maxDurOf(id, ruin);
      let dur = p.durationSec || 3600;
      dur = Math.max(60, Math.min(dur, maxDur));
      const retreat = (p.retreat && p.retreat.length)
        ? p.retreat.map(r => ({ type: r.type || 'none', value: (r.value === undefined ? null : r.value) }))
        : [{ type: 'none', value: null }];
      this.draft[id] = { ruinId: ruin.id, durationSec: dur, retreat: retreat };
    }
    return this.draft[id];
  },
  maxDurOf(id, ruinOrId) { return this.safe(() => this.g.maxDuration(id, ruinOrId) * 60, 3600); },

  setDraft(id, patch) {
    const dr = this.draftOf(id);
    Object.assign(dr, patch);
    const ruin = RU_DATA.ruinById(dr.ruinId) || RU_DATA.RUINS[0];
    dr.ruinId = ruin.id;
    dr.durationSec = Math.max(60, Math.min(dr.durationSec, this.maxDurOf(id, ruin)));
    this.saveDraft(id);
    this.render();
  },
  saveDraft(id) {
    const dr = this.draftOf(id);
    RU_RT.act('setPreset', {
      discipleId: id, ruinId: dr.ruinId, durationSec: dr.durationSec,
      artifactIds: (this.state.loadout[id] || []).slice(), retreat: dr.retreat
    });
    this.save();
  },

  /* ==========================================================
   * 8. 交互
   * ========================================================== */
  onClick(e) {
    let n;
    if ((n = e.target.closest('[data-tab]'))) { this.setTab(n.getAttribute('data-tab')); return; }
    if ((n = e.target.closest('[data-disc]'))) { this.sel = n.getAttribute('data-disc'); this.render(); return; }
    if ((n = e.target.closest('[data-dur]'))) { this.setDraft(this.sel, { durationSec: +n.getAttribute('data-dur') }); return; }
    if ((n = e.target.closest('[data-rt-add]'))) { this.addRetreat(); return; }
    if ((n = e.target.closest('[data-rt-del]'))) { this.delRetreat(+n.getAttribute('data-rt-del')); return; }
    if ((n = e.target.closest('[data-rt-up]'))) { this.moveRetreat(+n.getAttribute('data-rt-up'), -1); return; }
    if ((n = e.target.closest('[data-rt-down]'))) { this.moveRetreat(+n.getAttribute('data-rt-down'), 1); return; }
    if ((n = e.target.closest('[data-act="dispatch"]'))) { this.doDispatch(); return; }
    if ((n = e.target.closest('[data-collect-all]'))) { this.collectAll(); return; }
    if ((n = e.target.closest('[data-collect]'))) { this.collect(n.getAttribute('data-collect')); return; }
    if ((n = e.target.closest('[data-log]'))) { this.toggleLog(n.getAttribute('data-log')); return; }
    if ((n = e.target.closest('[data-sellall]'))) { this.sell(n.getAttribute('data-sellall'), 0); return; }
    if ((n = e.target.closest('[data-sell]'))) { this.sell(n.getAttribute('data-sell'), +n.getAttribute('data-qty') || 1); return; }
    if ((n = e.target.closest('[data-sellbelow]'))) { this.sellBelow(n.getAttribute('data-sellbelow')); return; }
    if ((n = e.target.closest('[data-upg]'))) { this.upgrade(n.getAttribute('data-upg')); return; }
    if ((n = e.target.closest('[data-revive]'))) { this.revive(n.getAttribute('data-revive')); return; }
    if ((n = e.target.closest('[data-eq]'))) { this.toggleEquip(n.getAttribute('data-eq'), n.getAttribute('data-art')); return; }
  },

  onChange(e) {
    const t = e.target;
    if (t.hasAttribute('data-ruin-sel')) { this.setDraft(this.sel, { ruinId: +t.value }); return; }
    if (t.hasAttribute('data-rt-type')) {
      const i = +t.getAttribute('data-rt-type');
      const def = RU_DATA.RETREAT.find(r => r.type === t.value) || RU_DATA.RETREAT[0];
      this.setRetreat(i, { type: t.value, value: (def.type === 'none' || def.type === 'safeBoxFull') ? null : def.def });
      return;
    }
    if (t.hasAttribute('data-rt-val')) {
      const i = +t.getAttribute('data-rt-val');
      const v = t.tagName === 'SELECT' ? t.value : (+t.value || 0);
      this.setRetreat(i, { value: v });
      return;
    }
  },

  /* ---------- 派遣 ---------- */
  dispatchGate(id, ruin, status) {
    const reasons = [];
    if (status !== 'idle') reasons.push('弟子状态：' + this.statusName(status));
    const limit = this.safe(() => this.g.dispatchLimit, 0);
    if ((this.state.running || []).length >= limit) reasons.push('同时在派已达上限（' + limit + '）');
    const cost = ruin.cost || 0;
    if (this.stone() < cost) reasons.push('灵石不足：需 ' + this.fmt(cost) + '，现有 ' + this.fmt(this.stone()));
    return { ok: reasons.length === 0, reasons: reasons };
  },

  doDispatch() {
    const id = this.sel;
    const dr = this.draftOf(id);
    const ruin = RU_DATA.ruinById(dr.ruinId) || RU_DATA.RUINS[0];
    const status = this.safe(() => this.g.discipleStatus(id), 'idle');
    const gate = this.dispatchGate(id, ruin, status);
    if (!gate.ok) { this.toast(gate.reasons[0]); return; }
    const res = RU_RT.act('dispatch', {
      discipleId: id, ruinId: ruin.id, durationSec: dr.durationSec,
      artifactIds: this.state.loadout[id] || [], retreat: dr.retreat
    });
    if (res && res.ok) {
      this.saveDraft(id);
      this.toast(this.discName(id) + ' 已启程前往' + this.ruinName(ruin) + '，' + this.durText(dr.durationSec) + '后归来');
      this.save();
      this.render();
    } else {
      this.toast(this.reasonText(res && res.reason));
    }
  },

  /* ---------- 撤离条件列表 ---------- */
  addRetreat() {
    const dr = this.draftOf(this.sel);
    if (dr.retreat.length >= 8) { this.toast('撤离条件最多 8 条'); return; }
    dr.retreat.push({ type: 'bagValue', value: null });
    this.saveDraft(this.sel);
    this.render();
  },
  delRetreat(i) {
    const dr = this.draftOf(this.sel);
    dr.retreat.splice(i, 1);
    if (!dr.retreat.length) dr.retreat.push({ type: 'none', value: null });
    this.saveDraft(this.sel);
    this.render();
  },
  moveRetreat(i, dir) {
    const dr = this.draftOf(this.sel);
    const j = i + dir;
    if (j < 0 || j >= dr.retreat.length) return;
    const tmp = dr.retreat[i];
    dr.retreat[i] = dr.retreat[j];
    dr.retreat[j] = tmp;
    this.saveDraft(this.sel);
    this.render();
  },
  setRetreat(i, patch) {
    const dr = this.draftOf(this.sel);
    if (!dr.retreat[i]) return;
    Object.assign(dr.retreat[i], patch);
    this.saveDraft(this.sel);
    this.render();
  },

  /* ---------- 归来结算 ---------- */
  toggleLog(recordId) {
    this.logOpen[recordId] = !this.logOpen[recordId];
    this.render();
  },
  collect(recordId) {
    const res = RU_RT.act('collect', { recordId: recordId });
    if (res && res.ok) {
      this.toast('已入库：' + (res.gained.bag.length ? res.gained.bag.length + ' 种物品' : '无物品') + '，灵石 +' + this.fmt(res.gained.stone || 0));
      delete this.logOpen[recordId];
      this.save();
      this.render();
    } else this.toast(this.reasonText(res && res.reason));
  },
  collectAll() {
    const ids = (this.state.returned || []).map(r => r.id);
    let items = 0, stone = 0;
    ids.forEach(id => {
      const res = RU_RT.act('collect', { recordId: id });
      if (res && res.ok) { items += res.gained.bag.length; stone += (res.gained.stone || 0); delete this.logOpen[id]; }
    });
    this.toast('全部入库：' + items + ' 种物品，灵石 +' + this.fmt(stone));
    this.save();
    this.render();
  },

  /* ---------- 仓售 ---------- */
  sell(itemId, qty) {
    const res = RU_RT.act('sell', { itemId: itemId, qty: qty || undefined });
    if (res && res.ok) { this.toast('售出 ' + res.qty + ' 件，灵石 +' + this.fmt(res.gain)); this.save(); this.render(); }
    else this.toast(this.reasonText(res && res.reason));
  },
  sellBelow(q) {
    const res = RU_RT.act('sellBelow', { maxQuality: q });
    if (res && res.ok) { this.toast('售出 ' + res.sold + ' 件，灵石 +' + this.fmt(res.gain)); this.save(); this.render(); }
    else this.toast(this.reasonText(res && res.reason));
  },

  /* ---------- 弟子 ---------- */
  upgrade(id) {
    const res = RU_RT.act('upgradeDisciple', { discipleId: id });
    if (res && res.ok) { this.toast(res.note || '境界提升'); this.save(); this.render(); }
    else this.toast(this.reasonText(res && res.reason));
  },
  revive(id) {
    const res = RU_RT.act('reviveDisciple', { discipleId: id });
    if (res && res.ok) { this.toast(res.note || '肉身重塑完成'); this.save(); this.render(); }
    else this.toast(this.reasonText(res && res.reason));
  },
  toggleEquip(id, aid) {
    const cur = (this.state.loadout[id] || []).slice();
    const i = cur.indexOf(aid);
    if (i >= 0) cur.splice(i, 1);
    else {
      const slots = this.safe(() => this.g.artifactSlots, 0);
      if (cur.length >= slots) { this.toast('神器栏已满（' + slots + ' 位）'); return; }
      cur.push(aid);
    }
    RU_RT.act('setLoadout', { discipleId: id, artifactIds: cur });
    this.saveDraft(id);
    this.save();
    this.render();
  },

  /* ==========================================================
   * 9. 存档（独立键）
   * ========================================================== */
  loadSave() { try { const r = localStorage.getItem(this.SAVE_KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } },
  freshState() {
    if (typeof RU_STORE !== 'undefined' && RU_STORE.defaults) return RU_STORE.defaults();
    return { stat: {}, unlock: {}, currencyVals: {}, upgradeLevels: {}, system: {} };
  },
  load() {
    const saved = this.loadSave();
    RU_RT.init(this.freshState());
    if (saved) RU_RT.loadGame(saved);
    RU_RT.afterChange();
    this.draft = {};
  },
  save() {
    if (!RU_RT.ready) return;
    try {
      const obj = RU_RT.saveGame ? RU_RT.saveGame() : {};
      obj.savedAt = Date.now();
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(obj));
    } catch (e) { /* ignore */ }
  }
};
if (typeof module !== 'undefined') module.exports = { GB_RU_VIEW };

/* ===== 挂接统一地基：由注册表统一驱动 load / save（tick 已交给全局循环） ===== */
if (typeof GB_MODULES !== 'undefined') GB_MODULES.attachView('ruin', GB_RU_VIEW);
