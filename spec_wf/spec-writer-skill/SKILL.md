---
name: spec-writer
description: 把 proposal 的战略意图翻译为业务级可验证规约(`docs/spec/{change_name}/specs/{capability}.md`)。L0–L4 严格分层,AC 唯一来源 = L2 INV ∪ L3 AC ∪ DMN-Rn,L4 DoD 零新增。增量标注 5 项闭集与 `change_mode` 联动;`[已有·修改]`/`[已有·废弃]` 必须配套 Diff 表与迁移路径。本 skill 仅写 spec.md,不写技术方案。
---

# Spec Writer

## 触发

任一条件成立即加载:
- proposal 已 `status: reviewed`,要求进入 spec 阶段
- 用户要求增删 INV / AC / DoD
- workflow 从 proposal 路由进入
- 提到「写 spec / EARS / Gherkin / INV / AC / DoD」

## 不变量(精简)

1. **严格 L0–L4 分层**(详见 [`references/l0-l4-guide.md`](references/l0-l4-guide.md))
2. AC 唯一来源 = L2 INV ∪ L3 AC-{req}-{seq} ∪ DMN-xxx-Rn;**L1 不写 AC**;**L4 零新增**(见 [`shared/contracts/ac-vocabulary.md`](../shared/contracts/ac-vocabulary.md))
3. 每条 US/INV/AC/实体/关系/合规/术语紧跟增量标注 ∈ 5 项闭集(见 [`references/increment-annotation.md`](references/increment-annotation.md));`[已有·扩展]` 给扩展点 / `[已有·修改]` 给 Diff / `[已有·废弃]` 给迁移路径+兼容期窗口
4. **D4 强约束**:一条 AUTH-ID 只能归属一个 spec(见 [`references/req-convergence.md`](references/req-convergence.md))
5. CDR 退出条件全满足后才把 `status` 升 `reviewed`(见 [`shared/protocols/cdr-protocol.md`](../shared/protocols/cdr-protocol.md))
6. `change_mode` 与增量标注联动:`refactor` 必含 `[已有·修改]` 或 `[已有·废弃]`;`bugfix` 必含 `[已有·修改]`
7. DMN 决策表按 [`references/dmn-when-and-how.md`](references/dmn-when-and-how.md) 启用判据嵌入,与 L0/L2/L3/L4 严守去重
8. **路径自治**:写第一份 `specs/*.md` 前若 `docs/spec/{change_name}/specs/` 不存在则自动创建(idempotent)
9. **CG 闸门强制**(P0):动笔前必须走一轮 [`../shared/protocols/clarification-gate-protocol.md`](../shared/protocols/clarification-gate-protocol.md);首版 `specs/*.md` 顶部必须含 `<!-- clarification-gate -->` 块,verdict ∈ {PASS, ABORTED}。允许基于 proposal CG 已对齐项收窄问卷,无新增缺口时留 `verdict: PASS, qa: []`;缺块即触发 validate.mjs C7 hard fail。
10. **reviewed 由用户裁决**:skill **不得**自行把 `status` 从 `draft` 升 `reviewed`;CDR 退出 + checklist 全勾选后必须以 ToolCall 三选项形态请用户裁决:`[1] 满意,升 reviewed` / `[2] 还需修改` / `[3] 重写本 spec`,得到 `[1]` 才执行 frontmatter 字段升级。

## 输入

| 来源 | 字段 / 段落 | 用途 |
|------|------------|------|
| proposal frontmatter | `change_name` / `change_mode` / `related_req_proposal` | 锚定路径 / 沿用 / 收敛 |
| proposal §0.1 / §0.2 / §0.3 | 既有资产 | 映射为 `reference_specs` / `touched_capabilities` / `impacted_modules` |
| proposal §3 Capability Map | — | 决定本次 change 拆几个 spec |
| proposal §2 显式排除 | — | 反向校验本 spec 不越界 |

## 输出 frontmatter(权威 schema 见 [shared/contracts/frontmatter-schema.md](../shared/contracts/frontmatter-schema.md))

| 字段 | 取值 | 说明 |
|------|------|------|
| `change_name` | kebab-case | 与 proposal 一致 |
| `status` | `draft` → `reviewed` | CDR 退出后升 reviewed |
| `change_mode` | 沿用 proposal | — |
| `related_req` | `[AUTH-xx, ...]` | 收敛结果,禁通配 |
| `reference_specs` | `[既有 spec 路径 / spec-id, ...]` | spec 视角=既有锚,与 proposal §0.1 一一对应 |
| `touched_capabilities` | `[kebab-case, ...]` | 与 proposal §0.1/§3.1 一一对应 |
| `impacted_modules` | `[path / service-name, ...]` | 与 proposal §0.2 一一对应 |
| `milestone` | string 或 `—` | 键必存 |

> `change_mode != greenfield` 时:`reference_specs` / `touched_capabilities` / `impacted_modules` **三者至少一个非空**。

## 与下游衔接

- design-writer 读:`reference_specs` / `impacted_modules` / `touched_capabilities`;通过 `produced_specs` 反向引用本文件路径
- task-decomposer 间接读:`related_req`(经 design 传递)
- workflow:监听 `status`
- RBK(被动):监听 `related_req`(D4 跨 change 唯一性校验)

## 文件导航

- 模板:[`templates/specs.md`](templates/specs.md)
- 写作指南 / 分层 / 句式速查 / 增量标注 / Diff & 迁移 / DMN / AUTH 收敛:见 [`references/`](references/)
- 验收清单:[`references/checklist.md`](references/checklist.md)
- **严禁事项**:[`references/redlines.md`](references/redlines.md)
- 机械校验:`node ../scripts/validate.mjs docs/spec/{change_name}/`

## 棕地按需嵌入(可选,P2)

> 若 `impacted_modules` 中存在「**既有重构、关键接口调整等影响现有工程**」的情况,建议调用 [`brownfield-impact-analyzer`](../brownfield-impact-analyzer-skill/SKILL.md) 产出咨询件 `impact.md`;其 §3 影响面 / §5 低耦合设计规则(迁移类:Additive-only / 双写迁移)可作为本 spec 增量标注 `[已有·修改]` / `[已有·废弃]` 的 **Diff 表 / 迁移路径**输入素材(被动引用,不强耦合)。`impact.md` 为**诊断咨询件**:只给影响事实与通用原则,具体迁移方案由本 spec 设计;它**不进** 主 schema 校验,**不修改** 本 spec 正文与 frontmatter。
