# 握手协议 — 与 spec-wf 主体的字段被动握手

> RBK 与 spec-wf 主体(`spec-design-workflow` + 4 个 writer skill)的协作**完全通过 frontmatter 字段**;
> 两侧任一方都不直接调用对方,**零命令名耦合**(对照 [`../../spec-design-workflow/references/handshake-rbk.md`](../../spec-design-workflow/references/handshake-rbk.md) §6 严禁事项)。

---

## §1 协议立场

- **RBK 是 supplier,spec-wf 主体是 customer**(DDD Customer-Supplier 关系):字段契约由 customer 制定,supplier 必须 conform。
- 字段定义权威:[`../../shared/contracts/frontmatter-schema.md`](../../shared/contracts/frontmatter-schema.md);本文件不复述字段语义,只描述 RBK 一侧的监听 / 响应规则。
- 用户始终在中间:本 skill 的所有写操作都需用户 diff 确认(M7);spec-wf 主体不绕开用户主动 trigger RBK。

---

## §2 字段握手三点

| 字段 | 写方 | RBK 行为 | 时机 |
|------|------|----------|------|
| `proposal.req_ledger_state` | proposal-writer | `missing` → 提示用户触发 U1 init;`present` → 不动;`skipped` → 等待后续 U5 writeback | proposal `status: reviewed` 后 |
| `proposal.related_req_proposal` | proposal-writer | 扫描列表;含未在 `REQUIREMENTS.md` 登记的 AUTH-ID → 提示用户触发 U2 add-req | proposal `status: reviewed` 后 |
| `specs/*.md.related_req` | spec-writer | 监听字段建立 AUTH ↔ spec 单点归属(D4 校验);U4 / U6 阶段读取 | spec `status: reviewed` 后 |
| `tasks.md.shipped_us` | workflow(writeback 阶段) | 监听字段非空且 `exc_status: done` → 提示用户触发 U4 ship | tasks `exc_status: done` 后 |

> "提示用户触发"不是"自动执行"——RBK 仅生成提示,实际写操作仍需用户在 chat 中显式发起(M7 diff 优先)。

---

## §3 字段流向图(RBK 视角)

```
proposal-writer  ──写──▶ req_ledger_state, related_req_proposal
                         │
                         ▼ (RBK 监听)
spec-writer      ──写──▶ related_req                  ◀── RBK 读取(U4/U6)
                         │
                         ▼ (RBK 监听)
workflow         ──写──▶ tasks.shipped_us              ◀── RBK 读取(U4)
                         │
                         ▼ (RBK 监听)
RBK              ──写──▶ REQUIREMENTS.md(打勾 / 追加)
                  ──写──▶ ROADMAP.md(可选)
                  └─不写─▶ 任何 docs/spec/{change}/ 下的文件(M4)
```

完整字段流向图见 [`../../shared/contracts/frontmatter-schema.md`](../../shared/contracts/frontmatter-schema.md) §3。

---

## §4 用户路径(双向)

### 路径 A:先 REQ 后 Spec(规划驱动)

```
用户 → U1 init(建账本)→ U2 add-req(登记若干 AUTH)
     → proposal-writer 起草(read REQUIREMENTS.md → 选 AUTH 进 related_req_proposal)
     → spec-writer / design / tasks 走完 4 步
     → workflow writeback 写 shipped_us
     → 用户触发 U4 ship → RBK 打勾对应 AUTH
```

### 路径 B:先 Spec 后 REQ(增量补录)

```
用户 → proposal-writer 起草(无账本 / 不关联;related_req_proposal=[])
     → spec / design / tasks 走完 4 步
     → workflow writeback 写 shipped_us(可能为空)
     → 用户触发 U5 writeback → RBK 反向归纳 AUTH 候选 → 用户确认 → 登记 REQUIREMENTS.md
     → spec frontmatter 不一致部分由用户调 spec-writer 修正(RBK 仅打印建议 diff,不动 spec)
```

---

## §5 严禁事项

- ❌ RBK 写 `proposal.md` / `specs/*.md` / `design.md` / `tasks.md` 任何字段或正文(M4 / DDD 单一所有权)
- ❌ spec-wf 主体的 SKILL.md / WORKFLOW.md 出现 "调用 RBK U1 / U2 / U4" 等命令名硬编码(对照 [`../../spec-design-workflow/references/handshake-rbk.md`](../../spec-design-workflow/references/handshake-rbk.md) §6.1)
- ❌ workflow 在 writeback 阶段直接 invoke RBK(workflow 只**写字段**,RBK 监听同字段)
- ❌ RBK 主动跑批量 ship 而不经用户确认(M3 + M7)
- ❌ 用 `null` / `"无"` 表达 `related_req_proposal` / `shipped_us` 为空(应写 `[]`,见 [`../../shared/contracts/empty-value-convention.md`](../../shared/contracts/empty-value-convention.md))

---

## §6 异常路径

### 用户绕过 spec-wf 主体直接调用 RBK

完全合法。RBK 是独立 skill,常见场景:
- 直接 U6 审计账本(不需要 change 上下文)
- 直接 U2 登记新需求(用户预先规划)
- 直接 U4 ship(用户已知道哪些 US 上线了)

### 用户绕过 RBK 手动改账本

**违反 M6**。U6 audit 通过 R6 / R7 规则检测出"账本 `[x]` 但 tasks 未完成"等不一致,提示用户修正。

### spec-wf 主体没安装 RBK

spec-wf 主体退化到"纯增量模式":
- proposal-writer 仍按规则写 `req_ledger_state: missing` / `skipped`
- frontmatter 仍按 schema 约定埋点(保留未来对接可能)
- workflow writeback 仍写 `shipped_us`(只是没人监听)

---

## §7 校验规则(供 spec-wf 自身的 [`scripts/validate.mjs`](../../scripts/validate.mjs))

- `req_ledger_state` 取值必须 ⊆ `{present, missing, skipped}`(由 schema 兜底)
- `related_req` / `related_req_proposal` / `shipped_us` 必须为列表(空时 `[]`,不允许 `null`)
- I-E 跨阶段 invariant:一条 AUTH-ID 只能在一个 spec 的 `related_req` 中(D4)
- 本文件 grep `调用 RBK | U[0-9] +(ship|init|add-req|writeback|audit)` 命令式表达必须 0 命中