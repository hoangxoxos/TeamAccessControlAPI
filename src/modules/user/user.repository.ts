import { User } from "../../../generated/prisma/client.js";
import { TransactionClient } from "../../../generated/prisma/internal/prismaNamespace.js";
import { DbClient, prisma } from "../../common/config/prisma.js";

export interface IUserRepository {
  findById(id: string, tx?: TransactionClient): Promise<User | null>;
  findByEmail(email: string, tx?: TransactionClient): Promise<User | null>;
  create(
    data: { email: string; name: string; passwordHash: string },
    tx?: TransactionClient,
  ): Promise<User>;
}

export class UserRepository implements IUserRepository {
  private getClient(tx?: TransactionClient): DbClient {
    return tx ?? prisma;
  }

  findById(id: string, tx?: TransactionClient): Promise<User | null> {
    const client = this.getClient(tx);

    return client.user.findUnique({ where: { id } });
  }

  findByEmail(email: string, tx?: TransactionClient): Promise<User | null> {
    const client = this.getClient(tx);

    return client.user.findUnique({ where: { email } });
  }

  create(
    data: { email: string; name: string; passwordHash: string },
    tx?: TransactionClient,
  ): Promise<User> {
    const client = this.getClient(tx);

    return client.user.create({
      data,
    });
  }
}

export const userRepository = new UserRepository();
