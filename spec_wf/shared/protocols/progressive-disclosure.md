# Progressive Disclosure — 渐进式披露分层策略

> **本文件是 v2 文档分层(SKILL.md / references/ / shared/)的唯一权威**。
> 任何 skill / workflow 在判定"某条规则该写在哪一层"时必须依本文件,链接而不复述。

---

## §1 三层架构

| 层 | 路径 | 角色 | 读取时机 |
|----|------|------|---------|
| **入口层** | `*-skill/SKILL.md` / `spec-design-workflow/WORKFLOW.md` | 触发条件、不变量、输入/输出契约、阶段流程骨架 | LLM 选中 skill / workflow 时**首先**读取 |
| **细节层** | `*-skill/references/*.md` / `spec-design-workflow/references/*.md` | 单一主题的判定细则、checklist、深度规则 | LLM 在执行某具体动作时**按需**读取 |
| **共享层** | `shared/contracts/*.md` / `shared/protocols/*.md` | 跨 skill 公共契约与协议(单一权威源) | 任何 skill / workflow 引用横切规则时读取 |

---

## §2 各层职责边界

### §2.1 入口层(SKILL.md / WORKFLOW.md)

**只写**:
- 触发条件(description / when-to-use)
- 阶段不变量(以声明式句式列出)
- 输入契约 / 输出契约(指向 frontmatter-schema 字段)
- 阶段流程骨架(链接到 references/* 与 shared/*)
- 一句话指向 references/checklist.md

**不写**:
- 具体判定细则(下沉至 references/)
- 横切规则正文(下沉至 shared/)
- 验收标准段(由 references/checklist.md 唯一承载)

**规模**:见 [`../../conventions.md`](../../conventions.md) §3。

### §2.2 细节层(references/)

**只写**:
- 单一主题的深度规则(一文件一主题)
- checklist(各 skill 唯一验收来源)
- 判定流程图、决策树、参考表

**不写**:
- 跨 skill 的公共契约(横切规则上交至 shared/)
- 阶段触发条件(归 SKILL.md)

### §2.3 共享层(shared/)

**只写**:
- 跨 ≥ 2 个 skill / workflow 共用的契约或协议
- 字段、枚举、协议步骤的**单一权威定义**

**不写**:
- 仅 1 个 skill 使用的规则(下放回该 skill 的 references/)
- 阶段流程描述(归 SKILL.md / WORKFLOW.md)

---

## §3 规则下沉判定(写规则时该放哪层?)

回答下列问题以决定层级:

```
该规则被多少个 skill / workflow 引用?
  ├─ ≥ 2 个 → shared/(再细分 contracts/ 或 protocols/)
  └─ 仅 1 个 → 进入下一题
       ↓
   该规则是 LLM 一进入 skill 必须立即知道,还是执行某具体动作时按需读?
       ├─ 必须立即知道 → SKILL.md / WORKFLOW.md 入口层
       └─ 按需读       → references/(单一主题)
```

> 规则一旦定位到某层,**禁止在其他层复述正文**;需要"提及"时一律使用 markdown 相对链接。

---

## §4 contracts vs protocols 二级分类(shared 内部)

| 子目录 | 收录 | 示例 |
|--------|------|------|
| `shared/contracts/` | **静态契约**:数据字段、枚举闭集、术语口径 | `frontmatter-schema.md` / `ac-vocabulary.md` / `empty-value-convention.md` / `handover-domains.md` |
| `shared/protocols/` | **行为协议**:循环步骤、协作机制、分层策略 | `cdr-protocol.md` / `progressive-disclosure.md`(本文件) |

> 新增 shared 文件时:数据/枚举/口径 → contracts;循环/协作/机制 → protocols。

---

## §5 反模式(常见违例)

- ❌ 在 SKILL.md 写完整判定流程图(应下沉 references/)
- ❌ 在 references/ 写跨 skill 共用的字段语义(应上交 shared/contracts/)
- ❌ 在写手 skill 的 SKILL.md 内复述 CDR 循环步骤(只能链接 [`./cdr-protocol.md`](./cdr-protocol.md))
- ❌ 在 workflow 中复述 frontmatter 字段语义(只能链接 [`../contracts/frontmatter-schema.md`](../contracts/frontmatter-schema.md))
- ❌ 在 shared 文件内描述某 skill 的阶段流程(归该 skill SKILL.md)

---

## §6 校验规则(供 Stage 4 审计)

- SKILL.md / WORKFLOW.md 行数超 [`../../conventions.md`](../../conventions.md) §3 上限即审计警告
- shared/ 内出现"阶段流程 / Step 1 / Step 2"等阶段性叙述视为越界
- 在 references/ 内出现 frontmatter 字段定义、CDR 循环步骤、handover_domains 枚举正文视为复述违例