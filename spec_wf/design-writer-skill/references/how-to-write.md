# how to write design.md（填写指南）

> 本文件是 design-writer 的**操作手册**，按 design.md 模板顺序逐节给出写法、判定要点与典型反例。
> 验收清单见 [`./checklist.md`](./checklist.md)；边界红线见 [`./boundary-redlines.md`](./boundary-redlines.md)；
> 复杂度判定见 [`./domain-modeling-depth.md`](./domain-modeling-depth.md)；上下文加载见 [`./architecture-context-loading.md`](./architecture-context-loading.md)；
> **既有架构资产盘点**见 [`./existing-architecture-landscape.md`](./existing-architecture-landscape.md)。

---

## §0 前置：上下文加载顺序

填写 design.md 前**必须**完成 [`./architecture-context-loading.md`](./architecture-context-loading.md) §3 的 6 步上下文加载。跳过任何一步即等于"凭空设计"。

## §1 frontmatter 10 字段填写

按字段顺序填写：

1. `change_name`：从 proposal `change_name` 直接拷贝，kebab-case
2. `status`：起手 `draft`，CDR 退出后才能改 `reviewed`
3. `change_mode`：**完全沿用** spec.frontmatter.change_mode（I8 强约束；不一致即审计失败）
4. `produced_specs`：列出本 change 下所有 spec 文件相对路径（例如 `[specs/auth-login.md, specs/auth-token.md]`）
5. `architecture_refs`：**活字段**，按 [`./architecture-context-loading.md`](./architecture-context-loading.md) §1 / §2 判定填写，每项含 `path` + `usage`（∈ `{沿用, 扩展, 约束, 替换}`）
6. `domain_modeling_level`：按 [`./domain-modeling-depth.md`](./domain-modeling-depth.md) §2 判定流程填写，默认 `L1`
7. `domain_model_mode`：L1/L2 必填 `omit`；L3 必填 `extended`（其他组合非法）
8. `bounded_contexts`：与 §2.1 BC 表的 `BC 名称` 列完全一致
9. `reused_modules`：**既有模块复用清单**，每项含 `path` + `annotation`（∈ 5 项闭集）；`change_mode != greenfield` 时必非空；**path 集合 ⊇ 各 spec.frontmatter.impacted_modules 并集**（I10）；详见 [`./existing-architecture-landscape.md`](./existing-architecture-landscape.md) §2.2
10. `bc_relations`：**BC 关系清单**，每项含 `bc` + `relation`（∈ DDD 5 项）+ `refers_to`（`relation != 新建` 时必填）；L1 取 `[]`，L2/L3 必非空；详见 [`./existing-architecture-landscape.md`](./existing-architecture-landscape.md) §2.1

## §2 §1 架构上下文（三栏 + 既有禁区索引）

按 [`./architecture-context-loading.md`](./architecture-context-loading.md) §4 的三栏顺序写，缺一即违规：

- **既有架构引用**：列出 `architecture_refs` 中各 `path` 对应的具体章节，每项后跟一句话说明本 change 的 `usage`（沿用/扩展/约束/替换）
- **本次 change 的架构定位**：一句话说明影响哪一层 / 哪些边界，**不写实现细节**
- **不影响的子系统**：显式越界守卫，后续 §6 越界声明会基于此扩展

新版模板额外保留一行 **"继承的业务禁区"**——仅作为索引链接（指向 `produced_specs` 中各 spec 的 L0 业务禁区），**不复述**业务禁区原文。

**反例**：
- 三栏合并成一段散文，reviewer 无法快速定位"不影响的子系统"
- 在"继承的业务禁区"行展开复述 spec L0 内容（违反 SSOT）
- `architecture_refs` 中列出的路径在 §1 中找不到对应说明（装饰性引用）

## §3 §2.1 BC 表（含"与既有 BC 关系"列）

每行一个 BC，5 列必填：

- **BC 名称**：必须以 `BC-` 前缀开头，kebab-case 命名
- **与既有 BC 关系**：∈ DDD Context Map 精简词表 `{沿用, 扩展, 新建, ACL隔离, 替换}`；**与 frontmatter `bc_relations` 严格一一对应**
- **引用的既有 BC**：`relation != 新建` 时必填（写既有 BC 名），`relation == 新建` 时写 `—`
- **职责**：一句业务话（不写技术栈）
- **涉及 specs**：本 BC 承载的 spec 文件相对路径，且必须出现在 frontmatter `produced_specs` 中

**反例**：
- `BC 名称 = User`（无 `BC-` 前缀）
- `涉及 specs = auth.md`（未在 `produced_specs` 中）
- 写"扩展"但实际上引入了新的限界（应改为"新建"）
- "关系"列填中文枚举之外的值（如"修改"、"复用"——这些是模块层标注词，不是 BC 关系）

## §4 §2.2 战术建模（仅 L3 + extended）

按 [`./domain-modeling-depth.md`](./domain-modeling-depth.md) §4 的四子节（实体 / 值对象 / 聚合根 / 领域事件）展开为 §2.2.1。**每条带增量标注**（5 项闭集）；标 `[已有·*]` 的事件 / 实体 / 聚合根必须给出来源 BC 与扩展点 / Diff / 兼容期窗口，详见 [`./existing-architecture-landscape.md`](./existing-architecture-landscape.md) §2.3。

§2.2.2 **聚合 ER 视图**（Mermaid `erDiagram`）只画**聚合根之间**及**聚合内核心实体**的关系；**禁止**字段类型 / 主外键 / 索引（详见 [`./boundary-redlines.md`](./boundary-redlines.md) §3 灰色地带）。单聚合场景可省 §2.2.2，但 §2.2.1 不可省。

L1 / L2 时整段 §2.2 省略（包括标题），不留空标题。

## §5 §3 模块对外契约（三子节）

### §5.1 §3.1 模块清单（7 列必填）

每行一个模块，**7 列必填**：

- **模块名**：kebab-case
- **增量标注**：∈ 5 项闭集 `{[新增], [已有·仅引用], [已有·扩展], [已有·修改], [已有·废弃]}`；与 frontmatter `reused_modules` 严格对齐
- **既有模块路径**：标 `[已有·*]` 时**必填**（写既有模块/服务/接口路径，与 spec.impacted_modules 同口径）；标 `[新增]` 时填 `—`
- **所属 BC**：必须出现在 §2.1 BC 表与 frontmatter `bounded_contexts` 中
- **承接方**：取自 [`../../shared/contracts/handover-domains.md`](../../shared/contracts/handover-domains.md) 的闭集 `{database, backend, frontend, integration, infra}`，**不可省略**——这是 task-decomposer 拆解的输入信号
- **职责**：一句业务话（不写技术栈）；`[已有·扩展]` 模块在职责后必须紧邻"**扩展点**：..."一句话
- **承载的 spec 条目**：列出本模块承担的 AC / INV ID（例如 `AC-LOGIN-01 / INV-1`）

**反例**：
- 标 `[新增]` 但既有模块路径写了路径（应填 `—`）
- 标 `[已有·扩展]` 但未给扩展点
- 标 `[已有·修改]` 但未在 §5 ADR 中给契约 Diff
- `reused_modules.path` 集合 ⊊ spec.impacted_modules 并集（违反 I10）

### §5.2 §3.2 模块依赖图（L1 可省；L2/L3 必填）

Mermaid `graph TB` 或 `graph LR`，节点 = §3.1 模块清单中的模块名。

- 箭头方向 = **依赖方向**（同步调用 / 直接引用）
- **视觉约定**：新建模块用矩形 `[...]`，既有模块用圆角矩形 `(...)`，便于 reviewer 一眼识别复用边界
- **禁止循环依赖**：CDR 自检的硬条目；若出现循环必须就地拆分模块或通过事件解耦后挪入 §4
- 异步事件协作**不画入本图**，放入 §4 核心流程

**反例**：把 "A 发布事件 → B 订阅" 画成 §3.2 的实线箭头 → 违规，事件协作属于 §4。

### §5.3 §3.3 模块对外契约（语义级）

每个模块以 `模块.能力(输入概念) → 输出概念` 的业务语言描述；**标 `[已有·扩展]` 的模块必须分两段写**（既有契约保持不变 vs 新增契约本次扩展），便于 reviewer 判断"扩展不破坏既有"。

**反例**：对外契约写成接口签名 `authenticate(token: string): User` → 越界，违反 [`./boundary-redlines.md`](./boundary-redlines.md) 红线 3。

## §6 §4 核心流程（L1 可省；L2/L3 至少 1 条）

每条流程一图，参与者为**模块级**（必须出现在 §3.1 模块清单中），不下沉到类 / 函数。

- 标题格式：`### §4.x {flow-name}（关联 AC: AC-{req}-xx）`
- 必须显式标注关联的 AC / INV（用于 §8 追溯映射回填）
- 业务意义说明 1-3 行，描述本链路承载的业务价值
- **视觉约定**：新建模块用 `participant`，既有模块用 `actor`（可选）
- **不写**消息中间件、事件 schema、retry 策略、错误码——这些归 dev 阶段

**纯异步事件流的轻量写法**：可不画 sequenceDiagram，改用一行 `模块A 产出 {业务事件} → 模块B 消费`，但仍须关联 AC / INV。

## §7 §5 ADR（含"既有 ADR 引用"行 + 复用充分性自检）

每条 ADR **必须**含以下四段：

- **既有 ADR 引用**（关系 ∈ `{沿用, 撤销, 修订, 取代}`）：列出本 ADR 涉及的既有 ADR（必须可在 proposal §0.1 中找到）；确无既有 ADR 时写 `—` 并证明已检索
- **Context**：为何此处需要决策（业务驱动 / 既有架构约束）
- **Decision**：选择什么（可以提"引入消息队列"但不指定 Kafka / RabbitMQ）
- **Consequence**：接受什么取舍（性能 / 复杂度 / 可演进性）

ADR 编号格式 `ADR-{n}`，n 从 1 起。

**复用充分性自检**（I9 强约束）：**每个标 `[新增]` 的模块必须对应一条 ADR**，该 ADR 的 Decision 段显式回答三问（已检索 proposal §0.2 / 已检索 design `reused_modules` / 为何新建而非扩展既有）。详见 [`./existing-architecture-landscape.md`](./existing-architecture-landscape.md) §5。

## §8 §6 越界声明 + 复用清单（双向）

模板已拆为两子节：

- **§6.1 显式不做**（越界声明）：非空。每条以"不 + 动词"开头（例如 "不修改 BC-Billing 的核费规则" / "不引入新的消息中间件"）
- **§6.2 显式复用**（反向声明）：**`change_mode != greenfield` 时必非空**，与 frontmatter `reused_modules` 严格对齐，逐条说明"复用什么 + 不另起炉灶"

这两子节是 design 阶段的**承诺清单**：§6.1 是"不动什么"，§6.2 是"复用什么"。两者共同形成"架构边界的双向约束"。

## §8.5 §7 架构级风险（轻量）

至少 1 行。仅记录**架构级**风险（选型 / 拆分 / 演进 / 耦合 / 性能瓶颈点），**不含**实现级风险（并发 / 重试 / 异常捕获 / 错误码）。

- 类别闭集枚举：`性能 | 扩展性 | 耦合 | 演进`
- 概率 / 影响 取值：`高 / 中 / 低`
- 缓解策略：必须是**架构层**措施（拆模块 / 引入事件解耦 / 增加抽象层），不写"加重试""加 try-catch"

若识别为"本次 change 无架构级风险"，保留一行 `无识别到架构级风险`，**不得**整节省略——这保证"每次 change 都显式做过风险审视"。

## §9 §8 追溯映射表

覆盖 specs 中**全部** AC 与 INV，零遗漏。每行格式：`| AC-{req}-{seq} | §3 模块 {module-name} 对外契约 / §4.x {flow-name} |`。L2/L3 下若 AC 有对应流程，应同时指向 §3 与 §4。

**自检**：用文本工具在 specs 中提取所有 `AC-` / `INV-` 编号，与本表对照，差集必须为空。

## §9.5 §9 增量闭环自检（`change_mode != greenfield` 必填）

`change_mode != greenfield` 时必填，与 spec L4 增量闭环 DoD 同构。详见模板 §9 自检清单 9 项。`greenfield` 时整段勾"不适用"。

---

## §10 CDR 反向 **5 路**分流（design 阶段特有）

design 阶段的 CDR 批注分流**与 proposal / spec 阶段的"实现细节下推"模式不同**——design 处于规约链中段，既会收到下游（实现侧）的批注，也会收到上游（规约侧）的批注。因此分流方向是**反向 + 5 路**（本次新增"复用建议"路径）：

| 批注类型 | 典型批注 | 分流方向 | 处理人 |
|---------|---------|---------|--------|
| **战略层** | "本 change 与既有架构愿景冲突" / "应该拆成两个 epic" | **反推 proposal 修订**，暂停本阶段 | proposal-writer |
| **规约范围** | "AC-LOGIN-01 应该归属 spec auth-token.md 而非 auth-login.md" / "缺一条 INV" | **反推 spec 修订**，回 spec-writer | spec-writer |
| **实现技术细节** | "BC 划分不合理" / "缺 ADR" / "模块对外契约不清晰" | **直接消化为 ADR / 模块契约调整** | design-writer 自身 |
| **🆕 复用建议** | "应该复用既有 `services/user-service` 而非新建" / "BC-X 与既有 BC-Y 重叠" / "ADR-007 已涵盖此决策，无需新增" | **直接消化为 §3.1 模块清单调整 + §5 ADR 增补 / §6.2 复用清单更新** | design-writer 自身 |
| **工程闭环** | "测试方案怎么定" / "部署拓扑" / "监控告警" | **转交 dev skill**，不在 design 消化 | dev skill |

分流原则：

- 战略层 / 规约范围批注**必须暂停 CDR**，先回上游修订，再回 design
- 实现技术细节批注**必须**就地消化为 §5 ADR 或 §3 模块契约调整（不能转给 dev 等"以后再说"）
- **复用建议批注**（新增）：**必须**就地消化——把 `[新增]` 模块改为 `[已有·扩展]` / `[已有·仅引用]`，在 §5 ADR 中补"已重新评估复用可能"的决策记录，在 §6.2 增条目
- 工程闭环批注**严禁**在 design 内消化（即使 reviewer 强烈要求），否则会让 design 篇幅膨胀、与 dev 阶段职责重叠

CDR 退出条件（对齐 [`../../shared/protocols/cdr-protocol.md`](../../shared/protocols/cdr-protocol.md)）：全部批注按上表分流完成，且本阶段直接消化的批注全部就地解决。

## §11 status 升档前的最后自检

把 `status: draft` 改为 `reviewed` 之前，过一遍 [`./checklist.md`](./checklist.md) 七个 §，任何一条 `[ ]` 未勾选即不允许升档。特别注意：

- **I10 强约束**：`reused_modules.path` 集合 ⊇ 各 spec.frontmatter.impacted_modules 的并集
- **I9 强约束**：每个 `[新增]` 模块在 §5 ADR 中有"复用充分性自检"三问的回答
- **I11 强约束**：`bc_relations` 与 §2.1 BC 表"关系"列严格一一对应