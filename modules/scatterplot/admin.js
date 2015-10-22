(function($) {

  $("#snowball-main").on("open", ".snowball-block-scatterplot", function() {
    var block = $(this);
    var size = $(this).find(".size").val() + "px";
    $(this).find(".size-output").text(size);

    $(this).find(".export a").on("mouseover", function() {
      exportSVG(block);
    });

    loadData(block);
  });

  $("#snowball-main").on("input change", ".snowball-block-scatterplot .size", function() {
    var block = $(this).closest(".snowball-block-scatterplot");
    var size = $(this).val() + "px";

    block.find(".size-output").text(size);
    block.trigger("render");
  });

  $("#snowball-main").on("rendered", ".snowball-block-scatterplot", function() {
    var block = $(this);
    var iframe = block.find(".snowball-preview");
    var map = iframe.contents().find(".chart");
    var draw = iframe[0].contentWindow.drawScatterplot;

    if (map && draw) {
      draw(iframe.contents().find(".snowball-block-scatterplot"));
    }
  });

  function loadData(block) {
    var container = block.find(".table").get(0);
    var json = block.find("[data-target='json']").val();

    if (json) {
      var data = JSON.parse(json);
      initTable(block, container, data); 
    } else {
      var url = snowball.pluginsUrl + "/modules/scatterplot/snowline.json";

      $.getJSON(url, function(data) {
        initTable(block, container, data);
      });
    }
  }

  function reloadData(block) {
    var container = block.find(".table").get(0);
    var hot = block.data("hot");
    var json = block.find("[data-target='json']").val();
    var colHeaders = ["Label", "X", "Y"];

    if (json) {
      var data = JSON.parse(json);
      hot.updateSettings({
        colHeaders: colHeaders
      });
      hot.loadData(data);
      hot.render();
    } else {
      var url = snowball.pluginsUrl + "/modules/choropleth/snowline.json";

      $.getJSON(url, function(data) {
        hot.updateSettings({
          colHeaders: colHeaders,
        });
        hot.loadData(data);
        hot.render();
      });
    }
  }

  function initTable(block, container, data) {
    var colHeaders = ["Label", "X", "Y"];
    var columns = [{data: "Label", type: "text"}, {data: "X", type: "numeric"}, {data: "Y", type: "numeric"}];

    var hot = new Handsontable(container, {
      data: data,
      rowHeaders: false,
      fixedRowsTop: 0,
      colHeaders: colHeaders,
      columns: columns,
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

    block.find("[data-target='json']").val(jsonString);
  }

  function exportSVG(block) {
    var iframe = block.find(".snowball-preview");
    var svg = iframe.contents().find(".chart").html();
    var b64 = btoa(unescape(encodeURIComponent(svg)));

    block.find(".export a").attr({"href-lang": "image/svg+xml", "href": "data:image/svg+xml;base64,\n"+b64});
  }

})(jQuery);
