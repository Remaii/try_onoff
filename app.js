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
	launch = false;

function determineLeds() {
	console.log('deter');
	var tmp = [];
	_.each(config.pins, function(value) {
		tmp.push(new gpio(value, 'out'));
	});
	console.log('tmp', tmp);
	return tmp;
}

function setStatus() {
	console.log('status', status);
	_.each(status, function(elem) {
		console.log(elem);
		if (config.pins.indexOf(elem.number) >= 0) {
			console.log('find it!', elem.number);
		}
	});
}

function getStatus(time) {
	request(config.options_status, function(err, result, body) {
    var tmp = {};

    if (err) {
      if (debug) {
        console.log('Request Error:', err);
      }
      return ;
    }
    
    if (body) {
      console.log('Response Body:', body);
      status = JSON.parse(body);
    }
    return setStatus();
  });
}

if (leds.length <= 0) {
	console.log('post deter');
	leds = determineLeds();
}

if (!launch && leds.length > 0) {
	console.log('leds', leds);
	getStatus();
}