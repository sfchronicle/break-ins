require("./lib/social");

// setting parameters for the center of the map and initial zoom level
if (screen.width <= 480) {
  var offset_top = $(window).height();
  var bottomOffset = 200;
} else if (screen.width <= 768) {
  var offset_top = $(window).height()/4;
  var bottomOffset = 300;
} else {
  var offset_top = $(window).height()/3;
  var bottomOffset = 400;
}

$(window).scroll(function () {
  handleScroll();
});

// function for updating with scroll
var prevIDX = -1;
var currentIDX = -1;
function handleScroll() {

  prevIDX = currentIDX;
  scrollTimer = null;

  // figure out where the top of the page is, and also the top and beginning of the map content
  var pos = $(this).scrollTop();
  var pos_map_top = $('#bottom-of-top').offset().top;
  var pos_map_bottom = $('#top-of-bottom').offset().top-bottomOffset;
  console.log(pos_map_top);

  // show the landing of the page if the reader is at the top
  if (pos < pos_map_top){
    console.log("at the top");
    currentIDX = -1;

  // show the appropriate dots if the reader is in the middle of the page
  } else if (pos < pos_map_bottom){
    currentIDX = -1;
    categoryData.forEach(function(cat,catIDX) {
      var pos_map = $('#mapevent'+catIDX).offset().top-offset_top;
      if (pos > pos_map) {
        currentIDX = Math.max(catIDX,currentIDX);
      }
    });
  }
  $("#background"+prevIDX).removeClass("visible");
  $("#background"+currentIDX).addClass("visible");


}
