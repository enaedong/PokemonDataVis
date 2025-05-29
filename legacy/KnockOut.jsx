import React, { useEffect, useState } from "react";
import { Generations, toID } from "@smogon/calc";
import ScatterPlot from "./ScatterPlot";
import TYPE_COLORS from "../utils/typeColors";

const gen = Generations.get(9);

export default function KnockOutChart({ target, dexData, usageData }) {
  const [typeChart, setTypeChart] = useState(null);
  const [points, setPoints] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null)

  // Load type effectiveness chart from public folder
  useEffect(() => {
    fetch("/atkType.json")
      .then(res => res.json())
      .then(setTypeChart)
      .catch(err => console.error("Failed to load atkType.json:", err));
  }, []);

  // Core logic for generating chart points
  useEffect(() => {
    if (!target || !typeChart) return;

    const targetStats = dexData.find(p => p.name === target.name);
    if (!targetStats) return;

    const getEffectiveness = (atkType, targetTypes) => {
      const row = typeChart[atkType];
      if (!row) return 1;
      return targetTypes.reduce((acc, t) => acc * (row[t] ?? 1), 1);
    };

    const computeBestMove = (attacker, moveMap) => {
      let best = { name: null, dmg: 0 };

      for (const moveName of Object.keys(moveMap)) {
        const move = gen.moves.get(toID(moveName));
        if (!move || !move.basePower) {
          continue;
        }

        const category = move.category;
        const atkStat = category === "Physical" ? attacker.stat.atk : attacker.stat.spa;
        const defStat = category === "Physical" ? targetStats.stat.def : targetStats.stat.spd;

        const effectiveness = getEffectiveness(move.type, targetStats.type);
        const power = move.basePower;
        const dmg = (((2 * 100 / 5 + 2) * power * atkStat / defStat) / 50 + 2) * effectiveness;

        if (dmg > best.dmg) {
          best = {
            name: move.name,
            dmg,
            type: move.type
          };
        }
      }

      return best;
    };

    const pointsData = usageData.map(poke => {
      const attacker = dexData.find(
        d => d.name.toLowerCase().replace(/[-.']/g, "") === poke.name.toLowerCase().replace(/[-.']/g, "")
      );
      if (!attacker || !poke.moves) return null;

      const best = computeBestMove(attacker, poke.moves);
      if (!best.name || best.dmg === 0) return null;

      const hits = Math.ceil(targetStats.stat.hp / best.dmg);
      return {
        name: poke.name,
        speed: attacker.stat.spe,
        count: Math.min(hits, 5), // Cap to max 5 hits
        type: (attacker.type[0] || "Normal").toLowerCase(),
        bestMove: best.name,
        damage: best.dmg.toFixed(1)
      };
    }).filter(Boolean);

    setPoints(pointsData);
  }, [target, dexData, usageData, typeChart]);

  if (!target) return <p>Select a target Pokémon</p>;
  if (points.length === 0) return <p>No valid damage data found.</p>;

  return (
    <div>
      <h3>Hits Required for each Pokémon to Knock-Out {target.name}</h3>
      <ScatterPlot
        items={points}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        TYPE_COLORS={TYPE_COLORS}
        showMove={true}
      />
    </div>
  );
}
