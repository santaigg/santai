import { ChatClient, ChatMessage } from '@twurple/chat';
import axios from 'axios';
import { getChannel } from '../supabase';
import { getStreamStatusForUser } from '../util/twitchUtils';  // Ensure the path is correct
import logger from '../util/logger';

const mapNameMapping: Record<string, string> = {
  Metro_P: "Metro",
  Greenbelt_P: "Mill",
  Commons: "Commons",
  Junction_P: "Skyway",
};

// To store record-related information per channel
const streamRecords: {
  [channel: string]: {
    trackedMatchIds: Set<string>;
    matchCount: number;
    winCount: number;
    lossCount: number;
    previousSR: number | null;  // Track the previous SR to compare with the current SR
  };
} = {};

// Function to format a date into a readable string
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString(); // Convert to a more readable format
};

// Function to compare if the stream was live during the last match
const wasStreamLiveDuringMatch = (streamStartTime: Date, matchDate: Date, currentTime: Date) => {
  logger.debug(`Stream Start: ${streamStartTime}, Match Date: ${matchDate}, Current Time: ${currentTime}`);
  return streamStartTime <= matchDate && matchDate <= currentTime;
};

export const execute = async (
  client: ChatClient, 
  channel: string, 
  message: string, 
  msg: ChatMessage,
  args?: string[]
) => {
  try {
    // Get user information from the message
    const displayName = msg.userInfo.displayName;
    const messageId = msg.id;
    const normalizedChannel = channel.replace('#', ''); // Normalize channel name

    // Get channel from Supabase
    const channelInstance = await getChannel(normalizedChannel);

    if (!channelInstance || !channelInstance.player_id) {
      client.say(channel, `@${displayName}, no player ID linked to this channel.`, { replyTo: messageId });
      return;
    }

    const accessToken = channelInstance.access_token;
    if (!accessToken) {
      client.say(channel, `@${displayName}, no valid access token found.`, { replyTo: messageId });
      return;
    }

    const streamStatus = await getStreamStatusForUser(normalizedChannel, accessToken);
    if (!streamStatus || !streamStatus.streamStartTime) {
      client.say(channel, `@${displayName}, the stream is not live or start time is unavailable.`, { replyTo: messageId });
      return;
    }

    const streamStartTime = new Date(streamStatus.streamStartTime);
    const currentTime = new Date();
    const playerId = channelInstance.player_id;
    logger.info(`Player ID for ${normalizedChannel}: ${playerId}`);

    const apiUrl = `https://wavescan-production.up.railway.app/api/v1/player/${playerId}/full_profile`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.matches || data.matches.length === 0) {
      client.say(channel, `@${displayName}, no matches played yet during this stream.`, { replyTo: messageId });
      return;
    }

    const lastMatch = data.matches[0];
    const matchDate = new Date(lastMatch.match_date);

    // Log for debugging
    logger.debug(`Last Match Date: ${matchDate}, Stream Start: ${streamStartTime}, Current Time: ${currentTime}`);

    if (!wasStreamLiveDuringMatch(streamStartTime, matchDate, currentTime)) {
      client.say(channel, `@${displayName}, no matches have been played yet.`, { replyTo: messageId });
      return;
    }

    if (!streamRecords[channel]) {
      streamRecords[channel] = {
        trackedMatchIds: new Set(),
        matchCount: 0,
        winCount: 0,
        lossCount: 0,
        previousSR: null,
      };
      logger.info(`Stream started for ${normalizedChannel}, initializing record.`);
    }

    const record = streamRecords[channel];
    if (!record.trackedMatchIds.has(lastMatch.id)) {
      record.trackedMatchIds.add(lastMatch.id);
      record.matchCount += 1;

      // Check if the player won the match
      const playerTeamIndex = lastMatch.player_team.team_index;
      if (lastMatch.winner === playerTeamIndex) {
        logger.info(`Player ${playerId} WON the match:`);
        record.winCount += 1;
      } else {
        logger.info(`Player ${playerId} LOST the match:`);
        record.lossCount += 1;
      }
    }

    const currentSR = data.stats.rank_rating;
    let srChange = 0;
    if (record.previousSR !== null) {
      srChange = currentSR - record.previousSR;
    }
    record.previousSR = currentSR;

    const srStatus = srChange > 0 ? "up" : srChange < 0 ? "down" : "no change";

    client.say(
      channel, 
      `${channelInstance.username} is ${srStatus} ${Math.abs(srChange)} SR, Won ${record.winCount} - Lost ${record.lossCount} this stream`, 
      { replyTo: messageId }
    );
    
    logger.info(`Record command executed for ${normalizedChannel}: W${record.winCount}-L${record.lossCount}, SR ${srStatus} ${Math.abs(srChange)}`);
  } catch (error: any) {
    logger.error(`Error in record command: ${error.message}`);
    client.say(channel, `Sorry, I couldn't fetch the record data.`, { replyTo: msg.id });
  }
};

export const aliases = ['record', 'stats', 'sr'];