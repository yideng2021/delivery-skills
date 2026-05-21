# 原型工程总索引

> 本文件用于人眼快速了解工程结构与各模块状态。机器消费的模板注册见 [`_templates.md`](./_templates.md)。

## 目录结构

```
docs/prds/
├── index.html                       # 项目入口页（列出所有可访问原型）
├── _index.md                        # 本文件（总索引）
├── _templates.md                    # 模板注册表（prototype-generation skill 输入）
├── _shared/                         # 全项目共享层（SSOT）
│   ├── css/
│   │   ├── tokens.css               # 设计令牌（颜色、字体、间距、阴影等 CSS 变量）
│   │   └── common.css               # 全局布局与公共组件样式
│   ├── js/
│   │   └── common.js                # window.Utils（sleep / toast / queryParam 等）
│   ├── api/
│   │   └── routes.js                # API 路由常量（演示用）
│   ├── reference/
│   │   ├── menu-data.js             # 全局菜单 GLOBAL_MENU（所有模块注册入口）
│   │   ├── header.js                # 顶部 Header 组件
│   │   └── sidebar.js               # 左侧 Sidebar 组件
│   └── iteration-log.md             # 共享层的变更迭代记录
│
└── _template-pc-admin-standard/     # PC 后台标准模板模块（完整可运行）
    ├── input-design.md              # 模板的"需求输入"与匹配设计
    ├── iteration-log.md             # 本模块的变更迭代记录
    └── prototype/
        ├── pages/                   # list.html / detail.html / form.html
        ├── css/pages/               # 页面级样式
        ├── js/pages/                # 页面级逻辑
        ├── js/services/             # 服务层（演示用）
        └── mock/                    # 模拟数据源（normal / empty / overflow）
```

## 模块清单

### 1. 共享层 `_shared/`
- **职责**：所有模块共享的设计令牌、公共样式、通用工具、全局菜单。
- **变更影响范围**：所有模块。修改前需评估回归。

### 2. 📚 模板参考 · PC 后台标准 `_template-pc-admin-standard/`
- **形态**：PC / 企业后台。
- **覆盖页面类型**：列表页 / 详情页 / 配置表单页。
- **示例业务**：员工管理（员工列表、员工详情、岗位配置）。
- **快速入口**：[list.html](./_template-pc-admin-standard/prototype/pages/list.html) · [detail.html](./_template-pc-admin-standard/prototype/pages/detail.html?id=E0001) · [form.html](./_template-pc-admin-standard/prototype/pages/form.html)

## 新增业务模块指引

1. 在 [`_templates.md`](./_templates.md) 中查找是否已有匹配模板；
2. 如有匹配，复制 `_template-<类型>/` 目录到 `<业务模块名>/`，改写 mock 数据与文案；
3. 在 [`_shared/reference/menu-data.js`](./_shared/reference/menu-data.js) 中为新模块登记菜单项（**硬性前置条件**）；
4. 如未命中任何模板，按"未命中流程"处理（见 `_templates.md`）。
