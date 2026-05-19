# Writer References Template — 4 个 writer skill 的 references/ 结构权威

> 本文件是 4 个 writer skill(proposal / spec / design / task-decomposer)`references/` 目录的**结构骨架**规范。
> 设计动机:消除 4 个 references/ 雷同(评估 P2-1),让阶段特异性集中、公共结构稳定。
> 引用方式:writer 的 references 文件**头部一行**声明 `> 本文件遵循 [`../../shared/templates/writer-references-template.md`](../../shared/templates/writer-references-template.md) §X 结构`,正文按本表分节。

---

## §1 4 个 writer 必备 3 文件

每个 writer 的 `references/` 目录**必含**下列 3 文件(命名固定):

| 文件名 | 内容定位 | 必含分节 |
|--------|---------|---------|
| `checklist.md` | 本阶段验收唯一权威;SKILL.md 不复述 | §1 frontmatter 合规 / §2 阶段特异性 / §3 越界自检 / §4 与下游衔接 / §5 CDR 退出条件 |
| `how-to-write.md` | 写作流程详解;含 CDR 分流 | §1 起草顺序 / §2 段落写法 / §3 CDR 批注分流 / §4 反向复述模板 |
| `redlines.md` | 严禁事项汇总;audit 命中即拒绝转移 | §1 命令/协作类 / §2 frontmatter 类 / §3 阶段特异类 / §4 越权类 / §5 复述类 |

---

## §2 可选 references(阶段特异)

每个 writer 可在必备 3 文件之外**自由扩展**以下类型的差异化文件,文件名以语义为锚:

| 类别 | 示例(已存在) | 说明 |
|------|-------------|------|
| 写作技法 / 句式速查 | `ears-gherkin-cheatsheet.md`(spec) | 短篇,纯技法 |
| 单一字段写法 | `increment-annotation.md`(spec) / `existing-landscape.md`(proposal) | 单字段或单段的深度规则 |
| 收敛 / 转换 | `req-convergence.md`(spec) / `diff-and-migration.md`(spec) | 多源数据如何收敛为本阶段产出 |
| 协议门 | `depth-confirmation.md`(design) | ToolCall 协议或交互门 |
| 内部判定 | `domain-modeling-depth.md`(design) / `dmn-when-and-how.md`(spec) | 阶段内部分支判定 |
| 上下文加载 | `architecture-context-loading.md`(design) / `req-ledger-handshake.md`(proposal) | 输入数据来源与加载顺序 |
| 二级红线 | `boundary-redlines.md`(design) / `overreach-redlines.md`(task) | 比 redlines.md 更细的边界 |

> 命名约定:小写 kebab-case `.md`;**避免**使用 `guide.md` / `notes.md` 等含义模糊的名字。

---

## §3 redlines.md 标准骨架

每个 writer 的 redlines.md **必须**包含以下骨架(各阶段可增删 §3 阶段特异条目):

```markdown
# {Skill 名} — Redlines (严禁事项)

> 本文件是 {skill} 的硬约束清单。SKILL.md 中仅链接,不复述。
> audit 命中即拒绝 `status: draft → reviewed` 转移。

---

## §1 命令与协作类

- ❌ 出现命令名硬编码 / 跨 skill 直接调用
- ❌ 出现旧术语
- ❌ 复述 shared/ 中已定义的协议或契约

## §2 frontmatter 类

- ❌ 缺必填字段 / 出现 schema 之外的字段
- ❌ 使用通配符或自创枚举
- ❌ 出现 v3 已废弃字段(如 `related_specs`)

## §3 {阶段特异} 类

- (各 writer 自行扩充本节,见 §4 示例)

## §4 越权类

- ❌ 涉及下游阶段才该写的内容(如 proposal 写实现细节)
- ❌ 单边引入上游未声明的资产

## §5 复述类

- ❌ 复述 shared/contracts/* 中已定义的字段语义或枚举闭集
```

> §3 各 writer 当前已有差异条目:
> - proposal:§0 既有资产盘点 / Backout
> - spec:增量标注 / DMN 去重
> - design:建模深度 / change_mode 沿用 / 复用充分性自检
> - task:拆解维度 / shipped_us 不得写

---

## §4 checklist.md 标准骨架

```markdown
# {Skill 名} Checklist — {阶段名} 阶段唯一验收权威

> 本文件是 {阶段} 验收**唯一权威**。SKILL.md 不复述任何条目。
> 完成全部勾选 + CDR 退出条件后,可将 frontmatter `status: draft` 改为 `reviewed`。

---

## §1 frontmatter 合规

- [ ] `change_name` / `status` / `change_mode` 三件套字段位与取值合法
- [ ] 阶段特异必填字段已填(见 [`../../shared/contracts/frontmatter-schema.md`](../../shared/contracts/frontmatter-schema.md) §1)
- [ ] 枚举值 ∈ [`frontmatter-schema.md`](../../shared/contracts/frontmatter-schema.md) §4.3 闭集
- [ ] 列表字段语法合法(空列表统一 `[]`,不允许 `null`/省略键)

## §2 {阶段特异}

- (各 writer 自行扩充本节)

## §3 越界自检

- [ ] 不出现下游阶段才该出现的内容
- [ ] 不修改上游产物(如 spec-writer 不改 proposal 字段)

## §4 与下游衔接

- [ ] 下游 skill 通过 frontmatter 字段读到的内容自洽
- [ ] 文件路径在文件系统真实存在

## §5 CDR 退出条件

- [ ] 文档内无未消化批注
- [ ] 上述全部条目勾选 `[x]`
- [ ] 用户显式确认或停止追加批注
```

> 详见 [`../protocols/cdr-protocol.md`](../protocols/cdr-protocol.md) §6。

---

## §5 how-to-write.md 标准骨架

```markdown
# {Skill 名} 写作指南

> 本文件是 {阶段} 的写作流程详解。SKILL.md 不复述本表步骤。

---

## §1 起草顺序

1. 读输入(链 SKILL.md 输入契约表)
2. 起字段 frontmatter
3. 起正文(分节顺序见 §2)
4. 自检(链 checklist.md)
5. 进入 CDR(链 cdr-protocol.md)

## §2 段落写法

- (各 writer 按模板分节列写法要点)

## §3 CDR 批注分流(阶段特异)

- proposal:单向下推
- spec:4 路分流
- design:反向 5 路
- task:反向 4 路

> CDR 协议本身见 [`../../shared/protocols/cdr-protocol.md`](../../shared/protocols/cdr-protocol.md);
> 对话→批注转译见同文件 §4.1。

## §4 反向复述模板

每条批注复述 3 件事:语义 / 影响范围 / 修正动作。
```

---

## §6 严禁事项 (Hard Bans on the template itself)

- ❌ 每个 writer 自行**重新发明** redlines / checklist / how-to-write 的骨架(必须按本表)
- ❌ 在阶段特异 references 里**复述** shared/contracts/* 或 shared/protocols/* 的内容(只链接)
- ❌ 创建命名模糊的 references(如 `notes.md` / `tips.md`)
- ❌ 跨 writer 拷贝完整文件而不做差异化(应继承骨架 + 填阶段差异)

---

## §7 模板演进规则

- 必备 3 文件清单一旦固化,不允许新 writer 跳过
- §3-§5 骨架小节顺序可微调(顺序作为约定),但**必含小节**不可删
- 新增可选 references 类型时,在本文件 §2 表格补一行(便于其他 writer 复用)
