# Requirements Bookkeeping Skill — 项目级需求账本维护

> spec-wf 体系的"项目级账本聚合";扮演项目"记账员"角色,维护
> `docs/spec/REQUIREMENTS.md`(必有)与 `docs/spec/ROADMAP.md`(可选)两份长青文档。

详见 [`SKILL.md`](./SKILL.md)。

---

## 核心理念

- **纯 Markdown 维护** — 不依赖 CLI/SDK 命令
- **append-only** — 已上线条目永不删 / ID 永不复用
- **D4 强约束(lifelong)** — 一条 AUTH 在任意时刻只能归属一个 spec;归属可在迭代间整体迁移
- **双向路径** — ①先 REQ 后 Spec(U2 → workflow → U4) ②先 Spec 后 REQ(直接 U5)
- **零命令名耦合** — 与 spec-wf 主体仅通过 frontmatter 字段被动握手

---

## 目录结构

```
requirements-bookkeeping-skill/
├── SKILL.md                         # ★ Skill 主文件(入口)
├── README.md                        # 本文件(给人看的概览)
├── templates/
│   ├── requirements.md              # REQUIREMENTS.md 骨架
│   └── roadmap.md                   # ROADMAP.md 骨架(可选)
└── references/
    ├── req-id-convention.md         # AUTH-ID 命名 / 撤销 / 拆分规则
    ├── handshake-protocol.md        # 与 spec-wf 主体的字段被动握手协议
    └── audit-checklist.md     # U6 audit 的 R1–R8 规则手册
```

---

## 5 个用例

| 触发示例                        | 用例         | 说明                                   |
| ----------------------------------- | ------------ | -------------------------------------- |
| "初始化项目需求账本"                | U1 init      | 新项目空白起步 / 从 PRD / 从存量反推   |
| "登记一个新需求 AUTH-05"            | U2 add-req   | 追加单条需求到 REQUIREMENTS.md         |
| "user-signup 上线了"                | U4 ship      | 监听 `tasks.shipped_us` 打勾对应 AUTH  |
| "把 user-signup 反向登记到账本"     | U5 writeback | 从 Spec 反向归纳 AUTH 候选             |
| "审计需求账本"                      | U6 audit     | 只读,输出 R1-R8 漂移报告               |
| "规划 v1.1 里程碑"                  | U3(二期)   | 首版未实现                             |

---

## 与 spec-wf 主体的关系

- **同居一袋**:本 skill 是 `skills/spec_wf/requirements-bookkeeping-skill/`,与 4 个 writer + workflow 同属 spec-wf
- **职责正交**:本 skill 管**项目级**账本,4 个 writer + workflow 管**单个 change**
- **协作媒介**:仅通过 frontmatter 字段 `req_ledger_state` / `related_req_proposal` / `related_req` / `shipped_us` 被动握手
- **可独立运行**:本 skill 也可脱离 spec-wf 主体,独立维护账本

握手协议详见 [`references/handshake-protocol.md`](references/handshake-protocol.md)。

---

## 工作模式

| 模式            | 路径                  | 用例链                          | 适用场景                    |
| --------------- | --------------------- | ------------------------------- | --------------------------- |
| **规划驱动**     | A:先 REQ 后 Spec      | U1 → U2 → workflow → U4 ship    | 新项目,从 PRD 出发          |
| **增量补录**     | B:先 Spec 后 REQ      | workflow 走完 → U5 writeback     | 已有 spec,后补账本          |
| **里程碑跃迁**   | 规划驱动              | U3 plan-milestone(二期)        | 大版本规划                  |

---

## License

MIT