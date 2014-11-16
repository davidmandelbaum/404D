var socket = io();
var compressions = [];
var capnography = [];
var trial_time;

socket.on('begin', function(time) {
  $("#begin").fadeIn().delay(2000).fadeOut();
  trial_time = time;
  data_graphic({
    title: "Compressions",
    data: compressions,
    target: "#compressions",
    x_accessor: 'time',
    y_accessor: 'depth',
    width: 700,
    height: 500,
    min_x: 0,
    max_x: trial_time,
    min_y: 6,
    max_y: 0,
    area: false,
    interpolate: "linear"
  });
  data_graphic({
    title: "Capnography",
    data: capnography,
    target: "#capnography",
    x_accessor: 'time',
    y_accessor: 'capno',
    width: 300,
    height: 300,
    min_x: 0,
    max_x: trial_time,
    min_y: 0,
    max_y: 1250,
    area: false,
    interpolate: "linear"
  });
});

socket.on('data_point', function(data_point) {
  console.log(data_point);
  compressions.push({"time": parseInt(data_point[0][0]), "depth": parseInt(data_point.depth[0][1])});
  console.log(compressions);
  data_graphic({
    title: "Compressions",
      data: compressions,
      target: "#compressions",
      x_accessor: 'time',
      y_accessor: 'depth'
  });
});

socket.on('data_points', function(data_points) {
  console.log("data points received");
  var i = 0;
  points = JSON.parse(data_points);
  for (i = 0; i < points.length; i++){
    compressions.push({"time": parseFloat(points[i][0]), "depth": parseFloat(points[i][1])});
  }
  console.log(compressions);
  data_graphic({
    title: "Compressions",
    data: compressions,
    target: "#compressions",
    x_accessor: 'time',
    y_accessor: 'depth',
    width: 700,
    height: 500,
    min_x: 0,
    max_x: trial_time,
    min_y: 6,
    max_y: 0,
    area: false,
    interpolate: "linear"
  });
});

socket.on('status_msg', function(status_msg) {
  console.log('status_msg!');
  console.log(status_msg);
  console.log(status_msg['time']);
  var time = parseFloat(status_msg["time"]);
  var rate = parseFloat(status_msg["rate"]);
  var depth = parseFloat(status_msg["depth"]).toFixed(2);
  var capno = parseFloat(status_msg["capno"]).toFixed(2);
  $("#time").html(time + "s");
  $("#rate").html(rate + " /m");
  if (rate > 130 || rate < 100) {
    $("#rate").addClass("bad");
  }
  else {
    $("#rate").removeClass("bad");
  }
  if (depth < 4 || depth > 6){
    $("#depth").addClass("bad");
  }
  else {
    $("#depth").removeClass("bad");
  }
  $("#depth").html(depth + " cm");
  $("#capno").html(capno);
  capnography.push( { "time": time, "capno": capno } );
  data_graphic({
    title: "Capnography",
    data: capnography,
    target: "#capnography",
    x_accessor: 'time',
    y_accessor: 'capno',
    width: 300,
    height: 300,
    min_x: 0,
    max_x: trial_time,
    min_y: 0,
    max_y: 1250,
    area: false,
    interpolate: "linear"
  });
});

socket.on('final_stats', function(final_stats) {
  console.log('final stats!');
  console.log(final_stats);
  var time = parseFloat(final_stats["time"]);
  var rate = parseFloat(final_stats["rate"]);
  var depth = parseFloat(final_stats["depth"]);
  $("#title").html("Final Statistics");
  $("#time").html(time + "s");
  $("#rate").html(rate + " /m");
  $("#depth").html(depth + " cm");
  if (rate > 130 || rate < 100) {
    $("#rate").addClass("bad");
  }
  else {
    $("#rate").removeClass("bad");
  }
  if (depth < 4 || depth > 6){
    $("#depth").addClass("bad");
  }
  else {
    $("#depth").removeClass("bad");
  }
  $("#ended").fadeIn().delay(2000).fadeOut();
});
