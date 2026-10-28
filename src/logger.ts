import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  transport: process.env.NODE_ENV === "test" ? undefined : { target: "pino-pretty" },
});

export default logger;
