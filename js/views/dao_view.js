/* ============================================================
 * dao_view.js ——「大道法则（dao）」主视图
 *
 * 精确对标 gooboo Gem.vue（src/components/view/Gem.vue）：
 *   三列布局（桌面） / 单列纵向堆叠（手机）
 *   左列：7 种宝石卡片    → 修仙版 7 种元
 *   中列：三进度条        → 三进度条 + 时间说明
 *   右列：下拉框选玩法 + 升级列表 / 锻造（切换按钮）
 *
 * 关键逻辑（对齐 Gem.vue 第 28-35 行）：
 *   - 升级 tab 的下拉框 gemShopFeatures 列出所有 mainFeatures
 *   - 选中后 UpgradeList :feature="featureShop" type="premium"
 *   - 展示的是「选中玩法模块的 premium 升级」而非 dao 自己的
 *   - cyan anvil 按钮切换 showDiamondForge 状态
 *
 * 修仙化命名对照（currency → dao_xxx）：
 *   mining→lm 灵脉, village→village 宗门, horde→horde 降妖,
 *   farm→fa 灵植园, school→sc 道院, ruin→ruin 秘境,
 *   relic→relic 灵宝, dao→大道法则本身
 * ============================================================ */
var GB_DAO_VIEW = {
  el: null,
  _sig: '',
  _resetScroll: false,
  _tab: 'upgrade',     // 'upgrade' → 升级列表 + 下拉框 | 'forge' → 混元锻造
                       // 对齐 gooboo Gem.vue 第 52 行 showDiamondForge: false
  _shopFeature: 'lm',  // 下拉框选中的玩法（默认灵脉，对齐 Gem.vue featureShop: 'mining'）

  fmt: function(v) { return (window.formatNum ? formatNum(v) : Math.floor(v)); },
  fmtTime: function(s) {
    s = Math.max(0, Math.floor(s));
    if (s < 60) return s + '秒';
    if (s < 3600) return Math.floor(s / 60) + '分';
    if (s < 86400) return Math.floor(s / 3600) + '时';
    return Math.floor(s / 86400) + '天';
  },
  icon: function(n, s, c) { return GB_ICON.icon(n, s || 16, c || ''); },
  toast: function(msg, color) { if (typeof GB_APP !== 'undefined' && GB_APP.toast) GB_APP.toast(msg, color); },

  CURDATA: typeof DAO_CURDATA !== 'undefined' ? DAO_CURDATA : {},
  get CUR() { return DAO_CUR; },
  get UPG() { return DAO_UPG; },
  get FORGE() { return DAO_FORGE; },
  get STATE() { return DAO_STATE; },

  /* gooboo gem_ 货币 → 修仙版 dao_ 货币映射（所有 premium 升级用 gem 模块的宝石支付） */
  GEM_CUR_MAP: {
    gem_ruby:     { dao: 'dao_chiyuan',  name: '赤元' },
    gem_emerald:  { dao: 'dao_qingyuan', name: '青元' },
    gem_sapphire: { dao: 'dao_xuanyuan', name: '玄元' },
    gem_amethyst: { dao: 'dao_ziyuan',   name: '紫元' },
    gem_topaz:    { dao: 'dao_huangyuan', name: '黄元' },
    gem_diamond:  { dao: 'dao_hunyuan',  name: '混元' },
    gem_onyx:     { dao: 'dao_daoyuan',  name: '道元' },
  },
  gemKeyToDao: function(gemKey) {
    return this.GEM_CUR_MAP[gemKey] ? this.GEM_CUR_MAP[gemKey].dao : null;
  },
  gemKeyToName: function(gemKey) {
    return this.GEM_CUR_MAP[gemKey] ? this.GEM_CUR_MAP[gemKey].name : gemKey;
  },
  daoKeyToName: function(daoKey) {
    var m = this.GEM_CUR_MAP;
    for (var g in m) if (m[g].dao === daoKey) return m[g].name;
    // fallback: DAO_CURDATA
    var bare = daoKey.replace('dao_', '');
    if (this.CURDATA[bare]) return this.CURDATA[bare].name;
    return daoKey;
  },

  /* ============================================================
   * 下拉框玩法列表 —— 对齐 Gem.vue gemShopFeatures computed
   * 模块 id + unlock key 精确对标 app.js 第 714 行映射表
   * ============================================================ */
  shopFeatures: function() {
    var mods = [
      { id: 'lm',      name: '灵脉',      unlock: 'lmFeature',   upgSys: 'UPG', upgType: 'premium' },
      { id: 'vill',    name: '宗门',      unlock: 'villFeature', upgSys: 'UPG', upgType: 'premium' },
      { id: 'horde',   name: '降妖',      unlock: 'hoFeature',   upgSys: 'UPG', upgType: 'premium' },
      { id: 'farm',    name: '灵植园',    unlock: 'faFeature',   upgSys: 'UPG', upgType: 'premium' },
      { id: 'school',  name: '道院',      unlock: 'scFeature',   upgSys: 'UPG', upgType: 'premium' },
      { id: 'ruin',    name: '秘境',      unlock: 'ruFeature',   upgSys: 'UPG', upgType: 'premium' },
      { id: 'treasure',name: '灵宝',      unlock: 'treasureFeature', upgSys: 'UPG', upgType: 'premium' },
      { id: 'dao',     name: '大道法则',  unlock: 'daoFeature',  upgSys: 'UPG', upgType: 'premium' },
    ];
    return mods.filter(function(m) {
      if (typeof GB_UNLOCK !== 'undefined') {
        try { if (!GB_UNLOCK.isUnlocked(m.unlock)) return false; } catch(e) {}
      }
      return true;
    });
  },

  /* 获取某模块的 premium 升级列表（对齐 gooboo UpgradeList :feature :type）
   * 过滤掉 requirement 未通过的 —— 对齐 UpgradeList.vue 第 126-130 行 */
  getModulePremiums: function(modId) {
    var m = GB_MODULES.get(modId);
    if (!m || !m.core || !m.core.UPG) return [];
    var upg = m.core.UPG;
    var typeFilter = 'premium';
    var result = [];
    var all;
    if (typeof upg.list === 'function') {
      all = upg.list(typeFilter);
    } else if (upg.defs) {
      all = Object.keys(upg.defs).filter(function(id) { return upg.defs[id].type === typeFilter; });
    } else {
      return [];
    }
    var self = this;
    all.forEach(function(id) {
      var def = upg.defs ? upg.defs[id] : null;
      if (!def) return;
      // 对齐 gooboo UpgradeList.vue: items.filter(requirement(level))
      var lvl = upg.levels ? (upg.levels[id] || 0) : 0;
      var reqMet = true;
      if (typeof def.requirement === 'function') {
        try { reqMet = !!def.requirement(lvl); } catch(e) { reqMet = true; }
      }
      if (reqMet) result.push(id);
    });
    return result;
  },

  getModuleUpgDef: function(modId, upgId) {
    var m = GB_MODULES.get(modId);
    if (!m || !m.core || !m.core.UPG) return null;
    return m.core.UPG.defs ? m.core.UPG.defs[upgId] : null;
  },

  getModuleUpgLevel: function(modId, upgId) {
    var m = GB_MODULES.get(modId);
    if (!m || !m.core || !m.core.UPG) return 0;
    return m.core.UPG.levels ? (m.core.UPG.levels[upgId] || 0) : 0;
  },

  getModuleUpgPrice: function(modId, upgId) {
    var m = GB_MODULES.get(modId);
    if (!m || !m.core || !m.core.UPG) return {};
    var upg = m.core.UPG;
    if (typeof upg.price === 'function') return upg.price(upgId);
    return {};
  },

  buyModuleUpg: function(modId, upgId) {
    var m = GB_MODULES.get(modId);
    if (!m || !m.core || !m.core.UPG) return false;
    var upg = m.core.UPG;
    if (typeof upg.buy === 'function') return upg.buy(upgId);
    return false;
  },

  /* ---------- 速度计算（对齐 gooboo gem/genSpeedPrimary getter） ---------- */
  speedPrimary: function() {
    return 1 + (typeof GB_META !== 'undefined' ? GB_META.getLevel() * 0.01 : 0)
         * (DAO_MULT.get('daoGenSpeedPrimary') / (DAO_MULT.values['daoGenSpeedPrimary']?.baseValue || 1));
  },
  speedSecondary: function() {
    return 1 + (typeof GB_META !== 'undefined' ? GB_META.getLevel() * 0.005 : 0)
         * (DAO_MULT.get('daoGenSpeedSecondary') / (DAO_MULT.values['daoGenSpeedSecondary']?.baseValue || 1));
  },
  timePerPrimary: function() { return DAO_SPEED_BASE / this.speedPrimary(); },
  timePerSecondary: function() { return DAO_SPEED_BASE / this.speedSecondary(); },
  timePerDiamond: function() { return DAO_SPEED_DIAMOND_BASE; },

  /* ---------- 生命周期 ---------- */
  mount: function(root) {
    // 强制重置 UI 状态 —— 无论对象初始化或缓存导致什么脏状态
    // 对齐 gooboo Gem.vue showDiamondForge: false → 默认看升级列表 + 下拉框
    this._tab = 'upgrade';
    this._shopFeature = 'lm';
    this._sig = '';

    if (this.el === root) { this.render(); return; }
    this.unload();
    this.el = root;
    var html =
      '<div class="dao-wrap">' +
        '<div class="dao-col dao-col-gems"></div>' +
        '<div class="dao-col dao-col-progress"></div>' +
        '<div class="dao-col dao-col-shop"></div>' +
      '</div>';
    root.innerHTML = html;
    root.addEventListener('click', (function(e) { this.handleClick(e); }).bind(this));
    root.addEventListener('change', (function(e) { this.handleChange(e); }).bind(this));
    this.render();
  },
  unload: function() { this.el = null; },

  handleChange: function(e) {
    var sel = e.target.closest('[data-act="shop_select"]');
    if (sel) {
      this._shopFeature = sel.value;
      this._sig = '';
      this.render();
    }
  },

  handleClick: function(e) {
    var ct = e.target.closest('[data-act]');
    if (!ct) return;
    var act = ct.getAttribute('data-act');
    var arg = ct.getAttribute('data-arg');

    if (act === 'tab') {
      this._tab = arg;
      this._sig = '';
      this.render();
      return;
    }

    if (act === 'buy_module_upg') {
      var modId = ct.getAttribute('data-mod');
      var upgId = arg;
      if (!modId) return;
      var ok = this.buyModuleUpg(modId, upgId);
      if (ok) this.toast('升级成功！', '#4ade80');
      else this.toast('资源不足或已达上限');
      this._sig = '';
      this.render();
      return;
    }

    if (act === 'forge_buy') {
      var key = arg;
      var r = DAO_FORGE.buy(key);
      if (r.ok) {
        var rel = DAO_DATA && DAO_DATA.FORGE_RELICS ? DAO_DATA.FORGE_RELICS[r.relic] : null;
        this.toast('锻造成功！获得 ' + (rel ? rel.icon : '') + ' ' + (rel ? rel.icon || r.relic : r.relic), '#06b6d4');
      } else if (r.reason === 'hunyuan') {
        this.toast('混元不足');
      }
      this._sig = '';
      this.render();
      return;
    }
  },

  /* ---------- 渲染 ---------- */
  render: function() {
    var el = this.el;
    if (!el) return;

    // 生成签名
    var sigParts = [];
    for (var k in DAO_CURDATA) sigParts.push(k + '=' + DAO_CUR.value('dao_' + k).toFixed(1));
    sigParts.push('pp=' + DAO_STATE.progressPrimary.toFixed(3));
    sigParts.push('sp=' + DAO_STATE.progressSecondary.toFixed(3));
    sigParts.push('dp=' + DAO_STATE.progressDiamond.toFixed(3));
    sigParts.push('tab=' + this._tab);
    sigParts.push('shop=' + this._shopFeature);
    sigParts.push('sl=' + (typeof GB_META !== 'undefined' ? GB_META.getLevel() : 0));

    // 升级列表变化也触发重新渲染
    var shopMod = GB_MODULES.get(this._shopFeature);
    if (shopMod && shopMod.core && shopMod.core.UPG) {
      var upg = shopMod.core.UPG;
      if (upg.levels) for (var id in upg.levels) sigParts.push(id + '=' + upg.levels[id]);
    }

    var sig = sigParts.join('|');
    if (sig === this._sig) return;
    this._sig = sig;

    el.querySelector('.dao-col-gems').innerHTML = this.renderGems();
    el.querySelector('.dao-col-progress').innerHTML = this.renderProgress();
    el.querySelector('.dao-col-shop').innerHTML = this.renderShop();
  },

  /* ---------- 左列：7 元宝石卡片（GemList.vue） ---------- */
  renderGems: function() {
    var gems = ['chiyuan', 'qingyuan', 'ziyuan', 'xuanyuan', 'huangyuan', 'hunyuan', 'daoyuan'];
    var items = gems.map((function(k) {
      var data = DAO_CURDATA[k];
      if (!data) return '';
      var v = DAO_CUR.value('dao_' + k);
      var cap = DAO_CUR.cap('dao_' + k);
      var hasCap = isFinite(cap) && cap !== Infinity && cap > 0;
      var pct = hasCap ? Math.min(100, (v / cap) * 100) : 0;
      return '' +
        '<div class="dao-gem-card">' +
          '<div class="dao-gem-icon" style="background:' + data.color + '22;border-color:' + data.color + '55;">' +
            this.icon(data.icon, 24, data.color) +
          '</div>' +
          '<div class="dao-gem-name">' + data.name + '</div>' +
          '<div class="dao-gem-value" style="color:' + data.color + ';">' + this.fmt(v) + '</div>' +
          (hasCap ?
            '<div class="dao-gem-cap-bar"><div style="width:' + pct + '%;background:' + data.color + ';"></div></div>' +
            '<div class="dao-gem-cap">/' + this.fmt(cap) + '</div>' : '') +
        '</div>';
    }).bind(this)).join('');
    return '' +
      '<div class="dao-col-title">七元 · 自动产出</div>' +
      '<div class="dao-gem-list">' + items + '</div>';
  },

  /* ---------- 中列：三进度条（Gem.vue 第 14-23 行） ---------- */
  renderProgress: function() {
    var pp = DAO_STATE.progressPrimary;
    var ppct = Math.min(100, pp * 100);
    var timeNext = Math.ceil((1 - pp) * this.timePerPrimary());
    var timePer = this.timePerPrimary();
    var speedInc = (typeof GB_META !== 'undefined' ? GB_META.getLevel() : 0) * 1; // 1% per level
    var speedIncTotal = speedInc;

    var sp = DAO_STATE.progressSecondary;
    var spct = Math.min(100, sp * 100);
    var timeNextSec = Math.ceil((1 - sp) * this.timePerSecondary());
    var timePerSec = this.timePerSecondary();
    var speedIncSec = (typeof GB_META !== 'undefined' ? GB_META.getLevel() : 0) * 0.5;

    var html = '';

    // 主进度（Ruby + Emerald = 赤元 + 青元）
    html += '<div class="dao-prog-wrap">' +
      '<div class="dao-prog-bar dao-prog-primary" style="--pct:' + ppct + '%;">' +
        '<div class="dao-prog-fill" style="width:' + ppct + '%;"></div>' +
        '<div class="dao-prog-text">' + this.fmtTime(timeNext) + '</div>' +
      '</div>' +
      '<div class="dao-prog-desc">' +
        '每 ' + this.fmtTime(timePer) + '秒产赤元+青元' +
        (typeof GB_META !== 'undefined' ? ' · 道行 +' + speedInc.toFixed(0) + '%/级' : '') +
      '</div>' +
    '</div>';

    // 次进度（Sapphire + Amethyst + Topaz = 玄元+紫元+黄元）
    html += '<div class="dao-prog-wrap">' +
      '<div class="dao-prog-bar dao-prog-secondary" style="--pct:' + spct + '%;">' +
        '<div class="dao-prog-fill" style="width:' + spct + '%;"></div>' +
        '<div class="dao-prog-text">' + this.fmtTime(timeNextSec) + '</div>' +
      '</div>' +
      '<div class="dao-prog-desc">' +
        '每 ' + this.fmtTime(timePerSec) + '秒产玄元+紫元+黄元' +
        (typeof GB_META !== 'undefined' ? ' · 道行 +' + speedIncSec.toFixed(1) + '%/级' : '') +
      '</div>' +
    '</div>';

    // 稀有进度（Diamond = 混元）
    var diamondUnlocked = typeof GB_UNLOCK !== 'undefined' && GB_UNLOCK.isUnlocked('daoGemDiamondSubfeature');
    if (diamondUnlocked) {
      var dp = DAO_STATE.progressDiamond;
      var dpct = Math.min(100, dp * 100);
      var timeNextD = Math.ceil((1 - dp) * this.timePerDiamond());
      html += '<div class="dao-prog-wrap">' +
        '<div class="dao-prog-bar dao-prog-diamond" style="--pct:' + dpct + '%;">' +
          '<div class="dao-prog-fill" style="width:' + dpct + '%;"></div>' +
          '<div class="dao-prog-text">' + this.fmtTime(timeNextD) + '</div>' +
        '</div>' +
        '<div class="dao-prog-desc">每 ' + this.fmtTime(this.timePerDiamond()) + '秒产 混元（锻造用）</div>' +
      '</div>';
    } else {
      html += '<div class="dao-prog-wrap">' +
        '<div class="dao-prog-bar dao-prog-locked">' +
          '<div class="dao-prog-text">🔒 需道行 50 解锁</div>' +
        '</div>' +
      '</div>';
    }

    return html;
  },

  /* ---------- 右列：下拉框 + 升级/锻造切换（Gem.vue 第 26-35 行） ---------- */
  renderShop: function() {
    var features = this.shopFeatures();

    // 切换按钮（anvil icon —— 对齐 Gem.vue 第 32 行 v-btn color="cyan" icon）
    // 始终显示，未解锁混元时 disabled（但升级列表的下拉框始终可见）
    var diamondUnlocked = typeof GB_UNLOCK !== 'undefined' && GB_UNLOCK.isUnlocked('daoGemDiamondSubfeature');
    var tabLabel = this._tab === 'forge' ? '锻造列表' : '高级升级';
    var otherTab = this._tab === 'forge' ? 'upgrade' : 'forge';
    var otherLabel = this._tab === 'forge' ? '高级升级' : '锻造列表';
    var anvilIcon = diamondUnlocked ? 'mdi-anvil' : 'mdi-anvil';
    var toggleBtn = '' +
      '<button class="dao-mode-btn ' + (this._tab === 'forge' ? 'active' : '') + '" ' +
              'data-act="tab" data-arg="' + otherTab + '" ' +
              'title="切换到 ' + otherLabel + '">' +
        this.icon(anvilIcon, 18) +
      '</button>';

    var shopHeader = '';
    if (this._tab === 'forge') {
      // 锻造模式 —— 大标题 + anvil glow（对齐 Gem.vue 第 27 行 diamond-forge）
      var hunyuan = DAO_CUR.value('dao_hunyuan');
      shopHeader = '' +
        '<div class="dao-forge-header">' +
          '<div class="dao-forge-title">⚒ 混元锻造</div>' +
          '<div class="dao-forge-hunyuan">' + this.icon('mdi-diamond', 16, '#06b6d4') + ' ' + this.fmt(hunyuan) + '</div>' +
          toggleBtn +
        '</div>';
    } else {
      // 升级模式 —— 下拉框（对齐 Gem.vue 第 28-31 行 v-select）
      var optionsHtml = features.map((function(f) {
        return '<option value="' + f.id + '"' + (f.id === this._shopFeature ? ' selected' : '') + '>' + f.name + '</option>';
      }).bind(this)).join('');
      shopHeader = '' +
        '<div class="dao-shop-header">' +
          '<select class="dao-shop-select" data-act="shop_select">' +
            optionsHtml +
          '</select>' +
          toggleBtn +
        '</div>';
    }

    var bodyHtml = this._tab === 'forge' ? this.renderForge(diamondUnlocked) : this.renderUpgrade();
    return shopHeader + bodyHtml;
  },

  /* ---------- 锻造列表（DiamondForge + ForgeItem） ---------- */
  renderForge: function(diamondUnlocked) {
    if (!diamondUnlocked) {
      return '<div class="dao-empty">' +
        '<div class="dao-empty-msg">🔒 混元锻造</div>' +
        '<div class="dao-empty-hint">需道行 50 解锁混元产出</div>' +
        '<div class="dao-empty-hint" style="margin-top:8px;">混元可锻造跨界神器，为各模块提供加成</div>' +
      '</div>';
    }
    var items = DAO_FORGE.list();
    if (items.length === 0) {
      return '<div class="dao-empty"><div class="dao-empty-msg">所有跨界神器已锻造完毕</div></div>';
    }
    return items.map((function(key) {
      var def = DAO_FORGE.defs[key];
      var relicDef = DAO_DATA && DAO_DATA.FORGE_RELICS ? DAO_DATA.FORGE_RELICS[def.relic] : null;
      var relic = DAO_FORGE.state[def.relic];
      var canAfford = DAO_CUR.value('dao_hunyuan') >= def.price;
      var typeLabel = def.type === 'upgrade' ? ('升级 Lv' + def.upgradeLevel + ' → Lv' + (def.upgradeLevel + 1)) : '首次获取';

      var name = '';
      if (relicDef) name = relicDef.icon ? relicDef.icon : '';
      name += ' ' + this.relicName(def.relic);
      if (def.type === 'upgrade') name += ' ↗';

      var effectsHtml = '';
      if (relicDef && typeof relicDef.effect === 'function') {
        var nextLevel = def.type === 'upgrade' ? (def.upgradeLevel + 1) : 1;
        var effs = relicDef.effect(nextLevel);
        effectsHtml = effs.map((function(eff) {
          return '<div class="dao-forge-eff">· ' + this.effectName(eff.name) + ' ' + this.effectValueStr(eff) + '</div>';
        }).bind(this)).join('');
      }

      return '' +
        '<div class="dao-forge-card">' +
          '<div class="dao-forge-icon" style="background:' + (relicDef ? relicDef.color : '#06b6d4') + '22;border-color:' + (relicDef ? relicDef.color : '#06b6d4') + '55;">' +
            (relicDef ? this.icon(relicDef.icon, 26, relicDef.color) : '') +
          '</div>' +
          '<div class="dao-forge-info">' +
            '<div class="dao-forge-name">' + name + '</div>' +
            '<div class="dao-forge-type">' + typeLabel + '</div>' +
            effectsHtml +
          '</div>' +
          '<button class="dao-forge-buy ' + (canAfford ? '' : 'disabled') + '" ' +
                  'data-act="forge_buy" data-arg="' + key + '" ' +
                  (canAfford ? '' : 'disabled') + '>' +
            this.icon('mdi-diamond', 14, '#06b6d4') + ' ' + def.price +
          '</button>' +
        '</div>';
    }).bind(this)).join('');
  },

  /* ---------- 升级列表（UpgradeList.vue :feature type="premium" no-tabs） ---------- */
  renderUpgrade: function() {
    var features = this.shopFeatures();
    var modId = this._shopFeature;
    var mod = GB_MODULES.get(modId);
    if (!mod) return '<div class="dao-empty"><div class="dao-empty-msg">玩法未解锁</div></div>';

    var modName = '大道法则';
    for (var i = 0; i < features.length; i++) if (features[i].id === modId) modName = features[i].name;

    var upgIds = this.getModulePremiums(modId);
    if (upgIds.length === 0) {
      return '<div class="dao-empty">' +
        '<div class="dao-empty-msg">' + modName + ' 暂无高级升级</div>' +
        '<div class="dao-empty-hint">各玩法的高级升级在此展示</div>' +
      '</div>';
    }

    return '' +
      '<div class="dao-upg-header">' + modName + ' · 高级升级</div>' +
      upgIds.map((function(id) {
        var def = this.getModuleUpgDef(modId, id);
        if (!def) return '';
        var lvl = this.getModuleUpgLevel(modId, id);
        var maxed = (def.cap != null && isFinite(def.cap)) && lvl >= def.cap;
        var price = this.getModuleUpgPrice(modId, id);
        var canAfford = this.canAffordPrice(price);

        var effectHtml = '';
        if (def.effect && def.effect.length) {
          effectHtml = def.effect.map((function(eff) {
            var curVal = lvl > 0 ? this.effectValueStr(eff, lvl) : null;
            var nextVal = !maxed ? this.effectValueStr(eff, lvl + 1) : null;
            var str = this.effectName(eff.name) + ' ';
            if (curVal !== null) str += curVal;
            if (nextVal !== null) str += ' → <span class="dao-upg-next">' + nextVal + '</span>';
            return '<div class="dao-upg-eff">' + str + '</div>';
          }).bind(this)).join('');
        }

        var priceStr = this.priceStr(price);
        var btnText = maxed ? '已满级' : priceStr ? '参悟 ' + priceStr : '参悟';

        return '' +
          '<div class="dao-upg-card' + (maxed ? ' maxed' : '') + '">' +
            '<div class="dao-upg-title">' + this.upgTitle(modId, id, def.name || def.key) + '</div>' +
            '<div class="dao-upg-lv">Lv ' + lvl + (def.cap != null && isFinite(def.cap) ? ' / ' + def.cap : '') + '</div>' +
            effectHtml +
            '<button class="dao-upg-buy ' + (!maxed && canAfford ? 'can-afford' : '') + '" ' +
                    'data-act="buy_module_upg" data-mod="' + modId + '" data-arg="' + id + '" ' +
                    (maxed || !canAfford ? 'disabled' : '') + '>' +
              btnText +
            '</button>' +
          '</div>';
      }).bind(this)).join('');
  },

  /* ---------- 辅助 ---------- */

  /* 升级 key → 中文标题（各模块 premium 升级） */
  UPG_NAME_MAP: {
    // 灵脉 mining
    moreDamage: '强化打击', moreScrap: '矿石增产', moreGreenCrystal: '绿晶增产',
    moreRareEarth: '稀土增产', fasterSmeltery: '冶炼加速', moreResin: '树脂增产',
    premiumCraftingSlots: '高级锻造槽',
    moreAluminium: '铝锭增产', moreCopper: '铜锭增产', moreTin: '锡锭增产',
    moreIron: '铁锭增产', moreTitanium: '钛锭增产', morePlatinum: '铂金增产',
    moreIridium: '铱锭增产', moreOsmium: '锇锭增产', moreLead: '铅锭增产',
    moreHelium: '氦气增产', moreSmoke: '烟雾增产', moreNeon: '霓虹增产',
    moreArgon: '氩气增产', moreKrypton: '氪气增产',
    // 宗门 village
    overtime: '加班加点', goldenThrone: '黄金王座', fasterBuilding: '建筑加速',
    moreFaith: '信仰增产', morePlantFiber: '植物纤维', moreWood: '木材增产',
    moreStone: '石料增产', moreMetal: '金属增产', moreWater: '水源增产',
    moreGlass: '玻璃增产', moreHardwood: '硬木增产', moreGem: '宝石增产',
    moreKnowledge: '学识增产', moreScience: '科技增产', moreOil: '油料增产',
    moreMarble: '大理石增产',
    // 降妖 horde
    morePower: '妖力增强', moreBones: '妖骨增产', moreMonsterParts: '妖材增产',
    moreMastery: '精通提升',
    ancientPower: '古神之力', ancientFortitude: '古神坚韧', ancientWealth: '古神财富',
    ancientSpirit: '古神之灵', ancientSharpsight: '古神锐眼', ancientReaping: '古神收割',
    ancientRemembrance: '古神追忆', ancientHolding: '古神持有', ancientExpertise: '古神专精',
    ancientMystery: '古神神秘', ancientFreezing: '古神冻结',
    moreBlood: '妖血增产', moreCourage: '妖勇增产',
    // 灵植园 farm
    biggerVegetables: '蔬菜硕大', biggerBerries: '浆果硕大', biggerGrain: '谷物硕大',
    biggerFlowers: '花朵硕大', moreExperience: '经验增产',
    premiumGardenGnome: '园圃地精', premiumSprinkler: '自动喷灌',
    premiumLectern: '古籍台', premiumPinwheel: '紫风车', premiumFlag: '紫旗帜',
    // 道院 school
    student: '收徒传道',
    // 灵宝 treasure
    moreSlots: '槽位扩展', moreFragments: '碎片增产',
    // 大道法则 gem/dao
    huangyuanBag: '黄元袋',
  },

  /* 获取 const 声明的全局变量（const 不挂到 window 上） */
  _getGlobal: function(name) {
    try { return new Function('return ' + name)(); } catch(e) { return null; }
  },

  /* 升级 key → 中文标题
   * 优先查各模块自己的 TEXT.UPGRADE（项目原生修仙风翻译）
   * fallback 到本地 UPG_NAME_MAP */
  upgTitle: function(modId, upgId, defName) {
    // 模块前缀映射到 TEXT 对象名
    var textMap = {
      lm: 'LM_TEXT',
      vill: 'VI_TEXT', vi: 'VI_TEXT',
      horde: 'HO_TEXT', ho: 'HO_TEXT',
      farm: 'FA_TEXT', fa: 'FA_TEXT',
      school: 'SC_TEXT', sc: 'SC_TEXT',
      ruin: 'RU_TEXT', ru: 'RU_TEXT',
      dao: null, // 大道法则自己的翻译在本模块
    };
    var textObjName = textMap[modId];
    if (textObjName) {
      var textObj = this._getGlobal(textObjName);
      if (textObj) {
        if (textObj.UPGRADE && textObj.UPGRADE[upgId]) return textObj.UPGRADE[upgId];
        var bareId = upgId.replace(/^(lm_|vi_|ho_|fa_|sc_|ruin_|ru_)/, '');
        if (bareId !== upgId && textObj.UPGRADE[bareId]) return textObj.UPGRADE[bareId];
      }
    }
    // 大道法则自己的翻译查本地 UPG_NAME_MAP
    if (this.UPG_NAME_MAP[upgId]) return this.UPG_NAME_MAP[upgId];
    var bareId2 = upgId.replace(/^(lm_|horde_|village_|farm_|school_|ruin_|treasure_|dao_|vi_|ho_|fa_|sc_|relic_|qk_)/, '');
    if (this.UPG_NAME_MAP[bareId2]) return this.UPG_NAME_MAP[bareId2];
    if (defName) return defName.replace(/([a-z])([A-Z])/g, '$1 $2');
    return upgId.replace(/([a-z])([A-Z])/g, '$1 $2');
  },

  relicName: function(key) {
    var map = {
      hunyuanPickaxe: '混元凿',
      hunyuanHammer: '混元锤',
      hunyuanSword: '混元剑',
      hunyuanShovel: '混元铲',
      hunyuanTalisman: '混元符',
      hunyuanPillar: '混元柱',
      xiangyaoLing: '降妖令',
      qiankunDai: '乾坤袋',
    };
    return map[key] || key;
  },

  /* effect key 动态翻译 —— 优先用各模块 TEXT 字典 */
  _dynEffectName: function(key) {
    // currencyLmXxxGain / currencyLmXxxCap → 查 LM_TEXT.CURRENCY['lm_xxx'] + '产出/上限'
    // 模块映射
    var modMap = [
      { prefix: 'currencyLm', text: 'LM_TEXT', modPrefix: 'lm_' },
      { prefix: 'currencyVillage', text: 'VI_TEXT', modPrefix: 'vill_' },
      { prefix: 'currencyHorde', text: 'HO_TEXT', modPrefix: 'horde_' },
      { prefix: 'currencyDao', text: null, modPrefix: 'dao_' },
      { prefix: 'currencyRuin', text: 'RU_TEXT', modPrefix: 'ru_' },
      { prefix: 'currencyTreasure', text: null, modPrefix: 'treasure_' },
    ];
    for (var i = 0; i < modMap.length; i++) {
      var m = modMap[i];
      if (key.indexOf(m.prefix) === 0) {
        var rest = key.substring(m.prefix.length); // e.g. ScrapGain, OreAluminiumGain
        var suffix = '';
        var curKey = rest;
        if (rest.endsWith('Gain')) { suffix = '产出'; curKey = rest.slice(0, -4); }
        else if (rest.endsWith('Cap')) { suffix = '上限'; curKey = rest.slice(0, -3); }
        // curKey = Scrap, OreAluminium, ...
        // 尝试查 TEXT.CURRENCY[modPrefix + curKey首字母小写+其余]
        var curLow = curKey.charAt(0).toLowerCase() + curKey.slice(1);
        if (m.text) {
          var text = this._getGlobal(m.text);
          if (text) {
            var fullCurKey = m.modPrefix + curLow;
            if (text.CURRENCY && text.CURRENCY[fullCurKey]) return text.CURRENCY[fullCurKey] + suffix;
            if (text.CURRENCY && text.CURRENCY[curLow]) return text.CURRENCY[curLow] + suffix;
          }
        }
        // 无 TEXT 字典的情况（dao 自己的货币）
        if (m.prefix === 'currencyDao') {
          var daoNames = {
            chiyuan: '赤元', qingyuan: '青元', ziyuan: '紫元',
            xuanyuan: '玄元', huangyuan: '黄元', hunyuan: '混元', daoyuan: '道元',
          };
          if (daoNames[curLow]) return daoNames[curLow] + suffix;
        }
        break;
      }
    }

    // lmXxx / hordeXxx / faXxx / schoolXxx / villageXxx → 查 TERMS / UPGRADE
    var modPrefixes = [
      { p: 'lm', text: 'LM_TEXT' }, { p: 'horde', text: 'HO_TEXT' },
      { p: 'village', text: 'VI_TEXT' }, { p: 'fa', text: 'FA_TEXT' },
      { p: 'school', text: 'SC_TEXT' }, { p: 'ruin', text: 'RU_TEXT' },
    ];
    for (var j = 0; j < modPrefixes.length; j++) {
      var mp = modPrefixes[j];
      if (key.indexOf(mp.p) === 0 && key.length > mp.p.length && key[mp.p.length] === key[mp.p.length].toUpperCase()) {
        var rest2 = key.substring(mp.p.length); // e.g. Damage, PremiumOreCap, GasHeliumGain
        var t = this._getGlobal(mp.text);
        if (t) {
          if (t.TERMS && t.TERMS[rest2]) return t.TERMS[rest2];
          if (t.UPGRADE && t.UPGRADE[rest2]) return t.UPGRADE[rest2];
          // 递归去掉嵌套前缀（PremiumOreCap → PremiumOre + Cap → 合成）
          var m2 = rest2.match(/^(.+)(Gain|Cap|Speed)$/);
          if (m2) {
            var head = m2[1]; var suf2 = m2[2] === 'Gain' ? '产出' : (m2[2] === 'Cap' ? '上限' : '速度');
            // head 可能再包含 Ores/Gas/Currencies 等子前缀，尝试拆分
            var subM = head.match(/^(Ore|Gas|Bar|Crystal|Premium)(.+)$/);
            if (subM) {
              var subHead = subM[2]; // 如 Helium, Aluminium, Scrap
              // 查 CURRENCY[mp.p + '_' + subHead.toLowerCase()]
              var cur2 = mp.p + '_' + subHead.toLowerCase();
              if (t.CURRENCY && t.CURRENCY[cur2]) return t.CURRENCY[cur2] + suf2;
            }
            if (t.TERMS && t.TERMS[head]) return t.TERMS[head] + suf2;
            if (t.UPGRADE && t.UPGRADE[head]) return t.UPGRADE[head] + suf2;
          }
        }
        break;
      }
    }

    return null;
  },

  effectName: function(key) {
    // 先尝试从各模块 TEXT 字典动态翻译
    // currencyLmXxxGain / currencyVillageXxxGain / currencyHordeXxxGain → 货币名 + 产出
    // currencyLmXxxCap / ... → 货币名 + 上限
    // lmXxx / villageXxx / hordeXxx / faXxx / schoolXxx → 查 TERMS / UPGRADE / CURRENCY
    var dyn = this._dynEffectName(key);
    if (dyn) return dyn;

    // fallback 静态映射表
    var map = {
      // === 大道法则 currency ===
      currencyDaoChiyuanCap: '赤元上限',
      currencyDaoQingyuanCap: '青元上限',
      currencyDaoZiyuanCap: '紫元上限',
      currencyDaoXuanyuanCap: '玄元上限',
      currencyDaoHuangyuanCap: '黄元上限',
      currencyDaoHunyuanCap: '混元上限',
      currencyDaoDaoyuanCap: '道元上限',
      currencyDaoChiyuanGain: '赤元产出',
      currencyDaoQingyuanGain: '青元产出',
      daoGenSpeedPrimary: '主进度速度',
      daoGenSpeedSecondary: '次进度速度',
      // === 灵脉 mining currency ===
      currencyLmScrapGain: '矿石产出', currencyLmScrapCap: '矿石上限',
      currencyLmGreenCrystalGain: '绿晶产出', currencyLmGreenCrystalCap: '绿晶上限',
      currencyLmRareEarthGain: '稀土产出', currencyLmRareEarthCap: '稀土上限',
      currencyLmResinGain: '树脂产出', currencyLmResinCap: '树脂上限',
      currencyLmOreAluminiumGain: '铝锭产出', currencyLmOreAluminiumCap: '铝锭上限',
      currencyLmOreCopperGain: '铜锭产出', currencyLmOreCopperCap: '铜锭上限',
      currencyLmOreTinGain: '锡锭产出', currencyLmOreTinCap: '锡锭上限',
      currencyLmOreIronGain: '铁锭产出', currencyLmOreIronCap: '铁锭上限',
      currencyLmOreTitaniumGain: '钛锭产出', currencyLmOreTitaniumCap: '钛锭上限',
      currencyLmOrePlatinumGain: '铂金产出', currencyLmOrePlatinumCap: '铂金上限',
      currencyLmOreIridiumGain: '铱锭产出', currencyLmOreIridiumCap: '铱锭上限',
      currencyLmOreOsmiumGain: '锇锭产出', currencyLmOreOsmiumCap: '锇锭上限',
      currencyLmOreLeadGain: '铅锭产出', currencyLmOreLeadCap: '铅锭上限',
      currencyLmGasHeliumGain: '氦气产出', currencyLmGasHeliumCap: '氦气上限',
      currencyLmGasSmokeGain: '烟雾产出', currencyLmGasSmokeCap: '烟雾上限',
      currencyLmGasNeonGain: '霓虹产出', currencyLmGasNeonCap: '霓虹上限',
      currencyLmGasArgonGain: '氩气产出', currencyLmGasArgonCap: '氩气上限',
      currencyLmGasKryptonGain: '氪气产出', currencyLmGasKryptonCap: '氪气上限',
      lmPremiumOreCap: '高级矿上限',
      lmDamage: '灵脉伤害',
      // === 宗门 village currency ===
      currencyVillageCoinGain: '金币产出',
      currencyVillageFaithGain: '信仰产出', currencyVillageFaithCap: '信仰上限',
      currencyVillagePlantFiberGain: '植物纤维产出', currencyVillagePlantFiberCap: '植物纤维上限',
      currencyVillageWoodGain: '木材产出', currencyVillageWoodCap: '木材上限',
      currencyVillageStoneGain: '石料产出', currencyVillageStoneCap: '石料上限',
      currencyVillageMetalGain: '金属产出', currencyVillageMetalCap: '金属上限',
      currencyVillageWaterGain: '水源产出', currencyVillageWaterCap: '水源上限',
      currencyVillageGlassGain: '玻璃产出', currencyVillageGlassCap: '玻璃上限',
      currencyVillageHardwoodGain: '硬木产出', currencyVillageHardwoodCap: '硬木上限',
      currencyVillageGemGain: '宝石产出', currencyVillageGemCap: '宝石上限',
      currencyVillageKnowledgeGain: '学识产出', currencyVillageKnowledgeCap: '学识上限',
      currencyVillageScienceGain: '科技产出', currencyVillageScienceCap: '科技上限',
      currencyVillageOilGain: '油料产出', currencyVillageOilCap: '油料上限',
      currencyVillageMarbleGain: '大理石产出', currencyVillageMarbleCap: '大理石上限',
      villageMaterialGain: '宗门材料产出',
      queueSpeedVillageBuilding: '建筑队列速度',
      villagePremiumResourceCap: '高级材料上限',
      // === 降妖 horde currency ===
      currencyHordeBoneGain: '妖骨产出', currencyHordeBoneCap: '妖骨上限',
      currencyHordeMonsterPartGain: '妖材产出', currencyHordeMonsterPartCap: '妖材上限',
      currencyHordeBloodGain: '妖血产出', currencyHordeBloodCap: '妖血上限',
      currencyHordeCourageGain: '妖勇产出', currencyHordeCourageCap: '妖勇上限',
      hordeAttack: '攻击',
      hordeHealth: '生命',
      hordePremiumAncientCap: '古神上限',
      hordeCardCap: '降妖令上限',
      hordeMasteryGain: '精通产出',
      // === 灵植园 farm ===
      faCropGain: '作物产出',
      // === 秘境 ruin / gallery ===
      ruinPremiumArtifactCap: '神器上限',
      currencyRuinRelicGain: '神器产出',
      // === 灵宝 treasure ===
      relicPedestal0: '灵宝底座槽位',
      relicPedestal1: '灵宝展示槽位',
      treasureSlots: '灵宝槽位',
      treasureFragmentGain: '碎片产出',
    };
    return map[key] || key;
  },

  effectValueStr: function(eff, lvl) {
    var val;
    if (eff.value === undefined) val = 0;
    else if (typeof eff.value === 'function') val = eff.value(lvl || 1);
    else val = eff.value;

    if (eff.type === 'mult') {
      if (typeof val === 'number' && val >= 0.9 && val <= 1.1) return Math.round(val * 100) + '%';
      return '×' + (typeof val === 'number' ? val.toFixed(val < 10 ? 2 : 0) : val);
    }
    if (eff.type === 'bonus') {
      return '+' + (typeof val === 'number' ? this.fmt(val) : val);
    }
    if (eff.type === 'base') {
      return '+' + (typeof val === 'number' ? this.fmt(val) : val);
    }
    return String(val);
  },

  priceStr: function(price) {
    if (!price || typeof price !== 'object') return '';
    var parts = [];
    for (var k in price) {
      // gem_ruby → 赤元, gem_emerald → 青元, ...
      var name = this.gemKeyToName(k);
      if (name === k) {
        // 不是 gem_ 前缀，可能是 dao_xxx 或其他
        name = this.daoKeyToName(k);
      }
      parts.push(this.fmt(price[k]) + ' ' + name);
    }
    return parts.join(' · ');
  },

  /* 把 price 里所有 gem_ 前缀转换成 dao_ 前缀，返回 { dao_xxx: amount } 用于查询 DAO_CUR */
  normalizePrice: function(price) {
    if (!price || typeof price !== 'object') return {};
    var result = {};
    for (var k in price) {
      if (this.GEM_CUR_MAP[k]) {
        result[this.GEM_CUR_MAP[k].dao] = price[k];
      } else {
        result[k] = price[k];
      }
    }
    return result;
  },

  canAffordPrice: function(price) {
    var norm = this.normalizePrice(price);
    for (var k in norm) {
      if (DAO_CUR.value(k) < norm[k]) return false;
    }
    return true;
  },
};

if (typeof window !== 'undefined') {
  window.GB_DAO_VIEW = GB_DAO_VIEW;
}
