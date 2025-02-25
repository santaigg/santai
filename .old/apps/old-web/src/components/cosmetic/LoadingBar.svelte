<script>
  export let isLoading = false;
  export let hasError = false;
  export let errorMessage = "Failed to retrieve latest matches. Please try again later.";
  export let loadingMessage = "Retrieving latest matches...";
</script>

<div class="my-5 flex flex-col items-center">
  {#if isLoading}
    <p class="text-[#f9c61f] text-sm font-bold mb-2 text-center">{loadingMessage}</p>
    <ul class="flex justify-center w-full max-w-[500px] h-[10px] p-0 list-none">
      <li class="w-[90px] h-[10px] mr-[10px] bg-[#f9c61f] bg-opacity-90 shadow-[inset_0px_0px_10px_2px_rgba(249,198,31,0.5),0px_0px_20px_rgba(249,198,31,0.5)]"></li>
      <li class="w-[90px] h-[10px] mr-[10px] bg-[#f9c61f] bg-opacity-90 shadow-[inset_0px_0px_10px_2px_rgba(249,198,31,0.5),0px_0px_20px_rgba(249,198,31,0.5)]"></li>
      <li class="w-[90px] h-[10px] mr-[10px] bg-[#f9c61f] bg-opacity-90 shadow-[inset_0px_0px_10px_2px_rgba(249,198,31,0.5),0px_0px_20px_rgba(249,198,31,0.5)] animate-pulse"></li>
      <li class="w-[90px] h-[10px] mr-[10px] shadow-[inset_0px_0px_10px_1px_rgba(249,198,31,0.4),0px_0px_20px_rgba(249,198,31,0.1)]"></li>
      <li class="w-[90px] h-[10px] shadow-[inset_0px_0px_10px_1px_rgba(249,198,31,0.4),0px_0px_20px_rgba(249,198,31,0.1)]"></li>
    </ul>
  {:else if hasError}
    <p class="text-red-500 text-sm font-bold mb-2 text-center">{errorMessage}</p>
    <ul class="flex justify-center w-full max-w-[500px] h-[10px] p-0 list-none">
      <li class="w-[90px] h-[10px] mr-[10px] bg-red-500 bg-opacity-90 shadow-[inset_0px_0px_10px_2px_rgba(239,68,68,0.5),0px_0px_20px_rgba(239,68,68,0.5)]"></li>
      <li class="w-[90px] h-[10px] mr-[10px] bg-red-500 bg-opacity-90 shadow-[inset_0px_0px_10px_2px_rgba(239,68,68,0.5),0px_0px_20px_rgba(239,68,68,0.5)]"></li>
      <li class="w-[90px] h-[10px] mr-[10px] bg-red-500 bg-opacity-90 shadow-[inset_0px_0px_10px_2px_rgba(239,68,68,0.5),0px_0px_20px_rgba(239,68,68,0.5)]"></li>
      <li class="w-[90px] h-[10px] mr-[10px] shadow-[inset_0px_0px_10px_1px_rgba(239,68,68,0.4),0px_0px_20px_rgba(239,68,68,0.1)]"></li>
      <li class="w-[90px] h-[10px] shadow-[inset_0px_0px_10px_1px_rgba(239,68,68,0.4),0px_0px_20px_rgba(239,68,68,0.1)]"></li>
    </ul>
  {/if}
</div>

<style>
  @keyframes pulse {
    0% {
      background-color: rgba(249, 198, 31, 1);
      box-shadow: inset 0px 0px 10px 2px rgba(249, 198, 31, 0.5),
                  0px 0px 40px 2px rgba(249, 198, 31, 1);
    }
    100% {
      background-color: rgba(249, 198, 31, 0);
      box-shadow: inset 0px 0px 10px 2px rgba(249, 198, 31, 0.5),
                  0px 0px 30px 2px rgba(249, 198, 31, 0.3);
    }
  }

  .animate-pulse {
    animation: pulse 1s alternate infinite;
  }
</style>