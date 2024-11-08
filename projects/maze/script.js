// Define the maze grid (10x10 example)
const maze = [
    ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', ' ', ' ', ' ', '#', ' ', ' ', ' ', ' ', '#'],
    ['#', ' ', '#', ' ', '#', ' ', '#', '#', ' ', '#'],
    ['#', ' ', '#', ' ', ' ', ' ', ' ', '#', ' ', '#'],
    ['#', ' ', '#', '#', '#', '#', ' ', '#', ' ', '#'],
    ['#', ' ', ' ', ' ', '#', ' ', ' ', ' ', ' ', '#'],
    ['#', '#', '#', ' ', '#', '#', '#', '#', ' ', '#'],
    ['#', ' ', ' ', ' ', ' ', ' ', ' ', '#', ' ', '#'],
    ['#', ' ', '#', '#', '#', '#', ' ', '#', ' ', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
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
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  
  // Raycasting settings
  const FOV = Math.PI / 4; // Field of view (45 degrees)
  const numRays = 100; // Number of rays casted
  const maxDepth = 10; // Max depth of vision
  
  // Render maze and player view on canvas
  function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    // Render the 3D view from player perspective
    render3DView();
  }
  
  // Raycasting function
  function castRay(angle) {
    let x = player.x;
    let y = player.y;
    let depth = 0;
  
    // Step sizes for each ray, based on the angle
    const dx = Math.cos(angle) * 0.1;
    const dy = Math.sin(angle) * 0.1;
  
    // Move the ray forward until it hits a wall or exceeds max depth
    while (depth < maxDepth) {
      // Update ray position
      x += dx;
      y += dy;
      depth += 0.1;
  
      // Check if the ray is outside bounds
      if (x < 0 || x >= maze[0].length || y < 0 || y >= maze.length) {
        return maxDepth;
      }
  
      // Check if the ray hits a wall
      if (maze[Math.floor(y)][Math.floor(x)] === '#') {
        return depth;
      }
    }
    return maxDepth; // Max depth if no wall hit
  }
  
  // Render the 3D view using raycasting
  function render3DView() {
    for (let i = 0; i < numRays; i++) {
      // Calculate the angle for each ray within the field of view
      const rayAngle = player.direction - FOV / 2 + (i / numRays) * FOV;
      
      // Cast the ray and get the distance to the wall
      const distance = castRay(rayAngle);
      
      // Calculate wall height based on distance (simple perspective)
      const wallHeight = (1 / distance) * canvasHeight;
      
      // Calculate color based on distance for a shading effect
      const color = `rgb(${255 - distance * 25}, ${255 - distance * 25}, ${255 - distance * 25})`;
  
      // Draw the wall slice for each ray
      ctx.fillStyle = color;
      ctx.fillRect(i * (canvasWidth / numRays), (canvasHeight - wallHeight) / 2, canvasWidth / numRays, wallHeight);
    }
  }
  
  // Movement function that moves player if not blocked
  function movePlayer(dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;
    if (maze[Math.floor(newY)][Math.floor(newX)] === ' ') { // Check if the new position is an open space
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
  });
  
  // Initial render to display starting view
  render();
  