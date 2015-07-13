(function($) {

    $("#snowball-main").on("open", ".snowball-block-html", function() {

      var block = $(this);
      var textarea = block.find("textarea");

      var editor = CodeMirror.fromTextArea(textarea[0], {
        mode: "htmlmixed",
        lineNumbers: true,
        lineWrapping: true,
        indentUnit: 2,
        tabSize: 2,
        theme: "monokai"
      });

      editor.setSize("100%", "100%");

      editor.on("change", function() {
        editor.save();
        textarea.trigger("change");
      });
    });

})(jQuery);
