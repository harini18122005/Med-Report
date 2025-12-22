## Day 1 Notes

### What I built
- Scoped MVP: paste report → choose explanation level → simplified sections + doctor questions (no diagnosis).
- Added term mapping and typical ranges for key labs (Hemoglobin, WBC, Platelets, Fasting Glucose).
- API: `/api/simplify` parses lines, maps terms, compares to ranges, returns friendly explanations and questions.
- UI: textarea input, level selector, Simplify button, results list, and disclaimer.

### How to run (dev)
```bash
cd med-report-simplifier
npm install
npm run dev
```
- If OneDrive locks `.next`, pause sync or move project to `C:\Projects\Med-Report`.

### Sample input
```
Hemoglobin: 12.8 g/dL
WBC: 6.1 10^9/L
Platelets: 220 10^9/L
Glucose (Fasting): 92 mg/dL
```

### Outputs to expect
- Sections like “Your Blood Cells” and “Sugar & Minerals”.
- Each item shows value, typical range, and a simple explanation (child/standard level).
- Suggested doctor questions (non-diagnostic).
- Disclaimer visible in UI.

### Files touched
- UI: `med-report-simplifier/app/page.tsx`
- API: `med-report-simplifier/app/api/simplify/route.ts`
- Data: `med-report-simplifier/app/data/terms.json`, `med-report-simplifier/app/data/ranges.json`
- Docs: `README.md` quickstart

### What’s next (Day 2/3)
- Add small parser tests.
- QA with 3 sample reports.
- UX polish (loading/empty states refinement).
- Deploy to Vercel.
