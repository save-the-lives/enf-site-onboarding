# D141 Site Setup - Salesforce Lightning mockups

Static HTML/CSS/JS prototypes (no build step, no external assets, no libraries) showing how D141 camera site data could be captured directly in Salesforce (CMCS) with validation at the point of entry. Today a Technical Project Manager (TPM) fills an Excel D141 per site, it is filed in Objective, a PDF is emailed to unit managers, and another business unit re-keys it into CMCS and distrusts the result.

**Mockup only. Nothing is built in Salesforce. All data is fake (TEST-xxxx codes, 192.0.2.x IPs). Anything the owner did not state is marked Proposal.** The spreadsheet layout does not have to be copied: the outcome is validated, complete site details feeding CMCS.

## View it
- Pages: https://save-the-lives.github.io/enf-site-onboarding/
- Locally: open `index.html`, or run `python3 -m http.server` here and visit http://localhost:8000/ (no build).
- Sample edits are kept in the browser (localStorage); use "Reset sample data" in the bottom bar to restore.

## What is in it
| Path | What |
|---|---|
| `index.html` | Prototype hub with a Start here panel, tour and when-to-prefer guidance |
| `v1-record-page/` | Variation 1: Sites list and Site record page laid out like the live CMCS pages (see below), with child records and a proposed lifecycle Path on top |
| `v2-bulk-grid/` | Variation 2: editable grid of Sites with per-cell/per-row validation, child-record readiness and a bulk action bar |
| `v3-guided-flow/` | Variation 3: Screen Flow style wizard that creates a Site plus Lanes, Camera Program, Enforcement Devices and Certificates |
| `model/` | Data model: Site and child objects, two options for where the program lives, and a mapping of every D141 column to the likely live object.field (all To confirm) |
| `backlog/` | User stories with Given/When/Then ACs, filters, deep links, Export to Excel (.xlsx, includes the model mapping) and CSV |
| `journey/` | Journey map: planned to enforcement live, with decommission and refurbish branches |
| `questions/` | Index of open questions; each also appears in context as a blue `?` badge |
| `shared/` | `data.js` (model, picklists, sample sites), `core.js` (validation, chrome, help, tour), `backlog.js` (stories, questions, journey), `model.js` (column mapping), `companion.js`, `xlsx.js` (tiny self-contained xlsx writer), `sf.css` |

## Alignment with the live CMCS (owner-supplied screenshots)
The owner supplied two screenshots of the real CMCS (Sites list view and Site record page). They are NOT in this repo and no real value from them is used; only the structure, recorded as "Owner-supplied (screenshot)" in the UI:
- Site already exists (pink building tile); we extend it. List view "All Sites" with New / Import / Printable View, list controls, columns Site Number, Location, Status, Site Type, Vendor, Zone, Region, Created Date, Last Modified Date; dates d/m/yyyy, h:mm am/pm.
- Existing Status values (Active, Decommissioned, Decommissioned - Camera removed, Decommissioned - Camera upgraded) and Site Type values seen (Red Light Camera, MOB).
- Record page: actions Follow, Edit, New Maintenance Case, New Delegation, New Certificate, Log Session; highlights Suburb, Status, Site Type, Directions Monitored, Vendor; tabs Details, Additional Assets, Network, Site Survey, Files/Attachments, Site History, Edit History, All Cases; sections Site Location, Site Details, Site Coordinates (combined Lat, Long fields); right rail Maintenance Cases, Certificates, Lanes Configuration, Program & Devices with amber "Please add ..." banners. There is no Path on the live page.
- Key implication: the live model already has child objects (Lane, Camera Program, Enforcement Device, Certificate ...), so D141 data is modelled as Site plus child records, not one flat object with a record type per program. Record types on Site are kept in the mockup as Option A; Option B (program = Camera Program System Type) is on the model page.
- Proposed on top, flagged "Proposal": the lifecycle Path and stage sections, Activity Type, D141 columns with no obvious live field (Monitoring, Equipment and Settings, School Zone sections), Network tab content, the Files/Attachments groupings.
- Everything on the live page that is not needed for D141 capture (Additional Assets, Site Survey, Delegations, Sessions, Maintenance Cases) is a stub.

## Data model and validation (all variations share it)
- Site fields plus child records Lane, Camera Program, Enforcement Device, Certificate (`shared/data.js`). Five programs (FDSC, RLSC, BPES, ASC, ODES) change the layout and the required device and certificate types.
- Lifecycle stages shown as the Path: Camera Installed, Data Block Approval, D064 Site Inspection, D128 Network Commissioned, Certification (certificate child records), Warning Letter Start (not ASC), Infringing. Activity type: Commission, Decommission, Refurbish; Decommission outcomes map to the existing Status values.
- Validation: combined "latitude, longitude" fields (lat -90..90, long -180..180, NSW range as a warning), IPv4 for both IPs, picklists only from the supplied lists (device models depend on type and program), date order including certificate dates, required fields and child records per stage, school zone times only when School Zone = Yes, Site No 4 digits and unique (the mockup also accepts TEST-nnnn).

## Living backlog
Edit `shared/backlog.js` (stories, acceptance criteria, questions, journey) and `shared/model.js` (column mapping). Pages render from them. Every story, question and journey step deep-links to the exact screen, stage and field; every screen has "Stories for this screen" in the bottom bar. Export (Stories, Acceptance Criteria, Open Questions, Data model mapping, Journey) is on the Stories page.

## Proposals and open questions
Open questions Q-001 to Q-031 (see the Questions page) include: real unit manager list; further attachments; meaning of Data Block Approval and D128; stage order; whether Decommission/Refurbish are activity types or statuses; whether Status or a new field carries the lifecycle; how Site Type values (Red Light Camera, MOB) map to the five programs; what MOB means; whether Vendor is a lookup to Account; whether Site Number equals Camera Code; which D141 columns already exist on Site/Lane/Camera Program/Device; Sub Type values; whether record types are used today; who uses New Delegation, Log Session, Additional Assets, Network and Site Survey; what 2nd Verification means; the rules behind the amber banners.
