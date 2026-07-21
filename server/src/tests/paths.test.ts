import { describe, expect, it } from "vitest";

import { AppError } from "../errors.js";
import { assertValidRepoId, createRepoId, getRepoPath } from "../workspace/paths.js";

describe("workspace paths", () => {
  it("creates a safe repository identifier", () => {
    const repoId = createRepoId();
    expect(repoId).toMatch(/^repo-[a-z0-9]{16}$/);
    expect(getRepoPath(repoId)).toContain(repoId);
  });

  it("rejects traversal attempts", () => {
    expect(() => assertValidRepoId("../outside")).toThrow(AppError);
  });
});
