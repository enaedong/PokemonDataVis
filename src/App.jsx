import React, { useEffect, useState, useRef } from "react";
import UsageTable from "./components/UsageTable";
import FilterPanel from "./components/FilterPanel";
import PokemonDetails from "./components/PokemonDetails";
import EndureKOChart from "./components/EndureKOChart";
import { getMoveDetails } from "./utils/moveHelpers";
import "./App.css";

export default function App() {
  const [dex, setDex] = useState([]);
  const [usage, setUsage] = useState([]);
  const [selected, setSelected] = useState(null);
  const [pokeDetail, setPokeDetail] = useState(null);
  const [pokeStats, setPokeStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // 날씨 필드
  const [selectedWeather, setSelectedWeather] = useState("");
  const [selectedTerrain, setSelectedTerrain] = useState("");

  // 메타 & 카운터 포켓몬의 랭크 변화
  const [ranks, setRanks] = useState(Array(6).fill(0));

  // 차트에서 사용자가 클릭한 점
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedMove, setSelectedMove] = useState(null);
  const [moveList, setMoveList] = useState([]);

  // Speed check state
  const [speedOnly, setSpeedOnly] = useState(false);

  // Load usage data
  useEffect(() => {
    const loadData = async () => {
      const [dexRes, usageRes] = await Promise.all([
        fetch("/dex.json"),
        fetch("/usage.json"),
      ]);

      const [dexData, usageData] = await Promise.all([
        dexRes.json(),
        usageRes.json(),
      ]);

      setDex(dexData);
      setUsage(usageData);
    };

    loadData().catch((err) => console.error("Failed to load data", err));
  }, []);

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

  // Load details for scatter plot clicked Pokémon
  const [selectedItemDetail, setSelectedItemDetail] = useState(null);
  const [selectedItemStats, setSelectedItemStats] = useState(null);
  const [selectedItemLoading, setSelectedItemLoading] = useState(false);
  const [atkType, setAtkType] = useState({});
  const [typeNames, setTypeNames] = useState([]);
  const [typeChecks, setTypeChecks] = useState([]); // all checked by default
  const [typeAll, setTypeAll] = useState(false);

  useEffect(() => {
    fetch("/atkType.json")
      .then((res) => res.json())
      .then((data) => {
        const names = Object.keys(data);
        setAtkType(data);
        setTypeNames(names);
        setTypeChecks(Array(names.length).fill(false));
      })
      .catch((err) => console.error("Failed to load atkType.json:", err));
  }, []);

  useEffect(() => {
    // If all checkboxes are checked, set typeAll to true, otherwise false
    if (!selected) return;
    if (typeChecks.length === typeNames.length) {
      setTypeAll(typeChecks.every(Boolean));
    }
  }, [typeChecks, typeNames.length]);

  useEffect(() => {
    if (!selectedItem) {
      setSelectedItemDetail(null);
      setSelectedItemStats(null);
      return;
    }
    setSelectedItemLoading(true);
    // safe_name 변환
    const safeName = selectedItem
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/\./g, "");
    fetch(`https://pokeapi.co/api/v2/pokemon/${safeName}`)
      .then((res) => {
        if (!res.ok) throw new Error("Pokémon not found");
        return res.json();
      })
      .then((data) => {
        setSelectedItemDetail(data);
        const statsObj = {};
        data.stats.forEach((s) => {
          statsObj[s.stat.name] = s.base_stat;
        });
        setSelectedItemStats(statsObj);
      })
      .catch(() => {
        setSelectedItemDetail(null);
        setSelectedItemStats(null);
      })
      .finally(() => setSelectedItemLoading(false));
  }, [selectedItem]);

  // 순위표/포켓몬 정보 전환 상태
  const [showUsageTable, setShowUsageTable] = useState(true);
  const selectedUsage = selected;
  const selectedDex = dex.find((p) => p.name === selected?.name);

  const selectedPokemon = selectedDex
    ? { ...selectedDex, moves: selectedUsage?.moves || {} }
    : null;

  // 카운터 포켓몬 정보
  const selectedItemUsage = usage.find((p) => p.name === selectedItem);
  const selectedItemDex = dex.find((p) => p.name === selectedItem);
  const selectedItemPokemon =
    selectedItemUsage && selectedItemDex
      ? { ...selectedItemDex, ...selectedItemUsage }
      : selectedItemUsage || selectedItemDex || null;

  useEffect(() => {
    if (!selectedPokemon?.moves) {
      if (moveList.length > 0) setMoveList([]);
      if (selectedMove !== null) setSelectedMove(null);
      return;
    }

    const validMoves = Object.keys(selectedPokemon.moves).filter((move) => {
      const details = getMoveDetails(move);
      return details.basePower && details.basePower >= 40;
    });

    // Compare contents before updating state
    const isSame =
      validMoves.length === moveList.length &&
      validMoves.every((m, i) => m === moveList[i]);

    if (!isSame) {
      setMoveList(validMoves);
      setSelectedMove(validMoves.length > 0 ? validMoves[0] : null);
    }
  }, [selectedPokemon, moveList, selectedMove]);

  // Speed check
  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    }, [value]);
    return ref.current;
  }

  const prevSelected = usePrevious(selected);

  useEffect(() => {
    // 포켓몬을 처음 선택할 때만 모든 타입 필터를 활성화
    if (prevSelected == null && selected && typeNames.length > 0) {
      setTypeChecks(Array(typeNames.length).fill(true));
      setTypeAll(true);
    }
  }, [selected, typeNames.length]);

  useEffect(() => {
    if (
      prevSelected &&
      selected &&
      prevSelected.name !== selected.name
    ) {
      setSpeedOnly(false);
    }
  }, [selected, prevSelected]);
  
  /////////////////////////////// return ////////////////////////////////
  return (
    <div className="container">
      <div className="usage-section">
        {showUsageTable ? (
          <>
            <h2 style={{ textAlign: 'center', width: '100%' }}>Top Pokémon Usage</h2>
            <div className="usage-table-container">
              <UsageTable
                data={usage}
                selected={selected}
                setSelected={(pokemon) => {
                  setSelected(pokemon);
                  setShowUsageTable(false);
                }}
              />
            </div>
          </>
        ) : (
          <>
            <button
              className="back-btn"
              onClick={() => {
                setShowUsageTable(true);
              }}
              style={{ marginBottom: 16 }}
            >
              Back
            </button>
            <PokemonDetails
              selected={selected}
              pokeDetail={pokeDetail}
              pokeStats={pokeStats}
              loading={loading}
            />
          </>
        )}
      </div>

      {/* 필터 UI */}
      <div className="stats-section" id="pokemon-stats">
        <FilterPanel
          selectedWeather={selectedWeather}
          setSelectedWeather={setSelectedWeather}
          ranks={ranks}
          setRanks={setRanks}
          selectedTerrain={selectedTerrain}
          setSelectedTerrain={setSelectedTerrain}
          selectedMove={selectedMove}
          setSelectedMove={setSelectedMove}
          selectedPokemon={selectedPokemon}
          moveList={moveList}
          typeChecks={typeChecks}
          setTypeChecks={setTypeChecks}
          typeAll={typeAll}
          setTypeAll={setTypeAll}
          typeNames={typeNames}
          speedOnly={speedOnly}
          setSpeedOnly={setSpeedOnly}
        />
      </div>

      <div className="charts-section" id="charts">
        <h2 style={{ textAlign: 'center', width: '100%' }}>Counter Visualization</h2>
        <EndureKOChart
          selectedPokemon={selectedPokemon}
          dexData={dex}
          usageData={usage}
          selectedMove={selectedMove}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          typeChecks={typeChecks}
          typeNames={typeNames}
          selectedWeather={selectedWeather}
          selectedTerrain={selectedTerrain}
          ranks={ranks}
          speedOnly={speedOnly}
          setSpeedOnly={setSpeedOnly}
        />
      </div>

      <div className="scatter-detail-section" id="scatter-detail">
        <h2 style={{ textAlign: 'center', width: '100%' }}>Counter Pokémon Details</h2>
        <PokemonDetails
          selected={selectedItemPokemon}
          pokeDetail={selectedItemDetail}
          pokeStats={selectedItemStats}
          loading={selectedItemLoading}
        />
      </div>
    </div>
  );
}
