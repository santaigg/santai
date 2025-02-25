import { Elysia } from "elysia";

const app = new Elysia().get("/", () => "Wavescan out!").listen(3003);

console.log(
  `🦊 Wavescan is running at ${app.server?.hostname}:${app.server?.port}`
);
