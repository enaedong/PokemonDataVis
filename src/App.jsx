import React, { useEffect, useState, useRef } from "react";
import UsageTable from "./components/UsageTable";
import PokemonDetails from "./components/PokemonDetails";
import ChartControls from "./components/ChartControls";
import "./App.css";

export default function App() {
  const [usageData, setUsageData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [pokeDetail, setPokeDetail] = useState(null);
  const [pokeStats, setPokeStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const [damageDropdownOpen, setDamageDropdownOpen] = useState(false);
  const [damageDropdownValue, setDamageDropdownValue] = useState("All damage");
  const [damageDropdownHover, setDamageDropdownHover] = useState(null);

  const [durabilityDropdownOpen, setDurabilityDropdownOpen] = useState(false);
  const [durabilityDropdownValue, setDurabilityDropdownValue] = useState("All Durability");
  const [durabilityDropdownHover, setDurabilityDropdownHover] = useState(null);

  const damageDropdownRef = useRef();
  const durabilityDropdownRef = useRef();

  // Handle outside click to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        damageDropdownRef.current &&
        !damageDropdownRef.current.contains(event.target)
      ) {
        setDamageDropdownOpen(false);
        setDamageDropdownHover(null);
      }
      if (
        durabilityDropdownRef.current &&
        !durabilityDropdownRef.current.contains(event.target)
      ) {
        setDurabilityDropdownOpen(false);
        setDurabilityDropdownHover(null);
      }
    }

    if (damageDropdownOpen || durabilityDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [damageDropdownOpen, durabilityDropdownOpen]);

  // Load usage data
  useEffect(() => {
    fetch("/usage.json")
      .then((res) => res.json())
      .then((data) => {
        setUsageData(data);
        setFiltered(data);
      });
  }, []);

  // Filter data by search
  useEffect(() => {
    setFiltered(
      usageData.filter((p) =>
        p.name.toLowerCase().includes(search.trim().toLowerCase())
      )
    );
  }, [search, usageData]);

  // Load selected Pokémon details
  useEffect(() => {
    if (!selected) {
      setPokeDetail(null);
      setPokeStats(null);
      return;
    }

    setLoading(true);

    fetch(`https://pokeapi.co/api/v2/pokemon/${selected.safe_name}`)
      .then((res) => {
        if (!res.ok) throw new Error("Pokémon not found");
        return res.json();
      })
      .then((data) => {
        setPokeDetail(data);
        const statsObj = {};
        data.stats.forEach((s) => {
          statsObj[s.stat.name] = s.base_stat;
        });
        setPokeStats(statsObj);
      })
      .catch(() => {
        setPokeDetail(null);
        setPokeStats(null);
      })
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <div className="container">
      <div className="usage-section">
        <h2>Top Pokémon Usage</h2>
        <input
          type="text"
          className="search-bar"
          placeholder="Search Pokémon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
        />
        <div className="usage-table-container">
          <UsageTable
            filtered={filtered}
            selected={selected}
            setSelected={setSelected}
          />
        </div>
      </div>

      <div className="stats-section" id="pokemon-stats">
        <PokemonDetails
          selected={selected}
          pokeDetail={pokeDetail}
          pokeStats={pokeStats}
          loading={loading}
        />
      </div>

      <div className="charts-section" id="charts">
        <h2>Counter Visualization</h2>
        <ChartControls
          damageDropdownOpen={damageDropdownOpen}
          setDamageDropdownOpen={setDamageDropdownOpen}
          damageDropdownHover={damageDropdownHover}
          setDamageDropdownHover={setDamageDropdownHover}
          damageDropdownValue={damageDropdownValue}
          setDamageDropdownValue={setDamageDropdownValue}
          durabilityDropdownOpen={durabilityDropdownOpen}
          setDurabilityDropdownOpen={setDurabilityDropdownOpen}
          durabilityDropdownHover={durabilityDropdownHover}
          setDurabilityDropdownHover={setDurabilityDropdownHover}
          durabilityDropdownValue={durabilityDropdownValue}
          setDurabilityDropdownValue={setDurabilityDropdownValue}
          damageDropdownRef={damageDropdownRef}
          durabilityDropdownRef={durabilityDropdownRef}
        />
        <div className="chart-area">
          <span className="chart-placeholder">Select a chart type above.</span>
        </div>
      </div>
    </div>
  );
}
