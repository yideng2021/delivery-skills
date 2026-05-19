# design-writer-skill

把 spec 的业务级规约翻译为**模块对外契约、模块依赖、跨模块流程与领域建模骨架**(`design.md`),固定 8 段结构,严守边界红线(架构层图表允许),领域建模深度按 L1/L2/L3 三档递进。

## 安装

无 CLI 步骤。AI 在触发条件命中时自动加载 [`SKILL.md`](SKILL.md)。

## 平台兼容

- 与 RBK:仅通过 frontmatter `status` 字段被动监听(零命令名耦合)
- 与 sibling skill(proposal-writer / spec-writer / task-decomposer):互不引用,通过 frontmatter 字段流串联
- 与 workflow:仅通过 `status` 字段交互
- 与 dev skill:通过 §5 ADR 与 §3 模块契约文本传递,不命令耦合

## 文件结构

```
design-writer-skill/
├── SKILL.md                              # AI 入口
├── README.md                             # 本文件(人读)
├── templates/
│   └── design.md                         # 红骨架 + 8 段结构 + frontmatter 7 字段
└── references/
    ├── checklist.md                      # 验收唯一权威
    ├── how-to-write.md                   # 写作指南(含 CDR 反向 4 路分流)
    ├── architecture-context-loading.md   # 既有架构上下文加载策略
    ├── domain-modeling-depth.md          # L1/L2/L3 三档判定(原"复杂度梯度判定"更名)
    └── boundary-redlines.md              # 边界红线 6 条枚举
```

## 触发条件简版

- 已有 reviewed 的 spec,要进入 design 阶段
- 已有 design 上增删模块契约 / ADR / BC
- 提到"写 design / 架构设计 / 模块划分 / BC / ADR / 领域建模"

## 输出物

- `docs/spec/{change_name}/design.md`(单文件,不分 capability)

## 不写什么

- ❌ SQL / 字段类型 / HTTP / REST / 状态码 / 接口签名 / 代码片段(归 dev skill)
- ❌ 框架名 / 版本号 / 库名(归 dev skill)
- ❌ 测试命令 / 覆盖率 / 部署拓扑(归 spec L4 DoD 与 dev skill)
- ❌ 战术建模在 L1/L2 下展开(只在 `domain_model_mode: extended` 下展开)
- ❌ skill 单方面升级 `domain_modeling_level` 到 L3(必须 CDR 用户确认)
- ❌ 复述 ac-vocabulary / frontmatter-schema / cdr-protocol 定义(只链接)