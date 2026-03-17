"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  LoaderCircle,
  Radar,
  Search,
  Sparkles,
  Target,
} from "lucide-react";

type Lead = {
  title: string;
  platform: string;
  url: string;
  summary: string;
  problem: string;
  confidenceScore: number;
  rationale: string;
};

type ApiResponse = {
  leads: Lead[];
  query: string;
  provider: string;
  searchedPosts: number;
  matchMode?: "exact" | "related";
};

type ApiError = {
  error?: string;
};

const REQUEST_TIMEOUT_MS = 30000;

const conciseCopy = (value: string, maxLength: number) => {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trim()}...`;
};

const scoreTone = (score: number) => {
  if (score >= 80) {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  }

  if (score >= 60) {
    return "border-cyan-400/30 bg-cyan-400/10 text-cyan-100";
  }

  return "border-amber-400/30 bg-amber-400/10 text-amber-100";
};

export function SignalHunterDashboard() {
  const [niche, setNiche] = useState("n8n automation");
  const [problem, setProblem] = useState("broken workflow");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [provider, setProvider] = useState("");
  const [searchedPosts, setSearchedPosts] = useState(0);
  const [query, setQuery] = useState("");
  const [matchMode, setMatchMode] = useState<"exact" | "related">("exact");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const stats = useMemo(
    () => [
      { label: "Potential leads", value: leads.length.toString().padStart(2, "0") },
      { label: "Posts reviewed", value: searchedPosts ? searchedPosts.toString() : "--" },
      { label: "Search source", value: provider || "Awaiting scan" },
    ],
    [leads.length, provider, searchedPosts],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setHasSearched(true);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ niche, problem }),
        signal: controller.signal,
      });

      const data = (await response.json()) as ApiResponse | ApiError;

      if (!response.ok || !("leads" in data)) {
        const message = "error" in data ? data.error : undefined;
        throw new Error(message || "Signal scan failed.");
      }

      setLeads(data.leads);
      setProvider(data.provider);
      setSearchedPosts(data.searchedPosts);
      setQuery(data.query);
      setMatchMode(data.matchMode || "exact");
    } catch (caughtError) {
      const message =
        caughtError instanceof DOMException && caughtError.name === "AbortError"
          ? "That search took too long. Try a broader niche or problem."
          : caughtError instanceof Error
            ? caughtError.message
            : "Signal scan failed.";
      setError(message);
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
          <div className="grid gap-10 px-6 py-8 sm:px-8 lg:grid-cols-[1.3fr_0.7fr] lg:px-10 lg:py-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium tracking-[0.24em] text-cyan-100 uppercase">
                <Radar className="h-3.5 w-3.5" />
                Prospecting cockpit
              </div>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Hunt high-intent buyers from live social conversations.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Signal Hunter searches Reddit and X, then uses Gemini to
                  surface the posts most likely to turn into real client
                  conversations.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-4 sm:grid-cols-2 sm:p-5"
              >
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Niche</span>
                  <input
                    value={niche}
                    onChange={(event) => setNiche(event.target.value)}
                    placeholder="n8n automation"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:bg-white/8"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Problem</span>
                  <input
                    value={problem}
                    onChange={(event) => setProblem(event.target.value)}
                    placeholder="broken workflow"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:bg-white/8"
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-400 to-teal-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70 sm:col-span-2"
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Finding live opportunities
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Find client-ready leads
                    </>
                  )}
                </button>
              </form>

              {loading ? (
                <p className="text-sm text-slate-400">
                  Searches usually return in under 30 seconds.
                </p>
              ) : null}

              {error ? (
                <div className="flex items-start gap-3 rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5"
                >
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="mt-5 text-3xl font-semibold tracking-tight text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-sm text-cyan-100">
                <Sparkles className="h-4 w-4" />
                Gemini-ranked opportunities
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {query ? `Results for "${query}"` : "Run a search to see matched leads"}
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs tracking-[0.22em] text-slate-300 uppercase">
              <Target className="h-3.5 w-3.5" />
              {matchMode === "related" ? "Related opportunities" : "Ranked by buyer intent"}
            </div>
          </div>

          {!hasSearched ? (
            <div className="rounded-[2rem] border border-dashed border-white/10 bg-slate-950/40 px-6 py-14 text-center">
              <p className="text-lg font-medium text-white">
                No leads yet. Start with a niche and a real pain point.
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Example: niche = &quot;youtube&quot;, problem = &quot;video editor&quot;.
              </p>
            </div>
          ) : leads.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-white/10 bg-slate-950/40 px-6 py-14 text-center">
              <p className="text-lg font-medium text-white">
                No strong matches came back for that search.
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Try broader wording or swap in a real pain point like &quot;need clients&quot;,
                &quot;broken funnel&quot;, or &quot;looking to hire&quot;.
              </p>
            </div>
          ) : (
            <>
              {matchMode === "related" ? (
                <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/8 px-4 py-3 text-sm text-cyan-100">
                  Exact matches were sparse, so these are the closest relevant posts instead of an empty result.
                </div>
              ) : null}
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {leads.map((lead) => (
                <article
                  key={`${lead.url}-${lead.title}`}
                  className="group flex h-full flex-col rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-6 shadow-[0_18px_50px_rgba(2,6,23,0.22)] backdrop-blur-sm transition hover:-translate-y-1 hover:border-cyan-300/25 hover:shadow-[0_24px_70px_rgba(8,145,178,0.12)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate-400">
                        {lead.platform}
                      </p>
                      <h3 className="mt-3 text-lg leading-7 font-semibold text-white sm:text-xl">
                        {lead.title}
                      </h3>
                    </div>
                    <div
                      className={`shrink-0 rounded-full border px-3 py-1 text-sm font-semibold ${scoreTone(
                        lead.confidenceScore,
                      )}`}
                    >
                      {lead.confidenceScore}%
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
                      <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-slate-500">
                        Problem
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-200">
                        {conciseCopy(lead.problem, 130)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-slate-500">
                        Summary
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {conciseCopy(lead.summary, 150)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/8 pt-4">
                    <p className="line-clamp-2 text-xs leading-5 text-slate-400">
                      {conciseCopy(lead.rationale, 110)}
                    </p>
                    <a
                      href={lead.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/8 px-3 py-2 text-sm font-medium text-cyan-100 transition group-hover:border-cyan-300/30 group-hover:bg-cyan-300/12"
                    >
                      Open post
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </article>
              ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
