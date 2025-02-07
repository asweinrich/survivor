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
      strokeWidth: {
        '1': '1',
        '2': '2',
        '3': '3',
        '4': '4',
        '5': '5',
      },
      scale: {
        80: '0.8',
        85: '0.85',
        70: '0.7',
      },
      dropShadow: {
        'custom': '1px 1px 0px rgba(0, 0, 0, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
