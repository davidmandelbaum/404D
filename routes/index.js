var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.post('/data_point', function(req, res) {
  io.emit("data", req.body);
  console.log(req.body);
  res.send('response');
});

router.post('/status', function(req, res) {
  console.log(req.body);
  res.send('response');
});

module.exports = router;
