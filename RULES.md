# 搜打撤项目 · 开发规则

## 版本号与更新日志（patchnotes.js）

### 版本号何时 +0.01
**以 git 最近一次提交为分界点。** 具体规则：

1. **在 git 最近一次提交之后做的改动** → 合并进当前最新版本号，不递增。
2. **在 git 最近一次提交之前已经存在的改动**（即上一次 commit 已经包含了当前版本的内容）→ 新版本号 +0.01。
3. 如果项目还没有 git repo → 以 `patchnotes.js` 里**第一条**（最新）版本的 date 字段为锚点，当天内追加不递增，跨天递增。

### 写入 patchnotes.js 的流程
1. 打开 `game/js/patchnotes.js`，确认当前最新版本号和日期。
2. 查 git log：`git log -1 --format="%ai"` 拿到最近一次提交时间。
3. 如果当前会话的所有改动都发生在最近一次 commit **之后** → 在现有版本条目里 `groups` 追加 feature 组（或在现有 feature 组里追加 items）。
4. 如果当前会话的改动中有任何一条发生在最近一次 commit **之前** → 新建版本号 +0.01，date 写今天。
5. **绝对不要**自己凭空决定要不要 +0.01。

### patchnotes.js 格式
```js
{
  version: '0.4.4',          // 从已有版本推断，禁止凭空捏造
  date: '2026-10-05',        // YYYY-MM-DD，写当天
  groups: [
    { feature: 'general', sections: [
      { type: 'added',   label: '新增', items: ['...'] },
      { type: 'changed', label: '改动', items: ['...'] },
      { type: 'fixed',   label: '修复', items: ['...'] },
    ]},
  ]
}
```

### feature 取值对照
| feature | 对应玩法 |
|---------|---------|
| `meta` | 全局/跨模块改动，始终可见 |
| `lm` | 灵脉 |
| `vill` | 宗门 |
| `fa` | 农场 |
| `ho` | 降妖 |
| `ru` | 秘境 |
| `sc` | 藏经阁 |
| `dao` | 大道法则 |
| `lingbao` | 先天灵宝 |
| `xianqi` | 仙器 |
| `relic` | 遗物/灵宝 |
| `treasure` | 仙器/宝箱 |
| `general` | 圣人指引 |
| `school` | 藏经阁（旧名，兼容） |

---

## 开发通用规则

### 代码改动
- 尽量用 Edit 工具做精确替换，不要用 PowerShell 批量压缩再格式化，容易搞坏文件。
- 大改动后必须检查 brace 平衡（`{` 和 `}` 数量相同）。
- 跨模块数据结构变动时，同步检查 view 层是否需要更新（视图经常访问 core 层暴露的特定字段）。

### 文件损坏应急
如果文件被意外清空或损坏：
1. 先看有没有 git 可以 `git checkout -- <file>` 恢复。
2. 没有 git 时看 gooboo-main/ 下有没有原版可以参考重建。
3. 重建后必须做 brace 平衡检查和浏览器语法验证。
