# 逐域深描法（域级编排）

> 把一个核心业务域展开成自洽完整的 `domain-*.md`。本法是**域级编排**:在 6 步流程重建法之上,
> 对域内多条主流程逐一重建,再拼装成域叙事。
> 6 步法本体:[`../../brownfield-onboarding-skill/references/reconstruction-method.md`](../../brownfield-onboarding-skill/references/reconstruction-method.md)。

---

## 输入

- `01-architecture.md` 中该域的行:域名 / 包 / 社区标签 / 社区规模 / 核心 Controller / 职责
- (可选)`02-business-flows.md` 中该域的入口锚点

## 域级 5 步

### D1 锚定域
确定域的代码边界:
- 包:`controller/<域>`、`service/<域>`、`dao/<域>`、`domain/<域>`(`codegraph_files` 确认)
- 社区:`cypher: MATCH (f)-[:CodeRelation{type:'MEMBER_OF'}]->(c:Community{heuristicLabel:'<域>'}) RETURN f.name`
- 核心实体:域内 entity + 关键状态枚举

### D2 列域内主线流程
取该域 Controller 的**写操作路由**(add/submit/start/process/confirm/cancel…)作为流程入口清单。
辅以 `gitnexus query(goal="<域> 核心业务")` 取流程骨架。读操作(page/list/get)归为"查询能力",不逐条深描。

### D3 逐流程跑 6 步法
对 D2 每条主流程,执行 6 步重建法(选入口→explore抓链→识别驱动机制→抽状态机→AI翻译→回链校验)。
**每条流程的断言都回链 `文件:行号`**。

### D4 拼装域叙事(填 domain-guide 模板)
按固定骨架组织:
1. **域职责**:一段话 + 边界(它管什么、不管什么)
2. **核心实体与状态机**:实体清单 + 关键状态枚举的迁移图(域的骨架)
3. **主线流程**(多条):每条 = 入口 → 状态迁移 → 关键分支 → 落点;带回链
4. **域间依赖**:本域调用/被调用的其他域(`codegraph_callers`/`callees` 跨包统计)
5. **跨域触点**:MQ(Kafka)/RPC(feign)/外部系统/定时,逐个标位置
6. **关键约束与技术债**:校验规则、事务边界、已知坑(代码注释/异常分支透露的)
7. **测试缺口**:explore blast radius 标注的"⚠️ no covering tests"

### D5 反哺全景
把本域的"主线 + 上下游依赖"摘要交给 `00-index.md` 的跨域全景(G4)拼采购全链路。

---

## 质量门(每份 domain-*.md 必须满足)

- [ ] 每个状态迁移、每条调用结论都有 `文件:行号` 出处
- [ ] 状态机来自真实枚举,非臆造
- [ ] 跨域触点(MQ/RPC/外部)无遗漏(对照 D3 各流程的 explore 输出)
- [ ] 可独立通读理解(不依赖读者去查 MCP),但保留锚点供深入
- [ ] 头部含快照声明块(见 snapshot-discipline)

> 若 explore 输出被预算截断,对具体方法名再发一次,**不据截断片段下结论**(防幻觉)。
