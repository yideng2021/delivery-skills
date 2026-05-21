# API 接口开发规范 (API Standards)

> 本文档由基线初始化 Skill 在 **阶段一 · Step 1.2** 自动生成。
> 所有接口设计须遵循本规范，接口文档统一保存至 `docs/design/` 目录。

---

## 1. 基础协议 (Protocol)

| 项目         | 规范                                     |
| ------------ | ---------------------------------------- |
| **传输协议** | HTTPS (生产)，HTTP (开发/测试)           |
| **传输格式** | `application/json; charset=UTF-8`        |
| **URL 前缀** | `/api/{version}/{module}/...`            |
| **版本策略** | URL Path 版本（如 `/api/v1/`）           |
| **编码规范** | 字段名使用 `camelCase`，URL 使用 `kebab-case` |

---

## 2. RESTful 风格规范

### 2.1 HTTP 动词使用

| 动词       | 语义                  | 幂等性 | 安全性 | 说明               |
| ---------- | --------------------- | ------ | ------ | ------------------ |
| **GET**    | 读取/查询             | ✅     | ✅     | 禁止产生副作用     |
| **POST**   | 创建资源              | ❌     | ❌     | 返回 201 + Location |
| **PUT**    | 全量替换              | ✅     | ❌     | 必须提交完整实体   |
| **PATCH**  | 部分更新              | ✅     | ❌     | 仅提交变更字段     |
| **DELETE** | 删除资源              | ✅     | ❌     | 成功返回 204       |

### 2.2 URL 设计规则

```
✅ 正确示例：
GET    /api/v1/users              # 获取用户列表
GET    /api/v1/users/{id}         # 获取指定用户
POST   /api/v1/users              # 创建用户
PUT    /api/v1/users/{id}         # 更新用户
DELETE /api/v1/users/{id}         # 删除用户
GET    /api/v1/users/{id}/orders  # 获取用户的订单

❌ 错误示例：
POST   /api/v1/getUser            # 禁止在 URL 中使用动词
GET    /api/v1/user               # 资源名应使用复数
```

### 2.3 参数位置规范

| 位置       | 使用场景                                 | 示例                           |
| ---------- | ---------------------------------------- | ------------------------------ |
| **Path**   | 资源定位（ID 类）                        | `/users/{userId}`              |
| **Query**  | 筛选、排序、分页                         | `?status=active&page=1`        |
| **Header** | 认证 Token、追踪 ID、租户标识            | `Authorization: Bearer xxx`    |
| **Body**   | 复杂业务数据（仅 POST/PUT/PATCH）        | JSON 请求体                    |

---

## 3. 响应规范 (Response)

### 3.1 统一响应包装 (Response Wrapper)

> 所有接口返回值**必须**使用以下标准结构：

```json
{
  "code": 200,
  "message": "success",
  "data": { },
  "timestamp": "2024-12-19T10:30:00.000+08:00",
  "requestId": "req_a1b2c3d4e5f6"
}
```

| 字段          | 类型     | 必填 | 说明                               |
| ------------- | -------- | ---- | ---------------------------------- |
| `code`        | int      | ✅   | 业务状态码，200 = 成功，非 200 = 异常 |
| `message`     | string   | ✅   | 人类可读的提示信息                 |
| `data`        | object   | ❌   | 业务数据载荷                       |
| `timestamp`   | string   | ✅   | ISO 8601 带时区响应时间            |
| `requestId`   | string   | ✅   | 唯一请求追踪 ID                    |

### 3.2 分页数据结构 (Pagination)

> 列表接口统一使用以下分页结构：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "records": [ ],
    "pagination": {
      "current": 1,
      "size": 20,
      "total": 1000,
      "pages": 50
    }
  }
}
```

**分页请求参数**：

| 参数       | 类型   | 默认值 | 约束              | 说明     |
| ---------- | ------ | ------ | ----------------- | -------- |
| `page`     | int    | 1      | ≥ 1               | 当前页码 |
| `size`     | int    | 20     | 1 ≤ size ≤ 100    | 每页条数 |
| `sortBy`   | string | -      | 允许的字段白名单  | 排序字段 |
| `sortDir`  | string | `asc`  | `asc` \| `desc`   | 排序方向 |

### 3.3 错误响应 (Error Response)

```json
{
  "code": 400,
  "message": "参数校验失败",
  "data": null,
  "error": {
    "errorCode": "INVALID_PARAM",
    "errorDetail": "缺少必填项: orderId",
    "fieldErrors": [
      { "field": "orderId", "message": "不能为空" }
    ]
  },
  "timestamp": "2024-12-19T10:30:00.000+08:00",
  "requestId": "req_a1b2c3d4e5f6"
}
```

### 3.4 HTTP 状态码使用

| 状态码 | 场景                      | 说明                    |
| ------ | ------------------------- | ----------------------- |
| 200    | 请求成功                  | GET / PUT / PATCH 成功  |
| 201    | 创建成功                  | POST 创建资源成功       |
| 204    | 无内容                    | DELETE 成功             |
| 400    | 参数校验失败              | 客户端请求参数有误      |
| 401    | 未认证                    | Token 缺失或过期        |
| 403    | 无权限                    | 已认证但权限不足        |
| 404    | 资源不存在                | 指定 ID 的资源未找到    |
| 409    | 冲突                      | 资源状态冲突            |
| 429    | 请求过于频繁              | 触发限流                |
| 500    | 服务器内部错误            | 需告警排查              |

---

## 4. 接口安全规范

### 4.1 认证 (Authentication)
- **方案**: JWT Bearer Token
- **Header**: `Authorization: Bearer {token}`
- **Token 刷新**: 通过 `/api/v1/auth/refresh` 接口

### 4.2 通用安全要求
- 所有敏感字段（手机号、身份证号等）**脱敏输出**
- 请求体 **大小限制**: ≤ 10 MB
- 接口 **超时设置**: 默认 30s，长事务接口单独配置
- 防重复提交：关键写入操作需支持 **幂等性 Token**

---

## 5. 接口文档编写模板

所有接口设计文档必须包含：

1. **路径与方法**: `METHOD /path`
2. **功能描述**: 一句话概括业务用途
3. **鉴权要求**: Required / Public
4. **入参定义**: 字段名/位置/类型/必填/说明
5. **出参定义**: 对应 `data` 结构
6. **请求示例**: JSON 格式
7. **响应示例**: 成功 + 失败各一个
8. **异常码清单**: 该接口可能返回的特定错误码
