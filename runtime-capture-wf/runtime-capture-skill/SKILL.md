---
name: runtime-capture
description: >
  运行时业务流「采集 + 输出治理」skill。用增强录制器 custom-recorder.js（多标签页/SPA路由/API时序/
  URL归属竞态修正）录制一条完整业务闭环的真实操作与流量，再经 parse_har.py 治理为规范、脱敏、两段式
  可加载的产物（HAR/会话日志/接口摘要/接口明细/操作脚本）。只做采集与治理，不做代码落锚/流程图反推
  （那是下游 skill 的职责，产物级解耦）。当用户要求「录制运行时业务流」「采集真实接口流量」「把操作流量
  整理成规范产物」「运行时采集」时触发。
---

# Runtime Capture — 运行时业务流采集与输出治理

> **定位**：认知管线的**上游采集层**。只负责"把真实操作与流量，采集成规范、脱敏、可消费的产物"。
> 下游的代码落锚 / 流程图反推（如 `01-运行时业务操作流程还原skill.md`、
> `delivery-skills/e2e-test-wf/runtime-flow-extractor-skill`）按**产物契约**消费，与本 skill 解耦。

## 触发

「录制运行时业务流」「采集真实接口流量」「把一条业务操作整理成规范产物」「运行时采集 / 输出治理」。

## 前置依赖

- **Node ≥ 18、Python 3、chromium 内核**：只检查，缺则告知用户安装命令、**skill 不代装**（人工装更合适）
- **runtime_environment 的 npm 依赖（@playwright/test）**：由工序 ① `setup.mjs` 在工作目录内**自动 `npm install`**（幂等，先检查再执行）
- **被测 Web 服务已启动**、可访问 URL、可用测试账号

> 自动化**只限**"建 runtime_environment + 复制脚本 + npm install"（基于工作目录、不重复）；
> 浏览器内核等较重安装一律**只检查 + 告知命令**，简化复杂度。详见 [`references/preflight-check.md`](references/preflight-check.md)。

## 不变量（核心纪律）

0. **输入前置人工确认（强制·首步）**：收集 3 项输入（**工作目录**、业务流程名 `{name}`、录制起始 URL），
   **回显解析后的实际路径请用户确认**后才继续；缺失则列全清单转人工，不擅自臆断。协议见 [`references/preflight-check.md`](references/preflight-check.md)。
   Node/Python/chromium 只检查（缺则告知安装命令，不代装）；仅 `runtime_environment` 的 npm 依赖由 ① 自动 `npm install`。
1. **业务闭环为单位**：一次录制 = 一条**完整业务闭环**（如"需求计划填报"含 列表/新增/详情/删除），录制前与用户定边界，不录碎片。
2. **真实驱动**：产物全部来自真实录制流量与操作；不杜撰、不补全未真实发生的接口。
3. **保真采集**：完整走完闭环，含登录、跨标签页(popup)、SPA 路由切换；中途不抄近路。
4. **脱敏先于落盘**：接口 TXT 经 `parse_har.py` 脱敏；**原始 HAR 不入库**。见 [`references/output-governance.md`](references/output-governance.md)。
5. **治理一致**：命名 / 目录 / 两段式加载 / 入库规则统一；产物清单齐全可校验。
6. **只采集治理，不反推**：本 skill **不做**代码落锚、流程图、业务语义推断 —— 留给下游，保持解耦。

## 输入

- **工作目录**（一次确定，后续所有产物都在其下）、业务流程名 `{name}`（kebab-case）、录制起始 URL
- 与用户共同确定的**一条完整业务闭环**及其边界

## 工作目录布局（自包含、可移植）

```
{工作目录}/
├── runtime_environment/                 ← 固定名：执行脚本 + 依赖（装一次，多流程复用）
│   ├── custom-recorder.js / package.json / parse_har.py / node_modules
└── {name}/                              ← 每条业务流一个子文件夹
    ├── {name}_playwright_records.ts        Inspector 录制（手动存）✅入库
    ├── {name}_runtimeflow_api_requests.har custom-recorder 自动 · ❌原始流量不入库
    ├── {name}_session_log.txt              导航序列 + API 时序（URL 归属已修正）✅
    ├── {name}_api_requests.txt             接口摘要（默认加载）✅
    └── {name}_api_details.txt              接口明细（按需加载）✅
```

## 工序（强制顺序，每阶段一个 Checkpoint）

```
⓪ 输入人工确认  →  ① 环境准备(自动)  →  ② 采集录制  →  ③ 输出治理
```

### ⓪ 输入人工确认（Confirm）
按 [`references/preflight-check.md`](references/preflight-check.md)：收集工作目录 / `{name}` / 起始 URL，
**回显将创建的实际路径**（`{工作目录}/runtime_environment/`、`{工作目录}/{name}/`）并请用户确认；
检查 Node/Python 在位（缺则 BLOCK 提示用户）；与用户确认业务闭环边界。
- **Checkpoint**：用户确认输入与路径无误，Node/Python 在位 → 进入 ①。

### ① 环境准备（Setup，幂等·先检查再执行）
```
node scripts/setup.mjs {工作目录}
```
**自动**（仅基于工作目录）：无 `runtime_environment/` 则建 → 复制三脚本 → 无 `node_modules` 则 `npm install` 初始化。
**只检查·不代装**：chromium 内核——缺则打印安装命令（`npx playwright install chromium`）告知用户、退出码 2，由用户手动装一次。
重复运行幂等（已就绪则秒过）。
- **Checkpoint**：`runtime_environment/` 就绪（脚本 + node_modules）；chromium 已装（否则按提示手动装后再来）。

### ② 采集录制（Capture）
机制见 [`references/recorder-design.md`](references/recorder-design.md)，逐步见 [`references/recording-procedure.md`](references/recording-procedure.md)：
```
cd {工作目录}/runtime_environment
node custom-recorder.js ../{name}/{name}
# Inspector 面板 Record → 操作完整业务闭环 → 复制 TS 存为 ../{name}/{name}_playwright_records.ts → Resume
```
录制结束自动 `remapUrls()` 修正 URL 归属，写出 HAR + session_log 到 `{工作目录}/{name}/`。
- **Checkpoint**：三件产物齐全（records.ts / HAR / session_log）；session_log 的 NAV/REQ 覆盖闭环各子过程。

### ③ 输出治理（Govern）
```
cd {工作目录}/runtime_environment
python parse_har.py ../{name}/{name}_runtimeflow_api_requests.har
```
产出两段式 `*_api_requests.txt`（摘要）+ `*_api_details.txt`（明细，已脱敏）。
随后按 [`references/output-governance.md`](references/output-governance.md) 做治理校验：命名/目录、脱敏自检、
入库规则（HAR 不入库）、产物清单齐全、接口数与 session_log 一致。
- **Checkpoint**：5 件产物治理达标，清单可交付下游。

## 与下游衔接（产物级、零耦合）

只产出规范产物，不感知下游。下游（流程还原 / 代码落锚 / 流程图）按"产物契约"消费：
`{name}_api_requests.txt` + `{name}_session_log.txt` + `{name}_playwright_records.ts` 即可驱动。

## 文件导航

```
runtime-capture-skill/
├── SKILL.md                        ← 本文件（AI 入口）
├── README.md                       ← 人类导航 + 快速上手
├── scripts/                        ← 源脚本（由 setup.mjs 复制到工作目录的 runtime_environment/）
│   ├── setup.mjs                   ← 一键准备 runtime_environment（复制+初始化，幂等）
│   ├── custom-recorder.js          ← 增强录制器（多标签/SPA路由/时序/remapUrls）
│   ├── package.json                ← 录制器依赖（@playwright/test）
│   └── parse_har.py                ← HAR → 两段式 TXT（脱敏）
├── templates/
│   └── session_log.sample.txt      ← 会话日志产物样例
└── references/
    ├── preflight-check.md          ← 前置确认闸门（强制·首步）
    ├── recorder-design.md          ← 录制器五大机制 + session_log 格式
    ├── recording-procedure.md      ← Inspector 录制五步法
    └── output-governance.md        ← 命名/目录/两段式/脱敏/入库/清单/校验
```
