import { access } from "node:fs/promises";
import path from "node:path";

import type { TestResults } from "../types.js";
import { runProcess } from "./process.js";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

export async function installDependencies(repoPath: string): Promise<string> {
  const result = await runProcess(npmCommand, ["install", "--ignore-scripts", "--no-audit", "--no-fund"], repoPath, 180_000);
  return result.output;
}

export async function runNpmTests(repoPath: string, testCommand: string | null): Promise<TestResults> {
  if (!testCommand) {
    return { attempted: false, passed: null, command: null, exitCode: null, output: "No npm test script was found." };
  }

  try {
    await access(path.join(repoPath, "package.json"));
  } catch {
    return { attempted: false, passed: null, command: null, exitCode: null, output: "package.json was not found." };
  }

  const result = await runProcess(npmCommand, ["test"], repoPath, 120_000);
  return {
    attempted: true,
    passed: result.exitCode === 0,
    command: "npm test",
    exitCode: result.exitCode,
    output: result.output
  };
}
