/**
 * MIGRATIONS —— 存档迁移骨架（改造路线 B / P0）
 *
 * 用途：为存档引入 version 字段后的版本升级机制。
 * 机制：MIGRATIONS.register(fromVersion, toVersion, desc, fn) 注册一步迁移；
 *      读取存档时按 fromVersion → 当前版本逐步执行。
 *
 * 说明：本期（P0）只做"版本标识 + 迁移骨架 + 一次真实迁移"，
 *      新老存档兼容适配与导入导出推迟到游戏完全做完之后再处理。
 *
 * 零依赖：原生语法，双击 index.html 即可运行。
 */
const MIGRATIONS = {
  // 注册表：{ 起始版本号: { to, desc, fn } }
  registry: {},

  /**
   * 注册一步迁移
   * @param {number} fromVersion 起始版本
   * @param {number} toVersion   目标版本
   * @param {string} desc        描述
   * @param {Function} fn        迁移函数，入参为 player 对象（原地修改）
   */
  register(fromVersion, toVersion, desc, fn) {
    if (typeof fn !== 'function') {
      console.warn('[MIGRATIONS] 迁移函数无效，已忽略：', fromVersion, '->', toVersion);
      return;
    }
    this.registry[fromVersion] = { to: toVersion, desc: desc || '', fn };
  },

  /**
   * 列出已注册的迁移链
   */
  list() {
    return Object.keys(this.registry)
      .map(k => Number(k))
      .sort((a, b) => a - b)
      .map(v => `v${v} → v${this.registry[v].to}：${this.registry[v].desc}`);
  },

  /**
   * 执行迁移
   * @param {Object} player      存档数据
   * @param {number} fromVersion 存档标记的版本（旧存档无字段时传 1）
   * @param {number} toVersion   当前游戏存档版本
   * @returns {{version:number, log:string[]}}
   */
  run(player, fromVersion, toVersion) {
    const log = [];
    let v = Number(fromVersion) || 1;
    if (v < 1) v = 1;
    if (v === toVersion) {
      player.saveVersion = toVersion;
      return { version: toVersion, log };
    }
    if (v > toVersion) {
      // 存档来自更新的版本：不做降级处理，仅记录，交由外层容错逻辑兜底
      log.push(`存档版本 v${v} 高于当前游戏版本 v${toVersion}，已跳过迁移`);
      player.saveVersion = v;
      return { version: v, log };
    }
    let guard = 0;
    while (v < toVersion && guard++ < 64) {
      const step = this.registry[v];
      if (!step) {
        log.push(`缺少 v${v} → 下一步的迁移定义，已在 v${v} 停止迁移`);
        break;
      }
      try {
        step.fn(player);
        log.push(`v${v} → v${step.to} 完成：${step.desc}`);
      } catch (e) {
        log.push(`v${v} 迁移失败（${e.message}），已保留原数据于当前版本`);
        break;
      }
      v = step.to;
    }
    player.saveVersion = v;
    return { version: v, log };
  }
};

/* ============================================================
 * v1 → v2：旧存档字段规整
 * 由原 state.js 内的"兼容升级"逻辑原样迁移而来，行为保持一致，
 * 仅把 this.player 改为入参 p。
 * ============================================================ */
MIGRATIONS.register(1, 2, '旧存档字段规整（原兼容升级逻辑迁移）', function (p) {
  // 兼容升级：所有地图默认解锁（除入场费无境界限制）
  if (!p.unlockedMaps || p.unlockedMaps.length < CONFIG.MAPS.length) {
    p.unlockedMaps = CONFIG.MAPS.map(m => m.id);
  }

  // 兼容升级：属性系统改造（旧存档无 attrs）
  if (!p.attrs) {
    p.attrs = { atk:0, def:0, hp:0, spd:0, crit:0, critDmg:0, dodge:0, block:0, combo:0 };
    const rl = (p.currentRealm || 0) * 9 + (p.currentLayer || 1);
    p.attrPoints = rl * 5 + 5;
  }

  // 兼容升级：旧存档无仓库
  if (!p.warehouse) {
    p.warehouse = [];
  }

  // 兼容升级：旧存档无洞府建筑
  if (!p.caveBuildings) {
    p.caveBuildings = { lingtian: 1, liandan: 1, lianqi: 1 };
  }

  // 兼容升级：旧存档无炼丹材料
  if (!p.materials) {
    p.materials = {};
  }

  // 兼容升级：旧存档无配方
  if (!p.recipes) {
    p.recipes = [];
  }

  // 兼容升级：旧存档无丹药服用记录
  if (!p.danBuffs) {
    p.danBuffs = {};
  }

  // 兼容升级：旧存档无装备槽位
  if (!p.equipment) {
    p.equipment = { weapon: null, armor: null, accessory: null };
  }

  // 兼容升级：旧存档无炼器炉刷新次数
  if (p.refreshCount === undefined) {
    p.refreshCount = 0;
  }

  // 兼容升级：旧存档无丹药库存
  if (!p.pills) {
    p.pills = {};
  }

  // 兼容升级：旧存档无破镜丹标记
  if (p.breakthroughDiscount === undefined) {
    p.breakthroughDiscount = false;
  }

  // 兼容升级：旧存档无种植槽
  if (!p.herbSlots) {
    p.herbSlots = [];
  }

  // 兼容升级：旧存档无建筑升级进度
  if (!p.buildingUpgrades) {
    p.buildingUpgrades = { lingtian: null, liandan: null, lianqi: null };
  }

  // 兼容升级：旧存档无炼丹队列
  if (!p.craftingQueue) {
    p.craftingQueue = [];
  }

  // 兼容升级：旧存档无自动炼丹标记
  if (p.autoCraft === undefined) {
    p.autoCraft = false;
  }

  // 兼容升级：储物袋容量强制设为 999999（实际取消限制）
  if (p.storageBag) {
    p.storageBag.capacity = 999999;
  }

  // 兼容升级：旧存档无贵重物品收集
  if (!p.preciousCollection) {
    p.preciousCollection = {};
  }

  // 兼容升级：旧存档无探索运行态快照（P0 新增）
  if (p.explorationRuntime === undefined) {
    p.explorationRuntime = null;
  }

  // 清理旧字段
  delete p.rootBone;
  delete p.comprehension;
  delete p.luck;
});
