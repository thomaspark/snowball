(function($) {
  $("#snowball-main").on("open", ".snowball-block-image", function() {
    var borderradius = $(this).find(".img-border-radius").val() + "%";
    $(this).find(".img-border-radius-output").text(borderradius);
  });

  $(document).ready(function() {
    var file_frame;
    var wp_media_post_id = wp.media.model.settings.post.id;
    var set_to_post_id = snowball.id;

    var index;

    $("#snowball-main").on("click", ".snowball-block-image .upload-image-button", function() {
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
        var insertingFrom = file_frame.state().attributes.id;
        var attachment;

        if (insertingFrom === "embed") {
          attachment = file_frame.state().props.attributes.url;
        } else if (insertingFrom === "insert") {
          attachment = file_frame.state().get("selection").first().toJSON().url;
        }

        block.find(".upload-image").val(attachment).trigger("change");
        wp.media.model.settings.post.id = wp_media_post_id;
      });

      file_frame.open();
    });

    $("#snowball-main").on("input change", ".snowball-block-image .img-border-radius", function() {
      var block = $(this).closest(".snowball-block-image");
      var borderradius = $(this).val() + "%";

      block.find(".img-border-radius-output").text(borderradius);
      block.trigger("render");
    });
  });

})(jQuery);
