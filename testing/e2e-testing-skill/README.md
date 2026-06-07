# E2E Testing Skill — 端到端自动化测试

> 技术栈无关的全链路 E2E 自动化测试 Skill，支持 Vue / React / 传统多页应用。

## 📋 概述

本 Skill 作为 AI 全流程开发架构体系的**第六环——验收测试与质量闭环**，基于 `playwright-cli` 驱动真实浏览器，对任意 Web 应用执行端到端功能验收测试。

**五阶段工作流**：

```
学习分析 → 用例设计 → 逐模块执行 → 归档保存 → 报告生成
```

**产出物**：测试用例(.md) + 截图凭证(.png) + 回归脚本(.sh) + HTML 报告

---

## 📁 目录结构

```
e2e-testing-skill/
├── SKILL.md                              # ★ Skill 主文件（入口指令）
├── README.md                             # 安装与使用说明（多平台适配）
├── references/                           # 引用文档（按需加载，节省 Token）
│   ├── playwright_commands.md            # playwright-cli 完整命令速查
│   ├── snapshot_strategy.md              # ref 管理与错误恢复策略
│   └── e2e_checklist.md                  # E2E 测试审查清单（经验沉淀）
└── templates/                            # 模板文件（模板驱动产出）
    ├── test_case.md                      # 测试用例 Markdown 模板
    ├── test_script.sh                    # 模块测试脚本模板
    ├── run_all.sh                        # 全量回归入口模板
    └── test_report.html                  # HTML 报告骨架模板
```

---

## 🔗 前置依赖

本 Skill 消费以下上游 Skill 的产出：

| 上游 Skill         | 产出文档                                           | 用途                         |
| ------------------ | -------------------------------------------------- | ---------------------------- |
| `baseline-init`    | `docs/analysis/agent.md`、`docs/system_overview.md` | 工程画像 + 系统全貌          |
| `spec-design`      | `docs/spec/{change}/specs/*.md`                     | 验收标准 (AC) 作为测试依据   |
| `spec-backend-dev` | 已部署的后端服务                                    | 被测系统运行时环境           |
| `spec-frontend-dev`| 前端页面组件源码                                    | 提取路由、表单字段、页面跳转 |

---

## 🚀 安装指南

### 方式一：Google Antigravity (Gemini CLI / Jules)

Antigravity 通过 `.agent/skills/` 目录自动识别 Skills。

```powershell
# 1. 在项目根目录创建 skills 目录
mkdir -p .agent/skills/

# 2. 复制 Skill 到项目中
cp -r /path/to/pro_skills/e2e-testing-skill .agent/skills/e2e-testing-skill

# 3. 验证结构
ls .agent/skills/e2e-testing-skill/SKILL.md
```

**目标结构**：
```
your-project/
└── .agent/
    └── skills/
        └── e2e-testing-skill/
            ├── SKILL.md
            ├── templates/
            └── references/
```

> Agent 会自动读取 `SKILL.md` 的 YAML frontmatter 中的 `name` 和 `description`，并在匹配的场景下激活此 Skill。

---

### 方式二：OpenCode

OpenCode 通过 `.opencode/skills/` 目录加载 Skills。

```powershell
# 1. 在项目根目录创建 skills 目录
mkdir -p .opencode/skills/

# 2. 复制 Skill
cp -r /path/to/pro_skills/e2e-testing-skill .opencode/skills/e2e-testing-skill

# 3. 验证
ls .opencode/skills/e2e-testing-skill/SKILL.md
```

**目标结构**：
```
your-project/
└── .opencode/
    └── skills/
        └── e2e-testing-skill/
            ├── SKILL.md
            ├── templates/
            └── references/
```

> 在 OpenCode 中使用 `/skills` 命令查看已加载的 Skills，或通过 `ultrawork` 命令触发执行。

---

### 方式三：Cursor IDE

Cursor 通过 `.cursor/skills/` 目录识别自定义 Skills。

```powershell
# 1. 在项目根目录创建 skills 目录
mkdir -p .cursor/skills/

# 2. 复制 Skill
cp -r /path/to/pro_skills/e2e-testing-skill .cursor/skills/e2e-testing-skill

# 3. 验证
ls .cursor/skills/e2e-testing-skill/SKILL.md
```

**目标结构**：
```
your-project/
└── .cursor/
    └── skills/
        └── e2e-testing-skill/
            ├── SKILL.md
            ├── templates/
            └── references/
```

> 在 Cursor 中，通过 `@skills` 或在 Agent 对话中提及"E2E 测试"即可激活。

---

### 方式四：Claude Code

Claude Code 通过 `.claude/skills/` 目录加载 Skills。

```powershell
# 1. 在项目根目录创建 skills 目录
mkdir -p .claude/skills/

# 2. 复制 Skill
cp -r /path/to/pro_skills/e2e-testing-skill .claude/skills/e2e-testing-skill

# 3. 验证
ls .claude/skills/e2e-testing-skill/SKILL.md
```

---

## 📝 使用方法

安装完成后，在任意支持的 Agent 平台中，使用以下方式触发：

### 自然语言触发（推荐）

```
对用户管理模块执行 E2E 自动化测试
```

```
执行回归测试
```

```
验收测试订单模块
```

### 分阶段执行

可以按需执行单个阶段：

| 指令示例                                   | 执行内容                     |
| ------------------------------------------ | ---------------------------- |
| "对当前系统执行端到端测试"                 | 完整 5 阶段工作流            |
| "分析被测系统结构，输出测试策略"           | 仅阶段 1：学习分析           |
| "为规则配置模块设计测试用例"               | 仅阶段 2：用例设计           |
| "执行因素配置的 E2E 测试"                  | 仅阶段 3：逐模块执行         |
| "将测试命令归档为回归脚本"                 | 仅阶段 4：归档保存           |
| "生成 HTML 测试报告"                       | 仅阶段 5：报告生成           |

---

## ⚙️ 支持的技术栈

技术栈信息从 `baseline-init` 工程画像自动获取，本 Skill 天然支持以下前端技术栈：

| 前端框架                                | 支持 |
| --------------------------------------- | ---- |
| Vue 2/3 (Element Plus / Ant Design Vue) | ✅   |
| React (Ant Design / Material UI)        | ✅   |
| Next.js / Nuxt.js                       | ✅   |
| Angular                                 | ✅   |
| 传统多页 HTML                           | ✅   |

> **核心原理**：`playwright-cli` 操作的是浏览器中**渲染后的 DOM**，不依赖任何特定框架的源码结构。

---

## ⚙️ 平台兼容性

| 平台        | Skills 目录         | 入口文件   | 触发方式             |
| ----------- | ------------------- | ---------- | -------------------- |
| Antigravity | `.agent/skills/`    | `SKILL.md` | 自然语言 / 自动匹配  |
| OpenCode    | `.opencode/skills/` | `SKILL.md` | `/skills` 命令       |
| Cursor      | `.cursor/skills/`   | `SKILL.md` | `@skills` / 自然语言 |
| Claude Code | `.claude/skills/`   | `SKILL.md` | 自然语言             |

> **兼容性保证**：`SKILL.md` 使用标准 YAML frontmatter + Markdown 格式，各平台均原生支持。
> 模板和引用文件使用相对路径引用，确保在任何安装位置下均可正确定位。

---

## 📜 License

MIT
