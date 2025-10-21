let rows, cols;
let maze = [];
let start = null, end = null;
let mode = "";
let currentAlgorithm = "bfs";
let currentGraphType = "unweighted";
let animationSpeed = 60;

const gridDiv = document.getElementById("grid");
const queueDiv = document.getElementById("queueDisplay");
const resultDiv = document.getElementById("result");
const algorithmTitle = document.getElementById("algorithmTitle");
const sidebar = document.getElementById("sidebar");
const mainContent = document.getElementById("mainContent");
const navbarToggle = document.getElementById("navbarToggle");

document.getElementById("createGrid").onclick = createGrid;
document.getElementById("setStart").onclick = () => (mode = "start");
document.getElementById("setEnd").onclick = () => (mode = "end");
document.getElementById("runAlgorithm").onclick = runSelectedAlgorithm;
document.getElementById("reset").onclick = resetGrid;

navbarToggle.onclick = toggleSidebar;

document.querySelectorAll('input[name="algorithm"]').forEach(radio => { 
  radio.addEventListener('change', (e) => {
    currentAlgorithm = e.target.value;
    updateAlgorithmTitle();
  });
});

document.querySelectorAll('input[name="graphType"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    currentGraphType = e.target.value;
    toggleWeightControls();
    updateGridDisplay();
  });
});

document.getElementById("speedSlider").addEventListener('input', (e) => {
  animationSpeed = parseInt(e.target.value);
});

document.getElementById("randomizeWeights").addEventListener('click', randomizeWeights);

function toggleWeightControls() {
  const weightControls = document.getElementById("weightControls");
  if (currentGraphType === "weighted") {
    weightControls.style.display = "block";
  } else {
    weightControls.style.display = "none";
  }
}

function randomizeWeights() {
  if (maze.length === 0) {
    alert("Please create a grid first!");
    return;
  }

  document.querySelectorAll('.cell:not(.wall):not(.start):not(.end)').forEach(cell => {
    const weight = Math.floor(Math.random() * 5) + 1;
    cell.dataset.weight = weight;
    cell.classList.add('weighted');
    cell.style.background = '';
    cell.style.opacity = '';
  });

  queueDiv.textContent = "Weights randomized! Numbers show cell costs (1=lowest, 5=highest).";
}

function toggleSidebar() {
  sidebar.classList.toggle('active');
  mainContent.classList.toggle('shifted');
}

function updateAlgorithmTitle() {
  const algorithmNames = {
    bfs: "BFS Pathfinding Visualizer",
    dfs: "DFS Pathfinding Visualizer"
  };
  algorithmTitle.textContent = algorithmNames[currentAlgorithm];
}

function updateGridDisplay() {
  if (currentGraphType === "weighted" && maze.length > 0) {
    document.querySelectorAll('.cell:not(.wall):not(.start):not(.end)').forEach(cell => {
      if (!cell.dataset.weight) {
        const weight = Math.floor(Math.random() * 5) + 1;
        cell.dataset.weight = weight;
        cell.classList.add('weighted');
      }
    });
  } else {
    document.querySelectorAll('.cell').forEach(cell => {
      delete cell.dataset.weight;
      cell.style.background = '';
      cell.style.opacity = '';
      cell.classList.remove('weighted');
    });
  }
}

function getCellWeight(row, col) {
  if (currentGraphType === "unweighted") return 1;
  
  const cell = document.getElementById(`cell-${row}-${col}`);
  return parseInt(cell.dataset.weight) || 1;
}

function runSelectedAlgorithm() {
  if (currentGraphType === "weighted") {
    if (currentAlgorithm === "bfs") {
      runDijkstra();
    } else if (currentAlgorithm === "dfs") {
      runWeightedDFS();
    }
  } else {
    if (currentAlgorithm === "bfs") {
      runBFS();
    } else if (currentAlgorithm === "dfs") {
      runDFS();
    }
  }
}

function createGrid() {
  gridDiv.innerHTML = "";
  start = null; end = null;
  resultDiv.textContent = "";
  resultDiv.className = "";
  queueDiv.textContent = "Grid created! Click to add walls, or set start/end points.";

  const size = parseInt(prompt("Enter grid size (e.g. 15 for 15x15):"));
  if (isNaN(size) || size <= 0 || size>=51) return alert("Enter a valid number between 0-50 only!");
  // if(size>=50)

  rows = cols = size;
  maze = Array.from({ length: rows }, () => Array(cols).fill(0));

  gridDiv.style.gridTemplateColumns = `repeat(${cols}, 24px)`;
  gridDiv.style.gridTemplateRows = `repeat(${rows}, 24px)`;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.id = `cell-${r}-${c}`;
      cell.className = "cell";
      cell.addEventListener("click", () => handleCellClick(r, c));
      gridDiv.appendChild(cell);
    }
  }

  toggleWeightControls();
  updateGridDisplay();
}

function handleCellClick(r, c) {
  const cell = document.getElementById(`cell-${r}-${c}`);

  if (mode === "start") {
    if (start) document.getElementById(`cell-${start.row}-${start.col}`).classList.remove("start");
    start = { row: r, col: c };
    cell.classList.add("start");
  } else if (mode === "end") {
    if (end) document.getElementById(`cell-${end.row}-${end.col}`).classList.remove("end");
    end = { row: r, col: c };
    cell.classList.add("end");
  } else {
    maze[r][c] = maze[r][c] === 0 ? 1 : 0;
    cell.classList.toggle("wall");
  }
}

async function runBFS() {
  if (!start || !end) {
    resultDiv.textContent = "Please select both Start and End points!";
    resultDiv.className = "error";
    return;
  }

  resultDiv.textContent = "";
  resultDiv.className = "";

  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const parent = new Map();
  const queue = [start];
  visited[start.row][start.col] = true;

  const dirs = [[1,0], [-1,0], [0,1], [0,-1]];

  while (queue.length) {
    const curr = queue.shift();
    const { row, col } = curr;

    if (!(row === start.row && col === start.col)) {
      document.getElementById(`cell-${row}-${col}`).classList.add("visited");
    }

    queueDiv.innerHTML = `<b>Exploring:</b> (${row},${col}) | <b>Queue:</b> [${queue.map(q => `(${q.row},${q.col})`).join(", ")}]`;

    if (row === end.row && col === end.col) {
      await showPath(parent, end);
      resultDiv.textContent = "Shortest Path Found!";
      resultDiv.className = "success";
      queueDiv.textContent = `${currentAlgorithm.toUpperCase()} Algorithm completed successfully!`;
      return;
    }

    for (let [dx, dy] of dirs) {
      const nr = row + dx, nc = col + dy;
      if (
        nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
        maze[nr][nc] === 0 && !visited[nr][nc]
      ) {
        visited[nr][nc] = true;
        parent.set(`${nr},${nc}`, `${row},${col}`);
        queue.push({ row: nr, col: nc });
      }
    }

    await new Promise(res => setTimeout(res, animationSpeed));
  }

  resultDiv.textContent = "No Path Found!";
  resultDiv.className = "error";
  queueDiv.textContent = `${currentAlgorithm.toUpperCase()} completed - no path exists between start and end.`;
}


async function runDFS() {
  if (!start || !end) {
    resultDiv.textContent = "Please select both Start and End points!";
    resultDiv.className = "error";
    return;
  }

  resultDiv.textContent = "";
  resultDiv.className = "";
  queueDiv.textContent = "";

  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const parent = new Map();

  const dirs = [[0,1], [1,0], [0,-1], [-1,0]];
  let dirIndex = 0;
  let found = false;

  async function dfs(row, col) {
    if (found) return;
    visited[row][col] = true;

    if (!(row === start.row && col === start.col)) {
      document.getElementById(`cell-${row}-${col}`).classList.add("visited");
    }

    queueDiv.innerHTML = `<b>Exploring:</b> (${row},${col})`;

    if (row === end.row && col === end.col) {
      found = true;
      await showPath(parent, end);
      resultDiv.textContent = "Path Found using DFS!";
      resultDiv.className = "success";
      queueDiv.textContent = "DFS completed successfully!";
      return;
    }

    for (let k = 0; k < 4; k++) {
      const [dx, dy] = dirs[(dirIndex + k) % 4];
      const nr = row + dx, nc = col + dy;

      if (
        nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
        maze[nr][nc] === 0 && !visited[nr][nc]
      ) {
        parent.set(`${nr},${nc}`, `${row},${col}`);
        await new Promise(res => setTimeout(res, animationSpeed));
        await dfs(nr, nc);
      }
    }

    dirIndex = (dirIndex + 1) % 4;
  }

  await dfs(start.row, start.col);

  if (!found) {
    resultDiv.textContent = "No Path Found!";
    resultDiv.className = "error";
    queueDiv.textContent = "DFS completed - no path exists between start and end.";
  }
}





async function showPath(parent, end, totalCost = null) {
  let path = [];
  let curr = `${end.row},${end.col}`;

  while (parent.has(curr)) {
    const [r, c] = curr.split(',').map(Number);
    path.push({ row: r, col: c });
    curr = parent.get(curr);
  }
  path.reverse();

  for (let cell of path) {
    const el = document.getElementById(`cell-${cell.row}-${cell.col}`);
    el.classList.add("path");
    await new Promise(res => setTimeout(res, 100));
  }

  if (totalCost !== null && currentGraphType === "weighted") {
    resultDiv.innerHTML = `Path Found! Total Cost: <strong>${totalCost}</strong>`;
  }
}

async function runDijkstra() {
  if (!start || !end) {
    resultDiv.textContent = "Please select both Start and End points!";
    resultDiv.className = "error";
    return;
  }

  resultDiv.textContent = "";
  resultDiv.className = "";

  const distances = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const parent = new Map();
  
  const pq = [[0, start.row, start.col]];
  distances[start.row][start.col] = 0;

  const dirs = [[1,0], [-1,0], [0,1], [0,-1]];

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [currentDist, row, col] = pq.shift();

    if (visited[row][col]) continue;
    visited[row][col] = true;

    if (!(row === start.row && col === start.col)) {
      document.getElementById(`cell-${row}-${col}`).classList.add("visited");
    }

    queueDiv.innerHTML = `<b>Dijkstra Exploring:</b> (${row},${col}) | <b>Distance:</b> ${currentDist} | <b>Queue Size:</b> ${pq.length}`;

    if (row === end.row && col === end.col) {
      await showPath(parent, end, currentDist);
      resultDiv.className = "success";
      queueDiv.textContent = `Dijkstra completed! Shortest path cost: ${currentDist}`;
      return;
    }

    for (let [dx, dy] of dirs) {
      const nr = row + dx, nc = col + dy;
      if (
        nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
        maze[nr][nc] === 0 && !visited[nr][nc]
      ) {
        const weight = getCellWeight(nr, nc);
        const newDist = currentDist + weight;
        
        if (newDist < distances[nr][nc]) {
          distances[nr][nc] = newDist;
          parent.set(`${nr},${nc}`, `${row},${col}`);
          pq.push([newDist, nr, nc]);
        }
      }
    }

    await new Promise(res => setTimeout(res, animationSpeed));
  }

  resultDiv.textContent = "No Path Found!";
  resultDiv.className = "error";
  queueDiv.textContent = "Dijkstra completed - no path exists between start and end.";
}

async function runWeightedDFS() {
  if (!start || !end) {
    resultDiv.textContent = "Please select both Start and End points!";
    resultDiv.className = "error";
    return;
  }

  resultDiv.textContent = "";
  resultDiv.className = "";

  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const parent = new Map();
  const costs = new Map();
  
  const stack = [[start.row, start.col, 0]];
  visited[start.row][start.col] = true;
  costs.set(`${start.row},${start.col}`, 0);

  const dirs = [[1,0], [-1,0], [0,1], [0,-1]];
  let pathFound = false;
  let finalCost = 0;

  while (stack.length && !pathFound) {
    const [row, col, currentCost] = stack.pop();

    if (!(row === start.row && col === start.col)) {
      document.getElementById(`cell-${row}-${col}`).classList.add("visited");
    }

    queueDiv.innerHTML = `<b>Weighted DFS:</b> (${row},${col}) | <b>Cost:</b> ${currentCost} | <b>Stack Size:</b> ${stack.length}`;

    if (row === end.row && col === end.col) {
      finalCost = currentCost;
      pathFound = true;
      await showPath(parent, end, finalCost);
      resultDiv.className = "success";
      queueDiv.textContent = `Weighted DFS completed! Path cost: ${finalCost}`;
      return;
    }

    for (let [dx, dy] of dirs) {
      const nr = row + dx, nc = col + dy;
      if (
        nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
        maze[nr][nc] === 0 && !visited[nr][nc]
      ) {
        const weight = getCellWeight(nr, nc);
        const newCost = currentCost + weight;
        
        visited[nr][nc] = true;
        parent.set(`${nr},${nc}`, `${row},${col}`);
        costs.set(`${nr},${nc}`, newCost);
        stack.push([nr, nc, newCost]);
      }
    }

    await new Promise(res => setTimeout(res, animationSpeed));
  }

  if (!pathFound) {
    resultDiv.textContent = "No Path Found!";
    resultDiv.className = "error";
    queueDiv.textContent = "Weighted DFS completed - no path exists between start and end.";
  }
}

function resetGrid() {
  document.querySelectorAll(".cell").forEach(c => {
    c.className = "cell";
    c.style.background = "";
    c.style.opacity = "";
    delete c.dataset.weight;
  });
  start = null;
  end = null;
  resultDiv.textContent = "";
  mode="";
  resultDiv.className = "";
  queueDiv.textContent = "Grid reset! Ready for a new pathfinding visualization.";
  if (maze.length > 0) {
    maze = Array.from({ length: rows }, () => Array(cols).fill(0));
    updateGridDisplay();
  }
}
