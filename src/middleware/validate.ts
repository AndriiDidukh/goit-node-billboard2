import type { NextFunction, Request, Response } from "express";
import { unlink } from "node:fs/promises";
import type { ZodType } from "zod";

type Source = "body" | "params" | "query";
type ValidationOptions = { requireBodyOrFile?: boolean };

function validate(source: Source, schema: ZodType, options: ValidationOptions = {}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    const requiresBodyOrFile = options.requireBodyOrFile
      && source === "body"
      && Object.keys(req.body).length === 0
      && !req.file;

    if (!result.success || requiresBodyOrFile) {
      if (req.file) await unlink(req.file.path).catch(() => undefined);
      return res.status(400).json({
        error: "Validation failed",
        details: {
          [source]: result.success
            ? ["At least one field or image must be provided"]
            : result.error.issues.map((issue) => issue.message),
        },
      });
    }

    if (source === "body") req.body = result.data;
    else Object.assign(req[source], result.data);
    next();
  };
}

export const validateBody = (schema: ZodType, options?: ValidationOptions) => validate("body", schema, options);
export const validateParams = (schema: ZodType) => validate("params", schema);
export const validateQuery = (schema: ZodType) => validate("query", schema);
