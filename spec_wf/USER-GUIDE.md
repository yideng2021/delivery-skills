# spec-wf 用户手册(AI 开发用户)

> 面向用 AI 做开发的工程师。读完本文件即可上手把"一个想法"逐层规约为"可生成代码的契约"。
> 内部设计原理见 [`spec-wf总结.md`](spec-wf总结.md);维护演进见 [`MAINTENANCE.md`](MAINTENANCE.md)。

---

## 0. 你只需要记住的 3 件事

1. **4 步规约工作流**:proposal → spec → design → tasks。**每一步都让 AI 写,你审阅**。
2. **一个命令做兜底校验**:
   ```bash
   node scripts/validate.mjs docs/spec/{change_name}/
   ```
3. **每个 .md 文件的 frontmatter 是契约**;`status` 字段驱动流程从 `draft` → `reviewed` → 下一阶段。

> **进阶(可选)**:若项目已有或需要项目级需求账本(`docs/spec/REQUIREMENTS.md`),由 sibling skill RBK 维护;详见 §7.4。
> 起步阶段也可以完全不用账本(`related_req_proposal: []`,后续反向登记),不强制前置。

---

## 1. 适用场景与不适用场景

### ✅ 适合用 spec-wf 的场景

- 多人 / 多 AI 协作的中大型项目,需要可追溯的需求 / 设计文档
- 在既有工程上做增量(扩展 / 修改 / 废弃既有能力),需要避免"凭直觉造新模块"
- 需要把"我想要什么"清晰交付给另一段 AI 去生成代码

### ❌ 不适合的场景

- 个人玩具项目 / 一次性脚本(规约成本超过价值)
- 纯探索性 spike(还不知道要做什么,先写代码摸边界更高效)
- 紧急 hotfix(直接改代码后补 minimal proposal 即可)

---

## 2. 准备工作(只做一次)

```bash
# 1. 进入 scripts 目录装依赖(仅 ajv + js-yaml,体积小)
cd skills/spec_wf/scripts
npm install
cd ../../..

# 2. 验证脚本可用
node skills/spec_wf/scripts/validate.mjs --help 2>&1 | head -1
# 期望输出: 用法: validate.mjs <change-dir | file.md>...
```

---

## 3. 4 步工作流速览

```
你提需求 ───┐
            ▼
┌────────────────────────────────────────────┐
│ Step 1 · proposal-writer  →  proposal.md   │ 为什么做 / 做什么 / 既有资产盘点
└──────────────────┬─────────────────────────┘
                   ▼
┌────────────────────────────────────────────┐
│ Step 2 · spec-writer      →  specs/*.md    │ 业务上怎样算做对 (US/INV/AC/DMN)
└──────────────────┬─────────────────────────┘
                   ▼
┌────────────────────────────────────────────┐
│ Step 3 · design-writer    →  design.md     │ 架构上如何切分与复用(BC/模块/ADR)
└──────────────────┬─────────────────────────┘
                   ▼
┌────────────────────────────────────────────┐
│ Step 4 · task-decomposer  →  tasks.md      │ 拆给谁、做什么工单
└────────────────────────────────────────────┘
       每步写完都跑一次 validate.mjs
```

**关键纪律**:每一步必须**先**完成,再进入下一步。spec 不能跳过 proposal,design 不能跳过 spec。

> **关于 RBK 的位置**:4 步内**不涉及** RBK;项目级账本(`docs/spec/REQUIREMENTS.md`)由 sibling skill 在**起步**(proposal 关联 AUTH)与**收尾**(tasks 写完 `shipped_us` 后打勾)两端通过 frontmatter 字段被动协作。是否启用 RBK 完全可选,详见 §7.4。

> **生成前的人机共创闸门 (CG)**:proposal-writer 在动笔前**强制**走一轮 `Clarification Gate`(简称 CG)——AI 用封闭式问卷(≤5 题, [a/b/c/d] + 默认推断兜底)向你确认无法独立填写的字段。回答完成后 AI 才起草,留痕到 proposal.md 头部 `<!-- clarification-gate -->` 块,validate.mjs 跑 C7 强校验。spec/design/tasks 阶段 P1 推开。完整协议见 [`shared/protocols/clarification-gate-protocol.md`](shared/protocols/clarification-gate-protocol.md)。

---

## 4. 完整示例:`user-signup` 扩展能力

> 场景:既有项目已有 `auth-base` 登录能力,本次需要扩展出"用户自助注册"功能。
> 这是一个典型的 `change_mode: extend` 案例,完整 4 个文件 < 100 行,可直接照抄起步。

### 4.0 前置条件(路径选择)

本示例采用**路径 A(规划驱动)**:假设项目已通过 RBK 在 `docs/spec/REQUIREMENTS.md` 登记了 `AUTH-01: 用户登录`,
因此 proposal frontmatter 写 `req_ledger_state: present` + `related_req_proposal: [AUTH-01]`。

**若你的项目尚无账本**,可改走**路径 B(增量补录)**:proposal 起草时 `req_ledger_state: missing` + `related_req_proposal: []`,
4 步走完后再由用户触发 RBK U5 反向登记。两种路径的对比与切换详见 §7.4。

### 4.1 Step 1 — proposal.md

**你对 AI 说**:
> 调 proposal-writer skill,为 "user-signup" 写 proposal:基于既有 auth-base 扩展出用户自助注册能力,关联 AUTH-01。

proposal-writer **会先走一轮 CG 闸门**(`[CG-proposal-1]` 5 题封闭式问卷),拿到你的回答后才起草。最终产出 `proposal.md`:

```markdown
---
change_name: user-signup
status: reviewed
change_mode: extend
req_ledger_state: present
related_req_proposal: [AUTH-01]
---

<!-- clarification-gate
stage: proposal
ts: 2026-05-18T09:30
turn: 1
budget_used: 5/15
verdict: PASS
qa:
  - q: "本 change 的核心价值受益方?"
    a: "[a] 终端用户"
  - q: "是否复用既有 capability auth-base?"
    a: "[b] 扩展, 扩展点 = 邮箱验证码注册"
  - q: "回滚策略?"
    a: "[a] 镜像回滚"
-->

# Proposal — user-signup (extend)

## §0 既有资产盘点

### §0.1 业务能力触达
- AUTH-01 用户登录 — 关系:沿用(扩展注册入口,不改登录路径)

### §0.2 工程模块触达
- `services/user-service` — 关系:扩展(新增 signup endpoint)

### §0.3 风险与 Backout
- 风险:新注册流程与既有登录态共享 session,需做兼容
- Backout:回滚 user-service v1.1 镜像即可下线 signup endpoint

## §1 目标
让访客无需联系管理员即可自助注册账号。

## §2 关键决策(CDR 摘要)
- 决定走"邮箱 + 验证码"而非"邮箱 + 密码":降低密码管理风险
```

**跑校验**:
```bash
node skills/spec_wf/scripts/validate.mjs docs/spec/user-signup/
# 期望: ✓ docs/spec/user-signup — 通过
```

### 4.2 Step 2 — specs/user-signup.md

**你对 AI 说**:
> 调 spec-writer 为本 change 写 spec;capability=user-signup,扩展 AUTH-01,触达 services/user-service。

spec-writer 会自动创建 `specs/` 子目录并写入 `specs/user-signup.md`:

```markdown
---
change_name: user-signup
status: reviewed
change_mode: extend
related_req: [AUTH-01]
reference_specs: [specs/auth-base.md]
touched_capabilities: [auth]
impacted_modules: [services/user-service]
milestone: v1.2
---

# Spec — user-signup (extend)

## L0 业务上下文

### L0.x 既有上下文衔接
- `[已有·仅引用]` 用户登录(来源:specs/auth-base.md#REQ-1)

## L1 用户故事

- `[新增]` **US-1**:作为访客,我希望用邮箱 + 验证码自助注册,以便立即使用服务

## L2 业务实体与永真规则

- `[已有·扩展]` **INV-1**:邮箱唯一性 — **扩展点**:跨租户唯一性

## L3 功能需求与验收

- `[新增]` **REQ-1 邮箱验证码注册**
  - **EARS**:当访客提交邮箱时,系统应发送 6 位验证码;当验证码 10 分钟内被正确回填时,系统应创建账号
  - **AC-REQ1-1**:验证码长度 = 6 数字
  - **AC-REQ1-2**:验证码 TTL = 10 分钟,过期 410

## L4 完成定义(DoD)

- [ ] US-1 全部 AC 通过端到端测试
- [ ] INV-1 在测试库中可机械验证
```

**跑校验**:
```bash
node skills/spec_wf/scripts/validate.mjs docs/spec/user-signup/
```

### 4.3 Step 3 — design.md

**你对 AI 说**:
> 调 design-writer 写 design.md;BC=BC-user(扩展自 BC-auth-base);domain_modeling_level=L2 即可。

**AI 产出** `docs/spec/user-signup/design.md`:

```markdown
---
change_name: user-signup
status: reviewed
change_mode: extend
produced_specs: [specs/user-signup.md]
architecture_refs:
  - { path: docs/ARCHITECTURE.md, usage: 约束 }
domain_modeling_level: L2
domain_model_mode: omit
bounded_contexts: [BC-user]
reused_modules:
  - { path: services/user-service, annotation: '[已有·扩展]' }
bc_relations:
  - { bc: BC-user, relation: 扩展, refers_to: BC-auth-base }
---

# Design — user-signup (extend, L2)

## §1 上下文与目标
基于 BC-auth-base 扩展出 BC-user,新增 signup 流程。

## §3 BC 关系
- BC-user 扩展 BC-auth-base:复用其 SessionToken 契约,新增 SignupCommand

## §4 模块清单
- `[已有·扩展]` services/user-service:新增 POST /signup 端点

## §5 ADR(关键决策)
- ADR-1:为何复用 user-service 而非新建?三问回答:
  1. 已检索 proposal §0.2 既有资产 ✓
  2. user-service 已 own user 聚合根,signup 是其自然责任 ✓
  3. 新建会造成 BC-user 边界跨多个 service,违反单一所有权 ✓
```

> ⚠ 若本 change 涉及 **L3**(完整领域模型),AI 必须先发起 ToolCall 三选项让你确认,并在 design.md 顶部留 `<!-- l3-confirmation -->` 块;不允许 AI 单方面把 `domain_modeling_level` 写成 L3。

### 4.4 Step 4 — tasks.md

**AI 产出** `docs/spec/user-signup/tasks.md`:

```markdown
---
change_name: user-signup
status: draft
related_design: design.md
domain_modeling_level: L2
bounded_contexts: [BC-user]
handover_domains: [backend, frontend]
exc_status: pending
---

# Tasks — user-signup

## §2 任务表(BC × 承接方)

| # | BC | 承接方 | 描述 | AC 覆盖 | 工时 | 依赖 | DoD |
|---|---|------|------|-------|-----|-----|-----|
| T1 | BC-user | backend | 新增 POST /signup endpoint | AC-REQ1-1, AC-REQ1-2 | 4h | — | 通过 INV-1 测试 |
| T2 | BC-user | backend | 邮件验证码服务对接 SES | AC-REQ1-1 | 2h | T1 | — |
| T3 | BC-user | frontend | 注册表单 + 验证码输入页 | US-1 | 3h | T1 | E2E 通过 |
```

### 4.5 最终校验

```bash
node skills/spec_wf/scripts/validate.mjs docs/spec/user-signup/
# 期望: ✓ docs/spec/user-signup — 通过
```

通过后,把 4 份文档交给"代码生成 AI"作为唯一真理来源,即可开干。

---

## 5. 日常工作流(精简版)

1. 把需求告诉 AI,让它按 proposal → spec → design → tasks 顺序产出(目录由 skill 自动创建)
2. 每写完一个阶段跑一次:
   ```bash
   node skills/spec_wf/scripts/validate.mjs docs/spec/my-feature/
   ```
3. 全部 `reviewed` 后再交给代码生成 AI

校验脚本退出码:
- `0` 通过(可进入下一阶段)
- `1` hard 违例(**必须修**,违例编号见输出)
- `2` 仅有 soft 警告(可继续,但建议处理)

---

## 6. 常见违例 → 怎么修

| 违例编号 | 含义 | 修法 |
|---------|-----|-----|
| `schema/*` | frontmatter 字段类型 / 枚举错误 | 对照 [`shared/contracts/frontmatter-schema.md`](shared/contracts/frontmatter-schema.md) §4 |
| `I-A/change_mode` | proposal/specs/design 的 `change_mode` 不一致 | 统一改成同一值;通常以 proposal 为准 |
| `I-B/reused⊇impacted` | design.reused_modules 没盖全 spec.impacted_modules | 把缺失模块路径补进 design |
| `I-E/D4-auth-unique` | 两个 spec 同时持有同一 AUTH | 选一个 spec 持有,另一个改为 `reference_specs` 引用 |
| `I-F/change_name` | 4 个文件的 `change_name` 不一致 | 统一改成同一字符串 |
| `C1/l3-confirmation-missing` | design 标 L3 但缺确认留痕 | 让 AI 走 [`design-writer-skill/references/depth-confirmation.md`](design-writer-skill/references/depth-confirmation.md) §3 协议 |
| `C4/writeback-failure-comment` | tasks 标 writeback_failed 但缺 `<!-- writeback-failure -->` 注释 | 在 tasks.md 顶部追加注释说明失败原因 |
| `C5/critic-section-missing` | critic.md 缺 §1~§5 某段 | 按 [`spec-critic-skill/references/critic-protocol.md`](spec-critic-skill/references/critic-protocol.md) §2 补齐 |
| `C7/clarification-gate-missing` | proposal.md 缺 `<!-- clarification-gate -->` 块 | 让 proposal-writer 重走 CG 闸门(详见 [`shared/protocols/clarification-gate-protocol.md`](shared/protocols/clarification-gate-protocol.md));或文档头部补齐留痕块 |
| `R11/ledger-state-mismatch`⁺ | `req_ledger_state: missing` 但账本已存在(或相反) | 让 proposal-writer 修正字段为 `present` / `missing` / `skipped` 之一,与实际一致 |

> ⁺ R11 由 RBK U6 audit 报告,不由 [`scripts/validate.mjs`](scripts/validate.mjs) 直接命中;只有在用户主动触发"审计需求账本"时才会出现。详见 §7.4。

---

## 7. 进阶能力(按需启用)

### 7.1 软审查(spec-critic)

任一阶段 `status: reviewed` 后,可让 AI 调 spec-critic-skill 做 LLM-as-Judge 审查,输出 `critic.md` + 三态裁决(pass / needs_revision / escalated)。

**触发方式**:
> 请对 docs/spec/user-signup/design.md 做 critic

不必每次都做;**高风险 change** / **跨 BC 重构** 时强烈建议。

### 7.2 大 change 拆分守卫

proposal 写完后,workflow 会自动按 6 维阈值(capability 数 / task 数 / 独立部署单元 / 数据域 / 规模 / AUTH 数)判断是否需要拆分。若触发,会路由到 change-decomposition 流程。

### 7.3 TodoWrite shadow output(Claude Code 等 host)

tasks.md `status: reviewed` 后,host 可把 §2 任务表自动 shadow 出 TodoWrite 调用,详见 [`shared/protocols/tasks-to-todowrite.md`](shared/protocols/tasks-to-todowrite.md)。markdown 与 TodoWrite 并存,不破坏 schema。

### 7.4 项目级需求账本(requirements-bookkeeping)

spec-wf 体系还含一个**项目级账本** skill:[`requirements-bookkeeping-skill`](requirements-bookkeeping-skill/SKILL.md)。它扮演"记账员",维护两份长青文档:`docs/spec/REQUIREMENTS.md`(必有)与 `docs/spec/ROADMAP.md`(可选)。

**何时切换到 RBK**:

| 场景 | 触发语 | 用例 |
|------|--------|------|
| 新项目启动,先建账本再写 change | "初始化项目需求账本" | U1 init |
| change 起草前需新增 AUTH-ID | "登记新需求 AUTH-xx" | U2 add-req |
| change 走完 4 步且全部上线 | "{change} 上线了" | U4 ship(打勾对应 AUTH) |
| change 已落地但未关联 AUTH | "把 {change} 反向登记到账本" | U5 writeback |
| 怀疑账本与 spec 漂移 | "审计需求账本" | U6 audit(只读 R1-R11 报告) |

**与 4 步工作流的协作**:

- RBK 与 4 个 writer + workflow **零命令名耦合**——它仅监听 frontmatter 字段(`req_ledger_state` / `related_req` / `shipped_us`)被动响应
- 用户在 chat 中显式触发 RBK 用例;writer 不会自动调用它
- RBK **绝不**修改 `docs/spec/{change}/` 下任何文件;打勾仅写 `REQUIREMENTS.md`

详见 [`requirements-bookkeeping-skill/SKILL.md`](requirements-bookkeeping-skill/SKILL.md)。

### 7.5 生成前澄清闸门 (Clarification Gate, CG)

为防止 AI 在信息不足时**脑补成稿**, proposal-writer **强制** 在动笔前走一轮 CG:

- **形态**:封闭式问卷 `[CG-{stage}-{turn}] Q1~QN`,单 turn ≤ 5 题,每题 ≤ 4 选项 + `[d] 使用 AI 默认推断` 兜底
- **预算**:总累计 ≤ 15 题(3 turn × 5),超出强制 ABORTED
- **留痕**:proposal.md 头部 `<!-- clarification-gate -->` 块(frontmatter 之后 + 首个 `#` 之前)
- **三态 verdict**:`PASS`(对齐完成) / `ABORTED`(用户跳过,后续 CDR 兜底) / `NEEDS_MORE`(临时态)
- **校验**:validate.mjs C7 audit 钩子,缺块 / 字段不全 hard fail

**与 CDR / L3 门的关系**:CG=生成前(我该写什么)、CDR=生成后(我写得对不对)、L3 门=design 字段写入前(领域建模升级);三者正交。

P0 阶段仅 proposal-writer 强制;spec/design/tasks 在 P1 推开。详见 [`shared/protocols/clarification-gate-protocol.md`](shared/protocols/clarification-gate-protocol.md)。

---

## 8. 出错时去哪查

| 现象 | 看哪里 |
|------|--------|
| 不知道某个 frontmatter 字段什么意思 | [`shared/contracts/frontmatter-schema.md`](shared/contracts/frontmatter-schema.md) 20 字段总表 |
| 增量标注怎么选 `[新增]` / `[已有·扩展]` / `[已有·修改]` / `[已有·废弃]` / `[已有·仅引用]` | [`spec-writer-skill/references/increment-annotation.md`](spec-writer-skill/references/increment-annotation.md) |
| EARS + Gherkin 怎么写 | [`spec-writer-skill/references/ears-gherkin-cheatsheet.md`](spec-writer-skill/references/ears-gherkin-cheatsheet.md) |
| DMN 决策表什么时候用 | [`spec-writer-skill/references/dmn-when-and-how.md`](spec-writer-skill/references/dmn-when-and-how.md) |
| 失败降级怎么处理(needs_revision / escalated / writeback_failed) | [`spec-design-workflow/references/failure-recovery.md`](spec-design-workflow/references/failure-recovery.md) |
| CDR 怎么做(写完后怎么改) | [`shared/protocols/cdr-protocol.md`](shared/protocols/cdr-protocol.md) |
| 想完整理解设计哲学 | [`spec-wf总结.md`](spec-wf总结.md) |

---

## 9. 一句话总结

> **让 AI 按 proposal → spec → design → tasks 顺序写,每步跑一次 `validate.mjs`,绿了再进下一步。** 这就是 spec-wf 给"用 AI 做开发"的工程纪律。