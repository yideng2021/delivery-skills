# Playwright 运行时业务操作流信息采集方案

> 文档定位：说明如何通过 `custom-recorder.js` + Inspector 录制操作流，并将 HAR 转换为可阅读的接口文本，供架构分析与追溯使用。

---

## 一、整体方案概览

```
node custom-recorder.js
       │
       ├── [录制中] 监听 NAV 事件 + API 请求时序（内存结构化存储）
       │
       ├── [录制中] Inspector Record 同步生成操作脚本（手动保存）
       │
       └── [录制结束] 自动执行 remapUrls()，修正 URL 归属后写文件
                │
                ├── *_runtimeflow_api_requests.har   → parse_har.py
                │                                          │
                │                                          ├── *_api_requests.txt（接口摘要）
                │                                          └── *_api_details.txt（接口明细）
                │
                └── *_session_log.txt（页面导航 + API 时序，URL 归属已修正）
```

操作脚本（`*_playwright_records.ts`）由 Inspector 录制，手动另存为独立文件。

---

## 二、custom-recorder.js 增强设计

### 核心机制

**多标签页自动跟踪**

`context.on('page', newPage => registerListeners(newPage, label))`

初始页面之外，所有 popup / 新标签页自动注册监听，统一用 `page0`、`page1`… 标注归属。

**SPA 路由完整捕获**

硬导航（`framenavigated`）+ 注入 JS 拦截四类 SPA 路由事件（`hashchange`、`pushState`、`replaceState`、`popstate`），通过 `console.debug` 上报给 Node 侧。确保 SPA 应用内部的每次页面切换均被记录。

**API 请求时序采集**

`requestfinished` 事件中读取 `request.timing().startTime`，以第一条 API 请求为零点（`t0`）计算相对偏移：

```
[REQ] +12.3s POST /api/schemeRequirement/addOrUpdate (312ms) @ https://…/workbench/index [page1]
```

超过 1000ms 的请求自动标注 `⚠️[SLOW]`。

**URL 归属竞态修正（remapUrls）**

`request.frame().url()` 在请求发出瞬间快照，导航异步时可能快照到旧 URL（中间态）。

录制结束后，在内存中执行 `remapUrls()`：

- 按 page label 分组，用 navEvents 构建时间轴
- 对每条 REQ，找 `nav.ts ≤ req.ts` 的最后一条 NAV URL，原地覆盖 `frameUrl`
- 10ms 内同时刻去重（hard nav + spa:replace 同时触发场景）

写入 `session_log.txt` 时已是修正后结果，无需后处理脚本。

### 产物格式（session_log.txt）

```
# 录制起始: 2026-06-11T04:10:00.000Z
# 录制结束: 2026-06-11T04:18:31.000Z

# ── 页面导航序列 ──
[NAV:full]      2026-06-11T04:10:05Z [page0] -> https://cas.…/login.html
[NAV:full]      2026-06-11T04:10:42Z [page1] -> https://req.…/workbench/index
[NAV:spa:push]  2026-06-11T04:11:03Z [page1] -> https://req.…/workbench/requirement/plan

# ── API 请求时序（URL 归属已修正）──
[REQ] +0.0s   GET  /api/user/info             (45ms)  @ https://req.…/workbench/index          [page1]
[REQ] +7.6s   GET  /api/requirement/plan/list (238ms) @ https://req.…/workbench/requirement/plan [page1]
[REQ] +12.3s  POST /api/schemeRequirement/add (312ms) @ https://req.…/workbench/requirement/plan [page1]
```

---

## 三、录制操作流程

**前置条件：** 在 `custom-recorder/` 目录下已安装依赖（`npm install`）。

**Step 1 — 启动录制**

```bash
cd 01-设计过程/03-testing/custom-recorder
node custom-recorder.js ./runtime-flows/my-flow
```

浏览器和 Inspector 面板自动弹出。

**Step 2 — 开始录制操作脚本**

Inspector 面板左下角点击红色圆点 **Record**，开始录制用户操作。

**Step 3 — 执行业务操作**

正常操作业务流程（登录、导航、表单填写、提交等）。Inspector 左侧代码区实时生成 TypeScript 操作语句。

**Step 4 — 保存操作脚本**

操作结束后，在 Inspector 左侧代码区**全选复制**，粘贴保存为：

```
runtime-flows/my-flow_playwright_records.ts
```

**Step 5 — 结束录制**

点击 Inspector 的 **Resume** 按钮。`custom-recorder.js` 自动执行 `remapUrls()` 并写入产物：

```
runtime-flows/my-flow_runtimeflow_api_requests.har
runtime-flows/my-flow_session_log.txt
```

---

## 四、HAR 转接口文本

基于录制产出的 HAR，使用 `parse_har.py` 转换为可阅读的两段式 TXT：

```bash
python delivery-skills/e2e-test-wf/runtime-flow-extractor-skill/scripts/parse_har.py \
  runtime-flows/my-flow_runtimeflow_api_requests.har
```

**输出产物：**

| 文件 | 内容 | 用途 |
|------|------|------|
| `*_api_requests.txt` | 接口种子（去重）+ 时序清单（idx / status / method / path） | 默认加载，掌握流程骨架 |
| `*_api_details.txt` | 每条接口的 req/resp body（脱敏 + 截断） | 按序号按需查阅 |

摘要示例：

```
## 接口种子（去重，供 grep 后端定位）
GET    /api/user/info
GET    /api/requirement/plan/list
POST   /api/schemeRequirement/addOrUpdate

## 时序清单
1. [200] GET    /api/user/info
2. [200] GET    /api/requirement/plan/list
3. [200] POST   /api/schemeRequirement/addOrUpdate
```

---

## 五、完整产物清单

| 文件 | 来源 | 用途 |
|------|------|------|
| `*_playwright_records.ts` | Inspector 录制（手动保存） | 操作步骤追溯，可复现回放 |
| `*_runtimeflow_api_requests.har` | custom-recorder 自动生成 | 原始流量包（不入库） |
| `*_session_log.txt` | custom-recorder 自动生成 | 页面导航序列 + API 时序 + URL 归属 |
| `*_api_requests.txt` | parse_har.py 解析 | 接口摘要，默认加载 |
| `*_api_details.txt` | parse_har.py 解析 | 接口明细，按需查阅 |