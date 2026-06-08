---
name: architecture-guide
description: >
  消费 brownfield-onboarding 产出的 `01-architecture.md` 业务域地图,结合 CodeGraph + GitNexus 对核心业务域
  逐个**深描业务主线**,产出供**人**学习/交接/介绍的完整架构导览(目标仓 `.brownfield/architecture/`)。
  与 brownfield-onboarding 是上下游:onboarding 产薄地图(给 MCP agent),本 skill 产厚导览(给人)。
  核心纪律:**分离不污染**(不改薄 01)、**分级深描**(核心主线域成文件、支撑横切域进索引)、**快照可重生**
  (回链 文件:行号 + pin commit + 按域 detect_changes 重生成)。当用户表达「完整梳理项目架构」「写一份架构
  导览/介绍」「新人怎么学这个项目」「把业务主线讲清楚成文档」时触发。
---

# Architecture Guide — 棕地架构导览(人读·厚·快照)

## 触发

用户表达「完整梳理/介绍项目架构」「写架构导览供学习交接」「把核心业务主线讲清成文档」「新人 onboarding 材料」,
或在已有 `01-architecture.md` 薄地图后要求"把地图展开成完整架构文档"。

## 定位:为"人"而非"agent"

| | brownfield-onboarding | architecture-guide(本 skill) |
|---|---|---|
| 消费者 | 带 MCP 的 agent(spec-wf writers) | **人**(学习/交接/介绍) |
| 产物 | 薄地图 + 流程索引(活查询出口) | **厚导览**(自洽完整、可通读) |
| 生命周期 | 活查询为主、少固化 | **快照**(pin commit + 可重生成) |

> 二者不冲突:服务不同消费者。人不会边读边查 MCP,故厚导览正是其所需。

## 前置依赖

- 目标仓已建双索引,且**通过前置完整性闸门**——复用 [`../brownfield-onboarding-skill/references/preflight-check.md`](../brownfield-onboarding-skill/references/preflight-check.md);
  BLOCK 则停止、CONFIRM 则人工确认后继续,**绝不在残缺索引上生成导览**。
- 目标仓已存在 **人审过的** `.brownfield/01-architecture.md`(本 skill 的输入目录);若无,先跑 brownfield-onboarding。

## 不变量(核心纪律)

0. **前置闸门 + 输入校验(强制·首步)**:复用 onboarding 前置闸门确认双索引完整;并校验 `01-architecture.md`
   存在且已人审。任一不满足 → 停止 / 转人工,不生成。
1. **分离不污染**:**不修改 `01-architecture.md`**(薄地图须保持 agent 可扫);深描一律置于 `architecture/`。
2. **分级深描**:核心主线域 → 各成一份 `domain-*.md`(深);支撑/横切域 → 收进 `00-index.md` 概述+锚点(浅)。
   判定见 [`references/tiering-policy.md`](references/tiering-policy.md)。
3. **断言必回链**:导览每个结论带 `文件:行号`,可一键核对源码(防固化幻觉)。
4. **快照可重生**:每文件头标 pin commit + 日期 + "教学用途,编程真理以活查询源码为准";代码演进用
   `gitnexus detect_changes` 定位受影响域,**只重跑那几份 `domain-*.md`**。见 [`references/snapshot-discipline.md`](references/snapshot-discipline.md)。
5. **复用不重造**:每条主流程用 6 步重建法 [`../brownfield-onboarding-skill/references/reconstruction-method.md`](../brownfield-onboarding-skill/references/reconstruction-method.md);
   本 skill 只在其上做"域级编排 + 拼装叙事"。
6. **人读优先**:叙事须自洽完整、可从头读到尾;不假设读者会查 MCP,但保留锚点供想深入者活查询。

> 反模式见 [`references/snapshot-discipline.md`](references/snapshot-discipline.md) §反模式。

## 输入

- `.brownfield/01-architecture.md`(业务域地图 = 导览目录)
- CodeGraph MCP + GitNexus MCP(逐域深描时活查询)
- (可选)`02-business-flows.md` 入口锚点(主流程起点)

## 输出(目标仓 `.brownfield/architecture/`)

| 文件 | 角色 | 模板 |
|------|------|------|
| `00-index.md` | 总览 + 跨域主线全景 + 阅读路径 + **支撑/横切域浅描区** + 快照声明 | [templates/00-index.md](templates/00-index.md) |
| `domain-<核心域>.md` | 单核心域深描:职责 / 实体+状态机 / 主线流程(多条) / 域间依赖 / 跨域触点 / 约束·技术债 / 测试缺口 | [templates/domain-guide.md](templates/domain-guide.md) |

> **不修改** `01-architecture.md`;**不**为支撑/横切域单独建文件(浅描进 `00-index`)。

## 深描工序

- **G0 前置(强制)** ← 复用 onboarding 闸门 + 校验 01 存在/已审 → 不满足则停止。
- **G1 选域分级** ← 读 `01` 业务域表,按 [`references/tiering-policy.md`](references/tiering-policy.md) 切核心(深)/支撑(浅)。
- **G2 逐核心域深描** ← 对每个核心域走 [`references/deepening-method.md`](references/deepening-method.md)(内嵌 6 步法逐主流程)→ `domain-*.md`。
- **G3 支撑域浅描** ← 每域一段概述 + 入口锚点 + 活查询命令 → 写入 `00-index.md`。
- **G4 跨域全景** ← 汇总各核心域主线,画"业务主干全链路" + 阅读路径 → `00-index.md`。
- **G5 快照落地** ← 回链校验 + 每文件头部声明块([`references/snapshot-discipline.md`](references/snapshot-discipline.md))。

## 与 spec-wf 的关系

- 上游:依赖 brownfield-onboarding 的 `01` 地图与前置闸门、6 步法。
- 下游(可选):产出的导览可充当 design-writer 的 `architecture_refs.path` 来源(既有架构权威)。
- 本 skill 不进入 4 步规约链,不修改 `docs/spec/`。

## 文件导航

```
architecture-guide-skill/
├── README.md / SKILL.md
├── templates/
│   ├── 00-index.md            ← 导览总览骨架(含跨域全景 + 支撑域浅描区)
│   └── domain-guide.md        ← 单核心域深描骨架
└── references/
    ├── deepening-method.md    ← 逐域深描法(域级编排,内嵌 6 步法)
    ├── tiering-policy.md      ← 核心深/支撑浅 分级判定
    └── snapshot-discipline.md ← 快照纪律(回链/pin/按域重生成)+ 反模式
```
