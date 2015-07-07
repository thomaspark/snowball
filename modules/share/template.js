(function($) {
  $(document).ready(function() {

    $("body").on("click", ".snowball-block-share .button", function() {
      var snowball = snowball || window.parent.snowball;
      var button = jQuery(this);
      var width = 500;
      var height = 400;
      var windowLeft = (screen.width/2) - (width/2);
      var windowTop = (screen.height/2) - (height/2);
      var opts = "toolbar=0,status=0,width=" + width + ",height=" + height + ",top=" + windowTop + ",left=" + windowLeft;
      var url;

      if (button.hasClass("facebook")) {
        url = "http://www.facebook.com/sharer.php?u=" + encodeURIComponent(snowball.url);
      } else if (button.hasClass("twitter")) {
        url = "http://twitter.com/share?url=" + encodeURIComponent(snowball.url) + "&text=" + encodeURIComponent(snowball.title);
      } else if (button.hasClass("tumblr")) {
        url = "https://www.tumblr.com/widgets/share/tool?posttype=link&canonicalUrl=" + encodeURIComponent(snowball.url) + "&title=" + encodeURIComponent(snowball.title) + "&content=" + encodeURIComponent(snowball.excerpt);
      } else {
        url = "https://plus.google.com/share?url=" + encodeURIComponent(snowball.url);
      }

      window.open(url, "share", opts);
    });

  });
})(jQuery);
