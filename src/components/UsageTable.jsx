import { useState, useEffect, useRef } from "react";

export default function UsageTable({ data, selected, setSelected }) {
  const [search, setSearch] = useState("");
  const [animatedWidths, setAnimatedWidths] = useState({});
  const prevDataRef = useRef([]);

  useEffect(() => {
    // usage 값이 바뀔 때마다 0에서 실제값까지 애니메이션
    const newAnimated = {};
    data.forEach((pokemon) => {
      newAnimated[pokemon.rank] = 0;
    });
    setAnimatedWidths(newAnimated);
    const timeout = setTimeout(() => {
      const target = {};
      data.forEach((pokemon) => {
        target[pokemon.rank] = pokemon.usage;
      });
      setAnimatedWidths(target);
    }, 30);
    return () => clearTimeout(timeout);
  }, [data]);

  const filtered = data.filter(
    (pokemon) =>
      pokemon.rank !== null &&
      pokemon.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="usage-table-wrapper">
      <input
        type="text"
        className="search-bar"
        placeholder="Search Pokémon..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoComplete="off"
      />
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
              className={selected && selected.rank === pokemon.rank ? "selected" : ""}
            >
              <td>{pokemon.rank}</td>
              <td>{pokemon.name}</td>
              <td>
                <div className="usage-bar-container">
                  <div className="usage-bar-bg">
                    <div
                      className="usage-bar-fill"
                      style={{
                        width: `${animatedWidths[pokemon.rank] || 0}%`,
                        transition: 'width 0.7s ease',
                      }}
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
      <button
        className="back-btn"
        onClick={() => {
          setShowUsageTable(true);
        }}
        style={{ marginBottom: 28 }}
      >
        ← Back
      </button>
    </div>
  );
}
