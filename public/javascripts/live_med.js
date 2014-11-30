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
    $("#capno").html(capno.toFixed());
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
  });



  $(window).on('resize', function() {
    var width = $("#mp50 img").width();
    console.log(width);
    // TODO: handle dynamic resizing
    $("#capno_container").css('font-size', width/12 + "px");
  });

});
