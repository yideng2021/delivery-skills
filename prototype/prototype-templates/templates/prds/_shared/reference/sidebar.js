/* ==============================================================
 * Sidebar 组件 — 基于 GLOBAL_MENU 渲染左侧菜单
 * 用法：在页面 <body> 放 <aside id="app-sidebar"></aside>，
 *       加载 menu-data.js + 本脚本后调用
 *       renderSidebar('app-sidebar', { activeId: 'employee-list' })
 * 依赖：menu-data.js (window.GLOBAL_MENU), common.css
 * ============================================================== */

(function () {
  function buildIcon(svgPath) {
    if (!svgPath) return '';
    return `<svg class="sidebar__menu-icon" viewBox="0 0 24 24"><path d="${svgPath}"/></svg>`;
  }

  function buildArrow() {
    return `<svg class="sidebar__menu-arrow" viewBox="0 0 24 24"><path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/></svg>`;
  }

  function isActive(item, activeId) {
    if (item.id === activeId) return true;
    if (!item.children) return false;
    return item.children.some((c) => isActive(c, activeId));
  }

  function renderItem(item, activeId) {
    const active = item.id === activeId;
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
    const expanded = hasChildren && isActive(item, activeId);
    const linkClass = ['sidebar__menu-link', active ? 'sidebar__menu-link--active' : '']
      .filter(Boolean).join(' ');
    const itemClass = ['sidebar__menu-item', hasChildren && expanded ? 'sidebar__submenu-item--expanded' : '']
      .filter(Boolean).join(' ');

    if (hasChildren) {
      const subList = item.children.map((child) => renderItem(child, activeId)).join('');
      return `
        <li class="${itemClass}">
          <a class="${linkClass}" data-menu-id="${item.id}">
            ${buildIcon(item.icon)}
            <span>${item.label}</span>
            ${buildArrow()}
          </a>
          <ul class="sidebar__submenu">${subList}</ul>
        </li>
      `;
    }
    return `
      <li class="${itemClass}">
        <a class="${linkClass}" href="${item.href || '#'}" data-menu-id="${item.id}">
          ${buildIcon(item.icon)}
          <span>${item.label}</span>
        </a>
      </li>
    `;
  }

  function buildSidebarHtml(activeId) {
    const items = window.GLOBAL_MENU.map((item) => renderItem(item, activeId)).join('');
    return `
      <aside class="sidebar" id="sidebar-el">
        <div class="sidebar__toggle">
          <button class="sidebar__toggle-btn" id="sidebar-toggle-btn">≡</button>
        </div>
        <nav>
          <ul class="sidebar__menu">${items}</ul>
        </nav>
      </aside>
    `;
  }

  window.renderSidebar = function (mountId, options) {
    const opts = options || {};
    const mount = document.getElementById(mountId);
    if (!mount) return;
    mount.outerHTML = buildSidebarHtml(opts.activeId || '');

    // 绑定折叠/展开
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        document.getElementById('sidebar-el').classList.toggle('sidebar--collapsed');
      });
    }

    // 绑定子菜单展开
    document.querySelectorAll('.sidebar__menu-item').forEach((li) => {
      const link = li.querySelector(':scope > .sidebar__menu-link');
      const hasSubmenu = li.querySelector(':scope > .sidebar__submenu');
      if (hasSubmenu && link) {
        link.addEventListener('click', function (e) {
          if (!link.getAttribute('href') || link.getAttribute('href') === '#') {
            e.preventDefault();
          }
          li.classList.toggle('sidebar__submenu-item--expanded');
        });
      }
    });
  };
})();
