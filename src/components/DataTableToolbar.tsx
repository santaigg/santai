"use client"

import { useEffect, useState } from "react";
import type { Table } from "@tanstack/react-table";
import { CheckIcon, PlusCircle } from "lucide-react";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type LeaderboardId, leaderboards } from "@/utils/leaderboards";

type Props<TData> = {
  leaderboardVersion: LeaderboardId;
  table: Table<TData>;
};

export default function <TData>({ leaderboardVersion, table }: Props<TData>) {
  const [didMount, setDidMount] = useState(false);
  const [leaderboardParam, setLeaderboardParam] = useState<string | null>(null);
  // Just used for the useEffect to trigger on version change
  // Workaround because DataTable has a key on it, which always remounts this component, causing didMount to always be false
  useEffect(() => {
    if (typeof window !== "undefined") {
      setLeaderboardParam(new URLSearchParams(window.location.search).get("leaderboard"));
    }
  }, []);


  const rankRatingColumn = leaderboards[leaderboardVersion].disableLeagueFilter
    ? null
    : table.getColumn("rankRating");
  const uniqueRanks = [
    ...new Set(
      Array.from(rankRatingColumn?.getFacetedUniqueValues()?.keys() ?? []).map(
        ({ league: rank }) => rank,
      ),
    ),
  ];

  const selectedValues = new Set(rankRatingColumn?.getFilterValue() as string[]);

  // Setting didMount to true upon mounting
  useEffect(() => {
    setDidMount(true);
  }, []);

  // Reset fame filter on version. Only done after first render since we don't want to reset the filter on initial load
  useEffect(() => {
    if (!didMount) return;
    selectedValues.clear();
    rankRatingColumn?.setFilterValue(selectedValues);
  }, [leaderboardParam]);

  // Save fame filter in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    selectedValues.size
      ? searchParams.set("ranks", Array.from(selectedValues).join(","))
      : searchParams.delete("ranks");

    window.history.replaceState(
      null,
      "",
      searchParams.size > 0 ? `?${searchParams.toString()}` : "/leaderboard",
    );
  }, [selectedValues]);

  return (
    <div className="flex flex-wrap gap-2">
      <Input
        className="max-w-xs select-none data-[active=true]:border-black/50 dark:data-[active=true]:border-white/50"
        data-active={!!table.getColumn("name")?.getFilterValue()}
        placeholder="Search Names"
        maxLength={20}
        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
        onChange={event => {
          table.getColumn("name")?.setFilterValue(event.target.value);
          const searchParams = new URLSearchParams(window.location.search);

          event.target.value.length
            ? searchParams.set("name", event.target.value)
            : searchParams.delete("name");
          window.history.replaceState(
            null,
            "",
            searchParams.size > 0 ? `?${searchParams.toString()}` : "/leaderboard",
          );
        }}
      />

      {!leaderboards[leaderboardVersion].disableLeagueFilter && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-10 select-none border-dashed data-[active=true]:border-black/50 dark:data-[active=true]:border-white/50"
              data-active={selectedValues.size > 0}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Filter ranks
              {selectedValues.size > 0 && (
                <>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-medium md:hidden"
                  >
                    {selectedValues.size}
                  </Badge>
  
                  <div className="hidden gap-1 font-medium md:flex">
                    {selectedValues.size > 2 ? (
                      <Badge
                        variant="secondary"
                        className="rounded-sm px-1 font-medium"
                      >
                        {selectedValues.size} selected
                      </Badge>
                    ) : (
                      Array.from(selectedValues).map(value => (
                        <Badge
                          key={value}
                          variant="secondary"
                          className="rounded-sm px-1 font-medium"
                        >
                          {value}
                        </Badge>
                      ))
                    )}
                  </div>
                </>
              )}
            </Button>
          </PopoverTrigger>
  
          <PopoverContent className="w-[200px] p-0 font-saira" align="start">
            <Command>
              <CommandInput placeholder="Filter..." />
              <CommandList>
                <CommandEmpty>No league found.</CommandEmpty>
  
                <CommandGroup>
                  {uniqueRanks.map(league => {
                    const isSelected = selectedValues.has(league);
  
                    // TODO: Take current filters into account?
                    const amountOfPlayersInLeague = Array.from(
                      rankRatingColumn?.getFacetedUniqueValues().keys() ?? [],
                    ).filter(({ league: l }) => l === league).length;
  
                    return (
                      <CommandItem
                        // https://github.com/shadcn-ui/ui/pull/1522
                        value={league}
                        key={league}
                        onSelect={() => {
                          isSelected
                            ? selectedValues.delete(league)
                            : selectedValues.add(league);
  
                          const filterValues = Array.from(selectedValues);
                          rankRatingColumn?.setFilterValue(filterValues);
                        }}
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50 [&_svg]:invisible",
                          )}
                        >
                          <CheckIcon className={cn("h-4 w-4")} />
                        </div>
  
                        <div className="flex w-full items-center justify-between">
                          <span>{league}</span>
                          <Badge
                            variant="secondary"
                            className="rounded-sm px-1 text-xs"
                          >
                            {amountOfPlayersInLeague.toLocaleString("en")}
                          </Badge>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
  
                {selectedValues.size > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => rankRatingColumn?.setFilterValue(undefined)}
                        className="justify-center text-center"
                      >
                        Clear filters
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}