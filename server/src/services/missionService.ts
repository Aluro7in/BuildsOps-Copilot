import { readFile } from "node:fs/promises";

import { generatePatchesFromPlan, introspectRepoForMission } from "../ai/codex.js";
import { planMission } from "../ai/planner.js";
import { summarizeChanges } from "../ai/summaries.js";
import { AppError } from "../errors.js";
import type { MissionResult, RepoSummary, TestResults } from "../types.js";
import { inspectRepo } from "./repoAnalysisService.js";
import { applyPatches } from "../workspace/patches.js";
import { getMetadataPath, getRepoPath } from "../workspace/paths.js";
import { installDependencies, runNpmTests } from "../workspace/runner.js";

async function loadSummary(repoId: string): Promise<RepoSummary> {
  try {
    return JSON.parse(await readFile(getMetadataPath(repoId), "utf8")) as RepoSummary;
  } catch {
    return inspectRepo(repoId);
  }
}

export async function runMissionForRepo(repoId: string, mission: string): Promise<MissionResult> {
  const summary = await loadSummary(repoId);
  const plan = await planMission(summary, mission);
  if (!plan.supported) {
    const testResults: TestResults = { attempted: false, passed: null, command: null, exitCode: null, output: "Mission was not run." };
    return { repoId, plan, patches: [], testResults, ...(await summarizeChanges(plan, [], testResults)) };
  }

  await introspectRepoForMission(summary, plan);
  const generatedPatches = await generatePatchesFromPlan(summary, plan);
  const patches = await applyPatches(getRepoPath(repoId), generatedPatches);
  const installOutput = await installDependencies(getRepoPath(repoId));
  const testResults = await runNpmTests(getRepoPath(repoId), summary.testCommand);
  if (installOutput) testResults.output = `Dependency installation:\n${installOutput}\n\nTest run:\n${testResults.output}`;
  return { repoId, plan, patches, testResults, ...(await summarizeChanges(plan, patches, testResults)) };
}
