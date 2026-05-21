# 全局原型索引 · 模板

> 管理跨模块的原型全局视图。**保存路径**：`docs/prds/_index.md`
> 在第一个模块生成时由 AI 创建；每新增 / 更新 / 交付模块时同步维护。
> 与 `_shared/iteration-log.md` 配合使用：本文档记录"当前状态"，`_shared/iteration-log.md` 记录"变更历史"。
>
> **与 `_templates.md` 的区别**：
> - `_templates.md` 是**模板注册表**（本 skill 只读），登记可复用的模板模块
> - `_index.md` 是**运行态全局索引**（本 skill 读写），登记项目中所有模块（业务 + 模板）的当前状态、菜单挂载、原型入口
> - 模板模块（`_template-<类型>/`）同样在 `_index.md` 里登记（状态列区分），并以独立一级分组"📚 模板参考"出现在菜单中

---

## 原型设计文档头（文件顶部固定信息）

```markdown
# 全局原型索引

**根目录**：`docs/prds/`
**演示入口**：[index.html](./index.html)
**共享层**：[_shared/](./_shared/)
**模板索引**：[_templates.md](./_templates.md)
**创建时间**：2026-04-19
**最后更新**：2026-04-20
**模块数**：3 业务（2 已交付 / 1 迭代中） + 1 模板（✅ 可用）
```

---

## 一、模块注册表

所有模块（业务 + 模板）的总览，每个模块一行。新增模块时在此登记，生成页面前必须完成登记。

```markdown
| 模块 Key | 类别 | 业务名称 | 状态 | 菜单挂载 | 原型设计文档 | 原型入口 | 参考模板 | 备注 |
|---------|------|---------|------|---------|------|---------|---------|------|
| task-management | 业务 | 任务协作 | ✅ 已交付 | 协作 / 任务中心 | [input-design](./task-management/input-design.md) | [task-list.html](./task-management/prototype/pages/task-list.html) | pc-admin-standard | 首版 2026-04-19 |
| user-authentication | 业务 | 用户中心 | 🔄 迭代中 | 账户 / 个人中心 | [input-design](./user-authentication/input-design.md) | [profile.html](./user-authentication/prototype/pages/profile.html) | pc-admin-standard | 含登录/注册/修改密码 |
| report-analytics | 业务 | 数据看板 | 🛠 生成完成 | 协作 / 数据分析 | [input-design](./report-analytics/input-design.md) | [dashboard.html](./report-analytics/prototype/pages/dashboard.html) | pc-admin-standard | 待需求方确认 |
| _template-pc-admin-standard | 模板 | PC 后台标准型 | 📚 可用 | 📚 模板参考 / PC 后台标准 | [input-design](./_template-pc-admin-standard/input-design.md) | [list.html](./_template-pc-admin-standard/prototype/pages/list.html) | — | 由模板策展 skill 维护 |
```

**状态值约定**（与各模块 `input-design.md` 元信息同步）：

业务模块：
| 图标 | 状态 | 含义 |
|------|------|------|
| 📝 | 整理中 | 输入原型设计文档编写阶段 |
| 🔍 | 诊断完成 | 已完成完备性诊断 |
| 🛠 | 生成完成 | 原型已生成，待确认 |
| 🔄 | 迭代中 | 反馈/调整阶段 |
| ✅ | 已交付 | 收敛完成 |
| ⏸ | 暂停 | 临时搁置 |

模板模块：
| 图标 | 状态 | 含义 |
|------|------|------|
| 📚 | 可用 | 已就绪，可被业务模块匹配复用 |
| 🛠 | 建设中 | 策展 skill 正在共创 |
| ⏸ | 废弃 | 保留但不再匹配 |

---

## 二、菜单结构快照

定期从 `_shared/reference/menu-data.js` 抽象出来的可读版本，便于全局对照。

```markdown
产品菜单树（当前版本）:
├── 协作
│   ├── 任务中心 → task-management
│   └── 数据分析 → report-analytics
├── 账户
│   └── 个人中心 → user-authentication
├── 设置
│   └── （待新增）
└── 📚 模板参考                 ⭐ 模板模块统一挂在此一级分组下
    └── PC 后台标准
        ├── 列表页模板 → _template-pc-admin-standard/prototype/pages/list.html
        ├── 详情页模板 → _template-pc-admin-standard/prototype/pages/detail.html
        └── 表单页模板 → _template-pc-admin-standard/prototype/pages/form.html
```

**维护规则**：
- 每次改 `menu-data.js` 后，同步刷新本节
- "📚 模板参考" 一级分组由模板策展 skill 建立；本 skill 不得改动其结构
- 业务模块的菜单挂载由本 skill 决定，追加到其他一级分组（如"协作"、"账户"）

---

## 三、共享层变更影响速览

`_shared/` 发生变更时，在此记录最近几次影响范围。详细历史见 `_shared/iteration-log.md`。

```markdown
| 日期 | 变更内容 | 影响模块 | 验证结果 |
|------|---------|---------|---------|
| 2026-04-20 | 主色 `#1e3a8a` → `#2563eb` | 全部 3 个业务模块 + 1 个模板模块 | ✅ 已视觉回归 |
| 2026-04-19 | 新增菜单项「数据分析」 | task-management（无影响）, user-authentication（无影响）, report-analytics（新增模块） | ✅ |
```

---

## 四、全局演示入口说明

`docs/prds/index.html` 的职责：
- 双击打开后作为**全系统首页**
- 渲染共享 header + sidebar
- 内容区展示"模块选择"卡片 / 欢迎引导 / 最新更新提示
- 点菜单或卡片跳入对应模块的原型首页
- 模板模块通过"📚 模板参考"分组可达，便于开发者随时查看风格基线

> 本文件由模板策展 skill 在初始化共享层时产出；本 skill 不重新创建，但菜单结构变化时由本 skill 触发其 re-render（通过更新 `menu-data.js`）。

---

## 五、跨模块跳转契约

模块间跳转统一走 `_shared/js/router.js` 封装，或使用相对路径模板：

```js
// 推荐：语义化调用
Router.go('user-authentication', 'profile', { id: userId });

// 兜底：相对路径（页面在 <模块>/prototype/pages/ 下时）
// '../../user-authentication/prototype/pages/profile.html'
```

**禁止**：
- 硬编码绝对路径（如 `/docs/prds/...`）——会在用户本地打开时失效
- 跨模块直接引用对方的 css/js 文件——共用部分必须下沉到 `_shared/`

---

## 六、维护建议

- **模块注册表是第一等公民**：新增模块时，本 skill 必须先写这行登记，再生成代码
- **状态与原型设计文档同步**：模块 `input-design.md` 元信息状态变化时，本文注册表同步刷新
- **菜单结构是视觉契约**：挂载位置由本 skill 基于 `input-design.md` 决定，不得在生成过程中临时变动
- **共享层变更要谨慎**：每次改 `_shared/` 要评估所有模块，填写"影响速览"
- **已交付模块不随意改**：如确需改动，评估对共享层和其他模块的连带影响
- **模板模块保持"只读"视角**：本 skill 不得改动模板模块条目；只在首次观察到策展 skill 的新产物时补登记行（若缺）
