# design 阶段验收清单（唯一权威）

> 本清单是 design 阶段验收的**唯一权威**。其他文件不得复述验收条目。
> 字段语义见 [`../../shared/contracts/frontmatter-schema.md`](../../shared/contracts/frontmatter-schema.md)；
> CDR 退出条件见 [`../../shared/protocols/cdr-protocol.md`](../../shared/protocols/cdr-protocol.md)；
> 边界红线枚举见 [`./boundary-redlines.md`](./boundary-redlines.md)；
> 复杂度梯度判定见 [`./domain-modeling-depth.md`](./domain-modeling-depth.md)；
> 既有架构资产盘点见 [`./existing-architecture-landscape.md`](./existing-architecture-landscape.md)。

---

## §1 frontmatter 合规（10 字段）

- [ ] `change_name` 取值 kebab-case，与 proposal / spec 的 `change_name` 完全一致
- [ ] `status` ∈ `{draft, reviewed}`；CDR 退出前必须 `draft`
- [ ] `change_mode` ∈ `{greenfield, extend, refactor, bugfix}`，**完全沿用** spec.frontmatter.change_mode（I8）
- [ ] `produced_specs` 取值为相对路径数组 `[specs/{capability}.md, ...]`，且每条路径在文件系统真实存在
- [ ] `architecture_refs` **活字段**：每项含 `path` + `usage`（∈ `{沿用, 扩展, 约束, 替换}`），缺一为非法
- [ ] `domain_modeling_level` ∈ `{L1, L2, L3}`，**必填**
- [ ] `domain_model_mode` ∈ `{omit, extended}`；`extended` 仅在 `domain_modeling_level: L3` 下合法
- [ ] `bounded_contexts` 取值为 BC 名称数组（可为 `[]`，但若 §2.1 表非空则必须与表中 BC 名称完全一致）
- [ ] `reused_modules` **5 项闭集**：每项含 `path` + `annotation` ∈ `{[新增], [已有·仅引用], [已有·扩展], [已有·修改], [已有·废弃]}`；`change_mode != greenfield` 时必非空
- [ ] `bc_relations` **DDD 5 项词表**：每项含 `bc` + `relation` ∈ `{沿用, 扩展, 新建, ACL隔离, 替换}` + `refers_to`（`relation != 新建` 时必填）；L1 取 `[]`，L2/L3 必非空
- [ ] frontmatter 字段集 = 10 字段，无幽灵字段（对齐 schema §1 / §8 design.md）

## §2 内容合规

- [ ] §1 架构上下文显式列出"不影响的子系统"，作为越界守卫
- [ ] §1 含"继承的业务禁区"索引行，且**未复述** spec L0 原文（仅链接）
- [ ] §1 每个 `architecture_refs` 元素在正文有对应说明（不允许装饰性引用）
- [ ] §2.1 BC 表 5 列齐全：BC 名称 / 与既有 BC 关系 / 引用的既有 BC / 职责 / 涉及 specs
- [ ] §2.1 "与既有 BC 关系"列与 frontmatter `bc_relations` 严格一一对应
- [ ] §2.1 BC 表每行的 `涉及 specs` 在 `produced_specs` 中存在
- [ ] §2.2 战术建模仅在 `domain_model_mode: extended` 下展开，否则整段省略（不留空标题）
- [ ] §2.2.1（L3+extended）领域事件 / 实体 / 聚合根带增量标注（5 项闭集）
- [ ] §2.2.2 聚合 ER 视图（若展开）只画聚合根关系，无字段类型 / 主外键 / 索引
- [ ] §3.1 模块清单 7 列齐全：模块名 / **增量标注** / **既有模块路径** / 所属 BC / 承接方 / 职责 / 承载 spec 条目
- [ ] §3.1 "增量标注"列 ⊆ 5 项闭集
- [ ] §3.1 标 `[已有·*]` 时"既有模块路径"必填；标 `[新增]` 时填 `—`
- [ ] §3.1 标 `[已有·扩展]` 模块紧邻给出"**扩展点**：..."一句话
- [ ] §3.2 模块依赖图：L2 / L3 必填，且**无循环依赖**；L1 可省
- [ ] §3.3 每个模块标注其所属 `BC-{name}`，且 BC 在 §2.1 表中可找到
- [ ] §3.3 模块对外契约的"输入 / 输出"用业务概念表达，不出现字段类型 / HTTP / SQL（详见 boundary-redlines）
- [ ] §3.3 标 `[已有·扩展]` 的模块**分两段写**（既有契约保持不变 vs 新增契约本次扩展）
- [ ] §4 核心流程：L2 / L3 至少 1 条，参与者为 §3.1 中存在的模块名；L1 可省
- [ ] §4 每条流程显式关联 ≥ 1 个 AC / INV
- [ ] §3 / §4 共同覆盖 specs 中每个 AC / INV 至少一次
- [ ] §5 至少 1 条 ADR，**四段式齐全**（既有 ADR 引用 / Context / Decision / Consequence）
- [ ] §5 每条 ADR 的"既有 ADR 引用"关系 ∈ `{沿用, 撤销, 修订, 取代}`（或 `—`）
- [ ] §5 每个标 `[新增]` 的模块对应一条 ADR，含**复用充分性自检三问**的回答（I9）
- [ ] §6.1 越界声明非空（显式不做的清单是 design 阶段必产物，不是可选项）
- [ ] §6.2 复用清单（`change_mode != greenfield` 时必非空）与 §3.1 标 `[已有·*]` 的模块一一对应
- [ ] §7 架构级风险至少 1 行，类别 ∈ `{性能, 扩展性, 耦合, 演进}`；无风险时显式写"无识别到架构级风险"（不得整节省略）
- [ ] §8 追溯映射表覆盖 specs 中**所有** AC 与 INV（零遗漏）

## §3 增量闭环（`change_mode != greenfield` 必填；greenfield 整段勾"不适用"）

- [ ] **不适用**（`change_mode: greenfield`）
- [ ] `reused_modules.path` 集合 ⊇ 各 spec.frontmatter.impacted_modules 的并集（I10，design 不遗漏 spec 已声明的影响）
- [ ] `bc_relations` 每项与 §2.1 BC 表"关系"列严格一致（I11）
- [ ] `architecture_refs` 每项的 `usage` 在正文有对应落点（不允许装饰性引用）
- [ ] 每个 `[新增]` 模块在 §5 ADR 中有"复用充分性自检"三问的回答（I9）
- [ ] 每个 `[已有·扩展]` 模块紧邻给出**扩展点**一句话说明
- [ ] 每个 `[已有·修改]` 模块在 §5 ADR 中给出契约 Diff，并标 `[BREAKING]`
- [ ] 每个 `[已有·废弃]` 模块给出**替代模块**与**兼容期窗口**
- [ ] §6.2 复用清单非空，且条目与 §3.1 标 `[已有·*]` 的模块一一对应

## §4 边界红线（详见 boundary-redlines）

- [ ] 不出现 SQL 语句、表结构、字段类型（`int / varchar / NOT NULL` 等）
- [ ] 不出现 HTTP 路径、HTTP 状态码、REST 动词组合
- [ ] 不出现接口签名（`function f(x: T): R`）、代码片段、伪代码块
- [ ] 不出现具体框架名（React / Spring 等）与版本号（归实现阶段）
- [ ] 不出现测试命令、覆盖率指标（归 spec L4 DoD 与 dev skill）
- [ ] 不复述 ac-vocabulary.md / frontmatter-schema.md / cdr-protocol.md 的定义（只链接）
- [ ] **红线 7**：不复述 proposal §0 既有资产盘点的工程级条目（design 关注架构级；详见 boundary-redlines 红线 7）
- [ ] **红线 7**：不复述 spec L0.x 既有上下文衔接表（design 关注 BC 关系而非业务上下文）

## §5 协议合规

- [ ] **L3 必须用户确认门**：`domain_modeling_level: L3` 必须在 CDR 中由用户显式确认，不得由 skill 单方面升级
- [ ] 至少完成 1 轮 CDR（批注消化或显式驳回）
- [ ] CDR 退出条件全部满足后才把 `status` 升为 `reviewed`
- [ ] CDR 批注**反向 5 路分流**正确（规则见 [`./how-to-write.md`](./how-to-write.md) §10）：
  - [ ] 战略层批注 → 反推 proposal 修订（暂停本阶段）
  - [ ] 规约范围批注 → 反推 spec 修订（回 spec-writer）
  - [ ] 实现技术细节批注 → 直接消化为 ADR / 模块契约调整
  - [ ] **复用建议批注 → 直接消化为 §3.1 模块清单调整 + §5 ADR 增补 / §6.2 复用清单更新**（新增）
  - [ ] 工程闭环批注（测试 / 部署 / 监控） → 转交 dev skill（不在 design 消化）

## §6 上下游交接

- [ ] 文件路径 = `docs/spec/{change_name}/design.md`（单文件，不分 capability）
- [ ] `produced_specs` 完整覆盖本 change_name 下 `docs/spec/{change_name}/specs/` 的全部 spec 文件
- [ ] task-decomposer 通过 `domain_modeling_level` / `bounded_contexts` / `produced_specs` / **`reused_modules`** / **`bc_relations`** 字段读取本文件（写读流见 schema §3）
- [ ] RBK 通过监听 `status: reviewed` 被动协作，本 skill 不调用 RBK 任何命令（零命令名耦合）

## §7 跨阶段一致性自检（与 workflow / proposal / spec 联动）

- [ ] design.frontmatter.change_mode == spec.frontmatter.change_mode（I8）
- [ ] design.frontmatter.change_mode == proposal.frontmatter.change_mode（跨阶段沿用）
- [ ] design.frontmatter.reused_modules[].path 集合 ⊇ spec.frontmatter.impacted_modules 的并集（I10）
- [ ] design.frontmatter.bc_relations[].bc 集合 == design.frontmatter.bounded_contexts（I11）
- [ ] design §1 / §3 / §5 中提及的既有资产可在 proposal §0.1 / §0.2 中找到对应条目（双向追溯）