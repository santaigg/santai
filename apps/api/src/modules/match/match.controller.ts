import { Elysia, t } from "elysia";
import { MatchService } from "./match.service";
import { Match } from "./match.types";

// Match controller with routes
export const matchController = new Elysia()
  .get(
    "/:id",
    async ({ params }) => {
      const matchService = MatchService.getInstance();
      return await matchService.getMatch(params.id);
    },
    {
      params: t.Object({
        id: t.String()
      }),
      detail: {
        summary: "Get Match from DB",
        description: "Gets back a full match payload using the Match Id from the DB.",
        tags: ["Match"]
      }
    }
  )
  .get(
    "/:id/check",
    async ({ params }) => {
      const matchService = MatchService.getInstance();
      return await matchService.checkMatch(params.id);
    },
    {
      params: t.Object({
        id: t.String()
      }),
      detail: {
        summary: "Check Match",
        description: "Uses a Match Id to check if a match is available to pull from MT servers.",
        tags: ["Match"]
      }
    }
  )
  .get(
    "/:id/add",
    async ({ params }) => {
      const matchService = MatchService.getInstance();
      return await matchService.addMatchById(params.id);
    },
    {
      params: t.Object({
        id: t.String()
      }),
      detail: {
        summary: "Add Match to DB",
        description: "Uses a Match Id to add a match to the DB. You likely should check the match first then use this endpoint to add it.",
        tags: ["Match"]
      }
    }
  ); 