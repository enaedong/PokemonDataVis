import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

/**
 * ScatterPlot
 * @param {Array} items - Array of data points, each with { x, y, speed, name, type, color? }
 * @param {Object} selectedPokemon - The selected Pokémon object (must have .stat.spe)
 * @param {string} selectedItem - Name of the currently selected Pokémon (for tooltip)
 * @param {function} setSelectedItem - Setter for selectedItem
 * @param {Object} TYPE_COLORS - Mapping from type to color (used for fallback)
 * @param {boolean} showMove - Whether to show move name in tooltip
 */
export default function ScatterPlot({
  items,
  selectedPokemon,
  selectedItem,
  setSelectedItem,
  TYPE_COLORS,
  showMove = false,
}) {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    if (!items || items.length === 0 || !selectedPokemon) return;

    // Chart dimensions
    const width = 450;
    const height = 450;
    const marginTop = 60;
    const marginBottom = 40;
    const marginLeft = 50;
    const marginRight = 20;

    // Scales
    const x = d3
      .scaleLinear()
      .domain([0, 5])
      .range([marginLeft, width - marginRight]);

    const y = d3
      .scaleLinear()
      .domain([0, 5])
      .range([height - marginBottom, marginTop]);

    svg.attr("width", width).attr("height", height);

    // X Axis
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

    // Y Axis
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

    // Plot points
    const pointsGroup = svg.append("g").attr("class", "datapoints");

    pointsGroup
      .selectAll("circle")
      .data(items)
      .join("circle")
      .attr("cx", (d) => x(d.x))
      .attr("cy", (d) => y(d.y))
      .attr("r", 5)
      .attr("fill", (d) =>
        d.speed > selectedPokemon.stat.spe
          ? "green"
          : "red"
      )
      .attr("stroke", (d) =>
        d.name === selectedItem ? "#222" : "white"
      )
      .attr("stroke-width", (d) => (d.name === selectedItem ? 2 : 1))
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        setSelectedItem(d.name === selectedItem ? null : d.name);
      });

    // Tooltip group
    svg.selectAll(".tooltip-group").remove();
    const tooltipGroup = svg.append("g").attr("class", "tooltip-group");

    // Draw tooltip for selected item
    items.forEach((d) => {
      if (d.name === selectedItem) {
        const tx = x(d.x);
        const ty = y(d.y) - 30;

        const tooltip = tooltipGroup
          .append("g")
          .attr("transform", `translate(${tx}, ${ty})`);

        // Name
        const nameText = tooltip
          .append("text")
          .text(d.name)
          .attr("text-anchor", "middle")
          .attr("font-size", 13)
          .attr("fill", "white")
          .attr("y", 0)
          .style("font-weight", "bold");

        // Move (optional)
        let moveText;
        if (showMove && d.bestMove) {
          moveText = tooltip
            .append("text")
            .text(d.bestMove)
            .attr("text-anchor", "middle")
            .attr("font-size", 11)
            .attr("fill", "white")
            .attr("y", 16);
        }

        // Get bounding boxes
        const nameBBox = nameText.node().getBBox();
        const moveBBox = moveText ? moveText.node().getBBox() : { width: 0, height: 0 };
        const boxWidth = Math.max(nameBBox.width, moveBBox.width) + 12;
        const boxHeight = nameBBox.height + (moveText ? moveBBox.height : 0) + 12;

        tooltip
          .insert("rect", "text")
          .attr("x", -boxWidth / 2)
          .attr("y", -nameBBox.height)
          .attr("width", boxWidth)
          .attr("height", boxHeight)
          .attr("rx", 5)
          .attr("fill", "black");
      }
    });
  }, [items, selectedItem, setSelectedItem, TYPE_COLORS, showMove, selectedPokemon]);

  return <svg ref={ref} />;
}
