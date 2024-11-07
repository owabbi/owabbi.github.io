let showGrid = false;
// Define tiles and constraints
const tiles = {
    water: { color: ["#00aaff"], neighbors: ["water", "sand", "rocks"] },
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
const elevationCanvas = document.getElementById("elevationCanvas");
const ctx = canvas.getContext("2d");
const elevationCtx = elevationCanvas.getContext("2d");
// const waterAnimationCanvas = document.getElementById("waterAnimationCanvas");
// const waterCtx = waterAnimationCanvas.getContext("2d");


let collapseQueue = [];  // Queue to store cells to collapse
let autoCollapse = false; // Flag for "Skip All" mode

function applyPreferences() {
    const sliderElement = document.getElementById("islandSize");
    const islandSize = parseInt(sliderElement.value, 10); // Parse to ensure it's an integer

    const treeDensitySlider = document.getElementById("treeDensitySlider");
    const treeDensity = parseInt(treeDensitySlider.value, 10) / 100; // Convert to decimal

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

function updateTreeDensity(densityValue) {
    // Example logic to place trees based on the new density value
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = grid[y][x];
            if (cell.options.includes("grass") && Math.random() * 100 < densityValue) {
                cell.options = ["trees"]; // Set cell as tree if within density range
            } else if (cell.options.includes("trees") && Math.random() * 100 >= densityValue) {
                cell.options = ["grass"]; // Convert tree to grass if above density range
            }
        }
    }

    // Render the updated grid
    renderGrid();
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
    const randomSeed = Math.floor(Math.random() * 10000); // Adjust range if needed
    noise.seed(randomSeed); // Assuming the Perlin noise library has a seed function

    initializeGridWithAllOptions();        // Step 1: Empty grid
    applyPreferences();           // Step 3: Apply border and center constraints
    generateMapWithElevation();
    startCollapse();
    renderElevationMap();
    animateWater();
}

// Trigger map recreation with a button click
document.getElementById("recreateMapButton").addEventListener("click", initializeMap);


// Render the entire grid
function renderGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous frame

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = grid[y][x];
            const tileType = cell.options[0];

            // Check if this cell is currently a wave based on activeWaves
            // Choose color based on whether the cell is a wave
            ctx.fillStyle = tiles[tileType].color;


            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }
}

/////////////// Animations

let wavesEnabled = true; // Waves are enabled by default
let waveIntervalId; // Stores the interval ID for the wave animation

function toggleWaves() {
    wavesEnabled = !wavesEnabled; // Toggle the wave state

    const button = document.getElementById("toggleWavesButton");
    button.textContent = wavesEnabled ? "Disable Waves" : "Enable Waves"; // Update button text

    if (wavesEnabled) {
        animateWater(); // Start the wave animation on the main grid
    } else {
        cancelAnimationFrame(waveAnimationFrameId); // Stop the wave animation if disabled
        renderGrid(); // Render static grid without animation
    }
}


///////////////////// Elevation map

const elevationGrid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => ({ elevation: 0 }))
);

function generateMapWithElevation() {
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            // Apply Perlin noise to generate elevation
            const elevationValue = noise.simplex2(x * 0.1, y * 0.1); // Adjust 0.1 for different scales
            elevationGrid[y][x].elevation = (elevationValue + 1) / 2; // Normalize to 0-1 range
        }
    }
}

function renderElevationMap() {
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const elevationFactor = elevationGrid[y][x].elevation;

            // Map elevation to grayscale color: black (low) to white (high)
            const grayscaleValue = Math.floor(255 * elevationFactor);
            const color = `rgb(${grayscaleValue},${grayscaleValue},${grayscaleValue})`;

            elevationCtx.fillStyle = color;
            elevationCtx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }
}


// Function to convert elevation (0 to 1) to a color on a navy-to-red gradient
function elevationToColor(elevation) {
    const red = Math.min(255, Math.floor(255 * elevation));
    const green = Math.min(255, Math.floor(128 * elevation)); // Mid-range intensity for smoother gradient
    const blue = Math.max(0, Math.floor(255 * (1 - elevation))); // Darker for lower elevations
    return `rgb(${red},${green},${blue})`;
}

// Render the elevation map on the secondary canvas
function renderGrid(time = 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous frame

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = grid[y][x];
            const tileType = cell.options[0];

            // Apply animated color effect on water cells if waves are enabled
            if (tileType === "water" && wavesEnabled) {
                const baseColor = tiles[tileType].color;
                const noiseValue = getNoiseValue(x, y, time);
                ctx.fillStyle = applyNoiseShading(baseColor, noiseValue);
            } else {
                ctx.fillStyle = tiles[tileType].color; // Regular color for non-water or if waves are off
            }

            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }
}


// Call this after generating the elevation values in the main grid

let isMergeEnabled = false; // Track the merge state

function toggleMerge() {
    isMergeEnabled = !isMergeEnabled;

    if (isMergeEnabled) {
        renderGrid();           // Draw primary map on the main canvas
        renderElevationMap();    // Draw grayscale elevation map on the elevation canvas
        blendToElevationCanvas(); // Blend and display on elevation canvas
    } else {
        renderElevationMap();    // Show only the elevation map on elevationCanvas
    }
}


function blendToElevationCanvas() {
    const primaryImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const elevationImageData = elevationCtx.getImageData(0, 0, elevationCanvas.width, elevationCanvas.height);
    const blendedImageData = elevationCtx.createImageData(elevationCanvas.width, elevationCanvas.height);

    for (let i = 0; i < primaryImageData.data.length; i += 4) {
        // Get RGB values from the primary map
        const r1 = primaryImageData.data[i];
        const g1 = primaryImageData.data[i + 1];
        const b1 = primaryImageData.data[i + 2];

        // Get RGB values from the elevation map
        const r2 = elevationImageData.data[i];
        const g2 = elevationImageData.data[i + 1];
        const b2 = elevationImageData.data[i + 2];

        // Blend colors by averaging each channel
        blendedImageData.data[i] = Math.floor((r1 + r2) / 2);
        blendedImageData.data[i + 1] = Math.floor((g1 + g2) / 2);
        blendedImageData.data[i + 2] = Math.floor((b1 + b2) / 2);
        blendedImageData.data[i + 3] = 255; // Full opacity
    }

    // Draw the blended image back onto the elevation canvas
    elevationCtx.putImageData(blendedImageData, 0, 0);
}

//////////////////////////////// Water movement
function getNoiseValue(x, y, time) {
    const frequency = 0.1; // Controls the scale of the waves
    const amplitude = 0.5; // Controls the intensity of brightness changes
    return amplitude * noise.perlin2(x * frequency, y * frequency + time);
}

function renderWaterAnimation(time) {
    // Clear the canvas each frame to prevent any unwanted artifacts
    waterCtx.clearRect(0, 0, waterAnimationCanvas.width, waterAnimationCanvas.height);

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = grid[y][x];
            const tileType = cell.options[0];

            // Apply noise-based animation effect only on water cells
            if (tileType === "water") {
                const baseColor = tiles.water.color; // Use blue color for water
                const noiseValue = getNoiseValue(x, y, time); // Generate noise for wave effect

                // Adjust color using noise for a subtle wave effect
                const animatedColor = applyNoiseShading(baseColor, noiseValue);

                // Render the animated water cell on the canvas
                waterCtx.fillStyle = animatedColor;
                waterCtx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
    }
}

// Function to adjust color brightness based on noise
// Function to adjust color brightness based on noise
function applyNoiseShading(color, noiseValue) {
    // Ensure color is in string format
    if (Array.isArray(color)) {
        color = color[0]; // Use the first color if it's an array
    }

    // Parse RGB values from color string (e.g., "#00aaff" or "rgb(0, 170, 255)")
    let r, g, b;
    if (color.startsWith('#')) {
        // Convert hex color to RGB
        const bigint = parseInt(color.slice(1), 16);
        r = (bigint >> 16) & 255;
        g = (bigint >> 8) & 255;
        b = bigint & 255;
    } else {
        // Assume color is already in "rgb(r, g, b)" format
        const colorMatch = color.match(/\d+/g);
        [r, g, b] = colorMatch.map(Number);
    }

    // Adjust brightness based on noise value, scaling between 0.7 and 1.3
    const brightnessAdjustment = 0.7 + noiseValue * 0.6; // Adjust range for subtler effect
    r = Math.min(255, Math.floor(r * brightnessAdjustment));
    g = Math.min(255, Math.floor(g * brightnessAdjustment));
    b = Math.min(255, Math.floor(b * brightnessAdjustment));

    return `rgb(${r},${g},${b})`;
}



let time = 0;

let waveAnimationFrameId; // To store the animation frame ID for stopping animation

function animateWater() {
    renderGrid(time); // Render the current frame with water animation if enabled
    time += 0.02; // Increase time to create the moving effect

    if (wavesEnabled) {
        waveAnimationFrameId = requestAnimationFrame(animateWater); // Continue animation if waves are enabled
    }
}


//////////////////////////////////////////

document.getElementById("treeDensitySlider").addEventListener("input", function (event) {
    const densityValue = event.target.value;

    // Use the density value to adjust tree density in your grid
    updateTreeDensity(densityValue); // Placeholder for the logic that uses tree density
});



function sendHeight() {
    const height = document.documentElement.scrollHeight - 200;
    window.parent.postMessage({ iframeId: 'iframewfc', height, width: 400 }, '*');
}

// Send the height on load and when the window resizes
window.onload = sendHeight;
// window.onresize = sendHeight;