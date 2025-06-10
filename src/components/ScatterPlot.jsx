import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

/**
 * ScatterPlot
 * @param {Array} items - Array of data points, each with { x, y, speed, name, type, color? }
 * @param {Object} selectedPokemon - The selected Pokémon object (must have .stat.spe)
 * @param {string} selectedItem - Name of the currently selected Pokémon (for detail)
 * @param {function} setSelectedItem - Setter for selectedItem
 * @param {boolean} showMove - Whether to show move name in tooltip
 */
export default function ScatterPlot({
  items,
  selectedPokemon,
  selectedItem,
  setSelectedItem,
  showMove = false,
  typeChecks,
  typeNames,
  xRange = [0, 5.5],
  yRange = [0, 5.5],
  searchQuery,
}) {
  const ref = useRef();
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    
    if (!items || items.length === 0 || !selectedPokemon) return;

    // Filter items to only include those with checked types
    let filteredItems = items.filter((d) => {
      const types = Array.isArray(d.type) ? d.type : [d.type];
      return types.some((t) => {
        const tNorm = t.trim().toLowerCase();
        const idx = typeNames.findIndex(
          (name) => name.trim().toLowerCase() === tNorm
        );
        return idx !== -1 && typeChecks[idx];
      });
    });

    // Calculate axis ranges
    const xMin = Math.min(...xRange);
    const yMin = Math.min(...yRange);

    const xMaxRaw = Math.max(...xRange);
    const yMaxRaw = Math.max(...yRange);

    const xMax = xMaxRaw > 5 ? 5.5 : xMaxRaw;
    const yMax = yMaxRaw > 5 ? 5.5 : yMaxRaw;

    const xSpan = xMax - xMin;
    const ySpan = yMax - yMin;

    // Set the maximum axis length (e.g., 400px)
    const maxAxisLength = 550;
    let plotWidth, plotHeight;

    if (xSpan >= ySpan) {
      plotWidth = maxAxisLength;
      plotHeight = maxAxisLength * (ySpan / xSpan);
    } else {
      plotHeight = maxAxisLength;
      plotWidth = maxAxisLength * (xSpan / ySpan);
    }

    const marginTop = 60;
    const marginBottom = 40;
    const marginLeft = 50;
    const marginRight = 20;

    const width = plotWidth + marginLeft + marginRight;
    const height = plotHeight + marginTop + marginBottom;
    
    // Scales
    const x = d3
      .scaleLinear()
      .domain([xMin, xMax])
      .range([marginLeft, marginLeft + plotWidth]);
    const y = d3
      .scaleLinear()
      .domain([yMin, yMax])
      .range([height - marginBottom, marginTop]);

    // X-axis ticks
    const xTicks = [];
    let v = Math.ceil(xMin * 10) / 10;
    while (v < xMax - 1e-8) {
      xTicks.push(Math.round(v * 10) / 10);
      v += 0.1;
    }
    if (xMaxRaw > 5) {
      xTicks.push(5.5); // Only add 5+ tick if over 5
    } else {
      xTicks.push(Math.round(xMax * 10) / 10);
    }

    // Y-axis ticks
    const yTicks = [];
    v = Math.ceil(yMin * 10) / 10;
    while (v < yMax - 1e-8) {
      yTicks.push(Math.round(v * 10) / 10);
      v += 0.1;
    }
    if (yMaxRaw > 5) {
      yTicks.push(5.5);
    } else {
      yTicks.push(Math.round(yMax * 10) / 10);
    }

    // Further filter to only show points within the current axis range
    filteredItems = filteredItems.filter((d) => {
      const dx = d.x === "5+" ? 5.5 : d.x;
      const dy = d.y === "5+" ? 5.5 : d.y;
      return (
        dx >= xMin &&
        dx <= xMax &&
        dy >= yMin &&
        dy <= yMax
      );
    });

    svg.attr("width", width).attr("height", height);

    // 배경색
    const defs = svg.append("defs");

    defs.append('clipPath')
      .attr('id', 'clip-chart-area')
      .append('rect')
      .attr('x', marginLeft)
      .attr('y', marginTop - 10)
      .attr('width', plotWidth + 10)
      .attr('height', plotHeight + 10);

    const gradient = defs.append("linearGradient")
      .attr("id", "chart-bg-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");     

    // 좌측 상단 색깔
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "DeepSkyBlue")
      .attr("stop-opacity", 0.3);
    gradient.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "white")
      .attr("stop-opacity", 1);
    // 우측 하단 색깔
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "Orange")
      .attr("stop-opacity", 0.3);

    svg.append("rect")
      .attr("x", marginLeft - plotWidth * (xMin / xSpan))
      .attr("y", marginTop - 10 - plotHeight * ((5.5 - yMax) / ySpan))
      .attr("width", plotWidth * (5.5 / xSpan) + 10)
      .attr("height", plotHeight * (5.5 / ySpan) + 10)
      .style("fill", "url(#chart-bg-gradient)")  
      .attr('clip-path', 'url(#clip-chart-area)');

    // Draw X axis line
    svg.append("line")
      .attr("x1", marginLeft)
      .attr("y1", height - marginBottom)
      .attr("x2", marginLeft + plotWidth)
      .attr("y2", height - marginBottom)
      .attr("stroke", "#222");

    // Draw X axis ticks and labels
    xTicks.forEach((v) => {
      svg.append("line")
        .attr("x1", x(v))
        .attr("y1", height - marginBottom)
        .attr("x2", x(v))
        .attr("y2", height - marginBottom + (Number.isInteger(v) ? 12 : 6))
        .attr("stroke", "#222");
      if (Number.isInteger(v)) {
        svg.append("text")
          .attr("x", x(v))
          .attr("y", height - marginBottom + 24)
          .attr("text-anchor", "middle")
          .attr("font-size", 14)
          .attr("fill", "#222")
          .text(v >= 5.5 ? "5+" : v);
      }
    });
    
    // X axis label
    svg.append("text")
    .attr("x", marginLeft + plotWidth / 2)
    .attr("y", height)
    .attr("text-anchor", "middle")
    .attr("font-size", 16)
    .attr("fill", "#222")
    .text("Hits to KO Selected Pokémon");
    
    // Draw Y axis line
    svg.append("line")
    .attr("x1", marginLeft)
    .attr("y1", height - marginBottom)
    .attr("x2", marginLeft)
    .attr("y2", marginTop)
    .attr("stroke", "#222");
    
    // Draw Y axis ticks and labels
    yTicks.forEach((v) => {
      svg.append("line")
      .attr("x1", marginLeft)
      .attr("y1", y(v))
      .attr("x2", marginLeft - (Number.isInteger(v) ? 12 : 6))
      .attr("y2", y(v))
      .attr("stroke", "#222");
      if (Number.isInteger(v)) {
        svg.append("text")
        .attr("x", marginLeft - 16)
        .attr("y", y(v) + 5)
        .attr("text-anchor", "end")
        .attr("font-size", 14)
        .attr("fill", "#222")
        .text(v >= 5.5 ? "5+" : v);
      }
    });
    
    // Y axis label (rotated)
    svg.append("text")
    .attr("x", marginLeft - 40)
    .attr("y", marginTop + plotHeight / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", 16)
    .attr("fill", "#222")
    .attr("transform", `rotate(-90,${marginLeft - 40},${marginTop + plotHeight / 2})`)
    .text("Hits each Pokémon can endure from selected move");
    
    // X-axis end label (right end)
    svg.append("text")
      .attr("x", x(xMax))
      .attr("y", height - marginBottom + 24)
      .attr("text-anchor", "middle")
      .attr("font-size", 14)
      .attr("fill", "#222")
      .text(xMaxRaw > 5 ? "5+" : Number.isInteger(xMax) ? xMax : xMax.toFixed(1));

    // Y-axis end label (top end)
    svg.append("text")
      .attr("x", marginLeft - 16)
      .attr("y", y(yMax) + 5)
      .attr("text-anchor", "end")
      .attr("font-size", 14)
      .attr("fill", "#222")
      .text(yMaxRaw > 5 ? "5+" : Number.isInteger(yMax) ? yMax : yMax.toFixed(1));

    // X-axis start label (left end)
    svg.append("text")
      .attr("x", x(xMin))
      .attr("y", height - marginBottom + 24)
      .attr("text-anchor", "middle")
      .attr("font-size", 14)
      .attr("fill", "#222")
      .text(Number.isInteger(xMin) ? xMin : xMin.toFixed(1));

    // Y-axis start label (bottom end)
    svg.append("text")
      .attr("x", marginLeft - 16)
      .attr("y", y(yMin) + 5)
      .attr("text-anchor", "end")
      .attr("font-size", 14)
      .attr("fill", "#222")
      .text(Number.isInteger(yMin) ? yMin : yMin.toFixed(1));
  
    let pointsGroup = svg.select("g.datapoints");
    if (pointsGroup.empty()) {
      pointsGroup = svg.append("g").attr("class", "datapoints");
    }
    const lowerQuery = searchQuery?.toLowerCase() || "";

    pointsGroup
      .selectAll("circle")
      .data(filteredItems, (d) => d.name)
      .join("circle")
      .attr("cx", (d) => (d.x === "5+" ? x(5.5) : x(d.x)))
      .attr("cy", (d) => (d.y === "5+" ? y(5.5) : y(d.y)))
      .attr("r", (d) => {
        const isHovered = hoveredItem?.name === d.name;
        const isMatch = lowerQuery && d.name.toLowerCase().includes(lowerQuery);
        return isHovered ? 8 : isMatch ? 7 : 5;
      })
      .attr("fill", (d) => d.color)
      .attr("stroke", (d) => {
        const isMatch = lowerQuery && d.name.toLowerCase().includes(lowerQuery);
        if (d.name === selectedItem) return "#222"; // exact selected
        if (isMatch) return "gold"; // partial match
        return "white";
      })
      .attr("stroke-width", (d) => {
        if (d.name === selectedItem) return 2;
        if (
          searchQuery &&
          d.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
          return 2;
        return 1;
      })
      .attr("opacity", (d) => {
        const isMatch = lowerQuery && d.name.toLowerCase().includes(lowerQuery);

        if (isMatch) return 1; // partial match always full opacity
        if (selectedItem) return d.name === selectedItem ? 1 : 0.3;
        return 1;
      })
      .style("cursor", "pointer")

      .on("click", (event, d) => {
        event.stopPropagation();
        setSelectedItem(d.name === selectedItem ? null : d.name);
      })
      .on("mouseenter", (event, d) => {
        setHoveredItem(d);
      })
      .on("mouseleave", () => {
        setHoveredItem(null);
      });

    // Tooltip group
    if (!items || items.length === 0 || !selectedPokemon) return;
    svg.selectAll(".tooltip-group").remove();
    const tooltipGroup = svg.append("g")
      .attr("class", "tooltip-group")
      .attr("pointer-events", "none");

    if (hoveredItem) {
      let tx = hoveredItem.x === "5+" ? x(5.5) : x(hoveredItem.x);
      let ty = hoveredItem.y === "5+" ? y(5.5) - 30 : y(hoveredItem.y) - 30;

      const tooltip = tooltipGroup
        .append("g")
        .attr("transform", `translate(${tx}, ${ty})`);

      const nameText = tooltip
        .append("text")
        .text(hoveredItem.name)
        .attr("text-anchor", "middle")
        .attr("font-size", 13)
        .attr("fill", "white")
        .attr("y", 0)
        .style("font-weight", "bold");

      let moveText = null;
      if (showMove && hoveredItem.bestMove) {
        moveText = tooltip
          .append("text")
          .text(hoveredItem.bestMove)
          .attr("text-anchor", "middle")
          .attr("font-size", 11)
          .attr("fill", "white")
          .attr("y", 16);
      }

      const nameBBox = nameText.node().getBBox();
      const moveBBox = moveText
        ? moveText.node().getBBox()
        : { width: 0, height: 0 };
      const boxWidth = Math.max(nameBBox.width, moveBBox.width) + 12;
      const boxHeight = nameBBox.height + (moveBBox ? moveBBox.height : 0) + 12;

      // 툴팁 위치 경계 보정
      const svgWidth = width;
      const svgHeight = height;
      let txAdj = tx;
      let tyAdj = ty;
      if (tx + boxWidth / 2 > svgWidth) {
        txAdj = svgWidth - boxWidth / 2 - 4;
      }
      if (tx - boxWidth / 2 < 0) {
        txAdj = boxWidth / 2 + 4;
      }
      if (ty - boxHeight < 0) {
        tyAdj = boxHeight + 4;
      }
      if (ty > svgHeight) {
        tyAdj = svgHeight - 4;
      }
      tooltip.attr("transform", `translate(${txAdj}, ${tyAdj})`);

      tooltip
        .insert("rect", "text")
        .attr("x", -boxWidth / 2)
        .attr("y", -nameBBox.height - 1.5)
        .attr("width", boxWidth)
        .attr("height", boxHeight)
        .attr("rx", 5)
        .attr("fill", "black");
    }
  }, [
    items,
    selectedItem,
    hoveredItem,
    setSelectedItem,
    showMove,
    selectedPokemon,
    typeChecks,
    typeNames,
    xRange,
    yRange,
    searchQuery,
  ]);

  return <svg ref={ref} onClick={() => setSelectedItem(null)} style={{ cursor: 'pointer' }} />;
}
