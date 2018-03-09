require("./lib/social"); //Do not delete
require("./lib/leaflet-mapbox-gl");
var d3 = require('d3');

var min_zoom_deg = 4;
var max_zoom_deg = 16;

console.log(sf);

breakins2017 = breakins2017;
console.log(breakins2017);

// setting parameters for the center of the map and initial zoom level
if (screen.width <= 340) {
  var sf_lat = 5;
  var sf_long = -110;
  var zoom_deg = 2;

  var offset_top = $(window).height();
  var bottomOffset = 200;

} else if (screen.width <= 480) {
  var sf_lat = 15;
  var sf_long = -100;
  var zoom_deg = 2.5;

  var offset_top = $(window).height();
  var bottomOffset = 200;

} else if (screen.width <= 768) {

  var sf_lat = 13;
  var sf_long = -118.5;
  var zoom_deg = 3;

  var offset_top = $(window).height()/4;
  var bottomOffset = 200;

} else {
  var sf_lat = 37.7749;
  var sf_long = -122.4294;
  var zoom_deg = 13;
  var offset_top = $(window).height()/3;
  var bottomOffset = 200;
}

console.log(offset_top);

var timeTimeout = 1;

// tooltip information
function tooltip_function (d) {
  var html_str = "string";
  // var html_str = "<div class='name'>"+d["City Or County"]+", "+d["State"]+"</div><div class='killed-count'>"+d.Killed+" Killed</div><div class='injured-count'>"+d.Injured+" Injured</div>"
  return html_str;
}

// function that zooms and pans the data when the map zooms and pans
function update() {
	circles.attr("transform",
	function(d) {
		return "translate("+
			map.latLngToLayerPoint(d.LatLng).x +","+
			map.latLngToLayerPoint(d.LatLng).y +")";
		}
	)
}

// initialize map with center position and zoom levels
var map = L.map("map", {
  minZoom: min_zoom_deg,
  maxZoom: max_zoom_deg,
  zoomControl: false,
  scrollWheelZoom: false,
  attributionControl: false
}).setView([sf_lat,sf_long], zoom_deg);


console.log(sf);
// console.log(JSON.parse(sf));

// // initializing the svg layer
// L.svg().addTo(map);
//
var gl = L.mapboxGL({
    accessToken: 'pk.eyJ1IjoiZW1ybyIsImEiOiJjaXl2dXUzMGQwMDdsMzJuM2s1Nmx1M29yIn0._KtME1k8LIhloMyhMvvCDA',
    style: 'mapbox://styles/emro/cj8lviggc6b302rqjyezdqc2m'
}).addTo(map);

var attribution = L.control.attribution();
attribution.setPrefix('');
attribution.addAttribution('Map data: <a href="http://openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a> <a href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox</a> | <a href="https://www.mapbox.com/map-feedback/" target="_blank" class="mapbox-improve-map">Improve this map</a>');
attribution.addTo(map);

// zoom control is on top right
L.control.zoom({
     position:'bottomright'
}).addTo(map);

map.doubleClickZoom.enable();

// var getColor = d3.scaleOrdinal(d3.schemeCategory20c);

function style(feature) {
  console.log(feature.properties.blockce10);
  var count = +feature.properties.countbreakins/1356;
  if (isNaN(count)){
    console.log("we have an error");
    count = 0;
  }
  return {
    fillColor: "yellow",//getColor(count),
    weight: 0,
    opacity: 1,
    color: 'white',
    dashArray: '0',
    fillOpacity: count-0.1,
    className: "feature"+feature.properties.blockce10
  };
}
L.geoJSON(sf,{style: style}).addTo(map);


// creating Lat/Lon objects that d3 is expecting
breakins2017.forEach(function(d,idx) {
	d.LatLng = new L.LatLng(d.Latitude, d.Longitude);
  if (d.Address == "Grand Total"){
    d.Count = 0;
  }
});

var svg = d3.select("#map").select("svg"),
g = svg.append("g");

var circles = g.selectAll("g")
  .data(breakins2017)
  .enter()
  .append("g");

// adding circles to the map
circles.append("circle")
  .attr("class",function(d) {
    var class_str = "dot "+d.Class+" "+d.ExtraClass;
    return class_str;
  })
  .style("opacity",function(d){
    if (d.Class == "breakin") {
      return 0.3;
    } else {
      return 0;
    }
  })
  .style("fill", function(d) {
    if (d.Class == "breakin"){
      return "#FDE74C";
    } else {
      return "#FF9393";
    }
  })
  .style("stroke","#696969")
  .attr("r", function(d) {
    // console.log(d.Count);
    if (d.Class == "breakin"){
      return 4+d.Count/20;
    } else {
      return 4;
    }
  });

map.on("viewreset", update);
update();

map.on("zoom",update)

// show tooltip
var tooltip = d3.select("div.tooltip-map");


// initial variable, which indicates that map is on landing on load
var prevmapIDX = -1;

// set up scrolling timeout
// var scrollTimer = null;
// $(window).scroll(function () {
//     // document.getElementById("tooltip").style.visibility = "hidden";
//     if (scrollTimer) {
//         clearTimeout(scrollTimer);   // clear any previous pending timer
//     }
//     scrollTimer = setTimeout(handleScroll, timeTimeout);   // set new timer
// });

$(window).scroll(function () {
  handleScroll();
});

// function for updating with scroll
function handleScroll() {

  scrollTimer = null;

  // figure out where the top of the page is, and also the top and beginning of the map content
  var pos = $(this).scrollTop();
  var pos_map_top = $('#bottom-of-top').offset().top;
  var pos_map_bottom = $('#top-of-bottom').offset().top-bottomOffset;

  // show the landing of the page if the reader is at the top
  if (pos < pos_map_top){
    var prevmapIDX = -1;
    $(".arrest").css({opacity: 0})
    $(".leaflet-interactive").css({opacity: 0.3})
    // $("#tooltip").css({display: "block"});

  // show the appropriate dots if the reader is in the middle of the page
  } else if (pos < pos_map_bottom){
    var currentIDX = -1;
    categoryData.forEach(function(cat,catIDX) {
      var pos_map = $('#mapevent'+catIDX).offset().top-offset_top;
      if (pos > pos_map) {
        currentIDX = Math.max(catIDX,currentIDX);
      }
    });
    console.log(currentIDX);
    if (currentIDX > -1){
      $(".dot").css({opacity: 0});
      $(".hidden-image").css({opacity: 0});
      if (categoryData[+currentIDX]["Key"] == "faded") {
        $(".leaflet-interactive").css({opacity: 0.1})
      } else {
        $("."+categoryData[+currentIDX]["Key"]).css({opacity: 0.8})
      }
      if (categoryData[+currentIDX]["Graphic"] || categoryData[+currentIDX]["Photo"]) {
        $("#image"+currentIDX).css({opacity: 1});
      }

      // if (categoryData[+currentIDX]["Key"] != "LasVegas" && categoryData[+currentIDX]["Key"] != "Total") {
      //   $(".LasVegas").css({opacity: 0});
      // }
    }
    // $("#tooltip").css({display: "none"});
  }
}
