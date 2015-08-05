(function($) {

  $(document).ready(function() {
    updateContents();
  });

  $("#snowball-main").on("rendered", ".snowball-block", function() {

    if ($(this).hasClass("snowball-block-contents")) {
      return;
    }

    updateContents();
  });

  $("#snowball-main").on("open", ".snowball-block-contents", function() {
    updateContents($(this));
  });

  function updateContents(block) {
    var html = buildContents();

    if (typeof block == "undefined") {
      $(".snowball-block-contents").each(function() {
        var block = $(this);
        $(this).find(".html").val(html);
        block.trigger("render");
      });
    } else {
      block.find(".html").val(html);
      block.trigger("render");
    }
  }

  function buildContents() {
    var contents = [];
    var html = "<ul>";

    $(".snowball-block").each(function() {
      var title = $(this).find(".snowball-title").text();
      var match = "[id]";
      var matches = $(this).find(".snowball-preview").contents().find(match);

      if (title !== "Contents") {
        matches.each(function() {
          var elem = {
            id: $(this).attr("id"),
            text: $(this).text()
          };

          contents.push(elem);
        });
      }
    });

    contents.forEach(function(elem, index) {
      var content = "<li><a href='#" + elem.id + "'>" + elem.text + "</a></li>";
      html = html + content; 
    });

    html = html + "</ul>";

    return html;
  }

})(jQuery);
