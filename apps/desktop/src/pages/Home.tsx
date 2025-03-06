import { useState } from "react";
import {
  SeasonStats,
  SponsorStats,
  MapStats,
} from "../utils/types/wavescan.types";
import { playerProfile } from "../utils/types/wavescan.types";
import Extrusion, { CornerLocation } from "../components/cosmetic/Extrusion";

import { RankImage } from "../components/cosmetic/RankImageFromString";
import getSoloRankFromNumber from "../utils/types/rank";
import { SponsorImage } from "../components/cosmetic/SponsorImageFromString";
import {
  MapImage,
  getMapName,
} from "../components/cosmetic/MapImageFromString";

function OverviewPrimaryItem({ title, data }: { title: string; data: string }) {
  return (
    <div className="bg-secondary px-4 py-2 flex flex-col w-full corner-clip">
      <p className="text-base text-accent">{title}</p>
      <p className="text-xl text-secondary-foreground">{data}</p>
    </div>
  );
}

function OverviewSecondaryItem({
  title,
  data,
}: {
  title: string;
  data: string;
}) {
  return (
    <div className="flex flex-col w-full py-4">
      <p className="text-sm text-primary-foreground">{title}</p>
      <p className="text-secondary-foreground">{data}</p>
    </div>
  );
}

const getPeakStats = (seasons: Record<string, SeasonStats>) => {
  const [peakRankRating, setPeakRankRating] = useState<number>(0);
  const [peakRankID, setPeakRankID] = useState<string>("");
  const [peakSeason, setPeakSeason] = useState<string>("");
  const [firstPass, setFirstPass] = useState<boolean>(true);

  for (var key in seasons) {
    const season = seasons[key];
    if (peakRankRating === 0 && firstPass) {
      // Updates values if top_rank_rating is 0, to prevent 'Unkown Season' from displaying on the peak rank card
      setPeakRankRating(season.top_rank_rating);
      setPeakRankID(season.top_rank_id);
      setPeakSeason(season.season);
      setFirstPass(false);
    } else if (season.top_rank_rating > peakRankRating) {
      setPeakRankRating(season.top_rank_rating);
      setPeakRankID(season.top_rank_id);
      setPeakSeason(season.season);
    }
  }

  return [peakRankID, peakRankRating, peakSeason];
};

const formatSeasonTitle = (season: string) => {
  switch (season) {
    case "Beta": {
      return "Beta";
    }
    case "2024-S0": {
      return "Season 0";
    }
    case "2025-S1": {
      return "Season 1";
    }
    default: {
      return "Unknown Season";
    }
  }
};

function SponsorInfo({ sponsor }: { sponsor: SponsorStats }) {
  return (
    <div className="w-full flex flex-col">
      <div className="flex -ml-2">
        <SponsorImage
          className="w-14 h-auto opacity-80"
          sponsor={String(sponsor?.sponsor_name)}
        />
        <div className="flex flex-col items-start justify-center">
          <p className="text-xl text-accent">{sponsor?.sponsor_name}</p>
          <p className="text-sm text-primary-foreground">223W - 20L</p>
        </div>
      </div>
      <div className="flex w-full">
        <OverviewSecondaryItem
          title="Win %"
          data={String(sponsor?.average_win_percentage.toFixed(2))}
        />
        <OverviewSecondaryItem
          title="K/D"
          data={String(
            (sponsor?.total_kills! / sponsor?.total_deaths!).toFixed(2)
          )}
        />
        <OverviewSecondaryItem
          title="ADR"
          data={String(sponsor?.average_damage_per_round.toFixed(2))}
        />
        <OverviewSecondaryItem
          title="KPR"
          data={String(sponsor?.average_kills_per_round.toFixed(2))}
        />
      </div>
    </div>
  );
}

function MapInfo({ map }: { map: MapStats }) {
  return (
    <div className="w-full flex flex-col">
      <div className="flex">
        <MapImage className="size-12 rounded mr-2" map={String(map.map)} />
        <div className="flex flex-col items-start justify-center">
          <p className="text-xl text-accent">{getMapName(map.map)}</p>
          <p className="text-sm text-primary-foreground">223W - 20L</p>
        </div>
      </div>
      <div className="flex w-full">
        <OverviewSecondaryItem
          title="Win %"
          data={String(map?.average_win_percentage.toFixed(2))}
        />
        <OverviewSecondaryItem
          title="K/D"
          data={String((map?.total_kills! / map?.total_deaths!).toFixed(2))}
        />
        <OverviewSecondaryItem
          title="ADR"
          data={String(map?.average_damage_per_round.toFixed(2))}
        />
        <OverviewSecondaryItem
          title="KPR"
          data={String(map?.average_kills_per_round.toFixed(2))}
        />
      </div>
    </div>
  );
}
export function Home() {
  const seasonStatsSelected =
    playerProfile.extended_stats?.season_stats["2025-S1"];

  const [peakRankID, peakRankRating, peakSeason] = getPeakStats(
    playerProfile.extended_stats?.season_stats!
  );

  return (
    <>
      <div className="flex items-start justify-start space-x-4 w-full">
        <div className="w-1/6 shrink-0 flex flex-col">
          {/* PFP & User */}
          <div
            className="w-full overflow-hidden aspect-[3/2]"
            data-augmented-ui="tr-clip-x br-clip l-clip-y"
            style={
              {
                "--aug-l": "10px",
                "--aug-tr": "10px",
                "--aug-l-extend1": "100px",
                "--aug-tr-inset2": "140px",
              } as React.CSSProperties
            }
          >
            <img
              src="https://avatars.fastly.steamstatic.com/e61477848e1bc206ffcbd99585195c12d50aaf02_full.jpg"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <p className="mt-2 text-xl">{playerProfile.name}</p>
          {/* Rank */}
          <div className="w-full flex-col mt-4">
            <div className="w-full py-4 px-4 bg-primary flex flex-col">
              <p className="text-lg text-primary-foreground">Current Rank</p>
              <div className="flex space-x-4 mt-2.5">
                <RankImage
                  className="size-14 shrink-0"
                  rank={getSoloRankFromNumber(
                    playerProfile.stats.current_solo_rank!
                  )}
                />
                <div className="flex-col flex justify-center ">
                  <h3
                    className={`font-medium ${
                      playerProfile.stats.current_solo_rank == 29
                        ? "bg-gradient-to-r from-amber-200 to-yellow-500 inline-block bg-clip-text text-transparent"
                        : ""
                    }`}
                  >
                    {getSoloRankFromNumber(
                      playerProfile.stats.current_solo_rank!
                    )}
                  </h3>
                  <p>{playerProfile.stats.rank_rating} RR</p>
                </div>
              </div>
            </div>
            <div className="w-full py-4 px-4 bg-input/80 flex flex-col">
              <p className="text-lg text-primary-foreground">Peak Rank</p>
              <div className="flex gap-x-4 mt-2.5">
                <RankImage
                  className="size-14 min-w-14 min-h-14"
                  rank={getSoloRankFromNumber(Number(peakRankID))}
                />
                <div className="flex-col flex justify-center ">
                  <h3>{getSoloRankFromNumber(Number(peakRankID))}</h3>
                  <p>
                    {peakRankRating} RR
                    <span className="text-xs opacity-50 my-auto mx-1">•</span>
                    {formatSeasonTitle(String(peakSeason))}
                  </p>
                </div>
              </div>
            </div>
            <Extrusion
              className="min-w-[45%] border-input/80"
              cornerLocation={CornerLocation.BottomRight}
            />
          </div>
        </div>
        <div className="w-full flex flex-col space-y-4 h-[calc(100vh-8.5rem)]">
          {/* Szn Overview */}
          <div className="flex-col w-full">
            <Extrusion
              className="min-w-[15%] border-primary"
              cornerLocation={CornerLocation.TopRight}
            />
            <div className="w-full py-4 px-4 bg-primary flex flex-col">
              <div className="flex justify-between items-center mb-4 pt-2">
                <h1 className="text-xl">Season 1 // Ranked</h1>
                <div className="flex justify-end items-center space-x-2">
                  <p>Ranked</p>
                  <p>Season 1</p>
                </div>
              </div>
              <div className="flex flex-nowrap justify-start items-start space-x-4 mb-2">
                <OverviewPrimaryItem
                  title="Win %"
                  data={`${String(seasonStatsSelected?.average_win_percentage.toFixed(2))}%`}
                />
                <OverviewPrimaryItem
                  title="K/D"
                  data={String(
                    (
                      seasonStatsSelected?.total_kills! /
                      seasonStatsSelected?.total_deaths!
                    ).toFixed(2)
                  )}
                />
                <OverviewPrimaryItem
                  title="ADR"
                  data={`${String(seasonStatsSelected?.average_damage_per_round.toFixed(2))}%`}
                />
                <OverviewPrimaryItem
                  title="KPR"
                  data={`${String(seasonStatsSelected?.average_kills_per_round.toFixed(2))}%`}
                />
              </div>
              <div className="flex flex-nowrap justify-start space-x-4 items-start">
                <OverviewSecondaryItem
                  title="Wins"
                  data={String(seasonStatsSelected?.total_wins)}
                />
                <OverviewSecondaryItem
                  title="Losses"
                  data={String(seasonStatsSelected?.total_losses)}
                />
                <OverviewSecondaryItem
                  title="Kills"
                  data={String(seasonStatsSelected?.total_kills)}
                />
                <OverviewSecondaryItem
                  title="Deaths"
                  data={String(seasonStatsSelected?.total_deaths)}
                />
                <OverviewSecondaryItem
                  title="Assists"
                  data={String(seasonStatsSelected?.total_assists)}
                />
                <OverviewSecondaryItem
                  title="Damage"
                  data={String(seasonStatsSelected?.total_damage_dealt)}
                />
                <OverviewSecondaryItem
                  title="Rounds"
                  data={String(seasonStatsSelected?.total_rounds_played)}
                />
              </div>
            </div>
          </div>
          {/* Sponsor & Map prev */}
          <div className="w-full flex-col">
            <div className="w-full py-4 px-4 bg-primary flex">
              <div className="flex w-1/2 flex-col">
                <p className="text-sm mb-1 text-primary-foreground">
                  Top Sponsor
                </p>
                {/* 1 */}
                <SponsorInfo
                  sponsor={playerProfile.extended_stats?.sponsor_stats.Sponsor!}
                />
              </div>
              <div className="flex w-1/2 flex-col">
                <p className="text-sm mb-2 text-primary-foreground">Top Maps</p>
                {/* 1 */}
                <MapInfo
                  map={playerProfile.extended_stats?.map_stats.commons_p!}
                />
              </div>
            </div>
            <Extrusion
              className="min-w-[25%] border-primary"
              cornerLocation={CornerLocation.BottomRight}
            />
          </div>
          {/* Last 20 */}
          <div className="w-full flex-col">
            <Extrusion
              className="min-w-[25%] border-primary float-right"
              cornerLocation={CornerLocation.TopLeft}
            />
            <div className="w-full py-4 px-4 bg-primary flex flex-col h-full">
              <div className="flex">
                <OverviewSecondaryItem
                  title="Last 20 Matches"
                  data={String(
                    playerProfile.extended_stats?.last_20_matches_avg_stats
                      ?.total_rounds_played
                  )}
                />
                <OverviewSecondaryItem
                  title="Win %"
                  data={String(
                    playerProfile.extended_stats?.last_20_matches_avg_stats
                      ?.average_win_percentage
                  )}
                />
                <OverviewSecondaryItem
                  title="K/D"
                  data={String(
                    playerProfile.extended_stats?.last_20_matches_avg_stats
                      ?.total_deaths
                  )}
                />
                <OverviewSecondaryItem
                  title="ADR"
                  data={String(
                    playerProfile.extended_stats?.last_20_matches_avg_stats
                      ?.average_damage_per_round
                  )}
                />
              </div>
              <div className="relative w-full h-1 rounded overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-red-500"></div>
                <div
                  style={{
                    width: `${playerProfile.extended_stats?.last_20_matches_avg_stats.average_win_percentage.toFixed(0)}%`,
                  }}
                  className="absolute top-0 left-0 h-full bg-green-500"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

{
  /* <div className="flex flex-col items-start justify-start mt-4">
  <div className="w-full h-48 flex flex-col justify-start items-start"></div>

  <div className="w-full h-48">
    <p className="text-sm">Top Map</p>
  </div>
</div>; */
}
