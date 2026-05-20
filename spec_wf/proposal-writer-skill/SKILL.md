---
name: proposal-writer
description: >
  起草 change 提案文档(战略对齐),回答"为什么做"与"做什么"。产出 `docs/spec/{change_name}/proposal.md`
  含 §0 既有资产盘点 / Problem / Proposed Changes / Capability Map / Decision。**§0 强制必填**(即便
  greenfield 也保字段位)。当用户表达「启动新功能开发 / 做需求规约 / 写一个变更提案」时触发。
---

# Proposal Writer

## 触发

用户表达「启动新功能开发 / 做需求规约 / 写一个变更提案」,或 spec-design-workflow 路由进入 proposal 阶段。

## 不变量(精简)

1. 仅写战略对齐,**不涉及实现细节**(技术方案下放 design / dev)
2. 与 RBK 仅通过 frontmatter 字段被动协作;**不直接写账本**
3. 破坏性变更必须 §2 标 `[BREAKING]` + 配套 Backout
4. **§0 三张表填充规则**(差异化处理):
   - `change_mode != greenfield` 时三张表**字段位永不省略**,§0.1/§0.2 至少各 1 行非「无」
   - `change_mode == greenfield` 时**允许整节折叠**为一行声明:`> §0 已确认 greenfield(无既有资产触达);三张表整体省略。`(消除 ceremonial 仪式填充)
5. §1 Problem 显式引用 §0 条目;§2「关联既有资产」列可回溯 §0.1/§0.2
6. `change_mode` 与 §0 内容一致(非 greenfield 时 §0.1/§0.2 至少各 1 行非「无」)
7. 篇幅 ≤ 2 页(§0 不计入);声明式 > 命令式
8. CDR 退出 + §5 自检全勾选,才允许 `status: draft → reviewed`
9. **路径自治**:写 proposal.md 前若 `docs/spec/{change_name}/` 不存在则自动创建(idempotent;已存在则视为继续既有 change,读现有 frontmatter)
10. **CG 闸门强制**(P0):动笔前必须走一轮 [`../shared/protocols/clarification-gate-protocol.md`](../shared/protocols/clarification-gate-protocol.md);首版 proposal.md 顶部必须含 `<!-- clarification-gate -->` 块,verdict ∈ {PASS, ABORTED}。缺失即触发 validate.mjs C7 hard fail。
11. **reviewed 由用户裁决**:skill **不得**自行把 `status` 从 `draft` 升 `reviewed`;CDR 退出 + §5 自检全勾选后必须以 ToolCall 三选项形态请用户裁决:`[1] 满意,升 reviewed` / `[2] 还需修改` / `[3] 重写 proposal`,得到 `[1]` 才执行 frontmatter 字段升级。

## 输入

- `docs/spec/REQUIREMENTS.md` 是否存在(决定 `req_ledger_state`,不修改)
- 用户对本 change 的关联意图(关联现有 / 新增 / 跳过)
- 代码仓库(供 §0.2 既有代码资产盘点)
- 既有 spec / ADR / 历史 proposal(供 §0.1 / §0.3)

## 输出 frontmatter(权威定义见 [shared/contracts/frontmatter-schema.md](../shared/contracts/frontmatter-schema.md))

| 字段 | 取值 | 写入时机 |
|------|------|---------|
| `change_name` | kebab-case | 起草开始 |
| `status` | `draft` → `reviewed` | 起草 / CDR 退出后 |
| `change_mode` | `greenfield` \| `extend` \| `refactor` \| `bugfix` | 起草,与 §0 一致 |
| `req_ledger_state` | `present` \| `missing` \| `skipped` | 账本检查后 |
| `related_req_proposal` | `[AUTH-xx, ...]` 或 `[]` | 与用户确认关联意图后 |

## 与下游衔接

- spec-writer 读:`change_name` / `change_mode` / `related_req_proposal`;§0.1 → spec `reference_specs` / `touched_capabilities`;§0.2 → spec `impacted_modules`
- workflow 监听:`status: reviewed` 触发阶段二
- RBK(被动):监听 `req_ledger_state` / `related_req_proposal`

## 文件导航

- 模板:[`./templates/proposal.md`](./templates/proposal.md)
- 写作详解:[`./references/how-to-write.md`](./references/how-to-write.md)
- §0 写法:[`./references/existing-landscape.md`](./references/existing-landscape.md)
- 账本握手:[`./references/req-ledger-handshake.md`](./references/req-ledger-handshake.md)
- 验收清单:[`./references/checklist.md`](./references/checklist.md)
- **严禁事项**:[`./references/redlines.md`](./references/redlines.md)
- 共享契约:[`../shared/contracts/`](../shared/contracts/) / [`../shared/protocols/`](../shared/protocols/)
- **CG 闸门协议**:[`../shared/protocols/clarification-gate-protocol.md`](../shared/protocols/clarification-gate-protocol.md)(生成前澄清)
- 机械校验:`node ../scripts/validate.mjs docs/spec/{change_name}/`
