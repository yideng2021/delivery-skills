# Clarification Gate Protocol — 生成前澄清闸门协议

> **本文件是 spec-wf 体系中 Clarification Gate(简称 CG)的唯一权威定义**。
> 任何 writer skill / workflow 引用 CG 时只能链接本文件,不得复述协议步骤、提问预算、留痕语法。
> 本协议是横切机制,与 CDR / L3 ToolCall 确认门**正交**:CG 解决"AI 该写什么"(信息收集),CDR 解决"AI 写得对不对"(反馈修正)。

---

## §1 协议定位

- **目的**:把"AI 凭半吊子需求一口气脑补成稿"的失败模式,改写为"AI 先收集必要信息,再起草"。
- **核心命题**:**首版文档不应基于 AI 推断**;凡 AI 无法从既有材料(用户消息 / 仓库 / 既有 spec / 账本)独立填写的字段,必须在动笔前通过结构化封闭式问卷向用户对齐。
- **借鉴范式**:扩展 [`../../design-writer-skill/references/depth-confirmation.md`](../../design-writer-skill/references/depth-confirmation.md) §3 的 ToolCall 形态,从"二元升级开关"推广为"多维度协同对齐"。

---

## §2 触发条件

下列任一条件成立即必须执行 CG:

1. writer skill **首次启动**(写第一字之前)。
2. 用户在 chat 中对**未起草**的下一阶段表达"先聊一下再写"的意图。
3. 上一阶段的 frontmatter / 正文存在多义/歧义,AI 无法独立消解时。

> 已起草的文档不重跑 CG;此时走 CDR 修正(参 [`./cdr-protocol.md`](./cdr-protocol.md))。

---

## §3 协议步骤

```
┌────────────────────────────┐
│ 1. AI 信息缺口检测           │
│    扫描必填字段 + §0 必要素   │
│    标记"无法独立填写"项      │
└─────────┬──────────────────┘
          ▼
   ◆ 2. 缺口数 > 0?
   No  ──▶ 跳过 CG,直接进入起草(留痕 verdict: PASS, qa: [])
   Yes ──▶ 继续 §3.3
          │
          ▼
┌────────────────────────────┐
│ 3. 发起封闭式问卷            │
│    [CG-{stage}-{turn}] 标签  │
│    Q1~QN(N ≤ 单 turn 预算)  │
└─────────┬───────────────────┘
          ▼
┌───────────────────────────┐
│ 4. 用户回复 / 用户豁免        │
└────────┬───────────────────┘
          ▼
   ◆ 5. verdict?
   PASS         ──▶ 留痕 + 进入起草
   NEEDS_MORE   ──▶ 回到第 3 步(turn+1)
   ABORTED      ──▶ 留痕 cg-skipped + 进入起草(用户主权,可后续 CDR 兜底)
```

---

## §4 提问预算 (Anti-overflow)

| 维度 | 上限 | 说明 |
|------|------|------|
| 单 turn 题数 | ≤ 5 | 防认知过载 (Sweller 1988:工作记忆 ≤ 4±1) |
| 单题选项数 | ≤ 4 + 自由文本 | 封闭式 [a/b/c/d] + 可选自由说明 |
| 总 turn 上限 | ≤ 3 | 累计提问 ≤ 15 题;超出强制 verdict: ABORTED |
| 默认选项 | 必含 | 每题最后一项必须是 "[d] 使用 AI 默认推断" 兜底 |

> writer skill 的提问强度按"错误成本"梯度化,详见 §7。

---

## §5 提问形态(模板)

```
[CG-{stage}-{turn}] 为生成 {阶段产物},需先确认以下 {N} 项 (N ≤ 5):

Q1. {question_text}?
  [a] {option_a}
  [b] {option_b}
  [c] {option_c}
  [d] 使用 AI 默认推断

Q2. ...

请按 Q1-{a/b/c/d}, Q2-{a/b/c/d}, ... 格式回复;每题可附自由文本说明。
回复 SKIP 表示跳过本轮 CG(将以 cg-skipped 留痕,后续 CDR 兜底)。
```

**强制约束**:
- 每个 Q 必须**封闭式**,禁止开放式问题(如"你的业务目标是什么?")
- 每个 Q 必须基于**事实素材**而非凭空猜测;来源在 Q 下方一句话标注
- 每个 Q 必须可被单字符回复((a/b/c/d/SKIP)

---

## §6 留痕格式(产物头部)

CG 完成后(无论 PASS / ABORTED),writer 必须在文档**正文起始处**(frontmatter `---` 闭合块**之后**、首个 `#` 标题**之前**)追加 `<!-- clarification-gate -->` 块。**禁止放到 frontmatter 之前**(否则破坏 YAML 解析):

```markdown
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
    a: "[b] 扩展, 扩展点 = 邮箱验证码登录"
-->
```

**verdict 三态语义**:

| verdict | 含义 | qa 段 |
|---------|------|-------|
| `PASS` | 缺口已对齐,可起草 | 全部 Q&A |
| `NEEDS_MORE` | 临时态,不应出现在最终文档 | — |
| `ABORTED` | 用户显式跳过(SKIP) | 空数组 + `skip_reason` |

**ABORTED 留痕示例**:

```markdown
<!-- clarification-gate
stage: proposal
ts: 2026-05-18T09:30
turn: 1
verdict: ABORTED
skip_reason: "用户回复 SKIP, 选择直接起草后 CDR 兜底"
qa: []
-->
```

**无缺口豁免**:若 §3 信息缺口检测为 0,留痕为 `verdict: PASS, qa: []`,无需提问。

---

## §7 各 writer 的梯度化强度

| Writer | 单 turn 题数上限 | 必检字段 | audit 强度 |
|--------|-----------------|----------|-----------|
| **proposal-writer** | **5** | 受益方 / change_mode / §0 复用决策 / related_req_proposal 关联意图 / Backout 策略 | **hard fail**(P0) |
| **spec-writer** | **3** | 单 spec 业务边界 / INV 跨租户性 / DMN 是否引入 | **hard fail**(P0;允许基于 proposal CG 已对齐项缩小提问范围,无新增缺口时留 `verdict: PASS, qa: []`) |
| **design-writer** | 2 + 已有 L3 门 | BC 拆分初判 / 模块复用决策 | soft warn(L3 门保持独立;P1) |
| **task-decomposer** | 1(可豁免) | handover_domains 拆分意图 | 无强制 |

> proposal/spec 是战略与业务边界的双重入口,错误成本最高,P0 阶段在 proposal 与 spec 均强制 hard fail。design/tasks 暂保持 soft 或豁免,P1 阶段再评估。

---

## §8 与 CDR / L3 确认门的关系

| 协议 | 触发时机 | 解决问题 | 留痕载体 |
|------|---------|---------|---------|
| **CG**(本协议) | 起草**前** | "AI 该写什么" | `<!-- clarification-gate -->` |
| **CDR** | 起草**后** | "AI 写得对不对" | `// 行级` / `<!-- 段级 -->` 批注 |
| **L3 ToolCall** | design 阶段字段写入**前** | "是否升级 L3 战术建模" | `<!-- l3-confirmation -->` |

**正交性**:三者解决不同问题,不可互相替代。CG 与 L3 门可在同一 design 起草流程中**串行**触发(先 CG 收 BC/模块决策,再 L3 门确认深度)。

---

## §9 严禁事项 (Hard Bans)

- ❌ **One-shot 起草**:proposal-writer 首版不带 `<!-- clarification-gate -->` 块即视为违反 CG。
- ❌ **开放式提问**:CG 中出现"你的目标是什么?"等无封闭选项的问题。
- ❌ **超预算**:单 turn > 5 题,或总累计 > 15 题。
- ❌ **缺默认选项**:任一 Q 没有 `[d] 使用 AI 默认推断` 兜底,剥夺用户主权。
- ❌ **静默跳过**:AI 自行决定"信息足够"不提问且不留 `verdict: PASS, qa: []` 痕迹。
- ❌ **嵌入正文**:CG 问卷出现在 markdown 正文(必须留在 chat 层 + 注释块)。
- ❌ **用 CG 替代 CDR**:CG 仅做信息收集,产出后的修正必须走 CDR。

---

## §10 校验规则(供 validate.mjs C7)

**适用范围(P0)**:`proposal.md` 与 `specs/*.md`(任一 status ∈ {draft, reviewed})。

- 文件必须含 `<!-- clarification-gate -->` 块
- 块内必须含 `stage`, `ts`, `turn`, `verdict` 字段
- `verdict` ∈ {PASS, ABORTED}(NEEDS_MORE 仅中间态,不落产物)
- 若 `verdict == ABORTED`,必须含 `skip_reason` 字段
- 若 `verdict == PASS` 且 `qa` 段非空,每条 q/a 必须配对完整
- `specs/*.md` 允许 `qa: []`(已在 proposal CG 对齐,无新增缺口),但 `verdict: PASS` 留痕仍必填

> P0 阶段:proposal + spec 均 hard fail;design/tasks 暂不强制(P1 评估)。

---

## §11 与各 skill 的关系(一句话)

| Skill | 在 CG 中的角色 |
|-------|----------------|
| `proposal-writer-skill` | **强制**走 CG,缺口检测 + 5 题问卷 + hard fail 留痕 |
| `spec-writer-skill` | **强制**走 CG,3 题问卷;允许基于 proposal CG 收窄问卷,无新增缺口时 `verdict: PASS, qa: []` |
| `design-writer-skill` | P1 推开;2 题问卷 + 既有 L3 门串行 |
| `task-decomposer-skill` | 可豁免;1 题或直接 ABORTED |
| `spec-design-workflow` | **不参与 CG**,仅监听各文件 `status` 字段以驱动转移 |

> 各 writer skill 中关于"CG 在本阶段如何展开"的细则**只能写一句**指向本文件,**禁止复述本文件内的步骤、预算、留痕语法**。