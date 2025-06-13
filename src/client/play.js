const IMAGES = {
  ship1: null,
  ship2: null,
  ship3: null,
  ship4: null,
};

class Tile {
  constructor(x, y) {
    this.cords = new Cords(x, y); //pozice x a v rámci gridu
    this.isHit = false; //true pokud je pole zasaženo
    this.isShip = false; //true pokud je pole součástí lodi
    this.isSank = false; //true pokud je pole součástí potopené lodi
  }
}

class Ship {
  constructor(owner, size) {
    this.x = 0;
    this.y = 0;
    this.orientation = 1;
    this.owner = currentPlayer;
    this.size = this.col = this.row = this.image = "ship" + size;
  }
}

// P5 function - "A function that's called once to load assets before the sketch runs."
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
  createCanvas(1200, 500);
}

function draw() {
  imageMode(CENTER);
  image(IMAGES.ship1, 40, 40, 80, 160);
}
