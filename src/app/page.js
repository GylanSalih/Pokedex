// app/page.js oder pages/index.js (je nach Next.js Version)
import Pokedex from './components/Pokedex/Pokedex';

export default function Home() {
  return (
    <main>
      <Pokedex />
    </main>
  );
}