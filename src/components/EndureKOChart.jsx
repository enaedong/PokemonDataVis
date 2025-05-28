import React, { useEffect, useState } from "react";
import { Generations, toID } from "@smogon/calc";
import ScatterPlot from "./ScatterPlot";
import HitCount from "../utils/HitCount";
import { EndureKOData, getMoveDetails } from "../utils/moveHelpers";

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

  // Prepare scatter plot data
  useEffect(() => {
    const data = EndureKOData({
      selectedPokemon,
      dexData,
      usageData,
      typeChart,
      selectedMove,
      hitCountFn: HitCount,
    });
    setScatterItems(data);
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
