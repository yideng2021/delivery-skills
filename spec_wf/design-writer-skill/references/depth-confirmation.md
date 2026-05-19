# Domain Modeling Depth — L1/L2/L3 升级确认协议(ToolCall 形态)

> 本文件是 design-writer `domain_modeling_level` 字段写入前的「升级确认协议」唯一权威。
> 与 [`./domain-modeling-depth.md`](./domain-modeling-depth.md) 的关系:**前者答「为什么选 L?」(诊断规则);本者答「怎么把 L 安全落到字段」(交互协议)**。
> 设计动机:L3 不能靠 prompt 自律(评估报告 P2-3),必须建模为显式「问→答」流程,可被 audit 追溯。

---

## §1 协议定位

- **场景**:design-writer 在起草阶段需写入 `domain_modeling_level` 字段(L1/L2/L3)。
- **核心命题**:**L3 的升级必经用户显式裁决**;L1↔L2 升级可由 AI 自主判断但需在 ADR 中说明依据。
- **借鉴范式**:本协议是 Claude Code [`AskUserQuestion`](https://docs.anthropic.com/en/docs/claude-code) 工具范式的伪 ToolCall 化——即便没有真正的 tool 后端,也用结构化「问→答」固化交互。

---

## §2 三档升级判定流程

```
┌─────────────────────────────┐
│ 1. AI 读 spec 正文 + frontmatter │
│    依 domain-modeling-depth.md │
│    诊断初判 level ∈ {L1, L2, L3} │
└──────────┬──────────────────┘
           ▼
   ◆ 2. 初判 == L3?
   No  ──▶ AI 直接写 level + 在 §5 ADR 一句话说明依据
   Yes ──▶ 进入 §3 ToolCall 确认门
```

---

## §3 L3 ToolCall 确认门(强制)

AI **必须**在 chat 中发出下列结构化提问(标签 `[L3-CONFIRM]` 是 audit 检索锚点):

```
[L3-CONFIRM] 本 change 初判应展开 L3 战术建模 (domain_modeling_level: L3),理由:
  - 触发判据:<引用 domain-modeling-depth.md 的具体条目,如「核心域 ≥ 2 个 + 跨 BC 一致性约束 + 跨服务事件传播」>
  - 预计代价:design.md 篇幅 +50% / CDR 轮次 +2~3 / domain_model_mode 切到 extended

是否确认升级到 L3?(回复 1 / 2 / 3 之一)
  [1] 是,升级 L3 + 展开战术建模(extended)
  [2] 是,升级 L3 但保留 omit(战术建模延后)
  [3] 否,维持 L2(请补充理由,AI 据此修订诊断依据)
```

**响应处理**:

| 用户回复 | AI 动作 |
|---------|--------|
| `1` | 写 `domain_modeling_level: L3` + `domain_model_mode: extended`;在 §5 ADR 记 `ADR-L3-Upgrade`,Context 段引用 ToolCall 原文 |
| `2` | 写 `domain_modeling_level: L3` + `domain_model_mode: omit`;ADR 同 1 但额外注「战术建模延后到下个 change」 |
| `3` + 理由 | 维持 `L2` + `omit`;在 §5 ADR 记 `ADR-L3-Rejected`,Context 段保留用户原话 |

**强制留痕**:

无论用户选哪个,AI 必须在 design.md 顶部追加一个 `<!-- l3-confirmation -->` 批注块,内容如下:

```markdown
<!-- l3-confirmation
ts: 2026-05-17T14:23
proposed_by: ai
verdict: <1|2|3>
user_rationale: "<用户原话或 — >"
linked_adr: ADR-L3-Upgrade | ADR-L3-Rejected
-->
```

> 该批注是 audit 检验 L3 协议是否走完的**唯一证据**。缺失即视为违反 I3。

---

## §4 与 frontmatter 字段的关系

- 本协议**不**修改 schema(L3 仍是合法值);仅约束「写入路径」必经 ToolCall。
- audit 阶段检查:`domain_modeling_level: L3` 且不存在 `<!-- l3-confirmation -->` 批注块 → 立即拒绝转移(workflow `design → tasks` 无效)。
- L1 ↔ L2 升降级**不**走本协议;AI 自主裁量 + ADR 说明即可。

---

## §5 与 CDR 的边界

- 本协议**正交于** CDR:确认门发生在「AI 初判后、字段写入前」,与「文档已起草、用户批注、AI 修正」的 CDR 循环互不冲突。
- 若用户在 CDR 中追加批注 `<!-- 降回 L2 -->`,AI **必须**重启本协议(发新 ToolCall),不能静默改字段。

---

## §6 严禁事项 (Hard Bans)

- ❌ AI 单方面写 `domain_modeling_level: L3` 而未走 §3 ToolCall
- ❌ 用「我建议升级 L3,如有异议请告知」之类**默认通过**的开放式问句替代 §3 的封闭式三选项
- ❌ 缺 `<!-- l3-confirmation -->` 批注块就改 `domain_modeling_level`
- ❌ 把 §3 ToolCall 嵌入 design.md 正文(它属于 chat 交互层,不污染产物)

---

## §7 校验规则(供 audit / validator)

- `design.frontmatter.domain_modeling_level == "L3"` ⇒ design.md 顶部必须含 `<!-- l3-confirmation -->` 块,且 `verdict ∈ {1, 2}`
- `design.frontmatter.domain_modeling_level == "L2"` 但 design.md 顶部含 `<!-- l3-confirmation -->` 块 ⇒ 块的 `verdict` 必须 == `3`(降级拒绝路径)
- `domain_model_mode == "extended"` ⇒ 必同时满足 `domain_modeling_level == "L3"` 且 `verdict == 1`
