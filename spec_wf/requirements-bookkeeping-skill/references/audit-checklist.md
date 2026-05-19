# U6 Audit 规则手册

> 账本审计的 R1–R12 规则，每条规则给出检测逻辑、严重度、修复建议。
> U6 是只读用例，仅生成报告，不自动修改任何文件。
> 与 [`scripts/validate.mjs`](../../scripts/validate.mjs)（I-A ~ I-F + C1 ~ C6）**互补**：validator 校验 schema / 跨阶段 invariant / audit 钩子，本手册聚焦**账本视角**的语义漂移。

---

## 报告格式

```markdown
# REQUIREMENTS Audit Report
**Generated:** YYYY-MM-DD HH:MM:SS
**Project:** {project_name}

## Summary
- Total AUTH-IDs scanned: 23
- Total Specs scanned: 8
- Issues found: 5 (high: 1, medium: 3, low: 1)

## Issues

### [HIGH] R1 — Orphan AUTH-ID in Spec
- File: `docs/spec/user-signup/specs/email-auth.md` line 45
- Issue: References `AUTH-99` which doesn't exist in REQUIREMENTS.md
- Suggestion: 用户触发 RBK 登记新需求（U2 add-req），或修正 Spec 拼写

...
```

---

## 规则详情

### R1 — 孤儿 AUTH-ID（Spec 引用了账本中不存在的 ID）

**严重度**：高

**检测逻辑**：
```
对所有 docs/spec/{*}/specs/*.md：
  收集 frontmatter related_req + L1 US 关联 REQ 中出现的所有 AUTH-ID
  ↓
  对每个 AUTH-ID 检查是否在 REQUIREMENTS.md（v1/v2/Out of Scope/撤销区）出现
  ↓
  未出现 → R1 命中
```

**修复建议**：
- 若是拼写错误：修正 Spec 文件
- 若是真的需要：用户触发 RBK 登记新需求（U2 add-req）
- 若是历史遗留（已撤销）：从 Spec 移除引用

> **字段归属说明**：`frontmatter.related_req` 与 L1 US 块内的 `关联 REQ` 字段均由 **spec-writer 写**（详见 [`../../spec-writer-skill/templates/specs.md`](../../spec-writer-skill/templates/specs.md) 与 [`../../spec-writer-skill/references/checklist.md`](../../spec-writer-skill/references/checklist.md)）；RBK 仅**读取**用于建立 AUTH ↔ US 映射，不写不改（M4）。

---

### R2 — 孤儿 Spec（Spec 目录存在但未关联任何 AUTH）

**严重度**：中

**检测逻辑**：
```
对所有 docs/spec/{change}/ 目录：
  读取 specs/*.md 的 frontmatter related_req
  若所有 specs 的 related_req 都为空数组（或字段缺失）
    且该 change 的 tasks.md 显示已完成（全 [x]）
  → R2 命中
```

**修复建议**：跑 `RBK U5 writeback`，从 Spec 反向归纳并登记到账本。

> **例外**：如果 change 仍在开发中（tasks 未全勾），不报 R2。

---

### R3 — 状态漂移（账本已 ship，Spec Index 未更新）

**严重度**：中

**检测逻辑**：
```
对 REQUIREMENTS.md 中 [x] 的 AUTH：
  检查 Spec Index 表对应行的 Status 列
  若 Status 仍为 Planned / In Progress
  → R3 命中
```

**修复建议**：手动修正 Spec Index 的 Status 列为 `Shipped`，或重跑 U4 ship。

---

### R4 — Category 命名不一致

**严重度**：中

**检测逻辑**：
```
扫描所有出现的 Category 缩写：
  归一化（小写、去下划线）后比较
  若同一概念出现多种写法（AUTH / Auth / authentication）
  → R4 命中
```

**修复建议**：规范化到 4 字母大写形式，更新 REQUIREMENTS.md 与所有引用 Spec。

> 注意：批量重命名是高风险操作，建议手动操作。

---

### R5 — D4 强约束违反（同一时刻一 AUTH 跨多 Spec）

**严重度**：高

**检测逻辑**：
```
对每个 AUTH-ID：
  统计有多少个 Spec 的 frontmatter related_req 包含它（D4：任意时刻唯一）
  若 count > 1
  → R5 命中
```

**修复建议**（按推荐顺序）：
1. **拆 AUTH**（推荐）：`AUTH-10` → `AUTH-10a` + `AUTH-10b`，分别归属各自 Spec
2. **整体迁移**：若一个是历史 spec、一个是本次新 spec 接管，新 spec 应通过 `[已有·扩展]` / `[已有·修改]` 标注承接，旧 spec 失去 ownership（详见 [`../../spec-writer-skill/references/req-convergence.md`](../../spec-writer-skill/references/req-convergence.md) §1.1）
3. **修正 Spec**：从误联的 Spec 移除引用

> D4 是 **lifelong 唯一**（任意时刻只能一个 spec 持有），**不是** per-change 唯一。归属可在迭代间整体迁移，但不允许"两个 spec 同时声称持有同一 AUTH"。

---

### R6 — Tasks 完成但账本未 ship

**严重度**：中

**检测逻辑**：
```
对每个 change：
  若 tasks.md 全部 [x] 且 frontmatter related_req 非空
  且 REQUIREMENTS.md 中对应 AUTH 仍为 [ ]
  → R6 命中
```

**修复建议**：跑 `RBK U4 ship` 触发账本打勾。

---

### R7 — 账本已 ship 但 Tasks 未完成

**严重度**：高（可能是用户违反 M6 手动改了 checkbox）

**检测逻辑**：
```
对 REQUIREMENTS.md 中 [x] 的 AUTH：
  找到关联 Spec 的 tasks.md
  若 tasks 仍有未完成项 [ ]
  → R7 命中
```

**修复建议**：
1. 核对实际状态：是 tasks 真没做完，还是只是没勾选？
2. 若 tasks 实际未完成：将账本对应 AUTH 从 `[x]` 改回 `[ ]`（手动审慎操作）
3. 若 tasks 实际完成只是没勾：补勾 tasks，再跑 audit 复查

---

### R8 — Out of Scope 的 AUTH-ID 仍被 Spec 引用

**严重度**：中

**检测逻辑**：
```
对 REQUIREMENTS.md 中 ## Out of Scope 表格的 AUTH-ID：
  扫描所有 Spec 的 related_req / 关联 REQ
  若仍有引用
  → R8 命中
```

**修复建议**：
- 业务变化要做了：从 Out of Scope 移除，跑 U2 重新登记到 v1/v2
- 误引用：从 Spec 移除引用

---

### R9 — `[已有·废弃]` AUTH 缺迁移路径

**严重度**：高

**检测逻辑**：
```
对所有 docs/spec/{*}/specs/*.md：
  扫描行级标注 `[已有·废弃]` 的 AUTH 条目
  若紧邻段落缺 `迁移路径：` 或 `兼容期窗口：` 子句
  → R9 命中
```

**修复建议**：在 spec 中按 [`../../spec-writer-skill/references/diff-and-migration.md`](../../spec-writer-skill/references/diff-and-migration.md) 补全迁移路径与兼容期窗口；账本层面在该 AUTH 上线后再触发 U4 ship 打勾。

---

### R10 — `reference_specs` 路径不可达

**严重度**：中

**检测逻辑**：
```
对所有 docs/spec/{*}/specs/*.md：
  读 frontmatter reference_specs（spec 视角=既有锚）
  若任一路径在仓库中不存在
  → R10 命中
```

**修复建议**：删除失效引用，或确认目标 spec 路径并更新；本规则与 spec-wf 的 [`scripts/validate.mjs`](../../scripts/validate.mjs) I-E 形成互补（前者校验路径可达，后者校验 AUTH 唯一所有权）。

---

### R11 — `req_ledger_state: missing` 但账本已存在

**严重度**：低

**检测逻辑**：
```
对所有 docs/spec/{*}/proposal.md：
  若 frontmatter req_ledger_state == "missing"
  且 docs/spec/REQUIREMENTS.md 实际存在
  → R11 命中
```

**修复建议**：通常是 proposal 起草时账本尚未建好，事后建好后未回填字段。让 proposal-writer 修正 `req_ledger_state` 为 `present` 或 `skipped`（按实际意图）。

---

### R12 — 增量标注 5 项闭集与 `change_mode` 联动违例

**严重度**：中

**检测逻辑**：
```
对所有 docs/spec/{*}/specs/*.md：
  扫描行级标注是否 ⊆ 5 项闭集 {[新增], [已有·扩展], [已有·修改], [已有·废弃], [已有·仅引用]}
  ↓
  若出现自创标注（如 [改造] / [迁移] / [重命名]） → R12 命中
  ↓
  按 frontmatter.change_mode 校验联动：
    - change_mode == refactor 但全文无 [已有·修改] 或 [已有·废弃] → R12 命中
    - change_mode == bugfix 但全文无 [已有·修改] → R12 命中
    - change_mode == extend 但全文无 [已有·扩展] 或 [已有·仅引用] → R12 命中
```

**修复建议**：
- 自创标注 → 改写为闭集中的等效标注（语义对照见 [`../../shared/contracts/change-verbs.md`](../../shared/contracts/change-verbs.md)）
- change_mode 联动违例 → 要么修正 change_mode，要么在 spec 正文补齐对应标注（详见 [`../../spec-writer-skill/references/increment-annotation.md`](../../spec-writer-skill/references/increment-annotation.md) §4）

> 该规则与 [`scripts/validate.mjs`](../../scripts/validate.mjs) C1-C6 不重叠：validator 校验 frontmatter 枚举，本规则校验**正文行级标注**。

---

## 严重度分级

| 级别   | 标志        | 说明                                 |
| ------ | ----------- | ------------------------------------ |
| HIGH   | `[HIGH]`    | 数据不一致，可能误导决策；优先修复   |
| MEDIUM | `[MEDIUM]`  | 流程瑕疵，影响可读性；尽快处理       |
| LOW    | `[LOW]`     | 提醒类信息，不强制修复               |

---

## 报告输出建议

- 默认输出到对话（用户可见）
- 可选写入 `docs/spec/AUDIT-{YYYY-MM-DD}.md`（用户显式要求时）
- audit 不修改任何文件（M4 + M7）

---

## 自检清单（U6 执行前）

- [ ] 已读取 `docs/spec/REQUIREMENTS.md`
- [ ] 已读取 `docs/spec/ROADMAP.md`（如存在）
- [ ] 已扫描所有 `docs/spec/{*}/specs/*.md`
- [ ] 已扫描所有 `docs/spec/{*}/tasks.md`
- [ ] 已按 R1–R12 规则全部跑一遍
- [ ] 报告按严重度分组，每条问题含文件路径与建议