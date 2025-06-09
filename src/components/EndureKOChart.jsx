import React, { useEffect, useState, useRef } from "react";
import ScatterPlot from "./ScatterPlot";
import HitCountSmogon from "./HitCountSmogon";
import { EndureKOData } from "../utils/moveHelpers";
import HeatmapChart from "./HeatmapChart";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

export default function EndureKOChart({
  selectedPokemon,
  dexData,
  usageData,
  selectedMove,
  selectedItem,
  setSelectedItem,
  typeChecks,
  typeNames,
  selectedWeather,
  selectedTerrain,
  ranks,
}) {
  const [typeChart, setTypeChart] = useState(null);
  const [scatterItems, setScatterItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Range state for sliders
  const [verticalRange, setVerticalRange] = useState([0, 5.5]);
  const [horizontalRange, setHorizontalRange] = useState([0, 5.5]);
  
  const verticalSliderRef = useRef();
  const horizontalSliderRef = useRef();

  // Clamp for heatmap limits (visual)
  const displayMax = 5.0; // The visible max value for the heatmap

  const x0 = Math.min(horizontalRange[0], displayMax); // left
  const x1 = horizontalRange[1]; // right
  const y0 = Math.min(verticalRange[0]-0.9, displayMax);   // bottom
  const y1 = verticalRange[1] - 0.9; // top

  // x-axis (horizontal)
  const rectX = (x0 / displayMax) * 135;
  const rectRightX = x1 > displayMax ? 470/3 : (x1 / displayMax) * 135;
  const rectWidth = rectRightX - rectX;

  // y-axis (vertical, inverted)
  const rectYBottom = (1 - y0 / displayMax) * 135;
  const rectYTop = y1 + 0.9 > displayMax ? 0 : (1 - y1 / displayMax) * 135;
  const rectHeight = rectYBottom - rectYTop;

  // Load type chart
  useEffect(() => {
    fetch("/atkType.json")
      .then((res) => res.json())
      .then(setTypeChart)
      .catch((err) => console.error("Failed to load atkType.json:", err));
  }, []);

  // Prepare scatter plot data
  useEffect(() => {
    const data = EndureKOData({
      selectedPokemon,
      dexData,
      usageData,
      typeChart,
      selectedMove,
      hitCountFn: HitCountSmogon,
      selectedWeather,
      selectedTerrain,
      ranks,
    });
    setScatterItems(data);
  }, [
    selectedPokemon,
    dexData,
    usageData,
    typeChart,
    selectedMove,
    selectedWeather,
    selectedTerrain,
    ranks,
  ]);

  if (!selectedPokemon)
    return <div>Select a Pokémon to view the scatter plot.</div>;
  if (!selectedMove) return <div>No moves available for this Pokémon.</div>;
  
  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", width: "100%" }}>
      {/* ScatterPlot remains below */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <ScatterPlot
          items={scatterItems}
          selectedPokemon={dexData.find((p) => p.name === selectedPokemon.name)}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          showMove={true}
          typeChecks={typeChecks}
          typeNames={typeNames}
          xRange={horizontalRange}
          yRange={verticalRange}
          searchQuery={searchQuery}
        />
        {/* Search bar above scatter plot */}
        <div className="search-bar" style={{ marginTop: 20}}>
          <input
            type="text"
            placeholder="Search Pokémon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          {searchQuery && (
            <ul className="search-suggestions">
              {scatterItems
                .filter((d) =>
                  d.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((d) => (
                  <li
                    key={d.name}
                    onClick={() => {
                      setSearchQuery(d.name);
                      setSelectedItem(d.name);
                    }} // triggers exact-match effect
                  >
                    {d.name}
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
      {/* Right panel: Heatmap + sliders */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginLeft: 20, minWidth: 0, marginTop: 50 }}>
        {/* Heatmap and vertical slider */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start" }}>
          {/* Vertical slider (right of heatmap) */}
          <div
            style={{
              position: "relative",
              height: 150, // match heatmap height
              marginRight: 5,
              marginTop: 31,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Slider
              ref={verticalSliderRef}
              className="vertical-slider"
              range
              vertical
              min={0}
              max={5.5}
              step={0.1}
              value={verticalRange}
              onChange={(val) => setVerticalRange(val)}
              allowCross={false}
              trackStyle={[{ backgroundColor: "blue", width: 8 }]}
              handleStyle={[
                { borderColor: "blue", backgroundColor: "white" },
                { borderColor: "blue", backgroundColor: "white" },
              ]}
              railStyle={{ backgroundColor: "#e0e0e0", width: 8 }}
            />
            {verticalRange.map((val, idx) => {
              // Always show labels for both handles
              const percent = 1 - (val / 5.5);
              return (
                <div
                  key={idx}
                  style={{
                    position: "absolute",
                    left: "-25px", // right side of slider
                    top: `calc(${percent * 100}% )`,
                    background: "#fff",
                    padding: "2px 6px",
                    fontSize: 12,
                    pointerEvents: "none",
                    transform: "translateY(-50%)",
                    textAlign: "right"
                  }}
                >
                  {val > 5 ? "5+" : val.toFixed(1)}
                </div>
              );
            })}
          </div>
          {/* Heatmap (right of vertical slider) */}
          <div style={{ position: "relative", width: 200, height: 200 }}>
            <HeatmapChart
              items={scatterItems}
              typeChecks={typeChecks}
              typeNames={typeNames}
              width={200}
              height={200}
            />
            {/* Rectangle overlay */}
            <svg
              width={160}
              height={160}
              style={{
                position: "absolute",
                marginLeft: 20, // align with heatmap
                marginTop: 20, // align with heatmap
                left: 0,
                top: 0,
                pointerEvents: "none",
                zIndex: 2
              }}
            >
              <rect
                x={rectX}
                y={rectYTop}
                width={rectWidth}
                height={rectHeight}
                fill="none"
                stroke="black"
                strokeWidth={5}
              />
            </svg>
          </div>
        </div>
        {/* Horizontal slider (below heatmap, aligned left with heatmap) */}
        <div
          style={{
            position: "relative",
            marginLeft: 41, // space from vertical slider
            marginTop: 4,
            width: 145, // about half of Heatmap width, adjust as needed
            height: 30,
          }}
        >
          <Slider
            ref={horizontalSliderRef}
            className="horizontal-slider"
            range
            min={0}
            max={5.5}
            step={0.1}
            value={horizontalRange}
            onChange={(val) => setHorizontalRange(val)}
            allowCross={false}
            trackStyle={[{ backgroundColor: "blue", height: 8 }]}
            handleStyle={[
              { borderColor: "blue", backgroundColor: "white" },
              { borderColor: "blue", backgroundColor: "white" },
            ]}
            railStyle={{ backgroundColor: "#e0e0e0", height: 8 }}
          />
          {horizontalRange.map((val, idx) => {
            const percent = (val / 5.5);
            return (
              <div
                key={idx}
                style={{
                  position: "absolute",
                  left: `calc(${percent * 100}%)`,
                  top: "15px", // above the slider
                  background: "#fff",
                  padding: "2px 6px",
                  fontSize: 12,
                  pointerEvents: "none",
                  transform: "translateX(-50%)",
                  textAlign: "center"
                }}
              >
                {val > 5 ? "5+" : val.toFixed(1)}
              </div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}
