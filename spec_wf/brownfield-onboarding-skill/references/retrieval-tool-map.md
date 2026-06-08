# 检索工具映射（CodeGraph vs GitNexus）

> 按意图选工具的权威指南。生成的 `.brownfield/05-retrieval-guide.md` §1 是其面向单仓的实例化。

---

## 分工心智

| 工具 | 擅长 | 一句话 |
|---|---|---|
| **CodeGraph** | 调用链 / 影响面 / 动态分发桥接 / **verbatim 源码** | "代码怎么跑" + 准确性锚点 |
| **GitNexus** | 业务社区 / 契约 / cypher / 跨仓 / process 骨架 | "业务是什么 + 改了会炸哪" |

二者能力有重叠（都做图遍历/影响），并用的理由是互补的**独占能力**：CodeGraph 的 verbatim 源码与动态分发
连通；GitNexus 的社区检测、契约校验（shape_check / api_impact）、cypher。

---

## 按意图选

| 意图 | 首选 | 调用 |
|---|---|---|
| 项目结构 / 文件树 | CodeGraph | `codegraph_files` |
| 索引健康 / 规模 | CodeGraph | `codegraph_status` |
| 某流程调用链 / 状态机 / 拿源码 | CodeGraph | `codegraph_explore(symbols/question)` |
| 某符号定位 | CodeGraph | `codegraph_search` |
| 谁调它 / 它调谁 / 改它炸啥 | CodeGraph | `codegraph_callers` / `callees` / `impact` |
| 业务域有哪些 / 域内成员 | GitNexus | `cypher: MEMBER_OF Community` |
| 某概念相关执行流（骨架） | GitNexus | `query(goal)` |
| 某符号 360°（含 process 参与） | GitNexus | `context(name)` |
| 影响半径（业务视角） | GitNexus | `impact` |
| 对外接口契约 / 跨服务一致性 | GitNexus | `shape_check` / `api_impact` |
| Git diff 影响 | GitNexus | `detect_changes` |
| 复杂结构查询 | GitNexus | `cypher`（先读 `gitnexus://repo/{name}/schema`） |
| 仓库总览资源 | GitNexus | 资源 `gitnexus://repo/{name}/context` `/clusters` `/processes` |

---

## 交叉验证原则

业务域判断必须 **GitNexus 社区 ∩ CodeGraph 包结构（codegraph_files）** 双源互证；单一信号置信度不足
（社区会把命名相近的技术类聚成伪域，包结构会被工具类目录干扰）。两源一致的结论才喂给 AI 编程。

---

## GitNexus Kuzu/Cypher 注意

- `split` / 复杂字符串函数不可用；File 节点路径属性是 `filePath`（非 `path`）。
- 多仓时其他工具须带 `repo` 参数。
- `embeddings=0` 时 `query` 仅 BM25，无语义；需语义检索先 `gitnexus analyze` 补向量。
