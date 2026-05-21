# 工程化规范（HTML 原型的代码组织）

> **适用产出形态**：PC 端 Web 高保真 HTML 原型。
> **核心理念**：高保真 + 可维护 + 便于 AI 后续精确修改 + **本地 `file://` 协议可直接双击打开**。
> **数据策略**：不做真实接口对接，所有数据由 AI 基于业务场景**动态 Mock**。
> **多模块治理**：跨模块公共资源集中到 `_shared/`，模块内只放模块特有代码。
> **可覆盖性**：以下为默认推荐值，项目有自己的工程约定时可覆盖。

---

## 一、根目录契约与文件组织

### 1.1 全局结构（跨模块共享层 + 模块层 + 全局入口）

```
docs/prds/                          # 所有原型的根
├── index.html                      # ⭐ 全局演示入口（按菜单跳各模块首页）
├── _index.md                       # 全局索引原型设计文档（模块注册表）
├── _shared/                        # ⭐ 跨模块共享（SSOT）
│   ├── reference/
│   │   ├── header.js               # 顶栏（JS 渲染，含 HTML 字符串模板）
│   │   ├── sidebar.js              # 侧边菜单渲染器
│   │   ├── footer.js               # 底部信息
│   │   └── menu-data.js            # ⭐ 全局菜单注册表（所有模块菜单项）
│   ├── css/
│   │   ├── tokens.css              # ⭐ 设计 token（色值/间距/字号，统一改一处）
│   │   └── common.css              # 公共组件样式 + 通用类
│   ├── js/
│   │   ├── common.js               # 工具函数（格式化/日期/Toast 等）
│   │   └── router.js               # 跨模块跳转辅助
│   ├── api/
│   │   └── routes.js               # ⭐ 全局接口常量
│   ├── mock/                       # 跨模块共用 Mock（用户/字典/权限）
│   │   ├── users.js
│   │   └── dicts.js
│   ├── images/                     # 全局静态资源（Logo/空态插图）
│   └── iteration-log.md            # 共享层变更记录
│
├── <模块名>/                       # 每个模块独立
│   ├── input-design.md
│   ├── iteration-log.md
│   └── prototype/
│       ├── pages/                  # 本模块业务页面
│       │   ├── task-list.html
│       │   └── task-detail.html
│       ├── css/pages/              # 本模块特有样式
│       │   └── task-list.css
│       ├── js/
│       │   ├── services/           # 本模块 Service/Manager
│       │   │   └── task-service.js
│       │   └── pages/              # 本模块页面脚本
│       │       └── task-list.js
│       ├── mock/                   # 本模块 Mock
│       │   └── tasks.js
│       └── images/                 # 本模块特有图片
└── ...
```

**说明**：
- `_shared/` 与各模块目录并列，**下划线前缀**使其在字母排序下稳定置顶，与业务模块区分
- `_index.md` 是全局视图原型设计文档，记录模块注册表与共享层变更影响
- 每个业务模块保留自己的 `input-design.md` / `iteration-log.md` / `prototype/`，可独立迭代与交付

### 1.2 硬性约束

- 样式 / 逻辑 / 资源 / 公共定义**必须分目录存放**
- **严禁在 HTML 内写入海量行内样式或业务逻辑**
- 页面底部 `<script>` 标签**仅放初始化代码**，业务逻辑在独立 JS 文件
- **模块内严禁再造** header / sidebar / footer / tokens.css / routes.js —— 统一引用 `_shared/`
- 模块内的样式文件**禁止覆盖 tokens.css 中的主色/间距基数/字号**（不一致变更必须回 `_shared/`）

---

## 二、`file://` 协议兼容性（首要硬性约束）

### 2.1 背景

原型需要"拷贝即演示"——直接双击 HTML 在浏览器中打开（`file://` 协议），不起任何本地 server。Chrome/Edge 在 `file://` 下会阻止本地 fetch（跨 origin），因此：

**禁止使用**：
- ❌ `fetch('reference/header.html')` 加载片段
- ❌ `fetch('mock/tasks.json')` 加载 JSON 数据
- ❌ ES Module 的 `import` 动态导入本地文件
- ❌ `XMLHttpRequest` 加载本地文件

**允许使用**（不受 fetch 限制）：
- ✅ `<script src="...">` 同步加载 JS
- ✅ `<link rel="stylesheet" href="...">` 加载 CSS
- ✅ `<img src="...">` 加载图片
- ✅ iframe 加载同目录 HTML（仅在少数隔离场景使用，如预览子系统）

### 2.2 公共组件：JS 字符串模板 + 渲染函数

公共组件（header / sidebar / footer）全部以 JS 模块形式存在，**HTML 结构写在 JS 字符串里**，通过 `<script src>` 加载，调用渲染函数挂载到 DOM。

**示例：`_shared/reference/header.js`**

```js
// 公共顶栏组件
(function (global) {
  const HEADER_HTML = `
    <header class="app-header" role="banner">
      <div class="app-header__brand">
        <img src="../_shared/images/logo.svg" alt="Logo" />
        <span class="app-header__title">任务管理平台</span>
      </div>
      <nav class="app-header__actions">
        <button data-test-id="btn-notification" class="icon-btn">🔔</button>
        <button data-test-id="btn-user-menu" class="icon-btn">👤</button>
      </nav>
    </header>
  `;

  function renderHeader(mountSelector = '#app-header') {
    const mount = document.querySelector(mountSelector);
    if (!mount) return console.warn('[Header] mount missing:', mountSelector);
    mount.innerHTML = HEADER_HTML;
  }

  global.SharedHeader = { render: renderHeader };
})(window);
```

**示例：`_shared/reference/sidebar.js`**（依赖 `menu-data.js` 先加载）

```js
(function (global) {
  function renderSidebar(mountSelector = '#app-sidebar', activeKey) {
    const items = global.GLOBAL_MENU || [];
    const html = items.map(item => `
      <a href="${item.href}"
         class="sidebar-item ${item.key === activeKey ? 'is-active' : ''}"
         data-test-id="menu-${item.key}">
        <i class="${item.icon}"></i>
        <span>${item.label}</span>
      </a>
    `).join('');
    document.querySelector(mountSelector).innerHTML = `<nav>${html}</nav>`;
  }
  global.SharedSidebar = { render: renderSidebar };
})(window);
```

**示例：`_shared/reference/menu-data.js`**（⭐ 全局菜单注册表，新模块必须在此登记）

```js
window.GLOBAL_MENU = [
  {
    key: 'task-management',
    label: '任务协作',
    icon: 'icon-task',
    href: '../task-management/prototype/pages/task-list.html',
    group: '协作',
  },
  {
    key: 'user-authentication',
    label: '用户中心',
    icon: 'icon-user',
    href: '../user-authentication/prototype/pages/profile.html',
    group: '账户',
  },
  // 每新增模块必须在此 push 一条，否则菜单不显示
];
```

**页面如何使用**（`task-management/prototype/pages/task-list.html`）

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="../../../_shared/css/tokens.css" />
  <link rel="stylesheet" href="../../../_shared/css/common.css" />
  <link rel="stylesheet" href="../css/pages/task-list.css" />
</head>
<body>
  <div id="app-header"></div>
  <div class="app-layout">
    <aside id="app-sidebar"></aside>
    <main id="app-content">
      <!-- 业务内容 -->
    </main>
  </div>

  <!-- 公共层：顺序重要（menu-data 要在 sidebar 之前） -->
  <script src="../../../_shared/reference/menu-data.js"></script>
  <script src="../../../_shared/reference/header.js"></script>
  <script src="../../../_shared/reference/sidebar.js"></script>
  <script src="../../../_shared/js/common.js"></script>
  <script src="../../../_shared/api/routes.js"></script>

  <!-- 本模块层 -->
  <script src="../mock/tasks.js"></script>
  <script src="../js/services/task-service.js"></script>
  <script src="../js/pages/task-list.js"></script>

  <script>
    // 只做初始化
    SharedHeader.render('#app-header');
    SharedSidebar.render('#app-sidebar', 'task-management');
    TaskListPage.init();
  </script>
</body>
</html>
```

### 2.3 SSOT 与渐进披露（JS 化后依然保留）

- header/sidebar/footer 只在 `_shared/reference/` 定义一次，改一处全局生效
- 新页面只关心"业务区"，公共层靠 `<script src>` 引入而非 copy-paste
- 菜单唯一源头是 `_shared/reference/menu-data.js`，任何模块不得自建菜单

---

## 三、路由与接口管理

### 3.1 路由配置中心（`_shared/api/routes.js`）

集中管理所有接口，**跨模块共用一份**：

```js
window.API = {
  // 任务模块
  GET_TASK_LIST:  { url: '/api/tasks',        method: 'GET'    },
  CREATE_TASK:    { url: '/api/tasks',        method: 'POST'   },
  UPDATE_TASK:    { url: '/api/tasks/:id',    method: 'PUT'    },
  DELETE_TASK:    { url: '/api/tasks/:id',    method: 'DELETE' },

  // 用户模块
  GET_USER_PROFILE: { url: '/api/users/:id',  method: 'GET'    },
  UPDATE_PROFILE:   { url: '/api/users/:id',  method: 'PUT'    },
};
```

- 页面调用时用常量（`API.GET_TASK_LIST`）
- **页面内严禁硬编码 URL**
- 新模块在本文件追加接口块，不得另建 `routes.js`

### 3.2 跨模块跳转（`_shared/js/router.js`）

封装相对路径计算，避免模块内硬拼 `../../xxx/prototype/pages/xxx.html`：

```js
window.Router = {
  go(moduleKey, pageName, params) {
    // 根据模块 key 与页面名生成相对路径
    const base = `../${moduleKey}/prototype/pages/${pageName}.html`;
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    window.location.href = base + qs;
  },
};

// 使用：Router.go('user-authentication', 'profile', { id: 123 });
```

### 3.3 Mock 数据策略（JS 常量挂 window）

**原则**：`fetch` 不可用，所有 Mock 通过 `<script src>` 加载，数据挂到 `window` 全局：

```js
// _shared/mock/users.js
window.USERS_MOCK = [
  { id: 1, name: '张三', avatar: '...', role: '项目经理' },
  { id: 2, name: '李四', avatar: '...', role: '开发' },
  { id: 3, name: '王五', avatar: '...', role: '设计' },
];
```

```js
// task-management/prototype/mock/tasks.js
window.TASKS_MOCK = {
  normal: [ /* 10-20 条典型任务 */ ],
  empty: [],
  overflow: [ /* 1000 条压力测试 */ ],
  extreme: [ /* 极长文本/极值字段 */ ],
};
```

**业务合理性**：
- ❌ 禁止无意义占位（`test1` / `111` / `xxx`）
- ✅ 按业务上下文生成：任务标题、真实人名、合理日期、符合枚举的状态

**边界覆盖**：每份 Mock 必须提供三种态供切换使用
- 正常态（典型数量 10-20 条）
- 极值态（极长文本 / 大量行 / 极端数字）
- 异常态（空列表 / 字段缺失 / 失败）

**Service 层读 Mock 的模式**：

```js
// task-management/prototype/js/services/task-service.js
window.TaskService = {
  async getList(query) {
    // 模拟网络延迟 + 可切换态
    await sleep(300);
    return window.TASKS_MOCK.normal;
  },
};
```

---

## 四、样式层级

### 4.1 token 层（唯一）
`_shared/css/tokens.css` 定义 CSS 变量：色值、字号、间距基数、圆角、阴影。

```css
:root {
  --color-primary: #1e3a8a;
  --color-text-title: #1f2937;
  --color-bg-page: #f5f5f5;
  --radius-card: 6px;
  --space-unit: 8px;
  --font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  /* ... */
}
```

### 4.2 公共组件样式（`_shared/css/common.css`）
布局类、按钮、表单、表格、Toast 等通用样式。

### 4.3 模块专属样式（`<模块>/prototype/css/pages/*.css`）
只包含本模块页面独有的样式，**引用 token 变量**，不得覆盖 token。

---

## 五、命名规范

| 对象 | 要求 | 示例 |
|------|------|------|
| CSS 类名 | **语义化 + 模块前缀（共享类除外）** | ✅ `task-list__row` / `btn-submit-task` / ❌ `btn-1` |
| JS 变量 | **语义化** | ✅ `currentTaskList` / ❌ `data1` |
| window 全局对象 | **大驼峰 + 模块前缀**，按命名空间挂载 | ✅ `TaskService` / `SharedHeader` / ❌ `service` |
| HTML id | **全局唯一 + 语义化** | ✅ `task-list-container` |
| data-test-id | **所有可交互元素必须具备** | `data-test-id="btn-create-task"` |
| 模块目录名 | **kebab-case** | ✅ `task-management` / ❌ `TaskManagement` |

**命名重要性**：AI 做后续迭代时靠语义名快速锁定目标；多模块并存时命名空间化防冲突。

---

## 六、状态管理与数据流

| 范围 | 处理方式 |
|------|---------|
| 页面级状态 | 局部变量管理（弹窗显隐、Tab 切换、表单填写中内容） |
| 跨页面状态 | URL 参数 / `localStorage` / `sessionStorage` |
| 跨模块状态 | 统一走 `localStorage` + 明确的 key 前缀（如 `shared:currentUser`） |

**关键要求**：跨页面/跨模块跳转时，**核心上下文（用户身份、选中 ID、筛选条件）不可丢失**。

---

## 七、代码解耦（Service / Manager 模式）

复杂逻辑封装为独立模块，挂到 window 命名空间：

```
<模块>/prototype/js/services/
├── task-service.js        # 本模块接口封装（挂 TaskService）
└── validator.js           # 复杂校验规则

_shared/js/
├── common.js              # 工具函数（sleep/format/toast/ 挂 Utils）
└── router.js              # 跨模块跳转（挂 Router）
```

**HTML 页面 `<script>` 只做两件事**：
1. 按依赖顺序引入 Service/Manager 的 `<script src>`
2. 调用 `init()` 启动页面

**反模式**：页面底部塞几百行业务逻辑。

---

## 八、加载态与操作反馈

| 场景 | 默认处理 |
|------|---------|
| Mock "请求"期间（sleep 模拟延迟） | 目标容器显示 **Skeleton 骨架屏** |
| 提交/保存操作 | 主按钮进入 **Loading + Disabled** |
| 写操作结果 | 必须有 **Toast 提示**（`Utils.toast()` 统一实现） |
| 读操作无数据 | 空态插图（引用 `_shared/images/empty-*.svg`）+ 引导操作 |

---

## 九、响应式保障

| 规范项 | 要求 |
|--------|------|
| 最小宽度 | **1280px 下无横向滚动条**，内容自动缩放 |
| Sticky | **Header 和面包屑保持吸顶** |
| 高度适配 | 列表区、表单区内部支持滚动 |

---

## 十、可访问性

- 用语义化 HTML（`<button>` 优于 `<div onclick>`）
- 图标配 `aria-label` 或 `tooltip`
- 表单控件有关联的 `<label for>`
- 所有可交互元素具备 `data-test-id`

---

## 十一、重构触发条件

当以下情况出现，**必须重构**：

| 情况 | 处理 |
|------|------|
| 3 个以上模块出现类似 JS 逻辑 | 提取到 `_shared/js/` |
| 3 个以上模块出现类似 CSS | 提取到 `_shared/css/common.css` |
| 公共组件需修改 | 只改 `_shared/reference/`，全局自动同步 |
| `_shared/` 重大变更（改了 token / 菜单结构 / 布局） | 在 `_shared/iteration-log.md` 记录 + 评估影响的模块清单 |

---

## 十二、生成前自检清单

AI 在原型生成完成前，用此清单自检：

**file:// 兼容**
- [ ] 未出现任何 `fetch()` / `XMLHttpRequest` / 动态 `import`
- [ ] 所有公共组件通过 `<script src>` 加载，HTML 模板以字符串存在于 JS 中
- [ ] 所有 Mock 数据作为 `window.XXX_MOCK` 常量，通过 `<script src>` 加载

**结构契约**
- [ ] `_shared/` 目录已建立（首次生成）或已存在且被引用
- [ ] 本模块菜单已在 `_shared/reference/menu-data.js` 注册
- [ ] 本模块 CSS 引用了 `_shared/css/tokens.css`，未硬编码主色/间距基数
- [ ] 页面未 copy-paste header/sidebar/footer
- [ ] 本模块未自建 `routes.js`（接口并入 `_shared/api/routes.js`）

**工程质量**
- [ ] Mock 数据业务合理（无 `test1`/`111`），覆盖正常 / 极值 / 异常三态
- [ ] 类名、ID 语义化；禁用 `btn-1`、`data1` 类命名
- [ ] 可交互元素都有 `data-test-id`
- [ ] 样式 / 逻辑分目录；HTML 内无海量行内样式或业务逻辑
- [ ] 复杂逻辑封装到 Service/Manager；页面 `<script>` 只做初始化
- [ ] 加载态用骨架屏；写操作有 Toast；提交按钮有 Loading 态
- [ ] 1280px 下无横向滚动；Header / 面包屑 Sticky

**本地打开验证**
- [ ] 直接双击根目录 `index.html` 可以正常进入菜单页
- [ ] 从菜单能跳转到本模块任一页面，不出现 404 或白屏
- [ ] 控制台无 CORS / fetch 相关报错
