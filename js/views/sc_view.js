/* ============================================================
 * sc_view.js ——「藏经阁（school）」主视图：复刻 gooboo School.vue
 *
 * 布局：
 *   tabs：学科(school) | 藏书阁(library，需 unlock.scLibrarySubfeature.see)
 *   学科页：顶部考签区 + dustMult 新手提示 + multipass 输入 + 五学科卡片
 *   藏书阁页：booksLeft/maxBooks + feature 筛选 + 书籍卡片网格
 *   小游戏：演算(算术)/文墨(打字)/史卷(配对)/绘卷(调色)/丹术(炼金观气)
 *          含 practice（无限）/study（40s）/exam（75s）三种模式。
 * 本模块自带独立存档('xzdz_gooboo_school_save')与独立 1s 循环。
 * ============================================================ */

/* 文墨小游戏词表（照抄 gooboo words.js 的 wordList，按字数分组 2~10 字） */
const SC_WORDS = [
  ['be','in','on','at','we','do','to','of','it','he','by','or',
   'as','if','up','me','no','us','so','go','is'],
  ['and','she','too','for','you','his','her','say','but','egg',
   'not','can','who','get','all','one','out','see','now','how',
   'why','our','two','way','new','day','use','man','any','may',
   'try','ask','own','put','old','let','big','few','run','off',
   'six','ten','odd','low','gem','bed','mud','cow','pig','men',
   'bad','sun','win','cat','dog','log','end','fun','lot','eye',
   'job','far','red','yes'],
  ['have','four','five','nine','that','this','they','with','from',
   'what','make','know','will','time','year','when','them','some',
   'home','take','food','into','just','your','come','than','like',
   'then','more','want','look','also','here','many','well','only',
   'tell','very','even','back','good','life','work','down','call',
   'over','last','need','feel','high','most','much','mean','keep',
   'same','seem','help','talk','turn','hand','show','part','such',
   'case','farm','mine','note','week','each','hear','play','move',
   'live','hold','next','must','room','area','lamp','lamb','word',
   'list','test','text','exam','book','dust','easy','hard','evil',
   'rain','dark','duck','game','lose','cake','fish','wood','tree',
   'mind','join','loop','card','left','side','kind','head','blue',
   'pink','long','both','hour'],
  ['woman','women','grade','house','table','where','relic','event',
   'trial','exist','would','about','there','think','which','witch',
   'three','seven','eight','brain','could','cloud','light','other',
   'these','goose','guilt','thing','those','child','world','slice',
   'still','water','stone','metal','state','never','night','group',
   'leave','while','great','begin','issue','every','start','sheep',
   'place','again','power','small','large','point','score','after',
   'under','write','money','right','study','close','black','white',
   'brown','green','short','since','among','chaos','order'],
  ['people','reason','should','school','always','become','really',
   'friend','family','sister','mother','father','repeat','system',
   'option','choice','during','number','happen','ignore','wealth',
   'before','nation','though','yellow','orange','purple','little',
   'around','member','almost','change','minute','second','follow',
   'social','parent','create','public','office','health','person',
   'nature','moment','enough','toward','market','former','theory',
   'recent','figure','doctor','chance','energy','likely','course',
   'period'],
  ['because','through','village','gallery','chicken','between',
   'another','brother','student','teacher','country','problem',
   'shelter','against','company','control','program','without',
   'million','warning','provide','service','however','include',
   'exclude','century','several','nothing','whether','weather',
   'already','history','science','morning','evening','suggest',
   'perhaps','require','explain','develop','society','support',
   'project'],
  ['treasure','universe','question','sentence','national','business',
   'remember','continue','together','anything','research','although',
   'consider','actually','probably','interest','possible','decision',
   'building','activity','industry','practice','describe','personal',
   'computer','evidence','material','security','increase','movement'],
  ['something','different','important','political','community',
   'president','principal','education','sometimes','according',
   'situation','attention','difficult','available','condition',
   'determine','recognize','character'],
  ['government','understand','everything','protection','experience',
   'impossible','difference','suggestion','especially','technology',
   'experiment','population','individual']
];

var GB_SC_VIEW = {
  tab: 'school',
  el: null,
  SAVE_KEY: 'xzdz_gooboo_school_save',
  name: '藏经阁',
  _loop: null,

  /* --- 小游戏 / 流程状态 --- */
  playing: null,   // 当前学科
  mode: null,      // practice | study | exam
  timer: 0,
  score: 0,
  _schoolInt: null,
  _mgInt: null,
  multipass: 1,
  mg: {},          // 当前小游戏状态
  customTimer: ['history', 'chemistry'],

  /* --- 金尘时间跳过弹窗 --- */
  _dlgOpen: false,
  _dlgMinute: 5,   // 默认跳过 5 分钟

  toast(msg, color) { if (typeof GB_APP !== 'undefined' && GB_APP.toast) GB_APP.toast(msg, color); },

  /* ---------- 文案 ---------- */
  T(n) { const x = SC_TEXT && SC_TEXT.TERMS; return (x && x[n]) || n; },
  curName(k) { const x = SC_TEXT && SC_TEXT.CURRENCY; return (x && x[k]) || String(k).replace(/^school_/, '').replace(/^gem_/, ''); },
  subjName(k) { const x = SC_TEXT && SC_TEXT.SUBJECT; return (x && x[k]) || k; },
  subjSubtitle(k) { const x = SC_TEXT && SC_TEXT.SUBJECT; return (x && x[k + '_subtitle']) || ''; },
  subjDesc(k) { const x = SC_TEXT && SC_TEXT.SUBJECT; return (x && x[k + '_description']) || ''; },
  featName(k) { const x = SC_TEXT && SC_TEXT.FEATURE; return (x && x[k]) || k; },
  upgName(k) { const x = SC_TEXT && SC_TEXT.UPGRADE; return (x && x[k]) || k; },
  featIcon(k) { return ({ mining: 'mdi-pickaxe', village: 'mdi-home-group', farm: 'mdi-carrot', horde: 'mdi-sword', gallery: 'mdi-palette' })[k] || 'mdi-book'; },
  bookName(feature, name) {
    // 为典籍生成更像样的书名（不再只显示"宗门 · 上限"）
    try {
      const book = SC_RT.state.book[feature + '_' + name];
      if (book && book.effect && book.effect[0]) {
        const e = book.effect[0];
        const nm = String(e.name);
        const target = SC_TEXT.FEATURE[feature] || feature;
        // 通用中文名字典（按 effect 名 → 中文名）
        const zhMap = {
          currencyVillageCoinCap: '灵石上限',
          currencyVillagePlantFiberCap: '灵草上限',
          currencyVillagePlantFiberGain: '灵草产出',
          currencyVillageWoodCap: '灵木上限',
          currencyVillageWoodGain: '灵木产出',
          currencyVillageStoneCap: '山石上限',
          currencyVillageStoneGain: '山石产出',
          currencyVillageMetalCap: '精铁上限',
          currencyVillageMetalGain: '精铁产出',
          currencyVillageWaterCap: '灵泉上限',
          currencyVillageWaterGain: '灵泉产出',
          currencyVillageGlassCap: '琉璃上限',
          currencyVillageGlassGain: '琉璃产出',
          currencyVillageHardwoodCap: '紫檀上限',
          currencyVillageHardwoodGain: '紫檀产出',
          currencyVillageGemCap: '灵石矿上限',
          currencyVillageGemGain: '灵石矿产出',
          currencyVillageMarbleCap: '云纹石上限',
          currencyVillageKnowledgeCap: '智识上限',
          currencyVillageFaithCap: '虔诚上限',
          currencyVillageFaithGain: '虔诚产出',
          currencyVillageScienceCap: '仙研上限',
          currencyVillageJoyCap: '欢愉上限',
          currencyMiningDamage: '灵脉伤害',
          currencyMiningOreAluminiumCap: '铝矿上限',
          currencyMiningOreCopperCap: '铜矿上限',
          currencyMiningOreTinCap: '锡矿上限',
          currencyMiningOreIronCap: '铁矿上限',
          currencyMiningOreTitaniumCap: '钛矿上限',
          currencyMiningOrePlatinumCap: '铂矿上限',
          currencyMiningOreIridiumCap: '铱矿上限',
          currencyMiningOreOsmiumCap: '锇矿上限',
          currencyMiningOreLeadCap: '铅矿上限',
          currencyMiningOreGain: '矿石产出',
          currencyMiningScrapGain: '废料产出',
          currencyMiningScrapCap: '废料上限',
          currencyMiningSmokeCap: '烟雾上限',
          hordeAttack: '降妖攻击',
          hordeHealth: '降妖气血',
          currencyHordeBoneGain: '妖骨产出',
          currencyHordeBoneCap: '妖骨上限',
          hordeEquipmentChance: '装备掉落',
          currencyHordeMonsterPartCap: '妖材上限',
          currencyHordeCorruptedFleshGain: '秽肉产出',
          hordeShardChance: '碎片几率',
          currencyFarmVegetableGain: '灵蔬产出',
          currencyFarmBerryGain: '浆果产出',
          currencyFarmGrainGain: '灵粟产出',
          currencyFarmFlowerGain: '灵花产出',
          currencyFarmGrassCap: '灵草上限',
          currencyFarmSeedHullCap: '种壳上限',
          currencyFarmBugCap: '虫豸上限',
          currencyFarmPetalCap: '花瓣上限',
          currencyFarmButterflyCap: '蝶翼上限',
          currencyFarmLadybugCap: '瓢虫上限',
          currencyFarmSpiderCap: '蛛丝上限',
          currencyFarmBeeCap: '蜂蜡上限',
          currencyFarmSmallSeedCap: '细种上限',
          currencyGalleryRedGain: '丹砂产出',
          currencyGalleryConverterCap: '绘炉上限',
          currencyGalleryPackageCap: '绢帛上限',
          galleryShapeGain: '形意产出',
          galleryColorDrumCap: '彩鼓上限',
          galleryCanvasSpeed: '画布速度'
        };
        if (zhMap[nm]) return target + ' · ' + zhMap[nm];
        // 通用回退
        if (/Cap$/.test(nm)) return target + ' · 上限';
        if (/Gain$/.test(nm)) return target + ' · 产出';
        if (/Damage|Attack/.test(nm)) return target + ' · 攻击';
        if (/Health/.test(nm)) return target + ' · 气血';
      }
    } catch (e) { /* ignore */ }
    return (SC_TEXT && SC_TEXT.FEATURE && SC_TEXT.FEATURE[feature] ? SC_TEXT.FEATURE[feature] + ' · ' : '') + name;
  },
  gradeStr(g) { return formatGrade(g); },
  icon(n, s, c) { try { return GB_ICON.icon(n, s || 18, c || ''); } catch (e) { return ''; } },
  safe(fn, d) { try { const v = fn(); return (v === undefined || v === null) ? d : v; } catch (e) { return d; } },
  fmt(v) { return formatNum(v); },
  fmtTime(s) { s = Math.max(0, Math.ceil(s || 0)); const m = Math.floor(s / 60); const sec = s % 60; const p = (n) => String(n).padStart(2, '0'); return m + ':' + p(sec); },

  /* ---------- 便捷访问 ---------- */
  get state() { return SC_RT.state; },
  subj(k) {
    const s = this.state.subject[k];
    if (!s) return s;
    // math 考题数 ÷3（老存档兼容）
    if (k === 'math' && s.scoreGoal > 10) {
      return Object.assign({}, s, { scoreGoal: Math.max(1, Math.ceil(s.scoreGoal / 3)) });
    }
    return s;
  },
  mget(name, base, mult) { try { return SC_MULT.get(name, base, mult); } catch (e) { return 0; } },
  cur(k) { return SC_CUR.value(k); },
  curCap(k) { return SC_CUR.cap(k); },
  isVisible(id) { return SC_UNLOCK.isVisible(id); },
  canSeeLibrary() { return this.isVisible('scLibrarySubfeature'); },
  maxMultipass() { return this.mget('schoolMultipass'); },

  /* ---------- 生命周期 ---------- */
  mount(root) {
    if (this.el === root) { this.startLoop(); this.render(); return; }
    if (this.el) this.unload();
    this.el = root;
    // 统一地基：模块已在启动时 load，mount 不重复载入（避免丢弃未存档进度）
    if (!SC_RT.ready) this.load();
    this.startLoop();
    root.innerHTML = `
      <div class="gb-tabs" id="sc-tabs"></div>
      <div class="flex1 scroll-container" id="sc-content"></div>`;
    // 保存 handler 引用以便 unload 时移除，防止重复绑定
    this._scClickHandler = (e) => this.onClick(e);
    root.addEventListener('click', this._scClickHandler);
    this.render();
  },
  unload() {
    if (this.el) this.save();
    // 移除 click 事件委托，防止多次 navigate 后累积多个 listener
    if (this._scClickHandler && this.el) {
      try { this.el.removeEventListener('click', this._scClickHandler); } catch (e) {}
      this._scClickHandler = null;
    }
    // 清理游戏状态（防止 playing/mg 残留导致 render 走错分支）
    if (this.playing) this.leaveSchool();
    this.stopLoop();
    this.stopAllIntervals();
    this.el = null;
  },
  setTab(t) { this.tab = t; this._resetScroll = true; this.render(); },

  /* ---------- 事件（事件委托） ---------- */
  onClick(e) {
    const el = e.target.closest('[data-sact]');
    if (!el) return;
    const [tag, val] = el.getAttribute('data-sact').split(':');
    // tab 切换：先退出当前游戏，否则 render() 会继续渲染 playing 界面
    if (tag === 'tab') { if (this.playing) this.leaveSchool(); this.setTab(val); return; }
    if (tag === 'convert') { SC_RT.act('convertPass'); this.save(); this.render(); return; }
    if (tag === 'practice') { this.startPractice(val); return; }
    if (tag === 'study') { this.startStudy(val); return; }
    if (tag === 'exam') { this.startExam(val); return; }
    if (tag === 'gradePlus') { this.addGrade(val); this.save(); this.render(); return; }
    if (tag === 'gradeMinus') { this.removeGrade(val); this.save(); this.render(); return; }
    if (tag === 'skip') { SC_RT.act('skipBook', val); this.save(); this.render(); return; }
    if (tag === 'read') { SC_RT.act('readBook', val); this.save(); this.render(); return; }
    if (tag === 'feat') { this._libFeature = val; this.render(); return; }
    // --- 金尘时间跳过（委托给全局 GB_TIME_SKIP） ---
    if (tag === 'openTs') { GB_TIME_SKIP && GB_TIME_SKIP.open(); return; }
    if (tag === 'leave') {
      if (this.mode === 'study' && this.score > 0) {
        // 研习中途退出 = 结算当前得分（自动加 pointsTotal + progress）
        this.finishSchool(this.score);
      } else {
        this.leaveSchool();
        this.render();
      }
      return;
    }
    if (tag === 'mg-answer') { this.mgAnswer(); return; }
    if (tag === 'mg-art') { this.mgArtAnswer(+val); return; }
    if (tag === 'zf-cell') { this.mgZfClickCell(val); return; }
    if (tag === 'zf-restart') { this.mgZfRestart(); return; }
    if (tag === 'zf-hint') { this.mgZfHint(); return; }
    if (tag === 'zf-surrender') { this.mgZfSurrender(); return; }
    if (tag === 'zf-tool') { this.mg.zfTool = val; this.render(true); return; }
    if (tag === 'mg-chem-submit') { this.mgChemSubmit(); return; }
    if (tag === 'idiom-cell') { this.mgLitClickCell(val); return; }
    if (tag === 'idiom-choice') { this.mgLitClickChoice(parseInt(val)); return; }
    if (tag === 'idiom-next') { this.mgLitNext(); return; }
    if (this.playing) this.mgInlineClick(tag, val);
  },
  mgInputs() {},

  /* ---------- 学科 grade 增减 / 跳书 ---------- */
  addGrade(name) {
    const s = this.subj(name);
    SCTORE.commit('school/updateSubjectKey', { name, key: 'currentGrade', value: Math.min(s.currentGrade + 1, s.grade) });
  },
  removeGrade(name) {
    const s = this.subj(name);
    SCTORE.commit('school/updateSubjectKey', { name, key: 'currentGrade', value: Math.max(s.currentGrade - 1, 0) });
  },

  /* ================= 存档 / 循环 ================= */
  load() {
    try { SC_BOOT({}); } catch (e) {}
    try {
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && typeof saved === 'object') {
          const st = { subject: {}, book: {}, currencyVals: {} };
          SC_BOOT(st);
          try { SC_RT.loadGame(saved); } catch (e) {}
          // 初始给少量考签 & 蓝宝石，便于体验
          SC_CUR.values['school_examPass'] = Math.max(SC_CUR.value('school_examPass'), saved._seedPass || 0);
        }
      }
    } catch (e) { /* ignore */ }
    this._seedHandouts();
    this._settle();
  },
  /* 开局发放：3 张考签、20 蓝宝、2 翡翠 便于上手 */
  _seedHandouts() {
    const st = this.state;
    if (!st) return;
    SC_CUR.values['school_examPass'] = Math.max(SC_CUR.value('school_examPass'), 3);
    SC_CUR.values['gem_sapphire'] = Math.max(SC_CUR.value('gem_sapphire'), 20);
    SC_CUR.values['gem_emerald'] = Math.max(SC_CUR.value('gem_emerald'), 5);
  },
  _settle() {
    try {
      // scFeature 的解锁现在由 GB_UNLOCK + GB_META 全局管理（globalLevel 阈值 25）
      // 开局已有库功能可看（默认），便于显示藏书阁
      if (this.state && !this.isVisible('scLibrarySubfeature')) SC_UNLOCK.unlock('scLibrarySubfeature');
      this.multipass = this.state.multipass || 1;
      this.refreshBindings();
    } catch (e) { /* ignore */ }
  },
  refreshBindings() { try { SC_RT.refreshGlobalLevels(); } catch (e) {} },
  save() { try { const o = SC_RT.saveGame ? SC_RT.saveGame() : {}; o._seedPass = 3; localStorage.setItem(this.SAVE_KEY, JSON.stringify(o)); } catch (e) {} },
  startLoop() {
    if (this._loop) return;
    this._loop = setInterval(() => {
      if ((this._tick || 0) % 30 === 0) this.save();
      this._tick = (this._tick || 0) + 1;
      // 修复bug：游戏进行中只更新时钟/分数，绝不重建DOM
      // 之前每秒调用 render() 会清空用户输入框的内容
      if (this.playing !== null) this.renderPlayingClock();
      else this.render();
    }, 1000);
  },
  stopLoop() { if (this._loop) { clearInterval(this._loop); this._loop = null; } },
  stopAllIntervals() {
    if (this._schoolInt) { clearInterval(this._schoolInt); this._schoolInt = null; }
    if (this._mgInt) { clearInterval(this._mgInt); this._mgInt = null; }
  },

  /* ================= 渲染骨架 ================= */
  render(forceRebuild) {
    const el = this.el; if (!el) return;
    if (!SC_RT.ready) { try { SC_RT.init({}); } catch (e) {} }
    const tabs = el.querySelector('#sc-tabs');
    const content = el.querySelector('#sc-content');
    if (!tabs || !content) return;
    const t = this.getTabs();
    if (!t.some(x => x.id === this.tab)) this.tab = t[0].id;
    const keep = this._resetScroll ? 0 : content.scrollTop;
    this._resetScroll = false;
    tabs.innerHTML = t.map(x => `<button class="gb-tab ${x.id === this.tab ? 'active' : ''}" data-sact="tab:${x.id}">${this.icon(x.icon, 18)}${x.name}</button>`).join('');
    if (this.playing !== null) {
      // 游戏进行中：检查 playing DOM 是否已初始化
      const alreadyPlaying = content.querySelector('#sc-minigame');
      if (alreadyPlaying && !forceRebuild) {
        // DOM 已存在，app.js 全局 interval 每秒触发 render() 时只做最小更新，
        // 绝不重建 innerHTML 以防输入丢失或倒计时闪烁
        this.renderPlayingClock();
        return;
      }
      // DOM 还没初始化（startStudy/startExam 首次渲染），或 forceRebuild=true（minigame 内部需要刷新）
      content.innerHTML = this.renderPlayingLayout();
      content.scrollTop = keep;
      this.bindPlayingInputs();
      return;
    }
    content.innerHTML = this.tab === 'library' ? this.renderLibrary() : this.renderSchoolPage();
    content.scrollTop = keep;
  },
  getTabs() {
    const t = [{ id: 'school', name: '学科', icon: 'mdi-school' }];
    if (this.canSeeLibrary()) t.push({ id: 'library', name: '藏书阁', icon: 'mdi-book' });
    return t;
  },

  /* ================= 学科页 ================= */
  renderSchoolPage() {
    const st = this.state;
    const dustMult = this.safe(() => SC_RT.getters.dustMult, 1) || 1;
    const pass = this.cur('school_examPass');
    const sapphire = this.cur('gem_sapphire');
    const maxMp = this.maxMultipass();
    const subjects = [];
    for (const key in st.subject) {
      const el2 = st.subject[key];
      if (el2.unlock === null || this.isVisible(el2.unlock)) subjects.push(key);
    }
    return `
      <div class="sc-page">
        <div class="sc-top">
          <div class="sc-curchip">${this.icon('mdi-ticket-account', 16)}${this.curName('school_examPass')} ${this.fmt(pass)}</div>
          <button class="sc-buy ${sapphire >= SCHOOL_EXAM_PASS_PRICE ? '' : 'disabled'}" data-sact="convert" ${sapphire >= SCHOOL_EXAM_PASS_PRICE ? '' : 'disabled'}
            title="${this.T('buyPass')}">${this.icon('mdi-crystal-ball', 14)}${this.T('convert')} · 考签×1 → 金尘</button>
          <button class="sc-buy ts-btn" data-sact="openTs" title="消耗金尘加速时间流逝">${this.icon('mdi-timer', 14)}时间跳过</button>
          ${dustMult < 1 ? `<span class="sc-hint">${this.icon('mdi-head-question', 16)}${this.T('beginner').replace('{0}', this.fmt(Math.round(dustMult * 100)) + '%')}</span>` : ''}
          ${maxMp > 1 ? this.renderMultipass(maxMp) : ''}
        </div>
        <div class="sc-grid">
          ${subjects.map(n => this.renderSubjectCard(n)).join('')}
        </div>
      </div>`;
  },
  renderMultipass(maxMp) {
    return `<div class="sc-mp">
        <span class="dim">多重通行 ${this.multipass}</span>
        <input class="sc-mp-input" data-sact-input="multipass" type="number" min="1" max="${maxMp}" value="${this.multipass}" onchange="GB_SC_VIEW.setMultipass(this.value)" />
        <span class="dim">/ ${this.fmt(maxMp)}</span>
      </div>`;
  },
  setMultipass(v) {
    const n = parseInt(v);
    const max = this.maxMultipass();
    if (!isNaN(n) && n >= 1 && n <= max) {
      SCTORE.commit('school/updateKey', { key: 'multipass', value: n });
      this.multipass = n;
      this.save();
      this.render();
    }
  },
  renderSubjectCard(name) {
    const s = this.subj(name);
    const st = this.state;
    const grade = s.currentGrade;
    const isMax = grade >= s.grade;
    const colored = this.gradeColor(grade);
    const segmentsHtml = this.canSeeLibrary() ? this.renderBookSegments(name, s) : '';
    const crown = this.findCrown(s.pointsTotal);
    const canExam = this.canAffordExam(name, s);
    const dustFull = this.cur('school_goldenDust') >= this.curCap('school_goldenDust');
    const dustMax = this.safe(() => SC_RT.getters.examReward(1, grade), 0);
    return `
      <div class="sc-card">
        <div class="sc-card-title">${this.subjName(name)}</div>
        <div class="sc-card-sub">${this.subjSubtitle(name)}</div>
        <div class="sc-grade-row">
          <button class="sc-gbtn ${grade <= 0 ? 'disabled' : ''}" data-sact="gradeMinus:${name}" ${grade <= 0 ? 'disabled' : ''}>${this.icon('mdi-step-backward', 16)}</button>
          <div class="sc-grade ${colored}">${this.gradeStr(grade)}</div>
          <button class="sc-gbtn ${isMax ? 'disabled' : ''}" data-sact="gradePlus:${name}" ${isMax ? 'disabled' : ''}>${this.icon('mdi-step-forward', 16)}</button>
          ${isMax ? `<div class="sc-progress"><div class="sc-progress-fill" style="width:${Math.min(100, s.progress * 100)}%"></div><span class="sc-progress-text">${Math.round(s.progress * (name === 'math' ? 5 : 10))}/${name === 'math' ? 5 : 10}</span></div>` : `<div class="sc-check">${this.icon('mdi-check', 16)}</div>`}
        </div>
        ${segmentsHtml}
        <div class="sc-points">${this.T('totalPoints')} ${this.fmt(s.pointsTotal)}${crown ? `<span class="sc-crown">${this.icon('mdi-crown', crown.size)}</span>` : ''}</div>
        <div class="sc-actions">
          <button class="sc-btn" data-sact="practice:${name}">${this.T('practice')}</button>
          <button class="sc-btn" data-sact="study:${name}">${this.T('study')}</button>
          <button class="sc-btn ${canExam ? '' : 'disabled'}" data-sact="exam:${name}" ${canExam ? '' : 'disabled'}>
            ${this.icon('mdi-ticket-account', 14)}${this.T('takeExam')}</button>
        </div>
        <div class="sc-fine">
          <span>研习时限：不限时</span>
          ${this.T('examTime').replace('{0}', this.fmtTime(this._examTime(name)))}
          ${this.T('takeExamDescription').replace('{0}', this.fmtTime(this._examTime(name))).replace('{1}', this.fmt(Math.round(SCHOOL_EXAM_DUST_MIN * this.safe(() => SC_RT.getters.dustMult, 1)))).replace('{2}', this.fmt(dustMax)).replace('{3}', this.fmt(s.scoreGoal))}
          ${dustFull ? `<span class="sc-warn">${this.T('examDustFull')}</span>` : ''}
        </div>
      </div>`;
  },
  gradeColor(grade) {
    const tier = Math.floor((grade + 2) / 3);
    const map = ['c-red', 'c-orange', 'c-amber', 'c-green', 'c-green', 'c-blue'];
    return map[tier] || 'c-blue';
  },
  findCrown(pts) {
    const cr = this.state.crownRequirement || [];
    for (let i = cr.length - 1; i >= 0; i--) if (pts >= cr[i].amount) return cr[i];
    return null;
  },
  canAffordExam(name, s) {
    if (s.currentGrade <= 0) return false;
    const passesTaken = Math.min(this.multipass, this.cur('school_examPass'));
    const passesSapphires = (this.multipass - passesTaken) * SCHOOL_EXAM_PASS_PRICE;
    return this.cur('gem_sapphire') >= passesSapphires;
  },
  renderBookSegments(name, s) {
    const st = this.state;
    const baseReached = Math.max(s.grade, (st.totalPointRequirement || []).filter(el => s.pointsTotal >= el).length);
    const finalReached = baseReached + (s.booksSkipped || 0);
    const colors = ['#ffa726', '#ffc107', '#aed581', '#66bb6a'];
    let html = '<div class="sc-seg-row">';
    for (let i = 0; i < 12; i++) {
      const reached = finalReached > i;
      const canSkip = finalReached === i;
      const skipped = finalReached > i && baseReached <= i;
      html += `<div class="sc-seg" style="background:${colors[Math.floor(i / 3)]};opacity:${reached ? 1 : 0.3}"
        data-sact="${canSkip ? 'skip:' + name : ''}" title="${canSkip ? this.T('get') + ' ' + this.gradeStr(i + 1) + ' · ' + this.fmt(st.totalPointRequirement[i]) + ' ' + this.T('totalPoints') + ' · ' + this.fmt(st.emeraldRequirement[i]) + ' ' + this.curName('gem_emerald') : ''}">
        ${skipped ? '<span class="sc-seg-skip">◆</span>' : ''}</div>`;
    }
    html += '</div>';
    return html;
  },

  /* ================= 藏书阁页 ================= */
  renderLibrary() {
    const st = this.state;
    const booksLeft = this.safe(() => SC_RT.getters.booksLeft, 0);
    const maxBooks = this.mget('schoolBook');
    if (this._libFeature === undefined) this._libFeature = 'mining_0';
    const selFeature = this._libFeature;
    const [feature, subfeature] = selFeature.split('_');
    const sf = parseInt(subfeature);
    const globalLevels = this.state.meta.globalLevelParts || {};
    const globalLevel = globalLevels[selFeature] ?? 0;
    const featureList = ['mining_0', 'village_0', 'farm_0', 'horde_0', 'gallery_0'];

    // 统计每个 tab 的未读典籍数
    const pendingCount = {};
    for (const key in st.book) {
      const b = st.book[key];
      const k = b.feature + '_' + b.subfeature;
      if (!b.owned && (pendingCount[k] === undefined ? true : globalLevel >= b.minGL)) {
        if (!(k in pendingCount)) pendingCount[k] = 0;
        if (globalLevel >= b.minGL) pendingCount[k]++;
      }
    }

    const bookList = [];
    let requirementNext = null;
    for (const key in st.book) {
      const b = st.book[key];
      if (b.feature === feature && b.subfeature === sf) {
        if (globalLevel >= b.minGL) bookList.push(key);
        else if (b.minGL !== null && (requirementNext === null || b.minGL < requirementNext)) requirementNext = b.minGL;
      }
    }
    const featTabs = featureList.map(f => {
      const fpar = f.split('_')[0];
      const gl = (globalLevels[f] ?? 0);
      const pending = pendingCount[f] || 0;
      const active = f === selFeature ? 'active' : '';
      return `<button class="sc-feat-tab ${active}" data-sact="feat:${f}">
        ${this.icon(this.featIcon(fpar), 14)}${this.featName(fpar)}
        <span class="gl-badge" title="当前玩法等级">${gl}</span>
        <span class="book-badge" title="待研读典籍数">${pending}</span>
      </button>`;
    }).join('');
    return `
      <div class="sc-page">
        <div class="sc-top">
          <span class="sc-curchip">${this.icon('mdi-book', 16)}${this.fmt(booksLeft)} / ${this.fmt(maxBooks)} ${this.T('book')}</span>
          <button class="sc-buy ts-btn" data-sact="openTs" title="消耗金尘加速时间流逝">${this.icon('mdi-timer', 14)}时间跳过</button>
        </div>
        <div class="sc-feat-tabs">${featTabs}</div>
        <div class="sc-libgrid">
          ${bookList.map(k => this.renderBookUpgrade(k)).join('')}
          ${requirementNext !== null ? `<div class="sc-book sc-locked"><span class="sc-lock">${this.icon('mdi-lock', 40)}</span><span class="sc-locktxt">${this.T('nextRequirement')} ${this.fmt(requirementNext)}</span></div>` : ''}
          ${bookList.length === 0 && requirementNext === null ? '<div class="empty-hint">此玩法暂无典籍。</div>' : ''}
        </div>
      </div>`;
  },

  /* ================= 金尘时间跳过 ================= */
  /* 时间跳过消耗公式：原版 cost = round(minutes^0.9 * 100)，我们改为十分之一 → * 10 */
  timeSkipCost(minutes) {
    if (!minutes || minutes <= 0) return 0;
    return Math.round(Math.pow(Math.min(minutes, 99999), 0.9) * 10);
  },
  /* 找到当前激活的主玩法模块（灵脉/宗门/降妖/灵植园/藏宝阁），tick 它跳过时间 */
  _activeMainFeature() {
    const mains = ['lm', 'village', 'horde', 'farm', 'ruin'];
    const cur = typeof GB_APP !== 'undefined' ? GB_APP.currentFeature : null;
    if (cur && mains.indexOf(cur) >= 0) return cur;
    // 兜底：找第一个已解锁的主玩法
    for (let i = 0; i < mains.length; i++) {
      try {
        const m = GB_MODULES.get(mains[i]);
        if (m && GB_UNLOCK && GB_UNLOCK.isUnlocked(mains[i] + 'Feature')) return mains[i];
      } catch (e) {}
    }
    return null;
  },
  /* 中文模块名 */
  _modCN(id) {
    return ({ lm: '灵脉', village: '宗门', horde: '降妖', farm: '灵植园', ruin: '藏宝阁' })[id] || id;
  },
  /* 格式化秒数为可读时间 */
  _fmtSec(sec) {
    if (sec < 60) return sec + ' 秒';
    if (sec < 3600) return Math.round(sec / 60) + ' 分钟';
    const h = Math.floor(sec / 3600);
    const m = Math.round((sec % 3600) / 60);
    return h + ' 小时' + (m > 0 ? m + ' 分' : '');
  },
  performTimeSkip(minutes) {
    minutes = parseInt(minutes) || 0;
    if (minutes <= 0) return;
    const cost = this.timeSkipCost(minutes);
    const dust = this.cur('school_goldenDust');
    if (dust < cost) {
      this.toast('金尘不足！需要 ' + this.fmt(cost) + '，持有 ' + this.fmt(dust), '#ef4444');
      return;
    }
    // 扣费
    SCTORE.dispatch('currency/spend', { feature: 'school', name: 'goldenDust', amount: cost });
    // 找目标模块
    const target = this._activeMainFeature();
    const seconds = minutes * 60;
    let ticked = false;
    if (target) {
      try {
        const m = GB_MODULES.get(target);
        if (m && m.core && m.core.RT && typeof m.core.RT.tick === 'function') {
          m.core.RT.tick(seconds);
          ticked = true;
        }
      } catch (e) {}
    }
    // 也 tick 藏经阁自身（考试进度/bonusDust 溢出转移等）
    try { SC_RT.tick(seconds); } catch (e) {}
    // tick 后统一刷新 meta
    try { if (typeof GB_META !== 'undefined') GB_META.syncAll(); } catch (e) {}
    if (typeof GB_MODULES !== 'undefined') { try { GB_MODULES.saveAll(); } catch (e) {} }
    this.save();

    const msg = ticked
      ? `⏱ 时间跳过成功！消耗 ${this.fmt(cost)} 金尘，加速 ${this._fmtSec(seconds)}（${this._modCN(target)}）`
      : `⏱ 时间跳过成功！消耗 ${this.fmt(cost)} 金尘，已加速 ${this._fmtSec(seconds)}`;
    this.toast(msg, '#4ade80');
    this._dlgOpen = false;
    this.render();
  },

  /* 弹窗 UI */
  renderTimeSkipDialog() {
    const d = this.cur('school_goldenDust');
    const m = Math.max(1, Math.min(99999, this._dlgMinute || 5));
    const cost = this.timeSkipCost(m);
    const canAfford = d >= cost;
    const target = this._activeMainFeature();
    const targetName = target ? this._modCN(target) : '主玩法';
    const sec = m * 60;
    return `
      <div class="sc-ts-overlay" data-sact="closeTs" style="position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="if(event.target===this) GB_SC_VIEW._dlgOpen=false,GB_SC_VIEW.render()">
        <div class="sc-ts-card" data-sact="noop" style="background:linear-gradient(180deg,#1e293b,#0f172a);border:1px solid rgba(251,191,36,0.3);border-radius:16px;padding:24px;max-width:420px;width:92%;box-shadow:0 20px 60px rgba(0,0,0,0.6);font-family:'Noto Sans SC',sans-serif;">
          <div style="text-align:center;margin-bottom:16px;">
            <div style="font-size:20px;font-weight:700;color:#fbbf24;display:flex;align-items:center;justify-content:center;gap:8px;">
              <span style="font-size:28px;">⏳</span> 时间跳过
            </div>
            <div style="color:#94a3b8;font-size:13px;margin-top:4px;">消耗金尘加速${targetName}时间流逝</div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(30,41,59,0.8);border-radius:10px;padding:12px 16px;margin-bottom:16px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:24px;">⏱</span>
              <div>
                <div style="color:#fbbf24;font-weight:600;">${this.fmt(d)}</div>
                <div style="color:#64748b;font-size:12px;">持有金尘</div>
              </div>
            </div>
            <div style="color:#475569;">→</div>
            <div style="text-align:right;">
              <div style="color:${canAfford ? '#4ade80' : '#ef4444'};font-weight:600;">${this.fmt(cost)}</div>
              <div style="color:#64748b;font-size:12px;">消耗金尘</div>
            </div>
          </div>

          <div style="margin-bottom:12px;">
            <div style="color:#cbd5e1;font-size:13px;margin-bottom:8px;">跳过时间（分钟）</div>
            <div style="display:flex;gap:8px;align-items:center;">
              <input type="number" min="1" max="99999" value="${m}"
                style="flex:1;background:rgba(15,23,42,0.9);border:1px solid #334155;color:#f1f5f9;padding:10px 14px;border-radius:10px;font-size:16px;outline:none;"
                onchange="GB_SC_VIEW._dlgMinute=Math.max(1,Math.min(99999,parseInt(this.value)||1));GB_SC_VIEW.render()"
              />
              <button data-sact="tsMax" title="最大可跳过"
                style="background:rgba(251,191,36,0.2);border:1px solid #fbbf24;color:#fbbf24;padding:10px 16px;border-radius:10px;cursor:pointer;font-weight:600;">最大</button>
            </div>
            <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
              ${[5, 15, 30, 60, 120].map(v => `
                <button data-sact="tsMinute:${v}"
                  style="background:rgba(51,65,85,0.6);border:1px solid #475569;color:#cbd5e1;padding:4px 12px;border-radius:6px;cursor:pointer;font-size:12px;">${v === 60 ? '1时' : v === 120 ? '2时' : v + '分'}</button>
              `).join('')}
            </div>
          </div>

          <div style="background:rgba(30,41,59,0.6);border-radius:8px;padding:10px 14px;margin-bottom:16px;color:#94a3b8;font-size:12px;line-height:1.6;">
            <div>📜 加速时长：<span style="color:#f1f5f9;">${this._fmtSec(sec)}</span></div>
            <div>🎯 加速模块：<span style="color:#f1f5f9;">${targetName}</span></div>
            <div>💎 金尘公式：<span style="color:#64748b;">消耗 = ⌈分钟^0.9 × 10⌉</span></div>
          </div>

          <div style="display:flex;gap:8px;">
            <button data-sact="closeTs"
              style="flex:1;background:rgba(51,65,85,0.8);border:1px solid #475569;color:#94a3b8;padding:12px;border-radius:10px;cursor:pointer;font-weight:500;">取消</button>
            <button data-sact="doTs" ${canAfford ? '' : 'disabled'}
              style="flex:2;background:${canAfford ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(71,85,105,0.5)'};border:none;color:${canAfford ? '#fff' : '#64748b'};padding:12px;border-radius:10px;cursor:${canAfford ? 'pointer' : 'not-allowed'};font-weight:600;font-size:15px;">
              ⏳ 确认跳过（${this.fmt(cost)} 金尘）
            </button>
          </div>
        </div>
      </div>`;
  },

  renderBookUpgrade(key) {
    const b = this.state.book[key];
    if (!b) return '';
    const gl = (this.state.meta.globalLevelParts || {})[b.feature + '_' + b.subfeature] ?? 0;
    const lvl = b.scalesWithGL ? Math.max((Math.min(gl, b.maxGL ?? Infinity) + 1 - b.minGL), 0) : (gl >= b.minGL ? 1 : 0);
    const canRead = !b.owned && this.safe(() => SC_RT.getters.booksLeft, 0) > 0;
    const effectDesc = b.effect.map(e => {
      let v = 0; try { v = typeof e.value === 'function' ? e.value(lvl) : e.value; } catch (err) { v = 0; }
      const nm = String(e.name);
      let label = nm;
      if (/Cap$/.test(nm)) label = this.featName(b.feature) + ' 上限';
      else if (/Gain$/.test(nm)) label = this.featName(b.feature) + ' 产出';
      else if (/Damage/.test(nm)) label = this.featName(b.feature) + ' 伤害';
      else if (/Attack/.test(nm)) label = this.featName(b.feature) + ' 攻击';
      else if (/Health/.test(nm)) label = this.featName(b.feature) + ' 气血';
      const val = e.type === 'mult' ? (v > 1 ? '+' + this.fmt((v - 1) * 100) + '%' : this.fmtp(v)) : (this.fmt(v));
      return `<div class="sc-effect">${label}${e.type === 'mult' ? ' ×' : ''} ${val}</div>`;
    }).join('');
    return `
      <div class="sc-book ${b.owned ? 'owned' : ''}">
        <div class="sc-book-name">${this.bookName(b.feature, key.split('_').slice(1).join('_'))}</div>
        <div class="sc-effect-list">${effectDesc}</div>
        ${b.scalesWithGL && (b.maxGL === null || gl < b.maxGL) ? `<div class="sc-scales">${this.T('scalesWithGL')}</div>` : ''}
        <div class="sc-book-act">
          ${b.owned ? `<span class="sc-owned">${this.icon('mdi-check', 16)}${this.T('owned')}</span>`
                    : `<button class="sc-btn ${canRead ? '' : 'disabled'}" data-sact="read:${key}" ${canRead ? '' : 'disabled'}>${this.T('read')}</button>`}
        </div>
      </div>`;
  },

  /* ============ 小游戏 流程控制（practice/study/exam） ============ */
  startPractice(name) {
    this.stopAllIntervals();
    this.timer = 0; this.score = 0; this.playing = name; this.mode = 'practice';
    this.initMinigame(name);
    if (!this.customTimer.includes(name)) {
      this._schoolInt = setInterval(() => this.tickTimer(1), 1000);
    }
    this.render();
  },
  startStudy(name) {
    this.stopAllIntervals();
    this.timer = 0;  // 研习永远无限时间
    this.score = 0; this.playing = name; this.mode = 'study';
    this.initMinigame(name);
    // 研习不启动 ticker（无限时间）
    this.render();
  },
  startExam(name) {
    const passesTaken = Math.min(this.multipass, this.cur('school_examPass'));
    const sapphiresNeeded = (this.multipass - passesTaken) * SCHOOL_EXAM_PASS_PRICE;
    if (this.cur('gem_sapphire') >= sapphiresNeeded) {
      SCTORE.dispatch('currency/spend', { feature: 'school', name: 'examPass', amount: passesTaken });
      if (sapphiresNeeded > 0) SCTORE.dispatch('currency/spend', { feature: 'gem', name: 'sapphire', amount: sapphiresNeeded });
      this.stopAllIntervals();
      this.timer = this.customTimer.includes(name) ? 0 : (this._examTime(name) + 1);
      this.score = 0; this.playing = name; this.mode = 'exam';
      this.initMinigame(name);
      if (!this.customTimer.includes(name)) {
        this._schoolInt = setInterval(() => this.tickTimer(1), 1000);
      }
      this.render();
    }
  },
  tickTimer(seconds) {
    if (this.playing === null) return;
    if (this.mode === 'study') return;  // 研习无限时间，不扣
    if (this.mode === 'practice') this.timer += seconds;
    else this.timer -= seconds;
    if (this.timer <= 0) this.finishSchool();
    this.renderPlayingClock();
  },
  updateScore(value) {
    this.score = value;
    if (this.mode === 'exam' && this.playing && value >= (this.subj(this.playing).scoreGoal || 1)) {
      this.finishSchool(Math.min(value, this.subj(this.playing).scoreGoal));
    }
  },
  updateTimer(value) { this.timer = value; if (this.timer <= 0) { /* 由 minigame stop 触发 */ } },
  finishSchool(score) {
    if (score !== undefined) this.score = score;
    if (this.playing) SC_RT.act('finishSchool', { mode: this.mode, score: this.score, subject: this.playing });
    this.save();
    this.leaveSchool();
    this.render();
  },
  stop(subject) { // history / chemistry 用
    this.finishSchool(this.score);
  },
  leaveSchool() {
    this.stopAllIntervals();
    this.timer = 0; this.score = 0; this.playing = null; this.mode = null; this.mg = {};
  },
  renderPlayingClock() {
    const el = this.el; if (!el) return;
    // 防御性修复：如果 playing 还活着但 _schoolInt 没了（被 navigate/unload 清了），重建计时器
    // 但研习模式不重建（研习无限时间）
    if (this.playing && this.mode !== 'study' && !this._schoolInt) {
      this._schoolInt = setInterval(() => this.tickTimer(1), 1000);
    }
    const clock = el.querySelector('#sc-clock');
    const scoreEl = el.querySelector('#sc-score');
    const canSeeNow = this.canSeeMinigame();
    const cont = el.querySelector('#sc-minigame');
    if (clock) clock.textContent = this.mode === 'study' ? '∞' : (this.displayTimer() + (this.customTimer.includes(this.playing) ? '' : 's'));
    if (scoreEl) scoreEl.textContent = Math.floor(this.score) + (this.mode === 'exam' && this.playing ? ' / ' + this.subj(this.playing).scoreGoal : '');
    const hint = el.querySelector('#sc-minigame-hint');
    if (cont && !canSeeNow) {
      if (hint) hint.style.display = '';
      cont.style.display = 'none';
    } else {
      if (hint) hint.style.display = 'none';
      if (cont) cont.style.display = '';
    }
  },
  displayTimer() {
    const studyT = this._studyTime(this.playing);
    const examT = this._examTime(this.playing);
    if (this.mode === 'exam') return this.fmt(Math.min(this.timer, examT));
    if (this.mode === 'study') return this.fmt(Math.min(this.timer, studyT));
    return this.fmt(this.timer);
  },
  canSeeMinigame() {
    const studyT = this._studyTime(this.playing);
    const examT = this._examTime(this.playing);
    return (this.mode === 'exam' && this.timer <= examT) ||
           (this.mode === 'study' && this.timer <= studyT) ||
           this.mode === 'practice';
  },
  /* math 单独时限 ×3，其他学科用全局默认 */
  _studyTime(name) { return name === 'math' ? SCHOOL_STUDY_TIME * 2 : SCHOOL_STUDY_TIME; },
  _examTime(name)  { return name === 'math' ? 300 : SCHOOL_EXAM_TIME; },
  renderPlayingLayout() {
    const st = this.state;
    const subjGoal = this.subj(this.playing) ? this.subj(this.playing).scoreGoal : 1;
    // 提示：研习中得分 ≥ 5 就能加 1 progress（每 5 分 = 1 progress）
    const canTakeExam = this.mode === 'study' && this.score >= 5;
    return `
      <div class="sc-playing">
        <div class="sc-scoreboard">
          <span class="sc-chip">${this.icon('mdi-timer', 16)}<span id="sc-clock">${this.displayTimer()}</span></span>
          <span class="sc-chip">${this.icon('mdi-marker-check', 16)}<span id="sc-score">${Math.floor(this.score)}${this.mode === 'exam' ? ' / ' + subjGoal : ''}</span></span>
          ${this.mode !== 'exam' ? `<button class="sc-btn ghost" data-sact="leave">${this.icon('mdi-exit-to-app',14)} 退出研习</button>` : ''}
        </div>
        ${canTakeExam ? `<div class="sc-exam-ready">${this.icon('mdi-check-circle',16)} 得分不错！退出研习结算进度后，进度条满 10/10 就能参加考试</div>` : ''}
        <div class="sc-mg-hint" id="sc-minigame-hint" ${this.canSeeMinigame() ? 'style="display:none"' : ''}>
          ${this.mode === 'exam' ? this.T('beginExam') : this.T('start')}
        </div>
        <div class="sc-minigame" id="sc-minigame">${this.renderMinigame()}</div>
      </div>`;
  },

  /* ================= 各小游戏 ================= */
  initMinigame(name) {
    this.mg = { subject: name };
    if (name === 'math') this.mgMathInit();
    else if (name === 'literature') this.mgLitInit();
    else if (name === 'history') this.mgZfInit();
    else if (name === 'art') this.mgArtInit();
    else if (name === 'chemistry') this.mgChemInit();
  },
  renderMinigame() {
    const name = this.mg.subject;
    if (name === 'math') return this.mgMathRender();
    if (name === 'literature') return this.mgLitRender();
    if (name === 'history') return this.mgZfRender();
    if (name === 'art') return this.mgArtRender();
    if (name === 'chemistry') return this.mgChemRender();
    return '';
  },
  bindPlayingInputs() {
    const el = this.el; if (!el) return;
    const name = this.mg.subject;
    // literature（成语接龙）：全用 data-sact 事件委托，不需要特殊绑定
  },
  bindOne(el, sel, evt, fn) {
    try {
      const node = el.querySelector(sel);
      if (node) node.addEventListener(evt, () => fn());
    } catch (e) { /* ignore */ }
  },

  /* ============================================================
   * 演算 → 算24点（Point24）：参考 CardParty-main/js/games/point24.js
   * 单人限时：从题库抽4张牌，用 +−×÷ 和括号算出24
   * ============================================================ */

  /* ---- 分数运算工具（精确分数，避免浮点误差） ---- */
  _p24_gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; },
  _p24_fr(n, d) { if (d === 0 || d == null) return null; if (d < 0) { n = -n; d = -d; } const g = this._p24_gcd(n, d); return { n: n / g, d: d / g }; },
  _p24_fAdd(a, b) { return this._p24_fr(a.n * b.d + b.n * a.d, a.d * b.d); },
  _p24_fSub(a, b) { return this._p24_fr(a.n * b.d - b.n * a.d, a.d * b.d); },
  _p24_fMul(a, b) { return this._p24_fr(a.n * b.n, a.d * b.d); },
  _p24_fDiv(a, b) { return b.n === 0 ? null : this._p24_fr(a.n * b.d, a.d * b.n); },
  _p24_fEq(a, b) { return !!a && !!b && a.n * b.d === b.n * a.d; },
  _p24_is24(a) { return this._p24_fEq(a, this._p24_fr(24, 1)); },
  _p24_fApply(op, a, b) {
    if (op === '+') return this._p24_fAdd(a, b);
    if (op === '-') return this._p24_fSub(a, b);
    if (op === '*') return this._p24_fMul(a, b);
    if (op === '/') return this._p24_fDiv(a, b);
    return null;
  },
  _p24_fTxt(a) {
    if (!a) return '?';
    if (a.d === 1) return String(a.n);
    const v = a.n / a.d;
    return v.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
  },
  _p24_canSolve(nums) {
    const self = this;
    const fracs = nums.map(v => self._p24_fr(v, 1));
    function solve(list) {
      if (list.length === 1) return self._p24_is24(list[0]);
      for (let i = 0; i < list.length; i++) {
        for (let j = 0; j < list.length; j++) {
          if (i === j) continue;
          const rest = [];
          for (let k = 0; k < list.length; k++) if (k !== i && k !== j) rest.push(list[k]);
          for (const op of ['+', '-', '*', '/']) {
            const r = self._p24_fApply(op, list[i], list[j]);
            if (r !== null && solve([...rest, r])) return true;
          }
        }
      }
      return false;
    }
    return solve(fracs);
  },

  /* ---- 题库生成（第一次调用时懒生成并缓存） ---- */
  _p24BuildBank() {
    if (this._p24Bank) return this._p24Bank;
    // 先试 localStorage 缓存（页面刷新也不丢）
    try {
      const cached = localStorage.getItem('sc_p24_bank');
      if (cached) { this._p24Bank = JSON.parse(cached); return this._p24Bank; }
    } catch (e) {}
    // 首次：穷举 + DFS 验证（~750ms）
    const bank = [];
    for (let a = 1; a <= 13; a++)
      for (let b = a; b <= 13; b++)
        for (let c = b; c <= 13; c++)
          for (let d = c; d <= 13; d++)
            if (this._p24_canSolve([a, b, c, d])) bank.push([a, b, c, d]);
    this._p24Bank = bank;
    // 持久化（下次进 math 直接 0ms）
    try { localStorage.setItem('sc_p24_bank', JSON.stringify(bank)); } catch (e) {}
    return bank;
  },

  /* ---- 初始化 ---- */
  mgMathInit() {
    const elo = this.subj('math').currentGrade || 0;
    this.mg.elo = elo;
    // 懒加载题库（首次进入时生成，约1秒）
    const bank = this._p24BuildBank();
    this.mg.bank = bank;
    this._p24NewQuestion();
  },

  /* ---- 抽一题 ---- */
  _p24NewQuestion() {
    const bank = this.mg.bank;
    const combo = bank[randomInt(0, bank.length - 1)];
    // 打乱显示顺序（但不影响可解性，因为穷举时考虑了所有排列）
    const shuffled = shuffleArray(combo.slice());
    this.mg.cards = shuffled.map(v => ({ v: v, frac: this._p24_fr(v, 1), mid: false }));
    this.mg.originalCards = this.mg.cards.map(c => ({ ...c })); // 重置时恢复的初始牌面
    this.mg.sel = null;       // 选中的牌索引
    this.mg.op = null;        // 选中的运算符
    this.mg.steps = [];       // 操作步骤（用于回放/验证）
    this.mg.solved = false;
  },

  /* ---- 渲染 ---- */
  mgMathRender() {
    const cards = this.mg.cards;
    const ops = [
      { k: '+', label: '+' },
      { k: '-', label: '−' },
      { k: '*', label: '×' },
      { k: '/', label: '÷' },
    ];
    // 生成4张卡片的HTML
    let cardsHtml = '';
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      if (c === null) {
        cardsHtml += `<div class="p24-gap"></div>`;
      } else {
        const cls = 'p24-cell' + (c.mid ? ' mid' : '') + (this.mg.sel === i ? ' sel' : '');
        const valText = this._p24_fTxt(c.frac);
        cardsHtml += `<div class="${cls}" data-sact="p24-card:${i}">${valText}</div>`;
      }
    }
    // 运算符按钮
    let opsHtml = ops.map(o => {
      const selCls = this.mg.op === o.k ? ' sel' : '';
      return `<button class="p24-op${selCls}" data-sact="p24-op:${o.k}">${o.label}</button>`;
    }).join('');
    // 步骤记录
    const stepsTxt = this.mg.steps.length
      ? this.mg.steps.map(s => `${this._p24_fTxt(s.a)} ${this._p24_opLabel(s.op)} ${this._p24_fTxt(s.b)} = ${this._p24_fTxt(s.r)}`).join(' → ')
      : '';
    // 结果提示
    let resultHtml = '';
    if (this.mg.solved) {
      resultHtml = `<div class="p24-result-ok">✓ 已算出 24！可以继续下一题或重置</div>`;
    }
    return `
      <div class="p24-hint">用这 4 张牌算出 24（选牌 → 选运算符 → 再选牌）</div>
      <div class="p24-board">${cardsHtml}</div>
      <div class="p24-ops">${opsHtml}</div>
      <div class="p24-tools">
        <button class="p24-btn" data-sact="p24-reset">重置本题</button>
        <button class="p24-btn primary" data-sact="p24-next">下一题</button>
      </div>
      ${resultHtml}
      ${stepsTxt ? `<div class="p24-steps">步骤：${stepsTxt}</div>` : ''}`;
  },
  _p24_opLabel(op) {
    return ({ '+': '+', '-': '−', '*': '×', '/': '÷' })[op] || op;
  },

  /* ---- 交互（事件委托处理） ---- */
  mgInlineClick(tag, val) {
    const mg = this.mg;
    // 通用检查：必须正在玩，且 mg 存在且 subject 匹配
    if (!mg || !this.playing || this.playing !== mg.subject) return;

    // mg-lit-clear 是文墨（literature）的操作，不受 subject='math' 限制
    if (tag === 'mg-lit-clear') { this.mgLitClear(); return; }
    // 算24点（math）的内联操作
    if (mg.subject === 'math') {
      if (tag === 'p24-card') { this._p24OnCard(+val); return; }
      if (tag === 'p24-op') { this._p24OnOp(val); return; }
      if (tag === 'p24-reset') { this._p24Reset(); return; }
      if (tag === 'p24-next') { this._p24Next(); return; }
    }
  },

  _p24OnCard(i) {
    if (this.mg.solved) return;
    const cards = this.mg.cards;
    if (!cards[i]) return;
    if (this.mg.sel === null) {
      this.mg.sel = i;
      this.render(true);
      return;
    }
    if (this.mg.op === null) {
      // 还没选运算符，切换选中
      this.mg.sel = (this.mg.sel === i) ? null : i;
      this.render(true);
      return;
    }
    if (this.mg.sel === i) {
      // 点同一张牌，取消选择
      this.mg.sel = null; this.mg.op = null;
      this.render(true);
      return;
    }
    // 执行运算
    const a = cards[this.mg.sel];
    const b = cards[i];
    const r = this._p24_fApply(this.mg.op, a.frac, b.frac);
    if (!r) {
      // 除零等
      this._p24FlashMsg('除数不能为 0');
      return;
    }
    this.mg.steps.push({
      a: { n: a.frac.n, d: a.frac.d },
      op: this.mg.op,
      b: { n: b.frac.n, d: b.frac.d },
      r: { n: r.n, d: r.d }
    });
    // 结果落在目标格(i)，源格留空
    cards[i] = { v: r.n / r.d, frac: r, mid: true };
    cards[this.mg.sel] = null;
    this.mg.sel = null; this.mg.op = null;
    // 检查是否完成
    const remain = cards.filter(c => c !== null);
    if (remain.length === 1 && this._p24_is24(remain[0].frac)) {
      this.mg.solved = true;
      this.score++;
      this.updateScore(this.score);
      this._p24FlashMsg('✓ 算出 24！');
    } else if (remain.length === 1) {
      // 只剩一张但不是24，自动重置当前题（不扣分）
      this._p24FlashMsg('结果不是 24，已重置');
      this._p24Reset();
      return;
    }
    this.render(true);
  },
  _p24OnOp(op) {
    if (this.mg.solved) return;
    if (this.mg.sel === null) {
      this._p24FlashMsg('请先选一张牌');
      return;
    }
    this.mg.op = op;
    this.render(true);
  },
  _p24Reset() {
    // 恢复当前题目的初始牌面，而不是抽新题
    if (this.mg.originalCards) {
      this.mg.cards = this.mg.originalCards.map(c => ({ ...c }));
      this.mg.sel = null;
      this.mg.op = null;
      this.mg.steps = [];
      this.mg.solved = false;
    } else {
      this._p24NewQuestion();
    }
    this.render(true);
  },
  _p24Next() {
    // 考试/研习完成 → 结算
    if (this.score >= this.subj(this.playing).scoreGoal) {
      this.finishSchool(this.score);
      return;
    }
    // 无论是否算出，都可以跳下一题
    this._p24NewQuestion();
    this.render(true);
  },
  _p24FlashMsg(msg) {
    // 简易提示：用 alert 不太好，这里用 console 或临时元素
    try {
      const el = this.el; if (!el) return;
      let hint = el.querySelector('.p24-flash');
      if (!hint) {
        hint = document.createElement('div');
        hint.className = 'p24-flash';
        const board = el.querySelector('.p24-board');
        if (board && board.parentNode) board.parentNode.insertBefore(hint, board);
      }
      hint.textContent = msg;
      hint.style.display = '';
      clearTimeout(this._p24FlashTimer);
      this._p24FlashTimer = setTimeout(() => { hint.style.display = 'none'; }, 1500);
    } catch (e) { /* ignore */ }
  },

  /* ---- 兼容旧接口：mg-answer 事件（不再用，但保留不报错） ---- */
  mgAnswer() {
    // 算24点不需要这个入口，操作全由 data-sact 驱动
  },

  /* ---- 文墨（成语接龙棋盘）literature ---- */
  mgLitInit() {
    const elo = this.subj('literature').currentGrade || 0;
    this.mg.elo = elo;
    this.mg.layout = null;
    this.mg.choices = [];
    this.mg.filled = {};   // { "x,y": '字' } 已填入的空格
    this.mg.selected = null; // "x,y" 当前选中的空格
    this.mg.solved = false;
    this.mgLitNewPuzzle();
  },
  mgLitNewPuzzle() {
    // chainLen 4~6（难度随等级递增）
    const chainLen = Math.min(6, Math.max(4, 4 + Math.floor(this.mg.elo / 6)));
    const chain = (typeof SC_IdiomChain !== 'undefined' ? SC_IdiomChain : () => [
      '胸有成竹','竹报平安','安富尊荣','荣华富贵','贵而贱目','目无余子','子虚乌有','有目共睹'
    ])(chainLen);
    // gridSize 自适应：SC_IdiomLayout 内部根据 chainLen 自动算 + 失败放大
    const layout = (typeof SC_IdiomLayout !== 'undefined' ? SC_IdiomLayout : (c) => {
      // 兜底简化布局
      const cells = [];
      const sy = 2;
      for (let i = 0; i < c.length; i++) {
        const sx = 1;
        for (let k = 0; k < 4; k++) {
          cells.push({ x: sx + k, y: sy + i, ch: c[i][k], idiomIdx: i, charIdx: k, bridge: c === 3 && i < c.length - 1, blank: Math.random() < 0.4 });
        }
      }
      return { chain: c, cells, gridSize: Math.max(10, c.length * 2 + 2) };
    })(chain);
    // 保底：确保至少有 1 个 blank
    if (!layout.cells.some(c => c.blank)) {
      // 随机挖一个
      const idxs = layout.cells.map((_, i) => i);
      const pick = idxs[Math.floor(Math.random() * idxs.length)];
      layout.cells[pick].blank = true;
    }
    this.mg.layout = layout;
    this.mg.choices = (typeof SC_IdiomChoices !== 'undefined' ? SC_IdiomChoices : (l) => {
      const blanks = l.cells.filter(c => c.blank);
      const chars = [...new Set(blanks.map(b => b.ch))];
      const all = (typeof SC_IDIOMS !== 'undefined' ? SC_IDIOMS.join('') : '安富尊荣花言巧语语重心长').split('');
      const uniq = [...new Set(all)];
      const pool = chars.slice();
      while (pool.length < Math.max(5, chars.length + 3)) {
        const rc = uniq[Math.floor(Math.random() * uniq.length)];
        if (!pool.includes(rc)) pool.push(rc);
      }
      return pool.sort(() => Math.random() - 0.5);
    })(layout);
    this.mg.filled = {};
    this.mg.filledRight = {};
    this.mg.filledWrong = {};
    this.mg.selected = null;
    this.mg.solved = false;
  },
  mgLitRender() {
    const l = this.mg.layout; if (!l) return '';
    const size = l.gridSize;
    // 渲染棋盘
    const cellArr = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const key = x + ',' + y;
        const cell = l.cells.find(c => c.x === x && c.y === y);
        if (!cell) { cellArr.push(`<div class="idiom-cell empty"></div>`); continue; }
        let displayCh = cell.ch;
        let classes = 'idiom-cell';
        if (cell.blank) {
          const filled = this.mg.filled[key];
          const isRight = this.mg.filledRight && this.mg.filledRight[key];
          const isWrong = this.mg.filledWrong && this.mg.filledWrong[key];
          displayCh = filled || '';
          classes += filled ? (isRight ? ' filled-right' : isWrong ? ' filled-wrong' : ' filled') : ' blank';
          if (this.mg.selected === key) classes += ' selected';
        } else {
          classes += ' fixed';
        }
        if (cell.bridge) classes += ' bridge';
        cellArr.push(`<div class="${classes}" data-sact="idiom-cell:${key}">${displayCh}</div>`);
      }
    }
    const board = `<div class="idiom-board" style="grid-template-columns:repeat(${size}, 1fr)">${cellArr.join('')}</div>`;
    // 候选字
    const choicesHtml = this.mg.choices.map((ch, i) =>
      `<button class="idiom-choice" data-sact="idiom-choice:${i}">${ch}</button>`).join('');
    const choicesBox = `<div class="idiom-choices">${choicesHtml}</div>`;
    // 显示接龙成语列表（顶部提示用小字）
    const chainHtml = l.chain.map((w, i) => `<span class="idiom-chain-item">${w}</span>`).join(' → ');
    const chainTip = `<div class="idiom-chain-tip">${chainHtml}</div>`;
    // 下一题按钮
    const solvedHint = this.mg.solved ? `<div class="idiom-solved">✓ 接龙成功！+1 分</div>` : '';
    const nextBtn = `<button class="sc-btn" data-sact="idiom-next">${this.mg.solved ? '下一题' : '跳过本题'}</button>`;
    return `<div class="idiom-wrap">${board}${choicesBox}${solvedHint}${nextBtn}</div>`;
  },
  mgLitClickCell(key) {
    const l = this.mg.layout; if (!l) return;
    const cell = l.cells.find(c => c.x + ',' + c.y === key);
    if (!cell || !cell.blank) return;
    this.mg.selected = key;
    this.render(true);
  },
  mgLitClickChoice(idx) {
    const l = this.mg.layout; if (!l) return;
    if (!this.mg.selected) return;
    const ch = this.mg.choices[idx];
    const cell = l.cells.find(c => c.x + ',' + c.y === this.mg.selected);
    if (!cell) return;
    const key = this.mg.selected;

    // 即时校验：对/错 立刻有反馈
    const isRight = ch === cell.ch;
    if (isRight) {
      // 对：填入 + 标绿 + 清除选中
      this.mg.filled[key] = ch;
      this.mg.filledRight = this.mg.filledRight || {};
      this.mg.filledRight[key] = true;
      this.mg.selected = null;
      // 检查是否全部填对
      const blanks = l.cells.filter(c => c.blank);
      const allFilledCorrect = blanks.every(b => this.mg.filledRight[b.x + ',' + b.y]);
      if (allFilledCorrect) {
        this.mg.solved = true;
        this.score++;
        this.updateScore(this.score);
      }
      this.render(true);
    } else {
      // 错：短暂标红，然后自动清掉
      this.mg.filled[key] = ch;
      this.mg.filledWrong = this.mg.filledWrong || {};
      this.mg.filledWrong[key] = true;
      this.mg.selected = null;
      this.render(true);
      // 800ms 后自动清掉
      setTimeout(() => {
        delete this.mg.filled[key];
        delete this.mg.filledWrong[key];
        this.render(true);
      }, 800);
    }
  },
  mgLitNext() {
    this.mgLitNewPuzzle();
    this.render(true);
  },
  mgLitClear() {
    // 清空当前选中的填入
    if (this.mg.selected && this.mg.filled[this.mg.selected]) {
      delete this.mg.filled[this.mg.selected];
      this.render(true);
    }
  },

  /* ---- 阵法（扫雷）history ---- */
  mgZfInit() {
    const g = this.subj('history').currentGrade || 0;
    const mode = this.mode; // 'practice' | 'study' | 'exam'
    const diff = (typeof zfGetDifficulty !== 'undefined'
      ? zfGetDifficulty(g, mode === 'practice' ? 'study' : mode)
      : { rows: 8, cols: 8, mines: 10, label: '初窥阵', tier: 'low', hasRowCol: false, has3x3: false, has4x4: false, isExam: false });
    this.mg.zfDiff = diff;
    this.mg.zfTier = diff.tier;
    this.mg.zfTool = 'reveal';
    this.mg.zfOver = null;
    this.mg.zfScoreMultiplier = (typeof tierScoreMultiplier !== 'undefined' ? tierScoreMultiplier(diff) : 1);
    this.mgZfNewGame();
  },
  mgZfNewGame() {
    const diff = this.mg.zfDiff;
    const res = (typeof zfNewGame !== 'undefined' ? zfNewGame : (d, r, c) => ({
      board: Array.from({length: d.rows}, (_, r) => Array.from({length: d.cols}, (_, c) => ({mine:false,revealed:false,flagged:false,adjMines:0,r,c}))),
      difficulty: d
    }))(diff, Math.floor(diff.rows / 2), Math.floor(diff.cols / 2));
    this.mg.zfBoard = res.board;
    this.mg.zfRows = diff.rows;
    this.mg.zfCols = diff.cols;
    this.mg.zfOver = null;
    this.render(true);
  },
  mgZfClickCell(val) {
    if (this.mg.zfOver) return;
    const [r, c] = val.split(',').map(Number);
    const board = this.mg.zfBoard;
    const cell = board[r] && board[r][c];
    if (!cell) return;
    if (cell.revealed) return;

    if (this.mg.zfTool === 'reveal') {
      if (cell.flagged) return;
      // 揭开
      if (cell.mine) {
        cell.revealed = true;
        // 失败：揭开所有雷
        if (typeof zfRevealAllMines !== 'undefined') zfRevealAllMines(board, this.mg.zfRows, this.mg.zfCols);
        this.mg.zfOver = 'lose';
        this.render(true);
        if (this.mode === 'exam') this.stop('history');
        return;
      }
      if (typeof zfRevealCellInternal !== 'undefined') {
        zfRevealCellInternal(board, this.mg.zfRows, this.mg.zfCols, r, c);
      } else {
        cell.revealed = true;
      }
    } else {
      // 插旗 / 取消
      cell.flagged = !cell.flagged;
    }

    // 检查胜利
    if (typeof zfCheckWin !== 'undefined' && zfCheckWin(board, this.mg.zfRows, this.mg.zfCols)) {
      this.mg.zfOver = 'win';
      const addScore = this.mg.zfScoreMultiplier;
      this.score += addScore;
      this.updateScore(this.score);
      this.render(true);
      // 考试模式胜利直接退出；研习模式胜利 → 自动开下一局（类似 idiom-next）
      if (this.mode === 'exam') {
        this.stop('history');
      } else {
        // 研习：显示胜利画面 → 等玩家点"再来一局"（底部按钮），不自动开
      }
      return;
    }

    this.render(true);
  },
  mgZfRestart() {
    if (confirm('重新开局？当前进度丢失')) {
      this.mg.zfOver = null;
      this.mgZfNewGame();
    }
  },
  mgZfHint() {
    if (this.mg.zfOver) return;
    const pass = SC_CUR.value('school_examPass') || 0;
    if (pass < 1) {
      // 显示考签不足 toast（用简单 alert 或找现有 toast）
      console.warn('阵法提示：考签不足（需要 1 张，当前 ' + pass + '）');
      return;
    }
    // 消费 1 考签
    SCTORE.dispatch('currency/spend',
      { feature: 'school', name: 'examPass', amount: 1 },
      { root: true }
    );
    // 获取提示
    let hint = null;
    if (typeof zfGetHint !== 'undefined') {
      hint = zfGetHint(this.mg.zfBoard, this.mg.zfRows, this.mg.zfCols, this.mg.zfDiff);
    }
    if (!hint) {
      console.warn('阵法提示：暂时推不出');
      return;
    }
    // 应用提示：雷 = 自动插旗；安全 = 自动揭开
    if (hint.type === 'mine') {
      this.mg.zfBoard[hint.r][hint.c].flagged = true;
    } else {
      // 揭开安全格
      if (typeof zfRevealCellInternal !== 'undefined') {
        zfRevealCellInternal(this.mg.zfBoard, this.mg.zfRows, this.mg.zfCols, hint.r, hint.c);
      }
    }
    // 胜利检查
    if (typeof zfCheckWin !== 'undefined' && zfCheckWin(this.mg.zfBoard, this.mg.zfRows, this.mg.zfCols)) {
      this.mg.zfOver = 'win';
      this.score += this.mg.zfScoreMultiplier;
      this.updateScore(this.score);
    }
    this.render(true);
  },
  mgZfSurrender() {
    if (this.mg.zfOver) return;
    if (confirm('放弃本局？当前得分不计入')) {
      this.mg.zfOver = 'surrender';
      this.render(true);
      // 放弃 = 退出当前研习/考试
      if (this.mode === 'exam') {
        this.stop('history');
      } else {
        // 研习也退出（放弃就是不想玩了）
        this.stop('history');
      }
    }
  },
  mgZfRender() {
    const diff = this.mg.zfDiff;
    const board = this.mg.zfBoard;
    const rows = this.mg.zfRows, cols = this.mg.zfCols;
    const tool = this.mg.zfTool;
    const over = this.mg.zfOver;

    // 列标注（中档+高档）
    let colLabelsHtml = '';
    if (diff.hasRowCol) {
      let row = '<div class="zf-label-row">';
      row += '<div class="zf-label-corner"></div>';
      for (let c = 0; c < cols; c++) {
        row += `<div class="zf-label-cell zf-col-label">${board._colSums ? board._colSums[c] : ''}</div>`;
      }
      row += '</div>';
      colLabelsHtml = row;
    }

    // 行标注 + 棋盘
    let boardRowsHtml = '';
    for (let r = 0; r < rows; r++) {
      let rowHtml = '<div class="zf-row">';
      if (diff.hasRowCol) {
        rowHtml += `<div class="zf-label-cell zf-row-label">${board._rowSums ? board._rowSums[r] : ''}</div>`;
      }
      for (let c = 0; c < cols; c++) {
        const cell = board[r][c];
        let display = '';
        let cls = 'zf-cell';
        if (cell.flagged) { display = '🚩'; cls += ' flagged'; }
        else if (!cell.revealed) { cls += ' hidden'; }
        else if (cell.mine) { display = '💥'; cls += ' mine'; }
        else if (cell.adjMines > 0) { display = cell.adjMines; cls += ' revealed'; }
        else { cls += ' revealed zero'; }
        rowHtml += `<div class="${cls}" data-sact="zf-cell:${r},${c}">${display}</div>`;
      }
      rowHtml += '</div>';
      boardRowsHtml += rowHtml;
    }

    // 宫格标注（高档）
    let grid3x3Html = '', grid4x4Html = '';
    if (diff.has3x3 && board._grid3x3) {
      const g = board._grid3x3;
      // 3x3 宫标注：放在每个宫的右上角
      for (let gr = 0; gr < g.div; gr++) {
        for (let gc = 0; gc < g.div; gc++) {
          const cx = gc * g.colsPerGrid + g.colsPerGrid - 0.5; // 居中于宫右上角
          const cy = gr * g.rowsPerGrid + 0.5;
          grid3x3Html += `<div class="zf-grid-label zf-3x3-label" style="grid-column:${cx};grid-row:${cy}">${g.labelRows[gr][gc]}</div>`;
        }
      }
    }
    if (diff.has4x4 && board._grid4x4) {
      const g = board._grid4x4;
      for (let gr = 0; gr < g.div; gr++) {
        for (let gc = 0; gc < g.div; gc++) {
          const cx = gc * g.colsPerGrid + g.colsPerGrid - 0.5;
          const cy = gr * g.rowsPerGrid + 0.5;
          grid4x4Html += `<div class="zf-grid-label zf-4x4-label" style="grid-column:${cx};grid-row:${cy}">${g.labelRows[gr][gc]}</div>`;
        }
      }
    }

    // 棋盘
    const boardStyle = `grid-template-columns:${diff.hasRowCol ? 'auto ' : ''}repeat(${cols}, minmax(0, 40px)); width: max-content`;
    const boardHtml = `<div class="zf-board-wrap">
      ${colLabelsHtml}
      <div class="zf-board" style="${boardStyle}">
        ${boardRowsHtml}
        ${grid3x3Html}
        ${grid4x4Html}
      </div>
    </div>`;

    // 顶部档次信息
    const gradeStr = typeof formatGrade !== 'undefined' ? formatGrade(this.subj('history').currentGrade || 0) : 'F';
    const labelStr = diff.label + '（' + rows + '×' + cols + '，' + diff.mines + ' 雷）';

    // 底部控制栏
    let bottomHtml = '';
    if (!over) {
      bottomHtml = `<div class="zf-toolbar">
        <button class="zf-btn zf-surrender-btn" data-sact="zf-surrender">🚪 放弃</button>
        <button class="zf-btn zf-restart-btn" data-sact="zf-restart">🔄 重新开局</button>
        <span class="zf-toolbar-right">
          <button class="zf-btn zf-hint-btn" data-sact="zf-hint">🧠 提示（1考签）</button>
          <button class="zf-btn zf-tool-btn ${tool==='reveal'?'active':''}" data-sact="zf-tool:reveal">✋ 揭开</button>
          <button class="zf-btn zf-tool-btn ${tool==='flag'?'active':''}" data-sact="zf-tool:flag">🚩 插旗</button>
        </span>
      </div>`;
    } else {
      let resultMsg = '';
      if (over === 'win') resultMsg = '🎉 胜利！+' + this.mg.zfScoreMultiplier + ' 分';
      else if (over === 'lose') resultMsg = '💥 挖到雷了';
      else resultMsg = '👋 已放弃';
      bottomHtml = `<div class="zf-toolbar">
        <div class="zf-over-msg ${over}">${resultMsg}</div>
        <button class="zf-btn zf-restart-btn" data-sact="zf-restart">🔄 再来一局</button>
      </div>`;
    }

    return `<div class="zf-wrap">
      <div class="zf-header">
        <span class="zf-grade">品阶 ${gradeStr}</span>
        <span class="zf-tier-label">${labelStr}</span>
        ${this.mode === 'exam' ? '<span class="zf-exam-tag">考试中</span>' : ''}
      </div>
      ${boardHtml}
      ${bottomHtml}
    </div>`;
  },

  /* ---- 绘卷（调色）art ---- */
  mgArtInit() {
    this.mg.elo = this.subj('art').currentGrade || 0;
    this.mg.answerCount = Math.max(Math.floor(this.mg.elo / 2) + 4, this.mg.elo + 1);
    this.mg.changeAmountMin = Math.max(2, 60 / (this.mg.elo * 0.4 + 1) / Math.pow(1.1, this.mg.elo));
    this.mg.changeAmountMax = Math.max(5, 180 / (this.mg.elo * 0.25 + 1) / Math.pow(1.05, this.mg.elo));
    this.mgArtQuestion();
  },
  mgArtQuestion() {
    this.mg.mixed = [];
    this.mg.answers = [];
    const firstHue = randomInt(0, 359);
    let secondHue = chance(0.5) ? randomInt(firstHue + 30, firstHue + 119) : randomInt(firstHue + 240, firstHue + 329);
    while (secondHue >= 360) secondHue -= 360;
    const hslA = 'hsl(' + firstHue + ', 100%, 50%)';
    const hslB = 'hsl(' + secondHue + ', 100%, 50%)';
    this.mg.mixed.push(hslA, hslB);
    this.mg._ans = this.mixHsl(firstHue, secondHue);
    this.mg.solution = randomInt(0, this.mg.answerCount - 1);
    const base = this.mg._ans;
    for (let i = 0; i < this.mg.answerCount; i++) {
      let hue = base;
      if (i !== this.mg.solution) hue = (hue + randomFloat(this.mg.changeAmountMin, this.mg.changeAmountMax) * (chance(0.5) ? 1 : -1) + 360) % 360;
      this.mg.answers.push('hsl(' + Math.round(hue) + ', 100%, 50%)');
    }
    this.mg.answerCount = Math.min(this.mg.answerCount, this.mg.answers.length);
  },
  /* 色相混合（把第二个色相在第一/二色相的色环平均位置做加权）——模拟 color.mix */
  mixHsl(h1, h2) {
    const d = ((h2 - h1 + 540) % 360) - 180;
    return (h1 + d / 2 + 360) % 360;
  },
  mixHex() { return null; },
  mgArtRender() {
    return `
      <div class="sc-mg-mixed">
        ${this.mg.mixed.map(c => `<div class="sc-color-cell" style="background:${c}"></div>`).join('')}
        <span class="sc-plus">+</span>
        <div class="sc-answer-cells">
          ${this.mg.answers.map((c, i) => {
            const isSol = i === this.mg.solution;
            return `<div class="sc-color-ans ${isSol ? 'sol' : ''}" style="background:${c}" data-sact="mg-art:${i}"></div>`;
          }).join('')}
        </div>
      </div>
      <div class="sc-mg-fine">选择混色的结果</div>`;
  },
  mgArtAnswer(i) {
    if (i === this.mg.solution) { this.score++; this.updateScore(this.score); }
    else { this.timer += 5; }
    this.mgArtQuestion();
    this.render(true);
  },

  /* ---- 丹术（炼金观气）chemistry ---- */
  mgChemInit() {
    this.mg.elo = this.subj('chemistry').currentGrade || 0;
    this.mg.triesLeft = this.mode === 'exam' ? 1 : 0;
    this.mg.accuracyExpected = Math.max(0.1, 0.4 - this.mg.elo * 0.012);
    this.mg.operators = ['shape'];
    if (this.mg.elo >= 2) this.mg.operators.push('size');
    if (this.mg.elo >= 5) this.mg.operators.push('moveRandom');
    if (this.mg.elo >= 8) this.mg.operators.push('spin');
    if (this.mg.elo >= 11) this.mg.operators.push('moveDirection');
    this.mg.colorAmount = Math.min(8, Math.ceil(this.mg.elo / 3) + 3);
    this.mg.revealTime = Math.max(5, Math.min(15, 25 - this.mg.elo));
    this.mg.perfectScore = Math.max(75, Math.min(100, 105 - this.mg.elo));
    this.mg.answer = 15;
    this.mg.colors = ['#4caf50', '#2196f3', '#ffeb3b', '#9c27b0', '#8d6e63', '#ff9800', '#9e9e9e', '#00bcd4'];
    this.mg.gameState = 0;
    this.mg.gameTick = 0;
    this.mgChemNewParticles();
  },
  mgChemMaxTicks() { return this.mode === 'exam' ? 25 : 30; },
  mgChemShapeColor(c) { return this.mg.colors[c]; },
  mgChemNewParticles() {
    const colorAmount = this.mg.colorAmount;
    const maxShape = 30;
    const particleAmount = buildArray(colorAmount).map(() => randomInt(0, maxShape));
    const particleSum = particleAmount.reduce((a, b) => a + b, 0);
    let particleList = [];
    let id = 0;
    particleAmount.forEach((n, color) => {
      for (let i = 0; i < n; i++) {
        let x, y, isValid = false, tries = 0;
        while (!isValid && tries < 100) {
          x = randomFloat(-20, 20); y = randomFloat(-10, 10);
          isValid = particleList.findIndex(el => Math.abs(x - el.x) + Math.abs(y - el.y) < 2) === -1;
          tries++;
        }
        particleList.push({ id, color, rotate: randomInt(0, 359), x, y, spin: 'n', move: 'n', size: 2, time: randomInt(5 - this.mg.revealTime, this.mgChemMaxTicks() - 5) });
        id++;
      }
    });
    let sizeDistribution = [0, 0, 0];
    if (this.mg.operators.includes('size')) {
      particleList = shuffleArray(particleList);
      const distribution = this.reachSplit(3);
      let cs = 0;
      particleList = particleList.map((el, i) => {
        while (((i + 0.5) / particleList.length) > distribution[cs]) cs++;
        sizeDistribution[cs]++;
        return Object.assign({}, el, { size: [1, 2, 3][cs] });
      });
    }
    let spinDistribution = [0, 0, 0];
    if (this.mg.operators.includes('spin')) {
      particleList = shuffleArray(particleList);
      const distribution = this.reachSplit(3);
      let cs = 0;
      particleList = particleList.map((el, i) => {
        while (((i + 0.5) / particleList.length) > distribution[cs]) cs++;
        spinDistribution[cs]++;
        return Object.assign({}, el, { spin: ['l', 'n', 'r'][cs] });
      });
    }
    let moveDistribution = [0, 0, 0, 0];
    if (this.mg.operators.includes('moveRandom')) {
      particleList = shuffleArray(particleList);
      const distribution = this.reachSplit(5);
      let cs = 0;
      particleList = particleList.map((el, i) => {
        while (((i + 0.5) / particleList.length) > distribution[cs]) cs++;
        moveDistribution[cs >= 2 ? (cs - 1) : 0]++;
        return Object.assign({}, el, { move: cs >= 2 ? ['h', 'v', 'dr', 'dl'][cs - 2] : 'n' });
      });
    }
    this.mg.particleAmount = particleAmount;
    this.mg.sizeDistribution = sizeDistribution;
    this.mg.spinDistribution = spinDistribution;
    this.mg.moveDistribution = moveDistribution;
    this.mg.particleSum = particleSum;
    this.mg.questionType = randomElem(this.mg.operators);
    let correct = 0;
    switch (this.mg.questionType) {
      case 'shape': this.mg.questionParam = randomInt(0, colorAmount - 1); correct = particleAmount[this.mg.questionParam]; break;
      case 'moveRandom': this.mg.questionParam = chance(0.5); correct = this.mg.questionParam ? (moveDistribution[1] + moveDistribution[2] + moveDistribution[3]) : moveDistribution[0]; break;
      case 'spin': this.mg.questionParam = randomInt(0, 2); correct = spinDistribution[this.mg.questionParam]; break;
      case 'size': this.mg.questionParam = randomInt(0, 2); correct = sizeDistribution[this.mg.questionParam]; break;
      case 'moveDirection': this.mg.questionParam = randomInt(0, 2); correct = moveDistribution[this.mg.questionParam + 1]; break;
    }
    this.mg.correctAnswer = correct;
    this.mg.maxAnswer = this.mg.questionType === 'shape' ? maxShape : particleSum;
    this.mg.particles = particleList;
    this.mg.gameState = 1;
    this.mg.gameTick = 0;
    this.mg.answer = Math.round(this.mg.maxAnswer / 2);
    this.mgChemStopTicker();
    this.mg._chemInterval = setInterval(() => this.mgChemTick(), 1000);
  },
  reachSplit(n) {
    let inc = 0;
    return randomSplit(n).map(el => { inc += el; return inc; });
  },
  mgChemTick() {
    this.mg.gameTick++;
    if (this.mg.gameTick >= this.mgChemMaxTicks()) {
      this.mg.gameState++;
      if (this.mg.gameState === 2) {
        this.mg.gameTick = this.mgChemMaxTicks() - 10;
      } else if (this.mg.gameState === 3) {
        this.mgChemStopTicker();
        const diff = Math.min(1, Math.abs(this.mg.answer - this.mg.correctAnswer) / this.mg.maxAnswer / this.mg.accuracyExpected);
        const gain = Math.min((1 - diff) * 100, this.mg.perfectScore);
        this.mgChemChangeScore(gain);
        const self = this;
        setTimeout(() => this.mgChemStartNew(), 5000);
      }
    }
    this.mgChemUpdateTimer();
    if (this.mg.gameState !== 3) this.render(true);
  },
  mgChemUpdateTimer() { this.updateTimer(this.mgChemMaxTicks() - this.mg.gameTick); },
  mgChemChangeScore(diff) {
    this.score = Math.max(0, this.score + diff);
    if (this.mode === 'exam' && this.subj('chemistry') && this.score > this.subj('chemistry').scoreGoal) this.score = this.subj('chemistry').scoreGoal;
    this.updateScore(this.score);
  },
  mgChemStartNew() {
    if (this.mode === 'practice') { this.mg.triesLeft++; }
    else if (this.mg.triesLeft <= 0 || (this.mode === 'exam' && this.score >= this.subj('chemistry').scoreGoal)) {
      this.stop('chemistry');
      return;
    } else { this.mg.triesLeft--; }
    this.mg.gameState = 0;
    this.mg.gameTick = 0;
    this.mgChemNewParticles();
    this.render(true);
  },
  mgChemStopTicker() { if (this.mg._chemInterval) { clearInterval(this.mg._chemInterval); this.mg._chemInterval = null; } },
  mgChemSubmit() {
    if (this.mg.gameState !== 3) return;
    const diff = Math.min(1, Math.abs(this.mg.answer - this.mg.correctAnswer) / this.mg.maxAnswer / this.mg.accuracyExpected);
    const gain = Math.min((1 - diff) * 100, this.mg.perfectScore);
    this.mgChemChangeScore(gain);
  },
  mgChemRender() {
    if (this.mg.gameState === 0) return `<div class="sc-mg-reset">观气开始……</div>`;
    const q = this.mgChemQuestionText();
    const showAns = this.mg.gameState === 3;
    const parts = this.pickVisibleParticles(30);
    const renderP = parts.map(p => {
      const sz = p.size * 6;
      return `<div class="sc-chem-sym" style="width:${sz}px;height:${sz}px;left:${50 + p.x * 3}%;top:${50 + p.y * 3}%;background:${this.mg.colors[p.color]};opacity:${showAns ? 0.9 : 0.9}">${this.chemShapeGlyph(p)}</div>`;
    }).join('');
    return `
      ${showAns ? `<div class="sc-mg-question small">${{ shape: '该色个数', size: '该大小个数', moveRandom: '该动式个数', spin: '该旋向个数', moveDirection: '该向个数' }[this.mg.questionType]}：${this.mg.correctAnswer}</div>` : `<div class="sc-mg-question small">${q}</div>`}
      <div class="sc-chem-stage">${renderP}</div>
      <div class="sc-chem-slider">
        <input type="range" min="0" max="${this.mg.maxAnswer}" value="${this.mg.answer}" ${showAns ? 'disabled' : ''} oninput="GB_SC_VIEW.mgChemSlide(this.value)" />
        <span>${this.mg.answer} / ${this.mg.maxAnswer}</span>
      </div>
      <button class="sc-btn" data-sact="mg-chem-submit" ${showAns ? '' : 'disabled'}>作答</button>`;
  },
  mgChemSlide(v) { this.mg.answer = parseInt(v); this.setSliderLabel(); },
  setSliderLabel() {},
  chemShapeGlyph(p) {
    const shapes = ['▲', '■', '★', '●', '⬢', '⬠', '▬', '✴'];
    return shapes[p.color % shapes.length];
  },
  pickVisibleParticles(n) {
    const list = [];
    const tick = this.mg.gameTick;
    for (let i = 0; i < this.mg.particles.length && i < n; i++) {
      const p = this.mg.particles[i];
      if (this.mg.gameState !== 3 && (tick < p.time || tick >= (p.time + this.mg.revealTime))) continue;
      list.push(p);
    }
    return list;
  },
  mgChemQuestionText() {
    const q = this.mg.questionType;
    const p = this.mg.questionParam;
    const cols = ['青', '蓝', '黄', '紫', '棕', '橙', '灰', '青苍'];
    return q === 'shape' ? '数一数：' + cols[p] + ' 色的微粒有几个？'
      : q === 'size' ? '数一数：' + ['小', '中', '大'][p] + ' 型微粒有几个？'
      : q === 'spin' ? '数一数：' + ['左旋', '静止', '右旋'][p] + ' 旋向微粒有几个？'
      : q === 'moveRandom' ? '数一数：' + (p ? '移动' : '静止') + ' 微粒有几个？'
      : '数一数：' + ['无', '水平', '垂直'][p] + ' 向微粒有几个？';
  }
};
if (typeof module !== "undefined") { module.exports = GB_SC_VIEW; }

/* ===== GB_TIME_SKIP：金尘时间跳过全局弹窗（独立于 sc_view，任何页面可触发） ===== */
var GB_TIME_SKIP = {
  _dlg: null,       // DOM overlay 元素
  _minute: 5,

  /* 核心公式：原版 minutes^0.9 * 100，我们 * 10（十分之一） */
  cost(minutes) {
    if (!minutes || minutes <= 0) return 0;
    return Math.round(Math.pow(Math.min(minutes, 99999), 0.9) * 10);
  },

  /* 当前持有金尘（自动 init SC_RT） */
  _dust() {
    try {
      const SC = GB_MODULES.get('school');
      if (!SC || !SC.core || !SC.core.CUR) return 0;
      if (!SC.core.RT.ready) { try { SC.core.RT.init({}); } catch(e) {} }
      return SC.core.CUR.value('school_goldenDust');
    } catch (e) { return 0; }
  },
  _cap() {
    try {
      const SC = GB_MODULES.get('school');
      if (!SC || !SC.core || !SC.core.CUR) return 0;
      if (!SC.core.RT.ready) { try { SC.core.RT.init({}); } catch(e) {} }
      return SC.core.CUR.cap('school_goldenDust');
    } catch (e) { return 0; }
  },

  /* 当前激活主玩法（用于 tick） */
  _activeMod() {
    const mains = ['lm', 'village', 'horde', 'farm', 'ruin'];
    const cur = typeof GB_APP !== 'undefined' ? GB_APP.currentFeature : null;
    if (cur && mains.indexOf(cur) >= 0) return cur;
    for (let i = 0; i < mains.length; i++) {
      try {
        const m = GB_MODULES.get(mains[i]);
        if (m && GB_UNLOCK && GB_UNLOCK.isUnlocked(mains[i] + 'Feature')) return mains[i];
      } catch (e) {}
    }
    return null;
  },
  _modCN(id) {
    return ({ lm: '灵脉', village: '宗门', horde: '降妖', farm: '灵植园', ruin: '藏宝阁' })[id] || id;
  },
  _fmtSec(sec) {
    if (sec < 60) return sec + ' 秒';
    if (sec < 3600) return Math.round(sec / 60) + ' 分钟';
    const h = Math.floor(sec / 3600);
    const m = Math.round((sec % 3600) / 60);
    return h + ' 小时' + (m > 0 ? m + ' 分' : '');
  },
  _fmt(n) { return typeof formatNum === 'function' ? formatNum(n) : (Math.floor(n) || 0).toLocaleString(); },

  /* 打开弹窗 */
  open() {
    // 先关旧的（如果还在），再新开
    this.close();
    this._minute = this._minute || 5;
    this._dlg = document.createElement('div');
    this._dlg.id = 'gb-time-skip-dlg';
    this._dlg.innerHTML = this._render();
    document.body.appendChild(this._dlg);
    this._bindEvents();
  },
  /* 关闭弹窗 */
  close() {
    if (this._dlg) { this._dlg.remove(); this._dlg = null; }
  },
  /* 刷新显示（sc_view 页面内按钮点「最大」后需要刷新） */
  refresh() {
    if (!this._dlg) return;
    this._dlg.innerHTML = this._render();
    this._bindEvents();
  },
  isOpen() { return !!this._dlg; },

  _bindEvents() {
    const self = this;
    // overlay 点击关闭
    this._dlg.onclick = function(e) {
      if (e.target === self._dlg) self.close();
    };
    // 取消按钮
    const closeBtn = this._dlg.querySelector('[data-ts-close]');
    if (closeBtn) closeBtn.onclick = function() { self.close(); };
    // 快捷分钟按钮
    this._dlg.querySelectorAll('[data-ts-min]').forEach(function(btn) {
      btn.onclick = function() { self._minute = parseInt(btn.getAttribute('data-ts-min')); self.refresh(); };
    });
    // 最大按钮
    const maxBtn = this._dlg.querySelector('[data-ts-max]');
    if (maxBtn) maxBtn.onclick = function() {
      const d = self._dust();
      self._minute = Math.max(1, Math.floor(Math.pow(d / 10, 1 / 0.9)));
      self.refresh();
    };
    // 确认按钮
    const okBtn = this._dlg.querySelector('[data-ts-ok]');
    if (okBtn) okBtn.onclick = function() { self._doSkip(); };
    // 输入框
    const input = this._dlg.querySelector('[data-ts-input]');
    if (input) input.onchange = function() {
      self._minute = Math.max(1, Math.min(99999, parseInt(this.value) || 1));
      self.refresh();
    };
  },

  _render() {
    const d = this._dust();
    const cap = this._cap();
    const m = Math.max(1, Math.min(99999, this._minute || 5));
    const cost = this.cost(m);
    const canAfford = d >= cost;
    const target = this._activeMod();
    const targetName = target ? this._modCN(target) : '主玩法';
    const sec = m * 60;
    return `
      <div style="position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:99999;display:flex;align-items:center;justify-content:center;">
        <div style="background:linear-gradient(180deg,#1e293b,#0f172a);border:1px solid rgba(251,191,36,0.3);border-radius:16px;padding:24px;max-width:420px;width:92%;box-shadow:0 20px 60px rgba(0,0,0,0.6);font-family:'Noto Sans SC',sans-serif;">
          <div style="text-align:center;margin-bottom:16px;">
            <div style="font-size:20px;font-weight:700;color:#fbbf24;display:flex;align-items:center;justify-content:center;gap:8px;">
              <span style="font-size:28px;">⏳</span> 时间跳过
            </div>
            <div style="color:#94a3b8;font-size:13px;margin-top:4px;">消耗金尘加速${targetName}时间流逝</div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(30,41,59,0.8);border-radius:10px;padding:12px 16px;margin-bottom:16px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:24px;">⏱</span>
              <div>
                <div style="color:#fbbf24;font-weight:600;">${this._fmt(d)}${isFinite(cap) ? ' / ' + this._fmt(cap) : ''}</div>
                <div style="color:#64748b;font-size:12px;">持有金尘</div>
              </div>
            </div>
            <div style="color:#475569;">→</div>
            <div style="text-align:right;">
              <div style="color:${canAfford ? '#4ade80' : '#ef4444'};font-weight:600;">${this._fmt(cost)}</div>
              <div style="color:#64748b;font-size:12px;">消耗金尘</div>
            </div>
          </div>
          <div style="margin-bottom:12px;">
            <div style="color:#cbd5e1;font-size:13px;margin-bottom:8px;">跳过时间（分钟）</div>
            <div style="display:flex;gap:8px;align-items:center;">
              <input data-ts-input type="number" min="1" max="99999" value="${m}"
                style="flex:1;background:rgba(15,23,42,0.9);border:1px solid #334155;color:#f1f5f9;padding:10px 14px;border-radius:10px;font-size:16px;outline:none;"
              />
              <button data-ts-max title="最大可跳过"
                style="background:rgba(251,191,36,0.2);border:1px solid #fbbf24;color:#fbbf24;padding:10px 16px;border-radius:10px;cursor:pointer;font-weight:600;">最大</button>
            </div>
            <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
              ${[5, 15, 30, 60, 120].map(v => `
                <button data-ts-min="${v}"
                  style="background:rgba(51,65,85,0.6);border:1px solid #475569;color:#cbd5e1;padding:4px 12px;border-radius:6px;cursor:pointer;font-size:12px;">${v === 60 ? '1时' : v === 120 ? '2时' : v + '分'}</button>
              `).join('')}
            </div>
          </div>
          <div style="background:rgba(30,41,59,0.6);border-radius:8px;padding:10px 14px;margin-bottom:16px;color:#94a3b8;font-size:12px;line-height:1.6;">
            <div>📜 加速时长：<span style="color:#f1f5f9;">${this._fmtSec(sec)}</span></div>
            <div>🎯 加速模块：<span style="color:#f1f5f9;">${targetName}</span></div>
            <div>💎 金尘公式：<span style="color:#64748b;">消耗 = ⌈分钟^0.9 × 10⌉</span></div>
          </div>
          <div style="display:flex;gap:8px;">
            <button data-ts-close
              style="flex:1;background:rgba(51,65,85,0.8);border:1px solid #475569;color:#94a3b8;padding:12px;border-radius:10px;cursor:pointer;font-weight:500;">取消</button>
            <button data-ts-ok ${canAfford ? '' : 'disabled'}
              style="flex:2;background:${canAfford ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(71,85,105,0.5)'};border:none;color:${canAfford ? '#fff' : '#64748b'};padding:12px;border-radius:10px;cursor:${canAfford ? 'pointer' : 'not-allowed'};font-weight:600;font-size:15px;">
              ⏳ 确认跳过（${this._fmt(cost)} 金尘）
            </button>
          </div>
        </div>
      </div>`;
  },

  _doSkip() {
    const minutes = this._minute || 0;
    if (minutes <= 0) return;
    const cost = this.cost(minutes);
    const dust = this._dust();
    if (dust < cost) {
      if (typeof GB_APP !== 'undefined' && GB_APP.toast) GB_APP.toast('金尘不足！需要 ' + this._fmt(cost) + '，持有 ' + this._fmt(dust), '#ef4444');
      return;
    }
    // 扣费
    try {
      const SC = GB_MODULES.get('school');
      SC.core.CUR.spend('school_goldenDust', cost);
    } catch (e) { return; }
    // tick 目标模块
    const target = this._activeMod();
    const seconds = minutes * 60;
    let ticked = false;
    if (target) {
      try {
        const m = GB_MODULES.get(target);
        if (m && m.core && m.core.RT && typeof m.core.RT.tick === 'function') {
          m.core.RT.tick(seconds);
          ticked = true;
        }
      } catch (e) {}
    }
    // tick 藏经阁自身
    try {
      const SC2 = GB_MODULES.get('school');
      if (SC2 && SC2.core && SC2.core.RT && typeof SC2.core.RT.tick === 'function') SC2.core.RT.tick(seconds);
    } catch (e) {}
    // 刷新 meta + 存档
    try { if (typeof GB_META !== 'undefined') GB_META.syncAll(); } catch (e) {}
    try { if (typeof GB_MODULES !== 'undefined') GB_MODULES.saveAll(); } catch (e) {}
    if (typeof GB_APP !== 'undefined') {
      try { GB_APP.persist(); } catch (e) {}
      GB_APP._updateHourglassBadge();
    }
    // 关弹窗 + toast
    this.close();
    const msg = ticked
      ? `⏱ 时间跳过成功！消耗 ${this._fmt(cost)} 金尘，加速 ${this._fmtSec(seconds)}（${this._modCN(target)}）`
      : `⏱ 时间跳过成功！消耗 ${this._fmt(cost)} 金尘，已加速 ${this._fmtSec(seconds)}`;
    if (typeof GB_APP !== 'undefined' && GB_APP.toast) GB_APP.toast(msg, '#4ade80');
    // 刷新 sc_view（如果正在看藏经阁）
    try { if (typeof GB_SC_VIEW !== 'undefined' && GB_SC_VIEW.el) GB_SC_VIEW.render(); } catch (e) {}
  }
};

/* ===== 挂接统一地基：由注册表统一驱动 load / save（tick 已交给全局循环） ===== */
if (typeof GB_MODULES !== 'undefined') GB_MODULES.attachView('school', GB_SC_VIEW);