# overreach redlines(task 阶段越权红线)

> 本文件枚举 tasks.md 正文**禁止出现**的内容形态,是 task / design / dev 三阶段边界纪律的执行指南。
> 验收清单见 [`./checklist.md`](./checklist.md);拆解原则见 [`./decomposition-rules.md`](./decomposition-rules.md)。

---

## §1 红线总则

task-decomposer 阶段产出的是**承接方 × BC 维度的工单清单**与**追溯映射**,**不是**实现方案,**也不是**新规约。

判定一段内容是否越权,问三个问题:

1. 这段内容是否在 design.md / specs/*.md 中已经存在(任意更上游)?(是 → 必然是复述,删除并改链接)
2. 这段内容是否决定 dev 阶段的技术选型 / 实现细节?(是 → 越权下游,删除)
3. 这段内容是否引入 design 中不存在的 BC / 模块 / spec 条目?(是 → 越权上游,反推 design 修订)

## §2 红线枚举(共 5 条)

### 红线 1:不出现实现技术细节(下游越权)

| 越权形态 | 纠正方向 |
|----------|----------|
| `npm test / pytest / mvn test` | 删除,归 dev skill |
| `覆盖率 ≥ 80%` | 删除,归 spec L4 DoD |
| `使用 React 18 / Spring Boot 3.2 / axios` | 删除,归 dev skill |
| `部署到 K8s / 容器配置 / nginx 路由` | 删除,归 dev skill 或 design §5 ADR(后者只能提"需引入"不指定具体方案) |
| 接口签名 / SQL / HTTP 路径 / 状态码 | 删除,归 design 已禁(boundary-redlines)+ dev 实现 |

### 红线 2:不引入新规约(上游越权)

| 越权形态 | 纠正方向 |
|----------|----------|
| 在 Task 中新增 design 不存在的 BC | 反推 design 修订(暂停 task 阶段) |
| 在 Task 中新增 spec 不存在的 AC / INV / US | 反推 spec 修订(暂停 task 阶段) |
| 在 Task 中重新定义业务规则(L0 业务禁区) | 删除,归 spec L0 |
| 在 Task 中改写 design §3 模块对外契约 | 删除,归 design §3(若需调整必须 CDR 反推) |

### 红线 3:不复述 design / specs 内容(SSOT 违例)

| 越权形态 | 纠正方向 |
|----------|----------|
| 把 design §3 模块对外契约的"输入 / 输出"再写一遍 | 删除,改为"关联 design 落点"的引用 |
| 把 spec 的 AC 完整文本复制到 Task | 删除,只写 AC ID 引用 |
| 把 design §1 架构上下文搬到 Task §1 | 删除,Task §1 只引用 frontmatter 字段 |

### 红线 4:不写跨承接方合并任务(粒度违例)

| 越权形态 | 纠正方向 |
|----------|----------|
| `Task: 前后端登录联调` | 拆为 2 条:`backend × BC-Auth: 登录服务` + `frontend × BC-Auth: 登录页面` |
| `Task: 数据库 + 后端订单流程` | 拆为 2 条:`database × BC-Order` + `backend × BC-Order` |
| `Task: 全栈用户注册` | 拆为多条,每条单一承接方 |

### 红线 5:不写中文状态枚举(枚举违例)

| 越权形态 | 纠正方向 |
|----------|----------|
| `exc_status: 待执行 / 执行中 / 已完成 / 已阻塞` | 改为 `pending / in_progress / done`(对齐 schema §4.3,**已废弃**中文枚举与 `blocked`) |
| `承接方: 数据库 / 后端 / 前端` | 改为 `database / backend / frontend`(对齐 handover-domains §1) |
| `承接方: dba / ops / qa / mobile` | 删除,5 枚举闭集之外**全部非法**(handover-domains §6) |

## §3 越权发现后的处理(对齐 CDR反向 4 路分流)

| 红线类别 | 分流方向 |
|----------|----------|
| 红线 1 越权(实现细节) | 转交 dev skill,在 task 内删除 |
| 红线 2 越权(新规约) | 反推 design / spec 修,**暂停**本阶段 |
| 红线 3 越权(复述) | 直接消化:删除并改链接 |
| 红线 4 越权(粒度) | 直接消化:按 decomposition-rules 拆分 |
| 红线 5 越权(枚举) | 直接消化:改成合法枚举值 |

## §4 与 design boundary-redlines 的边界

design 的 boundary-redlines 禁止 SQL / HTTP / 字段类型出现在 design.md。task 的 overreach-redlines 复用同一边界(因为 task 不能比 design 更下游),**额外**加上"不引入新规约"(上游越权)与"不写跨承接方合并任务"(粒度违例)。

两者**协同关系**:design 已禁的内容 task 必然也禁(传递性);design 未禁但 task 禁的内容是 task 阶段独有红线(规则 4 / 规则 5)。