import { describe, expect, it } from "vitest";

import { AppError } from "../errors.js";
import { validateGitHubRepoUrl } from "../workspace/git.js";

describe("GitHub URL validation", () => {
  it("accepts a standard public GitHub repository URL", () => {
    expect(validateGitHubRepoUrl("https://github.com/expressjs/express").hostname).toBe("github.com");
  });

  it("rejects non-GitHub and nested URLs", () => {
    expect(() => validateGitHubRepoUrl("https://example.com/org/repo")).toThrow(AppError);
    expect(() => validateGitHubRepoUrl("https://github.com/org/repo/tree/main")).toThrow(AppError);
  });
});
