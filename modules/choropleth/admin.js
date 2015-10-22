(function($) {

  $("#snowball-main").on("open", ".snowball-block-choropleth", function() {
    var block = $(this);
    var quantize = block.find("[data-target='quantize']").val();

    $(this).find(".quantize-output").text(quantize);

    $(this).find(".export a").on("mouseover", function() {
      exportSVG(block);
    });

    loadData(block);
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
    var mapType = $(this).val();

    reloadData(block, mapType);
  });

  $("#snowball-main").on("input change", ".snowball-block-choropleth [data-target='quantize']", function() {
    var block = $(this).closest(".snowball-block-choropleth");
    var hot = block.data("hot");
    var quantize = $(this).val();

    block.find(".quantize-output").text(quantize);
  });

  function loadData(block) {
    var container = block.find(".table").get(0);
    var mapType = block.find("[data-target='map-type']").val();
    var json;

    if (mapType === "usa") {
      json = block.find("[data-target='json-usa']").val();
    } else {
      json = block.find("[data-target='json-world']").val();
    }

    if (json) {
      var data = JSON.parse(json);
      initTable(block, container, data, mapType); 
    } else {
      var url = snowball.pluginsUrl + "/modules/choropleth/precipitation-" + mapType + ".json";

      $.getJSON(url, function(data) {
        initTable(block, container, data, mapType);
      });
    }
  }

  function reloadData(block, mapType) {
    var container = block.find(".table").get(0);
    var hot = block.data("hot");
    var colHeaders;
    var json;

    if (mapType === "usa") {
      json = block.find("[data-target='json-usa']").val();
      colHeaders = ["fips", "State", "Value"];
    } else {
      json = block.find("[data-target='json-world']").val();
      colHeaders = ["fips", "Country", "Value"];
    }

    if (json) {
      var data = JSON.parse(json);
      hot.updateSettings({
        colHeaders: colHeaders
      });
      hot.loadData(data);
      hot.render();
    } else {
      var url = snowball.pluginsUrl + "/modules/choropleth/precipitation-" + mapType + ".json";

      $.getJSON(url, function(data) {
        hot.updateSettings({
          colHeaders: colHeaders,
        });
        hot.loadData(data);
        hot.render();
      });
    }
  }

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
        block.trigger("render");
      }
    });

    block.data("hot", hot);
  }

  function refreshOnChange(block, data, source) {
    var generatedJSON = data;
    var jsonString = JSON.stringify(generatedJSON);
    var mapType = block.find("[data-target='map-type']").val();

    block.find("[data-target='json-" + mapType + "']").val(jsonString);
  }

  function exportSVG(block) {
    var iframe = block.find(".snowball-preview");
    var svg = iframe.contents().find(".map").html();
    var b64 = btoa(unescape(encodeURIComponent(svg)));

    block.find(".export a").attr({"href-lang": "image/svg+xml", "href": "data:image/svg+xml;base64,\n"+b64});
  }

})(jQuery);
