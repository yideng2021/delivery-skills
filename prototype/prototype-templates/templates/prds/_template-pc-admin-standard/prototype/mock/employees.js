/* ==============================================================
 * 员工 Mock 数据
 * 三态覆盖：正常 / 空态 / 溢出（通过 window.MOCK_STATE 切换）
 * ============================================================== */

window.MOCK_STATE = 'normal'; // normal | empty | overflow

window.EMPLOYEE_LIST_MOCK = {
  normal: [
    { id: 'E0001', name: '张晓明', code: 'EMP-2021-0001', department: '产品研发部', position: '高级前端工程师', level: 'P6', joinDate: '2021-03-15', phone: '138-0000-0001', employmentType: '全职', status: 'on-duty', performance: 'excellent' },
    { id: 'E0002', name: '李思涵', code: 'EMP-2019-0015', department: '产品研发部', position: '前端工程师', level: 'P5', joinDate: '2019-08-22', phone: '138-0000-0002', employmentType: '全职', status: 'on-duty', performance: 'good' },
    { id: 'E0003', name: '王俊杰', code: 'EMP-2018-0042', department: '产品研发部', position: '技术总监', level: 'M3', joinDate: '2018-12-10', phone: '138-0000-0003', employmentType: '全职', status: 'on-duty', performance: 'excellent' },
    { id: 'E0004', name: '陈静怡', code: 'EMP-2021-0108', department: '市场运营部', position: '市场经理', level: 'P6', joinDate: '2021-05-18', phone: '138-0000-0004', employmentType: '全职', status: 'probation', performance: 'pending' },
    { id: 'E0005', name: '刘伟', code: 'EMP-2020-0067', department: '人力资源部', position: 'HRBP', level: 'P5', joinDate: '2020-11-03', phone: '138-0000-0005', employmentType: '全职', status: 'on-duty', performance: 'good' },
    { id: 'E0006', name: '赵雅琴', code: 'EMP-2019-0055', department: '财务部', position: '财务主管', level: 'P6', joinDate: '2019-07-25', phone: '138-0000-0006', employmentType: '全职', status: 'on-duty', performance: 'good' },
    { id: 'E0007', name: '孙浩然', code: 'EMP-2022-0023', department: '产品研发部', position: '后端工程师', level: 'P4', joinDate: '2022-06-01', phone: '138-0000-0007', employmentType: '全职', status: 'on-duty', performance: 'needs-improve' },
    { id: 'E0008', name: '周梦琪', code: 'EMP-2020-0091', department: '市场运营部', position: '运营专员', level: 'P4', joinDate: '2020-09-14', phone: '138-0000-0008', employmentType: '全职', status: 'leave', performance: 'good' }
  ],
  empty: [],
  overflow: new Array(50).fill(0).map((_, i) => ({
    id: `E${String(i + 1).padStart(4, '0')}`,
    name: `员工${i + 1}`,
    code: `EMP-2020-${String(i + 1).padStart(4, '0')}`,
    department: ['产品研发部', '市场运营部', '人力资源部', '财务部'][i % 4],
    position: '工程师',
    level: 'P5',
    joinDate: '2020-01-01',
    phone: `138-0000-${String(i + 1).padStart(4, '0')}`,
    employmentType: '全职',
    status: 'on-duty',
    performance: 'good'
  }))
};

window.EMPLOYEE_TOTAL_MOCK = {
  normal: 156,
  empty: 0,
  overflow: 2340
};

window.EMPLOYEE_DETAIL_MOCK = {
  'E0001': {
    id: 'E0001',
    name: '张晓明',
    code: 'EMP-2021-0001',
    gender: '男',
    birthDate: '1993-06-12',
    idType: '身份证',
    idNumber: '110105199306120011',
    department: '产品研发部 / 前端组',
    position: '高级前端工程师',
    level: 'P6',
    directReport: '王俊杰',
    joinDate: '2021-03-15',
    contractEnd: '2027-03-14',
    employmentType: '全职',
    employmentStatus: '在职',
    phone: '138-0000-0001',
    email: 'zhangxiaoming@example.com',
    emergencyContact: '张父 / 139-1111-0001',
    address: '北京市朝阳区建国路 18 号',
    education: '本科 · 北京航空航天大学 · 计算机科学与技术',
    graduateYear: '2015',
    skills: 'JavaScript / TypeScript / React / Vue / Webpack / 可视化图表',
    certificates: '信息系统项目管理师（软考中级）',
    bio: '2021 年 3 月加入公司，主导重构了前端公共组件库；近两年累计主导 5 个跨部门项目上线；团队内部持续承担 mentor 角色，带出 2 名 P4 晋升 P5 的下属。',
    // 绩效评估（高 / 中 / 低 三级灯，对应 供应商画像 的风险卡）
    assessment: {
      workOutput: { level: 'green', text: '近四个季度 KPI 全部达成' },
      teamCollaboration: { level: 'green', text: '360° 反馈综合 4.6/5' },
      skillGrowth: { level: 'yellow', text: '待补充 2 项年度认证' },
      complianceTraining: { level: 'red', text: '信息安全培训逾期未完成' }
    },
    badges: { judicial: 0, incidents: 2 },
    judicialCount: 0,
    incidentCount: 2
  }
};

/* 当前筛选后的员工列表（供 service 层模拟接口返回） */
Object.defineProperty(window, 'EMPLOYEE_LIST_CURRENT', {
  get() { return window.EMPLOYEE_LIST_MOCK[window.MOCK_STATE] || []; }
});
Object.defineProperty(window, 'EMPLOYEE_TOTAL_CURRENT', {
  get() { return window.EMPLOYEE_TOTAL_MOCK[window.MOCK_STATE] || 0; }
});
