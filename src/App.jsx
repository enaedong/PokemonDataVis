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

function TypeBoxes({ types }) {
  if (!types) return null;
  return (
    <>
      {types.map((typeObj, i) => {
        const type = typeObj.type.name;
        const color = TYPE_COLORS[type] || "#AAA";
        return (
          <span
            key={i}
            className="type-box"
            style={{ background: color }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        );
      })}
    </>
  );
}

function RadarChart({ statsObj }) {
  const ref = useRef();

  useEffect(() => {
    if (!statsObj) return;
    d3.select(ref.current).selectAll("*").remove();

    const statNames = [
      "hp",
      "attack",
      "defense",
      "special-attack",
      "special-defense",
      "speed"
    ];
    const displayNames = ["HP", "Atk", "Def", "SpA", "SpD", "Spe"];
    const stats = statNames.map((name) => statsObj[name]);
    const maxStat = 180;
    const width = 260,
      height = 260,
      levels = 4;
    const radius = Math.min(width, height) / 2 - 30;
    const angleSlice = (Math.PI * 2) / statNames.length;
    const center = { x: width / 2, y: height / 2 };

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Grid circles
    for (let level = 1; level <= levels; level++) {
      const r = radius * (level / levels);
      svg
        .append("circle")
        .attr("cx", center.x)
        .attr("cy", center.y)
        .attr("r", r)
        .attr("fill", "none")
        .attr("stroke", "#bbb")
        .attr("stroke-width", 1);
    }

    // Axis lines and stat labels
    for (let i = 0; i < statNames.length; i++) {
      const angle = angleSlice * i - Math.PI / 2;
      const x2 = center.x + radius * Math.cos(angle);
      const y2 = center.y + radius * Math.sin(angle);

      svg
        .append("line")
        .attr("x1", center.x)
        .attr("y1", center.y)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", "#bbb")
        .attr("stroke-width", 1);

      svg
        .append("text")
        .attr("x", center.x + (radius + 18) * Math.cos(angle))
        .attr("y", center.y + (radius + 18) * Math.sin(angle) + 4)
        .attr("text-anchor", "middle")
        .attr("font-size", "13px")
        .attr("fill", "#222")
        .attr("font-weight", "bold")
        .text(displayNames[i]);
    }

    // Radar area
    const points = stats.map((stat, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const r = (stat / maxStat) * radius;
      return [
        center.x + r * Math.cos(angle),
        center.y + r * Math.sin(angle)
      ];
    });
    points.push(points[0]);

    svg
      .append("polygon")
      .attr("points", points.map((p) => p.join(",")).join(" "))
      .attr("fill", "rgba(76,175,80,0.20)")
      .attr("stroke", "#4caf50")
      .attr("stroke-width", 2);

    // Stat dots and value labels
    stats.forEach((stat, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const r = (stat / maxStat) * radius;
      const x = center.x + r * Math.cos(angle);
      const y = center.y + r * Math.sin(angle);

      svg
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 4)
        .attr("fill", "#4caf50")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5);

      svg
        .append("text")
        .attr("x", center.x + (r + 15) * Math.cos(angle))
        .attr("y", center.y + (r + 15) * Math.sin(angle) + 4)
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("fill", "#222")
        .text(stat);
    });
  }, [statsObj]);

  return <div id="radar-chart" ref={ref}></div>;
}

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

  // Close dropdowns on outside click
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

  // Filter on search
  useEffect(() => {
    setFiltered(
      usageData.filter((p) =>
        p.name.toLowerCase().includes(search.trim().toLowerCase())
      )
    );
  }, [search, usageData]);

  // Fetch Pokémon details
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
                      selected && selected.rank === pokemon.rank
                        ? "#e8f5e9"
                        : undefined
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
        </div>
      </div>
      <div className="stats-section" id="pokemon-stats">
        {!selected && <h2>Select a Pokémon to see stats.</h2>}
        {selected && loading && <div>Loading...</div>}
        {selected && pokeDetail && (
          <div className="pokemon-detail-card">
            <img
              src={
                pokeDetail.sprites.other["official-artwork"].front_default
              }
              alt={selected.name}
            />
            <h2>{selected.name.toUpperCase()}</h2>
            <p>
              <strong>Type:</strong>{" "}
              <TypeBoxes types={pokeDetail.types} />
            </p>
            <p>
              <strong>Abilities:</strong>{" "}
              {pokeDetail.abilities
                .map((a) => a.ability.name)
                .join(", ")}
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
        )}
        {selected && !pokeDetail && !loading && (
          <div>Error loading data.</div>
        )}
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