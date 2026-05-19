---
name: design-writer
description: 把 spec 翻译为模块对外契约 / 依赖 / 流程 / 领域建模骨架(`docs/spec/{change_name}/design.md`)。固定 8 段结构,严守边界红线(无 SQL/HTTP/字段类型/代码片段;架构层图表允许),领域建模深度按 L1/L2/L3 三档递进。**增量优先**:`change_mode` 沿用 spec,既有 BC / 模块 / 领域事件 / ADR 四维资产显式标记。本 skill 仅写 design.md,不写实现方案。
---

# Design Writer

## 触发

任一条件成立即加载:
- spec 已 `status: reviewed`,要求进入 design 阶段
- 用户要求增删模块契约 / ADR / BC
- workflow 从 spec 路由进入
- 提到「写 design / 架构设计 / 模块划分 / BC / ADR / 领域建模」

## 不变量(精简)

1. **边界红线**严格执行(无 SQL/HTTP/字段类型/代码片段/框架名/测试命令;架构层图表允许),见 [`references/boundary-redlines.md`](references/boundary-redlines.md)
2. `domain_modeling_level` 必填 ∈ `{L1, L2, L3}`,与 `domain_model_mode` 合法组合见 [`references/domain-modeling-depth.md`](references/domain-modeling-depth.md)
3. **L3 用户确认门**(ToolCall 协议):skill 不得单方面写 `domain_modeling_level: L3`;必须按 [`references/depth-confirmation.md`](references/depth-confirmation.md) §3 发结构化三选项提问,用户裁决后在 design.md 顶部留 `<!-- l3-confirmation -->` 批注块
4. 每个模块在 §3.1 标注 `BC-{name}` + 承接方;BC 在 §2.1 表可查
5. 至少 1 条 ADR(三段式 + 既有 ADR 引用);§8 追溯映射覆盖 specs 全部 AC/INV
6. CDR 退出后才升 `status: reviewed`(见 [`shared/protocols/cdr-protocol.md`](../shared/protocols/cdr-protocol.md))
7. **按档展开**:L2/L3 必填 §3.2 模块依赖图(禁循环)+ §4 核心流程(≥1);L3+extended 必填 §2.2.2 聚合 ER + §2.2.1 领域事件带增量标注;§7 风险至少 1 行
8. **`change_mode` 沿用强约束**:design.change_mode == spec.change_mode;增量字段联动见 [`references/existing-architecture-landscape.md`](references/existing-architecture-landscape.md)
9. **复用充分性自检**(反腐化):每个 `[新增]` 模块必须在 §5 ADR 回答三问(已检索 proposal §0.2 / 已检索 reused_modules / 为何新建而非扩展),见 [`references/existing-architecture-landscape.md`](references/existing-architecture-landscape.md)
10. **`reused_modules` 不遗漏 spec 影响**:reused_modules.path 集合 ⊇ ∪ spec.impacted_modules
11. **`bc_relations` 与 BC 表对应**:L1 取 `[]`;L2/L3 必非空;每项 `bc` ⊆ `bounded_contexts`;`relation != 新建` 时 `refers_to` 必填

## 输入

| 来源 | 字段 / 段落 | 用途 |
|------|------------|------|
| proposal frontmatter / §0.1 / §0.2 | `change_name` / `change_mode` / 既有资产 | 锚定 / 沿用 / 盘点起点 |
| spec frontmatter | `change_mode` / `related_req` / `milestone` / `impacted_modules` / `touched_capabilities` | sanity / `reused_modules` 覆盖性校验 |
| spec 正文 L0~L4 | AC / INV / DoD / 业务禁区 | 填 §3 / §4 / §6 / §8 |
| 既有架构文档 | `architecture_refs.path` + `usage` | 填 §1(见 [`references/architecture-context-loading.md`](references/architecture-context-loading.md)) |

## 输出 frontmatter(权威 schema 见 [shared/contracts/frontmatter-schema.md](../shared/contracts/frontmatter-schema.md))

| 字段 | 取值 | 说明 |
|------|------|------|
| `change_name` / `status` / `change_mode` | — | 沿用 spec |
| `produced_specs` | `[specs/{capability}.md, ...]` | design 视角=本 change 自产 spec(至少 1) |
| `architecture_refs` | `[{path, usage}, ...]` | 活字段;`usage` ∈ `{沿用,扩展,约束,替换}` |
| `domain_modeling_level` | `L1` \| `L2` \| `L3` | L3 需用户确认 |
| `domain_model_mode` | `omit` \| `extended` | `extended` 仅 L3 合法 |
| `bounded_contexts` | `[BC-name, ...]` 或 `[]` | 与 §2.1 BC 表一致 |
| `reused_modules` | `[{path, annotation}, ...]` | 5 项闭集;`change_mode != greenfield` 时必非空 |
| `bc_relations` | `[{bc, relation, refers_to?}, ...]` | DDD 5 项;L1 取 `[]`,L2/L3 必非空 |

## 与下游衔接

- task-decomposer 读:`domain_modeling_level` / `bounded_contexts` / `produced_specs` / `reused_modules` / `bc_relations`(决定新建 vs 改造工单)
- dev skill 读:§5 ADR + §3 模块契约
- workflow:监听 `status`

## 文件导航

- 模板:[`templates/design.md`](templates/design.md)
- 写作指南 / 架构上下文加载 / 既有架构盘点 / 建模深度 / 边界红线 / 验收清单:见 [`references/`](references/)
- **L3 升级 ToolCall 协议**:[`references/depth-confirmation.md`](references/depth-confirmation.md)
- **严禁事项**:[`references/redlines.md`](references/redlines.md)
- 机械校验:`node ../scripts/validate.mjs docs/spec/{change_name}/`
