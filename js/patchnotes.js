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
