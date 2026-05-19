# proposal-writer-skill

> **一句话定位**:为新 change 起草战略对齐文档(`proposal.md`),回答"为什么做"与"做什么"。

`proposal-writer` 是 spec-design 重构 v2 的四个写手 skill 之一。它仅负责 **proposal 阶段**,产出 `docs/spec/{change_name}/proposal.md`,通过 frontmatter 字段与项目级需求账本(由 `requirements-bookkeeping-skill` 维护)被动协作。

---

## 安装

本 skill 与 `docs/新版skills/v2/` 一同分发。AI 入口为 [`./SKILL.md`](./SKILL.md);人类阅读入口即本文件。

不需要任何 CLI 安装步骤。AI 在识别到"新功能开发 / 需求规约 / 写变更提案"等触发条件时自动加载。

## 平台兼容

- 与 [`requirements-bookkeeping-skill`](../../requirements-bookkeeping-skill/) 协作:**仅通过 frontmatter 字段**(`req_ledger_state` / `related_req_proposal`),不存在命令调用。
- 与同级写手 skill(`spec-writer` / `design-writer` / `task-decomposer`)**互不引用**;协作仅通过 frontmatter 字段。
- 与 [`spec-design-workflow`](../spec-design-workflow/)(Stage 3 落地)解耦:workflow 仅监听 `status: reviewed` 触发阶段转移,不参与 proposal 内部规则。

## 文件结构

```
proposal-writer-skill/
├── README.md                   ← 本文件(人类导航)
├── SKILL.md                    ← AI 入口(触发 / 不变量 / 输入输出契约)
├── templates/
│   └── proposal.md       ← 模板红骨架
└── references/
    ├── how-to-write.md         ← 详尽写作指南
    ├── checklist.md            ← 本阶段唯一验收权威
    └── req-ledger-handshake.md ← 与项目级账本对接细则
```

## 触发条件(简版)

用户说"启动新功能开发 / 写需求提案 / 做需求规约"等;详细 AI 触发逻辑见 [`./SKILL.md`](./SKILL.md)。

## 输出物

- `docs/spec/{change_name}/proposal.md`(单文件,含 frontmatter)

## 不写什么

技术方案、数据模型、API、字段类型、SQL、代码片段——这些归 `design-writer` 与下游 dev skill。