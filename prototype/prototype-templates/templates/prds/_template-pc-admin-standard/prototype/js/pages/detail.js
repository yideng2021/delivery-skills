/* 员工详情页逻辑 */

(function () {
  function fillBasicInfo(data) {
    document.getElementById('page-title').textContent = `${data.name} - 员工画像`;
    const map = {
      'v-name': data.name,
      'v-code': data.code,
      'v-gender': data.gender,
      'v-birth': data.birthDate,
      'v-id-type': data.idType,
      'v-id-number': data.idNumber,
      'v-department': data.department,
      'v-position': data.position,
      'v-level': data.level,
      'v-direct-report': data.directReport,
      'v-join-date': data.joinDate,
      'v-contract-end': data.contractEnd,
      'v-employment-type': data.employmentType,
      'v-employment-status': data.employmentStatus,
      'v-phone': data.phone,
      'v-email': data.email,
      'v-emergency': data.emergencyContact,
      'v-address': data.address,
      'v-bio': data.bio
    };
    Object.keys(map).forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = map[id];
    });
    document.getElementById('badge-judicial').textContent = data.judicialCount;
    document.getElementById('badge-incident').textContent = data.incidentCount;
  }

  function fillAssessment(assessment) {
    const mapping = {
      'ac-work-output': assessment.workOutput,
      'ac-team-collab': assessment.teamCollaboration,
      'ac-skill-growth': assessment.skillGrowth,
      'ac-compliance': assessment.complianceTraining
    };
    Object.keys(mapping).forEach((id) => {
      const card = document.getElementById(id);
      if (!card) return;
      const v = mapping[id];
      card.querySelector('.assessment-card__light').className =
        `assessment-card__light assessment-card__light--${v.level}`;
      const text = card.querySelector('.assessment-card__text');
      text.className = `assessment-card__text assessment-card__text--${v.level}`;
      text.textContent = v.text;
    });
  }

  function bindTabs() {
    document.querySelectorAll('.tab-button').forEach((btn) => {
      btn.addEventListener('click', function () {
        const target = this.dataset.tab;
        document.querySelectorAll('.tab-button').forEach((b) => b.classList.remove('tab-button--active'));
        document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('tab-content--active'));
        this.classList.add('tab-button--active');
        document.getElementById(target).classList.add('tab-content--active');
      });
    });

    document.querySelectorAll('.sub-tab-button').forEach((btn) => {
      btn.addEventListener('click', function () {
        const target = this.dataset.subTab;
        const scope = this.closest('.tab-content');
        scope.querySelectorAll('.sub-tab-button').forEach((b) => b.classList.remove('sub-tab-button--active'));
        scope.querySelectorAll('.sub-tab-content').forEach((c) => c.classList.remove('sub-tab-content--active'));
        this.classList.add('sub-tab-button--active');
        scope.querySelector('#' + target).classList.add('sub-tab-content--active');
      });
    });
  }

  function bindAssessmentNav() {
    document.querySelectorAll('.assessment-card').forEach((card) => {
      card.addEventListener('click', function () {
        const name = this.querySelector('.assessment-card__title').textContent;
        window.Utils.toast(`打开评估详情：${name}`, 'info');
      });
    });
  }

  function bindActions() {
    document.getElementById('btn-back').addEventListener('click', function () {
      window.location.href = 'list.html';
    });
    document.getElementById('btn-edit').addEventListener('click', function () {
      window.Utils.toast('编辑员工信息（演示）', 'info');
    });
  }

  document.addEventListener('DOMContentLoaded', async function () {
    window.renderHeader('app-header');
    window.renderSidebar('app-sidebar', { activeId: 'employee-list' });
    bindTabs();
    bindActions();

    const id = window.Utils.queryParam('id') || 'E0001';
    const data = await window.EmployeeService.detail(id);
    fillBasicInfo(data);
    fillAssessment(data.assessment);
    bindAssessmentNav();
  });
})();
