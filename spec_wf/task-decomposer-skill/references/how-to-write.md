# how to write tasks.md(填写指南)

> 本文件是 task-decomposer 的**操作手册**,按 tasks.md 模板顺序逐节给出写法、判定要点与典型反例。
> 验收清单见 [`./checklist.md`](./checklist.md);拆解原则见 [`./decomposition-rules.md`](./decomposition-rules.md);
> 越权红线见 [`./overreach-redlines.md`](./overreach-redlines.md)。

---

## §0 前置:上下文加载顺序

填写 tasks.md 前**必须**按下列顺序加载上下文,跳级即等于"凭空拆解":

1. 读 design.md frontmatter(获取 `change_name / domain_modeling_level / bounded_contexts / produced_specs`)
2. 读 design.md1~§7(尤其 §3 模块对外契约 + §6 越界声明 + §7 追溯映射)
3. 读 `produced_specs` 列出的所有 spec 文件 L0~L4(获取全部 AC / INV / US)
4. 在以上上下文齐备后,才开始填写 tasks.md §1

## §1 frontmatter 7 字段填写

按字段顺序填写:

1. `change_name`:从 design `change_name` 直接拷贝
2. `status`:起手 `draft`,CDR 退出后才能改 `reviewed`
3. `related_design`:design.md 相对路径(通常就是 `design.md`)
4. `domain_modeling_level`:**完全沿用** design.frontmatter,不得改写
5. `bounded_contexts`:design.frontmatter 的**子集**(可全集,不可超集)
6. `handover_domains`:5 枚举闭集子集,从 §2 Task 列表的"承接方"列做并集得到
7. `exc_status`:起手 `pending`

**严禁**写 `shipped_us` 字段(C1-4:由 workflow writeback 阶段注入)。

## §2 §1 拆解上下文(四项沿用)

§1 四项内容**全部**是对 frontmatter / design 的引用,本节不写新内容。

**反例**:在 §1 复述 design §1 架构上下文 → 违反 overreach-redlines 红线 3。

## §3 §2 任务清单(核心节)

### §3.1 单条 Task 的 7 字段(L2/L3 场景)

每条 Task 必须按下列字段顺序写,缺一即违规:

1. **承接方**:5 枚举闭集之一(单选,不可"前端+后端")
2. **覆盖 spec 条目**:列出本 Task 承担的 AC / INV / US ID + 涉及的 spec 文档清单(去重,仅文件名,不到章节)
3. **关联 BC**:`bounded_contexts` 中的某个 BC(L1 场景填 `—`)
4. **关联 design 落点**:指向 design §3 模块对外契约的具体模块
5. **交付定义(DoD)**:一句业务态变化(详见 [`./overreach-redlines.md`](./overreach-redlines.md) 红线 1)

### §3.2 L1 场景字段降级(4 字段)

`domain_modeling_level: L1` 时,Task 仅保留:承接方 / 覆盖 REQ 或 US / 关联 design 落点 / 交付定义,"关联 BC" 取 `—`。详见 [`./decomposition-rules.md`](./decomposition-rules.md) §2 规则 4。

### §3.3 拆解粒度自检

完成 §2 后做三道自检:

1. **零遗漏**:specs 中全部 AC / INV / US 在 §2 的"覆盖 spec 条目"字段中至少出现一次
2. **零重复**:任何 AC / INV / US 在 §2 中**不超过 1 次**
3. **零跨承接方合并**:每条 Task 的"承接方"字段是单

## §4 §3 越权声明

非空。每条以"不 + 动词"开头(例如"不实现 design §6 已声明越界的子系统")。这一节是 task 阶段的承诺清单,后续 dev 阶段若违反需回此处增补。

## §5 §4 进度表

每条 Task 一行,`exc_status` 列初始全填 `pending`。整体 frontmatter `exc_status` 字段按 [`./decomposition-rules.md`](./decomposition-rules.md) §5 聚合规则推导。

---

## §6 CDR 反向 4 路分流(task 阶段特有)

task 阶段处于规约链**末端**,既会收到上游(design/spec 范围)的批注,也会收到下游(实现侧)的批注。分流方向是**反向 + 4 路**:

| 批注类型 | 典型批注 | 分流方向 | 处理人 |
|---------|---------|---------|--------|
| **战略 / 规约范围** | "缺一条 spec 没分配 Task" / "BC 划分应该调整" | **反推 design / spec 修订**,暂停本阶段 | design-writer / spec-writer |
| **拆解粒度 / 承接方分配** | "前后端联调任务应拆开" / "同一 BC 内不应合并" | **直接消化**(按 decomposition-rules 调整) | task-decomposer 自身 |
| **实现技术细节** | "用 React 还是 Vue" / "数据库索引怎么建" | **转交 dev skill**(本 skill 不消化) | dev skill |
| **工程闭环** | "测试方案" / "监控告警" / "部署拓扑" | **转交 dev skill** | dev skill |

分流原则:

- 战略 / 规约范围批注**必须暂停 CDR**,先回上游修订
- 拆解粒度 / 承接方分配批注**必须就地消化**,这是 task 阶段的核心职责
- 实现技术细节 / 工程闭环批注**严禁**在 task 内消化(否则 task 篇幅膨胀,与 dev 职责重叠)

CDR 退出条件(对齐 [`../../shared/protocols/cdr-protocol.md`](../../shared/protocols/cdr-protocol.md)):全部批注按上表分流完成,且本阶段直接消化的批注全部就地解决。

## §7 status 升档前的最后自检

把 `status: draft` 改为 `reviewed` 之前,过一遍 [`./checklist.md`](./checklist.md) 五个 §,任何一条 `[ ]` 未勾选即不允许升档。