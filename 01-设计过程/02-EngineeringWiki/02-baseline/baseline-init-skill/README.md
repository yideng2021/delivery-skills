# Baseline Init Skills — 基线初始化与架构治理

> 生产级 Agent Skills，用于对现有工程进行全量基线初始化与架构治理。

## 📋 概述

本 Skill 通过五阶段工作流，自动生成标准化文档体系：

```
工程锚定 → 核心设计 → 详细落地 → 闭环自检 → 系统总纲
```

**产出物**：`system_overview.md` + 8 份标准化文档，涵盖工程规范、需求、架构、数据库与接口设计。

---

## 📁 目录结构

```
baseline-init-skill/
├── SKILL.md                              # ★ Skill 主文件（入口）
├── README.md                             # 安装与使用说明
├── templates/                            # 文档模板
│   ├── agent.md                          # 工程分析模板
│   ├── api_rules.md                      # API 规范模板
│   ├── db_rules.md                       # 数据库规范模板
│   ├── project_rules.md                  # 工程通用规范模板
│   ├── requirements.md                   # 需求规格模板
│   ├── architecture.md                   # 系统架构模板
│   ├── database_design.md                # 数据库设计模板
│   ├── api_design.md                     # 接口设计模板
│   └── system_overview.md                # 系统总纲模板
└── references/                           # 引用文档
    └── consistency_checklists.md          # 一致性自检清单
```

---

## 🚀 安装指南

### 方式一：Google Antigravity (Gemini CLI / Jules)

Antigravity 通过 `.agent/skills/` 目录自动识别 Skills。

```powershell
# 1. 在项目根目录创建 skills 目录
mkdir -p .agent/skills/

# 2. 复制 Skill 到项目中
cp -r /path/to/pro_skills/baseline-init-skill .agent/skills/baseline-init-skill

# 3. 验证结构
ls .agent/skills/baseline-init-skill/SKILL.md
```

**目标结构**：
```
your-project/
└── .agent/
    └── skills/
        └── baseline-init-skill/
            ├── SKILL.md
            ├── templates/
            └── references/
```

> Agent 会自动读取 `SKILL.md` 的 YAML frontmatter 中的 `name` 和 `description`，并在匹配的场景下激活此 Skill。

---

### 方式二：OpenCode

OpenCode 通过 `.opencode/skills/` 目录或自定义路径加载 Skills。

```powershell
# 1. 在项目根目录创建 skills 目录
mkdir -p .opencode/skills/

# 2. 复制 Skill
cp -r /path/to/pro_skills/baseline-init-skill .opencode/skills/baseline-init-skill

# 3. 验证
ls .opencode/skills/baseline-init/SKILL.md
```

**目标结构**：
```
your-project/
└── .opencode/
    └── skills/
        └── baseline-init-skill/
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
cp -r /path/to/pro_skills/baseline-init-skill .cursor/skills/baseline-init-skill

# 3. 验证
ls .cursor/skills/baseline-init-skill/SKILL.md
```

**目标结构**：
```
your-project/
└── .cursor/
    └── skills/
        └── baseline-init-skill/
            ├── SKILL.md
            ├── templates/
            └── references/
```

> 在 Cursor 中，通过 `@skills` 或在 Agent 对话中提及"基线初始化"即可激活。

---

## 📝 使用方法

安装完成后，在任意支持的 Agent 平台中，使用以下方式触发：

### 自然语言触发（推荐）

```
请对当前项目进行基线初始化，生成标准化文档体系。
```

```
帮我梳理这个遗留项目的架构，建立开发规范。
```

```
执行基线初始化的阶段一：工程锚定。
```

### 分阶段执行

可以按需执行单个阶段：

| 指令示例                           | 执行内容           |
| ---------------------------------- | ------------------ |
| "执行阶段一：工程锚定"            | Step 1.1 + 1.2     |
| "执行阶段二：核心设计"            | Step 2.1 + 2.2     |
| "执行阶段三：详细落地"            | Step 3.1 + 3.2     |
| "执行阶段四：闭环自检"            | 一致性校验         |
| "执行阶段五：系统总纲"            | 生成 system_overview |

---

## ⚙️ 适配说明

| 平台        | Skills 目录         | 入口文件   | 触发方式             |
| ----------- | ------------------- | ---------- | -------------------- |
| Antigravity | `.agent/skills/`    | `SKILL.md` | 自然语言 / 自动匹配  |
| OpenCode    | `.opencode/skills/` | `SKILL.md` | `/skills` 命令       |
| Cursor      | `.cursor/skills/`   | `SKILL.md` | `@skills` / 自然语言 |

> **兼容性保证**：`SKILL.md` 使用标准 YAML frontmatter + Markdown 格式，三大平台均原生支持。
> 模板和引用文件使用相对路径引用，确保在任何安装位置下均可正确定位。

---

## 📜 License

MIT
