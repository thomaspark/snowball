jQuery("document").ready(function() {
  var styles = jQuery("style[scoped]");
  var is_scoped = (function(s) {
      s.setAttribute("scoped", "true");
      return !!s.scoped;
  })(document.createElement("style"));

  if (styles.length && !is_scoped) {
    var style = jQuery("<style></style>").appendTo("head");
    var csses = "";

    styles.each(function(index, element){
      var self = jQuery(this);
      var css = self.html();

      if (css) {
        var id = "superscope-" + index;
        var selector = "#" + id;
        var wrapper = jQuery("<span></span>").attr("id", id);
        var parent = self.parent();

        parent.wrap(wrapper);

        css = css.replace(/([,|\}][\s$]*)([\.#]?-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g, "$1" + selector + " $2");
        css = "\n" + selector + " " + css;
        csses = csses + css;
      }
    });

    style.html(csses);
    styles.remove();
  }
});
