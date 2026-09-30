/* ============================================================
 * SC_TEXT —— 藏经阁（school）模块术语表   [设定映射：gooboo · school → 修仙藏经阁]
 * 职责：只提供显示文案，不含任何逻辑与数值。
 * 键口径：CURRENCY 键 = 运行时货币键（含 school_ / gem_ 前缀）
 *        SUBJECT  键 = 学科原键（math/literature/history/art/chemistry）
 *        FEATURE  键 = 五类书籍特征原键（mining/village/farm/horde/gallery）
 *        UPGRADE/RELIC = 升级/遗物原键
 *        TERMS    键 = 通用词条
 * 未命中回落原键名，缺项不会报错。
 * ============================================================ */
const SC_TEXT = {
  MODULE: {
    name: '藏经阁',
    label: '藏经阁 · 修经养神',
    desc: '临此阁诵经习道。演算天机、临摹文墨，赴试夺金尘、开藏经启藏书，以修道行、育藏书。'
  },

  TERMS: {
    school: '藏经阁',
    library: '藏书阁',
    grade: '品阶',
    gradeDescription: '品阶由 F 至 S+，越高越难',
    currentGrade: '当前品阶',
    totalPoints: '道行',
    practice: '演算',
    study: '研习',
    takeExam: '考试',
    answer: '作答',
    leave: '离阁',
    buyPass: '购考签',
    passCapGain: '每日重置后可获 {0} 张考签',
    beginner: '新手护持：金尘 ×{0}',
    convert: '转化',
    confirm: '确认',
    cancel: '取消',
    read: '阅读',
    get: '悟得',
    book: '典籍',
    owned: '已读',
    locked: '未达',
    nextRequirement: '下一需求',
    scalesWithGL: '随该玩法等级成长',
    scalesUpTo: '（成长至 {0} 级）',
    examDustFull: '金尘已满',
    examDustOvercap: '金尘将溢出',
    takeExamNoF: '尚无品阶',
    takeExamNoFStudy: '需先「研习」入门',
    historyExamInfo: '历史科举每局契合减时',
    start: '开始',
    beginExam: '考试开始',
    studyTime: '研习时限：{0}',
    examTime: '考试时限：{0}',
    practiceDescription: '无计时，纯锻炼答题功底',
    studyDescription: '限时 {0}，答对目标分可晋阶',
    takeExamDescription: '限时 {0}，夺金尘 {1} ~ {2}，需 {3} 分',
    takeExamCost: '消耗',
  },

  CURRENCY: {
    school_goldenDust: '金尘',
    school_examPass: '考签',
    gem_sapphire: '蓝宝石',
    gem_emerald: '翡翠',
    gem_ruby: '红宝石'
  },

  SUBJECT: {
    math: '演算',
    math_subtitle: '算术 · 天机推演',
    math_description: '演算法阵，答对每题计一名。乘除、开方、幂随品阶开启。',
    literature: '文墨',
    literature_subtitle: '文学 · 挥毫成章',
    literature_description: '临摹前人文句，逐字誊录入字。',
    history: '史卷',
    history_subtitle: '历史 · 古今配对',
    history_description: '翻开史册，配对同年的纪事密牌。',
    art: '绘卷',
    art_subtitle: '美术 · 调色绘丹青',
    art_description: '依色相调和选择正解之色。',
    chemistry: '丹术',
    chemistry_subtitle: '化学 · 炼金观气',
    chemistry_description: '观丹炉中微粒之色/数/动，答其为几。'
  },

  FEATURE: {
    mining: '灵脉',
    village: '宗门',
    farm: '灵植园',
    horde: '降妖',
    gallery: '藏宝阁'
  },

  UPGRADE: {
    student: '藏经弟子'
  },

  RELIC: {
    notebook: '乾坤手札'
  }
};
if (typeof module !== "undefined") module.exports = SC_TEXT;