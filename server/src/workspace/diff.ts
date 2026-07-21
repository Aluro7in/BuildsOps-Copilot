import { AppError } from "../errors.js";
import type { DiffResult } from "../types.js";
import { runProcess } from "./process.js";
import { getRepoPath } from "./paths.js";

export async function readGitDiff(repoId: string): Promise<DiffResult> {
  const repoPath = getRepoPath(repoId);
  const [diff, status] = await Promise.all([
    runProcess("git", ["diff", "--no-ext-diff", "--binary", "--"], repoPath),
    runProcess("git", ["status", "--short"], repoPath)
  ]);

  if (diff.exitCode !== 0 && diff.exitCode !== 1) {
    throw new AppError(422, "diff_failed", `Could not read repository diff: ${diff.output}`);
  }

  return {
    repoId,
    diff: diff.output,
    changedFiles: status.output
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => line.slice(3).trim())
  };
}
