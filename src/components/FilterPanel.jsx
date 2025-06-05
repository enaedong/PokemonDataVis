// import React, { useState } from "react";
import { color } from 'd3';
import TYPE_COLORS from '../utils/typeColors';
import Select from 'react-select';

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
    { value: "", label: "Clear", type: undefined},
    { value: "Sun", label: "Sun", type: "fire" },
    { value: "Rain", label: "Rain", type: "water" },
    { value: "Sandstorm", label: "Sand", type: "rock" },
    { value: "Snow", label: "Snow", type: "ice" },
  ];

  const terrainOptions = [
    { value: "", label: "Unset", type: undefined},
    { value: "Electric", label: "Electric", type: "electric" },
    { value: "Grassy", label: "Grassy", type: "grass" },
    { value: "Misty", label: "Misty", type: "fairy" },
    { value: "Psychic", label: "Psychic", type: "psychic" },
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

  const customStylesWeather = {
    control: (styles) => ({ ...styles, fontSize: 0.8 + "em", backgroundColor: selectedWeather !== "" ? TYPE_COLORS[weatherOptions.find(obj => obj.value == selectedWeather).type] : undefined }),
    singleValue: (styles) => ({
      ...styles,
      color: selectedWeather !== "" ? "white" : "black", // This sets the color for the selected value text
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: '0px',       // Adjust padding to fit your desired size
    }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    return {
      ...styles,
      backgroundColor: isDisabled
        ? undefined
        : isSelected
        ? (data.type ? TYPE_COLORS[data.type] : TYPE_COLORS["normal"])
        : isFocused
        ? "#f3f3f3"
        : undefined            
    };
  }}
  const customStylesTerrain = {
    control: (styles) => ({ ...styles, fontSize: 0.8 + "em", backgroundColor: selectedTerrain !== "" ? TYPE_COLORS[terrainOptions.find(obj => obj.value == selectedTerrain).type] : undefined }),
    singleValue: (styles) => ({
      ...styles,
      color: selectedTerrain !== "" ? "white" : "black", // This sets the color for the selected value text
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: '0px',
    }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    return {
      ...styles,
      backgroundColor: isDisabled
        ? undefined
        : isSelected
        ? (data.type ? TYPE_COLORS[data.type] : TYPE_COLORS["normal"])
        : isFocused
        ? "#f3f3f3"
        : undefined            
    };
  }}

  return (
    <>
      {/* 타입 체크박스 */}
      <div className='vertical-scroll'>
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
          <table className="Rank-Table" style={{ width: 100 + "%", tableLayout: "fixed"}}>
            <thead>
              <tr>
                <th colSpan={3} style={{background: "#f3f3f3"}}>
                  Type
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, z) => (
                <tr key={`typeRow${z}`}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <td key={`typeCell${z * 3 + i}`} style={typeChecks[z * 3 + i] ? { background: TYPE_COLORS[typeNames[z * 3 + i].toLowerCase()] } : undefined}>
                      <label>
                        <input                          
                          type="checkbox"
                          checked={typeChecks[z * 3 + i]}
                          onChange={(e) => {
                            const arr = [...typeChecks];
                            arr[z * 3 + i] = e.target.checked;
                            setTypeChecks(arr);
                          }}
                          style={{ display: "none", cursor: "pointer" }} // Add cursor pointer, marginRight: 0, marginBottom: 2, 
                        />
                        <img src={`/icons/${typeNames[z * 3 + i]}_icon.png`} style={{width: 100 + "%", height: 100 + "%", objectFit: "cover", margin: 0 + "px"}}></img>                      
                        <div style={{ textAlign: "center", fontSize: 0.8 + "em" }}>{typeNames[z * 3 + i]}</div>
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* 날씨 드롭다운 */}
        <table style={{ marginBottom: 24, width: 100 + "%" }}>
          <tbody>
            <tr>
              <td>
                Weather:
              </td>
              <td>
                <Select
                  // id="weather-select"
                  defaultValue={weatherOptions[0]}
                  onChange={(e) => setSelectedWeather(e.value)}
                  options={weatherOptions}
                  styles={customStylesWeather}                
                />
              </td>
            </tr>
            <tr>
              {/* 필드 드롭다운 */}
              <td>
                Terrain:
              </td>
              <td>
                <Select
                  // id="weather-select"
                  defaultValue={terrainOptions[0]}
                  onChange={(e) => setSelectedTerrain(e.value)}
                  options={terrainOptions}
                  styles={customStylesTerrain}                
                />
              </td>
            </tr>
          </tbody>
        </table>
        {/* 기술 드롭다운 */}
        <div className="move-select-group">
          <label htmlFor="move-select">Move:</label>
          <select
            id="move-select"
            value={selectedMove || ""}
            onChange={(e) => setSelectedMove(e.target.value)}
            disabled={!selectedPokemon}
          >
            {moveList.map((move) => (
              <option key={`move-${move}`} value={move}>
                {move}
              </option>
            ))}
          </select>
        </div>
        {/* 랭크 슬라이더 */}
        <table className="Rank-Table" style={{ marginBottom: 50+"px" }}>
          <thead>
            <tr>
              <th colSpan={2} style={{background: "#f3f3f3"}}>Stage</th>
            </tr>
            <tr>
              <th style={{background: "#f3f3f3"}}>Meta<br/>Pokémon</th>
              <th style={{background: "#f3f3f3"}}>Counter<br/>Pokémon</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 3 }).map((_, i) => (
              <tr key={`rankRow${i}`}>
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
      </div>
    </>
  );
}
