/**
 * 版本更新日志
 *
 * 结构：
 *   GB_PATCHNOTES = [
 *     {
 *       version: '版本号',
 *       date: 'YYYY-MM-DD',
 *       groups: [
 *         {
 *           feature: 'lm',          // 对应 app.js features[id]，'meta' 表示全局
 *           sections: [
 *             { type: 'added',   label: '新增', items: ['条目1', '条目2'] },
 *             { type: 'changed', label: '改动', items: ['条目1'] },
 *             { type: 'fixed',   label: '修复', items: ['条目1'] },
 *             { type: 'balance', label: '调整', items: ['条目1'] }
 *           ]
 *         },
 *         ...（该版本下所有玩法组）
 *       ]
 *     },
 *     ...（按版本倒序，最新在前）
 *   ]
 *
 * feature → unlockKey 映射在 GB_APP 内部维护。
 * feature='meta' 的条目始终可见（全局改动，不绑定具体玩法）。
 */
var GB_PATCHNOTES = [

  {
    version: '0.5.0',
    date: '2026-10-05',
    groups: [

      { feature: 'lingbao', sections: [
        { type: 'added', label: '新增', items: [
          '灵宝获取途径上线：10 条仙尊任务链的最终任务各发放一件本系灵宝',
          '总等级里程碑发灵宝：40 灵锄 / 100 起子 / 150 梦境网 / 300 雨靴 / 400 灵药菇（对齐 gooboo meta.js 40/100 送遗物）',
          '新增灵宝「灵殿钥匙」：发现即解锁灵宝殿（对齐 gooboo museumKey）',
          '新增灵纹「典籍」（藏经阁系）：藏书 +2/级、金尘上限 +2500/级',
          '9 件灵宝补上主动技能：消耗灵宝之力立即析出对应模块资源',
        ]},
        { type: 'fixed', label: '修复', items: [
          '修复跨模块效果路由：灵宝/灵纹效果此前写入目标模块后无人读取，现按各模块实际键名正确落地（灵脉系做 lm* 键名翻译）',
          '修复金印灵纹断线：灵玉产出与仙器槽位加成现正确作用于仙器模块',
          '灵宝之力倍率系统升级为 gooboo 语义：多来源按 key 聚合（基础值相加、倍率相乘），不再互相覆盖',
        ]},
      ]},

      { feature: 'dao', sections: [
        { type: 'fixed', label: '修复', items: [
          '修复跨界神器（锻造）效果错误写入自身模块的问题，现按各神器 feature 字段路由（乾坤袋的仙器槽位终于能突破 10 格）',
        ]},
      ]},

      { feature: 'general', sections: [
        { type: 'added', label: '新增', items: [
          '每条仙尊任务链的最终任务完成后额外获得一件先天灵宝',
        ]},
      ]},

      { feature: 'xianqi', sections: [
        { type: 'fixed', label: '修复', items: [
          '修复仙器槽位/灵玉产出的外部加成无法生效的问题（模块路由指向错误的 keyPrefix）',
        ]},
      ]},

      { feature: 'meta', sections: [
        { type: 'added', label: '新增', items: [
          '总等级提升时自动检查灵宝里程碑并发放对应灵宝',
        ]},
      ]},
    ],
  },

  {
    version: '0.4.4',
    date: '2026-10-05',
    groups: [

      { feature: 'general', sections: [
        { type: 'added', label: '新增', items: [
          '圣人指引模块上线：12 位仙尊（10 激活 + 2 预留），每位绑定一个辅助玩法',
          '任务奖励系统：完成任务直接发放对应玩法的辅助货币（灵宝之力、灵玉、赤元、混元、青元、翡翠、宝石等），不再使用无消费场景的功德',
          '仙尊分阶段解锁：仙尊解锁条件 = 其绑定玩法的 feature（灵脉→元始天尊、大道法则→鸿钧老祖、宗门→女娲娘娘……），与玩法解锁同步',
          '任务链顺序解锁：每位仙尊只有第 1 条任务初始解锁，完成后自动解锁下一条',
          '叙事内容：12 位仙尊入场白（lore）+ 任务线故事（story），展开卡片后顶部显示金色引用块',
        ]},
        { type: 'changed', label: '改动', items: [
          '未解锁的任务线显示为锁定状态（半透明、虚线边框、🔒图标、"完成前置任务后自动解锁"提示），不再完全隐藏',
          '仙尊卡片点击区域从头部扩大到整张卡片',
          '顶部货币栏显示赤元/灵宝之力/灵玉/宝石四种辅助货币（无值自动隐藏）',
        ]},
        { type: 'fixed', label: '修复', items: [
          '任务进度查询模块推断失败：task 无 feature 字段导致无法读取当前值，改为从 stat key 前缀推断模块',
          '视图层空引用：GEN_MODULE.STAT / GEN_STATE.quests 未初始化时崩溃，已加计算属性与空值防御',
        ]},
      ]},

      { feature: 'lm', sections: [
        { type: 'fixed', label: '修复', items: [
          '铸造台无法使用：铸造对话框内原料芯片不显示，无法选择灵材铸造灵锄。根因为渲染过滤条件错误——将 ingredient 对象直接与 0 比较（对象 > 0 恒为 false），导致全部 9 种矿被过滤掉。现改为检查玩家实际持有该矿的数量（currency value > 0）。',
        ]},
        { type: 'changed', label: '改动', items: [
          '灵矿、灵锭、灵材、灵气压全面重命名，彻底脱离铝/锡/钛/铂/铱/锇/铅等化学元素名，改用修仙意象命名：银砂矿、霜纹矿、青纹矿、虹影矿、重冥矿、乌墨矿等；灵气压改为青冥气、赤焰气、紫霄气、幽冷气、曜精气、碧落气。',
          '秘法升级子项折叠按钮图标改为 V 形箭头（折叠态向下、展开态向上），统一视觉风格。',
        ]},
      ]},

      { feature: 'ho', sections: [
        { type: 'fixed', label: '修复', items: [
          '血条变化无缓动：主循环每秒整段重建页面导致 CSS 过渡失效，改为重建后血条从旧宽度平滑动画到新宽度（血/元/炁/敌方血条/复活进度条均生效）',
        ]},
      ]},

    ]
  },

  {
    version: '0.4.3',
    date: '2026-10-04',
    groups: [

      { feature: 'school', sections: [
        { type: 'added', label: '新增', items: [
          '阵法（扫雷）核心算法：无猜扫雷，每局雷位可通过纯逻辑推理唯一确定，棋盘随等级扩大（F=8×8 起步，每升一级+1，封顶 15×15）',
        ]},
        { type: 'fixed', label: '修复', items: [
          '演算子游戏中选中格子状态异常',
          '藏经阁子游戏进行中退回到主页再进入，时间不再流逝',
        ]},
      ]},

      { feature: 'meta', sections: [
        { type: 'fixed', label: '修复', items: [
          '时间跳过功能首次使用后无法再次触发',
        ]},
      ]},

    ]
  },

  {
    version: '0.4.2',
    date: '2026-10-03',
    groups: [

      { feature: 'meta', sections: [
        { type: 'added', label: '新增', items: [
          '时间跳过功能：设置弹窗内可手动跳过一定时间，离线收益即时结算',
        ]},
      ]},

    ]
  },

  {
    version: '0.4.1',
    date: '2026-10-02',
    groups: [

      { feature: 'dao', sections: [
        { type: 'fixed', label: '修复', items: [
          '大道法则升级项无法购买，点击按钮无响应',
        ]},
      ]},

    ]
  },

  {
    version: '0.4.0',
    date: '2026-10-02',
    groups: [

      { feature: 'dao', sections: [
        { type: 'added', label: '新增', items: [
          '大道法则：gooboo gem 宝石模块修仙化移植，采集赤元/青元/玄元/紫元/黄元/混元/道元七种五行元，贯通天地大道',
          '7 种五行元按五行生克循环产出，升级可提升产出效率与容量',
        ]},
      ]},

      { feature: 'lingbao', sections: [
        { type: 'added', label: '新增', items: [
          '先天灵宝：天生地养的灵宝系统，灵宝品阶 / 灵纹刻印 / 祭台供奉三件套',
          '3 座祭台可同时供奉灵宝，灵纹自动绘制周期 250000 秒',
        ]},
      ]},

      { feature: 'xianqi', sections: [
        { type: 'added', label: '新增', items: [
          '仙器：gooboo treasure 模块修仙化移植，日精月华自动精进的仙器系统',
          'tick 速度 = 每天一次，带"日精月华"属性的仙器每日自动涨天数 → 等级自动提升',
          '3 种仙器类型：凡器（单效果槽）、双灵宝（双效果槽）、...',
        ]},
      ]},

      { feature: 'general', sections: [
        { type: 'added', label: '新增', items: [
          '圣人指引：gooboo general quest 系统完整移植',
          'stage → task 推进模型，7 种任务类型覆盖各模块 stat、物品、解锁条件',
          '每秒 tick 扫 quest，条件满足即 complete → 发放奖励并自动推进下一阶段',
        ]},
      ]},

      { feature: 'meta', sections: [
        { type: 'added', label: '新增', items: [
          '版本更新日志系统：关于弹窗新增版本号显示和「版本更新日志」入口，支持按玩法分组查看、未解锁内容自动隐藏、整版折叠锁定提示',
          'icon.js PATHS 自校验防线：三条致命规则（含双引号 / 不以 SVG 命令开头 / 空 path）+ 长度偏长仅 debug，触发时红条 8 秒 + console.warn，拦截损坏 path 静默进入生产',
        ]},
        { type: 'fixed', label: '修复', items: [
          '全局 tick 每秒刷新时 innerHTML 整块重写导致各视图滚动位置归零——滑到底部后资源刷新被强制拉回顶部',
          '为灵脉 / 宗门 / 灵植园 / 降妖 / 藏经阁 五个视图统一加入 scrollTop 保存/恢复机制（秘境模块原已有此机制），切换 tab 时仍自动回到顶部',
          '灵脉秘法升级列表内层独立滚动容器（.scroll-container-tab / .lm-upg-grid-scroll）不保存滚动位置，现在与外层一并恢复',
          'icon.js mdi-chili-hot SVG path 意外膨胀至 2581 字符 + 混用双引号导致 SyntaxError 全屏黑屏，已替换为 MDI 官方正确 path',
        ]},
      ]},

    ]
  },

  {
    version: '0.3.0',
    date: '2026-10-01',
    groups: [

      { feature: 'ruin', sections: [
        { type: 'added', label: '新增', items: [
          '秘境玩法（搜打撤）正式开放：派遣弟子探索四境秘境，搜奇珍、战妖兽、携宝撤离',
          '三名专属弟子：凌霜（战力型）、青禾（产出型）、云逸（效率型），各有独立等级与专属材料',
          '神器系统：六品质神器，碎片攒够自动解锁，可升级增益弟子战力与撤离效率',
          '事件系统：遭遇、奇遇、探索、采集、专属五类事件，归来后以日志呈现',
          '撤离策略：派遣前设置条件优先级列表，按序判定命中即撤',
          '安全箱机制：派遣期间自动择优存入贵重物品，阵亡时保住箱内物品',
        ]},
      ]},

      { feature: 'village', sections: [
        { type: 'fixed', label: '修复', items: [
          '宗门道法升级视图误显示 premium（gem 模块）升级项，已过滤仅展示 regular',
          '宗门建筑满级后仍出现在升级列表，现已隐藏并显示「未发现升级」占位',
          '建筑队列缺少进度条显示，队首项目现显示实时进度百分比',
        ]},
      ]},

    ]
  },

  {
    version: '0.2.0',
    date: '2026-09-25',
    groups: [

      { feature: 'school', sections: [
        { type: 'added', label: '新增', items: [
          '藏经阁玩法：演算、文墨、史卷、绘卷、丹术五艺修行',
        ]},
      ]},

      { feature: 'meta', sections: [
        { type: 'added', label: '新增', items: [
          '辅助玩法分组：藏经阁、大道法则、先天灵宝、仙器、仙尊指引',
          '全局道行等级系统：各模块 stat 最大值同步，解锁新玩法',
        ]},
        { type: 'changed', label: '改动', items: [
          '首页磁贴按「主玩法 / 辅助玩法」分组展示',
          '各模块声望重置改为本地化：灵脉=开发新灵脉、宗门=宗门搬迁、降妖=轮回、灵植园=培育',
        ]},
      ]},

    ]
  },

  {
    version: '0.1.0',
    date: '2026-09-15',
    groups: [

      { feature: 'lm', sections: [
        { type: 'added', label: '新增', items: [
          '灵脉玩法：凿层岩、引灵气、摄灵资，逐层深入直至渡劫飞升',
        ]},
      ]},

      { feature: 'village', sections: [
        { type: 'added', label: '新增', items: [
          '宗门玩法：辟山门、营山建屋，安置村民、广布香火',
        ]},
      ]},

      { feature: 'farm', sections: [
        { type: 'added', label: '新增', items: [
          '灵植园玩法：辟灵田、栽灵植，耕耘天道直至飞升',
        ]},
      ]},

      { feature: 'horde', sections: [
        { type: 'added', label: '新增', items: [
          '降妖玩法：临黑暗妖境，屠妖破阵，携宝传承直至轮回',
        ]},
      ]},

      { feature: 'meta', sections: [
        { type: 'added', label: '新增', items: [
          '统一 Tick 引擎 + localStorage 本地存档',
          '深色 / 浅色主题切换',
        ]},
      ]},

    ]
  },

];
