export default function HitCount(isKo, tar, dex, pow, type) {
  const hp = 60 + Math.floor((2 * tar.stat.hp + 31 + 63) / 2);
  const atk = Math.floor((Math.floor((2 * tar.stat.atk + 31 + 63) / 2) + 5) * 1.1);
  const def = Math.floor((Math.floor((2 * tar.stat.def + 31 + 63) / 2) + 5) * 1.1);
  const spa = Math.floor((Math.floor((2 * tar.stat.spa + 31 + 63) / 2) + 5) * 1.1);
  const spd = Math.floor((Math.floor((2 * tar.stat.spd + 31 + 63) / 2) + 5) * 1.1);

  const hpDex = 60 + Math.floor((2 * dex.stat.hp + 31 + 63) / 2);
  const atkDex = Math.floor((Math.floor((2 * dex.stat.atk + 31 + 63) / 2) + 5) * 1.1);
  const defDex = Math.floor((Math.floor((2 * dex.stat.def + 31 + 63) / 2) + 5) * 1.1);
  const spaDex = Math.floor((Math.floor((2 * dex.stat.spa + 31 + 63) / 2) + 5) * 1.1);
  const spdDex = Math.floor((Math.floor((2 * dex.stat.spd + 31 + 63) / 2) + 5) * 1.1);

  if (type === 0) {
    return 5;
  }

  if (isKo) {
    const atkCount = hp / ((22 * pow * (atkDex / def) / 50 + 2) * 1.5 * type * 0.925);
    const spaCount = hp / ((22 * pow * (spaDex / spd) / 50 + 2) * 1.5 * type * 0.925);
    const dmgCount = Math.max(atkCount, spaCount) > 5 ? 5 : Math.max(atkCount, spaCount);
    return dmgCount;
  } else {
    const atkCount = hpDex / ((22 * pow * (atk / defDex) / 50 + 2) * 1.5 * type * 0.925);
    const spaCount = hpDex / ((22 * pow * (spa / spdDex) / 50 + 2) * 1.5 * type * 0.925);
    const dmgCount = Math.max(atkCount, spaCount) > 5 ? 5 : Math.max(atkCount, spaCount);
    return dmgCount;
  }
}
