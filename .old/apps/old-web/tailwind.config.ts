import type { Config } from "tailwindcss";

export default {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		extend: {
			colors: {
				dark: {
					0: "hsl(var(--dark-0) / <alpha-value>)",
					1: "hsl(var(--dark-1) / <alpha-value>)",
					2: "hsl(var(--dark-2) / <alpha-value>)",
				},

				accent: "hsl(var(--accent) / <alpha-value>)",

				light: {
					0: "hsl(var(--light-0) / <alpha-value>)",
					1: "hsl(var(--light-1) / <alpha-value>)",
					2: "hsl(var(--light-2) / <alpha-value>)",
				},

				warning: "hsl(var(--warning) / <alpha-value>)",
				destructive: "hsl(var(--destructive) / <alpha-value>)",
			},

			fontFamily: {
				planetkosmos: "Planet Kosmos",
				dharmagothic: "Dharma Gothic",
				inter: "Inter",
			},

			skew: {
				30: "30deg",
			},

			borderRadius: {
				small: "var(--radius-small)",
				base: "var(--radius-base)",
				large: "var(--radius-large)",
			},

			spacing: {
				small: "var(--spacing-small)",
				base: "var(--spacing-base)",
				large: "var(--spacing-large)",
			},

			transitionDuration: {
				quick: "var(--duration-quick)",
				base: "var(--duration-base)",
			},
		},
	},
	plugins: [],
} satisfies Config;
