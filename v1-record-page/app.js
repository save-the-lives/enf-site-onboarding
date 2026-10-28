(function () {
  const D = window.D141, C = window.Core, BL = window.BL, esc = C.esc, ic = C.icon;
  const $ = C.$, $$ = C.$$;
  let sites = C.store.load();
  sites.forEach((s) => { ['lanes', 'programs', 'devices', 'certs', 'files'].forEach((k) => { s[k] = s[k] || []; }); });
  const S = { route: { name: 'list' }, editing: false, draft: null, errors: {}, warns: {}, enforce: new Set(), summary: null, stage: null, tab: 'details', closed: {}, search: '', sort: 'code', dir: 1, flash: null, sel: new Set(), propCols: false, rtab: 'programs', menu: null, follow: false };
  const persist = () => C.store.save(sites);
  const touch = (site) => { site.modified = new Date().toISOString(); persist(); };
  const byId = (id) => sites.filter((s) => s.id === id)[0];
  const stOf = (site) => D.stages(site.rt);
  const fdef = (k) => C.fmap[k];
  const TABS = [['details', 'Details'], ['assets', 'Additional Assets'], ['network', 'Network'], ['survey', 'Site Survey'], ['files', 'Files/Attachments'], ['history', 'Site History'], ['edit', 'Edit History'], ['cases', 'All Cases']];
  const SQ = { cases: '#f2a03a', certs: '#9b72e0', lanes: '#3ba755', prog: '#1b96ff', dev: '#e3447a' };

  document.getElementById('top').innerHTML = C.chrome({ active: 'sites', tabs: [
    { id: 'home', label: 'Home', href: '#/home' }, { id: 'sites', label: 'Sites', href: '#/sites' }, { id: 'reports', label: 'Reports', href: '#/home' },
    { id: 'hub', label: 'Prototype hub', href: '../index.html' }, { id: 'model', label: 'Data model', href: '../model/index.html' }, { id: 'st', label: 'Stories', href: '../backlog/index.html' }, { id: 'jr', label: 'Journey', href: '../journey/index.html' }, { id: 'q', label: 'Questions', href: '../questions/index.html' }] });
  C.footer({ variation: 'Variation 1: single-site record page', id: 'v1', hub: '../index.html', note: 'Guided single-site record page that follows the structure of the live CMCS Site page (owner-supplied screenshots): highlights, tabs, Site Location/Details/Coordinates sections and a right rail of child records. The lifecycle Path, stage sections and extra attachments are a proposed layer on top.',
    here: { crumbs: [['Prototype hub', '../index.html'], ['Variation 1: Guided single-site record page']], what: 'A Lightning list view and record page laid out like the live CMCS Site page (fake data), with a proposed lifecycle Path, stage-gated sections, child records (Lanes, Camera Program, Enforcement Devices, Certificates) and attachments.', prefer: 'One TPM is working a single site over weeks and needs stage gates, child records and attachments in one place.' },
    tour: [{ sel: '#newBtn', title: 'Create a site', text: 'New opens the record type picker, then the Site form.' }, { sel: '.layer', title: 'Proposed Path', text: 'Not on the live page today. Click a stage to see its date, checklist and attachments.' }, { sel: '[data-complete],[data-reopen]', title: 'Mark Status as Complete', text: 'Blocked until the stage required fields and child records are valid.' }, { sel: '.rail', title: 'Child records', text: 'Lanes, Camera Programs, Enforcement Devices and Certificates, as on the live page. Amber banners show what is missing.' }, { sel: '.mockbar', title: 'Stories and questions', text: 'Stories for this screen, Questions index and Mockup notes live here. Blue ? badges mark open questions in context.' }] });
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
      const sts = stOf(site);
      S.stage = r.p.stage && sts.some((s) => s.id === r.p.stage) ? r.p.stage : (prev.id === r.id && S.stage ? S.stage : (C.currentStage(site) || sts[sts.length - 1]).id);
      let tab = r.p.tab === 'related' ? 'files' : r.p.tab; S.tab = tab && TABS.some((t) => t[0] === tab) ? tab : (prev.id === r.id ? S.tab : 'details');
      S.flash = r.p.field || null;
      if (!r.p.stage && r.p.field) { const ds = sts.filter((x) => (x.dates || []).indexOf(r.p.field) >= 0)[0]; if (ds) S.stage = ds.id; }
      if (r.p.field && fdef(r.p.field)) { const f = fdef(r.p.field); if (f.sec === 'net') S.tab = 'network'; else if (f.sec !== 'life') { S.tab = 'details'; S.closed[f.sec] = false; } }
    }
    render();
    if (r.name === 'list' && r.p.new) openNew();
  }
  window.addEventListener('hashchange', onRoute);
  function closeAll() { C.closeModal(); C.closeDrawer(); Companion.closePop(); S.menu = null; }
  function go(h) { if (location.hash === h) onRoute(); else location.hash = h; }

  /* ---------- helpers ---------- */
  const ctxFor = (site) => ({ sites: sites, id: site.id, enforce: S.enforce, certs: site.certs });
  const reqSetFor = (site, v) => C.union(C.alwaysReq(), C.reqKeys(site.rt, S.stage, v));
  function fmtVal(f, val) { if (C.isEmpty(val)) return ''; return f.t === 'date' ? C.fmtDate(val) : esc(val); }
  const actPill = (a) => '<span class="pill act-' + String(a || '').toLowerCase() + '">' + esc(a || '') + '</span>';
  const stageStatus = (site, sid) => { if (site.done.indexOf(sid) >= 0) return 'complete'; const c = C.currentStage(site); return c && c.id === sid ? 'current' : 'incomplete'; };
  const stub = (what) => C.toast(esc(what) + ' exists on the live Site page but is not part of this mockup.', 'info');
  const qb = (at) => Companion.qbadges(at);

  /* ---------- LIST ---------- */
  const COLS = [['code', 'Site Number'], ['location', 'Location'], ['status', 'Status'], ['siteType', 'Site Type'], ['vendor', 'Vendor'], ['zone', 'Zone'], ['region', 'Region'], ['created', 'Created Date'], ['modified', 'Last Modified Date']];
  const colVal = (s, k) => k === 'location' ? D.locationOf(s.v) : k === 'created' ? s.created || '' : k === 'modified' ? s.modified || '' : k === 'rt' ? s.rt : k === 'stage' ? (C.currentStage(s) || { label: 'zz' }).label : String(s.v[k] || '');
  function renderList() {
    let rows = sites.filter((s) => !S.search || (JSON.stringify(s.v) + s.rt + D.locationOf(s.v)).toLowerCase().indexOf(S.search.toLowerCase()) >= 0);
    rows.sort((a, b) => (colVal(a, S.sort).toLowerCase() > colVal(b, S.sort).toLowerCase() ? 1 : -1) * S.dir);
    const th = (k, l, extra) => '<th><button class="th-sort" data-sort="' + k + '">' + l + (S.sort === k ? (S.dir > 0 ? ' ▲' : ' ▼') : '') + '</button>' + (extra || '') + '</th>';
    const sel = rows.filter((s) => S.sel.has(s.id)).length;
    const colQ = (k) => qb({ col: k });
    const prop = S.propCols;
    return '<main class="page"><div class="lv-head"><span class="objicon objicon--site" style="background:#e3447a">' + ic('building', '', 18) + '</span><div style="flex:1"><div class="sub">Sites</div><h1>All Sites ' + ic('chevrondown', '', 12) + ' <button class="iconbtn iconbtn--ghost" title="Pin this list view" aria-label="Pin this list view">' + ic('pin', '', 14) + '</button>' + qb({ screen: 'list' }) + '</h1><div class="subline">' + (sel ? sel + ' item' + (sel > 1 ? 's' : '') + ' selected' : rows.length + ' item' + (rows.length === 1 ? '' : 's')) + ' • Sorted by ' + esc((COLS.filter((c) => c[0] === S.sort)[0] || [0, S.sort])[1]) + ' • Filtered by All sites</div></div>' +
      '<div class="btn-group"><button class="btn" id="newBtn">New</button><button class="btn" data-stub="Import">Import</button><button class="btn" data-stub="Printable View">Printable View</button></div></div>' +
      '<div class="lv-tools"><input id="listSearch" type="search" placeholder="Search this list..." value="' + esc(S.search) + '" aria-label="Search this list"><span class="sp"></span>' +
      ['gear:List View Controls', 'table:Select Fields to Display (toggles the proposed Record Type and Current Stage columns)', 'refresh:Refresh', 'listv:Display as', 'pencil:Inline editing', 'chart:Show charts', 'filter:Filters'].map((x) => { const [i, t] = x.split(':'); return '<button class="iconbtn' + (i === 'table' && prop ? ' is-on' : '') + '" data-lvbtn="' + i + '" title="' + t + '" aria-label="' + t + '">' + ic(i, '', 14) + '</button>'; }).join('') + '</div>' +
      '<div class="lv-note">Layout and column order follow the live CMCS Sites list (owner-supplied screenshot). <span class="badge badge--screen">Owner-supplied (screenshot)</span> ' + (prop ? 'Proposed columns shown (Record Type, Current Stage).' : 'Proposed columns (Record Type, Current Stage) are hidden: use the table icon to show them.') + '</div>' +
      '<div class="lv-table"><table class="tbl"><thead><tr><th style="width:30px"><input type="checkbox" id="selAll" aria-label="Select all"' + (rows.length && sel === rows.length ? ' checked' : '') + '></th><th style="width:30px"></th>' +
      th('code', 'Site Number', colQ('code')) + th('location', 'Location') + th('status', 'Status', colQ('status')) + th('siteType', 'Site Type', colQ('siteType')) + th('vendor', 'Vendor', colQ('vendor')) + th('zone', 'Zone') + th('region', 'Region') + th('created', 'Created Date') + th('modified', 'Last Modified Date') +
      (prop ? th('rt', 'Record Type (proposed)') + th('stage', 'Current Stage (proposed)') : '') + '<th style="width:40px"></th></tr></thead><tbody>' +
      (rows.length ? rows.map((s, i) => { const c = C.currentStage(s); return '<tr><td><input type="checkbox" data-sel="' + s.id + '"' + (S.sel.has(s.id) ? ' checked' : '') + ' aria-label="Select ' + esc(s.v.code) + '"></td><td>' + (i + 1) + '</td><td><a href="#/site/' + s.id + '">' + esc(s.v.code) + '</a></td><td>' + esc(D.locationOf(s.v)) + '</td><td>' + esc(s.v.status || '') + '</td><td>' + esc(s.v.siteType || '') + '</td><td>' + (s.v.vendor ? '<a href="#" onclick="return false">' + esc(s.v.vendor) + '</a>' : '') + '</td><td>' + esc(s.v.zone || '') + '</td><td>' + esc(s.v.region || '') + '</td><td>' + C.fmtDateTime(s.created) + '</td><td>' + C.fmtDateTime(s.modified) + '</td>' +
        (prop ? '<td>' + s.rt + '</td><td>' + (c ? esc(c.label) : 'Enforcement live') + '</td>' : '') + '<td>' + rowMenu(s) + '</td></tr>'; }).join('') : '<tr><td colspan="14" class="empty">No sites match.</td></tr>') + '</tbody></table></div></main>';
  }
  function rowMenu(s) { const open = S.menu === 'row|' + s.id; return '<span class="relpos"><button class="iconbtn iconbtn--ghost" data-menu="row|' + s.id + '" aria-label="Show more actions for ' + esc(s.v.code) + '">' + ic('chevrondown', '', 12) + '</button>' + (open ? '<div class="menu"><button data-open="' + s.id + '">Edit</button><button data-delete="' + s.id + '">Delete</button></div>' : '') + '</span>'; }

  /* ---------- fields ---------- */
  function marks(f) {
    return (f.ex ? '<span class="edot" title="' + esc(f.ex) + ' (Owner-supplied screenshot)"></span>' : '') + (f.prop ? '<span class="pdot" title="Proposal: ' + esc(f.prop) + '"></span>' : '') + (f.info ? '<span class="tip" tabindex="0" data-tip="' + esc(f.info) + '">' + ic('info', '', 12) + '</span>' : '') + qb({ field: f.k });
  }
  function fieldHTML(f, site) {
    const v = S.editing ? S.draft : site.v; const val = v[f.k] == null ? '' : v[f.k];
    const reqd = reqSetFor(site, v).has(f.k);
    if (f.t === 'formula') return '<div class="fe fe--h" data-k="' + f.k + '"><span class="fe__label">' + esc(f.l) + marks(f) + '</span><div class="fe__ctrl"><span class="fe__static">' + esc(D.locationOf(v)) + '</span></div></div>';
    if (!S.editing) {
      const miss = C.isEmpty(val);
      let shown = miss ? (reqd ? 'Required for this stage' : '') : fmtVal(f, val);
      if (f.t === 'bool') shown = '<input type="checkbox" disabled' + (val === 'true' ? ' checked' : '') + ' aria-label="' + esc(f.l) + '">';
      else if (f.lookup && !miss) shown = '<a href="#" class="fe__link" onclick="return false">' + esc(val) + '</a>';
      return '<div class="fe fe--h" data-k="' + f.k + '"><span class="fe__label">' + esc(f.l) + marks(f) + '</span><div class="fe__ctrl"><span class="fe__static' + (miss && reqd ? ' is-missing' : '') + '">' + shown + '</span><button class="pencil" data-edit="' + f.k + '" title="Edit ' + esc(f.l) + '" aria-label="Edit ' + esc(f.l) + '">' + ic('pencil', '', 12) + '</button></div></div>';
    }
    const dis = f.sz && v.schoolZone !== 'Yes'; const err = S.errors[f.k], warn = S.warns[f.k];
    let inp;
    if (f.t === 'bool') inp = '<input id="f_' + f.k + '" data-k="' + f.k + '" type="checkbox"' + (val === 'true' ? ' checked' : '') + '>';
    else if (f.t === 'pick') inp = '<select id="f_' + f.k + '" data-k="' + f.k + '"' + (dis ? ' disabled' : '') + '><option value="">--None--</option>' + D.opts(f, site.rt, v).map((o) => '<option' + (o === val ? ' selected' : '') + '>' + esc(o) + '</option>').join('') + '</select>';
    else inp = '<input id="f_' + f.k + '" data-k="' + f.k + '" type="' + (f.t === 'date' ? 'date' : f.t === 'time' ? 'time' : 'text') + '" value="' + esc(val) + '"' + (dis ? ' disabled' : '') + (f.t === 'ip' ? ' placeholder="e.g. 192.0.2.10"' : f.t === 'latlng' ? ' placeholder="e.g. -33.8688, 151.2093"' : '') + ' autocomplete="off">';
    return '<div class="fe fe--h fe--edit' + (err ? ' has-error' : '') + (warn && !err ? ' has-warn' : '') + '" data-k="' + f.k + '"><label class="fe__label" for="f_' + f.k + '">' + (reqd && !dis ? '<abbr class="req" title="required">*</abbr>' : '') + esc(f.l) + marks(f) + '</label><div>' + inp + '</div><div class="fe__help" id="h_' + f.k + '">' + esc(err || warn || '') + '</div></div>';
  }
  const mapHTML = (site) => '<div class="mapbox" role="img" aria-label="Map placeholder">Map placeholder (no real map in the mockup)<br>' + esc(((S.editing ? S.draft : site.v).camGps) || 'no coordinates yet') + '</div><div class="sel-note" style="margin-bottom:6px">Google Maps: <a href="#" data-stub="Google Maps link">Click Here to view the Exact Location</a></div>';

  function sectionHTML(sec, site) {
    if (sec.tab) return '';
    if (sec.id === 'sys') return '<section class="sec' + (S.closed.sys ? ' is-closed' : '') + '" id="sec_sys"><button class="sec__h" data-sec="sys">' + ic('chevrondown', '', 12) + 'System Information</button><div class="sec__b"><div><div class="fe fe--h"><span class="fe__label">Created By</span><div class="fe__ctrl"><span class="fe__static"><a href="#" onclick="return false" class="fe__link">Test User</a>, ' + C.fmtDateTime(site.created) + '</span></div></div></div><div><div class="fe fe--h"><span class="fe__label">Last Modified By</span><div class="fe__ctrl"><span class="fe__static"><a href="#" onclick="return false" class="fe__link">Test User</a>, ' + C.fmtDateTime(site.modified) + '</span></div></div></div></div></section>';
    const fs = D.fieldsFor(site.rt).filter((f) => f.sec === sec.id); if (!fs.length) return '';
    let L, R;
    if (fs.some((f) => f.col)) { L = fs.filter((f) => f.col === 'L'); R = fs.filter((f) => f.col === 'R'); } else { const h = Math.ceil(fs.length / 2); L = fs.slice(0, h); R = fs.slice(h); }
    const col = (arr) => '<div>' + arr.map((f) => fieldHTML(f, site) + (f.map ? mapHTML(site) : '')).join('') + '</div>';
    return '<section class="sec' + (S.closed[sec.id] ? ' is-closed' : '') + (sec.live ? '' : ' sec--prop') + '" id="sec_' + sec.id + '"><button class="sec__h" data-sec="' + sec.id + '">' + ic('chevrondown', '', 12) + esc(sec.title) + (sec.live ? '' : ' <span class="badge badge--proposal">Proposal - not on the live page</span>') + qb({ sec: sec.id }) + '</button><div class="sec__b">' + col(L) + col(R) + '</div></section>';
  }

  /* ---------- stage card ---------- */
  function fileRow(f) { return '<div class="filerow">' + ic('doc', '', 14) + '<span class="nm">' + esc(f.name) + '</span><span class="sel-note">' + esc(D.FILETYPES[f.type]) + ' - ' + Math.round(f.size / 1024) + ' KB</span><button class="link-btn" data-rmfile="' + f.id + '">Remove</button></div>'; }
  function stageCardHTML(site) {
    const st = stOf(site).filter((s) => s.id === S.stage)[0]; const v = S.editing ? S.draft : site.v;
    const status = stageStatus(site, st.id);
    const jr = BL.JOURNEY.filter((j) => j.rec === st.id && j.kind === 'main')[0];
    const files = site.files.filter((f) => st.att.indexOf(f.type) >= 0);
    const req = Array.from(C.reqKeys(site.rt, st.id, v));
    const todo = req.filter((k) => C.isEmpty(v[k])).length; const cp = C.childProblems(site, st.id);
    const kindOf = { lane: 'lane', program: 'program', device: 'device', cert: 'cert' };
    return '<div class="stagecard" id="stagecard"><div class="stagecard__h"><h2>Stage: ' + esc(st.label) + qb({ stage: st.id }) + '</h2><span class="badge badge--proposal">Proposed layer</span><span class="badge ' + (status === 'complete' ? 'badge--ok' : status === 'current' ? 'badge--cur' : '') + '">' + (status === 'complete' ? 'Complete' : status === 'current' ? 'Current stage' : 'Not started') + '</span></div>' +
      '<div class="stagecard__b"><p style="margin-bottom:8px">' + esc(D.STAGE_HELP[st.id]) + '</p>' +
      (jr ? '<p class="sel-note" style="margin-bottom:8px">Journey step: <a href="../journey/index.html#' + jr.id + '">' + esc(jr.name) + '</a> (proposed name - to confirm)</p>' : '') +
      (st.dates.length ? '<div class="sec__b" style="padding:0">' + '<div>' + st.dates.map((k) => fieldHTML(fdef(k), site)).join('') + '</div><div></div></div>' : '') +
      '<p class="sel-note" style="margin:4px 0 8px">Required to complete (Proposal): ' + ((todo + cp.length) ? '<strong>' + (todo + cp.length) + ' item' + (todo + cp.length > 1 ? 's' : '') + ' still to do</strong>' : 'all done') + '</p>' +
      (cp.length ? '<ul class="check" style="margin-bottom:8px">' + cp.map((c) => '<li>' + ic('info', 'todo', 14) + '<span>' + esc(c.msg) + '</span> ' + (c.id ? '<button class="link-btn" data-child-edit="' + c.kind + '|' + c.id + '">Fix</button>' : '<button class="link-btn" data-child-new="' + c.kind + '" data-preset="' + esc((/type ([^.]+)\./.exec(c.msg) || [])[1] || (/Add a (\S+) Certificate/.exec(c.msg) || [])[1] || '') + '">Add</button>') + '</li>').join('') + '</ul>' : '') +
      (st.id === 'cert' ? '<table class="tbl lifetbl"><thead><tr><th>Certificate</th><th>Date</th></tr></thead><tbody>' + (site.certs.length ? site.certs.map((c) => '<tr><td>' + esc(c.type) + '</td><td>' + C.fmtDate(c.date) + '</td></tr>').join('') : '<tr><td colspan="2" class="sel-note">No certificates yet.</td></tr>') + '</tbody></table><p style="margin:6px 0"><button class="btn btn--sm" data-child-new="cert">New Certificate</button></p>' : '') +
      '<div class="dropzone"><div style="display:flex;align-items:center;gap:8px"><strong>Attachments</strong> <span class="badge badge--proposal">Proposal - to be confirmed by owner</span>' + qb({ stage: st.id, tab: 'files' }) + '<span style="flex:1"></span>' + (st.att.length ? '<button class="btn btn--sm" data-upload="' + st.att[0] + '">' + ic('upload', '', 12) + ' Upload Files</button>' : '') + '</div>' +
      (st.att.length ? '<div class="sel-note">Proposed: ' + st.att.map((t) => D.FILETYPES[t]).join(', ') + '</div>' + (files.length ? files.map(fileRow).join('') : '<div class="sel-note" style="padding:6px 0">No files yet.</div>') : '<div class="sel-note">No attachment proposed for this stage.</div>') + '</div>' +
      '<p style="margin-top:12px"><strong>All lifecycle dates</strong></p><table class="tbl lifetbl"><tbody>' + stOf(site).map((s) => '<tr><td><a href="#/site/' + site.id + '?stage=' + s.id + '">' + esc(s.label) + '</a></td><td>' + (s.dates.length ? s.dates.map((k) => esc(fdef(k).l.replace(/ Date.*$/, '')) + ': ' + (C.fmtDate(v[k]) || '-')).join(' &middot; ') : site.certs.filter((c) => (s.certs || []).indexOf(c.type) >= 0).map((c) => c.type + ': ' + C.fmtDate(c.date)).join(' &middot; ') || '-') + '</td><td>' + (stageStatus(site, s.id) === 'complete' ? ic('check', 'done', 12) : '') + '</td></tr>').join('') + '</tbody></table></div></div>';
  }

  /* ---------- right rail ---------- */
  const rowDD = (kind, id) => { const k = 'ch|' + kind + '|' + id; return '<span class="relpos"><button class="iconbtn iconbtn--ghost" data-menu="' + k + '" aria-label="Show more actions">' + ic('chevrondown', '', 12) + '</button>' + (S.menu === k ? '<div class="menu"><button data-child-edit="' + kind + '|' + id + '">Edit</button><button data-child-del="' + kind + '|' + id + '">Delete</button></div>' : '') + '</span>'; };
  function railHTML(site) {
    const v = S.editing ? S.draft : site.v; const st = stOf(site).filter((s) => s.id === S.stage)[0];
    const keys = Array.from(C.reqKeys(site.rt, st.id, v)); const cp = C.childProblems(site, st.id);
    const noDev = !site.devices.length, noLane = !site.lanes.length;
    const card = (colr, ico, title, count, newBtn, body, foot, q) => '<div class="card"><div class="card__head"><span class="sq" style="background:' + colr + '">' + ic(ico, '', 14) + '</span><h2>' + title + ' <span class="sel-note">(' + count + ')</span>' + (q || '') + '</h2>' + (newBtn || '') + '</div>' + body + (foot || '') + '</div>';
    const certs = card(SQ.certs, 'doc', 'Certificates', site.certs.length, '<button class="btn btn--sm" data-child-new="cert">New</button>', site.certs.length ? site.certs.map((c) => '<div class="lrow"><dl><dt>Type</dt><dd>' + esc(c.type) + '</dd><dt>Date</dt><dd>' + C.fmtDate(c.date) + '</dd></dl>' + rowDD('cert', c.id) + '</div>').join('') : '<div class="sel-note" style="padding:8px 12px">No certificates.</div>', '', qb({ child: 'cert' }));
    const lanes = card(SQ.lanes, 'listv', 'Lanes Configuration', site.lanes.length, '<button class="btn btn--sm" data-child-new="lane">New</button>', site.lanes.slice(0, 4).map((l) => '<div class="lrow"><dl><dt>Lane</dt><dd><a href="#" data-child-edit="lane|' + l.id + '">' + esc(l.no) + '</a></dd><dt>Status</dt><dd>' + esc(l.status) + '</dd><dt>Enforcement Types</dt><dd>' + esc(l.types) + '</dd><dt>Lane Configuration</dt><dd>' + esc(l.config || '') + '</dd></dl>' + rowDD('lane', l.id) + '</div>').join('') || '<div class="sel-note" style="padding:8px 12px">No lanes.</div>', site.lanes.length ? '<div class="card__foot"><a href="#" data-viewall="lane">View All</a></div>' : '', qb({ child: 'lane' }));
    const progBody = S.rtab === 'programs' ? (site.programs.length ? site.programs.map((p) => '<div class="lrow"><dl><dt>System Type</dt><dd>' + esc(p.systemType) + '</dd><dt>Sub Type</dt><dd>' + esc(p.subType || '') + '</dd><dt>Warranty Expiry</dt><dd>' + C.fmtDate(p.warranty) + '</dd></dl>' + rowDD('program', p.id) + '</div>').join('') : '<div class="sel-note" style="padding:8px 12px">No Camera Program.</div>') :
      (site.devices.length ? site.devices.map((d) => '<div class="lrow"><dl><dt>Device Type</dt><dd>' + esc(d.type) + '</dd><dt>Model</dt><dd>' + esc(d.model) + '</dd><dt>Serial Number</dt><dd>' + esc(d.serial) + '</dd></dl>' + rowDD('device', d.id) + '</div>').join('') : '<div class="sel-note" style="padding:8px 12px">No Enforcement Devices.</div>');
    const pd = '<div class="card"><div class="card__head"><span class="sq" style="background:' + SQ.prog + '">' + ic('camera', '', 14) + '</span><h2>Program &amp; Devices' + qb({ child: 'program' }) + '</h2><button class="btn btn--sm" data-child-new="' + (S.rtab === 'programs' ? 'program' : 'device') + '">New</button></div><div class="rtabs"><button class="' + (S.rtab === 'programs' ? 'is-active' : '') + '" data-rtab="programs">Camera Programs (' + site.programs.length + ')</button><button class="' + (S.rtab === 'devices' ? 'is-active' : '') + '" data-rtab="devices">Enforcement Devices (' + site.devices.length + ')</button></div>' + progBody + '</div>';
    const chk = '<div class="card" style="border-color:#dd7a01"><div class="card__head"><h2>Required for: ' + esc(st.label) + '</h2><span class="badge badge--proposal">Proposal</span></div><div class="card__body"><ul class="check">' +
      keys.map((k) => { const f = fdef(k), ok = !C.isEmpty(v[k]) && !S.errors[k]; return '<li>' + ic(ok ? 'success' : 'info', ok ? 'done' : 'todo', 14) + '<a href="#" data-goto="' + k + '">' + esc(f.l) + '</a></li>'; }).join('') +
      (cp.length ? cp.map((c) => '<li>' + ic('info', 'todo', 14) + '<span>' + esc(c.msg) + '</span></li>').join('') : (D.childReq(site.rt, st.id) && Object.keys(D.childReq(site.rt, st.id)).length ? '<li>' + ic('success', 'done', 14) + '<span>Child records complete</span></li>' : '')) + (keys.length || cp.length || Object.keys(D.childReq(site.rt, st.id)).length ? '' : '<li class="sel-note">Nothing beyond the stage date.</li>') + '</ul></div></div>';
    return '<div class="rail">' + chk +
      card(SQ.cases, 'info', 'Open Maintenance Cases', 0, '', '<div class="sel-note" style="padding:8px 12px">No open cases. <a href="#" data-stub="Maintenance Cases">(not in mockup)</a></div>', '', qb({ child: 'cases' })) + certs +
      (noLane ? '<div class="banner" role="alert">' + ic('warning', '', 16) + '<span><strong>Please add Lane(s).</strong> ' + qb({ banner: 'lane' }) + '</span></div>' : '') + lanes + pd +
      (noDev ? '<div class="banner" role="alert">' + ic('warning', '', 16) + '<span><strong>Please add Enforcement Device(s).</strong> <a href="#" data-moreinfo>More Information</a>' + qb({ banner: 'device' }) + '</span></div>' : '') + '</div>';
  }

  /* ---------- files / tabs ---------- */
  function filesHTML(site) {
    const certT = D.certTypes(site.rt);
    const groups = [['Data Block Approvals', ['DBA']], ['D064 Site Inspection Reports', ['D064']], ['D128 Commissioning Records', ['D128']], ['Certificates (' + certT.join(' / ') + ')', certT], ['Site Photos', ['PHOTO']], ['Signed D141 PDFs', ['D141']]];
    return '<div class="sel-note" style="padding:8px 16px">Files/Attachments is a tab on the live page. The groupings below are a Proposal. <span class="badge badge--proposal">Proposal - to be confirmed by owner</span> ' + qb({ tab: 'files' }) + '</div>' + groups.map((g) => { const fl = site.files.filter((f) => g[1].indexOf(f.type) >= 0);
      return '<div class="card" style="margin:12px 16px"><div class="card__head"><span class="objicon" style="background:#8199af;width:24px;height:24px">' + ic('doc', '', 14) + '</span><h2 class="rl-head">' + esc(g[0]) + ' <span class="count">(' + fl.length + ')</span></h2><span class="badge badge--proposal">Proposal - to be confirmed by owner</span><button class="btn btn--sm" data-upload="' + g[1][0] + '">Upload Files</button></div>' +
        (fl.length ? '<table class="tbl"><thead><tr><th>File name</th><th>Type</th><th>Added</th><th>Size</th><th></th></tr></thead><tbody>' + fl.map((f) => '<tr><td><a href="#" onclick="return false">' + esc(f.name) + '</a></td><td>' + esc(D.FILETYPES[f.type]) + '</td><td>' + C.fmtDate(f.added) + '</td><td>' + Math.round(f.size / 1024) + ' KB</td><td><button class="link-btn" data-rmfile="' + f.id + '">Remove</button></td></tr>').join('') + '</tbody></table>' : '<div class="empty">No files yet. Select Upload Files.</div>') + '</div>'; }).join('');
  }
  function networkHTML(site) { const sec = D.SECTIONS.filter((s) => s.id === 'net')[0]; return '<div class="sel-note" style="padding:8px 16px">Network is a tab on the live page; its current content is unknown. These D141 network columns are placed here as a Proposal. <span class="badge badge--proposal">Proposal</span> ' + qb({ tab: 'network' }) + '</div>' + sectionHTML(Object.assign({}, sec, { tab: null }), site); }
  function tabBody(site) {
    if (S.tab === 'details') return (S.summary ? summaryHTML() : '') + stageCardHTML(site) + D.SECTIONS.map((sec) => sectionHTML(sec, site)).join('');
    if (S.tab === 'files') return filesHTML(site);
    if (S.tab === 'network') return (S.summary ? summaryHTML() : '') + networkHTML(site);
    const t = TABS.filter((x) => x[0] === S.tab)[0];
    return '<div class="stub">' + esc(t[1]) + ' exists on the live Site page. Not part of this mockup. ' + qb({ tab: S.tab }) + '</div>';
  }
  function summaryHTML() { return '<div class="errsum" role="alert">' + ic('error', '', 20) + '<div><h3>' + S.summary.title + '</h3><ul>' + S.summary.items.map((i) => '<li>' + (i.k ? '<a href="#" data-goto="' + i.k + '">' + esc(fdef(i.k).l) + '</a>: ' : '') + esc(i.msg) + '</li>').join('') + '</ul></div></div>'; }

  function renderSite(site) {
    const cur = C.currentStage(site); const st = stOf(site); const v = S.editing ? S.draft : site.v;
    const selStatus = stageStatus(site, S.stage);
    const path = '<div class="path"><ul class="path__nav">' + st.map((s) => { const status = stageStatus(site, s.id); return '<li class="path__item is-' + status + (s.id === S.stage ? ' is-selected' : '') + '"><button data-stage="' + s.id + '" title="' + esc(s.label) + '">' + (status === 'complete' ? ic('check', '', 12) : '') + esc(s.label) + '</button><span class="sel-mark"></span></li>'; }).join('') + '</ul></div>';
    const btn = selStatus === 'complete' ? '<button class="btn" data-reopen>Reopen this stage</button>' : '<button class="btn btn--brand" data-complete>' + ic('check', '', 12) + ' Mark Status as Complete</button>';
    const hl = (l, val) => '<div><dt>' + l + '</dt><dd>' + (val || '&nbsp;') + '</dd></div>';
    return '<main class="page"><div class="crumb"><a href="#/sites">Sites</a> &rsaquo; ' + esc(site.v.code || '') + '</div>' +
      '<div class="hl"><div class="hl__top"><span class="objicon objicon--site" style="background:#e3447a">' + ic('building', '', 18) + '</span><div><div class="sub">Site</div><h1>' + esc(site.v.code) + '</h1></div><div class="hl__act">' +
      '<button class="btn" data-follow>' + (S.follow ? '✓ Following' : '+ Follow') + '</button><button class="btn" data-edit="">Edit</button><button class="btn" data-stub="New Maintenance Case">New Maintenance Case</button><button class="btn" data-stub="New Delegation">New Delegation</button><button class="btn" data-child-new="cert">New Certificate</button><button class="btn" data-stub="Log Session">Log Session</button><span class="relpos"><button class="btn" data-menu="rec" aria-label="More actions">' + ic('chevrondown', '', 12) + '</button>' + (S.menu === 'rec' ? '<div class="menu"><button data-delete="' + site.id + '">Delete</button></div>' : '') + '</span></div></div>' +
      '<dl class="hl__fields" style="margin-bottom:0">' + hl('Suburb', esc(site.v.suburb)) + hl('Status', esc(site.v.status)) + hl('Site Type', esc(site.v.siteType)) + hl('Directions Monitored', esc(site.v.dirMon)) + hl('Vendor', site.v.vendor ? '<a href="#" class="fe__link" onclick="return false">' + esc(site.v.vendor) + '</a>' : '') + '</dl></div>' +
      '<div class="layer"><div class="layer__h"><span class="badge badge--proposal">Proposed layer</span> Lifecycle Path: not on the live page today (Status is a plain field there). Record type <strong>' + site.rt + '</strong>, Activity <strong>' + esc(site.v.activity || '-') + '</strong>, ' + (cur ? 'current stage <strong>' + esc(cur.label) + '</strong>' : 'enforcement live') + qb({ journey: 'journey-order' }) + qb({ field: 'status' }) + '</div><div class="pathrow">' + path + btn + '</div></div>' +
      '<div class="rec"><div class="card"><div class="tabs" role="tablist">' + TABS.map((t) => '<button class="' + (S.tab === t[0] ? 'is-active' : '') + '" data-tab="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>' + tabBody(site) + '</div><div id="side">' + railHTML(site) + '</div></div>' +
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
  function runValidation(site, v, enforce) { S.enforce = enforce; const r = C.validateAll(v, site.rt, ctxFor(site)); S.errors = r.errors; S.warns = r.warns; return Object.keys(r.errors).map((k) => ({ k: k, msg: r.errors[k] })); }
  function failUI(items, title) {
    S.summary = { title: title, items: items };
    const first = items.filter((i) => i.k)[0];
    if (first) { const f = fdef(first.k); if (f.sec === 'life') { const sg = stOf(byId(S.route.id)).filter((s) => s.dates.indexOf(f.k) >= 0)[0]; if (sg) S.stage = sg.id; S.tab = 'details'; } else if (f.sec === 'net') S.tab = 'network'; else { S.closed[f.sec] = false; S.tab = 'details'; } S.flash = first.k; } else S.tab = 'details';
    render();
    C.toast('Review the errors on this page. ' + items.length + ' item' + (items.length === 1 ? '' : 's') + ' need attention.', 'error');
  }
  function save() {
    const site = byId(S.route.id); const d = S.draft;
    if (d.schoolZone !== 'Yes') ['szAmStart', 'szAmEnd', 'szPmStart', 'szPmEnd'].forEach((k) => (d[k] = ''));
    const items = runValidation(site, d, C.alwaysReq());
    if (items.length) return failUI(items, 'Review the following fields');
    site.v = d; touch(site); cancelEdit(true); render(); C.toast('Site <strong>' + esc(site.v.code) + '</strong> was saved.', 'success');
  }
  function complete() {
    const site = byId(S.route.id); const sts = stOf(site); const idx = sts.findIndex((s) => s.id === S.stage);
    const prev = sts.slice(0, idx).filter((s) => site.done.indexOf(s.id) < 0)[0];
    if (prev) { C.toast('Complete the earlier stage "' + esc(prev.label) + '" first (stages are completed in order - Proposal).', 'error'); S.stage = prev.id; render(); return; }
    if (!S.editing) { S.editing = true; S.draft = JSON.parse(JSON.stringify(site.v)); }
    const d = S.draft; if (d.schoolZone !== 'Yes') ['szAmStart', 'szAmEnd', 'szPmStart', 'szPmEnd'].forEach((k) => (d[k] = ''));
    const items = runValidation(site, d, C.union(C.alwaysReq(), C.reqKeys(site.rt, S.stage, d)));
    const cp = C.childProblems(site, S.stage).map((c) => ({ k: null, msg: c.msg }));
    const all = items.concat(cp);
    if (all.length) return failUI(all, 'Cannot complete "' + sts[idx].label + '". Review the following');
    site.v = d; site.done.push(S.stage); touch(site); cancelEdit(true);
    const next = C.currentStage(site); S.stage = next ? next.id : S.stage; render();
    C.toast(esc(sts[idx].label) + ' marked complete.' + (next ? ' Current stage is now ' + esc(next.label) + '.' : ' Enforcement is live.'), 'success');
  }
  function reopen() {
    const site = byId(S.route.id); const sts = stOf(site); const idx = sts.findIndex((s) => s.id === S.stage);
    const later = sts.slice(idx).map((s) => s.id); site.done = site.done.filter((id) => later.indexOf(id) < 0); touch(site); render();
    C.toast('Stage reopened. Later stages were reopened too.', 'info');
  }
  function setFieldUI(k) { const el = $('.fe[data-k="' + k + '"]'); if (!el) return; const err = S.errors[k] || '', warn = S.warns[k] || ''; el.classList.toggle('has-error', !!err); el.classList.toggle('has-warn', !!warn && !err); const h = el.querySelector('.fe__help'); if (h) h.textContent = err || warn; }
  function validateLive(k) {
    const site = byId(S.route.id); const d = S.draft; const f = fdef(k); const affected = new Set([k]);
    if (f.t === 'date') D.fieldsFor(site.rt).filter((x) => x.t === 'date' && !x.plain).forEach((x) => affected.add(x.k));
    if (k === 'szAmStart') affected.add('szAmEnd'); if (k === 'szPmStart') affected.add('szPmEnd'); if (k === 'activity') affected.add('status'); if (k === 'status') affected.add('status');
    affected.forEach((a) => { const af = fdef(a); if (!af || (af.sz && d.schoolZone !== 'Yes')) { delete S.errors[a]; delete S.warns[a]; return; } const r = C.check(af, d[a], d, site.rt, ctxFor(site)); if (r.err) S.errors[a] = r.err; else delete S.errors[a]; if (r.warn) S.warns[a] = r.warn; else delete S.warns[a]; setFieldUI(a); });
    $('#side').innerHTML = railHTML(site);
    const m = $('.mapbox'); if (m && k === 'camGps') m.lastChild.textContent = d.camGps || 'no coordinates yet';
  }
  function onInput(e) {
    const t = e.target; const k = t.dataset && t.dataset.k; if (!k || !S.editing || t.closest('#modal-root')) return;
    S.draft[k] = t.type === 'checkbox' ? (t.checked ? 'true' : '') : t.value;
    if (k === 'schoolZone') ['szAmStart', 'szAmEnd', 'szPmStart', 'szPmEnd'].forEach((x) => { const i = $('#f_' + x); if (!i) return; i.disabled = t.value !== 'Yes'; if (t.value !== 'Yes') { i.value = ''; S.draft[x] = ''; delete S.errors[x]; setFieldUI(x); } const lab = i.closest('.fe').querySelector('.fe__label'); const old = lab.querySelector('.req'); if (old) old.remove(); if (t.value === 'Yes') lab.insertAdjacentHTML('afterbegin', '<abbr class="req" title="required">*</abbr>'); });
    if (e.type === 'change' || t.tagName === 'SELECT') validateLive(k);
  }

  /* ---------- modals ---------- */
  function openNew() {
    const rts = D.ALL.map((p, i) => '<label style="display:flex;gap:10px;align-items:flex-start;padding:8px;border:1px solid #e5e5e5;border-radius:4px;margin-bottom:6px;cursor:pointer"><input type="radio" name="rt" value="' + p + '"' + (i === 0 ? ' checked' : '') + '><span><strong>' + p + '</strong> - ' + D.PROGRAMS[p].name + '<br><span class="sel-note">' + D.PROGRAMS[p].desc + '</span></span></label>').join('');
    C.modal({ title: 'New Site: Select a Record Type', body: '<p class="sel-note" style="margin-bottom:8px"><span class="badge badge--proposal">Proposal</span> Whether record types exist on Site today is an open question ' + qb({ screen: 'new' }) + '</p><fieldset style="border:0;padding:0;margin:0"><legend style="font-weight:700;margin-bottom:6px">Select a record type</legend>' + rts + '</fieldset>', footer: '<button class="btn" data-mclose2>Cancel</button><button class="btn btn--brand" id="rtNext">Next</button>' });
    $('[data-mclose2]').onclick = C.closeModal; $('#rtNext').onclick = () => openNewForm($('input[name=rt]:checked').value);
  }
  function openNewForm(rt) {
    const mf = (k) => { const f = fdef(k); const dflt = k === 'status' ? 'Active' : ''; return '<div class="fe fe--edit" data-k="' + k + '"><label class="fe__label" for="n_' + k + '">' + (D.ALWAYS_REQ.indexOf(k) >= 0 ? '<abbr class="req" title="required">*</abbr>' : '') + esc(f.l) + qb({ field: k }) + '</label>' + (f.t === 'pick' ? '<select id="n_' + k + '" data-n="' + k + '"><option value="">--None--</option>' + D.opts(f, rt, {}).map((o) => '<option' + (o === dflt ? ' selected' : '') + '>' + esc(o) + '</option>').join('') + '</select>' : '<input id="n_' + k + '" data-n="' + k + '" type="text" autocomplete="off" placeholder="' + (k === 'code' ? 'e.g. 0001' : '') + '">') + '<div class="fe__help"></div></div>'; };
    C.modal({ title: 'New Site: ' + rt, body: '<p class="sel-note" style="margin-bottom:8px">' + D.PROGRAMS[rt].name + '. Lanes, Camera Program, Enforcement Devices and Certificates are added on the record afterwards.</p><div class="grid2" style="column-gap:16px">' + ['code', 'suburb', 'region', 'status', 'activity'].map(mf).join('') + '</div>', footer: '<button class="btn" id="nBack">Back</button><button class="btn btn--brand" id="nSave">Save</button>' });
    $('#nBack').onclick = openNew;
    const read = () => { const v = {}; $$('[data-n]').forEach((i) => (v[i.dataset.n] = i.value)); return v; };
    const val = (k, v) => { const r = C.check(fdef(k), v[k], v, rt, { sites: sites, id: null, enforce: new Set(D.ALWAYS_REQ) }); const el = $('.fe[data-k="' + k + '"]'); el.classList.toggle('has-error', !!r.err); el.classList.toggle('has-warn', !!r.warn && !r.err); el.querySelector('.fe__help').textContent = r.err || r.warn; return r.err; };
    $$('[data-n]').forEach((i) => i.addEventListener('change', () => { const v = read(); val(i.dataset.n, v); if (i.dataset.n === 'activity') val('status', v); }));
    $('#nSave').onclick = () => {
      const v = read(); const bad = ['code', 'suburb', 'region', 'status', 'activity'].filter((k) => val(k, v));
      if (bad.length) { C.toast('Review the errors on this page.', 'error'); return; }
      const now = new Date().toISOString(); const site = { id: 's' + Date.now(), rt: rt, v: v, done: [], files: [], lanes: [], programs: [], devices: [], certs: [], created: now, modified: now }; sites.push(site); persist(); C.closeModal();
      C.toast('Site <strong>' + esc(v.code) + '</strong> was created.', 'success'); go('#/site/' + site.id);
    };
  }
  function openUpload(type) {
    const site = byId(S.route.id); const types = Object.keys(D.FILETYPES).filter((t) => ['PHOTO', 'DBA', 'D064', 'D128', 'D141'].indexOf(t) >= 0 || D.certTypes(site.rt).indexOf(t) >= 0);
    C.modal({ title: 'Upload Files', body: '<p class="sel-note" style="margin-bottom:8px">Mockup: only the file name and size are kept in this browser. <span class="badge badge--proposal">Proposal - to be confirmed by owner</span></p><div class="fe fe--edit" data-k="u_type"><label class="fe__label" for="u_type"><abbr class="req">*</abbr>Document type</label><select id="u_type">' + types.map((t) => '<option value="' + t + '"' + (t === type ? ' selected' : '') + '>' + esc(D.FILETYPES[t]) + '</option>').join('') + '</select></div><div class="fe fe--edit" data-k="u_file"><label class="fe__label" for="u_file"><abbr class="req">*</abbr>File</label><input id="u_file" type="file" style="height:auto;padding:6px"><div class="fe__help"></div></div>', footer: '<button class="btn" data-mclose2>Cancel</button><button class="btn btn--brand" id="uGo">Upload</button>' });
    $('[data-mclose2]').onclick = C.closeModal;
    $('#uGo').onclick = () => { const fi = $('#u_file').files[0]; const el = $('.fe[data-k="u_file"]'); if (!fi) { el.classList.add('has-error'); el.querySelector('.fe__help').textContent = 'Select a file.'; return; } site.files.push({ id: 'f' + Date.now(), type: $('#u_type').value, name: fi.name, size: fi.size, added: new Date().toISOString().slice(0, 10) }); touch(site); C.closeModal(); render(); C.toast('File <strong>' + esc(fi.name) + '</strong> was added.', 'success'); };
  }
  function openChild(kind, recId, preset) {
    const site = byId(S.route.id); const def = D.CH[kind]; const arr = site[D.CHKEY[kind]]; const rec = recId ? JSON.parse(JSON.stringify(arr.filter((x) => x.id === recId)[0])) : { id: 'c' + Date.now() };
    if (!recId && preset) { if (kind === 'device') rec.type = preset; if (kind === 'cert') rec.type = preset; }
    const inputs = () => def.fields.map((f) => { const val = rec[f.k] == null ? '' : rec[f.k]; const err = rec._e && rec._e[f.k];
      const inp = f.t === 'pick' ? '<select id="c_' + f.k + '" data-c="' + f.k + '"><option value="">--None--</option>' + D.opts(f, site.rt, rec).map((o) => '<option' + (o === val ? ' selected' : '') + '>' + esc(o) + '</option>').join('') + '</select>' : '<input id="c_' + f.k + '" data-c="' + f.k + '" type="' + (f.t === 'date' ? 'date' : 'text') + '" value="' + esc(val) + '" autocomplete="off">';
      return '<div class="fe fe--edit' + (err ? ' has-error' : '') + '" data-ck="' + f.k + '"><label class="fe__label" for="c_' + f.k + '">' + (f.req ? '<abbr class="req" title="required">*</abbr>' : '') + esc(f.l) + (f.prop ? '<span class="pdot" title="Proposal: ' + esc(f.prop) + '"></span>' : '') + '</label>' + inp + '<div class="fe__help">' + esc(err || '') + '</div></div>'; }).join('');
    const m = C.modal({ title: (recId ? 'Edit ' : 'New ') + def.label, body: '<p class="sel-note" style="margin-bottom:8px">' + def.label + ' is a child record of Site ' + esc(site.v.code) + ' (assumed to match the live model). ' + qb({ child: kind }) + '</p><div id="cbody">' + inputs() + '</div>', footer: '<button class="btn" data-mclose2>Cancel</button><button class="btn btn--brand" id="cSave">Save</button>' });
    const show = (errs) => { rec._e = errs; def.fields.forEach((f) => { const el = $('[data-ck="' + f.k + '"]'); if (!el) return; el.classList.toggle('has-error', !!errs[f.k]); el.querySelector('.fe__help').textContent = errs[f.k] || ''; }); };
    const read = () => { $$('[data-c]').forEach((i) => (rec[i.dataset.c] = i.value)); };
    $('[data-mclose2]').onclick = C.closeModal;
    $('#cbody').addEventListener('change', (e) => { const k = e.target.dataset.c; read(); if (kind === 'device' && k === 'type') { rec.model = ''; $('#cbody').innerHTML = inputs(); } const errs = C.checkChild(kind, rec, site, false); const one = {}; if (errs[k]) one[k] = errs[k]; if (k === 'type' || k === 'date') ['type', 'date'].forEach((x) => { if (errs[x]) one[x] = errs[x]; }); show(one); });
    $('#cSave').onclick = () => {
      read(); const errs = C.checkChild(kind, rec, site, true); show(errs);
      if (Object.keys(errs).length) { C.toast('Review the errors on this page.', 'error'); return; }
      delete rec._e; if (recId) { arr[arr.findIndex((x) => x.id === recId)] = rec; } else arr.push(rec);
      touch(site); C.closeModal(); render(); C.toast(def.label + ' was ' + (recId ? 'saved' : 'created') + '.', 'success');
    };
  }
  function viewAll(kind) { const site = byId(S.route.id); const def = D.CH[kind]; C.modal({ title: def.plural, size: 'lg', body: '<table class="tbl"><thead><tr>' + def.fields.map((f) => '<th>' + esc(f.l) + '</th>').join('') + '</tr></thead><tbody>' + site[D.CHKEY[kind]].map((r) => '<tr>' + def.fields.map((f) => '<td>' + esc(f.t === 'date' ? C.fmtDate(r[f.k]) : r[f.k]) + '</td>').join('') + '</tr>').join('') + '</tbody></table>', footer: '<button class="btn" data-mclose2>Close</button>' }); $('[data-mclose2]').onclick = C.closeModal; }
  function moreInfo() { C.modal({ title: 'Please add Enforcement Device(s)', body: '<p>The live page shows this banner when a Site has no Enforcement Device. The validation rule behind it is not known. ' + qb({ banner: 'device' }) + '</p><p style="margin-top:8px"><strong>Assumption (Proposal):</strong> a Site needs one device per required type for its program: ' + D.DEVTYPES.FDSC.join(', ') + ' (FDSC), and similar for other programs. The lifecycle stage Camera Installed cannot be completed without them.</p>', footer: '<button class="btn" data-mclose2>Close</button>' }); $('[data-mclose2]').onclick = C.closeModal; }

  /* ---------- events ---------- */
  const SEL = '[data-stage],[data-tab],[data-sec],[data-edit],[data-cancel],[data-save],[data-complete],[data-reopen],[data-upload],[data-rmfile],[data-goto],[data-delete],[data-sort],[data-stub],[data-follow],[data-menu],[data-open],[data-child-new],[data-child-edit],[data-child-del],[data-viewall],[data-moreinfo],[data-rtab],[data-lvbtn],#newBtn';
  document.addEventListener('click', (e) => {
    const t = e.target.closest(SEL);
    if (!t) { if (S.menu) { S.menu = null; render(); } return; }
    if (t.id === 'newBtn') return openNew();
    if (t.dataset.stub) { e.preventDefault(); return stub(t.dataset.stub); }
    if (t.dataset.lvbtn) { if (t.dataset.lvbtn === 'table') { S.propCols = !S.propCols; return render(); } if (t.dataset.lvbtn === 'refresh') { sites = C.store.load(); sites.forEach((s) => ['lanes', 'programs', 'devices', 'certs', 'files'].forEach((k) => (s[k] = s[k] || []))); render(); return C.toast('List refreshed.', 'info', 2000); } return stub('This list view control'); }
    if (t.dataset.sort) { S.dir = S.sort === t.dataset.sort ? -S.dir : 1; S.sort = t.dataset.sort; return render(); }
    if (t.dataset.menu) { e.stopPropagation(); S.menu = S.menu === t.dataset.menu ? null : t.dataset.menu; return render(); }
    if (t.dataset.open) { S.menu = null; go('#/site/' + t.dataset.open); setTimeout(() => startEdit(null), 50); return; }
    if (t.dataset.delete && S.route.name === 'list') { S.menu = null; return confirmDelete(byId(t.dataset.delete)); }
    const site = S.route.name === 'site' ? byId(S.route.id) : null; if (!site) return;
    S.menu = S.menu && !t.dataset.menu ? null : S.menu;
    if (t.dataset.stage) { S.stage = t.dataset.stage; S.tab = 'details'; S.summary = null; render(); const sc = $('#stagecard'); if (sc) sc.scrollIntoView({ block: 'nearest' }); }
    else if (t.dataset.tab) { S.tab = t.dataset.tab; render(); }
    else if (t.dataset.sec) { S.closed[t.dataset.sec] = !S.closed[t.dataset.sec]; $('#sec_' + t.dataset.sec).classList.toggle('is-closed'); }
    else if (t.hasAttribute('data-follow')) { S.follow = !S.follow; render(); }
    else if (t.hasAttribute('data-edit')) { if (!S.editing) startEdit(t.dataset.edit || null); }
    else if (t.hasAttribute('data-cancel')) cancelEdit();
    else if (t.hasAttribute('data-save')) save();
    else if (t.hasAttribute('data-complete')) complete();
    else if (t.hasAttribute('data-reopen')) reopen();
    else if (t.dataset.upload) openUpload(t.dataset.upload);
    else if (t.dataset.childNew !== undefined) { S.menu = null; openChild(t.dataset.childNew, null, t.dataset.preset); }
    else if (t.dataset.childEdit) { e.preventDefault(); S.menu = null; const [k, id] = t.dataset.childEdit.split('|'); openChild(k, id); }
    else if (t.dataset.childDel) { const [k, id] = t.dataset.childDel.split('|'); S.menu = null; site[D.CHKEY[k]] = site[D.CHKEY[k]].filter((x) => x.id !== id); touch(site); render(); C.toast(D.CH[k].label + ' was deleted.', 'success'); }
    else if (t.dataset.viewall) { e.preventDefault(); viewAll(t.dataset.viewall); }
    else if (t.hasAttribute('data-moreinfo')) { e.preventDefault(); moreInfo(); }
    else if (t.dataset.rtab) { S.rtab = t.dataset.rtab; render(); }
    else if (t.dataset.rmfile) { site.files = site.files.filter((f) => f.id !== t.dataset.rmfile); touch(site); render(); C.toast('File removed.', 'info'); }
    else if (t.dataset.goto) {
      e.preventDefault(); const k = t.dataset.goto; const f = fdef(k);
      if (f.sec === 'life') { const sg = stOf(site).filter((s) => s.dates.indexOf(k) >= 0)[0]; S.stage = sg.id; S.tab = 'details'; } else if (f.sec === 'net') S.tab = 'network'; else { S.closed[f.sec] = false; S.tab = 'details'; }
      S.flash = k; render(); const i = $('#f_' + k); if (i) i.focus();
    } else if (t.hasAttribute('data-delete')) confirmDelete(site);
  });
  function confirmDelete(site) { C.modal({ title: 'Delete Site', body: 'Are you sure you want to delete <strong>' + esc(site.v.code) + '</strong>?', footer: '<button class="btn" data-mclose2>Cancel</button><button class="btn btn--brand" id="delGo">Delete</button>' }); $('[data-mclose2]').onclick = C.closeModal; $('#delGo').onclick = () => { sites.splice(sites.indexOf(site), 1); persist(); C.closeModal(); C.toast('Site was deleted.', 'success'); go('#/sites'); }; }
  document.addEventListener('input', onInput); document.addEventListener('change', onInput);
  document.addEventListener('change', (e) => { if (e.target.id === 'selAll') { $$('[data-sel]').forEach((i) => (e.target.checked ? S.sel.add(i.dataset.sel) : S.sel.delete(i.dataset.sel))); render(); } else if (e.target.dataset && e.target.dataset.sel) { e.target.checked ? S.sel.add(e.target.dataset.sel) : S.sel.delete(e.target.dataset.sel); render(); } else if (e.target.id === 'listSearch') { S.search = e.target.value; render(); const i = $('#listSearch'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); } });
  document.addEventListener('keydown', (e) => { if (e.target.id === 'listSearch' && e.key === 'Enter') { S.search = e.target.value; render(); } });
  onRoute();
})();
