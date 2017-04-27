(function($) {

  $("#snowball-main").on("open", ".snowball-block-youtube", function() {
    var videoUrl = $(this).find(".video-url").val();
    var videoID = parseVideoURL(videoUrl);

    $(this).find(".video-id").val(videoID);
    $(this).trigger("render");
  });

  $("#snowball-main").on("change keyup", ".snowball-block-youtube .video-url", debounce(function() {
    var block = $(this).closest(".snowball-block-youtube");
    var videoUrl = $(this).val();
    var videoID = parseVideoURL(videoUrl);

    block.find(".video-id").val(videoID);
    block.trigger("render");
  }, 250));

  function parseVideoURL(videoUrl) {
    var re;

    if (videoUrl.indexOf("embed") >= 0) {
      re = /youtube.com.*embed\/(\S*)"/;
    } else {
      re = /youtube.com.*v=(.*)/;
    }

    var matches = re.exec(videoUrl);
    var match = matches && matches[1] ? matches[1] : "124847087";

    return match;
  }
})(jQuery);
