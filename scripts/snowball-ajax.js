jQuery(document).ready(function($) {
  // We can also pass the url value separately from ajaxurl for front end AJAX implementations
  $("#publish").click(function() {
    var blocksRetrieved = retrieveBlocks();
    var articleRetrieved = retrieveRenderedPage();

    var blocks_data = {
      "action": "add_blocks",   // this is needed to know which callback to use
      "blocks": blocksRetrieved,
      "post_id": ajax_object.post_id
    };

    var article_data = {
      "action": "add_article",
      "article": articleRetrieved,
      "post_id": ajax_object.post_id
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
    // element is a form that represents a block
    // parseBlock is a function
    $(".snowball-main form").each(parseBlock);

    /*
      parseBlock will retrieve the data-target attributes that
      are contained in the input tags
    */
    function parseBlock(orderNumber, blockForm) {
      var type = $(blockForm).parents(".snowball-block").data("name");
      var selector = "input[type='text'][data-target], input[type='range'][data-target], input[type='hidden'][data-target], input[type='radio'][data-target]:checked, input[type='checkbox'][data-target], textarea[data-target]";
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

        // save the css
        var snowballBlock = $(blockForm).closest('.snowball-block');
        block.customCss = retrieveCustomCss(snowballBlock);
        blocks.push(block);
      }
    }

    return blocks;
  }


  // retrieves the html of the blocks in the preview of the blocks
  // and save the html to the article table
  // this function returns the html
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
    //the css code editor
    var editor = $(block).find('.CodeMirror')[1].CodeMirror;
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
});
