# Handover Domains — 工单承接域闭集

> **本文件是 frontmatter 字段 `handover_domains` 取值的唯一权威**。
> 任何 skill / workflow 引用承接域时只能链接本文件,不得复述,亦不得自行扩充。

---

## §1 闭集声明

`handover_domains` 取值必须是下表 5 个枚举的子集(可多选,不可越界):

| 枚举值 | 中文称谓 | 触发条件(何时出现该枚举) |
|--------|---------|-----------------------|
| `database` | 数据库承接 | design 中存在持久化落点(实体表 / 索引 / 迁移) |
| `backend` | 后端承接 | design 中存在模块对外契约(服务 / API 接口 / 业务流程实现) |
| `frontend` | 前端承接 | specs L1 用户故事中存在 UI 交互 / 页面 / 表单 |
| `integration` | 集成承接 | 存在外部系统协作(消息总线 / 第三方 API / 事件接入) |
| `infra` | 基础设施承接 | 存在新服务骨架 / 部署变更 / CI/CD / 配置中心变更 |

> **闭集**:除上述 5 个枚举外,**任何取值非法**。如需新增承接域,必须回到 Stage 1 修改本文件并触发"偏离方案"流程,不得在写手 skill / workflow 中临时扩充。

---

## §2 枚举语义(一句话定义)

- **`database`**:对持久层做结构变更或新增持久化职责的承接,产物典型为表 / 字段 / 索引 / 迁移脚本。
- **`backend`**:实现业务流程、模块对外契约、领域服务的承接,产物典型为服务方法 / API 端点 / 领域用例。
- **`frontend`**:实现用户可见 UI 交互的承接,产物典型为页面 / 组件 / 状态管理 / 表单校验。
- **`integration`**:与外部系统建立协作的承接,产物典型为事件订阅 / 消息发布 / 第三方 API 适配 / 反腐败层。
- **`infra`**:为本次 change 提供运行环境与部署能力的承接,产物典型为新增服务骨架 / 容器配置 / 网关路由 / 监控告警 / 环境变量。

---

## §3 典型工单举例(供 task-decomposer 参考)

| 工单标题(示例) | 承接方 | 备注 |
|----------------|--------|------|
| 订单聚合持久化 | `database` | 覆盖 INV-2 / INV-3 |
| 订单创建与提交 API | `backend` | 覆盖 AC-001-01 ~ AC-002-02 |
| 订单提交页面与表单 | `frontend` | 覆盖 US-101 |
| 库存系统事件对接 | `integration` | design §2.2.2 订单 → 库存 |
| 新增订单服务骨架 | `infra` | 服务初始化 / 部署变更 |

---

## §4 多承接方组合规则

- 一份 tasks.md 的 `handover_domains` 字段是**整次 change 涉及的承接方并集**(子集语义)。
- 每条具体任务条目的"承接方"字段必须是 §1 5 个枚举之一;不允许"多领域合并任务"(跨领域必须拆分,详见 task-decomposer-skill 的拆解原则)。
- 同领域 + 不同 BC 的工单必须拆分(L2/L3 场景);同领域 + 同 BC + 同业务动机的工单可合并。

> 任务粒度判定的具体细则不在本文件,由 [`../../task-decomposer-skill/`](../../task-decomposer-skill/) 在 Stage 2.4 落地。

---

## §5 与其他 shared 文档的边界

- `handover_domains` 字段在 frontmatter 总表中的位置、必填性 → 见 [`frontmatter-schema.md`](./frontmatter-schema.md) §1。
- `handover_domains` 为空时的写法 → 见 [`empty-value-convention.md`](./empty-value-convention.md);理论上若 5 类承接方均不涉及视为非法 change(至少应有一类),写手应触发 CDR 修正而非取空。
- 承接方与下游 dev skill 的协作仅通过本字段被动驱动,**严禁在任何 skill 中硬编码"调用 RBK U..."或具体 dev skill 的命令名**。

---

## §6 校验规则(供 Stage 4 审计)

- frontmatter 全量 grep:`handover_domains:` 所跟值必须 ⊆ {`database`, `backend`, `frontend`, `integration`, `infra`}
- 任务条目"承接方"取值必须是上述枚举之一
- 出现 `dba` / `ops` / `qa` / `mobile` 等其他枚举即审计失败

---

## §7 历史沿革(防误改)

- 旧 `spec-design-skill` 中"承接方"枚举为 `database / backend / frontend / integration / infra` 五类,v2 完全保留语义不变,仅将**字段载体从模板正文升级为 frontmatter `handover_domains` 字段**,实现"被动监听"协作。
- 旧版"按 Phase 流水线拆任务"(Scaffolding → Schema → Service → API → UI)在 v2 已废弃,以"承接方 × BC"二维拆分取代;不得在新模板中复活 Phase 概念。