// app/layout.js
import './styles/globals.css';

export const metadata = {
  title: 'Pokédex - Official Pokémon Database',
  description: 'Explore the world of Pokémon with our comprehensive Pokédex featuring detailed stats, evolution chains, and more.',
  keywords: 'pokemon, pokedex, pokemon database, pokemon stats, pokemon evolution',
  authors: [{ name: 'Pokédex Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#DC0A2D" />
        <link rel="icon" href="/favicon.ico" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var darkMode = localStorage.getItem('pokemonDarkMode');
                  if (darkMode === 'true' || (!darkMode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.body.classList.add('dark-mode');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
