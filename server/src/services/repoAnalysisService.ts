import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

import { AppError } from "../errors.js";
import type { Language, RepoCapabilities, RepoSummary, Toolchain } from "../types.js";
import { cloneRepo } from "../workspace/git.js";
import { createRepoId, getMetadataPath, getRepoPath } from "../workspace/paths.js";

interface PackageJson {
  name?: string;
  main?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

const ignoredDirectories = new Set([".git", "node_modules", "dist", "build", "coverage"]);

async function findFiles(root: string, relative = "", found: string[] = []): Promise<string[]> {
  if (found.length >= 500) return found;
  const directory = path.join(root, relative);
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) continue;
    const itemRelative = path.join(relative, entry.name);
    if (entry.isDirectory()) await findFiles(root, itemRelative, found);
    else if (/\.(?:[cm]?[jt]sx?)$/i.test(entry.name)) found.push(itemRelative.replaceAll("\\", "/"));
  }
  return found;
}

function detectStack(pkg: PackageJson): string[] {
  const modules = { ...pkg.dependencies, ...pkg.devDependencies };
  const stack = ["Node.js"];
  if (modules.typescript) stack.push("TypeScript");
  if (modules.express) stack.push("Express");
  if (modules.fastify) stack.push("Fastify");
  return stack;
}

function detectTestFramework(pkg: PackageJson): string | null {
  const modules = { ...pkg.dependencies, ...pkg.devDependencies };
  return ["vitest", "jest", "mocha", "ava", "tap"].find((name) => modules[name] !== undefined) ?? null;
}

function analyzeNodeTypeScriptRepo(repoId: string, repoUrl: string, pkg: PackageJson, files: string[]): RepoSummary {
  const language: Language = ({ ...pkg.dependencies, ...pkg.devDependencies }.typescript ? "typescript" : "javascript");
  const testFramework = detectTestFramework(pkg);
  const toolchain: Toolchain = {
    kind: "node",
    packageManager: "npm",
    testFramework,
    testCommand: pkg.scripts?.test ?? null
  };
  const capabilities: RepoCapabilities = {
    analyzer: "node-ts",
    missionRunner: true,
    supportedMissions: ["Generate tests for controllers/routes.", "Add structured logging middleware to all routes."]
  };
  const controllerPattern = /(?:^|\/)(?:controllers?|handlers?)(?:\/|$)|(?:controller|handler)\.(?:[cm]?[jt]sx?)$/i;
  const routePattern = /(?:^|\/)(?:routes?|routers?)(?:\/|$)|(?:route|router)\.(?:[cm]?[jt]sx?)$/i;
  const testPattern = /(?:^|\/)(__tests__|tests?)(?:\/|$)|\.(?:test|spec)\.(?:[cm]?[jt]sx?)$/i;
  const entryCandidates = [pkg.main, "src/index.ts", "src/index.js", "src/server.ts", "src/server.js", "server/index.ts", "server/index.js"].filter(
    (file): file is string => typeof file === "string" && files.includes(file)
  );

  return {
    repoId,
    repoUrl,
    name: pkg.name ?? repoId,
    stack: detectStack(pkg),
    language,
    toolchain,
    capabilities,
    packageManager: "npm",
    mainFiles: [...new Set(entryCandidates)],
    controllers: files.filter((file) => controllerPattern.test(file)),
    routes: files.filter((file) => routePattern.test(file)),
    tests: files.filter((file) => testPattern.test(file)),
    testFramework,
    testCommand: toolchain.testCommand
  };
}

// Reserved extension point: add analyzePythonRepo and analyzeJavaRepo here when their
// controlled installers, test runners, and mission generators are implemented.

export async function inspectRepo(repoId: string, repoUrl?: string): Promise<RepoSummary> {
  const repoPath = getRepoPath(repoId);
  let pkg: PackageJson;
  try {
    pkg = JSON.parse(await readFile(path.join(repoPath, "package.json"), "utf8")) as PackageJson;
  } catch {
    throw new AppError(422, "missing_package_json", "The cloned repository does not contain a readable package.json.");
  }

  const files = await findFiles(repoPath);
  return analyzeNodeTypeScriptRepo(repoId, repoUrl ?? "", pkg, files);
}

export async function analyzeAndCloneRepo(repoUrl: string): Promise<RepoSummary> {
  const repoId = createRepoId();
  await cloneRepo(repoUrl, repoId);
  const summary = await inspectRepo(repoId, repoUrl);
  const metadataPath = getMetadataPath(repoId);
  await mkdir(path.dirname(metadataPath), { recursive: true });
  await writeFile(metadataPath, JSON.stringify(summary, null, 2), "utf8");
  return summary;
}
