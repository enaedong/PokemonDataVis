import React, { useEffect, useState } from "react";
import ScatterPlot from "./ScatterPlot";
import HitCount from "../utils/HitCount";
import HitCountSmogon from "./HitCountSmogon";
import { EndureKOData } from "../utils/moveHelpers";

export default function EndureKOChart({ selectedPokemon, dexData, usageData, selectedMove, selectedItem, setSelectedItem, typeChecks, typeNames, selectedWeather, selectedTerrain, ranks }) {

  const [typeChart, setTypeChart] = useState(null);
  const [scatterItems, setScatterItems] = useState([]);

  // Load type chart
  useEffect(() => {
    fetch("/atkType.json")
      .then((res) => res.json())
      .then(setTypeChart)
      .catch((err) => console.error("Failed to load atkType.json:", err));
  }, []);

  // Prepare scatter plot data
  useEffect(() => {
    const data = EndureKOData({
      selectedPokemon,
      dexData,
      usageData,
      typeChart,
      selectedMove,
      hitCountFn: HitCountSmogon,
      selectedWeather,
      selectedTerrain,
      ranks
    });
    setScatterItems(data);
  }, [selectedPokemon, dexData, usageData, typeChart, selectedMove, selectedWeather, selectedTerrain, ranks]);

  if (!selectedPokemon)
    return <div>Select a Pokémon to view the scatter plot.</div>;
  if (!selectedMove) return <div>No moves available for this Pokémon.</div>;

  return (
    <div>
      <ScatterPlot
        items={scatterItems}
        selectedPokemon={dexData.find((p) => p.name === selectedPokemon.name)}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        showMove={true}
        typeChecks={typeChecks}
        typeNames={typeNames}
      />
    </div>
  );
}
