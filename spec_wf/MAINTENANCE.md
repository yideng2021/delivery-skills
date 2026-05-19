# spec-wf 维护者指南

> 本文件**仅面向 skill 维护者**(修改 schema / validator / writer reference 的开发者)。
> 普通使用者无需阅读本文件,只需了解 [`scripts/validate.mjs`](scripts/validate.mjs) 一个入口即可,详见 [`spec-wf总结.md`](spec-wf总结.md)。

---

## 一、工具链总览(维护者视角)

spec-wf 对外仅暴露**一个**命令:

```bash
node scripts/validate.mjs <change-dir>
```

它合并了三层校验能力:
- 单文件 frontmatter schema 校验
- 跨阶段 invariant (I-A ~ I-F)
- audit 钩子 (C1 ~ C6,含 L3 留痕 / writeback 注释 / critic 格式 / needs_revision 老化)

维护者额外可用:

| 工具 | 位置 | 用途 |
|------|------|------|
| 回归测试 runner | [`eval/eval.sh`](eval/eval.sh) | 跑 [`eval/cases/`](eval/cases) 下 11 个 golden case,验证 schema/validator 改动未破坏既有规则 |
| Golden cases | [`eval/cases/`](eval/cases) | 11 个可执行的"规则说明书";case name 本身就是规则索引 |

---

## 二、回归测试(改 schema / validator 后必跑)

### 何时跑

| 修改对象 | 必跑 eval? |
|---------|----------|
| [`shared/contracts/frontmatter.schema.json`](shared/contracts/frontmatter.schema.json) | ✅ 必跑 |
| [`scripts/validate.mjs`](scripts/validate.mjs) | ✅ 必跑 |
| [`shared/contracts/*.md`](shared/contracts/) 词表/约定 | ⚠ 视改动影响面决定 |
| 任一 writer-skill 的 references | ❌ 不必跑(eval 只覆盖机械校验) |

### 怎么跑

```bash
cd skills/spec_wf/scripts && npm install     # 首次需要
bash skills/spec_wf/eval/eval.sh
```

预期输出:

```
  ✓ 01-greenfield-pass
  ✓ 02-extend-pass
  ✓ 03-fail-extend-missing-reused
  ...
  ✓ 11-fail-critic-bad-verdict

eval 结果: 11 通过 / 0 失败 / 11 总数
```

任一 case fail,会打印 validator 输出 + 期望偏差,据此回查 schema/validator 改动。

---

## 三、Golden Cases 索引(11 个)

每个 case 是一个最小 change 目录 + `expected.json`(声明期望的 exit_code、`must_match`、`must_not_match`)。

| Case | 目的 |
|------|------|
| 01-greenfield-pass | greenfield 模式最小可过案例 |
| 02-extend-pass | extend 模式最小可过案例(含 reused_modules / impacted_modules 等闭环) |
| 03-fail-extend-missing-reused | I-B 反例:extend 但 reused_modules 漏盖 impacted_modules |
| 04-fail-d4-duplicate-auth | I-E 反例:两个 spec 同时 own 同一 AUTH |
| 05-fail-legacy-related-specs | schema 反例:遗留废弃字段 |
| 06-greenfield-skip-zero | greenfield §0 折叠合法 |
| 07-needs-revision-status | F3 失败降级 + C4 writeback-failure 注释 |
| 08-l3-extended-pass | L3 + extended 全绿(C1 + C3 留痕) |
| 09-fail-l3-no-confirmation | C1 反例:L3 但缺 `<!-- l3-confirmation -->` 块 |
| 10-critic-pass | critic.md 五段结构合法(C5) |
| 11-fail-critic-bad-verdict | C5 反例:critic.md verdict 非法 |

> 新增规则时,建议**先在 [`eval/cases/`](eval/cases) 加一个 fail 案例**,确认 fail 之后再去改 validator——TDD 风格。

---

## 四、Audit 钩子设计原则(C1 ~ C6 演进规约)

C1 ~ C6 是 schema 抓不到的"软契约":

| 钩子 | 抓什么 |
|------|--------|
| **C1** | L3 升级必须有 `<!-- l3-confirmation -->` 留痕(verdict ∈ {1,2}) |
| **C2** | L2 时若残留 l3-confirmation 块,verdict 必须 == 3 |
| **C3** | `domain_model_mode=extended` 须 L3 + verdict==1 |
| **C4** | `exc_status=writeback_failed` 须有 `<!-- writeback-failure: ... -->` 注释 |
| **C5** | critic.md 五段格式 + frontmatter 必填 4 字段 |
| **C6** | needs_revision 持续 > 14 天 → soft 警告 |

**新增 C 钩子的规约**:
1. 必须能被脚本机械判定(正则 / 结构化解析,**不能**调 LLM)
2. 必须在 [`eval/cases/`](eval/cases) 加一个 fail 案例锚定
3. hard / soft 严重度需明确(soft 仅影响退出码=2,不阻断 workflow)

---

## 五、Schema 演进流程

1. 修改 [`shared/contracts/frontmatter.schema.json`](shared/contracts/frontmatter.schema.json)
2. 跑 `bash eval/eval.sh` → 看哪些 case 受影响
3. 如有非预期 fail → 修 case 或撤改动
4. 如有预期新增 fail → 新增 case + 更新本文件 §3 索引
5. 同步更新 [`shared/contracts/frontmatter-schema.md`](shared/contracts/frontmatter-schema.md) 人类可读文档
6. 在本文件 §八 演化路线表追加一行,记录改动批次与关键产出

---

## 六、依赖清单

[`scripts/package.json`](scripts/package.json):

- `ajv` + `ajv-formats` — JSON Schema 校验
- `js-yaml` — frontmatter YAML 解析

无其他重型依赖。`npm install` 仅安装这三个包及其传递依赖。

---

## 七、不再维护的旧工具(历史记录)

- `scripts/critic-checks.mjs` — 已并入 [`scripts/validate.mjs`](scripts/validate.mjs) 的 C1 ~ C6 段
- `scripts/estimate.mjs` — 已删除(成本预估改由 LLM 在 proposal 阶段粗估)
- `shared/protocols/cost-model.md` — 随 estimate.mjs 一并删除

---

## 八、演化路线(精炼)

> 本节是对历史四次重构(Batch 1/2/3 + 简化合并)的浓缩;仅保留对未来演进有指导价值的事实。

| 批次 | 解决的核心问题 | 关键产出 |
|------|--------------|---------|
| **Batch 1** 契约机械化 | 约束过载,缺少自动校验;`related_specs` 同名异义 | `frontmatter.schema.json` + `validate.mjs` + 6 条跨阶段 invariant;字段拆为 `reference_specs` / `produced_specs` |
| **Batch 2** 编排健壮性 | workflow 缺失败降级;CDR 反人类(强求手写批注);greenfield 仪式填充;L3 易被 LLM 单方面升级 | `failure-recovery.md` 3 路径 + 状态枚举扩充(`needs_revision` / `escalated` / `writeback_failed`);CDR 对话转译协议;greenfield §0 折叠;L3 ToolCall 确认门 + `<!-- l3-confirmation -->` 留痕 |
| **Batch 3** 范式升级 | audit 兜底负担过重;references 雷同;tasks.md 与 TodoWrite 重叠 | `spec-critic-skill`(LLM-as-Judge) + C1~C6 audit 钩子 + `writer-references-template.md` 骨架 + `tasks-to-todowrite.md` shadow output 协议 |
| **简化合并**(本次) | 工具链对外面过宽,门槛偏高 | `critic-checks.mjs` 合并入 `validate.mjs`;删 `estimate.mjs` / `cost-model.md`;eval 收敛为维护者用具(仅 `MAINTENANCE.md` 引导) |
| **RBK 对齐**(本次) | RBK 文档术语与 spec-wf 主体脱节(sibling 名错误 / 命令名硬编码 / U5 越界写 spec / D4 表述过时) | RBK 4 个文件按"字段被动握手 + 边界收紧"重写;USER-GUIDE §7.4 加 RBK 入口节;spec-wf总结目录树补 RBK 行 |
| **CG 闸门**(本次) | AI 凭半吊子需求一口气脑补 proposal,CDR 只做生成后兜底,缺失"生成前信息收集" | 新增 `shared/protocols/clarification-gate-protocol.md`;proposal-writer 不变量 §10 强制 CG;validate.mjs C7 audit;2 个 eval case;§4 示例展示 CG 块 |

> RBK(`requirements-bookkeeping-skill`)是 spec-wf 体系早期就存在的 sibling skill,**不属于** Batch 1/2/3 重构产物;它独立演进多轮后由本次对齐才与主体术语统一。

### 仍有效的设计决策(演进时务必尊重)

1. **字段拆分铁律** — `reference_specs`(spec 视角=既有锚) / `produced_specs`(design 视角=自产路径) 不可合并回 `related_specs`;`additionalProperties: false` 在生成边界即拒绝旧字段
2. **9 词统一动词词表** — 增量标注 / change_mode 等 5 处枚举的语义来源已收敛到 [`shared/contracts/change-verbs.md`](shared/contracts/change-verbs.md),新增枚举必须从该词表 sub-select,不允许自创
3. **失败必降级,不甩锅** — workflow 任何失败状态必须落到 frontmatter 字段(`needs_revision` / `escalated` / `writeback_failed`),不允许仅以日志或对话表�;详见 [`spec-design-workflow/references/failure-recovery.md`](spec-design-workflow/references/failure-recovery.md)
4. **L3 必经 ToolCall 确认门** — skill 严禁单方面把 `domain_modeling_level` 升 L3,详见 [`design-writer-skill/references/depth-confirmation.md`](design-writer-skill/references/depth-confirmation.md);C1 钩子机械校验留痕
5. **SKILL.md 入口 ≤ 65 行** — 渐进披露的硬指标,新增能力时优先下沉到 references/,不堆 SKILL.md

### SKILL.md 行数预算(回归监控用)

| 文件 | 上限 | 说明 |
|------|-----|-----|
| 4 个 writer SKILL.md | ≤ 65 行 | 入口路由 + 触发条件 + 不变量 + 文件导航;不复述规则 |
| `WORKFLOW.md` | ≤ 200 行 | 状态机 + 转移条件表(正向 / 失败降级两节) |

修改 SKILL.md 时若必须超出,先评估能否下沉到 references/。

---

## 九、未来候选(Batch 4 备选项)

> 来自历史 CHANGELOG 的待办池,无承诺时间表;若发起新一批重构,优先从此处选题。

- **P1-2 跨阶段 checklist 边界** — `workflow/跨阶段 checklist` 与各 writer 自带 `references/checklist.md` 存在职责重叠
- **Capability Map ↔ specs 拓扑可视化** — 输出 mermaid 图便于 review
- **多 change 并发 audit** — 一次扫整个 `docs/spec/*/`,而非逐 change 跑
- **CDR 历史回放** — 把 `<!-- comment-from-chat -->` 系列批注做成事件流