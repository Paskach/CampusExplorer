var tileDimension = 32;

var playerCoord = [762 * tileDimension, 1249 * tileDimension];
var tileWindowWidth = Math.ceil(window.innerWidth / tileDimension) + 3;
var tileWindowHeight = Math.ceil(window.innerHeight / tileDimension) + 3;

var c;
var ctx;

var arrowsDown = [false, false, false, false]; //up, down, left, right
var animationFrame = 0;

function startGame()
{
	c = document.getElementById('canvas');
	ctx = c.getContext("2d");
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
	drawPlayer(animationFrame);
	drawMinimap(window.innerWidth / 10, window.innerHeight / 10, Math.floor(playerCoord[0] / tileDimension), Math.floor(playerCoord[1] / tileDimension));
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
	if(arrowsDown[0])
	{
		playerCoord[1] -= 2;
	}
	if(arrowsDown[1])
	{
		playerCoord[1] += 2;
	}
	if(arrowsDown[2])
	{
		playerCoord[0] -= 2;
	}
	if(arrowsDown[3])
	{
		playerCoord[0] += 2;
	}
}

function drawPlayer()
{
	var gait = 16
	if(!arrowsDown.includes(true)) //Standing still
	{
		ctx.drawImage(sprites.cyStand, window.innerWidth / 2, window.innerHeight / 2);
	}
	else
	{
		if(animationFrame % gait < gait / 2) ctx.drawImage(sprites.cyWalk, window.innerWidth / 2, window.innerHeight / 2);
		else ctx.drawImage(sprites.cyStand, window.innerWidth / 2, window.innerHeight / 2);
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
				ctx.drawImage(grass(getTilesSurrounding(tileX, tileY)), upperLeft[0] + tileDimension * col, upperLeft[1] + tileDimension * row);
			}
			else
			{
				ctx.drawImage(sprites.road, upperLeft[0] + tileDimension * col, upperLeft[1] + tileDimension * row);
			}
		}
	}
}

function drawMinimap(width, height, x, y)
{
	var upperLeft = [window.innerWidth - width, 0];
	ctx.fillStyle = ('#ffffff');
	ctx.globalAlpha = 0.2;
    ctx.fillRect(upperLeft[0], upperLeft[1], width, height);
    ctx.globalAlpha = 1.0;
	ctx.fillStyle = ('#000000');
	ctx.strokeStyle = ('#000000');
	ctx.lineWidth = 2;
    ctx.strokeRect(upperLeft[0], upperLeft[1], width, height);
	
	for(var row = 0; row < height; row++)
	{
		for(var col = 0; col < width; col++)
		{
			if(getTileAt(x + col - Math.floor(width / 2), y + row - Math.floor(height / 2))) ctx.fillRect(upperLeft[0] + col, upperLeft[1] + row, 1, 1);
		}
	}
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
	if(e.which == 38) arrowsDown[0] = true;
	if(e.which == 40) arrowsDown[1] = true;
	if(e.which == 37) arrowsDown[2] = true;
	if(e.which == 39) arrowsDown[3] = true;
}

window.onkeyup = function(e)
{
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
	get road() { return document.getElementById("road"); }
}

function grass(string) { return document.getElementById("grass" + string); }
function dirt(string) { return document.getElementById("dirt" + string); }

const sprites = new Sprites();

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();