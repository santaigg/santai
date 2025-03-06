import { Elysia, t } from "elysia";
import { TournamentService } from "./tournament.service.ts";

// Tournament controller with routes
export const tournamentController = new Elysia()
  .get(
    "/",
    async ({ query }) => {
      const tournamentService = TournamentService.getInstance();
      const id = query.id || "default";
      return await tournamentService.fetchTournament(id);
    },
    {
      query: t.Object({
        id: t.Optional(t.String())
      }),
      detail: {
        summary: "Get Tournament Data",
        description: "Retrieves tournament data from Redis",
        tags: ["Tournament"]
      }
    }
  )
  .post(
    "/",
    async ({ query, body }) => {
      const tournamentService = TournamentService.getInstance();
      const id = query.id || "default";
      const action = query.action;

      if (!action) {
        return { success: false, error: "Action is required" };
      }

      switch (action) {
        case "update":
          return await tournamentService.updateTournament(body);
        case "add-match":
          return await tournamentService.addMatch(body);
        case "update-match":
          return await tournamentService.updateMatch(body);
        case "delete-match":
          if (!body.matchId) {
            return { success: false, error: "Match ID is required" };
          }
          return await tournamentService.deleteMatch(body.matchId);
        case "reset":
          return await tournamentService.resetTournamentData();
        case "create-match":
          return await tournamentService.createDefaultMatch();
        case "auth":
          if (!body.password) {
            return { success: false, error: "Password is required" };
          }
          return await tournamentService.authenticateAdmin(body.password);
        case "logout":
          return await tournamentService.logoutAdmin();
        default:
          return { success: false, error: "Invalid action" };
      }
    },
    {
      query: t.Object({
        id: t.Optional(t.String()),
        action: t.String()
      }),
      detail: {
        summary: "Manage Tournament Data",
        description: "Perform various operations on tournament data",
        tags: ["Tournament"]
      }
    }
  ); 