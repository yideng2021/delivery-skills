# 架构层既有资产盘点（Existing Architecture Landscape）

> 本文件是 design 阶段对"既有架构资产"做显式盘点与标记的**唯一权威**。
> design 关注**架构级既有资产**（既有 BC / 既有模块 / 既有领域事件 / 既有 ADR），与 proposal §0（业务/工程级）+ spec L0.x（业务上下文级）正交不重复。
>
> **核心原则**：design 阶段的首要纪律是**复用既有架构能力，而非另起炉灶**。任何"看似新建"的模块都必须先通过"复用充分性自检"，否则视为架构腐化诱因。

---

## §1 三层"既有"对象的边界（避免与 proposal / spec 重复）

| 阶段 | 既有对象 | 关注点 | 词表 | 落地形态 |
|------|---------|--------|------|---------|
| **proposal §0** | 既有 Capability / Spec / REQ-ID / AUTH-ID / ADR / 模块/服务/接口 | "在什么之上改" | §0.1 关系列 / §0.2 触达列 | 三张表 |
| **spec L0.x + INV/AC** | 既有业务实体 / 业务规则 / 业务流转 | "业务规则原本是什么" | 5 项闭集（业务级） | L0.x 表 + 行级标注 |
| **design（本文件）** | **既有 BC / 既有模块 / 既有领域事件 / 既有 ADR** | "**工程结构原本是什么**" | **DDD Context Map + 5 项闭集（架构级）** | §2.1 关系列 / §3.1 标注列 / §5 ADR 引用 / `architecture_refs` 活字段 |

> **黄金准则**：**business assets ≠ architecture assets**。proposal 的"既有模块/服务"是工程级触达列表，design 的"既有模块"是架构级复用对象；同名但视角不同。

---

## §2 四维既有架构资产

### §2.1 D1 — 既有 BC（Bounded Context）

**承载位置**：design §2.1 BC 表的"与既有 BC 关系"列 + frontmatter `bc_relations`。

**关系词表**（DDD Context Map 精简 5 项闭集）：

| 关系 | 含义 | 典型用法 | 反模式 |
|------|------|---------|--------|
| `沿用` | 本 change 完全沿用既有 BC 的边界与语言，不修改 | 本次变更落在既有 BC 内，未触及 BC 间契约 | 写"沿用"但又改了既有 BC 的对外契约 |
| `扩展` | 本 change 在既有 BC 内增加能力，BC 边界与语言**不变** | 在 `BC-order` 内新增"草稿订单"业务态 | 写"扩展"但实际上引入了新的限界（应改为"新建"） |
| `新建` | 本 change 引入新的 BC | 引入 `BC-risk-control` 风控上下文 | 把跨多个既有 BC 的协调逻辑塞进一个"新建" BC |
| `ACL隔离` | 本 change 在两个既有 BC 之间引入防腐层 | 引入 `BC-payment-acl` 隔离支付与订单 | 用 ACL 当作"懒得统一"的逃避 |
| `替换` | 本 change 用新 BC 替换既有 BC（旧 BC 进入废弃路径） | 用 `BC-billing-v2` 替换 `BC-billing` | 替换但不给出迁移路径与兼容期窗口 |

**与 spec L0.x 的边界**：spec L0.x 写"既有业务上下文/Bounded Context"是**业务视角**（用户、流程、合规）；design §2.1 BC 关系列是**架构视角**（边界、契约、防腐）。如果发现两者描述完全雷同，说明 spec 误把架构语言塞进了 L0.x，必须回 spec-writer 修订。

---

### §2.2 D2 — 既有模块 / 服务 / 接口

**承载位置**：design §3.1 模块清单的"增量标注"列 + frontmatter `reused_modules`。

**标注词表**（5 项闭集，与 spec [`../../spec-writer-skill/references/increment-annotation.md`](../../spec-writer-skill/references/increment-annotation.md) 严格对齐）：

| 标注 | 架构语义 | 触发义务 |
|------|---------|---------|
| `[新增]` | 本次首次引入的新模块 | 必须在 §5 ADR 中给出"为何新建而非复用既有"的决策 |
| `[已有·仅引用]` | 既有模块，作为依赖被调用，本次不改 | 必须给出**既有模块路径**作为来源 |
| `[已有·扩展]` | 既有模块新增对外能力，**对外契约扩展但既有契约不破坏** | 必须给出"**扩展点**"一句话说明 + 既有模块路径 |
| `[已有·修改]` | 既有模块**对外契约发生语义变化** | 必须在 §5 ADR 中给出契约 Diff，并标 `[BREAKING]` |
| `[已有·废弃]` | 既有模块本次起停用 | 必须给出**替代模块**与**兼容期窗口** |

**复用充分性自检（强约束）**：
- 每个标 `[新增]` 的模块，必须在 §5 ADR 中显式回答"已检索 `reused_modules` 与 proposal §0.2，确认无可复用既有模块"
- 此项审计为 design 阶段的**核心反腐化纪律**

---

### §2.3 D3 — 既有领域事件（仅 L3 + extended 场景）

**承载位置**：design §2.2.1 领域事件列表的标注 + §4 核心流程的事件引用。

**标注词表**：复用 D2 的 5 项闭集。

**典型用法**：

```markdown
- `[已有·仅引用]` **OrderSubmitted**：既有领域事件，来源 `BC-order`；本次新增的 `BC-risk-control` 订阅此事件以触发风控评分
- `[已有·扩展]` **OrderSubmitted**：本次在事件 payload 中新增"风险等级"业务概念，**扩展点**：消费方向后兼容
- `[已有·废弃]` **OrderConfirmed**：被 `OrderRiskApproved` + `OrderFinalConfirmed` 两事件替代
  - **迁移路径**：旧消费方需切换到新事件
  - **兼容期窗口**：v2.3 起双发，v3.0 停发
```

**反模式**：
- ❌ 把领域事件当作 MQ topic 写（违反 [`./boundary-redlines.md`](./boundary-redlines.md) 红线 1）
- ❌ 在 L1 / L2 场景画领域事件列表（仅 L3+extended 启用）

---

### §2.4 D4 — 既有 ADR 引用

**承载位置**：design §5 ADR 段每条 ADR 的"既有 ADR 引用"行。

**关系词表**（4 项闭集）：

| 关系 | 含义 |
|------|------|
| `沿用` | 本 ADR 与既有 ADR 决策保持一致，仅作背景声明 |
| `撤销` | 本 ADR **撤销**既有 ADR（既有 ADR 进入历史）|
| `修订` | 本 ADR 在既有 ADR 基础上做语义修订（既有 ADR 仍有效，本 ADR 补充约束）|
| `取代` | 本 ADR **取代**既有 ADR 的核心决策（与撤销的区别：取代提供新方向，撤销仅废止）|

**与 ADR 标准（Michael Nygard）的对应**：本约定即 ADR 标准中 `Supersedes` / `Superseded by` 关系的双向追溯落地。

---

## §3 与 `architecture_refs` 活字段的协同

升级后的 `architecture_refs` 每项含 `path` + `usage`（详见 [`./architecture-context-loading.md`](./architecture-context-loading.md) §1）。`usage` 闭集 = `{沿用, 扩展, 约束, 替换}`。

四维既有资产与 `architecture_refs.usage` 的映射：

| 资产维度 | 触发的 `architecture_refs.usage` | 落点 |
|---------|--------------------------------|------|
| D1（BC 关系=沿用/扩展） | `沿用` / `扩展` | §1 架构上下文 + §2.1 BC 表 |
| D1（BC 关系=替换） | `替换` | §1 架构上下文 + §5 ADR |
| D2（模块`[已有·*]`） | 同 D1 映射 | §3.1 模块清单 |
| D4（ADR=撤销/取代） | `替换` | §5 ADR |
| 越界守卫的"不影响子系统" | `约束` | §1 + §6 |

**强约束**：每个 `architecture_refs` 元素必须在 design 正文中至少有一处对应落点；没有对应落点的引用视为"装饰性引用"，audit 拒绝通过。

---

## §4 `change_mode` 与 design 增量字段的联动

| `change_mode` | `reused_modules` | `bc_relations` | `architecture_refs` |
|---------------|------------------|----------------|---------------------|
| `greenfield` | 可空（`[]`） | 取 `[]`（除非 L2/L3） | 可空（除非 §1 引用了既有架构） |
| `extend` | **必非空** | L2/L3 必非空 | 必非空（至少 1 项 `沿用` 或 `扩展`） |
| `refactor` | **必非空且至少 1 条 `[已有·修改]` 或 `[已有·废弃]`** | L2/L3 必非空 | 必非空（至少 1 项 `替换`） |
| `bugfix` | **必非空且至少 1 条 `[已有·修改]`** | 取 `[]`（bugfix 不应触发 BC 关系变化） | 可空 |

`change_mode != greenfield` 但 `reused_modules` 全空 → audit 判定"应改 `change_mode: greenfield`"，拒绝转移（与 spec §5 必填降级同口径）。

---

## §5 复用充分性自检（核心反腐化纪律）

每个标 `[新增]` 的模块，必须在 §5 ADR 中显式回答以下三问：

1. **检索过 proposal §0.2 的既有代码资产？** → 列出已检索的具体路径
2. **检索过 design `reused_modules`？** → 列出已检索的既有模块
3. **为何新建而非扩展既有？** → 一句话技术理由（如"既有模块语义边界与本能力不兼容" / "既有模块已废弃"）

三问任一未答 → audit 拒绝通过；视为"凭直觉造新模块"。

---

## §6 校验规则（供 Stage 4 审计）

- design.md frontmatter `change_mode` 必须 == spec.frontmatter.change_mode（沿用）
- `reused_modules.path` 集合 ⊇ 各 spec.frontmatter.impacted_modules 的并集（design 不允许遗漏 spec 已声明的影响）
- `bc_relations.bc` 集合 == `bounded_contexts` 集合（一一对应）
- `bc_relations.refers_to` 在 `relation != 新建` 时必填
- `architecture_refs[].usage` ∈ 4 项闭集；每项在正文有对应落点
- §3.1 模块清单"增量标注"列 ⊆ 5 项闭集
- 每个标 `[新增]` 的模块在 §5 ADR 中有"复用充分性自检"三问的回答
- L3 + extended 场景下 §2.2.1 领域事件列表带增量标注
- §5 ADR 中所有"既有 ADR 引用"的 relation ⊆ {`沿用`, `撤销`, `修订`, `取代`}