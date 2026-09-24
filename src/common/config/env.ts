import dotenv from "dotenv";
import z from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(["production", "development", "test"])
    .default("development"),
  LOG_LEVEL: z.enum(["info", "test", "error"]).default("info"),
  JWT_ACCESS_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default("30m"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.log("Invalid Environment Variables");
  console.error(parsed.error.flatten());
  process.exit(1);
}

export const env = parsed.data;
