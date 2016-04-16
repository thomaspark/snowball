(function($) {

  $(document).ready(function() {
    var lightboxes = $(".lightbox");

    lightboxes.each(function() {
      var src = $(this).children().attr("src");
      $(this).attr("href", src);
    });

    lightboxes.fluidbox();

    $("a[href*=\\#]:not([href=\\#])").click(function() {
      if (location.pathname.replace(/^\//,"") == this.pathname.replace(/^\//,"") && location.hostname == this.hostname) {
        var target = $(this.hash);
        target = target.length ? target : $("[name=" + this.hash.slice(1) + "]");
        if (target.length) {
          $("html, body").animate({
            scrollTop: target.offset().top
          }, 1000);
          return false;
        }
      }
    });
  });

})(jQuery);
