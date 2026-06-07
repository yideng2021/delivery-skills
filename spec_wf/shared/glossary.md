# Glossary — spec-wf 术语对齐表

> 本文件统一 spec-wf v3 工作流中各 skill / workflow / shared 文档使用的核心术语,
> 用作**跨文件交叉引用时的语义锚点**。引用术语时只链接本表,不复述定义。
> 完整设计原理见 [`../spec-wf总结.md`](../spec-wf总结.md);字段权威定义见 [`./contracts/frontmatter-schema.md`](./contracts/frontmatter-schema.md)。

---

## §0 阅读路径建议

1. 先看 §1 **工作流与产物**(理解端到端形态)
2. 再看 §2 **frontmatter 字段** + §3 **AC 与编号体系**(理解契约层)
3. 然后 §4 **三条主轴 / 横切机制**(理解为什么这么设计)
4. 最后 §5 **守卫、状态与降级** + §6 **角色简称**

---

## §1 工作流与阶段产物

| 术语 | 一句话定义 | 落点 / 产物 | 关键约束 |
|------|----------|-----------|---------|
| **change** | 一次端到端的变更交付单元,对应 `docs/spec/{change_name}/` 目录 | 贯穿四阶段 | 一个 change 走完整 proposal → specs → design → tasks 链路;可选 writeback |
| **proposal** | 阶段一产物:战略对齐(为什么做 / 做什么 / §0 既有资产盘点 / Capability Map) | `proposal.md` | ≤ 2 页;不写实现细节;`change_mode != greenfield` 时 §0 三表必填 |
| **spec** | 阶段二产物:业务规约,L0–L4 严格分层(背景 / US / 实体规则 / 行为 / DoD) | `specs/{capability}.md` | 一份 spec ↔ 一个 capability;AC 唯一来源 = L2 INV ∪ L3 AC ∪ DMN-Rn |
| **design** | 阶段三产物:架构契约,固定 8 段(模块/BC/流程/ADR 等) | `design.md` | 边界红线:无 SQL/HTTP/字段类型/代码片段;架构层图表允许 |
| **tasks** | 阶段四产物:`BC × 承接方` 二维拆解的工单清单 | `tasks.md` | 严禁复活旧 Phase 流水线(Scaffolding/Schema/Service/API/UI) |
| **writeback** | 阶段五编排:扫 spec L4 已勾选 US,注入 `tasks.shipped_us`,触发 RBK 打勾 | workflow 唯一写 `shipped_us` | 失败走 F3 降级,见 §5 |
| **capability** | 业务视角下一项独立可命名的能力,是 spec 拆分的命名空间 | proposal §3 Capability Map / spec 文件名 | `kebab-case`;一个 capability 通常 ↔ 一份 spec |
| **critic** | 软审查产物(LLM-as-Judge):对四阶段任一产物输出 `pass / needs_revision / escalated` 三态裁决 | `critic.md`(独立文件) | 不改正文,只改受审文件 status;详见 [`../spec-critic-skill/SKILL.md`](../spec-critic-skill/SKILL.md) |

---

## §2 frontmatter 字段(契约层)

> 字段权威定义见 [`./contracts/frontmatter-schema.md`](./contracts/frontmatter-schema.md);本表只列**最常被跨文件引用**的术语级字段,共 20 字段全集请查 schema。

| 字段 | 角色 | 一句话语义 |
|------|------|----------|
| `change_name` | 全局键 | 本次 change 全局唯一 ID,决定目录路径 |
| `status` | 生命周期 | `draft` / `reviewed` / `needs_revision` / `escalated`(F1/F2 触发) |
| `exc_status` | 执行态 | `pending` / `in_progress` / `done` / `writeback_failed`(F3 触发) |
| `change_mode` | 增量性质 | `greenfield` / `extend` / `refactor` / `bugfix`,决定 §0 与增量字段强约束程度 |
| `req_ledger_state` | RBK 握手 | `present` / `missing` / `skipped`,proposal 起草时的账本状态 |
| `related_req_proposal` | RBK 握手 | proposal 阶段声明的关联 AUTH-ID 候选(待 spec 收敛) |
| `related_req` | RBK 握手 | spec 最终归属的 AUTH-ID(D4:一 AUTH 一 spec) |
| `reference_specs` | 增量追溯 | spec 视角:本 spec 关联的**既有 spec**(增量锚) |
| `produced_specs` | 增量追溯 | design 视角:design 引用的**本 change 自产** spec 路径 |
| `touched_capabilities` | 增量追溯 | spec 触达的既有 capability(↔ proposal §0.1) |
| `impacted_modules` | 增量追溯 | spec 影响的既有模块/服务(↔ proposal §0.2) |
| `reused_modules` | 增量追溯 | design 复用模块清单 + 增量标注 5 项闭集 |
| `architecture_refs` | 架构锚 | design 引用的总体架构文档(活字段,含 path + usage) |
| `bounded_contexts` | DDD | design 识别的 BC 清单;tasks 沿用做切分 |
| `bc_relations` | DDD | BC 与既有 BC 的关系(DDD 5 项闭集) |
| `domain_modeling_level` | 建模深度 | `L1` / `L2` / `L3`;**L3 必经 ToolCall 确认门**(见 §5) |
| `domain_model_mode` | 建模产出 | `omit` / `extended`;`extended` 仅 L3 合法 |
| `handover_domains` | 工单维度 | 5 项闭集子集 `{database, backend, frontend, integration, infra}` |
| `shipped_us` | writeback | workflow 唯一写字段;扫各 spec L4 已勾选的 US 列表 |
| `milestone` | 可选 | 可选里程碑标签,RBK 解读 |

> 字段写读流图见 [`../spec-wf总结.md`](../spec-wf总结.md) §六。

---

## §3 AC 与编号体系

完整定义见 [`./contracts/ac-vocabulary.md`](./contracts/ac-vocabulary.md);以下为术语速查。

### §3.0 AC 体系总览

| 术语 | 一句话定义 | 广义vs狭义 | 备注 |
|------|----------|----------|------|
| **AC**(Acceptance Criteria) | **验收标准**:系统行为/规则的可验证标准,由数据级/功能级/规则级三层构成 | 广义 = 三层合一;狭义 = L3 功能级 | "AC 唯一来源" 中的 AC 指广义;各层写作指南中的 AC 有狭义指代 |
| **L0-L4**(分层体系) | spec 从业务背景逐层细化至工程交付的 5 层递进;各层有不同的验收职责 | — | L0 背景/L1 故事/L2 规则/L3 行为/L4 勾选;分层的 AC 含义见下表 |
| **REQ**(需求标识) | L1 US 声明的需求槽位标识,对应 L3 AC 编号的前缀(如 `AUTH-signup` 对应 `AC-signup-01`) | — | REQ 在 L1 一次声明;L3 AC 多次复用同一 REQ(多个场景) |
| **EARS** | Easy Approach to Requirements Syntax,自然语言句式规范;L3 AC 的文本表现形式 | — | 5 种句式(`The system shall.../When.../While.../Where.../If...`);见 [`../spec-writer-skill/references/ears-gherkin-cheatsheet.md`](../spec-writer-skill/references/ears-gherkin-cheatsheet.md) |
| **Gherkin** | BDD 场景语言;L3 AC 对应一段 Gherkin Scenario(Given/When/Then 结构) | — | 与 EARS 句一一配对;Scenario 标题必须以 `AC-{req}-{seq}` 开头 |
| **Scenario**(场景) | Gherkin 中一条可执行的场景,包含前置状态(Given)/触发动作(When)/可观察结果(Then) | — | 每条 L3 AC = EARS 句 + 一段 Scenario;一个 REQ 可有多个 Scenario |
| **BDD**(行为驱动开发) | Behavior-Driven Development,用可执行的业务场景(Gherkin)直接驱动测试和实现的开发范式 | — | spec L3 AC 采用 BDD 思想:"每条 AC 必须可由 BDD 测试覆盖" |
| **DMN**(决策模型) | Decision Model and Notation,用决策表 + BKM + DRD 表示复杂交叉规则的标准语言;L3 **规则级 AC** | 可选 | 启用 DMN 时,每行决策表 (R1,R2,...) 成为**规则级 AC**;不启用时,规则在 L2 INV 或 L3 Gherkin 表达 |

**AC 唯一来源(广义)**:`L2 INV-x ∪ L3 AC-{req}-{seq} ∪ L3 DMN-xxx-Rn`(后者可选)。

### §3.1 AC 三层口径与编号

| 术语 | 层 | 一句话 | 关键约束 |
|------|---|-------|---------|
| **L0** | spec 背景 | 业务上下文 + **业务禁区**(本次显式不做的范围) | L0 不承载 AC;禁区作为 L4 守卫 |
| **L1 US-{n}** | spec 用户故事 | 角色-动作-收益的故事单元 | L1 不写 AC;`关联 REQ` 字段在此一次声明 |
| **L2 INV-{n}** | spec 业务不变量 | 业务永真规则,**数据级 AC** | 必须可由静态快照判定;L4 逐条勾选 |
| **L3 AC-{req}-{seq}** | spec 行为规约 | EARS + Gherkin 场景,**功能级 AC** | 每条 AC 必须可由 BDD 测试覆盖 |
| **L3 DMN-{xxx}-R{n}** | spec 决策表行 | 复杂业务规则的决策表行,**规则级 AC**(按需启用);R{n}编号指决策表第 n 行 | 启用判据见 [`../spec-writer-skill/references/dmn-when-and-how.md`](../spec-writer-skill/references/dmn-when-and-how.md);不启用时规则归 L2/L3 |
| **L4 DoD** | spec 完成定义 | 反向勾选所有 INV-x / AC / DMN + 工程闭环 + 禁区守卫 | **零新增**:不引入 L2/L3 之外的验收点 |
| **AUTH-ID** | 项目级账本 | RBK 维护的能力槽编号(如 `AUTH-01`) | **D4 强约束**:一 AUTH 一 spec(同一时刻) |

### §3.2 增量标注与复用标记

| 术语 | 形式 | 适用场景 | 作用 |
|------|------|---------|------|
| **增量标注 5 项闭集** | `{[新增], [已有·仅引用], [已有·扩展], [已有·修改], [已有·废弃]}` | spec 正文每条 US/INV/AC 旁;design 的 reused_modules/bc_relations | 显式标记每条规约相对既有工程的增量性质;与 `change_mode` 联动 |
| **[新增]** | `[新增]` 标注 | 本 change 新引入的规约 | 必须通过 design §5 ADR 三问自检(既有资产检索充分性) |
| **[已有·仅引用]** | `[已有·仅引用]` 标注 | 仅引用既有规约,无修改 | 追溯既有实现;在 design 复用充分性检查时不额外抽查 |
| **[已有·扩展]** | `[已有·扩展]` 标注 | 在既有规约基础上增加新分支/新场景 | 必须配 Diff 表(既有 vs 新增部分);映射到 design 新模块或既有模块的增强 |
| **[已有·修改]** | `[已有·修改]` 标注 | 修改既有规约的原有行为/规则 | 必须配 Diff 表 + 迁移路径 + 兼容期窗口(如有);可按需调用 brownfield-impact-analyzer 做影响分析 |
| **[已有·废弃]** | `[已有·废弃]` 标注 | 标记本 change 中停用的既有规约 | 必须配迁移路径 + 废弃期限;任何系统继续使用被废弃的 AC 时在 tasks 中显式标记"兼容既有" |

### §3.3 关键名词澄清

| 术语 | 定义 | 与 AC 的关系 |
|------|------|------------|
| **AC vs ACL** | AC = Acceptance Criteria (验收标准);ACL = Access Control List(访问控制清单) | **完全不同**;设计中的"ACL 隔离"是 DDD Context Map 概念,不是 AC |
| **REQ vs AUTH** | REQ = L1 US 中声明的需求槽位(短暂的,编号如 `signup`);AUTH = RBK 项目级能力槽(持久的,编号如 `AUTH-01`) | REQ 对应 AC 编号的前缀;AUTH 对应 spec 的 related_req 字段;两个编号空间正交 |
| **spec vs 需求文档** | spec = 本次 change 要实现的**业务规约**(L0-L4);需求文档 = 项目级全量需求(REQUIREMENTS.md 由 RBK 维护) | AC 仅来自本 spec 的 L2/L3,不包含其他 change 的规约;跨 change 关联靠 AUTH-ID |

```
AUTH-ID(项目级)─┐
                ├─ spec.related_req(D4 单点归属)
                ▼
            L1 US-{n}(spec 内)
                │
                ▼
            L3 REQ / Scenario ──▶ AC-{req}-{seq}(功能级 AC)
                │
                └─▶ DMN-{xxx}-Rn(规则级 AC,按需)

L2 INV-{n}(数据级 AC,独立编号空间)

L4 DoD ── 反向勾选所有上述编号 + 工程闭环 + L0 禁区守卫
```

---

## §4 三条主轴与横切机制

### §4.1 三条主轴(贯穿不变量)

| 主轴 | 含义 | 落地位置 |
|------|------|---------|
| **A1 · Workflow ⊥ Skill** | 编排顺序在 workflow,阶段能力在 skill,二者物理拆分 | 4 个 writer + critic + workflow 互不引用 references |
| **A2 · Frontmatter as Contract** | 跨 skill / 跨阶段协作仅通过 frontmatter 字段 | [`./contracts/frontmatter-schema.md`](./contracts/frontmatter-schema.md) 是唯一权威 |
| **A3 · Progressive Disclosure** | SKILL.md ≤ 65 行作为入口,规则下沉 references/,横切下沉 shared/ | 见 [`./protocols/progressive-disclosure.md`](./protocols/progressive-disclosure.md) |

### §4.2 横切协议

| 术语 | 一句话定义 | 权威文件 |
|------|----------|---------|
| **CDR** (Comment-Driven Refinement) | 注释驱动精炼:每阶段强制 1-6 轮"生成→批注→修正"循环;严禁 one-shot;v3 起允许"对话→批注"自动转译 | [`./protocols/cdr-protocol.md`](./protocols/cdr-protocol.md) |
| **CG** (Clarification Gate) | 生成前澄清闸门:writer 动笔前用封闭式问卷(≤5 题)对齐缺失字段,留痕 `<!-- clarification-gate -->` 块;proposal **强制**(C7 hard) | [`./protocols/clarification-gate-protocol.md`](./protocols/clarification-gate-protocol.md) |
| **L3 ToolCall 确认门** | design 写 `domain_modeling_level: L3` 前必须经"问→答"门并留痕 `<!-- l3-confirmation -->`(C1 hard) | [`../design-writer-skill/references/depth-confirmation.md`](../design-writer-skill/references/depth-confirmation.md) |
| **TodoWrite shadow output** | tasks.md `reviewed` 后,host 按协议把 §2 Task 表转译为 TodoWrite 调用,markdown 与 TodoWrite 并存 | [`./protocols/tasks-to-todowrite.md`](./protocols/tasks-to-todowrite.md) |

### §4.3 增量优先三视角

| 视角 | 出处 | 词表来源 |
|------|------|---------|
| **业务/工程级** | proposal §0(既有资产盘点三表) | [`./contracts/change-verbs.md`](./contracts/change-verbs.md) §2 第 4-5 行;变更方向 6 项(沿用/扩展/修改/废弃/替换/并存) |
| **业务级**(增量标注 5 项,详见 §3.2) | spec 正文行级标注 + design 的 `reused_modules.annotation` / `bc_relations` | `{[新增], [已有·仅引用], [已有·扩展], [已有·修改], [已有·废弃]}` 闭集;见 [`./contracts/change-verbs.md`](./contracts/change-verbs.md) §2 第 1 行 |
| **架构级**(BC 关系 DDD 5 项) | design `bc_relations.relation` | `{沿用, 扩展, 新建, ACL隔离, 替换}` 闭集;见 [`./contracts/change-verbs.md`](./contracts/change-verbs.md) §2 第 2 行 |

> 复用充分性自检三问(design `[新增]` 模块强制):①已检索 proposal §0.2? ②已检索 reused_modules? ③为何新建而非扩展? 详见 [`../design-writer-skill/references/existing-architecture-landscape.md`](../design-writer-skill/references/existing-architecture-landscape.md)。

---

## §5 守卫、状态与失败降级

### §5.1 关键守卫

| 术语 | 时机 | 强制度 | 权威 |
|------|------|-------|------|
| **Change-Splitting Guard**(变更拆分守卫) | proposal → specs 边界,6 维阈值判定是否拆 change | 硬(workflow 拒绝转移) | [`../spec-design-workflow/references/change-splitting-guard.md`](../spec-design-workflow/references/change-splitting-guard.md) |
| **D4 强约束** | spec.related_req | 硬(I-E invariant) | [`../spec-writer-skill/references/req-convergence.md`](../spec-writer-skill/references/req-convergence.md) |
| **边界红线** | 各 writer 不得越界写下游内容 | 硬(critic / audit 拒绝) | 各 skill `references/redlines.md` |
| **跨阶段 invariant I-A ~ I-F** | 阶段切换 | 硬(validate.mjs 退出 1) | [`../scripts/validate.mjs`](../scripts/validate.mjs) |
| **audit 钩子 C1 ~ C7** | 任意时刻 | C1-C5/C7 硬 / C6 soft | [`../MAINTENANCE.md`](../MAINTENANCE.md) §四 |

### §5.2 三条失败降级路径

| ID | 名称 | 触发 | 状态写入 |
|----|------|------|---------|
| **F1** | `audit_failed` | 跨阶段 checklist / validator 失败 / **critic verdict == needs_revision** | `{target}.status: needs_revision` |
| **F2** | `cdr_stuck` | CDR ≥ 6 轮未收敛 / **critic verdict == escalated** | `{target}.status: escalated` |
| **F3** | `writeback_retry` | writeback 数据构造异常 | `tasks.exc_status: writeback_failed` + `<!-- writeback-failure -->` 注释 |

> 详见 [`../spec-design-workflow/references/failure-recovery.md`](../spec-design-workflow/references/failure-recovery.md)。

### §5.3 软门 vs 硬门

| 维度 | 硬门 | 软门 |
|------|------|------|
| 名称 | `validate.mjs` (deterministic) | `spec-critic` (LLM-as-Judge) |
| 范围 | schema + invariant I-A~I-F + audit C1~C7 | 5 个语义判据 J1-J5(追溯/诚实/边界/复用/精炼) |
| 不通过后果 | 退出码 1,workflow 拒绝转移 | 改 status 触发 F1/F2 |
| 可绕过 | 否 | 是(用户可显式 `<!-- critic-skipped -->` 跳过) |

---

## §6 相关 skill 与简称

| 简称 | 全称 | 关系 | 一句话职责 |
|------|------|------|-----------|
| **proposal-writer** | [`../proposal-writer-skill/`](../proposal-writer-skill/) | writer 1 | 写 proposal.md(战略对齐) |
| **spec-writer** | [`../spec-writer-skill/`](../spec-writer-skill/) | writer 2 | 写 specs/*.md(业务规约) |
| **design-writer** | [`../design-writer-skill/`](../design-writer-skill/) | writer 3 | 写 design.md(架构契约) |
| **task-decomposer** | [`../task-decomposer-skill/`](../task-decomposer-skill/) | writer 4 | 写 tasks.md(工单拆解) |
| **spec-critic** | [`../spec-critic-skill/`](../spec-critic-skill/) | 软门 | LLM-as-Judge 三态裁决 |
| **spec-design-workflow** | [`../spec-design-workflow/`](../spec-design-workflow/) | 编排 | 状态机 + 守卫 + 跨阶段一致性 + writeback |
| **RBK** | [`../requirements-bookkeeping-skill/`](../requirements-bookkeeping-skill/) | 平级 | 维护项目级 `REQUIREMENTS.md` / `ROADMAP.md`;3 握手点被动协作 |
| **dev skill**(下游) | `spec-{domain}-dev-skill`(本仓库外) | 下游 | 消费 tasks/design/specs 执行 TDD 编码 |

> RBK 与 spec-wf 主体**零命令名耦合**:仅通过 `req_ledger_state` / `related_req` / `shipped_us` 三个 frontmatter 字段被动握手。

---

## §7 编号 / 命名约定速查

| 维度 | 规则 |
|------|------|
| `change_name` | `kebab-case`,字母数字+短横,无空格 |
| frontmatter 字段名 | `snake_case` |
| frontmatter 枚举值 | 小写英文 |
| AUTH-ID | `{4 字母大写 Category}-{NN}[{a-z 后缀}]`,如 `AUTH-01` / `AUTH-10a`;**废弃 ID 不复用** |
| US-ID / INV-x / DMN-Rn | spec 文件内单调递增 |
| AC-{req}-{seq} | `req` = REQ 标识尾段 / `seq` = 同 req 下场景序号 |
| BC-name | 业务语义命名,出现在 design `bounded_contexts` 与 tasks "所属 BC" |

---

## §8 三条铁律(便于背诵)

1. **A1 解耦**:workflow 不写 skill 内规则,skill 不写 workflow 编排逻辑
2. **A2 契约**:跨 skill 协作只走 frontmatter 字段,不读对方 references / 正文
3. **A3 渐进披露**:SKILL.md ≤ 65 行入口,规则在 references,横切在 shared

**衍生子铁律**:
- **D4**:一 AUTH 同时刻只能归属一个 spec
- **L4 零新增**:DoD 只勾选不新增验收
- **REQ 不挂 AUTH**:AUTH 在 L1 US 一次声明,L3 REQ 仅挂 `关联 US`

---

## §9 与其他 shared 文档的关系

| 文件 | 关系 |
|------|------|
| [`./contracts/frontmatter-schema.md`](./contracts/frontmatter-schema.md) | **字段权威**;本表 §2 是其速查摘要,完整定义看 schema |
| [`./contracts/ac-vocabulary.md`](./contracts/ac-vocabulary.md) | **AC 口径权威**;本表 §3.0-§3.3 是其速查摘要,完整定义(含 INV/AC/DMN/DoD 具体写法)看 ac-vocabulary |
| [`./contracts/change-verbs.md`](./contracts/change-verbs.md) | **增量标注与动词词表权威**;本表 §3.2 与 §4.3 是其速查摘要 |
| [`./contracts/handover-domains.md`](./contracts/handover-domains.md) | **承接方闭集权威**;本表 §2 仅列 5 枚举 |
| [`./contracts/empty-value-convention.md`](./contracts/empty-value-convention.md) | **空值约定权威**;本表未涉及 |
| [`./protocols/`](./protocols/) | 4 个横切协议;本表 §4.2 给入口与一句话定义 |
| [`../spec-wf总结.md`](../spec-wf总结.md) | **设计原理总览**;本表是其术语索引 |
| [`../spec-writer-skill/references/ears-gherkin-cheatsheet.md`](../spec-writer-skill/references/ears-gherkin-cheatsheet.md) | **EARS 与 Gherkin 写法速查**;本表 §3.0 给定义入口,详细句式与示例看 cheatsheet |
| [`../spec-writer-skill/references/dmn-when-and-how.md`](../spec-writer-skill/references/dmn-when-and-how.md) | **DMN 启用判据与嵌入规则权威**;本表 §3.0-§3.1 给总体定义,启用/禁用/去重细则看此文件 |

> 新增术语流程:① 在本表对应章节追加一行 + 链接到具体定义文件 ② 若术语已有专门 shared/contracts 或 references 文件,本表只放速查不放完整定义 ③ 若无,优先在 contracts 或 protocols 落地一个权威文件,再回本表挂链接。