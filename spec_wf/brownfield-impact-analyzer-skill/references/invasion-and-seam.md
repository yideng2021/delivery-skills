# 侵入阶梯 + 接缝识别(§4)

> 本文件是 `impact.md` §4「侵入与接缝建议」的写法权威。SKILL.md 不复述本文条目。
> 理论依据:Feathers《Working Effectively with Legacy Code》(seam);Open/Closed Principle(OCP)。
>
> **枚举归属声明**:本文件的 `invasion_tier`(5 级)与"接缝种类"(4 种)是 **impact.md 局部词表**,
> 描述"如何注入改动"(与 change-verbs 的"对既有资产做什么"是正交轴),**不属于** [`change-verbs.md`](../../shared/contracts/change-verbs.md) 动词、**不进**主 schema,因此无需扩 change-verbs 注册。

---

## §1 五级侵入阶梯(闭集,**优先级从弱到强**)

| 级 | 阶梯 | 适用 | 代价 |
|----|------|------|------|
| 1 | `new_file` | 完全新增能力,既有代码零触碰 | 最小;可能与既有重复(由 §3 复用充分性自检兜底) |
| 2 | `composition` | 在新文件中**组合**既有类 / 模块,通过依赖注入接入 | 小;要求既有代码已可被注入 |
| 3 | `inheritance` | 继承既有类,**覆写**或**扩展**特定方法 | 中;受制于既有类是否 `open`/`virtual` 与可见性 |
| 4 | `decorator` | 包装既有对象,在不改其代码的前提下织入新行为 | 中;装饰器**不能**访问私有字段(误用会触发反射 → 进入隐式破坏) |
| 5 | `modify_existing` | **直接修改既有方法/字段** | 最大;§5 应给降耦合原则,并提示下游(spec DoD / dev)补特征测试钉住既有行为 |

> **选档准则**:从 1 级开始**逐级评估**,**只在低级不可行时**升级;每升一级,在 §4 理由中显式给出"为何下一级不可行"。

### §1.1 反例:硬禁 `modify_existing` 是伪两难

> 真实场景:`ConfigLoader.load()` 内部空指针,根因在该方法私有字段读取逻辑。
>
> - 硬禁修改既有方法 → 选 `decorator` → 装饰器无法访问私有字段 → 被迫反射 → 触发"隐式破坏"红线 → **死循环**
> - 正解:**允许 `modify_existing`,但在 §5 给降耦合原则**(如 Branch by Abstraction),由 design/spec 决定具体落地、由 dev 补特征测试
>
> 因此本 skill **不**硬禁第 5 级——侵入阶梯是**诊断结论**,改既有方法的安全处置(测试/回滚)交下游,不由本 skill 设门。

### §1.2 §4 表填写规则

- **推荐侵入阶梯**:闭集五选一,写枚举值
- **理由**:必须显式回答两问 ——「为什么这一档够」+「为什么下一档(更弱档)不够」
- **多档并存**:若改动天然分两块(如新建文件 + 改既有钩子),拆两行声明;**最高档**决定 `frontmatter.invasion_tier`

---

## §2 四类接缝(seam,Feathers)

| 接缝 | 定义 | 何时优先 |
|------|------|---------|
| **构造器注入** | 通过构造函数把依赖换成可控对象 | 既有类已显式接受依赖参数;DI 容器已就绪 |
| **工厂替换** | 替换既有对象的生产路径(工厂方法 / 静态工厂 / Service Locator) | 全局单例 / 静态访问点;难以从调用方注入 |
| **接口扩展** | 在既有接口上扩展可选方法;调用方按能力探测 | 跨多实现的契约层;不想破坏已有实现 |
| **子类覆写** | 通过子类覆盖既有方法行为 | 既有类 `open`/`virtual`;调用方走基类引用 |

> 这四种不是平行选项;它们与 §1 侵入阶梯**正交配合**:阶梯说"动到什么层级",接缝说"在哪儿切入"。

### §2.1 接缝勘察顺序(AI 自查)

1. 受改符号的调用点反链:确认改动**入口**在哪
2. 受改符号周边的可见性 / 修饰符:`final`/`sealed`/`private`/`internal` → 切除部分接缝
3. 现有 DI 容器 / 工厂:复用 > 新造
4. 已存在的接口或抽象类:**优先扩展接口**而非创建并行抽象

### §2.2 §4 接缝表填写规则

- **接缝种类**:四闭集词
- **位置**:写到**符号粒度**(`path/to/file.ts::OrderService.cancel`),不写"OrderService 这块"
- **用途**:一句话,**含动作 + 目标**(如「替换 PaymentGateway 实现,隔离退款异步化对原同步路径的污染」)

---

## §3 复用充分性自检(三问,与 design `[新增]` ADR 同构)

> 与 [`../../design-writer-skill/references/existing-architecture-landscape.md`](../../design-writer-skill/references/existing-architecture-landscape.md) §5「复用充分性三问」**同构**——本 skill 是 design ADR 三问的**早期前置**。

每条 `invasion_tier == new_file` 的候选,在 §4 理由中必须回答:

1. 已检索 proposal §0.2 / spec `impacted_modules`,确认无可复用既有模块?
2. 已检索代码仓库相同 capability 的现存实现(关键词 + 反链),确认无 80% 重叠?
3. 为何新建而非扩展既有接口 / 装饰既有对象?

> 三问任一无法回答 → 降级到 §1 更高阶梯(`composition`/`inheritance`/`decorator`),或在 §5 给降耦合原则,交 design 阶段 ADR 评估。

---

## §4 触达既有方法的判定(交下游处置)

- `invasion_tier ∈ {new_file, composition, inheritance, decorator}` ∧ 不触达既有方法 → 影响面小,§5 通常无需重型降耦合规则
- `invasion_tier == modify_existing` **或** 接缝触达既有方法内部逻辑(如 `子类覆写` 改既有受保护方法) → §5 应给出降耦合原则(如 Branch by Abstraction),并提示下游(spec DoD / dev)补特征测试钉住既有行为

> 判定"是否触达既有方法"以**代码行为**为准,不以**文件位置**为准:在新文件里**通过反射改既有私有字段**仍算 `modify_existing`(且违反隐式破坏红线)。
> 注:本 skill **不**登记 / 编写特征测试、**不**设计回滚——只在 §5 指出方向,处置交 spec/design/dev。

---

## §5 常见反模式(命中即重写本节)

- ❌ 不给"为何下一档不够"理由就直接选 `modify_existing`(诚实性不足)
- ❌ 接缝位置写到文件粒度而非符号粒度
- ❌ 用反射 / monkey-patch / 字节码增强**绕过**封装,但 `invasion_tier` 仍写 `decorator`(隐式破坏)
- ❌ 复述 [`../../shared/contracts/change-verbs.md`](../../shared/contracts/change-verbs.md) 词表(只能链接)
- ❌ 把"我觉得这样更优雅"写成理由(必须基于**可见性 / 调用方 / 既有抽象**等事实)

---

## §6 与下游 references 的边界

- 低耦合/低影响设计规则目录 → [`design-rules.md`](./design-rules.md)
- 冲突识别 / 影响评估 → [`conflict-and-impact.md`](./conflict-and-impact.md)
