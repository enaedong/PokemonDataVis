import { Generations, Pokemon, Move, Field, calculate, toID } from "@smogon/calc";

const gen = Generations.get(9);

function getAbility(data) {
  const ability = data?.ability;
  if (Array.isArray(ability)) return ability[0];
  if (typeof ability === "string") return ability;
  return undefined;
}

function getItem(data) {
  return typeof data?.items === "string" ? data.items : undefined;
}

function getNature(data) {
  if (typeof data?.spread !== "string") return undefined;
  const match = data.spread.match(/Nature:\s*(\w+)/i);
  return match ? match[1] : undefined;
}

function getEVs(data) {
  if (typeof data?.spread !== "string") return undefined;
  const match = data.spread.match(/EVs:\s*([\d/]+)/i);
  if (!match) return undefined;
  const [hp, atk, def, spa, spd, spe] = match[1].split('/').map(Number);
  return { hp, atk, def, spa, spd, spe };
}

export default function HitCountSmogon(isKo, tar, dex, basePower, moveDetails, weather, terrain) {
  const attackerData = isKo ? dex : tar;
  const defenderData = isKo ? tar : dex;

  console.log("Defender Data Check:", {
    name: defenderData.name,
    ability: getAbility(defenderData),
    item: getItem(defenderData),
    level: defenderData.level || 50,
    nature: getNature(defenderData),
    evs: getEVs(defenderData)
  });
  
  const attacker = new Pokemon(gen, toID(attackerData.name), {
    ability: getAbility(attackerData),
    item: getItem(attackerData),
    level: 50,
    nature: getNature(attackerData),
    evs: getEVs(attackerData),
  });

  const defender = new Pokemon(gen, toID(defenderData.name), {
    ability: getAbility(defenderData),
    item: getItem(defenderData),
    level: 50,
    nature: getNature(defenderData),
    evs: getEVs(defenderData),
  });

  defender.curHP = defender.stats.hp;

  const move = new Move(gen, moveDetails?.name || "Custom Move", {
    basePower: basePower,
    type: moveDetails?.type || "Normal",
    category: moveDetails?.category || "Physical"
  });

  const field = new Field({
      weather: weather,
      terrain: terrain,
  });

  if (!defender.item || !gen.items.get(toID(defender.item))) {
    defender.item = ""; // or you can use a safe default item
  }
  const result = calculate(gen, attacker, defender, move, field);
  const damage = result.damage;

  if (!damage || !Array.isArray(damage)) return 6;

  const avgDmg = (Math.min(...damage) + Math.max(...damage)) / 2;
  const hitsToKO = defender.stats.hp / avgDmg;

  return hitsToKO;
}
