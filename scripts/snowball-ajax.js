jQuery(document).ready(function($) {
  $("#publish, #save-post").click(function() {
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
      "post_id": ajax_object.post_id,
      "snowball_ajax_nonce": ajax_object.snowball_ajax_nonce
    };

    // adding article to db
    $.post(ajax_object.ajax_url, article_data);

    // adding blocks data to db
    $.post(ajax_object.ajax_url, blocks_data);
  });

  /* 
    This function will traverse through all the html in all the blocks
    and retrieve all the data about the block the user added.
  */
  function retrieveBlocks() {
    var blocks = [];

    $("#snowball-main form").each(parseBlock);

    function parseBlock(orderNumber, blockForm) {
      var type = $(blockForm).parents(".snowball-block").data("name");
      var selector = "input[type='text'][data-target], input[type='email'][data-target], input[type='range'][data-target], input[type='hidden'][data-target], input[type='radio'][data-target]:checked, input[type='checkbox'][data-target], textarea[data-target]";
      var inputs = $(blockForm).find(selector);

      if (inputs) {
        var block = {
          blockType: type,
          orderNumber: orderNumber
        };
        // element is a tag with an attribute called data-target
        inputs.each(function(index, element) {
          var dataTarget = $(element).attr("data-target");
          var inputValue = $(element).val();

          if ($(element).attr("type") == "checkbox") {
            inputValue = $(element).is(":checked") ? true : false;
          }

          block[dataTarget] = inputValue;
        });

        var snowballBlock = $(blockForm).closest('.snowball-block');
        block.customCss = retrieveCustomCss(snowballBlock);
        blocks.push(block);
      }
    }

    return blocks;
  }

  function retrieveRenderedPage() {
    var html = '';
    jQuery(".snowball-preview").each(function(index, element) {
      html = html + "\n" + jQuery(element).contents().find("body").html();
    });

    return html;
  }

  // this is the same function on
  // retrieveNonReadOnlyText except it has block as an argument.
  function retrieveCustomCss(block) {
    var cm = $(block).find(".snowball-code .CodeMirror");
    var code;

    if (cm.length === 0) {
      code = $(block).find("textarea[data-mode='css']").html();
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
});
