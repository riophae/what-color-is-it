var ready = false;

function $(selector) {
  return document.querySelector(selector);
}

function copy(str) {
    var $sandbox = $('#sandbox');

    str = str + '';

    $sandbox.value          = str;
    $sandbox.selectionStart = 0;
    $sandbox.selectionEnd   = str.length;

    document.execCommand('copy');
    $sandbox.value = '';
    $sandbox.blur();
}

function setBaseSize() {
  var base_size = Math.floor(Math.min(innerHeight, innerWidth) * .2) + 'px';
  $('html').style.fontSize = base_size;
  $('body').style.fontSize = base_size;
}

function getTime() {
  var now = new Date;
  return {
     h: now.getHours(),
     m: now.getMinutes(),
     s: now.getSeconds()
  };
}

function fixTime(time) {
  if (time.h < 10) {
    time.h = '0' + time.h;
  }
  if (time.m < 10) {
    time.m = '0' + time.m;
  }
  if (time.s < 10) {
    time.s = '0' + time.s;
  }
  return time;
}

function doTimer() {
  setTime(getTime());
  setTimeout(doTimer, 1000);
}

function startTimer() {
  ready = true;
  $('body').style.transition = 'all 0.8s';
  doTimer();
}

function getHexColor(time) {
  return '#' + time.h + time.m + time.s;
}

function getHSLColor(hsl) {
  return 'hsl(' + hsl.h + ', ' + hsl.s +
    '%, ' + hsl.l + '%)';
}

function time2HSL(time) {
  return getHSLColor(new colz.Color(getHexColor(time)));
}

function setTime(time, bg_color) {
  fixTime(time);
  var hex = getHexColor(time);

  $('#hour').textContent    = time.h;
  $('#minute').textContent  = time.m;
  $('#second').textContent  = time.s;

  $('body').style.background = bg_color || hex;

  time.s = time.s + '';
  if (ready && time.s) {
    if (time.s.match(/0$/)) {
      $('h1').setAttribute('data-show-time', 'true');
    }
    else if (time.s.match(/5$/)) {
      $('h1').setAttribute('data-show-time', 'false');
    }
  }

  console.log(bg_color || time2HSL(getTime()));
}

function compute(total, base, percent, do_floor) {
  var fixNumber = do_floor ? Math.floor : function(x) { return x; };
  return fixNumber((total - base) * percent) + base;
}

function compute2(total, base, percent) {
  return (total - base) * percent + base;
}

function init() {
  function getTimeMoreFrequently() {
    time      = getTime();
    hex       = getHexColor(time);
    color     = new colz.Color(hex);
    h         = color.h;
    s         = color.s;
    l         = color.l;
  }

  var time,
      hex,
      color,
      h,
      s,
      l,
      duration  = 800,
      fps       = 60,
      frames    = duration / (1000 / fps),
      i         = frames,
      total
  ;

  total = {
    h: 24,
    m: 60,
    s: 60
  };

  //console.log('start', time2HSL(time))

  setBaseSize();

  var stage = .5;

  do {
    (function(i) {
      var progress = i / frames;
      if (Math.abs(progress - stage) >= .1) {
        stage = progress;
        getTimeMoreFrequently();
      }

      setTimeout(function() {
        var
          temp    = { },
          hsl     = { }
        ;

        for (var key in time) {
          if (! time.hasOwnProperty(key))
            continue;
          temp[key] = compute(total[key], time[key], 1 - progress, true);
        }

        hsl.h = h;
        hsl.s = compute(100, s, 1 - progress) * .8;
        hsl.l = compute(100, l, 1 - progress) * .8;

        hsl = getHSLColor(hsl);

        setTime(temp, hsl);
      }, duration * progress);
    })(i);
  } while (--i);

  var animation_running = false;

  $('h1').onclick = function(e) {
    var
      time = fixTime(getTime()),
      str  = [ parseInt(time.h, 10), ':', time.m, ':', time.s ].join(''),
      $tip = $('#tip')
    ;

    copy(str);

    if (animation_running) return;
    animation_running = true;

    $tip.style.display = 'block';

    setTimeout(function() {
      $tip.classList.add('fadeOut');
 
      setTimeout(function() {
        $tip.style.display = '';
        $tip.classList.remove('fadeOut');
        animation_running = false;
      }, 800);
    }, 800 + 1500);
  }

  setTimeout(startTimer, duration);
}

addEventListener('resize', setBaseSize);
addEventListener('DOMContentLoaded', init);