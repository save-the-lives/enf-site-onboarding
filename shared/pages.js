/* Shared chrome for companion pages (backlog, journey, questions). */
(function () {
  window.pageShell = function (active, title, note) {
    document.getElementById('top').innerHTML = Core.chrome({ active: active, tabs: [
      { id: 'hub', label: 'Prototype hub', href: '../index.html' }, { id: 'v1', label: '1 Record page', href: '../v1-record-page/index.html' }, { id: 'v2', label: '2 Bulk grid', href: '../v2-bulk-grid/index.html' }, { id: 'v3', label: '3 Guided flow', href: '../v3-guided-flow/index.html' },
      { id: 'st', label: 'Stories', href: '../backlog/index.html' }, { id: 'jr', label: 'Journey', href: '../journey/index.html' }, { id: 'q', label: 'Questions', href: '../questions/index.html' }] });
    Core.footer({ variation: title, hub: '../index.html', note: note });
    Companion.init({ t: active, base: '../' });
  };
  window.qParam = () => new URLSearchParams(location.search).get('q');
  window.backToQuestion = function (host) {
    const q = qParam(); if (!q) return;
    host.insertAdjacentHTML('afterbegin', '<div class="card" style="border-color:#0176d3"><div class="card__body" style="padding:8px 16px">Opened from question <strong>' + q + '</strong>. <a href="' + BL.href({ t: 'question', id: q }, '../') + '">Back to ' + q + ' in the questions index</a></div></div>');
  };
})();
