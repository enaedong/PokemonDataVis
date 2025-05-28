import React, { useEffect, useState, useRef } from "react";
import ChartControls from "./components/ChartControls";
import UsageTable from "./components/UsageTable";
import PokemonDetails from "./components/PokemonDetails";
import TYPE_COLORS from "./utils/typeColors";
import "./App.css";

export default function App() {
  const [usageData, setUsageData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [pokeDetail, setPokeDetail] = useState(null);
  const [pokeStats, setPokeStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // 차트에 표시할 데이터
  const [items, setItems] = useState([]);
  // 차트에서 사용자가 클릭한 점
  const [selectedItem, setSelectedItem] = useState(null);
  // 공격을 버티는가 or 쓰러트리는가 기준을 선택
  const [koSelected, setKoSelected] = useState(false);
  const [endureSelected, setEndureSelected] = useState(false);
  // 사용자가 입력한 기술 위력
  const powerInput = useRef();

  // 버튼 클릭시 on off
  const switchKo = () => {
    if (koSelected != endureSelected) {
      setEndureSelected(!endureSelected);
    }
    setKoSelected(!koSelected);
  }
  const switchEndure = () => {
    if (koSelected != endureSelected) {
      setKoSelected(!koSelected);
    }
    setEndureSelected(!endureSelected);
  }

  // search 버튼을 눌렀는지 여부
  const [clicked, setClicked] = useState(false);

  // 타입 상성 필터링
  const typeDropdownRef = useRef();
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [typeDropdownValue, setTypeDropdownValue] = useState("All");
  const [typeDropdownHover, setTypeDropdownHover] = useState(null);

  // Handle outside click to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target)
      ) {
        setTypeDropdownOpen(false);
        setTypeDropdownHover(null);
      }
    }
    if (typeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [typeDropdownOpen]);

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

  // Load details for scatter plot clicked Pokémon
  const [selectedItemDetail, setSelectedItemDetail] = useState(null);
  const [selectedItemStats, setSelectedItemStats] = useState(null);
  const [selectedItemLoading, setSelectedItemLoading] = useState(false);

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

  // 1번 탭: 순위표/포켓몬 정보 전환 상태
  const [showUsageTable, setShowUsageTable] = useState(true);

  /////////////////////////////// return ////////////////////////////////
  return (
    <div className="container">
      <div className="usage-section">
        {showUsageTable ? (
          <>
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
                setSelected(null);
              }}
              style={{ marginBottom: 16 }}
            >
              ← Back
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

      {/* 2번 탭: 필터 스켈레톤 UI */}
      <div className="stats-section" id="pokemon-stats">
        {/* 타입 체크박스 */}
        {(() => {
          const [typeAll, setTypeAll] = useState(false);
          const [typeChecks, setTypeChecks] = useState(Array(18).fill(false));
          return (
            <div style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontWeight: 'bold', marginRight: 12 }}>
                  <input type="checkbox" checked={typeAll} onChange={e => setTypeAll(e.target.checked)} style={{ marginRight: 6 }} />
                  모두
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {Array.from({ length: 18 }).map((_, i) => (
                  <label key={i} style={{ fontWeight: 'bold' }}>
                    <input
                      type="checkbox"
                      checked={typeChecks[i]}
                      onChange={e => {
                        const arr = [...typeChecks];
                        arr[i] = e.target.checked;
                        setTypeChecks(arr);
                      }}
                      style={{ marginRight: 6 }}
                    />
                    타입{i + 1}
                  </label>
                ))}
              </div>
            </div>
          );
        })()}
        {/* 날씨 체크박스 */}
        {(() => {
          const [weatherChecks, setWeatherChecks] = useState(Array(4).fill(false));
          return (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>날씨</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <label key={i}>
                    <input
                      type="checkbox"
                      checked={weatherChecks[i]}
                      onChange={e => {
                        const arr = [...weatherChecks];
                        arr[i] = e.target.checked;
                        setWeatherChecks(arr);
                      }}
                      style={{ marginRight: 6 }}
                    />
                    날씨{i + 1}
                  </label>
                ))}
              </div>
            </div>
          );
        })()}
        {/* 랭크 슬라이더 */}
        {(() => {
          const [ranks, setRanks] = useState(Array(6).fill(0));
          return (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>랭크</div>
              <div style={{ display: 'flex', gap: 24 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i}>
                      <label style={{ marginRight: 8 }}>랭크{i + 1}</label>
                      <input
                        type="range"
                        min={0}
                        max={6}
                        value={ranks[i]}
                        onChange={e => {
                          const arr = [...ranks];
                          arr[i] = Number(e.target.value);
                          setRanks(arr);
                        }}
                        style={{ width: '70%' }}
                      />
                      <span style={{ marginLeft: 8 }}>{ranks[i]}</span>
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i}>
                      <label style={{ marginRight: 8 }}>랭크{i + 4}</label>
                      <input
                        type="range"
                        min={0}
                        max={6}
                        value={ranks[i + 3]}
                        onChange={e => {
                          const arr = [...ranks];
                          arr[i + 3] = Number(e.target.value);
                          setRanks(arr);
                        }}
                        style={{ width: '70%' }}
                      />
                      <span style={{ marginLeft: 8 }}>{ranks[i + 3]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
        {/* 기술 드롭다운 */}
        {(() => {
          const [move, setMove] = useState('');
          return (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>기술</div>
              <select value={move} onChange={e => setMove(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid #bbb' }}>
                <option value="">기술 선택</option>
                <option value="move1">기술1</option>
                <option value="move2">기술2</option>
                <option value="move3">기술3</option>
              </select>
            </div>
          );
        })()}
      </div>

      <div className="charts-section" id="charts">
        <h2>Counter Visualization</h2>
        <ChartControls
          selected={selected}
          items={items} setItems={setItems}
          selectedItem={selectedItem} setSelectedItem={setSelectedItem}
          koSelected={koSelected} switchKo={switchKo}
          endureSelected={endureSelected} switchEndure={switchEndure}
          powerInput={powerInput}
          clicked={clicked} setClicked={setClicked}
          typeDropdownOpen={typeDropdownOpen} setTypeDropdownOpen={setTypeDropdownOpen}
          typeDropdownHover={typeDropdownHover} setTypeDropdownHover={setTypeDropdownHover}
          typeDropdownValue={typeDropdownValue} setTypeDropdownValue={setTypeDropdownValue}
          typeDropdownRef={typeDropdownRef}
          TYPE_COLORS={TYPE_COLORS}
        >
        </ChartControls>
      </div>

      
      <div className="scatter-detail-section" id="scatter-detail">
        <h2>Counter Pokémon Details</h2>
        <PokemonDetails
          selected={selectedItem ? { name: selectedItem } : null}
          pokeDetail={selectedItemDetail}
          pokeStats={selectedItemStats}
          loading={selectedItemLoading}
        />
      </div>
    </div>
  );
}
