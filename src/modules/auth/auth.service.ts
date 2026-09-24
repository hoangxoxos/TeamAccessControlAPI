import { prisma } from "../../common/config/prisma.js";
import { AppError } from "../../common/utils/app-error.js";
import { comparePassword, hashPassword } from "../../common/utils/hash.js";
import {
  generateRandomToken,
  hashToken,
  signAccessToken,
} from "../../common/utils/token.js";
import { userRepository } from "../user/user.repository.js";
import { authRepository } from "./auth.repository.js";
import { LoginInput, RegisterInput } from "./auth.schema.js";
import crypto from "crypto";

class AuthService {
  async register(data: RegisterInput) {
    const normalizedEmail = data.email.toLowerCase().trim();

    const existingUser = await userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new AppError(409, "User with email already exists");
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await userRepository.create(
        {
          email: normalizedEmail,
          name: data.name,
          passwordHash,
        },
        tx,
      );

      return newUser;
    });

    return user;
  }

  async login(
    data: LoginInput,
    metadata?: { userAgent?: string; ipAddress?: string },
  ) {
    const normalizedEmail = data.email.toLowerCase().trim();

    const user = await userRepository.findByEmail(normalizedEmail);
    if (!user) {
      await comparePassword(data.password, "125897129581y2ng5125khnewkj");
      throw new AppError(403, "Invalid email or password");
    }

    const isValidPassword = await comparePassword(
      data.password,
      user.passwordHash,
    );

    if (!isValidPassword) {
      throw new AppError(403, "Invalid email or password");
    }

    if (!user.isActive) {
      throw new AppError(403, "Account is disabled");
    }

    const accessToken = signAccessToken({ sub: user.id, email: user.email });

    const familyId = crypto.randomUUID();

    const rawRefreshToken = generateRandomToken();
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await authRepository.createSession({
      userId: user.id,
      refreshTokenHash: tokenHash,
      familyId,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
      },
    };
  }

  async refresh(
    token: string,
    metadata?: { userAgent?: string; ipAddress?: string },
  ) {
    const tokenHash = hashToken(token);
    const session = await authRepository.findSessionByTokenHash(tokenHash);

    if (!session) {
      throw new AppError(401, "Invalid or expired refresh token");
    }

    if (session.expiresAt <= new Date()) {
      throw new AppError(401, "Refresh token has expired");
    }

    if (session.isRevoked) {
      await authRepository.revokeAllSessionByFamilyId(session.familyId);
      throw new AppError(
        401,
        "Refresh token reuse detected. Please login again",
      );
    }

    const user = await userRepository.findById(session.userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }

    const newRefreshToken = generateRandomToken();
    const newRefreshTokenHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const newAccessToken = signAccessToken({
      sub: user.id,
      email: user.email,
    });

    // rotation
    const result = await prisma.$transaction(async (tx) => {
      const revoked = await authRepository.revokeSessionById(session.id, tx);

      if (revoked.count !== 1) {
        throw new AppError(401, "Refresh token has already been used");
      }

      const newSession = await authRepository.createSession(
        {
          userId: user.id,
          refreshTokenHash: newRefreshTokenHash,
          familyId: session.familyId,
          userAgent: metadata?.userAgent,
          ipAddress: metadata?.ipAddress,
          expiresAt,
        },
        tx,
      );

      // link old session to new session
      await authRepository.replaceSession(session.id, newSession.id, tx);

      return newSession;
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      sessionId: result.id,
    };
  }
}

export const authService = new AuthService();
