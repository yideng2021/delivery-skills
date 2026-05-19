# spec 阶段写作指南

> 本文件是 spec-writer 的"操作手册"。**不复述**已有规则:
> - L0–L4 分层职责 → [`./l0-l4-guide.md`](./l0-l4-guide.md)
> - EARS / Gherkin 句式 → [`./ears-gherkin-cheatsheet.md`](./ears-gherkin-cheatsheet.md)
> - 增量标注语义 → [`./increment-annotation.md`](./increment-annotation.md)
> - `related_req` 收敛 → [`./req-convergence.md`](./req-convergence.md)
> - AC 三层口径 → [`../../shared/contracts/ac-vocabulary.md`](../../shared/contracts/ac-vocabulary.md)
> - 字段语义 → [`../../shared/contracts/frontmatter-schema.md`](../../shared/contracts/frontmatter-schema.md)
> - 验收 → [`./checklist.md`](./checklist.md)

---

## §1 阶段定位

spec 阶段把 proposal 的"战略意图"翻译为"业务级可验证规约":

- **不**写技术方案(归 design-writer)
- **不**写实现细节(归 dev skill)
- **必须**给出 INV / AC 作为验收的唯一可执行依据

输入:proposal frontmatter `change_name` + `related_req_proposal` + proposal §3 Capability Map。
输出:`docs/spec/{change_name}/specs/{capability}.md` 一个或多个文件。

---

## §2 起草 6 步顺序

1. **读 proposal**:确认 `change_name` / `related_req_proposal` / Capability Map / 已显式排除项
2. **拆 capability**:按 §3 Capability Map 拆为 N 个 spec 文件,每文件 1 个 capability(kebab-case)
3. **AUTH 收敛**:按 [`./req-convergence.md`](./req-convergence.md) §2 决策,把 `related_req_proposal` 分配到各 spec 的 `related_req`
4. **写 frontmatter**:4 字段全填(`change_name / status: draft / related_req / milestone`)
5. **按 L0→L4 顺序填正文**:每条 US/INV/AC 紧跟增量标注
6. **进入 CDR**:挂用户批注 → 按 §5 分流消化 → 满足退出条件后升 `status: reviewed`

---

## §3 各章写作要点

### §3.1 L0 业务上下文(3–6 行)

聚焦"为什么做"与"边界禁区";业务禁区是 L4 DoD 的最后一条守卫,**必须**有 1 条以上。

### §3.2 L1 用户故事

只写叙事,不写 AC。每条 US 必须能在 L2/L3 找到承载。**漏标增量** = checklist §2 拒绝通过。

### §3.3 L2 INV-x

数据级永真规则。业务语言纯净,违禁词列表见 [`./l0-l4-guide.md`](./l0-l4-guide.md) §4。

### §3.4 L3 AC-{req}-{seq}

EARS + Gherkin 配对。`req` = `related_req` 元素尾段。Then 子句不可观察 = 必改。

### §3.5 L4 DoD

零新增验收。每条 checkbox 反向引用 L2 INV / L3 AC / L0 业务禁区。漏勾或新增视为违例。

---

## §4 frontmatter 写入规则

| 字段 | 取值规则 | 备注 |
|------|----------|------|
| `change_name` | 与 proposal `change_name` 完全一致 | 不得自行改写 |
| `status` | 起草期 `draft`;CDR 全部退出条件满足后改 `reviewed` | 不允许中间值 |
| `related_req` | 收敛结果(见 [`./req-convergence.md`](./req-convergence.md));空列表写 `[]` | 禁用通配符 |
| `milestone` | 有则写 string;无则写 `—`(U+2014);**禁止省略键** | 由 RBK 解读 |

---

## §5 CDR 在 spec 阶段的批注分流

| 批注性质 | 处理 | 原因 |
|---------|------|------|
| 战略调整(AUTH 范围 / 能力增减) | **反推 proposal 修订**(spec 阶段不直改) | proposal 是范围唯一权威 |
| spec 内部规约(INV/AC 措辞 / 增量标注) | spec-writer 直接消化 | 本阶段权限 |
| 实现细节(API 路径 / 字段类型 / SQL) | **引导至 design 阶段**,本阶段记录但不消化 | 越层 |
| 工程闭环(覆盖率 / 测试命令) | **引导至 dev skill**,本阶段记录但不消化 | 越层 |

CDR 协议本身见 [`../../shared/protocols/cdr-protocol.md`](../../shared/protocols/cdr-protocol.md),本表仅给本阶段分流口径。

---

## §6 与下游衔接

| 字段 | 下游读取方 | 用途 |
|------|----------|------|
| `change_name` | design-writer / task-decomposer / workflow | 路径锚定 |
| `status` | workflow | 阶段状态机转移 |
| `related_req` | RBK / task-decomposer | RBK 监听需求闭环;task 追溯 |
| 文件路径 | design-writer 通过 `reference_specs` | design 引用 |

衔接全部通过 frontmatter 字段 + 文件路径,**无命令名耦合**。

---

## §7 6 项常见反模式

- ❌ L1 US 写 AC → 应放 L3
- ❌ L2 INV 出现"主键 / SQL / HTTP" → 业务语言纯净违例
- ❌ L3 Then 子句不可断言("体验流畅") → 必须具化或删除
- ❌ L4 DoD 新增验收点(L2/L3 找不到来源) → 零新增铁律违例
- ❌ 一条 AUTH 同时出现在两个 spec 的 `related_req` → D4 强约束违例
- ❌ spec 阶段单边新增 proposal 未声明的 AUTH → Q1-3 裁决违例

---

## §8 篇幅与风格

- 单个 spec 文件**软上限** ≈ 200 行(超出 = capability 应再拆)
- 声明式 > 命令式;业务语言 > 技术语言
- 引用 shared/ 与 references/ 文档**只用链接**,不复述

---

## §9 严禁事项

- 严禁调用 RBK 任何命令(零命令名耦合,见 schema §3)
- 严禁在 spec 文件中复述 ac-vocabulary / frontmatter-schema / cdr-protocol 的定义
- 严禁出现 sibling skill 的 markdown 链接(互不引用)