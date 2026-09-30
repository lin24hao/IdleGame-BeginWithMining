const MAIN = {
  currentView: "cave",
  attrsVisible: false,

  init() {
    // 1) 读档（含存档版本迁移）
    STATE.init();
    // 2) 初始化设置（音效/音量）
    SETTINGS.init();
    // 3) 自动存档已在 STATE.init 内注册到统一 Tick 引擎（此处无需重复注册）
    // 4) 启动统一 Tick 引擎：修炼 / 洞府 / 秘境 / 状态栏 / 自动存档 全部由它驱动
    ENGINE.start();
    // 5) 全系统离线结算（覆盖修炼、洞府建筑升级、炼丹队列、种植、秘境状态）
    const offlineSummary = STATE.settleOffline();
    // 6) 秘境跨会话恢复：仍在秘境中则直接回到场内，从当前站点继续
    const resumeIngame = EXPLORATION.resumeAfterOffline();
    this.currentView = resumeIngame ? "ingame" : this.currentView;
    this.render();
    // 7) 展示离线收益摘要（时长过短时不打扰）
    const minShow = ((CONFIG.ENGINE && CONFIG.ENGINE.OFFLINE_MIN_SHOW_SECONDS) || 60) * 1000;
    if (offlineSummary && offlineSummary.elapsedMs >= minShow) {
      this.showOfflineSummary(offlineSummary);
    }
    // 关闭页面时保存一次，保证秘境快照与离线起点准确
    window.addEventListener('beforeunload', () => STATE.save());
  },

  /**
   * 离线收益摘要弹层（P0 第 3 项）
   * @param {Object} summary ENGINE.advance 生成的摘要
   */
  showOfflineSummary(summary, opts) {
    opts = opts || {};
    const title = opts.title || "离线收益摘要";
    const durLabel = opts.durationLabel || "离开时长";
    const el = document.createElement("div");
    el.id = "offline-summary";
    el.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.72);z-index:1200;display:flex;align-items:center;justify-content:center;padding:16px;";
    const durText = formatDuration(summary.elapsedMs);
    let body = "";
    if (summary.sections.length === 0) {
      body = `<div class="text-dim" style="font-size:12px;">离线期间没有可结算的产出。</div>`;
    } else {
      summary.sections.forEach(sec => {
        body += `<div style="margin-top:10px;">
          <div style="color:var(--accent);font-weight:bold;font-size:13px;margin-bottom:4px;">${sec.label}</div>
          ${sec.items.map(t => `<div style="font-size:12px;line-height:1.6;padding-left:6px;">· ${t}</div>`).join("")}
        </div>`;
      });
    }
    const capTip = summary.capped
      ? `<div class="text-dim" style="font-size:11px;margin-top:8px;">（离线时长超出结算窗口上限，已按上限 ${Math.round(ENGINE.maxOfflineMs() / 3600000)} 小时结算）</div>`
      : "";
    el.innerHTML = `
      <div class="panel" style="max-width:420px;width:100%;max-height:80vh;overflow-y:auto;padding:14px;">
        <div style="font-size:15px;font-weight:bold;color:var(--accent);">${title}</div>
        <div class="text-dim" style="font-size:12px;margin-top:4px;">${durLabel}：${durText}</div>
        ${capTip}
        ${body}
        <button class="btn" style="width:100%;margin-top:14px;" onclick="MAIN.closeOfflineSummary()">开始游戏</button>
      </div>
    `;
    document.body.appendChild(el);
  },

  closeOfflineSummary() {
    const el = document.getElementById("offline-summary");
    if (el) el.remove();
  },

  /**
   * 长时间挂起追赶提示（P0 附带能力）
   * 浏览器后台会节流定时器、系统休眠也会暂停计时，回到前台时引擎会批量补算，
   * 这里沿用离线摘要弹层展示，避免收益"凭空出现"。
   */
  showCatchUpNotice(summary) {
    if (!summary || summary.isEmpty) return;
    if (summary.elapsedMs < 300000) return;   // 5 分钟以内不打扰
    if (document.getElementById("offline-summary")) return;
    this.showOfflineSummary(summary, { title: "挂起期间收益摘要", durationLabel: "挂起时长" });
  },

  switchView(view) {
    this.currentView = view;
    this.render();
  },

  // 渲染角落音效开关按钮（固定定位，不影响布局）
  renderSoundToggle() {
    const existing = document.getElementById("sound-toggle-btn");
    if (existing) existing.remove();
    const sfxOn = SETTINGS.data && SETTINGS.data.sfxEnabled;
    const btn = document.createElement("div");
    btn.id = "sound-toggle-btn";
    btn.style.cssText = "position:absolute;bottom:8px;right:8px;width:32px;height:32px;border-radius:50%;background:var(--panel);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;z-index:999;user-select:none;";
    btn.textContent = sfxOn ? "🔊" : "🔇";
    btn.title = sfxOn ? "音效已开启" : "音效已关闭";
    btn.onclick = () => {
      SETTINGS.toggleSfx();
      if (SETTINGS.data.sfxEnabled) SETTINGS.playSfx('click');
      this.renderSoundToggle();
    };
    const app = document.getElementById("app");
    if (app) app.appendChild(btn);
  },

  render() {
    const app = document.getElementById("app");
    app.innerHTML = "";
    app.style.flexDirection = "column";
    // 所有界面顶部都有状态栏（场内除外，场内有独立布局）
    if (this.currentView === "ingame") {
      EXPLORATION.renderInGame();
      this.renderSoundToggle();
      return;
    }
    app.innerHTML = `<div id="status-bar"></div><div class="scroll-area" id="view-content"></div>`;
    this.renderSoundToggle();
    this.updateStatusBar();
    const content = document.getElementById("view-content");
    switch (this.currentView) {
      case "cave": content.innerHTML = this.getCaveHTML(); break;
      case "explore": content.innerHTML = EXPLORATION.getMapSelectHTML(); break;
      case "settlement": SETTLEMENT.render(content); break;
      case "market": content.innerHTML = MARKET.getHTML(); break;
      case "settings": content.innerHTML = SETTINGS.getHTML(); break;
    }
  },

  // 顶部状态栏（所有界面都显示，实时更新养成进度）
  renderStatusBar() {
    const p = STATE.player;
    const cultPct = Math.min(100, p.cultivation / CULTIVATION.getMaxCultivation() * 100);
    return `
      <div style="padding:4px 8px;background:var(--panel);border-bottom:1px solid var(--border);font-size:11px;flex-shrink:0;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="color:var(--accent);font-weight:bold;">${CULTIVATION.getRealmName()}</span>
          <span>💰${p.spiritStones.toLocaleString()}</span>
        </div>
        <div style="display:flex;align-items:center;gap:4px;margin-top:2px;">
          <span class="text-dim" style="font-size:10px;">修为</span>
          <div style="flex:1;height:4px;background:var(--border);border-radius:2px;overflow:hidden;">
            <div style="width:${cultPct}%;height:100%;background:var(--accent);"></div>
          </div>
          <span class="text-dim" style="font-size:10px;">+${CULTIVATION.getMeditationRate()}/s</span>
        </div>
      </div>
    `;
  },

  // 实时更新状态栏（不重渲染整个页面）
  updateStatusBar() {
    const bar = document.getElementById("status-bar");
    if (!bar) return;
    const p = STATE.player;
    const cultPct = Math.min(100, p.cultivation / CULTIVATION.getMaxCultivation() * 100);
    const power = CULTIVATION.getPlayerPower();
    bar.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="color:var(--accent);font-weight:bold;">${CULTIVATION.getRealmName()}</span>
        <div style="display:flex;gap:8px;font-size:12px;">
          <span style="color:var(--q-good);">⚔${Math.round(power)}</span>
          <span>💰${p.spiritStones.toLocaleString()}</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:4px;margin-top:2px;">
        <span class="text-dim" style="font-size:10px;">修为</span>
        <div style="flex:1;height:4px;background:var(--border);border-radius:2px;overflow:hidden;">
          <div style="width:${cultPct}%;height:100%;background:var(--accent);"></div>
        </div>
        <span class="text-dim" style="font-size:10px;">+${CULTIVATION.getMeditationRate()}/s</span>
      </div>
    `;
  },

  getCaveHTML() {
    return CAVE.getHTML();
  },

  // 属性行：消耗属性点提升，不关闭面板可连续点
  renderAttrRows() {
    const p = STATE.player;
    const A = CONFIG.ATTRIBUTES;
    let html = '';
    Object.keys(A).forEach(key => {
      const cfg = A[key];
      const val = p.attrs[key];
      const display = cfg.unit === '%' ? (val * cfg.perPoint).toFixed(1) + '%' : Math.floor(val * cfg.perPoint);
      const canAdd = p.attrPoints > 0;
      html += `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--border);">
          <div>
            <span style="font-weight:bold;">${cfg.icon} ${cfg.name}</span>
            <span class="text-dim" style="font-size:11px;"> ${cfg.desc}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="color:var(--accent);font-weight:bold;font-size:12px;">${display}</span>
            <button class="btn" style="padding:3px 10px;font-size:12px;${canAdd ? '' : 'opacity:0.3;cursor:not-allowed;'}"
                    ${canAdd ? '' : 'disabled'}
                    onclick="CULTIVATION.allocateAttr('${key}');MAIN.refreshCave();">+</button>
          </div>
        </div>
      `;
    });
    return html;
  },

  // 刷新洞府：只更新view-content，不重渲染状态栏，连续操作不闪烁
  refreshCave() {
    if (this.currentView === "explore" && EXPLORATION.selectedMap) {
      EXPLORATION.renderForgeStep();
      return;
    }
    if (this.currentView !== "cave") {
      this.render();
      return;
    }
    const content = document.getElementById("view-content");
    if (content) content.innerHTML = this.getCaveHTML();
    this.updateStatusBar();
  }
};

document.addEventListener("DOMContentLoaded", () => MAIN.init());

// ===== 注册到统一 Tick 引擎（P0）=====
// 替代原 MAIN.init 中 setInterval(100ms) 的「修炼 tick + 状态栏刷新」：
// 修炼由 cultivation 模块按 100ms 节拍驱动（与原来完全一致），
// 此处仅负责状态栏的实时刷新。
ENGINE.register({
  name: 'statusbar',
  label: '状态栏刷新',
  tickspeed: 100,
  tick: () => MAIN.updateStatusBar()
});
