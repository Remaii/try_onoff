// Depend
var config = require('../config');
var request = require('request');
var gpio = require('onoff').Gpio;
// GPIO
var Led1 = new gpio(17, 'out');
var Led2 = new gpio(27, 'out');
// Global var
var save = {};
var debug = (process.env.DEBUG === 'true' ? true : false) || false;
var time = config.duree;
var counter = config.decompte;
var launch = false;
var inter = null;

function verifTotal(led, data, key) {
  if (data[key] > save.total) {
    if (debug) { console.log('tmp.total > save.total'); }

    if (led.readSync() === 0) {
      led.writeSync(1);
    }
  } else {
    if (debug) { console.log('tmp.total <= save.total'); }

    if (led.readSync() === 1) {
      led.writeSync(0);
    }
  }
  save.total = data[key];
}

function verifOnb(led, data, key) {
  if (data[key] < save.onb) {
    if (debug) { console.log('tmp.onb < save.onb'); }

    if (led.readSync() === 0) {
      led.writeSync(1);
    }
  } else if (data[key] > save.onb) {
    if (debug) { console.log('tmp.onb > save.onb'); }

    config.flash(led, 250, 10000);
  } else {
    if (debug) { console.log('tmp.onb >= save.onb'); }

    if (led.readSync() === 1) {
      led.writeSync(0);
    }
  }
  save.onb = data[key];
}

function getNumberUser() {
  request(config.options, function(err, result, body) {
    if (err) { console.log('Request Error:', err); }
    console.log('Response Body:', body);
    var tmp = JSON.parse(body);
    
    if (save.total && save.onb) {
      if (debug) { console.log('save.total is define'); }
      verifTotal(Led1, tmp, 'total');
      verifOnb(Led2, tmp, 'onb');
    }
    else {
      if (debug) { console.log('firstLaunch save:', save); }
      save.total = tmp.total;
      save.onb = tmp.onb;
      config.flash(Led1, 500, (time / 2));
      config.flash(Led2, 500, (time / 2));
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
  getNumberUser();
  counter = config.decompte;
  launch = false;
  inter = setInterval(showInter, 1000);
  setTimeout(showTime, time);
}


if (!launch) {
  launch = true;
  console.log('launch:', launch, '=>', time + "ms, " + counter + "s, debug: " + debug);
  getNumberUser();
  if (debug) { console.log('save', save); }
  inter = setInterval(showInter, 1000);
  setTimeout(showTime, time);
}
