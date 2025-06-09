import React, { useEffect, useState, useRef } from "react";
import ScatterPlot from "./ScatterPlot";
import HitCountSmogon from "./HitCountSmogon";
import { EndureKOData } from "../utils/moveHelpers";
import HeatmapChart from "./HeatmapChart";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import * as d3 from "d3";

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

  const [verticalRange, setVerticalRange] = useState([0, 5.5]);
  const [horizontalRange, setHorizontalRange] = useState([0, 5.5]);

  const verticalSliderRef = useRef();
  const horizontalSliderRef = useRef();

  const displayMax = 5.0;

  const x0 = Math.min(horizontalRange[0], displayMax);
  const x1 = horizontalRange[1];
  const y0 = Math.min(verticalRange[0] - 0.9, displayMax);
  const y1 = verticalRange[1] - 0.9;

  const rectX = (x0 / displayMax) * 135;
  const rectRightX = x1 > displayMax ? 470 / 3 : (x1 / displayMax) * 135;
  const rectWidth = rectRightX - rectX;

  const rectYBottom = (1 - y0 / displayMax) * 135;
  const rectYTop = y1 + 0.9 > displayMax ? 0 : (1 - y1 / displayMax) * 135;
  const rectHeight = rectYBottom - rectYTop;

  const rectRef = useRef();
  const dragStartRef = useRef(null);

  useEffect(() => {
    fetch("/atkType.json")
      .then((res) => res.json())
      .then(setTypeChart)
      .catch((err) => console.error("Failed to load atkType.json:", err));
  }, []);

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

  useEffect(() => {
    if (!rectRef.current) return;
    const rect = d3.select(rectRef.current);

    const drag = d3
      .drag()
      .on("start", (event) => {
        dragStartRef.current = {
          mouseX: event.x,
          mouseY: event.y,
          boxX: horizontalRange[0],
          boxY: verticalRange[0],
        };
      })
      .on("drag", (event) => {
        if (!dragStartRef.current) return;
        const minimapWidth = 135;
        const minimapHeight = 135;
        const dataWidth = 5.5;
        const dataHeight = 5.5;
        const xRangeSize = horizontalRange[1] - horizontalRange[0];
        const yRangeSize = verticalRange[1] - verticalRange[0];

        const dx =
          (event.x - dragStartRef.current.mouseX) * (dataWidth / minimapWidth);
        const dy =
          -(event.y - dragStartRef.current.mouseY) *
          (dataHeight / minimapHeight);

        let newXMin = Math.max(
          0,
          Math.min(dragStartRef.current.boxX + dx, dataWidth - xRangeSize)
        );
        let newXMax = newXMin + xRangeSize;
        let newYMin = Math.max(
          0,
          Math.min(dragStartRef.current.boxY + dy, dataHeight - yRangeSize)
        );
        let newYMax = newYMin + yRangeSize;

        setHorizontalRange([newXMin, newXMax]);
        setVerticalRange([newYMin, newYMax]);
      });

    rect.call(drag);

    return () => {
      rect.on(".drag", null);
    };
  }, [horizontalRange, verticalRange, displayMax]);

  if (!selectedPokemon)
    return <div>Select a Pokémon to view the scatter plot.</div>;
  if (!selectedMove) return <div>No moves available for this Pokémon.</div>;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        width: "100%",
      }}
    >
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
        <div className="search-bar" style={{ marginTop: 20 }}>
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
                    }}
                  >
                    {d.name}
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          marginLeft: 20,
          minWidth: 0,
          marginTop: 50,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              position: "relative",
              height: 150,
              marginRight: 5,
              marginTop: 31,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
              const percent = 1 - val / 5.5;
              return (
                <div
                  key={idx}
                  style={{
                    position: "absolute",
                    left: "-25px",
                    top: `calc(${percent * 100}% )`,
                    background: "#fff",
                    padding: "2px 6px",
                    fontSize: 12,
                    pointerEvents: "none",
                    transform: "translateY(-50%)",
                    textAlign: "right",
                  }}
                >
                  {val > 5 ? "5+" : val.toFixed(1)}
                </div>
              );
            })}
          </div>

          <div style={{ position: "relative", width: 200, height: 200 }}>
            <HeatmapChart
              items={scatterItems}
              typeChecks={typeChecks}
              typeNames={typeNames}
              width={200}
              height={200}
            />
            <svg
              width={160}
              height={160}
              style={{
                position: "absolute",
                marginLeft: 20,
                marginTop: 20,
                left: 0,
                top: 0,
                pointerEvents: "auto",
                zIndex: 2,
              }}
            >
              <rect
                ref={rectRef}
                x={rectX}
                y={rectYTop}
                width={rectWidth}
                height={rectHeight}
                fill="none"
                stroke="black"
                strokeWidth={5}
                style={{ cursor: "move", pointerEvents: "auto" }}
              />
            </svg>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            marginLeft: 41,
            marginTop: 4,
            width: 145,
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
            const percent = val / 5.5;
            return (
              <div
                key={idx}
                style={{
                  position: "absolute",
                  left: `calc(${percent * 100}%)`,
                  top: "15px",
                  background: "#fff",
                  padding: "2px 6px",
                  fontSize: 12,
                  pointerEvents: "none",
                  transform: "translateX(-50%)",
                  textAlign: "center",
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
