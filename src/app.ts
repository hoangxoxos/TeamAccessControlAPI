import express from "express";
import { logger } from "./common/utils/logger.js";
import cookieParser from "cookie-parser";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import router from "./routes.js";

const app = express();

app.use((req, res, next) => {
  const startedAt = performance.now();

  res.on("finish", () => {
    logger.info(
      `${req.method} ${req.originalUrl} - ${(performance.now() - startedAt).toFixed(0)}ms`,
    );
  });

  next();
});

app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/v1", router);

app.use(notFound);
app.use(errorHandler);

export default app;
