// components/PokemonDetails/PokemonDetails.js
'use client';
import React, { useState } from 'react';
import { X } from 'lucide-react';

const PokemonDetails = ({ pokemon, onClose, typeColors, statColors, formatStatName, formatId }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="relative p-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <span className="text-sm font-bold opacity-80 mb-2 block">
            {formatId(pokemon.id)}
          </span>
          
          <div className="relative mb-4">
            {!imageLoaded && (
              <div className="w-32 h-32 bg-white/20 rounded-full mx-auto animate-pulse"></div>
            )}
            <img
              src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
              alt={pokemon.name}
              className={`w-32 h-32 mx-auto object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
          </div>
          
          <h2 className="text-2xl font-bold capitalize mb-3">
            {pokemon.name}
          </h2>
          
          <div className="flex justify-center gap-2 mb-4">
            {pokemon.types.map(type => (
              <span
                key={type.type.name}
                className="px-3 py-1 rounded-full text-white text-sm font-semibold"
                style={{ backgroundColor: typeColors[type.type.name] }}
              >
                {type.type.name}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
        {/* Description */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Description</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {pokemon.description}
          </p>
        </div>
        
        {/* Physical Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <h4 className="font-semibold text-gray-700 mb-1">Height</h4>
            <p className="text-xl font-bold text-blue-600">{pokemon.height / 10}m</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <h4 className="font-semibold text-gray-700 mb-1">Weight</h4>
            <p className="text-xl font-bold text-blue-600">{pokemon.weight / 10}kg</p>
          </div>
        </div>
        
        {/* Abilities */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">Abilities</h3>
          <div className="space-y-2">
            {pokemon.abilities.map(ability => (
              <div key={ability.ability.name} className="bg-gray-50 rounded-lg p-3">
                <span className="font-semibold text-gray-700 capitalize">
                  {ability.ability.name.replace('-', ' ')}
                </span>
                {ability.is_hidden && (
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Hidden
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Stats */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">Base Stats</h3>
          <div className="space-y-3">
            {pokemon.stats.map(stat => (
              <div key={stat.stat.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-gray-700">
                    {formatStatName(stat.stat.name)}
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    {stat.base_stat}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((stat.base_stat / 255) * 100, 100)}%`,
                      backgroundColor: statColors[stat.stat.name] || '#6B7280'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-700">Total</span>
              <span className="text-lg font-bold text-blue-600">
                {pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonDetails;