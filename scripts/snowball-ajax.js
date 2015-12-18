jQuery(document).ready(function($) {
  $("#publish, #save-post").one("click", function(e) {
    e.preventDefault();

    var button = $(this);
    var blocksRetrieved = retrieveBlocks();
    var articleRetrieved = retrieveRenderedPage();

    var blocks_data = {
      "action": "add_blocks",
      "blocks": blocksRetrieved,
      "post_id": ajax_object.post_id,
      "snowball_ajax_nonce": ajax_object.snowball_ajax_nonce
    };

    var article_data = {
      "action": "add_article",
      "article": articleRetrieved,
      "head_html": getCustomCode(),
      "theme_option": getThemeOption(),
      "post_id": ajax_object.post_id,
      "is_preview" : "false",
      "snowball_ajax_nonce": ajax_object.snowball_ajax_nonce
    };

    // adding article to db
    $.post(ajax_object.ajax_url, article_data);

    // adding blocks data to db
    $.post(ajax_object.ajax_url, blocks_data, function() {
      button.trigger("click");
    });
  });

  $("#post-preview").click(function() {
    var articleRetrieved = retrieveRenderedPage();

    var article_data = {
      "action": "add_article",
      "article": articleRetrieved,
      "theme_option": getThemeOption(),
      "post_id": ajax_object.post_id,
      "is_preview" : "true",
      "snowball_ajax_nonce": ajax_object.snowball_ajax_nonce
    };

    // adding article to db
    $.post(ajax_object.ajax_url, article_data);
  });

  function getThemeOption() {
    var theme_option = 1;
    if ($("#theme_option").is(":checked")) {
      theme_option = 0;
    }

    return theme_option;
  }

  function getCustomCode() {
    var customCode = $("#snowball-custom-code").val();
    var editor = $('#snowball-custom-code + .CodeMirror').get(0);

    if (editor) {
      customCode = editor.CodeMirror.getValue();
    }

    return customCode;
  }
  /* 
    This function will traverse through all the html in all the blocks
    and retrieve all the data about the block the user added.
  */
  function retrieveBlocks() {
    var blocks = [];

    $(".snowball-block").each(function() {
      var data = parseBlock($(this));
      blocks.push(data);
    });

    return blocks;
  }

  function retrieveRenderedPage() {
    var html = '';
    jQuery(".snowball-preview").each(function(index, element) {
      var newHTML = jQuery(element).contents().find("body").clone();

      // filter out svg code, which chokes the db
      newHTML.find("svg").remove();

      html = html + "\n" + newHTML.html();
      newHTML.remove();
    });

    return html;
  }
});

function parseBlock(block) {
  var type = block.data("type");
  var selector = "input[type='text'][data-target], input[type='email'][data-target], input[type='range'][data-target], input[type='hidden'][data-target], input[type='radio'][data-target]:checked, input[type='checkbox'][data-target], textarea[data-target], select[data-target]";
  var inputs = block.find(".snowball-tinker form").first().find(selector);
  var data = {};

  if (inputs) {
    data.blockType = type;

    inputs.each(function(index, element) {
      var dataTarget = jQuery(element).attr("data-target");
      var inputValue = jQuery(element).val();

      if (jQuery(element).attr("type") == "checkbox") {
        inputValue = jQuery(element).is(":checked") ? true : false;
      }

      data[dataTarget] = inputValue;
    });

    data.customCss = retrieveCustomCss(block);
  }

  return data;
}

// this is the same function on
// retrieveNonReadOnlyText except it has block as an argument.
function retrieveCustomCss(block) {
  var cm = block.find(".snowball-code .CodeMirror");
  var code;

  if (cm.length === 0) {
    code = block.find("textarea[data-mode='css']").html();
  } else {
    var editor = cm[1].CodeMirror;
    var readOnlyMark = editor.getAllMarks();
    code = editor.getValue();

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
  }

  return code;
}
