---
change_name: {change_name}
status: draft
change_mode: extend            # greenfield | extend | refactor | bugfix
req_ledger_state: missing
related_req_proposal: []
---

# Proposal — {change_name}

> 战略对齐文档。回答"为什么做"与"做什么"，不涉及实现细节。
> §0 既有资产盘点写法见 [`./references/existing-landscape.md`](./references/existing-landscape.md)；
> 字段语义见 [`../shared/contracts/frontmatter-schema.md`](../shared/contracts/frontmatter-schema.md)；
> 写作指南见 [`./references/how-to-write.md`](./references/how-to-write.md)；
> 验收见 [`./references/checklist.md`](./references/checklist.md)。

---

## 0. 既有资产盘点 (Existing Landscape)

> 在描述"要改什么"之前,先描述"在什么之上改"。
>
> **填充规则**(v3 起 greenfield 不再要求仪式填充):
> - `change_mode == greenfield` 时,可整节折叠为一行声明,**删除下方三张表**:
>   `> §0 已确认 greenfield(无既有资产触达);本节整体省略。`
> - `change_mode != greenfield` 时,§0.1 / §0.2 / §0.3 三张表必填,§0.1 / §0.2 至少各 1 行非「无」。
>
> 三张表的填法详见 [`./references/existing-landscape.md`](./references/existing-landscape.md)。

### 0.1 相关既有能力与文档

| 类别 | 名称 / ID | 路径 / 链接 | 与本次变更的关系 |
|------|-----------|-------------|-----------------|
| 既有 Capability | `{capability-name}` | `{spec 路径}` | 沿用 / 扩展 / 修改 / 废弃 / 替换 / 并存(语义见 [change-verbs.md](../shared/contracts/change-verbs.md)) |
| 既有 Spec | `{spec-id 或文件名}` | `{path}` | 沿用 / 扩展 / 修改 / 废弃 |
| 既有 REQ-ID | `REQ-xxx` | `{所在 spec}` | 沿用 / 修改 / 废弃 |
| 既有 AUTH-ID | `AUTH-xxx` | `docs/spec/REQUIREMENTS.md#AUTH-xxx` | 沿用 / 修改 / 废弃 |
| 既有 ADR / 决策 | `ADR-xxx` 或历史 Proposal | `{path}` | 一句话回顾结论 |

### 0.2 相关既有代码资产

> 仅列与本次变更**直接相关**的模块 / 服务 / 接口；触达方式闭集见 [`./references/existing-landscape.md`](./references/existing-landscape.md) §3.2。
> **工具辅助（规则 R，见 [`existing-landscape.md`](./references/existing-landscape.md) §8）**：`change_mode != greenfield` 且双索引就绪时默认执行，取证列标来源；不可用/跳过在下方标 `tool_assist: unavailable | skipped — <原因>`。

| 模块 / 服务 / 接口 | 路径 | 触达方式 | 取证（手工/codegraph/gitnexus） |
|-------------------|------|----------|------|
| `{module / service / api}` | `{relative/path}` | 读 / 写 / 改 / 替换 / 仅引用 | `{手工 / codegraph / gitnexus}` |

### 0.3 既有约束与历史决策回顾

- {一句话回顾历史相关决策、技术债、未完成项；无则写"已检索 ADR / Wiki / 历史 Proposal，未发现冲突"}
- {与本次变更可能冲突的既有约定}

---

## 1. Problem Statement (Why)

> 1–2 句话陈述现状与痛点。**必须显式引用 §0** 中的具体条目（行号 / 名称），避免在真空中描述痛点。

**现状**：{基于 §0.1 / §0.2 的具体条目描述当前系统 / 业务的状态}

**痛点**：{描述具体问题，指明痛点发生在 §0 哪些资产之上}

---

## 2. Proposed Changes (What)

> 列出变更范围；每行的"关联既有资产"必须可回溯到 §0.1 / §0.2 的具体条目（纯新增写 `—`）；破坏性变更标记 `[BREAKING]`。

| # | 类型 | 变更内容 | 影响范围 | 关联既有资产（来自 §0） | 复用 vs 新建 | Blast Radius | 标记 |
|---|------|---------|---------|------------------------|-------------|--------------|------|
| 1 | 新增 | `{description}` | `{scope}` | `—` 或 `{§0.1/§0.2 条目}` | 新建 | `{受影响的下游}` | — |
| 2 | 修改 | `{description}` | `{scope}` | `{§0.1/§0.2 条目}` | 扩展 / 复用 | `{受影响的下游}` | `[BREAKING]` |
| 3 | 移除 | `{description}` | `{scope}` | `{§0.1/§0.2 条目}` | 替换 / 废弃 | `{受影响的下游}` | `[BREAKING]` |

**显式排除**：

- {明确不在本次变更范围内的内容}

**Backout / 回滚策略**（`change_mode != greenfield` 时必填）：

- {如何回滚 / 灰度策略 / 兼容期窗口；无回滚需求请显式声明"前向兼容，无需回滚"}

---

## 3. Capability Map

### 3.1 触达的既有 Capability（来自 §0.1）

| Capability 名称 | 关系 | 说明 |
|-----------------|------|------|
| `{capability-name}` | 沿用 / 扩展 / 包裹 / 替换 | `{一句话说明边界与契约}` |

### 3.2 本次新增 / 拆分的 Capability

| Capability 名称 | 一句话描述 | 优先级 | 与既有 Capability 的关系 |
|-----------------|-----------|--------|-------------------------|
| `{capability-name}` | `{description}` | P0 / P1 | 独立 / 扩展 `{既有 cap}` / 替换 `{既有 cap}` |

---

## 4. Related Requirements

> AUTH-ID 列表写入 frontmatter `related_req_proposal`。账本对接细则见 [`./references/req-ledger-handshake.md`](./references/req-ledger-handshake.md)。

---

## 5. Decision

- [ ] **Go** — 批准进入 Specs 阶段
- [ ] **No-Go** — 拒绝或需进一步澄清

**决策前自检清单**（全部勾选方可 Go）：

- [ ] §0 既有资产盘点已基于代码 / 账本 / Wiki 实地检索，**非凭印象**
- [ ] **复用充分性自检**：已确认 §2 中标"新建"的条目，确无可复用的 §0 既有资产
- [ ] **改动闭环**：§2 每一行的"关联既有资产"与"Blast Radius"已填写
- [ ] **兼容性策略**：所有 `[BREAKING]` 项已在 §2 Backout 中给出迁移 / 回滚方案
- [ ] **变更模式一致性**：frontmatter `change_mode` 与 §0 / §2 内容一致（`greenfield` 必须 §0 全为"无"）

**决策理由**：{...}