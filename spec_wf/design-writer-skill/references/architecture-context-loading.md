# architecture context loading（既有架构上下文加载策略）

> 本文件回答一个问题：**design 阶段如何把"既有架构"作为上下文带入，而不是凭空设计**。
> 字段定义见 [`../../shared/contracts/frontmatter-schema.md`](../../shared/contracts/frontmatter-schema.md) §8 design.md；
> 架构层既有资产四维盘点见 [`./existing-architecture-landscape.md`](./existing-architecture-landscape.md)。

---

## §1 `architecture_refs` 字段语义（**活字段**）

`architecture_refs` 是 design.md frontmatter 的**架构锚点活字段**，用于显式声明"本次 change 设计时**参考 / 影响 / 不影响**的既有架构文档**及其用途**"。

**字段结构**（每项含两子字段）：

```yaml
architecture_refs:
  - { path: docs/auth-arch.md, usage: 扩展 }
  - { path: docs/ARCHITECTURE.md, usage: 约束 }
  - { path: docs/legacy/billing-v1.md, usage: 替换 }
```

**`usage` 闭集**（4 项）：

| 用途 | 含义 | 触发的正文落点 |
|------|------|---------------|
| `沿用` | 本 change 完全沿用该架构文档的决策与边界，不修改 | §1 架构上下文 + §2.1 BC 表（关系=沿用）|
| `扩展` | 本 change 在该架构文档基础上做扩展，**不改变**既有契约 | §1 架构上下文 + §3.1 模块清单（标 `[已有·扩展]`）|
| `约束` | 该架构文档是本 change 的边界守卫，**不得突破** | §1 + §6.1 越界声明 |
| `替换` | 本 change 用新架构取代该文档的核心决策 | §1 + §5 ADR（关系=取代/撤销）|

> **从单向死字段升级为活字段**：旧版 `architecture_refs` 是路径列表，对人类 reviewer 的承诺；新版 `architecture_refs` 是路径+用途对象列表，**机器可读 + audit 可校验**。

## §2 何时必须填写 `architecture_refs`

满足以下**任一**条件即必须非空：

1. 本 change 修改 / 扩展了已有的子系统、模块、限界上下文（`usage: 扩展`）
2. 本 change 引用了既有的契约（对外 API、领域事件、底层基础设施）（`usage: 沿用`）
3. §6.1 越界声明引用了"不修改 {子系统 X}"——则 X 的架构文档应在 `architecture_refs` 中（`usage: 约束`）
4. §5 ADR 标记"取代"既有架构决策（`usage: 替换`）

仅当本 change 是**纯新增、与既有架构零交集**（`change_mode: greenfield` 且确无既有架构文档）时，`architecture_refs: []` 才合法。

## §3 上下文加载顺序（skill 执行时的硬性顺序）

design-writer skill 启动时，按以下顺序加载上下文，**不得跳级**：

1. 读 proposal.md frontmatter（获取 `change_name / change_mode`）+ §0 既有资产盘点（`§0.1` 既有架构 ADR 引用 / `§0.2` 既有代码资产）
2. 读 `produced_specs` 列出的所有 spec 文件 frontmatter（获取 `change_mode / related_req / impacted_modules / touched_capabilities / milestone`）
3. 读 spec 正文的 L0~L4（获取业务约束、AC、DoD）
4. **询问用户**或**主动列出候选** `architecture_refs` 路径（基于 proposal §0.1 ADR 引用 + 文件系统扫描）；**每项必须确定 `usage`**
5. 读 `architecture_refs` 列出的架构文档（若用户确认）
6. 在以上上下文齐备后，**按 [`./existing-architecture-landscape.md`](./existing-architecture-landscape.md) §2 四维盘点**填写 frontmatter `bc_relations` / `reused_modules`，再开始填写 design.md §1

跳过第 4-5 步直接进入填写 = **凭空设计**，违反 design 阶段契约。
跳过第 6 步直接填写正文 = 增量字段空白，违反 I8 / I9 / I10 / I11。

## §4 §1 架构上下文的三栏写法

§1 必须包含三个固定栏目，缺一不可：

- **既有架构引用**：**逐项列出** `architecture_refs` 中的 `path` 与 `usage`，并指出本 change 触及的章节（例如 "auth-arch.md §3.2 token 颁发流程；用途 = 扩展"）。**装饰性引用**（路径在正文找不到对应说明）视为违例
- **本次 change 的架构定位**：一句话说明本 change 影响哪一层 / 哪些边界（不写实现细节）
- **不影响的子系统**：显式越界守卫；引用的子系统应在 `architecture_refs` 中标 `usage: 约束`

三栏齐全是为了让 reviewer 能在不打开 architecture_refs 的情况下，快速判断"本 change 在系统中的位置"。

## §5 与 spec 阶段的边界

design 的"架构上下文"**不是**对 spec L0 业务禁区的复述。两者口径不同：

- spec L0 = **业务禁区**（例如 "不允许超额提现"）——业务语言
- design §1 = **架构定位**（例如 "影响 auth 子系统的 token 颁发层"）——技术边界语言

若 §1 写出了业务语言，说明误把 spec 内容搬到了 design，需回 spec-writer 修订。

## §6 与 task-decomposer 的契约

task-decomposer 不读 `architecture_refs` 字段（它读 `domain_modeling_level / bounded_contexts / produced_specs / reused_modules / bc_relations`）。`architecture_refs` 是 design 阶段**对人类 reviewer + audit 的承诺**，不是对下游 skill 的契约。

这意味着：`architecture_refs` 缺失或不准确**不会**让下游 skill 立刻报错，但会让 CDR 阶段的 reviewer 与 Stage 4 audit 无法验证 §1 的合理性，从而阻塞 `status: reviewed`。

## §7 校验规则（供 Stage 4 审计）

- `architecture_refs` 每项必含 `path` + `usage` 两子字段；缺一即非法 frontmatter
- `architecture_refs[].usage` ∈ `{沿用, 扩展, 约束, 替换}` 闭集
- 每个 `architecture_refs` 元素必须在 design 正文（§1 / §3 / §5 / §6.1）有至少一处对应说明（**装饰性引用**审计拒绝通过）
- `usage: 替换` 必须对应 §5 ADR 中"既有 ADR 引用"关系为 `撤销` 或 `取代` 的至少一条 ADR
- `usage: 约束` 必须对应 §6.1 越界声明中至少一条"不修改 X"