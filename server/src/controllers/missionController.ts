import { type NextFunction, type Request, type Response } from "express";
import { z } from "zod";

import { AppError } from "../errors.js";
import { runMissionForRepo } from "../services/missionService.js";

const missionSchema = z.object({
  repoId: z.string().trim().min(1),
  mission: z.string().trim().min(5).max(2_000)
});

export async function runMission(req: Request, res: Response, _next: NextFunction) {
  const parsed = missionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, "invalid_request", "repoId and a mission of at least five characters are required.");
  }

  const result = await runMissionForRepo(parsed.data.repoId, parsed.data.mission);
  res.json(result);
}
