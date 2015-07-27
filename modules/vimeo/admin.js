(function($) {
  $("#snowball-main").on("open", ".snowball-block-vimeo", function() {
    var videoUrl = $(this).find(".video-url").val();
    var videoID = parseVideoURL(videoUrl);

    $(this).find(".video-id").val(videoID);
    $(this).trigger("render");
  });

  $("#snowball-main").on("change keyup", ".snowball-block-vimeo .video-url", function() {
    var block = $(this).closest(".snowball-block-vimeo");
    var videoUrl = $(this).val();
    var videoID = parseVideoURL(videoUrl);

    block.find(".video-id").val(videoID);
    block.trigger("render");
  });

  $("#snowball-main").on("change keyup", ".snowball-block-vimeo [data-target='control-color-input']", function() {
    var block = $(this).closest(".snowball-block-vimeo");
    var inputColor = $(this).val();
    var outputColor = "&color=" + inputColor.substring(1);
    $("[data-target='control-color-output']").val(outputColor);
  });

  function parseVideoURL(videoUrl) {
    var re;

    if (videoUrl.indexOf("video") >= 0) {
      re = /vimeo.com.*video\/(\S*)"/;
    } else {
      re = /vimeo.com\/(.*)/;
    }

    var matches = re.exec(videoUrl);

    return matches[1];
  }
})(jQuery);
