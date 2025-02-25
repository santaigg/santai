import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";

const app = new Elysia()
  .use(swagger())
  .get("/", () => "Hello tempthing!")
  .get("/rank/:playerId", async({ params }) => {
    const response = await fetch(`https://pulsefinder-production.up.railway.app/players/bulk-profile`, {
      method: 'POST',
      body: JSON.stringify({
        playerIds: [params.playerId],
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      return {
        error: 'Failed to fetch player rank',
      };
    }
    const data: BulkProfileResponse = await response.json();
    const player = data.data.response.payload.bulkProfileData.find(player => player.playerId.toLowerCase() === params.playerId.toLowerCase());
    if (!player) {
      return {
        error: 'Player not found',
      };
    }
    const soloRank = getSoloRankFromRankNumber(player.currentSoloRank);
    const teamRank = getTeamRankFromRankNumber(player.highestTeamRank);
    return {
      soloRank,
      teamRank,
    };
  }, {
    detail: {
      summary: "Get a player's rank",
      description: "Get a player's rank. Example: `pulsefinder.com/rank/76561198376543210`",
      responses: {
        200: {
          description: "Success",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  soloRank: { type: "string" },
                  teamRank: { type: "string" },
                },
              },
            },
          },
        },
      },  
    },
  })
  .post("/player-search-by-platform", async({ body }: { body: PlayerSearchByPlatformBody }) => {
    const response = await fetch(`https://pulsefinder-production.up.railway.app/players/search-by-platform`, {
      method: 'POST',
      body: JSON.stringify({
        platform: body.platform,
        accountId: body.accountId,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      return {
        error: 'Failed to search player by platform',
      };
    }
    const data = await response.json() as PlayerIdentityResponse;
    return data.data.response.payload.playerIdentities.map(identity => ({
      playerId: identity.pragmaPlayerId,
      displayName: identity.pragmaDisplayName.displayName,
    }));
  }, {
    detail: {
      summary: "Search for a player by platform and account ID",
      description: "Search for a player by platform and account ID. Example: `steam:76561198376543210`",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                platform: { type: "string", enum: ["discord", "steam", "twitch"] },
                accountId: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Success",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    playerId: { type: "string" },
                    displayName: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  .listen(3005);

console.log(
  `🦊 Tempthing is running at ${app.server?.hostname}:${app.server?.port}`
);


function getSoloRankFromRankNumber(rankNumber: number): string {
  const soloRanks: Record<number, string> = {
    0: "Unranked",
    1: "Bronze 1",
    2: "Bronze 2",
    3: "Bronze 3",
    4: "Bronze 4",
    5: "Silver 1",
    6: "Silver 2",
    7: "Silver 3",
    8: "Silver 4",
    9: "Gold 1",
    10: "Gold 2",
    11: "Gold 3",
    12: "Gold 4",
    13: "Platinum 1",
    14: "Platinum 2",
    15: "Platinum 3",
    16: "Platinum 4",
    17: "Emerald 1",
    18: "Emerald 2",
    19: "Emerald 3",
    20: "Emerald 4",
    21: "Ruby 1",
    22: "Ruby 2",
    23: "Ruby 3",
    24: "Ruby 4",
    25: "Diamond 1",
    26: "Diamond 2",
    27: "Diamond 3",
    28: "Diamond 4",
    29: "Champion"
  };

  return soloRanks[rankNumber] ?? "Unknown";
}

function getTeamRankFromRankNumber(rankNumber: number): string {
  const teamRanks: Record<number, string> = {
    0: "Unranked",
    1: "Undiscovered 1",
    2: "Undiscovered 2",
    3: "Undiscovered 3",
    4: "Undiscovered 4",
    5: "Prospect 1",
    6: "Prospect 2",
    7: "Prospect 3",
    8: "Prospect 4",
    9: "Talent 1",
    10: "Talent 2",
    11: "Talent 3",
    12: "Talent 4",
    13: "Professional 1",
    14: "Professional 2",
    15: "Professional 3",
    16: "Professional 4",
    17: "Elite 1",
    18: "Elite 2",
    19: "Elite 3",
    20: "Elite 4",
    21: "International 1",
    22: "International 2",
    23: "International 3",
    24: "International 4",
    25: "Superstar 1",
    26: "Superstar 2",
    27: "Superstar 3",
    28: "Superstar 4",
    29: "World Class 1",
    30: "World Class 2",
    31: "World Class 3",
    32: "World Class 4",
    33: "Champion"
  };

  return teamRanks[rankNumber] ?? "Unknown";
}

type BulkProfileResponse = {
  success: boolean;
  data: {
    sequenceNumber: number;
    response: {
      requestId: number;
      type: string;
      payload: {
        bulkProfileData: {
          playerId: string;
          displayName: {
            displayName: string;
            discriminator: string;
          };
          banner: {
            itemInstanceId: string;
            itemType: string;
            alterationData: any[];
            attachmentItemInstanceId: string;
            itemCatalogId: string;
            attachmentItemCatalogId: string;
          };
          crewScore: string;
          currentSoloRank: number;
          highestTeamRank: number;
          divisionType: string;
        }[];
      };
    };
  };
}

type PlayerIdentityResponse = {
  success: boolean;
  data: {
    sequenceNumber: number;
    response: {
      requestId: number;
      type: string;
      payload: {
        playerIdentities: {
          pragmaPlayerId: string;
          pragmaDisplayName: {
            displayName: string;
            discriminator: string;
          };
          idProviderAccounts: {
            idProviderType: string;
            accountId: string;
            providerDisplayName: {
              displayName: string;
              discriminator: string;
            };
          }[];
          pragmaSocialId: string;
        }[];
      };
    };
  };
}

type PlayerSearchByPlatformBody = {
  platform: string;
  accountId: string;
}