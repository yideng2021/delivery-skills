# spec-design-workflow

> "先契约,后执行"四步规约的**编排层**。把 4 个写手 skill 串成 `proposal → guard → specs → design → tasks → writeback` 的状态机,与 RBK 通过 frontmatter 字段被动协作。

---

## 什么时候触发

- 用户希望"做技术方案 / 启动规约流程 / 开 change"。
- 已有 `proposal.md` 起草中,需要 AI 驱动到下一阶段。

> 4 个写手 skill(proposal-writer / spec-writer / design-writer / task-decomposer)也可独立运行,不必经过本 workflow。

---

## 平台兼容

- Markdown 原生 frontmatter 即可工作;不依赖任何运行时。
- 与 [`requirements-bookkeeping-skill`](../../requirements-bookkeeping-skill/) 通过 frontmatter 字段被动协作,不调用 RBK 命令。

---

## 文件结构

```
spec-design-workflow/
├── WORKFLOW.md                            # AI 编排入口(状态机 + 四件事)
├── README.md                              # 本文件
└── references/
    ├── stage-graph.md                     # 6 节点状态机详解
    ├── change-splitting-guard.md          # 6 维变更拆分守卫
    └── handshake-rbk.md                   # 与 RBK 字段被动握手
```

---

## 输出物

workflow 自身**不产出**任何业务文档;它只在阶段切换时:
- 监听 frontmatter `status` / `exc_status`
- 写入 `tasks.shipped_us`(writeback 阶段唯一写入字段)
- 路由到 4 个 skill 的 SKILL.md 入口

---

## 不做什么

- 不规定 skill 内规则、不定义 frontmatter 字段语义、不参与 CDR(注释驱动精炼)
- 不调用 RBK 命令、不直接写项目级账本
- 不诊断阶段内卡死(由用户与各 skill 自治判断)

详细的"边界与禁令"见 [`WORKFLOW.md`](./WORKFLOW.md) §严禁事项。