# 脱敏规则

> HAR 与响应 body 会抓到凭据与 PII。**产物（events.json / flow.flow / flow.mmd）落盘前必须脱敏**，
> 这是不可协商的红线（见 redlines）。

## 两道防线

### 防线一：capture.ts 字段脱敏（默认生效）

`capture.ts` 对 `reqBody` / `respBody` 按字段名递归替换为 `***REDACTED***`。默认字段：

```
password, passwd, token, accessToken, refreshToken,
authorization, cookie, idCard, phone, mobile, email
```

按被测系统扩展（构造 Capture 时传 `redactFields`）：

```ts
new Capture(page, {
  apiPattern: /\/api\//,
  redactFields: [...DEFAULTS, 'bankCard', 'ssn', 'sessionId', 'sign'],
});
```

### 防线二：network.har 处理

HAR 默认含 **请求头**（Authorization / Cookie）与 **Set-Cookie**，capture.ts 管不到。两种做法：

- **提交制品前删 HAR**：HAR 仅作本地核对，不入库 / 不进 `.brownfield/`（推荐，最省事）。
- **若必须留存 HAR**：用脚本清洗 `headers` 里的 `authorization` / `cookie` / `set-cookie` 后再留。

## 入库前自检清单

- [ ] events.json 全文搜不到真实 token / 密码 / 身份证 / 手机号
- [ ] flow.flow 的 `~real:` 示例值不含敏感数据（用占位或脱敏值）
- [ ] network.har 已删除，或已清洗请求/响应头
- [ ] trace.zip 不随产物入库（含截图可能带敏感界面）—— 仅本地复盘

## 原则

- **白名单优于黑名单**：不确定的字段，宁可脱敏。
- **脱敏发生在落盘前**，绝不"先存明文再清理"。
- 演示/录制尽量用**测试账号 + 脱敏数据**，从源头降低风险。
