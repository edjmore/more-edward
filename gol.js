$(function() {
  var $canvas = $('#gol-canvas');
  var canvas = document.getElementById('gol-canvas');
  var ctx = canvas.getContext('2d');

  var isPaused = false;

  var gol = null;
  resizeGOL();
  $(window).resize(function() { resizeGOL(); });

  function resizeGOL() {
    // size to fill width and maintain window aspect ratio
    var winRatio = $(window).height() / $(window).width();
    canvas.width = $('#main-content').width();
    canvas.height = canvas.width * winRatio;

    // re-init GOL
    var w = $(window).width() < 768 ? 42 : 100;
    gol = new GOL(w, Math.floor(w * winRatio));
    gol.init(0.13, '#ffffff');

    // re-position control menu
    var $controlMenu = $('#gol-control-menu');
    var top = $canvas.position().top;
    $controlMenu.css('top', top);
  }

  canvas.addEventListener('click', function(event) {
    if (isPaused) return;
    var pos = getClickPos($canvas, event);
    var i = Math.floor(pos.x / $canvas.width() * gol.width);
    var j = Math.floor(pos.y / $canvas.height() * gol.height);
    gol.spawnGlider(i, j, randomColor());
  }, false);

  function getClickPos($canvas, event) {
    return {
      x: event.pageX - $canvas.position().left,
      y: event.pageY - $canvas.position().top
    };
  }

  function randomColor() {
    return '#' + (Math.random() * 0xffffff << 0).toString(16);
  }

  /* re-positioning the control menu in the top-left corner */

  // we wait for mouseover on canvas b/c we need to be sure that all 
  // elements have been properly sized before we calculate control menu position
  $canvas.mouseover(function() {
    var $controlMenu = $('#gol-control-menu');
    var top = $canvas.position().top;
    $controlMenu.css('top', top);
    $controlMenu.addClass('visible');
  }).mouseout(function() {
    var $controlMenu = $('#gol-control-menu');
    $controlMenu.removeClass('visible');
  });

  /* life-cycle handlers */

  var drawSpeed = 100;
  var drawTimer = null;

  function drawLoop() {
    gol.advanceGeneration();
    gol.draw(ctx, $canvas);
    drawTimer = setTimeout(function() { drawLoop(); }, drawSpeed);
  }

  // speed control

  var $golPlayPause = $('#gol-play-pause');
  $golPlayPause.click(function() {
    if ($golPlayPause.hasClass('fa-play')) {
      $golPlayPause.removeClass('fa-play');
      $golPlayPause.addClass('fa-pause');
      drawTimer = setTimeout(function() { drawLoop(); }, drawSpeed);
      isPaused = false;
    } else {
      $golPlayPause.removeClass('fa-pause');
      $golPlayPause.addClass('fa-play');
      clearTimeout(drawTimer);
      isPaused = true;
    }
  });

  var $golSlow = $('#gol-slow');
  var $golFast = $('#gol-fast');

  $golSlow.click(function() {
    if ($(this).hasClass('disabled')) return;
    drawSpeed *= 2;
    if (drawSpeed > 200) {
      $golSlow.addClass('disabled');
    }
    if (drawSpeed >= 50) {
      $golFast.removeClass('disabled');
    }
    flashSpeed();
  });

  $golFast.click(function() {
    if ($(this).hasClass('disabled')) return;
    drawSpeed /= 2;
    if (drawSpeed < 50) {
      $golFast.addClass('disabled');
    }
    if (drawSpeed <= 200) {
      $golSlow.removeClass('disabled');
    }
    flashSpeed();
  });

  function flashSpeed() {
    // first we center the speed indicator in the canvas
    var $speedInd = $('#speed-indicator');
    $speedInd.css('left', $canvas.position().left + $canvas.width() / 2 - $speedInd.width() / 2);
    $speedInd.css('top', $canvas.position().top + $canvas.height() / 2 - $speedInd.height() / 2);
    // set text
    var speedTxt = 100 / drawSpeed + 'x';
    $speedInd.html(speedTxt);
    // fade in and out
    $speedInd.fadeTo(300, .3, function() {
      $(this).delay(600).fadeOut(900);
    });
  }

  // start the draw loop
  drawTimer = setTimeout(function() { drawLoop(); }, drawSpeed);
});

function GOL(width, height) {
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

  this.draw = function(ctx, $canvas) {
    ctx.clearRect(0, 0, $canvas.width(), $canvas.height());
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, $canvas.width(), $canvas.height());
    ctx.fill();

    var cw = $canvas.width() / this.width;
    var ch = $canvas.height() / this.height;
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
}
