/* Stage navigator: persistent lifecycle stepper on every screen. Stage names are proposals. */
(function () {
  const D = window.D141, BL = window.BL, C = window.Core, esc = C.esc;
  const KEY = 'enf-d141-nav';
  const BR = { commission: 'Commission', decommission: 'Decommission', refurbish: 'Refurbish' };
  const NAV = { rt: 'FDSC', branch: 'commission', stage: null, site: null, state: {}, missing: {} };
  let handler = null, root = null, base = '';
  try { const o = JSON.parse(localStorage.getItem(KEY) || '{}'); if (D.ALL.indexOf(o.rt) >= 0) NAV.rt = o.rt; if (BR[o.branch]) NAV.branch = o.branch; } catch (e) { /* ignore */ }
  const qp = new URLSearchParams(location.search.replace(/#.*/, '') || (location.hash.indexOf('?') > 0 ? location.hash.slice(location.hash.indexOf('?')) : ''));
  if (BR[qp.get('branch')]) NAV.branch = qp.get('branch');
  if (D.ALL.indexOf(qp.get('rt')) >= 0) NAV.rt = qp.get('rt');
  const urlStage = qp.get('stage');
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify({ rt: NAV.rt, branch: NAV.branch })); } catch (e) { /* ignore */ } };

  function stages() {
    if (NAV.branch === 'commission') return D.stages(NAV.rt).map((s) => ({ id: s.id, label: s.label }));
    return BL.JOURNEY.filter((j) => j.kind === (NAV.branch === 'decommission' ? 'decom' : 'refurb')).map((j) => ({ id: j.id, label: j.name }));
  }
  const count = (sid) => {
    const q = BL.QUESTIONS.filter((x) => (x.at.stage || []).indexOf(sid) >= 0 || (x.primary && x.primary.stage === sid)).length;
    const s = BL.STORIES.filter((x) => x.stage === sid).length;
    const j = BL.JOURNEY.filter((x) => x.rec === sid || x.id === sid)[0];
    return { q: q, s: s, j: j };
  };
  function go(sid, silent) {
    NAV.stage = sid; render();
    if (silent) return;
    if (handler && handler(sid, NAV)) return;
    if (NAV.branch === 'commission') location.href = base + BL.href({ t: 'record', rt: NAV.rt, stage: sid }, '');
    else location.href = base + BL.href({ t: 'journey', step: sid }, '');
  }
  function html() {
    const sts = stages(), cur = NAV.stage;
    const items = sts.map((s, i) => {
      const c = count(s.id), st = NAV.state[s.id] || (NAV.site ? 'incomplete' : ''), miss = NAV.missing[s.id] || 0;
      const txt = st === 'complete' ? 'done' : st === 'current' ? 'current' : st === 'incomplete' ? 'upcoming' : '';
      return '<li><button class="sn__b' + (s.id === cur ? ' is-sel' : '') + ' sn--' + (st || 'none') + '" data-sn="' + s.id + '" aria-current="' + (s.id === cur ? 'step' : 'false') + '" title="' + esc(s.label) + ' (proposed name - to confirm)">' +
        '<span class="sn__n">' + (st === 'complete' ? '&#10003;' : (i + 1)) + '</span><span class="sn__l">' + esc(s.label) + '</span>' +
        '<span class="sn__c" aria-label="' + c.q + ' open questions, ' + c.s + ' stories' + (miss ? ', ' + miss + ' missing items' : '') + (txt ? ', ' + txt : '') + '">' + (c.q ? '<i class="sn__q" title="Open questions">?' + c.q + '</i>' : '') + (c.s ? '<i class="sn__s" title="Stories">S' + c.s + '</i>' : '') + (miss ? '<i class="sn__m" title="Missing items on this site">!' + miss + '</i>' : '') + '</span></button></li>';
    }).join('');
    return '<div class="sn__row"><strong class="sn__t">Stage</strong>' +
      '<label class="sn__f">Activity <select id="snBranch" aria-label="Activity branch">' + Object.keys(BR).map((k) => '<option value="' + k + '"' + (k === NAV.branch ? ' selected' : '') + '>' + BR[k] + '</option>').join('') + '</select></label>' +
      '<label class="sn__f">Program <select id="snRt" aria-label="Program">' + D.ALL.map((r) => '<option' + (r === NAV.rt ? ' selected' : '') + '>' + r + '</option>').join('') + '</select></label>' +
      '<ol class="sn__ol" aria-label="Lifecycle stages (proposed names - to confirm)">' + items + '</ol>' +
      '<label class="sn__f">Go to stage <select id="snGo" aria-label="Go to stage">' + sts.map((s) => '<option value="' + s.id + '"' + (s.id === cur ? ' selected' : '') + '>' + esc(s.label) + '</option>').join('') + '</select></label>' +
      '<span class="sn__k" title="Keyboard shortcuts">[ ] prev / next</span></div>' +
      (NAV.site ? '<div class="sn__site">Showing the state of site <strong>' + esc(NAV.site) + '</strong>. Badges: <i class="sn__q">?n</i> open questions, <i class="sn__s">Sn</i> stories, <i class="sn__m">!n</i> missing items.</div>' : '<div class="sn__site">Badges: <i class="sn__q">?n</i> open questions, <i class="sn__s">Sn</i> stories at that stage. Stage names are proposals, to confirm.</div>');
  }
  function render() { if (root) root.innerHTML = html(); }
  function mount() {
    if (root) return; const anchor = document.querySelector('.here') || document.querySelector('.nav'); if (!anchor) return;
    base = (document.querySelector('.here__crumbs a') || { getAttribute: () => '' }).getAttribute('href') || '';
    base = base.replace(/index\.html$/, '');
    root = document.createElement('nav'); root.className = 'sn'; root.setAttribute('aria-label', 'Lifecycle stage navigator'); anchor.after(root);
    if (urlStage && stages().some((s) => s.id === urlStage)) NAV.stage = urlStage;
    render();
    root.addEventListener('click', (e) => { const b = e.target.closest('[data-sn]'); if (b) go(b.dataset.sn); });
    root.addEventListener('change', (e) => {
      if (e.target.id === 'snGo') { if (e.target.value) go(e.target.value); }
      else if (e.target.id === 'snBranch') { NAV.branch = e.target.value; NAV.stage = null; save(); render(); if (handler && handler.onBranch) handler.onBranch(NAV); }
      else if (e.target.id === 'snRt') { NAV.rt = e.target.value; save(); render(); if (handler && handler.onProgram) handler.onProgram(NAV); }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key !== '[' && e.key !== ']') return; const t = e.target; if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || (t && t.isContentEditable) || e.ctrlKey || e.metaKey || e.altKey) return;
      const sts = stages(); const i = sts.findIndex((s) => s.id === NAV.stage); const n = e.key === ']' ? Math.min(sts.length - 1, i + 1) : Math.max(0, (i < 0 ? 0 : i) - 1); if (sts[n]) go(sts[n].id);
    });
  }
  window.StageNav = {
    nav: NAV, urlStage: urlStage,
    /* page registers: fn(stageId, nav) returns true when it handled the selection itself */
    page: function (fn, extra) { handler = fn; if (extra) { fn.onBranch = extra.onBranch; fn.onProgram = extra.onProgram; } },
    /* a page tells the navigator what it is showing (stage, program, a site's state and missing counts) */
    context: function (c) { if (c.rt) NAV.rt = c.rt; if (c.branch) NAV.branch = c.branch; if (c.stage !== undefined) NAV.stage = c.stage; NAV.site = c.site || null; NAV.state = c.state || {}; NAV.missing = c.missing || {}; render(); },
    select: function (sid) { NAV.stage = sid; render(); },
    stages: stages
  };
  window.addEventListener('DOMContentLoaded', () => setTimeout(mount, 0));
  if (document.readyState !== 'loading') setTimeout(mount, 0);
})();
