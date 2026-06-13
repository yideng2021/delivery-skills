# 前置闸门（强制·首步）

> 落锚前只确认两件事：**上游产物齐否** + **工程/索引就位**。缺上游产物则**中断 + 提示**，
> 绝不自行录制或臆造数据。

## A. 上游产物检查（核心）

在 `{工作目录}/{name}/` 下确认 4 件 runtime-capture 产物齐全：

| 文件 | 缺失裁决 |
|------|----------|
| `{name}_session_log.txt` | **BLOCK** |
| `{name}_playwright_records.ts` | **BLOCK** |
| `{name}_api_requests.txt` | **BLOCK** |
| `{name}_api_details.txt` | **BLOCK** |

任一缺失 → **中断**，输出提示：

```
【中断】未在 {工作目录}/{name}/ 找到上游运行时捕获产物：缺 [清单]。
请先用 runtime-capture-skill 采集并治理 {name}，确认 4 件产物写入该目录后再运行本 skill。
（本 skill 不自行录制、不臆造数据。）
```

## B. 工程与索引就位（落锚依赖）

| 项 | 检查 | 缺失裁决 |
|----|------|----------|
| 前端工程目录 | 用户提供、可访问 | BLOCK（向用户索取） |
| 后端工程目录 | 用户提供、可访问 | BLOCK |
| CodeGraph 索引（前/后端两仓） | `codegraph_status(projectPath=…)` 非空 | BLOCK（提示建索引）；用户可显式选 grep-only 降级 → CONFIRM |
| GitNexus 索引（前/后端两仓） | `list_repos` 两仓在列 | 同上 |

> 多仓时记录前端/后端各自 repo 名 + path，落锚查询带 `projectPath`/`repo`（见 correlation-method）。

## 三态裁决

| 态 | 条件 | 动作 |
|----|------|------|
| **PASS** | A 全齐 + B 就位 | 进入 ① |
| **CONFIRM** | B 索引缺、用户接受 grep-only 降级 | 记录降级，进入 ① |
| **BLOCK** | A 缺产物 / B 缺工程或索引 | 中断 + 列清单转人工，**不自行采集、不轮询** |

## 纪律

- **上游缺产物即中断**：本 skill 是落锚层，不回头做采集——提示用户跑 runtime-capture。
- **不臆造**：缺数据不补全、不猜。
- **闸门不可跳过**：未 PASS / 未确认 CONFIRM，不进入节点识别。
