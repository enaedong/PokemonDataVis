import { Generations, Pokemon, Move, calculate, toID } from "@smogon/calc";

const gen = Generations.get(9);

export default function HitCountSmogon(isKo, tar, dex, basePower, effectiveness, moveDetails) {
  const attackerData = isKo ? dex : tar;
  const defenderData = isKo ? tar : dex;

  const attacker = new Pokemon(gen, toID(attackerData.name), {
    ability: attackerData.ability || undefined,
    item: attackerData.item || undefined,
    level: 100,
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 }
  });

  const defender = new Pokemon(gen, toID(defenderData.name), {
    ability: defenderData.ability || undefined,
    item: defenderData.item || undefined,
    level: 100,
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 }
  });

  // Use move details if provided, otherwise fallback
  const move = new Move(gen, moveDetails?.name || "Custom Move", {
    basePower: basePower,
    type: moveDetails?.type || "Normal",
    category: moveDetails?.category || "Physical"
  });

  const result = calculate(gen, attacker, defender, move);
  const damage = result.damage;

  if (!damage || !Array.isArray(damage)) return 5;

  const avgDmg = (Math.min(...damage) + Math.max(...damage)) / 2;
  const scaledDmg = avgDmg * effectiveness;
  const hitsToKO = defender.stats.hp / scaledDmg;

  return Math.min(hitsToKO, 5);
}
