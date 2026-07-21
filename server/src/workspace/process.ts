import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface ProcessResult {
  command: string;
  args: string[];
  exitCode: number;
  output: string;
}

export async function runProcess(
  command: string,
  args: string[],
  cwd: string,
  timeout = 120_000
): Promise<ProcessResult> {
  try {
    const { stdout, stderr } = await execFileAsync(command, args, {
      cwd,
      timeout,
      windowsHide: true,
      maxBuffer: 2 * 1024 * 1024
    });
    return { command, args, exitCode: 0, output: `${stdout}${stderr}`.trim() };
  } catch (error: unknown) {
    const failed = error as { code?: number | string; stdout?: string; stderr?: string; message?: string };
    return {
      command,
      args,
      exitCode: typeof failed.code === "number" ? failed.code : 1,
      output: `${failed.stdout ?? ""}${failed.stderr ?? ""}`.trim() || failed.message || "Command failed."
    };
  }
}
