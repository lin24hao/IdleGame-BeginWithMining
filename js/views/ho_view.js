/* ============================================================
 * ho_view.js ——「降妖（horde）」主视图：忠实复刻 gooboo Horde.vue
 *
 * 布局（XL 四列，随解锁动态变化，与 gooboo 一致）：
 *   tabs：降妖 | 传承?(hordeHeirlooms.see) | 战令?(hordeClassesSubfeature.see)
 *         | 轮回?(hordePrestige.use)
 *   降妖页：4 列 ── 自己(player-status) | 敌人(enemy-status)
 *         | 装备(equip-list，需 subfeature0 && hordeEquipment.use)+战阶技能(skill-tree，subfeature1)
 *         | 道法升级(upgrade-list 常规)
 *   轮回页：3 列 ── 轮回情报 | 传承/战利库 | 轮回道法
 * 本模块自带独立存档('xzdz_gooboo_horde_save')与独立 1s 循环，互不干扰。
 * ============================================================ */
var GB_HO_VIEW = {
  tab: 'horde',
  el: null,
  SAVE_KEY: 'xzdz_gooboo_horde_save_v2',
  name: '降妖',
  _loop: null,

  /* ---------- 文案 ---------- */
  T(n) { const x = HO_TEXT && HO_TEXT.TERMS; return (x && x[n]) || n; },
  curName(k) { const x = HO_TEXT && HO_TEXT.CURRENCY; return (x && x[k]) || String(k).replace(/^horde_/, ''); },
  itemName(k) { const x = HO_TEXT && HO_TEXT.ITEM; return (x && x[k]) || k; },
  clsName(k) { const x = HO_TEXT && HO_TEXT.CLASS; return (x && x[k]) || k; },
  areaName(k) { const x = HO_TEXT && HO_TEXT.AREA; return (x && x[k]) || k; },
  enemyName(k) { const x = HO_TEXT && HO_TEXT.ENEMY; const base = String(k).split('_')[0]; return (x && x[base]) || k; },
  bossName(k) { const x = HO_TEXT && HO_TEXT.BOSS; return (x && x[k]) || k; },
  upgName(id) { const x = HO_TEXT; const kk = String(id).replace(/^horde_/, ''); const sec = x.UPGRADE || {}; const sec2 = x.UPGRADE2 || {}; const pre = x.PREMIUM || {}; const prest = x.PRESTIGE || {}; return (sec[kk] || sec2[kk] || pre[kk] || prest[kk]) || kk; },

  /* ---------- 便捷访问 ---------- */
  get state() { return HO_RT.state; },
  G(name) { try { return HO_RT.getters && HO_RT.getters[name]; } catch (e) { return null; } },
  mget(name) { try { return HO_MULT.get(name); } catch (e) { return 0; } },
  mgetBase(name, base, mult) { try { return HO_MULT.get(name, base, mult); } catch (e) { return 0; } },
  icon(n, s, c) { return GB_ICON.icon(n, s || 18, c || ''); },
  safe(fn, d) { try { const v = fn(); return (v === undefined || v === null) ? d : v; } catch (e) { return d; } },
  fmt(v) { return (window.formatNum ? formatNum(v) : Math.round(v)); },
  fmtp(v) { if (v === 0) return '0%'; if (v === 1) return '100%'; return this.fmt(v * 100) + '%'; },
  fmtTime(s) { s = Math.max(0, Math.floor(s || 0)); const h = Math.floor(s / 3600); const m = Math.floor(s / 60) % 60; const sec = s % 60; const p = (n) => String(n).padStart(2, '0'); return h > 0 ? h + ':' + p(m) + ':' + p(sec) : m + ':' + p(sec); },

  /* ---------- 解锁 / 门控 ---------- */
  unlocked(id) { return HO_UNLOCK.isUnlocked(id); },
  visible(id) { return HO_UNLOCK.isVisible(id); },
  subfeature() { return this.safe(() => HO_RT.state.system.features.horde.currentSubfeature, 0); },
  canUseEquipment() { return this.subfeature() === 0 && this.unlocked('hordeEquipment'); },
  canPrestige() { return this.unlocked('hordePrestige'); },
  canSeeHeirlooms() { return this.visible('hordeHeirlooms'); },
  canSeeBattlePass() { return this.visible('hordeClassesSubfeature'); },

  /* ---------- 生命周期 ---------- */
  mount(root) {
    if (this.el === root) { this.startLoop(); this.render(); return; }
    if (this.el) this.unload();
    this.el = root;
    // 统一地基：模块已在启动时 load，mount 不重复载入（避免丢弃未存档进度）
    if (!HO_RT.ready) this.load();
    this.startLoop();
    root.innerHTML = `
      <div class="gb-tabs" id="ho-tabs"></div>
      <div class="flex1 scroll-container" id="ho-content"></div>`;
    root.addEventListener('click', (e) => this.onClick(e));
    this.render();
  },
  unload() {
    if (this.el) this.save();
    this.stopLoop();
    this.el = null;
  },
  setTab(t) { this.tab = t; this.render(); },

  /* ---------- 事件 ---------- */
  onClick(e) {
    const el = e.target.closest('[data-hact]');
    if (!el) return;
    const [tag, val] = el.getAttribute('data-hact').split(':');
    if (tag === 'tab') { this.setTab(val); return; }
    if (tag === 'buy') { if (HO_UPG.buy(val)) { HO_RT.act('updatePlayerCache'); this.save(); this.render(); } return; }
    if (tag === 'eqbuy') { this.buyEq(val); this.save(); this.render(); return; }
    if (tag === 'eqtoggle') { this.toggleEq(val); this.save(); this.render(); return; }
    if (tag === 'eqequip') { this.equipItem(val); this.save(); this.render(); return; }
    if (tag === 'equnequip') { this.unequipItem(val); this.save(); this.render(); return; }
    if (tag === 'equpg') { this.upgradeItem(val); this.save(); this.render(); return; }
    if (tag === 'zone') { this.zoneAct(val); this.render(); return; }
    if (tag === 'rename') { this.renamePlayer(); return; }
    if (tag === 'fightBoss') { this.fightBoss(); return; }
    if (tag === 'taunt') { const st = this.state; st.taunt = !st.taunt; this.render(); return; }
    if (tag === 'raid') { try { HO_RT.act('enterRaid'); } catch (e) {} this.render(); return; }
  },
  zoneAct(a) {
    const st = this.state; if (!st) return;
    const cur = st.zone || 1;
    const maxZ = this.safe(() => HO_STAT.get('horde_maxZone'), st.zone) || st.zone;
    let target = cur;
    if (a === 'min') target = 1;
    else if (a === 'prev') target = Math.max(1, cur - 1);
    else if (a === 'next') target = Math.min(cur + 1, maxZ);
    else if (a === 'max') target = maxZ;
    try { HO_RT.act('updateZone', target); } catch (e) {}
  },
  fightBoss() {
    const st = this.state; if (!st) return;
    if (st.bossAvailable && !st.bossFight) { try { HO_RT.act('fightBoss'); } catch (e) {} }
    else if (st.bossFight) { try { HO_RT.act('stopFightBoss'); } catch (e) {} }
    this.render();
  },
  buyEq(name) {
    const st = this.state; const it = st.items && st.items[name]; if (!it) return;
    try { HO_RT.act('buyItem', { name }); } catch (e) {}
  },
  toggleEq(name) {
    const st = this.state; const it = st.items && st.items[name]; if (!it) return;
    it.equipped = !it.equipped;
    try { HO_RT.act('updatePlayerCache'); } catch (e) {}
  },
  equippableMax() { try { return HO_MULT.get('hordeMaxEquipment'); } catch (e) { return 1; } },
  itemsEquipped() { try { return HO_RT.getters && HO_RT.getters.itemsEquipped; } catch (e) { return 0; } },
  equipItem(name) { try { HO_RT.act('equipItem', name); } catch (e) {} },
  unequipItem(name) { try { HO_RT.act('unequipItem', name); } catch (e) {} },
  upgradeItem(name) { try { HO_RT.act('upgradeItem', name); } catch (e) {} },
  /* 装备属性名：hordeAttack → SKILL/STAT 表 → 中文；未命中回落显示名 */
  /* 玩家名字：默认「主角」，可点击改名并存档 */
  playerName() {
    const v = this.safe(() => HO_RT.state && HO_RT.state.playerName, null);
    return (typeof v === 'string' && v.trim()) ? v.trim() : this.T('player');
  },
  renamePlayer() {
    const cur = this.playerName();
    const nxt = (typeof window.prompt === 'function') ? window.prompt(this.T('rename_prompt') || '请输入新名字：', cur) : null;
    if (nxt === null) return;
    const nm = String(nxt).trim() || this.T('player');
    try { if (HO_RT.state) HO_RT.state.playerName = nm; } catch (e) {}
    this.save();
    this.render();
  },
  statName(k) {
    const base = String(k).replace(/^horde_?/, '');
    const x = HO_TEXT;
    // 兼容大小写：hordeAttack → Attack / attack
    const lowered = base.charAt(0).toLowerCase() + base.slice(1);
    if (x.STAT && (x.STAT[base] || x.STAT[lowered])) return x.STAT[base] || x.STAT[lowered];
    if (x.SKILL) {
      const sk = x.SKILL[base] || x.SKILL[lowered] || x.SKILL[base.replace(/_N$/, '')];
      if (sk) return sk;
    }
    return lowered;
  },
  statVal(elem, lvl) {
    const v = (typeof elem.value === 'function') ? elem.value(lvl) : elem.value;
    if (elem.type === 'mult') return this.fmt(v) + 'x';
    if (elem.type === 'base' || elem.type === 'bonus') return this.fmt(v);
    return this.fmt(v);
  },
  /* 效果名解析：currency 前缀货币获取/容量 → 对应中文；其余走 statName */
  effName(k) {
    const s = String(k);
    const direct = {
      'currencyHordeBoneGain': '妖骨获取',
      'currencyHordeBoneCap': '妖骨容量',
      'currencyHordeMonsterPartGain': '妖魄获取',
      'currencyHordeMonsterPartCap': '妖魄容量'
    };
    if (direct[s]) return direct[s];
    let base = s.replace(/^currencyHorde/i, '').replace(/^currency/i, '');
    let tail = '';
    if (/Gain$/i.test(base)) { tail = '获取'; base = base.replace(/Gain$/i, ''); }
    else if (/Cap$/i.test(base)) { tail = '容量'; base = base.replace(/Cap$/i, ''); }
    else if (/Max$/i.test(base)) { tail = '栏位'; base = base.replace(/Max$/i, ''); }
    base = base.replace(/^Horde/i, '');
    const decap = base.charAt(0).toLowerCase() + base.slice(1);
    const cur = HO_TEXT.CURRENCY && HO_TEXT.CURRENCY['horde_' + decap];
    if (cur) return cur + tail;
    return this.statName(base) + tail;
  },
  /* 道法效果描述：显示购买第 showLvl 级后的效果数值 */
  upgDesc(id) {
    const d = HO_UPG.defs[id]; if (!d) return '';
    const effs = d.effect || [];
    if (!effs.length) return '';
    const lvl = HO_UPG.levels[id] || 0;
    const cap = this.safe(() => HO_UPG.cap(id), Infinity);
    const showLvl = (isFinite(cap) && lvl >= cap) ? lvl : lvl + 1;
    return effs.map(eff => {
      let v; try { v = (typeof eff.value === 'function') ? eff.value(showLvl) : eff.value; } catch (e) { v = 0; }
      const nm = this.effName(eff.name);
      if (eff.type === 'mult') return `${this.fmt(v)}x ${nm}`;
      return (v >= 0 ? '+' : '') + this.fmt(v) + ' ' + nm;
    }).join('，');
  },

  /* ---------- 存档 / 循环 ---------- */
  load() {
    try { HO_BOOT({}); } catch (e) {}
    try {
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (raw) { const saved = JSON.parse(raw); if (saved && typeof saved === 'object') { try { HO_RT.init(saved); } catch (e) {} } }
    } catch (e) { /* ignore */ }
    this._settle();
    // gooboo 开局即携带基础灵械 → 装备四列自始可见（hordeEquipment.use）
    try { if (!HO_UNLOCK.isVisualLocked && !HO_UNLOCK.isUnlocked('hordeEquipment')) HO_UNLOCK.unlock('hordeEquipment'); } catch (e) {}
  },
  /* 开局结算：按 hinit 顺序跑活引擎，回满血量 / 立刷首敌 / maxZone≥1 */
  _settle() {
    const st = this.state; if (!st) return;
    const errs = [undefined, null, NaN];
    const act = (a, p) => { try { HO_RT.act(a, p); } catch (e) {} };
    try {
      if (!st.zone || st.zone < 1 || errs.indexOf(st.zone) >= 0) st.zone = 1;
      HO_STAT.increaseTo('horde_maxZone', Math.max(1, st.zone));
      // 与 hinit 相同顺序：缓存玩家 → 缓存敌人 → 刷新玩家实时状态（写活血量/战斗标识）
      act('updatePlayerCache');
      act('updateEnemyCache');
      act('updatePlayerStats');
      if (!st.enemy || errs.indexOf(st.player && st.player.health) >= 0 || !(st.player && st.player.health > 0)) {
        if (st.respawn) st.respawn = 0;
        st.enemyTimer = Math.max(st.enemyTimer || 0, 10);
        act('updateEnemyStats');
      }
      if (!(st.player && st.player.health > 0)) {
        const maxH = (st.cachePlayerStats && st.cachePlayerStats.health) || 0;
        if (maxH > 0 && !st.respawn) st.player.health = maxH;
      }
    } catch (e) { /* ignore */ }
  },
  save() { try { localStorage.setItem(this.SAVE_KEY, JSON.stringify(HO_RT.saveGame ? HO_RT.saveGame() : HO_RT.state)); } catch (e) {} },
  startLoop() {
    if (this._loop) return;
    // 记录上一帧是否处于复活中：若从「复活中」变为「非复活中」，需重建血条（rv→hp）
    let prevRespawning = !!(this.state && this.state.respawn > 0);
    this._loop = setInterval(() => {
      const st = this.state || {};
      const nowRespawning = !!(st.respawn > 0);
      if (prevRespawning && !nowRespawning) this.render();
      prevRespawning = nowRespawning;
      if ((this._tick || 0) % 30 === 0) this.save();
      this._tick = (this._tick || 0) + 1;
      this._patch();
    }, 1000);
  },
  stopLoop() { if (this._loop) { clearInterval(this._loop); this._loop = null; } },

  /* 循环补丁：只更新数值与条宽，避免整段重建破坏 CSS 过渡（血条缓动） */
  _patch() {
    const el = this.el; if (!el) return;
    const st = this.state || {};
    const ps = st.player || {}; const cap = st.cachePlayerStats || {};
    const e = st.enemy || {};
    const combo = st.combo || 0;
    const cr = this.safe(() => HO_RT.getters && HO_RT.getters.comboRequired, 0) || 0;
    // #7 复活条
    const rvRow = el.querySelector('[data-bar="rv"]');
    if (st.respawn > 0) {
      if (rvRow) {
        const mr = st.maxRespawn || st.respawn;
        const pct = mr ? Math.max(0, Math.min(100, 100 * (1 - st.respawn / mr))) : 0;
        const fill = rvRow.querySelector('.ho-barstat-fill');
        const num = rvRow.querySelector('.ho-bar-num');
        if (fill) fill.style.width = pct + '%';
        if (num) num.textContent = this.fmtTime(st.respawn);
      }
      // 玩家名字在复活时也不覆盖血条
    }
    const barDefs = [
      ['hp', ps.health, cap.health],
      ['en', ps.energy, cap.energy],
      ['ma', ps.mana, cap.mana],
      ['ehp', e.health, e.maxHealth]
    ];
    barDefs.forEach(([cls, cur, max]) => {
      const row = el.querySelector('[data-bar="' + cls + '"]');
      if (!row) return;
      const fill = row.querySelector('.ho-barstat-fill');
      const num = row.querySelector('.ho-bar-num');
      const pct = max ? Math.max(0, Math.min(100, 100 * (cur || 0) / max)) : 0;
      if (fill) fill.style.width = pct + '%';
      if (num) {
        if (cls === 'ehp' && !st.enemy) num.textContent = '(敌未现 · 蓄势中)';
        else num.textContent = this.fmt(cur || 0) + ' / ' + this.fmt(max || 0);
      }
    });
    // 战斗连斩徽标（敌卡标题 #combo+1）；enemy 存在但 name 尚未生成时跳过，避免写成 "null"
    const eTitle = el.querySelector('[data-etitle]');
    if (eTitle && st.enemy && st.enemy.name) eTitle.textContent = this.enemyName(st.enemy.name) + ' #' + (combo + 1);
    // 玩家/敌人状态徽标
    const statMap = {
      atk: () => this.fmt(cap.attack),
      crit: () => this.fmt(this.pctNum(cap.critChance)),
      str: () => this.fmt(cap.strength),
      int: () => this.fmt(cap.intelligence),
      hst: () => this.fmt(cap.haste),
      eatk: () => e && e.attack > 0 ? this.fmt(e.attack) : '',
      def: () => e && e.defense > 0 ? this.fmtp(e.defense) : '',
      div: () => e && e.divisionShield > 0 ? this.fmt(e.divisionShield) : '',
      ft: () => st.bossFight && st.fightTime > 0 ? this.fmt(st.fightTime) : ''
    };
    el.querySelectorAll('[data-stat]').forEach(s => {
      const fn = statMap[s.getAttribute('data-stat')];
      if (fn) { const v = fn(); if (v !== '' && v !== undefined) s.textContent = v; }
    });
    // 强战 / 妖王 chip
    const tt = el.querySelector('.ho-taunt-txt');
    if (tt) tt.innerHTML = this.tauntBody(st);
    const bt = el.querySelector('.ho-boss-txt');
    if (bt) bt.innerHTML = this.bossBody(st, combo, cr);
    const bp = el.querySelector('.ho-bar-chip.boss');
    if (bp) bp.className = 'ho-bar-chip boss' + (st.bossAvailable && !st.bossFight ? ' ready' : '');
    // 货币数值
    el.querySelectorAll('[data-cur]').forEach(c => {
      const n = c.querySelector('.ho-cur-num'); if (!n) return;
      const k = c.getAttribute('data-cur');
      const v = HO_CUR.value(k); const cp = HO_CUR.cap(k);
      n.textContent = this.fmt(v) + (isFinite(cp) ? ' / ' + this.fmt(cp) : '');
    });
  },

  /* ---------- 渲染骨架 ---------- */
  render() {
    const el = this.el; if (!el) return;
    if (!HO_RT.ready) { try { HO_RT.init({}); } catch (e) {} }
    const tabs = el.querySelector('#ho-tabs');
    const content = el.querySelector('#ho-content');
    if (!tabs || !content) return;
    const t = this.getTabs();
    if (!t.some(x => x.id === this.tab)) this.tab = t[0].id;
    tabs.innerHTML = t.map(x => `<button class="gb-tab ${x.id === this.tab ? 'active' : ''}" data-hact="tab:${x.id}">${this.icon(x.icon, 18)}${x.name}</button>`).join('');
    content.innerHTML = this.tab === 'heirlooms' ? this.renderHeirlooms() :
      this.tab === 'battlepass' ? this.renderBattlePass() :
      this.tab === 'souls' ? this.renderSouls() : this.renderBattle();
  },
  getTabs() {
    const t = [{ id: 'horde', name: '降妖', icon: 'mdi-account-group' }];
    if (this.canSeeHeirlooms()) t.push({ id: 'heirlooms', name: '传承', icon: 'mdi-necklace' });
    if (this.canSeeBattlePass()) t.push({ id: 'battlepass', name: '战令', icon: 'mdi-passport' });
    if (this.canPrestige()) t.push({ id: 'souls', name: '轮回', icon: 'mdi-ghost' });
    return t;
  },

  /* ============= 降妖页（4 列，XL 复刻） ============= */
  renderBattle() {
    const sf = this.subfeature();
    return `
      <div class="ho-cols">
        <div class="ho-col">
          <div class="ho-status">${this.renderStatus(sf)}</div>
        </div>
        <div class="ho-col">
          ${this.canUseEquipment() ? this.renderEquipList() : ''}
          ${sf === 1 ? this.renderSkillTree() : ''}
        </div>
        <div class="ho-col">${this.renderUpgradeList('regular')}</div>
      </div>`;
  },

  /* ---- 状态区：自己 / 敌人 两张卡 ---- */
  renderStatus(sf) {
    const st = this.state || {};
    const themeMod = 'lighten-2';
    const ps = st.player || {};
    const cap = st.cachePlayerStats || {};
    const pMax = cap.health || 1;
    const pHp = ps.health || 0;
    const eMax = this.safe(() => (st.enemy && st.enemy.maxHealth), 1) || 1;
    const eHp = this.safe(() => (st.enemy && st.enemy.health), 0) || 0;
    const zone = st.zone || 1;
    const maxZ = this.safe(() => HO_STAT.get('horde_maxZone'), zone) || zone;
    const combo = st.combo || 0;
    const cr = this.safe(() => HO_RT.getters && HO_RT.getters.comboRequired, 0) || 0;
    return `
      ${this.renderZoneRibbon(st, zone, maxZ)}
      ${this.renderBossBar(st, combo, cr)}
      <div class="ho-cols-2">
        <div>${this.renderPlayerCard(ps, cap)}</div>
        <div>${this.renderEnemyCard(st, eHp, eMax)}</div>
      </div>
      ${this.renderCurrencies(st)}`;
  },

  renderZoneRibbon(st, zone, maxZ) {
    const b = (ic, c, on) => `<button class="ho-zone-btn${on ? '' : ' disabled'}" data-hact="zone:${c}" ${on ? '' : 'disabled'}>${this.icon(ic, 20)}</button>`;
    return `<div class="ho-zonebar">
        ${b('mdi-skip-backward', 'min', zone > 1)}
        ${b('mdi-step-backward-2', 'prev', zone > 1)}
        ${b('mdi-step-backward', 'prev', zone > 1)}
        <span class="ho-zone-label">${this.T('zone')} ${zone}</span>
        ${b('mdi-step-forward', 'next', zone < maxZ)}
        ${b('mdi-step-forward-2', 'next', zone < maxZ)}
        ${b('mdi-skip-forward', 'max', zone < maxZ)}
      </div>`;
  },

  /* 妖物刷新时间 & 强战（taunt）开关 + 妖王连斩进度（gooboo Status.vue 复刻） */
  respawnTime() { return (typeof HORDE_ENEMY_RESPAWN_TIME !== 'undefined') ? HORDE_ENEMY_RESPAWN_TIME : 10; },
  respawnMax() { return (typeof HORDE_ENEMY_RESPAWN_MAX !== 'undefined') ? HORDE_ENEMY_RESPAWN_MAX : 5; },
  respawnMult(st) { return (st && st.skillLevel && st.skillLevel.sneak >= 1) ? 2 : 1; },
  tauntBody(st) {
    const rt = this.respawnTime();
    const rm = this.respawnMult(st);
    const et = st.enemyTimer || 0;
    if (et < rt) {
      return this.fmtTime(Math.ceil((rt - et) / rm));
    }
    const stored = Math.floor(et / rt);
    const full = et >= rt * this.respawnMax();
    return `${this.icon(full ? 'mdi-check-all' : 'mdi-check', 16)}${stored}`;
  },
  renderTauntChip(st) {
    const on = !!st.taunt;
    return `<button class="ho-bar-chip${on ? ' on' : ''}" data-hact="taunt" title="${this.T('taunt_title')}：${this.T('taunt_description')}">
        ${this.icon('mdi-emoticon-frown', 14)}<span class="ho-taunt-txt">${this.tauntBody(st)}</span>
      </button>`;
  },
  bossBody(st, combo, cr) {
    const bossFight = !!st.bossFight;
    const boss = !!st.bossAvailable;
    const isMax = (st.zone || 1) >= (this.safe(() => HO_STAT.get('horde_maxZone'), st.zone) || 1);
    if (!isMax) return this.T('cleared');          // 已破
    if (bossFight) return this.T('fighting');      // 鏖战
    if (boss) return this.icon('mdi-check', 16);   // 妖王可战
    return `<span class="ho-boss-txt2">${combo} / ${cr}</span>`; // 连斩进度
  },
  renderBossChip(st, combo, cr) {
    const boss = !!st.bossAvailable;
    const bossFight = !!st.bossFight;
    return `<button class="ho-bar-chip boss${boss && !bossFight ? ' ready' : ''}" data-hact="fightBoss">
        ${this.icon('mdi-skull-crossbones', 18)}<span class="ho-boss-txt">${this.bossBody(st, combo, cr)}</span>
      </button>`;
  },
  renderBossBar(st, combo, cr) {
    return `<div class="ho-bar">${this.renderTauntChip(st)}${this.renderBossChip(st, combo, cr)}</div>`;
  },

  renderPlayerCard(ps, cap) {
    const sub = this.subfeature() === 1;
    const name = this.playerName();
    const title = sub ? this.clsName(this.state.selectedClass || 'adventurer') : name;
    let bars = '';
    // #7 复活：respawn>0 时血条变为蓝色复活进度（gooboo：骷髅 + 复活时间，进度=100*(1-respawn/maxRespawn)）
    const rs = this.state && this.state.respawn;
    if (rs > 0) {
      const mr = (this.state && this.state.maxRespawn) || rs;
      const pct = mr ? Math.max(0, Math.min(100, 100 * (1 - rs / mr))) : 0;
      bars += `<div class="ho-barstat" data-bar="rv"><div class="ho-barstat-fill rv" style="width:${pct}%"></div><span>${this.icon('mdi-skull', 14)}<span class="ho-bar-num">${this.fmtTime(rs)}</span></span></div>`;
    } else {
      bars += this.bar('mdi-heart', 'green', ps.health, cap.health, 'hp');
    }
    if (cap.energy > 0) bars += this.bar('mdi-lightning-bolt', 'amber', ps.energy, cap.energy, 'en');
    if (cap.mana > 0) bars += this.bar('mdi-water', 'blue', ps.mana, cap.mana, 'ma');
    const subIdx = this.subfeature();
    // #2 血条下属性：剑(攻击) + 盾(守御) 优先，其余依次补
    let chips = this.statChip('mdi-sword', cap.attack, 'atk');
    if (cap.defense > 0) chips += this.statChip('mdi-shield', this.fmtp(cap.defense), 'pdef');
    if (subIdx === 0) {
      chips += this.statChip('mdi-crosshairs', this.pctNum(cap.critChance), 'crit')
        + this.icChip('mdi-arm-flex', cap.strength, 'str')
        + this.icChip('mdi-lightbulb', cap.intelligence, 'int')
        + this.icChip('mdi-timer-sand', cap.haste, 'hst');
    }
    return `<div class="ho-card">
        <div class="ho-card-title">${sub ? title : `<button type="button" class="ho-name" data-hact="rename" title="${this.T('rename_hint')}">${this.icon('mdi-pencil', 13)}${title}</button>`}</div>
        ${bars}
        <div class="ho-statrow">${chips}</div>
      </div>`;
  },
  /* 血/元/炁 状态条：data-bar 用于循环缓动定位，完整重建时过渡由 CSS 承担 */
  bar(ic, color, cur, max, cls) {
    const pct = max ? Math.max(0, Math.min(100, 100 * cur / max)) : 0;
    return `<div class="ho-barstat" data-bar="${cls}"><div class="ho-barstat-fill ${cls}" style="width:${pct}%"></div><span>${this.icon(ic, 14)}<span class="ho-bar-num">${this.fmt(cur)} / ${this.fmt(max)}</span></span></div>`;
  },
  pctNum(v) { return (v && v > 1) ? v : (v || 0); },

  renderEnemyCard(st, eHp, eMax) {
    const e = st.enemy;
    let eName;
    if (st.bossFight) eName = e && e.name ? this.bossName(e.name) || this.enemyName(e.name) : this.T('boss');
    else eName = e && e.name ? this.enemyName(e.name) : this.T('enemy');
    const isMax = (st.zone || 1) >= (this.safe(() => HO_STAT.get('horde_maxZone'), st.zone) || 1);
    const title = st.bossFight ? eName : `${eName} #${(st.combo || 0) + 1}`;
    const eHpEl = `<div class="ho-barstat" data-bar="ehp"><div class="ho-barstat-fill enm" style="width:${eHp > 0 ? Math.max(0, Math.min(100, 100 * eHp / (eMax || 1))) : 0}%"></div><span>${this.icon('mdi-heart', 14)}<span class="ho-bar-num">${e ? this.fmt(eHp) + ' / ' + this.fmt(eMax) : '(敌未现 · 蓄势中)'}</span></span></div>`;
    const defChip = (e && e.defense > 0) ? this.statChip('mdi-shield', this.fmtp(e.defense), 'def') : '';
    return `<div class="ho-card">
        <div class="ho-card-title">${st.bossFight ? title : `<span data-etitle>${title}</span>`}</div>
        ${eHpEl}
        ${e ? `<div class="ho-statrow">${this.statChip('mdi-sword-cross', e.attack, 'eatk')}${defChip}${e.divisionShield ? this.icChip('mdi-circle-half-full', e.divisionShield, 'div') : ''}${st.bossFight ? this.statChip('mdi-timer', st.fightTime, 'ft') : ''}</div>` : ''}
      </div>`;
  },

  statChip(ic, v, k) { return `<span class="ho-chip-mini">${this.icon(ic, 13)}<span data-stat="${k || ''}">${this.fmt(v)}</span></span>`; },
  icChip(ic, v, k) { return (v > 0) ? `<span class="ho-chip-mini">${this.icon(ic, 13)}<span data-stat="${k || ''}">${this.fmt(v)}</span></span>` : ''; },

  /* 资源栏：妖骨常显，其余按「累计产出>0」渐进解锁（对齐 gooboo Currency 的 stat>0 门控） */
  renderCurrencies(st) {
    const list = [];
    const order = this.subfeature() === 0
      ? ['horde_bone', 'horde_monsterPart', 'horde_corruptedFlesh', 'horde_mysticalShard', 'horde_soulCorrupted']
      : [];
    order.forEach(k => {
      if (k !== 'horde_bone' && !(HO_STAT.get(k) > 0)) return; // 未解锁的货币不显示
      const v = HO_CUR.value(k); const cap = HO_CUR.cap(k);
      const c = isFinite(cap) ? ' / ' + this.fmt(cap) : '';
      list.push(`<span class="ho-chip-mini cur" data-cur="${k}">${this.curName(k)} <span class="ho-cur-num">${this.fmt(v)}${c}</span></span>`);
    });
    return `<div class="ho-curs">${list.join('')}</div>`;
  },

  /* ---- 装备列（equip-list，gooboo 复刻：描述 + 装备/卸下/升级） ---- */
  maskLvl(n){ return n === Infinity ? '' : ' Lv.' + n; },
  upgCost(it, lvl) {
    const p = it.price ? it.price(lvl) : Infinity;
    const cap = HO_CUR.cap('horde_monsterPart');
    const has = HO_CUR.value('horde_monsterPart');
    const afford = has >= p;
    return { p, afford, has, cap };
  },
  renderEquipList() {
    const st = this.state || {};
    const items = st.items || {};
    const zone = st.zone || 1;
    const eqMax = this.equippableMax();
    const eqN = this.itemsEquipped();
    // 显示条件：仅展示已解锁（known 或本轮已寻获 found）的灵械；未解锁的整项隐藏
    const rows = Object.keys(items).filter(k => items[k] && (items[k].known || items[k].found))
      .map(k => this.equipRow(k, items[k], zone, eqMax, eqN)).join('');
    return `<div class="ho-panel">
        <div class="ho-panel-title">${this.T('equipment')} · 灵械（<span class="ho-soft">${eqN}/${eqMax}</span>）</div>
        <div class="ho-eq">${rows || '<div class="empty-hint">尚未寻得任何灵械</div>'}</div>
      </div>`;
  },
  equipRow(k, it, zone, eqMax, eqN) {
    const lvl = it.level || 0;
    const found = !!it.found;
    const equipped = !!it.equipped;
    const name = this.itemName(k);
    // 寻获条件：未寻获时，若当前妖界未达，显示「妖界 N+」；否则显示寻获几率
    let findHTML = '';
    if (!found) {
      if (zone < it.findZone) findHTML = `<span class="ho-soft">妖界 ${it.findZone}+</span>`;
      else {
        const fc = it.findChance || 0.001;
        findHTML = `<span class="ho-soft">寻获 ${this.fmt(fc * 100)}%</span>`;
      }
    }
    // 词条描述
    let statsHTML = '';
    const statsArr = [];
    try { const s = it.stats ? it.stats(lvl, it.stacks) : []; (s || []).forEach(x => statsArr.push(x)); } catch (e) {}
    const maxed = it.cap !== null && it.cap !== undefined && it.cap > 1 && lvl >= it.cap;
    const priceInfo = this.upgCost(it, lvl);
    const canUpg = found && !maxed && priceInfo.p >= 0;
    const itemsFull = eqN >= eqMax;
    statsHTML = statsArr.map(el => {
      const nm = this.statName(el.name);
      const pos = el.isPositive !== false;
      const txt = el.type === 'tag' ? this.statName(el.name) : `${pos ? '+' : ''}${this.statVal(el, lvl)} ${nm}`;
      return `<div class="ho-statline${pos ? ' pos' : ' neg'}"><span class="ho-dot"></span>${txt}</div>`;
    }).join('');
    const buttons = [];
    if (maxed) buttons.push(`<span class="ho-max-tag">${this.T('maxed')}</span>`);
    else if (found) {
      buttons.push(`<button class="ho-upgbtn ${priceInfo.afford ? '' : 'disabled'}" data-hact="equpg:${k}" ${priceInfo.afford ? '' : 'disabled'}>${this.icon('mdi-chevron-double-up', 14)}${this.fmt(priceInfo.p)} <span class="ho-soft">妖魄</span></button>`);
    }
    buttons.push(!found
      ? `<span class="ho-soft">${findHTML}</span>`
      : (equipped
        ? `<button class="ho-eqbtn unequip" data-hact="equnequip:${k}">${this.T('unequip')}</button>`
        : `<button class="ho-eqbtn equip ${itemsFull ? 'disabled' : ''}" data-hact="eqequip:${k}" ${itemsFull ? 'disabled' : ''}>${this.T('equip')}</button>`));
    return `<div class="ho-eqitem${equipped ? ' equipped' : ''}">
        <div class="ho-eqhead"><span class="ho-eqname">${this.icon(it.icon || 'mdi-sword', 16, it.activeColor || '')}${name}</span><span class="ho-eqlvl">Lv.${lvl}</span></div>
        ${found && statsHTML ? `<div class="ho-eqstats">${statsHTML}</div>` : ''}
        <div class="ho-eqbtns">${buttons.join('')}</div>
      </div>`;
  },

  renderSkillTree() {
    return `<div class="ho-panel"><div class="ho-panel-title">${this.T('equipment')} · 战阶</div><div class="empty-hint">战阶技能树（subfeature 1）</div></div>`;
  },

  /* ---- 道法升级列（upgrade-list） ---- */
  renderUpgradeList(type) {
    const ids = Object.keys(HO_UPG.defs || {}).filter(id => {
      try { return HO_UPG.defs[id].type === type && HO_UPG.isVisible(id); } catch (e) { return false; }
    });
    return `<div class="ho-panel upg">
        <div class="ho-panel-title">${this.T('upgrades')} · 道法</div>
        <div class="ho-upgs">${ids.length ? ids.map(id => this.upgRow(id)).join('') : '<div class="empty-hint">暂无可见道法</div>'}</div>
      </div>`;
  },
  upgRow(id) {
    const lvl = HO_UPG.levels[id] || 0;
    const cap = HO_UPG.cap(id);
    const maxed = lvl >= cap;
    const price = HO_UPG.price(id);
    const afford = HO_UPG.canAfford(id);
    const costStr = Object.keys(price || {}).map(pk => this.fmt(price[pk]) + ' ' + this.curName(pk)).join(' + ') || '免费';
    return `<div class="ho-upg${maxed ? ' maxed' : ''}">
        <div class="ho-upg-main"><span class="ho-upg-name">${this.upgName(id)}</span><span class="ho-upg-lvl">等级：${lvl}${isFinite(cap) ? '/' + cap : ''}</span></div>
        <div class="ho-upg-desc">${this.upgDesc(id)}</div>
        ${maxed ? '<span class="ho-max">满级</span>' : `<button class="ho-buy ${afford ? '' : 'disabled'}" data-hact="buy:${id}" ${afford ? '' : 'disabled'}>${costStr}</button>`}
      </div>`;
  },

  /* ============= 传承页 ============= */
  renderHeirlooms() {
    const st = this.state || {};
    const heirl = st.heirloom || {};
    const keys = Object.keys(heirl);
    return `<div class="ho-panel">
        <div class="ho-panel-title">${this.T('heirloom')} · 传承</div>
        <div class="ho-upgs">${keys.length ? keys.map(k => {
          const it = heirl[k]; const lvl = (it && it.level) || 0; const pct = (it && it.amountPercent) || 0;
          return `<div class="ho-upg"><div class="ho-upg-main"><span class="ho-upg-name">${k}</span><span class="ho-upg-lvl">Lv.${lvl}</span></div><span class="ho-soft">${this.fmtp(pct)}</span></div>`;
        }).join('') : '<div class="empty-hint">未寻得传承 · 探寻更高妖界</div>'}</div>
      </div>`;
  },

  /* ============= 战令页 ============= */
  renderBattlePass() {
    return `<div class="ho-panel"><div class="ho-panel-title">${this.T('battlePass')} · 战令</div><div class="empty-hint">征战妖界以解锁战令奖励。</div></div>`;
  },

  /* ============= 轮回页（声望重置，3 列） ============= */
  renderSouls() {
    const soul = HO_CUR.value('horde_soulCorrupted');
    return `<div class="ho-cols">
        <div class="ho-col"><div class="ho-panel"><div class="ho-panel-title">${this.T('souls')} · 轮回情报</div><div class="ho-curs"><span class="ho-chip-mini cur">堕灵魄 ${this.fmt(soul)}</span></div></div></div>
        <div class="ho-col">${this.renderHeirlooms()}</div>
        <div class="ho-col">${this.renderUpgradeList('prestige')}</div>
      </div>`;
  }
};

/* ===== 挂接统一地基：由注册表统一驱动 load / save（tick 已交给全局循环） ===== */
if (typeof GB_MODULES !== 'undefined') GB_MODULES.attachView('horde', GB_HO_VIEW);