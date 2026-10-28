/* D141 Site Onboarding mockup - data model and sample data.
   All sample records are FAKE (TEST-xxxx, 192.0.2.x documentation IPs).
   Structure is aligned (as a Proposal, to confirm) with the live CMCS Site page seen in owner-supplied screenshots:
   Site plus child objects Lane, Camera Program, Enforcement Device, Certificate. */
(function () {
  const ALL = ['FDSC', 'RLSC', 'BPES', 'ASC', 'ODES'];
  const PROGRAMS = {
    FDSC: { name: 'Fixed Digital Speed Camera', desc: 'Fixed digital speed enforcement camera site.' },
    RLSC: { name: 'Red Light Speed Camera', desc: 'Red light and speed camera site (adds TCS ID).' },
    BPES: { name: 'Bus Priority Enforcement System', desc: 'Bus priority lane enforcement. No speed limit, SMD or flash type.' },
    ASC: { name: 'Average Speed Camera', desc: 'Average speed camera zone (adds Zone number and ASC Zone). No warning letter stage.' },
    ODES: { name: 'Over Dimension Enforcement System', desc: 'Over dimension enforcement (adds DMD and S137A certificate).' }
  };
  const L = {
    REGIONS: ['Sydney', 'Hunter', 'South Western', 'Southern', 'Northern', 'Western'],
    ZONES: ['Zone 1 (Metro)', 'Zone 2 (Regional)'],
    DIRECTIONS: ['East', 'East & West', 'Median Strip', 'N/A', 'North', 'North & South', 'North East', 'North West', 'On Spot', 'Overhead', 'South', 'South East', 'South West', 'Unknown', 'West', 'West & East'],
    MODES: ['Away From', 'Bi-directional', 'Towards', 'N/A'],
    ENV: ['Roadside', 'Tunnel'],
    LANES: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    FLASH: ['Infrared', 'Infrared (Non Visible)', 'Main & Auxiliary Infrared', 'Visible flash', 'White Flash (Visible)'],
    SENSOR: ['Piezo-Loop-Piezo', 'Piezo-Loop-Piezo and LL', 'Piezo-Loop-Piezo and TIRTL', 'Piezo-Loop-Piezo and Loop-Loop', 'Piezo-Piezo-Piezo', 'Loop-Loop', 'Radar and TIRTL', 'LL and PLP', 'LL'],
    YNNA: ['Yes', 'No', 'N/A'],
    SPEED: ['10', '20', '30', '40', '50', '60', '70', '80', '90', '100', '110', '50/40', '60/40', '70/40', '80/40', '90/40', '100/40'],
    ACTIVITY: ['Commission', 'Decommission', 'Refurbish'],
    STATUS: ['Active', 'Decommissioned', 'Decommissioned - Camera removed', 'Decommissioned - Camera upgraded'],
    SITETYPE: ['Red Light Camera', 'MOB'],
    LANESTATUS: ['Active', 'Inactive'],
    ENFTYPES: ['Red Light', 'Speed', 'Bus Priority', 'Average Speed', 'Over Dimension'],
    LANECONF: ['Through', 'Left Turn', 'Right Turn', 'Through and Right', 'Bus Lane'],
    SYSTEMTYPES: ['Red Light Camera', 'Fixed Digital Speed Camera', 'Average Speed Camera', 'Bus Priority Enforcement System', 'Over Dimension Enforcement System'],
    SMD: {
      FDSC: ['REDFLEXred-speed Infringement Detection System', 'Redflex OTL Radar', 'TESS Digital Capture Unit', 'Traffipax SMD', 'Traffistar SR520'],
      RLSC: ['Redflex SR 102', 'TESS Digital Capture Unit', 'Traffistar SR590', 'Traffistar SR520']
    },
    CRD: {
      FDSC: ['REDFLEXred-speed Camera System', 'Redflex OTL Radar', 'TESS Digital Capture Unit', 'Robot SmartCamera 3'],
      RLSC: ['Redflex SR 102', 'TESS Digital Capture Unit', 'Traffistar SR590', 'Traffistar SR520'],
      BPES: ['Redflex Camera and Redflex Express System configured in Bus Priority Mode'],
      ASC: ['Redflex Halo Distributed', 'Redflex SR 102', 'TESS Digital Capture Unit', 'Gatso SpeedPoint Plus GT20-S', 'CEOS HARECam Camera System (5MPX)', 'CEOS HAREcam Camera System (12MPX)'],
      ODES: ['DRS101', 'TESS Digital Capture Unit – Multi Aspect']
    },
    DMD: { ODES: ['CEOS OLVD'] }
  };
  const SPEEDP = ['FDSC', 'RLSC', 'ASC'];
  const CRDN = 'Camera Recording Device (CRD)', SMDN = 'Speed Measurement Device (SMD)', DMDN = 'Dimensional Measurement Device (DMD)';
  const DEVTYPES = { FDSC: [CRDN, SMDN], RLSC: [CRDN, SMDN], BPES: [CRDN], ASC: [CRDN], ODES: [CRDN, DMDN] };
  function devModels(type, rt) { return type === CRDN ? (L.CRD[rt] || []) : type === SMDN ? (L.SMD[rt] || []) : type === DMDN ? (L.DMD[rt] || []) : []; }
  function certTypes(rt) { return rt === 'ODES' ? ['S137A', 'S138'] : (rt === 'BPES' || rt === 'ASC') ? ['S138'] : ['S137', 'S138']; }

  /* Site fields. t: text|pick|int|latlng|ip|date|time|bool|formula|code ; col L/R for live-layout sections;
     ex = exists on live Site per owner screenshot; prop = Proposal note; liveSec: section as seen live */
  const F = [
    // Site Location (live)
    { k: 'code', l: 'Site No', t: 'code', sec: 'loc', col: 'L', max: 20, ex: 'Site No exists on Site (screenshot). Assumed the same as D141 Camera Code (Site No.) - Q-019.' },
    { k: 'siteType', l: 'Site Type', t: 'pick', o: L.SITETYPE, sec: 'loc', col: 'L', ex: 'Site Type exists on Site. Only two values seen so far (Red Light Camera, MOB) - Q-017, Q-020.' },
    { k: 'street1', l: 'Site Address', t: 'text', sec: 'loc', col: 'L', max: 120, ex: 'Site Address exists (screenshot). D141 Main Street (Street 1) assumed to map here - Q-021.', map: true },
    { k: 'approxLoc', l: 'Approx. Location', t: 'text', sec: 'loc', col: 'L', max: 120, ex: 'Approx. Location exists on Site (screenshot).' },
    { k: 'roadNo', l: 'Road Number', t: 'text', sec: 'loc', col: 'L', max: 40, ex: 'Road Number exists on Site (screenshot).' },
    { k: 'cross1', l: 'Cross Street', t: 'text', sec: 'loc', col: 'L', max: 120, ex: 'Cross Street exists on Site (screenshot).' },
    { k: 'suburb', l: 'Suburb', t: 'text', sec: 'loc', col: 'L', max: 80, ex: 'Suburb is in the live highlights panel (screenshot).' },
    { k: 'status', l: 'Status', t: 'pick', o: L.STATUS, sec: 'loc', col: 'R', ex: 'Status exists with these values (screenshot). Whether it carries the lifecycle is Q-016.' },
    { k: 'region', l: 'Region', t: 'pick', o: L.REGIONS, sec: 'loc', col: 'R', ex: 'Region exists on Site (screenshot).' },
    { k: 'location', l: 'Location', t: 'formula', sec: 'loc', col: 'R', ex: 'Location is a formula: "Street A and Street B, Suburb" (screenshot).' },
    { k: 'zone', l: 'Zone', t: 'pick', o: L.ZONES, sec: 'loc', col: 'R', ex: 'Zone exists on Site (screenshot).' },
    { k: 'cross2', l: 'Other Cross', t: 'text', sec: 'loc', col: 'R', max: 120, ex: 'Other Cross exists on Site (screenshot).' },
    { k: 'ubd', l: 'UBD Map', t: 'text', sec: 'loc', col: 'R', max: 40, prop: 'D141 column not seen on the live Site page; assumed missing (to confirm).' },
    { k: 'activity', l: 'Activity Type', t: 'pick', o: L.ACTIVITY, sec: 'loc', col: 'R', prop: 'Proposed field: Commission, Decommission or Refurbish. May map to Status (Q-022).' },
    // Site Details (live)
    { k: 'vendor', l: 'Vendor', t: 'text', sec: 'det', col: 'L', max: 80, lookup: true, ex: 'Vendor is a lookup on Site (screenshot). Mockup uses text until target and values are known - Q-018.' },
    { k: 'vendorManaged', l: 'Vendor Managed', t: 'bool', sec: 'det', col: 'L', ex: 'Vendor Managed checkbox exists (screenshot). Might relate to D141 Vendor Pay Type (Q-023).' },
    { k: 'lgc', l: 'LGA', t: 'text', sec: 'det', col: 'L', max: 80, ex: 'LGA exists (screenshot). D141 "LGC (Local Government Council)" assumed to map here.' },
    { k: 'court', l: 'Nearest Local Court', t: 'text', sec: 'det', col: 'L', max: 80, ex: 'Nearest Local Court exists (screenshot).' },
    { k: 'speed', l: 'Speed Limit (Main Road Main Dir.)', t: 'pick', o: L.SPEED, sec: 'det', col: 'R', p: SPEEDP, ex: 'Speed Limit (Main Road Main Dir.) exists (screenshot).' },
    { k: 'sensor', l: 'Sensor Type', t: 'pick', o: L.SENSOR, sec: 'det', col: 'R', ex: 'Sensor Type exists (screenshot). Live values not seen; D141 list used.' },
    { k: 'secondVerif', l: '2nd Verification', t: 'pick', o: L.YNNA, sec: 'det', col: 'R', ex: '2nd Verification exists (screenshot). Meaning unknown - Q-024. Yes/No/N/A is a placeholder.' },
    { k: 'flash', l: 'Flash Type', t: 'pick', o: L.FLASH, sec: 'det', col: 'R', p: ['FDSC', 'RLSC', 'ASC', 'ODES'], ex: 'Flash Type exists (screenshot).' },
    { k: 's138single', l: 's138 - Only 1 image produced', t: 'bool', sec: 'det', col: 'R', info: 'Label only (section of legislation). Meaning of the rule is not explained here.', ex: 's138 - Only 1 image produced checkbox exists (screenshot).' },
    // Site Coordinates (live: combined fields)
    { k: 'camGps', l: 'Camera GPS Coordinates (Lat, Long)', t: 'latlng', sec: 'coord', col: 'L', info: 'Enter as "latitude, longitude", e.g. -33.8688, 151.2093. Latitude -90 to 90, longitude -180 to 180.', ex: 'Combined Lat, Long field exists (screenshot). Replaces two D141 columns.' },
    { k: 'cabGps', l: 'Road Side Cabinet Coordinates (Lat,Long)', t: 'latlng', sec: 'coord', col: 'R', info: 'Enter as "latitude, longitude".', ex: 'Combined Lat, Long field exists (screenshot). Replaces two D141 columns.' },
    { k: 'spdGps', l: 'SPD Coordinates (Lat, Long)', t: 'latlng', sec: 'coord', col: 'L', prop: 'D141 SPD latitude/longitude not seen on the live page; assumed missing (to confirm).' },
    // Monitoring (D141, proposed)
    { k: 'dirMon', l: 'Directions Monitored', t: 'pick', o: L.DIRECTIONS, sec: 'mon', ex: 'Directions Monitored is in the live highlights panel (screenshot).' },
    { k: 'modeMon', l: 'Mode Monitored', t: 'pick', o: L.MODES, sec: 'mon' },
    { k: 'priDir', l: 'Primary Direction', t: 'pick', o: L.DIRECTIONS, sec: 'mon' },
    { k: 'priMode', l: 'Primary Mode', t: 'pick', o: L.MODES, sec: 'mon' },
    { k: 'secDir', l: 'Secondary Direction', t: 'pick', o: L.DIRECTIONS, sec: 'mon' },
    { k: 'secMode', l: 'Secondary Mode', t: 'pick', o: L.MODES, sec: 'mon' },
    { k: 'roadSide', l: 'Camera Road Side', t: 'text', sec: 'mon', max: 40, prop: 'No value list supplied for Camera Road Side; free text.' },
    { k: 'env', l: 'Environment Type', t: 'pick', o: L.ENV, sec: 'mon' },
    { k: 'headedLane', l: 'Headed Lane Configuration', t: 'text', sec: 'mon', max: 80, prop: 'May be covered by Lane.Lane Configuration on the live model (Q-025); free text meanwhile.' },
    { k: 'avoidance', l: 'Avoidance', t: 'pick', o: L.YNNA, sec: 'mon', p: ['BPES', 'ASC', 'ODES'] },
    // Equipment and settings (D141, proposed)
    { k: 'loop', l: 'Filter/Departure Loop', t: 'pick', o: L.YNNA, sec: 'eq' },
    { k: 'tirtl', l: 'TIRTL', t: 'pick', o: L.YNNA, sec: 'eq' },
    { k: 'multi', l: 'Multi Aspect', t: 'pick', o: L.YNNA, sec: 'eq' },
    { k: 'rscSerial', l: 'RSC Serial Number', t: 'text', sec: 'eq', max: 60 },
    { k: 'vendorPay', l: 'Vendor Pay Type', t: 'text', sec: 'eq', max: 60, prop: 'No value list supplied; free text.' },
    { k: 'vsl', l: 'Variable Speed Limit', t: 'pick', o: L.YNNA, sec: 'eq', p: SPEEDP },
    { k: 'tcs', l: 'TCS ID', t: 'text', sec: 'eq', max: 40, p: ['RLSC'] },
    { k: 'ascZoneNo', l: 'Zone Number', t: 'int', sec: 'eq', p: ['ASC'] },
    { k: 'ascZone', l: 'ASC Zone', t: 'text', sec: 'eq', max: 60, p: ['ASC', 'ODES'], prop: 'ASC Zone value list not supplied; free text.' },
    // School zone (proposed)
    { k: 'schoolZone', l: 'School Zone', t: 'pick', o: L.YNNA, sec: 'sz' },
    { k: 'szAmStart', l: 'School Zone Morning Start', t: 'time', sec: 'sz', sz: true },
    { k: 'szAmEnd', l: 'School Zone Morning End', t: 'time', sec: 'sz', sz: true },
    { k: 'szPmStart', l: 'School Zone Afternoon Start', t: 'time', sec: 'sz', sz: true },
    { k: 'szPmEnd', l: 'School Zone Afternoon End', t: 'time', sec: 'sz', sz: true },
    // Network tab (proposed placement)
    { k: 'routerModel', l: 'Router Model/Type', t: 'text', sec: 'net', max: 60 },
    { k: 'routerSerial', l: 'Router Serial No.', t: 'text', sec: 'net', max: 60 },
    { k: 'ipRouter', l: 'IP Address (Router-EC)', t: 'ip', sec: 'net' },
    { k: 'ipCam', l: 'IP Address (Camera)', t: 'ip', sec: 'net' },
    { k: 'ecVersion', l: 'EC Version', t: 'text', sec: 'net', max: 40 },
    { k: 'ecSerial', l: 'EC Serial', t: 'text', sec: 'net', max: 60 },
    // Lifecycle dates (proposed layer; rendered inside stage panels)
    { k: 'dInstalled', l: 'Camera Installed Date', t: 'date', sec: 'life' },
    { k: 'dDBA', l: 'Data Block Approval Date', t: 'date', sec: 'life' },
    { k: 'dD064', l: 'D064 Site Inspection Date', t: 'date', sec: 'life' },
    { k: 'dD128', l: 'D128 Network Commissioned Date', t: 'date', sec: 'life' },
    { k: 'dWarn', l: 'Warning Letter Start Date', t: 'date', sec: 'life', p: ['FDSC', 'RLSC', 'BPES', 'ODES'] },
    { k: 'dInf', l: 'Infringing Date (Enforcement Live)', t: 'date', sec: 'life' }
  ];
  F.forEach(function (f) { f.p = f.p || ALL; });

  /* Child objects (live: Lanes, Camera Programs, Enforcement Devices, Certificates) */
  const CH = {
    lane: { label: 'Lane', plural: 'Lanes Configuration', fields: [
      { k: 'no', l: 'Lane Number', t: 'pick', o: L.LANES, req: true },
      { k: 'status', l: 'Status', t: 'pick', o: L.LANESTATUS, req: true },
      { k: 'types', l: 'Enforcement Types', t: 'pick', o: L.ENFTYPES, req: true, prop: 'Only "Red Light" seen live; other values are assumed.' },
      { k: 'config', l: 'Lane Configuration', t: 'pick', o: L.LANECONF, prop: 'Values not seen live; assumed.' }] },
    program: { label: 'Camera Program', plural: 'Camera Programs', fields: [
      { k: 'systemType', l: 'System Type', t: 'pick', o: L.SYSTEMTYPES, req: true, prop: 'Only "Red Light Camera" seen live; other values assumed (Q-017).' },
      { k: 'subType', l: 'Sub Type', t: 'text', max: 40, prop: 'Values unknown (e.g. RLC-WetFilm seen); free text - Q-026.' },
      { k: 'warranty', l: 'Warranty Expiry', t: 'date', plain: true, req: true }] },
    device: { label: 'Enforcement Device', plural: 'Enforcement Devices', fields: [
      { k: 'type', l: 'Device Type', t: 'pick', req: true, prop: 'Device types assumed from D141 (CRD, SMD, DMD).' },
      { k: 'model', l: 'Model', t: 'pick', req: true },
      { k: 'serial', l: 'Serial Number', t: 'text', max: 60, req: true }] },
    cert: { label: 'Certificate', plural: 'Certificates', fields: [
      { k: 'type', l: 'Certificate Type', t: 'pick', req: true },
      { k: 'date', l: 'Certificate Date', t: 'date', req: true }] }
  };
  const CHKEY = { lane: 'lanes', program: 'programs', device: 'devices', cert: 'certs' };

  const SECTIONS = [
    { id: 'loc', title: 'Site Location', live: true },
    { id: 'det', title: 'Site Details', live: true },
    { id: 'coord', title: 'Site Coordinates', live: true },
    { id: 'mon', title: 'Monitoring (D141 columns)', live: false },
    { id: 'eq', title: 'Equipment and Settings (D141 columns)', live: false },
    { id: 'sz', title: 'School Zone (D141 columns)', live: false },
    { id: 'net', title: 'Network', tab: 'network', live: false },
    { id: 'sys', title: 'System Information', live: true }
  ];

  const FILETYPES = {
    PHOTO: 'Site Photo', DBA: 'Data Block Approval', D064: 'D064 Site Inspection Report',
    D128: 'D128 Commissioning Record', S137: 'S137 Certificate', S138: 'S138 Certificate',
    S137A: 'S137A Certificate', D141: 'Signed D141 PDF'
  };

  function stages(rt) {
    const s = [
      { id: 'installed', label: 'Camera Installed', dates: ['dInstalled'], att: ['PHOTO'] },
      { id: 'dba', label: 'Data Block Approval', dates: ['dDBA'], att: ['DBA'] },
      { id: 'd064', label: 'D064 Site Inspection', dates: ['dD064'], att: ['D064'] },
      { id: 'd128', label: 'D128 Network Commissioned', dates: ['dD128'], att: ['D128'] },
      { id: 'cert', label: 'Certification', dates: [], att: certTypes(rt), certs: certTypes(rt) }
    ];
    if (rt !== 'ASC') s.push({ id: 'warning', label: 'Warning Letter Start', dates: ['dWarn'], att: [] });
    s.push({ id: 'infringing', label: 'Infringing', dates: ['dInf'], att: ['D141'] });
    return s;
  }
  /* Proposal: Site fields and child records required to complete each stage */
  const STAGE_REQ = {
    installed: ['code', 'suburb', 'region', 'activity', 'street1', 'camGps', 'env', 'vendor'],
    dba: [],
    d064: ['dirMon', 'modeMon', 'priDir', 'priMode', 'schoolZone', 'speed'],
    d128: ['sensor', 'routerModel', 'routerSerial', 'ipRouter', 'ipCam', 'ecVersion', 'ecSerial'],
    cert: [], warning: [], infringing: []
  };
  const ALWAYS_REQ = ['code', 'suburb', 'region', 'activity'];
  function childReq(rt, stageId) { // Proposal
    if (stageId === 'installed') return { lane: 1, program: 1, device: DEVTYPES[rt] };
    if (stageId === 'cert') return { cert: certTypes(rt) };
    return {};
  }
  const STAGE_HELP = {
    installed: 'Camera installed. Core site, location, lanes, camera program and enforcement devices are captured here.',
    dba: 'Data Block Approval. (Open question: exact meaning to be confirmed by the owner.)',
    d064: 'D064 Site Inspection. Monitoring directions, school zone and speed settings are confirmed.',
    d128: 'D128 Network Commissioned. (Open question: exact meaning to be confirmed by the owner.) Router, IP and EC details are captured.',
    cert: 'Certificates are added as child records (S137, S138, S137A are labels only). Their dates must follow D128 and precede the warning letter start.',
    warning: 'Warning letter period starts. Not applicable to Average Speed Cameras.',
    infringing: 'Enforcement is live. The signed D141 PDF is proposed to be attached here.'
  };

  function fieldsFor(rt) { return F.filter(function (f) { return f.p.indexOf(rt) >= 0; }); }
  function opts(f, rt, v) { if (f.oFn) return f.oFn(v || {}, rt); return Array.isArray(f.o) ? f.o : (f.o ? (f.o[rt] || []) : []); }
  CH.device.fields[0].oFn = function (v, rt) { return DEVTYPES[rt] || []; };
  CH.device.fields[1].oFn = function (v, rt) { return devModels(v.type, rt); };
  CH.cert.fields[0].oFn = function (v, rt) { return certTypes(rt); };
  function locationOf(v) { v = v || {}; const a = [v.street1, v.cross1].filter(Boolean).join(' and '); return [a, v.suburb].filter(Boolean).join(', '); }

  /* ---------- sample data ---------- */
  function mk(id, rt, code, activity, doneCount, o) {
    o = o || {};
    const n = parseInt(code.slice(-4), 10);
    const base = {
      code: code, status: 'Active', siteType: rt === 'RLSC' ? 'Red Light Camera' : '', suburb: 'Testville', region: L.REGIONS[n % 6], zone: L.ZONES[n % 2], activity: activity,
      street1: 'Test Road', cross1: 'Fake Street', cross2: n % 2 ? 'Sample Avenue' : '', approxLoc: 'Near the fake roundabout', roadNo: 'TEST-' + n, ubd: 'UBD 000 A' + n,
      lgc: 'Testville Council', court: 'Test Local Court', vendor: 'Test Vendor Pty Ltd', vendorManaged: n % 2 ? 'true' : '', secondVerif: 'No', s138single: '',
      camGps: '-33.0000' + n + ', 151.0000' + n, cabGps: '-33.0001' + n + ', 151.0001' + n, spdGps: '-33.0002' + n + ', 151.0002' + n,
      dirMon: 'North', modeMon: 'Towards', priDir: 'North', priMode: 'Towards', secDir: 'N/A', secMode: 'N/A', roadSide: 'Left', env: 'Roadside', headedLane: 'Lane 1 headed', avoidance: 'No',
      flash: 'Infrared', sensor: 'Loop-Loop', loop: 'No', tirtl: 'No', multi: 'No', rscSerial: 'TEST-RSC-' + n, vendorPay: 'Test Pay Type',
      speed: '60', vsl: 'No', tcs: 'TCS-TEST-' + n, ascZoneNo: '1', ascZone: 'Test ASC Zone A',
      routerModel: 'Test Router X1', routerSerial: 'TEST-RTR-' + n, ipRouter: '192.0.2.' + (10 + n), ipCam: '192.0.2.' + (100 + n), ecVersion: 'EC-TEST-1.0', ecSerial: 'TEST-EC-' + n,
      schoolZone: 'Yes', szAmStart: '07:30', szAmEnd: '09:30', szPmStart: '14:30', szPmEnd: '16:00'
    };
    const v = {};
    fieldsFor(rt).forEach(function (f) { if (f.sec !== 'life' && f.t !== 'formula' && base[f.k] !== undefined) v[f.k] = base[f.k]; });
    const st = stages(rt); const done = [];
    const dateOf = function (i, j) { return new Date(Date.UTC(2026, 0, 10 + i * 14 + (j || 0))).toISOString().slice(0, 10); };
    const certs = [];
    st.forEach(function (s, i) {
      if (i < doneCount) {
        done.push(s.id);
        s.dates.forEach(function (dk, j) { v[dk] = dateOf(i, j); });
        if (s.certs) s.certs.forEach(function (t, j) { certs.push({ id: id + '_c' + j, type: t, date: dateOf(i, j) }); });
      }
    });
    Object.keys(o).forEach(function (k) { if (k === 'drop') o.drop.forEach(function (x) { delete v[x]; }); else if (['noChildren'].indexOf(k) < 0 && k !== 'status') v[k] = o[k]; });
    if (activity === 'Decommission') v.status = o.status || 'Decommissioned - Camera removed';
    const files = [];
    done.forEach(function (sid) { st.filter(function (s) { return s.id === sid; })[0].att.slice(0, 1).forEach(function (t) { files.push({ id: id + '_' + t, type: t, name: code + '_' + t + '_SAMPLE.pdf', size: 120400, added: '2026-02-01' }); }); });
    const lanes = [], devices = [], programs = [];
    if (!o.noChildren) {
      const nl = 1 + (n % 3) + (rt === 'BPES' ? 0 : 1);
      for (let i = 1; i <= nl; i++) lanes.push({ id: id + '_l' + i, no: String(i), status: 'Active', types: rt === 'RLSC' ? 'Red Light' : rt === 'BPES' ? 'Bus Priority' : rt === 'ASC' ? 'Average Speed' : rt === 'ODES' ? 'Over Dimension' : 'Speed', config: 'Through' });
      programs.push({ id: id + '_p1', systemType: rt === 'RLSC' ? 'Red Light Camera' : rt === 'FDSC' ? 'Fixed Digital Speed Camera' : rt === 'ASC' ? 'Average Speed Camera' : rt === 'BPES' ? 'Bus Priority Enforcement System' : 'Over Dimension Enforcement System', subType: 'TEST-SUB-' + n, warranty: '2030-06-30' });
      DEVTYPES[rt].forEach(function (t, i) { devices.push({ id: id + '_d' + i, type: t, model: devModels(t, rt)[0], serial: 'TEST-DEV-' + n + '-' + (i + 1) }); });
    }
    const cd = new Date(Date.UTC(2026, 0, 5 + (n % 20), 1, 30 + n)); const md = new Date(Date.UTC(2026, 8, 1 + (n % 25), 3, 5 + n));
    return { id: id, rt: rt, v: v, done: done, files: files, lanes: lanes, programs: programs, devices: devices, certs: certs, created: cd.toISOString(), modified: md.toISOString() };
  }
  function seed() {
    return [
      mk('s1', 'FDSC', 'TEST-0001', 'Commission', 3),
      mk('s2', 'FDSC', 'TEST-0002', 'Commission', 7),
      mk('s3', 'RLSC', 'TEST-0003', 'Commission', 1, { drop: ['cabGps', 'spdGps', 'tcs', 'routerModel', 'schoolZone', 'szAmStart', 'szAmEnd', 'szPmStart', 'szPmEnd'], noChildren: true }),
      mk('s4', 'RLSC', 'TEST-0004', 'Decommission', 5),
      mk('s5', 'BPES', 'TEST-0005', 'Commission', 4),
      mk('s6', 'BPES', 'TEST-0006', 'Refurbish', 0, { drop: ['camGps'], noChildren: true }),
      mk('s7', 'ASC', 'TEST-0007', 'Commission', 5),
      mk('s8', 'ASC', 'TEST-0008', 'Commission', 2, { schoolZone: 'No', szAmStart: '', szAmEnd: '', szPmStart: '', szPmEnd: '' }),
      mk('s9', 'ODES', 'TEST-0009', 'Commission', 6),
      mk('s10', 'ODES', 'TEST-0010', 'Refurbish', 3),
      mk('s11', 'FDSC', 'TEST-0011', 'Decommission', 7, { status: 'Decommissioned - Camera upgraded' })
    ];
  }
  window.D141 = { ALL: ALL, PROGRAMS: PROGRAMS, L: L, F: F, CH: CH, CHKEY: CHKEY, SECTIONS: SECTIONS, FILETYPES: FILETYPES, stages: stages, certTypes: certTypes, DEVTYPES: DEVTYPES, devModels: devModels,
    STAGE_REQ: STAGE_REQ, ALWAYS_REQ: ALWAYS_REQ, childReq: childReq, STAGE_HELP: STAGE_HELP, fieldsFor: fieldsFor, opts: opts, seed: seed, locationOf: locationOf };
})();
