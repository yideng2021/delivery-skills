# 文档全局一致性自检清单 (Consistency Checklist)

> 本清单在 **阶段四 · 闭环一致性** 自动执行。
> 每一项必须全部通过方可进入阶段五。

---

## 1. 需求 vs 架构 (Scope Check)

- [ ] **功能覆盖**: `requirements.md` 中的所有功能模块是否都在 `architecture.md` 中有对应的组件/服务承载？
- [ ] **NFR 对齐**: 架构设计是否包含了满足 NFR（高并发、安全性、SLA等）的具体技术方案？
- [ ] **边界一致**: `requirements.md` 中定义的系统边界与 `architecture.md` 的部署边界是否一致？
- [ ] **角色映射**: `requirements.md` 中的用户角色是否在架构的认证授权方案中有对应设计？

## 2. 接口设计 vs 规范 (API Check)

- [ ] **RESTful 风格**: URL 是否遵循 `api_rules.md` 中的资源命名规范（名词复数, 避免动词）？
- [ ] **响应包装**: 所有接口 Response 是否都包裹了 `code/message/data` 标准结构？
- [ ] **方法使用**: 是否正确使用了 GET(查询) / POST(创建) / PUT(更新) / DELETE(删除)？
- [ ] **分页一致**: 列表接口是否统一使用 `page/size` 参数和 `records/pagination` 响应结构？
- [ ] **错误码**: 错误响应是否使用了 `project_rules.md` 中定义的统一错误码体系？
- [ ] **版本前缀**: 所有 URL 是否包含版本前缀 `/api/v1/`？

## 3. 数据库设计 vs 规范 (DB Check)

- [ ] **基线字段**: 每张表是否都包含 `id`, `create_time`, `update_time`, `is_deleted`, `version` 基线字段？
- [ ] **审计字段**: 每张表是否包含 `create_by`, `update_by` 审计字段？
- [ ] **命名合规**: 表名是否符合 `{prefix}_{module}_{biz}` 规范？字段是否全部 snake_case？
- [ ] **索引命名**: 索引是否使用 `pk_` / `uk_` / `idx_` 前缀？
- [ ] **注释完整**: 枚举字段是否列出所有值含义？金额字段是否标注单位？
- [ ] **索引合理**: 是否存在无索引的高频查询？是否有冗余的联合索引？

## 4. 详细设计 vs 总体设计 (Detail Check)

- [ ] **术语一致**: `system_overview.md` 中提到的核心概念在数据库表名和 API 字段中是否统一？
- [ ] **逻辑闭环**: `api_design.md` 中的输入参数是否能在 `database_design.md` 中找到对应的存储字段？
- [ ] **流程覆盖**: `requirements.md` 中的核心业务流程是否都能通过 API 接口串联完成？
- [ ] **模块对齐**: `requirements.md` 的功能模块清单与 `api_design.md` 的模块分组是否一一对应？

## 5. 文档完整性 (Completeness Check)

- [ ] **产出齐全**: 以下文件是否全部生成？
  - `docs/analysis/agent.md`
  - `docs/standards/api_rules.md`
  - `docs/standards/db_rules.md`
  - `docs/standards/project_rules.md`
  - `docs/design/requirements.md`
  - `docs/design/architecture.md`
  - `docs/design/database_design.md`
  - `docs/design/api_design.md`
  - `docs/system_overview.md`
- [ ] **索引完整**: `system_overview.md` 的文档索引是否覆盖了以上所有文件？
- [ ] **链接有效**: 文档间的交叉引用链接是否全部可达？
