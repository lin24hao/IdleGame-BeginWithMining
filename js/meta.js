/* ============================================================
 * meta.js — 全局等级系统（globalLevel），完全复刻 gooboo src/store/meta.js
 *
 * globalLevel = 各模块贡献的 globalLevelPart 之和
 *   mining_0 = maxDepth0 - 1        (灵脉)
 *   mining_1 = maxDepth1            (灵脉 gas 子 feature)
 *   village_0 = totalHousing        (宗门建筑总住房量)
 *   village_1 = craftingMilestones  (宗门工坊 milestone 数 — 暂无工坊 stub)
 *   horde_0 = maxZoneTotal - 1      (降妖最高区域数)
 *   horde_1 = battlePassLevel       (降妖战令等级 — 暂无 stub)
 *   farm_0 = totalCropLevel         (灵植园所有作物等级合计)
 *   gallery_0 = log4(beauty)        (秘境美观度 — 我们对应秘境层数)
 *
 * 全局 Feature 解锁阈值（globalLevel >= 阈值时自动 unlock key）：
 *   daoFeature          >= 10
 *   villFeature         >= 12
 *   scFeature           >= 25
 *   lingbaoFeature      >= 40
 *   hoFeature           >= 60
 *   generalFeature      >= 100
 *   faFeature           >= 130
 *   xianqiFeature       >= 225
 *   ruFeature           >= 360
 *
 * miningFeature 对应我们的 lmFeature，默认开放（unlockNeeded: null）
 *
 * 加载顺序：global_unlock.js 之后、app.js 之前
 * 依赖：GB_UNLOCK, GB_MODULES
 * ============================================================ */
var GB_META = {
  state: {
    globalLevel: 0,
    globalLevelParts: {},
  },

  /* 各模块贡献 key 列表（和 gooboo globalLevelList 一一对应） */
  PART_KEYS: ['lm_0', 'lm_1', 'vill_0', 'vill_1', 'ho_0', 'ho_1', 'fa_0', 'ru_0'],

  /* Feature 解锁阈值表（修仙化） */
  UNLOCK_THRESHOLDS: {
    // 已有模块
    villFeature: 12,
    scFeature: 25,
    hoFeature: 60,
    faFeature: 130,
    ruFeature: 360,
    // 新增模块（阶段1只加解锁门，完整功能阶段2再做）
    daoFeature: 10,        // 大道法则（原 gemFeature）
    lingbaoFeature: 40,    // 先天灵宝（原 relicFeature）
    generalFeature: 100,   // 仙尊指引（原 generalFeature）
    xianqiFeature: 225,    // 仙器（原 treasureFeature）
  },

  /* 子 feature 解锁阈值（和 globalLevel 对齐）
   * 仙尊解锁链：
   *   generalFeature (100) → 元始天尊 + 太上老君（null，随 generalFeature 一起）
   *   generalOrladeeSubfeature (1000) → 通天教主（gooboo 原版 1000）
   *   generalBelluxSubfeature (1100) → 接引道人（慈悲）
   *   generalOnocluaSubfeature (1300) → 准提道人（智慧）
   *   generalOmnisolixSubfeature (1500) → 瑶池圣母（仙界）
   */
  SUBFEATURE_THRESHOLDS: {
    scLibrarySubfeature: 25,     // 藏书阁 tab：与 scFeature 同阈值
    scLiteratureSubfeature: 50,
    daoGemDiamondSubfeature: 50,   // 混元进度条解锁
    scHistorySubfeature: 180,
    scArtSubfeature: 440,
    lmGasSubfeature: 625,
    villCraftingSubfeature: 800,
    scChemistrySubfeature: 930,
    generalOrladeeSubfeature: 1000,
    generalBelluxSubfeature: 1100,
    hoClassesSubfeature: 1100,
    generalOnocluaSubfeature: 1300,
    generalOmnisolixSubfeature: 1500,
  },

  /* 给各模块的子 feature 映射表（用于 navigate 和 通知） */
  SUBFEATURE_OF: {
    lmGasSubfeature: 'lm',
    villCraftingSubfeature: 'vill',
    hoClassesSubfeature: 'horde',
    scLiteratureSubfeature: 'school',
    scHistorySubfeature: 'school',
    scArtSubfeature: 'school',
    scChemistrySubfeature: 'school',
    scLibrarySubfeature: 'school',
  },

  /* 初始化所有已知 Feature key（让存档里即使还没解锁也有 entry） */
  initAllFeatureKeys() {
    Object.keys(this.UNLOCK_THRESHOLDS).forEach(k => GB_UNLOCK.init(k));
    Object.keys(this.SUBFEATURE_THRESHOLDS).forEach(k => GB_UNLOCK.init(k));
    // lmFeature 默认开放
    GB_UNLOCK.unlock('lmFeature');
  },

  /*
   * 某模块贡献自己的 globalLevel part —— 等价于 gooboo dispatch('meta/globalLevelPart', ...)
   * 各模块在以下时机调用：
   *   LM：深度推进后 → GB_META.globalLevelPart('lm_0', maxDepth0 - 1)
   *   VI：住房变化后 → GB_META.globalLevelPart('vill_0', totalHousing)
   *   HO：maxZone 变化后 → GB_META.globalLevelPart('ho_0', maxZoneTotal - 1)
   *   FA：作物等级变化后 → GB_META.globalLevelPart('fa_0', totalCropLevel)
   *   RU：秘境层数变化后 → GB_META.globalLevelPart('ru_0', ruLayer)
   */
  globalLevelPart(key, amount) {
    // 校验 key 合法（只有预定义的 PART_KEYS 才算数）
    if (this.PART_KEYS.indexOf(key) < 0) return;
    const oldVal = this.state.globalLevelParts[key] || 0;
    if (amount <= oldVal) return; // 只增不减
    this.state.globalLevelParts[key] = amount;
    this._recomputeGlobalLevel();
  },

  /* 重新算 globalLevel = sum(parts) */
  _recomputeGlobalLevel() {
    let sum = 0;
    this.PART_KEYS.forEach(k => {
      sum += (this.state.globalLevelParts[k] || 0);
    });
    const oldLevel = this.state.globalLevel;
    this.state.globalLevel = sum;

    // 每增长时检查 Feature 解锁
    if (sum > oldLevel) {
      this._checkAllUnlocks(oldLevel, sum);
    }
  },

  /* 阈值检查 */
  _checkAllUnlocks(oldLevel, newLevel) {
    // 主 Feature
    Object.keys(this.UNLOCK_THRESHOLDS).forEach(key => {
      const threshold = this.UNLOCK_THRESHOLDS[key];
      if (newLevel >= threshold && oldLevel < threshold && !GB_UNLOCK.isUnlocked(key)) {
        GB_UNLOCK.unlock(key);
      }
    });
    // 子 Feature
    Object.keys(this.SUBFEATURE_THRESHOLDS).forEach(key => {
      const threshold = this.SUBFEATURE_THRESHOLDS[key];
      if (newLevel >= threshold && oldLevel < threshold && !GB_UNLOCK.isUnlocked(key)) {
        GB_UNLOCK.unlock(key);
      }
    });
  },

  /* GB_UNLOCK.unlock() 回调 — 发通知 / 连锁 */
  onFeatureUnlocked(key) {
    if (typeof GB_APP !== 'undefined' && typeof GB_APP.toast === 'function') {
      const names = {
        lmFeature: '灵脉',
        villFeature: '宗门',
        daoFeature: '大道法则',
        scFeature: '藏经阁',
        lingbaoFeature: '先天灵宝',
        hoFeature: '降妖',
        generalFeature: '仙尊指引',
        faFeature: '灵植园',
        xianqiFeature: '仙器',
        ruFeature: '秘境',
        scLiteratureSubfeature: '藏经阁·文学',
        scHistorySubfeature: '藏经阁·史卷',
        scArtSubfeature: '藏经阁·绘卷',
        scChemistrySubfeature: '藏经阁·丹术',
        scLibrarySubfeature: '藏经阁·藏书阁',
        lmGasSubfeature: '灵脉·气态灵矿',
        villCraftingSubfeature: '宗门·工坊',
        hoClassesSubfeature: '降妖·流派',
      };
      const n = names[key] || key;
      GB_APP.toast(`解锁新玩法：${n}！`, '#4ade80');
    }
  },

  /*
   * 每次 tickAll 之后调用 —— 从所有已加载模块的 STAT 里实时扫描 globalLevelPart 最新值
   * 这是 gooboo 里各模块在各个 milestone/store action 里 dispatch('meta/globalLevelPart') 的统一封装
   */
  syncAll() {
    if (typeof GB_MODULES === 'undefined') return;
    this.PART_KEYS.forEach(partKey => {
      const newValue = this._computePart(partKey);
      if (newValue > (this.state.globalLevelParts[partKey] || 0)) {
        this.state.globalLevelParts[partKey] = newValue;
      }
    });
    this._recomputeGlobalLevel();
  },

  /* 从 stat 对象里取 value（兼容 {value, total} 格式和裸数值格式） */
  _statVal(statObj, key) {
    if (!statObj) return undefined;
    const item = statObj[key];
    if (item === undefined || item === null) return undefined;
    if (typeof item === 'number') return item;
    if (typeof item === 'object') {
      // increaseTo 类型：.total 是历史最大值，.value 是当前值
      if (item.total !== undefined) return item.total;
      if (item.value !== undefined) return item.value;
      if (item.max !== undefined) return item.max;
    }
    return undefined;
  },

  /* 累加所有 stat 里前缀匹配的 key 的 value */
  _sumPrefixed(statObj, prefix) {
    if (!statObj) return 0;
    let total = 0;
    let found = false;
    for (const k of Object.keys(statObj)) {
      if (k.indexOf(prefix) === 0) {
        const v = this._statVal(statObj, k);
        if (v !== undefined && v > 0) { total += v; found = true; }
      }
    }
    return found ? total : undefined;
  },

  /* 从 GB_MODULES 里按 keyPrefix 找模块 core.STAT.values */
  _getModStat(keyPrefix) {
    if (typeof GB_MODULES === 'undefined') return null;
    const mod = GB_MODULES._byPrefix[keyPrefix];
    if (!mod || !mod.core || !mod.core.STAT) return null;
    return mod.core.STAT.values;
  },

  /* 计算某个 globalLevelPart 的当前值 */
  _computePart(partKey) {
    switch (partKey) {
      case 'lm_0': {
        // mining_0 = maxDepth0 - 1（gooboo）
        const stat = this._getModStat('lm');
        const v = this._statVal(stat, 'lm_maxDepth0');
        return v !== undefined ? Math.max(0, v - 1) : 0;
      }
      case 'lm_1': {
        // mining_1 = maxDepth1（gooboo gas 子 feature）
        const stat = this._getModStat('lm');
        const v = this._statVal(stat, 'lm_maxDepth1');
        return v !== undefined ? v : 0;
      }
      case 'vill_0': {
        // village_0 = totalHousing（gooboo 扫 upgrade.tickDelay）
        // 我们扫 stat.village_maxHousing，如果没有就从建筑 stat 里累加
        const stat = this._getModStat('village');
        const direct = this._statVal(stat, 'village_maxHousing');
        if (direct !== undefined) return direct;
        // fallback: 扫所有 village_maxBuilding_ 前缀的 stat，累加 level
        const sum = this._sumPrefixed(stat, 'village_maxBuilding_');
        return sum !== undefined ? sum : 0;
      }
      case 'vill_1':
        return 0; // 工坊 milestone 暂 stub
      case 'ho_0': {
        // horde_0 = maxZoneTotal - 1（gooboo 在 killEnemy 里 dispatch）
        const stat = this._getModStat('horde');
        // 先尝试直接找 horde_maxZoneTotal
        const direct = this._statVal(stat, 'horde_maxZoneTotal');
        if (direct !== undefined) return Math.max(0, direct - 1);
        // fallback: 扫所有 horde_maxZone 前缀的，取最大
        if (stat) {
          let max = 0;
          for (const k of Object.keys(stat)) {
            if (k.indexOf('horde_maxZone') === 0 && k !== 'horde_maxZoneTotal') {
              const v = this._statVal(stat, k);
              if (v !== undefined && v > max) max = v;
            }
          }
          return max;
        }
        return 0;
      }
      case 'ho_1':
        return 0; // 战令等级暂 stub
      case 'fa_0': {
        // farm_0 = 所有作物等级合计（gooboo performMeta）
        const stat = this._getModStat('farm');
        const sum = this._sumPrefixed(stat, 'farm_cropLevel_');
        return sum !== undefined ? sum : 0;
      }
      case 'ru_0':
        return 0; // 秘境 globalLevel 暂 stub
      default:
        return 0;
    }
  },

  /* ============ 存档接口 ============ */
  snapshot() {
    return {
      globalLevel: this.state.globalLevel,
      globalLevelParts: JSON.parse(JSON.stringify(this.state.globalLevelParts)),
    };
  },
  restore(data) {
    if (!data || typeof data !== 'object') return;
    this.state.globalLevel = data.globalLevel || 0;
    this.state.globalLevelParts = data.globalLevelParts || {};
    // 补扫：存档恢复后 globalLevel 可能已经远超阈值，但 _checkAllUnlocks
    // 只在增长瞬间触发（oldLevel < newLevel），restore 没有这个增量事件
    if (this.state.globalLevel > 0) {
      this._checkAllUnlocks(0, this.state.globalLevel);
    }
  },

  /* ============ 便捷查询 ============ */
  getLevel() { return this.state.globalLevel; },
  getPart(key) { return this.state.globalLevelParts[key] || 0; },

  /* 重置（hardReset） */
  reset() {
    this.state.globalLevel = 0;
    this.state.globalLevelParts = {};
    GB_UNLOCK.lockAll();
    GB_UNLOCK.unlock('lmFeature'); // 灵脉永远解锁
  },
};

if (typeof window !== 'undefined') window.GB_META = GB_META;
