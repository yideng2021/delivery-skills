# Frontmatter Schema — 唯一数据契约

> **本文件是 v2 全部模板 frontmatter 字段的唯一权威定义**。
> 任何 skill / workflow / template 的 frontmatter 字段拼写、取值、必填性必须以此为准；
> 引用时**只能链接**，不得复述字段语义。

---

## §1 字段总表

> 表内"描述"列为**一句话语义摘要**，便于查表；完整语义见 §2。

| # | 字段 | 描述 | 出现位置 | 写入方 | 读取方 | 取值 | 必填 |
|---|------|------|---------|--------|--------|------|------|
| 1 | `change_name` | 本次 change 的全局唯一标识，决定 `docs/spec/{change_name}/` 路径 | proposal / specs / design / tasks | proposal-writer | 全部 | string (kebab-case) | ✅ |
| 2 | `status` | 文档生命周期状态；驱动 workflow 阶段转移 | proposal / specs / design / tasks | 各 skill | workflow | `draft` \| `reviewed` | ✅ |
| 3 | `change_mode` | 本次 change 相对既有工程的增量性质；决定下游增量字段强约束程度 | proposal / specs / design | proposal-writer / spec-writer / design-writer | spec-writer / design-writer / workflow / audit | `greenfield` \| `extend` \| `refactor` \| `bugfix` | ✅ |
| 4 | `req_ledger_state` | proposal 起草时项目级需求账本的存在状态 | proposal | proposal-writer | RBK / workflow | `present` \| `missing` \| `skipped` | ✅ |
| 5 | `related_req_proposal` | proposal 阶段用户声明的本次关联 AUTH-ID 列表（待 spec 收敛） | proposal | proposal-writer | spec-writer | `[AUTH-xx, ...]` 或 `[]` | ✅ |
| 6 | `related_req` | spec 文件最终关联的 AUTH-ID 列表（D4：一 AUTH 一 spec） | specs | spec-writer | RBK / task-decomposer | `[AUTH-xx, ...]` 或 `[]` | ✅ |
| 7a | `reference_specs` | spec 视角:本 spec 关联的**既有 spec** 路径/ID 列表(增量追溯锚) | specs | spec-writer | audit | `[path \| spec-id, ...]` 或 `[]` | ✅ |
| 7b | `produced_specs` | design 视角:design 引用的**本 change 自产** spec 路径列表 | design | design-writer | task-decomposer / audit | `[specs/{capability}.md, ...]` | ✅(至少 1 条) |
| 8 | `touched_capabilities` | 本次 spec 触达的既有 Capability 名称列表，与 proposal §0.1 一一对应 | specs | spec-writer | workflow / audit | `[capability-name, ...]` 或 `[]` | ✅（`change_mode != greenfield` 时非空） |
| 9 | `impacted_modules` | 本次 spec 影响的既有模块/服务/接口列表，与 proposal §0.2 一一对应 | specs | spec-writer | task-decomposer / audit | `[module-path \| service-name, ...]` 或 `[]` | ✅（`change_mode != greenfield` 时非空） |
| 10 | `milestone` | 可选里程碑标签（如 `v1.0`），由 RBK 解读 | specs | spec-writer | RBK | string 或 `—` | ⛔ |
| 11 | `architecture_refs` | design 引用的项目总体架构文档对象列表（**活字段**：每项含 `path` + `usage`，`usage` ∈ {`沿用`,`扩展`,`约束`,`替换`}） | design | design-writer | audit | `[{path: str, usage: enum}, ...]` 或 `[]` | ✅ |
| 12 | `domain_modeling_level` | 本 change 的领域建模深度（L1/L2/L3）；L3 需用户确认 | design / tasks | design-writer | task-decomposer / workflow | `L1` \| `L2` \| `L3` | ✅ |
| 13 | `domain_model_mode` | design §2.2 战术建模段是否展开（`extended` 仅 L3 合法） | design | design-writer | design 自身 §2.2 出现条件 | `omit` \| `extended` | ✅ |
| 14 | `bounded_contexts` | design 识别出的限界上下文清单；tasks 沿用做 `BC × 承接方` 切分 | design / tasks | design-writer | task-decomposer | `[BC-name, ...]` | L2/L3 必填；L1 取 `[]` |
| 15 | `related_design` | tasks 关联的 design.md 路径 | tasks | task-decomposer | workflow | path（指向 design.md） | ✅ |
| 16 | `handover_domains` | 本 change 涉及的承接域子集（5 枚举闭集） | tasks | task-decomposer | 下游 dev skill | 子集 of {database, backend, frontend, integration, infra} | ✅ |
| 17 | `exc_status` | tasks 整体执行状态；驱动 workflow `tasks → writeback` 转移 | tasks | task-decomposer | workflow | `pending` \| `in_progress` \| `done` | ✅ |
| 18 | `shipped_us` | writeback 时由 workflow 从各 spec L4 DoD 扫描的已交付 US 列表 | tasks（writeback 时由 workflow 注入） | workflow | RBK | `[US-xxx, ...]` 或 `[]` | writeback 时必填 |
| 19 | `reused_modules` | design 视角=本次设计**复用 / 触达的既有模块**列表；与 spec `impacted_modules` 做语义升级（被触达 → 被复用 + 增量标注） | design | design-writer | task-decomposer / audit | `[{path: str, annotation: enum}, ...]` 或 `[]` | ✅（`change_mode != greenfield` 时非空） |
| 20 | `bc_relations` | 本 change 涉及的 **BC 与既有 BC 的关系**清单（DDD Context Map 精简词表）；驱动 §2.1 BC 表"关系"列 | design | design-writer | audit | `[{bc: BC-name, relation: enum, refers_to: BC-name?}, ...]` 或 `[]` | ✅（`domain_modeling_level != L1` 时非空） |

> 字段拼写一律 **snake_case**；枚举值一律 **小写英文**；空值见 [`empty-value-convention.md`](./empty-value-convention.md)。
>
> **历史兼容(v2 → v3)**:原 `related_specs` 字段已按视角拆分为 `reference_specs`(spec 视角=既有锚) 与 `produced_specs`(design 视角=本 change 自产)。两字段语义正交、不再同名异义。

---

## §2 字段语义（一句话）

- `change_name`：本次 change 的全局唯一标识，决定`docs/spec/{change_name}/` 路径。
- `status`：文档生命周期状态。`draft` = 起草中；`reviewed` = 通过 CDR 审查可进入下一阶段。
- `change_mode`：本次 change 相对既有工程的增量性质。`greenfield` = 纯新建（§0 既有资产盘点全为\"无\"）；`extend` = 在既有功能上增量扩展；`refactor` = 既有功能语义变化或结构重组；`bugfix` = 修复既有缺陷。**该字段决定下游 spec 中增量字段（实体属性 Diff / AC 迁移映射 / 增量闭环 DoD）的强约束程度**；非 `greenfield` 时增量标注与 Diff 表强制。
- `req_ledger_state`：proposal 起草时项目级需求账本 (`docs/spec/REQUIREMENTS.md`) 的存在状态。`present` = 存在；`missing` = 不存在；`skipped` = 用户显式跳过账本对齐。
- `related_req_proposal`：用户在 proposal 阶段声明的、本次 change 关联的 AUTH-ID 列表（待 spec-writer 进一步收敛）。
- `related_req`：spec 文件最终关联的 AUTH-ID 列表。**D4 强约束**：一条 AUTH 只能归属一个 spec。
- `reference_specs`：spec 视角字段 = 本 spec 关联的**既有 spec** 路径或 spec-id 列表(增量追溯锚,与 proposal §0.1 一一对应)。`greenfield` 时取 `[]`。
- `produced_specs`:design 视角字段 = design 引用的**本 change 自身产出**的 specs 文件路径列表;必须覆盖 `docs/spec/{change_name}/specs/` 下的所有 spec(至少 1 条)。
- `touched_capabilities`：本次 spec 触达的既有 Capability 名称列表（kebab-case），与 proposal §0.1 / §3.1 触达的既有 Capability 一一对应。`greenfield` 时取 `[]`。
- `impacted_modules`：本次 spec 影响的既有代码模块 / 服务 / 接口列表（机器可读路径或服务名），与 proposal §0.2 一一对应。`greenfield` 时取 `[]`。
- `milestone`：可选里程碑标签（如 `v1.0`），由 RBK 解读。
- `architecture_refs`：design 引用的项目总体架构文档列表。**活字段**：每项含 `path`（相对路径）+ `usage`（用途，闭集 `{沿用, 扩展, 约束, 替换}`）。例如：`[{path: docs/ARCHITECTURE.md, usage: 约束}, {path: docs/auth-arch.md, usage: 扩展}]`。`usage` 决定该引用在 §1 / §5 ADR 中如何被消费——`沿用 / 扩展 / 替换` 必须在 §3 模块清单或 §5 ADR 中有对应落点；`约束` 仅作为越界守卫（不允许突破的边界）。
- `reused_modules`：design 视角的"既有模块复用清单"。每项含 `path`（机器可读路径或服务名，与 spec `impacted_modules` 对齐）+ `annotation`（增量标注 5 项闭集 `{[新增], [已有·仅引用], [已有·扩展], [已有·修改], [已有·废弃]}`）。**与 spec `impacted_modules` 的语义升级关系**：`impacted_modules` 描述"业务级被触达的模块"，`reused_modules` 描述"架构级如何被复用 / 修改 / 废弃"。约束：`reused_modules.path` 必须 ⊇ `impacted_modules`（design 不允许遗漏 spec 已声明的影响）。
- `bc_relations`：本 change 涉及的 BC 与既有 BC 的关系清单，承载 §2.1 BC 表"关系"列。每项含 `bc`（本 change 涉及的 BC 名称，与 `bounded_contexts` 中的元素对应）+ `relation`（DDD Context Map 精简词表 `{沿用, 扩展, 新建, ACL隔离, 替换}`）+ `refers_to`（仅当 `relation != 新建` 时填，指向既有 BC 名称，可为外部 BC 字符串）。`L1` 场景取 `[]`；`L2 / L3` 必非空。
- `domain_modeling_level`：本 change 的领域建模深度（L1/L2/L3），权威判定见 [`design-writer-skill/references/domain-modeling-depth.md`](../../design-writer-skill/references/domain-modeling-depth.md)。
- `domain_model_mode`：design §2.2 战术建模段是否展开。`omit` = 不展开；`extended` = 展开（仅 L3 允许）。
- `bounded_contexts`：design 识别出的限界上下文清单。tasks 沿用以做 `BC × 承接方` 切分。
- `related_design`：tasks 关联的 design.md 路径。
- `handover_domains`：本 change 涉及的承接域子集。枚举闭集见 [`handover-domains.md`](./handover-domains.md)。
- `exc_status`：tasks 整体执行状态，驱动 workflow `tasks → writeback` 转移。
- `shipped_us`：writeback 阶段由 workflow 扫描各 spec 的 L4 DoD 已勾选 `[x]` 的 US 列表，用于 RBK 打勾。

---

## §3 字段写读流（数据契约即解耦）

```
proposal-writer ──写──▶ change_name, status, change_mode,
                       req_ledger_state, related_req_proposal
                                          │
                  spec-writer ──读──▶ related_req_proposal, change_mode
                  spec-writer ──写──▶ change_name, status, change_mode,
                                     related_req, reference_specs,
                                     touched_capabilities, impacted_modules, milestone
                                          │
                  design-writer ──读──▶ change_mode, related_req（追溯）,
                                       touched_capabilities, impacted_modules（架构上下文锚）
                  design-writer ──写──▶ change_name, status, change_mode（沿用 spec）,
                                       produced_specs, architecture_refs（活字段 path+usage）,
                                       domain_modeling_level, domain_model_mode,
                                       bounded_contexts, reused_modules, bc_relations
                                          │
                task-decomposer ──读──▶ domain_modeling_level, bounded_contexts,
                                       produced_specs, impacted_modules,
                                       reused_modules（决定新建 vs 改造工单）, bc_relations
                task-decomposer ──写──▶ change_name, status, related_design,
                                       domain_modeling_level, bounded_contexts,
                                       handover_domains, exc_status
                                          │
                       workflow ──读──▶ 各 file.status / tasks.exc_status / change_mode
                       workflow ──写──▶ tasks.shipped_us（writeback 时）
                                          │
                            RBK ──监听─▶ req_ledger_state / related_req / shipped_us
```

> **零命令名耦合**：RBK 通过监听上表字段被动协作，不出现在任何 skill 的"调用"链中。

---

## §4 取值与格式细则

### §4.1 列表类字段

- 列表以 YAML 数组写入：`related_req: [AUTH-01, AUTH-04]`。
- 空列表统一写为 `[]`；不允许 `null` / 空字符串 / 省略键。
- 列表元素之间不允许空白行。

### §4.2 ID 命名规则

| 字段 | 命名格式 | 示例 |
|------|----------|------|
| `change_name` | kebab-case | `user-signup` |
| `related_req_proposal` / `related_req` 元素 | `AUTH-{编号}` | `AUTH-01` |
| `reference_specs` 元素(spec 视角=既有锚) | spec-id 或 `specs/{capability}.md` 相对路径 | `specs/auth-base.md` |
| `produced_specs` 元素(design 视角=自产路径) | `specs/{capability}.md` 相对路径 | `specs/user-signup.md` |
| `touched_capabilities` 元素 | kebab-case | `user-signup` |
| `impacted_modules` 元素 | 机器可读路径或服务名 | `services/order-api` |
| `bounded_contexts` 元素 | `BC-{kebab}` | `BC-order` |
| `handover_domains` 元素 | 小写英文枚举 | `backend` |
| `shipped_us` 元素 | `US-{编号}` | `US-101` |
| `architecture_refs` 元素 | 对象 `{path, usage}` | `{path: docs/auth-arch.md, usage: 扩展}` |
| `reused_modules` 元素 | 对象 `{path, annotation}` | `{path: services/user-service, annotation: '[已有·扩展]'}` |
| `bc_relations` 元素 | 对象 `{bc, relation, refers_to?}` | `{bc: BC-order, relation: 扩展, refers_to: BC-base-order}` |

### §4.3 枚举闭集

- `status` ∈ {`draft`, `reviewed`, `needs_revision`, `escalated`} — 后两值由 workflow 失败降级路径写入,详见 [`../../spec-design-workflow/references/failure-recovery.md`](../../spec-design-workflow/references/failure-recovery.md)
- `change_mode` ∈ {`greenfield`, `extend`, `refactor`, `bugfix`}
- `req_ledger_state` ∈ {`present`, `missing`, `skipped`}
- `domain_modeling_level` ∈ {`L1`, `L2`, `L3`}
- `domain_model_mode` ∈ {`omit`, `extended`}（`extended` 仅 `L3` 合法）
- `exc_status` ∈ {`pending`, `in_progress`, `done`, `writeback_failed`} — `writeback_failed` 由 workflow writeback 异常时注入
- `handover_domains` ⊆ {`database`, `backend`, `frontend`, `integration`, `infra`}
- `architecture_refs.usage` ∈ {`沿用`, `扩展`, `约束`, `替换`}
- `reused_modules.annotation` ∈ 5 项闭集 {`[新增]`, `[已有·仅引用]`, `[已有·扩展]`, `[已有·修改]`, `[已有·废弃]`}
- `bc_relations.relation` ∈ {`沿用`, `扩展`, `新建`, `ACL隔离`, `替换`}

> 上述 3 个动词类枚举的**语义统一来源**:[`change-verbs.md`](./change-verbs.md) §2(`reused_modules.annotation` / `bc_relations.relation` / `architecture_refs.usage` 三行)。新增词条必须先扩 change-verbs.md 再同步本节。
> 任何枚举之外的取值视为非法 frontmatter,workflow 校验时拒绝转移。

---

## §5 必填与降级

- 标 ✅ 的字段在对应模板初始化时必须存在（即使取空值 `[]` / `—`）。
- `bounded_contexts` 在 L1 场景取 `[]`，仍必须存在 key。
- `change_mode == greenfield` 时,`touched_capabilities` / `impacted_modules` / `reference_specs`(spec 视角)可取 `[]`,但**键必须存在**(证明已主动思考)。
- `change_mode != greenfield` 时,`touched_capabilities` / `impacted_modules` / `reference_specs`(spec 视角)三者**至少一个非空**;三者全空时审计拒绝转移(视为应改 `change_mode: greenfield`)。
- `produced_specs`(design 视角)必填且**至少 1 条**,greenfield 同样必填(design 至少自产 1 个 spec)。
- **design 视角的增量退化**：`change_mode == greenfield` 时 `reused_modules` / `bc_relations` 可取 `[]`，但键必存。`change_mode != greenfield` 时 `reused_modules` 必非空（design 必须显式声明复用对象）。
- **`bc_relations` 与 `domain_modeling_level` 联动**：`L1` 时 `bc_relations` 取 `[]`；`L2 / L3` 时必非空（每个 `bc` ⊆ `bounded_contexts`）。
- **`architecture_refs` 活字段语义**：键必存；`change_mode != greenfield` 且 §1 引用了既有架构时必非空；每项必含 `path` + `usage` 两子字段，缺一为非法。
- `shipped_us` 仅在 workflow 进入 `tasks → writeback` 时由 workflow 注入；task-decomposer **不**写入此字段。

---

## §6 兼容性约束

- 字段一旦发布，**不得重命名 / 不得改变取值语义 / 不得删除**；新增字段必须先扩充本文件。
- 模板文件（`templates/*.md`）的 frontmatter 字段集必须 ⊆ §1 表；模板内出现 §1 之外的字段视为违例。
- workflow 状态机的转移条件只能引用本文件 §1 的字段；禁止臆造字段。
- **历史兼容(v2 → v3)**:原 `related_specs` 字段已拆分;不允许再在任何 frontmatter 中出现 `related_specs` 键名(audit 即时拒绝)。

---

## §7 与其他 shared 文档的边界

- 字段语义中涉及 INV/AC/DoD 的概念定义 → 见 [`ac-vocabulary.md`](./ac-vocabulary.md)，本文件不复述。
- 字段空值表达细则 → 见 [`empty-value-convention.md`](./empty-value-convention.md)，本文件仅列示例。
- `handover_domains` 5 个枚举的语义与举例 → 见 [`handover-domains.md`](./handover-domains.md)，本文件仅列闭集。
- 字段在阶段间的握手描述（"何时谁监听何字段"）由 workflow 阶段的 `references/handshake-rbk.md` 落地，本文仅给静态定义。

---

## §8 模板示例（仅作 frontmatter 初始化参考，不含正文）

### proposal.md
```yaml
---
change_name: user-signup
status: draft
change_mode: extend
req_ledger_state: missing
related_req_proposal: []
---
```

### specs/{capability}.md
```yaml
---
change_name: user-signup
status: draft
change_mode: extend
related_req: []
reference_specs: []         # spec 视角:既有 spec 锚(增量追溯);greenfield 写 []
touched_capabilities: []    # 既有 Capability;greenfield 写 []
impacted_modules: []        # 既有模块/服务；greenfield 写 []
milestone: —
---
```

### design.md
```yaml
---
change_name: user-signup
status: draft
change_mode: extend            # 沿用 spec.change_mode
produced_specs: [specs/user-signup.md]  # design 视角:本 change 自产 spec(至少 1 条)
architecture_refs: []          # 活字段：[{path, usage}, ...]；greenfield 写 []
domain_modeling_level: L1
domain_model_mode: omit
bounded_contexts: []
reused_modules: []             # design 视角：[{path, annotation}, ...]；greenfield 写 []
bc_relations: []               # L1 写 []；L2/L3 必非空
---
```

### tasks.md
```yaml
---
change_name: user-signup
status: draft
related_design: design.md
domain_modeling_level: L1
bounded_contexts: []
handover_domains: [backend]
exc_status: pending
---
```