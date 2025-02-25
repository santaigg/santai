<script lang="ts">
import { onMount, onDestroy, createEventDispatcher } from "svelte";
import MatchDetails from "./MatchDetails.svelte";
import type {
	Match_Team,
	PlayerFullProfile,
} from "../../utils/types/wavescan.types";
import { emitSocketEvent } from "../../utils/socket-handler";
    import LoadingBar from "../cosmetic/LoadingBar.svelte";

export let playerFullProfile: PlayerFullProfile;
export let isLoading = false;
export let loadingErrorMessage: string = "";
export let hasError = false;

type dumpStatus = {
    success: boolean;
    is_priority: boolean;
    queue_position: number | null;
    initially_dumped: boolean;
    in_progress: boolean;
    last_updated: number | null;
}

function toggleMatchDetails(match: {
	expanded: any;
	result?: string;
	id?: string;
	region?: string;
	is_ranked?: boolean;
	queue_name?: string;
	map?: string;
	game_mode?: string;
	surrended_team?: number;
	is_abandoned?: boolean;
	match_date?: Date;
	rounds?: number;
	winner?: 0 | 1 | -1;
	player_team?: Match_Team;
	opponent_team?: Match_Team | null;
}) {
	match.expanded = !match.expanded;
	// Force update of reactiveMatches
	reactiveMatches = [...reactiveMatches];
}

// If the match was played today, return the time, otherwise return the date
const getDate = (date: string | Date) => {
	const matchDate = new Date(date);
	const now = new Date();
	const diffTime = now.getTime() - matchDate.getTime();
	const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
	const diffMinutes = Math.floor(diffTime / (1000 * 60));
	if (diffMinutes <= 60) {
		const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
		return rtf.format(-diffMinutes, "minute");
	}
	if (diffHours <= 24) {
		const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
		return rtf.format(-diffHours, "hour");
	}
	return matchDate.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

function getMapName(
	map: string,
): "Commons" | "Metro" | "Mill" | "Skyway" | "Unknown" {
	switch (map.toLowerCase()) {
		case "commons_p":
			return "Commons";
		case "metro_p":
			return "Metro";
		case "greenbelt_p":
			return "Mill";
		case "junction_p":
			return "Skyway";
		default:
			return "Unknown";
	}
}

let reactiveMatches = playerFullProfile?.matches?.map((match) => ({
	...match,
	expanded: false,
	result:
		match.winner === -1
			? "Draw"
			: match.winner === match.player_team?.team_index
				? "Victory"
				: "Defeat",
}));

let last20Wins =
	playerFullProfile?.extended_stats?.last_20_matches_avg_stats?.total_wins;
let last20Losses =
	playerFullProfile?.extended_stats?.last_20_matches_avg_stats?.total_losses;
let last20Winrate =
	playerFullProfile?.extended_stats?.last_20_matches_avg_stats
		?.average_win_percentage ?? 0;
let last20Kd =
	(playerFullProfile?.extended_stats?.last_20_matches_avg_stats
		?.average_kills_per_round ?? 0) /
	(playerFullProfile?.extended_stats?.last_20_matches_avg_stats
		?.average_deaths_per_round ?? 1);
let last20Adr =
	playerFullProfile?.extended_stats?.last_20_matches_avg_stats
		?.average_damage_per_round ?? 0;

let isRefreshing = false;
let isAddingMatch = false;
let showAddMatchModal = false;
let matchIdInput = "";
let addMatchError = "";
let previousMatchIds: string[] = [];
let showPreviousIds = false;
let showMatchIdHelp = false;

function toggleMatchIdHelp() {
	showMatchIdHelp = !showMatchIdHelp;
}

onMount(() => {
	// Get Previous Match IDs
	const storedIds = localStorage.getItem("previousMatchIds");
	if (storedIds) {
		previousMatchIds = JSON.parse(storedIds);
	}

	window.addEventListener("playerDataUpdate", handlePlayerDataUpdate);
});

onDestroy(() => {
	window.removeEventListener("playerDataUpdate", handlePlayerDataUpdate);
});



const dispatch = createEventDispatcher();
async function refreshMatches() {
    if (!(await isRefreshAllowed())) {
      console.log("Refresh not allowed: Player has not been initially dumped");
      return;
    }

    isRefreshing = true;
    try {
      // Check dump status
      const dumpStatusResponse = await fetch(`https://wavescan-production.up.railway.app/api/v1/player/${playerFullProfile.id}/dump_status`);
      if (!dumpStatusResponse.ok) throw new Error("Failed to fetch dump status");
      const dumpStatus = await dumpStatusResponse.json() as dumpStatus;

      const currentTime = new Date().getTime();
      const lastRefreshTime = localStorage.getItem(`lastRefresh_${playerFullProfile.id}`);
      const lastDumpTime = dumpStatus.initially_dumped ? (dumpStatus.last_updated ?? localStorage.getItem(`lastDump_${playerFullProfile.id}`) ? Number.parseInt(localStorage.getItem(`lastDump_${playerFullProfile.id}`) ?? "0") : 0) : null;

      // Determine if we should refresh or dump
      const shouldDump = !lastDumpTime || currentTime - lastDumpTime > 900000; // 15 minutes
      const shouldRefresh = !lastRefreshTime || currentTime - Number.parseInt(lastRefreshTime) > 300000; // 5 minutes

      if (shouldDump) {
        // Initiate a new dump
        const dumpResponse = await fetch(`https://wavescan-production.up.railway.app/api/v1/player/${playerFullProfile.id}/dump`);
        if (!dumpResponse.ok) throw new Error("Failed to initiate dump");
        localStorage.setItem(`lastDump_${playerFullProfile.id}`, currentTime.toString());
        // You might want to handle the response here, e.g., show a message that dump is in progress
      } else if (shouldRefresh) {
        // Fetch full profile
        const response = await fetch(`https://wavescan-production.up.railway.app/api/v1/player/${playerFullProfile.id}/full_profile`);
        if (!response.ok) throw new Error("Failed to fetch matches");
        playerFullProfile = await response.json();
        reactiveMatches = playerFullProfile.matches.map((match) => ({
          ...match,
          expanded: false,
          result:
            match.winner === -1
              ? "Draw"
              : match.winner === match.player_team?.team_index
                ? "Victory"
                : "Defeat",
        }));
        localStorage.setItem(`lastRefresh_${playerFullProfile.id}`, currentTime.toString());
      } else {
        console.log("No refresh or dump needed at this time");
      }
    } catch (error) {
      console.error("Error refreshing matches:", error);
      // You might want to set an error state here to display to the user
    } finally {
      isRefreshing = false;
    }
  }

// Function to check if refresh is allowed
async function isRefreshAllowed() {
    try {
      const response = await fetch(`https://wavescan-production.up.railway.app/api/v1/player/${playerFullProfile.id}/dump_status`);
      if (!response.ok) throw new Error('Failed to fetch dump status');
      const dumpStatus = await response.json() as dumpStatus;
      return dumpStatus.initially_dumped;
    } catch (error) {
      console.error('Error checking dump status:', error);
      return false; // If there's an error, we'll disallow refresh to be safe
    }
  }

async function addMatch() {
	isAddingMatch = true;
	addMatchError = "";
	try {
		// Check if match ID is valid
		const matchId = matchIdInput?.toLowerCase()?.trim()?.replace(" ", "");
		const checkResponse = await fetch(
			`https://wavescan-production.up.railway.app/api/v1/match/${matchId}/check`,
		);
		if (!checkResponse.ok) throw new Error("Invalid match ID");
		const checkResponseJson = await checkResponse.json();
		if (checkResponseJson.success === false || checkResponseJson.error)
			throw new Error(checkResponseJson.error);

		// If valid, dump the match
		const addResponse = await fetch(
			`https://wavescan-production.up.railway.app/api/v1/match/${matchId}/add`,
		);
		if (!addResponse.ok) throw new Error("Failed to add match");
		showAddMatchModal = false;
		await refreshMatches();
	} catch (error) {
		console.error("Error adding match:", error);
		addMatchError = error instanceof Error ? error.message : "Unknown error";
	}

	// After attempting to add a match, store the ID
	if (matchIdInput && !previousMatchIds.includes(matchIdInput)) {
		previousMatchIds = [matchIdInput, ...previousMatchIds.slice(0, 4)]; // Keep last 5 IDs
		localStorage.setItem("previousMatchIds", JSON.stringify(previousMatchIds));
	}

	isAddingMatch = false;
}

function selectPreviousId(id: string) {
	matchIdInput = id;
	showPreviousIds = false;
}

function clearPreviousMatchIds() {
	previousMatchIds = [];
	localStorage.removeItem("previousMatchIds");
	showPreviousIds = false;
}

function handlePlayerDataUpdate(event: CustomEvent) {
	console.log("[MatchHistory] Player data updated", event);
	const updatedPlayerFullProfile = event.detail;
	playerFullProfile = updatedPlayerFullProfile;
	reactiveMatches = updatedPlayerFullProfile.matches.map((match) => ({
		...match,
		expanded: false,
		result:
			match.winner === -1
				? "Draw"
				: match.winner === match.player_team?.team_index
					? "Victory"
					: "Defeat",
	}));
	last20Wins = updatedPlayerFullProfile.extended_stats?.last_20_matches_avg_stats?.total_wins;
	last20Losses = updatedPlayerFullProfile.extended_stats?.last_20_matches_avg_stats?.total_losses;
	last20Winrate = updatedPlayerFullProfile.extended_stats?.last_20_matches_avg_stats?.average_win_percentage ?? 0;
	last20Kd = (updatedPlayerFullProfile.extended_stats?.last_20_matches_avg_stats?.average_kills_per_round ?? 0) / (updatedPlayerFullProfile.extended_stats?.last_20_matches_avg_stats?.average_deaths_per_round ?? 1);
	last20Adr = updatedPlayerFullProfile.extended_stats?.last_20_matches_avg_stats?.average_damage_per_round ?? 0;
  isLoading = false;
}

function getMatchQueueName(queueName: string, used_team_rank: boolean) {
  const lowerCaseQueueName = queueName.toLowerCase();
  switch (lowerCaseQueueName) {
    case "standard_ranked":
      if (used_team_rank) {
        return "Team Ranked";
      }
      return "Solo Ranked";
    case "standard_casual":
      return "Casual";
    default:
      return queueName;
  }
}
</script>
{#if isLoading}
<div class="bg-[#09090b] rounded-lg p-4">
  <h2 class="text-2xl font-bold text-light-1 mb-4">Match History</h2>
  <p class="text-light-2 mb-4">Currently fetching your player profile... If this takes longer than 10 seconds, please refresh the page or start tracking matches.</p>
  <div class="space-y-2">
    {#each Array(20) as _, i}
      <div class="bg-[#131315] rounded-lg p-3 animate-pulse">
        <div class="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div class="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    {/each}
  </div>
  <button class="mt-4 bg-accent text-dark-0 px-4 py-2 rounded-lg">Refresh Matches</button>
</div>
{:else if !playerFullProfile?.matches?.length}
  <div class="bg-[#09090b] rounded-lg p-8">
    <div class="bg-[#131315] rounded-lg p-6 text-center">
      <h3 class="text-xl text-light-1 font-bold mb-2">No Data Available</h3>
      <p class="font-semibold text-light-2 mb-2">
        No matches found! Add your first match using the button below.
      </p>
      <p class="text-light-2 mb-6">
        Currently, we cannot automatically track matches that do not contain a three-stack on either team.
        Utilize the "Add Match" button to ensure all your matches are tracked.
      </p>
      <div class="flex justify-center space-x-2">
        <button
          on:click={refreshMatches}
          class="px-4 py-2 bg-[#131315] text-[#f9c61f] rounded-md flex items-center border border-[#f9c61f] hover:bg-[#f9c61f] hover:text-[#131315] transition-colors duration-300"
          disabled={isRefreshing}
        >
          {#if isRefreshing}
            <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          {:else}
            <svg class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
          {/if}
          Refresh Matches
        </button>
        
        <button
          on:click={() => showAddMatchModal = true}
          class="px-4 py-2 bg-[#131315] text-[#f9c61f] rounded-md flex items-center border border-[#f9c61f] hover:bg-[#f9c61f] hover:text-[#131315] transition-colors duration-300"
        >
          <svg class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Add Match
        </button>
      </div>
    </div>
</div>
{:else}
    <div class="last-20-stats bg-[#09090b] rounded-lg p-4 mb-4 border-[#131315] border-2">
        <div class="flex flex-col lg:flex-row w-full">
          <div class="flex-grow lg:w-3/4 mb-4 lg:mb-0 lg:mr-4">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div class="flex flex-col">
                <h5 class="text-[#f9c61f] text-sm font-bold">Last 20 Matches</h5>
                <p class="text-light-2 text-sm">{last20Wins}W {last20Losses}L</p>
              </div>
              <div class="flex flex-col">
                <h5 class="text-[#f9c61f] text-sm font-bold">Winrate</h5>
                <p class="text-light-2 text-sm">{last20Winrate.toFixed(2)}%</p>
              </div>
              <div class="flex flex-col">
                <h5 class="text-[#f9c61f] text-sm font-bold">K/D</h5>
                <p class="text-light-2 text-sm">{last20Kd.toFixed(2)}</p>
              </div>
              <div class="flex flex-col">
                <h5 class="text-[#f9c61f] text-sm font-bold">ADR</h5>
                <p class="text-light-2 text-sm">{last20Adr.toFixed(2)}</p>
              </div>
            </div>
            <!-- Dynamic W/L bar -->
            <div class="w-full h-1 rounded-full overflow-hidden flex">
              {#if last20Wins > 0}
                <div
                  class="h-full bg-valid transition-all duration-500 bg-green-500"
                  style="width: {(last20Wins / (last20Wins + last20Losses) * 100)}%"
                ></div>
              {/if}
              {#if last20Losses > 0}
                <div
                  class="h-full bg-wrong transition-all duration-500 bg-red-500"
                  style="width: {(last20Losses / (last20Wins + last20Losses) * 100)}%"
                ></div>
              {/if}
            </div>
          </div>
          <!-- <div class="lg:w-1/4 flex items-center">
            <div class="flex flex-row justify-between w-full">
              <div class="flex flex-col items-center">
                <img src="/images/sponsor-logos/Morrgen.png" alt="Morrgen" class="w-12 h-12 rounded-lg border-2 border-[#131315] bg-[#e6b824]" />
                <p class="text-light-2 text-sm font-bold mt-1">55%</p>
              </div>
              <div class="flex flex-col items-center">
                <img src="/images/sponsor-logos/Pinnacle.png" alt="Pinnacle" class="w-12 h-12 rounded-lg border-2 border-[#131315] bg-[#e6b824]" />
                <p class="text-light-2 text-sm font-bold mt-1">55%</p>
              </div>
              <div class="flex flex-col items-center">
                <img src="/images/sponsor-logos/Vector.png" alt="Vector" class="w-12 h-12 rounded-lg border-2 border-[#131315] bg-[#e6b824]" />
                <p class="text-light-2 text-sm font-bold mt-1">55%</p>
              </div>
            </div>
          </div> -->
        </div>
      </div>

      <div class="flex justify-end space-x-2 mb-4">
        <button
        on:click={refreshMatches}
        class="px-4 py-2 bg-[#131315] text-[#f9c61f] rounded-md flex items-center border border-[#f9c61f] hover:bg-[#f9c61f] hover:text-[#131315] transition-colors duration-300"
        disabled={isRefreshing || !isRefreshAllowed()}
      >
        {#if isRefreshing}
          <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        {:else}
          <svg class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
          </svg>
        {/if}
        Refresh Matches
      </button>
        
        <button
          on:click={() => showAddMatchModal = true}
          class="px-4 py-2 bg-[#131315] text-[#f9c61f] rounded-md flex items-center border border-[#f9c61f] hover:bg-[#f9c61f] hover:text-[#131315] transition-colors duration-300"
        >
          <svg class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Add Match
        </button>
      </div>
      
      {#if showAddMatchModal}
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-[#09090b] rounded-lg p-6 w-full max-w-xl mx-auto">
          <h2 class="text-xl font-bold mb-4 text-[#f9c61f]">Add Match</h2>
          <div class="relative mb-4">
            <input
              type="text"
              bind:value={matchIdInput}
              placeholder="Enter match ID"
              class="w-full px-3 py-2 pr-10 bg-[#131315] border border-[#f9c61f] rounded-md text-light-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f9c61f]"
            >
            <button
              on:click={toggleMatchIdHelp}
              class="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#f9c61f] hover:text-[#e6b824] transition-colors duration-300"
              title="How to get match ID"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          {#if showMatchIdHelp}
            <div class="mb-4">
              <img 
                src="/images/info-gifs/how-to-add-match.gif" 
                alt="How to get match ID" 
                class="rounded-md w-full"
                loading="lazy"
              >
            </div>
          {/if}
          {#if previousMatchIds.length > 0}
            <div class="relative mb-4">
              <div class="flex justify-between items-center mb-2">
                <button
                  on:click={() => showPreviousIds = !showPreviousIds}
                  class="text-left px-3 py-2 bg-[#131315] border border-[#f9c61f] rounded-md text-light-2 focus:outline-none focus:ring-2 focus:ring-[#f9c61f] flex items-center"
                >
                  <span>Previous Match IDs</span>
                  <svg class="w-5 h-5 ml-2 transform transition-transform duration-300 {showPreviousIds ? 'rotate-180' : ''}" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button
                  on:click={clearPreviousMatchIds}
                  class="px-3 py-2 bg-[#131315] text-red-500 rounded-md border border-red-500 hover:bg-red-500 hover:text-[#131315] transition-colors duration-300"
                >
                  Clear All
                </button>
              </div>
              {#if showPreviousIds}
                <div class="absolute z-10 w-full mt-1 bg-[#131315] border border-[#f9c61f] rounded-md shadow-lg max-h-32 overflow-y-auto">
                  {#each previousMatchIds as id}
                    <button
                      on:click={() => selectPreviousId(id)}
                      class="w-full text-light-2 text-left px-3 py-2 hover:bg-[#f9c61f] hover:text-[#131315] transition-colors duration-300"
                    >
                      {id}
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}
          {#if addMatchError}
            <p class="text-red-500 mb-4">{addMatchError}</p>
          {/if}
          <div class="flex justify-end space-x-2">
            <button
              on:click={() => showAddMatchModal = false}
              class="px-4 py-2 bg-[#131315] text-[#f9c61f] rounded-md border border-[#f9c61f] hover:bg-[#f9c61f] hover:text-[#131315] transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              on:click={addMatch}
              class="px-4 py-2 bg-[#f9c61f] text-[#131315] rounded-md hover:bg-[#e6b824] transition-colors duration-300"
              disabled={isAddingMatch}
            >
              {isAddingMatch ? 'Adding...' : 'Add Match'}
            </button>
          </div>
        </div>
      </div>
    {/if}
    <LoadingBar {isLoading} />
  <div class="matches space-y-2">
    {#each reactiveMatches as match (match.id)}
    <div
      class="bg-[#09090b] relative border-2 border-neutral-600/[0.15] border-solid rounded-lg mb-4"
      on:click={() => toggleMatchDetails(match)}
      on:keydown={(e) => e.key === 'Enter' && toggleMatchDetails(match)}
      tabindex="0"
      role="button"
    >
      <div class="grid grid-cols-[6px_1fr_auto] w-full max-w-[63.50rem] m-auto">
        <!-- Colored border based on match result -->
        <div class={`${match.result === 'Victory' ? 'bg-green-700' : match.result === 'Defeat' ? 'bg-red-700' : 'bg-neutral-700'}`}></div>
        
        <div class="relative flex p-4">
          <!-- Updated gradient effect -->
          <div class={`absolute inset-0 opacity-10 bg-gradient-to-r ${match.result === 'Victory' ? 'from-green-700' : match.result === 'Defeat' ? 'from-red-700' : 'from-neutral-700'} to-transparent`}></div>
          
          <div class="grid grid-cols-[auto_1fr_auto] gap-4 w-full relative z-10">
            <div class="cursor-pointer w-12 h-12">
              <img src={`/images/sponsor-logos/${match?.player_team?.players?.find(player => player.id === playerFullProfile?.id)?.sponsor_name}.png`} alt={match?.player_team?.players?.find(player => player.id === playerFullProfile?.id)?.sponsor_name} class="object-cover w-full h-full" />
            </div>
            <div class="cursor-pointer flex-grow">
              <h5 class="text-neutral-400 text-sm font-bold flex gap-[0.38rem] capitalize mb-2 items-center">
                <span class={`font-semibold ${match.result === 'Victory' ? 'text-green-500' : match.result === 'Defeat' ? 'text-red-500' : 'text-neutral-500'}`}>{match.result}</span>
                <span class="text-xs opacity-50">•</span>
                <span class={`font-medium text-xs ${match?.player_team?.players?.find(player => player.id === playerFullProfile?.id)?.ranked_rating_delta >= 0 ? 'text-green-500' : 'text-red-500'}`}>{match?.player_team?.players?.find(player => player.id === playerFullProfile?.id)?.ranked_rating_delta ? match?.player_team?.players?.find(player => player.id === playerFullProfile?.id)?.ranked_rating_delta > 0 ? `+${match?.player_team?.players?.find(player => player.id === playerFullProfile?.id)?.ranked_rating_delta}` : `${match?.player_team?.players?.find(player => player.id === playerFullProfile?.id)?.ranked_rating_delta}` : ''}</span>
                <span class="text-xs opacity-50">•</span>
                <span class="text-xs">{getMatchQueueName(match?.queue_name ?? '', match?.player_team?.used_team_rank ?? false)}</span>
                <span class="text-xs opacity-50">•</span>
                <span class="text-xs">{getDate(match.match_date)}</span>
              </h5>
              <div class="grid grid-cols-4 gap-2">
                <div class="flex flex-col gap-2">
                  <div class="text-sm font-semibold text-light-1">{match?.player_team?.rounds_won} - {match?.opponent_team?.rounds_won}</div>
                  <div class="text-neutral-400 text-xs">{getMapName(match.map)}</div>
                </div>
                <div class="flex flex-col gap-2">
                  <div class="text-sm font-semibold text-light-1">{match?.player_team?.players?.find(player => player.id === playerFullProfile?.id)?.kills} / {match?.player_team?.players?.find(player => player.id === playerFullProfile?.id)?.deaths} / {match?.player_team?.players?.find(player => player.id === playerFullProfile?.id)?.assists}</div>
                  <div class="text-neutral-400 text-xs">KDA</div>
                </div>
                <div class="flex flex-col gap-2">
                  <div class="text-sm font-semibold text-light-1">{(match?.player_team?.players?.find(player => player.id === playerFullProfile?.id)?.kills / match?.player_team?.rounds_played).toFixed(2) || '0.00'}</div>
                  <div class="text-neutral-400 text-xs">KPR</div>
                </div>
                <div class="flex flex-col gap-2">
                  <div class="text-sm font-semibold text-light-1">{(match?.player_team?.players?.find(player => player.id === playerFullProfile?.id)?.damage_dealt / match?.player_team?.rounds_played).toFixed(2) || '0.00'}</div>
                  <div class="text-neutral-400 text-xs">ADR</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="border-l-neutral-600/[0.15] border-l-2 flex-col justify-between text-gray-200/[0.5] hidden md:flex">
            <button on:click|stopPropagation={() => toggleMatchDetails(match)} class="cursor-pointer flex-grow justify-center pt-1.5 flex w-7 h-20 items-end">
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 320 512" fill="rgba(235, 236, 240, 0.5)" class="w-6 h-6 transition-transform duration-300 {match.expanded ? 'rotate-180' : ''}">
                  <path fill="rgba(235, 236, 240, 0.5)" d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/>
                </svg>
              </button>
        </div>

      </div>
      {#if match.expanded}
        <MatchDetails {match} />
      {/if}
    </div>
  {/each}
  </div>
{/if}

<style>
  /* Add any additional styles here */
</style>

  