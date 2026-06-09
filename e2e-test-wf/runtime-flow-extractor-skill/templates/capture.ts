// capture.ts — 动作↔接口归因捕获器（runtime-flow-extractor 技术核心）
//
// 原理：回放时挂一个全局 response 监听器，配合"当前步骤标签"做零歧义归因——
// 每个 UI 动作前调用 cap.step('语义')，其后到下一个 step 之前触发的所有业务接口
// 都落进该步的桶里。比事后解 trace.zip 二进制更稳。
//
// 用法见同目录 runner.spec.ts；落盘的 events.json 是图文同源的唯一事实来源。

import type { Page, Request, Response } from '@playwright/test';
import { writeFileSync } from 'node:fs';

export type ApiCall = {
  step: number;            // 归属的步骤序号
  stepLabel: string;       // 归属步骤语义
  pageUrl: string;         // 触发时所在页面
  method: string;
  url: string;
  path: string;
  query: Record<string, string>;
  status: number;
  reqBody: unknown;        // 已脱敏
  respBody: unknown;       // 已脱敏
  contentType: string;
};

/** 页面身份指纹：用于把"界面"快速、准确关联到前端工程代码 + 异常可追溯 */
export type PageInfo = {
  url: string;       // 完整 URL
  route: string;     // SPA hash 路由（#/x/y）或 pathname → grep router 配置定位组件
  title: string;     // document.title → grep 源码字面量
  heading: string;   // 首个 h1/h2/[role=heading] 文本 → grep 源码字面量
};

export type FlowStep = {
  index: number;
  label: string;           // 业务语义（"点击登录"）
  action: string;          // 真实 locator 表达式（如 `button "提交"`）→ grep 源码桥接元素
  page: PageInfo;          // 本步操作所在页面的身份指纹
};

export type CaptureOptions = {
  apiPattern?: RegExp;        // 只收业务接口，默认 /\/api\//
  redactFields?: string[];    // 需脱敏的字段名（大小写不敏感）
  ignoreMethods?: string[];   // 忽略的方法，默认 ['OPTIONS']
};

const DEFAULTS: Required<CaptureOptions> = {
  apiPattern: /\/api\//,
  redactFields: [
    'password', 'passwd', 'token', 'accesstoken', 'refreshtoken',
    'authorization', 'cookie', 'idcard', 'phone', 'mobile', 'email',
  ],
  ignoreMethods: ['OPTIONS'],
};

export class Capture {
  private steps: FlowStep[] = [];
  private calls: ApiCall[] = [];
  private popups: { openedAt: string; url: string }[] = [];
  private currentIndex = -1;
  private currentLabel = 'init';
  private pending: Promise<void>[] = [];
  private readonly opts: Required<CaptureOptions>;

  constructor(private readonly page: Page, opts: CaptureOptions = {}) {
    this.opts = { ...DEFAULTS, ...opts };
    // ★ 在 BrowserContext 级监听：门户→子系统常开新窗口(popup)，
    //   挂在单个 page 上会漏掉新窗口的接口。context 级覆盖全部页面。
    const context = page.context();
    context.on('response', (resp) => {
      // 立即入队，避免在监听器里 await 阻塞事件循环
      this.pending.push(this.record(resp).catch(() => undefined));
    });
    // 记录每个新开窗口，便于多窗口流程追溯
    context.on('page', (p) => {
      this.popups.push({ openedAt: new Date().toISOString(), url: p.url() });
    });
  }

  /**
   * 在每个 UI 动作前调用，声明本步语义并抓取页面身份指纹。
   * @param label   业务语义（"点击登录"）
   * @param action  真实 locator 表达式（"button \"提交\""）—— 桥接前端源码，强烈建议填
   * @param active  当前活动页；popup 打开后传入该 popup，使指纹取自正确窗口（默认主 page）
   * 注意：本方法异步，runner 中务必 `await cap.step(...)`，否则指纹抓取会与下个动作竞争。
   */
  async step(label: string, action = '', active: Page = this.page): Promise<void> {
    // 先同步置位，确保 evaluate 期间到达的响应归属到本步
    this.currentIndex += 1;
    this.currentLabel = label;
    const page = await this.snapshotPageInfo(active);
    this.steps.push({ index: this.currentIndex, label, action, page });
  }

  /** 抓取指定页面身份指纹（best-effort，导航中失败也不抛） */
  private async snapshotPageInfo(target: Page): Promise<PageInfo> {
    const url = target.url();
    let route = url;
    try {
      const u = new URL(url);
      route = u.hash || u.pathname; // SPA 优先 hash 路由
    } catch {
      /* 非法 URL，退回原值 */
    }
    let title = '';
    let heading = '';
    try {
      const info = await target.evaluate(() => ({
        title: document.title,
        heading: (
          document.querySelector('h1, h2, [role=heading]')?.textContent ?? ''
        ).trim().slice(0, 80),
      }));
      title = info.title;
      heading = info.heading;
    } catch {
      /* 页面导航中 / 不可 evaluate，保留空值 */
    }
    return { url, route, title, heading };
  }

  private async record(resp: Response): Promise<void> {
    const req: Request = resp.request();
    const url = req.url();
    if (!this.opts.apiPattern.test(url)) return;
    if (this.opts.ignoreMethods.includes(req.method())) return;

    const u = new URL(url);
    // 用响应所属页面的 URL（可能是 popup），而非主 page
    let ownerUrl = '';
    try {
      ownerUrl = resp.frame().page().url();
    } catch {
      ownerUrl = this.page.url();
    }
    this.calls.push({
      step: this.currentIndex,
      stepLabel: this.currentLabel,
      pageUrl: ownerUrl,
      method: req.method(),
      url,
      path: u.pathname,
      query: Object.fromEntries(u.searchParams),
      status: resp.status(),
      reqBody: this.redact(this.parse(req.postData())),
      respBody: this.redact(await this.safeBody(resp)),
      contentType: resp.headers()['content-type'] ?? '',
    });
  }

  private parse(raw: string | null): unknown {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return raw.length > 300 ? `${raw.slice(0, 300)}…` : raw;
    }
  }

  private async safeBody(resp: Response): Promise<unknown> {
    const ct = resp.headers()['content-type'] ?? '';
    if (!ct.includes('json')) return `<${ct || 'non-json'}>`;
    try {
      return await resp.json();
    } catch {
      return null; // 流式/已消费/非法 JSON 等，HAR 里仍有原始备份
    }
  }

  /** 递归脱敏：命中字段名直接替换，绝不外泄到产物 */
  private redact(value: unknown): unknown {
    const fields = this.opts.redactFields.map((f) => f.toLowerCase());
    const walk = (x: unknown): unknown => {
      if (Array.isArray(x)) return x.map(walk);
      if (x && typeof x === 'object') {
        return Object.fromEntries(
          Object.entries(x as Record<string, unknown>).map(([k, v]) =>
            fields.includes(k.toLowerCase()) ? [k, '***REDACTED***'] : [k, walk(v)],
          ),
        );
      }
      return x;
    };
    return walk(value);
  }

  /** 测试结尾调用：等待在途响应落定后写出 events.json */
  async dump(path: string): Promise<void> {
    await this.page.waitForTimeout(500); // 给末尾请求留收尾窗口
    await Promise.all(this.pending);
    const events = {
      capturedAt: new Date().toISOString(),
      steps: this.steps,
      calls: this.calls,
      popups: this.popups,
    };
    writeFileSync(path, JSON.stringify(events, null, 2), 'utf-8');
  }
}
