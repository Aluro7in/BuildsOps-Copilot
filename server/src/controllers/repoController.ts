import { type NextFunction, type Request, type Response } from "express";
import { z } from "zod";

import { AppError } from "../errors.js";
import { analyzeAndCloneRepo } from "../services/repoAnalysisService.js";

const analyzeRepoSchema = z.object({
  repoUrl: z.string().trim().url()
});

export async function analyzeRepo(req: Request, res: Response, _next: NextFunction) {
  const parsed = analyzeRepoSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, "invalid_request", "repoUrl must be a valid URL.");
  }

  const summary = await analyzeAndCloneRepo(parsed.data.repoUrl);
  res.status(201).json(summary);
}
