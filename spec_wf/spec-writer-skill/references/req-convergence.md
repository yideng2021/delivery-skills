# `related_req_proposal` → `related_req` 收敛规则

> 本文件是 spec 阶段把 proposal frontmatter `related_req_proposal` 收敛为 spec frontmatter `related_req` 的**唯一权威**。
> 字段语义见 [`../../shared/contracts/frontmatter-schema.md`](../../shared/contracts/frontmatter-schema.md);标注规则见 [`./increment-annotation.md`](./increment-annotation.md)。
> 本文件**裁决** Stage 1 遗留的 Q1-2 / Q1-3 与 Stage 2.1 遗留的 Q2.1-3。

---

## §1 收敛是什么

proposal 阶段产出 `related_req_proposal`(用户声明的"本次 change 关联的 AUTH-ID 列表",**未经裁决**)。
spec 阶段必须将这份列表**裁决**为多个 spec 各自的 `related_req`,满足:

- **D4 强约束**:一条 AUTH-ID 只能归属一个 spec(不允许两个 spec 同时持有同一 AUTH)
- **完整性**:`related_req_proposal` 中每个 `[新增] / [已有·扩展] / [已有·修改] / [已有·废弃]` 性质的 AUTH 必须落入某个 spec 的 `related_req`(C5-2 闭集扩 5 项)
- **可追溯**:`[已有·仅引用]` 的 AUTH 在本次 change 各 spec 中**不出现于 `related_req`**,只在正文 / `reference_specs`(spec 视角)标注追溯

### §1.1 D4 的时间语义(归属唯一 = 任意时刻唯一)

D4 的"唯一归属"在**任意时刻**成立(lifelong 唯一),**不是** per-change 唯一。具体语义:

- **`[新增]`** → 新 spec 取得 AUTH 的**首次**归属权,RBK 账本新增一行 `auth_id → spec_path`。
- **`[已有·扩展]` / `[已有·修改]`** → AUTH 的归属权从历史 spec **整体迁移**到本 change 的新 spec(取代既有归属);历史 spec 自此失去 ownership,不再持有该 AUTH 的任何版本片段。Diff 表(详见 [`./diff-and-migration.md`](./diff-and-migration.md))承载"接管前后契约差异"的可追溯记录,但 ownership 本身**不分裂**。
- **`[已有·废弃]`** → 归属权先迁移到本 change 的新 spec(用于声明下线流程),兼容期结束后从账本移除。
- **`[已有·仅引用]`** → 归属权**不动**,仍由历史 spec 持有;新 spec 只是消费它,不接管。

**反模式**(违反 §1.1 即视为破坏 D4):

- ❌ "历史 spec 持有 AUTH 的旧版本,新 spec 持有新版本" —— **不允许**。AUTH 没有"版本片段"概念,只有当前唯一 owner + 历史 Diff 记录。
- ❌ "AUTH 在不同 change 之间由不同 spec 各自声称 own" —— **不允许**。RBK 账本 `auth_id → spec_path` 是单值外键,任何时刻只指向一个 owner。
- ❌ 把 `[已有·修改]` / `[已有·扩展]` 描述为"新 spec **引用** 历史 spec 的 AUTH" —— **用词违规**。这两种标注的语义是**接管/改造**,不是引用;"引用"一词只保留给 `[已有·仅引用]`。

> **类比**:AUTH 归属权类似产权证,任何时刻只有一张、在一个 owner 手中。Diff 表是"过户记录",不是"额外的产权证"。

---

## §2 三阶段收敛流程

### §2.1 拆分能力

按 capability(kebab-case)把本次 change 拆为 N 个 spec 文件,每文件 1 个 capability。
拆分依据 = proposal §3 Capability Map(已 P0/P1 标注)。

### §2.2 分配 AUTH

对 `related_req_proposal` 中每个 AUTH-ID,执行下表决策:

| 输入 | 决策 | 落点 |
|------|------|------|
| 该 AUTH 性质 = `[新增]` 或 `[已有·扩展]`,且对应到 capability X | 写入 `specs/X.md` 的 `related_req` | spec X 持有 |
| 该 AUTH 性质 = `[已有·修改]`,且对应到 capability X | 写入 `specs/X.md` 的 `related_req`;正文配套 Diff 表(详见 [`./diff-and-migration.md`](./diff-and-migration.md)) | spec X 持有(取代既有归属) |
| 该 AUTH 性质 = `[已有·废弃]`,且对应到 capability X | 写入 `specs/X.md` 的 `related_req`;正文给出迁移路径 + 兼容期窗口 | spec X 持有(后续 ship 后从账本移除) |
| 该 AUTH 性质 = `[已有·仅引用]` | **不**写入任何 spec 的 `related_req`,只在正文以 `[已有·仅引用]` 标注 + `reference_specs`(spec 视角)记录来源 | 由其归属 spec(可能在历史 change,也可能在本次 change 同批产出)持有 |
| 该 AUTH 跨多个 capability | **拆 AUTH** 或 **合并 capability**(详见 §4) | 必须二选一,不允许多归属 |

> **同 change 内 spec 间复用**(`[已有·仅引用]` 的特例):
> 当本次 change 同批产出 spec-X(持有 `AUTH-foo`)与 spec-Y(需在自己 capability 内组合调用 `AUTH-foo`)时,**合法处理**:
> - spec-Y 的 `related_req` **不**包含 `AUTH-foo`(D4:owner 只能是 spec-X)
> - spec-Y 正文以 `[已有·仅引用] **依赖业务能力**:{AUTH-foo 标题}(来源:本 change 同批 specs/X.md)` 标注
> - spec-Y 的 `reference_specs` 加入 `specs/X.md` 相对路径
> - 反向校验(§2.3)时,该 AUTH 在 spec-X 的 `related_req` 中存在即视为"完整性满足",spec-Y 不需要重复持有

### §2.3 反向校验

- 各 spec 的 `related_req` 并集 ⊇ `related_req_proposal` 中所有 `[新增] / [已有·扩展] / [已有·修改] / [已有·废弃]` 条目
- 各 spec 的 `related_req` 两两交集 = ∅(D4)
- `[已有·仅引用]` 的 AUTH ∉ 任何 spec 的 `related_req`

---

## §3 裁决 Q1-2 / Q1-3 / Q2.1-3

### Q1-2:`related_req_proposal` → `related_req` 可否丢弃 AUTH?

**裁决**:**禁止**默默丢弃。

- `[新增] / [已有·扩展] / [已有·修改] / [已有·废弃]` 性质的 AUTH 必须出现在某 spec 的 `related_req`(完整性)
- `[已有·仅引用]` 性质的 AUTH 在本次 change 不进入任何 `related_req`,但**必须**在某 spec 正文以 `[已有·仅引用]` 标注追溯,否则视为悬空丢弃
- 若某 AUTH 在裁决后认定与本次 change 无关,**必须**在 proposal 阶段由 CDR 反推删除,而非在 spec 阶段静默丢弃

### Q1-3:多 spec 场景下各 `related_req` 并集 vs `related_req_proposal` 关系?

**裁决**:并集 ⊇ proposal 中 `[新增] / [已有·扩展] / [已有·修改] / [已有·废弃]` 子集,**严禁** ⊋(超出)proposal 范围。

- 若 spec 阶段发现需要新增 AUTH,**必须**反推 proposal 修订(CDR 走战略调整路径,见 [`./how-to-write.md`](./how-to-write.md) §CDR)
- 不允许 spec 阶段单边引入 proposal 未声明的 AUTH

### Q2.1-3:`related_req_proposal` 是否允许 `AUTH-*` 通配符?

**裁决**:**禁用通配符**。

- proposal `related_req_proposal` 与 spec `related_req` 元素必须为具名 `AUTH-{编号}`(对齐 schema §4.2)
- 任何 `AUTH-*` / `AUTH-signup-*` 形态视为非法 frontmatter,workflow 校验拒绝转移
- 若用户意图表达整族 AUTH,必须在 proposal 阶段 CDR 中展开为具名列表

---

## §4 边界情形

### §4.1 一个 AUTH 跨多个 capability

**禁止多归属**。处理方式二选一:

- **拆 AUTH**:在 proposal CDR 阶段把该 AUTH 拆为 `AUTH-x-a` / `AUTH-x-b`,各自落入对应 spec
- **合并 capability**:把多个 capability 合并为 1 个 spec(放弃拆分)

### §4.2 一个 capability 不含任何 `[新增] / [已有·扩展] / [已有·修改] / [已有·废弃]` AUTH

视为该 capability 在本次 change 中**不需要新建 spec**(只在已有 spec 中以 `[已有·仅引用]` 追溯)。
若 proposal §3 把它列为 P0/P1 但裁决后发现 0 AUTH,**必须**反推 proposal 修订。

### §4.3 `related_req_proposal: []`(空列表)

合法。代表本次 change 不关联任何项目级能力槽(纯内部重构 / 文档调整)。
所有 spec 的 `related_req` 也应为 `[]`。

---

## §5 与 RBK 的边界

- spec-writer 写完 `related_req` 后,RBK 通过监听该字段被动协作(对齐 schema §3 写读流)
- spec-writer **不调用** RBK 任何命令(零命令名耦合)
- 跨 change 的 AUTH 唯一性(D4)由 RBK 在监听阶段校验,本 skill 仅在 checklist §3 提示自检