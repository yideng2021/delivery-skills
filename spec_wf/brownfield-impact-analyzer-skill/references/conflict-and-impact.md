# 冲突识别 + 影响评估写法(§2 / §3)

> 本文件是 `impact.md` §2「冲突点」与 §3「影响面」的写法权威。SKILL.md 不复述本文条目。
> 命名遵循 spec_wf 既有约定:小写 kebab-case `.md`,语义为锚。

---

## §1 冲突识别(对应 impact.md §2)

### §1.1 三类冲突(闭集)

| 类型 | 定义 | 典型迹象 |
|------|------|---------|
| **语义冲突** | 改动后既有功能行为含义变化,调用方可能基于旧语义编写 | 接口签名不变但 contract 变;状态机迁移规则变;默认值变 |
| **接口变更** | 既有 public 接口签名 / 返回类型 / 异常类型变化 | 入参增减;返回结构调整;新增异常 |
| **在途变更** | 与未合并 PR / 未发布 ADR / 已立项未交付 spec 重叠 | git 同区域未合并提交;同 capability 已有 in-progress proposal |

> 三类外的"冲突"不属于本 skill 范畴(如:UI 视觉冲突、性能 SLO 抢占等),按需在 §3 影响面记录或交由其它 skill。

### §1.2 检索清单(AI 自查,顺序固定;双源融合)

1. `proposal/spec/design/tasks` 文档历史:同 `change_name`/`touched_capabilities`/`impacted_modules` 的近 N 个 change
2. CODEOWNERS / git log:改动文件的所有权与近 30 天提交者集;开放 PR/branch 同路径(工作树改动用 `gitnexus detect_changes`,跨分支 PR 走 git)
3. **调用方反链(CodeGraph)**:`codegraph_callers` / `codegraph_impact` 列出受改符号的所有引用点与波及面(含动态分发,优于裸搜索)
4. **语义域归属(GitNexus)**:`cypher MEMBER_OF` / `gitnexus context` 看受改符号属哪个业务域、被哪些流程引用
5. **契约一致性(GitNexus)**:`shape_check` / `api_impact` 检既有对外接口 / 跨服务契约是否被破坏
6. 既有 ADR / change-verbs 注记:`[已有·扩展]` / `[已有·修改]` / `[已有·废弃]` 的历史结论

> 检索过程不必在 §2 表中复述;**未发现冲突**时,§2 下方一行写明已检索的范围即可(诚实性兜底)。

### §1.3 §2 表填写规则

- **冲突对象**:写**具体**到符号 / 接口 / PR 编号,不写「相关功能」之类的模糊词
- **类型**:闭集三选一(语义冲突 / 接口变更 / 在途变更);多类型并存时拆多行
- **与既有的关系**:三选一(替换 / 并存 / 废弃,复用 change-verbs 词表);**不**写"待定"——不确定的关系应在 §5 给降耦合原则交 design 决断,而非把"待定"下传

### §1.4 与上游 writer 的衔接素材

| impact §2 字段 | 回填到 |
|----------------|--------|
| 冲突对象 + 类型 | proposal §0.3「既有约束与历史决策」一行 |
| 与既有的关系 | proposal §2「关联既有资产」列(替换/并存/废弃 → 复用 [`../../shared/contracts/change-verbs.md`](../../shared/contracts/change-verbs.md) 词表;注:`并存` 为 proposal §0.1 粗粒度词) |
| 关系=废弃 | spec `[已有·废弃]` 的兼容期窗口输入 |

> 仅"被动引用"——本 skill 不替 writer 写,writer 自行决定采纳与否。

---

## §2 影响评估(对应 impact.md §3)

### §2.1 五维评估(闭集)

| 维度 | 评估问 | 典型证据(双源) |
|------|--------|---------|
| **接口契约** | public API / RPC / 事件 schema 是否变化? | GitNexus `shape_check` / `api_impact` 契约 diff |
| **数据语义** | 数据库字段 / 缓存键 / 消息载荷的含义是否变化? | 字段含义变;枚举扩展;时区/单位变更(`codegraph_explore` 取实体源码核对) |
| **调用方** | 谁在调?上下游服务 / 前端页面 / 离线任务 / 其它团队? | CodeGraph `codegraph_callers`/`codegraph_impact` 反链 + GitNexus 业务域归属 + CODEOWNERS |
| **配置 / 开关** | 配置项 / feature flag / 环境变量 / RBAC 策略是否变? | config 文件 diff;新增 flag |
| **运行时 / 部署** | 部署单元 / 资源依赖 / 启动顺序是否变? | 新增依赖 / 容器变更 / 启动钩子 |

> 证据优先级:**结构性影响走 CodeGraph(反链/blast radius),语义域与契约走 GitNexus**;两源交叉一致的结论置信度最高。

> 维度按需选填,**至少 1 行非「无影响」**;全为「无影响」时显式写明(诚实性兜底)。

### §2.2 风险等级(闭集)

| 等级 | 判据(任一即升) |
|------|------------------|
| 低 | 单团队 ∧ 无 public 接口变更 ∧ 无数据语义变更 ∧ 调用方 ≤ 1 |
| 中 | 跨 1 个团队 ∨ 接口扩展(向后兼容) ∨ 配置新增 |
| 高 | 跨 ≥ 2 团队 ∨ 接口破坏性变更 ∨ 数据语义变更 ∨ 触发数据迁移 ∨ 含 `[BREAKING]` |

> 风险等级是给上游 writer 的**判断素材**(高风险通常意味着应走完整规约链),由 proposal/spec 自行裁决,本 skill 不做路由决策。

### §2.3 §3 表填写规则

- **现状 / 变更后**:具体到字段 / 接口 / 配置项名,不写「优化一下」
- **影响范围**:写**调用方清单或反链证据**(`{service-a, service-b, frontend-cart}` 而非「上下游」)
- **风险**:按 §2.2 判据机械产出;**不**主观打分

### §2.4 与上游 writer 的衔接素材

| impact §3 字段 | 回填到 |
|----------------|--------|
| 五维评估 + 风险等级 | proposal §2「Blast Radius」列(proposal 模板**已有**该列) |
| 调用方反链 | spec `impacted_modules` 的扩展依据 |
| 接口契约 / 数据语义 变更 | spec `[已有·修改]` Diff 表的输入素材 |

---

## §3 常见反模式(命中即重写本节)

- ❌ 把"性能可能下降"当冲突写入 §2(那是风险,归 §3 影响面)
- ❌ §2 关系写"待定" / "TBD"(不确定应在 §5 给降耦合原则交 design,不下传"待定")
- ❌ §3 影响范围写"全局" / "整个系统"(模糊词,必须给出**具体调用方清单**)
- ❌ §3 现状 / 变更后写"优化" / "重构" / "增强"(非可验证陈述,必须含具体字段或行为)
- ❌ 在本文件复述 [`../../shared/contracts/change-verbs.md`](../../shared/contracts/change-verbs.md) 的词表语义(只能链接)

---

## §4 与下游 references 的边界

- 侵入阶梯 / 接缝点 → [`invasion-and-seam.md`](./invasion-and-seam.md)
- 低耦合/低影响设计规则目录 → [`design-rules.md`](./design-rules.md)

> 本文件仅管"冲突 + 影响"两节;不越界到侵入策略与设计规则。
