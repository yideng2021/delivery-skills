MCP配置：

```
{
  "mcpServers": {
    "gitnexus": {
      "command": "C:\\Users\\Lenovo\\AppData\\Roaming\\npm\\gitnexus.cmd",
      "args": [
        "mcp"
      ]
    }
  }
}
```







```
# 索引管理
gitnexus analyze [path]              # 索引仓库
gitnexus analyze --force             # 强制完整重建索引
gitnexus analyze --embeddings        # 生成嵌入向量（更好的语义搜索）
gitnexus analyze --skills            # 生成仓库特定的技能文件

# 服务启动
gitnexus mcp                         # 启动 MCP 服务器（AI Agent 用）
gitnexus serve                       # 启动 HTTP 服务器（Web UI 用）

# 状态查看
gitnexus list                        # 列出所有已索引的仓库
gitnexus status                      # 显示当前仓库索引状态

# 清理
gitnexus clean                       # 删除当前仓库索引
gitnexus clean --all --force         # 删除所有索引

# 生成文档
gitnexus wiki [path]                 # 从知识图谱生成 Wiki

# 多仓库分组
gitnexus group create          # 创建仓库组
gitnexus group add   # 添加仓库到组
gitnexus group sync           # 提取契约并跨仓库匹配
```



## 启动服务访问可视化界面

命令：gitnexus serve

访问链接：http://localhost:4747





### MCP 服务：gitnexus

##### 工具

1. `query` — 查询与概念相关的执行流程
2. `context` — 单个符号的 360 度视图，如获取该类的 360 度视图，包括类基本信息、方法列表、属性列表、实现接口等。
3. `impact` — 修改影响半径（爆炸半径）范围分析
4. `mcp_access_resource` — 读取资源（如 processes、schema 等）
5. **`detect_changes`** — 分析当前 Git 修改的影响范围，映射 diff 到受影响的执行流程
6. **`rename`** — 跨文件协调重命名，带置信度标签的编辑建议
7. **`cypher`** — 对代码知识图谱执行原始 Cypher 查询
8. **`list_repos`** — 列出所有已索引的仓库

##### 可用资源（Resources）

- `gitnexus://repo/{name}/context` — 仓库概览与状态
- `gitnexus://repo/{name}/clusters` — 所有功能模块（Leiden 社区）
- `gitnexus://repo/{name}/processes` — 所有执行流程
- `gitnexus://repo/{name}/schema` — 图数据库 Schema（用于 Cypher 查询）







### 名称：gitnexus-guide

适用于用户询问 GitNexus 相关问题的场景，包括可用工具、知识图谱查询方法、MCP 资源、图谱结构及流程参考。示例提问：“GitNexus 有哪些可用工具？”“如何使用 GitNexus？”

------

# GitNexus 使用指南

本文件为 GitNexus 所有 MCP 工具、资源及知识图谱结构的速查手册。

## 入门必读

但凡涉及代码理解、问题排查、影响分析或代码重构的工作，请按以下步骤操作：

1. **查看 `gitnexus://repo/{name}/context`** — 了解代码库整体概况，并检查索引是否为最新
2. **根据任务类型对照下方功能模块**，并阅读对应模块说明文档
3. **严格遵循该模块的操作流程与检查清单**

> 若第一步提示索引已过时，请先在终端执行命令：`npx gitnexus analyze`

## 功能模块对照表

|                 任务场景                 |        对应查阅文档        |
| :--------------------------------------: | :------------------------: |
|       架构解读 / 询问功能运行原理        |    `gitnexus-exploring`    |
|  影响范围分析 / 修改代码会引发哪些问题   | `gitnexus-impact-analysis` |
|       问题溯源 / 排查代码报错原因        |    `gitnexus-debugging`    |
|       重命名、代码抽取、拆分及重构       |   `gitnexus-refactoring`   |
|         工具、资源、结构说明查阅         | `gitnexus-guide`（本文档） |
| 索引管理、状态查看、清理操作、命令行指令 |       `gitnexus-cli`       |

## 工具参考

|     工具名称     |                           功能说明                           |
| :--------------: | :----------------------------------------------------------: |
|     `query`      |  按业务流程聚合的代码分析能力，可查询指定功能相关的执行链路  |
|    `context`     |       代码标识全景视图，分类展示引用关系及所属业务流程       |
|     `impact`     |  代码影响范围分析，分级展示 1/2/3 级关联影响，并标注置信度   |
| `detect_changes` |      基于 Git 差异做影响分析，查看当前代码改动波及范围       |
|     `rename`     |        跨文件批量统一重命名，所有修改均附带置信度标识        |
|     `cypher`     | 原生图谱查询语句（使用前请先查阅 `gitnexus://repo/{name}/schema`） |
|   `list_repos`   |                 查看所有已建立索引的代码仓库                 |

## 资源参考

以下为简易查阅资源（内容篇幅约 100-500 字符），用于快速检索导航：

|                    资源地址                    |            内容说明            |
| :--------------------------------------------: | :----------------------------: |
|        `gitnexus://repo/{name}/context`        |  仓库统计数据、索引时效性检测  |
|       `gitnexus://repo/{name}/clusters`        |    所有功能模块及内聚度评分    |
| `gitnexus://repo/{name}/cluster/{clusterName}` |   对应功能模块包含的代码内容   |
|       `gitnexus://repo/{name}/processes`       |        全部代码执行流程        |
| `gitnexus://repo/{name}/process/{processName}` |     单条执行流程的分步追踪     |
|        `gitnexus://repo/{name}/schema`         | 适配 Cypher 语句的知识图谱结构 |

## 知识图谱结构

**节点类型**：文件、函数、类、接口、方法、功能模块、执行流程

**关联关系（对应 CodeRelation 类型）**：调用、导入、继承、实现、定义、从属、流程步骤



```
MATCH (调用方)-[:CodeRelation {type: 'CALLS'}]->(f:Function {name: "myFunc"})
RETURN 调用方名称, 调用方文件路径
```