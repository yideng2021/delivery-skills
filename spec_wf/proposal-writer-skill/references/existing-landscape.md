# §0 既有资产盘点写作指南

> 本文件是 proposal §0「既有资产盘点 (Existing Landscape)」的**唯一权威**写作指南。
> proposal §1 Problem Statement 必须**显式引用** §0 中的具体条目；§2 Proposed Changes 表格的\"关联既有资产\"列必须**回溯到** §0 行号。
>
> **核心原则**:在描述"要改什么"之前,先描述"在什么之上改"。
>
> **v3 起填充规则**(消除 greenfield 仪式填充):
> - `change_mode == greenfield`:§0 整节折叠为单行声明 `> §0 已确认 greenfield(无既有资产触达);本节整体省略。`(本指南 §1-§4 不适用)
> - `change_mode != greenfield`:必须保留 §0.1 / §0.2 / §0.3 三张表;§0.1 / §0.2 至少各 1 行非"无"。

---

## §1 §0 三张表的职责分工

| 子节 | 职责 | 数据来源 |
|------|------|---------|
| §0.1 相关既有能力与文档 | 业务级 / 规约级既有资产 | 既有 spec / Capability / REQ-ID / AUTH-ID / ADR / 历史 Proposal |
| §0.2 相关既有代码资产 | 工程级既有资产 | 代码搜索（grep/ 索引）找到的模块 / 服务 / 接口 |
| §0.3 既有约束与历史决策回顾 | 软性背景 | 历史决策、技术债、已知冲突 |

**禁止**：把 §0.2 写成 §0.1 的复述（业务能力 ≠ 代码模块）；把 §0.3 写成 §0.1 / §0.2 的总结。

---

## §2 §0.1 写作要点

### §2.1 表格形态

| 类别 | 名称 / ID | 路径 / 链接 | 与本次变更的关系 |
|------|-----------|-------------|-----------------|
| 既有 Capability | `user-auth` | `docs/spec/auth-base/specs/user-auth.md` | 扩展 |
| 既有 Spec | `auth-base` | 同上 | 扩展 |
| 既有 REQ-ID | `REQ-12` | `docs/spec/auth-base/specs/user-auth.md#REQ-12` | 修改 |
| 既有 AUTH-ID | `AUTH-04` | `docs/spec/REQUIREMENTS.md#AUTH-04` | 沿用 |
| 既有 ADR / 决策 | `ADR-007: 选用邮箱作为登录主标识` | `docs/adr/007-email-as-login-id.md` | 一句话回顾结论：邮箱唯一性约束在租户内 |

### §2.2 \"关系\"列闭集

- **沿用** = 不修改，本次仅引用 / 调用
- **扩展** = 在既有之上新增属性 / 场景，不改变既有语义
- **修改** = 既有发生语义变化（必须在 §2 表中标 `[BREAKING]` 或在下游 spec 标 `[已有·修改]`）
- **废弃** = 本次起停用（必须在 §2 表中给 Backout 兼容期窗口）
- **替换** = 用新资产替换既有；旧资产进入 `废弃` 路径
- **并存** = 新旧并存，分场景路由

### §2.3 数据获取纪律

**禁止凭印象填写**。盘点必须基于：

1. **代码搜索**（按 capability 名 / module 名做 grep / 索引检索）
2. **账本检索**（`docs/spec/REQUIREMENTS.md` 中 AUTH-ID 全表扫描）
3. **Wiki / ADR 回顾**（历史 ADR 全列）
4. **既有 Proposal 回顾**（同领域历史 Proposal 全列）

四步至少完成两步；任一步未做必须在 §0.3 显式声明（如\"本项目无 ADR 沉淀，故跳过 ADR 检索\"）

---

## §3 §0.2 写作要点

### §3.1 表格形态

| 模块 / 服务 / 接口 | 路径 | 触达方式 |
|-------------------|------|----------|
| `user-service` | `services/user-service/` | 改 |
| `POST /api/auth/login` | `services/user-service/internal/auth/login.go` | 替换 |
| `users` 表（mysql） | `migrations/0007_create_users.sql` | 仅引用 |

### §3.2 \"触达方式\"闭集

- **读** = 本次仅作为依赖被读取
- **写** = 本次写入 / 修改状态
- **改** = 本次修改其源代码
- **替换** = 本次替换其实现
- **仅引用** = 文档级引用，不动代码

### §3.3 写作纪律

- **粒度选择**：模块 / 服务 / 接口 / 数据表四级粒度任选，**保持本表内粒度一致**（不能一行写服务、下一行写函数）
- **路径必须可点击**：相对路径或绝对路径；禁止写\"在 user-service 里\"等非机器可读形式
- **本表与 spec frontmatter `impacted_modules` 一一对应**（写法见 [`../../shared/contracts/frontmatter-schema.md`](../../shared/contracts/frontmatter-schema.md) §4.2）

---

## §4 §0.3 写作要点

无表格，自由文本，要点：

- 一句话回顾**与本次变更可能冲突**的历史决策
- 一句话列出**已知技术债 / 未完成项**
- 一句话标记**容易踩坑的既有约定**

**反模式**：
- ❌ 写成\"本次变更的背景介绍\"（那归 §1）
- ❌ 写成\"未来计划\"（那归 §2 或单独的 ROADMAP）
- ❌ 全部写\"无\"（必须主动检索后再判断；若确无，至少声明\"已检索 ADR / Wiki / 历史 Proposal，未发现冲突\"）

---

## §5 与下游 spec frontmatter 的强映射

| §0 子节 | 映射到 spec frontmatter | 强约束 |
|---------|------------------------|--------|
| §0.1 既有 Capability 行 | `touched_capabilities` | 一一对应 |
| §0.1 既有 Spec 行 | spec `reference_specs`（spec 视角，既有 spec 锚） | 一一对应 |
| §0.1 既有 AUTH-ID 行 | proposal `related_req_proposal` + spec `related_req`（按 §0.1 \"关系\"列裁决） | 关系=沿用/仅引用 → 不进 spec `related_req`；关系=扩展/修改/废弃 → 进 |
| §0.2 全表 | `impacted_modules` | 一一对应 |
| §0.3 | 不进 frontmatter，仅作 CDR 上下文 | — |

> spec-writer 在收敛 `related_req` 时，必须**反查** §0.1 表的\"关系\"列；不一致视为违例（详见 [`../spec-writer-skill/references/req-convergence.md`](../../spec-writer-skill/references/req-convergence.md)）。

---

## §6 `change_mode == greenfield` 的退化处理

`change_mode: greenfield` 时：

- §0.1 / §0.2 / §0.3 三张表**字段位必须保留**
- §0.1 / §0.2 表内可仅含 1 行内容为 `无`（即整行所有列填 `无`）
- §0.3 必须显式写\"已确认本项目 / 该领域无相关既有资产\"

**禁止**：整节删除 §0；这是 greenfield 与 extend 的最易混淆边界。

---

## §7 校验规则（供 Stage 4 审计）

- proposal §0 三张表的字段位（表头）**必存**，无论 `change_mode` 取值
- §0.1 \"关系\"列 ⊆ {沿用, 扩展, 修改, 废弃, 替换, 并存, 无}
- §0.2 \"触达方式\"列 ⊆ {读, 写, 改, 替换, 仅引用, 无}
- §1 Problem Statement **必须包含至少一个**指向 §0.1 / §0.2 行号或条目名的引用
- §2 Proposed Changes 表的\"关联既有资产\"列 ⊆ §0.1 ∪ §0.2 ∪ {`—`}（纯新增写 `—`）
- `change_mode != greenfield` 时 §0.1 / §0.2 至少各 1 行非\"无\"

---

## §8 工具辅助补全指南(CodeGraph + GitNexus)(可选)

§0 的三张表可手工初稿后，用**双源工具自动补全**来提升**完整性与准确性**。流程：问题陈述 → 工具自动补全 → 人工过滤。

### §8.1 §0.1（既有业务能力）补全

**触发**：不确定是否漏掉跨域依赖的既有能力

**工具**：GitNexus

**步骤**：
```
用户定义：touched_capabilities = [user-auth, session-mgmt, ...]

① 查依赖关系：
  gitnexus cypher "MATCH (n:Capability)-[DEPENDS_ON]-(m:Capability) 
                   WHERE n.name IN {touched_capabilities} 
                   RETURN m.name, m.domain"
  
② 结果 → 补充进 §0.1（\"与本次变更的关系\"列标为「沿用」或「扩展」）

③ 人工过滤：删掉\"技术相关但业务无关\"的项（见 §8.4）
```

### §8.2 §0.2（既有代码资产）补全

**触发**：不确定是否漏掉间接触达的模块/接口

**工具**：CodeGraph

**步骤**：
```
用户定义：touched_modules_from_§0.2 或直接给入口 service 名

① 查直接调用方：
  codegraph_callers(\"PurchaseService\")
  → 返回 {Controller-X, Service-Y, Task-Z, ...}

② 查间接影响面：
  codegraph_impact(\"PurchaseService\") 
  → 返回 blast radius 中的所有受影响模块

③ 对关键接口取源码确认活跃度：
  codegraph_explore(\"PurchaseService save\")
  → 检查是否有 @Deprecated / is marked as legacy

④ 结果 → 补充进 §0.2（\"触达方式\"按实际调用关系填写）

⑤ 人工过滤：删掉\"技术相关\"的（见 §8.4）
```

### §8.3 §0.3（既有约束与历史决策）补全

**触发**：想系统地识别\"容易踩坑\"的地方

**工具**：CodeGraph(git history) + GitNexus(schema evolution)

**步骤**：
```
用户定义：impacted_modules 名单

① 查历史改动：
  git log --oneline -- src/services/{module}/ | head -20
  → 看是否有 BREAKING / major refactor 的信号

② 查接口契约变化：
  gitnexus api_impact(\"{service-name}\")
  → 返回过去版本中\"参数范围被改\"\"返回类型被改\"的记录

③ 查语义约束：
  gitnexus shape_check(\"{interface-name}\")
  → 验证\"隐含参数范围\"\"事务边界\"\"返回顺序\"是否有过变更

④ 结果 → 整理进 §0.3「既有约束与历史决策」（如\"采购审批的结算流必须经财务层\"）
```

### §8.4 自检清单（完整性）

§0 初稿 + 工具补全后，**必须逐项自检**：

- [ ] **§0.1** 
  - touched_capability 的**直接**依赖能力都列了吗？（用 gitnexus cypher 验证）
  - 有**跨域依赖**被漏掉的吗？（有没有一个能力是多个 domain 的）
  
- [ ] **§0.2**
  - 每个模块的**直接调用方**都列了吗？（用 codegraph_callers 验证）
  - 有**间接被波及的**模块被漏掉的吗？（用 codegraph_impact 的 blast radius）
  - 是否有**已废弃**的模块不小心列进来了？（用 codegraph_explore 检查 @Deprecated）

- [ ] **§0.3**
  - 这些模块**过去有没有改过**（特别是 BREAKING 变更）？（git log 查一遍）
  - 是否有**隐含的业务约束**被遗漏？（问产品 / 查 spec 备注）

### §8.5 过滤原则（业务相关性）

工具给出的\"相关资产\"包括**技术相关和业务相关两种**。§0 只应包含**业务相关**的：

**✅ 应该进 §0：**
- 同一业务域的其他 capability（如 user-auth 与 session-mgmt 同属认证域）
- 被你的改动**直接修改或调用**的 service/接口（如改 PurchaseService，§0.2 应列 PurchaseService）
- 被你的改动写入的**业务数据表**（如改采购流，§0.2 应列 purchase_orders 表）
- 有**显式业务约束**的既有能力（如\"采购必须经财务批\"）

**❌ 应该删掉：**
- 通用库/工具类（如 logging-sdk、utils、commons 等，即便被调用）
- 框架基础组件（如 Spring 注解、Servlet 框架、message-broker 基础设施）
- \"被动依赖\"的第三方服务（如你不改代码，但某个外部系统依赖你 ——那是人家的问题，不是你的既有资产）
- 与**问题陈述（§1）无逻辑关联**的资产（工具查出来但跟你的改动需求八竿子打不着）

### §8.6 何时用、何时不用工具

| 情景 | 用工具补全 | 不用（纯手工）|
|------|-----------|------------|
| `change_mode == greenfield` | ❌ | ✅ 整节折叠为\"无既有资产\" |
| `change_mode != greenfield`，§0.1/§0.2 初稿**完整**（已查过账本、ADR、代码） | ⚠️ 可选（只做自检，不补全） | ✅ |
| `change_mode != greenfield`，§0.1/§0.2 初稿**不确定**是否遗漏 | ✅ **强烈建议** | ❌ 风险高（遗漏概率 > 20%） |
| §0.3 想系统地识别风险 | ✅ | ⚠️ 容易主观 |

### §8.7 与 brownfield-impact-analyzer 的协作

若工具补全的 §0.2 中发现**\"与既有功能的业务冲突\"**或**\"需重构/替换既有能力\"**的迹象（如 relationship 列标了\"替换\"、\"修改\"），可选择调用 [`brownfield-impact-analyzer`](../brownfield-impact-analyzer-skill/SKILL.md) 产生 `impact.md`，进一步评估：

- 冲突的具体点在哪（§2）
- 影响面有多大（§3）
- 如何低耦合地改（§4/§5）

`impact.md` **作为 §0.3 的素材参考**（被动引用），**不进主 schema，不修改 proposal 正文**。

---

## §9 反模式(用工具时常见问题)

- ❌ **工具补全 = 全盘接受**：工具给出的所有相关资产都进 §0 → 导致 §0 膨胀成\"整个代码库导出\"，失去\"精心挑选\"的职责。**正确做法**：工具给候选清单，人工按 §8.5 过滤。
- ❌ **只用工具，不初稿**：跳过手工初稿，直接跑工具 → 容易被工具\"偏见\"（工具给什么就要什么）。**正确做法**：凭经验先初稿 1-2 行，再用工具补全。
- ❌ **工具给的就是真相**：信任工具到底，不过滤技术相关项 → 杂质项混入，淡化 §0 信息浓度。**正确做法**：工具找\"结构相关\"，人工过滤\"业务相关\"。
- ❌ **用工具代替人的黑知识**：完全依赖工具找约束和历史决策 → 漏掉\"代码写不出来\"的业务隐含约束（如\"超预算必过财务\"）。**正确做法**：工具辅助（查历史改动、接口变化），人工补充（业务隐含约束、团队约定）。
- ❌ **不自检，直接上**：跑完工具不做 §8.4 自检 → 等 CDR 时被挑出\"漏掉了\"。**正确做法**：工具补全后必须过一遍自检清单。

---

## §10 校验规则（供 Stage 4 审计）