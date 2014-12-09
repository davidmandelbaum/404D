var socket = io();
var compressions = [];
var capnography = [];
var trial_time, starting_time;

var baselines = [{value: 0, label: 'Release to here'}, {value: -7, label: 'Compress to here'}];

$("#capnography > svg > .x-axis > .label").attr("y", 195);
$("#capnography > svg > .y-axis > .label").attr("y", 20);

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
    starting_time = new Date();
  }, 3000);
  setTimeout( function() {
    $("#overlay").fadeOut();
    $(".begin_box").fadeOut();
  }, 4000);
  trial_time = time;
  var elapsed = (new Date() - starting_time)/1000;
  data_graphic({
    title: "Compressions",
    data: compressions,
    target: "#compressions",
    x_accessor: 'time',
    y_accessor: 'depth',
    width: 700,
    height: 500,
    min_x: elapsed - 5,
    max_x: elapsed + 5,
    min_y: -7,
    max_y: 0,
    area: false,
    interpolate: "bundle",
    x_label: "Time (s)",
    y_label: "Depth (cm)",
    baselines: baselines
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
    max_y: 35,
    area: false,
    interpolate: "linear",
    x_label: "Time (s)",
    y_label: "Score"
  });
});

socket.on('data_points', function(data_points) {
  var elapsed = (new Date() - starting_time)/1000;
  var min_x, max_x;
  console.log('elapsed = ' + elapsed);
  min_x = Math.round(elapsed) - 5;
  max_x = Math.round(elapsed) + 5;
  // if (elapsed < 10) {
  //   min_x = 0;
  // }
  // else {
  //   // min_x = Math.round(elapsed/10)*10 - 2;
  //   min_x = elapsed - 5;
  // }
  // if (elapsed < 10) {
  //   max_x = 10;
  // }
  // else {
  //   // max_x = Math.round(elapsed/10)*10 + 8;
  //   max_x = elapsed + 5;
  // }
  // console.log("data points received");
  var i = 0;
  points = JSON.parse(data_points);
  for (i = 0; i < points.length; i++){
    compressions.push({"time": parseFloat(points[i][0]), "depth": -1*parseFloat(points[i][1])});
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
    min_x: min_x,
    max_x: max_x,
    min_y: -7,
    max_y: 0,
    area: false,
    interpolate: "bundle",
    x_label: "Time (s)",
    y_label: "Depth (cm)",
    baselines: baselines,
    transition_on_update: false
  });
});

socket.on('status_msg', function(status_msg) {
  console.log('status_msg!');
  console.log(status_msg);
  console.log(status_msg.time);
  var time = parseFloat(status_msg.time);
  var rate = parseFloat(status_msg.rate);
  var depth = parseFloat(status_msg.depth);
  var depthFixed = depth.toFixed(1);
  compressions_chart.series[0].points[0].update(rate);
  depth_chart.series[0].points[0].update(depth);
  $("#curr_depth").html(depthFixed + "cm");
  var capno = parseFloat(status_msg.capno).toFixed();
  $("#time").html(time.toFixed() + "s");
  $("#rate").html(rate.toFixed() + " /m");
  if (rate > 120 || rate < 100) {
    $("#rate").addClass("bad");
    $("#rate").removeClass("good");
    if (rate >= 120) { 
      $("#slower").addClass("active");
      $("#faster").removeClass("active");
    }
    else {
      $("#slower").removeClass("active");
      $("#faster").addClass("active");
    }
  }
  else {
    $("#slower").removeClass("active");
    $("#faster").removeClass("active");
    $("#rate").addClass("good");
    $("#rate").removeClass("bad");
  }
  if (depth < 4.7 || depth > 6.2){
    $("#depth").addClass("bad");
    $("#depth").removeClass("good");
    if (depth < 4.7){
      $("#harder").addClass("active");
      $("#softer").removeClass("active");
    }
    else {
      $("#harder").removeClass("active");
      $("#softer").addClass("active");
    }
  }
  else {
    $("#harder").removeClass("active");
    $("#softer").removeClass("active");
    $("#depth").addClass("good");
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
    max_y: 35,
    area: false,
    interpolate: "linear",
    x_label: "Time (s)",
    y_label: "Score"
  });
});

socket.on('final_stats', function(final_stats) {
  $(".begin_box").addClass("ended");
  $("#begin_text").html("TRIAL ENDED");
  window.setTimeout(function() {
    $(".begin_box").fadeIn();
  }, 500);
  window.setTimeout(function() {
    $(".begin_box").fadeOut();
  }, 2000);
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
    min_y: -7,
    max_y: 0,
    area: false,
    interpolate: "bundle",
    x_label: "Time (s)",
    y_label: "Depth (cm)",
    baselines: baselines
  });
});

