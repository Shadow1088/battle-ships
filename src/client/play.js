
const minishipCount = 4; const smallshipCount = 3; const mediumshipCount = 2; const largeshipCount = 1;   // Počet lodí pro každou velikost
let minishipImage; let smallshipImage; let mediumshipImage; let largeshipImage; // Obrázky lodí
let vminishipImage; let vsmallshipImage; let vmediumshipImage; let vlargeshipImage; // Obrázky lodí ale vertikálně

const gridSize = 10; // Velikost hracího pole
const tileSize = 50; // Velikost jednoho políčka


let gameStatus = "setup"; // Stav hry, může být "setup" nebo "play"
const whoPlays = document.getElementById("mainHeadline");
const whatStatus = document.getElementById("status"); // Element pro zobrazení stavu hry

let playerNumber = 1; // Číslo hráče, 1 nebo 2, určuje, kdo hraje
let player1ShipCount = 0; // Počet lodí hráče 1
let player2ShipCount = 0; // Počet lodí hráče 2

let rotationIsTriggered = false;


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
    this.shipSize = 0;                                    //velikost lodi, pokud je pole součástí lodi 
    this.isVertical = false;                              //název vypovídá
    this.drawIsBlocked = false;                        //true pokud je vykreslení pole blokováno, např. loď už byla vykreslena 

    this.otherShipTiles = [];                             //pole s ostatními lodními políčky v rámci jedné lodi
  }
}




let gridOneInfo = [];









function preload() {


  // Načtení obrázků lodí
  minishipImage = loadImage('../../img/miniShip.png');
  smallshipImage = loadImage('../../img/battleship1.png');
  mediumshipImage = loadImage('../../img/mediumShip.png');
  largeshipImage = loadImage('../../img/battleship3.png');

  vminishipImage = loadImage('../../img/verticalShips/miniShip.png');
  vsmallshipImage = loadImage('../../img/verticalShips/battleship1.png');
  vmediumshipImage = loadImage('../../img/verticalShips/mediumShip.png');
  vlargeshipImage = loadImage('../../img/verticalShips/battleship3.png');



  for (let i = 0; i < gridSize; i++) {
    gridOneInfo[i] = []; // Inicializace řádku v mřížce
    for (let j = 0; j < gridSize; j++) {
      gridOneInfo[i][j] = new Tile(i, j);
    }
  }
}

function setup() {
  createCanvas(1200, 500);
}

function draw() {

  angleMode(DEGREES); // Nastaví úhly v stupních

  whoPlays.innerHTML = "Player " + playerNumber + " goes"; // Zobrazí, kdo hraje
  whatStatus.innerHTML = "Status: " + gameStatus; // Zobrazí stav hry


  //image(mediumshipImage, 0, 0, 100, 500);


for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      // Vykreslení hracího pole
      stroke(0);
      fill(255);
      rect(i * tileSize, j * tileSize, tileSize, tileSize);                       //accualy věc v p5.js. funguje i když editor tvrdí opak
    }
  }

  
for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      
      // Vykreslení lodí
      if (gridOneInfo[i][j].isShip && gridOneInfo[i][j].drawIsBlocked == false) { // Zkontroluje, zda je políčko součástí lodi a není blokováno
        

        if (gridOneInfo[i][j].isVertical == false) {
          
        if (gridOneInfo[i][j].shipSize === 1) {
          image(minishipImage, i * tileSize, j * tileSize, tileSize, tileSize);
        } else if (gridOneInfo[i][j].shipSize === 2) {
          image(smallshipImage, i * tileSize, j * tileSize, tileSize * 2, tileSize);
          gridOneInfo[i + 1][j].drawIsBlocked = true; // Zamezí překreslení druhého políčka lodi
        } else if (gridOneInfo[i][j].shipSize === 3) {
          image(mediumshipImage, i * tileSize, j * tileSize, tileSize * 3, tileSize);
          gridOneInfo[i + 1][j].drawIsBlocked = true; // Zamezí překreslení druhého políčka lodi                      tři vnořené fory se mi dělat nechce
          gridOneInfo[i + 2][j].drawIsBlocked = true; // Zamezí překreslení třetího políčka lodi
        } else if (gridOneInfo[i][j].shipSize === 4) {
          image(largeshipImage, i * tileSize, j * tileSize, tileSize * 4, tileSize);
          gridOneInfo[i + 1][j].drawIsBlocked = true; // Zamezí překreslení druhého políčka lodi
          gridOneInfo[i + 2][j].drawIsBlocked = true; // Zamezí překreslení třetího políčka lodi
          gridOneInfo[i + 3][j].drawIsBlocked = true; // Zamezí překreslení čtvrtého políčka lodi
          }

        } else if (gridOneInfo[i][j].isVertical == true) {                                                        // Není dokončeno, až najdu chybu, tak dokončím

          //rotate(90); // Otočí obrázek o 90 stupňů, pokud je loď umístěna vertikálně

        if (gridOneInfo[i][j].shipSize === 1) {
          image(vminishipImage, i * tileSize, j * tileSize, tileSize, tileSize);
        } else if (gridOneInfo[i][j].shipSize === 2) {
          image(vsmallshipImage, i * tileSize, j * tileSize, tileSize, tileSize * 2);
          gridOneInfo[i][j + 1].drawIsBlocked = true; // Zamezí překreslení druhého políčka lodi
        } else if (gridOneInfo[i][j].shipSize === 3) {
          image(vmediumshipImage, i * tileSize, j * tileSize, tileSize, tileSize * 3);
          gridOneInfo[i][j + 1].drawIsBlocked = true; // Zamezí překreslení druhého políčka lodi                      tři vnořené fory se mi dělat nechce
          gridOneInfo[i][j + 2].drawIsBlocked = true; // Zamezí překreslení třetího políčka lodi
        } else if (gridOneInfo[i][j].shipSize === 4) {
          image(vlargeshipImage, i * tileSize, j * tileSize, tileSize, tileSize * 4);
          gridOneInfo[i][j + 1].drawIsBlocked = true; // Zamezí překreslení druhého políčka lodi
          gridOneInfo[i][j + 2].drawIsBlocked = true; // Zamezí překreslení třetího políčka lodi
          gridOneInfo[i][j + 3].drawIsBlocked = true; // Zamezí překreslení čtvrtého políčka lodi
          }

          //rotate(-90); // Otočí obrázek zpět na původní orientaci

        }
        

      }
    }
  }

  
}



function checkShipPlacementHorizontal(shipSize, startX, startY) {
  // Zkontroluje, zda je možné umístit loď na dané souřadnice
  // Předpokládáme, že loď je umístěna horizontálně
      let x = 0;
    let y = 0;
  for (let i = 0; i < shipSize; i++) {
     x = startX + i;
     y = startY;

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
  // Zkontroluje, zda je možné umístit loď na dané souřadnic
  // Předpokládáme, že loď je umístěna vertikálně
        let x = 0;
    let y = 0;

  for (let i = 0; i < shipSize; i++) {
    x = startX;
    y = startY + i;

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
      let countOfShips = playerNumber === 1 ? player1ShipCount : player2ShipCount;

let shipSize = 0; // Proměnná pro velikost lodi

switch (true) {
  case countOfShips < minishipCount:
    shipSize = 1; // Minilodě
    break;
    case countOfShips < minishipCount + smallshipCount:
    shipSize = 2; // Malé lodě
    break;
    case countOfShips < minishipCount + smallshipCount + mediumshipCount:
    shipSize = 3; // Střední lodě
    break;
    case countOfShips < minishipCount + smallshipCount + mediumshipCount + largeshipCount:
    shipSize = 4; // Velké lodě
    break;
  
  default:
    return; // Pokud není žádná loď k umístění, ukončí funkci
    
}

      if (checkShipPlacementVertical(shipSize, mouseXTC, mouseYTC)) {
        for (let i = 0; i < shipSize; i++) {
          gridOneInfo[mouseXTC][mouseYTC + i].isShip = true;
          gridOneInfo[mouseXTC][mouseYTC + i].isVertical = true;
          gridOneInfo[mouseXTC][mouseYTC + i].shipSize = shipSize;


        }          
 for (let i = 0; i < shipSize; i++) {
          for (let j = 0; j < shipSize; j++) {
            if (j != i) { // Zajišťuje, že se nepřidá souřadnice, která je již součástí lodi
              gridOneInfo[mouseXTC][mouseYTC + i].otherShipTiles.push(new Cords(mouseXTC, mouseYTC + j));
              
            }            
          }
        }
        addShipCount();   console.log("Ship placed vertically at (" + mouseXTC + ", " + mouseYTC + ") with size " + shipSize);
      }
  }





function createShipHorizontal(mouseXTC, mouseYTC) {
      let countOfShips = playerNumber === 1 ? player1ShipCount : player2ShipCount;

let shipSize = 0; // Proměnná pro velikost lodi

switch (true) {
  case countOfShips < minishipCount:
    shipSize = 1; // Minilodě
    break;
    case countOfShips < minishipCount + smallshipCount:
    shipSize = 2; // Malé lodě
    break;
    case countOfShips < minishipCount + smallshipCount + mediumshipCount:
    shipSize = 3; // Střední lodě
    break;
    case countOfShips < minishipCount + smallshipCount + mediumshipCount + largeshipCount:
    shipSize = 4; // Velké lodě
    break;
  
  default:
    
    break;
}

      if (checkShipPlacementHorizontal(shipSize, mouseXTC, mouseYTC)) {
        for (let i = 0; i < shipSize; i++) {
          gridOneInfo[mouseXTC + i][mouseYTC].isShip = true;
          gridOneInfo[mouseXTC + i][mouseYTC].shipSize = shipSize;

        }          
 for (let i = 0; i < shipSize; i++) {
          for (let j = 0; j < shipSize; j++) {
            if (j != i) { // Zajišťuje, že se nepřidá souřadnice, která je již součástí lodi
              gridOneInfo[mouseXTC + i][mouseYTC].otherShipTiles.push(new Cords(mouseXTC + j, mouseYTC));
              
            }            
          }
        }
        addShipCount();   console.log("Ship placed horizontally at (" + mouseXTC + ", " + mouseYTC + ") with size " + shipSize);
      }
    
}





function mousePressed() {
  if (mouseButton === RIGHT) {
    rotationIsTriggered = !rotationIsTriggered; // Přepne rotaci lodí při kliknutí pravým tlačítkem myši
    console.log("Rotation toggled: " + rotationIsTriggered);
    return;
  }
  else if (mouseButton === LEFT) {
  if (gameStatus === "setup") {
    
    if (mouseX > gridSize * tileSize || mouseY > gridSize * tileSize) {
      console.log("Clicked outside the grid");
      return; // Pokud je kliknutí mimo hrací pole, nic nedělej

    } else {

      // Převod souřadnic myši na index políčka
      let mouseXTC = Math.floor(mouseX / tileSize);
      let mouseYTC = Math.floor(mouseY / tileSize); 
    


    if (rotationIsTriggered == false) {                                                      //Volání funkcí pro tvorbu lodí
        createShipHorizontal(mouseXTC, mouseYTC);                              
      }else if (rotationIsTriggered == true) {
        createShipVertical(mouseXTC, mouseYTC);     
      }

             console.log("Setup phase: Clicked at (" + mouseXTC + ", " + mouseYTC + ")");

      }
    console.log("Setup phase: Clicked at (" + mouseX + ", " + mouseY + ")");


  } else if (gameStatus === "play") {

    // Zde byste mohli implementovat logiku pro hraní hry
    // Například, pokud kliknete na políčko, střílíte tam
    console.log("Play phase: Clicked at (" + mouseX + ", " + mouseY + ")");
  }
}
}