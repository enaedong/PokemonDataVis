import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import "./App.css"; // Use your existing styles
import ChartControls from "./components/ChartControls";

const TYPE_COLORS = {
  normal:   '#A8A77A',
  fire:     '#EE8130',
  water:    '#6390F0',
  electric: '#F7D02C',
  grass:    '#7AC74C',
  ice:      '#96D9D6',
  fighting: '#C22E28',
  poison:   '#A33EA1',
  ground:   '#E2BF65',
  flying:   '#A98FF3',
  psychic:  '#F95587',
  bug:      '#A6B91A',
  rock:     '#B6A136',
  ghost:    '#735797',
  dragon:   '#6F35FC',
  dark:     '#705746',
  steel:    '#B7B7CE',
  fairy:    '#D685AD'
};
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
  // const [damageDropdownOpen, setDamageDropdownOpen] = useState(false);
  // const [damageDropdownValue, setDamageDropdownValue] = useState("All damage");
  // const [damageDropdownHover, setDamageDropdownHover] = useState(null);

  // const [durabilityDropdownOpen, setDurabilityDropdownOpen] = useState(false);
  // const [durabilityDropdownValue, setDurabilityDropdownValue] = useState("All Durability");
  // const [durabilityDropdownHover, setDurabilityDropdownHover] = useState(null);

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
    if(koSelected != endureSelected){
      setEndureSelected(!endureSelected);  
    }
    setKoSelected(!koSelected);        
  }
  const switchEndure = () => {
    if(koSelected != endureSelected){
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

  // const damageOptions = [
  //   "All damage",
  //   "One shot kill",
  //   "Two shot kill",
  //   "Three shot kill"
  // ];

  // const durabilityOptions = [
  //   "All Durability",
  //   "Endure once",
  //   "Endure twice",
  //   "Endure thrice"
  // ];

  // const damageDropdownRef = useRef();
  // const durabilityDropdownRef = useRef();

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
      // if (
      //   damageDropdownRef.current &&
      //   !damageDropdownRef.current.contains(event.target)
      // ) {
      //   setDamageDropdownOpen(false);
      //   setDamageDropdownHover(null);
      // }
      // if (
      //   durabilityDropdownRef.current &&
      //   !durabilityDropdownRef.current.contains(event.target)
      // ) {
      //   setDurabilityDropdownOpen(false);
      //   setDurabilityDropdownHover(null);
      // }
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

  // Define constant variables.
	const width = 500;
	const height = 300;
	const marginTop = 20;
	const marginBottom = 20;
	const marginLeft = 40;
	const marginRight = 20;

	// Set scales.
	const x = d3.scaleLinear()
		.domain([0, 5])
		.range([marginLeft, width - marginRight]);
	const y = d3.scaleLinear()
		.domain([0, 200])
		.range([height - marginBottom, marginTop]);

	// Set axes.
	const gx = useRef();
	const gy = useRef();
	useEffect(() => void d3.select(gx.current).call(
		d3.axisBottom(x).ticks(6)), [gx, x]);
	useEffect(() => void d3.select(gy.current).call(
		d3.axisLeft(y)), [gx, y]);

/////////////////////////////// return ////////////////////////////////
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
          typeDropdownRef={typeDropdownRef} x={x} y={y} gx={gx} gy={gy}
          height={height} marginBottom={marginBottom} marginLeft={marginLeft}
          TYPE_COLORS={TYPE_COLORS}>
        </ChartControls>
      </div>
    </div>
  );
}
