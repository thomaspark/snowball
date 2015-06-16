(function($) {
  $(document).ready(function() {

    $(".snowball-main").on("open", ".snowball-block-chart", function() {
      console.log("loaded");
      var container = $(this).find(".chart").get(0);

      var data = [
        ["", "Ford", "Volvo", "Toyota", "Honda"],
        ["2014", 10, 11, 12, 13],
        ["2015", 20, 11, 14, 13],
        ["2016", 30, 15, 12, 13]
      ];

      var hot = new Handsontable(container, {
        data: data,
        minSpareRows: 1,
        rowHeaders: true,
        colHeaders: true,
        contextMenu: true,
        stretchH: "all"
      });

    });
  });

})(jQuery);
