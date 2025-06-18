let WIDTH, HEIGHT;
let canvas;
let TILE_SIZE = 10;
let font; // Font variable

let gameArea = {}; // this will now *be* the canvas
let gridArea = {};
let infoArea = {};
let sideArea = {};
let buttonArea = {};
let TILES = [];
let pships = [];

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
};

class Tile {
  constructor() {
    this.id = 0; // ship id (size), <1;5>, if bigger: id-5 = size;
    this.state = 0; // 1: hit, 0: not hit
    this.occupied = false; // new: track if tile is occupied by a ship
    this.shipId = null; // new: which ship occupies this tile
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
  }

  check() {
    if (this.hp == 0) {
      console.log("ship destroyed");
    }
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

  for (let i = 0; i < 100; i++) {
    TILES[i] = new Tile();
  }
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

  updateLayout();
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

  for (let i = 0; i < pships.length; i++) {
    pships[i].draw();
  }

  // Draw UI text
  drawUI();
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

  // Show occupied tiles
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

function drawUI() {
  // Use a monospace font for a more game-like feel
  textFont("Courier New, monospace");

  fill(255);
  textAlign(LEFT);

  // Title
  textSize(16);
  textStyle(BOLD);
  let yPos = infoArea.y + 25;
  text("BATTLESHIP", infoArea.x + 10, yPos);

  // Instructions
  textSize(11);
  textStyle(NORMAL);
  yPos += 25;
  fill(220, 220, 255); // Light blue tint
  text("CONTROLS:", infoArea.x + 10, yPos);

  textSize(10);
  fill(200, 200, 200); // Light gray
  yPos += 15;
  text("• Click to select ship", infoArea.x + 15, yPos);
  yPos += 12;
  text("• Drag to move", infoArea.x + 15, yPos);
  yPos += 12;
  text("• R to rotate selected", infoArea.x + 15, yPos);
  yPos += 12;
  text("• Right-click to reset", infoArea.x + 15, yPos);
  yPos += 12;
  text("• C to clear all", infoArea.x + 15, yPos);

  if (selectedShip) {
    yPos += 20;
    textSize(12);
    fill(255, 255, 100); // Yellow
    textStyle(BOLD);
    text("SELECTED:", infoArea.x + 10, yPos);

    textSize(11);
    textStyle(NORMAL);
    fill(255);
    yPos += 15;
    text(`Ship Size: ${selectedShip.size}`, infoArea.x + 15, yPos);
    yPos += 12;
    text(
      `Status: ${selectedShip.state === 0 ? "UNPLACED" : "PLACED"}`,
      infoArea.x + 15,
      yPos,
    );
    yPos += 12;
    text(
      `Orientation: ${selectedShip.orientation === 1 ? "HORIZONTAL" : "VERTICAL"}`,
      infoArea.x + 15,
      yPos,
    );
  }
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
  // Check if clicking on a ship
  for (let ship of pships) {
    if (ship.isMouseOver(mouseX, mouseY)) {
      selectedShip = ship;
      ship.state = 2; // selected

      // Calculate drag offset
      dragOffset.x = mouseX - ship.x;
      dragOffset.y = mouseY - ship.y;
      isDragging = true;

      return; // Don't process tile click
    }
  }

  // If not clicking on ship, deselect
  if (selectedShip) {
    selectedShip.state = selectedShip.state === 2 ? 0 : selectedShip.state;
  }
  selectedShip = null;

  // Handle tile clicking (original functionality)
  if (isMouseInGrid()) {
    let tile = getTile(mouseX, mouseY);
    let index = TILES[tile[0] + 10 * tile[1]];
    if (index && index.state == 0) {
      index.state = 1;
    }
  }
}

// Right mouse button functionality
function mousePressed() {
  if (mouseButton === RIGHT) {
    // Reset selected ship to original position
    if (selectedShip) {
      selectedShip.returnToOriginal();
      selectedShip = null;
    }
    return;
  }

  // Left click logic (existing)
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

  if (isMouseInGrid()) {
    let tile = getTile(mouseX, mouseY);
    let index = TILES[tile[0] + 10 * tile[1]];
    if (index && index.state == 0) {
      index.state = 1;
    }
  }
}

function mouseDragged() {
  if (isDragging && selectedShip) {
    selectedShip.x = mouseX - dragOffset.x;
    selectedShip.y = mouseY - dragOffset.y;
  }
}

function mouseReleased() {
  if (isDragging && selectedShip) {
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
}

function getTile(x, y) {
  let col = floor((x - gridArea.x) / (gridArea.w / TILE_SIZE));
  let row = floor((y - gridArea.y) / (gridArea.h / TILE_SIZE));
  return [col, row];
}