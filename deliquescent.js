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

//canvas
var canvas = document.getElementById('canv');
var context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

 //y height (canvas height)
const w = 30; //grid sq width
const h = 30; //grid sq height

var rows = canvas.height/w; //number of rows
var columns = canvas.width/w; //number of columns

const P = 0.01; //Multiplier for offset between resting position and pulled point
const n = 0.98; //n value for later
const n_vel = 0.02; //velocity
const C = 5; //Multiplier for line style as function of displacement

var parts; //particles 
var ŭ = 0; //color update
var mouseX = 0; //mouse x
var mouseY = 0; //mouse y
var mouseDown = false; //mouse down flag

var Part = function() {
  this.x = 0; //x pos
  this.y = 0; //y pos
  this.vx = 0; //velocity x
  this.vy = 0; //velocity y
  this.ind_x = 0; //index x
  this.ind_y = 0; //index y
  this.displacement = 0;
  this.off_dx = 0;
};

Part.prototype.frame = function frame() {

  if (this.ind_x == 0 || this.ind_x == columns - 1 || this.ind_y == 0 || this.ind_y == rows - 1) {
    //pin edges for stability
    this.x = this.ind_x * w;
    this.y = this.ind_y * h;  
    return;
  }

  //off_dx, off_dy = offset distance x, y
  var off_dx = this.ind_x * w - this.x;
  var off_dy = this.ind_y * h - this.y;

  this.off_dx = off_dx;
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
  var alpha_offset = 0.6;
  var alpha = alpha_offset + this.off_dx;
  alpha = alpha > 1 ? 1 : alpha;
  alpha = alpha < 0.2 ? 0.2 : alpha;

  context.strokeStyle = 'hsla(' + hue + ', 100%, 80%, ' + alpha +')';
  context.lineWidth = 1 + this.displacement * 0.03;
  context.beginPath();
}

function initializeArray() {
    parts = []; //particle array
    for (var i = 0; i < columns; i++) {
      parts.push([]);
      for (var j = 0; j < rows; j++) {
        var p = new Part();
        p.ind_x = i;
        p.ind_y = j;
        p.x = i * w;
        p.y = j * h;
        parts[i][j] = p;
      }
    }
  }

//draw grid 
function draw(i,j) {
  var p = parts[i][j];
  var pAcross = parts[i][j + 1]; //across row
  var pDown = parts[i + 1][j]; //down column

  context.moveTo(p.x, p.y);
  context.lineTo(pAcross.x, pAcross.y); 
  context.moveTo(p.x, p.y);
  context.lineTo(pDown.x, pDown.y); 
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

//mouse
canvas.onmousedown = () => mouseDown = true;
canvas.onmouseup = () => mouseDown = false;

canvas.onmousemove = function MSMV(e) {
  var rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
}

window.onresize = resize();

initializeArray();

window.onload = function() {
  run();

  function run() {
    //wipe canvas
    context.fillStyle = "hsla(0, 5%, 5%, .1)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    ŭ -= 0.5;

    //looping through array of points
    for (var i = 0; i < columns - 1; i++) {
      for (var j = 0; j < rows - 1; j++) {
        var p = parts[i][j];
        context.beginPath();
        p.frame();
        p.displacementStyle();
        draw(i,j);
        context.stroke();
      }
    }
    window.requestAnimFrame(run);
  }
};