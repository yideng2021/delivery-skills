# Design Writer — Redlines (严禁事项)

> 本文件遵循 [`../../shared/templates/writer-references-template.md`](../../shared/templates/writer-references-template.md) §3 redlines 骨架。
> 是 design-writer 的硬约束清单。SKILL.md 中仅链接,不复述。
> audit 命中即拒绝 `status: draft → reviewed` 转移。

---

## §1 实现细节越界(归 dev / spec)

- ❌ SQL / 表结构 / 字段类型 / HTTP 路径 / 状态码 / REST 动词(归 dev)
- ❌ 接口签名 / 代码片段 / 伪代码 / 框架名 / 版本号(归 dev)
- ❌ 测试命令 / 覆盖率指标 / 部署拓扑(归 spec L4 与 dev)

> 详细边界见 [`./boundary-redlines.md`](./boundary-redlines.md)。

## §2 建模深度类

- ❌ 单方面把 `domain_modeling_level` 升级为 L3;必须走 [`./depth-confirmation.md`](./depth-confirmation.md) §3 ToolCall 协议并在 design.md 顶部留 `<!-- l3-confirmation -->` 批注块

## §3 frontmatter 类

- ❌ design.frontmatter.change_mode != spec.frontmatter.change_mode(违反 I8)
- ❌ `change_mode != greenfield` 时 `reused_modules` 为空(违反 I8 联动)
- ❌ 标 `[新增]` 模块未在 §5 ADR 中回答「复用充分性自检」三问(违反 I9)
- ❌ `reused_modules.path` 集合 ⊊ spec.impacted_modules 并集(漏读 spec 影响,违反 I10)
- ❌ 出现旧字段 `related_specs`(已拆分,design 视角使用 `produced_specs`)

## §4 词表类

- ❌ 自创增量标注或 BC 关系词(5 项闭集 / DDD 5 项 / ADR 关系 4 项 均不可扩充)

## §5 越界复述类

- ❌ §1 架构上下文写业务语言(归 spec L0)
- ❌ 复述 proposal §0 既有资产盘点的工程级条目(design 关注架构级,详见 boundary-redlines 红线 7)
- ❌ 复述 spec L0.x 既有上下文衔接表(design 关注 BC 关系,非业务上下文)
- ❌ 在 design 内消化「工程闭环」批注(必须转交 dev skill)
- ❌ 复述 ac-vocabulary / frontmatter-schema / cdr-protocol 定义(只链接)
