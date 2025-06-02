/** @type {import('tailwindcss').Config} */
module.exports = {
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
        primary: "var(--primary)", // Benutzerdefinierte Farben
        secondary: "var(--secondary)", // Benutzerdefinierte Farben
        accent: "var(--accent)", // Benutzerdefinierte Farben
        danger: "#e57373", // Rote Farbe für Fehler
        success: "#81c784", // Grüne Farbe für Erfolg
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Neue Standardschriftart für Text
        serif: ['Georgia', 'serif'], // Eine Serifenschrift hinzufügen
      },
      fontSize: {
        xxs: '0.625rem', // Kleinere Schriftgröße
        '4xl': '2.25rem', // Größere Schriftgröße
      },
      spacing: {
        '128': '32rem', // Benutzerdefinierte Abstände
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem', // Größere Eckenradien
      },
      boxShadow: {
        'xl': '0 10px 15px rgba(0, 0, 0, 0.1)', // Größere Schatten
      },
      screens: {
        '3xl': '1600px', // Benutzerdefinierter Breakpoint
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Plugin für Forms
    require('@tailwindcss/typography'), // Plugin für typografische Erweiterungen
    require('@tailwindcss/aspect-ratio'), // Plugin für das Arbeiten mit Bild-Verhältnissen
  ],
};