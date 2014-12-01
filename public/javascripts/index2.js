var socket = io();
var compressions = [];
var capnography = [];
var trial_time, starting_time;

// var opts = {
//   lines: 12, // The number of lines to draw
//   angle: 0.15, // The length of each line
//   lineWidth: 0.44, // The line thickness
//   pointer: {
//     length: 0.9, // The radius of the inner circle
//     strokeWidth: 0.035, // The rotation offset
//     color: '#000000' // Fill color
//   },
//   limitMax: 'false',   // If true, the pointer will not go past the end of the gauge
//   percentColors: [[0.0, "#FC0000"], [0.50, "#F0FC00"], [0.80, "#F0FC00"], [1.0, "#24D600"]],
//   strokeColor: '#E0E0E0',   // to see which ones work best for you
//   generateGradient: true
// };
// 
// var target = document.getElementById('depth_gauge'); // your canvas element
// var gauge = new Gauge(target).setOptions(opts); // create sexy gauge!
// gauge.maxValue = 6; // set max gauge value
// gauge.animationSpeed = 4; // set animation speed (32 is default value)

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
  var elapsed = (new Date() - starting_time)/1000;
  var min_x, max_x;
  if (elapsed < 10) {
    min_x = 0;
  }
  else {
    min_x = elapsed - 5;
  }
  if (elapsed < 10) {
    max_x = 10;
  }
  else {
    max_x = elapsed + 5;
  }
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
    min_x: 0,
    max_x: trial_time,
    // min_x: min_x,
    // max_x: max_x,
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
  // gauge.set(depth);
  $("#curr_depth").html(depth + "cm");
  var capno = parseFloat(status_msg.capno).toFixed(2);
  $("#time").html(time + "s");
  $("#rate").html(rate + " /m");
  if (rate >= 120 || rate <= 100) {
    $("#rate").addClass("bad");
    $("#rate").removeClass("good");
    if (rate >= 120) { 
      $("#slower").fadeTo("fast", "1");
      $("#faster").fadeTo("fast", "0");
    }
    else {
      $("#slower").fadeTo("fast", "0");
      $("#faster").fadeTo("fast", "1");
    }
  }
  else {
    $("#slower").fadeTo("fast", "0");
    $("#faster").fadeTo("fast", "0");
    $("#rate").addClass("good");
    $("#rate").removeClass("bad");
  }
  if (depth < 4 || depth > 6){
    $("#depth").addClass("bad");
    $("#depth").removeClass("good");
    if (depth < 4){
      $("#harder").fadeTo("fast", "1");
      $("#softer").fadeTo("fast", "0");
    }
    else {
      $("#harder").fadeTo("fast", "0");
      $("#softer").fadeTo("fast", "1");
    }
  }
  else {
    $("#harder").fadeTo("fast", "0");
    $("#softer").fadeTo("fast", "0");
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
    max_y: 1250,
    area: false,
    interpolate: "linear",
    x_label: "Time (s)",
    y_label: "ETCO2 (mmHg)"
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
    min_y: -6,
    max_y: 0,
    area: false,
    interpolate: "linear",
    x_label: "Time (s)",
    y_label: "Depth (cm)"
  });
});
