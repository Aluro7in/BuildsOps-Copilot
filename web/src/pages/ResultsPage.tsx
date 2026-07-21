import { ArrowLeft, Bot } from "lucide-react";

import type { DiffResult, MissionResult, RepoSummary } from "../api/buildops";
import { MissionResults } from "../components/MissionResults";
import { RepoSummary as RepoSummaryView } from "../components/RepoSummary";

interface ResultsPageProps {
  summary: RepoSummary;
  result: MissionResult;
  diff: DiffResult | null;
  onStartOver: () => void;
}

export function ResultsPage({ summary, result, diff, onStartOver }: ResultsPageProps) {
  return (
    <main className="app-shell">
      <header className="topbar"><a className="brand" href="/"><span className="brand-mark"><Bot size={20} /></span><span>BuildsOps Copilot</span></a><button className="back-button" type="button" onClick={onStartOver}><ArrowLeft size={17} />New mission</button></header>
      <section className="results-intro"><p className="eyebrow">Mission complete</p><h1>{result.plan.mission}</h1><p>Repository workspace: <code>{result.repoId}</code></p></section>
      <RepoSummaryView summary={summary} />
      <MissionResults result={result} diff={diff} />
    </main>
  );
}
