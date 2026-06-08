# arch-baseline-skill

> **一句话定位**:用 CodeGraph + GitNexus 双源,为既有(棕地)项目提炼"认知基线"(薄基线 + 活查询),作为可被任意下游消费的**独立现状产物**。

`arch-baseline` 是 `architecture-extractor-wf`(棕地架构提取 workflow 域)内的**认知基线 skill**。
它产出独立产物 `.brownfield/`,**不感知、不依赖**任何特定下游(规约/影响分析/文档/导览等),
下游按"产物契约"消费(存在即用、缺失降级)。本 wf 与任何规约/交付流水线**解耦**。

---

## 解决什么问题

为既有工程做任何后续工作(理解、影响评估、规约、文档)前,都依赖一份可信、可检索的"现状认知"。
本 skill 把棕地代码库提炼成薄基线产物,供下游按需消费,避免每个下游各自从零摸索。

## 核心模型:薄基线 + 活查询

```
永久层(薄·人审)              活查询层(即时·不固化·源码可信)
────────────────             ──────────────────────────────
业务域划分 / 主线叙事    →    对入口锚点跑 codegraph_explore
入口锚点 + 活查询命令    →    即时还原状态机/调用链/影响面
(目标仓 .brownfield/)        输出给当下任务,用完即弃,断言回链 文件:行号
```

> 关键判断(经 critical-thinking 审查定型):**主消费方是带 MCP 的 agent**,故明细走实时查询;固化 AI 叙事
> 会冻结潜在幻觉污染后续编程,"错误基线比无基线更危险"。永久文档因此砍薄,只留 MCP 给不出的东西。

## 安装

无 CLI 安装。AI 入口为 [`./SKILL.md`](./SKILL.md)。前置:目标仓已 `codegraph init` + `gitnexus analyze`,
运行环境挂载两者 MCP。

## 平台兼容

- **零命令耦合**:不被任何下游 import/调用;产物 `.brownfield/` 按契约被动消费(见 `references/downstream-consumption.md`)。
- **前置闸门**:首步强制实测双索引完整性(`codegraph_status` + `list_repos`);缺失→停止转人工,降级→暂停待确认,**绝不在残缺索引上继续**。
- 同 wf 内 `arch-guide` 复用本 skill 的前置闸门与 6 步重建法。

## 文件结构

```
arch-baseline-skill/
├── README.md                          ← 本文件(人类导航)
├── SKILL.md                           ← AI 入口(触发 / 不变量 / 输入输出 / 导航)
├── templates/                         ← .brownfield/ 输出骨架
│   ├── 00-overview.md
│   ├── 01-architecture.md
│   ├── 02-business-flows.md
│   └── 05-retrieval-guide.md
└── references/
    ├── preflight-check.md             ← 前置完整性闸门(强制·首步)
    ├── reconstruction-method.md       ← 业务流程 6 步重建法(权威)
    ├── retrieval-tool-map.md          ← CodeGraph/GitNexus 按意图选工具
    ├── downstream-consumption.md      ← 产物契约 + 下游消费方式(零耦合)
    └── redlines.md                    ← 红线与反模式
```

## 输出物(目标仓 `.brownfield/`)

- `00-overview.md` 画像 · `01-architecture.md` 业务域(人审) · `02-business-flows.md` 流程索引(人审) · `05-retrieval-guide.md` 查询指南

## 不做什么

- 不预生成厚明细文档(模块字典/热点全量叙事)——走活查询(厚导览交 `arch-guide`)。
- 不修改目标仓源码;不感知、不依赖任何特定下游。
