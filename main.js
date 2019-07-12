var tileDimension = 32;

var playerCoord = [762, 1249];
var tileWindowWidth = Math.ceil(window.innerWidth / tileDimension) + 2;
var tileWindowHeight = Math.ceil(window.innerHeight / tileDimension) + 2;

var c;
var ctx;

function startGame()
{
  c = document.getElementById('canvas');
  ctx = c.getContext("2d");
  ctx.canvas.width  = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  window.setInterval(function () {
    drawMapAt(playerCoord[0], playerCoord[1], 0, 0);
  }, 16);
}


function drawMapAt(x, y, offsetX, offsetY)
{
  ctx.fillStyle = '#007700';
  var upperLeft = [-tileDimension + offsetX, -tileDimension + offsetY];
  for(var row = 0; row < tileWindowHeight; row++)
  {
    for(var col = 0; col < tileWindowWidth; col++)
    {
      if(!getTileAt(playerCoord[0] - Math.floor(tileWindowWidth / 2) + col, playerCoord[1] - Math.floor(tileWindowHeight / 2) + row))
      {
        ctx.fillRect(upperLeft[0] + tileDimension * col, upperLeft[1] + tileDimension * row, tileDimension, tileDimension);
      }
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
