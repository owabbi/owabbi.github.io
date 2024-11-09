// Define the maze grid (10x10 example)
const maze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Light sources
const lightSources = [
    { x: 5, y: 5, range: 5, intensity: 1.5 }, // Example light source in the center of the map
    { x: 8, y: 2, range: 3, intensity: 1.2 }  // Another light source
];


// Player starting position and direction
const player = {
    x: 1,   // Initial position on the grid
    y: 1,   // Initial position on the grid
    direction: 0 // Direction in radians (0 is north/up, Math.PI/2 is east/right, Math.PI is south/down, 3*Math.PI/2 is west/left)
};

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridElement = document.getElementById("editorGrid");
const gridctx = gridElement.getContext('2d');
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Raycasting settings
const FOV = Math.PI / 4; // Field of view (45 degrees)
const numRays = 100; // Number of rays casted
const maxDepth = 10; // Max depth of vision

//Grid parameters
const gridSize = 10; //20x20
const tileSize = 10;

grid = [];

function createEmptyGrid() {
    grid = Array.from({ length: gridSize }, () =>
        Array.from({ length: gridSize }, () => ({
            value: 0,
        }))
    );
}

function updateGrid() {
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            grid[x][y] = maze[x][y];
        }
    }
}

createEmptyGrid();

updateGrid();

// Render maze and player view on canvas
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    // Render the 3D view from player perspective
    render3DView();
}

function renderGrid() {
    gridctx.clearRect(0, 0, gridElement.width, gridElement.height);
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (maze[y][x] === 1) {
                gridctx.fillStyle = "red";
                gridctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
            }
        }
    }

    //Draw player position
    gridctx.fillStyle = "black";
    gridctx.fillRect(player.x * tileSize , player.y * tileSize, 1, 1);

    //Draw player vision
    gridctx.fillStyle = "navy";
    gridctx.beginPath();
    gridctx.moveTo(player.x * tileSize, player.y * tileSize);
    gridctx.lineTo((player.x + Math.cos(player.direction)) * tileSize , (player.y+ Math.sin(player.direction)) * tileSize);
    gridctx.stroke();
}

renderGrid();

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
            return { distance: maxDepth, brightness: 0 };
        }

        if (maze[Math.floor(y)][Math.floor(x)] === 1) {
            // Calculate brightness based on light sources
            let brightness = 0;
            for (const light of lightSources) {
                const distToLight = Math.sqrt((x - light.x) ** 2 + (y - light.y) ** 2);
                if (distToLight < light.range) {
                    // Inverse-square law for light falloff
                    brightness += light.intensity / (distToLight * distToLight);
                }
            }
            brightness = Math.min(brightness, 1); // Cap brightness at 1
            return { distance: depth, brightness: brightness };
        }
    }

    return { distance: maxDepth, brightness: 0 }; // No wall hit; in the dark
}

// Render the 3D view using raycasting
function render3DView() {
    for (let i = 0; i < numRays; i++) {
        const rayAngle = player.direction - FOV / 2 + (i / numRays) * FOV;
        
        // Cast the ray and get the distance and brightness to the wall
        const { distance, brightness } = castRay(rayAngle);

        // Calculate wall height based on distance (simple perspective)
        const wallHeight = (1 / distance) * canvasHeight;

        // Calculate wall color based on brightness (closer to black for darker areas)
        const baseColor = 200; // Base color level for walls
        const colorValue = Math.floor(baseColor * brightness); // Adjust color based on brightness
        const color = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;

        const ceilingColor = `rgb(${150 * brightness}, ${180 * brightness}, ${255 * brightness})`; // Sky-blue ceiling
        const floorColor = `rgb(${100 * brightness}, ${50 * brightness}, ${0 * brightness})`; // Brownish floor

        // Draw the wall slice for each ray
        ctx.fillStyle = color;
        ctx.fillRect(i * (canvasWidth / numRays), (canvasHeight - wallHeight) / 2, canvasWidth / numRays, wallHeight);

        // Draw the ceiling
        ctx.fillStyle = "darkblue";
        ctx.fillRect(i * (canvasWidth / numRays), 0, canvasWidth / numRays, (canvasHeight - wallHeight) / 2);

        // Draw the floor
        ctx.fillStyle = "darkgreen";
        ctx.fillRect(i * (canvasWidth / numRays), (canvasHeight + wallHeight) / 2, canvasWidth / numRays, canvasHeight);
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
    render(); // Re-render on each movement
    renderGrid();
});

// Initial render to display starting view
render();
