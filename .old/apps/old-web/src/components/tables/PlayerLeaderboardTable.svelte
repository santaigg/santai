<script lang="ts">
  import { writable } from "svelte/store";
  import { onMount } from "svelte";
  import { createSvelteTable, getCoreRowModel, getFilteredRowModel } from "@tanstack/svelte-table";
  import type { ColumnDef, TableOptions } from "@tanstack/svelte-table";
  import SearchBar from "../navigation/SearchBar.svelte";
  import type PlayerStats from "../../utils/types/playerStats";

  export let playerRows: PlayerStats[] = [];
  let displayedPlayerRows: PlayerStats[] = [];

  onMount(() => {
    // const handleInfiniteScroll = () => {
    //   const endOfPage = window.innerHeight + Math.round(window.scrollY) >= document.body.offsetHeight;

    //   if (endOfPage) {
    //     for (let i = 0; i < 20; i++) {
    //       displayedPlayerRows = [...displayedPlayerRows, playerRows[0]];
    //       playerRows.shift();
    //     }
    //   }
    // };

    // handleInfiniteScroll();
    // window.addEventListener("scroll", handleInfiniteScroll);
    displayedPlayerRows = playerRows;
  });

  const defaultColumns: ColumnDef<PlayerStats>[] = [
    {
      accessorKey: "placement",
      header: "#",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "username",
      header: "USERNAME",
      cell: (info) => info.getValue(),
      enableGlobalFilter: true,
    },
    {
      accessorKey: "soloRank",
      header: "RANK",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "rating",
      header: "RANK RATING",
      cell: (info) => info.getValue(),
    },
  ];

  $: options = writable<TableOptions<PlayerStats>>({
    data: displayedPlayerRows,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  $: table = createSvelteTable(options);

  $: searchFilter = "";
  const handleKeyUp = (e: any) => {
    $table.setGlobalFilter(String(e?.target?.value));
  };
</script>

<div>
  <div class="sticky top-[3.1rem] w-full mb-base bg-dark-2">
    <SearchBar className="w-full m-base rounded-lg text-light-0 bg-dark-1" searchValueBind={searchFilter} handleKeyUpBind={handleKeyUp} />
  </div>

  <table class="w-full border border-dark-2 bg-dark-1">
    <thead class="sticky top-28 bg-dark-2">
      {#each $table.getHeaderGroups() as headerGroup}
        <tr>
          {#each headerGroup.headers as header}
            <th class="p-base text-3xl text-light-0 font-dharmagothic font-light text-left">
              {header.column.columnDef.header?.toString().toUpperCase()}
            </th>
          {/each}
        </tr>
      {/each}
    </thead>

    <tbody>
      {#each $table.getRowModel().rows as row}
        <tr
          class="group/row border border-dark-2 cursor-pointer text-light-2 outline outline-0 outline-offset-4 outline-accent hover:bg-accent hover:text-black hover:outline-2 duration-base"
          on:click={() => (location.href = "/players/" + row.original.playerId)}
        >
          {#each row.getVisibleCells() as cell}
            <td class="p-base">
              {cell.getValue()}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
