(function($) {

  $(document).ready(function() {
    var lightboxes = $(".lightbox");

    lightboxes.each(function() {
      var src = $(this).children().attr("src");
      $(this).attr("href", src);
    });

    lightboxes.fluidbox();

  });

})(jQuery);
