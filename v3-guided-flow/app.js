(function () {
  const D = window.D141, C = window.Core, BL = window.BL, esc = C.esc, ic = C.icon, $ = C.$, $$ = C.$$;
  const sites = C.store.load(); const fdef = (k) => C.fmap[k];
  document.getElementById('top').innerHTML = C.chrome({ active: 'flow', tabs: [
    { id: 'flow', label: 'New Site Guide', href: 'index.html' }, { id: 'sites', label: 'Sites (record page)', href: '../v1-record-page/index.html' },
    { id: 'hub', label: 'Prototype hub', href: '../index.html' }, { id: 'model', label: 'Data model', href: '../model/index.html' }, { id: 'st', label: 'Stories', href: '../backlog/index.html' }, { id: 'jr', label: 'Journey', href: '../journey/index.html' }, { id: 'q', label: 'Questions', href: '../questions/index.html' }] });
  C.footer({ variation: 'Variation 3: guided screen flow', id: 'v3', hub: '../index.html', note: 'Screen Flow style wizard that creates a Site and its child records (Lanes, Camera Program, Enforcement Devices, Certificates): one concern per screen, validation before Next, review screen with edit links.',
    here: { crumbs: [['Prototype hub', '../index.html'], ['Variation 3: Guided screen flow']], what: 'A Screen Flow style wizard that creates a Site plus its Lanes, Camera Program, Enforcement Devices and Certificates, one concern per screen, validating before Next, with a review screen.', prefer: 'New or occasional users, or when fewer mistakes matter more than speed.' },
    tour: [{ sel: '.progress', title: 'Progress', text: 'Shows where you are. Steps with problems turn red.' }, { sel: '.flowcard__b', title: 'One concern per screen', text: 'Fields adapt to the program chosen on step 1. Child records are added on their own steps.' }, { sel: '[data-next]', title: 'Next', text: 'Validates this step before moving on.' }] });
  Companion.init({ t: 'flow', base: '../' });

  const STEPS = [
    { id: 'program', label: 'Program', title: 'Which camera program is this site?' },
    { id: 'loc', label: 'Location', title: 'Site location', secs: ['loc'] },
    { id: 'det', label: 'Details', title: 'Site details', secs: ['det'] },
    { id: 'coord', label: 'Coordinates', title: 'Coordinates and monitoring', secs: ['coord', 'mon'] },
    { id: 'eq', label: 'Settings', title: 'Equipment settings and school zone (D141 columns)', secs: ['eq', 'sz'] },
    { id: 'lanes', label: 'Lanes', title: 'Lanes', kind: 'lane' },
    { id: 'equip', label: 'Program and devices', title: 'Camera Program and Enforcement Devices', kinds: ['program', 'device'] },
    { id: 'net', label: 'Network', title: 'Network details', secs: ['net'] },
    { id: 'dates', label: 'Dates', title: 'Lifecycle dates and Certificates so far', secs: ['life'], kind: 'cert' },
    { id: 'review', label: 'Review', title: 'Review and create' }
  ];
  const F = { rt: 'FDSC', step: 0, v: { status: 'Active' }, lanes: [], programs: [], devices: [], certs: [], errs: {}, warns: {}, visited: new Set(), enforce: false, flash: null, cerr: {}, draftChild: {} };
  const p = new URLSearchParams(location.search);
  if (D.ALL.indexOf(p.get('rt')) >= 0) F.rt = p.get('rt');
  if (p.get('step')) { const i = STEPS.findIndex((s) => s.id === p.get('step') || (s.secs || []).indexOf(p.get('step')) >= 0); if (i >= 0) F.step = i; }
  if (p.get('field') && fdef(p.get('field'))) { const f = fdef(p.get('field')); const i = STEPS.findIndex((s) => s.secs && s.secs.indexOf(f.sec) >= 0); if (i >= 0) { F.step = i; F.flash = f.k; } if (f.p.indexOf(F.rt) < 0) F.rt = f.p[0]; }

  const pseudo = () => ({ id: null, rt: F.rt, v: F.v, lanes: F.lanes, programs: F.programs, devices: F.devices, certs: F.certs, done: [] });
  const stepFields = (st) => st.secs ? D.fieldsFor(F.rt).filter((f) => st.secs.indexOf(f.sec) >= 0) : [];
  const reqSet = () => C.union(C.alwaysReq(), C.reqKeys(F.rt, 'installed', F.v));
  const ctx = (all) => ({ sites: sites, id: null, certs: F.certs, enforce: all ? reqSet() : C.alwaysReq() });
  function kindsOf(st) { return st.kinds || (st.kind ? [st.kind] : []); }
  function childMsgs(st) { // required child records at this step
    const out = []; const need = D.childReq(F.rt, 'installed');
    if (st.id === 'lanes' && F.lanes.length < need.lane) out.push('Add at least one Lane.');
    if (st.id === 'equip') { if (F.programs.length < need.program) out.push('Add a Camera Program.'); need.device.forEach((t) => { if (!F.devices.some((d) => d.type === t)) out.push('Add an Enforcement Device of type ' + t + '.'); }); }
    return out;
  }
  function validateStep(st, strict) {
    const errs = {}, warns = {}; const v = F.v;
    stepFields(st).forEach((f) => { if (f.sz && v.schoolZone !== 'Yes') return; const r = C.check(f, v[f.k], v, F.rt, ctx(strict)); if (r.err) errs[f.k] = r.err; if (r.warn) warns[f.k] = r.warn; });
    return { errs, warns };
  }
  function stepHasErr(i) { const st = STEPS[i]; const e = Object.keys(validateStep(st, true).errs).length; return !!(e || (st.id === 'lanes' || st.id === 'equip') && childMsgs(st).length); }

  function field(f) {
    const v = F.v; const val = v[f.k] == null ? '' : v[f.k]; const dis = f.sz && v.schoolZone !== 'Yes';
    if (f.t === 'formula') return '';
    const reqd = reqSet().has(f.k); const err = F.errs[f.k], warn = F.warns[f.k];
    const inp = f.t === 'bool' ? '<input id="f_' + f.k + '" data-k="' + f.k + '" type="checkbox"' + (val === 'true' ? ' checked' : '') + '>' : f.t === 'pick' ? '<select id="f_' + f.k + '" data-k="' + f.k + '"' + (dis ? ' disabled' : '') + '><option value="">--None--</option>' + D.opts(f, F.rt, v).map((o) => '<option' + (o === val ? ' selected' : '') + '>' + esc(o) + '</option>').join('') + '</select>' :
      '<input id="f_' + f.k + '" data-k="' + f.k + '" type="' + (f.t === 'date' ? 'date' : f.t === 'time' ? 'time' : 'text') + '" value="' + esc(val) + '"' + (dis ? ' disabled' : '') + (f.t === 'latlng' ? ' placeholder="e.g. -33.8688, 151.2093"' : '') + ' autocomplete="off">';
    return '<div class="fe fe--edit' + (err ? ' has-error' : '') + (warn && !err ? ' has-warn' : '') + '" data-k="' + f.k + '"><label class="fe__label" for="f_' + f.k + '">' + (reqd && !dis ? '<abbr class="req" title="required">*</abbr>' : '') + esc(f.l) + (f.ex ? '<span class="edot" title="' + esc(f.ex) + '"></span>' : '') + (f.prop ? '<span class="pdot" title="Proposal: ' + esc(f.prop) + '"></span>' : '') + Companion.qbadges({ field: f.k }) + '</label>' + inp + '<div class="fe__help">' + esc(err || warn || '') + '</div></div>';
  }
  function childBlock(kind) {
    const def = D.CH[kind]; const arr = F[D.CHKEY[kind]]; const dc = F.draftChild[kind] || (F.draftChild[kind] = {});
    const form = def.fields.map((f) => { const val = dc[f.k] || ''; const err = F.cerr[kind] && F.cerr[kind][f.k];
      const inp = f.t === 'pick' ? '<select data-ck="' + kind + '|' + f.k + '"><option value="">--None--</option>' + D.opts(f, F.rt, dc).map((o) => '<option' + (o === val ? ' selected' : '') + '>' + esc(o) + '</option>').join('') + '</select>' : '<input data-ck="' + kind + '|' + f.k + '" type="' + (f.t === 'date' ? 'date' : 'text') + '" value="' + esc(val) + '" autocomplete="off">';
      return '<div class="fe fe--edit' + (err ? ' has-error' : '') + '" data-cf="' + kind + '|' + f.k + '"><label class="fe__label">' + (f.req ? '<abbr class="req">*</abbr>' : '') + esc(f.l) + '</label>' + inp + '<div class="fe__help">' + esc(err || '') + '</div></div>'; }).join('');
    return '<div class="rvsec" style="margin-top:12px"><h3>' + esc(def.plural) + ' (' + arr.length + ')' + Companion.qbadges({ child: kind }) + '<span class="sp"></span><span class="badge badge--proposal">Child record</span></h3>' +
      (arr.length ? '<table class="tbl"><thead><tr>' + def.fields.map((f) => '<th>' + esc(f.l) + '</th>').join('') + '<th></th></tr></thead><tbody>' + arr.map((r) => '<tr>' + def.fields.map((f) => '<td>' + esc(f.t === 'date' ? C.fmtDate(r[f.k]) : r[f.k]) + '</td>').join('') + '<td><button class="link-btn" data-rm="' + kind + '|' + r.id + '">Remove</button></td></tr>').join('') + '</tbody></table>' : '<div class="sel-note" style="padding:8px 12px">None added yet.</div>') +
      '<div style="padding:8px 12px"><strong>Add ' + esc(def.label) + '</strong><div class="grid2" style="column-gap:16px">' + form + '</div><button class="btn btn--sm" data-add="' + kind + '">Add ' + esc(def.label) + '</button></div></div>';
  }
  function review() {
    const c = { sites: sites, id: null, certs: F.certs, enforce: reqSet() };
    const secs = STEPS.filter((s) => s.secs).map((st, idx) => {
      const i = STEPS.indexOf(st); const fs = stepFields(st).filter((f) => f.t !== 'formula' && !(f.sz && F.v.schoolZone !== 'Yes'));
      const bad = fs.filter((f) => C.check(f, F.v[f.k], F.v, F.rt, c).err).length;
      return '<div class="rvsec"><h3>' + st.label + (bad ? ' <span class="rowflag">' + bad + ' to fix</span>' : '') + '<span class="sp"></span><button class="link-btn" data-goto="' + i + '">Edit</button></h3><dl>' + fs.map((f) => { const r = C.check(f, F.v[f.k], F.v, F.rt, c); const val = F.v[f.k]; return '<dt>' + esc(f.l) + '</dt><dd class="' + (r.err ? 'bad' : '') + '">' + (r.err ? esc(r.err) : C.isEmpty(val) ? '<span class="sel-note">-</span>' : esc(f.t === 'date' ? C.fmtDate(val) : f.t === 'bool' ? 'Yes' : val)) + '</dd>'; }).join('') + '</dl></div>'; }).join('');
    const ch = ['lane', 'program', 'device', 'cert'].map((k) => { const i = STEPS.findIndex((s) => kindsOf(s).indexOf(k) >= 0); const arr = F[D.CHKEY[k]]; return '<div class="rvsec"><h3>' + esc(D.CH[k].plural) + ' (' + arr.length + ')<span class="sp"></span><button class="link-btn" data-goto="' + i + '">Edit</button></h3><dl>' + (arr.length ? arr.map((r) => '<dt>' + esc(r[D.CH[k].fields[0].k]) + '</dt><dd>' + D.CH[k].fields.slice(1).map((f) => esc(f.t === 'date' ? C.fmtDate(r[f.k]) : r[f.k])).join(' / ') + '</dd>').join('') : '<dt>None</dt><dd></dd>') + '</dl></div>'; }).join('');
    return '<p class="sel-note" style="margin-bottom:8px">Check everything below. Select Edit to jump back to a step. Required values for Camera Installed are checked now (Proposal).</p>' + secs + ch;
  }
  function render() {
    const st = STEPS[F.step];
    const prog = '<ol class="progress">' + STEPS.map((s, i) => '<li class="' + (i < F.step ? 'is-done' : i === F.step ? 'is-active' : '') + (i !== F.step && F.visited.has(i) && stepHasErr(i) ? ' is-err' : '') + '"><button data-goto="' + i + '" ' + (i > F.step && !F.visited.has(i) ? 'disabled' : '') + '><span class="dot">' + (i < F.step && !(F.visited.has(i) && stepHasErr(i)) ? ic('check', '', 12) : (i + 1)) + '</span><br>' + s.label + '</button></li>').join('') + '</ol>';
    let body;
    if (st.id === 'program') body = D.ALL.map((x) => '<label class="rtopt' + (x === F.rt ? ' is-sel' : '') + '"><input type="radio" name="rt" value="' + x + '"' + (x === F.rt ? ' checked' : '') + '><span><strong>' + x + '</strong> - ' + D.PROGRAMS[x].name + '<br><span class="sel-note">' + D.PROGRAMS[x].desc + '</span></span></label>').join('');
    else if (st.id === 'review') body = review();
    else {
      const fs = stepFields(st); const need = (st.id === 'lanes' || st.id === 'equip') && F.visited.has(F.step) ? childMsgs(st) : [];
      body = (st.id === 'dates' ? '<p class="sel-note" style="margin-bottom:8px">Enter the dates reached so far; later ones can be added on the record. Dates, including Certificate dates, must be in lifecycle order.</p>' : '') + (st.id === 'lanes' ? '<p class="sel-note">A Site needs lane configuration (the live page warns "Please add Lane(s)").</p>' : '') + (fs.length ? '<div class="grid2">' + fs.map(field).join('') + '</div>' : '') +
        kindsOf(st).map(childBlock).join('') + (need.length ? '<div class="errsum" style="margin-top:12px">' + ic('error', '', 18) + '<div><ul>' + need.map((m) => '<li>' + esc(m) + '</li>').join('') + '</ul></div></div>' : '');
    }
    const last = F.step === STEPS.length - 1;
    $('#app').innerHTML = '<main class="page"><div class="flow"><div class="pagehead" style="margin-bottom:8px"><span class="objicon objicon--site" style="background:#e3447a">' + ic('building', '', 18) + '</span><div style="flex:1"><div class="sub">New Site (' + F.rt + ')</div><h1>New Site Guide</h1></div><span class="badge badge--proposal">Proposal</span></div>' + prog +
      '<div class="flowcard"><div class="flowcard__h"><h1>' + esc(st.title) + Companion.qbadges({ screen: 'flow' }) + '</h1></div><div class="flowcard__b">' + body + '</div><div class="flowcard__f"><button class="btn" data-prev ' + (F.step === 0 ? 'disabled' : '') + '>Previous</button><span class="sp"></span>' + (last ? '<button class="btn btn--brand" data-finish>Finish</button>' : '<button class="btn btn--brand" data-next>Next</button>') + '</div></div></div></main>';
    if (F.flash) { const el = $('[data-k="' + F.flash + '"]'); if (el) { el.classList.add('flash'); el.scrollIntoView({ block: 'center' }); } F.flash = null; }
  }
  function next() {
    const st = STEPS[F.step];
    if (st.id === 'program') { F.visited.add(F.step); F.step++; return render(); }
    const r = validateStep(st, true); F.errs = r.errs; F.warns = r.warns; F.visited.add(F.step);
    const n = Object.keys(r.errs).length; const cm = childMsgs(st);
    if (n || cm.length) { render(); C.toast('Review the errors on this page. ' + (n + cm.length) + ' item' + (n + cm.length > 1 ? 's' : '') + ' need attention.', 'error'); const k = Object.keys(r.errs)[0]; const i = k && $('#f_' + k); if (i) i.focus(); return; }
    F.errs = {}; F.step++; render();
  }
  function finish() {
    const bad = []; STEPS.forEach((s, i) => { if (i && i < STEPS.length - 1 && stepHasErr(i)) bad.push(i); });
    if (bad.length) { C.toast('Cannot create the site yet. Fix the highlighted steps: ' + bad.map((i) => STEPS[i].label).join(', ') + '.', 'error'); F.step = bad[0]; F.visited.add(F.step); const r = validateStep(STEPS[F.step], true); F.errs = r.errs; F.warns = r.warns; render(); return; }
    const v = JSON.parse(JSON.stringify(F.v)); if (v.schoolZone !== 'Yes') ['szAmStart', 'szAmEnd', 'szPmStart', 'szPmEnd'].forEach((k) => delete v[k]);
    const now = new Date().toISOString(); const site = { id: 's' + Date.now(), rt: F.rt, v: v, done: [], files: [], lanes: F.lanes, programs: F.programs, devices: F.devices, certs: F.certs, created: now, modified: now };
    if (!C.isEmpty(v.dInstalled) && Array.from(C.reqKeys(F.rt, 'installed', v)).every((k) => !C.isEmpty(v[k])) && !C.childProblems(site, 'installed').length) site.done.push('installed');
    sites.push(site); C.store.save(sites);
    C.toast('Site <strong>' + esc(v.code) + '</strong> was created with ' + F.lanes.length + ' lane(s), ' + F.devices.length + ' device(s) and ' + F.certs.length + ' certificate(s)' + (site.done.length ? '; Camera Installed complete' : '') + '.', 'success');
    setTimeout(() => (location.href = '../v1-record-page/index.html#/site/' + site.id), 900);
  }
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-next],[data-prev],[data-finish],[data-goto],[data-add],[data-rm]'); if (!t) return;
    if (t.hasAttribute('data-next')) next(); else if (t.hasAttribute('data-prev')) { F.step--; F.errs = {}; render(); } else if (t.hasAttribute('data-finish')) finish();
    else if (t.dataset.add) { const kind = t.dataset.add; const rec = Object.assign({ id: 'c' + Date.now() }, F.draftChild[kind]); const errs = C.checkChild(kind, rec, pseudo(), true); F.cerr[kind] = errs; if (Object.keys(errs).length) { render(); C.toast('Review the errors on this page.', 'error'); return; } F[D.CHKEY[kind]].push(rec); F.draftChild[kind] = {}; F.cerr[kind] = {}; render(); C.toast(D.CH[kind].label + ' added.', 'success', 2500); }
    else if (t.dataset.rm) { const [k, id] = t.dataset.rm.split('|'); F[D.CHKEY[k]] = F[D.CHKEY[k]].filter((r) => r.id !== id); render(); }
    else { const i = +t.dataset.goto; F.step = i; F.errs = {}; if (STEPS[i].secs && F.visited.has(i)) { const r = validateStep(STEPS[i], true); F.errs = r.errs; F.warns = r.warns; } render(); }
  });
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.name === 'rt') { if (F.rt !== t.value) { F.v = { status: 'Active' }; F.lanes = []; F.programs = []; F.devices = []; F.certs = []; F.visited = new Set(); F.draftChild = {}; } F.rt = t.value; render(); return; }
    if (t.dataset && t.dataset.ck) { const [kind, k] = t.dataset.ck.split('|'); const dc = F.draftChild[kind] || (F.draftChild[kind] = {}); dc[k] = t.value; if (kind === 'device' && k === 'type') { dc.model = ''; render(); return; } const errs = C.checkChild(kind, Object.assign({ id: 'x' }, dc), pseudo(), false); const el = $('[data-cf="' + kind + '|' + k + '"]'); if (el) { el.classList.toggle('has-error', !!errs[k]); el.querySelector('.fe__help').textContent = errs[k] || ''; } return; }
    const k = t.dataset && t.dataset.k; if (!k) return;
    F.v[k] = t.type === 'checkbox' ? (t.checked ? 'true' : '') : t.value;
    if (k === 'schoolZone' && t.value !== 'Yes') ['szAmStart', 'szAmEnd', 'szPmStart', 'szPmEnd'].forEach((x) => (F.v[x] = ''));
    const f = fdef(k); const keys = [k]; if (k === 'schoolZone') keys.push('szAmStart', 'szAmEnd', 'szPmStart', 'szPmEnd'); if (f.t === 'date') D.fieldsFor(F.rt).filter((x) => x.t === 'date' && !x.plain).forEach((x) => keys.push(x.k)); if (k === 'szAmStart') keys.push('szAmEnd'); if (k === 'szPmStart') keys.push('szPmEnd'); if (k === 'activity') keys.push('status');
    keys.forEach((kk) => { const ff = fdef(kk); const el = $('.fe[data-k="' + kk + '"]'); if (!el) return; const dis = ff.sz && F.v.schoolZone !== 'Yes'; const r = dis ? { err: '', warn: '' } : C.check(ff, F.v[kk], F.v, F.rt, ctx(false)); if (r.err) F.errs[kk] = r.err; else delete F.errs[kk]; el.classList.toggle('has-error', !!r.err); el.classList.toggle('has-warn', !!r.warn && !r.err); el.querySelector('.fe__help').textContent = r.err || r.warn || ''; const inp = el.querySelector('input,select'); if (ff.sz) { inp.disabled = dis; if (dis) inp.value = ''; const lab = el.querySelector('.fe__label'); const old = lab.querySelector('.req'); if (old) old.remove(); if (!dis) lab.insertAdjacentHTML('afterbegin', '<abbr class="req" title="required">*</abbr>'); } });
  });
  document.addEventListener('input', (e) => { const t = e.target; if (t.dataset && t.dataset.k) F.v[t.dataset.k] = t.value; else if (t.dataset && t.dataset.ck) { const [kind, k] = t.dataset.ck.split('|'); (F.draftChild[kind] = F.draftChild[kind] || {})[k] = t.value; } });
  render();
})();
