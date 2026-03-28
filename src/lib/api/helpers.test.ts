import { AuthError, apiError, handleApiError } from "./helpers";

describe("AuthError", () => {
  it("has correct name and message", () => {
    const err = new AuthError();
    expect(err.name).toBe("AuthError");
    expect(err.message).toBe("Unauthorized");
    expect(err).toBeInstanceOf(Error);
  });
});

describe("apiError", () => {
  it("returns a JSON response with the given message and status", async () => {
    const response = apiError("Not found", 404);
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toEqual({ error: "Not found" });
  });

  it("returns 400 for validation errors", async () => {
    const response = apiError("Validation error: name is required", 400);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("Validation error");
  });

  it("returns 500 for server errors", async () => {
    const response = apiError("Internal server error", 500);
    expect(response.status).toBe(500);
  });
});

describe("handleApiError", () => {
  it("returns 401 for AuthError", async () => {
    const response = handleApiError(new AuthError());
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns 500 for generic errors in production", async () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
      const response = handleApiError(new Error("db connection failed"));
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body).toEqual({ error: "Internal server error" });
    } finally {
      process.env.NODE_ENV = origEnv;
    }
  });

  it("returns actual error message in development", async () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    try {
      const response = handleApiError(new Error("db connection failed"));
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body).toEqual({ error: "db connection failed" });
    } finally {
      process.env.NODE_ENV = origEnv;
    }
  });

  it("converts non-Error values to string", async () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    try {
      const response = handleApiError("string error");
      const body = await response.json();
      expect(body).toEqual({ error: "string error" });
    } finally {
      process.env.NODE_ENV = origEnv;
    }
  });

  it("passes requestId to logger", () => {
    // Just ensure it doesn't throw when requestId is provided
    const response = handleApiError(new Error("test"), "req-123");
    expect(response.status).toBe(500);
  });
});
