# 活查询指南 · {{repo_name}}

> 认知基线的"用法说明书"。原则：**薄文档给方向，活查询给细节。** 细节以 MCP 实时查询的 verbatim 源码为准。

---

## 一、按意图选工具

| 你想知道 | 首选 | 命令 / 入口 |
|---|---|---|
| 项目有哪些业务域、怎么分层 | 文档 | `01-architecture.md` |
| 主线有哪些业务流程、入口在哪 | 文档 | `02-business-flows.md` |
| 某流程的具体调用链 / 状态机 | CodeGraph | `codegraph_explore("<Controller/模块> <动作>")` |
| 某符号 360°（谁调它/它调谁/参与哪些流程） | GitNexus | `context(name)` |
| 改 X 会炸哪（影响面） | 双查 | `codegraph_impact` + `gitnexus impact` |
| 对外接口契约 / 跨服务一致性 | GitNexus | `shape_check` / `api_impact` |
| 某业务域内全部类 | GitNexus | `cypher: MEMBER_OF Community {heuristicLabel}` |
| 跨文件/动态分发（回调、Kafka、feign） | CodeGraph | `codegraph_explore`（calls 边连通静态断链） |

**分工心智**：CodeGraph = "代码怎么跑 + verbatim 源码（准确性锚点）"；GitNexus = "业务是什么 + 改了会炸哪 + 契约"。

---

## 二、下游消费（产物级、零耦合）

> 本认知层产出独立产物，可被任意下游按"存在即用、缺失则降级"的方式消费；本层**不感知**任何特定下游。

### 2.1 现状盘点（既有能力 / 模块触达）

| 想盘点 | 查询方式 |
|---|---|
| 业务能力触达 | 读 `01` 业务域 → `gitnexus context(关键符号)` 确认 |
| 工程模块触达 | 读 `01`/`02` 入口锚点 → `codegraph_impact(目标符号)` 看触达模块 |
| 风险 / 回退面 | `codegraph_impact` + `gitnexus impact` 取爆炸半径 + 跨域触点（如 MQ/RPC/外部系统） |

### 2.2 复用决策取证（扩展 vs 新建）

| 要回答 | 查询方式 |
|---|---|
| 既有资产是否已盘点 | 读 `01` 业务域 + `02` 流程索引 |
| 某能力是否已有责任方 | `gitnexus context` / `cypher MEMBER_OF` 看归属域 |
| 为何新建而非扩展 | `codegraph_impact` 评估扩展既有模块影响面 vs 新建成本 |

### 2.3 影响驱动拆分

`codegraph_impact` / `gitnexus detect_changes` 把"改动爆炸半径"换算成任务边界与依赖。

---

## 三、铁律（防止认知层退化）

1. **不固化 AI 叙事**：流程详情即时查、用完即弃。
2. **断言必回链**：结论标 `文件:行号`，可一键核对。
3. **冲突信源码**：文档与源码不一致时以源码为准。
4. **单源不下结论**：业务域判断需社区 ∩ 包结构双源互证。
