/* ============================================================
 * gb_registry.js —— 跨模块注册地基（薄层，零依赖）
 *
 * 对齐 gooboo：
 *   - src/js/tick.js        统一 tick：遍历全部模块，按 tickspeed 算 diff
 *   - src/store/system.js   模块登记表（icon / 解锁 / 离线统计项）
 *
 * 本文件提供四件事：
 *   1) 统一注册表：各模块 core 自注册 { id, name, keyPrefix, tickSpeed, core }
 *   2) 视图挂接：各 view 自挂 io（load / save），由注册表统一驱动
 *   3) 跨模块 key 索引：cur(key) / stat(key) / unlocked(key) / level(key)
 *      —— 后续「成就」「宝石」等全局层只需按 key 全域查询，无需改动各模块
 *   4) gooboo 式统一 tick / 离线：
 *        diff = floor(newTime / tickSpeed) - floor(oldTime / tickSpeed)
 *        离线 = 同一个 tick 跑一次大 diff（不做第二套离线逻辑）
 *
 * 加载顺序：必须在所有模块 core 之前（index.html 紧随 icon.js）。
 * 本文件不改动任何模块的数值与存档格式。
 * ============================================================ */
var GB_MODULES = {
  _list: [],
  _byId: {},
  _byPrefix: {},
  /* feature → keyPrefix 映射表（treasure effect 里的 feature 值 → 对应模块 keyPrefix）
     gooboo treasure effect.feature: 'mining' → 我们的 keyPrefix: 'lm'
     gooboo treasure effect.feature: 'village' → 我们的 keyPrefix: 'village' */
  _featureMap: {
    mining: 'lm',
    village: 'village',
    horde: 'horde',
    farm: 'farm',
    dao: 'dao',
    relic: 'rel',
    treasure: 'treasure',
    // gallery（gooboo 画廊）暂不移植 — gallery effect 变成 no-op
  },
  resetting: false,

  /* ---------- 注册表 ---------- */
  /* unlockNeeded = Feature 级别的解锁 key（GB_UNLOCK.isUnlocked() 为 true 时才 tick）
                   不传或传 null = 默认开放（如灵脉）*/
  register(mod) {
    if (!mod || !mod.id) return null;
    if (this._byId[mod.id]) return this._byId[mod.id];
    mod.tickSpeed = mod.tickSpeed || 1;
    mod.io = mod.io || null;
    mod.unlockNeeded = mod.unlockNeeded || null;
    this._list.push(mod);
    this._byId[mod.id] = mod;
    if (mod.keyPrefix) this._byPrefix[mod.keyPrefix] = mod;
    return mod;
  },

  /* 某模块是否已满足 Feature 解锁条件（用于 tick 守卫） */
  isModuleUnlocked(mod) {
    if (!mod || !mod.unlockNeeded) return true; // null 或不传 = 默认开放
    if (typeof GB_UNLOCK === 'undefined') return true;
    return GB_UNLOCK.isUnlocked(mod.unlockNeeded);
  },
  /* 视图挂接（io 需提供 load() / save()，缺失则跳过对应环节） */
  attachView(id, view) { const m = this._byId[id]; if (m) m.io = view; return m; },
  get(id) { return this._byId[id] || null; },
  all() { return this._list.slice(); },

  /* ---------- 跨模块 key 索引（key 形如 'village_faith'） ---------- */
  owner(key) {
    const s = String(key);
    const i = s.indexOf('_');
    return i > 0 ? (this._byPrefix[s.slice(0, i)] || null) : null;
  },
  _core(key) { const m = this.owner(key); return m ? m.core : null; },
  /* 货币当前值 */
  cur(key) { try { return this._core(key).CUR.value(key); } catch (e) { return 0; } },
  /* 统计当前值（STAT.get 返回 s.value） */
  stat(key) { try { return this._core(key).STAT.get(key); } catch (e) { return 0; } },
  /* 统计峰值 */
  statMax(key) { try { const s = this._core(key).STAT.values[key]; return s ? (s.max || 0) : 0; } catch (e) { return 0; } },
  /* 解锁状态（各模块 UNLOCK 均为 items[id] = { init, see, use } 结构） */
  unlocked(key) {
    const c = this._core(key);
    if (!c) return false;
    try { if (typeof c.UNLOCK.isUnlocked === 'function') return !!c.UNLOCK.isUnlocked(key); } catch (e) { /* fallthrough */ }
    try { const it = c.UNLOCK.items[key]; return !!(it && (it.use || it.init)); } catch (e) { return false; }
  },
  /* 升级等级 */
  level(key) { try { return this._core(key).UPG.levels[key] || 0; } catch (e) { return 0; } },

  eachCur(cb) { this._each(m => m.core.CUR.values, cb); },
  eachStat(cb) { this._each(m => m.core.STAT.values, cb); },
  eachUnlock(cb) { this._each(m => m.core.UNLOCK.items, cb); },
  _each(pick, cb) {
    this._list.forEach(m => {
      let o = null;
      try { o = pick(m.core); } catch (e) { o = null; }
      if (!o) return;
      Object.keys(o).forEach(k => cb(k, o[k], m));
    });
  },

  /* ---------- gooboo 式统一 tick / 离线 ---------- */
  /* 与 gooboo tick.js 同式：diff = floor(t / tickSpeed) 的时间差 */
  diffOf(mod, newTime, oldTime) {
    return Math.floor(newTime / mod.tickSpeed) - Math.floor(oldTime / mod.tickSpeed);
  },
  tickAll(newTime, oldTime) {
    this._list.forEach(mod => {
      // Feature 解锁守卫：未解锁的模块不 tick（与 gooboo tick.js 一致）
      if (!this.isModuleUnlocked(mod)) return;
      let d = 0;
      try { d = this.diffOf(mod, newTime, oldTime); } catch (e) { return; }
      if (d <= 0) return;
      try { if (mod.core.RT && typeof mod.core.RT.tick === 'function') mod.core.RT.tick(d); } catch (e) { /* 单模块异常不影响其它模块 */ }
    });
    // tick 完所有模块后，统一扫描 STAT 更新 globalLevelPart —— 触发自动 Feature 解锁
    if (typeof GB_META !== 'undefined') {
      try { GB_META.syncAll(); } catch (e) {}
    }
  },
  /* 离线：同一个 tick 跑大 diff（不另起一套离线逻辑）。
     逐小时分块推进，与各模块原有离线精度一致；结束后统一刷新一次派生效果。
     存档未合并的前提下，各模块优先按「自身存档时间戳」结算，缺失时用兜底秒数。 */
  offlineAll(fallbackSeconds) {
    const now = Date.now();
    this._list.forEach(m => {
      // Feature 解锁守卫：未解锁的模块不结算离线
      if (!this.isModuleUnlocked(m)) return;
      let seconds = fallbackSeconds;
      try {
        if (m.io && typeof m.io.loadSave === 'function') {
          const s = m.io.loadSave();
          if (s && s.savedAt) seconds = Math.min((now - s.savedAt) / 1000, 8 * 3600);
        }
      } catch (e) { /* 用兜底秒数 */ }
      if (!(seconds >= 60)) return;
      try {
        const chunk = 3600;
        let done = 0;
        while (done < seconds) {
          const step = Math.min(seconds - done, chunk);
          const mod = m;
          const d = this.diffOf(mod, done + step, done);
          if (d > 0 && mod.core.RT && typeof mod.core.RT.tick === 'function') mod.core.RT.tick(d);
          done += step;
        }
        if (typeof m.afterOffline === 'function') m.afterOffline();
        else if (m.core.RT && typeof m.core.RT.afterChange === 'function') m.core.RT.afterChange();
      } catch (e) { /* 单模块异常不影响其它模块 */ }
    });
  },
  now() { return Date.now() / 1000; },

  /* ---------- 生命周期 ---------- */
  loadAll() { this._list.forEach(m => { try { m.io && m.io.load && m.io.load(); } catch (e) { /* ignore */ } }); },
  saveAll() {
    if (this.resetting) return;
    this._list.forEach(m => { try { m.io && m.io.save && m.io.save(); } catch (e) { /* ignore */ } });
  },
  /* loadAll 之后触发：让各模块上报 globalLevelPart（基于存档当前值） */
  afterLoad() {
    this._list.forEach(m => { try { if (typeof m.onAfterLoad === 'function') m.onAfterLoad(); } catch (e) {} });
  },

  /* ---------- 统一存档（所有模块自动参与主存档） ---------- */
  snapshotAll() {
    const obj = {};
    this._list.forEach(m => {
      try {
        if (m.core && typeof m.core.snapshot === 'function') {
          const snap = m.core.snapshot();
          if (snap !== undefined && snap !== null) obj[m.id] = snap;
        }
      } catch (e) { /* ignore */ }
    });
    return obj;
  },
  restoreAll(data) {
    if (!data || typeof data !== 'object') return;
    this._list.forEach(m => {
      try {
        if (m.core && typeof m.core.restore === 'function' && data[m.id] !== undefined) {
          m.core.restore(data[m.id]);
        }
      } catch (e) { /* ignore */ }
    });
  },
  hardResetAll() {
    this._list.forEach(m => {
      try {
        if (m.core && typeof m.core.hardReset === 'function') m.core.hardReset();
      } catch (e) { /* ignore */ }
    });
  },

  /* ---------- 跨模块 MULT 路由 ---------- */
  /* gooboo 全局 mult/setMult 的等价物：
     treasure effect 要给 miningDamage 加 mult，调用：
       GB_MODULES.multSetMult({ feature: 'mining', name: 'miningDamage', key: 'treasure', value: 1.5 })
     自动路由到 lm 模块的 MULT */
  _featureToMult(feature) {
    const prefix = this._featureMap[feature];
    if (!prefix) return null;
    const mod = this._byPrefix[prefix];
    if (!mod || !mod.core || !mod.core.MULT) return null;
    return mod.core.MULT;
  },
  multSetMult(o) {
    const m = this._featureToMult(o.feature); if (!m) return;
    if (typeof m.setMult === 'function') m.setMult({ name: o.name, key: o.key, value: o.value });
    else if (!m.values[o.name]) m.values[o.name] = { base: 1, mult: o.value, bonus: 0 };
    else m.values[o.name].mult = o.value;
  },
  multSetBase(o) {
    const m = this._featureToMult(o.feature); if (!m) return;
    if (typeof m.setBase === 'function') m.setBase({ name: o.name, key: o.key, value: o.value });
    else if (!m.values[o.name]) m.values[o.name] = { base: o.value, mult: 1, bonus: 0 };
    else m.values[o.name].base = o.value;
  },
  multSetBonus(o) {
    const m = this._featureToMult(o.feature); if (!m) return;
    if (typeof m.setBonus === 'function') m.setBonus({ name: o.name, key: o.key, value: o.value });
    else if (!m.values[o.name]) m.values[o.name] = { base: 1, mult: 1, bonus: o.value };
    else m.values[o.name].bonus = o.value;
  },
  multRemoveKey(o) {
    const m = this._featureToMult(o.feature); if (!m) return;
    if (typeof m.removeKeyAnywhere === 'function') m.removeKeyAnywhere();
    // 简化：直接清掉 mult/bonus，保留 base
    if (m.values[o.name]) {
      m.values[o.name].mult = 1;
      m.values[o.name].bonus = 0;
    }
  },
  multInit(o) {
    const m = this._featureToMult(o.feature); if (!m) return;
    if (typeof m.init === 'function') m.init(o.name, o.def || {});
  },
};

if (typeof window !== 'undefined') window.GB_MODULES = GB_MODULES;
if (typeof module !== 'undefined') module.exports = { GB_MODULES };