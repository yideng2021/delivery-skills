/* 岗位配置页逻辑 */

(function () {
  const SKILL_OPTIONS = [
    'JavaScript', 'TypeScript', 'React', 'Vue', 'Node.js', 'Webpack',
    'Vite', '性能优化', '组件库开发', 'CI/CD', '跨端开发', 'WebGL'
  ];
  const DEFAULT_SELECTED_SKILLS = ['TypeScript', 'React', 'Node.js', '性能优化', '组件库开发'];

  const DEFAULT_KPIS = [
    { name: '需求交付质量', weight: 30, method: '月度评审', target: '版本缺陷率 ≤ 1%，按期交付率 ≥ 95%' },
    { name: '核心项目产出', weight: 25, method: '季度评审', target: '主导 ≥ 1 个核心项目，按期完成并通过验收' },
    { name: '团队协作', weight: 15, method: 'KPI + 360', target: '代码评审参与率 100%，被评"协作良好"' },
    { name: '技能成长', weight: 15, method: '年度评审', target: '完成年度技术认证，输出 ≥ 2 篇内部分享' },
    { name: '合规与安全', weight: 15, method: '触发式评审', target: '无生产事故，合规培训通过率 100%' }
  ];

  const KPI_METHOD_OPTIONS = ['月度评审', '季度评审', '半年度评审', '年度评审', 'KPI + 360', '触发式评审'];

  function renderSkillTags() {
    const container = document.getElementById('skill-tags');
    container.innerHTML = SKILL_OPTIONS.map((skill) => {
      const selected = DEFAULT_SELECTED_SKILLS.includes(skill) ? 'skill-tag--selected' : '';
      return `<span class="skill-tag ${selected}" data-skill="${skill}">${skill}</span>`;
    }).join('');
    container.querySelectorAll('.skill-tag').forEach((tag) => {
      tag.addEventListener('click', function () {
        this.classList.toggle('skill-tag--selected');
      });
    });
  }

  function renderKpiRows(rows) {
    const tbody = document.getElementById('kpi-tbody');
    tbody.innerHTML = rows.map((r, idx) => `
      <tr data-row="${idx}">
        <td><input class="kpi-input" data-field="name" value="${r.name}"></td>
        <td><input class="kpi-input" data-field="weight" type="number" min="0" max="100" value="${r.weight}"></td>
        <td>
          <select class="kpi-input" data-field="method">
            ${KPI_METHOD_OPTIONS.map((m) => `<option ${m === r.method ? 'selected' : ''}>${m}</option>`).join('')}
          </select>
        </td>
        <td><input class="kpi-input" data-field="target" value="${r.target}"></td>
        <td><button class="row-action" data-act="remove">删除</button></td>
      </tr>
    `).join('');
    bindKpiEvents();
    updateKpiTotal();
  }

  function bindKpiEvents() {
    const tbody = document.getElementById('kpi-tbody');
    tbody.querySelectorAll('[data-field="weight"]').forEach((input) => {
      input.addEventListener('input', updateKpiTotal);
    });
    tbody.querySelectorAll('[data-act="remove"]').forEach((btn) => {
      btn.addEventListener('click', function () {
        this.closest('tr').remove();
        updateKpiTotal();
      });
    });
  }

  function updateKpiTotal() {
    const inputs = document.querySelectorAll('#kpi-tbody [data-field="weight"]');
    let total = 0;
    inputs.forEach((i) => { total += parseInt(i.value, 10) || 0; });
    const el = document.getElementById('kpi-total');
    el.textContent = `${total}%`;
    el.classList.remove('kpi-summary__value--ok', 'kpi-summary__value--error');
    el.classList.add(total === 100 ? 'kpi-summary__value--ok' : 'kpi-summary__value--error');
  }

  function addKpiRow() {
    const tbody = document.getElementById('kpi-tbody');
    const idx = tbody.querySelectorAll('tr').length;
    const tr = document.createElement('tr');
    tr.dataset.row = String(idx);
    tr.innerHTML = `
      <td><input class="kpi-input" data-field="name" placeholder="请输入指标名称"></td>
      <td><input class="kpi-input" data-field="weight" type="number" min="0" max="100" value="0"></td>
      <td>
        <select class="kpi-input" data-field="method">
          ${KPI_METHOD_OPTIONS.map((m) => `<option>${m}</option>`).join('')}
        </select>
      </td>
      <td><input class="kpi-input" data-field="target" placeholder="请输入目标值说明"></td>
      <td><button class="row-action" data-act="remove">删除</button></td>
    `;
    tbody.appendChild(tr);
    bindKpiEvents();
  }

  function bindActions() {
    document.getElementById('btn-add-kpi').addEventListener('click', addKpiRow);

    const cancelHandler = function () {
      if (confirm('确定取消本次修改？未保存内容将丢失')) {
        window.location.href = 'list.html';
      }
    };
    const saveHandler = function () {
      const total = parseInt(document.getElementById('kpi-total').textContent, 10);
      if (total !== 100) {
        window.Utils.toast(`绩效指标权重合计应为 100%（当前 ${total}%）`, 'warning');
        return;
      }
      window.Utils.toast('岗位配置已保存', 'success');
    };

    document.getElementById('btn-cancel').addEventListener('click', cancelHandler);
    document.getElementById('btn-cancel-2').addEventListener('click', cancelHandler);
    document.getElementById('btn-save').addEventListener('click', saveHandler);
    document.getElementById('btn-save-2').addEventListener('click', saveHandler);
  }

  document.addEventListener('DOMContentLoaded', function () {
    window.renderHeader('app-header');
    window.renderSidebar('app-sidebar', { activeId: 'position-config' });
    renderSkillTags();
    renderKpiRows(DEFAULT_KPIS);
    bindActions();
  });
})();
