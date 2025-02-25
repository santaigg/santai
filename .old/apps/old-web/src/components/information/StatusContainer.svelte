<script>
  import { onMount } from 'svelte';
  import LoadingBar from '../cosmetic/LoadingBar.svelte';

  export let playerId;
  export let onDumpInitiated; // New prop to receive the event handler

  let dumpStatus = { in_progress: false, initially_dumped: false, queue_position: null };

  async function checkDumpStatus() {
    try {
      const response = await fetch(`https://wavescan-production.up.railway.app/api/v1/player/${playerId}/dump_status`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      dumpStatus = await response.json();
    } catch (error) {
      console.error("Error checking dump status:", error);
    }
  }

  async function initiateDump() {
    try {
      const response = await fetch(`https://wavescan-production.up.railway.app/api/v1/player/${playerId}/dump`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const dumpData = await response.json();
      dumpStatus = { in_progress: true, queue_position: dumpData.queue_position };
      startPeriodicStatusCheck();
    } catch (error) {
      console.error("Error initiating dump:", error);
    }
  }

  let statusCheckInterval;

  function startPeriodicStatusCheck() {
    if (statusCheckInterval) clearInterval(statusCheckInterval);
    statusCheckInterval = setInterval(checkDumpStatus, 10000);
  }

  function stopPeriodicStatusCheck() {
    if (statusCheckInterval) clearInterval(statusCheckInterval);
  }

  $: if (dumpStatus.in_progress) {
    startPeriodicStatusCheck();
  } else {
    stopPeriodicStatusCheck();
  }

  onMount(() => {
    checkDumpStatus();
    return stopPeriodicStatusCheck;
  });

  // New function to handle dump initiated event
  function handleDumpInitiated() {
    checkDumpStatus();
    startPeriodicStatusCheck();
  }

  // Assign the handler to the prop
  $: onDumpInitiated = handleDumpInitiated;
</script>

<div id="status-container" class="w-full">
  {#if dumpStatus.in_progress}
    <LoadingBar isLoading={true} loadingMessage={dumpStatus.queue_position !== null && dumpStatus.queue_position > 0 ? `Processing your matches soon... Queue position: ${dumpStatus.queue_position - 1}` : "Processing matches... This may take a while."} />
  {:else if !dumpStatus.initially_dumped}
    <div class="flex justify-center items-center min-h-[200px]">
      <button on:click={initiateDump} class="px-6 py-3 bg-[#f9c61f] text-[#131315] font-bold text-lg rounded-full hover:bg-[#e6b824] transition-colors duration-300">
        Start Tracking Matches
      </button>
    </div>
  {/if}
</div>