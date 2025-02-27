#!/usr/bin/env bun
/**
 * Example of using the Database package
 * 
 * Run with: bun run examples/example-usage.ts
 */

import { DatabaseService, Player, PlayerAccount, PlayerStats, DatabaseError } from "../src";
import { config } from "dotenv";

// Load environment variables from .env file
config({ path: import.meta.dir + "/../.env" });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ SUPABASE_URL and SUPABASE_ANON_KEY environment variables are not set");
  console.log("Please set them in your .env file or environment");
  process.exit(1);
}

async function main() {
  console.log("🔍 Initializing Database Service...");
  // Type assertion since we've already checked for undefined
  const db = new DatabaseService(SUPABASE_URL!, SUPABASE_KEY!);
  
  try {
    // Create a new player
    console.log("👤 Creating a new player...");
    const newPlayer = await db.createPlayer({
      displayName: "TestPlayer",
      discriminator: "1234",
      stats: {
        currentSoloRank: 1,
        highestTeamRank: 1,
        rankRating: 1000,
        lastUpdatedRankRating: new Date()
      },
      accounts: [
        {
          id: "account-1",
          accountId: "steam-123456",
          displayName: "SteamPlayer",
          providerType: "steam"
        }
      ]
    });
    
    console.log("✅ Player created:", newPlayer.id);
    console.log("Player details:", {
      displayName: newPlayer.displayName,
      discriminator: newPlayer.discriminator,
      createdAt: newPlayer.createdAt
    });
    
    // Update the player
    console.log("🔄 Updating player...");
    newPlayer.displayName = "UpdatedPlayer";
    newPlayer.stats = {
      ...newPlayer.stats!,
      rankRating: 1500
    };
    
    const updatedPlayer = await db.updatePlayer(newPlayer);
    console.log("✅ Player updated:", {
      displayName: updatedPlayer.displayName,
      stats: updatedPlayer.stats
    });
    
    // Search for players
    console.log("🔍 Searching for players...");
    const searchResults = await db.searchPlayersByName("Updated");
    console.log(`Found ${searchResults.length} players matching the search term`);
    
    // Get player by ID
    console.log("🔍 Fetching player by ID...");
    const player = await db.getPlayer(newPlayer.id);
    console.log("Player fetched:", {
      id: player.id,
      displayName: player.displayName,
      accounts: player.accounts?.length || 0
    });
    
    // Add a player account
    console.log("➕ Adding a player account...");
    const newAccount: PlayerAccount = {
      id: "account-2",
      accountId: "discord-123456",
      displayName: "DiscordPlayer",
      providerType: "discord"
    };
    
    await db.createPlayerAccounts(player.id, [newAccount]);
    console.log("✅ Account added");
    
    // Update player stats
    console.log("📊 Updating player stats...");
    const newStats: PlayerStats = {
      currentSoloRank: 2,
      highestTeamRank: 3,
      rankRating: 2000,
      lastUpdatedRankRating: new Date()
    };
    
    await db.updatePlayerStats(player.id, newStats);
    console.log("✅ Stats updated");
    
    // Fetch the updated player
    const refreshedPlayer = await db.getPlayer(player.id);
    console.log("📋 Updated player details:", {
      displayName: refreshedPlayer.displayName,
      stats: refreshedPlayer.stats,
      accounts: refreshedPlayer.accounts?.map(a => a.providerType)
    });
    
    // Clean up - delete the player
    console.log("🗑️ Cleaning up - deleting player...");
    await db.deletePlayer(player.id);
    console.log("✅ Player deleted");
    
    // Try to fetch the deleted player (should throw an error)
    try {
      await db.getPlayer(player.id);
      console.log("❌ Player still exists!");
    } catch (error: unknown) {
      if (error instanceof DatabaseError) {
        console.log("✅ Player successfully deleted, received expected error:", error.message);
      } else {
        console.error("❌ Unexpected error type:", error);
      }
    }
    
  } catch (error: unknown) {
    console.error("❌ Error:", error instanceof Error ? error.message : String(error));
    if (error instanceof Error && 'cause' in error) {
      console.error("Cause:", (error as { cause: unknown }).cause);
    }
  }
}

// Run the main function
main().catch(console.error);
