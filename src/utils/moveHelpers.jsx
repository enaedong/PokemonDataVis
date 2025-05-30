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

export function getEffectiveness(typeChart, moveType, targetTypes) {
  if (!typeChart) return 1;
  const chart = typeChart[capitalize(moveType)];
  if (!chart) return 1;
  return targetTypes.reduce((mult, defType) => {
    const type = capitalize(defType);
    return mult * (chart[type] ?? 1);
  }, 1);
}

export function getBestMove(attacker, moveMap, target, typeChart, hitCountFn) {
  let best = { name: null, basePower: 0, type: "Normal", category: "Physical", eff: 1, hits: 5 };

  for (const moveName of Object.keys(moveMap)) {
    const move = getMoveDetails(moveName);
    if (!move.basePower || move.basePower < 40) continue;

    const effectiveness = getEffectiveness(typeChart, move.type, target.type);
    if (effectiveness === 0) continue;

    const hits = hitCountFn(true, target, attacker, move.basePower, effectiveness, move);

    if (!best.name || hits < best.hits || (hits === best.hits && move.basePower > best.basePower)) {
      best = { ...move, eff: effectiveness, hits, name: move.name };
    }
  }

  return best;
}

export function EndureKOData({ selectedPokemon, dexData, usageData, typeChart, selectedMove, hitCountFn }) {
  if (!selectedPokemon || !typeChart || !dexData || !usageData || !selectedMove) return [];

  const selectedDex = dexData.find(p => p.name === selectedPokemon.name);
  if (!selectedDex) return [];

  const selectedMoveDetails = getMoveDetails(selectedMove);
  const usageNames = new Set(usageData.map(p => p.name));
  const filteredDex = dexData.filter(p => usageNames.has(p.name));

  return filteredDex.map(poke => {
    const usageEntry = usageData.find(u => u.name === poke.name);
    const bestMove = usageEntry?.moves
      ? getBestMove(poke, usageEntry.moves, selectedDex, typeChart, hitCountFn)
      : { name: null, hits: 5 };

    const effY = getEffectiveness(typeChart, selectedMoveDetails.type, poke.type);
    const y = hitCountFn(true, poke, selectedDex, selectedMoveDetails.basePower, effY, selectedMoveDetails);

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
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
