(function($) {
  $(document).ready(function() {

    var choropleths = $(".snowball-block-bargraph");
    choropleths.each(function() {
      drawBargraph($(this));
    });

  });
})(jQuery);

function drawBargraph(block) {
  var json = block.find(".json").val();
  var container = block.find(".chart").get(0);
  var size = block.find(".size").val();
  var data = JSON.parse(json);
  var valuesArray = [];

  var margin = {top: 40, right: 40, bottom: 60, left: 30};
  var width = 800 - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;

  var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.05);
  var y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");
  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10);
  var svg = d3.select(container).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    x.domain(data.map(function(d) { return d.label; }));
    y.domain([0, d3.max(data, function(d) { return d.value; })]);
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
    svg.selectAll("bar")
        .data(data)
      .enter().append("rect")
        .attr("x", function(d) { return x(d.label); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); });
}