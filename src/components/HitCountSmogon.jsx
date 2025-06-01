import { Generations, Pokemon, Move, calculate, toID } from "@smogon/calc";

const gen = Generations.get(9);

function getAbility(data) {
  const ability = data?.ability;
  if (Array.isArray(ability)) return ability[0];
  if (typeof ability === "string") return ability;
  return undefined;
}

function getItem(data) {
  const items = data?.items;
  if (items && typeof items === "object" && Object.keys(items).length > 0) {
    return Object.keys(items)[0];
  }
  return undefined; // ignore items if not present in usage
}

export default function HitCountSmogon(isKo, tar, dex, basePower, moveDetails) {
  const attackerData = isKo ? dex : tar;
  const defenderData = isKo ? tar : dex;

  const attacker = new Pokemon(gen, toID(attackerData.name), {
    ability: getAbility(attackerData),
    item: getItem(attackerData),
    level: 50,
  });

  const defender = new Pokemon(gen, toID(defenderData.name), {
    ability: getAbility(defenderData),
    item: getItem(defenderData),
    level: 50,
  });

  defender.curHP = defender.stats.hp;

  const move = new Move(gen, moveDetails?.name || "Custom Move", {
    basePower: basePower,
    type: moveDetails?.type || "Normal",
    category: moveDetails?.category || "Physical"
  });

  const result = calculate(gen, attacker, defender, move);
  const damage = result.damage;

  if (!damage || !Array.isArray(damage)) return 5;

  const avgDmg = (Math.min(...damage) + Math.max(...damage)) / 2;
  const hitsToKO = defender.stats.hp / avgDmg;

  return Math.min(hitsToKO, 5);
}
