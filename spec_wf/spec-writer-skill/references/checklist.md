# spec 阶段验收清单（唯一权威）

> 本清单是 spec 阶段验收的**唯一权威**。其他文件不得复述验收条目。
> AC 三层口径定义见 [`../../shared/contracts/ac-vocabulary.md`](../../shared/contracts/ac-vocabulary.md)；
> 字段语义见 [`../../shared/contracts/frontmatter-schema.md`](../../shared/contracts/frontmatter-schema.md)；
> 增量标注 5 项闭集见 [`./increment-annotation.md`](./increment-annotation.md)；
> Diff 表 / 迁移映射见 [`./diff-and-migration.md`](./diff-and-migration.md)；
> DMN 启用与去重见 [`./dmn-when-and-how.md`](./dmn-when-and-how.md)；
> CDR 退出条件见 [`../../shared/protocols/cdr-protocol.md`](../../shared/protocols/cdr-protocol.md)。

---

## §1 frontmatter 合规

- [ ] `change_name` 取值 kebab-case，与 proposal `change_name` 完全一致
- [ ] `status` ∈ `{draft, reviewed}`；CDR 退出前必须 `draft`
- [ ] `change_mode` ∈ `{greenfield, extend, refactor, bugfix}`，**完全沿用** proposal.frontmatter
- [ ] `related_req` 取值为 `[AUTH-xx, ...]` 或 `[]`，无通配符 `AUTH-*`
- [ ] `reference_specs` / `touched_capabilities` / `impacted_modules` **键必存**，取值为列表（可为 `[]`）
- [ ] `change_mode != greenfield` 时 `reference_specs` / `touched_capabilities` / `impacted_modules` **至少一个非空**
- [ ] `milestone` 键必须存在，值为 string 或 `—`
- [ ] frontmatter 字段集 ⊆ schema §1，无幽灵字段

## §2 内容合规

- [ ] L0 业务禁区已显式列出，作为 L4 DoD 守卫的来源
- [ ] L0.x 既有上下文衔接表已填（`change_mode != greenfield` 时）
- [ ] L1 用户故事**不写 AC**；每条 US 在 L2 INV / L3 AC 中可找到承载
- [ ] L1 每条 US 已声明 `关联 REQ: [...]`（可空但必须显式声明）
- [ ] L2 INV 业务语言纯净：无 `字段类型 / 1:N / 聚合根 / 主键 / SQL` 等技术词
- [ ] L3 AC 编号格式 `AC-{req}-{seq}`，`req` 与 `related_req` 元素尾段一致
- [ ] L3 每条 AC = EARS 句 + Gherkin Scenario，Then 子句可观察可断言
- [ ] L4 DoD **零新增验收**：每条 checkbox 能在 L2 / L3 / DMN / L0 找到来源
- [ ] 增量标注 ∈ §1 五项闭集 `{[新增], [已有·仅引用], [已有·扩展], [已有·修改], [已有·废弃]}`，无遗漏
- [ ] `[已有·扩展]` 紧邻给出**扩展点**
- [ ] `[已有·修改]` 紧邻 Diff 表（§1 实体 Diff / §2 行为 Diff / §3 AC 迁移映射；按层归口）
- [ ] `[已有·废弃]` 紧邻**迁移路径**与**兼容期窗口**两要素
- [ ] `change_mode != greenfield` 时正文非 `[新增]` 标注计数 ≥ 1

## §3 增量闭环合规（`change_mode != greenfield` 必填；greenfield 整段勾"不适用"）

- [ ] **既有 AC 复测**清单已列出，覆盖 `[已有·扩展]` / `[已有·仅引用]` 触达的既有 AC 编号
- [ ] **AC 迁移完整性**：`[已有·修改]` REQ 的 AC 迁移映射表中"保留"项全部通过；"废弃"项代码无残留引用
- [ ] **冲突护栏**：`[已有·修改]` INV 的"原 → 新"已在数据 / 类型 / 断言中体现
- [ ] **下游通知**：`impacted_modules` 中列出的下游已通知或通过 ACL 隔离
- [ ] **兼容期 / 灰度 / 回滚**：proposal §2 Backout 策略已就位
- [ ] **`[已有·废弃]`** 迁移路径已落地，兼容期窗口公告已发布
- [ ] **双向链接**：本 spec 已在所有 `reference_specs` 中被反向引用

## §4 DMN 合规（启用时必填；未启用整段勾"不适用"）

- [ ] DMN 启用判据 ≥ 2 条（见 [`./dmn-when-and-how.md`](./dmn-when-and-how.md) §1）
- [ ] 每张 `DMN-xxx` 显式标注命中策略（推荐 `U` / `C`；禁用 `F`）
- [ ] 每张 `DMN-xxx` 含**默认兜底行**
- [ ] BKM 抽出条件 = 复用次数 ≥ 2；单次复用不抽出
- [ ] Gherkin Scenario 数量 ≤ 命中策略分支数 + 兜底 1 + 参数化 1（去重红线）
- [ ] `[已有·修改]` 决策表附「规则迁移表」

## §5 边界纪律

- [ ] 不写技术方案 / API 路径 / HTTP code / SQL / 字段类型（归 design-writer）
- [ ] 不写测试命令（如 `npm test`）与覆盖率指标
- [ ] 不复述 ac-vocabulary.md / frontmatter-schema.md / cdr-protocol.md 的定义（只链接）
- [ ] 不复述 increment-annotation.md / diff-and-migration.md / dmn-when-and-how.md 的规则（只链接）
- [ ] **D4 强约束**：本 spec 持有的 AUTH-ID 不得同时出现在其他 spec 的 `related_req` 中

## §6 协议合规

- [ ] 至少完成 1 轮 CDR（批注消化或显式驳回）
- [ ] CDR 退出条件全部满足后才把 `status` 升为 `reviewed`
- [ ] CDR 批注分流正确：实现细节 → design；战略调整 → 反推 proposal 修订

## §7 上下游交接

- [ ] 文件路径 = `docs/spec/{change_name}/specs/{capability}.md`，`{capability}` kebab-case
- [ ] `related_req` 来源于 proposal `related_req_proposal` 的收敛结果（规则见 [`./req-convergence.md`](./req-convergence.md)）
- [ ] `reference_specs` / `touched_capabilities` / `impacted_modules` 与 proposal §0.1 / §0.2 一一对应
- [ ] design-writer 通过 `reference_specs` 字段（design 视角）读取本文件路径
- [ ] RBK 通过 `related_req` 字段被动监听，本 skill 不调用 RBK 任何命令