(function($) {
    var counter = 0;
    QTags.addButton("eg_hr", "hr", "<hr />", "", "h", "Horizontal rule line", 70);

    $("#snowball-main").on("open", ".snowball-block-text", function() {
      var textarea = $(this).find("textarea");
      var id = "snowball-block-text-textarea-" + counter;
      textarea.attr("id", id);
      counter++;

      quicktags({
        id : id,
        buttons: "strong,em,link,blockquote,del,code,ul,ol,li,code,close"
      });

      QTags._buttonsInit();
    });

    $("#snowball-main").on("click", ".snowball-block-text .quicktags-toolbar .button", function() {
      $(this).closest(".snowball-block").trigger("render");
    });

})(jQuery);
