var b = require('bonescript');
var exec = require('child_process').exec;
var request = require('request');

var io = require('socket.io-client');

var socket;

var pressed = 0;

b.pinMode('P8_16', b.INPUT);
b.pinMode('P8_14', b.OUTPUT);
setInterval(check, 100);

b.digitalWrite('P8_14', b.LOW);

console.log('ready for input');

function check() {
  b.digitalRead('P8_16', checkButton);
}

function checkButton(x) {
  if (!pressed){
    if (x.value == 1) {
      pressed = 1;
      console.log('pressed = ' + pressed);
      bbb_run();
    }
    else {
    }
  }
}

// if button not connected, uncomment
// bbb_run();

function bbb_run() {

  b.digitalWrite('P8_14', b.HIGH);

  console.log('bbb_run() called');

  if (socket) {
    console.log('calling connect again');
    socket.io.connect();
  }
  else {
    socket = io.connect('http://meng404d.herokuapp.com:80/bbb', { 'forceNew': true });
  }

  if (process.argv.length > 2 && process.argv[2] == '-l'){
    socket = io.connect('http://localhost:3000/bbb');
    console.log('local!');
  }

  if (process.argv.length > 2 && process.argv[2] == '-o'){
    socket = io.connect(process.argv[3]);
    console.log('other: ' + process.argv[3]);
  }

  socket.on('connect', function() {
    console.log('connected to remote socket');

    var output = exec('ifconfig | grep \'inet addr\' | head -1', function(err, stdout) {
      console.log(stdout);
      request.post(
        'http://meng404d.herokuapp.com/addr',
        { form : { addr: stdout } });
    });
     
    socket.emit('init', '');

    socket.on('disconnect', function() {
      socket.io.disconnect();
      console.log('disconnected from remote socket');
    });
  });

  socket.on('reconnect', function() {
    console.log('connected to remote socket');

    var output = exec('ifconfig | grep \'inet addr\' | head -1', function(err, stdout) {
      console.log(stdout);
      request.post(
        'http://meng404d.herokuapp.com/addr',
        { form : { addr: stdout } });
    });
     
    socket.emit('init', '');

    socket.on('disconnect', function() {
      socket.io.disconnect();
      console.log('disconnected from remote socket');
    });
  });

  var PythonShell = require('python-shell');

  function run_script(inputs) {
    var time = parseInt(inputs.mins)*60 + parseInt(inputs.secs);

    console.log("time");
    console.log(time);

    console.log('inputs: ' + inputs);
    var options = {
      mode: 'json',
      scriptPath: '../py/',
      args: [time, inputs.capno],
    };

    var pyshell = new PythonShell('pipeplot.py', options);

    console.log('starting pyshell');

    socket.emit('init', '');

    pyshell.on('message', function (message) {
      console.log(message);

      if ('begin' in message){
        socket.emit('begin', inputs.time*60);
        console.log('begin; trial time = ' + inputs.time*60);
      }

      if ('data_point' in message){
        socket.emit('data_point', message.data_point);
        console.log('data_point: ' + message.data_point);
      }

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
        socket.io.disconnect();
      }
    });

    pyshell.end(function (err) {
      if (err) throw err;
      console.log('finished');
      pressed = 0;
      console.log('pressed = ' + pressed);
      b.digitalWrite('P8_14', b.LOW);
    });
  }

  socket.on('manikin_inputs', function(msg) {
    console.log('manikin inputs:');
    console.log(msg);

    setTimeout(function() {
      console.log('starting script');
      run_script(msg);
    }, 2000);

  });
}
