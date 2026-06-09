// playwright.config.ts — 回放抓取配置
//
// 三件套各司其职：
//   trace    → 视觉审计兜底（每步截图 + DOM 快照，出错时 show-trace 回看）
//   recordHar→ 全量流量备份（capture.ts 的 events.json 缺 body 时的可靠来源）
//   capture  → 真正的动作↔接口归因（见 capture.ts，运行时生效，无需在此配置）

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 120_000,
  fullyParallel: false, // 业务流有先后依赖，串行回放
  reporter: 'list',
  use: {
    headless: false,           // 录制/复盘期建议有头，便于观察
    trace: 'on',               // 视觉审计兜底
    screenshot: 'only-on-failure', // 失败步自动截图，配合 events.json 步级指纹定位异常
    actionTimeout: 15_000,
    contextOptions: {
      // 全量流量备份；content: 'embed' 把 body 内嵌进 har，便于离线核对
      recordHar: { path: 'network.har', content: 'embed' },
    },
  },
});
