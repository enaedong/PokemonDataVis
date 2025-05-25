import React, { useEffect, useState } from "react";
import TYPE_COLORS from "../utils/typeColors";

export default function MoveBoxes({ moveNames, moveUsages = {} }) {
  const [moveDetails, setMoveDetails] = useState({});
  const [tooltip, setTooltip] = useState({ visible: false, content: {}, x: 0, y: 0 });

  // Fetch move data from PokéAPI
  useEffect(() => {
    const fetchMoveInfo = async (moveName) => {
      const safe = moveName.toLowerCase().replace(/[^a-z0-9-]/g, "-");
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/move/${safe}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        return {
          type: data.type.name,
          category: data.damage_class.name,
          power: data.power,
        };
      } catch {
        return {
          type: "unknown",
          category: "unknown",
          power: null,
        };
      }
    };

    const loadAllMoves = async () => {
      const result = {};
      for (const move of moveNames) {
        result[move] = await fetchMoveInfo(move);
      }
      setMoveDetails(result);
    };

    loadAllMoves();
  }, [moveNames]);

  const handleMouseEnter = (move, event) => {
    const detail = moveDetails[move] || {};
    setTooltip({
      visible: true,
      content: {
        move,
        type: detail.type,
        category: detail.category,
        power: detail.power,
        usage: moveUsages[move],
      },
      x: event.clientX + 10,
      y: event.clientY + 10,
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ ...tooltip, visible: false });
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
        {moveNames.map((move) => {
          const type = moveDetails[move]?.type || "unknown";
          const color = TYPE_COLORS[type] || "#AAA";

          return (
            <span
              key={move}
              style={{
                background: color,
                padding: "4px 8px",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "12px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => handleMouseEnter(move, e)}
              onMouseLeave={handleMouseLeave}
            >
              {move}
            </span>
          );
        })}
      </div>

      {tooltip.visible && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y,
            background: "#333",
            color: "#fff",
            padding: "6px 10px",
            borderRadius: "6px",
            fontSize: "12px",
            pointerEvents: "none",
            zIndex: 999,
            maxWidth: "200px",
          }}
        >
          <div><strong>{tooltip.content.move}</strong></div>
          <div>Type: {tooltip.content.type}</div>
          <div>Category: {tooltip.content.category}</div>
          <div>Power: {tooltip.content.power ?? "—"}</div>
          <div>Usage: {tooltip.content.usage?.toFixed(1) ?? "—"}%</div>
        </div>
      )}
    </div>
  );
}
