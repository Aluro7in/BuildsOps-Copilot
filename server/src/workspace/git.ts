import { mkdir, stat } from "node:fs/promises";
import path from "node:path";

import { AppError } from "../errors.js";
import { runProcess } from "./process.js";
import { getRepoPath, getWorkspaceRoot } from "./paths.js";

export function validateGitHubRepoUrl(repoUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(repoUrl);
  } catch {
    throw new AppError(400, "invalid_repo_url", "A valid public GitHub repository URL is required.");
  }

  const pathParts = parsed.pathname.replace(/\.git$/, "").split("/").filter(Boolean);
  if (parsed.protocol !== "https:" || parsed.hostname !== "github.com" || pathParts.length !== 2) {
    throw new AppError(400, "invalid_repo_url", "Only HTTPS URLs for public github.com owner/repository projects are supported.");
  }
  return parsed;
}

export async function cloneRepo(repoUrl: string, repoId: string): Promise<string> {
  validateGitHubRepoUrl(repoUrl);
  const repoPath = getRepoPath(repoId);
  await mkdir(getWorkspaceRoot(), { recursive: true });

  try {
    await stat(repoPath);
    throw new AppError(409, "workspace_exists", "A workspace already exists for this repository identifier.");
  } catch (error: unknown) {
    if (error instanceof AppError) throw error;
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const result = await runProcess("git", ["clone", "--depth", "1", repoUrl, path.basename(repoPath)], getWorkspaceRoot());
  if (result.exitCode !== 0) {
    throw new AppError(422, "clone_failed", `Repository clone failed: ${result.output}`);
  }
  return repoPath;
}
