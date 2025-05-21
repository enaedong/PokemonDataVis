// components/ChartControls.jsx
import React from "react";

export default function ChartControls({
  damageDropdownOpen, setDamageDropdownOpen,
  damageDropdownHover, setDamageDropdownHover,
  damageDropdownValue, setDamageDropdownValue,
  durabilityDropdownOpen, setDurabilityDropdownOpen,
  durabilityDropdownHover, setDurabilityDropdownHover,
  durabilityDropdownValue, setDurabilityDropdownValue,
  damageDropdownRef, durabilityDropdownRef
}) {
  const damageOptions = ["All damage", "One shot kill", "Two shot kill", "Three shot kill"];
  const durabilityOptions = ["All Durability", "Endure once", "Endure twice", "Endure thrice"];

  return (
    <div className="chart-buttons-row">
      <div className="dropdown-btn-wrapper" ref={damageDropdownRef} tabIndex={0}>
        <button
          className="chart-btn dropdown-btn"
          onClick={() => setDamageDropdownOpen((open) => !open)}
        >
          {damageDropdownHover || damageDropdownValue}
          <span className="dropdown-arrow">&#9662;</span>
        </button>
        {damageDropdownOpen && (
          <ul className="dropdown-menu" role="listbox">
            {damageOptions.map((option) => (
              <li
                key={option}
                className={
                  "dropdown-menu-item" +
                  ((damageDropdownHover || damageDropdownValue) === option ? " selected" : "")
                }
                onMouseEnter={() => setDamageDropdownHover(option)}
                onMouseLeave={() => setDamageDropdownHover(null)}
                onClick={() => {
                  setDamageDropdownValue(option);
                  setDamageDropdownOpen(false);
                  setDamageDropdownHover(null);
                }}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button className="chart-btn">Type</button>

      <div className="dropdown-btn-wrapper" ref={durabilityDropdownRef} tabIndex={0}>
        <button
          className="chart-btn dropdown-btn"
          onClick={() => setDurabilityDropdownOpen((open) => !open)}
        >
          {durabilityDropdownHover || durabilityDropdownValue}
          <span className="dropdown-arrow">&#9662;</span>
        </button>
        {durabilityDropdownOpen && (
          <ul className="dropdown-menu" role="listbox">
            {durabilityOptions.map((option) => (
              <li
                key={option}
                className={
                  "dropdown-menu-item" +
                  ((durabilityDropdownHover || durabilityDropdownValue) === option ? " selected" : "")
                }
                onMouseEnter={() => setDurabilityDropdownHover(option)}
                onMouseLeave={() => setDurabilityDropdownHover(null)}
                onClick={() => {
                  setDurabilityDropdownValue(option);
                  setDurabilityDropdownOpen(false);
                  setDurabilityDropdownHover(null);
                }}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
