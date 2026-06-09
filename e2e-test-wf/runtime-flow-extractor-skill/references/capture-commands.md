# 命令速查：codegen / 回放 / trace

> 官方 Playwright CLI（`npx playwright`），非 e2e-testing-skill 里的逐步 `playwright-cli`。

## 0. 环境检查（只检查，严禁随意安装）

> 本步**仅做环境检查**。任何缺失项一律**停下并提示用户自行处理**，
> 绝不擅自 `npm i` / `playwright install` 或改动用户环境。

逐项检查，全部 ✅ 才进入第 1 步：

```bash
# ① Node 是否可用（建议 >= 18）
node -v

# ② @playwright/test 是否已安装
npm ls @playwright/test

# ③ chromium 浏览器内核是否已下载（直接查文件，不调 install）
#    Linux/macOS:
ls -la ~/.cache/ms-playwright/chromium-*/ > /dev/null 2>&1 && echo "✅ chromium 就绪" || echo "❌ chromium 缺失"
#    Windows:
if exist "%USERPROFILE%\AppData\Local\ms-playwright\chromium-*" (echo ✅ chromium 就绪) else (echo ❌ chromium 缺失)
```

检查结果裁决：

| 现象 | 处置 |
|------|------|
| `node -v` 报错 / 版本过低 | **停止**，提示用户安装/升级 Node 后重来 |
| `@playwright/test` 未安装 | **停止**，提示用户在项目中执行 `npm i -D @playwright/test`（由用户决定，不代为执行） |
| chromium 缺失 | **停止**，提示用户执行 `npx playwright install chromium`（由用户决定，不代为执行） |
| 全部就绪 | 进入第 1 步 |

> 红线：缺什么**告知用户对应命令并由用户自行执行**，本 skill 不主动安装任何依赖或浏览器。

## 1. 录制（人走一遍真实业务流）

```bash
# 打开目标站点开始录制；操作完成后关闭浏览器，脚本自动生成
npx playwright codegen http://localhost:8080 -o flows/<flow-name>/raw.spec.ts

# 指定语言（默认 TS）/ 复用已登录态
npx playwright codegen --target playwright-test http://localhost:8080
npx playwright codegen --load-storage=auth.json http://localhost:8080   # 跳过登录
npx playwright codegen --save-storage=auth.json http://localhost:8080   # 录登录态备用
```

> 录制要点：走**完整、真实**的一条业务主线；尽量覆盖关键提交/查询；避免无关点击。

## 2. 插桩

把 `raw.spec.ts` 转写为 `runner.spec.ts`（规则见 [attribution-strategy.md](attribution-strategy.md)）。
把 `templates/capture.ts` 与 `templates/playwright.config.ts` 复制到流程目录。

## 3. 回放抓取

```bash
# 在流程目录下运行；产出 events.json + network.har + trace（test-results/）
npx playwright test runner.spec.ts --config=playwright.config.ts

# 有头观察 / 调试
npx playwright test runner.spec.ts --headed
npx playwright test runner.spec.ts --debug
```

产物：
- `events.json` —— capture.ts 落盘，**图文同源唯一事实来源**
- `network.har` —— 全量流量备份（body 内嵌）
- `test-results/**/trace.zip` —— 视觉审计兜底

## 4. 复盘 / 核对

```bash
# 打开 trace viewer：逐步回看截图、DOM、network、console
npx playwright show-trace test-results/<...>/trace.zip

# 用浏览器打开 HAR（或 VS Code HAR 插件）核对接口 body
```

## 5. 常见问题

| 现象 | 处理 |
|------|------|
| events.json 里接口缺 body | 该响应非 JSON 或已被消费 → 查 network.har 原始 body |
| `step: -1` 桶有接口 | 首个 `cap.step()` 太晚 → 在 goto 前补一步 |
| 接口太多噪声 | 收紧 `apiPattern`（如 `/\/api\/v1\//`）过滤埋点/静态资源 |
| 登录态每次失效 | 用 `--save-storage` 录一次登录态，回放 `contextOptions.storageState` 复用 |
| networkidle 超时 | 长轮询/SSE 页面改用 `waitForResponse(/path/)` 精确等待 |
