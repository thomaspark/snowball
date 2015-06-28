(function($) {
  var changesMade = false;

  jQuery(document).ready(function() {

    setHandlers();
    snowball.savedblocks = JSON.parse(snowball.savedblocks);

    if (snowball.savedblocks === null) {
      snowball.savedblocks = [];
    } else {
      populateSavedBlocks();
    }
  });

  function setHandlers() {
    $("#publish").on("click", function() {
      changesMade = false;
    });

    $("#snowball-toolbar")
      .on("click", ".button", function() {
        var type = $(this).data("type");
        addBlock(type);
        changesMade = true;
      })
      .css("width", $("#snowball-toolbar").parent().width())
      .fixedsticky();

    $("#snowball-main")
      .on("render", ".snowball-block", function() {
        var block = $(this);
        renderPreview(block);
      })
      .on("mousedown", ".snowball-block", function() {
        $("#snowball-main").height($("#snowball-main").height());
      })
      .on("mouseup", ".snowball-block", function() {
        $("#snowball-main").height("auto");
      })
      .on("input change", ".snowball-tinker input, .snowball-tinker textarea", debounce(function() {
        var block = $(this).parents(".snowball-block");
        renderPreview(block);
        refreshEditors(block);
        changesMade = true;
      }, 250))
      .on("click", ".snowball-delete", function() {
        var block = $(this).parents(".snowball-block");
        confirmDelete(block);
        changesMade = true;
      })
      .on("click", ".snowball-zoom-toggle", function() {
        var block = $(this).parents(".snowball-block");
        block.find(".snowball-code").toggle();
        block.find(".snowball-delete").toggle();

        block.toggleClass("modal");
        $("body").toggleClass("modal");
        zoomPreview(block);

        block.find(".CodeMirror").each(function(index, editor) {
          editor.CodeMirror.refresh();
        });
      })
      .on("mouseover", ".snowball-zoom-toggle", function() {
        var block = $(this).parents(".snowball-block");

        if (block.find(".CodeMirror").length === 0) {
          initEditors(block);
        }
      })
      .sortable({
        "axis": "y",
        "containment": "#snowball-main",
        "cancel": ".snowball-block.modal, textarea, input",
        "cursor": "move"
      });

    $("body").on("click", "#modal-bg", function() {
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
      .resize(function() {
        var fixedsticky = $(".fixedsticky");
        fixedsticky.css("width", fixedsticky.parent().width());
      })
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
    var block = $("<div class='snowball-block'>" +
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

        if (data.customCss) {
          block.find("textarea[data-mode='css']").html(data.customCss);
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
        renderPreview(block);
      }).end()
      .find(".wp-color-picker").wpColorPicker({
        change: debounce(function (event) {
          $(this)
            .trigger("change")
            .attr("value", $(this).val());
        }, 250)
      }).end()
      .appendTo("#snowball-main")
      .trigger("open");
  }

  function renderPreview(block) {
    var type = block.data("type");
    var selector = "input[type='text'][data-target], input[type='range'][data-target], input[type='hidden'][data-target], input[type='radio'][data-target]:checked, input[type='checkbox'][data-target]:checked, textarea[data-target]";
    var fields = block.find(selector);
    var preview = block.find(".snowball-preview").contents();
    var html = snowball.templates[type];
    var cm = block.find('.CodeMirror');

    var pluginsUrl = snowball.pluginsUrl;
    var includesUrl = snowball.includesUrl;
    var css = $("<link/>").attr({"rel": "stylesheet", "href": pluginsUrl + "/styles/snowball.css"});
    var cssPreview = $("<link/>").attr({"rel": "stylesheet", "href": pluginsUrl + "/styles/snowball-preview.css"});
    var jsPreview = document.createElement("script");
    jsPreview.src = pluginsUrl + "/scripts/snowball-preview.js";

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

    html = html.replace(/\[author\]/g, snowball.author)
               .replace(/\[blogname\]/g, snowball.blogname)
               .replace(/\[blogurl\]/g, snowball.blogurl)
               .replace(/\[date\]/g, snowball.date)
               .replace(/\[url\]/g, snowball.url);

    if (snowball.title) {
      html = html.replace(/\[title\]/g, snowball.title);
    }

    if (preview.find("head").is(":empty")) {
      preview.find("head").append(css, cssPreview).end();
      preview.find("head")[0].appendChild(jsPreview);
    }

    var customStyle = $("<style></style>").attr({"data-type": "custom", "scoped": "scoped"});

    if (cm.length) {
      var cssEditor = cm[1].CodeMirror;
      customStyle.html(retrieveNonReadOnlyText(cssEditor));
    } else {
      customStyle.html(block.find("textarea[data-mode='css']").html());
    }

    html = $(html).append(customStyle);
    preview.find("body").html(html);

    if (block.width()) {
      zoomPreview(block);
    }
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

  function initEditors(block) {
    var preview = block.find(".snowball-preview").contents().find("body");
    var editors = block.find(".snowball-editor-box");

    editors.each(function(index, elem) {
      var modeType = $(elem).attr("data-mode");
      var isReadOnly = (modeType === "xml") ? true : false;

      var editor = CodeMirror.fromTextArea(elem, {
          mode: {name: modeType, htmlMode: true},
          readOnly: isReadOnly,
          lineNumbers: true,
          lineWrapping: true,
          theme: "monokai",
          styleActiveLine: true
      });

      renderEditor(preview, modeType, editor);

      editor.on("change", debounce(function() {
        var block = $(elem).closest(".snowball-block");
        renderPreview(block);
        changesMade = true;
      }, 250));

    });
  }

  function renderEditor(preview, modeType, editor, cssCode) {
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

      if (cssCode) {
        code = code + cssCode;
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

    var cursorPos = editor.getCursor();
    var scrollPos = editor.getScrollInfo().top;
    var startLine = {line: 0, ch: 0};
    var endLine = {line: length, ch: 0};
    var options = {readOnly: true, inclusiveLeft: true};

    editor.setValue(code);
    editor.markText(startLine, endLine, options);

    for (var i = 0; i < length; i++) {
      editor.addLineClass(i, "background", "readonly");
    }

    editor.setCursor(cursorPos);
    editor.scrollTo(null, scrollPos);
  }

  function retrieveNonReadOnlyText(editor) {
    // there should only be one marked text object
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
      renderEditor(preview, "xml", htmlEditor);
      renderEditor(preview, "css", cssEditor);
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
