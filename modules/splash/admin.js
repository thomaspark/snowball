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
    var index;

    $("#snowball-main").on("click", ".snowball-block-splash .upload-image-button", function() {
      var block = $(this).closest(".snowball-block");
      index = $(".snowball-block").index(block);
      tb_show("", "media-upload.php?type=image&TB_iframe=true");

      window.original_send_to_editor = window.send_to_editor;
      window.send_to_editor = function(html){
        var block = $(".snowball-block").eq(index);
        imgurl = $("img", html).attr("src");
        block.find(".upload-image").val(imgurl).trigger("change");
        tb_remove();
        window.send_to_editor = window.original_send_to_editor;
      };

      return false;
    });
  });

})(jQuery);
