"use client";
import { useState } from "react";

type ApiItem = {
  term: string;
  label: string;
  value?: number;
  unit?: string;
  typical?: [number, number];
  status?: "low" | "high" | "in-range" | "unknown";
  explanation: string;
};

type ApiSection = {
  section: string;
  sectionTitle: string;
  items: ApiItem[];
};

type ApiResponse = {
  sections: ApiSection[];
  questions: string[];
  disclaimer: string;
  aiUsed?: boolean;
  aiNarrative?: string;
};

export default function Home() {
  const [text, setText] = useState("");
  const [level, setLevel] = useState<"child" | "standard">("standard");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [useAi, setUseAi] = useState<boolean>(false);

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Failed to copy");
    }
  }

  async function onSubmit() {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch("/api/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, level, useAi }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Request failed");
      }
      const json: ApiResponse = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-zinc-50">
      <main className="mx-auto max-w-3xl p-6 sm:p-10">
        <h1 className="text-3xl font-semibold">Med‑Report Simplifier</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          This tool simplifies medical report text for understanding only. It
          does not diagnose conditions. Please consult your doctor for medical
          advice.
        </p>

        <div className="mt-6 grid gap-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">Paste your report</label>
            <button
              type="button"
              onClick={() =>
                setText(
                  [
                    "Hemoglobin: 12.8 g/dL",
                    "WBC: 6.1 10^9/L",
                    "Platelets: 220 10^9/L",
                    "Glucose (Fasting): 92 mg/dL",
                    "Total Cholesterol: 182 mg/dL",
                    "LDL: 110 mg/dL",
                    "HDL: 50 mg/dL",
                    "Triglycerides: 140 mg/dL",
                    "ALT: 23 U/L",
                    "AST: 19 U/L",
                    "TSH: 2.1 mIU/L",
                    "Creatinine: 0.9 mg/dL",
                    "BUN: 14 mg/dL",
                    "Sodium: 140 mmol/L",
                    "Potassium: 4.2 mmol/L",
                    "Calcium: 9.2 mg/dL",
                  ].join("\n")
                )
              }
              className="text-xs px-2 py-1 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Use sample
            </button>
          </div>
          <textarea
            className="w-full h-40 rounded-md border border-zinc-300 bg-white dark:bg-zinc-900 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`Example:\nHemoglobin: 12.8 g/dL\nWBC: 6.1 10^9/L\nPlatelets: 220 10^9/L\nGlucose (Fasting): 92 mg/dL`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="Paste your medical report"
          />
          {text && <p className="text-xs text-zinc-500">Characters: {text.length}</p>}

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Explain level</span>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="level"
                value="standard"
                checked={level === "standard"}
                onChange={() => setLevel("standard")}
              />
              Patient‑friendly
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="level"
                value="child"
                checked={level === "child"}
                onChange={() => setLevel("child")}
              />
              Explain like I’m a child
            </label>
          </div>

          <button
            onClick={onSubmit}
            disabled={loading || !text.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
            aria-label={loading ? "Simplifying report" : "Simplify report"}
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {loading ? "Simplifying…" : "Simplify"}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
            <div className="font-semibold">Error</div>
            <p>{error}</p>
          </div>
        )}

        <div className="mt-2 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={useAi}
              onChange={(e) => setUseAi(e.target.checked)}
              aria-label="Enable AI assistant"
            />
            Use AI assistant (if enabled)
          </label>
          {useAi && (
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              Requires OPENAI_API_KEY in environment
            </span>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        {data && (
          <section className="mt-8 grid gap-6">
            {data.aiUsed && data.aiNarrative && (
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-900 p-4 bg-emerald-50 dark:bg-emerald-900/20">
                <h2 className="text-xl font-medium">AI Summary</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm text-emerald-900 dark:text-emerald-200">{data.aiNarrative}</p>
              </div>
            )}
            {data.sections.map((sec) => (
              <div key={sec.section} className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                <h2 className="text-xl font-medium">{sec.sectionTitle}</h2>
                <ul className="mt-3 grid gap-3">
                  {sec.items.map((it) => (
                    <li key={it.term} className="rounded-md bg-white dark:bg-zinc-900 p-3 border border-zinc-200 dark:border-zinc-800">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium">{it.label}</span>
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {typeof it.value === "number" ? `${it.value}${it.unit ? " " + it.unit : ""}` : "—"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{it.explanation}</p>
                      {it.typical && (
                        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                          Typical range: {it.typical[0]}–{it.typical[1]} {it.unit || ""} · Status: {it.status}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-medium">Questions for your doctor</h2>
                <button
                  onClick={() => copyToClipboard(data.questions.join("\n"))}
                  className="text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  title="Copy questions to clipboard"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
                {data.questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400">{data.disclaimer}</p>
          </section>
        )}
      </main>
    </div>
  );
}
