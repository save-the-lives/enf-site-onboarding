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
| `v1-record-page/` | Variation 1: Site list, New Site (record type picker), Lightning record page with highlights, Path, Details/Related, inline edit, Save/Cancel, attachments |
| `v2-bulk-grid/` | Variation 2: editable grid with per-cell and per-row validation and a bulk action bar (Commission/Decommission/Refurbish, mark stage complete, set value) |
| `v3-guided-flow/` | Variation 3: Screen Flow style wizard with per-step validation and a review screen |
| `backlog/` | User stories with Given/When/Then ACs, filters, deep links, Export to Excel (.xlsx) and CSV |
| `journey/` | Journey map: planned to enforcement live, with decommission and refurbish branches |
| `questions/` | Index of open questions; each also appears in context as a blue `?` badge |
| `shared/` | `data.js` (model, picklists, sample sites), `core.js` (validation, chrome, help, tour), `backlog.js` (stories, questions, journey), `companion.js`, `xlsx.js` (tiny self-contained xlsx writer), `sf.css` |

## Data model and validation (all variations share it)
- One Site object, five record types: FDSC, RLSC, BPES, ASC, ODES; fields shown/hidden per type (`shared/data.js`).
- Lifecycle stages rendered as the Path: Camera Installed, Data Block Approval, D064 Site Inspection, D128 Network Commissioned, Certification (S137+S138 / S138 / S137A+S138), Warning Letter Start (not ASC), Infringing. Activity type: Commission, Decommission, Refurbish.
- Validation: latitude -90..90, longitude -180..180 (NSW range is a non-blocking warning), IPv4 for both IPs, picklists only from the supplied lists, date order, required fields per stage, school zone times only when School Zone = Yes (otherwise disabled and cleared).

## Living backlog
Edit `shared/backlog.js` (stories, acceptance criteria, questions, journey). Pages render from it. Deep links: every story, question and journey step links to the exact screen, stage and field; every screen has "Stories for this screen" in the bottom bar. Export (Stories, Acceptance Criteria, Open Questions, Journey sheets) is on the Stories page.

## Proposals and open questions
Owner-stated: record types, field list, lifecycle dates and certification differences, dropdown values, the validation list, activity types.
Proposal (marked in the UI): which fields are required at each stage; attachment types (D064 Site Inspection Report, S137/S138/S137A Certificates, D128 Commissioning Record, Data Block Approval, Site Photos, signed D141 PDF) and that none is mandatory; Camera Code format and uniqueness; coordinate hints; stage order enforcement and reopen behaviour; free-text fields with no supplied list; stage and journey names; the three variations themselves.
Open questions (Q-001 to Q-015, see the Questions page): real unit manager list; further attachments; meaning of Data Block Approval and D128; stage order; whether Decommission/Refurbish are activity types or statuses; whether stages lock; required fields per stage; value lists for road side, headed lane, LGC, court; Camera Code format; need for the signed PDF.
