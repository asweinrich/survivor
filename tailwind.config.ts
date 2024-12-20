import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        lostIsland: ['LostIsland', 'sans-serif'],
        survivor: ['Survivor', 'sans-serif'], // Add your font
        inter: ['Inter', 'sans-serif'], // Add Inter with fallback
      },
    },
  },
  plugins: [],
} satisfies Config;
