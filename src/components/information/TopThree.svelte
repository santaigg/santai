<script lang="ts">
  import { fetchLeaderboard } from "../../utils/fetch/fetchLeaderboard";
  import { type LeaderboardId } from "../../utils/types/leaderboard";

  const leaderboard = await fetchLeaderboard("season0" as LeaderboardId);
</script>
