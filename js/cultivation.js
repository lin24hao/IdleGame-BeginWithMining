const CULTIVATION = {
  // 玩家战力：境界层×100 + 各属性加权
  getPlayerPower() {
    const p = STATE.player;
    const realmLayer = p.currentRealm * 9 + p.currentLayer;
    const a = p.attrs;
    return Math.round(
      realmLayer * 100
      + a.atk * 3 + a.def * 3 + a.hp * 0.1 + a.spd * 5
      + (a.crit + a.critDmg + a.dodge + a.block + a.combo) * 2
    );
  },

  // 修炼速度：随境界增长（替代原悟性）+ 贵重物品加成
  getMeditationRate() {
    const p = STATE.player;
    const realmLayer = p.currentRealm * 9 + p.currentLayer;
    let rate = Math.floor(realmLayer * CONFIG.MEDITATION_BASE / 2 + CONFIG.MEDITATION_BASE);
    // 贵重物品：清心诀修炼速度+5%
    const buff = getPreciousBuffTotal('buff_cultivation');
    if (buff > 0) rate = Math.floor(rate * (1 + buff));
    return rate;
  },

  getRealmName() {
    const p = STATE.player;
    return CONFIG.REALMS[p.currentRealm] + " " + p.currentLayer + "层";
  },

  getBreakthroughCost() {
    const p = STATE.player;
    return Math.floor(1000 * Math.pow(1.5, p.currentRealm * 9 + p.currentLayer - 1));
  },

  getMaxCultivation() {
    const p = STATE.player;
    return Math.floor(5000 * Math.pow(1.5, p.currentRealm * 9 + p.currentLayer - 1));
  },

  tick() {
    const p = STATE.player;
    if (p.currentRealm < CONFIG.REALMS.length - 1 || p.currentLayer < 9) {
      p.cultivation += this.getMeditationRate() / 10;
    }
  },

  // 判断当前是升层还是跨境界
  isCrossRealmBreakthrough() {
    return STATE.player.currentLayer >= 9;
  },

  // 获取当前突破所需丹药配方ID
  getRequiredPillRecipeId() {
    const p = STATE.player;
    const realm = p.currentRealm;
    const type = this.isCrossRealmBreakthrough() ? "realm" : "break";
    const recipe = CONFIG.PILL_RECIPES.find(r => r.realm === realm && r.type === type);
    return recipe ? recipe.id : null;
  },

  // 检查是否有突破所需丹药
  hasRequiredPill() {
    const p = STATE.player;
    if (!p.pills) p.pills = {};
    const recipeId = this.getRequiredPillRecipeId();
    if (!recipeId) return true; // 没有对应配方说明配置有误，放行
    return (p.pills[recipeId] || 0) > 0;
  },

  // 获取所需丹药名称
  getRequiredPillName() {
    const recipeId = this.getRequiredPillRecipeId();
    if (!recipeId) return "未知丹药";
    const recipe = CONFIG.PILL_RECIPES.find(r => r.id === recipeId);
    return recipe ? recipe.name : "未知丹药";
  },

  canBreakthrough() {
    const p = STATE.player;
    return p.cultivation >= this.getMaxCultivation() && this.hasRequiredPill();
  },

  breakthrough() {
    const p = STATE.player;
    if (!this.canBreakthrough()) return false;

    // 消耗丹药
    if (!p.pills) p.pills = {};
    const recipeId = this.getRequiredPillRecipeId();
    if (recipeId) {
      p.pills[recipeId] = (p.pills[recipeId] || 0) - 1;
      if (p.pills[recipeId] <= 0) delete p.pills[recipeId];
    }

    p.cultivation = 0;
    p.currentLayer++;
    // 每升一层获得5属性点
    p.attrPoints = (p.attrPoints || 0) + 5;
    if (p.currentLayer > 9) {
      p.currentLayer = 1;
      p.currentRealm++;
      // 跨境界额外获得15属性点
      p.attrPoints += 15;
    }
    SETTINGS.playSfx('breakthrough');
    return true;
  },

  // 分配属性点：消耗1点提升1级属性
  allocateAttr(attr) {
    const p = STATE.player;
    if (!p.attrs || p.attrs[attr] === undefined) return false;
    if (!p.attrPoints || p.attrPoints <= 0) return false;
    p.attrs[attr]++;
    p.attrPoints--;
    return true;
  },

  /* ================== P0：离线结算与摘要（改造路线B 地基）================== */

  /**
   * 离线修炼结算（P0）
   * 公式与原 STATE.calculateOfflineReward 的修炼部分完全一致（含灵田加成、清心诀加成），
   * 差异仅在于：计算入口从"启动时一次性结算"改为"由统一 Tick 引擎批量推进时调用"，
   * 并且不再局限于修炼一项（洞府/炼丹/种植/探索见各自模块的 offlineTick）。
   */
  offlineTick(elapsedMs) {
    const p = STATE.player;
    const elapsed = Math.max(0, elapsedMs || 0);
    if (!p || elapsed <= 0) return;

    const realmLayer = p.currentRealm * 9 + p.currentLayer;
    let rate = realmLayer * CONFIG.MEDITATION_BASE / 2 + CONFIG.MEDITATION_BASE;

    // 灵田等级加成（注意：levels 数组为 0-indexed，level=1 对应 index 0）
    const lingtianLevel = (p.caveBuildings && p.caveBuildings.lingtian) || 1;
    if (CONFIG.CAVE_BUILDINGS && CONFIG.CAVE_BUILDINGS.lingtian) {
      const levelData = CONFIG.CAVE_BUILDINGS.lingtian.levels[lingtianLevel - 1];
      if (levelData && levelData.meditationMultiplier) rate *= levelData.meditationMultiplier;
    }

    // 贵重物品：清心诀修炼速度+5%
    const cultBuff = getPreciousBuffTotal("buff_cultivation");
    if (cultBuff > 0) rate *= (1 + cultBuff);

    p.cultivation += Math.floor(rate * (elapsed / 1000));
  },

  /** 离线摘要用的数值快照 */
  stats() {
    const p = STATE.player || {};
    return { cultivation: Math.floor(p.cultivation || 0) };
  },

  statLabels: {
    cultivation: { label: "修为", unit: "" }
  },

  /** 离线条目补充文字（修为增量已由 stats 差值给出，此处无额外内容） */
  notes() { return []; }
};


// ===== 注册到统一 Tick 引擎（P0）：替代原 main.js 中的 100ms 修炼定时器 =====
ENGINE.register({
  name: 'cultivation',
  label: '修炼',
  tickspeed: 100,   // 与原 main.js 的 100ms 节拍一致，保持修为累积速度不变
  tick: () => CULTIVATION.tick(),
  offlineTick: (ms) => CULTIVATION.offlineTick(ms),
  stats: () => CULTIVATION.stats(),
  statLabels: CULTIVATION.statLabels,
  notes: () => CULTIVATION.notes()
});
