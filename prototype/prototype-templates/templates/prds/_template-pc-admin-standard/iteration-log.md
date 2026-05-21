# PC 后台标准模板 · 迭代日志

## 2026-04-20 · 初始化

- 完整生成模板的三种核心页面：
  - `prototype/pages/list.html` —— 员工列表页（筛选 + 分页表格 + 批量操作）
  - `prototype/pages/detail.html` —— 员工详情页（基础信息 + 4 盏灯评估卡片 + 多 Tab 嵌套子 Tab）
  - `prototype/pages/form.html` —— 岗位配置页（多卡片分区 + 动态 KPI 行 + 标签选择器 + 晋升通道展示）
- 建立服务层 `js/services/employeeService.js` 与 Mock 数据 `mock/employees.js`（支持 normal / empty / overflow 三态切换）。
- 业务示例选择 **员工管理** 而非画像/风控等偏业务领域，以降低通用用户的认知门槛。
