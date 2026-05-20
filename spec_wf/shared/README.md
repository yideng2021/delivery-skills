# shared/ — 跨 skill 公共契约与协议

> 本目录是 spec-wf v3 横切规则的**单一权威源 (SSOT)**。
> 所有 skill / workflow 引用本目录内规则时**仅链接**,严禁复述正文。
> 渐进披露原则见 [`./protocols/progressive-disclosure.md`](./protocols/progressive-disclosure.md)。

---

## §1 目录结构

```
shared/
├── README.md                              本文件,导航与一句话用途
├── contracts/                             静态契约(数据/枚举/口径)
│   ├── frontmatter-schema.md              20 字段权威定义(human-readable)
│   ├── frontmatter.schema.json            20 字段权威定义(machine-checkable)
│   ├── ac-vocabulary.md                   INV / AC / DoD 三层口径
│   ├── change-verbs.md                    9 词统一动词表 + 5 处 sub-select
│   ├── empty-value-convention.md          空值统一写法
│   └── handover-domains.md                5 项承接方闭集
├── protocols/                             行为协议(循环/协作/分层)
│   ├── cdr-protocol.md                    注释驱动精炼 + 对话→批注转译
│   ├── clarification-gate-protocol.md     生成前澄清闸门(CG,proposal 强制)
│   ├── progressive-disclosure.md          SKILL.md / references / shared 三层架构
│   └── tasks-to-todowrite.md              tasks.md → TodoWrite shadow output
└── templates/                             跨 skill 共享骨架
    └── writer-references-template.md      4 个 writer references/ 结构骨架
```

---

## §2 引用纪律

- **链接而非复述**:任何 skill / workflow / 模板需要使用上述规则时,使用 markdown 相对链接到具体章节,不抄正文。
- **单一权威源**:同一规则不得在多处定义;新增横切规则前先确认该规则不在 shared/ 已有文件中。
- **新增 shared 文件流程**:更新本 README 目录树 + 在对应文件落地 + 同步更新 [`../spec-wf总结.md`](../spec-wf总结.md) §三 目录结构与 §七 横切机制小节。

---

## §3 与外部文档的关系

- 设计原理总览 → [`../spec-wf总结.md`](../spec-wf总结.md)
- 维护者指南(schema 演进 / 回归测试) → [`../MAINTENANCE.md`](../MAINTENANCE.md)
- 用户上手指南 → [`../USER-GUIDE.md`](../USER-GUIDE.md)