<script lang="ts">
  import { cubicOut } from "svelte/easing";
  import { slide } from "svelte/transition";
  import type { PlayerMatch, Match_Team } from "../../utils/types/wavescan.types";

  export let match: PlayerMatch;
  let playerWithGreatestMvpScore: Match_Team["players"][0] | null = null;

  function calculateMvpScore(player: Match_Team["players"][0]): number {
    return calculateADR(player) * (player.kills / match.rounds);
  }

  function checkIfMvpScoreIsGreaterThanLastMvp(player: Match_Team["players"][0]): boolean {
    let playerMvpScore: number = calculateMvpScore(player);

    return playerWithGreatestMvpScore == null || playerMvpScore > calculateMvpScore(playerWithGreatestMvpScore);
  }

  function updateMvpWithNewPlayer(player: Match_Team["players"][0]): string {
    if (checkIfMvpScoreIsGreaterThanLastMvp(player)) {
      playerWithGreatestMvpScore = player;
    }

    return "";
  }

  function getScoreColor(score: number): string {
    if (score >= 300) return "teal-400";
    if (score >= 250) return "emerald-200";
    if (score >= 200) return "slate-300";
    if (score >= 150) return "rose-300";
    return "red-500";
  }

  export let selectedMatchTab: "scoreboard" | "statistics" = "scoreboard";

  function calculateADR(player: Match_Team["players"][0]): number {
    return Math.round(player.damage_dealt / match.rounds);
  }

  function getKDA(player: Match_Team["players"][0]): string {
    return `${player.kills} / ${player.deaths} / ${player.assists}`;
  }

  function getRankName(rankId: number): string {
    switch (rankId) {
      case 0:
        return "Unranked";
      case 1:
        return "Bronze 1";
      case 2:
        return "Bronze 2";
      case 3:
        return "Bronze 3";
      case 4:
        return "Bronze 4";
      case 5:
        return "Silver 1";
      case 6:
        return "Silver 2";
      case 7:
        return "Silver 3";
      case 8:
        return "Silver 4";
      case 9:
        return "Gold 1";
      case 10:
        return "Gold 2";
      case 11:
        return "Gold 3";
      case 12:
        return "Gold 4";
      case 13:
        return "Platinum 1";
      case 14:
        return "Platinum 2";
      case 15:
        return "Platinum 3";
      case 16:
        return "Platinum 4";
      case 17:
        return "Emerald 1";
      case 18:
        return "Emerald 2";
      case 19:
        return "Emerald 3";
      case 20:
        return "Emerald 4";
      case 21:
        return "Ruby 1";
      case 22:
        return "Ruby 2";
      case 23:
        return "Ruby 3";
      case 24:
        return "Ruby 4";
      case 25:
        return "Diamond 1";
      case 26:
        return "Diamond 2";
      case 27:
        return "Diamond 3";
      case 28:
        return "Diamond 4";
      case 29:
        return "Champion";
      default:
        return "Unranked";
    }
  }
  function getRowClass(index: number, isPlayerTeam: boolean): string {
    const baseColor = isPlayerTeam ? "bg-zinc-800" : "bg-zinc-900";
    return `${index % 2 === 0 ? baseColor : `${baseColor}/80`} flex flex-wrap items-center px-2 py-1 text-center`;
  }
</script>

<div transition:slide={{ duration: 300, easing: cubicOut }} class="border-t-neutral-600/[0.25] border-t-2 grid border-solid gap-2 p-2 w-full">
  <div class="items-center flex text-sm font-medium">
    <button
      class={`items-center border-b-neutral-600/[0.25] rounded-bl-md border-b-2 border-l-neutral-600/[0.25] border-l-2 border-t-neutral-600/[0.25] rounded-tl-md border-t-2 cursor-pointer flex-grow justify-center py-1 px-3 text-center flex w-32 h-9 text-zinc-100 border-r-2 border-r-neutral-600/[0.25] rounded-tr-md rounded-br-md ${selectedMatchTab === "scoreboard" ? "bg-[#e6b824]" : "bg-zinc-800"}`}
      on:click={() => (selectedMatchTab = "scoreboard")}
    >
      <span>Scoreboard</span>
    </button>
  </div>
  <div class="bg-zinc-900 rounded-md text-zinc-400 overflow-x-auto">
    <div class="min-w-full">
      {#if selectedMatchTab === "scoreboard"}
        {#each [match.player_team, match.opponent_team] as team, teamIndex}
          {#if team}
            <div class="flex flex-wrap items-center px-2 py-1 text-center">
              <div class="w-full sm:w-1/3 text-left {teamIndex === 0 ? 'text-teal-400' : 'text-red-500'}">
                <span>{teamIndex === 0 ? "My Team" : "Opponent Team"}</span>
              </div>
              <div class="w-1/4 sm:w-1/6 md:w-1/12 text-xs"><p>ADR</p></div>
              <div class="w-1/4 sm:w-1/6 md:w-1/12 text-xs"><p>KDA</p></div>
              <div class="w-1/4 sm:w-1/6 md:w-1/12 text-xs"><p>Damage</p></div>
              <div class="w-1/4 sm:w-1/6 md:w-1/12 text-xs"><p>KPR</p></div>
            </div>
            {#each team.players as player, index}
              {updateMvpWithNewPlayer(player)}
              <div class={getRowClass(index, teamIndex === 0)}>
                <div class="w-full sm:w-1/3 flex items-center justify-start mb-2 sm:mb-0">
                  <a href={`/players/${player.id}`} class="flex items-center gap-2">
                    <div class="bg-{teamIndex === 0 ? 'teal' : 'red'}-400 flex rounded-md">
                      <img
                        src={`/images/sponsor-logos/${player.sponsor_name}.png`}
                        alt={player.sponsor_name}
                        class="w-6 h-6 sm:w-8 sm:h-8 border-2 border-{teamIndex === 0 ? 'teal' : 'red'}-400 border-solid rounded-md"
                      />
                    </div>
                    <div class="flex">
                      <img src={`/images/solo-ranks/${getRankName(parseInt(player.rank_id))?.replace(" ", "-")}.png`} alt="Rank" class="w-5 h-5 sm:w-6 sm:h-6 rounded-md" />
                    </div>
                    <p class="text-gray-200 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[150px]">
                      {player.name}
                    </p>
                    {#if playerWithGreatestMvpScore == player}
                      <span id={player.name + "_mvp_star"}>
                        ⭐ <span class="text-accent text-xs font-bold">MVP</span>
                      </span>
                    {/if}
                  </a>
                </div>
                <div class="w-1/4 sm:w-1/6 md:w-1/12 text-xs sm:text-sm text-teal-500"><p>{calculateADR(player)}</p></div>
                <div class="w-1/4 sm:w-1/6 md:w-1/12 text-xs sm:text-sm"><p>{getKDA(player)}</p></div>
                <div class="w-1/4 sm:w-1/6 md:w-1/12 text-xs sm:text-sm"><p>{player.damage_dealt}</p></div>
                <div class="w-1/4 sm:w-1/6 md:w-1/12 text-xs sm:text-sm"><p>{(player.kills / match.rounds).toFixed(2)}</p></div>
              </div>
            {/each}
          {/if}
        {/each}
      {/if}
    </div>
  </div>
  <div class="bg-zinc-800 rounded-md p-2 mt-2">
    <p class="text-xs text-zinc-400">
      Match ID: <span class="text-[#f9c61f] font-semibold">{match.id}</span>
    </p>
  </div>
</div>
