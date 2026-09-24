import jwt, { SignOptions } from "jsonwebtoken";
import { AccessTokenPayload } from "../types/payload.js";
import { env } from "../config/env.js";
import crypto from "crypto";
import bcrypto from "bcrypt";

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function generateRandomToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("utf-8");
}
