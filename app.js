'use strict'

// Dependances
var config = require('../config1'),
	show = require('./led'),
	request = require('request'),
	_ = require('lodash'),
	gpio = require('onoff').Gpio;

// Globals variables
var leds = [],
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

if (leds.length <= 0) {
	console.log('post deter');
	leds = determineLeds();
}

if (!launch && leds.length > 0) {
	console.log('leds', leds);
	_.each(leds, function(led) {
		if (led.readSync()) {
			console.log('1', led.readSync());
			led.writeSync(1);
		} else {
			console.log('2', led.readSync());
			led.writeSync(0);
		}
	});
}