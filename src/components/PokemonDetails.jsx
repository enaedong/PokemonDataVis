import TypeBoxes from "./TypeBoxes";
import RadarChart from "./RadarChart";
import MoveBoxes from "./MoveBoxes";
import React from "react";

export default function PokemonDetails({
  selected,
  pokeDetail,
  pokeStats,
  loading,
}) {
  if (!selected) return <h2>Select a Pokémon to see stats.</h2>;
  if (loading) return <div>Loading...</div>;
  if (!pokeDetail) return <div>Error loading data.</div>;

  return (
    <div className="pokemon-detail-card">
      <ImageWithSpinner
        src={pokeDetail.sprites.other["official-artwork"].front_default}
        alt={selected.name}
      />
      <h2>{selected.name.toUpperCase()}</h2>
      <div>
        <strong>Type:</strong> <TypeBoxes types={pokeDetail.types} />
      </div>
      <div>
        <strong>Abilities:</strong>{" "}
        {Array.isArray(selected.ability) && selected.ability.length > 0 ? (
          selected.ability.map((a) => a.trim()).join(", ")
        ) : pokeDetail.abilities && pokeDetail.abilities.length > 0 ? (
          pokeDetail.abilities
            .map(
              (a) =>
                a.ability.name.charAt(0).toUpperCase() + a.ability.name.slice(1)
            )
            .join(", ")
        ) : (
          <span>N/A</span>
        )}
      </div>
      <div>
        <strong>Items:</strong>{" "}
        {typeof selected.items === "string" && selected.items.trim() !== "" ? (
          selected.items
        ) : Array.isArray(selected.items) && selected.items.length > 0 ? (
          selected.items.join(", ")
        ) : (
          <span>N/A</span>
        )}
      </div>
      <div>
        <strong>Most Used Moves:</strong>{" "}
        {selected.moves ? (
          <MoveBoxes
            moveNames={Object.keys(selected.moves)}
            moveUsages={selected.moves}
          />
        ) : (
          <div>N/A</div>
        )}
      </div>
      <div>
        <strong>Base Stats:</strong>
        {pokeStats && <RadarChart statsObj={pokeStats} />}
      </div>
    </div>
  );
}

function ImageWithSpinner({ src, alt }) {
  const [loaded, setLoaded] = React.useState(false);
  return (
    <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
      {!loaded && (
        <div className="poke-spinner" style={{ width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            border: '6px solid #f3f3f3',
            borderTop: '6px solid #4caf50',
            borderRadius: '50%',
            width: 48,
            height: 48,
            animation: 'spin 1s linear infinite',
          }} />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        style={{
          width: 200,
          height: 200,
          objectFit: 'contain',
          display: loaded ? 'block' : 'none',
        }}
        onLoad={() => setLoaded(true)}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
