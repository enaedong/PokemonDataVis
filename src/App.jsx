import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import "./App.css"; // Use your existing styles

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
  const [cliked, setClicked] = useState(false);

  // 타입 상성 필터링
  const typeDropdownRef = useRef();
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [typeDropdownValue, setTypeDropdownValue] = useState("All");
  const [typeDropdownHover, setTypeDropdownHover] = useState(null);
  const typeOptions = [
    "All",
    "Advantage",
    "Disadvantage"
  ];

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

function searchDex(ko, end, ty, pow, targetName){
  console.log("pp", ko, end, ty, pow, targetName);
  // 모든 포켓몬 하나하나 데미지 계산후 저장
  // ko & end = knock-out vs endure
  // ty = 상성 유리 불리 중 사용자가 보고 싶은 것
  // pow = 사용자가 입력한 기술 위력
  // target = 메타 포켓몬 이름 (데이터는 여기서 찾음)
  function calcDm(isKo, tar, dex, pow, type){
    // 몇대 버티는지, 몇방에 잡는지 계산
    // isKo = 사용자가 knock-out을 선택했는가
    // tar = 메타(타켓) 포켓몬 정보
    // dex = 카운터 포켓몬 정보
    const hp = 60 + Math.floor((2 * tar.stat.hp + 31 + 63) / 2)
    const atk = Math.floor((Math.floor((2 * tar.stat.atk + 31 + 63) / 2) + 5) * 1.1)
    const def = Math.floor((Math.floor((2 * tar.stat.def + 31 + 63) / 2) + 5) * 1.1)
    const spa = Math.floor((Math.floor((2 * tar.stat.spa + 31 + 63) / 2) + 5) * 1.1)
    const spd = Math.floor((Math.floor((2 * tar.stat.spd + 31 + 63) / 2) + 5) * 1.1)

    const hpDex = 60 + Math.floor((2 * dex.stat.hp + 31 + 63) / 2)
    const atkDex = Math.floor((Math.floor((2 * dex.stat.atk + 31 + 63) / 2) + 5) * 1.1)
    const defDex = Math.floor((Math.floor((2 * dex.stat.def + 31 + 63) / 2) + 5) * 1.1)
    const spaDex = Math.floor((Math.floor((2 * dex.stat.spa + 31 + 63) / 2) + 5) * 1.1)
    const spdDex = Math.floor((Math.floor((2 * dex.stat.spd + 31 + 63) / 2) + 5) * 1.1)

    // 메타 포켓몬을 몇방에 잡을수 있는가
    if(type === 0){
      return 5;
    }
    if(isKo){
      const atkCount = hp / ((22 * pow * (atkDex / def) / 50 + 2) * 1.5 * type * 0.925)
      const spaCount = hp / ((22 * pow * (spaDex / spd) / 50 + 2) * 1.5 * type * 0.925)
      const dmgCount = Math.max(atkCount, spaCount) > 5 ? 5 : Math.max(atkCount, spaCount)
      return dmgCount;
    }
    else{
      // 메타 포켓몬 공격을 몇방 버티는가
      const atkCount = hpDex / ((22 * pow * (atk / defDex) / 50 + 2) * 1.5 * type * 0.925)
      const spaCount = hpDex / ((22 * pow * (spa / spdDex) / 50 + 2) * 1.5 * type * 0.925)
      const dmgCount = Math.max(atkCount, spaCount) > 5 ? 5 : Math.max(atkCount, spaCount)
      return dmgCount;
    }
  }
  fetch('/dex.json')
  .then((res) => res.json())
  .then((data) => {
    return fetch('/atkType.json')
      .then(res => res.json())
      .then(typeData => {
        const target = data.find(obj => obj.name == targetName);
        const pokeResult = [];
        if(ko){
          data.forEach(poke => {
            let typeMatch;
            // 타입 상성 계산
            // 타겟 포켓몬 복합타입인가
            if(target.type.length > 1){   
              // 카운터 포켓몬이 복합타입인가           
              if(poke.type.length > 1){
                // 최종 타입 상성 (0~4)
                typeMatch = Math.max(typeData[poke.type[0]][target.type[0]] * typeData[poke.type[0]][target.type[1]], typeData[poke.type[1]][target.type[0]] * typeData[poke.type[1]][target.type[1]])
              }
              else{
                typeMatch = typeData[poke.type[0]][target.type[0]] * typeData[poke.type[0]][target.type[1]]
              }
            }
            else{
              if(poke.type.length > 1){
                // 최종 타입 상성 (0~4)
                typeMatch = Math.max(typeData[poke.type[0]][target.type[0]], typeData[poke.type[1]][target.type[0]])
              }
              else{
                typeMatch = typeData[poke.type[0]][target.type[0]]
              }
            }
            const pokeObj = {};
            // 이름 & 1타입 & 타입 유불리 & 횟수 계산 결과 & 스피드를 object로 묶어서 저장
            const typeAdv = typeMatch >= 1 ? true : false
            if((ty == "Advantage" && typeAdv) || (ty == "Disadvantage" && !typeAdv) || ty == "All"){
              pokeObj.name = poke.name;
              pokeObj.type = poke.type[0].toLowerCase();
              pokeObj.typeAdv = typeAdv;
              pokeObj.count = calcDm(true, target, poke, pow, typeMatch);
              pokeObj.speed = poke.stat.spe;
              pokeResult.push(pokeObj);
            }
          })
        }
        else if(end){
          // 몇 방 버티는지 계산
          data.forEach(poke => {
            let typeMatch;
            // 타입 상성 계산
            // 타겟 포켓몬 복합타입인가
            if(poke.type.length > 1){   
              // 카운터 포켓몬이 복합타입인가           
              if(target.type.length > 1){
                // 최종 타입 상성 (0~4)
                typeMatch = Math.max(typeData[target.type[0]][poke.type[0]] * typeData[target.type[0]][poke.type[1]], typeData[target.type[1]][poke.type[0]] * typeData[target.type[1]][poke.type[1]])
              }
              else{
                typeMatch = typeData[target.type[0]][poke.type[0]] * typeData[target.type[0]][poke.type[1]]
              }
            }
            else{
              if(target.type.length > 1){
                // 최종 타입 상성 (0~4)
                typeMatch = Math.max(typeData[target.type[0]][poke.type[0]], typeData[target.type[1]][poke.type[0]])
              }
              else{
                typeMatch = typeData[target.type[0]][poke.type[0]]
              }
            }
            const pokeObj = {};
            // 이름 & 1타입 & 타입 유불리 & 횟수 계산 결과 & 스피드를 object로 묶어서 저장
            const typeAdv = typeMatch > 1 ? false : true
            if((ty == "Advantage" && typeAdv) || (ty == "Disadvantage" && !typeAdv) || ty == "All"){
              pokeObj.name = poke.name;
              pokeObj.type = poke.type[0].toLowerCase();
              pokeObj.typeAdv = typeAdv;            
              pokeObj.count = calcDm(false, target, poke, pow, typeMatch);
              pokeObj.speed = poke.stat.spe;
              pokeResult.push(pokeObj);
            }
          })
        }
        setItems(pokeResult);
      })
  })
  .catch(err => console.error('Error fetching JSON:', err));
}

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
        <div className="search-buttons-row">          
          Search for Pokemon that
        </div>
        <div className="chart-buttons-row">
          <button className={koSelected ? "chart-btn-red" : "chart-btn"} onClick={() => switchKo()}>Knock-Out</button>
          <button className={endureSelected ? "chart-btn-green" : "chart-btn"} onClick={() => switchEndure()}>Endure</button>
          {selected != null ? <div className="target-name">{selected.name.toUpperCase()}</div> : <div className="target-name">target Pokemon</div>}
          {/* Damage Dropdown */}
          {/* <div
            className="dropdown-btn-wrapper"
            ref={damageDropdownRef}
            tabIndex={0}
            // onBlur={() => setDamageDropdownOpen(false)}
          >
            <button
              className="chart-btn dropdown-btn"
              onClick={() => setDamageDropdownOpen((open) => !open)}
              aria-haspopup="listbox"
              aria-expanded={damageDropdownOpen}
            >
              {damageDropdownValue}
              <span className="dropdown-arrow">&#9662;</span>
            </button>
            {damageDropdownOpen && (
              <ul className="dropdown-menu" role="listbox">
                {damageOptions.map((option) => (
                  <li
                    key={option}
                    className={
                      "dropdown-menu-item" +
                      ((damageDropdownHover || damageDropdownValue) === option
                        ? " selected"
                        : "")
                    }
                    role="option"
                    aria-selected={
                      (damageDropdownHover || damageDropdownValue) === option
                    }
                    onMouseEnter={() => setDamageDropdownHover(option)}
                    onMouseLeave={() => setDamageDropdownHover(null)}
                    onClick={() => {
                      setDamageDropdownValue(option);
                      setDamageDropdownOpen(false);
                      setDamageDropdownHover(null);                      
                    }}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>           */}
          {/* Type Button */}
          {/* <button className="chart-btn">Type</button> */}
          {/* Durability Dropdown */}
          {/* <div
            className="dropdown-btn-wrapper"
            ref={durabilityDropdownRef}
            tabIndex={0}
            // onBlur={() => setDurabilityDropdownOpen(false)}
          >
            <button
              className="chart-btn dropdown-btn"
              onClick={() => setDurabilityDropdownOpen((open) => !open)}
              aria-haspopup="listbox"
              aria-expanded={durabilityDropdownOpen}
            >
              {durabilityDropdownValue}
              <span className="dropdown-arrow">&#9662;</span>
            </button>
            {durabilityDropdownOpen && (
              <ul className="dropdown-menu" role="listbox">
                {durabilityOptions.map((option) => (
                  <li
                    key={option}
                    className={
                      "dropdown-menu-item" +
                      ((durabilityDropdownHover || durabilityDropdownValue) === option
                        ? " selected"
                        : "")
                    }
                    role="option"
                    aria-selected={
                      (durabilityDropdownHover || durabilityDropdownValue) === option
                    }
                    onMouseEnter={() => setDurabilityDropdownHover(option)}
                    onMouseLeave={() => setDurabilityDropdownHover(null)}
                    onClick={() => {
                      setDurabilityDropdownValue(option);
                      setDurabilityDropdownOpen(false);
                      setDurabilityDropdownHover(null);   
                    }}                                                          
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>           */}
        </div>  
        {(koSelected || endureSelected) &&
          <div className="chart-buttons-row">            
            <div className="target-name">with Type</div>
            <div
              className="dropdown-btn-wrapper"
              ref={typeDropdownRef}
              tabIndex={0}            
            >
              <button
                className="chart-btn dropdown-btn"
                onClick={() => setTypeDropdownOpen((open) => !open)}
                aria-haspopup="listbox"
                aria-expanded={typeDropdownOpen}
              >
                {typeDropdownValue}
                <span className="dropdown-arrow">&#9662;</span>
              </button>
              {typeDropdownOpen && (
                <ul className="dropdown-menu" role="listbox">
                  {typeOptions.map((option) => (
                    <li
                      key={option}
                      className={
                        "dropdown-menu-item" +
                        ((typeDropdownHover || typeDropdownValue) === option
                          ? " selected"
                          : "")
                      }
                      role="option"
                      aria-selected={
                        (typeDropdownHover || typeDropdownValue) === option
                      }
                      onMouseEnter={() => setTypeDropdownHover(option)}
                      onMouseLeave={() => setTypeDropdownHover(null)}
                      onClick={() => {
                        setTypeDropdownValue(option);
                        setTypeDropdownOpen(false);
                        setTypeDropdownHover(null);   
                      }}                                                          
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div style={{visibility: 'hidden'}} className="target-name">with Type</div>
          </div>
        }      
        {(koSelected || endureSelected) && 
          <div className="search-buttons-row">
            <div className="target-name">Attack power</div>     
            <input className="move-btn" type="number" placeholder="Enter Move Power" style={{ textAlign: 'center' }}
              ref={powerInput}
            />   
            <button className="chart-btn" 
              onClick={() => {   
                setClicked(true)             
                searchDex(koSelected, endureSelected, typeDropdownValue, powerInput.current.value, selected.name)}}>search</button>         
          </div>
        }              
        <div className="chart-area">
          {/* Chart will be rendered here */}
          {cliked ?
            (<svg width={500} height={300}>
              <g ref={gx}
                transform={`translate(0, ${height - marginBottom})`} />
              <g ref={gy}
                transform={`translate(${marginLeft}, 0)`} />
              <g>
                {items.map((item) => {						
                  return (
                    <g key={item.name}
                      className= 'datapoint'
                      style={{ fill: TYPE_COLORS[item.type] }}
                      transform={`translate(${
                          x(item.count)}, ${
                          y(item.speed)})`}>
                      <circle cx="0" cy="0" r="3"
                        onClick={() => setSelectedItem(item.name)}
                      />		
                      <g className= {selectedItem == item.name ? 'display' : 'hide'}>
                        <rect x="-30" y="-20" width="60" height="20" fill="black" rx="5" ry="5"></rect>
                        <text x="0" y="-10" textAnchor="middle" fontSize="10" fill="white"> {item.name} </text>
                      </g>	
                    </g>
                  );
                })}
              </g>
            </svg>) : (<span className="chart-placeholder">Click the button above to see the result</span>)
          }
        </div>
      </div>
    </div>
  );
}