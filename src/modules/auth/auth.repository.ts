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
      familyId: string;
      userAgent?: string;
      ipAddress?: string;
      expiresAt: Date;
    },
    tx?: TransactionClient,
  ) {
    const client = this.getClient(tx);

    return await client.session.create({ data });
  }

  async findSessionByTokenHash(token: string, tx?: TransactionClient) {
    const client = this.getClient(tx);

    return client.session.findUnique({ where: { refreshTokenHash: token } });
  }

  async findSessionById(id: string, tx?: TransactionClient) {
    const client = this.getClient(tx);

    return client.session.findUnique({ where: { id } });
  }

  async revokeSessionById(id: string, tx?: TransactionClient) {
    const client = this.getClient(tx);

    return client.session.updateMany({
      where: { id, isRevoked: false, expiresAt: { gt: new Date() } },
      data: { isRevoked: true },
    });
  }

  async revokeAllSessionByFamilyId(familyId: string, tx?: TransactionClient) {
    const client = this.getClient(tx);

    return client.session.updateMany({
      where: { familyId, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  async replaceSession(
    oldSessionId: string,
    newSessionId: string,
    tx?: TransactionClient,
  ) {
    const client = this.getClient(tx);

    return client.session.update({
      where: { id: oldSessionId },
      data: {
        replacedBy: newSessionId,
      },
    });
  }
}

export const authRepository = new AuthRepository();
