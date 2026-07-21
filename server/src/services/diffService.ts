import type { DiffResult } from "../types.js";
import { readGitDiff } from "../workspace/diff.js";

export function getRepoDiff(repoId: string): Promise<DiffResult> {
  return readGitDiff(repoId);
}
