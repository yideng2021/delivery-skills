/* ==============================================================
 * EmployeeService — 员工数据服务层
 * 依赖 mock/employees.js（window.EMPLOYEE_LIST_CURRENT / EMPLOYEE_DETAIL_MOCK）
 * 所有方法返回 Promise，统一异步风格；不调用 fetch（file:// 兼容）
 * ============================================================== */

(function () {
  const EmployeeService = {};

  EmployeeService.list = async function (query) {
    await window.Utils.sleep(150);
    const all = window.EMPLOYEE_LIST_CURRENT || [];
    const q = query || {};
    let items = all.slice();
    if (q.keyword) {
      items = items.filter((e) => e.name.includes(q.keyword) || e.code.includes(q.keyword));
    }
    if (q.department) {
      items = items.filter((e) => e.department.startsWith(q.department));
    }
    if (q.status) {
      items = items.filter((e) => e.status === q.status);
    }
    const page = q.page || 1;
    const pageSize = q.pageSize || 10;
    const total = window.EMPLOYEE_TOTAL_CURRENT || items.length;
    return {
      items: items.slice((page - 1) * pageSize, page * pageSize),
      total: total,
      page: page,
      pageSize: pageSize
    };
  };

  EmployeeService.detail = async function (id) {
    await window.Utils.sleep(120);
    const data = (window.EMPLOYEE_DETAIL_MOCK || {})[id];
    if (!data) {
      return (window.EMPLOYEE_DETAIL_MOCK || {})['E0001'];
    }
    return data;
  };

  window.EmployeeService = EmployeeService;
})();
