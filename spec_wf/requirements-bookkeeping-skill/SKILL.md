---
name: requirements-bookkeeping
description: >
  项目级需求账本与里程碑路线图的维护 skill,扮演"记账员"角色——只管账本不写 change 文件。
  维护 `docs/spec/REQUIREMENTS.md`(必有)与 `docs/spec/ROADMAP.md`(可选)。
  与 spec-wf 主体(4 个 writer + workflow)通过 frontmatter 字段被动协作,**零命令名耦合**。
  当用户表达"初始化项目账本"/"登记新需求 AUTH-xx"/"{change} 上线了"/"反向登记账本"/"审计账本"时触发。
---

# Requirements Bookkeeping — 项目级需求账本

> **定位**:spec-wf 体系中的"项目级账本聚合";4 个 writer + workflow 是 change 级,本 skill 是项目级,两者**正交**。
> **协作纪律**:仅通过 frontmatter 字段 `req_ledger_state` / `related_req` / `shipped_us` 被动握手;不被任何 writer / workflow 直接调用。
> **可独立运行**:用户可绕开 spec-wf 主体单独使用本 skill 维护账本。

---

## 不变量(Meta-Constraints)

| #   | 约束                       | 说明                                                                                       |
| --- | -------------------------- | ------------------------------------------------------------------------------------------ |
| M1  | **纯 Markdown 维护**       | 不依赖 CLI / SDK 命令;所有维护通过 markdown 编辑完成                                       |
| M2  | **append-only 默认**       | 已上线(`[x]`)的条目永不删除/修改 ID;废弃的需求标记为"撤销区"段,不删行不复用 ID            |
| M3  | **幂等可重入**             | 任何用例可独立重跑,不破坏已有数据                                                          |
| M4  | **职责边界**               | 只写 `docs/spec/REQUIREMENTS.md` 与 `docs/spec/ROADMAP.md`;**绝不修改任何 change 内文件**  |
| M5  | **D4 强约束**(lifelong)    | 一条 AUTH-ID 在任意时刻**只能归属一个 spec**;归属可在迭代间整体迁移(详见 [`../spec-writer-skill/references/req-convergence.md`](../spec-writer-skill/references/req-convergence.md) §1.1) |
| M6  | **禁止手动改 checkbox**    | 账本中的 `[x]` 必须由本 skill 在 ship/writeback 用例中写入;用户手动改会触发 audit 警告      |
| M7  | **Diff 优先**              | 所有写操作必须先生成 diff 给用户确认,不直接覆盖                                            |

---

## 核心用例(5 个;U3 二期)

| # | 用例           | 触发语                          | 状态  | 简述                                |
| - | -------------- | ------------------------------- | :---: | ----------------------------------- |
| U1 | `init`         | "初始化项目需求账本"           | ✓     | 建 `REQUIREMENTS.md` 骨架(可选 ROADMAP) |
| U2 | `add-req`      | "登记新需求 AUTH-xx"           | ✓     | 追加单条需求,分配 AUTH-ID           |
| U3 | `plan-milestone` | "规划 v1.1"                    | ✗ 二期 | 里程碑跃迁、批量挂载 AUTH           |
| U4 | `ship`         | "{change} 上线了"              | ✓     | 监听 `shipped_us` 字段打勾对应 AUTH |
| U5 | `writeback`    | "把这个 change 反向登记到账本" | ✓     | 从 spec 反向归纳 AUTH 候选,登记到账本 |
| U6 | `audit`        | "审计账本"                     | ✓     | 只读;输出 R1-R8 漂移报告           |

---

### U1 `init` — 初始化账本

**输入**:项目名 + 模式(`empty` / `from-prd` / `from-existing`)

**关键动作**:
1. 检查 `docs/spec/REQUIREMENTS.md` 是否存在(存在则提示合并/覆盖)
2. 按模式生成骨架:`empty` 仅空骨架;`from-prd` 从 PRD 提取 5-15 条候选 AUTH;`from-existing` 扫描 `docs/spec/{*}/specs/*.md` 反推
3. 询问是否同步建 `ROADMAP.md`(默认否)
4. 生成 diff,确认后落盘

### U2 `add-req` — 登记新需求

**输入**:`description` + `category`(可选) + `version`(v1 / v2 / out-of-scope)

**关键动作**:
1. 读 `REQUIREMENTS.md` 计算目标 Category 当前 max(NUMBER)
2. 分配 ID = max + 1(废弃 ID **不复用**)
3. 写入对应段;若 ROADMAP 存在且 version=v1,询问里程碑归属
4. 生成 diff,确认后落盘

### U4 `ship` — 标记 change 已上线

**触发**:用户语义触发(例 "user-signup 上线了"),或本 skill 通过定期扫描发现 `docs/spec/{change}/tasks.md` 已含 `shipped_us` 字段。

**输入(字段驱动,非 JSON 调用)**:读取 `docs/spec/{change_name}/`:
- `tasks.md` 的 `shipped_us` 字段(由 workflow writeback 阶段写入,见 [`../spec-design-workflow/references/handshake-rbk.md`](../spec-design-workflow/references/handshake-rbk.md) §4)
- `specs/*.md` 的 `related_req` 与 L1 US `关联 REQ`(US → AUTH 映射)

**关键动作**(基于 D4):
1. 对每条 AUTH-ID:统计本 spec 内被哪些 US 关联(covered_us)
2. 判定:`covered_us ⊆ shipped_us` ? 是→ `[ ]` 翻 `[x]`;否→ 仅更新 Spec Index 进度
3. 更新 `Last updated` 字段
4. 生成 diff,确认后落盘

> **未指定 `related_req`**:提示用户改走 U5 writeback。

### U5 `writeback` — 反向登记 change

**输入**:`change_name`

**关键动作**(收窄边界):
1. 读 `docs/spec/{change_name}/proposal.md` + `specs/*.md`
2. 从 L1 US / L3 REQ 标题反向归纳 AUTH 候选(建议 ID + 描述 + 覆盖 US 列表)
3. 用户确认后:
   - **本 skill 写**:在 `REQUIREMENTS.md` 追加 `- [x] AUTH-xx`(已上线状态)
   - **本 skill 不写 change 内文件**:打印一份"建议 spec frontmatter 改动" diff,**提示用户调 spec-writer 修正**,本 skill 不直接写 spec(M4)
4. 严守 D4:归纳出的 AUTH 不得与其他 spec 的 `related_req` 冲突

### U6 `audit` — 账本审计(只读)

扫描账本 + 各 change 的 frontmatter / tasks,输出 R1-R8 漂移报告(规则详见 [`references/audit-checklist.md`](references/audit-checklist.md))。不修改任何文件。

---

## 与 spec-wf 主体的字段握手

> 详见 [`references/handshake-protocol.md`](references/handshake-protocol.md)。本表是入口摘要,**不复述**字段流向图。

| 字段 | 写方 | 本 skill 行为 | 时机 |
|------|------|--------------|------|
| `proposal.req_ledger_state` | proposal-writer | 监听:`missing` → 主动建议用户触发 U1;`present` → 不动 | proposal 起草后 |
| `proposal.related_req_proposal` | proposal-writer | 监听:列表中若含未登记 AUTH-ID → 提示用户触发 U2 | proposal 起草后 |
| `specs/*.md.related_req` | spec-writer | 监听:用于建立 AUTH ↔ spec 单点归属(D4);U4/U6 阶段读 | spec 落地后 |
| `tasks.md.shipped_us` | workflow(writeback) | 监听:触发 U4 ship 流程 | tasks `exc_status: done` 后 |

**严禁事项**:
- ❌ 本 skill 写 `proposal.md` / `specs/*.md` / `design.md` / `tasks.md` 任何字段或正文(M4)
- ❌ 任何 writer skill / workflow 直接"调用"本 skill 的用例(零命令名耦合)
- ❌ 把 D4 表述为"一 AUTH 一 Spec 永远";正确表述见 M5 "lifelong 唯一 + 归属可迁移"

---

## ID 命名规则

完整形式:`{CAT4}-{NN}[{suffix}]`,如 `AUTH-01` / `CONT-23` / `AUTH-10a`。

| 维度       | 规则                                                                       |
| ---------- | -------------------------------------------------------------------------- |
| Category   | 4 字母大写缩写(AUTH / CONT / SOCL / PMT 等);稳定不重命名                 |
| NUMBER     | 同 Category 内严格递增两位起步;**废弃 ID 不复用**                          |
| 拆分变体   | 业务需细分时用小写字母后缀:`AUTH-10a` / `AUTH-10b`(D4 整体迁移触发的拆分) |

详见 [`references/req-id-convention.md`](references/req-id-convention.md)。

---

## 产出物清单

```
docs/spec/
├── REQUIREMENTS.md          # 必有,本 skill 维护
└── ROADMAP.md               # 可选,本 skill 维护
```

**绝不修改**:`docs/spec/{change_name}/` 下任何文件正文或 frontmatter(M4)。

---

## 文件导航

| 文件                                | 用途                                    |
| ----------------------------------- | --------------------------------------- |
| [`templates/requirements.md`](templates/requirements.md) | REQUIREMENTS.md 骨架(U1 用)         |
| [`templates/roadmap.md`](templates/roadmap.md)           | ROADMAP.md 骨架(可选;U1/U3 用)      |
| [`references/req-id-convention.md`](references/req-id-convention.md)   | AUTH-ID 命名 / 撤销 / 拆分细则        |
| [`references/handshake-protocol.md`](references/handshake-protocol.md) | 与 spec-wf 主体的字段握手协议         |
| [`references/audit-checklist.md`](references/audit-checklist.md)       | U6 audit 的 R1-R8 规则手册            |

---

## 写操作前安全清单

- [ ] 是否生成 diff 让用户确认?(M7)
- [ ] 是否会修改已存在的 `[x]` 行?(除非由 `[ ]` 翻为 `[x]`,否则禁止;M2/M6)
- [ ] 是否会复用废弃的 AUTH-ID?(禁止)
- [ ] 是否会跨界修改 `proposal.md` / `specs/*.md` / `design.md` / `tasks.md`?(禁止;M4)
- [ ] 是否会让一条 AUTH 同时归属 2 个 spec?(违反 D4;M5)