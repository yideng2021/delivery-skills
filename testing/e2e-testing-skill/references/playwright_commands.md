# playwright-cli 命令速查手册

> 本文档在 **阶段 3: 逐模块执行** 时按需查阅。
> 所有命令通过 `run_command` 工具在终端中执行。

---

## 1. 浏览器生命周期

### 1.1 启动浏览器

```bash
# 启动浏览器并打开指定 URL
playwright-cli open {URL}

# 示例
playwright-cli open http://localhost:8080
playwright-cli open http://localhost:5173/#/dashboard
```

### 1.2 调整窗口尺寸

```bash
# 设置浏览器窗口大小（推荐 1920x1080 保证截图一致性）
playwright-cli resize {width} {height}

# 示例
playwright-cli resize 1920 1080
```

### 1.3 关闭浏览器

```bash
# 关闭浏览器实例
playwright-cli close
```

---

## 2. 页面导航

### 2.1 跳转页面

```bash
# 导航到指定 URL
playwright-cli goto {URL}

# Hash 路由（Vue Router 默认模式）
playwright-cli goto http://localhost:8080/#/user/list

# History 路由
playwright-cli goto http://localhost:8080/user/list
```

### 2.2 页面刷新

```bash
# 刷新当前页面
playwright-cli reload
```

### 2.3 前进 / 后退

```bash
# 浏览器后退
playwright-cli go-back

# 浏览器前进
playwright-cli go-forward
```

---

## 3. 页面快照 (Snapshot)

> ⚠️ **核心命令**：每次 DOM 变化后必须执行 snapshot 获取最新 ref。

```bash
# 获取当前页面可交互元素的快照（返回 ref 编号列表）
playwright-cli snapshot

# 快照输出示例：
# e1: <button>新增</button>
# e2: <input type="text" placeholder="请输入名称">
# e3: <select>
# e4: <a href="/detail/1">查看详情</a>
```

**snapshot 使用铁律**：

| 规则             | 说明                                                     |
| ---------------- | -------------------------------------------------------- |
| 页面导航后       | `goto` 或点击导航链接后，必须 `snapshot`                  |
| 弹窗出现后       | Modal/Dialog/Drawer 弹出后，必须 `snapshot`               |
| 弹窗关闭后       | 弹窗关闭后 DOM 变化，必须 `snapshot`                      |
| 表单提交后       | 提交操作可能触发页面刷新或列表更新，必须 `snapshot`        |
| 路由切换后       | SPA 路由切换后 DOM 完全变化，必须 `snapshot`               |
| Tab/Accordion 切换后 | 页签切换可能加载新内容，必须 `snapshot`                |

---

## 4. 元素交互

### 4.1 点击

```bash
# 点击指定 ref 的元素
playwright-cli click {ref}

# 示例
playwright-cli click e1    # 点击"新增"按钮
playwright-cli click e4    # 点击"查看详情"链接
```

### 4.2 填写输入框

```bash
# 向输入框填入文本（先清空再填入）
playwright-cli fill {ref} "{text}"

# 示例
playwright-cli fill e2 "测试因素名称"
playwright-cli fill e5 "这是一段超长的测试文本用于边界值验证"
```

### 4.3 下拉选择

```bash
# 选择下拉框的指定选项
playwright-cli select {ref} "{option_text}"

# 示例
playwright-cli select e3 "风险等级A"
```

### 4.4 复选框 / 单选框

```bash
# 勾选复选框
playwright-cli check {ref}

# 取消勾选
playwright-cli uncheck {ref}
```

### 4.5 悬停

```bash
# 鼠标悬停在元素上（触发 tooltip/dropdown-menu 等）
playwright-cli hover {ref}
```

### 4.6 键盘输入

```bash
# 模拟键盘按键
playwright-cli press {ref} "Enter"
playwright-cli press {ref} "Tab"
playwright-cli press {ref} "Escape"

# 组合键
playwright-cli press {ref} "Control+a"
playwright-cli press {ref} "Control+c"
```

### 4.7 清除输入框

```bash
# 清空输入框内容
playwright-cli clear {ref}
```

---

## 5. 截图

```bash
# 截取当前页面完整截图
playwright-cli screenshot --filename={path}

# 示例（保存到 test-reports 目录）
playwright-cli screenshot --filename=test-reports/screenshots/01_factor_page_load.png
playwright-cli screenshot --filename=test-reports/screenshots/02_factor_add_form.png
```

**截图命名规范**：`{两位全局序号}_{模块简称}_{场景}.png`

| 场景类型       | 命名示例                        |
| -------------- | ------------------------------- |
| 页面初始加载   | `01_factor_page_load.png`       |
| 打开表单弹窗   | `02_factor_add_form.png`        |
| 填写表单       | `03_factor_form_filled.png`     |
| 提交成功提示   | `04_factor_save_success.png`    |
| 校验错误提示   | `05_factor_empty_error.png`     |
| 列表数据展示   | `06_factor_list_updated.png`    |

---

## 6. 对话框处理

### 6.1 原生对话框（alert / confirm / prompt）

```bash
# 接受对话框（点击"确定"）
playwright-cli dialog-accept

# 拒绝对话框（点击"取消"）
playwright-cli dialog-dismiss
```

> **注意**：UI 框架的 Modal/MessageBox（如 Element Plus 的 `$confirm`）**不是**原生对话框，
> 需要通过 `snapshot` + `click` 操作弹窗按钮。

---

## 7. 等待

```bash
# 等待指定毫秒数
playwright-cli wait {milliseconds}

# 示例：等待 2 秒让动画/请求完成
playwright-cli wait 2000
```

**等待使用建议**：

| 场景                | 建议等待时间  |
| ------------------- | ------------- |
| 页面导航后          | 1000 - 2000ms |
| 表单提交后          | 1000 - 2000ms |
| Toast 消息弹出后    | 500 - 1000ms  |
| 大量数据加载        | 2000 - 3000ms |
| 文件上传            | 3000 - 5000ms |

---

## 8. 常用组合模式

### 8.1 标准表单提交流程

```bash
playwright-cli goto {URL}
playwright-cli snapshot
playwright-cli click {新增按钮ref}               # 打开表单
playwright-cli snapshot                            # ★ 弹窗出现后刷新 ref
playwright-cli fill {名称ref} "测试数据"
playwright-cli select {类型ref} "选项A"
playwright-cli screenshot --filename=test-reports/screenshots/{NN}_{mod}_form_filled.png
playwright-cli click {保存按钮ref}                 # 提交表单
playwright-cli wait 1000
playwright-cli snapshot                            # ★ 提交后刷新 ref
playwright-cli screenshot --filename=test-reports/screenshots/{NN}_{mod}_save_success.png
```

### 8.2 标准删除流程

```bash
playwright-cli snapshot                            # 获取列表元素
playwright-cli click {删除按钮ref}                 # 点击删除
playwright-cli snapshot                            # ★ 确认弹窗出现后刷新 ref
playwright-cli screenshot --filename=test-reports/screenshots/{NN}_{mod}_delete_confirm.png
playwright-cli click {确认按钮ref}                 # 确认删除
playwright-cli wait 1000
playwright-cli snapshot                            # ★ 删除完成后刷新 ref
playwright-cli screenshot --filename=test-reports/screenshots/{NN}_{mod}_delete_success.png
```

### 8.3 标准逆向用例流程（空表单拦截）

```bash
playwright-cli click {新增按钮ref}
playwright-cli snapshot                            # ★ 弹窗出现后刷新 ref
# 不填写任何内容，直接点击保存
playwright-cli click {保存按钮ref}
playwright-cli wait 500
playwright-cli snapshot                            # ★ 校验提示出现后刷新 ref
playwright-cli screenshot --filename=test-reports/screenshots/{NN}_{mod}_empty_validation.png
```

---

## 9. 故障排查速查

| 错误信息               | 可能原因                    | 解决方案                                       |
| ---------------------- | --------------------------- | ---------------------------------------------- |
| `Ref eXX not found`   | DOM 已变化，ref 已过期      | 重新 `snapshot`，使用新 ref 重试                |
| `Navigation timeout`  | 页面加载超时                | 确认服务是否正常 → 重新 `goto {URL}`            |
| `Element not visible` | 元素被遮挡或未在视口内      | 尝试 `hover` 或滚动后重新 `snapshot`            |
| `Target closed`       | 浏览器意外关闭              | 重新 `open {URL}`                               |
| `Dialog blocking`     | 未处理的原生对话框          | `dialog-accept` 或 `dialog-dismiss` 清除        |
| 无任何 ref 输出        | 页面可能正在加载中          | `wait 2000` → 重新 `snapshot`                   |
