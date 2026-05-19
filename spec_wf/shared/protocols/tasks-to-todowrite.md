# Tasks → TodoWrite — shadow output 转译协议

> 本文件是 task-decomposer 产物 `tasks.md` 转译为 host(如 Claude Code)`TodoWrite` 调用的**单一权威协议**。
> 设计动机:tasks.md 与 Claude Code 内置 TodoWrite 高度重叠(评估 P3-12);shadow output 模式让 markdown 产物 + TodoWrite 状态同时存在,**不破坏现有 schema**。
> 借鉴范式:Claude Code 自带 `TodoWrite` 工具的 content / activeForm 双形态。

---

## §1 协议定位

| 维度 | 描述 |
|------|------|
| **shadow output** | tasks.md(markdown 交付物)+ TodoWrite 调用(host 内运行态)**并存**;markdown 是离线交付,TodoWrite 是会话内进度追踪 |
| **谁来转译** | host 端(如 Claude Code 主对话)在进入 tasks 阶段后**主动**调用本协议生成 TodoWrite;task-decomposer skill 本身**不**调用 TodoWrite |
| **何时转译** | tasks.md `status: reviewed` 时;失败降级 `needs_revision` / `escalated` 时不转译 |
| **状态同步** | host 端定期把 TodoWrite 进度反写为 tasks.md `exc_status`(本协议 §4) |

> 本协议**不修改** schema(tasks frontmatter 字段不变);只描述外部转译规则。

---

## §2 字段映射

### §2.1 tasks.md §2 Task 行 → TodoWrite todos[i]

| tasks.md Task 字段 | TodoWrite 字段 | 转译规则 |
|-------------------|---------------|---------|
| Task 标题 | `content` | 直接复制,首字母大写,**不**追加结尾标点 |
| Task 标题(动词) | `activeForm` | content 改为现在分词形式(如 "Implement auth" → "Implementing auth") |
| 「承接方」列(如 `backend`) | (前缀,可选) | content 前可加 `[backend]` 前缀以便视觉区分 |
| 「关联 design 落点」 | (放 description 备注,host 端实现) | TodoWrite schema 不存 description,可放在 content 后括号 |
| 「覆盖 spec 条目」 | (放 description 备注) | 同上 |
| `exc_status` 全局 | todos[i].status 初值 | 见 §2.2 |

### §2.2 状态字段映射

| tasks.exc_status | todos[i].status 初值 |
|-----------------|--------------------|
| `pending` | 全部 todos `pending` |
| `in_progress` | 仅当前活跃的 1 条 `in_progress`,其余按已完成状态 `completed` 或未启动 `pending` |
| `done` | 全部 todos `completed` |
| `writeback_failed` | 不转译(失败降级中) |

> 转译时**严格保持** TodoWrite "exactly ONE in_progress" 约束;若 tasks.md 中有多条 Task 用户认为同时在做,host 端需要让用户先选定其中一条为 `in_progress`。

---

## §3 转译示例

### 输入(tasks.md §2 摘录)

```markdown
| # | 承接方 | Task | 关联 design 落点 | 覆盖 spec 条目 | 状态 |
|---|------|------|----------------|--------------|------|
| 1 | backend | 实现 user 注册接口 | §3.1 BC-user / mod-user-api | INV-1 / AC-01 | pending |
| 2 | frontend | 接入注册页 | §3.1 BC-user / mod-signup-ui | AC-02 | pending |
| 3 | database | 加 user.email 唯一索引 | §3.2 schema-user | INV-1 | pending |
```

### 输出(TodoWrite 调用)

```javascript
TodoWrite({
  todos: [
    {
      content: "[backend] 实现 user 注册接口 (cov: INV-1, AC-01)",
      activeForm: "[backend] 正在实现 user 注册接口",
      status: "pending"
    },
    {
      content: "[frontend] 接入注册页 (cov: AC-02)",
      activeForm: "[frontend] 正在接入注册页",
      status: "pending"
    },
    {
      content: "[database] 加 user.email 唯一索引 (cov: INV-1)",
      activeForm: "[database] 正在加 user.email 唯一索引",
      status: "pending"
    }
  ]
})
```

---

## §4 反向同步(TodoWrite → tasks.md)

host 在会话期间推进 TodoWrite 状态后,**应**周期性把进度反写回 tasks.md:

| 触发 | 反写动作 |
|------|---------|
| 任一 todo 进入 `in_progress` | tasks `exc_status: pending → in_progress` |
| 全部 todos `completed` | tasks `exc_status: in_progress → done`,触发 workflow writeback |
| 任一 todo 因失败被回退到 pending,且伴随用户主动反馈 | 不改 exc_status,但在 tasks.md 顶部追加 `<!-- todo-rollback: ... -->` 注释 |

> 反向同步**只改 frontmatter**;tasks.md §2 表格保留为离线交付物,不被 TodoWrite 反写覆盖。

---

## §5 不可转译的情形

下列情形 host 端**不应**生成 TodoWrite,而应保持 tasks.md 单形态:

1. `tasks.exc_status == writeback_failed` — 失败降级中
2. `tasks.status == needs_revision` 或 `escalated` — critic / audit 已拒绝
3. tasks.md §2 表格为空(零工单 — 异常态)
4. 用户在 chat 中显式输入 `/tasks no-todowrite` — 退出 shadow 模式

---

## §6 与 spec-critic-skill 的边界

critic 的 verdict **影响**是否转译:

| critic verdict | host 转译动作 |
|---------------|--------------|
| `pass` | 正常转译 |
| `needs_revision` | 撤销已转译的 TodoWrite(清空);等 writer 修复后重新转译 |
| `escalated` | 同上,且不重新自动转译,等用户裁决 |

---

## §7 严禁事项 (Hard Bans)

- ❌ task-decomposer skill 直接调用 TodoWrite(职责在 host 端,不在 skill 内)
- ❌ 把 tasks.md §2 表格视为 TodoWrite 的"伪源代码"(它仍是离线交付物的一等公民)
- ❌ shadow output 模式下 tasks.md 与 TodoWrite 状态长期不一致(host 必须周期性反写)
- ❌ 修改 tasks 的 frontmatter schema 增加 TodoWrite 专属字段(本协议明确**不**改 schema)

---

## §8 校验规则(供 audit / validate.mjs)

- 若用户启用 shadow output 模式但 tasks.md 顶部出现 `<!-- todowrite-disabled -->` 注释,视为协议错误
- 若 tasks `exc_status: in_progress` 但没有任何 todo 在 `in_progress`,反向同步失败(soft 警告)
- 若 host 转译后 TodoWrite todos 数与 tasks.md §2 行数不一致,视为转译丢失(hard,需重新转译)
