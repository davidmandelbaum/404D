var b = require('bonescript');

// console.log('ready for input');

var socket = require('socket.io-client')('http://meng404d.herokuapp.com:80/depth');

if (process.argv.length > 2 && process.argv[2] == '-l'){
  socket = require('socket.io-client')('http://localhost:3000/depth');
  console.log('local!');
}

if (process.argv.length > 2 && process.argv[2] == '-o'){
  socket = require('socket.io-client')(process.argv[3]);
  console.log('other: ' + process.argv[3]);
}

socket.on('connect', function() {
  // console.log('connected to remote socket');
  socket.emit('init', '');
});

setInterval(check, 100);

function check() {
  b.analogRead('P9_36', outputDepth);
}
 
function outputDepth(x) {
  x.value *= 8.58;
  // console.log(x.value);
  // console.log(x.value.toFixed(2));
  socket.emit('depth', x);
}
