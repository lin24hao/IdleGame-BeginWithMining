/**
 * 洞府养成系统：建筑升级、炼丹、炼器、种植、仓库
 * 建筑升级/炼丹改为需要时间（进度条），新增种植系统
 */
const CAVE = {
  currentTab: "buildings",      // 当前标签页：buildings / alchemy / forge / farm / warehouse
  equipOptions: null,           // 当前生成的3个装备列表，每个列表含{weapon,armor,accessory}
  selectedEquipList: null,      // 选中的装备列表索引 0/1/2
  warehouseFilter: "all",       // 仓库品质筛选
  // 进度刷新定时器已移除（P0）：改由 ENGINE 的 cave 模块统一节拍驱动

  // ========== 主界面 ==========
  getHTML() {
    // 统一检查所有进行中的任务（建筑升级/炼丹队列/种植槽）
    this.checkAllProgress();

    const p = STATE.player;
    const canBreak = CULTIVATION.canBreakthrough();
    const power = CULTIVATION.getPlayerPower();
    const cultPct = Math.min(100, p.cultivation / CULTIVATION.getMaxCultivation() * 100);

    // 顶部状态区
    let html = `
      <div class="panel">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="color:var(--accent);font-weight:bold;font-size:14px;">洞府</span>
          <div style="display:flex;gap:8px;font-size:12px;">
            <span style="color:var(--q-good);">⚔${Math.round(power)}</span>
            <span>💰${p.spiritStones.toLocaleString()}</span>
          </div>
        </div>
        <div style="margin-top:4px;">
          <span style="font-size:12px;">${CULTIVATION.getRealmName()}</span>
          <span class="text-dim" style="font-size:11px;margin-left:6px;">修为 ${Math.floor(p.cultivation)} / ${CULTIVATION.getMaxCultivation().toLocaleString()}</span>
        </div>
        <div style="display:flex;align-items:center;gap:4px;margin-top:3px;">
          <div style="flex:1;height:4px;background:var(--border);border-radius:2px;overflow:hidden;">
            <div style="width:${cultPct}%;height:100%;background:var(--accent);"></div>
          </div>
          <span class="text-dim" style="font-size:10px;">+${CULTIVATION.getMeditationRate()}/s</span>
        </div>
        <div style="margin-top:6px;">
          <button class="btn" style="width:100%;font-size:12px;${canBreak ? '' : 'opacity:0.4;cursor:not-allowed;'}"
                  ${canBreak ? '' : 'disabled'}
                  onclick="CULTIVATION.breakthrough();MAIN.refreshCave();">
            ${canBreak ? '突破境界（+5属性点）' : (p.cultivation >= CULTIVATION.getMaxCultivation() ? '需' + CULTIVATION.getRequiredPillName() : '修为不足')}
          </button>
        </div>
      </div>
    `;

    // 标签栏（新增"种植"Tab）
    const tabs = [
      { key: "buildings", label: "建筑" },
      { key: "alchemy",   label: "炼丹" },
      { key: "forge",     label: "炼器" },
      { key: "farm",      label: "种植" },
      { key: "warehouse", label: "仓库" },
      { key: "treasure",  label: "藏宝阁" }
    ];
    html += `<div style="display:flex;gap:2px;margin-bottom:6px;">`;
    tabs.forEach(t => {
      const active = this.currentTab === t.key;
      html += `<button class="btn" style="flex:1;padding:5px 0;font-size:12px;${active ? 'background:var(--accent);' : 'background:var(--border);color:var(--text);'}"
                onclick="CAVE.switchTab('${t.key}')">${t.label}</button>`;
    });
    html += `</div>`;

    // 标签内容
    switch (this.currentTab) {
      case "buildings": html += this.getBuildingsHTML(); break;
      case "alchemy":   html += this.getAlchemyHTML(); break;
      case "forge":     html += this.getForgeHTML(); break;
      case "farm":      html += this.getFarmHTML(); break;
      case "warehouse": html += this.getWarehouseHTML(); break;
      case "treasure":  html += this.getTreasureHTML(); break;
    }

    // 底部导航
    html += `
      <div style="display:flex;gap:6px;margin-top:8px;">
        <button class="btn" style="flex:1;" onclick="MAIN.switchView('explore')">探索</button>
        <button class="btn" style="flex:1;" onclick="MAIN.switchView('market')">坊市</button>
        <button class="btn" style="flex:1;" onclick="STATE.save();this.textContent='已存档';setTimeout(()=>{this.textContent='存档';},1000)">存档</button>
        <button class="btn" style="flex:1;" onclick="SETTINGS.playSfx('click');MAIN.switchView('settings')">设置</button>
      </div>
    `;

    // 进度刷新（P0）：已交由统一 Tick 引擎的 'cave' 模块按 1s 节拍处理，
    // 触发条件与原定时器完全一致（当前处于洞府界面且存在进行中的任务）。

    return html;
  },

  switchTab(tab) {
    this.currentTab = tab;
    MAIN.refreshCave();
  },

  // ========== 统一进度检查入口 ==========
  // 每次渲染时调用，检查并处理所有已完成的进行中任务
  checkAllProgress() {
    this.checkBuildingUpgrades();
    this.checkCraftingQueue();
    this.checkHerbSlots();
  },

  // 检查是否有进行中的任务（用于定时刷新判断）
  hasActiveProgress() {
    const p = STATE.player;
    // 建筑升级中
    if (p.buildingUpgrades) {
      for (const key of Object.keys(p.buildingUpgrades)) {
        if (p.buildingUpgrades[key]) return true;
      }
    }
    // 炼丹队列非空
    if (p.craftingQueue && p.craftingQueue.length > 0) return true;
    // 种植槽有种植中的（包括已成熟未收获的，确保成熟时UI能更新）
    if (p.herbSlots) {
      for (const slot of p.herbSlots) {
        if (slot) return true;
      }
    }
    return false;
  },

  // ========== 进度条与时间格式化辅助 ==========
  // 渲染进度条，current/total 为已用/总时长（或数值）
  renderProgressBar(current, total) {
    const pct = total > 0 ? Math.min(100, Math.max(0, current / total * 100)) : 0;
    return `<div style="width:100%;height:6px;background:var(--border);border-radius:3px;overflow:hidden;">
      <div style="width:${pct}%;height:100%;background:var(--accent);transition:width 0.3s;"></div>
    </div>`;
  },

  // 格式化时间为可读字符串
  formatTime(ms) {
    if (ms <= 0) return '0秒';
    const sec = Math.ceil(ms / 1000);
    if (sec < 60) return sec + '秒';
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    if (min < 60) return min + '分' + (s > 0 ? s + '秒' : '');
    const hr = Math.floor(min / 60);
    const m = min % 60;
    return hr + '时' + (m > 0 ? m + '分' : '');
  },

  // ========== 建筑升级 ==========
  getBuildingsHTML() {
    const p = STATE.player;
    const buildings = CONFIG.CAVE_BUILDINGS;
    if (!p.buildingUpgrades) p.buildingUpgrades = { lingtian: null, liandan: null, lianqi: null };
    let html = '';

    Object.keys(buildings).forEach(key => {
      const bld = buildings[key];
      const curLevel = p.caveBuildings[key] || 1;
      const curData = bld.levels[curLevel - 1];
      const maxLevel = bld.levels.length;
      const isMax = curLevel >= maxLevel;
      const isUpgrading = !!p.buildingUpgrades[key];

      // 当前效果描述
      let effectDesc = '';
      if (key === 'lingtian') {
        effectDesc = `修炼速度 ×${curData.meditationMultiplier}，种植槽 ${curData.herbSlots}`;
      } else if (key === 'liandan') {
        effectDesc = `品质加成 +${curData.qualityBonus}%`;
      } else if (key === 'lianqi') {
        effectDesc = `品质加成 +${curData.qualityBonus}%，刷新${curData.refreshCount}次`;
      }

      html += `<div class="panel">`;
      html += `<div style="display:flex;justify-content:space-between;align-items:center;">`;
      html += `<span style="color:var(--accent);font-weight:bold;">${bld.name}</span>`;
      html += `<span style="font-size:12px;">Lv.${curLevel}${isMax ? ' (满级)' : ''}</span>`;
      html += `</div>`;
      html += `<div class="text-dim" style="font-size:11px;margin-top:2px;">${bld.desc}</div>`;
      html += `<div style="font-size:12px;margin-top:4px;">当前：${effectDesc}</div>`;

      if (isUpgrading) {
        // 正在升级中：显示进度条，不显示升级按钮
        html += this.getUpgradeProgressHTML(key);
      } else if (!isMax) {
        const nextData = bld.levels[curLevel];
        const cost = nextData.upgradeCost;
        const nextEffect = key === 'lingtian'
          ? `修炼速度 ×${nextData.meditationMultiplier}，种植槽 ${nextData.herbSlots}`
          : key === 'liandan'
            ? `品质加成 +${nextData.qualityBonus}%`
            : `品质加成 +${nextData.qualityBonus}%，刷新${nextData.refreshCount}次`;

        // 计算每种道具的仓库拥有量和补购价格
        let totalBuyout = 0;
        const itemInfos = cost.items.map(reqItem => {
          const whItems = this.getWarehouseItemsByName(reqItem.name, reqItem.quality);
          const haveCount = whItems.length;
          const missingCount = Math.max(0, reqItem.count - haveCount);
          const buyoutPerItem = this.calcBuyoutPrice(reqItem.quality);
          const itemBuyout = buyoutPerItem * missingCount;
          totalBuyout += itemBuyout;
          return { reqItem, haveCount, missingCount, buyoutPerItem, itemBuyout, qColor: CONFIG.QUALITY[reqItem.quality].color };
        });

        const totalStoneCost = cost.stones + totalBuyout;
        const canAfford = p.spiritStones >= totalStoneCost;

        html += `<div style="margin-top:6px;padding-top:6px;border-top:1px solid var(--border);">`;
        html += `<div style="font-size:12px;">下一级：${nextEffect}</div>`;
        html += `<div style="font-size:11px;margin-top:2px;">`;
        html += `灵石：<span style="color:${p.spiritStones >= cost.stones ? 'var(--q-good)' : '#ef4444'}">${cost.stones.toLocaleString()}</span>`;

        // 每种道具需求：显示具体道具名 + 拥有/需要
        itemInfos.forEach(info => {
          const enough = info.haveCount >= info.reqItem.count;
          html += `<div style="margin-top:2px;">`;
          html += `<span style="color:${info.qColor}">${info.reqItem.name}</span>：<span style="color:${enough ? 'var(--q-good)' : '#ef4444'}">${info.haveCount}</span>/${info.reqItem.count}`;
          if (info.missingCount > 0) {
            html += `<span class="text-dim" style="font-size:10px;margin-left:6px;">缺${info.missingCount}个，补购${info.itemBuyout.toLocaleString()}（${info.buyoutPerItem.toLocaleString()}/个）</span>`;
          }
          html += `</div>`;
        });

        // 升级时间
        html += `<div class="text-dim" style="font-size:10px;margin-top:2px;">升级时间：${this.formatTime(cost.time * 1000)}</div>`;

        if (totalBuyout > 0) {
          html += `<div style="font-size:11px;margin-top:2px;">总灵石消耗：<span style="color:${canAfford ? 'var(--q-good)' : '#ef4444'}">${totalStoneCost.toLocaleString()}</span></div>`;
        }
        html += `</div>`;

        html += `<button class="btn" style="width:100%;margin-top:6px;font-size:12px;${canAfford ? '' : 'opacity:0.4;cursor:not-allowed;'}"
                  ${canAfford ? '' : 'disabled'}
                  onclick="CAVE.upgradeBuilding('${key}')">开始升级</button>`;
        html += `</div>`;
      }

      html += `</div>`;
    });

    // 属性分配区
    html += this.getAttrPanelHTML();

    return html;
  },

  // 渲染建筑升级进度条
  getUpgradeProgressHTML(key) {
    const p = STATE.player;
    const upgrade = p.buildingUpgrades[key];
    if (!upgrade) return '';

    const elapsed = ENGINE.now() - upgrade.startTime;
    const total = upgrade.endTime - upgrade.startTime;
    const remaining = Math.max(0, upgrade.endTime - ENGINE.now());

    let html = `<div style="margin-top:6px;padding-top:6px;border-top:1px solid var(--border);">`;
    html += `<div style="font-size:12px;color:var(--q-rare);">升级中 → Lv.${upgrade.targetLevel}</div>`;
    html += `<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-dim);margin-top:2px;">`;
    html += `<span>${this.formatTime(elapsed)} / ${this.formatTime(total)}</span>`;
    html += `<span>剩余 ${this.formatTime(remaining)}</span>`;
    html += `</div>`;
    html += `<div style="margin-top:2px;">${this.renderProgressBar(elapsed, total)}</div>`;
    html += `</div>`;
    return html;
  },

  // 属性分配面板
  getAttrPanelHTML() {
    const p = STATE.player;
    const A = CONFIG.ATTRIBUTES;
    let html = `<div class="panel">`;
    html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">`;
    html += `<span style="color:var(--accent);font-weight:bold;">属性养成</span>`;
    html += `<span style="color:var(--q-legend);font-weight:bold;font-size:12px;">可用点数：${p.attrPoints}</span>`;
    html += `</div>`;
    Object.keys(A).forEach(key => {
      const cfg = A[key];
      const val = p.attrs[key];
      const display = cfg.unit === '%' ? (val * cfg.perPoint).toFixed(1) + '%' : Math.floor(val * cfg.perPoint);
      const canAdd = p.attrPoints > 0;
      html += `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid var(--border);">
          <div>
            <span style="font-weight:bold;font-size:12px;">${cfg.icon} ${cfg.name}</span>
            <span class="text-dim" style="font-size:10px;"> ${cfg.desc}</span>
          </div>
          <div style="display:flex;align-items:center;gap:4px;">
            <span style="color:var(--accent);font-weight:bold;font-size:12px;">${display}</span>
            <button class="btn" style="padding:2px 8px;font-size:11px;${canAdd ? '' : 'opacity:0.3;cursor:not-allowed;'}"
                    ${canAdd ? '' : 'disabled'}
                    onclick="CULTIVATION.allocateAttr('${key}');MAIN.refreshCave();">+</button>
          </div>
        </div>
      `;
    });
    html += `</div>`;
    return html;
  },

  // 启动建筑升级（不再直接升级，而是启动升级计时）
  upgradeBuilding(key) {
    const p = STATE.player;
    if (!p.buildingUpgrades) p.buildingUpgrades = { lingtian: null, liandan: null, lianqi: null };

    // 已在升级中
    if (p.buildingUpgrades[key]) return;

    const bld = CONFIG.CAVE_BUILDINGS[key];
    const curLevel = p.caveBuildings[key] || 1;
    if (curLevel >= bld.levels.length) return;

    const cost = bld.levels[curLevel].upgradeCost;

    // 计算每种道具的补购总价
    let totalBuyout = 0;
    const consumePlans = [];
    for (const reqItem of cost.items) {
      const whItems = this.getWarehouseItemsByName(reqItem.name, reqItem.quality);
      const haveCount = whItems.length;
      const missingCount = Math.max(0, reqItem.count - haveCount);
      const buyoutPerItem = this.calcBuyoutPrice(reqItem.quality);
      totalBuyout += buyoutPerItem * missingCount;
      consumePlans.push(whItems.slice(0, reqItem.count));
    }

    const totalStoneCost = cost.stones + totalBuyout;

    // 检查灵石
    if (p.spiritStones < totalStoneCost) return;

    // 消耗仓库道具（优先消耗baseValue最低的）
    consumePlans.forEach(items => {
      items.forEach(item => {
        const idx = p.warehouse.indexOf(item);
        if (idx >= 0) p.warehouse.splice(idx, 1);
      });
    });

    // 扣灵石
    p.spiritStones -= totalStoneCost;

    // 启动升级计时（不在这里直接升级等级）
    p.buildingUpgrades[key] = {
      targetLevel: curLevel + 1,
      startTime: ENGINE.now(),
      endTime: ENGINE.now() + cost.time * 1000
    };

    MAIN.refreshCave();
  },

  // 检查建筑升级是否完成
  checkBuildingUpgrades() {
    const p = STATE.player;
    if (!p.buildingUpgrades) p.buildingUpgrades = { lingtian: null, liandan: null, lianqi: null };

    Object.keys(p.buildingUpgrades).forEach(key => {
      const upgrade = p.buildingUpgrades[key];
      if (upgrade && ENGINE.now() >= upgrade.endTime) {
        // 完成升级：等级+1
        p.caveBuildings[key] = upgrade.targetLevel;
        p.buildingUpgrades[key] = null;

        // 如果是炼器炉，更新刷新次数
        if (key === 'lianqi') {
          const lianqiData = CONFIG.CAVE_BUILDINGS.lianqi.levels[upgrade.targetLevel - 1];
          p.refreshCount = lianqiData.refreshCount;
        }
      }
    });
  },

  // 获取仓库中指定名称和品质的物品（按baseValue升序排列）
  getWarehouseItemsByName(name, quality) {
    const p = STATE.player;
    return p.warehouse
      .filter(it => it.name === name && it.quality === quality)
      .sort((a, b) => a.baseValue - b.baseValue);
  },

  // 获取仓库中指定品质的物品（按baseValue升序排列）
  getWarehouseItemsByQuality(quality) {
    const p = STATE.player;
    return p.warehouse
      .filter(it => it.quality === quality)
      .sort((a, b) => a.baseValue - b.baseValue);
  },

  // 计算单个物品的灵石补购价格
  calcBuyoutPrice(quality) {
    const realm = STATE.player.currentRealm;
    // 基于当前境界秘境的价值范围计算
    const map = CONFIG.MAPS[realm] || CONFIG.MAPS[0];
    const avgValue = (map.valueMin + map.valueMax) / 2 * 0.05;
    const baseValue = Math.max(50, Math.floor(avgValue * CONFIG.QUALITY[quality].multiplier));
    return Math.floor(baseValue * CONFIG.QUALITY_GOLD_COST_MULTIPLIER[quality]);
  },

  // ========== 炼丹 ==========
  getAlchemyHTML() {
    const p = STATE.player;
    // 确保字段存在
    if (!p.pills) p.pills = {};
    if (!p.craftingQueue) p.craftingQueue = [];

    const recipes = CONFIG.PILL_RECIPES;
    const queueCap = this.getCraftingQueueCapacity();

    // 按境界分组显示
    const realmGroups = {};
    recipes.forEach(r => {
      if (!realmGroups[r.realm]) realmGroups[r.realm] = [];
      realmGroups[r.realm].push(r);
    });

    let html = `<div class="panel">`;
    html += `<h3 style="color:var(--accent);margin-bottom:6px;">炼丹炉</h3>`;
    const liandanLevel = p.caveBuildings.liandan || 1;
    const liandanData = CONFIG.CAVE_BUILDINGS.liandan.levels[liandanLevel - 1];
    html += `<div class="text-dim" style="font-size:11px;">等级 Lv.${liandanLevel} · 品质加成 +${liandanData.qualityBonus}% · 队列 ${p.craftingQueue.length}/${queueCap}</div>`;

    // 自动炼丹开关
    html += `<div style="margin-top:6px;">`;
    html += `<button class="btn" style="padding:3px 10px;font-size:11px;${p.autoCraft ? 'background:var(--q-good);' : ''}"
              onclick="CAVE.toggleAutoCraft()">${p.autoCraft ? '自动炼丹：开' : '自动炼丹：关'}</button>`;
    html += `</div>`;
    html += `</div>`;

    // 炼丹队列显示
    if (p.craftingQueue.length > 0) {
      html += `<div class="panel">`;
      html += `<div style="color:var(--accent);font-weight:bold;margin-bottom:6px;">炼丹队列</div>`;
      p.craftingQueue.forEach((craft, idx) => {
        const recipe = CONFIG.PILL_RECIPES.find(r => r.id === craft.recipeId);
        if (!recipe) return;
        const elapsed = ENGINE.now() - craft.startTime;
        const total = craft.endTime - craft.startTime;
        const remaining = Math.max(0, craft.endTime - ENGINE.now());
        html += `<div style="padding:4px 0;border-bottom:1px solid var(--border);">`;
        html += `<div style="display:flex;justify-content:space-between;align-items:center;">`;
        html += `<span style="font-size:12px;">${idx + 1}. ${recipe.name}</span>`;
        html += `<span class="text-dim" style="font-size:10px;">剩余 ${this.formatTime(remaining)}</span>`;
        html += `</div>`;
        html += `<div style="margin-top:2px;">${this.renderProgressBar(elapsed, total)}</div>`;
        html += `</div>`;
      });
      html += `</div>`;
    }

    // 按境界从低到高显示配方
    const sortedRealms = Object.keys(realmGroups).sort((a, b) => a - b);
    sortedRealms.forEach(realm => {
      const realmName = CONFIG.REALMS[realm];
      const isCurrentRealm = parseInt(realm) === p.currentRealm;
      html += `<div class="panel" style="${!isCurrentRealm ? 'opacity:0.7;' : ''}">`;
      html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">`;
      html += `<span style="color:var(--accent);font-weight:bold;font-size:13px;">${realmName}</span>`;
      if (isCurrentRealm) html += `<span style="font-size:10px;color:var(--q-good);">当前境界</span>`;
      html += `</div>`;

      realmGroups[realm].forEach(recipe => {
        const owned = p.recipes.includes(recipe.id);
        const pillCount = p.pills[recipe.id] || 0;
        const buffKey = recipe.realm + '_' + recipe.type;
        const consumed = p.danBuffs[buffKey] || 0;
        const isMaxed = consumed >= recipe.maxConsume;
        // 破境丹和筑基丹不可平时服用
        const isBreakthroughPill = recipe.type === "break" || recipe.type === "realm";

        html += `<div style="padding:6px 0;border-bottom:1px solid var(--border);${!owned ? 'opacity:0.4;' : ''}">`;
        html += `<div style="display:flex;justify-content:space-between;align-items:center;">`;
        html += `<span style="font-weight:bold;font-size:12px;${isMaxed ? 'color:var(--text-dim);' : ''}">${recipe.name}${isBreakthroughPill ? ' <span style="font-size:10px;color:var(--q-rare);">[突破专用]</span>' : (isMaxed ? '（已满）' : '')}</span>`;

        if (!owned) {
          // 未购买：显示购买按钮
          const canBuy = p.spiritStones >= recipe.price;
          html += `<button class="btn" style="padding:2px 8px;font-size:11px;${canBuy ? '' : 'opacity:0.4;cursor:not-allowed;'}"
                    ${canBuy ? '' : 'disabled'}
                    onclick="CAVE.buyRecipe(${recipe.id})">购买 💰${recipe.price.toLocaleString()}</button>`;
        } else if (isBreakthroughPill) {
          // 突破丹只显示库存
          html += `<span style="font-size:11px;color:var(--q-rare);">库存${pillCount}颗</span>`;
        } else if (isMaxed) {
          html += `<span class="text-dim" style="font-size:11px;">已满 ${consumed}/${recipe.maxConsume}</span>`;
        } else {
          html += `<span style="font-size:11px;color:var(--text-dim);">已服${consumed}/${recipe.maxConsume}</span>`;
        }
        html += `</div>`;

        if (owned) {
          // 显示所需材料
          html += `<div style="margin-top:3px;">`;
          recipe.materials.forEach(mat => {
            const have = p.materials[mat.id] || 0;
            const enough = have >= mat.count;
            const matName = this.getMaterialName(mat.id);
            html += `<span style="font-size:11px;margin-right:8px;color:${enough ? 'var(--q-good)' : '#ef4444'}">${matName} ${have}/${mat.count}</span>`;
          });
          html += `</div>`;

          // 炼丹时间
          html += `<div class="text-dim" style="font-size:10px;margin-top:2px;">炼丹时间：${this.formatTime(recipe.craftTime * 1000)}</div>`;

          // 库存丹药
          if (pillCount > 0 && !isBreakthroughPill) {
            html += `<div style="font-size:11px;color:var(--q-rare);margin-top:2px;">库存：${pillCount}颗</div>`;
          }

          // 操作按钮
          html += `<div style="display:flex;gap:4px;margin-top:4px;">`;

          // 加入队列按钮（检查材料够不够 + 队列是否满）
          const canCraft = recipe.materials.every(m => (p.materials[m.id] || 0) >= m.count);
          const queueFull = p.craftingQueue.length >= queueCap;
          const canJoin = canCraft && !queueFull;
          html += `<button class="btn" style="padding:2px 10px;font-size:11px;${canJoin ? '' : 'opacity:0.4;cursor:not-allowed;'}"
                    ${canJoin ? '' : 'disabled'}
                    onclick="CAVE.craftPill(${recipe.id})">${queueFull ? '队列已满' : '加入队列'}</button>`;

          // 服用按钮（只有非突破丹才显示）
          if (!isBreakthroughPill && pillCount > 0 && !isMaxed) {
            html += `<button class="btn" style="padding:2px 10px;font-size:11px;background:var(--q-good);"
                      onclick="CAVE.consumePill(${recipe.id})">服用</button>`;
          }
          html += `</div>`;
        }
        html += `</div>`;
      });

      html += `</div>`;
    });

    return html;
  },

  // 炼丹队列容量（由炼丹炉等级决定：Lv1=1, Lv2=2, ..., Lv5=5）
  getCraftingQueueCapacity() {
    const p = STATE.player;
    const liandanLevel = p.caveBuildings.liandan || 1;
    return liandanLevel;
  },

  // 切换自动炼丹开关
  toggleAutoCraft() {
    const p = STATE.player;
    p.autoCraft = !p.autoCraft;
    MAIN.refreshCave();
  },

  // 获取材料名称（支持草药id和材料id）
  getMaterialName(matId) {
    // 草药id格式：herb_{realm}_{attr|break}
    if (matId.startsWith('herb_')) {
      const parts = matId.split('_');
      const realm = parseInt(parts[1]);
      const herbs = CONFIG.HERB_CONFIG[realm];
      if (herbs) {
        const herb = herbs.find(h => h.id === matId);
        if (herb) return herb.name;
      }
      return matId;
    }
    // 材料id格式：mat_{realm}_{idx}
    const parts = matId.split('_');
    const realm = parseInt(parts[1]);
    const idx = parseInt(parts[2]);
    return CONFIG.MATERIAL_NAMES[realm][idx] || matId;
  },

  // 购买配方
  buyRecipe(recipeId) {
    const p = STATE.player;
    const recipe = CONFIG.PILL_RECIPES.find(r => r.id === recipeId);
    if (!recipe || p.recipes.includes(recipeId)) return;
    if (p.spiritStones < recipe.price) return;
    p.spiritStones -= recipe.price;
    p.recipes.push(recipeId);
    MAIN.refreshCave();
  },

  // 加入炼丹队列（不再立即产出丹药）
  craftPill(recipeId) {
    const p = STATE.player;
    if (!p.pills) p.pills = {};
    if (!p.craftingQueue) p.craftingQueue = [];

    // 检查队列容量
    if (p.craftingQueue.length >= this.getCraftingQueueCapacity()) return;

    const recipe = CONFIG.PILL_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return;

    // 检查材料
    for (const mat of recipe.materials) {
      if ((p.materials[mat.id] || 0) < mat.count) return;
    }

    // 消耗材料
    recipe.materials.forEach(mat => {
      p.materials[mat.id] -= mat.count;
      if (p.materials[mat.id] <= 0) delete p.materials[mat.id];
    });

    // 加入炼丹队列（贵重物品丹经：炼丹速度+20%）
    const alchemyBuff = getPreciousBuffTotal('buff_alchemy');
    const adjustedCraftTime = recipe.craftTime * (1 - alchemyBuff);
    p.craftingQueue.push({
      recipeId: recipeId,
      startTime: ENGINE.now(),
      endTime: ENGINE.now() + adjustedCraftTime * 1000
    });

    // 如果autoCraft开启且队列有空位，自动加入下一个可炼配方
    if (p.autoCraft && p.craftingQueue.length < this.getCraftingQueueCapacity()) {
      this.autoAddCraftRecipe();
    }

    MAIN.refreshCave();
  },

  // 自动加入下一个可炼配方（材料够的）
  autoAddCraftRecipe() {
    const p = STATE.player;
    if (!p.craftingQueue) p.craftingQueue = [];

    // 队列已满则不加
    if (p.craftingQueue.length >= this.getCraftingQueueCapacity()) return;

    // 遍历所有已购配方，找第一个材料够的
    for (const recipe of CONFIG.PILL_RECIPES) {
      if (!p.recipes.includes(recipe.id)) continue;
      const canCraft = recipe.materials.every(m => (p.materials[m.id] || 0) >= m.count);
      if (canCraft) {
        // 消耗材料
        recipe.materials.forEach(mat => {
          p.materials[mat.id] -= mat.count;
          if (p.materials[mat.id] <= 0) delete p.materials[mat.id];
        });
        // 加入队列（同样应用炼丹加速）
        const alchemyBuff2 = getPreciousBuffTotal('buff_alchemy');
        const adjustedCraftTime2 = recipe.craftTime * (1 - alchemyBuff2);
        p.craftingQueue.push({
          recipeId: recipe.id,
          startTime: ENGINE.now(),
          endTime: ENGINE.now() + adjustedCraftTime2 * 1000
        });
        return;
      }
    }
  },

  // 检查炼丹队列是否有完成的
  checkCraftingQueue() {
    const p = STATE.player;
    if (!p.craftingQueue) p.craftingQueue = [];
    if (!p.pills) p.pills = {};

    const now = ENGINE.now();
    // 从后往前遍历，避免splice后索引错位
    for (let i = p.craftingQueue.length - 1; i >= 0; i--) {
      const craft = p.craftingQueue[i];
      if (now >= craft.endTime) {
        // 完成：增加丹药
        const recipe = CONFIG.PILL_RECIPES.find(r => r.id === craft.recipeId);
        if (recipe) {
          // 炼丹炉品质加成影响产出数量
          const liandanLevel = p.caveBuildings.liandan || 1;
          const qualityBonus = CONFIG.CAVE_BUILDINGS.liandan.levels[liandanLevel - 1].qualityBonus;
          let count = 1;
          // qualityBonus% 概率额外产出1颗
          if (Math.random() * 100 < qualityBonus) count++;
          p.pills[craft.recipeId] = (p.pills[craft.recipeId] || 0) + count;
          SETTINGS.playSfx('craft');
        }
        p.craftingQueue.splice(i, 1);
      }
    }

    // 自动炼丹：如果队列有空位，自动加入下一个可炼配方
    if (p.autoCraft && p.craftingQueue.length < this.getCraftingQueueCapacity()) {
      this.autoAddCraftRecipe();
    }
  },

  // 服用丹药（仅属性丹可服用，破境丹/筑基丹不可）
  consumePill(recipeId) {
    const p = STATE.player;
    if (!p.pills) p.pills = {};
    const recipe = CONFIG.PILL_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return;

    // 突破专用丹药不可服用
    if (recipe.type === "break" || recipe.type === "realm") return;

    // 检查库存
    if (!p.pills[recipeId] || p.pills[recipeId] <= 0) return;

    // 检查服用上限
    const buffKey = recipe.realm + '_' + recipe.type;
    if ((p.danBuffs[buffKey] || 0) >= recipe.maxConsume) return;

    // 消耗丹药
    p.pills[recipeId]--;

    // 增加服用记录
    p.danBuffs[buffKey] = (p.danBuffs[buffKey] || 0) + 1;

    // 应用效果
    switch (recipe.type) {
      case 'atk':
        p.attrs.atk += 2;
        break;
      case 'def':
        p.attrs.def += 2;
        break;
      case 'spd':
        p.attrs.spd += 1;
        break;
    }

    MAIN.refreshCave();
  },

  // ========== 炼器 ==========
  getForgeHTML() {
    const p = STATE.player;
    const lianqiLevel = p.caveBuildings.lianqi || 1;
    const lianqiData = CONFIG.CAVE_BUILDINGS.lianqi.levels[lianqiLevel - 1];
    const maxRefresh = lianqiData.refreshCount;
    const refreshLeft = p.refreshCount || 0;

    let html = `<div class="panel">`;
    html += `<h3 style="color:var(--accent);margin-bottom:4px;">炼器炉</h3>`;
    html += `<div class="text-dim" style="font-size:11px;">等级 Lv.${lianqiLevel} · 品质加成 +${lianqiData.qualityBonus}% · 刷新次数 ${refreshLeft}/${maxRefresh}</div>`;

    // 当前装备显示
    const eq = p.equipment;
    html += `<div style="margin-top:6px;">`;
    html += `<div style="font-size:11px;color:var(--text-dim);margin-bottom:3px;">当前装备：</div>`;
    const eqSlots = [
      { key: 'weapon', icon: '⚔', label: '武器' },
      { key: 'armor', icon: '🛡', label: '防具' },
      { key: 'accessory', icon: '💍', label: '宝物' }
    ];
    eqSlots.forEach(slot => {
      const item = eq[slot.key];
      if (item) {
        const qColor = CONFIG.QUALITY[item.quality].color;
        html += `<span style="font-size:11px;margin-right:8px;color:${qColor}">${slot.icon}${item.name}</span>`;
      } else {
        html += `<span style="font-size:11px;margin-right:8px;color:var(--text-dim)">${slot.icon}${slot.label}：无</span>`;
      }
    });
    html += `</div>`;
    html += `</div>`;

    // 装备生成区域
    if (!this.equipOptions) {
      // 还没生成装备，显示生成按钮
      html += `<div class="panel" style="text-align:center;">`;
      html += `<div class="text-dim" style="font-size:12px;margin-bottom:8px;">生成3个装备列表，每个列表含武器/防具/宝物各1件，选择1个列表进入秘境</div>`;
      html += `<button class="btn" style="width:100%;" onclick="CAVE.generateEquipOptions()">生成装备列表</button>`;
      html += `</div>`;
    } else {
      // 显示3个装备列表
      const typeLabels = { weapon: '⚔', armor: '🛡', accessory: '💍' };
      const types = ['weapon', 'armor', 'accessory'];

      this.equipOptions.forEach((list, listIdx) => {
        const selected = this.selectedEquipList === listIdx;

        html += `<div class="panel" style="cursor:pointer;border:2px solid ${selected ? 'var(--accent)' : 'var(--border)'};${selected ? 'background:#2a2518;' : ''}"
                  onclick="CAVE.selectEquipList(${listIdx})">`;
        html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">`;
        html += `<span style="font-weight:bold;font-size:13px;color:${selected ? 'var(--accent)' : 'var(--text)'};">列表 ${listIdx + 1}</span>`;
        if (selected) html += `<span style="font-size:11px;color:var(--accent);">✓ 已选择</span>`;
        html += `</div>`;

        // 列表内3件装备
        types.forEach(type => {
          const equip = list[type];
          if (!equip) return;
          const qColor = CONFIG.QUALITY[equip.quality].color;
          const qName = CONFIG.QUALITY[equip.quality].name;

          html += `<div style="display:flex;align-items:center;gap:4px;padding:2px 0;">`;
          html += `<span style="font-size:12px;">${typeLabels[type]}</span>`;
          html += `<span style="color:${qColor};font-weight:bold;font-size:12px;">${equip.name}</span>`;
          html += `<span style="font-size:10px;color:${qColor};">(${qName})</span>`;
          // 属性
          const statStr = Object.keys(equip.stats).map(k => {
            const cfg = CONFIG.ATTRIBUTES[k];
            const name = cfg ? cfg.name : k;
            const v = equip.stats[k];
            const d = typeof v === 'number' && v % 1 !== 0 ? v.toFixed(1) : Math.floor(v);
            return `${name}+${d}`;
          }).join(' ');
          html += `<span style="font-size:10px;color:var(--q-good);margin-left:4px;">${statStr}</span>`;
          html += `</div>`;
        });

        html += `</div>`;
      });

      // 操作按钮
      html += `<div style="display:flex;gap:6px;">`;
      html += `<button class="btn" style="flex:1;${this.selectedEquipList !== null ? '' : 'opacity:0.4;cursor:not-allowed;'}"
                ${this.selectedEquipList !== null ? '' : 'disabled'}
                onclick="CAVE.confirmEquip()">确认选择</button>`;
      html += `<button class="btn" style="flex:1;${refreshLeft > 0 ? '' : 'opacity:0.4;cursor:not-allowed;'}"
                ${refreshLeft > 0 ? 'disabled' : 'disabled'}
                onclick="CAVE.refreshEquipOptions()">刷新（剩余${refreshLeft}次）</button>`;
      html += `</div>`;
    }

    return html;
  },

  // 品质随机（带加成）
  rollQuality(bonus) {
    const roll = Math.random() * 100 + (bonus || 0);
    if (roll >= 98) return 'legend';
    if (roll >= 90) return 'epic';
    if (roll >= 75) return 'rare';
    if (roll >= 50) return 'good';
    return 'common';
  },

  // 生成装备名称
  generateEquipName(type, quality) {
    const qualityKeys = ['common', 'good', 'rare', 'epic', 'legend'];
    const qIdx = qualityKeys.indexOf(quality);
    const qSuffix = CONFIG.QUALITY[quality].name;
    const nameBases = {
      weapon:    ["铁剑", "灵剑", "玄剑", "仙剑", "神剑"],
      armor:     ["布甲", "灵甲", "玄甲", "仙甲", "神甲"],
      accessory: ["玉佩", "灵佩", "玄佩", "仙佩", "神佩"]
    };
    return nameBases[type][qIdx] + '(' + qSuffix + ')';
  },

  // 生成单个装备对象
  generateSingleEquip(type, realmLayer, qualityBonus) {
    const quality = this.rollQuality(qualityBonus);
    const baseStats = CONFIG.getEquipBaseStats(type, realmLayer);
    const multiplier = CONFIG.EQUIP_QUALITY_MULTIPLIER[quality];
    const stats = {};
    Object.keys(baseStats).forEach(k => {
      stats[k] = Math.floor(baseStats[k] * multiplier * 10) / 10;
      if (k !== 'crit' && k !== 'critDmg' && k !== 'dodge' && k !== 'block' && k !== 'combo') {
        stats[k] = Math.floor(stats[k]);
      }
    });
    return {
      name: this.generateEquipName(type, quality),
      quality: quality,
      type: type,
      stats: stats,
      baseValue: Math.floor((realmLayer * 50 + 100) * multiplier)
    };
  },

  // 生成3个装备列表，每个列表含武器/防具/宝物各1件
  // isInitial: 是否为首次生成（首次时初始化刷新次数）
  generateEquipOptions(isInitial) {
    const p = STATE.player;
    const lianqiLevel = p.caveBuildings.lianqi || 1;
    const lianqiData = CONFIG.CAVE_BUILDINGS.lianqi.levels[lianqiLevel - 1];
    const qualityBonus = lianqiData.qualityBonus;
    const realmLayer = p.currentRealm * 9 + p.currentLayer;
    const types = ['weapon', 'armor', 'accessory'];

    // 生成3个列表
    this.equipOptions = [];
    for (let i = 0; i < 3; i++) {
      const list = {};
      types.forEach(type => {
        list[type] = this.generateSingleEquip(type, realmLayer, qualityBonus);
      });
      this.equipOptions.push(list);
    }

    // 首次生成时初始化刷新次数
    if (isInitial !== false) {
      p.refreshCount = lianqiData.refreshCount;
    }
    this.selectedEquipList = null;
    MAIN.refreshCave();
  },

  selectEquipList(idx) {
    this.selectedEquipList = idx;
    MAIN.refreshCave();
  },

  confirmEquip() {
    if (this.selectedEquipList === null || !this.equipOptions) return;
    const p = STATE.player;
    const list = this.equipOptions[this.selectedEquipList];
    if (!list) return;

    // 将选中列表的3件装备全部穿上
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

    // 清空选项
    this.equipOptions = null;
    this.selectedEquipList = null;
    MAIN.refreshCave();
  },

  refreshEquipOptions() {
    const p = STATE.player;
    if (!p.refreshCount || p.refreshCount <= 0) return;
    p.refreshCount--;
    this.equipOptions = null;
    this.selectedEquipList = null;
    this.generateEquipOptions(false);
  },

  // ========== 种植系统 ==========
  getFarmHTML() {
    const p = STATE.player;
    if (!p.herbSlots) p.herbSlots = [];
    if (!p.materials) p.materials = {};

    const lingtianLevel = p.caveBuildings.lingtian || 1;
    const lingtianData = CONFIG.CAVE_BUILDINGS.lingtian.levels[lingtianLevel - 1];
    const slotCount = lingtianData.herbSlots;

    // 确保种植槽数组长度正确
    while (p.herbSlots.length < slotCount) p.herbSlots.push(null);
    if (p.herbSlots.length > slotCount) {
      p.herbSlots = p.herbSlots.slice(0, slotCount);
    }

    const currentRealm = p.currentRealm;
    const herbs = CONFIG.HERB_CONFIG[currentRealm] || [];
    const freeSlotCount = p.herbSlots.filter(s => s === null).length;

    let html = `<div class="panel">`;
    html += `<h3 style="color:var(--accent);margin-bottom:4px;">灵田</h3>`;
    html += `<div class="text-dim" style="font-size:11px;">等级 Lv.${lingtianLevel} · 种植槽 ${slotCount}（空闲${freeSlotCount}）· 修炼速度 ×${lingtianData.meditationMultiplier}</div>`;
    html += `</div>`;

    // 可种植草药列表（当前境界）
    html += `<div class="panel">`;
    html += `<div style="color:var(--accent);font-weight:bold;margin-bottom:6px;">可种植草药（${CONFIG.REALMS[currentRealm]}）</div>`;
    herbs.forEach(herb => {
      const canPlant = freeSlotCount > 0;
      html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--border);">`;
      html += `<div>`;
      html += `<span style="font-weight:bold;font-size:12px;">${herb.name}</span>`;
      html += `<span class="text-dim" style="font-size:10px;margin-left:6px;">${herb.type === 'break' ? '破境草药' : '属性草药'} · 生长${this.formatTime(herb.growTime * 1000)}</span>`;
      html += `</div>`;
      html += `<button class="btn" style="padding:2px 10px;font-size:11px;${canPlant ? '' : 'opacity:0.4;cursor:not-allowed;'}"
                ${canPlant ? '' : 'disabled'}
                onclick="CAVE.plantHerb('${herb.id}')">种植</button>`;
      html += `</div>`;
    });
    html += `</div>`;

    // 种植槽状态
    html += `<div class="panel">`;
    html += `<div style="color:var(--accent);font-weight:bold;margin-bottom:6px;">种植槽</div>`;
    for (let i = 0; i < slotCount; i++) {
      const slot = p.herbSlots[i];
      html += `<div style="padding:4px 0;border-bottom:1px solid var(--border);">`;
      if (slot === null) {
        // 空闲
        html += `<div style="font-size:11px;color:var(--text-dim);">槽位 ${i + 1}：空闲</div>`;
      } else {
        // 查找草药配置
        const herbConfig = this.findHerbConfig(slot.herbId);
        if (!herbConfig) {
          html += `<div style="font-size:11px;color:var(--text-dim);">槽位 ${i + 1}：未知</div>`;
        } else {
          const elapsed = ENGINE.now() - slot.startTime;
          const total = slot.growTime;
          const isReady = elapsed >= total;
          if (isReady) {
            // 已成熟：显示收获按钮
            html += `<div style="display:flex;justify-content:space-between;align-items:center;">`;
            html += `<span style="font-size:12px;color:var(--q-good);">槽位 ${i + 1}：${herbConfig.name}（已成熟）</span>`;
            html += `<button class="btn" style="padding:2px 10px;font-size:11px;background:var(--q-good);"
                      onclick="CAVE.harvestHerb(${i})">收获</button>`;
            html += `</div>`;
          } else {
            // 种植中：显示进度条
            const remaining = total - elapsed;
            html += `<div style="display:flex;justify-content:space-between;align-items:center;">`;
            html += `<span style="font-size:12px;">槽位 ${i + 1}：${herbConfig.name}</span>`;
            html += `<span class="text-dim" style="font-size:10px;">剩余 ${this.formatTime(remaining)}</span>`;
            html += `</div>`;
            html += `<div style="margin-top:2px;">${this.renderProgressBar(elapsed, total)}</div>`;
          }
        }
      }
      html += `</div>`;
    }
    html += `</div>`;

    return html;
  },

  // 根据草药id查找配置
  findHerbConfig(herbId) {
    for (const realmHerbs of CONFIG.HERB_CONFIG) {
      const found = realmHerbs.find(h => h.id === herbId);
      if (found) return found;
    }
    return null;
  },

  // 种植草药
  plantHerb(herbId) {
    const p = STATE.player;
    if (!p.herbSlots) p.herbSlots = [];

    // 查找草药配置
    const herbConfig = this.findHerbConfig(herbId);
    if (!herbConfig) return;

    // 找空闲槽位
    const freeIdx = p.herbSlots.indexOf(null);
    if (freeIdx < 0) return;

    // 种植：设置槽位信息（贵重物品灵植诀：种植速度+20%）
    const farmBuff = getPreciousBuffTotal('buff_farming');
    const adjustedGrowTime = herbConfig.growTime * (1 - farmBuff);
    p.herbSlots[freeIdx] = {
      herbId: herbId,
      startTime: ENGINE.now(),
      growTime: adjustedGrowTime * 1000
    };

    MAIN.refreshCave();
  },

  // 收获草药
  harvestHerb(slotIdx) {
    const p = STATE.player;
    if (!p.herbSlots) return;
    const slot = p.herbSlots[slotIdx];
    if (!slot) return;

    // 检查是否已成熟
    const elapsed = ENGINE.now() - slot.startTime;
    if (elapsed < slot.growTime) return;

    // 收获草药：材料 += 草药id
    if (!p.materials) p.materials = {};
    p.materials[slot.herbId] = (p.materials[slot.herbId] || 0) + 1;

    // 清空槽位
    p.herbSlots[slotIdx] = null;

    MAIN.refreshCave();
  },

  // 检查种植槽（确保槽位数量正确，成熟状态在渲染时动态计算）
  checkHerbSlots() {
    const p = STATE.player;
    if (!p.herbSlots) p.herbSlots = [];

    const lingtianLevel = p.caveBuildings.lingtian || 1;
    const lingtianData = CONFIG.CAVE_BUILDINGS.lingtian.levels[lingtianLevel - 1];
    const slotCount = lingtianData.herbSlots;

    // 确保槽位数量正确
    while (p.herbSlots.length < slotCount) p.herbSlots.push(null);
    if (p.herbSlots.length > slotCount) {
      p.herbSlots = p.herbSlots.slice(0, slotCount);
    }
  },

  // ========== 仓库 ==========
  getWarehouseHTML() {
    const p = STATE.player;
    const items = p.warehouse;

    // 筛选栏
    const qualities = ['all', 'common', 'good', 'rare', 'epic', 'legend'];
    const qualityLabels = { all: '全部', common: '普通', good: '良品', rare: '上品', epic: '极品', legend: '传说' };

    let html = `<div class="panel">`;
    html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">`;
    html += `<span style="color:var(--accent);font-weight:bold;">仓库</span>`;
    html += `<span class="text-dim" style="font-size:11px;">${items.length}件物品</span>`;
    html += `</div>`;

    // 筛选按钮
    html += `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px;">`;
    qualities.forEach(qk => {
      const active = this.warehouseFilter === qk;
      const color = qk === 'all' ? 'var(--accent)' : CONFIG.QUALITY[qk].color;
      html += `<button style="padding:2px 8px;font-size:10px;border:1px solid ${active ? color : 'var(--border)'};background:${active ? color + '22' : 'transparent'};color:${active ? color : 'var(--text-dim)'};border-radius:3px;cursor:pointer;"
                onclick="CAVE.warehouseFilter='${qk}';MAIN.refreshCave();">${qualityLabels[qk]}</button>`;
    });
    html += `</div>`;

    // 物品列表
    const filtered = this.warehouseFilter === 'all'
      ? items
      : items.filter(it => it.quality === this.warehouseFilter);

    if (filtered.length === 0) {
      html += `<div class="text-dim" style="text-align:center;font-style:italic;padding:12px;">暂无物品</div>`;
    } else {
      // 按品质排序：传说→极品→上品→良品→普通
      const qualityOrder = ['legend', 'epic', 'rare', 'good', 'common'];
      const sorted = [...filtered].sort((a, b) => qualityOrder.indexOf(a.quality) - qualityOrder.indexOf(b.quality));

      html += `<div style="display:flex;flex-wrap:wrap;gap:4px;">`;
      sorted.forEach(item => {
        const q = CONFIG.QUALITY[item.quality];
        html += `
          <div style="background:var(--panel);border:1px solid ${q.color};border-radius:4px;padding:4px 6px;font-size:11px;min-width:60px;">
            <div style="color:${q.color};font-weight:bold;">${item.name}</div>
            <div style="color:var(--text-dim);font-size:10px;">💰${item.baseValue.toLocaleString()}</div>
          </div>
        `;
      });
      html += `</div>`;
    }

    html += `</div>`;

    // 材料库存
    const matKeys = Object.keys(p.materials);
    if (matKeys.length > 0) {
      html += `<div class="panel">`;
      html += `<span style="color:var(--accent);font-weight:bold;">炼丹材料</span>`;
      html += `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;">`;
      matKeys.forEach(matId => {
        const count = p.materials[matId];
        const name = this.getMaterialName(matId);
        html += `<span style="font-size:11px;background:var(--border);padding:2px 6px;border-radius:3px;">${name} ×${count}</span>`;
      });
      html += `</div>`;
      html += `</div>`;
    }

    // 丹药库存
    if (p.pills) {
      const pillKeys = Object.keys(p.pills).filter(k => p.pills[k] > 0);
      if (pillKeys.length > 0) {
        html += `<div class="panel">`;
        html += `<span style="color:var(--accent);font-weight:bold;">丹药库存</span>`;
        html += `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;">`;
        pillKeys.forEach(recipeId => {
          const count = p.pills[recipeId];
          const recipe = CONFIG.PILL_RECIPES.find(r => r.id === parseInt(recipeId));
          if (recipe) {
            html += `<span style="font-size:11px;background:#2a3520;padding:2px 6px;border-radius:3px;color:var(--q-good);">${recipe.name} ×${count}</span>`;
          }
        });
        html += `</div>`;
        html += `</div>`;
      }
    }

    return html;
  },

  // ========== 藏宝阁 ==========
  getTreasureHTML() {
    const pc = STATE.player.preciousCollection || {};
    const items = CONFIG.PRECIOUS_ITEMS || [];

    // 按分类分组
    const gongfaItems = items.filter(it => it.category === 'gongfa');
    const fabaoItems = items.filter(it => it.category === 'fabao');

    let html = `<div class="panel">`;
    html += `<h3 style="color:var(--accent);margin-bottom:4px;">藏宝阁</h3>`;
    html += `<div class="text-dim" style="font-size:11px;">收集贵重物品碎片，解锁功法与法宝</div>`;
    html += `</div>`;

    // 功法区域
    html += `<div class="panel">`;
    html += `<div style="color:var(--accent);font-weight:bold;margin-bottom:6px;">📜 功法</div>`;
    html += `<div class="text-dim" style="font-size:10px;margin-bottom:6px;">收集残页解锁功法，获得场外增益与战斗技能</div>`;
    gongfaItems.forEach(pi => {
      const collected = pc[pi.id] || 0;
      const unlocked = collected >= pi.requiredCount;
      const q = CONFIG.QUALITY[pi.quality];
      const pct = Math.min(100, collected / pi.requiredCount * 100);
      html += `<div style="padding:6px 0;border-bottom:1px solid var(--border);${unlocked ? '' : 'opacity:0.8;'}">`;
      html += `<div style="display:flex;justify-content:space-between;align-items:center;">`;
      html += `<div>`;
      html += `<span style="color:${q.color};font-weight:bold;font-size:12px;">${pi.name}</span>`;
      if (unlocked) {
        html += ` <span style="font-size:10px;color:#4ade80;">✓ 已解锁</span>`;
      }
      html += `</div>`;
      html += `<span style="font-size:11px;color:${collected >= pi.requiredCount ? '#4ade80' : q.color};">${collected}/${pi.requiredCount}</span>`;
      html += `</div>`;
      html += `<div style="font-size:10px;color:var(--text-dim);margin-top:2px;">碎片：${pi.fragmentName}（${CONFIG.QUALITY[pi.quality].name}）</div>`;
      html += `<div style="font-size:11px;margin-top:2px;color:${unlocked ? '#4ade80' : 'var(--text-dim)'};">效果：${pi.desc}</div>`;
      // 进度条
      html += `<div style="margin-top:3px;">`;
      html += `<div style="width:100%;height:4px;background:var(--border);border-radius:2px;overflow:hidden;">`;
      html += `<div style="width:${pct}%;height:100%;background:${unlocked ? '#4ade80' : q.color};transition:width 0.3s;"></div>`;
      html += `</div>`;
      html += `</div>`;
      html += `</div>`;
    });
    html += `</div>`;

    // 法宝区域
    html += `<div class="panel">`;
    html += `<div style="color:var(--accent);font-weight:bold;margin-bottom:6px;">🔮 法宝</div>`;
    html += `<div class="text-dim" style="font-size:10px;margin-bottom:6px;">收集碎片解锁法宝，获得战斗属性加成</div>`;
    fabaoItems.forEach(pi => {
      const collected = pc[pi.id] || 0;
      const unlocked = collected >= pi.requiredCount;
      const q = CONFIG.QUALITY[pi.quality];
      const pct = Math.min(100, collected / pi.requiredCount * 100);
      html += `<div style="padding:6px 0;border-bottom:1px solid var(--border);${unlocked ? '' : 'opacity:0.8;'}">`;
      html += `<div style="display:flex;justify-content:space-between;align-items:center;">`;
      html += `<div>`;
      html += `<span style="color:${q.color};font-weight:bold;font-size:12px;">${pi.name}</span>`;
      if (unlocked) {
        html += ` <span style="font-size:10px;color:#4ade80;">✓ 已解锁</span>`;
      }
      html += `</div>`;
      html += `<span style="font-size:11px;color:${collected >= pi.requiredCount ? '#4ade80' : q.color};">${collected}/${pi.requiredCount}</span>`;
      html += `</div>`;
      html += `<div style="font-size:10px;color:var(--text-dim);margin-top:2px;">碎片：${pi.fragmentName}（${CONFIG.QUALITY[pi.quality].name}）</div>`;
      html += `<div style="font-size:11px;margin-top:2px;color:${unlocked ? '#4ade80' : 'var(--text-dim)'};">效果：${pi.desc}</div>`;
      // 进度条
      html += `<div style="margin-top:3px;">`;
      html += `<div style="width:100%;height:4px;background:var(--border);border-radius:2px;overflow:hidden;">`;
      html += `<div style="width:${pct}%;height:100%;background:${unlocked ? '#4ade80' : q.color};transition:width 0.3s;"></div>`;
      html += `</div>`;
      html += `</div>`;
      html += `</div>`;
    });
    html += `</div>`;

    return html;
  },

  /* ================== P0：离线结算与摘要（改造路线B 地基）================== */

  /**
   * 离线推进（P0）：洞府建筑升级 / 炼丹队列（含自动炼丹续炼）/ 种植状态
   * 说明：离线只结算"确定性的时间收益"，不触发 UI 刷新与音效（离线阶段 SETTINGS 可能尚未初始化）。
   *      种植的成熟度本身由时间推导，无需推进，仅统计可收获数量。
   * @param {number} elapsedMs 离线真实经过毫秒
   */
  offlineTick(elapsedMs) {
    const p = STATE.player;
    if (!p) return;
    const now = Date.now();      // 离线窗口基于真实时间，不受 timeMult 影响
    this._offlineLog = [];

    // ---------- 1) 建筑升级 ----------
    if (!p.buildingUpgrades) p.buildingUpgrades = { lingtian: null, liandan: null, lianqi: null };
    const nameMap = { lingtian: "灵田", liandan: "炼丹房", lianqi: "炼器炉" };
    Object.keys(p.buildingUpgrades).forEach(key => {
      const upgrade = p.buildingUpgrades[key];
      if (upgrade && now >= upgrade.endTime) {
        p.caveBuildings[key] = upgrade.targetLevel;
        p.buildingUpgrades[key] = null;
        // 炼器炉升级完成后刷新次数同步（与 checkBuildingUpgrades 一致）
        if (key === 'lianqi') {
          const lianqiData = CONFIG.CAVE_BUILDINGS.lianqi.levels[upgrade.targetLevel - 1];
          if (lianqiData) p.refreshCount = lianqiData.refreshCount;
        }
        this._offlineLog.push(`${nameMap[key] || key} 升级完成 → Lv.${upgrade.targetLevel}`);
      }
    });

    // ---------- 2) 炼丹队列：按完成时刻先后顺序推进 ----------
    if (!p.craftingQueue) p.craftingQueue = [];
    if (!p.pills) p.pills = {};
    let doneCount = 0;
    const gotPills = {};
    let autoChained = 0;
    let guard = 0;
    while (guard++ < 5000) {
      // 找出离线窗口内最早完成的丹药（等价于实时 checkCraftingQueue 的"到时即产出"）
      let idx = -1, minEnd = Infinity;
      for (let i = 0; i < p.craftingQueue.length; i++) {
        const c = p.craftingQueue[i];
        if (c && c.endTime <= now && c.endTime < minEnd) { minEnd = c.endTime; idx = i; }
      }
      if (idx < 0) break;
      const craft = p.craftingQueue.splice(idx, 1)[0];
      const recipe = CONFIG.PILL_RECIPES.find(r => r.id === craft.recipeId);
      if (recipe) {
        // 产出数量公式与实时版一致（炼丹房品质加成概率 +1 颗）
        const liandanLevel = (p.caveBuildings && p.caveBuildings.liandan) || 1;
        const qualityBonus = CONFIG.CAVE_BUILDINGS.liandan.levels[liandanLevel - 1].qualityBonus;
        let count = 1;
        if (Math.random() * 100 < qualityBonus) count++;
        p.pills[craft.recipeId] = (p.pills[craft.recipeId] || 0) + count;
        gotPills[recipe.name] = (gotPills[recipe.name] || 0) + count;
        doneCount++;
      }
      // 自动炼丹续炼：以本次完成时刻为起点接续，保持与实时一致的节奏
      if (p.autoCraft && p.craftingQueue.length < this.getCraftingQueueCapacity()) {
        if (this._offlineAutoAddCraft(craft.endTime)) autoChained++;
      }
    }
    if (doneCount > 0) {
      const detail = Object.keys(gotPills).map(n => `${n}×${gotPills[n]}`).join("、");
      this._offlineLog.push(`炼丹：完成 ${doneCount} 炉，获得 ${detail}`);
    }
    if (autoChained > 0) {
      this._offlineLog.push(`自动炼丹：离线期间续炼 ${autoChained} 炉`);
    }
    if (p.craftingQueue.length > 0) {
      const craft = p.craftingQueue[0];
      this._offlineLog.push(`炼丹队列：仍有 ${p.craftingQueue.length} 炉在炼（下一炉约 ${formatDuration(Math.max(0, craft.endTime - now))}后完成）`);
    }

    // ---------- 3) 种植：成熟度由时间推导，仅统计可收获数量 ----------
    const ready = this.countReadyHerbs();
    if (ready > 0) {
      this._offlineLog.push(`灵田：${ready} 株灵草已成熟，可前往收获`);
    }
  },

  /**
   * 离线专用自动炼丹入队：与 autoAddCraftRecipe 逻辑一致，
   * 仅把"当前时间"换成上一次炼丹的完成时刻（离线按真实节奏接续）。
   * @returns {boolean} 是否成功入队
   */
  _offlineAutoAddCraft(startTime) {
    const p = STATE.player;
    if (!p.recipes) p.recipes = [];
    if (p.craftingQueue.length >= this.getCraftingQueueCapacity()) return false;
    for (const recipe of CONFIG.PILL_RECIPES) {
      if (!p.recipes.includes(recipe.id)) continue;
      const canCraft = recipe.materials.every(m => (p.materials[m.id] || 0) >= m.count);
      if (!canCraft) continue;
      recipe.materials.forEach(mat => {
        p.materials[mat.id] -= mat.count;
        if (p.materials[mat.id] <= 0) delete p.materials[mat.id];
      });
      const alchemyBuff = getPreciousBuffTotal("buff_alchemy");
      const adjustedCraftTime = recipe.craftTime * (1 - alchemyBuff);
      p.craftingQueue.push({
        recipeId: recipe.id,
        startTime: startTime,
        endTime: startTime + adjustedCraftTime * 1000
      });
      return true;
    }
    return false;
  },

  /** 统计已成熟但未收获的灵草数量 */
  countReadyHerbs() {
    const p = STATE.player;
    if (!p.herbSlots) return 0;
    const now = ENGINE.now();
    let n = 0;
    p.herbSlots.forEach(slot => {
      if (slot && (now - slot.startTime) >= slot.growTime) n++;
    });
    return n;
  },

  /** 离线摘要用的数值快照 */
  stats() {
    const p = STATE.player || {};
    const buildings = p.caveBuildings || {};
    let buildingSum = 0;
    Object.keys(buildings).forEach(k => { buildingSum += buildings[k] || 0; });
    let pills = 0;
    Object.keys(p.pills || {}).forEach(k => { pills += p.pills[k] || 0; });
    let materials = 0;
    Object.keys(p.materials || {}).forEach(k => { materials += p.materials[k] || 0; });
    return {
      spiritStones: Math.floor(p.spiritStones || 0),
      buildings: buildingSum,
      pills: pills,
      materials: materials,
      herbsReady: this.countReadyHerbs()
    };
  },

  statLabels: {
    spiritStones: { label: "灵石", unit: "" },
    buildings:    { label: "洞府建筑总等级", unit: "" },
    pills:        { label: "丹药", unit: "颗" },
    materials:    { label: "炼丹材料", unit: "份" },
    herbsReady:   { label: "成熟灵草", unit: "株" }
  },

  /** 离线摘要文字条目（由 offlineTick 填充） */
  offlineNotes() { return this._offlineLog ? this._offlineLog.slice() : []; }
};


// ===== 注册到统一 Tick 引擎（P0）=====
// tick：洞府界面 1s 进度刷新（替代原 getHTML 内的 setInterval，判定条件一致）
// offlineTick：离线结算建筑升级 / 炼丹（含自动续炼）/ 种植状态
ENGINE.register({
  name: 'cave',
  label: '洞府',
  tickspeed: 1000,
  tick: () => {
    if (typeof MAIN !== 'undefined' && MAIN.currentView === 'cave' && CAVE.hasActiveProgress()) {
      MAIN.refreshCave();
    }
  },
  offlineTick: (ms) => CAVE.offlineTick(ms),
  stats: () => CAVE.stats(),
  statLabels: CAVE.statLabels,
  notes: () => CAVE.offlineNotes()
});
