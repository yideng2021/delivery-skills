# Task Decomposer — Redlines (严禁事项)

> 本文件遵循 [`../../shared/templates/writer-references-template.md`](../../shared/templates/writer-references-template.md) §3 redlines 骨架。
> 是 task-decomposer 的硬约束清单。SKILL.md 中仅链接,不复述。
> audit 命中即拒绝 `status: draft → reviewed` 转移。

---

## §1 越权类

- ❌ 引入 design 中不存在的 BC / 模块 / spec 条目(必须反推 design / spec 修订)
- ❌ 出现实现技术细节(测试命令 / 覆盖率 / 框架名 / 版本号 / 部署 / SQL / HTTP / 接口签名)
- ❌ 复述 design / spec 内容(只引用 ID 与 §3 落点)
- ❌ 调用 dev skill 任何命令(零命令名耦合)

> 详细越权红线见 [`./overreach-redlines.md`](./overreach-redlines.md)。

## §2 拆分维度类

- ❌ 跨承接方合并任务(一条 Task 仅一个承接方)
- ❌ 复活旧 Phase 流水线(Scaffolding / Schema / Service / API / UI)

## §3 frontmatter 类

- ❌ 写中文状态枚举(已废弃)与 5 枚举闭集之外的承接方
- ❌ 写 `shipped_us` 字段(由 workflow writeback 注入)
- ❌ 引入 design 未声明的 `bounded_contexts` / `domain_modeling_level`(完全沿用)

## §4 复述类

- ❌ 复述 ac-vocabulary / frontmatter-schema / handover-domains / cdr-protocol 定义(只链接)
