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
}) {
  const ref = useRef();
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    if (!items || items.length === 0 || !selectedPokemon) return;

    // Filter items to only include those with checked types
    const filteredItems = items.filter((d) => {
      const types = Array.isArray(d.type) ? d.type : [d.type];
      return types.some((t) => {
        const tNorm = t.trim().toLowerCase();
        const idx = typeNames.findIndex(
          (name) => name.trim().toLowerCase() === tNorm
        );
        return idx !== -1 && typeChecks[idx];
      });
    });

    // Chart dimensions
    const width = 450;
    const height = 450;
    const marginTop = 60;
    const marginBottom = 40;
    const marginLeft = 50;
    const marginRight = 20;

    const x = d3
      .scaleLinear()
      .domain([0, 5.8])
      .range([marginLeft, width - marginRight]);
    const y = d3
      .scaleLinear()
      .domain([0, 5.8])
      .range([height - marginBottom, marginTop]);

    svg.attr("width", width).attr("height", height);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - marginBottom})`)
      .call(d3.axisBottom(x).ticks(6))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 35)
      .attr("fill", "#222")
      .attr("text-anchor", "middle")
      .attr("font-size", 14)
      .text("Hits to KO Selected Pokémon");

    svg
      .append("g")
      .attr("transform", `translate(${marginLeft}, 0)`)
      .call(d3.axisLeft(y).ticks(6))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -38)
      .attr("fill", "#222")
      .attr("text-anchor", "middle")
      .attr("font-size", 14)
      .text("Hits each Pokémon can endure from selected move");

    svg
      .append("text")
      .attr("x", x(5.5))
      .attr("y", height - marginBottom + 20)
      .attr("fill", "#222")
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .text("5+");
    svg
      .append("text")
      .attr("x", marginLeft - 10)
      .attr("y", y(5.5) + 4)
      .attr("fill", "#222")
      .attr("text-anchor", "end")
      .attr("font-size", 12)
      .text("5+");

    const pointsGroup = svg.append("g").attr("class", "datapoints");

    pointsGroup
      .selectAll("circle")
      .data(filteredItems)
      .join("circle")
      .attr("cx", (d) => (d.x === "5+" ? x(5.5) : x(d.x)))
      .attr("cy", (d) => (d.y === "5+" ? y(5.5) : y(d.y)))
      .attr(
        "r",
        (d) => (hoveredItem && hoveredItem.name === d.name ? 8 : 5) // Bigger if hovered
      )
      .attr("fill", (d) =>
        d.color
      )
      .attr("stroke", (d) => (d.name === selectedItem ? "#222" : "white"))
      .attr("stroke-width", (d) => (d.name === selectedItem ? 2 : 1))
      .style("cursor", "pointer")

      .on("click", (event, d) => {
        setSelectedItem(d.name === selectedItem ? null : d.name);
      })
      .on("mouseenter", (event, d) => {
        setHoveredItem(d);
      })
      .on("mouseleave", () => {
        setHoveredItem(null);
      });

    // Tooltip group
    svg.selectAll(".tooltip-group").remove();
    const tooltipGroup = svg.append("g").attr("class", "tooltip-group");

    if (hoveredItem) {
      const tx = hoveredItem.x === "5+" ? x(5.5) : x(hoveredItem.x);
      const ty = hoveredItem.y === "5+" ? y(5.5) -30 : y(hoveredItem.y) - 30;

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
  ]);

  return <svg ref={ref} />;
}
