# 简洁流程语言（.flow）规格

> 一种行级 DSL，一眼看完一条**业务闭环** + 各界面真实接口契约 + 代码锚点。人可读、AI 可生成、可 diff、可嵌 wiki。
> 与 `{name}.mmd` **同源**于 `*_api_requests.txt`(接口) + `{name}_playwright_records.ts`(步骤)，必须保证图文一致。

## 设计目标

- **业务闭环为单位**：顶层 `flow` = 一条完整业务闭环（含多个界面/子过程），不是单界面碎片。
- **紧凑**：一行一接口，胜过 markdown 表格堆砌。
- **可信**：接口派生自真实流量(TXT)，代码锚有 grep/图谱依据；推断必标 `~inferred`，杜撰即违规（见 redlines）。

## 语法

```
flow <业务闭环名> {
  @base   <服务根 URL>
  @source <*_api_requests.txt + {name}_playwright_records.ts 相对路径>
  @capturedAt <ISO 时间>

  [<界面名>] @route=<路由> @component=<前端组件路径>
    <操作1> → <操作2> → <操作3>
    → <METHOD> <path>[?<query>]   [@backend=<handler → service>]
      req  <结构>          [~real: ...] [~inferred: ...]
      resp <结构>          [~real: ...] [~inferred: ...]
}
```

### 元素

| 元素 | 含义 |
|------|------|
| `[界面名]` | 流程节点 = 页面 / 路由；同一界面内多步用 `→` 串联 |
| `@route=` / `@component=` | （可选）节点真实路由 + 关联前端组件路径（脚本 route/locator + grep，详见 code-correlation.md）；未确证用 `?` 标 |
| `→ METHOD /path` | 该节点触发的接口（按真实发生顺序，取自 `*_api_requests.txt`） |
| `@backend=` | （可选）该接口的后端落锚：`handler → service`（grep + CodeGraph 顺链）；未确证用 `?` 标 |
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

## 与 TXT / 录制脚本的映射

| .flow | 来源 |
|-------|------|
| `[界面名] 操作...` | `{name}_playwright_records.ts` 的动作序列，按 HAR 页面边界归并为界面（见 code-correlation §1） |
| `@route` / `@component` | 脚本 route/locator + grep 源码所得组件路径 |
| `→ METHOD /path` | `*_api_requests.txt` 时序清单（按界面归并） |
| `@backend` | grep handler + CodeGraph 顺链所得后端落锚 |
| `req` / `resp` | `*_api_details.txt` 对应序号的 body 结构归纳 |
| `~real:` | 取自 details 真实值 |

> 校验：`.flow` 里每个 `→` 都应能在 `*_api_requests.txt` 找到对应项；找不到 = 杜撰，必删。
