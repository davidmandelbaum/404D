var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var csv = require('express-csv');

var mongoose = require('mongoose');

var uristring = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/HelloMongoose';

mongoose.connect(uristring, function (err, res) {
  if (err) {
    console.log('[DB] Error connecting');
  }
  else {
    console.log('[DB] succeeded connecting');
  }
});

var trialSchema = new mongoose.Schema({
  username: String,
  datetime: Date,
  length: Number,
  starting_capno: Number,
  points: [],
  stats: [],
  final_stats: Object
});

var Trial = mongoose.model('Trial', trialSchema);

var curr_trial = new Trial();

var users = require('./routes/users');

var app = express();

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  return next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
// TODO: figure out if app runs faster without logging
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', users);

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Welcome!' });
});

router.post('/live', function(req, res) {
  console.log(req.body);
  curr_trial.username = req.body.username;
  curr_trial.datetime = Date.now();
  curr_trial.starting_capno = req.body.capno;
  curr_trial.length = req.body.time*60;
  bbb.emit('manikin_inputs', req.body);
  res.render('live', { title: 'Live trial', time: req.body.time });
});

router.get('/live', function(req, res) {
  res.render('live', { title: 'Live trial'}); 
});

router.post('/data_point', function(req, res) {
  io.emit("data_point", req.body);
  res.send('response');
});

router.post('/data_points', function(req, res) {
  io.emit("data_points", req.body);
  res.send('response');
});

router.post('/final_stats', function(req, res) {
  io.emit("final_stats", req.body);
  res.send('response');
});

router.post('/status', function(req, res) {
  io.emit("status", req.body);
  res.send('response');
});

router.get('/depth', function(req, res) {
  res.render('depth');
});

router.get('/list', function(req, res) {
  Trial.find(function(err, trials) {
    if (err) return console.log(err);
    res.render('list', { list: trials, title: 'Trial list' });
  });
});

router.get('/trial/:id', function(req, res) {
  Trial.findById(req.params.id, function(err, trial) {
    res.render('trial', { trial: trial, title: 'Trial view' });
  });
});

router.get('/live_nonmed/:id', function(req, res) {
  Trial.findById(req.params.id, function(err, trial) {
    res.render('live_nonmed', { trial: trial, title: 'Trial view' });
  });
});


router.get('/csv/:id', function(req, res) {
  Trial.findById(req.params.id, function(err, trial) {
    var points_csv = trial.points;
    points_csv.unshift( { "depth": "depth", "time": "time" });
    res.csv(points_csv);
  });
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
        error: err
    });
  });
}

app.use("/", router);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
      error: {}
  });
});

var debug = require('debug')('client');

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
  console.log('Express server listening on port ' + server.address().port);
});

var io = require('socket.io')(server),
    monitorio = require('monitor.io');
io.set('origins', '*:*');

io.use(monitorio({ port: 8000 }));

io.on('connection', function (socket) {
  console.log('[WEB] user connected');

  socket.on('time', function(msg) {
    console.log('[WEB] time = ' + msg);
  });

  socket.on('click', function() {

  });
});

var bbb = io.of('/bbb');

var dp_array = [];

bbb.on('connection', function(socket) {
  console.log('[BBB] user connected');

  socket.on('disconnect', function() {
    console.log('[BBB] user disconnected');
  });

  socket.on('init', function() {
    io.emit('bbb_connect', 'connected');
    console.log('[BBB] init!');
  });

  socket.on('depth', function(depth) {
    io.emit('depth', depth);
    console.log(depth);
  });

  socket.on('data_point', function(data_point) {
    io.emit('data_point', data_point);
    console.log('data_point: ' + data_point);
  });

  socket.on('data_points', function(data_points) {
    io.emit('data_points', data_points);
    var i;
    points = JSON.parse(data_points);
    // TODO: CSV output
    for (i = 0; i < points.length; i++) {
      dp_array.push( { "time": points[i][0], "depth": points[i][1] } );
    }
    console.log('data_points: ' + dp_array);
  });

  socket.on('status_msg', function(status_msg) {
    io.emit('status_msg', status_msg);
    curr_trial.stats.push(status_msg);
    console.log('status: ' + status_msg);
  });

  socket.on('final_stats', function(final_stats) {
    io.emit('final_stats', final_stats);
    console.log('final_stats: ' + final_stats);
    curr_trial.points = dp_array;
    curr_trial.final_stats = final_stats;
    curr_trial.save(function(err, curr_trial) {
      if (err) return console.error(err);
      console.log(curr_trial);
    });
    socket.disconnect();
  });

  socket.on('begin', function(time) {
    io.emit('begin', time);
    console.log('begin; trial time = ' + time);
  });
});
