import React, { useState } from "react";

export default function FilterPanel({ selectedMove, setSelectedMove, selectedPokemon, moveList }) {
  // 타입 체크박스
  const [typeAll, setTypeAll] = useState(false);
  const [typeChecks, setTypeChecks] = useState(Array(18).fill(false));
  // 날씨 체크박스
  const [weatherChecks, setWeatherChecks] = useState(Array(4).fill(false));
  // 랭크 슬라이더
  const [ranks, setRanks] = useState(Array(6).fill(0));

  return (
    <>
      {/* 타입 체크박스 */}
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
      {/* 날씨 체크박스 */}
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
      {/* 랭크 슬라이더 */}
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
      {/* 기술 드롭다운 */}
      <div className="move-select-group">
        <label htmlFor="move-select">
          Select Move:
        </label>
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
