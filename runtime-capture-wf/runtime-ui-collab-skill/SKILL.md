---
name: runtime-ui-collab
description: >
  运行时界面业务梳理 skill（界面层 · 首个人工闸口）。以 runtime-flow-mapper 的 flow-map 为骨架、
  runtime-capture 原始证据（session_log / records.ts / api_details）为界面操作事实源，逐界面人机协同核对，
  把推断（~inferred）按"runtime 证据优先 → 代码回查补全 → 问人兜底"收敛为人工确认（[人工] / [runtime+码]），
  每界面即时落盘一份带 frontmatter 的界面业务事实文档（业务描述 + 功能地图 + 界面流程图）。只做界面事实层
  浅回查确认，不采集、不落锚、不抽业务规则、不串跨界面流程。当用户要求「逐界面梳理运行时业务」
  「把 flow-map 整理成界面文档」「界面业务核对」「人机协同界面梳理」时触发。
---

# Runtime UI Collab — 运行时界面业务梳理（人机协同）

> **定位**：认知管线的**界面层 · 首个人工闸口**。上游 `runtime-flow-mapper`（落锚→flow-map）→ **本 skill（人机协同→已确认界面事实文档集）**。
> 单一职责：**把界面级推断经人机协同校准成确证，逐界面输出 PRD 式界面业务事实文档**——不采集、不落锚、不抽业务规则、不串跨界面流程。

## 术语表（先对齐黑话）

| 术语 | 含义 |
|------|------|
| **界面事实层浅回查** | 本 skill 的核心动作：确认「界面上发生了什么」（功能点做什么/怎么触发/有哪些字段），回查代码只到锚点验证为止，**不下 Service 抽业务规则**（那是下游）。 |
| **三级收敛** | 处理推断的固定优先级：①runtime 原始证据自证 → ②代码回查补全 → ③问人兜底。不可越级。 |
| **[人工] / ~待确认** | 问人的两个结果：已定 = `[人工]`（由 `~inferred` 升格）；未定 = `~待确认`（允许显式残留）。 |
| **即时落盘 / status 断点续做** | 每界面草稿即写 md，frontmatter `status`（draft/confirmed/skipped）机读；重启扫 status 续做，中断不丢进度。 |
| **衔接契约（frontmatter）** | 每界面文档头部的机读字段（route / upstream_nodes / nav_context / source_refs），供下游串流程、溯源，不复述上游原文。 |
| **flow-map** | 上游 runtime-flow-mapper 产物，含节点清单 + 三证对齐表，是本 skill 的**骨架/索引**。 |
| **capture 原始证据** | runtime-capture 产物 `session_log`/`records.ts`/`api_details`，是本 skill 的**界面操作事实源**（flow-map 蒸馏时压没的粒度在此）。 |

## 触发

「逐界面梳理运行时业务」「把 flow-map 整理成界面文档」「界面业务核对」「人机协同界面梳理」。

## 前置依赖

- 上游 `runtime-flow-mapper` 已产出 `docs/runtime-flow/{name}/{name}_flow-map.md`
- 上游 `runtime-capture` 原始产物仍在 `{工作目录}/{name}/`（取 session_log / records.ts / api_details）
- 前端工程 + 后端工程目录；CodeGraph + GitNexus 索引（前后端两仓，代码回查用）

> 依赖**不假设成立**，由不变量 0 的[前置闸门](references/preflight-check.md)实测；缺 flow-map / capture 产物则**中断 + 提示先跑上游**。

## 不变量（核心纪律）

0. **前置闸门（强制·首步）**：查 flow-map.md 就位 + capture 原始产物就位 + 工程/索引齐备；缺则**中断**，绝不臆造。见 [`references/preflight-check.md`](references/preflight-check.md)。
1. **推断必收敛、缺证不断言**：`~inferred` 经三级收敛后 confirmed 文档**残留=0**；**代码找不到的逻辑不得直接断言**，标 `~待确认`，协同仍未定则允许显式残留。
2. **三级收敛不可越级**：runtime 证据优先 → 代码回查补全 → 问人兜底（仅业务判断类留给人）。详见 [`references/collab-method.md`](references/collab-method.md)。
3. **跨服务以 runtime 为存在性权威**：代码回查 **0 命中 ≠ 无此逻辑**——已被 session_log/api_requests 证实的调用，标 `[runtime]` + 注"代码不在本工程"，**禁止下'无此逻辑'结论**。
4. **时序 ≠ 因果**：相邻接口不等于因果绑定；要断言因果/中间步骤须用 api_details 请求体字段差异佐证，佐证不足只记时序。
5. **标注对齐上游 + 增 `[人工]`/`~待确认`**：沿用 `[码]`/`[runtime]`/`~inferred`/`~unresolved`；规范见 [`references/ui-doc-spec.md`](references/ui-doc-spec.md)。
6. **即时落盘 + 状态机读**：每界面即写、按 `status` 断点续做。
7. **不越界 / 禁杜撰**：不采集、不落锚（上游），不抽业务规则、不串跨界面流程（下游），只产已确认界面事实文档。

## 输入（三层，各司其职）

| 层 | 来源 | 用途 |
|----|------|------|
| **骨架/索引** | `flow-map.md` | 节点→界面映射、代码锚、流程结构、三证表 |
| **界面操作事实源** | `session_log` | 导航序列(前置/后置) + 每界面 route(识别主键) + 界面内 API 时序 |
| | `records.ts` | 真实触发方式 + 界面内操作序列 + 录到的输入字段 |
| | `api_details` | 实际 req/resp 字段（**按需**加载） |
| **验证/补全** | 工程代码 + 索引 | 浅回查补全"功能完整能做什么" |

> `api_requests` flow-map 已消化，一般不必直读；HAR 不消费；**不消费 spec**（spec-mapper 在本 skill 之后，读它会反向继承推断债）。

## 输出

主产物 **`docs/prd/{name}/{界面名称}.md`**（每界面一文件，带 frontmatter）。结构、frontmatter、标注与升档自检见 [`references/ui-doc-spec.md`](references/ui-doc-spec.md)，套用 [`templates/ui-business-map.md`](templates/ui-business-map.md)。

## 工序（强制顺序，每阶段一个 Checkpoint）

```
⓪ 前置闸门  →  ① 界面范围确认  →  ②~N 逐界面人机协同（每界面即时落盘）  →  收尾汇总
```

### ⓪ 前置闸门（Preflight）
按 [`references/preflight-check.md`](references/preflight-check.md) 查 flow-map + capture 产物 + 工程/索引。
- **Checkpoint**：齐全 → 进入 ①；缺 → 中断提示，不继续。

### ① 界面范围确认
读 flow-map 节点清单 + 三证表，**以 session_log 的 route/URL 为主键**推断「节点 → 界面」映射（N:M）；展示界面清单表格，用户确认/修正。
- **Checkpoint**：界面清单经用户确认；节点↔界面 N:M 关系（独立/合并/子界面/多视角）已标。

### ②~N 逐界面人机协同（每界面即时落盘）
按 [`references/collab-method.md`](references/collab-method.md)：**S1 草稿生成**（flow-map 索引 + capture 本界面切片 + 浅回查）→ **S2 三级收敛**（runtime→回查→问人）→ **S3 用户答 → 升格标注 → 即时写盘（status）→ 确认菜单**。
- **Checkpoint**：每界面 `~inferred 残留=0`；`~待确认` 已显式标且计入 confidence；过升档自检者置 `confirmed`。

### 收尾汇总
扫 `docs/prd/{name}/` 各文件 `status`，汇总 confirmed / skipped / draft 残留 + 产物目录。
- **Checkpoint**：无非预期 `draft` 残留；汇总如实反映各界面 status。

## 与上下游衔接（产物级、零耦合）

- **上游**：消费 flow-map（骨架）+ capture 原始证据（界面操作事实）；与 flow-mapper **同源不同目的**，零耦合。
- **下游（被动引用）**：`runtime-spec-mapper`（以已确认界面事实 + 代码深探出业务规约）、流程总览 skill（按 `nav_context` 串端到端流程）。本 skill **不感知下游**，只留衔接契约。

## 文件导航

```
runtime-ui-collab-skill/
├── SKILL.md / README.md
├── references/
│   ├── preflight-check.md   ← 前置闸门（查 flow-map + capture 产物 + 工程/索引）
│   ├── collab-method.md     ← 逐界面协同法（草稿→三级收敛→追问→标注升格）核心能力
│   └── ui-doc-spec.md       ← 界面文档产物规格（frontmatter + 结构 + 标注 + 升档自检）
└── templates/
    └── ui-business-map.md   ← {界面名称}.md 骨架
```
