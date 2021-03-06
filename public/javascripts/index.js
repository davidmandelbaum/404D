var chart;
var data = [];

Highcharts.setOptions({
  global: {
    useUTC: false
  }
});

chart = new Highcharts.Chart({
  chart: {
    type: 'spline',
      animation: Highcharts.svg, // don't animate in old IE
      marginRight: 10,
      renderTo: 'container',
      events: {
        load: function () {
          console.log("loaded!");
        }
      }
  },
      title: {
        text: 'Compression data'
      },
      xAxis: {
        type: 'linear',
      tickPixelInterval: 150,
      min: 0,
      max: 30
      },
      yAxis: {
        min: 0,
        max: 6,
        reversed: true,
        title: {
          text: 'Value'
        },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }]
      },
      tooltip: {
        formatter: function () {
          return '<b>' + this.series.name + '</b><br/>' +
              Hichcharts.numberFormat(this.x, 2) + '<br/>' +
              Highcharts.numberFormat(this.y, 2);
        }
      },
      legend: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
      series: [{
        name: 'Random data',
        data: data
      }]
});

var socket = io();
socket.on('data_point', function(data_point) {
  console.log('data point!');
  console.log(data_point);
  var x = parseFloat(data_point[0][0]);
  console.log('time = ' + x);
  var y = parseFloat(data_point[0][1]);
  console.log('depth = ' + y);
  chart.series[0].addPoint([x, y], true);
});

socket.on('data_points', function(data_points) {
  console.log('data points!');
  console.log(data_points);
  points = JSON.parse(data_points);
  console.log('points = ' + points);
  var i = 0;
  for (i = 0; i < points.length; i++){
    var x = parseFloat(points[i][0]);
    var y = parseFloat(points[i][1]);
    chart.series[0].addPoint([x, y], true);
  }
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
});
