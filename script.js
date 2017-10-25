var request = require('request');

var gpio = require('onoff').Gpio;

var Led1 = new gpio(17, 'out');
var Led2 = new gpio(27, 'out');

var oldTotal = {};

function getNumberUser() {
	var options = {
    method: 'GET',
    url: 'https://api-dev.cowork.id/v1/users/onlycount',
    rejectUnauthorized: false,
    headers: {
    	'Content-Type':'x-www-form-urlencoded'
    }
  };
  var p = [];
  p.push(
  	request(options, function(err, result, body) {
	    if (err) {
	    	console.log('error:', err);
	    }
	    console.log('Number of User response:', body);
	    var tmp = JSON.parse(body);
	    if (oldTotal.total) {
        if (debug) {
          console.log('oldTotal.total is define');
        }
        if (tmp.total > oldTotal.total) {
          if (debug) {
            console.log('tmp.total > oldTotal.total');
          }
          if (Led1.readSync() === 0) {
            Led1.writeSync(1);
          }
          if (Led2.readSync() === 0) {
            Led2.writeSync(1);
          }
          oldTotal.total = tmp.total;
        } else {
          if (debug) {
            console.log('tmp.total <======== oldTotal.total');
          }
          if (Led1.readSync() === 1) {
            Led1.writeSync(0);
          }
          if (Led2.readSync() === 1) {
            Led2.writeSync(0);
          }

        }
      } else {
        if (debug) {
          console.log('oldTotal.total is undefined');
        }
        oldTotal.total = tmp.total;
        if (Led1.readSync() === 0) {
          Led1.writeSync(1);
        }
        if (Led2.readSync() === 0) {
          Led2.writeSync(1);
        }
      }
  	})
	);

  Promise.all(p);
}


var time = 30000 / 2;
var counter = 30 / 2;
var debug = (process.env.DEBUG === 'true' ? true : false) || false;
var launch = false;
var inter = null;

function showInter() {
  counter -= 1;
  if (debug) {
    console.log(counter);
  }
}

function showTime() {
  clearInterval(inter);
  getNumberUser();
  counter = 30 / 2;
  launch = false;
  inter = setInterval(showInter, 1000);
  setTimeout(showTime, time);
}

if (!launch) {
  launch = true;
  console.log('launch', launch);
  getNumberUser();
  if (debug) {
    console.log('oldTotal', oldTotal);
  }
  inter = setInterval(showInter, 1000);
  setTimeout(showTime, time);
}
