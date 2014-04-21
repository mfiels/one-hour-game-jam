var stage = new createjs.Stage('canvas');

var WIDTH = 500;
var HEIGHT = 500;
var DELTA_V = 0.10;

var maxV = 0.25;
var isMouseDown = false;
var mouseDownAt = {x: 0, y: 0};
var mouseDownCircle = null;
var mouseAt = {x: 0, y: 0};

var circles = [];
var colors = [
  'red', 'green', 'blue', 'yellow', 'pink', 'orange', 'cyan', 'violet', 'darkslategray'
];

var matches = 0;

function makeCircle(color) {
  var circle = new createjs.Shape();
  circle.graphics.beginFill(color).drawCircle(0, 0, 0.5);
  var randomX = Math.random() * WIDTH;
  var randomY = Math.random() * HEIGHT;
  var randomVx = Math.random() * maxV;
  var randomVy = Math.random() * maxV;
  circle.x = randomX;
  circle.y = randomY;
  circle.vx = randomVx;
  circle.vy = randomVy;
  createjs.Tween.get(circle).to({scaleX: 50.0, scaleY: 50.0}, 1000);
  stage.addChild(circle);
  circles.push(circle);
  circle.color = color;
  return circle;
}

function addCirclePair() {
  var randomColor = colors[Math.floor(Math.random() * colors.length)];
  var circle1 = makeCircle(randomColor);
  var circle2 = makeCircle(randomColor);
}

function findCircleUnder(x, y) {
  var matches = [];
  for (var i = 0; i < circles.length; i++) {
    var c = circles[i];
    var d = Math.sqrt(Math.pow(c.x - x, 2.0) + Math.pow(c.y - y, 2.0));
    if (d <= c.scaleX / 2.0) {
      matches.push(c);
    }
  }
  return matches;
}

function matched(c1, c2) {
  createjs.Tween.get(c1).to({scaleX: 0.0, scaleY: 0.0}, 300).call(function() {
    stage.removeChild(c1);
  });
  createjs.Tween.get(c2).to({scaleX: 0.0, scaleY: 0.0}, 300).call(function() {
    stage.removeChild(c2);
  });
  circles.splice(circles.indexOf(c1), 1);
  circles.splice(circles.indexOf(c2), 1);

  matches++;

  updateCircles();
}

function updateCircles() {
  var circlesNeeded = numberOfPairs(matches) * 2;
  while (circles.length < circlesNeeded) {
    addCirclePair();
    maxV += DELTA_V;
  }

}

function numberOfPairs(matches) {
  if (matches < 2) {
    return 1;
  } else if (matches < 10) {
    return matches;
  } else {
    return Math.floor(matches * 4 / 3);
  }
}

var lineLayer = new createjs.Shape();
var lineColor = 'white';
stage.addChild(lineLayer);
updateCircles();

function mousedown(e) {
  isMouseDown = true;
  mouseDownAt.x = e.stageX;
  mouseDownAt.y = e.stageY;
  mouseAt.x = e.stageX;
  mouseAt.y = e.stageY;
  var c = findCircleUnder(mouseDownAt.x, mouseDownAt.y);
  lineColor = c.length > 0 ? c[0].color : 'white';
  if (c.length > 0) {
    mouseDownCircle = c[0];
  }
}

function mouseup(e) {
  isMouseDown = false;
  mouseDownCircle = null;
  lineLayer.graphics.clear();
  var c1 = findCircleUnder(mouseDownAt.x, mouseDownAt.y);
  var c2 = findCircleUnder(e.stageX, e.stageY);
  if (c1.length > 0 && c2.length > 0) {
    for (var i = 0; i < c1.length; i++) {
      for (var j = 0; j < c2.length; j++) {
        if (c1[i].color == c2[j].color && c1[i] != c2[j]) {
          matched(c1[i], c2[j]);
          return;
        }
      }
    }
  }
}

function mousemove(e) {
  if (isMouseDown) {
    mouseAt.x = e.stageX;
    mouseAt.y = e.stageY;
  }
}

function update() {
  if (isMouseDown) {
    if (mouseDownCircle) {
      mouseDownAt.x = mouseDownCircle.x;
      mouseDownAt.y = mouseDownCircle.y;
      lineLayer.graphics.clear();
    }
    lineLayer.graphics.beginStroke(lineColor);
    lineLayer.graphics.moveTo(mouseDownAt.x, mouseDownAt.y);
    lineLayer.graphics.lineTo(mouseAt.x, mouseAt.y);
    lineLayer.graphics.endStroke();
  }

  for (var i = 0; i < circles.length; i++) {
    var c = circles[i];
    var hw = c.scaleX / 2.0;
    var hh = c.scaleY / 2.0;

    c.x += c.vx;
    c.y += c.vy;

    if (c.x - hw < 0) { c.x = hw; c.vx *= -1.0; }
    if (c.y - hh < 0) { c.y = hh; c.vy *= -1.0; }
    if (c.x + hw > WIDTH) { c.x = WIDTH - hw; c.vx *= -1.0; }
    if (c.y + hh> HEIGHT) { c.y = HEIGHT - hh; c.vy *= -1.0; }
  }

  stage.update();
}

stage.addEventListener('stagemousedown', mousedown);
stage.addEventListener('stagemouseup', mouseup);
stage.addEventListener('stagemousemove', mousemove);
createjs.Ticker.setFPS(60);
createjs.Ticker.addEventListener('tick', update);
