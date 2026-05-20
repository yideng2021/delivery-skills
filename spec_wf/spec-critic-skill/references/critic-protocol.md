# Critic Protocol — LLM-as-Judge 反向审查协议

> 本文件是 spec-critic-skill 的核心运行协议。SKILL.md 不复述本表步骤。
> 借鉴范式:Reflexion / Self-Refine / Constitutional AI 的「批判→修正」回环,但**人类判断仍在 CDR 中**,critic 只做「软门 + verdict」(术语「软门」由 [`../SKILL.md`](../SKILL.md) §角色定位单点定义)。

---

## §1 critic 三步流程

```
┌─────────────────────────────────┐
│ 1. 机械检查(deterministic)        │
│   - 跑 scripts/validate.mjs      │
│     (含 schema + invariant +     │
│      C1~C6 audit 钩子)            │
│   → 收集硬违例清单                  │
└────────────┬────────────────────┘
             ▼
┌─────────────────────────────────┐
│ 2. 语义检查(LLM-as-Judge)         │
│   - 按 §3 5 个判据扫描产物          │
│   - 不重复机械检查结论              │
│   → 收集语义违例 / 模糊处 / 建议    │
└────────────┬────────────────────┘
             ▼
┌─────────────────────────────────┐
│ 3. 裁决(verdict)                  │
│   按 §4 三态决策表输出 pass /        │
│   needs_revision / escalated     │
└─────────────────────────────────┘
```

---

## §2 critic.md 五段结构

```markdown
---
{frontmatter,见 SKILL.md}
---

# Critic Report — {target} @ round {N}

## §1 机械检查结论

(从 scripts/validate.mjs 转载,不重新判断)

- ✓ <项目>
- ✗ <违例>:<具体>

## §2 语义判据扫描(5 项)

### J1 追溯链完整性

(详见 §3)

### J2 增量诚实性

...

### J3 边界遵守

...

### J4 复用充分性

...

### J5 表达精炼

...

## §3 综合违例与建议

| # | 严重度 | 来源 | 描述 | 建议动作 |
|---|------|------|------|---------|
| 1 | hard | 机械 | <内容> | <动作> |
| 2 | soft | 语义 | <内容> | <动作> |

## §4 裁决

`verdict: <pass | needs_revision | escalated>`

理由:<一句话>

## §5 状态副作用

- 已写 `{target}.status: <new>`
- 已通知 workflow:<新触发路径>
```

---

## §3 5 个语义判据(J1-J5)

| # | 判据 | 检查要点 |
|---|------|---------|
| **J1** | **追溯链完整性** | proposal §0 / §3 → spec(reference_specs/touched_capabilities/impacted_modules)→ design(reused_modules/bc_relations)→ tasks(覆盖 AC/INV/US)是否一一可追溯,无断裂 |
| **J2** | **增量诚实性** | 5 项增量标注闭集(见 [`../../shared/contracts/change-verbs.md`](../../shared/contracts/change-verbs.md))使用是否准确,有无标 `[新增]` 实际是 `[已有·扩展]` 的误标 |
| **J3** | **边界遵守** | proposal 是否含实现细节;spec 是否含 SQL/HTTP;design 是否复述 spec L0;task 是否含测试命令 |
| **J4** | **复用充分性** | design 中标 `[新增]` 模块在 §5 ADR 是否回答了三问([`../../design-writer-skill/references/existing-architecture-landscape.md`](../../design-writer-skill/references/existing-architecture-landscape.md) §5) |
| **J5** | **表达精炼** | 篇幅是否过载(proposal > 2 页 / design 不必要的细节)/ 段落是否含 ceremonial 仪式填充 |

> 5 个判据**不重叠** scripts/validate.mjs 的机械检查范围;critic 关注「LLM 才能判断的语义层」。

---

## §4 三态决策表

| 条件 | verdict |
|------|---------|
| 机械检查 ✓ 且 J1-J5 全部 ✓ | `pass` |
| 机械检查 ✓ 但 J1-J5 出现 ≥ 1 项 hard 违例,且**可由 writer 在 1-2 轮内修复** | `needs_revision` |
| 机械检查存在 hard 违例 / J1-J5 出现 ≥ 1 项 hard 违例且**判定不可在 6 轮内收敛** | `escalated` |
| 仅出现 soft 违例 / 改进建议 | `pass`(同时把 soft 建议作为 CDR 批注落到产物中) |

> **判定原则**:
> - 「能在 1-2 轮 CDR 内修复」→ `needs_revision`(回 draft 让 writer 改)
> - 「需要架构级返工 / 上游变更」→ `escalated`(人工介入)
> - critic 倾向**保守**:有疑则 `needs_revision`,不轻易 `escalated`

---

## §5 反向复述(借鉴 CDR)

critic 在写 §3 综合违例表之前,必须对每条**自己识别的语义违例**做反向复述,形态为 markdown 列表:

1. 我看到了什么(产物中的位置 + 原文)
2. 我用什么判据判定(J1-J5 中的哪一条)
3. 我建议如何动作(指出违例 vs 建议改进)

> 反向复述写入 critic.md §2 各 J 小节内,确保 audit 可追溯每条结论的来源。

---

## §6 与 CDR 的边界

- critic **不发批注**(不写 `// ...` / `<!-- ... -->`);critic 只写 critic.md 这一份独立报告
- CDR 由 writer 自己驱动,critic 是**外部观察者**;两者不共享状态
- 若 critic 判定 `needs_revision`,writer 重新走 CDR 时**可**参考 critic.md(但不强制)

---

## §7 严禁事项 (Hard Bans)

- ❌ critic 修改 writer 产物正文(只能改 status + 写 critic.md)
- ❌ critic 复述机械检查结论(转载即可,不重新判断)
- ❌ critic 频次失控(同一 target 同一 round 不可重复跑;round 由用户/workflow 显式递增)
- ❌ critic 越权扮演 writer(若想"代写一段更好的",请放到 critic.md §3 建议列,**不**直接写入产物)
- ❌ critic 写 `verdict: pass` 但同时报硬违例(矛盾态视为协议错误)

---

## §8 校验规则(供 audit / validator)

- critic.md frontmatter 必含 `target` / `critic_round` / `verdict` / `ts`
- `verdict ∈ {pass, needs_revision, escalated}`(其他值非法)
- `verdict != pass` 时,对应 target 文件的 `status` 必须已被改为同义值
- critic.md §1 / §2 / §3 / §4 / §5 五段缺一为违例
