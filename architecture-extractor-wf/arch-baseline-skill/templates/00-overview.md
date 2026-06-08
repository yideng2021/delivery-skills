# 认知基线 · 总览 · {{repo_name}}

<!-- preflight-gate
ts: {{ISO8601}}
verdict: PASS | CONFIRM | BLOCK
codegraph: { files: {{n}}, nodes: {{n}}, edges: {{n}} }
gitnexus:  { files: {{n}}, nodes: {{n}}, communities: {{n}}, processes: {{n}}, embeddings: {{n}}, lastCommit: {{xxx}} }
head_commit: {{xxx}}
warnings: [{{W1?/W2?/W3?}}]
human_confirmation: { required: {{bool}}, granted: {{bool}}, note: "{{...}}" }
-->

> **本目录是什么**：棕地项目认知基线（brownfield cognitive baseline）。由 CodeGraph + GitNexus 双源提炼。
> 生成前已通过前置完整性闸门（见上方 `preflight-gate` 留痕；协议见 brownfield-onboarding skill `references/preflight-check.md`）。
> **核心模型**：**薄基线（永久·人审） + 活查询（即时·不固化·源码可信）**。
> 永久文档只放 MCP 给不出的东西（域划分 / 主线叙事 / 人审背书 + 回链锚点）；明细一律活查询。

---

## 一、仓库画像

| 项 | 值 |
|---|---|
| 业务定位 | {{业务定位}} |
| 技术栈 | {{语言/框架/中间件}} |
| 规模 | 文件 {{n}} · 类 {{n}} · 方法 {{n}} · 路由 {{n}} |
| 基础包/根 | {{base_package}} |
| 分层 | {{分层结构}} |

## 二、双索引状态

| 工具 | 用途 | 状态 | 数据 |
|---|---|---|---|
| **CodeGraph** | 代码逻辑 / 调用链 / 影响面 / 动态分发 / verbatim 源码 | {{✅/❌}} | {{节点/边/库大小}} |
| **GitNexus** | 业务社区 / 影响 / 契约 / cypher / 跨域 | {{✅/❌}} | {{社区/process · 基线 commit}} |

> {{若 embeddings=0 在此注明：语义向量未生成，混合检索仅 BM25}}

## 三、本目录文件导航

| 文件 | 角色 | 人审 |
|---|---|---|
| `00-overview.md` | 总览（本文件） | — |
| `01-architecture.md` | **薄导航**：业务域 + 分层 + 主线 + 噪声剔除 | ✅ |
| `02-business-flows.md` | **薄索引**：主线流程 + 入口锚点 + 活查询命令 | ✅ |
| `05-retrieval-guide.md` | 活查询指南 + 下游对接 | — |

> 人审只覆盖标 ✅ 的薄层。明细走活查询，不入人审。

## 四、时效约定

- 永久文档 pin 基线 commit `{{commit}}`；代码演进后用 `gitnexus detect_changes` 看 diff 影响，**叙事文档需重跑提炼才更新**（不自动）。
- 任何细节以**活查询当前源码**为准；本目录文字若与源码冲突，信源码。
