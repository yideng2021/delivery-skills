---
name: task-decomposer
description: 把 design 的模块对外契约切分为 `承接方 × BC` 维度的工单清单(`docs/spec/{change_name}/tasks.md`)。固定 4 段结构,严守越权红线(不引入新规约,不写实现细节)。本 skill 仅写 tasks.md,不调用 dev skill 任何命令。
---

# Task Decomposer

## 触发

任一条件成立即加载:
- design 已 `status: reviewed`,要求进入 task 阶段
- 用户要求增删 Task / 调整承接方 / 调整粒度
- workflow 从 design 路由进入
- 提到「拆任务 / 拆 task / 工单 / 承接方分配 / 进度表」

## 不变量(精简)

1. **越权红线**严格执行(不引入新 BC / spec 条目;不写测试命令 / 框架名 / 部署),见 [`references/overreach-redlines.md`](references/overreach-redlines.md)
2. **拆解二维 = `承接方 × BC`**;严禁复活旧 Phase 流水线(Scaffolding/Schema/Service/API/UI),见 [`references/decomposition-rules.md`](references/decomposition-rules.md)
3. `handover_domains` ⊆ `{database, backend, frontend, integration, infra}`(见 [`shared/contracts/handover-domains.md`](../shared/contracts/handover-domains.md));一条 Task 仅一个承接方
4. `domain_modeling_level` / `bounded_contexts` 完全沿用 design(子集语义,不引入新值)
5. `exc_status` ∈ `{pending, in_progress, done}`;**严禁**写 `shipped_us`(由 workflow writeback 注入)
6. specs 中全部 AC / INV / US **零遗漏 + 零重复**地分配到 §2 Task
7. CDR 退出后才升 `status: reviewed`(见 [`shared/protocols/cdr-protocol.md`](../shared/protocols/cdr-protocol.md))
8. **reviewed 由用户裁决**:skill **不得**自行把 `status` 从 `draft` 升 `reviewed`;CDR 退出 + checklist 全勾选后必须以 ToolCall 三选项形态请用户裁决:`[1] 满意,升 reviewed` / `[2] 还需修改` / `[3] 重拆 tasks`,得到 `[1]` 才执行 frontmatter 字段升级。

## 输入

| 来源 | 字段 / 段落 | 用途 |
|------|------------|------|
| design frontmatter | `change_name` / `domain_modeling_level` / `bounded_contexts` / `produced_specs` | 锚定 / 沿用 / 顺藤摸瓜读 spec |
| design 正文 §3 / §6 / §7 | 模块契约 / 越界声明 / 追溯 | 填 §2 Task / §3 越权声明 / 关联 design 落点 |
| spec 正文 L0~L4 | AC / INV / US | 填 §2 Task「覆盖 spec 条目」 |

## 输出 frontmatter(权威 schema 见 [shared/contracts/frontmatter-schema.md](../shared/contracts/frontmatter-schema.md))

| 字段 | 取值 | 说明 |
|------|------|------|
| `change_name` | kebab-case | 与 proposal/spec/design 一致 |
| `status` | `draft` → `reviewed` | CDR 退出后升 reviewed |
| `related_design` | path | 通常 `design.md` |
| `domain_modeling_level` | 沿用 design | — |
| `bounded_contexts` | design 子集 | — |
| `handover_domains` | 5 枚举子集 | 从 §2 Task 承接方做并集 |
| `exc_status` | `pending` \| `in_progress` \| `done` | 起手 `pending` |

> **不写** `shipped_us`(workflow writeback 注入)。

## 与下游衔接

- dev skill 消费:§2 Task 列表 + `handover_domains`
- workflow:监听 `exc_status`(`done` 触发 writeback)
- RBK(被动):监听 workflow 注入后的 `shipped_us`
- **host(如 Claude Code)**:按 [`../shared/protocols/tasks-to-todowrite.md`](../shared/protocols/tasks-to-todowrite.md) 把 tasks.md §2 转译为 TodoWrite 调用(shadow output 模式);task-decomposer skill 本身**不**调用 TodoWrite

## 文件导航

- 模板:[`templates/tasks.md`](templates/tasks.md)
- 写作指南 / 拆解原则 / 越权红线 / 验收清单:见 [`references/`](references/)
- **严禁事项**:[`references/redlines.md`](references/redlines.md)
- 机械校验:`node ../scripts/validate.mjs docs/spec/{change_name}/`
