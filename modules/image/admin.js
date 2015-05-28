(function($) {
  var index;

  $(".upload-image-button").click(function() {
    index = $(".upload-image-button").index($(this));
    tb_show("", "media-upload.php?type=image&TB_iframe=true");
    return false;
  });

  window.send_to_editor = function(html) {
    imgurl = $("img", html).attr("src");
    $(".upload-image").eq(index).val(imgurl).trigger("change");
    tb_remove();
  };
})(jQuery);
