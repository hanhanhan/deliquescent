//http://codepen.io/tmrDevelops/pen/OPZKNd
//Tiffany Rayside
//Deliquescent
//modified by hanhanhan

window.requestAnimFrame = (function(callback) {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

const gnum = 60; //num grids / frame
const _x = 2265; //x width (canvas width)
const _y = 1465; //y height (canvas height)
const w = _x / gnum; //grid sq width
const h = _y / gnum; //grid sq height

const P = 0.01; //Multiplier for offset between resting position and pulled point
const n = 0.98; //n value for later
const n_vel = 0.02; //velocity
const C = 5; //Multiplier for color style as function of displacement

var parts; //particles 
var ŭ = 0; //color update
var mouseX = 0; //mouse x
var mouseY = 0; //mouse y
var mouseDown = false; //mouse down flag
//canvas
var canvas = document.getElementById('canv');
var context = canvas.getContext('2d');

var Part = function() {
  this.x = 0; //x pos
  this.y = 0; //y pos
  this.vx = 0; //velocity x
  this.vy = 0; //velocity y
  this.ind_x = 0; //index x
  this.ind_y = 0; //index y
  this.displacement = 0;
};

Part.prototype.frame = function frame() {

  if (this.ind_x == 0 || this.ind_x == gnum - 1 || this.ind_y == 0 || this.ind_y == gnum - 1) {
    //pin edges for stability
    this.x = this.ind_x * w;
    this.y = this.ind_y * h;  
    return;
  }

  //off_dx, off_dy = offset distance x, y
  var off_dx = this.ind_x * w - this.x;
  var off_dy = this.ind_y * h - this.y;
  this.displacement = Math.sqrt(off_dx * off_dx + off_dy * off_dy);

  var ax = 0;
  var ay = 0;

  ax -= this.x - parts[this.ind_x - 1][this.ind_y].x;
  ay -= this.y - parts[this.ind_x - 1][this.ind_y].y;

  ax -= this.x - parts[this.ind_x + 1][this.ind_y].x;
  ay -= this.y - parts[this.ind_x + 1][this.ind_y].y;

  ax -= this.x - parts[this.ind_x][this.ind_y - 1].x;
  ay -= this.y - parts[this.ind_x][this.ind_y - 1].y;

  ax -= this.x - parts[this.ind_x][this.ind_y + 1].x;
  ay -= this.y - parts[this.ind_x][this.ind_y + 1].y;

  //decaying damping
  this.vx += P * ax - this.vx * n_vel;
  this.vy += P * ay - this.vy * n_vel;

  this.x += this.vx * n;
  this.y += this.vy * n;

  if (mouseDown) {
    var dx = this.x - mouseX;
    var dy = this.y - mouseY;
    var ɋ = Math.sqrt(dx * dx + dy * dy);
    if (ɋ < 50) {
      ɋ = ɋ < 10 ? 10 : ɋ;
      this.x -= dx / ɋ * 5;
      this.y -= dy / ɋ * 5;
    }
  }
};

Part.prototype.displacementStyle = function displacementStyle(){
  var hue = ŭ + C * this.displacement;
  var alpha_offset = 0.5;
  var alpha = alpha_offset + C * this.displacement * this.displacement;
  alpha = alpha > 1 ? 1 : alpha;

  context.strokeStyle = 'hsla(' + hue + ', 100%, 80%, ' + alpha +')';
  context.lineWidth = 1 + this.displacement * 0.05;
  context.beginPath();
}

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
  }

//draw grid function
function draw(i,j) {
  var p1 = parts[i][j];
  var p2 = parts[i][j + 1]; //across row
  var p3 = parts[i + 1][j + 1];
  var p4 = parts[i + 1][j]; //down column

  context.moveTo(p1.x, p1.y);
  context.lineTo(p2.x, p2.y); //line to right
  context.moveTo(p1.x, p1.y);
  context.lineTo(p4.x, p4.y); //line down

  // if (p1.ind_x == gnum - 2) {
  //   context.moveTo(p3.x, p3.y); //bottom right
  //   context.lineTo(p4.x, p4.y); //to left
  // }
  // if (p1.ind_y == gnum - 2) {
  //   context.moveTo(p3.x, p3.y); //bottom right
  //   context.lineTo(p2.x, p2.y); // to up
  // }  
}



function resize() {
  if (canvas.width < window.innerWidth) {
    canvas.width = window.innerWidth;
  }

  if (canvas.height < window.innerHeight) {
    canvas.height = window.innerHeight;
  }
}

//mouse
canvas.onmousedown = () => mouseDown = true;
canvas.onmouseup = () => mouseDown = false;

canvas.onmousemove = function MSMV(e) {
  var rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
}

initializeArray();

window.onload = function() {
  run();

  function run() {
    //wipe canvas
    context.fillStyle = "hsla(0, 5%, 5%, .1)";
    context.fillRect(0, 0, _x, _y);
    ŭ -= 0.5;

    //looping through array of points
    for (var i = 0; i < gnum - 1; i++) {
      for (var j = 0; j < gnum - 1; j++) {
        var p = parts[i][j];
        p
        context.beginPath();
        p.frame();
        p.displacementStyle();
        draw(i,j);
        context.stroke();
      }
    }
 //   context.stroke();
    window.requestAnimFrame(run);
  }
  resize();
};