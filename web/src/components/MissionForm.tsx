import { ArrowRight, LoaderCircle } from "lucide-react";
import { type FormEvent, useState } from "react";

interface MissionFormProps {
  busy: boolean;
  onSubmit: (repoUrl: string, mission: string) => Promise<void>;
}

const missionOptions = [
  "Generate tests for controllers/routes.",
  "Add structured logging middleware to all routes."
];

export function MissionForm({ busy, onSubmit }: MissionFormProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [mission, setMission] = useState(missionOptions[0]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(repoUrl.trim(), mission.trim());
  }

  return (
    <form className="mission-form" onSubmit={handleSubmit}>
      <label>
        <span>Public GitHub repository</span>
        <input
          type="url"
          value={repoUrl}
          onChange={(event) => setRepoUrl(event.target.value)}
          placeholder="https://github.com/owner/repository"
          required
          disabled={busy}
        />
      </label>
      <label>
        <span>Maintenance mission</span>
        <textarea
          value={mission}
          onChange={(event) => setMission(event.target.value)}
          rows={4}
          required
          minLength={5}
          disabled={busy}
        />
      </label>
      <div className="mission-suggestions" aria-label="Mission suggestions">
        {missionOptions.map((option) => (
          <button key={option} type="button" className="suggestion" onClick={() => setMission(option)} disabled={busy}>
            {option}
          </button>
        ))}
      </div>
      <button className="primary-action" type="submit" disabled={busy}>
        {busy ? <LoaderCircle className="spin" size={18} aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}
        {busy ? "Running BuildsOps Copilot" : "Analyze and run mission"}
      </button>
    </form>
  );
}
