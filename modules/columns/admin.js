(function ($) {
  $("#snowball-main").on("open", ".snowball-block-columns", function() {
    var block = $(this);
    var textarea;
    block.find( '[type="checkbox"]' ).each(function(index) {
      if ($(this).prop("checked")) {
        textarea = block.find(".column-textarea").eq(index);
        initializeEditorAt(textarea);
        block.find(".toggle-button").eq(index).addClass("activeButton");
      }
    });

    block.find(".CodeMirror").hide();
    block.find(".CodeMirror").eq(0).show();
    block.find(".toggle-button").eq(0).addClass("active");

    var activeEditors = block.find(".activeButton").length;
    if (activeEditors == 4) {
      block.find(".add-button").hide();
    }
  });

  function initializeEditorAt(textarea) {
    var editor = CodeMirror.fromTextArea(textarea[0], {
      mode: "htmlmixed",
      lineNumbers: true,
      lineWrapping: true,
      indentUnit: 2,
      tabSize: 2,
      theme: "monokai"
    });

    editor.setSize("100%", "100%");

    editor.on("change", function() {
      editor.save();
      textarea.trigger("change");
    });

    textarea.data("codeMirrrorInstance", editor);
  }

  $("#snowball-main").on("click", ".snowball-block-columns .toggle-button", function(event) {
    var block = $(this).closest(".snowball-block-columns");
    var selectedIndex = block.find(".toggle-buttons .toggle-button").index($(this));

    activateSelectedButton(block, selectedIndex);
    activateSelectedEditor(block, selectedIndex);
  });

  $("#snowball-main").on("click", ".snowball-block-columns .add-button", function(event) {
    var block= $(this).closest(".snowball-block-columns");

    var activeEditors = block.find(".activeButton").length;
    if (activeEditors == 3) {
      block.find(".add-button").fadeOut(500);
    }

    block.find( '[type="checkbox"]' ).each(function(index) {
      if (!($(this).prop("checked"))) {
        addNewColumn(block, index);
        return false;
      }
    });
    block.trigger("render")
  });

  function addNewColumn(block, selection) {
    block.find(".toggle-button").eq(selection).addClass("activeButton");

    var textarea = block.find(".column-textarea").eq(selection);
    initializeEditorAt(textarea);

    block.find(".toggle-buttons .toggle-button").each(function(index) {
      if (index === selection) {
        $(this).addClass("active");
      } else {
        $(this).removeClass("active");
      }
    });

    block.find(".CodeMirror").each(function(index) {
      if (index === selection) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });

    var checkbox = block.find( '[type="checkbox"]' ).eq(selection);
    checkbox.prop("checked", true);
  }

  $("#snowball-main").on("click", ".snowball-block-columns .delete-column", function(event) {
    event.stopPropagation();

    if (confirm("Are you sure you want to delete this column?")) {
      var block = $(this).closest(".snowball-block-columns");
      var button = $(this).closest(".toggle-button");
      var selectedIndex = block.find(".toggle-buttons .toggle-button").index(button);

      var activeEditors = block.find(".activeButton").length;

      if (selectedIndex == (activeEditors - 1)) {
        var textarea = block.find(".column-textarea").eq(selectedIndex);
        var codeMirrrorInstance = textarea.data("codeMirrrorInstance");

        var checkbox = block.find( '[type="checkbox"]' ).eq(selectedIndex);
        checkbox.prop("checked", false);

        codeMirrrorInstance.toTextArea();
        textarea.val("");

        block.find(".activeButton").eq(selectedIndex).removeClass("activeButton");

        activateSelectedButton(block, (selectedIndex - 1));
        activateSelectedEditor(block, (selectedIndex - 1));

        block.find(".CodeMirror").eq((selectedIndex - 1)).show();
      } else {
        while (selectedIndex < (activeEditors - 1)){
          var textarea = block.find(".column-textarea").eq(selectedIndex);
          var codeMirrrorInstance = textarea.data("codeMirrrorInstance");

          codeMirrrorInstance.toTextArea();

          var checkbox = block.find( '[type="checkbox"]' ).eq((selectedIndex));
          checkbox.prop("checked", true);

          var temp_textarea = block.find(".column-textarea").eq((selectedIndex + 1));
          var temp_codeMirrrorInstance = temp_textarea.data("codeMirrrorInstance");

          temp_codeMirrrorInstance.toTextArea();

          var temp_checkbox = block.find( '[type="checkbox"]' ).eq((selectedIndex + 1));
          temp_checkbox.prop("checked", false);

          textarea.val((temp_textarea.val()));
          initializeEditorAt(textarea);

          if (selectedIndex == (activeEditors - 2)) {
            block.find(".activeButton").eq((selectedIndex + 1)).removeClass("activeButton");
            activeEditors = block.find(".activeButton").length;

            block.find(".column-textarea").eq((selectedIndex + 1)).val("");
          }

          selectedIndex = selectedIndex + 1;
        }
      }

      block.trigger("render");
      activateSelectedButton(block, (selectedIndex - 1));
    }

    $(this).closest(".snowball-block-columns").find(".add-button").fadeIn(500);
  });

  function activateSelectedButton(block, selection) {
    block.find(".activeButton").each(function(index) {
      if (index === selection) {
        $(this).addClass("active");
      } else {
        $(this).removeClass("active");
      }
    });
  }

  function activateSelectedEditor(block, selection) {
    block.find(".CodeMirror").each(function(index) {
      if (index === selection) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  }
})(jQuery);