/* ============================================================
 * dao_data.js — 大道法则模块数据表
 *
 * 精确对标 gooboo：src/js/modules/gem.js + gem/forge.js + gem/relic.js
 * + src/js/modules/achievement/relic.js（redCard / briefcase）
 *
 * 内容：
 *   1. PREMIUM_UPGRADES —— 仅 1 个（gooboo gem 也只有 1 个）
 *   2. FORGE_DEFS       —— 9 个（对齐 gooboo forge.js 全部）
 *   3. FORGE_RELICS     —— 8 个跨界神器效果
 *
 * 修仙化命名：
 *   diamondPickaxe → 混元凿    (灵脉)
 *   diamondHammer  → 混元锤    (宗门)
 *   diamondSword   → 混元剑    (降妖)
 *   diamondShovel  → 混元铲    (灵植园)
 *   diamondBrush   → 混元符    (秘境·原 gallery→ruin)
 *   diamondPillar  → 混元柱    (灵宝)
 *   redCard        → 降妖令    (原 achievement 的 relic)
 *   briefcase      → 乾坤袋    (原 achievement 的 relic)
 *
 * 升级原则（对齐 gooboo）：
 *   gem 模块自己只提供 1 个 premium（topazBag→黄元袋）
 *   速度/容量加成主要靠 globalLevel 自动增长（每级 +1% 主速度）
 *   gem 的 forge 入口可以升级其他模块的 relic（redCard/briefcase）
 *
 * 加载时机：dao_core.js 之后
 * ============================================================ */
var DAO_DATA = {

  /* ============================================================
   * 1. PREMIUM_UPGRADES —— 对齐 gooboo gem.js upgrade（仅 1 个）
   * ============================================================ */
  PREMIUM_UPGRADES: {
    /* 黄元袋容量（gooboo: topazBag）
       gooboo 原版：
         topazBag: {
           requirement() { return store.state.unlock.eventFeature.see; },
           price(lvl) { return {gem_ruby: [2,3][lvl%2] * 2^floor(lvl/2) * 100}; },
           effect: [{name: 'currencyGemTopazCap', type: 'base', value: lvl => lvl * 200}]
         }
       修仙化：eventFeature（活动系统）我们没有，改为默认解锁（true） */
    huangyuanBag: {
      type: 'premium',
      cap: null,
      requirement() { return true; },
      price(lvl) {
        var rubyMult = lvl % 2 === 0 ? 2 : 3;
        return { dao_chiyuan: rubyMult * Math.pow(2, Math.floor(lvl / 2)) * 100 };
      },
      effect: [
        { name: 'currencyDaoHuangyuanCap', type: 'base', value: function(lvl) { return lvl * 200; } },
      ],
    },
  },

  /* ============================================================
   * 2. FORGE_DEFS —— 9 个锻造入口（精确对齐 gooboo gem/forge.js）
   * ============================================================ */
  FORGE_DEFS: {
    /* 8 个可直接购买的跨界神器（用混元直接入手 level 1） */
    hunyuanPickaxe: { relic: 'hunyuanPickaxe', price: 50 },
    hunyuanHammer:  { relic: 'hunyuanHammer',  price: 50 },
    hunyuanSword:   { relic: 'hunyuanSword',   price: 50 },
    hunyuanShovel:  { relic: 'hunyuanShovel',  price: 50 },
    hunyuanTalisman:{ relic: 'hunyuanTalisman',price: 50 },
    hunyuanPillar_0:{ relic: 'hunyuanPillar',  price: 40 },
    xiangyaoLing_0: { relic: 'xiangyaoLing',  price: 10 },
    qiankunDai_0:   { relic: 'qiankunDai',    price: 35 },

    /* 混元柱升级（need pedestal0>=2） */
    hunyuanPillar_1: {
      relic: 'hunyuanPillar',
      condition: function() {
        if (typeof DAO_MULT === 'undefined') return true;
        return DAO_MULT.get('relicPedestal0') >= 2;
      },
      type: 'upgrade', upgradeLevel: 1, price: 100,
    },

    /* 降妖令升级 Lv1→Lv2（gooboo: redCard_1） */
    xiangyaoLing_1: {
      relic: 'xiangyaoLing',
      type: 'upgrade', upgradeLevel: 1, price: 10,
    },

    /* 乾坤袋升级 Lv1→Lv2（gooboo: briefcase_1） */
    qiankunDai_1: {
      relic: 'qiankunDai',
      type: 'upgrade', upgradeLevel: 1, price: 35,
    },
  },

  /* ============================================================
   * 3. FORGE_RELICS —— 8 个跨界神器效果
   *    前 6 个对应 gooboo gem/relic.js
   *    后 2 个对应 gooboo achievement/relic.js 的 redCard + briefcase
   *
   * 效果 key 前缀映射（gooboo → 修仙版）：
   *   mining  → lm       灵脉
   *   village → village  宗门
   *   horde   → horde    降妖
   *   farm    → fa       灵植园
   *   gallery → ruin     秘境（用户要求替换）
   *   relic   → relic    先天灵宝
   *   treasure→ treasure 灵宝袋（乾坤袋）
   * ============================================================ */
  FORGE_RELICS: {

    /* 混元凿 diamondPickaxe */
    hunyuanPickaxe: {
      icon: 'mdi-pickaxe', color: '#06b6d4', feature: 'lm',
      effect: function(level) {
        return [
          { name: 'lmPremiumOreCap', type: 'base', value: 1 },
          { name: 'lmDamage', type: 'mult', value: 1.5 },
        ];
      },
    },

    /* 混元锤 diamondHammer */
    hunyuanHammer: {
      icon: 'mdi-hammer', color: '#06b6d4', feature: 'village',
      effect: function(level) {
        return [
          { name: 'villagePremiumResourceCap', type: 'base', value: 1 },
          { name: 'queueSpeedVillageBuilding', type: 'mult', value: 1.5 },
        ];
      },
    },

    /* 混元剑 diamondSword */
    hunyuanSword: {
      icon: 'mdi-sword', color: '#06b6d4', feature: 'horde',
      effect: function(level) {
        return [
          { name: 'hordePremiumAncientCap', type: 'base', value: 1 },
          { name: 'hordeAttack', type: 'mult', value: 1.35 },
          { name: 'hordeHealth', type: 'mult', value: 1.35 },
        ];
      },
    },

    /* 混元铲 diamondShovel */
    hunyuanShovel: {
      icon: 'mdi-shovel', color: '#06b6d4', feature: 'fa',
      effect: function(level) {
        return [
          { name: 'faCropGain', type: 'mult', value: 1.5 },
        ];
      },
    },

    /* 混元符 diamondBrush —— gallery→ruin（秘境） */
    hunyuanTalisman: {
      icon: 'mdi-brush', color: '#06b6d4', feature: 'ruin',
      effect: function(level) {
        return [
          { name: 'ruinPremiumArtifactCap', type: 'base', value: 1 },
          { name: 'currencyRuinRelicGain', type: 'mult', value: 2.5 },
        ];
      },
    },

    /* 混元柱 diamondPillar */
    hunyuanPillar: {
      icon: 'mdi-pillar', color: '#06b6d4', feature: 'relic',
      effect: function(level) {
        return [
          { name: 'relicPedestal1', type: 'base', value: level },
        ];
      },
    },

    /* 降妖令 redCard —— achievement module 的 relic，gem 模块提供升级入口
       gooboo:
         redCard.effect(1) = [hordeMonsterPartCap bonus 1e4, hordeCardCap base 1]
         redCard.effect(2) = [hordeMonsterPartCap bonus 1e12, hordeCardCap base 1]
       修仙化：降级条件 —— 只给 hordeMonsterPartCap（降妖材料上限）+ hordeCardCap（降妖令上限） */
    xiangyaoLing: {
      icon: 'mdi-cards', color: '#ef4444', feature: 'horde',
      effect: function(level) {
        if (level >= 2) {
          return [
            { name: 'currencyHordeMonsterPartCap', type: 'bonus', value: 1e12 },
            { name: 'hordeCardCap', type: 'base', value: 1 },
          ];
        }
        return [
          { name: 'currencyHordeMonsterPartCap', type: 'bonus', value: 1e4 },
          { name: 'hordeCardCap', type: 'base', value: 1 },
        ];
      },
    },

    /* 乾坤袋 briefcase —— achievement module 的 relic，gem 模块提供升级入口
       gooboo:
         briefcase.effect(1) = [treasureSlots base 8]
         briefcase.effect(2) = [treasureSlots base 12]
       修仙化：treasureSlots → 灵宝槽位 */
    qiankunDai: {
      icon: 'mdi-briefcase', color: '#60a5fa', feature: 'treasure',
      effect: function(level) {
        if (level >= 2) {
          return [ { name: 'treasureSlots', type: 'base', value: 12 } ];
        }
        return [ { name: 'treasureSlots', type: 'base', value: 8 } ];
      },
    },
  },
};

/* ============================================================
 * 模块初始化：注册升级 + 锻造定义到 core
 * ============================================================ */
(function initDaoData() {
  function doInit() {
    DAO_UPG.register(DAO_DATA.PREMIUM_UPGRADES, 'premium');
    DAO_FORGE.init(DAO_DATA.FORGE_DEFS);
    console.log('[DAO_DATA] premium 升级:', Object.keys(DAO_DATA.PREMIUM_UPGRADES).length,
                '锻造入口:', Object.keys(DAO_DATA.FORGE_DEFS).length,
                '跨界神器:', Object.keys(DAO_DATA.FORGE_RELICS).length);
  }
  function tryInit() {
    if (typeof DAO_UPG !== 'undefined' && typeof DAO_FORGE !== 'undefined') doInit();
    else setTimeout(tryInit, 50);
  }
  if (typeof DAO_UPG !== 'undefined' && typeof DAO_FORGE !== 'undefined') doInit();
  else tryInit();
})();

if (typeof window !== 'undefined') window.DAO_DATA = DAO_DATA;
