# Runtime Flow Mapper Skill — 运行时业务流程精准地图

> 消费 `runtime-capture-skill` 的运行时捕获产物 + 前后端工程，**把界面↔接口↔代码三证对齐**，
> 产出一条业务闭环的**运行时业务流程精准地图**。只落锚出图，不采集、不生成测试。

## 在认知管线中的位置

```
runtime-capture-skill          本 skill（落锚层）            后续独立 skill
（采集 + 输出治理）   ──产物──▶  三证对齐 → 精准地图  ──地图──▶  回归测试 / 用例测试
```

## 输入 / 输出

| | 内容 |
|---|---|
| 输入 | `{工作目录}/{name}/` 下 4 件 runtime-capture 产物 + 前后端工程目录 + CodeGraph/GitNexus 索引 |
| 输出 | `docs/runtime-flow/{name}/{name}_flow-map.md`（精准地图，当前根目录下、工作区内） |

## 核心能力：三证对齐落锚

```
界面证据(session_log 导航/records.ts 动作)
  +  接口证据(api_requests 的 METHOD /path)
  +  代码证据(CodeGraph/GitNexus + grep 定位前后端)
  = 三证交叉→确证；单证→标 ~inferred
```
归并红利：直接用 session_log 里 **remapUrls 修正后的归属 URL** 把接口落到节点，不靠时间戳硬猜。
检索口径遵循 `01-设计过程/04-工程检索/01-search-best-practices.md`。

## 产物结构（{name}_flow-map.md）

1. 业务流程简介　2. 流程节点清单(按时序)　3. 界面-API-Handler 三证对齐表
4. 外部系统调用　5. 状态流转　6. mermaid 流程图

范本：`03-testing/playwright录制/runtime-flows/flow-code-map.md`。

## 红线

- 派生真实、禁杜撰（只记真实跑到的接口）
- 三证交叉定置信，推断必标 `~inferred`
- 不越界：不采集（上游）、不生成测试（下游）
- 上游产物缺 → 中断 + 提示去跑 runtime-capture，不自行采集

## 触发

「生成运行时业务流程地图」「把录制产物落锚到代码」「界面-接口-代码三证对齐」。

## 目录

```
runtime-flow-mapper-skill/
├── SKILL.md / README.md
├── references/  preflight-check / correlation-method / flow-map-spec
└── templates/   flow-map.md
```
