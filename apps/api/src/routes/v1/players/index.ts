import { Elysia } from 'elysia';

// V1 API Router - combines all v1 resource routers
export const playersRouter = new Elysia({ prefix: '/players' })
  // Version info endpoint
  .get('/', () => ({
    version: 'v1',
    resources: [],
    deprecated: false,
    sunset: null // Date when this version will be deprecated
  }))
  .get('/:playerId', async ({ params }) => {
    const { playerId } = params;
    console.log("[Player Route] - [GET] - /:playerId - ", playerId);
    // Select all related data for the player
    const { data, error } = await db.client
        .from("spectre_player")
        .select(
            "*, spectre_player_stats ( * ), spectre_player_banner ( * ), spectre_player_account ( * ), spectre_team_member ( * , spectre_team ( * )), spectre_match_player ( * , spectre_match_team ( *, spectre_match ( * ) ) )",
        )
        .eq("id", playerId);
    return { data, error };
  }, {
    detail: {
        summary: "Get a player by their ID",
        description: "Returns all related data for a player",
        tags: ["players"],
        responses: {
            200: {
                description: "Player found",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                data: {
                                    type: "object"
                                }   
                            }
                        }
                    }
                }
            },
            404: {
                description: "Player not found"
            },
            500: {
                description: "Internal server error"
            }
        }
    }
  });
