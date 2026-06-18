# Runtime Spec Mapper Skill — 运行时现状业务规约

> 消费 `runtime-flow-mapper` 的 flow-map 作骨架，**以前后端代码为第一依据**沿落锚点深探，
> 梳理出一份**现状(as-is)业务规约**——借 spec specs.md 的 L0–L2 业务语言结构。
> **现状 ≠ 规范**：只陈述系统「当前怎么做」，不评判「应该怎么做」。不采集、不落锚、不写变更 spec、不生成测试。

## 在认知管线中的位置

```
runtime-capture      runtime-flow-mapper        本 skill（规约层）
（采集+治理） ──▶  界面↔接口↔代码 三证对齐 ──flow-map──▶  代码深探 → 现状业务规约
```

## 输入 / 输出

| | 内容 |
|---|---|
| 输入 | `docs/runtime-flow/{name}/{name}_flow-map.md` + 前后端工程目录 + CodeGraph/GitNexus 索引 |
| 输出 | `docs/runtime-spec/{name}/{name}_spec.md`（现状业务规约，工作区内，顶部标「非规范」） |

## 核心能力：代码深探（第一依据）

```
flow-map 给「在哪」（节点 + handler 代码锚）
  +  代码给「是什么」（handler→Service 抽规则 INV、DTO/VO 抽实体、枚举抽完整状态机、前端校验抽约束）
  = L0 上下文 + L1 用户故事 + L2 实体与规则
```
深探有界：到 Service+DTO+枚举+前端校验即止，**不下 DAO/SQL**。

## 借 specs.md 的（与不借的）

| 取 | 不取 |
|---|---|
| L0 上下文依赖 / L1 用户故事 / L2 实体+规则+业务流转 / 业务语言纯净 | change_mode·AUTH-id·增量标注 / L3 Gherkin / L4 DoD / DMN / validate.mjs 闸门 |

## 产物结构（{name}_spec.md）

1. 顶部「现状·非规范」声明　2. L0 业务上下文　3. L1 用户故事　4. L2 业务实体与规则（含按需状态机）

## 红线

- 代码第一、强制溯源（每项带 `类.方法`/`文件:行` 或 flow-map 节点锚）
- 现状 ≠ 规范：疑似技术兜底/遗留逻辑标 `~inferred`，不当业务规则断言
- 业务语言纯净：技术术语只进溯源注，不进正文
- 不越界：不采集/不落锚（上游）、不写变更 spec、不生成测试
- 缺 flow-map → 中断 + 提示去跑 runtime-flow-mapper

## 触发

「把运行业务地图梳理成业务规约」「从 flow-map 生成现状 spec」「逆向现状业务文档」。

## 目录

```
runtime-spec-mapper-skill/
├── SKILL.md / README.md
├── references/  preflight-check / code-deepdive / spec-doc-spec
└── templates/   runtime-spec.md
```
