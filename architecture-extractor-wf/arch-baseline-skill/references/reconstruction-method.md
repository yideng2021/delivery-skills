# 业务流程重建法（6 步）

> 本文件是 brownfield-onboarding 提炼业务流程的**唯一权威方法**。SKILL.md 不变量 2/3/4 是其约束。
> 核心立场：**入口从 Controller/路由出发，而非机器 process 标签；详情即时生成不固化。**

---

## 为什么不能用机器 process 标签

GitNexus 的 `Process` 节点由 Leiden 社区 + 入口启发式生成，标签是 `动词→动词`（如 `Page → Get`、
`ProcessAfter → GetMessageSource`），**零业务语义，不可直接用**。但它提供了有价值的骨架——"哪些符号属于
同一执行流"。正确用法：取其骨架，由 AI 在活查询时补业务语义。

---

## 6 步

### 1. 选入口
从 `01-architecture.md` 的业务域出发，取该域 Controller 的**写操作路由**（add / submit / start / process /
confirm …）。读操作（page / list / get）多为 CRUD，无状态机，优先级低。

### 2. 抓链路
```
codegraph_explore("<XxxController/ServiceImpl> <核心动作>")
```
一次取回 Service 的 **verbatim 源码 + blast radius**。这是 Read-equivalent 的单次调用，token 效率远高于
逐文件 Read。若输出被预算截断，对具体方法名再发一次 explore，**不要据截断输出下结论**（见 redlines）。

### 3. 识别驱动机制
判断流程由什么驱动，决定调用链能否静态串通：
- **审批流 / 状态机回调**（startAfter / processAfter / stopAfter…）：反射调用，grep 串不起，CodeGraph
  `calls` 边能连通——这是双工具相比纯阅读的关键增量。
- **消息**（Kafka / MQ）、**RPC / feign**：跨进程，标注为跨域触点。
- **AOP / 事件监听**：动态织入，需 explore 确认。

### 4. 抽状态机
从**枚举**（如 `XxxFlowStatus` / `XxxStatus`）+ 各回调方法体，还原状态迁移。状态机是业务流程的骨架。

### 5. AI 即时翻译
把调用链翻成「动作 → 状态 → 跨域触点」叙事，标注影响面与测试缺口。
**输出给当下任务，不写成永久文档**（不变量 3）。

### 6. 回链校验
每个断言回链 `文件:行号`。AI 自检：「本叙事的每个状态迁移是否都有代码出处？」——无出处不采纳。
这是"错误基线比无基线更危险"的防线。

---

## 产物去向

- 步骤 1 的入口锚点 + 活查询命令 → 沉淀进 `02-business-flows.md`（薄、人审）。
- 步骤 2–6 的详细叙事 → **不沉淀**，每次按需现生成。
