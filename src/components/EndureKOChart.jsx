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
  speedOnly,
  setSpeedOnly,
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
  const [isDraggingRect, setIsDraggingRect] = useState(false);
  const rectHandlesRef = useRef([null, null, null, null]);

  // 히트맵 툴팁 상태
  const [heatmapHoveredCell, setHeatmapHoveredCell] = useState(null);

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
    rectHandlesRef.current.forEach((handle, idx) => {
      if (!handle) return;
      const d3Handle = d3.select(handle);
      d3Handle.on('.drag', null);
      const drag = d3.drag()
        .on('start', (event) => {
          dragStartRef.current = {
            mouseX: event.x,
            mouseY: event.y,
            boxX: horizontalRange[0],
            boxY: verticalRange[0],
          };
          setIsDraggingRect(true);
        })
        .on('drag', (event) => {
          if (!dragStartRef.current) return;
          const minimapSize = 135;
          const dataMax = 5.5;
          const xRangeSize = horizontalRange[1] - horizontalRange[0];
          const yRangeSize = verticalRange[1] - verticalRange[0];
          const dx = (event.x - dragStartRef.current.mouseX) * (dataMax / minimapSize);
          const dy = -(event.y - dragStartRef.current.mouseY) * (dataMax / minimapSize);
          let newXMin = Math.max(0, Math.min(dragStartRef.current.boxX + dx, dataMax - xRangeSize));
          let newXMax = newXMin + xRangeSize;
          let newYMin = Math.max(0, Math.min(dragStartRef.current.boxY + dy, dataMax - yRangeSize));
          let newYMax = newYMin + yRangeSize;
          setHorizontalRange([newXMin, newXMax]);
          setVerticalRange([newYMin, newYMax]);
        })
        .on('end', () => {
          setIsDraggingRect(false);
        });
      d3Handle.call(drag);
    });
  }, [rectX, rectYTop, rectWidth, rectHeight, horizontalRange, verticalRange, displayMax]);

  if (!selectedPokemon)
    return (
      <div
        style={{
          marginTop: 80,
          textAlign: "center",
          fontSize: 18,
          color: "#888",
          fontWeight: 500,
        }}
      >
        Select a Pokémon to view the scatter plot.
      </div>
    );
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
        <div style={{ position: "relative", width: "100%" }}>
          <div
            style={{
              position: "absolute",
              left: 50, // match marginLeft of your scatter plot SVG
              top: 5,
              fontWeight: "bold",
              fontSize: 15,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span style={{ color: "green", fontWeight: 700, marginRight: 6 }}>Green</span> is faster, <span style={{ color: "red", fontWeight: 700, marginRight: 6 }}>Red</span> is slower
            <label style={{ marginLeft: 25, display: 'flex', alignItems: 'center', fontWeight: 500, fontSize: 14, cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={speedOnly}
                onChange={e => setSpeedOnly(e.target.checked)}
                style={{ marginRight: 6, width: 16, height: 16, accentColor: '#1976d2', cursor: 'pointer' }}
              />
              Show faster only
            </label>
          </div>
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
            speedOnly={speedOnly}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          marginLeft: 15,
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
              trackStyle={[
                {
                  background:
                    "linear-gradient(180deg, #1976d2 0%, #64b5f6 100%)",
                  width: 7,
                  boxShadow: "0 1px 4px rgba(25, 118, 210, 0.10)",
                  borderRadius: 4,
                },
              ]}
              handleStyle={[
                {
                  borderColor: "#1976d2",
                  backgroundColor: "#fff",
                  width: 18,
                  height: 18,
                  marginLeft: -5.5,
                  marginTop: -5.5,
                  boxShadow: "0 1px 4px rgba(25, 118, 210, 0.10)",
                  borderWidth: 2,
                  transition: "border 0.2s, box-shadow 0.2s",
                },
                {
                  borderColor: "#1976d2",
                  backgroundColor: "#fff",
                  width: 18,
                  height: 18,
                  marginLeft: -5.5,
                  marginTop: -5.5,
                  boxShadow: "0 1px 4px rgba(25, 118, 210, 0.10)",
                  borderWidth: 2,
                  transition: "border 0.2s, box-shadow 0.2s",
                },
              ]}
              railStyle={{
                background: "linear-gradient(180deg, #e3f2fd 0%, #e0e0e0 100%)",
                width: 7,
                borderRadius: 4,
              }}
            />
            {verticalRange.map((val, idx) => {
              const percent = 1 - val / 5.5;
              return (
                <div
                  key={idx}
                  style={{
                    position: "absolute",
                    left: "-28px",
                    top: `calc(${percent * 100}% )`,
                    background: "#1976d2",
                    color: "#fff",
                    padding: "2px 7px",
                    fontSize: 11,
                    borderRadius: 7,
                    fontWeight: 600,
                    pointerEvents: "none",
                    transform: "translateY(-50%)",
                    textAlign: "right",
                    boxShadow: "0 1px 4px rgba(25, 118, 210, 0.07)",
                  }}
                >
                  {val > 5 ? "5+" : val.toFixed(1)}
                </div>
              );
            })}
          </div>

          <div style={{ position: "relative", width: 200, height: 200 }}>
            <button
              onClick={() => {
                setVerticalRange([0, 5.5]);
                setHorizontalRange([0, 5.5]);
              }}
              style={{
                position: 'absolute',
                left: 40,
                top: -32,
                zIndex: 5,
                padding: '4px 12px',
                fontSize: 13,
                background: '#fff',
                border: '1.5px solid #1976d2',
                color: '#1976d2',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 600,
                boxShadow: '0 1px 4px rgba(25, 118, 210, 0.08)',
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.background = '#1976d2'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#1976d2'; }}
            >
              Reset Range
            </button>
            <HeatmapChart
              items={scatterItems}
              typeChecks={typeChecks}
              typeNames={typeNames}
              width={200}
              height={200}
              isDraggingRect={isDraggingRect}
              hoveredCell={heatmapHoveredCell}
              setHoveredCell={setHeatmapHoveredCell}
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
                pointerEvents: "none",
                zIndex: 2,
              }}
            >
              {/* 네모 외부 어둡게 */}
              {/* 위쪽 */}
              <rect x={0} y={0} width={160} height={rectYTop} fill="rgba(0,0,0,0.28)" />
              {/* 아래쪽 */}
              <rect x={0} y={rectYTop + rectHeight} width={160} height={160 - (rectYTop + rectHeight)} fill="rgba(0,0,0,0.28)" />
              {/* 왼쪽 */}
              <rect x={0} y={rectYTop} width={rectX} height={rectHeight} fill="rgba(0,0,0,0.28)" />
              {/* 오른쪽 */}
              <rect x={rectX + rectWidth} y={rectYTop} width={160 - (rectX + rectWidth)} height={rectHeight} fill="rgba(0,0,0,0.28)" />
              <rect
                ref={rectRef}
                x={rectX}
                y={rectYTop}
                width={rectWidth}
                height={rectHeight}
                fill="transparent"
                stroke="black"
                strokeWidth={3}
                style={{ pointerEvents: "none" }}
              />
              {/* 네 변 드래그 핸들 (투명, 얇은 rect) */}
              {/* 상단 */}
              <rect
                ref={el => (rectHandlesRef.current[0] = el)}
                x={rectX}
                y={rectYTop - 6}
                width={rectWidth}
                height={12}
                fill="transparent"
                style={{ cursor: "move", pointerEvents: "auto" }}
              />
              {/* 하단 */}
              <rect
                ref={el => (rectHandlesRef.current[1] = el)}
                x={rectX}
                y={rectYTop + rectHeight - 6}
                width={rectWidth}
                height={12}
                fill="transparent"
                style={{ cursor: "move", pointerEvents: "auto" }}
              />
              {/* 좌 */}
              <rect
                ref={el => (rectHandlesRef.current[2] = el)}
                x={rectX - 6}
                y={rectYTop}
                width={12}
                height={rectHeight}
                fill="transparent"
                style={{ cursor: "move", pointerEvents: "auto" }}
              />
              {/* 우 */}
              <rect
                ref={el => (rectHandlesRef.current[3] = el)}
                x={rectX + rectWidth - 6}
                y={rectYTop}
                width={12}
                height={rectHeight}
                fill="transparent"
                style={{ cursor: "move", pointerEvents: "auto" }}
              />
            </svg>
            {/* 히트맵 툴팁 */}
            {heatmapHoveredCell && heatmapHoveredCell.count > 0 && !isDraggingRect && (
              <div
                style={{
                  position: "absolute",
                  left: (heatmapHoveredCell.x - 22) + 0,
                  top: (heatmapHoveredCell.y - 18 - 15) + 0, // y좌표 - 15는 기존 offset
                  width: 44,
                  height: 26,
                  background: "#222",
                  color: "#fff",
                  borderRadius: 5,
                  fontWeight: "bold",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.97,
                  zIndex: 99,
                  pointerEvents: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                }}
              >
                {heatmapHoveredCell.count}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            position: "relative",
            marginLeft: 46,
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
            trackStyle={[
              {
                background: "linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)",
                height: 7,
                boxShadow: "0 1px 4px rgba(25, 118, 210, 0.10)",
                borderRadius: 4,
              },
            ]}
            handleStyle={[
              {
                borderColor: "#1976d2",
                backgroundColor: "#fff",
                width: 18,
                height: 18,
                marginLeft: -5.5,
                marginTop: -5.5,
                boxShadow: "0 1px 4px rgba(25, 118, 210, 0.10)",
                borderWidth: 2,
                transition: "border 0.2s, box-shadow 0.2s",
              },
              {
                borderColor: "#1976d2",
                backgroundColor: "#fff",
                width: 18,
                height: 18,
                marginLeft: -5.5,
                marginTop: -5.5,
                boxShadow: "0 1px 4px rgba(25, 118, 210, 0.10)",
                borderWidth: 2,
                transition: "border 0.2s, box-shadow 0.2s",
              },
            ]}
            railStyle={{
              background: "linear-gradient(90deg, #e3f2fd 0%, #e0e0e0 100%)",
              height: 7,
              borderRadius: 4,
            }}
          />
          {horizontalRange.map((val, idx) => {
            const percent = val / 5.5;
            return (
              <div
                key={idx}
                style={{
                  position: "absolute",
                  left: `calc(${percent * 100}%)`,
                  top: "22px",
                  background: "#1976d2",
                  color: "#fff",
                  padding: "2px 7px",
                  fontSize: 11,
                  borderRadius: 7,
                  fontWeight: 600,
                  pointerEvents: "none",
                  transform: "translateX(-50%)",
                  textAlign: "center",
                  boxShadow: "0 1px 4px rgba(25, 118, 210, 0.07)",
                }}
              >
                {val > 5 ? "5+" : val.toFixed(1)}
              </div>
            );
          })}
        </div>

        <div
          className="search-bar"
          style={{
            marginTop: 16,
            marginBottom: 8,
            width: "100%",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              width: 180,
              boxSizing: "border-box",
            }}
          >
            <input
              type="text"
              placeholder="Search Pokémon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: 180,
                height: 32,
                fontSize: 15,
                padding: "0 10px",
                border: "1.5px solid #bbb",
                borderRadius: 0,
                outline: "none",
                boxSizing: "border-box",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                background: "#fafbfc",
                margin: 0,
                transition: "border 0.2s",
                display: "block",
              }}
              onFocus={(e) => (e.target.style.border = "1.5px solid #4caf50")}
              onBlur={(e) => (e.target.style.border = "1.5px solid #bbb")}
            />
            {searchQuery && (
              <ul
                className="search-suggestions"
                style={{
                  maxHeight: 120,
                  overflowY: "auto",
                  background: "#fff",
                  border: "1.5px solid #bbb",
                  borderTop: "1.5px solid #bbb",
                  borderRadius: 0,
                  margin: 0,
                  padding: 0,
                  position: "absolute",
                  left: 0,
                  top: "100%",
                  width: 180,
                  zIndex: 10,
                  boxSizing: "border-box",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  listStyle: "none",
                }}
              >
                {scatterItems
                  .filter((d) =>
                    d.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((d) => (
                    <li
                      key={d.name}
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedItem(d.name);
                      }}
                      style={{
                        padding: "8px 14px",
                        cursor: "pointer",
                        fontSize: 16,
                        borderBottom: "1px solid #f3f3f3",
                        transition: "background 0.15s",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background = "#f3f3f3")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.background = "#fff")
                      }
                    >
                      {d.name}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
