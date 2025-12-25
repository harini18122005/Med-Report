# 🩺 Med-Report Simplifier  
**Making medical reports easy to understand for everyone**

🌐 **Live Demo:** https://med-report-simplifier.vercel.app/

---

## 📌 Problem
Medical reports are written for doctors, not patients.  
They contain complex terminology, Latin-based words, and numerical values that often cause confusion, fear, and misinformation when patients try to interpret them on their own.

Medical literacy is a global issue, and misunderstanding reports can lead to unnecessary anxiety or wrong assumptions.

---

## 💡 Solution
**Med-Report Simplifier** is an AI-powered healthcare tool that converts complex medical reports into **simple, patient-friendly explanations** while maintaining **strict ethical and safety standards**.

The tool does **not diagnose diseases**.  
Instead, it focuses on clarity, understanding, and preparing patients for better conversations with their doctors.

---

## 🤖 Enable AI Assistant

To unlock AI-powered summaries and enhanced question generation:

1. **Get OpenAI API Key:**
   - Visit https://platform.openai.com/api-keys
   - Create an account or sign in
   - Click "Create new secret key"
   - Copy your key (starts with `sk-...`)

2. **Local Development:**
   ```bash
   cd med-report-simplifier
   cp .env.example .env
   # Edit .env and add:
   OPENAI_API_KEY=sk-your-actual-key-here
   npm run dev:local
   ```

3. **Vercel Deployment:**
   - Go to your Vercel project dashboard
   - Settings → Environment Variables
   - Add: `OPENAI_API_KEY` = `sk-your-key`
   - Redeploy the project

**Note:** AI features are optional. The app works fully without an API key using built-in explanations.

---

## 🧭 How It Works (User Flow)

1. **Input**  
   The patient pastes text from a lab report (blood test, X-ray report, etc.)

2. **Knowledge Level Selection**  
   - *Explain like I’m a child*  
   - *Standard / Patient-friendly*

3. **AI Processing (RAG-lite)**  
   - Identifies medical terms  
   - Detects values outside the normal range  
   - Extracts numerical values  

4. **Simplified Output**  
   - Medical jargon replaced with easy section titles  
     - *Hematology → Your Blood Cells*  
     - *Biochemistry → Sugar & Minerals*
   - Clear explanations using non-alarming language  

5. **Doctor Visit Preparation**  
   - Automatically generates 3–5 helpful questions for the next appointment  

---

## ✨ Core Features

### 🔍 Terminology Mapping
- Every medical term used by the AI is **defined in simple language**
- No unexplained jargon appears in the output

---

### 🛑 Non-Diagnostic Safeguard
- Permanent, non-closable banner:
  > “This tool does not provide medical diagnoses.”
- AI is prevented from saying:
  - ❌ “You have [Disease]”
- AI only says:
  - ✅ “This value is outside the normal range”

---

### ❓ Context-Aware Question Generator
Generates smart questions such as:
- “My iron level is low. Should I change my diet or take supplements?”
- “Is this value something we should monitor again?”

---

## 🧪 Optional Features

### 📘 Interactive Glossary
- Medical terms are underlined in the UI
- Clicking a term shows a tooltip explanation (10 words or less)

---

### 📊 Numerical Visualization
 - Extracts numerical values like:

---

## 🚀 Quickstart

### Run locally

1. Install dependencies and start the dev server:

```bash
cd med-report-simplifier
npm install
npm run dev
```

2. Open http://localhost:3000
3. Paste sample input:

```
Hemoglobin: 12.8 g/dL
WBC: 6.1 10^9/L
Platelets: 220 10^9/L
Glucose (Fasting): 92 mg/dL
```

4. Choose explanation level and click “Simplify”.

### Optional: Enable AI Assistant

- Copy `.env.example` to `.env` inside `med-report-simplifier` and set `OPENAI_API_KEY`.
- In the UI, check "Use AI assistant" to include an AI-written friendly summary and tailored questions.
- The app works without AI using safe rule-based explanations and typical ranges.

### What’s happening under the hood
- API route: med-report-simplifier/app/api/simplify/route.ts
- Term definitions: med-report-simplifier/app/data/terms.json
- Typical ranges: defined in the API for now (can be moved to a JSON file)
- UI: med-report-simplifier/app/page.tsx

### Safety Notice
This tool simplifies report language for understanding only. It does not diagnose conditions. Please consult your doctor for medical advice.
