# 三证对齐落锚法（核心能力）

> 本 skill 的立身之本：把真实运行时证据**精准锚定到前后端代码**。
> 检索口径严格遵循 [`search-guide.md`](search-guide.md)。

## 1. 三证对齐

每个节点的每个接口，对齐三类证据；**三证交叉命中 = 确证，单证命中 → 标 `~inferred`/`?`**：

```
界面证据                    接口证据                  代码证据
────────                    ────────                  ────────
session_log 导航 URL    +   api_requests.txt     +    前端: src/api/*.js 调用处 + 组件
records.ts 动作语义         的 METHOD /path           后端: Controller handler + Service
```

## 2. 接口 ↔ 节点归并（消费 runtime-capture 的红利）

- **节点边界** = 两类信号，**任一触发即切节点**：
  1. `session_log` 的 `[NAV:*]` 导航事件（同系统内界面/路由切换）。
  2. `[REQ]` 归属 URL 的**域名变化**（如 `req.t-bid…` → `slp-m.t-bid…`）= 跨系统跳转，常无 `[NAV:full]` 事件却是真实子流程入口 → 单独成节点，标注「跨系统跳转」。
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

## 4. 外部系统识别（先验证前端调用链，再归外部）

接口 path 前缀非本服务（如 `/supprisk/`、`/infrastructure/`、`/classifymanage/`、`/zuul/…`）→ **不直接归外部**，
仍须做一次**前端落锚尝试**，确认调用代码是否在本工程：

1. grep 前端工程中该接口 path / 关键函数名。
2. **0 匹配** → 标注「前端调用代码不在本工程，疑为共享组件 / 微前端子模块 / npm 包发起」，归外部。
3. **有匹配** → 正常落锚前端调用链（前端仍是入口，后端中转才走外部）。

> 后端经 Feign/RestTemplate 中转时，本仓有调用入口 → 落锚该入口，再标注「经 X 中转至外部 Y」。

**节点清单内引用外部接口时**（非仅汇总表）必须标 `[外部:<系统名>]`，并写明源码缺失结论，
例如 `[外部:classifymanage] 本地前后端工程均无源码，调用来源：共享组件/微前端`，
**不得**把外部接口塞进节点却无任何来源标注（= 悬空接口）。

## 5. 状态流转提取

从接口语义 + `api_details.txt` 的 resp 状态字段（如 `flowStatus` / `handlerStatus`）归纳状态机。
**单样本只见到部分状态 → 整段标 `~inferred`**，不假装完整。

## 6. 置信度标注规约

| 命中情况 | 标注 |
|----------|------|
| 界面 + 接口 + 代码三证交叉 | 确证（不标） |
| 仅单/双证（如只有接口、代码没找到 handler） | `~inferred` 或 `?` |
| 推断的状态机 / 单样本契约 / 间接触达 | `~inferred: <说明>` |
| 接口运行时存在，但前后端工程**均无源码** | `~external:unreachable: <缺失原因>` |

**前端组件路径必须经检索工具确认存在**（`grep` 文件名 / `codegraph_search` / `list_files` 至少一种）；
仅凭目录命名惯例推测、未验证的路径一律标 `~inferred`，不得直接当确证写出。

> `~external:unreachable` 区分两种情况：「确认外部系统且已落锚」 vs 「运行时存在但本地工程完全无法追踪」。
> 呼应不变量 2/3：**混淆推断与事实 = 制造可信幻觉**，是棕地认知最危险的污染。

## 7. 接口时序模式识别

落锚不止平铺接口，还要还原**因果调用链**。当同一节点内接口反复出现 `A→B→C` 循环模式时
（如 `insertList → addOrUpdate+detail/add → checkHighSupplier → getCheckResult → (再次)insertList …`），
在节点描述中说明**触发条件 + 循环逻辑**，而非孤立罗列，例如：
「每次添加供应商触发：保存 → 高风险校验 → 风控检测 → 刷新列表」。
