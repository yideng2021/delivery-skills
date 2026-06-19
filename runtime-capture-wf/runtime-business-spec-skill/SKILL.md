---
name: runtime-business-spec
description: >
  运行时业务流程与规则说明 skill（业务语义层 · 终端业务产物）。消费 runtime-ui-collab 已确认的界面事实文档
  （docs/prd/{name}/，status=confirmed）+ runtime-flow-mapper 的 flow-map 代码锚，深探后端 Service 层抽业务
  校验/计算/状态规则，按 nav_context 串成端到端流程，并把全部技术证据翻成纯业务语言，产出一份业务人员可读的
  「{name}_业务流程说明.md」（业务概述 + 端到端流程 + 各环节业务规则 + 数据流转 + 角色权限）。借 INV 纪律写精确规则、
  以〔已核实〕/〔待核实〕表确信度，零技术术语。替代 runtime-spec-mapper；只翻译/串流程/补规则，不采集、不落锚、
  不改上游产物。当用户要求「梳理运行时业务流程与规则」「出业务可读的现状流程说明」「把界面文档串成业务流程」时触发。
---

# Runtime Business Spec — 运行时业务流程与规则说明

> **定位**：认知管线的**业务语义层 / 终端业务产物**。上游 `runtime-ui-collab`（人工确认界面事实）→ **本 skill（串流程 + 深探规则 + 翻成纯业务语言）**。
> 单一职责：**把已确认的界面事实串成端到端业务流程、补上业务规则、翻成业务人员可读的现状说明**——不采集、不落锚、不改上游产物。
> **替代** `runtime-spec-mapper`（深探职责接管至此，唯一规则源，无双事实源）。

## 术语表（先对齐黑话）

| 术语 | 含义 |
|------|------|
| **串流程** | 按 ui-collab 各文档 `nav_context` 把界面串成端到端业务流程（ui-collab 故意不做的跨界面串联）。 |
| **深探提规则** | 沿 flow-map 代码锚深入 Service 层抽校验/计算/状态规则（ui-collab 故意不下 Service 抽规则）。到 Service 止，不下 DAO。 |
| **INV 纪律** | 业务规则写成「精确、可判定」的一句约束（如"金额必须>0""审批通过后不可再改"），借自 spec L0-L2 的 INV——但**不带技术编号**。 |
| **确信度词** | 业务化置信：〔已核实〕=代码确证/人工已确认；〔待核实〕=单样本/推断/未覆盖/未梳理。替代 `[码]`/`~inferred` 等技术标注。 |
| **零技术术语** | 正文无接口路径、代码路径、类名、字段名、标注黑话——纯业务语言。 |
| **现状 ≠ 规范** | 只述系统「当前这样跑」，不评判「应该怎样」。 |

## 触发

「梳理运行时业务流程与规则」「出一份业务可读的现状流程说明」「把界面文档串成业务流程」。

## 前置依赖

- 上游 `runtime-ui-collab` 已产出 `docs/prd/{name}/*.md`（至少部分 **status=confirmed**）
- 上游 `runtime-flow-mapper` 已产出 `docs/runtime-flow/{name}/{name}_flow-map.md`
- 前端工程 + 后端工程目录；CodeGraph + GitNexus 索引（前后端两仓，深探用）

> 依赖**不假设成立**，由不变量 0 的[前置闸门](references/preflight-check.md)实测；缺则**中断 + 提示先跑上游**。

## 不变量（核心纪律）

0. **前置闸门（强制·首步）**：查 flow-map + ui-collab confirmed 文档 + 工程/索引就位；缺则**中断**，绝不臆造。见 [`references/preflight-check.md`](references/preflight-check.md)。
1. **零技术术语**：正文无接口/代码路径、类名、字段名、标注黑话——纯业务语言。违禁清单见 [`references/business-doc-spec.md`](references/business-doc-spec.md)。
2. **规则源自深探、确信度业务化**：规则从 Service/校验深探而来（不造规则），按 INV 纪律写精确约束，带〔已核实〕/〔待核实〕。
3. **串流程依 `nav_context`**：跨界面流程严格按 ui-collab 衔接契约串，不臆造跳转。
4. **冲突优先级**：界面/操作事实以 ui-collab **人工确认为最高**；规则细节以**代码深探**为准；冲突时人工确认优先。
5. **现状 ≠ 规范**：只述当前，不评判应当；疑似防御兜底/遗留逻辑标〔待核实〕，不当规则断言。
6. **深探有界**：到 Service + 校验 + 状态机即止，**不下 DAO/SQL**。见 [`references/code-deepdive.md`](references/code-deepdive.md)。
7. **不越界 / 禁杜撰**：不采集、不落锚、不改上游产物；只翻译 + 串流程 + 补规则。

## 输入（三层，全复用不新增采集）

| 层 | 来源 | 用途 |
|----|------|------|
| **界面事实（已确认）** | `docs/prd/{name}/*.md`（**confirmed**） | 界面业务事实 + `nav_context` 串流程 + 五维上下文 |
| **流程骨架 + 代码锚** | `docs/runtime-flow/{name}/{name}_flow-map.md` | 端到端结构 + 定位 Service 入口 |
| **规则源** | 工程代码 + 索引 | 深探 Service 抽规则 |

> 不直读 capture 原始证据（界面事实 ui-collab 已确认）；ui-collab 中 `skipped`/未梳理界面标〔待核实·未梳理〕，不假装完整。

## 输出

主产物 **`docs/business-flow/{name}/{name}_业务流程说明.md`**（单份端到端文档）。结构、确信度词、零术语红线与自校验见 [`references/business-doc-spec.md`](references/business-doc-spec.md)，套用 [`templates/business-flow.md`](templates/business-flow.md)。

## 工序（强制顺序，每阶段一个 Checkpoint）

```
⓪ 前置闸门  →  ① 串流程（端到端）  →  ② 深探提规则  →  ③ 翻译产出  →  自校验
```

### ⓪ 前置闸门（Preflight）
按 [`references/preflight-check.md`](references/preflight-check.md) 查 flow-map + ui-collab confirmed 文档 + 工程/索引。
- **Checkpoint**：confirmed 界面文档存在；skipped/缺失界面已列为待核实项。

### ① 串流程（端到端）
按各 ui-collab 文档 `nav_context` 串成端到端流程，识别「角色 + 环节」时序，画**纯业务节点** Mermaid（无接口/无路径）。
- **Checkpoint**：流程闭环；节点为业务动作（非技术事件）；未梳理界面已显式标注。

### ② 深探提规则（核心增值）
按 [`references/code-deepdive.md`](references/code-deepdive.md) 沿 flow-map 代码锚深探 Service（主逻辑/DTO 实体/枚举状态机/前端校验），逐环节抽规则、按 INV 纪律落成精确约束。**到 Service 止，不下 DAO。**
- **Checkpoint**：每环节规则可回指代码（内部记忆，不入正文）；代码确证 vs 单样本分归〔已核实〕/〔待核实〕。

### ③ 翻译产出
技术证据 → 纯业务语言，套用模板写入 `docs/business-flow/{name}/{name}_业务流程说明.md`。
- **Checkpoint**：正文零技术术语；每条规则带确信度词；数据流转/角色权限齐。

### 自校验
按 [`references/business-doc-spec.md`](references/business-doc-spec.md) 校验：零术语扫描通过；每环节有规则 + 产出数据；未梳理项已标〔待核实·未梳理〕。

## 与上下游衔接（产物级、零耦合）

- **上游**：消费 ui-collab confirmed 文档（界面事实 + nav_context）+ flow-map（骨架/代码锚）+ 代码（深探）。
- **下游**：终端业务产物，供业务人员阅读 / 评审；无强制下游。
- **替代关系**：接管 `runtime-spec-mapper` 的深探职责；spec-mapper 退役（其 L0-L2 规约无下游消费者）。

## 文件导航

```
runtime-business-spec-skill/
├── SKILL.md / README.md
├── references/
│   ├── preflight-check.md     ← 前置闸门（查 flow-map + ui-collab confirmed + 工程/索引）
│   ├── code-deepdive.md       ← 深探法（Service 抽规则，到 Service 止）+ INV 纪律
│   └── business-doc-spec.md   ← 产物规格（结构 + 零术语红线 + 确信度词 + 自校验）
└── templates/
    └── business-flow.md       ← {name}_业务流程说明.md 骨架
```
