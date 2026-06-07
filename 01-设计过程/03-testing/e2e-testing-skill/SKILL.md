---
name: e2e-testing
description: >
  端到端自动化测试 Skill。基于 playwright-cli 驱动真实浏览器，对任意 Web 应用
  （Vue / React / 传统多页等）执行全链路 E2E 功能验收测试。
  当用户要求执行"E2E测试"、"端到端测试"、"自动化功能测试"、"回归测试"、
  "验收测试"时触发。消费上游 spec-design 的验收标准(AC)作为测试依据，
  产出测试用例、截图凭证、回归脚本和自包含 HTML 报告。
  内置 5 阶段工作流："学习分析 → 用例设计 → 逐模块执行 → 归档保存 → 报告生成"。
---

# E2E Testing — 端到端自动化测试

> **触发条件**：当用户要求执行"E2E测试"、"端到端测试"、"自动化功能测试"、"回归测试"、"验收测试"时，自动激活此 Skill。
> **前置条件**：被测 Web 服务已启动，`baseline-init` Skill 的工程画像已就绪。

---

## 0. 元约束 (Meta-Constraints)

| #  | 约束                   | 说明                                                                                     |
| -- | ---------------------- | ---------------------------------------------------------------------------------------- |
| M1 | **真实驱动，禁止口述** | 严禁只做静态代码分析或口头描述。所有测试必须通过 `playwright-cli` 真实操作浏览器           |
| M2 | **snapshot 优先**      | 每次进入新页面或 DOM 变化后，必须先 `snapshot` 获取最新 ref。**绝不猜测 ref**             |
| M3 | **逐步执行**           | 每条 `playwright-cli` 命令独立执行并检查输出，不批量盲发                                  |
| M4 | **如实记录**           | 发现 Bug 即记录，不美化不隐瞒。Bug 回溯至上游 Skill 修复                                 |
| M5 | **模板驱动**           | 所有产出基于 `templates/` 模板生成，保证格式一致性                                        |
| M6 | **上下文隔离**         | 每个模块测试独立执行，模块间仅通过数据依赖链串联                                          |
| M7 | **技术栈无关**         | 测试操作的是浏览器渲染后的 DOM，不依赖特定前端框架。源码仅用于辅助理解                    |

---

## 1. 输入契约 (Input Contract)

> 三层加载策略，避免上下文过载。

### 常驻文档 (Always Loaded)

| 文档                       | 来源 Skill    | 用途                                               |
| -------------------------- | ------------- | -------------------------------------------------- |
| `docs/analysis/agent.md`   | baseline-init | 工程画像：技术栈、框架版本、目录结构、依赖分析     |
| `docs/system_overview.md`  | baseline-init | 系统全貌、模块关系与文档索引                       |

### 按需文档 (Stage-Triggered)

| 文档                                          | 触发阶段  | 加载方式                                                      |
| --------------------------------------------- | --------- | ------------------------------------------------------------- |
| `docs/design/*.md` 或其他设计文档              | Stage 1   | 提取业务模型与架构                                            |
| `docs/spec/{change}/specs/*.md`（若存在）      | Stage 2   | 提取验收标准 (AC) 作为用例设计依据                            |
| 前端页面/组件源码                              | Stage 1   | 根据 `agent.md` 技术栈信息，定位源码目录提取路由、表单、校验  |
| `references/playwright_commands.md`            | Stage 3   | 遇到命令疑问时按需查阅                                       |
| `references/snapshot_strategy.md`              | Stage 3   | ref 失效时查阅恢复策略                                       |
| `references/e2e_checklist.md`                  | Stage 5   | 生成报告时对照审查                                            |

---

## 2. 核心工作流 (Core Workflow)

> ⚠️ **强制顺序执行** — 1 → 2 → 3 → 4 → 5，前一阶段未完成不得进入下一阶段。

### 阶段 1：学习分析 (Context Learning)

**目标**：理解被测系统的工程结构、业务模型和页面结构，输出测试策略。

| 项目     | 内容                                                                                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **动作** | ① 读取 `agent.md` 获取工程画像（技术栈、框架、目录结构）→ ② 读取 `system_overview.md` 和设计文档理解业务模型 → ③ 根据技术栈信息定位并扫描页面/组件源码，提取路由、表单、API、校验逻辑 → ④ 读取 `playwright-cli` 操作手册 |
| **产出** | 内部测试策略摘要（指导后续阶段）                                                                                                                                         |
| **验收** | 摘要包含：被测系统名称、技术栈（来自 agent.md）、测试范围、模块依赖链、环境信息、每模块预估用例数                                                                        |

**测试策略摘要格式**：

```
【测试策略摘要】
- 被测系统：{系统名称}
- 前端技术栈：{Vue 3 + Element Plus / React 18 + Ant Design / 传统多页 HTML / ...}
- 测试范围：{模块1(路由路径), 模块2(路由路径), ...}
- 模块依赖链：{如：模块A → 模块B → 模块C（正向用例按此顺序执行）}
- 测试环境：{Base URL，如 http://localhost:5173 / http://localhost:3000}
- 用例预估：{模块1: 正向x + 逆向y, ...}
```

**Checkpoint**：输出策略摘要，确认理解无误后方可进入阶段 2。

---

### 阶段 2：用例设计 (Test Case Design)

**目标**：按模块输出独立的 Markdown 用例文件。

| 项目     | 内容                                                                     |
| -------- | ------------------------------------------------------------------------ |
| **动作** | 基于 Stage 1 分析 + 验收标准（若有 `specs/*.md`），为每个模块编写用例文件 |
| **产出** | `test-reports/cases/TC_{序号}_{模块名}.md`                               |
| **模板** | [`templates/test_case.md`](templates/test_case.md)                       |

**用例设计原则**：

1. 每个模块至少覆盖 3 个用例：页面加载、完整正向流程、空表单拦截
2. 逆向用例覆盖：必填为空、格式非法、边界值（超长字符串）、取消操作
3. 用例之间标注依赖关系（如 "B-P01 依赖 A-P01 创建的数据"）
4. 截图编号全局递增：`{两位序号}_{模块简称}_{场景}.png`

**Checkpoint**：用例文件创建完成后，汇报用例总数和覆盖情况。

---

### 阶段 3：逐模块执行 (Module Execution)

**目标**：按模块依赖链，逐步执行 `playwright-cli` 命令，每步截图取证。

| 项目     | 内容                                                               |
| -------- | ------------------------------------------------------------------ |
| **动作** | 打开浏览器 → 按依赖链逐模块执行用例 → 每个关键节点截图 → 关闭浏览器 |
| **工具** | `playwright-cli`（通过 `run_command` 执行）                         |
| **产出** | `test-reports/screenshots/*.png`                                    |

**标准操作循环**：

```bash
# A. 导航
playwright-cli goto {URL}

# B. 快照（获取 ref）
playwright-cli snapshot

# C. 交互（使用 snapshot 确认的 ref）
playwright-cli fill {ref} "内容"
playwright-cli click {ref}
playwright-cli select {ref} "选项"

# D. 截图
playwright-cli screenshot --filename=test-reports/screenshots/{NN}_{模块}_{场景}.png
```

**SPA 路由导航说明**：

> 对于 Vue/React 等 SPA 应用，页面切换通常不会刷新整个页面。Agent 可以：
> - 直接导航：`playwright-cli goto {BASE_URL}/#/path` （Hash 路由）或 `{BASE_URL}/path` （History 路由）
> - 通过点击导航菜单/Tab 等 UI 元素切换路由
> - 路由切换后**必须重新 `snapshot`**，因为 DOM 已变化

**弹窗 / 消息提示处理**：

| 类型                                      | 处理流程                                              |
| ----------------------------------------- | ----------------------------------------------------- |
| 原生 `alert()` / `confirm()`              | ①记录文案 → ②`dialog-accept`/`dialog-dismiss` → ③截图 |
| UI 框架 Toast/Message（Element Plus 等）  | 不阻塞 DOM，直接截图即可捕获提示内容                  |
| UI 框架 Modal 弹窗                        | 先 `snapshot` 获取弹窗内元素 ref → 操作 → 截图        |
| 页面跳转/路由切换                         | 切换后必须重新 `snapshot` 获取新 ref                   |

**错误恢复**（详见 [`references/snapshot_strategy.md`](references/snapshot_strategy.md)）：

| 异常              | 处理                                                       |
| ----------------- | ---------------------------------------------------------- |
| `Ref eXX not found` | 重新 `snapshot`，用新 ref 重试                            |
| 页面超时          | 重新 `goto {URL}`                                          |
| 意外弹窗阻塞      | 截图 + `dialog-accept` 清除                                |
| SPA 路由渲染延迟  | `snapshot` 后检查快照内容是否就绪，若为空则等待后重试       |

**执行顺序**：

```
Phase 0:   创建目录 → mkdir -p test-reports/{cases,screenshots,scripts}
Phase 1:   开浏览器 → playwright-cli open {URL} + resize 1920 1080
Phase 2~N: 按依赖链逐模块执行（模块内：先正向 → 再逆向）
Phase End: playwright-cli close
```

**Checkpoint**：每个模块执行完毕后，汇报通过数/失败数/发现的 Bug。

---

### 阶段 4：归档保存 (Archiving)

**目标**：将执行过程中的命令序列保存为可回归的 `.sh` 脚本。

| 项目     | 内容                                                                                                       |
| -------- | ---------------------------------------------------------------------------------------------------------- |
| **产出** | `test-reports/scripts/run_{序号}_{模块名}.sh` + `run_all.sh`                                               |
| **模板** | [`templates/test_script.sh`](templates/test_script.sh)、[`templates/run_all.sh`](templates/run_all.sh)     |

**脚本要求**：

1. 每条 `click/fill/select` 后注释标注 ref 含义（如 `# ref: "保存"按钮`）
2. 每条 `snapshot` 后标注 `# ★ 此处刷新ref（回归时需重新确认）`
3. `run_all.sh` 按模块依赖顺序串联，模块间 `sleep 2`
4. 脚本顶部标注 `BASE_URL` 变量，方便切换环境

**Checkpoint**：列出所有脚本文件及其用例覆盖范围。

---

### 阶段 5：报告生成 (Report Generation)

**目标**：生成单个自包含 HTML 报告（截图 Base64 内嵌，直接浏览器打开）。

| 项目     | 内容                                                                            |
| -------- | ------------------------------------------------------------------------------- |
| **产出** | `test-reports/test-report.html`                                                 |
| **模板** | [`templates/test_report.html`](templates/test_report.html)                      |
| **审查** | 对照 [`references/e2e_checklist.md`](references/e2e_checklist.md) 检查完整性    |

**报告 5 个板块**：

| 板块           | 内容                                                |
| -------------- | --------------------------------------------------- |
| 1. 测试概览    | 系统名称、技术栈、时间、环境、用例统计、通过率      |
| 2. 业务理解    | 3-5 句概括核心业务模型                              |
| 3. 执行明细    | 按模块分组表格，✅通过 / ❌失败                      |
| 4. Bug 清单    | 问题ID / 级别 / 页面 / 描述 / 复现步骤 / 修复建议  |
| 5. 截图画廊    | 按模块分栏，Base64 内嵌，点击放大                   |

**样式**：浅灰底 + 白色卡片、斑马纹表格、颜色徽章、顶部锚点导航。

**Checkpoint**：告知文件路径和通过率数据。

---

## 3. 闭环验证 (Closed-Loop Verification)

```
测试发现前端 Bug   ──────────▶ 回溯至 spec-frontend-dev 修复
测试发现后端 Bug   ──────────▶ 回溯至 spec-backend-dev 修复
测试发现需求缺陷   ──────────▶ 回溯至 spec-design 修改 Specs
```

**铁律**：测试只**发现并记录**问题，修复由上游 Skill 执行。严禁在测试层修改业务代码。

---

## 4. 产出物清单 (Deliverables)

```
{工程根目录}/
└── test-reports/
    ├── cases/                    # 阶段 2
    │   ├── TC_01_{模块名}.md
    │   └── ...
    ├── screenshots/              # 阶段 3
    │   ├── 01_{模块}_{场景}.png
    │   └── ...
    ├── scripts/                  # 阶段 4
    │   ├── run_01_{模块名}.sh
    │   └── run_all.sh
    └── test-report.html          # 阶段 5
```

---

## 5. 引用与模板 (References & Templates)

### 模板 (`templates/`)

| 模板路径                    | 用途                   | 对应阶段 |
| --------------------------- | ---------------------- | -------- |
| `templates/test_case.md`    | 测试用例 Markdown 模板 | 阶段 2   |
| `templates/test_script.sh`  | 模块测试脚本模板       | 阶段 4   |
| `templates/run_all.sh`      | 全量回归入口模板       | 阶段 4   |
| `templates/test_report.html`| HTML 报告骨架模板      | 阶段 5   |

### 引用 (`references/`)

| 引用路径                              | 用途                        | 加载时机       |
| ------------------------------------- | --------------------------- | -------------- |
| `references/playwright_commands.md`   | playwright-cli 命令速查     | 阶段 3 按需    |
| `references/snapshot_strategy.md`     | ref 管理与错误恢复          | 阶段 3 遇错时  |
| `references/e2e_checklist.md`         | E2E 审查清单（持续沉淀）    | 阶段 5         |
