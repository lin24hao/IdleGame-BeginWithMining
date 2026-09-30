const MARKET = {
  currentTab: "sell",

  getHTML() {
    let html = `<div class="panel"><h2 style="color:var(--accent);margin-bottom:8px;">坊市</h2></div>`;
    // 顶部3个Tab按钮
    const tabs = [
      { key: "sell", label: "出售道具" },
      { key: "recipe", label: "炼丹配方" },
      { key: "buy", label: "灵石补购" }
    ];
    html += `<div style="display:flex;gap:4px;margin-bottom:8px;">`;
    tabs.forEach(t => {
      const active = this.currentTab === t.key;
      html += `<button class="btn" style="flex:1;${active ? 'background:var(--accent);color:#1a1a1f;font-weight:bold;' : ''}" onclick="MARKET.switchTab('${t.key}')">${t.label}</button>`;
    });
    html += `</div>`;
    // 内容区根据currentTab显示
    if (this.currentTab === "sell") {
      html += this.getSellHTML();
    } else if (this.currentTab === "recipe") {
      html += this.getRecipeHTML();
    } else if (this.currentTab === "buy") {
      html += this.getBuyHTML();
    }
    html += `<button class="btn" style="width:100%;margin-top:8px;" onclick="MAIN.switchView('cave')">返回洞府</button>`;
    return html;
  },

  switchTab(tab) {
    this.currentTab = tab;
    MAIN.render();
  },

  // === Tab1: 出售道具 ===
  getSellHTML() {
    const items = STATE.player.storageRing.items;
    let total = 0;
    let html = `<div class="panel"><h3 style="margin-bottom:8px;">储物戒道具</h3>`;
    if (items.length === 0) {
      html += `<div class="text-dim">暂无道具可售</div>`;
    } else {
      html += `<div style="display:flex;flex-direction:column;gap:4px;">`;
      items.forEach((item, idx) => {
        const q = CONFIG.QUALITY[item.quality];
        total += item.baseValue;
        // 判断是否为当前建筑升级所需材料
        const isUpgradeMat = this.isUpgradeMaterial(item.quality);
        html += `
          <div style="display:flex;align-items:center;justify-content:space-between;background:var(--panel);border:1px solid ${q.color};border-radius:4px;padding:4px 8px;">
            <div style="display:flex;align-items:center;gap:4px;">
              <span style="color:${q.color};font-weight:bold;font-size:12px;">${item.name}</span>
              <span style="color:var(--text-dim);font-size:10px;">${q.name}</span>
              ${isUpgradeMat ? '<span style="color:var(--q-legend);font-size:14px;cursor:help;" title="当前洞府建筑升级所需材料">⚠</span>' : ''}
            </div>
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="color:#c9a96e;font-size:11px;">💰${item.baseValue.toLocaleString()}</span>
              <button class="btn" style="padding:2px 8px;font-size:10px;" onclick="MARKET.sellItem(${idx})">出售</button>
            </div>
          </div>
        `;
      });
      html += `</div>`;
    }
    html += `</div>`;
    html += `
      <div class="panel">
        <div>总价值：${total.toLocaleString()} 灵石</div>
        <button class="btn" style="margin-top:8px;width:100%;" ${items.length===0?'disabled':''} onclick="MARKET.sellAll()">一键出售</button>
      </div>
    `;
    return html;
  },

  // 判断物品品质是否为当前某建筑升级所需
  isUpgradeMaterial(quality) {
    const p = STATE.player;
    const buildings = CONFIG.CAVE_BUILDINGS;
    for (const key of Object.keys(buildings)) {
      const curLevel = p.caveBuildings[key] || 1;
      if (curLevel >= buildings[key].levels.length) continue; // 已满级
      const nextCost = buildings[key].levels[curLevel].upgradeCost;
      if (nextCost && nextCost.itemQuality === quality) return true;
    }
    return false;
  },

  sellItem(idx) {
    const items = STATE.player.storageRing.items;
    if (idx < 0 || idx >= items.length) return;
    STATE.player.spiritStones += items[idx].baseValue;
    items.splice(idx, 1);
    MAIN.render();
  },

  sellAll() {
    const items = STATE.player.storageRing.items;
    let total = 0;
    items.forEach(it => total += it.baseValue);
    STATE.player.spiritStones += total;
    STATE.player.storageRing.items = [];
    MAIN.render();
  },

  // === Tab2: 炼丹配方 ===
  getRecipeHTML() {
    const recipes = CONFIG.PILL_RECIPES;
    const owned = STATE.player.recipes || [];
    let html = `<div class="panel"><h3 style="margin-bottom:8px;">炼丹配方</h3>`;

    // 按境界分组
    CONFIG.REALMS.forEach((realmName, realm) => {
      const realmRecipes = recipes.filter(r => r.realm === realm);
      if (realmRecipes.length === 0) return;
      html += `<div style="margin-top:8px;margin-bottom:4px;font-weight:bold;color:var(--accent);font-size:12px;">${realmName}</div>`;
      html += `<div style="display:flex;flex-wrap:wrap;gap:4px;">`;
      realmRecipes.forEach(recipe => {
        const isOwned = owned.includes(recipe.id);
        const q = CONFIG.QUALITY[recipe.realm >= 6 ? 'epic' : recipe.realm >= 3 ? 'rare' : 'good'];
        if (isOwned) {
          // 已购：灰显+标记
          html += `
            <div style="background:#1a1a1f;border:1px solid #555;border-radius:4px;padding:6px 10px;opacity:0.5;font-size:11px;">
              <span style="color:#888;">${recipe.name}</span>
              <span style="color:#666;font-size:10px;margin-left:4px;">已拥有</span>
            </div>
          `;
        } else {
          // 未购：显示价格+购买按钮
          const canAfford = STATE.player.spiritStones >= recipe.price;
          html += `
            <div style="background:var(--panel);border:1px solid ${q.color};border-radius:4px;padding:6px 10px;font-size:11px;">
              <span style="color:${q.color};font-weight:bold;">${recipe.name}</span>
              <div style="font-size:10px;color:#8a8070;margin-top:2px;">
                材料：${recipe.materials.map(m => {
                  const matName = CONFIG.MATERIAL_NAMES[recipe.realm][parseInt(m.id.split('_')[2])];
                  return matName + '×' + m.count;
                }).join(' ')}
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
                <span style="color:#c9a96e;">💰${recipe.price.toLocaleString()}</span>
                <button class="btn" style="padding:2px 8px;font-size:10px;${canAfford ? '' : 'opacity:0.4;cursor:not-allowed;'}"
                        ${canAfford ? '' : 'disabled'}
                        onclick="MARKET.buyRecipe(${recipe.id})">购买</button>
              </div>
            </div>
          `;
        }
      });
      html += `</div>`;
    });
    html += `</div>`;
    return html;
  },

  buyRecipe(id) {
    const recipe = CONFIG.PILL_RECIPES.find(r => r.id === id);
    if (!recipe) return;
    if (STATE.player.spiritStones < recipe.price) return;
    if (STATE.player.recipes.includes(id)) return;
    STATE.player.spiritStones -= recipe.price;
    STATE.player.recipes.push(id);
    MAIN.render();
  },

  // === Tab3: 灵石补购 ===
  getBuyHTML() {
    const qualities = ["common", "good", "rare", "epic", "legend"];
    let html = `<div class="panel"><h3 style="margin-bottom:8px;">灵石补购</h3>`;
    html += `<div class="text-dim" style="font-size:11px;margin-bottom:8px;">用灵石直接购买物品存入仓库</div>`;

    qualities.forEach(qk => {
      const q = CONFIG.QUALITY[qk];
      const costMul = CONFIG.QUALITY_GOLD_COST_MULTIPLIER[qk];
      // 基础价值 = 当前境界对应的平均物品价值
      const realmLayer = STATE.player.currentRealm * 9 + STATE.player.currentLayer;
      const map = CONFIG.MAPS.find(m => m.realm === STATE.player.currentRealm);
      const baseVal = map ? Math.floor((map.valueMin + map.valueMax * 0.1) * q.multiplier * 0.5) : 100 * q.multiplier;
      const price = Math.floor(baseVal * costMul);
      const canAfford = STATE.player.spiritStones >= price;
      html += `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border);">
          <div>
            <span style="color:${q.color};font-weight:bold;">${q.name}品质物品</span>
            <span style="color:#8a8070;font-size:10px;margin-left:4px;">价值约${baseVal.toLocaleString()}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="color:#c9a96e;font-size:12px;">💰${price.toLocaleString()}</span>
            <button class="btn" style="padding:3px 10px;font-size:11px;${canAfford ? '' : 'opacity:0.4;cursor:not-allowed;'}"
                    ${canAfford ? '' : 'disabled'}
                    onclick="MARKET.buyItemWithStones('${qk}')">购买</button>
          </div>
        </div>
      `;
    });
    html += `</div>`;
    // 仓库显示
    const warehouse = STATE.player.warehouse || [];
    html += `<div class="panel"><h3 style="margin-bottom:6px;">仓库 <span class="text-dim" style="font-size:11px;">${warehouse.length}件</span></h3>`;
    if (warehouse.length === 0) {
      html += `<div class="text-dim">仓库为空</div>`;
    } else {
      html += `<div style="display:flex;flex-wrap:wrap;gap:4px;">`;
      warehouse.forEach((item, idx) => {
        const q = CONFIG.QUALITY[item.quality];
        html += `
          <div style="background:var(--panel);border:1px solid ${q.color};border-radius:4px;padding:4px 8px;font-size:11px;">
            <span style="color:${q.color};font-weight:bold;">${item.name}</span>
            <span style="color:#c9a96e;font-size:10px;margin-left:4px;">💰${item.baseValue.toLocaleString()}</span>
          </div>
        `;
      });
      html += `</div>`;
    }
    html += `</div>`;
    return html;
  },

  buyItemWithStones(quality) {
    const q = CONFIG.QUALITY[quality];
    const costMul = CONFIG.QUALITY_GOLD_COST_MULTIPLIER[quality];
    const map = CONFIG.MAPS.find(m => m.realm === STATE.player.currentRealm);
    const baseVal = map ? Math.floor((map.valueMin + map.valueMax * 0.1) * q.multiplier * 0.5) : 100 * q.multiplier;
    const price = Math.floor(baseVal * costMul);
    if (STATE.player.spiritStones < price) return;

    STATE.player.spiritStones -= price;
    // 生成一个该品质的物品放入仓库
    const names = CONFIG.ITEM_NAMES[quality];
    const name = names[Math.floor(Math.random() * names.length)];
    const size = CONFIG.SIZES[Math.floor(Math.random() * CONFIG.SIZES.length)];
    const itemValue = Math.max(1, baseVal);
    const item = {
      uid: Date.now() + Math.random(),
      name: name,
      width: size.w,
      height: size.h,
      quality: quality,
      baseValue: itemValue,
      perCell: itemValue / (size.w * size.h),
      mapId: map ? map.id : 1
    };
    if (!STATE.player.warehouse) STATE.player.warehouse = [];
    STATE.player.warehouse.push(item);
    MAIN.render();
  }
};
