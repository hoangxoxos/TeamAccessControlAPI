//   id           String   @id @default(uuid())
//   email        String   @unique
//   passwordHash String
//   name         String
//   isActive     Boolean  @default(true)
//   createdAt    DateTime @default(now())
//   updatedAt    DateTime @updatedAt

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
