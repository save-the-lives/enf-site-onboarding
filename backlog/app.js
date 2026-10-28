(function () {
  const BL = window.BL, C = window.Core, esc = C.esc, D = window.D141;
  pageShell('st', 'User stories', 'Living backlog of user stories with Given/When/Then acceptance criteria. Each story deep-links to the screen, field or state it governs.');
  document.getElementById('oi').innerHTML = C.icon('doc', '', 18);
  const F = { epic: '', role: '', prog: '', stage: '', status: '', prio: '', text: '' };
  const opts = (arr, cur, all) => '<option value="">' + all + '</option>' + arr.map((a) => '<option value="' + esc(a[0]) + '"' + (cur === a[0] ? ' selected' : '') + '>' + esc(a[1]) + '</option>').join('');
  function filters() {
    document.getElementById('filters').innerHTML =
      '<div><label>Search</label><input id="f_text" value="' + esc(F.text) + '" placeholder="Words or ID"></div>' +
      '<div><label>Epic</label><select id="f_epic">' + opts(Object.keys(BL.EPICS).map((k) => [k, k + ' ' + BL.EPICS[k]]), F.epic, 'All epics') + '</select></div>' +
      '<div><label>Role</label><select id="f_role">' + opts(BL.ROLES.map((r) => [r, r]), F.role, 'All roles') + '</select></div>' +
      '<div><label>Program</label><select id="f_prog">' + opts(D.ALL.map((r) => [r, r]), F.prog, 'All programs') + '</select></div>' +
      '<div><label>Stage</label><select id="f_stage">' + opts(Object.keys(BL.STAGE_NAME).map((k) => [k, BL.STAGE_NAME[k]]), F.stage, 'All stages') + '</select></div>' +
      '<div><label>Priority</label><select id="f_prio">' + opts(['Must', 'Should', 'Could'].map((r) => [r, r]), F.prio, 'All') + '</select></div>' +
      '<div><label>Status</label><select id="f_status">' + opts(['Draft', 'To confirm', 'Agreed'].map((r) => [r, r]), F.status, 'All') + '</select></div><span id="cnt" class="sel-note" style="margin-left:auto"></span>';
  }
  function card(s) {
    const open = location.hash.replace('#', '') === s.id;
    const journeySteps = BL.JOURNEY.filter((j) => j.rec === s.stage && j.kind === 'main');
    const chips = s.screens.map((r) => Companion.chip(BL.label(r), BL.href(r, '../'))).concat(journeySteps.map((j) => Companion.chip('Journey: ' + j.name, BL.href({ t: 'journey', step: j.id }, '../')))).join('');
    return '<div class="card story' + (open ? ' is-open is-target' : '') + '" id="' + s.id + '"><button class="story__h" data-t="' + s.id + '"><span class="story__id">' + s.id + '</span><span class="story__t"><strong>As a ' + esc(s.role) + ', I want to ' + esc(s.want) + ', so that ' + esc(s.benefit) + '.</strong></span><span class="badge ' + (s.status === 'Agreed' ? 'badge--owner' : 'badge--proposal') + '">' + s.status + '</span><span class="badge">' + s.prio + '</span>' + C.icon('chevrondown', '', 14) + '</button>' +
      '<div class="story__b"><div class="meta"><span class="badge">' + s.epic + ' ' + esc(BL.EPICS[s.epic]) + '</span><span class="badge">' + s.progs.join(', ') + '</span><span class="badge">Stage: ' + esc(BL.STAGE_NAME[s.stage]) + '</span>' + (s.owner ? '<span class="badge badge--owner">Owner-stated</span>' : '<span class="badge badge--proposal">Proposal</span>') + '</div>' +
      '<strong>Acceptance criteria</strong>' + s.ac.map((a, i) => '<div class="ac"><b>AC' + (i + 1) + '</b> <b>Given</b> ' + esc(a[0]) + ', <b>when</b> ' + esc(a[1]) + ', <b>then</b> ' + esc(a[2]) + '.</div>').join('') +
      '<div style="margin-top:8px"><strong>Governs these screens (click to open that exact state)</strong><div class="chips">' + chips + '</div></div>' +
      (s.qs.length ? '<div style="margin-top:8px"><strong>Open questions</strong> ' + s.qs.map((id) => Companion.badge(BL.QUESTIONS.filter((q) => q.id === id)[0]) + ' <a href="' + BL.href({ t: 'question', id: id }, '../') + '">' + id + '</a>').join(' &nbsp; ') + '</div>' : '') + '</div></div>';
  }
  function list() {
    const t = F.text.toLowerCase();
    const r = BL.STORIES.filter((s) => (!F.epic || s.epic === F.epic) && (!F.role || s.role === F.role) && (!F.prog || s.progs.indexOf(F.prog) >= 0) && (!F.stage || s.stage === F.stage || (s.stage === 'all' && F.stage)) && (!F.prio || s.prio === F.prio) && (!F.status || s.status === F.status) && (!t || JSON.stringify(s).toLowerCase().indexOf(t) >= 0));
    document.getElementById('list').innerHTML = r.map(card).join('') || '<div class="card"><div class="card__body">No stories match.</div></div>';
    document.getElementById('cnt').textContent = r.length + ' of ' + BL.STORIES.length + ' stories';
    const tg = document.querySelector('.is-target'); if (tg) tg.scrollIntoView({ block: 'start' });
  }
  filters(); list(); backToQuestion(document.getElementById('main').children[1] ? document.getElementById('main') : document.getElementById('main'));
  document.addEventListener('input', (e) => { if (e.target.id === 'f_text') { F.text = e.target.value; list(); } });
  document.addEventListener('change', (e) => { const m = /^f_(\w+)$/.exec(e.target.id || ''); if (m && m[1] !== 'text') { F[m[1]] = e.target.value; list(); } });
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-t]'); if (b) document.getElementById(b.dataset.t).classList.toggle('is-open'); });
  window.addEventListener('hashchange', list);

  /* export */
  const abs = (r) => new URL(BL.href(r, '../'), location.href).href;
  function sheets() {
    const ans = BL.answers();
    return [
      { name: 'Stories', widths: [9, 28, 28, 50, 50, 18, 20, 9, 11, 13, 60, 16], rows: [['ID', 'Epic', 'Role', 'I want', 'So that', 'Programs', 'Stage', 'Priority', 'Status', 'Source', 'Screens (links)', 'Questions']].concat(BL.STORIES.map((s) => [s.id, s.epic + ' ' + BL.EPICS[s.epic], s.role, s.want, s.benefit, s.progs.join(', '), BL.STAGE_NAME[s.stage], s.prio, s.status, s.owner ? 'Owner-stated' : 'Proposal', s.screens.map((r) => BL.label(r) + ' ' + abs(r)).join('\n'), s.qs.join(', ')])) },
      { name: 'Acceptance Criteria', widths: [9, 6, 50, 50, 60], rows: [['Story', 'AC', 'Given', 'When', 'Then']].concat([].concat.apply([], BL.STORIES.map((s) => s.ac.map((a, i) => [s.id, 'AC' + (i + 1), a[0], a[1], a[2]])))) },
      { name: 'Open Questions', widths: [8, 60, 50, 50, 28, 10, 40, 60], rows: [['ID', 'Question', 'Why it matters', 'Current assumption (Proposal)', 'Who can answer', 'Status', 'Answer', 'In-context link']].concat(BL.QUESTIONS.map((q) => { const a = ans[q.id]; return [q.id, q.q, q.why, q.assume, q.who, a ? a.status : 'Open', a ? a.text : '', abs(q.primary)]; })) },
      { name: 'Journey', widths: [14, 10, 30, 30, 50, 30, 50, 50], rows: [['Step', 'Branch', 'Proposed name - to confirm', 'Actor', 'Data captured', 'Attachments (proposed)', 'Validation gates', 'Pain points today']].concat(BL.JOURNEY.map((j) => [j.id, j.kind, j.name, j.actor, (j.data || (D.STAGE_REQ[j.rec] || []).map((k) => C.fmap[k] && C.fmap[k].l)).join('; '), j.attach.map((t) => D.FILETYPES[t]).join('; '), j.gates.join('; '), j.pain])) }
    ];
  }
  document.getElementById('xlsx').onclick = () => { XLSXLite.download(XLSXLite.build(sheets()), 'D141-backlog.xlsx'); C.toast('Exported D141-backlog.xlsx (stories, acceptance criteria, questions, journey).', 'success'); };
  document.getElementById('csv').onclick = () => {
    const s = sheets()[0]; const csv = '﻿' + s.rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\r\n');
    XLSXLite.download(new Blob([csv], { type: 'text/csv' }), 'D141-stories.csv'); C.toast('Exported D141-stories.csv (stories only).', 'success');
  };
})();
