import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

// 구간 라벨 및 경계값
const bins = [0, 1, 2, 3, 4, 5, Infinity];
const binLabels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];

function getBinIndex(val) {
  if (val === "5+") return 5;
  for (let i = 0; i < bins.length - 1; i++) {
    if (val >= bins[i] && val < bins[i + 1]) return i;
  }
  return 5; // fallback
}

function getColor(count, max) {
  // 0: 흰색, max: 파랑 (#1565c0)
  if (count === 0) return "#fff";
  const blue = [21, 101, 192];
  const t = Math.sqrt(count / max);
  const r = Math.round(255 + (blue[0] - 255) * t);
  const g = Math.round(255 + (blue[1] - 255) * t);
  const b = Math.round(255 + (blue[2] - 255) * t);
  return `rgb(${r},${g},${b})`;
}

export default function HeatmapChart({ items, xKey = "x", yKey = "y", width = 450, height = 450, typeChecks, typeNames }) {
  const ref = useRef();
  const [hoveredCell, setHoveredCell] = useState(null);

  // 타입 체크 필터링 
  const filteredItems = (items || []).filter((d) => {
    if (!typeChecks || !typeNames) return true;
    const types = Array.isArray(d.type) ? d.type : [d.type];
    return types.some((t) => {
      const tNorm = t.trim().toLowerCase();
      const idx = typeNames.findIndex(
        (name) => name.trim().toLowerCase() === tNorm
      );
      return idx !== -1 && typeChecks[idx];
    });
  });

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    // margin, width, height
    const marginTop = 60, marginBottom = 40, marginLeft = 50, marginRight = 20;
    const plotW = width - marginLeft - marginRight;
    const plotH = height - marginTop - marginBottom;

    // x/y scale
    const x = d3.scaleLinear().domain([0, 6]).range([marginLeft, width - marginRight]);
    const y = d3.scaleLinear().domain([0, 6]).range([height - marginBottom, marginTop]);

    // 축 그리기
    const xTickVals = [0, 1, 2, 3, 4, 5, 6];
    const yTickVals = [0, 1, 2, 3, 4, 5, 6];
    const tickLabels = ["0", "1", "2", "3", "4", "5"];
    svg.append("g")
      .attr("transform", `translate(0, ${height - marginBottom})`)
      .call(
        d3.axisBottom(x)
          .tickValues(xTickVals)
          .tickFormat((d, i) => tickLabels[i] ?? "")
      );
    svg.append("g")
      .attr("transform", `translate(${marginLeft}, 0)`)
      .call(
        d3.axisLeft(y)
          .tickValues(yTickVals)
          .tickFormat((d, i) => tickLabels[i] ?? "")
      );

    // 5+ 라벨
    svg.append("text")
      .attr("x", x(5.5))
      .attr("y", height - marginBottom + 20)
      .attr("fill", "#222")
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .text("5+");
    svg.append("text")
      .attr("x", marginLeft - 10)
      .attr("y", y(5.5) + 4)
      .attr("fill", "#222")
      .attr("text-anchor", "end")
      .attr("font-size", 12)
      .text("5+");

    // 히트맵 셀 그리기 (6x6)
    const counts = Array.from({ length: 6 }, () => Array(6).fill(0));
    filteredItems.forEach((d) => {
      const xVal = d[xKey] === "5+" ? 5 : Number(d[xKey]);
      const yVal = d[yKey] === "5+" ? 5 : Number(d[yKey]);
      const xi = bins.findIndex((b, i) => xVal >= bins[i] && xVal < bins[i + 1]);
      const yi = bins.findIndex((b, i) => yVal >= bins[i] && yVal < bins[i + 1]);
      counts[yi][xi] += 1;
    });
    const maxCount = Math.max(...counts.flat());
    // 셀 크기 (축과 일치)
    const cellW = (x(1) - x(0));
    const cellH = (y(0) - y(1));
    // 셀 그리기
    for (let yi = 0; yi < 6; yi++) {
      for (let xi = 0; xi < 6; xi++) {
        const count = counts[yi][xi];
        const cx = x(xi + 0.5);
        const cy = y(yi + 0.5); 
        svg.append("rect")
          .attr("x", x(xi))
          .attr("y", y(yi + 1)) 
          .attr("width", cellW)
          .attr("height", cellH)
          .attr("fill", getColor(count, maxCount))
          .attr("stroke", "#eee")
          .on("mouseenter", function () {
            if (count > 0) setHoveredCell({ xi, yi, x: cx, y: cy, count });
          })
          .on("mouseleave", function () {
            setHoveredCell(null);
          });
      }
    }
    // 축 제목
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("fill", "#222")
      .attr("text-anchor", "middle")
      .attr("font-size", 14)
      .text("Hits to KO Selected Pokémon");
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("fill", "#222")
      .attr("text-anchor", "middle")
      .attr("font-size", 14)
      .text("Hits each Pokémon can endure from selected move");
  }, [items, typeChecks, typeNames]);

  return (
    <svg ref={ref} width={width} height={height}>
      {/* 툴크: hoveredCell이 있으면 React로 SVG에 렌더링 */}
      {hoveredCell && hoveredCell.count > 0 && (
        <g
          transform={`translate(${hoveredCell.x},${hoveredCell.y - 30})`}
          pointerEvents="none"
        >
          <rect
            x={-22}
            y={-18}
            width={44}
            height={26}
            rx={5}
            fill="#222"
            opacity={0.95}
          />
          <text
            x={0}
            y={0}
            textAnchor="middle"
            fontSize={13}
            fill="#fff"
            fontWeight="bold"
          >
            {hoveredCell.count}
          </text>
        </g>
      )}
    </svg>
  );
} 