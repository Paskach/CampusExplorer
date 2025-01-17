var tileDimension = 64;
var playerSpeed = 4;

var actualTileDimension = 32;
var tileScale = tileDimension / actualTileDimension;
var playerCoord = [762 * tileDimension, 1249 * tileDimension];
var foundItems = "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
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
	checkCookie();
	console.log("X: " + playerCoord[0] + "  Y: " + playerCoord[1]);
	(function animloop(){
		requestAnimFrame(animloop);
		render();
	})();
}

function render()
{
	updateWindowSize();
	ctx.imageSmoothingEnabled = false;
	ctx.font = '32px Madness';
	animationFrame = (animationFrame + 1) % 128;
	movePlayer();
	
	drawMapAt(Math.floor(playerCoord[0] / tileDimension), Math.floor(playerCoord[1] / tileDimension), tileDimension - (playerCoord[0] % tileDimension), tileDimension - (playerCoord[1] % tileDimension));
	drawItems();
	//console.log("X: " + playerCoord[0] + "  Y: " + playerCoord[1]);
	drawPlayer(animationFrame);
	drawMinimap(window.innerWidth / 6, window.innerHeight / 6, Math.floor(playerCoord[0] / tileDimension), Math.floor(playerCoord[1] / tileDimension));
	drawJoystick(Math.floor(window.innerWidth / 2), window.innerHeight - 150, mousePosition[0], mousePosition[1]);
	//ctx.fillText('Testing 123', 10, 10);
	checkItems();
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
		setCookie("playerX", playerCoord[0], 365);
		setCookie("playerY", playerCoord[1], 365);
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
	for(var i = 0; i < items.length; i += 3)
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
	
	var zoomOut = 2;
	ctx.drawImage(sprites.map, x - Math.floor(width / 2) * zoomOut, y - Math.floor(height / 2) * zoomOut, width * zoomOut, height * zoomOut, upperLeft[0], upperLeft[1], width, height);
	ctx.drawImage(sprites.buildings, x - Math.floor(width / 2) * zoomOut, y - Math.floor(height / 2) * zoomOut, width * zoomOut, height * zoomOut, upperLeft[0], upperLeft[1], width, height);
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

function checkItems()
{
	for(var i = 0; i < items.length; i += 3)
	{
		var distance = Math.max(Math.abs(items[i + 1][0] - (playerCoord[0] / tileDimension)), Math.abs(items[i + 1][1] - (playerCoord[1] / tileDimension)));
		var windowUpperLeft = [Math.floor(window.innerWidth / 2 - sprites.message.width / 2 * tileScale), Math.floor(window.innerHeight / 2 - sprites.message.height / 2 * tileScale)];
		if(Math.abs(distance) < 1)
		{
			ctx.globalAlpha = 0.75;
			ctx.drawImage(sprites.message, windowUpperLeft[0], windowUpperLeft[1], sprites.message.width * tileScale, sprites.message.height * tileScale);
			ctx.globalAlpha = 1;
			ctx.drawImage(document.getElementById(items[i]), windowUpperLeft[0] + 16, windowUpperLeft[1] + 64, tileDimension, tileDimension);
			ctx.fillText("YOU FOUND", windowUpperLeft[0] + 96, windowUpperLeft[1] + 32);
			ctx.fillText(items[i].toUpperCase() + '!', windowUpperLeft[0] + 96, windowUpperLeft[1] + 64);
			var desc = items[i + 2].split('|');
			for(var j = 0; j < desc.length; j++)
			{
				ctx.fillText(desc[j], windowUpperLeft[0] + 96, windowUpperLeft[1] + 96 + 32 * j);
			}
		}
	}
}



//@@@@@@@@@@@@@@@@@@@@@@@@@@@
//@@@  Support functions  @@@
//@@@@@@@@@@@@@@@@@@@@@@@@@@@

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
	arrowsDown[0] = false;
	arrowsDown[1] = false;
	arrowsDown[2] = false;
	arrowsDown[3] = false;
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

window.onkeydown = function(e)
{
	//console.log("keydown");
	e.preventDefault();
	if(e.which == 38) arrowsDown[0] = true;
	if(e.which == 40) arrowsDown[1] = true;
	if(e.which == 37) arrowsDown[2] = true;
	if(e.which == 39) arrowsDown[3] = true;
}

window.onkeyup = function(e)
{
	//console.log("keyup");
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
	get message() { return document.getElementById("messageBox"); }
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
	"White Poker Chip",		[283, 466], 	"It's covered in |dirt",
	"Red Poker Chip", 		[300, 378],		"Looks like this has |been here for years",
	"Gold Poker Chip",		[200, 547],		"It's lodged in the |ground",
	"Piece of Chalk", 		[546, 937],		"Helpful for writing |opinions on the |ground",
	"Audition Piece", 		[600, 1210],	"'Haydn Trumpet |Concerto III'",
	"Frisbee", 				[240, 1370],	"Looks brand new",
	"Banana", 				[368, 1174],	"Brown and mushy",
	"Game Controller", 		[1321, 1378], 	"Looks like it was |thrown out a window",
	"Corn", 				[1048, 655],	"Probably came from|this building",
	"Dual Triode", 			[656, 791], 	"Probably could solve|some simultaneous|linear equations",
	"Fork", 				[1316, 1289], 	"Don't see many of|these around here",
	"Frog", 				[1333, 2669], 	"'Ribbit'",
	"Pink Slip", 			[520, 1204], 	"'Drop: Calc 166'",
	"Solar Panel", 			[678, 615], 	"Hey, you could power|a car with this!",
	"Swan Feather", 		[673, 1278], 	"From Lancelot or|Elaine?"
];

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires="+d.toUTCString();
  //console.log(cname + " before: " + cvalue);
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  //console.log(cname + " after : " + cvalue);
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function checkCookie() {
  var data = getCookie("data");
  if (data != "") {
	  playerCoord[0] = parseInt(getCookie("playerX"));
	  playerCoord[1] = parseInt(getCookie("playerY"));
	  foundItems = getCookie("data");
  } else {
	  setCookie("data", foundItems, 365);
	  setCookie("playerX", playerCoord[0], 365);
	  setCookie("playerY", playerCoord[1], 365);
  }
}