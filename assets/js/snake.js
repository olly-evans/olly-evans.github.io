const canvas=document.getElementById('game'); const ctx=canvas.getContext('2d');

// Displaying snake variables.
let tileWidth=30;
let tileSize=18/20*tileWidth;
let horTiles=canvas.width/tileWidth

// Head of the snake coords.
let headX=Math.floor(Math.random()*horTiles);
let headY=Math.floor(Math.random()*horTiles);

//initialise the speed of snake
let xvelocity=0;
let yvelocity=0;

//draw apple
let appleX=Math.floor(Math.random()*horTiles); // Number <1 * tileCount is then rounded.
let appleY=Math.floor(Math.random()*horTiles);

while (headX==appleX && headY==appleY) {
    appleX=Math.floor(Math.random()*horTiles); // Number <1 * tileCount is then rounded.
    appleY=Math.floor(Math.random()*horTiles);
}

// array for snake parts.
const snakeParts=[];
let tailLength=2;

function drawGame() {

    let speed=7;//The interval will be seven times a second.
    setTimeout(drawGame, 1000/speed);//update screen 7 times a second
    
    clearScreen();
    drawSnake();
    changeSnakePosition();
    checkCollision();
    drawApple();
}

function clearScreen() {
ctx.fillStyle= 'black'; // make screen black
ctx.fillRect(0,0,canvas.clientWidth,canvas.clientHeight); // black color start from 0px left, right to canvas width and canvas height
}

function drawSnake() {
    ctx.fillStyle="orange";
    ctx.fillRect(headX* tileWidth,headY* tileWidth, tileSize, tileSize);

    ctx.fillStyle="green";
    //loop through our snakeparts array
    for(let i=0;i<snakeParts.length;i++) {
        //draw snake parts
        let part=snakeParts[i]
         ctx.fillRect(part.x *tileWidth, part.y *tileWidth, tileSize,tileSize)
    }
    snakeParts.push(new snakePart(headX,headY)); //put item at the end of list next to the head
}

function changeSnakePosition() {
    headX=headX+xvelocity;
    headY=headY+yvelocity;

    if (headX>horTiles) {
        headX=0;
        xvelocity=1;
    }
}

function keyDown(event) {
    if(event.keyCode==38) {
        if(yvelocity==1) {
            return;  //prevent snake from moving in opposite direction
        }
        yvelocity=-1;
        xvelocity=0;
    }
    //down
    if(event.keyCode==40) {
        if(yvelocity==-1) {
            return;
        }
        yvelocity=1;
        xvelocity=0;
    }
    //left
    if(event.keyCode==37) {
        if(xvelocity==1) {
            return;
        }
        yvelocity=0;
        xvelocity=-1;
    }
    //right
    if(event.keyCode==39) {
        if(xvelocity==-1) {
            return;
        }
        yvelocity=0;
        xvelocity=1;
    }
}

function drawApple() {
    ctx.fillStyle="red"; // make apple red
    ctx.fillRect(appleX*tileWidth, appleY*tileWidth, tileSize, tileSize)//position apple within tile count
}

function checkCollision() {
    if (headX == appleX && headY == appleY) {
        appleX=Math.floor(Math.random()*horTiles);
        appleY=Math.floor(Math.random()*horTiles);
        tailLength++;
    }
}

class snakePart {
    constructor(x, y) {
        this.x=x;
        this.y=y;
    }
}

//add event listener to our body
console.log(`Head: (${headX}, ${headY}), Apple: (${appleX}, ${appleY}), horTiles: (${horTiles})`);
document.body.addEventListener('keydown', keyDown);
drawGame();