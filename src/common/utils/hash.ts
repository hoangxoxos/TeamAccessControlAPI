import bcrypto from "bcrypt";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypto.hash(plain, 12);
}

export async function comparePassword(
  plain: string,
  hashed: string,
): Promise<boolean> {
  return bcrypto.compare(plain, hashed);
}
