import { Elysia } from "elysia";

const app = new Elysia().get("/", () => "Smokeshift!").listen(3002);

console.log(
  `🦊 Smokeshift is running at ${app.server?.hostname}:${app.server?.port}`
);
