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
  console.log(message);
  if ('data_points' in message){
    socket.emit('data_points', message.data_points);
    console.log('data_points' + message.data_points);
  }
  if ('status' in message){
    socket.emit('status', message.status);
    console.log('status', message.status);
  }
});

pyshell.end(function (err) {
  if (err) throw err;
  console.log('finished');
});
