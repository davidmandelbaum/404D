var exec = require('child_process').exec;

var output = exec('ifconfig | grep "inet addr" | head -1', function(err, stdout) {
  console.log(stdout);
});
