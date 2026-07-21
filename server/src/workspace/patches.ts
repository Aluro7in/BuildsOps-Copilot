import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { AppError } from "../errors.js";
import type { GeneratedPatch } from "../types.js";
import { runProcess } from "./process.js";

function isSafePatch(patch: GeneratedPatch): boolean {
  return (
    !patch.unifiedDiff.includes("../") &&
    !patch.unifiedDiff.includes("..\\") &&
    !/^(---|\+\+\+) (?:\/|[A-Za-z]:)/m.test(patch.unifiedDiff) &&
    !/^diff --git (?:\/|[A-Za-z]:)/m.test(patch.unifiedDiff)
  );
}

export async function applyPatches(repoPath: string, patches: GeneratedPatch[]): Promise<GeneratedPatch[]> {
  const applied: GeneratedPatch[] = [];
  for (const patch of patches) {
    if (!patch.unifiedDiff.trim()) {
      applied.push({ ...patch, status: "skipped" });
      continue;
    }
    if (!isSafePatch(patch)) {
      throw new AppError(422, "unsafe_patch", `Patch ${patch.id} contains an unsafe file path.`);
    }
    const tempDirectory = await mkdtemp(path.join(tmpdir(), "buildops-patch-"));
    const patchPath = path.join(tempDirectory, "generated.patch");
    try {
      await writeFile(patchPath, patch.unifiedDiff, "utf8");
      const result = await runProcess("git", ["apply", "--whitespace=nowarn", patchPath], repoPath, 30_000);
      applied.push({ ...patch, status: result.exitCode === 0 ? "applied" : "failed" });
    } finally {
      await rm(tempDirectory, { recursive: true, force: true });
    }
  }
  return applied;
}
