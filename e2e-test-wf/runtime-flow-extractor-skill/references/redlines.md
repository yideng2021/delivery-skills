# 红线与反模式

> 本 skill 是 **"trace → spec 综合"** 任务，不是生成任务。AI 只做四件事：
> **分桶、schema 推断、节点命名、画图**。下列红线违一即废。

## R1 契约必须派生自真实流量，禁杜撰

- ✅ `.flow` 里每个 `→ METHOD /path` 都能在 `events.json` 的 `calls[]` 找到对应项。
- ❌ 凭"系统大概有个删除接口"补一条没真实发生的 `DELETE /api/...`。
- ❌ 把代码里看到的接口（静态）当作"本次流程发生的接口"写进流程图。流程图只记**真实跑到的**。

## R2 推断必标 `~inferred`

- 类型确定（来自真实字段）→ 不标注。
- 单样本、枚举可能不全、字段可空性靠猜 → 标 `~inferred: <说明>`。
- 真实示例值 → 标 `~real: <值/事实>`。
- **混淆推断与事实 = 制造"看起来可信的幻觉"**，正是棕地认知最危险的污染。

## R3 脱敏先于落盘

- 凭据 / PII 绝不进 events.json / flow.flow / flow.mmd。
- 详见 [redaction-rules.md](redaction-rules.md)。

## R4 保真第一：可加固，不可改语义

保真 = **同一目标元素 + 同一操作顺序 + 保留 popup/多窗口/真实导航语义**。

- ✅ **允许加固**（提升回放稳定性，不改语义）：把脆弱 selector（`nth/first`）升级为
  `getByRole/getByLabel/getByText(exact)` 指向同一元素；遮挡字段加 `scrollIntoViewIfNeeded`；
  动态渲染加 `waitForLoadState/waitForResponse/适度 waitForTimeout`。详见 [robustness-playbook.md](robustness-playbook.md)。
- ❌ **禁止改语义**：改变目标元素、删步骤、重排顺序、用 `goto` 抄近路替代真实 UI 导航、
  把 popup（`waitForEvent('popup')`）简化为单页。
- 流程图反映**真实操作**，不是"理想流程"。真实里有重复刷新、冗余请求、新开窗口，照实记录。

## R5 单样本局限须显式声明

- 录一遍 = 走一条路径。产出是**示例级契约**，非完整契约。
- 在 `00-overview` / flow 头部注明覆盖范围；多路径需多次录制合并。

## R6 图文同源

- `flow.flow` 与 `flow.mmd` 都从同一份 `events.json` 生成，不得各写各的。
- 两者接口集合必须一致；不一致 = 有一方掺了私货。

## 反模式速查

| 反模式 | 正解 |
|--------|------|
| 流程图里画了没真实发生的接口 | 删；只画 calls[] 里有的 |
| 把推断的字段当确定类型 | 标 `~inferred` |
| events.json 留了明文 token | 落盘前脱敏，HAR 不入库 |
| 为"美观"合并/重排真实步骤 | 照实记录，重复也保留 |
| 一次录制当完整契约对外承诺 | 标注"示例级 + 覆盖范围" |
| flow.flow 手写、mmd 另画 | 都从 events.json 生成 |
