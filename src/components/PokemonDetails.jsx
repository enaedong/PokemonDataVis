// components/PokemonDetails.jsx
import React from "react";
import TypeBoxes from "./TypeBoxes";
import RadarChart from "./RadarChart";

export default function PokemonDetails({ selected, pokeDetail, pokeStats, loading }) {
  if (!selected) return <h2>Select a Pokémon to see stats.</h2>;
  if (loading) return <div>Loading...</div>;
  if (!pokeDetail) return <div>Error loading data.</div>;

  return (
    <div className="pokemon-detail-card">
      <img
        src={pokeDetail.sprites.other["official-artwork"].front_default}
        alt={selected.name}
      />
      <h2>{selected.name.toUpperCase()}</h2>
      <p>
        <strong>Type:</strong> <TypeBoxes types={pokeDetail.types} />
      </p>
      <p>
        <strong>Abilities:</strong>{" "}
        {pokeDetail.abilities.map((a) => a.ability.name).join(", ")}
      </p>
      <p>
        <strong>Most Used Move:</strong>{" "}
        {selected.top_move ? selected.top_move : "N/A"}
      </p>
      <ul>
        <strong>Base Stats:</strong>
      </ul>
      {pokeStats && <RadarChart statsObj={pokeStats} />}
    </div>
  );
}
