import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "cat-black": "#1a1a1a",
        "cat-purple": {
          DEFAULT: "#534AB7",
          light: "#EEEDFE",
          dark: "#3C3489",
        },
        "cat-green": {
          DEFAULT: "#0F6E56",
          light: "#E1F5EE",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      screens: {
        xs: "390px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
      },
      maxWidth: {
        mobile: "430px",
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom)",
        "nav-height": "52px",
      },
    },
  },
  plugins: [],
};

export default config;
