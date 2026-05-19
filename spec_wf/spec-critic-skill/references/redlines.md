# Spec Critic — Redlines (严禁事项)

> 本文件遵循 [`../../shared/templates/writer-references-template.md`](../../shared/templates/writer-references-template.md) §3 redlines 骨架。
> 是 spec-critic-skill 的硬约束清单。SKILL.md 仅链接,不复述。
> audit 命中即认为本 critic round 无效,自动作废。

---

## §1 命令与协作类

- ❌ 调用 writer / RBK / dev skill 任何能力(零命令名耦合)
- ❌ 主动通知 workflow(workflow 通过 `status` 字段被动感知)
- ❌ 复述 ac-vocabulary / frontmatter-schema / cdr-protocol / failure-recovery 定义(只链接)

## §2 frontmatter 类

- ❌ critic.md frontmatter 出现 schema §1 之外字段(critic 字段集是独立 4 项)
- ❌ `verdict` 取值在 `{pass, needs_revision, escalated}` 外

## §3 critic 行为类

- ❌ 修改 target 文件正文(只能改 status)
- ❌ 发 inline 批注或 `<!-- -->` 批注到 target 文件(那是 CDR 通道,不归 critic)
- ❌ 重新判断机械检查范围内的违例(转载即可)
- ❌ 同一 target 同一 round 重复跑(round 必须递增)
- ❌ verdict `pass` 但 §3 违例表存在 hard 行(矛盾态)

## §4 越权类

- ❌ 代写产物正文(建议放到 critic.md §3,**不**写到 target)
- ❌ 决定要不要把 verdict 上抛到用户(由 workflow 决定)
- ❌ 篡改历史 critic.md 已写的 round

## §5 复述类

- ❌ 复述 [`./critic-protocol.md`](./critic-protocol.md) 的步骤(SKILL.md / 其他 references 只能链接)
- ❌ 复述 J1-J5 5 个判据的语义(语义在 critic-protocol §3,其他文件只引用编号)
