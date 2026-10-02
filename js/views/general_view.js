/* ============================================================
 * general_view.js ——「圣人指引」主视图
 *
 * 布局：
 *   顶部：功德 + 已完成任务统计
 *   主体：6 位仙尊卡片网格
 *     - 已解锁的仙尊：显示任务线（可展开/折叠）
 *     - 未解锁的仙尊：显示锁定图标 + 解锁条件
 *   每个任务线：阶段步进器 + 当前阶段任务详情 + 奖励预览
 *
 * 依赖：GEN_MODULE（general_core.js）
 * ============================================================ */

var GB_GEN_VIEW = {
  el: null,
  name: '圣人指引',
  _expanded: {},  // 记录哪些仙尊被展开
  _tick: 0,

  /* ---------- 生命周期 ---------- */
  mount(root) {
    if (this.el === root) { this.render(); return; }
    if (this.el) this.unload();
    this.el = root;
    root.innerHTML = `
      <div class="gen-header" id="gen-header"></div>
      <div class="flex1 scroll-container" id="gen-content"></div>`;
    root.addEventListener('click', (e) => this.onClick(e));
    this.render();
  },
  unload() {
    this.el = null;
  },

  /* ---------- 事件委托 ---------- */
  onClick(e) {
    const el = e.target.closest('[data-gact]');
    if (!el) return;
    const [tag, val] = el.getAttribute('data-gact').split(':');
    if (tag === 'toggle') {
      this._expanded[val] = !this._expanded[val];
      this.render();
    }
  },

  /* ---------- 渲染 ---------- */
  render() {
    const el = this.el; if (!el) return;
    const header = el.querySelector('#gen-header');
    const content = el.querySelector('#gen-content');
    if (!header || !content) return;

    const keep = content.scrollTop;

    header.innerHTML = this.renderHeader();
    content.innerHTML = this.renderGenerals();
    content.scrollTop = keep;
  },

  /* 从各模块 CUR 安全取值 */
  _getCurVal(key) {
    try {
      if (typeof GB_CUR !== 'undefined' && GB_CUR.value) return GB_CUR.value(key);
      if (key.startsWith('dao_') && typeof DAO_CUR !== 'undefined') return DAO_CUR.values[key] || 0;
      if (key.startsWith('rel_') && typeof REL_CUR !== 'undefined') return REL_CUR.values[key] || 0;
      if (key.startsWith('xq_') && typeof XQ_CUR !== 'undefined') return XQ_CUR.values[key] || 0;
      if ((key.startsWith('gem_') || key.startsWith('school_')) && typeof SC_CUR !== 'undefined') return SC_CUR.values[key] || 0;
      if (typeof GEN_CUR !== 'undefined') return GEN_CUR.values['gen_' + key] || 0;
    } catch(e) {}
    return 0;
  },

  renderHeader() {
    const cleared = GEN_MODULE.STAT.values.gen_stagesCleared.value;
    const completed = GEN_MODULE.STAT.values.gen_questsCompleted.value;

    // 4 种辅助玩法货币展示
    const curList = [
      { key: 'dao_chiyuan',   name: '赤元',     color: '#ef4444', icon: 'mdi-rhombus' },
      { key: 'rel_power',     name: '灵宝之力', color: '#f59e0b', icon: 'mdi-battery-high' },
      { key: 'xq_fragment',   name: '灵玉',     color: '#f59e0b', icon: 'mdi-shimmer' },
      { key: 'gem_topaz',     name: '宝石',     color: '#f59e0b', icon: 'mdi-diamond-stone' },
    ];

    const curHtml = curList.map(c => {
      const val = this._getCurVal(c.key);
      if (val <= 0) return '';  // 没值的隐藏，只显示有值的
      return `
        <div class="gen-currency">
          <span class="gen-cur-icon" style="color:${c.color};">${GB_ICON.icon(c.icon, 16)}</span>
          <span class="gen-cur-name">${c.name}</span>
          <span class="gen-cur-val">${formatNum(val)}</span>
        </div>`;
    }).join('');

    return `
      <div class="gen-header-inner">
        <div class="gen-currencies-row">${curHtml || '<span class="gen-cur-hint">完成任务获得辅助货币</span>'}</div>
        <div class="gen-stats">
          <div class="gen-stat" title="已推进的阶段数">
            <span class="gen-stat-icon">${GB_ICON.icon('mdi-step-forward', 14)}</span>
            <span>${cleared} 阶段</span>
          </div>
          <div class="gen-stat" title="已全部完成的仙尊任务线">
            <span class="gen-stat-icon">${GB_ICON.icon('mdi-check-circle', 14)}</span>
            <span>${completed} 完成</span>
          </div>
        </div>
      </div>`;
  },

  renderGenerals() {
    const gkList = Object.keys(GEN_GENERALS);
    const cards = gkList.map(gk => this.renderGeneralCard(gk)).join('');
    return `<div class="gen-grid">${cards}</div>`;
  },

  renderGeneralCard(gk) {
    const gen = GEN_GENERALS[gk];
    const locked = gen.unlock && typeof GB_UNLOCK !== 'undefined' && !GB_UNLOCK.isUnlocked(gen.unlock);

    // 子 feature 解锁守卫
    let unlockHint = '';
    if (locked) {
      const threshold = this._getSubfeatureThreshold(gen.unlock);
      unlockHint = threshold ? `需全局道行 Lv${threshold}` : '尚未解锁';
    }

    // 收集任务线状态 —— 只渲染 unlocked 的 quest
    const qKeysAll = Object.keys(gen.quests);
    const qKeysUnlocked = locked ? [] : qKeysAll.filter(qk => GEN_STATE.quests[gk] && GEN_STATE.quests[gk][qk] && GEN_STATE.quests[gk][qk].unlocked);

    const questsHtml = locked ? '' : qKeysUnlocked.map((qk, qi) => {
      const quest = gen.quests[qk];
      const qState = GEN_STATE.quests[gk] && GEN_STATE.quests[gk][qk];
      if (!qState) return '';

      const curStage = qState.stage;
      const totalStages = quest.stages.length;
      const isCompleted = qState.completed;
      const currentStageIdx = curStage;
      const currentStage = curStage < totalStages ? quest.stages[curStage] : null;

      const pct = isCompleted ? 100 : Math.min(100, (curStage / totalStages) * 100);

      let doneStagesHtml = '';
      if (curStage > 0 && !isCompleted) {
        const doneList = quest.stages.slice(0, curStage).map((s, i) => `
          <div class="gen-stage-done">
            <span class="gen-stage-done-icon">${GB_ICON.icon('mdi-check-circle', 14)}</span>
            <span class="gen-stage-done-label">Stage ${i + 1}</span>
            <span class="gen-stage-done-reward">${this.renderReward(s.reward, gk)}</span>
          </div>`).join('');
        doneStagesHtml = `<div class="gen-stage-dones">${doneList}</div>`;
      }

      let currentStageHtml = '';
      if (currentStage && !isCompleted) {
        const tasksHtml = currentStage.tasks.map((task, idx) => this.renderTask(task, idx)).join('');
        const rewardHtml = this.renderReward(currentStage.reward, gk);
        currentStageHtml = `
          <div class="gen-stage-info">
            <div class="gen-stage-label">当前阶段（${curStage + 1}/${totalStages}）：</div>
            <div class="gen-tasks">${tasksHtml}</div>
            ${rewardHtml ? `<div class="gen-reward">${GB_ICON.icon('mdi-gift', 14)} 奖励：${rewardHtml}</div>` : ''}
          </div>`;
      }

      let completedHtml = '';
      if (isCompleted) {
        const lastStage = quest.stages[totalStages - 1];
        const isLastUnlocked = qi === qKeysUnlocked.length - 1;
        const hasMoreLocked = qKeysUnlocked.length < qKeysAll.length;
        const unlockTip = isLastUnlocked && hasMoreLocked
          ? `<div class="gen-chain-hint">${GB_ICON.icon('mdi-link-variant', 14)} 完成此线后自动解锁下一条任务</div>`
          : '';
        const allDoneTip = isLastUnlocked && !hasMoreLocked
          ? `<div class="gen-chain-final">${GB_ICON.icon('mdi-crown', 16)} 此仙尊全部任务线通关！</div>`
          : '';
        completedHtml = `
          <div class="gen-stage-info gen-done">
            <div class="gen-done-label">${GB_ICON.icon('mdi-party-popper', 16)} 全部完成！</div>
            ${lastStage ? `<div class="gen-done-reward">最终奖励：${this.renderReward(lastStage.reward, gk)}</div>` : ''}
            ${unlockTip}
            ${allDoneTip}
          </div>`;
      }

      return `
        <div class="gen-quest ${isCompleted ? 'completed' : ''}">
          <div class="gen-quest-head">
            <span class="gen-quest-name">${quest.name}</span>
            <span class="gen-quest-progress">${isCompleted
              ? `<span style="color:#4ade80;">${GB_ICON.icon('mdi-check-circle', 14)} 已完成</span>`
              : `阶段 ${curStage}/${totalStages}`}</span>
          </div>
          ${quest.story ? `<div class="gen-quest-story">${quest.story}</div>` : ''}
          <div class="gen-progress-bar">
            <div class="gen-progress-fill" style="width:${pct}%;"></div>
          </div>
          ${doneStagesHtml}
          ${currentStageHtml}
          ${completedHtml}
        </div>`;
    }).join('');

    // 仙尊整体进度
    const totalQuests = qKeysAll.length;
    const unlockedCount = qKeysUnlocked.length;
    const doneQuests = locked ? 0 : Object.values(GEN_STATE.quests[gk] || {}).filter(q => q.completed).length;
    const genProgress = locked ? 0 : (doneQuests / Math.max(1, totalQuests)) * 100;

    const expanded = this._expanded[gk] && !locked;

    // 还有多少条未解锁
    const lockedQuestsCount = totalQuests - unlockedCount;
    const lockedHintHtml = (!locked && expanded && lockedQuestsCount > 0)
      ? `<div class="gen-locked-quests-hint">${GB_ICON.icon('mdi-lock-outline', 14)} 还有 ${lockedQuestsCount} 条任务线待解锁</div>`
      : '';

    // 仙尊 lore（展开时显示的开场白）
    const loreHtml = (!locked && expanded && gen.lore)
      ? `<div class="gen-lore">${GB_ICON.icon('mdi-quote-open', 14)}<span>${gen.lore}</span></div>`
      : '';

    return `
      <div class="gen-card ${locked ? 'locked' : ''} ${expanded ? 'expanded' : ''}">
        <div class="gen-card-head" ${!locked ? `data-gact="toggle:${gk}" style="cursor:pointer;"` : ''}>
          <div class="gen-avatar">
            ${GB_ICON.icon(locked ? 'mdi-lock' : gen.icon, 28)}
          </div>
          <div class="gen-info">
            <div class="gen-name">${gen.name}</div>
            ${locked
              ? `<div class="gen-lock-hint">${unlockHint}</div>`
              : `<div class="gen-sub">完成 ${doneQuests}/${totalQuests} · 已解锁 ${unlockedCount}/${totalQuests}</div>`
            }
          </div>
          ${!locked ? `<div class="gen-arrow">${GB_ICON.icon(expanded ? 'mdi-chevron-up' : 'mdi-chevron-down', 20)}</div>` : ''}
        </div>
        ${!locked && expanded && (questsHtml || lockedHintHtml || loreHtml) ? `
          <div class="gen-card-body">${loreHtml}${questsHtml}${lockedHintHtml}</div>
        ` : ''}
      </div>`;
  },

  renderTask(task, idx) {
    // 获取当前值
    const current = this._getTaskCurrent(task);
    const target = task.value;
    const done = this._checkTaskRaw(task);
    const isBool = typeof current === 'boolean';

    // 进度计算
    let pct = 0;
    if (isBool) {
      pct = done ? 100 : 0;
    } else if (typeof current === 'number' && typeof target === 'number' && target !== 0) {
      pct = Math.min(100, Math.max(0, (current / target) * 100));
    }

    // 任务描述
    const desc = this._taskDesc(task);
    const op = task.op || (task.operator || '==');

    return `
      <div class="gen-task ${done ? 'done' : ''} ${isBool ? 'bool-task' : ''}">
        <div class="gen-task-left">
          <span class="gen-task-status">${done
            ? GB_ICON.icon('mdi-check-circle', 16)
            : GB_ICON.icon('mdi-circle-outline', 16)}</span>
          <span class="gen-task-desc">${desc}</span>
        </div>
        <div class="gen-task-right">
          ${isBool
            ? `<span class="gen-task-bool ${done ? 'yes' : 'no'}">${done ? '已达成' : '未达成'}</span>`
            : `<span class="gen-task-val">${formatNum(current || 0)} ${this._opSymbol(op)} ${formatNum(target || 0)}</span>`
          }
          ${!isBool ? `<div class="gen-task-mini-bar"><div class="gen-task-mini-fill" style="width:${pct}%;"></div></div>` : ''}
        </div>
      </div>`;
  },

  /* 仙尊 rewardConfig → 货币展示元数据 */
  _curMeta(key) {
    const map = {
      'dao_chiyuan':   { name: '赤元',     color: '#ef4444', icon: 'mdi-rhombus' },
      'dao_qingyuan':  { name: '青元',     color: '#22c55e', icon: 'mdi-hexagon' },
      'dao_hunyuan':   { name: '混元',     color: '#06b6d4', icon: 'mdi-diamond' },
      'rel_power':     { name: '灵宝之力', color: '#f59e0b', icon: 'mdi-battery-high' },
      'xq_fragment':   { name: '灵玉',     color: '#f59e0b', icon: 'mdi-shimmer' },
      'gem_emerald':   { name: '翡翠',     color: '#10b981', icon: 'mdi-diamond-stone' },
      'gem_ruby':      { name: '红宝石',   color: '#ef4444', icon: 'mdi-diamond-stone' },
      'gem_sapphire':  { name: '蓝宝石',   color: '#3b82f6', icon: 'mdi-diamond-stone' },
      'gem_topaz':     { name: '黄玉',     color: '#f59e0b', icon: 'mdi-diamond-stone' },
    };
    return map[key] || { name: key, color: '#94a3b8', icon: 'mdi-circle' };
  },

  renderReward(reward, gk) {
    if (!reward) return '';
    const basePoints = reward.merit || reward.points || 0;
    const rcfg = (typeof GEN_REWARD_CONFIG !== 'undefined') ? GEN_REWARD_CONFIG[gk] : null;
    const parts = [];
    if (rcfg && basePoints > 0) {
      if (rcfg.primary) {
        const amt = Math.max(rcfg.primary.min || 1, Math.floor(basePoints * (rcfg.primary.mult || 0.2)));
        const m = this._curMeta(rcfg.primary.key);
        parts.push(`<span style="color:${m.color};">${GB_ICON.icon(m.icon, 12)} ${m.name} +${formatNum(amt)}</span>`);
      }
      if (rcfg.secondary) {
        const amt = Math.max(rcfg.secondary.min || 1, Math.floor(basePoints * (rcfg.secondary.mult || 0.2)));
        const m = this._curMeta(rcfg.secondary.key);
        parts.push(`<span style="color:${m.color};opacity:.7;">+${m.name} +${formatNum(amt)}</span>`);
      }
      if (rcfg.rare && basePoints >= 100) {
        const m = this._curMeta(rcfg.rare.key);
        parts.push(`<span style="color:${m.color};">✨ ${m.name} +1</span>`);
      }
    } else {
      parts.push(`基础点数 ${formatNum(basePoints)}`);
    }
    return parts.join(' ');
  },

  /* ---------- 工具方法 ---------- */

  _getTaskCurrent(task) {
    if (task.type === 'unlock') {
      if (typeof GB_UNLOCK !== 'undefined') return GB_UNLOCK.isUnlocked(task.name);
      return false;
    }
    if (task.type === 'stat') {
      if (typeof GB_MODULES !== 'undefined') {
        const mod = GB_MODULES._byPrefix[task.feature];
        if (mod && mod.core && mod.core.STAT && mod.core.STAT.values) {
          const statItem = mod.core.STAT.values[task.name];
          if (statItem) {
            if (typeof statItem === 'number') return statItem;
            return statItem.total !== undefined ? statItem.total : (statItem.value !== undefined ? statItem.value : 0);
          }
        }
      }
      return 0;
    }
    return false;
  },

  _checkTaskRaw(task) {
    if (typeof GEN_MODULE.checkTask === 'function') {
      return GEN_MODULE.checkTask(task);
    }
    // fallback: 本地实现
    const current = this._getTaskCurrent(task);
    const op = task.op || (task.operator || '==');
    const value = task.value;
    switch (op) {
      case '>=': return (current || 0) >= value;
      case '>':  return (current || 0) > value;
      case '<=': return (current || 0) <= value;
      case '<':  return (current || 0) < value;
      case '==': return current === value;
      default:   return !!current === !!value;
    }
  },

  _taskDesc(task) {
    if (task.type === 'unlock') {
      const names = {
        daoFeature: '大道法则', villFeature: '宗门', lmFeature: '灵脉',
        faFeature: '灵植园', hoFeature: '降妖', ruFeature: '秘境',
        scFeature: '藏经阁', generalFeature: '圣人指引', xianqiFeature: '仙器',
        lingbaoFeature: '先天灵宝', relicFeature: '先天灵宝',
        daoGemDiamondSubfeature: '大道法则·混元进度',
        generalOppenschroeSubfeature: '太上老君',
        generalBelluxSubfeature: '接引道人',
        generalOnocluaSubfeature: '准提道人',
        generalOmnisolixSubfeature: '瑶池圣母',
        generalOrladeeSubfeature: '通天教主',
        hordeAreaMonkeyJungle: '降妖·蛮荒之地',
      };
      const n = names[task.name] || task.name;
      return `解锁【${n}】`;
    }
    if (task.type === 'stat') {
      const statNames = {
        // 灵脉 lm
        lm_maxDepth0: '灵脉最大深度',
        lm_maxDepth1: '灵脉·副脉最大深度',
        // 宗门 vill
        village_maxBuilding: '宗门建筑总量',
        village_maxHousing: '宗门住房总量',
        vill_stone: '灵石',
        vill_marble: '玄玉',
        vill_gem: '灵玉',
        vill_offeringMax: '供奉累计',
        vill_joyMax: '气运累计',
        // 降妖 horde
        horde_maxZone: '降妖最高层数',
        horde_maxZoneTotal: '降妖累计最高层数',
        horde_soulCorrupted: '堕魂',
        horde_bone: '妖骨',
        horde_monsterPart: '妖核',
        horde_mysticalShard: '神秘碎片',
        horde_maxMastery: '单装最高精通',
        horde_totalMastery: '装备精通总和',
        horde_maxItems: '同时装备件数',
        horde_blood: '妖血',
        // 藏经阁 school
        school_totalPoints: '藏经阁总积分',
        school_goldenDust: '藏经阁·金尘上限',
        // 大道 dao
        dao_totalChiyuan: '赤元',
        dao_totalQingyuan: '青元',
        dao_totalZiyuan: '紫元',
        dao_totalXuanyuan: '玄元',
        dao_totalHuangyuan: '黄元',
        dao_totalHunyuan: '混元',
        dao_totalDaoyuan: '道元',
        // 灵植 farm
        farm_flower: '灵花',
        farm_vegetable: '灵蔬',
        farm_gold: '灵金',
        farm_cropLevel_0: '灵植最高等级',
        farm_bestPrestige: '灵植最高声望',
        farm_maxOvergrow: '最大密植度',
        farm_bugMax: '灵虫最高',
        farm_butterflyMax: '灵蝶最高',
        farm_ladybugMax: '瓢虫最高',
        farm_petalMax: '花瓣最高',
        // 秘境 ruin
        ru_maxDepth: '秘境最大深度',
        ruin_playTime: '秘境探索时间',
      };
      let n = statNames[task.name] || task.name;
      const st = task.subtype;
      if (st === 'max') n = `单次${n}`;
      else if (st === 'total') n = `累计${n}`;
      return `${n}`;
    }
    if (task.type === 'upgrade') {
      const names = {
        lm_graniteHardening: '灵脉·花岗岩强化',
        lm_titaniumCache: '灵脉·钛合金储备',
        lm_platinumExpansion: '灵脉·铂金扩展',
        lm_iridiumCache: '灵脉·铱储备',
        lm_aluminiumExpansion: '灵脉·铝扩展',
        lm_copperExpansion: '灵脉·铜扩展',
        vill_cultivationHall: '宗门·修炼堂',
        vill_bookHall: '宗门·藏经阁',
        vill_taxOffice: '宗门·税署',
        vill_darkCult: '宗门·暗堂',
        vill_awareness: '宗门·天眼雷达',
        vill_marbleStatue: '宗门·玄玉像',
        vill_trophyCase: '宗门·勋章柜',
        vill_gemBin: '宗门·灵玉仓',
        vill_theater: '宗门·戏班',
        vill_garden: '宗门·花园',
        vill_lake: '宗门·灵湖',
        vill_greenhouse: '宗门·温室',
        vill_waterTower: '宗门·水塔',
        farm_seedBox: '灵植·种子盒',
      };
      const n = names[task.name] || task.name;
      return `升级【${n}】`;
    }
  },

  _opSymbol(op) {
    const m = { '>=': '≥', '>': '>', '<=': '≤', '<': '<', '==': '=' };
    return m[op] || op;
  },

  _getSubfeatureThreshold(key) {
    if (typeof GB_META === 'undefined') return null;
    return GB_META.SUBFEATURE_THRESHOLDS[key] || GB_META.UNLOCK_THRESHOLDS[key] || null;
  },
};

if (typeof window !== 'undefined') window.GB_GEN_VIEW = GB_GEN_VIEW;
