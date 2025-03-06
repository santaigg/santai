import { Elysia, t } from "elysia";
import { SearchService } from "./search.service.ts";

// Search controller with routes
export const searchController = new Elysia()
  .get(
    "/player/:playerName",
    async ({ params }) => {
      const searchService = SearchService.getInstance();
      return await searchService.searchPlayer(params.playerName);
    },
    {
      params: t.Object({
        playerName: t.String()
      }),
      detail: {
        summary: "Search for a player by display name from DB",
        description: "This uses the player's display name to search for a player in the DB.",
        tags: ["Search"]
      }
    }
  ); 