import { useState } from "react";

import { analyzeRepo, getDiff, runMission, type DiffResult, type MissionResult, type RepoSummary } from "./api/buildops";
import { HomePage } from "./pages/HomePage";
import { ResultsPage } from "./pages/ResultsPage";

type Phase = "idle" | "analyzing" | "running" | "complete";

export default function App() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [summary, setSummary] = useState<RepoSummary | null>(null);
  const [result, setResult] = useState<MissionResult | null>(null);
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startMission(repoUrl: string, mission: string) {
    setError(null);
    setResult(null);
    setDiff(null);
    try {
      setPhase("analyzing");
      const analyzed = await analyzeRepo(repoUrl);
      setSummary(analyzed);
      setPhase("running");
      const missionResult = await runMission(analyzed.repoId, mission);
      setResult(missionResult);
      const diffResult = await getDiff(analyzed.repoId).catch(() => null);
      setDiff(diffResult);
      setPhase("complete");
    } catch (caught) {
      setPhase("idle");
      setError(caught instanceof Error ? caught.message : "The BuildsOps Copilot run could not be completed.");
    }
  }

  function startOver() {
    setPhase("idle");
    setSummary(null);
    setResult(null);
    setDiff(null);
    setError(null);
  }

  if (phase === "complete" && summary && result) {
    return <ResultsPage summary={summary} result={result} diff={diff} onStartOver={startOver} />;
  }

  return <HomePage summary={summary} busy={phase === "analyzing" || phase === "running"} phase={phase} error={error} onSubmit={startMission} />;
}
