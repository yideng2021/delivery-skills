# 数据库设计规范 (Database Standards)

> 本文档由基线初始化 Skill 在 **阶段一 · Step 1.2** 自动生成。
> 所有数据库变更须遵循本规范。

---

## 1. 命名规范 (Naming Conventions)

### 1.1 表命名
- **格式**: `{prefix}_{module}_{biz_name}`
- **规则**: 全部小写字母 + 下划线，禁止使用大写或驼峰
- **示例**: `risk_user_profile`, `order_payment_record`
- **前缀**: 项目统一前缀（如 `risk`），由团队约定

### 1.2 字段命名
- **格式**: 小写字母 + 下划线（`snake_case`）
- **禁止**: 使用 SQL 保留字（如 `order`, `status`, `type` 需加前缀）
- **布尔字段**: 以 `is_` 开头（如 `is_deleted`, `is_active`）
- **时间字段**: 以 `_time` 或 `_at` 结尾（如 `create_time`, `expired_at`）

### 1.3 索引命名
| 类型       | 前缀   | 示例                         |
| ---------- | ------ | ---------------------------- |
| 主键       | `pk_`  | `pk_id`                      |
| 唯一索引   | `uk_`  | `uk_user_mobile`             |
| 普通索引   | `idx_` | `idx_order_create_time`      |
| 联合索引   | `idx_` | `idx_user_status_create_time`|

---

## 2. 基础配置 (Engine Configuration)

| 配置项         | 规范值                      | 说明                     |
| -------------- | --------------------------- | ------------------------ |
| **存储引擎**   | `InnoDB`                    | 支持事务与行级锁         |
| **字符集**     | `utf8mb4`                   | 支持完整 Unicode (含 Emoji) |
| **排序规则**   | `utf8mb4_unicode_ci`        | 大小写不敏感排序         |
| **行格式**     | `DYNAMIC`                   | 支持大字段高效存储       |

---

## 3. 必须包含的通用字段 (Mandatory Fields)

> ⚠️ 所有业务表**必须**包含以下基线字段：

```sql
`id`          BIGINT(20) UNSIGNED  NOT NULL AUTO_INCREMENT             COMMENT '主键ID',
`create_time` DATETIME             NOT NULL DEFAULT CURRENT_TIMESTAMP  COMMENT '创建时间',
`update_time` DATETIME             NOT NULL DEFAULT CURRENT_TIMESTAMP
              ON UPDATE CURRENT_TIMESTAMP                              COMMENT '更新时间',
`create_by`   VARCHAR(64)          NOT NULL DEFAULT ''                 COMMENT '创建人',
`update_by`   VARCHAR(64)          NOT NULL DEFAULT ''                 COMMENT '更新人',
`is_deleted`  TINYINT(1)           NOT NULL DEFAULT 0                  COMMENT '逻辑删除: 0-正常, 1-已删除',
`version`     INT(11)              NOT NULL DEFAULT 0                  COMMENT '乐观锁版本号',
PRIMARY KEY (`id`)
```

---

## 4. 注释规范 (Commenting)

### 4.1 表注释
- **必须**说明表的业务用途及所属模块
- **示例**: `COMMENT = '用户模块 - 用户基本信息表'`

### 4.2 字段注释
- **枚举字段**: 必须在 COMMENT 中列出所有枚举值含义
  - ✅ `COMMENT '状态: 0-待审核, 1-审核通过, 2-已驳回'`
  - ❌ `COMMENT '状态'`
- **金额字段**: 必须说明单位
  - ✅ `COMMENT '订单金额(单位: 分)'`
  - ❌ `COMMENT '订单金额'`
- **外键关联**: 说明关联表及字段
  - ✅ `COMMENT '用户ID, 关联 risk_user_profile.id'`

---

## 5. 索引策略 (Indexing Strategy)

### 5.1 创建原则
- 高频查询条件的字段**必须**建立索引
- 唯一性约束的字段使用**唯一索引**
- 严禁在更新频繁、区分度 < 10% 的列上建立索引
- 单表索引数量建议 ≤ 5 个

### 5.2 联合索引规则
- 遵循 **最左前缀匹配** 原则
- 字段顺序：**区分度高 → 区分度低**
- 尽量利用 **覆盖索引** 减少回表

### 5.3 禁止项
- ❌ 在 `TEXT`/`BLOB` 字段上直接创建索引
- ❌ 对 `is_deleted` 等低区分度字段单独创建索引
- ❌ 创建完全冗余的联合索引

---

## 6. 数据类型选择指引

| 数据场景     | 推荐类型                | 说明                           |
| ------------ | ----------------------- | ------------------------------ |
| 主键 ID      | `BIGINT UNSIGNED`       | 安全范围远大于 INT             |
| 金额         | `DECIMAL(18,2)`         | 精确计算，禁止使用 FLOAT       |
| 状态/枚举    | `TINYINT`               | 减小存储空间                   |
| 短文本       | `VARCHAR(N)`            | N 按实际需要设定，N ≤ 5000     |
| 长文本       | `TEXT`                  | 超过 5000 字符时使用           |
| 时间戳       | `DATETIME`              | 带时区场景用 `TIMESTAMP`       |
| JSON 数据    | `JSON`                  | MySQL 5.7+ 原生 JSON 类型     |
| IP 地址      | `INT UNSIGNED`          | 配合 `INET_ATON()` 函数       |

---

## 7. DDL 变更规范

- 所有变更通过 **Migration 脚本** 管理，禁止直接操作生产库
- 变更脚本文件命名：`V{version}__{description}.sql`
- 大表变更（> 100w 行）需使用 **在线 DDL 工具**（如 pt-osc / gh-ost）
- 变更前必须在测试环境验证影响行数和锁等待时间
