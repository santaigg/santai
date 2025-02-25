import { ChatClient, ChatMessage } from '@twurple/chat';
import axios from 'axios';
import { getChannel } from '../supabase';
import logger from '../util/logger';

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

    const rankMapping: Record<number, { name: string }> = {
      0: { name: "Unranked" },
      1: { name: "Bronze 1" },
      2: { name: "Bronze 2" },
      3: { name: "Bronze 3" },
      4: { name: "Bronze 4" },
      5: { name: "Silver 1" },
      6: { name: "Silver 2" },
      7: { name: "Silver 3" },
      8: { name: "Silver 4" },
      9: { name: "Gold 1" },
      10: { name: "Gold 2" },
      11: { name: "Gold 3" },
      12: { name: "Gold 4" },
      13: { name: "Platinum 1" },
      14: { name: "Platinum 2" },
      15: { name: "Platinum 3" },
      16: { name: "Platinum 4" },
      17: { name: "Emerald 1" },
      18: { name: "Emerald 2" },
      19: { name: "Emerald 3" },
      20: { name: "Emerald 4" },
      21: { name: "Ruby 1" },
      22: { name: "Ruby 2" },
      23: { name: "Ruby 3" },
      24: { name: "Ruby 4" },
      25: { name: "Diamond 1" },
      26: { name: "Diamond 2" },
      27: { name: "Diamond 3" },
      28: { name: "Diamond 4" },
      29: { name: "Champion" },
    };

    // Get channel from Supabase
    const channelInstance = await getChannel(normalizedChannel);

    if (!channelInstance || !channelInstance.player_id) {
      client.say(channel, `@${displayName}, no player ID linked to this channel.`, { replyTo: messageId });
      return;
    }

    const playerId = channelInstance.player_id;
    const apiUrl = `https://wavescan-production.up.railway.app/api/v1/player/${playerId}/profile`;

    const response = await axios.get(apiUrl);
    const data = response.data;
    const { current_solo_rank, rank_rating } = data.stats;

    const soloRank = rankMapping[current_solo_rank]?.name || "Unknown Rank";

    client.say(channel, `@${displayName}, Current Solo Rank: ${soloRank} - Rating: ${rank_rating}`, { replyTo: messageId });
    logger.info(`Rank command executed for ${normalizedChannel} (${playerId}): ${soloRank} - ${rank_rating}`);
  } catch (error: any) {
    logger.error(`Error fetching rank data: ${error.message}`);
    client.say(channel, `Sorry, I couldn't fetch the rank data.`, { replyTo: msg.id });
  }
};

export const aliases = ['rank', 'rating', 'elo', 'rr'];