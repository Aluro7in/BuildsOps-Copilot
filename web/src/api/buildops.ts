export interface RepoSummary {
  repoId: string;
  repoUrl: string;
  name: string;
  stack: string[];
  language: "typescript" | "javascript" | "python" | "java" | "unknown";
  toolchain: {
    kind: "node" | "python" | "java" | "unknown";
    packageManager: "npm" | "pnpm" | "yarn" | "pip" | "poetry" | "maven" | "gradle" | null;
    testFramework: string | null;
    testCommand: string | null;
  };
  capabilities: {
    analyzer: "node-ts" | "planned";
    missionRunner: boolean;
    supportedMissions: string[];
  };
  packageManager: "npm";
  mainFiles: string[];
  controllers: string[];
  routes: string[];
  tests: string[];
  testFramework: string | null;
  testCommand: string | null;
}

export interface MissionStep {
  id: string;
  title: string;
  description: string;
  targetFiles: string[];
  actionType: string;
  rationale: string;
}

export interface MissionPlan {
  mission: string;
  language: RepoSummary["language"];
  toolchain: RepoSummary["toolchain"];
  supported: boolean;
  overallGoal: string;
  constraints: string[];
  steps: MissionStep[];
  notes: string[];
}

export interface GeneratedPatch {
  id: string;
  description: string;
  unifiedDiff: string;
  files: string[];
  status: "pending" | "applied" | "skipped" | "failed";
}

export interface TestResults {
  attempted: boolean;
  passed: boolean | null;
  command: string | null;
  exitCode: number | null;
  output: string;
}

export interface MissionResult {
  repoId: string;
  plan: MissionPlan;
  patches: GeneratedPatch[];
  testResults: TestResults;
  prDescription: string;
  commitMessages: string[];
  explanation: string;
}

export interface DiffResult {
  repoId: string;
  diff: string;
  changedFiles: string[];
}

interface ApiErrorPayload {
  error?: string;
  message?: string;
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers }
  });
  const payload = (await response.json().catch(() => ({}))) as T & ApiErrorPayload;
  if (!response.ok) {
    throw new ApiError(payload.message ?? "The BuildOps API request failed.", response.status);
  }
  return payload;
}

export function analyzeRepo(repoUrl: string): Promise<RepoSummary> {
  return request<RepoSummary>("/api/analyze-repo", {
    method: "POST",
    body: JSON.stringify({ repoUrl })
  });
}

export function runMission(repoId: string, mission: string): Promise<MissionResult> {
  return request<MissionResult>("/api/run-mission", {
    method: "POST",
    body: JSON.stringify({ repoId, mission })
  });
}

export function getDiff(repoId: string): Promise<DiffResult> {
  return request<DiffResult>(`/api/diff/${encodeURIComponent(repoId)}`);
}
