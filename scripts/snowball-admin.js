(function($) {
  snowball.editors = [];
  snowball.addBlock = function(type, data) {
    var blockCode = snowball.blocks[type];
    var name = snowball.names[type];

    var block =  $("<div class='snowball-block'>" +
                    "<div class='snowball-gui'>" +
                      "<div class='snowball-tinker'>" +
                        "<div>" +
                          "<div class='snowball-title'></div>" +
                          "<div class='snowball-title-button snowball-delete'>&times;</div>" +
                          "<div class='snowball-title-button snowball-editor-toggle'>&lt;/&gt;</div>" +
                        "</div>" +
                      "</div>" +
                      "<iframe class='snowball-preview'></iframe>" +
                    "</div>" +
                    "<div class='snowball-code'>" +
                      "<div class='snowball-html snowball-editor'>" + 
                        "<div class='snowball-code-title'>HTML Editor</div>" +
                        "<textarea class='snowball-editor-box' data-mode='xml'></textarea>" +
                      "</div>" +
                      "<div class='snowball-css snowball-editor'>" +
                        "<div class='snowball-code-title'>CSS Editor</div>" +
                        "<textarea class='snowball-editor-box' data-mode='css'></textarea>" +
                      "</div>" +
                      "<div class='snowball-js snowball-editor'>" +
                        "<div class='snowball-code-title'>Javascript Editor</div>" +
                        "<textarea class='snowball-editor-box' data-mode='javascript'></textarea>" +
                      "</div>" +
                    "</div>" +
                    "<div class='snowball-bottom-bar'></div>" +
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
      .appendTo(".snowball-main")
      .trigger("open");

  };

  // retrieves the textbox needed $('.CodeMirror').siblings(".snowball-editor-box");
  $(".snowball-toolbar").on("click", ".button", function() {
    var type = $(this).data("type");
    snowball.addBlock(type);
  });

  $(".snowball-main")
    .on("open", ".snowball-block", function(){
      // render the editor with code whenever a block is created
      var doms = $(this).find(".snowball-editor-box").get();
      setupEditors(doms);
    })
    .on("render", ".snowball-block", function() {
      renderPreview($(this));
      renderBlockWithEditor($(this));
    })
    .on("mousedown", ".snowball-block", function(e) {
      $(".snowball-main").height($(".snowball-main").height());
    })
    .on("mouseup", ".snowball-block", function(e) {
      $(".snowball-main").height("auto");
    })
    .on("keyup", "input, textarea", debounce(function() {
      var block = $(this).parents(".snowball-block");
      renderPreview(block);
      renderBlockWithEditor(block);
    }, 250))
    .on("change", "input, textarea", function() {
      var block = $(this).parents(".snowball-block");
      renderPreview(block);
      renderBlockWithEditor(block);
    })
    .on("click", ".snowball-delete", function() {
      var block = $(this).parents(".snowball-block");
      confirmDelete(block);
    })
    .on("mousewheel", "textarea, .chart .wtHolder", function(e) {
      var event = e.originalEvent,
              d = event.wheelDelta || -event.detail;
          
          this.scrollTop += ( d < 0 ? 1 : -1 ) * 30;
          e.preventDefault();

    .on("click", ".snowball-editor-toggle", function(){
      var block = $(this).parents(".snowball-block");
      block.find(".snowball-code").slideToggle("slow");
    })
    .sortable({
      "axis": "y",
      "containment": ".snowball-main",
      "cursor": "move"
    });

  $(window).resize(debounce(function() {
    zoomPreview();
  }, 250));

  $("#collapse-menu").click(debounce(function() {
    zoomPreview();
  }, 250));

  function confirmDelete(block) {
    var result = confirm("Are you sure you want to delete this block?");
    if (result) {
      block
        .trigger("close")
        .remove();
    }
  }

  function renderPreview(block) {
    var type = block.data("type");
    var selector = "input[type='text'][data-target], input[type='range'][data-target], input[type='hidden'][data-target], input[type='radio'][data-target]:checked, input[type='checkbox'][data-target]:checked, textarea[data-target]";
    var fields = block.find(selector);
    var preview = block.find(".snowball-preview").contents();
    var html = snowball.templates[type];

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

    preview.find("body").html(html);

    zoomPreview(block);
  }

  function zoomPreview(block) {
    var width = $(".snowball-main").width() / 2;
    var zoom = width / 600;
    var scale = "scale(" + zoom + ")";

    if (block) {
      block.find(".snowball-preview").contents().find("html").css({"-webkit-transform": scale, "transform": scale});
    } else {
      $(".snowball-preview").contents().find("html").css({"-webkit-transform": scale, "transform": scale});
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

    /*
    TODO try using data-mode 
    and have one common class to represent the syntax highlighting
  */
  function initEditor(dom, modeType){
    var isReadonly = (modeType === "xml");
    var editor = CodeMirror.fromTextArea(dom, {
        mode: modeType,
        readOnly: isReadonly,
        lineNumbers: true,
        lineWrapping: true,
        theme: "monokai",
        styleActiveLine: true
    });

    return editor;
  }

  /*
    Renders the code onto the text editor based on
    what code mode is used.
  */
  function renderEditor(dom, modeType, editor){
    var code = "";
    var previewSection = $(dom).closest(".snowball-block").find(".snowball-preview").contents().find("body");
    var length = 0;
    if(modeType == "css"){
      code = previewSection.find("style").html();
      length = code.split(/\r\n|\r|\n/).length;
    }
    // html doesnt work now so xml syntax is used
    else if(modeType == "xml"){
      code = previewSection.html().toString();
      // removing the style and script tag from html
      // I forget why I did it this way -Brian Lee
      var startIndex = code.indexOf("<style");
      var endIndex = code.indexOf("</style>");

      var END_STYLE_TAG_LENGTH = 8;
      var styleTag = code.substring(startIndex, endIndex + END_STYLE_TAG_LENGTH);
      code = code.replace(styleTag, "");
      length = code.split(/\r\n|\r|\n/).length;
    }
    else if(modeType == "javascript"){
      code = previewSection.find("script").html();
      length = code ? code.split(/\r\n|\r|\n/).length : 0;
    }

    if(!code){
      code = "";
    }

    editor.setValue(code);
    var startLine = {line: 0, ch:0};
    var endLine = {line: length+1, ch:0};
    var options = {readOnly:true};
    editor.markText(startLine, endLine, options);
    return editor;
  }

  /*
    TODO: Refactor this code so it looks nicer and easier to reuse.
  */
  function renderBlockWithEditor(block){
    var cm = $(block).find('.CodeMirror');

    if(cm && cm.length > 2){
      var htmlEditor = cm[0].CodeMirror;
      var cssEditor = cm[1].CodeMirror;
      var jsEditor = cm[2].CodeMirror;
      var htmlCode = $(htmlEditor.getValue());

      if(cssEditor){
        var styleCode = "<style>"+ cssEditor.getValue() + "</style>";
        htmlCode.append(styleCode);
      }
      if(jsEditor){
        var scriptCode = "<script>"+ jsEditor.getValue() + "</script>";
        htmlCode.append(scriptCode);
      }

      var previewCode = $(block).find(".snowball-preview").contents().find("body");
      previewCode.html(htmlCode);
    }else{
      console.log("No text editors were detected.");
    }
  }

  /*
  NOTE: domList must be a list of dom's not jquery objects!!!!!
  sample code that works as an argumet:
  var domList = document.getElementsByClassName("snowball-editor-box");
  */
  function setupEditors(domList){
    var listLength = domList.length;
    var editorList = [];
    // TODO: make the code more modular
    // TODO: We don't need a editor list anymore
    // NOTE: both jQuery objects and dom objects are being used
    // CodeMirror must take in dom objects in order to work
    for(var i = 0; i < listLength; i++){
      var dom = domList[i];
      var modeType = dom.getAttribute("data-mode");
      var editor = initEditor(dom, modeType);
      editor = renderEditor(dom, modeType, editor);
    }
  }

})(jQuery);
