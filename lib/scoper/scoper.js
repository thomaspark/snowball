(function() {
  var styles = document.querySelectorAll("style[scoped]");

  if ((styles.length === 0) || ("scoped" in document.createElement("style"))) {
    return;
  }

  var head = document.head || document.getElementsByTagName('head')[0];
  var newstyle = document.createElement('style');
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
      style.remove();

      newcss = scoper(css, prefix);
      csses = csses + newcss;
    }
  }

  if (newstyle.styleSheet){
    newstyle.styleSheet.cssText = csses;
  } else {
    newstyle.appendChild(document.createTextNode(csses));
  }

  head.appendChild(newstyle);
}());

if(typeof exports !== "undefined") {
    exports.scoper = scoper;
}

function scoper(css, prefix) {
  var re = new RegExp("([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)", "g");
  var match = re.exec(css);
  css = css.replace(re, function(g0, g1, g2) {

    if (g1.match(/^\s*(@media|@keyframes|to|from)/)) {
      return g1 + g2;
    }

    g1 = g1.replace(/^(\s*)/, "$1" + prefix + " ");

    return g1 + g2;
  });
  
  return css;
}
