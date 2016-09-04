$(function() {
  // nav bar shadow appears when scrolled
  $(window).scroll(function() {
    var isScrolled = $(window).scrollTop() != 0;
    if (isScrolled) {
      $('ul.nav').addClass('scrolled');
      $('ul.dropdown').addClass('scrolled');
    } else {
      $('ul.nav').removeClass('scrolled');
      $('ul.dropdown').removeClass('scrolled');
    }
  });

  // expand clickable area of nav menu 'a's to the entire 'li'
  var aAndLiPairs = zip($('li a.content-link'), $('li'));
  $.each(aAndLiPairs, function(idx, val) {
    var $a = $(val.first);
    var $li = $(val.second);
    $li.mouseover(function() {
      $li.addClass('focused');
    }).mouseout(function() {
      $li.removeClass('focused');
    });
    // handle click in 'li'
    $a.click(function(e) { e.preventDefault(); });
    $li.click(function() { loadContent($a.attr('href')); });
  });

  // setup projects drop-down menu
  $('li#projects').mouseover(function() {
    $('#projects-menu').addClass('expanded');
  }).mouseout(function() {
    $('#projects-menu').removeClass('expanded');
  });

  // load fragment
  var hash = 'home';
  if (window.location.hash) {
    hash = window.location.hash.substring(1);
  }
  loadContent(hash + '.html');
});

// for projects dropdown menu
var projectHrefs = ['diabeto.html', 'another-bus-app.html', 'gol.html', 'open-gl.html'];

function loadContent(href) {
  var $mainContent = $('#main-content');
  $mainContent.fadeOut(300, function() {
    $mainContent.hide().load(href, function() {
      $mainContent.fadeIn(300);
      // might be a project
      setupThumbs();
      // set hash
      window.location.hash = href.split('.')[0];
    });
  });
}

function setupThumbs() {
  // setup images and accompanying text to respond to mouseover/out
  var imgAndTxtPairs = zip($('div.container img'), $('div.container div.container-text'));
  $.each(imgAndTxtPairs, function(idx, val) {
    var $img = $(val.first);
    var $txt = $(val.second);
    $txt.mouseover(function() {
      // image blurs out, txt appears over the top
      $img.addClass('unfocused');
      $txt.addClass('focused');
    }).mouseout(function() {
      // image re-focuses, txt disappears
      $img.removeClass('unfocused');
      $txt.removeClass('focused');
    });
  });
}

function zip(a1, a2) {
  var len = Math.min(a1.length, a2.length);
  var res = new Array(len);
  for (i = 0; i < len; i++) {
    res[i] = {
      first: a1[i],
      second: a2[i]
    };
  }
  return res;
}
