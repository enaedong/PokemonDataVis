import React, { useEffect, useState, useRef } from "react";
import ScatterPlot from "./ScatterPlot";
import HitCount from "../utils/HitCount";
import HitCountSmogon from "./HitCountSmogon";
import { EndureKOData } from "../utils/moveHelpers";
import HeatmapChart from "./HeatmapChart";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

export default function EndureKOChart({ selectedPokemon, dexData, usageData, selectedMove, selectedItem, setSelectedItem, typeChecks, typeNames, selectedWeather, selectedTerrain, ranks }) {

  const [typeChart, setTypeChart] = useState(null);
  const [scatterItems, setScatterItems] = useState([]);
  
  // Range state for sliders
  const [verticalRange, setVerticalRange] = useState([0, 5.5]);
  const [horizontalRange, setHorizontalRange] = useState([0, 5.5]);
  const [dragging, setDragging] = useState({ slider: null, index: null }); // {slider: 'vertical'|'horizontal', index: 0|1}
  
  const verticalSliderRef = useRef();
  const horizontalSliderRef = useRef();

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
      ranks
    });
    setScatterItems(data);
  }, [selectedPokemon, dexData, usageData, typeChart, selectedMove, selectedWeather, selectedTerrain, ranks]);

  if (!selectedPokemon)
    return <div>Select a Pokémon to view the scatter plot.</div>;
  if (!selectedMove) return <div>No moves available for this Pokémon.</div>;

  return (
    <div>
      {/* Heatmap and sliders container */}
      <div style={{ display: "flex", alignItems: "flex-end" }}>
        <div style={{ position: "relative" }}>
          <HeatmapChart
            items={scatterItems}
            typeChecks={typeChecks}
            typeNames={typeNames}
          />
          {/* Horizontal slider below Heatmap, aligned to right of vertical slider */}
          <div
            style={{
              position: "absolute",
              left: "100%",
              bottom: 0,
              marginLeft: 45, // space from vertical slider
              marginBottom: 30,
              width: "150px", // about half of Heatmap width, adjust as needed
              height: 30,
              display: "flex",
              alignItems: "center"
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
              onBeforeChange={(_, idx) => setDragging({ slider: "horizontal", index: idx })}
              onAfterChange={() => setDragging({ slider: null, index: null })}
              allowCross={false}
              trackStyle={[{ backgroundColor: "blue", height: 8 }]}
              handleStyle={[
                { borderColor: "blue", backgroundColor: "white" },
                { borderColor: "blue", backgroundColor: "white" }
              ]}
              railStyle={{ backgroundColor: "#e0e0e0", height: 8 }}
              marks={{ 0: "0", 5.5: "5+" }}
            />
            {horizontalRange.map((val, idx) => {
              // const show = dragging.slider === "horizontal" && dragging.index === idx || dragging.slider === null;
              // if (!show) return null;
              const percent = (val / 5.5);
              return (
                <div
                  key={idx}
                  style={{
                    position: "absolute",
                    left: `calc(${percent * 100}%)`,
                    top: -12, // above the slider
                    background: "#fff",
                    //border: "1px solid #ccc",
                    //borderRadius: 4,
                    padding: "2px 6px",
                    fontSize: 12,
                    pointerEvents: "none",
                    transform: "translateX(-50%)"
                  }}
                >
                  {val > 5 ? "5+" : val.toFixed(1)}
                </div>
              );
            })}
          </div>
        </div>
        {/* Vertical slider to the right of Heatmap */}
        <div
          style={{
            position: "relative",
            height: "150px", // about half of Heatmap height, adjust as needed
            marginLeft: 16,
            marginBottom: 80,
            display: "flex",
            alignItems: "center"
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
            onBeforeChange={(_, idx) => setDragging({ slider: "vertical", index: idx })}
            onAfterChange={() => setDragging({ slider: null, index: null })}
            allowCross={false}
            trackStyle={[{ backgroundColor: "blue", width: 8 }]}
            handleStyle={[
              { borderColor: "blue", backgroundColor: "white" },
              { borderColor: "blue", backgroundColor: "white" }
            ]}
            railStyle={{ backgroundColor: "#e0e0e0", width: 8 }}
            marks={{ 0: "0", 5.5: "5+" }}
          />
          {verticalRange.map((val, idx) => {
            // Show label if dragging or always (after release)
            // const show = dragging.slider === "vertical" && dragging.index === idx || dragging.slider === null;
            // if (!show) return null;
            // Calculate position: 0 is bottom, 5.5 is top
            const percent = 1 - (val / 5.5);
            return (
              <div
                key={idx}
                style={{
                  position: "absolute",
                  left: "110%", // right side of slider
                  top: `calc(${percent * 100}% )`,
                  background: "#fff",
                  //border: "1px solid #ccc",
                  //borderRadius: 4,
                  padding: "2px 6px",
                  fontSize: 12,
                  pointerEvents: "none",
                  transform: "translateY(-50%)"
                }}
              >
                {val > 5 ? "5+" : val.toFixed(1)}
              </div>
            );
          })}
        </div>
      </div>
      {/* ScatterPlot remains below */}
      <ScatterPlot
        items={scatterItems}
        selectedPokemon={dexData.find((p) => p.name === selectedPokemon.name)}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        showMove={true}
        typeChecks={typeChecks}
        typeNames={typeNames}
      />
    </div>
  );
}
