import { NextResponse } from "next/server";
import type OpenAI from "openai";
import terms from "@/app/data/terms.json";
import { compare, parseLines, ranges } from "@/app/lib/analyze";

export const runtime = "nodejs";

type TermInfo = {
  section: string;
  sectionTitle: string;
  simple: string;
  label: string;
};

// Parsing and range logic moved to app/lib/analyze for reuse and testing.

async function maybeAiSummary(input: string, level: string): Promise<{
  aiUsed: boolean;
  aiNarrative?: string;
  aiQuestions?: string[];
}> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { aiUsed: false };

  try {
    const { default: OpenAIModule } = await import("openai");
    const client = new OpenAIModule({ apiKey: key });
    const prompt = `You are a careful medical communication assistant. Rewrite the following lab report text in ${
      level === "child" ? "very simple" : "patient-friendly"
    } language. Do NOT diagnose or give treatment. Avoid alarming language. Keep it calm, factual, and supportive. Then provide 3-5 short questions the patient could ask their doctor. Reply in plain text.\n\nReport:\n${input}`;

    // @ts-ignore - OpenAI SDK has proper types at runtime
    const completion = await client.messages.create({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
    });

    const text = completion.content[0]?.type === "text" ? completion.content[0].text.trim() : "";
    if (!text) return { aiUsed: false };

    // Split narrative and questions
    const parts = text.split(/\n(?=[0-9]|[-•])/);
    const narrative = parts[0]?.trim() || text;
    const qs: string[] = [];
    
    if (parts.length > 1) {
      for (let i = 1; i < parts.length; i++) {
        const line = parts[i].trim();
        if (line) {
          qs.push(line.replace(/^[0-9]\.?\s*[-•]?\s*/, "").trim());
        }
      }
    }
    
    return { aiUsed: true, aiNarrative: narrative, aiQuestions: qs.slice(0, 5) };
  } catch (error) {
    console.error("AI Summary Error:", error);
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
