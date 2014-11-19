var socket = io();

var opts = {
  lines: 12, // The number of lines to draw
  angle: 0.15, // The length of each line
  lineWidth: 0.44, // The line thickness
  pointer: {
    length: 0.9, // The radius of the inner circle
    strokeWidth: 0.035, // The rotation offset
    color: '#000000' // Fill color
  },
  limitMax: 'false',   // If true, the pointer will not go past the end of the gauge
  percentColors: [[0.0, "#FC0000"], [0.50, "#F0FC00"], [1.0, "#24D600"]],
  strokeColor: '#E0E0E0',   // to see which ones work best for you
  generateGradient: true
};
var target = document.getElementById('depth_gauge'); // your canvas element
var gauge = new Gauge(target).setOptions(opts); // create sexy gauge!
gauge.maxValue = 6; // set max gauge value
gauge.animationSpeed = 32; // set animation speed (32 is default value)

socket.on('depth', function(depth) {
  var val = depth.value;
  console.log(val*5);
  gauge.set(val*5); // set actual value
  $("#depth").html(val*5);
});

