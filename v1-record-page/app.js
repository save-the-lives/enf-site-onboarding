(function () {
  const D = window.D141, C = window.Core, BL = window.BL, esc = C.esc, ic = C.icon;
  const $ = C.$, $$ = C.$$;
  const sites = C.store.load();
  const S = { route: { name: 'list' }, editing: false, draft: null, errors: {}, warns: {}, enforce: new Set(), summary: null, stage: null, tab: 'details', closed: {}, search: '', prog: '', sort: 'code', dir: 1, focus: null, flash: null, qctx: null };
  const persist = () => C.store.save(sites);
  const byId = (id) => sites.filter((s) => s.id === id)[0];
  const stOf = (site) => D.stages(site.rt);
  const fdef = (k) => C.fmap[k];

  document.getElementById('top').innerHTML = C.chrome({ active: 'sites', tabs: [
    { id: 'home', label: 'Home', href: '#/home' }, { id: 'sites', label: 'Sites', href: '#/sites' }, { id: 'reports', label: 'Reports', href: '#/home' },
    { id: 'hub', label: 'Prototype hub', href: '../index.html' }, { id: 'st', label: 'Stories', href: '../backlog/index.html' }, { id: 'jr', label: 'Journey', href: '../journey/index.html' }, { id: 'q', label: 'Questions', href: '../questions/index.html' }] });
  C.footer({ variation: 'Variation 1: single-site record page', hub: '../index.html', note: 'Guided single-site record page. A Lightning record page with highlights panel, Path, Details and Related tabs, inline edit and Save/Cancel footer.' });
  Companion.init({ t: 'record', base: '../', ctx: () => ({ stage: S.stage }) });
  $('.gh__search input').addEventListener('keydown', (e) => { if (e.key === 'Enter') { S.search = e.target.value; location.hash = '#/sites'; render(); } });

  /* ---------- routing ---------- */
  function parseHash() {
    const h = location.hash.replace(/^#/, '') || '/sites';
    const [path, qs] = h.split('?'); const p = {}; (qs || '').split('&').forEach((x) => { if (x) { const [k, v] = x.split('='); p[k] = decodeURIComponent(v || ''); } });
    const m = /^\/site\/([^/]+)/.exec(path);
    return { name: m ? 'site' : path === '/home' ? 'home' : 'list', id: m && m[1], p: p };
  }
  function onRoute() {
    const r = parseHash(); const prev = S.route;
    if (prev.name === 'site' && (r.name !== 'site' || r.id !== prev.id) && S.editing) cancelEdit(true);
    S.route = r; closeAll();
    if (r.name === 'site') {
      const site = byId(r.id); if (!site) { location.hash = '#/sites'; return; }
      S.stage = r.p.stage && stOf(site).some((s) => s.id === r.p.stage) ? r.p.stage : (prev.id === r.id && S.stage ? S.stage : (C.currentStage(site) || stOf(site)[stOf(site).length - 1]).id);
      S.tab = r.p.tab || (prev.id === r.id ? S.tab : 'details');
      S.flash = r.p.field || null; S.qctx = r.p.q || null;
      if (r.p.field && fdef(r.p.field) && fdef(r.p.field).sec !== 'life') S.closed[fdef(r.p.field).sec] = false;
    } else if (r.name === 'list') { S.qctx = r.p.q || null; }
    render();
    if (r.name === 'list' && r.p.new) openNew();
  }
  window.addEventListener('hashchange', onRoute);
  function closeAll() { C.closeModal(); C.closeDrawer(); Companion.closePop(); }
  function go(h) { if (location.hash === h) onRoute(); else location.hash = h; }

  /* ---------- helpers ---------- */
  function ctxFor(site) { return { sites: sites, id: site.id, enforce: S.enforce }; }
  function reqSetFor(site, v) { return C.union(C.alwaysReq(), C.reqKeys(site.rt, S.stage, v)); }
  function fmtVal(f, val) { if (C.isEmpty(val)) return ''; return f.t === 'date' ? C.fmtDate(val) : esc(val); }
  function actPill(a) { return '<span class="pill act-' + String(a || '').toLowerCase() + '">' + esc(a || '') + '</span>'; }
  function stageStatus(site, sid) { if (site.done.indexOf(sid) >= 0) return 'complete'; const c = C.currentStage(site); return c && c.id === sid ? 'current' : 'incomplete'; }

  /* ---------- LIST ---------- */
  function renderList() {
    let rows = sites.filter((s) => (!S.prog || s.rt === S.prog) && (!S.search || JSON.stringify(s.v).toLowerCase().indexOf(S.search.toLowerCase()) >= 0 || s.rt.toLowerCase() === S.search.toLowerCase()));
    const val = (s) => S.sort === 'rt' ? s.rt : S.sort === 'stage' ? (C.currentStage(s) || { label: 'zz' }).label : String(s.v[S.sort] || '').toLowerCase();
    rows.sort((a, b) => (val(a) > val(b) ? 1 : -1) * S.dir);
    const th = (k, l) => '<th><button class="th-sort" data-sort="' + k + '">' + l + (S.sort === k ? (S.dir > 0 ? ' ▲' : ' ▼') : '') + '</button></th>';
    return '<main class="page"><div class="lv-head"><span class="objicon">' + ic('camera', '', 18) + '</span><div style="flex:1"><div class="sub">Sites</div><h1>All Sites ' + ic('chevrondown', '', 12) + '</h1></div>' + Companion.qbadges({ screen: 'list' }) +
      '<button class="btn" id="newBtn" style="background:#fff">New</button></div>' +
      '<div class="lv-meta"><span>' + rows.length + ' item' + (rows.length === 1 ? '' : 's') + ' • Sorted by ' + esc(S.sort) + ' • Filtered by All sites</span><span class="sp"></span>' +
      '<select id="progFilter" aria-label="Filter by record type"><option value="">All record types</option>' + D.ALL.map((p) => '<option ' + (S.prog === p ? 'selected' : '') + '>' + p + '</option>').join('') + '</select>' +
      '<input id="listSearch" type="search" placeholder="Search this list..." value="' + esc(S.search) + '"></div>' +
      '<div class="lv-table"><table class="tbl"><thead><tr><th style="width:30px"></th>' + th('code', 'Camera Code') + th('rt', 'Record Type') + th('suburb', 'Suburb') + th('region', 'Region') + th('activity', 'Activity Type') + th('stage', 'Current Stage') + '<th>Progress</th><th style="width:30px"></th></tr></thead><tbody>' +
      (rows.length ? rows.map((s) => { const c = C.currentStage(s); return '<tr><td>' + ic('camera', '', 14) + '</td><td><a href="#/site/' + s.id + '">' + esc(s.v.code) + '</a></td><td>' + s.rt + '</td><td>' + esc(s.v.suburb) + '</td><td>' + esc(s.v.region) + '</td><td>' + actPill(s.v.activity) + '</td><td>' + (c ? esc(c.label) : '<span class="badge badge--ok">Enforcement live</span>') + '</td><td>' + s.done.length + ' of ' + stOf(s).length + ' stages</td><td>' + ic('chevrondown', '', 12) + '</td></tr>'; }).join('') : '<tr><td colspan="9" class="empty">No sites match.</td></tr>') +
      '</tbody></table></div></main>';
  }

  /* ---------- RECORD ---------- */
  function fieldHTML(f, site) {
    const v = S.editing ? S.draft : site.v; const val = v[f.k] == null ? '' : v[f.k];
    const q = Companion.qbadges({ field: f.k });
    const dot = f.prop ? '<span class="pdot" title="Proposal: ' + esc(f.prop) + '"></span>' : '';
    const reqd = reqSetFor(site, v).has(f.k);
    if (!S.editing) {
      const miss = C.isEmpty(val);
      return '<div class="fe" data-k="' + f.k + '"><span class="fe__label">' + esc(f.l) + dot + q + '</span><div class="fe__ctrl"><span class="fe__static' + (miss && reqd ? ' is-missing' : '') + '">' + (miss ? (reqd ? 'Required for this stage' : '') : fmtVal(f, val)) + '</span><button class="pencil" data-edit="' + f.k + '" title="Edit ' + esc(f.l) + '" aria-label="Edit ' + esc(f.l) + '">' + ic('pencil', '', 12) + '</button></div></div>';
    }
    const dis = f.sz && v.schoolZone !== 'Yes';
    const err = S.errors[f.k], warn = S.warns[f.k];
    let inp;
    if (f.t === 'pick') inp = '<select id="f_' + f.k + '" data-k="' + f.k + '"' + (dis ? ' disabled' : '') + '><option value="">--None--</option>' + D.opts(f, site.rt).map((o) => '<option' + (o === val ? ' selected' : '') + '>' + esc(o) + '</option>').join('') + '</select>';
    else inp = '<input id="f_' + f.k + '" data-k="' + f.k + '" type="' + (f.t === 'date' ? 'date' : f.t === 'time' ? 'time' : 'text') + '" value="' + esc(val) + '"' + (dis ? ' disabled' : '') + (f.t === 'ip' ? ' placeholder="e.g. 192.0.2.10"' : '') + ' autocomplete="off">';
    return '<div class="fe fe--edit' + (err ? ' has-error' : '') + (warn && !err ? ' has-warn' : '') + '" data-k="' + f.k + '"><label class="fe__label" for="f_' + f.k + '">' + (reqd && !dis ? '<abbr class="req" title="required">*</abbr>' : '') + esc(f.l) + dot + q + '</label>' + inp + '<div class="fe__help" id="h_' + f.k + '">' + esc(err || warn || '') + '</div></div>';
  }

  function stageCardHTML(site) {
    const st = stOf(site).filter((s) => s.id === S.stage)[0]; const v = S.editing ? S.draft : site.v;
    const status = stageStatus(site, st.id);
    const jr = BL.JOURNEY.filter((j) => j.rec === st.id && j.kind === 'main')[0];
    const files = site.files.filter((f) => st.att.indexOf(f.type) >= 0);
    const req = Array.from(C.reqKeys(site.rt, st.id, v));
    const todo = req.filter((k) => C.isEmpty(v[k])).length;
    return '<div class="stagecard" id="stagecard"><div class="stagecard__h"><h2>Stage: ' + esc(st.label) + Companion.qbadges({ stage: st.id }) + '</h2><span class="badge ' + (status === 'complete' ? 'badge--ok' : status === 'current' ? 'badge--cur' : '') + '">' + (status === 'complete' ? 'Complete' : status === 'current' ? 'Current stage' : 'Not started') + '</span></div>' +
      '<div class="stagecard__b"><p style="margin-bottom:8px">' + esc(D.STAGE_HELP[st.id]) + ' <span class="badge badge--proposal">Proposal</span></p>' +
      (jr ? '<p class="sel-note" style="margin-bottom:8px">Journey step: <a href="../journey/index.html#' + jr.id + '">' + esc(jr.name) + '</a> (proposed name - to confirm)</p>' : '') +
      '<div class="grid2">' + st.dates.map((k) => fieldHTML(fdef(k), site)).join('') + '</div>' +
      '<p class="sel-note" style="margin:4px 0 8px">Required to complete this stage (Proposal): ' + (todo ? '<strong>' + todo + ' of ' + req.length + ' still to do</strong>' : 'all ' + req.length + ' done') + '</p>' +
      '<div class="dropzone"><div style="display:flex;align-items:center;gap:8px"><strong>Attachments</strong> <span class="badge badge--proposal">Proposal - to be confirmed by owner</span><span style="flex:1"></span>' + (st.att.length ? '<button class="btn btn--sm" data-upload="' + st.att[0] + '">' + ic('upload', '', 12) + ' Upload Files</button>' : '') + '</div>' +
      (st.att.length ? '<div class="sel-note">Proposed: ' + st.att.map((t) => D.FILETYPES[t]).join(', ') + '</div>' + (files.length ? files.map(fileRow).join('') : '<div class="sel-note" style="padding:6px 0">No files yet.</div>') : '<div class="sel-note">No attachment proposed for this stage.</div>') + '</div>' +
      '<p style="margin-top:12px"><strong>All lifecycle dates</strong></p><table class="tbl lifetbl"><tbody>' + stOf(site).map((s) => '<tr><td><a href="#/site/' + site.id + '?stage=' + s.id + '">' + esc(s.label) + '</a></td><td>' + s.dates.map((k) => esc(fdef(k).l.replace(/ Date.*$/, '')) + ': ' + (C.fmtDate(v[k]) || '-')).join(' &middot; ') + '</td><td>' + (stageStatus(site, s.id) === 'complete' ? ic('check', 'done', 12) : '') + '</td></tr>').join('') + '</tbody></table>' +
      '</div></div>';
  }
  function fileRow(f) { return '<div class="filerow">' + ic('doc', '', 14) + '<span class="nm">' + esc(f.name) + '</span><span class="sel-note">' + esc(D.FILETYPES[f.type]) + ' - ' + Math.round(f.size / 1024) + ' KB</span><button class="link-btn" data-rmfile="' + f.id + '">Remove</button></div>'; }

  function sectionHTML(sec, site) {
    const fs = D.fieldsFor(site.rt).filter((f) => f.sec === sec.id); if (!fs.length) return '';
    const closed = S.closed[sec.id];
    return '<section class="sec' + (closed ? ' is-closed' : '') + '" id="sec_' + sec.id + '"><button class="sec__h" data-sec="' + sec.id + '">' + ic('chevrondown', '', 12) + sec.title + '</button><div class="sec__b grid2">' + fs.map((f) => fieldHTML(f, site)).join('') + '</div></section>';
  }

  function checklistHTML(site) {
    const v = S.editing ? S.draft : site.v; const st = stOf(site).filter((s) => s.id === S.stage)[0];
    const keys = Array.from(C.reqKeys(site.rt, st.id, v));
    return '<div class="card"><div class="card__head"><h2>Required for: ' + esc(st.label) + '</h2><span class="badge badge--proposal">Proposal</span></div><div class="card__body"><ul class="check">' +
      (keys.length ? keys.map((k) => { const f = fdef(k), ok = !C.isEmpty(v[k]) && !S.errors[k]; return '<li>' + ic(ok ? 'success' : 'info', ok ? 'done' : 'todo', 14) + '<a href="#" data-goto="' + k + '">' + esc(f.l) + '</a></li>'; }).join('') : '<li class="sel-note">Nothing beyond the stage date.</li>') + '</ul></div></div>' +
      '<div class="card"><div class="card__head"><h2>Attachments (' + site.files.length + ')</h2><span class="badge badge--proposal">Proposal</span></div><div class="card__body"><a href="#/site/' + site.id + '?tab=related">View all in Related tab</a></div></div>';
  }

  function relatedHTML(site) {
    const certT = D.stages(site.rt).filter((s) => s.id === 'cert')[0].att;
    const groups = [['Data Block Approvals', ['DBA']], ['D064 Site Inspection Reports', ['D064']], ['D128 Commissioning Records', ['D128']], ['Certificates (' + certT.map((t) => t).join(' / ') + ')', certT], ['Site Photos', ['PHOTO']], ['Signed D141 PDFs', ['D141']]];
    return groups.map((g) => { const fl = site.files.filter((f) => g[1].indexOf(f.type) >= 0);
      return '<div class="card" style="margin:12px 16px"><div class="card__head"><span class="objicon" style="background:#8199af;width:24px;height:24px">' + ic('doc', '', 14) + '</span><h2 class="rl-head">' + esc(g[0]) + ' <span class="count">(' + fl.length + ')</span> ' + Companion.qbadges({ screen: 'related' }) + '</h2><span class="badge badge--proposal">Proposal - to be confirmed by owner</span><button class="btn btn--sm" data-upload="' + g[1][0] + '">Upload Files</button></div>' +
        (fl.length ? '<table class="tbl"><thead><tr><th>File name</th><th>Type</th><th>Added</th><th>Size</th><th></th></tr></thead><tbody>' + fl.map((f) => '<tr><td><a href="#" onclick="return false">' + esc(f.name) + '</a></td><td>' + esc(D.FILETYPES[f.type]) + '</td><td>' + C.fmtDate(f.added) + '</td><td>' + Math.round(f.size / 1024) + ' KB</td><td><button class="link-btn" data-rmfile="' + f.id + '">Remove</button></td></tr>').join('') + '</tbody></table>' : '<div class="empty">No files yet. Select Upload Files.</div>') + '</div>'; }).join('');
  }

  function renderSite(site) {
    const cur = C.currentStage(site); const st = stOf(site); const v = S.editing ? S.draft : site.v;
    const selIdx = st.findIndex((s) => s.id === S.stage); const selStatus = stageStatus(site, S.stage);
    const path = '<div class="path"><ul class="path__nav">' + st.map((s) => { const status = stageStatus(site, s.id); return '<li class="path__item is-' + status + (s.id === S.stage ? ' is-selected' : '') + '"><button data-stage="' + s.id + '" title="' + esc(s.label) + '">' + (status === 'complete' ? ic('check', '', 12) : '') + esc(s.label) + '</button><span class="sel-mark"></span></li>'; }).join('') + '</ul></div>';
    const btn = selStatus === 'complete' ? '<button class="btn" data-reopen>Reopen this stage</button>' : '<button class="btn btn--brand" data-complete>' + ic('check', '', 12) + ' Mark Status as Complete</button>';
    const summary = S.summary ? '<div class="errsum" role="alert">' + ic('error', '', 20) + '<div><h3>' + S.summary.title + '</h3><ul>' + S.summary.items.map((i) => '<li><a href="#" data-goto="' + i.k + '">' + esc(fdef(i.k).l) + '</a>: ' + esc(i.msg) + '</li>').join('') + '</ul></div></div>' : '';
    const hl = (l, val) => '<div><dt>' + l + '</dt><dd>' + (val || '&nbsp;') + '</dd></div>';
    return '<main class="page"><div class="crumb"><a href="#/sites">Sites</a> &rsaquo; ' + esc(v.code || '') + '</div>' +
      '<div class="hl"><div class="hl__top"><span class="objicon">' + ic('camera', '', 18) + '</span><div><div class="sub">Site</div><h1>' + esc(site.v.code) + '</h1></div><div class="hl__act"><button class="btn" data-edit="">Edit</button><button class="btn" data-delete>Delete</button></div></div>' +
      '<dl class="hl__fields" style="margin-bottom:0">' + hl('Record Type', site.rt + ' - ' + D.PROGRAMS[site.rt].name) + hl('Suburb', esc(site.v.suburb)) + hl('Region', esc(site.v.region)) + hl('Activity Type', actPill(site.v.activity)) + hl('Current Stage', cur ? esc(cur.label) : 'Enforcement live') + '</dl></div>' +
      '<div class="pathrow">' + path + btn + '</div>' +
      '<div class="rec"><div class="card"><div class="tabs" role="tablist"><button class="' + (S.tab === 'details' ? 'is-active' : '') + '" data-tab="details">Details</button><button class="' + (S.tab === 'related' ? 'is-active' : '') + '" data-tab="related">Related</button></div>' +
      (S.tab === 'details' ? summary + stageCardHTML(site) + D.SECTIONS.map((sec) => sectionHTML(sec, site)).join('') : relatedHTML(site)) + '</div><div id="side">' + checklistHTML(site) + '</div></div>' +
      (S.editing ? '<div class="foot-edit"><button class="btn" data-cancel>Cancel</button><button class="btn btn--brand" data-save>Save</button></div>' : '') + '</main>';
  }

  function render() {
    const app = $('#app'); const r = S.route;
    if (r.name === 'site' && byId(r.id)) app.innerHTML = renderSite(byId(r.id));
    else if (r.name === 'home') app.innerHTML = '<main class="page"><div class="card"><div class="card__body empty">Home is not part of this mockup. <a href="#/sites">Go to Sites</a></div></div></main>';
    else app.innerHTML = renderList();
    if (S.flash) { const el = $('[data-k="' + S.flash + '"]'); if (el) { el.scrollIntoView({ block: 'center' }); el.classList.add('flash'); const i = el.querySelector('input,select'); if (i && S.editing) i.focus(); } S.flash = null; }
  }

  /* ---------- editing ---------- */
  function startEdit(focusKey) {
    const site = byId(S.route.id); S.editing = true; S.draft = JSON.parse(JSON.stringify(site.v)); S.errors = {}; S.warns = {}; S.enforce = new Set(); S.summary = null;
    if (focusKey) { const f = fdef(focusKey); if (f && f.sec !== 'life') S.closed[f.sec] = false; S.flash = focusKey; }
    render(); if (focusKey) { const i = $('#f_' + focusKey); if (i) i.focus(); }
  }
  function cancelEdit(silent) { S.editing = false; S.draft = null; S.errors = {}; S.warns = {}; S.enforce = new Set(); S.summary = null; if (!silent) render(); }
  function runValidation(site, v, enforce) {
    S.enforce = enforce; const r = C.validateAll(v, site.rt, ctxFor(site)); S.errors = r.errors; S.warns = r.warns;
    const items = Object.keys(r.errors).map((k) => ({ k: k, msg: r.errors[k] }));
    return items;
  }
  function failUI(items, title) {
    S.summary = { title: title, items: items };
    const first = items[0]; const f = fdef(first.k);
    if (f.sec === 'life') { const sg = stOf(byId(S.route.id)).filter((s) => s.dates.indexOf(f.k) >= 0)[0]; if (sg) S.stage = sg.id; } else S.closed[f.sec] = false;
    S.flash = first.k; S.tab = 'details'; render();
    C.toast('Review the errors on this page. ' + items.length + ' field' + (items.length === 1 ? '' : 's') + ' need attention.', 'error');
  }
  function save() {
    const site = byId(S.route.id); const d = S.draft;
    if (d.schoolZone !== 'Yes') ['szAmStart', 'szAmEnd', 'szPmStart', 'szPmEnd'].forEach((k) => (d[k] = ''));
    const items = runValidation(site, d, C.alwaysReq());
    if (items.length) return failUI(items, 'Review the following fields');
    site.v = d; persist(); cancelEdit(true); render(); C.toast('Site <strong>' + esc(site.v.code) + '</strong> was saved.', 'success');
  }
  function complete() {
    const site = byId(S.route.id); const sts = stOf(site); const idx = sts.findIndex((s) => s.id === S.stage);
    const prev = sts.slice(0, idx).filter((s) => site.done.indexOf(s.id) < 0)[0];
    if (prev) { C.toast('Complete the earlier stage "' + esc(prev.label) + '" first (stages are completed in order - Proposal).', 'error'); S.stage = prev.id; render(); return; }
    if (!S.editing) { S.editing = true; S.draft = JSON.parse(JSON.stringify(site.v)); }
    const d = S.draft; if (d.schoolZone !== 'Yes') ['szAmStart', 'szAmEnd', 'szPmStart', 'szPmEnd'].forEach((k) => (d[k] = ''));
    const items = runValidation(site, d, C.union(C.alwaysReq(), C.reqKeys(site.rt, S.stage, d)));
    if (items.length) return failUI(items, 'Cannot complete "' + sts[idx].label + '". Review the following fields');
    site.v = d; site.done.push(S.stage); persist(); cancelEdit(true);
    const next = C.currentStage(site); S.stage = next ? next.id : S.stage; render();
    C.toast(esc(sts[idx].label) + ' marked complete.' + (next ? ' Current stage is now ' + esc(next.label) + '.' : ' Enforcement is live.'), 'success');
  }
  function reopen() {
    const site = byId(S.route.id); const sts = stOf(site); const idx = sts.findIndex((s) => s.id === S.stage);
    const later = sts.slice(idx).map((s) => s.id); site.done = site.done.filter((id) => later.indexOf(id) < 0); persist(); render();
    C.toast('Stage reopened. Later stages were reopened too.', 'info');
  }

  /* live validation of one field */
  function setFieldUI(k, site) {
    const el = $('.fe[data-k="' + k + '"]'); if (!el) return;
    const f = fdef(k); const err = S.errors[k] || '', warn = S.warns[k] || '';
    el.classList.toggle('has-error', !!err); el.classList.toggle('has-warn', !!warn && !err);
    const h = el.querySelector('.fe__help'); if (h) h.textContent = err || warn;
  }
  function validateLive(k) {
    const site = byId(S.route.id); const d = S.draft; const f = fdef(k);
    const affected = new Set([k]);
    if (f.t === 'date') D.fieldsFor(site.rt).filter((x) => x.t === 'date' && !x.plain).forEach((x) => affected.add(x.k));
    if (k === 'szAmStart') affected.add('szAmEnd'); if (k === 'szPmStart') affected.add('szPmEnd');
    if (k === 'code') affected.add('code');
    affected.forEach((a) => { const af = fdef(a); if (!af || (af.sz && d.schoolZone !== 'Yes')) { delete S.errors[a]; delete S.warns[a]; return; } const r = C.check(af, d[a], d, site.rt, ctxFor(site)); if (r.err) S.errors[a] = r.err; else delete S.errors[a]; if (r.warn) S.warns[a] = r.warn; else delete S.warns[a]; setFieldUI(a, site); });
    $('#side').innerHTML = checklistHTML(site);
  }
  function onInput(e) {
    const t = e.target; const k = t.dataset && t.dataset.k; if (!k || !S.editing) return;
    S.draft[k] = t.value;
    if (k === 'schoolZone') {
      ['szAmStart', 'szAmEnd', 'szPmStart', 'szPmEnd'].forEach((x) => { const i = $('#f_' + x); if (!i) return; i.disabled = t.value !== 'Yes'; if (t.value !== 'Yes') { i.value = ''; S.draft[x] = ''; delete S.errors[x]; setFieldUI(x); } const lab = i.parentNode.querySelector('.fe__label'); const old = lab.querySelector('.req'); if (old) old.remove(); if (t.value === 'Yes') lab.insertAdjacentHTML('afterbegin', '<abbr class="req" title="required">*</abbr>'); });
    }
    if (e.type === 'change' || t.tagName === 'SELECT') validateLive(k);
  }

  /* ---------- modals ---------- */
  function openNew() {
    const rts = D.ALL.map((p, i) => '<label style="display:flex;gap:10px;align-items:flex-start;padding:8px;border:1px solid #e5e5e5;border-radius:4px;margin-bottom:6px;cursor:pointer"><input type="radio" name="rt" value="' + p + '"' + (i === 0 ? ' checked' : '') + '><span><strong>' + p + '</strong> - ' + D.PROGRAMS[p].name + '<br><span class="sel-note">' + D.PROGRAMS[p].desc + '</span></span></label>').join('');
    C.modal({ title: 'New Site: Select a Record Type', body: '<fieldset style="border:0;padding:0;margin:0"><legend style="font-weight:700;margin-bottom:6px">Select a record type ' + Companion.qbadges({ screen: 'new' }) + '</legend>' + rts + '</fieldset>', footer: '<button class="btn" data-mclose2>Cancel</button><button class="btn btn--brand" id="rtNext">Next</button>' });
    $('[data-mclose2]').onclick = C.closeModal;
    $('#rtNext').onclick = () => openNewForm($('input[name=rt]:checked').value);
  }
  function openNewForm(rt) {
    const mf = (k, extra) => { const f = fdef(k); return '<div class="fe fe--edit" data-k="' + k + '"><label class="fe__label" for="n_' + k + '"><abbr class="req" title="required">*</abbr>' + esc(f.l) + Companion.qbadges({ field: k }) + '</label>' + (f.t === 'pick' ? '<select id="n_' + k + '" data-n="' + k + '"><option value="">--None--</option>' + D.opts(f, rt).map((o) => '<option>' + esc(o) + '</option>').join('') + '</select>' : '<input id="n_' + k + '" data-n="' + k + '" type="text" autocomplete="off">') + '<div class="fe__help"></div></div>'; };
    C.modal({ title: 'New Site: ' + rt, body: '<p class="sel-note" style="margin-bottom:8px">' + D.PROGRAMS[rt].name + '. Remaining details are captured stage by stage on the record.</p><div class="grid2" style="column-gap:16px">' + ['code', 'suburb', 'region', 'activity'].map(mf).join('') + '</div>', footer: '<button class="btn" id="nBack">Back</button><button class="btn btn--brand" id="nSave">Save</button>' });
    $('#nBack').onclick = openNew;
    const read = () => { const v = {}; $$('[data-n]').forEach((i) => (v[i.dataset.n] = i.value)); return v; };
    const val = (k, v) => { const r = C.check(fdef(k), v[k], v, rt, { sites: sites, id: null, enforce: new Set(D.ALWAYS_REQ) }); const el = $('.fe[data-k="' + k + '"]'); el.classList.toggle('has-error', !!r.err); el.querySelector('.fe__help').textContent = r.err; return r.err; };
    $$('[data-n]').forEach((i) => i.addEventListener('change', () => val(i.dataset.n, read())));
    $('#nSave').onclick = () => {
      const v = read(); const bad = ['code', 'suburb', 'region', 'activity'].filter((k) => val(k, v));
      if (bad.length) { C.toast('Review the errors on this page.', 'error'); return; }
      const site = { id: 's' + Date.now(), rt: rt, v: v, done: [], files: [] }; sites.push(site); persist(); C.closeModal();
      C.toast('Site <strong>' + esc(v.code) + '</strong> was created.', 'success'); go('#/site/' + site.id);
    };
  }
  function openUpload(type) {
    const site = byId(S.route.id); const types = Object.keys(D.FILETYPES).filter((t) => t === 'PHOTO' || t === 'DBA' || t === 'D064' || t === 'D128' || t === 'D141' || D.stages(site.rt).filter((s) => s.id === 'cert')[0].att.indexOf(t) >= 0);
    C.modal({ title: 'Upload Files', body: '<p class="sel-note" style="margin-bottom:8px">Mockup: only the file name and size are kept in this browser. <span class="badge badge--proposal">Proposal - to be confirmed by owner</span></p><div class="fe fe--edit" data-k="u_type"><label class="fe__label" for="u_type"><abbr class="req">*</abbr>Document type</label><select id="u_type">' + types.map((t) => '<option value="' + t + '"' + (t === type ? ' selected' : '') + '>' + esc(D.FILETYPES[t]) + '</option>').join('') + '</select></div><div class="fe fe--edit" data-k="u_file"><label class="fe__label" for="u_file"><abbr class="req">*</abbr>File</label><input id="u_file" type="file" style="height:auto;padding:6px"><div class="fe__help"></div></div>', footer: '<button class="btn" data-mclose2>Cancel</button><button class="btn btn--brand" id="uGo">Upload</button>' });
    $('[data-mclose2]').onclick = C.closeModal;
    $('#uGo').onclick = () => {
      const fi = $('#u_file').files[0]; const el = $('.fe[data-k="u_file"]');
      if (!fi) { el.classList.add('has-error'); el.querySelector('.fe__help').textContent = 'Select a file.'; return; }
      site.files.push({ id: 'f' + Date.now(), type: $('#u_type').value, name: fi.name, size: fi.size, added: new Date().toISOString().slice(0, 10) }); persist(); C.closeModal(); render(); C.toast('File <strong>' + esc(fi.name) + '</strong> was added.', 'success');
    };
  }

  /* ---------- events ---------- */
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-stage],[data-tab],[data-sec],[data-edit],[data-cancel],[data-save],[data-complete],[data-reopen],[data-upload],[data-rmfile],[data-goto],[data-delete],[data-sort],#newBtn'); if (!t) return;
    const site = S.route.name === 'site' ? byId(S.route.id) : null;
    if (t.id === 'newBtn') return openNew();
    if (t.dataset.sort) { S.dir = S.sort === t.dataset.sort ? -S.dir : 1; S.sort = t.dataset.sort; return render(); }
    if (!site) return;
    if (t.dataset.stage) { S.stage = t.dataset.stage; S.tab = 'details'; S.summary = null; render(); const sc = $('#stagecard'); if (sc) sc.scrollIntoView({ block: 'nearest' }); }
    else if (t.dataset.tab) { S.tab = t.dataset.tab; render(); }
    else if (t.dataset.sec) { S.closed[t.dataset.sec] = !S.closed[t.dataset.sec]; $('#sec_' + t.dataset.sec).classList.toggle('is-closed'); }
    else if (t.hasAttribute('data-edit')) { if (!S.editing) startEdit(t.dataset.edit || null); }
    else if (t.hasAttribute('data-cancel')) cancelEdit();
    else if (t.hasAttribute('data-save')) save();
    else if (t.hasAttribute('data-complete')) complete();
    else if (t.hasAttribute('data-reopen')) reopen();
    else if (t.dataset.upload) openUpload(t.dataset.upload);
    else if (t.dataset.rmfile) { site.files = site.files.filter((f) => f.id !== t.dataset.rmfile); persist(); render(); C.toast('File removed.', 'info'); }
    else if (t.dataset.goto) {
      e.preventDefault(); const k = t.dataset.goto; const f = fdef(k);
      if (f.sec === 'life') { const sg = stOf(site).filter((s) => s.dates.indexOf(k) >= 0)[0]; S.stage = sg.id; } else S.closed[f.sec] = false;
      S.tab = 'details'; S.flash = k; render(); const i = $('#f_' + k); if (i) i.focus();
    } else if (t.hasAttribute('data-delete')) {
      C.modal({ title: 'Delete Site', body: 'Are you sure you want to delete <strong>' + esc(site.v.code) + '</strong>?', footer: '<button class="btn" data-mclose2>Cancel</button><button class="btn btn--brand" id="delGo">Delete</button>' });
      $('[data-mclose2]').onclick = C.closeModal; $('#delGo').onclick = () => { sites.splice(sites.indexOf(site), 1); persist(); C.closeModal(); C.toast('Site was deleted.', 'success'); go('#/sites'); };
    }
  });
  document.addEventListener('input', onInput); document.addEventListener('change', onInput);
  document.addEventListener('change', (e) => { if (e.target.id === 'progFilter') { S.prog = e.target.value; render(); } if (e.target.id === 'listSearch') { S.search = e.target.value; render(); const i = $('#listSearch'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); } });
  document.addEventListener('keydown', (e) => { if (e.target.id === 'listSearch' && e.key === 'Enter') { S.search = e.target.value; render(); } });
  onRoute();
})();
