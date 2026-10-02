/* ============================================================
 * debug.js —— 调试模式 / 作弊面板
 *
 * 入口：About 页面连续点击版本号 5 次 → 解锁设置面板里的「调试」按钮
 * 或者直接在 Console 里执行 GB_DEBUG.open()
 *
 * 功能：
 *   1) 一键给所有模块的 CUR 加资源（跳过 cap）
 *   2) 解锁所有 Feature
 *   3) 模拟离线时长（触发离线结算）
 *   4) 存档导出 / 导入 / 清空
 *   5) 全局道行等级调整
 * ============================================================ */
var GB_DEBUG = {

  _unlocked: false,    // 调试模式是否已解锁（通过 localStorage 持久化）

  init() {
    try { this._unlocked = localStorage.getItem('xzdz_debug_unlocked') === '1'; } catch (e) {}
  },

  /** 解锁调试模式（About 页面连点版本号 5 次调用） */
  unlock() {
    this._unlocked = true;
    try { localStorage.setItem('xzdz_debug_unlocked', '1'); } catch (e) {}
  },

  isUnlocked() { return this._unlocked; },

  /* ============ 打开调试面板 ============ */
  open() {
    if (!this._unlocked) {
      // 未解锁时提示
      alert('调试模式未解锁。\n请在「关于」页面连续点击版本号 5 次开启。');
      return;
    }
    this._render();
  },

  close() {
    const el = document.getElementById('debug-overlay');
    if (el) el.remove();
  },

  /* ============ 渲染 ============ */
  _render() {
    this.close();
    const overlay = document.createElement('div');
    overlay.id = 'debug-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:10000;display:flex;align-items:center;justify-content:center;';
    overlay.onclick = (e) => { if (e.target === overlay) this.close(); };

    overlay.innerHTML = `
      <div class="modal" style="width:min(560px,94vw);max-height:85vh;display:flex;flex-direction column;padding:16px 18px;">
        <button class="close-x" onclick="GB_DEBUG.close()">${GB_ICON.icon('mdi-close', 22)}</button>
        <h2 style="flex-shrink:0;color:var(--clr-warning);">🛠 调试面板</h2>
        <div id="debug-body" style="overflow-y:auto;flex:1;padding-right:6px;margin-top:8px;"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    this._renderBody();
  },

  _renderBody() {
    const body = document.getElementById('debug-body');
    if (!body) return;

    // 收集所有模块的 CUR 信息
    const moduleCurInfos = this._collectModuleCURs();

    body.innerHTML = `
      <!-- ========== 资源作弊 ========== -->
      <div class="debug-section">
        <div class="debug-title">💎 资源作弊</div>
        <div class="debug-row">
          <span class="debug-label">一键加灵石（大数量级）</span>
          <button class="gb-btn small primary" onclick="GB_DEBUG.cheatAllCurrencies(1)">+1</button>
          <button class="gb-btn small primary" onclick="GB_DEBUG.cheatAllCurrencies(1000)">+1K</button>
          <button class="gb-btn small primary" onclick="GB_DEBUG.cheatAllCurrencies(1e6)">+1M</button>
          <button class="gb-btn small primary" onclick="GB_DEBUG.cheatAllCurrencies(1e9)">+1B</button>
        </div>
        <div class="debug-row">
          <span class="debug-label">一键加灵石（自定义）</span>
          <input id="debug-custom-amount" type="number" value="100000" style="width:110px;padding:4px 8px;border:1px solid var(--border);border-radius:4px;background:var(--panel);color:var(--text-main);font-size:12px;" />
          <button class="gb-btn small primary" onclick="GB_DEBUG.cheatAllCurrencies(null)">加！</button>
        </div>
        ${moduleCurInfos.map(info => `
          <details style="margin-top:6px;border:1px solid var(--border);border-radius:4px;">
            <summary style="cursor:pointer;padding:6px 10px;font-size:12px;color:var(--accent);list-style:none;">
              <span style="font-size:11px;color:var(--text-dim);">▶</span> ${info.label}（${info.keys.length} 项）
            </summary>
            <div style="padding:8px 10px;font-size:11px;max-height:180px;overflow-y:auto;">
              ${info.keys.map(k => `
                <div class="debug-row" style="padding:2px 0;">
                  <span style="flex:1;color:var(--text-sub);">${k}</span>
                  <button class="gb-btn tiny" style="padding:1px 6px;font-size:10px;" onclick="GB_DEBUG.cheatSingle('${info.modId}', '${k}', 1000)">+1K</button>
                  <button class="gb-btn tiny" style="padding:1px 6px;font-size:10px;" onclick="GB_DEBUG.cheatSingle('${info.modId}', '${k}', 1e6)">+1M</button>
                </div>
              `).join('')}
            </div>
          </details>
        `).join('')}
      </div>

      <!-- ========== Feature 解锁 ========== -->
      <div class="debug-section">
        <div class="debug-title">🔓 玩法解锁</div>
        <div class="debug-row">
          <span class="debug-label">解锁所有玩法</span>
          <button class="gb-btn small primary" onclick="GB_DEBUG.unlockAllFeatures()">一键解锁</button>
        </div>
        <div class="debug-row">
          <span class="debug-label">设置道行等级</span>
          <input id="debug-gblevel" type="number" value="50" style="width:80px;padding:4px 8px;border:1px solid var(--border);border-radius:4px;background:var(--panel);color:var(--text-main);font-size:12px;" />
          <button class="gb-btn small primary" onclick="GB_DEBUG.setGlobalLevel()">设置</button>
        </div>
      </div>

      <!-- ========== 离线模拟 ========== -->
      <div class="debug-section">
        <div class="debug-title">⏱ 离线模拟</div>
        <div class="debug-row">
          <span class="debug-label">模拟离线时长</span>
          <button class="gb-btn small" onclick="GB_DEBUG.simulateOffline(300)">5 分钟</button>
          <button class="gb-btn small" onclick="GB_DEBUG.simulateOffline(3600)">1 小时</button>
          <button class="gb-btn small" onclick="GB_DEBUG.simulateOffline(8*3600)">8 小时（上限）</button>
        </div>
      </div>

      <!-- ========== 存档 ========== -->
      <div class="debug-section">
        <div class="debug-title">💾 存档管理</div>
        <div class="debug-row">
          <span class="debug-label">导出存档 JSON</span>
          <button class="gb-btn small" onclick="GB_DEBUG.exportSave()">复制到剪贴板</button>
        </div>
        <div class="debug-row">
          <span class="debug-label">导入存档 JSON</span>
          <button class="gb-btn small" onclick="GB_DEBUG.importSaveFromClipboard()">从剪贴板导入</button>
        </div>
        <div class="debug-row">
          <span class="debug-label">立即保存一次</span>
          <button class="gb-btn small" onclick="GB_DEBUG.forceSave()">保存</button>
        </div>
        <div class="debug-row">
          <span class="debug-label" style="color:var(--clr-warning);">⚠ 清空存档</span>
          <button class="gb-btn small error" onclick="GB_DEBUG.confirmHardReset()">清空并重置</button>
        </div>
      </div>
    `;
  },

  /* ============ 收集各模块 CUR 信息 ============ */
  _collectModuleCURs() {
    const list = [];
    if (typeof GB_MODULES === 'undefined') return list;
    GB_MODULES.all().forEach(mod => {
      const CUR = mod.core && mod.core.CUR;
      if (!CUR || !CUR.values) return;
      const keys = Object.keys(CUR.values).sort();
      if (keys.length === 0) return;
      list.push({ label: mod.name || mod.id, modId: mod.id, core: mod.core, keys });
    });
    return list;
  },

  /* ============ 作弊方法 ============ */

  /** 给所有 CUR 加资源，amount=null 时读取 debug-custom-amount 输入框 */
  cheatAllCurrencies(amount) {
    if (amount === null || amount === undefined) {
      const input = document.getElementById('debug-custom-amount');
      amount = parseInt(input ? input.value : '100000', 10) || 100000;
    }
    let modCount = 0;
    if (typeof GB_MODULES !== 'undefined') {
      GB_MODULES.all().forEach(mod => {
        const CUR = mod.core && mod.core.CUR;
        if (!CUR || !CUR.values) return;
        for (const k of Object.keys(CUR.values)) {
          this._forceAdd(CUR, k, amount);
        }
        modCount++;
      });
    }
    this._afterCheat(`已给所有资源加 ${this._fmt(amount)}（共修改 ${modCount} 个模块）`);
  },

  /** 给指定模块的单个资源加值 */
  cheatSingle(modId, key, amount) {
    if (typeof GB_MODULES === 'undefined') return;
    const mod = GB_MODULES.get(modId);
    const CUR = mod && mod.core && mod.core.CUR;
    if (!CUR) { GB_APP && GB_APP.toast('模块未加载', 'red'); return; }
    this._forceAdd(CUR, key, amount);
    this._afterCheat(`+${this._fmt(amount)} ${key}`);
  },

  /** 强制加值：直接写 values[key]，跳过 cap 检查 */
  _forceAdd(CUR, key, amount) {
    if (typeof CUR.add === 'function' && CUR.defs && CUR.defs[key]) {
      // 有 defs 时：先禁用 cap 再调 add（如果有 capMult 的话）
      // 更简单的做法：直接操作 values
      CUR.values[key] = (CUR.values[key] || 0) + amount;
      if (typeof CUR.refreshCurrencyMult === 'function') {
        try { CUR.refreshCurrencyMult(key); } catch (e) {}
      }
    } else {
      CUR.values[key] = (CUR.values[key] || 0) + amount;
    }
    return 1;
  },

  _afterCheat(msg) {
    // 触发各模块的 afterChange / 刷新
    if (typeof GB_MODULES !== 'undefined') {
      try { GB_MODULES.all().forEach(m => {
        try { if (m.core && m.core.RT && typeof m.core.RT.afterChange === 'function') m.core.RT.afterChange(); } catch (e) {}
      }); } catch (e) {}
    }
    // 刷新活动视图
    if (typeof GB_APP !== 'undefined') GB_APP.refreshActiveView();
    // toast 提示
    if (typeof GB_APP !== 'undefined') GB_APP.toast(msg, '#ff9800');
  },

  /* ============ Feature 解锁 ============ */
  unlockAllFeatures() {
    if (typeof GB_UNLOCK === 'undefined') { alert('GB_UNLOCK 未定义'); return; }
    const keys = ['lmFeature','villFeature','faFeature','hoFeature','ruFeature','scFeature','daoFeature','lingbaoFeature','xianqiFeature','generalFeature'];
    let count = 0;
    keys.forEach(k => {
      try {
        GB_UNLOCK.unlock(k);
        count++;
      } catch (e) {}
    });
    // 强制 globalLevel 到 9999，让所有阈值都过（避免漏掉未注册的解锁条件）
    if (typeof GB_META !== 'undefined') {
      try {
        const parts = GB_META.state.globalLevelParts;
        GB_META.PART_KEYS.forEach(k => { parts[k] = Math.max(parts[k] || 0, 9999); });
        GB_META._recomputeGlobalLevel();
      } catch (e) {}
    }
    // 触发视图刷新
    if (typeof GB_APP !== 'undefined') GB_APP.refreshActiveView();
    if (typeof GB_APP !== 'undefined') GB_APP.toast(`已解锁 ${count} 个玩法，道行等级强制拉满`, '#ff9800');
  },

  setGlobalLevel() {
    const input = document.getElementById('debug-gblevel');
    const target = parseInt(input ? input.value : '50', 10);
    if (isNaN(target) || target < 0) { alert('请输入有效数字'); return; }
    if (typeof GB_META !== 'undefined') {
      try {
        // 简单粗暴：给所有 PART_KEYS 都塞 target，让 globalLevel 至少是 target
        const parts = GB_META.state.globalLevelParts;
        GB_META.PART_KEYS.forEach(k => {
          if (!parts[k] || parts[k] < target) parts[k] = target;
        });
        GB_META._recomputeGlobalLevel();
      } catch (e) { console.warn('setGlobalLevel error', e); }
    }
    if (typeof GB_APP !== 'undefined') GB_APP.refreshActiveView();
    if (typeof GB_APP !== 'undefined') GB_APP.toast(`道行等级设为 ${GB_META.getLevel()}`, '#ff9800');
  },

  /* ============ 离线模拟 ============ */
  simulateOffline(seconds) {
    if (typeof GB_MODULES === 'undefined') { alert('GB_MODULES 未就绪'); return; }
    GB_MODULES.offlineAll(seconds);
    // 刷新
    if (typeof GB_APP !== 'undefined') GB_APP.refreshActiveView();
    const label = seconds >= 3600 ? (seconds / 3600) + ' 小时' : (seconds >= 60 ? (seconds / 60) + ' 分钟' : seconds + ' 秒');
    if (typeof GB_APP !== 'undefined') GB_APP.toast(`模拟离线 ${label} 完成`, '#ff9800');
  },

  /* ============ 存档 ============ */
  forceSave() {
    if (typeof GB_APP !== 'undefined') GB_APP.persist();
    if (typeof GB_MODULES !== 'undefined') GB_MODULES.saveAll();
    if (typeof GB_APP !== 'undefined') GB_APP.toast('已手动保存', '#4CAF50');
  },

  exportSave() {
    const keys = [
      'xzdz_gooboo_save', 'xzdz_gooboo_config',
      'xzdz_gooboo_village_save', 'xzdz_gooboo_farm_save',
      'xzdz_gooboo_horde_save_v2', 'xzdz_gooboo_school_save', 'xzdz_gooboo_ruin_save'
    ];
    const data = {};
    for (const k of keys) {
      try {
        const raw = localStorage.getItem(k);
        if (raw) data[k] = JSON.parse(raw);
      } catch (e) {}
    }
    const json = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(json).then(
      () => { if (typeof GB_APP !== 'undefined') GB_APP.toast('存档 JSON 已复制到剪贴板', '#4CAF50'); },
      () => { prompt('复制以下存档 JSON：', json); }
    );
  },

  importSaveFromClipboard() {
    navigator.clipboard.readText().then(text => {
      try {
        const data = JSON.parse(text);
        for (const k in data) {
          try { localStorage.setItem(k, JSON.stringify(data[k])); } catch (e) {}
        }
        alert('存档导入成功，即将刷新页面...');
        location.reload();
      } catch (e) {
        alert('解析失败：' + e.message);
      }
    }).catch(() => {
      alert('无法读取剪贴板，请手动粘贴到 Console 执行：\nGB_DEBUG.importSave(prompt("粘贴存档JSON:"))');
    });
  },

  confirmHardReset() {
    if (!confirm('确定要清空全部存档并重置进度吗？此操作不可撤销！')) return;
    if (!confirm('再次确认：真的要清空全部存档吗？')) return;
    if (typeof GB_APP !== 'undefined') GB_APP.hardReset();
    else location.reload();
  },

  /* ============ 格式化辅助 ============ */
  _fmt(n) {
    if (typeof formatNum === 'function') return formatNum(n);
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return String(n);
  }
};

/* ============ 启动 ============ */
document.addEventListener('DOMContentLoaded', () => GB_DEBUG.init());
if (typeof document !== 'undefined' && document.readyState !== 'loading') GB_DEBUG.init();

if (typeof window !== 'undefined') window.GB_DEBUG = GB_DEBUG;
