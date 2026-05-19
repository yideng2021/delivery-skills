# Proposal Checklist — proposal 阶段唯一验收权威

> 本文件是 proposal 阶段验收的**唯一权威**。SKILL.md 不复述任何条目。
> 完成全部勾选 + CDR 退出条件后，可将 frontmatter `status: draft` 改为 `reviewed`。
> §0 既有资产盘点写法见 [`./existing-landscape.md`](./existing-landscape.md)。

---

## §1 frontmatter 合规

- [ ] `change_name` 为 kebab-case，与目录 `docs/spec/{change_name}/` 一致
- [ ] `status: draft`（初稿）或 `reviewed`（完成精炼）
- [ ] `change_mode` ∈ {`greenfield`, `extend`, `refactor`, `bugfix`}
- [ ] `req_ledger_state` ∈ {`present`, `missing`, `skipped`}
- [ ] `related_req_proposal` 为数组（可为 `[]`）
- [ ] 字段拼写、枚举值与 [`../../shared/contracts/frontmatter-schema.md`](../../shared/contracts/frontmatter-schema.md) §1 完全一致
- [ ] 空值表达符合 [`../../shared/contracts/empty-value-convention.md`](../../shared/contracts/empty-value-convention.md)

## §2 §0 既有资产盘点合规(分支规则)

- [ ] **`change_mode == greenfield` 分支**:§0 已折叠为一行声明 `> §0 已确认 greenfield(无既有资产触达);本节整体省略。`(三张表整体省略;消除仪式填充)
- [ ] **`change_mode != greenfield` 分支**:§0.1 / §0.2 / §0.3 三张表字段位**必存**;§0.1 / §0.2 至少各 1 行非"无";数据来自实地检索(代码 grep / 账本扫描 / Wiki 回顾),**非凭印象**
- [ ] `change_mode != greenfield` 时,§0.1 "关系"列 ⊆ {沿用, 扩展, 修改, 废弃, 替换, 并存, 无}(语义见 [change-verbs.md](../../shared/contracts/change-verbs.md))
- [ ] `change_mode != greenfield` 时,§0.2 "触达方式"列 ⊆ {读, 写, 改, 替换, 仅引用, 无}

## §3 内容合规

- [ ] §1 Problem Statement 清晰，1–2 句话，无含糊形容词（"快速 / 优雅 / 友好"等）
- [ ] §1 Problem Statement **显式引用** §0.1 / §0.2 的具体条目（行号 / 名称）
- [ ] §2 Proposed Changes 列出新增 / 修改 / 移除项，边界明确
- [ ] §2 表的"关联既有资产"列 ⊆ §0.1 ∪ §0.2 ∪ {`—`}（纯新增写 `—`）
- [ ] §2 表的"复用 vs 新建"列与"Blast Radius"列**全部已填**（无空缺）
- [ ] §2 破坏性变更已标记 `[BREAKING]`
- [ ] §2 含**显式排除**段（回答"不做什么"）
- [ ] §2 **Backout / 回滚策略**段已填（`change_mode != greenfield` 时强制；`greenfield` 时显式写"前向兼容，无需回滚"）
- [ ] §3.1 触达的既有 Capability 与 §0.1 一一对应
- [ ] §3.2 新增 / 拆分的 Capability 命名为 kebab-case
- [ ] §4 Related Requirements 与 frontmatter `related_req_proposal` 一致（同一来源，文中仅引用字段）
- [ ] §5 Decision 已勾选 Go 或 No-Go（若 No-Go 须说明理由）

## §4 §5 决策前自检（Go 状态必勾）

- [ ] §0 既有资产盘点已基于代码 / 账本 / Wiki 实地检索，**非凭印象**
- [ ] **复用充分性自检**：已确认 §2 中标"新建"的条目，确无可复用的 §0 既有资产
- [ ] **改动闭环**：§2 每一行的"关联既有资产"与"Blast Radius"已填写
- [ ] **兼容性策略**：所有 `[BREAKING]` 项已在 §2 Backout 中给出迁移 / 回滚方案
- [ ] **变更模式一致性**:frontmatter `change_mode` 与 §0 / §2 内容一致(`greenfield` 时 §0 已整节折叠;`非 greenfield` 时 §0 表格存在且 §0.1/§0.2 至少各 1 行非"无")

## §5 边界纪律

- [ ] **未涉及任何实现细节**（无技术方案 / 数据模型 / API / SQL / 字段类型 / 代码片段）
- [ ] 篇幅 ≤ 2 页（§0 三张表不计入篇幅约束）
- [ ] 未出现"调用 RBK Uxxx"等命令名硬编码；账本对接细则见 [`./req-ledger-handshake.md`](./req-ledger-handshake.md)
- [ ] 未出现旧术语"复杂度守卫" / "复杂度梯度"

## §6 协议合规

- [ ] **CG 闸门已走完**：proposal.md 顶部含 `<!-- clarification-gate -->` 块，`verdict` ∈ {`PASS`, `ABORTED`}；语法见 [`../../shared/protocols/clarification-gate-protocol.md`](../../shared/protocols/clarification-gate-protocol.md) §6
- [ ] CG verdict 为 `ABORTED` 时，含 `skip_reason` 字段
- [ ] 已完成至少 1 轮 CDR 循环（[`../../shared/protocols/cdr-protocol.md`](../../shared/protocols/cdr-protocol.md)）
- [ ] CDR 退出条件全部满足后，文档 `status` 由 `draft` 改写为 `reviewed`

## §7 上下游交接

- [ ] proposal.md 路径为 `docs/spec/{change_name}/proposal.md`
- [ ] frontmatter `change_mode` / `related_req_proposal` 由 spec-writer 在阶段二读取（写读流图见 [`../../shared/contracts/frontmatter-schema.md`](../../shared/contracts/frontmatter-schema.md) §3）
- [ ] §0.1 / §0.2 内容将分别映射为 spec frontmatter 的 `reference_specs`（spec 视角，既有 spec 锚）/ `touched_capabilities` / `impacted_modules`