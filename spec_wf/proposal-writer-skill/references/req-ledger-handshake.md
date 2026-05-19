# Req-Ledger Handshake — 项目级需求账本对接细则

> proposal-writer 与项目级需求账本(`docs/spec/REQUIREMENTS.md`,由 RBK skill 维护)之间的协作细则。
> **核心原则**:proposal-writer **不直接写**任何账本文件;协作完全通过 frontmatter 字段 `req_ledger_state` 与 `related_req_proposal` 被动驱动。

---

## §1 角色与边界

| 角色 | 职责 | 禁令 |
|------|------|------|
| proposal-writer | 读取账本是否存在;在 frontmatter 写入 `req_ledger_state` 与 `related_req_proposal` | 严禁写入 / 修改 `docs/spec/REQUIREMENTS.md` |
| RBK skill | 监听字段被动响应;维护 `docs/spec/REQUIREMENTS.md` | 不参与本 skill 的执行流程 |
| 用户 | 在意图分歧时做出选择(关联现有 / 新增 / 跳过) | — |

---

## §2 `req_ledger_state` 三状态语义

| 取值 | 触发条件 | 后续动作 |
|------|---------|---------|
| `present` | 仓库存在 `docs/spec/REQUIREMENTS.md` 且本次 change 已识别相关 AUTH-ID | 把识别到的 AUTH-ID 列表写入 `related_req_proposal` |
| `missing` | 仓库不存在 `docs/spec/REQUIREMENTS.md` | `related_req_proposal: []`;后续可由 RBK 监听 `missing` 状态主动建议初始化账本 |
| `skipped` | 仓库存在账本但用户显式选择"暂不关联,后续 writeback" | `related_req_proposal: []`;writeback 阶段 workflow 负责对齐 |

> 上述三状态是**闭集**;不允许扩展为 `outdated` / `pending` 等其他取值。

---

## §3 判定流程

```
1. 检查文件是否存在: docs/spec/REQUIREMENTS.md
   ├─ 不存在 ──▶ req_ledger_state: missing
   │            related_req_proposal: []
   │
   └─ 存在 ──▶ 询问用户本次 change 关联意图
              ├─ "关联现有 AUTH-ID" ──▶ req_ledger_state: present
              │                          related_req_proposal: [识别到的 AUTH-ID 列表]
              ├─ "新增 AUTH-ID"     ──▶ req_ledger_state: present
              │                          related_req_proposal: [新 AUTH-ID 占位列表]
              │                          (实际新增由 RBK 监听字段后被动响应)
              └─ "暂不关联"         ──▶ req_ledger_state: skipped
                                        related_req_proposal: []
```

> proposal-writer 仅完成**字段写入与提示**;任何对 REQUIREMENTS.md 的改动均由 RBK skill 在监听到字段后被动执行。

---

## §4 写读契约

| 字段 | 写入方 | 读取方 | 时机 |
|------|--------|--------|------|
| `req_ledger_state` | proposal-writer | RBK / workflow | proposal 起草时 |
| `related_req_proposal` | proposal-writer | spec-writer | proposal 起草时;spec 阶段读取作为 `related_req` 起点 |

> 完整写读流图见 [`../../shared/contracts/frontmatter-schema.md`](../../shared/contracts/frontmatter-schema.md) §3。

---

## §5 严禁事项 (Hard Bans)

- ❌ 在 SKILL.md / 模板 / 本文件出现"调用 RBK U1 / U2 add-req"等命令名硬编码
- ❌ proposal-writer 直接写入或修改 `docs/spec/REQUIREMENTS.md` / `docs/spec/ROADMAP.md`
- ❌ 把 `related_req`(specs 字段)误写入 proposal frontmatter(参 [`../../shared/contracts/frontmatter-schema.md`](../../shared/contracts/frontmatter-schema.md) §1)
- ❌ 用 `null` / `""` / `/` / `无` 表达 `related_req_proposal` 为空(应写 `[]`)
- ❌ `req_ledger_state` 出现三状态闭集之外的取值

---

## §6 与下游 spec-writer 的衔接

- spec-writer 起草 specs 时,以 `related_req_proposal` 为起点,做收敛后写入 specs frontmatter `related_req`。
- 收敛规则(可否丢弃 / 拆分某 AUTH-ID)由 spec-writer 自己的 references 定义,不在本文件描述。
- 一条 AUTH-ID 只能归属一个 spec(D4 强约束),由 spec-writer 阶段保证。

---

## §7 校验规则(供 Stage 4 审计)

- frontmatter grep:`req_ledger_state:` 取值必须 ⊆ {`present`, `missing`, `skipped`}
- frontmatter grep:`related_req_proposal:` 必须为列表(`[...]`),不允许 `null` / `""` / 省略键
- SKILL.md / 模板 / 本目录全文 grep:不得出现 `RBK U[0-9]` / `调用 RBK` 命令式表达