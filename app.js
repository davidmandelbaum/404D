var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ = require('underscore');
var moment = require('moment');

var schedule = require('node-schedule');

var csv = require('express-csv');

var mongoose = require('mongoose');

var uristring = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL;

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
  type: String,
  length: Number,
  starting_capno: Number,
  difference: Number,
  points: [],
  stats: [],
  final_stats: Object,
  group_id: String
});

var Trial = mongoose.model('Trial', trialSchema);

var groupSchema = new mongoose.Schema({
  name: String,
  created_at: Date,
  num_trials: Number
});

var Group = mongoose.model('Group', groupSchema);

// add formatted datetime to each object as "dt" attribute
function dateHelper(trials){
  var i = 0;
  for (i = 0; i < trials.length; i++){
    trials[i].dt = moment(trials[i].datetime).format('MMM Do YYYY, h:mma');
  }
  return trials;
}

// recalculate trials object for each group every minute
var rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 60, 1);

var job = schedule.scheduleJob(rule, function() {
  console.log('job ran!');
  Group.find(function(err, groups) {
    _.each(groups, function(g) {
      Trial.find( { "group_id": g._id }, function(err, trials) {
        g.num_trials = trials.length;
        g.save();
      });
    });
  });
});

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

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  Group.find(function(err, groups) {
    if (err) return console.log(err);
    res.render('index', { title: 'Welcome!', groups: groups });
  });
});

router.post('/live', function(req, res) {
  console.log(req.body);
  curr_trial = new Trial();
  curr_trial.username = req.body.username;
  if (req.body.add_to_group == "yes") {
    curr_trial.group_id = req.body.group_name;
  }
  curr_trial.type = req.body.type;
  curr_trial.datetime = Date.now();
  curr_trial.starting_capno = req.body.capno;
  var mins, secs;
  if (req.body.mins !== "") {
    mins = parseInt(req.body.mins)*60;
  }
  else {
    mins = 0;
  }
  if (req.body.secs !== "") {
    secs = parseInt(req.body.secs);
  }
  else {
    secs = 0;
  }
  var time = mins+secs;
  curr_trial.length = time;
  bbb.emit('manikin_inputs', req.body);
  if (req.body.type == 'non_prof') {
    res.render('live_nonmed', { title: 'Live trial', time: time });
  }
  if (req.body.type == 'prof') {
    res.render('live_med', { title: 'Live trial', time: time });
  }
});

router.get('/live_nonmed', function(req, res) {
  res.render('live_nonmed', { title: 'Live trial', time: req.body.time });
});

router.get('/live_med', function(req, res) {
  res.render('live_med', { title: 'Live trial', time: req.body.time });
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

router.get('/csv/:id', function(req, res) {
  Trial.findById(req.params.id, function(err, trial) {
    console.log(trial);
    var points_csv = [];
    var i = 0;
    for (i = 0; i < trial.points.length; i++) {
      points_csv.push( { "time": trial.points[i].time, "depth": (-1*trial.points[i].depth) } );
    }
    points_csv.unshift( { "time": "time", "depth": "depth" });
    res.csv(points_csv);
  });
});

router.get('/groups/', function (req, res) {
  Group.find(function(err, groups) {
    if (err) return console.log(err);
    groups = _.sortBy(groups, "num_trials").reverse();
    res.render('group_list', { groups: groups, title: 'Trial list' });
  });
});

router.post('/groups/', function (req, res) {
  new_group = new Group();
  new_group.name = req.body.name;
  new_group.created_at = Date.now();
  new_group.num_trials = 0;
  new_group.save(function(err, new_group) {
    if (err) return console.error(err);
    console.log(new_group);
    Group.find(function(err, groups) {
      if (err) return console.error(err);
      groups = _.sortBy(groups, "num_trials").reverse();
      res.render('group_list', { groups: groups, title: 'Trial list' });
    });
  });
});

router.get('/groups/:id', function (req, res) {
  Trial.find( { "group_id": req.params.id }, function(err, trials) {
    if (err) return console.error(err);
    Group.findById(req.params.id, function (err, group) {
      if (err) return console.error(err);
      trials = _.sortBy(trials, "difference");
      trials = dateHelper(trials);
      res.render('group', { trials: trials, title: 'Group view', group: group });
    });
  });
});

router.get('/trials/', function (req, res) {
  Trial.find(function(err, trials) {
    if (err) return console.log(err);
    trials = dateHelper(trials);
    res.render('trial_list', { trials: trials, title: 'Trial list' });
  });
});

router.get('/trials_nonmed/:id', function(req, res) {
  Trial.findById(req.params.id, function(err, trial) {
    res.render('trial_nonmed', { trial: trial, title: 'Trial view' });
  });
});

router.get('/trials_med/:id', function(req, res) {
  Trial.findById(req.params.id, function(err, trial) {
    res.render('trial_med', { trial: trial, title: 'Trial view' });
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

var depth = io.of('/depth');

depth.on('connection', function(socket) {

  socket.on('depth', function(depth){
    io.emit('depth', depth);
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
    dp_array = [];
  });

  socket.on('data_point', function(data_point) {
    io.emit('data_point', data_point);
    // console.log('data_point: ' + data_point);
  });

  socket.on('data_points', function(data_points) {
    io.emit('data_points', data_points);
    var i;
    points = JSON.parse(data_points);
    for (i = 0; i < points.length; i++) {
      // convert all points to negative for proper display
      dp_array.push( { "time": points[i][0], "depth": -1*points[i][1] } );
    }
    // console.log('data_points: ' + dp_array);
  });

  socket.on('status_msg', function(status_msg) {
    io.emit('status_msg', status_msg);
    curr_trial.stats.push(status_msg);
    // console.log('status: ' + status_msg);
  });

  socket.on('final_stats', function(final_stats) {
    console.log('data_points: ' + dp_array);
    io.emit('final_stats', final_stats);
    // console.log('final_stats: ' + final_stats);
    curr_trial.points = dp_array;
    curr_trial.final_stats = final_stats;
    var curr_capno = parseInt(final_stats.capno);
    // difference is capno difference divided by trial length
    curr_trial.difference = (curr_trial.starting_capno - curr_capno)/curr_trial.length;
    console.log('curr_trial.difference = ' + curr_trial.difference);
    curr_trial.save(function(err, curr_trial) {
      if (err) return console.error(err);
      console.log(curr_trial);
    });
    socket.disconnect();
  });

  socket.on('begin', function(time) {
    io.emit('begin', time);
    // console.log('begin; trial time = ' + time);
  });
});
