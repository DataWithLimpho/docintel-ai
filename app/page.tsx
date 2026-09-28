"use client";

import { useRef, useState } from "react";

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState("");
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
const [answer, setAnswer] = useState("");
const [isAsking, setIsAsking] = useState(false);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please select a PDF document.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setAnalysis("");
    setError("");
  }

  async function handleAnalyse() {
    if (!selectedFile) return;

    try {
      setIsAnalysing(true);
      setError("");
      setAnalysis("");

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/analyse", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to analyse document.");
      }

      setAnalysis(data.analysis);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while analysing the document."
      );
    } finally {
      setIsAnalysing(false);
    }
  }

async function handleAsk() {
  if (!selectedFile || !question.trim()) return;

  try {
    setIsAsking(true);
    setError("");
    setAnswer("");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("question", question.trim());

    const response = await fetch("/api/ask", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to answer the question.");
    }

    setAnswer(data.answer);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Something went wrong while answering your question."
    );
  } finally {
    setIsAsking(false);
  }
}

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-semibold">
              DocIntel <span className="text-emerald-400">AI</span>
            </h1>

            <p className="text-xs text-slate-500">
              Intelligent document analysis
            </p>
          </div>

          <div className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">
            AI Workspace
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">
            Powered by Gemini
          </div>

          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Understand your documents
            <span className="block text-emerald-400">in seconds.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            Upload a document, generate an intelligent summary, and ask
            questions grounded in its content.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <div className="rounded-xl border-2 border-dashed border-slate-700 px-6 py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-xl text-emerald-400">
              ↑
            </div>

            <h3 className="font-medium">Upload a document</h3>

            <p className="mt-2 text-sm text-slate-500">
              PDF documents supported
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalysing}
              className="mt-6 rounded-lg bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {selectedFile ? "Choose Another PDF" : "Choose PDF"}
            </button>

            {selectedFile && (
              <div className="mt-6">
                <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-4">
                  <p className="break-all text-sm font-medium text-emerald-400">
                    ✓ {selectedFile.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAnalyse}
                  disabled={isAnalysing}
                  className="mt-5 w-full rounded-lg border border-emerald-400 px-5 py-2.5 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-400 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAnalysing ? "Analysing..." : "Analyse Document"}
                </button>
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}
          </div>
        </div>

        {analysis && (
          <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  AI Analysis
                </p>

                <h3 className="mt-1 text-xl font-semibold">
                  Document Insights
                </h3>
              </div>

              <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                Complete
              </div>
            </div>

            <div className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
              {analysis}
            </div>
          </div>
        )}

        {analysis && (
  <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-8">
    <div className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
        Ask DocIntel
      </p>

      <h3 className="mt-1 text-xl font-semibold">
        Ask about this document
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        Ask a question and receive an answer grounded in the uploaded PDF.
      </p>
    </div>

    <div className="flex gap-3">
      <input
        type="text"
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        placeholder="What are the main findings?"
        className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400"
      />

      <button
        type="button"
        onClick={handleAsk}
        disabled={!question.trim() || isAsking}
        className="rounded-lg bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isAsking ? "Thinking..." : "Ask"}
      </button>
    </div>

    {answer && (
      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/60 p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
          Answer
        </p>

        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
          {answer}
        </p>
      </div>
    )}
  </div>
)}

        <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-3">
          {[
            ["01", "Upload", "Add your PDF document"],
            ["02", "Analyse", "AI extracts key insights"],
            ["03", "Ask", "Question your document"],
          ].map(([number, title, description]) => (
            <div
              key={number}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
            >
              <span className="text-xs font-semibold text-emerald-400">
                {number}
              </span>

              <h3 className="mt-2 font-medium">{title}</h3>

              <p className="mt-1 text-xs text-slate-500">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}