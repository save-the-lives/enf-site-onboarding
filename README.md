# D141 Site Setup - Salesforce Lightning mockups

Static HTML/CSS/JS prototypes (no build step, no external assets) showing how D141 camera site data could be captured directly in Salesforce (CMCS) with validation at the point of entry, replacing the Excel D141 template that is re-keyed today.

**Mockup only. All data is fake (TEST-xxxx, 192.0.2.x). Anything the owner did not state is marked Proposal.**

## Run
Open `index.html` in a browser, or `python3 -m http.server` in this folder and visit http://localhost:8000/.
Published link (GitHub Pages): https://save-the-lives.github.io/enf-site-onboarding/

## Layout
- `index.html` prototype hub
- `v1-record-page/` guided single-site record page with Path
- `v2-bulk-grid/` bulk grid entry with per-row validation and bulk action bar
- `v3-guided-flow/` guided screen flow wizard
- `backlog/`, `journey/`, `questions/` companion layer (user stories, journey map, open questions)
- `shared/` data model, validation, Lightning styles

Status: skeleton in progress; detail is being filled in over further commits.
