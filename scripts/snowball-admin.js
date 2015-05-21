(function($) {

  $(".snowball-toolbar").on("click", ".button", function() {
    var type = $(this).data("type");
    var blockCode = snowball.blocks[type];
    var name = $(blockCode).data("name");

    var block =  $("<div class='snowball-block'>" +
                      "<div class='snowball-gui'>" +
                          "<div class='snowball-tinker'>" +
                            "<div>" +
                              "<div class='snowball-title'></div>" +
                              "<div class='snowball-delete'>&times;</div>" +
                            "</div>" +
                          "</div>" +
                          "<iframe class='snowball-preview'></iframe>" +
                        "</div>" +
                        "<div class='snowball-code'>" +
                          "<div class='snowball-html'></div>" +
                          "<div class='snowball-css'></div>" +
                          "<div class='snowball-js'></div>" +
                        "</div>" +
                      "</div>");

    block
      .addClass("snowball-block-" + type).data("type", type)
      .find(".snowball-title").text(name).end()
      .find(".snowball-tinker").append(blockCode).end();

    init(block);

    block.appendTo(".snowball-main");
  });

  $(".snowball-main")
    .on("keyup", "input, textarea", debounce(function() {
      var block = $(this).parents(".snowball-block");
      renderPreview(block);
    }, 250))
    .on("change", "input, textarea", function() {
      var block = $(this).parents(".snowball-block");
      renderPreview(block);
    })
    .on("click", ".snowball-delete", function() {
      var block = $(this).parents(".snowball-block");
      confirmDelete(block);
    })
    .sortable({
      "cursor": "move"
    });

  $(window).resize(debounce(function() {
    zoomPreview();
  }, 250));

  $("#collapse-menu").click(debounce(function() {
    zoomPreview();
  }, 250));

  function init(block) {
    block.find(".snowball-preview").load(function() {
      renderPreview(block);
    });

    block.find(".wp-color-picker").wpColorPicker({
      change: debounce(function (event) {
        $(this).trigger("change");
      }, 250)
    });
  }

  function confirmDelete(block) {
    var result = confirm("Are you sure you want to delete this block?");
    if (result) {
      block.remove();
    }
  }

  function renderPreview(block) {
    var type = block.data("type");
    var fields = block.find("input[data-target], textarea[data-target]");
    var preview = block.find(".snowball-preview");
    var html = snowball.templates[type];

    var path = snowball.path;
    var css = path + "/styles/snowball.css";
    var js = path + "/scripts/snowball.js";
    var cssPreview = path + "/styles/snowball-preview.css";
    var stylesheet = $("<link/>").attr({"rel": "stylesheet", "href": css});
    var stylesheetPreview = $("<link/>").attr({"rel": "stylesheet", "href": cssPreview});
    var script = $("<script/>").attr("src", js);

    fields.each(function(index, element) {
      var target = $(this).data("target");
      var value = $(this).val();

      if ($(this).is("textarea")) {
        // For textareas, replace \n with <br> and \n\n with <p>
        value = value.replace(/\n{2,}/g,'</p><p>').replace(/\n/g,'<br />').replace(/^(.+?)$/,'<p>$1</p>');
      }

      html = html.replace("{{" + target + "}}", value);
    });

    preview.contents()
      .find("head").append(stylesheet, stylesheetPreview, script).end()
      .find("body").html(html);

    zoomPreview(block);
  }

  function zoomPreview(block) {
    var width = $(".snowball-preview").first().width();
    var zoom = width / 600;

    if (block) {
      block.find(".snowball-preview").contents().find(".snowball-block").css("zoom", zoom);
    } else {
      $(".snowball-preview").contents().find(".snowball-block").css("zoom", zoom);
    }
  }

  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

})(jQuery);
