const locations = {
  "Entrance": [60, 270],
  "Admin Block": [150, 110],
  "Library": [290, 85],
  "CSE Dept": [430, 85],
  "IT Dept": [580, 105],
  "Mechanical Dept": [730, 150],
  "Civil Dept": [760, 310],
  "Electrical Dept": [610, 370],
  "Electronics Dept": [450, 370],
  "Lab 1": [300, 370],
  "Lab 2": [190, 315],
  "Classroom A": [200, 210],
  "Classroom B": [350, 210],
  "Auditorium": [500, 210],
  "Canteen": [655, 235],
  "Sports Ground": [500, 50],
  "Hostel": [700, 55],
  "Parking": [95, 380],
  "Medical Room": [395, 295],
  "Exit Gate": [860, 260]
};

const locationIcons = {
  "Entrance": "🚪",
  "Admin Block": "🏢",
  "Library": "📚",
  "CSE Dept": "💻",
  "IT Dept": "🖥️",
  "Mechanical Dept": "⚙️",
  "Civil Dept": "🏗️",
  "Electrical Dept": "⚡",
  "Electronics Dept": "🔌",
  "Lab 1": "🧪",
  "Lab 2": "🔬",
  "Classroom A": "🏫",
  "Classroom B": "🏫",
  "Auditorium": "🎤",
  "Canteen": "🍔",
  "Sports Ground": "🏏",
  "Hostel": "🏠",
  "Parking": "🅿️",
  "Medical Room": "🏥",
  "Exit Gate": "🚪"
};

const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");
const startSelect = document.getElementById("startLocation");
const endSelect = document.getElementById("endLocation");
const routeDetails = document.getElementById("routeDetails");

function distance(a, b) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

const graph = {};
for (const node1 in locations) {
  graph[node1] = {};
  for (const node2 in locations) {
    if (node1 !== node2) {
      const dist = distance(locations[node1], locations[node2]);
      if (dist < 240) {
        graph[node1][node2] = dist;
      }
    }
  }
}

function heuristic(a, b) {
  return distance(locations[a], locations[b]);
}

function astar(start, goal) {
  const openList = [{ node: start, f: 0 }];
  const g = { [start]: 0 };
  const parent = {};
  const visited = new Set();

  while (openList.length > 0) {
    openList.sort((a, b) => a.f - b.f);
    const current = openList.shift().node;

    if (visited.has(current)) continue;
    visited.add(current);

    if (current === goal) {
      const path = [goal];
      let temp = current;
      while (parent[temp]) {
        temp = parent[temp];
        path.push(temp);
      }
      return path.reverse();
    }

    for (const neighbor in graph[current]) {
      const newG = g[current] + graph[current][neighbor];
      if (!(neighbor in g) || newG < g[neighbor]) {
        g[neighbor] = newG;
        const f = newG + heuristic(neighbor, goal);
        openList.push({ node: neighbor, f });
        parent[neighbor] = current;
      }
    }
  }
  return [];
}

function fillDropdowns() {
  const locList = Object.keys(locations);
  locList.forEach(location => {
    startSelect.innerHTML += `<option value="${location}">${location}</option>`;
    endSelect.innerHTML += `<option value="${location}">${location}</option>`;
  });
  startSelect.value = locList[0];
  endSelect.value = locList[locList.length - 1];
}

function drawMap() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, 860, 570);

  const drawn = new Set();
  for (const node in graph) {
    for (const neighbor in graph[node]) {
      const pair = [node, neighbor].sort().join("-");
      if (drawn.has(pair)) continue;
      drawn.add(pair);

      const [x1, y1] = locations[node];
      const [x2, y2] = locations[neighbor];

      ctx.beginPath();
      ctx.setLineDash([5, 3]);
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 2;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }
  ctx.setLineDash([]);

  for (const name in locations) {
    const [x, y] = locations[name];

    ctx.beginPath();
    ctx.fillStyle = "#dbeafe";
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2;
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = "16px Segoe UI Emoji";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(locationIcons[name] || "📍", x, y);

    ctx.font = "bold 12px Segoe UI";
    ctx.fillStyle = "#1e293b";
    ctx.fillText(name, x, y + 30);
  }
}

function drawPath(path) {
  if (path.length < 2) return;

  for (let i = 0; i < path.length - 1; i++) {
    const [x1, y1] = locations[path[i]];
    const [x2, y2] = locations[path[i + 1]];

    ctx.beginPath();
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 5;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const segmentDistance = Math.floor(distance(locations[path[i]], locations[path[i + 1]]));

    ctx.font = "bold 11px Segoe UI";
    ctx.fillStyle = "#b91c1c";
    ctx.fillText(segmentDistance, midX, midY - 10);
  }

  const [sx, sy] = locations[path[0]];
  const [ex, ey] = locations[path[path.length - 1]];

  ctx.beginPath();
  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 4;
  ctx.arc(sx, sy, 23, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#166534";
  ctx.font = "bold 12px Segoe UI";
  ctx.fillText("START", sx, sy - 34);

  ctx.beginPath();
  ctx.strokeStyle = "#f97316";
  ctx.lineWidth = 4;
  ctx.arc(ex, ey, 23, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#c2410c";
  ctx.fillText("END", ex, ey - 34);
}

function getTotalDistance(path) {
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    total += distance(locations[path[i]], locations[path[i + 1]]);
  }
  return Math.floor(total);
}

function updateRouteInfo(path, totalDistance) {
  if (path.length === 0) {
    routeDetails.textContent = "No route found.";
    return;
  }

  let text = `Start: ${path[0]}\n`;
  text += `End: ${path[path.length - 1]}\n`;
  text += `Stops: ${path.length}\n`;
  text += `Total Distance: ${totalDistance} units\n\n`;
  text += "Path:\n";

  path.forEach((place, index) => {
    text += `${index + 1}. ${place}\n`;
  });

  routeDetails.textContent = text;
}

function findRoute() {
  const start = startSelect.value;
  const end = endSelect.value;

  if (start === end) {
    alert("Start and destination cannot be the same.");
    return;
  }

  drawMap();
  const path = astar(start, end);

  if (path.length === 0) {
    updateRouteInfo([], 0);
    alert("No path found between selected locations.");
    return;
  }

  drawPath(path);
  updateRouteInfo(path, getTotalDistance(path));
}

function resetMap() {
  const locList = Object.keys(locations);
  startSelect.value = locList[0];
  endSelect.value = locList[locList.length - 1];
  routeDetails.textContent = "Choose start and destination,\nthen click Find Path.";
  drawMap();
}

fillDropdowns();
drawMap();
