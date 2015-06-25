if (typeof(jQuery) == "undefined"){
  var body = document.getElementsByTagName("body")[0];
  var jQuery = function (selector) { return parent.jQuery(selector, body); };
  var $ = jQuery;
}
