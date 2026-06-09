---
name: runtime-flow-extractor
description: >
  对既有 Web 系统，用 Playwright codegen 录制真实业务操作 → 原生回放 + trace/HAR 抓取真实网络流量
  → 把"动作↔接口"零歧义归因 → 反推出与真实操作完全一致的业务流程图（Mermaid）+ 简洁流程语言(.flow)，
  每个流程节点标注其真实触发的接口、请求参数与响应结构。补 CodeGraph/GitNexus 静态认知看不到的
  "运行时业务流"一维。当用户表达「录制业务流程并反推流程图」「抓真实接口梳理业务流」「把这条操作链路
  连同接口画出来」「运行时业务流认知」时触发。
---

# Runtime Flow Extractor — 运行时业务流认知

> 本 skill 属 `e2e-test-wf` 域。与静态认知（[arch-baseline](../../architecture-extractor-wf/arch-baseline-skill/SKILL.md) 的 CodeGraph/GitNexus）**互补**：
> 静态层从源码看"系统长什么样"；本 skill 从真实流量看"系统在真实业务操作下怎么跑、各步实际打哪些接口、收发什么"。
> 产物为独立的 `.brownfield/flows/`，可被任意下游消费。

## 触发

用户表达「录制业务流程并反推流程图」「抓真实接口梳理业务流」「把这条操作链路连同接口画出来」
「运行时业务流认知」「这个老系统点一遍把接口和流程整理出来」。

## 前置依赖

- Node + `@playwright/test` + chromium 内核
- **被测 Web 服务已启动**、可访问的 base URL、可用测试账号
- 建议：录制用**测试账号 + 脱敏数据**，从源头降低敏感数据风险

> ⚠️ 环境**只检查、不安装**：进入工序前先按 [`references/capture-commands.md`](references/capture-commands.md) §0 逐项检查；
> 任何缺失（Node/依赖/浏览器内核）一律**停下并提示用户自行处理**，本 skill 绝不擅自 `npm i` / `playwright install`。

## 不变量（核心纪律）

> 全部反模式清单见 [`references/redlines.md`](references/redlines.md)。

1. **真实驱动**：流程与接口一律来自真实回放流量；静态代码只辅助命名/理解，**不得**把代码里的接口当作"本次发生的接口"。
2. **归因靠插桩，不靠时间窗口/解 trace.zip**：回放时声明当前步骤，`response` 落进当前桶——零歧义。trace 仅作视觉审计兜底。详见 [`references/attribution-strategy.md`](references/attribution-strategy.md)。
3. **契约派生自流量，禁杜撰**：`.flow` 每个接口都能在 `events.json` 找到对应项；找不到必删。
4. **推断必标注**：确定类型不标；单样本/枚举不全/可空性靠猜 → `~inferred`；真实值 → `~real`。混淆事实与推断 = 制造可信幻觉。
5. **脱敏先于落盘**：凭据/PII 绝不进产物；HAR 不入库。见 [`references/redaction-rules.md`](references/redaction-rules.md)。
6. **保真第一（可加固不改语义）**：允许把脆弱 selector（nth）升级为 role/label、加滚动/等待以稳回放；
   **禁**改目标元素/顺序、禁用 `goto` 抄近路、**禁把 popup 简化为单页**。真实的重复刷新/新开窗口照实记录。详见 [`references/robustness-playbook.md`](references/robustness-playbook.md)。
7. **图文同源**：`flow.flow` 与 `flow.mmd` 都从同一份 `events.json` 生成，接口集合必须一致。
8. **单样本局限**：录一遍=一条路径，产出是**示例级契约**；覆盖范围须显式标注，多路径需多次录制合并。

## 输入

- 目标棕地 Web 系统（运行中）+ base URL + 测试账号
- 待梳理的业务主线（一句话意图，如"采购需求提交"）

## 输出（目标位置 `.brownfield/flows/<flow-name>/`）

| 文件 | 角色 | 入库 | 模板 |
|------|------|------|------|
| `raw.spec.ts` | codegen 原始录制脚本 | 可选 | — |
| `runner.spec.ts` | 插桩后回放 runner | ✅ | [templates/runner.spec.ts](templates/runner.spec.ts) |
| `capture.ts` | 归因捕获器 | ✅ | [templates/capture.ts](templates/capture.ts) |
| `events.json` | **图文同源唯一事实来源**（脱敏后）；每步含页面身份指纹(route/title/heading)+动作 locator | ✅ | 由 capture.ts 产出 |
| `flow.flow` | **简洁流程语言**：步骤+接口契约 ★ | ✅ | [templates/flow-dsl.flow](templates/flow-dsl.flow) |
| `flow.mmd` | **Mermaid 业务流程图** ★ | ✅ | [templates/flow-mermaid.mmd](templates/flow-mermaid.mmd) |
| `network.har` | 全量流量备份 | ❌ 本地复盘，不入库 | — |
| `trace.zip` | 视觉审计兜底 | ❌ 本地复盘，不入库 | — |

## 工序（五阶段，强制顺序，每阶段一个 Checkpoint）

```
① 录制 → ② 插桩 → ③ 回放抓取 → ④ 解析归因 → ⑤ 综合产出
```

### ① 录制（Record）
人走一遍真实业务主线：`npx playwright codegen <url> -o flows/<flow-name>/raw.spec.ts`。
命令细节见 [`references/capture-commands.md`](references/capture-commands.md)。
**Checkpoint**：raw.spec.ts 生成，确认覆盖了完整业务主线。

### ② 插桩（Instrument）
把 `templates/capture.ts` + `templates/playwright.config.ts` 复制到流程目录；
按 [`references/attribution-strategy.md`](references/attribution-strategy.md) 把 `raw.spec.ts` 转写为 `runner.spec.ts`
——每个动作前插 `await cap.step('语义','<locator>')`，结尾 `cap.dump('events.json')`。
同时按 [`references/robustness-playbook.md`](references/robustness-playbook.md) 加固：**保留 popup（`waitForEvent('popup')`）**、
脆弱 `nth` 升级为 role/label、遮挡字段加 `scrollIntoViewIfNeeded`、动态渲染加等待、不用 `goto` 抄近路。
**Checkpoint**：runner.spec.ts 就绪，步骤语义齐全，popup/选择器已加固。

### ③ 回放抓取（Replay & Capture）
`npx playwright test runner.spec.ts --config=playwright.config.ts`。
产出 `events.json` + `network.har` + `trace.zip`。
**Checkpoint**：回放通过；events.json 有 steps 与 calls。

### ④ 解析归因（Parse & Attribute）
核对 `events.json`：每个 `calls[].step` 指向真实步骤；无 `step:-1` 漏桶；关键接口归属正确。
执行脱敏自检（[`references/redaction-rules.md`](references/redaction-rules.md)），删除/清洗 HAR。
**Checkpoint**：归因正确 + 脱敏通过。

### ⑤ 综合产出（Synthesize）
从 `events.json` 同时生成：
- `flow.flow`：按 [`references/flow-language-spec.md`](references/flow-language-spec.md) 写，每接口标 `~real`/`~inferred`。
- `flow.mmd`：节点=界面/步骤，边标接口，节点 id 对齐 steps[].index。
schema 推断：真实字段定类型，单样本/枚举不全标 `~inferred`。
**Checkpoint**：图文接口集合一致；每接口可追溯到 calls[]。

## 与下游衔接（产物级、零耦合）

只产出独立 `.brownfield/flows/`，不感知下游。可被消费：
- **人/交接**：流程图 + .flow 直读，理解真实业务链路与接口。
- **规约/设计**：作为"现状真实接口契约"输入。
- **界面↔前端代码关联 & 异常追溯**：events.json 的页面指纹 + 动作 locator + 接口 path，按 [`references/code-correlation.md`](references/code-correlation.md) grep 当前源码即时定位组件（不固化映射，避免随重构腐烂）。
- **（可选）与 GitNexus 交叉验证**：把真实接口 path 比对静态 `route_map`，标出"代码有未走到 / 走到但代码图缺"的差异。

## 文件导航

```
runtime-flow-extractor-skill/
├── README.md                       ← 人类导航
├── SKILL.md                        ← 本文件（AI 入口）
├── templates/
│   ├── capture.ts                  ← 归因捕获器（技术核心，复制到流程目录）
│   ├── runner.spec.ts              ← 插桩 runner 示例
│   ├── playwright.config.ts        ← 回放配置（trace + HAR）
│   ├── flow-dsl.flow               ← 简洁流程语言示例 ★
│   └── flow-mermaid.mmd            ← Mermaid 流程图骨架 ★
└── references/
    ├── capture-commands.md         ← codegen/回放/trace 命令速查 + 环境检查
    ├── attribution-strategy.md     ← 动作↔接口归因策略（权威）
    ├── robustness-playbook.md      ← 回放鲁棒性：popup/选择器/滚动/等待（Vue 实战）
    ├── code-correlation.md         ← 界面↔前端代码关联 & 异常可追溯
    ├── flow-language-spec.md       ← 简洁流程语言规格
    ├── redaction-rules.md          ← 脱敏规则
    └── redlines.md                 ← 红线与反模式
```
