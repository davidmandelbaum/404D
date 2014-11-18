var b = require('bonescript');

b.pinMode('P9_40', b.INPUT);
setInterval(check, 100);

console.log('ready for input');

var socket = require('socket.io-client')('http://meng404d.herokuapp.com:80/bbb');

if (process.argv.length > 2 && process.argv[2] == '-l'){
  socket = require('socket.io-client')('http://localhost:3000/bbb');
  console.log('local!');
}

if (process.argv.length > 2 && process.argv[2] == '-o'){
  socket = require('socket.io-client')(process.argv[3]);
  console.log('other: ' + process.argv[3]);
}

socket.on('connect', function() {
  console.log('connected to remote socket');
  socket.emit('init', '');
});

function check() {
  b.analogRead('P9_40', outputDepth);
}

function outputDepth(x) {
  socket.emit('depth', x);
}
