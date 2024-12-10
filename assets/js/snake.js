const canvas=document.getElementById('game'); const ctx=canvas.getContext('2d');

// Displaying snake variables.
let tileCount=20;
let tileSize=18;
let headX=Math.floor(Math.random()*tileCount);
let headY=Math.floor(Math.random()*tileCount);


//initialize the speed of snake
let xvelocity=0;
let yvelocity=0;

//draw apple
let appleX=Math.floor(Math.random()*tileCount); // Number <1 * tileCount is then rounded.
let appleY=Math.floor(Math.random()*tileCount);

while (headX==appleX && headY==appleY) {
    appleX=Math.floor(Math.random()*tileCount); // Number <1 * tileCount is then rounded.
    appleY=Math.floor(Math.random()*tileCount);
}

// array for snake parts.
const snakeParts=[];
let tailLength=1;

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
    ctx.fillRect(headX* tileCount,headY* tileCount, tileSize, tileSize);

    ctx.fillStyle="green";

    //loop through our snakeparts array
    for(let i=0;i<snakeParts.length;i++) {
        //draw snake parts
        let part=snakeParts[i]
         ctx.fillRect(part.x *tileCount, part.y *tileCount, tileSize,tileSize)
    }
    snakeParts.push(new snakePart(headX,headY));//put item at the end of list next to the head
}

function changeSnakePosition() {
    headX=headX+xvelocity;
    headY=headY+yvelocity;
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
    ctx.fillRect(appleX*tileCount, appleY*tileCount, tileSize, tileSize)//position apple within tile count
}

function checkCollision() {
    if (headX == appleX && headY == appleY) {
        appleX=Math.floor(Math.random()*tileCount);
        appleY=Math.floor(Math.random()*tileCount);
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
document.body.addEventListener('keydown', keyDown);
drawGame();