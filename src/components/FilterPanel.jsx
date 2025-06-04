// import React, { useState } from "react";
import TYPE_COLORS from '../utils/typeColors';

export default function FilterPanel({
  selectedWeather,
  setSelectedWeather,
  ranks,
  setRanks,
  selectedTerrain,
  setSelectedTerrain,
  selectedMove,
  setSelectedMove,
  selectedPokemon,
  moveList,
  typeChecks,
  setTypeChecks,
  typeAll,
  setTypeAll,
  typeNames,
}) {

  const weatherOptions = [
    { value: "", label: "Clear" },
    { value: "Sun", label: "Sun" },
    { value: "Rain", label: "Rain" },
    { value: "Sandstorm", label: "Sandstorm" },
    { value: "Snow", label: "Snow" },
  ];

  const terrainOptions = [
    { value: "", label: "Unset" },
    { value: "Electric", label: "Electric" },
    { value: "Grassy", label: "Grassy" },
    { value: "Misty", label: "Misty" },
    { value: "Psychic", label: "Psychic" },
  ];

  // 화면에 랭크 표 구현용
  function getRankText(i) {
    switch (i) {
      case 0:
        return "Atk";
      case 1:
        return "Def";
      case 2:
        return "Spe";
      default:
        return "";
    }
  }  

  return (
    <>
      {/* 타입 체크박스 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 8, marginLeft: 17 }}>
          <label
            style={{
              fontWeight: "bold",
              fontSize: "0.8em",
              marginRight: 12,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={typeAll}
              onChange={(e) => {
                const checked = e.target.checked;
                setTypeAll(checked);
                setTypeChecks(Array(typeNames.length).fill(checked));
              }}
              style={{ marginRight: 6, cursor: "pointer" }}
            />
            All
          </label>
        </div>
        <table style={{ width: 180 + "px", tableLayout: "fixed"}}>
          <tbody>
            {Array.from({ length: 6 }).map((_, z) => (
              <tr>
                {Array.from({ length: 3 }).map((_, i) => (
                  <td style={typeChecks[z * 3 + i] ? { background: TYPE_COLORS[typeNames[z * 3 + i].toLowerCase()] } : undefined}>
                    <label
                      key={i}
                      // style={{
                      //   fontWeight: "bold",
                      //   fontSize: "0.8em",
                      //   display: "flex",
                      //   flexDirection: "column",
                      //   alignItems: "center",
                      // }}
                    >
                      <input
                        key={i}
                        type="checkbox"
                        checked={typeChecks[z * 3 + i]}
                        onChange={(e) => {
                          const arr = [...typeChecks];
                          arr[z * 3 + i] = e.target.checked;
                          setTypeChecks(arr);
                        }}
                        style={{ display: "none", cursor: "pointer" }} // Add cursor pointer, marginRight: 0, marginBottom: 2, 
                      />
                      <img src={`/${typeNames[z * 3 + i]}_icon.png`} style={{width: 100 + "%", height: 100 + "%", objectFit: "cover", margin: 0 + "px"}}></img>                      
                      <span>{typeNames[z * 3 + i]}</span>
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* 날씨 드롭다운 */}
      <div>
        <label htmlFor="weather-select">Weather: </label>
        <select
          id="weather-select"
          value={selectedWeather}
          onChange={(e) => setSelectedWeather(e.target.value)}
        >
          {weatherOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {/* 필드 드롭다운 */}
      <div>
        <label htmlFor="terrain-select">Terrain: </label>
        <select
          id="terrain-select"
          value={selectedTerrain}
          onChange={(e) => setSelectedTerrain(e.target.value)}
        >
          {terrainOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {/* 랭크 슬라이더 */}
      <table>
        <thead>
          <tr>
            <th style={{background: "#f3f3f3"}}>Stage</th>
          </tr>
          <tr>
            <th style={{background: "#f3f3f3"}}>Meta<br/>Pokémon</th>
            <th style={{background: "#f3f3f3"}}>Counter<br/>Pokémon</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 3 }).map((_, i) => (
            <tr key={i}>
              <td>
                <label>{getRankText(i)}</label>
                <input
                  type="range"
                  min={-6}
                  max={6}
                  value={ranks[i]}
                  onChange={(e) => {
                    const arr = [...ranks];
                    arr[i] = Number(e.target.value);
                    setRanks(arr);
                  }}
                  style={{ width: "70%" }}
                />
                <div>{ranks[i] > 0 ? "+"+ranks[i] : ranks[i]}</div>
              </td>
              <td>
                <label>{getRankText(i)}</label>
                <input
                  type="range"
                  min={-6}
                  max={6}
                  value={ranks[i+3]}
                  onChange={(e) => {
                    const arr = [...ranks];
                    arr[i+3] = Number(e.target.value);
                    setRanks(arr);
                  }}
                  style={{ width: "70%" }}
                />
                <div>{ranks[i+3] > 0 ? "+"+ranks[i+3] : ranks[i+3]}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* 기술 드롭다운 */}
      <div className="move-select-group">
        <label htmlFor="move-select">Select Move:</label>
        <select
          id="move-select"
          value={selectedMove || ""}
          onChange={(e) => setSelectedMove(e.target.value)}
          disabled={!selectedPokemon}
        >
          {moveList.map((move) => (
            <option key={move} value={move}>
              {move}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
