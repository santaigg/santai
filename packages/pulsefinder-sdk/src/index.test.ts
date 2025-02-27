import { describe, test, expect, mock } from "bun:test";
import { PulseFinder } from "./index";
import { Auth } from "./auth";

// Mock axios to avoid actual API calls
mock.module("axios", () => {
  return {
    default: {
      create: () => ({
        get: async () => ({ data: { success: true } }),
        post: async () => ({ data: { success: true, data: {} } }),
        request: async () => ({ data: {} }),
        interceptors: {
          response: {
            use: () => {},
          },
        },
      }),
    },
  };
});

describe("PulseFinder SDK", () => {
  test("should initialize without API key in development", () => {
    // Save original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV;
    
    // Set to development
    process.env.NODE_ENV = "development";
    
    // Should not throw error when no API key is provided
    expect(() => new PulseFinder()).not.toThrow();
    
    // Restore NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  test("should initialize with API key", () => {
    const sdk = new PulseFinder({ apiKey: "test-api-key" });
    expect(sdk).toBeInstanceOf(PulseFinder);
  });

  test("should have player and match services", () => {
    const sdk = new PulseFinder({ apiKey: "test-api-key" });
    expect(sdk.player).toBeDefined();
    expect(sdk.match).toBeDefined();
  });

  test("validateAuth should return a boolean", async () => {
    const sdk = new PulseFinder({ apiKey: "test-api-key" });
    const result = await sdk.validateAuth();
    expect(typeof result).toBe("boolean");
  });
}); 