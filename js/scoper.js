/* global exports */

function init() {
  var style = document.createElement("style");
  style.appendChild(document.createTextNode(""));
  document.head.appendChild(style);
  style.sheet.insertRule("body { visibility: hidden; }", 0);
}

function scoper(css, prefix) {
  var re = new RegExp("([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)", "g");
  css = css.replace(re, function(g0, g1, g2) {

    if (g1.match(/^\s*(@media|@keyframes|to|from)/)) {
      return g1 + g2;
    }

    g1 = g1.replace(/^(\s*)/, "$1" + prefix + " ");

    return g1 + g2;
  });
  
  return css;
}

function process() {
  var styles = document.querySelectorAll("style[scoped]");

  if (styles.length === 0) {
    document.getElementsByTagName("body")[0].style.visibility = "visible";
    return;
  }

  var head = document.head || document.getElementsByTagName("head")[0];
  var newstyle = document.createElement("style");
  var csses = "";

  for (var i = 0; i < styles.length; i++) {
    var style = styles[i];
    var css = style.innerHTML;

    if (css) {
      var id = "scoper-" + i;
      var prefix = "#" + id;

      var wrapper = document.createElement("span");
      wrapper.id = id;

      var parent = style.parentNode;
      var grandparent = parent.parentNode;

      grandparent.replaceChild(wrapper, parent);
      wrapper.appendChild(parent);
      style.parentNode.removeChild(style);

      csses = csses + scoper(css, prefix);
    }
  }

  if (newstyle.styleSheet){
    newstyle.styleSheet.cssText = csses;
  } else {
    newstyle.appendChild(document.createTextNode(csses));
  }

  head.appendChild(newstyle);
  document.getElementsByTagName("body")[0].style.visibility = "visible";
}

(function() {
  "use strict";

  if ("scoped" in document.createElement("style")) {
    return;
  }
  
  init();

  if (document.readyState === "complete" || document.readyState === "loaded") {
    process();
  } else {
    document.addEventListener("DOMContentLoaded", process);
  }
}());

if (typeof exports !== "undefined") {
  exports.scoper = scoper;
}
