import { NextFunction, Request, Response } from "express";
import { AppError } from "../common/utils/app-error.js";
import { logger } from "../common/utils/logger.js";
import { ZodError } from "zod";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Invalid request data",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  logger.error({ err }, "Unhandled request error");

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
}
