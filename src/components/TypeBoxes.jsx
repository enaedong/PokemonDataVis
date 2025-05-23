// components/TypeBoxes.jsx
import React from "react";
import TYPE_COLORS from "../utils/typeColors";

export default function TypeBoxes({ types }) {
  if (!types) return null;
  return (
    <>
      {types.map((typeObj, i) => {
        const type = typeObj.type.name;
        const color = TYPE_COLORS[type] || "#AAA";
        return (
          <span
            key={i}
            className="type-box"
            style={{ background: color }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        );
      })}
    </>
  );
}
