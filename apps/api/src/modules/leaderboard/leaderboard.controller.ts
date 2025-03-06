import { Elysia, t } from "elysia";
import { LeaderboardService } from "./leaderboard.service.ts";

// Leaderboard controller with routes
export const leaderboardController = new Elysia()
  .get(
    "/solo_ranked",
    async ({ query }) => {
      const leaderboardService = LeaderboardService.getInstance();
      const season = query.season ? parseInt(query.season) : undefined;
      return await leaderboardService.getSoloRankedLeaderboard(100, season);
    },
    {
      query: t.Object({
        season: t.Optional(t.String())
      }),
      detail: {
        summary: "Get Solo Ranked Leaderboard",
        description: "Get the solo ranked leaderboard. Optionally filter by season.",
        tags: ["Leaderboard"]
      }
    }
  ); 