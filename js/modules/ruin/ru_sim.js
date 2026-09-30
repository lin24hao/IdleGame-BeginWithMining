/* ============================================================
 * ru_sim.js —— 「秘境（ruin）」派遣模拟引擎（纯逻辑，无 DOM、无定时器）
 *
 * 一次派遣的全部事件流在【派遣瞬间】一次性算完，结果作为 plan 存入存档；
 * RU_RT.tick 只推进时间戳 —— 因此在线与离线口径完全一致，不会出现漂移。
 *
 * 输入 cfg：
 *   { discipleId, ruinId, durationSec, artifactIds[], retreat[], seed, startAt }
 * 输入 env：
 *   { getters, state, ruin }
 * 输出 plan：
 *   { discipleId, ruinId, durationSec, startAt, seed,
 *     power, weightCap, eventRate, eventCount, perEventSec,
 *     hp, bag[], safeBox[], fragments{}, stone, permPower,
 *     log[], died, diedAt, wardUsed, retreatReason, retreatAt,
 *     eventsDone, returnSeconds, abandoned[] }
 *
 * 口径依据策划案：基准 10 事件/小时；归途固定 10 分钟且无产出；
 * 实际事件数只算到死亡时刻；背包+安全箱一起计入负重；
 * 安全箱初始 2 位、无品质门禁、即时择优（每次获得物品后重排）。
 * ============================================================ */
const RU_SIM = {

  /* ==========================================================
   * 工具
   * ========================================================== */
  /* 文案插值：{disciple} / {ruin} / {item} / {count} / {stone} / {n} ... */
  interpolate(tpl, vars) {
    if (!tpl) return '';
    const v = vars || {};
    return String(tpl).replace(/\{(\w+)\}/g, (m, k) => (v[k] === undefined || v[k] === null ? m : String(v[k])));
  },

  /* 可复现随机（mulberry32）：同 seed 同结果，便于离线复算与自测 */
  makeRng(seed) {
    let a = (seed >>> 0) || 1;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },

  _int(rng, min, max) {
    const lo = Math.ceil(Math.min(min, max)), hi = Math.floor(Math.max(min, max));
    return lo + Math.floor(rng() * (hi - lo + 1));
  },
  _range(rng, arr) { return this._int(rng, arr[0], arr[1]); },
  _weighted(rng, list, weightFn) {
    let total = 0;
    list.forEach(x => { const w = Math.max(0, weightFn(x)); total += w; });
    if (total <= 0) return list.length ? list[0] : null;
    let r = rng() * total;
    for (let i = 0; i < list.length; i++) {
      const w = Math.max(0, weightFn(list[i]));
      if (r < w) return list[i];
      r -= w;
    }
    return list[list.length - 1];
  },

  /* ==========================================================
   * 掉落
   * ========================================================== */
  /* 品质抽取：基础权重 + 秘境 lootBias + 品质偏置（寻宝/产出型） */
  _pickQuality(rng, ruin, bias) {
    const P = RU_DATA.PLACEHOLDER;
    const order = RU_DATA.QUALITY_ORDER;
    const b = bias || 0;
    return this._weighted(rng, order, q => {
      const base = P.QUALITY_BASE_WEIGHT[q] || 0;
      const mapBias = (ruin && ruin.lootBias && ruin.lootBias[q]) || 0;
      const w = (base + mapBias) * (1 + b * RU_DATA.qualityIndex(q));
      return w;
    }) || 'white';
  },
  /* 物品抽取：按品质取池，缺池则逐级降档；秘境专属掉落加权 */
  _pickItem(rng, ruin, quality, onlyType) {
    const order = RU_DATA.QUALITY_ORDER;
    let qi = RU_DATA.qualityIndex(quality);
    for (let step = 0; step < order.length; step++) {
      const q = order[Math.max(0, qi - step)];
      const ids = Object.keys(RU_DATA.ITEMS).filter(id => {
        const it = RU_DATA.ITEMS[id];
        if (it.type === 'clue') return false;
        if (onlyType && it.type !== onlyType) return false;
        return it.quality === q;
      });
      if (ids.length > 0) {
        return this._weighted(rng, ids, id => (ruin && ruin.exclusiveItems && ruin.exclusiveItems.indexOf(id) >= 0) ? 3 : 1);
      }
    }
    return null;
  },
  /* 神器碎片归属：按品质基础权重抽一件神器 */
  _pickArtifact(rng) {
    const P = RU_DATA.PLACEHOLDER;
    return this._weighted(rng, RU_DATA.ARTIFACTS, a => P.QUALITY_BASE_WEIGHT[a.quality] || 1);
  },

  /* ==========================================================
   * 负重 + 安全箱
   * ========================================================== */
  _totalWeight(plan) {
    return plan.bag.concat(plan.safeBox).reduce((s, e) => {
      const it = RU_DATA.itemById(e.itemId);
      return s + (it ? it.weight * e.qty : 0);
    }, 0);
  },
  _addToBag(plan) { /* 占位以保持接口清晰（实际由 _gainItem 聚合） */ },
  /* 聚合入包（列表制：按 itemId 合并，永不重复建条目） */
  _merge(plan, itemId, qty) {
    const e = plan.bag.find(x => x.itemId === itemId);
    if (e) e.qty += qty; else plan.bag.push({ itemId: itemId, qty: qty });
  },
  /* 安全箱即时择优：始终保有价值最高的 safeBoxSlots 种物品 */
  _optimizeSafeBox(plan) {
    const slots = plan.safeBoxSlots || 0;
    const agg = {};
    plan.bag.forEach(e => { agg[e.itemId] = (agg[e.itemId] || 0) + e.qty; });
    plan.safeBox.forEach(e => { agg[e.itemId] = (agg[e.itemId] || 0) + e.qty; });
    const ids = Object.keys(agg);
    ids.sort((a, b) => {
      const ia = RU_DATA.itemById(a), ib = RU_DATA.itemById(b);
      return (ib ? ib.value : 0) - (ia ? ia.value : 0);
    });
    const keep = {};
    ids.slice(0, slots).forEach(id => { keep[id] = true; });
    plan.bag = []; plan.safeBox = [];
    ids.forEach(id => {
      const entry = { itemId: id, qty: agg[id] };
      if (keep[id]) plan.safeBox.push(entry); else plan.bag.push(entry);
    });
  },
  /* 获得单件物品（含负重校验 + 放弃 + 安全箱重排） */
  _gainItem(plan, itemId, qty, t, log, vars) {
    const it = RU_DATA.itemById(itemId);
    if (!it) return false;
    const w = it.weight * qty;
    if (this._totalWeight(plan) + w > plan.weightCap) {
      plan.abandoned.push({ itemId: itemId, qty: qty });
      log.push({
        t: t, type: 'abandon', templateId: 'abandon',
        text: RU_SIM.interpolate((RU_TEXT.LOG || {}).abandon, Object.assign({}, vars, { item: it.name })),
        items: []
      });
      return false;
    }
    this._merge(plan, itemId, qty);
    this._optimizeSafeBox(plan);
    return true;
  },

  /* ==========================================================
   * 事件权重 / 模板
   * ========================================================== */
  _pickEventType(rng, dangerRate) {
    const P = RU_DATA.PLACEHOLDER;
    const w = {
      encounter: P.EVENT_WEIGHT.encounter * Math.max(0.05, dangerRate),
      adventure: P.EVENT_WEIGHT.adventure,
      explore: P.EVENT_WEIGHT.explore,
      gather: P.EVENT_WEIGHT.gather
    };
    const normal = w.encounter + w.adventure + w.explore + w.gather;
    const share = P.SPECIAL_SHARE;
    w.special = normal * (share / (1 - share));
    return this._weighted(rng, ['encounter', 'adventure', 'explore', 'gather', 'special'], k => w[k]);
  },
  _pickTemplate(rng, type, discipleId) {
    const ev = RU_DATA.EVENTS[type];
    if (!ev) return null;
    if (ev.perDisciple) {
      const list = (ev.templates && ev.templates[discipleId]) || [];
      if (!list.length) return null;
      return this._weighted(rng, list, () => 1);
    }
    return this._weighted(rng, ev.templates || [], () => 1);
  },

  /* ==========================================================
   * 撤离条件判定（按优先级列表，命中即撤）
   * ========================================================== */
  _retreatHit(cond, plan) {
    if (!cond || cond.type === 'none') return false;
    const v = cond.value;
    switch (cond.type) {
      case 'bagValue': return this._bagValue(plan) >= (v === null ? 5000 : v);
      case 'bagWeight': return plan.weightCap > 0 && (this._totalWeight(plan) / plan.weightCap) * 100 >= (v === null ? 80 : v);
      case 'bagItems': return plan.bag.reduce((s, e) => s + e.qty, 0) >= (v === null ? 10 : v);
      case 'safeBoxFull': return plan.safeBox.length >= plan.safeBoxSlots && plan.safeBoxSlots > 0;
      case 'hpBelow': return plan.hp < (v === null ? 30 : v);
      case 'rareLoot': return !!plan.sawRare;
      case 'fragment': return plan.fragCount >= (v === null ? 1 : v);
      case 'events': return plan.eventsDone >= (v === null ? 30 : v);
      default: return false;
    }
  },
  _bagValue(plan) {
    return plan.bag.concat(plan.safeBox).reduce((s, e) => {
      const it = RU_DATA.itemById(e.itemId);
      return s + (it ? it.value * e.qty : 0);
    }, 0);
  },
  _checkRetreat(plan, t) {
    for (let i = 0; i < plan.retreat.length; i++) {
      if (this._retreatHit(plan.retreat[i], plan)) return plan.retreat[i];
    }
    return null;
  },

  /* ==========================================================
   * 主流程
   * ========================================================== */
  run(cfg, env) {
    const g = (env && env.getters) || {};
    const ruin = (env && env.ruin) || RU_DATA.ruinById(cfg.ruinId);
    const rng = this.makeRng(cfg.seed || 1);
    const P = RU_DATA.PLACEHOLDER;
    const did = cfg.discipleId;
    const ddef = RU_DATA.discipleById(did);
    const log = [];

    const plan = {
      discipleId: did, ruinId: cfg.ruinId,
      durationSec: cfg.durationSec, startAt: cfg.startAt || 0, seed: cfg.seed || 1,
      safeBoxSlots: Math.max(0, Math.round(g.safeBoxSlots || P.SAFEBOX_BASE_SLOTS)),
      weightCap: Math.round(g.weightCap ? g.weightCap(did) : ddef.baseWeight),
      power: g.disciplePower ? g.disciplePower(did) : ddef.basePower,
      bag: [], safeBox: [], fragments: {}, abandoned: [],
      stone: 0, permPower: 0, fragCount: 0, sawRare: false,
      hp: 100, died: false, diedAt: 0, wardUsed: false,
      retreatReason: '', retreatAt: 0, eventsDone: 0, returnSeconds: cfg.durationSec,
      log: log, artifactIds: (cfg.artifactIds || []).slice(),
      retreat: (cfg.retreat && cfg.retreat.length) ? cfg.retreat : [{ type: 'none', value: 0 }]
    };

    /* ---- 本次派遣的运行时加成（唯一来源：事件 buffRun 结果） ---- */
    const buff = { combatPower: 0, eventRate: 0, dangerRate: 0, lootQualityBias: 0 };
    let wardLeft = (g.combatWard && g.combatWard(did)) ? 1 : 0;
    const damageReduce = (g.combatSum && g.combatSum(did, 'damageReduce')) || 0;
    const moneyGain = (g.combatSum && g.combatSum(did, 'moneyGain')) || 0;
    const rewardBonus = (g.combatSum && g.combatSum(did, 'rewardBonus')) || 0;

    /* ---- 事件速率：时长(h) × 10 × (1+事件数加成) × 秘境eventRate ---- */
    const baseRate = g.ruinEventRate ? g.ruinEventRate(did, ruin) : ruin.eventRate;
    plan.eventRate = baseRate * (1 + buff.eventRate);
    let totalEvents = Math.max(1, Math.round((cfg.durationSec / 3600) * P.BASE_EVENTS_PER_HOUR * plan.eventRate));
    plan.eventCount = totalEvents;
    let perEventSec = cfg.durationSec / Math.max(1, totalEvents);
    const dangerRate = (g.ruinDangerRate ? g.ruinDangerRate(did, ruin) : ruin.dangerRate) * (1 + buff.dangerRate);

    /* ---- 事件循环 ---- */
    let i = 0;
    while (i < totalEvents) {
      const t = i * perEventSec;
      i++;
      const type = this._pickEventType(rng, dangerRate);
      const tpl = this._pickTemplate(rng, type, did);
      if (!tpl) continue;

      const enemyRealmIdx = Math.max(0, Math.min(RU_DATA.REALM_NAMES.length - 1,
        RU_DATA.ruinRealmIdx(ruin) + (tpl.enemyRealmIdx || 0)));
      const vars = {
        disciple: ddef.name,
        discipleRealm: g.realmName ? g.realmName(did) : RU_DATA.discipleRealm(1),
        enemyRealm: RU_DATA.REALM_NAMES[enemyRealmIdx],
        ruin: (RU_TEXT.MAP && RU_TEXT.MAP[ruin.id]) || ruin.name
      };
      const tplText = (RU_TEXT.EVENTS || {})[tpl.id] || {};

      /* ---- 遭遇：战力对比 + 小幅浮动，不可规避 ---- */
      if (type === 'encounter') {
        const enemyPower = this._int(rng, ruin.powerMin, ruin.powerMax) * (tpl.powerScale || 1);
        const winRate = (g.discipleWinRate ? g.discipleWinRate(did) : (ddef.effect.winRate || 0)) + buff.combatPower;
        const f1 = 1 + (rng() * 2 - 1) * P.COMBAT_FLOAT;
        const f2 = 1 + (rng() * 2 - 1) * P.COMBAT_FLOAT;
        const playerScore = plan.power * (1 + winRate) * f1;
        const enemyScore = enemyPower * f2;
        const win = playerScore >= enemyScore;
        plan.eventsDone += 1;

        if (win) {
          const count = Math.max(1, Math.round(this._int(rng, 1, 3) * (g.discipleLootQty ? g.discipleLootQty(did) : 1)));
          const items = [];
          for (let k = 0; k < count; k++) {
            const q = this._pickQuality(rng, ruin, 0.25 + buff.lootQualityBias);
            const itemId = this._pickItem(rng, ruin, q, null);
            if (!itemId) continue;
            if (this._gainItem(plan, itemId, 1, t, log, vars)) items.push({ itemId: itemId, qty: 1 });
            if (RU_DATA.qualityIndex(RU_DATA.itemById(itemId).quality) >= RU_DATA.qualityIndex('blue')) plan.sawRare = true;
          }
          plan.hp = Math.max(0, plan.hp - this._range(rng, P.HP_LOSS_WIN) * (1 - damageReduce));
          log.push({
            t: t, type: 'encounter', templateId: tpl.id, key: 'win',
            text: this.interpolate(tplText.win || '【{disciple}】胜。', vars), items: items,
            detail: { power: Math.round(plan.power), enemy: Math.round(enemyPower) }
          });
        } else {
          plan.hp = Math.max(0, plan.hp - this._range(rng, P.HP_LOSS_LOSE) * (1 - damageReduce));
          log.push({
            t: t, type: 'encounter', templateId: tpl.id, key: 'lose',
            text: this.interpolate(tplText.lose || '【{disciple}】败。', vars), items: [],
            detail: { power: Math.round(plan.power), enemy: Math.round(enemyPower) }
          });
        }
      } else {
        /* ---- 其余四类：加权结果表 ---- */
        plan.eventsDone += 1;
        const oc = this._weighted(rng, tpl.outcomes || [], o => o.weight || 0);
        if (oc) this._applyOutcome(plan, oc, { rng: rng, ruin: ruin, vars: vars, t: t, log: log, did: did, g: g, buff: buff });
        const key = oc ? oc.key : 'r0';
        const tplStr = tplText[key] || tplText.r0 || '【{disciple}】在此处有所得。';
        log.push({
          t: t, type: type, templateId: tpl.id, key: key,
          text: this.interpolate(tplStr, Object.assign({}, vars, { count: plan._lastCount || 0, stone: plan._lastStone || 0 })),
          items: plan._lastItems || []
        });
      }
      plan._lastItems = []; plan._lastCount = 0; plan._lastStone = 0;

      /* ---- 阵亡判定 ---- */
      if (plan.hp <= 0) {
        if (wardLeft > 0) {
          wardLeft -= 1;
          plan.wardUsed = true;
          plan.hp = P.WARD_HP_RESTORE;
          log.push({ t: t, type: 'ward', templateId: 'ward', text: this.interpolate((RU_TEXT.LOG || {}).wardUsed, vars), items: [] });
        } else {
          plan.died = true;
          plan.diedAt = t;
          plan.bag = [];
          log.push({ t: t, type: 'death', templateId: 'death', text: this.interpolate((RU_TEXT.LOG || {}).died, vars), items: [] });
          if (plan.safeBox.length) {
            log.push({
              t: t, type: 'keep', templateId: 'keep',
              text: this.interpolate((RU_TEXT.LOG || {}).safeBoxKept, Object.assign({}, vars, { n: plan.safeBox.length })), items: []
            });
          }
          break;
        }
      }

      /* ---- 撤离条件 ---- */
      const hit = this._checkRetreat(plan, t);
      if (hit) {
        plan.retreatReason = hit.type;
        plan.retreatAt = t;
        log.push({
          t: t, type: 'retreat', templateId: 'retreat',
          text: this.interpolate((RU_TEXT.LOG || {}).retreatBy, Object.assign({}, vars, {
            reason: (RU_TEXT.RETREAT_REASON && RU_TEXT.RETREAT_REASON[hit.type]) || hit.type
          })), items: []
        });
        break;
      }

      /* ---- 时长压缩（探索/专属的「捷径」结果）→ 等价多出事件 ---- */
      if (plan.eventCount > totalEvents) {
        totalEvents = plan.eventCount;
        perEventSec = cfg.durationSec / Math.max(1, totalEvents);
      }
    }

    /* ---- 灵石：moneyGain 即时加成 + 最终结算奖励加成 ---- */
    plan.stone = Math.floor(plan.stone * (1 + moneyGain) * (1 + rewardBonus));

    /* ---- 归来时刻：min(设定时长, 死亡时刻 + 10 分钟)；撤离则即时归来 ---- */
    if (plan.died) {
      plan.returnSeconds = Math.min(cfg.durationSec, plan.diedAt + P.DEATH_RETURN_SEC);
      log.push({ t: plan.diedAt, type: 'death', templateId: 'returning', text: this.interpolate((RU_TEXT.LOG || {}).returning, { n: 10 }), items: [] });
    } else if (plan.retreatReason) {
      plan.returnSeconds = Math.min(cfg.durationSec, Math.max(60, plan.retreatAt));
    } else {
      plan.returnSeconds = cfg.durationSec;
      log.push({ t: cfg.durationSec, type: 'timeout', templateId: 'retreatTimeout', text: this.interpolate((RU_TEXT.LOG || {}).retreatTimeout, {}), items: [] });
    }
    plan.eventTimes = perEventSec;
    return plan;
  },

  /* ==========================================================
   * 结果分支执行
   * ========================================================== */
  _applyOutcome(plan, oc, ctx) {
    const rng = ctx.rng, ruin = ctx.ruin, g = ctx.g, log = ctx.log, vars = ctx.vars, t = ctx.t;
    plan._lastItems = plan._lastItems || [];
    switch (oc.kind) {
      case 'loot': {
        const biasBase = oc.qualityBias === 'high' ? 0.35 : (oc.qualityBias === 'low' ? -0.35 : 0);
        const lq = g.discipleLootQty ? g.discipleLootQty(plan.discipleId) : 1;
        const rare = g.discipleRareChance ? g.discipleRareChance(plan.discipleId) : 0;
        const n = Math.max(1, Math.round(this._int(rng, oc.count[0], oc.count[1]) * lq));
        for (let k = 0; k < n; k++) {
          const q = this._pickQuality(rng, ruin, biasBase + rare * 3 + (ctx.buff ? ctx.buff.lootQualityBias : 0));
          const itemId = this._pickItem(rng, ruin, q, oc.onlyType || null);
          if (!itemId) continue;
          if (RU_DATA.qualityIndex(RU_DATA.itemById(itemId).quality) >= RU_DATA.qualityIndex('blue')) plan.sawRare = true;
          if (this._gainItem(plan, itemId, 1, t, log, vars)) plan._lastItems.push({ itemId: itemId, qty: 1 });
        }
        plan._lastCount = plan._lastItems.reduce((s, e) => s + e.qty, 0);
        break;
      }
      case 'material': {
        const n = this._range(rng, oc.count || [1, 1]);
        if (this._gainItem(plan, oc.id, n, t, log, vars)) plan._lastItems.push({ itemId: oc.id, qty: n });
        plan._lastCount = n;
        break;
      }
      case 'fragment': {
        const n = this._range(rng, oc.amount || [1, 1]);
        const a = this._pickArtifact(rng);
        if (a) {
          plan.fragments[a.id] = (plan.fragments[a.id] || 0) + n;
          plan.fragCount += n;
        }
        plan._lastCount = n;
        break;
      }
      case 'stone': {
        const n = this._range(rng, oc.amount || [100, 100]);
        plan.stone += n;
        plan._lastStone = n;
        break;
      }
      case 'buffPower': {
        const n = this._range(rng, oc.amount || [1, 1]);
        plan.permPower += n;
        plan._lastCount = n;
        break;
      }
      case 'buffRun': {
        if (ctx.buff) {
          if (oc.effect === 'combatPower') ctx.buff.combatPower += oc.value || 0;
          if (oc.effect === 'lootValue') ctx.buff.lootQualityBias += oc.value || 0;
        }
        break;
      }
      case 'shorten': {
        /* 剩余时长压缩 → 等价多出事件（同 seed 复算结果一致） */
        const pct = Math.max(0.01, Math.min(0.5, oc.pct || 0.1));
        const cur = plan.eventCount || 1;
        const next = Math.ceil(cur / (1 - pct));
        plan.eventCount = next;
        plan._extraEvents = (plan._extraEvents || 0) + (next - cur);
        break;
      }
      case 'clue': {
        const cid = rng() < 0.35 ? 'i_clue_relic' : 'i_clue_token';
        if (this._gainItem(plan, cid, 1, t, log, vars)) plan._lastItems.push({ itemId: cid, qty: 1 });
        plan._lastCount = 1;
        break;
      }
      case 'hp': {
        plan.hp = Math.max(0, Math.min(100, plan.hp + (oc.value || 0)));
        break;
      }
      case 'death': {
        plan.hp = 0;
        break;
      }
      default: break;
    }
  }
};

/* 说明：shorten 通过 plan.eventCount 影响事件总数；RUN 主循环在每轮结束后
   读取 plan.eventCount 扩展循环上限，从而等价于「多出事件」。 */
if (typeof module !== 'undefined') module.exports = { RU_SIM };
