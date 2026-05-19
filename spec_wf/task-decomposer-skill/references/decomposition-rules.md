# decomposition rules(任务拆解原则)

> 本文件定义 task-decomposer 在 design.md 与 specs/*.md 已确定的前提下,如何把规约切分为可分配给单一承接方的 Task。
> 承接域闭集见 [`../../shared/contracts/handover-domains.md`](../../shared/contracts/handover-domains.md);
> 越权红线见 [`./overreach-redlines.md`](./overreach-redlines.md)。

---

## §1 拆解二维:承接方 × BC

task-decomposer **不**按 Phase 流水线(Scaffolding → Schema → Service → API → UI)拆任务——这种旧模式已废弃。v2 拆解维度固定为**两维**:

- **承接方维度**:`database / backend / frontend / integration / infra`(handover-domains §1 5 枚举)
- **限界上下文维度**:`bounded_contexts`(沿用 design.frontmatter)

每条 Task 的位置 = `(承接方, BC)` 二元组。

## §2 拆解粒度规则(4 条硬约束)

### 规则 1:同领域 + 不同 BC **必须**拆分

L2 / L3 场景下,即使是同一承接方,跨 BC 必须切两条 Task。

- **理由**:BC 是设计阶段的一致性边界,跨 BC 合并会破坏边界可追溯性
- **反例**:`backend × (BC-Order ∪ BC-Inventory)` 写成一条 Task → 必须拆为 2 条

### 规则 2:同领域 + 同 BC + **同业务动机**可合并

- **同业务动机**判定:Task 的"覆盖 spec 条目"集合属于同一条 US 或同一组 AC-{req}-* 的连续编号
- **反例**:把 `AC-LOGIN-01`(登录) 与 `AC-RESET-01`(重置密码)合并 → 业务动机不同,必须拆

### 规则 3:跨承接方**严禁**合并

一条 Task 仅一个承接方。"前端 + 后端联调任务"不是合法 Task,必须拆为前端 + 后端两条,通过 `覆盖 spec 条目` 字段建立追溯关联。

### 规则 4:L1 场景字段降级

L1 场景(`domain_modeling_level: L1`)Task 仅保留 4 字段:

1. 承接方
2. 覆盖 REQ 或 US
3. 关联 design 落点
4. 交付定义(DoD)

"关联 BC" 字段值取 `—`(非空,占位符)。

## §3 spec 条目分配规则

每条 spec 中的 AC / INV / US 必须分配给**且仅**给一条 Task:

- **AC**(L3):分配给最先承载该 AC 的 Task(通常是 backend × BC-{相关})
- **INV**(L2 业务不变量):分配给 database 承接方(若涉及持久化)或 backend(若纯运行时校验)
- **US**(L1 用户故事):分配给 frontend 承接方(若涉及 UI)或 backend(若纯后端流程)

**零遗漏 + 零重复**:specs 中全部 AC / INV / US 在 §2 Task 的"覆盖 spec 条目"字段中出现且仅出现一次。

## §4 承接方推断规则

design.frontmatter `bounded_contexts` 与 design §3 模块对外契约不直接告诉你承接方分配。task-decomposer 按以下规则推断:

| 信号 | 推断承接方 |
|------|----------|
| design §3 模块涉及持久化(实体表 / 索引 / 迁移) | `database` |
| design §3 模块对外契约是服务方法 / 业务流程 / API 端点 | `backend` |
| spec L1 用户故事涉及 UI 交互 / 页面 / 表单 | `frontend` |
| design §4 跨模块协作涉及外部系统 / 消息事件 / 第三方 API | `integration` |
| 引入新服务骨架 / 部署变更 / CI / 配置中心 | `infra` |

满足多个信号时按二维拆分(规则 1-3),不允许打包成一条 Task。

## §5 进度表与 exc_status 约束

§4 进度表的 `exc_status` 列初始全部填 `pending`(对齐 schema §4.3)。其余两个枚举的转移规则:

- `pending → in_progress`:dev skill 开始执行该 Task 时由 workflow 推动(本 skill 不写)
- `in_progress → done`:dev skill 完成 DoD 时由 workflow 推动(本 skill 不写)

整体 frontmatter `exc_status` 字段(单值)聚合规则:

- 任一 Task `exc_status: in_progress` → 整体 `in_progress`
- 全部 Task `exc_status: done` → 整体 `done`,触发 workflow `tasks → writeback` 转移
- 其余 → `pending`

## §6 常见误用与纠正

- **误用 1**:把"前后端联调"写成单条 Task → 违反规则 3,必须拆为前端 + 后端两条
- **误用 2**:同一承接方的跨 BC 任务合并 → 违反规则 1
- **误用 3**:L1 场景仍写满 7 字段 → 违反规则 4,必须降级到 4 字段
- **误用 4**:把 spec 的某条 AC 分配给两条 Task → 违反 §3 零重复约束
- **误用 5**:`bounded_contexts` 字段引入 design.frontmatter 中不存在的 BC → 违反 schema 子集语义
- **误用 6**:在 Task 的 DoD 中写"npm test 通过 / 覆盖率 ≥ 80%" → 违反 overreach-redlines,必须改写为业务态描述
- **误用 7**:复活旧 Phase 流水线(Scaffolding/Schema/Service/API/UI) → 违反 §1 二维拆解硬约束