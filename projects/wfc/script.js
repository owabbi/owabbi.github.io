console.log("test test test A");

let showGrid = false;
// Define tiles and constraints
const tiles = {
    water: { color: "#00aaff", neighbors: ["water", "sand"] },
    sand: { color: "#ffe680", neighbors: ["sand", "water", "grass"] },
    grass: { color: "#66ff66", neighbors: ["grass", "sand", "trees", "rocks"] },
    trees: { color: "#006600", neighbors: ["trees", "grass", "rocks"] },
    rocks: { color: "#808080", neighbors: ["water", "sand", "grass", "trees", "rocks"], },
    debug: { color: "#000000", neighbors: [] } // Rocks can be next to anything
};

// Grid settings
const gridSize = 20; // 20x20 grid
const tileSize = 20; // 20 pixels per tile
grid = [];

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
    // Water borders
    for (let x = 0; x < gridSize; x++) {
        if (grid[0][x]) grid[0][x].options = ["water"];
        if (grid[gridSize - 1][x]) grid[gridSize - 1][x].options = ["water"];
        if (grid[x][0]) grid[x][0].options = ["water"];
        if (grid[x][gridSize - 1]) grid[x][gridSize - 1].options = ["water"];
    }

    // Center island area
    const centerX = Math.floor(gridSize / 2);
    const centerY = Math.floor(gridSize / 2);
    const islandRadius = Math.min(islandSize, Math.floor(gridSize / 2) - 2);

    for (let dy = -islandRadius; dy <= islandRadius; dy++) {
        for (let dx = -islandRadius; dx <= islandRadius; dx++) {
            const x = centerX + dx;
            const y = centerY + dy;
            if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
                grid[y][x].options = ["grass", "trees"];
            }
        }
    }
}


function findCellWithFewestOptions() {
    let minOptions = Infinity;
    let cellToCollapse = null;

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = grid[y][x];
            if (!cell.collapsed && cell.options.length < minOptions) {
                minOptions = cell.options.length;
                cellToCollapse = { x, y };
            }
        }
    }

    return cellToCollapse;
}

function collapseCell(x, y) {
    const cell = grid[y][x];
    if (cell.collapsed || cell.options.length === 0) return;

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
            }
        }
    });
}

function startCollapse() {
    let cell;
    while ((cell = findCellWithFewestOptions()) !== null) {
        collapseCell(cell.x, cell.y);
    }
    renderGrid(); // Display the completed map
}

function initializeMap() {
    initializeGridWithAllOptions();        // Step 1: Empty grid
    applyPreferences();           // Step 3: Apply border and center constraints
    startCollapse();              // Step 6: Collapse cells until done
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

// // Collapse a cell to a specific tile
// function collapseCell(x, y) {
//     // if (cell.options.length === 0) {
//     //     console.warn("No options available for cell. Defaulting to 'rocks'.");
//     //     cell.options = ["rocks"]; // Default to "rocks" if no other options are available
//     // }
//     // const choice = cell.options[Math.floor(Math.random() * cell.options.length)];
//     // cell.collapsed = true;
//     // cell.options = [choice];
//     // return choice;
//     const cell = grid[y][x];
//     if (cell.collapsed || cell.options.length === 0) return; // Skip if already collapsed or no options left

//     // Randomly select one option from remaining options
//     const choice = cell.options[Math.floor(Math.random() * cell.options.length)];
//     cell.collapsed = true;
//     cell.options = [choice]; // Collapse to a single choice

//     propagate(x, y, choice); // Propagate constraints based on this choice
// }

// // Propagate constraints to neighboring cells
// function propagate(x, y, collapsedType) {
//     // const cell = grid[y][x];
//     // if (!cell.collapsed) return;

//     // const tile = cell.options[0];
//     // const neighbors = [
//     //     [x - 1, y], [x + 1, y], // left, right
//     //     [x, y - 1], [x, y + 1]  // top, bottom
//     // ];

//     // neighbors.forEach(([nx, ny]) => {
//     //     if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
//     //         const neighbor = grid[ny][nx];
//     //         if (!neighbor.collapsed && tiles[tile]) {  // Check if tile exists in tiles object
//     //             neighbor.options = neighbor.options.filter(opt => tiles[tile].neighbors.includes(opt));
//     //             if (neighbor.options.length === 1) {
//     //                 collapseQueue.push([nx, ny]);
//     //             }
//     //         }
//     //     }
//     // });
//     if (!collapsedType || !tiles[collapsedType]) {
//         console.error(`Tile type ${collapsedType} is not defined in tiles`);
//         return; // Exit if collapsedType is undefined
//     }

//     const neighbors = [
//         { dx: -1, dy: 0 }, // Left
//         { dx: 1, dy: 0 },  // Right
//         { dx: 0, dy: -1 }, // Top
//         { dx: 0, dy: 1 }   // Bottom
//     ];

//     neighbors.forEach(({ dx, dy }) => {
//         const nx = x + dx;
//         const ny = y + dy;

//         if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
//             const neighbor = grid[ny][nx];
//             if (!neighbor.collapsed) {
//                 // Filter options based on the current tile's neighbors if available
//                 neighbor.options = neighbor.options.filter(opt =>
//                     tiles[collapsedType]?.neighbors.includes(opt)
//                 );

//                 // If only one option remains, collapse the neighbor as well
//                 if (neighbor.options.length === 1) {
//                     collapseCell(nx, ny);
//                 }
//             }
//         }
//     });
// }

// function startCollapse() {
//     const startX = Math.floor(gridSize / 2);
//     const startY = Math.floor(gridSize / 2);
//     collapseCell(startX, startY); // Start collapsing from the center
// }


// Collapse the entire grid in one go
async function completeCollapse() {
    autoCollapse = true;
    while (grid.some(row => row.some(cell => !cell.collapsed))) {
        await waveFunctionCollapseStep();
    }
    autoCollapse = false;

    //addHalfTiles();
}

// Step-by-step collapse function
async function waveFunctionCollapseStep() {
    if (!grid.some(row => row.some(cell => !cell.collapsed))) return;

    if (collapseQueue.length === 0) {
        let minOptions = Infinity;
        let minPos = null;

        grid.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (!cell.collapsed && cell.options.length < minOptions) {
                    minOptions = cell.options.length;
                    minPos = [x, y];
                }
            });
        });

        if (minPos) collapseQueue.push(minPos);
    }

    if (collapseQueue.length > 0) {
        const [x, y] = collapseQueue.shift();
        collapseCell(x, y);
        propagate(x, y);
        renderGrid();
    }
}

// Render the entire grid
function renderGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = grid[y][x];
            if (cell.collapsed) {
                drawTile(x, y, cell.options[0]);
            }
            if (showGrid) {
                ctx.strokeStyle = "black";
                ctx.lineWidth = 1;
                ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize); // Draw border
            }

        }
    }
}

// Draw a single tile based on its type
function drawTile(x, y, tileType) {
    if (tiles[tileType]) {  // Check if tileType exists in tiles object
        ctx.fillStyle = tiles[tileType].color;
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
}

// Post-process to add half sand-half grass tiles
function addHalfTiles() {
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = grid[y][x];
            const neighborTypes = getNeighborTypes(x, y);
            if (Object.keys(neighborTypes).length == 4 && (neighborTypes["top"] != neighborTypes["bottom"] || neighborTypes["right"] != neighborTypes["left"])) {
                drawHalfTile(x, y, neighborTypes, cell.options[0]);
            }
        }
    }
}

function getNeighborTypes(x, y) {
    const neighbors = [
        { dx: -1, dy: 0, direction: "left" },
        { dx: 1, dy: 0, direction: "right" },
        { dx: 0, dy: -1, direction: "top" },
        { dx: 0, dy: 1, direction: "bottom" }
    ];

    const neighborTypes = {};  // Store types by direction

    for (const { dx, dy, direction } of neighbors) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
            const neighbor = grid[ny][nx];
            if (neighbor.collapsed) {
                neighborTypes[direction] = neighbor.options[0];  // Store neighbor type by direction
            }
        }
    }

    return neighborTypes;
}


// Draw a half sand-half grass tile based on the direction
function drawHalfTile(x, y, neighborTypes, baseColor) {

    if (baseColor === "trees") return;

    if (neighborTypes["top"] != neighborTypes["bottom"]) {
        if (neighborTypes["top"] == baseColor) {
            ctx.fillStyle = tiles[neighborTypes["bottom"]].color;
            ctx.fillRect(x * tileSize, y * tileSize + tileSize / 2, tileSize, tileSize / 2);
        }
        if (neighborTypes["bottom"] == baseColor) {
            ctx.fillStyle = tiles[neighborTypes["top"]].color;
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize / 2);
        }
    }

    if (neighborTypes["left"] != neighborTypes["right"]) {
        if (neighborTypes["right"] == baseColor) {
            ctx.fillStyle = tiles[neighborTypes["left"]].color;
            ctx.fillRect(x * tileSize, y * tileSize, tileSize / 2, tileSize);
        }
        if (neighborTypes["left"] == baseColor) {
            ctx.fillStyle = tiles[neighborTypes["right"]].color;
            ctx.fillRect(x * tileSize + tileSize / 2, y * tileSize, tileSize / 2, tileSize);
        }
    }

    if (showGrid) {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
}

// Utility function to add a delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initial render and setup
function initializeCanvas() {
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    // initializeBorders();
    // renderGrid();
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            grid[x][y] = { collapsed: false, options: Object.keys(tiles) };
        }
    }
    initializeBorders();
}

// Button handler to proceed to the next step
document.getElementById("stepButton").addEventListener("click", waveFunctionCollapseStep);

// Button handler to "Skip All" and complete collapse in one go
document.getElementById("skipAllButton").addEventListener("click", completeCollapse);

document.getElementById("toggleGridButton").addEventListener("click", () => {
    showGrid = !showGrid;
    renderGrid(); // Re-render to apply grid change
});

// document.getElementById("recreateMapButton").addEventListener("click", () => {
//     resetGrid();
//     completeCollapse(); // Regenerate the map
//     renderGrid(); // Display the new map
// });

function resetGrid() {
    // Clear the grid by resetting each cell's state
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            grid[y][x] = { collapsed: false, options: Object.keys(tiles) };
        }
    }

    // Reapply initial setup (e.g., borders and seeded center)
    initializeBorders();
}

// document.getElementById("recreateMapButton").addEventListener("click", () => {
//     const treeDensity = document.getElementById("treeDensity").value;
//     const islandSize = document.getElementById("islandSize").value;

//     resetGrid();
//     initializeBorders(treeDensity, islandSize); // Pass preferences
//     completeCollapse();
//     renderGrid();
// });


// Start the island generation with an initial setup
// initializeCanvas();

// startCollapse();

function sendHeight() {
    const height = document.documentElement.scrollHeight - 200;
    window.parent.postMessage({ iframeId: 'iframewfc', height, width: 400 }, '*');
}

// Send the height on load and when the window resizes
window.onload = sendHeight;
// window.onresize = sendHeight;