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
				console.log('setStatus of:', elem.name, 'gpio#:', elem.number, 'state:', elem.state);
				led.writeSync(elem.state);
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
      status = JSON.parse(body);
      console.log('Response Body:', status);
    }
    return setStatus();
  });
}

function showTime() {
	console.log('showTime');
	getStatus();
  launch = false;
  setTimeout(showTime, config.duree);
}

if (leds.length <= 0) {
	leds = determineLeds();
}

if (!launch && leds.length > 0) {
	getStatus();
  setTimeout(showTime, config.duree);
}