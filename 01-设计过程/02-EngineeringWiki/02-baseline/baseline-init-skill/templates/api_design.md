# 接口详细设计 (API Implementation Design)

> 本文档由基线初始化 Skill 在 **阶段三 · Step 3.2** 自动生成。
> 所有接口须遵循 [`api_rules.md`](../standards/api_rules.md) 中定义的规范。

---

## 接口概览

| #  | 模块       | 接口名称       | Method | URL                        | 鉴权     |
| -- | ---------- | -------------- | ------ | -------------------------- | -------- |
| 1  | {module}   | {api_name}     | POST   | /api/v1/{resource}         | Required |
| 2  | {module}   | {api_name}     | GET    | /api/v1/{resource}/{id}    | Required |

---

## 模块：{Module Name}

### 1.1 {接口名称}

- **URL**: `{METHOD} /api/v1/{resource}`
- **描述**: {业务用途}
- **鉴权**: Required / Public
- **幂等**: 是 / 否

#### 请求参数

**Path**: `{id}` (long, 必填)

**Body**:

| 字段         | 类型     | 必填 | 约束     | 说明           |
| ------------ | -------- | ---- | -------- | -------------- |
| {field_name} | {type}   | Y/N  | {regex}  | {description}  |

#### 请求示例

```json
{ "{field}": "{value}" }
```

#### 响应 (成功 200)

```json
{
  "code": 200,
  "message": "success",
  "data": { "{field}": "{value}" },
  "timestamp": "2024-12-19T10:30:00.000+08:00",
  "requestId": "req_a1b2c3d4e5f6"
}
```

#### 响应 (失败 400)

```json
{
  "code": 400,
  "message": "参数校验失败",
  "data": null,
  "error": {
    "errorCode": "INVALID_PARAM",
    "errorDetail": "缺少必填项: {field}",
    "fieldErrors": [{ "field": "{field}", "message": "不能为空" }]
  }
}
```

#### 专属错误码

| 错误码 | 描述         | 说明         |
| ------ | ------------ | ------------ |
| 200101 | {error_desc} | {说明}       |

---

*(按上述模板继续定义每个模块的每个接口)*
