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
        background: "var(--background)",
        foreground: "var(--foreground)",
        "aws-orange": "#FF9900",
        "aws-orange-dark": "#e8890a",
        "aws-navy": "#0f1923",
        "aws-navy-light": "#161e2d",
        "aws-navy-mid": "#1a2a3a",
        "aws-blue": "#0073bb",
        "aws-blue-dark": "#005b94",
      },
    },
  },
  plugins: [],
};
export default config;
