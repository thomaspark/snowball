(function($) {

  $("#snowball-main").on("open", ".snowball-block-imageslider", function() {
    var borderradius = $(this).find(".img-border-radius").val() + "%";
    $(this).find(".img-border-radius-output").text(borderradius);
  });

  $(document).ready(function() {
    var blockIndex;

    $("#snowball-main").on("click", ".snowball-block-imageslider .upload-image-button", function() {
      var block = $(this).closest(".snowball-block");
      blockIndex = $(".snowball-block").index(block);
      var index = block.find(".upload-image-button").index($(this));
      tb_show("", "media-upload.php?type=image&TB_iframe=true");

      window.original_send_to_editor = window.send_to_editor;
      window.send_to_editor = function(html){
        var block = $(".snowball-block").eq(blockIndex);
        imgurl = $("img", html).attr("src");
        block.find(".upload-image").eq(index).val(imgurl).trigger("change");
        tb_remove();
        window.send_to_editor = window.original_send_to_editor;
      };

      return false;
    });
  });

})(jQuery);
