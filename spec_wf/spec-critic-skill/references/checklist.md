# Spec Critic Checklist — critic 阶段唯一验收权威

> 本文件遵循 [`../../shared/templates/writer-references-template.md`](../../shared/templates/writer-references-template.md) §4 checklist 骨架。
> SKILL.md 不复述本文件条目。critic 完成全部勾选后方可输出 critic.md。

---

## §1 critic.md frontmatter 合规

- [ ] `change_name` 与受审 target 同步
- [ ] `target` ∈ `{proposal, specs/{capability}.md, design, tasks}`
- [ ] `critic_round` ≥ 1,且与历史 critic.md 中同 target 的最大 round + 1
- [ ] `verdict` ∈ `{pass, needs_revision, escalated}`
- [ ] `ts` 为合法 ISO8601 时间戳

## §2 三步流程合规

- [ ] §1 机械检查结论已转载 `scripts/validate.mjs` 输出
- [ ] §2 J1-J5 五项判据**全部**扫描(任一未做必须显式写 "本 target 不适用 Jx — <理由>")
- [ ] §3 综合违例表区分 hard / soft;每条含「来源 / 描述 / 建议动作」
- [ ] §4 裁决与 §3 违例表逻辑自洽(verdict 由表格内容机械可推导)
- [ ] §5 已记录对应 target 文件的 `status` 变更动作

## §3 越界自检

- [ ] **未修改** target 文件正文(只改 status)
- [ ] **未复述** ac-vocabulary / frontmatter-schema / cdr-protocol / failure-recovery 定义
- [ ] **未调用** writer / RBK / dev skill 任何能力
- [ ] **未发** inline 批注 / `<!-- -->` 批注到 target 文件

## §4 与下游衔接

- [ ] `verdict: needs_revision/escalated` 时,target 文件 status 已成功改写
- [ ] workflow 已通过 `status` 字段感知 critic 结果(critic 不主动通知 workflow)
- [ ] critic.md 不破坏 target 文件的 schema 校验(`scripts/validate.mjs` 仍可跑通)

## §5 CDR 退出条件

> critic skill **不参与** CDR;本节不适用。本 skill 唯一退出条件是 §1-§4 全部勾选。
