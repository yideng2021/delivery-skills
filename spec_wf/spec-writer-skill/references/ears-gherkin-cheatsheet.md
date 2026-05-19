# EARS + Gherkin 速查

> L3 每条 AC = **一条 EARS 句** + **一段 Gherkin Scenario**。
> 本文件仅给句式速查,**不复述** AC 三层口径定义(见 [`../../shared/contracts/ac-vocabulary.md`](../../shared/contracts/ac-vocabulary.md))。

---

## §1 EARS 5 种句式

EARS = Easy Approach to Requirements Syntax。每条 L3 AC 必须采用以下 5 种句式之一:

| # | 句式 | 模板 | 适用场景 |
|---|------|------|---------|
| 1 | Ubiquitous(普适) | `The system shall {行为}` | 永远成立的功能性需求 |
| 2 | Event-driven(事件驱动) | `When {触发}, the system shall {行为}` | 由用户操作或事件触发 |
| 3 | State-driven(状态驱动) | `While {状态}, the system shall {行为}` | 在某个状态下持续生效 |
| 4 | Optional feature(可选) | `Where {特性启用}, the system shall {行为}` | 可配置 / 灰度功能 |
| 5 | Unwanted behavior(异常) | `If {异常条件}, then the system shall {行为}` | 错误处理 / 拒绝路径 |

> 多触发条件可叠加:`When X, while Y, the system shall Z`。

---

## §2 EARS 写作铁律

- 主语只能是 `the system`;禁止写"用户应当 ……"或"我们应当 ……"
- `shall` 不可替换为 `should / will / may`
- 行为子句必须**可观察、可断言**(对应 Gherkin Then 的可断言性)
- 不写 HTTP code / 字段名 / SQL / 实现细节
- 不写"运行流畅 / 体验良好 / 响应快速"等模糊形容

---

## §3 Gherkin Scenario 模板

```gherkin
Scenario: AC-{req}-{seq} — {一句话场景标题}
  Given {前置状态}
  And   {附加前置状态}
  When  {触发动作}
  Then  {可观察结果}
  And   {附加可观察结果}
```

### 关键字职责

| 关键字 | 职责 | 写作要点 |
|--------|------|---------|
| `Given` | 前置状态 | 描述业务状态非 UI 状态;可有多条 `And` |
| `When` | 触发动作 | 一条且仅一条;描述用户/外部触发 |
| `Then` | 可观察结果 | 必须可断言;描述业务态而非技术态 |
| `And` | 同类追加 | 跟随上一条同类关键字 |

> Scenario 标题必须以 `AC-{req}-{seq} — ` 开头,与 spec 内编号一致。

---

## §4 EARS ↔ Gherkin 配对示例

### 示例 1 · Event-driven

**EARS**:When the user submits a valid email and a policy-compliant password, the system shall create the account and redirect to the home page.

```gherkin
Scenario: AC-signup-01 — 访客用合法邮箱密码注册成功
  Given 访客未登录且邮箱 user@x.com 未注册
  When  提交合法邮箱与符合策略的密码
  Then  系统创建账户并跳转至主站
  And   邮箱进入"已激活"业务状态
```

### 示例 2 · Unwanted behavior(异常)

**EARS**:If the submitted email is already registered, then the system shall reject the signup and return a "duplicate email" notice.

```gherkin
Scenario: AC-signup-02 — 重复邮箱拒绝注册
  Given 邮箱 user@x.com 已存在有效账户
  When  以同一邮箱再次提交注册
  Then  系统拒绝注册并展示"邮箱已注册"提示
  And   不创建任何新账户
```

---

## §5 反模式速查

- ❌ `When 用户点击按钮 ……` → 改为业务触发("提交注册"),避免 UI 耦合
- ❌ `Then 返回 HTTP 409` → 改为业务态("拒绝注册并展示提示")
- ❌ `Then 数据库写入 user 表` → 改为业务态("账户进入已激活状态")
- ❌ Scenario 中含多条 `When` → 拆为多个 Scenario
- ❌ `Then 体验流畅` → 不可断言,删除或具化