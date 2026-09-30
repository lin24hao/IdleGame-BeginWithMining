const STATE = {
  player: null,
  SAVE_VERSION: 2,        // 当前存档结构版本（P0：版本标识 + 迁移骨架）
  pendingOfflineMs: 0,    // 本次启动待结算的离线时长（真实毫秒）
  offlineSummary: null,   // 离线收益摘要（由 ENGINE.advance 生成）
  migrationLog: null,     // 本次启动的存档迁移记录

  /**
   * 初始化：读取存档或创建新玩家，执行版本迁移，并记录待结算离线时长
   */
  init() {
    // 说明（P0）：离线结算不在此处直接执行，改由 MAIN.init 在统一 Tick 引擎
    // 各子系统注册完成后调用 STATE.settleOffline()，以便一次性结算全系统收益。
    const saved = localStorage.getItem("xdzc_save");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.player = parsed.data || parsed;

        // 存档版本化与迁移（P0）：旧存档无 version 字段时按 v1 处理
        const fromVersion = parseInt(parsed.version, 10) || 1;
        this.migrationLog = MIGRATIONS.run(this.player, fromVersion, this.SAVE_VERSION);
        if (this.migrationLog.log.length > 0) {
          this.migrationLog.log.forEach(t => console.log('[MIGRATIONS] ' + t));
        }

        // 记录待结算的离线时长（真实经过时间；结算窗口上限由 ENGINE.maxOfflineMs 控制）
        const now = Date.now();
        const lastOnline = this.player.lastOnline || now;
        this.pendingOfflineMs = Math.max(0, now - lastOnline);
        this.player.lastOnline = now;
      } catch (e) {
        this.createNewPlayer();
      }
    } else {
      this.createNewPlayer();
    }
    this.startAutoSave();
  },

  /**
   * 创建新玩家，初始化所有数据字段
   */
  createNewPlayer() {
    this.player = {
      spiritStones: 100,
      currentRealm: 0,
      currentLayer: 1,
      cultivation: 0,
      attrs: { atk:0, def:0, hp:0, spd:0, crit:0, critDmg:0, dodge:0, block:0, combo:0 },
      attrPoints: 5,
      storageBag: { items: [], capacity: 999999 }, // 储物袋（实际取消容量限制）
      storageRing: { items: [], capacity: CONFIG.RING_CAPACITY },
      warehouse: [],                              // 仓库（无限大），存放从储物戒转入的物品
      caveBuildings: { lingtian: 1, liandan: 1, lianqi: 1 }, // 洞府建筑等级
      buildingUpgrades: { lingtian: null, liandan: null, lianqi: null }, // 建筑升级进度，null或{targetLevel, startTime, endTime}
      herbSlots: [],                              // 种植槽数组，每个元素为 null 或 { herbId, plantTime, startTime, ready }
      craftingQueue: [],                          // 炼丹队列 [{recipeId, startTime, endTime}]
      autoCraft: false,                           // 是否自动炼丹
      materials: {},                              // 炼丹材料库存，格式 { "mat_0_0": 5 }
      recipes: [],                                // 已购配方ID列表
      danBuffs: {},                               // 丹药服用记录，格式 { "0_atk": 3 }
      equipment: { weapon: null, armor: null, accessory: null }, // 当前装备
      refreshCount: 0,                            // 炼器炉刷新次数
      pills: {},                                  // 丹药库存，格式 { recipeId: count }
      breakthroughDiscount: false,                // 破镜丹标记：降低突破修为30%
      preciousCollection: {},   // 贵重物品收集进度，格式 { "gf_qingxin": 2 }
      unlockedMaps: [1,2,3,4,5,6,7,8,9],
      currentMap: null,
      currentPath: [],
      pathIndex: 0,
      inExploration: false,
      explorationRuntime: null,   // 秘境运行态快照（P0）：用于跨会话恢复探索进度
      lastOnline: Date.now(),
      saveVersion: this.SAVE_VERSION   // 存档结构版本（P0）
    };
  },

  /**
   * 离线结算入口（P0）
   * 由 MAIN.init 在 ENGINE 各模块注册完成后调用，结算范围覆盖：
   * 修炼 / 洞府建筑升级 / 炼丹队列（含自动炼丹链）/ 种植状态 / 探索进度。
   * @returns {Object|null} 摘要对象
   */
  settleOffline() {
    const elapsedRaw = this.pendingOfflineMs || 0;
    this.pendingOfflineMs = 0;
    if (elapsedRaw <= 0 || typeof ENGINE === "undefined") {
      this.offlineSummary = null;
      return null;
    }
    const capMs = ENGINE.maxOfflineMs();
    const elapsed = Math.min(elapsedRaw, capMs);
    const summary = ENGINE.advance(elapsed);
    summary.capped = elapsedRaw > capMs;   // 是否触达结算窗口上限
    summary.rawMs = elapsedRaw;
    this.offlineSummary = summary;
    return summary;
  },

  /**
   * 离线时长可读文本（离线收益摘要界面使用）
   */
  getOfflineDurationText() {
    const ms = this.offlineSummary ? this.offlineSummary.elapsedMs : 0;
    return typeof formatDuration === "function" ? formatDuration(ms) : Math.round(ms / 60000) + "分钟";
  },

  /**
   * 保存存档到 localStorage
   */
  save() {
    const p = this.player;
    p.lastOnline = Date.now();
    p.saveVersion = this.SAVE_VERSION;
    // 探索运行态快照（P0）：秘境进度跨会话恢复所需
    if (typeof EXPLORATION !== "undefined" && typeof EXPLORATION.snapshot === "function") {
      p.explorationRuntime = EXPLORATION.snapshot();
    }
    const payload = { version: this.SAVE_VERSION, data: p, savedAt: Date.now() };
    localStorage.setItem("xdzc_save", JSON.stringify(payload));
  },

  /**
   * 启动自动保存（30秒间隔）
   */
  startAutoSave() {
    // P0：自动存档改为注册到统一 Tick 引擎（替代独立 setInterval）
    ENGINE.register({
      name: 'autosave',
      label: '自动存档',
      tickspeed: CONFIG.SAVE_INTERVAL_MS || 30000,
      tick: () => this.save()
    });
  },

  /**
   * 重置存档
   */
  reset() {
    localStorage.removeItem("xdzc_save");
    this.createNewPlayer();
  }
};
