import { Activity, Bot, GitPullRequest, ShieldCheck } from "lucide-react";

import type { RepoSummary } from "../api/buildops";
import { MissionForm } from "../components/MissionForm";
import { RepoSummary as RepoSummaryView } from "../components/RepoSummary";

interface HomePageProps {
  summary: RepoSummary | null;
  busy: boolean;
  phase: "idle" | "analyzing" | "running" | "complete";
  error: string | null;
  onSubmit: (repoUrl: string, mission: string) => Promise<void>;
}

const phaseLabel = { idle: "Ready", analyzing: "Cloning and inspecting repository", running: "Planning, patching, and testing", complete: "Complete" };

export function HomePage({ summary, busy, phase, error, onSubmit }: HomePageProps) {
  return (
    <main className="app-shell">
      <header className="topbar"><a className="brand" href="/"><span className="brand-mark"><Bot size={20} /></span><span>BuildsOps Copilot</span></a><span className="environment"><span className="environment-dot" />Sandboxed workflow</span></header>
      <section className="workspace-intro">
        <div><p className="eyebrow">Maintenance automation</p><h1>Turn a repository task into a reviewable change.</h1><p className="intro-copy">BuildsOps Copilot turns high-level maintenance tasks into reviewable, tested code changes for real repositories, across multiple languages and frameworks.</p></div>
        <div className="workflow-strip" aria-label="Workflow steps"><span><GitPullRequest size={17} />Inspect</span><span><Activity size={17} />Execute</span><span><ShieldCheck size={17} />Validate</span></div>
      </section>
      <section className="tool-surface" aria-labelledby="mission-form-title"><div className="section-heading"><div><p className="eyebrow">New run</p><h2 id="mission-form-title">Repository mission</h2></div><span className={`status-pill ${busy ? "running" : "ready"}`}>{phaseLabel[phase]}</span></div><MissionForm busy={busy} onSubmit={onSubmit} />{error && <p className="error-banner" role="alert">{error}</p>}</section>
      {summary && <RepoSummaryView summary={summary} />}
    </main>
  );
}
