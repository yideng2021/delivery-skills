# shared/ — 跨 skill 公共契约与协议

> 本目录是 v2 横切规则的**单一权威源 (SSOT)**。
> 所有 skill / workflow 引用本目录内规则时**仅链接**,严禁复述正文。
> 何时引用、为何引用见 [`./protocols/progressive-disclosure.md`](./protocols/progressive-disclosure.md)。

---

## §1 目录结构

```
shared/
├── README.md                       本文件,导航与一句话用途
├── contracts/                      静态契约(数据/枚举/口径)
│   ├── frontmatter-schema.md
│   ├── ac-vocabulary.md
│   ├── empty-value-convention.md
│   └── handover-domains.md
└── protocols/                      行为协议(循环/协作/分层)
    ├── cdr-protocol.md
    └── progressive-disclosure.md
```

---

## §2 文件索引(一句话用途)

| 路径 | 一句话用途 | 引用方 |
|------|-----------|--------|
| [`contracts/frontmatter-schema.md`](./contracts/frontmatter-schema.md) | v2 全部 frontmatter 字段的唯一权威定义(15 字段总表 + 写读流) | 4 个写手 skill / workflow / 所有模板 |
| [`contracts/ac-vocabulary.md`](./contracts/ac-vocabulary.md) | INV-x / AC-xxx-xx / DoD 三层验收口径权威 | spec-writer / task-decomposer |
| [`contracts/empty-value-convention.md`](./contracts/empty-value-convention.md) | 空值表达统一约定(`[]` / `—`) | 4 个写手 skill / 所有模板 |
| [`contracts/handover-domains.md`](./contracts/handover-domains.md) | `handover_domains` 字段取值闭集(5 枚举) | task-decomposer / 下游 dev skill |
| [`protocols/cdr-protocol.md`](./protocols/cdr-protocol.md) | 注释驱动精炼协议(循环步骤 / 批注语法 / 退出条件) | 4 个写手 skill |
| [`protocols/progressive-disclosure.md`](./protocols/progressive-disclosure.md) | SKILL.md / references/ / shared/ 三层架构与规则下沉判定 | 4 个写手 skill / workflow / shared 内部 |

---

## §3 引用纪律

- **链接而非复述**:任何 skill / workflow / 模板需要使用上述规则时,使用 markdown 相对链接到具体章节。
- **单一权威源**:同一规则不得在多处定义;新增横切规则前先确认该规则不在 shared/ 已有文件中。
- **禁令清单**:见 [`../conventions.md`](../conventions.md) §7 Hard Bans。
- **新增 shared 文件流程**:必须先回到 Stage 1 计划([`../plan/stage-1-shared.md`](../plan/stage-1-shared.md))扩充本 README 与对应文件,再供下游引用。

---

## §4 与外部文档的关系

- 全局约定(目录命名、术语、规模预算等) → [`../conventions.md`](../conventions.md)
- 阶段计划与交接 → [`../plan/`](../plan/)
- 重构主索引 → [`../00-master-plan.md`](../00-master-plan.md)