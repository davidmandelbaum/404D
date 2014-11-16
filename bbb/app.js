var b = require('bonescript');
var pressed = 0;

b.pinMode('P8_12', b.INPUT);
setInterval(check, 100);

function check() {
  b.digitalRead('P8_12', checkButton);
}

function checkButton(x) {
  if (!pressed){
    if (x.value == 1) {
      pressed = 1;
      console.log('pressed = ' + pressed);
      bbb_run();
    }
    else {
      console.log('waiting for button press');
    }
  }
}

function bbb_run() {

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

  var PythonShell = require('python-shell');


  function run_script(inputs) {
    console.log('inputs: ' + inputs);
    var options = {
      mode: 'json',
      scriptPath: '../py/',
      args: [inputs.time*60, inputs.capno],
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
      }
    });

    pyshell.end(function (err) {
      if (err) throw err;
      console.log('finished');
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
  pressed = 0;
  console.log('pressed = ' + pressed);
}
