# Inspector 录制五步法

> 工序 ② 的逐步操作。前提：⓪ 输入已确认、① `setup.mjs` 已把 `runtime_environment/` 备好。

## 环境准备（工序 ①，自动·一次性）

```bash
node 01-设计过程/03-testing/runtime-capture-skill/scripts/setup.mjs {工作目录}
# 自动：建 runtime_environment/、复制脚本、缺 node_modules 则 npm install（幂等）
# 只检查 chromium：缺则按其打印的命令手动装一次（npx playwright install chromium）
```
之后录制/解析都在 `{工作目录}/runtime_environment/` 下进行，产物落 `{工作目录}/{name}/`。

## Step 1 — 启动录制

```bash
cd {工作目录}/runtime_environment
node custom-recorder.js ../{name}/{name}
# 示例
node custom-recorder.js ../requirement-plan-filing/requirement-plan-filing
```
自动弹出 Chromium 窗口 + Playwright Inspector 面板（产物目录会自动创建）。

## Step 2 — 开始录制操作脚本
Inspector 面板左下角点红色圆点 **Record**，开始录制用户操作。

## Step 3 — 执行业务操作（一条完整闭环）
正常走完业务流程：登录 → 导航 → 列表 → 新增/详情/删除 → 提交…
包含**跨标签页跳转**、**SPA 路由切换**。Inspector 左侧实时生成 TypeScript 操作语句。
> 纪律：走**完整闭环**、避免无关点击；中途不抄近路（不手动改地址栏跳过真实导航）。

## Step 4 — 保存操作脚本
操作结束后，在 Inspector 左侧代码区**全选复制**，保存为：
```
{工作目录}/{name}/{name}_playwright_records.ts
```

## Step 5 — 结束录制
点击 Inspector 的 **Resume**。录制器自动执行 `remapUrls()` 并写出：
```
{工作目录}/{name}/{name}_runtimeflow_api_requests.har
{工作目录}/{name}/{name}_session_log.txt
```
终端打印：导航事件数、API 请求数、URL 修正条数。

## 完成自检（进入 ② 前）

- [ ] 三件产物齐全：`*_playwright_records.ts` / `*_runtimeflow_api_requests.har` / `*_session_log.txt`
- [ ] session_log 的 NAV 覆盖了闭环各界面、REQ 数与操作量相称
- [ ] 关注 `⚠️[SLOW]` 接口（>1000ms），记录备查
- [ ] 漏录/录歪 → **重录**（无回放兜底，录什么=分析什么）

## 常见问题

| 现象 | 处理 |
|------|------|
| Inspector 没弹出 Record | 确认浏览器有头模式启动；面板左下角红点即 Record |
| 新标签页接口没采到 | 录制器已 context 级监听 popup；确认终端有"检测到新标签页"日志 |
| 首次 hash 路由丢失 | 已知限制（注入时机）；如关键，改从上一级页面点进，别 goto 直开 |
| HAR 为空 | 接口非 `/api/**` 前缀 → 改 `custom-recorder.js` 的 `urlFilter` 后重录 |
