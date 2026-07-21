export type Language = "typescript" | "javascript" | "python" | "java" | "unknown";

export type ToolchainKind = "node" | "python" | "java" | "unknown";

/** Detected build, package, and test tooling for a repository. */
export interface Toolchain {
  kind: ToolchainKind;
  packageManager: "npm" | "pnpm" | "yarn" | "pip" | "poetry" | "maven" | "gradle" | null;
  testFramework: string | null;
  testCommand: string | null;
}

/** Indicates what the current BuildOps implementation can safely execute. */
export interface RepoCapabilities {
  analyzer: "node-ts" | "planned";
  missionRunner: boolean;
  supportedMissions: string[];
}

export interface RepoSummary {
  repoId: string;
  repoUrl: string;
  name: string;
  stack: string[];
  language: Language;
  toolchain: Toolchain;
  capabilities: RepoCapabilities;
  /** @deprecated Use toolchain.packageManager. Retained for existing clients. */
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
  language: Language;
  toolchain: Toolchain;
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

export interface ChangeSummary {
  prDescription: string;
  commitMessages: string[];
  explanation: string;
}

export interface MissionResult extends ChangeSummary {
  repoId: string;
  plan: MissionPlan;
  patches: GeneratedPatch[];
  testResults: TestResults;
}

export interface DiffResult {
  repoId: string;
  diff: string;
  changedFiles: string[];
}
