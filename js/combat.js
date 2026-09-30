const COMBAT = {
  enemy: null,
  playerHp: 0,
  playerMaxHp: 0,
  enemyPower: 0,
  playerPower: 0,
  inCombat: false,
  // 玩家战斗属性快照
  pAtk: 0, pDef: 0, pSpd: 0,
  pCrit: 0, pCritDmg: 0, pDodge: 0, pBlock: 0, pCombo: 0,

  start(type) {
    const mapId = STATE.player.currentMap;
    const map = CONFIG.MAPS.find(m => m.id === mapId);
    // 怪物战力在地图区间内随机
    const powerRange = map.powerMax - map.powerMin;
    const enemyPower = Math.floor(map.powerMin + Math.random() * powerRange);
    this.enemyPower = enemyPower;
    this.playerPower = CULTIVATION.getPlayerPower();

    const p = STATE.player;
    const a = p.attrs;
    const A = CONFIG.ATTRIBUTES;
    const realmLayer = p.currentRealm * 9 + p.currentLayer;
    // 玩家属性 = 基础(境界) + 属性点加成
    this.pAtk = a.atk * A.atk.perPoint + realmLayer * 2 + 10;
    this.pDef = a.def * A.def.perPoint + realmLayer;
    this.playerMaxHp = a.hp * A.hp.perPoint + realmLayer * 100 + 100;
    this.playerHp = this.playerMaxHp;
    this.pSpd = a.spd * A.spd.perPoint;
    this.pCrit = a.crit * A.crit.perPoint;            // %
    this.pCritDmg = 150 + a.critDmg * A.critDmg.perPoint; // %
    this.pDodge = a.dodge * A.dodge.perPoint;
    this.pBlock = a.block * A.block.perPoint;
    this.pCombo = a.combo * A.combo.perPoint;

    // 叠加装备加成
    const eq = p.equipment;
    const applyEquipStats = (equip) => {
      if (!equip || !equip.stats) return;
      Object.entries(equip.stats).forEach(([k, v]) => {
        const key = k.charAt(0).toUpperCase() + k.slice(1);
        const propName = 'p' + key;
        if (propName === 'pHp') {
          // hp加成同时加到maxHp和当前Hp
          this.playerMaxHp += v;
          this.playerHp += v;
        } else if (this[propName] !== undefined) {
          this[propName] += v;
        }
      });
    };
    if (eq.weapon) applyEquipStats(eq.weapon);
    if (eq.armor) applyEquipStats(eq.armor);
    if (eq.accessory) applyEquipStats(eq.accessory);

    // 贵重物品法宝加成 + 功法属性加成
    const pc = STATE.player.preciousCollection || {};
    const preciousItems = CONFIG.PRECIOUS_ITEMS || [];
    const isUnlocked = (id) => (pc[id] || 0) >= (preciousItems.find(p => p.id === id)?.requiredCount || 999);

    // 混沌心法：所有属性+10%
    if (isPreciousUnlocked('gf_hundun')) {
      const buff = CONFIG.PRECIOUS_ITEMS.find(p => p.id === 'gf_hundun').effectValue;
      this.pAtk *= (1 + buff);
      this.pDef *= (1 + buff);
      this.playerMaxHp = Math.floor(this.playerMaxHp * (1 + buff));
      this.playerHp = this.playerMaxHp;
      this.pSpd *= (1 + buff);
      this.pCrit += buff * 100;
      this.pCritDmg += buff * 100;
      this.pDodge += buff * 100;
      this.pBlock += buff * 100;
      this.pCombo += buff * 100;
    }

    preciousItems.forEach(pi => {
      if (!isUnlocked(pi.id)) return;
      if (pi.category !== 'fabao') return;
      switch (pi.effectType) {
        case 'buff_atk':
          this.pAtk *= (1 + pi.effectValue);
          break;
        case 'buff_def_block':
          this.pDef *= (1 + pi.effectValue);
          this.pBlock += (pi.effectValue2 || 0) * 100;
          break;
        case 'buff_hp':
          this.playerMaxHp = Math.floor(this.playerMaxHp * (1 + pi.effectValue));
          this.playerHp = this.playerMaxHp;
          break;
        case 'buff_spd':
          this.pSpd *= (1 + pi.effectValue);
          break;
        case 'buff_crit':
          this.pCrit += pi.effectValue * 100;
          this.pCritDmg += (pi.effectValue2 || 0) * 100;
          break;
        case 'buff_all_combat':
          this.pAtk *= (1 + pi.effectValue);
          this.pDef *= (1 + pi.effectValue);
          this.playerMaxHp = Math.floor(this.playerMaxHp * (1 + pi.effectValue));
          this.playerHp = this.playerMaxHp;
          this.pSpd *= (1 + pi.effectValue);
          this.pCrit += pi.effectValue * 100;
          this.pCritDmg += pi.effectValue * 100;
          this.pDodge += pi.effectValue * 100;
          this.pBlock += pi.effectValue * 100;
          this.pCombo += pi.effectValue * 100;
          break;
      }
    });

    // 怪物从战力转属性
    const enemyHp = Math.max(20, Math.floor(enemyPower * 1.2));
    const enemyAtk = Math.max(3, Math.floor(enemyPower * 0.1));
    const enemyDef = Math.max(1, Math.floor(enemyPower * 0.03));
    const enemyCrit = Math.min(30, enemyPower * 0.005);
    const enemyDodge = Math.min(20, enemyPower * 0.003);

    // 按地图境界取怪物名
    const realm = map.realm;
    const pool = type === "monster" ? CONFIG.MONSTER_NAMES[realm] : CONFIG.ROGUE_NAMES[realm];
    const name = pool[Math.floor(Math.random() * pool.length)];

    this.enemy = {
      name: name,
      hp: enemyHp,
      maxHp: enemyHp,
      attack: enemyAtk,
      defense: enemyDef,
      crit: enemyCrit,
      dodge: enemyDodge,
    };
    this.inCombat = true;

    const ratio = enemyPower / Math.max(1, this.playerPower);
    let diffText = "";
    if (ratio < 0.5) diffText = "（不堪一击）";
    else if (ratio < 0.8) diffText = "（较弱）";
    else if (ratio < 1.2) diffText = "（势均力敌）";
    else if (ratio < 1.8) diffText = "（略强）";
    else diffText = "（极度危险）";

    EXPLORATION.log(`⚔️ 遭遇${type === "monster" ? "妖兽" : "散修"}：${this.enemy.name} 战力${Math.round(enemyPower)}${diffText}`, "#ef4444");
    EXPLORATION.log(`  你战力：${Math.round(this.playerPower)} · 攻${Math.round(this.pAtk)} · 防${Math.round(this.pDef)} · 血${this.playerMaxHp}`, "var(--text-dim)");
    this.render();
    this.combatLoop();
  },

  render() {
    const stage = document.getElementById("ingame-stage");
    if (!stage) return;
    // 装备加成后的总属性显示
    const eq = STATE.player.equipment;
    const eqBonus = { atk:0, def:0, hp:0 };
    const sumEqBonus = (equip) => {
      if (!equip || !equip.stats) return;
      Object.entries(equip.stats).forEach(([k, v]) => {
        if (eqBonus[k] !== undefined) eqBonus[k] += v;
      });
    };
    if (eq.weapon) sumEqBonus(eq.weapon);
    if (eq.armor) sumEqBonus(eq.armor);
    if (eq.accessory) sumEqBonus(eq.accessory);
    const atkStr = Math.round(this.pAtk) + (eqBonus.atk > 0 ? `(+${eqBonus.atk})` : '');
    const defStr = Math.round(this.pDef) + (eqBonus.def > 0 ? `(+${eqBonus.def})` : '');

    stage.innerHTML = `
      <div style="padding:12px 8px;">
        <div style="text-align:center;color:var(--accent);font-weight:bold;margin-bottom:12px;font-size:15px;">⚔️ 遭遇战</div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
          <div>
            <div style="font-weight:bold;font-size:13px;">你</div>
            <div class="text-dim" style="font-size:11px;">${CULTIVATION.getRealmName()}</div>
            <div style="font-size:10px;color:var(--accent);margin-top:2px;">战力${Math.round(this.playerPower)}</div>
            <div style="font-size:10px;color:var(--text-dim);margin-top:1px;">攻${atkStr} 防${defStr}</div>
            <div style="font-size:10px;color:#4ade80;margin-top:1px;" id="player-hp-text">${this.playerHp}/${this.playerMaxHp}</div>
            <div id="player-hp-bar" style="width:130px;height:6px;background:var(--border);border-radius:3px;overflow:hidden;margin-top:2px;">
              <div style="width:100%;height:100%;background:#4ade80;"></div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:bold;color:#ef4444;font-size:13px;">${this.enemy.name}</div>
            <div class="text-dim" style="font-size:11px;">${this.enemy.maxHp}HP / 攻${this.enemy.attack}</div>
            <div style="font-size:10px;color:#ef4444;margin-top:2px;">战力${Math.round(this.enemyPower)}</div>
            <div style="font-size:10px;color:#ef4444;margin-top:1px;" id="enemy-hp-text">${this.enemy.hp}/${this.enemy.maxHp}</div>
            <div id="enemy-hp-bar" style="width:130px;height:6px;background:var(--border);border-radius:3px;overflow:hidden;margin-left:auto;margin-top:2px;">
              <div style="width:100%;height:100%;background:#ef4444;"></div>
            </div>
          </div>
        </div>
        <div class="text-dim" style="font-size:10px;text-align:center;">自动战斗进行中...</div>
      </div>
    `;
  },

  combatLoop() {
    if (!this.inCombat) return;
    setTimeout(() => this.playerTurn(), 700);
  },

  // 玩家单次伤害结算（含暴击）
  calcPlayerDamage() {
    let dmg = Math.max(1, this.pAtk - this.enemy.defense);
    const isCrit = Math.random() * 100 < this.pCrit;
    if (isCrit) dmg = Math.floor(dmg * this.pCritDmg / 100);
    dmg = Math.floor(dmg * (0.9 + Math.random() * 0.2));
    return { dmg: Math.max(1, dmg), crit: isCrit };
  },

  playerTurn() {
    if (!this.inCombat) return;
    const r = this.calcPlayerDamage();
    this.enemy.hp -= r.dmg;
    EXPLORATION.log(`你对${this.enemy.name}造成${r.dmg}伤害${r.crit ? ' 💥暴击！' : ''}`, r.crit ? "#fbbf24" : "#4ade80");
    // 贵重物品功法战斗技能
    const pc = STATE.player.preciousCollection || {};
    const preciousItems = CONFIG.PRECIOUS_ITEMS || [];
    const isUnlocked = (id) => (pc[id] || 0) >= (preciousItems.find(p => p.id === id)?.requiredCount || 999);

    // 玄天剑诀：30%概率额外造成攻击力50%伤害
    if (isUnlocked('gf_xuantian') && Math.random() < 0.30 && this.enemy.hp > 0) {
      const skillDmg = Math.floor(this.pAtk * 0.50);
      this.enemy.hp -= skillDmg;
      EXPLORATION.log(`🗡 玄天剑诀！额外造成${skillDmg}伤害`, "#c084fc");
    }
    // 破军剑诀：连击时额外造成攻击力100%伤害（连击后面再触发）

    // 连击
    if (Math.random() * 100 < this.pCombo && this.enemy.hp > 0) {
      const r2 = this.calcPlayerDamage();
      this.enemy.hp -= r2.dmg;
      let comboMsg = `↻ 连击！再造成${r2.dmg}伤害${r2.crit ? ' 💥暴击！' : ''}`;
      // 破军剑诀：连击时额外造成攻击力100%伤害
      if (isUnlocked('gf_pojun')) {
        const pojunDmg = Math.floor(this.pAtk * 1.00);
        this.enemy.hp -= pojunDmg;
        comboMsg += ` 🗡破军剑诀+${pojunDmg}`;
      }
      EXPLORATION.log(comboMsg, r2.crit ? "#fbbf24" : "#4ade80");
    }
    this.updateHp();
    if (this.enemy.hp <= 0) { this.win(); return; }
    setTimeout(() => this.enemyTurn(), 700);
  },

  enemyTurn() {
    if (!this.inCombat) return;
    // 玩家闪避
    if (Math.random() * 100 < this.pDodge) {
      EXPLORATION.log("↪ 你闪避了攻击！", "#60a5fa");
      this.updateHp();
      this.combatLoop();
      return;
    }
    let dmg = Math.max(1, this.enemy.attack - this.pDef);
    // 怪物暴击
    const isCrit = Math.random() * 100 < this.enemy.crit;
    if (isCrit) dmg = Math.floor(dmg * 1.5);
    // 格挡减半
    const isBlock = Math.random() * 100 < this.pBlock;
    if (isBlock) dmg = Math.floor(dmg / 2);
    this.playerHp -= dmg;
    let msg = `${this.enemy.name}对你造成${dmg}伤害`;
    if (isCrit) msg += ' 💥暴击';
    if (isBlock) msg += ' ▮格挡';
    EXPLORATION.log(msg, "#ef4444");
    this.updateHp();
    if (this.playerHp <= 0) { this.lose(); return; }
    this.combatLoop();
  },

  updateHp() {
    const ePct = Math.max(0, this.enemy.hp / this.enemy.maxHp * 100);
    const eBar = document.querySelector("#enemy-hp-bar > div");
    if (eBar) eBar.style.width = ePct + "%";
    const eText = document.getElementById("enemy-hp-text");
    if (eText) eText.textContent = `${Math.max(0,this.enemy.hp)}/${this.enemy.maxHp}`;

    const pPct = Math.max(0, this.playerHp / this.playerMaxHp * 100);
    const pBar = document.querySelector("#player-hp-bar > div");
    if (pBar) pBar.style.width = pPct + "%";
    const pText = document.getElementById("player-hp-text");
    if (pText) pText.textContent = `${Math.max(0,this.playerHp)}/${this.playerMaxHp}`;
  },

  win() {
    this.inCombat = false;
    EXPLORATION.log("🏆 战斗胜利！", "var(--accent)");
    const loot = SEARCH.generateRandomItem(STATE.player.currentMap);
    if (loot) {
      STATE.player.storageBag.items.push(loot);
      EXPLORATION.log(`战利品：${loot.name}`, "var(--q-legend)");
    }
    setTimeout(() => EXPLORATION.continueAfterCombat(), 1200);
  },

  // 战败改造：丢失所有装备，进入撤离整理界面
  lose() {
    this.inCombat = false;
    EXPLORATION.log("💀 战败！丢失身上装备...", "#ef4444");
    // 丢失所有装备
    STATE.player.equipment = { weapon: null, armor: null, accessory: null };
    // 立即进入撤离整理界面
    setTimeout(() => {
      MAIN.currentView = "settlement";
      MAIN.render();
    }, 1500);
  }
};
