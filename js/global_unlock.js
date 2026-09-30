/* ============================================================
 * global_unlock.js — 跨模块 Feature 级解锁注册表（唯一数据源）
 *
 * 对齐 gooboo src/store/unlock.js：
 *   - state.unlock[key] = { see: bool, use: bool }
 *   - gooboo 的 lock(state, name) 把 see/use 全置 false
 *     reset 只把 use 置 false（轮回重置用）
 *
 * 设计：
 *   - 这是全局唯一的 unlock 注册表，所有 Feature 级解锁都在这里
 *   - 各模块内部解锁（farmCare、hordeEquipment...）仍由模块自管
 *   - 触发解锁时，meta.js 负责发通知、自动解锁连锁
 *
 * 加载顺序：必须在 gb_registry.js 之后、meta.js 和 app.js 之前
 * ============================================================ */
var GB_UNLOCK = {
  items: {},

  /* 初始化一个解锁项（see/use 全 false） */
  init(key) {
    if (!this.items[key]) {
      this.items[key] = { see: false, use: false };
    }
    return this.items[key];
  },

  /* 标记已看见（UI 层可显示该模块入口，但功能仍禁用） */
  reveal(key) {
    const it = this.init(key);
    it.see = true;
    return it;
  },

  /* 完整解锁（see + use 都 true） */
  unlock(key) {
    const it = this.init(key);
    const wasUnlocked = it.use;
    it.see = true;
    it.use = true;
    // 通知 meta 处理连锁解锁（通知、自动解锁其他 key）
    if (!wasUnlocked && typeof GB_META !== 'undefined') {
      try { GB_META.onFeatureUnlocked(key); } catch (e) {}
    }
    return it;
  },

  /* 轮回重置 use（保留 see）—— 宗门的 found 状态那种语义 */
  reset(key) {
    if (this.items[key]) this.items[key].use = false;
  },

  /* 完全锁定（轮回重置 Feature 级别时） */
  lock(key) {
    if (this.items[key]) {
      this.items[key].see = false;
      this.items[key].use = false;
    }
  },

  /* 查询函数 */
  isUnlocked(key) {
    const it = this.items[key];
    return !!(it && it.use);
  },
  isVisible(key) {
    const it = this.items[key];
    return !!(it && it.see);
  },

  /* 批量锁全（hardReset 时调用） */
  lockAll() {
    Object.keys(this.items).forEach(k => this.lock(k));
  },

  /* 存档导出（app.js snapshot 里的 unlock 字段） */
  snapshot() {
    return JSON.parse(JSON.stringify(this.items));
  },

  /* 存档导入 */
  restore(data) {
    if (!data || typeof data !== 'object') return;
    Object.keys(data).forEach(k => {
      this.items[k] = data[k];
    });
  }
};

if (typeof window !== 'undefined') window.GB_UNLOCK = GB_UNLOCK;
