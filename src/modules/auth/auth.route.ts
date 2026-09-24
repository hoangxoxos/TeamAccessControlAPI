import { Router } from "express";
import { validate } from "../../middlewares/validateRequest.js";
import { loginSchema, registerSchema } from "./auth.schema.js";
import { authController } from "./auth.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const authRoute = Router();

authRoute.post(
  "/register",
  validate(registerSchema),
  authController.registerHandler,
);

authRoute.post("/login", validate(loginSchema), authController.loginHandler);
authRoute.post("/refresh", authenticate, authController.refreshHandler);

export default authRoute;
