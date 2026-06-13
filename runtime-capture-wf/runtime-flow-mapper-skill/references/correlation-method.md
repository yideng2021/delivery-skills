# 三证对齐落锚法（核心能力）

> 本 skill 的立身之本：把真实运行时证据**精准锚定到前后端代码**。
> 检索口径严格遵循 [`01-设计过程/04-工程检索/01-search-best-practices.md`](../../../04-工程检索/01-search-best-practices.md)。

## 1. 三证对齐

每个节点的每个接口，对齐三类证据；**三证交叉命中 = 确证，单证命中 → 标 `~inferred`/`?`**：

```
界面证据                    接口证据                  代码证据
────────                    ────────                  ────────
session_log 导航 URL    +   api_requests.txt     +    前端: src/api/*.js 调用处 + 组件
records.ts 动作语义         的 METHOD /path           后端: Controller handler + Service
```

## 2. 接口 ↔ 节点归并（消费 runtime-capture 的红利）

- **节点边界** = `session_log` 的 `[NAV:*]` 导航事件（界面/路由切换点）。
- **接口归属** = `session_log` 每条 `[REQ]` 已带 **remapUrls 修正后的归属页面 URL** → 直接按归属 URL + 时序落到对应节点，**不靠时间戳硬猜**。
- `records.ts` 动作序列辅助确认节点内操作语义与命名。

## 3. 落锚（先探后选，前后端不对称）

**落锚前先探索引能力**：`codegraph_search kind=route` 有结果？`route_map` 可用？→ 据此选优先路径。

**后端**（route 节点通常齐全 → 图谱直查优先）：
```
接口 path → gitnexus route_map(route="/x") 或 codegraph_search kind=route   → handler
         → codegraph_callees(handler, projectPath=<后端>)                   → Service（顺链）
         → grep 兜底（网关裁前缀 / 路径重写时）
```

**前端**（路由多为动态 → grep-led + component 辅助）：
```
接口 path → grep src/api/*.js          → 前端 API 函数（注意函数名≠路由，须读 api 定义确认实际 path）
         → codegraph_callers(API函数)  → 调用它的组件
路由/文案 → grep src/router、i18n      → 页面组件
```

**多仓 targeting**：CodeGraph 带 `projectPath=<前端|后端绝对路径>`；GitNexus 带 `repo=<仓名>`。前端查前端索引、后端查后端索引。

> 工具按意图选型详见 04-工程检索的能力矩阵；中文业务概念用 `gitnexus cypher`。

## 4. 外部系统识别

接口 path 前缀非本服务（如 `/supprisk/`、`/infrastructure/`、`/classifymanage/`、`/zuul/…`）→ 不落本仓代码，
单列"**外部系统调用**"，标注用途，`~inferred` 处不强行落锚。

## 5. 状态流转提取

从接口语义 + `api_details.txt` 的 resp 状态字段（如 `flowStatus` / `handlerStatus`）归纳状态机。
**单样本只见到部分状态 → 整段标 `~inferred`**，不假装完整。

## 6. 置信度标注规约

| 命中情况 | 标注 |
|----------|------|
| 界面 + 接口 + 代码三证交叉 | 确证（不标） |
| 仅单/双证（如只有接口、代码没找到 handler） | `~inferred` 或 `?` |
| 推断的状态机 / 单样本契约 / 间接触达 | `~inferred: <说明>` |

> 呼应不变量 2/3：**混淆推断与事实 = 制造可信幻觉**，是棕地认知最危险的污染。
