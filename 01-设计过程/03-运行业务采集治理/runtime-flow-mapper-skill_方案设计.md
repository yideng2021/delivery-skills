# 方案设计：运行时业务流程精准地图 Skill

> 暂名 **`runtime-flow-mapper-skill`**（运行时业务流程精准地图 / 落锚层）
> 状态：**方案待对齐**——本文只做设计对齐，暂不生成 skill 实现。
> 取代：废弃中的 `runtime-flow-extractor-skill`（清白重构，不沿用其文件/内部设计）。

---

## 1. 定位与背景

### 1.1 在认知管线中的位置

```
runtime-capture-skill              本 skill（落锚层）                  后续独立 skill（不在本设计内）
─────────────────────              ──────────────────                 ────────────────────────────
采集 + 输出治理        ──产物──▶   消费产物 + 落锚代码     ──地图──▶   ├─ 回归测试生成
（5 件治理产物）                    → 运行时业务流程精准地图              └─ 用例/契约测试生成
```

- **上游** = `runtime-capture-skill`：把一条业务闭环的真实操作与流量，治理成 5 件产物，写入**工作目录**。
- **本 skill** = 落锚层：消费这些产物 + 前后端工程，用 `04-工程检索` 的检索法把"界面↔接口↔代码"三证对齐，产出**精准地图**。
- **下游** = 回归测试、用例/契约测试——**后续独立 skill**，本设计只定义**衔接契约**，不实现。

### 1.2 为什么重构（与废弃 skill 的差异，要点）

| | 废弃的 runtime-flow-extractor | 本 skill |
|---|---|---|
| 采集方式 | 自带 codegen/录制逻辑（与采集层耦合、几经反复） | **不管采集**，纯消费 runtime-capture 产物 |
| 职责 | 采集+解析+落锚+画图，一揽子 | **只做落锚 → 精准地图**，单一职责 |
| 产物 | `.flow` DSL + `.mmd` + map（偏多） | **精准地图为主**（节点清单 + 三证对齐 + mermaid），精简 |
| 上游边界 | 模糊 | 清晰：工作目录里有产物就干，没有就**中断+提示** |

---

## 2. 输入契约（消费 runtime-capture 的产物）

### 2.1 上游产物（来自工作目录，命名见 runtime-capture 的 `output-governance.md`）

工作目录布局 `{工作目录}/{name}/`：

| 文件 | 本 skill 用途 |
|------|--------------|
| `{name}_session_log.txt` | **节点识别主依据**：导航序列（界面切换点）+ API 时序（归属页面 URL 已修正） |
| `{name}_playwright_records.ts` | 操作步骤语义（按钮/表单/路由），辅助节点命名与界面定位 |
| `{name}_api_requests.txt` | 接口清单（种子 + 时序），后端落锚的种子 |
| `{name}_api_details.txt` | 接口 req/resp 结构，地图里的契约明细（按需） |

> `{name}_runtimeflow_api_requests.har` 不消费（原始流量，治理时已不入库）。

### 2.2 工程与索引

- 前端工程 + 后端工程目录（落锚目标）
- CodeGraph + GitNexus 代码图谱索引（前后端两仓），检索法见 `01-设计过程/04-工程检索/01-search-best-practices.md`

### 2.3 前置闸门（强制·首步，简洁）

**只检查工作目录里上游文件是否齐全**：

- 4 件上游产物在 `{工作目录}/{name}/` 都存在 → 通过。
- 缺任一 → **中断 + 提示**：「请先用 `runtime-capture-skill` 采集并治理 `{name}`，确认产物写入 `{工作目录}/{name}/` 后再运行本 skill」。**不自行录制、不臆造数据。**
- 工程目录 / 索引就位检查（缺则提示用户准备，参照检索法所需）。

---

## 3. 核心能力（本 skill 的专注点）

> 这是本 skill 的立身之本：**把真实运行时证据，精准锚定到前后端代码**。

### 3.1 三证对齐落锚法（界面 ↔ API ↔ 代码）

对每个流程节点的每个接口，对齐三类证据，三者交叉命中 = 高置信，单证命中 = 标 `~inferred`：

```
界面证据        接口证据             代码证据
────────        ────────             ────────
session_log     api_requests.txt     前端: src/api/*.js 调用处 + 组件
导航 URL    +   的 METHOD /path  +   后端: Controller handler + Service
records.ts 动作                      (CodeGraph/GitNexus 顺链)
```

### 3.2 落锚方法（基于 04-工程检索 best-practices）

- **后端**：接口 path → `gitnexus route_map` / `codegraph_search kind=route` 定 handler → `codegraph_callees` 顺链到 Service；grep 兜底网关重写。
- **前端**：接口 path → grep `src/api/*.js` 定 API 函数 → `codegraph_callers` 反查组件；路由/文案 → grep `src/router`、i18n。
- **自适应**：先探索引能力（route 节点？route_map？）再选优先路径（前后端不对称：后端 route 直查、前端 grep-led）。
- **多仓 targeting**：CodeGraph 带 `projectPath`、GitNexus 带 `repo`。
- 检索口径严格遵循 `01-search-best-practices.md`（中文用 Cypher、先定位后深入、多工具交叉）。

### 3.3 接口 ↔ 节点归并（无回放，怎么分桶）

- **节点边界** = `session_log` 的 `[NAV:*]` 导航事件（界面切换点）。
- **接口归属** = `session_log` 里每条 `[REQ]` 已带**修正后的归属页面 URL**（remapUrls 的成果）——直接按归属 URL + 时序落到对应节点，**无需时间戳硬猜**。这是消费 runtime-capture 的最大红利。
- `records.ts` 动作序列辅助确认节点内的操作语义。

### 3.4 外部系统识别 + 状态流转提取

- **外部系统**：path 前缀非本服务（如 `/supprisk/`、`/infrastructure/`、`/classifymanage/`）→ 单列"外部系统调用"。
- **状态流转**：从接口语义 + 详情 resp 的状态字段（如 flowStatus / handlerStatus）归纳状态机（标 `~inferred`，因单样本）。

---

## 4. 产物：运行时业务流程精准地图

主产物 **`{name}_flow-map.md`**，结构（融合任务 Part 1 的节点格式 + 已验证的三证对齐范本）：

1. **业务流程简介**（2-3 句场景与价值）
2. **流程节点清单（按时序）**——每节点：
   - 节点描述（1 句业务含义）
   - 关联 API（`METHOD /path` + 用途）
   - 前端关联代码（文件路径 + 1-2 句调用逻辑，结合本节点上下文）
   - 后端关联代码（Controller/Service + 1-2 句处理逻辑）
   - 上下文关联（与上/下节点的数据流转、状态依赖）
3. **界面-API-Handler 三证对齐表**（速查总表，范本见现存 `flow-code-map.md`）
4. **外部系统调用**（清单）
5. **状态流转**（状态机，标推断）
6. **mermaid 流程图**（视觉，节点=界面/子过程，边=接口）

> 范本：`01-设计过程/03-testing/playwright录制/runtime-flows/flow-code-map.md`（已验证形态，可借鉴结构，不依赖其 skill）。

---

## 5. 工序（阶段，强制顺序）

```
⓪ 前置闸门（查工作目录上游文件齐否）
① 业务节点识别（session_log 导航序列 + records.ts 动作 → 按时序切节点）
② 接口归并（session_log [REQ] 归属 URL + 时序 → 接口落到节点）
③ 代码落锚（三证对齐：CodeGraph/GitNexus + grep，前后端自适应）
④ 精准地图产出 + 校验（三证交叉、推断标注、外部系统/状态流转）
```

每阶段一个 Checkpoint；④ 校验"每条 API 都能在 `api_requests.txt` 找到、每个代码锚有检索依据"。

---

## 6. 红线 / 不变量（核心纪律）

1. **派生真实，禁杜撰**：地图里每条 API 都能在 `{name}_api_requests.txt` 找到；只记真实跑到的。
2. **三证交叉定置信**：界面+接口+代码三证命中才算确证；单证 → 标 `~inferred`/`?`。
3. **推断必标注**：状态机、单样本契约、间接触达等推断一律标 `~inferred`。
4. **不越界**：本 skill 不采集（上游的事）、不生成测试（下游的事），只落锚出地图。
5. **检索遵循规范**：落锚口径严格按 `01-search-best-practices.md`，不自创检索路径。

---

## 7. 下游衔接契约（只定义，不实现）

精准地图 + 上游产物构成下游 skill 的输入契约，**产物级解耦**：

| 后续独立 skill | 消费什么 | 本 skill 须保证的衔接点 |
|----------------|----------|------------------------|
| 回归测试生成 | `records.ts` + 地图节点 | 节点与 records.ts 动作可对应；节点标注触发的关键接口 |
| 用例/契约测试生成 | `api_details.txt` + 地图节点 | 每节点接口关联到 details 的 req/resp 结构；后端 handler 已落锚 |

> 本 skill 不依赖、不感知下游；只保证地图含"节点↔接口↔代码↔契约"的可追溯锚点，供下游各取所需。

---

## 8. 命名与落点（待定）

- skill 名：`runtime-flow-mapper-skill`（备选：`flow-code-map-skill` / 中文名）
- 落点：`01-设计过程/03-testing/runtime-flow-mapper-skill/`（与 `runtime-capture-skill` 并列）
- 主产物名：`{name}_flow-map.md`

---

## 9. 待你确认项（对齐后再生成 skill）

1. **职责边界**：本 skill 只做"落锚→精准地图"，不碰采集与测试生成——认可？
2. **前置闸门**：只检查工作目录上游文件齐否、缺则中断提示——符合预期？
3. **产物结构**：§4 的"节点清单 + 三证对齐表 + 外部系统 + 状态流转 + mermaid"——要增删哪块？
4. **是否保留 mermaid**（视觉图）作为地图的一部分，还是只要文字地图？
5. **skill 命名与落点**：`runtime-flow-mapper-skill` @ `03-testing/` 可接受？
6. 废弃的 `runtime-flow-extractor-skill` 处置：本设计落地后，由你删除/归档（本 skill 不动它）。
