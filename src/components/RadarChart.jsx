import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

export default function RadarChart({ statsObj }) {
  const ref = useRef();

  useEffect(() => {
    if (!statsObj) return;
    d3.select(ref.current).selectAll("*").remove();

    const statNames = [
      "hp",
      "attack",
      "defense",
      "special-attack",
      "special-defense",
      "speed"
    ];
    const displayNames = ["HP", "Atk", "Def", "SpA", "SpD", "Spe"];
    const stats = statNames.map((name) => statsObj[name]);
    const maxStat = 180;
    const width = 260,
      height = 260,
      levels = 4;
    const radius = Math.min(width, height) / 2 - 30;
    const angleSlice = (Math.PI * 2) / statNames.length;
    const center = { x: width / 2, y: height / 2 };

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Grid circles
    for (let level = 1; level <= levels; level++) {
      const r = radius * (level / levels);
      svg
        .append("circle")
        .attr("cx", center.x)
        .attr("cy", center.y)
        .attr("r", r)
        .attr("fill", "none")
        .attr("stroke", "#bbb")
        .attr("stroke-width", 1);
    }

    // Axis lines and stat labels
    for (let i = 0; i < statNames.length; i++) {
      const angle = angleSlice * i - Math.PI / 2;
      const x2 = center.x + radius * Math.cos(angle);
      const y2 = center.y + radius * Math.sin(angle);

      svg
        .append("line")
        .attr("x1", center.x)
        .attr("y1", center.y)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", "#bbb")
        .attr("stroke-width", 1);

      svg
        .append("text")
        .attr("x", center.x + (radius + 18) * Math.cos(angle))
        .attr("y", center.y + (radius + 18) * Math.sin(angle) + 4)
        .attr("text-anchor", "middle")
        .attr("font-size", "13px")
        .attr("fill", "#222")
        .attr("font-weight", "bold")
        .text(displayNames[i]);
    }

    // Radar area
    const points = stats.map((stat, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const r = (stat / maxStat) * radius;
      return [
        center.x + r * Math.cos(angle),
        center.y + r * Math.sin(angle)
      ];
    });
    points.push(points[0]);

    // 애니메이션: 폴리곤
    const polygon = svg
      .append("polygon")
      .attr("points", Array(points.length).fill([center.x, center.y]).map((p) => p.join(",")).join(" "))
      .attr("fill", "rgba(76,175,80,0.20)")
      .attr("stroke", "#4caf50")
      .attr("stroke-width", 2);

    polygon
      .transition()
      .duration(700)
      .attr("points", points.map((p) => p.join(",")).join(" "));

    // Stat dots (애니메이션)
    const dotSelection = svg.selectAll(".stat-dot")
      .data(stats)
      .enter()
      .append("circle")
      .attr("class", "stat-dot")
      .attr("cx", center.x)
      .attr("cy", center.y)
      .attr("r", 4)
      .attr("fill", "#4caf50")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    dotSelection.transition()
      .duration(700)
      .attr("cx", (stat, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const r = (stat / maxStat) * radius;
        return center.x + r * Math.cos(angle);
      })
      .attr("cy", (stat, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const r = (stat / maxStat) * radius;
        return center.y + r * Math.sin(angle);
      });

    // Stat value labels (애니메이션 후 등장)
    setTimeout(() => {
      stats.forEach((stat, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const r = (stat / maxStat) * radius;
        const x = center.x + (r + 15) * Math.cos(angle);
        const y = center.y + (r + 15) * Math.sin(angle);
        svg
          .append("text")
          .attr("x", x)
          .attr("y", y + 4)
          .attr("text-anchor", "middle")
          .attr("font-size", "11px")
          .attr("fill", "#222")
          .text(stat)
          .attr("opacity", 0)
          .transition()
          .duration(200)
          .attr("opacity", 1);
      });
    }, 700);
  }, [statsObj]);

  return <div id="radar-chart" ref={ref}></div>;
}
