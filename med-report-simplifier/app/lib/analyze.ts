export type Ranges = Record<string, { unit?: string; typical?: [number, number] }>;

export const ranges: Ranges = {
  Hemoglobin: { unit: "g/dL", typical: [12.0, 16.0] },
  WBC: { unit: "10^9/L", typical: [4.0, 11.0] },
  Platelets: { unit: "10^9/L", typical: [150, 450] },
  "Glucose (Fasting)": { unit: "mg/dL", typical: [70, 99] },
  // Lipids
  "Total Cholesterol": { unit: "mg/dL", typical: [125, 200] },
  LDL: { unit: "mg/dL", typical: [0, 100] },
  HDL: { unit: "mg/dL", typical: [40, 60] },
  Triglycerides: { unit: "mg/dL", typical: [0, 150] },
  // Liver enzymes
  ALT: { unit: "U/L", typical: [7, 56] },
  AST: { unit: "U/L", typical: [10, 40] },
  // Thyroid
  TSH: { unit: "mIU/L", typical: [0.4, 4.5] },
  // Kidney & electrolytes
  Creatinine: { unit: "mg/dL", typical: [0.6, 1.3] },
  BUN: { unit: "mg/dL", typical: [7, 20] },
  Sodium: { unit: "mmol/L", typical: [135, 145] },
  Potassium: { unit: "mmol/L", typical: [3.5, 5.1] },
  Calcium: { unit: "mg/dL", typical: [8.5, 10.2] },
};

export function compare(term: string, value?: number): {
  typical?: [number, number];
  status: "low" | "high" | "in-range" | "unknown";
} {
  const r = ranges[term];
  if (!r?.typical || typeof value !== "number") {
    return { status: "unknown" };
  }
  const [low, high] = r.typical;
  if (value < low) return { typical: r.typical, status: "low" };
  if (value > high) return { typical: r.typical, status: "high" };
  return { typical: r.typical, status: "in-range" };
}

export type ParsedItem = { term: string; value?: number; unit?: string };

export function parseLines(text: string): ParsedItem[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const results: ParsedItem[] = [];
  const re = /([^:]+):\s*(-?\d+(?:\.\d+)?)?\s*([A-Za-z0-9^/%\.-]*)?/;
  for (const raw of lines) {
    const m = raw.match(re);
    if (!m) continue;
    const name = m[1].trim();
    const val = m[2] !== undefined ? Number(m[2]) : undefined;
    const unit = (m[3] || "").trim() || undefined;
    results.push({ term: name, value: isNaN(Number(val)) ? undefined : val, unit });
  }
  return results;
}
