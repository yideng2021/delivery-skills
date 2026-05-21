---
name: prototype-templates
description: 模板策展 skill。当用户需要基于一份原型设计输入文档（`input-design.md`，由 prototype-input-design 生成或手写均可）在工程内初始化可复用的原型基础设施时使用。典型触发语："初始化原型模板"、"按这份输入文档搭模板"、"看看有没有合适的原型模板"、"新增一种原型模板风格"。本 skill 职责：**读 input-design.md → 在 skill 自带模板库中匹配 → 已命中且工程已初始化则跳过；未初始化则从库拷到工程；未命中则与用户共创一个新模板、入库、再初始化**。产物落在工程的 `docs/prds/` 根层（`_shared/`、`_template-<id>/`、`_templates.md`、`_index.md`、`index.html`），不触碰业务模块目录。与 prototype-input-design、prototype-generation 无强依赖，可独立运行；完成后明示用户切到 prototype-generation 生成业务原型。
---

# 原型模板策展

本 skill 专职**模板库维护 + 工程基础设施初始化**。两个职责共一个入口：吃一份 `input-design.md`，吐一套可被 prototype-generation 直接消费的 `docs/prds/` 基础设施。

**核心理念**：模板库自包含（在 skill 内）、工程自包含（库内容整体拷到工程，不引用 skill 路径）、不强依赖上下游 skill、命中优先复用、未命中再共创。

## 职责边界

**✅ 做**
- 读用户指定的 `input-design.md`，提取匹配信号
- 扫 skill 自带模板库 `templates/prds/_templates.md` 做匹配
- 若命中：检查工程 `docs/prds/` 是否已就绪，按需整体或增量拷贝
- 若未命中：与用户共创新模板 → 写入 skill 库 → 再初始化到工程
- 维护工程根层：`_shared/`、`_template-<id>/`、`_templates.md`、`_index.md`、`index.html`

**❌ 不做**
- 不生成/修改业务模块 `docs/prds/<业务模块>/`（那是 prototype-generation 的地盘）
- 不写/改 `input-design.md`（那是 prototype-input-design 的地盘）
- 不从工程反向同步到 skill 库（库演进由本 skill 自身维护）
- 不自动升级已存在的工程模板（只提示，不覆盖）

## 何时使用

**适用**
- 工程首次启用原型体系，`docs/prds/` 为空或没有 `_shared/`
- 现有 `_shared/` 就绪，但要新增一种形态（如已有 PC 后台，想加移动 H5）
- prototype-generation 报告"无匹配模板 / `_shared/` 缺失"并挂起
- 用户主动想新增/扩展模板风格

**不适用（转到别的 skill）**
| 情况 | 正确路径 |
|---|---|
| `input-design.md` 还没有 / 没整理 | `prototype-input-design` |
| 基础设施已就绪，要生成具体业务原型 | `prototype-generation` |
| 仅调业务原型的字段/视觉 | `prototype-generation` |

## 输入契约

| 输入 | 位置 | 必需 | 说明 |
|---|---|---|---|
| 业务需求输入 | 用户提供的 `input-design.md` 路径 | 是 | 可以是 `docs/prds/<业务模块>/input-design.md`，也可以是手写的文件 |
| skill 模板库 | `skills/prototype-templates/templates/prds/` | 是 | 本 skill 自带，包含 `_templates.md` 注册表与各 `_template-<id>/` 实体 |
| 工程当前状态 | `docs/prds/` | 是 | 读以判断是否已初始化 |

## 产物清单

| 产物 | 位置 | 何时写 |
|---|---|---|
| 工程基础设施 | `docs/prds/_shared/` | 工程首次初始化时整体拷入 |
| 工程模板实体 | `docs/prds/_template-<id>/` | 命中的模板尚未入工程时拷入 |
| 工程模板注册表 | `docs/prds/_templates.md` | 首次初始化时创建；新增模板时追加一行 |
| 工程全局索引 | `docs/prds/_index.md` | 首次初始化时创建 |
| 工程演示入口 | `docs/prds/index.html` | 首次初始化时创建 |
| skill 库新模板 | `skills/prototype-templates/templates/prds/_template-<新id>/` | 共创产出时写入 |
| skill 库注册表更新 | `skills/prototype-templates/templates/prds/_templates.md` | 共创产出时追加一行 |

## 核心流程（4 阶段）

```
阶段 1 解析输入 → 阶段 2 匹配模板库 → 阶段 3 工程初始化
                                          ↘ 未命中时
                                       阶段 4 共创新模板 → 回阶段 3
```

### 阶段 1：解析输入

读用户指定的 `input-design.md`，提取以下**匹配信号**（尽量从文档显式字段拿，没有的留空不猜）：

- **form-factor**：PC 后台 / 移动 H5 / 数据大屏 / 其他
- **目标用户**：B 端员工 / C 端消费者 / 混合
- **页面类型集合**：列表页 / 详情页 / 表单页 / 仪表盘 / 流程页 / 其他
- **视觉倾向**：企业稳重 / 轻量活泼 / 数据沉浸 / 未指定
- **业务领域关键词**：从"业务名称"、"模块结构"节摘取（管理、风控、合规、运营、画像…）

**不要**自己脑补未写出的信号；缺就是缺，缺的信号不参与匹配。

### 阶段 2：匹配模板库

读 `skills/prototype-templates/templates/prds/_templates.md`，按各模板的"命中信号"逐条核对：

- **命中（≥2 条信号匹配）**：声明命中模板 ID，进入阶段 3
- **弱命中（仅 1 条）**：向用户确认"是否复用 `<id>`？" → 用户认可则进入阶段 3；否则进入阶段 4
- **未命中（0 条）**：直接进入阶段 4

输出格式示例：
```
📋 匹配结果
  输入信号：PC 后台 / B 端员工 / 列表+详情+表单 / 企业稳重
  命中模板：pc-admin-standard（信号命中 4/4）
  下一步：检查工程是否已初始化
```

### 阶段 3：工程初始化

扫工程 `docs/prds/`，按下列三态决策：

| 情形 | 判断依据 | 动作 |
|---|---|---|
| 工程未初始化 | 无 `docs/prds/` 或无 `_shared/` | 从 skill 库 `templates/prds/` 整体拷贝（含 `_shared/`、命中的 `_template-<id>/`、`_templates.md`、`_index.md`、`index.html`） |
| 基础设施在，模板缺 | 有 `_shared/`，无命中模板的 `_template-<id>/` | 只拷 `_template-<id>/`，并在工程 `_templates.md` 追加登记行 |
| 模板已存在 | 已有 `_template-<id>/` | **跳过拷贝**，输出"已就绪"提示 |

**对已存在的工程模板**：不做版本比对、不覆盖、不升级。若用户明确提"升级模板"再单独处理（不在首次初始化流程内）。

### 阶段 4：共创新模板

仅在阶段 2 未命中时进入。通过**五问**快速收敛新模板的形态定义，不追求一次完美：

1. **form-factor**：PC 桌面 / 移动 H5 / 数据大屏 / 其他（选一）
2. **主色调与视觉风格**：给一个主色 HEX + 一句风格形容（如"深蓝 #1e3a8a，企业稳重"）
3. **覆盖的页面类型**：列出 2-4 种（如"列表 + 详情 + 表单"）
4. **典型场景与目标用户**：一句话（如"B 端企业后台，管理员使用"）
5. **演示业务选型**：用哪个业务做 demo（如"员工管理"、"设备巡检"）——允许留空，表示先出骨架

回答齐全后：

1. 在 skill 库新建 `templates/prds/_template-<新id>/`：至少包含 `input-design.md`（记录形态定位）、`iteration-log.md`（初始化记录）、`prototype/` 骨架（可先留 `pages/README.md` 占位，不强制立刻填满演示页）
2. 在 skill 库 `_templates.md` 追加注册行与命中信号速查
3. 回到阶段 3 完成工程初始化

**原则**：共创只定义**形态与匹配信号**，不要求当场把所有演示页都生成出来。演示页可后续通过 prototype-generation 或手动补齐。

## 交接协议

完成阶段 3 后，**必须**输出固定格式的引导：

```
✅ 原型基础设施已就绪
   工程路径：docs/prds/
   已注册模板：<id>（来自 skill 库 / 本次共创）

下一步：切到 prototype-generation 生成业务原型。
  触发语示例："基于 docs/prds/<业务模块>/input-design.md 生成原型"

本 skill 会在以下情况被再次唤起：
  - 需要新增一种形态的模板
  - prototype-generation 报告无匹配模板或基础设施缺失
```

## 与其他 skill 的独立性

- **不依赖 prototype-input-design**：`input-design.md` 可以是 A 产出，也可以是用户手写；本 skill 只读取其中的匹配信号字段
- **不依赖 prototype-generation**：本 skill 完成后即退出；B 独立消费本 skill 的产物
- **B 挂起时的协作契约**：B 在 `docs/prds/_templates.md` 缺失或无匹配时会输出引导语，用户看到后触发本 skill。本 skill 完成后同样输出引导语，用户再回到 B。**两者之间不做自动调度**

## 关键原则

1. **库自包含**：skill 内 `templates/prds/` 是完整可拷贝产物，不引用外部路径
2. **工程自包含**：初始化完成后，工程 `docs/prds/` 不依赖 skill 路径也能独立运行
3. **命中优先**：能复用就不共创；共创只是兜底
4. **只扩不改**：对工程已有内容只追加注册行；不覆盖、不升级、不迁移
5. **最小共创**：新模板共创只定义形态与匹配信号，演示页可后补
6. **边界清晰**：不碰业务模块目录、不碰 `input-design.md`、不碰工程侧业务代码

## 资源索引

| 场景 | 位置 |
|---|---|
| skill 自带模板库（可拷贝基线） | `templates/prds/` |
| 模板注册表（匹配信号源） | `templates/prds/_templates.md` |
| 现有模板实例参考 | `templates/prds/_template-pc-admin-standard/` |
