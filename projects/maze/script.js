// Define the maze Map (10x10 example)
const maze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 2, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Slope data indicating height and direction
const slopeData = {
    '3': { direction: 'x', height: 0.5 }, // Slope increases along the x-axis with a height increase of 0.5
};

// Light sources
const lightSources = [
    { x: 5, y: 5, range: 5, intensity: 1.5 }, // Example light source in the center of the map
    { x: 8, y: 2, range: 3, intensity: 1.2 }  // Another light source
];


// Player starting position and direction
const player = {
    x: 1,   // Initial position on the Map
    y: 1,   // Initial position on the Map
    direction: 0 // Direction in radians (0 is north/up, Math.PI/2 is east/right, Math.PI is south/down, 3*Math.PI/2 is west/left)
};

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const MapElement = document.getElementById("editorMap");
const Mapctx = MapElement.getContext('2d');
const editorCanvas = document.getElementById('editorGrid');
const editorctx = editorCanvas.getContext('2d');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Raycasting settings
const FOV = Math.PI / 4; // Field of view (45 degrees)
const numRays = 100; // Number of rays casted
const maxDepth = 10; // Max depth of vision

//Map parameters
const MapSize = 10; //20x20
const maptileSize = 10;

const editorTileSize = 20;

EditorGrid = [];

function createEmptyGrid() {
    EditorGrid = Array.from({ length: MapSize }, () => Array(MapSize).fill(0));
}

function InitialEditor() {
    for (let y = 0; y < MapSize; y++) {
        for (let x = 0; x < MapSize; x++) {
            EditorGrid[y][x] = maze[y][x];
        }
    }
    EditorGrid[Math.floor(player.y)][Math.floor(player.x)] = "P";
}

function updateEditor() {
    for (let y = 0; y < MapSize; y++) {
        for (let x = 0; x < MapSize; x++) {
            if (EditorGrid[y][x] === "P") {
                EditorGrid[y][x] = 0;
            }
        }
    }
    EditorGrid[Math.floor(player.y)][Math.floor(player.x)] = "P";
}

function updateMaze() {
    for (let y = 0; y < MapSize; y++) {
        for (let x = 0; x < MapSize; x++) {
            maze[y][x] = EditorGrid[y][x] === "P" ? 0 : EditorGrid[y][x];
        }
    }
}

createEmptyGrid();

InitialEditor();

// Render maze and player view on canvas
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    // Render the 3D view from player perspective
    render3DView();
    renderMap();
    renderEditor();
}

function renderMap() {
    Mapctx.clearRect(0, 0, MapElement.width, MapElement.height);
    for (let y = 0; y < MapSize; y++) {
        for (let x = 0; x < MapSize; x++) {

            let brightness = 0;
            for (const light of lightSources) {
                const distToLight = Math.sqrt((x - light.x) ** 2 + (y - light.y) ** 2);
                if (distToLight < light.range) {
                    brightness += light.intensity / (distToLight * distToLight);
                }
            }
            brightness = Math.min(brightness, 1); // Cap brightness at 1

            // Set the tile color based on brightness (yellow gradient)
            const colorValue = Math.floor(255 * brightness);
            Mapctx.fillStyle = `rgba(255, 255, 0, ${brightness})`; // Adjust alpha based on brightness

            // Draw the tile with light gradient effect
            Mapctx.fillRect(x * maptileSize, y * maptileSize, maptileSize, maptileSize);

            
            if (maze[y][x] === 1) {
                Mapctx.fillStyle = "grey";
                Mapctx.fillRect(x * maptileSize, y * maptileSize, maptileSize, maptileSize)
            }
        }
    }

    //Draw player position
    Mapctx.fillStyle = "black";
    Mapctx.fillRect(player.x * maptileSize, player.y * maptileSize, 1, 1);

    //Draw player vision
    Mapctx.fillStyle = "blue";
    Mapctx.beginPath();
    Mapctx.moveTo(player.x * maptileSize, player.y * maptileSize);
    Mapctx.lineTo((player.x + Math.cos(player.direction + Math.PI / 8)) * maptileSize, (player.y + Math.sin(player.direction + Math.PI / 8)) * maptileSize);
    Mapctx.stroke();
    Mapctx.moveTo(player.x * maptileSize, player.y * maptileSize);
    Mapctx.lineTo((player.x + Math.cos(player.direction - Math.PI / 8)) * maptileSize, (player.y + Math.sin(player.direction - Math.PI / 8)) * maptileSize);
    Mapctx.stroke();
}

function renderEditor() {
    editorctx.clearRect(0, 0, editorCanvas.width, editorCanvas.height);
    for (let y = 0; y < MapSize; y++) {
        for (let x = 0; x < MapSize; x++) {
            if (EditorGrid[y][x] === 1) {
                editorctx.fillStyle = "grey";
            } else if (EditorGrid[y][x] === "P") {
                editorctx.fillStyle = "blue";
            } else {
                editorctx.fillStyle = "white";
            }
            editorctx.fillRect(x * editorTileSize, y * editorTileSize, editorTileSize, editorTileSize);
        }
    }
    // Draw grid lines
    editorctx.strokeStyle = "black";
    for (let y = 0; y <= MapSize; y++) {
        editorctx.beginPath();
        editorctx.moveTo(0, y * editorTileSize);
        editorctx.lineTo(MapSize * editorTileSize, y * editorTileSize);
        editorctx.stroke();
    }
    for (let x = 0; x <= MapSize; x++) {
        editorctx.beginPath();
        editorctx.moveTo(x * editorTileSize, 0);
        editorctx.lineTo(x * editorTileSize, MapSize * editorTileSize);
        editorctx.stroke();
    }
}

renderMap();

// Raycasting function
function castRay(angle) {
    let x = player.x;
    let y = player.y;
    let depth = 0;

    const dx = Math.cos(angle) * 0.1;
    const dy = Math.sin(angle) * 0.1;

    while (depth < maxDepth) {
        x += dx;
        y += dy;
        depth += 0.1;

        if (x < 0 || x >= maze[0].length || y < 0 || y >= maze.length) {
            return { distance: maxDepth, brightness: 0, type: 0 };
        }

        const tile = maze[Math.floor(y)][Math.floor(x)];
        if (tile === 1 || tile === 2) { // Check for full or half wall
            let brightness = 0;
            for (const light of lightSources) {
                const distToLight = Math.sqrt((x - light.x) ** 2 + (y - light.y) ** 2);
                if (distToLight < light.range) {
                    brightness += light.intensity / (distToLight * distToLight);
                }
            }
            brightness = Math.min(brightness, 1);
            return { distance: depth, brightness: brightness, type: tile }; // Return type for wall (1 for full, 2 for half)
        }
    }

    return { distance: maxDepth, brightness: 0, type: 0 };
}

function render3DView() {
    for (let i = 0; i < numRays; i++) {
        const rayAngle = player.direction - FOV / 2 + (i / numRays) * FOV;

        // Cast the ray and get distance, brightness, and wall type
        const { distance, brightness, type } = castRay(rayAngle);

        // Determine wall height based on distance and wall type
        const fullWallHeight = (1 / distance) * canvasHeight;
        const wallHeight = type === 2 ? fullWallHeight * 0.5 : fullWallHeight; // Half height for half walls

        // Set color based on wall type: red for half walls for debugging
        let color;
        if (type === 2) {
            color = "red"; // Red for half walls
        } else {
            const baseColor = 200;
            const colorValue = Math.floor(baseColor * brightness);
            color = `rgb(${colorValue}, ${colorValue}, ${colorValue})`; // Grayscale for regular walls
        }

        ctx.fillStyle = color;

        // Draw the wall slice:
        // - Full walls are centered vertically.
        // - Half walls start from the floor and go halfway up.
        const yPosition = type === 2
            ? (canvasHeight + fullWallHeight / 2) / 2  // Anchor half walls to the floor
            : (canvasHeight - wallHeight) / 2;         // Center full walls vertically

        ctx.fillRect(i * (canvasWidth / numRays), yPosition, canvasWidth / numRays, wallHeight);

        ctx.fillStyle = "darkblue";
        ctx.fillRect(i * (canvasWidth / numRays), 0, canvasWidth / numRays, yPosition);

        ctx.fillStyle = "darkgreen";
        ctx.fillRect(i * (canvasWidth / numRays), yPosition + wallHeight, canvasWidth / numRays, canvasHeight - (yPosition + wallHeight));
    }
}




// Movement function that moves player if not blocked
function movePlayer(dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;
    if (maze[Math.floor(newY)][Math.floor(newX)] === 0) { // Check if the new position is an open space
        player.x = newX;
        player.y = newY;
    }
}

function updatePlayerPosition(newX, newY) {
    // Clear the old player position
    if (player.x >= 0 && player.x < MapSize && player.y >= 0 && player.y < MapSize) {
        EditorGrid[player.y][player.x] = 0; // Set the previous position to empty
    }

    // Set new player position
    player.x = newX;
    player.y = newY;

    // Update grid with the player's new position
    if (player.x >= 0 && player.x < MapSize && player.y >= 0 && player.y < MapSize) {
        EditorGrid[player.y][player.x] = "P";
    }

    // Re-render editor to reflect the player's new position
    renderEditor();
}


// Update player direction and render on keypress
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w': case 'z': // Move forward
            movePlayer(Math.cos(player.direction) * 0.1, Math.sin(player.direction) * 0.1);
            break;
        case 's': // Move backward
            movePlayer(-Math.cos(player.direction) * 0.1, -Math.sin(player.direction) * 0.1);
            break;
        case 'a': case 'q': // Rotate left
            player.direction -= 0.1;
            break;
        case 'd': // Rotate right
            player.direction += 0.1;
            break;
    }
    updateEditor();
    render(); // Re-render on each movement
});

// Initial render to display starting view
render();

renderEditor();


// Add click event listener to the editor canvas
editorCanvas.addEventListener('click', function (event) {
    // Get the mouse position relative to the canvas
    const rect = editorCanvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Calculate the tile coordinates based on tile size
    const tileX = Math.floor(mouseX / editorTileSize);
    const tileY = Math.floor(mouseY / editorTileSize);

    if (EditorGrid[tileY][tileX] === "P") {
        return;
    }

    // Toggle the tile state in the EditorGrid
    if (tileX >= 0 && tileX < MapSize && tileY >= 0 && tileY < MapSize) {
        EditorGrid[tileY][tileX] = EditorGrid[tileY][tileX] === 1 ? 0 : 1;  // Toggle between 1 and 0

        // Re-render the editor to show the updated grid
        updateMaze();
        render();
    }
});
