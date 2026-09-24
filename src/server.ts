import app from "./app.js";
import { logger } from "./common/utils/logger.js";
import { env } from "./common/config/env.js";
import { prisma, testDbConnection } from "./common/config/prisma.js";

const PORT = env.PORT || 3000;

const server = app.listen(PORT, () => {
  testDbConnection();
  logger.info(`Server is running on PORT http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});
