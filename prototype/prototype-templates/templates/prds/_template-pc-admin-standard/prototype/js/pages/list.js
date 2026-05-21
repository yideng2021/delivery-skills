/* 员工列表页逻辑 */

(function () {
  let currentPage = 1;
  const pageSize = 10;

  const statusMap = {
    'on-duty': { label: '在职', klass: 'status-badge--success' },
    'probation': { label: '试用期', klass: 'status-badge--info' },
    'leave': { label: '休假中', klass: 'status-badge--warning' },
    'offboarding': { label: '离职中', klass: 'status-badge--danger' }
  };

  const performanceMap = {
    'excellent': { label: '优秀', klass: 'status-badge--success' },
    'good': { label: '良好', klass: 'status-badge--info' },
    'needs-improve': { label: '待改进', klass: 'status-badge--warning' },
    'pending': { label: '未评定', klass: 'status-badge--info' }
  };

  function renderRows(items) {
    const tbody = document.getElementById('employee-tbody');
    if (!items || items.length === 0) {
      tbody.innerHTML = `<tr class="empty-row"><td colspan="8">暂无员工记录，点击右上角"新增员工"开始</td></tr>`;
      return;
    }
    tbody.innerHTML = items.map((e) => {
      const statusInfo = statusMap[e.status] || { label: e.status, klass: 'status-badge--info' };
      const perfInfo = performanceMap[e.performance] || { label: '-', klass: 'status-badge--info' };
      return `
        <tr>
          <td>${e.code}</td>
          <td><strong>${e.name}</strong></td>
          <td>${e.department}</td>
          <td>${e.position}</td>
          <td>${e.level}</td>
          <td>${e.joinDate}</td>
          <td>
            <span class="status-badge ${statusInfo.klass}">${statusInfo.label}</span>
            <span class="status-badge ${perfInfo.klass}">${perfInfo.label}</span>
          </td>
          <td class="action-column">
            <button class="btn--text" data-act="view" data-id="${e.id}">查看详情</button>
            <button class="btn--text" data-act="edit" data-id="${e.id}">编辑</button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('[data-act="view"]').forEach((btn) => {
      btn.addEventListener('click', function () {
        window.location.href = `detail.html?id=${this.dataset.id}`;
      });
    });
    tbody.querySelectorAll('[data-act="edit"]').forEach((btn) => {
      btn.addEventListener('click', function () {
        window.Utils.toast('编辑功能演示', 'info');
      });
    });
  }

  function renderPagination(total, page) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const info = document.getElementById('pagination-info');
    const controls = document.getElementById('pagination-controls');
    info.textContent = `共 ${total} 条记录，当前第 ${page}/${totalPages} 页`;

    const parts = [];
    parts.push(`<button class="pagination-btn" data-page="prev" ${page === 1 ? 'disabled' : ''}>‹</button>`);
    const showPages = [];
    for (let i = 1; i <= Math.min(5, totalPages); i++) showPages.push(i);
    if (totalPages > 5) { showPages.push('...'); showPages.push(totalPages); }
    showPages.forEach((p) => {
      if (p === '...') {
        parts.push('<span>...</span>');
      } else {
        const active = p === page ? 'pagination-btn--active' : '';
        parts.push(`<button class="pagination-btn ${active}" data-page="${p}">${p}</button>`);
      }
    });
    parts.push(`<button class="pagination-btn" data-page="next" ${page === totalPages ? 'disabled' : ''}>›</button>`);
    controls.innerHTML = parts.join('');

    controls.querySelectorAll('.pagination-btn[data-page]').forEach((btn) => {
      btn.addEventListener('click', function () {
        if (this.disabled) return;
        const v = this.dataset.page;
        if (v === 'prev') currentPage--;
        else if (v === 'next') currentPage++;
        else currentPage = parseInt(v, 10);
        loadData();
      });
    });
  }

  async function loadData() {
    const query = {
      keyword: document.getElementById('q-keyword').value.trim(),
      department: document.getElementById('q-department').value,
      status: document.getElementById('q-status').value,
      page: currentPage,
      pageSize: pageSize
    };
    const result = await window.EmployeeService.list(query);
    renderRows(result.items);
    renderPagination(result.total, result.page);
  }

  // 格式化日期 YYYY-MM-DD
  function fmtDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // 设置日期范围
  function setDateRange(type) {
    const input = document.getElementById('q-date-range');
    if (!input) return;
    const today = new Date();
    let start;
    if (type === '7') {
      start = new Date(today); start.setDate(today.getDate() - 6);
    } else if (type === '30') {
      start = new Date(today); start.setDate(today.getDate() - 29);
    } else if (type === 'month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
    }
    input.value = `${fmtDate(start)} 至 ${fmtDate(today)}`;
  }

  // 绑定 × 清除图标（显隐 + 点击清空）
  function bindInputClear() {
    document.querySelectorAll('.input-wrapper').forEach((wrap) => {
      const input = wrap.querySelector('.form-input');
      const clearBtn = wrap.querySelector('.input-clear');
      if (!input || !clearBtn) return;
      const toggle = () => wrap.classList.toggle('has-value', !!input.value);
      toggle();
      input.addEventListener('input', toggle);
      clearBtn.addEventListener('click', function () {
        input.value = '';
        toggle();
        input.focus();
      });
    });
  }

  function resetFilters() {
    document.querySelectorAll('.filter-section input, .filter-section select').forEach((el) => {
      el.value = '';
    });
    document.querySelectorAll('.input-wrapper').forEach((w) => w.classList.remove('has-value'));
  }

  function bindEvents() {
    document.getElementById('btn-query').addEventListener('click', function () {
      currentPage = 1;
      loadData();
    });
    document.getElementById('btn-reset').addEventListener('click', function () {
      resetFilters();
      currentPage = 1;
      loadData();
    });

    // 回车触发查询（规范：查询按钮支持回车）
    document.querySelector('.filter-section').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        currentPage = 1;
        loadData();
      }
    });

    // × 清除图标
    bindInputClear();

    // 日期范围快捷项
    document.querySelectorAll('.date-shortcuts a').forEach((a) => {
      a.addEventListener('click', function () {
        setDateRange(this.dataset.range);
      });
    });

    // 展开/收起查询区
    const expandBtn = document.getElementById('btn-expand-filter');
    const filterExpand = document.getElementById('filter-expand');
    const filterSection = document.querySelector('.filter-section');
    if (expandBtn && filterExpand) {
      expandBtn.addEventListener('click', function () {
        const isVisible = filterExpand.style.display !== 'none';
        filterExpand.style.display = isVisible ? 'none' : 'block';
        filterSection.classList.toggle('expanded');
        expandBtn.querySelector('.expand-text').textContent = isVisible ? '展开' : '收起';
      });
    }

    document.getElementById('btn-create').addEventListener('click', function () {
      window.location.href = 'form.html';
    });
    document.getElementById('btn-import').addEventListener('click', function () {
      window.Utils.toast('批量导入功能演示', 'info');
    });
    document.getElementById('btn-export').addEventListener('click', function () {
      window.Utils.toast('已开始导出员工清单', 'success');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    window.renderHeader('app-header');
    window.renderSidebar('app-sidebar', { activeId: 'employee-list' });
    bindEvents();
    loadData();
  });
})();
