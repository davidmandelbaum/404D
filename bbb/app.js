var socket = require('socket.io-client')('http://meng404d.herokuapp.com/bbb');
socket.on('connect', function() {
  console.log('connected to remote socket');
  socket.emit('init', '');
});

var PythonShell = require('python-shell');

var options = {
  mode: 'json',
  scriptPath: '../py/'
};

var pyshell = new PythonShell('test.py', options);

pyshell.on('message', function (message) {
  socket.emit('message', message);
  console.log(message);
  if ('second_values' in message){
    console.log('second_values!');
  }
});

pyshell.end(function (err) {
  if (err) throw err;
  console.log('finished');
});