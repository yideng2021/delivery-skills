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

## §8 §0.2 代码资产的工具辅助补全（CodeGraph + GitNexus，可选）

§0.2（代码资产）手工 grep 初稿后，可用 CodeGraph/GitNexus 校验**完整性**——查漏手工易漏的间接触达。流程：手工初稿 → 工具查漏 → 人工过滤。

> **适用边界**：本节只服务 **§0.2**。§0.1（业务能力/规约资产）在 spec 账本与 ADR 里、不在代码图谱；§0.3（历史决策/技术债）是 ADR 加人的黑知识——二者**双源工具不适用**，维持账本检索 + grep-over-docs + 人工判断。

### §8.1 查漏间接触达（CodeGraph）

手工 grep 易漏「间接触达」（A→B→C，搜 C 不知道 B）。对 §0.2 已列入口符号：

- 用 `codegraph_callers` / `codegraph_impact` 查调用方与受波及模块，补齐漏列项；
- 用 `codegraph_explore` 取关键接口源码，剔除已 `@Deprecated` / 死代码的误列项。

> 写**能力名 + 意图**即可（如「对 PurchaseService 查调用方」），精确调用签名交给持 MCP schema 的 agent，不在本指南写死。
> **边界**：本步只做**清单查漏与补全**，**不做**影响面深评（blast radius 量化、冲突评估）。后者是 [`brownfield-impact-analyzer`](../brownfield-impact-analyzer-skill/SKILL.md) 的职责——§0.2 出现「替换 / 重构 / 冲突」迹象时转它产 `impact.md`（被动引用，不进主 schema，不改 proposal 正文）。

### §8.2 人工过滤（业务相关性）

工具给的是**结构相关**，§0.2 只收**业务相关**的：

- ✅ **进表**：被本次改动直接修改/调用的 service/接口；被写入的业务数据表
- ❌ **删掉**：通用库/工具类（logging/utils/commons，即便被调用）；框架基础组件（注解/中间件）；与 §1 问题陈述无逻辑关联的项

### §8.3 完整性自检（§0.2）

- [ ] 每个入口符号的**直接调用方**都列了吗？（`codegraph_callers` 验证）
- [ ] 有**间接被波及**的模块漏列吗？（`codegraph_impact`）
- [ ] 有**已废弃**的模块误列吗？（`codegraph_explore` 查 `@Deprecated`）

### §8.4 何时用

| 情景 | 用工具 |
|---|---|
| `change_mode == greenfield` | ❌ 无既有资产 |
| `change_mode != greenfield`，§0.2 初稿已查过代码、较有把握 | ⚠️ 可选，只过自检 |
| `change_mode != greenfield`，§0.2 初稿不确定是否遗漏 | ✅ 强烈建议（手工 grep 遗漏间接触达概率高）|

---

## §9 反模式（用工具时常见问题）

- ❌ **工具补全 = 全盘接受**：把工具给的所有相关资产都塞进 §0.2 → §0.2 膨胀成「整库导出」。**正解**：工具给候选，人工按 §8.2 过滤。
- ❌ **只用工具、不初稿**：跳过手工初稿直接跑工具 → 被工具牵着走。**正解**：先凭经验初稿 1–2 行，再用工具查漏。
- ❌ **不过滤技术相关项**：通用库/框架组件混进 §0.2 → 稀释信息浓度。**正解**：工具找结构相关，人工留业务相关。
- ❌ **拿工具问 §0.1 / §0.3**：用代码图谱查业务能力依赖或业务铁律 → 数据不在那张图里，查不到（详见 §8 适用边界）。**正解**：§0.1 走账本/ADR，§0.3 靠人。
- ❌ **不自检直接上**：跑完工具不过 §8.3 自检 → CDR 时被挑出漏项。**正解**：工具查漏后必过自检清单。