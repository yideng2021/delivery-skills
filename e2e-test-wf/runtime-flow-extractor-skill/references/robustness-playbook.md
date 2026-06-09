# 回放鲁棒性 Playbook（Vue 棕地实战）

> 插桩 raw.spec.ts → runner.spec.ts 时按本篇加固。来自真实门户系统（cnooc gyshfk）的回放教训沉淀。
> 前提仍是**保真**：可加固 selector / 加滚动等待，但**不得改变目标元素、顺序、popup 与导航语义**（见 redlines R4）。

## 1. 多窗口 / popup（最高优先级）

门户 → 子系统跳转常**打开新窗口**，不是同页路由切换。

- **必须**用 `waitForEvent('popup')` 接住新页面，**绝不**简化为单页：
  ```ts
  const [portal] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('link', { name: '需求管理' }).click(),
  ]);
  await portal.waitForLoadState('networkidle');
  ```
- 之后所有操作针对 `portal`；`cap.step(label, action, portal)` 第三参数传新窗口，使页面指纹取自正确窗口。
- capture.ts 已在 **context 级**监听 response，popup 的接口会被自动捕获（无需额外挂监听）。
- 多窗口排查可用 `page.context().pages()` 查看当前所有打开的页面。

## 2. 选择器优先级（codegen 的 nth 易碎）

codegen 常产出 `.nth(3)` / `.first()`，在动态列表/重复占位符下极易错位。**按此优先级加固，指向同一元素**：

```
getByRole(role, { name, exact })           ← 首选：语义稳定
  > getByLabel(label) / getByPlaceholder    ← 表单字段优先用 label
  > getByText(text, { exact: true })        ← 文案锚定
  > locator(...).filter({ hasText })        ← 作用域收窄
  > nth(i)                                   ← 仅最后手段
```

- **多个"请选择"占位符**：`getByText('请选择').first()` 会命中**不可见**的第一个 → 改用**带业务文案的 label 锚定**：
  ```ts
  // ✗ 脆弱：portal.getByText('请选择').nth(2)
  // ✓ 稳定：用字段标签拼出唯一文案
  await portal.getByText('需求费用来源请选择').click();
  ```
- 若占位符确实无差别、只能靠位置 → 用 `nth()` 但**加注释说明为何无法语义定位**，并优先尝试按所在 form-item 作用域收窄。

## 3. 滚动可见（长表单遮挡）

长表单字段可能被 fixed 头部/footer 遮挡，点击落空。**操作前先滚动可见**：

```ts
const field = portal.getByRole('textbox', { name: '需求标题' });
await field.scrollIntoViewIfNeeded();
await field.fill('办公耗材采购');
```

## 4. 等待策略（基调：关键交互后统一加保守 waitForTimeout）

Vue 异步组件、Element Plus 远程下拉的渲染时机**常不可观测**，networkidle 也未必覆盖。
因此本 skill 的默认基调是 **"每个关键交互后统一加一个保守 `waitForTimeout`"**——稳定性优先于速度。

**关键交互**（之后必须 settle）：提交、切页/路由切换、打开弹窗/popup、展开下拉、新窗口加载。

统一封装一个 `settle()`，固定常量、避免散落魔法数：

```ts
const SETTLE_MS = 800; // 保守等待；门户慢则上调到 1000–1500

async function settle(p: Page) {
  await p.waitForLoadState('networkidle').catch(() => undefined); // 有就用，超时不阻断
  await p.waitForTimeout(SETTLE_MS);                              // ★ 统一保守兜底
}

// 用法：关键交互后一律 settle
await portal.getByRole('button', { name: '提交' }).click();
await settle(portal);
```

- `networkidle` 作"能等就等"的前置，`catch` 掉超时不让长轮询/SSE 卡死；真正兜底靠固定 `waitForTimeout`。
- 需要更快时再**局部**用 `waitForResponse(/\/api\/xxx/)` 精确化，但**不取消**统一兜底基调。
- `SETTLE_MS` 集中一处，按门户实际响应速度调一次即可。

## 5. 真实导航，不用 goto 抄近路

`goto('https://req.t-bid.../workbench/index')` 可能被**重定向回 home**，拿不到登录态/上下文，**不能替代正常 UI 导航**。一律走真实点击链路，让 popup/重定向如实发生。

## 插桩自检清单

- [ ] 原录制里的 `waitForEvent('popup')` 全部保留，未被压成单页
- [ ] 所有 `nth()/first()` 已尽量升级为 role/label/exact-text，残留的有注释说明
- [ ] 易遮挡字段操作前有 `scrollIntoViewIfNeeded()`
- [ ] 动态下拉/表单前有 networkidle + 适度等待
- [ ] 无 `goto` 抄近路替代真实导航
- [ ] 跨窗口步骤的 `cap.step(..., portal)` 传了正确的活动页
