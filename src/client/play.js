let WIDTH, HEIGHT;
let canvas;

let gameArea = {}; // this will now *be* the canvas
let gridArea = {};
let sideArea = {};
let TILES = [];

class Tile {
  constructor() {
    this.id = 0; // ship id (size), up tp 4, if bigger: id-5 = size;
    this.state = 0; // 1: hit, 0: not hit
  }
}

function setup() {
  WIDTH = windowWidth;
  HEIGHT = windowHeight;

  updateLayout(); // calculate sizes before creating canvas

  canvas = createCanvas(gameArea.w, gameArea.h);
  canvas.position(gameArea.x, gameArea.y); // move canvas to proper location
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

  drawGrid();
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
  sideArea.y = 0;
  sideArea.w = gameArea.w - gridArea.w;
  sideArea.h = gameArea.h;
}

function drawGrid() {
  stroke("black");
  let cols = 10;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < cols; j++) {
      TILES[j + cols * i] = new Tile();
    }
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
  tile = getTile(mouseX, mouseY);
}

function getTile(x, y) {
  let col = floor((x / gridArea.w) * 10);
  let row = floor((y / gridArea.h) * 10);
  return [col, row];
}
