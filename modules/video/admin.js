(function($) {

  $("#snowball-main").on("open", ".snowball-block-video", function() {
    var videoUrl = $(this).find(".video-url").val();
    var videoID = parseVideoURL(videoUrl);

    $(this).find(".video-id").val(videoID);
    $(this).trigger("render");
  });

  $("#snowball-main").on("change keyup", ".snowball-block-video .video-url", function() {
    var block = $(this).parents(".snowball-block-video");
    var videoUrl = $(this).val();
    var videoID = parseVideoURL(videoUrl);

    block.find(".video-id").val(videoID);
    block.trigger("render");
  });

  function parseVideoURL(videoUrl) {
    var re = /youtube.com.*v=(.*)/;
    var matches = re.exec(videoUrl);
    
    return matches[1];
  }
})(jQuery);
