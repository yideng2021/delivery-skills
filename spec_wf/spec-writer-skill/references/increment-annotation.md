# 增量标注规则

> spec 文件中每条 US / INV / AC / 业务实体 / 业务关系 / 合规约束 / 关键术语，**必须**用以下五种标注之一显式标记本次 change 的增量性质。
> 标注是 D2 强约束，workflow 在 audit 阶段会校验全覆盖；`change_mode != greenfield` 时**强制**，`greenfield` 时全部默认 `[新增]` 可省略行级标注。
>
> Diff 表与 AC 迁移映射的具体写法外引 [`./diff-and-migration.md`](./diff-and-migration.md)，本文件仅给标注语义闭集。

---

## §1 五种标注闭集

**语义来源**:本表 5 个标注是 [`../../shared/contracts/change-verbs.md`](../../shared/contracts/change-verbs.md) 词表的 sub-select(对应「增量标注 5 项」行)。词义不在此复述,只给本场景的「触发义务」与「适用层」。

| 标注 | 触发义务 | 适用层 |
|------|---------|--------|
| `[新增]` | 无 | L1 / L2 / L3 |
| `[已有·仅引用]` | 必须给出**既有 spec 路径或 spec-id**作为来源(来源可为历史 change 已落地的 spec,也可为本次 change 同批产出的 spec;后者由 workflow audit 校验目标 spec 在其 `related_req` 中确实持有该 AUTH) | L0 / L1 / L2 / L3 |
| `[已有·扩展]` | 必须显式给出"**扩展点**"一句话说明 | L1 / L2 / L3 |
| `[已有·修改]` | 必须给出"**原 → 新 diff**"(见 [`./diff-and-migration.md`](./diff-and-migration.md)) | L2 实体属性 / L2 INV / L3 REQ / L0 合规 / L0 术语 |
| `[已有·废弃]` | 必须给出**迁移路径**与**兼容期窗口** | L1 / L2 INV / L3 REQ / L0 合规 |

> **闭集不可扩充**(语义见 change-verbs §4):自创 `[改造]` / `[迁移]` / `[重命名]` 等标注一律违例。
> L0 业务上下文以**章节级 L0.x 既有上下文衔接表**承载增量(见 specs.md L0.x),不在条目级标注;L4 DoD 通过"增量闭环 AC"段承载,也不在条目级标注。

---

## §2 标注位置与紧邻义务

每条 US / INV / AC / 实体 / 关系 / 合规 / 术语标题后**紧跟**标注：

```markdown
- `[新增]` **US-1**：作为访客，我希望 ……
- `[已有·扩展]` **INV-1**：邮箱唯一性约束 — **扩展点**：增加跨租户唯一性
- `[已有·修改]` **REQ-3** {标题}
  - **既有 REQ 引用**：`specs/auth-base.md#REQ-12`
  - **行为 Diff**：见下方 Diff 表（[`./diff-and-migration.md`](./diff-and-migration.md) §2）
- `[已有·废弃]` **INV-7**：原\"邮箱唯一性\"约束
  - **迁移路径**：由 INV-1（跨租户唯一性）取代；旧用例改写指引见 `docs/migration/inv-7.md`
  - **兼容期窗口**：v2.3 起冻结写入，v2.5 起拒绝，v3.0 删除
- `[已有·仅引用]` **依赖业务能力**：用户认证（来源：`specs/auth-base.md`）
```

**紧邻义务三条铁律**：

1. `[已有·扩展]` 必须在同一 bullet 或紧邻段落显式给出 `**扩展点**：……`
2. `[已有·修改]` 必须配套 Diff 表（实体 Diff / 行为 Diff / AC 迁移映射，按层归口）
3. `[已有·废弃]` 必须同时给出**迁移路径**与**兼容期窗口**两要素

---

## §3 标注与 frontmatter 字段的关系

| 标注 | 是否进入本 spec 的 `related_req` | 是否进入 `touched_capabilities` / `impacted_modules` |
|------|-------------------------------|-----------------------------------------------------|
| `[新增]` | ✅ 必须 | `touched_capabilities` 可空；`impacted_modules` 视下游而定 |
| `[已有·扩展]` | ✅ 必须 | ✅ 必须出现在 `touched_capabilities`（被扩展的既有 Capability） |
| `[已有·修改]` | ✅ 必须 | ✅ 必须出现在 `touched_capabilities` 与 `impacted_modules` |
| `[已有·废弃]` | ✅ 必须 | ✅ 必须出现在 `touched_capabilities` 与 `impacted_modules` |
| `[已有·仅引用]` | ❌ 禁止（由其归属 spec 持有） | ❌ 不进入（仅在正文 / `reference_specs` 中追溯） |

> **D4 强约束**：一条 AUTH-ID 只能归属一个 spec。`[已有·仅引用]` 不\"持有\"AUTH，只在追溯链中提及，对应字段载体是 `reference_specs`（spec 视角 = 既有 spec 锚），见 [`../../shared/contracts/frontmatter-schema.md`](../../shared/contracts/frontmatter-schema.md) §2。

---

## §4 与 `change_mode` 的联动

| `change_mode` | 行级增量标注 | Diff 表 / 迁移映射 | L0.x 既有上下文衔接 |
|---------------|-------------|-------------------|---------------------|
| `greenfield` | **可全省略**（默认 `[新增]`） | 不出现 | 不出现 |
| `extend` | **强制**：至少 1 条 `[已有·扩展]` 或 `[已有·仅引用]` | `[已有·扩展]` 不必 Diff；其他强制 | 强制（至少 1 行） |
| `refactor` | **强制**：至少 1 条 `[已有·修改]` 或 `[已有·废弃]` | `[已有·修改]` / `[已有·废弃]` 强制 | 强制 |
| `bugfix` | **强制**：至 1 条 `[已有·修改]` | `[已有·修改]` 必带 Diff | 强制 |

`change_mode != greenfield` 时正文若**完全没有任何非 `[新增]` 的标注**，审计判定为\"应改 `change_mode: greenfield`\"，拒绝转移。

---

## §5 反模式

- ❌ 漏标（任意 US / INV / AC / 实体等条目无标注）→ checklist §2 拒绝通过
- ❌ `[已有·扩展]` 不给扩展点 → checklist §2 拒绝通过
- ❌ `[已有·修改]` 无 Diff 表 → checklist §2 拒绝通过
- ❌ `[已有·废弃]` 缺迁移路径或兼容期窗口 → checklist §2 拒绝通过
- ❌ `[已有·仅引用]` 的 AUTH 写进本 spec `related_req` → checklist §1 / §3 拒绝通过
- ❌ 自创标注（`[改造]` / `[迁移]` / `[重命名]` 等）→ 闭集不可扩充
- ❌ 在 L0 条目 / L4 checkbox 上写行级标注 → 标注仅适用于 L1/L2/L3（L0 用 L0.x 段、L4 用增量闭环段）
- ❌ `change_mode: refactor` 但全文无 `[已有·修改]` / `[已有·废弃]` → §4 强约束违例

---

## §6 与 design / tasks 的衔接

design-writer 与 task-decomposer 通过 `reference_specs` 读取本 spec 时：

- `[新增]` / `[已有·扩展]` / `[已有·修改]` 条目 → 必须落到 design 模块对外契约中
- `[已有·废弃]` 条目 → design 必须给出\"对外契约下线 / 替代映射\"，task-decomposer 须为废弃路径生成迁移工单
- `[已有·仅引用]` 条目 → 仅作追溯，design 不必新增模块

衔接规则的具体校验在 design / tasks 各自 checklist 中，本文件仅给标注语义闭集。

---

## §7 校验规则（供 Stage 4 审计）

- 全文 grep 所有 `[新增]` / `[已有·...]` 字面量必须 ⊆ §1 五项闭集
- `change_mode != greenfield` 时，正文非 `[新增]` 标注计数 ≥ 1
- 每条 `[已有·扩展]` 紧邻 `**扩展点**：` 子句
- 每条 `[已有·修改]` 紧邻 Diff 表（实体 Diff / 行为 Diff / AC 迁移映射任一）
- 每条 `[已有·废弃]` 紧邻 `**迁移路径**：` 与 `**兼容期窗口**：` 两子句