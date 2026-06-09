# Runtime Flow Extractor Skill — 运行时业务流认知

> 录制真实 UI 操作 + 抓真实网络流量 → 反推与真实操作完全一致的**业务流程图 + 接口契约**。

## 这是什么

对既有 Web 系统，让人用 Playwright codegen 走一遍真实业务主线，回放时抓取真实流量，
把"每一步操作触发了哪些接口、收发什么数据"零歧义地对应起来，最终产出：

- **`flow.mmd`** —— Mermaid 业务流程图（节点=界面/操作，边=接口）
- **`flow.flow`** —— 简洁流程语言：一行一接口，连同请求参数/响应结构与可信度标注

## 在认知体系中的位置

| 认知层 | 数据来源 | 工具 | 产物 |
|--------|----------|------|------|
| 静态认知 | 源码 | CodeGraph / GitNexus | 调用链、业务域、静态路由契约 |
| **运行时认知（本 skill）** | **真实 UI 操作 + 真实流量** | Playwright codegen + trace/HAR | **业务流程图 + 真实接口契约** |

补上静态工具看不到的"系统在真实业务操作下怎么跑"这一维。

## 管线全景

```
① codegen 录制 ──► raw.spec.ts（线性动作）
② 插桩       ──► runner.spec.ts（每动作前 cap.step 边界）
③ 回放抓取   ──► events.json（图文同源） + network.har + trace.zip
④ 解析归因   ──► 核对归因 + 脱敏
⑤ 综合       ──► flow.flow ★  +  flow.mmd ★
```

技术核心是 [`templates/capture.ts`](templates/capture.ts)：回放时声明当前步骤，
`response` 落进当前桶——比事后解 trace.zip 二进制更稳的归因方式。

## 快速上手

```bash
# 0. 环境检查（只检查，缺失则提示用户自行处理，严禁随意安装）
node -v
npm ls @playwright/test
# Windows: 检查 chromium 是否已下载
if exist "%USERPROFILE%\AppData\Local\ms-playwright\chromium-*" (echo ✅ chromium 就绪) else (echo ❌ chromium 缺失)

# 1. 录制（人走一遍真实业务流）
npx playwright codegen http://localhost:8080 -o flows/采购需求提交/raw.spec.ts

# 2. 复制 capture.ts + playwright.config.ts 到 flows/采购需求提交/，
#    按 references/attribution-strategy.md 把 raw.spec.ts 插桩成 runner.spec.ts

# 3. 回放抓取
npx playwright test runner.spec.ts --config=playwright.config.ts

# 4. 核对 events.json + 脱敏（删 HAR）

# 5. 从 events.json 生成 flow.flow 与 flow.mmd
```

## 触发方式

自然语言："录制 XX 业务流程并反推流程图"、"抓真实接口梳理这条操作链路"、"运行时业务流认知"。

## 红线（详见 references/redlines.md）

- 契约**派生自真实流量，禁杜撰**；推断必标 `~inferred`，真实值标 `~real`。
- **脱敏先于落盘**；HAR/trace 不入库。
- **保真第一**：不"优化"真实操作序列。
- **图文同源**：flow.flow 与 flow.mmd 都从 events.json 生成。

## 目录

```
runtime-flow-extractor-skill/
├── SKILL.md          ← AI 入口
├── README.md         ← 本文件
├── templates/        ← capture.ts / runner / config / .flow / .mmd
└── references/       ← 命令速查 / 归因策略 / 鲁棒性playbook / 代码关联 / 流程语言规格 / 脱敏 / 红线
```
