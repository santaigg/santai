<script lang="ts">
import { cn } from "../../utils/cn";
export let className: string = "";
export let searchValueBind: any | undefined;
export let handleKeyUpBind: any | undefined;
</script>

<div class="flex flew-row w-full gap-small">
  <input
    class={cn("w-full h-fit p-base overflow-clip rounded-base bg-light-0", className)}
    type="text"
    placeholder="Search..."
    bind:value={searchValueBind}
    on:keyup={handleKeyUpBind}
  />
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
