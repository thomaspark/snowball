(function($) {
  $(document).ready(function() {

    var choropleths = $(".snowball-block-scatterplot");
    choropleths.each(function() {
      drawScatterplot($(this));
    });

  });
})(jQuery);

function drawScatterplot(block) {
  var json = block.find(".json").val();

  if (json) {
    var container = block.find(".chart").get(0);
    var size = block.find(".size").val();
    var color = block.find(".chart").attr("data-fill");
    var data = JSON.parse(json);
    var dataset = [];
    var xdata = [];
    var ydata = [];

    data.forEach(function(d) {
      dataset.push([d.X, d.Y]);
      xdata.push(d.X);
      ydata.push(d.Y);
    });

    var margin = {top: 40, right: 40, bottom: 60, left: 60};
    var width = 800 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    var x = d3.scale.linear()
              .domain([0, d3.max(xdata)])
              .range([ 0, width ]);

    var y = d3.scale.linear()
              .domain([0, d3.max(ydata)])
              .range([ height, 0 ]);

    var chart = d3.select(container)
      .append('svg:svg')
      .attr('width', width + margin.right + margin.left)
      .attr('height', height + margin.top + margin.bottom)
      .attr('class', 'chart');

    var main = chart.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'main');

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom');

    main.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .attr('class', 'main axis date')
      .call(xAxis);

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left');

    main.append('g')
      .attr('transform', 'translate(0,0)')
      .attr('class', 'main axis date')
      .call(yAxis);

    main.selectAll("path, line")
      .style("fill", "none")
      .style("stroke", "black");

    var g = main.append("svg:g"); 

    g.selectAll("scatter-dots")
      .data(ydata)
      .enter().append("svg:circle")
        .style("fill", color)
        .attr("cy", function (d) { return y(d); } )
        .attr("cx", function (d,i) { return x(xdata[i]); } )
        .attr("r", size);

  }
}
