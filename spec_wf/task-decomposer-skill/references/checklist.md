# task 阶段验收清单(唯一权威)

> 本清单是 task 阶段验收的**唯一权威**。其他文件不得复述验收条目。
> 字段语义见 [`../../shared/contracts/frontmatter-schema.md`](../../shared/contracts/frontmatter-schema.md);
> 承接域闭集见 [`../../shared/contracts/handover-domains.md`](../../shared/contracts/handover-domains.md);
> CDR 退出条件见 [`../../shared/protocols/cdr-protocol.md`](../../shared/protocols/cdr-protocol.md);
> 拆解原则见 [`./decomposition-rules.md`](./decomposition-rules.md);
> 越权红线见 [`./overreach-redlines.md`](./overreach-redlines.md)。

---

## §1 frontmatter 合规

- [ ] `change_name` 取值 kebab-case,与 proposal / spec / design 的 `change_name` 完全一致
- [ ] `status` ∈ `{draft, reviewed}`;CDR 退出前必须 `draft`
- [ ] `related_design` 取值为 design.md 相对路径,且文件系统真实存在
- [ ] `domain_modeling_level` ∈ `{L1, L2, L3}`,**与 design.frontmatter 完全一致**(沿用,不得改写)
- [ ] `bounded_contexts` ⊆ design.frontmatter `bounded_contexts`(子集语义,不得引入新 BC)
- [ ] `handover_domains` ⊆ `{database, backend, frontend, integration, infra}`(对齐 handover-domains §1 闭集)
- [ ] `exc_status` ∈ `{pending, in_progress, done}`(废弃旧"待执行/执行中/已完成/已阻塞"中文枚举)
- [ ] frontmatter 字段集 = 7 字段,无幽灵字段(对齐 schema §1 / §8 tasks.md);**严禁**写 `shipped_us`(由 workflow writeback 注入)

## §2 内容合规

- [ ] §1 拆解上下文四项齐全:`related_design / domain_modeling_level / bounded_contexts / handover_domains` 沿用规则均显式
- [ ] §2个 Task 的"承接方"取值是 handover-domains §1 5 个枚举之一(单选,不可"跨领域")
- [ ] §2 每个 Task 的"覆盖 spec 条目"在 specs 中真实存在(零幽灵 AC / INV / US)
- [ ] §2 每个 Task 的"关联 BC"在 `bounded_contexts` 中存在(L1 场景填 `—`)
- [ ] §2 每个 Task 的"关联 design 落点"指向 design §3 模块对外契约的具体模块
- [ ] §2 每个 Task 的"交付定义(DoD)"用业务态语言,不出现测试命令 / 覆盖率 / 部署 / 框架名(详见 overreach-redlines)
- [ ] §3 越权声明非空(对齐 design §6 越界声明)
- [ ] §4 进度表覆盖 §2 全部 Task,`exc_status` 列初始全为 `pending`

## §3 拆解粒度合规(详见 decomposition-rules)

- [ ] **同领域 + 不同 BC 必须拆分**(L2/L3 场景)
- [ ] **同领域 + 同 BC + 同业务动机可合并**;不同业务动机必须拆分
- [ ] **跨承接方禁止合并**:一条 Task 仅一个承接方
- [ ] **L1 场景字段降级**:Task 仅保留 4 字段(承接方 / 覆盖 REQ 或 US / 关联 design 落点 / 交付定义),"关联 BC" 取 `—`
- [ ] specs 中**全部** AC / INV / US 至少在某条 Task 的"覆盖 spec 条目"中出现一次(零遗漏)

## §4 协议合规

- [ ] 至少完成 1 轮 CDR(批注消化或显式驳回)
- [ ] CDR 退出条件全部满足后才把 `status` 升为 `reviewed`
- [ ] CDR 批注**反向 4 路分流**正确(规则见 [`./how-to-write.md`](./how-to-write.md) §CDR 反向分流):
  - [ ] 战略 / 规约范围批注 → 反推 design / spec(暂停本阶段)
  - [ ] 拆解粒度 / 承接方分配批注 → 直接消化
  - [ ] 实现技术细节批注(框架 / 库 / 部署) → 转交 dev skill
  - [ ] 工程闭环批注(测试 / 监控) → 转交 dev skill

## §5 上下游交接

- [ ] 文件路径 = `docs/spec/{change_name}/tasks.md`(单文件)
- [ ] **不写** `shipped_us` 字段(C1-4:由 workflow writeback 阶段注入)
- [ ] workflow 通过 `exc_status` 字段被动监听阶段切换(零命令名耦合)
- [ ] dev skill 通过 §2 Task 列表 + `handover_domains` 字段被动消费(本 skill 不调用 dev 任何命令)