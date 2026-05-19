# Spec Writer — Redlines (严禁事项)

> 本文件遵循 [`../../shared/templates/writer-references-template.md`](../../shared/templates/writer-references-template.md) §3 redlines 骨架。
> 是 spec-writer 的硬约束清单。SKILL.md 中仅链接,不复述。
> audit 命中即拒绝 `status: draft → reviewed` 转移。

---

## §1 越权类

- ❌ 写技术方案 / API 路径 / HTTP code / SQL / 字段类型(归 design-writer)
- ❌ 写测试命令(如 `npm test`)与覆盖率指标
- ❌ 调用 RBK 任何命令(零命令名耦合)

## §2 frontmatter 类

- ❌ 在 frontmatter 使用通配符 `AUTH-*`
- ❌ 单边引入 proposal 未声明的 AUTH(必须反推 proposal 修订)
- ❌ 出现旧字段 `related_specs`(已拆分,spec 视角使用 `reference_specs`)
- ❌ `change_mode != greenfield` 时 `reference_specs` / `touched_capabilities` / `impacted_modules` 三者全空

## §3 增量标注类

- ❌ 自创增量标注(5 项闭集外的 `[改造]` / `[迁移]` / `[重命名]` 等一律违例)
- ❌ `[已有·扩展]` 不给扩展点
- ❌ `[已有·修改]` 不给 Diff 表
- ❌ `[已有·废弃]` 不给迁移路径与兼容期窗口

## §4 DMN 与去重类

- ❌ DMN 启用时为决策表每行规则各写一条 Gherkin Scenario(违反 DMN 与 L3 去重红线)

## §5 复述类

- ❌ 复述 ac-vocabulary / frontmatter-schema / cdr-protocol 定义(只链接)
