import { PulseFinder, Platform, AuthenticationError, NotFoundError } from './index';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
config({ path: resolve(import.meta.dir, '../.env') });

async function testSDK() {
  try {
    console.log('Testing PulseFinder SDK...');
    console.log('Environment:', process.env.NODE_ENV || 'development');
    
    // Initialize the SDK (no API key needed for local development)
    const pulsefinder = new PulseFinder({
      // Only use API key if provided
      ...(process.env.PULSEFINDER_API_KEY && { apiKey: process.env.PULSEFINDER_API_KEY }),
      // Use custom URL if provided
      ...(process.env.PULSEFINDER_API_URL && { baseUrl: process.env.PULSEFINDER_API_URL }),
    });
    
    console.log('SDK initialized');
    console.log(`API URL: ${process.env.PULSEFINDER_API_URL || 'http://localhost:3000'}`);
    
    // Test authentication
    try {
      const isValid = await pulsefinder.validateAuth();
      console.log('Authentication valid:', isValid);
    } catch (error) {
      console.error('Authentication test failed:', error);
    }
    
    // Test player API
    try {
      // This is a placeholder ID, replace with a real one for testing
      const playerId = process.env.TEST_PLAYER_ID || 'example-player-id';
      console.log(`Fetching player profile for ID: ${playerId}`);
      
      const player = await pulsefinder.player.getPlayerProfile(playerId);
      console.log('Player profile:', player);
    } catch (error) {
      if (error instanceof NotFoundError) {
        console.log('Player not found (expected for placeholder ID)');
      } else {
        console.error('Player API test failed:', error);
      }
    }
    
    console.log('SDK test completed');
  } catch (error) {
    console.error('SDK test failed:', error);
  }
}

// Run the test
testSDK().catch(console.error); 