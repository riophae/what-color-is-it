var DEBUG_MODE = false;

var
  timeout,
  ready             = false,
  switch_tab_ext_id = 'njifpcdmmfnogilppbhohhndcijflccj',
  switch_tab_ext_js = 'chrome-extension://' + switch_tab_ext_id + '/shortcut.js'
;

function log() {
  if (DEBUG_MODE === true) {
    console.log.apply(console, arguments);
  }
}

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
     s: now.getSeconds(),
     ms: now.getMilliseconds()
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
    var change_easing_function = true;

    if (fixed_time.s.match(/0$/)) {
      $('h1').setAttribute('data-show-time', 'true');
    }
    else if (fixed_time.s.match(/5$/)) {
      $('h1').setAttribute('data-show-time', 'false');
    }
    else {
      change_easing_function = false;
    }

    if (change_easing_function) {
      $('h1').classList.add('new-easing-function');
    }
  }

  log(bg_color || time2HSL(getTime()));
}

function compute(total, base, percent) {
  return (total - base) * percent + base;
}

function initSwitchTabSupport() {
  function postMessage(msg, callback) {
    callback = callback || function() { };
    chrome.runtime.sendMessage(switch_tab_ext_id, msg, callback);
  }

  postMessage('ask for command list', function(command_list) {
    var script = document.createElement('script');
    script.src = switch_tab_ext_js;
    document.head.appendChild(script);

    script.onload = function(e) {
      command_list.forEach(function(item) {
        shortcut.add(item.key, function() {
          postMessage(item.command);
        });
      });
    }
  });
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
    DURATION = 800,
    fps      = 60,
    frames   = DURATION / (1000 / fps),
    i        = frames,
    total
  ;

  total = {
    h: 24,
    m: 60,
    s: 60
  };

  getTimeAndColor();

  log('start', time2HSL(time))

  setBaseSize();

  do {
    (function(i) {
      var progress = i / frames;

      setTimeout(function() {
        var
          temp = { },
          hsl  = { }
        ;

        getTimeAndColor();

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
      }, DURATION * progress);
    })(i);
  } while (--i);

  var animation_running = false;

  $('h1').onclick = function(e) {
    var
      time = fixTime(getTime()),
      hex  = getHexColor(time),
      str  = [ +time.h, ':', time.m, ':', time.s ].join(''),
      $tip = $('#tip')
    ;

    if ($('h1').getAttribute('data-show-time') == 'true') {
      copy(str);
      $tip.textContent = 'Time copied.';
    }
    else {
      copy(hex);
      $tip.textContent = 'Color copied.';
    }

    if (animation_running) return;
    animation_running = true;

    $tip.style.display = 'block';

    setTimeout(function() {
      $tip.classList.add('fadeOut');

      setTimeout(function() {
        $tip.style.display = '';
        $tip.classList.remove('fadeOut');
        animation_running = false;
      }, 600);
    }, 600 + 1500);
  }

  setTimeout(startTimer, DURATION);
  initSwitchTabSupport();
}

addEventListener('resize', setBaseSize);
addEventListener('DOMContentLoaded', init);
