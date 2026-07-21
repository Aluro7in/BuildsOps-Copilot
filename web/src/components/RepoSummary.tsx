import { Braces, FileCode2, GitBranch, TestTube2 } from "lucide-react";

import type { RepoSummary as RepoSummaryType } from "../api/buildops";

interface RepoSummaryProps {
  summary: RepoSummaryType;
}

function FileList({ items, empty }: { items: string[]; empty: string }) {
  return items.length ? (
    <ul className="file-list">{items.map((file) => <li key={file}>{file}</li>)}</ul>
  ) : <p className="muted">{empty}</p>;
}

export function RepoSummary({ summary }: RepoSummaryProps) {
  return (
    <section className="section-block" aria-labelledby="repo-summary-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Repository</p>
          <h2 id="repo-summary-title">{summary.name}</h2>
        </div>
        <a href={summary.repoUrl} target="_blank" rel="noreferrer" className="source-link">Open repository</a>
      </div>
      <div className="summary-metrics">
        <div><Braces size={18} /><span>Stack</span><strong>{summary.stack.join(" · ") || "Node.js"}</strong></div>
        <div><GitBranch size={18} /><span>Handlers</span><strong>{summary.controllers.length + summary.routes.length}</strong></div>
        <div><TestTube2 size={18} /><span>{summary.toolchain.kind} tests</span><strong>{summary.toolchain.testFramework ?? "Not detected"}</strong></div>
        <div><FileCode2 size={18} /><span>Test files</span><strong>{summary.tests.length}</strong></div>
      </div>
      <div className="summary-grid">
        <div><h3>Entry files</h3><FileList items={summary.mainFiles} empty="No entry files detected." /></div>
        <div><h3>Controllers</h3><FileList items={summary.controllers} empty="No controllers detected." /></div>
        <div><h3>Routes</h3><FileList items={summary.routes} empty="No routes detected." /></div>
        <div><h3>Tests</h3><FileList items={summary.tests} empty="No existing tests detected." /></div>
      </div>
    </section>
  );
}
