import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

export default function ScatterPlot({
  items,
  selectedItem,
  setSelectedItem,
  TYPE_COLORS,
  showMove = false,
}) {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); // Clear SVG content before redrawing

    const tooltipGroup = svg.append("g").attr("class", "tooltip-group");
    
    if (!items || items.length === 0) return;

    // 1. Define chart dimensions
    const width = 500;
    const height = 300;
    const marginTop = 20;
    const marginBottom = 20;
    const marginLeft = 40;
    const marginRight = 20;

    // 2. Set up scales
    const x = d3
      .scaleLinear()
      .domain([0, 5]) // Damage count
      .range([marginLeft, width - marginRight]);

    const y = d3
      .scaleLinear()
      .domain([0, 200]) // Pokemon speed
      .range([height - marginBottom, marginTop]);

    svg.attr("width", width).attr("height", height);

    // 3. Render axes
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - marginBottom})`)
      .call(d3.axisBottom(x).ticks(6));

    svg
      .append("g")
      .attr("transform", `translate(${marginLeft}, 0)`)
      .call(d3.axisLeft(y));

    // 4. Plot data points
    const dataPoints = svg
      .append("g")
      .selectAll("g")
      .data(items)
      .join("g")
      .attr("class", "datapoint")
      .attr("fill", (d) => TYPE_COLORS[d.type])
      .attr("transform", (d) => `translate(${x(d.count)}, ${y(d.speed)})`);

    dataPoints
      .append("circle")
      .attr("r", 3)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        // Toggle selection on click
        setSelectedItem(d.name === selectedItem ? null : d.name);
      });

    // In section "2. After the text is in the DOM, measure and resize the rect"
    items.forEach((d) => {
      if (d.name === selectedItem) {
        const tx = x(d.count);
        const ty = y(d.speed);

        const tooltip = tooltipGroup
          .append("g")
          .attr("transform", `translate(${tx}, ${ty - 30})`);

        // Append both text lines
        const nameText = tooltip
          .append("text")
          .text(d.name)
          .attr("text-anchor", "middle")
          .attr("font-size", 12)
          .attr("fill", "white")
          .attr("y", 0)
          .style("font-weight", "bold");

        const moveText = tooltip
          .append("text")
          .text(d.bestMove)
          .attr("text-anchor", "middle")
          .attr("font-size", 11)
          .attr("fill", "white")
          .attr("y", 16); // move below nameText

        // Get bounding boxes AFTER rendering both lines
        const nameBBox = nameText.node().getBBox();
        const moveBBox = moveText.node().getBBox();
        const width = Math.max(nameBBox.width, moveBBox.width) + 12;
        const height = nameBBox.height + moveBBox.height + 12;

        // Background rect
        tooltip
          .insert("rect", "text")
          .attr("x", -width / 2)
          .attr("y", -nameBBox.height)
          .attr("width", width)
          .attr("height", height)
          .attr("rx", 5)
          .attr("fill", "black");
      }
    });
  }, [items, selectedItem, setSelectedItem, TYPE_COLORS, showMove]);

  return <svg ref={ref} />;
}
