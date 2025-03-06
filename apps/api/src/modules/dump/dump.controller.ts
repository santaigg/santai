import { Elysia, t } from "elysia";
import { DumpService } from "./dump.service.ts";

// Dump controller with routes
export const dumpController = new Elysia()
  .get(
    "/status",
    async () => {
      const dumpService = DumpService.getInstance();
      return await dumpService.getDumpStatus();
    },
    {
      detail: {
        summary: "Get dump status",
        tags: ["Dump"]
      }
    }
  )
  .get(
    "/player/:playerId",
    async ({ params }) => {
      const dumpService = DumpService.getInstance();
      return await dumpService.dumpPlayer(params.playerId);
    },
    {
      params: t.Object({
        playerId: t.String()
      }),
      detail: {
        summary: "Dump Player Matches",
        description: "",
        tags: ["Dump"]
      }
    }
  ); 