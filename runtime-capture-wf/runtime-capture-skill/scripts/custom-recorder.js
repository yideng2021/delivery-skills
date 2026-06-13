// custom-recorder.js
// 替代 npx playwright codegen，支持：
//   - 多标签页（popup）自动监听
//   - 页面 URL 导航序列（含 SPA hash/pushState 路由）
//   - API 请求时序 + 归属页面 URL（录制结束后自动修正竞态导致的 URL 归属错误）
//   - 慢接口自动标注
//
// 运行：node custom-recorder.js [输出前缀]
//       输出前缀默认为 ./output，例如：node custom-recorder.js ./runtime-flows/my-flow
//
// 产物：
//   {前缀}_runtimeflow_api_requests.har   - HAR 流量包（供 parse_har.py 处理）
//   {前缀}_session_log.txt                - 页面导航 + API 请求时序增日志（URL 归属已修正）

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

(async () => {
  const prefix = process.argv[2] || './output';
  const harPath = path.resolve(`${prefix}_runtimeflow_api_requests.har`);
  const logPath = path.resolve(`${prefix}_session_log.txt`);

  const outDir = path.dirname(harPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log(`[custom-recorder] HAR 输出: ${harPath}`);
  console.log(`[custom-recorder] 日志输出: ${logPath}`);
  console.log('[custom-recorder] 启动浏览器，请在 Inspector 面板操作完成后点击 Resume 结束录制...');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    recordHar: {
      path: harPath,
      urlFilter: '**/api/**'
    }
  });

  // ── 结构化数据存储 ────────────────────────────────────────────────────────
  // navEvents: { ts: number(ms UNIX), label: string, url: string, type: string }
  // reqEvents: { ts: number(ms UNIX), offsetMs: number, label: string,
  //              method, pathname, duration, slow, frameUrl, rawLine: string }
  const navEvents = [];
  const reqEvents = [];
  let t0 = null; // timing.startTime（ms UNIX）of first API request
  const recordStart = new Date().toISOString();

  // ── 为单个 page 注册所有监听器 ─────────────────────────────────────────────
  function registerListeners(p, label) {
    // 1. 全页面导航（hard navigation）
    p.on('framenavigated', (frame) => {
      if (frame === p.mainFrame()) {
        const url = frame.url();
        if (!url || url === 'about:blank') return;
        navEvents.push({ ts: Date.now(), label, url, type: 'full' });
      }
    });

    // 2. SPA hash/pushState 路由变化（注入 JS 监听，通过 console 上报）
    p.addInitScript(() => {
      const _report = (type, url) => {
        console.debug(`__PW_NAV__ ${type} ${url}`);
      };
      window.addEventListener('hashchange', () => _report('hash', location.href));
      const _push = history.pushState.bind(history);
      const _replace = history.replaceState.bind(history);
      history.pushState = (...args) => { _push(...args); _report('push', location.href); };
      history.replaceState = (...args) => { _replace(...args); _report('replace', location.href); };
      window.addEventListener('popstate', () => _report('pop', location.href));
    });

    p.on('console', (msg) => {
      if (msg.type() !== 'debug') return;
      const text = msg.text();
      if (!text.startsWith('__PW_NAV__')) return;
      const parts = text.split(' ');
      // 格式：__PW_NAV__ <type> <url>（url 中不含空格）
      const type = parts[1];
      const url  = parts[2];
      if (url) navEvents.push({ ts: Date.now(), label, url, type: `spa:${type}` });
    });

    // 3. API 请求时序 + 归属页面 URL（竞态 URL 由录制结束后 remapUrls 修正）
    p.on('requestfinished', (request) => {
      if (!request.url().includes('/api/')) return;
      const timing = request.timing();
      if (t0 === null) t0 = timing.startTime;
      const offsetMs = timing.startTime - t0;
      const duration = timing.responseEnd >= 0
        ? (timing.responseEnd - timing.requestStart).toFixed(0)
        : '?';
      const frameUrl = request.frame()?.url() ?? 'unknown';
      const slow = duration !== '?' && Number(duration) > 1000;
      let pathname;
      try { pathname = new URL(request.url()).pathname; } catch { pathname = request.url(); }
      reqEvents.push({
        ts: t0 + offsetMs,      // ms UNIX，用于 NAV 时间轴查找
        offsetMs,
        label,
        method: request.method(),
        pathname,
        duration,
        slow,
        frameUrl,               // 竞态原始值，会被 remapUrls 覆盖
      });
    });
  }

  // ── 初始页面 ────────────────────────────────────────────────────────────────
  const page = await context.newPage();
  registerListeners(page, 'page0');

  // ── 自动监听后续所有 popup / 新标签页 ────────────────────────────────────────
  let pageCount = 1;
  context.on('page', (newPage) => {
    const label = `page${pageCount++}`;
    console.log(`[custom-recorder] 检测到新标签页，开始监听 [${label}]`);
    registerListeners(newPage, label);
  });

  // ── 启动 Playwright Inspector 录制 ─────────────────────────────────────────
  await page.pause();

  const recordEnd = new Date().toISOString();

  // ── 录制结束后：用 NAV 时间轴修正 REQ 归属 URL ───────────────────────────────
  /**
   * 对每条 REQ，找同 page 中 ts <= req.ts 的最后一条 NAV，
   * 替换 frameUrl（修正导航竞态导致的归属错误）。
   *
   * 规则与 remap_url.py 完全一致：
   *   - req.ts < 第一条 NAV.ts  → 归属第一条 NAV 的 URL（登录初始化请求）
   *   - 否则取 nav.ts <= req.ts 的最后一条
   */
  function remapUrls() {
    // 按 page label 分组，构建 NAV 时间轴（同一时刻去重，保留最后一条）
    const timeline = {}; // { label: [{ts, url}, ...] } 已按 ts 升序
    for (const ev of navEvents) {
      if (!timeline[ev.label]) timeline[ev.label] = [];
      const tl = timeline[ev.label];
      const last = tl[tl.length - 1];
      // 10ms 内视为同时刻（hard nav + spa:replace 同时触发），保留后者
      if (last && Math.abs(last.ts - ev.ts) < 10) {
        tl[tl.length - 1] = { ts: ev.ts, url: ev.url };
      } else {
        tl.push({ ts: ev.ts, url: ev.url });
      }
    }
    // navEvents 已按录制顺序写入，无需再排序

    let fixedCount = 0;
    for (const req of reqEvents) {
      const tl = timeline[req.label];
      if (!tl || tl.length === 0) continue;

      // 找最后一条 nav.ts <= req.ts
      let correctUrl = tl[0].url; // fallback：第一条
      for (const nav of tl) {
        if (nav.ts <= req.ts) correctUrl = nav.url;
        else break;
      }

      if (correctUrl !== req.frameUrl) {
        req.frameUrl = correctUrl;
        fixedCount++;
      }
    }
    return fixedCount;
  }

  const fixedCount = remapUrls();
  if (fixedCount > 0) {
    console.log(`[custom-recorder] URL 归属修正: ${fixedCount} 条 REQ 已更新`);
  }

  // ── 序列化输出日志 ────────────────────────────────────────────────────────
  const navLines = navEvents.map(ev => {
    const ts = new Date(ev.ts).toISOString();
    return `[NAV:${ev.type}] ${ts} [${ev.label}] -> ${ev.url}`;
  });

  const reqLines = reqEvents.map(req => {
    const offsetS = (req.offsetMs / 1000).toFixed(1);
    const slowMark = req.slow ? ' ⚠️[SLOW]' : '';
    return `[REQ] +${offsetS}s ${req.method} ${req.pathname} (${req.duration}ms)${slowMark} @ ${req.frameUrl} [${req.label}]`;
  });

  const logContent = [
    '# 录制会话增强日志',
    `# 录制起始: ${recordStart}`,
    `# 录制结束: ${recordEnd}`,
    `# HAR 文件: ${harPath}`,
    '',
    '# ── 页面导航序列（full=硬导航，spa:hash/push/replace/pop=SPA 路由）──',
    ...navLines,
    '',
    '# ── API 请求时序（带归属页面 URL，已修正导航竞态）─────────────────',
    ...reqLines
  ].join('\n');

  fs.writeFileSync(logPath, logContent, 'utf-8');
  console.log(`\n[custom-recorder] 录制结束，日志已写入: ${logPath}`);
  console.log(`  页面导航事件: ${navEvents.length} 条`);
  console.log(`  API 请求记录: ${reqEvents.length} 条`);

  await context.close();
  await browser.close();
})();