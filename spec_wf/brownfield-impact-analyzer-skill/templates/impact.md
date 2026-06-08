---
# brownfield-impact-analyzer 局部 frontmatter
# 注意:本字段集独立,**不**进主 schema 校验(同 critic.md);拼写 snake_case,枚举小写英文
change_ref: {change_name 或 一句话改动标识}   # 有 change 上下文时用 change_name;独立调用用一句话标识
analyzed_at: {ISO8601 时间戳}
invasion_tier: composition   # new_file | composition | inheritance | decorator | modify_existing(局部词表,非 change-verbs)
has_conflict: false          # §2 冲突点表是否非空
---

# Impact Report — {改动一句话标识} @ {analyzed_at}

> 棕地影响**诊断**咨询件。≤1 页;每节最多 1 张表 + 3 行说明;无 ceremonial 段落。
> 只给「会撞到哪 + 通用降耦合原则」,**不**给具体落地方案 / 回滚开关 / 测试用例(那是 design/spec/dev 的活)。
> 写法详见 [`../references/`](../references/);本文件**不**修改任何 writer 产物。

---

## 1. 改动意图(≤2 句)

{在哪个既有功能 / 模块之上,要做什么改动,核心目标是什么。}

---

## 2. 冲突点(写法见 [conflict-and-impact.md](../references/conflict-and-impact.md) §冲突识别)

| 冲突对象 | 类型 | 与既有的关系 |
|---------|------|-------------|
| {既有功能 / 接口 / 在途PR} | 语义冲突 / 接口变更 / 在途变更 | 替换 / 并存 / 废弃 |

> 无冲突时:显式写 `> 未发现与既有功能 / 在途变更 / 跨团队代码的冲突(已检索:…)`
> 关系词复用 [`../../shared/contracts/change-verbs.md`](../../shared/contracts/change-verbs.md)(替换/并存/废弃)。

---

## 3. 影响面(写法见 [conflict-and-impact.md](../references/conflict-and-impact.md) §影响评估)

| 维度 | 现状 | 变更后 | 影响范围(调用方 / 数据 / 接口 / 配置) | 取证(源) | 校验 | 风险 |
|------|------|--------|---------------------------------------|----------|------|------|
| {接口契约} | {…} | {…} | {…} | GitNexus shape_check/api_impact | ☐/✅/❗ | 低/中/高 |
| {数据语义} | {…} | {…} | {…} | codegraph_explore | ☐/✅/❗ | … |
| {调用方} | {…} | {…} | {具体调用方清单} | codegraph_impact/callers + GitNexus 域 | ☐/✅/❗ | … |
| {配置/开关} | {…} | {…} | {…} | config diff | ☐/✅/❗ | … |

> 维度按需选填,至少 1 行;无影响维度显式写「该维度无影响」。
> **取证(源)**:结构性影响标 CodeGraph 工具,语义/契约影响标 GitNexus 工具;单源降级时注明"缺 X 源,置信度下降"。
> **校验**(分级,见 SKILL 分级校验协议):`☐ 仅工具`(低风险纯增量,信任工具)/ `✅ 源码已核`(读 verbatim 源码核对了关键边)/ `❗ 待人工确认`(改业务流/状态机/数据模型,或触及反射·运行时·业务铁律盲区)。
> **偏差留痕**:工具结论被源码校验改写时,在对应行追加 `⚠️ 工具漏报/误报:<edge> 经源码确认 …`。

---

## 4. 侵入与接缝建议(写法见 [invasion-and-seam.md](../references/invasion-and-seam.md))

- **推荐侵入阶梯**:`{invasion_tier}`(理由:{为什么这一档够 + 为什么更弱档不够})
- **接缝点**:
  | 接缝种类 | 位置(文件:符号) | 用途 |
  |---------|------------------|------|
  | 构造器注入 / 工厂替换 / 接口扩展 / 子类覆写 | `path/to/file.ext::Symbol` | {一句话} |

> AI 提议在先、人裁决在后:本节产出**候选 + 理由**,采纳由调用方决定。

---

## 5. 低耦合 / 低影响设计规则(写法见 [design-rules.md](../references/design-rules.md))

> 针对 §2/§3 的每条冲突或影响,给出**通用工程设计原则 + 适用条件**;**只给原则名,不给本工程的具体落地方案**。
> 具体怎么落地由 design/spec 的 skill 决定——分工明确。

| 对应 §2/§3 条目 | 推荐设计原则(通用) | 给谁参考 |
|----------------|---------------------|---------|
| {接口变更} | Expand-Contract / 适配器隔离 | design 模块契约 |
| {既有逻辑替换} | Branch by Abstraction / 防腐层(ACL) | design ADR |
| {数据语义变更} | Additive-only schema / 双写迁移 | spec 迁移路径 |
| {跨模块波及} | Façade 收口 / 依赖倒置(DIP) | design BC/模块切分 |

> 无冲突且无既有触达时:本节写 `> 纯新增 / 无需降耦合规则`。

---

## 6. (可选)调用与采纳记录

| ts | 调用方 | 采纳点 | 落点 |
|----|--------|--------|------|
| {ISO8601} | proposal-writer | §2 冲突点 → proposal §0.3 | `proposal.md` |
| {ISO8601} | spec-writer    | §3 影响面 → spec `[已有·修改]` Diff | `specs/{cap}.md` |
| {ISO8601} | design-writer  | §5 设计规则 → design §5 ADR | `design.md` |
| {ISO8601} | user           | 独立调用 | — |

> 可选,便于事后追溯;不填不报错。
