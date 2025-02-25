import { ChatClient, ChatMessage } from '@twurple/chat';
import axios from 'axios';
import { getChannel } from '../supabase';
import logger from '../util/logger';

const mapNameMapping: Record<string, string> = {
  Metro_P: "Metro",
  Greenbelt_P: "Mill",
  Commons: "Commons",
  Junction_P: "Skyway",
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
    const normalizedChannel = channel.replace('#', '');

    // Get channel from Supabase
    const channelInstance = await getChannel(normalizedChannel);

    if (!channelInstance || !channelInstance.player_id) {
      client.say(channel, `@${displayName}, no player ID linked to this channel.`, { replyTo: messageId });
      return;
    }

    const playerId = channelInstance.player_id;
    logger.info(`Player ID for ${normalizedChannel}: ${playerId}`);

    const apiUrl = `https://wavescan-production.up.railway.app/api/v1/player/${playerId}/full_profile`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.matches || data.matches.length === 0) {
      client.say(channel, `@${displayName}, no matches found for the player.`, { replyTo: messageId });
      return;
    }

    const lastMatch = data.matches[0];
    const player = lastMatch.player_team.players.find((p: any) => p.id === playerId);

    if (!player) {
      client.say(channel, `@${displayName}, sorry, no player data found for the last match.`, { replyTo: messageId });
      return;
    }

    const winOrLoss = lastMatch.winner === lastMatch.player_team.team_index ? "won" : "lost";
    const sponsorName = player.sponsor_name || "no sponsor";

    const rawMapName = lastMatch.map || "unknown map";
    const mapName = mapNameMapping[rawMapName] || rawMapName;

    const mvp = lastMatch.player_team.players.reduce((mvp: any, p: any) => {
      const playerScore = p.kills + p.assists - p.deaths;
      const currentMvpScore = mvp.kills + mvp.assists - mvp.deaths;
      return playerScore > currentMvpScore ? p : mvp;
    });
    const isMvp = mvp.id === player.id;

    const kda = `${player.kills}/${player.deaths}/${player.assists}`;
    const rankedRatingGain =
      typeof player.ranked_rating === "number" && typeof player.previous_ranked_rating === "number"
        ? player.ranked_rating - player.previous_ranked_rating
        : "N/A";

    const responseMessage = `@${displayName}, ${channelInstance.username} ${winOrLoss} the last game | Played ${sponsorName} on ${mapName} ${
      isMvp ? "(MVP)" : ""
    } | KDA: ${kda} | Ranked Rating ${winOrLoss}: ${rankedRatingGain}`;

    client.say(channel, responseMessage, { replyTo: messageId });
    logger.info(`Last match command executed for ${normalizedChannel} (${playerId})`);
  } catch (error: any) {
    logger.error(`Error fetching last match data: ${error.message}`);
    client.say(channel, `Sorry, I couldn't fetch the last match data.`, { replyTo: msg.id });
  }
};

export const aliases = ['lastmatch', 'lastgame', 'last'];