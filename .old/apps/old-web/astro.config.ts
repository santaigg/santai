// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import svelte from "@astrojs/svelte";

import react from "@astrojs/react";

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
	integrations: [tailwind(), svelte(), react()],
	output: "hybrid",

	adapter: vercel({
		isr: {
			expiration: 60 * 15, // 15 minutes
			exclude: ["/players/[...slug]"]
		},
		// webAnalytics: { enabled: true }
	}),
	redirects: {
		"/leaderboard": "/players",
	},
});
