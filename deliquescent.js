'use strict';
//Deliquescent
//the hanhanhan version
//A fork of:
//http://codepen.io/tmrDevelops/pen/OPZKNd
//Tiffany Rayside

(function deliquescentAgain(){

//canvas
var canvas = document.getElementById('canv');
var context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var xShiftArray = [];

 //y height (canvas height)
const w = 15; //grid sq width
const h = 15; //grid sq height

var rows = canvas.height/w; //number of rows
var columns = canvas.width/w; //number of columns

const K_pullX = 0.015; //X axis pull scaling constant - multiplier for difference between neighbors and pulled point
const K_decayX = 0.03; //X axis decay
const K_pullY = 0.015; //Y axis pull - multiplier for difference between neighbors and pulled point
const K_decayY = 0.03; //Y axis decay

var parts; //particles aka grid intersections
var colorCycle = 0; //color offset which gets incremented with time
var mouseX = 0; //mouse x
var mouseY = 0; //mouse y
var mouseDown = false; //mouse down flag
var radius = 50; // radius of influence for mouse click
var displacementMax = 1;

var Part = function() {
  this.x = 0; //x position
  this.y = 0; //y position
  this.xShift = 0; //velocity x / how much to move x
  this.yShift = 0; //velocity y / how much to move y
  this.ind_x = 0; //index x (left to right)
  this.ind_y = 0; //index y (top to bottom)
  this.displacement = 0; //distance from resting position
  this.off_dx = 0; //distance along x axis from resting position
  this.off_dy = 0; //distance along y axis from resting position
};

Part.prototype.frame = function frame() {

  // //pin edges for stability
  // if (this.ind_x == 0 || this.ind_x == columns - 1 || this.ind_y == 0 || this.ind_y == rows - 1)
  //   this.x = this.ind_x * w;
  //   this.y = this.ind_y * h;
  //   return;
  // }

  //off_dx, off_dy = offset distance x, y
  var off_dx = this.ind_x * w - this.x;
  var off_dy = this.ind_y * h - this.y;

  this.off_dx = off_dx;
  this.off_dy = off_dy;
  this.displacement = Math.sqrt(off_dx * off_dx + off_dy * off_dy);

  var xPull = 0;
  var yPull = 0;

  // using this as the starting value instead (like Tiffany did)
  // makes everything a little "snappier", increases displacement
  // var xPull = off_dx;
  // var yPull = off_dy;

  // Vector math
  // Net position from each neighbor (left, right, up, down)
  // with the current position of the particle/grid intersection
  xPull +=  parts[this.ind_x - 1][this.ind_y].x - this.x;
  yPull +=  parts[this.ind_x - 1][this.ind_y].y - this.y;

  xPull +=  parts[this.ind_x + 1][this.ind_y].x - this.x;
  yPull +=  parts[this.ind_x + 1][this.ind_y].y - this.y;

  xPull +=  parts[this.ind_x][this.ind_y - 1].x - this.x;
  yPull +=  parts[this.ind_x][this.ind_y - 1].y - this.y;

  xPull +=  parts[this.ind_x][this.ind_y + 1].x - this.x;
  yPull +=  parts[this.ind_x][this.ind_y + 1].y - this.y;

  //scaling constant * net pull - decaying damping
  this.xShift += K_pullX * xPull - K_decayX * this.xShift;
  this.yShift += K_pullY * yPull - K_decayY * this.yShift;

  // move the particle!
  this.x += this.xShift;
  this.y += this.yShift;

  // user adds "pull"
  if (mouseDown) {
    var dx = this.x - mouseX;
    var dy = this.y - mouseY;
    var clickDistance = Math.sqrt(dx * dx + dy * dy);

    //if the mouse click is within 50 pixel radius
    if (clickDistance < radius) {
      // if mouse click is less than 10 pixels away, boost value to 10;
      clickDistance = clickDistance < 10 ? 10 : clickDistance;
      // move the point by a value proportional to inverse of distance from click
      // try flipping the "-" to a "+"
      this.x -= 5 * dx / clickDistance;
      this.y -= 5 * dy / clickDistance;
    }
  }
};

Part.prototype.displacementStyle = function displacementStyle(){
  // set the hue, saturation, lightness, alpha, and line weight
  // based on displacement from resting position
  // and scaled by the maximum displacement of any point on the grid
  // at the time

  //note: displacement is always positive,
  //off_dx and off_dy are positive and negative

  //hue is offset by a cycling color, in a 120 deg window normalized by % mxPull displacement (color)
  var hue = (colorCycle + 120 * this.displacement / displacementMax) % 360;


  var saturation_offset = 40; // minimum saturation
  var saturation = saturation_offset + this.displacement / displacementMax;
  saturation = saturation > 40 ? 40 : saturation; // maximum saturation
  saturation = saturation > 90 ? 90 : saturation; // maximum saturation
  saturation = saturation + "%";

  var lightness_offset = 60;
  var lightness = lightness_offset + this.off_dy / displacementMax;
  lightness = lightness > 80 ? 80 : lightness; // maximum lightness
  lightness = lightness < 40 ? 40 : lightness; // minimum lightness
  lightness = lightness + "%";

  var alpha_offset = 0.6;
  var alpha = alpha_offset + this.off_dx;
  alpha = alpha > 0.5 ? 0.5 : alpha; // maximum alpha
  alpha = alpha < 0.2 ? 0.2 : alpha; // minimum alpha

  // using ES 6 template literals to make a string with variables
  context.strokeStyle = `hsla(${hue}, ${saturation}, ${lightness}, ${alpha})`;
  // string with variables in it the old-fashioned (and better supported) way
  // context.fillStyle = 'hsla(' + hue + ',' + saturation + ', ' + lightness + ', ' + alpha +')';
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
  // these commented lines are fun to play with -- change drawing patterns
  // var pAcross = parts[i][j + 1]; //across row
  // var pDown = parts[i + 1][j]; //down column

  // context.moveTo(p.x, p.y);
  // context.lineTo(pAcross.x, pAcross.y);
  // context.moveTo(p.x, p.y);
  // context.lineTo(pDown.x, pDown.y);
  // var pUp = parts[i][j - 1];
  var pDownRight = parts[i + 1][j + 1];
  var pDownLeft = parts[i - 1][j + 1];

  // context.moveTo(p.x, p.y);
  // context.lineTo(pUp.x, pUp.y);
  context.moveTo(p.x, p.y);
  context.lineTo(pDownRight.x, pDownRight.y);
  context.moveTo(p.x, p.y);
  context.lineTo(pDownLeft.x, pDownLeft.y);
  // context.arc(p.x, p.y, 7, 0, 2 * Math.PI)
}

// function resize() {
//   canvas.width = window.innerWidth;
//   canvas.height = window.innerHeight;
// }

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
};

  function run() {
    //wipe canvas
    context.fillStyle = "hsla(0, 5%, 5%, .1)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    colorCycle -= 1;
    displacementMax = 0;
    //looping through array of points
    for (var i = 1; i < columns - 1; i++) {
      for (var j = 1; j < rows - 1; j++) {
        var p = parts[i][j];
        context.beginPath();
        p.frame();
        p.displacementStyle();
        draw(i,j);
        context.stroke();
        context.fill()
        // keep track of the largest displacement
        // for hue/saturation/value styling
        displacementMax = displacementMax > p.displacement ? displacementMax : p.displacement;
        displacementMax = displacementMax > 1 ? displacementMax : 1;
        if (i == 10 && j == 10) {
          xShiftArray.push(p.xShift)
        }
      }
      displacementMax = displacementMax;
    }
    window.requestAnimationFrame(run);
  }

})();
