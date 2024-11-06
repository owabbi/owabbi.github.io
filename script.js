var Education = document.getElementById("education");
var Experience = document.getElementById("experience");
var Skills = document.getElementById("skills");
var Hobbies = document.getElementById("hobbies");
var About = document.getElementById("about");
var Contact = document.getElementById("contact");
var Projects = document.getElementById("projects");
var Jupiter = document.getElementById("jupiter");
var TreeFlow = document.getElementById("treeflow");
var WFC = document.getElementById("wfc");

let aside = document.getElementById("lowermenu");


var tabAbout = document.getElementById("tab-about");
var tabContact = document.getElementById("tab-contact");
var tabJupiter = document.getElementById("tab-jupiter");
var tabTreeFlow = document.getElementById("tab-treeflow");
var tabWFC = document.getElementById("tab-wfc");

const allDivs = document.getElementsByClassName("part");
var current = document.getElementsByClassName("current");

const searchBar = document.getElementsByClassName("console");

var results = [
  ["education", 1],
  ["experience", 2],
  ["skills", 3],
  ["hobbies", 4],
  ["about", 5],
  ["contact", 6],
  ["projects", 7],
  ["jupiter", 8],
  ["wfc", 10],
];

var shownTabs = [1, 2, 3, 4];

function showProject() {
  const projectNames = ["jupiter", "treeflow", "wfc"];
  projectNames.forEach(projectName => {
    let projectDiv = document.getElementById(projectName);
    let iframe = document.getElementById(`iframe${projectName}`);
    if (projectDiv.classList.contains('current')) {
      iframe.src = `projects/${projectName.toLowerCase()}/index.html?v=${Date.now()}`;
    } else {
      iframe.src = "";
    }
  });
}

function adjustAsideMargin() {
  if (aside) {
    aside.style.marginTop = "0px";
  }
}

function show(part) {
  adjustAsideMargin();
  switch (part) {
    case 1:
      current[0].classList.remove('current');
      Education.classList.add('current');
      searchBar[0].value = "education";
      break;
    case 2:
      current[0].classList.remove('current');
      Experience.classList.add('current');
      searchBar[0].value = "experience";
      break;
    case 3:
      current[0].classList.remove('current');
      Skills.classList.add('current');
      searchBar[0].value = "skills";
      break;
    case 4:
      current[0].classList.remove('current');
      Hobbies.classList.add('current');
      searchBar[0].value = "hobbies";
      break;
    case 5:
      current[0].classList.remove('current');
      About.classList.add('current');
      searchBar[0].value = "about";
      break;
    case 6:
      current[0].classList.remove('current');
      Contact.classList.add('current');
      searchBar[0].value = "contact";
      break;
    case 7:
      current[0].classList.remove('current');
      Projects.classList.add('current');
      searchBar[0].value = "projects";
      break;
    case 8:
      current[0].classList.remove('current');
      Jupiter.classList.add('current');
      searchBar[0].value = "jupiter";
      break;
    // case 9:
    //   current[0].classList.remove('current');
    //   TreeFlow.classList.add('current');
    //   searchBar[0].value = "treeflow";
    //   break;
    case 10:
      current[0].classList.remove('current');
      WFC.classList.add('current');
      searchBar[0].value = "wfc";
      break;

    default:
      break;

  }
  showProject();

}

function activateTab(tabID) {
  switch (tabID) {
    case 5:
      tabAbout.classList.remove('hidden-tab');
      break;
    case 6:
      tabContact.classList.remove('hidden-tab');
      break;
    case 8:
      tabJupiter.classList.remove('hidden-tab');
      break;
    // case 9:
    //   tabTreeFlow.classList.remove('hidden-tab');
    //   break;
    case 10:
      tabWFC.classList.remove('hidden-tab');
      break;

    default:
      break;
  }
}

function Search(item) {
  console.log(item);
  console.table(shownTabs);
  for (let i = 0; i < results.length; i++) {
    const elem = results[i];
    console.log("Checking for " + elem[0]);
    if (item == elem[0]) {
      show(elem[1]);
      const found = shownTabs.find(element => element == elem[1]);
      if (found == undefined) {
        activateTab(elem[1]);
      }
    }

  }
}

function activate() {
  console.log("ACTIVATED");

}

function UnlockAll(params) {
  console.log("Unlock all");
  for (let index = 0; index < 11; index++) {
    activateTab(index);
  }
}


// Set up the grid
const numRows = 5; // Number of rows in the grid
const numCols = 5; // Number of columns in the grid
let grid = createEmptyGrid(); // Create an empty grid

// Function to create an empty grid
function createEmptyGrid() {
  const emptyGrid = new Array(numRows);
  for (let i = 0; i < numRows; i++) {
    emptyGrid[i] = new Array(numCols).fill(0);
  }
  return emptyGrid;
}

// Function to initialize the grid with random alive cells
function initializeGrid() {
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      grid[i][j] = Math.floor(Math.random() * 2); // Randomly set cell state to 0 or 1
    }
  }
}

// Function to display the grid
function displayGrid() {
  const gridContainer = document.getElementById('grid-container');
  gridContainer.innerHTML = ''; // Clear previous grid

  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const cell = document.createElement('div');
      cell.className = grid[i][j] ? 'alive' : 'dead'; // Set cell class based on state
      gridContainer.appendChild(cell);
    }
  }
}

// Function to update the grid based on the rules of the Game of Life
function updateGrid() {
  const newGrid = createEmptyGrid();

  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const neighbors = countAliveNeighbors(i, j);
      if (grid[i][j] === 1) {
        // Cell is alive
        if (neighbors < 2 || neighbors > 3) {
          // Any live cell with fewer than two or more than three live neighbors dies
          newGrid[i][j] = 0;
        } else {
          // Any live cell with two or three live neighbors survives
          newGrid[i][j] = 1;
        }
      } else {
        // Cell is dead
        if (neighbors === 3) {
          // Any dead cell with exactly three live neighbors becomes alive
          newGrid[i][j] = 1;
        }
      }
    }
  }

  

  grid = newGrid; // Update the grid
  if (isGridEmpty()){
    initializeGrid();
  }
}

function isGridEmpty() {
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      if (grid[i][j] === 1) {
        return false;
      }
    }
  }
  return true;
}

// Function to count the number of alive neighbors of a cell
function countAliveNeighbors(row, col) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue; // Exclude the current cell

      const neighborRow = (row + i + numRows) % numRows; // Handle edge wrapping
      const neighborCol = (col + j + numCols) % numCols; // Handle edge wrapping

      count += grid[neighborRow][neighborCol];
    }
  }
  return count;
}

// Function to start the game
function startGame() {
  initializeGrid(); // Initialize the grid with random alive cells
  displayGrid(); // Display the initial grid

  // Start the game loop
  setInterval(() => {
    updateGrid(); // Update the grid based on the rules of the Game of Life
    displayGrid(); // Display the updated grid
  }, 200); // Adjust the interval (in milliseconds) to control the speed of the game
}

// Call the startGame function to start the game
startGame();

window.addEventListener('message', event => {
  if (event.origin !== 'http://owabbi.github.io') return;

  const { iframeId, height, width } = event.data;
  const iframe = document.getElementById(iframeId);

  if (iframe) {
    const iframeContainer = iframe.parentElement;
    iframe.style.height = height + 'px';
    // aside.style.marginTop = (height - 480) + 'px';
    iframeContainer.style.width = (width + 60) + 'px';
  }
});