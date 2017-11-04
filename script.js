'use strict'

// Depend
var config = require('../config1');
var show = require('./led');
var request = require('request');
var async = require('async');
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
  console.log('deterDiff,s,d,k', save, data, key, data[key] - save[key], save[key] - data[key]);
  if (data[key] > save[key]) {
    return data[key] - save[key];
  } else if (data[key] < save[key]) {
    return save[key] - data[key];
  } else {
    return 0;
  }
}

function setLed(data, key, cb) {
  var diff = deterDiff(data, key);
  var p = [];

  if ('onb' === key) {
    console.log('onb', diff);
    if (diff > 0) {
      p.push(show.flash(leds[0], 100, 10000));
    } else if (diff < 0) {
      p.push(show.solder(leds, 10000));
    } else {
      p.push(show.powerOff(leds[0]));
    }
    // save[key] = data[key];
  } else if ('total' === key) {
    console.log('total', diff);
    
    if (diff > 0) {
      p.push(show.flash(leds[0], 100, 10000));
    } else if (diff < 0) {
      p.push(show.pingpong(leds, 100, 10000));
    } else {
      p.push(show.powerOff(leds[1]));
    }
    // save[key] = data[key];
  } else if ('grp' === key) {
    console.log('grp', diff);
    if (diff > 0) {
      p.push(show.pingpong(leds, 200, 10000));
    } else if (diff < 0) {
      p.push(show.fix(led[1], 100, 10000));
    } else {
      p.push(show.powerOff(leds[1]));
    }
    // save[key] = data[key];
  } else {
    console.log('else', diff);
    p.push(show.powerOff(leds));
  }
  return async.series(p, cb);
}

function checkDifference(data) {
  var mandatory = config.scope,
    i = 0,
    p = [];

  function cb() {
    i++;
    return save[mandatory[i]] = data[mandatory[i]];
  };

  while (i < mandatory.length) {
    console.log('while', i, mandatory[i]);
    setLed(data, mandatory[i], cb);
    // save[mandatory[i]] = data[mandatory[i]];
    // i++;
  }
}

function getDataAndCompare() {
  request(config.options, function(err, result, body) {
    var tmp = {};

    if (err) { 
      if (debug) {
        console.log('Request Error:', err);
      }
      console.log('fakeRequest send :', tmp);
      tmp = JSON.parse(show.fakeRequest());
    }
    
    if (body) {
      console.log('Response Body:', body);
      tmp = JSON.parse(body);
    }

    if (save.total && save.onb) {
      if (debug) { console.log('save is fully define', save); }
      
      checkDifference(tmp);
    }
    else {
      if (debug) { console.log('firstLaunch save:', save); }
      
      checkDifference(tmp);
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
