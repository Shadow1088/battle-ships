let WIDTH, HEIGHT;
let canvas;
let TILE_SIZE = 10;

let gameArea = {}; // this will now *be* the canvas
let gridArea = {};
let infoArea = {};
let sideArea = {};
let buttonArea = {};
let TILES = [];
let pships = [];

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
    this.state = 0; // 0: unplaced
    this.row = round(y / (gridArea.h / TILE_SIZE));
  }

  check() {
    if (this.hp == 0) {
      console.log("ship destroyed");
    }
  }

  draw() {
    push();

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
      image(IMAGES[this.img], 0, 0, this.w, this.h);
    } else {
      // vertical
      rotationX = this.x + this.w / 2;
      rotationY = this.y + this.h / (this.size * 2);
      translate(rotationX, rotationY);
      rotate(-HALF_PI * this.orientation);

      // Draw image centered on rotation point
      translate(((-this.h / 2) * this.size) / 4, 0);
      imageMode(CENTER);
      image(IMAGES[this.img], 0, 0, this.h, this.w);
    }

    pop();

    // Debug outline
    noFill();
    stroke("blue");
    rect(this.x, this.y, this.w, this.h);
  }

  rotate() {
    this.orientation = abs(this.orientation - 1);

    // Swap width and height when rotating
    let temp = this.w;
    this.w = this.h;
    this.h = temp;

    // Adjust position to keep the first grid square in the same place
    if (this.orientation === 0) {
      // now horizontal
      // Moving from vertical to horizontal
      this.x = this.x;
      this.y = this.y;
    } else {
      // now vertical
      // Moving from horizontal to vertical
      this.x = this.x;
      this.y = this.y;
    }
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

  for (let i = 0; i < pships.length; i++) {
    pships[i].draw();
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

function mouseClicked() {
  let tile = getTile(mouseX, mouseY);
  console.log(tile);
  let index = TILES[tile[0] + 10 * tile[1]];
  if (index.state == 0) {
    index.state = 1;
  }
}

function keyPressed() {
  // Add rotation on 'R' key press for testing
  if (key === "r" || key === "R") {
    for (let ship of pships) {
      ship.rotate();
    }
  }
}

function getTile(x, y) {
  let col = floor((x / gridArea.w) * TILE_SIZE);
  let row = floor((y / gridArea.h) * TILE_SIZE);
  return [col, row];
}
