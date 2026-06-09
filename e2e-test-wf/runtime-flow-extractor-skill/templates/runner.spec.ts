// runner.spec.ts — 插桩后的回放 runner（示例）
//
// 由 raw.spec.ts（codegen 原始脚本）插桩而来：在每个 UI 动作前插一行
// `await cap.step('业务语义', '<locator表达式>')`，结尾 `await cap.dump()`。
// 除此之外动作逻辑与 codegen 一致。插桩规则见 references/attribution-strategy.md。
//
// 第二参数 = 真实 locator 表达式（与下一行动作一致），它是 grep 前端源码的桥，
// 务必如实填写；step 为异步，务必 `await`。

import { test, type Page } from '@playwright/test';
import { Capture } from './capture';

// ★ 等待基调：关键交互后统一 settle —— networkidle(能等就等) + 保守固定兜底。
//   门户慢则上调 SETTLE_MS；集中一处，不散落魔法数。
const SETTLE_MS = 800;
async function settle(p: Page): Promise<void> {
  await p.waitForLoadState('networkidle').catch(() => undefined);
  await p.waitForTimeout(SETTLE_MS);
}

test('采购需求提交', async ({ page }) => {
  // 只收业务接口；脱敏字段用默认值，可按需扩展
  const cap = new Capture(page, { apiPattern: /\/api\// });

  await cap.step('打开登录页', "goto '/'");
  await page.goto('http://localhost:8080/');

  await cap.step('输入用户名', "textbox '用户名'");
  await page.getByRole('textbox', { name: '用户名' }).fill('admin');

  await cap.step('输入密码', "textbox '密码'");
  await page.getByRole('textbox', { name: '密码' }).fill('demo-pass');

  await cap.step('点击登录', "button '登录'");
  await page.getByRole('button', { name: '登录' }).click();
  await settle(page); // 关键交互：登录跳转

  // ★ 门户→子系统：点击"需求管理"会打开新窗口(popup)，必须用 waitForEvent('popup') 接住，
  //   绝不能简化为单页 / 用 goto 抄近路（会被重定向回 home）。见 robustness-playbook.md。
  await cap.step('点击需求管理(打开子系统)', "link '需求管理'");
  const [portal] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('link', { name: '需求管理' }).click(),
  ]);
  await settle(portal); // 关键交互：新窗口加载

  // 之后所有操作针对 portal 这个新窗口；cap.step 第三参数传 portal，指纹取自正确窗口
  await cap.step('打开新建表单', "button '新建'", portal);
  await portal.getByRole('button', { name: '新建' }).click();
  await settle(portal); // 关键交互：打开弹窗

  // ★ 长表单字段可能被遮挡：先滚动可见再操作
  await cap.step('填写标题', "textbox '需求标题'", portal);
  const title = portal.getByRole('textbox', { name: '需求标题' });
  await title.scrollIntoViewIfNeeded();
  await title.fill('办公耗材采购');

  // ★ 多个"请选择"占位符：用 label 文案锚定，而非脆弱的 nth() 索引
  await cap.step('选择费用来源', "text '需求费用来源请选择'", portal);
  await portal.getByText('需求费用来源请选择').click();
  await settle(portal); // 关键交互：展开下拉，等选项渲染
  await portal.getByRole('option', { name: '专项经费' }).click();

  await cap.step('提交需求', "button '提交'", portal);
  await portal.getByRole('button', { name: '提交' }).click();
  await settle(portal); // 关键交互：提交

  // 落盘图文同源的唯一事实来源（含主页面 + popup 的全部接口）
  await cap.dump('events.json');
});
