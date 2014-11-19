var capnography = [];

var i = 0;
for (i = 0; i < stats.length; i++) {
  capnography.push( {"time": stats[i].time, "capno": stats[i].capno });
}

data_graphic({
  title: "Compressions",
  data: compressions,
  target: "#compressions",
  x_accessor: 'time',
  y_accessor: 'depth',
  width: 700,
  height: 500,
  min_x: 0,
  // max_x: 10,
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
  height: 200,
  min_x: 0,
  max_x: trial_time,
  min_y: 0,
  max_y: 1250,
  area: false,
  interpolate: "linear"
});

var time = parseFloat(final_stats["time"]);
var rate = parseFloat(final_stats["rate"]);
var depth = parseFloat(final_stats["depth"]);
var capno = parseFloat(stats[stats.length-1].capno);
$("#title").html("Final Statistics");
$("#time").html(time + "s");
$("#rate").html(rate + " /m");
$("#depth").html(depth + " cm");
$("#capno").html(capno);
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
