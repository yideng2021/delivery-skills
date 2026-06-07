# 基于 playwright-cli 的端到端自动化测试 Skill 设计方案

## 一、设计背景与目标

### 1.1 问题分析

在使用 AI Agent（如 Cursor、Antigravity、OpenCode 等）驱动 `playwright-cli` 执行 Web 端到端（E2E）测试的过程中，我们发现以下核心问题：

| 问题 | 描述 | 影响 |
|:---|:---|:---|
| **流程不标准** | 每次测试都需要在对话中用大段提示词引导 Agent 的行为 | 效率低，结果不稳定 |
| **ref 脆弱性** | `playwright-cli snapshot` 产出的 `eXX` 引用在页面 DOM 变化后会失效 | 脚本可回归性差 |
| **产出零散** | 截图、用例、脚本、报告分散在不同位置，缺乏统一目录规范 | 不便于回归和协作 |
| **知识未沉淀** | Agent 每次都要从零学习 playwright-cli 操作方式 | 重复学习浪费 Token |
| **报告不可读** | 测试结果仅以 Markdown 输出在对话中，无法独立分享 | 可视化交付能力弱 |

### 1.2 设计目标

将端到端自动化测试的完整 SOP **固化为一个标准 Skill**，使任何 AI Agent 在拿到 Skill 后能够：

1. **零提示词启动**：只需一句话指令（如 "对 XX 模块执行 E2E 测试"），Agent 自动完成从学习→用例→执行→报告的全流程
2. **跨智能体复用**：兼容 Cursor MCP、Claude Code Skills、Antigravity Skills、OpenCode 等主流平台
3. **产出标准化**：每次执行产出统一结构的用例文件、截图凭证、可回归脚本、HTML 报告
4. **知识可沉淀**：测试中发现的 Bug、页面结构特征等知识自动积累

---

## 二、Skill 架构设计

### 2.1 Skill 目录结构

```
.ai/skills/e2e-testing/                  # Skill 根目录（跨平台兼容路径）
│
├── SKILL.md                             # 🔑 核心：Skill 主指令文件
│
├── references/                          # 参考手册（按需加载，节省Token）
│   ├── playwright-commands.md           # playwright-cli 完整命令速查
│   ├── snapshot-strategy.md             # ref 管理与错误恢复策略
│   ├── report-template.md              # HTML 报告模板规范
│   └── examples/                        # 参考示例
│       ├── example-test-case.md         # 用例模板示例
│       └── example-script.sh            # 脚本模板示例
│
├── templates/                           # 可直接复用的模板文件
│   ├── test-case.md.tpl                # 用例 Markdown 模板
│   ├── test-script.sh.tpl              # Bash 测试脚本模板
│   ├── run-all.sh.tpl                  # 全量回归入口模板
│   └── report.html.tpl                 # HTML 报告骨架模板
│
└── scripts/                            # 辅助工具脚本
    ├── init-workspace.sh               # 初始化测试工作空间
    ├── generate-report.sh              # 将截图 Base64 嵌入生成 HTML 报告
    └── collect-screenshots.sh          # 收集截图并生成清单
```

### 2.2 跨平台兼容性设计

不同 AI IDE 的 Skill 加载路径不同，本 Skill 通过以下策略实现跨平台兼容：

| 平台 | Skill 路径约定 | 兼容方式 |
|:---|:---|:---|
| **Claude Code** | `.claude/skills/{skill-name}/SKILL.md` | 原生支持 YAML frontmatter 格式 |
| **Cursor** | `.cursor/rules/*.mdc` 或 `.cursorrules` | 将 SKILL.md 核心内容提取为 `.mdc` 规则文件 |
| **Antigravity** | `.agents/workflows/*.md` | 将 Skill 注册为 Workflow，通过 frontmatter 触发 |
| **OpenCode** | `.opencode/agents/*.md` | 同 Markdown 指令格式，直接兼容 |
| **通用方案** | `.ai/skills/{skill-name}/SKILL.md` | 约定在 `.ai/` 下统一存放，所有平台可通过 `view_file` 手动加载 |

**推荐做法**：采用 `.ai/skills/` 通用目录，并为各平台提供适配脚本或符号链接。

### 2.3 核心设计原则

| 原则 | 说明 |
|:---|:---|
| **分层加载** | SKILL.md 只包含核心流程指令，详细参考手册放在 `references/` 中按需加载，避免一次性消耗大量 Token |
| **模板驱动** | 用例、脚本、报告等产出物均基于 `templates/` 中的模板生成，确保格式一致 |
| **声明式触发** | 通过 YAML frontmatter 中的 `description` 字段实现意图匹配，Agent 可自动识别何时激活此 Skill |
| **反馈闭环** | 每个 Stage 执行后有明确的检查点（Checkpoint），失败时有恢复策略 |
| **产出独立** | 所有测试产出保存在 `{工程根目录}/test-reports/` 下，与业务代码完全隔离 |

---

## 三、Skill 核心指令文件设计（SKILL.md）

### 3.1 YAML Frontmatter

```yaml
---
name: e2e-testing
description: |
  基于 playwright-cli 的端到端自动化测试 Skill。
  当用户要求对 Web 应用执行 E2E 测试、功能验收测试、回归测试时自动激活。
  支持：测试用例设计、浏览器自动化执行、截图取证、脚本归档、HTML报告生成。
  触发关键词：E2E测试、端到端测试、自动化测试、功能测试、回归测试、playwright测试
allowed-tools: Bash(playwright-cli:*), view_file, write_to_file, run_command
---
```

### 3.2 SKILL.md 正文结构设计

SKILL.md 的正文按以下 6 大板块组织，总长度控制在 **300 行以内**（含代码块），确保 Agent 一次性读取不超载：

```
SKILL.md 正文结构
├── § 角色定义与行为约束
├── § 前置依赖检查
├── § 五阶段工作流总览
├── § 各阶段详细指令
│   ├── Stage 1: 学习分析（工程理解 + 测试策略）
│   ├── Stage 2: 用例设计（按模块输出 Markdown 用例）
│   ├── Stage 3: 逐模块执行（playwright-cli 操作规范）
│   ├── Stage 4: 归档保存（脚本 + 截图 + 日志）
│   └── Stage 5: 报告生成（HTML 自包含报告）
├── § 关键约束清单（表格形式，一屏可览）
└── § 参考手册索引（指向 references/ 下的详细文档）
```

### 3.3 分层加载策略

为节省 Token，SKILL.md 采用**引用式设计**，核心文件只给出精简指令，详细说明通过 `references/` 按需查阅：

```markdown
## playwright-cli 操作速查

基础流程：`open → resize → goto → snapshot → fill/click/select → screenshot → close`

> 📖 完整命令集详见：[references/playwright-commands.md](references/playwright-commands.md)
> 📖 ref 管理与错误恢复详见：[references/snapshot-strategy.md](references/snapshot-strategy.md)
```

Agent 在首次执行时读取 SKILL.md 主体（~300 行），仅在遇到特定问题时才 `view_file` 加载对应的 reference 文档。

---

## 四、各阶段详细设计

### 4.1 Stage 1：学习分析

**目标**：理解被测系统的工程结构、业务模型和页面结构，输出测试策略。

**输入**：
- 用户指令（如"对规则配置模块执行 E2E 测试"）
- 工程目录结构（通过 `list_dir` / `find_by_name` 探索）

**处理流程**：

```
1. 探索工程结构
   ├── 扫描 docs/ 目录 → 阅读设计文档（理解业务模型）
   ├── 扫描 src/ → 定位前端页面文件（HTML/Vue/React）
   └── 扫描配置文件 → 确认 Base URL 和端口

2. 阅读页面源码
   ├── 提取表单字段、按钮、API 接口
   ├── 识别页面间跳转关系
   └── 找出校验逻辑（必填项、格式校验）

3. 输出测试策略摘要
   ├── 被测系统名称
   ├── 测试范围（模块列表 + 页面 URL）
   ├── 模块依赖链（如：A → B → C）
   ├── 每模块用例数预估
   └── 测试环境信息（URL、窗口尺寸等）
```

**Checkpoint**：Agent 必须在内部或对话中输出测试策略摘要，确认理解无误后才能进入 Stage 2。

### 4.2 Stage 2：用例设计

**目标**：每个模块输出一个独立的 Markdown 用例文件。

**产出规范**：

```
test-reports/cases/
  ├── TC_01_{模块名}.md      # 每个文件 = 1 个模块的完整用例集
  ├── TC_02_{模块名}.md
  └── ...
```

**单文件模板**（详细模板见 `templates/test-case.md.tpl`）：

```markdown
# 测试模块：{模块中文名}

## 模块信息
| 项目 | 内容 |
|:--|:--|
| 业务定位 | {描述} |
| 页面路径 | {列表页 URL} → {配置页 URL} |
| 前置依赖 | {依赖模块/数据} |

## 正向用例
### {MODULE}-P01：{场景名}
| 步骤 | 操作 | 期望 | 截图 |
|:--:|:--|:--|:--|
| 1 | ... | ... | {XX}_{模块}_{场景}.png |

## 逆向用例
### {MODULE}-N01：{场景名}
（同上格式）
```

**设计原则**：
1. 每个模块至少覆盖 3 个用例：列表页加载、完整创建流程、空表单拦截
2. 逆向用例覆盖：必填为空、格式非法、边界值、取消操作
3. 跨模块依赖必须标注（如"依赖 FC-P01 创建的数据"）
4. 截图编号在所有模块间全局递增

**Checkpoint**：用例文件创建完成后，Agent 应简要告知用户用例总数和覆盖情况。

### 4.3 Stage 3：逐模块执行

**目标**：按模块依赖链顺序，逐步执行 playwright-cli 命令，每步截图取证。

**核心操作循环（每个页面）**：

```bash
# A. 导航
playwright-cli goto {URL}

# B. 快照（获取 ref；这是一切操作的前提）
playwright-cli snapshot

# C. 交互（使用 snapshot 中确认的 ref）
playwright-cli fill {ref} "内容"
playwright-cli click {ref}
playwright-cli select {ref} "选项"

# D. 截图
playwright-cli screenshot --filename=test-reports/screenshots/{NN}_{模块}_{场景}.png
```

**关键纪律（MUST）**：

| # | 规则 | 说明 |
|:--:|:---|:---|
| 1 | **snapshot 优先** | 每次进入新页面或 DOM 变化后，必须先 `snapshot`。**绝不猜测 ref** |
| 2 | **单步执行** | 每条 `playwright-cli` 命令独立执行并检查输出，不批量盲发 |
| 3 | **弹窗先记后处理** | alert/confirm 出现时：①记录文案 → ②处理 → ③截图 |
| 4 | **ref 失效时重刷** | 遇到 `Ref eXX not found` → 重新 `snapshot` → 用新 ref 重试 |
| 5 | **如实记录** | 发现 Bug 即记录，不美化不隐瞒 |

**执行顺序**：

```
Phase 0: 环境准备 → mkdir -p test-reports/{cases,screenshots,scripts}
Phase 1: 打开浏览器 → playwright-cli open {URL} + resize 1920 1080
Phase 2~N: 按模块依赖链顺序逐一执行（每个模块内部：先正向 → 再逆向）
Phase Final: playwright-cli close
```

**Checkpoint**：每个模块执行完毕后，Agent 应汇总该模块的执行结果（通过/失败/发现的问题）。

### 4.4 Stage 4：归档保存

**目标**：将执行过程中的全部产出归档到标准化目录。

**目录结构**：

```
{工程根目录}/
└── test-reports/
    ├── cases/                     # Stage 2 用例文件
    ├── screenshots/               # Stage 3 截图
    ├── scripts/                   # 可回归脚本
    │   ├── run_01_{模块}.sh
    │   ├── run_02_{模块}.sh
    │   ├── ...
    │   └── run_all.sh            # 一键全量回归入口
    └── test-report.html          # Stage 5 报告
```

**脚本设计规范**：

每个 `.sh` 脚本记录的是**本次测试实际成功执行过的 playwright-cli 命令序列**，要求：

```bash
#!/bin/bash
# ====================================================================
# 模块：{模块名称} 自动化回归测试脚本
# 生成时间：{YYYY-MM-DD HH:MM:SS}
# 用例覆盖：{FC-P01, FC-N01, ...}
# ====================================================================
set -e

BASE_URL="http://localhost:8080"
SHOT_DIR="test-reports/screenshots"

echo "=== 模块测试开始：{模块名} ==="

playwright-cli open "${BASE_URL}/{路径}"
playwright-cli resize 1920 1080

# [FC-P01] 列表页初始状态
echo "  [FC-P01] 截图列表页初始状态"
playwright-cli snapshot                          # ★ 此处刷新ref（ref可能因DOM变化而改变）
playwright-cli screenshot --filename="${SHOT_DIR}/01_因子配置_列表页初始状态.png"

# [FC-P01] 点击新增因子
playwright-cli click e141                        # ref来自snapshot: "新增因子"按钮
playwright-cli snapshot                          # ★ 此处刷新ref

playwright-cli fill e118 "测试因子名称"           # ref来自snapshot: "因子名称"输入框
playwright-cli fill e130 "业务描述文本"           # ref来自snapshot: "业务描述"文本域
playwright-cli click e246                        # ref来自snapshot: "保存配置"按钮
playwright-cli dialog-accept                     # 处理保存成功alert
playwright-cli screenshot --filename="${SHOT_DIR}/02_因子配置_保存成功.png"

playwright-cli close
echo "=== 模块测试完成：{模块名} ==="
```

**关键要求**：
1. 每个 `snapshot` 后标注 `# ★ 此处刷新ref`
2. 每个 `click/fill/select` 后标注 `# ref来自snapshot: {元素含义}`
3. `run_all.sh` 按模块依赖顺序串联执行，模块间插入 `sleep 2` 避免端口冲突

**Checkpoint**：脚本文件生成后，Agent 应列出所有脚本文件及其用例覆盖范围。

### 4.5 Stage 5：报告生成

**目标**：生成单个自包含 HTML 报告文件（截图以 Base64 内嵌，可直接浏览器打开）。

**文件路径**：`test-reports/test-report.html`

**报告板块**：

```
╔═══════════════════════════════════════════════════╗
║  1. 测试概览                                       ║
║     → 系统名称、时间、环境                         ║
║     → 总用例 / 通过 / 失败 / 通过率进度条          ║
╠═══════════════════════════════════════════════════╣
║  2. 业务逻辑理解                                   ║
║     → 3-5句概括核心模型与配置链路                  ║
╠═══════════════════════════════════════════════════╣
║  3. 用例执行结果明细                               ║
║     → 按模块分组表格（ID/类型/名称/结果/备注）     ║
║     → ✅ 绿色通过 / ❌ 红色失败                    ║
╠═══════════════════════════════════════════════════╣
║  4. 发现问题清单（Bug List）                       ║
║     → 问题ID / 严重级别 / 页面 / 描述 / 复现步骤  ║
║     → 修复建议                                     ║
╠═══════════════════════════════════════════════════╣
║  5. 截图凭证画廊                                   ║
║     → 按模块分栏，点击可放大查看                   ║
║     → 每张标注：文件名、用例ID、操作描述           ║
╚═══════════════════════════════════════════════════╝
```

**Base64 嵌入方法**（报告生成脚本 `scripts/generate-report.sh` 负责）：

```bash
# Bash: 将截图转为 Base64 并嵌入 <img>
for f in test-reports/screenshots/*.png; do
  b64=$(base64 -w 0 "$f")
  echo "<img src=\"data:image/png;base64,$b64\" alt=\"$(basename $f)\" />"
done
```

```powershell
# PowerShell 等效方案
$bytes = [System.IO.File]::ReadAllBytes("test-reports/screenshots/01_xx.png")
$base64 = [Convert]::ToBase64String($bytes)
"<img src='data:image/png;base64,$base64' />"
```

**HTML 样式要求**：
- 浅灰底 + 白色卡片布局
- 表格斑马纹 + hover 高亮
- 通过/失败用醒目颜色徽章
- 顶部锚点导航
- 截图支持点击放大（lightbox）
- 底部标注生成时间

**Checkpoint**：报告生成后，Agent 应告知文件路径以及总结性的通过率数据。

---

## 五、references/ 参考文档设计

### 5.1 playwright-commands.md

**用途**：playwright-cli 完整命令速查手册
**内容概要**：

```
- Core Commands: open, goto, click, fill, select, snapshot, screenshot, close
- Navigation: go-back, go-forward, reload
- Keyboard: press, keydown, keyup
- Mouse: mousemove, mousedown, mouseup, mousewheel
- Dialog: dialog-accept, dialog-dismiss
- Tabs: tab-list, tab-new, tab-close, tab-select
- Save: screenshot, pdf
- Storage: state-save, state-load, cookie-*, localstorage-*, sessionstorage-*
- Network: route, unroute
- DevTools: console, network, tracing-*
```

### 5.2 snapshot-strategy.md

**用途**：ref 管理策略与错误恢复手册
**核心内容**：

```
# ref 生命周期
- ref 在 snapshot 时生成，仅在当前 DOM 状态下有效
- 任何导致 DOM 变化的操作后，ref 可能失效
- 关键规则：操作前必须 snapshot，操作后应 snapshot

# 常见异常与恢复
| 异常 | 处理 |
| Ref eXX not found | 重新 snapshot，用新 ref 重试 |
| 页面超时 | 重新 goto 导航 |
| 弹窗阻塞 | dialog-accept/dismiss 清除后继续 |
| 元素不可见 | scroll 或 hover 使其进入视口后重试 |

# 脚本可维护性
- 脚本中的 ref 是"快照引用"，跨次运行必然失效
- 回归测试时需先 snapshot 获取新 ref 再替换
- 建议在脚本注释中记录 ref 对应的语义（如"保存按钮"）
```

### 5.3 report-template.md

**用途**：HTML 报告模板的详细规范（CSS 样式、DOM 结构、JavaScript lightbox 逻辑）
**Agent 在生成 `test-report.html` 时参照此文档**

### 5.4 examples/

- `example-test-case.md`：一个完整的用例文件样例
- `example-script.sh`：一个完整的模块测试脚本样例

---

## 六、templates/ 模板文件设计

### 6.1 test-case.md.tpl

```markdown
# 测试模块：{{MODULE_CN}} ({{MODULE_EN}})

## 模块信息

| 项目 | 内容 |
|:--|:--|
| 业务定位 | {{DESCRIPTION}} |
| 页面路径 | `{{LIST_URL}}` → `{{CONFIG_URL}}` |
| 前置依赖 | {{DEPENDENCIES}} |

---

## 正向用例

### {{MODULE_PREFIX}}-P01：{{SCENARIO_NAME}}

| 项目 | 内容 |
|:--|:--|
| 用例编号 | {{MODULE_PREFIX}}-P01 |
| 优先级 | {{PRIORITY}} |
| 前置条件 | {{PRECONDITION}} |

#### 测试步骤

| 步骤 | 操作描述 | 期望结果 |
|:--:|:--|:--|
| 1 | {{STEP_ACTION}} | {{EXPECTED_RESULT}} |

#### 截图时机
- 步骤{{N}}完成后：`{{SCREENSHOT_NAME}}`

---

## 逆向用例

### {{MODULE_PREFIX}}-N01：{{NEGATIVE_SCENARIO}}
（格式同上）
```

### 6.2 test-script.sh.tpl

```bash
#!/bin/bash
# ====================================================================
# 模块：{{MODULE_NAME}} 自动化回归测试脚本
# 生成时间：{{TIMESTAMP}}
# 用例覆盖：{{CASE_IDS}}
# ====================================================================
set -e

BASE_URL="{{BASE_URL}}"
SHOT_DIR="test-reports/screenshots"

echo "=== 模块测试开始：{{MODULE_NAME}} ==="

# 环境初始化
playwright-cli open "${BASE_URL}/{{ENTRY_PATH}}"
playwright-cli resize 1920 1080

# --- 用例区域（每个用例一个注释块）---
{{COMMANDS_BLOCK}}

# 清理
playwright-cli close
echo "=== 模块测试完成：{{MODULE_NAME}} ==="
```

### 6.3 run-all.sh.tpl

```bash
#!/bin/bash
# ====================================================================
# 全量回归测试入口
# 执行方式: bash test-reports/scripts/run_all.sh
# ====================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "╔══════════════════════════════════════╗"
echo "║   E2E 全量回归测试                    ║"
echo "╚══════════════════════════════════════╝"

{{#each MODULES}}
echo "▶ [{{@index}}/{{@total}}] {{MODULE_NAME}}"
bash "${SCRIPT_DIR}/run_{{MODULE_SEQ}}_{{MODULE_NAME}}.sh" || echo "  ❌ FAILED"
sleep 2
{{/each}}

echo "✅ 全量测试执行完毕"
```

---

## 七、scripts/ 辅助脚本设计

### 7.1 init-workspace.sh

```bash
#!/bin/bash
# 初始化测试工作空间目录结构
mkdir -p test-reports/{cases,screenshots,scripts}
echo "✅ 测试工作空间已初始化：test-reports/{cases,screenshots,scripts}"
```

### 7.2 generate-report.sh

**职责**：遍历 `test-reports/screenshots/` 中的所有 png 文件，将图片转为 Base64 编码，结合 HTML 模板骨架（`templates/report.html.tpl`）生成最终的 `test-reports/test-report.html`。

**核心逻辑**：

```bash
#!/bin/bash
# 生成自包含 HTML 报告
REPORT="test-reports/test-report.html"
SHOT_DIR="test-reports/screenshots"

# 1. 写入 HTML 头部
cat templates/report-header.html > "$REPORT"

# 2. 遍历截图生成画廊
echo "<div class='gallery'>" >> "$REPORT"
for f in "$SHOT_DIR"/*.png; do
  fname=$(basename "$f")
  b64=$(base64 -w 0 "$f")
  echo "<figure>" >> "$REPORT"
  echo "  <img src='data:image/png;base64,$b64' alt='$fname' />" >> "$REPORT"
  echo "  <figcaption>$fname</figcaption>" >> "$REPORT"
  echo "</figure>" >> "$REPORT"
done
echo "</div>" >> "$REPORT"

# 3. 写入 HTML 尾部
cat templates/report-footer.html >> "$REPORT"
echo "✅ 报告已生成：$REPORT"
```

---

## 八、关键约束矩阵

| 约束域 | 约束规则 | 优先级 |
|:---|:---|:--:|
| **工具链** | 只通过 `run_command` 执行 `playwright-cli` 命令，不使用 `browser_subagent` | 🔴 P0 |
| **ref 管理** | 每次 DOM 变化后必须 `snapshot`，绝不猜测 ref 编号 | 🔴 P0 |
| **执行方式** | 每条 `playwright-cli` 命令独立执行并检查输出，不批量盲发 | 🔴 P0 |
| **如实记录** | 发现 Bug 即记录，不美化不隐瞒 | 🔴 P0 |
| **产出目录** | 所有产出统一归档到 `test-reports/` 下的子目录 | 🟡 P1 |
| **脚本格式** | 保存为 `.sh`（Bash 格式），每条命令带 ref 来源注释 | 🟡 P1 |
| **截图命名** | `{两位全局序号}_{模块简称}_{场景}.png`，序号连续递增 | 🟡 P1 |
| **报告格式** | 单 HTML 文件，截图 Base64 内嵌，可直接浏览器打开 | 🟡 P1 |
| **语言** | 全程中文交互、分析、报告输出 | 🟢 P2 |
| **弹窗** | alert/confirm 出现后：记录文案 → 处理 → 截图 | 🟢 P2 |

---

## 九、使用方式

### 9.1 首次安装

```bash
# 将 Skill 拷贝到项目中
cp -r e2e-testing/ {工程根目录}/.ai/skills/e2e-testing/

# Claude Code 兼容（可选）
ln -s .ai/skills/e2e-testing .claude/skills/e2e-testing

# Cursor 兼容（可选）
# 将 SKILL.md 核心内容提取到 .cursor/rules/e2e-testing.mdc
```

### 9.2 触发执行

对任何支持的 AI Agent，只需一句话：

```
对规则配置模块执行 E2E 自动化测试
```

Agent 自动完成：
1. 读取 `.ai/skills/e2e-testing/SKILL.md`
2. 按 5 阶段 SOP 执行
3. 产出 `test-reports/` 下的全部文件

### 9.3 回归测试

```bash
# 一键全量回归
bash test-reports/scripts/run_all.sh

# 单模块回归
bash test-reports/scripts/run_01_因子配置.sh

# 重新生成报告
bash .ai/skills/e2e-testing/scripts/generate-report.sh
```

---

## 十、演进路线图

| 阶段 | 目标 | 关键特性 |
|:--|:---|:---|
| **v1.0** (当前) | 基础可用 | 5 阶段 SOP + 模板驱动 + HTML 报告 |
| **v1.1** | 增强可回归性 | 脚本中 ref 替换为语义化选择器（如 `getByRole('button', {name: '保存'})`）|
| **v1.2** | 数据驱动 | 支持从 CSV/JSON 加载测试数据，同一用例多组参数执行 |
| **v2.0** | CI/CD 集成 | 提供 GitHub Actions / Jenkins Pipeline 配置，支持自动化流水线 |
| **v2.1** | 多语言 | 报告和用例支持中/英文切换 |
| **v3.0** | AI 自修复 | Agent 自动根据 `Ref not found` 错误重新定位元素并修正脚本 |
