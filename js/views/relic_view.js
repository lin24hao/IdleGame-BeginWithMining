/* ============================================================
 * relic_view.js ——「先天灵宝」主视图
 * 100% 对齐 gooboo src/components/view/Relic.vue + 6 个子组件
 *
 *   Relic.vue                → _renderTabs()
 *     ├── RelicList.vue      → _renderRelicList()
 *     │   └── Item.vue × N   → _renderItem()       ← d-flex align-center 行内
 *     └── MuseumTab.vue      → _renderMuseumTab()
 *         ├── RelicPedestal × N  → _renderRelicPedestal()
 *         └── GlyphBar × N       → _renderGlyphBar()
 *
 * 核心规则：
 *   - 所有尺寸/颜色/边框 对齐 gooboo 原版 Vue template
 *   - 用 CSS 类替代 Vuetify，inline style 只用于动态值（颜色/大小）
 *   - 深色主题适配：自动切换 darken-x / lighten-x
 * ============================================================ */

/* ============ 中文名映射 ============ */
const REL_NAMES = {
  taiji: '太极图', bagua: '八卦镜', diamondPillar: '擎天柱', rubyOrb: '红玉珠',
  pickaxe: '灵锄', energyDrink: '续灵丹', torch: '灵焰',
  woodenSword: '木灵剑', watermill: '水车', keychain: '铜钥匙',
  spikeBall: '狼牙钉', dreamCatcher: '梦境网', horseshoe: '马蹄铁',
  goldenCarrot: '金灵果', rainBoots: '雨靴', mushroom: '灵药菇',
  screwdriver: '起子', notebook: '道书', popcorn: '灵花米',
  museumKey: '灵殿钥匙',
};
const REL_GLYPH_NAMES = {
  dust: '尘垢', clay: '陶土', heat: '炽焰',
  wood: '青木', flow: '流水', stone: '磐石',
  spike: '锋锐', dream: '梦魇', clover: '瑞莲',
  rain: '甘霖', sun: '骄阳', cloud: '祥云',
  blossom: '绽放', leaf: '翠叶', paper: '纸韵',
  book: '典籍', coin: '金印', card: '神牌',
};
const REL_FEATURE_ICONS = {
  general: 'mdi-circle-outline', mining: 'mdi-pickaxe', village: 'mdi-sword-cross',
  horde: 'mdi-ninja', farm: 'mdi-carrot', gallery: 'mdi-image',
  school: 'mdi-book', treasure: 'mdi-gem',
};
const REL_EFFECT_NAMES = {
  currencyRelicPowerGain: '灵宝之力产出', currencyRelicPowerCap: '灵宝之力上限',
  currencyMiningScrapGain: '灵石碎屑产出', currencyMiningScrapCap: '灵石碎屑上限',
  miningDamage: '挖矿伤害', miningOreGain: '矿石产出', miningRareEarthGain: '稀有矿产出',
  miningSmelteryTime: '冶炼时间', currencyMiningEmberCap: '烬炎上限', miningResinMax: '灵脂上限',
  miningCardCap: '灵脉碎片槽位',
  queueSpeedVillageBuilding: '宗门建造速度', villageWorker: '门徒效率',
  villageMaterialGain: '宗门建材产出', villageMaterialCap: '宗门建材上限',
  villageFoundationMaterialGain: '基础建材产出', villageLuxuryMaterialGain: '高阶建材产出',
  villageIndustrialMaterialGain: '工业建材产出', villageModernMaterialGain: '尖端建材产出',
  currencyVillageCoinGain: '宗门灵石产出', currencyVillageCoinCap: '宗门灵石上限',
  currencyVillageFaithGain: '宗门信仰产出', currencyVillageSharesGain: '宗门分红收益',
  villageCardCap: '宗门碎片槽位',
  hordeAttack: '降妖攻击', hordeHealth: '降妖生命', hordeHeirloomEffect: '传承加成',
  hordeEquipmentChance: '装备概率', hordeEquipmentMasteryGain: '装备精通',
  hordeNostalgia: '忆往昔', hordeShardChance: '法宝碎片几率', hordeEquipmentMasteryGain: '装备熟练度',
  currencyHordeBoneGain: '妖骨产出', currencyHordeCorruptedFleshGain: '魔肉产出',
  currencyHordeBloodGain: '妖血产出', currencyHordeSoulCorruptedGain: '魂核产出',
  currencyHordeCourageGain: '勇气产出', hordeCardCap: '降妖碎片槽位',
  currencyFarmBerryGain: '灵果产出', currencyFarmVegetableGain: '灵菜产出',
  currencyFarmFlowerGain: '灵花产出', currencyFarmGrainGain: '灵谷产出',
  currencyFarmGrassCap: '灵草上限', farmExperience: '灵植经验',
  farmCardCap: '灵植碎片槽位',
  farmGoldChance: '金色概率',
  relicPedestal0: '灵宝殿A扩展', relicPedestal1: '灵宝殿B扩展', relicPedestal2: '灵宝殿C扩展',
  currencyXqFragmentGain: '灵玉产出', treasureSlots: '仙器槽位',
  currencyGalleryBeautyGain: '画廊灵感产出', currencyGalleryConverterGain: '画廊转化产出',
  galleryColorGain: '灵色每刻产出', galleryShapeGain: '画廊形态',
  galleryCanvasSpeed: '灵画绘制速度', galleryCanvasSize: '画廊画布尺寸',
  currencyGalleryCashGain: '画廊灵石产出', currencyGalleryMotivationCap: '画廊动力上限',
  galleryInspirationStart: '画廊初始灵感',
  schoolBook: '藏经阁典籍', currencySchoolGoldenDustCap: '藏经阁金尘上限',
  currencyDaoChiyuanGain: '赤元产出', currencyDaoQingyuanGain: '青元产出',
  currencyDaoZiyuanGain: '紫元产出', currencyDaoXuanyuanGain: '玄元产出',
  currencyDaoHuangyuanGain: '黄元产出', currencyDaoHunyuanGain: '混元产出',
  currencyDaoDaoyuanGain: '道元产出',
  cardShinyChance: '灵宝闪光概率',
  relicMuseum: '灵宝殿解锁',
};

/* ============ 主题颜色工具（替代 Vuetify darken-x/lighten-x） ============ */
function hexToRgb(h) { h = h.replace('#',''); return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)}; }
function rgbToHex(r,g,b) { return '#' + [r,g,b].map(x=>Math.max(0,Math.min(255,Math.round(x))).toString(16).padStart(2,'0')).join(''); }
function shade(hex, pct) {
  // pct 正=加白(lighten)，负=加黑(darken)
  const {r,g,b} = hexToRgb(hex);
  const f = (c) => pct > 0 ? c + (255 - c) * pct : c * (1 + pct);
  return rgbToHex(f(r), f(g), f(b));
}
function useDark() { return false; /* 我们游戏默认浅色主题 */ }
function relCardBg(color) { return shade(color, useDark() ? -0.12 : 0.15); }   // darken-2 / lighten-2
function relFeatureBg(color) { return shade(color, useDark() ? -0.12 : 0.15); } // 同卡
function relGlyphBg(color) { return shade(color, useDark() ? -0.22 : 0.28); }  // darken-3 / lighten-3
function relActiveBg(color) { return shade(color, useDark() ? -0.18 : 0.22); } // darken-3 / lighten-3
function relGlyphLevelBg(color) { return shade(color, useDark() ? -0.05 : 0.08); } // darken-1 / lighten-1
function relGlyphSideBg(color) { return shade(color, useDark() ? -0.05 : 0.08); }
function border反() { return useDark() ? '#121212' : '#FFFFFF'; }

var GB_REL_VIEW = {
  el: null, _sig: '', _resetScroll: false, _tab: 'relics',
  _museumBuffer: null, _glyphFilter: null,
  _selectedPack: null, _buffTimer: null,

  fmt(v) { return (window.formatNum ? formatNum(v) : Math.floor(v)); },
  fmtNum(v) { return (window.formatNum ? formatNum(v) : Math.floor(v)); },
  fmtInt(v) { return Math.floor(v); },
  icon(n, s, c) { return typeof GB_ICON !== 'undefined' ? GB_ICON.icon(n, s || 16, c || '') : ''; },
  toast(msg, color) { if (typeof GB_APP !== 'undefined' && GB_APP.toast) GB_APP.toast(msg, color); },

  get canSeeMuseum() {
    if (typeof GB_UNLOCK !== 'undefined' && typeof GB_UNLOCK.isUnlocked === 'function') {
      return GB_UNLOCK.isUnlocked('relicMuseum') || REL_MODULE.owned.length >= 4;
    }
    return REL_MODULE.owned.length >= 4;
  },
  get useDarkTheme() { return false; },

  /* ==================== 主生命周期 ==================== */
  mount(root) {
    if (this.el === root) { this.render(); return; }
    this.unload();
    this._sig = '';
    this._resetScroll = true;
    this.el = root;
    root.innerHTML = `
      <div class="scroll-container" id="rel-content">
        <div id="rel-tabs"></div>
        <div id="rel-tab-body"></div>
      </div>`;
    root.addEventListener('click', (e) => this._onClick(e));
    root.addEventListener('change', (e) => this._onChange(e));
    this.render();
  },
  unload() {
    this.el = null;
    if (this._buffTimer) { clearInterval(this._buffTimer); this._buffTimer = null; }
  },

  render() {
    const el = this.el; if (!el) return;
    const body = el.querySelector('#rel-tab-body'); if (!body) return;

    const sig = [
      this._tab,
      this._curSig(),
      JSON.stringify(REL_MODULE.owned),
      JSON.stringify(REL_STATE.pedestal),
      this._glyphSig(),
      // 灵宝碎片状态签名
      (typeof CARD_MODULE !== 'undefined')
        ? JSON.stringify(CARD_STATE.card).slice(0, 2000) + '|' + CARD_MODULE.shinyDust()
        : '',
      // active buff 签名（含剩余时间，让 buff 倒计时每秒触发重 render）
      this._buffSig(),
    ].join('|');
    if (sig === this._sig && !this._resetScroll) return;
    this._sig = sig;
    this._resetScroll = false;

    // 若有 active buff，启动每秒刷新（让倒计时更新）
    this._ensureBuffTimer();

    // ======== Relic.vue: v-tabs（grow show-arrows）========
    const tabs = [
      { id: 'relics', name: '灵宝', icon: 'mdi-ring', badge: false },
      { id: 'museum', name: '灵宝殿', icon: 'mdi-bank', badge: !REL_MODULE.hasMuseumHint() },
      { id: 'fragments', name: '碎片', icon: 'mdi-cards', badge: false },
    ];
    el.querySelector('#rel-tabs').innerHTML = `
      <div class="rel-tabs-root">
        ${tabs.filter(t => t.id !== 'museum' || this.canSeeMuseum).map(t => `
          <button class="rel-tab ${this._tab === t.id ? 'active' : ''}" data-act="tab" data-arg="${t.id}">
            ${t.badge ? `<span class="rel-tab-badge-dot"></span>` : ''}
            ${this.icon(t.icon, 16, '')}<span style="margin-left:4px;">${t.name}</span>
          </button>`).join('')}
      </div>`;

    body.innerHTML = this._tab === 'relics' ? this._renderRelicList()
      : this._tab === 'museum' ? this._renderMuseumTab()
      : this._renderCardTab();
  },

  _curSig() {
    let s = REL_MODULE.CUR ? REL_MODULE.CUR.value('relic_power').toFixed(2) : '0';
    if (typeof DAO_CUR !== 'undefined') s += '|q' + DAO_CUR.value('dao_qingyuan').toFixed(0);
    return s;
  },
  _glyphSig() {
    const parts = [];
    for (const k in REL_STATE.glyph) parts.push(k + '=' + REL_STATE.glyph[k].progress.toFixed(2));
    return parts.join(',');
  },
  _buffSig() {
    if (!REL_STATE.buff) return '';
    const parts = [];
    for (const k in REL_STATE.buff) {
      const b = REL_STATE.buff[k];
      parts.push(k + ':' + Math.max(0, Math.floor(b.endsAt / 1000)) + ':' + (b.mult || b.base || 1));
    }
    return parts.join(',');
  },
  _ensureBuffTimer() {
    // 若有 buff 且没定时器，开一个每秒 tick 重新 render（让倒计时/按钮状态实时更新）
    if (REL_STATE.buff && Object.keys(REL_STATE.buff).length > 0) {
      if (!this._buffTimer) {
        this._buffTimer = setInterval(() => {
          // 触发 tick 刷新签名
          this._resetScroll = false;
          this._sig = ''; // 强制下次 render
          this.render();
          // 如果 buff 清了就停掉
          if (!REL_STATE.buff || Object.keys(REL_STATE.buff).length === 0) {
            clearInterval(this._buffTimer);
            this._buffTimer = null;
          }
        }, 1000);
      }
    } else if (this._buffTimer) {
      clearInterval(this._buffTimer);
      this._buffTimer = null;
    }
  },
  _cur() { return REL_MODULE.CUR ? REL_MODULE.CUR.value('relic_power') : 0; },
  _cap() { return REL_MODULE.CUR ? REL_MODULE.CUR.cap('relic_power') : 50; },
  // gooboo Currency.vue 显示每小时产出（gainDisplay='perHour'），
  // 原版 tick 里已经按 /3600 换算成秒加到 currency
  // 所以 _gain() 直接返回 MULT 值 + 'h' 单位
  _gainPerHour() { return REL_MODULE.MULT ? REL_MODULE.MULT.get('currencyRelicPowerGain', 2) : 2; },

  /* ==================== RelicList.vue（精确复刻 gooboo） ==================== */
  // gooboo RelicList.vue 结构：
  //   <div>
  //     <div class="d-flex justify-center ma-1 mt-2">
  //       <currency name="relic_power" large></currency>
  //     </div>
  //     <div class="d-flex flex-wrap ma-1 pb-2">
  //       <item class="ma-1" v-for="item in owned" :name="item"></item>
  //     </div>
  //   </div>
  _renderRelicList() {
    const cur = this._cur(), cap = this._cap(), gain = this._gainPerHour();
    const pct = cap > 0 ? Math.min(100, (cur / cap) * 100) : 0;

    // ===== Currency.vue (large, 100% 对齐 gooboo Currency.vue) =====
    // 原版结构: currency-container render-currency-large (380px)
    //   + v-icon ring (mr-2)
    //   + currency-border (2px solid white, rounded)
    //     + v-progress-linear (height 24px, overflow visible)
    //       + currency-text text-center (value / cap)
    //       + currency-line--small × 16 (5%/10%/.../95%)
    //       + currency-line--medium × 2 (25% / 75%)
    //       + currency-line--large × 1 (居中)
    //   + currency-labels 底部标签 (gain + countdown)
    const SMALL_LINES = [5,10,15,20,30,35,40,45,55,60,65,70,80,85,90,95];
    const MEDIUM_LINES = [25, 75];
    const LARGE_LINE = 50;
    const color = '#f59e0b'; // amber-500 = 灵宝之力主题色
    const borderC = useDark() ? '#121212' : '#FFFFFF';
    const fillColor = shade(color, useDark() ? 0 : 0.28);  // lighten-2
    const bgColor = shade(color, useDark() ? -0.18 : -0.12); // darken-2

    const smallLinesHtml = SMALL_LINES.map(p => `<div class="rel-currency-line rel-currency-line--small" style="left:${p}%;"></div>`).join('');
    const mediumLinesHtml = MEDIUM_LINES.map(p => `<div class="rel-currency-line rel-currency-line--medium" style="left:${p}%;"></div>`).join('');

    const currencyHtml = `
      <div class="rel-currency-wrap">
        <div class="rel-currency-container rel-currency-large" title="灵宝之力"
             style="background:${bgColor};">
          <div class="rel-currency-icon">${this.icon('mdi-ring', 24, '')}</div>
          <div class="rel-currency-border" style="border:2px solid ${borderC};">
            <div class="rel-currency-bar" style="height:24px;background:${bgColor};position:relative;overflow:visible;">
              <div class="rel-currency-bar-fill" style="width:${pct}%;height:100%;background:${fillColor};border-radius:3px;"></div>
              ${smallLinesHtml}${mediumLinesHtml}
              <div class="rel-currency-line rel-currency-line--large" style="left:${LARGE_LINE}%;"></div>
              <div class="rel-currency-text">
                <span>${this.fmt(cur)}${cap !== null && cap !== undefined ? (' / ' + this.fmt(cap)) : ''}</span>
              </div>
            </div>
          </div>
          ${gain > 0 ? `<div class="rel-currency-labels">
            <div class="rel-currency-label" style="background:${color};">+${gain.toFixed(2)}/小时</div>
          </div>` : ''}
        </div>
      </div>`;

    // flex-wrap items（gooboo class="ma-1" margin 4px）
    const itemsHtml = REL_MODULE.owned.map(key => this._renderItem(key)).join('');
    return currencyHtml + `<div class="rel-items-wrap">${itemsHtml}</div>`;
  },

  /* ==================== Item.vue（精确复刻 gooboo Item.vue） ==================== */
  // gooboo Item.vue 结构：
  //   <div class="d-flex align-center">
  //     <gb-tooltip title-text="$vuetify.lang.t('gooboo.effect')">
  //       <v-card class="d-flex flex-column justify-center align-center mb-3"
  //               width=180 height=128 :color="relic.color + (dark?'darken-2':'lighten-2')">
  //         <v-icon x-large>{{ relic.icon }}</v-icon>
  //         <div class="text-center ma-2 mb-n3">{{ name }}</div>
  //         <div class="relic-feature-list d-flex flex-wrap justify-end">
  //           <div v-for="item in relic.feature"
  //                :class="relic.color + darken/lighten" class="rounded-circle relic-feature-circle"
  //                :style="border:2px solid 反色">
  //             <v-icon class="ma-1" :size="16">{{ features[item].icon }}</v-icon>
  //           </div>
  //         </div>
  //         <div v-if="canSeeMuseum" class="relic-glyph-list d-flex flex-wrap">
  //           <div v-for="(item,key) in glyphs"
  //                :class="glyph[key].color + darken-3/lighten-3" class="d-flex align-end glyph-container ml-1 rounded px-1"
  //                :style="border:1px solid 反色">
  //             <v-icon :size="20">{{ glyph[key].icon }}</v-icon>
  //             <span class="glyph-amount">{{ item }}</span>
  //           </div>
  //         </div>
  //       </v-card>
  //       <display-row v-for="item in effect" :name="item.name" :type="item.type" :after="item.value" show-icon>
  //     </gb-tooltip>
  //     <!-- active-box（如果 relic.active 存在） -->
  //     <div v-if="relic.active" class="d-flex relic-active-box flex-column rounded-r mb-3"
  //          :class="relic.color + darken-3/lighten-3" style="height:120px;">
  //       <div class="relic-description">{{ description }}</div>
  //       <div class="relic-formula">{{ formula }}</div>
  //       <v-spacer></v-spacer>
  //       <div class="d-flex align-end">
  //         <price-tag v-for="cost" />
  //         <v-spacer></v-spacer>
  //         <v-btn @click="useActive">按钮</v-btn>
  //       </div>
  //     </div>
  //   </div>
  _renderItem(key) {
    const relic = REL_STATE.item[key];
    if (!relic || !relic.found) return '';
    const lvl = relic.level;
    const effects = relic.effect(lvl);
    const glyphMap = relic.glyph(lvl);
    const canSeeMuseum = this.canSeeMuseum;

    // ======== 卡片 ========
    const cardBg = relCardBg(relic.color); // darken-2 / lighten-2
    const card = `
      <div class="rel-card" style="background:${cardBg};">
        <!-- v-icon x-large -->
        <div class="rel-card-icon" style="color:#000;">${this.icon(relic.icon, 48, '#000')}</div>
        <!-- 名字 text-center ma-2 mb-n3（负 margin 让卡片更紧凑） -->
        <div class="rel-card-name">${REL_NAMES[key] || key}</div>
        <!-- relic-feature-list 绝对定位 bottom:-12px, right:4px -->
        ${(relic.feature && relic.feature.length) ? `<div class="rel-feature-list">
          ${relic.feature.map(f => {
            const fBg = relFeatureBg(relic.color);
            const fIcon = REL_FEATURE_ICONS[f] || 'mdi-circle';
            return `<div class="rel-feature-circle" style="background:${fBg};border:2px solid ${border反()};">
              ${this.icon(fIcon, 16, '#000')}
            </div>`;
          }).join('')}
        </div>` : ''}
        <!-- relic-glyph-list 绝对定位 top:4px，只有 canSeeMuseum -->
        ${canSeeMuseum && Object.keys(glyphMap).length ? `<div class="rel-glyph-list-group">
          ${Object.keys(glyphMap).map(gk => {
            const g = REL_STATE.glyph[gk];
            const gBg = relGlyphBg(g.color); // darken-3 / lighten-3
            return `<div class="rel-glyph-chip" style="background:${gBg};border:1px solid ${border反()};">
              ${this.icon(g.icon, 20, '#000')}
              <span class="rel-glyph-amount">${glyphMap[gk]}</span>
            </div>`;
          }).join('')}
        </div>` : ''}
      </div>`;

    // ======== active-box（gooboo: v-if="relic.active"）=====
    // 修仙版 relic_core.js 里还没有 active 数据结构 —— 留占位，后续补
    const activeBox = relic.active ? this._renderActiveBox(key, relic) : '';

    // ======== tooltip 内容（display-row show-icon）=====
    const tooltipLines = effects.map(e => {
      const v = typeof e.value === 'function' ? e.value(lvl) : e.value;
      const fmt = e.type === 'mult'
        ? (v >= 0.9 && v <= 1.1 ? (v * 100).toFixed(0) + '%' : '×' + v.toFixed(2))
        : '+' + this.fmt(v);
      return `${REL_EFFECT_NAMES[e.name] || e.name} ${fmt}`;
    }).join('\n');

    // 外层 d-flex align-center（gooboo Item.vue 模板根）
    return `
      <div class="rel-item-root" title="效果:\n${tooltipLines.replace(/"/g, '&quot;')}">
        ${card}
        ${activeBox}
      </div>`;
  },

  _renderActiveBox(key, relic) {
    const a = relic.active;
    if (!a) return '';
    const boxBg = relActiveBg(relic.color);
    let desc = ''; let formula = '';
    try {
      const params = a.params ? a.params() : {};
      let d = a.description ? a.description(params, null) : '';
      let f = a.formula ? a.formula(params, null) : '';
      // description/formula 返回数组（gooboo 原版作为翻译参数），转成字符串
      if (Array.isArray(d)) d = d.join(' ');
      if (Array.isArray(f)) f = f.join(' ');
      desc = d; formula = f;
    } catch(e) {}

    // cost 是对象：{ currencyKey: amount }（gooboo 原版格式）
    let costObj = a.cost || {};
    if (typeof costObj === 'function') { try { costObj = costObj(); } catch(e) { costObj = {}; } }
    if (Array.isArray(costObj)) costObj = {}; // 防御
    const costs = Object.entries(costObj).map(([curKey, amount]) => {
      // curKey 映射到中文货币名 + 图标
      const ICON = { relic_power: 'mdi-ring', dao_qingyuan: 'mdi-gem' };
      const LABEL = { relic_power: '灵宝之力', dao_qingyuan: '青元' };
      const ico = ICON[curKey] || 'mdi-circle';
      const label = LABEL[curKey] || curKey;
      return `<span class="rel-active-cost" title="${label}">${this.icon(ico, 12, '')} ${this.fmt(amount)}</span>`;
    }).join('');

    // 按钮 disabled 检查：cost 不够 或 disabled() 返回 true
    let canAfford = true;
    for (const [curKey, amount] of Object.entries(costObj)) {
      const curVal = REL_CUR && typeof REL_CUR.value === 'function' ? REL_CUR.value(curKey) : 0;
      if (curVal < amount) { canAfford = false; break; }
    }
    let isDisabled = false;
    try { if (a.disabled && a.disabled(a.params ? a.params() : [], null)) isDisabled = true; } catch(e) {}
    const btnDisabled = (!canAfford || isDisabled) ? 'disabled' : '';

    // 临时 buff 显示（倒计时）
    let buffHtml = '';
    if (REL_STATE.buff && REL_STATE.buff.tempRelicPowerGain) {
      const remain = Math.max(0, Math.ceil((REL_STATE.buff.tempRelicPowerGain.endsAt - Date.now()) / 1000));
      buffHtml = `<div class="rel-active-buff" style="background:${shade(relic.color, -0.12)};">⚡ 灵宝之力产出 ×${REL_STATE.buff.tempRelicPowerGain.mult} 剩余 ${remain} 秒</div>`;
    }

    return `
      <div class="rel-active-box" style="background:${boxBg};">
        ${desc ? `<div class="rel-active-desc">${desc}</div>` : ''}
        ${formula ? `<div class="rel-active-formula">${formula}</div>` : ''}
        <div class="rel-active-bottom">
          <div>${costs}</div>
          <button class="rel-active-btn" data-act="use-active" data-arg="${key}" ${btnDisabled}>发动</button>
        </div>
        ${buffHtml}
      </div>`;
  },

  /* ==================== Card.vue（灵宝碎片 Tab，100% 对齐 gooboo Card.vue） ==================== */
  // gooboo Card.vue 结构：
  //   <div>
  //     <div class="d-flex align-center ma-1">
  //       <v-select :items="pack" v-model="selectedPack"> ← pack 选择器
  //       <v-btn color=primary @click=buyShinyPack><v-icon>mdi-shimmer</v-icon>buy</v-btn>
  //       <v-btn small @click=buyPack(null)>max</v-btn>
  //       <v-btn small @click=buyPack(100)>x100</v-btn>
  //       <v-btn small @click=buyPack(10)>x10</v-btn>
  //       <v-btn @click=buyPack(1)>buy</v-btn>
  //     </div>
  //     <div class="d-flex flex-wrap align-center ma-1">
  //       <currency name="card_shinyDust"></currency>  ← 灵宝精华
  //       <gb-tooltip shimmer>...</gb-tooltip>
  //       <gb-tooltip v-for="item in unlockedFeature"> ← feature 收藏 chip
  //         <v-chip><v-icon>{{ item.icon }}</v-icon>{{ item.amount }}<span shiny>...</span></v-chip>
  //         <display-row v-for reward></display-row>
  //       </gb-tooltip>
  //     </div>
  //     <v-expansion-panels accordion>
  //       <v-expansion-panel v-for="coll in collection">
  //         <v-expansion-panel-header>
  //           <v-chip>cacheCards / total</v-chip> 或 <v-chip color=orange><v-icon>mdi-crown</v-icon>total</v-chip>
  //           {{ collectionName }}
  //         </v-expansion-panel-header>
  //         <v-expansion-panel-content>
  //           <div>fullCollectionReward:</div>
  //           <div v-for reward>...</div>
  //           <div class="d-flex flex-wrap"><card-item v-for item in coll.cards/></div>
  //         </v-expansion-panel-content>
  //       </v-expansion-panel>
  //     </v-expansion-panels>
  //   </div>
  _renderCardTab() {
    const data = window.CARD_DATA;
    const mod = window.CARD_MODULE;
    if (!data || !mod) return '<div style="padding:20px;">灵宝碎片系统未加载</div>';

    // 可选的 pack 列表
    const packs = [];
    for (const [key, p] of Object.entries(mod.pack)) {
      if (p.price !== null && p.price !== undefined) packs.push({ name: key, ...p });
    }
    if (this._selectedPack === null && packs.length) this._selectedPack = packs[0].name;

    const selectedPack = this._selectedPack ? mod.pack[this._selectedPack] : null;
    const qingyuan = (typeof DAO_CUR !== 'undefined') ? DAO_CUR.value('dao_qingyuan') : 0;
    const canBuyPack = selectedPack && qingyuan >= selectedPack.price;
    const canBuy10 = selectedPack && qingyuan >= selectedPack.price * 10;
    const canBuy100 = selectedPack && qingyuan >= selectedPack.price * 100;
    const canBuyShiny = selectedPack && mod.canOpenShinyPack(this._selectedPack) && mod.shinyDust() >= selectedPack.shinyPrice;

    // 顶栏：pack 选择 + 购买按钮
    const packOptions = packs.map(p =>
      `<option value="${p.name}" ${this._selectedPack === p.name ? 'selected' : ''}>
        ${data.CARD_PACK_NAMES[p.name] || p.name}（青元 ${p.price}）
      </option>`
    ).join('');

    const topBar = `
      <div class="card-topbar">
        <select class="card-pack-select" data-act="select-pack">
          ${packOptions || '<option value="">暂无碎片包</option>'}
        </select>
        <button class="card-buy-btn" data-act="buy-shiny" ${!canBuyShiny ? 'disabled' : ''}>
          ${this.icon('mdi-shimmer', 14, '')} 闪光
        </button>
        <button class="card-buy-btn small" data-act="buy-pack" data-arg="max" ${!canBuyPack ? 'disabled' : ''}>最大</button>
        <button class="card-buy-btn small" data-act="buy-pack" data-arg="100" ${!canBuy100 ? 'disabled' : ''}>×100</button>
        <button class="card-buy-btn small" data-act="buy-pack" data-arg="10" ${!canBuy10 ? 'disabled' : ''}>×10</button>
        <button class="card-buy-btn" data-act="buy-pack" data-arg="1" ${!canBuyPack ? 'disabled' : ''}>购买</button>
      </div>`;

    // 货币 + feature chip 行
    const currencyRow = `
      <div class="card-currency-row">
        <div class="card-shiny-dust" title="灵宝精华">
          ${this.icon('mdi-creation', 16, '#38bdf8')}
          <span>${this.fmtInt(mod.shinyDust())}</span>
        </div>
        <div class="card-qingyuan" title="青元">
          ${this.icon('mdi-gem', 16, '#10b981')}
          <span>${this.fmtInt(qingyuan)}</span>
        </div>
        ${Object.entries(mod.feature).filter(([k, f]) => f.cacheCards > 0).map(([k, f]) => {
          const fIcon = data.CARD_FEATURE_ICONS[k] || 'mdi-circle';
          return `<div class="card-feature-chip" title="收藏进度">
            ${this.icon(fIcon, 14, '')}
            <span>${f.cacheCards}</span>
            ${f.cacheShinyCards > 0 ? `<span class="card-feature-shiny">${this.icon('mdi-shimmer', 10, '')}${f.cacheShinyCards}</span>` : ''}
          </div>`;
        }).join('')}
      </div>`;

    // 收藏面板（expansion panels）
    const collectionsHtml = Object.entries(mod.collection).map(([collKey, coll]) => {
      const isComplete = coll.cacheCards >= coll.cards.length;
      const name = data.CARD_COLLECTION_NAMES[collKey] || collKey;
      const countChip = isComplete
        ? `<span class="card-chip card-chip-crown">${this.icon('mdi-crown', 12, '')} ${coll.cards.length}</span>`
        : `<span class="card-chip">${coll.cacheCards} / ${coll.cards.length}</span>`;

      const cardsHtml = coll.cards.map(id => this._renderCardItem(id)).join('');
      const rewardsHtml = coll.reward.map(r => {
        const v = typeof r.value === 'function' ? r.value(coll.cacheCards) : r.value;
        const fmt = r.type === 'mult' ? '×' + v.toFixed(2) : '+' + this.fmt(v);
        return `<div class="card-collection-reward">• ${REL_EFFECT_NAMES[r.name] || r.name} ${fmt}</div>`;
      }).join('');

      return `
        <div class="card-panel">
          <div class="card-panel-header" data-act="toggle-coll" data-arg="${collKey}">
            ${countChip}
            <span class="card-panel-title">${name}</span>
            <span class="card-panel-arrow">${this.icon('mdi-chevron-down', 16, '')}</span>
          </div>
          <div class="card-panel-body" data-coll-body="${collKey}">
            ${coll.reward.length ? `<div class="card-reward-title">满套奖励：</div>${rewardsHtml}` : ''}
            <div class="card-items-wrap">${cardsHtml}</div>
          </div>
        </div>`;
    }).join('');

    return topBar + currencyRow + `<div class="card-collections">${collectionsHtml}</div>`;
  },

  /* ==================== CardItem.vue（精确复刻 gooboo CardItem.vue） ==================== */
  // gooboo CardItem.vue 结构：
  //   <div class="card-playing d-flex flex-column rounded elevation-2"
  //        :class="color lighten-3" width=120 height=168 border=3px solid black>
  //     <div class="card-playing-title" :class="color lighten-1"> 卡片名 </div>
  //     <div class="card-playing-inner flex-grow-1" border-top/bottom 2px black>
  //       <div class="card-playing-inner-frame">
  //         <v-icon v-for="item in card.icons" :style="position: x,y rotate">icon</v-icon>
  //         <div v-if="amount>1" class="card-playing-amount"> ×N </div>
  //         <div v-if="!instant" class="card-playing-power rounded-circle"> power </div>
  //       </div>
  //     </div>
  //     <div class="card-playing-bottom" :class="color lighten-1"> id + shiny </div>
  //     <div class="card-feature-icon" :class="color darken-3"> feature icon </div>
  //     <div v-if="foundShiny" class="card-shiny"></div>
  //   </div>
  //   或未获得：<div class="card-hidden bg-tile-default"> help/lock </div>
  _renderCardItem(id) {
    const data = window.CARD_DATA;
    const mod = window.CARD_MODULE;
    const card = mod.cards[id];
    if (!card) return '';
    const showCard = card.amount > 0;
    const colorHex = data.cardColor(card.color);
    const cardBg = shade(colorHex, 0.3); // lighten-3
    const titleBg = shade(colorHex, 0.1); // lighten-1
    const bottomBg = shade(colorHex, 0.1); // lighten-1
    const featureBg = shade(colorHex, -0.18); // darken-3
    const powerBg = shade(colorHex, 0.4); // lighten-5
    const amountBg = shade(colorHex, 0.45); // lighten-5
    const borderC = useDark() ? '#fff' : '#000';
    const fIcon = data.CARD_FEATURE_ICONS[card.feature] || 'mdi-circle';

    if (!showCard) {
      return `
        <div class="card-hidden" title="未获得的碎片">
          ${this.icon('mdi-help', 48, '#80808040')}
        </div>`;
    }

    const cardPower = card.power + (card.foundShiny ? 1 : 0);

    // icons 布局
    const iconsHtml = (card.icons || []).map(item => {
      const size = 24 * (item.size || 1);
      const left = `calc(${item.x * 50 + 50}% - ${size / 2}px)`;
      const top = `calc(${item.y * 50 + 50}% - ${size / 2}px)`;
      const rotate = item.rotate || 0;
      return `<div class="card-playing-icon" style="left:${left};top:${top};width:${size}px;height:${size}px;transform:rotate(${rotate}deg);">
        ${this.icon(item.icon, size, '#000')}
      </div>`;
    }).join('');

    const amountHtml = card.amount > 1
      ? `<div class="card-playing-amount" style="background:${amountBg};">${this.icon('mdi-close', 10, '#000')}${this.fmt(card.amount - 1)}</div>`
      : '';

    const powerHtml = !card.instant
      ? `<div class="card-playing-power" style="background:${powerBg};border-color:${borderC};">
          <div class="card-playing-power-inner" style="background:${amountBg};">
            ${cardPower === 'adaptive' ? this.icon('mdi-multiplication', 14, '#000') : `<span>${cardPower}</span>`}
          </div>
        </div>`
      : '';

    const name = data.CARD_NAMES[id] || id;

    return `
      <div class="card-playing" style="background:${cardBg};border-color:${borderC};"
           title="效果: ${card.reward.map(r => {
             const v = typeof r.value === 'function' ? r.value(cardPower) : r.value;
             return `${REL_EFFECT_NAMES[r.name] || r.name} ${r.type === 'mult' ? '×' + v.toFixed(2) : '+' + this.fmt(v)}`;
           }).join('; ')}">
        <div class="card-playing-title" style="background:${titleBg};">${name}</div>
        <div class="card-playing-inner" style="border-color:${borderC};">
          <div class="card-playing-inner-frame">
            ${iconsHtml}
            ${amountHtml}
            ${powerHtml}
          </div>
        </div>
        <div class="card-playing-bottom" style="background:${bottomBg};">
          <span>${id}</span>
          ${card.foundShiny ? this.icon('mdi-shimmer', 12, '#38bdf8') : ''}
        </div>
        <div class="card-feature-icon" style="background:${featureBg};border-color:${borderC};">
          ${this.icon(fIcon, 20, '#000')}
        </div>
        ${card.foundShiny ? '<div class="card-shiny"></div>' : ''}
      </div>`;
  },

  /* ==================== MuseumTab.vue（精确复刻 gooboo） ==================== */
  // gooboo MuseumTab.vue 结构：
  //   <v-row no-gutters>
  //     <v-col cols=12 md=4 lg=3>
  //       <div v-if="pedestalData">
  //         <relic-pedestal v-for="id in pedestalList" :id="id" v-model="pedestalData[id]" ... />
  //       </div>
  //       <div class="d-flex justify-center">
  //         <v-menu><template activator><v-btn icon><v-icon>mdi-filter</v-icon></v-btn></template>
  //           <v-list dense><v-list-item-group color=primary v-model=glyphFilter>
  //             <v-list-item :value=null>(no filter)</v-list-item>
  //             <v-list-item v-for="item in glyphList" :value=item>...</v-list-item>
  //           </v-list-item-group></v-list>
  //         </v-menu>
  //         <v-btn color=primary @click=updatePedestals :disabled=!isModified>
  //           <v-icon>mdi-pencil</v-icon> 修改
  //         </v-btn>
  //       </div>
  //       <alert-text v-if=isModified type=warning>...</alert-text>
  //     </v-col>
  //     <v-col cols=12 md=8 lg=9>
  //       <div class="d-flex justify-center flex-wrap ma-1">
  //         <glyph-bar v-for="name in glyphList" :name=name :glyph-stat="glyphStats[name]" :glyph-change="..."></glyph-bar>
  //       </div>
  //     </v-col>
  //   </v-row>
  _renderMuseumTab() {
    if (!this._museumBuffer || !this._museumBuffer.length) {
      this._museumBuffer = REL_STATE.pedestal.map(p => [...p]);
    }
    const glyphFilter = this._glyphFilter || null;
    const relicList = REL_MODULE.owned.map(k => ({ ...REL_STATE.item[k], name: k }));

    let visible = [];
    relicList.forEach(r => {
      for (const [gk] of Object.entries(r.glyph(r.level))) if (!visible.includes(gk)) visible.push(gk);
    });
    let glyphList = [];
    for (const [k, g] of Object.entries(REL_STATE.glyph)) {
      if (visible.includes(k) || g.progress > 0 || (g.level !== undefined && g.level > 0)) glyphList.push(k);
    }

    const glyphStats = REL_MODULE.glyphStats;
    const glyphStatsChange = REL_MODULE.glyphStatsPreview(this._museumBuffer);

    let pedestalList = [];
    for (let i = 0; i < REL_MODULE.PEDESTAL_AMOUNT; i++) {
      if (REL_MODULE.pedestalMax(i) > 0) pedestalList.push(i);
    }
    if (pedestalList.length === 0) pedestalList = [0];

    const isEdited = JSON.stringify(REL_STATE.pedestal.map(p => [...p])) !==
                    JSON.stringify(this._museumBuffer.map(p => [...p]));

    // ======== 左列 md=4 lg=3（窄） ========
    const pedestalsHtml = pedestalList.map(id =>
      this._renderRelicPedestal(id, relicList, pedestalList, glyphFilter, this._museumBuffer[id])
    ).join('');

    // filter 菜单（v-menu 风格）
    const filterItems = [
      `<div class="rel-filter-item ${!glyphFilter ? 'active' : ''}" data-act="glyph-filter" data-arg="">(不筛选)</div>`,
      ...Object.keys(REL_STATE.glyph).map(k => {
        const g = REL_STATE.glyph[k];
        const gBg = relGlyphBg(g.color);
        return `<div class="rel-filter-item ${glyphFilter === k ? 'active' : ''}" data-act="glyph-filter" data-arg="${k}">
          <span class="rel-filter-icon" style="background:${gBg};"></span>
          ${this.icon(g.icon, 14, '#000')}
          <span>${REL_GLYPH_NAMES[k] || k}</span>
        </div>`;
      })
    ].join('');

    const leftCol = `
      <div class="rel-museum-left">
        ${pedestalsHtml}
        <div class="rel-museum-toolbar">
          <div class="rel-filter-menu-wrap">
            <button class="rel-filter-btn" data-act="filter-toggle">
              ${this.icon('mdi-filter', 18, '')}
            </button>
            <div class="rel-filter-menu" style="display:none;">${filterItems}</div>
          </div>
          <button class="rel-pedestal-modify" data-act="pedestal-modify" ${!isEdited ? 'disabled' : ''}>
            ${this.icon('mdi-pencil', 14, '')} 修改
          </button>
        </div>
        ${isEdited ? `<div class="rel-warn-banner">有未保存的修改 — 点击"修改"确认生效</div>` : ''}
      </div>`;

    // ======== 右列 md=8 lg=9 ========
    const glyphsHtml = glyphList.map(name =>
      this._renderGlyphBar(name, glyphStats[name] || null, isEdited ? (glyphStatsChange[name] || null) : null)
    ).join('');
    const rightCol = `<div class="rel-museum-right"><div class="rel-glyphs-wrap">${glyphsHtml}</div></div>`;

    return `<div class="rel-museum-root">${leftCol}${rightCol}</div>`;
  },

  /* ==================== RelicPedestal.vue（精确复刻 gooboo） ==================== */
  // gooboo RelicPedestal.vue:
  //   <div class="d-flex align-center">
  //     <v-select outlined hide-details multiple clearable item-value="name"
  //               :value="value" :items="relicListSorted" v-on:input="limitRelics">
  //       <template selection><relic-pedestal-display :item="item" is-simple></relic-pedestal-display></template>
  //       <template item><relic-pedestal-display :item="item"></relic-pedestal-display></template>
  //     </v-select>
  //     <div class="d-flex flex-column align-center flex-shrink-0 pedestal-info ml-1">
  //       <div class="pedestal-letter">${String.fromCharCode(65 + id)}</div>
  //       <div>${value.length} / ${max}</div>
  //     </div>
  //   </div>
  _renderRelicPedestal(id, relicList, pedestalList, glyphFilter, value) {
    const max = REL_MODULE.pedestalMax(id);
    const letter = String.fromCharCode(65 + id);

    const usedList = [];
    pedestalList.forEach((elem, key) => {
      if (parseInt(key) !== id) (this._museumBuffer[elem] || []).forEach(k => usedList.push(k));
    });
    let sorted = relicList.filter(el => !usedList.includes(el.name));
    if (glyphFilter) {
      sorted.sort((a, b) => (b.glyph(b.level)[glyphFilter] ?? 0) - (a.glyph(a.level)[glyphFilter] ?? 0));
    }

    const optionsHtml = sorted.map(r => {
      const sel = value && value.includes(r.name) ? 'selected' : '';
      return `<option value="${r.name}" ${sel}>${REL_NAMES[r.name] || r.name} (Lv${r.level})</option>`;
    }).join('');

    return `
      <div class="rel-pedestal-root">
        <select multiple size="${Math.max(2, Math.min(Math.max(max, 1), 6))}"
                class="rel-pedestal-select"
                data-pedestal-select="${id}">
          ${optionsHtml}
        </select>
        <div class="rel-pedestal-info">
          <div class="rel-pedestal-letter">${letter}</div>
          <div>${value ? value.length : 0} / ${max}</div>
        </div>
      </div>`;
  },

  /* ==================== GlyphBar.vue（精确复刻 gooboo） ==================== */
  // gooboo GlyphBar.vue:
  //   <div class="d-flex align-center">
  //     <div class="glyph-level rounded-circle balloon-text-dynamic"
  //          :class="glyph.color + themeCss">${glyphLevel}</div>
  //     <v-progress-linear class="glyph-progress ml-n2" height=32 :value="glyphProgress*100" :color=glyph.color>
  //       <div class="d-flex justify-center flex-wrap pt-1">
  //         <div v-if=showStats class="d-flex align-center balloon-text-dynamic mt-n1 pl-1" :class="{'glyph-change':showChange}">
  //           <span>${glyphLevel}</span><v-icon mx-1 size=14>mdi-transfer-right</v-icon><span>${glyphStat.max}</span>
  //           <v-icon mx-1 size=14>mdi-circle-small</v-icon><span :class="{'glyph-reset':showChange}">${glyphProgress*100}%</span>
  //           <span>&nbsp;(${timeUntilNext})</span>
  //         </div>
  //         <div v-if=showChange class="d-flex align-center balloon-text-dynamic primary--text mt-n1 pl-1">
  //           <span>${glyphLevel}</span><v-icon mx-1 color=primary size=14>mdi-transfer-right</v-icon><span>${glyphChange.max}</span>
  //           <v-icon mx-1 color=primary size=14>mdi-circle-small</v-icon><span>${timeUntilNextChange}</span>
  //         </div>
  //       </div>
  //     </v-progress-linear>
  //     <div class="glyph-side d-flex justify-center align-center rounded-r-lg"
  //          :class="glyph.color + themeCss">
  //       <v-icon class="mx-1">${glyph.icon}</v-icon>
  //     </div>
  //   </div>
  _renderGlyphBar(name, glyphStat, glyphChange) {
    const glyph = REL_STATE.glyph[name];
    if (!glyph) return '';

    const gColor = glyph.color; // 原始色名（如 "brown"）
    const gBg = glyphColor(gColor); // hex
    const gLevelBg = relGlyphLevelBg(gBg); // darken-1 / lighten-1
    const gSideBg = relGlyphSideBg(gBg);

    const lvl = Math.floor(glyph.progress);
    const frac = glyph.progress - lvl;
    const progressPct = frac * 100;

    const showStats = glyphStat && glyphStat.max > lvl;
    const showChange = glyphChange && glyphChange.max > lvl;

    let timeStr = '';
    if (showStats) {
      const needed = REL_MODULE.glyphTimeNeeded(lvl, glyphStat.max, glyphStat.speed - glyphStat.max);
      if (needed) timeStr = ' · ' + this._fmtTime(Math.ceil((1 - frac) * needed));
    }
    let timeStrChange = '';
    if (showChange) {
      const needed = REL_MODULE.glyphTimeNeeded(lvl, glyphChange.max, glyphChange.speed - glyphChange.max);
      if (needed) timeStrChange = ' · ' + this._fmtTime(Math.ceil(needed));
    }

    // tooltip（display-row before → after + overcap + bonus）
    const displayRows = glyph.effect.map(elem => {
      const before = lvl > 0 ? (typeof elem.value === 'function' ? elem.value(lvl) : elem.value) : null;
      const after = typeof elem.value === 'function' ? elem.value(lvl + 1) : elem.value;
      return `${REL_EFFECT_NAMES[elem.name] || elem.name}: ${before != null ? this._fmtVal(before, elem.type) : '-'} → ${this._fmtVal(after, elem.type)}`;
    }).join('\n');

    let tooltipParts = [`${REL_GLYPH_NAMES[name] || name} — ${displayRows}`];
    const RELIC_GLYPH_SPEED_OVERCAP = 1.25;
    if (showStats && glyphStat.max > lvl + 1) {
      const overcap = Math.pow(RELIC_GLYPH_SPEED_OVERCAP, glyphStat.max - lvl - 1);
      tooltipParts.push(`跨阶速度 ×${overcap.toFixed(2)}`);
    }
    if (showStats && glyphStat.speed > glyphStat.max) {
      const bonus = Math.min(1 + (glyphStat.speed - glyphStat.max) * 0.75 / glyphStat.max, Math.pow(RELIC_GLYPH_SPEED_OVERCAP, glyphStat.speed - glyphStat.max));
      tooltipParts.push(`速度加成 ×${bonus.toFixed(2)} (+${glyphStat.speed - glyphStat.max})`);
    }
    if (!showStats && !showChange && glyph.progress <= 0) {
      tooltipParts.push('此符文暂无激活效果');
    }
    const tooltip = tooltipParts.join('\n');

    // 进度条内部文本
    let innerHtml = '';
    if (showStats) {
      innerHtml += `
        <div class="rel-glyph-stat ${showChange ? 'rel-glyph-change' : ''}">
          <span>${this.fmtInt(lvl)}</span>
          ${this.icon('mdi-arrow-right', showChange ? 10 : 14, showChange ? 'var(--text-dim)' : '')}
          <span>${this.fmtInt(glyphStat.max)}</span>
          ${this.icon('mdi-circle-small', showChange ? 10 : 14, showChange ? 'var(--text-dim)' : '')}
          <span class="${showChange ? 'rel-glyph-reset' : ''}">${this.fmt(progressPct)}%</span>
          <span>${timeStr}</span>
        </div>`;
    }
    if (showChange) {
      innerHtml += `
        <div class="rel-glyph-change-new">
          <span>${this.fmtInt(lvl)}</span>
          ${this.icon('mdi-arrow-right', 14, 'var(--clr-accent)')}
          <span>${this.fmtInt(glyphChange.max)}</span>
          ${this.icon('mdi-circle-small', 14, 'var(--clr-accent)')}
          <span>${timeStrChange}</span>
        </div>`;
    }
    if (!showStats && !showChange) {
      innerHtml = `<div class="rel-glyph-empty">${glyph.progress > 0 ? '等待中...' : '无加成'}</div>`;
    }

    // ======== GlyphBar 精确复刻 ========
    // 40px rounded-circle level（themeCss darken-1/lighten-1）
    // v-progress-linear ml-n2 height=32 :value=pct
    // 32px rounded-r-lg side（themeCss）
    return `
      <div class="rel-glyph-bar" title="${tooltip.replace(/"/g, '&quot;')}">
        <div class="rel-glyph-level" style="background:${gLevelBg};">${this.fmtInt(lvl)}</div>
        <div class="rel-glyph-progress" style="--glyph-color:${gBg};--rel-glyph-fill:${progressPct}%;background:${gBg}22;">
          ${innerHtml}
        </div>
        <div class="rel-glyph-side" style="background:${gSideBg};">
          ${this.icon(glyph.icon, 20, '#000')}
        </div>
      </div>`;
  },

  _fmtVal(v, type) {
    if (type === 'mult') {
      if (v >= 0.9 && v <= 1.1) return (v * 100).toFixed(0) + '%';
      return '×' + v.toFixed(2);
    }
    return '+' + this.fmt(v);
  },
  _fmtTime(s) {
    if (s < 60) return Math.max(1, Math.ceil(s)) + '秒';
    if (s < 3600) return Math.ceil(s / 60) + '分';
    if (s < 86400) return Math.ceil(s / 3600) + '时';
    return Math.ceil(s / 86400) + '天';
  },

  /* ============ 事件 ============ */
  _onClick(e) {
    const ct = e.target.closest('[data-act]');
    if (!ct) {
      // 关闭 filter menu
      if (!e.target.closest('.rel-filter-menu-wrap')) {
        document.querySelectorAll('.rel-filter-menu').forEach(m => m.style.display = 'none');
      }
      return;
    }
    const act = ct.getAttribute('data-act');
    const arg = ct.getAttribute('data-arg');

    if (act === 'tab') {
      if (arg === 'museum' && !this.canSeeMuseum) return;
      this._tab = arg;
      this._resetScroll = true;
      if (arg === 'museum') this._museumBuffer = REL_STATE.pedestal.map(p => [...p]);
      this.render();
      return;
    }
    if (act === 'select-pack') {
      const sel = this.el.querySelector('[data-act="select-pack"]');
      this._selectedPack = sel ? sel.value : null;
      this._resetScroll = true;
      this.render();
      return;
    }
    if (act === 'buy-pack') {
      if (!this._selectedPack) return;
      const mod = window.CARD_MODULE;
      const pack = mod.pack[this._selectedPack];
      if (!pack) return;
      let amount;
      if (arg === 'max') {
        const qingyuan = (typeof DAO_CUR !== 'undefined') ? DAO_CUR.value('dao_qingyuan') : 0;
        amount = Math.floor(qingyuan / pack.price);
      } else {
        amount = parseInt(arg) || 1;
      }
      if (amount <= 0) { this.toast('青元不足', '#f43f5e'); return; }
      const ok = mod.buyPack({ name: this._selectedPack, amount });
      if (ok) this.toast(`购买 ${amount} 包碎片`, '#4ade80');
      else this.toast('购买失败（青元不足）', '#f43f5e');
      this._resetScroll = true;
      this.render();
      return;
    }
    if (act === 'buy-shiny') {
      if (!this._selectedPack) return;
      const mod = window.CARD_MODULE;
      const ok = mod.buyShinyPack(this._selectedPack);
      if (ok) this.toast('闪光碎片包已开启', '#38bdf8');
      else this.toast('闪光包开启失败', '#f43f5e');
      this._resetScroll = true;
      this.render();
      return;
    }
    if (act === 'toggle-coll') {
      const body = this.el.querySelector(`[data-coll-body="${arg}"]`);
      const header = ct;
      if (body) {
        const hidden = body.style.display === 'none';
        body.style.display = hidden ? '' : 'none';
        const arrow = header.querySelector('.card-panel-arrow');
        if (arrow) arrow.style.transform = hidden ? '' : 'rotate(-90deg)';
      }
      return;
    }
    if (act === 'filter-toggle') {
      const menu = ct.parentElement.querySelector('.rel-filter-menu');
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
      return;
    }
    if (act === 'glyph-filter') {
      this._glyphFilter = arg || null;
      document.querySelectorAll('.rel-filter-menu').forEach(m => m.style.display = 'none');
      this._resetScroll = true;
      this.render();
      return;
    }
    if (act === 'pedestal-modify') {
      let hasProgress = false;
      for (const [, g] of Object.entries(REL_STATE.glyph)) {
        if (g.progress - Math.floor(g.progress) >= 0.05) { hasProgress = true; break; }
      }
      if (hasProgress) {
        if (!confirm('修改灵宝殿会重置所有符文进度的小数部分，确定继续吗？')) return;
      }
      REL_MODULE.changePedestals(this._museumBuffer);
      this._museumBuffer = REL_STATE.pedestal.map(p => [...p]);
      this.toast('灵宝殿已更新', '#4ade80');
      this._resetScroll = true;
      this.render();
      return;
    }
    if (act === 'use-active') {
      if (!arg) return;
      const r = REL_MODULE.useActive(arg);
      if (r.ok) {
        this.toast(`发动 ${REL_NAMES[arg] || arg}！`, '#facc15');
      } else {
        const reasonMap = { noActive: '该灵宝无主动技能', disabled: '当前不可发动', afford: '灵宝之力不足' };
        this.toast(reasonMap[r.reason] || '发动失败', '#f43f5e');
      }
      this._resetScroll = true;
      this.render();
      return;
    }
  },

  _onChange(e) {
    const sel = e.target.closest('[data-pedestal-select]');
    if (!sel) return;
    const idx = parseInt(sel.getAttribute('data-pedestal-select'));
    if (isNaN(idx)) return;
    if (!this._museumBuffer) this._museumBuffer = REL_STATE.pedestal.map(p => [...p]);
    const max = REL_MODULE.pedestalMax(idx);
    let values = Array.from(e.target.selectedOptions).map(o => o.value).filter(v => v);
    if (values.length > max) values.length = max;
    this._museumBuffer[idx] = values;
    this._resetScroll = true;
    this.render();
  },
};

if (typeof window !== 'undefined') window.GB_REL_VIEW = GB_REL_VIEW;
