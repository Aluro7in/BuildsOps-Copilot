import { Router, type NextFunction, type Request, type Response } from "express";

import { analyzeRepo } from "../controllers/repoController.js";
import { getDiff } from "../controllers/diffController.js";
import { runMission } from "../controllers/missionController.js";

export const apiRouter = Router();

type AsyncController = (req: Request, res: Response, next: NextFunction) => Promise<void>;

function asyncRoute(controller: AsyncController) {
  return (req: Request, res: Response, next: NextFunction) => {
    void controller(req, res, next).catch(next);
  };
}

apiRouter.post("/analyze-repo", asyncRoute(analyzeRepo));
apiRouter.post("/run-mission", asyncRoute(runMission));
apiRouter.get("/diff/:repoId", asyncRoute(getDiff));
