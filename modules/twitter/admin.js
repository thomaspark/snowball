(function($) {

  $("#snowball-main").on("open", ".snowball-block-twitter", function() {
    var tweetUrl = $(this).find("[data-target='tweet-url']").val().trim();
    var tweetID = parseTweetUrl(tweetUrl);

    $(this).find("[data-target='id']").val(tweetID);
    $(this).trigger("render");
  });

  $("#snowball-main").on("change keyup", ".snowball-block-twitter [data-target='tweet-url']", debounce(function() {
    var block = $(this).closest(".snowball-block-twitter");
    var tweetUrl = $(this).val().trim();
    var tweetID = parseTweetUrl(tweetUrl);

    block.find("[data-target='id']").val(tweetID);
  }, 250));

  $("#snowball-main").on("rendered", ".snowball-block-twitter", function() {
    var block = $(this);
    var iframe = block.find(".snowball-preview");
    var createTweet = iframe[0].contentWindow.createTweet;

    if (createTweet) {
      createTweet(iframe.contents().find(".snowball-block-twitter"));
    }
  });

  function parseTweetUrl(url) {
    var re = /^https?:\/\/twitter.com\/(\w+)\/status(es)?\/(\d+)$/;
    var matches = re.exec(url);

    if (matches && matches[3]) {
      return matches[3];
    } else {
      return "";
    }
  }

})(jQuery);
