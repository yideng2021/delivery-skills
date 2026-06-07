# brownfield-impact-analyzer-skill

> 棕地领域的影响**诊断器**(critic 范式)。按需被 proposal-writer / spec-writer / design-writer 嵌入调用,或由用户独立调用。
> 产出咨询件 `impact.md`:**改动意图 + 冲突点 + 影响面 + 侵入/接缝建议 + 低耦合设计规则**。
> 纯诊断:只给事实与通用设计原则,不给具体落地方案;不进主 schema 校验、不改 writer 正文、不抢编排权。

详见 [`SKILL.md`](./SKILL.md) 与 [`references/`](./references/)。

---

## 它解决什么

棕地工程(已有代码)上做 bug 修复 / 功能扩展 / 局部重构,真正的难点是**先看清**:

- 这块改动会撞到哪些既有功能?(冲突点)
- 与在途变更 / 跨团队代码有没有冲突?(影响面)
- 从哪个接缝切入、用第几级侵入最稳?(侵入/接缝)
- 针对这些冲突/影响,应遵循哪些**通用降耦合原则**?(设计规则)

它把这四件事固化为可复用的分析步骤,产出一份 **≤1 页**的 `impact.md` 给上下游 writer 当**素材**。

> **不做什么**:不设计具体回滚开关、不编写特征测试、不裁决"要不要进规约链"。
> 这些处置由 proposal(Backout)/ spec(DoD、迁移路径)/ design(ADR)各自承担——**分工明确**。

---

## 三种触发

| 触发方 | 场景 | impact.md 落点 |
|--------|------|----------------|
| proposal-writer | §0 盘点发现业务冲突 / 重构 | `docs/spec/{change_name}/impact.md` |
| spec-writer | `impacted_modules` 含既有重构 / 关键接口调整 | 同上 |
| design-writer | `reused_modules` 含 `[已有·修改]`/`[已有·废弃]` 或 ADR 涉及既有 BC/模块改造 | 同上 |
| 用户 | 「分析这次改动会撞到哪 / 怎么低耦合地改」 | 用户指定路径 |

---

## 与 spec-critic 的对照

| | spec-critic | brownfield-impact-analyzer |
|---|---|---|
| 看什么 | 规约产物逻辑(proposal/spec/design/tasks) | 棕地改动的代码影响面 |
| 产物 | `critic.md`(咨询) | `impact.md`(咨询) |
| 触发 | workflow 自动 + 用户主动 | writer 按需嵌入 + 用户独立 |
| 进主 schema 校验 | 否 | 否 |
| 改 writer 正文 | 否 | 否 |

两者**正交**:critic 审规约逻辑,本 skill 看代码影响面。

---

## 快速上手

```text
# 用户独立调用
> 帮我分析:把 OrderService.cancel() 的退款流程从同步改成异步,会撞到哪、该遵循哪些降耦合原则

# 嵌入调用(由 proposal/spec/design-writer 按 SKILL 提示自动建议)
> proposal §0 发现冲突,建议先跑 brownfield-impact-analyzer
```

输出 `impact.md` 后,由调用方(writer / 用户)决定是否采纳:

- proposal 把 §2/§3 引为 §0.3 / §2 素材
- spec 把 §3 引为 `[已有·修改]` Diff / 迁移路径素材
- design 把 §4/§5 引为 §5 ADR / 模块契约的设计输入
