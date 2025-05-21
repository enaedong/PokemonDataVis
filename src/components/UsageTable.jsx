// components/UsageTable.jsx
import React from "react";

export default function UsageTable({ filtered, selected, setSelected }) {
  return (
    <table className="usage-table">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Pokémon</th>
          <th>Usage %</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((pokemon) => (
          <tr
            key={pokemon.rank}
            onClick={() => setSelected(pokemon)}
            style={{
              background:
                selected && selected.rank === pokemon.rank ? "#e8f5e9" : undefined
            }}
          >
            <td>{pokemon.rank}</td>
            <td>{pokemon.name}</td>
            <td>
              <div className="usage-bar-container">
                <div className="usage-bar-bg">
                  <div
                    className="usage-bar-fill"
                    style={{ width: `${pokemon.usage}%` }}
                  ></div>
                </div>
                <span className="usage-label">
                  {parseFloat(pokemon.usage).toFixed(1)}%
                </span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
