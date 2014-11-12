var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

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
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', users);

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
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

var io = require('socket.io')(server);
io.set('origins', '*:*');

var bbb = io.of('/bbb');

bbb.on('connection', function(socket) {
  console.log('a user connected');
  socket.on('disconnect', function() {
    console.log('a user disconnected');
  });
  socket.on('message', function(msg) {
    if ('second_values' in msg){
      console.log('Second values: ' + msg.second_values);
    }
  });
});
