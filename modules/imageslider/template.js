(function($) {

  $(document).ready(function() {
    $(".snowball-block-imageslider .left").css("width", "50%");
  });

  $(document).on("mousemove", ".snowball-block-imageslider .wrapper", function(e) {
    var block = $(this).closest(".snowball-block");
    var left = block.find(".left")[0];
    var right = block.find("img")[0];
    var labelLeft = block.find(".label-left");
    var labelRight = block.find(".label-right");
    var rect = right.getBoundingClientRect();
    var position = ((e.pageX - rect.left) / rect.width)*100;

    if (position <= 100) {
      left.style.width = position + "%";

      if (position <= 20) {
        labelLeft.hide();
      } else {
        labelLeft.show();
      }

      if (position >= 80) {
        labelRight.hide();
      } else {
        labelRight.show();
      }
    }
  });

})(jQuery);
