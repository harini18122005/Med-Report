import { NextResponse } from "next/server";
import terms from "@/app/data/terms.json";

export const runtime = "nodejs";

type TermInfo = {
  section: string;
  sectionTitle: string;
  simple: string;
  label: string;
};

type Ranges = Record<
  string,
  { unit?: string; typical?: [number, number] }
>;

const ranges: Ranges = {
  "Hemoglobin": { unit: "g/dL", typical: [12.0, 16.0] },
  "WBC": { unit: "10^9/L", typical: [4.0, 11.0] },
  "Platelets": { unit: "10^9/L", typical: [150, 450] },
  "Glucose (Fasting)": { unit: "mg/dL", typical: [70, 99] },
};

function compare(term: string, value?: number): {
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

function parseLines(text: string) {
  const lines = text
    .split(/\r?\n/) // split on newlines
    .map((l) => l.trim())
    .filter(Boolean);

  const results: Array<{
    term: string;
    value?: number;
    unit?: string;
  }> = [];

  const re = /([^:]+):\s*(-?\d+(?:\.\d+)?)?\s*([A-Za-z0-9^/%\.\-]*)?/;
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

async function maybeAiSummary(input: string, level: string): Promise<{
  aiUsed: boolean;
  aiNarrative?: string;
  aiQuestions?: string[];
}> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { aiUsed: false };

  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: key });
    const prompt = `You are a careful medical communication assistant. Rewrite the following lab report text in ${
      level === "child" ? "very simple" : "patient-friendly"
    } language. Do NOT diagnose or give treatment. Avoid alarming language. Keep it calm, factual, and supportive. Then provide 3-5 short questions the patient could ask their doctor. Reply in plain text.\n\nReport:\n${input}`;

    const completion = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
      temperature: 0.2,
    });

    const text = completion.output_text?.trim() || "";
    if (!text) return { aiUsed: false };

    // naive split: last lines that start with - or number become questions
    const lines = text.split(/\r?\n/);
    const qs: string[] = [];
    for (const line of lines) {
      const l = line.trim();
      if (/^(?:[-•\d])/.test(l)) qs.push(l.replace(/^[-•\d.\s]+/, "").trim());
    }
    const narrative = text;
    return { aiUsed: true, aiNarrative: narrative, aiQuestions: qs.slice(0, 5) };
  } catch {
    return { aiUsed: false };
  }
}

export async function POST(req: Request) {
  try {
    const { text, level = "standard", useAi } = (await req.json()) as {
      text: string;
      level?: "child" | "standard";
      useAi?: boolean;
    };

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing 'text'" }, { status: 400 });
    }

    const parsed = parseLines(text);
    const sections: Record<string, { section: string; sectionTitle: string; items: any[] }> = {};

    for (const row of parsed) {
      // match against known terms
      const keys = Object.keys(terms as Record<string, TermInfo>);
      const found = keys.find((k) => k.toLowerCase() === row.term.toLowerCase());
      if (!found) continue;
      const meta = (terms as Record<string, TermInfo>)[found];
      const cmp = compare(found, row.value);

      if (!sections[meta.section]) {
        sections[meta.section] = {
          section: meta.section,
          sectionTitle: meta.sectionTitle,
          items: [],
        };
      }

      sections[meta.section].items.push({
        term: found,
        label: meta.label,
        value: row.value,
        unit: row.unit || ranges[found]?.unit,
        typical: cmp.typical,
        status: cmp.status,
        explanation:
          level === "child"
            ? `${meta.simple} Your value looks ${cmp.status.replace("-", " ")}.`
            : `${meta.simple} Based on the typical range, this is ${cmp.status}.`,
      });
    }

    const defaultQuestions = [
      "Are any of these results concerning for me?",
      "Do I need to repeat any tests or follow up?",
      "Could medicines, diet, or dehydration affect these values?",
      "What lifestyle changes might help keep these in range?",
    ];

    const disclaimer =
      "This summary is for understanding only and is not medical advice. Always discuss your results with your doctor.";

    let aiBlock: Awaited<ReturnType<typeof maybeAiSummary>> = { aiUsed: false };
    if (useAi) {
      aiBlock = await maybeAiSummary(text, level);
    }

    return NextResponse.json({
      sections: Object.values(sections),
      questions: aiBlock.aiQuestions?.length ? aiBlock.aiQuestions : defaultQuestions,
      disclaimer,
      aiUsed: aiBlock.aiUsed,
      aiNarrative: aiBlock.aiNarrative,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
