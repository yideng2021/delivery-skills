# arch-guide-skill

> **一句话定位**:把 `arch-baseline` 产出的薄业务域地图,展开成供**人**学习/交接/介绍的**完整架构导览**。

`arch-guide` 是 `architecture-extractor-wf`(棕地架构提取 workflow 域)内的**下游厚产物 skill**。
arch-baseline 产薄地图(给带 MCP 的消费方活查询),本 skill 产厚导览(给人通读)。两者服务不同消费者,
共享前置闸门、6 步重建法与回链纪律。本 wf 与任何规约/交付流水线**解耦**。

---

## 解决什么问题

薄基线模型为"带 MCP 的 agent"优化——能活查询,无需厚文档。但还有**第二个消费者:人**(新人 onboarding、
项目交接、架构介绍)。人不会边读边查 MCP,需要一份自洽完整、可从头读到尾的架构叙事。本 skill 补这个场景。

## 核心设计:分离 + 分级 + 快照

- **分离不污染**:不动薄 `01-architecture.md`(它仍是 agent 用的地图/目录);厚内容另置 `architecture/`。
- **分级深描**:核心主线域各成一份 `domain-*.md`(深);支撑/横切域收进 `00-index.md`(浅)。
- **快照可重生**:回链 `文件:行号` + pin commit + 按域 `detect_changes` 只重跑受影响的域文件。

> 厚文档天生有"冻结幻觉 / 随代码腐烂"风险;这三条纪律就是专门对治它,使厚导览仍可信、可维护。

## 安装

无 CLI 安装。AI 入口 [`./SKILL.md`](./SKILL.md)。前置:目标仓双索引就绪并过前置闸门,且已有人审过的
`.brownfield/01-architecture.md`(无则先跑 arch-baseline)。

## 平台兼容

- 上游依赖同域 [`../arch-baseline-skill/`](../arch-baseline-skill/):复用其前置闸门与 6 步重建法。
- 下游:产物为独立的 `.brownfield/architecture/`,可被任意下游消费;不感知、不依赖任何特定下游。
- 不修改目标仓源码。

## 文件结构

```
arch-guide-skill/
├── README.md                          ← 本文件(人类导航)
├── SKILL.md                           ← AI 入口
├── templates/
│   ├── 00-index.md                    ← 导览总览骨架
│   └── domain-guide.md                ← 单核心域深描骨架
└── references/
    ├── deepening-method.md            ← 逐域深描法(域级编排,内嵌 6 步法)
    ├── tiering-policy.md              ← 核心深/支撑浅 分级判定
    └── snapshot-discipline.md         ← 快照纪律 + 反模式
```

## 输出物(目标仓 `.brownfield/architecture/`)

- `00-index.md` 总览 + 跨域主线全景 + 支撑域浅描 · `domain-<核心域>.md` 每核心域一份深描

## 不做什么

- 不修改 `01-architecture.md`(保持薄、保持 agent 可扫)。
- 不为支撑/横切域单独建文件(浅描进 index)。
- 不修改目标仓源码。
