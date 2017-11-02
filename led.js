'use strict'

var config = require('../config1');

var flash = function(led, timeval, time) {
	console.log('Flash, intervals: ' + timeval + 'ms, duration: ' + time + 'ms.');
	
	if (!led || Array.isArray(led)) {
		console.log('Error, the led passed is Empty or is Array. Function Flash take one led in first params');
		return ;
	}

	var inter = null;
	var interval = (timeval >= 100 ? timeval : 100);
	var duration = (time <= config.duree ? time : config.duree);

	function showInter() {
		if (led.readSync() === 0) {
			led.writeSync(1);
		} else {
			led.writeSync(0);
		}
	};

	function showTime() {
	  clearInterval(inter);
	  if (led.readSync() === 1) {
			led.writeSync(0);
		}
	};
	inter = setInterval(showInter, interval);
  setTimeout(showTime, duration);
};

var pingpong = function(led, timeval, time) {
	console.log('Pingpong, intervals: ' + timeval + 'ms, duration: ' + time + 'ms.');
	if (!led || !Array.isArray(led)) {
		console.log('Error, the led passed is Empty or not an Array. Function PingPong take 2+ leds in first params in Array');
		return ;
	}
	var inter = null;
	var interval = (timeval >= 100 ? timeval : 100);
	var duration = (time <= config.duree ? time : config.duree);
	var prev = {};

	function showInter() {
		led.forEach(function(elem , index) {			
			if (elem.readSync() === 0) {
				elem.writeSync((prev[elem.gpio].state === 1 ? 0 : 1));
				prev[elem.gpio] = {};
				prev[elem.gpio].state = 1;
				prev[elem.gpio].path = elem.gpioPath;
			} else {
				elem.writeSync((prev[elem.gpio].state === 1 ? 0 : 1));
				prev[elem.gpio].state = 0;
				prev[elem.gpio].path = elem.gpioPath;
			}
			
			console.log(elem.gpio, '<=>', prev[elem.gpio]);
		});
	};

	function showTime() {
	  clearInterval(inter);
	  led.forEach(function(elem) {
		  if (elem.readSync() === 1) {
				elem.writeSync(0);
			}
	  });
	};

	inter = setInterval(showInter, interval);
  setTimeout(showTime, duration);
};

function fix(led, time) {
	console.log('Fix, duration: ' + time + 'ms.');
	if (!led) {
		console.log("Error: fix function need led to perform");
		return ;
	}
	var duration = (time <= config.duree ? time : config.duree);
	
	function showInter() {
		if (led.readSync() === 0) {
			led.writeSync(1);
		}
	};
	function showTime() {
	  if (led.readSync() === 1) {
			led.writeSync(0);
		}
	};

	showInter();
  setTimeout(showTime, duration);	
};

function solder(led, time) {
	console.log('Fix, duration: ' + time + 'ms.');
	if (!led || !Array.isArray(led)) {
		console.log("Error: solder function need Array of led to perform");
		return ;
	}
	var duration = (time <= config.duree ? time : config.duree);
	
	function showInter() {
		led.forEach(function(elem) {
			if (elem.readSync() === 0) {
				elem.writeSync(1);
			}
		});
	};
	function showTime() {
		led.forEach(function(elem) {
		  if (elem.readSync() === 1) {
				elem.writeSync(0);
			}
		});
	};

	showInter();
  setTimeout(showTime, duration);	
};

function powerOff(leds) {
	for (var i = 0; i < leds.length; i++) {
		leds[i].writeSync(0);
	}
};

// UNIT TEST without Raspberry Pi, uncomment all under this text
var randOnb = Number.parseInt(Math.random() * 50);
var randTotal = (Number.parseInt(Math.random() * 50) + randOnb);

var readSync = function() {
	console.log(this.name, 'readSync', this.state);
	return this.state;
};
var writeSync = function(value) {
	console.log(this.name, 'writeSync', this.state, 'to', value);
	return this.state = value;
};
var fakeRequest = function() {
	var grp = 5;

	
	var json = {
		total: randTotal,
		onb: randOnb,
		grp: grp,
	}

	randTotal += 1;
	// randOnb += 1;

	console.log('fakeRequest :', json);
	return JSON.stringify(json);
};
var fakeLed = function(name) {
	return {
		state: 0,
		name: name,
		readSync: readSync,
		writeSync: writeSync
	};
};
// all.pingpong([fakeLed("led1"), fakeLed("led2")], 500, 10000);
// all.flash(fakeLed("led3"), 500, 10000);
// all.solder([fakeLed("led4"), fakeLed("led5")], 10000);
// all.fix(fakeLed("led6"), 10000);

// END OF UNIT TEST

var all = {
	pingpong: pingpong, // ([leds], timeval, time)
	solder: solder, // ([leds], time)
	fix: fix, // (led, time)
	flash: flash, // (led, timeval, time)
	powerOff: powerOff, // (leds)
	
	fakeRequest: fakeRequest, // 
	fakeLed: fakeLed, //
};
module.exports = all;