# 共享层迭代日志

> 记录 `_shared/` 目录下文件的关键变更。每次改动留 1-3 行摘要即可。

## 2026-04-20 · 初始化

- 建立 `_shared/css/tokens.css`：设计令牌（颜色、字号、间距、阴影、布局尺寸）。
- 建立 `_shared/css/common.css`：全局布局（grid layout）+ header / sidebar / breadcrumb / card / form / table / pagination / modal / toast 公共样式。
- 建立 `_shared/reference/{menu-data, header, sidebar}.js`：菜单 SSOT 与顶栏/侧栏组件。
- 建立 `_shared/js/common.js`：`window.Utils`（sleep / toast / queryParam / formatDate 等）。
- 建立 `_shared/api/routes.js`：API 路由常量（演示用）。

## 2026-04-20 · 布局修复

- `header.js` 改为使用 `outerHTML` 替换挂载点，避免外层未命名 `<div>` 破坏 `.layout` grid 布局（原问题：header 被挤压、sidebar 与内容区间出现大片空白）。
- `common.css` 修复 sidebar 子菜单展开选择器：`.sidebar__submenu-item--expanded + .sidebar__submenu` → `.sidebar__submenu-item--expanded > .sidebar__submenu`（原选择器针对兄弟元素，但实际结构是父子），并补充第三级缩进。
- `menu-data.js` 调整菜单结构：移除独立的"员工管理"一级菜单，将员工列表 / 岗位配置收归到"📚 模板参考 → PC 后台标准"下，避免模板示例与真实业务目录混淆。
