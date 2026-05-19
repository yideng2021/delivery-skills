# spec-writer-skill

把 proposal 的战略意图翻译为**业务级可验证规约**(`specs/{capability}.md`),L0–L4 严格分层,AC 唯一来源 = L2 INV ∪ L3 AC。

## 安装

无 CLI 步骤。AI 在触发条件命中时自动加载 [`SKILL.md`](SKILL.md)。

## 平台兼容

- 与 RBK:仅通过 frontmatter `related_req` 字段被动协作(零命令名耦合)
- 与 sibling skill(proposal-writer / design-writer / task-decomposer):互不引用,通过 frontmatter 字段流串联
- 与 workflow:仅通过 `status` 字段交互

## 文件结构

```
spec-writer-skill/
├── SKILL.md                          # AI 入口
├── README.md                         # 本文件(人读)
├── templates/
│   └── specs.md                      # 红骨架 + L0–L4 + frontmatter 4 字段
└── references/
    ├── checklist.md                  # 验收唯一权威
    ├── how-to-write.md               # 写作指南
    ├── l0-l4-guide.md                # 分层职责
    ├── ears-gherkin-cheatsheet.md    # L3 句式
    ├── increment-annotation.md       # 增量标注规则
    └── req-convergence.md            # AUTH 收敛(裁决 Q1-2/Q1-3/Q2.1-3)
```

## 触发条件简版

- 已有 reviewed 的 proposal,要进入 spec 阶段
- 已有 spec 上增删 INV / AC / DoD
- 提到"写 spec / 验收标准 / EARS / Gherkin / INV / AC / DoD"

## 输出物

- `docs/spec/{change_name}/specs/{capability}.md`(一个或多个,按 capability 拆分)

## 不写什么

- ❌ 技术方案 / API 路径 / HTTP code / 字段类型 / SQL / 代码片段(归 design-writer)
- ❌ 测试命令 / 覆盖率指标(归 dev skill)
- ❌ RBK 命令调用(零命令名耦合)
- ❌ proposal 未声明的 AUTH(必须反推 proposal 修订)