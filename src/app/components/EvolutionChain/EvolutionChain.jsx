import { useState, useEffect } from 'react';
import style from './EvolutionChain.css'

const EvolutionChain = ({ pokemonId, speciesUrl }) => {
  const [evolutionChain, setEvolutionChain] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (speciesUrl) {
      fetchEvolutionChain(speciesUrl);
    }
  }, [speciesUrl]);

  const fetchEvolutionChain = async (speciesUrl) => {
    setLoading(true);
    try {
      // Fetch species data to get evolution chain URL
      const speciesResponse = await fetch(speciesUrl);
      const speciesData = await speciesResponse.json();
      
      // Fetch evolution chain
      const evolutionResponse = await fetch(speciesData.evolution_chain.url);
      const evolutionData = await evolutionResponse.json();
      
      // Parse evolution chain
      const chain = parseEvolutionChain(evolutionData.chain);
      setEvolutionChain(chain);
    } catch (error) {
      console.error('Error fetching evolution chain:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseEvolutionChain = (chain) => {
    const evolutions = [];
    
    const addEvolution = (evolution) => {
      const pokemonId = evolution.species.url.split('/').filter(Boolean).pop();
      const evolutionDetails = evolution.evolution_details[0];
      
      evolutions.push({
        id: parseInt(pokemonId),
        name: evolution.species.name,
        minLevel: evolutionDetails?.min_level || null,
        trigger: evolutionDetails?.trigger?.name || null,
        item: evolutionDetails?.item?.name || null,
        happiness: evolutionDetails?.min_happiness || null,
        timeOfDay: evolutionDetails?.time_of_day || null
      });
      
      // Recursively add evolved forms
      if (evolution.evolves_to.length > 0) {
        evolution.evolves_to.forEach(addEvolution);
      }
    };
    
    // Add base form
    const basePokemonId = chain.species.url.split('/').filter(Boolean).pop();
    evolutions.push({
      id: parseInt(basePokemonId),
      name: chain.species.name,
      minLevel: null,
      trigger: null,
      item: null,
      happiness: null,
      timeOfDay: null
    });
    
    // Add evolutions
    if (chain.evolves_to.length > 0) {
      chain.evolves_to.forEach(addEvolution);
    }
    
    return evolutions;
  };

  const getPokemonSprite = (id) => {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  };

  const getEvolutionText = (evolution) => {
    if (!evolution.minLevel && !evolution.item && !evolution.happiness) {
      return '';
    }
    
    if (evolution.minLevel) {
      return `Lv. ${evolution.minLevel}`;
    }
    
    if (evolution.item) {
      return evolution.item.replace('-', ' ');
    }
    
    if (evolution.happiness) {
      return 'Happiness';
    }
    
    if (evolution.trigger === 'trade') {
      return 'Trade';
    }
    
    return evolution.trigger || '';
  };

  if (loading) {
    return (
      <div className="evolution-chain-section">
        <h4 className="evolution-section-title">Evolution</h4>
        <div className="evolution-loading">
          <div className="evolution-loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!evolutionChain || evolutionChain.length <= 1) {
    return null;
  }

return (
  <div className="evolution-chain-section">
    <h4 className="evolution-section-title">Evolution</h4>
    <div className="evolution-chain-container">
      {evolutionChain.map((evolution, index) => (
        <div key={evolution.id} className="evolution-step">
          <div className="evolution-pokemon">
            <img 
              src={getPokemonSprite(evolution.id)}
              alt={evolution.name}
              className="evolution-pokemon-image"
            />
            <span className="evolution-pokemon-name">
              {evolution.name}
            </span>
          </div>

          {/* Zeige Entwicklungstext oder "Final" darunter */}
          <div className="evolution-arrow-container">
            {index < evolutionChain.length - 1 ? (
              <div className="evolution-requirement">
                {getEvolutionText(evolutionChain[index + 1]) || "Mid-Stage"}
              </div>
            ) : (
              <div className="evolution-requirement">
                Final
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
  );
};

export default EvolutionChain;