/**
 * 设置系统：音量音效控制、清除存档
 */
const SETTINGS = {
  // 默认设置
  defaults: {
    bgmVolume: 30,      // 背景音乐音量 0-100
    sfxVolume: 30,      // 音效音量 0-100
    bgmEnabled: false,  // 背景音乐默认关（无音频文件）
    sfxEnabled: true,   // 音效默认开
    timeMult: 1         // P0：全局时间倍率（1 = 原速）
  },

  // 当前设置
  data: null,

  // 音频元素
  _bgm: null,
  _sfxPool: [],
  _sfxIdx: 0,

  /**
   * 初始化设置：从 localStorage 读取或使用默认值
   */
  init() {
    const saved = localStorage.getItem("xdzc_settings");
    if (saved) {
      try {
        this.data = { ...this.defaults, ...JSON.parse(saved) };
      } catch (e) {
        this.data = { ...this.defaults };
      }
    } else {
      this.data = { ...this.defaults };
    }
    // P0：恢复用户设置的全局时间倍率（统一 Tick 引擎在 start 时读取 CONFIG.ENGINE.TIME_MULT）
    if (this.data.timeMult && CONFIG.ENGINE) CONFIG.ENGINE.TIME_MULT = this.data.timeMult;
    this.save();
  },

  /**
   * 保存设置到 localStorage
   */
  save() {
    localStorage.setItem("xdzc_settings", JSON.stringify(this.data));
  },

  // ========== 音频系统 ==========

  /**
   * 初始化音频元素（延迟初始化，需要用户交互后才能播放）
   */
  _initAudio() {
    if (this._bgm) return;
    // 背景音乐：使用简单的循环音频（HTML5 Audio）
    this._bgm = new Audio();
    this._bgm.loop = true;
    this._bgm.volume = this.data.bgmEnabled ? this.data.bgmVolume / 100 : 0;
    // 音效池：3个通道交替使用，避免频繁创建
    for (let i = 0; i < 3; i++) {
      const sfx = new Audio();
      sfx.volume = this.data.sfxEnabled ? this.data.sfxVolume / 100 : 0;
      this._sfxPool.push(sfx);
    }
  },

  /**
   * 播放音效
   * @param {string} type - 音效类型：click/hover/craft/breakthrough/combat/search/find
   */
  playSfx(type) {
    if (!this.data.sfxEnabled || this.data.sfxVolume === 0) return;
    this._initAudio();
    // 使用 Web Audio API 生成简单音效（无需音频文件）
    try {
      const ctx = this._getAudioCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      const vol = (this.data.sfxVolume / 100) * 0.15;

      switch (type) {
        case 'click':
          osc.frequency.value = 800;
          gain.gain.setValueAtTime(vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
          break;
        case 'hover':
          osc.frequency.value = 1200;
          gain.gain.setValueAtTime(vol * 0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          osc.start(now);
          osc.stop(now + 0.04);
          break;
        case 'craft':
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
          gain.gain.setValueAtTime(vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        case 'breakthrough':
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.exponentialRampToValueAtTime(1600, now + 0.4);
          gain.gain.setValueAtTime(vol * 1.5, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
          break;
        case 'combat':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
          gain.gain.setValueAtTime(vol * 1.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
        case 'search':
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.linearRampToValueAtTime(900, now + 0.1);
          gain.gain.setValueAtTime(vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.start(now);
          osc.stop(now + 0.12);
          break;
        case 'find':
          osc.frequency.setValueAtTime(523, now);
          osc.frequency.linearRampToValueAtTime(1047, now + 0.2);
          gain.gain.setValueAtTime(vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
          break;
        default:
          osc.frequency.value = 600;
          gain.gain.setValueAtTime(vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
      }
    } catch (e) {
      // 静默失败，音效不影响游戏逻辑
    }
  },

  // Web Audio Context 懒加载
  _audioCtx: null,
  _getAudioCtx() {
    if (!this._audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this._audioCtx = new AC();
    }
    if (this._audioCtx.state === 'suspended') {
      this._audioCtx.resume();
    }
    return this._audioCtx;
  },

  /**
   * 切换背景音乐开关
   */
  toggleBgm() {
    this.data.bgmEnabled = !this.data.bgmEnabled;
    this.save();
  },

  /**
   * 切换音效开关
   */
  toggleSfx() {
    this.data.sfxEnabled = !this.data.sfxEnabled;
    this.save();
  },

  /**
   * 设置背景音乐音量
   */
  setBgmVolume(v) {
    this.data.bgmVolume = Math.max(0, Math.min(100, v));
    this.save();
  },

  /**
   * 设置音效音量
   */
  setSfxVolume(v) {
    this.data.sfxVolume = Math.max(0, Math.min(100, v));
    this.save();
  },

  /**
   * 设置全局时间倍率（P0：统一 Tick 引擎）
   * 仅调整"时间推进速度"，不改变任何数值公式（公式一律以每 tick 收益表达）。
   * 有效范围由 CONFIG.ENGINE.TIME_MULT_MIN / TIME_MULT_MAX 控制，默认 1（原速）。
   */
  setTimeMult(mult) {
    const cfg = CONFIG.ENGINE || {};
    const min = cfg.TIME_MULT_MIN || 1;
    const max = cfg.TIME_MULT_MAX || 10;
    const v = Math.max(min, Math.min(max, Number(mult) || 1));
    cfg.TIME_MULT = v;
    ENGINE.timeMult = v;
    this.data.timeMult = v;
    this.save();
    this.playSfx('click');
    MAIN.render();
  },

  // ========== 设置界面 ==========

  getHTML() {
    const s = this.data;
    const bgmBarColor = s.bgmEnabled ? 'var(--accent)' : 'var(--border)';
    const sfxBarColor = s.sfxEnabled ? 'var(--accent)' : 'var(--border)';

    let html = `
      <div class="panel">
        <h2 style="color:var(--accent);margin-bottom:8px;">设置</h2>
      </div>
    `;

    // 音频设置
    html += `
      <div class="panel">
        <div style="color:var(--accent);font-weight:bold;margin-bottom:8px;">音频设置</div>

        <!-- 背景音乐 -->
        <div style="margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:12px;font-weight:bold;">背景音乐</span>
            <button class="btn" style="padding:2px 10px;font-size:11px;${s.bgmEnabled ? 'background:var(--q-good);' : 'background:var(--border);color:var(--text);'}"
                    onclick="SETTINGS.toggleBgm();SETTINGS.playSfx('click');MAIN.render();">
              ${s.bgmEnabled ? '开' : '关'}
            </button>
          </div>
          <div style="display:flex;align-items:center;gap:6px;${!s.bgmEnabled ? 'opacity:0.4;' : ''}">
            <span style="font-size:10px;color:var(--text-dim);">音量</span>
            <input type="range" min="0" max="100" value="${s.bgmVolume}"
                   style="flex:1;accent-color:${bgmBarColor};"
                   ${!s.bgmEnabled ? 'disabled' : ''}
                   oninput="SETTINGS.setBgmVolume(parseInt(this.value));document.getElementById('bgm-vol-label').textContent=this.value;">
            <span id="bgm-vol-label" style="font-size:11px;color:var(--text-dim);width:24px;text-align:right;">${s.bgmVolume}</span>
          </div>
        </div>

        <!-- 音效 -->
        <div style="margin-bottom:4px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:12px;font-weight:bold;">音效</span>
            <button class="btn" style="padding:2px 10px;font-size:11px;${s.sfxEnabled ? 'background:var(--q-good);' : 'background:var(--border);color:var(--text);'}"
                    onclick="SETTINGS.toggleSfx();SETTINGS.playSfx('click');MAIN.render();">
              ${s.sfxEnabled ? '开' : '关'}
            </button>
          </div>
          <div style="display:flex;align-items:center;gap:6px;${!s.sfxEnabled ? 'opacity:0.4;' : ''}">
            <span style="font-size:10px;color:var(--text-dim);">音量</span>
            <input type="range" min="0" max="100" value="${s.sfxVolume}"
                   style="flex:1;accent-color:${sfxBarColor};"
                   ${!s.sfxEnabled ? 'disabled' : ''}
                   oninput="SETTINGS.setSfxVolume(parseInt(this.value));document.getElementById('sfx-vol-label').textContent=this.value;">
            <span id="sfx-vol-label" style="font-size:11px;color:var(--text-dim);width:24px;text-align:right;">${s.sfxVolume}</span>
          </div>
          <button class="btn" style="width:100%;margin-top:6px;padding:3px;font-size:11px;background:var(--border);color:var(--text);"
                  onclick="SETTINGS.playSfx('find');">测试音效</button>
        </div>
      </div>
    `;

    // 时间设置（P0：统一 Tick 引擎的全局时间倍率）
    const cfgE = CONFIG.ENGINE || {};
    const multMin = cfgE.TIME_MULT_MIN || 1;
    const multMax = cfgE.TIME_MULT_MAX || 10;
    const mult = cfgE.TIME_MULT || 1;
    html += `
      <div class="panel">
        <div style="color:var(--accent);font-weight:bold;margin-bottom:8px;">时间设置</div>
        <div class="text-dim" style="font-size:11px;margin-bottom:6px;">
          全局时间倍率：统一 Tick 引擎按此倍率推进所有计时系统（修炼 / 建筑升级 / 炼丹 / 种植 / 秘境进度）。
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <input id="time-mult-range" type="range" min="${multMin}" max="${multMax}" step="1" value="${mult}"
                 style="flex:1;"
                 oninput="document.getElementById('time-mult-label').textContent='×'+this.value;"
                 onchange="SETTINGS.setTimeMult(parseInt(this.value));">
          <span id="time-mult-label" style="font-size:11px;color:var(--text-dim);width:36px;text-align:right;">×${mult}</span>
        </div>
        <div class="text-dim" style="font-size:10px;margin-top:4px;">当前倍率 ×${mult}（1 = 原速，倍率越高游戏时间推进越快）</div>
      </div>
    `;

    // 存档信息（P0：版本标识 / 迁移记录 / 离线摘要入口）
    const mig = STATE.migrationLog;
    const migRows = (mig && mig.log && mig.log.length > 0)
      ? mig.log.map(t => `<div style="font-size:10px;color:var(--text-dim);">· ${t}</div>`).join("")
      : `<div class="text-dim" style="font-size:10px;">无（存档结构版本一致，未触发迁移）</div>`;
    const os = STATE.offlineSummary;
    const offlineRow = os
      ? `<div style="font-size:11px;margin-top:6px;">上次离线时长：${formatDuration(os.elapsedMs)}${os.capped ? '（已按结算窗口上限结算）' : ''}</div>
         <button class="btn" style="width:100%;margin-top:6px;padding:3px;font-size:11px;background:var(--border);color:var(--text);"
                 onclick="MAIN.showOfflineSummary(STATE.offlineSummary)">查看离线收益摘要</button>`
      : `<div class="text-dim" style="font-size:10px;margin-top:6px;">本次启动没有需要结算的离线时长</div>`;
    html += `
      <div class="panel">
        <div style="color:var(--accent);font-weight:bold;margin-bottom:8px;">存档信息</div>
        <div style="font-size:11px;">存档结构版本：v${STATE.SAVE_VERSION}${STATE.player && STATE.player.saveVersion ? '（当前数据 v' + STATE.player.saveVersion + '）' : ''}</div>
        <div style="font-size:11px;margin-top:4px;">已注册迁移：${MIGRATIONS.list().length} 条</div>
        <div class="text-dim" style="font-size:10px;margin-top:6px;">本次启动的迁移记录：</div>
        ${migRows}
        ${offlineRow}
      </div>
    `;

    // 存档管理
    html += `
      <div class="panel">
        <div style="color:var(--accent);font-weight:bold;margin-bottom:8px;">存档管理</div>
        <div class="text-dim" style="font-size:11px;margin-bottom:8px;">清除存档将删除所有游戏进度，此操作不可恢复。</div>
        <button class="btn" style="width:100%;background:#ef4444;" onclick="SETTINGS.confirmClearSave()">清除存档</button>
      </div>
    `;

    // 关于
    html += `
      <div class="panel">
        <div style="color:var(--accent);font-weight:bold;margin-bottom:4px;">关于</div>
        <div class="text-dim" style="font-size:11px;">搜打撤 · 修仙放置</div>
        <div class="text-dim" style="font-size:10px;margin-top:2px;">版本 1.0.0</div>
      </div>
    `;

    // 返回按钮
    html += `<button class="btn" style="width:100%;" onclick="SETTINGS.playSfx('click');MAIN.switchView('cave')">返回洞府</button>`;

    return html;
  },

  /**
   * 确认清除存档（二次确认）
   */
  confirmClearSave() {
    const content = document.getElementById("view-content");
    if (!content) return;
    content.innerHTML = `
      <div class="panel" style="text-align:center;">
        <div style="color:#ef4444;font-weight:bold;font-size:14px;margin-bottom:8px;">确认清除存档？</div>
        <div class="text-dim" style="font-size:12px;margin-bottom:12px;">所有游戏进度将被永久删除，包括：<br>境界、灵石、装备、仓库、建筑等全部数据</div>
        <div style="display:flex;gap:6px;">
          <button class="btn" style="flex:1;background:#ef4444;" onclick="SETTINGS.clearSave()">确认清除</button>
          <button class="btn" style="flex:1;background:var(--border);color:var(--text);" onclick="MAIN.render()">取消</button>
        </div>
      </div>
    `;
  },

  /**
   * 执行清除存档
   */
  clearSave() {
    localStorage.removeItem("xdzc_save");
    STATE.createNewPlayer();
    STATE.save();
    alert("存档已清除，游戏已重置");
    MAIN.currentView = "cave";
    MAIN.render();
  }
};
