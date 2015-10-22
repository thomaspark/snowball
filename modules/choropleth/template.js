(function($) {
  $(document).ready(function() {

    var choropleths = $(".snowball-block-choropleth");
    choropleths.each(function() {
      drawMap($(this));
    });

  });
})(jQuery);


function drawMap(block) {
  var snowball = snowball || window.parent.snowball;
  var path = snowball.pluginsUrl + "/lib/d3-geomap";

  var json = block.find(".json-usa").val();
  var container = block.find(".map").get(0);
  var quantize = parseInt(block.find("input.quantize").val());
  var color = block.find("input.color").val();
  var palette = colorbrewer[color][quantize];

  var mapType = block.find(".map-type").val();
  var file = path + "/topojson/countries/USA.json";
  var projection = d3.geo.albersUsa;
  var scale = 800;

  if (mapType === "world") {
    json = block.find(".json-world").val();
    file = path + "/topojson/world/countries.json";
    projection = d3.geo.equirectangular;
    scale = 100;
  }

  if (json) {
    block.find(".map").empty();

    var map = d3.geomap.choropleth()
      .geofile(file)
      .projection(projection)
      .column("Value")
      .unitId("fips")
      .scale(scale)
      .translate([400, 200])
      .colors(palette)
      .legend(true);

     var svg = d3.select(container)
       .datum(JSON.parse(json))
       .call(map.draw, map)
       .select("svg").attr("preserveAspectRatio", "xMinYMin meet").attr("viewBox", "0 0 500 400");

    svg.select("rect").style("fill", "none");
  }
}
