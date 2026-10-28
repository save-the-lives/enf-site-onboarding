/* Companion layer UI: question badges + popover, "Stories for this screen" panel. */
(function () {
  const BL = window.BL, Core = window.Core, esc = Core.esc;
  let BASE = '../';
  function status(q) { const a = BL.answers()[q.id]; return a && a.status === 'Answered' ? a : null; }

  function badge(q) {
    const ans = status(q);
    return '<button type="button" class="qb' + (ans ? ' is-ans' : '') + '" data-qid="' + q.id + '" title="' + esc(q.id + ': ' + q.q) + '" aria-label="Open question ' + q.id + '">?</button>';
  }
  function qbadges(at) { return BL.qFor(at).map(badge).join(''); }

  function chip(label, href) { return '<a class="chip" href="' + href + '">' + esc(label) + '</a>'; }
  function contextChips(q, base) {
    base = base == null ? BASE : base;
    const out = [], at = q.at, p = q.primary || {}; const rt = p.rt || 'FDSC';
    (at.field || []).forEach((k) => out.push(chip('Field: ' + (Core.fmap[k] || {}).l, BL.href({ t: 'record', rt: rt, stage: p.stage, field: k, q: q.id }, base))));
    (at.stage || []).forEach((s) => out.push(chip('Stage: ' + BL.STAGE_NAME[s], BL.href({ t: 'record', rt: rt, stage: s, q: q.id }, base))));
    (at.col || []).forEach((c) => out.push(chip('List column: ' + c, BL.href({ t: 'list', q: q.id }, base))));
    (at.screen || []).forEach((c) => out.push(chip('Screen: ' + (c === 'new' ? 'New Site modal' : c === 'list' ? 'Sites list' : c), BL.href({ t: c === 'new' ? 'new' : 'list', q: q.id }, base))));
    (at.sec || []).forEach((c) => out.push(chip('Section: ' + c, BL.href({ t: 'record', rt: rt, q: q.id }, base))));
    (at.child || []).forEach((c) => out.push(chip('Related list: ' + c, BL.href({ t: 'record', rt: rt, id: 's1', q: q.id }, base))));
    (at.banner || []).forEach((c) => out.push(chip('Banner: add ' + c, BL.href({ t: 'record', rt: 'RLSC', id: 's3', q: q.id }, base))));
    (at.tab || []).forEach((c) => out.push(chip('Tab: ' + c, BL.href({ t: 'record', rt: rt, tab: c, q: q.id }, base))));
    (at.model || []).forEach(() => out.push(chip('Data model page', BL.href({ t: 'model', q: q.id }, base))));
    (at.story || []).forEach((s) => out.push(chip('Story ' + s, BL.href({ t: 'story', id: s, q: q.id }, base))));
    (at.journey || []).forEach((s) => { const j = BL.JOURNEY.filter((x) => x.id === s)[0]; out.push(chip('Journey: ' + (j ? j.name : 'stage order'), BL.href({ t: 'journey', step: j ? s : 'planned', q: q.id }, base))); });
    return out.join('');
  }

  function popover(btn, q) {
    closePop();
    const ans = status(q);
    const el = document.createElement('div'); el.className = 'popover'; el.id = 'qpop';
    el.innerHTML = '<header><span class="badge badge--open">' + (ans ? 'Answered' : 'Open') + '</span> ' + q.id + '<span style="flex:1"></span><button class="modal__close" style="position:static" data-pclose aria-label="Close">' + Core.icon('close', '', 14) + '</button></header>' +
      '<div class="pb"><strong style="font-size:13px">' + esc(q.q) + '</strong><dl><dt>Why it matters</dt><dd>' + esc(q.why) + '</dd><dt>Current assumption (Proposal)</dt><dd>' + esc(q.assume) + '</dd><dt>Who can answer</dt><dd>' + esc(q.who) + '</dd>' +
      (ans ? '<dt>Answer</dt><dd>' + esc(ans.text) + '</dd>' : '') + '<dt>Also appears at</dt><dd><div class="chips">' + contextChips(q) + '</div></dd></dl>' +
      '<p style="margin-top:8px"><a class="btn btn--brand btn--sm" href="' + BL.href({ t: 'question', id: q.id }, BASE) + '">See in questions index</a></p></div>';
    document.body.appendChild(el);
    const r = btn.getBoundingClientRect();
    el.style.top = (window.scrollY + r.bottom + 6) + 'px';
    el.style.left = Math.max(8, Math.min(window.scrollX + r.left - 20, window.innerWidth - 360)) + 'px';
    el.querySelector('[data-pclose]').onclick = closePop;
  }
  function closePop() { const p = document.getElementById('qpop'); if (p) p.remove(); }
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('.qb');
    if (b) { e.preventDefault(); e.stopPropagation(); const q = BL.QUESTIONS.filter((x) => x.id === b.dataset.qid)[0]; const open = document.getElementById('qpop'); if (open && open.dataset.for === q.id) { closePop(); return; } popover(b, q); document.getElementById('qpop').dataset.for = q.id; return; }
    if (!e.target.closest('#qpop')) closePop();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePop(); });

  /* Stories panel */
  function storiesHTML(list, ctx) {
    if (!list.length) return '<p>No stories linked to this screen yet.</p>';
    return list.map((s) => {
      const rel = ctx && ctx.stage && (s.stage === ctx.stage || s.stage === 'all');
      const links = s.screens.map((r) => chip(BL.label(r), BL.href(r, BASE))).join('');
      return '<div class="card" style="margin-bottom:8px' + (rel ? ';border-color:#0176d3' : '') + '"><div class="card__body" style="padding:10px 12px"><a href="' + BL.href({ t: 'story', id: s.id }, BASE) + '"><strong>' + s.id + '</strong></a> <span class="badge ' + (s.status === 'Agreed' ? 'badge--owner' : 'badge--proposal') + '">' + s.status + '</span> <span class="badge">' + s.prio + '</span>' +
        '<div style="margin:4px 0">As a ' + esc(s.role) + ', I want to ' + esc(s.want) + '</div><div class="chips">' + links + '</div>' +
        (s.qs.length ? '<div style="margin-top:4px">Questions: ' + s.qs.map((id) => badge(BL.QUESTIONS.filter((q) => q.id === id)[0])).join('') + '</div>' : '') + '</div></div>';
    }).join('');
  }
  function init(cfg) { // {t, base, ctx: () => ({stage})}
    BASE = cfg.base || '../';
    const list = () => BL.storiesFor(cfg.t);
    const bar = document.querySelector('.mockbar'); if (!bar) return;
    if (!list().length) { const qi0 = document.createElement('a'); qi0.href = BL.href({ t: 'qindex' }, BASE); qi0.textContent = 'Questions index'; bar.insertBefore(qi0, bar.querySelector('[data-notes]')); return; }
    const a = document.createElement('a'); a.href = '#'; a.id = 'storiesLink'; a.textContent = 'Stories for this screen (' + list().length + ')';
    bar.insertBefore(a, bar.querySelector('[data-notes]'));
    const qi = document.createElement('a'); qi.href = BL.href({ t: 'qindex' }, BASE); qi.textContent = 'Questions index';
    bar.insertBefore(qi, bar.querySelector('[data-notes]'));
    a.onclick = (e) => {
      e.preventDefault(); Core.closeDrawer();
      const d = document.createElement('aside'); d.id = 'drawer'; d.className = 'drawer';
      d.innerHTML = '<header><h2>Stories for this screen</h2><div class="sub" style="font-size:12px;color:#444">Proposal unless marked Agreed. <a href="' + BL.href({ t: 'stories' }, BASE) + '">Open full backlog</a></div><button class="modal__close" data-dclose aria-label="Close">' + Core.icon('close', '', 16) + '</button></header><div class="drawer__body">' + storiesHTML(list(), cfg.ctx ? cfg.ctx() : null) + '</div>';
      document.body.appendChild(d); d.querySelector('[data-dclose]').onclick = Core.closeDrawer;
    };
  }
  window.Companion = { contextChips, qbadges, badge, init, storiesHTML, chip, closePop, setBase: (b) => (BASE = b) };
})();
