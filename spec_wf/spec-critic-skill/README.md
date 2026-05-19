# spec-critic-skill

> LLM-as-Judge 反向审查 skill,对 4 个 writer 的产出做软审查 + 输出 `pass / needs_revision / escalated` 三态裁决。
> Batch 3 引入,补足 audit 末尾兜底的负担。

详见 [`SKILL.md`](./SKILL.md) 与 [`references/critic-protocol.md`](./references/critic-protocol.md)。

## 与机械检查的关系

- 机械检查 = `scripts/validate.mjs`(deterministic,含 schema + 跨阶段 invariant + C1~C6 audit 钩子)
- critic = 本 skill(LLM-as-Judge,语义层)
- 两者**互补**:critic.md §1 节转载机械结论,§2 节做语义判据。

## 快速上手

```bash
# 机械检查:扫一个 change
node scripts/validate.mjs docs/spec/{change_name}/

# critic 软审查由 spec-design-workflow 自动触发,或用户在 chat 中:
# > 请对 docs/spec/{change_name}/design.md 做 critic
```