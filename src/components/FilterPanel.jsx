// import React, { useState } from "react";
import { color } from "d3";
import TYPE_COLORS from "../utils/typeColors";
import Select from "react-select";
import { getMoveDetails } from "../utils/moveHelpers";

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
    { value: "", label: "Clear", type: undefined },
    { value: "Sun", label: "Sun", type: "fire" },
    { value: "Rain", label: "Rain", type: "water" },
    { value: "Sandstorm", label: "Sand", type: "rock" },
    { value: "Snow", label: "Snow", type: "ice" },
  ];

  const terrainOptions = [
    { value: "", label: "Unset", type: undefined },
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
    control: (styles) => ({
      ...styles,
      fontSize: 0.8 + "em",
      backgroundColor:
        selectedWeather !== ""
          ? TYPE_COLORS[
              weatherOptions.find((obj) => obj.value == selectedWeather).type
            ]
          : undefined,
    }),
    singleValue: (styles) => ({
      ...styles,
      color: selectedWeather !== "" ? "white" : "black", // This sets the color for the selected value text
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: "0px", // Adjust padding to fit your desired size
    }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        backgroundColor: isDisabled
          ? undefined
          : isSelected
          ? data.type
            ? TYPE_COLORS[data.type]
            : TYPE_COLORS["normal"]
          : isFocused
          ? "#f3f3f3"
          : undefined,
      };
    },
  };
  const customStylesTerrain = {
    control: (styles) => ({
      ...styles,
      fontSize: 0.8 + "em",
      backgroundColor:
        selectedTerrain !== ""
          ? TYPE_COLORS[
              terrainOptions.find((obj) => obj.value == selectedTerrain).type
            ]
          : undefined,
    }),
    singleValue: (styles) => ({
      ...styles,
      color: selectedTerrain !== "" ? "white" : "black", // This sets the color for the selected value text
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: "0px",
    }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        backgroundColor: isDisabled
          ? undefined
          : isSelected
          ? data.type
            ? TYPE_COLORS[data.type]
            : TYPE_COLORS["normal"]
          : isFocused
          ? "#f3f3f3"
          : undefined,
      };
    },
  };

  const customStylesMove = {
    control: (styles, { selectProps, getValue }) => {
      const selected = getValue()[0];
      const type = selected?.type;
      return {
        ...styles,
        fontSize: "0.98em",
        minHeight: 36,
        borderRadius: 8,
        border: "1.5px solid #bbb",
        boxShadow: "none",
        backgroundColor: type ? TYPE_COLORS[type.toLowerCase()] : "#fff",
        paddingLeft: 0,
        paddingRight: 0,
        cursor: "pointer",
      };
    },
    singleValue: (styles, { data }) => ({
      ...styles,
      color: data.type ? "white" : "#222",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: "0px",
    }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        backgroundColor: isDisabled
          ? undefined
          : isSelected
          ? data.type
            ? TYPE_COLORS[data.type.toLowerCase()]
            : TYPE_COLORS["normal"]
          : isFocused
          ? "#f3f3f3"
          : undefined,
        color: isSelected && data.type ? "white" : "#222",
        fontWeight: isSelected ? 700 : 500,
        fontSize: "1em",
      };
    },
  };

  return (
    <>
      {/* 타입 체크박스 */}
      <div>
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
          {/* Conditionally render the table only when typeChecks has been populated */}
          {typeChecks.length > 0 && (
            <table
              className="Rank-Table"
              style={{ width: 100 + "%", tableLayout: "fixed" }}
            >
              <thead>
                <tr>
                  <th colSpan={3} style={{ background: "#f3f3f3" }}>
                    Type
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, z) => (
                  <tr key={`typeRow${z}`}>
                    {Array.from({ length: 3 }).map((_, i) => {
                      const typeIndex = z * 3 + i;
                      // Add a guard to prevent rendering if the type doesn't exist at this index
                      if (typeIndex >= typeNames.length) {
                        return <td key={`typeCell${typeIndex}`}></td>; // Render an empty cell
                      }
                      return (
                        <td
                          key={`typeCell${typeIndex}`}
                        >
                          <label>
                            <input
                              type="checkbox"
                              checked={typeChecks[typeIndex]}
                              onChange={(e) => {
                                const arr = [...typeChecks];
                                arr[typeIndex] = e.target.checked;
                                setTypeChecks(arr);
                              }}
                              style={{ display: "none", cursor: "pointer" }}
                            />
                            <img
                              src={`/icons/${typeNames[typeIndex]}_icon.png`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                margin: 0,
                                backgroundColor: typeChecks[typeIndex] ? TYPE_COLORS[typeNames[typeIndex].toLowerCase()] : "#fff",
                                transition: "background 0.18s"
                              }}
                            />
                            <div
                              style={{
                                textAlign: "center",
                                fontSize: "0.8em",
                              }}
                            >
                              {typeNames[typeIndex]}
                            </div>
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* 기술 드롭다운 */}
        <div className="move-select-group">
          <label htmlFor="move-select">Move:</label>
          <Select
            inputId="move-select"
            value={(() => {
              const details = getMoveDetails(selectedMove);
              return moveList.find(m => m === selectedMove)
                ? { value: selectedMove, label: selectedMove, type: details.type }
                : null;
            })()}
            onChange={opt => setSelectedMove(opt ? opt.value : "")}
            options={moveList.map(m => {
              const details = getMoveDetails(m);
              return { value: m, label: m, type: details.type };
            })}
            isDisabled={!selectedPokemon}
            styles={{
              ...customStylesMove,
              menuPortal: base => ({ ...base, zIndex: 9999 })
            }}
            placeholder="Select move..."
            menuPlacement="auto"
            menuPortalTarget={typeof window !== 'undefined' ? window.document.body : undefined}
            menuPosition="fixed"
          />
        </div>
        {/* 날씨 드롭다운 */}
        <table style={{ marginBottom: 24, width: 100 + "%" }}>
          <tbody>
            <tr>
              <td>Weather:</td>
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
              <td>Terrain:</td>
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
        {/* 랭크 슬라이더 */}
        <table className="Rank-Table" style={{ marginBottom: 50 + "px" }}>
          <thead>
            <tr>
              <th colSpan={2} style={{ background: "#f3f3f3" }}>
                Stage
              </th>
            </tr>
            <tr>
              <th style={{ background: "#f3f3f3" }}>
                Meta
                <br />
                Pokémon
              </th>
              <th style={{ background: "#f3f3f3" }}>
                Counter
                <br />
                Pokémon
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 3 }).map((_, i) => (
              <tr key={`rankRow${i}`}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 2, marginLeft: 4 }}>
                    <span style={{ fontWeight: 600, color: '#1976d2', fontSize: '1em', marginRight: 6 }}>{getRankText(i)}</span>
                    <span style={{ fontWeight: 600, color: '#1976d2', fontSize: '0.98em' }}>{ranks[i] > 0 ? "+" + ranks[i] : ranks[i]}</span>
                  </div>
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
                    style={{ width: "90%" }}
                  />
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 2, marginLeft: 4 }}>
                    <span style={{ fontWeight: 600, color: '#1976d2', fontSize: '1em', marginRight: 6 }}>{getRankText(i)}</span>
                    <span style={{ fontWeight: 600, color: '#1976d2', fontSize: '0.98em' }}>{ranks[i + 3] > 0 ? "+" + ranks[i + 3] : ranks[i + 3]}</span>
                  </div>
                  <input
                    type="range"
                    min={-6}
                    max={6}
                    value={ranks[i + 3]}
                    onChange={(e) => {
                      const arr = [...ranks];
                      arr[i + 3] = Number(e.target.value);
                      setRanks(arr);
                    }}
                    style={{ width: "90%" }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
