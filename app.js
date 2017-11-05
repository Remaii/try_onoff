'use strict'

// Dependances
var config = require('../config1'),
	show = require('./led'),
	request = require('request'),
	_ = require('lodash'),
	gpio = require('onoff').Gpio;

// Globals variables
var leds = [],
	status = {},
	stats = {},
	launch = false,
	debug = (process.env.DEBUG === 'true' ? true : false) || false;

function determineLeds() {
	var tmp = [];
	_.each(config.pins, function(value) {
		tmp.push(new gpio(value, 'out'));
	});
	return tmp;
}

function setStatus() {
	if (debug) { console.log('setStatus:', status); }

	_.each(status, function(elem) {
		_.each(leds, function(led) {
			if (led.gpio === elem.number) {
				if ((elem.state === true ? 1 : 0) !== led.readSync()) {
					if (debug) { console.log('setStatus of:', elem.name, 'gpio#:' + elem.number, 'state:', elem.state); }
					led.writeSync((elem.state === true ? 1 : 0));
				}
			}
		});
	});
}

function getStatus(time) {
	request(config.options_status, function(err, result, body) {
    if (err) {
      if (debug) {
        console.log('Request Error:', err);
      }
      return ;
    }
    
    if (body) {
      stats = JSON.parse(body);
      status = stats.status;
      console.log('Response Body:', stats);
    }
    return setStatus();
  });
}

var old = Date.now();

function refreshTime() {
	var time = Date.now();
	console.log('refreshTime', old - time);
	getStatus();
  setTimeout(refreshTime, config.refresh);
}

if (leds.length <= 0) {
	console.log('firstLaunch', old, '\n\n');
	leds = determineLeds();
	_.each(leds, function(led) {
		show.powerOff(led);
	});
}

if (!launch && leds.length > 0) {
	getStatus();
  setTimeout(refreshTime, config.refresh);
	launch = true;
}