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

var gnum = 90; //num grids / frame
var _x = 2265; //x width (canvas width)
var _y = 1465; //y height (canvas height)
var w = _x / gnum; //grid sq width
var h = _y / gnum; //grid sq height
var parts; //particles 
var P1 = 0.0005; //point one
var P2 = 0.01; //point two
var n = 0.98; //n value for later
var n_vel = 0.02; //velocity
var ŭ = 0; //color update
var msX = 0; //mouse x
var msY = 0; //mouse y
var msdn = false; //mouse down flag
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
};

Part.prototype.frame = function() {

  if (this.ind_x == 0 || this.ind_x == gnum - 1 || this.ind_y == 0 || this.ind_y == gnum - 1) {
    return;
  }

  var ax = 0; //angle x
  var ay = 0; //angle y
  //off_dx, off_dy = offset distance x, y
  var off_dx = this.ind_x * w - this.x;
  var off_dy = this.ind_y * h - this.y;
  ax = P1 * off_dx;
  ay = P1 * off_dy;

  ax -= P2 * (this.x - parts[this.ind_x - 1][this.ind_y].x);
  ay -= P2 * (this.y - parts[this.ind_x - 1][this.ind_y].y);

  ax -= P2 * (this.x - parts[this.ind_x + 1][this.ind_y].x);
  ay -= P2 * (this.y - parts[this.ind_x + 1][this.ind_y].y);

  ax -= P2 * (this.x - parts[this.ind_x][this.ind_y - 1].x);
  ay -= P2 * (this.y - parts[this.ind_x][this.ind_y - 1].y);

  ax -= P2 * (this.x - parts[this.ind_x][this.ind_y + 1].x);
  ay -= P2 * (this.y - parts[this.ind_x][this.ind_y + 1].y);

  this.vx += (ax - this.vx * n_vel);
  this.vy += (ay - this.vy * n_vel);

  this.x += this.vx * n;
  this.y += this.vy * n;
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

function go() {
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
  //move particles function
function mv_part() {
    
  }
  //draw grid function
function draw() {
    context.strokeStyle = "hsla(" + (ŭ % 360) + ",100%,50%,1)";
    context.beginPath();
    ŭ -= .5;
    for (var i = 0; i < gnum - 1; i += 1) {
      for (var j = 0; j < gnum - 1; j += 1) {
        var p1 = parts[i][j];
        var p2 = parts[i][j + 1];
        var p3 = parts[i + 1][j + 1];
        var p4 = parts[i + 1][j];
        draw_each(p1, p2, p3, p4);
      }
    }
    context.stroke();

  }
  //draw each in array
function draw_each(p1, p2, p3, p4) {

    context.moveTo(p1.x, p1.y);
    context.lineTo(p2.x, p2.y);
    context.moveTo(p1.x, p1.y);
    context.lineTo(p4.x, p4.y);

    if (p1.ind_x == gnum - 2) {
      context.moveTo(p3.x, p3.y);
      context.lineTo(p4.x, p4.y);
    }
    if (p1.ind_y == gnum - 2) {
      context.moveTo(p3.x, p3.y);
      context.lineTo(p2.x, p2.y);
    }
  }
  //call functions to run
function calls() {

  }

context.fillStyle = "hsla(0, 5%, 5%, .1)";
context.fillRect(0, 0, _x, _y);

function resize() {
  if (canvas.width < window.innerWidth) {
    canvas.width = window.innerWidth;
  }

  if (canvas.height < window.innerHeight) {
    canvas.height = window.innerHeight;
  }
}


document.addEventListener('mousemove', MSMV, false);
document.addEventListener('mousedown', MSDN, false);
document.addEventListener('mouseup', MSUP, false);

function MSDN(e) {
  msdn = true;
}

function MSUP(e) {
  msdn = false;
}

function MSMV(e) {
  var rect = e.target.getBoundingClientRect();
  msX = e.clientX - rect.left;
  msY = e.clientY - rect.top;
}

go();

window.onload = function() {
  run();

  function run() {
    //wipe canvas
    context.fillStyle = "hsla(0, 5%, 5%, .1)";
    context.fillRect(0, 0, _x, _y);

    context.strokeStyle = "hsla(" + (ŭ % 360) + ",100%,50%,1)";
    context.beginPath();
     ŭ -= .5;
    //looping streamlined
    for (var i = 0; i < gnum - 1; i++) {
      for (var j = 0; j < gnum - 1; j++) {
        //mv_part() function contents
        var p = parts[i][j];
        p.frame();
    
        //draw() function contents
        var p1 = parts[i][j];
        var p2 = parts[i][j + 1];
        var p3 = parts[i + 1][j + 1];
        var p4 = parts[i + 1][j];
        draw_each(p1, p2, p3, p4);
      }
    }
    context.stroke();

    window.requestAnimFrame(run);
  }
  resize();
};