import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";

import { AppError } from "./errors.js";
import { apiRouter } from "./routes/apiRoutes.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:5173" }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ ok: true, service: "buildsops-copilot-server", version: "0.1.0" });
  });

  app.use("/api", apiRouter);

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ error: err.code, message: err.message });
      return;
    }

    console.error(err);
    res.status(500).json({ error: "internal_server_error", message: "Unexpected server error." });
  });

  return app;
}
