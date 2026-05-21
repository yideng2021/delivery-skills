/* ==============================================================
 * API Routes — 全局接口常量（单一数据源）
 * 新模块追加自己的常量到此文件；不要在模块内硬编码路径
 * ============================================================== */

window.API_ROUTES = {
  // 员工管理
  EMPLOYEE_LIST: '/api/employees',
  EMPLOYEE_DETAIL: '/api/employees/:id',
  EMPLOYEE_CREATE: '/api/employees',
  EMPLOYEE_UPDATE: '/api/employees/:id',
  EMPLOYEE_DELETE: '/api/employees/:id',
  EMPLOYEE_EXPORT: '/api/employees/export',

  // 岗位配置
  POSITION_LIST: '/api/positions',
  POSITION_DETAIL: '/api/positions/:id',
  POSITION_SAVE: '/api/positions',
  POSITION_SKILL_CATALOG: '/api/positions/skills/catalog'
};

window.buildApiUrl = function (template, params) {
  let url = template;
  Object.keys(params || {}).forEach((k) => {
    url = url.replace(`:${k}`, encodeURIComponent(params[k]));
  });
  return url;
};
