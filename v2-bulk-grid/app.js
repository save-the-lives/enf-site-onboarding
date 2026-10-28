(function () {
  const D = window.D141, C = window.Core, BL = window.BL, esc = C.esc, ic = C.icon, $ = C.$, $$ = C.$$;
  const sites = C.store.load();
  const persist = () => C.store.save(sites);
  const G = { rt: 'FDSC', stage: 'd064', sel: new Set(), draft: {}, attempted: new Set(), errs: {}, flashCol: null };
  const fdef = (k) => C.fmap[k];

  document.getElementById('top').innerHTML = C.chrome({ active: 'grid', tabs: [
    { id: 'grid', label: 'Bulk Site Entry', href: 'index.html' }, { id: 'sites', label: 'Sites (record page)', href: '../v1-record-page/index.html' },
    { id: 'hub', label: 'Prototype hub', href: '../index.html' }, { id: 'model', label: 'Data model', href: '../model/index.html' }, { id: 'st', label: 'Stories', href: '../backlog/index.html' }, { id: 'jr', label: 'Journey', href: '../journey/index.html' }, { id: 'q', label: 'Questions', href: '../questions/index.html' }] });
  C.footer({id:'v2', here:{crumbs:[['Prototype hub', '../index.html'],['Variation 2: Bulk grid entry']],what:'An editable grid of several sites of one record type. Each cell is validated as you leave it, each row shows its error count, and a bulk action bar appears when rows are selected.',prefer:'The same few fields change across many sites (a batch of installs, a decommission run) and speed matters more than per-site guidance.'}, tour:[{sel:'.rt-tabs',title:'Record type',text:'Columns differ per program, so one record type is shown at a time.'},{sel:'#gstage',title:'Working stage',text:'Chooses which stage columns and required fields are shown and validated.'},{sel:'.grid tbody tr',title:'Edit in place',text:'Type in a cell, then leave it. Invalid values are outlined with a message.'},{sel:'#validateAll',title:'Validate all',text:'Checks every row for the working stage. Select rows to reveal the bulk action bar.'}],  variation: 'Variation 2: bulk grid entry', hub: '../index.html', note: 'Editable grid for several sites of one record type, with per-cell and per-row validation and a bulk action bar (set activity, mark stage complete, set value).' });
  Companion.init({ t: 'grid', base: '../', ctx: () => ({ stage: G.stage }) });

  const p = new URLSearchParams(location.search);
  if (p.get('stage') && D.STAGE_REQ[p.get('stage')] !== undefined) G.stage = p.get('stage');
  if (p.get('field') && fdef(p.get('field'))) { G.flashCol = p.get('field'); const f = fdef(p.get('field')); if (f.p.indexOf(G.rt) < 0) G.rt = f.p[0]; }

  const rowsFor = () => sites.filter((s) => s.rt === G.rt);
  const dv = (s) => (G.draft[s.id] = G.draft[s.id] || JSON.parse(JSON.stringify(s.v)));
  const stageObj = (s) => D.stages(s.rt).filter((x) => x.id === G.stage)[0];
  const stageStatus = (s) => { const st = stageObj(s); if (!st) return ''; if (s.done.indexOf(st.id) >= 0) return 'Complete'; const c = C.currentStage(s); return c && c.id === st.id ? 'Current' : 'Not started'; };
  function cols() {
    const rt = G.rt; const st = D.stages(rt).filter((x) => x.id === G.stage)[0] || D.stages(rt)[0];
    let ks = ['code', 'activity', 'status', 'region'].concat(D.STAGE_REQ[st.id] || [], st.dates);
    if (st.id === 'd064') ks = ks.concat(['szAmStart', 'szAmEnd', 'szPmStart', 'szPmEnd']);
    if (G.flashCol && ks.indexOf(G.flashCol) < 0) ks.push(G.flashCol);
    const ok = new Set(D.fieldsFor(rt).map((f) => f.k)); const seen = new Set();
    return ks.filter((k) => ok.has(k) && !seen.has(k) && seen.add(k)).map(fdef);
  }
  function enforceFor(s) { return G.attempted.has(s.id) ? C.union(C.alwaysReq(), C.reqKeys(s.rt, G.stage, dv(s))) : C.alwaysReq(); }
  function validateRow(s) { const v = dv(s); if (v.schoolZone !== 'Yes') ['szAmStart', 'szAmEnd', 'szPmStart', 'szPmEnd'].forEach((k) => { if (v[k]) v[k] = ''; }); const enforce = enforceFor(s); if (!G.attempted.has(s.id)) { /* only format errors until attempted */ } const r = C.validateAll(v, s.rt, { sites: sites, id: s.id, certs: s.certs || [], enforce: G.attempted.has(s.id) ? enforce : new Set() }); G.errs[s.id] = r; return r; }
  const isDirty = (s) => G.draft[s.id] && JSON.stringify(G.draft[s.id]) !== JSON.stringify(s.v);

  function cell(s, f) {
    const v = dv(s); const val = v[f.k] == null ? '' : v[f.k]; const e = (G.errs[s.id] || { errors: {}, warns: {} }); const err = e.errors[f.k], warn = e.warns[f.k];
    const dis = f.sz && v.schoolZone !== 'Yes';
    let inp;
    if (f.t === 'pick') inp = '<select data-r="' + s.id + '" data-k="' + f.k + '"' + (dis ? ' disabled' : '') + ' aria-label="' + esc(f.l) + '"><option value="">--None--</option>' + D.opts(f, s.rt).map((o) => '<option' + (o === val ? ' selected' : '') + '>' + esc(o) + '</option>').join('') + '</select>';
    else inp = '<input data-r="' + s.id + '" data-k="' + f.k + '" type="' + (f.t === 'date' ? 'date' : f.t === 'time' ? 'time' : 'text') + '" value="' + esc(val) + '"' + (dis ? ' disabled' : '') + ' aria-label="' + esc(f.l) + '" autocomplete="off">';
    return '<td data-c="' + s.id + '|' + f.k + '" class="' + (err ? 'has-error' : '') + (warn && !err ? ' has-warn' : '') + '">' + inp + '<div class="cellerr">' + esc(err || warn || '') + '</div></td>';
  }
  function childTD(s) {
    const cp = C.childProblems(s, G.stage); const need = D.childReq(s.rt, G.stage);
    const chip = (n, l, k) => '<span class="badge ' + ((need[k] && ((k === 'lane' || k === 'program') ? n < need[k] : false)) ? 'badge--open' : '') + '">' + n + ' ' + l + '</span> ';
    return '<td data-child="' + s.id + '" style="min-width:200px">' + chip((s.lanes || []).length, 'Lanes', 'lane') + chip((s.programs || []).length, 'Program', 'program') + chip((s.devices || []).length, 'Devices', 'device') + chip((s.certs || []).length, 'Certs', 'cert') + (cp.length ? '<div class="cellerr">' + C.esc(cp[0].msg) + (cp.length > 1 ? ' (+' + (cp.length - 1) + ' more)' : '') + '</div>' : '') + '<a class="sel-note" href="../v1-record-page/index.html#/site/' + s.id + '?stage=' + G.stage + '">Open record</a></td>';
  }
  function rowHTML(s) {
    const r = G.errs[s.id] || { errors: {} }; const n = Object.keys(r.errors).length; const cs = cols();
    return '<tr data-row="' + s.id + '" class="' + (G.sel.has(s.id) ? 'is-sel' : '') + '"><td class="c-sel"><input type="checkbox" data-sel="' + s.id + '"' + (G.sel.has(s.id) ? ' checked' : '') + ' aria-label="Select ' + esc(s.v.code) + '"></td>' + cs.map((f) => cell(s, f)).join('') +
      childTD(s) + '<td class="rowstat"><span class="badge ' + (stageStatus(s) === 'Complete' ? 'badge--ok' : stageStatus(s) === 'Current' ? 'badge--cur' : '') + '">' + stageStatus(s) + '</span> ' + (isDirty(s) ? '<span class="badge badge--proposal">Unsaved</span> ' : '') + (n ? '<span class="rowflag" title="Errors in this row">' + n + ' error' + (n > 1 ? 's' : '') + '</span>' : '') + '</td></tr>';
  }
  const Companionx = () => Companion.qbadges({ child: 'lane' });
  function render() {
    const rows = rowsFor(); rows.forEach((s) => { if (!G.errs[s.id]) validateRow(s); });
    const cs = cols(); const nSel = G.sel.size;
    const stOpts = D.stages(G.rt).map((s) => '<option value="' + s.id + '"' + (s.id === G.stage ? ' selected' : '') + '>' + esc(s.label) + '</option>').join('');
    const setFields = D.fieldsFor(G.rt).filter((f) => f.t === 'pick' && f.sec !== 'life' || f.t === 'text').filter((f) => f.k !== 'code');
    $('#app').innerHTML = '<main class="page"><div class="pagehead"><span class="objicon">' + ic('camera', '', 18) + '</span><div style="flex:1"><div class="sub">Sites</div><h1>Bulk Site Entry</h1></div><span class="badge badge--proposal">Proposal</span></div>' +
      '<div class="rt-tabs" role="tablist">' + D.ALL.map((x) => '<button class="' + (x === G.rt ? 'is-active' : '') + '" data-rt="' + x + '">' + x + ' (' + sites.filter((s) => s.rt === x).length + ')</button>').join('') + '<span class="sel-note" style="margin:8px 0 0 12px;color:#444">Columns differ per record type, so the grid shows one record type at a time.</span></div>' +
      '<div class="gtool"><div><label for="gstage">Working stage ' + Companion.qbadges({ stage: G.stage }) + '</label><select id="gstage">' + stOpts + '</select></div><div class="sel-note" style="color:#444;max-width:420px">Columns show this stage\'s date and required fields (Proposal). Orange-bordered rows have unsaved edits.</div><span class="sp"></span>' +
      '<button class="btn" id="addRow">' + ic('plus', '', 12) + ' Add row</button><button class="btn" id="validateAll">Validate all</button><button class="btn btn--brand" id="saveAll">Save changes</button></div>' +
      (nSel ? '<div class="bar" id="actionbar" role="toolbar" aria-label="Bulk actions"><strong>' + nSel + ' selected</strong><span style="opacity:.7">|</span><span>Set activity:</span><button class="btn" data-act="Commission">Commission</button><button class="btn" data-act="Decommission|Decommissioned - Camera removed">Decommission (camera removed)</button><button class="btn" data-act="Decommission|Decommissioned - Camera upgraded">Decommission (camera upgraded)</button><button class="btn" data-act="Refurbish">Refurbish</button><span style="opacity:.7">|</span><button class="btn" id="bulkComplete">Mark "' + esc((D.stages(G.rt).filter((x) => x.id === G.stage)[0] || {}).label) + '" complete</button><span style="opacity:.7">|</span><select id="bf" aria-label="Field to set">' + setFields.map((f) => '<option value="' + f.k + '">' + esc(f.l) + '</option>').join('') + '</select><span id="bvWrap"></span><button class="btn" id="bulkSet">Set value</button><span style="flex:1"></span><button class="btn" id="clearSel">Clear selection</button></div>' : '') +
      '<div class="gwrap"><table class="grid"><thead><tr><th class="c-sel"><input type="checkbox" id="selAll" aria-label="Select all"' + (nSel && nSel === rows.length ? ' checked' : '') + '></th>' + cs.map((f) => '<th class="' + (G.flashCol === f.k ? 'col-flash' : '') + '">' + (C.reqKeys(G.rt, G.stage, {}).has(f.k) || D.ALWAYS_REQ.indexOf(f.k) >= 0 ? '<span style="color:#ba0517">*</span> ' : '') + esc(f.l) + Companion.qbadges({ field: f.k }) + '</th>').join('') + '<th>Child records (read-only here)' + Companionx() + '</th><th>Stage status</th></tr></thead><tbody>' +
      (rows.length ? rows.map(rowHTML).join('') : '<tr><td colspan="' + (cs.length + 2) + '" class="empty" style="padding:24px;text-align:center">No ' + G.rt + ' sites. Use Add row.</td></tr>') + '</tbody></table></div></main>';
    if (nSel) bulkValue();
    if (G.flashCol) { const th = $('.col-flash'); if (th) th.scrollIntoView({ inline: 'center', block: 'nearest' }); }
  }
  function bulkValue() {
    const k = $('#bf').value; const f = fdef(k); const w = $('#bvWrap');
    w.innerHTML = f.t === 'pick' ? '<select id="bv" aria-label="Value"><option value="">--None--</option>' + D.opts(f, G.rt).map((o) => '<option>' + esc(o) + '</option>').join('') + '</select>' : '<input id="bv" placeholder="Value" aria-label="Value">';
  }

  function updateRowUI(id) {
    const s = sites.filter((x) => x.id === id)[0]; const r = validateRow(s); const tr = $('tr[data-row="' + id + '"]'); if (!tr) return;
    $$('td[data-c]', tr).forEach((td) => { const k = td.dataset.c.split('|')[1]; const err = r.errors[k], warn = r.warns[k]; td.classList.toggle('has-error', !!err); td.classList.toggle('has-warn', !!warn && !err); td.querySelector('.cellerr').textContent = err || warn || ''; const f = fdef(k); if (f.sz) { const dis = dv(s).schoolZone !== 'Yes'; const i = td.querySelector('input'); i.disabled = dis; i.value = dv(s)[k] || ''; } });
    const n = Object.keys(r.errors).length; const st = tr.querySelector('.rowstat');
    st.innerHTML = '<span class="badge ' + (stageStatus(s) === 'Complete' ? 'badge--ok' : stageStatus(s) === 'Current' ? 'badge--cur' : '') + '">' + stageStatus(s) + '</span> ' + (isDirty(s) ? '<span class="badge badge--proposal">Unsaved</span> ' : '') + (n ? '<span class="rowflag">' + n + ' error' + (n > 1 ? 's' : '') + '</span>' : '');
  }

  function saveRows(ids, quiet) {
    let ok = 0, bad = 0;
    ids.forEach((id) => { const s = sites.filter((x) => x.id === id)[0]; if (!isDirty(s)) return; const r = validateRow(s); if (Object.keys(r.errors).length) { bad++; return; } s.v = JSON.parse(JSON.stringify(dv(s))); ok++; });
    persist(); return { ok, bad };
  }

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.id === 'gstage') { G.stage = t.value; G.flashCol = null; G.errs = {}; render(); return; }
    if (t.id === 'bf') { bulkValue(); return; }
    if (t.id === 'selAll') { rowsFor().forEach((s) => (t.checked ? G.sel.add(s.id) : G.sel.delete(s.id))); render(); return; }
    if (t.dataset.sel) { t.checked ? G.sel.add(t.dataset.sel) : G.sel.delete(t.dataset.sel); render(); return; }
    if (t.dataset.r) { const s = sites.filter((x) => x.id === t.dataset.r)[0]; dv(s)[t.dataset.k] = t.value; if (t.dataset.k === 'schoolZone' && t.value !== 'Yes') ['szAmStart', 'szAmEnd', 'szPmStart', 'szPmEnd'].forEach((k) => (dv(s)[k] = '')); updateRowUI(s.id); if (t.dataset.k === 'schoolZone') { /* times may need refresh in dependent rows */ } }
  });
  document.addEventListener('input', (e) => { const t = e.target; if (t.dataset && t.dataset.r) { const s = sites.filter((x) => x.id === t.dataset.r)[0]; dv(s)[t.dataset.k] = t.value; } });
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-rt],[data-act],#bulkComplete,#bulkSet,#clearSel,#validateAll,#saveAll,#addRow'); if (!t) return;
    if (t.dataset.rt) { G.rt = t.dataset.rt; G.sel.clear(); G.errs = {}; G.flashCol = null; if (!D.stages(G.rt).some((s) => s.id === G.stage)) G.stage = 'd064'; render(); return; }
    const ids = Array.from(G.sel);
    if (t.dataset.act) {
      const [actv, stv] = t.dataset.act.split('|'); ids.forEach((id) => { const s = sites.filter((x) => x.id === id)[0]; dv(s).activity = actv; if (stv) dv(s).status = stv; });
      G.errs = {}; render(); C.toast(actv + (stv ? ' (Status: ' + stv + ')' : '') + ' set on ' + ids.length + ' site' + (ids.length > 1 ? 's' : '') + '. Save changes to keep them.', 'success'); return;
    }
    if (t.id === 'clearSel') { G.sel.clear(); render(); return; }
    if (t.id === 'validateAll') { rowsFor().forEach((s) => G.attempted.add(s.id)); G.errs = {}; render(); const n = rowsFor().filter((s) => Object.keys(G.errs[s.id].errors).length).length; C.toast(n ? n + ' row' + (n > 1 ? 's have' : ' has') + ' errors for stage "' + esc((D.stages(G.rt).filter((x) => x.id === G.stage)[0] || {}).label) + '".' : 'All rows are valid for this stage.', n ? 'error' : 'success'); return; }
    if (t.id === 'saveAll') { const r = saveRows(rowsFor().map((s) => s.id)); G.errs = {}; render(); if (!r.ok && !r.bad) C.toast('No changes to save.', 'info'); else C.toast(r.ok + ' saved' + (r.bad ? ', ' + r.bad + ' not saved because of errors' : '') + '.', r.bad ? 'warning' : 'success'); return; }
    if (t.id === 'addRow') {
      const code = 'TEST-' + String(9000 + sites.length).padStart(4, '0');
      sites.push({ id: 's' + Date.now(), rt: G.rt, v: { code: code, suburb: '', region: '', activity: 'Commission' }, done: [], files: [] }); persist(); G.errs = {}; render(); C.toast('Row added. Camera Code was suggested; complete the required cells.', 'info'); return;
    }
    if (t.id === 'bulkSet') {
      const k = $('#bf').value, val = $('#bv').value, f = fdef(k); let n = 0; const skipped = [];
      ids.forEach((id) => { const s = sites.filter((x) => x.id === id)[0]; if (f.p.indexOf(s.rt) < 0) { skipped.push(s.v.code); return; } dv(s)[k] = val; n++; });
      G.errs = {}; render(); C.toast(esc(f.l) + ' set on ' + n + ' row' + (n === 1 ? '' : 's') + (skipped.length ? '; skipped ' + skipped.join(', ') : '') + '. Invalid values show per-row errors.', 'success'); return;
    }
    if (t.id === 'bulkComplete') {
      let done = 0, bad = 0, blocked = 0; const st = G.stage;
      ids.forEach((id) => {
        const s = sites.filter((x) => x.id === id)[0]; G.attempted.add(id); const sts = D.stages(s.rt); const idx = sts.findIndex((x) => x.id === st);
        const r = validateRow(s);
        if (s.done.indexOf(st) >= 0) return;
        if (idx < 0) { blocked++; return; }
        if (sts.slice(0, idx).some((x) => s.done.indexOf(x.id) < 0)) { blocked++; r.errors._order = 'An earlier stage is not complete.'; return; }
        if (Object.keys(r.errors).length || C.childProblems(s, st).length) { bad++; return; }
        s.v = JSON.parse(JSON.stringify(dv(s))); s.done.push(st); done++;
      });
      persist(); const keepErr = G.errs; render();
      C.toast(done + ' completed, ' + (bad + blocked) + ' need attention' + (blocked ? ' (' + blocked + ' blocked by an earlier incomplete stage)' : '') + '.', bad + blocked ? 'warning' : 'success');
    }
  });
  render();
})();
