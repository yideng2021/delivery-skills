# 代码落锚法：从运行时证据精确定位到前后端工程代码

> record-only 管线的**精度引擎**（工序第 ③ 步）。用**真实接口(TXT) + 录制脚本(ts)**做种子，
> 配 grep/find + CodeGraph/GitNexus 落锚到代码。
> 输入：`*_api_requests.txt`/`*_api_details.txt` + `{name}_playwright_records.ts` + 前后端工程 + 各自索引。
> （CodeGraph / GitNexus 均为**代码知识图谱**工具，定位见 SKILL.md。）

## 0. 总览：种子发现 → 顺链扩展 → 业务域归属

```
种子发现 (grep/find + 非代码资产)        顺链扩展 (CodeGraph/GitNexus)            归属
──────────────────────────────         ────────────────────────────           ────
后端: /api/path ──►  handler          handler ──callees/impact──► service/repo   业务域
前端: locator/route/api path ──► 组件   (查漏间接触达: 网关重写/拦截器/AOP/动态分发)
非代码资产: 路由配置/api client/i18n
```

**策略不写死，先探查后自适应**（见 §1）：索引提供什么能力，就优先用什么；缺则降级 grep。

---

## 1. 落锚前：探查索引能力，自适应选策略（O1 核心）

不同工程的索引能力差异很大（如前端动态路由→无 route 节点，后端→route 节点齐全）。
**落锚开始时先各探一下，再决定优先路径**：

```
探查（每仓各做一次）              → 选策略
codegraph_search kind=route 有结果?  → 有: 接口 path 走 route 直查优先, grep 兜底
                                      → 空(动态路由): 走 grep(router/api/i18n) + kind=component 辅助
GitNexus route_map 可用?            → 可用: 纳入 path→handler 直查工具集
embeddings > 0?                     → >0: 可用语义检索; =0: 仅社区/路由/grep
```

> 经验（cnooc 实测）：后端 Java 仓 `route` 节点齐全 → route 直查；前端 Vue 仓 `route:0`（generator-routers 动态生成）
> 但 `component` 节点上千 → grep + component 辅助。**别假设两边对称。**

## 2. 多仓 targeting（O2，多索引必读）

多个仓同时被索引时，**每次查询必须指明目标仓**，否则查错索引：

| 工具 | 指定方式 |
|------|----------|
| CodeGraph（`codegraph_search`/`callers`/`callees`/`explore`/`impact`） | `projectPath=<前端或后端工程绝对路径>` |
| GitNexus（`route_map`/`query`/`impact`/`context`） | `repo=<仓名>`（如 `cnooc_hxcb_requirement-manage-service`） |

> 前端查询打**前端索引**、后端查询打**后端索引**。仓名/path 在前置闸门已记录（preflight §C）。

## 3. 按意图选工具表（O5）

落锚时"想知道什么 → 调哪个"，照表不犹豫：

| 我想知道… | 用哪个（带 projectPath/repo） |
|-----------|-------------------------------|
| `/api/x` 由哪个**后端 handler** 服务 | GitNexus `route_map(route="/api/x")` 或 CodeGraph `search kind=route` |
| 这个 handler 还**往下调**了哪些 service/repo | `codegraph_callees` |
| **谁调用**了这个方法 / 复用范围 | `codegraph_callers` |
| 改这个接口/符号会**波及谁** | `codegraph_impact` / GitNexus `api_impact` |
| 某**前端组件**在哪定义 | `codegraph_search kind=component` |
| 某段源码**长什么样**（verbatim） | `codegraph_explore` |
| 这条流程属于哪个**业务域** | GitNexus 社区(`query`/`context`) ∩ 包结构（或 §6 外部域图） |
| `path` grep 不到（网关重写/间接触达） | 从已知种子 `codegraph_callers/callees` 反向逼近真实 handler |

## 4. 接口 ↔ 界面归并（节点归因，无回放时怎么分桶）

节点单位是**业务闭环内的各界面/子过程**。把 TXT 时序的接口归并到界面节点，靠三证对齐（非时间戳硬猜）：

1. **HAR 页面边界**：脚本 `goto`/`waitForEvent('popup')`/路由跳转 = 界面切换点，按此切段。
2. **脚本动作顺序**：`_playwright_records.ts` 动作序列与 TXT 时序大体同序，按段对齐。
3. **代码语义**：定位 handler 后，其用途（list/save/detail/delete）反证它属哪个子过程 —— 比时间戳强。

> 归并不确定处标 `~inferred`（红线 R2），不假装逐击精度。

## 5. 后端 / 前端落锚要点

**后端**（route 节点齐全时）：
```
GitNexus route_map(route="/api/requirement/plan/save")  → handler
codegraph_callees(handler, projectPath=<后端>)          → service/repo（顺链）
# grep 兜底（网关裁前缀时）：grep -rn "requirement/plan" <后端>/src/
```

**前端**（动态路由、grep-led）：
```
grep -rn "req/plan" <前端>/src/router/          # 路由 → 组件（动态路由时靠约定/字面量）
grep -rn "/plan/save" <前端>/src/api/           # 接口集中模块 → api 函数
codegraph_callers(api函数, projectPath=<前端>)   # api 函数 → 调用它的组件
grep -rn "计划新增" <前端>/src/locales/          # i18n key → 反查使用组件
```

> 三信号交叉命中同一组件 = 高置信；只命中一条 → 标 `~inferred`（R2）。

## 6. 业务域归属（O4，完全解耦 + 可选外部输入）

- **默认自给自足**：GitNexus 社区 ∩ 包结构现推业务域（呼应 arch-baseline 方法论，但**不依赖其产物**）。
- **可选外部输入**：若用户在前置闸门**主动提供**了一份业务域划分（任意来源），则用之。
- **零跨 skill 依赖**：本 skill **不自动读取** 其他 skill 的 `.brownfield/` 等产物；只认"输入"，不认"某 skill 的输出"。

## 7. 落锚产物（双形态）

1. **inline 注解**：`{name}.flow` 每个 `[界面]` 补 `@route/@component`，每个接口补 `@backend`。
2. **流程↔代码映射表** `flow-code-map.md`：界面 / 接口 / 前端组件 / 后端 handler / 业务域 / 置信度。

> 关联**不固化进永久基线**（棕地"活查询、不冻结幻觉"哲学）：映射随源码即时重建，避免随重构腐烂。

## 8. 与静态认知的协同（为什么 record-only 反而更准）

纯静态重建须*猜*真入口；这里**真实打出的 API 是已确证入口种子**，CodeGraph/GitNexus 只沿**真正跑到的路径**扩展。
运行时证据**修剪**静态图，幻觉远低于纯静态重建。
