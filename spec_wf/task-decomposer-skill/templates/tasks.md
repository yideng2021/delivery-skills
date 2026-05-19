---
change_name: {change_name}
status: draft
related_design: design.md
domain_modeling_level: L1
bounded_contexts: []
handover_domains: [backend]
exc_status: pending
---

> 红骨架。规则讲解全部在 [`../references/`](../references/);字段语义见 [`shared/contracts/frontmatter-schema.md`](../../shared/contracts/frontmatter-schema.md);承接域见 [`shared/contracts/handover-domains.md`](../../shared/contracts/handover-domains.md)。

# {change-name} Tasks

## §1 拆解上下文

- **关联 design**:见 frontmatter `related_design`
- **建深度**:沿用 design.frontmatter `domain_modeling_level`
- **限界上下文**:沿用 design.frontmatter `bounded_contexts`
- **承接域并集**:见 frontmatter `handover_domains`

## §2 任务清单

### §2.1 Task-1 · {一句业务动机}

- **承接方**:`backend`
- **覆盖 spec 条目**:`AC-{req}-01` / `INV-1` ← `{spec-file-1.md, spec-file-2.md}`
- **关联 BC**:`BC-{name}`(L1 场景填 `—`)
- **关联 design 落点**:§3 模块 `{module-name}` 对外契约
- **交付定义(DoD)**:{一句业务态变化,不写测试命令}

### §2.2 Task-2 · {一句业务动机}

- **承接方**:`frontend`
- **覆盖 spec 条目**:`US-101` ← `{spec-file.md}`
- **关联 BC**:`—`
- **关联 design 落点**:§3 模块 `{module-name}` 对外契约
- **交付定义(DoD)**:{一句业务态变化}

## §3 越权声明(显式不做)

- 不实现 design §6 已声明越界的子系统
- 不引入未在 `handover_domains` 中声明的承接域

## §4 进度表

| 任务 | 承接方 | exc_status |
|------|--------|-----------|
| Task-1 | `backend` | `pending` |
| Task-2 | `frontend` | `pending` |