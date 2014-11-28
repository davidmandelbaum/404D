var socket = io();
var compressions = [];
var capnography = [];
var trial_time;

socket.on('begin', function(time) {
  $(".begin_box").removeClass("waiting_manikin");
  $("#begin_text").html("BEGIN IN 3");
  setTimeout( function() {
    $("#begin_text").html("BEGIN IN 2");
  }, 1000);
  setTimeout( function() {
    $("#begin_text").html("BEGIN IN 1");
  }, 2000);
  setTimeout( function() {
    $("#begin_text").html("BEGIN");
  }, 3000);
  setTimeout( function() {
    $("#overlay").fadeOut();
    $(".begin_box").fadeOut();
  }, 4000);
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
    max_x: 10,
    // max_x: trial_time,
    min_y: -6,
    max_y: 0,
    area: false,
    interpolate: "linear",
    x_label: "Time (s)",
    y_label: "Depth (cm)"
  });
  data_graphic({
    title: "Capnography",
    data: capnography,
    target: "#capnography",
    x_accessor: 'time',
    y_accessor: 'capno',
    width: 300,
    height: 200,
    min_x: 0,
    max_x: trial_time,
    min_y: 0,
    max_y: 1250,
    area: false,
    interpolate: "linear",
    x_label: "Time (s)",
    y_label: "ETCO2 (mmHg)"
  });
});

socket.on('data_points', function(data_points) {
  // console.log("data points received");
  var i = 0;
  points = JSON.parse(data_points);
  for (i = 0; i < points.length; i++){
    compressions.push({"time": parseFloat(points[i][0]), "depth": -1*parseFloat(points[i][1])});
  }
  // console.log(compressions);
  data_graphic({
    title: "Compressions",
    data: compressions,
    target: "#compressions",
    x_accessor: 'time',
    y_accessor: 'depth',
    width: 700,
    height: 500,
    //min_x: 0,
    // max_x: trial_time,
    min_x: compressions[compressions.length-1].time - 10,
    max_x: compressions[compressions.length-1].time,
    min_y: -6,
    max_y: 0,
    area: false,
    interpolate: "linear",
    x_label: "Time (s)",
    y_label: "Depth (cm)"
  });
});

socket.on('status_msg', function(status_msg) {
  console.log('status_msg!');
  console.log(status_msg);
  console.log(status_msg.time);
  var time = parseFloat(status_msg.time);
  var rate = parseFloat(status_msg.rate);
  var depth = parseFloat(status_msg.depth).toFixed(2);
  var capno = parseFloat(status_msg.capno).toFixed(2);
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
    height: 200,
    min_x: 0,
    max_x: trial_time,
    min_y: 0,
    max_y: 1250,
    area: false,
    interpolate: "linear",
    x_label: "Time (s)",
    y_label: "ETCO2 (mmHg)"
  });
});

socket.on('final_stats', function(final_stats) {
  console.log('final stats!');
  console.log(final_stats);
  var time = parseFloat(final_stats.time);
  var rate = parseFloat(final_stats.rate);
  var depth = parseFloat(final_stats.depth);
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
    min_y: -6,
    max_y: 0,
    area: false,
    interpolate: "linear",
    x_label: "Time (s)",
    y_label: "Depth (cm)"
  });
});
