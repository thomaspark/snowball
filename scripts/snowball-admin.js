(function($) {
  var changesMade = false;
  var actions = [];
  snowball.status = $("#save-post").length === 0 ? "publish" : "draft";

  jQuery(document).ready(function() {
    if ((snowball.savedblocks.length !== 0) && (snowball.savedblocks !== "null")) {
      $("#snowball_meta").removeClass("closed");

      snowball.savedblocks = JSON.parse(snowball.savedblocks);
      populateSavedBlocks();
    } else {
      snowball.savedblocks = [];
    }

    setHandlers();
  });

  function setHandlers() {
    $("#publish, #save-post").on("click", function() {
      if ($(this).attr("id") == "publish") {
        snowball.status = "publish";
        actions.push({
          action: "save",
          type: "publish"
        });
      } else {
        snowball.status = "draft";
        actions.push({
          action: "save",
          type: "draft"
        });
      }

      changesMade = false;
    });

    $("#title").on("input", debounce(function() {
      snowball.title = $(this).val();
      $(".snowball-block").each(function() {
        $(this).trigger("render");
      });
    }, 250));

    $("#snowball-toolbar .block-button").on("click", function() {
      var type = $(this).data("type");
      addBlock(type);
      unsavedChanges();

      actions.push({
        action: "add",
        type: type
      });
    });

    $("#snowball-toolbar .tag").on("click", function() {
      var tag = $(this).attr("data-tag");
      $(".tag.active").removeClass("active");
      $(this).addClass("active");

      if (tag === "all") {
        $("#snowball-toolbar .buttons .button").removeClass("hidden");
      } else {
        $("#snowball-toolbar .buttons .button").addClass("hidden").filter("." + tag).removeClass("hidden");
      }
    });

    $("#snowball-toolbar .settings .button").on("click", function() {
      var click = $(this).attr("data-click");
      $(click).click();
    });

    $("#snowball-toolbar .menu-toggle").on("click", function() {
      var dialog = $(this).next(".dialog");
      var editor = dialog.find(".CodeMirror");

      dialog.addClass("modal");
      $("body").toggleClass("modal");

      if ((editor.length === 0) && dialog.hasClass("settings-dropdown")) {
        var elem = dialog.find("textarea").get(0);
        editor = CodeMirror.fromTextArea(elem, {
            mode: {name: "htmlmixed", htmlMode: true},
            lineNumbers: true,
            lineWrapping: true,
            indentUnit: 2,
            tabSize: 2,
            theme: "monokai"
        });
      }

    });

    $("#snowball-toolbar .menu .close").on("click", function() {
      var dialog = $(this).closest(".dialog");
      var css = dialog.find(".CodeMirror")[0].CodeMirror.getValue();

      if (css) {
        actions.push({
          action: "code",
          type: "head",
          data: css
        });
      }

      dialog.removeClass("modal");
      $("body").removeClass("modal");
    });

    $("#snowball-settings .toggle").on("click", function() {
      $("#snowball-settings ul").toggle();
    });

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
      .on("input change paste", ".snowball-tinker input, .snowball-tinker textarea, .snowball-tinker select", debounce(function() {
        var block = $(this).closest(".snowball-block");
        block.trigger("render");
        refreshEditors(block);
        unsavedChanges();
      }, 250))
      .on("click", ".snowball-delete", function() {
        var block = $(this).closest(".snowball-block");
        var type = block.data("type");

        confirmDelete(block);
      })
      .on("click", ".snowball-copy", function() {
        var block = $(this).closest(".snowball-block");
        var type = block.data("type");

        copyBlock(block);
        unsavedChanges();

        actions.push({
          action: "copy",
          type: type
        });
      })
      .on("click", ".snowball-zoom-toggle", function() {
        var block = $(this).closest(".snowball-block");
        var type = block.data("type");

        block.find(".snowball-code, .snowball-copy, .snowball-delete, .snowball-top, .snowball-bottom").toggle();

        block.toggleClass("modal");
        $("body").toggleClass("modal");
        zoomPreview(block);

        if (!block.hasClass("modal")) {
          var editor = block.find(".snowball-css .CodeMirror")[0].CodeMirror;
          var css = retrieveNonReadOnlyText(editor);

          actions.push({
            action: "code",
            type: type,
            data: css
          });
        }

        block.find(".CodeMirror").each(function(index, editor) {
          editor.CodeMirror.refresh();
        });
      })
      .on("click", ".snowball-top", function() {
        var block = $(this).closest(".snowball-block");

        if (block.index() > 0) {
          block.parent().prepend(block);
          unsavedChanges();
        }
      })
      .on("click", ".snowball-bottom", function() {
        var block = $(this).closest(".snowball-block");

        if (block.index() < ($(".snowball-block").length) - 1) {
          block.parent().append(block);
          unsavedChanges();
        }
      })
      .on("mouseover", ".snowball-zoom-toggle", function() {
        var block = $(this).closest(".snowball-block");

        if (block.find(".snowball-code .CodeMirror").length === 0) {
          initEditors(block);
        }
      })
      .on("change", ".handsontable", function() {
        unsavedChanges();
      })
      .sortable({
        axis: "y",
        cancel: ".snowball-block.modal, .snowball-title-button, button, textarea, input, select, .handsontable .wtHider, .CodeMirror, .button, .toggle-buttons",
        change: function() {
          unsavedChanges();
        },
        containment: "#snowball-main",
        cursor: "move",
        tolerance: "pointer"
      });

    $("body")
      .on("click", "#modal-bg", function() {
        $(".snowball-block.modal .snowball-zoom-toggle, .settings-dropdown.modal .close").click();
        $(".modal").removeClass("modal");
      })
      .on("keydown", function (e) {
        if (e.keyCode === 27) { // ESC
          $(".snowball-block.modal .snowball-zoom-toggle, .settings-dropdown.modal .close").click();
          $(".modal").removeClass("modal");
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

    $("#collapse-menu").click(function() {
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

  function addBlock(type, data, at) {
    var blockCode = snowball.blocks[type];
    var name = snowball.names[type];
    var block = $("<div class='snowball-block'>" +
                    "<div class='snowball-gui'>" +
                      "<div class='snowball-tinker'>" +
                        "<div>" +
                          "<div class='snowball-title'></div>" +
                          "<div class='snowball-title-button-group'>" +
                            "<div class='snowball-title-button snowball-copy' title='Copy block'><i class='fa fa-files-o'></i></div>" +
                            "<div class='snowball-title-button snowball-delete' title='Delete block'>&times;</div>" +
                          "</div>" +
                          "<div class='snowball-title-button-group'>" +
                            "<div class='snowball-title-button snowball-top' title='Move block to top'><i class='fa fa-angle-double-up'></i></div>" +
                            "<div class='snowball-title-button snowball-bottom' title='Move block to bottom'><i class='fa fa-angle-double-down'></i></div>" +
                          "</div>" +
                          "<div class='snowball-title-button-group'>" +
                            "<div class='snowball-title-button snowball-zoom-toggle' title='Edit code'><i class='fa fa-code'></i></div>" +
                          "</div>" +
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
              input.prop("checked", ((value == "true") || value === true));
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
      });

    if (typeof at == "undefined") {
      block.appendTo("#snowball-main");
    } else {
      block.insertAfter($(".snowball-block").eq(at));
    }
    
    zoomPreview(block);
    block.trigger("open");
  }

  function renderPreview(block) {
    var type = block.data("type");
    var preview = block.find(".snowball-preview").contents();
    var html = snowball.templates[type];
    var selector = "input[type='text'][data-target], input[type='email'][data-target], input[type='range'][data-target], input[type='hidden'][data-target], input[type='radio'][data-target]:checked, input[type='checkbox'][data-target]:checked, textarea[data-target], select[data-target]";
    var fields = block.find(selector);

    fields.each(function(index, element) {
      var target = $(this).data("target");
      var value = $(this).val();

      if ((type === "text") && $(this).is("textarea")) {
        // For text blocks, replace \n\n with <p>
        value = value.replace(/\n([ \t]*\n)+/g, '</p><p>')
                 .replace(/\n/g, '<br />')
                 .replace(/<\/p><p>/g, '</p>\n\t<p>');
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

    block.trigger("rendered");
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
                                pluginsUrl + "/lib/d3-geomap/css/d3.geomap.css",
                                pluginsUrl + "/lib/font-awesome/css/font-awesome.min.css",
                                pluginsUrl + "/styles/min/snowball.min.css",
                                pluginsUrl + "/styles/min/snowball-theme.min.css",
                                pluginsUrl + "/styles/min/snowball-preview.min.css"
                              ];

    var defaultScripts = [
                            includesUrl + "js/jquery/jquery.js",
                            "https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min.js",
                            "https://cdnjs.cloudflare.com/ajax/libs/topojson/1.6.19/topojson.min.js",
                            pluginsUrl + "/lib/d3-geomap/vendor/d3.geomap.dependencies.min.js",
                            pluginsUrl + "/lib/d3-geomap/js/d3.geomap.min.js",
                            pluginsUrl + "/scripts/min/snowball-preview.min.js",
                            pluginsUrl + "/scripts/min/templates.min.js"
                          ];

    defaultStylesheets.forEach(function(href) {
      var code = "<link rel='stylesheet' href='" + href + "'>\n";
      defaultCss = defaultCss + code;
    });

    if(head.is(":empty")) {
      head.html("<meta charset='utf-8'>");
      head.append(defaultCss);
      head.append($("#snowball-custom-code").val());
      callback(0);
    } else {
      callback2(0);
    }

    function callback(i) {
      var script = iframe.get(0).contentDocument.createElement("script");
      script.src = defaultScripts[i];

      if (i < defaultScripts.length - 1) {
        script.onload = function() {
          callback(i+1);
        };
      } else {
        script.onload = function() {
          callback2(0);
        };
      }

      head[0].appendChild(script);
    }

    function callback2(i) {
      if (i < blockScripts.length) {
        var src = blockScripts.eq(i).attr("src");
        var script = iframe.get(0).contentDocument.createElement("script");

        if (src) {
          script.src = src;
          script.onload = function() {
            callback2(i+1);
          };
        } else {
          script.innerHTML = blockScripts.eq(i).html();
        }

        body.find(".snowball-block").get(0).appendChild(script);
      }
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
        width = $(this).closest(".snowball-block").width() / 2;
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
          indentUnit: 2,
          tabSize: 2,
          theme: "monokai"
      });

      renderEditor(preview, modeType, editor);

      editor.on("change", debounce(function() {
        var block = $(elem).closest(".snowball-block");
        renderPreview(block);
        unsavedChanges();
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
    // there should only be one marked text object in editor.getAllMarks()
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

  function copyBlock(block) {
    var type = block.data("type");
    var data = parseBlock(block);
    var index = block.index();

    if (data) {
      addBlock(type, data, index);
    }
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
      var type = block.data("type");
      
      block
        .trigger("close")
        .remove();

      unsavedChanges();

      actions.push({
        action: "delete",
        type: type
      });
    }
  }

  function unsavedChanges() {
    changesMade = true;
    $("#snowball-toolbar .settings .draft, #snowball-toolbar .settings .save").addClass("unsaved");
  }

})(jQuery);



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
