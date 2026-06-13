# Runtime Capture Skill — 运行时业务流采集与输出治理

> 录制一条**完整业务闭环**的真实操作与流量，治理成规范、脱敏、两段式可消费的产物。
> **只采集 + 治理，不反推流程图** —— 那是下游 skill 的事，产物级解耦。

## 这是什么

认知管线的**上游采集层**：用增强录制器 `custom-recorder.js`（多标签页 / SPA 路由 / API 时序 /
URL 归属竞态修正）抓真实流量，再用 `parse_har.py` 治理成规范产物，交付下游做流程还原 / 代码落锚。

## 产物（统一 `{name}_` 前缀）

| 文件 | 角色 | 入库 |
|------|------|------|
| `{name}_playwright_records.ts` | 操作步骤 | ✅ |
| `{name}_session_log.txt` | 导航序列 + API 时序（URL 归属已修正） | ✅ |
| `{name}_api_requests.txt` | 接口摘要（默认加载） | ✅ |
| `{name}_api_details.txt` | 接口明细（按需加载） | ✅ |
| `{name}_runtimeflow_api_requests.har` | 原始流量 | ❌ 本地 |

## 工作目录模型（自包含、可移植）

```
{工作目录}/
├── runtime_environment/   ← 固定名：脚本+依赖，装一次多流程复用
└── {业务流程名}/           ← 每条流一个子文件夹，5 件产物落此
```

## 四步上手（无门槛）

```bash
# 0. 确认输入（工作目录 / 业务流程名 / 起始 URL）—— skill 会回显路径请你确认

# 1. 一键准备环境（幂等：建 runtime_environment + 复制脚本 + 缺 node_modules 才 npm install）
node scripts/setup.mjs {工作目录}
#   chromium 内核只检查，缺则按提示手动装一次：npx playwright install chromium

# 2. 采集录制（Inspector：Record → 操作完整闭环 → 复制 TS 存盘 → Resume）
cd {工作目录}/runtime_environment
node custom-recorder.js ../{name}/{name}
#   → 自动 remapUrls 修正 URL 归属，写出 HAR + session_log 到 {工作目录}/{name}/

# 3. 输出治理（HAR → 两段式 TXT，已脱敏）
python parse_har.py ../{name}/{name}_runtimeflow_api_requests.har
```

> **唯一自动安装** = `runtime_environment/` 内的 `npm install`（幂等，先检查再执行），不碰你的工程或全局环境。
> Node / Python / chromium 内核只检查，缺则告知命令由你手动装（较重安装人工执行更合适）。

## 触发方式

自然语言："录制 XX 业务流"、"采集真实接口流量"、"把这条操作整理成规范产物"、"运行时采集"。

## 与裸 codegen 的差异（为什么用增强录制器）

| 能力 | `playwright codegen` | `custom-recorder.js` |
|------|---------------------|----------------------|
| 多标签页(popup)跟踪 | ❌ | ✅ page0/page1… |
| SPA 路由序列 | ❌ | ✅ hash/push/replace/pop |
| API 归属页面 URL | ❌ | ✅（含竞态修正 remapUrls） |
| 请求相对时序 + 慢接口标注 | ❌ | ✅ >1000ms ⚠️[SLOW] |
| 生成操作脚本 .ts | ✅ | 靠 Inspector Record（手动存） |

## 红线（详见 references/output-governance.md）

- **业务闭环为单位**，不录碎片；录前与用户定边界。
- **脱敏先于落盘**；原始 HAR 不入库。
- **只采集治理，不反推**：代码落锚 / 流程图留给下游。

## 目录

```
runtime-capture-skill/
├── SKILL.md          ← AI 入口
├── README.md         ← 本文件
├── scripts/          ← custom-recorder.js / package.json / parse_har.py
├── templates/        ← session_log 样例
└── references/       ← preflight / recorder-design / recording-procedure / output-governance
```

## 下游消费方

- `01-设计过程/03-testing/01-运行时业务操作流程还原skill.md`（流程还原 + API 清单）
- `delivery-skills/e2e-test-wf/runtime-flow-extractor-skill`（代码落锚 + 流程图 + .flow）

> 本 skill 不感知下游；下游按"产物契约"消费 `*_api_requests.txt` + `*_session_log.txt` + `*_playwright_records.ts`。
