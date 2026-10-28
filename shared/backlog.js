/* Living backlog: stories, acceptance criteria, journey and open questions. Single data file rendered by the UI.
   EVERYTHING here is a Proposal unless a story/AC is marked owner:true (stated by the owner in the brief). */
(function () {
  const D = window.D141;
  const SAMPLE = { FDSC: 's1', RLSC: 's3', BPES: 's5', ASC: 's7', ODES: 's9' };
  const ROLES = ['Technical Project Manager (TPM)', 'Unit Manager', 'Camera Networks Engineer', 'CMCS Data Steward', 'Program Owner'];
  const EPICS = {
    E1: 'Site creation and record types', E2: 'Point-of-entry validation', E3: 'Lifecycle and Path', E4: 'Attachments and records',
    E5: 'Bulk actions', E6: 'Guided entry', E7: 'Handover to CMCS and visibility'
  };
  const STAGE_NAME = { all: 'All stages', installed: 'Camera Installed', dba: 'Data Block Approval', d064: 'D064 Site Inspection', d128: 'D128 Network Commissioned', cert: 'Certification', warning: 'Warning Letter Start', infringing: 'Infringing' };
  const ALLP = 'FDSC,RLSC,BPES,ASC,ODES'.split(',');

  /* ref helpers. ref = {t:'record'|'list'|'new'|'related'|'grid'|'flow'|'story'|'journey'|'question'|'stories'|'qindex'|'hub', ...} */
  function href(ref, base) {
    base = base || '';
    const qs = (o) => { const a = []; Object.keys(o).forEach((k) => { if (o[k]) a.push(k + '=' + encodeURIComponent(o[k])); }); return a.length ? '?' + a.join('&') : ''; };
    switch (ref.t) {
      case 'record': return base + 'v1-record-page/index.html#/site/' + (ref.id || SAMPLE[ref.rt || 'FDSC']) + qs({ stage: ref.stage, field: ref.field, tab: ref.tab, q: ref.q });
      case 'list': return base + 'v1-record-page/index.html#/sites' + qs({ q: ref.q });
      case 'new': return base + 'v1-record-page/index.html#/sites' + qs({ new: '1' });
      case 'grid': return base + 'v2-bulk-grid/index.html' + qs({ stage: ref.stage, field: ref.field, q: ref.q });
      case 'flow': return base + 'v3-guided-flow/index.html' + qs({ step: ref.step, rt: ref.rt, field: ref.field, q: ref.q });
      case 'story': return base + 'backlog/index.html' + qs({ q: ref.q }) + '#' + ref.id;
      case 'stories': return base + 'backlog/index.html';
      case 'journey': return base + 'journey/index.html' + qs({ q: ref.q }) + '#' + (ref.step || '');
      case 'question': return base + 'questions/index.html' + '#' + ref.id;
      case 'qindex': return base + 'questions/index.html';
      default: return base + 'index.html';
    }
  }
  function label(ref) {
    const fl = (k) => (D.F.filter((f) => f.k === k)[0] || {}).l || k;
    switch (ref.t) {
      case 'record': return 'Record page' + (ref.rt ? ' (' + ref.rt + ')' : '') + (ref.stage ? ' / ' + STAGE_NAME[ref.stage] : '') + (ref.field ? ' / ' + fl(ref.field) : '');
      case 'list': return 'Site list view';
      case 'new': return 'New Site modal';
      case 'grid': return 'Bulk grid' + (ref.field ? ' / ' + fl(ref.field) : '');
      case 'flow': return 'Guided flow' + (ref.step ? ' / ' + ref.step : '');
      case 'story': return ref.id;
      case 'journey': return 'Journey / ' + ((JOURNEY.filter((j) => j.id === ref.step)[0] || {}).name || 'overview');
      case 'question': return ref.id;
      default: return 'Hub';
    }
  }

  /* ---------------- stories ---------------- */
  const STORIES = [];
  function S(id, epic, role, want, benefit, progs, stage, prio, status, ac, screens, o) {
    STORIES.push(Object.assign({ id, epic, role, want, benefit, progs: progs || ALLP, stage: stage || 'all', prio, status, ac, screens, owner: false, qs: [] }, o || {}));
  }
  const R = (rt, stage, field) => ({ t: 'record', rt: rt, stage: stage, field: field });
  S('US-001', 'E1', ROLES[0], 'create a Site and choose the camera program (record type) first', 'the right layout and rules apply from the start', null, 'installed', 'Must', 'Agreed',
    [['I am on the Sites list', 'I click New and pick the FDSC record type', 'the New Site form opens for FDSC'], ['the record type picker is open', 'I view the options', 'I see exactly FDSC, RLSC, BPES, ASC and ODES']], [{ t: 'new' }, { t: 'list' }], { owner: true });
  S('US-002', 'E1', ROLES[0], 'see only the fields that apply to the site\'s program', 'I do not fill in or misread fields that do not apply', null, 'all', 'Must', 'Agreed',
    [['a BPES site', 'I open the record', 'Speed Limit, SMD and Flash Type are not shown'], ['an ODES site', 'I open the record', 'DMD, DMD Serial, Flash Type, ASC Zone and Avoidance are shown'], ['an RLSC site', 'I open the record', 'TCS ID is shown']], [R('BPES'), R('ODES'), R('RLSC', 'installed', 'tcs')], { owner: true });
  S('US-003', 'E2', ROLES[0], 'have Camera Code required, well-formed and unique', 'two sites never share a code and CMCS keys are clean', null, 'installed', 'Must', 'Draft',
    [['I type a code that already exists', 'I leave the field', 'I see "Duplicate value" under the field and Save is blocked'], ['I type "A!"', 'I leave the field', 'I see the format message (3 to 20 characters, letters, numbers, hyphens)']], [R('FDSC', 'installed', 'code'), { t: 'new' }], { qs: ['Q-012'] });
  S('US-004', 'E2', ROLES[0], 'be stopped from entering an impossible latitude or longitude', 'sites are not plotted in the wrong place', null, 'installed', 'Must', 'Agreed',
    [['a Camera Latitude field', 'I enter 95', 'I see "Latitude must be between -90 and 90" and cannot save'], ['a Camera Longitude field', 'I enter 200', 'I see "Longitude must be between -180 and 180" and cannot save'], ['any lat/long field', 'I enter text', 'I see that a decimal number is required']], [R('FDSC', 'installed', 'camLat'), R('FDSC', 'installed', 'camLng'), { t: 'grid', field: 'camLat' }], { owner: true });
  S('US-005', 'E2', ROLES[0], 'be warned (not blocked) when coordinates fall outside NSW', 'sign or digit slips (e.g. a missing minus) are caught', null, 'installed', 'Should', 'Draft',
    [['Camera Latitude 33.8688 (positive)', 'I leave the field', 'I see an amber warning that it is outside the NSW range, and I can still save']], [R('FDSC', 'installed', 'camLat')]);
  S('US-006', 'E2', ROLES[2], 'have both IP addresses validated as IPv4', 'network commissioning data is usable first time', null, 'd128', 'Must', 'Agreed',
    [['IP Address (Camera)', 'I enter 192.0.2.300', 'I see "Enter a valid IPv4 address" and cannot save'], ['IP Address (Router-EC)', 'I enter 192.0.2.10', 'no error is shown']], [R('FDSC', 'd128', 'ipCam'), R('FDSC', 'd128', 'ipRouter'), { t: 'grid', field: 'ipCam' }], { owner: true });
  S('US-007', 'E2', ROLES[0], 'choose from the approved value lists only', 'there are no misspelt or invented values', null, 'all', 'Must', 'Agreed',
    [['a picklist field (e.g. Region, Direction, Sensor Type)', 'I open it', 'I can only pick from the Validation data sheet values'], ['an RLSC site', 'I open SMD', 'I see only the RLSC SMD list, not the FDSC list']], [R('RLSC', 'installed', 'smd'), R('FDSC', 'installed', 'region')], { owner: true });
  S('US-008', 'E2', ROLES[0], 'have lifecycle dates checked for order', 'impossible histories (e.g. certified before installed) cannot be recorded', null, 'all', 'Must', 'Agreed',
    [['Camera Installed 10/02/2026', 'I enter Data Block Approval 01/02/2026', 'I see that approval cannot be earlier than installation'], ['dates in order: installed, DBA, D064, D128, certifications, warning start, infringing', 'I save', 'no date errors are shown']], [R('FDSC', 'dba', 'dDBA'), R('FDSC', 'cert', 'dS138')], { owner: true });
  S('US-009', 'E2', ROLES[0], 'enter school zone times only when School Zone is Yes', 'times are not recorded for sites that are not school zones', null, 'd064', 'Must', 'Agreed',
    [['School Zone = No or N/A', 'I view the times', 'the four time fields are disabled and cleared'], ['School Zone = Yes', 'I complete D064 without times', 'I see "Required when School Zone is Yes" on each missing time'], ['morning start 09:30 and end 07:30', 'I leave the end field', 'I see end must be after start (Proposal)']], [R('FDSC', 'd064', 'schoolZone'), R('FDSC', 'd064', 'szAmStart'), { t: 'flow', step: 'school' }], { owner: true });
  S('US-010', 'E3', ROLES[0], 'be unable to mark a stage complete until its required fields are filled and valid', 'each stage hands over complete data', null, 'all', 'Must', 'To confirm',
    [['stage D064 with Direction Monitored empty', 'I click Mark Status as Complete', 'the stage stays open, empty required fields show "Complete this field" and a summary lists them'], ['all required fields valid', 'I click Mark Status as Complete', 'the stage is checked off on the Path and the next stage becomes current']], [R('FDSC', 'd064'), { t: 'grid', stage: 'd064' }], { owner: false, qs: ['Q-008'] });
  S('US-011', 'E3', ROLES[0], 'see the site\'s lifecycle as a Path across the top of the record', 'I know at a glance where the site is and what is next', null, 'all', 'Must', 'Agreed',
    [['a site with two stages complete', 'I open the record', 'two stages show a check, the third is highlighted as current, the rest are not started'], ['the Path', 'I click a stage', 'that stage\'s date, checklist and attachments are shown']], [R('FDSC'), { t: 'journey' }], { owner: true, qs: ['Q-005'] });
  S('US-012', 'E3', ROLES[0], 'see the right certification dates for the program', 'I only enter dates that apply', null, 'cert', 'Must', 'Agreed',
    [['FDSC or RLSC', 'I open Certification', 'S137 and S138 dates are shown'], ['BPES or ASC', 'I open Certification', 'only S138 is shown'], ['ODES', 'I open Certification', 'S137A and S138 are shown'], ['an ASC site', 'I view the Path', 'there is no Warning Letter Start stage']], [R('ODES', 'cert', 'dS137A'), R('ASC', 'cert', 'dS138')], { owner: true });
  S('US-013', 'E4', ROLES[0], 'attach the supporting document at the stage it belongs to', 'evidence sits with the site, not in Objective or email', null, 'all', 'Should', 'To confirm',
    [['the D064 stage', 'I upload a file as D064 Site Inspection Report', 'it appears on the stage and in the related list with a count'], ['no file chosen', 'I click Upload', 'I see "Select a file"'], ['any attachment area', 'I view it', 'it is labelled "Proposal - to be confirmed by owner"']], [R('FDSC', 'd064'), R('FDSC', 'installed', null)], { qs: ['Q-002'] });
  S('US-014', 'E7', ROLES[1], 'be told when a site reaches key stages or goes live', 'I no longer depend on a PDF being emailed to me', null, 'infringing', 'Should', 'To confirm',
    [['a site is marked Infringing', 'the stage is completed', 'the configured unit managers for the site are notified (recipient list to be confirmed)']], [R('FDSC', 'infringing')], { qs: ['Q-001'] });
  S('US-015', 'E1', ROLES[0], 'record whether I am commissioning, decommissioning or refurbishing a site', 'the right process is followed', null, 'installed', 'Must', 'To confirm',
    [['a New Site', 'I choose Activity Type', 'I can pick Commission, Decommission or Refurbish only'], ['Activity Type is empty', 'I save', 'I see "Complete this field"']], [R('FDSC', 'installed', 'activity'), { t: 'journey', step: 'decom-req' }], { owner: true, qs: ['Q-006'] });
  S('US-016', 'E1', ROLES[3], 'filter the Site list by program, activity and current stage', 'I can find sites that need attention', null, 'all', 'Should', 'Draft',
    [['the Sites list', 'I filter to ASC', 'only ASC sites are listed'], ['a search term', 'I type TEST-0003', 'one row is shown']], [{ t: 'list' }]);
  S('US-017', 'E5', ROLES[0], 'set the activity type (Commission, Decommission, Refurbish) on several selected sites at once', 'a batch is handled in one action', null, 'all', 'Should', 'Draft',
    [['three rows selected in the grid', 'I choose Decommission in the bulk action bar', 'all three rows show Decommission and I see a confirmation toast with the count']], [{ t: 'grid' }], { qs: ['Q-006'] });
  S('US-018', 'E5', ROLES[0], 'mark a stage complete for several selected sites, with each row validated separately', 'good rows go through and bad rows tell me exactly what is wrong', null, 'all', 'Should', 'Draft',
    [['five rows selected, two with missing required fields', 'I run Mark stage complete', 'three rows are completed, two show per-row errors and stay open, and the toast reports "3 completed, 2 need attention"']], [{ t: 'grid', stage: 'd064' }]);
  S('US-019', 'E5', ROLES[0], 'edit several sites in a grid with inline errors per cell', 'I can fix a batch without opening each record', null, 'all', 'Should', 'Draft',
    [['a grid cell', 'I enter an invalid IP', 'the cell is outlined red with the message and the row shows an error count'], ['a grid cell for a field that does not apply to the row\'s program', 'I view it', 'the cell is disabled and shows a dash']], [{ t: 'grid', field: 'ipCam' }]);
  S('US-020', 'E5', ROLES[0], 'set one field to the same value on all selected sites', 'common changes (e.g. Region, Vendor) are quick', null, 'all', 'Could', 'Draft',
    [['selected rows and a chosen field and value', 'I apply Set value', 'every selected row that supports the field is updated and validated; rows that do not support it are skipped and listed']], [{ t: 'grid' }]);
  S('US-021', 'E6', ROLES[0], 'create a site through a guided, step-by-step flow', 'I get it right first time even if I rarely do it', null, 'installed', 'Could', 'Draft',
    [['the flow', 'I click Next with errors on the current step', 'I stay on the step and see inline errors'], ['I reach Review', 'I look at the summary', 'every entered value is listed with an edit link back to its step'], ['I confirm', 'the flow finishes', 'a Site record is created and I am taken to it']], [{ t: 'flow' }]);
  S('US-022', 'E7', ROLES[3], 'receive site data that was validated when it was entered', 'I do not have to re-key or distrust the data', null, 'all', 'Must', 'Agreed',
    [['a site with all stages complete', 'it is in CMCS', 'no field fails any validation rule in this backlog'], ['an invalid value', 'a user tries to save it', 'it is rejected at entry with a field-level message']], [R('FDSC', 'infringing'), { t: 'list' }], { owner: true });
  S('US-023', 'E3', ROLES[0], 'reopen a completed stage', 'I can correct a mistake found later', null, 'all', 'Should', 'Draft',
    [['a completed stage', 'I choose Reopen', 'the stage and all later stages become not started, and a toast says so']], [R('FDSC', 'd064')], { qs: ['Q-007'] });
  S('US-024', 'E4', ROLES[1], 'get the signed D141 as a PDF generated from the record', 'the audience that expects a PDF still gets one', null, 'infringing', 'Could', 'To confirm',
    [['an Infringing site', 'I open Related', 'a Signed D141 PDF slot exists labelled Proposal']], [R('FDSC', 'infringing')], { qs: ['Q-013'] });
  S('US-025', 'E2', ROLES[2], 'capture router and EC details at the D128 stage', 'commissioning is not complete until the network is documented', null, 'd128', 'Should', 'Draft',
    [['the D128 stage', 'I view the checklist', 'Router Model, Router Serial, both IPs, Sensor Type, EC Version and EC Serial are required (Proposal)']], [R('FDSC', 'd128', 'routerModel')], { qs: ['Q-004', 'Q-008'] });
  S('US-026', 'E7', ROLES[1], 'view a site and its stage status read-only', 'I can see progress without editing data', null, 'all', 'Could', 'Draft',
    [['I have read-only access', 'I open a Site', 'I see the Path and fields but no edit pencils or Save']], [R('FDSC')]);
  S('US-027', 'E3', ROLES[4], 'confirm what Data Block Approval and D128 mean and their order', 'the stage names and order match the real process', null, 'dba', 'Must', 'To confirm',
    [['the owner has answered Q-003, Q-004 and Q-005', 'the Path is reviewed', 'stage names and order are updated and this story is Agreed']], [{ t: 'journey' }, R('FDSC', 'dba')], { qs: ['Q-003', 'Q-004', 'Q-005'] });
  S('US-028', 'E2', ROLES[0], 'enter ASC Zone Number and ASC Zone for an Average Speed Camera', 'zones are recorded consistently', ['ASC'], 'installed', 'Should', 'Draft',
    [['an ASC site', 'I enter Zone Number 0', 'I see a whole number between 1 and 99 is required']], [R('ASC', 'installed', 'ascZoneNo')], { qs: ['Q-015'] });

  /* ---------------- questions ---------------- */
  const QUESTIONS = [
    { id: 'Q-001', q: 'Who are the real unit managers, and which events should notify them?', why: 'Today a PDF is emailed to unit managers. Without a list we cannot design notifications or sharing.', assume: 'A configurable list per region/program; notified when a site is marked Infringing (Proposal).', who: 'Program Owner', at: { stage: ['infringing'], story: ['US-014'], journey: ['infringing'] }, primary: R('FDSC', 'infringing') },
    { id: 'Q-002', q: 'Are there further attachments beyond the proposed set (D064 report, S137/S138/S137A certificates, D128 record, Data Block Approval, photos, signed D141)?', why: 'Determines related lists and whether any file is mandatory to complete a stage.', assume: 'Proposed set only; no attachment is mandatory.', who: 'Program Owner', at: { stage: ['dba', 'd064', 'd128', 'cert'], story: ['US-013'], journey: ['d064', 'd128', 'cert'] }, primary: R('FDSC', 'd064') },
    { id: 'Q-003', q: 'What exactly does Data Block Approval mean, who gives it and what evidence exists?', why: 'The stage name and gate depend on it.', assume: 'Approval of the camera data block by a central unit; one date and one document.', who: 'Program Owner', at: { field: ['dDBA'], stage: ['dba'], story: ['US-027'], journey: ['dba'] }, primary: R('FDSC', 'dba', 'dDBA') },
    { id: 'Q-004', q: 'What exactly does "D128 Network Commissioned" mean and who signs it off?', why: 'Decides the network fields required at this gate and the actor (Camera Networks?).', assume: 'The camera is connected and communicating; router and IPs recorded.', who: 'Camera Networks Engineer', at: { field: ['dD128'], stage: ['d128'], story: ['US-025', 'US-027'], journey: ['d128'] }, primary: R('FDSC', 'd128', 'dD128') },
    { id: 'Q-005', q: 'Is the stage order (Installed, Data Block Approval, D064, D128, Certification, Warning, Infringing) always strict?', why: 'The Path enforces order and date order validation assumes it.', assume: 'Strict order, as the Excel date columns are laid out.', who: 'Program Owner', at: { stage: ['dba', 'd064', 'd128'], story: ['US-011', 'US-027'], journey: ['journey-order'] }, primary: { t: 'journey', step: 'planned' } },
    { id: 'Q-006', q: 'Are Decommission and Refurbish activity types on one lifecycle, or statuses/separate processes with their own stages?', why: 'Changes the data model (field vs. status vs. separate record types) and the Path.', assume: 'Activity Type picklist on Site; same stages (Proposal).', who: 'Program Owner', at: { field: ['activity'], story: ['US-015', 'US-017'], journey: ['decom-req', 'ref-scope'] }, primary: R('FDSC', 'installed', 'activity') },
    { id: 'Q-007', q: 'Should fields lock when a stage is complete, and who may reopen it?', why: 'Locking protects data but blocks corrections.', assume: 'No locking; anyone with edit access can reopen.', who: 'CMCS Data Steward', at: { story: ['US-023'], stage: ['cert'] }, primary: R('FDSC', 'cert') },
    { id: 'Q-008', q: 'Which fields must be complete at each stage?', why: 'Drives the Mark Status as Complete gate.', assume: 'The STAGE_REQ default shown in the checklist (Proposal).', who: 'Technical Project Manager (TPM)', at: { stage: ['installed', 'd064', 'd128'], story: ['US-010', 'US-025'], journey: ['installed', 'd064', 'd128'] }, primary: R('FDSC', 'd064') },
    { id: 'Q-009', q: 'What are the allowed values for Camera Road Side?', why: 'Free text allows inconsistent entries.', assume: 'Free text.', who: 'CMCS Data Steward', at: { field: ['roadSide'] }, primary: R('FDSC', 'installed', 'roadSide') },
    { id: 'Q-010', q: 'What are the allowed values for Headed Lane Configuration?', why: 'Free text allows inconsistent entries.', assume: 'Free text.', who: 'CMCS Data Steward', at: { field: ['headedLane'] }, primary: R('FDSC', 'installed', 'headedLane') },
    { id: 'Q-011', q: 'Can LGC and Nearest Court come from reference lists?', why: 'Picklists/lookups would prevent misspellings.', assume: 'Free text.', who: 'CMCS Data Steward', at: { field: ['lgc', 'court'] }, primary: R('FDSC', 'installed', 'lgc') },
    { id: 'Q-012', q: 'What is the real Camera Code (Site No.) format?', why: 'A strict pattern catches typos but must match reality.', assume: '3 to 20 characters: letters, numbers, hyphen; unique.', who: 'CMCS Data Steward', at: { field: ['code'], story: ['US-003'] }, primary: R('FDSC', 'installed', 'code') },
    { id: 'Q-013', q: 'Is the signed D141 PDF still needed once data is captured in Salesforce?', why: 'Decides whether to generate a PDF or retire it.', assume: 'Keep a slot for a signed PDF; generation not built.', who: 'Program Owner', at: { stage: ['infringing'], story: ['US-024'] }, primary: R('FDSC', 'infringing') },
    { id: 'Q-014', q: 'Are the stage-gate rules the same for Decommission and Refurbish as for a new commission?', why: 'A decommission has no certification or warning period.', assume: 'Same gates (Proposal), branches shown in the journey.', who: 'Program Owner', at: { journey: ['decom-off', 'ref-recert'] }, primary: { t: 'journey', step: 'decom-off' } },
    { id: 'Q-015', q: 'What values does ASC Zone take and how does it relate to Zone Number?', why: 'Average speed zones link multiple cameras.', assume: 'Zone Number is a whole number; ASC Zone is free text.', who: 'Technical Project Manager (TPM)', at: { field: ['ascZone', 'ascZoneNo'], story: ['US-028'] }, primary: R('ASC', 'installed', 'ascZoneNo') }
  ];
  // back-fill story->question from question.at.story
  QUESTIONS.forEach((q) => (q.at.story || []).forEach((sid) => { const s = STORIES.filter((x) => x.id === sid)[0]; if (s && s.qs.indexOf(q.id) < 0) s.qs.push(q.id); }));

  /* ---------------- journey ---------------- */
  const J = (id, name, kind, rec, actor, data, attach, gates, pain, extra) => ({ id, name, kind, rec, actor, data, attach, gates, pain, ...extra });
  const JOURNEY = [
    J('planned', 'Site Planned', 'main', null, 'Technical Project Manager', ['Program (record type)', 'Camera Code', 'Suburb', 'Region', 'Activity Type'], [], ['Camera Code unique and well-formed', 'Region and Activity from lists'], 'Excel D141 copied per site; code and suburb typed from CEBDB/CES by hand.', { ref: { t: 'new' } }),
    J('installed', 'Camera Installed', 'main', 'installed', 'Technical Project Manager', null, ['PHOTO'], ['Lat/long range and NSW warning', 'Equipment from program lists', 'Install date'], 'Same coordinates and equipment later re-keyed into CMCS; typos in lat/long.'),
    J('dba', 'Data Block Approved', 'main', 'dba', 'Technical Project Manager', null, ['DBA'], ['Date not before installation'], 'Approval evidence lives in email/Objective; date copied by hand.'),
    J('d064', 'Site Inspected (D064)', 'main', 'd064', 'Technical Project Manager', null, ['D064'], ['Directions/modes from lists', 'School zone times only when School Zone = Yes', 'Date not before Data Block Approval'], 'Inspection report filed separately; school zone times often left blank or wrong.'),
    J('d128', 'Network Commissioned (D128)', 'main', 'd128', 'Camera Networks Engineer', null, ['D128'], ['IPv4 format for router and camera', 'Date not before D064'], 'IP addresses mistyped; data re-keyed by another business unit.'),
    J('cert', 'Certified', 'main', 'cert', 'Technical Project Manager', null, ['S137', 'S138', 'S137A'], ['Certification dates not before D128'], 'Certificates tracked in different places from the D141.'),
    J('warning', 'Warning Period', 'main', 'warning', 'Technical Project Manager', null, [], ['Date not before certification', 'Not applicable to ASC'], 'Start date relayed by email to unit managers.'),
    J('infringing', 'Enforcement Live', 'main', 'infringing', 'Technical Project Manager, Unit Manager', null, ['D141'], ['Date not before warning start', 'All earlier stages complete'], 'Signed PDF emailed; CMCS team re-keys the final record and distrusts it.'),
    J('decom-req', 'Decommission Requested', 'decom', null, 'Technical Project Manager', ['Activity Type = Decommission', 'Request date (Proposal)'], [], ['Site is currently Enforcement Live'], 'New Excel form raised for a site that already exists.', { ref: R('FDSC', 'installed', 'activity'), branchFrom: 'infringing' }),
    J('decom-off', 'Enforcement Stopped, Camera Removed', 'decom', null, 'Technical Project Manager', ['Stop date (Proposal)', 'Removal date (Proposal)'], ['PHOTO'], ['Stop date not before request'], 'No consistent record of when enforcement stopped.', { ref: { t: 'record', rt: 'RLSC', id: 's4' } }),
    J('decom-close', 'Site Closed in CMCS', 'decom', null, 'CMCS Data Steward', ['Closed status (Proposal)'], [], ['No open stages'], 'Closure re-keyed separately.', { ref: { t: 'record', rt: 'RLSC', id: 's4' } }),
    J('ref-scope', 'Refurbishment Scoped', 'refurb', null, 'Technical Project Manager', ['Activity Type = Refurbish', 'Changed equipment (Proposal)'], [], ['Site exists'], 'Changes tracked by re-editing the old Excel.', { ref: { t: 'record', rt: 'ODES', id: 's10' }, branchFrom: 'infringing' }),
    J('ref-work', 'Equipment Replaced or Updated', 'refurb', null, 'Technical Project Manager, Camera Networks Engineer', ['Updated equipment, serials, IPs'], ['PHOTO'], ['Same validation as original entry'], 'Old values overwritten without history.', { ref: { t: 'record', rt: 'ODES', id: 's10' } }),
    J('ref-recert', 'Re-inspected and Re-certified', 'refurb', 'cert', 'Technical Project Manager', ['New inspection and certification dates'], ['D064', 'S138'], ['Dates after refurbishment work'], 'Unclear which certificate is current.', { rejoin: 'cert' })
  ];
  JOURNEY.forEach((j) => { j.proposedName = true; });

  function qFor(at) { // at: {field, stage, story, journey}
    return QUESTIONS.filter((q) => Object.keys(at).some((dim) => at[dim] && (q.at[dim] || []).indexOf(at[dim]) >= 0));
  }
  function storiesFor(screenT) { return STORIES.filter((s) => s.screens.some((r) => r.t === screenT)); }

  /* answers stored in the browser only */
  const AK = 'enf-d141-answers';
  function answers() { try { return JSON.parse(localStorage.getItem(AK) || '{}'); } catch (e) { return {}; } }
  function setAnswer(id, status, text) { const a = answers(); a[id] = { status, text }; try { localStorage.setItem(AK, JSON.stringify(a)); } catch (e) {} }

  window.BL = { ROLES, EPICS, STAGE_NAME, STORIES, QUESTIONS, JOURNEY, href, label, qFor, storiesFor, answers, setAnswer, SAMPLE };
})();
