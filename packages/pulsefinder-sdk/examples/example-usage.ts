#!/usr/bin/env bun
/**
 * Example of using the PulseFinder SDK with Bun
 * 
 * Run with: bun run examples/bun-example.ts
 */

import { PulseFinder } from "../src/index";
import { config } from "dotenv";

// Load environment variables from .env file
config({ path: import.meta.dir + "/../.env" });

const API_KEY = process.env.PULSEFINDER_API_KEY;

if (!API_KEY) {
  console.error("❌ PULSEFINDER_API_KEY environment variable is not set");
  console.log("Please set it in your .env file or environment");
  process.exit(1);
}

async function main() {
  console.log("🔍 Initializing PulseFinder SDK...");
  const sdk = new PulseFinder({ apiKey: API_KEY });
  
  try {
    // Validate authentication
    const isValid = await sdk.validateAuth();
    console.log(`🔑 Authentication ${isValid ? "successful" : "failed"}`);
    
    if (!isValid) {
      console.error("❌ Invalid API key");
      process.exit(1);
    }
    
    // Get player by ID
    console.log("👤 Fetching player information...");
    const playerId = "example-player-id"; // Replace with a real player ID
    const player = await sdk.player.getPlayerProfile(playerId);
    console.log("Player:", player);
    
    // Get player match history
    console.log("🎮 Fetching player match history...");
    const matches = await sdk.match.getPlayerMatchHistory(playerId);
    console.log(`Found ${matches.length} matches for player`);
    
    // Display first match details if available
    if (matches.length > 0) {
      console.log("First match details:", matches[0]);
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Run the main function
main().catch(console.error); 