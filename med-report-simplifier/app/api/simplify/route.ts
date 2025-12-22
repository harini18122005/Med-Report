import { NextResponse } from "next/server";
import terms from "../../data/terms.json";
import ranges from "../../data/ranges.json";

export type SimplifyRequest = {
  text: string;
  level: "child" | "standard";
};

export type SimplifiedItem = {
  term: string;
  label: string;
  value?: number;
  unit?: string;
  typical?: [number, number];
  status?: "low" | "high" | "in-range" | "unknown";
  explanation: string;
};

export type SimplifiedSection = {
  section: string;
  sectionTitle: string;
  items: SimplifiedItem[];
};

export type SimplifyResponse = {
  sections: SimplifiedSection[];
  questions: string[];
  disclaimer: string;
};

function parseLines(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const rx = /^([^:]+):\s*(-?\d+(?:\.\d+)?)?\s*([A-Za-z0-9^/%\.\-]*)?/i;
  return lines
    .map((line) => {
      const m = line.match(rx);
      if (!m) return { raw: line } as any;
      const term = m[1]?.trim();
      const value = m[2] ? Number(m[2]) : undefined;
      const unit = m[3]?.trim() || undefined;
      return { raw: line, term, value, unit };
    })
    .filter((x) => !!x.term);
}

function explain(termKey: string, level: "child" | "standard") {
  const t = (terms as any)[termKey];
  if (!t) return "This item is noted in the report.";
  const base = t.simple as string;
  if (level === "child") {
    // slightly simpler phrasing
    return base
      .replace("carries", "moves")
      .replace("infections", "germs")
      .replace("blood to clot", "stop bleeding");
  }
  return base;
}

function compareToTypical(termKey: string, value?: number): {
  unit?: string;
  typical?: [number, number];
  status: "low" | "high" | "in-range" | "unknown";
} {
  const r = (ranges as any)[termKey];
  if (!r || typeof value !== "number") {
    return { status: "unknown" };
  }
  const [low, high] = r.typical as [number, number];
  if (value < low) return { unit: r.unit, typical: [low, high], status: "low" };
  if (value > high) return { unit: r.unit, typical: [low, high], status: "high" };
  return { unit: r.unit, typical: [low, high], status: "in-range" };
}

export async function POST(req: Request) {
  let body: SimplifyRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { text, level } = body;
  if (!text || !level) {
    return NextResponse.json(
      { error: "Missing 'text' or 'level'" },
      { status: 400 }
    );
  }

  const parsed = parseLines(text);

  // Group into sections using terms mapping
  const sectionsMap: Record<string, SimplifiedSection> = {};

  for (const item of parsed) {
    const t = (terms as any)[item.term as string];
    const section = t?.section || "Other";
    const sectionTitle = t?.sectionTitle || "Other Findings";

    if (!sectionsMap[section]) {
      sectionsMap[section] = {
        section,
        sectionTitle,
        items: [],
      };
    }

    const comp = compareToTypical(item.term as string, item.value);

    const simplifiedItem: SimplifiedItem = {
      term: item.term as string,
      label: t?.label || (item.term as string),
      value: item.value,
      unit: comp.unit || item.unit,
      typical: comp.typical,
      status: comp.status,
      explanation: explain(item.term as string, level),
    };

    sectionsMap[section].items.push(simplifiedItem);
  }

  const sections = Object.values(sectionsMap);

  // Generate friendly questions (not diagnostic)
  const flagged = sections
    .flatMap((s) => s.items)
    .filter((i) => i.status === "low" || i.status === "high");

  const questions: string[] = [];
  if (flagged.length) {
    const first = flagged[0];
    questions.push(
      `Could we discuss my ${first.label} result and whether a follow-up test is useful?`
    );
  }
  questions.push(
    "Which of these values should I pay attention to and why?",
    "Are there lifestyle or routine changes related to these results?",
    "When should I recheck this report, and which tests?"
  );

  const disclaimer =
    "This tool simplifies report language for understanding only. It does not diagnose conditions. Please consult your doctor for medical advice.";

  const response: SimplifyResponse = {
    sections,
    questions,
    disclaimer,
  };

  return NextResponse.json(response);
}
