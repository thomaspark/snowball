var body = document.getElementsByTagName("body")[0];

// set jquery variable within the iframe's context
if (typeof(jQuery) == "undefined") {
  var jQuery = function (selector) { return parent.jQuery(selector, body); };
  var $ = jQuery;
}

// reset script tags within the iframe's context
$("script").each(function() {
  var script = document.createElement("script");
  var attr = $(this).attr("src");

  if (attr) {
    var src = $(this).attr("src");
    script.setAttribute("src", src);
  } else {
    script.innerHTML = $(this).html();
  }

  body.appendChild(script);
}).remove();

$("a[href]").attr("target", "_blank");
