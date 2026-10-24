/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        verdant: {
          bg: "#F3F0E8",         // warm off-white
          cardBg: "#EAE5DA",     // warm balanced beige card surface
          dark: "#141512",       // rich grounded charcoal
          darkSecondary: "#21221D", // secondary dark
          beige: "#D5CBB8",      // warm beige
          sand: "#A89679",       // sand
          olive: "#646853",      // balanced olive
          forest: "#344236",     // deeper, richer forest tone
          textPrimary: "#151613",// grounded deep dark text
          textSecondary: "#4A4C43", // balanced high-legibility secondary text
          border: "#D2CCC0",     // crisp balanced borders
          borderDark: "#2E3029", // borders on dark sections
          darkText: "#F3F0E8",   // text on dark sections
          alertWatch: "#7D8469", // subtle earthy alert
          alertMod: "#B0925F",   // warm ochre
          alertHigh: "#9E5840",  // terracotta / warm rust
          alertCrit: "#8A3329",  // deep earthy crimson
        }
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'monospace'],
      },
      fontWeight: {
        normal: '500', // Boost base normal weight ~50% bolder
        medium: '600',
        semibold: '700',
        bold: '800',
        extrabold: '900',
      },
      letterSpacing: {
        widest: '0.18em',
        ultra: '0.24em',
      }
    },
  },
  plugins: [],
}
