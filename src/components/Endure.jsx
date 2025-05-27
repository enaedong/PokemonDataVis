import React, { useEffect, useState } from 'react';
import { Generations, toID } from '@smogon/calc';
import ScatterPlot from './ScatterPlot';
import TYPE_COLORS from '../utils/typeColors';

const gen = Generations.get(9);

export default function EndureChart({ selectedPokemon, dexData, usageData }) {
  const [selectedMove, setSelectedMove] = useState(null);
  const [chartItems, setChartItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [typeChart, setTypeChart] = useState(null);

  // Load atkType.json from public/
  useEffect(() => {
    fetch('/atkType.json')
      .then(res => res.json())
      .then(data => setTypeChart(data))
      .catch(err => console.error("Failed to load atkType.json", err));
  }, []);

  useEffect(() => {
    if (selectedPokemon && Object.keys(selectedPokemon.moves).length > 0) {
      const firstMove = Object.keys(selectedPokemon.moves)[0];
      setSelectedMove(firstMove);
    } else {
      setSelectedMove(null);
    }
    setChartItems([]);
    setSelectedItem(null);
  }, [selectedPokemon]);
  
  const usageNames = new Set(usageData.map(p => p.name));
  const filteredDex = dexData.filter(p => usageNames.has(p.name));

  function getMoveDetails(moveName) {
    const key = toID(moveName);
    const move = gen.moves.get(key);

    // move가 없을 경우 기본값 리턴 또는 에러 핸들링
    if (!move) {
      console.error(`Move not found: ${moveName}`);
      return {
        name: moveName,
        type: 'Normal',
        category: 'Physical',
        basePower: 0
      };
    }

    return {
      name: move.name,
      type: move.type,
      category: move.category,
      basePower: move.basePower ?? 0,
    };
  }

  function getEffectiveness(attackType, targetTypes) {
    if (!typeChart) return 1;
    const chart = typeChart[attackType.charAt(0).toUpperCase() + attackType.slice(1)];
    if (!chart) return 1;

    return targetTypes.reduce((mult, defType) => {
      const type = defType.charAt(0).toUpperCase() + defType.slice(1);
      return mult * (chart[type] ?? 1);
    }, 1);
  }

  function getHitsToKO(attacker, moveName, targets) {
    const { type, category, basePower } = getMoveDetails(moveName);

    return targets.map(target => {
      const atkStat = category === 'Physical' ? attacker.stat.atk : attacker.stat.spa;
      const defStat = category === 'Physical' ? target.stat.def : target.stat.spd;
      const effectiveness = getEffectiveness(type, target.type);
      const damage = (((2 * 100 / 5 + 2) * basePower * atkStat / defStat) / 50 + 2) * effectiveness;
      const hp = target.stat.hp;
      const hits = Math.ceil(hp / Math.max(damage, 1));

      return {
        name: target.name,
        speed: target.stat.spe,
        count: Math.min(hits, 5),
        type: target.type[0].toLowerCase()
      };
    });
  }

  useEffect(() => {
    if (!selectedMove || !selectedPokemon || !typeChart) return;

    console.log('Selected Pokémon:', selectedPokemon);

    const data = getHitsToKO(selectedPokemon, selectedMove, filteredDex);
    setChartItems(data);
    setSelectedItem(null);
  }, [selectedMove, selectedPokemon, typeChart]);

  if (!selectedPokemon) return <div>Select a Pokémon to begin.</div>;

  const moveOptions = Object.keys(selectedPokemon.moves);

  return (
    <div className="hit-chart">
      <h3>Hits from {selectedPokemon.name} each Pokémon can Endure</h3>

      <select
        value={selectedMove || ''}
        onChange={(e) => setSelectedMove(e.target.value)}
        style={{ marginBottom: '1rem', padding: '4px 8px' }}
      >
        <option value="" disabled>Select a move</option>
        {moveOptions.map((move) => (
          <option key={move} value={move}>{move}</option>
        ))}
      </select>

      {selectedMove && chartItems.length > 0 ? (
        <ScatterPlot
          items={chartItems}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          TYPE_COLORS={TYPE_COLORS}
          showMove={false}
        />
      ) : (
        selectedMove && <p>No data available for this move.</p>
      )}
    </div>
  );
}
