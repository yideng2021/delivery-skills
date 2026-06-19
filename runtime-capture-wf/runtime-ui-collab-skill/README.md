# Runtime UI Collab Skill — 运行时界面业务梳理（人机协同）

> 以 runtime-flow-mapper 的 flow-map 为骨架、runtime-capture 原始证据为界面操作事实源，
> **逐界面人机协同核对**，把推断校准成确证，输出已确认的**界面业务事实文档集**。
> 管线**首个人工闸口**——不采集、不落锚、不抽业务规则、不串跨界面流程。

## 在认知管线中的位置

```
runtime-capture ─产物─▶ runtime-flow-mapper ─flow-map─▶  本 skill（界面层·人工闸口）
                              │                          人机协同→已确认界面事实文档集
   原始证据(session_log/records.ts/api_details) ─────────┘（直供，取界面操作粒度）
                                                              │
                                          ┌─ runtime-spec-mapper（业务规约·下游）
                                          └─ 流程总览 skill（串端到端流程·下游）
```

## 输入 / 输出

| | 内容 |
|---|---|
| 输入 | `docs/runtime-flow/{name}/{name}_flow-map.md`（骨架）+ `{工作目录}/{name}/` capture 原始证据 + 前后端工程 + CodeGraph/GitNexus 索引 |
| 输出 | `docs/prd/{name}/{界面名称}.md`（每界面一文件，带 frontmatter） |

## 核心能力：三级推断收敛

```
runtime 原始证据自证（records.ts/session_log/api_details）   ← "实际发生了什么"
  → 代码回查补全（flow-map 锚点浅回查）                       ← "完整能做什么"
  → 问人兜底（仅业务判断类）                                  ← 已定=[人工] / 未定=~待确认
```

## 红线

- **推断必收敛**：`~inferred` 在 confirmed 文档残留=0；**代码找不到的逻辑不得断言**，标 `~待确认`。
- **跨服务以 runtime 为存在性权威**：代码 0 命中 ≠ 无此逻辑。
- **时序 ≠ 因果**：断言因果须 diff 请求体佐证。
- **不越界**：不采集/不落锚（上游），不抽业务规则/不串流程（下游）。
- **即时落盘 + status 断点续做**：中断不丢进度。

## 触发

「逐界面梳理运行时业务」「把 flow-map 整理成界面文档」「界面业务核对」「人机协同界面梳理」。

## 目录

```
runtime-ui-collab-skill/
├── SKILL.md / README.md
├── references/  preflight-check / collab-method / ui-doc-spec
└── templates/   ui-business-map.md
```
