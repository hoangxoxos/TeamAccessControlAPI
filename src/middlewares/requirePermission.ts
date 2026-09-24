import { NextFunction, Request, Response } from "express";
import { AppError } from "../common/utils/app-error.js";

export function requirePermission(
  key: string[],
  bypassRoles: string[] = ["admin"],
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authUser = req.user;
    if (!authUser) {
      return next(new AppError(401, "You are not authenticated user"));
    }
  };
}
