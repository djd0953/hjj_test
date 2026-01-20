module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,css}',
    './components/**/*.{js,ts,jsx,tsx,css}',
    './styles/**/*.{css}'
  ],
  theme: {
    extend: {
      colors: {
        bg: "#f4f6f8",
        panel: "#ffffff",
        ink: "#1c222b",
        muted: "#6a7380",
        accent: "#2f6f76",
        "accent-strong": "#23565c",
        line: "#d9e0e6",
      },
      boxShadow: {
        panel: "0 24px 60px rgba(24, 32, 43, 0.12)",
      },
      spacing: {
        sidebar: "240px",
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', '"Segoe UI"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
