let WIDTH, HEIGHT;
let canvas;
let TILE_SIZE = 10;
let font; // Font variable

let playerName = "";
let score = 0;

let gameArea = {}; // this will now *be* the canvas
let gridArea = {};
let infoArea = {};
let sideArea = {};
let buttonArea = {};
let TILES = [];
let COMPUTER_TILES = []; // Computer's grid
let pships = [];
let computerShips = [];

// Game state variables
let gameScene = "placing"; // "placing", "attacking", "observing"
let playerTurn = true;
let gameStarted = false;
let gameOver = false;
let winner = null;

// Computer AI variables
let computerLastHit = null;
let computerTargetQueue = [];
let computerHitDirection = null;
let computerOriginalHit = null;

// New variables for enhanced functionality
let selectedShip = null;
let dragOffset = { x: 0, y: 0 };
let isDragging = false;
let hoveredTile = null;
let placementValid = true;

const IMAGES = {
  ship1: null,
  ship2: null,
  ship3: null,
  ship4: null,
  hit: null,
  miss: null,
};

class Tile {
  constructor() {
    this.id = 0; // ship id (size), <1;5>, if bigger: id-5 = size;
    this.state = 0; // 0: empty, 1: hit, 2: miss
    this.occupied = false; // track if tile is occupied by a ship
    this.shipId = null; // which ship occupies this tile
    this.revealed = false; // for computer tiles - whether player has clicked here
  }
}

class Ship {
  constructor(size, orientation, x, y) {
    this.size = size;
    this.orientation = orientation;
    this.x = x;
    this.y = y;
    this.w = (gridArea.h / TILE_SIZE) * this.size;
    this.h = gridArea.w / TILE_SIZE;
    this.tiles = [];
    this.img = "ship" + size;
    this.hp = size;
    this.state = 0; // 0: unplaced, 1: placed, 2: selected
    this.row = round(y / (gridArea.h / TILE_SIZE));
    this.originalX = x; // store original position for reset
    this.originalY = y;
    this.id = Math.random(); // unique identifier
    this.destroyed = false;
  }

  check() {
    if (this.hp == 0 && !this.destroyed) {
      this.destroyed = true;
      console.log("ship destroyed");
      return true;
    }
    return false;
  }

  // Check if mouse is over this ship
  isMouseOver(mx, my) {
    return (
      mx >= this.x &&
      mx <= this.x + this.w &&
      my >= this.y &&
      my <= this.y + this.h
    );
  }

  // Check if ship can be placed at current position
  canPlaceHere() {
    let gridX = Math.floor((this.x - gridArea.x) / (gridArea.w / TILE_SIZE));
    let gridY = Math.floor((this.y - gridArea.y) / (gridArea.h / TILE_SIZE));

    // Check bounds
    if (this.orientation === 1) {
      // horizontal
      if (
        gridX + this.size > TILE_SIZE ||
        gridX < 0 ||
        gridY < 0 ||
        gridY >= TILE_SIZE
      ) {
        return false;
      }
    } else {
      // vertical
      if (
        gridY + this.size > TILE_SIZE ||
        gridX < 0 ||
        gridX >= TILE_SIZE ||
        gridY < 0
      ) {
        return false;
      }
    }

    // Check for overlapping ships
    for (let i = 0; i < this.size; i++) {
      let checkX = this.orientation === 1 ? gridX + i : gridX;
      let checkY = this.orientation === 1 ? gridY : gridY + i;
      let tileIndex = checkX + checkY * TILE_SIZE;

      if (
        TILES[tileIndex] &&
        TILES[tileIndex].occupied &&
        TILES[tileIndex].shipId !== this.id
      ) {
        return false;
      }
    }

    return true;
  }

  // Place ship on grid and update tile occupancy
  placeOnGrid() {
    // Clear previous position first, regardless of validity
    this.clearFromGrid();

    if (!this.canPlaceHere()) return false;

    let gridX = Math.floor((this.x - gridArea.x) / (gridArea.w / TILE_SIZE));
    let gridY = Math.floor((this.y - gridArea.y) / (gridArea.h / TILE_SIZE));

    // Snap to grid
    this.x = gridArea.x + gridX * (gridArea.w / TILE_SIZE);
    this.y = gridArea.y + gridY * (gridArea.h / TILE_SIZE);

    // Mark tiles as occupied
    for (let i = 0; i < this.size; i++) {
      let tileX = this.orientation === 1 ? gridX + i : gridX;
      let tileY = this.orientation === 1 ? gridY : gridY + i;
      let tileIndex = tileX + tileY * TILE_SIZE;

      if (TILES[tileIndex]) {
        TILES[tileIndex].occupied = true;
        TILES[tileIndex].shipId = this.id;
        TILES[tileIndex].id = this.size;
      }
    }

    this.state = 1; // placed
    return true;
  }

  // Remove ship from grid
  clearFromGrid() {
    for (let i = 0; i < TILES.length; i++) {
      if (TILES[i].shipId === this.id) {
        TILES[i].occupied = false;
        TILES[i].shipId = null;
        TILES[i].id = 0;
      }
    }
  }

  // Return ship to original position
  returnToOriginal() {
    this.clearFromGrid();
    this.x = this.originalX;
    this.y = this.originalY;
    this.state = 0; // unplaced
  }

  draw() {
    // Only draw ships in placing scene or if it's player's ships in observing scene
    if (gameScene !== "placing" && gameScene !== "observing") return;

    push();

    // Highlight selected ship
    if (this.state === 2 || selectedShip === this) {
      fill(255, 255, 0, 100); // yellow highlight
      noStroke();
      rect(this.x - 2, this.y - 2, this.w + 4, this.h + 4);
    }

    // Show invalid placement
    if (isDragging && selectedShip === this && !this.canPlaceHere()) {
      fill(255, 0, 0, 100); // red highlight
      noStroke();
      rect(this.x - 2, this.y - 2, this.w + 4, this.h + 4);
    }

    // Calculate rotation point based on first grid square
    let rotationX, rotationY;
    if (this.orientation === 0) {
      // horizontal
      rotationX = this.x + this.w / (this.size * 2);
      rotationY = this.y + this.h / 2;
      translate(rotationX, rotationY);
      rotate(-HALF_PI * this.orientation);

      // Draw image centered on rotation point
      translate(((this.w / 2) * this.size) / 6, 0);
      imageMode(CENTER);
      if (IMAGES[this.img]) {
        image(IMAGES[this.img], 0, 0, this.w, this.h);
      } else {
        // Fallback rectangle if image not loaded
        fill(100, 50, 200);
        rectMode(CENTER);
        rect(0, 0, this.w, this.h);
      }
    } else {
      // vertical
      rotationX = this.x + this.w / 2;
      rotationY = this.y + this.h / (this.size * 2);
      translate(rotationX, rotationY);
      rotate(-HALF_PI * this.orientation);

      // Draw image centered on rotation point
      translate(((-this.h / 2) * this.size) / 4, 0);
      imageMode(CENTER);
      if (IMAGES[this.img]) {
        image(IMAGES[this.img], 0, 0, this.h, this.w);
      } else {
        // Fallback rectangle if image not loaded
        fill(100, 50, 200);
        rectMode(CENTER);
        rect(0, 0, this.h, this.w);
      }
    }

    pop();

    // Debug outline
    noFill();
    if (selectedShip === this) {
      stroke("yellow");
      strokeWeight(2);
    } else {
      stroke("blue");
      strokeWeight(1);
    }
    rect(this.x, this.y, this.w, this.h);
    strokeWeight(1);
  }

  rotate() {
    this.orientation = abs(this.orientation - 1);

    // Swap width and height when rotating
    let temp = this.w;
    this.w = this.h;
    this.h = temp;

    // If placed, check if rotation is valid
    if (this.state === 1) {
      if (!this.canPlaceHere()) {
        // Rotate back if invalid
        this.orientation = abs(this.orientation - 1);
        temp = this.w;
        this.w = this.h;
        this.h = temp;
        return false;
      } else {
        // Re-place with new orientation
        this.clearFromGrid();
        this.placeOnGrid();
      }
    }
    return true;
  }
}

function preload() {
  loadImages();
}

// loads all images into an object
function loadImages() {
  for (let i = 0; i < Object.keys(IMAGES).length; i++) {
    img_name = Object.keys(IMAGES)[i];
    IMAGES[img_name] = loadImage(`img/${img_name}.png`);
  }
}

function setup() {
  WIDTH = windowWidth;
  HEIGHT = windowHeight;

  updateLayout(); // calculate sizes before creating canvas

  canvas = createCanvas(gameArea.w, gameArea.h);
  canvas.position(gameArea.x, gameArea.y); // move canvas to proper location

  // Initialize player tiles
  for (let i = 0; i < 100; i++) {
    TILES[i] = new Tile();
  }

  // Initialize computer tiles
  for (let i = 0; i < 100; i++) {
    COMPUTER_TILES[i] = new Tile();
  }

  // Initialize player ships
  for (let i = 0; i < 10; i++) {
    if (i > 5) {
      pships[i] = new Ship(
        1,
        1, // start horizontal
        sideArea.x + (gridArea.w / TILE_SIZE) * (i - 6),
        (gridArea.h / TILE_SIZE) * (6 + 2),
      );
      continue;
    }
    if (i > 2) {
      pships[i] = new Ship(
        2,
        1, // start horizontal
        sideArea.x,
        (gridArea.h / TILE_SIZE) * (i + 2),
      );
      continue;
    }
    if (i > 0) {
      pships[i] = new Ship(
        3,
        1, // start horizontal
        sideArea.x,
        (gridArea.h / TILE_SIZE) * (i + 2),
      );
      continue;
    }
    if (!i) {
      pships[i] = new Ship(4, 1, sideArea.x / 2, (gridArea.h / TILE_SIZE) * 2);
    }
  }

  // Store original positions after setup
  for (let ship of pships) {
    ship.originalX = ship.x;
    ship.originalY = ship.y;
  }

  // Generate computer ships
  generateComputerShips();

  updateLayout();
}

function generateComputerShips() {
  computerShips = [];
  let shipSizes = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

  for (let size of shipSizes) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 100) {
      let x = Math.floor(Math.random() * TILE_SIZE);
      let y = Math.floor(Math.random() * TILE_SIZE);
      let orientation = Math.floor(Math.random() * 2);

      if (canPlaceComputerShip(x, y, size, orientation)) {
        placeComputerShip(x, y, size, orientation);
        placed = true;
      }
      attempts++;
    }
  }
}

function canPlaceComputerShip(x, y, size, orientation) {
  // Check bounds
  if (orientation === 1) {
    // horizontal
    if (x + size > TILE_SIZE || y >= TILE_SIZE) return false;
  } else {
    // vertical
    if (y + size > TILE_SIZE || x >= TILE_SIZE) return false;
  }

  // Check for overlaps
  for (let i = 0; i < size; i++) {
    let checkX = orientation === 1 ? x + i : x;
    let checkY = orientation === 1 ? y : y + i;
    let tileIndex = checkX + checkY * TILE_SIZE;

    if (COMPUTER_TILES[tileIndex].occupied) {
      return false;
    }
  }

  return true;
}

function placeComputerShip(x, y, size, orientation) {
  let ship = {
    x: x,
    y: y,
    size: size,
    orientation: orientation,
    hp: size,
    destroyed: false,
    id: Math.random(),
  };

  computerShips.push(ship);

  // Mark tiles as occupied
  for (let i = 0; i < size; i++) {
    let tileX = orientation === 1 ? x + i : x;
    let tileY = orientation === 1 ? y : y + i;
    let tileIndex = tileX + tileY * TILE_SIZE;

    COMPUTER_TILES[tileIndex].occupied = true;
    COMPUTER_TILES[tileIndex].shipId = ship.id;
    COMPUTER_TILES[tileIndex].id = size;
  }
}

function draw() {
  background("purple"); // game area = white

  // Grid area (left square)
  fill(200); // light gray
  noStroke();
  rect(gridArea.x, gridArea.y, gridArea.w, gridArea.h);

  // Side area (right rectangle)
  fill(170); // slightly darker gray
  noStroke();
  rect(sideArea.x, sideArea.y, sideArea.w, sideArea.h);

  fill(150);
  rect(infoArea.x, infoArea.y, infoArea.w, infoArea.h);

  fill(120);
  rect(buttonArea.x, buttonArea.y, buttonArea.w, buttonArea.h);

  drawGrid();
  drawGridHighlights();
  drawHitsMisses();

  // Draw ships based on current scene
  if (gameScene === "placing" || gameScene === "observing") {
    for (let i = 0; i < pships.length; i++) {
      pships[i].draw();
    }
  }

  // Draw UI text
  drawUI();

  // Handle computer turn
  if (gameScene === "observing" && !playerTurn && !gameOver) {
    setTimeout(computerTurn, 1000); // 1 second delay for computer move
  }
}

function drawHitsMisses() {
  let tileSizeW = gridArea.w / TILE_SIZE;
  let tileSizeH = gridArea.h / TILE_SIZE;

  if (gameScene === "attacking") {
    // Draw hits and misses on computer grid
    for (let i = 0; i < COMPUTER_TILES.length; i++) {
      let col = i % TILE_SIZE;
      let row = Math.floor(i / TILE_SIZE);
      let tile = COMPUTER_TILES[i];

      if (tile.revealed) {
        let x = gridArea.x + col * tileSizeW;
        let y = gridArea.y + row * tileSizeH;

        if (tile.occupied && tile.state === 1) {
          // Hit - use image
          if (IMAGES.hit) {
            imageMode(CORNER);
            image(IMAGES.hit, x, y, tileSizeW, tileSizeH);
          } else {
            // Fallback
            fill(255, 0, 0);
            ellipse(
              x + tileSizeW / 2,
              y + tileSizeH / 2,
              tileSizeW * 0.8,
              tileSizeH * 0.8,
            );
          }
        } else if (tile.state === 2) {
          // Miss - use image
          if (IMAGES.miss) {
            imageMode(CORNER);
            image(IMAGES.miss, x, y, tileSizeW, tileSizeH);
          } else {
            // Fallback
            fill(0, 0, 255);
            ellipse(
              x + tileSizeW / 2,
              y + tileSizeH / 2,
              tileSizeW * 0.4,
              tileSizeH * 0.4,
            );
          }
        }
      }
    }
  } else if (gameScene === "observing") {
    // Draw hits and misses on player grid
    for (let i = 0; i < TILES.length; i++) {
      let col = i % TILE_SIZE;
      let row = Math.floor(i / TILE_SIZE);
      let tile = TILES[i];

      if (tile.state === 1 || tile.state === 2) {
        let x = gridArea.x + col * tileSizeW;
        let y = gridArea.y + row * tileSizeH;

        if (tile.state === 1) {
          // Hit - use image
          if (IMAGES.hit) {
            imageMode(CORNER);
            image(IMAGES.hit, x, y, tileSizeW, tileSizeH);
          } else {
            // Fallback
            fill(255, 0, 0);
            ellipse(
              x + tileSizeW / 2,
              y + tileSizeH / 2,
              tileSizeW * 0.8,
              tileSizeH * 0.8,
            );
          }
        } else if (tile.state === 2) {
          // Miss - use image
          if (IMAGES.miss) {
            imageMode(CORNER);
            image(IMAGES.miss, x, y, tileSizeW, tileSizeH);
          } else {
            // Fallback
            fill(0, 0, 255);
            ellipse(
              x + tileSizeW / 2,
              y + tileSizeH / 2,
              tileSizeW * 0.4,
              tileSizeH * 0.4,
            );
          }
        }
      }
    }
  }
}

function drawGridHighlights() {
  // Highlight hovered tile
  if (hoveredTile && isMouseInGrid()) {
    fill(255, 255, 0, 50);
    noStroke();
    let tileW = gridArea.w / TILE_SIZE;
    let tileH = gridArea.h / TILE_SIZE;
    rect(
      gridArea.x + hoveredTile[0] * tileW,
      gridArea.y + hoveredTile[1] * tileH,
      tileW,
      tileH,
    );
  }

  // Show occupied tiles (only in placing and observing scenes)
  if (gameScene === "placing" || gameScene === "observing") {
    for (let i = 0; i < TILES.length; i++) {
      if (TILES[i].occupied) {
        let col = i % TILE_SIZE;
        let row = Math.floor(i / TILE_SIZE);
        let tileW = gridArea.w / TILE_SIZE;
        let tileH = gridArea.h / TILE_SIZE;

        fill(0, 255, 0, 30);
        noStroke();
        rect(gridArea.x + col * tileW, gridArea.y + row * tileH, tileW, tileH);
      }
    }
  }
}

function drawUI() {
  // Use Arial font - most commonly used
  textFont("Arial");

  fill(255);
  textAlign(LEFT);

  // Title and scene
  textSize(20);
  textStyle(BOLD);
  let yPos = infoArea.y + 30;

  if (gameOver) {
    fill(255, 255, 0);
    text(`GAME OVER - ${winner} WINS!`, infoArea.x + 10, yPos);
    if (winner != "COMPUTER") {
      submitScore(playerName, score);
    }
  } else {
    text(`BATTLESHIP - ${gameScene.toUpperCase()}`, infoArea.x + 10, yPos);
  }

  // Scene-specific instructions
  textSize(14);
  textStyle(NORMAL);
  yPos += 30;
  fill(220, 220, 255);

  if (gameScene === "placing") {
    text("PLACE YOUR SHIPS:", infoArea.x + 10, yPos);
    textSize(12);
    fill(200, 200, 200);
    yPos += 20;
    text("• Drag ships to grid", infoArea.x + 15, yPos);
    yPos += 15;
    text("• R to rotate", infoArea.x + 15, yPos);
    yPos += 15;
    text("• Right-click to reset ship", infoArea.x + 15, yPos);
    yPos += 15;
    text("• C to clear all", infoArea.x + 15, yPos);
    yPos += 15;
    text("• SPACE to start game", infoArea.x + 15, yPos);

    // Check if all ships are placed
    let allPlaced = true;
    for (let ship of pships) {
      if (ship.state !== 1) {
        allPlaced = false;
        break;
      }
    }

    if (allPlaced) {
      yPos += 25;
      fill(0, 255, 0);
      textStyle(BOLD);
      text("ALL SHIPS PLACED!", infoArea.x + 10, yPos);
      yPos += 15;
      text("Press SPACE to start!", infoArea.x + 10, yPos);
    }
  } else if (gameScene === "attacking") {
    if (playerTurn) {
      text("YOUR TURN - ATTACK:", infoArea.x + 10, yPos);
      textSize(12);
      fill(200, 200, 200);
      yPos += 20;
      text("• Click enemy grid to attack", infoArea.x + 15, yPos);
      yPos += 15;
      text("• Red = Hit, Blue = Miss", infoArea.x + 15, yPos);
    } else {
      text("COMPUTER'S TURN", infoArea.x + 10, yPos);
      textSize(12);
      fill(200, 200, 200);
      yPos += 20;
      text("• Wait for computer move", infoArea.x + 15, yPos);
    }
  } else if (gameScene === "observing") {
    text("COMPUTER ATTACKS:", infoArea.x + 10, yPos);
    textSize(12);
    fill(200, 200, 200);
    yPos += 20;
    text("• Watch your grid", infoArea.x + 15, yPos);
    yPos += 15;
    text("• Red = Your ship hit", infoArea.x + 15, yPos);
    yPos += 15;
    text("• Blue = Computer missed", infoArea.x + 15, yPos);
  }

  // Game stats
  yPos += 30;
  textSize(14);
  fill(255, 255, 100);
  textStyle(BOLD);
  text("SHIPS REMAINING:", infoArea.x + 10, yPos);

  textSize(12);
  textStyle(NORMAL);
  fill(255);
  yPos += 20;

  let playerShipsLeft = 0;
  let computerShipsLeft = 0;

  for (let ship of pships) {
    if (!ship.destroyed) playerShipsLeft++;
  }

  for (let ship of computerShips) {
    if (!ship.destroyed) computerShipsLeft++;
  }

  text(`Player: ${playerShipsLeft}`, infoArea.x + 15, yPos);
  yPos += 15;
  text(`Computer: ${computerShipsLeft}`, infoArea.x + 15, yPos);

  if (selectedShip && gameScene === "placing") {
    yPos += 25;
    textSize(14);
    fill(255, 255, 100);
    textStyle(BOLD);
    text("SELECTED SHIP:", infoArea.x + 10, yPos);

    textSize(12);
    textStyle(NORMAL);
    fill(255);
    yPos += 20;
    text(`Size: ${selectedShip.size}`, infoArea.x + 15, yPos);
    yPos += 15;
    text(
      `Status: ${selectedShip.state === 0 ? "UNPLACED" : "PLACED"}`,
      infoArea.x + 15,
      yPos,
    );
  }
}

function draw() {
  background("purple"); // game area = white

  // Grid area (left square)
  fill(200); // light gray
  noStroke();
  rect(gridArea.x, gridArea.y, gridArea.w, gridArea.h);

  // Side area (right rectangle)
  fill(170); // slightly darker gray
  noStroke();
  rect(sideArea.x, sideArea.y, sideArea.w, sideArea.h);

  fill(150);
  rect(infoArea.x, infoArea.y, infoArea.w, infoArea.h);

  fill(120);
  rect(buttonArea.x, buttonArea.y, buttonArea.w, buttonArea.h);

  drawGrid();
  drawGridHighlights();
  drawHitsMisses();

  // Draw ships based on current scene
  if (gameScene === "placing" || gameScene === "observing") {
    for (let i = 0; i < pships.length; i++) {
      pships[i].draw();
    }
  }

  // Draw UI text
  drawUI();

  // Handle computer turn with increased delay
  if (gameScene === "observing" && !playerTurn && !gameOver) {
    setTimeout(computerTurn, 2500); // 2.5 second delay for computer move
  }
}

function computerTurn() {
  if (playerTurn || gameOver) return;

  let targetTile = getComputerTarget();
  if (targetTile === null) return;

  let tileIndex = targetTile[0] + targetTile[1] * TILE_SIZE;
  let tile = TILES[tileIndex];

  if (tile.occupied) {
    // Hit!
    tile.state = 1;

    // Find the ship and reduce HP
    for (let ship of pships) {
      if (ship.id === tile.shipId) {
        ship.hp--;
        if (ship.check()) {
          // Ship destroyed - clear target queue
          computerTargetQueue = [];
          computerLastHit = null;
          computerHitDirection = null;
          computerOriginalHit = null;
        }
        break;
      }
    }

    computerLastHit = targetTile;
    if (computerOriginalHit === null) {
      computerOriginalHit = targetTile;
    }

    // Add adjacent tiles to target queue if we don't have a direction yet
    if (computerHitDirection === null) {
      addAdjacentTargets(targetTile[0], targetTile[1]);
    } else {
      // Continue in the same direction
      continueInDirection(targetTile[0], targetTile[1]);
    }

    // Check for game over
    if (checkGameOver()) return;

    // Continue attacking on hit
    setTimeout(computerTurn, 1000);
  } else {
    // Miss
    tile.state = 2;

    // If we were targeting in a direction and missed, try the opposite direction
    if (computerLastHit && computerOriginalHit) {
      if (computerHitDirection !== null) {
        // Switch to opposite direction from original hit
        computerTargetQueue = [];
        switchDirection();
      }
    }

    // Switch to player turn
    playerTurn = true;
    gameScene = "attacking";
  }
}

function getComputerTarget() {
  // If we have targets in queue, use them first
  if (computerTargetQueue.length > 0) {
    return computerTargetQueue.shift();
  }

  // Random targeting
  let attempts = 0;
  while (attempts < 100) {
    let x = Math.floor(Math.random() * TILE_SIZE);
    let y = Math.floor(Math.random() * TILE_SIZE);
    let tileIndex = x + y * TILE_SIZE;

    if (TILES[tileIndex].state === 0) {
      return [x, y];
    }
    attempts++;
  }

  return null;
}

function addAdjacentTargets(x, y) {
  let directions = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];

  for (let dir of directions) {
    let newX = x + dir[0];
    let newY = y + dir[1];

    if (newX >= 0 && newX < TILE_SIZE && newY >= 0 && newY < TILE_SIZE) {
      let tileIndex = newX + newY * TILE_SIZE;
      if (TILES[tileIndex].state === 0) {
        computerTargetQueue.push([newX, newY]);
      }
    }
  }
}

function continueInDirection(x, y) {
  if (computerHitDirection === null) return;

  let dir = computerHitDirection;
  let newX = x + dir[0];
  let newY = y + dir[1];

  if (newX >= 0 && newX < TILE_SIZE && newY >= 0 && newY < TILE_SIZE) {
    let tileIndex = newX + newY * TILE_SIZE;
    if (TILES[tileIndex].state === 0) {
      computerTargetQueue.unshift([newX, newY]);
    }
  }
}

function switchDirection() {
  if (computerOriginalHit && computerHitDirection) {
    // Switch to opposite direction from original hit
    let oppositeDir = [-computerHitDirection[0], -computerHitDirection[1]];
    let newX = computerOriginalHit[0] + oppositeDir[0];
    let newY = computerOriginalHit[1] + oppositeDir[1];

    if (newX >= 0 && newX < TILE_SIZE && newY >= 0 && newY < TILE_SIZE) {
      let tileIndex = newX + newY * TILE_SIZE;
      if (TILES[tileIndex].state === 0) {
        computerTargetQueue.unshift([newX, newY]);
        computerHitDirection = oppositeDir;
      }
    }
  }
}

function checkGameOver() {
  let playerShipsLeft = 0;
  let computerShipsLeft = 0;

  for (let ship of pships) {
    if (!ship.destroyed) playerShipsLeft++;
  }

  for (let ship of computerShips) {
    if (!ship.destroyed) computerShipsLeft++;
  }

  if (playerShipsLeft === 0) {
    gameOver = true;
    winner = "COMPUTER";
    return true;
  } else if (computerShipsLeft === 0) {
    gameOver = true;
    winner = "PLAYER";
    return true;
  }

  return false;
}

function windowResized() {
  WIDTH = windowWidth;
  HEIGHT = windowHeight;

  updateLayout();
  resizeCanvas(gameArea.w, gameArea.h);
  canvas.position(gameArea.x, gameArea.y);
}

function updateLayout() {
  // Canvas is centered and sized like gameArea
  gameArea.w = (WIDTH / 6) * 4;
  gameArea.h = (HEIGHT / 6) * 4;
  gameArea.x = WIDTH / 6;
  gameArea.y = HEIGHT / 6;

  // Grid area (square on the left)
  gridArea.h = gameArea.h;
  gridArea.w = gameArea.h; // square
  gridArea.x = 0; // inside canvas, so relative to (0, 0)
  gridArea.y = 0;

  // Side area (fills remaining horizontal space)
  sideArea.x = gridArea.w;
  sideArea.y = gameArea.h / 6;
  sideArea.w = ((gameArea.w - gridArea.w) / 4) * 3;
  sideArea.h = (gameArea.h / 6) * 5;

  infoArea.x = sideArea.x;
  infoArea.y = gridArea.y;
  infoArea.w = (sideArea.w / 3) * 4;
  infoArea.h = gameArea.h / 6;

  buttonArea.x = sideArea.w + sideArea.x;
  buttonArea.y = sideArea.y;
  buttonArea.w = sideArea.w / 3;
  buttonArea.h = sideArea.h;

  // Update ship dimensions when layout changes
  for (let i = 0; i < pships.length; i++) {
    let ship = pships[i];

    // Recalculate dimensions based on orientation
    if (ship.orientation === 1) {
      // horizontal
      ship.w = (gridArea.w / TILE_SIZE) * ship.size;
      ship.h = gridArea.h / TILE_SIZE;
    } else {
      // vertical
      ship.w = gridArea.w / TILE_SIZE;
      ship.h = (gridArea.h / TILE_SIZE) * ship.size;
    }

    // Reset position if not placed
    if (!ship.state) {
      let offset = (gridArea.h / TILE_SIZE) * ((i - 6 + abs(i - 6)) / 2);

      ship.x = sideArea.x + offset;
      ship.y = ship.row * (gridArea.h / TILE_SIZE);
      ship.originalX = ship.x;
      ship.originalY = ship.y;
    }
  }
}

function drawGrid() {
  stroke("black");
  let cols = TILE_SIZE;
  for (let i = 0; i < cols; i++) {
    line(
      gridArea.x + (i * gridArea.w) / cols,
      gridArea.y,
      gridArea.x + (i * gridArea.w) / cols,
      gridArea.y + gridArea.h,
    );
    line(
      gridArea.x,
      gridArea.y + (i * gridArea.h) / cols,
      gridArea.x + gridArea.w,
      gridArea.y + (i * gridArea.h) / cols,
    );
  }
}

function isMouseInGrid() {
  return (
    mouseX >= gridArea.x &&
    mouseX <= gridArea.x + gridArea.w &&
    mouseY >= gridArea.y &&
    mouseY <= gridArea.y + gridArea.h
  );
}

function mouseMoved() {
  // Update hovered tile
  if (isMouseInGrid()) {
    hoveredTile = getTile(mouseX, mouseY);
  } else {
    hoveredTile = null;
  }
}

function mousePressed() {
  if (gameOver) return;

  if (gameScene === "placing") {
    handlePlacingMousePress();
  } else if (gameScene === "attacking" && playerTurn) {
    handleAttackingMousePress();
  }
}

function handlePlacingMousePress() {
  if (mouseButton === RIGHT) {
    // Reset selected ship to original position
    if (selectedShip) {
      selectedShip.returnToOriginal();
      selectedShip = null;
    }
    return;
  }

  // Left click logic
  for (let ship of pships) {
    if (ship.isMouseOver(mouseX, mouseY)) {
      selectedShip = ship;
      ship.state = 2; // selected

      dragOffset.x = mouseX - ship.x;
      dragOffset.y = mouseY - ship.y;
      isDragging = true;

      return;
    }
  }

  if (selectedShip) {
    selectedShip.state = selectedShip.state === 2 ? 0 : selectedShip.state;
  }
  selectedShip = null;
}

function handleAttackingMousePress() {
  if (!isMouseInGrid()) return;

  let tile = getTile(mouseX, mouseY);
  let tileIndex = tile[0] + tile[1] * TILE_SIZE;
  let computerTile = COMPUTER_TILES[tileIndex];

  // Can't click already revealed tiles
  if (computerTile.revealed) return;

  computerTile.revealed = true;

  if (computerTile.occupied) {
    // Hit!
    computerTile.state = 1;

    // Find the computer ship and reduce HP
    for (let ship of computerShips) {
      if (ship.id === computerTile.shipId) {
        ship.hp--;
        if (ship.hp <= 0) {
          ship.destroyed = true;
        }
        break;
      }
    }

    // Check for game over
    if (checkGameOver()) return;

    // Player continues on hit - don't switch turns
  } else {
    // Miss
    computerTile.state = 2;

    // Switch to computer turn
    playerTurn = false;
    gameScene = "observing";
  }
}

function mouseDragged() {
  if (gameScene === "placing" && isDragging && selectedShip) {
    selectedShip.x = mouseX - dragOffset.x;
    selectedShip.y = mouseY - dragOffset.y;
  }
}

function mouseReleased() {
  if (gameScene === "placing" && isDragging && selectedShip) {
    // Try to place ship on grid
    if (isMouseInGrid() && selectedShip.canPlaceHere()) {
      selectedShip.placeOnGrid();
    } else if (selectedShip.state !== 1) {
      // Return to original position if not placed and not valid
      selectedShip.returnToOriginal();
    }

    isDragging = false;
    selectedShip = null;
  }
}

function keyPressed() {
  if (gameOver) {
    if (key === " ") {
      // Restart game
      restartGame();
    }
    return;
  }

  if (gameScene === "placing") {
    // Rotate selected ship
    if ((key === "r" || key === "R") && selectedShip) {
      if (!selectedShip.rotate()) {
        console.log("Cannot rotate ship here");
      }
    }

    // Reset all ships to original positions
    if (key === "c" || key === "C") {
      for (let ship of pships) {
        ship.returnToOriginal();
      }
      selectedShip = null;
    }

    // Start game
    if (key === " ") {
      // Check if all ships are placed
      let allPlaced = true;
      for (let ship of pships) {
        if (ship.state !== 1) {
          allPlaced = false;
          break;
        }
      }

      if (allPlaced) {
        gameScene = "attacking";
        gameStarted = true;
        playerTurn = true;
      }
    }
  }
}

function restartGame() {
  // Reset game state
  gameScene = "placing";
  playerTurn = true;
  gameStarted = false;
  gameOver = false;
  winner = null;

  // Reset computer AI
  computerLastHit = null;
  computerTargetQueue = [];
  computerHitDirection = null;
  computerOriginalHit = null;

  // Reset tiles
  for (let i = 0; i < 100; i++) {
    TILES[i] = new Tile();
    COMPUTER_TILES[i] = new Tile();
  }

  // Reset player ships
  for (let ship of pships) {
    ship.returnToOriginal();
    ship.hp = ship.size;
    ship.destroyed = false;
  }

  selectedShip = null;
  isDragging = false;

  // Generate new computer ships
  generateComputerShips();
}

function getTile(x, y) {
  let col = floor((x - gridArea.x) / (gridArea.w / TILE_SIZE));
  let row = floor((y - gridArea.y) / (gridArea.h / TILE_SIZE));
  return [col, row];
}

async function submitScore(username, score) {
  const res = await fetch(
    "https://battle-ships.shadow1088punch.workers.dev/submit",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, score }),
    },
  );

  const text = await res.text();
  console.log("Submit response:", text);
}
