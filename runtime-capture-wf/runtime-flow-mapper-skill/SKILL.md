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

主产物 **`{工作目录}/{name}/{name}_flow-map.md`**（与上游产物同目录）。
结构与校验见 [`references/flow-map-spec.md`](references/flow-map-spec.md)，套用 [`templates/flow-map.md`](templates/flow-map.md)。

## 工序（强制顺序，每阶段一个 Checkpoint）

```
⓪ 前置闸门  →  ① 业务节点识别  →  ② 接口归并  →  ③ 代码落锚  →  ④ 精准地图产出
```

### ⓪ 前置闸门（Preflight）
按 [`references/preflight-check.md`](references/preflight-check.md)：查工作目录上游 4 文件齐否 + 工程/索引就位。
- **Checkpoint**：齐全 → 进入 ①；缺上游产物 → 中断提示，不继续。

### ① 业务节点识别（Nodes）
读 `{name}_session_log.txt` 的导航序列 + `{name}_playwright_records.ts` 动作语义，**按时序切出流程节点**（界面/子过程）。
节点切分信号有两类，**任一触发即切**：`[NAV:*]` 导航事件；或 `[REQ]` 归属 URL 的**域名变化**（跨系统跳转，常无 NAV 事件）。详见 correlation §2。
- **Checkpoint**：节点清单按时序排好，节点名用业务语义；跨域名跳转已单独成节点（未漏跨系统子流程）。

### ② 接口归并（Bucketing）
`session_log` 每条 `[REQ]` 已带 **remapUrls 修正后的归属页面 URL**——直接按归属 URL + 时序把接口落到节点，
**不靠时间戳硬猜**（这是消费 runtime-capture 的最大红利）。
- **Checkpoint**：每条接口归属到某节点；无悬空接口。

### ③ 代码落锚（Correlate）
按 [`references/correlation-method.md`](references/correlation-method.md) 做**三证对齐**：接口 path → 后端 handler/Service、
前端 API 函数/组件；识别外部系统；提取状态流转。前后端自适应、多仓 targeting、遵 04-工程检索规范。
- **Checkpoint**：三证交叉的标确证、单证的标 `~inferred`；外部系统单列。

### ④ 精准地图产出（Map）
套用模板产出 `{name}_flow-map.md`，按 [`references/flow-map-spec.md`](references/flow-map-spec.md) 自校验。
- **Checkpoint**：每条 API 可追溯到 `api_requests.txt`、每个代码锚有检索依据；图文一致。

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
