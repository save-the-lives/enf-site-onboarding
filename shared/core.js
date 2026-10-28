/* Shared helpers: icons, store, validation, toast, modal, Lightning chrome, mockup notes drawer. */
(function () {
  const D = window.D141;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (x) => String(x == null ? '' : x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const isEmpty = (x) => x === undefined || x === null || String(x).trim() === '';

  /* ---------- icons (hand drawn, filled, 24 grid) ---------- */
  const P = {
    chevrondown: 'M5.6 8.3l6.4 6.4 6.4-6.4 1.4 1.4L12 17.5 4.2 9.7z',
    check: 'M9 16.2L4.8 12l-1.4 1.4L9 19 21.6 6.4 20.2 5z',
    close: 'M19 6.4L17.6 5 12 10.6 6.4 5 5 6.4l5.6 5.6L5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6z',
    plus: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z',
    search: 'M15.5 14h-.8l-.3-.3A6.5 6.5 0 1 0 14 15.5l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z',
    pencil: 'M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zM20.7 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
    warning: 'M12 2L1 21h22L12 2zm1 15h-2v-2h2v2zm0-4h-2V9h2v4z',
    info: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
    error: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
    success: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 15l-5-5 1.4-1.4L10 14.2l7.6-7.6L19 8z',
    bell: 'M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6V11c0-3.1-1.6-5.6-4.5-6.3V4a1.5 1.5 0 0 0-3 0v.7C7.6 5.4 6 7.9 6 11v5l-2 2v1h16v-1l-2-2z',
    gear: 'M18.4 13a7.8 7.8 0 0 0 0-2l2.1-1.6-2-3.4-2.5 1a7.3 7.3 0 0 0-1.7-1L14 3h-4l-.4 3a7.3 7.3 0 0 0-1.7 1l-2.5-1-2 3.4L5.6 11a7.8 7.8 0 0 0 0 2l-2.1 1.6 2 3.4 2.5-1a7.3 7.3 0 0 0 1.7 1l.4 3h4l.4-3a7.3 7.3 0 0 0 1.7-1l2.5 1 2-3.4L18.4 13zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z',
    question: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 17h-2v-2h2v2zm2.1-7.8l-.9.9c-.7.7-1.2 1.3-1.2 2.9h-2v-.5c0-1.1.5-2.1 1.2-2.8l1.2-1.3c.4-.3.6-.8.6-1.4 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.2 1.8-4 4-4s4 1.8 4 4c0 .9-.4 1.7-.9 2.2z',
    star: 'M12 17.3l6.2 3.7-1.6-7L22 9.2l-7.2-.6L12 2 9.2 8.6 2 9.2 7.4 14l-1.6 7z',
    upload: 'M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z',
    doc: 'M6 2h8l6 6v14H6V2zm7 1.5V9h5.5L13 3.5z',
    camera: 'M9 3L7.2 5H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.2L15 3H9zm3 14a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z',
    delete: 'M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
    building: 'M4 21V3h10v6h6v12h-7v-4h-2v4H4zm2-14v2h2V7H6zm0 4v2h2v-2H6zm0 4v2h2v-2H6zm4-8v2h2V7h-2zm0 4v2h2v-2h-2zm6 0v2h2v-2h-2zm0 4v2h2v-2h-2z',
    table: 'M3 4h18v16H3V4zm2 2v3h6V6H5zm8 0v3h6V6h-6zM5 11v3h6v-3H5zm8 0v3h6v-3h-6zM5 16v2h6v-2H5zm8 0v2h6v-2h-6z',
    refresh: 'M17.65 6.35A8 8 0 1 0 19.74 14h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z',
    chart: 'M4 20V4h2v14h14v2H4zm4-4v-5h3v5H8zm5 0V8h3v8h-3zm5 0v-3h2v3h-2z',
    filter: 'M3 5h18l-7 8v6l-4-2v-4L3 5z',
    pin: 'M14 3l7 7-2 1-3-1-3.5 3.5.5 4-2 1-3-3-4.5 4.5-1-1L8.5 14l-3-3 1-2 4-.5L14 5l-1-3z',
    listv: 'M3 5h18v2H3V5zm0 6h18v2H3v-2zm0 6h18v2H3v-2z',
    arrowleft: 'M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20z'
  };
  function icon(n, cls, size) {
    size = size || 16;
    if (n === 'waffle') {
      let r = '';
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) r += '<rect x="' + (3 + j * 7) + '" y="' + (3 + i * 7) + '" width="4" height="4" rx="1"/>';
      return '<svg class="ic ' + (cls || '') + '" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + r + '</svg>';
    }
    return '<svg class="ic ' + (cls || '') + '" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="' + P[n] + '"/></svg>';
  }

  const fmtDate = (s) => { if (!s) return ''; const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s); return m ? m[3] + '/' + m[2] + '/' + m[1] : s; };

  /* ---------- store ---------- */
  const KEY = 'enf-d141-mock-v3';
  const store = {
    load() { try { const j = localStorage.getItem(KEY); if (j) return JSON.parse(j); } catch (e) {} return D.seed(); },
    save(sites) { try { localStorage.setItem(KEY, JSON.stringify(sites)); } catch (e) {} },
    reset() { try { localStorage.removeItem(KEY); } catch (e) {} }
  };

  /* ---------- validation ---------- */
  const NSW = { lat: [-37.6, -28.1], lng: [140.9, 153.7] };
  const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
  const NUM = /^-?\d+(\.\d+)?$/;
  const fmap = {}; D.F.forEach((f) => (fmap[f.k] = f));
  const fmtDateTime = (iso) => { if (!iso) return ''; const d = new Date(iso); if (isNaN(d)) return ''; let h = d.getHours(); const m = String(d.getMinutes()).padStart(2, '0'); const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear() + ', ' + h + ':' + m + ' ' + ap; };

  /* date order groups: Installed, DBA, D064, D128, Certificates (child records), Warning, Infringing */
  function dateGroups(rt) { const g = [['dInstalled'], ['dDBA'], ['dD064'], ['dD128'], ['#cert']]; if (rt !== 'ASC') g.push(['dWarn']); g.push(['dInf']); return g; }
  const shortL = (l) => l.replace(/ Date.*$/, '');
  function valsOf(k, v, certs) { return k === '#cert' ? (certs || []).map((c) => c.date).filter((x) => !isEmpty(x)) : (isEmpty(v[k]) ? [] : [v[k]]); }
  const gname = (k) => (k === '#cert' ? 'Certificate' : shortL(fmap[k].l));

  function check(f, val, v, rt, ctx) {
    ctx = ctx || {};
    const enforce = ctx.enforce || new Set();
    const s = isEmpty(val) ? '' : String(val).trim();
    let err = '', warn = '';
    if (f.t === 'bool' || f.t === 'formula') return { err, warn };
    if (s === '') {
      if (enforce.has(f.k)) err = f.sz ? 'Required when School Zone is Yes.' : 'Complete this field.';
      return { err, warn };
    }
    if (f.max && s.length > f.max) return { err: 'Maximum ' + f.max + ' characters.', warn };
    switch (f.t) {
      case 'code':
        if (!/^(\d{4}|TEST-\d{4})$/.test(s)) err = 'Site No must be 4 digits, e.g. 0001 (the mockup also accepts TEST-0001 for fake data).';
        else if ((ctx.sites || []).some((x) => x.id !== ctx.id && String(x.v.code || '').toLowerCase() === s.toLowerCase())) err = 'Duplicate value: another Site already has Site No ' + s + '.';
        break;
      case 'pick':
        if (D.opts(f, rt, v).indexOf(s) < 0) err = 'Select a value from the list. "' + s + '" is not a valid option.';
        else if (f.k === 'status' && v.activity === 'Decommission' && s === 'Active') warn = 'Activity Type is Decommission but Status is Active. Decommissioned statuses are expected (Proposal).';
        else if (f.k === 'status' && v.activity && v.activity !== 'Decommission' && /^Decommissioned/.test(s)) warn = 'Status is ' + s + ' but Activity Type is ' + v.activity + ' (Proposal).';
        break;
      case 'int':
        if (!/^\d+$/.test(s) || +s < 1 || +s > 99) err = 'Enter a whole number between 1 and 99.';
        break;
      case 'latlng': {
        const m = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/.exec(s);
        if (!m) { err = 'Enter as "latitude, longitude", e.g. -33.8688, 151.2093.'; break; }
        const la = +m[1], lo = +m[2];
        if (Math.abs(la) > 90) err = 'Latitude must be between -90 and 90.';
        else if (Math.abs(lo) > 180) err = 'Longitude must be between -180 and 180.';
        else if (la < NSW.lat[0] || la > NSW.lat[1] || lo < NSW.lng[0] || lo > NSW.lng[1]) warn = 'Outside the usual NSW range (lat ' + NSW.lat[0] + ' to ' + NSW.lat[1] + ', long ' + NSW.lng[0] + ' to ' + NSW.lng[1] + '). Check the sign and digits before saving.';
        else if (!/\.\d{4,}\s*,/.test(s) || !/\.\d{4,}\s*$/.test(s)) warn = 'Fewer than 4 decimal places. Is this precise enough? (Proposal)';
        break;
      }
      case 'ip':
        if (!IPV4.test(s)) err = 'Enter a valid IPv4 address, e.g. 192.0.2.10 (four numbers 0 to 255 separated by dots).';
        break;
      case 'date': {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || isNaN(Date.parse(s))) { err = 'Enter a valid date.'; break; }
        if (f.plain) break;
        const groups = dateGroups(rt); let gi = -1; groups.forEach((g, i) => { if (g.indexOf(f.k) >= 0) gi = i; });
        if (gi < 0) break;
        let worst = null;
        for (let i = 0; i < gi; i++) groups[i].forEach((pk) => valsOf(pk, v, ctx.certs).forEach((pv) => { if (pv > s && (!worst || pv > worst.d)) worst = { d: pv, k: pk }; }));
        if (worst) { err = shortL(f.l) + ' date cannot be earlier than ' + gname(worst.k) + ' (' + fmtDate(worst.d) + ').'; break; }
        let late = null;
        for (let i = gi + 1; i < groups.length; i++) groups[i].forEach((pk) => valsOf(pk, v, ctx.certs).forEach((pv) => { if (pv < s && (!late || pv < late.d)) late = { d: pv, k: pk }; }));
        if (late && !ctx.noLater) err = shortL(f.l) + ' date cannot be later than ' + gname(late.k) + ' (' + fmtDate(late.d) + ').';
        break;
      }
      case 'time':
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(s)) err = 'Enter a valid time (HH:MM).';
        else if (f.k === 'szAmEnd' && !isEmpty(v.szAmStart) && s <= v.szAmStart) err = 'Morning end must be after morning start.';
        else if (f.k === 'szPmEnd' && !isEmpty(v.szPmStart) && s <= v.szPmStart) err = 'Afternoon end must be after afternoon start.';
        break;
    }
    return { err, warn };
  }

  function applicable(rt, v) { return D.fieldsFor(rt).filter((f) => !(f.sz && v.schoolZone !== 'Yes')); }
  function reqKeys(rt, stageId, v) {
    const st = D.stages(rt).filter((s) => s.id === stageId)[0];
    let ks = (D.STAGE_REQ[stageId] || []).slice();
    if (st) ks = ks.concat(st.dates);
    if (stageId === 'd064' && v.schoolZone === 'Yes') ks = ks.concat(['szAmStart', 'szAmEnd', 'szPmStart', 'szPmEnd']);
    const ok = new Set(D.fieldsFor(rt).map((f) => f.k));
    return new Set(ks.filter((k) => ok.has(k)));
  }
  function alwaysReq() { return new Set(D.ALWAYS_REQ); }
  function union(a, b) { const s = new Set(a); b.forEach((x) => s.add(x)); return s; }
  function validateAll(v, rt, ctx) {
    const errors = {}, warns = {};
    applicable(rt, v).forEach((f) => { const r = check(f, v[f.k], v, rt, ctx); if (r.err) errors[f.k] = r.err; if (r.warn) warns[f.k] = r.warn; });
    return { errors, warns };
  }

  /* ---- child records (Lane, Camera Program, Enforcement Device, Certificate) ---- */
  function checkChild(kind, rec, site, enforce) {
    const rt = site.rt, defs = D.CH[kind].fields, errs = {}; const sv = site.v;
    defs.forEach((f) => {
      const val = rec[f.k]; const empty = isEmpty(val);
      if (empty) { if (f.req && enforce !== false) errs[f.k] = 'Complete this field.'; return; }
      const r = check(Object.assign({}, f), val, rec, rt, { certs: site.certs, noLater: false });
      if (r.err) errs[f.k] = r.err;
    });
    const arr = site[D.CHKEY[kind]] || [];
    const others = arr.filter((x) => x.id !== rec.id);
    if (kind === 'lane' && !errs.no && !isEmpty(rec.no) && others.some((x) => x.no === rec.no)) errs.no = 'Lane ' + rec.no + ' already exists on this Site.';
    if (kind === 'device' && !errs.type && !isEmpty(rec.type) && others.some((x) => x.type === rec.type)) errs.type = 'This Site already has a ' + rec.type + ' (one per type - Proposal).';
    if (kind === 'program' && others.length) errs.systemType = 'A Site has one Camera Program in this mockup (Proposal).';
    if (kind === 'cert') {
      if (!errs.type && !isEmpty(rec.type) && others.some((x) => x.type === rec.type)) errs.type = 'A ' + rec.type + ' Certificate already exists on this Site.';
      if (!errs.date && !isEmpty(rec.date)) {
        const d = rec.date;
        if (!isEmpty(sv.dD128) && d < sv.dD128) errs.date = 'Certificate date cannot be earlier than D128 Network Commissioned (' + fmtDate(sv.dD128) + ').';
        else if (!isEmpty(sv.dWarn) && d > sv.dWarn) errs.date = 'Certificate date cannot be later than Warning Letter Start (' + fmtDate(sv.dWarn) + ').';
        else if (!isEmpty(sv.dInf) && d > sv.dInf) errs.date = 'Certificate date cannot be later than Infringing (' + fmtDate(sv.dInf) + ').';
      }
    }
    return errs;
  }
  /* required child records for a stage; returns [{kind,msg}] */
  function childProblems(site, stageId) {
    const need = D.childReq(site.rt, stageId), out = [];
    if (need.lane && (site.lanes || []).length < need.lane) out.push({ kind: 'lane', msg: 'Add at least ' + need.lane + ' Lane (a Site needs lane configuration).' });
    if (need.program && (site.programs || []).length < need.program) out.push({ kind: 'program', msg: 'Add a Camera Program.' });
    if (need.device) need.device.forEach((t) => { if (!(site.devices || []).some((d) => d.type === t)) out.push({ kind: 'device', msg: 'Add an Enforcement Device of type ' + t + '.' }); });
    if (need.cert) need.cert.forEach((t) => { if (!(site.certs || []).some((c) => c.type === t)) out.push({ kind: 'cert', msg: 'Add a ' + t + ' Certificate.' }); });
    Object.keys(D.CHKEY).forEach((kind) => (site[D.CHKEY[kind]] || []).forEach((rec) => { const e = checkChild(kind, rec, site, true); const m = Object.keys(e); if (m.length) out.push({ kind: kind, id: rec.id, msg: D.CH[kind].label + ' record has errors: ' + e[m[0]] }); }));
    return out;
  }

  function currentStage(site) { const st = D.stages(site.rt); for (const s of st) if (site.done.indexOf(s.id) < 0) return s; return null; }

  /* ---------- toast ---------- */
  function toast(msg, type, ms) {
    let host = $('#toasts'); if (!host) { host = document.createElement('div'); host.id = 'toasts'; host.className = 'toast-host'; document.body.appendChild(host); }
    type = type || 'success';
    const t = document.createElement('div');
    t.className = 'toast toast--' + type; t.setAttribute('role', 'alert');
    const ttl = { success: 'Success', error: 'Error', warning: 'Warning', info: 'Info' }[type];
    t.innerHTML = icon(type === 'error' ? 'error' : type === 'warning' ? 'warning' : type === 'info' ? 'info' : 'success', 'toast__icon', 20) +
      '<div class="toast__body"><span class="sr">' + ttl + '</span>' + msg + '</div><button class="toast__close" aria-label="Close">' + icon('close', '', 14) + '</button>';
    t.querySelector('button').onclick = () => t.remove();
    host.appendChild(t);
    setTimeout(() => t.remove(), ms || (type === 'error' ? 9000 : 5000));
  }

  /* ---------- modal ---------- */
  function modal(opts) { // {title, body, footer, onClose, size}
    closeModal();
    const m = document.createElement('div'); m.id = 'modal-root';
    m.innerHTML = '<section class="modal ' + (opts.size || '') + '" role="dialog" aria-modal="true" aria-label="' + esc(opts.title) + '"><header class="modal__head"><button class="modal__close" data-mclose aria-label="Close">' + icon('close', '', 16) + '</button><h2>' + esc(opts.title) + '</h2></header><div class="modal__body">' + opts.body + '</div><footer class="modal__foot">' + (opts.footer || '') + '</footer></section><div class="backdrop"></div>';
    document.body.appendChild(m);
    m.querySelector('[data-mclose]').onclick = closeModal;
    m._onClose = opts.onClose;
    return m;
  }
  function closeModal() { const m = $('#modal-root'); if (m) { m.remove(); } }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal(); closeDrawer(); } });

  /* ---------- Lightning chrome ---------- */
  function chrome(cfg) { // {tabs:[{id,label,href}], active, rootHref}
    const tabs = cfg.tabs.map((t) => '<li class="nav__item' + (t.id === cfg.active ? ' is-active' : '') + '"><a href="' + t.href + '">' + t.label + '</a></li>').join('');
    return '<header class="gh"><div class="gh__left"><button class="gh__launcher" title="App Launcher" aria-label="App Launcher">' + icon('waffle', '', 20) + '</button></div>' +
      '<div class="gh__search"><div class="search">' + icon('search', 'search__ic', 14) + '<input id="gsearch" type="search" placeholder="Search Sites and more..." aria-label="Search"></div></div>' +
      '<div class="gh__right"><button class="gh__btn" title="Favorites">' + icon('star', '', 16) + '</button><button class="gh__btn" title="Setup">' + icon('gear', '', 16) + '</button><button class="gh__btn" id="helpBtn" title="Help and guide" aria-label="Help and guide">' + icon('question', '', 16) + '</button><button class="gh__btn" title="Notifications">' + icon('bell', '', 16) + '</button><span class="avatar" title="Mock user">TP</span></div></header>' +
      '<nav class="nav"><div class="nav__app"><span class="nav__appicon">' + icon('camera', '', 16) + '</span><span class="nav__appname">CMCS <small>(mockup)</small></span></div><ul class="nav__list">' + tabs + '</ul></nav>';
  }

  const NOTES = {
    screenshot: [
      'Site is an EXISTING object in CMCS: we extend it, we do not create it. Object icon is a pink building tile.',
      'Sites list view: "All Sites"; buttons New, Import, Printable View; search; columns Site Number, Location, Status, Site Type, Vendor (lookup), Zone, Region, Created Date, Last Modified Date; row action menu; dates d/m/yyyy, h:mm am/pm.',
      'Existing Status values: Active, Decommissioned, Decommissioned - Camera removed, Decommissioned - Camera upgraded. Existing Site Type values seen: Red Light Camera, MOB.',
      'Site record page: actions Follow, Edit, New Maintenance Case, New Delegation, New Certificate, Log Session; highlights Suburb, Status, Site Type, Directions Monitored, Vendor; NO Path component today.',
      'Tabs: Details, Additional Assets, Network, Site Survey, Files/Attachments, Site History, Edit History, All Cases.',
      'Details sections: Site Location, Site Details, Site Coordinates (combined Lat, Long fields), more below.',
      'Right rail: Open Maintenance Cases, Certificates, Lanes Configuration, Program & Devices (Camera Programs, Enforcement Devices) with amber "Please add Lane(s)." and "Please add Enforcement Device(s)." banners.',
      'Live model already has child objects: Lanes, Camera Programs, Enforcement Devices, Certificates, Maintenance Cases, Delegations, Sessions.'
    ],
    owner: [
      'Five camera programs (FDSC, RLSC, BPES, ASC, ODES) with different fields. (Whether these are record types on Site or Camera Program values is now an open question, Q-027.)',
      'Core fields and the program differences listed in the D141 template (owner-confirmed data model).',
      'Lifecycle dates as stages: Camera Installed, Data Block Approval, D064 Site Inspection, D128 Network Commissioned, Certification, Warning Letter Start (not ASC), Infringing.',
      'Certification dates: FDSC/RLSC S137 + S138; BPES/ASC S138 only; ODES S137A + S138. S137/S138 are labels only.',
      'Activity types: Commission, Decommission, Refurbish.',
      'Dropdown values from the Validation data sheet (Region, Zone, Direction, Mode, Environment, Lanes, Flash, Sensor, Yes/No/N/A, Speed limit, SMD, CRD, DMD).',
      'Validation to capture at point of entry: lat/long ranges, IPv4, picklists only, date order, required fields per stage, school zone times only when School Zone = Yes.',
      'Current process: Excel D141 filed in Objective, PDF emailed to unit managers, re-keyed into CMCS by another business unit.'
    ],
    proposal: [
      'Which fields are required at which stage (STAGE_REQ). Plausible default only.',
      'Attachment types: D064 Site Inspection Report, S137/S138/S137A Certificates, D128 Commissioning Record, Data Block Approval, Site Photos, signed D141 PDF. Whether any are mandatory to complete a stage (not enforced here).',
      'Camera Code format (3 to 20 chars, letters/numbers/hyphen) and uniqueness check.',
      'NSW sanity range as a non-blocking warning, plus a 4-decimal-place hint on coordinates.',
      'End time after start time for school zone windows; Zone Number 1 to 99.',
      'Free-text fields where no list was supplied: Road No., UBD Map, LGC, Nearest Court, Camera Road Side, Headed Lane Configuration, Camera Model, Vendor, Vendor Pay Type, ASC Zone, TCS ID.',
      'Stages must be completed in order; reopening a stage reopens later ones.',
      'Decommission and Refurbish use the same stages as Commission.',
      'Three variations of the capture experience (record page, bulk grid, guided flow) are all proposals; the owner does not require the spreadsheet layout to be copied.',
      'Mapping of each D141 column to a live Site/child field (see the Data model page); child records (Lane, Camera Program, Enforcement Device, Certificate) used for TPM entry.',
      'Lifecycle Path, stage sections, attachments tab, Network tab content, Activity Type field: all layered on top of the live page.',
      'Mockup chrome: CMCS app name, sample data, placeholder map.'
    ],
    open: [
      'Real unit manager list (who is notified when a site is saved or reaches a stage).',
      'Further attachments beyond the proposed set.',
      'Confirm the meaning of Data Block Approval and D128 Network Commissioned.',
      'Do completed stages lock their fields? Who may reopen?',
      'Should the signed D141 PDF still be produced (generated from the record) or retired?'
    ]
  };
  function notesHTML(extra) {
    const ul = (a) => '<ul>' + a.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>';
    return '<h3>This variation</h3><p>' + esc(extra || '') + '</p>' +
      '<h3><span class="badge badge--screen">Owner-supplied (screenshot)</span></h3>' + ul(NOTES.screenshot) + '<h3><span class="badge badge--owner">Owner-stated</span></h3>' + ul(NOTES.owner) +
      '<h3><span class="badge badge--proposal">Proposal</span></h3>' + ul(NOTES.proposal) +
      '<h3><span class="badge badge--open">Open questions</span></h3>' + ul(NOTES.open) +
      '<h3>Not built</h3><p>Real Salesforce metadata, CMCS integration, file storage (file names only are kept), security, Objective, PDF generation. All data is fake.</p>';
  }
  function openDrawer(extra) {
    closeDrawer();
    const d = document.createElement('aside'); d.id = 'drawer'; d.className = 'drawer'; d.setAttribute('aria-label', 'Mockup notes');
    d.innerHTML = '<header><h2>Mockup notes</h2><button class="modal__close" data-dclose aria-label="Close">' + icon('close', '', 16) + '</button></header><div class="drawer__body">' + notesHTML(extra) + '</div>';
    document.body.appendChild(d); d.querySelector('[data-dclose]').onclick = closeDrawer;
  }
  function closeDrawer() { const d = $('#drawer'); if (d) d.remove(); }

  function footer(cfg) { // {variation, hub, note, here, tour, id}
    PAGE = { tour: cfg.tour || null, id: cfg.id || cfg.variation, hub: cfg.hub, root: cfg.hub.replace(/index\.html$/, '') };
    if (cfg.here) hereBar(cfg.here);
    if (cfg.tour && cfg.tourAuto) setTimeout(() => startTour(false), 600);
    const f = document.createElement('div'); f.className = 'mockbar';
    f.innerHTML = '<span><strong>MOCKUP</strong> - not Salesforce - fake data</span><span class="mockbar__sp"></span><span>' + esc(cfg.variation) + '</span><a href="#" data-notes>Mockup notes</a><a href="#" data-reset>Reset sample data</a>';
    document.body.appendChild(f);
    f.querySelector('[data-notes]').onclick = (e) => { e.preventDefault(); openDrawer(cfg.note); };
    f.querySelector('[data-reset]').onclick = (e) => { e.preventDefault(); store.reset(); toast('Sample data reset.', 'info'); setTimeout(() => location.reload(), 600); };
  }


  /* ---------- help, "you are here", tour ---------- */
  let PAGE = { tour: null, id: 'page', hub: 'index.html' };
  const GLOSS = [
    ['CMCS', 'The Salesforce instance where camera site data is held. Another business unit currently re-keys the D141 into it.'],
    ['D141', 'The Excel template a Technical Project Manager fills in per camera site today. This prototype replaces it with direct, validated capture.'],
    ['TPM', 'Technical Project Manager: commissions, decommissions or refurbishes camera sites.'],
    ['Program / record type', 'FDSC Fixed Digital Speed Camera; RLSC Red Light Speed Camera; BPES Bus Priority Enforcement System; ASC Average Speed Camera; ODES Over Dimension Enforcement System. In Salesforce each is a record type on the Site object, and the layout changes per type.'],
    ['Path', 'The chevron bar across the top of a Salesforce record showing the lifecycle stages. Click a stage to see its section.'],
    ['D064, D128', 'Form numbers used for the Site Inspection (D064) and Network Commissioned (D128) stages. D128 meaning is an open question.'],
    ['Data Block Approval', 'A lifecycle date in the template. Its exact meaning is an open question.'],
    ['S137, S138, S137A', 'Sections of legislation, shown only as labels on certification dates. Not explained here.'],
    ['Objective', 'The document system where the D141 is filed today.'],
    ['SMD, DMD, CRD', 'Speed Measurement Device, Dimensional Measurement Device, Camera Recording Device.'],
    ['Activity type', 'Commission, Decommission or Refurbish.']
  ];
  function helpHTML() {
    const root = PAGE.root || '';
    const map = [['Prototype hub', 'index.html', 'Start here: what this is and which variation to use.'], ['1 Record page', 'v1-record-page/index.html', 'One site at a time, with the lifecycle Path.'], ['2 Bulk grid', 'v2-bulk-grid/index.html', 'Many sites at once with a bulk action bar.'], ['3 Guided flow', 'v3-guided-flow/index.html', 'Step-by-step wizard to create a site.'], ['Data model', 'model/index.html', 'Site plus child records and the D141-to-live mapping.'], ['Stories', 'backlog/index.html', 'User stories, acceptance criteria, Excel export.'], ['Journey', 'journey/index.html', 'Site planned to enforcement live, with branches.'], ['Questions', 'questions/index.html', 'Index of open questions (also shown in context).']];
    return '<h3>Where am I?</h3><ul>' + map.map((m) => '<li><a href="' + root + m[1] + '">' + m[0] + '</a> - ' + m[2] + '</li>').join('') + '</ul>' +
      '<h3>Legend</h3><ul class="legend"><li><span class="badge badge--proposal">Proposal</span> not stated by the owner; a best guess to confirm</li><li><span class="badge badge--owner">Owner-stated</span> confirmed in the owner\'s brief</li><li><span class="qb" style="margin:0">?</span> an open question at this exact spot; click for the question, why it matters and the current assumption</li><li><span class="pdot" style="margin:0"></span> amber dot: a Proposal on a field (hover for detail)</li><li><span class="badge badge--screen">Owner-supplied (screenshot)</span> structure copied from the live CMCS screenshots (fake values only)</li><li><span class="edot" style="margin:0"></span> blue-green dot: field already exists on the live Site</li><li><abbr class="req">*</abbr> required (for the selected stage)</li></ul>' +
      '<h3>Tour</h3><p><button class="btn btn--brand btn--sm" data-starttour>' + 'Take a quick tour of this page' + '</button></p>' +
      '<h3>Glossary</h3><dl>' + GLOSS.map((g) => '<dt><strong>' + esc(g[0]) + '</strong></dt><dd style="margin:0 0 6px">' + esc(g[1]) + '</dd>').join('') + '</dl>';
  }
  function openHelp() {
    closeDrawer(); const d = document.createElement('aside'); d.id = 'drawer'; d.className = 'drawer'; d.setAttribute('aria-label', 'Help and guide');
    d.innerHTML = '<header><h2>Help and guide</h2><button class="modal__close" data-dclose aria-label="Close">' + icon('close', '', 16) + '</button></header><div class="drawer__body">' + helpHTML() + '</div>';
    document.body.appendChild(d); d.querySelector('[data-dclose]').onclick = closeDrawer;
    d.querySelector('[data-starttour]').onclick = () => { closeDrawer(); startTour(true); };
  }
  function hereBar(h) {
    const nav = $('.nav'); if (!nav) return;
    const b = document.createElement('div'); b.className = 'here';
    b.innerHTML = '<div class="here__row"><nav aria-label="Breadcrumb" class="here__crumbs">' + h.crumbs.map((c, i) => (c[1] ? '<a href="' + c[1] + '">' + esc(c[0]) + '</a>' : '<span class="here__cur" aria-current="page">' + esc(c[0]) + '</span>') + (i < h.crumbs.length - 1 ? ' <span class="here__sep">&rsaquo;</span> ' : '')).join('') + '</nav><span class="badge badge--cur">You are here</span><span style="flex:1"></span>' +
      (h.what ? '<button class="link-btn" id="whatBtn" aria-expanded="false">What am I looking at?</button>' : '') + (h.crumbs.length > 1 ? '<a href="' + PAGE.hub + '" class="here__back">' + icon('arrowleft', '', 12) + ' Back to hub</a>' : '') + '</div>' +
      (h.what ? '<div class="here__what" id="whatBox" hidden><p><strong>Purpose.</strong> ' + esc(h.what) + '</p><p><strong>Prefer this when.</strong> ' + esc(h.prefer) + '</p></div>' : '');
    nav.after(b);
    const w = b.querySelector('#whatBtn'); if (w) { const box = b.querySelector('#whatBox'); const seen = (function () { try { return localStorage.getItem('enf-what-' + PAGE.id); } catch (e) { return null; } })(); if (!seen) { box.hidden = false; w.setAttribute('aria-expanded', 'true'); } w.onclick = () => { box.hidden = !box.hidden; w.setAttribute('aria-expanded', String(!box.hidden)); try { localStorage.setItem('enf-what-' + PAGE.id, '1'); } catch (e) {} }; }
  }
  function startTour(force) {
    const steps = (PAGE.tour || []).filter((s) => $(s.sel)); if (!steps.length) { toast('No tour for this page. Open Help for the map and glossary.', 'info'); return; }
    const key = 'enf-tour-' + PAGE.id;
    if (!force) { try { if (localStorage.getItem(key)) return; } catch (e) {} }
    let i = 0; const ov = document.createElement('div'); ov.className = 'tour'; document.body.appendChild(ov);
    const end = () => { ov.remove(); document.querySelectorAll('.tour-pop,.tour-spot').forEach((n) => n.remove()); try { localStorage.setItem(key, '1'); } catch (e) {} };
    const show = () => {
      document.querySelectorAll('.tour-pop,.tour-spot').forEach((n) => n.remove()); const s = steps[i]; const el = $(s.sel); el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect(); const spot = document.createElement('div'); spot.className = 'tour-spot'; spot.style.cssText = 'top:' + (r.top - 4) + 'px;left:' + (r.left - 4) + 'px;width:' + (r.width + 8) + 'px;height:' + (r.height + 8) + 'px'; document.body.appendChild(spot);
      const pop = document.createElement('div'); pop.className = 'tour-pop'; pop.setAttribute('role', 'dialog');
      pop.innerHTML = '<div class="tour-pop__h">' + esc(s.title) + '<span class="sel-note" style="float:right">' + (i + 1) + ' of ' + steps.length + '</span></div><div class="tour-pop__b">' + esc(s.text) + '</div><div class="tour-pop__f"><button class="link-btn" data-skip>Skip tour</button><span style="flex:1"></span>' + (i ? '<button class="btn btn--sm" data-back>Back</button>' : '') + '<button class="btn btn--brand btn--sm" data-nx>' + (i === steps.length - 1 ? 'Done' : 'Next') + '</button></div>';
      document.body.appendChild(pop);
      const top = r.bottom + 12 + 160 > window.innerHeight ? Math.max(8, r.top - 172) : r.bottom + 12; pop.style.top = top + 'px'; pop.style.left = Math.max(8, Math.min(r.left, window.innerWidth - 360)) + 'px';
      pop.querySelector('[data-skip]').onclick = end; pop.querySelector('[data-nx]').onclick = () => { if (i === steps.length - 1) end(); else { i++; show(); } }; const bk = pop.querySelector('[data-back]'); if (bk) bk.onclick = () => { i--; show(); };
    };
    show();
  }
  document.addEventListener('click', (e) => { if (e.target.closest('#helpBtn')) openHelp(); });

  window.Core = { $, $$, esc, isEmpty, icon, fmtDate, fmtDateTime, checkChild, childProblems, store, check, validateAll, applicable, reqKeys, alwaysReq, union, currentStage, toast, modal, closeModal, startTour, openHelp, chrome, footer, openDrawer, closeDrawer, fmap, NSW };
})();
