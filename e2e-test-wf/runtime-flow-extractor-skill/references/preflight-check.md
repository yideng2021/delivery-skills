# 前置确认闸门（强制·首步）

> 执行本 skill 的**第一步**。先自检 + 收集必要输入；任何不满足项**一次性列全、转人工确认，
> 绝不反复轮询/反复重检**。仅 PASS（或已确认的 CONFIRM）才进入工序 ①。

## 三态裁决

| 态 | 含义 | 动作 |
|----|------|------|
| **PASS** | 自检全绿 + 输入齐全 | 进入工序 ① 录制 |
| **CONFIRM** | 有可降级/需用户拍板项（如索引语义检索不可用、是否接受 grep-only 落锚） | **暂停**，列出待确认项，等用户明确答复后再继续 |
| **BLOCK** | 有硬缺失（依赖未装 / 索引未建 / 必填输入缺） | **停止**，输出完整清单转人工；补齐后重新触发，**不自行轮询重试** |

## 检查项

### A. 环境自检（只检查，不安装——见 [redaction & capture-commands §0](capture-commands.md)）

| 项 | 命令 | 缺失裁决 |
|----|------|----------|
| Node ≥ 18 | `node -v` | BLOCK |
| @playwright/test | `npm ls @playwright/test` | BLOCK（提示用户 `npm i -D @playwright/test`） |
| chromium 内核 | 查 `ms-playwright/chromium-*` 目录 | BLOCK（提示用户 `npx playwright install chromium`） |
| Python 3 | `python --version` | BLOCK |

### B. 代码索引自检（第 ③ 步代码落锚依赖，多仓须逐一确认）

| 项 | 检查 | 缺失/异常裁决 |
|----|------|----------|
| CodeGraph 索引（前端 **和** 后端） | `codegraph_status(projectPath=<前端>)` + `codegraph_status(projectPath=<后端>)` 各自非空 | **BLOCK**（提示建索引）；用户可显式选 **grep-only 降级落锚** → CONFIRM |
| GitNexus 索引 | `list_repos` 确认前端仓 + 后端仓**都在列**且已 analyze | BLOCK；同上可降级 |
| **多仓 targeting** | `list_repos` 可能含多个仓（本例 3 个）→ 记录前端/后端各自 **repo 名 + path** | 记入清单，落锚查询带 `repo`/`projectPath`（见 code-correlation §2） |
| GitNexus embeddings | 若 =0：语义检索不可用 | CONFIRM（仅用社区/路由/grep，请用户知悉） |

> 落锚需要**前端索引(组件)** 与 **后端索引(handler)** 两者；缺哪个则对应侧落锚降级为 grep-only。

### C. 必填输入（向用户收集，缺即 BLOCK）

| 输入 | 用途 | 示例 |
|------|------|------|
| **前端工程目录** | 第 ③ 步 grep 路由/组件/文案/接口调用处 | `D:\proj\xxx-web` |
| **后端工程目录** | 第 ③ 步 grep handler、CodeGraph 顺链落锚 `@backend` | `D:\proj\xxx-service` |
| **业务流程名称** `{name}` | 命名产物 + 业务闭环边界 | `requirement-plan-filing` |
| **录制起始 URL** | codegen 入口 | `https://req.xxx.com/#/login` |

> 业务流程名称用 kebab-case；同时**与用户口头确认这条业务闭环的边界**（含哪些子过程，不变量 1/R7）。

### D. 可选外部输入（提供则用，不提供走默认；零跨 skill 依赖）

| 输入 | 用途 | 缺失时 |
|------|------|--------|
| 业务域划分（任意来源的域图/清单） | 第 ③ 步业务域归属直接采用 | 默认用 GitNexus 社区 ∩ 包结构现推 |

> 本 skill **只认"输入"，不认"某 skill 的产物"** —— 绝不自动读取 arch-baseline 的 `.brownfield/` 等他方产物（O4 解耦）。
> 用户可把任意来源的域划分作为输入喂入；是否来自 arch-baseline 与本 skill 无关。

## 待人工确认清单（BLOCK/CONFIRM 时输出此格式）

```
【前置确认清单 — 待人工处理（请一次性补齐，我不重复轮询）】

A. 环境
  [✓] Node v20.11
  [✗] @playwright/test 未安装        → 请执行: npm i -D @playwright/test
  [✗] chromium 内核缺失              → 请执行: npx playwright install chromium
  [✓] Python 3.11

B. 代码索引（落锚依赖，前后端两仓）
  [✓] CodeGraph 前端索引就绪 (projectPath=<前端>)
  [✓] CodeGraph 后端索引就绪 (projectPath=<后端>)
  [?] GitNexus embeddings=0          → 语义检索不可用，仅用社区/路由，可否？
  记录仓名: 前端=<repo>, 后端=<repo>（落锚查询需带 repo/projectPath）

C. 待提供输入
  [ ] 前端工程目录：________
  [ ] 后端工程目录：________
  [ ] 业务流程名称（kebab-case）：________
  [ ] 录制起始 URL：________

D. 可选外部输入
  [ ] 业务域划分（任意来源，缺则默认 GitNexus 现推）：________

裁决：CONFIRM（B embeddings=0 待确认）+ C 未提供。补齐/确认后重新触发本 skill。
```

## 纪律

- **不重复检查**：一轮自检后即给结论；缺失项汇总成上面一份清单，转人工，**不在残缺前提下继续、不自行轮询重检**。
- **不代装**：环境/索引缺失只提示对应命令，由用户执行。
- **闸门不可跳过**：未 PASS / 未确认 CONFIRM，不得进入录制。
