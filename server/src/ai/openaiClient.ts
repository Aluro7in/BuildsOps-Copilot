import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { z } from "zod";

import { AppError } from "../errors.js";

const DEFAULT_PLANNER_MODEL = "gpt-5.6-terra";
const DEFAULT_CODEX_MODEL = "gpt-5.3-codex";

export function getPlannerModel(): string {
  return process.env.OPENAI_PLANNER_MODEL ?? DEFAULT_PLANNER_MODEL;
}

export function getCodexModel(): string {
  return process.env.OPENAI_CODEX_MODEL ?? DEFAULT_CODEX_MODEL;
}

function createClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AppError(503, "ai_not_configured", "AI integration is not configured. Set OPENAI_API_KEY to run a mission.");
  }
  return new OpenAI({ apiKey, timeout: 120_000, maxRetries: 1 });
}

export async function requestStructuredOutput<Schema extends z.ZodTypeAny>(args: {
  operation: string;
  model: string;
  schemaName: string;
  schema: Schema;
  instructions: string;
  input: string;
}): Promise<z.output<Schema>> {
  try {
    const response = await createClient().responses.parse({
      model: args.model,
      instructions: args.instructions,
      input: args.input,
      text: { format: zodTextFormat(args.schema, args.schemaName) }
    });
    const parsed = args.schema.safeParse(response.output_parsed);
    if (!parsed.success) {
      throw new AppError(502, "ai_invalid_response", `${args.operation} returned an invalid structured response.`);
    }
    return parsed.data;
  } catch (error: unknown) {
    if (error instanceof AppError) throw error;
    throw new AppError(502, "ai_request_failed", `${args.operation} could not be completed by the configured AI model.`);
  }
}
