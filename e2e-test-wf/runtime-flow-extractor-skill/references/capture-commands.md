# 命令速查：环境检查 / 录制(codegen --save-har) / 解析(parse_har.py)

> 官方 Playwright CLI（`npx playwright`）+ Python 解析脚本。record-only：录制即抓包，**不回放**。
> 标准目录前缀 `{前缀}` = `{工程根}/docs/business-processes/{业务域}/runtime-flows/`。

## 0. 环境检查（只检查，严禁随意安装）

> 本步**仅做环境检查**。任何缺失项一律**停下并提示用户自行处理**，绝不擅自 `npm i` / `playwright install`。

```bash
# ① Node（建议 >= 18）
node -v
# ② @playwright/test
npm ls @playwright/test    # 失败可试 npx playwright --version
# ③ chromium 内核（直接查文件，不调 install）
#    Windows:
if exist "%USERPROFILE%\AppData\Local\ms-playwright\chromium-*" (echo OK chromium) else (echo MISSING chromium)
#    Linux/macOS:
ls ~/.cache/ms-playwright/chromium-*/ >/dev/null 2>&1 && echo "OK chromium" || echo "MISSING chromium"
# ④ Python 3（跑解析脚本）
python --version
```

| 现象 | 处置 |
|------|------|
| `node -v` 报错/版本过低 | **停止**，提示用户安装/升级 Node |
| `@playwright/test` 未安装 | **停止**，提示用户执行 `npm i -D @playwright/test`（用户自行执行） |
| chromium 缺失 | **停止**，提示用户执行 `npx playwright install chromium`（用户自行执行） |
| Python 缺失 | **停止**，提示用户安装 Python 3 |
| 全部就绪 | 进入第 1 步 |

## 1. 录制（一条完整业务闭环，录制即抓包）

> 录前先与用户**确定业务闭环边界**（不变量 1），并**侦察 API 路径前缀**确认 glob（见下）。

```bash
npx playwright codegen <URL> \
  -o   {前缀}/{name}_playwright_records.ts \
  --save-har={前缀}/{name}_runtimeflow_api_requests.har \
  --save-har-glob='**/api/**'
```

| 参数 | 说明 |
|------|------|
| `-o` | 录制脚本（真实操作序列）。`{name}` = 业务闭环名，如 `requirement-plan-filing` |
| `--save-har` | 录制阶段把所有匹配请求（含 req/resp body）归档到 HAR |
| `--save-har-glob` | glob 过滤；`**/api/**` 只留 url 含 `/api/` 的请求 |

可选：复用登录态，避免每次重登。
```bash
npx playwright codegen --save-storage=auth.json <URL>   # 先录一次登录态
npx playwright codegen --load-storage=auth.json <URL>   # 后续复用
```

> 录制要点：走**完整真实的一条闭环**（如 列表→新增→详情→删除），覆盖关键提交/查询，避免无关点击。
> **无回放兜底，录什么 = 分析什么**，录歪了只能重录。

### ⚠️ glob 侦察（静默丢请求的坑）

`--save-har-glob='**/api/**'` 只抓 `/api/` 下的请求。若目标接口走**网关前缀**（`/gateway/`、`/gw/`）、
**微服务前缀**、`/graphql`、BFF 等，会被**静默丢弃**。录前先开浏览器 DevTools Network 看几条真实请求，
确认前缀后再定 glob（如 `**/{api,gateway}/**` 或更宽 `**/*` 然后在解析阶段过滤）。

## 2. 解析 HAR → 两段式接口 TXT

```bash
python scripts/parse_har.py {前缀}/{name}_runtimeflow_api_requests.har
# 仅出摘要不出明细 / 调整明细截断阈值：
python scripts/parse_har.py <har> --summary-only
python scripts/parse_har.py <har> --max-detail-len 4000
```

产出（与 HAR 同目录）：

| 文件 | 内容 | 加载策略 |
|------|------|----------|
| `{name}_runtimeflow_api_requests.txt` | **摘要**：接口种子（去重）+ 时序清单（`idx. [status] METHOD path`） | **默认加载** |
| `{name}_runtimeflow_api_details.txt` | **明细**：每条 req/resp body（脱敏+截断），按序号对齐摘要 | **按需加载** |

> 解析时已对敏感 header/body 字段脱敏（见 [redaction-rules.md](redaction-rules.md)）；HAR 含完整明文，**不入库**。

## 3. 常见问题

| 现象 | 处理 |
|------|------|
| TXT 里 0 条 /api/ 请求 | glob 没匹配到真实前缀 → 重录，调 `--save-har-glob`（见 §1 侦察） |
| 明细 body 被截断 | 调 `--max-detail-len`，或直接查 HAR 原文 |
| 接口太多、含埋点噪声 | 录制时收紧 glob，或解析后人工剔除非业务接口 |
| 登录态每次失效 | `--save-storage` 录一次，`--load-storage` 复用 |
| 缺响应 body | 部分响应非 JSON / 未被记录 → 查 HAR `content`；属正常 |
