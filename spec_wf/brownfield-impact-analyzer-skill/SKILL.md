---
name: brownfield-impact-analyzer
description: >
  棕地领域的影响分析器(critic 范式),按需被 proposal-writer / spec-writer / design-writer
  嵌入调用,或由用户独立调用。给定「改动意图 + 代码库」,产出咨询件 `impact.md`:改动意图
  + 冲突点 + 影响面 + 侵入/接缝建议 + 低耦合/低影响设计规则。**纯诊断器**:只给事实与
  通用设计原则,不给具体落地方案、不做回滚/测试/路由决策。**不进主 schema 校验**(同
  critic.md);**不修改 writer 正文**;**不抢编排权**。当 proposal §0 发现业务冲突 / 重构、
  spec `impacted_modules` 含既有重构 / 关键接口调整、或 design 涉及既有 BC/模块改造时被嵌入触发;
  也响应「分析这次改动会撞到哪 / 影响哪些功能 / 怎么低耦合地改」之类的独立请求。
---

# Brownfield Impact Analyzer

> **纯诊断器**:输出"会撞到哪 + 通用降耦合原则"(诊断),不输出具体落地方案、回滚开关、测试用例(处置)。
> 处置由 proposal(Backout)/ spec(DoD/迁移)/ design(ADR)各自承担,分工明确。

## 触发(三入口,与 critic 同构)

1. **proposal-writer 按需调用**:§0 盘点发现「与既有功能的业务冲突」或「需重构 / 替换既有能力」
2. **spec-writer 按需调用**:`impacted_modules` 含「既有重构、关键接口调整等影响现有工程」
3. **design-writer 按需调用**:`reused_modules` 含 `[已有·修改]`/`[已有·废弃]`,或 ADR 涉及既有 BC/模块重构、替换
4. **用户独立调用**:「分析这次改动会撞到哪 / 影响哪些功能 / 怎么低耦合地改」

## 角色定位(抄 critic 的克制)

| 维度 | 边界 |
|------|------|
| 与 writer | **不改正文**;只产 `impact.md`,供 writer 被动引用为素材 |
| 与 workflow | **不抢编排权**;按需被调,结论是否采纳由调用方决定 |
| 与 validator | `impact.md` 是**咨询件**,**不进**主 schema 校验(同 `critic.md`) |
| 与 critic | 正交;critic 审规约逻辑,本 skill 看代码影响面 |

## 非目标(分工边界)

- 不生成 proposal / spec / design / tasks 任何治理件
- 不给具体落地方案 / 回滚开关 / 测试用例(交 design / spec / dev)
- 不做"要不要进规约链"的路由裁决(交 proposal 自身)
- 不维护需求账本、不替代 CODEOWNERS / PR review policy

## 输入

| 来源 | 用途 |
|------|------|
| 用户改动意图(自然语言) | 锚定分析范围 |
| 代码仓库 | 接缝勘察 / 冲突检索 / 影响评估 |
| (可选)上游 proposal §0 / spec `impacted_modules` / design `reused_modules` | 复用既有盘点,不重复扫描 |

## 输出:`impact.md`(5 节,≤1 页)

- 路径:有 change 上下文落 `docs/spec/{change_name}/impact.md`;独立调用落用户指定路径
- 局部 frontmatter(仅本 skill 读写,不进主 schema):见 [`templates/impact.md`](./templates/impact.md)
- 正文 5 节:`1.改动意图 / 2.冲突点 / 3.影响面 / 4.侵入与接缝建议 / 5.低耦合设计规则`
- **副作用:无**——不改任何既有文件的正文 / frontmatter / status

## 文件导航

- 模板:[`templates/impact.md`](./templates/impact.md)
- 冲突识别 + 影响评估(§2 / §3):[`references/conflict-and-impact.md`](./references/conflict-and-impact.md)
- 侵入阶梯 + 接缝识别(§4):[`references/invasion-and-seam.md`](./references/invasion-and-seam.md)
- 低耦合/低影响设计规则目录(§5):[`references/design-rules.md`](./references/design-rules.md)

## 内置红线 / 自检(短,inline)

- ❌ 修改任何 writer 产物正文 / frontmatter / status
- ❌ 在 §5 写具体代码 / 具体回滚 key / 具体测试断言(只给**通用原则名 + 适用条件**)
- ❌ 调用 writer / RBK / dev / critic 任何能力;❌ 主动通知 workflow
- ❌ 复述 change-verbs / frontmatter-schema / cdr-protocol / clarification-gate-protocol 定义(只链接)
- ❌ 顺手做改动意图外的重构 / 升级依赖 / 跨域格式化
- [ ] §2 冲突点 / §3 影响面至少各 1 行,或显式写「未发现(已检索 …)」
- [ ] §4 给侵入阶梯**候选 + 理由**(AI 提议,非要求用户先答)
- [ ] §5 每条规则可回溯到 §2/§3 的某条冲突或影响

## 与 spec-design-workflow 的关系

- workflow **不感知**本 skill(无 status / 无监听);**不**进状态机(与 critic 的 workflow 触发不同)
- writer 节点(proposal / spec / design)按 SKILL 提示**按需调用**;`impact.md` 作为**被动引用素材**回填
