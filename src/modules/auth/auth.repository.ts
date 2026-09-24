import { TransactionClient } from "../../../generated/prisma/internal/prismaNamespace.js";
import { DbClient, prisma } from "../../common/config/prisma.js";

class AuthRepository {
  private getClient(tx?: TransactionClient): DbClient {
    return tx ?? prisma;
  }

  async createSession(
    data: {
      userId: string;
      refreshTokenHash: string;
      replacedBy?: string;
      userAgent?: string;
      ipAddress?: string;
      expiresAt: Date;
    },
    tx?: TransactionClient,
  ) {
    const client = this.getClient(tx);

    await client.session.create({ data });
  }
}

export const authRepository = new AuthRepository();
