import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { rootRouter } from "./routes";
import { v1Router } from "./routes/v1";

describe("API Root Endpoints", () => {
  const app = new Elysia().use(rootRouter);

  it("should return API documentation", async () => {
    const response = await app.handle(
      new Request("http://localhost/api")
    ).then(res => res.json());
    
    expect(response).toHaveProperty("message");
    expect(response.message).toBe("API Documentation");
    expect(response).toHaveProperty("versions");
    expect(response.versions).toContain("v1");
  });

  it("should return health status", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/health")
    ).then(res => res.json());
    
    expect(response).toHaveProperty("status");
    expect(response.status).toBe("healthy");
    expect(response).toHaveProperty("timestamp");
  });
});

describe("API v1 Endpoints", () => {
  const app = new Elysia().use(rootRouter);

  it("should return v1 version info", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/v1")
    ).then(res => res.json());
    
    expect(response).toHaveProperty("version");
    expect(response.version).toBe("v1");
    expect(response).toHaveProperty("resources");
    expect(response).toHaveProperty("deprecated");
    expect(response.deprecated).toBe(false);
  });
});
