
const minishipCount = 4; const smallshipCount = 3; const mediumshipCount = 2; const largeshipCount = 1;   // Počet lodí pro každou velikost
let minishipImage; let smallshipImage; let mediumshipImage; let largeshipImage; // Obrázky lodí

const gridSize = 10; // Velikost hracího pole
const tileSize = 50; // Velikost jednoho políčka


let gameStatus = "setup"; // Stav hry, může být "setup" nebo "play"
const whoPlays = document.getElementById("mainHeadline");
const whatStatus = document.getElementById("status"); // Element pro zobrazení stavu hry

let playerNumber = 1; // Číslo hráče, 1 nebo 2, určuje, kdo hraje
let player1ShipCount = 0; // Počet lodí hráče 1
let player2ShipCount = 0; // Počet lodí hráče 2

let rotate = false;


// Definice třídy pro souřadnice
class Cords {
  constructor(x, y) {
    this.x = x;
    this.y = y; 
  }
}


// Definice třídy pro políčko
class Tile {
  constructor(x, y) {
    this.cords = new Cords(x, y);                           //pozice x a v rámci gridu
    this.isHit = false;                                    //true pokud je pole zasaženo
    this.isShip = false;                                   //true pokud je pole součástí lodi  
    this.isSank = false;                                  //true pokud je pole součástí potopené lodi 

    this.otherShipTiles = [];                             //pole s ostatními lodními políčky v rámci jedné lodi
  }
}
let gridOneInfo = [gridSize] [gridSize];










function preload() {


  // Načtení obrázků lodí
  minishipImage = loadImage('../../img/battleship5.png');
  smallshipImage = loadImage('../../img/battleship1.png');
  mediumshipImage = loadImage('../../img/battleship2.png');
  largeshipImage = loadImage('../../img/battleship3.png');




  for (let i = 1; i <= gridSize; i++) {

    for (let j = 1; j <= gridSize; j++) {
      gridOneInfo[i][j] = new Tile(i, j);
    }
  }
}

function setup() {
  createCanvas(1200, 500);
}

function draw() {
  whoPlays.innerHTML = "Player " + playerNumber + " goes"; // Zobrazí, kdo hraje
  whatStatus.innerHTML = "Status: " + gameStatus; // Zobrazí stav hry


  
}



function checkShipPlacementHorizontal(shipSize, startX, startY) {
  // Zkontroluje, zda je možné umístit loď na dané souřadnice
  // Předpokládáme, že loď je umístěna horizontálně
  for (let i = 0; i < shipSize; i++) {
    let x = startX + i;
    let y = startY;

    // Kontrola, zda jsou souřadnice v rámci hracího pole
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
      return false; // Loď by přesahovala hrací pole
    }

    // Kontrola, zda je políčko již obsazeno lodí
    if (gridOneInfo[x][y].isShip) {
      return false; // Políčko již obsahuje loď
    }
  }
  return true; // Loď může být umístěna
}




function checkShipPlacementVertical(shipSize, startX, startY) {
  // Zkontroluje, zda je možné umístit loď na dané souřadnice
  // Předpokládáme, že loď je umístěna vertikálně
  for (let i = 0; i < shipSize; i++) {
    let x = startX;
    let y = startY + i;

    // Kontrola, zda jsou souřadnice v rámci hracího pole
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
      return false; // Loď by přesahovala hrací pole
    }

    // Kontrola, zda je políčko již obsazeno lodí
    if (gridOneInfo[x][y].isShip) {
      return false; // Políčko již obsahuje loď
    }
  }
  return true; // Loď může být umístěna
}


function addShipCount() {
    if (playerNumber == 1) {
      player1ShipCount++;
    } else {
      player2ShipCount++;
    }
}

function createShipVertical(mouseXTC, mouseYTC) {

  if (countOfShips < minishipCount) {
      if (checkShipPlacementVertical(1, mouseXTC, mouseYTC)) {
        // Umístění minilodi
        gridOneInfo[mouseXTC][mouseYTC].isShip = true;
        //gridOneInfo[mouseXTC][mouseYTC].otherShipTiles.push(new Cords(mouseXTC, mouseYTC));
        addShipCount();
      }
}
if (countOfShips < smallshipCount + minishipCount) {
      if (checkShipPlacementVertical(2, mouseXTC, mouseYTC)) {
          for (let i = 0; i < 2; i++) {
            gridOneInfo[mouseXTC][mouseYTC + i].isShip = true;
          }          
          gridOneInfo[mouseXTC][mouseYTC].otherShipTiles.push(new Cords(mouseXTC, mouseYTC + 1));
          gridOneInfo[mouseXTC][mouseYTC + 1].otherShipTiles.push(new Cords(mouseXTC, mouseYTC));
        addShipCount();
      }
      
    }
  }





function createShipHorizontal(mouseXTC, mouseYTC) {
  let countOfShips = 0; // Počet lodí, které hráč umístil
    if (playerNumber === 1) {
      countOfShips = player1ShipCount;
    } else {
      countOfShips = player2ShipCount;
    }

if (countOfShips < minishipCount) {
  if (checkShipPlacementHorizontal(1, mouseXTC, mouseYTC)) {
        // Umístění minilodi
        gridOneInfo[mouseXTC][mouseYTC].isShip = true;
        //gridOneInfo[mouseXTC][mouseYTC].otherShipTiles.push(new Cords(mouseXTC, mouseYTC));
        addShipCount();
  }
}
if (countOfShips < smallshipCount + minishipCount) {
        // Umístění malé lodi
          
        if (checkShipPlacementHorizontal(2, mouseXTC, mouseYTC)) {
          for (let i = 0; i < 2; i++) {
            gridOneInfo[mouseXTC + i][mouseYTC].isShip = true;
          }          
          gridOneInfo[mouseXTC][mouseYTC].otherShipTiles.push(new Cords(mouseXTC + 1, mouseYTC));
          gridOneInfo[mouseXTC + 1][mouseYTC].otherShipTiles.push(new Cords(mouseXTC, mouseYTC));
        addShipCount();
      }



}                                                                                                                   //Dodělat další velikosti lodí + tlačítko pro rotaci a konrolu vertikálního umístění

}





function mousePressed() {
  if (gameStatus === "setup") {
    
    if (mouseX > gridSize * tileSize || mouseY > gridSize * tileSize) {
      console.log("Clicked outside the grid");
      return; // Pokud je kliknutí mimo hrací pole, nic nedělej

    } else {

      // Převod souřadnic myši na index políčka
      let mouseXTC = Math.floor(mouseX / tileSize);
      let mouseYTC = Math.floor(mouseY / tileSize); 
    }


    if (rotate == false) {                                                      //Volání funkcí pro tvorbu lodí
        createShipHorizontal(mouseXTC, mouseYTC);                               //Zatím jen logika bez obrázků
      }else if (rotate == true) {
        createShipVertical(mouseXTC, mouseYTC);     
      }
    console.log("Setup phase: Clicked at (" + mouseX + ", " + mouseY + ")");


  } else if (gameStatus === "play") {

    // Zde byste mohli implementovat logiku pro hraní hry
    // Například, pokud kliknete na políčko, střílíte tam
    console.log("Play phase: Clicked at (" + mouseX + ", " + mouseY + ")");
  }
}