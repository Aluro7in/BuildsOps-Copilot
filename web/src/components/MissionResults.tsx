import { CheckCircle2, CircleAlert, Clipboard, Copy, FileDiff, FlaskConical } from "lucide-react";

import type { DiffResult, MissionResult } from "../api/buildops";

interface MissionResultsProps {
  result: MissionResult;
  diff: DiffResult | null;
}

function copyText(value: string) {
  void navigator.clipboard?.writeText(value);
}

export function MissionResults({ result, diff }: MissionResultsProps) {
  const testState = result.testResults.passed === true ? "passed" : result.testResults.passed === false ? "failed" : "not-run";
  const hasChanges = (diff?.changedFiles.length ?? 0) > 0;

  return (
    <div className="results-layout">
      <section className="section-block" aria-labelledby="plan-title">
        <div className="section-heading"><div><p className="eyebrow">Mission plan</p><h2 id="plan-title">{result.plan.overallGoal}</h2></div><span className={`status-pill ${result.plan.supported ? "supported" : "unsupported"}`}>{result.plan.supported ? "Supported" : "Unsupported"}</span></div>
        {result.plan.steps.length ? <ol className="plan-list">
          {result.plan.steps.map((step) => <li key={step.id}><span className="step-number">{step.id}</span><div><h3>{step.title}</h3><p>{step.description}</p><p className="rationale">{step.rationale}</p>{step.targetFiles.length > 0 && <div className="file-tags">{step.targetFiles.map((file) => <code key={file}>{file}</code>)}</div>}</div></li>)}
        </ol> : <p className="muted">{result.plan.notes.join(" ") || "No plan was generated."}</p>}
      </section>

      <section className="section-block validation" aria-labelledby="validation-title">
        <div className="section-heading"><div><p className="eyebrow">Validation</p><h2 id="validation-title">Test run</h2></div>{testState === "passed" ? <CheckCircle2 className="success-icon" aria-label="Tests passed" /> : <CircleAlert className="alert-icon" aria-label="Tests not passing" />}</div>
        <div className={`test-status ${testState}`}><FlaskConical size={18} /><strong>{testState === "passed" ? "Passed" : testState === "failed" ? "Failed" : "Not run"}</strong><span>{result.testResults.command ?? "No test command detected"}</span><span>{result.testResults.exitCode === null ? "" : `Exit ${result.testResults.exitCode}`}</span></div>
        {result.testResults.output && <details><summary>View runner output</summary><pre>{result.testResults.output}</pre></details>}
      </section>

      <section className="section-block" aria-labelledby="diff-title">
        <div className="section-heading"><div><p className="eyebrow">Generated changes</p><h2 id="diff-title">Diff and patches</h2></div><FileDiff size={20} aria-hidden="true" /></div>
        <p className="muted">{hasChanges ? `${diff?.changedFiles.length} changed file${diff?.changedFiles.length === 1 ? "" : "s"}.` : "No workspace changes are available yet."}</p>
        {result.patches.length > 0 && <ul className="patch-list">{result.patches.map((patch) => <li key={patch.id}><strong>{patch.description}</strong><span className={`patch-status ${patch.status}`}>{patch.status}</span><p>{patch.files.join(", ")}</p></li>)}</ul>}
        {diff?.diff && <details><summary>View unified diff</summary><pre>{diff.diff}</pre></details>}
      </section>

      <section className="section-block pr-copy" aria-labelledby="pr-title">
        <div className="section-heading"><div><p className="eyebrow">Review handoff</p><h2 id="pr-title">Pull request copy</h2></div><button type="button" className="icon-button" onClick={() => copyText(result.prDescription)} aria-label="Copy PR description" title="Copy PR description"><Copy size={17} /></button></div>
        <div className="prose"><p>{result.explanation}</p><pre>{result.prDescription}</pre></div>
        <h3>Suggested commits</h3>
        <ul className="commit-list">{result.commitMessages.map((message) => <li key={message}><code>{message}</code><button type="button" className="icon-button" onClick={() => copyText(message)} aria-label={`Copy ${message}`} title="Copy commit message"><Clipboard size={15} /></button></li>)}</ul>
      </section>
    </div>
  );
}
