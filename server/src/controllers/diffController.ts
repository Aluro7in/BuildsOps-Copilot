import { type NextFunction, type Request, type Response } from "express";

import { AppError } from "../errors.js";
import { getRepoDiff } from "../services/diffService.js";

export async function getDiff(req: Request, res: Response, _next: NextFunction) {
  const repoId = Array.isArray(req.params.repoId) ? req.params.repoId[0] : req.params.repoId;
  if (!repoId) {
    throw new AppError(400, "invalid_request", "repoId is required.");
  }

  res.json(await getRepoDiff(repoId));
}
