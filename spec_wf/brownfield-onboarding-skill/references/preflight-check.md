# 前置完整性闸门（Preflight Gate）

> **强制·首步**：提炼任何认知基线之前，必须先确认 CodeGraph + GitNexus 双索引**存在且完整**。
> **核心纪律**：前提不满足 → **停止 + 转人工确认**，绝不跳过、绝不在残缺索引上继续。
> 依据 SKILL.md 不变量 0；违反即认为产物不可信（"错误基线比无基线更危险"）。

---

## 一、检查项

### 阻断项（BLOCK —— 任一不满足即停止）

| # | 检查 | 命令 | 通过判据 |
|---|---|---|---|
| C1 | CodeGraph 索引存在且非空 | `codegraph_status({projectPath})` | 无 "No CodeGraph project loaded" 报错；`Files indexed > 0` 且 `Total nodes > 0` |
| C2 | GitNexus 索引存在且非空 | `list_repos` | 目标仓在列；`stats.files/nodes/edges/communities/processes` 均 > 0 |
| C3 | 双索引指向同一仓 | 对比 C1 `projectPath` 与 C2 `path` | 两者为同一仓库根（规范化后相等） |

### 警示项（WARN —— 不满足须暂停、人工确认后方可继续）

| # | 检查 | 命令 | 警示判据 |
|---|---|---|---|
| W1 | 新鲜度（索引 vs 当前代码） | `list_repos` 的 `lastCommit` / `indexedAt` 对比当前 `git rev-parse HEAD` | commit 漂移 → 索引滞后于代码 |
| W2 | 覆盖一致性 | C1 `Files indexed` vs C2 `stats.files` | 两数差异显著（如 >10%）→ 某侧可能部分索引 |
| W3 | 语义检索可用性 | `list_repos` 的 `stats.embeddings` | `embeddings == 0` → GitNexus 混合检索仅剩 BM25，无语义 |

---

## 二、三态裁决

| verdict | 条件 | 动作 |
|---|---|---|
| **PASS** | C1/C2/C3 全过，且 W1/W2/W3 全过 | 继续提炼工序 B1→B5 |
| **CONFIRM** | C1/C2/C3 全过，但任一 W 命中 | **暂停**，输出警示报告，**显式请求人工确认**；用户确认"知悉降级仍继续"后方可进行，并在 `00-overview.md` 留痕 |
| **BLOCK** | 任一 C 不满足 | **停止**，输出缺失项 + 修复命令，**不得继续**；等待人工修复索引后重跑闸门 |

> ⚠️ 禁止把 BLOCK/CONFIRM 静默降级为继续执行。前提不满足不是"跳过"的理由。

---

## 三、缺失时的修复指引（BLOCK 时输出给用户）

| 缺失 | 修复 |
|---|---|
| CodeGraph 无索引 / 报 "No CodeGraph project" | 在目标仓根执行 `codegraph init -i`（或 server config 加 `--path <repo>`） |
| GitNexus 无索引 / 目标仓不在 `list_repos` | 在目标仓根执行 `gitnexus analyze` |
| 索引指向错仓（C3 失败） | 核对 MCP 配置的 workspace root / `projectPath` 参数 |
| W1 索引滞后 | `gitnexus analyze`（重建）；CodeGraph 由 watcher 增量，必要时重跑 init |
| W3 无 embedding 但需语义检索 | 重跑 `gitnexus analyze` 并启用向量嵌入 |

---

## 四、闸门报告格式（写入 `00-overview.md` 顶部留痕）

```
<!-- preflight-gate
ts: {{ISO8601}}
verdict: PASS | CONFIRM | BLOCK
codegraph: { files: N, nodes: N, edges: N }
gitnexus:  { files: N, nodes: N, communities: N, processes: N, embeddings: N, lastCommit: xxx }
head_commit: xxx
warnings: [W1?, W2?, W3?]
human_confirmation: { required: bool, granted: bool, note: "..." }
-->
```

> CONFIRM 时 `human_confirmation.granted` 必须为 true 才允许继续；BLOCK 时不产出任何 `.brownfield/` 文件。
