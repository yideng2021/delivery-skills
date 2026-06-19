# Runtime Business Spec Skill — 运行时业务流程与规则说明

> 消费 runtime-ui-collab 已确认的界面事实 + flow-map 代码锚，深探 Service 抽业务规则，
> **串成端到端流程并翻成纯业务语言**，产出一份**业务人员可读**的现状流程与规则说明。
> 管线**终端业务产物**——替代 runtime-spec-mapper，唯一规则源。

## 在认知管线中的位置

```
runtime-capture ─▶ runtime-flow-mapper ─▶ runtime-ui-collab ─▶  本 skill（业务语义层）
  采集            落锚骨架               人工确认界面事实        串流程+深探规则+翻业务语言
                                       （不串流程/不抽规则——故意留给本 skill）
```

## 输入 / 输出

| | 内容 |
|---|---|
| 输入 | `docs/prd/{name}/*.md`（ui-collab，confirmed）+ `docs/runtime-flow/{name}/{name}_flow-map.md` + 前后端工程 + CodeGraph/GitNexus 索引 |
| 输出 | `docs/business-flow/{name}/{name}_业务流程说明.md`（单份端到端，纯业务语言） |

## 核心能力

```
串流程（按 nav_context）  +  深探提规则（Service，到 Service 止）  +  翻译（纯业务语言+确信度词）
```

借 L0-L2 内核（INV 纪律/实体/状态机/现状≠规范/语言纯净/术语表），弃其外形（用户故事轴/技术编号/溯源锚/层级标签）。

## 产物结构（{name}_业务流程说明.md）

1. 业务概述（含业务术语 + 依赖外部能力）　2. 业务流程（端到端，纯业务节点 Mermaid）
3. 各环节业务规则（INV 纪律 + 〔已核实/待核实〕）　4. 业务数据流转（状态机）　5. 角色与权限

## 红线

- **零技术术语**：正文无接口/代码路径、类名、字段名、标注黑话。
- **规则源自深探**：从 Service/校验抽，不造规则；推测标〔待核实〕。
- **深探有界**：到 Service+校验+状态机止，不下 DAO。
- **现状≠规范**：只述当前，不评判应当。
- **不越界**：不采集/不落锚/不改上游产物。

## 触发

「梳理运行时业务流程与规则」「出业务可读的现状流程说明」「把界面文档串成业务流程」。

## 目录

```
runtime-business-spec-skill/
├── SKILL.md / README.md
├── references/  preflight-check / code-deepdive / business-doc-spec
└── templates/   business-flow.md
```
