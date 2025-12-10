/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // WAJIB: Agar style dark mode berfungsi
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sui: {
          dark: "#0D1117", // Background Utama (Dark)
          card: "#161B22", // Background Card
          light: "#F6F8FA", // Background Light (Fallback)
          blue: "#4DA2FF", // Warna Brand
          cyan: "#76CBF1", // Aksen
          purple: "#A855F7", // Aksen
          orange: "#FF7920", // Aksen
          green: "#22C55E", // Status Open / Vote Yes
          red: "#EF4444", // Status Closed / Vote No (DITAMBAHKAN)
          text: "#E6EDF3", // Warna Teks Utama
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(to right, #21262d 1px, transparent 1px), linear-gradient(to bottom, #21262d 1px, transparent 1px)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
      },
    },
  },
  plugins: [],
};
