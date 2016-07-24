(function($) {

  if($(".snowball-block-twitter").length > 0) {
    var url = "https://platform.twitter.com/widgets.js";

    $.getScript(url, function() {
      $(".snowball-block-twitter").each(function() {
        createTweet($(this));
      }); 
    });
  }

})(jQuery);

function createTweet(block) {
  var tweet = block.find(".tweet").empty();
  var id = tweet.attr("data-id");

  if (id) {
    var theme = tweet.attr("data-theme");
    var linkColor = tweet.attr("data-linkColor");
    var cards = tweet.attr("data-cards") ? tweet.attr("data-cards") : "show";
    var conversation = tweet.attr("data-conversation") ? tweet.attr("data-conversation") : "show";
 
    twttr.widgets.createTweet(id, tweet[0], 
      {
        theme: theme,
        linkColor: linkColor,
        cards: cards,
        conversation: conversation,
        align: "center"
      });
  }
}
