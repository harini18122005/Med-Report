# Mock AI API Response Example

## Request (POST /api/simplify)
```json
{
  "text": "Patient: John Doe\nDate: 2025-12-26\nHemoglobin: 14.5 g/dL\nHematocrit: 43%\nWBC: 7.2 K/uL\nPlatelets: 250 K/uL\nGlucose: 105 mg/dL\nCholesterol: 210 mg/dL",
  "level": "standard",
  "useAi": true
}
```

## Response (Successful AI Summary)
```json
{
  "sections": [
    {
      "section": "hematology",
      "sectionTitle": "Blood Cell Counts",
      "items": [
        {
          "term": "Hemoglobin",
          "label": "Hemoglobin",
          "value": "14.5",
          "unit": "g/dL",
          "typical": "13.5-17.5",
          "status": "in-range",
          "explanation": "Hemoglobin carries oxygen in blood. Based on the typical range, this is in-range."
        },
        {
          "term": "Hematocrit",
          "label": "Hematocrit",
          "value": "43",
          "unit": "%",
          "typical": "41-53",
          "status": "in-range",
          "explanation": "Hematocrit is the percentage of red blood cells. Based on the typical range, this is in-range."
        }
      ]
    },
    {
      "section": "biochemistry",
      "sectionTitle": "Chemistry Panel",
      "items": [
        {
          "term": "Glucose",
          "label": "Fasting Glucose",
          "value": "105",
          "unit": "mg/dL",
          "typical": "70-100",
          "status": "high",
          "explanation": "Glucose is blood sugar. Based on the typical range, this is high."
        }
      ]
    },
    {
      "section": "lipids",
      "sectionTitle": "Lipid Panel",
      "items": [
        {
          "term": "Cholesterol",
          "label": "Total Cholesterol",
          "value": "210",
          "unit": "mg/dL",
          "typical": "0-200",
          "status": "high",
          "explanation": "Cholesterol is a fat in your blood. Based on the typical range, this is high."
        }
      ]
    }
  ],
  "questions": [
    "Should I be concerned about my elevated glucose and cholesterol levels?",
    "What dietary changes could help improve these results?",
    "Do I need to take any medications based on these values?",
    "Should I repeat these tests in the future?",
    "How can my lifestyle affect these blood values?"
  ],
  "disclaimer": "This summary is for understanding only and is not medical advice. Always discuss your results with your doctor.",
  "aiUsed": true,
  "aiNarrative": "Your lab results show generally healthy blood cell counts, with hemoglobin and hematocrit in normal ranges. However, your glucose level is slightly elevated at 105 mg/dL, which could indicate pre-diabetic trends if fasting. Your total cholesterol is also above the ideal range at 210 mg/dL. These results suggest you should focus on diet and exercise, and discuss with your doctor about potential lifestyle modifications or further testing. No immediate treatment appears necessary based on these values alone."
}
```

## Response (No AI - Fallback)
When `useAi` is false or API key is missing:
```json
{
  "sections": [
    {
      "section": "hematology",
      "sectionTitle": "Blood Cell Counts",
      "items": [...]
    }
  ],
  "questions": [
    "Are any of these results concerning for me?",
    "Do I need to repeat any tests or follow up?",
    "Could medicines, diet, or dehydration affect these values?",
    "What lifestyle changes might help keep these in range?"
  ],
  "disclaimer": "This summary is for understanding only and is not medical advice. Always discuss your results with your doctor.",
  "aiUsed": false
}
```

## Key Features Enabled

✅ **AI Integration (Main Hackathon Feature):**
- OpenAI GPT-4o-mini for patient-friendly explanations
- Uses `OPENAI_API_KEY` from `.env` file
- Generates personalized narrative summary
- Creates intelligent follow-up questions

✅ **Parsing & Validation:**
- Extracts lab values from unstructured text
- Validates against 15 medical test ranges
- Categorizes results by test type

✅ **Patient Education:**
- Simple explanations for each test
- Status indicators (in-range, low, high)
- Disclaimer for legal safety

## Testing AI Locally

Run the development server:
```bash
npm run dev
```

Then test with curl:
```bash
curl -X POST http://localhost:3000/api/simplify \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Glucose: 105 mg/dL",
    "level": "standard",
    "useAi": true
  }'
```

The response will include:
- `aiUsed: true` if OpenAI API key is configured
- `aiNarrative: "..."` with AI-generated explanation
- `aiQuestions: [...]` with AI-generated questions
