(function($) {
  function getTrackId(url) {
    var re;

    if (url && url.indexOf("api.soundcloud.com/tracks") >= 0) {
      re = /api.soundcloud.com\/tracks\/(\d+&)/;
      var matches = re.exec(url);
      if (matches[1]) {
        return matches[1];
      }
    }

    return "";
  }

  function getSoundCloudUrl(id, options) {
    var soundCloudUrl = "https://w.soundcloud.com/player/?url=https://api.soundcloud.com/tracks/";
    soundCloudUrl = soundCloudUrl + id + "&show_reposts=false&auto_play=false";

    for (var key in options) {
      if (options.hasOwnProperty(key)) {
        soundCloudUrl = soundCloudUrl + "&" + key + "=" + options[key];
      }
    }
    return soundCloudUrl;
  }

  $("#snowball-main").on("open", ".snowball-block-soundcloud", function() {
    var block = $(this).closest(".snowball-block-soundcloud");
    var soundCloudLink = $(block).find("input[data-target=embed-link]").val();
    var embedIframe = $(block)
                        .find(".snowball-preview").contents()
                        .find(".embed-iframe");
    var show_user = $(block).find("input[data-target=show-user]").prop("checked");
    var show_comments = $(block).find("input[data-target=show-comments]").prop("checked");
    var visual = $(block).find("input[data-target=visual]").prop("checked");
    var soundcloud_options = {
      "show_user": show_user,
      "show_comments": show_comments,
      "visual": visual
    };
    var trackId = getTrackId(soundCloudLink);
    var trackUrl = getSoundCloudUrl(trackId, soundcloud_options);
    $(block).find(".track-url").val(trackUrl);

    block.trigger("render");
  });

  $("#snowball-main").on("change keyup", ".snowball-block-soundcloud", debounce(function() {
    var block = $(this).closest(".snowball-block-soundcloud");
    var soundCloudLink = $(block).find("input[data-target=embed-link]").val();
    var embedIframe = $(block)
                        .find(".snowball-preview").contents()
                        .find(".embed-iframe");
    var show_user = $(block).find("input[data-target=show-user]").prop("checked");
    var show_comments = $(block).find("input[data-target=show-comments]").prop("checked");
    var visual = $(block).find("input[data-target=visual]").prop("checked");
    var soundcloud_options = {
      "show_user": show_user,
      "show_comments": show_comments,
      "visual": visual
    };
    var trackId = getTrackId(soundCloudLink);
    var trackUrl = getSoundCloudUrl(trackId, soundcloud_options);

    $(block).find(".track-url").val(trackUrl);
    block.trigger("render");
  }, 250));
})(jQuery);
