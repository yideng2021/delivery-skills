# task-decomposer-skill

把 design 的模块对外契约切分为**承接方 × BC 维度的工单清单**(`tasks.md`),固定 4 段结构,严守越权红线(不引入新规约,不写实现细节)。

## 安装

无 CLI 步骤。AI 在触发条件命中时自动加载 [`SKILL.md`](SKILL.md)。

## 平台兼容

- 与 RBK:仅通过 frontmatter `shipped_us` 字段被动协作(由 workflow writeback 注入,本 skill 不写)
- 与 sibling skill(proposal-writer / spec-writer / design-writer):互不引用,通过 frontmatter 字段流串联
- 与 workflow:仅通过 `exc_status` 字段交互(`done` 触发 writeback 转移)
- 与 dev skill:通过 §2 Task 列表 + `handover_domains` 字段被动消费,不命令耦合

## 文件结构

```
task-decomposer-skill/
├── SKILL.md                          # AI 入口
├── README.md                         # 本文件(人读)
├── templates/
│   └── tasks.md                      # 红骨架 + 4 段结构 + frontmatter 7 字段
└── references/
    ├── checklist.md                  # 验收唯一权威
    ├── how-to-write.md               # 写作指南(含 CDR 反向 4 路分流)
    ├── decomposition-rules.md        # 拆解原则(承接方 × BC 二维 + 4 条粒度规则)
    └── overreach-redlines.md         # 越权红线 5 条枚举(上游 / 下游 / SSOT / 粒度 / 枚举)
```

## 触发条件简版

- 已有 reviewed 的 design,要进入 task 阶段
- 已有 tasks 上增删 Task / 调整承接方 / 调整粒度
- 提到"拆任务 / 拆 task / 工单 / 承接方分配 / 进度表"

## 输出物

- `docs/spec/{change_name}/tasks.md`(单文件)

## 不写什么

- ❌ 引入 design 不存在的 BC / 模块 / spec 条目(必须反推上游)
- ❌ 实现技术细节(测试命令 / 覆盖率 / 框架名 / 版本号 / 部署 / SQL / HTTP / 接口签名)
- ❌ 跨承接方合并任务(一条 Task 仅一个承接方)
- ❌ 中文状态枚举(已废弃,只用 `pending / in_progress / done`)
- ❌ `shipped_us` 字段(由 workflow writeback 注入,C1-4)
- ❌ 旧 Phase 流水线(Scaffolding/Schema/Service/API/UI 已废弃)
- ❌ dev skill 命令调用(零命令名耦合)
- ❌ 复述 ac-vocabulary / frontmatter-schema / handover-domains / cdr-protocol 定义(只链接)