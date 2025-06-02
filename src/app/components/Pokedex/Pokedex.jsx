'use client';
import { useState, useEffect, useCallback } from 'react';
import EvolutionChain from '../EvolutionChain/EvolutionChain';
import './Pokedex.css';

// API-Cache implementieren
const apiCache = {};

const cachedFetch = async (url) => {
  if (apiCache[url]) return apiCache[url];
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    apiCache[url] = data;
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

const Pokedex = () => {
  const [pokemonList, setPokemonList] = useState([]);
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [pokemonLoading, setPokemonLoading] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [typeEffectiveness, setTypeEffectiveness] = useState(null);
  const [topMoves, setTopMoves] = useState([]);
  const [locations, setLocations] = useState([]);
  const [typeFilter, setTypeFilter] = useState(null);


  // Fetch Pokemon list on mount
  useEffect(() => {
    fetchPokemonList();
  }, []);

  // Handle search
useEffect(() => {
  let filtered = pokemonList;

  if (searchTerm) {
    filtered = filtered.filter(pokemon =>
      pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (typeFilter) {
    filtered = filtered.filter(pokemon =>
      pokemon.types.includes(typeFilter)
    );
  }

  setFilteredPokemon(filtered);
}, [searchTerm, typeFilter, pokemonList]);



const fetchPokemonList = async () => {
  try {
    const data = await cachedFetch('https://pokeapi.co/api/v2/pokemon?limit=151');
    const detailed = await Promise.all(
      data.results.map(async (pokemon) => {
        const full = await cachedFetch(pokemon.url);
        return {
          ...pokemon,
          types: full.types.map(t => t.type.name)
        };
      })
    );
    setPokemonList(detailed);
    setFilteredPokemon(detailed);
    setLoading(false);
  } catch (error) {
    console.error('Error fetching Pokemon list:', error);
    setLoading(false);
  }
};


  // Typ-Effektivität abrufen
  const fetchTypeRelations = useCallback(async (typeUrl) => {
    try {
      const typeData = await cachedFetch(typeUrl);
      return {
        doubleDamageFrom: typeData.damage_relations.double_damage_from.map(t => t.name),
        halfDamageFrom: typeData.damage_relations.half_damage_from.map(t => t.name),
        noDamageFrom: typeData.damage_relations.no_damage_from.map(t => t.name)
      };
    } catch (error) {
      console.error('Error fetching type relations:', error);
      return null;
    }
  }, []);

  // Pokémon-Standorte abrufen
  const fetchLocations = useCallback(async (pokemonId) => {
    try {
      const locationData = await cachedFetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/encounters`);
      const uniqueLocations = [...new Set(locationData.map(encounter => encounter.location_area.name))];
      return uniqueLocations.map(loc => 
        loc.replace(/-/g, ' ').replace(/(?:^|\s)\S/g, a => a.toUpperCase())
      );
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  }, []);

  // Top Moves abrufen
  const fetchTopMoves = useCallback(async (moves) => {
    const movesToFetch = moves
      .filter(move => move.version_group_details[0].move_learn_method.name === 'level-up')
      .sort((a, b) => a.version_group_details[0].level_learned_at - b.version_group_details[0].level_learned_at)
      .slice(0, 5);
    
    try {
      const movesData = await Promise.all(
        movesToFetch.map(async move => {
          const moveData = await cachedFetch(move.move.url);
          return {
            name: moveData.name.replace(/-/g, ' '),
            type: moveData.type.name,
            power: moveData.power || '-',
            accuracy: moveData.accuracy || '-',
            pp: moveData.pp,
            level: move.version_group_details[0].level_learned_at
          };
        })
      );
      return movesData;
    } catch (error) {
      console.error('Error fetching moves:', error);
      return [];
    }
  }, []);

  const fetchPokemonDetails = async (url) => {
    setPokemonLoading(true);
    try {
      const pokemon = await cachedFetch(url);
      
      // Parallele Anfragen für zusätzliche Daten
      const [speciesData, typeRelations, locationsData, movesData] = await Promise.all([
        cachedFetch(pokemon.species.url),
        Promise.all(pokemon.types.map(type => fetchTypeRelations(type.type.url))),
        fetchLocations(pokemon.id),
        fetchTopMoves(pokemon.moves)
      ]);
      
      const description = speciesData.flavor_text_entries
        .find(entry => entry.language.name === 'en')?.flavor_text
        .replace(/\f/g, ' ') || 'No description available.';

      const pokemonWithDetails = {
        ...pokemon,
        description,
        speciesUrl: pokemon.species.url,
        typeEffectiveness: typeRelations,
        locations: locationsData,
        topMoves: movesData
      };

      setCurrentPokemon(pokemonWithDetails);
      setPokemonLoading(false);
    } catch (error) {
      console.error('Error fetching Pokemon details:', error);
      setPokemonLoading(false);
    }
  };

  const handlePokemonClick = (pokemon) => {
    fetchPokemonDetails(pokemon.url);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPokemonId = (url) => {
    const id = url.split('/').filter(Boolean).pop();
    return id.padStart(3, '0');
  };

  const getPokemonSprite = (id) => {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  };

  const getAnimatedSprite = (id) => {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
  };
const getTypeColor = (type) => {
  const colors = {
    normal: '#9FA19F',
    fire: '#E62829',
    water: '#2980EF',
    electric: '#FAC000',
    grass: '#42A129',
    ice: '#3FD8FF',
    fighting: '#FF8000',
    poison: '#9040CC',
    ground: '#915121',
    flying: '#81B9EF',
    psychic: '#F14179',
    bug: '#91A119',
    rock: '#AFA981',
    ghost: '#704170',
    dragon: '#5061E1',
    dark: '#50413F',
    steel: '#60A1B8',
    fairy: '#F170F1'
  };
  return colors[type] || '#68A090'; // Fallback-Farbe
};



  const getStatColor = (stat) => {
    const colors = {
      hp: '#D83838',
      attack: '#C4763D',
      defense: '#D9B830',
      'special-attack': '#4966D9',
      'special-defense': '#63B726',
      speed: '#D94477'
    };
    return colors[stat] || '#367866';
  };

  const formatStatName = (name) => {
    const names = {
      hp: 'HP', 
      attack: 'ATK', 
      defense: 'DEF',
      'special-attack': 'SpA', 
      'special-defense': 'SpD', 
      speed: 'SPD'
    };
    return names[name] || name.toUpperCase();
  };

  const getEffectivenessColor = (multiplier) => {
    if (multiplier === 0) return '#666666'; // Grau für keine Wirkung
    if (multiplier === 0.25) return '#3A7D44'; // Dunkelgrün
    if (multiplier === 0.5) return '#4CAF50'; // Grün
    if (multiplier === 1) return '#9E9E9E'; // Grau
    if (multiplier === 2) return '#F44336'; // Rot
    return '#B71C1C'; // Dunkelrot für 4x
  };

  // Berechne kombinierte Typ-Effektivität
  const calculateCombinedEffectiveness = () => {
    if (!currentPokemon || !currentPokemon.typeEffectiveness) return {};

    const combined = {};
    
    // Kombiniere alle Schadensbeziehungen
    currentPokemon.typeEffectiveness.forEach(type => {
      // 4x Schaden (wenn von zwei Typen doppelt schwach)
      type.doubleDamageFrom.forEach(t => {
        combined[t] = (combined[t] || 0) + 1;
      });
      
      // 0.25x Schaden (wenn von einem Typ halb und von einem anderen Typ halb)
      type.halfDamageFrom.forEach(t => {
        combined[t] = (combined[t] || 0) - 1;
      });
      
      // 0x Schaden (Immunität)
      type.noDamageFrom.forEach(t => {
        combined[t] = -10; // Markierung für Immunität
      });
    });

    // Konvertiere Zählwerte in Multiplikatoren
    const result = {};
    Object.keys(combined).forEach(type => {
      if (combined[type] === -10) {
        result[type] = 0; // Immunität
      } else if (combined[type] === 2) {
        result[type] = 4; // 4x Schaden
      } else if (combined[type] === 1) {
        result[type] = 2; // 2x Schaden
      } else if (combined[type] === -1) {
        result[type] = 0.5; // 0.5x Schaden
      } else if (combined[type] === -2) {
        result[type] = 0.25; // 0.25x Schaden
      } else {
        result[type] = 1; // Normal
      }
    });

    return result;
  };

  if (loading) {
    return (
      <div className="pokedex-loading-wrapper">
        <div className="pokedex-loading-pokeball"></div>
        <h2>Loading Pokédex...</h2>
      </div>
    );
  }

  const combinedEffectiveness = currentPokemon ? calculateCombinedEffectiveness() : {};

  return (
    <div className="pokedex-main-wrapper">

      <div className="pokedex-content-container">
        {/* Main Pokemon List */}
        <div className="pokedex-pokemon-list-section">
          {/* Search Bar */}
          <div className="pokedex-search-container">
            <div className="pokedex-search-input-wrapper">
              <input
                type="text"
                placeholder="Search Pokemon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pokedex-search-input"
              />
              <div className="pokedex-search-button">
                🔍
              </div>
            </div>
          </div>

        {/* Filter-Buttons Nach Type Simple clean shit */}
            <div className="pokedex-type-filter">
              {/* Reset/Clear Button */}
              <button
                className={`type-filter-button reset-button ${!typeFilter ? 'active' : ''}`}
                onClick={() => setTypeFilter(null)}
              >
                All Types
              </button>
              
              {[
                'fire', 'water', 'grass', 'electric', 'bug', 'normal', 
                'poison', 'ground', 'flying', 'psychic', 'rock', 
                'ghost', 'ice', 'dragon', 'dark', 'steel', 'fairy'
              ].map(type => (
                <button
                  key={type}
                  className={`type-filter-button ${typeFilter === type ? 'active' : ''}`}
                  style={{ backgroundColor: getTypeColor(type) }}
                  onClick={() => setTypeFilter(typeFilter === type ? null : type)}
                >
                  {type}
                </button>
              ))}
            </div>

          {/* Scroll-Container um das Grid */}
          <div className="pokedex-grid-scroll-container">
            {/* Pokemon Grid */}
            <div className="pokedex-pokemon-grid">
              {filteredPokemon.map((pokemon) => {
                const pokemonId = getPokemonId(pokemon.url);
                const numericId = parseInt(pokemonId);
                return (
                  <div
                    key={pokemon.name}
                    className="pokedex-pokemon-card"
                    onClick={() => handlePokemonClick(pokemon)}
                  >
                    <img
                      src={getPokemonSprite(numericId)}
                      alt={pokemon.name}
                      className="pokedex-pokemon-card-image"
                      loading="lazy"
                    />
                    <h4 className="pokedex-pokemon-card-number">#{pokemonId}</h4>
                    <h3 className="pokedex-pokemon-card-name">{pokemon.name}</h3>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Current Pokemon Details */}
        {currentPokemon && (
          <div className="pokedex-detail-panel">
            <div className="pokedex-detail-content">
              {pokemonLoading ? (
               // NEU: Verbesserter Ladeindikator
                <div className="pokedex-detail-loading">
                  <div className="skeleton-image"></div>
                  
                  <div className="skeleton-line large"></div>
                  <div className="skeleton-line small"></div>
                  
                  <div className="skeleton-types">
                    <div className="skeleton-type"></div>
                    <div className="skeleton-type"></div>
                  </div>
                  
                  <div className="skeleton-section">
                    <div className="skeleton-line medium"></div>
                    <div className="skeleton-line full"></div>
                    <div className="skeleton-line full"></div>
                    <div className="skeleton-line half"></div>
                  </div>
                  
                  <div className="skeleton-section">
                    <div className="skeleton-line medium"></div>
                    <div className="skeleton-evolution">
                      <div className="skeleton-evolution-item"></div>
                      <div className="skeleton-evolution-arrow">→</div>
                      <div className="skeleton-evolution-item"></div>
                      <div className="skeleton-evolution-arrow">→</div>
                      <div className="skeleton-evolution-item"></div>
                    </div>
                  </div>
                  
                  <div className="skeleton-stats">
                    <div className="skeleton-stat">
                      <div className="skeleton-stat-label"></div>
                      <div className="skeleton-stat-bar"></div>
                    </div>
                    <div className="skeleton-stat">
                      <div className="skeleton-stat-label"></div>
                      <div className="skeleton-stat-bar"></div>
                    </div>
                    <div className="skeleton-stat">
                      <div className="skeleton-stat-label"></div>
                      <div className="skeleton-stat-bar"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <img
                    src={getAnimatedSprite(currentPokemon.id)}
                    alt={currentPokemon.name}
                    className="pokedex-detail-main-image"
                    onError={(e) => {
                      e.target.src = getPokemonSprite(currentPokemon.id);
                    }}
                  />
                  
                  <h1 className="pokedex-detail-name">
                    {currentPokemon.name}
                  </h1>
                  <span className="pokedex-detail-number">
                    #{currentPokemon.id.toString().padStart(3, '0')}
                  </span>

                  {/* Types */}
                  <div className="pokedex-detail-types">
                    {currentPokemon.types.map(type => (
                      <div
                        key={type.type.name}
                        className="pokedex-type-badge"
                        style={{ backgroundColor: getTypeColor(type.type.name) }}
                      >
                        {type.type.name}
                      </div>
                    ))}
                  </div>

                  {/* Description */}
                  <div className="pokedex-detail-section">
                    <h4 className="pokedex-section-title">Description</h4>
                    <span className="pokedex-section-text">
                      {currentPokemon.description}
                    </span>
                  </div>

                  {/* Evolution Chain */}
                  <EvolutionChain 
                    pokemonId={currentPokemon.id}
                    speciesUrl={currentPokemon.speciesUrl}
                  />

                  {/* Type Effectiveness */}
                  <div className="pokedex-detail-section">
                    <h4 className="pokedex-section-title">Type Effectiveness</h4>
                    <div className="type-effectiveness-grid">
                      {Object.entries(combinedEffectiveness).map(([type, multiplier]) => (
                        <div 
                          key={type} 
                          className="effectiveness-badge"
                          style={{ 
                            backgroundColor: getTypeColor(type),
                            borderColor: getEffectivenessColor(multiplier)
                          }}
                        >
                          <span className="effectiveness-type">{type}</span>
                          <span className="effectiveness-multiplier">{multiplier}x</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Moves */}
                  {currentPokemon.topMoves.length > 0 && (
                    <div className="pokedex-detail-section">
                      <h4 className="pokedex-section-title">Top Moves</h4>
                      <div className="moves-grid">
                        {currentPokemon.topMoves.map((move, index) => (
                          <div key={index} className="move-item">
                            <div className="move-header">
                              <span className="move-name">{move.name}</span>
                              <span className="move-type-badge" style={{ backgroundColor: getTypeColor(move.type) }}>
                                {move.type}
                              </span>
                            </div>
                            <div className="move-stats">
                              <span>Lv. {move.level}</span>
                              <span>Pwr: {move.power}</span>
                              <span>Acc: {move.accuracy}</span>
                              <span>PP: {move.pp}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Locations */}
                  {currentPokemon.locations.length > 0 && (
                    <div className="pokedex-detail-section">
                      <h4 className="pokedex-section-title">Locations</h4>
                      <div className="locations-grid">
                        {currentPokemon.locations.map((location, index) => (
                          <div key={index} className="location-badge">
                            {location}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Physical Stats */}
                  <div className="pokedex-physical-stats">
                    <div className="pokedex-detail-section">
                      <h4 className="pokedex-section-title">Height</h4>
                      <span className="pokedex-stat-value">
                        {(currentPokemon.height / 10).toFixed(1)}m
                      </span>
                    </div>
                    <div className="pokedex-detail-section">
                      <h4 className="pokedex-section-title">Weight</h4>
                      <span className="pokedex-stat-value">
                        {(currentPokemon.weight / 10).toFixed(1)}kg
                      </span>
                    </div>
                  </div>

                  {/* Abilities */}
                  <div className="pokedex-detail-section">
                    <h4 className="pokedex-section-title">Abilities</h4>
                    {currentPokemon.abilities.map(ability => (
                      <div key={ability.ability.name} className="pokedex-ability-item">
                        <span className="pokedex-section-text">
                          {ability.ability.name.replace(/-/g, ' ')}
                          {ability.is_hidden && ' (Hidden)'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Base Stats */}
                  <div className="pokedex-detail-section">
                    <h4 className="pokedex-section-title">Base Stats</h4>
                    {currentPokemon.stats.map(stat => (
                      <div key={stat.stat.name} className="pokedex-stat-item">
                        <div
                          className="pokedex-stat-badge"
                          style={{ backgroundColor: getStatColor(stat.stat.name) }}
                        >
                          {formatStatName(stat.stat.name)}
                        </div>
                        <div className="pokedex-stat-content">
                          <div className="pokedex-stat-header">
                            <span className="pokedex-stat-name">
                              {stat.stat.name.replace(/-/g, ' ')}
                            </span>
                            <span className="pokedex-stat-number">
                              {stat.base_stat}
                            </span>
                          </div>
                          <div className="pokedex-stat-bar">
                            <div
                              className="pokedex-stat-bar-fill"
                              style={{
                                width: `${Math.min((stat.base_stat / 255) * 100, 100)}%`,
                                backgroundColor: getStatColor(stat.stat.name)
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Pokedex;