import logger from "./logger";

describe("logger", () => {
  it("is a pino logger instance", () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.debug).toBe("function");
  });

  it("has a valid log level", () => {
    expect(["trace", "debug", "info", "warn", "error", "fatal"]).toContain(
      logger.level
    );
  });
});
