"use client";
import { useEffect, useState } from "react";

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
  const [useAi, setUseAi] = useState<boolean>(true);
  const [sampleName, setSampleName] = useState("");
  const [customSamples, setCustomSamples] = useState<{ name: string; text: string }[]>([]);

  // Load any saved samples from localStorage on first render.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("custom-samples");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setCustomSamples(parsed);
      }
    } catch {
      // ignore parsing errors
    }
  }, []);

  // Persist samples when they change.
  useEffect(() => {
    try {
      localStorage.setItem("custom-samples", JSON.stringify(customSamples));
    } catch {
      // ignore storage errors
    }
  }, [customSamples]);

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Failed to copy");
    }
  }

  function saveSample() {
    const name = sampleName.trim();
    const body = text.trim();
    if (!name || !body) return;
    setCustomSamples((prev) => {
      const filtered = prev.filter((s) => s.name.toLowerCase() !== name.toLowerCase());
      return [...filtered, { name, text: body }];
    });
    setSampleName("");
  }

  function loadSample(name: string) {
    const sample = customSamples.find((s) => s.name === name);
    if (sample) setText(sample.text);
  }

  function deleteSample(name: string) {
    setCustomSamples((prev) => prev.filter((s) => s.name !== name));
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900 transition-colors duration-500 animate-in fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-cyan-100 text-gray-900 py-12 sm:py-16 md:py-20 px-4 sm:px-6 shadow-lg border-b border-cyan-200 animate-in slide-in-from-top duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-100 via-blue-100 to-teal-100 opacity-70" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl">
          <div className="inline-block px-3 sm:px-4 py-1 bg-white/90 backdrop-blur-sm text-blue-700 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4 shadow-sm">
            ✨ Powered by AI
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent leading-tight">
            Med‑Report Simplifier
          </h1>
          <p className="text-base sm:text-lg text-gray-700 max-w-2xl leading-relaxed">
            Transform complex medical reports into clear, understandable language. 
            Get instant insights and doctor-ready questions.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-4xl -mt-6 sm:-mt-8 px-4 sm:px-6 pb-12 sm:pb-16 md:pb-20">
        {/* Disclaimer Card */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-6 sm:mb-8 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top duration-500 delay-100" role="alert">
          <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
            <span className="text-lg flex-shrink-0" aria-hidden="true">⚕️</span>
            <span>For understanding only. Not medical advice. Always consult your doctor.</span>
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top duration-500 delay-200 hover:shadow-3xl transition-shadow">
          <div className="grid gap-4 sm:gap-6">
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
                <label className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-2xl" aria-hidden="true">📋</span>
                  <span>Paste Your Report</span>
                </label>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <select
                    onChange={(e) => {
                      const samples: { [key: string]: string } = {
                        healthy: [
                          "Hemoglobin: 12.8 g/dL", "WBC: 6.1 10^9/L", "Platelets: 220 10^9/L",
                          "Glucose (Fasting): 92 mg/dL", "Total Cholesterol: 182 mg/dL", "LDL: 110 mg/dL",
                          "HDL: 50 mg/dL", "Triglycerides: 140 mg/dL", "ALT: 23 U/L", "AST: 19 U/L",
                          "TSH: 2.1 mIU/L", "Creatinine: 0.9 mg/dL", "BUN: 14 mg/dL",
                          "Sodium: 140 mmol/L", "Potassium: 4.2 mmol/L", "Calcium: 9.2 mg/dL",
                        ].join("\n"),
                        diabetic: [
                          "Glucose (Fasting): 145 mg/dL",
                          "Hemoglobin A1C: 8.5%",
                          "Total Cholesterol: 220 mg/dL",
                          "LDL: 150 mg/dL",
                          "HDL: 35 mg/dL",
                          "Triglycerides: 280 mg/dL",
                          "Creatinine: 1.1 mg/dL",
                          "BUN: 22 mg/dL",
                          "Sodium: 138 mmol/L",
                          "Potassium: 4.8 mmol/L",
                        ].join("\n"),
                        anemia: [
                          "Hemoglobin: 10.2 g/dL",
                          "Hematocrit: 32%",
                          "WBC: 5.8 10^9/L",
                          "Platelets: 180 10^9/L",
                          "Iron: 40 μg/dL",
                          "Ferritin: 12 ng/mL",
                          "B12: 200 pg/mL",
                          "Folate: 3 ng/mL",
                        ].join("\n"),
                        heart: [
                          "Total Cholesterol: 280 mg/dL",
                          "LDL: 200 mg/dL",
                          "HDL: 30 mg/dL",
                          "Triglycerides: 350 mg/dL",
                          "AST: 45 U/L",
                          "ALT: 52 U/L",
                          "Creatinine: 1.3 mg/dL",
                          "Potassium: 5.2 mmol/L",
                          "Sodium: 135 mmol/L",
                        ].join("\n"),
                        thyroid: [
                          "TSH: 8.5 mIU/L",
                          "Free T4: 0.7 ng/dL",
                          "Free T3: 2.1 pg/mL",
                          "Hemoglobin: 11.5 g/dL",
                          "Cholesterol: 250 mg/dL",
                          "Glucose: 105 mg/dL",
                          "Weight gain indicators: High",
                        ].join("\n"),
                      };
                      if (e.target.value && samples[e.target.value]) {
                        setText(samples[e.target.value]);
                      }
                      e.target.value = "";
                    }}
                    className="text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer hover:border-blue-500 transition"
                  >
                    <option value="">📌 Load Sample...</option>
                    <option value="healthy">✅ Healthy Checkup</option>
                    <option value="diabetic">🍬 Diabetic Concern</option>
                    <option value="anemia">🩸 Anemia Case</option>
                    <option value="heart">❤️ Heart Health</option>
                    <option value="thyroid">🦋 Thyroid Issue</option>
                  </select>
                </div>
              </div>
              <textarea
                className="w-full h-40 sm:h-48 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all resize-none"
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

              {/* Custom sample saver */}
              <div className="mt-4 sm:mt-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/50 p-3 sm:p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                    <span className="text-lg" aria-hidden="true">🧪</span>
                    <span>Save your own sample</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      value={sampleName}
                      onChange={(e) => setSampleName(e.target.value)}
                      placeholder="Sample name (e.g., Mom checkup)"
                      className="w-full sm:w-56 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={saveSample}
                        className="px-3 sm:px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:scale-95 transition"
                      >
                        Save sample
                      </button>
                      <button
                        type="button"
                        onClick={() => setText("")}
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {customSamples.length === 0 && (
                    <span className="text-xs text-gray-500">No saved samples yet. Add a name and click "Save sample".</span>
                  )}
                  {customSamples.map((sample) => (
                    <div key={sample.name} className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1 shadow-sm">
                      <button
                        type="button"
                        onClick={() => loadSample(sample.name)}
                        className="text-xs font-semibold text-blue-700 dark:text-blue-300 hover:underline"
                      >
                        {sample.name}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSample(sample.name)}
                        className="text-xs text-gray-400 hover:text-red-500"
                        aria-label={`Delete sample ${sample.name}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
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
              <div className="rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/20 dark:to-green-900/20 p-6 shadow-2xl animate-in fade-in slide-in-from-left duration-700 hover:shadow-3xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg animate-pulse">
                      <span className="text-2xl">🤖</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">AI-Powered Summary</h2>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">Generated by OpenAI</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-md">AI</span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-emerald-900 dark:text-emerald-100 leading-relaxed bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl">{data.aiNarrative}</p>
              </div>
            )}

            {/* Results Sections */}
            {data.sections.map((sec, idx) => (
              <div 
                key={sec.section} 
                className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 shadow-xl transform transition-all hover:shadow-3xl hover:scale-[1.01] animate-in fade-in slide-in-from-bottom duration-500"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <span className="text-2xl">
                      {sec.section === "Hematology" ? "🔴" : 
                       sec.section === "Biochemistry" ? "⚗️" :
                       sec.section === "Lipids" ? "💊" :
                       sec.section === "Liver" ? "🫀" :
                       sec.section === "Thyroid" ? "🦋" :
                       sec.section === "Kidney" ? "🫘" : "📊"}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{sec.sectionTitle}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{sec.items.length} test{sec.items.length > 1 ? 's' : ''} analyzed</p>
                  </div>
                </div>
                <ul className="grid gap-4">
                  {sec.items.map((it) => (
                    <li key={it.term} className="rounded-xl bg-white dark:bg-gray-800 p-4 border-l-4 border-blue-500 hover:border-purple-500 transition-all hover:shadow-lg hover:translate-x-1 duration-200">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white text-lg">{it.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
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

      {/* Footer */}
      <footer className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 border-t border-cyan-200 dark:border-gray-700 mt-16 py-12 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">About</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Simplify medical reports into plain language instantly.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Features</h3>
              <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <li>📊 Lab analysis</li>
                <li>🤖 AI summaries</li>
                <li>💬 Doctor questions</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Legal</h3>
              <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <li>⚠️ Not medical advice</li>
                <li>👨‍⚕️ Consult doctor</li>
                <li>🔒 Your privacy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-cyan-200 dark:border-gray-700 pt-6 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              © 2025 Med-Report Simplifier. For understanding only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
