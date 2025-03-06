import { Elysia, t } from "elysia";
import { PlayerService } from "./service";
import { ConnectionType } from "./types";

const playerService = new PlayerService();

export const playerController = new Elysia()
  .get(
    "/:playerId",
    async ({ params }) => {
      const player = await playerService.getPlayerById(params.playerId);
      if (!player) {
        return new Response(
          JSON.stringify({ error: "Player not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      return player;
    },
    {
      params: t.Object({
        playerId: t.String(),
      }),
      detail: {
        tags: ["Player"],
        summary: "Get Player",
        description: "",
      },
    }
  )
  .get(
    "/:playerId/stats",
    async ({ params }) => {
      const stats = await playerService.getPlayerStats(params.playerId);
      return stats;
    },
    {
      params: t.Object({
        playerId: t.String(),
      }),
      detail: {
        tags: ["Player"],
        summary: "Get Player Stats",
        description: "",
      },
    }
  )
  .get(
    "/:playerId/banner",
    async ({ params }) => {
      const banner = await playerService.getPlayerBanner(params.playerId);
      return banner;
    },
    {
      params: t.Object({
        playerId: t.String(),
      }),
      detail: {
        tags: ["Player"],
        summary: "Get Player Banner",
        description: "",
      },
    }
  )
  .get(
    "/:playerId/account",
    async ({ params }) => {
      const account = await playerService.getPlayerAccount(params.playerId);
      return account;
    },
    {
      params: t.Object({
        playerId: t.String(),
      }),
      detail: {
        tags: ["Player"],
        summary: "Get Player Account",
        description: "",
      },
    }
  )
  .get(
    "/:playerId/profile",
    async ({ params }) => {
      const profile = await playerService.getPlayerProfile(params.playerId);
      return profile;
    },
    {
      params: t.Object({
        playerId: t.String(),
      }),
      detail: {
        tags: ["Player"],
        summary: "Get Player Profile",
        description: "",
      },
    }
  )
  .get(
    "/:playerId/full_profile",
    async ({ params }) => {
      const fullProfile = await playerService.getFullPlayerProfile(params.playerId);
      return fullProfile;
    },
    {
      params: t.Object({
        playerId: t.String(),
      }),
      detail: {
        tags: ["Player"],
        summary: "Get Full Player Profile",
        description: "",
      },
    }
  )
  .get(
    "/steam/:steamId",
    async ({ params }) => {
      const playerId = await playerService.getPlayerIdFromSteamId(params.steamId);
      return playerId;
    },
    {
      params: t.Object({
        steamId: t.String(),
      }),
      detail: {
        tags: ["Player"],
        summary: "Get Player ID from SteamID64",
        description: "",
      },
    }
  )
  .get(
    "/:playerId/game_ranks",
    async ({ params }) => {
      const gameRanks = await playerService.getPlayerGameRanks(params.playerId);
      return gameRanks;
    },
    {
      params: t.Object({
        playerId: t.String(),
      }),
      detail: {
        tags: ["Player"],
        summary: "Get Player Rank From GameService",
        description: "",
      },
    }
  )
  .get(
    "/:playerId/connections",
    async ({ params }) => {
      const connections = await playerService.getPlayerConnections(params.playerId);
      return connections;
    },
    {
      params: t.Object({
        playerId: t.String(),
      }),
      detail: {
        tags: ["Player"],
        summary: "Get Player Social Connections",
        description: "Gets back a list of social connections for a player. (Example: Steam, Discord, etc.)",
      },
    }
  )
  .get(
    "/player-id-from-connection/:connectionType/:connectionId",
    async ({ params }) => {
      const connectionType = params.connectionType as ConnectionType;
      if (!Object.values(ConnectionType).includes(connectionType)) {
        return new Response(
          JSON.stringify({ error: "Invalid connection type" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const playerId = await playerService.getPlayerByConnectionId(
        connectionType,
        params.connectionId
      );

      if (!playerId) {
        return new Response(
          JSON.stringify({ error: "Player not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      return { player_id: playerId };
    },
    {
      params: t.Object({
        connectionType: t.String(),
        connectionId: t.String(),
      }),
      detail: {
        tags: ["Player"],
        summary: "Get Player ID from Connection ID",
        description: "Gets back a player ID from a connection ID. This is useful for getting a player ID from a SteamID64, Discord ID, etc.",
      },
    }
  )
  .get(
    "/:playerId/steam_profile",
    async ({ params }) => {
      const steamProfile = await playerService.getPlayerSteamProfile(params.playerId);
      return steamProfile;
    },
    {
      params: t.Object({
        playerId: t.String(),
      }),
      detail: {
        tags: ["Player"],
        summary: "Get Player's Steam Profile",
        description: "Gets the Steam profile information for a player using their player ID",
      },
    }
  ); 