'use client';

// app/page.js
import dynamic from 'next/dynamic';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';

// Dynamically import Pokedex to prevent hydration issues
const Pokedex = dynamic(() => import('./components/Pokedex/Pokedex'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

export default function Home() {
  return (
    <main>
      <Pokedex />
    </main>
  );
}