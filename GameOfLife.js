function GameOfLife(width, height) {
  this.width = width;
  this.height = height;
  this.currGrid = new Array();
  this.nextGrid = new Array();

  this.init = function(initialChanceOfLife, cellColor) {
    for (var i = 0; i < this.width; i++) {
      this.currGrid[i] = new Array();
      this.nextGrid[i] = new Array();
      for (var j = 0; j < this.height; j++) {
        var isAlive = Math.random() < initialChanceOfLife;
        var newCell = new Cell(isAlive, cellColor);
        this.currGrid[i][j] = newCell;
      }
    }
  }

  this.advanceGeneration = function() {
    for (var i = 0; i < this.width; i++) {
      for (var j = 0; j < this.height; j++) {
        var aliveCount = 0;
        var colors = new Array();
        for (var ii = i - 1; ii <= i + 1; ii++) {
          if (ii < 0 || ii >= this.width) continue;
          for (var jj = j - 1; jj <= j + 1; jj++) {
            if (jj < 0 || jj >= this.height || (ii == i && jj == j)) continue;
            var neighborCell = this.currGrid[ii][jj];
            if (neighborCell && neighborCell.isAlive) {
              aliveCount++;
              colors.push(neighborCell.color);
            }
          }
        }
        var cell = this.currGrid[i][j];
        var nextIsAlive = false;
        if (cell && cell.isAlive) {
          if (aliveCount < 2 || aliveCount > 3) nextIsAlive = false;
          else nextIsAlive = true;
        } else {
          if (aliveCount == 3) nextIsAlive = true;
          else nextIsAlive = false;
        }
        var nextColor = blendColors(colors);
        this.nextGrid[i][j] = new Cell(nextIsAlive, nextColor);
      }
    }
    var tempGrid = this.currGrid;
    this.currGrid = this.nextGrid;
    this.nextGrid = tempGrid;
  }

  this.draw = function(ctx, canvasWidth, canvasHeight) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.fill();
    var cw = canvasWidth / this.width;
    var ch = canvasHeight / this.height;
    var r = Math.min(cw, ch) / 2;
    for (var i = 0; i < this.width; i++) {
      for (var j = 0; j < this.height; j++) {
        var cell = this.currGrid[i][j];
        if (cell) {
          var x = i * cw + cw / 2;
          var y = j * ch + ch / 2;
          ctx.translate(x, y);
          cell.draw(ctx, r);
          ctx.translate(-x, -y);
        }
      }
    }
  }

  this.spawnGlider = function(i, j, color) {
    this.currGrid[  i  ][  j  ] = new Cell(false, color);
    this.currGrid[i + 1][  j  ] = new Cell(true, color);
    this.currGrid[i + 2][  j  ] = new Cell(false, color);
    this.currGrid[  i  ][j + 1] = new Cell(false, color);
    this.currGrid[i + 1][j + 1] = new Cell(false, color);
    this.currGrid[i + 2][j + 1] = new Cell(true, color);
    this.currGrid[  i  ][j + 2] = new Cell(true, color);
    this.currGrid[i + 1][j + 2] = new Cell(true, color);
    this.currGrid[i + 2][j + 2] = new Cell(true, color);
  }
}

function Cell(isAlive, color) {
  this.isAlive = isAlive;
  this.color = color;

  this.draw = function(ctx, r) {
    if (!this.isAlive) return;
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(0, 0, r, 0, 2 * Math.PI);
    ctx.fill();
  }
}

function blendColors(colors) {
  var blendedNum = 0;
  colors.forEach(function(color) {
    blendedNum += parseInt(color.substr(1), 16);
  });
  var blendedInt = Math.floor(blendedNum / colors.length);
  return '#' + blendedInt.toString(16);
}

function blendColors(colors) {
  var r = 0, g = 0, b = 0;
  colors.forEach(function(color) {
    r += parseInt(color.substr(1, 3), 16);
    g += parseInt(color.substr(3, 5), 16);
    b += parseInt(color.substr(5, 7), 16);
  });
  r = Math.floor(r / colors.length);
  g = Math.floor(g / colors.length);
  b = Math.floor(b / colors.length);
  return '#' + r.toString(16).substr(0, 2) + g.toString(16).substr(0, 2) + b.toString(16).substr(0, 2);
}
