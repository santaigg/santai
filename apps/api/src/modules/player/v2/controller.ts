import { Elysia, t } from "elysia";
import { PlayerService } from "./service";
import { ConnectionType, PrivacyLevel } from "./types";

const playerService = new PlayerService();

export const playerController = new Elysia({ prefix: "/players" })
  .get(
    "/:id",
    async ({ params }) => {
      const player = await playerService.getPlayerById(params.id);
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
        id: t.String(),
      }),
      detail: {
        tags: ["Players V2"],
        summary: "Get enhanced player profile",
        description: "Returns a player's enhanced profile with additional information",
      },
    }
  )
  .get(
    "/:id/connections",
    async ({ params }) => {
      const connections = await playerService.getPlayerConnections(params.id);
      return connections;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Players V2"],
        summary: "Get player connections",
        description: "Returns a player's connected accounts (Steam, Discord, Twitch)",
      },
    }
  )
  .get(
    "/:id/full",
    async ({ params }) => {
      const player = await playerService.getFullPlayerProfile(params.id);
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
        id: t.String(),
      }),
      detail: {
        tags: ["Players V2"],
        summary: "Get enhanced full player profile",
        description: "Returns a player's full profile with connections, match history, achievements, and friends",
      },
    }
  )
  .get(
    "/:id/achievements",
    async ({ params }) => {
      const achievements = await playerService.getPlayerAchievements(params.id);
      return achievements;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Players V2"],
        summary: "Get player achievements",
        description: "Returns a player's achievements",
      },
    }
  )
  .get(
    "/:id/friends",
    async ({ params }) => {
      const friends = await playerService.getPlayerFriends(params.id);
      return friends;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Players V2"],
        summary: "Get player friends",
        description: "Returns a player's friends list",
      },
    }
  )
  .get(
    "/:id/preferences",
    async ({ params }) => {
      const preferences = await playerService.getPlayerPreferences(params.id);
      if (!preferences) {
        return new Response(
          JSON.stringify({ error: "Preferences not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      return preferences;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Players V2"],
        summary: "Get player preferences",
        description: "Returns a player's preferences",
      },
    }
  )
  .put(
    "/:id/preferences",
    async ({ params, body }) => {
      const updatedPreferences = await playerService.updatePlayerPreferences(
        params.id,
        body
      );
      if (!updatedPreferences) {
        return new Response(
          JSON.stringify({ error: "Preferences not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      return updatedPreferences;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        theme: t.Optional(t.String()),
        notifications_enabled: t.Optional(t.Boolean()),
        privacy_level: t.Optional(
          t.Enum(PrivacyLevel)
        ),
      }),
      detail: {
        tags: ["Players V2"],
        summary: "Update player preferences",
        description: "Updates a player's preferences",
      },
    }
  )
  .get(
    "/connection/:type/:id",
    async ({ params }) => {
      const connectionType = params.type as ConnectionType;
      if (!Object.values(ConnectionType).includes(connectionType)) {
        return new Response(
          JSON.stringify({ error: "Invalid connection type" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const playerId = await playerService.getPlayerByConnectionId(
        connectionType,
        params.id
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
        type: t.String(),
        id: t.String(),
      }),
      detail: {
        tags: ["Players V2"],
        summary: "Get player ID by connection ID",
        description: "Returns a player ID given a connection type and ID (supports Steam, Discord, and Twitch)",
      },
    }
  ); 