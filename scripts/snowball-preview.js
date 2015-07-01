// // set jquery variable within the iframe's context
if (typeof jQuery == "undefined") {
  var body = document.getElementsByTagName("body")[0];
  var jQuery = function (selector) { return parent.jQuery(selector, body); };
  var $ = jQuery;
}

(function($) {
  var scripts = $("script");

  scripts.each(function() {
    var src = $(this).attr("src");

    if (src === undefined) {
      evalInContext($(this).html(), document);
    }
  });

  $("a[href]", document).attr("target", "_blank");

})(jQuery);

function evalInContext(js, context) {
  return function() { return eval(js); }.call(context);
}
