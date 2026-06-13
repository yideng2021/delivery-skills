# 增强录制器设计（custom-recorder.js）

> 替代 `npx playwright codegen` 的采集核心。**与被测前端工程完全无关**，只依赖
> Node + `@playwright/test` + chromium。源码见 [`../scripts/custom-recorder.js`](../scripts/custom-recorder.js)。

## 为什么不用裸 codegen

裸 codegen 只生成操作脚本 + 可选 HAR，但**丢失**：多标签页归属、SPA 路由序列、API 时序、
以及导航竞态导致的 **URL 归属错误**。本录制器在录制阶段把这些一并采集并修正。

## 五大机制

### 1. 多标签页自动跟踪
`context.on('page', newPage => registerListeners(newPage, label))`：初始页 `page0` 之外，
所有 popup / 新标签页自动注册监听，统一以 `page0`/`page1`… 标注归属。门户→子系统常开新窗口，靠此不漏。

### 2. SPA 路由完整捕获
硬导航走 `framenavigated`；SPA 走**注入 JS** 拦截四类事件（`hashchange` / `pushState` /
`replaceState` / `popstate`），经 `console.debug('__PW_NAV__ ...')` 上报 Node 侧。
确保 SPA 内部每次页面切换都记录。
> 标记：`[NAV:full]` 硬导航 / `[NAV:spa:hash|push|replace|pop]` SPA 路由。

### 3. API 请求时序采集
`requestfinished` 读 `request.timing().startTime`，以第一条 API 为零点 `t0` 算相对偏移；
`responseEnd - requestStart` 为耗时；**>1000ms 自动标 `⚠️[SLOW]`**。
```
[REQ] +12.3s POST /api/schemeRequirement/add (312ms) @ https://…/requirement/plan [page1]
```

### 4. URL 归属竞态修正（remapUrls，核心创新）
`request.frame().url()` 在请求发出瞬间快照，导航异步时可能快照到**旧 URL（中间态）**。
录制结束后 `remapUrls()` 在内存修正：
- 按 page label 分组，用 navEvents 构建时间轴；
- 对每条 REQ，取 `nav.ts ≤ req.ts` 的**最后一条** NAV URL，原地覆盖 `frameUrl`；
- 10ms 内同时刻去重（hard nav + spa:replace 同触发场景）；
- `req.ts <` 第一条 NAV → 归属第一条 NAV（登录初始化请求）。

写入 session_log 时已是修正后结果，**无需后处理脚本**。

### 5. 全量流量入 HAR
`context.recordHar({ path, urlFilter: '**/api/**' })`：只收 `/api/**`，供 `parse_har.py` 出 req/resp 明细。

## 产物格式（session_log.txt）

```
# 录制会话增强日志
# 录制起始: 2026-06-11T04:10:00Z
# 录制结束: 2026-06-11T04:18:31Z

# ── 页面导航序列 ──
[NAV:full]      2026-06-11T04:10:05Z [page0] -> https://cas.…/login.html
[NAV:full]      2026-06-11T04:10:42Z [page1] -> https://req.…/workbench/index
[NAV:spa:push]  2026-06-11T04:11:03Z [page1] -> https://req.…/requirement/plan

# ── API 请求时序（URL 归属已修正）──
[REQ] +0.0s   GET  /api/user/info             (45ms)  @ https://req.…/workbench/index   [page1]
[REQ] +7.6s   GET  /api/requirement/plan/list (238ms) @ https://req.…/requirement/plan  [page1]
[REQ] +12.3s  POST /api/schemeRequirement/add (312ms) @ https://req.…/requirement/plan  [page1]
```

样例见 [`../templates/session_log.sample.txt`](../templates/session_log.sample.txt)。

## 已知限制（治理时须知）

- **iframe 内请求**：`request.frame().url()` 返回 iframe 的 src，归属 URL 显示为 iframe 地址（预期行为）。
- **SPA 注入时机**：若页面在监听注册前已加载完成（如 `goto` 直开），**首次** hash 变化可能丢失；后续路由正常。
- **records.ts 仍靠 Inspector**：录制器不自动生成操作脚本，由 `page.pause()` 弹出的 Inspector Record 生成、手动保存。
