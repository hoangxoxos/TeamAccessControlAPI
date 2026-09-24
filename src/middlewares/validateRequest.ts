import { Request, Response, NextFunction } from "express";
import { z } from "zod";

type ValidatedRequest = {
  body: Request["body"];
  query: Request["query"];
  params: Request["params"];
};

export const validate =
  (schema: z.ZodType) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as ValidatedRequest;

      req.body = parsed.body;
      req.params = parsed.params;
      Object.defineProperty(req, "query", {
        value: parsed.query,
        configurable: true,
        enumerable: true,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
