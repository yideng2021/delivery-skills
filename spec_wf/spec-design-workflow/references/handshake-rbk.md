# Handshake with RBK — 字段被动握手协议

> 本文件描述 spec-design-workflow 与 requirements-bookkeeping-skill (RBK) 之间的协作。
> **零命令名耦合**(主索引 §3 A2):全部协作仅通过 frontmatter 字段被动驱动,workflow 不调用 RBK 任何命令、RBK 不调用 workflow 任何 skill。
> **本文件是 workflow 内部参考;4 个写手 skill 的 SKILL.md 不得引用本文件**(否则破坏 skill ⊥ workflow 解耦,见主索引 §3 A1)。

---

## §1 协议定位

- workflow 的写读身份:扫描 frontmatter 字段并在阶段切换时做状态转移;`writeback` 阶段为唯一**写入** RBK 数据载体的环节(写入字段 `tasks.shipped_us`)。
- RBK 的角色:监听项目级账本(`docs/spec/REQUIREMENTS.md` / `docs/spec/ROADMAP.md`)与各 change 的 frontmatter 字段;由用户主动触发其能力,workflow 不与之直接对话。
- 协议立场:本文件描述**字段流向**,不描述**调用顺序**(因为没有调用)。

---

## §2 字段握手三点

| 握手点 | 时机 | workflow 写入 / 读取 | RBK 监听 |
|--------|------|----------------------|----------|
| ① 账本起始 | proposal 阶段产出后 | 监听 `proposal.req_ledger_state` | 用户在外部触发 RBK 的"起始 / 添加需求"能力 |
| ② AUTH-ID 埋点 | spec 阶段产出后 | 监听 `specs/*.md` 的 `related_req` | RBK 监听同字段建立追溯 |
| ③ 收尾打勾 | tasks 阶段 `exc_status == done` 后 | **写入** `tasks.shipped_us`(从各 specs 的 L4 DoD 已勾选 `[x]` 的 US 提取) | RBK 监听 `shipped_us` 完成账本打勾 |

> 三点全部**仅以字段为媒介**;workflow 不主动通知 RBK,RBK 不主动通知 workflow。

---

## §3 字段流向图

```
proposal-writer ──写──▶ change_name, status, change_mode,
                       req_ledger_state, related_req_proposal
                                                 ─监听─▶ RBK
                       related_req_proposal      ─读───▶ spec-writer

spec-writer    ──写──▶ change_name, status, change_mode,
                       related_req                ─监听─▶ RBK
                       reference_specs, touched_capabilities, impacted_modules, milestone
                                                  ─读───▶ design-writer / task-decomposer

design-writer  ──写──▶ produced_specs / architecture_refs（活字段:path+usage）/
                       domain_modeling_level / domain_model_mode / bounded_contexts /
                       reused_modules / bc_relations
                                                 ─读───▶ task-decomposer

task-decomposer──写──▶ related_design / handover_domains / exc_status

workflow       ──读──▶ 全部 status / exc_status / change_mode
workflow       ──写──▶ tasks.shipped_us           ─监听─▶ RBK
```

> 此图与 [`../../shared/contracts/frontmatter-schema.md`](../../shared/contracts/frontmatter-schema.md) §3 等价;若有冲突以 schema 为准。
> **`change_mode` 跨阶��沿用**:proposal-writer 首次写入,spec-writer 完全沿用,design / task / workflow 仅读�写。

---

## §4 writeback 阶段数据构造规则

进入 `writeback` 节点(`tasks.exc_status == done`)时,workflow 自身执行下列**纯字段操作**:

1. 读取 `tasks.related_design` → 解析出 design 路径
2. 读取 design 的 `produced_specs` → 解析出 specs/*.md 列表
3. 扫描各 spec 文件 L4 DoD 段已勾选 `[x]` 的 US-ID 列表
4. 注入 `tasks.shipped_us` 字段(数组,空集时取 `[]`,见 [`../../shared/contracts/empty-value-convention.md`](../../shared/contracts/empty-value-convention.md))
5. 读取各 spec 的 `related_req`:若全部为空 → 进入"无 AUTH 关联"分支(workflow 仅写字段,不再做后续动作);若非空 → 写入 `shipped_us` 后由 RBK 自行监听打勾

> 第 5 步的两个分支统一表现为"字段写入完成"。**workflow 不主动调用任何 RBK 能力**。

---

## §5 用户行为边界

- 用户随时可独立操作 RBK,不必经过 workflow。
- 用户也可独立运行 4 个写手 skill 不经 workflow 编排(此时 workflow 退化为零)。
- workflow 仅在用户从"做技术方案"语义入场时介入,产出全周期编排。

> 三方协作图:用户、workflow、RBK 均**通过字段读写**协作,任何两方都没有直接 API 依赖。

---

## §6 严禁事项 (Hard Bans)

下列写法在 workflow 内任何文件**零容忍**:

1. **命令名硬编码**:不得出现 `调用 RBK U1 / U2 / U4 / U5 / U6 / Uxxx` 任何命令名。
2. **正向 API 调用**:不得描述"workflow 调用 RBK",只能描述"workflow 写字段,RBK 监听同字段"。
3. **越界写账本**:workflow 不得直接修改 `docs/spec/REQUIREMENTS.md` / `docs/spec/ROADMAP.md`,该职责由 RBK 自治。
4. **被 4 个写手 skill 引用**:本文件是 workflow 内部参考;任何 SKILL.md 出现指向本文件的 markdown 链接视为破坏 A1 解耦。

---

## §7 字段一致性最低保证

workflow 在阶段切换前必须保证下列字段一致(否则拒绝转移,见 [`./stage-graph.md`](./stage-graph.md) §4):

- `change_name` 在 proposal / specs/*.md / design.md / tasks.md 之间完全一致
- `change_mode` 在 proposal / specs/*.md / design.md 之间完全一致(spec-writer / design-writer 完全沿用 proposal)
- `related_req` 并集 ⊇ proposal `related_req_proposal` 中标注 `[新增] / [已有·扩展] / [已有·修改] / [已有·废弃]` 的 AUTH-ID 子集(C2.2-1 / C2.2-2)
- `produced_specs` 路径在 design 中存在且可达(design 视角)
- `reference_specs` / `touched_capabilities` / `impacted_modules`(spec 视角)与 proposal §0.1 / §0.2 一一对应
- **design.reused_modules[].path 集合 ⊇ 各 spec.impacted_modules 的并集**(C5-9 design 不遗漏 spec 影响)
- **design.bc_relations[].bc 集合 == design.bounded_contexts**(C5-10 BC 关系字段一一对应)
- **design `change_mode != greenfield` 时 reused_modules 必非空**(C5-8 增量字段联动)
- `change_mode != greenfield` 时,各 specs 的 `reference_specs` / `touched_capabilities` / `impacted_modules` 至少一个非空
- `related_design` 路径在 tasks 中指向同一 change 的 design.md
- `bounded_contexts`(tasks)⊆ `bounded_contexts`(design)

> workflow 不深入 spec / design / tasks 正文校验;正文校验属各 skill 内部 checklist 与 Stage 4 audit 范畴。

---

## §8 校验规则(供 Stage 4 审计)

- 全文 grep `调用 RBK | U1 | U2 | U4 | U5 | U6` 必须 0 命中(本节"严禁事项"中的反例已用反斜杠/引号包装,审计排除上下文判断)
- 全文不得出现"复杂度守卫" / "复杂度梯度"
- 字段流向图与 [`../../shared/contracts/frontmatter-schema.md`](../../shared/contracts/frontmatter-schema.md) §3 必须一致
- 任何描述 RBK 行为的句子主语必须是"RBK 监听字段 X"或"用户在外部触发 RBK"
- 4 个写手 skill 的 SKILL.md 中 grep 本文件路径必须 0 命中