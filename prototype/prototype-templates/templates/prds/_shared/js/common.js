/* ==============================================================
 * Utils — 跨模块通用小工具
 * 所有方法挂在 window.Utils 下
 * ============================================================== */

(function () {
  const Utils = {};

  Utils.sleep = function (ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  Utils.formatDate = function (date, fmt) {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    const map = {
      'YYYY': d.getFullYear(),
      'MM': pad(d.getMonth() + 1),
      'DD': pad(d.getDate()),
      'HH': pad(d.getHours()),
      'mm': pad(d.getMinutes()),
      'ss': pad(d.getSeconds())
    };
    return (fmt || 'YYYY-MM-DD').replace(/YYYY|MM|DD|HH|mm|ss/g, (k) => map[k]);
  };

  Utils.queryParam = function (key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  };

  Utils.buildQuery = function (obj) {
    const params = new URLSearchParams();
    Object.keys(obj || {}).forEach((k) => {
      if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') {
        params.set(k, obj[k]);
      }
    });
    return params.toString();
  };

  Utils.toast = function (message, type, duration) {
    const t = type || 'info';
    const dur = duration || 3000;
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const el = document.createElement('div');
    el.className = `toast toast--${t}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => { el.remove(); }, dur);
  };

  Utils.confirm = function (message) {
    return window.confirm(message);
  };

  Utils.debounce = function (fn, wait) {
    let timer = null;
    return function () {
      const ctx = this;
      const args = arguments;
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(ctx, args), wait || 300);
    };
  };

  window.Utils = Utils;
})();
