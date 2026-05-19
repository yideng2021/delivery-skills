# Requirements: {Project Name}

**Core Value:** {一句话描述项目对用户提供的核心价值}
**Defined:** YYYY-MM-DD
**Last updated:** YYYY-MM-DD
**Maintained by:** `requirements-bookkeeping-skill`

---

## v1 Requirements

> 当前承诺交付的能力清单。每条 AUTH 用一句话描述用户能力（不写实现细节）。
> Checkbox 由 RBK ship/writeback 流程维护，**禁止手动修改**。

### Authentication

- [ ] **AUTH-01**: {一句话能力描述，例如：用户可用邮箱密码注册}
- [ ] **AUTH-02**: {一句话能力描述}

### Content

- [ ] **CONT-01**: {一句话能力描述}

### {更多 Category...}

- [ ] **{CAT}-01**: {描述}

---

## v2 Requirements

> 已规划但未承诺交付的能力。无 checkbox（仅作 backlog）。
> 晋升到 v1 时由 RBK U3 plan-milestone 处理（首版手动迁移）。

### Social

- **SOCL-01**: {描述}
- **SOCL-02**: {描述}

---

## Out of Scope

> 显式排除的能力，避免反复争论。

| Feature       | Reason                                  |
| ------------- | --------------------------------------- |
| {能力名}       | {为什么不做：复杂度/优先级/价值不明确}    |
| 实时聊天      | 复杂度高，非核心价值，未来再评估           |

---

## 撤销区 (Deprecated)

> append-only：从 v1/v2 撤销的 AUTH 不删除原行，迁移到此处保留 ID。
> 防止 ID 复用与历史追溯丢失。

| AUTH-ID    | 原描述                       | 撤销日期    | 原因                       |
| ---------- | --------------------------- | ----------- | -------------------------- |
| AUTH-99    | {原一句话}                   | YYYY-MM-DD  | {撤销原因}                 |

---

## Spec Index

> 项目级 AUTH ↔ Spec 索引表。**D4 强约束**：一条 AUTH 仅出现一次（lifelong 唯一，归属可整体迁移）。
> 由 RBK ship/writeback 维护；用户禁止手动编辑此表。

| AUTH-ID  | Spec                       | US covered      | Done? | Status   | Milestone |
| -------- | -------------------------- | --------------- | ----- | -------- | --------- |
| AUTH-01  | docs/spec/user-signup/     | US-101, US-102  | 0/2   | Planned  | v1.0      |
| AUTH-02  | docs/spec/user-signup/     | US-103          | 1/1   | Shipped  | v1.0      |
| CONT-01  | docs/spec/post-editor/     | US-201          | 0/1   | Planned  | v1.0      |

**字段说明与数据源**：

| 字段 | 含义 | 数据源（RBK 派生时读这里，不另立真理源） |
|------|------|---------------------------------------|
| `AUTH-ID` | 项目级能力槽编号 | 本文件 v1/v2/撤销区段 |
| `Spec` | 该 AUTH 归属的 change 路径（D4：唯一） | `docs/spec/{*}/specs/*.md` 的 frontmatter `related_req` 反向索引 |
| `US covered` | 该 Spec 中关联本 AUTH 的 US 列表 | 各 spec L1 US 的"关联 REQ"字段 |
| `Done?` | 已交付 US 数 / 总 US 数 | `tasks.md` 的 `shipped_us` ∩ US covered |
| `Status` | Planned / In Progress / Shipped | `Done?` + change 内 status 联合派生 |
| `Milestone` | 关联的里程碑（可空） | `ROADMAP.md` |

> **本表是派生视图,不是独立真理源**：所有数据可由 RBK 在 U4/U5 阶段从上述源头机械重建；用户改本表无效，应改对应数据源后让 RBK 重新派生。

---

*Maintained by `requirements-bookkeeping-skill`. Do NOT edit checkboxes or Spec Index manually — use RBK ship/writeback/audit instead.*