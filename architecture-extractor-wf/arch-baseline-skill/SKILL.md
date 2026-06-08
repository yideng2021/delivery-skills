---
name: arch-baseline
description: >
  对棕地(既有)项目用 CodeGraph + GitNexus 双源提炼"认知基线",产出薄导航层(目标仓 `.brownfield/`)
  并保留活查询出口,为下游(架构理解/影响分析/规约/文档等)提供准确的现状认知。
  核心模型:**薄基线(永久·人审) + 活查询(即时·不固化·源码可信)**——永久文档只放 MCP 给不出的
  东西(域划分/主线叙事/人审背书+回链锚点),明细一律活查询不固化,避免冻结 AI 幻觉污染后续编程。
  当用户表达「梳理/理解既有项目」「棕地认知」「为既有工程做规约前先摸清现状」「这个老项目怎么跑的」时触发。
---

# Arch Baseline — 棕地项目认知基线

> 本 skill 属 `architecture-extractor-wf`(棕地架构提取 workflow 域),与任何规约/交付流水线解耦。
> 产物为独立的 `.brownfield/`,可被任意下游消费。

## 触发

用户表达「梳理 / 理解既有项目」「棕地认知」「为既有工程做规约前先摸清现状」「老项目业务/架构梳理」。

## 前置依赖

- 目标仓已建双索引:`codegraph init -i`（CodeGraph）+ `gitnexus analyze`（GitNexus）
- 运行环境挂载 **CodeGraph MCP** + **GitNexus MCP**
- (可选)GitNexus 补 embedding 以启用语义混合检索

> 上述依赖**不假设成立**,须经 §不变量 0 的前置闸门实测确认;不满足则停止,见下。

## 不变量(核心纪律)

0. **前置完整性闸门(强制·首步)**:提炼任何内容前,先用 `codegraph_status` + `list_repos` 实测确认双索引
   **存在且完整**(非空、同仓、新鲜)。前提不满足 → **停止 + 转人工确认,绝不跳过、绝不在残缺索引上继续**;
   三态裁决 PASS / CONFIRM(暂停待人工确认) / BLOCK(停止)。协议见 [`references/preflight-check.md`](references/preflight-check.md)。
1. **双源交叉验证**:业务域 = GitNexus 社区 ∩ 包结构;单一信号不下结论。
2. **薄基线 + 活查询分层**:永久文档只留 MCP 给不出的(域命名 / 全局叙事 / 人审背书 + 回链锚点);
   明细(调用链/状态机/影响面)一律活查询,**不预生成成文档**。
3. **不固化 AI 叙事**:流程详情即时生成、用完即弃。固化会冻结潜在幻觉并随 commit 腐烂
   ——"错误基线比无基线更危险"。
4. **断言必回链**:任何结论标 `文件:行号`,可一键核对源码。
5. **人审只覆盖薄层**:人审域划分 / 主线 / 命名(小、稳、可扩展);活查询层不入人审。
6. **机器给"大/全",AI 判"重要/可读"**:社区按规模排序会被伪域带偏(`Impl`/`Dto`/`Uuid`/`Reflect`),
   须按"是否承载业务语义"二次过滤。
7. **冲突信源码**:文档与源码不一致,以活查询的当前源码为准;永久文档 pin 基线 commit。

> 七条不变量的反模式清单见 [`references/redlines.md`](references/redlines.md)。

## 输入

- 目标棕地仓库(供双索引查询)
- GitNexus 资源:`gitnexus://repo/{name}/context`、`/clusters`、`/processes`

## 输出(目标仓 `.brownfield/`,逐份套用 templates/)

| 文件 | 角色 | 人审 | 模板 |
|------|------|------|------|
| `00-overview.md` | 仓库画像 + 双索引状态 + 时效约定 | — | [templates/00-overview.md](templates/00-overview.md) |
| `01-architecture.md` | **薄导航**:业务域 + 分层 + 主线 + 噪声剔除 | ✅ | [templates/01-architecture.md](templates/01-architecture.md) |
| `02-business-flows.md` | **薄索引**:主线流程 + 入口锚点 + 活查询命令 | ✅ | [templates/02-business-flows.md](templates/02-business-flows.md) |
| `05-retrieval-guide.md` | 活查询指南 + 下游对接映射 | — | [templates/05-retrieval-guide.md](templates/05-retrieval-guide.md) |

> **不产出**`03-module-dict` / `04-hotspots` 这类复制图谱明细的厚文档——违反不变量 2/3,走活查询。

## 提炼工序(建基线时一次性)

- **B0 前置闸门(强制·首步)** ← `codegraph_status` + `list_repos` → 三态裁决;BLOCK 则停止不产出,CONFIRM 则
  暂停待人工确认。见 [`references/preflight-check.md`](references/preflight-check.md)。**仅 PASS / 已确认的 CONFIRM 才进入 B1。**
- **B1 画像** ← `gitnexus://repo/{name}/context` + `codegraph_status` → `00`(含闸门留痕块)
- **B2 架构** ← `cypher: MEMBER_OF Community` 社区规模 ∩ 包结构(`codegraph_files`)→ AI 收敛 N 域 + 剔噪 → `01`(人审)
- **B3 业务流索引** ← Controller/路由清单 + 主线推断 → 入口锚点 + 活查询命令(非厚叙事)→ `02`(人审)
- **B5 指南** ← 套用 `05` 模板,实例化工具映射 + 下游对接 → `05`

> 业务流程的 6 步重建法详见 [`references/reconstruction-method.md`](references/reconstruction-method.md);
> 工具选择详见 [`references/retrieval-tool-map.md`](references/retrieval-tool-map.md)。

## 与下游衔接(产物级、零耦合)

本 skill 只产出独立产物 `.brownfield/`(薄基线),**不感知、不依赖**任何特定下游。
任意下游(架构导览 arch-guide、影响分析、规约/交付流水线、文档站等)可按"产物契约"消费:
存在即用、缺失则各自降级。产物契约与活查询入口详见 [`references/downstream-consumption.md`](references/downstream-consumption.md)。

## 文件导航

```
arch-baseline-skill/
├── README.md                          ← 人类导航
├── SKILL.md                           ← 本文件(AI 入口)
├── templates/                         ← .brownfield/ 输出骨架(套用后写入目标仓)
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

- 工具对比与原理:仓库根 `framework_git/docs/comparison_report.md`(CodeGraph vs GitNexus)
