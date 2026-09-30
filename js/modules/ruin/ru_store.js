/* ============================================================
 * ru_store.js —— 「秘境（ruin）」store（state / getters / actions）
 *
 * 依据《搜打撤-秘境玩法策划案.md》：
 *   - 只有「派遣 → 等待归来」两阶段，无局内概念、无过程呈现
 *   - 背包 / 安全箱均为列表制；物品重量为独立字段
 *   - 安全箱初始 2 位、无品质门禁、派遣期间即时择优
 *   - 神器：碎片自动解锁 → 升级；满级溢出碎片转灵石
 *
 * 约定：
 *   - getters 形如 (state, getters) => value | (args) => value，可直接用
 *     RU_DATA / RU_TEXT / RU_CUR / RU_STAT 等本模块全局（纯自闭环）。
 *   - actions 形如 (ctx, payload) => result，ctx 由 RU_RT.ctx() 提供。
 *   - 派遣结果由 RU_SIM 一次性算完并存入 state.running[].plan，
 *     tick 只推进时间戳 —— 离线与在线口径完全一致。
 * ============================================================ */
const RU_STORE = {

  /* ==========================================================
   * 1. state
   * ========================================================== */
  state: {
    /* --- 子系统挂载点（RU_RT.init 绑定） --- */
    stat: {}, unlock: {}, currencyVals: {}, upgradeLevels: {}, system: {},
    /* --- 模块内单调时钟（秒），由 RU_RT.tick 推进 --- */
    now: 0,
    /* --- 弟子运行时 --- */
    disciple: {},          // { id: {level, status, permPower, deaths} }
    loadout: {},           // { id: [artifactId] } 神器栏（仅战斗神器）
    /* --- 派遣 --- */
    running: [],           // [{ id, discipleId, ruinId, startAt, endAt, plan, cfg }]
    returned: [],          // 同上 + 已到期待收
    seq: 0,                // 派遣流水号
    /* --- 资产 --- */
    bag: [],               // 仓库（列表）：[{ itemId, qty }]
    artifact: {},          // { artifactId: { frags, level, unlocked } }
    /* --- 收集 --- */
    codex: { ruin: {}, item: {}, clue: {} },
    /* --- 预设与历史 --- */
    presets: {},           // { discipleId: { ruinId, durationSec, artifactIds, retreat } }
    history: []            // 最近 20 次派遣摘要
  },

  /* 由 RU_DATA 生成一份全新的 state（供新档 / 缺字段补全） */
  defaults() {
    const P = RU_DATA.PLACEHOLDER;
    const st = {
      stat: {}, unlock: {}, currencyVals: {}, upgradeLevels: {}, system: {},
      now: 0, disciple: {}, loadout: {}, running: [], returned: [], seq: 0,
      bag: [], artifact: {}, codex: { ruin: {}, item: {}, clue: {} },
      presets: {}, history: []
    };
    RU_DATA.DISCIPLE_IDS.forEach(id => {
      st.disciple[id] = { level: 1, status: 'idle', permPower: 0, deaths: 0 };
      st.loadout[id] = [];
      st.presets[id] = { ruinId: 1, durationSec: 3600, artifactIds: [], retreat: [{ type: 'none', value: 0 }] };
    });
    RU_DATA.ARTIFACTS.forEach(a => { st.artifact[a.id] = { frags: 0, level: 0, unlocked: false }; });
    void P;
    return st;
  },

  /* ==========================================================
   * 2. getters
   * ========================================================== */
  getters: {
    /* ---------- 基础：弟子等级 / 称号 / 战力 / 负重 ---------- */
    level: (state) => (id) => (state.disciple[id] || {}).level || 1,
    realmName: (state) => (id) => RU_DATA.discipleRealm((state.disciple[id] || {}).level || 1),

    /* 被动神器效果累加（全局生效，不占栏位） */
    passiveSum: (state) => (key) => {
      let sum = 0;
      Object.keys(state.artifact).forEach(id => {
        const own = state.artifact[id];
        const a = RU_DATA.artifactById(id);
        if (!a || a.slotType !== 'passive' || !own || !own.unlocked || own.level <= 0) return;
        const fn = a.effect && a.effect[key];
        if (typeof fn === 'function') { try { sum += fn(own.level) || 0; } catch (e) { /* ignore */ } }
      });
      return sum;
    },

    artifactSlots: (state, g) => Math.round(RU_DATA.PLACEHOLDER.ARTIFACT_BASE_SLOTS + g.passiveSum('artifactSlots')),
    safeBoxSlots: (state, g) => Math.round(RU_DATA.PLACEHOLDER.SAFEBOX_BASE_SLOTS + g.passiveSum('safeBoxSlots')),
    dispatchLimit: (state, g) => Math.round(RU_DATA.PLACEHOLDER.DISPATCH_BASE_LIMIT + g.passiveSum('dispatchLimit')),

    /* 战斗神器加成合计（按是否装入某弟子的神器栏） */
    combatSum: (state) => (discipleId, key) => {
      const list = (state.loadout[discipleId] || []);
      let sum = 0;
      list.forEach(id => {
        const own = state.artifact[id];
        const a = RU_DATA.artifactById(id);
        if (!a || a.slotType !== 'combat' || !own || !own.unlocked || own.level <= 0) return;
        const fn = a.effect && a.effect[key];
        if (typeof fn === 'function') { try { sum += fn(own.level) || 0; } catch (e) { /* ignore */ } }
      });
      return sum;
    },
    /* 指定弟子是否带「阵亡豁免」神器 */
    combatWard: (state, g) => (id) => g.combatSum(id, 'deathWard') >= 1,

    /* 弟子战力：基础 × 等级缩放 + 永久成长，再乘战斗神器加成 */
    disciplePower: (state, g) => (id) => {
      const d = RU_DATA.discipleById(id);
      if (!d) return 0;
      const P = RU_DATA.PLACEHOLDER;
      const lvl = g.level(id);
      const perm = (state.disciple[id] || {}).permPower || 0;
      const base = d.basePower * (1 + P.DISCIPLE_POWER_PER_LEVEL * (lvl - 1)) + perm;
      return base * (1 + g.combatSum(id, 'power'));
    },
    /* 弟子负重上限：基础 × 等级缩放 + 被动神器加成 */
    weightCap: (state, g) => (id) => {
      const d = RU_DATA.discipleById(id);
      if (!d) return 0;
      const P = RU_DATA.PLACEHOLDER;
      const lvl = g.level(id);
      return d.baseWeight * (1 + P.DISCIPLE_WEIGHT_PER_LEVEL * (lvl - 1)) + g.passiveSum('weight');
    },
    /* 弟子的遭遇战胜率加成（流派 + 本次派遣 buff 由 RU_SIM 叠加） */
    discipleWinRate: (state) => (id) => {
      const d = RU_DATA.discipleById(id);
      return d ? (d.effect.winRate || 0) : 0;
    },
    /* 物品数量倍率（产出型） */
    discipleLootQty: (state) => (id) => {
      const d = RU_DATA.discipleById(id);
      return d ? (d.effect.lootQtyMult || 1) : 1;
    },
    discipleRareChance: (state) => (id) => {
      const d = RU_DATA.discipleById(id);
      return d ? (d.effect.rareChance || 0) : 0;
    },

    /* ---------- 秘境相关：时长上限 / 事件速率 / 事件数 ---------- */
    maxDuration: (state, g) => (id, ruinOrId) => {
      const ruin = (typeof ruinOrId === 'object') ? ruinOrId : RU_DATA.ruinById(ruinOrId);
      if (!ruin) return 0;
      const d = RU_DATA.discipleById(id);
      const extra = (d ? d.effect.maxDurationMult : 0) + g.passiveSum('maxDuration');
      return Math.floor(ruin.maxDuration * (1 + extra));
    },
    ruinEventRate: (state, g) => (id, ruinOrId) => {
      const ruin = (typeof ruinOrId === 'object') ? ruinOrId : RU_DATA.ruinById(ruinOrId);
      if (!ruin) return 0;
      const d = RU_DATA.discipleById(id);
      const extra = (d ? d.effect.eventRate : 0) + g.passiveSum('eventRate');
      return ruin.eventRate * (1 + extra);
    },
    ruinDangerRate: (state) => (id, ruinOrId) => {
      const ruin = (typeof ruinOrId === 'object') ? ruinOrId : RU_DATA.ruinById(ruinOrId);
      if (!ruin) return 0;
      const d = RU_DATA.discipleById(id);
      const extra = (d ? d.effect.dangerRateMult : 0);
      return Math.max(0, ruin.dangerRate * (1 + extra));
    },
    /* 实际事件数 = 时长(h) × 10 × (1+事件数加成) × 秘境eventRate */
    eventCount: (state, g) => (id, ruinOrId, durationSec) => {
      const rate = g.ruinEventRate(id, ruinOrId);
      const hours = Math.max(0, durationSec || 0) / 3600;
      return Math.max(1, Math.round(hours * RU_DATA.PLACEHOLDER.BASE_EVENTS_PER_HOUR * rate));
    },

    /* ---------- 资产：负重 / 价值 / 售价 ---------- */
    itemWeight: () => (itemId) => { const it = RU_DATA.itemById(itemId); return it ? it.weight : 0; },
    stackWeight: () => (entry) => {
      const it = RU_DATA.itemById(entry.itemId);
      return it ? it.weight * (entry.qty || 0) : 0;
    },
    listWeight: (state, g) => (list) => (list || []).reduce((s, e) => s + g.stackWeight(e), 0),
    listValue: () => (list) => (list || []).reduce((s, e) => {
      const it = RU_DATA.itemById(e.itemId);
      return s + (it ? it.value * (e.qty || 0) : 0);
    }, 0),
    listCount: () => (list) => (list || []).reduce((s, e) => s + (e.qty || 0), 0),
    bagWeight: (state, g) => g.listWeight(state.bag),
    bagValue: (state, g) => g.listValue(state.bag),
    /* 出售单价：基础 value × (1 + 被动售价加成) */
    sellPrice: (state, g) => (itemId) => {
      const it = RU_DATA.itemById(itemId);
      if (!it) return 0;
      const passive = g.passiveSum('sellPrice');
      return Math.floor(it.value * (RU_DATA.PLACEHOLDER.SELL_PRICE_MULT + passive));
    },

    /* ---------- 神器：碎片需求 / 满级溢出 ---------- */
    fragNeeded: () => (artifactId, level) => RU_DATA.fragNeeded(artifactId, level),
    artifactMaxed: (state) => (artifactId) => {
      const own = state.artifact[artifactId];
      const a = RU_DATA.artifactById(artifactId);
      if (!own || !a) return false;
      return own.level >= a.maxLevel;
    },
    unlockedArtifactList: (state) => () => Object.keys(state.artifact).filter(id => {
      const own = state.artifact[id];
      return own && own.unlocked;
    }),
    /* 尚未解锁的神器碎片进度（图鉴展示用） */
    artifactProgress: (state, g) => (artifactId) => {
      const own = state.artifact[artifactId] || { frags: 0, level: 0, unlocked: false };
      const need = RU_DATA.fragNeeded(artifactId, own.level);
      return { frags: own.frags, level: own.level, unlocked: own.unlocked, need, maxed: g.artifactMaxed(artifactId) };
    },

    /* ---------- 弟子升级 / 重塑成本 ---------- */
    upgradeCost: (state, g) => (id) => {
      const d = RU_DATA.discipleById(id);
      const P = RU_DATA.PLACEHOLDER;
      if (!d) return { stone: Infinity, mats: {} };
      const lvl = g.level(id);
      const mats = {};
      const matCount = Math.floor(lvl / P.UPGRADE_MAT_EVERY);
      if (matCount > 0) mats[d.specialMat] = matCount;
      return { stone: Math.ceil(P.UPGRADE_STONE_BASE * Math.pow(P.UPGRADE_STONE_INC, lvl - 1)), mats };
    },
    reviveCost: (state, g) => (id) => {
      const P = RU_DATA.PLACEHOLDER;
      const deaths = ((state.disciple[id] || {}).deaths) || 0;
      return { stone: Math.ceil(P.REVIVE_STONE_BASE * (1 + P.REVIVE_STONE_INC * deaths)) };
    },

    /* ---------- 弟子状态 / 可派遣判定 ---------- */
    discipleStatus: (state) => (id) => (state.disciple[id] || {}).status || 'idle',
    runningCount: (state) => state.running.length,
    canDispatch: (state, g) => (id) => {
      const st = g.discipleStatus(id);
      if (st !== 'idle') return { ok: false, reason: st };
      if (state.running.length >= g.dispatchLimit) return { ok: false, reason: 'limit' };
      return { ok: true, reason: '' };
    },
    /* 入场费校验（唯一准入限制） */
    canAffordRuin: (state) => (ruinOrId) => {
      const ruin = (typeof ruinOrId === 'object') ? ruinOrId : RU_DATA.ruinById(ruinOrId);
      if (!ruin) return false;
      try { return RU_CUR.value('ruin_stone') >= (ruin.cost || 0); } catch (e) { return false; }
    },

    /* ---------- 工具：秘境 / 物品 / 品质显示 ---------- */
    ruinName: () => (ruinOrId) => {
      const ruin = (typeof ruinOrId === 'object') ? ruinOrId : RU_DATA.ruinById(ruinOrId);
      if (!ruin) return '—';
      const t = RU_TEXT && RU_TEXT.MAP;
      return (t && t[ruin.id]) || ruin.name || ('秘境 ' + ruin.id);
    },
    itemName: () => (itemId) => { const it = RU_DATA.itemById(itemId); return it ? it.name : itemId; },
    itemQuality: () => (itemId) => { const it = RU_DATA.itemById(itemId); return it ? it.quality : 'white'; },
    qualityName: () => (q) => (RU_DATA.QUALITY[q] && RU_DATA.QUALITY[q].name) || q
  },

  /* ==========================================================
   * 3. actions（ctx 由 RU_RT.ctx() 提供）
   * ========================================================== */
  actions: {

    /* ---------------- 派遣 ---------------- */
    /* payload: { discipleId, ruinId, durationSec, artifactIds?, retreat? } */
    dispatch(ctx, payload) {
      const state = ctx.state, g = ctx.getters;
      const p = payload || {};
      const id = p.discipleId;
      const ruin = RU_DATA.ruinById(p.ruinId);
      if (!ruin) return { ok: false, reason: 'noRuin' };
      const gate = g.canDispatch(id);
      if (!gate.ok) return { ok: false, reason: gate.reason };

      /* 时长：受秘境上限约束 */
      const maxDur = g.maxDuration(id, ruin) * 60;
      let durationSec = Math.max(60, Math.floor(p.durationSec || 3600));
      durationSec = Math.min(durationSec, Math.max(60, maxDur));

      /* 入场费（唯一准入限制） */
      const cost = ruin.cost || 0;
      let stone = 0;
      try { stone = RU_CUR.value('ruin_stone'); } catch (e) { stone = 0; }
      if (stone < cost) return { ok: false, reason: 'noStone' };

      /* 神器栏：只放战斗神器，且不超过栏位数 */
      const slots = g.artifactSlots;
      const artifactIds = (p.artifactIds || []).filter(aid => {
        const a = RU_DATA.artifactById(aid);
        const own = state.artifact[aid];
        return a && a.slotType === 'combat' && own && own.unlocked;
      }).slice(0, slots);

      /* 撤离条件优先级列表 */
      const retreat = (p.retreat && p.retreat.length ? p.retreat : [{ type: 'none', value: 0 }])
        .map(r => ({ type: r.type || 'none', value: (r.value === undefined ? null : r.value) }));

      try { RU_CUR.spend('ruin_stone', cost); } catch (e) { /* ignore */ }

      const startAt = state.now || 0;
      const cfg = {
        discipleId: id, ruinId: ruin.id, durationSec, artifactIds, retreat,
        seed: (state.seq || 0) * 7919 + Math.floor(startAt) + 13, startAt
      };
      const plan = RU_SIM.run(cfg, { getters: g, state: state, ruin: ruin });

      state.seq = (state.seq || 0) + 1;
      const record = {
        id: 'ruin_' + state.seq, discipleId: id, ruinId: ruin.id,
        startAt: startAt, endAt: startAt + plan.returnSeconds,
        cost: cost, cfg: cfg, plan: plan
      };
      state.running.push(record);
      state.disciple[id].status = 'dispatched';
      /* 记入图鉴：已探索秘境 */
      state.codex.ruin[ruin.id] = (state.codex.ruin[ruin.id] || 0) + 1;
      try { RU_STAT.add('ruin_dispatchCount', 1); } catch (e) { /* ignore */ }
      return { ok: true, record: record };
    },

    /* ---------------- 归来结算 · 一键入库 ---------------- */
    /* payload: { recordId } —— 也可直接传 record 对象 */
    collect(ctx, payload) {
      const state = ctx.state, g = ctx.getters;
      const p = payload || {};
      const idx = state.returned.findIndex(r => r.id === p.recordId);
      if (idx < 0) return { ok: false, reason: 'notFound' };
      const rec = state.returned[idx];
      const plan = rec.plan;
      const notes = [];
      const gained = { bag: [], fragment: [], stone: 0 };

      /* 1) 物品入库：撤离成功 → 背包 + 安全箱；阵亡 → 仅安全箱 */
      const keep = plan.died ? plan.safeBox : plan.bag.concat(plan.safeBox);
      const merge = {};
      keep.forEach(e => { merge[e.itemId] = (merge[e.itemId] || 0) + e.qty; });
      Object.keys(merge).forEach(itemId => {
        const it = RU_DATA.itemById(itemId);
        if (!it) return;
        if (it.type === 'clue') {
          state.codex.clue[itemId] = (state.codex.clue[itemId] || 0) + merge[itemId];
        }
        state.codex.item[itemId] = (state.codex.item[itemId] || 0) + merge[itemId];
        const exist = state.bag.find(b => b.itemId === itemId);
        if (exist) exist.qty += merge[itemId]; else state.bag.push({ itemId: itemId, qty: merge[itemId] });
        gained.bag.push({ itemId: itemId, qty: merge[itemId] });
      });
      notes.push(this._logText('collectToBag'));

      /* 2) 神器碎片入库：解锁 / 升级 / 满级溢出转灵石 */
      let fragStone = 0;
      Object.keys(plan.fragments || {}).forEach(aid => {
        const add = plan.fragments[aid];
        if (add <= 0) return;
        const own = state.artifact[aid] || (state.artifact[aid] = { frags: 0, level: 0, unlocked: false });
        const a = RU_DATA.artifactById(aid);
        let left = add;
        /* 满级直接溢出 */
        if (own.unlocked && own.level >= a.maxLevel) {
          fragStone += RU_DATA.fragToStone(aid, left);
          notes.push(this._logText('fragOverflow', { item: a.name, stone: RU_DATA.fragToStone(aid, left) }));
          gained.fragment.push({ artifactId: aid, overflow: left, stone: RU_DATA.fragToStone(aid, left) });
          return;
        }
        own.frags += left;
        /* 自动解锁 */
        if (!own.unlocked) {
          const need = RU_DATA.fragNeeded(aid, 0);
          if (own.frags >= need) {
            own.frags -= need; own.unlocked = true; own.level = 1;
            notes.push(this._logText('fragUnlock', { item: a.name }));
            try { RU_STAT.add('ruin_artifactUnlock', 1); } catch (e) { /* ignore */ }
          }
        }
        /* 升级（碎片足够则连续升） */
        while (own.unlocked && own.level < a.maxLevel && own.frags >= RU_DATA.fragNeeded(aid, own.level)) {
          own.frags -= RU_DATA.fragNeeded(aid, own.level);
          own.level += 1;
          notes.push(this._logText('fragLevelUp', { item: a.name, n: own.level }));
          try { RU_STAT.increaseTo('ruin_artifactMaxLevel', own.level); } catch (e) { /* ignore */ }
        }
        /* 满级后剩余碎片溢出 */
        if (own.unlocked && own.level >= a.maxLevel && own.frags > 0) {
          const st = RU_DATA.fragToStone(aid, own.frags);
          fragStone += st;
          notes.push(this._logText('fragOverflow', { item: a.name, stone: st }));
          own.frags = 0;
        }
        gained.fragment.push({ artifactId: aid, added: add });
      });
      if (fragStone > 0) notes.push(this._logText('collectFragment'));

      /* 3) 灵石入账（任务收益 + 碎片溢出） */
      const stoneGain = (plan.stone || 0) + fragStone;
      if (stoneGain > 0) {
        try { RU_CUR.add('ruin_stone', stoneGain); } catch (e) { /* ignore */ }
        notes.push(this._logText('collectStone'));
      }
      gained.stone = stoneGain;

      /* 4) 弟子状态更新 */
      const d = state.disciple[rec.discipleId];
      if (plan.died) {
        d.status = 'needRevive';
        d.deaths = (d.deaths || 0) + 1;
        try { RU_STAT.add('ruin_deathCount', 1); } catch (e) { /* ignore */ }
      } else {
        d.status = 'idle';
      }
      /* 永久战力成长（奇遇产出） */
      if (plan.permPower) d.permPower = (d.permPower || 0) + plan.permPower;

      /* 5) 历史与统计 */
      try {
        RU_STAT.add('ruin_clears', plan.died ? 0 : 1);
        RU_STAT.add('ruin_eventCount', plan.eventsDone || 0);
        RU_STAT.increaseTo('ruin_bestBagValue', ctx.getters.listValue(plan.bag.concat(plan.safeBox)));
        RU_STAT.increaseTo('ruin_bestStone', stoneGain);
      } catch (e) { /* ignore */ }
      state.history.unshift({
        id: rec.id, discipleId: rec.discipleId, ruinId: rec.ruinId,
        durationSec: rec.endAt - rec.startAt, died: plan.died,
        events: plan.eventsDone || 0, stone: stoneGain,
        items: keep.length, bagValue: ctx.getters.listValue(plan.bag.concat(plan.safeBox))
      });
      if (state.history.length > 20) state.history.length = 20;

      state.returned.splice(idx, 1);
      try { RU_RT.afterChange(); } catch (e) { /* ignore */ }
      return { ok: true, gained: gained, notes: notes, plan: plan };
    },

    /* ---------------- 出售（变现为灵石） ---------------- */
    /* payload: { itemId, qty } —— qty 省略表示全部 */
    sell(ctx, payload) {
      const state = ctx.state, g = ctx.getters;
      const p = payload || {};
      const entry = state.bag.find(b => b.itemId === p.itemId);
      if (!entry) return { ok: false, reason: 'notFound' };
      const it = RU_DATA.itemById(entry.itemId);
      if (!it || it.type === 'clue') return { ok: false, reason: 'notSellable' };
      const qty = Math.min(entry.qty, Math.max(1, Math.floor(p.qty || entry.qty)));
      const gain = g.sellPrice(entry.itemId) * qty;
      entry.qty -= qty;
      if (entry.qty <= 0) state.bag.splice(state.bag.indexOf(entry), 1);
      try { RU_CUR.add('ruin_stone', gain); RU_STAT.add('ruin_sellStone', gain); } catch (e) { /* ignore */ }
      return { ok: true, gain: gain, qty: qty };
    },

    /* 批量出售（列表制仓库的「一键变现」，按品质阈值） */
    /* payload: { maxQuality } 出售品质 ≤ maxQuality 且非线索的全部物品 */
    sellBelow(ctx, payload) {
      const state = ctx.state, g = ctx.getters;
      const p = payload || {};
      const limitIdx = RU_DATA.qualityIndex(p.maxQuality || 'white');
      let gain = 0, sold = 0;
      const rest = [];
      state.bag.forEach(e => {
        const it = RU_DATA.itemById(e.itemId);
        if (!it || it.type === 'clue' || RU_DATA.qualityIndex(it.quality) > limitIdx) { rest.push(e); return; }
        gain += g.sellPrice(e.itemId) * e.qty;
        sold += e.qty;
      });
      state.bag = rest;
      if (gain > 0) { try { RU_CUR.add('ruin_stone', gain); } catch (e) { /* ignore */ } }
      return { ok: true, gain: gain, sold: sold };
    },

    /* ---------------- 弟子升级（灵石 + 专属材料） ---------------- */
    upgradeDisciple(ctx, payload) {
      const state = ctx.state, g = ctx.getters;
      const id = (payload || {}).discipleId;
      const d = state.disciple[id];
      if (!d) return { ok: false, reason: 'notFound' };
      const P = RU_DATA.PLACEHOLDER;
      if (d.level >= P.LEVEL_CAP) return { ok: false, reason: 'maxed' };
      const cost = g.upgradeCost(id);
      let stone = 0;
      try { stone = RU_CUR.value('ruin_stone'); } catch (e) { stone = 0; }
      if (stone < cost.stone) return { ok: false, reason: 'noStone' };
      for (const mid in cost.mats) {
        const e = state.bag.find(b => b.itemId === mid);
        if (!e || e.qty < cost.mats[mid]) return { ok: false, reason: 'noMat', mat: mid };
      }
      try { RU_CUR.spend('ruin_stone', cost.stone); } catch (e) { /* ignore */ }
      for (const mid in cost.mats) {
        const e = state.bag.find(b => b.itemId === mid);
        e.qty -= cost.mats[mid];
        if (e.qty <= 0) state.bag.splice(state.bag.indexOf(e), 1);
      }
      d.level += 1;
      try { RU_STAT.increaseTo('ruin_discipleMaxLevel', d.level); } catch (e) { /* ignore */ }
      return { ok: true, level: d.level, note: this._logText('levelUp', { disciple: RU_DATA.discipleById(id).name, n: d.level, realm: RU_DATA.discipleRealm(d.level) }) };
    },

    /* ---------------- 重塑肉身（灵石买生生造化丹） ---------------- */
    reviveDisciple(ctx, payload) {
      const state = ctx.state, g = ctx.getters;
      const id = (payload || {}).discipleId;
      const d = state.disciple[id];
      if (!d || d.status !== 'needRevive') return { ok: false, reason: 'notNeedRevive' };
      const cost = g.reviveCost(id);
      let stone = 0;
      try { stone = RU_CUR.value('ruin_stone'); } catch (e) { stone = 0; }
      if (stone < cost.stone) return { ok: false, reason: 'noStone' };
      try { RU_CUR.spend('ruin_stone', cost.stone); RU_STAT.add('ruin_reviveCount', 1); } catch (e) { /* ignore */ }
      d.status = 'idle';
      return { ok: true, note: this._logText('revived', { disciple: RU_DATA.discipleById(id).name }) };
    },

    /* ---------------- 神器栏装备（只放战斗神器） ---------------- */
    /* payload: { discipleId, artifactIds: [] } */
    setLoadout(ctx, payload) {
      const state = ctx.state, g = ctx.getters;
      const p = payload || {};
      const id = p.discipleId;
      if (!state.disciple[id]) return { ok: false, reason: 'notFound' };
      const slots = g.artifactSlots;
      const list = (p.artifactIds || []).filter(aid => {
        const a = RU_DATA.artifactById(aid);
        const own = state.artifact[aid];
        return a && a.slotType === 'combat' && own && own.unlocked;
      }).slice(0, slots);
      state.loadout[id] = list;
      return { ok: true, list: list };
    },

    /* 保存派遣预设（时长 / 神器 / 撤离条件） */
    setPreset(ctx, payload) {
      const state = ctx.state;
      const p = payload || {};
      const id = p.discipleId;
      if (!state.presets[id]) return false;
      state.presets[id] = {
        ruinId: p.ruinId || state.presets[id].ruinId,
        durationSec: p.durationSec || state.presets[id].durationSec,
        artifactIds: p.artifactIds || state.presets[id].artifactIds,
        retreat: p.retreat || state.presets[id].retreat
      };
      return true;
    },

    /* ---------------- 内部：文案插值（与 RU_SIM 同口径） ---------------- */
    _logText(key, vars) {
      try { return RU_SIM.interpolate(((RU_TEXT.LOG || {})[key]) || key, vars || {}); }
      catch (e) { return key; }
    }
  }
};

if (typeof module !== 'undefined') module.exports = { RU_STORE };
