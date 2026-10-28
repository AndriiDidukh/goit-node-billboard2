import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type Source = "body" | "params" | "query";

function validate(source: Source, schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: { [source]: result.error.issues.map((issue) => issue.message) },
      });
    }

    if (source === "body") req.body = result.data;
    else Object.assign(req[source], result.data);
    next();
  };
}

export const validateBody = (schema: ZodType) => validate("body", schema);
export const validateParams = (schema: ZodType) => validate("params", schema);
export const validateQuery = (schema: ZodType) => validate("query", schema);
