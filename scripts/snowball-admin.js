(function($) {
  var changesMade = false;

  jQuery(document).ready(function() {

    setHandlers();

    if ((snowball.savedblocks.length !== 0) && (snowball.savedblocks !== "null")) {
      snowball.savedblocks = JSON.parse(snowball.savedblocks);
      populateSavedBlocks();
    } else {
      snowball.savedblocks = [];
    }
  });

  function setHandlers() {
    $("#publish, #save-post").on("click", function() {
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

        if (block.find(".snowball-code .CodeMirror").length === 0) {
          initEditors(block);
        }
      })
      .sortable({
        "axis": "y",
        "containment": "#snowball-main",
        "cancel": ".snowball-block.modal, textarea, input",
        "cursor": "move",
        "tolerance": "pointer"
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

    $("#collapse-menu").click(function() {
      var fixedsticky = $(".fixedsticky");
      fixedsticky.css("width", fixedsticky.parent().width());
      zoomPreview();
    });
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
                          "<div class='snowball-title-button snowball-zoom-toggle'><i class='fa fa-code'></i></div>" +
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
    var preview = block.find(".snowball-preview").contents();
    var html = snowball.templates[type];
    var selector = "input[type='text'][data-target], input[type='email'][data-target], input[type='range'][data-target], input[type='hidden'][data-target], input[type='radio'][data-target]:checked, input[type='checkbox'][data-target]:checked, textarea[data-target]";
    var fields = block.find(selector);

    fields.each(function(index, element) {
      var target = $(this).data("target");
      var value = $(this).val();

      if ((type === "text") && $(this).is("textarea")) {
        // For text blocks, replace \n\n with <p>
        value = value.replace(/(.+?)\n{2,}/g,'<p>$1</p>');
      }
      var regex = new RegExp("{{" + target + "}}", "g");
      html = html.replace(regex, value);
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

    var $html = $(html);
    var blockScripts = $html.find("script").detach();

    preview.find("body").empty().append($html);
    previewScripts(blockScripts, block);

    if (block.width()) {
      zoomPreview(block);
    }
  }

  // create script elements from iframe document so js is executed in iframe's context
  // append default scripts to head so they aren't repeated in article for each block
  // append block scripts to body so they are included in article
  // only block scripts with src are re-appended here
  // block scripts with innerhtml must be evaled in snowball-preview.js

  function previewScripts(blockScripts, block) {
    var iframe = block.find(".snowball-preview");
    var preview = iframe.contents();
    var head = preview.find("head");
    var body = preview.find("body");
    var cm = block.find('.snowball-code .CodeMirror');
    var defaultCss = "";

    var pluginsUrl = snowball.pluginsUrl;
    var includesUrl = snowball.includesUrl;

    var style;

    if (cm.length) {
      var cssEditor = cm[1].CodeMirror;
      style = retrieveNonReadOnlyText(cssEditor);
    } else {
      style = block.find("textarea[data-mode='css']").html();
    }

    if (style) {
      var customStyle = $("<style></style>").attr({"data-type": "custom", "scoped": "scoped"});
      customStyle.html(style);
      body.find(".snowball-block").append(customStyle);
    }

    var defaultStylesheets = [
                                pluginsUrl + "/styles/snowball.css",
                                pluginsUrl + "/styles/snowball-preview.css",
                                pluginsUrl + "/lib/fluidbox/css/fluidbox.css",
                                pluginsUrl + "/lib/font-awesome/css/font-awesome.min.css"
                              ];

    var defaultScripts = [
                            pluginsUrl + "/scripts/snowball-preview.js"
                          ];

    defaultStylesheets.forEach(function(href) {
      var code = "<link rel='stylesheet' href='" + href + "'>\n";
      defaultCss = defaultCss + code;
    });

    blockScripts.each(function() {
      var src = $(this).attr("src");
      if (src) {
        var script = iframe.get(0).contentDocument.createElement("script");
        script.src = src;
        body.find(".snowball-block").get(0).appendChild(script);
      } else {
        body.find(".snowball-block").append($(this));
      }
    });

    defaultScripts.forEach(function(src) {
      var script = iframe.get(0).contentDocument.createElement("script");
      script.src = src;
      body[0].appendChild(script);
    });

    if (head.is(":empty")) {
      head.html(defaultCss);
    }
  }

  function zoomPreview(block) {
    var width;
    var zoom;
    var scale;

    if (block) {
      width = block.width() / 2;
      zoom = (width < 800) ? width/800 : 1;
      scale = "scale(" + zoom + ")";

      block.find(".snowball-preview").contents().find("html").css({"-webkit-transform": scale, "transform": scale});
    } else {
      $(".snowball-preview").each(function() {
        width = $(this).parents(".snowball-block").width() / 2;
        zoom = (width < 800) ? width/800 : 1;
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
          theme: "monokai"
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
      preview.find("style:not([data-type='custom'])").each(function() {
        code = code + $(this).html();
      });
      // code = preview.find("style:not([data-type='custom'])").html();

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
    var cm = block.find('.snowball-code .CodeMirror');

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
