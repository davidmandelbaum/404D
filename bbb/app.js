// var b = require('bonescript');

var socket = require('socket.io-client')('http://meng404d.herokuapp.com:80/bbb');

socket.on('connect', function() {
  console.log('connected to remote socket');
});

// b.pinMode('P8_19', b.INPUT);
// setInterval(check, 100);
//
// function check() {
//   b.digitalRead('P8_19', checkButton);
// }
//
// function checkButton() {
//   if (x.value == 1) {
//     socket.emit('init', '');
//     handle button down
//   }
//   else {
//     handle anything?
//   }


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
    console.log('data_points: ' + message.data_points);
  }

  if ('status_msg' in message){
    socket.emit('status_msg', message.status_msg);
    console.log('status: ', message.status_msg);
  }

  if ('final_stats' in message){
    socket.emit('final_stats', message.final_stats);
    console.log('final_stats: ', message.final_stats);
  }
});

pyshell.end(function (err) {
  if (err) throw err;
  console.log('finished');
});
