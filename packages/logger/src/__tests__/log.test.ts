import { test, expect, mock } from "bun:test";
import { log } from "..";

// Mock console.log
const originalConsoleLog = console.log;
const mockConsoleLog = mock(() => {});
console.log = mockConsoleLog;

test("@repo/logger - prints a message", () => {
  log("hello");
  
  expect(mockConsoleLog).toHaveBeenCalledWith("LOGGER: ", "hello");
  
  // Restore console.log after test
  console.log = originalConsoleLog;
});
