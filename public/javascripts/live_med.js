var socket = io();

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
  var socket = io();

  socket.on('status_msg', function(status_msg){
    var capno = parseFloat(status_msg.capno);
    $("#capno").html(capno);
  });

  $(window).on('resize', function() {
    var width = $("#mp50 img").width();
    console.log(width);
    // TODO: handle dynamic resizing
    $("#capno_container").css('font-size', width/12 + "px");
  });

});
