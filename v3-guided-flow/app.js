(function () {
  const D = window.D141, C = window.Core, BL = window.BL, esc = C.esc, ic = C.icon, $ = C.$, $$ = C.$$;
  const sites = C.store.load(); const fdef = (k) => C.fmap[k];
  document.getElementById('top').innerHTML = C.chrome({ active: 'flow', tabs: [
    { id: 'flow', label: 'New Site Guide', href: 'index.html' }, { id: 'sites', label: 'Sites (record page)', href: '../v1-record-page/index.html' },
    { id: 'hub', label: 'Prototype hub', href: '../index.html' }, { id: 'st', label: 'Stories', href: '../backlog/index.html' }, { id: 'jr', label: 'Journey', href: '../journey/index.html' }, { id: 'q', label: 'Questions', href: '../questions/index.html' }] });
  C.footer({ variation: 'Variation 3: guided screen flow', hub: '../index.html', note: 'Screen Flow style wizard: one concern per screen, validation before Next, review screen with edit links, creates the Site on Finish.' });
  Companion.init({ t: 'flow', base: '../' });

  const STEPS = [
    { id: 'program', label: 'Program', title: 'Which camera program is this site?' },
    { id: 'id', label: 'Identify', title: 'Identify the site', secs: ['id'] },
    { id: 'loc', label: 'Location', title: 'Where is the site?', secs: ['loc'] },
    { id: 'mon', label: 'Monitoring', title: 'What does the camera monitor?', secs: ['mon'] },
    { id: 'eq', label: 'Equipment', title: 'Equipment and enforcement settings', secs: ['eq', 'enf'] },
    { id: 'net', label: 'Network', title: 'Network details', secs: ['net'] },
    { id: 'sz', label: 'School zone', title: 'School zone', secs: ['sz'] },
    { id: 'dates', label: 'Dates', title: 'Lifecycle dates so far', secs: ['life'] },
    { id: 'review', label: 'Review', title: 'Review and create' }
  ];
  const F = { rt: 'FDSC', step: 0, v: {}, errs: {}, warns: {}, visited: new Set(), enforce: false, flash: null };
  const p = new URLSearchParams(location.search);
  if (D.ALL.indexOf(p.get('rt')) >= 0) F.rt = p.get('rt');
  if (p.get('step')) { const i = STEPS.findIndex((s) => s.id === p.get('step')); if (i >= 0) F.step = i; }
  if (p.get('field') && fdef(p.get('field'))) { const f = fdef(p.get('field')); const i = STEPS.findIndex((s) => s.secs && s.secs.indexOf(f.sec) >= 0); if (i >= 0) { F.step = i; F.flash = f.k; } if (f.p.indexOf(F.rt) < 0) F.rt = f.p[0]; }

  const stepFields = (st) => st.secs ? D.fieldsFor(F.rt).filter((f) => st.secs.indexOf(f.sec) >= 0) : [];
  const reqSet = () => C.union(C.alwaysReq(), C.reqKeys(F.rt, 'installed', F.v));
  function ctx() { return { sites: sites, id: null, enforce: F.enforce ? reqSet() : C.alwaysReq() }; }
  function validateStep(st) {
    const errs = {}, warns = {}; const v = F.v;
    stepFields(st).forEach((f) => { if (f.sz && v.schoolZone !== 'Yes') return; const c = ctx(); if (F.enforce === false) c.enforce = C.alwaysReq(); const r = C.check(f, v[f.k], v, F.rt, c); if (r.err) errs[f.k] = r.err; if (r.warn) warns[f.k] = r.warn; });
    return { errs, warns };
  }
  function stepHasErr(i) { const st = STEPS[i]; if (!st.secs) return false; const c = { sites: sites, id: null, enforce: reqSet() }; return stepFields(st).some((f) => { if (f.sz && F.v.schoolZone !== 'Yes') return false; return C.check(f, F.v[f.k], F.v, F.rt, c).err; }); }

  function field(f) {
    const v = F.v; const val = v[f.k] == null ? '' : v[f.k]; const dis = f.sz && v.schoolZone !== 'Yes';
    const reqd = reqSet().has(f.k); const err = F.errs[f.k], warn = F.warns[f.k];
    const inp = f.t === 'pick' ? '<select id="f_' + f.k + '" data-k="' + f.k + '"' + (dis ? ' disabled' : '') + '><option value="">--None--</option>' + D.opts(f, F.rt).map((o) => '<option' + (o === val ? ' selected' : '') + '>' + esc(o) + '</option>').join('') + '</select>' :
      '<input id="f_' + f.k + '" data-k="' + f.k + '" type="' + (f.t === 'date' ? 'date' : f.t === 'time' ? 'time' : 'text') + '" value="' + esc(val) + '"' + (dis ? ' disabled' : '') + ' autocomplete="off">';
    return '<div class="fe fe--edit' + (err ? ' has-error' : '') + (warn && !err ? ' has-warn' : '') + '" data-k="' + f.k + '"><label class="fe__label" for="f_' + f.k + '">' + (reqd && !dis ? '<abbr class="req" title="required">*</abbr>' : '') + esc(f.l) + (f.prop ? '<span class="pdot" title="Proposal: ' + esc(f.prop) + '"></span>' : '') + Companion.qbadges({ field: f.k }) + '</label>' + inp + '<div class="fe__help">' + esc(err || warn || '') + '</div></div>';
  }
  function review() {
    return '<p class="sel-note" style="margin-bottom:8px">Check everything below. Select Edit to jump back to a step. Required values for Camera Installed are checked now (Proposal).</p>' + STEPS.slice(1, 8).map((st, i) => {
      const fs = stepFields(st).filter((f) => !(f.sz && F.v.schoolZone !== 'Yes')); const c = { sites: sites, id: null, enforce: reqSet() };
      const bad = fs.filter((f) => C.check(f, F.v[f.k], F.v, F.rt, c).err).length;
      return '<div class="rvsec"><h3>' + st.label + (bad ? ' <span class="rowflag">' + bad + ' to fix</span>' : '') + '<span class="sp"></span><button class="link-btn" data-goto="' + (i + 1) + '">Edit</button></h3><dl>' + fs.map((f) => { const r = C.check(f, F.v[f.k], F.v, F.rt, c); const val = F.v[f.k]; return '<dt>' + esc(f.l) + '</dt><dd class="' + (r.err ? 'bad' : '') + '">' + (r.err ? esc(r.err) : C.isEmpty(val) ? '<span class="sel-note">-</span>' : esc(f.t === 'date' ? C.fmtDate(val) : val)) + '</dd>'; }).join('') + '</dl></div>';
    }).join('');
  }
  function render() {
    const st = STEPS[F.step];
    const prog = '<ol class="progress">' + STEPS.map((s, i) => '<li class="' + (i < F.step ? 'is-done' : i === F.step ? 'is-active' : '') + (i !== F.step && F.visited.has(i) && stepHasErr(i) ? ' is-err' : '') + '"><button data-goto="' + i + '" ' + (i > F.step && !F.visited.has(i) ? 'disabled' : '') + '><span class="dot">' + (i < F.step && !(F.visited.has(i) && stepHasErr(i)) ? ic('check', '', 12) : (i + 1)) + '</span><br>' + s.label + '</button></li>').join('') + '</ol>';
    let body;
    if (st.id === 'program') body = D.ALL.map((x) => '<label class="rtopt' + (x === F.rt ? ' is-sel' : '') + '"><input type="radio" name="rt" value="' + x + '"' + (x === F.rt ? ' checked' : '') + '><span><strong>' + x + '</strong> - ' + D.PROGRAMS[x].name + '<br><span class="sel-note">' + D.PROGRAMS[x].desc + '</span></span></label>').join('');
    else if (st.id === 'review') body = review();
    else { const fs = stepFields(st); body = (st.id === 'dates' ? '<p class="sel-note" style="margin-bottom:8px">Enter the dates reached so far; later ones can be added on the record. Dates must be in lifecycle order.</p>' : '') + '<div class="grid2">' + fs.map(field).join('') + '</div>'; }
    const last = F.step === STEPS.length - 1;
    $('#app').innerHTML = '<main class="page"><div class="flow"><div class="pagehead" style="margin-bottom:8px"><span class="objicon">' + ic('camera', '', 18) + '</span><div style="flex:1"><div class="sub">New Site (' + F.rt + ')</div><h1>New Site Guide</h1></div><span class="badge badge--proposal">Proposal</span></div>' + prog +
      '<div class="flowcard"><div class="flowcard__h"><h1>' + esc(st.title) + Companion.qbadges({ screen: 'flow' }) + '</h1></div><div class="flowcard__b">' + body + '</div><div class="flowcard__f"><button class="btn" data-prev ' + (F.step === 0 ? 'disabled' : '') + '>Previous</button><span class="sp"></span>' + (last ? '<button class="btn btn--brand" data-finish>Finish</button>' : '<button class="btn btn--brand" data-next>Next</button>') + '</div></div></div></main>';
    if (F.flash) { const el = $('[data-k="' + F.flash + '"]'); if (el) { el.classList.add('flash'); el.scrollIntoView({ block: 'center' }); } F.flash = null; }
  }
  function next() {
    const st = STEPS[F.step];
    if (st.id === 'program') { F.visited.add(F.step); F.step++; return render(); }
    F.enforce = true; const r = validateStep(st); F.errs = r.errs; F.warns = r.warns; F.visited.add(F.step);
    const n = Object.keys(r.errs).length;
    if (n) { render(); C.toast('Review the errors on this page. ' + n + ' field' + (n > 1 ? 's' : '') + ' need attention.', 'error'); const k = Object.keys(r.errs)[0]; const i = $('#f_' + k); if (i) i.focus(); return; }
    F.errs = {}; F.warns = r.warns; F.step++; F.errs = {}; render();
  }
  function finish() {
    const bad = []; STEPS.forEach((s, i) => { if (stepHasErr(i)) bad.push(i); });
    if (bad.length) { C.toast('Cannot create the site yet. Fix the highlighted steps: ' + bad.map((i) => STEPS[i].label).join(', ') + '.', 'error'); F.step = bad[0]; F.enforce = true; const r = validateStep(STEPS[F.step]); F.errs = r.errs; F.warns = r.warns; render(); return; }
    const v = JSON.parse(JSON.stringify(F.v)); if (v.schoolZone !== 'Yes') ['szAmStart', 'szAmEnd', 'szPmStart', 'szPmEnd'].forEach((k) => delete v[k]);
    const site = { id: 's' + Date.now(), rt: F.rt, v: v, done: [], files: [] };
    const sts = D.stages(F.rt); if (!C.isEmpty(v.dInstalled) && C.reqKeys(F.rt, 'installed', v).size && Array.from(C.reqKeys(F.rt, 'installed', v)).every((k) => !C.isEmpty(v[k]))) site.done.push('installed');
    sites.push(site); C.store.save(sites);
    C.toast('Site <strong>' + esc(v.code) + '</strong> was created' + (site.done.length ? ' with Camera Installed complete' : '') + '.', 'success');
    setTimeout(() => (location.href = '../v1-record-page/index.html#/site/' + site.id), 900);
  }
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-next],[data-prev],[data-finish],[data-goto]'); if (!t) return;
    if (t.hasAttribute('data-next')) next(); else if (t.hasAttribute('data-prev')) { F.step--; F.errs = {}; render(); } else if (t.hasAttribute('data-finish')) finish();
    else { const i = +t.dataset.goto; F.step = i; F.errs = {}; if (STEPS[i].secs) { F.enforce = true; const r = validateStep(STEPS[i]); F.errs = r.errs; F.warns = r.warns; } render(); }
  });
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.name === 'rt') { if (F.rt !== t.value) { F.v = {}; F.visited = new Set(); } F.rt = t.value; render(); return; }
    const k = t.dataset && t.dataset.k; if (!k) return;
    F.v[k] = t.value;
    if (k === 'schoolZone' && t.value !== 'Yes') ['szAmStart', 'szAmEnd', 'szPmStart', 'szPmEnd'].forEach((x) => (F.v[x] = ''));
    const f = fdef(k); const keys = [k]; if (k === 'schoolZone') keys.push('szAmStart', 'szAmEnd', 'szPmStart', 'szPmEnd'); if (f.t === 'date') D.fieldsFor(F.rt).filter((x) => x.t === 'date' && !x.plain).forEach((x) => keys.push(x.k)); if (k === 'szAmStart') keys.push('szAmEnd'); if (k === 'szPmStart') keys.push('szPmEnd');
    keys.forEach((kk) => { const ff = fdef(kk); const el = $('.fe[data-k="' + kk + '"]'); if (!el) return; const dis = ff.sz && F.v.schoolZone !== 'Yes'; const r = dis ? { err: '', warn: '' } : C.check(ff, F.v[kk], F.v, F.rt, ctx()); if (r.err) F.errs[kk] = r.err; else delete F.errs[kk]; el.classList.toggle('has-error', !!r.err); el.classList.toggle('has-warn', !!r.warn && !r.err); el.querySelector('.fe__help').textContent = r.err || r.warn || ''; const inp = el.querySelector('input,select'); if (ff.sz) { inp.disabled = dis; if (dis) inp.value = ''; const lab = el.querySelector('.fe__label'); const old = lab.querySelector('.req'); if (old) old.remove(); if (!dis) lab.insertAdjacentHTML('afterbegin', '<abbr class="req" title="required">*</abbr>'); } });
  });
  document.addEventListener('input', (e) => { const k = e.target.dataset && e.target.dataset.k; if (k) F.v[k] = e.target.value; });
  render();
})();
