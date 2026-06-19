# 前置闸门（强制·首步）

> 出业务说明前只确认三件事：**ui-collab confirmed 文档就位** + **flow-map 就位** + **工程/索引就位**。
> 缺则**中断 + 提示先跑上游**，绝不自行采集、落锚或臆造。

## A. 上游产物检查（核心）

| 文件 | 位置 | 缺失裁决 |
|------|------|----------|
| `*.md`（界面事实，**至少部分 status=confirmed**） | `docs/prd/{name}/` | **BLOCK**（提示先跑 runtime-ui-collab 并确认界面） |
| `{name}_flow-map.md` | `docs/runtime-flow/{name}/` | **BLOCK**（提示先跑 runtime-flow-mapper） |

- 扫 `docs/prd/{name}/` 各文件 frontmatter `status`：
  - 无任何 `confirmed` → **BLOCK**（没有可信界面事实可串）。
  - 有 `confirmed`、也有 `skipped`/`draft` → **CONFIRM**：记录未梳理界面清单，后续在流程中标〔待核实·未梳理〕。

任一缺失 → **中断**，输出提示：

```
【中断】缺上游产物：[清单]。
- 缺/无 confirmed 界面文档 → 请先用 runtime-ui-collab 逐界面确认 docs/prd/{name}/
- 缺 flow-map → 请先用 runtime-flow-mapper 生成 docs/runtime-flow/{name}/{name}_flow-map.md
确认产物就位后再运行本 skill。（本 skill 不自行采集、不落锚、不臆造。）
```

## B. 工程与索引就位（深探依赖）

| 项 | 检查 | 缺失裁决 |
|----|------|----------|
| 前端工程目录 | 用户提供、可访问 | BLOCK（向用户索取） |
| 后端工程目录 | 用户提供、可访问 | BLOCK（深探主依赖后端） |
| CodeGraph 索引（前/后端两仓） | `codegraph_status` 非空 | BLOCK（提示建索引）；用户显式选 grep-only 降级 → CONFIRM |
| GitNexus 索引（前/后端两仓） | `list_repos` 两仓在列 | 同上 |

## C. 一致性检查

- ui-collab 文档、flow-map **同一 `{name}`**——不一致 → BLOCK。

## 三态裁决

| 态 | 条件 | 动作 |
|----|------|------|
| **PASS** | A 全齐（有 confirmed）+ B 就位 + C 一致 | 进入 ① 串流程 |
| **CONFIRM** | 有未梳理界面 / B 索引缺用户接受降级 | 记录后进入 ① |
| **BLOCK** | 无 confirmed 文档 / 缺 flow-map / 缺工程或索引 / C 不一致 | 中断 + 列清单转人工 |

## 纪律

- **上游缺产物即中断**：本 skill 是业务语义层，不回头做采集/落锚/确认——提示用户跑上游。
- **不臆造**：缺数据不补全、不猜；未梳理界面诚实标〔待核实〕。
- **闸门不可跳过**：未 PASS / 未确认 CONFIRM，不进入串流程。
