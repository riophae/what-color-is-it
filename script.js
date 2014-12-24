var
  ready = false,
  timeout
;

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
  var fixed_time = { };
  [ 'h', 'm', 's' ].forEach(function(x) {
    fixed_time[x] = +time[x];
    if (fixed_time[x] < 10) {
      fixed_time[x] = '0' + fixed_time[x];
    }
    fixed_time[x] += '';
  });
  return fixed_time;
}

function doTimer() {
  setTime(getTime());
  timeout = setTimeout(doTimer, 1000);
}

function stopTimer() {
  clearTimeout(timeout);
}

function startTimer() {
  ready = true;
  $('body').style.transition = 'all 0.8s';
  doTimer();
}

function getHexColor(fixed_time) {
  return '#' + fixed_time.h + fixed_time.m + fixed_time.s;
}

function getHSLColor(hsl) {
  return 'hsl(' + hsl.h + ', ' + hsl.s +
    '%, ' + hsl.l + '%)';
}

function time2HSL(time) {
  return getHSLColor(new colz.Color(getHexColor(fixTime(time))));
}

function setTime(time, bg_color) {
  var
    fixed_time = fixTime(time),
    hex        = getHexColor(fixed_time)
  ;

  $('#hour').textContent    = fixed_time.h;
  $('#minute').textContent  = fixed_time.m;
  $('#second').textContent  = fixed_time.s;

  $('body').style.background = bg_color || hex;

  if (ready && fixed_time.s) {
    if (fixed_time.s.match(/0$/)) {
      $('h1').setAttribute('data-show-time', 'true');
    }
    else if (fixed_time.s.match(/5$/)) {
      $('h1').setAttribute('data-show-time', 'false');
    }
  }

  //console.log(bg_color || time2HSL(getTime()));
}

function compute(total, base, percent) {
  return (total - base) * percent + base;
}

function init() {
  function getTimeAndColor() {
    time       = getTime();
    fixed_time = fixTime(time),
    hex        = getHexColor(fixed_time);
    color      = new colz.Color(hex);
    h          = color.h;
    s          = color.s;
    l          = color.l;
  }

  var
    time,
    fixed_time,
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

  getTimeAndColor();

  //console.log('start', time2HSL(time))

  setBaseSize();

  var stage = .5;

  do {
    (function(i) {
      var progress = i / frames;
      if (Math.abs(progress - stage) >= .1) {
        stage = progress;
        getTimeAndColor();
      }

      setTimeout(function() {
        var
          temp    = { },
          hsl     = { }
        ;

        for (var key in time) {
          if (! time.hasOwnProperty(key))
            continue;
          temp[key] = Math.floor(compute(total[key], +time[key], 1 - progress));
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
      str  = [ +time.h, ':', time.m, ':', time.s ].join(''),
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