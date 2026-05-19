---
name: spec-critic
description: 对 4 个 writer skill(proposal / spec / design / tasks)的产出做 LLM-as-Judge 反向审查,消化常规违例后输出 `pass` / `needs_revision` / `escalated` 三态裁决,降低 audit 末尾兜底负担。被 workflow 在阶段切换前自动触发;也可被用户主动调用。本 skill 不修改产物正文,仅写一份 critic 报告 + 触发 workflow 失败降级路径(F1/F2)。
---

# Spec Critic (LLM-as-Judge)

## 触发

任一条件成立即加载:
- workflow 检测到任一阶段产物 `status: draft → reviewed`(自动审查门)
- 用户主动请求「critic 一下 proposal/spec/design/tasks」
- audit 阶段 `scripts/validate.mjs` 报告 hard 违例(L3 留痕 / writeback 注释 / critic 格式)

## 角色定位

| 维度 | 边界 |
|------|------|
| 与 4 个 writer | **不修改** writer 产出正文;只写 critic 报告 + 改 `status`(走 F1) |
| 与 workflow | 受 workflow 触发,**不抢编排权**;critic 报告完成后 workflow 据其 verdict 走转移 |
| 与 audit | critic 是「软审查」(LLM-as-Judge),audit 是「硬审查」(deterministic scripts);两者**正交叠加** |
| 与 CDR | critic 不发批注,只发 verdict;**真正的反馈循环**仍由 CDR 承担 |

## 不变量

1. **不改正文**:critic 只写 `docs/spec/{change_name}/critic.md`(报告)+ 改对应文件 `status`;**严禁**改正文
2. **三态裁决闭集**:`pass` / `needs_revision` / `escalated`,与 [`shared/contracts/frontmatter-schema.md`](../shared/contracts/frontmatter-schema.md) status 枚举对齐
3. **每次裁决一份新报告**:不覆盖历史 critic 报告(`critic.md` 文件采用追加式,见 [`references/critic-protocol.md`](references/critic-protocol.md) §3)
4. **不复述** ac-vocabulary / frontmatter-schema / cdr-protocol / failure-recovery 定义
5. **不调用** RBK / dev skill / 4 个 writer 的任何能力(零命令名耦合)
6. **可被绕过**:critic 是「软门」,用户可显式跳过(在 chat 中输入 `/critic skip`)

## 输入

| 来源 | 字段 / 文件 | 用途 |
|------|------------|------|
| 触发阶段产物 | `docs/spec/{change_name}/{proposal\|specs/*\|design\|tasks}.md` | 受审正文 |
| frontmatter | `status` / `change_mode` / 其他必填字段 | sanity check 起点 |
| 跨阶段 | 上游已 `reviewed` 的文件 | 追溯链一致性 |
| `scripts/validate.mjs` 输出 | deterministic 检查结果(schema + invariant + C1~C6 audit 钩子) | 复用机械结论,不重判 |

## 输出

### 主要产物:`docs/spec/{change_name}/critic.md`

frontmatter(本 skill 唯一写的 frontmatter,不进入主 schema 校验):

```yaml
---
change_name: {change_name}
target: proposal | specs/{capability}.md | design | tasks
critic_round: <int>
verdict: pass | needs_revision | escalated
ts: <iso8601>
---
```

正文按 [`references/critic-protocol.md`](references/critic-protocol.md) §2 五段结构。

### 副作用:改受审文件 `status`

- `verdict: pass` → 不改(产物保持 `reviewed`)
- `verdict: needs_revision` → 改受审文件 `status: reviewed → needs_revision`(workflow F1 路径)
- `verdict: escalated` → 改受审文件 `status: reviewed → escalated`(workflow F2 路径)

> 该 status 写入是 critic 的**唯一副作用**;不修改其他字段、不改正文。

## 文件导航

- 协议:[`references/critic-protocol.md`](references/critic-protocol.md)
- 检查清单:[`references/checklist.md`](references/checklist.md)
- 严禁事项:[`references/redlines.md`](references/redlines.md)
- 机械检查:`node ../scripts/validate.mjs docs/spec/{change_name}/`

## 与失败降级的关系

critic 是 [`spec-design-workflow/references/failure-recovery.md`](../spec-design-workflow/references/failure-recovery.md) F1 / F2 路径的**主要触发方**:

- **F1 (audit_failed)** 由 critic verdict `needs_revision` 触发
- **F2 (cdr_stuck)** 由 critic verdict `escalated` 触发(CDR ≥ 6 轮仍未收敛时 critic 判定 escalated)
- F3 (writeback_retry) 与 critic **无关**(纯字段操作,由 workflow 自身处理)
