# 界面↔前端代码关联 & 异常可追溯

> 录制/回放时每步抓取的"页面身份指纹 + 动作 locator + 接口 path"，是把**真实界面**快速、准确
> 关联到**前端工程代码**的桥，也是**脚本执行异常可追溯**的依据。

## 每步捕获了什么（events.json → steps[]）

```jsonc
{
  "index": 4,
  "label": "点击登录",
  "action": "button '登录'",          // 真实 locator 表达式
  "page": {
    "url":     "http://localhost:8080/#/login",
    "route":   "#/login",             // SPA 路由
    "title":   "采购系统 - 登录",
    "heading": "用户登录"             // 首个 h1/h2
  }
}
```

接口侧（calls[]）每条带 `path`（如 `/api/auth/login`）与归属的 `step` / `stepLabel`。

## 四条桥：从界面定位前端源码

| 抓取项 | grep 目标 | 命中文件 |
|--------|-----------|----------|
| `page.route`（`#/login`） | 路由配置（`router/**`、`routes.*`） | 该路由的页面组件路径 |
| `page.title` / `page.heading` | `.vue` / `.tsx` / `.jsx` 里的字面量 | 渲染该文案的组件 |
| `action`（`button '登录'`） | 按钮文案 / `data-testid` / `aria-label` | 组件内的具体元素 |
| 接口 `path`（`/api/auth/login`） | 前端 api/service 层 URL 字符串 | 接口调用处 → 反查触发组件 |

### 推荐关联顺序（由粗到细）

1. **route → 组件文件**：先用路由把"在哪个页面"钉死（最强信号）。
   ```bash
   # 例：在前端仓搜路由映射
   grep -rn "login" src/router/
   ```
2. **heading/title/action 文案 → 组件内元素**：在第 1 步锁定的组件目录内细化。
   ```bash
   grep -rn "登录" src/views/login/
   ```
3. **接口 path → 调用处**：交叉验证组件确实发起了该接口。
   ```bash
   grep -rn "/api/auth/login" src/
   ```

> 三条信号交叉命中同一组件 = 高置信关联；只命中一条则标注为推断（呼应红线 R2）。

## 异常可追溯：脚本跑挂时怎么定位

回放某步抛错时，无需猜，直接看三处对齐的证据：

1. **events.json**：失败步的 `label` + `action` + `page`（url/route/title）→ 立刻知道"在哪个界面、点哪个元素挂的"。
2. **trace.zip**（`npx playwright show-trace`）：该步的截图 + DOM 快照 + console + network。
3. **按上面四条桥**回到前端源码，定位渲染该元素/该页面的组件，判断是改名、改路由还是接口变更。

建议在 `playwright.config.ts` 开 `screenshot: 'only-on-failure'`，失败截图与 trace 双保险。

## 与产物的关系

- `flow.flow` 的每个 `[界面名]` 节点可在头部补 `@route` / `@component` 提示（见 flow-language-spec）。
- 这些关联**不固化进永久基线**（呼应棕地"活查询、不冻结幻觉"哲学）：events.json 留指纹，
  真正的"界面→组件"映射在需要时即时 grep 当前源码，避免随重构腐烂。
