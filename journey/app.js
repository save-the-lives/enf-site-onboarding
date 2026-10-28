(function () {
  const BL = window.BL, C = window.Core, D = window.D141, esc = C.esc;
  pageShell('jr', 'User journey', 'Journey map from site planned to enforcement live, with decommission and refurbish branches. Each stage links to the Path stage on the record page and back.');
  document.getElementById('oi').innerHTML = C.icon('arrowleft', '', 18);
  const sel = document.getElementById('jrt'); sel.innerHTML = D.ALL.map((p) => '<option>' + p + '</option>').join('');
  let rt = 'FDSC', cur = (location.hash || '#planned').slice(1);
  const mainSteps = () => BL.JOURNEY.filter((j) => j.kind === 'main' && !(rt === 'ASC' && j.id === 'warning'));
  function dataFor(j) {
    if (j.data) return j.data;
    const st = D.stages(rt).filter((s) => s.id === j.rec)[0]; if (!st) return [];
    const ks = (D.STAGE_REQ[j.rec] || []).concat(st.dates); if (j.rec === 'd064') ks.push('szAmStart', 'szAmEnd', 'szPmStart', 'szPmEnd');
    const ok = new Set(D.fieldsFor(rt).map((f) => f.k)); return ks.filter((k) => ok.has(k)).map((k) => C.fmap[k].l);
  }
  function attFor(j) { if (j.rec) { const st = D.stages(rt).filter((s) => s.id === j.rec)[0]; return st ? st.att : []; } return j.attach; }
  function render() {
    const steps = mainSteps();
    if (!BL.JOURNEY.some((j) => j.id === cur)) cur = 'planned';
    document.getElementById('jpath').innerHTML = steps.map((j) => '<li class="path__item is-incomplete' + (j.id === cur ? ' is-selected' : '') + '"><button data-s="' + j.id + '" title="' + esc(j.name) + '" style="' + (j.id === cur ? 'background:#0176d3;color:#fff' : '') + '">' + esc(j.name) + '</button><span class="sel-mark"></span></li>').join('');
    const br = (kind, title) => { const s = BL.JOURNEY.filter((j) => j.kind === kind); return '<div class="branch"><h3>' + title + ' <span class="badge badge--proposal">Branch - proposed</span> ' + Companion.qbadges({ journey: s[0].id }) + '</h3><div class="bsteps"><span class="sel-note">from Enforcement Live</span> ' + s.map((j) => '<span class="bsep">&rarr;</span><button class="bstep' + (j.id === cur ? ' is-selected' : '') + '" data-s="' + j.id + '">' + esc(j.name) + '</button>').join('') + (kind === 'refurb' ? '<span class="bsep">&rarr;</span><span class="sel-note">rejoins Certification</span>' : '') + '</div></div>'; };
    document.getElementById('branches').innerHTML = br('decom', 'Decommission') + br('refurb', 'Refurbish');
    const j = BL.JOURNEY.filter((x) => x.id === cur)[0];
    const stories = BL.STORIES.filter((s) => (j.rec && (s.stage === j.rec)) || s.screens.some((r) => r.t === 'journey' && r.step === j.id));
    const qs = BL.qFor({ journey: j.id });
    const recRef = j.rec ? { t: 'record', rt: rt, stage: j.rec } : j.ref;
    const li = (a) => a.length ? '<ul>' + a.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '<span class="sel-note">None proposed</span>';
    document.getElementById('detail').innerHTML = '<div class="card"><div class="card__head"><h2>' + esc(j.name) + ' ' + Companion.qbadges({ journey: j.id }) + '</h2><span class="badge badge--proposal">Proposed name - to confirm</span>' + (recRef ? '<a class="btn btn--brand btn--sm" href="' + BL.href(recRef, '../') + '">' + (j.rec ? 'Open this stage on the record page' : 'Open related screen') + '</a>' : '') + '</div><div class="card__body"><div class="dgrid">' +
      '<div><h3>Actor</h3>' + esc(j.actor) + '<h3 style="margin-top:12px">Attachments (Proposal)</h3>' + li(attFor(j).map((t) => D.FILETYPES[t])) + '</div>' +
      '<div><h3>Data captured' + (j.rec ? ' (required to complete, Proposal)' : '') + '</h3>' + li(dataFor(j)) + '</div>' +
      '<div><h3>Validation gates</h3>' + li(j.gates) + '</div>' +
      '<div class="pain"><h3>Pain point today</h3>' + esc(j.pain) + '</div>' +
      '<div><h3>Linked stories</h3>' + (stories.length ? '<ul>' + stories.map((s) => '<li><a href="' + BL.href({ t: 'story', id: s.id }, '../') + '">' + s.id + '</a> ' + esc(s.want.slice(0, 70)) + '</li>').join('') + '</ul>' : '<span class="sel-note">No stories yet</span>') + '</div>' +
      '<div><h3>Questions about this step</h3>' + (qs.length ? '<ul style="list-style:none;padding:0">' + qs.map((q) => '<li>' + Companion.badge(q) + ' <a href="' + BL.href({ t: 'question', id: q.id }, '../') + '">' + q.id + '</a> ' + esc(q.q) + '</li>').join('') + '</ul>' : '<span class="sel-note">None</span>') + '</div>' +
      '</div></div></div>';
    sel.value = rt;
  }
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-s]'); if (b) { cur = b.dataset.s; history.replaceState(null, '', '#' + cur); render(); } });
  sel.onchange = () => { rt = sel.value; render(); };
  window.addEventListener('hashchange', () => { cur = location.hash.slice(1); render(); });
  render(); backToQuestion(document.getElementById('main'));
})();
