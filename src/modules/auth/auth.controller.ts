import { NextFunction, Response, Request } from "express";
import { registerSchema } from "./auth.schema.js";
import { authService } from "./auth.service.js";
import { env } from "../../common/config/env.js";
import { AppError } from "../../common/utils/app-error.js";

class AuthController {
  async registerHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;

      const result = await authService.register(data);

      res.status(201).json({
        success: true,
        message: "User registered. Please login to continue",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async loginHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;

      const result = await authService.login(data);

      const isProd = env.NODE_ENV === "production";
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: "Login successfully.",
        result,
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.refreshToken as string | undefined;
      if (!token) {
        return next(new AppError(401, "Missing refresh token"));
      }

      const result = await authService.refresh(token);

      const isProd = env.NODE_ENV === "production";
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: "Token refreshed",
        result,
      });
    } catch (error) {
      next(error);
    }
  }

  async logoutHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.refreshToken as string | undefined;
      if (!token) {
        return next(new AppError(401, "Missing refresh token"));
      }

      await authService.logout(token);

      const isProd = env.NODE_ENV === "production";
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
      });

      res.status(200).json({
        success: true,
        message: "Logged out",
      });
    } catch (error) {
      next(error);
    }
  }

  async logoutAllHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.refreshToken as string | undefined;
      if (!token) {
        return next(new AppError(401, "Missing refresh token"));
      }

      await authService.logoutAll(token);

      const isProd = env.NODE_ENV === "production";
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
      });

      res.status(200).json({
        success: true,
        message: "Logged in all device",
      });
    } catch (error) {
      next(error);
    }
  }

  async getSessionsHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = req.user;
      if (!authUser) {
        return next(new AppError(401, "Not an authenticated user"));
      }
      const result = await authService.getSessions(authUser.sub);

      res.status(200).json({
        success: true,
        message: "All user sessions",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
