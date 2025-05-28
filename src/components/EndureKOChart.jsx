import React, { useEffect, useState } from "react";
import { Generations, toID } from "@smogon/calc";
import ScatterPlot from "./ScatterPlot";
import HitCount from "./HitCount";

const gen = Generations.get(9);

export default function EndureKOChart({ selectedPokemon, dexData, usageData, selectedItem, setSelectedItem }) {
  const [typeChart, setTypeChart] = useState(null);
  const [selectedMove, setSelectedMove] = useState(null);
  const [scatterItems, setScatterItems] = useState([]);

  // Load type chart
  useEffect(() => {
    fetch("/atkType.json")
      .then((res) => res.json())
      .then(setTypeChart)
      .catch((err) => console.error("Failed to load atkType.json:", err));
  }, []);

  // Set the first damaging move as default when selectedPokemon changes
  useEffect(() => {
    if (
      selectedPokemon &&
      selectedPokemon.moves &&
      Object.keys(selectedPokemon.moves).length > 0
    ) {
      const firstDamagingMove = Object.keys(selectedPokemon.moves).find(
        (move) => {
          const details = getMoveDetails(move);
          return details.basePower && details.basePower >= 40;
        }
      );
      setSelectedMove(firstDamagingMove || null);
    } else {
      setSelectedMove(null);
    }
  }, [selectedPokemon]);

  // Helper for type effectiveness (single move type vs. target types)
  function getEffectiveness(moveType, targetTypes) {
    if (!typeChart) return 1;
    const chart =
      typeChart[moveType.charAt(0).toUpperCase() + moveType.slice(1)];
    if (!chart) return 1;
    return targetTypes.reduce((mult, defType) => {
      const type = defType.charAt(0).toUpperCase() + defType.slice(1);
      return mult * (chart[type] ?? 1);
    }, 1);
  }

  // Helper: get move details from Smogon calc
  function getMoveDetails(moveName) {
    const move = gen.moves.get(toID(moveName));
    if (!move)
      return {
        name: moveName,
        type: "Normal",
        category: "Physical",
        basePower: 0,
      };
    return {
      name: move.name,
      type: move.type,
      category: move.category,
      basePower: move.basePower ?? 0,
    };
  }

  // Find best move for a given attacker against the selected Pokémon (for x-axis)
  function getBestMove(attacker, moveMap, target) {
    let best = {
      name: null,
      basePower: 0,
      type: "Normal",
      category: "Physical",
      eff: 1,
      dmg: 0,
    };
    for (const moveName of Object.keys(moveMap)) {
      const move = getMoveDetails(moveName);
      if (!move.basePower) continue;
      const effectiveness = getEffectiveness(move.type, target.type);
      if (effectiveness === 0) continue;
      // Use HitCount logic for both physical and special
      const hits = HitCount(
        true,
        target,
        attacker,
        move.basePower,
        effectiveness
      );
      // Lower hits = stronger move (prefer lowest hits)
      // If tie, prefer higher base power
      if (
        !best.name ||
        hits < best.hits ||
        (hits === best.hits && move.basePower > best.basePower)
      ) {
        best = { ...move, eff: effectiveness, hits, name: move.name };
      }
    }
    return best;
  }

  // Prepare scatter plot data
  useEffect(() => {
    if (
      !selectedPokemon ||
      !typeChart ||
      !dexData ||
      !usageData ||
      !selectedMove
    ) {
      setScatterItems([]);
      return;
    }

    // Defensive: find selected in dexData (for stats)
    const selectedDex = dexData.find((p) => p.name === selectedPokemon.name);
    if (!selectedDex) {
      setScatterItems([]);
      return;
    }

    // Get details for selected move (for y-axis)
    const selectedMoveDetails = getMoveDetails(selectedMove);

    // Only use Pokémon in usageData (as in Endure/KnockOut)
    const usageNames = new Set(usageData.map((p) => p.name));
    const filteredDex = dexData.filter((p) => usageNames.has(p.name));

    const items = filteredDex.map((poke) => {
      // X: fewest hits to KO selected using best move (as in KnockOut.jsx)
      const usageEntry = usageData.find((u) => u.name === poke.name);
      const bestMove =
        usageEntry && usageEntry.moves
          ? getBestMove(poke, usageEntry.moves, selectedDex)
          : { name: null, hits: 5 };

      // Y: hits the selected Pokémon's selected move can endure against this Pokémon (as in Endure.jsx)
      const effY = getEffectiveness(selectedMoveDetails.type, poke.type);
      const y = HitCount(
        false,
        poke,
        selectedDex,
        selectedMoveDetails.basePower,
        effY
      );

      return {
        name: poke.name,
        x: bestMove.hits ?? 5,
        y: y ?? 5,
        speed: poke.stat.spe,
        type: poke.type[0].toLowerCase(),
        color: poke.stat.spe > selectedDex.stat.spe ? "green" : "red",
        bestMove: bestMove.name,
      };
    });

    setScatterItems(items);
  }, [selectedPokemon, dexData, usageData, typeChart, selectedMove]);

  if (!selectedPokemon)
    return <div>Select a Pokémon to view the scatter plot.</div>;
  if (!selectedMove) return <div>No moves available for this Pokémon.</div>;

  // Move select options: only moves with basePower > 0
  const moveOptions = selectedPokemon.moves
    ? Object.keys(selectedPokemon.moves).filter((move) => {
      const details = getMoveDetails(move);
      return details.basePower && details.basePower >= 40;
    })
    : [];

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <label>
          Select Move for Y-axis:&nbsp;
          <select
            value={selectedMove}
            onChange={(e) => setSelectedMove(e.target.value)}
          >
            {moveOptions.map((move) => (
              <option key={move} value={move}>
                {move}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ScatterPlot
        items={scatterItems}
        selectedPokemon={dexData.find((p) => p.name === selectedPokemon.name)}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        showMove={true}
      />
    </div>
  );
}
