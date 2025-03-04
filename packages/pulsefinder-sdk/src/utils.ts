import { MatchData } from './types';

/**
 * Cleans a JSON string by removing any invalid characters and fixing common issues
 * @param jsonString The JSON string to clean
 * @returns The cleaned JSON string
 */
export function cleanJsonString(jsonString: string): string {
  return jsonString
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/\\"/g, '"') // Fix escaped quotes
    .replace(/"{/g, '{') // Fix object start
    .replace(/}"/g, '}') // Fix object end
    .replace(/\["/g, '[') // Fix array start
    .replace(/\]"/g, ']') // Fix array end
    .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
    .replace(/\\n/g, ' '); // Replace newlines with spaces
}

/**
 * Attempts to fix a JSON payload by cleaning it and handling common issues
 * @param jsonString The JSON string to fix
 * @returns The fixed JSON string
 */
export function fixJsonPayload(jsonString: string): string {
  try {
    // First try to parse it as is
    JSON.parse(jsonString);
    return jsonString;
  } catch (error) {
    // If that fails, try cleaning it
    const cleaned = cleanJsonString(jsonString);
    try {
      JSON.parse(cleaned);
      return cleaned;
    } catch (error) {
      // If cleaning didn't work, try to fix common issues
      return jsonString
        .replace(/\\/g, '\\\\') // Escape backslashes
        .replace(/\\"/g, '"') // Fix escaped quotes
        .replace(/"{/g, '{') // Fix object start
        .replace(/}"/g, '}') // Fix object end
        .replace(/\["/g, '[') // Fix array start
        .replace(/\]"/g, ']') // Fix array end
        .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
        .replace(/\\n/g, ' '); // Replace newlines with spaces
    }
  }
}

/**
 * Parses a match data string into a MatchData object, handling common formatting issues
 * @param matchDataString The match data string to parse
 * @returns The parsed MatchData object
 */
export function parseMatchData(matchDataString: string): MatchData {
  try {
    // First try to parse the JSON string directly
    return JSON.parse(matchDataString);
  } catch (error) {
    // If direct parsing fails, try to clean the string first
    const cleanedString = matchDataString
      .replace(/\n/g, '') // Remove newlines
      .replace(/\t/g, '') // Remove tabs
      .replace(/\r/g, '') // Remove carriage returns
      .trim(); // Remove leading/trailing whitespace
    
    return JSON.parse(cleanedString);
  }
} 