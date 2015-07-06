(function($) {

  $("#snowball-main").on("open", ".snowball-block-choropleth", function() {
    var block = $(this);
    var container = block.find(".table").get(0);
    var mapType = block.find("[data-target='map-type']").val();
    var data;

    var quantize = $(this).find("[data-target='quantize']").val();
    $(this).find(".quantize-output").text(quantize);

    if (block.find("[data-target='JSON']").val()) {
      data = JSON.parse(block.find("[data-target='JSON']").val());
      initTable(block, container, data, mapType);
    } else {

      if (mapType === "usa") {
        $.getJSON(snowball.pluginsUrl + "/modules/choropleth/snowfall.json", function(data) {
          initTable(block, container, data, mapType);
        });
      } else {
        $.getJSON(snowball.pluginsUrl + "/modules/choropleth/precipitation.json", function(data) {
          initTable(block, container, data, mapType);
        });
      }

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


  $("#snowball-main").on("change", ".snowball-block-choropleth [data-target='map-type']", function() {
    var block = $(this).closest(".snowball-block-choropleth");
    var hot = block.data("hot");
    var mapType = $(this).val();

    if (mapType === "usa") {
      $.getJSON(snowball.pluginsUrl + "/modules/choropleth/snowfall.json", function(data) {
        hot.updateSettings({
          colHeaders: ["fips", "State", "Value"],
        });
        hot.loadData(data);
        $("[data-target='caption']").val("Annual Snowfall (inches)");
      });
    } else {
      $.getJSON(snowball.pluginsUrl + "/modules/choropleth/precipitation.json", function(data) {
        hot.updateSettings({
          colHeaders: ["fips", "Country", "Value"],
        });
        hot.loadData(data);
        $("[data-target='caption']").val("Annual Precipitation (mm)");
      });
    }

  });

  $("#snowball-main").on("input change", ".snowball-block-choropleth [data-target='quantize']", function() {
    var block = $(this).closest(".snowball-block-choropleth");
    var quantize = $(this).val();

    block.find(".quantize-output").text(quantize);
  });

  function initTable(block, container, data, mapType) {

    var colHeaders = ["fips", "Country", "Value"];

    if (mapType === "usa") {
      colHeaders = ["fips", "State", "Value"];
    }

    var hot = new Handsontable(container, {
      data: data,
      rowHeaders: false,
      fixedRowsTop: 0,
      colHeaders: colHeaders,
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
      afterChange: function(changes, source) {
        var data = this.getData();
        refreshOnChange(block, data);
        if (source !== "loadData") {
          block.trigger("render");
        }
      },
      afterLoadData: function() {
        var data = this.getData();
        refreshOnChange(block, data);
      },
      afterInit: function() {
        var data = this.getData();
        refreshOnChange(block, data);
        block.trigger("render");
      }
    });

    block.data("hot", hot);
  }

  function refreshOnChange(block, data, source) {
    var generatedJSON = data;
    var jsonString = JSON.stringify(generatedJSON);

    block.find("[data-target='JSON']").val(jsonString);
  }

})(jQuery);
