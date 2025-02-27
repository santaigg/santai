import { dbClient } from "../index";
import { test, expect, mock } from "bun:test";

// Mock the db module
mock.module("../../src", () => ({
  db: {
    from: () => ({
      select: () => Promise.resolve({
        data: [{ id: 1, message: "Test log" }],
        error: null
      })
    })
  }
}));

test("Database connection", async () => {
  const { data, error } = await dbClient.from("debug_logs").select("*");
  
  expect(error).toBeNull();
  expect(data).toBeDefined();
  expect(Array.isArray(data)).toBe(true);
});
