# Snapshot 管理与错误恢复策略

> 本文档在 **阶段 3: 逐模块执行** 中遇到 ref 相关错误时按需查阅。
> Snapshot 是 `playwright-cli` 操作的核心机制，正确的 ref 管理决定测试的稳定性。

---

## 1. Snapshot 核心原理

### 1.1 什么是 Snapshot？

`playwright-cli snapshot` 命令扫描当前页面所有可交互的 DOM 元素，并为每个元素分配一个**临时引用编号 (ref)**，格式为 `eNN`（如 `e1`, `e2`, `e15`）。

```bash
$ playwright-cli snapshot
# 输出示例：
# e1: <button>新增因素</button>
# e2: <input type="text" placeholder="因素名称">
# e3: <select class="el-select">
# e4: <button>查询</button>
# e5: <a href="/factor/1">编辑</a>
```

### 1.2 ref 的生命周期

| 阶段       | ref 状态      | 说明                                                    |
| ---------- | ------------- | ------------------------------------------------------- |
| snapshot后 | ✅ 有效       | ref 与当前 DOM 元素绑定，可以安全使用                    |
| DOM未变时  | ✅ 有效       | 只要 DOM 没有变化，ref 持续有效                          |
| DOM变化后  | ❌ **失效**   | 页面导航、弹窗、表单提交等导致 DOM 变化时，ref 必须刷新 |

### 1.3 必须重新 snapshot 的场景

| 场景                      | 触发条件                                          |
| ------------------------- | ------------------------------------------------- |
| 页面导航                  | `goto`、点击链接、浏览器后退/前进                  |
| SPA 路由切换              | 通过 Vue Router / React Router 切换视图            |
| 弹窗开启                  | Modal / Dialog / Drawer / Popover 出现              |
| 弹窗关闭                  | 弹窗关闭后底层页面可能已刷新                       |
| 表单提交                  | 提交后可能触发列表刷新、页面跳转                   |
| Tab / 折叠面板切换        | 切换后新 Tab 面板的元素加载                         |
| 列表翻页                  | 翻页后表格行元素完全更新                           |
| 搜索/筛选操作             | 列表内容变化，旧行的 ref 已失效                    |
| 动态内容加载              | 懒加载、无限滚动等触发新元素渲染                   |

---

## 2. ref 错误类型与恢复策略

### 2.1 `Ref eXX not found`

**最常见错误**。表示引用的 ref 编号在当前 DOM 中不存在。

**原因分析**（按概率排序）：

| 原因                        | 概率 | 恢复策略                                               |
| --------------------------- | ---- | ------------------------------------------------------ |
| DOM 已变化但未重新 snapshot  | 60%  | 立即 `snapshot`，用新 ref 重试                          |
| 元素在视口外（需滚动）      | 15%  | `snapshot` 检查是否包含目标元素，若无则尝试滚动页面      |
| 元素尚未加载（异步渲染）    | 15%  | `wait 2000` → `snapshot` → 检查目标元素是否出现         |
| 元素被条件渲染隐藏（v-if 等）| 10% | 检查触发条件，执行对应操作使元素显示后 `snapshot`        |

**标准恢复流程**：

```bash
# 原命令失败
playwright-cli click e15      # ❌ Ref e15 not found

# 恢复步骤
playwright-cli snapshot       # Step 1: 重新获取 ref
                              # 输出新 ref 列表，查找目标元素
playwright-cli click e8       # Step 2: 使用正确的新 ref
```

### 2.2 页面导航超时 (Navigation Timeout)

**原因**：目标 URL 无法访问或加载时间过长。

**恢复流程**：

```bash
# Step 1: 确认服务是否正常
# 检查被测服务是否仍在运行

# Step 2: 重试导航
playwright-cli goto {URL}

# Step 3: 若仍超时，尝试刷新
playwright-cli reload

# Step 4: 若问题持续，记录为环境 Bug，跳过当前用例
```

### 2.3 意外弹窗阻塞

**原因**：页面出现了原生 `alert()` / `confirm()` 对话框，阻塞后续操作。

**恢复流程**：

```bash
# Step 1: 截图记录弹窗内容
playwright-cli screenshot --filename=test-reports/screenshots/XX_unexpected_dialog.png

# Step 2: 清除弹窗
playwright-cli dialog-accept     # 或 dialog-dismiss

# Step 3: 重新获取 ref
playwright-cli snapshot
```

### 2.4 SPA 路由渲染延迟

**原因**：路由切换后，新视图的组件异步加载尚未完成。

**恢复流程**：

```bash
# Step 1: 等待渲染
playwright-cli wait 2000

# Step 2: 获取快照并检查
playwright-cli snapshot

# Step 3: 若快照内容为空或不完整，继续等待
playwright-cli wait 3000
playwright-cli snapshot

# Step 4: 若 3 次重试后仍为空，记录为 Bug
```

### 2.5 元素点击无响应

**原因**：元素被其他元素遮挡（如 Loading 遮罩、固定定位元素）。

**恢复流程**：

```bash
# Step 1: 截图查看当前页面状态
playwright-cli screenshot --filename=test-reports/screenshots/XX_click_blocked.png

# Step 2: 等待遮挡元素消失（如 Loading）
playwright-cli wait 2000

# Step 3: 重新 snapshot 并尝试
playwright-cli snapshot
playwright-cli click {new_ref}
```

---

## 3. 防御性编程模式

### 3.1 安全导航模式

在每次导航后，强制执行 "导航 → 等待 → 快照 → 验证" 四步：

```bash
playwright-cli goto {URL}               # 1. 导航
playwright-cli wait 1000                 # 2. 等待加载
playwright-cli snapshot                  # 3. 获取 ref
# 4. 验证：检查快照中是否包含预期的关键元素
```

### 3.2 安全交互模式

在每次重大交互后，强制 snapshot：

```bash
playwright-cli click {ref}              # 交互操作
playwright-cli wait 500                  # 等待 DOM 变化
playwright-cli snapshot                  # 刷新 ref
# 继续使用新的 ref 操作
```

### 3.3 重试上限

| 操作类型      | 最大重试次数 | 每次重试间隔 | 超限处理                  |
| ------------- | ------------ | ------------ | ------------------------- |
| snapshot 为空 | 3            | 2000ms       | 记录为 Bug，跳过当前步骤  |
| ref not found | 2            | 1000ms       | 重新 snapshot 尝试定位     |
| 导航超时      | 2            | 3000ms       | 记录为环境异常，跳过模块  |
| 点击无响应    | 2            | 2000ms       | 截图记录，标记为 Bug      |

---

## 4. 常见 UI 框架元素识别技巧

### 4.1 Element Plus (Vue)

| 组件               | snapshot 中的 ref 特征                          |
| ------------------ | ----------------------------------------------- |
| `el-button`        | `<button class="el-button">文字</button>`        |
| `el-input`         | `<input class="el-input__inner">`                |
| `el-select`        | 点击后出现 `<li>` 选项列表，需要先 click 再 snapshot |
| `el-dialog`        | 弹窗打开后 snapshot 可看到 dialog 内的 ref        |
| `el-table`         | 每行的操作按钮会有独立的 ref                      |
| `el-message`       | Toast 消息不阻塞 DOM，直接截图                    |
| `el-message-box`   | 类似 Modal，snapshot 后操作确认/取消按钮          |

### 4.2 Ant Design (React)

| 组件            | snapshot 中的 ref 特征                           |
| --------------- | ------------------------------------------------ |
| `Button`        | `<button class="ant-btn">文字</button>`           |
| `Input`         | `<input class="ant-input">`                       |
| `Select`        | 点击后 dropdown 渲染，需要 snapshot 获取选项 ref   |
| `Modal`         | 弹窗打开后 snapshot 可获取内部 ref                 |
| `Table`         | 行操作按钮各有独立 ref                             |
| `message`       | 不阻塞 DOM，直接截图                               |
| `Modal.confirm` | snapshot 后操作确认/取消按钮                       |

### 4.3 传统 HTML

| 元素           | snapshot 中的 ref 特征                            |
| -------------- | ------------------------------------------------- |
| `<button>`     | 直接可见                                           |
| `<input>`      | 直接可见                                           |
| `<select>`     | 原生 select，`select` 命令可直接操作               |
| `<a>`          | 链接标签，直接 `click`                              |
| `<form>`       | 整体表单，通过内部元素 ref 操作                    |

---

## 5. 最佳实践总结

| #  | 实践                                    | 说明                                                   |
| -- | --------------------------------------- | ------------------------------------------------------ |
| 1  | **开操作前必 snapshot**                  | 进入新页面、弹窗、路由切换后，第一件事永远是 snapshot    |
| 2  | **不猜测 ref**                          | ref 编号是动态分配的，每次 snapshot 后都可能变化          |
| 3  | **逐条执行、逐条检查**                  | 不批量发送命令，逐条确认上一条结果后再执行下一条         |
| 4  | **失败即截图**                          | 任何非预期结果都先截图作为证据，然后才尝试恢复           |
| 5  | **重试有限**                            | 同一操作最多重试 2-3 次，超限记录为 Bug                  |
| 6  | **用 wait 代替猜测**                    | 不确定 DOM 是否就绪时，先等一等再 snapshot               |
| 7  | **select 元素特殊处理**                 | UI 框架的 select 通常需要先 click 打开 → snapshot → click 选项 |
