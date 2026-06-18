# 前置闸门（强制·首步）

> 深探前只确认两件事：**上游 flow-map 就位** + **工程/索引齐备**。缺 flow-map 则**中断 + 提示**，
> 绝不臆造数据、绝不回头自行落锚或采集。

## A. 上游产物检查（核心）

确认 runtime-flow-mapper 主产物存在且可读：

| 文件 | 缺失裁决 |
|------|----------|
| `docs/runtime-flow/{name}/{name}_flow-map.md` | **BLOCK** |

缺失 → **中断**，输出提示：

```
【中断】未找到 docs/runtime-flow/{name}/{name}_flow-map.md。
请先用 runtime-flow-mapper-skill 把录制产物落锚成 flow-map 后再运行本 skill。
（本 skill 是规约层，不回头做采集与落锚，也不臆造数据。）
```

> flow-map 须含「节点清单 + 三证对齐表（含后端 handler 代码锚）」——这是本 skill 深探的入口。
> 若 flow-map 的代码锚大面积为 `~inferred`/`~unresolved`，提示用户：上游落锚不充分，深探质量受限，建议先补全 flow-map。

## B. 工程与索引就位（深探依赖）

| 项 | 检查 | 缺失裁决 |
|----|------|----------|
| 前端工程目录 | 用户提供、可访问 | BLOCK（向用户索取） |
| 后端工程目录 | 用户提供、可访问 | BLOCK |
| CodeGraph 索引（前/后端两仓） | `codegraph_status(projectPath=…)` 非空 | BLOCK（提示建索引）；用户可显式选 grep-only 降级 → CONFIRM |
| GitNexus 索引（前/后端两仓） | `list_repos` 两仓在列 | 同上 |

> 多仓时记录前端/后端各自 repo 名 + path，深探查询带 `projectPath`/`repo`。

## 三态裁决

| 态 | 条件 | 动作 |
|----|------|------|
| **PASS** | A 就位 + B 齐备 | 进入 ① |
| **CONFIRM** | B 索引缺、用户接受 grep-only 降级 | 记录降级，进入 ① |
| **BLOCK** | A 缺 flow-map / B 缺工程或索引 | 中断 + 列清单转人工，**不自行落锚、不轮询** |

## 纪律

- **上游缺 flow-map 即中断**：本 skill 是规约层，不回头做落锚——提示用户跑 runtime-flow-mapper。
- **不臆造**：缺数据不补全、不猜；代码读不到的不硬写。
- **闸门不可跳过**：未 PASS / 未确认 CONFIRM，不进入业务上下文提炼。
