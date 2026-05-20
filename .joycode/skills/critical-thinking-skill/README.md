# Critical Thinking Skill — 批判性独立思考

> 生产级 Agent Skill，扮演具备批判性思维的资深领域专家与独立思考者角色：**基于权威原理、事实证据和严谨逻辑，对用户的疑问、想法或不同看法进行独立的深度剖析，绝不无原则附和用户观点。**

## 概述

```
            ┌──────────────────────────────┐
            │  用户提出疑问 / 想法 / 不同看法  │
            └──────────────┬───────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │    critical-thinking    │
              │  （批判性独立思考引擎）  │
              └────────────┬───────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
    疑问还原         思考过程(假设/依据/      独立观点 +
                     多角度/推理链)           深度讲解
```

核心理念：
- **绝不附和** — 不因用户表达倾向就迎合；禁止"您说得对""确实如此"式开场
- **权威奠基** — 所有结论必须可追溯到原理、规范或可验证事实
- **独立推理** — 即便与用户一致，也必须通过独立推理链得出
- **结构强制** — 四段式输出：疑问还原 → 思考过程 → 独立观点 → 深度讲解

---

## 目录结构

```
critical-thinking-skill/
├── SKILL.md                         # ★ Skill 主文件（入口，含完整规则与示例）
├── README.md                        # 安装与使用说明
├── templates/
│   └── response-template.md         # 四段式回答模板（可直接复制填充）
└── references/
    └── examples.md                  # 更多对比示例（附和式 vs 批判式）
```

---

## 安装指南

### Antigravity

```bash
cp -r critical-thinking-skill YOUR_PROJECT/.agent/skills/critical-thinking
```

### OpenCode

```bash
cp -r critical-thinking-skill YOUR_PROJECT/.opencode/skills/critical-thinking
```

### Cursor

```bash
cp -r critical-thinking-skill YOUR_PROJECT/.cursor/skills/critical-thinking
```

---

## 使用方式

安装后在 Agent 对话中使用自然语言触发：

| 触发示例                                 | 行为                                   |
| ---------------------------------------- | -------------------------------------- |
| "我觉得 X 是不是更好？"                  | 批判性审视用户倾向，给出独立判断       |
| "这样做对吗？"                           | 基于权威原理检验用户方案               |
| "反驳我""挑战一下我的想法"               | 主动构造反例与边界场景                 |
| "这个方案有没有问题？"                   | 多角度分析 + 潜在风险暴露              |
| "帮我判断……"                             | 直白给出结论并附原理级讲解             |

---

## 关联 Skill

| Skill                       | 关系   | 协作方式                                                     |
| --------------------------- | ------ | ------------------------------------------------------------ |
| `spec-design`               | 互补   | 在 proposal/specs 评审阶段调用本 skill 批判性审查规约        |
| `requirements-bookkeeping`  | 互补   | 用户对账本条目合理性存疑时，调用本 skill 独立判断            |

> **职责边界**：本 skill **不生成**规约文档、**不维护**账本，只提供**批判性判断与深度讲解**。

---

## 平台兼容性

| 平台        | 目录                   | 入口文件   |
| ----------- | ---------------------- | ---------- |
| Antigravity | `.agent/skills/`       | `SKILL.md` |
| OpenCode    | `.opencode/skills/`    | `SKILL.md` |
| Cursor      | `.cursor/skills/`      | `SKILL.md` |

## License

MIT