import { Elysia } from "elysia";
import { SponsorService } from "./sponsor.service.ts";

// Sponsor controller with routes
export const sponsorController = new Elysia()
  .get(
    "/stats",
    async () => {
      const sponsorService = SponsorService.getInstance();
      return await sponsorService.getGlobalSponsorStats();
    },
    {
      detail: {
        summary: "Get Global Sponsor Statistics",
        description: "Get global statistics for all sponsors including usage, wins, losses, kills, deaths, etc.",
        tags: ["Sponsor"]
      }
    }
  ); 