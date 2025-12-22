# Med-Report Simplifier Learning Log

## Day 1: MVP Scaffold & Core API

### What I built
- **Scope**: MVP app that takes medical report text → simplifies using plain language → generates doctor questions (no diagnosis).
- **API Route**: `/api/simplify` parses lines, maps medical terms to simple explanations, checks ranges, and returns structured JSON.
- **Term Mapping**: Created `terms.json` with definitions for key labs (Hemoglobin, WBC, Platelets, Fasting Glucose).
- **Range Checker**: Added `ranges.json` with typical values so the API can flag low/high readings.
- **UI**: Built a form with textarea (paste report), radio buttons (explanation level), "Simplify" button, and results display.

### How to run (dev)
```bash
cd med-report-simplifier
npm install
npm run dev
```
- Opens at http://localhost:3000 (or 3001 if port taken).
- If OneDrive locks `.next/dev/lock`, pause OneDrive sync or move project to `C:\Projects\Med-Report`.

### Sample test input
```
Hemoglobin: 12.8 g/dL
WBC: 6.1 10^9/L
Platelets: 220 10^9/L
Glucose (Fasting): 92 mg/dL
```

### Expected output
- Sections: "Your Blood Cells" (Hematology), "Sugar & Minerals" (Biochemistry).
- Each value shown with typical range and status (in-range, low, high).
- Simple explanation (e.g., "Hemoglobin carries oxygen in your blood.").
- 3–5 suggested doctor questions (non-diagnostic).
- Disclaimer: "This tool simplifies report language for understanding only. It does not diagnose conditions. Please consult your doctor for medical advice."

### Key files
- **UI**: `med-report-simplifier/app/page.tsx` — React form + results rendering.
- **API**: `med-report-simplifier/app/api/simplify/route.ts` — parser, term mapping, range check.
- **Data**: `med-report-simplifier/app/data/terms.json` — term definitions & section titles.
- **Data**: `med-report-simplifier/app/data/ranges.json` — typical value ranges.
- **Docs**: `README.md` — project overview + quickstart.

### Learning points
- Next.js App Router & API routes (POST handler).
- React hooks (`useState`, form control).
- JSON data files for config/mapping.
- TypeScript types for API request/response.
- Regex parsing of simple lab report format.
- Tailwind CSS for responsive UI.

### What's next (Day 2–3)
1. Add unit tests for the parser (vitest or jest).
2. QA with 3 sample reports (normal, low, high values).
3. UX polish (loading states, empty state, error messages).
4. Deploy to Vercel (one-click from GitHub).
5. Optional: record a short demo video.

### Notes
- No real LLM/AI calls yet; all mapping is static in `terms.json`.
- No PHI storage; everything runs client-side or in-memory.
- MVP focuses on **clarity**, not diagnosis. All explanations use simple, non-alarming language.
- Use "Patient-friendly" for adults, "Explain like I'm a child" for simplified wording.
