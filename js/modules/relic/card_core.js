/* ============================================================
 * card_core.js ——「灵宝碎片」核心逻辑
 * 100% 对齐 gooboo src/store/card.js
 *
 * State 结构：
 *   card: { id: { feature, id, group, instant, power, reward, amount, foundShiny, collection, color, icons } }
 *   collection: { name: { name, reward, cards[], cacheCards, cacheShinyCards } }
 *   pack: { name: { feature, price, shinyPrice, unlock, amount, content, cacheWeight, cacheWeightTotal, cacheContent } }
 *   feature: { name: { prefix, reward, shinyReward, powerReward, cardSelected, cardEquipped, cacheCards, cacheShinyCards } }
 *
 * 修仙化：
 *   购买货币 gem_emerald → dao_qingyuan（青元）
 *   闪光货币 card_shinyDust → lingbao_jinghua（灵宝精华）
 * ============================================================ */

const CARD_STATE = {
  card: {},
  collection: {},
  pack: {},
  feature: {},
  // 闪光概率 mult
  shinyChance: 0.015,
};

/* ============ 工具：加权随机选择 ============ */
function weightSelect(weights, rng) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}
function chance(prob, rng) { return rng < prob; }
function rng() { return Math.random(); }

/* ============ init 系列（对齐 store mutations）============ */
function initCard(o) {
  let num = o.id.toString();
  while (num.length < 4) num = '0' + num;
  const prefix = CARD_STATE.feature[o.feature] ? CARD_STATE.feature[o.feature].prefix : '??';
  const id = prefix + '-' + num;
  CARD_STATE.card[id] = {
    feature: o.feature,
    id: o.id,
    group: o.group ?? null,
    instant: o.instant ?? false,
    power: o.power ?? 0,
    reward: o.reward ?? [],
    amount: 0,
    foundShiny: false,
    collection: o.collection,
    color: o.color ?? 'red',
    icons: o.icons ?? [],
  };
  const coll = CARD_STATE.collection[o.collection];
  if (coll) {
    coll.cards.push(id);
  } else {
    // 防御性修复：collection 不存在就自动创建一个
    console.warn('[CARD] collection', o.collection, 'not registered when adding card', id, '. Auto-creating.');
    CARD_STATE.collection[o.collection] = { name: o.collection, reward: [], cards: [id], cacheCards: 0, cacheShinyCards: 0 };
  }
}

function initCollection(o) {
  // collectionKey 是 map key（英文），displayName 是中文名（可选）
  const collectionKey = o.collectionKey || o.name; // 兼容旧调用方式
  const displayName = o.displayName || o.name;
  CARD_STATE.collection[collectionKey] = {
    key: collectionKey,
    name: displayName,
    reward: o.reward ?? [],
    cards: [],
    cacheCards: 0,
    cacheShinyCards: 0,
  };
}

function initPack(o) {
  let cacheWeight = [];
  let cacheContent = [];
  for (const [key, elem] of Object.entries(o.content)) {
    cacheWeight.push(elem);
    cacheContent.push(key);
  }
  const amount = o.amount ?? 1;
  const shinyPrice = (o.price !== null && o.price !== undefined) ? Math.ceil(10 * o.price / amount) : null;
  CARD_STATE.pack[o.name] = {
    feature: o.feature ?? null,
    price: o.price ?? null,
    shinyPrice,
    unlock: o.unlock ?? null,
    amount,
    content: o.content,
    cacheWeight,
    cacheWeightTotal: cacheWeight.reduce((a, b) => a + b),
    cacheContent,
  };
}

function initFeature(o) {
  CARD_STATE.feature[o.name] = {
    prefix: o.prefix,
    reward: o.reward ?? [],
    shinyReward: o.shinyReward ?? [],
    powerReward: o.powerReward ?? [],
    cardSelected: [],
    cardEquipped: [],
    cacheCards: 0,
    cacheShinyCards: 0,
  };
}

/* ============ 跨模块效果应用（严格对齐 treasure_core effectKeyToModuleKey 模式） ============ */
const CARD_EFFECTS = {}; // { multKey: { name, type, value } }

// 和 treasure_core.js 的 effectKeyToModuleKey 完全一致
function cardEffectKeyToModuleKey(effectKey) {
  let k = effectKey;
  if (k.indexOf('currencyMining') === 0) k = 'currencyLm' + k.slice('currencyMining'.length);
  else if (k.indexOf('mining') === 0) k = 'lm' + k.slice('mining'.length);
  return k;
}

function applyEffect(eff, trigger) {
  // eff: { type, name, multKey, value, trigger }
  CARD_EFFECTS[eff.multKey] = { name: eff.name, type: eff.type, value: eff.value };
  // relic 自身 mult 直接写 REL_MULT
  if (typeof REL_MULT !== 'undefined' && REL_MULT.values && (eff.name.startsWith('currencyRelic') || eff.name.startsWith('relic'))) {
    if (eff.type === 'mult') { if (typeof REL_MULT.setMult === 'function') REL_MULT.setMult({ name: eff.name, key: eff.multKey, value: eff.value }); }
    else if (eff.type === 'base') { if (typeof REL_MULT.setBase === 'function') REL_MULT.setBase({ name: eff.name, key: eff.multKey, value: eff.value }); }
  }
  // 跨模块：先映射 effectKey → moduleKey，再通过 GB_MODULES 路由
  if (typeof GB_MODULES !== 'undefined') {
    const feature = cardEffectNameToFeature(eff.name);
    if (feature) {
      const moduleMultKey = cardEffectKeyToModuleKey(eff.name);
      if (eff.type === 'mult') {
        if (typeof GB_MODULES.multSetMult === 'function') GB_MODULES.multSetMult({ feature, name: moduleMultKey, key: eff.multKey, value: eff.value });
      } else if (eff.type === 'base') {
        if (typeof GB_MODULES.multSetBase === 'function') GB_MODULES.multSetBase({ feature, name: moduleMultKey, key: eff.multKey, value: eff.value });
      }
    }
  }
}
function resetEffect(eff) {
  delete CARD_EFFECTS[eff.multKey];
  if (typeof REL_MULT !== 'undefined' && REL_MULT.values && (eff.name.startsWith('currencyRelic') || eff.name.startsWith('relic'))) {
    if (typeof REL_MULT.resetKey === 'function') REL_MULT.resetKey(eff.multKey);
  }
  if (typeof GB_MODULES !== 'undefined') {
    const feature = cardEffectNameToFeature(eff.name);
    if (feature) {
      const moduleMultKey = cardEffectKeyToModuleKey(eff.name);
      if (typeof GB_MODULES.multRemoveKey === 'function') GB_MODULES.multRemoveKey({ feature, name: moduleMultKey });
    }
  }
}

function cardEffectNameToFeature(name) {
  if (name.startsWith('currencyMining') || name.startsWith('mining')) return 'mining';
  if (name.startsWith('currencyVillage') || name.startsWith('village') || name.startsWith('queueSpeedVillage')) return 'village';
  if (name.startsWith('currencyHorde') || name.startsWith('horde')) return 'horde';
  if (name.startsWith('currencyFarm') || name.startsWith('farm')) return 'farm';
  if (name.startsWith('currencySchool') || name.startsWith('school')) return 'school';
  if (name.startsWith('currencyGallery') || name.startsWith('gallery')) return 'gallery';
  if (name.startsWith('currencyTreasure') || name.startsWith('treasure')) return 'treasure';
  if (name.startsWith('currencyDao') || name.startsWith('dao') || name.startsWith('currencyGem') || name.startsWith('gem')) return 'dao';
  if (name.startsWith('currencyRelic') || name.startsWith('relic')) return 'relic';
  return null;
}

/* ============ 外部可读 API ============ */
function getCardMult(name, fallback) {
  // 把 CARD_EFFECTS 里所有同 name 的 mult/base 累加
  let mult = 1, base = 0;
  for (const mk in CARD_EFFECTS) {
    const e = CARD_EFFECTS[mk];
    if (e.name === name) {
      if (e.type === 'mult') mult *= e.value;
      else base += e.value;
    }
  }
  if (base !== 0) return base;
  if (mult !== 1) return mult;
  return fallback !== undefined ? fallback : 1;
}

/* ============ 主流程（对齐 store actions）============ */
function calculateCaches() {
  // 重置缓存
  for (const key in CARD_STATE.collection) {
    CARD_STATE.collection[key].cacheCards = 0;
    CARD_STATE.collection[key].cacheShinyCards = 0;
  }
  for (const key in CARD_STATE.feature) {
    CARD_STATE.feature[key].cacheCards = 0;
    CARD_STATE.feature[key].cacheShinyCards = 0;
  }
  // 统计
  for (const [, elem] of Object.entries(CARD_STATE.card)) {
    if (elem.amount > 0) {
      CARD_STATE.collection[elem.collection].cacheCards++;
      CARD_STATE.feature[elem.feature].cacheCards++;
    }
    if (elem.foundShiny) {
      CARD_STATE.collection[elem.collection].cacheShinyCards++;
      CARD_STATE.feature[elem.feature].cacheShinyCards++;
    }
  }
  // 应用收藏奖励 / feature 奖励
  for (const [collKey, collElem] of Object.entries(CARD_STATE.collection)) {
    const mk = `cardCollection_${collKey}`;
    if (collElem.cacheCards >= collElem.cards.length) {
      collElem.reward.forEach(elem => applyEffect({ ...elem, multKey: mk, trigger: false }));
    } else {
      collElem.reward.forEach(elem => resetEffect({ name: elem.name, multKey: mk }));
    }
  }
  for (const [featKey] of Object.entries(CARD_STATE.feature)) {
    applyFeatureEffects(featKey);
  }
}

function applyFeatureEffects(feature) {
  const f = CARD_STATE.feature[feature];
  const mk = `cards_${feature}`;
  if (f.cacheCards > 0) {
    f.reward.forEach(reward => applyEffect({ ...reward, multKey: mk, value: reward.value(f.cacheCards), trigger: true }));
  } else {
    f.reward.forEach(reward => resetEffect({ name: reward.name, multKey: mk }));
  }
  const mkShiny = `cardsShiny_${feature}`;
  if (f.cacheShinyCards > 0) {
    f.shinyReward.forEach(reward => applyEffect({ ...reward, multKey: mkShiny, value: reward.value(f.cacheShinyCards), trigger: true }));
  } else {
    f.shinyReward.forEach(reward => resetEffect({ name: reward.name, multKey: mkShiny }));
  }
}

function gainCard({ name, isShiny, shinyValue }) {
  const card = CARD_STATE.card[name];
  if (!card) {
    console.warn('[CARD] gainCard: card', name, 'not found');
    return false;
  }
  const amount = 1;
  if (card.amount <= 0) {
    const feature = CARD_STATE.feature[card.feature];
    const collection = CARD_STATE.collection[card.collection];
    if (collection) collection.cacheCards++;
    if (feature) feature.cacheCards++;
    applyFeatureEffects(card.feature);
    if (collection && collection.cacheCards >= collection.cards.length) {
      collection.reward.forEach(elem => applyEffect({ ...elem, multKey: `cardCollection_${card.collection}`, trigger: true }));
    }
  }
  // instant 卡重复获得时触发即时效果（修仙版简化：只做 currency gain）
  if (card.amount > 0 && card.instant) {
    card.reward.forEach(eff => {
      if (eff.type === 'currency') {
        if (typeof GB_MODULES !== 'undefined' && GB_MODULES.currencyGain) {
          const feat = eff.name.split('_')[0];
          const cname = eff.name.split('_')[1];
          GB_MODULES.currencyGain({ feature: feat, name: cname, amount: eff.value });
        }
      }
    });
  } else {
    card.amount += amount;
  }
  if (isShiny) {
    if (card.foundShiny) {
      // 已有闪光 → 获得灵宝精华
      CARD_MODULE.addShinyDust(shinyValue ?? 1);
    } else {
      card.foundShiny = true;
      const feature = CARD_STATE.feature[card.feature];
      const collection = CARD_STATE.collection[card.collection];
      collection.cacheShinyCards++;
      feature.cacheShinyCards++;
      applyFeatureEffects(card.feature);
    }
  }
}

function openPack({ name, amount }) {
  const pack = CARD_STATE.pack[name];
  if (!pack) return;
  const shinyValueBase = (pack.price === null || pack.price === undefined) ? 1 : (pack.price / pack.amount);
  for (let i = 0; i < amount; i++) {
    for (let j = 0; j < pack.amount; j++) {
      const cardChosen = pack.cacheContent[weightSelect(pack.cacheWeight, rng())];
      const card = CARD_STATE.card[cardChosen];
      const gotShiny = chance(CARD_STATE.shinyChance, rng());
      gainCard({ name: cardChosen, isShiny: gotShiny, shinyValue: Math.floor(shinyValueBase * (j + 1)) - Math.floor(shinyValueBase * j) });
    }
  }
}

function buyPack({ name, amount }) {
  const pack = CARD_STATE.pack[name];
  if (!pack || pack.price === null) return false;
  const cost = pack.price * amount;
  // 用 dao_qingyuan（青元）支付
  if (typeof DAO_CUR !== 'undefined') {
    if (DAO_CUR.value('dao_qingyuan') < cost) return false;
    DAO_CUR.add('dao_qingyuan', -cost);
  } else {
    return false;
  }
  openPack({ name, amount });
  return true;
}

function buyShinyPack(name) {
  const pack = CARD_STATE.pack[name];
  if (!pack || pack.shinyPrice === null) return false;
  // 必须有未闪光的卡
  let hasNewShiny = false;
  for (const key of Object.keys(pack.content)) {
    if (!CARD_STATE.card[key].foundShiny) { hasNewShiny = true; break; }
  }
  if (!hasNewShiny) return false;
  if (CARD_MODULE.shinyDust() < pack.shinyPrice) return false;
  CARD_MODULE.addShinyDust(-pack.shinyPrice);
  // 保证出一张新闪光
  let candidates = [], weights = [];
  for (const [key, w] of Object.entries(pack.content)) {
    if (!CARD_STATE.card[key].foundShiny) {
      candidates.push(key);
      weights.push(w);
    }
  }
  const cardChosen = candidates[weightSelect(weights, rng())];
  gainCard({ name: cardChosen, isShiny: true });
  return true;
}

function canOpenShinyPack(name) {
  const pack = CARD_STATE.pack[name];
  if (!pack) return false;
  for (const key of Object.keys(pack.content)) {
    if (!CARD_STATE.card[key].foundShiny) return true;
  }
  return false;
}

/* ============ 灵宝精华货币（shinyDust）============ */
const CARD_CUR = {
  shinyDust: 0,
  value() { return this.shinyDust; },
  add(v) { this.shinyDust = Math.max(0, this.shinyDust + v); },
};

/* ============ 初始化（对齐 module init）============ */
function init() {
  for (const [featKey, feature] of Object.entries(CARD_DATA.CARD_FEATURES)) {
    if (feature.feature) initFeature({ name: featKey, ...feature.feature });
    for (const [collKey, elem] of Object.entries(feature.collection)) {
      // collKey 是 map key（英文），elem.name 是中文名（若有）
      const initArg = { collectionKey: collKey, displayName: elem.name || collKey, reward: elem.reward || [] };
      initCollection(initArg);
    }
    for (const [pk, pelem] of Object.entries(feature.pack)) {
      // 先展开 pelem（里面有 content/price/amount 等），再强制用英文 key 作 name
      // 否则 pelem.name（中文显示名）会覆盖 name: pk
      const pArg = { ...pelem, name: pk, displayName: pelem.name || pk, feature: featKey };
      initPack(pArg);
    }
  }
  for (const [featKey, feature] of Object.entries(CARD_DATA.CARD_FEATURES)) {
    if (feature.card) {
      feature.card.forEach(elem => initCard({ feature: featKey, ...elem }));
    }
  }
  calculateCaches();
}

/* ============ 存档 ============ */
function saveGame() {
  let obj = { card: {}, shiny: [], shinyDust: CARD_CUR.shinyDust };
  for (const [key, elem] of Object.entries(CARD_STATE.card)) {
    if (elem.amount > 0) obj.card[key] = elem.amount;
    if (elem.foundShiny) obj.shiny.push(key);
  }
  return obj;
}
function loadGame(data) {
  if (!data) return;
  if (data.card) {
    for (const [key, amt] of Object.entries(data.card)) {
      if (CARD_STATE.card[key]) CARD_STATE.card[key].amount = amt;
    }
  }
  if (data.shiny) {
    data.shiny.forEach(k => { if (CARD_STATE.card[k]) CARD_STATE.card[k].foundShiny = true; });
  }
  if (data.shinyDust !== undefined) CARD_CUR.shinyDust = data.shinyDust;
  calculateCaches();
}

/* ============ 外部 API ============ */
var CARD_MODULE = {
  state: CARD_STATE,
  cur: CARD_CUR,
  init,
  saveGame,
  loadGame,
  calculateCaches,
  gainCard,
  openPack,
  buyPack,
  buyShinyPack,
  canOpenShinyPack,
  applyFeatureEffects,
  getCardMult,
  effects: CARD_EFFECTS,
  shinyDust() { return CARD_CUR.shinyDust; },
  addShinyDust(v) { CARD_CUR.add(v); },

  // ======= 重置 API =======
  // 重设所有卡碎片（用于 relic 模块 hardReset）
  hardReset() {
    for (const k in CARD_STATE.card) {
      CARD_STATE.card[k].amount = 0;
      CARD_STATE.card[k].foundShiny = false;
    }
    CARD_CUR.shinyDust = 0;
    for (const k in CARD_EFFECTS) delete CARD_EFFECTS[k];
    calculateCaches();
  },
  // 按 feature 重置 — 各模块 hardReset 时清掉自己 feature 下的灵宝碎片
  hardResetFeature(featureKey) {
    for (const k in CARD_STATE.card) {
      if (CARD_STATE.card[k].feature === featureKey) {
        CARD_STATE.card[k].amount = 0;
        CARD_STATE.card[k].foundShiny = false;
      }
    }
    calculateCaches();
  },
  // prestige 级的"重置但保留少量碎片"语义（每张已得卡换 1 灵宝精华）
  prestige() {
    let dust = 0;
    for (const k in CARD_STATE.card) {
      const c = CARD_STATE.card[k];
      if (c.amount > 0) { dust += Math.min(c.amount, 1); }
      c.amount = 0;
      c.foundShiny = false;
    }
    CARD_CUR.shinyDust += Math.floor(dust);
    calculateCaches();
    return dust;
  },

  // getter 辅助
  get collection() { return CARD_STATE.collection; },
  get pack() { return CARD_STATE.pack; },
  get feature() { return CARD_STATE.feature; },
  get cards() { return CARD_STATE.card; },
};

if (typeof window !== 'undefined') {
  window.CARD_MODULE = CARD_MODULE;
  window.CARD_STATE = CARD_STATE;
  // 初始化（依赖 CARD_DATA 已加载，card_data.js 在 card_core.js 之前引入）
  init();
}
