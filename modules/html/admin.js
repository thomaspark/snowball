(function($) {

    $("#snowball-main").on("open", ".snowball-block-html", function() {

      var block = $(this);
      var textarea = block.find("textarea");

      window.editor = CodeMirror.fromTextArea(textarea[0], {
          mode: {name: "xml", htmlMode: true},
          lineNumbers: true,
          lineWrapping: true,
          theme: "monokai"
      });

      editor.setSize("100%", "100%");

      editor.on("change", function() {
        editor.save();
        textarea.trigger("change");
      });
    });

})(jQuery);
