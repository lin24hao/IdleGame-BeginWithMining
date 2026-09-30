const EXPLORATION = {
  selectedMap: null,
  plannedPath: [],
  currentPoint: 0,
  eventQueue: [],
  isProcessingEvents: false,
  // ===== P0 新增运行态 =====
  moveProgress: 0,      // 当前移动进度条百分比（原为闭包内局部变量）
  eventProgress: 0,     // 当前事件进度条百分比（原为闭包内局部变量）
  _pausedMs: 0,         // 离线期间秘境累计暂停时长
  _pauseNote: null,     // 离线摘要中的秘境提示文字

  // === 秘境选择界面 ===
  getMapSelectHTML() {
    const playerPower = CULTIVATION.getPlayerPower();
    let html = `
      <div class="panel">
        <h2 style="color:var(--accent);margin-bottom:8px;">选择探索秘境</h2>
        <div class="text-dim" style="font-size:11px;margin-bottom:6px;">除入场费外无境界限制，请根据战力推荐合理选择</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
    `;
    CONFIG.MAPS.forEach(map => {
      const unlocked = STATE.player.unlockedMaps.includes(map.id);
      const affordable = STATE.player.spiritStones >= map.cost;
      const recPower = Math.floor((map.powerMin + map.powerMax) / 2);
      const ratio = recPower / Math.max(1, playerPower);
      let diffColor = "var(--q-good)";
      let diffLabel = "简单";
      if (ratio >= 0.8 && ratio < 1.3) { diffColor = "var(--accent)"; diffLabel = "推荐"; }
      else if (ratio >= 1.3 && ratio < 2.0) { diffColor = "#fb923c"; diffLabel = "困难"; }
      else if (ratio >= 2.0) { diffColor = "#ef4444"; diffLabel = "极难"; }
      html += `
        <div class="panel" style="cursor:${unlocked && affordable ? 'pointer' : 'not-allowed'};margin-bottom:0;padding:8px;border:1px solid var(--border);${(!unlocked || !affordable) ? 'opacity:0.6;' : ''}"
             onmouseover="${unlocked && affordable ? 'this.style.borderColor=getComputedStyle(document.documentElement).getPropertyValue(\'--accent\');' : ''}"
             onmouseout="this.style.borderColor='var(--border)';"
             onclick="${unlocked && affordable ? 'EXPLORATION.selectMap(' + map.id + ')' : ''}">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="font-weight:bold;color:var(--accent);font-size:13px;">${map.name}</div>
            <span style="font-size:10px;color:${diffColor};font-weight:bold;padding:1px 4px;border:1px solid ${diffColor};border-radius:2px;">${diffLabel}</span>
          </div>
          <div class="text-dim" style="font-size:10px;margin-top:2px;">推荐：${CONFIG.REALMS[map.realm]}${map.layerMin}-${map.layerMax}层</div>
          <div class="text-dim" style="font-size:10px;">战力区间 ⚔${map.powerMin} ~ ⚔${map.powerMax}</div>
          <div style="font-size:12px;margin-top:2px;">${map.cost === 0 ? '🆓 免费' : '💰' + map.cost.toLocaleString() + '灵石'}</div>
          ${!affordable ? '<div style="font-size:10px;color:#ef4444;">灵石不足</div>' : ''}
        </div>
      `;
    });
    html += `</div></div>`;
    html += `<button class="btn" style="width:100%;margin-top:4px;" onclick="MAIN.switchView('cave')">返回洞府</button>`;
    return html;
  },

  selectMap(mapId) {
    const map = CONFIG.MAPS.find(m => m.id === mapId);
    if (!map || STATE.player.spiritStones < map.cost) return;
    STATE.player.spiritStones -= map.cost;
    this.selectedMap = map;
    this.plannedPath = [];
    this.currentPoint = 0;
    this.eventQueue = [];
    this.isProcessingEvents = false;
    // 自动生成装备列表，generateEquipOptions会调用MAIN.refreshCave()
    // 由于已修复refreshCave逻辑，现在会正确路由到renderForgeStep()
    if (typeof CAVE !== 'undefined' && CAVE.generateEquipOptions) {
      CAVE.generateEquipOptions(true);
    } else {
      this.renderForgeStep();
    }
  },

  // 装备选择独立界面：选好装备后才进路径规划
  renderForgeStep() {
    const content = document.getElementById("view-content");
    if (!content) return;
    const map = this.selectedMap;
    let html = `
      <div class="panel">
        <h2 style="color:var(--accent);">${map.name} · 装备选择</h2>
        <div class="text-dim">出发前可选择装备，提升战斗力</div>
      </div>
    `;
    // 调用炼器界面
    if (typeof CAVE !== 'undefined' && CAVE.getForgeHTML) {
      html += CAVE.getForgeHTML();
    } else {
      html += `<div class="panel"><div class="text-dim">装备系统尚未解锁</div></div>`;
    }
    html += `
      <div style="display:flex;gap:6px;">
        <button class="btn" style="flex:1;" onclick="EXPLORATION.confirmForgeAndContinue()">确认装备并继续</button>
        <button class="btn" style="flex:1;" onclick="EXPLORATION.selectedMap=null;MAIN.switchView('explore')">返回秘境选择</button>
      </div>
    `;
    content.innerHTML = html;
  },

  // 确认装备后进入路径规划
  confirmForgeAndContinue() {
    const p = STATE.player;
    if (typeof CAVE !== 'undefined' && CAVE.selectedEquipList !== null && CAVE.equipOptions) {
      const list = CAVE.equipOptions[CAVE.selectedEquipList];
      if (list) {
        Object.keys(list).forEach(type => {
          const equip = list[type];
          p.equipment[type] = {
            name: equip.name,
            quality: equip.quality,
            type: equip.type,
            stats: { ...equip.stats },
            baseValue: equip.baseValue || 100
          };
        });
      }
      CAVE.equipOptions = null;
      CAVE.selectedEquipList = null;
    }
    this.renderPathPlanning();
  },

  renderPathPlanning() {
    const content = document.getElementById("view-content");
    if (!content) return;
    const map = this.selectedMap;
    content.innerHTML = `
      <div class="panel">
        <h2 style="color:var(--accent);">${map.name} · 路径规划</h2>
        <div class="text-dim">选择3-5个点位进行探索</div>
      </div>
      <div class="panel" id="path-map" style="position:relative;height:280px;padding:0;"></div>
      <div class="panel" id="path-info"></div>
      <div style="display:flex;gap:6px;">
        <button class="btn" style="flex:1;" onclick="EXPLORATION.autoPath()">自动路径</button>
        <button class="btn" style="flex:1;" onclick="EXPLORATION.startExpedition()">开始探索</button>
        <button class="btn" style="flex:1;" onclick="EXPLORATION.renderForgeStep()">返回装备选择</button>
      </div>
    `;
    this.renderPointMap();
    this.updatePathInfo();
  },

  renderPointMap() {
    const container = document.getElementById("path-map");
    if (!container) return;
    let html = "";
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2 - Math.PI / 2;
      const x = 50 + 35 * Math.cos(angle);
      const y = 50 + 35 * Math.sin(angle);
      const id = i + 1;
      const selected = this.plannedPath.includes(id);
      const order = this.plannedPath.indexOf(id);
      html += `
        <div style="position:absolute;left:${x}%;top:${y}%;transform:translate(-50%,-50%);width:42px;height:42px;border-radius:50%;background:${selected ? 'var(--accent)' : 'var(--border)'};display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;border:2px solid ${selected ? '#fff' : 'transparent'};"
             onclick="EXPLORATION.togglePoint(${id})">
          <span style="color:${selected ? '#1a1a1f' : 'var(--text-dim)'};font-size:9px;">点位${id}</span>
          ${selected ? `<span style="color:#1a1a1f;font-weight:bold;font-size:11px;">第${order + 1}站</span>` : ''}
        </div>
      `;
    }
    container.innerHTML = html;
  },

  togglePoint(pointId) {
    const idx = this.plannedPath.indexOf(pointId);
    if (idx >= 0) {
      this.plannedPath.splice(idx, 1);
    } else if (this.plannedPath.length < 5) {
      this.plannedPath.push(pointId);
    }
    this.renderPointMap();
    this.updatePathInfo();
  },

  autoPath() {
    const count = 3 + Math.floor(Math.random() * 3);
    const available = [1, 2, 3, 4, 5, 6, 7];
    this.plannedPath = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * available.length);
      this.plannedPath.push(available.splice(idx, 1)[0]);
    }
    this.renderPointMap();
    this.updatePathInfo();
  },

  updatePathInfo() {
    const el = document.getElementById("path-info");
    if (!el) return;
    if (this.plannedPath.length === 0) {
      el.innerHTML = `<div class="text-dim">尚未选择点位</div>`;
      return;
    }
    let totalEvents = 0;
    for (let i = 0; i < this.plannedPath.length - 1; i++) {
      totalEvents += this.getEventCount(this.plannedPath[i], this.plannedPath[i + 1]);
    }
    el.innerHTML = `
      <div>路径：${this.plannedPath.join(" → ")}</div>
      <div class="text-dim">预估事件：约${totalEvents}次</div>
    `;
  },

  // 根据两点距离计算事件数量：近距离3个，远距离最多10个
  getEventCount(fromPoint, toPoint) {
    const distance = Math.abs(fromPoint - toPoint);
    // 距离1=3事件, 距离2=5, 距离3=7, 距离4=9, 距离5-6=10
    return Math.min(10, 3 + (distance - 1) * 2);
  },

  // === 开始探索（原名startExploration，现改名startExpedition）===
  startExpedition() {
    if (this.plannedPath.length < 3) {
      alert("至少选择3个点位");
      return;
    }
    const map = this.selectedMap;
    STATE.player.currentMap = map.id;
    STATE.player.currentPath = [...this.plannedPath];
    STATE.player.pathIndex = 0;
    STATE.player.inExploration = true;
    this.selectedMap = null;
    this.plannedPath = [];
    SETTINGS.playSfx('click');
    MAIN.currentView = "ingame";
    MAIN.render();
  },

  // === 场内固定布局：顶部路径 / 中间状态 / 底部日志 ===
  renderInGame() {
    const app = document.getElementById("app");
    app.innerHTML = `
      <div id="ingame-top"></div>
      <div id="ingame-stage"></div>
      <div id="ingame-log"></div>
    `;
    this.updateTopBar();
    this.clearLog();
    this.startMovement();
  },

  // 顶部路径栏 + 当前装备显示
  updateTopBar() {
    const el = document.getElementById("ingame-top");
    if (!el) return;
    const p = STATE.player;
    const mapName = CONFIG.MAPS.find(m => m.id === p.currentMap).name;
    const pathStr = p.currentPath.map((pt, i) => {
      if (i < p.pathIndex) return `<span style="color:var(--text-dim);">点位${pt}</span>`;
      if (i === p.pathIndex) return `<span style="color:var(--accent);font-weight:bold;">点位${pt}</span>`;
      return `<span>点位${pt}</span>`;
    }).join(" → ");
    // 装备小图标显示
    const eq = p.equipment;
    const eqIcons = [];
    if (eq.weapon) eqIcons.push(`<span style="font-size:11px;">⚔${eq.weapon.name}</span>`);
    if (eq.armor) eqIcons.push(`<span style="font-size:11px;">🛡${eq.armor.name}</span>`);
    if (eq.accessory) eqIcons.push(`<span style="font-size:11px;">💍${eq.accessory.name}</span>`);
    const eqStr = eqIcons.length > 0 ? `<div style="font-size:10px;margin-top:2px;color:var(--q-legend);">${eqIcons.join(' ')}</div>` : '';
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="color:var(--accent);font-weight:bold;">${mapName}</span>
        <span class="text-dim" style="font-size:11px;">第${p.pathIndex + 1}/${p.currentPath.length}站</span>
      </div>
      <div style="font-size:11px;margin-top:2px;">${pathStr}</div>
      ${eqStr}
    `;
  },

  // === 移动阶段：初始化事件队列，然后逐个事件交替移动/处理 ===
  startMovement() {
    const p = STATE.player;
    if (p.pathIndex >= p.currentPath.length) {
      this.finishExploration();
      return;
    }

    const fromPoint = p.pathIndex > 0 ? p.currentPath[p.pathIndex - 1] : 0;
    const toPoint = p.currentPath[p.pathIndex];
    this.currentPoint = toPoint;

    // 计算事件数量并生成队列
    const eventCount = fromPoint === 0 ? 3 : this.getEventCount(fromPoint, toPoint);
    this.eventQueue = this.generateEvents(eventCount);

    this.log(`出发：前往点位${toPoint}，预计遭遇${eventCount}次事件`, "var(--accent)");

    // 开始移动到第一个事件
    this.moveToNextEvent();
  },

  // 移动到下一个事件（10秒进度条），到达后处理事件
  moveToNextEvent() {
    if (this.eventQueue.length === 0) {
      // 所有事件处理完，抵达点位，开始搜索
      this.log(`抵达点位${this.currentPoint}，开始搜索...`, "var(--accent)");
      setTimeout(() => SEARCH.startSearch(this.currentPoint), 800);
      return;
    }

    const remaining = this.eventQueue.length;
    const stage = document.getElementById("ingame-stage");
    if (stage) {
      stage.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:20px;">
          <div style="color:var(--accent);font-size:16px;font-weight:bold;margin-bottom:12px;">前往下一个事件点</div>
          <div style="width:80%;height:6px;background:var(--border);border-radius:3px;overflow:hidden;margin-bottom:12px;">
            <div id="move-bar" style="width:0%;height:100%;background:var(--accent);transition:width 0.3s;"></div>
          </div>
          <div class="text-dim" style="font-size:12px;">剩余事件：${remaining}次</div>
        </div>
      `;
    }

    // 移动进度条：默认10秒走完，贵重物品御风步可加速
    // P0：由独立 setInterval(1s) 改为注册到统一 Tick 引擎（节拍与判定条件完全一致）
    const self = this;
    const moveBuff = getPreciousBuffTotal('buff_movement');
    const moveDuration = 10 * (1 - moveBuff); // 加成20%则8秒
    const stepPct = 100 / moveDuration;        // 每秒增长百分比
    this.moveProgress = 0;
    this._unregisterMoveTimer();
    this._moveModule = ENGINE.register({
      name: 'explore-move',
      label: '秘境移动',
      tickspeed: 1000,
      tick: () => {
        self.moveProgress += stepPct;
        const bar = document.getElementById("move-bar");
        if (bar) bar.style.width = Math.min(100, self.moveProgress) + "%";
        if (self.moveProgress >= 100) {
          self._unregisterMoveTimer();
          self.moveProgress = 0;
          // 到达事件点，处理当前事件
          self.processCurrentEvent();
        }
      }
    });
  },

  // 生成N个事件
  generateEvents(count) {
    const events = [];
    for (let i = 0; i < count; i++) {
      const total = CONFIG.EVENTS.reduce((s, e) => s + e.weight, 0);
      let r = Math.random() * total;
      const evt = CONFIG.EVENTS.find(e => { r -= e.weight; return r <= 0; });
      if (evt) events.push(evt);
    }
    return events;
  },

  // 处理当前事件（取出一个事件，战斗或非战斗）
  processCurrentEvent() {
    if (this.eventQueue.length === 0) {
      this.moveToNextEvent();
      return;
    }

    const evt = this.eventQueue.shift();
    this.log(`⚡ ${evt.name}`, "var(--accent)");

    if (evt.type === "monster" || evt.type === "rogue") {
      // 战斗：暂停事件队列，等战斗回调
      SETTINGS.playSfx('combat');
      COMBAT.start(evt.type);
    } else {
      // 非战斗事件：显示3秒进度条后再执行 applyEvent
      this.showEventProgress(evt);
    }
  },

  // 显示非战斗事件的3秒进度条
  showEventProgress(evt) {
    const stage = document.getElementById("ingame-stage");
    if (stage) {
      stage.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:20px;">
          <div style="color:var(--accent);font-size:14px;font-weight:bold;margin-bottom:8px;">${evt.name}</div>
          <div style="width:80%;height:6px;background:var(--border);border-radius:3px;overflow:hidden;">
            <div id="event-bar" style="width:0%;height:100%;background:var(--q-good);transition:width 0.3s;"></div>
          </div>
        </div>
      `;
    }
    // 3秒进度条：每秒 +33.3%
    // P0：由独立 setInterval(1s) 改为注册到统一 Tick 引擎（节拍与判定条件完全一致）
    const self = this;
    this.eventProgress = 0;
    // 清理可能残留的进度模块
    this._unregisterEventTimer();
    this._eventModule = ENGINE.register({
      name: 'explore-event',
      label: '秘境事件',
      tickspeed: 1000,
      tick: () => {
        self.eventProgress += 33.3;
        const bar = document.getElementById("event-bar");
        if (bar) bar.style.width = Math.min(100, self.eventProgress) + "%";
        if (self.eventProgress >= 100) {
          self._unregisterEventTimer();
          self.eventProgress = 0;
          // 执行事件效果后移动到下一个事件
          self.applyEvent(evt);
          setTimeout(() => self.moveToNextEvent(), 300);
        }
      }
    });
  },

  applyEvent(evt) {
    if (evt.type === "chance") {
      const item = SEARCH.generateRandomItem(STATE.player.currentMap);
      if (item) {
        STATE.player.storageBag.items.push(item);
        this.log(`获得 ${item.name}`, "var(--q-good)");
        SETTINGS.playSfx('find');
      }
    } else if (evt.type === "trap") {
      // 陷阱：损失储物袋中随机一件物品（仅限场内，不影响场外灵石）
      const bag = STATE.player.storageBag.items;
      if (bag.length > 0) {
        const idx = Math.floor(Math.random() * bag.length);
        const lost = bag.splice(idx, 1)[0];
        this.log(`触发陷阱！丢失了 ${lost.name}`, "#ef4444");
      } else {
        this.log(`触发陷阱！但储物袋空空如也，侥幸无事`, "var(--text-dim)");
      }
    } else if (evt.type === "cave") {
      // 发现洞府：获得一件高品质物品（场内收益，不涉及场外灵石）
      const mapId = STATE.player.currentMap;
      const qualities = ['rare', 'epic'];
      const qk = qualities[Math.floor(Math.random() * qualities.length)];
      const mapItems = CONFIG.ITEMS.filter(it => it.mapId === mapId && it.quality === qk);
      if (mapItems.length > 0) {
        const found = { ...mapItems[Math.floor(Math.random() * mapItems.length)], uid: Date.now() + Math.random() };
        STATE.player.storageBag.items.push(found);
        this.log(`发现洞府！获得 ${found.name}`, "var(--q-legend)");
      } else {
        this.log(`发现洞府！但里面空空如也...`, "var(--text-dim)");
      }
      SETTINGS.playSfx('find');
    } else if (evt.type === "lost") {
      this.log(`迷路了，多绕了些路...`, "var(--text-dim)");
    } else if (evt.type === "material") {
      // 灵材事件：按当前秘境境界获取对应材料
      const realm = CONFIG.MAPS.find(m => m.id === STATE.player.currentMap).realm;
      const matNames = CONFIG.MATERIAL_NAMES[realm];
      const idx = Math.floor(Math.random() * matNames.length);
      const matId = "mat_" + realm + "_" + idx;
      STATE.player.materials[matId] = (STATE.player.materials[matId] || 0) + 1;
      this.log(`发现灵材：${matNames[idx]}`, "#4ade80");
      SETTINGS.playSfx('find');
    }
  },

  // === 回调：搜索完成 ===
  continueAfterSearch() {
    STATE.player.pathIndex++;
    this.updateTopBar();
    if (STATE.player.pathIndex >= STATE.player.currentPath.length) {
      this.finishExploration();
    } else {
      this.startMovement();
    }
  },

  // === 回调：战斗结束 ===
  continueAfterCombat() {
    setTimeout(() => this.moveToNextEvent(), 1200);
  },

  finishExploration() {
    STATE.player.inExploration = false;
    STATE.player.explorationRuntime = null;   // P0：撤离后清除秘境快照
    this._unregisterMoveTimer();
    this._unregisterEventTimer();
    this.moveProgress = 0;
    this.eventProgress = 0;
    this._pausedMs = 0;
    this._pauseNote = null;
    this.log("探索完成！正在撤离...", "var(--accent)");
    setTimeout(() => {
      MAIN.currentView = "settlement";
      MAIN.render();
    }, 1500);
  },

  // === 日志系统 ===
  log(text, color) {
    const el = document.getElementById("ingame-log");
    if (!el) return;
    const div = document.createElement("div");
    div.className = "log-entry";
    div.style.color = color || "var(--text)";
    div.textContent = text;
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
  },

  clearLog() {
    const el = document.getElementById("ingame-log");
    if (el) el.innerHTML = "";
  },

  /* ================== P0：离线与跨会话恢复（改造路线B 地基）================== */

  /** P0：注销秘境移动进度模块（替代原 clearInterval(this._moveTimer)） */
  _unregisterMoveTimer() {
    if (typeof ENGINE !== 'undefined') ENGINE.unregister('explore-move');
  },

  /** P0：注销秘境事件进度模块（替代原 clearInterval(this._eventTimer)） */
  _unregisterEventTimer() {
    if (typeof ENGINE !== 'undefined') ENGINE.unregister('explore-event');
  },

  /**
   * 秘境运行态快照（P0）：随存档落盘，用于跨会话恢复
   * 返回 null 表示当前不在秘境中（此时存档中的快照字段也会被置空）
   */
  snapshot() {
    const p = STATE.player;
    if (!p || !p.inExploration) return null;
    return {
      mapId: p.currentMap,
      path: Array.isArray(p.currentPath) ? p.currentPath.slice() : [],
      pathIndex: p.pathIndex || 0,
      pausedMs: this._pausedMs || 0,
      savedAt: Date.now()
    };
  },

  /**
   * 从快照恢复秘境运行态（P0）
   * @returns {boolean} 是否恢复成功
   */
  restoreFromSnapshot() {
    const p = STATE.player;
    const snap = p && p.explorationRuntime;
    if (!snap) return false;
    if (!CONFIG.MAPS.some(m => m.id === snap.mapId)) { p.explorationRuntime = null; return false; }
    p.currentMap = snap.mapId;
    p.currentPath = Array.isArray(snap.path) ? snap.path.slice() : [];
    p.pathIndex = Math.max(0, Math.min(snap.pathIndex || 0, Math.max(0, p.currentPath.length - 1)));
    p.inExploration = true;
    this._pausedMs = snap.pausedMs || 0;
    return true;
  },

  /**
   * 启动时的秘境恢复入口（P0，由 MAIN.init 在离线结算后调用）
   * @returns {boolean} 是否需要回到场内界面
   */
  resumeAfterOffline() {
    const p = STATE.player;
    if (!p) return false;
    // 幂等：可安全地重复调用（仅在页面加载时调用一次）
    if (p.explorationRuntime) this.restoreFromSnapshot();
    if (!p.inExploration) { p.explorationRuntime = null; return false; }
    if (!Array.isArray(p.currentPath) || p.currentPath.length === 0) {
      p.inExploration = false;
      p.explorationRuntime = null;
      return false;
    }
    return true;   // 由 MAIN 负责切到 ingame 视图（renderInGame 会从当前站点继续）
  },

  /**
   * 离线推进（P0）
   * 设计取舍：秘境是强交互玩法（路径规划 / 搜索 / 战斗 / 事件抉择），
   * 离线自动模拟会在玩家不可控的情况下产生战斗与随机损失，因此 P0 阶段
   * 采取"进度冻结 + 原位恢复"的保守策略，仅在离线摘要中如实提示；
   * 自动化扫荡式离线产出留待后续阶段（需要先做战力量化与安全结算规则）。
   */
  offlineTick(elapsedMs) {
    const p = STATE.player;
    if (!p || !p.inExploration) { this._pauseNote = null; return; }
    this._pausedMs = (this._pausedMs || 0) + Math.max(0, elapsedMs || 0);
    const total = (p.currentPath || []).length;
    const idx = Math.min((p.pathIndex || 0) + 1, total);
    const remain = Math.max(0, total - (p.pathIndex || 0));
    this._pauseNote = `秘境：离线期间进度冻结（第 ${idx}/${total} 站，剩余约 ${remain} 站），已原位恢复`;
  },

  /** 离线摘要用的数值快照 */
  stats() {
    const p = STATE.player || {};
    return {
      inRun: p.inExploration ? 1 : 0,
      stations: p.inExploration ? (p.currentPath || []).length : 0,
      bagItems: (p.storageBag && p.storageBag.items) ? p.storageBag.items.length : 0
    };
  },

  statLabels: {
    inRun:    { label: "进行中秘境", unit: "个" },
    stations: { label: "秘境站点", unit: "站" },
    bagItems: { label: "储物袋物品", unit: "件" }
  },

  /** 离线条目补充文字（秘境暂停提示） */
  notes() { return this._pauseNote ? [this._pauseNote] : []; }
};


// ===== 注册到统一 Tick 引擎（P0）=====
// tick 为空实现：秘境移动（explore-move）与事件（explore-event）进度条
// 在需要时按 1s 节拍动态注册，避免空转。
ENGINE.register({
  name: 'exploration',
  label: '秘境探索',
  tickspeed: 1000,
  tick: () => {},
  offlineTick: (ms) => EXPLORATION.offlineTick(ms),
  stats: () => EXPLORATION.stats(),
  statLabels: EXPLORATION.statLabels,
  notes: () => EXPLORATION.notes()
});
