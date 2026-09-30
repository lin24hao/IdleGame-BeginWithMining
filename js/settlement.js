const SETTLEMENT = {
  selectedBagIdx: -1,   // 当前选中的储物袋物品索引（待放置）
  ringW: CONFIG.RING_W || 5,
  ringH: CONFIG.RING_H || 8,
  ringOccupancy: [],    // 二维数组：null或占用的bagIdx
  ringPlaced: [],       // [{bagIdx, gx, gy, item}]
  selectedEquipSlot: null, // 当前选中的装备槽位（待放入储物戒）

  render(container) {
    const el = container || document.getElementById("view-content");
    if (!el) return;
    this.selectedBagIdx = -1;
    this.selectedEquipSlot = null;
    this.ringW = CONFIG.RING_W || 5;
    this.ringH = CONFIG.RING_H || 8;
    this.ringOccupancy = Array(this.ringH).fill(null).map(() => Array(this.ringW).fill(null));
    this.ringPlaced = [];

    const bagItems = STATE.player.storageBag.items;
    const bagCount = bagItems.length; // 储物袋物品件数（已取消容量限制）
    const ringTotal = this.ringW * this.ringH;
    const eq = STATE.player.equipment;

    // --- 装备区域：显示3个装备槽位 ---
    let equipHtml = `<div style="display:flex;gap:6px;margin-bottom:6px;">`;
    const slotInfo = [
      { key: "weapon", icon: "⚔", label: "武器" },
      { key: "armor", icon: "🛡", label: "防具" },
      { key: "accessory", icon: "💍", label: "宝物" }
    ];
    slotInfo.forEach(si => {
      const equipped = eq[si.key];
      if (equipped) {
        const q = CONFIG.QUALITY[equipped.quality];
        const statsStr = Object.entries(equipped.stats).map(([k,v]) => `${k}+${v}`).join(' ');
        equipHtml += `
          <div id="equip-slot-${si.key}" style="flex:1;background:#2a2838;border:1px solid ${q.color};border-radius:4px;padding:6px;cursor:pointer;text-align:center;"
               onclick="SETTLEMENT.selectEquipSlot('${si.key}')" title="点击选入储物戒">
            <div style="font-size:10px;color:#8a8070;">${si.icon}${si.label}</div>
            <div style="color:${q.color};font-weight:bold;font-size:11px;">${equipped.name}</div>
            <div style="font-size:9px;color:#8a8070;">${statsStr}</div>
          </div>
        `;
      } else {
        equipHtml += `
          <div id="equip-slot-${si.key}" style="flex:1;background:#1a1d25;border:1px dashed #555;border-radius:4px;padding:6px;text-align:center;">
            <div style="font-size:10px;color:#555;">${si.icon}${si.label}</div>
            <div style="color:#555;font-size:10px;">空</div>
          </div>
        `;
      }
    });
    equipHtml += `</div>`;

    // --- 储物袋：item-chip 列表，点击选中 ---
    let bagHtml = '';
    if (bagItems.length === 0) {
      bagHtml = `<div class="text-dim" style="font-style:italic;">无物品</div>`;
    } else {
      bagHtml = `<div id="bag-chips" style="display:flex;flex-wrap:wrap;gap:6px;">`;
      bagItems.forEach((it, i) => {
        const q = CONFIG.QUALITY[it.quality];
        const sel = this.selectedBagIdx === i ? ' style="border-color:#e0c060;background:#3a3520;box-shadow:0 0 12px #e0c06044;color:#ffe8a0;"' : '';
        const isEquip = it.isEquip;
        const extraStyle = isEquip ? 'border-style:solid;border-width:2px;' : '';
        bagHtml += `
          <div class="bag-chip" data-i="${i}" onclick="SETTLEMENT.selectBagItem(${i})"
               style="background:#2a3028;border:1px solid ${q.color};${extraStyle}border-radius:4px;padding:5px 8px;cursor:pointer;font-size:11px;transition:all .15s;">
            <span style="color:${q.color};font-weight:bold;">${it.name}</span>
            ${isEquip ? '<span style="color:#c084fc;font-size:9px;margin-left:2px;">[装]</span>' : ''}
            <span style="color:#8a8070;font-size:10px;margin-left:4px;">${it.width}×${it.height}</span>
            <span style="color:#c9a96e;font-size:10px;margin-left:4px;">💰${it.baseValue.toLocaleString()}</span>
          </div>
        `;
      });
      bagHtml += `</div>`;
    }

    el.innerHTML = `
      <div class="panel">
        <h2 style="color:var(--accent);margin-bottom:4px;font-size:14px;">📦 撤离 · 整理收获</h2>
        <div style="font-size:11px;color:#8a8070;">
          点击储物袋物品选中 → 点击储物戒空格放置；点击储物戒中物品移回；点击装备可放入储物戒
        </div>
      </div>
      <div class="panel">
        <h3 style="color:var(--accent);font-size:12px;margin-bottom:6px;">
          ⚔ 当前装备
        </h3>
        ${equipHtml}
      </div>
      <div class="panel">
        <h3 style="color:var(--accent);font-size:12px;margin-bottom:6px;">
          🎒 储物袋（局内）<span style="color:#8a8070;font-size:11px;font-weight:normal;">${bagCount}件</span>
        </h3>
        ${bagHtml}
      </div>
      <div class="panel">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <h3 style="color:var(--accent);font-size:12px;">
            💍 储物戒（带出）<span id="ring-used-text" style="color:#8a8070;font-size:11px;font-weight:normal;">已用0/${ringTotal}</span>
          </h3>
          <div>
            <button class="btn" style="padding:3px 6px;font-size:11px;" onclick="SETTLEMENT.autoSelect()">自动选取</button>
            <button class="btn" style="padding:3px 6px;font-size:11px;" onclick="SETTLEMENT.clearRing()">清空</button>
          </div>
        </div>
        <div id="ring-grid"></div>
      </div>
      <button class="btn" style="width:100%;" onclick="SETTLEMENT.confirm()">✅ 确认带出（剩余自动清空）</button>
    `;

    this.renderRingGrid();
  },

  // 选中装备槽位（放入储物戒）
  selectEquipSlot(slot) {
    const eq = STATE.player.equipment;
    const equipped = eq[slot];
    if (!equipped) return;
    // 取消选中储物袋物品
    this.selectedBagIdx = -1;
    if (this.selectedEquipSlot === slot) {
      this.selectedEquipSlot = null;
    } else {
      this.selectedEquipSlot = slot;
    }
    this.updateBagChipsStyle();
    this.renderRingGrid();
    // 高亮装备槽位
    this.updateEquipSlotStyle();
  },

  updateEquipSlotStyle() {
    const slotInfo = ["weapon", "armor", "accessory"];
    slotInfo.forEach(key => {
      const el = document.getElementById(`equip-slot-${key}`);
      if (!el) return;
      if (this.selectedEquipSlot === key) {
        el.style.boxShadow = "0 0 12px #e0c06044";
        el.style.borderColor = "#e0c060";
      } else {
        const eq = STATE.player.equipment[key];
        if (eq) {
          const q = CONFIG.QUALITY[eq.quality];
          el.style.borderColor = q.color;
        }
        el.style.boxShadow = "none";
      }
    });
  },

  // 选中储物袋物品
  selectBagItem(idx) {
    // 检查该物品是否已放入戒中
    const inRing = this.ringPlaced.find(r => r.bagIdx === idx);
    if (inRing) return; // 已放的不能再选
    this.selectedEquipSlot = null;
    this.selectedBagIdx = (this.selectedBagIdx === idx) ? -1 : idx;
    this.updateBagChipsStyle();
    this.updateEquipSlotStyle();
    this.renderRingGrid();
  },

  updateBagChipsStyle() {
    const chips = document.querySelectorAll(".bag-chip");
    chips.forEach(chip => {
      const i = parseInt(chip.dataset.i);
      const item = STATE.player.storageBag.items[i];
      if (!item) return;
      const q = CONFIG.QUALITY[item.quality];
      const inRing = this.ringPlaced.find(r => r.bagIdx === i);
      if (inRing) {
        chip.style.opacity = "0.3";
        chip.style.textDecoration = "line-through";
        chip.style.pointerEvents = "none";
        chip.style.borderColor = "#555";
      } else if (this.selectedBagIdx === i) {
        chip.style.borderColor = "#e0c060";
        chip.style.background = "#3a3520";
        chip.style.color = "#ffe8a0";
        chip.style.boxShadow = "0 0 12px #e0c06044";
        chip.style.opacity = "1";
        chip.style.textDecoration = "none";
        chip.style.pointerEvents = "auto";
      } else {
        chip.style.borderColor = q.color;
        chip.style.background = "#2a3028";
        chip.style.color = "inherit";
        chip.style.boxShadow = "none";
        chip.style.opacity = "1";
        chip.style.textDecoration = "none";
        chip.style.pointerEvents = "auto";
      }
    });
  },

  // 渲染储物戒：分离预览层
  renderRingGrid() {
    const container = document.getElementById("ring-grid");
    if (!container) return;
    const w = this.ringW, h = this.ringH;
    // 装备物品：选中装备槽时预览1x1
    const selEquip = this.selectedEquipSlot ? STATE.player.equipment[this.selectedEquipSlot] : null;
    const selItem = this.selectedBagIdx >= 0 ? STATE.player.storageBag.items[this.selectedBagIdx] : null;
    const previewItem = selItem || selEquip;
    const cw = 100 / w;
    this._previewX = undefined;
    this._previewY = undefined;

    let html = `<div id="ring-board" style="position:relative;width:100%;padding-bottom:${(h/w)*100}%;background:#0f1218;border-radius:4px;overflow:hidden;border:2px solid #2a2a2a;">`;

    // 空格子
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const isOccupied = this.ringOccupancy[y][x] !== null;
        if (!isOccupied) {
          html += `<div class="ring-cell" data-x="${x}" data-y="${y}"
             style="position:absolute;left:${x*cw}%;top:${y*(100/h)}%;width:${cw}%;height:${100/h}%;border:1px solid #1a1d25;background:#1a1d25;box-sizing:border-box;cursor:${previewItem ? 'pointer':'default'};"></div>`;
        }
      }
    }

    // 已放置物品
    for (const r of this.ringPlaced) {
      const q = CONFIG.QUALITY[r.item.quality];
      const isEquip = r.item.isEquip;
      const borderStyle = isEquip ? 'border:2px solid #c084fc;' : `border:1px solid ${q.color};`;
      html += `<div class="ring-item" data-bag="${r.bagIdx}"
        style="position:absolute;left:${r.gx*cw}%;top:${r.gy*(100/h)}%;width:${r.item.width*cw}%;height:${r.item.height*(100/h)}%;background:${isEquip ? '#2a2838' : '#4a6040'};${borderStyle}border-radius:2px;display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;z-index:2;box-shadow:${isEquip ? 'inset 0 0 8px #c084fc44' : 'inset 0 0 8px #7a9a6a44'};"
        title="点击移回储物袋">
        <span style="color:${isEquip ? '#c084fc' : q.color};font-weight:bold;font-size:${Math.min(12, 7 + r.item.width * 2)}px;text-align:center;">${r.item.name}</span>
      </div>`;
    }

    // 预览层
    html += `<div id="ring-preview" style="display:none;pointer-events:none;position:absolute;background:rgba(58,90,58,0.33);border:2px solid #6aaa6a;border-radius:2px;z-index:3;"></div>`;

    html += `</div>`;
    container.innerHTML = html;

    // 事件委托
    const board = document.getElementById("ring-board");
    if (!board) return;

    // 空格子hover+click
    container.querySelectorAll(".ring-cell").forEach(cell => {
      const x = parseInt(cell.dataset.x);
      const y = parseInt(cell.dataset.y);
      cell.addEventListener("mouseenter", () => this.preview(x, y));
      cell.addEventListener("mouseleave", () => this.clearPreview());
      cell.addEventListener("click", () => this.placeAt(x, y));
    });

    // 物品移除
    container.querySelectorAll(".ring-item").forEach(item => {
      const bagIdx = parseInt(item.dataset.bag);
      item.addEventListener("click", () => this.removeFromRing(bagIdx));
    });
  },

  preview(x, y) {
    const selEquip = this.selectedEquipSlot ? STATE.player.equipment[this.selectedEquipSlot] : null;
    const selItem = this.selectedBagIdx >= 0 ? STATE.player.storageBag.items[this.selectedBagIdx] : null;
    const item = selItem || selEquip;
    if (!item) { this.clearPreview(); return; }
    const w = this.ringW, h = this.ringH;
    const cw = 100 / w;
    const pv = document.getElementById("ring-preview");
    if (!pv) return;
    // 装备物品固定1x1
    const pw = item.isEquip ? 1 : item.width;
    const ph = item.isEquip ? 1 : item.height;
    const ok = this.canPlaceAtEquip(item, x, y);
    pv.style.display = "block";
    pv.style.left = (x * cw) + "%";
    pv.style.top = (y * (100 / h)) + "%";
    pv.style.width = (pw * cw) + "%";
    pv.style.height = (ph * (100 / h)) + "%";
    pv.style.background = ok ? "rgba(58,90,58,0.33)" : "rgba(90,42,42,0.33)";
    pv.style.borderColor = ok ? "#6aaa6a" : "#8a4a4a";
  },
  clearPreview() {
    const pv = document.getElementById("ring-preview");
    if (pv) pv.style.display = "none";
  },

  canPlaceAtEquip(item, x, y) {
    const pw = item.isEquip ? 1 : item.width;
    const ph = item.isEquip ? 1 : item.height;
    if (x + pw > this.ringW || y + ph > this.ringH) return false;
    for (let dy = 0; dy < ph; dy++) {
      for (let dx = 0; dx < pw; dx++) {
        if (this.ringOccupancy[y + dy][x + dx] !== null) return false;
      }
    }
    return true;
  },

  canPlaceAt(item, x, y) {
    return this.canPlaceAtEquip(item, x, y);
  },

  placeAt(x, y) {
    // 优先处理装备槽位
    if (this.selectedEquipSlot) {
      const slot = this.selectedEquipSlot;
      const equipped = STATE.player.equipment[slot];
      if (!equipped) { this.selectedEquipSlot = null; return; }
      // 装备占1格
      if (!this.canPlaceAtEquip(equipped, x, y)) return;
      // 用特殊bagIdx标记装备物品：-1=weapon, -2=armor, -3=accessory
      const equipBagIdx = -(slotInfo.indexOf(slot) + 1);
      for (let dy = 0; dy < 1; dy++) {
        for (let dx = 0; dx < 1; dx++) {
          this.ringOccupancy[y + dy][x + dx] = equipBagIdx;
        }
      }
      const equipItem = {...equipped, uid: Date.now() + Math.random(), isEquip: true, width: 1, height: 1};
      this.ringPlaced.push({ bagIdx: equipBagIdx, gx: x, gy: y, item: equipItem, equipSlot: slot });
      // 从装备槽位移除
      STATE.player.equipment[slot] = null;
      this.selectedEquipSlot = null;
      this.updateInfoAndChips();
      return;
    }

    if (this.selectedBagIdx < 0) return;
    const item = STATE.player.storageBag.items[this.selectedBagIdx];
    if (!item) return;
    if (!this.canPlaceAtEquip(item, x, y)) return;
    // 放置
    for (let dy = 0; dy < item.height; dy++) {
      for (let dx = 0; dx < item.width; dx++) {
        this.ringOccupancy[y + dy][x + dx] = this.selectedBagIdx;
      }
    }
    this.ringPlaced.push({ bagIdx: this.selectedBagIdx, gx: x, gy: y, item });
    this.selectedBagIdx = -1;
    this.updateInfoAndChips();
  },

  removeFromRing(bagIdx) {
    const r = this.ringPlaced.find(r => r.bagIdx === bagIdx);
    if (!r) return;
    // 如果是装备物品
    if (r.equipSlot) {
      // 放回装备槽位
      STATE.player.equipment[r.equipSlot] = r.item;
    }
    const item = r.item;
    const pw = item.isEquip ? 1 : item.width;
    const ph = item.isEquip ? 1 : item.height;
    for (let dy = 0; dy < ph; dy++) {
      for (let dx = 0; dx < pw; dx++) {
        this.ringOccupancy[r.gy + dy][r.gx + dx] = null;
      }
    }
    this.ringPlaced = this.ringPlaced.filter(x => x.bagIdx !== bagIdx);
    this.updateInfoAndChips();
  },

  updateInfoAndChips() {
    const used = this.ringPlaced.reduce((s, r) => {
      const pw = r.item.isEquip ? 1 : r.item.width;
      const ph = r.item.isEquip ? 1 : r.item.height;
      return s + pw * ph;
    }, 0);
    const total = this.ringW * this.ringH;
    const t = document.getElementById("ring-used-text");
    if (t) t.textContent = `已用${used}/${total}`;
    this.updateBagChipsStyle();
    this.updateEquipSlotStyle();
    this.renderRingGrid();
  },

  autoSelect() {
    const bagItems = STATE.player.storageBag.items;
    const sorted = bagItems.map((it, idx) => ({ it, idx })
    ).sort((a, b) => (b.it.baseValue / (b.it.width * b.it.height)) - (a.it.baseValue / (a.it.width * a.it.height)));

    for (const { it, idx } of sorted) {
      if (this.ringPlaced.find(r => r.bagIdx === idx)) continue;
      // 找一个能放的位置
      let placed = false;
      for (let y = 0; y < this.ringH && !placed; y++) {
        for (let x = 0; x < this.ringW && !placed; x++) {
          if (this.canPlaceAtEquip(it, x, y)) {
            for (let dy = 0; dy < it.height; dy++) {
              for (let dx = 0; dx < it.width; dx++) {
                this.ringOccupancy[y + dy][x + dx] = idx;
              }
            }
            this.ringPlaced.push({ bagIdx: idx, gx: x, gy: y, item: it });
            placed = true;
          }
        }
      }
    }

    // 自动选取装备：遍历装备槽，尝试放入储物戒
    const slotInfo = ["weapon", "armor", "accessory"];
    slotInfo.forEach(slot => {
      const equipped = STATE.player.equipment[slot];
      if (!equipped) return;
      for (let y = 0; y < this.ringH; y++) {
        for (let x = 0; x < this.ringW; x++) {
          if (this.ringOccupancy[y][x] === null) {
            const equipBagIdx = -(slotInfo.indexOf(slot) + 1);
            this.ringOccupancy[y][x] = equipBagIdx;
            const equipItem = {...equipped, uid: Date.now() + Math.random(), isEquip: true, width: 1, height: 1};
            this.ringPlaced.push({ bagIdx: equipBagIdx, gx: x, gy: y, item: equipItem, equipSlot: slot });
            STATE.player.equipment[slot] = null;
            return;
          }
        }
      }
    });

    this.selectedBagIdx = -1;
    this.selectedEquipSlot = null;
    this.updateInfoAndChips();
  },

  clearRing() {
    this.ringOccupancy = Array(this.ringH).fill(null).map(() => Array(this.ringW).fill(null));
    // 装备物品放回装备槽
    this.ringPlaced.forEach(r => {
      if (r.equipSlot) {
        STATE.player.equipment[r.equipSlot] = r.item;
      }
    });
    this.ringPlaced = [];
    this.selectedBagIdx = -1;
    this.selectedEquipSlot = null;
    this.updateInfoAndChips();
  },

  confirm() {
    // 1. 储物戒物品转入仓库，贵重物品自动贡献到藏宝阁
    this.ringPlaced.forEach(r => {
      // 贵重物品自动贡献到藏宝阁收集
      if (r.item.isPrecious && r.item.preciousId) {
        const pc = STATE.player.preciousCollection;
        pc[r.item.preciousId] = (pc[r.item.preciousId] || 0) + 1;
      }
      if (!r.equipSlot) {
        // 普通物品入仓库
        STATE.player.warehouse.push(r.item);
      }
      // 装备物品也入仓库（作为特殊物品）
      if (r.equipSlot) {
        STATE.player.warehouse.push(r.item);
      }
    });

    // 2. 身上装备自动结算为灵石
    let equipValue = 0;
    ["weapon","armor","accessory"].forEach(slot => {
      if (STATE.player.equipment[slot]) equipValue += STATE.player.equipment[slot].baseValue;
    });
    STATE.player.spiritStones += equipValue;
    STATE.player.equipment = { weapon: null, armor: null, accessory: null };

    // 3. 储物袋未选物品清空
    STATE.player.storageBag.items = [];

    // 4. 回到洞府
    MAIN.currentView = "cave";
    MAIN.render();
  }
};

// 装备槽位名称映射（用于placeAt中的bagIdx计算）
const slotInfo = ["weapon", "armor", "accessory"];
