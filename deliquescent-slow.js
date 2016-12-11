//http://codepen.io/tmrDevelops/pen/OPZKNd
//Tiffany Rayside
//Deliquescent
//modified by Hannah

window.requestAnimFrame = (function(callback) {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

var gnum = 90; //num grids / frame
var _x = 2265; //x width (canvas width)
var _y = 1465; //y height (canvas height)
var w = _x / gnum; //grid sq width
var h = _y / gnum; //grid sq height

var parts; //particles 
var P1 = 0.0005; //point one
var P2 = 0.01; //point two
var n = 0.98; //n value for later
var n_vel = 0.02; //damping variable
var C = 8; //color constant
var ŭ = 0; //color update
//Mouse
var msX = 0; //mouse x
var msY = 0; //mouse y
var msdn = false; //mouse down flag
//Canvas
var canvas = document.getElementById('canv');
var context = canvas.getContext('2d');

var Part = function() {
  this.x = 0; //x pos
  this.y = 0; //y pos
  this.vx = 0; //velocity x
  this.vy = 0; //velocity y
  this.ind_x = 0; //index x
  this.ind_y = 0; //index y
  this.offsetX = 0;
  this.offsetY = 0;
  this.color = 'hsla(5, 100%, 100%, 100%)';
};

Part.prototype.pulling = function() {

  if (this.ind_x == 0 || this.ind_x == gnum - 1 || this.ind_y == 0 || this.ind_y == gnum - 1) {
    //adds stability -- my version (not TR's) was bouncing out of control after a bit
    this.x = this.ind_x * w;
    this.y = this.ind_y * h;  
    return;
  }

  //difference between resting position and actual position
  var off_dx = this.ind_x * w - this.x;
  var off_dy = this.ind_y * h - this.y;

  this.offsetX = Math.floor(off_dx);
  this.offsetY = Math.floor(off_dy);

  //I don't these two lines do much.
  var ax = P1 * off_dx; //P1 = 0.0005
  var ay = P1 * off_dy;

  //pulling point to middle of neighbors
  ax -= P2 * (this.x - parts[this.ind_x - 1][this.ind_y].x);
  ay -= P2 * (this.y - parts[this.ind_x - 1][this.ind_y].y);

  ax -= P2 * (this.x - parts[this.ind_x + 1][this.ind_y].x);
  ay -= P2 * (this.y - parts[this.ind_x + 1][this.ind_y].y);

  ax -= P2 * (this.x - parts[this.ind_x][this.ind_y - 1].x);
  ay -= P2 * (this.y - parts[this.ind_x][this.ind_y - 1].y);

  ax -= P2 * (this.x - parts[this.ind_x][this.ind_y + 1].x);
  ay -= P2 * (this.y - parts[this.ind_x][this.ind_y + 1].y);
  //decaying damping
  this.vx += (ax - this.vx * n_vel);
  this.vy += (ay - this.vy * n_vel);

  this.x += this.vx * n;
  this.y += this.vy * n;

  //   var n = 0.98; //n value for later
  // var n_vel = 0.02; //velocity
  //Mouse changing point positions
  if (msdn) {
    var dx = this.x - msX;
    var dy = this.y - msY;
    var ɋ = Math.sqrt(dx * dx + dy * dy);
    if (ɋ < 50) {
      ɋ = ɋ < 10 ? 10 : ɋ;
      this.x -= dx / ɋ * 5;
      this.y -= dy / ɋ * 5;
    }
  }
};

Part.prototype.styling = function(){
  var displacement = Math.sqrt(this.offsetX * this.offsetX + this.offsetY * this.offsetY) % 360 + ŭ; 
  context.strokeStyle = 'hsla(' + displacement * C + ', 100%, 80%, 1)';
  //var weight = 
  context.lineWidth = (displacement < 100) ? displacement * 0.02 + 1 : 3;
}

//draw grid function
function draw(i, j) {

  var p1 = parts[i][j];
  var p2 = parts[i][j + 1];
  var p4 = parts[i + 1][j];

  context.moveTo(p1.x, p1.y);
  context.lineTo(p2.x, p2.y); //draw down
  context.moveTo(p1.x, p1.y);
  context.lineTo(p4.x, p4.y); //draw to right
}

function resize() {
  if (canvas.width < window.innerWidth) {
    canvas.width = window.innerWidth;
  }

  if (canvas.height < window.innerHeight) {
    canvas.height = window.innerHeight;
  }
}

//Mouse event handlers
canvas.onmousedown = () => msdn = true;
canvas.onmouseup = () => msdn = false;

canvas.onmousemove = function MSMV(e) {
  var rect = canvas.getBoundingClientRect();
  msX = e.clientX - rect.left;
  msY = e.clientY - rect.top;
}

//Tried as self invoking - got error: 
//deliquescent.js:161 Uncaught TypeError: (intermediate value)(intermediate value)(intermediate value)(intermediate value)(...) is not a function(…)
//function to set up nested array of point constructors
function initializeArray() {
    parts = []; //particle array
    for (var i = 0; i < gnum; i++) {
      parts.push([]);
      for (var j = 0; j < gnum; j++) {
        var p = new Part();
        p.ind_x = i;
        p.ind_y = j;
        p.x = i * w;
        p.y = j * h;
        parts[i][j] = p;
      }
    }
  };

initializeArray();

window.onload = function() {
  run();
  resize();
  function run() {
    //clear canvas
    context.fillStyle = "hsla(0, 5%, 5%, .1)";
    context.fillRect(0, 0, _x, _y);

    //shift color offset over time
    ŭ += 0.5;

    //loop through nested array of point objects
    for (var i = 0; i < gnum - 1; i++) {
      for (var j = 0; j < gnum - 1; j++) {
        var p = parts[i][j];
        p.pulling(); //find new x and y coordinates for point based on neighbors
        context.beginPath();
        p.styling(); //set color and line width based on displacement
        draw(i, j); //draw path of point to neighbors
        context.stroke();
      }
    }
    window.requestAnimFrame(run);
  }
  
};
