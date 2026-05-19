# Proposal Writer — Redlines (严禁事项)

> 本文件遵循 [`../../shared/templates/writer-references-template.md`](../../shared/templates/writer-references-template.md) §3 redlines 骨架。
> 是 proposal-writer 的硬约束清单。SKILL.md 中仅链接,不复述。
> audit 命中即拒绝 `status: draft → reviewed` 转移。

---

## §1 命令与协作类

- ❌ 出现 `调用 RBK Uxxx` 等命令名硬编码(账本对接见 [`./req-ledger-handshake.md`](./req-ledger-handshake.md))
- ❌ 出现旧术语「复杂度守卫」/「复杂度梯度」
- ❌ 复述账本三状态判定流程 / CDR 循环步骤(应链接而非复述)
- ❌ 复述 frontmatter 字段语义([`../../shared/contracts/frontmatter-schema.md`](../../shared/contracts/frontmatter-schema.md))

## §2 frontmatter 类

- ❌ frontmatter 中出现 schema §8 proposal 示例外的字段(如 `related_req` / `milestone` / `bounded_contexts`)
- ❌ frontmatter 中出现旧字段 `related_specs`(已拆分为 `reference_specs` / `produced_specs`,proposal 不持有任何一个)
- ❌ `change_mode != greenfield` 时 §0.1 / §0.2 三张表全为「无」

## §3 §0 既有资产盘点类

- ❌ `change_mode != greenfield` 时省略 §0 三张表的字段位(必须保留;greenfield 时**允许**整节折叠为一行声明,详见模板 §0 顶部规则)
- ❌ §1 Problem Statement **不引用 §0** 任何条目(违反 I5)
- ❌ §2 表中「关联既有资产」列**留空**(违反 I5;纯新增请显式写 `—`)

## §4 工程闭环类

- ❌ One-shot 通过(违反 [`../../shared/protocols/cdr-protocol.md`](../../shared/protocols/cdr-protocol.md))
- ❌ `change_mode != greenfield` 时**未配套 Backout 回滚策略**(违反 I3)
- ❌ 写入或修改 `docs/spec/REQUIREMENTS.md` / `docs/spec/ROADMAP.md`(归 RBK 自治)
- ❌ 首版动笔前**未走 CG 闸门**(违反 [`../../shared/protocols/clarification-gate-protocol.md`](../../shared/protocols/clarification-gate-protocol.md));proposal.md 缺 `<!-- clarification-gate -->` 块,触发 C7 hard fail
- ❌ CG 提问中出现**开放式问题**(必须封闭式 [a/b/c/d] + 自由文本兜底)
- ❌ CG 留痕 `verdict: ABORTED` 但缺 `skip_reason` 字段
- ❌ CG 问卷嵌入 proposal.md 正文(必须仅在 chat 层 + 头部注释块)

## §5 越权类

- ❌ 涉及实现细节(API / 数据模型 / SQL / 字段类型 / 代码片段)——这些归 design / dev
- ❌ 写技术方案或框架名称
