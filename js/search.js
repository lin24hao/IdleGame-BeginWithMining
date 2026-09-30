// 装备生成工具（属于CAVE模块的一部分，在此文件中定义）
const CAVE_EQUIP = {
  // 生成一件装备物品
  generateEquipItem(type, realmLayer) {
    // 品质权重
    const weights = { common: 40, good: 30, rare: 20, epic: 8, legend: 2 };
    // 炼器炉等级加成
    const lianqiLevel = STATE.player.caveBuildings?.lianqi || 1;
    const lianqiBonus = CONFIG.CAVE_BUILDINGS.lianqi.levels[lianqiLevel - 1]?.qualityBonus || 0;
    let w = { ...weights };
    w.rare += lianqiBonus;
    w.epic += Math.floor(lianqiBonus / 2);
    w.legend += Math.floor(lianqiBonus / 4);
    w.common = Math.max(5, w.common - lianqiBonus);

    const total = Object.values(w).reduce((s, v) => s + v, 0);
    let r = Math.random() * total;
    let quality = "common";
    for (const [qk, qw] of Object.entries(w)) { r -= qw; if (r <= 0) { quality = qk; break; } }

    // 基础属性
    const baseStats = CONFIG.getEquipBaseStats(type, realmLayer);
    const qMul = CONFIG.EQUIP_QUALITY_MULTIPLIER[quality];
    // 品质倍率应用到stats
    const stats = {};
    Object.entries(baseStats).forEach(([k, v]) => { stats[k] = Math.floor(v * qMul); });

    // 装备名生成
    const typeNames = { weapon: ["剑","刀","枪","斧","锤"], armor: ["甲","袍","盾","衣","铠"], accessory: ["戒","佩","珠","符","环"] };
    const realmPrefixes = ["凡铁","灵纹","玄冥","天罡","混沌","幽冥","天灵","时光","鸿蒙"];
    const realmIdx = Math.min(8, Math.floor(realmLayer / 9));
    const suffix = typeNames[type][Math.floor(Math.random() * typeNames[type].length)];
    const name = realmPrefixes[realmIdx] + suffix;

    // 基础价值
    const baseValue = Math.floor(Object.values(stats).reduce((s, v) => s + v, 0) * qMul * 10);

    return {
      uid: Date.now() + Math.random(),
      name: name,
      type: type,            // weapon/armor/accessory
      quality: quality,
      stats: stats,
      baseValue: baseValue,
      width: 1,
      height: 1,
      perCell: baseValue,
      isEquip: true
    };
  }
};

// 处理装备物品：自动装备比较
function handleEquipItem(equipItem) {
  const slot = equipItem.type; // weapon/armor/accessory
  const current = STATE.player.equipment[slot];
  if (!current || equipItem.quality > current.quality) {
    // 更好的装备，自动替换
    if (current) STATE.player.storageBag.items.push({...current, uid: Date.now()+Math.random(), isEquip:true});
    STATE.player.equipment[slot] = equipItem;
    EXPLORATION.log(`装备更好的${equipItem.name}！`, "var(--q-legend)");
  } else {
    // 更差或同级，入袋
    STATE.player.storageBag.items.push(equipItem);
    EXPLORATION.log(`获得${equipItem.name}，入储物袋`, "var(--q-good)");
  }
}

const SEARCH = {
  currentItems: [],
  isRevealing: false,

  generateRandomItem(mapId) {
    const mapItems = CONFIG.ITEMS.filter(it => it.mapId === mapId);
    if (mapItems.length === 0) return null;
    const realmLayer = STATE.player.currentRealm * 9 + STATE.player.currentLayer;
    // 参考三角洲行动：低品质占绝大多数，高品质极稀有
    const weights = { common: 60, good: 25, rare: 10, epic: 4, legend: 1 };
    let w = { ...weights };
    // 境界越高，高品质物品出现率略升（替代原气运）
    if (realmLayer > 10) { w.common -= 5; w.good += 2; w.rare += 2; w.epic += 1; }
    if (realmLayer > 20) { w.common -= 5; w.good += 2; w.rare += 2; w.legend += 1; }
    const total = Object.values(w).reduce((s, v) => s + v, 0);
    let r = Math.random() * total;
    let quality = "common";
    for (const [qk, qw] of Object.entries(w)) { r -= qw; if (r <= 0) { quality = qk; break; } }
    const candidates = mapItems.filter(it => it.quality === quality);
    const base = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : mapItems[Math.floor(Math.random() * mapItems.length)];
    return { ...base, uid: Date.now() + Math.random() };
  },

  generatePointItems(mapId) {
    const count = 5 + Math.floor(Math.random() * 6);
    const items = [];
    const map = CONFIG.MAPS.find(m => m.id === mapId);
    for (let i = 0; i < count; i++) {
      const item = this.generateRandomItem(mapId);
      if (item) {
        // 10%概率生成装备替换普通物品
        if (Math.random() < 0.1) {
          const eqTypes = ["weapon","armor","accessory"];
          const eqType = eqTypes[Math.floor(Math.random() * eqTypes.length)];
          const realmLayer = map.realm * 9 + 5; // 中等难度
          items[i] = CAVE_EQUIP.generateEquipItem(eqType, realmLayer);
        } else {
          items[i] = item;
        }
      }
    }
    return items.filter(Boolean);
  },

  // 根据物品计算自适应容器大小，然后摆放
  placeItemsAdaptive(items) {
    // 先按体积从大到小排列（大的先放更合理）
    const sorted = [...items].sort((a, b) => (b.width * b.height) - (a.width * a.height));
    // 初始容器估算：按物品总面积的1.8倍
    const totalArea = sorted.reduce((s, it) => s + it.width * it.height, 0);
    const targetW = Math.max(5, Math.min(10, Math.ceil(Math.sqrt(totalArea * 1.8 / 2))));
    let targetH = Math.ceil(totalArea / targetW) + 2;
    targetH = Math.max(5, Math.min(20, targetH));

    const placed = [];
    const tryPlace = (gridW, gridH) => {
      const grid = Array(gridH).fill(null).map(() => Array(gridW).fill(null));
      placed.length = 0;
      for (const item of sorted) {
        let placedOk = false;
        for (let y = 0; y < gridH && !placedOk; y++) {
          for (let x = 0; x < gridW && !placedOk; x++) {
            if (x + item.width > gridW || y + item.height > gridH) continue;
            let free = true;
            for (let dy = 0; dy < item.height; dy++) {
              for (let dx = 0; dx < item.width; dx++) {
                if (grid[y + dy][x + dx] !== null) { free = false; break; }
              }
              if (!free) break;
            }
            if (free) {
              for (let dy = 0; dy < item.height; dy++) {
                for (let dx = 0; dx < item.width; dx++) { grid[y + dy][x + dx] = item.uid; }
              }
              placed.push({ ...item, gx: x, gy: y });
              placedOk = true;
            }
          }
        }
        if (!placedOk) return false;
      }
      // 成功：裁剪容器到实际使用大小
      let maxX = 0, maxY = 0;
      placed.forEach(it => {
        maxX = Math.max(maxX, it.gx + it.width);
        maxY = Math.max(maxY, it.gy + it.height);
      });
      const trimGrid = Array(maxY).fill(null).map((_, y) => Array(maxX).fill(null).map((_, x) => grid[y][x]));
      const trimPlaced = placed.map(it => it);
      return { grid: trimGrid, placed: trimPlaced, gridW: maxX, gridH: maxY };
    };

    // 尝试当前尺寸，不够就放大
    let result = tryPlace(targetW, targetH);
    let attempts = 0;
    while (!result && attempts < 10) {
      targetW++;
      targetH++;
      result = tryPlace(targetW, targetH);
      attempts++;
    }
    if (!result) {
      // 兜底：大尺寸肯定放得下
      result = tryPlace(20, 30);
    }
    return result;
  },

  startSearch(pointId) {
    const mapId = STATE.player.currentMap;
    this.currentItems = this.generatePointItems(mapId);
    const result = this.placeItemsAdaptive(this.currentItems);
    if (!result) return;
    this.grid = result.grid;
    this.placed = result.placed;
    this.gridW = result.gridW;
    this.gridH = result.gridH;
    this.renderSearchUI(pointId);
    SETTINGS.playSfx('search');
    this.revealItemsSerial();
  },

  renderSearchUI(pointId) {
    const stage = document.getElementById("ingame-stage");
    if (!stage) return;
    const gW = this.gridW;
    const gH = this.gridH;
    const cw = 100 / gW;
    const ch = 100 / gH;

    // 自适应网格渲染：绝对定位 + 百分比
    let gridHtml = `<div style="position:relative;width:100%;padding-bottom:${(gH/gW)*100}%;background:var(--bg);border-radius:4px;overflow:hidden;">`;

    for (let y = 0; y < gH; y++) {
      for (let x = 0; x < gW; x++) {
        if (this.grid[y][x] === null) {
          gridHtml += `<div style="position:absolute;left:${x*cw}%;top:${y*ch}%;width:${cw}%;height:${ch}%;border:1px solid var(--border);box-sizing:border-box;"></div>`;
        }
      }
    }

    for (const item of this.placed) {
      // 装备物品使用紫色边框，其余物品统一边框（不剧透品质/贵重）
      const isEquip = item.isEquip;
      let borderStyle = 'border:1px solid var(--border);';
      if (isEquip) borderStyle = 'border:2px solid #c084fc;box-shadow:0 0 6px #c084fc88;';
      gridHtml += `<div id="cell-${item.gx}-${item.gy}" style="position:absolute;left:${item.gx*cw}%;top:${item.gy*ch}%;width:${item.width*cw}%;height:${item.height*ch}%;${borderStyle}border-radius:2px;background:var(--panel);display:flex;align-items:center;justify-content:center;overflow:hidden;"></div>`;
    }

    gridHtml += `</div>`;
    stage.innerHTML = `
      <div style="padding:6px 8px;">
        <div style="color:var(--accent);font-weight:bold;font-size:13px;">搜索 · 点位${pointId} <span class="text-dim" style="font-size:11px;">(${gW}×${gH}容器)</span></div>
        <div id="search-status" class="text-dim" style="font-size:11px;">正在搜索...</div>
      </div>
      <div style="padding:0 8px;">${gridHtml}</div>
      <div style="padding:4px 8px;font-size:11px;" id="search-bag">储物袋：${STATE.player.storageBag.items.length}件</div>
    `;
  },

  async revealItemsSerial() {
    this.isRevealing = true;
    const byQuality = ["common", "good", "rare", "epic", "legend"];
    for (const qk of byQuality) {
      const items = this.placed.filter(p => p.quality === qk);
      for (const item of items) {
        const cell = document.getElementById(`cell-${item.gx}-${item.gy}`);
        if (!cell) continue;
        // 转圈统一金色，不剧透品质
        cell.innerHTML = `<div style="width:16px;height:16px;border:2px solid #d4a855;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;"></div>`;
        const q = CONFIG.QUALITY[qk];
        // 贵重物品天目诀：搜索揭示速度+25%
        const searchBuff = getPreciousBuffTotal('buff_search');
        const revealDelay = q.seconds * 1000 * (1 - searchBuff);
        await this.delay(revealDelay);
        // 装备物品显示属性
        const isEquip = item.isEquip;
        if (isEquip) {
          // 装备：紫色边框保留，显示属性
          const statsStr = Object.entries(item.stats).map(([k,v]) => `${k}+${v}`).join(' ');
          cell.innerHTML = `<div style="text-align:center;"><span style="color:#c084fc;font-weight:bold;font-size:${Math.min(12, 8 + item.width * 2)}px;">${item.name}</span><div style="font-size:8px;color:#c084fc;">${statsStr}</div></div>`;
          cell.style.background = "rgba(192,132,252,0.08)";
          cell.style.border = "2px solid #c084fc";
        } else {
          // 普通物品：点亮后显示品质颜色
          const preciousClass = item.isPrecious ? 'precious-shimmer precious-glow' : '';
          const preciousBadge = item.isPrecious ? '<div style="position:absolute;top:1px;right:2px;font-size:8px;color:#ffd700;z-index:2;">✦</div>' : '';
          cell.innerHTML = `<div class="${preciousClass}" style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;${item.isPrecious ? 'border-radius:2px;' : ''}"><span style="color:${q.color};font-weight:bold;font-size:${Math.min(14, 8 + item.width * 2)}px;text-align:center;">${item.name}</span>${preciousBadge}</div>`;
          cell.style.background = item.isPrecious ? "rgba(255,215,0,0.06)" : "rgba(255,255,255,0.05)";
          cell.style.border = item.isPrecious ? `2px solid ${q.color}` : `1px solid ${q.color}`;
        }
      }
    }
    this.isRevealing = false;
    this.smartFillBag();
    const statusEl = document.getElementById("search-status");
    if (statusEl) statusEl.innerHTML = `搜索完成！`;
    setTimeout(() => {
      EXPLORATION.continueAfterSearch();
    }, 1500);
  },

  delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  },

  smartFillBag() {
    const bag = STATE.player.storageBag;
    // 分离装备和普通物品
    const equipItems = [...this.placed].filter(it => it.isEquip);
    const normalItems = [...this.placed].filter(it => !it.isEquip);

    // 装备物品先处理：与当前装备比较，更好则自动替换
    equipItems.forEach(equipItem => {
      handleEquipItem(equipItem);
      SETTINGS.playSfx('find');
    });

    // 普通物品直接入袋（已取消容量限制，不再检查容量、不再做替换淘汰）
    normalItems.forEach(candidate => {
      bag.items.push(candidate);
    });

    // 更新储物袋件数显示
    const el = document.getElementById("search-bag");
    if (el) el.innerHTML = `储物袋：${bag.items.length}件`;
  }
};
