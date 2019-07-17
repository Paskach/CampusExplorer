var tileDimension = 64;
var playerSpeed = 3;

var actualTileDimension = 32;
var tileScale = tileDimension / actualTileDimension;
var playerCoord = [762 * tileDimension, 1249 * tileDimension];
var tileWindowWidth = Math.ceil(window.innerWidth / tileDimension) + 3;
var tileWindowHeight = Math.ceil(window.innerHeight / tileDimension) + 3;

var c;
var ctx;

var arrowsDown = [false, false, false, false]; //up, down, left, right
var mousePosition = [0, 0];
var isMouseDown = false;
var facingRight = false;
var animationFrame = 0;

function startGame()
{
	window.addEventListener('touchstart', process_touchstart, false);
	window.addEventListener('touchmove', process_touchmove, false);
	window.addEventListener('touchend', process_touchend, false);
	c = document.getElementById('canvas');
	ctx = c.getContext("2d");
	ctx.font = '16px pixel';
	(function animloop(){
		requestAnimFrame(animloop);
		render();
	})();
}

function render()
{
	updateWindowSize();
	ctx.imageSmoothingEnabled = false;
	animationFrame = (animationFrame + 1) % 128;
	movePlayer();
	
	drawMapAt(Math.floor(playerCoord[0] / tileDimension), Math.floor(playerCoord[1] / tileDimension), tileDimension - (playerCoord[0] % tileDimension), tileDimension - (playerCoord[1] % tileDimension));
	drawItems();
	drawPlayer(animationFrame);
	drawMinimap(window.innerWidth / 6, window.innerHeight / 6, Math.floor(playerCoord[0] / tileDimension), Math.floor(playerCoord[1] / tileDimension));
	drawJoystick(Math.floor(window.innerWidth / 2), window.innerHeight - 150, mousePosition[0], mousePosition[1]);
	ctx.fillText('Testing 123', 10, 10);
}

function updateWindowSize()
{
	ctx.canvas.width  = window.innerWidth;
	ctx.canvas.height = window.innerHeight;
	tileWindowWidth = Math.floor(window.innerWidth / tileDimension) + 2;
	tileWindowHeight = Math.floor(window.innerHeight / tileDimension) + 2;
}

function movePlayer()
{
	if(arrowsDown[0] && !buildingsAbove(Math.floor(playerCoord[0] / tileDimension), Math.floor(playerCoord[1] / tileDimension)))
	{
		playerCoord[1] -= playerSpeed;
	}
	if(arrowsDown[1] && !buildingsBelow(Math.floor(playerCoord[0] / tileDimension), Math.floor(playerCoord[1] / tileDimension)))
	{
		playerCoord[1] += playerSpeed;
	}
	if(arrowsDown[2] && !buildingsToTheLeft(Math.floor(playerCoord[0] / tileDimension), Math.floor(playerCoord[1] / tileDimension)))
	{
		playerCoord[0] -= playerSpeed;
		facingRight = false;
	}
	if(arrowsDown[3] && !buildingsToTheRight(Math.floor(playerCoord[0] / tileDimension), Math.floor(playerCoord[1] / tileDimension)))
	{
		playerCoord[0] += playerSpeed;
		facingRight = true;
	}
}

function drawPlayer()
{
	var gait = 16
	if(!arrowsDown.includes(true)) //Standing still
	{
		if(facingRight) ctx.drawImage(sprites.cyStand, window.innerWidth / 2, window.innerHeight / 2, tileDimension, tileDimension);
		else ctx.drawImage(sprites.cyStandL, window.innerWidth / 2, window.innerHeight / 2, tileDimension, tileDimension);
	}
	else
	{
		if(facingRight)
		{
			if(animationFrame % gait < gait / 2) ctx.drawImage(sprites.cyWalk, window.innerWidth / 2, window.innerHeight / 2, tileDimension, tileDimension);
			else ctx.drawImage(sprites.cyStand, window.innerWidth / 2, window.innerHeight / 2, tileDimension, tileDimension);
		}
		else
		{
			if(animationFrame % gait < gait / 2) ctx.drawImage(sprites.cyWalkL, window.innerWidth / 2, window.innerHeight / 2, tileDimension, tileDimension);
			else ctx.drawImage(sprites.cyStandL, window.innerWidth / 2, window.innerHeight / 2, tileDimension, tileDimension);
		}
	}
}


function drawMapAt(x, y, offsetX, offsetY)
{
	
	var upperLeft = [- 2 * tileDimension + offsetX + (Math.floor(window.innerWidth / 2) % tileDimension) - Math.ceil(tileWindowWidth / 2), - 2 * tileDimension + offsetY + (Math.floor(window.innerHeight / 2) % tileDimension) - Math.ceil(tileWindowHeight / 2)];
	for(var row = 0; row < tileWindowHeight + 1; row++)
	{
		for(var col = 0; col < tileWindowWidth + 1; col++)
		{
			var tileX = x - Math.floor(tileWindowWidth / 2) + col;
			var tileY = y - Math.floor(tileWindowHeight / 2) + row;
			if(!getTileAt(tileX, tileY))
			{
				ctx.drawImage(grass(getTilesSurrounding(tileX, tileY)), upperLeft[0] + tileDimension * col, upperLeft[1] + tileDimension * row, tileDimension, tileDimension);
			}
			else
			{
				ctx.drawImage(sprites.road, upperLeft[0] + tileDimension * col, upperLeft[1] + tileDimension * row, tileDimension, tileDimension);
			}
			if(getBuildingAt(tileX, tileY))
			{
				ctx.drawImage(brick(getBuildingsSurrounding(tileX, tileY)), upperLeft[0] + tileDimension * col, upperLeft[1] + tileDimension * row, tileDimension, tileDimension);
			}
		}
	}
}

function drawItems()
{
	for(var i = 0; i < items.length; i += 2)
	{
		drawGlintAt(items[i + 1][0], items[i + 1][1], tileDimension - (playerCoord[0] % tileDimension), tileDimension - (playerCoord[1] % tileDimension));
	}
}

function drawGlintAt(x, y, offsetX, offsetY)
{
	//var upperLeft = [- 2 * tileDimension + offsetX + (Math.floor(window.innerWidth / 2) % tileDimension) - Math.ceil(tileWindowWidth / 2), - 2 * tileDimension + offsetY + (Math.floor(window.innerHeight / 2) % tileDimension) - Math.ceil(tileWindowHeight / 2)];
	var glintFrame = -1
	if(animationFrame > 0 && animationFrame <= 3) glintFrame = 1;
	if(animationFrame > 3 && animationFrame <= 6) glintFrame = 2;
	if(animationFrame > 6 && animationFrame <= 9) glintFrame = 3;
	if(animationFrame > 9 && animationFrame <= 12) glintFrame = 2;
	if(animationFrame > 12 && animationFrame <= 15) glintFrame = 1;
	if(glintFrame > 0) ctx.drawImage(glint(glintFrame), Math.floor(window.innerWidth / 2) - playerCoord[0] + (x * tileDimension), Math.floor(window.innerHeight / 2) - playerCoord[1] + (y * tileDimension), tileDimension, tileDimension)
}

function drawMinimap(width, height, x, y)
{
	width = Math.floor(width);
	height = Math.floor(height);
	var upperLeft = [window.innerWidth - width, 0];
	ctx.fillStyle = ('#ffffff');
	ctx.globalAlpha = 0.2;
    ctx.fillRect(upperLeft[0], upperLeft[1], width, height);
    ctx.globalAlpha = 1.0;
	ctx.fillStyle = ('#000000');
	//ctx.strokeStyle = ('#000000');
	//ctx.lineWidth = 2;
    //ctx.strokeRect(upperLeft[0], upperLeft[1], width, height);
	
	ctx.drawImage(sprites.map, x - Math.floor(width / 2), y - Math.floor(height / 2), width, height, upperLeft[0], upperLeft[1], width, height);
	ctx.drawImage(sprites.buildings, x - Math.floor(width / 2), y - Math.floor(height / 2), width, height, upperLeft[0], upperLeft[1], width, height);
	ctx.beginPath();
	ctx.arc(upperLeft[0] + Math.floor(width / 2), upperLeft[1] + Math.floor(height / 2), 3, 0, 2 * Math.PI, false);
	ctx.fillStyle = '#C8102E';
	ctx.fill();
	ctx.lineWidth = 1;
	ctx.strokeStyle = '#F1BE48';
	ctx.stroke();
	//console.log("sx: " + (x - Math.floor(width / 2)) + "  sy: " + (y - Math.floor(height / 2)) + "  sw: " + width + "  sh: " + height + "  x: " + (upperLeft[0] - x + Math.floor(width / 2)) + "  y: " + (upperLeft[1] - y + Math.floor(height / 2)) + "  w: " + width + "  h: " + height);
	/*
	for(var row = 0; row < height; row++)
	{
		for(var col = 0; col < width; col++)
		{
			if(getTileAt(x + col - Math.floor(width / 2), y + row - Math.floor(height / 2))) ctx.drawImage(sprites.pixel, upperLeft[0] + col, upperLeft[1] + row);//ctx.fillRect(upperLeft[0] + col, upperLeft[1] + row, 1, 1);
		}
	}
	*/
}

function drawJoystick(joyx, joyy, dirx, diry)
{
	var largeR = 75;
	var littleR = 25;
	var k = largeR - littleR;
	ctx.globalAlpha = 0.2;
	ctx.beginPath();
	ctx.arc(joyx, joyy, largeR, 0, 2 * Math.PI, false);
	ctx.fillStyle = '#ffffff';
	ctx.fill();
	ctx.lineWidth = 4;
	ctx.strokeStyle = '#ffffff';
	ctx.stroke();
	
	var stickX;
	var stickY;
	var theta = (Math.round((Math.atan((diry - joyy) / (dirx - joyx)) * (180 / Math.PI)) / 45) * 45) * (Math.PI / 180);
		
	if(isMouseDown)
	{
		stickX = k * Math.cos(theta) * (dirx < joyx ? -1 : 1) + joyx;
		stickY = k * Math.sin(theta) * (dirx < joyx ? -1 : 1) + joyy;
	}
	else
	{
		stickX = joyx;
		stickY = joyy;
	}
	
	ctx.beginPath();
	ctx.arc(stickX, stickY, littleR, 0, 2 * Math.PI, false);
	if(isMouseDown)
	{
		arrowsDown[0] = stickY < joyy;
		arrowsDown[1] = stickY > joyy;
		arrowsDown[2] = stickX < joyx;
		arrowsDown[3] = stickX > joyx;
	}
	ctx.fillStyle = '#ffffff';
	ctx.fill();
	ctx.lineWidth = 4;
	ctx.strokeStyle = '#ffffff';
	ctx.stroke();
	
	ctx.globalAlpha = 1;
}

function updateMouseCoords(e)
{
	mousePosition[0] = e.clientX;
	mousePosition[1] = e.clientY;
}

function process_touchmove(e)
{
	e.preventDefault();
	mousePosition[0] = e.changedTouches[0].pageX;
	mousePosition[1] = e.changedTouches[0].pageY;
}

function mouseDown(e)
{
	isMouseDown = true;
}

function mouseUp(e)
{
	isMouseDown = false;
	arrowsDown[0] = false;
	arrowsDown[1] = false;
	arrowsDown[2] = false;
	arrowsDown[3] = false;
}

function process_touchstart(e)
{
	isMouseDown = true;
	e.preventDefault();
	mousePosition[0] = e.changedTouches[0].pageX;
	mousePosition[1] = e.changedTouches[0].pageY;
}

function process_touchend(e)
{
	isMouseDown = false;
}

function buildingsToTheRight(x, y)
{
	return(getBuildingAt(x + 1, y) || getBuildingAt(x + 1, y - 1) || getBuildingAt(x + 1, y + 1));
}

function buildingsToTheLeft(x, y)
{
	return(getBuildingAt(x - 1, y) || getBuildingAt(x - 1, y - 1) || getBuildingAt(x - 1, y + 1));
}

function buildingsAbove(x, y)
{
	return(getBuildingAt(x, y - 1) || getBuildingAt(x + 1, y - 1) || getBuildingAt(x - 1, y - 1));
}

function buildingsBelow(x, y)
{
	return(getBuildingAt(x, y + 1) || getBuildingAt(x + 1, y + 1) || getBuildingAt(x - 1, y + 1));
}

function getText(url){
    // read text from URL location
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            var type = request.getResponseHeader('Content-Type');
            if (type.indexOf("text") !== 1) {
                return request.responseText;
            }
        }
    }
}

window.onkeydown = function(e)
{
	console.log("keydown");
	e.preventDefault();
	if(e.which == 38) arrowsDown[0] = true;
	if(e.which == 40) arrowsDown[1] = true;
	if(e.which == 37) arrowsDown[2] = true;
	if(e.which == 39) arrowsDown[3] = true;
}

window.onkeyup = function(e)
{
	console.log("keyup");
	if(e.which == 38) arrowsDown[0] = false;
	if(e.which == 40) arrowsDown[1] = false;
	if(e.which == 37) arrowsDown[2] = false;
	if(e.which == 39) arrowsDown[3] = false;
}

class Sprites
{
	constructor() {}
	get cyWalk() { return document.getElementById("cyWalk"); }
	get cyStand() { return document.getElementById("cyStand"); }
	get cyWalkL() { return document.getElementById("cyWalkL"); }
	get cyStandL() { return document.getElementById("cyStandL"); }
	get road() { return document.getElementById("road"); }
	get pixel() { return document.getElementById("pixel"); }
	get map() { return document.getElementById("map"); }
	get buildings() { return document.getElementById("buildings"); }
}

function grass(string) { return document.getElementById("grass" + string); }
function brick(string) { return document.getElementById("brick" + string); }
function dirt(string) { return document.getElementById("dirt" + string); }
function glint(string) { return document.getElementById("glint" + string); }

const sprites = new Sprites();

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

var items = [
	"the White Poker Chip",		[283, 466], 	"It's covered in dirt",
	"the Red Poker Chip", 		[300, 378],		"Looks like this has been here for years",
	"the Gold Poker Chip",		[200, 547],		"It's lodged in the ground",
	"a Piece of Chalk", 		[546, 937],		"Helpful for writing opinions on the ground",
	"the Audition Piece", 		[600, 1210],	"'Haydn Trumpet Concerto III'",
	"the Frisbee", 				[240, 1370],	"Looks brand new"
];