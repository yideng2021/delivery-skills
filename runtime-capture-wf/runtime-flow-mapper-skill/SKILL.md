---
name: runtime-flow-mapper
description: >
  运行时业务流程「精准地图」生成 skill（落锚层）。消费 runtime-capture-skill 写入工作目录的运行时捕获
  产物（session_log / records.ts / api_requests / api_details），结合前后端工程与 CodeGraph/GitNexus
  代码图谱，把"界面↔接口↔代码"三证对齐，产出一条业务闭环的运行时业务流程精准地图（节点清单 + 三证对齐表
  + 外部系统 + 状态流转 + 流程图）。只做落锚出图，不采集、不生成测试。当用户要求「生成运行时业务流程地图」
  「把录制产物落锚到代码」「界面-接口-代码对齐」时触发。
---

# Runtime Flow Mapper — 运行时业务流程精准地图

> **定位**：认知管线的**落锚层**。上游 `runtime-capture-skill`（采集+治理）→ **本 skill（落锚→精准地图）**
> → 下游回归测试 / 用例测试（后续独立 skill，本 skill 只留衔接契约）。
> 单一职责：**只把真实运行时证据精准锚定到前后端代码并出图**，不碰采集与测试生成。

## 术语表（先对齐黑话）

| 术语 | 含义 |
|------|------|
| **落锚 (Correlate)** | 把一条真实跑到的接口，锚定到它对应的前后端**具体代码**（handler/Service、API 函数/组件）。本 skill 的核心动作。 |
| **三证 / 三证对齐** | 一个接口的三类证据交叉验证：**界面**（session_log 导航 URL + records.ts 动作）+ **接口**（api_requests 的 METHOD/path）+ **代码**（落锚到的前后端代码）。三证齐 = 确证。 |
| **精准地图 (flow-map)** | 本 skill 的主产物：节点清单 + 三证对齐表 + 外部系统 + 状态流转 + 流程图，把一条业务闭环讲清楚。 |
| **节点 (Node)** | 流程图里的一个**业务语义单元**（一个界面或子步骤），不是技术事件的平铺。接口、代码都挂在节点下。 |
| **归并 / 归属 (Bucketing)** | 把每条接口归到它所属的节点。靠 `[REQ]` 自带的**归属 URL** 直接落，不靠时间戳猜。 |
| **归属 URL (remapUrls)** | 上游 runtime-capture 已把每条请求**修正**到它真正发起的页面 URL，本 skill 直接消费——这是归并的最大红利。 |
| **本服务 / 外部系统** | 接口前缀 = 用户指定后端工程的 gateway 前缀（如 `/requirement/api/`）→ 本服务，落本仓代码；其余前缀 → 外部系统，单列不落本仓。 |
| **标注两轴** | ①**置信轴**（互斥）：确证（不标）/ `~inferred`（推断）/ `~unresolved`（本服务前缀但代码没找到）；②**来源轴**（正交）：`[外部:xxx]`、「继承自 Base…」。详见 correlation §6。 |
| **不变量** | 不可违背的核心纪律（见下节），如"禁杜撰""推断必标注"。 |
| **前置闸门 (Preflight)** | 落锚前的强制首步：查上游 4 件产物 + 工程/索引是否齐备，缺则中断。 |
| **4 件上游产物** | `session_log`（导航+请求时序）、`records.ts`（Playwright 动作）、`api_requests`（接口摘要）、`api_details`（req/resp 明细）。 |
| **CodeGraph / GitNexus** | 两套代码图谱索引（前后端各一仓），落锚时用来查路由、调用链、符号关系。 |

## 触发

「生成运行时业务流程地图」「把录制产物落锚到代码」「界面-接口-代码三证对齐」「运行时流程精准地图」。

## 前置依赖

- 上游 `runtime-capture-skill` 已采集并治理 `{name}`，4 件产物在 `{工作目录}/{name}/`
- 前端工程 + 后端工程目录；CodeGraph + GitNexus 代码图谱索引（前后端两仓）

> 依赖**不假设成立**，由不变量 0 的[前置闸门](references/preflight-check.md)实测；缺上游产物则**中断 + 提示去跑 runtime-capture**。

## 不变量（核心纪律）

0. **前置闸门（强制·首步）**：检查 `{工作目录}/{name}/` 的 4 件上游产物是否齐全；缺则**中断 + 提示用户先用
   `runtime-capture-skill` 采集**，**绝不自行录制/臆造数据**。协议见 [`references/preflight-check.md`](references/preflight-check.md)。
1. **派生真实，禁杜撰**：地图里每条 API 都能在 `{name}_api_requests.txt` 找到；只记真实跑到的接口。
2. **三证交叉定置信**：界面 + 接口 + 代码三证命中 = 确证；单证命中 → 标 `~inferred`/`?`。
3. **推断必标注**：状态机、单样本契约、间接触达等推断一律标 `~inferred`，不与事实混淆。
4. **不越界**：不采集（上游的事）、不生成测试（下游的事），只落锚出图。
5. **检索遵规范**：落锚口径严格按 [`references/search-guide.md`](references/search-guide.md)。

## 输入

- **工作目录** + **业务流程名** `{name}`（定位 `{工作目录}/{name}/` 的上游产物）
- 前端工程目录、后端工程目录
- CodeGraph + GitNexus 索引（前后端两仓）

## 输出

主产物 **`docs/runtime-flow/{name}/{name}_flow-map.md`**（当前根目录下、工作区内）。
上游 4 件捕获产物仍在 `{工作目录}/{name}/`（只读输入，不动）。
结构与校验见 [`references/flow-map-spec.md`](references/flow-map-spec.md)，套用 [`templates/flow-map.md`](templates/flow-map.md)。

## 工序（强制顺序，每阶段一个 Checkpoint）

```
⓪ 前置闸门  →  ① 业务节点识别  →  ② 接口归并  →  ③ 代码落锚  →  ④ 精准地图产出
```

### ⓪ 前置闸门（Preflight）
按 [`references/preflight-check.md`](references/preflight-check.md)：查工作目录上游 4 文件齐否 + 工程/索引就位。
- **Checkpoint**：齐全 → 进入 ①；缺上游产物 → 中断提示，不继续。

### ① 业务节点识别（Nodes）
读 `{name}_session_log.txt` 导航序列 + `{name}_playwright_records.ts` 动作语义，**切出业务语义节点**（非技术事件平铺）。
切分候选信号：`[NAV:*]`、归属 URL 域名变化（跨系统跳转）、单界面内 step 语义；再**按业务价值收敛**——连续纯外部节点合并为「系统准入」，单界面多步骤按语义拆，**不设接口数阈值**。详见 correlation §2。
- **Checkpoint**：节点为业务语义单元；纯外部段已合并、多步骤界面已拆；跨系统子流程未漏。

### ② 接口归并（Bucketing）
`session_log` 每条 `[REQ]` 已带 **remapUrls 修正后的归属页面 URL**——直接按归属 URL + 时序把接口落到节点，
**不靠时间戳硬猜**（这是消费 runtime-capture 的最大红利）。
- **Checkpoint**：每条接口归属到某节点；无悬空接口。

### ③ 代码落锚（Correlate）
**分组优先**（默认策略，非优化项）：按接口前缀分组 → 每组对应一个 Controller，一次 `codegraph_explore` 拿全方法+路由；前端定位到 `src/api/xx.js` 后一次读全文件建「函数名→path」映射；只对落空接口再单独精检。详见 [`search-guide.md`](references/search-guide.md) 批量落锚策略。
在此之上做**三证对齐**：path → 后端 handler/Service、前端 API 函数/组件；识别外部系统（先验证前端调用链）；继承路由按 search-guide 继承链分支追踪；提取状态流转。多仓 targeting、遵检索规范。
- **Checkpoint**：三证交叉标确证、本服务未落标 `~unresolved`、推断标 `~inferred`；外部系统单列；标注按 correlation §6 两轴，未堆叠。

### ④ 精准地图产出（Map）
套用模板产出至 `docs/runtime-flow/{name}/{name}_flow-map.md`，按 [`references/flow-map-spec.md`](references/flow-map-spec.md) 自校验。
**覆盖率差集自检**：列出 `api_requests` 去重接口集合，与（三证表 ∪ 外部表）求差集；差集须为空，或每条残留都带裁决标注（`~unresolved`/`[外部:xxx]`），不得静默遗漏。
**写入**：落到当前根目录 `docs/runtime-flow/{name}/`（在工作区内，目录不存在则建），用 `write_file` 直接写即可——无需 terminal 绕行。
- **Checkpoint**：每条 API 可追溯到 `api_requests.txt` 且在三证/外部表二者之一；每个代码锚有检索依据；图文一致。

## 与下游衔接（产物级、零耦合）

只产出精准地图，不感知下游。后续独立 skill 按契约消费：
- **回归测试生成**：`records.ts` + 地图节点（节点↔动作可对应）。
- **用例/契约测试生成**：`api_details.txt` + 地图节点（节点接口↔req/resp，后端 handler 已落锚）。

## 文件导航

```
runtime-flow-mapper-skill/
├── SKILL.md / README.md
├── references/
│   ├── preflight-check.md      ← 前置闸门（查工作目录上游文件）
│   ├── correlation-method.md   ← 三证对齐落锚法（核心能力）
│   ├── flow-map-spec.md        ← 精准地图产物规格 + 校验
│   └── search-guide.md         ← 工程检索指南（落锚专用）
└── templates/
    └── flow-map.md             ← {name}_flow-map.md 骨架
```
