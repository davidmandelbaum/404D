var socket = require('socket.io-client')('http://meng404d.herokuapp.com');
socket.on('connect', function() {
  console.log('connected to remote socket');
  socket.emit('message', "yooo");
});

var PythonShell = require('python-shell');

var options = {
  mode: 'text',
  scriptPath: '../py/'
};

var pyshell = new PythonShell('test.py', options);

pyshell.on('message', function (message) {
  socket.emit('message', message);
});

pyshell.end(function (err) {
  if (err) throw err;
  console.log('finished');
});
