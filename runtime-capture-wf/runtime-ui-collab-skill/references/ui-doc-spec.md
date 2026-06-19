# 界面文档产物规格

> 每个界面一份 `{界面名称}.md`，落于 `docs/prd/{name}/`。文件头借鉴 design-writer 的 frontmatter 模式，
> **选择性裁剪**——只取 frontmatter / status 状态机 / 引用保护，**不引入**规约链字段（change_mode 等）/ I8–I11 / CDR
> （ui-collab 是现状参考件，不进 validate 链）。

## 一、frontmatter schema

```yaml
---
doc_type: ui-business-map                 # 固定标识，供下游机读识别
ui_id: UI-01                              # 稳定身份：下游按 ui_id 引用，不依赖文件名（保护文档名）
ui_name: {界面名称}
route: /xxx/list
status: draft                             # draft（草稿待确认）| confirmed（人工确认）| skipped（跳过）
source_refs:                              # 引用保护(SSOT)：记来源锚，不复述原文
  flow_map: docs/runtime-flow/{name}/{name}_flow-map.md#节点4
  capture:  {工作目录}/{name}/             # session_log / records.ts / api_details
  code:     [src/views/.../Index.vue, com.xxx.XxxController]
upstream_nodes: [节点4, 节点5]             # 对应 flow-map 节点
nav_context: {prev: UI-00, next: UI-02}   # 衔接契约：前置/后置界面（下游串流程用）
confidence: {runtime+码: 8, 人工: 3, 待确认: 1, inferred残留: 0}   # 收敛自检；inferred残留=0 为升档硬指标
generated:    {ISO}
confirmed_at: {ISO | —}                   # status=confirmed 时填
---
> 现状(as-is)界面业务事实 · 非规范性 · 仅供参考
```

字段纪律：
- `ui_id`：稳定身份，一经确认不随文件名/界面名变动而改——保护下游引用。
- `source_refs`：只记**来源锚**（路径 + 节点/类名），**不复述**上游原文（SSOT）。
- `status`：状态机 `draft → confirmed / skipped`，机读断点续做与收尾统计的唯一依据。
- `confidence`：各标注计数 + `inferred残留`；`~待确认` 计入但不阻断升档。

## 二、正文结构

```
# {界面名称} — 界面业务梳理
## 一、界面业务描述
  1.1 业务介绍
  1.2 截图（占位 —— capture 无截图产物，人工后补）
  1.3 上下文说明（前置/后置/数据/权限/状态 五维）
## 二、界面功能地图
  2.1 功能骨架总览
  2.2 功能详细描述
## 三、界面流程图
```

- **功能地图按界面操作/功能点组织**（不是 spec 的角色故事切法）；每功能点带触发方式 + 标注。
- **界面流程图**只画本界面内操作流，**不串跨界面**（留给下游流程总览 skill）；Mermaid 只保留结构，禁 `classDef`/`style`。
- 正文每条事实**带标注**（见三）；推断/未决项不得伪装成定论。

## 三、确信度标注规范（对齐上游 + 本 skill 新增 2 项）

| 标注 | 含义 |
|------|------|
| `[runtime+码]` | 运行时录制 + 代码双重验证（最高） |
| `[码]` | 代码直接验证 |
| `[runtime]` | 仅运行时见到，代码未深入（**含跨服务 0 命中**：调用真实发生但代码不在本工程） |
| `[人工]` | **新增**：问人**已定**（由 `~inferred` 升格而来） |
| `~待确认` | **新增**：代码无源码佐证、问人**未定**的逻辑断言；**允许显式残留**、计入 `confidence`，与 `[人工]` 配对 |
| `~inferred` | AI 推断，未直接验证（收敛前临时态，confirmed 产物中**残留=0**） |
| `~unresolved` | 本服务前缀但代码未找到 |

## 四、升档自检（`draft → confirmed` 前必过）

借鉴 design-writer §11；任一不满足**不得**升 `confirmed`：

- [ ] `~inferred` 残留 == 0（`~待确认` 允许残留，须显式列入 `confidence`）
- [ ] 上下文五维齐（前置/后置/数据/权限/状态）
- [ ] 功能地图无空项（每功能点有描述 + 触发方式 + 标注）
- [ ] `nav_context` / `source_refs` 填全
- [ ] 正文无"代码找不到却写成定论"的断言（应为 `~待确认`）

## 五、目录与命名

- 目录：扫工程现有 `docs/prd/` 结构推断输出路径，**确认后**写入；默认 `docs/prd/{name}/`。
- 命名：`{界面名称}.md`，每界面一文件。
- 写入：`write_file` 直写工作区内目录（不存在则建）。
