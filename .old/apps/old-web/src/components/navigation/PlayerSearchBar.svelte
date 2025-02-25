<script lang="ts">
    import { cn } from "../../utils/cn";
    import debounce from "lodash-es/debounce";
    import { onMount } from "svelte";
    
    export let className: string = "";
    
    let searchValue = "";
    let searchResults: Array<{ id: string, name: string }> = [];
    let isLoading = false;
    let showDropdown = false;
  
    function isSteam64Id(input: string): boolean {
      // Steam64 IDs are 17 digits long and start with "765611"
      return /^765611\d{11}$/.test(input);
    }
    
    const searchPlayers = debounce(async (query: string) => {
      console.log("Searching for", query);
      if (query.length < 3) {
        searchResults = [];
        showDropdown = false;
        return;
      }
    
      isLoading = true;
      try {
        let response;
        if (isSteam64Id(query)) {
          // If it's a Steam64 ID, use the steam endpoint
          response = await fetch(`https://wavescan-production.up.railway.app/api/v1/player/steam/${encodeURIComponent(query)}`);
          if (!response.ok) throw new Error('Failed to fetch player by Steam ID');
          const playerData = await response.json() as { success: boolean, player_id: string, error?: string };
  
          if (!playerData.success) {
            // If the player is not found, return an empty array
            searchResults = [];
            return;
          }
  
          // Assuming the API returns a single player object
          searchResults = [{ id: playerData.player_id, name: playerData.player_id }];
        } else {
          // Otherwise, use the player search endpoint
          response = await fetch(`https://wavescan-production.up.railway.app/api/v1/search/player/${encodeURIComponent(query)}`);
          if (!response.ok) throw new Error('Failed to fetch search results');
          const { data } = await response.json() as { data: Array<{ id: string, display_name: string }> };
          searchResults = data?.map((result) => ({ id: result.id, name: result.display_name })) ?? [];
        }
        showDropdown = searchResults.length > 0;
      } catch (error) {
        console.error('Error searching players:', error);
        searchResults = [];
      } finally {
        isLoading = false;
      }
    }, 300);
    
    function handleInput(event: Event) {
      console.log("handleInput called");
      const target = event.target as HTMLInputElement;
      searchValue = target.value;
      searchPlayers(searchValue);
    }
    
    function handleSelectPlayer(playerId: string, playerName: string) {
      searchValue = playerName;
      showDropdown = false;
      window.location.href = `/players/${playerId}`;
    }
    
    function handleClickOutside(event: MouseEvent) {
      const searchContainer = document.querySelector('.search-container');
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        showDropdown = false;
      }
    }
    
    onMount(() => {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    });
  </script>
  
  <div class="search-container relative w-full">
    <input
      class={cn("w-full h-fit p-base overflow-clip rounded-base bg-light-0", className)}
      type="text"
      placeholder="Search players or enter Steam64 ID..."
      bind:value={searchValue}
      on:input={handleInput}
    />
    {#if isLoading}
      <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
        <svg class="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    {/if}
    {#if showDropdown}
      <div class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
        {#each searchResults as result}
          <div 
            class="p-2 hover:bg-gray-100 cursor-pointer"
            on:click={() => handleSelectPlayer(result.id, result.name)}
          >
            {result.name}
          </div>
        {/each}
      </div>
    {/if}
  </div>
  
  <!-- <button class="flex w-20 md:w-32 rounded-base rounded-tl-large bg-accent [&>*]:skew-x-30">
      <svg class="m-auto" width="24px" height="24px" viewBox="0 0 24 24" stroke-width="2.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000">
        <path d="M4 17 1 20" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>
        <path
          d="M3 11C3 15.4183 6.58172 19 11 19C13.213 19 15.2161 18.1015 16.6644 16.6493C18.1077 15.2022 19 13.2053 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11Z"
          stroke="#000000"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </svg>
    </button> -->
  