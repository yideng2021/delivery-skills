---
name: runtime-spec-mapper
description: >
  运行时现状业务规约生成 skill（规约层）。消费 runtime-flow-mapper 产出的 flow-map.md 作骨架，
  以前后端代码为第一依据沿落锚点深探（handler→Service→DTO/枚举/前端校验），梳理出一份「现状(as-is)
  业务规约」——借用 spec specs.md 的 L0–L2 业务语言结构（上下文依赖 + 用户故事 + 业务实体与规则），
  描述系统当前实际怎么运转。产物为非规范参考件，不做变更驱动、不造需求、不生成测试。当用户要求
  「把运行业务地图梳理成业务规约」「从 flow-map 生成现状 spec」「逆向现状业务文档」时触发。
---

# Runtime Spec Mapper — 运行时现状业务规约

> **定位**：认知管线的**规约层**。上游 `runtime-flow-mapper`（落锚→flow-map）→ **本 skill（深探→现状规约）**。
> 单一职责：**以代码为第一依据，把 flow-map 升级为业务级的现状(as-is)规约文档**，不碰采集、落锚、测试生成。
> **现状 ≠ 规范**：只陈述系统「当前这样做」，不评判「应该怎么做」——规范判断留给人与 proposal/spec 流程。

## 术语表（先对齐黑话）

| 术语 | 含义 |
|------|------|
| **现状规约 (as-is spec)** | 本 skill 主产物：描述系统**当前实际**业务行为的文档，借 L0–L2 结构，**非规范、非变更驱动**。 |
| **代码第一依据** | 业务规则/实体以**代码直读**为权威；flow-map 运行时证据作旁证。代码是"系统现在做什么"的 ground truth。 |
| **代码深探 (deepdive)** | 沿 flow-map 落锚的 handler 往下读 Service 主逻辑、DTO/VO、枚举、前端校验，抽取实体·规则·完整状态机。核心增值。 |
| **L0 / L1 / L2** | 借自 spec specs.md 的业务描述层级：L0 业务上下文+依赖、L1 用户故事、L2 业务实体+规则(INV)+业务流转。**只取这三层**。 |
| **INV (业务规则)** | 一条永真的业务约束（如"金额必须>0"）。本 skill 从代码校验抽取，陈述为**现状事实**，不升格为"应当"。 |
| **溯源 (provenance)** | 每条规约项必带的锚：代码位置（`类.方法` / `文件:行`）或 flow-map 节点。无溯源不得写入。 |
| **来源标 `[码]`/`[runtime]`** | `[码]`=代码直读确认；`[runtime]`=仅运行时见到、代码未深入；两者皆有=强确证。 |
| **`~inferred`** | 跨证据的推断（未覆盖分支、意图推测、业务语言翻译不确定、疑似防御兜底/遗留逻辑）。 |
| **flow-map** | 上游 runtime-flow-mapper 产物，含节点清单 + 三证对齐表 + 状态流转 + 外部系统，是本 skill 的骨架与代码锚。 |

## 触发

「把运行业务地图梳理成业务规约」「从 flow-map 生成现状 spec」「逆向现状业务文档」「运行时业务规约」。

## 前置依赖

- 上游 `runtime-flow-mapper` 已产出 `docs/runtime-flow/{name}/{name}_flow-map.md`
- 前端工程 + 后端工程目录；CodeGraph + GitNexus 代码图谱索引（前后端两仓）

> 依赖**不假设成立**，由不变量 0 的[前置闸门](references/preflight-check.md)实测；缺 flow-map 则**中断 + 提示先跑 runtime-flow-mapper**。

## 不变量（核心纪律）

0. **前置闸门（强制·首步）**：检查 flow-map.md 是否就位 + 工程/索引齐备；缺则**中断 + 提示先跑 runtime-flow-mapper**，**绝不臆造数据**。见 [`references/preflight-check.md`](references/preflight-check.md)。
1. **代码第一、强制溯源**：每条 US/实体/规则以代码直读为准、flow-map 作旁证；每项必带溯源锚（`类.方法`/`文件:行` 或 flow-map 节点），无锚不写。
2. **现状≠规范**：只陈述系统「当前强制 X」的**现状事实**，不擅自升格为"应当"。疑似防御兜底/遗留逻辑标 `~inferred`，不当业务规则断言。
3. **推断必标注**：未覆盖分支、意图推测、语言翻译不确定一律标 `~inferred`，与代码确证（`[码]`）严格区分。
4. **业务语言纯净**：正文从代码"翻译"为业务语言，技术术语（字段名/枚举值/类名）只许进溯源注，不进正文。违禁词见 [`references/spec-doc-spec.md`](references/spec-doc-spec.md)。
5. **不越界**：不采集、不落锚（上游的事）、不写变更 spec（不造 change_mode/AUTH-id/增量标注）、不生成测试。只深探出现状规约。
6. **深探有界**：到 Service+DTO+枚举+前端校验即止，**不下 DAO/SQL**（见 [`references/code-deepdive.md`](references/code-deepdive.md)）。

## 输入

- **业务流程名** `{name}`（定位 `docs/runtime-flow/{name}/{name}_flow-map.md`）
- 前端工程目录、后端工程目录
- CodeGraph + GitNexus 索引（前后端两仓）

## 输出

主产物 **`docs/runtime-spec/{name}/{name}_spec.md`**（当前根目录下、工作区内）。
顶部强制声明 `> 现状(as-is)业务规约 · 非规范性 · 仅供参考`。
结构与校验见 [`references/spec-doc-spec.md`](references/spec-doc-spec.md)，套用 [`templates/runtime-spec.md`](templates/runtime-spec.md)。

## 工序（强制顺序，每阶段一个 Checkpoint）

```
⓪ 前置闸门  →  ① 业务上下文(L0)  →  ② 代码深探  →  ③ 规约梳理(L1+L2)  →  ④ 产出+自校验
```

### ⓪ 前置闸门（Preflight）
按 [`references/preflight-check.md`](references/preflight-check.md)：查 flow-map.md 就位 + 工程/索引齐备。
- **Checkpoint**：齐全 → 进入 ①；缺 flow-map → 中断提示，不继续。

### ① 业务上下文（L0）
读 flow-map 的业务简介 + 节点清单 + 外部系统，提炼**业务目标 / 关键场景 / 依赖业务能力（上下文依赖）/ 关键术语**。
- **Checkpoint**：L0 四项就位；依赖能力含外部系统；术语用业务语言。

### ② 代码深探（Deepdive，核心增值）
沿 flow-map 落锚的 handler，按 [`references/code-deepdive.md`](references/code-deepdive.md) 深入：`codegraph_explore/callees` → Service 主逻辑、DTO/VO（取实体属性）、枚举/常量（取**完整**状态机）、前端校验（取字段约束）。**到此为止，不下 DAO/SQL。**
- **Checkpoint**：每个核心节点的实体·规则·状态机候选已抽取，逐项带代码位置；运行时未覆盖、仅代码可见的标 `[码]`。

### ③ 规约梳理（L1 + L2）
节点 → 用户故事（作为角色，我希望…以便…）；深探结果 → 业务实体 + 业务规则(INV) + 业务流转。每项带溯源 + 来源标 + `~inferred`（如需）。
- **Checkpoint**：US 覆盖核心节点；实体属性/INV/状态机来自代码且可溯源；推断已标；业务语言纯净。

### ④ 产出 + 自校验（Map）
套用模板产出至 `docs/runtime-spec/{name}/{name}_spec.md`，按 [`references/spec-doc-spec.md`](references/spec-doc-spec.md) 校验清单自检。
**写入**：落到工作区内 `docs/runtime-spec/{name}/`（目录不存在则建），`write_file` 直写。
- **Checkpoint**：每项可溯源；现状/推断标注无混淆；业务语言纯净；顶部含非规范声明。

## 与上下游衔接（产物级、零耦合）

- **上游**：消费 `runtime-flow-mapper` 的 flow-map.md（节点 + 代码锚 + 状态流转）。
- **下游（被动引用，不强耦合）**：brownfield 场景下可作 `spec_wf` 中 proposal §0「既有资产」/ `reference_specs` 的输入素材。**本产物是参考件，不进 spec_wf 的 validate.mjs 主校验。**

## 文件导航

```
runtime-spec-mapper-skill/
├── SKILL.md / README.md
├── references/
│   ├── preflight-check.md   ← 前置闸门（查 flow-map + 工程/索引）
│   ├── code-deepdive.md     ← 代码深探法（核心增值）+ 溯源/置信标注
│   └── spec-doc-spec.md     ← 现状规约产物规格(L0-L2) + 业务语言纯净 + 校验
└── templates/
    └── runtime-spec.md      ← {name}_spec.md 骨架（L0–L2）
```
