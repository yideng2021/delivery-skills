# 与 spec-wf 的衔接细则

> 权威定义 brownfield-onboarding 如何被 spec-wf 消费。**仿 RBK：零命令耦合，被动消费。**

---

## 定位：前置认知层，不是第 5 步

brownfield-onboarding **不进入** proposal → spec → design → tasks 4 步链。它在链外产出 `.brownfield/`
薄层，由各 writer 在关键节点**主动查询**（读薄层 + 活查询 MCP），如同 RBK 通过 frontmatter 被动协作。

```
brownfield-onboarding ──产出──▶ 目标仓 .brownfield/（薄·人审）
                                      │ 被以下节点查询
   proposal §0 ◀──────────────────────┤
   design §5 ADR ◀─────────────────────┤
   tasks 拆分 ◀────────────────────────┘
```

---

## 消费点

### proposal-writer §0 既有资产盘点
权威写作指南：`proposal-writer-skill/references/existing-landscape.md`（已加"棕地基线优先"指针）。

| §0 子项 | 查询 |
|---|---|
| §0.1 业务能力触达 | 读 `.brownfield/01` 业务域 → `gitnexus context` 确认 |
| §0.2 工程模块触达 | 读 `01`/`02` 入口锚点 → `codegraph_impact` 取触达模块 |
| §0.3 风险与 Backout | `codegraph_impact` + `gitnexus impact` 取爆炸半径 + 跨域触点 |

### design-writer §5 ADR 复用三问
权威：`design-writer-skill/references/existing-architecture-landscape.md`（已加取证指针）。

| 三问 | 取证 |
|---|---|
| 已检索既有资产没？ | 读 `01` 业务域 + `02` 流程索引 |
| 是否已有自然责任方？ | `gitnexus context` / `cypher MEMBER_OF` 看归属域 |
| 为何新建而非扩展？ | `codegraph_impact` 量化扩展影响面 vs 新建成本 |

### task-decomposer 影响驱动拆分
`codegraph_impact` / `gitnexus detect_changes` → 改动爆炸半径 → 任务边界与依赖。

---

## 解耦纪律

- writer 与本 skill **零命令名耦合**：writer 不调用本 skill，只在 reference 指南中"若 `.brownfield/` 存在则优先查、否则回退 grep"。
- 本 skill **不修改** 目标仓源码，**不修改** `docs/spec/{change}/` 任何文件。
- greenfield（`change_mode == greenfield`）不触发本层。
