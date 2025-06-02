import { Generations, toID } from "@smogon/calc";
const gen = Generations.get(9);

export function getMoveDetails(moveName) {
  const move = gen.moves.get(toID(moveName));
  if (!move) return { name: moveName, type: "Normal", category: "Physical", basePower: 0 };
  return {
    name: move.name,
    type: move.type,
    category: move.category,
    basePower: move.basePower ?? 0,
  };
}

export function getBestMove(attacker, moveMap, target, hitCountFn, selectedWeather, selectedTerrain) {
  let best = { name: null, basePower: 0, type: "Normal", category: "Physical", hits: 6 };

  for (const moveName of Object.keys(moveMap)) {
    const move = getMoveDetails(moveName);
    if (!move.basePower || move.basePower < 40) continue;

    const hits = hitCountFn(true, target, attacker, move.basePower, move, selectedWeather, selectedTerrain);

    if (!best.name || hits < best.hits || (hits === best.hits && move.basePower > best.basePower)) {
      best = { ...move, hits, name: move.name };
    }
  }

  return best;
}

export function EndureKOData({ selectedPokemon, dexData, usageData, typeChart, selectedMove, hitCountFn, selectedWeather, selectedTerrain }) {
  if (!selectedPokemon || !typeChart || !dexData || !usageData || !selectedMove) return [];

  const selectedDex = dexData.find(p => p.name === selectedPokemon.name);
  const selectedUsage = usageData.find(u => u.name === selectedPokemon.name);
  const selectedPoke = selectedUsage ? { ...selectedDex, ...selectedUsage } : selectedDex;
  if (!selectedDex) return [];

  const selectedMoveDetails = getMoveDetails(selectedMove);
  const usageNames = new Set(usageData.map(p => p.name));
  const filteredDex = dexData.filter(p => usageNames.has(p.name));

  return filteredDex.map(poke => {
    const usageEntry = usageData.find(u => u.name === poke.name);
    const merged = usageEntry ? { ...poke, ...usageEntry } : poke;
    const bestMove = merged?.moves
      ? getBestMove(merged, merged.moves, selectedPoke, hitCountFn, selectedWeather, selectedTerrain)
      : { name: null, hits: 6 };

    const yHits = hitCountFn(true, merged, selectedPoke, selectedMoveDetails.basePower, selectedMoveDetails, selectedWeather, selectedTerrain);

    return {
      name: merged.name,
      x: bestMove.hits > 5 ? "5+" : bestMove.hits,
      y: yHits > 5 ? "5+" : yHits,
      speed: merged.stat.spe,
      type: merged.type[0].toLowerCase(),
      color: merged.stat.spe > selectedPoke.stat.spe ? "green" : "red",
      bestMove: bestMove.name,
    };
  });
}
