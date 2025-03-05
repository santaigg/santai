#!/usr/bin/env bun
/**
 * Example of using the PulseFinder SDK with Bun
 * 
 * Run with: bun run examples/example-usage.ts
 */

import PulseFinder from "../src/index";
import { config } from "dotenv";

// Load environment variables from .env file
config({ path: import.meta.dir + "/../.env.local" });

const API_KEY = process.env.PULSEFINDER_API_KEY;
const API_URL = process.env.PULSEFINDER_API_URL;

if (!API_KEY) {
  console.error("❌ PULSEFINDER_API_KEY environment variable is not set");
  console.log("Please set it in your .env.local file or environment");
  process.exit(1);
}

async function main() {
  console.log("🔍 Initializing PulseFinder SDK...");
  console.log(`Using API URL: ${API_URL || 'default'}`);
  
  const sdk = new PulseFinder({ 
    apiKey: API_KEY,
    baseUrl: API_URL
  });
  
  try {
    // Validate authentication
    const isValid = await sdk.validateAuth();
    console.log(`🔑 Authentication ${isValid ? "successful" : "failed"}`);
    
    if (!isValid) {
      console.error("❌ Invalid API key");
      process.exit(1);
    }
    
    // Try to access the API endpoints with better error handling
    try {
      console.log("👤 Fetching player information...");
      // Use a real player ID or handle the 404 gracefully
      const playerId = "example-player-id"; // Replace with a real player ID
      const player = await sdk.player.getSocialConnections(playerId);
      console.log("Player:", player);
    } catch (error) {
      console.error(`❌ Error fetching player: ${error.message}`);
      console.log("This endpoint might not be available in the current API version.");
    }
    
    try {
      console.log("🎮 Fetching match information...");
      const matchId = "0003d9c7-b1f7-487c-b028-afc4c36cf7bc"; // Replace with a real match ID
      const match = await sdk.match.getMatch(matchId);
      console.log(`Match details: ${match?.data?.matchData?.matchId || 'Not found'}`);
    } catch (error) {
      console.error(`❌ Error fetching match: ${error.message}`);
      console.log("This endpoint might not be available in the current API version.");
    }
    
    console.log("\n✅ Example completed. Some requests may have failed if the endpoints are not implemented.");
    console.log("Check the backend API documentation for available endpoints.");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Run the main function
main().catch(console.error); 