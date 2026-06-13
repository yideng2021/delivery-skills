# 输出治理

> 工序 ② 的核心。把录制原始产物治理成**规范、脱敏、可消费**的交付物。治理不达标 = 不可交付下游。

## 1. 命名规范（统一 `{name}_` 前缀，kebab-case）

| 文件 | 来源 |
|------|------|
| `{name}_playwright_records.ts` | Inspector 录制（手动保存） |
| `{name}_runtimeflow_api_requests.har` | custom-recorder 自动 |
| `{name}_session_log.txt` | custom-recorder 自动 |
| `{name}_api_requests.txt` | parse_har.py |
| `{name}_api_details.txt` | parse_har.py |

> `{name}` 与业务闭环一致（如 `requirement-plan-filing`）；五件产物同前缀，便于成组管理与下游定位。

## 2. 目录规范（工作目录模型）

```
{工作目录}/
├── runtime_environment/     固定名：脚本+依赖，装一次多流程复用（不是产物，不入库）
└── {name}/                  每条业务闭环一个子文件夹，5 件产物落此
```

- **工作目录**录前由用户确定（前置确认环节回显）；可设为 `{工程根}/docs/business-processes/{业务域}/runtime-flows`。
- 每条业务闭环 = 一个 `{name}/` 子文件夹，靠 `{name}` 前缀成组；多闭环平级并列。
- `runtime_environment/` 由 `setup.mjs` 准备，**不是交付产物**，入库时忽略（连同 `node_modules`）。

## 3. 入库 vs 不入库（治理红线）

| 文件 | 入库 | 原因 |
|------|------|------|
| `*_playwright_records.ts` | ✅ | 操作步骤，无敏感 body |
| `*_session_log.txt` | ✅ | 仅 URL + path + 时序（**先核对 query 无敏感参数**） |
| `*_api_requests.txt` | ✅ | 摘要，解析时已脱敏 |
| `*_api_details.txt` | ✅ | 明细，解析时已脱敏 |
| `*_runtimeflow_api_requests.har` | ❌ | **原始流量含未脱敏 body / 凭据**，仅本地，交付前删除 |

## 4. 脱敏治理（先于落盘）

- `parse_har.py` 对 TXT 的 req/resp 按字段名递归脱敏（`token`/`password`/`authorization` 等 → `[REDACTED]`），
  并截断超长 body。
- **HAR 不入库**（含明文头/body）。如必须留存，先清洗 `Authorization`/`Cookie`/`Set-Cookie` 头。
- session_log 入库前**搜一遍 query**：URL 上若带 token/手机号等，手动脱敏或不入库。
- 演示/录制尽量用**测试账号 + 脱敏数据**，从源头降风险。

## 5. 两段式加载治理

- `*_api_requests.txt`（摘要）= 默认加载：接口种子（去重）+ 时序清单，掌握骨架。
- `*_api_details.txt`（明细）= 按需加载：按序号查 req/resp。
- 下游/人**先读摘要**，需要某接口结构时再翻明细 —— 省 token、防淹没。

## 6. 治理质量校验（交付前自检）

- [ ] **命名/目录**：五件产物同 `{name}_` 前缀，落在规范目录。
- [ ] **脱敏**：TXT 全文搜不到 token/密码/身份证/手机号；HAR 已删或已清洗；session_log query 无敏感。
- [ ] **完整性**：五件产物齐全；session_log 的 NAV 覆盖闭环各界面。
- [ ] **一致性**：`*_api_requests.txt` 去重接口数 ≈ session_log REQ 去重数（差异能解释：如非 `/api/` 被滤）。
- [ ] **闭环性**：records.ts 步骤完整、保留 popup/多窗口、无 `goto` 抄近路。
- [ ] **SLOW 备查**：session_log 中 `⚠️[SLOW]` 接口已记录（供性能/体验关注）。

## 7. 产物清单（manifest，交付下游）

```
{name} 运行时采集产物清单
├── {name}_playwright_records.ts        操作步骤（可追溯/复现）
├── {name}_session_log.txt              导航序列 + API 时序（URL 归属已修正）
├── {name}_api_requests.txt             接口摘要（默认加载）
├── {name}_api_details.txt              接口明细（按需加载）
└── {name}_runtimeflow_api_requests.har 原始流量（本地，不入库）
覆盖范围：<一条业务闭环 = 哪些子过程>；录制时间：<ISO>
```

## 8. 多次录制合并（同一业务多路径）

- 一次录制 = 一条路径（示例级）。多路径（如校验失败分支、不同角色）需**多次录制**。
- 合并治理：各路径独立 `{name}-{variant}_*` 命名，下游按需聚合；不在采集层强行拼接。
