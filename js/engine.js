/**
 * ENGINE —— 统一 Tick 引擎（改造路线 B / P0 地基）
 *
 * 目标：把原先散落的三套定时器（main.js 100ms 修炼、cave.js 1s 进度刷新、
 * exploration.js 1s 移动/事件进度）收敛为一个统一的时间驱动引擎。
 *
 * 设计要点：
 * 1) 引擎只负责"时间推进"，不关心业务；各子系统通过 ENGINE.register 注册
 *    自己的 tickspeed（毫秒）与 tick 回调。
 * 2) timeMult = 全局时间倍率。倍率产生的额外时间累加到虚拟时钟 ENGINE.now()，
 *    计时类模块统一改用 ENGINE.now() 即可自动享受加速；timeMult = 1 时
 *    ENGINE.now() 与 Date.now() 完全等价（零行为变化）。
 * 3) 各模块可额外注册 offlineTick(elapsedMs)，用于离线/长时间挂起时的批量推进
 *    （比逐 tick 循环高效，且可只推进"确定性收益"部分）。
 * 4) 各模块可注册 stats()/statLabels/notes()，引擎据此自动生成离线收益摘要。
 *
 * 零依赖：全部为原生 ES5/ES6 语法，双击 index.html 即可运行。
 */
const ENGINE = {
  // ===== 配置（可在 config.js 的 CONFIG.ENGINE 中覆盖）=====
  timeMult: 1,               // 全局时间倍率
  frameMs: 100,              // 主循环帧间隔（与原有 100ms 修炼节拍一致）
  maxStepsPerFrame: 5000,    // 单帧单模块最大 tick 次数（防止长卡顿）
  catchUpMaxMs: 600000,      // 单帧最大追赶时长，超出部分走批量推进

  // ===== 运行时状态 =====
  modules: [],               // 已注册模块
  running: false,
  lastSummary: null,         // 最近一次批量推进的摘要
  offlineLog: [],            // 批量推进过程中各模块写入的文字日志

  _timer: null,
  _lastFrame: 0,
  _extraMs: 0,               // timeMult 累积的虚拟时间增量

  /**
   * 虚拟时钟：timeMult = 1 时 === Date.now()
   * 所有"计时型"逻辑（建造/炼丹/种植/移动）统一使用它
   */
  now() {
    return Date.now() + this._extraMs;
  },

  /**
   * 离线结算窗口上限（毫秒）
   * 优先取 CONFIG.ENGINE.OFFLINE_MAX_HOURS，其次沿用旧字段 CONFIG.OFFLINE_MAX_HOURS
   */
  maxOfflineMs() {
    const cfg = (typeof CONFIG !== 'undefined' && CONFIG.ENGINE) || {};
    const hours = cfg.OFFLINE_MAX_HOURS
      || (typeof CONFIG !== 'undefined' ? CONFIG.OFFLINE_MAX_HOURS : 0)
      || 24;
    return hours * 3600000;
  },

  /**
   * 注册子系统
   * @param {Object} def { name, label, tickspeed, tick, offlineTick?, stats?, statLabels?, notes? }
   */
  register(def) {
    if (!def || !def.name || typeof def.tick !== 'function') {
      console.warn('[ENGINE] 注册失败：缺少 name 或 tick', def);
      return null;
    }
    const mod = {
      name: def.name,
      label: def.label || def.name,
      tickspeed: Math.max(1, def.tickspeed || 1000),
      tick: def.tick,
      offlineTick: typeof def.offlineTick === 'function' ? def.offlineTick : null,
      stats: typeof def.stats === 'function' ? def.stats : null,
      statLabels: def.statLabels || null,
      notes: typeof def.notes === 'function' ? def.notes : null,
      acc: 0
    };
    const i = this.modules.findIndex(m => m.name === mod.name);
    if (i >= 0) this.modules[i] = mod; else this.modules.push(mod);
    return mod;
  },

  /** 注销子系统（供按需注册的进度模块使用） */
  unregister(name) {
    const i = this.modules.findIndex(m => m.name === name);
    if (i >= 0) this.modules.splice(i, 1);
  },

  getModule(name) {
    return this.modules.find(m => m.name === name) || null;
  },

  /** 供模块在批量推进时写入摘要文字 */
  logOffline(text) {
    if (text) this.offlineLog.push(String(text));
  },

  /** 启动主循环 */
  start() {
    if (this.running) return;
    const cfg = (typeof CONFIG !== 'undefined' && CONFIG.ENGINE) || {};
    if (typeof cfg.TIME_MULT === 'number' && cfg.TIME_MULT > 0) this.timeMult = cfg.TIME_MULT;
    if (cfg.FRAME_MS) this.frameMs = cfg.FRAME_MS;
    if (cfg.MAX_STEPS_PER_FRAME) this.maxStepsPerFrame = cfg.MAX_STEPS_PER_FRAME;
    if (cfg.CATCHUP_MAX_MS) this.catchUpMaxMs = cfg.CATCHUP_MAX_MS;

    this.running = true;
    this._lastFrame = Date.now();
    this.modules.forEach(m => { m.acc = 0; });
    this._timer = setInterval(() => this.step(), this.frameMs);

    // 标签页重新可见时立即追赶一次（浏览器会节流后台定时器）
    if (typeof document !== 'undefined' && document.addEventListener) {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) this.step();
      });
    }
  },

  stop() {
    if (this._timer) clearInterval(this._timer);
    this._timer = null;
    this.running = false;
  },

  /** 单帧推进：按真实经过时间 × timeMult 计算各模块应执行的 tick 次数 */
  step() {
    const now = Date.now();
    let dt = now - this._lastFrame;
    this._lastFrame = now;
    if (dt <= 0) return;

    const scaled = dt * this.timeMult;
    this._extraMs += (scaled - dt);

    // 长时间挂起（后台节流 / 系统休眠 / 关闭显示屏）：走批量推进，避免单帧内跑几十万次 tick
    if (dt > this.catchUpMaxMs) {
      this.modules.forEach(m => { m.acc = 0; });
      const summary = this.advance(Math.min(dt, this.maxOfflineMs()));
      summary.source = 'catchup';
      this.lastSummary = summary;
      if (!summary.isEmpty && typeof MAIN !== 'undefined' && MAIN.showCatchUpNotice) {
        MAIN.showCatchUpNotice(summary);
      }
      return;
    }

    for (const m of this.modules) {
      m.acc += scaled;
      let steps = Math.floor(m.acc / m.tickspeed);
      if (steps <= 0) continue;
      if (steps > this.maxStepsPerFrame) {
        console.warn(`[ENGINE] ${m.name} 单帧 tick 次数超上限，已丢弃 ${steps - this.maxStepsPerFrame} 次`);
        steps = this.maxStepsPerFrame;
      }
      m.acc -= steps * m.tickspeed;
      for (let i = 0; i < steps; i++) {
        try {
          m.tick();
        } catch (e) {
          console.error(`[ENGINE] ${m.name}.tick 异常：`, e);
        }
      }
    }
  },

  /**
   * 批量推进（离线结算 / 长时间挂起追赶）
   * 只调用注册了 offlineTick 的模块，且模块内部只推进"确定性收益"部分。
   * @param {number} elapsedMs 真实经过毫秒
   * @returns {Object} 摘要 { elapsedMs, hours, sections, isEmpty, source }
   */
  advance(elapsedMs) {
    this.offlineLog = [];
    if (!elapsedMs || elapsedMs <= 0) {
      return { elapsedMs: 0, hours: 0, sections: [], isEmpty: true, source: 'none' };
    }
    const before = this.collectStats();
    const eligible = this.modules.filter(m => m.offlineTick);

    for (const m of eligible) {
      try {
        m.offlineTick(elapsedMs);
      } catch (e) {
        console.error(`[ENGINE] ${m.name}.offlineTick 异常：`, e);
        this.logOffline(`${m.label}：离线结算异常（${e.message}）`);
      }
    }
    const after = this.collectStats();

    // 离线已结算，清空累积器，避免恢复后立即重复结算
    this.modules.forEach(m => { m.acc = 0; });

    const summary = this.buildSummary(before, after, elapsedMs);
    this.lastSummary = summary;
    return summary;
  },

  collectStats() {
    const all = {};
    for (const m of this.modules) {
      if (!m.stats) continue;
      try {
        all[m.name] = m.stats() || {};
      } catch (e) {
        all[m.name] = {};
      }
    }
    return all;
  },

  buildSummary(before, after, elapsedMs) {
    const sections = [];
    for (const m of this.modules) {
      const items = [];
      if (m.stats) {
        const b = before[m.name] || {};
        const a = after[m.name] || {};
        const labels = m.statLabels || {};
        Object.keys(a).forEach(k => {
          const bv = Number(b[k] || 0);
          const av = Number(a[k] || 0);
          const d = av - bv;
          if (!isFinite(d) || d === 0) return;
          const meta = labels[k] || {};
          items.push(`${meta.label || k} ${d > 0 ? '+' : ''}${this.fmtNum(d)}${meta.unit || ''}`);
        });
      }
      if (m.notes) {
        try {
          (m.notes() || []).forEach(t => { if (t) items.push(String(t)); });
        } catch (e) { /* 摘要失败不影响主流程 */ }
      }
      if (items.length > 0) sections.push({ name: m.name, label: m.label, items });
    }
    // 模块未提供 stats/notes 时，回落到通用日志
    if (sections.length === 0 && this.offlineLog.length > 0) {
      sections.push({ name: 'log', label: '其他', items: this.offlineLog.slice() });
    }
    return {
      elapsedMs,
      hours: elapsedMs / 3600000,
      sections,
      isEmpty: sections.length === 0,
      source: 'offline'
    };
  },

  fmtNum(n) {
    const v = Math.abs(n) >= 100 && Number.isInteger(n) ? n : Math.round(n * 10) / 10;
    return Number(v).toLocaleString();
  }
};

/**
 * 把秒数格式化为可读时长（离线摘要复用）
 */
function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}小时${m}分`;
  if (m > 0) return `${m}分${s}秒`;
  return `${s}秒`;
}
