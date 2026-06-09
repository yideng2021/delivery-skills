# 简洁流程语言（.flow）规格

> 一种行级 DSL，一眼看完整条业务流 + 每步真实接口契约。人可读、AI 可生成、可 diff、可嵌 wiki。
> 与 `flow.mmd` **同源于 `events.json`**，必须保证图文一致。

## 设计目标

- **紧凑**：一行一接口，胜过 markdown 表格堆砌。
- **同源**：节点序号对齐 `events.json` 的 `steps[].index`，可机器校验。
- **可信**：契约派生自真实流量；推断必标 `~inferred`，杜撰即违规（见 redlines）。

## 语法

```
flow <流程名> {
  @base   <服务根 URL>
  @source <events.json 相对路径>
  @capturedAt <ISO 时间>

  [<界面名>] <操作1> → <操作2> → <操作3>
    → <METHOD> <path>[?<query>]
      req  <结构>          [~real: ...] [~inferred: ...]
      resp <结构>          [~real: ...] [~inferred: ...]
}
```

### 元素

| 元素 | 含义 |
|------|------|
| `[界面名]` | 流程节点 = 页面 / 路由；同一界面内多步用 `→` 串联 |
| `@route=` / `@component=` | （可选）节点的真实路由 + 关联的前端组件路径（来自 events.json 指纹 + grep，详见 code-correlation.md）；未确证用 `?` 标 |
| `→ METHOD /path` | 该节点触发的接口（按真实发生顺序） |
| `req` / `resp` | 请求参数 / 响应结构 |
| `(同上, 复用契约)` | 与前面同 path 同形的接口去重，不重复展开 |
| `(自动刷新)` / `(轮询)` | 非用户直接触发、但真实发生的接口，括号标注来源 |

### 类型记号（极简）

| 记号 | 含义 |
|------|------|
| `str` `int` `bool` `num` | 标量 |
| `enum(a\|b\|c)` | 观察到的取值集合（来自真实样本，可能不完整 → 配 `~inferred`） |
| `[...]` | 数组，元素结构写括号内 |
| `{...}` | 对象 |
| `?` 后缀 | 可空 / 非必填（如 `remark?:str`） |

### 标注（可信度，强制）

- `~real: <说明>` —— 真实示例值或观察事实（如 `role="buyer"`、`9 项`）。
- `~inferred: <说明>` —— AI 推断且**无法从单次流量证实**的部分（如 `items 单样本`、枚举可能不全）。
- 无标注 = 直接来自真实请求/响应字段，类型确定。

## 完整示例

见 [`../templates/flow-dsl.flow`](../templates/flow-dsl.flow)。

## 与 events.json 的映射

| .flow | events.json |
|-------|-------------|
| `[界面名] 操作...` | `steps[]`（按 `index` 聚合相邻同 `page.route`/界面的步骤） |
| `@route` / `@component` | `steps[].page.route` + grep 源码所得组件路径 |
| `→ METHOD /path` | `calls[]`（按 `step` 归属到对应节点） |
| `req` | `calls[].reqBody` 的结构归纳 |
| `resp` | `calls[].respBody` 的结构归纳 |
| `~real:` | 取自 `calls[]` 真实值 |

> 校验：`.flow` 里每个 `→` 都应能在 `events.json` 的 `calls[]` 找到对应项；找不到 = 杜撰，必删。
