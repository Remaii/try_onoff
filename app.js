'use strict'

// Dependances
var config = require('../config1'),
	show = require('./led'),
	request = require('request'),
	gpio = require('onoff').Gpio;

// Globals variables
var leds = [],
	launch = false;

function determineLeds() {
	console.log('deter');
	var tmp = [];
	_.each(config.pins, function(value) {
		tmp.push(()=>{ return new gpio(value, 'out'); });
	});
	console.log(tmp);
	return tmp;
}

if (leds.length <= 0) {
	console.log('post deter');
	leds = determineLeds();
}

if (!launch && leds.length > 0) {
	console.log(leds);
}