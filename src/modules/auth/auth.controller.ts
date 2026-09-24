import { NextFunction, Response, Request } from "express";
import { registerSchema } from "./auth.schema.js";
import { authService } from "./auth.service.js";
import { env } from "../../common/config/env.js";

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

      console.log("hi");

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
}

export const authController = new AuthController();
