var socket = io();
var compressions = [];
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
    y_accessor: 'depth'
  });
});
