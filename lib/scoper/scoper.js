(function($) {
  $("document").ready(function() {
    var styles = $("style[scoped]");
    var csses = "";

    if ((styles.length === 0) || ("scoped" in document.createElement("style"))) {
      return;
    }

    styles.each(function(index) {
      var self = $(this);
      var css = self.html();

      if (css) {
        var id = "scoper-" + index;
        var selector = "#" + id;
        var wrapper = $("<span></span>").attr("id", id);

        self.parent().wrap(wrapper);
        css = css.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, selector + " $1 $2");
        css = "\n" + css;
        csses = csses + css;
      }
    });

    $("<style></style>").html(csses).appendTo("head");
    styles.remove();
  });
})(jQuery);
