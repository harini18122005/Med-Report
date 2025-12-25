# Med-Report Simplifier Learning Log

## Day 1: MVP Scaffold & Core API

### What I built
- Scope: MVP that takes medical report text → simplifies in plain language → suggests non-diagnostic doctor questions.
- API Route: `/api/simplify` parses lines, maps medical terms to simple explanations, checks ranges, and returns structured JSON.
- Term Mapping: Added `app/data/terms.json` for common labs (Hemoglobin, WBC, Platelets, Fasting Glucose).
- Range Checker: Built-in typical ranges handled inside the API for low/high/in-range flags.
- UI: Form with textarea (paste report), explanation level selector, optional AI toggle, and results display.

### How to run (dev)
```powershell
cd med-report-simplifier
npm install
npm run dev
```
- Opens at http://localhost:3000 (or 3001 if port taken).
- If OneDrive locks `.next` or causes port issues, pause syncing or move the project to `C:\Projects`.

### Sample test input
```
Hemoglobin: 12.8 g/dL
WBC: 6.1 10^9/L
Platelets: 220 10^9/L
Glucose (Fasting): 92 mg/dL
```

### Expected output
- Sections grouped (e.g., Hematology vs. Biochemistry).
- Each value shows typical range and status (in-range/low/high/unknown).
- Simple explanation per term (from `terms.json`).
- 3–5 suggested doctor questions (non-diagnostic).
- Disclaimer about not providing diagnosis and consulting a doctor.

### Key files
- UI: `med-report-simplifier/app/page.tsx` — React form + results.
- API: `med-report-simplifier/app/api/simplify/route.ts` — parsing + ranges + optional AI.
- Data: `med-report-simplifier/app/data/terms.json` — labels, sections, explanations.
- Docs: `README.md` — quickstart + AI setup.

### Learning points
- Next.js App Router API routes (server components with `route.ts`).
- Regex-based parsing for simple lab line formats.
- Using TypeScript types to shape API requests/responses.
- Tailwind CSS utility-first styling.

## Day 2: Stabilization, Optional AI, and Build

### What I completed
- Installed missing dependency: `openai` for optional AI narrative/questions.
- Added local binding scripts in `package.json`:
	- `dev:local`: `next dev -p 3001 -H 127.0.0.1`
	- `start:local`: `next start -p 3001 -H 127.0.0.1`
- Fixed clean builds in both the clean clone and OneDrive workspace.
- Pushed updates to GitHub (`main`).

### Updates this hour
- Expanded lab coverage in API and data:
	- Lipids: Total Cholesterol, LDL, HDL, Triglycerides
	- Liver: ALT, AST
	- Thyroid: TSH
	- Kidney: Creatinine, BUN
	- Electrolytes: Sodium, Potassium, Calcium
- UI improvement: Added a "Use sample" button to prefill a comprehensive report for quick testing.
- Verified production build still succeeds.

### Testing added
- Refactored core logic into `app/lib/analyze.ts` (ranges, `parseLines()`, `compare()`).
- Added unit tests with Vitest: `app/lib/analyze.test.ts`.
- Scripts:
	- `npm run test` → runs once
	- `npm run test:watch` → watch mode
- Result: All tests passing locally.

### Deployment note (Vercel)
- Fixed `vercel.json` to a minimal Next.js config and ensured the project uses `Root Directory: med-report-simplifier` in Vercel settings. If a 404 appears, check the root directory setting and redeploy.

## Deployment & Live URL

### ✅ Live App
**URL:** https://med-report-simplifier.vercel.app/

**How to use:**
1. Paste your medical report text (or click "Use sample" for a demo).
2. Choose explanation level: Patient-friendly or Explain like I'm a child.
3. Optionally enable "Use AI assistant" (requires OPENAI_API_KEY in Vercel env).
4. Click "Simplify" to see results grouped by section, typical ranges, and doctor questions.
5. Results include a disclaimer that this is for understanding only, not diagnosis.

**Sample labs covered:**
- Hematology: Hemoglobin, WBC, Platelets
- Biochemistry: Glucose, Sodium, Potassium, Calcium
- Lipids: Total Cholesterol, LDL, HDL, Triglycerides
- Liver: ALT, AST
- Thyroid: TSH
- Kidney: Creatinine, BUN

### Try the new sample
You can click "Use sample" in the UI, or paste this:
```
Hemoglobin: 12.8 g/dL
WBC: 6.1 10^9/L
Platelets: 220 10^9/L
Glucose (Fasting): 92 mg/dL
Total Cholesterol: 182 mg/dL
LDL: 110 mg/dL
HDL: 50 mg/dL
Triglycerides: 140 mg/dL
ALT: 23 U/L
AST: 19 U/L
TSH: 2.1 mIU/L
Creatinine: 0.9 mg/dL
BUN: 14 mg/dL
Sodium: 140 mmol/L
Potassium: 4.2 mmol/L
Calcium: 9.2 mg/dL
```

### Useful commands I ran
```powershell
# Install and build (OneDrive workspace app folder)
cd C:\Users\Dell\OneDrive\Desktop\Med-Report\med-report-simplifier
npm install
npm run build

# Start prod server bound to loopback
npm run start:local   # next start -p 3001 -H 127.0.0.1

# Quick HTTP check
try { $r = Invoke-WebRequest http://127.0.0.1:3001 -UseBasicParsing -TimeoutSec 3; "HTTP $($r.StatusCode)" } catch { "ERR: $($_.Exception.Message)" }

# Alternative dev start
npm run dev:local     # next dev -p 3001 -H 127.0.0.1

# Commit & push
git add med-report-simplifier/package.json med-report-simplifier/package-lock.json
git commit -m "feat(api): add openai dep and local start/dev scripts; build stabilizations"
git push --set-upstream origin main
```

### Troubleshooting notes (Windows + OneDrive)
- If Next.js prints "Ready" but you can’t connect, confirm you’re in the correct project folder; avoid running from the parent or another working copy.
- OneDrive can lock `.next` artifacts and interfere with port binding. Try pausing sync or using `C:\Projects`.
- Bind explicitly to loopback with `-H 127.0.0.1 -p 3001` using `start:local` or `dev:local` scripts.
- Use `netstat -ano | Select-String ":3001"` to confirm a listener.

### Optional AI setup
- Add `OPENAI_API_KEY` in `.env` or Vercel project settings to enable the AI summary/questions path.
- The API only calls OpenAI if a key is present; otherwise, it returns static simplification.

### Deploy to Vercel (recommended for demo)
```powershell
npx vercel login
cd C:\Users\Dell\OneDrive\Desktop\Med-Report\med-report-simplifier
npx vercel
npx vercel --prod
```
- In Vercel → Project → Settings → Environment Variables: add `OPENAI_API_KEY`.

## What’s next (Day 3)
- Add a few unit tests for the parser (happy path + edge cases).
- Improve UX (loading states, error toasts, copy-to-clipboard for questions).
- Add more terms/ranges coverage (lipids, liver enzymes, thyroid).
- Draft a short demo walkthrough and screenshots.

---

Quick reminder: This tool is for understanding only, not diagnosis. Always consult a doctor for medical advice.

## Day 3: Professional UI & Advanced Features (Continued)

### Hour 4: Advanced Features & OpenAI Integration 

**OpenAI API Setup Documentation:**
How to enable AI-powered summaries:
1. Visit https://platform.openai.com/api-keys
2. Create account and generate API key (starts with sk-...)
3. Local: Add to .env file as OPENAI_API_KEY=sk-your-key
4. Vercel: Add in Project Settings  Environment Variables
5. Redeploy to activate AI features

**Enhanced AI Summary Card:**
- Animated pulsing AI badge
- Gradient emerald/green/teal background
- "Generated by OpenAI" subtitle
- Content in rounded white panel with enhanced readability
- 2px border with emerald-300 for prominence
- Slide-in-from-left animation (700ms)

**Professional Results Cards:**
- Gradient backgrounds (white  gray-50)
- Icon badges in gradient circles (blue-500  purple-500)
- Test count display: "X tests analyzed"
- Section headers with divider lines
- Enhanced hover: scale-[1.01] + shadow-3xl
- Individual items with translate-x-1 on hover
- Monospace value display in rounded badges

**Polish & Details:**
- All animations coordinated with delays
- Consistent shadow hierarchy
- Professional color scheme throughout
- Smooth transitions (200-700ms range)

**Build Status:**
-  Production build successful  
-  4/4 unit tests passing
-  TypeScript compilation clean
-  Deployed to Vercel
-  README & Learn.md updated

