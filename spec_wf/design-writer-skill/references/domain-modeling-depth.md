# domain modeling depth(领域建模深度判定)

> 本文件定义 design 阶段如何选择 `domain_modeling_level` 与 `domain_model_mode` 的取值。
>
> **重要更名**:本文件即旧版"复杂度梯度判定"。更名是为了与 workflow 阶段的 **Change-Splitting Guard**(以"复杂度"为信号触发拆分)严格区分——本文件只回答"建模到什么深度",**不回答**"是否拆分 change"。
>
> 字段定义见 [`../../shared/contracts/frontmatter-schema.md`](../../shared/contracts/frontmatter-schema.md) §8 design.md。

---

## §1 三层闭集枚举

`domain_modeling_level` 是闭集枚举,只能取以下三值之一:

| 值 | 含义 | 典型场景 | §2.1 BC 表 | §2.2 战术建模 |
|----|------|----------|------------|--------------|
| `L1` | 极简(不建模) | bug 修复 / 文案调整 / 单点参数变更 | 1 行(单一 BC) | **整段省略** |
| `L2` | 标准(BC 级) | 多模块协作 / 跨能力变更 / 引入新模块 | 2~N 行 | **整段省略** |
| `L3` | 深度(战术级) | 引入新 BC / 重构核心域 / 长周期 epic | 2~N 行 | **必须展开**(`domain_model_mode: extended`) |

`domain_model_mode` 是闭集枚举,只能取以下两值之一:

| 值 | 含义 | 合法前提 |
|----|------|----------|
| `omit` | 省略战术建模(实体 / 值对象 / 聚合根) | L1 / L2 默认值;L3 不允许 |
| `extended` | 展开战术建模 | **仅 `domain_modeling_level: L3` 下合法** |

非法组合(L1/L2 + extended,或 L3 + omit)必须在 §1 frontmatter 校验中拒绝。

## §2 判定流程(skill 执行时的硬性顺序)

design-writer 启动时,按以下顺序判定:

1. **默认 L1**:任何 change 起手默认 `domain_modeling_level: L1`,`domain_model_mode: omit`
2. **触发 L2 的信号**(满足任一):
   - spec `produced_specs` 数 ≥ 2
   - proposal `change_kind ∈ {feature, refactor}` 且影响多个既有模块
   - §1 架构上下文中"本次 change 的架构定位"涉及跨模块协作
   - **既有 BC 关系不清晰**——proposal §0.1 / spec.touched_capabilities 涉及 ≥ 2 个 BC,但本 change 与各 BC 的关系(沿用/扩展/ACL隔离)尚未在 CDR 中明确(C5-10 新增信号)
3. **触发 L3 候选的信号**(满足任一):
   - 本 change 引入**新的限界上下文**(BC)
   - 本 change 重构**核心域**的聚合根 / 领域事件
   - 本 change 是 epic 级(预计跨多个 milestone)
   - reviewer 在 CDR 中明确要求展开战术建模
   - **既有 BC 边界与本 change 存在冲突**——`bc_relations` 中出现 `替换` 或 ≥ 2 项 `ACL隔离`,意味着架构演进性诉求高(C5-10 新增信号)
4. **L3 必须用户确认门**:即使触发 L3 候选信号,skill **不得单方面**升级到 L3。必须在 CDR 中由用户显式确认 "升级到 L3 + extended",否则保持 L2。

第 4 步是硬性约束:**L3 是高成本档位**,意味着 §2.2 必须展开实体 / 值对象 / 聚合根 / 领域事件,显著拉长 design 篇幅与 CDR 周期。skill 主动升级会让用户无法控制工程节奏。

> **新增信号说明(C5-10)**:增量优先视角下,"既有 BC 关系是否清晰"是判定建模深度的重要信号——若多个既有 BC 与本 change 关系混乱,应升级到 L2 显式做 BC 关系标记;若需要重画 BC 边界(替换/ACL隔离),应升级到 L3 做战术建模。**新增信号属于"触发候选"而非"自动升级",L3 仍受第 4 步用户确认门约束**。

## §3 与 workflow Change-Splitting Guard 的边界

| 项 | 本文件(domain-modeling-depth) | workflow Change-Splitting Guard |
|----|-------------------------------|-------------------------------|
| 触发时机 | design 阶段填写 frontmatter 时 | proposal 阶段判定 change 是否过大 |
| 输入信号 | spec 数 / BC 数 / 是否引入新 BC | epic 类型 / milestone 数 / 估算工时 |
| 输出 | `domain_modeling_level` 取值 | "继续" 或 "拆 change" |
| 责任人 | design-writer + reviewer | proposal-writer + workflow guard |

两者**不可互相替代**。design-writer 不负责拆 change(那是 proposal 阶段的事),只负责"在 change 已确定的前提下,建模到什么深度"。

## §4 §2.2 战术建模的展开格式(仅 L3 + extended)

当 `domain_model_mode: extended`,§2.2 必须展开以下两子节:

### §4.1 §2.2.1 实体 / 值对象 / 聚合根 / 领域事件

- **实体(Entity)**:列出本 change 涉及的实体,标注其所属 BC,描述身份标识(不写字段类型)
- **值对象(Value Object)**:列出值对象,描述其业务语义(不写数据结构)
- **聚合根(Aggregate Root)**:列出聚合根,描述其一致性边界(不写持久化方案)
- **领域事件(Domain Event)**:列出本 change 产出 / 消费的领域事件,描述事件的业务含义(不写消息中间件)

战术建模的语言纯净度要求**与 spec L2 INV 同口径**:不出现字段类型、SQL、HTTP、消息队列具体技术名。

### §4.2 §2.2.2 聚合 ER 视图(单聚合可省)

Mermaid `erDiagram`,只画**聚合根之间**与**聚合内核心实体**的关系。

- 关系语义:聚合内用"包含";跨聚合用"引用(仅 ID)"
- **禁止**:字段类型、主外键、索引、表名后缀
- 单聚合场景可省略本子节(不必硬画一个孤节点图)

本图是 **L3 + extended 场景**下的架构层产物,不属于实现细节(实现层 ER 含字段类型,归 dev/database 阶段)。判定边界详见 [`./boundary-redlines.md`](./boundary-redlines.md) §3 灰色地带。

## §5 常见误用与纠正

- **误用 1**:bug 修复 default 写成 L2 → 纠正:bug 应该 L1,bounded_contexts: []
- **误用 2**:多 spec 协作但所有 spec 在同一 BC 内 → 仍然是 L2,不是 L3
- **误用 3**:skill 单方面把 `domain_modeling_level: L2` 升级为 `L3 + extended` → 违反 §2 第 4 步,必须回退到 L2 等用户确认
- **误用 4**:`L1 + extended` 组合 → 非法,必须拒绝(`extended` 只在 L3 下合法)
- **误用 5**:把"模块拆分粒度"塞进 `domain_modeling_level` → 模块粒度归 §3,不归 frontmatter