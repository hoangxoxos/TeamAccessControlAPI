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

  async login(data: LoginInput) {
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

    const accessToken = signAccessToken({ sub: user.id, email: user.email });

    const rawRefreshToken = generateRandomToken();
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await authRepository.createSession({
      userId: user.id,
      refreshTokenHash: tokenHash,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.email,
        isActive: user.isActive,
      },
    };
  }

  async refresh(token: string) {}
}

export const authService = new AuthService();
