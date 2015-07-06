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

  var json = block.find("input.json").val();
  var container = block.find(".map").get(0);
  var quantize = parseInt(block.find("input.quantize").val());
  var color = block.find("input.color").val();
  var palette = colorbrewer[color][quantize];

  if (json) {
    block.find(".map").empty();

    var map = d3.geomap.choropleth()
      .geofile(path + "/topojson/countries/USA.json")
      .projection(d3.geo.albersUsa)
      .column("Value")
      .unitId("fips")
      .scale(800)
      .translate([400, 200])
      .colors(palette)
      .legend(true);

   d3.select(container)
     .datum(JSON.parse(json))
     .call(map.draw, map)
     .selectAll("svg").attr("preserveAspectRatio", "xMinYMin meet").attr("viewBox", "0 0 500 400");
  }
}
