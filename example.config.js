'use strict'

var duree = 300000;// millisecondes
var dec = (duree / 1000);// secondes
var url = 'url to request and return { total: Number, onb: Number }';

var flash = function(led, timeval, time) {
	console.log('Flash Times:' + timeval + 'ms, ' + time + 'ms.');
	var inter = null;

	function showInter() {
		if (led.readSync() === 0) {
			led.writeSync(1);
		} else {
			led.writeSync(0);
		}
	}

	function showTime() {
	  clearInterval(inter);
	  if (led.readSync() === 1) {
			led.writeSync(0);
		}
	}

	inter = setInterval(showInter, timeval);
  setTimeout(showTime, time);
}

var all = {
	duree: duree,
	decompte: dec,
	options: {
		method: 'GET',
		url: url,
		rejectUnauthorized: false,
		headers: {
			'Content-Type':'x-www-form-urlencoded'
		}
	},
	pin1: 17,
	pin2: 27,
	flash: flash
}

module.exports = all;
