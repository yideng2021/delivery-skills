# 脱敏规则

> HAR 与响应 body 会抓到凭据与 PII。**入库产物（TXT 摘要/明细、flow.flow、flow.mmd）落盘前必须脱敏**，
> 这是不可协商的红线（见 redlines R3）。

## 两道防线

### 防线一：parse_har.py 字段脱敏（默认生效）

`scripts/parse_har.py` 解析时对 header 与 body 按字段名脱敏为 `[REDACTED]`：

```python
SENSITIVE_HEADERS  = {cookie, set-cookie, authorization, token, x-auth-token, x-access-token, ...}
SENSITIVE_BODY_KEYS = {token, password, passwd, auth_token, access_token, refresh_token,
                       secret, idcard, phone, mobile, ...}
```

按被测系统扩展：直接在脚本顶部的两个集合里加字段（如 `bankCard`、`ssn`、`sessionId`、`sign`）。
JSON 体递归脱敏，form-urlencoded 体按 `key=` 脱敏。

### 防线二：原始 HAR 处理（`*_runtimeflow_api_requests.har`）

HAR 含**完整明文**（请求头 Authorization/Cookie、Set-Cookie、未脱敏 body）。parse_har.py 只清洗**产出的 TXT**，不改 HAR。

- **入库前删 HAR**（推荐）：HAR 仅作本地核对，**不入库**。
- **若必须留存**：用脚本清洗 `headers` 的 `authorization`/`cookie`/`set-cookie` 后再留。

## 入库前自检清单

- [ ] `*_api_requests.txt` / `*_api_details.txt` 全文搜不到真实 token / 密码 / 身份证 / 手机号
- [ ] `{name}.flow` 的 `~real:` 示例值不含敏感数据（用占位或脱敏值）
- [ ] 原始 `*_runtimeflow_api_requests.har` 已删除，或已清洗请求/响应头
- [ ] 录制脚本 `{name}_playwright_records.ts` 里没硬编码真实密码（用测试账号/占位）

## 原则

- **白名单优于黑名单**：不确定的字段，宁可脱敏。
- **脱敏发生在落盘前**，绝不"先存明文再清理"。
- 录制尽量用**测试账号 + 脱敏数据**，从源头降低风险。
