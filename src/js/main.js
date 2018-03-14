require("./lib/social"); //Do not delete
require("./lib/leaflet-mapbox-gl");
var d3 = require('d3');

var min_zoom_deg = 4;
var max_zoom_deg = 16;

breakins2017 = breakins2017;

function zfill(number, size) {
  number = number.toString();
  while (number.length < size) number = "0" + number;
  return number;
}

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
  var zoom_deg = 12;
  var offset_top = $(window).height()/3;
  var bottomOffset = 200;
}

console.log(offset_top);

// var timeTimeout = 1;

// tooltip information
function tooltip_function (d) {
  var html_str = "string";
  // var html_str = "<div class='name'>"+d["City Or County"]+", "+d["State"]+"</div><div class='killed-count'>"+d.Killed+" Killed</div><div class='injured-count'>"+d.Injured+" Injured</div>"
  return html_str;
}

// initialize map with center position and zoom levels
var map = L.map("map", {
  // minZoom: min_zoom_deg,
  // maxZoom: max_zoom_deg,
  zoomControl: false,
  scrollWheelZoom: false,
  // attributionControl: false,
  // doubleClickZoom: false
}).setView([sf_lat,sf_long], zoom_deg);

var gl = L.mapboxGL({
    accessToken: 'pk.eyJ1IjoiZW1ybyIsImEiOiJjaXl2dXUzMGQwMDdsMzJuM2s1Nmx1M29yIn0._KtME1k8LIhloMyhMvvCDA',
    style: 'mapbox://styles/emro/cj8bybgjo6muo2rpu8r43ur4z'
}).addTo(map);

// add tiles to the map
// var mapLayer = L.tileLayer("https://api.mapbox.com/styles/v1/emro/cj8bybgjo6muo2rpu8r43ur4z/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZW1ybyIsImEiOiJjaXl2dXUzMGQwMDdsMzJuM2s1Nmx1M29yIn0._KtME1k8LIhloMyhMvvCDA",{attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>'})
// mapLayer.addTo(map);

// var attribution = L.control.attribution();
// attribution.setPrefix('');
// attribution.addAttribution('Map data: <a href="http://openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a> <a href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox</a> | <a href="https://www.mapbox.com/map-feedback/" target="_blank" class="mapbox-improve-map">Improve this map</a>');
// attribution.addTo(map);

// zoom control is on top right
// L.control.zoom({
//      position:'bottomright'
// }).addTo(map);

// map.doubleClickZoom.enable();

// var getColor = d3.scaleOrdinal(d3.schemeCategory20c);

function style(feature) {
  // console.log(feature.properties.blockce10);
  var count = +feature.properties.countbreakins/20;
  if (isNaN(count)){
    console.log("we have an error");
    count = 0;
  }
  return {
    fillColor: "#7EC3DA",//getColor(count),
    weight: 0,
    opacity: 1,
    color: 'white',
    dashArray: '0',
    fillOpacity: count+0.1,
    className: "feature"+zfill(+feature.properties.geoid10,15)
  };
}
var breakinLayer = L.geoJSON(sf,{style: style}).addTo(map);

function buildmap(){

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
      var class_str = "dot hidden "+d.Class;
      return class_str;
    })
    .style("fill", function(d) {
      if (d.Class == "breakin"){
        return "#7EC3DA";
      } else if (d.Class == "arrest"){
        return "#EF2917";//"#FF9393";
      } else {
        return "#EF8A17";
      }
    })
    .style("opacity",function(d){
      if (d.Class == "breakin" || d.Class == "breakin2003") {
        return 0.4*d.Count;
      } else if (d.Class == "arrest"){
        return 1;
      }
    })
    .style("stroke","#696969")
    .attr("r", function(d) {
      if (d.Class == "breakin"){
        return 2+d.Count/10;
      } else if (d.Class == "arrest"){
        return 4+d.Count/20;
      } else {
        return 2+d.Count/10;
      }
    });

  map.on("viewreset", update);
  // update();
  // function that zooms and pans the data when the map zooms and pans
  function update() {
    console.log("updating");
    circles.attr("transform",
    function(d) {
      return "translate("+
        map.latLngToLayerPoint(d.LatLng).x +","+
        map.latLngToLayerPoint(d.LatLng).y +")";
      }
    )
  }

  map.on("zoom",update);
  // map.fitBounds([[37.811613,-122.523439],[37.725038, -122.379930]]);
  update();

  // show tooltip
  var tooltip = d3.select("div.tooltip-map");

}

// initial variable, which indicates that map is on landing on load
var prevmapIDX = -1;

// set up scrolling timeout
var timeTimeout = 100;
var scrollTimer = null;
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
var nomap = 1;

buildmap();
nomap = 0;

$(".leaflet-interactive").addClass("hidden");
$(".breakin").removeClass("hidden");
$(".arrest").removeClass("hidden");

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

  // show the landing of the page if the reader is at the top
  if (pos < pos_map_top){
    prevIDX = -1;

    $(".leaflet-interactive").removeClass("lowopacity");
    $(".leaflet-interactive").removeClass("bright");
    $(".leaflet-interactive").removeClass("hidden");
    $(".dot").addClass("hidden");
    map.fitBounds([[37.807002,-122.517603],[37.770102,-122.372721]]);

  // show the appropriate dots if the reader is in the middle of the page
  } else if (pos < pos_map_bottom){
    currentIDX = -1;
    categoryData.forEach(function(cat,catIDX) {
      var pos_map = $('#mapevent'+catIDX).offset().top-offset_top;
      if (pos > pos_map) {
        currentIDX = Math.max(catIDX,currentIDX);
      }
    });
    console.log(currentIDX);
    if (+currentIDX >= 10){
      map.fitBounds([[37.807002,-122.517603],[37.770102,-122.372721]]);
    }
    if (currentIDX > -1){

      if (categoryData[+currentIDX]["Key"] == "dots") {

        if (nomap == 1){
          buildmap();
          nomap = 0;
        }
        $(".leaflet-interactive").addClass("hidden");
        $(".breakin").removeClass("hidden");
        $(".arrest").addClass("hidden");
        // map.fitBounds([[37.807002,-122.517603],[37.770102,-122.372721]]);
        // map.panTo([37.777790, -122.423917])
        // update();

      } else if (categoryData[+currentIDX]["Key"] == "arrests"){

        // if (nomap == 1){
        //   buildmap();
        //   nomap = 0;
        // }
        $(".leaflet-interactive").addClass("hidden");
        $(".breakin").removeClass("hidden");
        $(".arrest").removeClass("hidden");
        // map.fitBounds([[37.807002,-122.517603],[37.770102,-122.372721]]);
        map.panTo([37.777790, -122.423917])

      } else if (categoryData[+currentIDX]["Key"] == "breakins2003"){
        $(".leaflet-interactive").addClass("hidden");
        $(".breakin2003").removeClass("hidden");
      } else {
        $(".dot").addClass("hidden");
        $(".leaflet-interactive").removeClass("hidden");
      }

      if (categoryData[+currentIDX]["Key"] == "faded") {
        $(".leaflet-interactive").removeClass("lowopacity");
        $(".leaflet-interactive").removeClass("bright");
      } else {
        $(".leaflet-interactive").removeClass("bright");
        $(".leaflet-interactive").addClass("lowopacity");
        if (categoryData[+currentIDX]["Key"]){
          var keys = categoryData[+currentIDX]["Key"].split(", ");
          for (var kk=0; kk<keys.length; kk++){
            $("."+keys[kk]).removeClass("lowopacity");
            $("."+keys[kk]).addClass("bright");
          }
        }
        if (+currentIDX != prevIDX && categoryData[+currentIDX]["Bounds"]){
          var boundskey = categoryData[+currentIDX]["Bounds"];
          // $(".arrest").removeClass("hidden");
          if (boundskey == "tourist"){
            // map.flyToBounds([[37.813982,-122.501767],[37.765010,-122.377484]]);
            // map.panTo([37.777790, -122.423917])
          } else if (boundskey == "ggp"){
            // map.flyToBounds([[37.771389,-122.510994],[37.766029,-122.452200]]);
            // map.panTo([37.769288, -122.481039]);
          } else if (boundskey == "palace"){
            // map.flyToBounds([[37.809916,-122.458465],[37.796488,-122.436750]]);
            // map.panTo([37.802785, -122.449151]);
          } else if (boundskey == "alamo"){
            // map.flyToBounds([[37.786651,-122.452543],[37.758089,-122.412374]]);
            // map.panTo([37.776400, -122.434817]);
          } else if (boundskey == "pointlobos"){
            // map.flyToBounds([[37.786244,-122.526873],[37.749606,-122.493055]]);
            // map.panTo([37.775365, -122.512516]);
          } else if (boundskey == "parkinglots"){
            // map.flyToBounds([[37.796554,-122.499922],[37.724899,-122.380102]]);
            // map.panTo([37.765578, -122.445203]);
          } else if (boundskey == "dogpatch"){
            // map.flyToBounds([[37.767249,-122.409456],[37.747841,-122.376755]]);
            // map.panTo([37.760981, -122.390035]);
          }
        }
      }
    }
  }
}
