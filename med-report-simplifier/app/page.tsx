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

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "low": return "text-blue-600 dark:text-blue-400";
      case "high": return "text-red-600 dark:text-red-400";
      case "in-range": return "text-green-600 dark:text-green-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "low": return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
      case "high": return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
      case "in-range": return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-6 shadow-2xl">
        <div className="mx-auto max-w-4xl">
          <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
            ✨ Powered by AI
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            Med‑Report Simplifier
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl">
            Transform complex medical reports into clear, understandable language. 
            Get instant insights and doctor-ready questions.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-4xl -mt-8 px-6 pb-16">
        {/* Disclaimer Card */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-8 shadow-lg backdrop-blur-sm">
          <p className="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
            <span className="text-lg">⚕️</span>
            <span>For understanding only. Not medical advice. Always consult your doctor.</span>
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="grid gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  Paste Your Report
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setText([
                      "Hemoglobin: 12.8 g/dL", "WBC: 6.1 10^9/L", "Platelets: 220 10^9/L",
                      "Glucose (Fasting): 92 mg/dL", "Total Cholesterol: 182 mg/dL", "LDL: 110 mg/dL",
                      "HDL: 50 mg/dL", "Triglycerides: 140 mg/dL", "ALT: 23 U/L", "AST: 19 U/L",
                      "TSH: 2.1 mIU/L", "Creatinine: 0.9 mg/dL", "BUN: 14 mg/dL",
                      "Sodium: 140 mmol/L", "Potassium: 4.2 mmol/L", "Calcium: 9.2 mg/dL",
                    ].join("\n"))
                  }
                  className="text-sm px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  ✨ Try Sample
                </button>
              </div>
              <textarea
                className="w-full h-48 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-4 text-base focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all resize-none"
                placeholder="Example:
Hemoglobin: 12.8 g/dL
WBC: 6.1 10^9/L
Platelets: 220 10^9/L
Glucose (Fasting): 92 mg/dL"
                value={text}
                onChange={(e) => setText(e.target.value)}
                aria-label="Paste your medical report"
              />
              {text && (
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-gray-500">{text.length} characters</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">✓ Ready to analyze</span>
                </div>
              )}
            </div>

            <div className="grid gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Explain level:</span>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="level"
                    value="standard"
                    checked={level === "standard"}
                    onChange={() => setLevel("standard")}
                    className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm group-hover:text-blue-600 transition-colors">Patient‑friendly</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="level"
                    value="child"
                    checked={level === "child"}
                    onChange={() => setLevel("child")}
                    className="w-4 h-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-sm group-hover:text-purple-600 transition-colors">Simple language</span>
                </label>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                <input
                  type="checkbox"
                  checked={useAi}
                  onChange={(e) => setUseAi(e.target.checked)}
                  aria-label="Enable AI assistant"
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-sm group-hover:text-emerald-600 transition-colors flex items-center gap-2">
                  🤖 Enable AI Assistant
                  {useAi && <span className="text-xs text-emerald-600 dark:text-emerald-400">(Requires API key)</span>}
                </span>
              </label>
            </div>

            <button
              onClick={onSubmit}
              disabled={loading || !text.trim()}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center gap-3"
              aria-label={loading ? "Analyzing report" : "Simplify report"}
            >
              {loading && (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {loading ? "Analyzing your report..." : "🔍 Simplify Report"}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 shadow-lg animate-in fade-in">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">Error</h3>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {data && (
          <section className="grid gap-6 animate-in fade-in slide-in-from-bottom duration-500">
            {/* AI Summary */}
            {data.aiUsed && data.aiNarrative && (
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🤖</span>
                  <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">AI Summary</h2>
                </div>
                <p className="whitespace-pre-wrap text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">{data.aiNarrative}</p>
              </div>
            )}

            {/* Results Sections */}
            {data.sections.map((sec, idx) => (
              <div 
                key={sec.section} 
                className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-xl transform transition-all hover:shadow-2xl"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-3xl">
                    {sec.section === "Hematology" ? "🔴" : 
                     sec.section === "Biochemistry" ? "⚗️" :
                     sec.section === "Lipids" ? "💊" :
                     sec.section === "Liver" ? "🫀" :
                     sec.section === "Thyroid" ? "🦋" :
                     sec.section === "Kidney" ? "🫘" : "📊"}
                  </span>
                  {sec.sectionTitle}
                </h2>
                <ul className="grid gap-4">
                  {sec.items.map((it) => (
                    <li key={it.term} className="rounded-xl bg-gray-50 dark:bg-gray-900 p-4 border-l-4 border-blue-500 hover:border-purple-500 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white text-lg">{it.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base text-gray-700 dark:text-gray-300">
                            {typeof it.value === "number" ? `${it.value} ${it.unit || ""}` : "—"}
                          </span>
                          {it.status && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(it.status)}`}>
                              {it.status.replace("-", " ")}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">{it.explanation}</p>
                      {it.typical && (
                        <p className={`text-xs font-medium ${getStatusColor(it.status)}`}>
                          Typical range: {it.typical[0]}–{it.typical[1]} {it.unit || ""}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Questions Card */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-3xl">💬</span>
                  Questions for Your Doctor
                </h2>
                <button
                  onClick={() => copyToClipboard(data.questions.join("\n"))}
                  className="px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all text-sm font-medium shadow-md hover:shadow-lg"
                  title="Copy questions to clipboard"
                >
                  {copied ? "✓ Copied!" : "📋 Copy"}
                </button>
              </div>
              <ul className="space-y-3">
                {data.questions.map((q, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed">{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Disclaimer */}
            <div className="rounded-xl bg-gray-100 dark:bg-gray-800 p-4 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400 italic">{data.disclaimer}</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
