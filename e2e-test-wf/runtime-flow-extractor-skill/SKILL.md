---
name: runtime-flow-extractor
description: >
  对既有 Web 系统，用 Playwright codegen 录制一条**完整业务闭环**的真实操作，录制时 --save-har
  同步抓全 /api/ 接口流量 → Python 脚本解析 HAR 出两段式接口清单(摘要+明细) → 以"真实接口 + 录制脚本"
  为种子，grep/find + CodeGraph/GitNexus 顺调用链落锚到前后端代码 → 反推出与真实操作一致、且锚定代码的
  业务流程图(Mermaid) + 简洁流程语言(.flow)。补静态认知看不到的"运行时业务流"一维。当用户表达
  「录制业务流程并反推流程图」「抓真实接口梳理业务流」「把这条操作链路连同接口/代码画出来」
  「运行时业务流认知」时触发。
---

# Runtime Flow Extractor — 运行时业务流认知（record-only）

> 静态层从源码看"系统长什么样"；本 skill 从**真实流量 + 真实操作**看"一条业务闭环怎么跑、各步打哪些接口、锚到哪段代码"。
> **运行时种子修剪静态图** —— 真实 API 是已确证入口，比纯静态重建幻觉更少。产物落 `docs/business-processes/`。

## 触发

「录制业务流程并反推流程图」「抓真实接口梳理业务流」「把这条操作链路连同接口/代码画出来」「运行时业务流认知」。

## 前置依赖

- Node + `@playwright/test` + chromium 内核；Python 3（跑解析脚本）
- CodeGraph + GitNexus **代码知识图谱**索引已建（第 ③ 步代码落锚依赖）
  > GitNexus / CodeGraph 都是**代码图谱工具，与 git 版本控制无关**——名字里的 "Git" 勿混淆。
- **被测 Web 服务已启动**、可访问 URL、可用测试账号；前端/后端工程源码就位

> 上述依赖**不假设成立**，由不变量 0 的[前置确认闸门](references/preflight-check.md)实测确认；不满足则停转人工。
> 环境**只检查、不安装**：缺失一律提示用户自行处理，绝不擅自 `npm i` / `playwright install`。

## 不变量（核心纪律）

> 全部反模式见 [`references/redlines.md`](references/redlines.md)。

0. **前置确认闸门（强制·首步）**：录制前先自检（Node/playwright/chromium/Python + CodeGraph/GitNexus 索引）
   并收集必要输入（前端工程目录、后端工程目录、业务流程名称、录制起始 URL）。任何不满足项**一次性列全、
   转人工确认，绝不反复轮询重检、绝不在残缺前提下继续**。三态 PASS/CONFIRM/BLOCK，协议见
   [`references/preflight-check.md`](references/preflight-check.md)。**仅 PASS / 已确认 CONFIRM 才进入 ①。**
1. **业务闭环为单位**：一次录制 = 一条**完整业务闭环**（如"需求计划填报"含 列表查询/新增/详情/删除）。
   边界**录制前与用户确定**，太碎的子过程体现不了业务价值，太大则失焦。
2. **真实驱动**：流程与接口一律来自真实录制流量；代码只用于落锚/理解，**不得**把代码里的接口当作"本次发生的接口"。
3. **采集即录制**：`--save-har` 在录制阶段抓全 `/api/` 流量；**不回放**（无插桩、无 capture）。
4. **归因靠证据不靠时间戳**：接口归并到界面节点 = HAR 页面边界 + 脚本动作顺序 + 代码语义三证对齐，
   不确定处标 `~inferred`。详见 [`references/code-correlation.md`](references/code-correlation.md)。
5. **契约/落锚派生自真实证据，禁杜撰**：`.flow` 每个接口都能在 TXT 找到；每个 `@backend`/`@component` 有 grep/图谱依据。
6. **推断必标注**：确定→不标；单样本/枚举不全/单信号命中→ `~inferred`；真实值→ `~real`。
7. **脱敏先于落盘**：凭据/PII 绝不进 TXT/flow.flow/flow.mmd；HAR 不入库。见 [`references/redaction-rules.md`](references/redaction-rules.md)。
8. **单样本局限**：录一遍=一条路径，产出是**示例级契约**；覆盖范围须显式标注，多路径多次录制合并。

## 输入

- 目标棕地 Web 系统（运行中）+ URL + 测试账号
- 与用户共同确定的**一条完整业务闭环**及其边界
- 前后端工程源码（落锚用；建议双索引就绪：CodeGraph + GitNexus）

## 输出（标准目录 `{工程根}/docs/business-processes/{业务域}/runtime-flows/`）

| 文件 | 角色 | 入库 |
|------|------|------|
| `{name}_playwright_records.ts` | codegen 录制脚本（真实操作序列） | ✅ |
| `{name}_runtimeflow_api_requests.har` | 录制阶段全量 `/api/` 流量 | ❌ 本地，不入库（敏感） |
| `{name}_runtimeflow_api_requests.txt` | **接口摘要**（种子+时序，默认加载） | ✅ |
| `{name}_runtimeflow_api_details.txt` | **接口明细**（req/resp body，按需加载） | ✅ |
| `{name}.flow` | **简洁流程语言**：界面+接口+代码锚 ★ | ✅ |
| `{name}.mmd` | **Mermaid 业务流程图** ★ | ✅ |
| `flow-code-map.md` | 流程↔代码映射表（界面/接口/组件/handler/域/置信度） | ✅ |

> `{name}` = 业务闭环名（如 `requirement-plan-filing`）；`{业务域}` 与 arch-baseline 域划分对齐。

## 工序（强制顺序，每阶段一个 Checkpoint）

```
⓪ 前置确认闸门  →  ① 录制（含 --save-har）  →  ② 解析 HAR 出接口 TXT  →  ③ 代码落锚 + 反推流程图
```

### ⓪ 前置确认闸门（Preflight，强制·首步）
按 [`references/preflight-check.md`](references/preflight-check.md)：自检环境 + 索引，收集前端/后端工程目录、
业务流程名称 `{name}`、录制起始 URL，并与用户口头确认业务闭环边界。
- **Checkpoint**：三态裁决。BLOCK/CONFIRM → 输出**完整待确认清单**转人工，**停止不轮询**；仅 PASS/已确认 CONFIRM 进入 ①。

### ① 录制（Record，含同步抓包）
- **先与用户确定业务闭环边界**（不变量 1），再录。
- **录前侦察 glob**：先看几条真实流量确认 API 路径前缀，`--save-har-glob` 若与 `/api/` 不符须调整，
  否则会**静默丢请求**。
- 录制（标准目录前缀 `{工程根}/docs/business-processes/{业务域}/runtime-flows/`）：
  ```
  npx playwright codegen <URL> \
    -o   {前缀}/{name}_playwright_records.ts \
    --save-har={前缀}/{name}_runtimeflow_api_requests.har \
    --save-har-glob='**/api/**'
  ```
  命令细节见 [`references/capture-commands.md`](references/capture-commands.md)。走完整闭环、避免无关点击（无回放兜底，录什么=分析什么）。
- **Checkpoint**：脚本 + HAR 生成，确认覆盖完整闭环（漏则重录）。

### ② 解析 HAR 出接口 TXT（Parse）
```
python scripts/parse_har.py {前缀}/{name}_runtimeflow_api_requests.har
```
产出两段式 `*_api_requests.txt`(摘要) + `*_api_details.txt`(明细)。解析时已脱敏。
- **Checkpoint**：摘要接口数合理、种子清单可读；执行脱敏自检（[`references/redaction-rules.md`](references/redaction-rules.md)），删/清洗 HAR。

### ③ 代码落锚 + 反推流程图（Correlate & Synthesize）
按 [`references/code-correlation.md`](references/code-correlation.md)：
- **先探查索引能力和实际情况，再自适应选策略**：route 节点/route_map 可用→后端 path 直查优先；前端动态路由→grep+component 辅助。
- **多仓 targeting**：每次查询带 `projectPath`(CodeGraph)/`repo`(GitNexus)，前端查前端索引、后端查后端索引。
- **接口↔界面归并**：用 HAR 页面边界 + 脚本动作顺序 + 代码语义，把接口归并到各界面节点。
- **落锚**：接口 path → route_map/route 节点(或 grep 兜底) 定 handler → CodeGraph 顺链 + 查漏间接触达；
  脚本 locator/route/api → grep + component 节点定前端组件；业务域默认 GitNexus（或采用外部输入的域图）。
- **产出**：`{name}.flow`（按 [`references/flow-language-spec.md`](references/flow-language-spec.md)，标 `~real`/`~inferred` + `@route/@component/@backend`）
  + `{name}.mmd`（同源） + `flow-code-map.md`。
- **Checkpoint**：图文接口集合一致；每接口可追溯到 TXT；每代码锚有 grep/图谱依据。

## 与下游衔接（产物级、零耦合）

只产出独立 `docs/business-processes/`，不感知下游。可被消费：
- **人/交接**：流程图 + .flow + 映射表，直读真实业务链路、接口与代码锚点。
- **规约/设计**：作为"现状真实接口契约 + 流程"输入。
- **影响分析**：流程↔代码映射 + CodeGraph impact 联动。

## 文件导航

```
runtime-flow-extractor-skill/
├── README.md                       ← 人类导航
├── SKILL.md                        ← 本文件（AI 入口）
├── scripts/
│   └── parse_har.py                ← HAR → 两段式接口 TXT（脱敏 + 种子 + 时序）
├── templates/
│   ├── flow-dsl.flow               ← 简洁流程语言示例 ★
│   └── flow-mermaid.mmd            ← Mermaid 流程图骨架 ★
└── references/
    ├── preflight-check.md          ← 前置确认闸门（强制·首步，三态裁决）★
    ├── capture-commands.md         ← 环境检查 + 录制(codegen --save-har) + 解析命令
    ├── code-correlation.md         ← 代码落锚法（种子→扩展→归属）★ 第③步权威
    ├── flow-language-spec.md       ← 简洁流程语言规格
    ├── redaction-rules.md          ← 脱敏规则
    └── redlines.md                 ← 红线与反模式
```
