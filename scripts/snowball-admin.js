(function($) {
  var blockNumber = 0;
  var changesMade = false;
  
  setHandlers();

  $("<div></div>").addClass("modal-bg").appendTo("body");

  jQuery(document).ready(function() {
    if (snowball.savedblocks !== null && snowball.savedblocks !== "") {
      populateSavedBlocks();
    }
  });

  function setupBlock(block, isChanged) {
    renderPreview(block);
    refreshEditors(block);
    changesMade = isChanged;
  }

  function setHandlers() {
    $("#publish").on("click", function() {
      changesMade = false;
    });

    $(".snowball-toolbar").on("click", ".button", function() {
      var type = $(this).data("type");
      addBlock(type);
      changesMade = true;
    });

    $(".snowball-main")
      .on("open", ".snowball-block", function() {
        var block = $(this);
        setupEditors(block, blockNumber);
        blockNumber = blockNumber + 1;
        renderPreview(block);
      })
      .on("render", ".snowball-block", function() {
        var block = $(this);
        setupBlock(block, false);
      })
      .on("mousedown", ".snowball-block", function() {
        $(".snowball-main").height($(".snowball-main").height());
      })
      .on("mouseup", ".snowball-block", function() {
        $(".snowball-main").height("auto");
      })
      .on("input", ".snowball-tinker input, .snowball-tinker textarea", debounce(function() {
        var block = $(this).parents(".snowball-block");
        setupBlock(block);
      }, 250))
      .on("input", ".snowball-code input, .snowball-code textarea", debounce(function() {
        var block = $(this).parents(".snowball-block");
        renderPreview(block);
        changesMade = true;
      }, 250))
      .on("change", "input, textarea", function() {
        var block = $(this).parents(".snowball-block");
        setupBlock(block, true);
      })
      .on("click", ".snowball-delete", function() {
        var block = $(this).parents(".snowball-block");
        confirmDelete(block);
        changesMade = true;
      })
      .on("click", ".snowball-zoom-toggle", function() {
        var block = $(this).parents(".snowball-block");
        var snowballCode = block.find(".snowball-code").toggle();
        block.find(".snowball-delete").toggle();

        block.toggleClass("modal");
        $("body").toggleClass("modal");
        zoomPreview(block);

        block.find(".CodeMirror").each(function(index, editor){
          editor.CodeMirror.refresh();
        });
      })
      .sortable({
        "axis": "y",
        "containment": ".snowball-main",
        "cancel": ".snowball-block.modal, textarea, input",
        "cursor": "move"
      });

    $("body").on("click", ".modal-bg", function() {
      $(".snowball-block.modal .snowball-zoom-toggle").click();
    });

    $("body").on("keydown", function (e) {
      if (e.keyCode === 27) { // ESC
        $(".snowball-block.modal .snowball-zoom-toggle").click();
      }
    });

    $(window)
      .resize(debounce(function() {
        zoomPreview();
      }, 250))
      .on("beforeunload", function(e) {
        if (changesMade) {
          return "You may have unsaved changes.";
        }
      });

    $("#collapse-menu").click(debounce(function() {
      zoomPreview();
    }, 250));
  }

  function populateSavedBlocks() {
    for (var b in snowball.savedblocks) {
      var block = snowball.savedblocks[b];
      var type = block["blockType"].toLowerCase();

      // need to delete so snowball.addBlock works properly
      delete block["blockType"];
      delete block["orderNumber"];

      addBlock(type, block);
    }
  }

  function addBlock(type, data) {
    var blockCode = snowball.blocks[type];
    var name = snowball.names[type];
    var block =  $("<div class='snowball-block'>" +
                    "<div class='snowball-gui'>" +
                      "<div class='snowball-tinker'>" +
                        "<div>" +
                          "<div class='snowball-title'></div>" +
                          "<div class='snowball-title-button snowball-delete'>&times;</div>" +
                          "<div class='snowball-title-button snowball-zoom-toggle'><i class='fa fa-search'></i></div>" +
                        "</div>" +
                      "</div>" +
                      "<iframe class='snowball-preview'></iframe>" +
                    "</div>" +
                    "<div class='snowball-code'>" +
                      "<div class='snowball-html snowball-editor'>" +
                        "<div class='snowball-code-title'>HTML</div>" +
                        "<textarea class='snowball-editor-box' data-mode='xml'></textarea>" +
                      "</div>" +
                      "<div class='snowball-css snowball-editor'>" +
                        "<div class='snowball-code-title'>CSS</div>" +
                        "<textarea class='snowball-editor-box' data-mode='css'></textarea>" +
                      "</div>" +
                    "</div>" +
                  "</div>");

    block
      .addClass("snowball-block-" + type)
      .attr("data-type", type)
      .attr("data-name", name)
      .find(".snowball-title").text(name).end()
      .find(".snowball-tinker").append(blockCode).end();

    if (data) {
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          var selector = "[data-target='" + key + "']";
          var input = block.find(selector);
          var value = data[key];
          if (input) {
            if (input.is(":radio")) {
              input.filter("[value='" +  value + "']").prop("checked", true);
            } else if (input.is(":checkbox")) {
              if (value == "true") {
                input.prop("checked", true);
              } else {
                input.prop("checked", false);
              }
            } else {
              input.val(value);
            }
          }
        }
      }
    } else {
      var dataBlock = {
        orderNumber: snowball.savedblocks.length,
        blockType: type
      };

      snowball.savedblocks.push(dataBlock);
    }

    block
      .find(".snowball-preview").load(function() {
        setupBlock(block, false);
      }).end()
      .find(".wp-color-picker").wpColorPicker({
        change: debounce(function (event) {
          $(this)
            .trigger("change")
            .attr("value", $(this).val());
        }, 250)
      }).end()
      .appendTo(".snowball-main")
      .trigger("open");
  }

  function renderPreview(block) {
    var type = block.data("type");
    var selector = "input[type='text'][data-target], input[type='range'][data-target], input[type='hidden'][data-target], input[type='radio'][data-target]:checked, input[type='checkbox'][data-target]:checked, textarea[data-target]";
    var fields = block.find(selector);
    var preview = block.find(".snowball-preview").contents();
    var html = snowball.templates[type];
    var cm = block.find('.CodeMirror');

    var path = snowball.path;
    var css = path + "/styles/snowball.css";
    var cssPreview = path + "/styles/snowball-preview.css";
    var stylesheet = $("<link/>").attr({"rel": "stylesheet", "href": css});
    var stylesheetPreview = $("<link/>").attr({"rel": "stylesheet", "href": cssPreview});

    fields.each(function(index, element) {
      var target = $(this).data("target");
      var value = $(this).val();

      if ($(this).is("textarea")) {
        // For textareas, replace \n\n with <p>
        value = value.replace(/(.+?)\n{2,}/g,'<p>$1</p>');
      }

      html = html.replace("{{" + target + "}}", value);
    });

    html = html.replace(/{{.+}}/g, "");

    html = html.replace("[author]", snowball.author)
               .replace("[date]", snowball.date);

    if (snowball.title) {
      html = html.replace("[title]", snowball.title);
    }

    if (preview.find("head").is(":empty")) {
      preview.find("head").append(stylesheet, stylesheetPreview).end();
    }

    if (cm.length) {
      var cssEditor = cm[1].CodeMirror;
      var customStyle = $("<style></style>").attr({"data-type": "custom", "scoped": "scoped"});
      $(customStyle).html(retrieveNonReadOnlyText(cssEditor));
      html = $(html).append(customStyle);
    }

    preview.find("body").html(html);
    zoomPreview(block);
  }

  function zoomPreview(block) {
    var width;
    var zoom;
    var scale;

    if (block) {
      width = block.width() / 2;
      zoom = (width < 600) ? width/600 : 1;
      scale = "scale(" + zoom + ")";

      block.find(".snowball-preview").contents().find("html").css({"-webkit-transform": scale, "transform": scale});
    } else {
      $(".snowball-preview").each(function() {
        width = $(this).parents(".snowball-block").width() / 2;
        zoom = (width < 600) ? width/600 : 1;
        scale = "scale(" + zoom + ")";

        $(this).contents().find("html").css({"-webkit-transform": scale, "transform": scale});
      });

    }
  }

  function setupEditors(block, blockNum) {
    var preview = block.find(".snowball-preview").contents().find("body");
    var editors = block.find(".snowball-editor-box");

    editors.each(function(index, elem) {
      var modeType = $(this).attr("data-mode");
      var isReadOnly = (modeType === "xml") ? true : false;

      var editor = CodeMirror.fromTextArea(elem, {
          mode: {name: modeType, htmlMode: true},
          readOnly: isReadOnly,
          lineNumbers: true,
          lineWrapping: true,
          theme: "monokai",
          styleActiveLine: true,
          undoDepth: 40
      });

      renderEditor(preview, modeType, editor, blockNum);
    });
  }

  /*
    Renders the code onto the text editor based on what code mode is used.
  */
  function renderEditor(preview, modeType, editor, blockNum) {
    // search for the index snowball block that is the same as
    // the block that contains the code below.
    var code = "";
    var length = 0;
    if (modeType == "css") {
      code = preview.find("style:not([data-type='custom'])").html();

      if (code) {
        code = code.replace(/^\n+|\n+$/g, '');
        code = code + "\n\n";
        length = code.split(/\r\n|\r|\n/).length - 1;
      } else {
        code = "";
      }

      // ensures the code will populate the correct custom css code that was saved.
      if (((typeof blockNum) !== 'undefined') && (snowball.savedblocks[blockNum] !== undefined)) {
        var customCode = snowball.savedblocks[blockNum].customCss;
        if (customCode) {
          code = code + customCode;
        }
      }

      var nonReadOnlyCode = retrieveNonReadOnlyText(editor);
      if (nonReadOnlyCode) {
        code = code + nonReadOnlyCode;
      }
    } else if (modeType === "xml") {
      var clone = preview.clone();
      clone.find("style").remove();
      code = clone.html().replace("\n\n</section>", "\n</section>");
      length = code.split(/\r\n|\r|\n/).length;
    }

    var scrollPos = {
      line: editor.getCursor().line,
      ch: editor.getCursor().ch
    };

    editor.setValue(code);

    var startLine = {line: 0, ch: 0};
    var endLine = {line: length, ch: 0};
    var options = {readOnly:true, inclusiveLeft:true};
    editor.markText(startLine, endLine, options);

    editor.setCursor(scrollPos);
  }

  function retrieveNonReadOnlyText(editor) {
    //there should only be one marked text object
    var readOnlyMark = editor.getAllMarks();
    var code = editor.getValue();

    if (readOnlyMark.length) {
      var mark = readOnlyMark[0];
      var lastReadOnlyLine = mark.lines.length;

      if (lastReadOnlyLine < 2) {
        code = editor.getValue();
      } else {
        var fromLine = {line:lastReadOnlyLine-1, ch:0};
        var toLine = {line:editor.lastLine()+1, ch:0};
        code = editor.getRange(fromLine, toLine);
      }
    }

    return code;
  }

  function refreshEditors(block) {
    var cm = block.find('.CodeMirror');

    if (cm.length) {
      var htmlEditor = cm[0].CodeMirror;
      var cssEditor = cm[1].CodeMirror;
      var preview = block.find(".snowball-preview").contents().find("body");
      renderEditor(preview, "xml", htmlEditor, blockNumber);
      renderEditor(preview, "css", cssEditor, blockNumber);
    }
  }

  function confirmDelete(block) {
    var result = confirm("Are you sure you want to delete this block?");
    if (result) {
      block
        .trigger("close")
        .remove();
    }
  }

  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

})(jQuery);
