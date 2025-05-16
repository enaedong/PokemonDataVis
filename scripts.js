// Store all data globally
let allUsageData = [];

// Load usage data and build table
async function loadUsageData() {
  try {
    const response = await fetch('data/usage.json');
    allUsageData = await response.json();
    renderUsageTable(allUsageData);

    // Set up search bar event
    const searchBar = document.getElementById('search-bar');
    searchBar.addEventListener('input', function() {
      const query = this.value.trim().toLowerCase();
      const filtered = allUsageData.filter(p =>
        p.name.toLowerCase().includes(query)
      );
      renderUsageTable(filtered);
    });
  } catch (err) {
    console.error('Failed to load usage data:', err);
  }
}

function renderUsageTable(usageData) {
  const tbody = document.getElementById('usage-table-body');
  tbody.innerHTML = '';

  usageData.forEach(pokemon => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${pokemon.rank}</td>
      <td>${pokemon.name}</td>
      <td>
        <div class="usage-bar-container">
          <div class="usage-bar-bg">
            <div class="usage-bar-fill" style="width: ${pokemon.usage}%;"></div>
          </div>
          <span class="usage-label">${parseFloat(pokemon.usage).toFixed(1)}%</span>
        </div>
      </td>
    `;

    tr.addEventListener('click', () => fetchPokemonInfo(pokemon));
    tbody.appendChild(tr);
  });
}

// Render type boxes with matching colors
function renderTypeBoxes(types) {
  return types.map(typeObj => {
    const type = typeObj.type.name;
    const color = TYPE_COLORS[type] || '#AAA';
    return `<span class="type-box" style="background:${color};">${type.charAt(0).toUpperCase() + type.slice(1)}</span>`;
  }).join(' ');
}

// Fetch detailed Pokémon info from PokeAPI
async function fetchPokemonInfo(pokemon) {
  const statsDiv = document.getElementById("pokemon-stats");
  statsDiv.innerHTML = "Loading...";

  fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.safe_name}`)
    .then(response => {
      if (!response.ok) throw new Error("Pokémon not found");
      return response.json();
    })
    .then(data => {
      const typesHtml = renderTypeBoxes(data.types);
      const abilities = data.abilities.map(a => a.ability.name).join(", ");
      const stats = data.stats.map(s => `<li>${s.stat.name}: ${s.base_stat}</li>`).join("");
      const imageUrl = data.sprites.other["official-artwork"].front_default;

      statsDiv.innerHTML = `
        <div class="pokemon-detail-card">
          <img src="${imageUrl}" alt="${pokemon.name}" />
          <h2>${pokemon.name.toUpperCase()}</h2>
          <p><strong>Type:</strong> ${typesHtml}</p>
          <p><strong>Abilities:</strong> ${abilities}</p>
          <p><strong>Most Used Move:</strong> ${pokemon.top_move ? pokemon.top_move : "N/A"}</p>
          <ul><strong>Base Stats:</strong></ul>
          <div id="radar-chart"></div>
        </div>
      `;

      // Prepare stats object for radar chart
      const statsObj = {};
      data.stats.forEach(s => {
        statsObj[s.stat.name] = s.base_stat;
      });
      drawRadarChart(statsObj);
    })
    .catch(error => {
      statsDiv.innerHTML = `<p>Error loading data: ${error.message}</p>`;
    });
}

const TYPE_COLORS = {
  normal:   '#A8A77A',
  fire:     '#EE8130',
  water:    '#6390F0',
  electric: '#F7D02C',
  grass:    '#7AC74C',
  ice:      '#96D9D6',
  fighting: '#C22E28',
  poison:   '#A33EA1',
  ground:   '#E2BF65',
  flying:   '#A98FF3',
  psychic:  '#F95587',
  bug:      '#A6B91A',
  rock:     '#B6A136',
  ghost:    '#735797',
  dragon:   '#6F35FC',
  dark:     '#705746',
  steel:    '#B7B7CE',
  fairy:    '#D685AD'
};

function drawRadarChart(statsObj) {
  d3.select("#radar-chart").selectAll("*").remove();

  // Stat order and display names
  const statNames = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"];
  const displayNames = ["HP", "Atk", "Def", "SpA", "SpD", "Spe"];
  const stats = statNames.map(name => statsObj[name]);
  const maxStat = 180; // adjust if you want a different scale

  const width = 260, height = 260, levels = 4;
  const radius = Math.min(width, height) / 2 - 30;
  const angleSlice = (Math.PI * 2) / statNames.length;
  const center = { x: width / 2, y: height / 2 };

  const svg = d3.select("#radar-chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Draw grid circles and value labels
  for (let level = 1; level <= levels; level++) {
    const r = radius * (level / levels);
    svg.append("circle")
      .attr("cx", center.x)
      .attr("cy", center.y)
      .attr("r", r)
      .attr("fill", "none")
      .attr("stroke", "#bbb")
      .attr("stroke-width", 1);
  }

  // Draw axis lines and stat labels
  for (let i = 0; i < statNames.length; i++) {
    const angle = angleSlice * i - Math.PI / 2;
    const x2 = center.x + radius * Math.cos(angle);
    const y2 = center.y + radius * Math.sin(angle);

    // Axis line
    svg.append("line")
      .attr("x1", center.x)
      .attr("y1", center.y)
      .attr("x2", x2)
      .attr("y2", y2)
      .attr("stroke", "#bbb")
      .attr("stroke-width", 1);

    // Stat label
    svg.append("text")
      .attr("x", center.x + (radius + 18) * Math.cos(angle))
      .attr("y", center.y + (radius + 18) * Math.sin(angle) + 4)
      .attr("text-anchor", "middle")
      .attr("font-size", "13px")
      .attr("fill", "#222")
      .attr("font-weight", "bold")
      .text(displayNames[i]);
  }

  // Draw radar area (stat polygon)
  const points = stats.map((stat, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const r = (stat / maxStat) * radius;
    return [
      center.x + r * Math.cos(angle),
      center.y + r * Math.sin(angle)
    ];
  });
  points.push(points[0]); // close polygon

  svg.append("polygon")
    .attr("points", points.map(p => p.join(",")).join(" "))
    .attr("fill", "rgba(76,175,80,0.20)")
    .attr("stroke", "#4caf50")
    .attr("stroke-width", 2);

  // Stat dots and stat value labels
  stats.forEach((stat, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const r = (stat / maxStat) * radius;
    const x = center.x + r * Math.cos(angle);
    const y = center.y + r * Math.sin(angle);

    svg.append("circle")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", 4)
      .attr("fill", "#4caf50")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    // Stat value label (slightly outside the dot)
    svg.append("text")
      .attr("x", center.x + (r + 15) * Math.cos(angle))
      .attr("y", center.y + (r + 15) * Math.sin(angle) + 4)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("fill", "#222")
      .text(stat);
  });
}

// Initialize the page
loadUsageData();
