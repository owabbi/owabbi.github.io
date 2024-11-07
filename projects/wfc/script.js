console.log("test test test A");

let showGrid = false;
// Define tiles and constraints
const tiles = {
    water: { colors: ["#00aaff", "#0099dd"], neighbors: ["water", "sand", "rocks"] },
    sand: { color: "#ffe680", neighbors: ["sand", "water", "grass"] },
    grass: { color: "#66ff66", neighbors: ["grass", "sand", "trees", "rocks"] },
    trees: { color: "#006600", neighbors: ["trees", "grass", "rocks"] },
    rocks: { color: "#808080", neighbors: ["water", "sand", "grass", "trees", "rocks"], }
};

// Grid settings
const gridSize = 30; // 20x20 grid
const tileSize = 20; // 20 pixels per tile
grid = [];

const noiseScale = 0.25; // Random seed for variation

function initializeGridWithAllOptions() {
    grid = Array.from({ length: gridSize }, () =>
        Array.from({ length: gridSize }, () => ({
            collapsed: false,
            options: Object.keys(tiles) // All possible options set initially
        }))
    );
}


const canvas = document.getElementById("islandCanvas");
const ctx = canvas.getContext("2d");
let collapseQueue = [];  // Queue to store cells to collapse
let autoCollapse = false; // Flag for "Skip All" mode

function applyPreferences() {
    const sliderElement = document.getElementById("islandSize");
    const islandSize = parseInt(sliderElement.value, 10); // Parse to ensure it's an integer

    const treeDensitySlider = document.getElementById("treeDensitySlider");
    const treeDensity = parseInt(treeDensitySlider.value, 10) / 100; // Convert to decimal

    const potatoFactorSlider = document.getElementById("potatoFactorSlider");
    const potatoFactor = parseInt(potatoFactorSlider.value, 10) / 100; // Convert to decimal

    if (isNaN(islandSize)) {
        console.error("Invalid islandSize from slider. Using default of 3.");
        return;
    }

    // Step 1: Set water borders
    for (let x = 0; x < gridSize; x++) {
        grid[0][x].options = ["water"];
        grid[gridSize - 1][x].options = ["water"];
        grid[x][0].options = ["water"];
        grid[x][gridSize - 1].options = ["water"];
    }

    // Step 2: Set the core (center island area) based on islandSize
    const centerX = Math.floor(gridSize / 2);
    const centerY = Math.floor(gridSize / 2);
    const maxLandRadius = Math.min(islandSize + 1, Math.floor(gridSize / 2) - 1);

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Calculate Perlin noise for this cell
            const noiseValue = noise.perlin2(x * noiseScale, y * noiseScale);

            // Define thresholds for land and water
            const landThreshold = 0.2; // Adjust for more or less land
            const outerWaterThreshold = islandSize + 3;

            // Core zone based on noise value and distance from center
            if (distance <= islandSize && noiseValue > -landThreshold) {
                grid[y][x].options = Math.random() < treeDensity ? ["trees"] : ["grass"];
            }
            // Transition zone with noise influence
            else if (distance <= outerWaterThreshold && noiseValue > -0.3) {
                grid[y][x].options = ["sand", "grass"];
            }
            // Beyond the outer zone - water only
            else {
                grid[y][x].options = Math.random() < 0.01 ? ["rocks"] : ["water"];
            }
        }
    }
}

function smoothMap() {
    const newGrid = JSON.parse(JSON.stringify(grid)); // Copy of grid to apply smoothing

    for (let y = 1; y < gridSize - 1; y++) {
        for (let x = 1; x < gridSize - 1; x++) {
            const cell = grid[y][x];
            const neighbors = [
                grid[y - 1][x], grid[y + 1][x], grid[y][x - 1], grid[y][x + 1]
            ];

            const waterCount = neighbors.filter(n => n.options[0] === "water").length;

            // If surrounded mostly by water, convert cell to water for smoother transition
            if (waterCount >= 3) {
                newGrid[y][x].options = ["water"];
            }
            // If surrounded by land, make it less likely to be water
            else if (waterCount <= 1 && cell.options[0] === "water") {
                newGrid[y][x].options = ["sand"];
            }
        }
    }
    grid = newGrid; // Update grid with smoothed version
}


// Priority queue to store cells by number of options
let priorityQueue = [];

function initializePriorityQueue() {
    priorityQueue = [];

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = grid[y][x];
            if (!cell.collapsed) {
                priorityQueue.push({ x, y, optionsCount: cell.options.length });
            }
        }
    }

    // Sort initially by options count
    priorityQueue.sort((a, b) => a.optionsCount - b.optionsCount);
}

function updatePriorityQueue(x, y) {
    const cell = grid[y][x];
    priorityQueue = priorityQueue.filter(item => item.x !== x || item.y !== y);

    // Reinsert the updated cell with its new options count
    if (!cell.collapsed) {
        priorityQueue.push({ x, y, optionsCount: cell.options.length });
        priorityQueue.sort((a, b) => a.optionsCount - b.optionsCount);
    }
}


function collapseCell(x, y) {
    const cell = grid[y][x];
    if (cell.collapsed) return;

    if (cell.options.length === 0) {
        cell.options = ["sand"];
    }

    // Randomly select one option from the remaining options
    const choice = cell.options[Math.floor(Math.random() * cell.options.length)];
    cell.collapsed = true;
    cell.options = [choice]; // Fix the tile type

    propagate(x, y, choice); // Propagate constraints to neighbors
}

function propagate(x, y, collapsedType) {
    const neighbors = [
        { dx: -1, dy: 0 }, // Left
        { dx: 1, dy: 0 },  // Right
        { dx: 0, dy: -1 }, // Top
        { dx: 0, dy: 1 }   // Bottom
    ];

    neighbors.forEach(({ dx, dy }) => {
        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
            const neighbor = grid[ny][nx];
            if (!neighbor.collapsed) {
                neighbor.options = neighbor.options.filter(opt =>
                    tiles[collapsedType].neighbors.includes(opt)
                );

                if (neighbor.options.length === 1) {
                    collapseCell(nx, ny); // Immediately collapse if only one option remains
                } else {
                    updatePriorityQueue(nx, ny); // Update queue with new options count
                }
            }
        }
    });
}


function startCollapse() {
    initializePriorityQueue(); // Initialize the queue

    while (priorityQueue.length > 0) {
        const { x, y } = priorityQueue.shift(); // Get the cell with the fewest options
        collapseCell(x, y);
    }

    renderGrid(); // Render final map only once after full collapse
}


function initializeMap() {
    initializeGridWithAllOptions();        // Step 1: Empty grid
    applyPreferences();           // Step 3: Apply border and center constraints
    // smoothMap();
    startCollapse();
    // startAnimation();
}

// Trigger map recreation with a button click
document.getElementById("recreateMapButton").addEventListener("click", initializeMap);


// // Initialize the grid with preset water borders and allow adjacent cells to be water or sand
// function initializeBorders(treeDensity = 5, islandSize = 1) {
//     for (let x = 0; x < gridSize; x++) {
//         grid[0][x] = { collapsed: true, options: ["water"] };            // Top row
//         grid[gridSize - 1][x] = { collapsed: true, options: ["water"] }; // Bottom row
//         grid[x][0] = { collapsed: true, options: ["water"] };            // Left column
//         grid[x][gridSize - 1] = { collapsed: true, options: ["water"] }; // Right column
//     }

//     // Set adjacent cells to allow either water or sand
//     for (let x = 1; x < gridSize - 1; x++) {
//         grid[1][x].options = ["water", "sand"];             // Second row
//         grid[gridSize - 2][x].options = ["water", "sand"];  // Second-last row
//         grid[x][1].options = ["water", "sand"];             // Second column
//         grid[x][gridSize - 2].options = ["water", "sand"];  // Second-last column
//     }

//     // Seed the center with grass or trees for island formation
//     const centerX = Math.floor(gridSize / 2);
//     const centerY = Math.floor(gridSize / 2);
//     const maxRadius = Math.min(5, islandSize);
//     const grassDominanceThreshold = 3;

//     for (let radius = 0; radius < maxRadius; radius++) {
//         const startX = centerX - 2 - radius;
//         const endX = centerX + 1 + radius;
//         const startY = centerY - 2 - radius;
//         const endY = centerY + 1 + radius;

//         for (let y = startY; y <= endY; y++) {
//             for (let x = startX; x <= endX; x++) {
//                 if (x > 1 && x < gridSize - 2 && y > 1 && y < gridSize - 2) {
//                     // Randomly choose between grass and trees based on treeDensity
//                     const isDominant = islandSize >= grassDominanceThreshold;
//                     grid[y][x] = {
//                         collapsed: false,
//                         options: isDominant ? ["grass"] : ["grass", "trees"]
//                     };
//                 }
//             }
//         }
//     }
// }


// Render the entire grid
function renderGrid(showOptionCount = false) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = grid[y][x];

            // Draw the final tile color if collapsed
            if (cell.collapsed) {
                const tileType = cell.options[0]; // Collapsed type
                let isWave = tileType === "water" && activeWaves[y].includes(x);
                if (tileType === "water") {
                    isWave = activeWaves[y].includes(x);
                    // Choose color based on whether the cell is the wave cell
                    ctx.fillStyle = cell.isWave ? tiles.water.colors[1] : tiles.water.colors[0];
                } else {
                    // Use the static color for non-water tiles
                    ctx.fillStyle = tiles[tileType].color;
                }
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
    }
}
const activeWaves = Array(gridSize).fill(null).map(() => []); // Array of arrays for each row
const animationInterval = 200; // Interval in milliseconds for wave movement
const waveSpawnProbability = 0.1; // Probability of spawning a new wave per row per interval

function animateWave() {
    // Move existing waves and spawn new ones
    for (let y = 0; y < gridSize; y++) {
        // Move each wave on the current row
        for (let i = 0; i < activeWaves[y].length; i++) {
            // Advance each wave one cell to the right
            activeWaves[y][i] += 1;

            // Wrap around if the wave reaches the end of the row
            if (activeWaves[y][i] >= gridSize) {
                activeWaves[y][i] = 0;
            }
        }

        // Randomly spawn a new wave on this row
        if (Math.random() < waveSpawnProbability) {
            activeWaves[y].push(0); // Start new wave at the beginning of the row
        }
    }

    // Render the grid with the updated wave positions
    renderGrid();
}

// Start the animation loop for wave movement
setInterval(animateWave, animationInterval);


function startAnimation() {
    renderGrid(); // Render the static map first
    animate(); // Start the wave animation on water cells
}

// document.getElementById("toggleGridButton").addEventListener("click", () => {
//     showGrid = !showGrid;
//     renderGrid(); // Re-render to apply grid change
// });

document.getElementById("treeDensitySlider").addEventListener("input", function () {
    document.getElementById("treeDensityValue").textContent = this.value + "%";
});

document.getElementById("potatoFactorSlider").addEventListener("input", function () {
    document.getElementById("potatoFactorValue").textContent = this.value + "%";
});


function sendHeight() {
    const height = document.documentElement.scrollHeight - 200;
    window.parent.postMessage({ iframeId: 'iframewfc', height, width: 400 }, '*');
}

// Send the height on load and when the window resizes
window.onload = sendHeight;
// window.onresize = sendHeight;