# 动作↔接口归因策略

> 整条管线最难、最决定质量的一环：把"某个接口请求"准确归因到"哪一步 UI 操作"。

## 为什么不靠时间窗口 / 解 trace.zip

- ❌ **时间窗口启发式**（请求时间靠近哪个 click 就算谁）：并发请求、防抖、预加载、轮询会串味。
- ❌ **事后解 trace.zip**：Playwright 私有二进制格式，解析脆、易随版本变。
- ✅ **回放插桩**：回放时声明"当前步骤"，`page.on('response')` 落进当前桶 —— 零歧义。

trace.zip 仍开，但只当**视觉审计兜底**（出错回看截图/DOM），不作机器归因依据。

## 插桩规则：raw.spec.ts → runner.spec.ts

codegen 产出的是**线性动作序列**。插桩 = 在每个"有业务含义的动作"前插一行 `cap.step('语义')`。

### 转写步骤

1. 在文件顶部加 `import { Capture } from './capture';`，测试体首行 `const cap = new Capture(page, { apiPattern: /\/api\// });`
2. 逐条扫描 codegen 动作，**每个动作前**插 `await cap.step('<语义>', '<locator表达式>')`：
   - `goto` → `await cap.step('打开 X 页', "goto '/x'")`
   - `fill` → `await cap.step('填写 <字段名>', "textbox '<name>'")`
   - `click` 按钮/链接 → `await cap.step('点击 <文案>', "button '<name>'")`
   - `selectOption` → `await cap.step('选择 <字段>', "combobox '<name>'")`
   - **第二参数 = 真实 locator 表达式**（role + name，与下一行动作一致）。它是 grep 前端源码定位元素的桥，务必如实填，不可省。
3. `cap.step` 是**异步**的（要抓页面身份指纹），务必 `await`，否则指纹抓取会与下个动作竞争。
4. **关键交互后统一 `await settle(page)`**（提交/切页/打开弹窗/popup/展开下拉/新窗口）——
   `settle = networkidle(catch 超时) + 保守 waitForTimeout(SETTLE_MS)`，确保接口落定、动态内容渲染后再进下一步。
   基调与 `SETTLE_MS` 见 [`robustness-playbook.md`](robustness-playbook.md) §4，runner 模板已内置 `settle()`。
5. 测试结尾加 `await cap.dump('events.json');`
6. **保真第一**：可把脆弱 selector 加固、加滚动/等待，但**不改目标元素、顺序，不简化 popup/导航**。
   加固规则见 [`robustness-playbook.md`](robustness-playbook.md)（popup / selector 优先级 / 滚动 / 等待 / 不抄近路）。
7. **多窗口**：原录制里的 `waitForEvent('popup')` 必须保留；popup 后的步骤 `cap.step(label, action, popup)`
   第三参数传新窗口。capture.ts 已在 context 级监听，popup 接口自动捕获。

> 每步会自动捕获页面身份指纹（route / title / heading），连同你填的 locator 表达式一起落进
> `events.json` 的 `steps[].page` 与 `steps[].action`，供后续关联前端代码与异常追溯。
> 用法见 [`code-correlation.md`](code-correlation.md)。

### 语义来源（步骤语义从哪来）

codegen 只记动作不记意图。两条路，**以 (b) 为主**：

- **(b) AI 反推（默认）**：从 locator 的 role + name + 动作类型推断语义（如 `getByRole('button',{name:'登录'}).click()` → "点击登录"）。覆盖 90% 场景。
- **(a) 人工笔记（补充）**：录制时人顺手记一句话，复杂分支/语义不明处用它校正。

### 粒度建议

- **一个用户意图 = 一步**：连续 `fill` 多个表单字段可各自一步，也可合并为"填写表单"一步——以"是否各自触发接口"为界，触发接口的动作必须独立成步。
- **不触发接口的纯输入步**可保留（让流程图更完整），它们的桶为空，生成 `.flow` 时并入相邻节点。

## 归因正确性自检

回放后核对 `events.json`：
- 每个 `calls[]` 的 `step` 都指向一个真实 `steps[]`；
- 关键接口（登录、提交）归属的 `stepLabel` 与预期一致；
- 出现 `step: -1`（init 桶）= 有接口在第一个 `cap.step()` 前触发，补一个更早的 step。
