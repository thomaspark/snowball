(function($) {
  var blockNumber = 0;
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
          if(input){
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
    } else{
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
      .appendTo(".snowball-main")
      .trigger("open");

  };

  $(".snowball-toolbar").on("click", ".button", function() {
    var type = $(this).data("type");
    snowball.addBlock(type);
  });

  $(".snowball-main")
    .on("open", ".snowball-block", function(){
      // render the editor with code whenever a block is created
      setupEditors($(this), blockNumber);
      blockNumber = blockNumber + 1;
      renderBlockWithEditor($(this));
    })
    .on("render", ".snowball-block", function() {
      renderPreview($(this));
      renderBlockWithEditor($(this));
      refreshDataOnEditor($(this));
    })
    .on("mousedown", ".snowball-block", function(e) {
      $(".snowball-main").height($(".snowball-main").height());
    })
    .on("mouseup", ".snowball-block", function(e) {
      $(".snowball-main").height("auto");
    })
    .on("keyup", "input, textarea", debounce(function() {
      var block = $(this).parents(".snowball-block");
      // TODO: should this be made into a function, since this is repeated 3 times?
      renderPreview(block);
      renderBlockWithEditor(block);
      refreshDataOnEditor(block);
    }, 250))
    .on("change", "input, textarea", function() {
      var block = $(this).parents(".snowball-block");
      renderPreview(block);
      renderBlockWithEditor(block);
      refreshDataOnEditor(block);
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
    })
    .on("click", ".snowball-editor-toggle", function(){
      var block = $(this).parents(".snowball-block");
      // toggle the code view
      var snowballCode = block.find(".snowball-code").slideToggle("slow");

      $(block).find(".CodeMirror").each(function(i, e){
        e.CodeMirror.refresh();
      });
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
    TODO: needs more refactoring
  */
  function renderEditor(previewSection, modeType, editor, blockNum){
    // removes the tag and all the code in it.
    function removeTagFromHtml(code, tagname){
      var startIndex = code.indexOf("<" + tagname);
      var endIndex = code.indexOf("</" + tagname + ">");
      var END_STYLE_TAG_LENGTH = tagname.length + 3;
      var tag = code.substring(startIndex, endIndex + END_STYLE_TAG_LENGTH);
      if(startIndex != -1){
        code = code.replace(tag, "");
      }
      return code;
    }
    // search for the index snowball block that is the same as 
    // the block that contains the code below.
    var code = "";
    var length = 0;
    if(modeType == "css"){
      code = $(previewSection).find("style:not([data-type='custom'])").html();
      if(code){
        code = code.replace(/^\s+|\s+$/g, '');
        // add extra 
        code = code + "\n";
        length = code.split(/\r\n|\r|\n/).length;
        code = code + "\n";
      }else{
        code = "";
      }

      // ensures the code will populate the correct custom css code that was saved.
      if((typeof blockNum) !== 'undefined'){
        var customCSS = snowball.savedblocks[blockNum].customCss;
        if(customCSS){
          code = code + customCSS;
        }
      }
    }
    // html doesnt work now so xml syntax is used
    else if(modeType == "xml"){
      code = previewSection;
      code = removeTagFromHtml(code, "style");
      // just in case there are two style tags
      code = removeTagFromHtml(code, "style");
      length = code.split(/\r\n|\r|\n/).length;
    }

    if(!code){
      code = "";
    }
    var nonReadOnlyCode = retrieveNonReadOnlyText(editor);
    if(nonReadOnlyCode){
      code = code + nonReadOnlyCode;
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

    //editor.setValue() will scroll to top, so scroll back to your last cursor position.
    editor.setCursor(scrollPos);
  }

  function retrieveNonReadOnlyText(editor){
    //there should only be one marked text object
    var readOnlyMark = editor.getAllMarks();
    var code = editor.getValue();
    if(readOnlyMark.length){
      var mark = readOnlyMark[0];
//      var firstReadOnlyLine = mark.doc.first;
      var lastReadOnlyLine = mark.lines.length;// + firstReadOnlyLine;
      if(lastReadOnlyLine < 2){
        code = editor.getValue();
      }else{
        var fromLine = {line:lastReadOnlyLine-1, ch:0};
        var toLine = {line:editor.lastLine()+1, ch:0};
        code = editor.getRange(fromLine, toLine);
      }
    }
    return code;
  }

  function renderBlockWithEditor(block){
    var previewCode = $(block).find(".snowball-preview").contents().find("section");
    function updateStyleTag(editor){
      var insertTag = previewCode.find("style[data-type=\"custom\"]");
      if(editor){
        var code = "<style data-type=\"custom\">" + retrieveNonReadOnlyText(editor) + "</style>";
        if(insertTag.length){
          insertTag.html(code);
          alert("insert into existing style tag(this may not work correctly)");
        }else{
          previewCode.append(code);
        }
      }
    }

    var cm = $(block).find('.CodeMirror');
    // this checks if all 3 code mirror textareas exist in the block 
    // and then grabs all 3 of them
    if(cm && cm.length > 1){
      var cssEditor = cm[1].CodeMirror;
      updateStyleTag(cssEditor);
    }else{
      console.log("No text editors were detected.");
    }
  }

  /*
    NOTE: domList must be a list of dom's not jquery objects!
  */
  function setupEditors(block, blockNum){
    var domList = $(block).find(".snowball-editor-box").get();
    var previewCode = $(block).find(".snowball-preview").contents().find("body").html();
    var listLength = domList.length;
    // NOTE: both jQuery objects and dom objects are being used
    // CodeMirror must take in dom objects in order to work
    for(var i = 0; i < listLength; i++){
      var dom = domList[i];
      var modeType = dom.getAttribute("data-mode");
      var editor = initEditor(dom, modeType);
      renderEditor(previewCode, modeType, editor, blockNum);
    }
  }

/* 
  Would this need a flag in order to know if it needs to be used.
*/
  function refreshDataOnEditor(block){
    var cm = $(block).find('.CodeMirror');
    var cssEditor = cm[1].CodeMirror;
    var previewCode = $(block).find(".snowball-preview").contents().find("body").html();

    renderEditor(previewCode, "css", cssEditor);
  }

})(jQuery);
