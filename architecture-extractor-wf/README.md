# architecture-extractor-wf — 棕地架构提取

> 独立的 workflow 域：用 CodeGraph + GitNexus 双源，对棕地（既有）项目提取架构与业务认知。
> **与任何规约/交付流水线（含 spec_wf）完全解耦**——只产出独立产物，供任意下游按"产物契约"消费。

---

## 包含的 skill

| skill | 定位 | 消费者 | 产物 |
|---|---|---|---|
| [`arch-baseline-skill`](arch-baseline-skill/) | 薄认知基线（地图 + 流程索引 + 活查询出口） | 带 MCP 的 agent | `.brownfield/`（00/01/02/05） |
| [`arch-guide-skill`](arch-guide-skill/) | 厚架构导览（核心域逐个深描） | 人（学习/交接/介绍） | `.brownfield/architecture/` |

## 上下游

```
目标棕地仓 ──双索引(codegraph init + gitnexus analyze)──▶ 前置完整性闸门
   │
   ├─ arch-baseline ──▶ .brownfield/ 薄基线（地图）
   │                          │
   └─ arch-guide ◀────────────┘ 消费 01 地图 ──▶ .brownfield/architecture/ 厚导览
```

- `arch-guide` 复用 `arch-baseline` 的**前置闸门**与**6 步重建法**（同 wf 内引用）。
- 本 wf 为**纯容器目录**，无 orchestrator；两 skill 各自独立触发。

## 解耦边界（对外）

| 层 | 标准 |
|---|---|
| 代码/配置 | 不被任何外部流水线 import/调用；无共享注册表条目 |
| 文档 | 不在外部流水线文档中作为前置依赖；不点名外部组件 |
| 运行时数据 | 仅通过独立产物 `.brownfield/` 间接传递；下游"存在即用、缺失降级" |

## 前置依赖

- 目标仓已建双索引：`codegraph init -i` + `gitnexus analyze`
- 运行环境挂载 CodeGraph MCP + GitNexus MCP
- 首步强制前置完整性闸门（详见 `arch-baseline-skill/references/preflight-check.md`）
