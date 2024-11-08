let showGrid = false;
// Define tiles and constraints
const tiles = {
  water: { color: "#0077cc", neighbors: ["water", "sand", "rocks"] },
  sand: { color: "#ffe680", neighbors: ["sand", "water", "grass"] },
  grass: { color: "#66ff66", neighbors: ["grass", "sand", "trees", "rocks"] },
  trees: { color: "#006600", neighbors: ["trees", "grass", "rocks"] },
  rocks: {
    color: "#808080",
    neighbors: ["water", "sand", "grass", "trees", "rocks"],
  },
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
      options: Object.keys(tiles), // All possible options set initially
    }))
  );
}

const canvas = document.getElementById("islandCanvas");
const elevationCanvas = document.getElementById("elevationCanvas");
const ctx = canvas.getContext("2d");
const elevationCtx = elevationCanvas.getContext("2d");
// const waterAnimationCanvas = document.getElementById("waterAnimationCanvas");
// const waterCtx = waterAnimationCanvas.getContext("2d");

let collapseQueue = []; // Queue to store cells to collapse
let autoCollapse = false; // Flag for "Skip All" mode

function applyPreferences() {
    const sliderElement = document.getElementById("islandSize");
    const islandSize = parseInt(sliderElement.value, 10);
  
    const treeDensitySlider = document.getElementById("treeDensitySlider");
    const treeDensity = parseInt(treeDensitySlider.value, 10) / 100;
  
    if (isNaN(islandSize)) {
      console.error("Invalid islandSize from slider. Using default of 3.");
      return;
    }
  
    // Set water borders
    for (let x = 0; x < gridSize; x++) {
      grid[0][x].options = ["water"];
      grid[gridSize - 1][x].options = ["water"];
      grid[x][0].options = ["water"];
      grid[x][gridSize - 1].options = ["water"];
    }
  
    // Set core island area with Perlin noise for irregular shape
    const centerX = Math.floor(gridSize / 2);
    const centerY = Math.floor(gridSize / 2);
  
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
  
        // Calculate Perlin noise for this cell
        const noiseValue = noise.perlin2(x * noiseScale, y * noiseScale);
  
        // Modify land threshold with noise influence for irregular edges
        const landThreshold = islandSize + noiseValue * 5; // Adjust `5` for more or less irregularity
  
        if (distance <= landThreshold) {
          // Inside threshold: land cell (trees or grass based on tree density)
          grid[y][x].options =
            Math.random() < treeDensity ? ["trees"] : ["grass"];
        } else {
          // Outside threshold: water or rocks
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
      if (
        cell.options.includes("grass") &&
        Math.random() * 100 < densityValue
      ) {
        cell.options = ["trees"]; // Set cell as tree if within density range
      } else if (
        cell.options.includes("trees") &&
        Math.random() * 100 >= densityValue
      ) {
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
  priorityQueue = priorityQueue.filter((item) => item.x !== x || item.y !== y);

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
    { dx: 1, dy: 0 }, // Right
    { dx: 0, dy: -1 }, // Top
    { dx: 0, dy: 1 }, // Bottom
  ];

  neighbors.forEach(({ dx, dy }) => {
    const nx = x + dx;
    const ny = y + dy;

    if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
      const neighbor = grid[ny][nx];
      if (!neighbor.collapsed) {
        neighbor.options = neighbor.options.filter((opt) =>
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

  initializeGridWithAllOptions(); // Step 1: Empty grid
  applyPreferences(); // Step 3: Apply border and center constraints
  generateMapWithElevation();
  startCollapse();
  renderElevationMap();
  initializeClouds(); // Initialize clouds
  animateWater();
  animateClouds();
}

// Trigger map recreation with a button click
document
  .getElementById("recreateMapButton")
  .addEventListener("click", initializeMap);

// Render the entire grid
function renderGrid(time = 0) {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous frame

  // Draw the land and elevation first
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cell = grid[y][x];
      const tileType = cell.options[0];
      const baseColor = tiles[tileType].color;

      // Apply wave effect for water cells if waves are enabled
      if (tileType === "water" && wavesEnabled) {
        const noiseValue = getNoiseValue(x, y, time);
        ctx.fillStyle = applyNoiseShading(noiseValue); // Animated wave effect
      }
      // Apply elevation shading only for specific land types: grass, rocks, trees
      else if (["grass", "rocks", "trees"].includes(tileType)) {
        const elevationFactor = elevationGrid[y][x].elevation;
        ctx.fillStyle = applyElevationShading(baseColor, elevationFactor);
      }
      // Directly use base color for other tile types (e.g., sand)
      else {
        ctx.fillStyle = baseColor;
      }

      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }

  // Draw clouds last if enabled
  if (cloudsEnabled) {
    renderCloudLayer(time);
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
    isAnimating = false;
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
      const cell = grid[y][x];
      const tileType = cell.options[0];

      // Only apply elevation shading to land tiles
      if (tileType !== "water") {
        const elevationFactor = elevationGrid[y][x].elevation;

        // Map elevation to grayscale for land tiles: black (low) to white (high)
        const grayscaleValue = Math.floor(255 * elevationFactor);
        const color = `rgb(${grayscaleValue},${grayscaleValue},${grayscaleValue})`;

        elevationCtx.fillStyle = color;
        elevationCtx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      } else {
        // Clear any previous elevation on water tiles
        elevationCtx.clearRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }
}

function applyElevationShading(color, elevationFactor) {
  // Parse the base color to RGB values
  let r, g, b;
  if (color.startsWith("#")) {
    const bigint = parseInt(color.slice(1), 16);
    r = (bigint >> 16) & 255;
    g = (bigint >> 8) & 255;
    b = bigint & 255;
  } else {
    const colorMatch = color.match(/\d+/g);
    [r, g, b] = colorMatch.map(Number);
  }

  // Scale the color brightness based on elevation factor (e.g., from 0.8 to 1.2)
  const brightnessAdjustment = 0.2 + elevationFactor * 1.2;
  r = Math.min(255, Math.floor(r * brightnessAdjustment));
  g = Math.min(255, Math.floor(g * brightnessAdjustment));
  b = Math.min(255, Math.floor(b * brightnessAdjustment));

  return `rgb(${r},${g},${b})`;
}

// Function to convert elevation (0 to 1) to a color on a navy-to-red gradient
function elevationToColor(elevation) {
  const red = Math.min(255, Math.floor(255 * elevation));
  const green = Math.min(255, Math.floor(128 * elevation)); // Mid-range intensity for smoother gradient
  const blue = Math.max(0, Math.floor(255 * (1 - elevation))); // Darker for lower elevations
  return `rgb(${red},${green},${blue})`;
}

function renderGrid(time = 0) {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous frame

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cell = grid[y][x];
      const tileType = cell.options[0];
      const baseColor = tiles[tileType].color;

      // Apply wave effect for water cells if waves are enabled
      if (tileType === "water" && wavesEnabled) {
        const noiseValue = getNoiseValue(x, y, time);
        ctx.fillStyle = applyNoiseShading(noiseValue); // Animated wave effect
      }
      // Apply elevation shading only for specific land types: grass, rocks, trees
      else if (["grass", "rocks", "trees"].includes(tileType)) {
        const elevationFactor = elevationGrid[y][x].elevation;
        ctx.fillStyle = applyElevationShading(baseColor, elevationFactor);
      }
      // Directly use base color for other tile types (e.g., sand)
      else {
        ctx.fillStyle = baseColor;
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
    renderGrid(); // Draw primary map on the main canvas
    renderElevationMap(); // Draw grayscale elevation map on the elevation canvas
    blendToElevationCanvas(); // Blend and display on elevation canvas
  } else {
    renderElevationMap(); // Show only the elevation map on elevationCanvas
  }
}

function blendToElevationCanvas() {
  const primaryImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const elevationImageData = elevationCtx.getImageData(
    0,
    0,
    elevationCanvas.width,
    elevationCanvas.height
  );
  const blendedImageData = elevationCtx.createImageData(
    elevationCanvas.width,
    elevationCanvas.height
  );

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
function getNoiseValue(x, y, time, directionX = 1, directionY = 1) {
  const frequency = 0.1; // Scale of the waves
  const amplitude = 0.5; // Intensity of brightness changes
  return (
    amplitude *
    noise.perlin2(
      (x + directionX * time) * frequency,
      (y + directionY * time) * frequency
    )
  );
}

// Adjust color brightness based on noise, blending toward white for a lighter effect
function applyNoiseShading(noiseValue) {
  const baseColor = [0, 119, 204]; // Darker blue (#0077cc)
  const waveColor = [0, 170, 255]; // Lighter blue (#00aaff)

  // Calculate intermediate color based on noise value
  const r = Math.floor(
    baseColor[0] + (waveColor[0] - baseColor[0]) * noiseValue
  );
  const g = Math.floor(
    baseColor[1] + (waveColor[1] - baseColor[1]) * noiseValue
  );
  const b = Math.floor(
    baseColor[2] + (waveColor[2] - baseColor[2]) * noiseValue
  );

  return `rgb(${r},${g},${b})`;
}

let time = 0;
let waveDirection = { x: 1, y: 0 }; // Initial direction (e.g., rightward)
let waveAnimationFrameId; // To store the animation frame ID for stopping animation
let isAnimating = false;

function updateWaveDirection() {
  // Randomly select a new direction
  const directions = [
    { x: 1, y: 0 }, // Right
    { x: -1, y: 0 }, // Left
    { x: 0, y: 1 }, // Down
    { x: 0, y: -1 }, // Up
    { x: 1, y: 1 }, // Down-right diagonal
    { x: -1, y: 1 }, // Down-left diagonal
    { x: 1, y: -1 }, // Up-right diagonal
    { x: -1, y: -1 }, // Up-left diagonal
  ];
  waveDirection = directions[Math.floor(Math.random() * directions.length)];
}

// Change direction every few seconds
setInterval(updateWaveDirection, 3000); // Adjust interval as needed

function animateWater() {
  // Only start the animation if it's not already running
  if (!isAnimating) {
    isAnimating = true;
    // Use requestAnimationFrame to keep the animation running smoothly
    function animationStep() {
      renderGrid(time); // Render the grid with the animated water effect
      time += 0.04; // Increase time to control wave speed

      if (wavesEnabled) {
        waveAnimationFrameId = requestAnimationFrame(animationStep); // Continue if waves are enabled
      } else {
        cancelAnimationFrame(waveAnimationFrameId); // Stop if waves are disabled
        isAnimating = false; // Reset animation state
      }
    }

    animationStep(); // Start the animation loop
  }
}

/////////////////// Clouds

let cloudOpacity = 0.5; // Default cloud opacity

document
  .getElementById("cloudOpacitySlider")
  .addEventListener("input", (event) => {
    cloudOpacity = parseFloat(event.target.value); // Update opacity value
    console.log(cloudOpacity);
    renderCloudLayer(cloudTime); // Rerender clouds with new opacity
  });

// Cloud rendering as a separimate layer on top
function renderCloudLayer(te) {
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cloudValue = generateCloudNoise(x, y, time);

      // Only render clouds in the highest regions of the noise
      if (cloudValue > 0.7) {
        // Adjust for sparse clouds
        const alpha = cloudOpacity * (cloudValue - 0.7) * 3.3; // Adjust for opacity control
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(alpha, 1)})`;
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }
}

let cloudDirection = 1; // 1 for left-to-right, -1 for right-to-left

function generateCloudNoise(x, y) {
  const frequency = 0.04; // Fixed frequency for scale
  const rawNoiseValue = noise.perlin2(
    x * frequency + cloudTime * cloudDirection,
    y * frequency
  ); // Apply `cloudTime` to x for horizontal movement
  return (rawNoiseValue + 1) / 2; // Scale to [0, 1]
}

let cloudTime = 0;
let cloudSpeedMultiplier = 0.0005; // Adjust for much slower speed

function animateClouds() {
  renderCloudLayer(cloudTime); // Render the cloud layer independently
  cloudTime += cloudSpeedMultiplier; // Use multiplier for more controlled increment

  requestAnimationFrame(animateClouds); // Loop the cloud animation
}

// Initialize clouds with random direction on map recreation
function initializeClouds() {
  cloudDirection = Math.random() > 0.5 ? 1 : -1; // Randomly choose left or right
  cloudTime = 0; // Reset time to start cloud animation from the beginning
}

//////////////////////////////////////////

document
  .getElementById("treeDensitySlider")
  .addEventListener("input", function (event) {
    const densityValue = event.target.value;

    // Use the density value to adjust tree density in your grid
    updateTreeDensity(densityValue); // Placeholder for the logic that uses tree density
  });

let debugAnimationFrameId;
let selectedMode = "elevation"; // Default mode

// Listen for changes on the display mode radio inputs
document.querySelectorAll('input[name="displayMode"]').forEach((radio) => {
  radio.addEventListener("change", (event) => {
    selectedMode = event.target.value;
    updateDebugDisplay(selectedMode);
  });
});

// Function to update the debug view based on the selected mode
function updateDebugDisplay(mode) {
  // Clear previous animation frame
  cancelAnimationFrame(debugAnimationFrameId);

  switch (mode) {
    case "elevation":
      renderElevationMap(); // Static elevation view
      break;
    case "waves":
      animateWaveDebugView(); // Animated waves
      break;
    case "clouds":
      animateCloudDebugView(); // Animated clouds
      break;
    default:
      console.error("Unknown display mode:", mode);
  }
}

// Function to animate waves on elevationCanvas
function animateWaveDebugView(time = 0) {
  elevationCtx.clearRect(0, 0, elevationCanvas.width, elevationCanvas.height);

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const noiseValue = getNoiseValue(x, y, time); // Same noise function as main screen
      const shade = Math.floor(255 * (0.5 + 0.5 * noiseValue)); // Normalize to [0, 255]
      elevationCtx.fillStyle = `rgb(${shade}, ${shade}, 255)`; // Blueish wave effect
      elevationCtx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }

  debugAnimationFrameId = requestAnimationFrame(() =>
    animateWaveDebugView(time + 0.04)
  ); // Keep animating
}

// Function to animate clouds on elevationCanvas
function animateCloudDebugView(time = 0) {
  elevationCtx.clearRect(0, 0, elevationCanvas.width, elevationCanvas.height);

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cloudValue = generateCloudNoise(x, y + time); // Same cloud noise function as main screen
      const shade = Math.floor(128 + 127 * cloudValue); // Gray scale from light to dark
      elevationCtx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`; // Shades of gray for clouds
      elevationCtx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }

  debugAnimationFrameId = requestAnimationFrame(() =>
    animateCloudDebugView(time + 0.0015)
  ); // Keep animating
}

// Function to render wave debug information on elevationCanvas
function renderWaveDebugView() {
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      // Get wave noise value for this tile (assuming getNoiseValue is defined)
      const noiseValue = getNoiseValue(x, y, time);
      const shade = Math.floor(255 * (0.5 + 0.5 * noiseValue)); // Normalize to [0, 255]
      elevationCtx.fillStyle = `rgb(${shade}, ${shade}, 255)`; // Blueish shade for waves
      elevationCtx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }
}

// Function to render cloud debug information on elevationCanvas
function renderCloudDebugView() {
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cloudValue = generateCloudNoise(x, y); // Assuming this function exists
      const shade = Math.floor(255 * cloudValue); // Normalize to [0, 255]
      elevationCtx.fillStyle = `rgba(255, 255, 255, ${cloudValue})`; // White clouds with transparency
      elevationCtx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }
}

function sendHeight() {
  const height = document.documentElement.scrollHeight - 200;
  window.parent.postMessage({ iframeId: "iframewfc", height, width: 400 }, "*");
}

// Send the height on load and when the window resizes
window.onload = sendHeight;
// window.onresize = sendHeight;
