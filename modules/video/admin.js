(function($) {

  $(".snowball-main").on("open", ".snowball-block-video", function() {
    var videoUrl = $(this).find(".video-url").val();
    var videoID = parseVideoURL(videoUrl);

    $(this).find(".video-id").val(videoID);
    $(this).find(".video-id").trigger("change");
  });

  $(".snowball-main").on("change keyup", ".snowball-block-video .video-url", function() {
    var block = $(this).parents(".snowball-block-video");
    var videoUrl = $(this).val();
    var videoID = parseVideoURL(videoUrl);

    block.find(".video-id").val(videoID);
    block.find(".video-id").trigger("change");
  });

  $(".snowball-main").on("click", ".snowball-block-video .full-width-checkbox", function() {
    var block = $(this).parents(".snowball-block-video");
    var checkedStatus = $(this).prop("checked");

    if (checkedStatus == false) {
      block.find(".custom-style").val("");
    } else {
      block.find(".custom-style").val("width:100%; height:55.6vw;");
    }

    block.find(".video-url").trigger("keyup");
  });

  function parseVideoURL(videoUrl) {
    var re = /youtube.com.*v=(.*)/;
    var matches = re.exec(videoUrl);
    
    return matches[1];
  }
})(jQuery);
