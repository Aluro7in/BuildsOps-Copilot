import { randomUUID } from "node:crypto";
import path from "node:path";

import { AppError } from "../errors.js";

const repoIdPattern = /^[a-z0-9][a-z0-9-]{7,79}$/;
const workspaceRoot = path.resolve(process.env.WORKSPACE_ROOT ?? path.join(process.cwd(), "workspaces"));

export function createRepoId(): string {
  return `repo-${randomUUID().replaceAll("-", "").slice(0, 16)}`;
}

export function getWorkspaceRoot(): string {
  return workspaceRoot;
}

export function assertValidRepoId(repoId: string): void {
  if (!repoIdPattern.test(repoId)) {
    throw new AppError(400, "invalid_repo_id", "The repository identifier is invalid.");
  }
}

export function getRepoPath(repoId: string): string {
  assertValidRepoId(repoId);
  return assertInsideWorkspace(path.resolve(workspaceRoot, repoId));
}

export function getMetadataPath(repoId: string): string {
  assertValidRepoId(repoId);
  return assertInsideWorkspace(path.resolve(workspaceRoot, ".metadata", `${repoId}.json`));
}

export function assertInsideWorkspace(candidatePath: string): string {
  const relative = path.relative(workspaceRoot, candidatePath);
  if (relative === "" || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new AppError(400, "invalid_workspace_path", "Workspace operation escaped its sandbox.");
  }
  return candidatePath;
}
