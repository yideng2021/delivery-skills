# Runtime Flow Extractor Skill — 运行时业务流认知（record-only）

> 录制一条**完整业务闭环**的真实操作 + 录制时抓全接口 → 解析出接口清单 → 落锚前后端代码
> → 反推出与真实操作一致、且锚定代码的**业务流程图 + 接口契约**。

## 这是什么

对既有 Web 系统，让人用 Playwright codegen 走一遍真实业务闭环（如"需求计划填报" = 列表→新增→详情→删除），
录制时 `--save-har` 同步抓全 `/api/` 流量；再用 Python 解析 HAR 出两段式接口清单；
最后以"真实接口 + 录制脚本"为种子，grep/find + CodeGraph/GitNexus 顺调用链落锚到代码，产出：

- **`{name}.mmd`** —— Mermaid 业务流程图（节点=界面/子过程，边=接口）
- **`{name}.flow`** —— 简洁流程语言：界面 + 接口契约 + 代码锚（`@route/@component/@backend`）
- **`flow-code-map.md`** —— 流程↔代码映射表

## 在认知体系中的位置

| 认知层 | 数据来源 | 工具 | 产物 |
|--------|----------|------|------|
| 静态认知 | 源码 | CodeGraph / GitNexus | 调用链、业务域、静态路由契约 |
| **运行时认知（本 skill）** | **真实操作 + 真实流量** | Playwright codegen + HAR + 两图谱落锚 | **业务流程图 + 真实接口契约 + 代码锚** |

**运行时种子修剪静态图**：真实打出的 API 是已确证入口，CodeGraph/GitNexus 只沿真正跑到的路径扩展，
比纯静态重建幻觉更少。与 `../architecture-extractor-wf` 强协同。

## 管线（三阶段，无回放）

```
① 录制（codegen --save-har）   ──►  {name}_playwright_records.ts + ..._api_requests.har
② 解析（python parse_har.py）  ──►  ..._api_requests.txt（摘要）+ ..._api_details.txt（明细）
③ 落锚 + 反推                  ──►  {name}.flow ★ + {name}.mmd ★ + flow-code-map.md
```

第 ③ 步是精度引擎，详见 [`references/code-correlation.md`](references/code-correlation.md)。

## 快速上手

```bash
# 0. 环境检查（只检查，缺失提示用户自行处理，严禁随意安装）
node -v; npm ls @playwright/test; python --version

# 1. 与用户确定业务闭环边界 + 侦察 API 前缀，然后录制
npx playwright codegen <URL> \
  -o   {前缀}/{name}_playwright_records.ts \
  --save-har={前缀}/{name}_runtimeflow_api_requests.har \
  --save-har-glob='**/api/**'
#   {前缀} = {工程根}/docs/business-processes/{业务域}/runtime-flows/

# 2. 解析 HAR → 两段式接口 TXT（摘要默认加载，明细按需）
python scripts/parse_har.py {前缀}/{name}_runtimeflow_api_requests.har

# 3. 代码落锚 + 生成 {name}.flow / {name}.mmd / flow-code-map.md（见 code-correlation.md）
```

## 触发方式

"录制 XX 业务流程并反推流程图"、"抓真实接口梳理这条操作链路"、"把这条链路连同接口/代码画出来"、"运行时业务流认知"。

## 红线（详见 references/redlines.md）

- **业务闭环为单位**，不录碎片（R7）。
- 接口**派生自真实流量(TXT)，禁杜撰**；代码锚需 grep/图谱依据；推断标 `~inferred`。
- **脱敏先于落盘**；HAR 含明文不入库。
- **保真第一**；**图文同源**于 TXT + 录制脚本。

## 目录

```
runtime-flow-extractor-skill/
├── SKILL.md          ← AI 入口
├── README.md         ← 本文件
├── scripts/          ← parse_har.py（HAR → 两段式 TXT）
├── templates/        ← {name}.flow / {name}.mmd 示例
└── references/        ← 命令速查 / 代码落锚法 / 流程语言规格 / 脱敏 / 红线
```
