# Empty-Value Convention — 空值表达统一约定

> **本文件是 v2 全部模板与 frontmatter 中"空值"写法的唯一权威**。
> 任何 skill / workflow 引用空值约定时只能链接本文件，不得复述。

---

## §1 两种合法空值

| 形态 | 字面量 | 含义 | 适用对象 |
|------|--------|------|---------|
| 结构化空数组 | `[]` | 空列表 | YAML frontmatter 中**所有列表型字段**、模板正文中以列表呈现的占位段 |
| 行内空值 | `—` (U+2014, EM DASH) | 单值缺失 / 不适用 | YAML frontmatter 中**单值字段**(string)、模板正文表格行内单元格、章节占位行 |

> **法定字面量仅此两种**。其他写法在 v2 任何文件中视为违例。

---

## §2 严禁写法

下列写法在 v2 任何 frontmatter 与模板中**零容忍**:

- `""`(空字符串)
- `null` / `~`(YAML null)
- `/`、`无`、`暂无`、`待定`、`TBD`、`N/A`
- 直接省略 key(标记为 ✅ 必填的字段缺键即视为非法)
- `[null]` / `[""]`(空数组中塞入伪元素)

> workflow 状态机校验、Stage 4 自检脚本均以上列模式做反向 grep。

---

## §3 选用对照表(场景 → 写法)

| 场景 | 字段示例 | 选用 | 备注 |
|------|---------|------|------|
| frontmatter 列表型字段、当前为空 | `related_req`, `related_req_proposal`, `architecture_refs`, `bounded_contexts`, `handover_domains`, `shipped_us` | `[]` | 即便 L1 场景 `bounded_contexts` 必须取 `[]` 而非省略 |
| frontmatter 单值字段、本次不适用 | `milestone` | `—` | 单值字段不存在"空数组"概念 |
| frontmatter 单值字段、有限枚举 | `status`, `req_ledger_state`, `domain_modeling_level`, `domain_model_mode`, `exc_status` | 必须取枚举值 | 枚举类字段**不允许**为空,初始化时取默认枚举(如 `status: draft` / `exc_status: pending`) |
| 模板正文章节当前不适用 | design.md §2.2(L1 场景下 `domain_model_mode: omit`) | 整段省略 | 受 `domain_model_mode` 控制,见 [`frontmatter-schema.md`](./frontmatter-schema.md) §1 |
| 模板正文表格行单元格无值 | tasks.md 任务表中"前置任务"列暂无 | `—` | |
| 模板正文列表段当前为空 | specs.md L2 INV 段当前未识别出 | 段落留 `[]` 或 `(无)` 的等价表达 → 统一写 `[]` | 不允许写"暂无"等中文 |

---

## §4 与其他规则的关系

- 字段必填性 → 见 [`frontmatter-schema.md`](./frontmatter-schema.md) §1 / §5。本文件只规定"为空时怎么写",不规定"何时允许为空"。
- AC 三层口径中"L4 不新增验收点"是**正文规则**,与空值约定无关 → 见 [`ac-vocabulary.md`](./ac-vocabulary.md)。
- workflow 状态机转移时若读到非法空值,统一 reject → 编排层细则在 Stage 3 落地。

---

## §5 校验规则(供 Stage 4 审计)

shared / skills / workflow / templates 全量 grep 反向校验:

- `: ""` (引号空串)
- `: null` / `: ~`
- `: /`(单值字段被写成 `/`)
- `: 无` / `: 暂无` / `: TBD` / `: N/A`
- `\[null\]` / `\[""\]`

任一命中即审计失败。

---

## §6 模板初始化示例

```yaml
---
change_name: user-signup
status: draft
related_req: []          # 列表空 → []
milestone: —             # 单值空 → —
---
```

```yaml
---
change_name: user-signup
status: draft
produced_specs: [specs/user-signup.md]
architecture_refs: []    # 列表空,即便项目无总体架构文档亦写 []
domain_modeling_level: L1
domain_model_mode: omit  # 枚举,不允许空
bounded_contexts: []     # L1 场景下仍必须显式写 []
---
```