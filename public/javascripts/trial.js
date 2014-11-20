var capnography = [];

$("#download_link").html(link_text);

var i = 0;
for (i = 0; i < stats.length; i++) {
  capnography.push( {"time": stats[i].time, "capno": stats[i].capno });
}

var compressions_width, capno_width;
if ($("#compressions_stage").length > 0)
  compressions_width = $("#compressions_stage").width();
else
  compressions_width = 700;
if ($("#capno_stage").length > 0)
  capno_width = $("#capno_stage").width() - 20;
else
  capno_width = 300;

data_graphic({
  title: "Compressions",
  data: compressions,
  target: "#compressions",
  x_accessor: 'time',
  y_accessor: 'depth',
  width: compressions_width,
  height: 300,
  min_x: 0,
  // max_x: 10,
  max_x: trial_time,
  min_y: 0,
  max_y: 5,
  area: false,
  interpolate: "linear",
  x_label: "Time (s)",
  y_label: "Depth (cm)",
  top: 20
});

data_graphic({
  title: "Capnography",
  data: capnography,
  target: "#capnography",
  x_accessor: 'time',
  y_accessor: 'capno',
  width: capno_width,
  height: 280,
  min_x: 0,
  max_x: trial_time,
  min_y: 0,
  max_y: 1250,
  area: false,
  interpolate: "linear",
  x_label: "ETCO2 (mmHg)",
  y_label: "Time (s)",
  top: 20
});

var time = parseFloat(final_stats.time);
var rate = parseFloat(final_stats.rate);
var depth = parseFloat(final_stats.depth);
var capno = parseFloat(stats[stats.length-1].capno);
$("#title").html("Final Statistics");
$("#time").html(time + "s");
$("#rate").html(rate + " /m");
$("#depth").html(depth + " cm");
$("#capno").html(capno.toFixed(2));
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

$("#capnography > svg > .x-axis > .label").attr("y", 275);
$("#capnography > svg > .y-axis > .label").attr("y", 10);
