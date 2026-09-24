import { Request, Response, NextFunction } from "express";
import { AppError } from "../common/utils/app-error.js";
import { verifyAccessToken } from "../common/utils/token.js";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return next(new AppError(401, "Authorization header is missing"));
    }

    const token = authorization.split(" ")[1];
    if (!token || !authorization.startsWith("Bearer ")) {
      return next(new AppError(401, "Invalid authorization header"));
    }

    const payload = verifyAccessToken(token);
    req.user = payload;

    next();
  } catch (error) {
    next(error);
  }
}
