'use strict'

// Depend
var config = require('../config1');
var show = require('./led');
var request = require('request');

var gpio = require('onoff').Gpio;

// // GPIO
var Led1 = new gpio(config.pin1, 'out');
var Led2 = new gpio(config.pin2, 'out');

// Begin of Test without Raspberry Pi
// var Led1 = show.fakeLed("GPIO 17");
// var Led2 = show.fakeLed("GPIO 27");
// End of Test without Raspberry Pi

var leds = [Led1, Led2];

// Global var
var debug = (process.env.DEBUG === 'true' ? true : false) || false;
var time = config.duree;
var counter = config.decompte;
var launch = false;
var inter = null;
var save = {
  total: 0,
  onb: 0,
  grp: 0
};

function deterDiff(data, key) {
  console.log(save, data, key);
  if (data[key] > save[key]) {
    return data[key] - save[key];
  } else if (data[key] < save[key]) {
    return save[key] - data[key];
  } else {
    return 0;
  }
}

function setLed(data, key) {
  var diff = deterDiff(data, key);

  if ('onb' === key) {
    console.log('onb', diff);
    if (diff > 0) {
      show.flash(leds, 100, 10000);
    } else if (diff < 0) {
      show.solder(leds, 10000);
    } else {
      show.powerOff(leds[0]);
    }
    save[key] = data[key];
  } else if ('total' === key) {
    console.log('total', diff);
    if (diff > 0) {
      show.flash(leds, 100, 10000);
    } else if (diff < 0) {
      show.pingpong(leds, 100, 10000);
    } else {
      show.powerOff(leds[1]);
    }
    save[key] = data[key];
  } else if ('grp' === key) {
    console.log('grp', diff);
    if (diff > 0) {
      show.pingpong(leds, 200, 10000);
    } else if (diff < 0) {
      show.fix(led[1], 100, 10000);
    } else {
      show.powerOff(leds[1]);
    }
    save[key] = data[key];
  } else {
    console.log('else', diff);
    show.powerOff(leds);
  }
}

function checkDifference(data) {
  var mandatory = config.scope;

  console.log('1',data);
  for (var i = 0; i < mandatory.length; i++) {
    setLed(data, mandatory[i]);
    console.log('2', save, save[mandatory[i]], data[mandatory[i]], mandatory[i]);
    save[mandatory[i]] = data[mandatory[i]];
    console.log('3', save);
  }
}

// function verifTotal(led, data, key) {
//   if (data[key] > save.total) {
//     if (debug) { console.log('data[key] > save.total', data[key], key); }

//     if (led.readSync() === 0) {
//       led.writeSync(1);
//     }
//   } else {
//     if (debug) { console.log('data[key] <= save.total', data[key], key); }

//     if (led.readSync() === 1) {
//       led.writeSync(0);
//     }
//   }
//   save.total = data[key];
// }

// function verifOnb(led, data, key) {
//   if (data[key] < save.onb) {
//     if (debug) { console.log('data[key] < save.onb', data[key], key); }

//     if (led.readSync() === 0) {
//       led.writeSync(1);
//     }
//   } else if (data[key] > save.onb) {
//     if (debug) { console.log('data[key] > save.onb', data[key], key); }

//     show.flash(led, 250, (time / 2));
//   } else {
//     if (debug) { console.log('data[key] >= save.onb', data[key], key); }

//     if (led.readSync() === 1) {
//       led.writeSync(0);
//     }
//   }
//   save.onb = data[key];
// }

function getDataAndCompare() {
  request(config.options, function(err, result, body) {
    var tmp = {};

    if (err) { 
      if (debug) {
        console.log('Request Error:', err);
      }
    }
    
    if (body) {
      console.log('Response Body:', body);
      tmp = JSON.parse(body);
    } else {
      tmp = JSON.parse(show.fakeRequest());
      console.log('fakeRequest send :', tmp);
    }
    console.log(save, save.total);
    if (save.total && save.onb) {
      if (debug) { console.log('save is fully define', save); }
      
      checkDifference(tmp);
      // save = tmp;
    }
    else {
      if (debug) { console.log('firstLaunch save:', save); }
      
      checkDifference(tmp);
      // save = tmp;
    }
  });
}

function showInter() {
  counter -= 1;
  if (debug) {
    console.log(counter);
  }
}

function showTime() {
  clearInterval(inter);
  getDataAndCompare();
  counter = config.decompte;
  launch = false;
  inter = setInterval(showInter, 1000);
  setTimeout(showTime, time);
}

if (!launch) {
  launch = true;
  console.log('launch:', launch, '=>', time + "ms, " + counter + "s, debug: " + debug);
  getDataAndCompare();
  if (debug) { console.log('save', save); }
  inter = setInterval(showInter, 1000);
  setTimeout(showTime, time);
}
