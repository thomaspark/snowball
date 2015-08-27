(function($) {

  var counter = 0;
  $("#snowball-main").on("open", ".snowball-block-splash", function() {
    var textarea = $(this).find("textarea");
    var id = "snowball-block-splash-textarea-" + counter;
    textarea.attr("id", id);
    counter++;

    quicktags({
      id : id,
      buttons: "strong,em,link,blockquote,del,code,close"
    });

    QTags._buttonsInit();
  });

  $("#snowball-main").on("click", ".snowball-block-splash .quicktags-toolbar .button", function() {
    $(this).closest(".snowball-block").trigger("render");
  });

  $(document).ready(function() {
    var file_frame;
    var wp_media_post_id = wp.media.model.settings.post.id;
    var set_to_post_id = snowball.id;

    var index;

    $("#snowball-main").on("click", ".snowball-block-splash .upload-image-button", function() {
      var block = $(this).closest(".snowball-block");
      index = $(".snowball-block").index(block);

      if (file_frame) {
        file_frame.uploader.uploader.param("post_id", set_to_post_id);
        file_frame.open();
        return;
      } else {
        wp.media.model.settings.post.id = set_to_post_id;
      }

      file_frame = wp.media.frames.file_frame = wp.media({
        title: $(this).data("uploader_title"),
        button: {
          text: $(this).data("uploader_button_text")
        },
        frame: "post",
        multiple: false
      });

      file_frame.on("insert select", function() {
        var block = $(".snowball-block").eq(index);
        var insertingFrom = file_frame.state().attributes.title;
        var attachment;

        if (insertingFrom === "Insert from URL") {
          attachment = file_frame.state().props.attributes.url;
        } else if (insertingFrom === "Insert Media") {
          attachment = file_frame.state().get("selection").first().toJSON().url;
        }

        block.find(".upload-image").val(attachment).trigger("change");
        wp.media.model.settings.post.id = wp_media_post_id;
      });

      file_frame.open();
    });
  });

})(jQuery);
