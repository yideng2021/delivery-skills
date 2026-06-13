# 工程检索最佳实践

基于 CodeGraph + GitNexus + IDE 内置搜索的协同检索策略，适用于本项目（Java 后端 + Vue 前端多仓单工作区）。

---

## 核心原则

1. **先定位，后深入** — 用轻量搜索确定目标，再用精准工具获取细节
2. **多工具互补** — 单一工具有盲区，组合使用覆盖全面
3. **从符号到流程** — 符号是锚点，流程是上下文
4. **Cypher 优于 query（中文场景）** — FTS 索引缺失或中文查询无结果时，直接用 Cypher 结构化查询
5. **多维度交叉验证** — context（引用关系）+ impact（影响面）组合使用

---

## 工具能力矩阵

| 场景 | 首选工具 | 备选 | 说明 |
|------|----------|------|------|
| 已知符号名定位 | `codegraph_search` | `symbol_search` | 模糊匹配、按 kind 过滤 |
| 获取符号源码+调用关系 | `codegraph_explore` | `codegraph_node` | 一次调用返回多文件源码 |
| 调用链上下游 | `codegraph_callers/callees` | `gitnexus context` | 单跳 vs 全景 |
| 执行流程/业务链路 | `gitnexus query` | `gitnexus process资源` | 端到端链路追踪 |
| 变更影响面 | `gitnexus impact` | `codegraph_impact` | 深度遍历+风险评级 |
| 精确文本/正则匹配 | `grep_search` | — | 编码问题时可能失效 |
| API 路由追踪 | `gitnexus route_map` | `grep_search` | 前后端接口映射 |
| 目录结构速览 | `codegraph_files` | `list_files` | 含语言和符号数统计 |
| 中文业务概念定位类 | `gitnexus cypher` | — | FTS 不支持中文时的首选 |
| 查找数据层 DAO/Entity | `gitnexus cypher` | `codegraph_search` | 精准匹配命名模式 |

---

## 推荐检索流程

### 场景一：从业务功能名定位代码

```
1. codegraph_search(query="功能关键词英文", kind="component|class")
   → 获取文件路径和符号名
2. codegraph_explore(query="符号名")
   → 获取完整源码和关联符号
3. list_files(path="定位到的目录")
   → 了解模块文件结构
```

**经验**：中文功能名需先转为英文/拼音关键词；Vue 组件用 `kind="component"`，Java 用 `kind="class"`。

### 场景二：追踪前后端接口调用链

```
1. 前端：grep_search 或 read_file 找到 API 调用函数
2. 读取 api/*.js 文件确认实际请求路径
3. 后端：codegraph_search(query="Controller名") 定位 Controller
4. read_file 读取 Controller 确认路由映射
5. codegraph_callers/callees 追踪 Service 层实现
```

**经验**：前端函数名与后端路由常不一致（如 `saveOrUpdateRequireSupplier` → `/addList`），必须读取 API 定义文件确认实际路径。

### 场景三：评估修改影响面

```
1. gitnexus impact(target="目标符号", direction="upstream")
   → 获取直接/间接依赖者和风险等级
2. gitnexus context(name="高风险符号")
   → 查看该符号的 360° 引用视图
3. gitnexus detect_changes()
   → 提交前检查受影响流程
```

### 场景四：中文业务概念检索（Cypher 流程）

当业务关键词为中文，`query` 工具匹配不到结果时，使用以下四步 Cypher 流程：

**Step 1：中文概念映射为英文命名**

中文业务概念需先映射为代码中的英文命名，例如：
- "需求计划填报" → `SchemeRequirement`
- "供应商管理" → `Supplier`、`SupplierManage`

**Step 2：定位核心类（Cypher）**

```cypher
MATCH (c:Class) WHERE c.name CONTAINS 'SchemeRequirement'
AND (c.name CONTAINS 'Service' OR c.name CONTAINS 'Controller')
RETURN c.name, c.filePath LIMIT 20
```

**Step 3：获取 360° 符号视图（context）**

```
context({ name: "SchemeRequirementServiceImpl", kind: "Class", repo: "..." })
```

获取：实现的接口（IMPLEMENTS）、注入的依赖（HAS_PROPERTY）、拥有的方法（HAS_METHOD）。

**Step 4：查找数据层完整链路（Cypher）**

```cypher
MATCH (n) WHERE n.name CONTAINS 'SchemeRequirement'
AND (n.name CONTAINS 'Dao' OR n.name CONTAINS 'Mapper')
RETURN n.name, n.filePath LIMIT 20
```

---

## 已知限制与规避

| 问题 | 现象 | 规避方案 |
|------|------|----------|
| GitNexus FTS 索引缺失 | query 返回空结果，提示 "FTS indexes missing" | 改用 `gitnexus cypher` 的 `CONTAINS` 查询替代 |
| 中文查询无结果 | query 分词支持有限，中文关键词匹配失败 | 将中文概念映射为英文命名后用 Cypher 查询 |
| grep 对部分文件无效 | Vue/Java 文件搜索返回空 | 可能是文件编码(BOM/GBK)问题，改用 `read_file` 直接读取 |
| GitNexus 索引滞后 | 仓库有未索引的新提交 | 关注 `list_repos` 返回的滞后提交数（超过 50 建议重建索引） |
| 符号重名 | 多个同名类/方法 | 用 `file_path` 或 `kind` 参数消歧 |
| impact 结果爆炸 | 大型服务类结果过多 | `maxDepth` 默认 3，先用 2 控制范围 |

---

## 工具选择速查

```
我想找一个符号在哪里定义        → codegraph_search
我想看这个符号的完整源码        → codegraph_explore / codegraph_node(includeCode=true)
我想知道谁调用了这个函数        → codegraph_callers / gitnexus context
我想知道改这个会影响什么        → gitnexus impact
我想找一段精确的代码文本        → grep_search
我想了解一个业务的端到端流程    → gitnexus query + process 资源
我想看 API 路由和消费者        → gitnexus route_map / api_impact
我想看模块有哪些文件            → codegraph_files / list_files
中文概念找不到结果              → 先映射英文名，再用 gitnexus cypher CONTAINS 查询
```

---

## CodeGraph 工具速记

| 工具 | 一句话 | 关键参数 |
|------|--------|----------|
| `codegraph_explore` | **首选**。传入符号名/文件名，一次返回多文件源码+关系 | `query`, `maxFiles`(默认12) |
| `codegraph_search` | 模糊定位符号位置（不含源码） | `query`, `kind`(function/class/component/route等) |
| `codegraph_node` | 获取单个符号的完整源码，支持重载消歧 | `symbol`, `includeCode=true`, `file`, `line` |
| `codegraph_callers` | 谁调用了这个符号 | `symbol`, `limit`(默认20) |
| `codegraph_callees` | 这个符号调用了谁 | `symbol`, `limit` |
| `codegraph_impact` | 轻量影响面分析（按深度分组） | `symbol`, `depth`(默认2) |
| `codegraph_files` | 索引文件树，含语言/符号数统计 | `path`, `pattern`, `format`(tree/flat/grouped) |

**使用顺序**：`search` 找名字 → `explore` 看实现 → `node` 补细节 → `callers/callees` 看关系

---

## GitNexus 工具速记

| 工具 | 一句话 | 关键参数 |
|------|--------|----------|
| `query` | 按概念搜索执行流程（BM25+语义混合排名） | `query`, `repo`(多仓必填), `limit`, `include_content` |
| `context` | 单符号 360° 视图（调用/被调/继承/实现/字段访问） | `name`, `repo`, `file_path`/`kind`(消歧) |
| `impact` | 深度影响面+风险评级（LOW~CRITICAL） | `target`, `direction`(upstream/downstream), `maxDepth`, `repo` |
| `detect_changes` | 未提交变更 → 映射到受影响流程 | `scope`(unstaged/staged/all/compare), `repo` |
| `rename` | 跨文件安全重命名，带 graph/text_search 置信度 | `symbol_name`, `new_name`, `dry_run`(默认true) |
| `cypher` | 原始 Cypher 图查询（中文场景首选） | `query`(Cypher语句), `repo` |
| `route_map` | API 路由→处理器→消费者映射 | `route`(可选过滤), `repo` |
| `api_impact` | 修改 API 前的全面报告（消费者+形状+中间件） | `route`或`file`, `repo` |
| `shape_check` | 检测 API 响应形状与前端期望不匹配 | `route`, `repo` |

**使用顺序**：`query` 找流程 → `context` 看符号细节 → `impact` 评估风险 → `detect_changes` 提交前检查

**资源访问**（通过 `mcp_access_resource`）：
- `gitnexus://repo/{name}/processes` — 所有执行流程列表
- `gitnexus://repo/{name}/clusters` — 所有功能模块（Leiden 社区）
- `gitnexus://repo/{name}/process/{processName}` — 单条流程逐步追踪
- `gitnexus://repo/{name}/schema` — 图 Schema（写 Cypher 前必读）

---

## 效率提示

- `codegraph_explore` 是最高效的单次调用工具，一次返回多文件源码+关系，优先使用
- `gitnexus context` 比逐个 `callers/callees` 更全面（含 imports/extends/implements）
- 多仓场景下 gitnexus 工具必须指定 `repo` 参数
- 读取大文件时用 `line_range` 精确定位，避免超限
- 搜索不到时切换工具而非反复调整同一工具的参数
- `codegraph_node` 遇到重载时自动返回所有匹配定义，用 `file`+`line` 精确指定
- `gitnexus impact` 的 `maxDepth` 默认 3，大型服务类建议先用 2 避免结果爆炸
- `gitnexus impact` 的 `relationTypes` 可自定义遍历边类型，类成员分析加上 `HAS_METHOD`/`HAS_PROPERTY`
- `gitnexus rename` 默认 `dry_run=true`，先预览再执行
- `gitnexus cypher` 使用前建议先访问 `gitnexus://repo/{name}/schema` 了解图结构