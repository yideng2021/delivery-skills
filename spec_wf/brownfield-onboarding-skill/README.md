# brownfield-onboarding-skill

> **一句话定位**:用 CodeGraph + GitNexus 双源,为既有(棕地)项目提炼"认知基线",作为 spec-wf 的**前置现状输入**。

`brownfield-onboarding` 是 spec-wf 体系的**前置认知层**。它不属于 proposal → spec → design → tasks 4 步链,
而是仿 `requirements-bookkeeping`(RBK):作为 sibling skill,被各写手在关键节点**主动查询**,零命令耦合。

---

## 解决什么问题

spec-wf 为既有工程做增量(`change_mode: extend/refactor/bugfix`)时,proposal 要盘点既有资产、design 要做
复用决策——都依赖"现状认知"。本 skill 把棕地代码库提炼成可信、可检索的现状,喂给这些节点。

## 核心模型:薄基线 + 活查询

```
永久层(薄·人审)              活查询层(即时·不固化·源码可信)
────────────────             ──────────────────────────────
业务域划分 / 主线叙事    →    对入口锚点跑 codegraph_explore
入口锚点 + 活查询命令    →    即时还原状态机/调用链/影响面
(目标仓 .brownfield/)        输出给当下任务,用完即弃,断言回链 文件:行号
```

> 关键判断(经 critical-thinking 审查定型):**消费方是带 MCP 的 agent**,故明细走实时查询;固化 AI 叙事
> 会冻结潜在幻觉污染后续编程,"错误基线比无基线更危险"。永久文档因此砍薄,只留 MCP 给不出的东西。

## 安装

无 CLI 安装。AI 入口为 [`./SKILL.md`](./SKILL.md)。前置:目标仓已 `codegraph init` + `gitnexus analyze`,
运行环境挂载两者 MCP。

## 平台兼容

- 与 4 个写手 skill **零命令耦合**:仅在 proposal §0 / design §5 等节点被主动查询。
- 与 spec-design-workflow 解耦:仅在 `change_mode != greenfield` 缺现状认知时被路由。

## 文件结构

```
brownfield-onboarding-skill/
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
    ├── spec-wf-integration.md         ← 与 4 步链的衔接细则
    └── redlines.md                    ← 红线与反模式
```

> **前置闸门**：skill 首步强制实测双索引完整性（`codegraph_status` + `list_repos`）。
> 索引缺失 → 停止并转人工修复；索引降级（滞后/无 embedding）→ 暂停待人工确认。**绝不在残缺索引上继续。**

## 输出物(目标仓 `.brownfield/`)

- `00-overview.md` 画像 · `01-architecture.md` 业务域(人审) · `02-business-flows.md` 流程索引(人审) · `05-retrieval-guide.md` 查询指南

## 不做什么

- 不预生成厚明细文档(模块字典/热点全量叙事)——走活查询。
- 不修改目标仓源码;不进入 4 步规约链;不替代 spec/design 生成。
