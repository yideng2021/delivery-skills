# 前置闸门（强制·首步）

> 协同前只确认三件事：**flow-map 就位** + **capture 原始产物就位** + **工程/索引就位**。
> 缺则**中断 + 提示先跑上游**，绝不自行采集、落锚或臆造。

## A. 上游产物检查（核心）

| 文件 | 位置 | 缺失裁决 |
|------|------|----------|
| `{name}_flow-map.md` | `docs/runtime-flow/{name}/` | **BLOCK**（提示先跑 runtime-flow-mapper） |
| `{name}_session_log.txt` | `{工作目录}/{name}/` | **BLOCK**（提示先跑 runtime-capture） |
| `{name}_playwright_records.ts` | `{工作目录}/{name}/` | **BLOCK** |
| `{name}_api_details.txt` | `{工作目录}/{name}/` | **BLOCK** |

任一缺失 → **中断**，输出提示：

```
【中断】缺上游产物：[清单]。
- 缺 flow-map → 请先用 runtime-flow-mapper 生成 docs/runtime-flow/{name}/{name}_flow-map.md
- 缺 capture 产物 → 请先用 runtime-capture 采集并治理 {name}
确认产物就位后再运行本 skill。（本 skill 不自行采集、不落锚、不臆造。）
```

## B. 工程与索引就位（代码回查依赖）

| 项 | 检查 | 缺失裁决 |
|----|------|----------|
| 前端工程目录 | 用户提供、可访问 | BLOCK（向用户索取） |
| 后端工程目录 | 用户提供、可访问 | BLOCK |
| CodeGraph 索引（前/后端两仓） | `codegraph_status` 非空 | BLOCK（提示建索引）；用户显式选 grep-only 降级 → CONFIRM |
| GitNexus 索引（前/后端两仓） | `list_repos` 两仓在列 | 同上 |

## C. 一致性检查

- flow-map 与 capture 产物**同一 `{name}`**——不一致 → BLOCK（避免张冠李戴）。

## 三态裁决

| 态 | 条件 | 动作 |
|----|------|------|
| **PASS** | A 全齐 + B 就位 + C 一致 | 进入 ① 界面范围确认 |
| **CONFIRM** | B 索引缺、用户接受 grep-only 降级 | 记录降级，进入 ① |
| **BLOCK** | A 缺产物 / B 缺工程或索引 / C 不一致 | 中断 + 列清单转人工，**不自行采集、不轮询** |

## 纪律

- **上游缺产物即中断**：本 skill 是界面层，不回头做采集/落锚——提示用户跑上游。
- **不臆造**：缺数据不补全、不猜。
- **闸门不可跳过**：未 PASS / 未确认 CONFIRM，不进入界面范围确认。
- **断点续做例外**：若 `docs/prd/{name}/` 已有产物，先扫各文件 `status`（confirmed/skipped 跳过、draft 续做），不从零重来。
