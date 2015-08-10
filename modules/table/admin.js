(function($) {
  $("#snowball-main").on("open", ".snowball-block-table", function() {
    var block = $(this);
    var container = block.find(".table").get(0);
    var data = JSON.parse(block.find("[data-target='JSON']").val());

    var hot = new Handsontable(container, {
      data: data,
      rowHeaders: false,
      fixedRowsTop: 1,
      colHeaders: true,
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
      afterInit: function(e) {
        refreshOnChange(block, data);
        block.trigger("render");
      },
      afterChange: function (e) {
        refreshOnChange(block, data);
      },
      afterCreateRow: function (e) {
        refreshOnChange(block, data);
      },
      afterCreateCol: function (e) {
        refreshOnChange(block, data);
      },
      afterRemoveRow: function (e) {
        refreshOnChange(block, data);
      },
      afterRemoveCol: function (e) {
        refreshOnChange(block, data);
      }
    });

    block.data("hot", hot);
  });

  function refreshOnChange(block, data) {
    var jsonString = JSON.stringify(data);

    block.find("[data-target='JSON']").val(jsonString);
    block.find("[data-target='HTML']").val(createTable(data));

    block.find(".handsontableInput").trigger("change");
  }

  function createTable(JSON) {
    var HTML = "  <table>\n";
    var numRows = JSON.length;

    for (var i = 0; i < numRows; i++) {
      if (i === 0) {
        HTML = HTML + "    <thead>\n";
      } else if (i === 1) {
        HTML = HTML + "    </thead>\n    <tbody>\n";
      }
      HTML = HTML + "      <tr>\n";
      for (var j = 0; j < JSON[i].length; j++) {
        if (JSON[i][j] === null) {
          JSON[i][j] = "";
        }

        if (i === 0) {
          HTML = HTML + "        <th>" + JSON[i][j] + "</th>\n";
        } else {
          HTML = HTML + "        <td>" + JSON[i][j] + "</td>\n";
        }
      }

      HTML = HTML + "      </tr>\n";
    }

    HTML = HTML + "    </tbody>\n  </table>";

    return HTML;
  }

})(jQuery);