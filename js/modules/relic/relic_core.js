/* ============================================================
 * relic_core.js — 先天灵宝模块（relicFeature 修仙化移植）
 *
 * 核心机制（对齐 gooboo src/js/modules/relic.js）：
 *   tick 速度 = 1（每秒 tick）
 *   tick 做两件事：
 *     1. 每秒产 灵宝之力(power) = mult * seconds / 3600（每小时产）
 *     2. 扫符文(glyph) progress → 接近满了就推进
 *
 * 修仙化命名：
 *   relic → 先天灵宝
 *   power → 灵宝之力
 *   glyph → 符文印记
 *   pedestal → 灵宝殿展示位
 *
 * 解锁条件：lingbaoFeature（globalLevel >= 40）
 * ============================================================ */

const REL_SECONDS_PER_HOUR = 3600;

// ======= 符文印记定义（最小集，后续可以扩充） =======
const REL_GLYPHS = {
  tianyi: {    // 天乙符文
    name: '天乙', icon: 'mdi-yin-yang',
    max: 5, speed: 2,
    desc: '提升所有模块 tick 速度',
  },
  zhuque: {    // 朱雀符文
    name: '朱雀', icon: 'mdi-fire',
    max: 10, speed: 1,
    desc: '提升灵脉火属性伤害',
  },
  qinglong: {  // 青龙符文
    name: '青龙', icon: 'mdi-leaf',
    max: 10, speed: 1,
    desc: '提升灵木产率',
  },
};

// ======= 灵宝（静态物品）定义 =======
const REL_ITEMS = {
  // 解锁时自带的一批灵宝
  taiji: { name: '太极图', icon: 'mdi-circle-double', tier: 0 },
  bafang: { name: '八卦镜', icon: 'mdi-camera-flip', tier: 1 },
  jiuzhuan: { name: '九转鼎', icon: 'mdi-fire-circle', tier: 2 },
};

// ======= 货币：灵宝之力 =======
const REL_CURDATA = {
  power: {
    name: '灵宝之力', color: '#f59e0b', icon: 'mdi-battery-high', display: 'int',
    gainMult: { baseValue: 2 },
    capMult: { round: true, baseValue: 50 },
  },
};

// ======= 模块自带 MULT =======
const REL_MULT = { values: {} };
REL_MULT.init = function(name, def) {
  if (!REL_MULT.values[name]) REL_MULT.values[name] = { base: def.baseValue || 1, mult: 1, bonus: 0, round: def.round };
};
REL_MULT.get = function(name) {
  const v = REL_MULT.values[name]; if (!v) return 1;
  const r = v.base * v.mult + v.bonus; return v.round ? Math.round(r) : r;
};
REL_MULT.setMult = function(o) { if (!REL_MULT.values[o.name]) REL_MULT.init(o.name, {}); REL_MULT.values[o.name].mult = o.value; };
REL_MULT.setBase = function(o) { if (!REL_MULT.values[o.name]) REL_MULT.init(o.name, {}); REL_MULT.values[o.name].base = o.value; };
REL_MULT.setBonus = function(o) { if (!REL_MULT.values[o.name]) REL_MULT.init(o.name, {}); REL_MULT.values[o.name].bonus = o.value; };
REL_MULT.removeKeyAnywhere = function() {};

// ======= 模块自带 CUR =======
const REL_CUR = { defs: {}, values: {}, _suffix(k) { return k.split('_').slice(1).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(''); } };
REL_CUR.init = function(key, def) {
  def = def || {}; def.key = key;
  REL_CUR.defs[key] = def;
  if (REL_CUR.values[key] === undefined) REL_CUR.values[key] = def.value || 0;
  const sf = REL_CUR._suffix(key);
  REL_MULT.init('currencyRel' + sf + 'Gain', Object.assign({ feature: 'relic' }, def.gainMult || {}));
  REL_MULT.init('currencyRel' + sf + 'Cap', Object.assign({ feature: 'relic' }, def.capMult || {}));
};
REL_CUR.value = function(key) { return REL_CUR.values[key] || 0; };
REL_CUR.cap = function(key) {
  const def = REL_CUR.defs[key]; if (!def) return 0;
  const capMultName = 'currencyRel' + REL_CUR._suffix(key) + 'Cap';
  if (!def.capMult) return Infinity; return REL_MULT.get(capMultName);
};
REL_CUR.add = function(key, amount) {
  if (!REL_CUR.defs[key]) return;
  const cap = REL_CUR.cap(key);
  let v = REL_CUR.value(key) + amount;
  if (v < 0) v = 0;
  if (isFinite(cap)) v = Math.min(v, Math.max(cap, REL_CUR.value(key)));
  REL_CUR.values[key] = v;
};
REL_CUR.spend = function(key, amount) {
  if (REL_CUR.value(key) < amount) return false;
  REL_CUR.values[key] -= amount; return true;
};

for (const k in REL_CURDATA) REL_CUR.init('rel_' + k, Object.assign({ feature: 'relic' }, REL_CURDATA[k]));

// ======= glyph 时间需求（gooboo 公式简化） =======
function glyphTimeNeeded(progress, max, speed) {
  // 简化版：每级需要 max * 10 / speed 秒
  return Math.max(1, Math.abs(speed) > 0 ? max * 10 / speed : 10);
}

// ======= 核心状态 =======
const REL_STATE = {
  glyph: {},     // { tianyi: { progress: 0 }, ... }
  item: {},      // { taiji: { found: true, level: 1 }, ... }
  pedestal: [],  // 展示槽位（预留）
};

// 初始化 glyph
for (const k in REL_GLYPHS) {
  REL_STATE.glyph[k] = { progress: 0 };
}
// 初始化 items（found=false）
for (const k in REL_ITEMS) {
  REL_STATE.item[k] = { found: false, level: 1 };
}

// ======= 先天灵宝核心模块 =======
const REL_MODULE = {
  name: 'relic',
  keyPrefix: 'rel',
  feature: 'relic',

  CUR: REL_CUR,
  MULT: REL_MULT,
  STATE: REL_STATE,
  GLYPHS: REL_GLYPHS,
  ITEMS: REL_ITEMS,

  STAT: { values: {
    rel_totalPowerGained: { value: 0 },
    rel_totalGlyphLevel: { value: 0 },
    rel_itemsFound: { value: 0 },
  }},

  /* tick —— 产灵宝之力 + 推进符文 */
  RT: {
    tick(seconds) {
      if (seconds <= 0) return;

      // 1. 产灵宝之力
      const mult = REL_MULT.get('currencyRelPowerGain');
      const gain = mult * seconds / REL_SECONDS_PER_HOUR;
      REL_CUR.add('rel_power', gain);
      REL_MODULE.STAT.values.rel_totalPowerGained.value += gain;

      // 2. 推进符文进度
      for (const gKey in REL_STATE.glyph) {
        const glyph = REL_GLYPHS[gKey];
        if (!glyph) continue;
        const g = REL_STATE.glyph[gKey];
        const max = glyph.max;
        const floorProg = Math.floor(g.progress);
        if (floorProg >= max) continue;

        let amountLeft = seconds;
        let oldFloor = Math.floor(g.progress);
        let newProgress = g.progress;
        while (amountLeft > 0) {
          const levelDiff = max - Math.floor(newProgress);
          if (levelDiff <= 0) break;
          const difficulty = glyphTimeNeeded(Math.floor(newProgress), glyph.max, glyph.speed);
          const amountUsed = Math.min((Math.floor(newProgress + 1) - newProgress) * difficulty, amountLeft);
          newProgress += amountUsed / difficulty;
          amountLeft -= amountUsed;
        }
        REL_STATE.glyph[gKey].progress = newProgress;
        // 统计
        if (Math.floor(newProgress) > oldFloor) {
          REL_MODULE.STAT.values.rel_totalGlyphLevel.value += Math.floor(newProgress) - oldFloor;
        }
      }
    },
  },

  // ======= API =======
  // 发现灵宝
  find(key) {
    if (!REL_STATE.item[key]) return false;
    if (REL_STATE.item[key].found) return false;
    REL_STATE.item[key].found = true;
    REL_MODULE.STAT.values.rel_itemsFound.value++;
    if (typeof GB_UNLOCK !== 'undefined' && typeof GB_APP !== 'undefined') {
      const name = REL_ITEMS[key].name || key;
      GB_APP.toast(`发现先天灵宝：${name}！`, '#a855f7');
    }
    return true;
  },

  // 升级灵宝（用灵宝之力）
  upgradeItem(key, cost) {
    if (!REL_STATE.item[key] || !REL_STATE.item[key].found) return false;
    if (!REL_CUR.spend('rel_power', cost)) return false;
    REL_STATE.item[key].level++;
    return true;
  },

  // ======= 存档钩子 =======
  snapshot() {
    const obj = { owned: [], glyph: {} };
    for (const k in REL_STATE.item) {
      if (REL_STATE.item[k].found) obj.owned.push(k);
      if (REL_STATE.item[k].level > 1) {
        if (!obj.level) obj.level = {};
        obj.level[k] = REL_STATE.item[k].level;
      }
    }
    for (const k in REL_STATE.glyph) {
      if (REL_STATE.glyph[k].progress > 0) obj.glyph[k] = REL_STATE.glyph[k].progress;
    }
    return obj;
  },
  restore(data) {
    if (!data) return;
    if (data.owned) {
      data.owned.forEach(k => {
        if (REL_STATE.item[k]) {
          REL_STATE.item[k].found = true;
          REL_MODULE.STAT.values.rel_itemsFound.value++;
        }
      });
    }
    if (data.level) {
      for (const k in data.level) {
        if (REL_STATE.item[k]) REL_STATE.item[k].level = data.level[k];
      }
    }
    if (data.glyph) {
      for (const k in data.glyph) {
        if (REL_STATE.glyph[k]) REL_STATE.glyph[k].progress = data.glyph[k];
      }
    }
  },
  hardReset() {
    for (const k in REL_STATE.glyph) REL_STATE.glyph[k].progress = 0;
    for (const k in REL_STATE.item) { REL_STATE.item[k].found = false; REL_STATE.item[k].level = 1; }
    for (const k in REL_CURDATA) REL_CUR.values['rel_' + k] = 0;
    REL_MODULE.STAT.values.rel_totalPowerGained.value = 0;
    REL_MODULE.STAT.values.rel_totalGlyphLevel.value = 0;
    REL_MODULE.STAT.values.rel_itemsFound.value = 0;
  },
  onAfterLoad() {},
};

// ======= 派生 multiplier =======
REL_MULT.init('currencyRelPowerGain', { feature: 'relic', baseValue: 2 });
REL_MULT.init('currencyRelPowerCap', { feature: 'relic', round: true, baseValue: 50 });

// ======= 注册 =======
if (typeof GB_MODULES !== 'undefined') {
  GB_MODULES.register({
    id: 'relic', name: '先天灵宝', keyPrefix: 'rel', tickSpeed: 1,
    unlockNeeded: 'lingbaoFeature',   // globalLevel >= 40
    core: REL_MODULE,
  });
}

if (typeof window !== 'undefined') {
  window.REL_MODULE = REL_MODULE;
  window.REL_CUR = REL_CUR;
}
