/* ==============================================================
 * Header 组件 — JS 字符串模板 + 渲染函数
 * 用法：在页面 <body> 顶部放 <div id="app-header"></div>，
 *       加载本脚本后调用 renderHeader('app-header')
 * 依赖：common.css（样式）
 * ============================================================== */

window.APP_CONFIG = window.APP_CONFIG || {
  appTitle: '员工管理系统',
  username: '管理员'
};

window.HEADER_HTML = `
<header class="header">
  <div class="header__brand">
    <div class="header__logo">LOGO</div>
    <h1 class="header__title">{{APP_TITLE}}</h1>
  </div>
  <div class="header__user-info">
    <svg class="header__icon" viewBox="0 0 24 24" title="消息通知">
      <path fill="currentColor" d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
    </svg>
    <svg class="header__icon" viewBox="0 0 24 24" title="设置">
      <path fill="currentColor" d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
    </svg>
    <div class="header__avatar"></div>
    <span class="header__username">{{USERNAME}}</span>
  </div>
</header>
`;

window.renderHeader = function (mountId) {
  const mount = document.getElementById(mountId);
  if (!mount) return;
  const cfg = window.APP_CONFIG;
  // 使用 outerHTML 替换，让 <header class="header"> 成为 .layout 的直接 grid 子项，
  // 从而 grid-area: header 生效（避免外层未命名 div 破坏 grid 布局）
  mount.outerHTML = window.HEADER_HTML
    .replace('{{APP_TITLE}}', cfg.appTitle)
    .replace('{{USERNAME}}', cfg.username);
};
