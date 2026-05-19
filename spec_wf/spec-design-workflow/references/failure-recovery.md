# Failure Recovery — workflow 失败降级路径权威

> 本文件是 spec-design-workflow 三条失败降级路径(audit_failed / cdr_stuck / writeback_retry)的唯一权威。
> WORKFLOW.md / stage-graph.md 中所有失败转移**只能链接**本文件,不得复述。
> 设计动机:让 workflow 不再「甩锅给用户」(评估报告 P1-4),失败具有显式状态字段表达 + 显式转移条件。

---

## §1 三条失败路径定位

| # | 名称 | 触发时机 | 落实方式 |
|---|------|---------|---------|
| F1 | **audit_failed** | 阶段切换前跨阶段 checklist 失败,或单文件 schema validator 失败 | 上一阶段产物 `status: reviewed → needs_revision`(回退起草) |
| F2 | **cdr_stuck** | CDR 循环超过阈值(默认 6 轮)仍有未消化批注 | 当前阶段产物 `status: draft → escalated`(标记人工介入) |
| F3 | **writeback_retry** | writeback 阶段数据构造异常(扫描 spec L4 失败 / `related_design` 路径不存在等) | `tasks.exc_status: done → writeback_failed`,人工修正后由用户改回 `done` 重试 |

> F1 / F2 / F3 三者**正交**;同一时刻最多触发一条。

---

## §2 状态字段语义

新增枚举值(已纳入 [`../../shared/contracts/frontmatter-schema.md`](../../shared/contracts/frontmatter-schema.md) §4.3):

| 字段 | 新增枚举 | 触发方 | 含义 | 何时清除 |
|------|---------|-------|------|---------|
| `status` | `needs_revision` | workflow(F1) | 上一阶段 reviewed 后被发现违例,要求重新起草 | 用户修复违例后由 skill 改回 `draft`,然后正常走 CDR → `reviewed` |
| `status` | `escalated` | workflow(F2) | CDR 6 轮未收敛,workflow 拒绝继续推进 | 用户人工介入,显式裁决批注后 skill 改回 `draft` 恢复正常 |
| `exc_status` | `writeback_failed` | workflow(F3) | writeback 数据构造异常 | 用户修正引用路径 / DoD 勾选状态后改回 `done` 触发重试 |

> 三个值都是**合法值**,不是「错误状态」;它们让失败成为系统内的一等公民,而非边界外的「卡死」。

---

## §3 转移条件表

| From → To | 条件 | 状态写入 |
|-----------|------|---------|
| `proposal/specs/design (reviewed)` → `needs_revision` | 跨阶段 checklist 任一失败 / single-file schema validator 失败 | 对应文件 `status: needs_revision` |
| `needs_revision` → `draft` | 用户/skill 修复违例,准备重新走 CDR | 对应文件 `status: draft` |
| `draft (CDR loop count ≥ 6)` → `escalated` | CDR 第 6 轮仍有未消化批注 | 对应文件 `status: escalated` |
| `escalated` → `draft` | 用户人工裁决批注后 skill 复位 | 对应文件 `status: draft` |
| `tasks.exc_status: done` → `writeback_failed` | writeback 期间任一异常(详见 §4) | `tasks.exc_status: writeback_failed` |
| `writeback_failed` → `done` | 用户修复后手动改回 | `tasks.exc_status: done` |

> 所有降级转移都**不丢失**已通过的字段;仅修改单一状态字段。下游 audit / RBK 通过状态字段判定可见性。

---

## §4 F3 writeback 异常的判定子集

writeback 阶段(workflow 写 `shipped_us`)出现下列任一即触发 F3:

1. `tasks.related_design` 路径不存在 / 不可读
2. design `produced_specs` 中任一 spec 文件不存在 / 不可读
3. 任一 spec L4 DoD 段格式异常(不能识别 `[x] US-xxx`)
4. 扫描出的 US-ID 与 `tasks` 中 §2 Task 列表不一致(US 引用悬空)
5. 写入 `tasks.shipped_us` 时 frontmatter 序列化失败

> workflow 在 F3 触发后**不写** `shipped_us`,而是写 `exc_status: writeback_failed` + 在 tasks.md 顶部追加 markdown 注释 `<!-- writeback-failure: <reason> -->`,供用户检视。

---

## §5 cdr_stuck 阈值与豁免

- 默认阈值 = 6 轮(经验值,与 [`../../shared/protocols/cdr-protocol.md`](../../shared/protocols/cdr-protocol.md) §3 「无上限」并不冲突,本节是 workflow 视角的人工介入触发线)
- 用户可在 proposal frontmatter 添加 `cdr_loop_threshold: <int>` 显式覆盖(可选字段,未在 schema 强制)
- 阈值定义为「workflow 观察到的连续未通过 CDR 退出条件的批注循环次数」;一旦 `status: reviewed`,计数归零

---

## §6 与 RBK 的协作

- `needs_revision` / `escalated` 状态下,RBK **不**触发任何账本写入(等待 `reviewed`)
- `writeback_failed` 状态下,RBK **不**触发任何 `shipped_us` 监听动作(等待 `done`)
- workflow 不主动通知 RBK 失败;RBK 通过字段被动得知

---

## §7 严禁事项 (Hard Bans)

- ❌ 把 `needs_revision` / `escalated` / `writeback_failed` 作为「常规终态」长期挂着(它们应只是「短期反向状态」)
- ❌ skill 单方面把 `needs_revision` 改回 `reviewed`(必须先回 `draft` 走 CDR)
- ❌ workflow 在 F1 / F2 / F3 触发后**继续推进下一阶段**(必须在原节点保持/降级)
- ❌ 在 SKILL.md 复述本文件三条路径(只能链接)

---

## §8 校验规则(供 audit / validator)

validator 当前仅扩展枚举闭集,不强制三条失败路径的逻辑(因为它们是「状态结果」,触发逻辑在 workflow 编排层)。audit 阶段可加以下检查:

- 任一文件 `status: needs_revision` 持续超过 14 天 → audit 警告(疑似遗忘)
- 任一文件 `status: escalated` 缺少配套 markdown 批注说明 → audit 警告
- `tasks.exc_status: writeback_failed` 但 tasks.md 顶部无 `<!-- writeback-failure: -->` 注释 → audit 警告
