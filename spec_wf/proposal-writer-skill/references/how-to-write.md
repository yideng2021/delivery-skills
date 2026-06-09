# How to Write a Proposal — proposal 阶段写作指南

> 详尽写作指南,SKILL.md 与模板均不复述本文件内容,只链接。
> 写作过程中的横切协议(CDR / 渐进式披露)见 [`../../shared/protocols/`](../../shared/protocols/);字段定义见 [`../../shared/contracts/`](../../shared/contracts/);验收见 [`./checklist.md`](./checklist.md)。

---

## §1 阶段定位

- **目的**:战略对齐——在动笔写 specs 之前,与用户就"为什么做"和"做什么"达成 Go/No-Go 共识。
- **产物**:`docs/spec/{change_name}/proposal.md`。
- **不做的事**:技术方案、数据模型、API 设计、字段类型、SQL、代码片段(那是 design / 下游 dev skill 的职责)。

---

## §2 起草顺序

0. **CG 闸门(强制,生成前)**:走 [`../../shared/protocols/clarification-gate-protocol.md`](../../shared/protocols/clarification-gate-protocol.md) §3 流程;按 §7 表中 proposal 行的"必检字段"做缺口检测,缺口 > 0 时发起封闭式问卷(单 turn ≤ 5 题,每�含 `[d] 使用 AI 默认推断` 兜底)。无论 PASS 或 ABORTED,在 proposal.md 顶部写入 `<!-- clarification-gate -->` 留痕块。**首版动笔前不得跳过本步**。
1. 确定 `change_name`(kebab-case),即文档目录名。
2. 确定 `change_mode`(`greenfield` / `extend` / `refactor` / `bugfix`),写入 frontmatter。
3. **填 §0 既有资产盘点**(详见 [`./existing-landscape.md`](./existing-landscape.md))。即使 `greenfield` 也保留三张表字段位。
4. 检查 `docs/spec/REQUIREMENTS.md` 是否存在 → 写入 frontmatter `req_ledger_state`(详见 [`./req-ledger-handshake.md`](./req-ledger-handshake.md))。
5. 与用户确认 `related_req_proposal`(可为 `[]`)。
6. 按模板章节顺序起草 §1 → §5;§1 必须引用 §0 条目;§2 表的"关联既有资产"列必须可回溯到 §0;`change_mode != greenfield` 时 §2 Backout 段必填。
7. 进入 CDR 循环,直至验收清单全部勾选,并完成 §5 决策前自检 5 项。

### §2.0 CG 与后续步骤的衔接

| CG verdict | Step 1~7 的影响 |
|------------|----------------|
| `PASS`(有 Q&A) | Q&A 中用户的选择直接作为 Step 2/3/5 的输入;不需再次提问 |
| `PASS`(qa: []) | 信息缺口为 0(罕见,通常用户提供完整背景);直接进入 Step 1 |
| `ABORTED` | 用户跳过,AI 用默认推断起草;**后续 CDR 必须至少 1 轮**(不能跳过) |

---

## §3 各章写作要点

### §3.0 §0 既有资产盘点(强制必填)

**核心原则**:在描述"要改什么"之前,先描述"在什么之上改"。即使 `change_mode: greenfield` 也保留三张表的字段位,每行至少填"无",以证明已主动思考。

- §0.1 相关既有能力与文档:5 类(Capability / Spec / REQ-ID / AUTH-ID / ADR);"关系"列闭集 = {沿用, 扩展, 修改, 废弃, 替换, 并存, 无}
- §0.2 相关既有代码资产:粒度任选(模块 / 服务 / 接口 / 数据表)但同表内一致;"触达方式"列闭集 = {读, 写, 改, 替换, 仅引用, 无}
- §0.3 既有约束与历史决策回顾:自由文本,3 类要点(历史决策冲突 / 技术债 / 易踩坑约定)

数据获取纪律:**禁止凭印象填写**,必须基于代码搜索 / 账本扫描 / Wiki 回顾 / 历史 Proposal 回顾,四步至少完成两步。

**§0.2 工具辅助(规则 R)**:`change_mode != greenfield` 且双索引就绪时,§0.2 **默认**走 [`./existing-landscape.md`](./existing-landscape.md) §8 四步协作流(种子→扩展→补网→过滤),并在取证列标来源;不可用/主动跳过在 §0.2 顶部标 `tool_assist: unavailable | skipped — <原因>`。本次是否启用**在 CG 闸门时决定**,并把 `tool_assist:` 行写入 `<!-- clarification-gate -->` 留痕块。§0.1/§0.3 不适用双源工具。

详见 [`./existing-landscape.md`](./existing-landscape.md)。

### §3.1 Problem Statement (Why)

- 1–2 句话陈述**现状**与**痛点**。
- **必须显式引用 §0** 中的具体条目(行号 / 名称),避免在真空中描述痛点。
- 不要描述解决方案;不要含糊形容("快速 / 优雅 / 友好"等)。
- 现状与痛点必须是**用户/业务可感知**的事实,而非"代码不漂亮"等内部主观体感。

### §3.2 Proposed Changes (What)

- 表格 8 列必填:#、类型(新增 / 修改 / 移除)、变更内容、影响范围、**关联既有资产**(来自 §0)、**复用 vs 新建**�**Blast Radius**(受影响下游)、标记。
- "关联既有资产"列 ⊆ §0.1 ∪ §0.2 ∪ `{—}`(纯新增写 `—`)。
- "复用 vs 新建"列闭集 = {新建, 扩展, 复用, 替换, 废弃}。
- "Blast Radius"列必须给出具体下游模块 / 服务名,非"无影响"。
- 破坏性变更**强制**标记 `[BREAKING]`(影响既有契约即视为破坏性)。
- 必须包含**显式排除**段(回答"看似相关但本次不做的事")。
- **Backout / 回滚策略**(`change_mode != greenfield` 时强制):写迁移路径 / 灰度策略 / 兼容期窗口;无回滚需求显式声明"前向兼容,无需回滚"。

### §3.3 Capability Map

- 区分 §3.1 "触达的既有 Capability"与 §3.2 "本次新增 / 拆分的 Capability"。
- §3.1 与 §0.1 中"既有 Capability"行**一一对应**。
- §3.2 每行一个 capability,命名 kebab-case;成为后续 specs 子目录或文件名(`docs/spec/{change_name}/specs/{capability}.md`)。
- 优先级二选一:`P0`(本次必交付)/ `P1`(可延后)。
- Capability 是"业务能力"粒度,不是"功能模块",更不是"代码文件夹"。

### §3.4 Related Requirements

- 仅作为可视化引用,**不重复声明** AUTH-ID 列表;真值在 frontmatter `related_req_proposal`。
- 写法:一句话提示"AUTH-ID 列表见 frontmatter `related_req_proposal`,账本对接见 req-ledger-handshake.md"。

### §3.5 Decision

- 二选一:`Go` / `No-Go`,必须勾选其一。
- `No-Go` 必须给出"决策理由"段。
- `Go` 状态下必须勾选**决策前自检清单**全部 5 项;未全勾不允许升 `status: reviewed`。
- `Go` 状态下,frontmatter 仍然 `status: draft` 直至 CDR 退出条件 + 自检 5 项全部满足后再升 `reviewed`。

---

## §4 frontmatter 写入规则

| 字段 | 取值 | 说明 |
|------|------|------|
| `change_name` | kebab-case 字符串 | 必须与目录 `docs/spec/{change_name}/` 一致 |
| `status` | `draft` 起步,完成 CDR 退出 + §5 自检后写 `reviewed` | 见 [`../../shared/protocols/cdr-protocol.md`](../../shared/protocols/cdr-protocol.md) §6 |
| `change_mode` | `greenfield` \| `extend` \| `refactor` \| `bugfix` | 与 §0 内容一致;`greenfield` 必须 §0 全为"无" |
| `req_ledger_state` | `present` / `missing` / `skipped` | 闭集,见 [`./req-ledger-handshake.md`](./req-ledger-handshake.md) §2 |
| `related_req_proposal` | `[AUTH-xx, ...]` 或 `[]` | 列表型,空时必须写 `[]`(参 [`../../shared/contracts/empty-value-convention.md`](../../shared/contracts/empty-value-convention.md)) |

> 不允许出现 §1 总表外的字段(如 `related_req` / `milestone` / `bounded_contexts`,这些归 specs / design 阶段)。

---

## §5 CDR 在本阶段的运用

- 首版产出后**强制**进入 CDR(至少 1 轮),退出条件以本阶段 [`./checklist.md`](./checklist.md) 全勾选 + 用户停止追加批注为准。
- 用户批注若涉及"实现细节"(如"应该用 Postgres"),应**反向引导**至 design 阶段,proposal 不接受技术实现批注。
- 用户批注若涉及"已经在 specs 范围内的细节"(如"L2 业务规则缺一条"),应**反向引导**至 spec 阶段。
- 完整 CDR 步骤、批注语法、退出条件见 [`../../shared/protocols/cdr-protocol.md`](../../shared/protocols/cdr-protocol.md)。

---

## §6 与下游阶段的衔接

| 下游 | 读取本阶段产物 | 形式 |
|------|---------------|------|
| spec-writer | `change_name` / `related_req_proposal` / `status: reviewed` | frontmatter 字段 |
| RBK skill(被动) | `req_ledger_state` / `related_req_proposal` | frontmatter 字段 |
| workflow | `status: reviewed` 触发阶段二转移 | frontmatter 字段 |

> 任何下游 skill / workflow **仅通过 frontmatter 字段**与本阶段交互,**严禁**调用本 skill 的内部步骤或硬编码命令名。

---

## §7 常见反模式

- ❌ 在 §1 写"我们要做一个 RESTful API"(实现细节,归 design)
- ❌ §1 痛点未引用 §0 任何条目 → 真空描述,审计拒绝通过
- ❌ 在 §2 把"修改 X 模块的鉴权流程"写成 `[BREAKING]` 但不说明对外契约破坏在哪
- ❌ §2 "关联既有资产"列**留空** → 必须填 §0 条目或显式 `—`
- ❌ §2 `[BREAKING]` 项未配套 Backout 段 → 违反 I3
- ❌ 在 §3 把 capability 命名为驼峰或下划线(应为 kebab-case)
- ❌ §3.1 触达的既有 Capability 与 §0.1 不一致 → 双向追溯断链
- ❌ 在 §4 重复列 AUTH-ID(应仅引用 frontmatter 字段)
- ❌ frontmatter 出现 `调用 RBK Uxxx` 或具体命令名(参 §1 严禁事项)
- ❌ frontmatter 省略 `change_mode` → schema §1 必填字段缺失
- ❌ §0 三张表**仅在 `change_mode != greenfield` 才填**(错误理解):任何 mode 都必须保留字段位
- ❌ §0 数据**凭印象**填写:必须基于代码 / 账本 / Wiki 实地检索
- ❌ 一次性产出后直接 `status: reviewed`(违反 CDR · One-shot ban + §5 自检 5 项未勾)
- ❌ proposal.md 首版缺 `<!-- clarification-gate -->` 留痕(违反 CG · One-shot 起草 ban,触发 C7 hard fail)
- ❌ CG 问卷写进 proposal.md 正文(CG 只在 chat 层 + 文档头部注释块)

---

## §8 篇幅与风格

- 篇幅控制 ≤ 2 页(粗估;Markdown 渲染后的可读篇幅)。
- 声明式 > 命令式;表格 / 列表 > 散文。
- 不写 ASCII 装饰图;必要时用 mermaid。
- 风格基线沿用 [`../../conventions.md`](../../conventions.md) §8。