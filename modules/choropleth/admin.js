(function($) {
  $("#snowball-main").on("open", ".snowball-block-choropleth", function() {
      var block = $(this);
      var container = block.find(".table").get(0);
      var data;

      var quantize = $(this).find("[data-target='quantize']").val();
      $(this).find(".quantize-output").text(quantize);

      if (block.find("[data-target='JSON']").val()) {
        data = JSON.parse(block.find("[data-target='JSON']").val());
        initTable(block, container, data);
      } else {
        $.getJSON(snowball.pluginsUrl + "/modules/choropleth/snowfall.json", function(data) {
          initTable(block, container, data);
        });
      }
    });

    $("#snowball-main").on("rendered", ".snowball-block-choropleth", function() {
      var block = $(this);
      var iframe = block.find(".snowball-preview");
      var map = iframe.contents().find(".map");
      var draw = iframe[0].contentWindow.drawMap;

      if (map && draw) {
        draw(iframe.contents().find(".snowball-block-choropleth"));
      }
    });


    $("#snowball-main").on("input change", ".snowball-block-choropleth [data-target='quantize']", function() {
      var block = $(this).parents(".snowball-block-choropleth");
      var quantize = $(this).val();

      block.find(".quantize-output").text(quantize);
    });

    function initTable(block, container, data) {
      var hot = new Handsontable(container, {
              data: data,
              rowHeaders: false,
              fixedRowsTop: 0,
              colHeaders: ["fips", "State", "Value"],
              columns: [{data: "fips", readOnly: true}, {data: "State", readOnly: true}, {data: "Value"}],
              columnSorting: false,
              manualColumnMove: false,
              manualColumnResize: false,
              contextMenu: true,
              multiSelect: true,
              persistantState: true,
              fillHandle: true,
              observeChanges: true,
              search: true,
              undo: true,
              readOnly: false,
              stretchH: "all",
              afterChange: function() {
                refreshOnChange(block, data);
              }
            });
    }

    function refreshOnChange(block, data) {
      var generatedJSON = data;
      var jsonString = JSON.stringify(generatedJSON);

      block.find("[data-target='JSON']").val(jsonString);
      block.trigger("render");
    }

})(jQuery);
