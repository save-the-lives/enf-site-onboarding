/* D141 Site Onboarding mockup - data model and sample data.
   All sample records are FAKE (TEST-xxxx, 192.0.2.x documentation IPs). */
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
  /* t: text|pick|int|lat|lng|ip|date|time ; p: programs ; o: option list or per-program map ; prop: not stated by owner (Proposal) */
  const F = [
    // Identification
    { k: 'code', l: 'Camera Code (Site No.)', t: 'code', sec: 'id', max: 20 },
    { k: 'suburb', l: 'Suburb (CEBDB/CES)', t: 'text', sec: 'id', max: 80 },
    { k: 'region', l: 'Region', t: 'pick', o: L.REGIONS, sec: 'id' },
    { k: 'zone', l: 'Zone', t: 'pick', o: L.ZONES, sec: 'id' },
    { k: 'activity', l: 'Activity Type', t: 'pick', o: L.ACTIVITY, sec: 'id' },
    // Location
    { k: 'street1', l: 'Main Street (Street 1)', t: 'text', sec: 'loc', max: 120 },
    { k: 'cross1', l: 'Cross Street', t: 'text', sec: 'loc', max: 120 },
    { k: 'cross2', l: 'Other Cross Street', t: 'text', sec: 'loc', max: 120 },
    { k: 'roadNo', l: 'Road No.', t: 'text', sec: 'loc', max: 40, prop: 'Format of Road No. not stated; free text.' },
    { k: 'ubd', l: 'UBD Map', t: 'text', sec: 'loc', max: 40, prop: 'Format of UBD Map not stated; free text.' },
    { k: 'lgc', l: 'LGC (Local Government Council)', t: 'text', sec: 'loc', max: 80, prop: 'Council list not supplied; free text. Could become a picklist or lookup.' },
    { k: 'court', l: 'Nearest Court', t: 'text', sec: 'loc', max: 80, prop: 'Court list not supplied; free text. Could become a picklist or lookup.' },
    { k: 'camLat', l: 'Camera Latitude', t: 'lat', sec: 'loc' },
    { k: 'camLng', l: 'Camera Longitude', t: 'lng', sec: 'loc' },
    { k: 'cabLat', l: 'Cabinet Latitude', t: 'lat', sec: 'loc' },
    { k: 'cabLng', l: 'Cabinet Longitude', t: 'lng', sec: 'loc' },
    { k: 'spdLat', l: 'SPD Latitude', t: 'lat', sec: 'loc' },
    { k: 'spdLng', l: 'SPD Longitude', t: 'lng', sec: 'loc' },
    // Monitoring
    { k: 'lanes', l: 'Lanes Monitored', t: 'pick', o: L.LANES, sec: 'mon' },
    { k: 'roadSide', l: 'Camera Road Side', t: 'text', sec: 'mon', max: 40, prop: 'No value list supplied for Camera Road Side; free text.' },
    { k: 'dirMon', l: 'Direction Monitored', t: 'pick', o: L.DIRECTIONS, sec: 'mon' },
    { k: 'modeMon', l: 'Mode Monitored', t: 'pick', o: L.MODES, sec: 'mon' },
    { k: 'priDir', l: 'Primary Direction', t: 'pick', o: L.DIRECTIONS, sec: 'mon' },
    { k: 'priMode', l: 'Primary Mode', t: 'pick', o: L.MODES, sec: 'mon' },
    { k: 'secDir', l: 'Secondary Direction', t: 'pick', o: L.DIRECTIONS, sec: 'mon' },
    { k: 'secMode', l: 'Secondary Mode', t: 'pick', o: L.MODES, sec: 'mon' },
    { k: 'env', l: 'Environment Type', t: 'pick', o: L.ENV, sec: 'mon' },
    { k: 'headedLane', l: 'Headed Lane Configuration', t: 'text', sec: 'mon', max: 80, prop: 'No value list supplied for Headed Lane Configuration; free text.' },
    { k: 'avoidance', l: 'Avoidance', t: 'pick', o: L.YNNA, sec: 'mon', p: ['BPES', 'ASC', 'ODES'] },
    // Equipment
    { k: 'camModel', l: 'Camera Model', t: 'text', sec: 'eq', max: 80, prop: 'No model list supplied; free text.' },
    { k: 'vendor', l: 'Vendor', t: 'text', sec: 'eq', max: 80, prop: 'No vendor list supplied; free text.' },
    { k: 'crd', l: 'Camera Recording Device (CRD)', t: 'pick', o: L.CRD, sec: 'eq' },
    { k: 'smd', l: 'Speed Measurement Device (SMD)', t: 'pick', o: L.SMD, sec: 'eq', p: ['FDSC', 'RLSC'] },
    { k: 'smdSerial', l: 'SMD Serial Number', t: 'text', sec: 'eq', max: 60, p: ['FDSC', 'RLSC'] },
    { k: 'dmd', l: 'Dimensional Measurement Device (DMD)', t: 'pick', o: L.DMD, sec: 'eq', p: ['ODES'] },
    { k: 'dmdSerial', l: 'DMD Serial Number', t: 'text', sec: 'eq', max: 60, p: ['ODES'] },
    { k: 'flash', l: 'Flash Type', t: 'pick', o: L.FLASH, sec: 'eq', p: ['FDSC', 'RLSC', 'ASC', 'ODES'] },
    { k: 'sensor', l: 'Sensor Type', t: 'pick', o: L.SENSOR, sec: 'eq' },
    { k: 'loop', l: 'Filter/Departure Loop', t: 'pick', o: L.YNNA, sec: 'eq' },
    { k: 'tirtl', l: 'TIRTL', t: 'pick', o: L.YNNA, sec: 'eq' },
    { k: 'multi', l: 'Multi Aspect', t: 'pick', o: L.YNNA, sec: 'eq' },
    { k: 'rscSerial', l: 'RSC Serial Number', t: 'text', sec: 'eq', max: 60 },
    { k: 'ecVersion', l: 'EC Version', t: 'text', sec: 'eq', max: 40 },
    { k: 'ecSerial', l: 'EC Serial', t: 'text', sec: 'eq', max: 60 },
    { k: 'vendorPay', l: 'Vendor Pay Type', t: 'text', sec: 'eq', max: 60, prop: 'No value list supplied for Vendor Pay Type; free text.' },
    { k: 'warranty', l: 'Warranty Expiry', t: 'date', sec: 'eq', plain: true },
    // Enforcement settings
    { k: 'speed', l: 'Speed Limit (km/h)', t: 'pick', o: L.SPEED, sec: 'enf', p: SPEEDP },
    { k: 'vsl', l: 'Variable Speed Limit', t: 'pick', o: L.YNNA, sec: 'enf', p: SPEEDP },
    { k: 'tcs', l: 'TCS ID', t: 'text', sec: 'enf', max: 40, p: ['RLSC'] },
    { k: 'ascZoneNo', l: 'Zone Number', t: 'int', sec: 'enf', p: ['ASC'] },
    { k: 'ascZone', l: 'ASC Zone', t: 'text', sec: 'enf', max: 60, p: ['ASC', 'ODES'], prop: 'ASC Zone value list not supplied; free text.' },
    // Network
    { k: 'routerModel', l: 'Router Model/Type', t: 'text', sec: 'net', max: 60 },
    { k: 'routerSerial', l: 'Router Serial No.', t: 'text', sec: 'net', max: 60 },
    { k: 'ipRouter', l: 'IP Address (Router-EC)', t: 'ip', sec: 'net' },
    { k: 'ipCam', l: 'IP Address (Camera)', t: 'ip', sec: 'net' },
    // School zone
    { k: 'schoolZone', l: 'School Zone', t: 'pick', o: L.YNNA, sec: 'sz' },
    { k: 'szAmStart', l: 'School Zone Morning Start', t: 'time', sec: 'sz', sz: true },
    { k: 'szAmEnd', l: 'School Zone Morning End', t: 'time', sec: 'sz', sz: true },
    { k: 'szPmStart', l: 'School Zone Afternoon Start', t: 'time', sec: 'sz', sz: true },
    { k: 'szPmEnd', l: 'School Zone Afternoon End', t: 'time', sec: 'sz', sz: true },
    // Lifecycle dates (rendered inside stage panels)
    { k: 'dInstalled', l: 'Camera Installed Date', t: 'date', sec: 'life' },
    { k: 'dDBA', l: 'Data Block Approval Date', t: 'date', sec: 'life' },
    { k: 'dD064', l: 'D064 Site Inspection Date', t: 'date', sec: 'life' },
    { k: 'dD128', l: 'D128 Network Commissioned Date', t: 'date', sec: 'life' },
    { k: 'dS137', l: 'S137 Date', t: 'date', sec: 'life', p: ['FDSC', 'RLSC'] },
    { k: 'dS137A', l: 'S137A Date', t: 'date', sec: 'life', p: ['ODES'] },
    { k: 'dS138', l: 'S138 Date', t: 'date', sec: 'life' },
    { k: 'dWarn', l: 'Warning Letter Start Date', t: 'date', sec: 'life', p: ['FDSC', 'RLSC', 'BPES', 'ODES'] },
    { k: 'dInf', l: 'Infringing Date (Enforcement Live)', t: 'date', sec: 'life' }
  ];
  F.forEach(function (f) { f.p = f.p || ALL; });

  const SECTIONS = [
    { id: 'id', title: 'Site Identification' },
    { id: 'loc', title: 'Location' },
    { id: 'mon', title: 'Monitoring' },
    { id: 'eq', title: 'Equipment' },
    { id: 'enf', title: 'Enforcement Settings' },
    { id: 'net', title: 'Network' },
    { id: 'sz', title: 'School Zone' }
  ];

  const FILETYPES = {
    PHOTO: 'Site Photo', DBA: 'Data Block Approval', D064: 'D064 Site Inspection Report',
    D128: 'D128 Commissioning Record', S137: 'S137 Certificate', S138: 'S138 Certificate',
    S137A: 'S137A Certificate', D141: 'Signed D141 PDF'
  };

  function certDates(rt) { return rt === 'ODES' ? ['dS137A', 'dS138'] : (rt === 'BPES' || rt === 'ASC') ? ['dS138'] : ['dS137', 'dS138']; }
  function certFiles(rt) { return rt === 'ODES' ? ['S137A', 'S138'] : (rt === 'BPES' || rt === 'ASC') ? ['S138'] : ['S137', 'S138']; }

  /* Ordered lifecycle stages per program */
  function stages(rt) {
    const s = [
      { id: 'installed', label: 'Camera Installed', dates: ['dInstalled'], att: ['PHOTO'] },
      { id: 'dba', label: 'Data Block Approval', dates: ['dDBA'], att: ['DBA'] },
      { id: 'd064', label: 'D064 Site Inspection', dates: ['dD064'], att: ['D064'] },
      { id: 'd128', label: 'D128 Network Commissioned', dates: ['dD128'], att: ['D128'] },
      { id: 'cert', label: 'Certification', dates: certDates(rt), att: certFiles(rt) }
    ];
    if (rt !== 'ASC') s.push({ id: 'warning', label: 'Warning Letter Start', dates: ['dWarn'], att: [] });
    s.push({ id: 'infringing', label: 'Infringing', dates: ['dInf'], att: ['D141'] });
    return s;
  }

  /* Proposal: fields required to complete each stage */
  const STAGE_REQ = {
    installed: ['code', 'suburb', 'region', 'activity', 'street1', 'camLat', 'camLng', 'lanes', 'env', 'camModel', 'vendor', 'crd', 'smd', 'dmd', 'rscSerial'],
    dba: [],
    d064: ['dirMon', 'modeMon', 'priDir', 'priMode', 'schoolZone', 'speed'],
    d128: ['sensor', 'routerModel', 'routerSerial', 'ipRouter', 'ipCam', 'ecVersion', 'ecSerial'],
    cert: [], warning: [], infringing: []
  };
  const ALWAYS_REQ = ['code', 'suburb', 'region', 'activity'];

  const STAGE_HELP = {
    installed: 'Camera physically installed. Core site, location and equipment details are captured here.',
    dba: 'Data Block Approval. (Open question: exact meaning to be confirmed by the owner.)',
    d064: 'D064 Site Inspection. Monitoring directions, school zone and speed settings are confirmed.',
    d128: 'D128 Network Commissioned. (Open question: exact meaning to be confirmed by the owner.) Router, IP and EC details are captured.',
    cert: 'Certification dates. S137, S138 and S137A are shown as labels only.',
    warning: 'Warning letter period starts. Not applicable to Average Speed Cameras.',
    infringing: 'Enforcement is live. The signed D141 PDF is proposed to be attached here.'
  };

  /* ---------- sample data ---------- */
  function fieldsFor(rt) { return F.filter(function (f) { return f.p.indexOf(rt) >= 0; }); }
  function opts(f, rt) { return Array.isArray(f.o) ? f.o : (f.o ? (f.o[rt] || []) : []); }

  function mk(id, rt, code, activity, doneCount, o) {
    o = o || {};
    const n = parseInt(code.slice(-4), 10);
    const base = {
      code: code, suburb: 'Testville', region: L.REGIONS[n % 6], zone: L.ZONES[n % 2], activity: activity,
      street1: 'Test Road', cross1: 'Fake Street', cross2: n % 2 ? 'Sample Avenue' : '', roadNo: 'TEST-' + n, ubd: 'UBD 000 A' + n,
      lgc: 'Testville Council', court: 'Test Local Court',
      camLat: '-33.0000' + n, camLng: '151.0000' + n, cabLat: '-33.0001' + n, cabLng: '151.0001' + n, spdLat: '-33.0002' + n, spdLng: '151.0002' + n,
      lanes: '2', roadSide: 'Left', dirMon: 'North', modeMon: 'Towards', priDir: 'North', priMode: 'Towards', secDir: 'N/A', secMode: 'N/A',
      env: 'Roadside', headedLane: 'Lane 1 headed', avoidance: 'No', camModel: 'TEST-MODEL-1', vendor: 'Test Vendor Pty Ltd',
      crd: L.CRD[rt][0], smd: (L.SMD[rt] || [''])[0], smdSerial: 'TEST-SMD-' + n, dmd: 'CEOS OLVD', dmdSerial: 'TEST-DMD-' + n,
      flash: 'Infrared', sensor: 'Loop-Loop', loop: 'No', tirtl: 'No', multi: 'No', rscSerial: 'TEST-RSC-' + n,
      ecVersion: 'EC-TEST-1.0', ecSerial: 'TEST-EC-' + n, vendorPay: 'Test Pay Type', warranty: '2030-06-30',
      speed: '60', vsl: 'No', tcs: 'TCS-TEST-' + n, ascZoneNo: '1', ascZone: 'Test ASC Zone A',
      routerModel: 'Test Router X1', routerSerial: 'TEST-RTR-' + n, ipRouter: '192.0.2.' + (10 + n), ipCam: '192.0.2.' + (100 + n),
      schoolZone: 'Yes', szAmStart: '07:30', szAmEnd: '09:30', szPmStart: '14:30', szPmEnd: '16:00'
    };
    const v = {};
    fieldsFor(rt).forEach(function (f) { if (f.sec !== 'life' && base[f.k] !== undefined) v[f.k] = base[f.k]; });
    const st = stages(rt);
    const done = [];
    st.forEach(function (s, i) {
      if (i < doneCount) {
        done.push(s.id);
        s.dates.forEach(function (dk, j) {
          const d = new Date(Date.UTC(2026, 0, 10 + i * 14 + j));
          v[dk] = d.toISOString().slice(0, 10);
        });
      }
    });
    Object.keys(o).forEach(function (k) { if (k === 'drop') o.drop.forEach(function (x) { delete v[x]; }); else v[k] = o[k]; });
    const files = [];
    done.forEach(function (sid) {
      st.filter(function (s) { return s.id === sid; })[0].att.slice(0, 1).forEach(function (t) {
        files.push({ id: id + '_' + t, type: t, name: code + '_' + t + '_SAMPLE.pdf', size: 120400, added: '2026-02-01' });
      });
    });
    return { id: id, rt: rt, v: v, done: done, files: files };
  }

  function seed() {
    return [
      mk('s1', 'FDSC', 'TEST-0001', 'Commission', 3),
      mk('s2', 'FDSC', 'TEST-0002', 'Commission', 7),
      mk('s3', 'RLSC', 'TEST-0003', 'Commission', 1, { drop: ['cabLat', 'cabLng', 'spdLat', 'spdLng', 'tcs', 'routerModel', 'schoolZone', 'szAmStart', 'szAmEnd', 'szPmStart', 'szPmEnd'] }),
      mk('s4', 'RLSC', 'TEST-0004', 'Decommission', 5),
      mk('s5', 'BPES', 'TEST-0005', 'Commission', 4),
      mk('s6', 'BPES', 'TEST-0006', 'Refurbish', 0, { drop: ['camLat', 'camLng', 'crd'] }),
      mk('s7', 'ASC', 'TEST-0007', 'Commission', 5),
      mk('s8', 'ASC', 'TEST-0008', 'Commission', 2, { schoolZone: 'No', szAmStart: '', szAmEnd: '', szPmStart: '', szPmEnd: '' }),
      mk('s9', 'ODES', 'TEST-0009', 'Commission', 6),
      mk('s10', 'ODES', 'TEST-0010', 'Refurbish', 3)
    ];
  }

  window.D141 = { ALL: ALL, PROGRAMS: PROGRAMS, L: L, F: F, SECTIONS: SECTIONS, FILETYPES: FILETYPES, stages: stages,
    STAGE_REQ: STAGE_REQ, ALWAYS_REQ: ALWAYS_REQ, STAGE_HELP: STAGE_HELP, fieldsFor: fieldsFor, opts: opts, seed: seed };
})();
